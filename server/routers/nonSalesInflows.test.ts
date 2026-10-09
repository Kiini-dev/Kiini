import { describe, expect, it } from "vitest";
import { nonSalesInflowCreateInput, requiresDonorTaxId } from "./nonSalesInflows";

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
  it("compares donation amounts to USD 250 using the current organization-currency rate", () => {
    expect(nonSalesInflowCreateInput.safeParse(donation).success).toBe(true);
    expect(requiresDonorTaxId(3_250_000, 130)).toBe(false);
    expect(requiresDonorTaxId(3_250_001, 130)).toBe(true);
  });

  it("allows the server to supply the authoritative exchange rate and requires donor identity", () => {
    const missingRate = nonSalesInflowCreateInput.safeParse({ ...donation, usdToOrganizationFxRate: undefined });
    expect(missingRate.success).toBe(true);

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
