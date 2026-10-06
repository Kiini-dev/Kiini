import { describe, expect, it } from "vitest";
import { resolvePayrollCostCenterScope } from "./payrollCostCenterScope";

describe("resolvePayrollCostCenterScope", () => {
  it("returns the assigned organization for tenant users", () => {
    expect(resolvePayrollCostCenterScope({ role: "staff", organizationId: "org-1" })).toBe("org-1");
  });

  it("uses the null organization scope for global super admins", () => {
    expect(resolvePayrollCostCenterScope({ role: "super_admin" })).toBeNull();
  });

  it("does not allow unassigned non-super-admin users", () => {
    expect(resolvePayrollCostCenterScope({ role: "staff" })).toBeUndefined();
  });
});
