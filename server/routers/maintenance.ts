import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { jobGroups, employees } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";

export const maintenanceRouter = router({
  fixInvalidJobGroups: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    try {
      // Find all job groups
      const allJobGroups = await db.select().from(jobGroups);
      const invalidJobGroups = allJobGroups.filter(jg => !isValidUUID(jg.id));

      if (invalidJobGroups.length === 0) {
        return { success: true, message: "No invalid job groups found", fixed: 0 };
      }

      let fixed = 0;

      for (const invalidJg of invalidJobGroups) {
        const newId = uuidv4();

        // Update employees pointing to this job group
        await db
          .update(employees)
          .set({ jobGroupId: newId })
          .where(eq(employees.jobGroupId, invalidJg.id));

        // Delete invalid job group
        await db.delete(jobGroups).where(eq(jobGroups.id, invalidJg.id));

        // Create new one with valid UUID
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        await db.insert(jobGroups).values({
          id: newId,
          name: invalidJg.name,
          minimumGrossSalary: invalidJg.minimumGrossSalary,
          maximumGrossSalary: invalidJg.maximumGrossSalary,
          description: invalidJg.description,
          isActive: invalidJg.isActive,
          createdAt: now,
          updatedAt: now,
        } as any);

        fixed++;
      }

      return {
        success: true,
        message: `Fixed ${fixed} invalid job group(s)`,
        fixed,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fix invalid job groups: ${error}`,
      });
    }
  }),
});

function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
