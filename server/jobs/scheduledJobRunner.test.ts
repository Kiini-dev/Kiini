import { afterEach, describe, expect, it, vi } from "vitest";

const { processPayrollMock, processAndDispatchMock, generateP9Mock, getPoolMock } = vi.hoisted(() => ({
  processPayrollMock: vi.fn(),
  processAndDispatchMock: vi.fn(),
  generateP9Mock: vi.fn(),
  getPoolMock: vi.fn(),
}));

vi.mock("./payrollJobs", () => ({
  processMonthlyPayroll: processPayrollMock,
  processAndDispatchPayslips: processAndDispatchMock,
}));
vi.mock("./p9Jobs", () => ({ generateAnnualP9Forms: generateP9Mock }));
vi.mock("../db", () => ({ getPool: getPoolMock }));

import { closeScheduledJobConnections, runScheduledJob } from "./scheduledJobRunner";

describe("standalone scheduled job runner", () => {
  afterEach(() => vi.clearAllMocks());

  it("uses the Nairobi calendar when selecting the current payroll period", async () => {
    await runScheduledJob("payroll-process", undefined, new Date("2026-05-31T21:30:00.000Z"));
    expect(processPayrollMock).toHaveBeenCalledWith(2026, 6, "system-cron");
  });

  it("does not dispatch payslips on a non-month-end tick", async () => {
    const result = await runScheduledJob("payslip-dispatch", undefined, new Date("2026-06-28T00:00:00.000Z"));
    expect(result).toEqual({ dispatched: 0, errors: [], skipped: true });
    expect(processAndDispatchMock).not.toHaveBeenCalled();
  });

  it("dispatches the requested period for external cron execution", async () => {
    processAndDispatchMock.mockResolvedValue({ processed: 0, skipped: 3, dispatched: 3, errors: [] });
    await runScheduledJob("payslip-dispatch", "2026-06");
    expect(processAndDispatchMock).toHaveBeenCalledWith(2026, 6);
  });

  it("defaults P9 generation to the prior Nairobi tax year", async () => {
    await runScheduledJob("p9-generate", undefined, new Date("2027-01-01T00:00:00.000Z"));
    expect(generateP9Mock).toHaveBeenCalledWith(2026, "system-cron");
  });

  it("closes the shared database pool after a standalone run", async () => {
    const end = vi.fn().mockResolvedValue(undefined);
    getPoolMock.mockReturnValue({ end });
    await closeScheduledJobConnections();
    expect(end).toHaveBeenCalledOnce();
  });
});