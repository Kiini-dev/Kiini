import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../db", () => ({
  getPool: vi.fn(),
  getDb: vi.fn(),
  getSetting: vi.fn(),
}));

import { getPool } from "../../db";
import { websiteAdminRouter } from "../websiteAdmin";

describe("websiteAdmin.getWebsiteReport", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps the MySQL pool receiver and returns report metrics", async () => {
    const query = vi.fn(function (this: any, sql: string) {
      if (this !== pool) throw new Error("pool receiver was lost");

      if (sql.startsWith("CREATE TABLE")) return Promise.resolve([[], []]);
      if (sql.includes("COUNT(DISTINCT visitorId)")) {
        return Promise.resolve([[{ visitors: 8, pageViews: 21 }], []]);
      }
      if (sql.includes("COUNT(*) leads")) {
        return Promise.resolve([[{ leads: 3, conversions: 1 }], []]);
      }
      if (sql.includes("GROUP BY path")) return Promise.resolve([[{ path: "/", views: 12 }], []]);
      if (sql.includes("GROUP BY eventName")) return Promise.resolve([[{ eventName: "page_view", count: 21 }], []]);
      if (sql.includes("GROUP BY status")) {
        return Promise.resolve([[{ status: "new", count: 2 }, { status: "converted", count: 1 }], []]);
      }
      return Promise.resolve([[], []]);
    });
    const pool = { query };
    vi.mocked(getPool).mockReturnValue(pool as any);

    const caller = websiteAdminRouter.createCaller({ user: { id: "admin-1", role: "admin" } } as any);
    const report = await caller.getWebsiteReport({ days: 30 });

    expect(report).toMatchObject({
      days: 30,
      visitors: 8,
      pageViews: 21,
      leads: 3,
      conversions: 1,
      topPages: [{ path: "/", views: 12 }],
      events: [{ eventName: "page_view", count: 21 }],
      leadsByStatus: { new: 2, converted: 1 },
    });
    expect(query).toHaveBeenCalledTimes(7);
  });
});