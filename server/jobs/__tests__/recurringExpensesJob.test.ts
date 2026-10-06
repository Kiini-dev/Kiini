import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, adjustChartOfAccountBalanceMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  adjustChartOfAccountBalanceMock: vi.fn(),
}));

vi.mock("../../db", () => ({ getDb: getDbMock }));
vi.mock("../../utils/chartOfAccountBalance", () => ({
  adjustChartOfAccountBalance: adjustChartOfAccountBalanceMock,
}));

import { generateDueRecurringExpenses } from "../recurringExpensesJob";

describe("generateDueRecurringExpenses", () => {
  beforeEach(() => vi.clearAllMocks());

  it("copies budget and account assignments and labels the scheduled month", async () => {
    const generatedPattern = {
      id: "recurring-1",
      organizationId: "org-1",
      category: "Utilities",
      vendor: "Melitech",
      amount: 125000,
      description: "Monthly Postpaid bill (Director)",
      paymentMethod: "mpesa",
      frequency: "monthly",
      nextDueDate: "2026-09-01 00:00:00",
      dayOfMonth: 1,
      endDate: null,
      chartOfAccountId: "coa-1",
      budgetAllocationId: "allocation-1",
    };
    const expenseInserts: Record<string, unknown>[] = [];
    const database = {
      select: () => {
        const query: any = {
          from: () => query,
          where: () => query,
          orderBy: () => query,
          limit: async () => [],
          then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve([generatedPattern]).then(resolve, reject),
        };
        return query;
      },
      insert: () => ({
        values: async (values: Record<string, unknown>) => {
          expenseInserts.push(values);
        },
      }),
      update: () => ({
        set: () => ({ where: async () => undefined }),
      }),
    };
    getDbMock.mockResolvedValue(database);

    const result = await generateDueRecurringExpenses();

    expect(result.expensesGenerated).toBe(1);
    expect(expenseInserts[0]).toMatchObject({
      organizationId: "org-1",
      chartOfAccountId: "coa-1",
      budgetAllocationId: "allocation-1",
      description: "Monthly Postpaid bill (Director) for September 2026 (Auto-generated from recurring)",
    });
    expect(adjustChartOfAccountBalanceMock).toHaveBeenCalledWith(
      database,
      "coa-1",
      125000,
      "org-1",
    );
  });
});
