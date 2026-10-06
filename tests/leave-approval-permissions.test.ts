import { describe, expect, it } from "vitest";
import { validateApprovalAction } from "../server/middleware/rbac";

describe("leave approval permissions", () => {
  it.each(["hr", "super_admin"])("allows %s to review leave", (role) => {
    expect(() => validateApprovalAction(role, "leave")).not.toThrow();
  });

  it.each(["admin", "project_manager", "accountant", "staff"])("denies %s from reviewing leave", (role) => {
    expect(() => validateApprovalAction(role, "leave")).toThrow(
      "Only HR Managers and Super Admins can approve leave requests",
    );
  });
});
