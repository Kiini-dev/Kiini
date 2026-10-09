import { describe, expect, it } from "vitest";
import {
  createEmptyQuotationForm,
  quotationFormPayload,
  quotationToForm,
} from "./QuotationRequestForm";

describe("quotation request form conversion", () => {
  it("converts saved minor-unit pricing back to editable major-unit values", () => {
    const form = quotationToForm({
      amount: 15_000,
      shippingAmount: 1_250,
      taxRate: "16.50",
      lineItems: [{ partNumber: "A-1", description: "Consulting", quantity: 3, unitPrice: 5_000, total: 15_000 }],
    });

    expect(form.amount).toBe("150");
    expect(form.shippingAmount).toBe("12.5");
    expect(form.taxRate).toBe("16.50");
    expect(form.lineItems).toEqual([
      { partNumber: "A-1", description: "Consulting", quantity: "3", unitPrice: "50" },
    ]);
  });

  it("submits item pricing and shipping in major currency units", () => {
    const form = createEmptyQuotationForm();
    form.buyerCompanyName = "Example Buyer";
    form.lineItems = [{ partNumber: "A-1", description: "Consulting", quantity: "3", unitPrice: "50.25" }];
    form.shippingAmount = "12.50";
    form.taxRate = "16.5";

    const payload = quotationFormPayload(form);

    expect(payload.lineItems).toEqual([
      { partNumber: "A-1", description: "Consulting", quantity: 3, unitPrice: 50.25 },
    ]);
    expect(payload.shippingAmount).toBe(12.5);
    expect(payload.taxRate).toBe(16.5);
  });
});
