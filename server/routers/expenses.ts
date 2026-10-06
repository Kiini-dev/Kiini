import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { expenses, accounts, lineItems, recurringExpenses, budgets } from "../../drizzle/schema";
import { budgetAllocations } from "../../drizzle/schema-extended";
import { eq, and, gte, lte, desc, or, isNull, sql, inArray, ne } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { validateApprovalAction, hasPermission } from "../middleware/rbac";
import { TRPCError } from "@trpc/server";
import { generateNextDocumentNumber } from "../utils/document-numbering";
import { createFeatureRestrictedProcedure, createRoleRestrictedProcedure } from "../middleware/enhancedRbac";
import { scheduleDocumentAutomation } from "../services/jobScheduler";
import { adjustChartOfAccountBalance, reconcileChartOfAccountBalance } from "../utils/chartOfAccountBalance";
import { paymentModeSchema } from "../utils/payment-modes";
import { generateRecurringExpenseDescription, parseRecurringOccurrenceDate } from "../utils/recurringLabels";

// Permission-restricted procedure instances
const viewProcedure = createFeatureRestrictedProcedure("accounting:expenses:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:expenses:create");
const approveProcedure = createFeatureRestrictedProcedure("accounting:expenses:approve");
const rejectProcedure = createFeatureRestrictedProcedure("accounting:expenses:reject");
const budgetProcedure = createFeatureRestrictedProcedure("accounting:expenses:budget");
const budgetLookupProcedure = createFeatureRestrictedProcedure([
  "accounting:expenses:budget",
  "accounting:expenses:create",
  "accounting:expenses:view",
]);
const budgetAssignmentProcedure = createFeatureRestrictedProcedure([
  "accounting:expenses:budget",
  "accounting:expenses:create",
  "accounting:expenses:edit",
]);
const deleteProcedure = createRoleRestrictedProcedure(["super_admin", "admin"]);

// Helper function to generate next expense number in format EXP-000000
async function generateNextExpenseNumber(database: any): Promise<string> {
  try {
    const result = await database.select({ expNum: expenses.expenseNumber })
      .from(expenses)
      .orderBy(desc(expenses.expenseNumber))
      .limit(1);
    
    let maxSequence = 0;
    
    if (result && result.length > 0 && result[0].expNum) {
      const match = result[0].expNum.match(/(\d+)$/);
      if (match) {
        maxSequence = parseInt(match[1]);
      }
    }

    const nextSequence = maxSequence + 1;
    return `EXP-${String(nextSequence).padStart(6, '0')}`;
  } catch (err) {
    console.warn("Error generating expense number, using default:", err);
    return `EXP-000001`;
  }
}

// Helper function to update COA balance
async function updateCOABalance(database: any, chartOfAccountId: string | null | undefined, amount: number, operation: 'add' | 'subtract', organizationId?: string | null) {
  await adjustChartOfAccountBalance(database, chartOfAccountId, operation === 'add' ? amount : -amount, organizationId);
}

async function refreshBudgetAllocationTotals(database: any, budgetId: string) {
  const allocations = await database
    .select({
      id: budgetAllocations.id,
      allocated: budgetAllocations.allocatedAmount,
      spent: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(budgetAllocations)
    .leftJoin(expenses, eq(expenses.budgetAllocationId, budgetAllocations.id))
    .where(eq(budgetAllocations.budgetId, budgetId))
    .groupBy(budgetAllocations.id, budgetAllocations.allocatedAmount);

  const allocated = allocations.reduce((sum: number, allocation: any) => sum + Number(allocation.allocated || 0), 0);
  const spent = allocations.reduce((sum: number, allocation: any) => sum + Number(allocation.spent || 0), 0);
  for (const allocation of allocations) {
    await database.update(budgetAllocations).set({
      spentAmount: Number(allocation.spent || 0),
      updatedAt: new Date(),
    } as any).where(eq(budgetAllocations.id, allocation.id));
  }

  const allocatedKsh = Math.round(allocated / 100);
  const spentKsh = Math.round(spent / 100);
  const budgetRow = await database.select({ amount: budgets.amount }).from(budgets).where(eq(budgets.id, budgetId)).limit(1);
  const budgetAmount = Number(budgetRow?.[0]?.amount || 0);
  const remaining = Math.max(0, budgetAmount - spentKsh);

  await database.update(budgets).set({
    totalBudgeted: allocatedKsh,
    totalActual: spentKsh,
    remaining,
    variance: budgetAmount - spentKsh,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    budgetStatus: remaining <= 0 ? 'closed' : 'active',
  } as any).where(eq(budgets.id, budgetId));
}

async function validateExpenseBudgetAllocation(
  database: any,
  expenseId: string,
  allocationId: string | null | undefined,
  amount: number,
) {
  if (!allocationId) return;

  const nextAllocation = await database
    .select()
    .from(budgetAllocations)
    .where(eq(budgetAllocations.id, allocationId))
    .limit(1);

  if (!nextAllocation[0]) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Budget allocation not found" });
  }

  const [spendRow] = await database.select({
    spent: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
  }).from(expenses).where(and(
    eq(expenses.budgetAllocationId, allocationId),
    ne(expenses.id, expenseId),
  ));
  const available = Number(nextAllocation[0].allocatedAmount || 0) - Number(spendRow?.spent || 0);

  if (amount > available) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Insufficient budget. Available: Ksh ${(available / 100).toLocaleString()}`,
    });
  }
}

async function syncExpenseBudgetAllocation(database: any, {
  expenseId,
  previousAllocationId,
  previousAmount,
  nextAllocationId,
  nextAmount,
}: {
  expenseId: string;
  previousAllocationId?: string | null;
  previousAmount?: number;
  nextAllocationId?: string | null;
  nextAmount?: number;
}) {
  if (!nextAllocationId && !previousAllocationId) return;
  await validateExpenseBudgetAllocation(database, expenseId, nextAllocationId, Number(nextAmount || 0));

  const allocationIds = [...new Set([previousAllocationId, nextAllocationId].filter(Boolean))] as string[];
  const affected = await database.select({ id: budgetAllocations.id, budgetId: budgetAllocations.budgetId })
    .from(budgetAllocations)
    .where(inArray(budgetAllocations.id, allocationIds));
  const budgetIds = [...new Set(affected.map((allocation: any) => allocation.budgetId))] as string[];
  for (const budgetId of budgetIds) await refreshBudgetAllocationTotals(database, budgetId);
}

export const expensesRouter = router({
  list: viewProcedure
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) return [];

        const orgId = ctx.user.organizationId;
        let query = orgId
          ? database.select().from(expenses).where(eq(expenses.organizationId, orgId))
          : database.select().from(expenses);

        if (input?.status) {
          query = orgId
            ? database.select().from(expenses).where(and(eq(expenses.organizationId, orgId), eq(expenses.status, input.status as any))) as any
            : database.select().from(expenses).where(eq(expenses.status, input.status as any)) as any;
        }

        const results = await (query as any).limit(input?.limit || 100).offset(input?.offset || 0);
        return results;
      } catch (error) {
        console.error("Error fetching expenses list:", error);
        return [];
      }
    }),

  getNextExpenseNumber: viewProcedure
    .query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const nextNumber = await generateNextExpenseNumber(database);
      return { expenseNumber: nextNumber };
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return null;
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(expenses.id, input), eq(expenses.organizationId, orgId)) : eq(expenses.id, input);
      const result = await database.select().from(expenses).where(where).limit(1);
      if (!result[0]) return null;
      // Fetch line items
      const items = await database.select().from(lineItems)
        .where(and(eq(lineItems.documentId, input), eq(lineItems.documentType, 'expense')));
      return { ...result[0], items };
    }),

  create: createProcedure
    .input(z.object({
      expenseDate: z.coerce.date(),
      category: z.string().max(100),
      description: z.string().max(500).optional(),
      amount: z.number().positive(),
      vendor: z.string().max(255).optional(),
      paymentMethod: paymentModeSchema.optional(),
      status: z.enum(['pending', 'approved', 'rejected', 'paid']).optional(),
      receiptUrl: z.string().optional(),
      accountId: z.string().optional(),
      chartOfAccountId: z.string().min(1).optional(),
      budgetAllocationId: z.string().nullable().optional(),
      items: z.array(z.object({
        description: z.string().min(1),
        quantity: z.number().int().positive(),
        rate: z.number().positive(),
        amount: z.number().positive(),
        taxRate: z.number().optional(),
        taxAmount: z.number().optional(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const expenseNumber = await generateNextExpenseNumber(database);

      const id = uuidv4();
      
      // Convert dates to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
      const convertToMySQLDateTime = (date?: Date | string | null): string => {
        if (!date) return new Date().toISOString().replace('T', ' ').substring(0, 19);
        if (typeof date === 'string') return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
        if (date instanceof Date) return date.toISOString().replace('T', ' ').substring(0, 19);
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
      };

      const expenseDate = convertToMySQLDateTime(input.expenseDate);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      try {
        // Build values object with all fields including nulls for optional ones
        const values: any = {
          id,
          expenseNumber,
          expenseDate,
          category: input.category,
          amount: input.amount,
          paymentMethod: input.paymentMethod || 'cash',
          status: input.status || 'pending',
          organizationId: ctx.user.organizationId ?? null,
          createdBy: ctx.user.id,
          description: input.description || null,
          vendor: input.vendor || null,
          receiptUrl: input.receiptUrl || null,
          accountId: input.accountId || null,
          budgetAllocationId: input.budgetAllocationId || null,
          chartOfAccountId: input.chartOfAccountId || null,
          createdAt: now,
          updatedAt: now,
        };

        await database.insert(expenses).values(values);
        if (input.budgetAllocationId) {
          await syncExpenseBudgetAllocation(database, {
            expenseId: id,
            previousAllocationId: null,
            previousAmount: 0,
            nextAllocationId: input.budgetAllocationId,
            nextAmount: input.amount,
          });
        }
        await scheduleDocumentAutomation({ documentType: "expense", documentId: id, organizationId: ctx.user.organizationId, createdBy: ctx.user.id, createdAt: now }).catch((error) => console.error("Failed to schedule expense automation:", error));

        // Insert line items if provided
        if (input.items && input.items.length > 0) {
          const itemInserts = input.items.map((item, idx) => ({
            id: uuidv4(),
            documentId: id,
            documentType: 'expense' as const,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            taxRate: item.taxRate || 0,
            taxAmount: item.taxAmount || 0,
            lineNumber: idx + 1,
            createdBy: ctx.user.id,
            createdAt: now,
            updatedAt: now,
          }));
          for (const itemInsert of itemInserts) {
            await database.insert(lineItems).values(itemInsert);
          }
        }

        // Update COA balance if chartOfAccountId provided
        if (input.chartOfAccountId) {
          await updateCOABalance(database, input.chartOfAccountId, input.amount, 'add', ctx.user.organizationId);
        }

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          action: "expense_created",
          entityType: "expense",
          entityId: id,
          description: `Created expense: ${input.category} - Ksh ${input.amount / 100}`,
        });

        return { id };
      } catch (error: any) {
        console.error("Error creating expense:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create expense: ${error.message}`,
        });
      }
    }),

  update: createProcedure
    .input(z.object({
      id: z.string(),
      expenseNumber: z.string().optional(),
      expenseDate: z.coerce.date().optional(),
      category: z.string().max(100).optional(),
      description: z.string().max(500).optional(),
      amount: z.number().positive().optional(),
      vendor: z.string().max(255).optional(),
      paymentMethod: paymentModeSchema.optional(),
      status: z.enum(['pending', 'approved', 'rejected', 'paid']).optional(),
      receiptUrl: z.string().optional(),
      accountId: z.string().optional(),
      chartOfAccountId: z.string().min(1).nullable().optional(),
      budgetAllocationId: z.string().nullable().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const orgId = ctx.user.organizationId;
      const ownerCheck = orgId ? and(eq(expenses.id, input.id), eq(expenses.organizationId, orgId)) : eq(expenses.id, input.id);
      const expense = await database.select().from(expenses).where(ownerCheck).limit(1);
      if (!expense.length) throw new Error("Expense not found");

      const oldExpense = expense[0];

      const updateData: any = {};
      
      if (input.expenseDate) {
        // Convert to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
        const date = typeof input.expenseDate === 'string' 
          ? new Date(input.expenseDate).toISOString().replace('T', ' ').substring(0, 19)
          : input.expenseDate.toISOString().replace('T', ' ').substring(0, 19);
        updateData.expenseDate = date;
      }
      if (input.expenseNumber) updateData.expenseNumber = input.expenseNumber;
      if (input.category) updateData.category = input.category;
      if (input.description) updateData.description = input.description;
      if (input.amount) updateData.amount = input.amount;
      if (input.vendor) updateData.vendor = input.vendor;
      if (input.paymentMethod) updateData.paymentMethod = input.paymentMethod;
      if (input.status) updateData.status = input.status;
      if (input.receiptUrl) updateData.receiptUrl = input.receiptUrl;
      if (input.accountId) updateData.accountId = input.accountId;
      if (input.budgetAllocationId !== undefined) updateData.budgetAllocationId = input.budgetAllocationId || null;
      if (input.chartOfAccountId !== undefined) updateData.chartOfAccountId = input.chartOfAccountId;
      updateData.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

      if (input.budgetAllocationId !== undefined || input.amount !== undefined) {
        const nextAllocationId = input.budgetAllocationId !== undefined
          ? input.budgetAllocationId || null
          : oldExpense.budgetAllocationId || null;
        const nextAmount = input.amount !== undefined ? input.amount : oldExpense.amount;
        await validateExpenseBudgetAllocation(database, input.id, nextAllocationId, Number(nextAmount));
      }

      // Handle COA balance updates
      if (input.chartOfAccountId !== undefined || input.amount !== undefined) {
        const oldCoaId = oldExpense.chartOfAccountId;
        const newCoaId = input.chartOfAccountId !== undefined ? input.chartOfAccountId : oldExpense.chartOfAccountId;
        const oldAmount = oldExpense.amount;
        const newAmount = input.amount || oldExpense.amount;
        await reconcileChartOfAccountBalance(
          database,
          oldCoaId,
          Number(oldAmount || 0),
          "debit",
          newCoaId,
          Number(newAmount || 0),
          "debit",
          ctx.user.organizationId,
        );
      }

      await database.update(expenses).set(updateData).where(eq(expenses.id, input.id));

      if (input.budgetAllocationId !== undefined || input.amount !== undefined) {
        const nextAllocationId = input.budgetAllocationId !== undefined ? input.budgetAllocationId || null : oldExpense.budgetAllocationId || null;
        const nextAmount = input.amount !== undefined ? input.amount : oldExpense.amount;
        await syncExpenseBudgetAllocation(database, {
          expenseId: input.id,
          previousAllocationId: oldExpense.budgetAllocationId || null,
          previousAmount: oldExpense.amount,
          nextAllocationId,
          nextAmount,
        });
      }

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "expense_updated",
        entityType: "expense",
        entityId: input.id,
        description: `Updated expense: ${oldExpense.category}`,
      });

      return { success: true };
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Check permission to delete expenses
      if (!hasPermission(ctx.user.role, "DELETE_EXPENSE")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete expenses. Only Super Admin, Admin, and Accountant roles can delete expenses.",
        });
      }

      const orgId = ctx.user.organizationId;
      const expenseWhere = orgId
        ? and(eq(expenses.id, input), eq(expenses.organizationId, orgId))
        : eq(expenses.id, input);
      const expense = await database.select().from(expenses).where(expenseWhere).limit(1);
      if (!expense.length) throw new Error("Expense not found");

      // Reverse COA balance update before deleting
      if (expense[0].chartOfAccountId && expense[0].amount) {
        const reversed = await adjustChartOfAccountBalance(
          database,
          expense[0].chartOfAccountId,
          -Number(expense[0].amount),
          orgId,
          { allowMissingAccount: true },
        );
        if (!reversed) {
          console.warn("[Expenses] Deleted expense references a missing Chart of Accounts entry", {
            expenseId: input,
            chartOfAccountId: expense[0].chartOfAccountId,
          });
        }
      }

      const where = orgId ? and(eq(expenses.id, input), eq(expenses.organizationId, orgId)) : eq(expenses.id, input);
      await database.delete(expenses).where(where);
      if (expense[0].budgetAllocationId) {
        await syncExpenseBudgetAllocation(database, {
          expenseId: input,
          previousAllocationId: expense[0].budgetAllocationId,
          previousAmount: expense[0].amount,
          nextAllocationId: null,
          nextAmount: 0,
        });
      }

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "expense_deleted",
        entityType: "expense",
        entityId: input,
        description: `Deleted expense: ${expense[0].category}`,
      });

      return { success: true };
    }),

  approve: approveProcedure
    .input(z.object({
      id: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      validateApprovalAction(ctx.user.role, "expense");

      const expense = await database.select().from(expenses).where(eq(expenses.id, input.id)).limit(1);
      if (!expense.length) throw new Error("Expense not found");

      if (expense[0].status === "approved") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Expense is already approved",
        });
      }

      await database.update(expenses).set({
        status: "approved",
        approvedBy: ctx.user.id,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      } as any).where(eq(expenses.id, input.id));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "expense_approved",
        entityType: "expense",
        entityId: input.id,
        description: `Approved expense: ${expense[0].category} - Ksh ${expense[0].amount / 100}${input.notes ? ` (Notes: ${input.notes})` : ''}`,
      });

      return { success: true, message: "Expense approved successfully" };
    }),

  reject: rejectProcedure
    .input(z.object({
      id: z.string(),
      reason: z.string().min(1, "Rejection reason is required"),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      validateApprovalAction(ctx.user.role, "expense");

      const expense = await database.select().from(expenses).where(eq(expenses.id, input.id)).limit(1);
      if (!expense.length) throw new Error("Expense not found");

      if (expense[0].status === "rejected") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Expense is already rejected",
        });
      }

      await database.update(expenses).set({
        status: "rejected",
        rejectedBy: ctx.user.id,
        rejectionReason: input.reason,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      } as any).where(eq(expenses.id, input.id));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "expense_rejected",
        entityType: "expense",
        entityId: input.id,
        description: `Rejected expense: ${expense[0].category} - Ksh ${expense[0].amount / 100} (Reason: ${input.reason})`,
      });

      return { success: true, message: "Expense rejected successfully" };
    }),

  bulkApprove: approveProcedure
    .input(z.object({
      ids: z.array(z.string()).min(1),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      validateApprovalAction(ctx.user.role, "expense");

      const results = {
        approved: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const expenseId of input.ids) {
        try {
          const expense = await database.select().from(expenses).where(eq(expenses.id, expenseId)).limit(1);
          if (!expense.length) {
            results.failed++;
            results.errors.push(`Expense ${expenseId} not found`);
            continue;
          }

          if (expense[0].status === "approved") {
            results.failed++;
            results.errors.push(`Expense ${expenseId} is already approved`);
            continue;
          }

          await database.update(expenses).set({
            status: "approved",
            approvedBy: ctx.user.id,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          } as any).where(eq(expenses.id, expenseId));

          results.approved++;

          // Log activity
          await db.logActivity({
            userId: ctx.user.id,
            action: "expense_approved",
            entityType: "expense",
            entityId: expenseId,
            description: `Bulk approved expense: ${expense[0].category} - Ksh ${expense[0].amount / 100}`,
          });
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Error approving expense ${expenseId}: ${error.message}`);
        }
      }

      return results;
    }),

  // Get available budget allocations for linking with expenses
  getAvailableBudgetAllocations: budgetLookupProcedure
    .input(z.object({
      departmentId: z.string().optional(),
      budgetId: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return [];

      try {
        const { budgetAllocations } = await import("../../drizzle/schema-extended");
        const { budgets, departments } = await import("../../drizzle/schema");
        const conditions = [
          ctx.user.organizationId
            ? or(eq(budgets.organizationId, ctx.user.organizationId), isNull(budgets.organizationId))
            : undefined,
          input?.departmentId ? eq(budgets.departmentId, input.departmentId) : undefined,
          input?.budgetId ? eq(budgetAllocations.budgetId, input.budgetId) : undefined,
        ].filter(Boolean) as any[];

        const allocations = await database
          .select({
            id: budgetAllocations.id,
            budgetId: budgetAllocations.budgetId,
            accountId: budgetAllocations.accountId,
            departmentId: budgets.departmentId,
            departmentName: departments.name,
            fiscalYear: budgets.fiscalYear,
            categoryName: budgetAllocations.categoryName,
            allocatedAmount: budgetAllocations.allocatedAmount,
            notes: budgetAllocations.notes,
          })
          .from(budgetAllocations)
          .leftJoin(budgets, eq(budgetAllocations.budgetId, budgets.id))
          .leftJoin(departments, eq(budgets.departmentId, departments.id))
          .where(and(...conditions))
          .orderBy(departments.name, budgetAllocations.categoryName);

        if (allocations.length === 0) return [];

        const allocationIds = allocations.map((allocation: any) => allocation.id);
        const spentRows = await database
          .select({
            budgetAllocationId: expenses.budgetAllocationId,
            spentAmount: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
          })
          .from(expenses)
          .where(inArray(expenses.budgetAllocationId, allocationIds))
          .groupBy(expenses.budgetAllocationId);
        const spentByAllocation = new Map(
          spentRows.map((row: any) => [row.budgetAllocationId, Number(row.spentAmount || 0)]),
        );

        return allocations.map((allocation: any) => {
          const spentAmount = spentByAllocation.get(allocation.id) || 0;
          const allocatedAmount = Number(allocation.allocatedAmount || 0);
          return {
            id: allocation.id,
            budgetId: allocation.budgetId,
            accountId: allocation.accountId,
            departmentId: allocation.departmentId,
            departmentName: allocation.departmentName,
            fiscalYear: allocation.fiscalYear,
            categoryName: allocation.categoryName,
            allocatedAmount,
            spentAmount,
            remaining: allocatedAmount - spentAmount,
            notes: allocation.notes,
          };
        });
      } catch (error: any) {
        console.error("Error fetching budget allocations:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch budget allocations: ${error?.message || String(error)}`,
        });
      }
    }),

  // Update expense with budget allocation
  updateBudgetAllocation: budgetAssignmentProcedure
    .input(z.object({
      expenseId: z.string(),
      budgetAllocationId: z.string().or(z.null()),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        // Get the expense first
        const expense = await database.select().from(expenses).where(eq(expenses.id, input.expenseId)).limit(1);
        if (!expense.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found" });
        }

        const { budgetAllocations } = await import("../../drizzle/schema-extended");
        const currentExpense = expense[0] as any;
        const oldAllocation = currentExpense.budgetAllocationId
          ? (await database.select().from(budgetAllocations).where(eq(budgetAllocations.id, currentExpense.budgetAllocationId)).limit(1))[0]
          : null;
        const newAllocation = input.budgetAllocationId
          ? (await database.select().from(budgetAllocations).where(eq(budgetAllocations.id, input.budgetAllocationId)).limit(1))[0]
          : null;
        if (input.budgetAllocationId && !newAllocation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Budget allocation not found" });
        }
        if (newAllocation) {
          const budget = (await database.select().from(budgets).where(eq(budgets.id, newAllocation.budgetId)).limit(1))[0];
          if (!budget) throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
          if (currentExpense.organizationId && budget.organizationId && currentExpense.organizationId !== budget.organizationId) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Expense and budget belong to different organizations" });
          }
          const [actuals] = await database.select({
            spent: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
          }).from(expenses).where(and(
            eq(expenses.budgetAllocationId, newAllocation.id),
            ne(expenses.id, currentExpense.id),
          ));
          const available = Number(newAllocation.allocatedAmount || 0) - Number(actuals?.spent || 0);
          if (Number(currentExpense.amount || 0) > available) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient budget. Available: Ksh ${(available / 100).toLocaleString()}` });
          }
        }

        // Update the expense with budget allocation
        await database
          .update(expenses)
          .set({
            budgetAllocationId: input.budgetAllocationId ?? null,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          } as any)
          .where(eq(expenses.id, input.expenseId));
        await syncExpenseBudgetAllocation(database, {
          expenseId: currentExpense.id,
          previousAllocationId: currentExpense.budgetAllocationId || null,
          previousAmount: currentExpense.amount,
          nextAllocationId: input.budgetAllocationId,
          nextAmount: currentExpense.amount,
        });

        // Log activity
        await db.logActivity({
          userId: ctx.user.id,
          action: "expense_budget_updated",
          entityType: "expense",
          entityId: input.expenseId,
          description: input.budgetAllocationId 
            ? `Linked expense to budget allocation ${input.budgetAllocationId}`
            : `Removed budget allocation from expense`,
        });

        return { success: true, message: "Budget allocation updated" };
      } catch (error: any) {
        console.error("Error updating budget allocation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to update budget allocation",
        });
      }
    }),

  // Get budget allocation report (which allocations are being used)
  getBudgetAllocationReport: budgetLookupProcedure
    .input(z.object({
      budgetAllocationId: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return [];

      try {
        const { budgetAllocations } = await import("../../drizzle/schema-extended");
        const conditions = [
          ctx.user.organizationId
            ? or(eq(budgets.organizationId, ctx.user.organizationId), isNull(budgets.organizationId))
            : undefined,
          input?.budgetAllocationId
            ? eq(budgetAllocations.id, input.budgetAllocationId)
            : undefined,
        ].filter(Boolean) as any[];

        const allocations = await database
          .select({
            id: budgetAllocations.id,
            budgetId: budgetAllocations.budgetId,
            categoryName: budgetAllocations.categoryName,
            allocatedAmount: budgetAllocations.allocatedAmount,
          })
          .from(budgetAllocations)
          .innerJoin(budgets, eq(budgets.id, budgetAllocations.budgetId))
          .where(and(...conditions));

        if (allocations.length === 0) return [];

        const expenseConditions = [
          inArray(expenses.budgetAllocationId, allocations.map((allocation: any) => allocation.id)),
          ctx.user.organizationId
            ? eq(expenses.organizationId, ctx.user.organizationId)
            : undefined,
        ].filter(Boolean) as any[];
        const expenseTotals = await database
          .select({
            budgetAllocationId: expenses.budgetAllocationId,
            spentAmount: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
            linkedExpenses: sql<number>`COUNT(*)`,
          })
          .from(expenses)
          .where(and(...expenseConditions))
          .groupBy(expenses.budgetAllocationId);
        const totalsByAllocation = new Map(
          expenseTotals.map((row: any) => [
            row.budgetAllocationId,
            {
              spentAmount: Number(row.spentAmount || 0),
              linkedExpenses: Number(row.linkedExpenses || 0),
            },
          ]),
        );

        return allocations.map((allocation: any) => {
          const totals = totalsByAllocation.get(allocation.id) || { spentAmount: 0, linkedExpenses: 0 };
          const allocatedAmount = Number(allocation.allocatedAmount || 0);
          return {
            id: allocation.id,
            budgetId: allocation.budgetId,
            categoryName: allocation.categoryName,
            allocatedAmount,
            spentAmount: totals.spentAmount,
            linkedExpenses: totals.linkedExpenses,
            totalLinkedAmount: totals.spentAmount,
            remaining: allocatedAmount - totals.spentAmount,
            utilizationPercentage: allocatedAmount > 0
              ? Math.round((totals.spentAmount / allocatedAmount) * 100)
              : 0,
          };
        });
      } catch (error: any) {
        console.error("Error fetching budget allocation report:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch budget allocation report: ${error?.message || String(error)}`,
        });
      }
    }),

  // ── Recurring Expenses ───────────────────────────────────────────────
  createRecurringExpense: createProcedure
    .input(z.object({
      category: z.string(),
      vendor: z.string().optional(),
      amount: z.number(),
      description: z.string().optional(),
      paymentMethod: paymentModeSchema.optional(),
      frequency: z.enum(['weekly','biweekly','monthly','quarterly','annually']),
      startDate: z.string(),
      endDate: z.string().nullable().optional(),
      dayOfMonth: z.number().min(1).max(28).optional(),
      reminderDaysBefore: z.number().min(0).max(30).optional(),
      chartOfAccountId: z.string().optional(),
      budgetAllocationId: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const id = uuidv4();
      const startDate = new Date(input.startDate);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      await database.insert(recurringExpenses).values({
        id,
        category: input.category,
        vendor: input.vendor ?? null,
        amount: input.amount,
        description: input.description ?? null,
        paymentMethod: input.paymentMethod ?? null,
        frequency: input.frequency,
        startDate: startDate.toISOString().replace('T', ' ').substring(0, 19),
        endDate: input.endDate ? new Date(input.endDate).toISOString().replace('T', ' ').substring(0, 19) : null,
        nextDueDate: startDate.toISOString().replace('T', ' ').substring(0, 19),
        dayOfMonth: input.dayOfMonth ?? startDate.getDate(),
        reminderDaysBefore: input.reminderDaysBefore ?? 3,
        isActive: 1,
        organizationId: ctx.user.organizationId ?? null,
        chartOfAccountId: input.chartOfAccountId ?? null,
        budgetAllocationId: input.budgetAllocationId ?? null,
        createdBy: ctx.user.id,
        createdAt: now as any,
        updatedAt: now as any,
      } as any);

      const rows = await database.select().from(recurringExpenses).where(eq(recurringExpenses.id, id));
      return rows[0];
    }),

  listRecurringExpenses: viewProcedure.query(async () => {
    const database = await getDb();
    if (!database) return [];
    return database.select().from(recurringExpenses).orderBy(desc(recurringExpenses.createdAt));
  }),

  updateRecurringExpense: createProcedure
    .input(z.object({
      id: z.string(),
      isActive: z.boolean().optional(),
      amount: z.number().optional(),
      endDate: z.string().nullable().optional(),
      reminderDaysBefore: z.number().optional(),
      frequency: z.enum(['weekly','biweekly','monthly','quarterly','annually']).optional(),
      category: z.string().max(100).optional(),
      vendor: z.string().max(255).nullable().optional(),
      description: z.string().nullable().optional(),
      paymentMethod: paymentModeSchema.nullable().optional(),
      chartOfAccountId: z.string().nullable().optional(),
      budgetAllocationId: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const updates: any = { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
      if (input.isActive !== undefined) updates.isActive = input.isActive ? 1 : 0;
      if (input.amount !== undefined) updates.amount = input.amount;
      if (input.endDate !== undefined) {
        updates.endDate = input.endDate
          ? new Date(input.endDate).toISOString().replace('T', ' ').substring(0, 19)
          : null;
      }
      if (input.reminderDaysBefore !== undefined) updates.reminderDaysBefore = input.reminderDaysBefore;
      if (input.frequency !== undefined) updates.frequency = input.frequency;
      if (input.category !== undefined) updates.category = input.category;
      if (input.vendor !== undefined) updates.vendor = input.vendor;
      if (input.description !== undefined) updates.description = input.description;
      if (input.paymentMethod !== undefined) updates.paymentMethod = input.paymentMethod;
      if (input.chartOfAccountId !== undefined) updates.chartOfAccountId = input.chartOfAccountId;
      if (input.budgetAllocationId !== undefined) updates.budgetAllocationId = input.budgetAllocationId;

      await database.update(recurringExpenses).set(updates).where(eq(recurringExpenses.id, input.id));
      const rows = await database.select().from(recurringExpenses).where(eq(recurringExpenses.id, input.id));
      return rows[0];
    }),

  deleteRecurringExpense: deleteProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await database.delete(recurringExpenses).where(eq(recurringExpenses.id, input.id));
      return { success: true };
    }),

  getRecurringExpenseById: viewProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const rows = await database.select().from(recurringExpenses).where(eq(recurringExpenses.id, input.id)).limit(1);
      if (!rows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Recurring expense not found" });
      return rows[0];
    }),

  toggleRecurringExpenseActive: createProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      await database.update(recurringExpenses)
        .set({ isActive: input.isActive ? 1 : 0, updatedAt: now } as any)
        .where(eq(recurringExpenses.id, input.id));
      return { success: true };
    }),

  triggerRecurringExpenseGeneration: createProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: recurringExpenseId }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Fetch the recurring expense
      const rows = await database.select().from(recurringExpenses).where(eq(recurringExpenses.id, recurringExpenseId)).limit(1);
      if (!rows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Recurring expense not found" });
      const pattern = rows[0];

      const now = new Date();
      const nowStr = now.toISOString().replace('T', ' ').substring(0, 19);
      const occurrenceDate = parseRecurringOccurrenceDate(pattern.nextDueDate);

      // Generate next expense number
      const expenseNumber = await generateNextExpenseNumber(database);
      const newExpenseId = uuidv4();

      // Create the expense from the recurring template
      await database.insert(expenses).values({
        id: newExpenseId,
        organizationId: pattern.organizationId,
        expenseNumber,
        category: pattern.category,
        vendor: pattern.vendor,
        amount: pattern.amount,
        expenseDate: occurrenceDate.toISOString().replace('T', ' ').substring(0, 19),
        paymentMethod: pattern.paymentMethod,
        description: `${generateRecurringExpenseDescription(
          pattern.description || `Recurring ${pattern.category} expense`,
          occurrenceDate,
        )} (Auto-generated from recurring)`,
        chartOfAccountId: pattern.chartOfAccountId,
        budgetAllocationId: pattern.budgetAllocationId,
        status: 'pending',
        createdBy: ctx.user.id,
        createdAt: nowStr as any,
        updatedAt: nowStr as any,
      } as any);
      if (pattern.chartOfAccountId) {
        await adjustChartOfAccountBalance(database, pattern.chartOfAccountId, Number(pattern.amount || 0), pattern.organizationId);
      }

      // Calculate next due date
      const frequencyDays: Record<string, number> = {
        weekly: 7, biweekly: 14, monthly: 30, quarterly: 90, annually: 365,
      };
      const daysToAdd = frequencyDays[pattern.frequency] || 30;
      const nextDueDate = new Date(pattern.nextDueDate);
      nextDueDate.setDate(nextDueDate.getDate() + daysToAdd);

      // Update recurring expense
      await database.update(recurringExpenses)
        .set({
          nextDueDate: nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
          lastGeneratedDate: nowStr,
          updatedAt: nowStr,
        } as any)
        .where(eq(recurringExpenses.id, recurringExpenseId));

      return { success: true, expenseId: newExpenseId, expenseNumber };
    }),

});
