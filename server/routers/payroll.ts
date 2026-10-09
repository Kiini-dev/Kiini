import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { accounts, departments, payroll, employees, jobGroups } from "../../drizzle/schema";
import ExcelJS from "exceljs";
import {
  salaryStructures,
  salaryAllowances,
  salaryDeductions,
  employeeBenefits,
  payrollDetails,
  payrollApprovals,
  employeeTaxInfo,
  salaryIncrements,
} from "../../drizzle/schema-extended";
import { eq, and, desc, gte, inArray, isNull, lt, or } from "drizzle-orm";
import { getCompanyInfo } from "../utils/company-info";
import { v4 as uuidv4 } from "uuid";
import { generateP9Form, generateP9DataFromPayroll } from "../utils/p9-form-generator";
import { calculateKenyanPayroll } from "../utils/kenyan-payroll-calculator";
import { processMonthlyPayroll, processAndDispatchPayslips, processAndPayPayroll } from "../jobs/payrollJobs";
import { TRPCError } from "@trpc/server";
import { resolveP9OrganizationScope } from "../services/p9OrganizationScope";
import {
  applyJobGroupCompensationDefaults,
  parseJobGroupPayrollDefaults,
  resolveJobGroupPayrollAmount,
  resolveJobGroupPayrollBasisSalary,
  resolveJobGroupPayrollTaxRate,
} from "../services/jobGroupPayrollDefaults";

export function normalizeDateValue(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().replace("T", " ").substring(0, 19);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return new Date().toISOString().replace("T", " ").substring(0, 19);

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().replace("T", " ").substring(0, 19);
    }
  }

  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function toDbDate(d: Date): string {
  return normalizeDateValue(d);
}

function parseMonthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || m < 1 || m > 12) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid month format. Use YYYY-MM" });
  }
  const monthNumber = String(m).padStart(2, "0");
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return {
    start: `${y}-${monthNumber}-01 00:00:00`,
    end: `${y}-${monthNumber}-${String(lastDay).padStart(2, "0")} 23:59:59`,
  };
}

function resolvePayrollIds(input: any): string[] {
  const ids = input?.ids || input?.payrollIds || [];
  return Array.isArray(ids) ? ids : [];
}

function monthlyAmount(amount: unknown, frequency: unknown): number {
  const value = Number(amount || 0);
  switch (frequency) {
    case "quarterly": return Math.round(value / 3);
    case "annual": return Math.round(value / 12);
    default: return value;
  }
}

const payrollEmployeeScope = (organizationId?: string | null) =>
  organizationId ? eq(employees.organizationId, organizationId) : isNull(employees.organizationId);

async function requirePayrollWorkspaceEmployee(db: any, employeeId: string, organizationId?: string | null) {
  const [employee] = await db.select()
    .from(employees)
    .where(and(eq(employees.id, employeeId), payrollEmployeeScope(organizationId)))
    .limit(1);
  if (!employee) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found in this payroll workspace" });
  return employee;
}

async function requireScopedCompensationRecord(
  db: any,
  kind: "allowance" | "deduction" | "benefit",
  id: string,
  organizationId?: string | null,
) {
  const record = await getCompensationRecord(db, kind, id);
  if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Compensation item not found" });
  await requirePayrollWorkspaceEmployee(db, record.employeeId, organizationId);
  return record;
}

async function getScopedPayrollIds(db: any, ids: string[], organizationId?: string | null): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await db.select({ id: payroll.id })
    .from(payroll)
    .innerJoin(employees, eq(employees.id, payroll.employeeId))
    .where(and(inArray(payroll.id, ids), payrollEmployeeScope(organizationId)));
  return rows.map((row: { id: string }) => row.id);
}

async function validatePayrollComponentAssignment(
  database: any,
  organizationId: string | null | undefined,
  departmentIdOverride?: string,
  glAccountId?: string,
  accountKind?: "expense" | "liability",
) {
  if (departmentIdOverride) {
    const departmentScope = organizationId
      ? or(eq(departments.organizationId, organizationId), isNull(departments.organizationId))
      : isNull(departments.organizationId);
    const [department] = await database.select({ id: departments.id }).from(departments)
      .where(and(eq(departments.id, departmentIdOverride), departmentScope)).limit(1);
    if (!department) throw new TRPCError({ code: "BAD_REQUEST", message: "The department override is not available in this organization." });
  }
  if (glAccountId) {
    const accountScope = organizationId
      ? eq(accounts.organizationId, organizationId)
      : isNull(accounts.organizationId);
    const [account] = await database.select({ id: accounts.id, accountType: accounts.accountType }).from(accounts)
      .where(and(eq(accounts.id, glAccountId), accountScope, eq(accounts.isActive, 1))).limit(1);
    if (!account) throw new TRPCError({ code: "BAD_REQUEST", message: "The GL account is not active or is outside this organization." });
    const validType = accountKind === "liability"
      ? account.accountType === "liability"
      : accountKind === "expense"
        ? ["expense", "operating expense", "cost of goods sold", "other expense"].includes(account.accountType)
        : true;
    if (!validType) throw new TRPCError({ code: "BAD_REQUEST", message: `Select a valid ${accountKind} account for this payroll component.` });
  }
}

async function getEmployeeCompensationPackage(db: any, employeeId: string) {
  const [employeeRows, structureRows, allowanceRows, deductionRows, benefitRows] = await Promise.all([
    db.select().from(employees).where(eq(employees.id, employeeId)).limit(1),
    db.select().from(salaryStructures).where(eq(salaryStructures.employeeId, employeeId)),
    db.select().from(salaryAllowances).where(eq(salaryAllowances.employeeId, employeeId)),
    db.select().from(salaryDeductions).where(eq(salaryDeductions.employeeId, employeeId)),
    db.select().from(employeeBenefits).where(eq(employeeBenefits.employeeId, employeeId)),
  ]);
  const employee = employeeRows[0];
  const groupRows = employee?.jobGroupId
    ? await db.select().from(jobGroups).where(eq(jobGroups.id, employee.jobGroupId)).limit(1)
    : [];
  const jobGroup = groupRows[0];
  const basicSalaryUnits = resolveJobGroupPayrollBasisSalary(employee?.salary, jobGroup);

  const latestStructure = [...structureRows].sort((a: any, b: any) =>
    new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  )[0];
  const structure = latestStructure
    ? { ...latestStructure, basicSalary: Math.round(basicSalaryUnits * 100) || latestStructure.basicSalary }
    : (basicSalaryUnits > 0 ? { basicSalary: Math.round(basicSalaryUnits * 100), effectiveDate: null, isJobGroupDefault: true } : null);
  const active = (row: any) =>
    row.isActive !== false && row.isActive !== 0
    && (!row.endDate || new Date(row.endDate).getTime() >= Date.now())
    && (!row.effectiveDate || new Date(row.effectiveDate).getTime() <= Date.now());
  const allowances: any[] = allowanceRows.filter(active).map((row: any) => ({
    id: row.id,
    name: row.allowanceType,
    amount: monthlyAmount(row.amount, row.frequency),
    frequency: row.frequency,
  }));
  const deductions: any[] = deductionRows.filter(active).map((row: any) => ({
    id: row.id,
    name: row.deductionType,
    amount: monthlyAmount(row.amount, row.frequency),
    frequency: row.frequency,
  }));
  const benefits: any[] = benefitRows.filter(active).map((row: any) => ({
    id: row.id,
    name: row.benefitType,
    employeeCost: monthlyAmount(row.cost, "monthly"),
    employerCost: monthlyAmount(row.employerCost, "monthly"),
  }));
  const appendMissingDefaults = (
    existingRows: any[],
    defaults: ReturnType<typeof parseJobGroupPayrollDefaults>,
    mapDefault: (item: ReturnType<typeof parseJobGroupPayrollDefaults>[number]) => any,
  ) => {
    const existingTypes = new Set(existingRows.map((row: any) => String(row.name).trim().toLowerCase()));
    for (const item of defaults) {
      if (!existingTypes.has(item.type.trim().toLowerCase())) existingRows.push(mapDefault(item));
    }
  };
  if (jobGroup) {
    appendMissingDefaults(allowances, parseJobGroupPayrollDefaults(jobGroup.defaultAllowances), (item) => ({
      id: null,
      name: item.type,
      amount: monthlyAmount(resolveJobGroupPayrollAmount(item, basicSalaryUnits), item.frequency),
      frequency: item.frequency || "monthly",
      isJobGroupDefault: true,
    }));
    const defaultDeductions = parseJobGroupPayrollDefaults(jobGroup.defaultDeductions);
    appendMissingDefaults(deductions, defaultDeductions.filter((item) =>
      !(/tax|paye/i.test(item.type) && Number.isFinite(item.percentage))
    ), (item) => ({
      id: null,
      name: item.type,
      amount: monthlyAmount(resolveJobGroupPayrollAmount(item, basicSalaryUnits), item.frequency),
      frequency: item.frequency || "monthly",
      isJobGroupDefault: true,
    }));
    appendMissingDefaults(benefits, parseJobGroupPayrollDefaults(jobGroup.defaultBenefits), (item) => {
      const amount = monthlyAmount(resolveJobGroupPayrollAmount(item, basicSalaryUnits), "monthly");
      return { id: null, name: item.type, employeeCost: amount, employerCost: amount, isJobGroupDefault: true };
    });
  }

  const structureTaxRate = Number(structure?.taxRate || 0);
  const taxRate = resolveJobGroupPayrollTaxRate(structureTaxRate, jobGroup?.defaultDeductions);
  const allowanceTotal = allowances.length
    ? allowances.reduce((sum: number, row: any) => sum + row.amount, 0)
    : Number(structure?.allowances || 0);
  const deductionTotal = deductions.length
    ? deductions.reduce((sum: number, row: any) => sum + row.amount, 0)
    : Number(structure?.deductions || 0);

  return {
    structure,
    basicSalary: Number(structure?.basicSalary || Math.round(basicSalaryUnits * 100)),
    taxRate,
    allowances,
    deductions,
    benefits,
    totals: {
      allowances: allowanceTotal,
      deductions: deductionTotal,
      employeeBenefits: benefits.reduce((sum: number, row: any) => sum + row.employeeCost, 0),
      employerBenefits: benefits.reduce((sum: number, row: any) => sum + row.employerCost, 0),
    },
  };
}

async function getCompensationRecord(db: any, kind: "allowance" | "deduction" | "benefit", id: string) {
  const table = kind === "allowance" ? salaryAllowances : kind === "deduction" ? salaryDeductions : employeeBenefits;
  const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
  return rows[0] || null;
}

async function setCompensationRecordActive(
  db: any,
  kind: "allowance" | "deduction" | "benefit",
  id: string,
  isActive: boolean,
) {
  const table = kind === "allowance" ? salaryAllowances : kind === "deduction" ? salaryDeductions : employeeBenefits;
  return db.update(table).set({ isActive, updatedAt: new Date() } as any).where(eq(table.id, id));
}

function assertCompensationEmployeeAccess(ctx: any, employee: any) {
  if ((employee?.organizationId ?? null) !== (ctx.user.organizationId ?? null)) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Compensation item not found" });
  }
}

async function buildP9ForEmployee(
  db: any,
  employeeId: string,
  certifiedBy: string,
  taxYear?: number,
  organizationId?: string | null,
) {
  const employeeConditions = [eq(employees.id, employeeId)];
  employeeConditions.push(payrollEmployeeScope(organizationId));
  const employee = await db.select().from(employees).where(and(...employeeConditions)).limit(1);
  if (!employee || employee.length === 0) {
    throw new Error("Employee not found");
  }

  const emp = employee[0];
  const year = taxYear ?? new Date().getFullYear();
  const yearStart = `${year}-01-01 00:00:00`;
  const nextYearStart = `${year + 1}-01-01 00:00:00`;
  const payrollRecords = await db.select().from(payroll).where(and(
    eq(payroll.employeeId, employeeId),
    gte(payroll.payPeriodStart, yearStart),
    lt(payroll.payPeriodStart, nextYearStart),
  ));
  if (!payrollRecords || payrollRecords.length === 0) {
    throw new Error("No payroll records found for employee");
  }

  let totalBasicSalary = 0;
  let totalAllowances = 0;
  let totalTax = 0;
  let totalNssf = 0;
  let totalShif = 0;
  let totalHousingLevy = 0;
  let totalNetSalary = 0;

  for (const record of payrollRecords as any[]) {
    totalBasicSalary += Number(record.basicSalary || 0);
    totalAllowances += Number(record.allowances || 0);
    totalTax += Number(record.tax || 0);
    totalNetSalary += Number(record.netSalary || 0);

    let parsedNotes: any = {};
    if (record.notes) {
      try {
        parsedNotes = JSON.parse(record.notes);
      } catch {
        parsedNotes = {};
      }
    }
    totalNssf += Number(parsedNotes.nssf || 0);
    totalShif += Number(parsedNotes.shif || 0);
    totalHousingLevy += Number(parsedNotes.housingLevy || 0);
  }

  const companyInfo = await getCompanyInfo();
  const p9Data = {
    employeeId: emp.employeeNumber || emp.id,
    employeeName: `${emp.firstName} ${emp.lastName}`,
    nationalId: emp.nationalId || "N/A",
    knRegNo: emp.taxId || "",
    grossSalary: totalBasicSalary + totalAllowances,
    paye: totalTax,
    nssf: totalNssf,
    shif: totalShif,
    housingLevy: totalHousingLevy,
    totalDeductions: totalTax + totalNssf + totalShif + totalHousingLevy,
    netIncome: totalNetSalary,
    taxYear: year,
    monthFrom: 1,
    monthTo: 12,
    companyName: companyInfo.name,
    companyKRAPin: companyInfo.kraPin || "N/A",
    companyAddress: companyInfo.address || "N/A",
    certificationDate: new Date(),
    certifiedBy,
    certifiedByTitle: "Human Resources Manager",
  };

  return {
    htmlContent: generateP9Form(p9Data),
    fileName: `P9-${emp.employeeNumber || emp.id}-${year}.html`,
    employeeName: emp.firstName ? `${emp.firstName} ${emp.lastName}` : "Unknown",
  };
}

export const payrollRouter = router({
  // ===================== Main Payroll Management =====================
  list: createFeatureRestrictedProcedure("payroll:read")
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payroll records are temporarily unavailable. Please try again.",
        });
      }
      try {
        const employeeConditions = [payrollEmployeeScope(ctx.user.organizationId)];
        const employeeRows = await db.select().from(employees).where(
          employeeConditions.length ? and(...employeeConditions) : undefined
        );
        const empMap = new Map<string, any>(employeeRows.map((employee: any) => [employee.id, employee] as [string, any]));
        if (!empMap.size) return [];

        const rows = await db
          .select()
          .from(payroll)
          .where(inArray(payroll.employeeId, [...empMap.keys()]))
          .orderBy(desc(payroll.payPeriodStart))
          .limit(input?.limit || 50)
          .offset(input?.offset || 0);

        return rows.map((r: any) => {
          const emp = empMap.get(r.employeeId) || {};
          return {
            ...r,
            employeeName: emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : undefined,
            department: emp.department,
            month: (r as any).month || (r as any).payPeriodStart || null,
          };
        });
      } catch (error) {
        console.error("Error fetching payroll records:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load payroll records. Please try again.",
          cause: error,
        });
      }
    }),

  getById: createFeatureRestrictedProcedure("payroll:read")
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }
      try {
        const conditions = [eq(payroll.id, input)];
        conditions.push(payrollEmployeeScope(ctx.user.organizationId));
        const result = await db.select({ payroll, organizationId: employees.organizationId })
          .from(payroll)
          .innerJoin(employees, eq(employees.id, payroll.employeeId))
          .where(and(...conditions))
          .limit(1);
        const row = result[0]?.payroll || null;
        if (!row) return null;
        const details = await db.select().from(payrollDetails).where(eq(payrollDetails.payrollId, input));
        return {
          ...row,
          month: (row as any).month || (row as any).payPeriodStart || null,
          details,
        };
      } catch (error) {
        console.error("Error fetching payroll by ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load payroll details. Please try again.",
          cause: error,
        });
      }
    }),

  byEmployee: protectedProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const employee = await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);
        const result = await db.select().from(payroll).where(eq(payroll.employeeId, employee.id));
        return result.map((row: any) => ({
          ...row,
          month: row.month || row.payPeriodStart || null,
        }));
      } catch (error) {
        if (error instanceof TRPCError && error.code === "NOT_FOUND") throw error;
        console.warn("Error fetching payroll by employee:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load employee payroll records.", cause: error });
      }
    }),

  previewBatch: createFeatureRestrictedProcedure("payroll:read")
    .input(
      z.object({
        month: z.string(),
        employeeIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { start, end } = parseMonthRange(input.month);
      const employeeWhere = input.employeeIds?.length
        ? and(eq(employees.status, "active"), inArray(employees.id, input.employeeIds))
        : eq(employees.status, "active");

      const empRows = await db.select().from(employees).where(employeeWhere);
      if (empRows.length === 0) {
        return {
          records: [],
          summary: {
            totalEmployees: 0,
            totalGrossSalary: 0,
            totalDeductions: 0,
            totalNetSalary: 0,
            averageSalary: 0,
          },
        };
      }

      const empIds = empRows.map((e: any) => e.id);
      const [structureRows, allowanceRows, deductionRows] = await Promise.all([
        db.select().from(salaryStructures).where(inArray(salaryStructures.employeeId, empIds)),
        db.select().from(salaryAllowances).where(inArray(salaryAllowances.employeeId, empIds)),
        db.select().from(salaryDeductions).where(inArray(salaryDeductions.employeeId, empIds)),
      ]);

      const structureByEmp = new Map<string, any>();
      for (const s of structureRows as any[]) {
        if (!structureByEmp.has(s.employeeId)) structureByEmp.set(s.employeeId, s);
      }

      const allowanceByEmp = new Map<string, number>();
      for (const a of allowanceRows as any[]) {
        const amount = Number(a.amount || 0);
        allowanceByEmp.set(a.employeeId, (allowanceByEmp.get(a.employeeId) || 0) + amount);
      }

      const deductionByEmp = new Map<string, number>();
      for (const d of deductionRows as any[]) {
        const amount = Number(d.amount || 0);
        deductionByEmp.set(d.employeeId, (deductionByEmp.get(d.employeeId) || 0) + amount);
      }

      const records = empRows.map((emp: any) => {
        const structure = structureByEmp.get(emp.id);
        const basicSalary = structure
          ? Number(structure.basicSalary || 0)
          : Math.round(Number(emp.salary || 0) * 100);
        const structureAllowances = Number(structure?.allowances ?? 0);
        const structureDeductions = Number(structure?.deductions ?? 0);
        const dynamicAllowances = Number(allowanceByEmp.get(emp.id) || 0);
        const dynamicDeductions = Number(deductionByEmp.get(emp.id) || 0);
        const allowances = structureAllowances + dynamicAllowances;
        const deductions = structureDeductions + dynamicDeductions;
        const taxRateRaw = Number(structure?.taxRate ?? 0);
        const taxRate = taxRateRaw > 1 ? taxRateRaw / 100 : taxRateRaw;
        const grossSalary = basicSalary + allowances;
        const tax = Math.max(0, Math.round(grossSalary * taxRate));
        const netSalary = Math.max(0, grossSalary - deductions - tax);

        return {
          employeeId: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          department: emp.department,
          month: input.month,
          payPeriodStart: start,
          payPeriodEnd: end,
          basicSalary,
          allowances,
          deductions: deductions + tax,
          netSalary,
          tax,
        };
      });

      const totalGrossSalary = records.reduce((sum, r) => sum + r.basicSalary + r.allowances, 0);
      const totalDeductions = records.reduce((sum, r) => sum + r.deductions, 0);
      const totalNetSalary = records.reduce((sum, r) => sum + r.netSalary, 0);

      return {
        records,
        summary: {
          totalEmployees: records.length,
          totalGrossSalary,
          totalDeductions,
          totalNetSalary,
          averageSalary: records.length ? Math.floor(totalNetSalary / records.length) : 0,
        },
      };
    }),

  processBatch: createFeatureRestrictedProcedure("payroll:create")
    .input(
      z.object({
        month: z.string(),
        employeeIds: z.array(z.string()).optional(),
        approverRole: z.string().optional().default("hr"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const preview = await (async () => {
        const employeeWhere = input.employeeIds?.length
          ? and(eq(employees.status, "active"), inArray(employees.id, input.employeeIds))
          : eq(employees.status, "active");
        const empRows = await db.select().from(employees).where(employeeWhere);
        if (empRows.length === 0) return [] as any[];
        const empIds = empRows.map((e: any) => e.id);
        const [structureRows, allowanceRows, deductionRows] = await Promise.all([
          db.select().from(salaryStructures).where(inArray(salaryStructures.employeeId, empIds)),
          db.select().from(salaryAllowances).where(inArray(salaryAllowances.employeeId, empIds)),
          db.select().from(salaryDeductions).where(inArray(salaryDeductions.employeeId, empIds)),
        ]);
        const structureByEmp = new Map<string, any>();
        for (const s of structureRows as any[]) {
          if (!structureByEmp.has(s.employeeId)) structureByEmp.set(s.employeeId, s);
        }
        const allowanceByEmp = new Map<string, number>();
        for (const a of allowanceRows as any[]) {
          allowanceByEmp.set(a.employeeId, (allowanceByEmp.get(a.employeeId) || 0) + Number(a.amount || 0));
        }
        const deductionByEmp = new Map<string, number>();
        for (const d of deductionRows as any[]) {
          deductionByEmp.set(d.employeeId, (deductionByEmp.get(d.employeeId) || 0) + Number(d.amount || 0));
        }
        const { start, end } = parseMonthRange(input.month);
        return empRows.map((emp: any) => {
          const structure = structureByEmp.get(emp.id);
          const basicSalary = structure
            ? Number(structure.basicSalary || 0)
            : Math.round(Number(emp.salary || 0) * 100);
          const structureAllowances = Number(structure?.allowances ?? 0);
          const structureDeductions = Number(structure?.deductions ?? 0);
          const dynamicAllowances = Number(allowanceByEmp.get(emp.id) || 0);
          const dynamicDeductions = Number(deductionByEmp.get(emp.id) || 0);
          const allowances = structureAllowances + dynamicAllowances;
          const deductionsBase = structureDeductions + dynamicDeductions;
          const taxRateRaw = Number(structure?.taxRate ?? 0);
          const taxRate = taxRateRaw > 1 ? taxRateRaw / 100 : taxRateRaw;
          const grossSalary = basicSalary + allowances;
          const tax = Math.max(0, Math.round(grossSalary * taxRate));
          const deductions = deductionsBase + tax;
          const netSalary = Math.max(0, grossSalary - deductions);
          return {
            employeeId: emp.id,
            basicSalary,
            allowances,
            deductions,
            tax,
            netSalary,
            payPeriodStart: start,
            payPeriodEnd: end,
          };
        });
      })();

      if (preview.length === 0) {
        return {
          processed: 0,
          skipped: 0,
          errors: [],
          records: [],
          summary: {
            totalEmployees: 0,
            totalGrossSalary: 0,
            totalDeductions: 0,
            totalNetSalary: 0,
            averageSalary: 0,
          },
        };
      }

      let processed = 0;
      let skipped = 0;
      const errors: string[] = [];
      const records: any[] = [];
      const now = toDbDate(new Date());

      for (const item of preview) {
        try {
          const existing = await db
            .select({ id: payroll.id })
            .from(payroll)
            .where(and(eq(payroll.employeeId, item.employeeId), eq(payroll.payPeriodStart, item.payPeriodStart)))
            .limit(1);

          if (existing.length > 0) {
            skipped++;
            continue;
          }

          const payrollId = uuidv4();
          await db.insert(payroll).values({
            id: payrollId,
            employeeId: item.employeeId,
            payPeriodStart: item.payPeriodStart,
            payPeriodEnd: item.payPeriodEnd,
            basicSalary: item.basicSalary,
            allowances: item.allowances,
            deductions: item.deductions,
            tax: item.tax,
            netSalary: item.netSalary,
            status: "processed",
            createdBy: ctx.user.id,
            createdAt: now,
            updatedAt: now,
          } as any);

          await db.insert(payrollApprovals).values({
            id: uuidv4(),
            payrollId,
            approverRole: input.approverRole || "hr",
            approverId: ctx.user.id,
            status: "pending",
            createdAt: now,
          } as any);

          records.push({
            id: payrollId,
            employeeId: item.employeeId,
            basicSalary: item.basicSalary,
            allowances: item.allowances,
            deductions: item.deductions,
            netSalary: item.netSalary,
          });
          processed++;
        } catch (err: any) {
          errors.push(err?.message || "Failed to process payroll record");
        }
      }

      const totalGrossSalary = records.reduce((sum, r) => sum + r.basicSalary + r.allowances, 0);
      const totalDeductions = records.reduce((sum, r) => sum + r.deductions, 0);
      const totalNetSalary = records.reduce((sum, r) => sum + r.netSalary, 0);

      return {
        processed,
        skipped,
        errors,
        records,
        summary: {
          totalEmployees: records.length,
          totalGrossSalary,
          totalDeductions,
          totalNetSalary,
          averageSalary: records.length ? Math.floor(totalNetSalary / records.length) : 0,
        },
      };
    }),

  create: createFeatureRestrictedProcedure("payroll:create")
    .input(z.object({
      employeeId: z.string(),
      // Accept `month` (YYYY-MM) from frontend for convenience
      month: z.preprocess((value) => value instanceof Date ? value.toISOString().slice(0, 7) : value, z.string().optional()),
      payPeriodStart: z.coerce.date().optional(),
      payPeriodEnd: z.coerce.date().optional(),
      notes: z.string().optional(),
      basicSalary: z.number(),
      allowances: z.number().optional(),
      deductions: z.number().optional(),
      tax: z.number().optional(),
      netSalary: z.number(),
      status: z.enum(["draft", "processed", "paid"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const employeeConditions = [eq(employees.id, input.employeeId), payrollEmployeeScope(ctx.user.organizationId)];
      const employeeRows = await db.select({ id: employees.id }).from(employees)
        .where(and(...employeeConditions)).limit(1);
      if (!employeeRows.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Employee must belong to your organization" });
      }
      
      const id = uuidv4();
      const now = normalizeDateValue(new Date());
      
      // If month provided, map to first day of month for payPeriodStart
      let derivedStart: string | undefined = undefined;
      if ((input as any).month) {
        try {
          const monthValue: any = (input as any).month;
          if (monthValue instanceof Date) {
            derivedStart = normalizeDateValue(monthValue);
          } else {
            derivedStart = normalizeDateValue(new Date(`${String(monthValue)}-01`));
          }
        } catch (e) {
          derivedStart = undefined;
        }
      }

      const insertData: any = {
        ...input,
        payPeriodStart: input.payPeriodStart ? normalizeDateValue(input.payPeriodStart) : derivedStart,
        payPeriodEnd: input.payPeriodEnd ? normalizeDateValue(input.payPeriodEnd) : undefined,
        createdBy: ctx.user.id,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(payroll).values({
        id,
        ...insertData,
      } as any);
      return { id };
    }),

  update: createFeatureRestrictedProcedure("payroll:edit")
    .input(z.object({
      id: z.string(),
      employeeId: z.string().optional(),
      // Allow updating via `month` as well (string YYYY-MM or Date)
      month: z.preprocess((value) => value instanceof Date ? value.toISOString().slice(0, 7) : value, z.string().optional()),
      payPeriodStart: z.coerce.date().optional(),
      payPeriodEnd: z.coerce.date().optional(),
      notes: z.string().optional(),
      basicSalary: z.number().optional(),
      allowances: z.number().optional(),
      deductions: z.number().optional(),
      tax: z.number().optional(),
      netSalary: z.number().optional(),
      status: z.enum(["draft", "processed", "paid"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      const ownedRows = await db.select({ employeeId: employees.id })
        .from(payroll)
        .innerJoin(employees, eq(employees.id, payroll.employeeId))
        .where(and(eq(payroll.id, id), payrollEmployeeScope(ctx.user.organizationId)))
        .limit(1);
      if (!ownedRows.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payroll record not found" });
      }
      if (data.employeeId) {
        const targetEmployee = await db.select({ id: employees.id }).from(employees)
          .where(and(eq(employees.id, data.employeeId), payrollEmployeeScope(ctx.user.organizationId)))
          .limit(1);
        if (!targetEmployee.length) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Employee must belong to your payroll workspace" });
        }
      }
      const now = normalizeDateValue(new Date());
      
      let derivedStart: string | undefined = undefined;
      if ((data as any).month) {
        try {
          const monthValue: any = (data as any).month;
          if (monthValue instanceof Date) {
            derivedStart = normalizeDateValue(monthValue);
          } else {
            derivedStart = normalizeDateValue(new Date(`${String(monthValue)}-01`));
          }
        } catch (e) {
          derivedStart = undefined;
        }
      }

      const updateData: any = {
        ...data,
        payPeriodStart: (data as any).payPeriodStart ? normalizeDateValue((data as any).payPeriodStart) : derivedStart || undefined,
        payPeriodEnd: (data as any).payPeriodEnd ? normalizeDateValue((data as any).payPeriodEnd) : undefined,
        updatedAt: now,
      };

      // remove frontend-only key
      delete updateData.month;

      await db.update(payroll).set(updateData as any).where(eq(payroll.id, id));
      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("payroll:delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const ownedRows = await db.select({ employeeId: payroll.employeeId })
        .from(payroll)
        .innerJoin(employees, eq(employees.id, payroll.employeeId))
        .where(and(eq(payroll.id, input), payrollEmployeeScope(ctx.user.organizationId)))
        .limit(1);
      if (!ownedRows.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payroll record not found" });
      }
      await db.delete(payroll).where(and(
        eq(payroll.id, input),
        inArray(payroll.employeeId, ownedRows.map((row: any) => row.employeeId)),
      ));
      return { success: true };
    }),

  // bulk operations for payroll records (Tier 3)
  bulkUpdateStatus: createFeatureRestrictedProcedure("payroll:edit")
    .input(z.object({
      ids: z.array(z.string()).optional(),
      payrollIds: z.array(z.string()).optional(),
      status: z.enum(["draft", "processed", "paid"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const ids = resolvePayrollIds(input) as string[];

      if (ids.length === 0) {
        return { success: true };
      }

      const scopedIds = await getScopedPayrollIds(db, ids, ctx.user.organizationId);
      if (scopedIds.length > 0) {
        await db
          .update(payroll)
          .set({ status: input.status })
          .where(inArray(payroll.id, scopedIds));
      }
      return { success: true };
    }),

  bulkDelete: createFeatureRestrictedProcedure("payroll:delete")
    .input(z.object({ ids: z.array(z.string()).optional(), payrollIds: z.array(z.string()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const ids = resolvePayrollIds(input);
      if (ids.length === 0) return { success: true };
      const scopedIds = await getScopedPayrollIds(db, ids, ctx.user.organizationId);
      if (scopedIds.length > 0) await db.delete(payroll).where(inArray(payroll.id, scopedIds));
      return { success: true };
    }),

  bulkExport: createFeatureRestrictedProcedure("payroll:read")
    .input(z.object({
      ids: z.array(z.string()).optional(),
      payrollIds: z.array(z.string()).optional(),
      format: z.enum(["xlsx", "csv"]).default("xlsx"),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const ids = resolvePayrollIds(input);
      if (ids.length === 0) {
        return { success: false, message: "No records selected" };
      }
      const scopedIds = await getScopedPayrollIds(database, ids, ctx.user.organizationId);
      if (scopedIds.length === 0) return { success: false, message: "No records selected" };

      let query = database
        .select()
        .from(payroll)
        .where(inArray(payroll.id, scopedIds));

      const records: any[] = await (query as any);
      if (records.length === 0) {
        return { success: false, message: "No records selected" };
      }

      if (input.format === "xlsx") {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Payroll");
        worksheet.columns = [
          { header: "Employee ID", key: "employeeId", width: 20 },
          { header: "Payment Date", key: "paymentDate", width: 15 },
          { header: "Basic Salary", key: "basicSalary", width: 14 },
          { header: "Allowances", key: "allowances", width: 12 },
          { header: "Deductions", key: "deductions", width: 12 },
          { header: "Net Salary", key: "netSalary", width: 12 },
          { header: "Status", key: "status", width: 10 },
        ];
        records.forEach((r) => worksheet.addRow(r));
        const buffer = await workbook.xlsx.writeBuffer();
        return { data: Buffer.from(buffer as ArrayBuffer).toString("base64"), format: "xlsx" };
      } else {
        const headers = [
          "Employee ID",
          "Payment Date",
          "Basic Salary",
          "Allowances",
          "Deductions",
          "Net Salary",
          "Status",
        ];
        const rows = records.map((r) => [
          r.employeeId,
          r.paymentDate,
          r.basicSalary,
          r.allowances,
          r.deductions,
          r.netSalary,
          r.status,
        ]);
        const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        return { data: csv, format: "csv" };
      }
    }),

  // ===================== Salary Structure Management =====================
  salaryStructures: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      try {
        const rows = await db.select({ structure: salaryStructures, employeeSalary: employees.salary })
          .from(salaryStructures)
          .innerJoin(employees, eq(employees.id, salaryStructures.employeeId))
          .where(payrollEmployeeScope(ctx.user.organizationId));
        return rows.map(({ structure, employeeSalary }) => ({
          ...structure,
          ...(employeeSalary != null ? { basicSalary: Math.round(Number(employeeSalary) * 100) } : {}),
        }));
      } catch (error) {
        console.warn("Error fetching salary structures:", error);
        return [];
      }
    }),

    byEmployee: createFeatureRestrictedProcedure("payroll:read")
      .input(z.object({ employeeId: z.string() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        const employeeConditions = [eq(employees.id, input.employeeId)];
        employeeConditions.push(payrollEmployeeScope(ctx.user.organizationId));
        const [employee] = await db.select({ id: employees.id })
          .from(employees)
          .where(and(...employeeConditions))
          .limit(1);
        if (!employee) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
        }

        const rows = await db.select({ structure: salaryStructures, employeeSalary: employees.salary })
          .from(salaryStructures)
          .leftJoin(employees, eq(employees.id, salaryStructures.employeeId))
          .where(eq(salaryStructures.employeeId, input.employeeId))
          .orderBy(desc(salaryStructures.effectiveDate));
        return rows.map(({ structure, employeeSalary }) => ({
          ...structure,
          ...(employeeSalary != null ? { basicSalary: Math.round(Number(employeeSalary) * 100) } : {}),
        }));
      }),

    create: createFeatureRestrictedProcedure("payroll:create")
      .input(z.object({
        employeeId: z.string(),
        basicSalary: z.number(),
        allowances: z.number().optional().default(0),
        deductions: z.number().optional().default(0),
        taxRate: z.number().optional().default(0),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [employee] = await db.select({ id: employees.id }).from(employees)
          .where(and(eq(employees.id, input.employeeId), payrollEmployeeScope(ctx.user.organizationId)))
          .limit(1);
        if (!employee) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
        const id = uuidv4();
        const now = new Date();
        await db.insert(salaryStructures).values({
          id,
          ...input,
          effectiveDate: now,
          createdBy: ctx.user.id,
          createdAt: now,
          updatedAt: now,
        } as any);
        await db.update(employees).set({ salary: input.basicSalary / 100, updatedAt: now } as any)
          .where(eq(employees.id, input.employeeId));

        return { id };
      }),

    update: createFeatureRestrictedProcedure("payroll:edit")
      .input(z.object({
        id: z.string(),
        basicSalary: z.number().optional(),
        allowances: z.number().optional(),
        deductions: z.number().optional(),
        taxRate: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        const now = new Date();
        const [structure] = await db.select({ employeeId: salaryStructures.employeeId })
          .from(salaryStructures)
          .innerJoin(employees, eq(employees.id, salaryStructures.employeeId))
          .where(and(eq(salaryStructures.id, id), payrollEmployeeScope(ctx.user.organizationId)))
          .limit(1);
        if (!structure) throw new TRPCError({ code: "NOT_FOUND", message: "Salary structure not found" });
        await db.update(salaryStructures).set({
          ...data,
          updatedAt: now,
        } as any).where(eq(salaryStructures.id, id));
        if (structure && input.basicSalary !== undefined) {
          await db.update(employees).set({ salary: input.basicSalary / 100, updatedAt: now } as any)
            .where(and(eq(employees.id, structure.employeeId), payrollEmployeeScope(ctx.user.organizationId)));
        }

        return { success: true };
      }),

    delete: createFeatureRestrictedProcedure("payroll:delete")
      .input(z.string())
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [structure] = await db.select({ employeeId: salaryStructures.employeeId })
          .from(salaryStructures)
          .innerJoin(employees, eq(employees.id, salaryStructures.employeeId))
          .where(and(eq(salaryStructures.id, input), payrollEmployeeScope(ctx.user.organizationId)))
          .limit(1);
        if (!structure) throw new TRPCError({ code: "NOT_FOUND", message: "Salary structure not found" });
        await db.delete(salaryStructures).where(and(
          eq(salaryStructures.id, input),
          eq(salaryStructures.employeeId, structure.employeeId),
        ));
        return { success: true };
      }),
  }),

  employeePackage: createFeatureRestrictedProcedure("payroll:read")
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const employeeConditions = [eq(employees.id, input.employeeId)];
      employeeConditions.push(payrollEmployeeScope(ctx.user.organizationId));
      const employee = await db.select().from(employees)
        .where(and(...employeeConditions))
        .limit(1);
      if (!employee.length) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      return {
        employee: employee[0],
        package: await getEmployeeCompensationPackage(db, input.employeeId),
      };
    }),

  // ===================== Salary Allowances Management =====================
  allowances: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const rows = await db.select({ item: salaryAllowances }).from(salaryAllowances)
          .innerJoin(employees, eq(employees.id, salaryAllowances.employeeId))
          .where(payrollEmployeeScope(ctx.user.organizationId));
        return rows.map((row: any) => row.item);
      } catch (error) {
        console.warn("Error fetching salary allowances:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load salary allowances", cause: error });
      }
    }),

    byEmployee: createFeatureRestrictedProcedure("payroll:read")
      .input(z.object({ employeeId: z.string() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        try {
          await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);
          return await db.select().from(salaryAllowances).where(eq(salaryAllowances.employeeId, input.employeeId));
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.warn("Error fetching salary allowances for employee:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load employee salary allowances", cause: error });
        }
      }),

    create: createFeatureRestrictedProcedure("payroll:create")
      .input(z.object({
        employeeId: z.string(),
        allowanceType: z.string(),
        amount: z.number(),
        frequency: z.enum(["monthly", "quarterly", "annual", "one_time"]),
        departmentIdOverride: z.string().optional(),
        glAccountId: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);
        await validatePayrollComponentAssignment(db, ctx.user.organizationId, input.departmentIdOverride, input.glAccountId, "expense");

        const id = uuidv4();
        const now = new Date();
        await db.insert(salaryAllowances).values({
          id,
          ...input,
          effectiveDate: now,
          isActive: true,
          createdBy: ctx.user.id,
          createdAt: now,
          updatedAt: now,
        } as any);

        return { id };
      }),

    update: createFeatureRestrictedProcedure("payroll:edit")
      .input(z.object({
        id: z.string(),
        allowanceType: z.string().optional(),
        amount: z.number().optional(),
        frequency: z.enum(["monthly", "quarterly", "annual", "one_time"]).optional(),
        departmentIdOverride: z.string().optional(),
        glAccountId: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        await requireScopedCompensationRecord(db, "allowance", id, ctx.user.organizationId);
        await validatePayrollComponentAssignment(db, ctx.user.organizationId, data.departmentIdOverride, data.glAccountId, "expense");
        const now = new Date();
        await db.update(salaryAllowances).set({
          ...data,
          updatedAt: now,
        } as any).where(eq(salaryAllowances.id, id));

        return { success: true };
      }),

    delete: createFeatureRestrictedProcedure("payroll:delete")
      .input(z.string())
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await requireScopedCompensationRecord(db, "allowance", input, ctx.user.organizationId);
        await db.delete(salaryAllowances).where(eq(salaryAllowances.id, input));
        return { success: true };
      }),
  }),

  createFromEmployeePackage: createFeatureRestrictedProcedure("payroll:create")
    .input(z.object({
      employeeId: z.string(),
      payPeriodStart: z.coerce.date(),
      payPeriodEnd: z.coerce.date(),
      basicSalaryOverride: z.number().optional(),
      status: z.enum(["draft", "processed", "paid"]).optional().default("draft"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const employee = await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);
      if (employee.jobGroupId) {
        const groupRows = await db.select().from(jobGroups).where(eq(jobGroups.id, employee.jobGroupId)).limit(1);
        if (groupRows[0]) {
          await applyJobGroupCompensationDefaults(db, employee, groupRows[0], ctx.user.id);
        }
      }
      const compensation = await getEmployeeCompensationPackage(db, input.employeeId);
      const basicSalary = input.basicSalaryOverride ?? compensation.basicSalary;
      if (basicSalary <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "A salary structure or basic salary override is required" });

      const allowanceTotal = compensation.totals.allowances;
      const fixedDeductions = compensation.totals.deductions + compensation.totals.employeeBenefits;
      const calculation = calculateKenyanPayroll({ basicSalary, allowances: allowanceTotal });
      const statutoryDeductions = calculation.nssfContribution + calculation.payeeTax + calculation.shifContribution + calculation.housingLevyDeduction;
      const payrollId = uuidv4();
      const now = normalizeDateValue(new Date());
      await db.insert(payroll).values({
        id: payrollId,
        employeeId: input.employeeId,
        payPeriodStart: normalizeDateValue(input.payPeriodStart),
        payPeriodEnd: normalizeDateValue(input.payPeriodEnd),
        basicSalary,
        allowances: allowanceTotal,
        deductions: fixedDeductions + statutoryDeductions,
        tax: calculation.payeeTax,
        netSalary: Math.max(0, calculation.netSalary - fixedDeductions),
        status: input.status,
        notes: input.notes || "Generated from employee compensation package",
        createdBy: ctx.user.id,
        createdAt: now,
        updatedAt: now,
      } as any);

      const details: Array<{ type: string; itemId?: string; name: string; amount: number }> = [
        ...compensation.allowances.map((row: any) => ({ type: "allowance", itemId: row.id, name: row.name, amount: row.amount })),
        ...compensation.deductions.map((row: any) => ({ type: "deduction", itemId: row.id, name: row.name, amount: row.amount })),
        ...compensation.benefits.filter((row: any) => row.employeeCost > 0).map((row: any) => ({ type: "benefit", itemId: row.id, name: row.name, amount: row.employeeCost })),
        { type: "statutory", name: "NSSF", amount: calculation.nssfContribution },
        { type: "statutory", name: "PAYE", amount: calculation.payeeTax },
        { type: "statutory", name: "SHIF", amount: calculation.shifContribution },
        { type: "statutory", name: "Housing Levy", amount: calculation.housingLevyDeduction },
        { type: "employer_contribution", name: "Employer NSSF", amount: calculation.nssfContribution },
        { type: "employer_contribution", name: "Employer Housing Levy", amount: calculation.housingLevyDeduction },
        ...compensation.benefits.filter((row: any) => row.employerCost > 0).map((row: any) => ({ type: "employer_contribution", itemId: row.id, name: `${row.name} (Employer)`, amount: row.employerCost })),
      ];
        for (const [index, detail] of details.entries()) {
        if (detail.amount > 0) {
          const isDeduction = detail.type === "deduction" || detail.type === "statutory" || detail.type === "benefit";
          await db.insert(payrollDetails).values({
            id: uuidv4(),
            payrollId,
            itemType: detail.type,
            itemId: detail.itemId || null,
            description: detail.name,
            amount: detail.amount,
            isDeduction,
            lineNumber: index + 1,
            componentType: detail.type,
            component: detail.name,
          } as any);
        }
      }
      return { id: payrollId, calculation, package: compensation };
    }),

  // ===================== Salary Deductions Management =====================
  deductions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      try {
        const rows = await db.select({ item: salaryDeductions }).from(salaryDeductions)
          .innerJoin(employees, eq(employees.id, salaryDeductions.employeeId))
          .where(payrollEmployeeScope(ctx.user.organizationId));
        return rows.map((row: any) => row.item);
      } catch (error) {
        console.warn("Error fetching salary deductions:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load salary deductions", cause: error });
      }
    }),

    byEmployee: createFeatureRestrictedProcedure("payroll:read")
      .input(z.object({ employeeId: z.string() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        try {
          await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);
          return await db.select().from(salaryDeductions).where(eq(salaryDeductions.employeeId, input.employeeId));
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.warn("Error fetching salary deductions for employee:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load employee salary deductions", cause: error });
        }
      }),

    create: createFeatureRestrictedProcedure("payroll:create")
      .input(z.object({
        employeeId: z.string(),
        deductionType: z.string(),
        amount: z.number(),
        frequency: z.enum(["monthly", "quarterly", "annual", "one_time"]),
        departmentIdOverride: z.string().optional(),
        glAccountId: z.string().optional(),
        reference: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);
        await validatePayrollComponentAssignment(db, ctx.user.organizationId, input.departmentIdOverride, input.glAccountId, "liability");

        const id = uuidv4();
        const now = new Date();
        await db.insert(salaryDeductions).values({
          id,
          ...input,
          effectiveDate: now,
          isActive: true,
          createdBy: ctx.user.id,
          createdAt: now,
          updatedAt: now,
        } as any);

        return { id };
      }),

    update: createFeatureRestrictedProcedure("payroll:edit")
      .input(z.object({
        id: z.string(),
        deductionType: z.string().optional(),
        amount: z.number().optional(),
        frequency: z.enum(["monthly", "quarterly", "annual", "one_time"]).optional(),
        departmentIdOverride: z.string().optional(),
        glAccountId: z.string().optional(),
        reference: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        await requireScopedCompensationRecord(db, "deduction", id, ctx.user.organizationId);
        await validatePayrollComponentAssignment(db, ctx.user.organizationId, data.departmentIdOverride, data.glAccountId, "liability");
        const now = new Date();
        await db.update(salaryDeductions).set({
          ...data,
          updatedAt: now,
        } as any).where(eq(salaryDeductions.id, id));

        return { success: true };
      }),

    delete: createFeatureRestrictedProcedure("payroll:delete")
      .input(z.string())
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await requireScopedCompensationRecord(db, "deduction", input, ctx.user.organizationId);
        await db.delete(salaryDeductions).where(eq(salaryDeductions.id, input));
        return { success: true };
      }),
  }),

  // ===================== Employee Benefits Management =====================
  benefits: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      try {
        const rows = await db.select({ item: employeeBenefits }).from(employeeBenefits)
          .innerJoin(employees, eq(employees.id, employeeBenefits.employeeId))
          .where(payrollEmployeeScope(ctx.user.organizationId));
        return rows.map((row: any) => row.item);
      } catch (error) {
        console.warn("Error fetching employee benefits:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load employee benefits", cause: error });
      }
    }),

    byEmployee: createFeatureRestrictedProcedure("payroll:read")
      .input(z.object({ employeeId: z.string() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        try {
          await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);
          return await db.select().from(employeeBenefits).where(eq(employeeBenefits.employeeId, input.employeeId));
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.warn("Error fetching employee benefits for employee:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load employee benefits", cause: error });
        }
      }),

    create: createFeatureRestrictedProcedure("payroll:create")
      .input(z.object({
        employeeId: z.string(),
        benefitType: z.string(),
        provider: z.string().optional(),
        coverage: z.string().optional(),
        cost: z.number().optional(),
        employerCost: z.number().optional(),
        departmentIdOverride: z.string().optional(),
        glAccountId: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);
        await validatePayrollComponentAssignment(db, ctx.user.organizationId, input.departmentIdOverride, input.glAccountId, "expense");

        const id = uuidv4();
        const now = new Date();
        await db.insert(employeeBenefits).values({
          id,
          ...input,
          enrollDate: now,
          isActive: true,
          createdBy: ctx.user.id,
          createdAt: now,
          updatedAt: now,
        } as any);

        return { id };
      }),

    update: createFeatureRestrictedProcedure("payroll:edit")
      .input(z.object({
        id: z.string(),
        benefitType: z.string().optional(),
        provider: z.string().optional(),
        coverage: z.string().optional(),
        cost: z.number().optional(),
        employerCost: z.number().optional(),
        departmentIdOverride: z.string().optional(),
        glAccountId: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        await requireScopedCompensationRecord(db, "benefit", id, ctx.user.organizationId);
        await validatePayrollComponentAssignment(db, ctx.user.organizationId, data.departmentIdOverride, data.glAccountId, "expense");
        const now = new Date();
        await db.update(employeeBenefits).set({
          ...data,
          updatedAt: now,
        } as any).where(eq(employeeBenefits.id, id));

        return { success: true };
      }),

    delete: createFeatureRestrictedProcedure("payroll:delete")
      .input(z.string())
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await requireScopedCompensationRecord(db, "benefit", input, ctx.user.organizationId);
        await db.delete(employeeBenefits).where(eq(employeeBenefits.id, input));
        return { success: true };
      }),
  }),

  compensationItemDetails: createFeatureRestrictedProcedure("payroll:read")
    .input(z.object({
      kind: z.enum(["allowance", "deduction", "benefit"]),
      id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const record = await getCompensationRecord(db, input.kind, input.id);
      if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Compensation item not found" });

      const employeeRows = await db.select().from(employees).where(eq(employees.id, record.employeeId)).limit(1);
      assertCompensationEmployeeAccess(ctx, employeeRows[0]);
      const details = await db.select().from(payrollDetails).where(eq(payrollDetails.itemId, input.id));
      const payrollIds: string[] = [...new Set<string>(details.map((detail: any) => String(detail.payrollId)))];
      const payrollRows = payrollIds.length
        ? await db.select().from(payroll).where(inArray(payroll.id, payrollIds))
        : [];
      const payrollById = new Map<string, any>(payrollRows.map((row: any) => [row.id, row] as [string, any]));
      const history = details.map((detail: any) => {
        const payrollRecord = payrollById.get(detail.payrollId);
        return {
          id: detail.id,
          payrollId: detail.payrollId,
          amount: detail.amount,
          itemType: detail.itemType,
          description: detail.description,
          payPeriodStart: payrollRecord?.payPeriodStart ?? null,
          payPeriodEnd: payrollRecord?.payPeriodEnd ?? null,
          payrollStatus: payrollRecord?.status ?? "unknown",
        };
      }).sort((a: any, b: any) =>
        new Date(b.payPeriodStart || 0).getTime() - new Date(a.payPeriodStart || 0).getTime()
      );
      return {
        kind: input.kind,
        item: record,
        employee: employeeRows[0] || null,
        totals: {
          payrollLineCount: history.length,
          payrollTotal: history.reduce((sum: number, line: any) => sum + Number(line.amount || 0), 0),
          employeePayrollTotal: history
            .filter((line: any) => line.itemType !== "employer_contribution")
            .reduce((sum: number, line: any) => sum + Number(line.amount || 0), 0),
          employerPayrollTotal: history
            .filter((line: any) => line.itemType === "employer_contribution")
            .reduce((sum: number, line: any) => sum + Number(line.amount || 0), 0),
          distinctPayrollCount: payrollIds.length,
        },
        history,
      };
    }),

  setCompensationItemActive: createFeatureRestrictedProcedure("payroll:edit")
    .input(z.object({
      kind: z.enum(["allowance", "deduction", "benefit"]),
      id: z.string(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const record = await getCompensationRecord(db, input.kind, input.id);
      if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Compensation item not found" });
      const employeeRows = await db.select().from(employees).where(eq(employees.id, record.employeeId)).limit(1);
      assertCompensationEmployeeAccess(ctx, employeeRows[0]);
      await setCompensationRecordActive(db, input.kind, input.id, input.isActive);
      return { success: true, isActive: input.isActive };
    }),

  // ===================== Tax Information Management =====================
  taxInfo: router({
    byEmployee: createFeatureRestrictedProcedure("payroll:read")
      .input(z.object({ employeeId: z.string() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return null;
        await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);
        const result = await db.select().from(employeeTaxInfo).where(eq(employeeTaxInfo.employeeId, input.employeeId));
        return result[0] || null;
      }),

    create: createFeatureRestrictedProcedure("payroll:create")
      .input(z.object({
        employeeId: z.string(),
        taxNumber: z.string(),
        taxBracket: z.string().optional(),
        exemptions: z.number().optional().default(0),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);

        const id = uuidv4();
        const now = new Date();
        await db.insert(employeeTaxInfo).values({
          id,
          ...input,
          effectiveDate: now,
          createdBy: ctx.user.id,
          createdAt: now,
          updatedAt: now,
        } as any);

        return { id };
      }),

    update: createFeatureRestrictedProcedure("payroll:edit")
      .input(z.object({
        id: z.string(),
        taxBracket: z.string().optional(),
        exemptions: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        const [record] = await db.select({ employeeId: employeeTaxInfo.employeeId }).from(employeeTaxInfo)
          .where(eq(employeeTaxInfo.id, id)).limit(1);
        if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Tax information not found" });
        await requirePayrollWorkspaceEmployee(db, record.employeeId, ctx.user.organizationId);
        const now = new Date();
        await db.update(employeeTaxInfo).set({
          ...data,
          updatedAt: now,
        } as any).where(eq(employeeTaxInfo.id, id));

        return { success: true };
      }),

    delete: createFeatureRestrictedProcedure("payroll:delete")
      .input(z.string())
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [record] = await db.select({ employeeId: employeeTaxInfo.employeeId }).from(employeeTaxInfo)
          .where(eq(employeeTaxInfo.id, input)).limit(1);
        if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Tax information not found" });
        await requirePayrollWorkspaceEmployee(db, record.employeeId, ctx.user.organizationId);
        await db.delete(employeeTaxInfo).where(eq(employeeTaxInfo.id, input));
        return { success: true };
      }),
  }),

  // ===================== Salary Increment Management =====================
  increments: router({
    byEmployee: createFeatureRestrictedProcedure("payroll:read")
      .input(z.object({ employeeId: z.string() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);
        return await db.select().from(salaryIncrements).where(eq(salaryIncrements.employeeId, input.employeeId));
      }),

    create: createFeatureRestrictedProcedure("payroll:create")
      .input(z.object({
        employeeId: z.string(),
        previousSalary: z.number(),
        newSalary: z.number(),
        reason: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await requirePayrollWorkspaceEmployee(db, input.employeeId, ctx.user.organizationId);

        const id = uuidv4();
        const previousSalary = input.previousSalary;
        const newSalary = input.newSalary;
        const incrementPercent = previousSalary > 0 ? ((newSalary - previousSalary) / previousSalary) * 10000 : 0;

        const now = new Date();
        await db.insert(salaryIncrements).values({
          id,
          ...input,
          incrementPercent: Math.round(incrementPercent),
          effectiveDate: now,
          createdBy: ctx.user.id,
          createdAt: now,
        } as any);

        return { id };
      }),

    approve: createFeatureRestrictedProcedure("payroll:edit")
      .input(z.object({
        id: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [increment] = await db.select({ employeeId: salaryIncrements.employeeId }).from(salaryIncrements)
          .where(eq(salaryIncrements.id, input.id)).limit(1);
        if (!increment) throw new TRPCError({ code: "NOT_FOUND", message: "Salary increment not found" });
        await requirePayrollWorkspaceEmployee(db, increment.employeeId, ctx.user.organizationId);

        await db.update(salaryIncrements).set({
          approvedBy: ctx.user.id,
          approvalDate: new Date(),
        } as any).where(eq(salaryIncrements.id, input.id));

        return { success: true };
      }),

    update: createFeatureRestrictedProcedure("payroll:edit")
      .input(z.object({
        id: z.string(),
        previousSalary: z.number().optional(),
        newSalary: z.number().optional(),
        reason: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;
        const updateData: any = { ...data };
        
        if (data.previousSalary && data.newSalary) {
          const incrementPercent = data.previousSalary > 0 ? ((data.newSalary - data.previousSalary) / data.previousSalary) * 10000 : 0;
          updateData.incrementPercent = Math.round(incrementPercent);
        }

        await db.update(salaryIncrements).set({
          ...updateData,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        } as any).where(eq(salaryIncrements.id, id));

        return { success: true };
      }),

    delete: createFeatureRestrictedProcedure("payroll:delete")
      .input(z.string())
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(salaryIncrements).where(eq(salaryIncrements.id, input));
        return { success: true };
      }),
  }),

  // ===================== Payroll Approval Workflow =====================
  approvals: router({
    list: createFeatureRestrictedProcedure("payroll:read")
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const params = input || {};
        const conditions: any[] = [];
        if (params.status) conditions.push(eq(payrollApprovals.status, params.status as any));
        const rows = await db.select().from(payrollApprovals).where(conditions.length ? and(...conditions) : undefined);
        // Join with payroll + employees for display names & salary info
        const payrollIds = Array.from(new Set(rows.map((r: any) => (r as any).payrollId))) as string[];
        if (payrollIds.length === 0) return [];
        const payrollRows = await db.select().from(payroll).where(inArray(payroll.id, payrollIds as any));
        const empIds = Array.from(new Set(payrollRows.map((p: any) => p.employeeId))) as string[];
        const empRows = empIds.length ? await db.select().from(employees).where(inArray(employees.id, empIds as any)) : [];
        const payrollMap = Object.fromEntries(payrollRows.map(p => [p.id, p]));
        const empMap = Object.fromEntries(empRows.map(e => [e.id, e]));
        return rows.map((r: any) => {
          const pr = payrollMap[r.payrollId];
          const emp = pr ? empMap[pr.employeeId] : null;
          return {
            ...r,
            employeeName: emp ? `${emp.firstName || ""} ${emp.lastName || ""}`.trim() : "Unknown",
            basicSalary: pr?.basicSalary || 0,
            netSalary: pr?.netSalary || 0,
            payPeriodStart: pr?.payPeriodStart,
            payPeriodEnd: pr?.payPeriodEnd,
          };
        });
      }),

    byPayroll: createFeatureRestrictedProcedure("payroll:read")
      .input(z.object({ payrollId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(payrollApprovals).where(eq(payrollApprovals.payrollId, input.payrollId));
      }),

    create: createFeatureRestrictedProcedure("payroll:create")
      .input(z.object({
        payrollId: z.string(),
        approverRole: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const id = uuidv4();
        await db.insert(payrollApprovals).values({
          id,
          ...input,
          approverId: ctx.user.id,
          status: "pending",
          createdAt: new Date(),
        } as any);

        return { id };
      }),

    approve: createFeatureRestrictedProcedure("payroll:edit")
      .input(z.object({
        id: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.update(payrollApprovals).set({
          status: "approved",
          approvalDate: new Date(),
        } as any).where(eq(payrollApprovals.id, input.id));

        return { success: true };
      }),

    reject: createFeatureRestrictedProcedure("payroll:edit")
      .input(z.object({
        id: z.string(),
        reason: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.update(payrollApprovals).set({
          status: "rejected",
          rejectionReason: input.reason,
          approvalDate: new Date(),
        } as any).where(eq(payrollApprovals.id, input.id));

        return { success: true };
      }),
  }),

  // ===================== Kenyan Payroll Calculation =====================
  kenyanCalculate: protectedProcedure
    .input(z.object({
      basicSalary: z.number(),
      allowances: z.number().optional().default(0),
      housingAllowance: z.number().optional().default(0),
    }))
    .query(async ({ input }) => {
      try {
        const result = calculateKenyanPayroll({
          basicSalary: input.basicSalary,
          allowances: input.allowances,
          housingAllowance: input.housingAllowance,
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to calculate payroll'
        });
      }
    }),

  // Save calculated Kenyan payroll
  saveKenyanPayroll: createFeatureRestrictedProcedure("payroll:create")
    .input(z.object({
      employeeId: z.string(),
      basicSalary: z.number(),
      allowances: z.number().optional().default(0),
      housingAllowance: z.number().optional().default(0),
      payPeriodStart: z.coerce.date(),
      payPeriodEnd: z.coerce.date(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Calculate payroll using Kenyan system
        const calculation = calculateKenyanPayroll({
          basicSalary: input.basicSalary,
          allowances: input.allowances,
          housingAllowance: input.housingAllowance,
        });

        const payrollId = uuidv4();

        // Save main payroll record
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const periodStart = input.payPeriodStart.toISOString().replace('T', ' ').substring(0, 19);
        const periodEnd = input.payPeriodEnd.toISOString().replace('T', ' ').substring(0, 19);
        
        await db.insert(payroll).values({
          id: payrollId,
          employeeId: input.employeeId,
          payPeriodStart: periodStart,
          payPeriodEnd: periodEnd,
          status: "processed",
          basicSalary: calculation.basicSalary,
          allowances: input.allowances * 100,
          deductions: calculation.nssfContribution + calculation.payeeTax + calculation.shifContribution + calculation.housingLevyDeduction,
          tax: calculation.payeeTax,
          netSalary: calculation.netSalary,
          notes: input.notes || `Kenyan payroll: NSSF=${calculation.nssfContribution}, PAYE=${calculation.payeeTax}, SHIF=${calculation.shifContribution}, Housing=${calculation.housingLevyDeduction}`,
          createdBy: ctx.user.id,
          createdAt: now,
          updatedAt: now,
        } as any);

        // Save detailed breakdown as payroll details
        const components = [
          { type: 'allowance', name: 'Allowances', amount: input.allowances * 100 },
          { type: 'deduction', name: 'NSSF Tier 1', amount: calculation.details.nssfTier1 },
          { type: 'deduction', name: 'NSSF Tier 2', amount: calculation.details.nssfTier2 },
          { type: 'deduction', name: 'PAYE Tax', amount: calculation.payeeTax },
          { type: 'deduction', name: 'SHIF Contribution', amount: calculation.shifContribution },
          { type: 'deduction', name: 'Housing Levy', amount: calculation.housingLevyDeduction },
          { type: 'deduction', name: 'Personal Relief', amount: calculation.personalRelief },
        ];

        for (const [index, comp] of components.entries()) {
          if (comp.amount > 0) {
            await db.insert(payrollDetails).values({
              id: uuidv4(),
              payrollId,
              itemType: comp.type,
              itemId: null,
              description: comp.name,
              isDeduction: comp.type === 'deduction',
              lineNumber: index + 1,
              componentType: comp.type,
              component: comp.name,
              amount: comp.amount,
              notes: `${comp.name} deduction for ${periodStart.split(' ')[0]}`,
            } as any);
          }
        }

        return {
          id: payrollId,
          calculation,
          message: 'Kenyan payroll created successfully'
        };
      } catch (error) {
        console.error('Payroll save error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save payroll'
        });
      }
    }),

  // ===================== P9 Form Generation =====================
  // Generate and send KRA P9 form to employee
  generateP9: createFeatureRestrictedProcedure("payroll:read")
    .input(z.object({
      employeeId: z.string(),
      taxYear: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const organizationId = resolveP9OrganizationScope(ctx.user);
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const certifiedBy = ctx.user.firstName ? `${ctx.user.firstName} ${ctx.user.lastName}` : "HR Manager";
        const generated = await buildP9ForEmployee(db, input.employeeId, certifiedBy, input.taxYear, organizationId);

        return {
          success: true,
          data: {
            htmlContent: generated.htmlContent,
            fileName: generated.fileName,
            employeeName: generated.employeeName,
          },
        };
      } catch (error: any) {
        console.error('P9 form generation error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to generate P9 form: ${error?.message || 'Unknown error'}`,
        });
      }
    }),

  // Download P9 form as PDF/HTML
  downloadP9: createFeatureRestrictedProcedure("payroll:read")
    .input(z.object({
      employeeId: z.string(),
      format: z.enum(['html', 'pdf']).optional().default('html'),
    }))
    .mutation(async ({ input, ctx }) => {
      const organizationId = resolveP9OrganizationScope(ctx.user);
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const certifiedBy = ctx.user.firstName ? `${ctx.user.firstName} ${ctx.user.lastName}` : "HR Manager";
        const generated = await buildP9ForEmployee(db, input.employeeId, certifiedBy, undefined, organizationId);

        return {
          success: true,
          data: generated.htmlContent,
          fileName: generated.fileName,
          mimeType: 'text/html',
        };
      } catch (error: any) {
        console.error('P9 download error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to download P9: ${error?.message || 'Unknown error'}`,
        });
      }
    }),

  // List and send P9 forms to multiple employees
  sendP9ToMultiple: createFeatureRestrictedProcedure("payroll:read")
    .input(z.object({
      employeeIds: z.array(z.string()),
      sendEmail: z.boolean().optional().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const organizationId = resolveP9OrganizationScope(ctx.user);
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const results = [];
        const errors = [];
        const certifiedBy = ctx.user.firstName ? `${ctx.user.firstName} ${ctx.user.lastName}` : "HR Manager";

        for (const employeeId of input.employeeIds) {
          try {
            const p9Result = await buildP9ForEmployee(db, employeeId, certifiedBy, undefined, organizationId);
            results.push({
              employeeId,
              success: true,
              fileName: p9Result.fileName,
            });
          } catch (err: any) {
            errors.push({
              employeeId,
              success: false,
              error: err?.message || 'Unknown error',
            });
          }
        }

        return {
          success: errors.length === 0,
          generated: results.length,
          failed: errors.length,
          results,
          errors,
        };
      } catch (error: any) {
        console.error('Bulk P9 generation error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to generate P9 forms: ${error?.message || 'Unknown error'}`,
        });
      }
    }),

  // ===================== Automated Payroll Admin Triggers =====================

  /** Manually trigger monthly payroll processing (admin/HR only) */
  processMonthly: createFeatureRestrictedProcedure("payroll:create")
    .input(z.object({
      year: z.number().optional(),
      month: z.number().min(1).max(12).optional(),
    }).optional())
    .mutation(async ({ input, ctx }) => {
      const result = await processMonthlyPayroll(input?.year, input?.month, ctx.user.id, ctx.user.organizationId ?? null);
      return result;
    }),

  processAndPay: createFeatureRestrictedProcedure("payroll:create")
    .input(z.object({
      year: z.number().optional(),
      month: z.number().min(1).max(12).optional(),
    }).optional())
    .mutation(async ({ input, ctx }) => {
      return processAndPayPayroll(input?.year, input?.month, ctx.user.id, ctx.user.organizationId ?? null);
    }),

  /** Manually trigger payslip dispatch (admin/HR only) */
  dispatchPayslips: createFeatureRestrictedProcedure("payroll:create")
    .input(z.object({
      year: z.number().optional(),
      month: z.number().min(1).max(12).optional(),
    }).optional())
    .mutation(async ({ input, ctx }) => {
      const result = await processAndDispatchPayslips(input?.year, input?.month, ctx.user.id, ctx.user.organizationId ?? null);
      return result;
    }),
});
