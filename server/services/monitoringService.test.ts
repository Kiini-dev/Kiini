import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../db", () => ({
  getDb: vi.fn(),
  getPool: vi.fn(),
}));

import { getDb, getPool } from "../db";
import { MonitoringService } from "./monitoringService";

describe("MonitoringService database readiness", () => {
  afterEach(() => vi.clearAllMocks());

  it("reports healthy only after the database probe succeeds", async () => {
    const query = vi.fn().mockResolvedValue([[]]);
    vi.mocked(getDb).mockResolvedValue({});
    vi.mocked(getPool).mockReturnValue({ query } as any);
    const service = new MonitoringService({ enabled: false });

    const result = await (service as any).checkDatabase();

    expect(query).toHaveBeenCalledWith("SELECT 1");
    expect(result.status).toBe("healthy");
    expect(result.responseTime).toBeGreaterThanOrEqual(0);
  });

  it("reports unhealthy when the database pool is unavailable", async () => {
    vi.mocked(getDb).mockResolvedValue(null);
    vi.mocked(getPool).mockReturnValue(null);
    const service = new MonitoringService({ enabled: false });

    const result = await (service as any).checkDatabase();

    expect(result.status).toBe("unhealthy");
    expect(result.error).toBe("Database unavailable");
  });

  it("does not expose raw database errors in health responses", async () => {
    const query = vi.fn().mockRejectedValue(new Error("connection password=secret"));
    vi.mocked(getDb).mockResolvedValue({});
    vi.mocked(getPool).mockReturnValue({ query } as any);
    const service = new MonitoringService({ enabled: false });

    const result = await (service as any).checkDatabase();

    expect(result.status).toBe("unhealthy");
    expect(result.error).toBe("Database unavailable");
    expect(result.error).not.toContain("secret");
  });
});