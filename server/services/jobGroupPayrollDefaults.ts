import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  employeeBenefits,
  salaryAllowances,
  salaryDeductions,
  salaryStructures,
} from "../../drizzle/schema-extended";

export type JobGroupPayrollDefault = {
  type: string;
  amount?: number;
  percentage?: number;
  frequency?: "monthly" | "quarterly" | "annual" | "one_time";
};

export function parseJobGroupPayrollDefaults(value: string | null | undefined): JobGroupPayrollDefault[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item): JobGroupPayrollDefault[] => {
      if (!item || typeof item.type !== "string") return [];
      const parseNumber = (raw: unknown) =>
        typeof raw === "number" || (typeof raw === "string" && raw.trim() !== "")
          ? Number(raw)
          : undefined;
      const amount = parseNumber(item.amount);
      const percentage = parseNumber(item.percentage);
      const hasAmount = amount !== undefined && Number.isFinite(amount);
      const hasPercentage = percentage !== undefined && Number.isFinite(percentage);
      if (!hasAmount && !hasPercentage) return [];
      const frequency = ["monthly", "quarterly", "annual", "one_time"].includes(item.frequency)
        ? item.frequency as JobGroupPayrollDefault["frequency"]
        : undefined;
      return [{
        type: item.type,
        ...(hasAmount ? { amount } : {}),
        ...(hasPercentage ? { percentage } : {}),
        ...(frequency ? { frequency } : {}),
      }];
    });
  } catch {
    return [];
  }
}

export function resolveJobGroupPayrollAmount(
  item: Pick<JobGroupPayrollDefault, "amount" | "percentage">,
  basicSalary: number | null | undefined
): number {
  if (Number.isFinite(item.percentage)) {
    return Math.round(Number(basicSalary || 0) * Number(item.percentage) / 100 * 100);
  }
  return Math.round(Number(item.amount || 0));
}

export function resolveJobGroupPayrollBasisSalary(
  employeeSalary: number | null | undefined,
  jobGroup: {
    defaultBasicSalary?: number | null;
    minimumGrossSalary?: number | null;
    maximumGrossSalary?: number | null;
  } | null | undefined,
): number {
  if (Number(employeeSalary) > 0) return Number(employeeSalary);
  if (Number(jobGroup?.defaultBasicSalary) > 0) return Number(jobGroup?.defaultBasicSalary);
  const minimum = Number(jobGroup?.minimumGrossSalary || 0);
  const maximum = Number(jobGroup?.maximumGrossSalary || 0);
  return minimum > 0 && maximum >= minimum ? (minimum + maximum) / 2 : 0;
}

export function resolveJobGroupPayrollTaxRate(
  salaryStructureTaxRate: number | null | undefined,
  defaultDeductions: string | null | undefined,
): number {
  const configuredRate = Number(salaryStructureTaxRate || 0);
  if (configuredRate > 0) return configuredRate;

  const jobGroupRate = parseJobGroupPayrollDefaults(defaultDeductions)
    .find((item) => /tax|paye/i.test(item.type) && Number.isFinite(item.percentage))
    ?.percentage;
  return jobGroupRate == null ? configuredRate : Math.round(jobGroupRate * 100);
}

export function toPayrollStorageAmount(value: number | null | undefined): number | null {
  return value == null ? null : Math.round(Number(value) * 100);
}

export async function applyJobGroupCompensationDefaults(
  db: any,
  employee: { id: string; salary?: number | null },
  jobGroup: any,
  actorId: string
): Promise<void> {
  const now = new Date();
  const basicSalaryUnits = employee.salary ?? jobGroup.defaultBasicSalary;
  const basicSalary = toPayrollStorageAmount(basicSalaryUnits);
  const resolveAmount = (item: JobGroupPayrollDefault) => resolveJobGroupPayrollAmount(item, basicSalaryUnits);

  if (basicSalary != null) {
    const existingStructure = await db.select({ id: salaryStructures.id }).from(salaryStructures)
      .where(eq(salaryStructures.employeeId, employee.id)).limit(1);
    if (!existingStructure.length) {
      await db.insert(salaryStructures).values({
        id: uuidv4(),
        employeeId: employee.id,
        effectiveDate: now,
        basicSalary,
        allowances: 0,
        deductions: 0,
        createdBy: actorId,
        createdAt: now,
        updatedAt: now,
      } as any);
    } else if (employee.salary != null) {
      await db.update(salaryStructures).set({ basicSalary, updatedAt: now } as any)
        .where(eq(salaryStructures.id, existingStructure[0].id));
    }
  }

  const [allowanceRows, deductionRows, benefitRows] = await Promise.all([
    db.select({ allowanceType: salaryAllowances.allowanceType }).from(salaryAllowances).where(eq(salaryAllowances.employeeId, employee.id)),
    db.select({ deductionType: salaryDeductions.deductionType }).from(salaryDeductions).where(eq(salaryDeductions.employeeId, employee.id)),
    db.select({ benefitType: employeeBenefits.benefitType }).from(employeeBenefits).where(eq(employeeBenefits.employeeId, employee.id)),
  ]);
  const allowances = parseJobGroupPayrollDefaults(jobGroup.defaultAllowances);
  const deductions = parseJobGroupPayrollDefaults(jobGroup.defaultDeductions);
  const benefits = parseJobGroupPayrollDefaults(jobGroup.defaultBenefits);

  for (const item of allowances.filter((candidate) => !allowanceRows.some((row: any) => row.allowanceType === candidate.type))) {
    await db.insert(salaryAllowances).values({
      id: uuidv4(), employeeId: employee.id, allowanceType: item.type, amount: resolveAmount(item),
      frequency: item.frequency || "monthly", effectiveDate: now, isActive: true, createdBy: actorId,
      createdAt: now, updatedAt: now,
    } as any);
  }
  for (const item of deductions.filter((candidate) => !deductionRows.some((row: any) => row.deductionType === candidate.type))) {
    await db.insert(salaryDeductions).values({
      id: uuidv4(), employeeId: employee.id, deductionType: item.type, amount: resolveAmount(item),
      frequency: item.frequency || "monthly", effectiveDate: now, isActive: true, createdBy: actorId,
      createdAt: now, updatedAt: now,
    } as any);
  }
  for (const item of benefits.filter((candidate) => !benefitRows.some((row: any) => row.benefitType === candidate.type))) {
    const amount = resolveAmount(item);
    await db.insert(employeeBenefits).values({
      id: uuidv4(), employeeId: employee.id, benefitType: item.type, enrollDate: now, isActive: true,
      cost: amount || null, employerCost: amount || null, createdBy: actorId, createdAt: now, updatedAt: now,
    } as any);
  }
}
