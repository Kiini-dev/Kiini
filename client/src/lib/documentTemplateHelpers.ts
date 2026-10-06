export type DocumentTemplateRecord = {
  id?: string;
  isDefault?: boolean;
  content?: string;
};

export const DOCUMENT_KIND_TO_TEMPLATE_TYPE = {
  invoice: "invoice",
  estimate: "estimate",
  quotation: "quotation",
  receipt: "receipt",
  credit_note: "credit_note",
  debit_note: "debit_note",
  purchase_order: "purchase_order",
  lpo: "purchase_order",
  grn: "grn",
  delivery_note: "dn",
  dn: "dn",
  rfq: "rfq",
  work_order: "work_order",
  expense_claim: "expense_claim",
  service_invoice: "service_invoice",
  contract: "contract",
  proposal: "proposal",
  payslip: "payslip",
  warranty: "warranty",
  asset: "asset",
  imprest: "imprest",
  order: "order",
} as const;

export type DocumentKind = keyof typeof DOCUMENT_KIND_TO_TEMPLATE_TYPE;

export function resolveTemplateTypeForDocument(kind: string): string {
  return DOCUMENT_KIND_TO_TEMPLATE_TYPE[kind as DocumentKind] || kind;
}

export function getDefaultDocumentTemplate<T extends DocumentTemplateRecord>(templates: T[]): T | undefined {
  if (!Array.isArray(templates) || templates.length === 0) return undefined;
  return templates.find((template) => Boolean(template?.isDefault)) || templates[0];
}

export function getDefaultDocumentTemplateContent(templates: DocumentTemplateRecord[]): string | undefined {
  return getDefaultDocumentTemplate(templates)?.content;
}
