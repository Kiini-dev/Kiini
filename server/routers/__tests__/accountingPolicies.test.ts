import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import {
  accountingPoliciesRouter,
  assertGlobalPolicyScope,
  resolveOrganizationPolicyScope,
} from "../accountingPolicies";

describe("accounting policy organization scope", () => {
  it("uses the organization attached to a tenant user", () => {
    expect(resolveOrganizationPolicyScope({ id: "u1", role: "admin", organizationId: "org-1" })).toBe("org-1");
  });

  it("requires an organization context for organization policies", () => {
    expect(() => resolveOrganizationPolicyScope({ id: "u1", role: "super_admin", organizationId: null }))
      .toThrowError(TRPCError);
  });

  it("allows global policy access only to unscoped platform administrators", () => {
    expect(() => assertGlobalPolicyScope({ id: "admin", role: "super_admin", organizationId: null })).not.toThrow();
    expect(() => assertGlobalPolicyScope({ id: "staff", role: "staff", organizationId: null })).toThrowError(TRPCError);
    expect(() => assertGlobalPolicyScope({ id: "tenant-admin", role: "super_admin", organizationId: "org-1" }))
      .toThrowError(TRPCError);
  });

  it("returns a country template through the policy endpoint", async () => {
    const caller = accountingPoliciesRouter.createCaller({
      user: { id: "platform-admin", role: "super_admin", organizationId: null },
    } as any);

    await expect(caller.getPolicyTemplate({ country: "KE" })).resolves.toMatchObject({
      country: "Kenya",
      defaultCurrency: "KES",
      fiscalYearStart: "01-01",
    });
  });

  it("rejects a platform administrator without an organization context from organization policy reads", async () => {
    const caller = accountingPoliciesRouter.createCaller({
      user: { id: "platform-admin", role: "super_admin", organizationId: null },
    } as any);
    await expect(caller.getOrgPolicies()).rejects.toThrow("organization context");
  });
});
