"use strict";
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
exports.__esModule = true;
exports.generateDocumentHTML = void 0;
function generateDocumentHTML(data) {
    var cur = data.currency || 'KES';
    // If a custom template was saved in Settings → use it with placeholder substitution
    if (data.customTemplateHtml) {
        var fmt_1 = function (n) { return (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
        var itemRowsHtml = (data.items || []).map(function (i) { return "<tr>\n      <td style=\"padding:10px;border-bottom:1px solid #e5e7eb;vertical-align:top;word-break:break-word;\">" + (i.description || '') + "</td>\n      <td style=\"padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;white-space:nowrap;\">" + (i.quantity || 0) + "</td>\n      <td style=\"padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;\">" + cur + " " + fmt_1(i.unitPrice) + "</td>\n      <td style=\"padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;\">" + cur + " " + fmt_1(i.total) + "</td>\n    </tr>"; }).join('');
        var itemsTableHtml = "\n      <table style=\"width:100%;border-collapse:collapse;margin:16px 0;font-size:0.9em;\">\n        <thead><tr style=\"background:#f3f4f6;\">\n          <th style=\"text-align:left;padding:10px;border-bottom:2px solid #d1d5db;\">Description</th>\n          <th style=\"text-align:right;padding:10px;border-bottom:2px solid #d1d5db;\">Qty</th>\n          <th style=\"text-align:right;padding:10px;border-bottom:2px solid #d1d5db;\">Rate</th>\n          <th style=\"text-align:right;padding:10px;border-bottom:2px solid #d1d5db;\">Total</th>\n        </tr></thead>\n        <tbody>" + itemRowsHtml + "</tbody>\n      </table>";
        var tokenValues = {
            company_name: data.companyName || '',
            company_email: data.companyEmail || '',
            company_phone: data.companyPhone || '',
            company_address: data.companyAddress || '',
            company_website: data.companyWebsite || '',
            company_logo: data.companyLogo || '',
            client_name: data.clientName || '',
            client_email: data.clientEmail || '',
            client_phone: data.clientPhone || '',
            client_address: data.clientAddress || '',
            customer_name: data.clientName || '',
            customer_email: data.clientEmail || '',
            customer_phone: data.clientPhone || '',
            customer_address: data.clientAddress || '',
            document_number: data.documentNumber || '',
            document_date: data.documentDate || '',
            due_date: data.dueDate || '',
            subtotal: cur + " " + fmt_1(data.subtotal),
            tax: cur + " " + fmt_1(data.tax),
            tax_amount: cur + " " + fmt_1(data.tax),
            total: cur + " " + fmt_1(data.total),
            currency: cur,
            items_table: itemsTableHtml,
            line_items: itemRowsHtml,
            payment_method: data.paymentMethod || '',
            reference_number: data.referenceNumber || '',
            notes: data.notes || '',
            terms: data.termsAndConditions || ''
        };
        var legacyVars = {
            'companyInfo.companyName': data.companyName || '',
            'companyInfo.companyTagline': '',
            'companyInfo.companyPhone': data.companyPhone || '',
            'companyInfo.companyEmail': data.companyEmail || '',
            'companyInfo.companyAddress': data.companyAddress || '',
            'companyInfo.companyWebsite': data.companyWebsite || '',
            'companyInfo.companyLogo': data.companyLogo || '',
            'invoice.invoiceNumber': data.documentNumber || '',
            'invoice.dateIssued': data.documentDate || '',
            'invoice.dueDate': data.dueDate || '',
            'invoice.taxRate': '',
            'invoice.subtotal': cur + " " + fmt_1(data.subtotal),
            'invoice.taxAmount': cur + " " + fmt_1(data.tax),
            'invoice.total': cur + " " + fmt_1(data.total),
            'estimate.estimateNumber': data.documentNumber || '',
            'estimate.dateIssued': data.documentDate || '',
            'estimate.dueDate': data.dueDate || '',
            'estimate.subtotal': cur + " " + fmt_1(data.subtotal),
            'estimate.taxAmount': cur + " " + fmt_1(data.tax),
            'estimate.total': cur + " " + fmt_1(data.total),
            'receipt.receiptNumber': data.documentNumber || '',
            'receipt.dateIssued': data.documentDate || '',
            'receipt.dueDate': data.dueDate || '',
            'receipt.taxRate': '',
            'receipt.subtotal': cur + " " + fmt_1(data.subtotal),
            'receipt.taxAmount': cur + " " + fmt_1(data.tax),
            'receipt.total': cur + " " + fmt_1(data.total),
            'customer.name': data.clientName || '',
            'customer.company': data.clientName || '',
            'customer.email': data.clientEmail || '',
            'customer.phone': data.clientPhone || '',
            'customer.address': data.clientAddress || '',
            'customer.kraPin': data.kraPIN || ''
        };
        var bracketTokens = {
            COMPANY_NAME: data.companyName || '',
            COMPANY_EMAIL: data.companyEmail || '',
            COMPANY_PHONE: data.companyPhone || '',
            COMPANY_ADDRESS: data.companyAddress || '',
            COMPANY_LOGO: data.companyLogo || '',
            COMPANY_PIN: data.kraPIN || '',
            CLIENT_NAME: data.clientName || '',
            CLIENT_EMAIL: data.clientEmail || '',
            CLIENT_ADDRESS: data.clientAddress || '',
            INVOICE_NUMBER: data.documentNumber || '',
            ESTIMATE_NUMBER: data.documentNumber || '',
            RECEIPT_NUMBER: data.documentNumber || '',
            ISSUE_DATE: data.documentDate || '',
            DUE_DATE: data.dueDate || '',
            TOTAL_AMOUNT: cur + " " + fmt_1(data.total),
            SUB_TOTAL: cur + " " + fmt_1(data.subtotal),
            TAX_AMOUNT: cur + " " + fmt_1(data.tax)
        };
        var body_1 = data.customTemplateHtml;
        Object.entries(tokenValues).forEach(function (_a) {
            var k = _a[0], v = _a[1];
            body_1 = body_1.split("{{" + k + "}}").join(v);
            body_1 = body_1.split("${" + k + "}").join(v);
            body_1 = body_1.split("${" + k.toUpperCase() + "}").join(v);
        });
        Object.entries(legacyVars).forEach(function (_a) {
            var k = _a[0], v = _a[1];
            body_1 = body_1.split("${" + k + "}").join(v);
            body_1 = body_1.split("{{" + k + "}}").join(v);
        });
        Object.entries(bracketTokens).forEach(function (_a) {
            var k = _a[0], v = _a[1];
            body_1 = body_1.split("[" + k + "]").join(v);
        });
        body_1 = body_1
            .replace(/\{\{items_table\}\}/g, itemsTableHtml)
            .replace(/\{\{line_items\}\}/g, itemRowsHtml)
            .replace(/\$\{items_table\}/g, itemsTableHtml)
            .replace(/\$\{line_items\}/g, itemRowsHtml)
            .replace(/\$\{itemsTable\}/g, itemsTableHtml)
            .replace(/\$\{invoice\.itemsTable\}/g, itemsTableHtml)
            .replace(/\$\{estimate\.itemsTable\}/g, itemsTableHtml)
            .replace(/\$\{receipt\.itemsTable\}/g, itemsTableHtml);
        if (/data-section=["']line-items["']/i.test(body_1) && !/\{\{line_items\}\}|\$\{line_items\}|\{\{items_table\}\}|\$\{items_table\}/i.test(body_1)) {
            body_1 = body_1.replace(/<tbody[^>]*>[\s\S]*?<\/tbody>/i, "<tbody>" + itemRowsHtml + "</tbody>");
        }
        var wrapped = /<html[\s>]/i.test(body_1)
            ? body_1
            : "<html><head><title>" + data.documentType.toUpperCase() + " " + data.documentNumber + "</title></head><body>" + body_1 + "</body></html>";
        var hasPageStyle = /@page\s*\{/i.test(wrapped);
        var printStyle = "\n      <style>\n        @page { size: A4; margin: 40px; }\n        * { box-sizing: border-box; }\n        body { margin: 0; padding: 0; background: #fff; }\n        .document-container { max-width: 900px; width: 100%; margin: 0 auto; overflow: hidden; }\n        table { width: 100%; border-collapse: collapse; table-layout: auto; }\n        th, td { word-break: break-word; overflow-wrap: anywhere; }\n        @media print {\n          * {\n            -webkit-print-color-adjust: exact !important;\n            print-color-adjust: exact !important;\n            color-adjust: exact !important;\n          }\n          .document-container { max-width: 100%; margin: 0; padding: 0; box-shadow: none; }\n          .no-print { display: none !important; }\n          .page-break { page-break-after: always; }\n          table, tr, td, th { page-break-inside: avoid; }\n          p, li, h1, h2, h3, h4, h5, h6 { orphans: 3; widows: 3; }\n        }\n      </style>";
        var docHtml = hasPageStyle
            ? wrapped
            : wrapped.replace(/<head>/i, "<head>" + printStyle);
        return docHtml + "<script>window.onload=()=>{setTimeout(()=>{window.print();},100)};</script>";
    }
    var logoHtml = data.companyLogo
        ? "<img src=\"" + data.companyLogo + "\" style=\"max-height: 80px; margin-bottom: 15px;\" />"
        : "<div style=\"font-size: 24px; font-weight: bold; margin-bottom: 15px;\">" + (data.companyName || data.documentType).toUpperCase() + "</div>";
    var documentTitle = data.documentType === 'invoice'
        ? 'INVOICE'
        : data.documentType === 'estimate'
            ? 'QUOTATION'
            : 'RECEIPT';
    // Terms come from settings – empty string if nothing configured
    var termsContent = data.termsAndConditions || '';
    var taxLabel = data.taxType === 'inclusive'
        ? 'Tax (Inclusive):'
        : 'Tax (Exclusive):';
    var termsAndConditionsHtml = (data.documentType !== 'receipt' && termsContent) ? "\n    <div style=\"margin-top: 30px; page-break-inside: avoid;\">\n      <div style=\"font-weight: bold; margin-bottom: 8px; font-size: 0.95em;\">Terms & Conditions</div>\n      <div style=\"font-size: 0.85em; color: #555; white-space: pre-wrap; background: #f9f9f9; padding: 12px; border-radius: 4px; border-left: 3px solid #ff9f43;\">\n        " + termsContent + "\n      </div>\n    </div>\n  " : '';
    // Payment info: prefer rich-text HTML from bank settings, fall back to structured fields
    var paymentInfoInnerHtml = '';
    if (data.bankDetailsHtml) {
        paymentInfoInnerHtml = "\n      <div style=\"border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; background: #f9f9f9; font-size: 0.85em; color: #555;\">\n        " + data.bankDetailsHtml + "\n      </div>";
    }
    else {
        var bankBlock = data.bankName ? "\n      <div style=\"border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; background: #f9f9f9;\">\n        <div style=\"font-weight: 600; font-size: 0.9em; margin-bottom: 6px;\">Bank Details</div>\n        <div style=\"font-size: 0.85em; color: #555;\">\n          Bank: " + data.bankName + "<br>\n          Branch: " + (data.bankBranch || 'N/A') + "<br>\n          Account: " + (data.bankAccount || 'N/A') + "<br>\n          Name: " + (data.bankAccountName || 'N/A') + "\n        </div>\n      </div>" : '';
        var mpesaBlock = data.mpesaPaybill ? "\n      <div style=\"border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; background: #f9f9f9;\">\n        <div style=\"font-weight: 600; font-size: 0.9em; margin-bottom: 6px;\">M-Pesa Payment</div>\n        <div style=\"font-size: 0.85em; color: #555;\">\n          Paybill: " + data.mpesaPaybill + "<br>\n          Account: " + (data.mpesaAccountNumber || 'N/A') + "\n        </div>\n      </div>" : '';
        paymentInfoInnerHtml = "<div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 15px;\">" + bankBlock + mpesaBlock + "</div>";
    }
    var paymentInfoHtml = paymentInfoInnerHtml ? "\n    <div style=\"margin-top: 30px; page-break-inside: avoid;\">\n      <div style=\"font-weight: bold; margin-bottom: 8px; font-size: 0.95em;\">Payment Information</div>\n      " + paymentInfoInnerHtml + "\n    </div>\n  " : '';
    var html = "\n    <html>\n      <head>\n        <title>" + documentTitle + " " + data.documentNumber + "</title>\n        <style>\n          * { margin: 0; padding: 0; box-sizing: border-box; }\n          body { \n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            padding: 40px;\n            color: #333;\n            background: #fff;\n          }\n          .document-container { max-width: 900px; margin: 0 auto; }\n          .header { \n            display: flex; \n            justify-content: space-between; \n            margin-bottom: 40px;\n            align-items: start;\n          }\n          .company-info { \n            max-width: 50%;\n            flex: 1;\n          }\n          .company-branding { margin-bottom: 15px; }\n          .company-phone, .company-email, .company-website, .company-address {\n            font-size: 0.85em;\n            color: #666;\n            margin: 3px 0;\n          }\n          .doc-details { \n            text-align: right;\n            flex: 1;\n          }\n          .document-title { \n            font-size: 24px; \n            font-weight: bold;\n            margin-bottom: 10px;\n          }\n          .doc-meta-row { \n            font-size: 0.9em;\n            margin: 5px 0;\n          }\n          .doc-meta-label {\n            font-weight: 600;\n            color: #555;\n          }\n          .bill-to-section {\n            margin-bottom: 30px;\n            padding-bottom: 20px;\n            border-bottom: 2px solid #e5e7eb;\n          }\n          .section-label { \n            font-weight: bold;\n            margin-bottom: 8px;\n            font-size: 0.9em;\n            color: #333;\n          }\n          .client-info {\n            font-size: 0.9em;\n            line-height: 1.6;\n            color: #555;\n          }\n          .client-info-item { margin: 3px 0; }\n          table { \n            width: 100%; \n            border-collapse: collapse; \n            margin: 20px 0;\n            font-size: 0.9em;\n          }\n          th { \n            background: #f3f4f6; \n            text-align: left; \n            padding: 12px; \n            font-weight: 600;\n            border-bottom: 2px solid #d1d5db;\n          }\n          td { \n            padding: 12px; \n            border-bottom: 1px solid #e5e7eb;\n          }\n          .text-right { text-align: right; }\n          .totals-section { \n            width: 350px; \n            margin-left: auto; \n            margin-top: 20px;\n          }\n          .total-row { \n            display: flex; \n            justify-content: space-between; \n            padding: 8px 0;\n            font-size: 0.9em;\n          }\n          .total-row span:last-child { text-align: right; }\n          .subtotal-row { color: #666; }\n          .tax-row { color: #666; }\n          .grand-total { \n            font-weight: bold; \n            font-size: 1.1em; \n            border-top: 2px solid #d1d5db; \n            border-bottom: 2px solid #d1d5db;\n            margin-top: 8px; \n            padding-top: 8px;\n            padding-bottom: 8px;\n            background: #f9f9f9;\n          }\n          .two-column-section { \n            display: grid; \n            grid-template-columns: 1fr 1fr; \n            gap: 20px; \n            margin: 20px 0;\n          }\n          .section-content { \n            font-size: 0.9em; \n            color: #555;\n            line-height: 1.6;\n          }\n          .footer {\n            margin-top: 40px;\n            padding-top: 20px;\n            border-top: 2px solid #e5e7eb;\n            text-align: center;\n            font-size: 0.85em;\n            color: #999;\n          }\n          .footer-contact { \n            display: flex;\n            justify-content: space-around;\n            margin-bottom: 10px;\n            font-size: 0.9em;\n          }\n          .footer-contact-block { flex: 1; }\n          .footer-contact-label { font-weight: 600; color: #333; }\n          .footer-contact-detail { color: #666; font-size: 0.9em; }\n          @media print { \n            body { padding: 20px; }\n            .no-print { display: none !important; }\n            .document-container { max-width: 100%; }\n          }\n        </style>\n      </head>\n      <body>\n        <div class=\"document-container\">\n          <!-- HEADER -->\n          <div class=\"header\">\n            <div class=\"company-info\">\n              <div class=\"company-branding\">\n                " + logoHtml + "\n              </div>\n              <div class=\"company-phone\">Phone: " + (data.companyPhone || '') + "</div>\n              <div class=\"company-email\">Email: " + (data.companyEmail || '') + "</div>\n              <div class=\"company-website\">Website: " + (data.companyWebsite || '') + "</div>\n              <div class=\"company-address\">Address: " + (data.companyAddress || '') + "</div>\n            </div>\n            <div class=\"doc-details\">\n              <div class=\"document-title\">" + documentTitle + "</div>\n              <div class=\"doc-meta-row\"><span class=\"doc-meta-label\">Number:</span> " + data.documentNumber + "</div>\n              <div class=\"doc-meta-row\"><span class=\"doc-meta-label\">Date:</span> " + data.documentDate + "</div>\n              " + (data.dueDate ? "<div class=\"doc-meta-row\"><span class=\"doc-meta-label\">Due Date:</span> " + data.dueDate + "</div>" : '') + "\n              " + (data.paymentMethod ? "<div class=\"doc-meta-row\"><span class=\"doc-meta-label\">Payment:</span> " + data.paymentMethod + "</div>" : '') + "\n              " + (data.referenceNumber ? "<div class=\"doc-meta-row\"><span class=\"doc-meta-label\">Reference:</span> " + data.referenceNumber + "</div>" : '') + "\n              " + (data.kraPIN ? "<div class=\"doc-meta-row\"><span class=\"doc-meta-label\">KRA PIN:</span> " + data.kraPIN + "</div>" : '') + "\n            </div>\n          </div>\n\n          <!-- BILL TO SECTION -->\n          <div class=\"bill-to-section\">\n            <div class=\"section-label\">Bill To</div>\n            <div class=\"client-info\">\n              <div class=\"client-info-item\"><strong>" + data.clientName + "</strong></div>\n              <div class=\"client-info-item\">" + data.clientPhone + "</div>\n              <div class=\"client-info-item\">" + data.clientEmail + "</div>\n              <div class=\"client-info-item\">" + data.clientAddress + "</div>\n            </div>\n          </div>\n\n          <!-- ITEMS TABLE -->\n          <table>\n            <thead>\n              <tr>\n                <th>Description</th>\n                <th class=\"text-right\">Qty</th>\n                <th class=\"text-right\">Rate</th>\n                <th class=\"text-right\">Total</th>\n              </tr>\n            </thead>\n            <tbody>\n              " + (Array.isArray(data.items) ? data.items.map(function (item) { return "\n                <tr>\n                  <td>" + (item.description || '') + "</td>\n                  <td class=\"text-right\">" + (item.quantity || 0) + "</td>\n                  <td class=\"text-right\">" + cur + " " + (item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td>\n                  <td class=\"text-right\">" + cur + " " + (item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td>\n                </tr>\n              "; }).join('') : '') + "\n            </tbody>\n          </table>\n\n          <!-- TOTALS -->\n          <div class=\"totals-section\">\n            <div class=\"total-row subtotal-row\">\n              <span>Subtotal:</span>\n              <span>" + cur + " " + (data.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</span>\n            </div>\n            <div class=\"total-row tax-row\">\n              <span>" + taxLabel + "</span>\n              <span>" + cur + " " + (data.tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</span>\n            </div>\n            <div class=\"total-row grand-total\">\n              <span>Total Due:</span>\n              <span>" + cur + " " + (data.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</span>\n            </div>\n          </div>\n\n          <!-- TWO COLUMN SECTION: TERMS & CONDITIONS + PAYMENT INFO (For non-receipts) -->\n          " + (data.documentType !== 'receipt' ? "\n          <div class=\"two-column-section\">\n            <div>\n              " + (termsContent ? "\n              <div style=\"margin-top: 30px; page-break-inside: avoid;\">\n                <div style=\"font-weight: bold; margin-bottom: 8px; font-size: 0.95em;\">Terms & Conditions</div>\n                <div style=\"font-size: 0.85em; color: #555; white-space: pre-wrap; background: #f9f9f9; padding: 12px; border-radius: 4px; border-left: 3px solid #ff9f43; min-height: 100px;\">\n                  " + termsContent + "\n                </div>\n              </div>\n              " : '') + "\n            </div>\n            <div>\n              " + paymentInfoHtml + "\n            </div>\n          </div>\n          " : "\n          <!-- PAYMENT INFO ONLY (For receipts) -->\n          <div style=\"margin-top: 30px;\">\n            " + paymentInfoHtml + "\n          </div>\n          ") + "\n\n          <!-- FOOTER -->\n          <div class=\"footer\">\n            <div class=\"footer-contact\">\n              <div class=\"footer-contact-block\">\n                <div class=\"footer-contact-label\">" + (data.companyName || '') + "</div>\n                <div class=\"footer-contact-detail\">" + (data.companyAddress || '') + "</div>\n              </div>\n              <div class=\"footer-contact-block\">\n                <div class=\"footer-contact-label\">Contact</div>\n                <div class=\"footer-contact-detail\">" + (data.companyEmail || '') + "</div>\n              </div>\n            </div>\n            <div style=\"font-size: 0.85em; margin-top: 10px;\">For queries, contact us at " + (data.companyEmail || '') + "</div>\n            " + (data.documentType === 'receipt' ? "\n            <div style=\"font-size: 0.85em; color: #666; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;\">\n              Inclusive of V.A.T where applicable<br>\n              Thank you for your business.\n            </div>\n            " : "\n            <div style=\"font-size: 0.85em; color: #666; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;\">\n              This is a system generated " + documentTitle + " and is digitally signed under " + (data.companyName || 'the issuing company') + ".\n            </div>\n            ") + "\n          </div>\n        </div>\n\n        <script>\n          window.onload = () => { \n            setTimeout(() => {\n              window.print();\n            }, 100);\n          };\n        </script>\n      </body>\n    </html>\n  ";
    return html;
}
exports.generateDocumentHTML = generateDocumentHTML;
