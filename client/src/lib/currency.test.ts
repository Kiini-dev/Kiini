import { describe, expect, it } from "vitest";
import { formatDisplayCurrency, normalizeCurrencyAmount } from "./currency";

describe("currency display helpers", () => {
  it("keeps already-normalized payslip amounts in KES without re-scaling them", () => {
    expect(normalizeCurrencyAmount(52000)).toBe(52000);
    expect(formatDisplayCurrency(52000, "KES")).toContain("52,000");
  });
});
