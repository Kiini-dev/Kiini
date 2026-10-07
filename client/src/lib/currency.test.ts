import { describe, expect, it } from "vitest";
import { formatDisplayCurrency, normalizeCurrencyAmount } from "./currency";
import { formatCurrency as formatStoredCurrency } from "./utils";
import { formatCurrency as formatMajorCurrency } from "../utils/format";
import {
  formatCurrencyAmount,
  formatMinorCurrencyAmount,
  toMajorCurrencyAmount,
  toMinorCurrencyAmount,
} from "../../../shared/currency";

describe("currency display helpers", () => {
  it("keeps already-normalized payslip amounts in KES without re-scaling them", () => {
    expect(normalizeCurrencyAmount(52000)).toBe(52000);
    expect(formatDisplayCurrency(52000, "KES")).toContain("52,000");
  });

  it("formats major and legacy minor values explicitly", () => {
    expect(formatCurrencyAmount(52000, "KES", { symbol: "Ksh" })).toContain("52,000");
    expect(formatMinorCurrencyAmount(5200000, "KES", { symbol: "Ksh" })).toContain("52,000");
    expect(toMajorCurrencyAmount(12345, "minor")).toBe(123.45);
    expect(toMinorCurrencyAmount(123.45)).toBe(12345);
  });

  it("does not perform exchange conversion while formatting", () => {
    expect(formatCurrencyAmount(100, "USD", { symbol: "$" })).toContain("100");
    expect(formatCurrencyAmount(100, "USD")).toContain("100");
  });

  it("keeps legacy database formatting minor-unit based and general formatting major-unit based", () => {
    expect(formatStoredCurrency(5200000)).toContain("52,000");
    expect(formatMajorCurrency(52000)).toContain("52,000");
  });
});
