import { afterEach, describe, expect, it, vi } from "vitest";

const {
  getDbMock,
  getPoolMock,
  createNotificationMock,
  getCompanyInfoMock,
  sendEmailImmediatelyMock,
  recordPayrollCostAllocationMock,
  findActiveBudgetMock,
  checkBudgetMock,
  deductFromBudgetMock,
} = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  getPoolMock: vi.fn(),
  createNotificationMock: vi.fn(),
  getCompanyInfoMock: vi.fn(),
  sendEmailImmediatelyMock: vi.fn(),
  recordPayrollCostAllocationMock: vi.fn(),
  findActiveBudgetMock: vi.fn(),
  checkBudgetMock: vi.fn(),
  deductFromBudgetMock: vi.fn(),
}));

vi.mock("../db", () => ({
  getDb: getDbMock,
  getPool: getPoolMock,
  createNotification: createNotificationMock,
}));
vi.mock("../utils/company-info", () => ({ getCompanyInfo: getCompanyInfoMock }));
vi.mock("../services/emailService", () => ({ sendEmailImmediately: sendEmailImmediatelyMock }));
vi.mock("../services/payrollCostAllocationService", () => ({
  recordPayrollCostAllocation: recordPayrollCostAllocationMock,
}));
vi.mock("../utils/budgetEnforcer", () => ({
  findActiveBudget: findActiveBudgetMock,
  checkBudget: checkBudgetMock,
  deductFromBudget: deductFromBudgetMock,
}));

import { departments, employees, jobGroups, payroll, users } from "../../drizzle/schema";
import { salaryStructures } from "../../drizzle/schema-extended";
import { dispatchPayslips, processAndPayPayroll, processMonthlyPayroll } from "./payrollJobs";

describe("dispatchPayslips", () => {
  afterEach(() => vi.clearAllMocks());

  it("charges the employee's department budget when payroll accounting allocation is unavailable", async () => {
    const employee = {
      id: "employee-1",
      organizationId: "org-1",
      firstName: "Amina",
      lastName: "Otieno",
      department: "Engineering",
      salary: 50000,
      jobGroupId: "group-1",
      status: "active",
    };
    const dbRows = (table: unknown) => table === employees
      ? [employee]
      : table === departments
        ? [{ id: "department-1", name: "Engineering", organizationId: "org-1" }]
        : [];
    const resultFor = (table: unknown) => {
      const rows = dbRows(table);
      return {
        limit: async () => table === payroll ? [] : rows,
        orderBy: () => ({ limit: async () => rows }),
        then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
      };
    };
    const db = {
      select: vi.fn(() => ({
        from: vi.fn((table: unknown) => ({
          where: vi.fn(() => resultFor(table)),
          then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(dbRows(table)).then(resolve),
        })),
      })),
      transaction: vi.fn(async (callback: (transaction: any) => Promise<unknown>) => callback({
        insert: vi.fn(() => ({ values: vi.fn(async () => undefined) })),
      })),
    };
    getDbMock.mockResolvedValue(db);
    getPoolMock.mockReturnValue({ query: vi.fn(async () => [[], []]) });
    recordPayrollCostAllocationMock.mockRejectedValue(new Error("No effective cost allocation is configured"));
    findActiveBudgetMock.mockResolvedValue({ budgetId: "budget-1" });

    const result = await processMonthlyPayroll(2026, 6, "user-1", "org-1");

    expect(findActiveBudgetMock).toHaveBeenCalledWith(expect.anything(), "org-1", "department-1", 2026);
    expect(checkBudgetMock).toHaveBeenCalledWith(expect.anything(), expect.any(Number), "org-1", expect.objectContaining({
      budgetId: "budget-1",
      departmentId: "department-1",
    }));
    expect(deductFromBudgetMock).toHaveBeenCalledWith(expect.anything(), "budget-1", expect.any(Number));
    expect(result.errors[0]).toContain("department budget was charged using the employee's department");
  });

  it("uses the global payslip template and marks the payslip sent after email delivery", async () => {
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
      organizationId: null,
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
        if (query.includes("FROM documentTemplates")) {
          return [[{
            content: "<!doctype html><html><body><main class=\"configured-payslip\">{{employee_name}}|${gross_salary}|[pay_period]</main></body></html>",
          }], []];
        }
        if (query.startsWith("INSERT INTO payslips")) {
          insertCalls.push({ sql: query, values });
          savedStatus = "generated";
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
    sendEmailImmediatelyMock
      .mockRejectedValueOnce(new Error("SMTP unavailable"))
      .mockResolvedValue({ success: true, messageId: "message-1" });

    const failedAttempt = await dispatchPayslips(2026, 6);

    expect(failedAttempt).toEqual({
      dispatched: 0,
      errors: ["Failed to deliver payslip to amina@example.test: SMTP unavailable"],
    });
    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0].sql).toContain("payeDeduction");
    expect(insertCalls[0].sql).not.toMatch(/grossPay|netPay|totalAllowances/);
    expect(insertCalls[0].sql.match(/\?/g)).toHaveLength(insertCalls[0].values.length);
    expect(sendEmailImmediatelyMock).toHaveBeenCalledOnce();
    expect(sendEmailImmediatelyMock.mock.calls[0][0]).toMatchObject({
      htmlContent: expect.stringContaining('<main class="configured-payslip">Amina Otieno|KES 50,000.00|2026-06</main>'),
    });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("organizationId IS NULL"),
    );

    const result = await dispatchPayslips(2026, 6);
    expect(result).toEqual({ dispatched: 1, errors: [] });
    expect(insertCalls).toHaveLength(1);
    expect(sendEmailImmediatelyMock).toHaveBeenCalledTimes(2);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("status = 'sent'"),
      ["employee-1", "2026-06"],
    );

    const retry = await dispatchPayslips(2026, 6);
    expect(retry.dispatched).toBe(0);
    expect(sendEmailImmediatelyMock).toHaveBeenCalledTimes(2);
  });

  it("marks only payroll records with a generated payslip as paid, scoped to the organization", async () => {
    const pool = {
      query: vi.fn(async () => [{ affectedRows: 3 }, []]),
    };
    getDbMock.mockResolvedValue(null);
    getPoolMock.mockReturnValue(pool);

    const result = await processAndPayPayroll(2026, 6, "user-1", "org-1");

    expect(result).toEqual({
      processed: 0,
      skipped: 0,
      dispatched: 0,
      markedPaid: 3,
      errors: ["Payroll: Database not available", "Database not available"],
    });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INNER JOIN payslips s ON CONVERT(s.payrollId USING utf8mb4) COLLATE utf8mb4_unicode_ci = CONVERT(p.id USING utf8mb4) COLLATE utf8mb4_unicode_ci AND s.payPeriod = ?"),
      [
        "2026-06",
        expect.any(String),
        expect.any(String),
        "2026-06-01 00:00:00",
        "org-1",
      ],
    );
    expect(pool.query.mock.calls[0][0]).toContain("CONVERT(e.id USING utf8mb4) COLLATE utf8mb4_unicode_ci = CONVERT(p.employeeId USING utf8mb4) COLLATE utf8mb4_unicode_ci");
    expect(pool.query.mock.calls[0][0]).toContain("e.organizationId = ?");
  });

  it("returns generated payroll counts when the final paid-status update fails", async () => {
    const pool = {
      query: vi.fn(async () => {
        throw new Error("database collation mismatch");
      }),
    };
    getDbMock.mockResolvedValue(null);
    getPoolMock.mockReturnValue(pool);

    const result = await processAndPayPayroll(2026, 6, "user-1", "org-1");

    expect(result).toEqual({
      processed: 0,
      skipped: 0,
      dispatched: 0,
      markedPaid: 0,
      errors: [
        "Payroll: Database not available",
        "Database not available",
        "Payroll records were generated, but could not be marked paid: database collation mismatch",
      ],
    });
  });

  describe("processMonthlyPayroll", () => {
    afterEach(() => vi.clearAllMocks());

    it("uses cost-center allocations when an employee's legacy department has no match", async () => {
      const employee = {
        id: "employee-1",
        organizationId: "org-1",
        firstName: "Joshua",
        lastName: "Fidel",
        department: "Legacy department label",
        salary: 0,
        jobGroupId: "group-1",
        status: "active",
      };
      const jobGroup = {
        id: "group-1",
        organizationId: "org-1",
        defaultBasicSalary: 50000,
        defaultAllowances: JSON.stringify([{ type: "Housing", amount: 250000 }]),
        defaultDeductions: JSON.stringify([{ type: "Other", amount: 50000 }]),
        defaultBenefits: "[]",
      };
      const dbRows = (table: unknown) =>
        table === employees ? [employee] : table === jobGroups ? [jobGroup] : [];
      const resultFor = (table: unknown) => {
        const rows = dbRows(table);
        return {
          limit: async () => table === payroll ? [] : rows,
          orderBy: () => ({ limit: async () => rows }),
          then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
        };
      };
      const insertedPayroll: any[] = [];
      const db = {
        select: vi.fn(() => ({
          from: vi.fn((table: unknown) => ({
            where: vi.fn(() => resultFor(table)),
            then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(dbRows(table)).then(resolve),
          })),
        })),
        transaction: vi.fn(async (callback: (transaction: any) => Promise<unknown>) => callback({
          insert: vi.fn((table: unknown) => ({
            values: vi.fn(async (values: any) => {
              if (table === payroll) insertedPayroll.push(values);
            }),
          })),
        })),
      };
      getDbMock.mockResolvedValue(db);
      getPoolMock.mockReturnValue({ query: vi.fn(async () => [[], []]) });
      recordPayrollCostAllocationMock.mockResolvedValue({ budgetSplits: [] });

      const result = await processMonthlyPayroll(2026, 6, "user-1", "org-1");

      expect(result).toMatchObject({ processed: 1, skipped: 0, errors: [] });
      expect(insertedPayroll).toHaveLength(1);
      expect(insertedPayroll[0]).toMatchObject({
        basicSalary: 5_000_000,
        allowances: 250_000,
      });
      expect(JSON.parse(insertedPayroll[0].notes).deductionComponents).toEqual([
        expect.objectContaining({ deductionType: "Other", amount: 50_000 }),
      ]);
      expect(recordPayrollCostAllocationMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          organizationId: "org-1",
          employeeId: "employee-1",
          employeeDepartmentId: null,
        }),
      );
      expect(db.transaction).toHaveBeenCalledTimes(2);
    });

    it("keeps the payroll record when accounting allocation is not configured", async () => {
      const employee = {
        id: "employee-1",
        organizationId: "org-1",
        firstName: "Joshua",
        lastName: "Fidel",
        department: "Engineering",
        salary: 50000,
        jobGroupId: "group-1",
        status: "active",
      };
      const dbRows = (table: unknown) => table === employees ? [employee] : [];
      const insertedPayroll: any[] = [];
      const resultFor = (table: unknown) => {
        const rows = dbRows(table);
        return {
          limit: async () => table === payroll ? [] : rows,
          orderBy: () => ({ limit: async () => rows }),
          then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
        };
      };
      const db = {
        select: vi.fn(() => ({
          from: vi.fn((table: unknown) => ({
            where: vi.fn(() => resultFor(table)),
            then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(dbRows(table)).then(resolve),
          })),
        })),
        transaction: vi.fn(async (callback: (transaction: any) => Promise<unknown>) => callback({
          insert: vi.fn((table: unknown) => ({
            values: vi.fn(async (values: any) => {
              if (table === payroll) insertedPayroll.push(values);
            }),
          })),
        })),
      };
      getDbMock.mockResolvedValue(db);
      getPoolMock.mockReturnValue({ query: vi.fn(async () => [[], []]) });
      recordPayrollCostAllocationMock.mockRejectedValue(new Error("No effective cost allocation is configured"));

      const result = await processMonthlyPayroll(2026, 6, "user-1", "org-1");

      expect(result).toEqual({
        processed: 1,
        skipped: 0,
        errors: [
          "Joshua Fidel: payroll was created; budget could not be charged because the employee has no matching department, but accounting allocation failed: No effective cost allocation is configured",
        ],
      });
      expect(insertedPayroll).toHaveLength(1);
      expect(db.transaction).toHaveBeenCalledTimes(2);
    });

    it("generates payroll for global employees without organization-scoped cost allocation", async () => {
      const employee = {
        id: "employee-global",
        organizationId: null,
        firstName: "Joshua",
        lastName: "Fidel",
        department: "Engineering",
        salary: 50000,
        jobGroupId: "group-global",
        status: "active",
      };
      const dbRows = (table: unknown) => table === employees ? [employee] : [];
      const insertedPayroll: any[] = [];
      const resultFor = (table: unknown) => {
        const rows = dbRows(table);
        return {
          limit: async () => table === payroll ? [] : rows,
          orderBy: () => ({ limit: async () => rows }),
          then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
        };
      };
      const db = {
        select: vi.fn(() => ({
          from: vi.fn((table: unknown) => ({
            where: vi.fn(() => resultFor(table)),
            then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(dbRows(table)).then(resolve),
          })),
        })),
        transaction: vi.fn(async (callback: (transaction: any) => Promise<unknown>) => callback({
          insert: vi.fn((table: unknown) => ({
            values: vi.fn(async (values: any) => {
              if (table === payroll) insertedPayroll.push(values);
            }),
          })),
        })),
      };
      getDbMock.mockResolvedValue(db);
      getPoolMock.mockReturnValue({ query: vi.fn(async () => [[], []]) });

      const result = await processMonthlyPayroll(2026, 9, "global-user", null);

      expect(result).toEqual({ processed: 1, skipped: 0, errors: [] });
      expect(insertedPayroll).toHaveLength(1);
      expect(insertedPayroll[0]).toMatchObject({
        employeeId: "employee-global",
        payPeriodStart: "2026-09-01 00:00:00",
        basicSalary: expect.any(Number),
      });
      expect(recordPayrollCostAllocationMock).not.toHaveBeenCalled();
    });

    it("uses the salary structure for the requested pay period when employee salary is unset", async () => {
      const employee = {
        id: "employee-1",
        organizationId: "org-1",
        firstName: "Amina",
        lastName: "Otieno",
        department: "Engineering",
        salary: null,
        jobGroupId: null,
        status: "active",
      };
      const structure = {
        id: "structure-1",
        employeeId: "employee-1",
        effectiveDate: "2026-01-01 00:00:00",
        basicSalary: 5_000_000,
        allowances: 250_000,
        deductions: 50_000,
      };
      const dbRows = (table: unknown) =>
        table === employees ? [employee] : table === salaryStructures ? [structure] : [];
      const resultFor = (table: unknown) => {
        const rows = dbRows(table);
        return {
          limit: async () => table === payroll ? [] : rows,
          orderBy: () => ({ limit: async () => rows }),
          then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
        };
      };
      const insertedPayroll: any[] = [];
      const db = {
        select: vi.fn(() => ({
          from: vi.fn((table: unknown) => ({
            where: vi.fn(() => resultFor(table)),
            then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(dbRows(table)).then(resolve),
          })),
        })),
        transaction: vi.fn(async (callback: (transaction: any) => Promise<unknown>) => callback({
          insert: vi.fn((table: unknown) => ({
            values: vi.fn(async (values: any) => {
              if (table === payroll) insertedPayroll.push(values);
            }),
          })),
        })),
      };
      getDbMock.mockResolvedValue(db);
      getPoolMock.mockReturnValue({ query: vi.fn(async () => [[], []]) });
      recordPayrollCostAllocationMock.mockRejectedValue(new Error("No effective cost allocation is configured"));

      const result = await processMonthlyPayroll(2026, 10, "user-1", "org-1");

      expect(result.processed).toBe(1);
      expect(insertedPayroll[0]).toMatchObject({
        payPeriodStart: "2026-10-01 00:00:00",
        basicSalary: 5_000_000,
        allowances: 250_000,
        deductions: expect.any(Number),
      });
      expect(insertedPayroll[0].payPeriodEnd).toBe("2026-10-31 23:59:59");
    });
  });
});