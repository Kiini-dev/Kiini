import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { imprestSurrenders, imprests } from "../../drizzle/schema-extended";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const readProcedure = createFeatureRestrictedProcedure("procurement:imprest:view");
const writeProcedure = createFeatureRestrictedProcedure("procurement:imprest:edit");

/**
 * Generate next imprest surrender number
 * Example: "IMPS-000001", "IMPS-000002"
 */
async function generateNextSurrenderNumber(db: any): Promise<string> {
  try {
    const result = await db.select({ id: imprestSurrenders.id, createdAt: imprestSurrenders.createdAt })
      .from(imprestSurrenders)
      .orderBy(desc(imprestSurrenders.createdAt))
      .limit(1);
    let seq = 0;
    if (result && result.length > 0 && result[0].id) {
      const match = result[0].id.match(/(\d+)$/);
      if (match) seq = parseInt(match[1]);
    }
    seq++;
    return `IMPS-${String(seq).padStart(6, '0')}`;
  } catch (err) {
    console.warn("imprest surrender number generator error", err);
    return `IMPS-000001`;
  }
}

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
      const surrenderNumber = await generateNextSurrenderNumber(db);
      await db.insert(imprestSurrenders).values({
        id,
        imprestId: input.imprestId,
        totalExpensed: input.amount,
        variance: 0,
        returnedAmount: input.amount,
        status: 'settled',
        settledBy: ctx.user.id,
        settledAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      } as any);

      // mark imprest settled
      await db.update(imprests)
        .set({ status: 'settled', updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) as any })
        .where(eq(imprests.id, input.imprestId));
      return { id };
    }),
});
