import { describe, expect, it } from "vitest";
import { payrollCentsToCurrency } from "../payrollCurrency";

describe("payrollCentsToCurrency", () => {
  it("converts stored cents to the displayed currency amount", () => {
    expect(payrollCentsToCurrency(2_500_000)).toBe(25_000);
    expect(payrollCentsToCurrency("2500000")).toBe(25_000);
  });

  it("returns zero for missing or invalid amounts", () => {
    expect(payrollCentsToCurrency(undefined)).toBe(0);
    expect(payrollCentsToCurrency("not an amount")).toBe(0);
  });
});
