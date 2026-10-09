import { describe, expect, it } from "vitest";
import { resolveOrganizationScope } from "./organizationScope";

describe("resolveOrganizationScope", () => {
  it("keeps organization users in their own organization", () => {
    expect(resolveOrganizationScope({ organizationId: "org-1" }))
      .toEqual({ organizationId: "org-1" });
  });

  it("uses an isolated null-organization scope for global users regardless of role", () => {
    expect(resolveOrganizationScope({ organizationId: null }))
      .toEqual({ organizationId: null });
    expect(resolveOrganizationScope({ organizationId: "" }))
      .toEqual({ organizationId: null });
    expect(resolveOrganizationScope({ organizationId: "  " }))
      .toEqual({ organizationId: null });
    expect(resolveOrganizationScope({}))
      .toEqual({ organizationId: null });
  });

  it("trims a valid organization ID", () => {
    expect(resolveOrganizationScope({ organizationId: " org-1 " }))
      .toEqual({ organizationId: "org-1" });
  });
});
