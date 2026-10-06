import { describe, expect, it } from "vitest";
import { buildOffsetLines, calculateSaaSCharge, type SaaSRateCard, type SaaSUsageSnapshot } from "../saasIncomeLedger";

const rateCard: SaaSRateCard = {
  id: "rate-professional",
  planId: "professional",
  currency: "KES",
  monthlyBaseCents: 10_000,
  annualBaseCents: 100_000,
  includedSeats: 5,
  monthlySeatCents: 500,
  annualSeatCents: 4_500,
};

const usage: SaaSUsageSnapshot = {
  activeSeats: 7,
  projectsCount: 12,
  tasksCount: 0,
  documentsCount: 0,
  storageUsedMB: 0,
  apiCallsCount: 0,
  emailsSent: 0,
};

describe("SaaS billing ledger rating", () => {
  it("adds base price, billable active seats, and progressive usage tiers", () => {
    const result = calculateSaaSCharge(rateCard, [
      { metricKey: "projectsCount", tierOrder: 1, unitFrom: 0, unitTo: 10, unitPriceCents: 100 },
      { metricKey: "projectsCount", tierOrder: 2, unitFrom: 10, unitTo: null, unitPriceCents: 200 },
    ], usage, "monthly");

    expect(result.totalCents).toBe(12_400);
    expect(result.breakdown).toEqual([
      { metric: "plan_base", units: 1, unitPriceCents: 10_000, amountCents: 10_000 },
      { metric: "additional_seats", units: 2, unitPriceCents: 500, amountCents: 1_000 },
      { metric: "projectsCount", units: 10, unitPriceCents: 100, amountCents: 1_000 },
      { metric: "projectsCount", units: 2, unitPriceCents: 200, amountCents: 400 },
    ]);
  });

  it("uses the annual base and seat rates for annual subscriptions", () => {
    const result = calculateSaaSCharge(rateCard, [], usage, "annual");
    expect(result.totalCents).toBe(109_000);
  });

  it("does not charge seats below the included seat allowance", () => {
    const result = calculateSaaSCharge(
      rateCard,
      [],
      { ...usage, activeSeats: 4 },
      "monthly",
    );
    expect(result.totalCents).toBe(10_000);
  });

  it("builds a balanced offset by swapping every debit and credit", () => {
    const lines = buildOffsetLines([
      { accountCode: "SAAS-AR", accountName: "Accounts receivable", debitCents: "12400", creditCents: 0, description: "Receivable" },
      { accountCode: "SAAS-REV", accountName: "Subscription revenue", debitCents: 0, creditCents: "12400", description: "Revenue" },
    ], "Invoice issued in error");

    expect(lines.map(line => [line.debitCents, line.creditCents])).toEqual([
      [0, 12_400],
      [12_400, 0],
    ]);
    expect(lines.reduce((total, line) => total + line.debitCents, 0)).toBe(12_400);
    expect(lines.reduce((total, line) => total + line.creditCents, 0)).toBe(12_400);
    expect(lines[0].description).toContain("Offset:");
  });
});
