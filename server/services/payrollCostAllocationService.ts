import { and, desc, eq, inArray, isNull, lte } from "drizzle-orm";
import {
  accounts,
  employeeCostAllocations,
  journalEntries,
  journalEntryLines,
  payrollCostCenters,
  payrollLedgerEntries,
} from "../../drizzle/schema";
import { payrollComponentMappings } from "../../drizzle/schema-extended";
import { v4 as uuidv4 } from "uuid";
import { adjustChartOfAccountBalance } from "../utils/chartOfAccountBalance";

export interface CostAllocationInput {
  costCenterId: string;
  allocationPercentage: number;
}

export interface PayrollExpenseComponent {
  componentType: "basic_salary" | "allowance" | "employer_statutory" | "employer_benefit";
  componentName: string;
  amountCents: number;
  departmentIdOverride?: string | null;
  glAccountId?: string | null;
}

export interface PayrollLiabilityComponent {
  componentName: string;
  amountCents: number;
  glAccountId?: string | null;
  componentType?: "statutory_liability";
}

export function countConsecutiveOverBudgetQuarters(input: {
  departmentId: string;
  year: number;
  currentQuarterIndex: number;
  earliestBudgetYear: number;
  budgets: Array<{ departmentId: string; year: number; budgetedAmount: number | string }>;
  actualByDepartmentQuarter: Map<string, number>;
}) {
  let count = 0;
  let historyYear = input.year;
  let historyQuarter = input.currentQuarterIndex;
  if (historyQuarter === 0) {
    historyYear -= 1;
    historyQuarter = 4;
  }

  while (historyYear >= input.earliestBudgetYear) {
    const budget = input.budgets.find((row) =>
      row.departmentId === input.departmentId && Number(row.year) === historyYear);
    if (!budget) break;
    const capCents = Math.floor(Number(budget.budgetedAmount) / 4);
    const spendCents = input.actualByDepartmentQuarter.get(
      `${input.departmentId}:${historyYear}:${historyQuarter}`,
    ) ?? 0;
    if (capCents <= 0 || spendCents <= capCents) break;
    count += 1;
    historyQuarter -= 1;
    if (historyQuarter === 0) {
      historyYear -= 1;
      historyQuarter = 4;
    }
  }
  return count;
}

const organizationScopeCondition = (column: any, organizationId: string | null) =>
  organizationId === null ? isNull(column) : eq(column, organizationId);

export function toAllocationBasisPoints(allocations: CostAllocationInput[]): Array<{
  costCenterId: string;
  allocationBasisPoints: number;
}> {
  if (allocations.length === 0) throw new Error("At least one cost center allocation is required");

  const seen = new Set<string>();
  const normalized = allocations.map(({ costCenterId, allocationPercentage }) => {
    const id = costCenterId.trim();
    if (!id || seen.has(id)) throw new Error("Each cost center must be selected only once");
    if (!Number.isFinite(allocationPercentage) || !Number.isInteger(allocationPercentage * 100)) {
      throw new Error("Allocations must use increments of 0.01%");
    }
    const basisPoints = allocationPercentage * 100;
    if (basisPoints <= 0 || basisPoints > 10_000) {
      throw new Error("Each allocation must be greater than 0% and at most 100%");
    }
    seen.add(id);
    return { costCenterId: id, allocationBasisPoints: basisPoints };
  });

  if (normalized.reduce((sum, allocation) => sum + allocation.allocationBasisPoints, 0) !== 10_000) {
    throw new Error("Cost center allocations must total exactly 100%");
  }
  return normalized;
}

export function splitCents(totalCents: number, allocations: Array<{ costCenterId: string; allocationBasisPoints: number }>) {
  if (!Number.isSafeInteger(totalCents) || totalCents < 0) throw new Error("Payroll amounts must be non-negative integer cents");
  const splits = allocations.map((allocation) => {
    const exact = totalCents * allocation.allocationBasisPoints / 10_000;
    return { costCenterId: allocation.costCenterId, cents: Math.floor(exact), remainder: exact % 1 };
  });
  let remainder = totalCents - splits.reduce((sum, split) => sum + split.cents, 0);
  const ordered = [...splits].sort((left, right) =>
    right.remainder - left.remainder || left.costCenterId.localeCompare(right.costCenterId));
  for (let index = 0; index < remainder; index++) ordered[index % ordered.length].cents++;
  return new Map(splits.map((split) => [split.costCenterId, split.cents]));
}

export async function recordPayrollCostAllocation(
  database: any,
  input: {
    organizationId: string | null;
    payrollId: string;
    employeeId: string;
    createdBy?: string | null;
    payrollPeriodStart: string;
    payrollPeriodEnd: string;
    employeeDepartmentId?: string | null;
    grossPayCents: number;
    employerStatutoryCents: number;
    employerBenefitsCents: number;
    employeeTaxCents: number;
    netPayoutCents: number;
    expenseComponents?: PayrollExpenseComponent[];
    liabilityComponents?: PayrollLiabilityComponent[];
  },
) {
  const prior = await database.select({
    costCenterId: payrollLedgerEntries.costCenterId,
    fullyBurdenedCostCents: payrollLedgerEntries.fullyBurdenedCostCents,
    departmentId: payrollCostCenters.departmentId,
  }).from(payrollLedgerEntries)
    .innerJoin(payrollCostCenters, eq(payrollLedgerEntries.costCenterId, payrollCostCenters.id))
    .where(eq(payrollLedgerEntries.payrollId, input.payrollId))
    .limit(100);
  if (prior.length) {
    return {
      inserted: false,
      entries: prior.length,
      budgetSplits: prior.map((row: any) => ({
        costCenterId: row.costCenterId,
        departmentId: row.departmentId || input.employeeDepartmentId || null,
        fullyBurdenedCostCents: row.fullyBurdenedCostCents,
      })),
    };
  }

  const history = await database.select()
    .from(employeeCostAllocations)
    .where(and(
      organizationScopeCondition(employeeCostAllocations.organizationId, input.organizationId),
      eq(employeeCostAllocations.employeeId, input.employeeId),
      lte(employeeCostAllocations.effectiveDate, input.payrollPeriodStart.slice(0, 10)),
    ))
    .orderBy(desc(employeeCostAllocations.effectiveDate));
  let allocations: Array<{ costCenterId: string; allocationBasisPoints: number }>;
  let allocationEffectiveDate: string | undefined;
  if (history.length > 0) {
    allocationEffectiveDate = history[0].effectiveDate;
    allocations = history
      .filter((row: any) => row.effectiveDate === allocationEffectiveDate)
      .map((row: any) => ({ costCenterId: row.costCenterId, allocationBasisPoints: row.allocationBasisPoints }));
  } else if (input.employeeDepartmentId) {
    const departmentCenters = await database.select({
      id: payrollCostCenters.id,
    }).from(payrollCostCenters).where(and(
      organizationScopeCondition(payrollCostCenters.organizationId, input.organizationId),
      eq(payrollCostCenters.departmentId, input.employeeDepartmentId),
      eq(payrollCostCenters.isActive, 1),
    )).limit(2);
    if (departmentCenters.length !== 1) {
      throw new Error(
        departmentCenters.length > 1
          ? `Multiple active payroll cost centers are linked to the employee's department; configure an explicit allocation for employee ${input.employeeId}`
          : `No employee allocation or active payroll cost center is linked to the employee's department; configure department payroll mapping for employee ${input.employeeId}`,
      );
    }
    allocations = [{ costCenterId: departmentCenters[0].id, allocationBasisPoints: 10_000 }];
  } else {
    throw new Error(`No effective cost allocation or department is configured for employee ${input.employeeId}`);
  }

  if (allocations.reduce((sum: number, item: any) => sum + item.allocationBasisPoints, 0) !== 10_000) {
    const allocationDate = allocationEffectiveDate ? ` effective ${allocationEffectiveDate}` : "";
    throw new Error(`Cost allocations${allocationDate} for employee ${input.employeeId} must total 100%`);
  }

  const costCenters = await database.select({
    id: payrollCostCenters.id,
    departmentId: payrollCostCenters.departmentId,
    code: payrollCostCenters.code,
    name: payrollCostCenters.name,
    expenseAccountId: payrollCostCenters.expenseAccountId,
    payrollLiabilityAccountId: payrollCostCenters.payrollLiabilityAccountId,
  })
    .from(payrollCostCenters)
    .where(and(
      organizationScopeCondition(payrollCostCenters.organizationId, input.organizationId),
      eq(payrollCostCenters.isActive, 1),
    ));
  const centerById = new Map<string, any>(costCenters.map((center: any) => [center.id, center] as [string, any]));
  if (allocations.some((allocation: any) => !centerById.has(allocation.costCenterId))) {
    throw new Error("The effective cost allocation references an inactive or unavailable cost center");
  }
  const allocatedCenters = allocations.map((allocation: any) => centerById.get(allocation.costCenterId));
  const expenseComponents = input.expenseComponents ?? [];
  const liabilityComponents = input.liabilityComponents ?? [];
  const componentMappings = expenseComponents.length || liabilityComponents.length
    ? await database.select().from(payrollComponentMappings)
      .where(organizationScopeCondition(payrollComponentMappings.organizationId, input.organizationId))
    : [];
  const mappingByKey = new Map(componentMappings.map((mapping: any) => [
    `${mapping.componentType}:${String(mapping.componentName).trim().toLowerCase()}`,
    mapping.accountId,
  ]));
  const mappedLiabilityComponents = liabilityComponents.map((component) => ({
    component,
    accountId: component.glAccountId || (
      component.componentType
        ? mappingByKey.get(`${component.componentType}:${component.componentName.trim().toLowerCase()}`) ||
          mappingByKey.get(`${component.componentType}:*`)
        : undefined
    ),
  }));
  const componentsByCenter = new Map<string, Array<{ component: PayrollExpenseComponent; amountCents: number; accountId?: string }>>();
  const totalsByCenter = new Map<string, { grossPayCents: number; employerStatutoryCents: number; employerBenefitsCents: number }>();
  for (const component of expenseComponents) {
    if (!Number.isSafeInteger(component.amountCents) || component.amountCents < 0) {
      throw new Error(`Payroll component ${component.componentName} must be a non-negative integer number of cents`);
    }
    let componentAllocations = allocations;
    if (component.departmentIdOverride) {
      const overrideCenters = costCenters.filter((center: any) => center.departmentId === component.departmentIdOverride);
      if (overrideCenters.length !== 1) {
        throw new Error(overrideCenters.length > 1
          ? `Department override for ${component.componentName} must have exactly one active payroll cost center`
          : `Department override for ${component.componentName} has no active payroll cost center`);
      }
      componentAllocations = [{ costCenterId: overrideCenters[0].id, allocationBasisPoints: 10_000 }];
    }
    const split = splitCents(component.amountCents, componentAllocations);
    const mappingKey = `${component.componentType}:${component.componentName.trim().toLowerCase()}`;
    const accountId = component.glAccountId || mappingByKey.get(mappingKey) || mappingByKey.get(`${component.componentType}:*`);
    for (const [costCenterId, amountCents] of split) {
      const entries = componentsByCenter.get(costCenterId) ?? [];
      entries.push({ component, amountCents, accountId: accountId || centerById.get(costCenterId)?.expenseAccountId });
      componentsByCenter.set(costCenterId, entries);
      const totals = totalsByCenter.get(costCenterId) ?? { grossPayCents: 0, employerStatutoryCents: 0, employerBenefitsCents: 0 };
      if (component.componentType === "basic_salary" || component.componentType === "allowance") totals.grossPayCents += amountCents;
      if (component.componentType === "employer_statutory") totals.employerStatutoryCents += amountCents;
      if (component.componentType === "employer_benefit") totals.employerBenefitsCents += amountCents;
      totalsByCenter.set(costCenterId, totals);
    }
  }
  if (expenseComponents.length) {
    const totals = expenseComponents.reduce((sum, component) => {
      if (component.componentType === "basic_salary" || component.componentType === "allowance") sum.grossPayCents += component.amountCents;
      if (component.componentType === "employer_statutory") sum.employerStatutoryCents += component.amountCents;
      if (component.componentType === "employer_benefit") sum.employerBenefitsCents += component.amountCents;
      return sum;
    }, { grossPayCents: 0, employerStatutoryCents: 0, employerBenefitsCents: 0 });
    if (totals.grossPayCents !== input.grossPayCents ||
      totals.employerStatutoryCents !== input.employerStatutoryCents ||
      totals.employerBenefitsCents !== input.employerBenefitsCents) {
      throw new Error("Payroll expense components do not reconcile with the payroll totals");
    }
  }
  const centersForAllocation = expenseComponents.length
    ? [...new Set([...allocations.map((allocation: any) => allocation.costCenterId), ...componentsByCenter.keys()])]
      .map((id) => centerById.get(id))
    : allocatedCenters;
  const accountIdList = centersForAllocation.flatMap((center: any) => [
    center.expenseAccountId,
    center.payrollLiabilityAccountId,
    ...(componentsByCenter.get(center.id) ?? []).map((entry) => entry.accountId),
  ].filter(Boolean)).concat(mappedLiabilityComponents.map((entry) => entry.accountId).filter(Boolean) as string[]);
  const accountIds = [...new Set(accountIdList)];
  if (centersForAllocation.some((center: any) => !center.expenseAccountId || !center.payrollLiabilityAccountId)) {
    throw new Error("Every payroll cost center used by the allocation must be mapped to an expense account and payroll liability account in the Chart of Accounts");
  }
  const mappedAccounts = await database.select({
    id: accounts.id,
    organizationId: accounts.organizationId,
    accountCode: accounts.accountCode,
    accountName: accounts.accountName,
    accountType: accounts.accountType,
    isActive: accounts.isActive,
  }).from(accounts).where(and(
    inArray(accounts.id, accountIds),
    organizationScopeCondition(accounts.organizationId, input.organizationId),
  ));
  const accountById = new Map(mappedAccounts.map((account: any) => [account.id, account]));
  for (const center of centersForAllocation as any[]) {
    const expenseAccount = accountById.get(center.expenseAccountId) as any;
    const liabilityAccount = accountById.get(center.payrollLiabilityAccountId) as any;
    if (!expenseAccount || expenseAccount.isActive !== 1 ||
      !["expense", "operating expense", "cost of goods sold", "other expense"].includes(expenseAccount.accountType)) {
      throw new Error(`Cost center ${center.code} must map to an active expense account in this organization`);
    }
    if (!liabilityAccount || liabilityAccount.isActive !== 1 || liabilityAccount.accountType !== "liability") {
      throw new Error(`Cost center ${center.code} must map to an active liability account in this organization`);
    }
    for (const entry of componentsByCenter.get(center.id) ?? []) {
      const componentAccount = entry.accountId ? accountById.get(entry.accountId) as any : undefined;
      if (!componentAccount || componentAccount.isActive !== 1 ||
        !["expense", "operating expense", "cost of goods sold", "other expense"].includes(componentAccount.accountType)) {
        throw new Error(`Payroll component ${entry.component.componentName} must map to an active expense account in this organization`);
      }
    }
    for (const { component, accountId } of mappedLiabilityComponents) {
      if (!Number.isSafeInteger(component.amountCents) || component.amountCents < 0) {
        throw new Error(`Payroll liability ${component.componentName} must be a non-negative integer number of cents`);
      }
      if (!accountId) continue;
      const liabilityAccount = accountById.get(accountId) as any;
      if (!liabilityAccount || liabilityAccount.isActive !== 1 || liabilityAccount.accountType !== "liability") {
        throw new Error(`Payroll liability ${component.componentName} must map to an active liability account in this organization`);
      }
    }
  }

  const amountFields = {
    grossPayCents: input.grossPayCents,
    employerStatutoryCents: input.employerStatutoryCents,
    employerBenefitsCents: input.employerBenefitsCents,
    fullyBurdenedCostCents: input.grossPayCents + input.employerStatutoryCents + input.employerBenefitsCents,
    employeeTaxCents: input.employeeTaxCents,
    netPayoutCents: input.netPayoutCents,
  };
  if (Object.values(amountFields).some((amount) => !Number.isSafeInteger(amount) || amount < 0)) {
    throw new Error("Payroll amounts must be non-negative safe integer cents");
  }
  const splitFields = Object.fromEntries(
    Object.entries(amountFields).map(([field, amount]) => [field, splitCents(amount, allocations)]),
  ) as Record<keyof typeof amountFields, Map<string, number>>;
  if (expenseComponents.length) {
    for (const field of ["grossPayCents", "employerStatutoryCents", "employerBenefitsCents"] as const) {
      splitFields[field] = new Map(centersForAllocation.map((center: any) => [
        center.id,
        totalsByCenter.get(center.id)?.[field] ?? 0,
      ]));
    }
    splitFields.fullyBurdenedCostCents = new Map(centersForAllocation.map((center: any) => {
      const totals = totalsByCenter.get(center.id);
      return [center.id, totals ? totals.grossPayCents + totals.employerStatutoryCents + totals.employerBenefitsCents : 0];
    }));
  }
  const totalBurdened = [...splitFields.fullyBurdenedCostCents.values()].reduce((sum, value) => sum + value, 0);
  const ledgerCenters = totalBurdened > 0
    ? centersForAllocation.filter((center: any) => (splitFields.fullyBurdenedCostCents.get(center.id) ?? 0) > 0)
    : centersForAllocation;
  const ledgerAllocations = ledgerCenters.map((center: any) => ({
    costCenterId: center.id,
    allocationBasisPoints: totalBurdened > 0
      ? Math.floor((splitFields.fullyBurdenedCostCents.get(center.id) ?? 0) * 10_000 / totalBurdened)
      : allocations.find((allocation: any) => allocation.costCenterId === center.id)?.allocationBasisPoints ?? 0,
  }));
  let basisPointRemainder = 10_000 - ledgerAllocations.reduce((sum, allocation) => sum + allocation.allocationBasisPoints, 0);
  for (let index = 0; basisPointRemainder > 0 && ledgerAllocations.length > 0; index++, basisPointRemainder--) {
    ledgerAllocations[index % ledgerAllocations.length].allocationBasisPoints++;
  }
  const liabilityCreditsByCenter = new Map<string, Map<string, number>>();
  const customLiabilityTotalsByCenter = new Map<string, number>();
  for (const { component, accountId } of mappedLiabilityComponents.filter((entry) => entry.accountId && entry.component.amountCents > 0)) {
    const split = splitCents(component.amountCents, ledgerAllocations);
    for (const [costCenterId, amountCents] of split) {
      const credits = liabilityCreditsByCenter.get(costCenterId) ?? new Map<string, number>();
      credits.set(accountId!, (credits.get(accountId!) ?? 0) + amountCents);
      liabilityCreditsByCenter.set(costCenterId, credits);
      customLiabilityTotalsByCenter.set(costCenterId, (customLiabilityTotalsByCenter.get(costCenterId) ?? 0) + amountCents);
    }
  }

  const ledgerEntries = ledgerAllocations.map((allocation: any) => ({
    id: uuidv4(),
    organizationId: input.organizationId,
    payrollId: input.payrollId,
    employeeId: input.employeeId,
    costCenterId: allocation.costCenterId,
    payrollPeriodStart: input.payrollPeriodStart.slice(0, 10),
    payrollPeriodEnd: input.payrollPeriodEnd.slice(0, 10),
    allocationBasisPoints: allocation.allocationBasisPoints,
    ...Object.fromEntries(Object.keys(amountFields).map((field) => [
      field,
      splitFields[field as keyof typeof amountFields].get(allocation.costCenterId) ?? 0,
    ])),
  }));
  await database.insert(payrollLedgerEntries).values(ledgerEntries);
  const processedAt = new Date().toISOString().replace("T", " ").substring(0, 19);
  for (const allocation of ledgerAllocations as any[]) {
    const center = centerById.get(allocation.costCenterId) as any;
    const liabilityAccount = accountById.get(center.payrollLiabilityAccountId) as any;
    const amount = splitFields.fullyBurdenedCostCents.get(allocation.costCenterId) ?? 0;
    if (amount === 0) continue;
    const journalEntryId = uuidv4();
    const payPeriod = input.payrollPeriodStart.slice(0, 7);
    await database.insert(journalEntries).values({
      id: journalEntryId,
      organizationId: input.organizationId,
      costCenterId: center.id,
      entryNumber: `JE-PAYROLL-${payPeriod}-${journalEntryId}`,
      entryDate: input.payrollPeriodEnd,
      entryMonth: payPeriod,
      reference: input.payrollId,
      description: `Payroll accrual: ${center.code} ${center.name}`,
      totalAmount: amount,
      referenceType: "payroll",
      referenceId: input.payrollId,
      status: "posted",
      createdBy: input.createdBy ?? null,
      postedAt: processedAt,
      createdAt: processedAt,
      updatedAt: processedAt,
    } as any);
    const componentDebits = new Map<string, number>();
    const componentEntries = componentsByCenter.get(allocation.costCenterId) ?? [];
    if (expenseComponents.length) {
      for (const entry of componentEntries) {
        if (entry.amountCents > 0 && entry.accountId) {
          componentDebits.set(entry.accountId, (componentDebits.get(entry.accountId) ?? 0) + entry.amountCents);
        }
      }
    } else {
      componentDebits.set(center.expenseAccountId, amount);
    }
    const mappedLiabilityCredits = liabilityCreditsByCenter.get(allocation.costCenterId) ?? new Map<string, number>();
    const defaultLiabilityCredit = amount - (customLiabilityTotalsByCenter.get(allocation.costCenterId) ?? 0);
    if (defaultLiabilityCredit < 0) {
      throw new Error(`Payroll liability mappings exceed the payroll cost allocated to cost center ${center.code}`);
    }
    const debitLines = [...componentDebits.entries()].map(([accountId, debit], index) => ({
      id: uuidv4(),
      journalEntryId,
      accountId,
      debit,
      credit: 0,
      description: `Payroll component expense — ${center.code}`,
      lineNumber: index + 1,
      createdBy: input.createdBy ?? null,
      createdAt: processedAt,
    }));
    await database.insert(journalEntryLines).values([
      ...debitLines,
      ...[...mappedLiabilityCredits.entries()].map(([accountId, credit], index) => ({
        id: uuidv4(),
        journalEntryId,
        accountId,
        debit: 0,
        credit,
        description: `Payroll component liability — ${center.code}`,
        lineNumber: debitLines.length + index + 1,
        createdBy: input.createdBy ?? null,
        createdAt: processedAt,
      })),
      {
        id: uuidv4(),
        journalEntryId,
        accountId: center.payrollLiabilityAccountId,
        debit: 0,
        credit: defaultLiabilityCredit,
        description: `Payroll payable — ${center.code}`,
        lineNumber: debitLines.length + mappedLiabilityCredits.size + 1,
        createdBy: input.createdBy ?? null,
        createdAt: processedAt,
      },
    ] as any);
    for (const [accountId, debit] of componentDebits) {
      await adjustChartOfAccountBalance(database, accountId, debit, input.organizationId);
    }
    for (const [accountId, credit] of mappedLiabilityCredits) {
      await adjustChartOfAccountBalance(database, accountId, -credit, input.organizationId);
    }
    if (defaultLiabilityCredit > 0) {
      await adjustChartOfAccountBalance(database, liabilityAccount.id, -defaultLiabilityCredit, input.organizationId);
    }
  }
  return {
    inserted: true,
    entries: ledgerAllocations.length,
    budgetSplits: ledgerAllocations.map((allocation: any) => ({
      costCenterId: allocation.costCenterId,
      departmentId: centerById.get(allocation.costCenterId)?.departmentId || input.employeeDepartmentId || null,
      fullyBurdenedCostCents: splitFields.fullyBurdenedCostCents.get(allocation.costCenterId) ?? 0,
    })),
  };
}
