import { afterEach, describe, expect, it, vi } from "vitest";

const { getPoolMock, scheduleMock } = vi.hoisted(() => ({
  getPoolMock: vi.fn(),
  scheduleMock: vi.fn(),
}));

vi.mock("../../db", () => ({
  getPool: getPoolMock,
  createNotification: vi.fn(),
}));
vi.mock("../../services/emailService", () => ({
  sendEmailImmediately: vi.fn(),
}));
vi.mock("node-cron", () => ({
  default: { schedule: scheduleMock },
}));

import {
  initializeHRAutomationRuleSchedules,
  stopHRAutomationRuleSchedules,
} from "../hrAutomation";

describe("HR automation rule scheduler", () => {
  afterEach(() => {
    stopHRAutomationRuleSchedules();
    vi.clearAllMocks();
  });

  it("schedules active rules in Nairobi time and uses the payroll run date", async () => {
    const pool = {
      query: vi.fn().mockResolvedValue([[
        { id: "daily-rule", name: "Daily contract alerts", type: "contract_alert", schedule: "daily" },
        { id: "payroll-rule", name: "Monthly payroll", type: "payroll_generation", schedule: "monthly" },
      ], []]),
    };
    getPoolMock.mockReturnValue(pool);
    scheduleMock.mockImplementation(() => ({ stop: vi.fn() }));

    await initializeHRAutomationRuleSchedules();

    expect(scheduleMock).toHaveBeenCalledWith("0 9 * * *", expect.any(Function), {
      timezone: "Africa/Nairobi",
    });
    expect(scheduleMock).toHaveBeenCalledWith("0 8 21 * *", expect.any(Function), {
      timezone: "Africa/Nairobi",
    });
  });
});
