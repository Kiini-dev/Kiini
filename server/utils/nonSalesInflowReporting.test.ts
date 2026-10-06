import { describe, expect, it } from "vitest";
import { summarizeNonSalesInflows } from "./nonSalesInflowReporting";

describe("non-sales inflow reporting", () => {
  const amountCents = 45_000;
  const receivedAt = "2025-03-15 10:00:00";
  const reversedAt = "2025-04-02 12:00:00";

  it("reports a posted inflow in its received period", () => {
    expect(summarizeNonSalesInflows(
      [{ inflowType: "donation", amountCents, receivedAt, reversedAt: null }],
      new Date("2025-03-01T00:00:00.000Z"),
      new Date("2025-04-01T00:00:00.000Z"),
    )).toEqual({
      otherIncome: amountCents,
      otherIncomeByType: [{ type: "donation", amount: amountCents }],
    });
  });

  it("keeps a reversed inflow in its received period and subtracts it in the reversal period", () => {
    const row = { inflowType: "donation", amountCents, receivedAt, reversedAt };
    expect(summarizeNonSalesInflows(
      [row],
      new Date("2025-03-01T00:00:00.000Z"),
      new Date("2025-04-01T00:00:00.000Z"),
    ).otherIncome).toBe(amountCents);
    expect(summarizeNonSalesInflows(
      [row],
      new Date("2025-04-01T00:00:00.000Z"),
      new Date("2025-05-01T00:00:00.000Z"),
    ).otherIncome).toBe(-amountCents);
  });

  it("nets an inflow and reversal posted in the same period to zero", () => {
    expect(summarizeNonSalesInflows(
      [{ inflowType: "other_income", amountCents, receivedAt, reversedAt: "2025-03-20 12:00:00" }],
      new Date("2025-03-01T00:00:00.000Z"),
      new Date("2025-04-01T00:00:00.000Z"),
    )).toEqual({ otherIncome: 0, otherIncomeByType: [] });
  });
});
