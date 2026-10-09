import { describe, expect, it } from "vitest";
import { resolveP9OrganizationScope } from "./p9OrganizationScope";

describe("P9 organization scope", () => {
  it("keeps organization users scoped to their organization", () => {
    expect(resolveP9OrganizationScope({ organizationId: "org-1", role: "admin" })).toBe("org-1");
  });

  it("allows global payroll users to operate only on global records", () => {
    expect(resolveP9OrganizationScope({ role: "super_admin" })).toBeNull();
    expect(resolveP9OrganizationScope({ effectiveRole: "super_admin" })).toBeNull();
    expect(resolveP9OrganizationScope({ role: "hr" })).toBeNull();
  });
});
