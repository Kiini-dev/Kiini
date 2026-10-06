import { describe, expect, it } from "vitest";
import { splitCents, toAllocationBasisPoints } from "./payrollCostAllocationService";

describe("payroll cost allocation calculations", () => {
  it("validates and stores allocations as exact basis points", () => {
    expect(toAllocationBasisPoints([
      { costCenterId: "engineering", allocationPercentage: 67.25 },
      { costCenterId: "grant", allocationPercentage: 32.75 },
    ])).toEqual([
      { costCenterId: "engineering", allocationBasisPoints: 6725 },
      { costCenterId: "grant", allocationBasisPoints: 3275 },
    ]);
  });

  it("rejects allocations that do not total exactly 100 percent", () => {
    expect(() => toAllocationBasisPoints([
      { costCenterId: "engineering", allocationPercentage: 60 },
      { costCenterId: "grant", allocationPercentage: 39.99 },
    ])).toThrow("must total exactly 100%");
  });

  it("rejects duplicate cost centers", () => {
    expect(() => toAllocationBasisPoints([
      { costCenterId: "engineering", allocationPercentage: 50 },
      { costCenterId: "engineering", allocationPercentage: 50 },
    ])).toThrow("only once");
  });

  it("rejects percentages more precise than one basis point", () => {
    expect(() => toAllocationBasisPoints([
      { costCenterId: "engineering", allocationPercentage: 50.005 },
      { costCenterId: "grant", allocationPercentage: 49.995 },
    ])).toThrow("increments of 0.01%");
  });

  it("distributes residual cents deterministically and preserves the exact total", () => {
    const allocations = [
      { costCenterId: "a", allocationBasisPoints: 3333 },
      { costCenterId: "b", allocationBasisPoints: 3333 },
      { costCenterId: "c", allocationBasisPoints: 3334 },
    ];
    const result = splitCents(101, allocations);
    expect(result.get("a")).toBe(34);
    expect(result.get("b")).toBe(33);
    expect(result.get("c")).toBe(34);
    expect([...result.values()].reduce((sum, amount) => sum + amount, 0)).toBe(101);
  });
});
