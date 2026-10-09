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

  it("recalculates stale delivery and GRN totals from their current rows", () => {
    const deliveryNote = normalizeOperationalTemplateData("delivery-note", {
      lineItems: [{ quantityShipped: 2, unitPrice: 500, totalPrice: 900 }],
      subtotal: 900,
      vatAmount: 144,
      grandTotal: 1044,
      shippingFreight: 100,
    });
    const grn = normalizeOperationalTemplateData("grn", {
      lineItems: [{ quantityAccepted: 3, quantityRejected: 2, quantityReceived: 5, unitPrice: 100, lineValue: 500 }],
      subtotal: 500,
      vatAmount: 80,
      netVerifiedStockValue: 580,
    });

    expect(deliveryNote).toMatchObject({ subtotal: 1000, vatAmount: 160, grandTotal: 1260 });
    expect(deliveryNote.lineItems[0].totalPrice).toBe(1000);
    expect(grn).toMatchObject({ subtotal: 300, vatAmount: 48, netVerifiedStockValue: 348 });
    expect(grn.lineItems[0].lineValue).toBe(300);
  });

  it("normalizes invalid repeated-field values instead of failing on map", () => {
    expect(normalizeOperationalTemplateData("delivery-note", { lineItems: { stale: true } }).lineItems).toEqual([]);
    const workOrder = normalizeOperationalTemplateData("work-order", { materials: null, laborEntries: "stale", checklist: {} });
    expect(workOrder).toMatchObject({
      materials: [],
      laborEntries: [],
    });
    expect(workOrder.checklist).toHaveLength(5);
    expect(normalizeOperationalTemplateData("imprest", { expenses: { stale: true }, totalSpent: 500 })).toMatchObject({
      expenses: [],
      totalSpent: 0,
      netBalance: 0,
    });
  });

  it("recalculates the work order materials total from current quantities and costs", () => {
    const data = normalizeOperationalTemplateData("work-order", {
      materials: [{ quantity: 2, unitCost: 100, totalCost: 900, vat: 144 }],
      totalMaterialsCost: 1044,
    });

    expect(data.materials[0]).toMatchObject({ totalCost: 200, vat: 32 });
    expect(data.totalMaterialsCost).toBe(232);
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

  it("recalculates imprest totals while preserving VAT-exempt lines", () => {
    const data = normalizeOperationalTemplateData("imprest", {
      initialCashFloat: 1000,
      expenses: [{ baseCost: 200, vat: 0 }, { baseCost: 100, vat: "" }],
      totalSpent: 9999,
      netBalance: -8999,
    });

    expect(data.totalSpent).toBe(316);
    expect(data.netBalance).toBe(684);
    expect(data.expenses.map((expense: { vat: number }) => expense.vat)).toEqual([0, 16]);
  });
});
