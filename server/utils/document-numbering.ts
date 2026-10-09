import { eq, and, sql } from "drizzle-orm";
import { getNextDocumentNumberWithFormat } from "../db";
import { 
  invoices, 
  estimates, 
  expenses, 
  receipts, 
  proposals, 
  payments,
  settings,
  documentNumberFormats,
} from "../../drizzle/schema";

// Default prefixes — overridden by settings
const DEFAULT_PREFIXES: Record<string, string> = {
  invoice: "INV",
  estimate: "EST",
  expense: "EXP",
  receipt: "REC",
  proposal: "PROP",
  payment: "PAY",
  contract: "CON",
  quotation: "QT",
  purchase_order: "PO",
  project: "PRJ",
  credit_note: "CN",
  debit_note: "DN",
  delivery_note: "DN",
  lpo: "LPO",
  grn: "GRN",
  work_order: "WO",
  service_invoice: "SI",
  imprest: "IMP",
  imprest_surrender: "IMPS",
  payslip: "PS",
  rfq: "RFQ",
  expense_claim: "EC",
};

// Settings key names (match Settings.tsx document numbering keys)
const PREFIX_SETTING_KEYS: Record<string, string> = {
  invoice: "invoicePrefix",
  estimate: "estimatePrefix",
  expense: "expensePrefix",
  receipt: "receiptPrefix",
  proposal: "proposalPrefix",
  payment: "paymentPrefix",
  contract: "contractPrefix",
  quotation: "quotationPrefix",
  purchase_order: "purchaseOrderPrefix",
  project: "projectPrefix",
  credit_note: "creditNotePrefix",
  debit_note: "debitNotePrefix",
  delivery_note: "deliveryNotePrefix",
  lpo: "lpoPrefix",
  grn: "grnPrefix",
  work_order: "workOrderPrefix",
  service_invoice: "serviceInvoicePrefix",
  imprest: "imprestPrefix",
  imprest_surrender: "imprestSurrenderPrefix",
  payslip: "payslipPrefix",
  rfq: "rfqPrefix",
  expense_claim: "expenseClaimPrefix",
};

/**
 * Helper function to generate next document number in format PREFIX-000000
 * Reads custom prefix from settings table, falls back to defaults
 */
async function generateNextDocumentNumber(
  db: any,
  documentType: "invoice" | "estimate" | "expense" | "receipt" | "proposal" | "payment" | "contract" | "quotation" | "purchase_order" | "project" | "credit_note" | "debit_note" | "delivery_note" | "lpo" | "grn" | "work_order" | "rfq" | "service_invoice" | "expense_claim" | "dn" | "service_report" | "service_request" | "service_order" | "service_agreement" | "service_contract" | "service_quote" | "service_proposal" | "service_estimate" | "service_payment" | "service_receipt" | "service_credit_note" | "service_debit_note" | "service_delivery_note" | "service_lpo" | "service_grn" | "service_work_order" | "service_rfq" | "service_expense_claim" | "service_dn" | "imprest" | "imprest_surrender" | "payslip" | "supplier" | "order" | "warranty" | "ticket" | "product" | "service" | "subscription" | "department"
): Promise<string> {
  try {
    // Look up custom prefix from settings
    let prefix = DEFAULT_PREFIXES[documentType] || "DOC";
    const settingKey = PREFIX_SETTING_KEYS[documentType];
    if (settingKey) {
      try {
        const rows = await db.select().from(settings)
          .where(and(eq(settings.category, "numbering"), eq(settings.key, settingKey)))
          .limit(1);
        if (rows.length > 0 && rows[0].value) {
          prefix = rows[0].value;
        }
      } catch { /* use default prefix */ }
    }

    const formatType = documentType;
    const defaults: Record<string, string> = { invoice: "INV", estimate: "EST", expense: "EXP", receipt: "REC", proposal: "PROP", payment: "PAY", contract: "CON", quotation: "QT", purchase_order: "PO", project: "PRJ", credit_note: "CN", debit_note: "DN", delivery_note: "DN", lpo: "LPO", grn: "GRN", work_order: "WO", service_invoice: "SI", request_for_quotation: "RFQ", rfq: "RFQ", service_request: "SR", service_order: "SO", service_agreement: "SA", service_contract: "SC", service_quote: "SQ", service_proposal: "SP", service_estimate: "SE", service_payment: "SPAY", service_receipt: "SREC", service_credit_note: "SCN", service_debit_note: "SDN", service_delivery_note: "SDN", service_lpo: "SLPO", service_grn: "SGRN", service_work_order: "SWO", service_rfq: "SRFQ", service_expense_claim: "SEC", expense_claim: "EC", imprest: "IMP", imprest_surrender: "IMPS", payslip: "PS", dn: "DN", service_dn: "SDN" };
    prefix = prefix === "DOC" ? (defaults[formatType] || "DOC") : prefix;

    return await db.transaction(async (tx: any) => {
      const locked = await tx.execute(sql`SELECT prefix, padding, separator, currentNumber FROM documentNumberFormats WHERE documentType = ${formatType} LIMIT 1 FOR UPDATE`);
      const row = (locked?.[0] as any[])?.[0];
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      if (!row) {
        await tx.insert(documentNumberFormats).values({ id: `${formatType}_${Date.now()}`, documentType: formatType, prefix, padding: 6, separator: "-", currentNumber: 2, createdAt: now, updatedAt: now } as any);
        return `${prefix}-000001`;
      }
      const sequence = Number(row.currentNumber || 1);
      await tx.update(documentNumberFormats).set({ currentNumber: sequence + 1, updatedAt: now }).where(eq(documentNumberFormats.documentType, formatType as any));
      return `${row.prefix || prefix}${row.separator || "-"}${String(sequence).padStart(Number(row.padding || 6), "0")}`;
    });
  } catch (err) {
    console.warn(`[document-numbering] legacy counter failed for ${documentType}; falling back to hardened formatter`, err);
    try {
      return await getNextDocumentNumberWithFormat(documentType as string);
    } catch (fallbackError) {
      console.error(`Error generating ${documentType} number:`, fallbackError);
      throw new Error(`Unable to allocate a ${documentType} document number`);
    }
  }
}

export {
  generateNextDocumentNumber,
};
