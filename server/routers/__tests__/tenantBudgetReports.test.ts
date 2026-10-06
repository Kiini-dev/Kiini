import { beforeEach, describe, expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { accounts, customReports, invoices, subscriptions, users } from "../../../drizzle/schema";

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