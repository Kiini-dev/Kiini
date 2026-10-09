import { describe, expect, it } from "vitest";
import { calculateKenyanPayroll } from "./kenyan-payroll-calculator";

describe("calculateKenyanPayroll", () => {
  it("preserves cent values in salary and statutory calculations", () => {
    const result = calculateKenyanPayroll({ basicSalary: 12_345, allowances: 123 });

    expect(result.basicSalary).toBe(12_345);
    expect(result.grossSalary).toBe(12_468);
    expect(result.nssfContribution).toBe(748);
    expect(result.shifContribution).toBe(312);
    expect(result.housingLevyDeduction).toBe(187);
  });
});
