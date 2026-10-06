import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { accounts, budgets, departments, expenses } from "../../drizzle/schema";
import { budgetAllocations } from "../../drizzle/schema-extended";
import { eq, desc, sql, and, isNull } from "drizzle-orm";

function budgetById(budgetId: string, organizationId?: string | null) {
  return organizationId
    ? and(eq(budgets.id, budgetId), eq(budgets.organizationId, organizationId))
    : eq(budgets.id, budgetId);
}

export const budgetsRouter = router({
  listLines: createFeatureRestrictedProcedure("budgets:view")
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) return [];
        const organizationId = ctx.user.organizationId;

        const rows = await database
          .select({
            id: budgetAllocations.id,
            budgetId: budgetAllocations.budgetId,
            accountId: budgetAllocations.accountId,
            categoryName: budgetAllocations.categoryName,
            allocatedAmount: budgetAllocations.allocatedAmount,
            spentAmount: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
            notes: budgetAllocations.notes,
          })
          .from(budgetAllocations)
          .innerJoin(budgets, eq(budgets.id, budgetAllocations.budgetId))
          .leftJoin(expenses, organizationId
            ? and(eq(expenses.budgetAllocationId, budgetAllocations.id), eq(expenses.organizationId, organizationId))
            : eq(expenses.budgetAllocationId, budgetAllocations.id))
          .where(organizationId
            ? and(eq(budgetAllocations.budgetId, input), eq(budgets.organizationId, organizationId))
            : eq(budgetAllocations.budgetId, input))
          .groupBy(
            budgetAllocations.id,
            budgetAllocations.budgetId,
            budgetAllocations.accountId,
            budgetAllocations.categoryName,
            budgetAllocations.allocatedAmount,
            budgetAllocations.notes,
          )
          .orderBy(budgetAllocations.categoryName);

        return rows.map((row) => {
          const allocated = Number(row.allocatedAmount || 0);
          const spent = Number(row.spentAmount || 0);
          const remaining = allocated - spent;
          const utilization = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
          const status = remaining <= 0 ? "exhausted" : "active";

          return {
            id: row.id,
            budgetId: row.budgetId,
            category: row.categoryName,
            lineDescription: row.notes || "",
            allocatedAmount: allocated,
            spentAmount: spent,
            remainingAmount: remaining,
            utilizationPercentage: utilization,
            status,
            accountId: row.accountId,
          };
        });
      } catch (error: any) {
        console.error("Error fetching budget lines:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch budget lines: ${error?.message || String(error)}`,
        });
      }
    }),

  createLine: createFeatureRestrictedProcedure("budgets:create")
    .input(
      z.object({
        budgetId: z.string(),
        accountId: z.string(),
        category: z.string().min(1),
        lineDescription: z.string().optional(),
        allocatedAmount: z.number().nonnegative(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const [ownedBudget] = await database.select({ id: budgets.id }).from(budgets)
          .where(budgetById(input.budgetId, ctx.user.organizationId)).limit(1);
        if (!ownedBudget) throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
        const [ownedAccount] = await database.select({ id: accounts.id }).from(accounts)
          .where(and(
            eq(accounts.id, input.accountId),
            ctx.user.organizationId
              ? eq(accounts.organizationId, ctx.user.organizationId)
              : isNull(accounts.organizationId),
          )).limit(1);
        if (!ownedAccount) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });

        const id = uuidv4();
        const allocationNow = new Date();
        const budgetNow = allocationNow.toISOString().replace('T', ' ').substring(0, 19);

        await database.insert(budgetAllocations).values({
          id,
          budgetId: input.budgetId,
          accountId: input.accountId,
          categoryName: input.category,
          allocatedAmount: input.allocatedAmount,
          spentAmount: 0,
          notes: input.lineDescription || null,
          createdAt: allocationNow,
          updatedAt: allocationNow,
        } as any);

        const totalBudgetedRow = await database
          .select({ total: sql<number>`COALESCE(SUM(${budgetAllocations.allocatedAmount}), 0)` })
          .from(budgetAllocations)
          .where(eq(budgetAllocations.budgetId, input.budgetId));

        const totalBudgeted = Math.round((totalBudgetedRow?.[0]?.total || 0) / 100);

        await database.update(budgets).set({
          totalBudgeted,
          updatedAt: budgetNow,
        } as any).where(budgetById(input.budgetId, ctx.user.organizationId));

        await db.logActivity({
          userId: ctx.user.id,
          action: "budget_line_created",
          entityType: "budgetAllocation",
          entityId: id,
          description: `Created budget line for budget ${input.budgetId} with Ksh ${input.allocatedAmount / 100}`,
        });

        return { id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Error creating budget line:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create budget line: ${error.message}`,
        });
      }
    }),

  updateLine: createFeatureRestrictedProcedure("budgets:edit")
    .input(
      z.object({
        id: z.string(),
        accountId: z.string().optional(),
        category: z.string().optional(),
        lineDescription: z.string().optional(),
        allocatedAmount: z.number().nonnegative().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const existing = await database
          .select({ id: budgetAllocations.id, budgetId: budgetAllocations.budgetId })
          .from(budgetAllocations)
          .innerJoin(budgets, eq(budgets.id, budgetAllocations.budgetId))
          .where(ctx.user.organizationId
            ? and(eq(budgetAllocations.id, input.id), eq(budgets.organizationId, ctx.user.organizationId))
            : eq(budgetAllocations.id, input.id))
          .limit(1);

        if (!existing.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Budget line not found" });
        }

        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.category !== undefined) updateData.categoryName = input.category;
        if (input.accountId !== undefined) updateData.accountId = input.accountId;
        if (input.lineDescription !== undefined) updateData.notes = input.lineDescription;
        if (input.allocatedAmount !== undefined) updateData.allocatedAmount = input.allocatedAmount;

        await database.update(budgetAllocations).set(updateData).where(eq(budgetAllocations.id, input.id));

        const budgetId = existing[0].budgetId;
        const totalBudgetedRow = await database
          .select({ total: sql<number>`COALESCE(SUM(${budgetAllocations.allocatedAmount}), 0)` })
          .from(budgetAllocations)
          .where(eq(budgetAllocations.budgetId, budgetId));

        const totalBudgeted = Math.round((totalBudgetedRow?.[0]?.total || 0) / 100);

        await database.update(budgets).set({
          totalBudgeted,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        } as any).where(budgetById(budgetId, ctx.user.organizationId));

        await db.logActivity({
          userId: ctx.user.id,
          action: "budget_line_updated",
          entityType: "budgetAllocation",
          entityId: input.id,
          description: `Updated budget line ${input.id}`,
        });

        return { success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating budget line:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update budget line: ${error.message}`,
        });
      }
    }),

  deleteLine: createFeatureRestrictedProcedure("budgets:delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const existing = await database
          .select({ id: budgetAllocations.id, budgetId: budgetAllocations.budgetId })
          .from(budgetAllocations)
          .innerJoin(budgets, eq(budgets.id, budgetAllocations.budgetId))
          .where(ctx.user.organizationId
            ? and(eq(budgetAllocations.id, input), eq(budgets.organizationId, ctx.user.organizationId))
            : eq(budgetAllocations.id, input))
          .limit(1);

        if (!existing.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Budget line not found" });
        }

        const budgetId = existing[0].budgetId;
        await database.delete(budgetAllocations).where(eq(budgetAllocations.id, input));

        const totalBudgetedRow = await database
          .select({ total: sql<number>`COALESCE(SUM(${budgetAllocations.allocatedAmount}), 0)` })
          .from(budgetAllocations)
          .where(eq(budgetAllocations.budgetId, budgetId));

        const totalBudgeted = Math.round((totalBudgetedRow?.[0]?.total || 0) / 100);

        await database.update(budgets).set({
          totalBudgeted,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        } as any).where(budgetById(budgetId, ctx.user.organizationId));

        await db.logActivity({
          userId: ctx.user.id,
          action: "budget_line_deleted",
          entityType: "budgetAllocation",
          entityId: input,
          description: `Deleted budget line ${input}`,
        });

        return { success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting budget line:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete budget line: ${error.message}`,
        });
      }
    }),

  list: createFeatureRestrictedProcedure("budgets:view")
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
        departmentId: z.string().optional(),
        fiscalYear: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const database = await getDb();
        if (!database) return [];
        const orgId = ctx.user.organizationId;

        // Query budgets with department details
        const q = database
          .select({
            id: budgets.id,
            departmentId: budgets.departmentId,
            departmentName: departments.name,
            amount: budgets.amount,
            remaining: budgets.remaining,
            fiscalYear: budgets.fiscalYear,
            budgetStatus: budgets.budgetStatus,
            createdAt: budgets.createdAt,
          })
          .from(budgets)
          .leftJoin(departments, orgId
            ? and(eq(budgets.departmentId, departments.id), eq(departments.organizationId, orgId))
            : eq(budgets.departmentId, departments.id));

        const filters = [
          orgId ? eq(budgets.organizationId, orgId) : undefined,
          input?.departmentId ? eq(budgets.departmentId, input.departmentId) : undefined,
          input?.fiscalYear ? eq(budgets.fiscalYear, input.fiscalYear) : undefined,
        ].filter(Boolean) as any[];
        const results = filters.length
          ? await q.where(and(...filters)).orderBy(desc(budgets.fiscalYear), desc(budgets.createdAt)).limit(input?.limit || 100).offset(input?.offset || 0)
          : await q.orderBy(desc(budgets.fiscalYear), desc(budgets.createdAt)).limit(input?.limit || 100).offset(input?.offset || 0);

        return results || [];
      } catch (error) {
        console.error("Error fetching budgets:", error);
        return [];
      }
    }),

  getById: createFeatureRestrictedProcedure("budgets:view")
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) return null;

        const query = database
          .select({
            id: budgets.id,
            departmentId: budgets.departmentId,
            departmentName: departments.name,
            amount: budgets.amount,
            remaining: budgets.remaining,
            fiscalYear: budgets.fiscalYear,
            createdAt: budgets.createdAt,
          })
          .from(budgets)
          .leftJoin(departments, ctx.user.organizationId
            ? and(eq(budgets.departmentId, departments.id), eq(departments.organizationId, ctx.user.organizationId))
            : eq(budgets.departmentId, departments.id));
        const result = await query.where(budgetById(input, ctx.user.organizationId)).limit(1);

        return result?.[0] || null;
      } catch (error) {
        console.error("Error fetching budget:", error);
        return null;
      }
    }),

  create: createFeatureRestrictedProcedure("budgets:create")
    .input(
      z.object({
        departmentId: z.string(),
        amount: z.number().positive(),
        remaining: z.number().positive(),
        fiscalYear: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        if (ctx.user.organizationId) {
          const [department] = await database.select({ id: departments.id }).from(departments)
            .where(and(eq(departments.id, input.departmentId), eq(departments.organizationId, ctx.user.organizationId))).limit(1);
          if (!department) throw new TRPCError({ code: "NOT_FOUND", message: "Department not found" });
        }

        const id = uuidv4();
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        await database.insert(budgets).values({
          id,
          departmentId: input.departmentId,
          amount: input.amount,
          remaining: input.remaining,
          fiscalYear: input.fiscalYear,
          budgetStatus: 'draft',
          totalBudgeted: input.amount,
          totalActual: 0,
          variance: input.amount,
          variancePercent: 0,
          createdAt: now,
          updatedAt: now,
          organizationId: ctx.user.organizationId || null,
        });

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          action: "budget_created",
          entityType: "budget",
          entityId: id,
          description: `Created budget: Ksh ${input.amount.toLocaleString()} for FY ${input.fiscalYear}`,
        });

        return { id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Error creating budget:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create budget: ${error.message}`,
        });
      }
    }),

  update: createFeatureRestrictedProcedure("budgets:edit")
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive().optional(),
        remaining: z.number().optional(),
        fiscalYear: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const updateData: any = {};

        if (input.amount !== undefined) updateData.amount = input.amount;
        if (input.remaining !== undefined) updateData.remaining = input.remaining;
        if (input.fiscalYear !== undefined) updateData.fiscalYear = input.fiscalYear;

        if (Object.keys(updateData).length === 0) {
          throw new Error("No fields to update");
        }

        updateData.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

        const where = budgetById(input.id, ctx.user.organizationId);
        const [existing] = await database.select({ id: budgets.id }).from(budgets).where(where).limit(1);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
        await database.update(budgets).set(updateData).where(where);

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          action: "budget_updated",
          entityType: "budget",
          entityId: input.id,
          description: `Updated budget`,
        });

        return { success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating budget:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update budget: ${error.message}`,
        });
      }
    }),

  delete: createFeatureRestrictedProcedure("budgets:delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const where = budgetById(input, ctx.user.organizationId);
        const [existing] = await database.select({ id: budgets.id }).from(budgets).where(where).limit(1);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
        await database.delete(budgets).where(where);

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          action: "budget_deleted",
          entityType: "budget",
          entityId: input,
          description: `Deleted budget`,
        });

        return { success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting budget:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete budget: ${error.message}`,
        });
      }
    }),

  deductFromBudget: createFeatureRestrictedProcedure("budgets:edit")
    .input(
      z.object({
        budgetId: z.string(),
        amount: z.number().positive(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        // Get current budget
        const budgetRecord = await database
          .select({ remaining: budgets.remaining })
          .from(budgets)
          .where(budgetById(input.budgetId, ctx.user.organizationId))
          .limit(1);

        if (!budgetRecord || budgetRecord.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Budget not found",
          });
        }

        const remaining = budgetRecord[0].remaining - input.amount;

        if (remaining < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient budget. Available: Ksh ${budgetRecord[0].remaining / 100}`,
          });
        }

        await database
          .update(budgets)
          .set({
            remaining,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          })
          .where(budgetById(input.budgetId, ctx.user.organizationId));

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          action: "budget_deducted",
          entityType: "budget",
          entityId: input.budgetId,
          description: `Deducted Ksh ${input.amount / 100} from budget. ${input.reason || ""}`,
        });

        return { remaining };
      } catch (error: any) {
        console.error("Error deducting from budget:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to deduct from budget: ${error.message}`,
        });
      }
    }),

  getSummary: createFeatureRestrictedProcedure("budgets:view")
    .input(
      z.object({
        fiscalYear: z.number().optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) return null;

        const year = input?.fiscalYear || new Date().getFullYear();

        // Use Drizzle for aggregation
        const filters = [eq(budgets.fiscalYear, year)];
        if (ctx.user.organizationId) filters.push(eq(budgets.organizationId, ctx.user.organizationId));
        const result = await database
          .select({
            totalBudget: sql<number>`CAST(SUM(${budgets.amount}) AS UNSIGNED)`,
            totalRemaining: sql<number>`CAST(SUM(${budgets.remaining}) AS UNSIGNED)`,
            totalSpent: sql<number>`CAST(SUM(${budgets.amount} - ${budgets.remaining}) AS UNSIGNED)`,
            budgetCount: sql<number>`COUNT(*)`,
            utilizationPercent: sql<number>`ROUND(((SUM(${budgets.amount}) - SUM(${budgets.remaining})) / SUM(${budgets.amount})) * 100, 2)`,
          })
          .from(budgets)
          .where(and(...filters));

        return result?.[0] || null;
      } catch (error) {
        console.error("Error fetching budget summary:", error);
        return null;
      }
    }),
});
