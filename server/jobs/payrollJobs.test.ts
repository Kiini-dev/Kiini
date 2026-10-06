import { afterEach, describe, expect, it, vi } from "vitest";

const {
  getDbMock,
  getPoolMock,
  createNotificationMock,
  getCompanyInfoMock,
  sendEmailImmediatelyMock,
} = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  getPoolMock: vi.fn(),
  createNotificationMock: vi.fn(),
  getCompanyInfoMock: vi.fn(),
  sendEmailImmediatelyMock: vi.fn(),
}));

vi.mock("../db", () => ({
  getDb: getDbMock,
  getPool: getPoolMock,
  createNotification: createNotificationMock,
}));
vi.mock("../utils/company-info", () => ({ getCompanyInfo: getCompanyInfoMock }));
vi.mock("../services/emailService", () => ({ sendEmailImmediately: sendEmailImmediatelyMock }));

import { employees, payroll, users } from "../../drizzle/schema";
import { dispatchPayslips } from "./payrollJobs";

describe("dispatchPayslips", () => {
  afterEach(() => vi.clearAllMocks());

  it("persists a schema-valid payslip and marks it sent after email delivery", async () => {
    const payrollRecord = {
      id: "payroll-1",
      employeeId: "employee-1",
      payPeriodStart: "2026-06-01 00:00:00",
      status: "processed",
      basicSalary: 5000000,
      allowances: 0,
      deductions: 1000000,
      tax: 500000,
      netSalary: 4000000,
      notes: JSON.stringify({ grossSalary: 5000000, paye: 500000, nssf: 300000, shif: 100000, housingLevy: 75000 }),
    };
    const employee = {
      id: "employee-1",
      organizationId: "org-1",
      firstName: "Amina",
      lastName: "Otieno",
      employeeNumber: "EMP-1",
      email: "amina@example.test",
      bankName: "Example Bank",
      bankAccountNumber: "1234",
    };
    const database = {
      select: vi.fn(() => ({
        from: vi.fn((table: unknown) => ({
          where: vi.fn(async () => table === payroll ? [payrollRecord] : table === employees ? [employee] : table === users ? [] : []),
        })),
      })),
    };
    const insertCalls: Array<{ sql: string; values: unknown[] }> = [];
    let savedStatus: string | undefined;
    const pool = {
      query: vi.fn(async (query: string, values: unknown[] = []) => {
        if (query.startsWith("INSERT INTO payslips")) {
          insertCalls.push({ sql: query, values });
          return [{ affectedRows: 1 }, []];
        }
        if (query.startsWith("SELECT id, status FROM payslips")) {
          return [savedStatus ? [{ id: "payslip-1", status: savedStatus }] : [], []];
        }
        if (query.startsWith("SELECT id FROM users")) return [[], []];
        if (query.includes("status = 'sent'")) savedStatus = "sent";
        return [[], []];
      }),
    };
    getDbMock.mockResolvedValue(database);
    getPoolMock.mockReturnValue(pool);
    getCompanyInfoMock.mockResolvedValue({ name: "Kiini", address: "", logo: "" });
    sendEmailImmediatelyMock.mockResolvedValue(undefined);

    const result = await dispatchPayslips(2026, 6);

    expect(result).toEqual({ dispatched: 1, errors: [] });
    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0].sql).toContain("payeDeduction");
    expect(insertCalls[0].sql).not.toMatch(/grossPay|netPay|totalAllowances/);
    expect(insertCalls[0].sql.match(/\?/g)).toHaveLength(insertCalls[0].values.length);
    expect(sendEmailImmediatelyMock).toHaveBeenCalledOnce();
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("status = 'sent'"),
      ["employee-1", "2026-06"],
    );

    const retry = await dispatchPayslips(2026, 6);
    expect(retry.dispatched).toBe(0);
    expect(sendEmailImmediatelyMock).toHaveBeenCalledOnce();
  });
});