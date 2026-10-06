import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb, logActivity } from "../db";
import { deliveryNotes } from "../../drizzle/schema";
import { deliveryNoteLineItems } from "../../drizzle/schema-extended";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { scheduleDocumentAutomation } from "../services/jobScheduler";
import { generateNextDocumentNumber } from "../utils/document-numbering";

// Feature-based procedures
const readProcedure = protectedProcedure;
const createProcedure = createFeatureRestrictedProcedure("procurementLpo:create");
const updateProcedure = createFeatureRestrictedProcedure("procurementLpo:edit");
const deleteProcedure = createFeatureRestrictedProcedure("procurementLpo:delete");

export const deliveryNotesRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      status: z.enum(['draft', 'in_transit', 'delivered', 'partially_delivered', 'failed', 'returned']).optional(),
      lpoId: z.string().optional(),
      supplierId: z.string().optional(),
      searchTerm: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) return [];

        const noteTable: any = deliveryNotes;
        let query: any = database.select().from(noteTable);

        if (input?.status) {
          query = query.where(eq(noteTable.status as any, input.status as any));
        }

        if (input?.lpoId) {
          query = query.where(eq(noteTable.orderId as any, input.lpoId as any));
        }

        if (input?.supplierId) {
          query = query.where(eq(noteTable.supplier as any, input.supplierId as any));
        }

        return await query.limit(input?.limit || 100).offset(input?.offset || 0);
      } catch (error) {
        console.error("Error fetching delivery notes list:", error);
        return [];
      }
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const result = await database.select().from(deliveryNotes).where(eq(deliveryNotes.id, input)).limit(1);
      return result[0] || null;
    }),

  getWithLineItems: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      
      const noteData = await database.select().from(deliveryNotes).where(eq(deliveryNotes.id, input)).limit(1);
      if (!noteData.length) return null;
      
      const lineItems = await database.select().from(deliveryNoteLineItems).where(eq(deliveryNoteLineItems.deliveryNoteId, input));
      
      return {
        ...noteData[0],
        lineItems,
      };
    }),

  create: createProcedure
    .input(z.object({
      lpoId: z.string(),
      supplierId: z.string().optional(),
      supplierName: z.string().optional(),
      deliveryDate: z.string(),
      driverId: z.string().optional(),
      vehicleNumber: z.string().optional(),
      receivedBy: z.string().optional(),
      condition: z.enum(['good', 'damaged', 'partial', 'incomplete']).optional().default('good'),
      notes: z.string().optional(),
      lineItems: z.array(z.object({
        productId: z.string().optional(),
        description: z.string(),
        expectedQuantity: z.number().positive(),
        receivedQuantity: z.number().nonnegative(),
        damagedQuantity: z.number().nonnegative().optional().default(0),
        unit: z.string().default('pcs'),
        unitPrice: z.number().optional(),
        batchNumber: z.string().optional(),
        expiryDate: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const resolvedSupplierId = (input.supplierId && input.supplierId.trim()) || (input.supplierName && input.supplierName.trim()) || "custom-supplier";

      const deliveryNoteNumber = await generateNextDocumentNumber(database, "delivery_note");
      const noteTable: any = deliveryNotes;
      // Check for duplicate delivery note number
      const existing = await database.select().from(noteTable)
        .where(eq(noteTable.dnNo as any, deliveryNoteNumber as any))
        .limit(1);
      if (existing.length > 0) {
        throw new Error(`Delivery note with number '${deliveryNoteNumber}' already exists`);
      }

      const noteId = uuidv4();
      
      // Calculate totals
      let totalExpecting = 0;
      let totalReceived = 0;
      let totalDamaged = 0;
      
      input.lineItems.forEach(item => {
        totalExpecting += item.expectedQuantity;
        totalReceived += item.receivedQuantity;
        totalDamaged += (item.damagedQuantity || 0);
      });

      // Create delivery note header
      await database.insert(noteTable).values({
        id: noteId,
        deliveryNoteNumber,
        lpoId: input.lpoId,
        supplierId: resolvedSupplierId,
        deliveryDate: new Date(input.deliveryDate),
        driverId: input.driverId,
        vehicleNumber: input.vehicleNumber,
        deliveryStatus: 'draft',
        receivedBy: input.receivedBy,
        condition: input.condition,
        totalItems: totalExpecting,
        receivedItems: totalReceived,
        damagedItems: totalDamaged,
        notes: input.notes,
        createdBy: ctx.user.id,
      } as any);
      await scheduleDocumentAutomation({
        documentType: "delivery_note",
        documentId: noteId,
        createdBy: ctx.user.id,
      }).catch((error) => console.error("Failed to schedule delivery note automation:", error));

      // Create line items
      for (const item of input.lineItems) {
        await database.insert(deliveryNoteLineItems).values({
          id: uuidv4(),
          deliveryNoteId: noteId,
          productId: item.productId,
          description: item.description,
          expectedQuantity: item.expectedQuantity,
          receivedQuantity: item.receivedQuantity,
          damagedQuantity: item.damagedQuantity || 0,
          unit: item.unit,
          unitPrice: item.unitPrice,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        } as any);
      }

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "delivery_note_created",
        entityType: "delivery_note",
        entityId: noteId,
        description: `Created delivery note: ${deliveryNoteNumber}`,
      });

      return { id: noteId };
    }),

  update: updateProcedure
    .input(z.object({
      id: z.string(),
      deliveryNoteNumber: z.string().optional(),
      driverId: z.string().optional(),
      vehicleNumber: z.string().optional(),
      deliveryStatus: z.enum(['draft', 'in_transit', 'delivered', 'partially_delivered', 'failed', 'returned']).optional(),
      receivedBy: z.string().optional(),
      receivedDate: z.string().optional(),
      condition: z.enum(['good', 'damaged', 'partial', 'incomplete']).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const note = await database.select().from(deliveryNotes)
        .where(eq(deliveryNotes.id, input.id))
        .limit(1);
      if (!note.length) throw new Error("Delivery note not found");

      const updateData: any = {};
      if (input.deliveryNoteNumber) updateData.deliveryNoteNumber = input.deliveryNoteNumber;
      if (input.driverId !== undefined) updateData.driverId = input.driverId;
      if (input.vehicleNumber !== undefined) updateData.vehicleNumber = input.vehicleNumber;
      if (input.deliveryStatus) updateData.deliveryStatus = input.deliveryStatus;
      if (input.receivedBy !== undefined) updateData.receivedBy = input.receivedBy;
      if (input.receivedDate) updateData.receivedDate = new Date(input.receivedDate);
      if (input.condition) updateData.condition = input.condition;
      if (input.notes !== undefined) updateData.notes = input.notes;

      await database.update(deliveryNotes).set(updateData).where(eq(deliveryNotes.id, input.id));

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "delivery_note_updated",
        entityType: "delivery_note",
        entityId: input.id,
        description: `Updated delivery note: ${note[0].deliveryNoteNumber}`,
      });

      return { success: true };
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const note = await database.select().from(deliveryNotes)
        .where(eq(deliveryNotes.id, input))
        .limit(1);
      if (!note.length) throw new Error("Delivery note not found");

      // Delete line items first
      await database.delete(deliveryNoteLineItems).where(eq(deliveryNoteLineItems.deliveryNoteId, input));
      
      // Delete delivery note
      await database.delete(deliveryNotes).where(eq(deliveryNotes.id, input));

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "delivery_note_deleted",
        entityType: "delivery_note",
        entityId: input,
        description: `Deleted delivery note: ${note[0].deliveryNoteNumber}`,
      });

      return { success: true };
    }),

  getByStatus: readProcedure
    .input(z.enum(['pending', 'partial', 'delivered', 'cancelled']))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];

      return await database.select().from(deliveryNotes)
        .where(eq(deliveryNotes.status, input as any));
    }),

  getByLPO: readProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];

      return await database.select().from(deliveryNotes)
        .where(eq(deliveryNotes.orderId, input as any));
    }),

  getSummary: readProcedure
    .query(async () => {
      const database = await getDb();
      if (!database) return {
        totalDeliveries: 0,
        deliveredCount: 0,
        pendingCount: 0,
        problemCount: 0,
      };

      const allNotes = await database.select().from(deliveryNotes);

      const deliveredCount = allNotes.filter(d => d.status === 'delivered').length;
      const pendingCount = allNotes.filter(d => ['pending', 'partial'].includes(d.status)).length;
      const problemCount = allNotes.filter(d => ['cancelled'].includes(d.status)).length;

      return {
        totalDeliveries: allNotes.length,
        deliveredCount,
        pendingCount,
        problemCount,
      };
    }),

  updateLineItem: updateProcedure
    .input(z.object({
      id: z.string(),
      receivedQuantity: z.number().optional(),
      damagedQuantity: z.number().optional(),
      batchNumber: z.string().optional(),
      expiryDate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const lineItem = await database.select().from(deliveryNoteLineItems)
        .where(eq(deliveryNoteLineItems.id, input.id))
        .limit(1);
      if (!lineItem.length) throw new Error("Line item not found");

      const updateData: any = {};
      if (input.receivedQuantity !== undefined) updateData.receivedQuantity = input.receivedQuantity;
      if (input.damagedQuantity !== undefined) updateData.damagedQuantity = input.damagedQuantity;
      if (input.batchNumber !== undefined) updateData.batchNumber = input.batchNumber;
      if (input.expiryDate !== undefined) updateData.expiryDate = input.expiryDate ? new Date(input.expiryDate) : null;

      await database.update(deliveryNoteLineItems).set(updateData).where(eq(deliveryNoteLineItems.id, input.id));

      return { success: true };
    }),

  deleteLineItem: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const lineItem = await database.select().from(deliveryNoteLineItems)
        .where(eq(deliveryNoteLineItems.id, input))
        .limit(1);
      if (!lineItem.length) throw new Error("Line item not found");

      await database.delete(deliveryNoteLineItems).where(eq(deliveryNoteLineItems.id, input));

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "delivery_note_line_deleted",
        entityType: "delivery_note",
        entityId: input,
        description: `Deleted delivery note line item`,
      });

      return { success: true };
    }),
});
