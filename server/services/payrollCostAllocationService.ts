import { and, desc, eq, inArray, lte } from "drizzle-orm";
import {
  accounts,
  employeeCostAllocations,
  journalEntries,
  journalEntryLines,
  payrollCostCenters,
  payrollLedgerEntries,
} from "../../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { adjustChartOfAccountBalance } from "../utils/chartOfAccountBalance";

export interface CostAllocationInput {
  costCenterId: string;
  allocationPercentage: number;
}

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
    organizationId: string;
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
      eq(employeeCostAllocations.organizationId, input.organizationId),
      eq(employeeCostAllocations.employeeId, input.employeeId),
      lte(employeeCostAllocations.effectiveDate, input.payrollPeriodStart.slice(0, 10)),
    ))
    .orderBy(desc(employeeCostAllocations.effectiveDate));
  if (history.length === 0) {
    throw new Error(`No effective cost allocation is configured for employee ${input.employeeId}`);
  }

  const effectiveDate = history[0].effectiveDate;
  const allocations = history
    .filter((row: any) => row.effectiveDate === effectiveDate)
    .map((row: any) => ({ costCenterId: row.costCenterId, allocationBasisPoints: row.allocationBasisPoints }));
  if (allocations.reduce((sum: number, item: any) => sum + item.allocationBasisPoints, 0) !== 10_000) {
    throw new Error(`Cost allocations effective ${effectiveDate} for employee ${input.employeeId} must total 100%`);
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
      eq(payrollCostCenters.organizationId, input.organizationId),
      eq(payrollCostCenters.isActive, 1),
    ));
  const centerById = new Map(costCenters.map((center: any) => [center.id, center]));
  if (allocations.some((allocation: any) => !centerById.has(allocation.costCenterId))) {
    throw new Error("The effective cost allocation references an inactive or unavailable cost center");
  }
  const allocatedCenters = allocations.map((allocation: any) => centerById.get(allocation.costCenterId));
  const accountIds = [...new Set(allocatedCenters.flatMap((center: any) =>
    [center.expenseAccountId, center.payrollLiabilityAccountId].filter(Boolean)
  ))];
  if (allocatedCenters.some((center: any) => !center.expenseAccountId || !center.payrollLiabilityAccountId)) {
    throw new Error("Every allocated payroll cost center must be mapped to an expense account and payroll liability account in the Chart of Accounts");
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
    eq(accounts.organizationId, input.organizationId),
  ));
  const accountById = new Map(mappedAccounts.map((account: any) => [account.id, account]));
  for (const center of allocatedCenters as any[]) {
    const expenseAccount = accountById.get(center.expenseAccountId) as any;
    const liabilityAccount = accountById.get(center.payrollLiabilityAccountId) as any;
    if (!expenseAccount || expenseAccount.isActive !== 1 ||
      !["expense", "operating expense", "cost of goods sold", "other expense"].includes(expenseAccount.accountType)) {
      throw new Error(`Cost center ${center.code} must map to an active expense account in this organization`);
    }
    if (!liabilityAccount || liabilityAccount.isActive !== 1 || liabilityAccount.accountType !== "liability") {
      throw new Error(`Cost center ${center.code} must map to an active liability account in this organization`);
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

  const ledgerEntries = allocations.map((allocation: any) => ({
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
  for (const allocation of allocations as any[]) {
    const center = centerById.get(allocation.costCenterId) as any;
    const expenseAccount = accountById.get(center.expenseAccountId) as any;
    const liabilityAccount = accountById.get(center.payrollLiabilityAccountId) as any;
    const amount = splitFields.fullyBurdenedCostCents.get(allocation.costCenterId) ?? 0;
    if (amount === 0) continue;
    const journalEntryId = uuidv4();
    const payPeriod = input.payrollPeriodStart.slice(0, 7);
    await database.insert(journalEntries).values({
      id: journalEntryId,
      organizationId: input.organizationId,
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
    await database.insert(journalEntryLines).values([
      {
        id: uuidv4(),
        journalEntryId,
        accountId: center.expenseAccountId,
        debit: amount,
        credit: 0,
        description: `Fully burdened payroll expense — ${center.code}`,
        lineNumber: 1,
        createdBy: input.createdBy ?? null,
        createdAt: processedAt,
      },
      {
        id: uuidv4(),
        journalEntryId,
        accountId: center.payrollLiabilityAccountId,
        debit: 0,
        credit: amount,
        description: `Payroll payable — ${center.code}`,
        lineNumber: 2,
        createdBy: input.createdBy ?? null,
        createdAt: processedAt,
      },
    ] as any);
    await adjustChartOfAccountBalance(database, expenseAccount.id, amount, input.organizationId);
    await adjustChartOfAccountBalance(database, liabilityAccount.id, -amount, input.organizationId);
  }
  return {
    inserted: true,
    entries: allocations.length,
    budgetSplits: allocations.map((allocation: any) => ({
      costCenterId: allocation.costCenterId,
      departmentId: centerById.get(allocation.costCenterId)?.departmentId || input.employeeDepartmentId || null,
      fullyBurdenedCostCents: splitFields.fullyBurdenedCostCents.get(allocation.costCenterId) ?? 0,
    })),
  };
}
