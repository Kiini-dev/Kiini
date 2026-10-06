import { describe, expect, it } from "vitest";
import { filterCarryForwardInvoices, summarizeOutstandingInvoices } from "./invoiceCarryForward";

describe("invoice outstanding summary", () => {
  it("counts a partial invoice balance without double-counting its carry-forward invoice", () => {
    const summary = summarizeOutstandingInvoices([
      { amount: 40000, paidAmount: 15000, status: "partial", title: "Initial invoice" },
      {
        amount: 25000,
        paidAmount: 0,
        status: "sent",
        title: "Balance for INV-0001",
        notes: "Remaining balance carried forward from invoice INV-0001.",
      },
    ] as any);

    expect(summary).toEqual({ dueAmount: 25000, dueCount: 1, overdueAmount: 0, overdueCount: 0 });
  });

  it("counts the original invoice once for billed revenue and cash collected", () => {
    const invoices = filterCarryForwardInvoices([
      { total: 4000000, paidAmount: 1500000, title: "Project invoice" },
      {
        total: 2500000,
        paidAmount: 0,
        title: "Balance for INV-0001",
        notes: "Remaining balance carried forward from invoice INV-0001.",
      },
    ]);

    expect(invoices.reduce((sum, invoice: any) => sum + invoice.total, 0)).toBe(4000000);
    expect(invoices.reduce((sum, invoice: any) => sum + invoice.paidAmount, 0)).toBe(1500000);
  });
});