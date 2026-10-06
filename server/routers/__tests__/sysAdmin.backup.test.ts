import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, logActivityMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  logActivityMock: vi.fn(),
}));

vi.mock("../../db", () => ({
  getDb: getDbMock,
  logActivity: logActivityMock,
}));
vi.mock("../../data/tableRegistry", () => ({
  getBackupTableRegistry: () => [],
}));

import { sysAdminRouter } from "../sysAdmin";

describe("sysAdmin.createBackup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logActivityMock.mockResolvedValue(undefined);
  });

  it("runs a manual backup without requiring a cron schedule", async () => {
    const database = { execute: vi.fn().mockResolvedValue(undefined) };
    getDbMock.mockResolvedValue(database);
    const caller = sysAdminRouter.createCaller({
      user: { id: "admin-1", email: "admin@example.com", role: "super_admin" },
    } as any);

    const result = await caller.createBackup({ name: "Manual backup" });

    expect(result.success).toBe(true);
    expect(result.backup.metadata.name).toBe("Manual backup");
    expect(database.execute).toHaveBeenCalledTimes(2);
  });
});
