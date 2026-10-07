/**
 * Template-based PDF/HTML renderer for documents
 * Fetches the default (or specified) document template from documentTemplates table,
 * binds actual DB data, and returns rendered HTML for PDF/print rendering.
 */

import { getDb, getPool } from '../db';
import { invoices, invoiceItems, clients, settings, receipts, lineItems, estimates, estimateItems, contracts, proposals, payslips, employees, warranties } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { formatMinorCurrencyAmount, toMajorCurrencyAmount } from '../../shared/currency';

// Map document type to template type name in documentTemplates table
const TYPE_MAP: Record<string, string> = {
  invoice: 'invoice',
  receipt: 'receipt',
  estimate: 'estimate',
  quotation: 'quotation',
  credit_note: 'credit_note',
  debit_note: 'debit_note',
  lpo: 'lpo',
  grn: 'grn',
  delivery_note: 'delivery_note',
  order: 'order',
  imprest: 'imprest',
  expense_claim: 'expense_claim',
  service_invoice: 'service_invoice',
  work_order: 'work_order',
  asset: 'asset',
  contract: 'contract',
  proposal: 'proposal',
  payslip: 'payslip',
  warranty: 'warranty',
};

// Map document type to fallback HTML template file
const TEMPLATE_FILE_MAP: Record<string, string> = {
  invoice: 'Invoice-template.html',
  receipt: 'receipt-template.html',
  estimate: 'estimate-template.html',
  quotation: 'quotation-rfq-template.html',
  credit_note: 'credit-note-template.html',
  debit_note: 'debit-note-template.html',
  lpo: 'lpo-template.html',
  grn: 'grn-template.html',
  delivery_note: 'dn-template.html',
  order: 'order-template.html',
  imprest: 'imprest-template.html',
  expense_claim: 'expense-claim-template.html',
  service_invoice: 'service-invoice-template.html',
  work_order: 'work-order-template.html',
  asset: 'assets-template.html',
  contract: 'contract-template.html',
  proposal: 'proposal-template.html',
  payslip: 'payslip-template.html',
  warranty: 'warranty-template.html',
};

interface RenderResult {
  html: string;
  title: string;
}

/**
 * Get template HTML content: from DB (default template) or fallback to file system
 */
async function getTemplateContent(documentType: string, organizationId?: string | null, templateId?: string): Promise<string | null> {
  const pool = getPool();
  if (!pool) return null;

  const type = TYPE_MAP[documentType] || documentType;

  // 1. If specific templateId provided, use it
  if (templateId) {
    const [rows] = organizationId
      ? await pool.query("SELECT content FROM documentTemplates WHERE id = ? AND organizationId = ?", [templateId, organizationId])
      : await pool.query("SELECT content FROM documentTemplates WHERE id = ?", [templateId]);
    const arr = rows as any[];
    if (arr.length) return arr[0].content;
  }

  // 2. Try default template for this type+org
  if (organizationId) {
    const [rows] = await pool.query(
      "SELECT content FROM documentTemplates WHERE type = ? AND organizationId = ? AND isDefault = 1 LIMIT 1",
      [type, organizationId]
    );
    const arr = rows as any[];
    if (arr.length) return arr[0].content;
  }

  // 3. Try any default template for this type
  const [rows] = await pool.query(
    "SELECT content FROM documentTemplates WHERE type = ? AND isDefault = 1 LIMIT 1",
    [type]
  );
  const arr = rows as any[];
  if (arr.length) return arr[0].content;

  // 4. Try first template of this type
  const [first] = organizationId
    ? await pool.query("SELECT content FROM documentTemplates WHERE type = ? AND organizationId = ? ORDER BY createdAt ASC LIMIT 1", [type, organizationId])
    : await pool.query("SELECT content FROM documentTemplates WHERE type = ? ORDER BY createdAt ASC LIMIT 1", [type]);
  const firstArr = first as any[];
  if (firstArr.length) return firstArr[0].content;

  // 5. Final fallback: load from file system
  const templateFile = TEMPLATE_FILE_MAP[documentType];
  if (templateFile) {
    const filePath = path.resolve(process.cwd(), 'templates', templateFile);
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
    } catch { /* ignore */ }
  }

  return null;
}

/**
 * Fetch common company info from settings
 */
async function fetchCompanyInfo(db: any): Promise<Record<string, string>> {
  const company: Record<string, string> = {};

  const companyRows = await db.select().from(settings).where(eq(settings.category, 'company'));
  companyRows.forEach((s: any) => { if (s.key) company[s.key] = s.value ?? ''; });

  const pickFirst = (...values: Array<string | undefined | null>): string => {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return '';
  };

  const logoValue = pickFirst(company.companyLogo, company.company_logo, company.logoUrl, company.logo, company.imageUrl);
  company.logo = logoValue;
  company.logoUrl = logoValue;
  company.app_logo = logoValue;
  company.name = pickFirst(
    company.name,
    company.companyName,
    company.company_name,
    company.companyname,
    company.brandName,
    company.businessName,
    company.business_name,
    company.organizationName,
    company.organisationName,
    'Kiini'
  );
  company.email = pickFirst(company.email, company.companyEmail, company.contactEmail, company.businessEmail);
  company.phone = pickFirst(company.phone, company.companyPhone, company.contactPhone, company.businessPhone);
  company.address = pickFirst(company.address, company.companyAddress, company.contactAddress, company.businessAddress);
  company.website = pickFirst(company.website, company.companyWebsite, company.websiteUrl);
  company.tagline = pickFirst(company.tagline, company.slogan, company.companyTagline);

  return company;
}

/**
 * Fetch payment settings (bank + mpesa)
 */
async function fetchPaymentSettings(db: any): Promise<{ bank: Record<string, string>; mpesa: Record<string, string> }> {
  const bankRows = await db.select().from(settings).where(eq(settings.category, 'payment_bank'));
  const bank: Record<string, string> = {};
  bankRows.forEach((s: any) => { if (s.key) bank[s.key] = s.value ?? ''; });

  const fallbackBankRows = await db.select().from(settings).where(eq(settings.category, 'bank'));
  fallbackBankRows.forEach((s: any) => { if (s.key) bank[s.key] ||= s.value ?? ''; });

  const mpesaRows = await db.select().from(settings).where(eq(settings.category, 'payment_mpesa'));
  const mpesa: Record<string, string> = {};
  mpesaRows.forEach((s: any) => { if (s.key) mpesa[s.key] = s.value ?? ''; });

  const bankName = bank.bankName || bank.name || bank.accountBank || ''; 
  const accountName = bank.accountName || bank.account_name || bank.bankAccountName || bank.name || '';
  const accountNumber = bank.accountNumber || bank.account_number || bank.bankAccountNumber || '';
  const branch = bank.branch || bank.bankBranch || '';

  const paybillNumber = mpesa.paybillNumber || mpesa.paybill || mpesa.shortCode || mpesa.shortcode || '';
  const mpesaAccountNumber = mpesa.accountNumber || mpesa.account_number || mpesa.phoneNumber || mpesa.msisdn || '';

  return {
    bank: {
      ...bank,
      bankName,
      accountName,
      accountNumber,
      branch,
    },
    mpesa: {
      ...mpesa,
      paybillNumber,
      accountNumber: mpesaAccountNumber,
    },
  };
}

/**
 * Fetch currency setting
 */
async function fetchCurrency(db: any): Promise<string> {
  const currRows = await db.select().from(settings).where(eq(settings.category, 'currency'));
  const currMap: Record<string, string> = {};
  currRows.forEach((s: any) => { if (s.key) currMap[s.key] = s.value ?? ''; });
  return currMap.code || currMap.symbol || 'KES';
}

/**
 * Fetch invoice terms from settings
 */
async function fetchInvoiceTerms(db: any): Promise<string> {
  const rows = await db.select().from(settings).where(eq(settings.category, 'invoice_settings'));
  const map: Record<string, string> = {};
  rows.forEach((s: any) => { if (s.key) map[s.key] = s.value ?? ''; });
  return map.termsAndConditions || map.terms || map.termsAndConditionsText || map.defaultTerms || '';
}

/**
 * Bind data to template HTML by replacing placeholders
 */
function bindDataToTemplate(html: string, data: Record<string, any>): string {
  let result = html;

  const companyInfo = data.companyInfo || {};
  const companyLogo = companyInfo.logo || companyInfo.logoUrl || companyInfo.companyLogo || companyInfo.company_logo || companyInfo.logo_url || '';
  const logoTokens: Record<string, string> = {
    'company.logo': companyLogo,
    'company.logoUrl': companyLogo,
    'company.companyLogo': companyLogo,
    'company.company_logo': companyLogo,
    'company.logo_url': companyLogo,
    'companyInfo.logo': companyLogo,
    'companyInfo.logoUrl': companyLogo,
    'companyInfo.companyLogo': companyLogo,
    'companyInfo.company_logo': companyLogo,
    'companyInfo.logo_url': companyLogo,
  };
  for (const [token, value] of Object.entries(logoTokens)) {
    result = result.split(`{{${token}}}`).join(value);
    result = result.split(`{{ ${token} }}`).join(value);
    result = result.split(`\${${token}}`).join(value);
    result = result.split(`[${token}]`).join(value);
  }

  // Replace ${companyInfo.*} placeholders
  if (data.companyInfo) {
    result = result.replace(/\$\{companyInfo\.(\w+)\}/g, (_m: string, key: string) => {
      return data.companyInfo[key] || '';
    });
  }

  // Replace [PLACEHOLDER] format
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && typeof value !== 'object') {
      const placeholder = `[${key}]`;
      result = result.split(placeholder).join(String(value));
    }
  }

  // Replace {{placeholder}} format (used by DocumentTemplates.tsx editor)
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && typeof value !== 'object') {
      const placeholder = `{{${key}}}`;
      result = result.split(placeholder).join(String(value));
    }
  }

  return result;
}

/**
 * Build line items HTML table rows
 */
function buildLineItemsTable(items: any[], currency: string): string {
  if (!items.length) return '<tr><td colspan="4" style="text-align:center;padding:12px;color:#636e72;">No line items</td></tr>';

  return items.map((item, index) => {
    const qty = item.quantity ?? 1;
    const unitPrice = toMajorCurrencyAmount(item.unitPrice ?? item.rate ?? 0, 'minor');
    const total = toMajorCurrencyAmount(item.total ?? item.amount ?? 0, 'minor');
    const desc = item.description || item.itemType || `Item ${index + 1}`;
    return `<tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #dfe6e9;">${desc}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: center;">${qty}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: right;">${currency} ${unitPrice.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: right;">${currency} ${total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
    </tr>`;
  }).join('\n');
}

/**
 * Build individual item token variables for advanced template customization
 * Generates tokens for each item with all available fields from the database
 */
function resolveClientCompanyName(client: any): string {
  return client?.companyName
    || client?.company
    || client?.company_name
    || client?.companyname
    || client?.businessName
    || client?.business_name
    || client?.organizationName
    || client?.organisationName
    || client?.customerCompanyName
    || client?.billingCompany
    || '';
}

function resolveClientContactName(client: any): string {
  return client?.contactPerson
    || client?.contactName
    || client?.primaryContact
    || client?.customerName
    || client?.companyName
    || client?.company
    || client?.name
    || '';
}

function buildItemTokenVariables(items: any[], currency: string): Record<string, string> {
  const itemVariables: Record<string, string> = {};

  items.forEach((item, index) => {
    const itemNum = index + 1;
    const qty = item.quantity ?? 1;
    const rate = toMajorCurrencyAmount(item.unitPrice ?? item.rate ?? 0, 'minor');
    const amount = toMajorCurrencyAmount(item.total ?? item.amount ?? 0, 'minor');
    const taxRate = item.taxRate ?? 0;
    const taxAmount = toMajorCurrencyAmount(item.taxAmount ?? 0, 'minor');
    const desc = item.description || item.itemType || `Item ${itemNum}`;
    const lineNumber = item.lineNumber ?? itemNum;

    // Generate both uppercase and lowercase variants for compatibility
    const prefix = `ITEM_${itemNum}`;
    const prefixLower = `item_${itemNum}`;

    // Uppercase format (legacy support)
    itemVariables[`${prefix}_DESCRIPTION`] = desc;
    itemVariables[`${prefix}_QUANTITY`] = String(qty);
    itemVariables[`${prefix}_QTY`] = String(qty);
    itemVariables[`${prefix}_RATE`] = `${currency} ${rate.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    itemVariables[`${prefix}_UNIT_PRICE`] = `${currency} ${rate.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    itemVariables[`${prefix}_AMOUNT`] = `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    itemVariables[`${prefix}_TOTAL`] = `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    itemVariables[`${prefix}_TAX_RATE`] = `${taxRate}%`;
    itemVariables[`${prefix}_TAX_AMOUNT`] = `${currency} ${taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    itemVariables[`${prefix}_LINE_NUMBER`] = String(lineNumber);

    // Lowercase format (new, recommended)
    itemVariables[`${prefixLower}_description`] = desc;
    itemVariables[`${prefixLower}_quantity`] = String(qty);
    itemVariables[`${prefixLower}_qty`] = String(qty);
    itemVariables[`${prefixLower}_rate`] = `${currency} ${rate.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    itemVariables[`${prefixLower}_unit_price`] = `${currency} ${rate.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    itemVariables[`${prefixLower}_amount`] = `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    itemVariables[`${prefixLower}_total`] = `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    itemVariables[`${prefixLower}_tax_rate`] = `${taxRate}%`;
    itemVariables[`${prefixLower}_tax_amount`] = `${currency} ${taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
    itemVariables[`${prefixLower}_line_number`] = String(lineNumber);

    // Raw values (no currency formatting) for custom formatting
    itemVariables[`${prefixLower}_quantity_raw`] = String(qty);
    itemVariables[`${prefixLower}_rate_raw`] = String(rate);
    itemVariables[`${prefixLower}_amount_raw`] = String(amount);
    itemVariables[`${prefixLower}_tax_rate_raw`] = String(taxRate);
    itemVariables[`${prefixLower}_tax_amount_raw`] = String(taxAmount);
  });

  return itemVariables;
}

/**
 * Render an invoice using the document template
 */
export async function renderInvoiceTemplate(invoiceId: string, organizationId?: string | null, templateId?: string): Promise<RenderResult | null> {
  const db = await getDb();
  if (!db) return null;

  // Fetch invoice
  const invoiceData = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  if (!invoiceData.length) return null;
  const invoice = invoiceData[0];

  // Fetch client
  const clientData = await db.select().from(clients).where(eq(clients.id, invoice.clientId)).limit(1);
  const client = clientData.length ? clientData[0] : null;

  // Fetch line items
  const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));

  // Fetch settings
  const company = await fetchCompanyInfo(db);
  const payment = await fetchPaymentSettings(db);
  const currency = await fetchCurrency(db);
  const defaultTerms = await fetchInvoiceTerms(db);

  // Get template
  const templateHtml = await getTemplateContent('invoice', organizationId, templateId);
  if (!templateHtml) return null;

  const formatDate = (d: any) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return String(d); }
  };

  const formatAmount = (amt: any) => {
    const n = toMajorCurrencyAmount(amt, 'minor');
    return `${currency} ${n.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  // Build items table HTML
  const itemsTableRows = buildLineItemsTable(items, currency);
  const itemsTableHtml = `<table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 12px; text-align: left; font-weight: 600;">Description</th>
        <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Qty</th>
        <th style="padding: 10px 12px; text-align: right; font-weight: 600;">Unit Price</th>
        <th style="padding: 10px 12px; text-align: right; font-weight: 600;">Amount</th>
      </tr>
    </thead>
    <tbody>${itemsTableRows}</tbody>
  </table>`;

  // Build totals section
  const subtotal = toMajorCurrencyAmount(invoice.subtotal, 'minor');
  const taxAmount = toMajorCurrencyAmount(invoice.taxAmount, 'minor');
  const discountAmount = toMajorCurrencyAmount(invoice.discountAmount, 'minor');
  const total = toMajorCurrencyAmount(invoice.total, 'minor');

  const totalsHtml = `
    <div style="margin-top: 16px; text-align: right;">
      <div style="margin: 4px 0;"><strong>Subtotal:</strong> ${currency} ${subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>
      ${taxAmount > 0 ? `<div style="margin: 4px 0;"><strong>Tax:</strong> ${currency} ${taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>` : ''}
      ${discountAmount > 0 ? `<div style="margin: 4px 0;"><strong>Discount:</strong> -${currency} ${discountAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>` : ''}
      <div style="margin-top: 8px; padding-top: 8px; border-top: 2px solid #ff9f43; font-size: 18px; font-weight: 700; color: #ff9f43;">
        Total: ${currency} ${total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
      </div>
    </div>`;

  // Build payment instructions
  const paymentHtml = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
    <div style="background: #f8f9fa; padding: 12px; border-radius: 4px;">
      <strong style="display: block; margin-bottom: 6px;">Bank Details</strong>
      ${payment.bank.bankName ? `<div>Bank: ${payment.bank.bankName}</div>` : ''}
      ${payment.bank.branch ? `<div>Branch: ${payment.bank.branch}</div>` : ''}
      ${payment.bank.accountNumber ? `<div>Account: ${payment.bank.accountNumber}</div>` : ''}
      ${payment.bank.accountName ? `<div>Name: ${payment.bank.accountName}</div>` : ''}
    </div>
    <div style="background: #f8f9fa; padding: 12px; border-radius: 4px;">
      <strong style="display: block; margin-bottom: 6px;">M-Pesa Payment</strong>
      ${payment.mpesa.paybillNumber ? `<div>Paybill: ${payment.mpesa.paybillNumber}</div>` : ''}
      ${payment.mpesa.accountNumber ? `<div>Account: ${payment.mpesa.accountNumber}</div>` : ''}
    </div>
  </div>`;

  // Build individual item variables for templates that expect them
  const itemVariables = buildItemTokenVariables(items, currency);

  const clientCompanyName = resolveClientCompanyName(client);
  const clientContactName = resolveClientContactName(client);

  // Bind all data
  const boundHtml = bindDataToTemplate(templateHtml, {
    companyInfo: company,
    // Company branding
    COMPANY_NAME: company.name || '',
    company_name: company.name || '',
    COMPANY_LOGO: company.logo || company.logoUrl || '',
    company_logo: company.logo || company.logoUrl || '',
    COMPANY_TAGLINE: company.tagline || company.slogan || '',
    company_tagline: company.tagline || company.slogan || '',
    COMPANY_EMAIL: company.email || '',
    company_email: company.email || '',
    COMPANY_PHONE: company.phone || '',
    company_phone: company.phone || '',
    COMPANY_ADDRESS: company.address || '',
    company_address: company.address || '',
    COMPANY_WEBSITE: company.website || '',
    company_website: company.website || '',
    // Document details
    INVOICE_NUMBER: invoice.invoiceNumber,
    invoice_number: invoice.invoiceNumber,
    DOCUMENT_NUMBER: invoice.invoiceNumber,
    document_number: invoice.invoiceNumber,
    DATE_ISSUED: formatDate(invoice.issueDate),
    date_issued: formatDate(invoice.issueDate),
    ISSUE_DATE: formatDate(invoice.issueDate),
    issue_date: formatDate(invoice.issueDate),
    DUE_DATE: formatDate(invoice.dueDate),
    due_date: formatDate(invoice.dueDate),
    STATUS: invoice.status?.toUpperCase() || 'DRAFT',
    TAX_RATE: invoice.taxAmount ? `${((Number(invoice.taxAmount) / Number(invoice.subtotal)) * 100).toFixed(1)}%` : '0%',
    tax_rate: invoice.taxAmount ? `${((Number(invoice.taxAmount) / Number(invoice.subtotal)) * 100).toFixed(1)}%` : '0%',
    // Client/Payer details
    CLIENT_NAME: clientContactName,
    client_name: clientContactName,
    CLIENT_COMPANY: clientCompanyName,
    client_company: clientCompanyName,
    CLIENT_COMPANY_NAME: clientCompanyName,
    client_company_name: clientCompanyName,
    clientCompany: clientCompanyName,
    clientCompanyName: clientCompanyName,
    CLIENT_KRA_PIN: client?.taxId || '',
    client_kra_pin: client?.taxId || '',
    CLIENT_TAX_NUMBER: client?.taxId || '',
    client_tax_number: client?.taxId || '',
    CLIENT_EMAIL: client?.email || '',
    client_email: client?.email || '',
    CLIENT_PHONE: client?.phone || '',
    client_phone: client?.phone || '',
    CLIENT_ADDRESS: client?.address || '',
    client_address: client?.address || '',
    CONTACT_PERSON: client?.contactPerson || '',
    // Amounts
    SUBTOTAL: formatAmount(invoice.subtotal),
    TAX_AMOUNT: formatAmount(invoice.taxAmount),
    DISCOUNT: formatAmount(invoice.discountAmount),
    TOTAL: formatAmount(invoice.total),
    PAID_AMOUNT: formatAmount(invoice.paidAmount),
    BALANCE_DUE: formatAmount((Number(invoice.total) || 0) - (Number(invoice.paidAmount) || 0)),
    // Table
    ITEMS_TABLE: itemsTableHtml,
    items_table: itemsTableHtml,
    LINE_ITEMS: itemsTableHtml,
    // Totals section
    TOTALS_SECTION: totalsHtml,
    // Payment
    PAYMENT_INSTRUCTIONS: paymentHtml,
    paymentInstructions: paymentHtml,
    BANK_NAME: payment.bank.bankName || '',
    BANK_BRANCH: payment.bank.branch || '',
    BANK_ACCOUNT: payment.bank.accountNumber || '',
    BANK_ACCOUNT_NAME: payment.bank.accountName || '',
    ACCOUNT_NAME: payment.bank.accountName || '',
    MPESA_PAYBILL: payment.mpesa.paybillNumber || '',
    MPESA_ACCOUNT: payment.mpesa.accountNumber || '',
    // Terms & Notes
    NOTES: invoice.notes || '',
    TERMS: invoice.terms || defaultTerms || '',
    TERMS_AND_CONDITIONS: invoice.terms || defaultTerms || '',
    terms: invoice.terms || defaultTerms || '',
    termsAndConditions: invoice.terms || defaultTerms || '',
    // Footer
    FOOTER_TEXT: `This is a system generated invoice. For inquiries, contact ${company.email || ''}`,
    // Individual item variables
    ...itemVariables,
  });

  return {
    html: boundHtml,
    title: `${invoice.invoiceNumber} - ${clientCompanyName || 'Client'}`,
  };
}

/**
 * Render a receipt using the document template
 */
export async function renderReceiptTemplate(receiptId: string, organizationId?: string | null, templateId?: string): Promise<RenderResult | null> {
  const db = await getDb();
  if (!db) return null;

  const receiptData = await db.select().from(receipts).where(eq(receipts.id, receiptId)).limit(1);
  if (!receiptData.length) return null;
  const receipt = receiptData[0];

  const clientData = await db.select().from(clients).where(eq(clients.id, receipt.clientId)).limit(1);
  const client = clientData.length ? clientData[0] : null;

  const items = await db.select().from(lineItems).where(
    and(eq(lineItems.documentId, receiptId), eq(lineItems.documentType, 'receipt'))
  );

  const company = await fetchCompanyInfo(db);
  const currency = await fetchCurrency(db);

  const templateHtml = await getTemplateContent('receipt', organizationId, templateId);
  if (!templateHtml) return null;

  const formatDate = (d: any) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return String(d); }
  };

  const amount = toMajorCurrencyAmount(receipt.amount, 'minor');
  const formatAmount = (amt: any) => {
    const n = toMajorCurrencyAmount(amt, 'minor');
    return `${currency} ${n.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const itemsTableRows = items.length ? items.map((item: any, index: number) => {
    const qty = item.quantity ?? 1;
    const rate = toMajorCurrencyAmount(item.unitPrice ?? item.rate ?? 0, 'minor');
    const total = toMajorCurrencyAmount(item.total ?? item.amount ?? 0, 'minor');
    return `<tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #dfe6e9;">${item.description || `Item ${index + 1}`}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: center;">${qty}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: right;">${currency} ${rate.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: right;">${currency} ${total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
    </tr>`;
  }).join('\n') : `<tr><td colspan="4" style="text-align:center;padding:12px;">Payment received - ${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td></tr>`;

  // Build individual item variables for templates that expect them
  const itemVariables = buildItemTokenVariables(items, currency);
  const clientCompanyName = resolveClientCompanyName(client);
  const clientContactName = resolveClientContactName(client);

  const boundHtml = bindDataToTemplate(templateHtml, {
    companyInfo: company,
    // Company branding
    COMPANY_NAME: company.name || '',
    company_name: company.name || '',
    companyName: company.name || '',
    COMPANY_LOGO: company.logo || company.logoUrl || '',
    company_logo: company.logo || company.logoUrl || '',
    companyLogo: company.logo || company.logoUrl || '',
    logo_url: company.logo || company.logoUrl || '',
    logoUrl: company.logo || company.logoUrl || '',
    COMPANY_TAGLINE: company.tagline || company.slogan || '',
    company_tagline: company.tagline || company.slogan || '',
    COMPANY_EMAIL: company.email || '',
    company_email: company.email || '',
    COMPANY_PHONE: company.phone || '',
    company_phone: company.phone || '',
    COMPANY_ADDRESS: company.address || '',
    company_address: company.address || '',
    COMPANY_WEBSITE: company.website || '',
    company_website: company.website || '',
    // Document details
    RECEIPT_NUMBER: receipt.receiptNumber,
    receipt_number: receipt.receiptNumber,
    DOCUMENT_NUMBER: receipt.receiptNumber,
    document_number: receipt.receiptNumber,
    RECEIPT_DATE: formatDate(receipt.receiptDate),
    receipt_date: formatDate(receipt.receiptDate),
    ISSUE_DATE: formatDate(receipt.receiptDate),
    issue_date: formatDate(receipt.receiptDate),
    PAYMENT_METHOD: receipt.paymentMethod?.replace(/_/g, ' ').toUpperCase() || '',
    payment_method: receipt.paymentMethod?.replace(/_/g, ' ') || '',
    AMOUNT: `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
    amount: `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
    TOTAL: `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
    // Client/Payer details
    CLIENT_NAME: clientContactName,
    client_name: clientContactName,
    CLIENT_COMPANY: clientCompanyName,
    client_company: clientCompanyName,
    CLIENT_COMPANY_NAME: clientCompanyName,
    client_company_name: clientCompanyName,
    clientCompany: clientCompanyName,
    clientCompanyName: clientCompanyName,
    CLIENT_KRA_PIN: client?.taxId || '',
    client_kra_pin: client?.taxId || '',
    CLIENT_TAX_NUMBER: client?.taxId || '',
    client_tax_number: client?.taxId || '',
    CLIENT_EMAIL: client?.email || '',
    CLIENT_PHONE: client?.phone || '',
    CLIENT_ADDRESS: client?.address || '',
    ITEMS_TABLE: `<table style="width: 100%; border-collapse: collapse;">
      <thead><tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 12px; text-align: left;">Description</th>
        <th style="padding: 10px 12px; text-align: center;">Qty</th>
        <th style="padding: 10px 12px; text-align: right;">Rate</th>
        <th style="padding: 10px 12px; text-align: right;">Amount</th>
      </tr></thead>
      <tbody>${itemsTableRows}</tbody></table>`,
    items_table: `<table style="width: 100%; border-collapse: collapse;"><tbody>${itemsTableRows}</tbody></table>`,
    NOTES: receipt.notes || '',
    FOOTER_TEXT: `This is a system generated receipt. For inquiries, contact ${company.email || ''}`,
    termsAndConditions: receipt.notes || '',
    // Individual item variables
    ...itemVariables,
  });

  return {
    html: boundHtml,
    title: `${receipt.receiptNumber} - ${clientCompanyName || 'Client'}`,
  };
}

/**
 * Render an estimate using the document template
 */
export async function renderEstimateTemplate(estimateId: string, organizationId?: string | null, templateId?: string): Promise<RenderResult | null> {
  const db = await getDb();
  if (!db) return null;

  // Fetch estimate
  const estimateData = await db.select().from(estimates).where(eq(estimates.id, estimateId)).limit(1);
  if (!estimateData.length) return null;
  const estimate = estimateData[0];

  // Fetch client
  const clientData = await db.select().from(clients).where(eq(clients.id, estimate.clientId)).limit(1);
  const client = clientData.length ? clientData[0] : null;

  // Fetch line items
  const items = await db.select().from(estimateItems).where(eq(estimateItems.estimateId, estimateId));

  // Fetch settings
  const company = await fetchCompanyInfo(db);
  const payment = await fetchPaymentSettings(db);
  const currency = await fetchCurrency(db);
  const defaultTerms = await fetchInvoiceTerms(db);

  // Get template
  const templateHtml = await getTemplateContent('estimate', organizationId, templateId);
  if (!templateHtml) return null;

  const formatDate = (d: any) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return String(d); }
  };

  const formatAmount = (amt: any) => {
    const n = toMajorCurrencyAmount(amt, 'minor');
    return `${currency} ${n.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  // Build items table HTML
  const itemsTableRows = buildLineItemsTable(items, currency);
  const itemsTableHtml = `<table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background: #2d3436; color: #fff;">
        <th style="padding: 10px 12px; text-align: left; font-weight: 600;">Description</th>
        <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Qty</th>
        <th style="padding: 10px 12px; text-align: right; font-weight: 600;">Unit Price</th>
        <th style="padding: 10px 12px; text-align: right; font-weight: 600;">Amount</th>
      </tr>
    </thead>
    <tbody>${itemsTableRows}</tbody>
  </table>`;

  // Build totals section
  const subtotal = toMajorCurrencyAmount(estimate.subtotal, 'minor');
  const taxAmount = toMajorCurrencyAmount(estimate.taxAmount, 'minor');
  const discountAmount = toMajorCurrencyAmount(estimate.discountAmount, 'minor');
  const total = toMajorCurrencyAmount(estimate.total, 'minor');

  const totalsHtml = `
    <div style="margin-top: 16px; text-align: right;">
      <div style="margin: 4px 0;"><strong>Subtotal:</strong> ${currency} ${subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>
      ${taxAmount > 0 ? `<div style="margin: 4px 0;"><strong>Tax:</strong> ${currency} ${taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>` : ''}
      ${discountAmount > 0 ? `<div style="margin: 4px 0;"><strong>Discount:</strong> -${currency} ${discountAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>` : ''}
      <div style="margin-top: 8px; padding-top: 8px; border-top: 2px solid #ff9f43; font-size: 18px; font-weight: 700; color: #ff9f43;">
        Total: ${currency} ${total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
      </div>
    </div>`;

  // Build payment instructions
  const paymentHtml = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
    <div style="background: #f8f9fa; padding: 12px; border-radius: 4px;">
      <strong style="display: block; margin-bottom: 6px;">Bank Details</strong>
      ${payment.bank.bankName ? `<div>Bank: ${payment.bank.bankName}</div>` : ''}
      ${payment.bank.branch ? `<div>Branch: ${payment.bank.branch}</div>` : ''}
      ${payment.bank.accountNumber ? `<div>Account: ${payment.bank.accountNumber}</div>` : ''}
      ${payment.bank.accountName ? `<div>Name: ${payment.bank.accountName}</div>` : ''}
    </div>
    <div style="background: #f8f9fa; padding: 12px; border-radius: 4px;">
      <strong style="display: block; margin-bottom: 6px;">M-Pesa Payment</strong>
      ${payment.mpesa.paybillNumber ? `<div>Paybill: ${payment.mpesa.paybillNumber}</div>` : ''}
      ${payment.mpesa.accountNumber ? `<div>Account: ${payment.mpesa.accountNumber}</div>` : ''}
    </div>
  </div>`;

  // Build individual item variables for templates that expect them
  const itemVariables = buildItemTokenVariables(items, currency);
  const clientCompanyName = resolveClientCompanyName(client);
  const clientContactName = resolveClientContactName(client);

  // Bind all data
  const boundHtml = bindDataToTemplate(templateHtml, {
    companyInfo: company,
    // Company branding
    COMPANY_NAME: company.name || '',
    company_name: company.name || '',
    companyName: company.name || '',
    COMPANY_LOGO: company.logo || company.logoUrl || '',
    company_logo: company.logo || company.logoUrl || '',
    companyLogo: company.logo || company.logoUrl || '',
    logo_url: company.logo || company.logoUrl || '',
    logoUrl: company.logo || company.logoUrl || '',
    COMPANY_TAGLINE: company.tagline || company.slogan || '',
    company_tagline: company.tagline || company.slogan || '',
    COMPANY_EMAIL: company.email || '',
    company_email: company.email || '',
    COMPANY_PHONE: company.phone || '',
    company_phone: company.phone || '',
    COMPANY_ADDRESS: company.address || '',
    company_address: company.address || '',
    COMPANY_WEBSITE: company.website || '',
    company_website: company.website || '',
    // Document details
    ESTIMATE_NUMBER: estimate.estimateNumber,
    estimate_number: estimate.estimateNumber,
    DOCUMENT_NUMBER: estimate.estimateNumber,
    document_number: estimate.estimateNumber,
    DATE_ISSUED: formatDate(estimate.issueDate),
    date_issued: formatDate(estimate.issueDate),
    ISSUE_DATE: formatDate(estimate.issueDate),
    issue_date: formatDate(estimate.issueDate),
    EXPIRY_DATE: formatDate(estimate.expiryDate),
    expiry_date: formatDate(estimate.expiryDate),
    DUE_DATE: formatDate(estimate.expiryDate),
    due_date: formatDate(estimate.expiryDate),
    STATUS: estimate.status?.toUpperCase() || 'DRAFT',
    TAX_RATE: estimate.taxAmount ? `${((Number(estimate.taxAmount) / Number(estimate.subtotal)) * 100).toFixed(1)}%` : '0%',
    tax_rate: estimate.taxAmount ? `${((Number(estimate.taxAmount) / Number(estimate.subtotal)) * 100).toFixed(1)}%` : '0%',
    // Client/Payer details
    CLIENT_NAME: clientContactName,
    client_name: clientContactName,
    CLIENT_COMPANY: clientCompanyName,
    client_company: clientCompanyName,
    CLIENT_COMPANY_NAME: clientCompanyName,
    client_company_name: clientCompanyName,
    clientCompany: clientCompanyName,
    clientCompanyName: clientCompanyName,
    CLIENT_KRA_PIN: client?.taxId || '',
    client_kra_pin: client?.taxId || '',
    CLIENT_TAX_NUMBER: client?.taxId || '',
    client_tax_number: client?.taxId || '',
    CLIENT_EMAIL: client?.email || '',
    client_email: client?.email || '',
    CLIENT_PHONE: client?.phone || '',
    client_phone: client?.phone || '',
    CLIENT_ADDRESS: client?.address || '',
    client_address: client?.address || '',
    CONTACT_PERSON: client?.contactPerson || '',
    // Amounts
    SUBTOTAL: formatAmount(estimate.subtotal),
    TAX_AMOUNT: formatAmount(estimate.taxAmount),
    DISCOUNT: formatAmount(estimate.discountAmount),
    TOTAL: formatAmount(estimate.total),
    // Table
    ITEMS_TABLE: itemsTableHtml,
    items_table: itemsTableHtml,
    LINE_ITEMS: itemsTableHtml,
    // Totals section
    TOTALS_SECTION: totalsHtml,
    // Payment
    PAYMENT_INSTRUCTIONS: paymentHtml,
    BANK_NAME: payment.bank.bankName || '',
    BANK_BRANCH: payment.bank.branch || '',
    BANK_ACCOUNT: payment.bank.accountNumber || '',
    BANK_ACCOUNT_NAME: payment.bank.accountName || '',
    MPESA_PAYBILL: payment.mpesa.paybillNumber || '',
    MPESA_ACCOUNT: payment.mpesa.accountNumber || '',
    // Terms & Notes
    NOTES: estimate.notes || '',
    TERMS: estimate.terms || defaultTerms || '',
    TERMS_AND_CONDITIONS: estimate.terms || defaultTerms || '',
    terms: estimate.terms || defaultTerms || '',
    termsAndConditions: estimate.terms || defaultTerms || '',
    // Footer
    FOOTER_TEXT: `This is a system generated estimate. For inquiries, contact ${company.email || ''}`,
    // Individual item variables
    ...itemVariables,
  });

  return {
    html: boundHtml,
    title: `${estimate.estimateNumber} - ${clientCompanyName || 'Client'}`,
  };
}

export async function renderContractTemplate(contractId: string, organizationId?: string | null, templateId?: string): Promise<RenderResult | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.select().from(contracts).where(eq(contracts.id, contractId)).limit(1);
  const contract = rows[0];
  if (!contract) return null;

  const company = await fetchCompanyInfo(db);
  const templateHtml = await getTemplateContent('contract', organizationId, templateId);
  if (!templateHtml) return null;

  const data = {
    COMPANY_NAME: company.name,
    COMPANY_ADDRESS: company.address,
    COMPANY_EMAIL: company.email,
    COMPANY_PHONE: company.phone,
    COMPANY_WEBSITE: company.website,
    COMPANY_LOGO: company.logo,
    CONTRACT_ID: contract.contractNumber || contract.id,
    CONTRACT_NUMBER: contract.contractNumber || contract.id,
    CONTRACT_DATE: formatTemplateDate(contract.createdAt),
    CONTRACT_VALUE: formatTemplateAmount(contract.value, 'KES'),
    START_DATE: contract.startDate || '',
    END_DATE: contract.endDate || '',
    SCOPE_OF_WORK: contract.description || '',
    PAYMENT_TERMS: contract.notes || '',
    CLIENT_NAME: contract.vendor,
    CLIENT_COMPANY: contract.vendor,
    CLIENT_ADDRESS: '',
    TERMS: contract.notes || '',
    NOTES: contract.notes || '',
    company_name: company.name,
    company_address: company.address,
    contract_id: contract.contractNumber || contract.id,
    contract_date: formatTemplateDate(contract.createdAt),
    contract_value: formatTemplateAmount(contract.value, 'KES'),
    start_date: contract.startDate || '',
    end_date: contract.endDate || '',
    scope_of_work: contract.description || '',
    payment_terms: contract.notes || '',
    client_name: contract.vendor,
  };

  return { html: bindDataToTemplate(templateHtml, data), title: `${contract.contractNumber || contract.id} - Contract` };
}

export async function renderProposalTemplate(proposalId: string, organizationId?: string | null, templateId?: string): Promise<RenderResult | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.select().from(proposals).where(eq(proposals.id, proposalId)).limit(1);
  const proposal = rows[0];
  if (!proposal) return null;

  const clientRows = await db.select().from(clients).where(eq(clients.id, proposal.clientId)).limit(1);
  const client = clientRows[0] as any;
  const company = await fetchCompanyInfo(db);
  const currency = await fetchCurrency(db);
  const templateHtml = await getTemplateContent('proposal', organizationId, templateId);
  if (!templateHtml) return null;

  const clientName = resolveClientContactName(client) || resolveClientCompanyName(client);
  const data = {
    companyInfo: company,
    COMPANY_NAME: company.name,
    COMPANY_ADDRESS: company.address,
    COMPANY_EMAIL: company.email,
    COMPANY_PHONE: company.phone,
    COMPANY_WEBSITE: company.website,
    COMPANY_LOGO: company.logo,
    DOCUMENT_TYPE: 'PROPOSAL',
    DOCUMENT_NUMBER: proposal.proposalNumber,
    DOCUMENT_DATE: formatTemplateDate(proposal.issueDate),
    DUE_DATE: formatTemplateDate(proposal.expiryDate),
    CURRENCY: currency,
    PROPOSAL_NUMBER: proposal.proposalNumber,
    PROPOSAL_DATE: formatTemplateDate(proposal.issueDate),
    VALID_UNTIL: formatTemplateDate(proposal.expiryDate),
    CLIENT_NAME: clientName,
    CLIENT_COMPANY: resolveClientCompanyName(client),
    CLIENT_EMAIL: client?.email || '',
    CLIENT_ADDRESS: client?.address || '',
    TITLE: proposal.title || '',
    TOTAL_AMOUNT: formatTemplateAmount(proposal.total, currency),
    SUBTOTAL: formatTemplateAmount(proposal.subtotal, currency),
    TAX_AMOUNT: formatTemplateAmount(proposal.taxAmount, currency),
    DISCOUNT_AMOUNT: formatTemplateAmount(proposal.discountAmount, currency),
    NOTES: proposal.notes || '',
    company_name: company.name,
    company_address: company.address,
    proposal_number: proposal.proposalNumber,
    proposal_date: formatTemplateDate(proposal.issueDate),
    valid_until: formatTemplateDate(proposal.expiryDate),
    client_name: clientName,
    client_company: resolveClientCompanyName(client),
    client_email: client?.email || '',
    client_address: client?.address || '',
    project_name: proposal.title || '',
    total_amount: formatTemplateAmount(proposal.total, currency),
    document_type: 'proposal',
    document_number: proposal.proposalNumber,
    document_date: formatTemplateDate(proposal.issueDate),
    due_date: formatTemplateDate(proposal.expiryDate),
    currency,
    total: formatTemplateAmount(proposal.total, currency),
    subtotal: formatTemplateAmount(proposal.subtotal, currency),
    tax_amount: formatTemplateAmount(proposal.taxAmount, currency),
    discount_amount: formatTemplateAmount(proposal.discountAmount, currency),
    prepared_by: proposal.createdBy || '',
    notes: proposal.notes || '',
  };

  return { html: bindDataToTemplate(templateHtml, data), title: `${proposal.proposalNumber} - Proposal` };
}

export async function renderPayslipTemplate(payslipId: string, organizationId?: string | null, templateId?: string): Promise<RenderResult | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.select().from(payslips).where(eq(payslips.id, payslipId)).limit(1);
  const payslip = rows[0];
  if (!payslip) return null;

  const employeeRows = await db.select().from(employees).where(eq(employees.id, payslip.employeeId)).limit(1);
  const employee = employeeRows[0];
  const company = await fetchCompanyInfo(db);
  const templateHtml = await getTemplateContent('payslip', organizationId, templateId);
  if (!templateHtml) return null;

  const currency = payslip.currencyLabel || 'KES';
  const employeeName = employee ? `${employee.firstName} ${employee.lastName}`.trim() : payslip.employeeId;
  const data = {
    COMPANY_NAME: company.name,
    COMPANY_ADDRESS: company.address,
    COMPANY_EMAIL: company.email,
    COMPANY_LOGO: company.logo,
    PAYSLIP_NUMBER: payslip.payslipNumber,
    PAY_PERIOD: formatTemplateDate(payslip.payMonth),
    PAY_DATE: formatTemplateDate(payslip.payMonth),
    EMPLOYEE_NAME: employeeName,
    EMPLOYEE_NUMBER: employee?.employeeNumber || payslip.employeeId,
    DEPARTMENT: employee?.department || '',
    POSITION: employee?.position || '',
    BANK_NAME: payslip.bankName || employee?.bankName || '',
    BANK_ACCOUNT: payslip.bankAccountNumber || employee?.bankAccountNumber || '',
    BASIC_SALARY: formatTemplateAmount(payslip.basicSalary, currency),
    ALLOWANCES: formatTemplateAmount(payslip.allowances, currency),
    BONUSES: formatTemplateAmount(payslip.bonuses, currency),
    GROSS_SALARY: formatTemplateAmount(payslip.grossSalary, currency),
    TOTAL_DEDUCTIONS: formatTemplateAmount(payslip.totalDeductions, currency),
    NET_SALARY: formatTemplateAmount(payslip.netSalary, currency),
    PAYE: formatTemplateAmount(payslip.payeDeduction, currency),
    NSSF: formatTemplateAmount(payslip.nssfDeduction, currency),
    NHIF: formatTemplateAmount(payslip.nhifDeduction, currency),
    LOAN_DEDUCTION: formatTemplateAmount(payslip.loanDeduction, currency),
    OTHER_DEDUCTIONS: formatTemplateAmount(payslip.otherDeductions, currency),
    company_name: company.name,
    employee_name: employeeName,
    employee_number: employee?.employeeNumber || payslip.employeeId,
    pay_period: formatTemplateDate(payslip.payMonth),
    pay_date: formatTemplateDate(payslip.payMonth),
    basic_salary: formatTemplateAmount(payslip.basicSalary, currency),
    allowances: formatTemplateAmount(payslip.allowances, currency),
    bonuses: formatTemplateAmount(payslip.bonuses, currency),
    gross_salary: formatTemplateAmount(payslip.grossSalary, currency),
    total_deductions: formatTemplateAmount(payslip.totalDeductions, currency),
    net_salary: formatTemplateAmount(payslip.netSalary, currency),
  };

  return { html: bindDataToTemplate(templateHtml, data), title: `${payslip.payslipNumber} - Payslip` };
}

export async function renderWarrantyTemplate(warrantyId: string, organizationId?: string | null, templateId?: string): Promise<RenderResult | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.select().from(warranties).where(eq(warranties.id, warrantyId)).limit(1);
  const warranty = rows[0];
  if (!warranty) return null;

  const company = await fetchCompanyInfo(db);
  const templateHtml = await getTemplateContent('warranty', organizationId, templateId);
  if (!templateHtml) return null;

  const data = {
    COMPANY_NAME: company.name,
    COMPANY_ADDRESS: company.address,
    COMPANY_EMAIL: company.email,
    COMPANY_PHONE: company.phone,
    COMPANY_LOGO: company.logo,
    WARRANTY_NUMBER: warranty.serialNumber || warranty.id,
    PURCHASE_DATE: formatTemplateDate(warranty.createdAt),
    EXPIRY_DATE: warranty.expiryDate,
    PRODUCT: warranty.product,
    VENDOR: warranty.vendor,
    SERIAL_NUMBER: warranty.serialNumber || '',
    COVERAGE: warranty.coverage,
    CLAIM_TERMS: warranty.claimTerms || '',
    STATUS: warranty.status,
    NOTES: warranty.notes || '',
    company_name: company.name,
    warranty_number: warranty.serialNumber || warranty.id,
    purchase_date: formatTemplateDate(warranty.createdAt),
    expiry_date: warranty.expiryDate,
    product: warranty.product,
    vendor: warranty.vendor,
    serial_number: warranty.serialNumber || '',
    coverage: warranty.coverage,
    claim_terms: warranty.claimTerms || '',
    status: warranty.status,
    notes: warranty.notes || '',
  };

  return { html: bindDataToTemplate(templateHtml, data), title: `${warranty.serialNumber || warranty.id} - Warranty` };
}

async function renderGenericTemplate(documentType: string, documentId: string, organizationId?: string | null, templateId?: string): Promise<RenderResult | null> {
  const db = await getDb();
  if (!db) return null;
  const company = await fetchCompanyInfo(db);
  const templateHtml = await getTemplateContent(documentType, organizationId, templateId);
  if (!templateHtml) return null;

  const data = {
    COMPANY_NAME: company.name,
    COMPANY_ADDRESS: company.address,
    COMPANY_EMAIL: company.email,
    COMPANY_PHONE: company.phone,
    COMPANY_WEBSITE: company.website,
    COMPANY_LOGO: company.logo,
    DOCUMENT_NUMBER: documentId,
    DOCUMENT_DATE: formatTemplateDate(new Date()),
    document_number: documentId,
    document_date: formatTemplateDate(new Date()),
    company_name: company.name,
    company_address: company.address,
    company_email: company.email,
    company_phone: company.phone,
    company_logo: company.logo,
    todays_date: formatTemplateDate(new Date()),
  };

  return { html: bindDataToTemplate(templateHtml, data), title: `${documentId} - ${documentType}` };
}

function formatTemplateDate(value: unknown): string {
  if (!value) return '';
  try { return new Date(String(value)).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return String(value); }
}

function formatTemplateAmount(value: unknown, currency: string): string {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : 'KES';
  return formatMinorCurrencyAmount(Number(value) || 0, code, { symbol: currency });
}

/**
 * Generic document template renderer - routes to specific renderers
 */
export async function renderDocumentTemplate(
  documentType: string,
  documentId: string,
  organizationId?: string | null,
  templateId?: string
): Promise<RenderResult | null> {
  switch (documentType) {
    case 'invoice':
      return renderInvoiceTemplate(documentId, organizationId, templateId);
    case 'receipt':
      return renderReceiptTemplate(documentId, organizationId, templateId);
    case 'estimate':
      return renderEstimateTemplate(documentId, organizationId, templateId);
    case 'contract':
      return renderContractTemplate(documentId, organizationId, templateId);
    case 'proposal':
      return renderProposalTemplate(documentId, organizationId, templateId);
    case 'payslip':
      return renderPayslipTemplate(documentId, organizationId, templateId);
    case 'warranty':
      return renderWarrantyTemplate(documentId, organizationId, templateId);
    default:
      return renderGenericTemplate(documentType, documentId, organizationId, templateId);
  }
}
