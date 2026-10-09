import { beforeEach, describe, expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import {
  accounts,
  customReports,
  invoices,
  journalEntries,
  journalEntryLines,
  subscriptions,
  users,
} from "../../../drizzle/schema";
import { budgetAllocations } from "../../../drizzle/schema-extended";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));

vi.mock("../../db", () => ({ getDb: getDbMock }));
vi.mock("../../middleware/enhancedRbac", async (importOriginal) => {
  const actual = await importOriginal<any>();
  const { initTRPC } = await import("@trpc/server");
  const testProcedure = initTRPC.context<any>().create().procedure;
  return {
    ...actual,
    createFeatureRestrictedProcedure: vi.fn(() => testProcedure),
  };
});

import { budgetsRouter } from "../budgets";
import { financialReportsRouter } from "../financialReports";
import { reportsRouter } from "../reports";
import { reportBuilderRouter } from "../reportBuilder";

const tenantContext = {
  user: { id: "tenant-user", role: "admin", organizationId: "tenant-a" },
} as any;

function makeDatabaseQuery(conditions: any[], results: unknown[] = []) {
  let table: unknown;
  const query: any = {
    from: (source: unknown) => { table = source; return query; },
    where: (condition: any) => {
      if (table !== subscriptions) conditions.push(condition);
      return query;
    },
    leftJoin: () => query,
    innerJoin: () => query,
    groupBy: () => query,
    orderBy: () => query,
    limit: () => query,
    offset: async () => results,
    then: (resolve: (value: unknown[]) => unknown, reject: (reason: unknown) => unknown) => Promise.resolve(results).then(resolve, reject),
  };
  return query;
}

describe("tenant budget and report isolation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("limits the budget list to tenant-owned rows, excluding unowned budgets", async () => {
    const conditions: any[] = [];
    getDbMock.mockResolvedValue({ select: () => makeDatabaseQuery(conditions) });

    const caller = budgetsRouter.createCaller(tenantContext);
    await caller.list({});
    await caller.getById("foreign-budget");
    await caller.getSummary({ fiscalYear: 2026 });

    expect(conditions).toHaveLength(3);
    const where = new MySqlDialect().sqlToQuery(conditions[0]);
    expect(where.params).toContain("tenant-a");
    expect(where.sql.toLowerCase()).not.toContain("is null");

    const detailWhere = new MySqlDialect().sqlToQuery(conditions[1]);
    expect(detailWhere.params).toContain("tenant-a");
    expect(detailWhere.params).toContain("foreign-budget");

    const summaryWhere = new MySqlDialect().sqlToQuery(conditions[2]);
    expect(summaryWhere.params).toContain("tenant-a");
  });

  it("includes posted payroll debits in budget-line actuals by account and department", async () => {
    const conditions: Array<{ source: unknown; condition: any }> = [];
    const budgetLine = {
      id: "allocation-1",
      budgetId: "budget-1",
      accountId: "salary-account",
      categoryName: "Staff Salaries",
      allocatedAmount: 100_000,
      spentAmount: 10_000,
      notes: null,
      departmentId: "department-1",
      fiscalYear: 2026,
    };
    const database = {
      select: () => {
        let source: unknown;
        const query: any = {
          from: (table: unknown) => { source = table; return query; },
          innerJoin: () => query,
          leftJoin: () => query,
          where: (condition: any) => {
            conditions.push({ source, condition });
            return query;
          },
          groupBy: () => query,
          orderBy: () => query,
          then: (resolve: (value: unknown[]) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve(source === budgetAllocations
              ? [budgetLine]
              : source === journalEntryLines
                ? [{ accountId: "salary-account", spentAmount: 25_000 }]
                : []).then(resolve, reject),
        };
        return query;
      },
    };
    getDbMock.mockResolvedValue(database);

    const caller = budgetsRouter.createCaller(tenantContext);
    const result = await caller.listLines("budget-1");

    expect(result).toMatchObject([{
      accountId: "salary-account",
      allocatedAmount: 100_000,
      spentAmount: 35_000,
      remainingAmount: 65_000,
      utilizationPercentage: 35,
    }]);

    const payrollWhere = conditions.find(({ source }) => source === journalEntryLines)?.condition;
    const payrollQuery = new MySqlDialect().sqlToQuery(payrollWhere);
    expect(payrollQuery.params).toEqual(expect.arrayContaining([
      "payroll",
      "posted",
      "tenant-a",
      "department-1",
      "2026-01-01",
      "2027-01-01",
    ]));
    expect(payrollQuery.sql).toContain(journalEntries.organizationId.name);
  });

  it("keeps global budget-line reads scoped to global records", async () => {
    const conditions: any[] = [];
    getDbMock.mockResolvedValue({ select: () => makeDatabaseQuery(conditions) });

    const caller = budgetsRouter.createCaller({
      user: { id: "global-user", role: "admin", organizationId: null },
    } as any);
    await caller.listLines("global-budget");

    expect(conditions).toHaveLength(1);
    const where = new MySqlDialect().sqlToQuery(conditions[0]);
    expect(where.sql.toLowerCase()).toContain("is null");
    expect(where.params).not.toContain("tenant-a");
  });

  it("filters balance sheet accounts by the caller's organization", async () => {
    const conditions: any[] = [];
    getDbMock.mockResolvedValue({ select: () => makeDatabaseQuery(conditions) });

    const caller = financialReportsRouter.createCaller(tenantContext);
    await caller.balanceSheet();

    expect(conditions).toHaveLength(1);
    const where = new MySqlDialect().sqlToQuery(conditions[0]);
    expect(where.sql).toContain(accounts.organizationId.name);
    expect(where.params).toContain("tenant-a");
  });

  it("filters custom report data by the caller's organization", async () => {
    const conditions: any[] = [];
    getDbMock.mockResolvedValue({ select: () => makeDatabaseQuery(conditions) });

    const caller = reportsRouter.createCaller(tenantContext);
    await caller.getReportData({ table: "invoices", fields: [], limit: 10, offset: 0 });

    expect(conditions).toHaveLength(1);
    const where = new MySqlDialect().sqlToQuery(conditions[0]);
    expect(where.sql).toContain(invoices.organizationId.name);
    expect(where.params).toContain("tenant-a");
  });

  it("only lists saved reports created by users in the caller's organization", async () => {
    const conditions: Array<{ table: unknown; condition: any }> = [];
    const database = {
      select: () => {
        let table: unknown;
        const query: any = {
          from: (source: unknown) => { table = source; return query; },
          where: (condition: any) => { conditions.push({ table, condition }); return query; },
          orderBy: () => query,
          then: (resolve: (value: unknown[]) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve(table === users ? [{ id: "tenant-user" }] : []).then(resolve, reject),
        };
        return query;
      },
    };
    getDbMock.mockResolvedValue(database);

    const caller = reportBuilderRouter.createCaller(tenantContext);
    await caller.getReports({});

    const userFilter = conditions.find(({ table }) => table === users);
    const reportFilter = conditions.find(({ table }) => table === customReports);
    expect(new MySqlDialect().sqlToQuery(userFilter!.condition).params).toContain("tenant-a");
    expect(new MySqlDialect().sqlToQuery(reportFilter!.condition).params).toContain("tenant-user");
  });
});