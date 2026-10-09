import { and, desc, eq, gte, inArray, isNull, lt, lte, or } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createHash } from "node:crypto";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import { accounts, departments, employeeCostAllocations, employees, jobGroups, payroll, payrollCostCenters, payrollLedgerEntries, reportExportAuditLogs } from "../../drizzle/schema";
import { departmentBudgets, employeeBenefits, payrollComponentMappings, salaryAllowances, salaryStructures } from "../../drizzle/schema-extended";
import { createFeatureRestrictedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  countConsecutiveOverBudgetQuarters,
  splitCents,
  toAllocationBasisPoints,
} from "../services/payrollCostAllocationService";
import { resolvePayrollCostCenterScope } from "../services/payrollCostCenterScope";
import { v4 as uuidv4 } from "uuid";
import { calculateKenyanPayroll } from "../utils/kenyan-payroll-calculator";
import { parseJobGroupPayrollDefaults, resolveJobGroupPayrollAmount, resolveJobGroupPayrollBasisSalary } from "../services/jobGroupPayrollDefaults";

const monthlyAmountCents = (amount: unknown, frequency: unknown) => {
  const value = Number(amount || 0);
  if (frequency === "quarterly") return Math.round(value / 3);
  if (frequency === "annual") return Math.round(value / 12);
  return value;
};

const readProcedure = createFeatureRestrictedProcedure("payroll:read");
const manageProcedure = createFeatureRestrictedProcedure("payroll:create");
const requireCostCenterScope = (user: { organizationId?: string | null; role?: string | null; effectiveRole?: string | null }) => {
  return resolvePayrollCostCenterScope(user);
};
const organizationScopeCondition = (column: any, organizationId: string | null) =>
  organizationId === null ? isNull(column) : eq(column, organizationId);
const costCenterScopeCondition = (organizationId: string | null) =>
  organizationScopeCondition(payrollCostCenters.organizationId, organizationId);
const departmentScopeCondition = (organizationId: string | null) =>
  organizationScopeCondition(departments.organizationId, organizationId);

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD dates");
const expenseAccountTypes = ["expense", "operating expense", "cost of goods sold", "other expense"];

async function validatePayrollAccounts(
  database: any,
  organizationId: string | null,
  expenseAccountId: string,
  payrollLiabilityAccountId: string,
) {
  const rows = await database.select({
    id: accounts.id,
    accountType: accounts.accountType,
    isActive: accounts.isActive,
  }).from(accounts).where(and(
    inArray(accounts.id, [expenseAccountId, payrollLiabilityAccountId]),
    organizationScopeCondition(accounts.organizationId, organizationId),
  ));
  const expense = rows.find((account: any) => account.id === expenseAccountId);
  const liability = rows.find((account: any) => account.id === payrollLiabilityAccountId);
  if (!expense || expense.isActive !== 1 || !expenseAccountTypes.includes(expense.accountType)) {
    throw new Error("Select an active expense account from this payroll workspace's Chart of Accounts");
  }
  if (!liability || liability.isActive !== 1 || liability.accountType !== "liability") {
    throw new Error("Select an active liability account from this payroll workspace's Chart of Accounts");
  }
}

export const payrollAllocationsRouter = router({
  setDepartmentPayrollBudget: manageProcedure
    .input(z.object({
      departmentId: z.string().min(1),
      year: z.number().int().min(2000).max(2200),
      budgetCode: z.string().trim().min(1).max(100),
      annualBudget: z.number().positive(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      const [department] = await database.select({ id: departments.id })
        .from(departments)
        .where(and(eq(departments.id, input.departmentId), departmentScopeCondition(organizationId)))
        .limit(1);
      if (!department) throw new TRPCError({ code: "NOT_FOUND", message: "Department not found in this payroll workspace." });

      const budgetedAmount = Math.round(input.annualBudget * 100);
      const [sameCode] = await database.select({ id: departmentBudgets.id })
        .from(departmentBudgets)
        .where(and(
          organizationScopeCondition(departmentBudgets.organizationId, organizationId),
          eq(departmentBudgets.year, input.year),
          eq(departmentBudgets.category, "payroll"),
          eq(departmentBudgets.budgetCode, input.budgetCode),
        ))
        .limit(1);
      const [existing] = await database.select()
        .from(departmentBudgets)
        .where(and(
          organizationScopeCondition(departmentBudgets.organizationId, organizationId),
          eq(departmentBudgets.departmentId, input.departmentId),
          eq(departmentBudgets.year, input.year),
          eq(departmentBudgets.category, "payroll"),
        ))
        .limit(1);
      if (sameCode && sameCode.id !== existing?.id) {
        throw new TRPCError({ code: "CONFLICT", message: "That payroll budget code is already used in this workspace and fiscal year." });
      }

      if (existing) {
        const spent = Number(existing.spent || 0);
        await database.update(departmentBudgets).set({
          budgetCode: input.budgetCode,
          budgetedAmount,
          remaining: budgetedAmount - spent,
          budgetStatus: spent > budgetedAmount ? "over" : spent === budgetedAmount ? "at" : "under",
          updatedAt: new Date(),
        }).where(eq(departmentBudgets.id, existing.id));
        return { id: existing.id, budgetCode: input.budgetCode };
      }

      const id = uuidv4();
      await database.insert(departmentBudgets).values({
        id,
        organizationId,
        departmentId: input.departmentId,
        year: input.year,
        category: "payroll",
        budgetCode: input.budgetCode,
        budgetedAmount,
        spent: 0,
        remaining: budgetedAmount,
        budgetStatus: "under",
        createdBy: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      return { id, budgetCode: input.budgetCode };
    }),

  listEmployees: readProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");
    const organizationId = requireCostCenterScope(ctx.user);
    return database.select({
      id: employees.id,
      firstName: employees.firstName,
      lastName: employees.lastName,
      employeeNumber: employees.employeeNumber,
      organizationId: employees.organizationId,
    }).from(employees).where(and(
      organizationScopeCondition(employees.organizationId, organizationId),
      inArray(employees.status, ["active", "on_leave"]),
    ));
  }),

  getBudgetPreview: readProcedure
    .input(z.object({ payrollPeriod: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);

      const [year, month] = input.payrollPeriod.split("-").map(Number);
      const quarter = Math.floor((month - 1) / 3);
      const quarterStartMonth = quarter * 3 + 1;
      const quarterStart = `${year}-${String(quarterStartMonth).padStart(2, "0")}-01`;
      const payrollMonthStart = `${year}-${String(month).padStart(2, "0")}-01`;
      const payrollMonthEnd = `${year}-${String(month).padStart(2, "0")}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")} 23:59:59`;
      const nextMonthStart = month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const departmentsInScope = await database.select({
        id: departments.id,
        name: departments.name,
      }).from(departments).where(departmentScopeCondition(organizationId));
      const budgets = await database.select({
        departmentId: departmentBudgets.departmentId,
        year: departmentBudgets.year,
        budgetedAmount: departmentBudgets.budgetedAmount,
      }).from(departmentBudgets).where(and(
        organizationScopeCondition(departmentBudgets.organizationId, organizationId),
        eq(departmentBudgets.category, "payroll"),
        lt(departmentBudgets.year, year + 1),
      ));
      const earliestBudgetYear = budgets.length
        ? Math.min(...budgets.map((budget: any) => Number(budget.year)))
        : year;
      const ledgerRows = await database.select({
        departmentId: payrollCostCenters.departmentId,
        fullyBurdenedCostCents: payrollLedgerEntries.fullyBurdenedCostCents,
        payrollPeriodStart: payrollLedgerEntries.payrollPeriodStart,
      }).from(payrollLedgerEntries)
        .innerJoin(payrollCostCenters, eq(payrollLedgerEntries.costCenterId, payrollCostCenters.id))
        .where(and(
          organizationScopeCondition(payrollLedgerEntries.organizationId, organizationId),
          gte(payrollLedgerEntries.payrollPeriodStart, `${earliestBudgetYear}-01-01`),
          lte(payrollLedgerEntries.payrollPeriodStart, payrollMonthStart),
        ));
      const employeeRows = await database.select({
        id: employees.id,
        department: employees.department,
        salary: employees.salary,
        jobGroupId: employees.jobGroupId,
      }).from(employees).where(and(
        organizationScopeCondition(employees.organizationId, organizationId),
        eq(employees.status, "active"),
      ));
      const employeeIds: string[] = employeeRows.map((employee: any) => employee.id);
      const jobGroupIds: string[] = [...new Set<string>((employeeRows as any[])
        .map((employee) => employee.jobGroupId)
        .filter((id): id is string => typeof id === "string" && id.length > 0))];
      const [salaryStructureRows, allowanceRows, benefitRows, jobGroupRows] = employeeIds.length
        ? await Promise.all([
          database.select().from(salaryStructures).where(and(
            inArray(salaryStructures.employeeId, employeeIds),
            lte(salaryStructures.effectiveDate, new Date(payrollMonthEnd)),
          )).orderBy(desc(salaryStructures.effectiveDate)),
          database.select().from(salaryAllowances).where(and(
            inArray(salaryAllowances.employeeId, employeeIds),
            eq(salaryAllowances.isActive, true),
            lte(salaryAllowances.effectiveDate, new Date(payrollMonthEnd)),
          )),
          database.select().from(employeeBenefits).where(and(
            inArray(employeeBenefits.employeeId, employeeIds),
            eq(employeeBenefits.isActive, true),
            lte(employeeBenefits.enrollDate, new Date(payrollMonthEnd)),
          )),
          jobGroupIds.length
            ? database.select({
              id: jobGroups.id,
              minimumGrossSalary: jobGroups.minimumGrossSalary,
              maximumGrossSalary: jobGroups.maximumGrossSalary,
              defaultBasicSalary: jobGroups.defaultBasicSalary,
              defaultAllowances: jobGroups.defaultAllowances,
              defaultBenefits: jobGroups.defaultBenefits,
            }).from(jobGroups).where(and(
              inArray(jobGroups.id, jobGroupIds),
              organizationScopeCondition(jobGroups.organizationId, organizationId),
            ))
            : Promise.resolve([]),
        ]) as [any[], any[], any[], any[]]
        : [[], [], [], []];
      const allocationRows = employeeIds.length
        ? await database.select({
          employeeId: employeeCostAllocations.employeeId,
          costCenterId: employeeCostAllocations.costCenterId,
          allocationBasisPoints: employeeCostAllocations.allocationBasisPoints,
          effectiveDate: employeeCostAllocations.effectiveDate,
          departmentId: payrollCostCenters.departmentId,
        }).from(employeeCostAllocations)
          .innerJoin(payrollCostCenters, eq(employeeCostAllocations.costCenterId, payrollCostCenters.id))
          .where(and(
            organizationScopeCondition(employeeCostAllocations.organizationId, organizationId),
            lte(employeeCostAllocations.effectiveDate, payrollMonthStart),
            inArray(employeeCostAllocations.employeeId, employeeIds),
          ))
          .orderBy(desc(employeeCostAllocations.effectiveDate))
        : [];
      const existingPayrollRows = await database.select({
        employeeId: payroll.employeeId,
        payPeriodStart: payroll.payPeriodStart,
        basicSalary: payroll.basicSalary,
        allowances: payroll.allowances,
        status: payroll.status,
      }).from(payroll).innerJoin(employees, eq(payroll.employeeId, employees.id)).where(and(
        organizationScopeCondition(employees.organizationId, organizationId),
        gte(payroll.payPeriodStart, payrollMonthStart),
        lt(payroll.payPeriodStart, nextMonthStart),
        inArray(payroll.status, ["processed", "paid"]),
      ));

      const existingByEmployee = new Map<string, { basicSalaryCents: number; allowancesCents: number }>();
      for (const row of existingPayrollRows as any[]) {
        const existing = existingByEmployee.get(row.employeeId) ?? { basicSalaryCents: 0, allowancesCents: 0 };
        existing.basicSalaryCents += Number(row.basicSalary || 0);
        existing.allowancesCents += Number(row.allowances || 0);
        existingByEmployee.set(row.employeeId, existing);
      }
      const structureByEmployee = new Map<string, any>();
      for (const row of salaryStructureRows as any[]) {
        if (!structureByEmployee.has(row.employeeId)) structureByEmployee.set(row.employeeId, row);
      }
      const jobGroupById = new Map<string, any>((jobGroupRows as any[]).map((row: any) => [row.id, row] as [string, any]));
      const departmentById = new Map<string, any>(departmentsInScope.map((row: any) => [row.id, row] as [string, any]));
      const departmentByName = new Map<string, any>(departmentsInScope.map((row: any) =>
        [String(row.name).trim().toLowerCase(), row] as [string, any]));
      const projectedByDepartment = new Map<string, number>();
      const allocationByEmployee = new Map<string, Array<{ departmentId: string; allocationBasisPoints: number }>>();
      const latestAllocationDate = new Map<string, string>();
      for (const row of allocationRows as any[]) {
        if (!row.departmentId) continue;
        const effectiveDate = String(row.effectiveDate).slice(0, 10);
        if (!latestAllocationDate.has(row.employeeId)) latestAllocationDate.set(row.employeeId, effectiveDate);
        if (latestAllocationDate.get(row.employeeId) !== effectiveDate) continue;
        const allocations = allocationByEmployee.get(row.employeeId) ?? [];
        allocations.push({ departmentId: row.departmentId, allocationBasisPoints: row.allocationBasisPoints });
        allocationByEmployee.set(row.employeeId, allocations);
      }
      const actualByDepartmentQuarter = new Map<string, number>();
      for (const row of ledgerRows as any[]) {
        const period = String(row.payrollPeriodStart).slice(0, 7);
        const [periodYear, periodMonth] = period.split("-").map(Number);
        if (!periodYear || !periodMonth) continue;
        const quarterNumber = Math.ceil(periodMonth / 3);
        const key = `${row.departmentId}:${periodYear}:${quarterNumber}`;
        actualByDepartmentQuarter.set(
          key,
          (actualByDepartmentQuarter.get(key) ?? 0) + Number(row.fullyBurdenedCostCents || 0),
        );
      }
      for (const employee of employeeRows as any[]) {
        const departmentKey = String(employee.department ?? "").trim();
        const department = departmentById.get(departmentKey) ?? departmentByName.get(departmentKey.toLowerCase());
        if (!department) continue;
        const existing = existingByEmployee.get(employee.id);
        const structure = structureByEmployee.get(employee.id);
        const jobGroup = jobGroupById.get(employee.jobGroupId);
        const basicSalaryUnits = Number(employee.salary) > 0
          ? Number(employee.salary)
          : structure?.basicSalary != null
            ? Number(structure.basicSalary) / 100
            : resolveJobGroupPayrollBasisSalary(undefined, jobGroup);
        const basicSalaryCents = existing
          ? existing.basicSalaryCents
          : Math.round(basicSalaryUnits * 100);
        const activeAllowances = (allowanceRows as any[]).filter((row) => row.employeeId === employee.id &&
          (row.endDate == null || String(row.endDate).slice(0, 10) >= payrollMonthStart));
        const allowanceTypes = new Set(activeAllowances.map((row) => String(row.allowanceType).trim().toLowerCase()));
        const allowanceDefaultCents = parseJobGroupPayrollDefaults(jobGroup?.defaultAllowances)
          .filter((item) => !allowanceTypes.has(item.type.trim().toLowerCase()))
          .reduce((sum, item) => sum + monthlyAmountCents(resolveJobGroupPayrollAmount(item, basicSalaryUnits), item.frequency || "monthly"), 0);
        const allowanceCents = existing
          ? existing.allowancesCents
          : activeAllowances.reduce((sum, row) => sum + monthlyAmountCents(row.amount, row.frequency), Number(structure?.allowances || 0)) + allowanceDefaultCents;
        const activeBenefits = (benefitRows as any[]).filter((row) => row.employeeId === employee.id &&
          (row.endDate == null || String(row.endDate).slice(0, 10) >= payrollMonthStart));
        const benefitTypes = new Set(activeBenefits.map((row) => String(row.benefitType).trim().toLowerCase()));
        const defaultEmployerBenefitsCents = parseJobGroupPayrollDefaults(jobGroup?.defaultBenefits)
          .filter((item) => !benefitTypes.has(item.type.trim().toLowerCase()))
          .reduce((sum, item) => sum + resolveJobGroupPayrollAmount(item, basicSalaryUnits), 0);
        const employerBenefitsCents = activeBenefits.reduce((sum, row) => sum + Number(row.employerCost || 0), 0) +
          defaultEmployerBenefitsCents;
        const calculation = calculateKenyanPayroll({ basicSalary: basicSalaryCents, allowances: allowanceCents });
        const fullyBurdenedEstimate = calculation.grossSalary + calculation.nssfContribution +
          calculation.housingLevyDeduction + employerBenefitsCents;
        const componentOverrides = [
          ...activeAllowances
            .filter((row) => row.departmentIdOverride)
            .map((row) => ({
              departmentId: row.departmentIdOverride as string,
              amountCents: monthlyAmountCents(row.amount, row.frequency),
            })),
          ...activeBenefits
            .filter((row) => row.departmentIdOverride && Number(row.employerCost || 0) > 0)
            .map((row) => ({
              departmentId: row.departmentIdOverride as string,
              amountCents: Number(row.employerCost || 0),
            })),
        ];
        const overrideTotal = componentOverrides.reduce((sum, item) => sum + item.amountCents, 0);
        const split = allocationByEmployee.get(employee.id) ?? [{
          departmentId: department.id,
          allocationBasisPoints: 10_000,
        }];
        const baselineCents = Math.max(0, fullyBurdenedEstimate - overrideTotal);
        const basisPointsByDepartment = new Map<string, number>();
        for (const item of split) {
          basisPointsByDepartment.set(
            item.departmentId,
            (basisPointsByDepartment.get(item.departmentId) ?? 0) + item.allocationBasisPoints,
          );
        }
        const departmentAllocations = [...basisPointsByDepartment.entries()].map(([departmentId, allocationBasisPoints]) => ({
          costCenterId: departmentId,
          allocationBasisPoints,
        }));
        if (departmentAllocations.reduce((sum, item) => sum + item.allocationBasisPoints, 0) !== 10_000) {
          throw new Error(`Cost allocations for employee ${employee.id} must total 100% before budget preview.`);
        }
        const splitAmounts = splitCents(baselineCents, departmentAllocations);
        for (const [departmentId, amountCents] of splitAmounts) {
          projectedByDepartment.set(
            departmentId,
            (projectedByDepartment.get(departmentId) ?? 0) + amountCents,
          );
        }
        for (const item of componentOverrides) {
          if (!departmentById.has(item.departmentId)) continue;
          projectedByDepartment.set(
            item.departmentId,
            (projectedByDepartment.get(item.departmentId) ?? 0) + item.amountCents,
          );
        }
      }

      return departmentsInScope.flatMap((department: any) => {
        const budgetRow = budgets.find((row: any) => row.departmentId === department.id && Number(row.year) === year);
        if (!budgetRow) return [];
        const quarterlyBudgetCents = Math.floor(Number(budgetRow.budgetedAmount) / 4);
        const actualBeforeRunCents = ledgerRows
          .filter((row: any) => row.departmentId === department.id &&
            String(row.payrollPeriodStart) >= quarterStart &&
            String(row.payrollPeriodStart) < payrollMonthStart)
          .reduce((sum: number, row: any) => sum + Number(row.fullyBurdenedCostCents || 0), 0);
        const projectedPayrollCents = projectedByDepartment.get(department.id) ?? 0;
        const projectedQuarterSpendCents = actualBeforeRunCents + projectedPayrollCents;
        const consecutiveOverageQuarters = countConsecutiveOverBudgetQuarters({
          departmentId: department.id,
          year,
          currentQuarterIndex: quarter,
          earliestBudgetYear,
          budgets,
          actualByDepartmentQuarter,
        });
        return [{
          departmentId: department.id,
          departmentName: department.name,
          quarterlyBudgetCents,
          actualBeforeRunCents,
          projectedPayrollCents,
          projectedQuarterSpendCents,
          consecutiveOverageQuarters,
          percentage: quarterlyBudgetCents > 0 ? Math.round(projectedQuarterSpendCents / quarterlyBudgetCents * 100) : null,
          overBudget: quarterlyBudgetCents > 0 && projectedQuarterSpendCents > quarterlyBudgetCents,
        }];
      });
    }),

  listComponentMappings: readProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");
    const organizationId = requireCostCenterScope(ctx.user);
    return database.select({
      id: payrollComponentMappings.id,
      componentType: payrollComponentMappings.componentType,
      componentName: payrollComponentMappings.componentName,
      accountId: payrollComponentMappings.accountId,
    }).from(payrollComponentMappings).where(organizationScopeCondition(payrollComponentMappings.organizationId, organizationId));
  }),

  setComponentMapping: manageProcedure
    .input(z.object({
      componentType: z.enum(["basic_salary", "allowance", "employer_benefit", "employer_statutory", "statutory_liability"]),
      componentName: z.string().trim().min(1).max(100),
      accountId: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      const [account] = await database.select({
        id: accounts.id,
        accountType: accounts.accountType,
        isActive: accounts.isActive,
      }).from(accounts).where(and(
        eq(accounts.id, input.accountId),
        organizationScopeCondition(accounts.organizationId, organizationId),
      )).limit(1);
      const isLiabilityMapping = input.componentType === "statutory_liability";
      if (!account || account.isActive !== 1 ||
        (isLiabilityMapping ? account.accountType !== "liability" : !expenseAccountTypes.includes(account.accountType))) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Select an active payroll ${isLiabilityMapping ? "liability" : "expense"} account from this payroll workspace's Chart of Accounts.`,
        });
      }
      const [existing] = await database.select({ id: payrollComponentMappings.id })
        .from(payrollComponentMappings).where(and(
          organizationScopeCondition(payrollComponentMappings.organizationId, organizationId),
          eq(payrollComponentMappings.componentType, input.componentType),
          eq(payrollComponentMappings.componentName, input.componentName),
        )).limit(1);
      if (existing) {
        await database.update(payrollComponentMappings)
          .set({ accountId: input.accountId, updatedAt: new Date() })
          .where(eq(payrollComponentMappings.id, existing.id));
        return { id: existing.id, updated: true };
      }
      const id = uuidv4();
      await database.insert(payrollComponentMappings).values({
        id,
        organizationId,
        ...input,
        createdBy: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id, updated: false };
    }),

  listCostCenters: readProcedure
    .input(z.object({ includeInactive: z.boolean().optional().default(false) }).optional())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      const conditions = [costCenterScopeCondition(organizationId)];
      if (!input?.includeInactive) conditions.push(eq(payrollCostCenters.isActive, 1));
      return database.select({
        id: payrollCostCenters.id,
        organizationId: payrollCostCenters.organizationId,
        departmentId: payrollCostCenters.departmentId,
        expenseAccountId: payrollCostCenters.expenseAccountId,
        payrollLiabilityAccountId: payrollCostCenters.payrollLiabilityAccountId,
        code: payrollCostCenters.code,
        name: payrollCostCenters.name,
        type: payrollCostCenters.type,
        isActive: payrollCostCenters.isActive,
      }).from(payrollCostCenters).where(and(...conditions)).orderBy(payrollCostCenters.code);
    }),

  createCostCenter: manageProcedure
    .input(z.object({
      code: z.string().trim().min(1).max(50),
      name: z.string().trim().min(1).max(100),
      type: z.enum(["COGS", "R&D", "S&M", "G&A", "PROGRAMMATIC"]),
      departmentId: z.string().optional(),
      expenseAccountId: z.string().min(1).optional(),
      payrollLiabilityAccountId: z.string().min(1).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      if (!input.expenseAccountId || !input.payrollLiabilityAccountId) {
        throw new Error("Payroll cost centers must be mapped to an expense account and payroll liability account");
      }
      if (!input.departmentId) {
        throw new Error("Payroll cost centers must be linked to a department for budget tracking");
      }
      if (input.expenseAccountId && input.payrollLiabilityAccountId) {
        await validatePayrollAccounts(database, organizationId, input.expenseAccountId, input.payrollLiabilityAccountId);
      }
      if (input.departmentId) {
        const department = await database.select({ id: departments.id })
          .from(departments)
          .where(and(eq(departments.id, input.departmentId), departmentScopeCondition(organizationId)))
          .limit(1);
        if (!department.length) throw new Error("Department not found in this payroll workspace");
      }
      const id = uuidv4();
      await database.insert(payrollCostCenters).values({
        id,
        organizationId,
        departmentId: input.departmentId ?? null,
        expenseAccountId: input.expenseAccountId ?? null,
        payrollLiabilityAccountId: input.payrollLiabilityAccountId ?? null,
        code: input.code,
        name: input.name,
        type: input.type,
        isActive: 1,
        createdBy: ctx.user.id,
      });
      return { id };
    }),

  updateCostCenter: manageProcedure
    .input(z.object({
      id: z.string(),
      code: z.string().trim().min(1).max(50).optional(),
      name: z.string().trim().min(1).max(100).optional(),
      type: z.enum(["COGS", "R&D", "S&M", "G&A", "PROGRAMMATIC"]).optional(),
      departmentId: z.string().nullable().optional(),
      expenseAccountId: z.string().min(1).nullable().optional(),
      payrollLiabilityAccountId: z.string().min(1).nullable().optional(),
      isActive: z.boolean().optional(),
    }).refine((input) => Object.keys(input).some((key) => key !== "id"), "Provide a field to update"))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      const [currentCenter] = await database.select({
        expenseAccountId: payrollCostCenters.expenseAccountId,
        payrollLiabilityAccountId: payrollCostCenters.payrollLiabilityAccountId,
      }).from(payrollCostCenters)
        .where(and(eq(payrollCostCenters.id, input.id), costCenterScopeCondition(organizationId)))
        .limit(1);
      if (!currentCenter) throw new Error("Payroll cost center not found in this scope");
      const expenseAccountId = input.expenseAccountId === undefined
        ? currentCenter.expenseAccountId
        : input.expenseAccountId;
      const payrollLiabilityAccountId = input.payrollLiabilityAccountId === undefined
        ? currentCenter.payrollLiabilityAccountId
        : input.payrollLiabilityAccountId;
      if (expenseAccountId && payrollLiabilityAccountId) {
        await validatePayrollAccounts(database, organizationId, expenseAccountId, payrollLiabilityAccountId);
      }
      if (input.departmentId) {
        const department = await database.select({ id: departments.id })
          .from(departments)
          .where(and(eq(departments.id, input.departmentId), departmentScopeCondition(organizationId)))
          .limit(1);
        if (!department.length) throw new Error("Department not found in this payroll workspace");
      }
      const { id, isActive, ...fields } = input;
      const result = await database.update(payrollCostCenters)
        .set({ ...fields, ...(isActive === undefined ? {} : { isActive: isActive ? 1 : 0 }) })
        .where(and(eq(payrollCostCenters.id, id), costCenterScopeCondition(organizationId)));
      return { success: true, result };
    }),

  getEmployeeAllocations: readProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      const employee = await database.select({ id: employees.id })
        .from(employees)
        .where(and(eq(employees.id, input.employeeId), organizationScopeCondition(employees.organizationId, organizationId)))
        .limit(1);
      if (!employee.length) throw new Error("Employee not found in this payroll workspace");
      const rows = await database.select({
        id: employeeCostAllocations.id,
        costCenterId: employeeCostAllocations.costCenterId,
        budgetCode: employeeCostAllocations.budgetCode,
        allocationBasisPoints: employeeCostAllocations.allocationBasisPoints,
        effectiveDate: employeeCostAllocations.effectiveDate,
        costCenterCode: payrollCostCenters.code,
        costCenterName: payrollCostCenters.name,
        costCenterType: payrollCostCenters.type,
      }).from(employeeCostAllocations)
        .innerJoin(payrollCostCenters, eq(employeeCostAllocations.costCenterId, payrollCostCenters.id))
        .where(and(
          organizationScopeCondition(employeeCostAllocations.organizationId, organizationId),
          eq(employeeCostAllocations.employeeId, input.employeeId),
        ))
        .orderBy(desc(employeeCostAllocations.effectiveDate));
      return rows.map((row) => ({ ...row, allocationPercentage: row.allocationBasisPoints / 100 }));
    }),

  setEmployeeAllocations: manageProcedure
    .input(z.object({
      employeeId: z.string(),
      effectiveDate: dateSchema,
      allocations: z.array(z.object({
        costCenterId: z.string(),
        allocationPercentage: z.number().positive().max(100),
        budgetCode: z.string().trim().min(1).max(100).optional(),
      })).min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      const employee = await database.select({ id: employees.id })
        .from(employees)
        .where(and(eq(employees.id, input.employeeId), organizationScopeCondition(employees.organizationId, organizationId)))
        .limit(1);
      if (!employee.length) throw new Error("Employee not found in this payroll workspace");
      const allocations = toAllocationBasisPoints(input.allocations);
      const centerIds = allocations.map((allocation) => allocation.costCenterId);
      const centers = await database.select({
        id: payrollCostCenters.id,
        departmentId: payrollCostCenters.departmentId,
      })
        .from(payrollCostCenters)
        .where(and(
          costCenterScopeCondition(organizationId),
          eq(payrollCostCenters.isActive, 1),
          inArray(payrollCostCenters.id, centerIds),
        ));
      if (centers.length !== centerIds.length) throw new Error("Select active cost centers belonging to this payroll workspace");
      const budgetCodes = input.allocations.map((allocation) => allocation.budgetCode).filter((code): code is string => Boolean(code));
      if (budgetCodes.length) {
        const [year] = input.effectiveDate.split("-").map(Number);
        const validBudgets = await database.select({
          budgetCode: departmentBudgets.budgetCode,
          departmentId: departmentBudgets.departmentId,
        }).from(departmentBudgets).where(and(
          organizationScopeCondition(departmentBudgets.organizationId, organizationId),
          eq(departmentBudgets.year, year),
          eq(departmentBudgets.category, "payroll"),
          inArray(departmentBudgets.budgetCode, budgetCodes),
        ));
        const centerById = new Map<string, { id: string; departmentId: string | null }>(
          centers.map((center) => [center.id, center] as const),
        );
        const hasInvalidBudget = input.allocations.some((allocation) => {
          if (!allocation.budgetCode) return false;
          const center = centerById.get(allocation.costCenterId);
          return !validBudgets.some((budget) =>
            budget.budgetCode === allocation.budgetCode && budget.departmentId === center?.departmentId);
        });
        if (hasInvalidBudget) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Each budget code must match the cost center department and effective year in this payroll workspace.",
          });
        }
      }
      await database.transaction(async (transaction: any) => {
        const existing = await transaction.select({ id: employeeCostAllocations.id })
          .from(employeeCostAllocations)
          .where(and(
            organizationScopeCondition(employeeCostAllocations.organizationId, organizationId),
            eq(employeeCostAllocations.employeeId, input.employeeId),
            eq(employeeCostAllocations.effectiveDate, input.effectiveDate),
          ))
          .limit(1);
        if (existing.length) throw new Error("An allocation set already exists for that employee and effective date");
        const budgetCodeByCenter = new Map(input.allocations.map((allocation) =>
          [allocation.costCenterId, allocation.budgetCode] as const
        ));
        await transaction.insert(employeeCostAllocations).values(allocations.map((allocation) => ({
          id: uuidv4(),
          organizationId,
          employeeId: input.employeeId,
          costCenterId: allocation.costCenterId,
          budgetCode: budgetCodeByCenter.get(allocation.costCenterId) ?? null,
          allocationBasisPoints: allocation.allocationBasisPoints,
          effectiveDate: input.effectiveDate,
          createdBy: ctx.user.id,
        })));
      });
      return { success: true, allocationCount: allocations.length };
    }),

  importEmployeeAllocations: manageProcedure
    .input(z.object({
      effectiveDate: dateSchema,
      rows: z.array(z.object({
        employeeIdentifier: z.string().trim().min(1),
        costCenterCode: z.string().trim().min(1),
        budgetCode: z.string().trim().min(1).max(100),
        allocationPercentage: z.number().positive().max(100),
      })).min(1).max(2500),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      const identifiers = [...new Set(input.rows.map((row) => row.employeeIdentifier))];
      const costCenterCodes = [...new Set(input.rows.map((row) => row.costCenterCode))];
      const budgetCodes = [...new Set(input.rows.map((row) => row.budgetCode))];
      const [year] = input.effectiveDate.split("-").map(Number);

      const employeeRows = await database.select({
        id: employees.id,
        employeeNumber: employees.employeeNumber,
      }).from(employees).where(and(
        organizationScopeCondition(employees.organizationId, organizationId),
        or(inArray(employees.id, identifiers), inArray(employees.employeeNumber, identifiers)),
      ));
      const employeeByIdentifier = new Map<string, string>();
      for (const employee of employeeRows as any[]) {
        employeeByIdentifier.set(employee.id, employee.id);
        if (employee.employeeNumber) employeeByIdentifier.set(employee.employeeNumber, employee.id);
      }
      const missingEmployees = identifiers.filter((identifier) => !employeeByIdentifier.has(identifier));
      if (missingEmployees.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Employees not found in this payroll workspace: ${missingEmployees.slice(0, 10).join(", ")}`,
        });
      }

      const centerRows = await database.select({
        id: payrollCostCenters.id,
        code: payrollCostCenters.code,
        departmentId: payrollCostCenters.departmentId,
      }).from(payrollCostCenters).where(and(
        costCenterScopeCondition(organizationId),
        eq(payrollCostCenters.isActive, 1),
        inArray(payrollCostCenters.code, costCenterCodes),
      ));
      const centersByCode = new Map<string, any[]>();
      for (const center of centerRows as any[]) {
        centersByCode.set(center.code, [...(centersByCode.get(center.code) ?? []), center]);
      }
      const invalidCenterCodes = costCenterCodes.filter((code) => (centersByCode.get(code)?.length ?? 0) !== 1);
      if (invalidCenterCodes.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cost-center codes must identify exactly one active center in this workspace: ${invalidCenterCodes.join(", ")}`,
        });
      }

      const budgets = await database.select({
        budgetCode: departmentBudgets.budgetCode,
        departmentId: departmentBudgets.departmentId,
      }).from(departmentBudgets).where(and(
        organizationScopeCondition(departmentBudgets.organizationId, organizationId),
        eq(departmentBudgets.year, year),
        eq(departmentBudgets.category, "payroll"),
        inArray(departmentBudgets.budgetCode, budgetCodes),
      ));
      const grouped = new Map<string, Array<{
        costCenterId: string;
        allocationPercentage: number;
        budgetCode: string;
      }>>();
      for (const row of input.rows) {
        const employeeId = employeeByIdentifier.get(row.employeeIdentifier)!;
        const center = centersByCode.get(row.costCenterCode)![0];
        const budget = (budgets as any[]).find((candidate) =>
          candidate.budgetCode === row.budgetCode && candidate.departmentId === center.departmentId);
        if (!budget) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Budget code ${row.budgetCode} is not a payroll budget for cost center ${row.costCenterCode} in ${year}.`,
          });
        }
        grouped.set(employeeId, [...(grouped.get(employeeId) ?? []), {
          costCenterId: center.id,
          allocationPercentage: row.allocationPercentage,
          budgetCode: row.budgetCode,
        }]);
      }

      const allocationSets = [...grouped.entries()].map(([employeeId, rows]) => {
        const validated = toAllocationBasisPoints(rows);
        const budgetCodeByCenter = new Map(rows.map((row) => [row.costCenterId, row.budgetCode]));
        return { employeeId, validated, budgetCodeByCenter };
      });
      const employeeIds = allocationSets.map((set) => set.employeeId);
      const existing = await database.select({ employeeId: employeeCostAllocations.employeeId })
        .from(employeeCostAllocations).where(and(
          organizationScopeCondition(employeeCostAllocations.organizationId, organizationId),
          eq(employeeCostAllocations.effectiveDate, input.effectiveDate),
          inArray(employeeCostAllocations.employeeId, employeeIds),
        ));
      if (existing.length) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An allocation set already exists for one or more imported employees on that effective date.",
        });
      }

      const inserts = allocationSets.flatMap(({ employeeId, validated, budgetCodeByCenter }) =>
        validated.map((allocation) => ({
          id: uuidv4(),
          organizationId,
          employeeId,
          costCenterId: allocation.costCenterId,
          budgetCode: budgetCodeByCenter.get(allocation.costCenterId) ?? null,
          allocationBasisPoints: allocation.allocationBasisPoints,
          effectiveDate: input.effectiveDate,
          createdBy: ctx.user.id,
        })),
      );
      await database.transaction(async (transaction: any) => {
        await transaction.insert(employeeCostAllocations).values(inserts);
      });
      return { importedEmployees: allocationSets.length, importedAllocations: inserts.length };
    }),

  getLedger: readProcedure
    .input(z.object({
      startDate: dateSchema.optional(),
      endDate: dateSchema.optional(),
      employeeId: z.string().optional(),
      costCenterId: z.string().optional(),
      limit: z.number().int().min(1).max(500).default(100),
    }).optional())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      const filters = [organizationScopeCondition(payrollLedgerEntries.organizationId, organizationId)];
      if (input?.startDate) filters.push(gte(payrollLedgerEntries.payrollPeriodEnd, input.startDate));
      if (input?.endDate) filters.push(lte(payrollLedgerEntries.payrollPeriodEnd, input.endDate));
      if (input?.employeeId) filters.push(eq(payrollLedgerEntries.employeeId, input.employeeId));
      if (input?.costCenterId) filters.push(eq(payrollLedgerEntries.costCenterId, input.costCenterId));
      return database.select({
        id: payrollLedgerEntries.id,
        payrollId: payrollLedgerEntries.payrollId,
        employeeId: payrollLedgerEntries.employeeId,
        costCenterId: payrollLedgerEntries.costCenterId,
        costCenterCode: payrollCostCenters.code,
        costCenterName: payrollCostCenters.name,
        costCenterType: payrollCostCenters.type,
        payrollPeriodStart: payrollLedgerEntries.payrollPeriodStart,
        payrollPeriodEnd: payrollLedgerEntries.payrollPeriodEnd,
        allocationBasisPoints: payrollLedgerEntries.allocationBasisPoints,
        grossPayCents: payrollLedgerEntries.grossPayCents,
        employerStatutoryCents: payrollLedgerEntries.employerStatutoryCents,
        employerBenefitsCents: payrollLedgerEntries.employerBenefitsCents,
        fullyBurdenedCostCents: payrollLedgerEntries.fullyBurdenedCostCents,
        employeeTaxCents: payrollLedgerEntries.employeeTaxCents,
        netPayoutCents: payrollLedgerEntries.netPayoutCents,
        employeeName: employees.firstName,
        employeeLastName: employees.lastName,
      }).from(payrollLedgerEntries)
        .innerJoin(payrollCostCenters, eq(payrollLedgerEntries.costCenterId, payrollCostCenters.id))
        .innerJoin(employees, eq(payrollLedgerEntries.employeeId, employees.id))
        .where(and(...filters))
        .orderBy(desc(payrollLedgerEntries.payrollPeriodEnd))
        .limit(input?.limit ?? 100);
    }),

  getCostCenterSummary: readProcedure
    .input(z.object({ startDate: dateSchema.optional(), endDate: dateSchema.optional() }).optional())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      const filters = [organizationScopeCondition(payrollLedgerEntries.organizationId, organizationId)];
      if (input?.startDate) filters.push(gte(payrollLedgerEntries.payrollPeriodEnd, input.startDate));
      if (input?.endDate) filters.push(lte(payrollLedgerEntries.payrollPeriodEnd, input.endDate));
      const rows = await database.select({
        costCenterId: payrollCostCenters.id,
        code: payrollCostCenters.code,
        name: payrollCostCenters.name,
        type: payrollCostCenters.type,
        grossPayCents: payrollLedgerEntries.grossPayCents,
        employerStatutoryCents: payrollLedgerEntries.employerStatutoryCents,
        employerBenefitsCents: payrollLedgerEntries.employerBenefitsCents,
        fullyBurdenedCostCents: payrollLedgerEntries.fullyBurdenedCostCents,
      }).from(payrollLedgerEntries)
        .innerJoin(payrollCostCenters, eq(payrollLedgerEntries.costCenterId, payrollCostCenters.id))
        .where(and(...filters));
      const summary = new Map<string, {
        costCenterId: string; code: string; name: string; type: string;
        grossPayCents: number; employerStatutoryCents: number; employerBenefitsCents: number;
        fullyBurdenedCostCents: number; employeeCount: number;
      }>();
      for (const row of rows) {
        const current = summary.get(row.costCenterId) ?? {
          costCenterId: row.costCenterId, code: row.code, name: row.name, type: row.type,
          grossPayCents: 0, employerStatutoryCents: 0, employerBenefitsCents: 0,
          fullyBurdenedCostCents: 0, employeeCount: 0,
        };
        current.grossPayCents += row.grossPayCents;
        current.employerStatutoryCents += row.employerStatutoryCents;
        current.employerBenefitsCents += row.employerBenefitsCents;
        current.fullyBurdenedCostCents += row.fullyBurdenedCostCents;
        current.employeeCount++;
        summary.set(row.costCenterId, current);
      }
      return [...summary.values()];
    }),

  exportLedger: readProcedure
    .input(z.object({
      startDate: dateSchema,
      endDate: dateSchema,
      format: z.enum(["CSV", "XLSX", "PDF"]),
    }).refine((input) => input.startDate <= input.endDate, {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const organizationId = requireCostCenterScope(ctx.user);
      const managerEmail = ctx.user.email?.trim();
      if (!managerEmail) throw new Error("Your user account needs an email address to create an audited export");
      const rows = await database.select({
        periodStart: payrollLedgerEntries.payrollPeriodStart,
        periodEnd: payrollLedgerEntries.payrollPeriodEnd,
        employeeId: payrollLedgerEntries.employeeId,
        employeeFirstName: employees.firstName,
        employeeLastName: employees.lastName,
        centerCode: payrollCostCenters.code,
        centerName: payrollCostCenters.name,
        allocationBasisPoints: payrollLedgerEntries.allocationBasisPoints,
        grossPayCents: payrollLedgerEntries.grossPayCents,
        employerStatutoryCents: payrollLedgerEntries.employerStatutoryCents,
        employerBenefitsCents: payrollLedgerEntries.employerBenefitsCents,
        fullyBurdenedCostCents: payrollLedgerEntries.fullyBurdenedCostCents,
        employeeTaxCents: payrollLedgerEntries.employeeTaxCents,
        netPayoutCents: payrollLedgerEntries.netPayoutCents,
      }).from(payrollLedgerEntries)
        .innerJoin(payrollCostCenters, eq(payrollLedgerEntries.costCenterId, payrollCostCenters.id))
        .innerJoin(employees, eq(payrollLedgerEntries.employeeId, employees.id))
        .where(and(
          organizationScopeCondition(payrollLedgerEntries.organizationId, organizationId),
          gte(payrollLedgerEntries.payrollPeriodEnd, input.startDate),
          lte(payrollLedgerEntries.payrollPeriodEnd, input.endDate),
        ))
        .orderBy(payrollLedgerEntries.payrollPeriodEnd, payrollCostCenters.code)
        .limit(10_000);

      const headers = [
        "Period start", "Period end", "Employee ID", "Employee", "Cost center", "Allocation %",
        "Gross pay cents", "Employer statutory cents", "Employer benefits cents",
        "Fully burdened cost cents", "Employee tax cents", "Net payout cents",
      ];
      const values = rows.map((row) => [
        row.periodStart,
        row.periodEnd,
        row.employeeId,
        `${row.employeeFirstName} ${row.employeeLastName}`,
        `${row.centerCode} — ${row.centerName}`,
        (row.allocationBasisPoints / 100).toFixed(2),
        row.grossPayCents,
        row.employerStatutoryCents,
        row.employerBenefitsCents,
        row.fullyBurdenedCostCents,
        row.employeeTaxCents,
        row.netPayoutCents,
      ]);

      let bytes: Uint8Array;
      let extension: string;
      let mimeType: string;
      if (input.format === "CSV") {
        const quote = (value: unknown) => {
          const safe = String(value ?? "").replace(/^[=+\-@]/, "'$&");
          return `"${safe.replace(/"/g, '""')}"`;
        };
        bytes = Buffer.from([headers, ...values].map((row) => row.map(quote).join(",")).join("\r\n"), "utf8");
        extension = "csv";
        mimeType = "text/csv";
      } else if (input.format === "XLSX") {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Payroll Allocations");
        sheet.addRow(headers);
        for (const row of values) sheet.addRow(row);
        sheet.getRow(1).font = { bold: true };
        sheet.columns.forEach((column) => { column.width = 22; });
        bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
        extension = "xlsx";
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else {
        const pdf = new jsPDF({ orientation: "landscape" });
        pdf.setFontSize(9);
        let y = 14;
        pdf.text(`Payroll allocation ledger: ${input.startDate} to ${input.endDate}`, 12, y);
        y += 8;
        for (const row of values) {
          const line = `${row[1]} | ${row[3]} | ${row[4]} | ${row[5]}% | Fully burdened cents: ${row[9]}`;
          if (y > 195) { pdf.addPage(); y = 14; }
          pdf.text(String(line).slice(0, 160), 12, y);
          y += 6;
        }
        bytes = new Uint8Array(pdf.output("arraybuffer"));
        extension = "pdf";
        mimeType = "application/pdf";
      }

      const ipHeader = ctx.req.headers["x-forwarded-for"];
      const ipAddress = (Array.isArray(ipHeader) ? ipHeader[0] : ipHeader)?.split(",")[0]?.trim()
        || ctx.req.socket?.remoteAddress
        || "unknown";
      const userAgent = String(ctx.req.headers["user-agent"] ?? "unknown");
      const generatedFileSha256 = createHash("sha256").update(bytes).digest("hex");
      await database.insert(reportExportAuditLogs).values({
        id: uuidv4(),
        organizationId,
        managerUserId: ctx.user.id,
        managerEmail,
        reportType: "PAYROLL_COST_ALLOCATION_DETAIL",
        exportFormat: input.format,
        dateRangeStart: input.startDate,
        dateRangeEnd: input.endDate,
        ipAddress: ipAddress.slice(0, 45),
        userAgent,
        generatedFileSha256,
      });
      return {
        filename: `payroll-allocation-${input.startDate}-${input.endDate}.${extension}`,
        mimeType,
        data: Buffer.from(bytes).toString("base64"),
        sha256: generatedFileSha256,
        rows: values.length,
      };
    }),
});
