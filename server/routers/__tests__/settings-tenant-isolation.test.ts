import { beforeEach, describe, expect, it, vi } from "vitest";
import { organizationSettings, settings } from "../../../drizzle/schema";

const { fakeDatabase, getDbMock, insertedRows, rowsByTable } = vi.hoisted(() => {
  const insertedRows: Array<{ table: unknown; values: Record<string, unknown> }> = [];
  const rowsByTable = new Map<unknown, Array<Record<string, unknown>>>();
  const database = {
    select: () => ({
      from: (table: unknown) => {
        const rows = rowsByTable.get(table) ?? [];
        const query: any = {
          where: () => query,
          orderBy: () => query,
          limit: async () => rows,
          then: (resolve: (value: unknown[]) => unknown, reject: (reason: unknown) => unknown) => Promise.resolve(rows).then(resolve, reject),
        };
        return query;
      },
    }),
    insert: (table: unknown) => ({
      values: async (values: Record<string, unknown>) => {
        insertedRows.push({ table, values });
      },
    }),
    update: () => ({ set: () => ({ where: async () => undefined }) }),
  };

  return {
    fakeDatabase: database,
    getDbMock: vi.fn(async () => database),
    insertedRows,
    rowsByTable,
  };
});

vi.mock("../../db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../db")>()),
  getDb: getDbMock,
}));

import { settingsRouter } from "../settings";

const createCaller = (organizationId?: string) => settingsRouter.createCaller({
  user: {
    id: organizationId ? "org-admin" : "platform-admin",
    role: "super_admin",
    organizationId,
  },
} as any);

describe("settings tenant isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rowsByTable.clear();
    insertedRows.length = 0;
    getDbMock.mockResolvedValue(fakeDatabase as any);
  });

  it("reads organization categories without returning platform category values", async () => {
    rowsByTable.set(settings, [{ key: "list", value: '[{"name":"Platform category"}]' }]);
    rowsByTable.set(organizationSettings, [{ key: "list", value: '[{"name":"Tenant category"}]' }]);

    const result = await createCaller("org_a").getByCategory({ category: "clients_categories" });

    expect(result.list).toContain("Tenant category");
    expect(result.list).not.toContain("Platform category");
  });

  it("writes organization categories with the authenticated organization id", async () => {
    await createCaller("org_a").updateByCategory({
      category: "clients_categories",
      values: { list: "tenant categories" },
    });

    expect(insertedRows).toContainEqual({
      table: organizationSettings,
      values: expect.objectContaining({
        organizationId: "org_a",
        category: "clients_categories",
        key: "list",
        value: "tenant categories",
      }),
    });
    expect(insertedRows.some((row) => row.table === settings)).toBe(false);
  });

  it("keeps platform category reads on the platform settings table", async () => {
    rowsByTable.set(settings, [{ key: "list", value: "platform categories" }]);

    const result = await createCaller().getByCategory({ category: "clients_categories" });

    expect(result.list).toBe("platform categories");
  });
});
