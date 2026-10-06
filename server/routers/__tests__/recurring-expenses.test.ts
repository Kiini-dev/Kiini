import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));

vi.mock("../../db", () => ({
  getDb: getDbMock,
  logActivity: vi.fn(),
}));
vi.mock("../../utils/chartOfAccountBalance", () => ({
  adjustChartOfAccountBalance: vi.fn(),
  reconcileChartOfAccountBalance: vi.fn(),
}));

import { expensesRouter } from "../expenses";

describe("expenses.createRecurringExpense", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores normalized payment and budget/account assignments for the user's organization", async () => {
    const inserts: Record<string, unknown>[] = [];
    const database = {
      insert: () => ({
        values: async (values: Record<string, unknown>) => {
          inserts.push(values);
        },
      }),
      select: () => {
        const query: any = {
          from: () => query,
          where: () => query,
          orderBy: () => query,
          limit: async () => [],
          then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve(inserts).then(resolve, reject),
        };
        return query;
      },
    };
    getDbMock.mockResolvedValue(database);

    const caller = expensesRouter.createCaller({
      user: { id: "admin-1", role: "super_admin", organizationId: "org-1" },
    } as any);

    await caller.createRecurringExpense({
      category: "Utilities",
      amount: 125000,
      paymentMethod: "m-pesa",
      frequency: "monthly",
      startDate: "2026-09-01T00:00:00Z",
      chartOfAccountId: "coa-1",
      budgetAllocationId: "allocation-1",
    });

    expect(inserts[0]).toMatchObject({
      organizationId: "org-1",
      paymentMethod: "mpesa",
      chartOfAccountId: "coa-1",
      budgetAllocationId: "allocation-1",
    });
  });

  it("normalizes payment aliases when updating a recurring template", async () => {
    const updates: Record<string, unknown>[] = [];
    const database = {
      update: () => ({
        set: (values: Record<string, unknown>) => {
          updates.push(values);
          return { where: async () => undefined };
        },
      }),
      select: () => {
        const query: any = {
          from: () => query,
          where: () => query,
          orderBy: () => query,
          limit: async () => [],
          then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve([]).then(resolve, reject),
        };
        return query;
      },
    };
    getDbMock.mockResolvedValue(database);

    const caller = expensesRouter.createCaller({
      user: { id: "admin-1", role: "super_admin" },
    } as any);

    await caller.updateRecurringExpense({
      id: "recurring-1",
      paymentMethod: "mobile money",
      budgetAllocationId: "allocation-2",
      chartOfAccountId: "coa-2",
    });

    expect(updates[0]).toMatchObject({
      paymentMethod: "mpesa",
      budgetAllocationId: "allocation-2",
      chartOfAccountId: "coa-2",
    });
  });
});
