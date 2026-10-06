import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { lineItems } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";

// Define typed procedures
const createProcedure = createFeatureRestrictedProcedure("lineItems:create");

export const lineItemsRouter = router({
  // Get line items for a specific document
  getByDocumentId: createFeatureRestrictedProcedure("lineItems:view")
    .input(z.object({
      documentId: z.string(),
      documentType: z.enum(['invoice', 'estimate', 'receipt']),
    }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];

      return await database.select().from(lineItems).where(
        and(
          eq(lineItems.documentId, input.documentId),
          eq(lineItems.documentType, input.documentType)
        )
      );
    }),

  // Get single line item
  getById: createFeatureRestrictedProcedure("lineItems:view")
    .input(z.string())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const result = await database.select().from(lineItems).where(eq(lineItems.id, input)).limit(1);
      return result[0] || null;
    }),

  // Create line item
  create: createFeatureRestrictedProcedure("lineItems:create")
    .input(z.object({
      documentId: z.string(),
      documentType: z.enum(['invoice', 'estimate', 'receipt']),
      description: z.string().min(1).max(500),
      quantity: z.number().positive(),
      rate: z.number().positive(),
      amount: z.number().nonnegative().optional(),
      productId: z.string().optional(),
      serviceId: z.string().optional(),
      taxRate: z.number().nonnegative().optional(),
      taxAmount: z.number().nonnegative().optional(),
      lineNumber: z.number().nonnegative().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const id = uuidv4();
      const amount = input.amount || (input.quantity * input.rate);
      const taxAmount = input.taxAmount || (amount * (input.taxRate || 0) / 100);
      const lineNumber = input.lineNumber || 1;

      await database.insert(lineItems).values({
        id,
        documentId: input.documentId,
        documentType: input.documentType,
        description: input.description,
        quantity: input.quantity,
        rate: input.rate,
        amount,
        productId: input.productId,
        serviceId: input.serviceId,
        taxRate: input.taxRate || 0,
        taxAmount,
        lineNumber,
        createdBy: ctx.user.id,
      } as any);

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "line_item_created",
        entityType: "lineItem",
        entityId: id,
        description: `Created line item: ${input.description}`,
      });

      return { id };
    }),

  // Update line item
  update: createFeatureRestrictedProcedure("lineItems:edit")
    .input(z.object({
      id: z.string(),
      description: z.string().min(1).max(500).optional(),
      quantity: z.number().positive().optional(),
      rate: z.number().positive().optional(),
      amount: z.number().nonnegative().optional(),
      taxRate: z.number().nonnegative().optional(),
      taxAmount: z.number().nonnegative().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const lineItem = await database.select().from(lineItems).where(eq(lineItems.id, input.id)).limit(1);
      if (!lineItem.length) throw new Error("Line item not found");

      const updateData: any = {};
      if (input.description) updateData.description = input.description;
      if (input.quantity) updateData.quantity = input.quantity;
      if (input.rate) updateData.rate = input.rate;
      
      // Recalculate amount if quantity or rate changed
      if (input.quantity || input.rate) {
        const qty = input.quantity || lineItem[0].quantity;
        const rate = input.rate || lineItem[0].rate;
        updateData.amount = qty * rate;
      }
      
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.taxRate !== undefined) updateData.taxRate = input.taxRate;
      if (input.taxAmount !== undefined) updateData.taxAmount = input.taxAmount;

      await database.update(lineItems).set(updateData).where(eq(lineItems.id, input.id));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "line_item_updated",
        entityType: "lineItem",
        entityId: input.id,
        description: `Updated line item: ${lineItem[0].description}`,
      });

      return { success: true };
    }),

  // Delete line item
  delete: createFeatureRestrictedProcedure("lineItems:delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const lineItem = await database.select().from(lineItems).where(eq(lineItems.id, input)).limit(1);
      if (!lineItem.length) throw new Error("Line item not found");

      await database.delete(lineItems).where(eq(lineItems.id, input));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "line_item_deleted",
        entityType: "lineItem",
        entityId: input,
        description: `Deleted line item: ${lineItem[0].description}`,
      });

      return { success: true };
    }),

  // Get line items summary for a document
  getSummary: createFeatureRestrictedProcedure("lineItems:view")
    .input(z.object({
      documentId: z.string(),
      documentType: z.enum(['invoice', 'estimate', 'receipt']),
    }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return {
        subtotal: 0,
        totalTax: 0,
        total: 0,
        itemCount: 0,
      };

      const items = await database.select().from(lineItems).where(
        and(
          eq(lineItems.documentId, input.documentId),
          eq(lineItems.documentType, input.documentType)
        )
      );

      const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalTax = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      const total = subtotal + totalTax;

      return {
        subtotal,
        totalTax,
        total,
        itemCount: items.length,
      };
    }),

  // Bulk create line items
  bulkCreate: createProcedure
    .input(z.object({
      documentId: z.string(),
      documentType: z.enum(['invoice', 'estimate', 'receipt']),
      items: z.array(z.object({
        description: z.string().min(1).max(500),
        quantity: z.number().positive(),
        rate: z.number().positive(),
        taxRate: z.number().nonnegative().optional(),
      })).min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const results = {
        created: 0,
        failed: 0,
        errors: [] as string[],
        ids: [] as string[],
      };

      for (let i = 0; i < input.items.length; i++) {
        try {
          const item = input.items[i];
          const id = uuidv4();
          const amount = item.quantity * item.rate;
          const taxAmount = amount * (item.taxRate || 0) / 100;

          await database.insert(lineItems).values({
            id,
            documentId: input.documentId,
            documentType: input.documentType,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount,
            taxRate: item.taxRate || 0,
            taxAmount,
            lineNumber: i + 1,
            createdBy: ctx.user.id,
          } as any);

          results.created++;
          results.ids.push(id);

          // Log activity
          await db.logActivity({
            userId: ctx.user.id,
            action: "line_item_created",
            entityType: "lineItem",
            entityId: id,
            description: `Bulk created line item: ${item.description}`,
          });
        } catch (error) {
          results.failed++;
          results.errors.push(`Error creating line item ${i + 1}: ${error}`);
        }
      }

      return results;
    }),

  // Bulk delete line items
  bulkDelete: createFeatureRestrictedProcedure("lineItems:delete")
    .input(z.array(z.string()).min(1))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const results = {
        deleted: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const itemId of input) {
        try {
          const lineItem = await database.select().from(lineItems).where(eq(lineItems.id, itemId)).limit(1);
          if (!lineItem.length) {
            results.failed++;
            results.errors.push(`Line item ${itemId} not found`);
            continue;
          }

          await database.delete(lineItems).where(eq(lineItems.id, itemId));
          results.deleted++;

          // Log activity
          await db.logActivity({
            userId: ctx.user.id,
            action: "line_item_deleted",
            entityType: "lineItem",
            entityId: itemId,
            description: `Bulk deleted line item: ${lineItem[0].description}`,
          });
        } catch (error) {
          results.failed++;
          results.errors.push(`Error deleting ${itemId}: ${error}`);
        }
      }

      return results;
    }),
});
