import { beforeEach, describe, expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { invoices, payments } from "../../../drizzle/schema";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));

vi.mock("../../db", () => ({ getDb: getDbMock, getRawPool: vi.fn() }));

import { dashboardRouter } from "../dashboard";

describe("dashboard.financialSummary tenant isolation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("scopes each payment and invoice card query to the authenticated organization", async () => {
    const whereConditions: Array<{ table: unknown; condition: any }> = [];
    const rowsByTable = new Map<unknown, any[]>([
      [payments, [{ amount: 12500 }]],
      [invoices, [{ total: 30000 }]],
    ]);
    const database = {
      select: () => ({
        from: (table: unknown) => ({
          where: (condition: any) => {
            if (table === payments || table === invoices) whereConditions.push({ table, condition });
            const query = {
              orderBy: () => query,
              limit: async () => rowsByTable.get(table) || [],
            };
            return query;
          },
        }),
      }),
    };
    getDbMock.mockResolvedValue(database);

    const caller = dashboardRouter.createCaller({
      user: { id: "tenant-user", organizationId: "org-tenant" },
    } as any);
    const result = await caller.financialSummary();

    expect(result).toEqual({
      paymentsToday: 12500,
      paymentsMonth: 12500,
      invoicesDue: 30000,
      invoicesOverdue: 30000,
    });
    expect(whereConditions).toHaveLength(4);

    const dialect = new MySqlDialect();
    for (const { table, condition } of whereConditions) {
      const query = dialect.sqlToQuery(condition);
      expect(table === payments || table === invoices).toBe(true);
      expect(query.sql).toContain("organizationId");
      expect(query.params).toContain("org-tenant");
    }
  });
});