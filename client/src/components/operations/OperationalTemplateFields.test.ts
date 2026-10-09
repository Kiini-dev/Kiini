import { describe, expect, it } from "vitest";
import { createOperationalTemplateDefaults, normalizeOperationalTemplateData } from "./OperationalTemplateFields";

describe("operational document template defaults", () => {
  it("provides the Kenyan VAT default and delivery acceptance terms", () => {
    const data = createOperationalTemplateDefaults("delivery-note");

    expect(data.vatRate).toBe(16);
    expect(data.lineItems).toEqual([]);
    expect(data.inspectionClause).toMatch(/inspect packages/i);
    expect(data.serialValidationClause).toMatch(/serial numbers/i);
    expect(data.shortageDamageClause).toMatch(/report discrepancies/i);
  });

  it("starts work orders with all five safety and execution checklist phases", () => {
    const data = createOperationalTemplateDefaults("work-order");

    expect(data.checklist).toHaveLength(5);
    expect(data.checklist.every((item: { completed: boolean }) => item.completed === false)).toBe(true);
    expect(data.materials).toEqual([]);
    expect(data.laborEntries).toEqual([]);
  });

  it("starts imprests with an expense ledger and employee affirmation", () => {
    const data = createOperationalTemplateDefaults("imprest");

    expect(data.expenses).toEqual([]);
    expect(data.employeeAffirmation).toMatch(/official company business/i);
  });

  it("calculates 16% VAT and delivery totals from priced shipped quantities", () => {
    const data = normalizeOperationalTemplateData("delivery-note", {
      lineItems: [{ quantityShipped: 2, unitPrice: 500 }],
      shippingFreight: 100,
    });

    expect(data.lineItems[0].totalPrice).toBe(1000);
    expect(data.subtotal).toBe(1000);
    expect(data.vatAmount).toBe(160);
    expect(data.grandTotal).toBe(1260);
  });

  it("excludes rejected GRN quantity and preserves VAT-exempt imprest expenses", () => {
    const grn = normalizeOperationalTemplateData("grn", {
      lineItems: [{ quantityAccepted: 3, quantityRejected: 2, quantityReceived: 5, unitPrice: 100 }],
    });
    const imprest = normalizeOperationalTemplateData("imprest", {
      initialCashFloat: 1000,
      expenses: [{ baseCost: 200, vat: 0 }],
    });

    expect(grn.subtotal).toBe(300);
    expect(imprest.expenses[0]).toMatchObject({ vat: 0, totalSpent: 200 });
    expect(imprest.netBalance).toBe(800);
  });
});
