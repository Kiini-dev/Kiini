import { describe, expect, it } from "vitest";
import { accounts, employeeCostAllocations, journalEntries, journalEntryLines, payrollCostCenters, payrollLedgerEntries } from "../../drizzle/schema";
import { payrollComponentMappings } from "../../drizzle/schema-extended";
import {
  countConsecutiveOverBudgetQuarters,
  splitCents,
  toAllocationBasisPoints,
} from "./payrollCostAllocationService";
import { recordPayrollCostAllocation } from "./payrollCostAllocationService";

describe("payroll cost allocation calculations", () => {
  it("counts consecutive over-budget quarters back across year boundaries", () => {
    const budgets = [
      { departmentId: "sales", year: 2025, budgetedAmount: 400 },
      { departmentId: "sales", year: 2026, budgetedAmount: 800 },
      { departmentId: "engineering", year: 2025, budgetedAmount: 100 },
    ];
    const actualByDepartmentQuarter = new Map([
      ["sales:2025:2", 100],
      ["sales:2025:3", 120],
      ["sales:2025:4", 110],
      ["engineering:2025:4", 500],
    ]);

    expect(countConsecutiveOverBudgetQuarters({
      departmentId: "sales",
      year: 2026,
      currentQuarterIndex: 0,
      earliestBudgetYear: 2025,
      budgets,
      actualByDepartmentQuarter,
    })).toBe(2);
  });

  it("validates and stores allocations as exact basis points", () => {
    expect(toAllocationBasisPoints([
      { costCenterId: "engineering", allocationPercentage: 67.25 },
      { costCenterId: "grant", allocationPercentage: 32.75 },
    ])).toEqual([
      { costCenterId: "engineering", allocationBasisPoints: 6725 },
      { costCenterId: "grant", allocationBasisPoints: 3275 },
    ]);
  });

  it("rejects allocations that do not total exactly 100 percent", () => {
    expect(() => toAllocationBasisPoints([
      { costCenterId: "engineering", allocationPercentage: 60 },
      { costCenterId: "grant", allocationPercentage: 39.99 },
    ])).toThrow("must total exactly 100%");
  });

  it("rejects duplicate cost centers", () => {
    expect(() => toAllocationBasisPoints([
      { costCenterId: "engineering", allocationPercentage: 50 },
      { costCenterId: "engineering", allocationPercentage: 50 },
    ])).toThrow("only once");
  });

  it("rejects percentages more precise than one basis point", () => {
    expect(() => toAllocationBasisPoints([
      { costCenterId: "engineering", allocationPercentage: 50.005 },
      { costCenterId: "grant", allocationPercentage: 49.995 },
    ])).toThrow("increments of 0.01%");
  });

  it("distributes residual cents deterministically and preserves the exact total", () => {
    const allocations = [
      { costCenterId: "a", allocationBasisPoints: 3333 },
      { costCenterId: "b", allocationBasisPoints: 3333 },
      { costCenterId: "c", allocationBasisPoints: 3334 },
    ];
    const result = splitCents(101, allocations);
    expect(result.get("a")).toBe(34);
    expect(result.get("b")).toBe(33);
    expect(result.get("c")).toBe(34);
    expect([...result.values()].reduce((sum, amount) => sum + amount, 0)).toBe(101);
  });

  it("posts balanced COA journal entries for each payroll cost-center split", async () => {
    const accountRows = [
      { id: "expense-account", organizationId: "org-1", accountCode: "6100", accountName: "Payroll Expense", accountType: "expense", isActive: 1 },
      { id: "liability-account", organizationId: "org-1", accountCode: "2100", accountName: "Payroll Payable", accountType: "liability", isActive: 1 },
      { id: "paye-account", organizationId: "org-1", accountCode: "2110", accountName: "PAYE Control", accountType: "liability", isActive: 1 },
    ];
    const centerRows = [{
      id: "center-1",
      departmentId: "department-1",
      code: "OPS",
      name: "Operations",
      expenseAccountId: "expense-account",
      payrollLiabilityAccountId: "liability-account",
    }];
    const insertCalls: Array<{ table: unknown; rows: any }> = [];
    const queryRows = (table: unknown) => {
      if (table === payrollLedgerEntries) return [];
      if (table === employeeCostAllocations) return [{
        effectiveDate: "2026-01-01",
        costCenterId: "center-1",
        allocationBasisPoints: 10_000,
      }];
      if (table === payrollCostCenters) return centerRows;
      if (table === accounts) return accountRows;
      if (table === payrollComponentMappings) return [{
        componentType: "statutory_liability",
        componentName: "PAYE",
        accountId: "paye-account",
      }];
      return [];
    };
    const database: any = {
      select: () => {
        let table: unknown;
        const query: any = {
          from: (source: unknown) => {
            table = source;
            return query;
          },
          innerJoin: () => query,
          where: () => query,
          limit: async () => queryRows(table),
          orderBy: async () => queryRows(table),
          then: (resolve: (rows: unknown[]) => unknown) => Promise.resolve(queryRows(table)).then(resolve),
        };
        return query;
      },
      insert: (table: unknown) => ({
        values: async (rows: any) => {
          insertCalls.push({ table, rows });
        },
      }),
      update: () => ({
        set: () => ({
          where: async () => undefined,
        }),
      }),
    };

    const result = await recordPayrollCostAllocation(database, {
      organizationId: "org-1",
      payrollId: "payroll-1",
      employeeId: "employee-1",
      createdBy: "user-1",
      payrollPeriodStart: "2026-06-01",
      payrollPeriodEnd: "2026-06-30",
      grossPayCents: 10_000,
      employerStatutoryCents: 1_000,
      employerBenefitsCents: 500,
      employeeTaxCents: 2_000,
      netPayoutCents: 8_000,
      liabilityComponents: [{
        componentType: "statutory_liability",
        componentName: "PAYE",
        amountCents: 2_000,
      }],
    });

    expect(result).toMatchObject({ inserted: true, entries: 1 });
    expect(insertCalls.find((call) => call.table === journalEntries)?.rows).toMatchObject({
      organizationId: "org-1",
      referenceType: "payroll",
      referenceId: "payroll-1",
      totalAmount: 11_500,
      status: "posted",
    });
    const journalLines = insertCalls.find((call) => call.table === journalEntryLines)?.rows;
    expect(journalLines).toHaveLength(3);
    expect(journalLines).toEqual(expect.arrayContaining([
      expect.objectContaining({ accountId: "expense-account", debit: 11_500, credit: 0 }),
      expect.objectContaining({ accountId: "paye-account", debit: 0, credit: 2_000 }),
      expect.objectContaining({ accountId: "liability-account", debit: 0, credit: 9_500 }),
    ]));
  });

  it("uses the employee's department cost center when no explicit split exists", async () => {
    const center = {
      id: "department-center",
      departmentId: "department-1",
      code: "OPS",
      name: "Operations",
      expenseAccountId: "expense-account",
      payrollLiabilityAccountId: "liability-account",
    };
    const accountRows = [
      { id: "expense-account", organizationId: "org-1", accountCode: "6100", accountName: "Payroll Expense", accountType: "expense", isActive: 1 },
      { id: "liability-account", organizationId: "org-1", accountCode: "2100", accountName: "Payroll Payable", accountType: "liability", isActive: 1 },
    ];
    const inserted: Array<{ table: unknown; rows: any }> = [];
    const rowsFor = (table: unknown) => {
      if (table === payrollLedgerEntries || table === employeeCostAllocations) return [];
      if (table === payrollCostCenters) return [center];
      if (table === accounts) return accountRows;
      return [];
    };
    const database: any = {
      select: () => {
        let table: unknown;
        const query: any = {
          from: (source: unknown) => { table = source; return query; },
          innerJoin: () => query,
          where: () => query,
          limit: async () => rowsFor(table),
          orderBy: async () => rowsFor(table),
          then: (resolve: (rows: unknown[]) => unknown) => Promise.resolve(rowsFor(table)).then(resolve),
        };
        return query;
      },
      insert: (table: unknown) => ({
        values: async (rows: any) => { inserted.push({ table, rows }); },
      }),
      update: () => ({ set: () => ({ where: async () => undefined }) }),
    };

    const result = await recordPayrollCostAllocation(database, {
      organizationId: "org-1",
      payrollId: "payroll-2",
      employeeId: "employee-2",
      payrollPeriodStart: "2026-06-01",
      payrollPeriodEnd: "2026-06-30",
      employeeDepartmentId: "department-1",
      grossPayCents: 10_000,
      employerStatutoryCents: 1_000,
      employerBenefitsCents: 500,
      employeeTaxCents: 2_000,
      netPayoutCents: 8_000,
    });

    expect(result).toMatchObject({
      inserted: true,
      entries: 1,
      budgetSplits: [{ costCenterId: "department-center", departmentId: "department-1", fullyBurdenedCostCents: 11_500 }],
    });
    expect(inserted.find((call) => call.table === payrollLedgerEntries)?.rows[0]).toMatchObject({
      costCenterId: "department-center",
      allocationBasisPoints: 10_000,
    });
  });

  it("charges component department and GL overrides to the configured cost center", async () => {
    const centers = [
      { id: "hr-center", departmentId: "hr", code: "HR", name: "Human Resources", expenseAccountId: "hr-expense", payrollLiabilityAccountId: "hr-liability" },
      { id: "sales-center", departmentId: "sales", code: "SALES", name: "Sales", expenseAccountId: "sales-expense", payrollLiabilityAccountId: "sales-liability" },
    ];
    const accountRows = [
      { id: "hr-expense", organizationId: "org-1", accountCode: "6100", accountName: "HR Expense", accountType: "expense", isActive: 1 },
      { id: "sales-expense", organizationId: "org-1", accountCode: "6200", accountName: "Sales Expense", accountType: "expense", isActive: 1 },
      { id: "travel-expense", organizationId: "org-1", accountCode: "6210", accountName: "Travel Expense", accountType: "expense", isActive: 1 },
      { id: "hr-liability", organizationId: "org-1", accountCode: "2100", accountName: "HR Payable", accountType: "liability", isActive: 1 },
      { id: "sales-liability", organizationId: "org-1", accountCode: "2200", accountName: "Sales Payable", accountType: "liability", isActive: 1 },
      { id: "loan-liability", organizationId: "org-1", accountCode: "2300", accountName: "Loan Payable", accountType: "liability", isActive: 1 },
    ];
    const inserted: Array<{ table: unknown; rows: any }> = [];
    const rowsFor = (table: unknown) => {
      if (table === payrollLedgerEntries) return [];
      if (table === employeeCostAllocations) return [{
        effectiveDate: "2026-01-01",
        costCenterId: "hr-center",
        allocationBasisPoints: 10_000,
      }];
      if (table === payrollCostCenters) return centers;
      if (table === accounts) return accountRows;
      if (table === payrollComponentMappings) return [];
      return [];
    };
    const database: any = {
      select: () => {
        let table: unknown;
        const query: any = {
          from: (source: unknown) => { table = source; return query; },
          innerJoin: () => query,
          where: () => query,
          limit: async () => rowsFor(table),
          orderBy: async () => rowsFor(table),
          then: (resolve: (rows: unknown[]) => unknown) => Promise.resolve(rowsFor(table)).then(resolve),
        };
        return query;
      },
      insert: (table: unknown) => ({
        values: async (rows: any) => { inserted.push({ table, rows }); },
      }),
      update: () => ({ set: () => ({ where: async () => undefined }) }),
    };

    await recordPayrollCostAllocation(database, {
      organizationId: "org-1",
      payrollId: "payroll-override",
      employeeId: "employee-override",
      payrollPeriodStart: "2026-06-01",
      payrollPeriodEnd: "2026-06-30",
      employeeDepartmentId: "hr",
      grossPayCents: 1_200,
      employerStatutoryCents: 0,
      employerBenefitsCents: 0,
      employeeTaxCents: 0,
      netPayoutCents: 1_200,
      expenseComponents: [
        { componentType: "basic_salary", componentName: "Basic Salary", amountCents: 1_000 },
        { componentType: "allowance", componentName: "Travel Allowance", amountCents: 200, departmentIdOverride: "sales", glAccountId: "travel-expense" },
      ],
      liabilityComponents: [
        { componentName: "Loan Repayment", amountCents: 120, glAccountId: "loan-liability" },
      ],
    });

    const ledgerRows = inserted.find((call) => call.table === payrollLedgerEntries)?.rows;
    expect(ledgerRows).toEqual(expect.arrayContaining([
      expect.objectContaining({ costCenterId: "hr-center", fullyBurdenedCostCents: 1_000 }),
      expect.objectContaining({ costCenterId: "sales-center", fullyBurdenedCostCents: 200 }),
    ]));
    const journalLines = inserted.filter((call) => call.table === journalEntryLines).flatMap((call) => call.rows);
    expect(journalLines).toEqual(expect.arrayContaining([
      expect.objectContaining({ accountId: "travel-expense", debit: 200, credit: 0 }),
      expect.objectContaining({ accountId: "sales-liability", debit: 0, credit: 180 }),
      expect.objectContaining({ accountId: "loan-liability", debit: 0, credit: 100 }),
      expect.objectContaining({ accountId: "loan-liability", debit: 0, credit: 20 }),
    ]));
  });
});
