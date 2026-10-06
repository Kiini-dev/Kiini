import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb, logActivity } from "../db";
import { grnRecords as grn } from "../../drizzle/schema";
import { grnLineItems } from "../../drizzle/schema-extended";
import { deliveryNotes } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { generateNextDocumentNumber } from "../utils/document-numbering";

// Feature-based procedures
const readProcedure = protectedProcedure;
const createProcedure = createFeatureRestrictedProcedure("procurementLpo:create");
const updateProcedure = createFeatureRestrictedProcedure("procurementLpo:edit");
const deleteProcedure = createFeatureRestrictedProcedure("procurementLpo:delete");

export const grnRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      status: z.enum(['draft', 'received', 'inspected', 'approved', 'posted', 'rejected', 'partial']).optional(),
      qualityStatus: z.enum(['approved', 'rejected', 'partial', 'pending_inspection']).optional(),
      lpoId: z.string().optional(),
      supplierId: z.string().optional(),
      warehouseId: z.string().optional(),
      searchTerm: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const database = await getDb();
        if (!database) return [];

        const grnTable: any = grn;
        let query: any = database.select().from(grnTable);

        if (input?.status) {
          query = query.where(eq((grnTable as any).status as any, input.status as any));
        }

        if (input?.qualityStatus) {
          query = query.where(eq((grnTable as any).qualityStatus as any, input.qualityStatus as any));
        }

        if (input?.lpoId) {
          query = query.where(eq((grnTable as any).lpoId as any, input.lpoId as any));
        }

        if (input?.supplierId) {
          query = query.where(eq((grnTable as any).supplierId as any, input.supplierId as any));
        }

        if (input?.warehouseId) {
          query = query.where(eq((grnTable as any).warehouseId as any, input.warehouseId as any));
        }

        return await query.limit(input?.limit || 100).offset(input?.offset || 0);
      } catch (error) {
        console.error("Error fetching GRN list:", error);
        return [];
      }
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const result = await database.select().from(grn).where(eq(grn.id, input)).limit(1);
      return result[0] || null;
    }),

  getWithLineItems: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      
      const grnData = await database.select().from(grn).where(eq(grn.id, input)).limit(1);
      if (!grnData.length) return null;
      
      const lineItems = await database.select().from(grnLineItems).where(eq(grnLineItems.grnId, input));
      
      return {
        ...grnData[0],
        lineItems,
      };
    }),

  create: createProcedure
    .input(z.object({
      lpoId: z.string(),
      deliveryNoteId: z.string().optional(),
      supplierId: z.string().optional(),
      supplierName: z.string().optional(),
      grnDate: z.string(),
      warehouseId: z.string(),
      receivedBy: z.string(),
      inspectedBy: z.string().optional(),
      inspectionDate: z.string().optional(),
      approvedBy: z.string().optional(),
      approvalDate: z.string().optional(),
      qualityStatus: z.enum(['approved', 'rejected', 'partial', 'pending_inspection']).default('pending_inspection'),
      rejectionReason: z.string().optional(),
      notes: z.string().optional(),
      lineItems: z.array(z.object({
        productId: z.string(),
        description: z.string(),
        orderedQuantity: z.number().positive(),
        receivedQuantity: z.number().nonnegative(),
        unit: z.string().default('pcs'),
        unitCost: z.number().nonnegative(),
        batchNumber: z.string().optional(),
        expiryDate: z.string().optional(),
        warehouseLocation: z.string().optional(),
        condition: z.enum(['good', 'damaged', 'expired', 'defective']).default('good'),
        remarks: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const resolvedSupplierId = (input.supplierId && input.supplierId.trim()) || (input.supplierName && input.supplierName.trim()) || "custom-supplier";
      const grnNumber = await generateNextDocumentNumber(database, "grn");
      const grnTable: any = grn;

      // Check for duplicate GRN number
      const existing = await database.select().from(grnTable)
        .where(eq(grnTable.grnNumber as any, grnNumber as any))
        .limit(1);
      if (existing.length > 0) {
        throw new Error(`GRN with number '${grnNumber}' already exists`);
      }

      const grnId = uuidv4();
      
      // Calculate totals
      let totalQty = 0;
      let totalCost = 0;
      
      input.lineItems.forEach(item => {
        totalQty += item.receivedQuantity;
        totalCost += (item.receivedQuantity * item.unitCost);
      });

      // Create GRN header
      await database.insert(grnTable).values({
        id: grnId,
        grnNumber,
        lpoId: input.lpoId,
        deliveryNoteId: input.deliveryNoteId,
        supplierId: resolvedSupplierId,
        grnDate: new Date(input.grnDate),
        receivedDate: new Date(),
        warehouseId: input.warehouseId,
        receivedBy: input.receivedBy,
        inspectedBy: input.inspectedBy,
        inspectionDate: input.inspectionDate ? new Date(input.inspectionDate) : undefined,
        approvedBy: input.approvedBy,
        approvalDate: input.approvalDate ? new Date(input.approvalDate) : undefined,
        status: 'received',
        qualityStatus: input.qualityStatus,
        totalQuantity: totalQty,
        totalCost: totalCost,
        rejectionReason: input.rejectionReason,
        notes: input.notes,
        createdBy: ctx.user.id,
      } as any);

      // Create line items
      for (const item of input.lineItems) {
        await database.insert(grnLineItems).values({
          id: uuidv4(),
          grnId: grnId,
          productId: item.productId,
          description: item.description,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          unit: item.unit,
          unitCost: item.unitCost,
          totalCost: item.receivedQuantity * item.unitCost,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
          warehouseLocation: item.warehouseLocation,
          condition: item.condition,
          remarks: item.remarks,
        } as any);
      }

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "grn_created",
        entityType: "grn",
        entityId: grnId,
        description: `Created GRN: ${grnNumber}`,
      });

      return { id: grnId };
    }),

  update: updateProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['draft', 'received', 'inspected', 'approved', 'posted', 'rejected', 'partial']).optional(),
      qualityStatus: z.enum(['approved', 'rejected', 'partial', 'pending_inspection']).optional(),
      inspectedBy: z.string().optional(),
      inspectionDate: z.string().optional(),
      approvedBy: z.string().optional(),
      approvalDate: z.string().optional(),
      rejectionReason: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const grnRecord = await database.select().from(grn)
        .where(eq(grn.id, input.id))
        .limit(1);
      if (!grnRecord.length) throw new Error("GRN not found");

      const updateData: any = {};
      if (input.status) updateData.status = input.status;
      if (input.qualityStatus) updateData.qualityStatus = input.qualityStatus;
      if (input.inspectedBy !== undefined) updateData.inspectedBy = input.inspectedBy;
      if (input.inspectionDate) updateData.inspectionDate = new Date(input.inspectionDate);
      if (input.approvedBy !== undefined) updateData.approvedBy = input.approvedBy;
      if (input.approvalDate) updateData.approvalDate = new Date(input.approvalDate);
      if (input.rejectionReason !== undefined) updateData.rejectionReason = input.rejectionReason;
      if (input.notes !== undefined) updateData.notes = input.notes;

      await database.update(grn).set(updateData).where(eq(grn.id, input.id));

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "grn_updated",
        entityType: "grn",
        entityId: input.id,
        description: `Updated GRN: ${grnRecord[0].grnNumber}`,
      });

      return { success: true };
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const grnRecord = await database.select().from(grn)
        .where(eq(grn.id, input))
        .limit(1);
      if (!grnRecord.length) throw new Error("GRN not found");

      // Delete line items first
      await database.delete(grnLineItems).where(eq(grnLineItems.grnId, input));
      
      // Delete GRN
      await database.delete(grn).where(eq(grn.id, input));

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "grn_deleted",
        entityType: "grn",
        entityId: input,
        description: `Deleted GRN: ${grnRecord[0].grnNumber}`,
      });

      return { success: true };
    }),

  getByStatus: readProcedure
    .input(z.enum(['pending', 'partial', 'rejected', 'accepted']))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];

      return await database.select().from(grn)
        .where(eq(grn.status, input as any));
    }),

  getByQualityStatus: readProcedure
    .input(z.enum(['approved', 'rejected', 'partial', 'pending_inspection']))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];

      return await database.select().from(grn)
        .where((grn as any).qualityStatus ? eq((grn as any).qualityStatus, input as any) : undefined as any);
    }),

  getByWarehouse: readProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];

      return await database.select().from(grn)
        .where((grn as any).warehouseId ? eq((grn as any).warehouseId, input as any) : undefined as any);
    }),

  getSummary: readProcedure
    .query(async () => {
      const database = await getDb();
      if (!database) return {
        totalGRNs: 0,
        approvedCount: 0,
        pendingInspection: 0,
        rejectedCount: 0,
        totalValue: 0,
      };

      const allGRNs = await database.select().from(grn);

      const approvedCount = allGRNs.filter((g: any) => g.qualityStatus === 'approved').length;
      const pendingInspection = allGRNs.filter((g: any) => g.qualityStatus === 'pending_inspection').length;
      const rejectedCount = allGRNs.filter((g: any) => g.qualityStatus === 'rejected').length;
      const totalValue = allGRNs.reduce((sum, g: any) => sum + (g.totalCost || 0), 0);

      return {
        totalGRNs: allGRNs.length,
        approvedCount,
        pendingInspection,
        rejectedCount,
        totalValue,
      };
    }),

  updateLineItem: updateProcedure
    .input(z.object({
      id: z.string(),
      receivedQuantity: z.number().optional(),
      warehouseLocation: z.string().optional(),
      condition: z.enum(['good', 'damaged', 'expired', 'defective']).optional(),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const lineItem = await database.select().from(grnLineItems)
        .where(eq(grnLineItems.id, input.id))
        .limit(1);
      if (!lineItem.length) throw new Error("Line item not found");

      const updateData: any = {};
      if (input.receivedQuantity !== undefined) updateData.receivedQuantity = input.receivedQuantity;
      if (input.warehouseLocation !== undefined) updateData.warehouseLocation = input.warehouseLocation;
      if (input.condition !== undefined) updateData.condition = input.condition;
      if (input.remarks !== undefined) updateData.remarks = input.remarks;

      // Recalculate total cost if received quantity changed
      if (input.receivedQuantity !== undefined) {
        updateData.totalCost = input.receivedQuantity * (lineItem[0].unitCost || 0);
      }

      await database.update(grnLineItems).set(updateData).where(eq(grnLineItems.id, input.id));

      return { success: true };
    }),

  deleteLineItem: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const lineItem = await database.select().from(grnLineItems)
        .where(eq(grnLineItems.id, input))
        .limit(1);
      if (!lineItem.length) throw new Error("Line item not found");

      await database.delete(grnLineItems).where(eq(grnLineItems.id, input));

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "grn_line_deleted",
        entityType: "grn",
        entityId: input,
        description: `Deleted GRN line item`,
      });

      return { success: true };
    }),
});
