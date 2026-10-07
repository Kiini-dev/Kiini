import { describe, expect, it } from "vitest";
import { invoiceEmailTemplate } from "./billingEmailTemplates";

describe("billing email currency formatting", () => {
  it("treats SaaS billing invoice amounts as major currency units", () => {
    const html = invoiceEmailTemplate({
      organizationName: "Example Ltd",
      billingEmail: "billing@example.test",
      invoiceNumber: "INV-001",
      invoiceDate: "2026-01-01",
      dueDate: "2026-01-31",
      billingPeriodStart: "2026-01-01",
      billingPeriodEnd: "2026-01-31",
      amount: 52000,
      tax: 0,
      totalAmount: 52000,
      currency: "KES",
      planName: "Business",
      billingCycle: "monthly",
    });

    expect(html).toContain("KES 52,000.00");
    expect(html).not.toContain("KES 520.00");
  });
});
