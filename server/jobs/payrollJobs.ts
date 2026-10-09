/**
 * Automated Payroll Processing Jobs
 * - 20th of every month at 08:00 EAT: process payroll for all active employees
 * - Last day of every month at 23:59 EAT: dispatch payslips to staff
 */
import { CronJob } from "cron";
import { getDb, getPool, createNotification } from "../db";
import { payroll, employees, users, departments, jobGroups } from "../../drizzle/schema";
import { eq, and, sql, inArray, desc, lte, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { calculateKenyanPayroll } from "../utils/kenyan-payroll-calculator";
import { generatePayslipHTML } from "../utils/payslip-template";
import { getCompanyInfo } from "../utils/company-info";
import { checkBudget, deductFromBudget, findActiveBudget } from "../utils/budgetEnforcer";
import { sendEmailImmediately } from "../services/emailService";
import { recordPayrollCostAllocation } from "../services/payrollCostAllocationService";
import { formatMinorCurrencyAmount } from "../../shared/currency";
import {
  parseJobGroupPayrollDefaults,
  resolveJobGroupPayrollAmount,
  resolveJobGroupPayrollBasisSalary,
} from "../services/jobGroupPayrollDefaults";
import { salaryStructures } from "../../drizzle/schema-extended";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt(d: Date) {
  return d.toISOString().replace("T", " ").substring(0, 19);
}

function monthlyAmount(amount: unknown, frequency: unknown): number {
  const value = Number(amount || 0);
  if (frequency === "quarterly") return Math.round(value / 3);
  if (frequency === "annual") return Math.round(value / 12);
  return value;
}

async function applySavedPayslipTemplate(pool: any, html: string, values: Record<string, string>, organizationId?: string | null): Promise<string> {
  let rows: any[];
  if (organizationId) {
    [rows] = await pool.query(
      "SELECT content FROM documentTemplates WHERE type = 'payslip' AND isDefault = 1 AND organizationId = ? LIMIT 1",
      [organizationId]
    );
    if (rows?.[0]?.content) return renderPayslipTemplateContent(rows[0].content, values);
  }

  [rows] = await pool.query(
    "SELECT content FROM documentTemplates WHERE type = 'payslip' AND isDefault = 1 AND organizationId IS NULL LIMIT 1"
  );
  const template = rows?.[0]?.content;
  return template ? renderPayslipTemplateContent(template, values) : html;
}

function normalizePayslipToken(token: string): string {
  return token
    .trim()
    .replace(/^[{\[$\s]+|[}\]$\s]+$/g, "")
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .replace(/[\s\-.]+/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

function renderPayslipTemplateContent(template: string, values: Record<string, string>): string {
  return template.replace(
    /\{\{\s*([^{}]+?)\s*\}\}|\$\{\s*([^{}]+?)\s*\}|\[\s*([^\]]+?)\s*\]/g,
    (_match, moustache: string, dollar: string, bracket: string) =>
      values[normalizePayslipToken(moustache || dollar || bracket)] ?? ""
  );
}

/** Last day of a given year/month */
function lastDay(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)); // day 0 = last day of previous month
}

function periodStart(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}-01 00:00:00`;
}

function periodEnd(year: number, month: number) {
  const day = lastDay(year, month).getUTCDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} 23:59:59`;
}

function periodEndDate(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0, 23, 59, 59));
}
/** Notify all users with a specific role in an org */
export async function notifyByRole(
  db: any,
  orgId: string | null | undefined,
  roles: string[],
  notification: { title: string; message: string; actionUrl?: string; type?: string }
) {
  try {
    const cond = orgId
      ? and(eq(users.organizationId, orgId), inArray(users.role as any, roles))
      : inArray(users.role as any, roles);
    const targets = await db.select({ id: users.id, email: users.email, name: users.name }).from(users).where(cond);
    for (const u of targets) {
      await createNotification({
        userId: u.id,
        title: notification.title,
        message: notification.message,
        type: (notification.type || "info") as any,
        category: "payroll",
        entityType: "payroll_run",
        entityId: "",
        actionUrl: notification.actionUrl,
        priority: "high" as any,
      }).catch(console.warn);
    }
    return targets as { id: string; email: string; name: string }[];
  } catch (e) {
    console.warn("[PAYROLL] notifyByRole error:", e);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: Process Monthly Payroll
// ─────────────────────────────────────────────────────────────────────────────

export async function processMonthlyPayroll(
  targetYear?: number,
  targetMonth?: number,
  triggeredBy?: string,
  organizationId?: string | null
): Promise<{ processed: number; skipped: number; errors: string[] }> {
  const db = await getDb();
  const pool = getPool();
  if (!db) {
    console.error("[PAYROLL-CRON] Database not available");
    return { processed: 0, skipped: 0, errors: ["Database not available"] };
  }

  const now = new Date();
  const year = targetYear ?? now.getFullYear();
  const month = targetMonth ?? now.getMonth() + 1; // 1-12
  const payPeriodLabel = `${year}-${String(month).padStart(2, "0")}`;
  const payPeriodStart = periodStart(year, month);
  const payPeriodEnd = periodEnd(year, month);
  const processedAt = fmt(now);

  console.log(`[PAYROLL-CRON] Processing payroll for ${payPeriodLabel}...`);

  // Fetch all active employees grouped by org
  const employeeConditions = [eq(employees.status, "active")];
  if (organizationId !== undefined) {
    employeeConditions.push(organizationId === null
      ? isNull(employees.organizationId)
      : eq(employees.organizationId, organizationId));
  }
  const activeEmployees = await db
    .select()
    .from(employees)
    .where(and(...employeeConditions));

  let processed = 0;
  let skipped = 0;
  const errors: string[] = [];
  // Resolve employee department names within the same tenant/global workspace.
  const organizationIds = [...new Set(activeEmployees.map((employee) => employee.organizationId).filter(Boolean))] as string[];
  const organizationDepartments = new Map<string, Map<string, string>>();
  const globalDepartments = new Map<string, string>();
  if (organizationIds.length > 0) {
    try {
      const departmentRows = await db
        .select({ id: departments.id, name: departments.name, organizationId: departments.organizationId })
        .from(departments)
        .where(inArray(departments.organizationId, organizationIds));
      for (const department of departmentRows) {
        if (!department.organizationId) continue;
        let byName = organizationDepartments.get(department.organizationId);
        if (!byName) {
          byName = new Map<string, string>();
          organizationDepartments.set(department.organizationId, byName);
        }
        byName.set(department.id.toLowerCase(), department.id);
        byName.set(department.name.trim().toLowerCase(), department.id);
      }
    } catch (error) {
      console.error("[PAYROLL-CRON] Department lookup failed; using cost-center departments for budget allocation:", error);
    }
  }
  if (activeEmployees.some((employee) => !employee.organizationId)) {
    try {
      const departmentRows = await db.select({
        id: departments.id,
        name: departments.name,
      }).from(departments).where(isNull(departments.organizationId));
      for (const department of departmentRows) {
        globalDepartments.set(department.id.toLowerCase(), department.id);
        globalDepartments.set(department.name.trim().toLowerCase(), department.id);
      }
    } catch (error) {
      console.error("[PAYROLL-CRON] Global department lookup failed; using cost-center departments for budget allocation:", error);
    }
  }
  const jobGroupRows = await db.select().from(jobGroups);
  const jobGroupById = new Map(jobGroupRows.map((group: any) => [String(group.id), group]));

  const payrollOrganizationIds = new Set<string>();

  for (const emp of activeEmployees) {
    try {
      // Skip if payroll already exists for this period
      const existing = await db
        .select({ id: payroll.id })
        .from(payroll)
        .where(
          and(
            eq(payroll.employeeId, emp.id),
            eq(payroll.payPeriodStart, payPeriodStart)
          )
        )
        .limit(1);
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Employee salaries are stored in major KES units; payroll records use cents.
      const jobGroup = jobGroupById.get(String(emp.jobGroupId)) as any;
      const [salaryStructure] = await db.select().from(salaryStructures)
        .where(and(
          eq(salaryStructures.employeeId, emp.id),
          lte(salaryStructures.effectiveDate, periodEndDate(year, month)),
        ))
        .orderBy(desc(salaryStructures.effectiveDate))
        .limit(1);
      const employeeSalary = Number(emp.salary);
      const basicSalaryUnits = Number.isFinite(employeeSalary) && employeeSalary > 0
        ? employeeSalary
        : salaryStructure?.basicSalary != null
          ? Number(salaryStructure.basicSalary) / 100
          : resolveJobGroupPayrollBasisSalary(undefined, jobGroup);
      const basicSalaryCents = Math.round(Number(basicSalaryUnits) * 100);
      if (basicSalaryCents === 0) {
        errors.push(`${emp.firstName} ${emp.lastName}: no salary configured`);
        skipped++;
        continue;
      }

      // Load active recurring compensation components for this payroll period.
      let allowancesCents = 0;
      let employeeDeductionsCents = 0;
      let employeeBenefitsCents = 0;
      let employerBenefitsCents = 0;
      let allowanceComponents: any[] = [];
      let deductionComponents: any[] = [];
      let benefitComponents: any[] = [];
      if (pool) {
        try {
          const activeWindow = `effectiveDate <= ? AND (endDate IS NULL OR endDate >= ?)`;
          const [allowanceRows] = await pool.query(
            `SELECT id, allowanceType, amount, frequency, departmentIdOverride, glAccountId FROM salaryAllowances WHERE employeeId = ? AND isActive = 1 AND ${activeWindow}`,
            [emp.id, payPeriodEnd, payPeriodStart]
          );
          allowanceComponents = allowanceRows as any[];
          allowancesCents = allowanceComponents.reduce((sum, row) => sum + monthlyAmount(row.amount, row.frequency), 0);

          const [deductionRows] = await pool.query(
            `SELECT id, deductionType, amount, frequency, departmentIdOverride, glAccountId FROM salaryDeductions WHERE employeeId = ? AND isActive = 1 AND ${activeWindow}`,
            [emp.id, payPeriodEnd, payPeriodStart]
          );
          deductionComponents = deductionRows as any[];

          const [benefitRows] = await pool.query(
            `SELECT id, benefitType, cost, employerCost, departmentIdOverride, glAccountId FROM employeeBenefits WHERE employeeId = ? AND isActive = 1 AND enrollDate <= ? AND (endDate IS NULL OR endDate >= ?)`,
            [emp.id, payPeriodEnd, payPeriodStart]
          );
          benefitComponents = (benefitRows as any[]).filter((row) => Number(row.cost || 0) > 0 || Number(row.employerCost || 0) > 0);
          employeeBenefitsCents = benefitComponents.reduce((sum, row) => sum + Number(row.cost || 0), 0);
          employerBenefitsCents = benefitComponents.reduce((sum, row) => sum + Number(row.employerCost || 0), 0);
        } catch (error) {
          console.error(`[PAYROLL-CRON] Failed to load compensation components for ${emp.id}:`, error);
          errors.push(`${emp.firstName} ${emp.lastName}: compensation components could not be loaded`);
          skipped++;
          continue;
        }
      }

      const applyMissingDefaults = (
        rows: any[],
        typeField: string,
        defaults: ReturnType<typeof parseJobGroupPayrollDefaults>,
      ) => {
        const configuredTypes = new Set(rows.map((row) => String(row[typeField]).trim().toLowerCase()));
        for (const item of defaults) {
          const key = item.type.trim().toLowerCase();
          if (configuredTypes.has(key)) continue;
          rows.push({
            [typeField]: item.type,
            amount: resolveJobGroupPayrollAmount(item, basicSalaryUnits),
            frequency: item.frequency || "monthly",
            ...(typeField === "benefitType" && {
              cost: resolveJobGroupPayrollAmount(item, basicSalaryUnits),
              employerCost: resolveJobGroupPayrollAmount(item, basicSalaryUnits),
            }),
          });
          configuredTypes.add(key);
        }
      };
      if (jobGroup) {
        applyMissingDefaults(allowanceComponents, "allowanceType", parseJobGroupPayrollDefaults(jobGroup.defaultAllowances));
        applyMissingDefaults(deductionComponents, "deductionType", parseJobGroupPayrollDefaults(jobGroup.defaultDeductions));
        applyMissingDefaults(benefitComponents, "benefitType", parseJobGroupPayrollDefaults(jobGroup.defaultBenefits));
        allowancesCents = allowanceComponents.reduce((sum, row) => sum + monthlyAmount(row.amount, row.frequency), 0);
        employeeDeductionsCents = deductionComponents.reduce((sum, row) => sum + monthlyAmount(row.amount, row.frequency), 0);
        employeeBenefitsCents = benefitComponents.reduce((sum, row) => sum + Number(row.cost || 0), 0);
        employerBenefitsCents = benefitComponents.reduce((sum, row) => sum + Number(row.employerCost || 0), 0);
      } else {
        employeeDeductionsCents = deductionComponents.reduce((sum, row) => sum + monthlyAmount(row.amount, row.frequency), 0);
      }
      if (allowanceComponents.length === 0) {
        allowancesCents = Number(salaryStructure?.allowances || 0);
      }
      if (deductionComponents.length === 0) {
        employeeDeductionsCents = Number(salaryStructure?.deductions || 0);
      }

      // Calculate Kenyan payroll deductions
      const calc = calculateKenyanPayroll({
        basicSalary: basicSalaryCents,
        allowances: allowancesCents,
      });

      const id = uuidv4();
      const statutoryDeductions = calc.nssfContribution + calc.payeeTax + calc.shifContribution + calc.housingLevyDeduction;
      const totalDeductions = statutoryDeductions + employeeDeductionsCents + employeeBenefitsCents;
      const netSalary = calc.grossSalary - totalDeductions;

      const orgId = emp.organizationId;
      const departmentKey = String(emp.department ?? "").trim().toLowerCase();
      const departmentId = orgId
        ? organizationDepartments.get(orgId)?.get(departmentKey)
        : globalDepartments.get(departmentKey);

      const employerStatutoryCents = calc.nssfContribution + calc.housingLevyDeduction;
      const explicitAllowanceCents = allowanceComponents.reduce((sum, row) => sum + monthlyAmount(row.amount, row.frequency), 0);
      const expenseComponents = [
        { componentType: "basic_salary" as const, componentName: "Basic Salary", amountCents: calc.basicSalary },
        ...allowanceComponents.map((row) => ({
          componentType: "allowance" as const,
          componentName: String(row.allowanceType || "Allowance"),
          amountCents: monthlyAmount(row.amount, row.frequency),
          departmentIdOverride: row.departmentIdOverride || null,
          glAccountId: row.glAccountId || null,
        })),
        ...(allowancesCents > explicitAllowanceCents ? [{
          componentType: "allowance" as const,
          componentName: "Other Allowances",
          amountCents: allowancesCents - explicitAllowanceCents,
        }] : []),
        { componentType: "employer_statutory" as const, componentName: "Employer NSSF", amountCents: calc.nssfContribution },
        { componentType: "employer_statutory" as const, componentName: "Employer Housing Levy", amountCents: calc.housingLevyDeduction },
        ...benefitComponents.filter((row) => Number(row.employerCost || 0) > 0).map((row) => ({
          componentType: "employer_benefit" as const,
          componentName: String(row.benefitType || "Employer Benefit"),
          amountCents: Number(row.employerCost || 0),
          departmentIdOverride: row.departmentIdOverride || null,
          glAccountId: row.glAccountId || null,
        })),
      ];
      await db.transaction(async (transaction: any) => {
        await transaction.insert(payroll).values({
          id,
          employeeId: emp.id,
          payPeriodStart,
          payPeriodEnd,
          basicSalary: calc.basicSalary,
          allowances: allowancesCents,
          deductions: totalDeductions,
          tax: calc.payeeTax,
          netSalary,
          status: "processed",
          notes: JSON.stringify({
            grossSalary: calc.grossSalary,
            nssfTier1: calc.details.nssfTier1,
            nssfTier2: calc.details.nssfTier2,
            nssf: calc.nssfContribution,
            shif: calc.shifContribution,
            housingLevy: calc.housingLevyDeduction,
            personalRelief: calc.personalRelief,
            paye: calc.payeeTax,
            statutoryDeductions,
            employerStatutoryCents,
            employeeDeductions: employeeDeductionsCents,
            employeeBenefits: employeeBenefitsCents,
            employerBenefitsCents,
            allowanceComponents,
            deductionComponents,
            benefitComponents,
            payPeriod: payPeriodLabel,
            processedBy: triggeredBy ?? "auto-cron",
            processedAt,
          }),
          createdBy: triggeredBy ?? "system",
          createdAt: processedAt,
          updatedAt: processedAt,
        } as any);
      });

      if (orgId) payrollOrganizationIds.add(orgId);
      processed++;

      if (orgId) {
        try {
          await db.transaction(async (transaction: any) => {
            const allocationResult = await recordPayrollCostAllocation(transaction, {
              organizationId: orgId,
              payrollId: id,
              employeeId: emp.id,
              createdBy: triggeredBy ?? null,
              payrollPeriodStart: payPeriodStart,
              payrollPeriodEnd: payPeriodEnd,
              // Cost-center allocations are the authoritative accounting split. The
              // employee's legacy free-text department is only a fallback for budgets.
              employeeDepartmentId: departmentId ?? null,
              grossPayCents: calc.grossSalary,
              employerStatutoryCents,
              employerBenefitsCents,
              employeeTaxCents: calc.payeeTax,
              netPayoutCents: netSalary,
              expenseComponents,
              liabilityComponents: [
                ...deductionComponents.map((row) => ({
                  componentName: String(row.deductionType || "Salary Deduction"),
                  amountCents: monthlyAmount(row.amount, row.frequency),
                  glAccountId: row.glAccountId || null,
                })),
                ...benefitComponents.filter((row) => Number(row.cost || 0) > 0).map((row) => ({
                  componentName: String(row.benefitType || "Employee Benefit"),
                  amountCents: Number(row.cost || 0),
                  glAccountId: row.glAccountId || null,
                })),
                ...[
                  { componentName: "NSSF", amountCents: calc.nssfContribution },
                  { componentName: "PAYE", amountCents: calc.payeeTax },
                  { componentName: "SHIF", amountCents: calc.shifContribution },
                  { componentName: "Housing Levy", amountCents: calc.housingLevyDeduction },
                ].map((component) => ({ ...component, componentType: "statutory_liability" as const })),
              ],
            });
            if (allocationResult.inserted) {
              const budgetTotals = new Map<string, number>();
              for (const split of allocationResult.budgetSplits ?? []) {
                if (!split.departmentId) {
                  throw new Error(`Cost center ${split.costCenterId} has no department for budget charging`);
                }
                budgetTotals.set(split.departmentId, (budgetTotals.get(split.departmentId) ?? 0) + split.fullyBurdenedCostCents);
              }
              for (const [budgetDepartmentId, amountCents] of budgetTotals) {
                const budget = await findActiveBudget(transaction, orgId, budgetDepartmentId, year);
                if (!budget) throw new Error(`No budget found for department ${budgetDepartmentId} in FY${year}`);
                await checkBudget(transaction, amountCents, orgId, {
                  budgetId: budget.budgetId,
                  departmentId: budgetDepartmentId,
                  fiscalYear: year,
                  label: `payroll ${payPeriodLabel}`,
                });
                await deductFromBudget(transaction, budget.budgetId, amountCents);
              }
            }
          });
        } catch (allocationError: any) {
          const message = allocationError?.message ?? String(allocationError);
          let budgetMessage = "";
          if (departmentId) {
            try {
              await db.transaction(async (transaction: any) => {
                const budget = await findActiveBudget(transaction, orgId, departmentId, year);
                if (!budget) throw new Error(`No budget found for department ${departmentId} in FY${year}`);
                const fullyBurdenedCostCents = calc.grossSalary + employerStatutoryCents + employerBenefitsCents;
                await checkBudget(transaction, fullyBurdenedCostCents, orgId, {
                  budgetId: budget.budgetId,
                  departmentId,
                  fiscalYear: year,
                  label: `payroll ${payPeriodLabel}`,
                });
                await deductFromBudget(transaction, budget.budgetId, fullyBurdenedCostCents);
              });
              budgetMessage = "; department budget was charged using the employee's department";
            } catch (budgetError: any) {
              const budgetErrorMessage = budgetError?.message ?? String(budgetError);
              budgetMessage = `; budget deduction also failed: ${budgetErrorMessage}`;
              console.error("[PAYROLL-CRON] Department budget fallback failed:", budgetError);
            }
          } else {
            budgetMessage = "; budget could not be charged because the employee has no matching department";
          }
          errors.push(`${emp.firstName} ${emp.lastName}: payroll was created${budgetMessage}, but accounting allocation failed: ${message}`);
          console.error("[PAYROLL-CRON] Payroll created but accounting allocation failed:", allocationError);
        }
      }

      if (pool) {
        const components = [
          ...allowanceComponents.map((item) => ["allowance", item.allowanceType, Number(item.amount || 0)]),
          ...deductionComponents.map((item) => ["deduction", item.deductionType, Number(item.amount || 0)]),
          ...benefitComponents.map((item) => ["benefit", item.benefitType, Number(item.cost || 0)]),
          ...benefitComponents.filter((item) => Number(item.employerCost || 0) > 0)
            .map((item) => ["employer_contribution", `${item.benefitType} (Employer)`, Number(item.employerCost || 0)]),
          ["statutory", "NSSF", calc.nssfContribution],
          ["statutory", "PAYE", calc.payeeTax],
          ["statutory", "SHIF", calc.shifContribution],
          ["statutory", "Housing Levy", calc.housingLevyDeduction],
        ];
        for (const [index, [componentType, component, amount]] of components.entries()) {
          const isDeduction = componentType === "deduction" || componentType === "statutory" || componentType === "benefit";
          await pool.query(
            `INSERT INTO payrollDetails (id, payrollId, itemType, itemId, description, amount, isDeduction, lineNumber, componentType, component, notes, createdAt) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), id, componentType, component, amount, isDeduction ? 1 : 0, index + 1, componentType, component, "Automated monthly payroll component", processedAt]
          ).catch((detailErr: any) => console.warn("[PAYROLL-CRON] Payroll detail insert failed:", detailErr?.message));
        }
      }

    } catch (err: any) {
      errors.push(`${emp.firstName} ${emp.lastName}: ${err?.message ?? err}`);
      console.error("[PAYROLL-CRON] Error processing employee payroll:", err);
    }
  }

  // ── Notify admins + HR managers ──────────────────────────────────────────
  try {
    // Get one org to use for notifications (or broadcast to all)
    for (const orgId of payrollOrganizationIds) {
      await notifyByRole(db, orgId, ["admin", "hr_manager", "hr", "superadmin", "super_admin"], {
        title: "✅ Monthly Payroll Processed",
        message: `Payroll for ${payPeriodLabel} has been automatically processed. ${processed} employees processed, ${skipped} skipped.`,
        actionUrl: "/payroll",
        type: "success",
      });
    }
    if (payrollOrganizationIds.size === 0 && activeEmployees.length > 0) {
      // fallback — no org grouping
      await notifyByRole(db, undefined, ["admin", "hr_manager", "hr", "superadmin"], {
        title: "✅ Monthly Payroll Processed",
        message: `Payroll for ${payPeriodLabel} has been automatically processed. ${processed} employees processed.`,
        actionUrl: "/payroll",
        type: "success",
      });
    }
  } catch (notifyErr) {
    console.warn("[PAYROLL-CRON] Failed to send admin notifications:", notifyErr);
  }

  console.log(
    `[PAYROLL-CRON] ${payPeriodLabel} — processed: ${processed}, skipped: ${skipped}, errors: ${errors.length}`
  );
  return { processed, skipped, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: Dispatch Payslips (last day of month)
// ─────────────────────────────────────────────────────────────────────────────

export async function dispatchPayslips(
  targetYear?: number,
  targetMonth?: number,
  organizationId?: string | null
): Promise<{ dispatched: number; errors: string[] }> {
  const db = await getDb();
  const pool = getPool();
  if (!db) {
    console.error("[PAYROLL-CRON] Database not available for payslip dispatch");
    return { dispatched: 0, errors: ["Database not available"] };
  }
  if (!pool) {
    console.error("[PAYROLL-CRON] Database connection pool not available for payslip dispatch");
    return { dispatched: 0, errors: ["Database connection pool not available"] };
  }

  const now = new Date();
  const year = targetYear ?? now.getFullYear();
  const month = targetMonth ?? now.getMonth() + 1;
  const payPeriodLabel = `${year}-${String(month).padStart(2, "0")}`;
  const payPeriodStart = periodStart(year, month);
  const payPeriodEnd = periodEnd(year, month);

  console.log(`[PAYROLL-CRON] Dispatching payslips for ${payPeriodLabel}...`);

  // Get all processed payroll records for this period
  const payrollConditions = [
    eq(payroll.payPeriodStart, payPeriodStart),
    inArray(payroll.status, ["processed", "paid"]),
  ];
  if (organizationId !== undefined) {
    const orgEmployees = await db.select({ id: employees.id }).from(employees)
      .where(organizationId === null
        ? isNull(employees.organizationId)
        : eq(employees.organizationId, organizationId));
    if (orgEmployees.length === 0) {
      return { dispatched: 0, errors: ["No employees found in this organization"] };
    }
    payrollConditions.push(inArray(payroll.employeeId, orgEmployees.map((employee: any) => employee.id)));
  }

  const payrollRecords = await db
    .select()
    .from(payroll)
    .where(and(...payrollConditions));

  if (payrollRecords.length === 0) {
    console.log("[PAYROLL-CRON] No payroll records found for dispatch");
    return { dispatched: 0, errors: ["No payroll records found for this period"] };
  }

  const empIds = payrollRecords.map((r: any) => r.employeeId);
  const empData = await db.select().from(employees).where(inArray(employees.id, empIds));
  const empMap = new Map(empData.map((e: any) => [e.id, e]));

  // Get company info
  const companyInfo = await getCompanyInfo();
  const companyName = companyInfo.name;
  const companyAddress = companyInfo.address;
  const companyLogo = companyInfo.logo;

  let dispatched = 0;
  const errors: string[] = [];

  for (const record of payrollRecords) {
    try {
      const emp = empMap.get((record as any).employeeId) as any;
      if (!emp) { errors.push(`Employee not found: ${(record as any).employeeId}`); continue; }

      // Parse details from notes JSON
      let details: any = {};
      try { details = JSON.parse((record as any).notes || "{}"); } catch { /* ignore */ }

      // Get employee allowances breakdown
      let allowancesBreakdown: Array<{ name: string; amount: number }> = [];
      if (pool) {
        try {
          const [allRows] = await (pool as any).query(
            `SELECT allowanceType AS allowanceName, amount FROM salaryAllowances WHERE employeeId = ? AND isActive = 1 AND effectiveDate <= ? AND (endDate IS NULL OR endDate >= ?)`,
            [emp.id, payPeriodEnd, payPeriodStart]
          );
          allowancesBreakdown = (allRows as any[]).map((a: any) => ({
            name: a.allowanceName,
            // Salary allowance amounts are stored in whole KES; payslips use cents.
            amount: Math.round(Number(a.amount || 0) * 100),
          }));
        } catch { /* ignore */ }
      }

      const deductionsBreakdown = [
        ...(details.deductionComponents || []).map((item: any) => ({ type: "deduction", name: item.deductionType || item.name || "Deduction", amount: Number(item.amount || 0) })),
        ...(details.benefitComponents || []).map((item: any) => ({ type: "benefit", name: item.benefitType || item.name || "Benefit", amount: Number(item.cost || item.amount || 0) })),
        { type: "statutory", name: "PAYE", amount: Number(details.paye ?? (record as any).tax ?? 0) },
        { type: "statutory", name: "NSSF", amount: Number(details.nssf ?? 0) },
        { type: "statutory", name: "SHIF", amount: Number(details.shif ?? 0) },
        { type: "statutory", name: "Housing Levy", amount: Number(details.housingLevy ?? 0) },
      ];
      const employerContributions = [
        ...(details.benefitComponents || []).filter((item: any) => Number(item.employerCost || 0) > 0).map((item: any) => ({
          name: item.benefitType || item.name || "Employer Benefit",
          amount: Number(item.employerCost || 0),
        })),
        { name: "NSSF Employer", amount: Number(details.nssf ?? 0) },
        { name: "Housing Levy Employer", amount: Number(details.housingLevy ?? 0) },
      ];

      // Build payslip data
      const payslipData = {
        payPeriod: payPeriodLabel,
        payDate: fmt(lastDay(year, month)),
        employee: {
          name: `${emp.firstName} ${emp.lastName}`,
          id: emp.employeeNumber,
          department: emp.department ?? "",
          position: emp.position ?? "",
          bankName: emp.bankName ?? "",
          bankAccount: emp.bankAccountNumber ?? "",
          nssfNumber: emp.nssfNumber ?? "",
          nhifNumber: emp.nhifNumber ?? "",
          taxPin: emp.taxId ?? "",
          nationalId: emp.nationalId ?? "",
        },
        company: { name: companyName, address: companyAddress, logo: companyLogo, employerContributions },
        earnings: {
          basicSalary: (record as any).basicSalary,
          allowances: allowancesBreakdown,
          grossSalary: details.grossSalary ?? ((record as any).basicSalary + (record as any).allowances),
        },
        deductions: {
          paye: details.paye ?? (record as any).tax ?? 0,
          nssf: details.nssf ?? 0,
          nssfTier1: details.nssfTier1 ?? 0,
          nssfTier2: details.nssfTier2 ?? 0,
          shif: details.shif ?? 0,
          housingLevy: details.housingLevy ?? 0,
          personalRelief: details.personalRelief ?? 0,
          total: (record as any).deductions ?? 0,
        },
        netSalary: (record as any).netSalary,
      };

      const htmlContent = await applySavedPayslipTemplate(pool, generatePayslipHTML(payslipData), {
        company_name: companyName,
        company_address: companyAddress,
        company_logo: companyLogo,
        employee_name: payslipData.employee.name,
        employee_number: payslipData.employee.id,
        department: payslipData.employee.department,
        position: payslipData.employee.position,
        pay_period: payPeriodLabel,
        pay_date: payslipData.payDate,
        payslip_number: `${payslipData.employee.id}-${payPeriodLabel}`,
        basic_salary: formatMinorCurrencyAmount(payslipData.earnings.basicSalary, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        allowances: formatMinorCurrencyAmount(payslipData.earnings.allowances.reduce((sum, item) => sum + item.amount, 0), "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        gross_salary: formatMinorCurrencyAmount(payslipData.earnings.grossSalary, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        total_deductions: formatMinorCurrencyAmount(payslipData.deductions.total, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        net_salary: formatMinorCurrencyAmount(payslipData.netSalary, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        paye: formatMinorCurrencyAmount(payslipData.deductions.paye, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        nssf: formatMinorCurrencyAmount(payslipData.deductions.nssf, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        nhif: formatMinorCurrencyAmount(payslipData.deductions.shif, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        loan_deduction: formatMinorCurrencyAmount(
          deductionsBreakdown.filter((item) => /loan/i.test(item.name)).reduce((sum, item) => sum + item.amount, 0),
          "KES",
          { symbol: "KES", minimumFractionDigits: 2 },
        ),
        other_deductions: formatMinorCurrencyAmount(
          deductionsBreakdown.filter((item) => item.type === "deduction" && !/loan/i.test(item.name)).reduce((sum, item) => sum + item.amount, 0),
          "KES",
          { symbol: "KES", minimumFractionDigits: 2 },
        ),
        employer_nssf: formatMinorCurrencyAmount(details.nssf ?? 0, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        employer_benefits: formatMinorCurrencyAmount(
          employerContributions.reduce((sum, item) => sum + item.amount, 0),
          "KES",
          { symbol: "KES", minimumFractionDigits: 2 },
        ),
        total_company_contribution: formatMinorCurrencyAmount(
          employerContributions.reduce((sum, item) => sum + item.amount, 0),
          "KES",
          { symbol: "KES", minimumFractionDigits: 2 },
        ),
        ...Object.fromEntries(allowancesBreakdown.slice(0, 4).flatMap((item, index) => [
          [`allowance_${index + 1}_name`, item.name],
          [`allowance_${index + 1}_amount`, formatMinorCurrencyAmount(item.amount, "KES", { symbol: "KES", minimumFractionDigits: 2 })],
        ])),
      }, emp.organizationId);

      // Upsert payslip record in DB
      if (pool) {
        const [existing] = await (pool as any).query(
          `SELECT id, status FROM payslips WHERE employeeId = ? AND payPeriod = ?`,
          [emp.id, payPeriodLabel]
        );
        const existingSlip = (existing as any[])[0];
        if (["sent", "viewed", "downloaded"].includes(existingSlip?.status)) {
          continue;
        }
        if (!existingSlip) {
          await (pool as any).query(
            `INSERT INTO payslips (
              id, payrollId, organizationId, payrollDetailId, employeeId, payslipNumber,
              payPeriod, payDate, payPeriodStart, payPeriodEnd, payMonth, basicSalary,
              allowances, bonuses, grossSalary, nssfDeduction, nhifDeduction,
              payeDeduction, totalDeductions, netSalary, bankName, bankAccountNumber,
              allowancesBreakdown, deductionsBreakdown, htmlContent, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated')`,
            [
              uuidv4(), (record as any).id, emp.organizationId, (record as any).id,
              emp.id, `${payslipData.employee.id || emp.id}-${payPeriodLabel}`,
              payPeriodLabel, fmt(lastDay(year, month)), payPeriodStart, payPeriodEnd,
              payPeriodStart, (record as any).basicSalary, (record as any).allowances,
              payslipData.earnings.grossSalary, details.nssf ?? 0, details.shif ?? 0,
              details.paye ?? (record as any).tax ?? 0, (record as any).deductions,
              (record as any).netSalary, emp.bankName ?? null, emp.bankAccountNumber ?? null,
              JSON.stringify(allowancesBreakdown), JSON.stringify(deductionsBreakdown), htmlContent,
            ]
          );
        } else {
          await (pool as any).query(
            `UPDATE payslips SET htmlContent = ?, updatedAt = NOW() WHERE employeeId = ? AND payPeriod = ?`,
            [htmlContent, emp.id, payPeriodLabel]
          );
        }
      }

      // Send email payslip if employee has email
      if (emp.email) {
        let emailSent = false;
        try {
          await sendEmailImmediately({
            toEmail: emp.email,
            subject: `Your Payslip for ${payPeriodLabel} — ${companyName}`,
            htmlContent: htmlContent,
          });
          emailSent = true;
          dispatched++;
        } catch (emailErr: any) {
          const message = `Failed to deliver payslip to ${emp.email}: ${emailErr?.message || "Unknown email error"}`;
          errors.push(message);
          console.error("[PAYROLL-CRON]", message);
        }
        if (emailSent && pool) {
          try {
            await (pool as any).query(
              `UPDATE payslips SET status = 'sent', sentAt = NOW(), updatedAt = NOW() WHERE employeeId = ? AND payPeriod = ?`,
              [emp.id, payPeriodLabel]
            );
          } catch (statusErr: any) {
            const message = `Payslip was emailed to ${emp.email}, but its sent status could not be saved: ${statusErr?.message || "Unknown database error"}`;
            errors.push(message);
            console.error("[PAYROLL-CRON]", message);
          }
        }
      } else {
        errors.push(`Payslip generated for ${emp.firstName} ${emp.lastName}, but no email address is configured`);
      }

      // Find user account linked to this employee and notify via dashboard
      try {
        let empUserId: string | null = emp.userId ?? null;
        if (!empUserId && emp.email && pool) {
          const [uRows] = await (pool as any).query(
            `SELECT id FROM users WHERE email = ? LIMIT 1`,
            [emp.email]
          );
          empUserId = (uRows as any[])[0]?.id ?? null;
        }
        if (empUserId) {
          await createNotification({
            userId: empUserId,
            title: `📄 Your Payslip for ${payPeriodLabel} is Ready`,
            message: `Your payslip for ${payPeriodLabel} has been issued. Net Pay: ${formatMinorCurrencyAmount((record as any).netSalary, "KES", { symbol: "KES" })}. Click to view.`,
            type: "info" as any,
            category: "payslip",
            entityType: "payslip",
            entityId: payPeriodLabel,
            actionUrl: "/payslips",
            priority: "high" as any,
          }).catch(console.warn);
        }
      } catch (notifErr) {
        console.warn("[PAYROLL-CRON] Failed to notify employee:", notifErr);
      }

    } catch (err: any) {
      errors.push(`Payslip error for employee ${(record as any).employeeId}: ${err?.message}`);
      console.error("[PAYROLL-CRON] Payslip dispatch error:", err);
    }
  }

  // Notify HR and admins in each organization that payslips have been dispatched.
  try {
    const organizationIds = [
      ...new Set(
        empData
          .map((employee: any) => employee.organizationId)
          .filter((organizationId): organizationId is string => typeof organizationId === "string" && organizationId.length > 0),
      ),
    ];
    for (const organizationId of organizationIds) {
      await notifyByRole(db, organizationId, ["admin", "hr_manager", "hr", "superadmin", "super_admin"], {
        title: "📤 Payslips Dispatched",
        message: `${dispatched} payslips for ${payPeriodLabel} have been dispatched to staff.`,
        actionUrl: "/payslips",
        type: "success",
      });
    }
  } catch (error) {
    console.error("[PAYROLL-CRON] Failed to notify organizations about payslip dispatch:", error);
  }

  console.log(`[PAYROLL-CRON] Dispatched ${dispatched} payslips for ${payPeriodLabel}`);
  return { dispatched, errors };
}

export async function processAndDispatchPayslips(
  targetYear?: number,
  targetMonth?: number,
  triggeredBy = "system-cron",
  organizationId?: string | null
): Promise<{ processed: number; skipped: number; dispatched: number; errors: string[] }> {
  const payrollResult = await processMonthlyPayroll(targetYear, targetMonth, triggeredBy, organizationId);
  const payslipResult = await dispatchPayslips(targetYear, targetMonth, organizationId);

  return {
    processed: payrollResult.processed,
    skipped: payrollResult.skipped,
    dispatched: payslipResult.dispatched,
    errors: [
      ...payrollResult.errors.map((error) => `Payroll: ${error}`),
      ...payslipResult.errors,
    ],
  };
}

export async function processAndPayPayroll(
  targetYear?: number,
  targetMonth?: number,
  triggeredBy = "manual",
  organizationId?: string | null
): Promise<{ processed: number; skipped: number; dispatched: number; markedPaid: number; errors: string[] }> {
  const result = await processAndDispatchPayslips(targetYear, targetMonth, triggeredBy, organizationId);
  const pool = getPool();
  if (!pool) {
    return {
      ...result,
      markedPaid: 0,
      errors: [...result.errors, "Payslips were generated, but payroll status could not be updated to paid because the database connection pool is unavailable."],
    };
  }

  const now = fmt(new Date());
  const year = targetYear ?? new Date().getFullYear();
  const month = targetMonth ?? new Date().getMonth() + 1;
  const payPeriodStart = periodStart(year, month);
  const organizationFilter = organizationId === undefined
    ? ""
    : organizationId === null
      ? " AND e.organizationId IS NULL"
      : " AND e.organizationId = ?";
  const parameters = organizationId === undefined
    ? [`${year}-${String(month).padStart(2, "0")}`, now, now, payPeriodStart]
    : organizationId === null
      ? [`${year}-${String(month).padStart(2, "0")}`, now, now, payPeriodStart]
      : [`${year}-${String(month).padStart(2, "0")}`, now, now, payPeriodStart, organizationId];
  let paymentUpdateError: string | undefined;
  const [updateResult] = await pool.query(
    `UPDATE payroll p
     INNER JOIN payslips s ON CONVERT(s.payrollId USING utf8mb4) COLLATE utf8mb4_unicode_ci = CONVERT(p.id USING utf8mb4) COLLATE utf8mb4_unicode_ci AND s.payPeriod = ?
     INNER JOIN employees e ON CONVERT(e.id USING utf8mb4) COLLATE utf8mb4_unicode_ci = CONVERT(p.employeeId USING utf8mb4) COLLATE utf8mb4_unicode_ci
     SET p.status = 'paid', p.paymentDate = COALESCE(p.paymentDate, ?), p.updatedAt = ?
     WHERE p.payPeriodStart = ? AND p.status IN ('processed', 'paid')${organizationFilter}`,
    parameters
  ).catch((error: any) => {
    console.error("[PAYROLL] Payroll records were generated, but marking payslips paid failed:", error);
    paymentUpdateError = error?.message || "Unknown database error";
    return [{ affectedRows: 0 }, []];
  });
  const markedPaid =
    typeof updateResult === "object" &&
    updateResult !== null &&
    "affectedRows" in updateResult
      ? Number(updateResult.affectedRows)
      : 0;

  return {
    ...result,
    markedPaid,
    ...(paymentUpdateError
      ? { errors: [...result.errors, `Payroll records were generated, but could not be marked paid: ${paymentUpdateError}`] }
      : {}),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cron Registration
// ─────────────────────────────────────────────────────────────────────────────

export function initializePayrollJobs() {
  // 21st of every month at 08:00 AM EAT — process payroll
  const payrollProcessingJob = new CronJob(
    "0 8 21 * *",
    async () => {
      console.log("[PAYROLL-CRON] Triggered monthly payroll processing (21st)...");
      const result = await processMonthlyPayroll();
      if (result.errors.length) {
        console.error("[PAYROLL-CRON] Payroll processing errors:", result.errors);
      }
    },
    null,
    true,
    "Africa/Nairobi"
  );

  // Last day of every month at 00:00 EAT — dispatch payslips
  // "0 0 28-31 * *" — runs on 28-31 and checks internally whether it's the last day
  const payslipDispatchJob = new CronJob(
    "0 0 28-31 * *",
    async () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      // Only run on actual last day of month
      if (tomorrow.getDate() === 1) {
        console.log("[PAYROLL-CRON] Triggered payslip dispatch (last day of month)...");
        const result = await processAndDispatchPayslips();
        console.log(
          `[PAYROLL-CRON] Payroll fallback processed ${result.processed}, payslips dispatched ${result.dispatched}, errors ${result.errors.length}`
        );
        if (result.errors.length) {
          console.error("[PAYROLL-CRON] Payroll/payslip dispatch errors:", result.errors);
        }
      }
    },
    null,
    true,
    "Africa/Nairobi"
  );

  console.log("[PAYROLL-CRON] Payroll jobs registered: processing=21st 08:00, dispatch=last day 00:00");
  return { payrollProcessingJob, payslipDispatchJob };
}
