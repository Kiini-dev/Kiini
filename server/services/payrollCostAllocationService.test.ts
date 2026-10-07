import { describe, expect, it } from "vitest";
import { accounts, employeeCostAllocations, journalEntries, journalEntryLines, payrollCostCenters, payrollLedgerEntries } from "../../drizzle/schema";
import { splitCents, toAllocationBasisPoints } from "./payrollCostAllocationService";
import { recordPayrollCostAllocation } from "./payrollCostAllocationService";

describe("payroll cost allocation calculations", () => {
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
    expect(journalLines).toHaveLength(2);
    expect(journalLines).toEqual(expect.arrayContaining([
      expect.objectContaining({ accountId: "expense-account", debit: 11_500, credit: 0 }),
      expect.objectContaining({ accountId: "liability-account", debit: 0, credit: 11_500 }),
    ]));
  });
});
