import { describe, expect, it } from "vitest";
import { generatePayslipHTML } from "../payslip-template";

describe("generatePayslipHTML", () => {
  it("renders additional payroll deductions and employer contributions", () => {
    const html = generatePayslipHTML({
      payPeriod: "2026-09",
      payDate: "2026-09-30",
      employee: {
        name: "Eliakim Mwaniki",
        id: "EMP-1",
        department: "Operations",
        position: "Staff",
        bankName: "",
        bankAccount: "",
        nssfNumber: "",
        nhifNumber: "",
        taxPin: "",
        nationalId: "",
      },
      company: {
        name: "Kiini",
        address: "",
        logo: "",
        employerContributions: [{ name: "Employer NSSF", amount: 250000 }],
      },
      earnings: { basicSalary: 30000000, allowances: [{ name: "Housing", amount: 6000000 }], grossSalary: 36000000 },
      deductions: {
        paye: 1000000,
        nssf: 250000,
        nssfTier1: 250000,
        nssfTier2: 0,
        shif: 50000,
        housingLevy: 30000,
        personalRelief: 0,
        total: 1330000,
        additional: [{ name: "Staff Loan", amount: 250000 }],
      },
      netSalary: 34670000,
    });

    expect(html).toContain("Housing");
    expect(html).toContain("Gross Salary");
    expect(html).toContain("Staff Loan");
    expect(html).toContain("Employer NSSF");
    expect(html).toContain("Net Pay");
  });
});
