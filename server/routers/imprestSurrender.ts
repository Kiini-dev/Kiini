import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { imprestSurrenders, imprests } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const readProcedure = createFeatureRestrictedProcedure("procurement:imprest:view");
const writeProcedure = createFeatureRestrictedProcedure("procurement:imprest:edit");

export const imprestSurrenderRouter = router({
  list: readProcedure
    .input(z.object({ imprestId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let q: any = db.select().from(imprestSurrenders).orderBy(desc(imprestSurrenders.createdAt));
      if (input?.imprestId) {
        q = q.where(eq(imprestSurrenders.imprestId, input.imprestId));
      }
      return await q;
    }),

  create: writeProcedure
    .input(z.object({ imprestId: z.string(), amount: z.number().positive(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const id = uuidv4();
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      await db.insert(imprestSurrenders).values({
        id,
        imprestId: input.imprestId,
        totalExpensed: input.amount,
        variance: 0,
        returnedAmount: input.amount,
        status: 'settled',
        settledBy: ctx.user.id,
        settledAt: now,
        createdAt: now,
      } as any);

      // mark imprest settled
      await db.update(imprests)
        .set({ status: 'settled', updatedAt: now })
        .where(eq(imprests.id, input.imprestId));
      return { id };
    }),
});
