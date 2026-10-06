import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { receipts, lineItems, activityLog } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generateNextDocumentNumber } from "../utils/document-numbering";
import { triggerEventNotification } from "./emailNotifications";
import { workflowTriggerEngine } from "../workflows/triggerEngine";
import { createFeatureRestrictedProcedure, createRoleRestrictedProcedure } from "../middleware/enhancedRbac";
import { scheduleDocumentAutomation } from "../services/jobScheduler";
import { paymentModeSchema } from "../utils/payment-modes";

// Permission-restricted procedure instances
const viewProcedure = createFeatureRestrictedProcedure("accounting:receipts:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:receipts:create");
const deleteProcedure = createRoleRestrictedProcedure(["super_admin", "admin"]);

async function generateNextReceiptNumber(db: any): Promise<string> {
  return generateNextDocumentNumber(db, "receipt");
}

export const receiptsRouter = router({
  list: viewProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        const limit = Math.min(input?.limit || 50, 1000); // Cap at 1000
        const offset = input?.offset || 0;
        const orgId = ctx.user.organizationId;
        const result = orgId
          ? await db
              .select({
                id: receipts.id,
                receiptNumber: receipts.receiptNumber,
                clientId: receipts.clientId,
                paymentId: receipts.paymentId,
                amount: receipts.amount,
                subtotal: receipts.subtotal,
                taxAmount: receipts.taxAmount,
                discountAmount: receipts.discountAmount,
                paymentMethod: receipts.paymentMethod,
                receiptDate: receipts.receiptDate,
                status: receipts.status,
                notes: receipts.notes,
                createdBy: receipts.createdBy,
                createdAt: receipts.createdAt,
              })
              .from(receipts)
              .where(eq(receipts.organizationId, orgId))
              .orderBy(desc(receipts.createdAt))
              .limit(limit)
              .offset(offset)
          : await db
              .select({
                id: receipts.id,
                receiptNumber: receipts.receiptNumber,
                clientId: receipts.clientId,
                paymentId: receipts.paymentId,
                amount: receipts.amount,
                subtotal: receipts.subtotal,
                taxAmount: receipts.taxAmount,
                discountAmount: receipts.discountAmount,
                paymentMethod: receipts.paymentMethod,
                receiptDate: receipts.receiptDate,
                status: receipts.status,
                notes: receipts.notes,
                createdBy: receipts.createdBy,
                createdAt: receipts.createdAt,
              })
              .from(receipts)
              .orderBy(desc(receipts.createdAt))
              .limit(limit)
              .offset(offset);
        return result || [];
      } catch (error) {
        console.error("Error fetching receipts:", error);
        return [];
      }
    }),

  getNextReceiptNumber: viewProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const nextNumber = await generateNextReceiptNumber(db);
      return { receiptNumber: nextNumber };
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(receipts.id, input), eq(receipts.organizationId, orgId)) : eq(receipts.id, input);
      const result = await db
        .select({
          id: receipts.id,
          receiptNumber: receipts.receiptNumber,
          clientId: receipts.clientId,
          paymentId: receipts.paymentId,
          amount: receipts.amount,
          subtotal: receipts.subtotal,
          taxAmount: receipts.taxAmount,
          discountAmount: receipts.discountAmount,
          paymentMethod: receipts.paymentMethod,
          receiptDate: receipts.receiptDate,
          status: receipts.status,
          notes: receipts.notes,
          createdBy: receipts.createdBy,
          createdAt: receipts.createdAt,
        })
        .from(receipts)
        .where(where)
        .limit(1);
      return result[0] || null;
    }),

  byClient: viewProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(receipts.clientId, input.clientId), eq(receipts.organizationId, orgId)) : eq(receipts.clientId, input.clientId);
      const result = await db
        .select({
          id: receipts.id,
          receiptNumber: receipts.receiptNumber,
          clientId: receipts.clientId,
          paymentId: receipts.paymentId,
          amount: receipts.amount,
          paymentMethod: receipts.paymentMethod,
          receiptDate: receipts.receiptDate,
          notes: receipts.notes,
          createdBy: receipts.createdBy,
          createdAt: receipts.createdAt,
        })
        .from(receipts)
        .where(where);
      return result;
    }),

  getWithItems: viewProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(receipts.id, input), eq(receipts.organizationId, orgId)) : eq(receipts.id, input);
      const receiptResult = await db
        .select({
          id: receipts.id,
          receiptNumber: receipts.receiptNumber,
          clientId: receipts.clientId,
          paymentId: receipts.paymentId,
          amount: receipts.amount,
          paymentMethod: receipts.paymentMethod,
          receiptDate: receipts.receiptDate,
          notes: receipts.notes,
          createdBy: receipts.createdBy,
          createdAt: receipts.createdAt,
        })
        .from(receipts)
        .where(where)
        .limit(1);
      if (!receiptResult.length) return null;
      
      const items = await db.select().from(lineItems).where(
        and(
          eq(lineItems.documentId, input),
          eq(lineItems.documentType, 'receipt')
        )
      );
      
      return {
        ...receiptResult[0],
        lineItems: items
      };
    }),

  create: createProcedure
    .input(z.object({
      clientId: z.string(),
      paymentId: z.string().optional(),
      amount: z.number(),
      subtotal: z.number(),
      taxAmount: z.number().default(0),
      discountAmount: z.number().default(0),
      paymentMethod: paymentModeSchema,
      receiptDate: z.coerce.date(),
      notes: z.string().optional(),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        taxRate: z.number().optional(),
        total: z.number(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const receiptNumber = await generateNextReceiptNumber(db);

      const id = uuidv4();
      const { lineItems: items, ...receiptData } = input;
      
      // Convert dates to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
      const convertToMySQLDateTime = (date?: Date | string | null): string => {
        if (!date) return new Date().toISOString().replace('T', ' ').substring(0, 19);
        if (typeof date === 'string') return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
        if (date instanceof Date) return date.toISOString().replace('T', ' ').substring(0, 19);
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
      };

      const formattedDate = typeof receiptData.receiptDate === 'string'
        ? new Date(receiptData.receiptDate)
        : receiptData.receiptDate instanceof Date
          ? receiptData.receiptDate
          : new Date();
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      await db.insert(receipts).values({
        id,
        organizationId: ctx.user.organizationId ?? null,
        receiptNumber,
        ...receiptData,
        receiptDate: formattedDate,
        createdBy: ctx.user.id,
        createdAt: now,
      } as any);
      await scheduleDocumentAutomation({ documentType: "receipt", documentId: id, organizationId: ctx.user.organizationId, createdBy: ctx.user.id, createdAt: now }).catch((error) => console.error("Failed to schedule receipt automation:", error));

      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await db.insert(lineItems).values({
            id: uuidv4(),
            documentId: id,
            documentType: 'receipt',
            description: item.description,
            quantity: item.quantity,
            rate: item.unitPrice,
            amount: item.total,
            taxRate: item.taxRate || 0,
            lineNumber: i + 1,
            createdBy: ctx.user.id,
          } as any);
        }
      }

      try {
        await triggerEventNotification({
          userId: ctx.user.id,
          eventType: "receipt_created",
          recipientEmail: "client@example.com",
          recipientName: "Client",
          subject: `Receipt ${receiptNumber} Created`,
          htmlContent: `
            <h2>Receipt Created</h2>
            <p>Receipt <strong>${receiptNumber}</strong> has been created for amount <strong>Ksh ${(receiptData.amount / 100).toLocaleString("en-KE")}</strong>.</p>
            ${receiptData.paymentId ? `<p><strong>Payment ID:</strong> ${receiptData.paymentId}</p>` : ""}
            <p><a href=\"/receipts/${id}\">View Receipt</a></p>
          `,
          entityType: "receipt",
          entityId: id,
          actionUrl: `/receipts/${id}`,
        });
      } catch (err) {
        console.error("Failed to send receipt created notification:", err);
      }

      try {
        await workflowTriggerEngine.trigger({
          triggerType: "receipt_created",
          entityType: "receipt",
          entityId: id,
          data: {
            receiptId: id,
            paymentId: receiptData.paymentId,
            amount: receiptData.amount,
            clientId: receiptData.clientId,
          },
          userId: ctx.user.id,
        });
      } catch (err) {
        console.error("Workflow trigger (receipt_created) failed:", err);
      }

      return { id };
    }),

  update: createProcedure
    .input(z.object({
      id: z.string(),
      receiptNumber: z.string().optional(),
      clientId: z.string().optional(),
      paymentId: z.string().optional(),
      amount: z.number().optional(),
      subtotal: z.number().optional(),
      taxAmount: z.number().optional(),
      discountAmount: z.number().optional(),
      paymentMethod: paymentModeSchema.optional(),
      status: z.enum(["draft", "issued", "void"]).optional(),
      receiptDate: z.coerce.date().optional(),
      notes: z.string().optional(),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        taxRate: z.number().optional(),
        total: z.number(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, lineItems: items, ...data } = input;
      
      // Verify org ownership
      const orgId = ctx.user.organizationId;
      if (orgId) {
        const existing = await db.select({ orgId: receipts.organizationId }).from(receipts).where(eq(receipts.id, id)).limit(1);
        if (!existing.length || existing[0].orgId !== orgId) throw new Error("Receipt not found");
      }

      // Convert dates to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
      const convertToMySQLDateTime = (date?: Date | string | null): string | undefined => {
        if (!date) return undefined;
        if (typeof date === 'string') return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
        if (date instanceof Date) return date.toISOString().replace('T', ' ').substring(0, 19);
        return undefined;
      };

      const updateData: any = { ...data };
      if (data.receiptDate) {
        updateData.receiptDate = typeof data.receiptDate === 'string'
          ? new Date(data.receiptDate)
          : data.receiptDate instanceof Date
            ? data.receiptDate
            : undefined;
      }

      await db.update(receipts).set(updateData).where(eq(receipts.id, id));

      if (items !== undefined) {
        await db.delete(lineItems).where(
          and(
            eq(lineItems.documentId, id),
            eq(lineItems.documentType, 'receipt')
          )
        );

        if (items && items.length > 0) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await db.insert(lineItems).values({
              id: uuidv4(),
              documentId: id,
              documentType: 'receipt',
              description: item.description,
              quantity: item.quantity,
              rate: item.unitPrice,
              amount: item.total,
              taxRate: item.taxRate || 0,
              lineNumber: i + 1,
              createdBy: ctx.user.id,
            } as any);
          }
        }
      }

      return { success: true };
    }),

  generateHTML: viewProcedure
    .input(z.object({
      id: z.string(),
      templateId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { renderReceiptTemplate } = await import('../utils/template-renderer');
        const result = await renderReceiptTemplate(input.id, ctx.user.organizationId, input.templateId);
        
        if (!result) {
          throw new Error('Failed to generate receipt HTML - no template found');
        }

        // Log the preview activity
        const db = await getDb();
        if (db) {
          const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
          await db.insert(activityLog).values({
            id: uuidv4(),
            userId: ctx.user.id,
            action: "receipt_previewed",
            entityType: "receipt",
            entityId: input.id,
            description: `Previewed receipt HTML`,
            createdAt: now,
          });
        }

        return {
          success: true,
          html: result.html,
          title: result.title,
        };
      } catch (error) {
        throw new Error(`Failed to generate receipt HTML: ${error}`);
      }
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify org ownership
      const orgId = ctx.user.organizationId;
      if (orgId) {
        const existing = await db.select({ orgId: receipts.organizationId }).from(receipts).where(eq(receipts.id, input)).limit(1);
        if (!existing.length || existing[0].orgId !== orgId) throw new Error("Receipt not found");
      }

      // Delete associated line items first
      await db.delete(lineItems).where(
        and(
          eq(lineItems.documentId, input),
          eq(lineItems.documentType, 'receipt')
        )
      );

      await db.delete(receipts).where(eq(receipts.id, input));
      return { success: true };
    }),
});
