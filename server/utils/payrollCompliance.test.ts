import { describe, expect, it } from "vitest";
import { groupPayslipTaxRows, payslipsToKraCsv, summarizePayslipTaxRows } from "./payrollCompliance";

describe("payslip-backed tax compliance", () => {
  const rows = [
    {
      employeeId: "emp-1",
      employeeNumber: "E,001",
      firstName: "Amina",
      lastName: "Otieno",
      payPeriod: "2026-01",
      basicSalary: 100000,
      allowances: 10000,
      grossSalary: 110000,
      payeDeduction: 18000,
      nssfDeduction: 6000,
      nhifDeduction: 2500,
      netSalary: 83500,
      deductionsBreakdown: JSON.stringify([{ name: "Housing Levy", amount: 1500 }]),
    },
    {
      employeeId: "emp-2",
      payPeriod: "2026-01",
      basicSalary: 90000,
      allowances: 5000,
      grossSalary: 95000,
      payeDeduction: 12000,
      nssfDeduction: 5000,
      nhifDeduction: 2000,
      netSalary: 74000,
      deductionsBreakdown: [{ name: "Housing Levy", amount: 1200 }],
    },
  ];

  it("groups persisted schema fields by pay period", () => {
    expect(groupPayslipTaxRows(rows)).toEqual([{
      month: "2026-01",
      grossSalary: 205000,
      totalPayee: 30000,
      totalNSSF: 11000,
      totalSHIF: 4500,
      totalHousing: 2700,
      netSalary: 157500,
    }]);
  });

  it("summarizes year-to-date statutory amounts from real payslips", () => {
    expect(summarizePayslipTaxRows(rows)).toEqual({
      grossSalary: 205000,
      nssfContribution: 11000,
      payeeTax: 30000,
      shifContribution: 4500,
      housingLevy: 2700,
      netSalary: 157500,
    });
  });

  it("supports payslips stored with legacy direct tax columns", () => {
    expect(groupPayslipTaxRows([{
      employeeId: "legacy-1",
      payPeriod: "2025-12",
      grossSalary: 80000,
      paye: 9000,
      nssf: 4800,
      nhif: 2000,
      shif: 2500,
      housingLevy: 1200,
    }])).toEqual([{
      month: "2025-12",
      grossSalary: 80000,
      totalPayee: 9000,
      totalNSSF: 4800,
      totalSHIF: 2500,
      totalHousing: 1200,
      netSalary: 0,
    }]);
  });

  it("exports KRA CSV with correctly escaped employee data", () => {
    expect(payslipsToKraCsv(rows).split("\n")[1]).toBe('"E,001",Amina Otieno,110000,6000,18000,2500,1500');
  });
});