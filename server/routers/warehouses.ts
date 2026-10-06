import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { warehouses, stockMovements } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, desc, and, or, isNull } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export const warehousesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const query = db.select().from(warehouses);
    return ctx.user.organizationId
      ? query.where(or(eq(warehouses.organizationId, ctx.user.organizationId), isNull(warehouses.organizationId))).orderBy(warehouses.name)
      : query.orderBy(warehouses.name);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [wh] = await db.select().from(warehouses).where(eq(warehouses.id, input.id));
      return wh || null;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      code: z.string().optional(),
      address: z.string().optional(),
      contactPerson: z.string().optional(),
      phone: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const id = uuid();
      await db.insert(warehouses).values({ id, ...input } as any);
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      code: z.string().optional(),
      address: z.string().optional(),
      contactPerson: z.string().optional(),
      phone: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(warehouses).set(data as any).where(eq(warehouses.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(warehouses).where(eq(warehouses.id, input.id));
      return { success: true };
    }),

  // Stock Movements
  listMovements: protectedProcedure
    .input(z.object({
      productId: z.string().optional(),
      type: z.string().optional(),
      warehouseId: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [] as any[];
      if (input?.productId) conditions.push(eq(stockMovements.productId, input.productId));
      if (input?.type) conditions.push(eq(stockMovements.type, input.type));
      if (input?.warehouseId) conditions.push(eq(stockMovements.warehouseId, input.warehouseId));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(stockMovements).where(where as any).orderBy(desc(stockMovements.createdAt));
    }),

  createMovement: protectedProcedure
    .input(z.object({
      productId: z.string(),
      warehouseId: z.string().optional(),
      type: z.string(),
      quantity: z.number(),
      referenceNo: z.string().optional(),
      reason: z.string().optional(),
      fromWarehouse: z.string().optional(),
      toWarehouse: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const id = uuid();
      await db.insert(stockMovements).values({ id, ...input, createdBy: (ctx as any).user?.id } as any);
      return { id };
    }),
});
