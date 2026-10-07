import { afterEach, describe, expect, it, vi } from "vitest";

const { getPoolMock, getDbMock } = vi.hoisted(() => ({
  getPoolMock: vi.fn(),
  getDbMock: vi.fn().mockResolvedValue(null),
}));

vi.mock("../../db", () => ({ getPool: getPoolMock, getDb: getDbMock }));

import { taxComplianceRouter } from "../taxCompliance";

describe("tax compliance reports", () => {
  afterEach(() => vi.clearAllMocks());

  it("loads NSSF and housing reports using stable pay periods without employee joins", async () => {
    const rows = [{
      employeeId: "employee-1",
      payPeriod: "2026-06",
      grossSalary: 110000,
      paye: 18000,
      nssf: 6000,
      nhif: 2500,
      shif: 2500,
      housingLevy: 1500,
      deductionsBreakdown: null,
    }];
    const query = vi.fn().mockResolvedValue([rows, []]);
    getPoolMock.mockReturnValue({ query });

    const caller = taxComplianceRouter.createCaller({
      user: { id: "hr-1", role: "super_admin", organizationId: "org-1" },
    } as any);
    const nssfReport = await caller.getNSSFReport({
      from: new Date("2026-01-01T00:00:00.000Z"),
      to: new Date("2026-10-03T00:00:00.000Z"),
    });
    const report = await caller.getHousingLevyReport({
      from: new Date("2026-01-01T00:00:00.000Z"),
      to: new Date("2026-10-03T00:00:00.000Z"),
    });

    expect(nssfReport).toEqual([{ month: "2026-06", totalNSSF: 6000 }]);
    expect(report).toEqual([{ month: "2026-06", totalHousing: 1500 }]);
    expect(query).toHaveBeenCalledTimes(2);
    for (const [sql, params] of query.mock.calls) {
      expect(sql).toContain("SELECT p.*");
      expect(sql).toContain("p.payPeriod BETWEEN ? AND ?");
      expect(sql).not.toContain("JOIN employees");
      expect(sql).not.toMatch(/p\.(bonuses|payeDeduction|nssfDeduction|nhifDeduction|payMonth)/);
      expect(params).toEqual(["2026-01", "2026-10", "org-1"]);
    }
  });

  it("applies the selected employee to statutory report queries", async () => {
    const query = vi.fn().mockResolvedValue([[], []]);
    getPoolMock.mockReturnValue({ query });
    const caller = taxComplianceRouter.createCaller({
      user: { id: "hr-1", role: "super_admin", organizationId: "org-1" },
    } as any);

    await caller.getPAYEReport({
      from: new Date("2026-01-01T00:00:00.000Z"),
      to: new Date("2026-12-31T23:59:59.999Z"),
      employeeId: "employee-1",
    });

    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0][0]).toContain("p.employeeId = ?");
    expect(query.mock.calls[0][1]).toEqual(["2026-01", "2026-12", "org-1", "employee-1"]);
  });
});