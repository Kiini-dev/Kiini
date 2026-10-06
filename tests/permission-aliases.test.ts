import { describe, expect, it } from "vitest";
import { customRoleCanAccessFeature } from "../server/middleware/enhancedRbac";

describe("custom role permission aliases", () => {
  it("maps legacy invoice permission IDs to server feature keys", () => {
    expect(customRoleCanAccessFeature(["invoices_view"], "accounting:invoices:view")).toBe(true);
    expect(customRoleCanAccessFeature(["invoices_view"], "accounting:invoices:create")).toBe(false);
  });

  it("maps employee management grants to employee read access", () => {
    expect(customRoleCanAccessFeature(["hr_employees_manage"], "employees:read")).toBe(true);
  });

  it("matches module wildcards against nested feature keys", () => {
    expect(customRoleCanAccessFeature(["accounting:*"], "accounting:invoices:view")).toBe(true);
  });
});
