import { describe, expect, it } from "vitest";
import { nonSalesInflowCreateInput } from "./nonSalesInflows";

const donation = {
  inflowType: "donation" as const,
  taxStatus: "tax_exempt" as const,
  description: "Community grant",
  amountCents: 3_250_000,
  receivedAt: "2026-04-15",
  cashAccountId: "cash",
  categoryAccountId: "donations",
  usdToOrganizationFxRate: 130,
  donorName: "Community Foundation",
};

describe("non-sales inflow validation", () => {
  it("converts the USD donation threshold using the stored organization-currency rate", () => {
    expect(nonSalesInflowCreateInput.safeParse(donation).success).toBe(true);
    const aboveThreshold = nonSalesInflowCreateInput.safeParse({ ...donation, amountCents: 3_250_001 });
    expect(aboveThreshold.success).toBe(false);
    if (!aboveThreshold.success) expect(aboveThreshold.error.issues.some((issue) => issue.path.includes("donorTaxId"))).toBe(true);
  });

  it("requires an auditable FX rate and donor identity for donations", () => {
    const missingRate = nonSalesInflowCreateInput.safeParse({ ...donation, usdToOrganizationFxRate: undefined });
    expect(missingRate.success).toBe(false);
    if (!missingRate.success) expect(missingRate.error.issues.some((issue) => issue.path.includes("usdToOrganizationFxRate"))).toBe(true);

    const missingName = nonSalesInflowCreateInput.safeParse({ ...donation, donorName: undefined });
    expect(missingName.success).toBe(false);
    if (!missingName.success) expect(missingName.error.issues.some((issue) => issue.path.includes("donorName"))).toBe(true);
  });

  it("requires account classification to remain consistent with equity and loan tax treatment", () => {
    const equity = nonSalesInflowCreateInput.safeParse({
      inflowType: "equity_injection",
      taxStatus: "taxable",
      description: "Seed capital",
      amountCents: 500_000,
      receivedAt: "2026-04-15",
      cashAccountId: "cash",
      categoryAccountId: "equity",
      investorName: "Investor",
    });
    expect(equity.success).toBe(false);
    if (!equity.success) expect(equity.error.issues.some((issue) => issue.path.includes("taxStatus"))).toBe(true);
  });
});
