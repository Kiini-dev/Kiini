import { describe, expect, it } from "vitest";
import { getEmployeeDisplayStatus } from "../shared/employeeStatus";

describe("employee displayed status", () => {
  it("shows active employees as on leave during an approved leave period", () => {
    expect(getEmployeeDisplayStatus("active", true)).toBe("on-leave");
  });

  it("normalizes stored on-leave status values", () => {
    expect(getEmployeeDisplayStatus("on_leave", false)).toBe("on-leave");
    expect(getEmployeeDisplayStatus("on-leave", false)).toBe("on-leave");
  });

  it("preserves other employment statuses when there is no active leave", () => {
    expect(getEmployeeDisplayStatus("terminated", false)).toBe("terminated");
    expect(getEmployeeDisplayStatus(undefined, false)).toBe("active");
  });
});
