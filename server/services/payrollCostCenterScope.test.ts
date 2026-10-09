import { describe, expect, it } from "vitest";
import { resolvePayrollCostCenterScope } from "./payrollCostCenterScope";

describe("resolvePayrollCostCenterScope", () => {
  it("returns the assigned organization for tenant users", () => {
    expect(resolvePayrollCostCenterScope({ role: "staff", organizationId: "org-1" })).toBe("org-1");
  });

  it("uses the null-organization workspace scope for global payroll users", () => {
    expect(resolvePayrollCostCenterScope({ role: "hr" })).toBeNull();
  });

  it("preserves tenant scope when the user has an organization", () => {
    expect(resolvePayrollCostCenterScope({ role: "admin", organizationId: "org-2" })).toBe("org-2");
  });
});
