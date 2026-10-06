/**
 * Unified Document Template Generator
 * Generates professional invoice, estimate, and receipt templates with:
 * - Unified layout structure
 * - Terms & Conditions (left column)
 * - Payment Information (right column)
 * - Support for inclusive/exclusive tax rates
 *
 * All company/bank/payment info should come from Settings – no hardcoded fallbacks.
 */

export interface DocumentTemplateData {
  documentType: 'invoice' | 'estimate' | 'receipt';
  documentNumber: string;
  documentDate: string;
  dueDate?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  kraPIN?: string;
  companyName?: string;
  companyLogo?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyAddress?: string;
  clientName: string;
  clientCompanyName?: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  taxType?: 'inclusive' | 'exclusive'; // Tax rate type
  notes?: string;
  termsAndConditions?: string; // Editable T&C
  bankName?: string;
  bankBranch?: string;
  bankAccount?: string;
  bankAccountName?: string;
  mpesaPaybill?: string;
  mpesaAccountNumber?: string;
  currency?: string; // Currency symbol (default: KES)
  /** Raw HTML from the rich-text bank details setting (payment_bank.details) */
  bankDetailsHtml?: string;
  /** Custom HTML body from saved document template (overrides default layout) */
  customTemplateHtml?: string;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const money = (n: number) => (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function normalizeTokenKey(raw: string): string {
  return raw
    .trim()
    .replace(/^[{\[$\s]+|[}\]$\s]+$/g, "")
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .replace(/[\s\-.]+/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

function buildItemsHtml(data: DocumentTemplateData): { table: string; rows: string } {
  const cur = data.currency || "KES";
  const rows = (data.items || [])
    .map(
      (i) => `<tr>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${i.description || ""}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${i.quantity || 0}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${cur} ${money(i.unitPrice)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${cur} ${money(i.total)}</td>
        </tr>`
    )
    .join("");

  return {
    rows,
    table: `
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.9em;">
        <thead><tr style="background:#f3f4f6;">
          <th style="text-align:left;padding:10px;border-bottom:2px solid #d1d5db;">Description</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #d1d5db;">Qty</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #d1d5db;">Rate</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #d1d5db;">Total</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`,
  };
}

function buildTokenMap(data: DocumentTemplateData): Record<string, string> {
  const cur = data.currency || "KES";
  const { rows, table } = buildItemsHtml(data);
  const values: Record<string, string | number | undefined> = {
    company_name: data.companyName,
    company_email: data.companyEmail,
    company_phone: data.companyPhone,
    company_website: data.companyWebsite,
    company_address: data.companyAddress,
    client_name: data.clientName,
    client_company: data.clientCompanyName || data.clientName,
    client_company_name: data.clientCompanyName || data.clientName,
    clientCompany: data.clientCompanyName || data.clientName,
    clientCompanyName: data.clientCompanyName || data.clientName,
    client_email: data.clientEmail,
    client_phone: data.clientPhone,
    client_address: data.clientAddress,
    document_type: data.documentType,
    document_number: data.documentNumber,
    invoice_number: data.documentNumber,
    estimate_number: data.documentNumber,
    quotation_number: data.documentNumber,
    receipt_number: data.documentNumber,
    credit_note_number: data.documentNumber,
    debit_note_number: data.documentNumber,
    po_number: data.documentNumber,
    lpo_number: data.documentNumber,
    rfq_number: data.documentNumber,
    work_order_number: data.documentNumber,
    claim_number: data.documentNumber,
    service_invoice_number: data.documentNumber,
    document_date: data.documentDate,
    invoice_date: data.documentDate,
    estimate_date: data.documentDate,
    quotation_date: data.documentDate,
    receipt_date: data.documentDate,
    credit_note_date: data.documentDate,
    debit_note_date: data.documentDate,
    po_date: data.documentDate,
    lpo_date: data.documentDate,
    rfq_date: data.documentDate,
    work_order_date: data.documentDate,
    claim_date: data.documentDate,
    service_date: data.documentDate,
    todays_date: new Date().toISOString().split("T")[0],
    due_date: data.dueDate,
    expiry_date: data.dueDate,
    valid_until: data.dueDate,
    delivery_date: data.dueDate,
    deadline_date: data.dueDate,
    end_date: data.dueDate,
    issue_date: data.documentDate,
    payment_method: data.paymentMethod,
    reference_number: data.referenceNumber,
    kra_pin: data.kraPIN,
    subtotal: `${cur} ${money(data.subtotal)}`,
    sub_total: `${cur} ${money(data.subtotal)}`,
    tax: `${cur} ${money(data.tax)}`,
    tax_amount: `${cur} ${money(data.tax)}`,
    total: `${cur} ${money(data.total)}`,
    total_amount: `${cur} ${money(data.total)}`,
    raw_subtotal: String(data.subtotal || 0),
    raw_tax: String(data.tax || 0),
    raw_total: String(data.total || 0),
    currency: cur,
    notes: data.notes,
    terms_and_conditions: data.termsAndConditions,
    terms: data.termsAndConditions,
    bank_name: data.bankName,
    bank_branch: data.bankBranch,
    bank_account: data.bankAccount,
    bank_account_name: data.bankAccountName,
    mpesa_paybill: data.mpesaPaybill,
    mpesa_account_number: data.mpesaAccountNumber,
    items_table: table,
    line_items_table: table,
    items_rows: rows,
    line_items_rows: rows,
    items_html: table,
    line_items_html: table,
    companyinfo_companyname: data.companyName,
    companyinfo_companyemail: data.companyEmail,
    companyinfo_companyphone: data.companyPhone,
    companyinfo_companyaddress: data.companyAddress,
    company_logo: data.companyLogo,
    app_logo: data.companyLogo,
    companylogo: data.companyLogo,
    company_logo_url: data.companyLogo,
    companyinfo_logo: data.companyLogo,
    'company.logo': data.companyLogo,
    'company.logo_url': data.companyLogo,
    logo_url: data.companyLogo,
    logo: data.companyLogo,
  };

  const output: Record<string, string> = {};
  Object.entries(values).forEach(([key, value]) => {
    output[normalizeTokenKey(key)] = value == null ? "" : String(value);
  });
  return output;
}

export function renderSavedDocumentTemplate(templateHtml: string, data: DocumentTemplateData): string {
  const values = buildTokenMap(data);

  let rendered = templateHtml
    .replace(/\{\{\s*([^{}]+)\s*\}\}/g, (match, token) => values[normalizeTokenKey(token)] ?? "")
    .replace(/\$\{\s*([^{}]+)\s*\}/g, (match, token) => values[normalizeTokenKey(token)] ?? "")
    .replace(/\[\s*([^\[\]]+)\s*\]/g, (match, token) => values[normalizeTokenKey(token)] ?? match);

  Object.entries(values).forEach(([normalizedKey, value]) => {
    const upper = normalizedKey.toUpperCase();
    rendered = rendered.replace(new RegExp(`\\[${escapeRegExp(upper)}\\]`, "g"), value);
  });

  if (!/(items_table|line_items_table|items_rows|line_items_rows)/i.test(templateHtml)) {
    const rows = values.line_items_rows || "";
    rendered = rendered.replace(/<tbody[^>]*>\s*<\/tbody>/i, `<tbody>${rows}</tbody>`);
  }

  return rendered;
}

export function generateDocumentHTML(data: DocumentTemplateData): string {
  const cur = data.currency || 'KES';

  // If a custom template was saved in Settings → use it with placeholder substitution
  if (data.customTemplateHtml) {
    const body = renderSavedDocumentTemplate(data.customTemplateHtml, data);

    return `<html><head><title>${data.documentType.toUpperCase()} ${data.documentNumber}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:40px;color:#333;background:#fff}
      table{width:100%;border-collapse:collapse}th,td{padding:10px;border:1px solid #d1d5db}th{background:#f3f4f6;font-weight:600}
      @media print{body{padding:20px}.no-print{display:none!important}}</style></head>
      <body><div style="max-width:900px;margin:0 auto;">${body}</div>
      <script>window.onload=()=>{setTimeout(()=>{window.print();},100)};</script></body></html>`;
  }

  const logoHtml = data.companyLogo 
    ? `<img src="${data.companyLogo}" style="max-height: 80px; margin-bottom: 15px;" />` 
    : `<div style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">${(data.companyName || data.documentType).toUpperCase()}</div>`;

  const documentTitle = data.documentType === 'invoice' 
    ? 'INVOICE'
    : data.documentType === 'estimate'
    ? 'QUOTATION'
    : 'RECEIPT';

  // Terms come from settings – empty string if nothing configured
  const termsContent = data.termsAndConditions || '';

  const taxLabel = data.taxType === 'inclusive' 
    ? 'Tax (Inclusive):'
    : 'Tax (Exclusive):';

  const termsAndConditionsHtml = (data.documentType !== 'receipt' && termsContent) ? `
    <div style="margin-top: 30px; page-break-inside: avoid;">
      <div style="font-weight: bold; margin-bottom: 8px; font-size: 0.95em;">Terms & Conditions</div>
      <div style="font-size: 0.85em; color: #555; white-space: pre-wrap; background: #f9f9f9; padding: 12px; border-radius: 4px; border-left: 3px solid #ff9f43;">
        ${termsContent}
      </div>
    </div>
  ` : '';

  // Payment info: prefer rich-text HTML from bank settings, fall back to structured fields
  let paymentInfoInnerHtml = '';
  if (data.bankDetailsHtml) {
    paymentInfoInnerHtml = `
      <div style="border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; background: #f9f9f9; font-size: 0.85em; color: #555;">
        ${data.bankDetailsHtml}
      </div>`;
  } else {
    const bankBlock = data.bankName ? `
      <div style="border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; background: #f9f9f9;">
        <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 6px;">Bank Details</div>
        <div style="font-size: 0.85em; color: #555;">
          Bank: ${data.bankName}<br>
          Branch: ${data.bankBranch || 'N/A'}<br>
          Account: ${data.bankAccount || 'N/A'}<br>
          Name: ${data.bankAccountName || 'N/A'}
        </div>
      </div>` : '';
    const mpesaBlock = data.mpesaPaybill ? `
      <div style="border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; background: #f9f9f9;">
        <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 6px;">M-Pesa Payment</div>
        <div style="font-size: 0.85em; color: #555;">
          Paybill: ${data.mpesaPaybill}<br>
          Account: ${data.mpesaAccountNumber || 'N/A'}
        </div>
      </div>` : '';
    paymentInfoInnerHtml = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">${bankBlock}${mpesaBlock}</div>`;
  }

  const paymentInfoHtml = paymentInfoInnerHtml ? `
    <div style="margin-top: 30px; page-break-inside: avoid;">
      <div style="font-weight: bold; margin-bottom: 8px; font-size: 0.95em;">Payment Information</div>
      ${paymentInfoInnerHtml}
    </div>
  ` : '';

  const html = `
    <html>
      <head>
        <title>${documentTitle} ${data.documentNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #333;
            background: #fff;
          }
          .document-container { max-width: 900px; margin: 0 auto; }
          .header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 40px;
            align-items: start;
          }
          .company-info { 
            max-width: 50%;
            flex: 1;
          }
          .company-branding { margin-bottom: 15px; }
          .company-phone, .company-email, .company-website, .company-address {
            font-size: 0.85em;
            color: #666;
            margin: 3px 0;
          }
          .doc-details { 
            text-align: right;
            flex: 1;
          }
          .document-title { 
            font-size: 24px; 
            font-weight: bold;
            margin-bottom: 10px;
          }
          .doc-meta-row { 
            font-size: 0.9em;
            margin: 5px 0;
          }
          .doc-meta-label {
            font-weight: 600;
            color: #555;
          }
          .bill-to-section {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          .section-label { 
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 0.9em;
            color: #333;
          }
          .client-info {
            font-size: 0.9em;
            line-height: 1.6;
            color: #555;
          }
          .client-info-item { margin: 3px 0; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            font-size: 0.9em;
          }
          th { 
            background: #f3f4f6; 
            text-align: left; 
            padding: 12px; 
            font-weight: 600;
            border-bottom: 2px solid #d1d5db;
          }
          td { 
            padding: 12px; 
            border-bottom: 1px solid #e5e7eb;
          }
          .text-right { text-align: right; }
          .totals-section { 
            width: 350px; 
            margin-left: auto; 
            margin-top: 20px;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0;
            font-size: 0.9em;
          }
          .total-row span:last-child { text-align: right; }
          .subtotal-row { color: #666; }
          .tax-row { color: #666; }
          .grand-total { 
            font-weight: bold; 
            font-size: 1.1em; 
            border-top: 2px solid #d1d5db; 
            border-bottom: 2px solid #d1d5db;
            margin-top: 8px; 
            padding-top: 8px;
            padding-bottom: 8px;
            background: #f9f9f9;
          }
          .two-column-section { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin: 20px 0;
          }
          .section-content { 
            font-size: 0.9em; 
            color: #555;
            line-height: 1.6;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 0.85em;
            color: #999;
          }
          .footer-contact { 
            display: flex;
            justify-content: space-around;
            margin-bottom: 10px;
            font-size: 0.9em;
          }
          .footer-contact-block { flex: 1; }
          .footer-contact-label { font-weight: 600; color: #333; }
          .footer-contact-detail { color: #666; font-size: 0.9em; }
          @media print { 
            body { padding: 20px; }
            .no-print { display: none !important; }
            .document-container { max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="document-container">
          <!-- HEADER -->
          <div class="header">
            <div class="company-info">
              <div class="company-branding">
                ${logoHtml}
              </div>
              <div class="company-phone">Phone: ${data.companyPhone || ''}</div>
              <div class="company-email">Email: ${data.companyEmail || ''}</div>
              <div class="company-website">Website: ${data.companyWebsite || ''}</div>
              <div class="company-address">Address: ${data.companyAddress || ''}</div>
            </div>
            <div class="doc-details">
              <div class="document-title">${documentTitle}</div>
              <div class="doc-meta-row"><span class="doc-meta-label">Number:</span> ${data.documentNumber}</div>
              <div class="doc-meta-row"><span class="doc-meta-label">Date:</span> ${data.documentDate}</div>
              ${data.dueDate ? `<div class="doc-meta-row"><span class="doc-meta-label">Due Date:</span> ${data.dueDate}</div>` : ''}
              ${data.paymentMethod ? `<div class="doc-meta-row"><span class="doc-meta-label">Payment:</span> ${data.paymentMethod}</div>` : ''}
              ${data.referenceNumber ? `<div class="doc-meta-row"><span class="doc-meta-label">Reference:</span> ${data.referenceNumber}</div>` : ''}
              ${data.kraPIN ? `<div class="doc-meta-row"><span class="doc-meta-label">KRA PIN:</span> ${data.kraPIN}</div>` : ''}
            </div>
          </div>

          <!-- BILL TO SECTION -->
          <div class="bill-to-section">
            <div class="section-label">Bill To</div>
            <div class="client-info">
              <div class="client-info-item"><strong>${data.clientName}</strong></div>
              <div class="client-info-item">${data.clientPhone}</div>
              <div class="client-info-item">${data.clientEmail}</div>
              <div class="client-info-item">${data.clientAddress}</div>
            </div>
          </div>

          <!-- ITEMS TABLE -->
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${Array.isArray(data.items) ? data.items.map((item: any) => `
                <tr>
                  <td>${item.description || ''}</td>
                  <td class="text-right">${item.quantity || 0}</td>
                  <td class="text-right">${cur} ${(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td class="text-right">${cur} ${(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>

          <!-- TOTALS -->
          <div class="totals-section">
            <div class="total-row subtotal-row">
              <span>Subtotal:</span>
              <span>${cur} ${(data.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="total-row tax-row">
              <span>${taxLabel}</span>
              <span>${cur} ${(data.tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total Due:</span>
              <span>${cur} ${(data.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <!-- TWO COLUMN SECTION: TERMS & CONDITIONS + PAYMENT INFO (For non-receipts) -->
          ${data.documentType !== 'receipt' ? `
          <div class="two-column-section">
            <div>
              ${termsContent ? `
              <div style="margin-top: 30px; page-break-inside: avoid;">
                <div style="font-weight: bold; margin-bottom: 8px; font-size: 0.95em;">Terms & Conditions</div>
                <div style="font-size: 0.85em; color: #555; white-space: pre-wrap; background: #f9f9f9; padding: 12px; border-radius: 4px; border-left: 3px solid #ff9f43; min-height: 100px;">
                  ${termsContent}
                </div>
              </div>
              ` : ''}
            </div>
            <div>
              ${paymentInfoHtml}
            </div>
          </div>
          ` : `
          <!-- PAYMENT INFO ONLY (For receipts) -->
          <div style="margin-top: 30px;">
            ${paymentInfoHtml}
          </div>
          `}

          <!-- FOOTER -->
          <div class="footer">
            <div class="footer-contact">
              <div class="footer-contact-block">
                <div class="footer-contact-label">${data.companyName || ''}</div>
                <div class="footer-contact-detail">${data.companyAddress || ''}</div>
              </div>
              <div class="footer-contact-block">
                <div class="footer-contact-label">Contact</div>
                <div class="footer-contact-detail">${data.companyEmail || ''}</div>
              </div>
            </div>
            <div style="font-size: 0.85em; margin-top: 10px;">For queries, contact us at ${data.companyEmail || ''}</div>
            ${data.documentType === 'receipt' ? `
            <div style="font-size: 0.85em; color: #666; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              Inclusive of V.A.T where applicable<br>
              Thank you for your business.
            </div>
            ` : `
            <div style="font-size: 0.85em; color: #666; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              This is a system generated ${documentTitle} and is digitally signed under ${data.companyName || 'the issuing company'}.
            </div>
            `}
          </div>
        </div>

        <script>
          window.onload = () => { 
            setTimeout(() => {
              window.print();
            }, 100);
          };
        </script>
      </body>
    </html>
  `;

  return html;
}
