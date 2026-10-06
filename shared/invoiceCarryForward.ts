export function isCarryForwardBalanceInvoice(invoice: any): boolean {
  if (!invoice) return false;

  const title = typeof invoice.title === "string" ? invoice.title.trim() : "";
  const notes = typeof invoice.notes === "string" ? invoice.notes.trim() : "";
  const invoiceNumber = typeof invoice.invoiceNumber === "string" ? invoice.invoiceNumber : "";

  return (
    title.toLowerCase().startsWith("balance for ") ||
    notes.toLowerCase().includes("remaining balance carried forward from invoice") ||
    /^balance for /i.test(invoiceNumber)
  );
}

export function filterCarryForwardInvoices<T>(items: T[] | null | undefined): T[] {
  return (items ?? []).filter((item) => !isCarryForwardBalanceInvoice(item));
}