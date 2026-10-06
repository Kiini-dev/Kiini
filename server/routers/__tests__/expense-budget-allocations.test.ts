import { beforeEach, describe, expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { expenses } from "../../../drizzle/schema";
import { budgetAllocations } from "../../../drizzle/schema-extended";

const { getDbMock, logActivityMock, reconcileChartOfAccountBalanceMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  logActivityMock: vi.fn(),
  reconcileChartOfAccountBalanceMock: vi.fn(),
}));

vi.mock("../../db", () => ({ getDb: getDbMock, logActivity: logActivityMock }));
vi.mock("../../utils/chartOfAccountBalance", () => ({
  adjustChartOfAccountBalance: vi.fn(),
  reconcileChartOfAccountBalance: reconcileChartOfAccountBalanceMock,
}));

import { expensesRouter } from "../expenses";

describe("expenses.getAvailableBudgetAllocations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows expense creators to load the allocation selector", async () => {
    getDbMock.mockResolvedValue(null);
    const caller = expensesRouter.createCaller({
      user: { id: "staff-1", role: "staff" },
    } as any);

    await expect(caller.getAvailableBudgetAllocations({})).resolves.toEqual([]);
  });

  it("allows expense creators to use the budget assignment action", async () => {
    getDbMock.mockResolvedValue(null);
    const caller = expensesRouter.createCaller({
      user: { id: "staff-1", role: "staff" },
    } as any);

    await expect(caller.updateBudgetAllocation({
      expenseId: "expense-1",
      budgetAllocationId: "allocation-1",
    })).rejects.toThrow("Database not available");
  });

  it("updates allocation totals with Date values for Date-mode timestamps", async () => {
    const expense = {
      id: "expense-1",
      amount: 1000,
      budgetAllocationId: null,
      organizationId: null,
    };
    const allocation = {
      id: "allocation-1",
      budgetId: "budget-1",
      allocatedAmount: 100000,
    };
    const responses = [
      [expense],
      [allocation],
      [{ id: "budget-1", organizationId: null }],
      [{ spent: 0 }],
      [allocation],
      [{ spent: 0 }],
      [{ id: "allocation-1", budgetId: "budget-1" }],
      [{ id: "allocation-1", allocated: 100000, spent: 1000 }],
      [{ amount: 100000 }],
    ];
    const updates: Array<{ table: unknown; values: Record<string, unknown> }> = [];
    const database = {
      select: () => {
        const response = responses.shift();
        const query: any = {
          from: () => query,
          where: () => query,
          leftJoin: () => query,
          groupBy: () => query,
          limit: async () => response,
          then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve(response).then(resolve, reject),
        };
        return query;
      },
      update: (table: unknown) => ({
        set: (values: Record<string, unknown>) => {
          updates.push({ table, values });
          return { where: async () => undefined };
        },
      }),
    };
    getDbMock.mockResolvedValue(database);

    const caller = expensesRouter.createCaller({
      user: { id: "admin-1", role: "super_admin" },
    } as any);

    await expect(caller.updateBudgetAllocation({
      expenseId: expense.id,
      budgetAllocationId: allocation.id,
    })).resolves.toEqual({ success: true, message: "Budget allocation updated" });

    const allocationUpdate = updates.find(({ table }) => table === budgetAllocations);
    expect(allocationUpdate?.values.updatedAt).toBeInstanceOf(Date);
    expect(responses).toHaveLength(0);
  });

  it("returns existing lines for selected budgets regardless of budget status", async () => {
    const allocation = {
      id: "allocation-1",
      budgetId: "budget-approved",
      accountId: "account-1",
      departmentId: "department-1",
      departmentName: "Administration",
      fiscalYear: 2026,
      categoryName: "Utilities",
      allocatedAmount: 300000,
      spentAmount: 50000,
      notes: null,
      remaining: 250000,
    };
    const conditions: any[] = [];
    let selectCount = 0;
    const database = {
      select: () => {
        selectCount += 1;
        const queryNumber = selectCount;
        return {
          from: (table: unknown) => {
            if (queryNumber === 2) {
              expect(table).toBe(expenses);
              const totalsQuery: any = {
                where: () => totalsQuery,
                groupBy: async () => [{ budgetAllocationId: "allocation-1", spentAmount: 50000 }],
              };
              return totalsQuery;
            }
            const query: any = {
              leftJoin: () => query,
              where: (condition: any) => { conditions.push(condition); return query; },
              orderBy: async () => [allocation],
            };
            return query;
          },
        };
      },
    };
    getDbMock.mockResolvedValue(database);

    const caller = expensesRouter.createCaller({ user: { id: "admin-1", role: "super_admin" } } as any);
    const result = await caller.getAvailableBudgetAllocations({ budgetId: "budget-approved" });

    expect(result).toMatchObject([{
      id: "allocation-1",
      budgetId: "budget-approved",
      accountId: "account-1",
      categoryName: "Utilities",
      spentAmount: 50000,
      remaining: 250000,
    }]);
    expect(selectCount).toBe(2);
    const whereQuery = new MySqlDialect().sqlToQuery(conditions[0]);
    expect(whereQuery.sql).not.toContain("budgetStatus");
    expect(whereQuery.params).toContain("budget-approved");
  });
});

describe("expenses.getBudgetAllocationReport", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns allocation totals and zero utilization when there are no linked expenses", async () => {
    const allocation = {
      id: "allocation-1",
      budgetId: "budget-1",
      categoryName: "Utilities",
      allocatedAmount: 2500000,
    };
    const emptyAllocation = {
      id: "allocation-2",
      budgetId: "budget-1",
      categoryName: "Travel",
      allocatedAmount: 0,
    };
    const selections: unknown[] = [
      [allocation, emptyAllocation],
      [{ budgetAllocationId: "allocation-1", spentAmount: 500000, linkedExpenses: 2 }],
    ];
    const database = {
      select: () => {
        const rows = selections.shift();
        const query: any = {
          from: () => query,
          innerJoin: () => query,
          where: () => query,
          groupBy: () => query,
          then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve(rows).then(resolve, reject),
        };
        return query;
      },
    };
    getDbMock.mockResolvedValue(database);
    const caller = expensesRouter.createCaller({
      user: { id: "admin-1", role: "super_admin" },
    } as any);

    await expect(caller.getBudgetAllocationReport({})).resolves.toEqual([{
      id: "allocation-1",
      budgetId: "budget-1",
      categoryName: "Utilities",
      allocatedAmount: 2500000,
      spentAmount: 500000,
      linkedExpenses: 2,
      totalLinkedAmount: 500000,
      remaining: 2000000,
      utilizationPercentage: 20,
    }, {
      id: "allocation-2",
      budgetId: "budget-1",
      categoryName: "Travel",
      allocatedAmount: 0,
      spentAmount: 0,
      linkedExpenses: 0,
      totalLinkedAmount: 0,
      remaining: 0,
      utilizationPercentage: 0,
    }]);
  });
});

describe("expenses.update budget validation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects an over-budget update before changing the expense", async () => {
    const oldExpense = {
      id: "expense-1",
      budgetAllocationId: "allocation-1",
      amount: 10000,
      chartOfAccountId: null,
      organizationId: null,
      category: "Utilities",
    };
    let selectCall = 0;
    const database = {
      select: () => {
        selectCall += 1;
        const call = selectCall;
        const query: any = {
          from: (table: unknown) => {
            expect(table).toBe(call === 2 ? budgetAllocations : expenses);
            return query;
          },
          where: () => call === 3 ? Promise.resolve([{ spent: 0 }]) : query,
          limit: async () => call === 1 ? [oldExpense] : [{ allocatedAmount: 3000000 }],
        };
        return query;
      },
      update: vi.fn(),
    };
    getDbMock.mockResolvedValue(database);

    const caller = expensesRouter.createCaller({
      user: { id: "admin-1", role: "super_admin" },
    } as any);

    await expect(caller.update({
      id: oldExpense.id,
      amount: 3000001,
    })).rejects.toThrow("Insufficient budget. Available: Ksh 30,000");
    expect(database.update).not.toHaveBeenCalled();
  });

  it("persists a changed chart-of-accounts assignment", async () => {
    const oldExpense = {
      id: "expense-1",
      budgetAllocationId: null,
      amount: 10000,
      chartOfAccountId: "account-old",
      organizationId: null,
      category: "Utilities",
    };
    const updateWhere = vi.fn().mockResolvedValue(undefined);
    const updateSet = vi.fn(() => ({ where: updateWhere }));
    const database = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [oldExpense],
          }),
        }),
      }),
      update: vi.fn(() => ({ set: updateSet })),
    };
    getDbMock.mockResolvedValue(database);

    const caller = expensesRouter.createCaller({
      user: { id: "admin-1", role: "super_admin" },
    } as any);

    await caller.update({ id: oldExpense.id, chartOfAccountId: "account-new" });

    expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({
      chartOfAccountId: "account-new",
    }));
    expect(reconcileChartOfAccountBalanceMock).toHaveBeenCalledWith(
      database,
      "account-old",
      oldExpense.amount,
      "debit",
      "account-new",
      oldExpense.amount,
      "debit",
      undefined,
    );
  });
});