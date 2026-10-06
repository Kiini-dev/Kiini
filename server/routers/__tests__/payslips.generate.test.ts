import { afterEach, describe, expect, it, vi } from "vitest";

const { getPoolMock, getDbMock, companyInfoMock, processMonthlyPayrollMock } = vi.hoisted(() => ({
  getPoolMock: vi.fn(),
  getDbMock: vi.fn(),
  companyInfoMock: vi.fn(),
  processMonthlyPayrollMock: vi.fn(),
}));

vi.mock("../../db", () => ({ getPool: getPoolMock, getDb: getDbMock }));
vi.mock("../../utils/company-info", () => ({ getCompanyInfo: companyInfoMock }));
vi.mock("../../jobs/payrollJobs", () => ({ processMonthlyPayroll: processMonthlyPayrollMock }));

import { payslipRouter } from "../payslips";

describe("payslips.generate", () => {
  afterEach(() => vi.clearAllMocks());

  it("lets a global super-admin list payslips across organizations", async () => {
    const listQuery = vi.fn(async () => [[], []]);
    getPoolMock.mockReturnValue({ query: listQuery });

    const caller = payslipRouter.createCaller({
      user: { id: "admin-1", role: "SUPER ADMIN", organizationId: "org-context" },
    } as any);
    await caller.listAll({});

    expect(listQuery).toHaveBeenCalledOnce();
    expect(listQuery.mock.calls[0][0]).toContain("WHERE 1 = 1");
    expect(listQuery.mock.calls[0][0]).not.toContain("p.organizationId = ?");
    expect(listQuery.mock.calls[0][1]).toEqual([50, 0]);
  });

  it("returns derived gross and net aliases with employee benefits on the payslip list", async () => {
    const row = {
      id: "payslip-list-1",
      employeeId: "employee-1",
      payPeriod: "2026-06",
      basicSalary: 30000000,
      allowances: 6000000,
      grossSalary: 0,
      totalDeductions: 3000000,
      netSalary: 0,
      allowancesBreakdown: "[]",
      deductionsBreakdown: "[]",
    };
    const query = vi.fn(async (sql: string) => {
      if (sql.includes("FROM payslips p")) return [[row], []];
      if (sql.includes("FROM employeeBenefits")) return [[{ employeeId: "employee-1", name: "Medical", amount: 250000 }], []];
      return [[], []];
    });
    getPoolMock.mockReturnValue({ query });
    companyInfoMock.mockResolvedValue({ name: "Kiini", address: "", logo: "" });

    const caller = payslipRouter.createCaller({
      user: { id: "admin-1", role: "super_admin" },
    } as any);
    const [result] = await caller.listAll({});

    expect(result).toMatchObject({
      grossSalary: 36000000,
      grossPay: 36000000,
      netSalary: 33000000,
      netPay: 33000000,
      benefitsBreakdown: JSON.stringify([{ employeeId: "employee-1", name: "Medical", amount: 250000 }]),
    });
  });

  it("lets an HR effective role view an employee payslip and returns amounts in KES", async () => {
    const row = {
      id: "payslip-1",
      employeeId: "employee-1",
      organizationId: "org-1",
      payPeriod: "2026-06",
      basicSalary: 5000000,
      grossSalary: 5500000,
      totalDeductions: 1000000,
      netSalary: 4500000,
      allowancesBreakdown: JSON.stringify([{ name: "Housing", amount: 500000 }]),
      deductionsBreakdown: JSON.stringify([{ name: "PAYE", amount: 1000000 }]),
    };
    const payslipQuery = vi.fn(async (sql: string) => {
      if (sql.includes("FROM payslips p")) return [[row], []];
      if (sql.includes("FROM employeeBenefits")) return [[], []];
      if (sql.includes("FROM documentTemplates")) return [[], []];
      return [[], []];
    });
    getPoolMock.mockReturnValue({ query: payslipQuery });
    companyInfoMock.mockResolvedValue({ name: "Kiini", address: "", logo: "" });

    const caller = payslipRouter.createCaller({
      user: { id: "hr-1", role: "staff", effectiveRole: "hr", organizationId: "org-1" },
    } as any);
    const result = await caller.getAccessible({ id: "payslip-1" });

    expect(result).toMatchObject({
      basicSalary: 50000,
      grossSalary: 55000,
      grossPay: 55000,
      totalDeductions: 10000,
      netSalary: 45000,
      netPay: 45000,
      allowancesBreakdown: [{ name: "Housing", amount: 5000 }],
      deductionsBreakdown: [{ name: "PAYE", amount: 10000 }],
    });
    expect(payslipQuery.mock.calls[0][0]).not.toContain("e.userId = ?");
    expect(payslipQuery.mock.calls[0][1]).toEqual(["payslip-1", "org-1", "org-1"]);
  });

  it("allows a global super-admin to access payslip detail without tenant scoping", async () => {
    const payslipQuery = vi.fn(async (sql: string) => {
      if (sql.includes("FROM payslips p")) {
        return [[{
          id: "payslip-1",
          employeeId: "employee-1",
          payPeriod: "2026-06",
          basicSalary: 5000000,
          grossSalary: 5500000,
          totalDeductions: 1000000,
          netSalary: 4500000,
        }], []];
      }
      return [[], []];
    });
    getPoolMock.mockReturnValue({ query: payslipQuery });
    companyInfoMock.mockResolvedValue({ name: "Kiini", address: "", logo: "" });

    const caller = payslipRouter.createCaller({
      user: { id: "admin-1", role: "SUPER ADMIN" },
    } as any);
    const result = await caller.getAccessible({ id: "payslip-1" });

    expect(result?.grossPay).toBe(55000);
    expect(payslipQuery.mock.calls[0][0]).not.toContain("e.userId = ?");
    expect(payslipQuery.mock.calls[0][1]).toEqual(["payslip-1"]);
  });

  it("resolves the legacy September payslip URL and derives missing gross and net values", async () => {
    const row = {
      id: "payslip-september",
      employeeId: "employee-eliakim",
      organizationId: "org-1",
      payPeriod: "2026-09",
      firstName: "Eliakim",
      lastName: "Mwaniki",
      basicSalary: 30000000,
      grossSalary: 0,
      totalAllowances: 6000000,
      totalDeductions: 3000000,
      netSalary: 0,
      allowancesBreakdown: JSON.stringify([{ name: "Housing", amount: 6000000 }]),
      deductionsBreakdown: "[]",
    };
    const payslipQuery = vi.fn(async (sql: string) => {
      if (sql.includes("FROM payslips p")) return [[row], []];
      if (sql.includes("FROM employeeBenefits")) return [[{ name: "Medical", amount: 250000, cost: 250000 }], []];
      if (sql.includes("FROM documentTemplates")) return [[], []];
      return [[], []];
    });
    getPoolMock.mockReturnValue({ query: payslipQuery });
    companyInfoMock.mockResolvedValue({ name: "Kiini", address: "", logo: "" });

    const caller = payslipRouter.createCaller({
      user: { id: "admin-1", role: "super_admin", organizationId: "org-context" },
    } as any);
    const result = await caller.getAccessible({ id: "payslip-september-2026-eliakim-mwaniki" });

    expect(payslipQuery.mock.calls[0][0]).toContain("(p.payPeriod = ? OR DATE_FORMAT(p.payMonth, '%Y-%m') = ?)");
    expect(payslipQuery.mock.calls[0][0]).not.toContain("p.organizationId = ?");
    expect(payslipQuery.mock.calls[0][1]).toEqual(["2026-09", "2026-09"]);
    expect(result).toMatchObject({
      id: "payslip-september",
      grossSalary: 360000,
      grossPay: 360000,
      netSalary: 330000,
      netPay: 330000,
      benefitsBreakdown: [{ name: "Medical", amount: 2500, cost: 2500 }],
    });
  });

  it("surfaces a database insert failure instead of reporting zero generated", async () => {
    const pool = {
      query: vi.fn(async (sql: string) => {
        if (sql.startsWith("SELECT * FROM employees")) {
          return [[{
            id: "employee-1",
            organizationId: null,
            firstName: "Amina",
            lastName: "Otieno",
            employeeNumber: "EMP-1",
            salary: 50000,
          }], []];
        }
        if (sql.startsWith("SELECT id FROM payslips")) return [[], []];
        if (sql.includes("FROM payroll")) return [[{ id: "payroll-1" }], []];
        if (sql.startsWith("SELECT * FROM salaryAllowances")) return [[], []];
        if (sql.startsWith("SELECT * FROM salaryDeductions")) return [[], []];
        if (sql.startsWith("SELECT content FROM documentTemplates")) return [[], []];
        if (sql.startsWith("INSERT INTO payslips")) {
          throw new Error("Unknown column 'nssfDeduction' in 'field list'");
        }
        return [[], []];
      }),
    };
    getPoolMock.mockReturnValue(pool);
    getDbMock.mockResolvedValue(null);
    companyInfoMock.mockResolvedValue({ name: "Kiini", address: "", logo: "" });
    processMonthlyPayrollMock.mockResolvedValue({ processed: 1, skipped: 0, errors: [] });

    const caller = payslipRouter.createCaller({
      user: { id: "admin-1", role: "super_admin" },
    } as any);
    await expect(caller.generate({ payPeriod: "2026-06", payDate: "2026-06-30" }))
      .rejects.toThrow(/Unknown column 'nssfDeduction'/);
  });

  it("reports when the selected organization has no active employees", async () => {
    getPoolMock.mockReturnValue({
      query: vi.fn(async () => [[], []]),
    });
    getDbMock.mockResolvedValue(null);
    companyInfoMock.mockResolvedValue({ name: "Kiini", address: "", logo: "" });
    processMonthlyPayrollMock.mockResolvedValue({ processed: 0, skipped: 0, errors: [] });

    const caller = payslipRouter.createCaller({
      user: { id: "admin-1", role: "super_admin" },
    } as any);
    await expect(caller.generate({ payPeriod: "2026-06", payDate: "2026-06-30" }))
      .rejects.toThrow(/No active employees were found/);
  });

  it("creates and returns payslips with all required period and breakdown fields", async () => {
    const insertCalls: Array<{ sql: string; values: unknown[] }> = [];
    const pool = {
      query: vi.fn(async (sql: string, values: unknown[] = []) => {
        if (sql.startsWith("SELECT * FROM employees")) {
          return [[{
            id: "employee-1",
            organizationId: null,
            firstName: "Amina",
            lastName: "Otieno",
            employeeNumber: "EMP-1",
            salary: 300000,
          }], []];
        }
        if (sql.startsWith("SELECT id FROM payslips")) return [[], []];
        if (sql.includes("FROM payroll")) return [[{ id: "payroll-1" }], []];
        if (sql.startsWith("SELECT * FROM salaryAllowances")) return [[
          { allowanceType: "Housing", amount: 2500000, frequency: "monthly" },
          { allowanceType: "Commuter", amount: 4000000, frequency: "monthly" },
          { allowanceType: "Telephone", amount: 200000, frequency: "monthly" },
        ], []];
        if (sql.startsWith("SELECT * FROM salaryDeductions")) return [[
          { deductionType: "Staff loan", amount: 50000, frequency: "monthly" },
        ], []];
        if (sql.startsWith("SELECT content FROM documentTemplates")) return [[], []];
        if (sql.startsWith("INSERT INTO payslips")) {
          insertCalls.push({ sql, values });
          return [{ affectedRows: 1 }, []];
        }
        return [[], []];
      }),
    };
    getPoolMock.mockReturnValue(pool);
    getDbMock.mockResolvedValue(null);
    companyInfoMock.mockResolvedValue({ name: "Kiini", address: "", logo: "" });
    processMonthlyPayrollMock.mockResolvedValue({ processed: 1, skipped: 0, errors: [] });

    const caller = payslipRouter.createCaller({
      user: { id: "admin-1", role: "super_admin" },
    } as any);
    const result = await caller.generate({ payPeriod: "2026-06", payDate: "2026-06-30" });
    const bulkResult = await caller.bulkGenerate({ payPeriod: "2026-06", payDate: "2026-06-30" });

    expect(result).toMatchObject({ generated: 1, errors: [], payslipIds: [expect.any(String)] });
    expect(bulkResult).toMatchObject({ generated: 1, employeeCount: 1, errors: [] });
    expect(insertCalls).toHaveLength(2);
    expect(insertCalls[0].sql).toContain("payPeriodStart");
    expect(insertCalls[0].sql).toContain("payPeriodEnd");
    expect(insertCalls[0].sql).toContain("allowancesBreakdown");
    expect(insertCalls[0].sql).toContain("deductionsBreakdown");
    expect(insertCalls[0].sql).toContain("htmlContent");
    expect(insertCalls[0].sql).not.toMatch(/grossPay|netPay|totalAllowances/);
    expect(insertCalls[0].sql.match(/\?/g)).toHaveLength(insertCalls[0].values.length);
    expect(insertCalls[0].values).toContain("2026-06");
    expect(insertCalls[0].values[2]).toBeNull();
    expect(insertCalls[0].values[1]).toBe("payroll-1");
    expect(insertCalls[0].values[10]).toBe(30000000);
    expect(insertCalls[0].values[11]).toBe(6700000);
    expect(insertCalls[0].values[12]).toBe(36700000);
    expect(JSON.parse(String(insertCalls[0].values[20]))).toEqual([
      { name: "Housing", amount: 2500000 },
      { name: "Commuter", amount: 4000000 },
      { name: "Telephone", amount: 200000 },
    ]);
    expect(JSON.parse(String(insertCalls[0].values[21])).find((item: any) => item.name === "Staff loan"))
      .toMatchObject({ amount: 50000 });
    expect(processMonthlyPayrollMock).toHaveBeenCalledWith(2026, 6, "admin-1", undefined);
  });
});