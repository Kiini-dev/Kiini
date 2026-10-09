import { beforeEach, describe, expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { clients, contacts } from "../../../drizzle/schema";

const { getDbMock, resolvePermissionMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  resolvePermissionMock: vi.fn(),
}));

vi.mock("../../db", () => ({ getDb: getDbMock }));
vi.mock("../../middleware/enhancedRbac", async (importOriginal) => {
  const actual = await importOriginal<any>();
  const { initTRPC } = await import("@trpc/server");
  const testProcedure = initTRPC.context<any>().create().procedure;
  return {
    ...actual,
    createFeatureRestrictedProcedure: vi.fn(() => testProcedure),
    resolveUserPermission: resolvePermissionMock,
  };
});

import { searchRouter } from "../search";

function makeSearchDatabase(
  conditions: Array<{ table: unknown; condition: unknown }>,
  executedTables: unknown[],
) {
  return {
    select: () => {
      let table: unknown;
      let condition: unknown;
      const query: any = {
        from: (source: unknown) => {
          table = source;
          return query;
        },
        where: (value: unknown) => {
          condition = value;
          conditions.push({ table, condition });
          return query;
        },
        innerJoin: () => query,
        leftJoin: () => query,
        limit: () => query,
        then: (resolve: (value: unknown[]) => unknown, reject: (reason: unknown) => unknown) => {
          executedTables.push(table);
          return Promise.resolve(table === clients
              ? [{ id: "client-1", name: "Scoped Client", email: "client@example.test", phone: null }]
              : [])
            .then(resolve, reject);
        },
      };
      return query;
    },
  };
}

describe("workspace search isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolvePermissionMock.mockReset();
    resolvePermissionMock.mockResolvedValue(false);
  });

  it("limits tenant search results to the caller's organization", async () => {
    resolvePermissionMock.mockImplementation(async (_userId: string, _role: string, _customRoleId: string, feature: string) =>
      feature === "org:clients:view");
    const conditions: Array<{ table: unknown; condition: unknown }> = [];
    const executedTables: unknown[] = [];
    getDbMock.mockResolvedValue(makeSearchDatabase(conditions, executedTables));

    const caller = searchRouter.createCaller({
      user: { id: "tenant-user", role: "admin", organizationId: "tenant-a" },
    } as any);
    const results = await caller.global({ query: "Scoped" });

    expect(results).toMatchObject([{ id: "client-1", type: "client", title: "Scoped Client" }]);
    expect(executedTables).toContain(clients);
    const clientConditions = conditions
      .filter(({ table }) => table === clients || table === contacts)
      .map(({ condition }) => new MySqlDialect().sqlToQuery(condition as any));
    expect(clientConditions.length).toBeGreaterThan(0);
    for (const where of clientConditions) {
      expect(where.params).toContain("tenant-a");
      expect(where.sql.toLowerCase()).not.toContain("is null");
    }
  });

  it("limits global search to records without an organization", async () => {
    resolvePermissionMock.mockImplementation(async (_userId: string, _role: string, _customRoleId: string, feature: string) =>
      feature === "clients:view");
    const conditions: Array<{ table: unknown; condition: unknown }> = [];
    const executedTables: unknown[] = [];
    getDbMock.mockResolvedValue(makeSearchDatabase(conditions, executedTables));

    const caller = searchRouter.createCaller({
      user: { id: "global-user", role: "admin", organizationId: null },
    } as any);
    await caller.global({ query: "Scoped" });
    expect(executedTables).toContain(clients);

    const clientConditions = conditions
      .filter(({ table }) => table === clients || table === contacts)
      .map(({ condition }) => new MySqlDialect().sqlToQuery(condition as any));
    expect(clientConditions.length).toBeGreaterThan(0);
    for (const where of clientConditions) {
      expect(where.sql.toLowerCase()).toContain("is null");
      expect(where.params).not.toContain("tenant-a");
    }
  });

  it("does not execute searches for modules the caller cannot view", async () => {
    const conditions: Array<{ table: unknown; condition: unknown }> = [];
    const executedTables: unknown[] = [];
    getDbMock.mockResolvedValue(makeSearchDatabase(conditions, executedTables));

    const caller = searchRouter.createCaller({
      user: { id: "tenant-user", role: "employee", organizationId: "tenant-a" },
    } as any);
    const results = await caller.global({ query: "Scoped" });

    expect(results.some((result) => result.type === "client" || result.type === "contact")).toBe(false);
    expect(executedTables).not.toContain(clients);
    expect(executedTables).not.toContain(contacts);
  });
});
