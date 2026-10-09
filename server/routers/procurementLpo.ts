import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb, logActivity } from "../db";
import { suppliers, lpoLineItems } from "../../drizzle/schema-extended";
import { products, lpos } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { generateNextDocumentNumber } from "../utils/document-numbering";
import { notifyPurchasingTeam } from "./purchaseOrders";

// Feature-based procedures
const readProcedure = protectedProcedure;
const createProcedure = createFeatureRestrictedProcedure("lpo:create");
const updateProcedure = createFeatureRestrictedProcedure("lpo:edit");
const deleteProcedure = createFeatureRestrictedProcedure("lpo:delete");

export async function generateAvailableLPONumber(
  database: any,
  generateNumber: (db: any, documentType: "lpo") => Promise<string> = generateNextDocumentNumber,
): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = await generateNumber(database, "lpo");
    const existing = await database.select({ id: lpos.id })
      .from(lpos)
      .where(eq(lpos.lpoNumber, candidate))
      .limit(1);
    if (existing.length === 0) return candidate;
  }
  throw new Error("Could not allocate a unique LPO number after 20 attempts");
}

export const lpoRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      status: z.enum(['draft', 'approved', 'sent', 'partially_received', 'received', 'cancelled', 'closed']).optional(),
      supplierId: z.string().optional(),
      searchTerm: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) return [];

        let query: any = database.select().from(lpos);

        if (input?.status) {
          query = query.where(eq(lpos.status as any, input.status as any));
        }
        
        if (input?.supplierId) {
          query = query.where(eq(lpos.supplierId, input.supplierId));
        }

        return await query.limit(input?.limit || 100).offset(input?.offset || 0);
      } catch (error) {
        console.error("Error fetching LPO list:", error);
        return [];
      }
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const result = await database.select().from(lpos).where(eq(lpos.id, input)).limit(1);
      return result[0] || null;
    }),

  getWithLineItems: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      // NOTE: lpoLineItems table doesn't exist in schema
      const database = await getDb();
      if (!database) return null;
      
      const lpoData = await database.select().from(lpos).where(eq(lpos.id, input)).limit(1);
      if (!lpoData.length) return null;
      
      // lpoLineItems table doesn't exist - return LPO data without line items
      return {
        ...lpoData[0],
        lineItems: [],
      };
    }),

  create: createProcedure
    .input(z.object({
      supplierId: z.string().optional(),
      supplierName: z.string().optional(),
      departmentId: z.string().optional(),
      issueDate: z.string(),
      expectedDeliveryDate: z.string().optional(),
      description: z.string().optional(),
      paymentTerms: z.string().optional(),
      deliveryAddress: z.string().optional(),
      lineItems: z.array(z.object({
        productId: z.string().optional(),
        description: z.string(),
        quantity: z.number().positive(),
        unit: z.string().default('pcs'),
        unitPrice: z.number().positive(),
        taxRate: z.number().nonnegative().optional().default(0),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const resolvedSupplierId = (input.supplierId && input.supplierId.trim()) || (input.supplierName && input.supplierName.trim()) || "custom-supplier";
      const lpoNumber = await generateAvailableLPONumber(database);

      const lpoId = uuidv4();
      
      // Calculate totals from line items
      let totalAmount = 0;
      let totalTaxAmount = 0;
      
      input.lineItems.forEach(item => {
        const lineAmount = item.quantity * item.unitPrice;
        const taxAmount = lineAmount * (item.taxRate || 0) / 100;
        totalAmount += lineAmount;
        totalTaxAmount += taxAmount;
      });

      const netAmount = totalAmount + totalTaxAmount;
      const discountAmount = 0; // Can be set later if needed

      // Create LPO header
      await database.insert(lpos).values({
        id: lpoId,
        organizationId: ctx.user.organizationId || "default",
        lpoNumber,
        supplierId: resolvedSupplierId,
        departmentId: input.departmentId,
        issueDate: new Date(input.issueDate),
        expectedDeliveryDate: input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : undefined,
        description: input.description,
        totalAmount: Math.round(totalAmount),
        taxAmount: Math.round(totalTaxAmount),
        discountAmount,
        netAmount: Math.round(netAmount),
        paymentTerms: input.paymentTerms,
        status: 'draft',
        createdBy: ctx.user.id,
      } as any);

      // Create line items
      for (const item of input.lineItems) {
        const lineTotal = Math.round(item.quantity * item.unitPrice);
        await database.insert(lpoLineItems).values({
          id: uuidv4(),
          lpoId,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: Math.round(item.unitPrice),
          taxRate: item.taxRate || 0,
          lineTotal,
        } as any);
      }

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "lpo_created",
        entityType: "lpo",
        entityId: lpoId,
        description: `Created LPO: ${lpoNumber}`,
      });

      const [supplier] = await database.select({ companyName: suppliers.companyName })
        .from(suppliers).where(eq(suppliers.id, resolvedSupplierId)).limit(1);
      await notifyPurchasingTeam({
        organizationId: ctx.user.organizationId || "default",
        templateId: "purchase-order-created-team",
        poId: lpoId,
        poNumber: lpoNumber,
        supplierName: input.supplierName || supplier?.companyName || resolvedSupplierId,
        total: netAmount,
        userId: ctx.user.id,
        extra: { approval_status: "Draft - awaiting review" },
      });

      return { id: lpoId };
    }),

  update: updateProcedure
    .input(z.object({
      id: z.string(),
      lpoNumber: z.string().optional(),
      expectedDeliveryDate: z.string().optional(),
      description: z.string().optional(),
      paymentTerms: z.string().optional(),
      deliveryAddress: z.string().optional(),
      status: z.enum(['draft', 'approved', 'sent', 'partially_received', 'received', 'cancelled', 'closed']).optional(),
      approvedBy: z.string().optional(),
      approvalDate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const lpoData = await database.select().from(lpos)
        .where(and(eq(lpos.id, input.id), eq(lpos.organizationId, ctx.user.organizationId || "default")))
        .limit(1);
      if (!lpoData.length) throw new Error("LPO not found");

      const updateData: any = {};
      if (input.lpoNumber) updateData.lpoNumber = input.lpoNumber;
      if (input.expectedDeliveryDate !== undefined) updateData.expectedDeliveryDate = input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : null;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.paymentTerms !== undefined) updateData.paymentTerms = input.paymentTerms;
      if (input.deliveryAddress !== undefined) updateData.deliveryAddress = input.deliveryAddress;
      if (input.status) updateData.status = input.status;
      if (input.approvedBy) updateData.approvedBy = input.approvedBy;
      if (input.approvalDate) updateData.approvalDate = new Date(input.approvalDate);

      await database.update(lpos).set(updateData).where(and(eq(lpos.id, input.id), eq(lpos.organizationId, ctx.user.organizationId || "default")));

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "lpo_updated",
        entityType: "lpo",
        entityId: input.id,
        description: `Updated LPO: ${lpoData[0].lpoNumber}`,
      });

      if (input.status && input.status !== lpoData[0].status) {
        const templateId = input.status === "received"
          ? "purchase-order-received-team"
          : ["approved", "issued", "sent"].includes(input.status)
            ? "purchase-order-approved-team"
            : undefined;
        if (templateId) {
          const [supplier] = await database.select({ companyName: suppliers.companyName })
            .from(suppliers).where(eq(suppliers.id, lpoData[0].supplierId)).limit(1);
          await notifyPurchasingTeam({
            organizationId: lpoData[0].organizationId,
            templateId,
            poId: lpoData[0].id,
            poNumber: lpoData[0].lpoNumber,
            supplierName: supplier?.companyName || lpoData[0].supplierId,
            total: Number(lpoData[0].totalAmount),
            userId: ctx.user.id,
            extra: templateId === "purchase-order-received-team"
              ? { received_date: new Date().toLocaleDateString() }
              : { approved_by: ctx.user.name || ctx.user.email || "An authorized approver" },
          });
        }
      }

      return { success: true };
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const lpoData = await database.select().from(lpos)
        .where(eq(lpos.id, input))
        .limit(1);
      if (!lpoData.length) throw new Error("LPO not found");

      // Delete line items first
      await database.delete(lpoLineItems).where(eq(lpoLineItems.lpoId, input));
      
      // Delete LPO
      await database.delete(lpos).where(eq(lpos.id, input));

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "lpo_deleted",
        entityType: "lpo",
        entityId: input,
        description: `Deleted LPO: ${lpoData[0].lpoNumber}`,
      });

      return { success: true };
    }),

  getByStatus: readProcedure
    .input(z.enum(['draft', 'issued', 'acknowledged', 'partially_received', 'received', 'cancelled']))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];

      return await database.select().from(lpos)
        .where(eq(lpos.status, input));
    }),

  getBySupplier: readProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];

      return await database.select().from(lpos)
        .where(eq(lpos.supplierId, input));
    }),

  getSummary: readProcedure
    .query(async () => {
      const database = await getDb();
      if (!database) return {
        totalLPOs: 0,
        draftLPOs: 0,
        approvedLPOs: 0,
        totalValue: 0,
      };

      const allLPOs = await database.select().from(lpos);

      const draftCount = allLPOs.filter(l => l.status === 'draft').length;
      const approvedCount = allLPOs.filter(l => l.status === 'approved' || l.status === 'sent').length;
      const totalValue = allLPOs.reduce((sum, l) => sum + (l.netAmount || 0), 0);

      return {
        totalLPOs: allLPOs.length,
        draftLPOs: draftCount,
        approvedLPOs: approvedCount,
        totalValue,
      };
    }),

  updateLineItem: updateProcedure
    .input(z.object({
      id: z.string(),
      description: z.string().optional(),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      unitPrice: z.number().optional(),
      taxRate: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const lineItem = await database.select().from(lpoLineItems)
        .where(eq(lpoLineItems.id, input.id))
        .limit(1);
      if (!lineItem.length) throw new Error("Line item not found");

      const updateData: any = {};
      if (input.description) updateData.description = input.description;
      if (input.quantity !== undefined) updateData.quantity = input.quantity;
      if (input.unit) updateData.unit = input.unit;
      if (input.unitPrice !== undefined) updateData.unitPrice = Math.round(input.unitPrice);
      if (input.taxRate !== undefined) updateData.taxRate = input.taxRate;

      if (input.quantity && input.unitPrice) {
        updateData.lineTotal = Math.round(input.quantity * input.unitPrice);
      }

      await database.update(lpoLineItems).set(updateData).where(eq(lpoLineItems.id, input.id));

      return { success: true };
    }),

  deleteLineItem: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const lineItem = await database.select().from(lpoLineItems)
        .where(eq(lpoLineItems.id, input))
        .limit(1);
      if (!lineItem.length) throw new Error("Line item not found");

      await database.delete(lpoLineItems).where(eq(lpoLineItems.id, input));

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "lpo_line_item_deleted",
        entityType: "lpo",
        entityId: input,
        description: `Deleted LPO line item`,
      });

      return { success: true };
    }),
});
