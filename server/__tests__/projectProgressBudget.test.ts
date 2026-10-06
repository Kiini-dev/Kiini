import { describe, expect, it } from "vitest";
import { calculateProgressBasedSpent } from "../routers/projects";

describe("project progress budget spending", () => {
  it("calculates spent as the project progress percentage of budget", () => {
    expect(calculateProgressBasedSpent(10000000, 25)).toBe(2500000);
  });

  it("clamps invalid progress values and handles missing budgets", () => {
    expect(calculateProgressBasedSpent(10000000, -10)).toBe(0);
    expect(calculateProgressBasedSpent(10000000, 120)).toBe(10000000);
    expect(calculateProgressBasedSpent(undefined, 50)).toBe(0);
  });
});