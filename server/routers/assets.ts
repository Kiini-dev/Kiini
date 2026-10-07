import { router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db";
import { assetMovements, assets } from "../../drizzle/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getPool } from "../db";

// Permission-restricted procedures
const viewProcedure = createFeatureRestrictedProcedure("assets:view");
const createProcedure = createFeatureRestrictedProcedure("assets:create");
const editProcedure = createFeatureRestrictedProcedure("assets:edit");
const deleteProcedure = createFeatureRestrictedProcedure("assets:delete");

export const assetsRouter = router({
  list: viewProcedure
    .input(z.object({ 
      limit: z.number().optional(), 
      offset: z.number().optional(),
      category: z.string().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        const conditions: any[] = [];
        if (input?.category) conditions.push(eq(assets.category, input.category));
        if (input?.status) conditions.push(eq(assets.status, input.status as any));

        const where = conditions.length > 0 ? and(...conditions) : undefined;
        const limit = input?.limit || 50;
        const offset = input?.offset || 0;

        const [rows, countResult] = await Promise.all([
          db.select().from(assets).where(where).orderBy(desc(assets.createdAt)).limit(limit).offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(assets).where(where),
        ]);

        return {
          data: rows,
          total: countResult[0]?.count ?? 0,
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch assets" });
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        const rows = await db.select().from(assets).where(eq(assets.id, input));
        if (!rows.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
        }
        return rows[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch asset" });
      }
    }),

  movements: viewProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        return await db.select().from(assetMovements)
          .where(eq(assetMovements.assetId, input))
          .orderBy(desc(assetMovements.movedAt), desc(assetMovements.createdAt));
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch asset movements" });
      }
    }),

  move: editProcedure
    .input(z.object({
      id: z.string().min(1),
      toLocation: z.string().trim().min(1).max(200),
      toAssignedTo: z.string().trim().max(200).optional(),
      movedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      reason: z.string().trim().min(1).max(500),
      notes: z.string().trim().max(5000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.execute<any[]>(
          "SELECT id, location, assignedTo FROM assets WHERE id=? LIMIT 1 FOR UPDATE",
          [input.id],
        );
        const asset = rows[0];
        if (!asset) throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
        if (asset.location === input.toLocation && (asset.assignedTo || "") === (input.toAssignedTo || "")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Choose a new location or assignee to record a movement." });
        }

        const movementId = uuidv4();
        await connection.execute(
          `INSERT INTO assetMovements
           (id, assetId, fromLocation, toLocation, fromAssignedTo, toAssignedTo,
            movedAt, reason, notes, movedBy)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            movementId,
            input.id,
            asset.location,
            input.toLocation,
            asset.assignedTo,
            input.toAssignedTo || null,
            input.movedAt,
            input.reason,
            input.notes || null,
            ctx.user.id,
          ],
        );
        await connection.execute(
          "UPDATE assets SET location=?, assignedTo=? WHERE id=?",
          [input.toLocation, input.toAssignedTo || null, input.id],
        );
        await connection.commit();
        return { id: movementId };
      } catch (error) {
        await connection.rollback();
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to record asset movement" });
      } finally {
        connection.release();
      }
    }),

  create: createProcedure
    .input(z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      location: z.string().min(1),
      value: z.number().positive(),
      assignedTo: z.string().optional(),
      supplier: z.string().optional(),
      serialNumber: z.string().optional(),
      purchaseDate: z.string().optional(),
      status: z.enum(["active", "inactive", "maintenance", "disposed"]).default("active"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        const id = uuidv4();
        const record = {
          id,
          name: input.name,
          category: input.category,
          location: input.location,
          value: Math.round(input.value * 100),
          assignedTo: input.assignedTo ?? null,
          supplier: input.supplier ?? null,
          serialNumber: input.serialNumber ?? null,
          purchaseDate: input.purchaseDate ?? null,
          status: input.status,
          notes: input.notes ?? null,
          createdBy: ctx.user.id,
        };
        await db.insert(assets).values(record);
        const rows = await db.select().from(assets).where(eq(assets.id, id));
        return rows[0];
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create asset" });
      }
    }),

  update: editProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      category: z.string().optional(),
      location: z.string().optional(),
      value: z.number().positive().optional(),
      assignedTo: z.string().optional(),
      supplier: z.string().optional(),
      serialNumber: z.string().optional(),
      purchaseDate: z.string().optional(),
      status: z.enum(["active", "inactive", "maintenance", "disposed"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        const existing = await db.select().from(assets).where(eq(assets.id, input.id));
        if (!existing.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
        }

        const { id, ...updates } = input;
        const setValues: Record<string, any> = {};
        if (updates.name !== undefined) setValues.name = updates.name;
        if (updates.category !== undefined) setValues.category = updates.category;
        if (updates.location !== undefined) setValues.location = updates.location;
        if (updates.value !== undefined) setValues.value = Math.round(updates.value * 100);
        if (updates.assignedTo !== undefined) setValues.assignedTo = updates.assignedTo;
        if (updates.supplier !== undefined) setValues.supplier = updates.supplier;
        if (updates.serialNumber !== undefined) setValues.serialNumber = updates.serialNumber;
        if (updates.purchaseDate !== undefined) setValues.purchaseDate = updates.purchaseDate;
        if (updates.status !== undefined) setValues.status = updates.status;
        if (updates.notes !== undefined) setValues.notes = updates.notes;

        if (Object.keys(setValues).length > 0) {
          await db.update(assets).set(setValues).where(eq(assets.id, id));
        }

        const rows = await db.select().from(assets).where(eq(assets.id, id));
        return rows[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update asset" });
      }
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        const existing = await db.select().from(assets).where(eq(assets.id, input));
        if (!existing.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
        }
        await db.delete(assets).where(eq(assets.id, input));
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete asset" });
      }
    }),
});
