import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb } from "../db";
import { eq, and, desc, gte, lte, inArray } from "drizzle-orm";
import { purchaseOrders, purchaseOrderItems, goodsReceiptNotes } from "../../drizzle/schema-extended";
import { users } from "../../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { scheduleDocumentAutomation } from "../services/jobScheduler";
import { generateNextDocumentNumber } from "../utils/document-numbering";
import { queueEmail } from "./emailQueue";
import { renderNotificationTemplate } from "../services/notificationRenderer";
import { PURCHASING_EMAIL_TEMPLATE_DEFAULTS } from "../../client/src/lib/emailTemplateDesign";

const purchasingTeamRoles = ["procurement_manager", "accountant", "admin", "super_admin"] as const;

export async function notifyPurchasingTeam(input: {
    organizationId: string;
    templateId: string;
    poId: string;
    poNumber: string;
    supplierName: string;
    total: number;
    userId: string;
    extra?: Record<string, string>;
  }) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");
    const team = await database.select({
      id: users.id,
      email: users.email,
      name: users.name,
    }).from(users).where(and(
      eq(users.organizationId, input.organizationId),
      inArray(users.role, [...purchasingTeamRoles] as any),
    ));
    for (const recipient of team) {
      if (!recipient.email) continue;
      const context = {
        organizationId: input.organizationId,
        recipientName: recipient.name || recipient.email,
        recipientEmail: recipient.email,
        po_number: input.poNumber,
        vendor_name: input.supplierName,
        po_total: `Ksh ${Number(input.total).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
        ...input.extra,
      };
      const rendered = await renderNotificationTemplate(input.templateId, context, {
        subject: PURCHASING_EMAIL_TEMPLATE_DEFAULTS.find((template) => template.id === input.templateId)?.subject
          || `Purchase Order ${input.poNumber}`,
        html: PURCHASING_EMAIL_TEMPLATE_DEFAULTS.find((template) => template.id === input.templateId)?.body
          || `<p>Hello {recipient_name},</p><p>Purchase order <strong>{po_number}</strong> for {vendor_name}, total {po_total}, has been updated.</p><p>Regards,<br>{company_name}</p>`,
      });
      const queued = await queueEmail({
        organizationId: input.organizationId,
        recipientEmail: recipient.email,
        recipientName: recipient.name || undefined,
        subject: rendered.subject,
        htmlContent: rendered.html,
        textContent: rendered.text,
        eventType: input.templateId,
        entityType: "purchaseOrder",
        entityId: input.poId,
        userId: input.userId,
      });
      if (!queued.success) console.error(`[PURCHASE ORDER EMAIL] Could not queue ${input.templateId} for ${recipient.email}: ${queued.error}`);
    }
  } catch (error) {
    console.error(`[PURCHASE ORDER EMAIL] Notification failed for ${input.poNumber}:`, error);
  }
}

/**
 * Purchase Orders Router
 * Handles purchase order lifecycle with supplier linking and invoice matching
 */

const viewProcedure = createFeatureRestrictedProcedure("procurement:purchaseOrders:view");
const createProcedure = createFeatureRestrictedProcedure("procurement:purchaseOrders:create");
const approveProcedure = createFeatureRestrictedProcedure("procurement:purchaseOrders:approve");
const receiveProcedure = createFeatureRestrictedProcedure("procurement:purchaseOrders:receive");

export const purchaseOrdersRouter = router({
  list: viewProcedure
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      status: z.enum(["draft", "approved", "received", "partially_received", "cancelled"]).optional(),
      supplierId: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const orgId = ctx.user.organizationId;
        const conditions = [];
        
        if (orgId) conditions.push(eq(purchaseOrders.organizationId, orgId));
        if (input?.status) conditions.push(eq(purchaseOrders.status, input.status));
        if (input?.supplierId) conditions.push(eq(purchaseOrders.supplierId, input.supplierId));

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        return await db.select().from(purchaseOrders)
          .where(where)
          .orderBy(desc(purchaseOrders.createdAt))
          .limit(input?.limit || 50)
          .offset(input?.offset || 0);
      } catch (error) {
        console.error("Error listing purchase orders:", error);
        return [];
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const orgId = ctx.user.organizationId;
        const where = orgId
          ? and(eq(purchaseOrders.id, input), eq(purchaseOrders.organizationId, orgId))
          : eq(purchaseOrders.id, input);

        const result = await db.select().from(purchaseOrders).where(where).limit(1);
        if (!result.length) return null;

        const po = result[0];
        const items = await db.select().from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, input));

        return { ...po, items };
      } catch (error) {
        console.error("Error fetching purchase order:", error);
        return null;
      }
    }),

  create: createProcedure
    .input(z.object({
      supplierId: z.string(),
      supplierName: z.string(),
      poDate: z.string(),
      deliveryDate: z.string(),
      items: z.array(z.object({
        description: z.string(),
        quantity: z.number().positive(),
        rate: z.number().positive(),
        amount: z.number().nonnegative(),
      })).min(1),
      subtotal: z.number().nonnegative(),
      taxAmount: z.number().nonnegative().optional(),
      total: z.number().nonnegative(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        const id = uuidv4();
        const now = new Date();
        const poNumber = await generateNextDocumentNumber(database, "purchase_order");
        if (!ctx.user.organizationId) throw new Error("Organization context required");

        await database.insert(purchaseOrders).values({
          id,
          organizationId: ctx.user.organizationId,
          poNumber,
          supplierId: input.supplierId,
          supplierName: input.supplierName,
          poDate: new Date(input.poDate),
          deliveryDate: new Date(input.deliveryDate),
          subtotal: input.subtotal,
          taxAmount: input.taxAmount || 0,
          total: input.total,
          status: "draft",
          notes: input.notes || null,
          createdBy: ctx.user.id,
          createdAt: now,
          updatedAt: now,
        });
        await scheduleDocumentAutomation({
          documentType: "purchase_order",
          documentId: id,
          organizationId: ctx.user.organizationId,
          createdBy: ctx.user.id,
          createdAt: now,
        }).catch((error) => console.error("Failed to schedule purchase order automation:", error));

        // Insert line items
        for (const item of input.items) {
          await database.insert(purchaseOrderItems).values({
            id: uuidv4(),
            purchaseOrderId: id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            lineNumber: input.items.indexOf(item) + 1,
            createdBy: ctx.user.id,
            createdAt: now,
          });
        }

        await db.logActivity({
          userId: ctx.user.id,
          action: "purchaseOrder_created",
          entityType: "purchaseOrder",
          entityId: id,
          description: `Purchase order ${poNumber} created for ${input.supplierName}. Total: Ksh ${input.total}`,
        });

        await notifyPurchasingTeam({
          organizationId: ctx.user.organizationId,
          templateId: "purchase-order-created-team",
          poId: id,
          poNumber,
          supplierName: input.supplierName,
          total: input.total,
          userId: ctx.user.id,
          extra: { approval_status: "Draft - awaiting review" },
        });

        return { id, poNumber };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create purchase order: ${error.message}`,
        });
      }
    }),

  approve: approveProcedure
    .input(z.string())
    .mutation(async ({ input: poId, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        const result = await database.select().from(purchaseOrders)
          .where(and(eq(purchaseOrders.id, poId), eq(purchaseOrders.organizationId, ctx.user.organizationId || ""))).limit(1);
        
        if (!result.length) throw new Error("Purchase order not found");

        const po = result[0];
        const now = new Date();

        await database.update(purchaseOrders).set({
          status: "approved",
          approvedBy: ctx.user.id,
          approvedAt: now,
          updatedAt: now,
        }).where(eq(purchaseOrders.id, poId));

        await db.logActivity({
          userId: ctx.user.id,
          action: "purchaseOrder_approved",
          entityType: "purchaseOrder",
          entityId: poId,
          description: `Purchase order ${po.poNumber} approved`,
        });

        await notifyPurchasingTeam({
          organizationId: po.organizationId,
          templateId: "purchase-order-approved-team",
          poId: po.id,
          poNumber: po.poNumber,
          supplierName: po.supplierName,
          total: Number(po.total),
          userId: ctx.user.id,
          extra: { approved_by: ctx.user.name || ctx.user.email || "An authorized approver" },
        });

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to approve purchase order: ${error.message}`,
        });
      }
    }),

  // Receive goods
  receiveGoods: receiveProcedure
    .input(z.object({
      poId: z.string(),
      receivedDate: z.string(),
      receivedItems: z.array(z.object({
        itemId: z.string(),
        quantityReceived: z.number().positive(),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        const result = await database.select().from(purchaseOrders)
          .where(and(eq(purchaseOrders.id, input.poId), eq(purchaseOrders.organizationId, ctx.user.organizationId || ""))).limit(1);
        
        if (!result.length) throw new Error("Purchase order not found");

        const po = result[0];
        const now = new Date();
        const grno = `GRN-${new Date().getFullYear()}-${String(Math.random() * 100000).padStart(6, '0')}`;

        // Create Goods Receipt Note
        const grnId = uuidv4();
        await database.insert(goodsReceiptNotes).values({
          id: grnId,
          organizationId: ctx.user.organizationId || "system",
          grno,
          purchaseOrderId: input.poId,
          receivedDate: new Date(input.receivedDate),
          totalQuantity: input.receivedItems.reduce((sum: number, item: any) => sum + item.quantityReceived, 0),
          notes: input.notes || null,
          createdBy: ctx.user.id,
          createdAt: now,
        });

        // Update PO status if all items received
        let allReceived = true;
        const items = await database.select().from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, input.poId));

        for (const item of items) {
          const received = input.receivedItems.find(r => r.itemId === item.id)?.quantityReceived || 0;
          if (received < item.quantity) {
            allReceived = false;
            break;
          }
        }

        if (allReceived) {
          await database.update(purchaseOrders).set({
            status: "received",
            receivedAt: now,
            updatedAt: now,
          }).where(eq(purchaseOrders.id, input.poId));
        } else {
          await database.update(purchaseOrders).set({
            status: "partially_received",
            updatedAt: now,
          }).where(eq(purchaseOrders.id, input.poId));
        }

        await db.logActivity({
          userId: ctx.user.id,
          action: "purchaseOrder_goodsReceived",
          entityType: "purchaseOrder",
          entityId: input.poId,
          description: `Goods received for PO ${po.poNumber}. GRN: ${grno}`,
        });

        await notifyPurchasingTeam({
          organizationId: po.organizationId,
          templateId: "purchase-order-received-team",
          poId: po.id,
          poNumber: po.poNumber,
          supplierName: po.supplierName,
          total: Number(po.total),
          userId: ctx.user.id,
          extra: { received_date: new Date(input.receivedDate).toLocaleDateString() },
        });

        return { success: true, grnId, grno };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to receive goods: ${error.message}`,
        });
      }
    }),
});
