import { router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb } from "../db";
import { performanceContracts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const readProcedure = createFeatureRestrictedProcedure("hr:view");
const writeProcedure = createFeatureRestrictedProcedure("hr:edit");

export const performanceContractsRouter = router({
  list: readProcedure.input(z.object({ employeeId: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(performanceContracts)
      .where(eq(performanceContracts.employeeId, input.employeeId))
      .orderBy(desc(performanceContracts.startDate));
  }),
  create: writeProcedure.input(z.object({
    employeeId: z.string(), departmentId: z.string().optional(), jobGroupId: z.string().optional(),
    contractNumber: z.string().min(1), title: z.string().min(1), startDate: z.string(), endDate: z.string().optional(),
    status: z.enum(["draft", "active", "expired", "terminated"]).default("draft"), salary: z.number().optional(),
    terms: z.string().optional(), objectives: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = uuidv4();
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    await db.insert(performanceContracts).values({ ...input, id, startDate: input.startDate, endDate: input.endDate || null, createdBy: ctx.user.id, createdAt: now, updatedAt: now } as any);
    return { id };
  }),
  update: writeProcedure.input(z.object({
    id: z.string(), title: z.string().optional(), endDate: z.string().nullable().optional(), status: z.enum(["draft", "active", "expired", "terminated"]).optional(), salary: z.number().optional(), terms: z.string().optional(), objectives: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...updates } = input;
    await db.update(performanceContracts).set({ ...updates, updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19) } as any).where(eq(performanceContracts.id, id));
    return { success: true };
  }),
});