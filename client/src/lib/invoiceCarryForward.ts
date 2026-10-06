import { filterCarryForwardInvoices } from "@shared/invoiceCarryForward";
export { filterCarryForwardInvoices, isCarryForwardBalanceInvoice } from "@shared/invoiceCarryForward";

export function summarizeOutstandingInvoices(
  invoices: Array<{ amount: number; paidAmount?: number; status: string }>,
) {
  const summary = { dueAmount: 0, dueCount: 0, overdueAmount: 0, overdueCount: 0 };

  for (const invoice of filterCarryForwardInvoices(invoices)) {
    const status = invoice.status.trim().toLowerCase();
    const outstanding = Math.max(0, Number(invoice.amount || 0) - Number(invoice.paidAmount || 0));
    if (outstanding === 0) continue;

    if (["pending", "sent", "partial"].includes(status)) {
      summary.dueAmount += outstanding;
      summary.dueCount++;
    } else if (status === "overdue") {
      summary.overdueAmount += outstanding;
      summary.overdueCount++;
    }
  }

  return summary;
}
