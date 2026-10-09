import { describe, it, expect } from "vitest";
import { generateP9Form, generateP9DataFromPayroll, P9FormData } from "../utils/p9-form-generator";
import {
  aggregateP9PayrollAndPayslipRows,
  aggregateP9PayrollRows,
  aggregateP9PayslipRows,
  resolveP9TaxNumber,
} from "../utils/p9-forms";

// minimal data to exercise generator
const sampleData: P9FormData = {
  employeeId: "emp-001",
  employeeName: "John Doe",
  nationalId: "12345678",
  knRegNo: "A123456789B",
  grossSalary: 120000,
  paye: 20000,
  nssf: 5000,
  shif: 1000,
  housingLevy: 2000,
  totalDeductions: 28000,
  netIncome: 92000,
  taxYear: 2024,
  monthFrom: 1,
  monthTo: 12,
  companyName: "Acme Ltd",
  companyKRAPin: "P123456789X",
  companyAddress: "45 Corporate Blvd",
  certificationDate: new Date("2024-03-15"),
  certifiedBy: "Jane Smith",
  certifiedByTitle: "HR Manager",
};

describe("P9 Form Generator", () => {
  it("uses tax-number fields from both current and legacy employee tax schemas", () => {
    expect(resolveP9TaxNumber({ taxNumber: "  TAX-CURRENT " }, "TAX-EMPLOYEE")).toBe("TAX-CURRENT");
    expect(resolveP9TaxNumber({ taxId: "TAX-LEGACY" }, "TAX-EMPLOYEE")).toBe("TAX-LEGACY");
    expect(resolveP9TaxNumber(undefined, "TAX-EMPLOYEE")).toBe("TAX-EMPLOYEE");
    expect(resolveP9TaxNumber(undefined, undefined)).toBe("N/A");
  });

  it("aggregates actual payslip schema fields and deduction breakdowns", () => {
    expect(aggregateP9PayslipRows([{
      basicSalary: 100000,
      allowances: 10000,
      bonuses: 0,
      grossSalary: 110000,
      payeDeduction: 18000,
      nssfDeduction: 6000,
      nhifDeduction: 2500,
      deductionsBreakdown: JSON.stringify([{ name: "Housing Levy", amount: 1500 }]),
    }])).toEqual({
      grossIncome: 110000,
      paye: 18000,
      nssf: 6000,
      shif: 2500,
      housingLevy: 1500,
      numberOfPayslips: 1,
    });
  });

  it("aggregates processed payroll rows and their statutory breakdown", () => {
    expect(aggregateP9PayrollRows([{
      basicSalary: 100000,
      allowances: 10000,
      tax: 18000,
      notes: JSON.stringify({
        grossSalary: 115000,
        paye: 18000,
        nssf: 6000,
        shif: 2500,
        housingLevy: 1500,
      }),
    }])).toEqual({
      grossIncome: 115000,
      paye: 18000,
      nssf: 6000,
      shif: 2500,
      housingLevy: 1500,
      numberOfPayslips: 1,
    });
  });

  it("uses payslip detail instead of double-counting its linked payroll record", () => {
    expect(aggregateP9PayrollAndPayslipRows(
      [
        { id: "payroll-1", basicSalary: 100000, allowances: 10000, tax: 18000 },
        { id: "payroll-2", basicSalary: 80000, allowances: 0, tax: 9000 },
      ],
      [{
        payrollId: "payroll-1",
        grossSalary: 110000,
        payeDeduction: 18000,
        nssfDeduction: 6000,
        nhifDeduction: 2500,
        housingLevy: 1500,
      }],
    )).toEqual({
      grossIncome: 190000,
      paye: 27000,
      nssf: 6000,
      shif: 2500,
      housingLevy: 1500,
      numberOfPayslips: 2,
    });
  });

  it("does not invent P9 values when there are no payslips", () => {
    expect(aggregateP9PayslipRows([])).toEqual({
      grossIncome: 0,
      paye: 0,
      nssf: 0,
      shif: 0,
      housingLevy: 0,
      numberOfPayslips: 0,
    });
  });

  it("aggregates tax values from legacy payslip columns", () => {
    expect(aggregateP9PayslipRows([{
      basicSalary: 80000,
      grossSalary: 80000,
      paye: 9000,
      nssf: 4800,
      nhif: 2000,
      shif: 2500,
      housingLevy: 1200,
    }])).toMatchObject({
      grossIncome: 80000,
      paye: 9000,
      nssf: 4800,
      shif: 2500,
      housingLevy: 1200,
      numberOfPayslips: 1,
    });
  });

  it("should produce HTML containing key information", () => {
    const html = generateP9Form(sampleData);
    expect(html).toContain("John Doe");
    expect(html).toContain("Acme Ltd");
    expect(html).toContain("2024");
    expect(html).toContain("Income Tax Certificate");
    // ensure numeric values appear (formatted with commas)
    expect(html).toMatch(/1,200/);
    expect(html).toMatch(/920/);
  });

  it("should generate consistent data from payroll records", () => {
    const payrollRecord = {
      basicSalary: 100000,
      allowances: 20000,
      tax: 18000,
      nssf: 5000,
      shif: 1000,
      housingLevy: 2000,
      netSalary: 94000,
    };
    const employee = {
      employeeNumber: "emp-789",
      firstName: "Alice",
      lastName: "Wong",
      nationalId: "98765432",
      taxId: "TAX001",
    };
    const company = {
      name: "Beta Co",
      kraPin: "PIN123",
      address: "99 Business Rd",
    };
    const certifier = { name: "Bob", title: "Finance Director" };

    const data = generateP9DataFromPayroll(payrollRecord, employee, company, certifier);
    expect(data.employeeId).toBe("emp-789");
    expect(data.employeeName).toBe("Alice Wong");
    expect(data.grossSalary).toBe(120000);
    expect(data.paye).toBe(18000);
    expect(data.netIncome).toBe(94000);
    expect(data.companyName).toBe("Beta Co");
    expect(data.certifiedBy).toBe("Bob");
  });
});
