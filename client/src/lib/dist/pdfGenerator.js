"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.generateDebitNotePDF = exports.generateQuotationPDF = exports.generateReceiptPDF = exports.generateInvoicePDF = exports.downloadPDF = exports.setCompanyInfo = void 0;
var jspdf_1 = require("jspdf");
var html2canvas_1 = require("html2canvas");
// Store company info
var companyInfoData = {
    name: 'Your Company',
    phone: '',
    email: '',
    address: ''
};
function setCompanyInfo(info) {
    companyInfoData = __assign(__assign({}, companyInfoData), info);
}
exports.setCompanyInfo = setCompanyInfo;
// HTML Template for Invoices
var INVOICE_TEMPLATE = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Invoice</title>\n    <style>\n        @media print {\n            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }\n            body { margin: 0; padding: 0; }\n            .document-container { max-width: 100%; padding: 0; margin: 0; }\n        }\n\n        @page {\n            margin: 40px;\n            size: A4;\n        }\n\n        * {\n            box-sizing: border-box;\n        }\n\n        body {\n            margin: 0;\n            padding: 0;\n            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n            color: #2d3436;\n            line-height: 1.6;\n            background: #fff;\n        }\n\n        .document-container {\n            max-width: 900px;\n            margin: 0 auto;\n            padding: 32px;\n            background: white;\n        }\n\n        .header {\n            display: flex;\n            justify-content: space-between;\n            align-items: flex-start;\n            margin-bottom: 24px;\n            padding-bottom: 24px;\n            border-bottom: 2px solid #dfe6e9;\n        }\n\n        .company-info h1 {\n            font-size: 24px;\n            font-weight: 700;\n            color: #2d3436;\n            margin: 0 0 8px 0;\n        }\n\n        .company-tagline {\n            font-size: 14px;\n            color: #ff9f43;\n            font-style: italic;\n            margin: 0;\n        }\n\n        .company-details {\n            font-size: 12px;\n            color: #636e72;\n            margin-top: 8px;\n            line-height: 1.5;\n        }\n\n        .logo-container {\n            width: 120px;\n            height: 100px;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            background: #f8f9fa;\n            border-radius: 8px;\n        }\n\n        .company-logo {\n            max-width: 100%;\n            max-height: 100%;\n            object-fit: contain;\n        }\n\n        .document-title {\n            font-size: 32px;\n            font-weight: 700;\n            color: #2d3436;\n            margin: 16px 0;\n        }\n\n        .document-info {\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 24px;\n            margin: 24px 0;\n        }\n\n        .info-section {\n            background: #f8f9fa;\n            border-left: 4px solid #ff9f43;\n            padding: 16px;\n            border-radius: 4px;\n        }\n\n        .info-section-title {\n            font-weight: 700;\n            font-size: 15px;\n            color: #2d3436;\n            margin-bottom: 12px;\n            padding-bottom: 8px;\n            border-bottom: 1px solid #dfe6e9;\n        }\n\n        .info-details {\n            font-size: 14px;\n            color: #636e72;\n        }\n\n        .info-details div {\n            margin: 6px 0;\n        }\n\n        .info-label {\n            font-weight: 600;\n            color: #2d3436;\n        }\n\n        .section-title {\n            font-size: 16px;\n            font-weight: 700;\n            color: #2d3436;\n            margin: 24px 0 16px 0;\n            padding-bottom: 8px;\n            border-bottom: 2px solid #ff9f43;\n            text-transform: uppercase;\n        }\n\n        .items-table {\n            width: 100%;\n            border-collapse: collapse;\n            margin: 16px 0;\n            font-size: 14px;\n        }\n\n        .items-table th {\n            background: #f8f9fa;\n            color: #2d3436;\n            padding: 12px;\n            text-align: left;\n            font-weight: 700;\n            border-bottom: 2px solid #ff9f43;\n            text-transform: uppercase;\n            font-size: 12px;\n        }\n\n        .items-table th:nth-child(2),\n        .items-table th:nth-child(3),\n        .items-table th:nth-child(4) {\n            text-align: center;\n        }\n\n        .items-table th:last-child {\n            text-align: right;\n        }\n\n        .items-table td {\n            padding: 12px;\n            border-bottom: 1px solid #dfe6e9;\n        }\n\n        .items-table td:nth-child(2),\n        .items-table td:nth-child(3) {\n            text-align: center;\n        }\n\n        .items-table td:nth-child(4) {\n            text-align: right;\n        }\n\n        .items-table tbody tr:last-child td {\n            border-bottom: 2px solid #ff9f43;\n        }\n\n        .totals-container {\n            display: flex;\n            justify-content: flex-end;\n            margin: 24px 0;\n        }\n\n        .totals-table {\n            width: 300px;\n        }\n\n        .totals-table table {\n            width: 100%;\n            border-collapse: collapse;\n            font-size: 14px;\n        }\n\n        .totals-table tr {\n            border-bottom: 1px solid #ddd;\n        }\n\n        .totals-table td {\n            padding: 8px;\n            text-align: left;\n        }\n\n        .totals-table td:last-child {\n            text-align: right;\n        }\n\n        .totals-table tr.total-row {\n            border-bottom: 2px solid #ff9f43;\n            background-color: #f5f5f5;\n        }\n\n        .totals-table .total-row td {\n            font-weight: bold;\n        }\n\n        .terms {\n            margin: 24px 0;\n            font-size: 13px;\n            color: #636e72;\n            line-height: 1.6;\n        }\n\n        .terms-list {\n            margin: 16px 0 0 20px;\n            padding-left: 20px;\n        }\n\n        .terms-list li {\n            margin: 4px 0;\n        }\n\n        .footer {\n            margin-top: 32px;\n            padding-top: 24px;\n            border-top: 2px solid #dfe6e9;\n            font-size: 12px;\n            color: #636e72;\n        }\n\n        .footer-content {\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 32px;\n            margin-bottom: 16px;\n        }\n\n        .footer-section {\n            font-size: 12px;\n        }\n\n        .footer-section strong {\n            display: block;\n            font-weight: 600;\n            color: #2d3436;\n            margin-bottom: 4px;\n        }\n\n        .footer-note {\n            text-align: center;\n            padding-top: 16px;\n            border-top: 1px solid #dfe6e9;\n            font-size: 11px;\n            color: #636e72;\n            font-style: italic;\n        }\n    </style>\n</head>\n<body>\n    <div class=\"document-container\">\n        <!-- HEADER WITH BRANDING -->\n        <div class=\"header\">\n            <div class=\"company-info\">\n                <h1>{{companyName}}</h1>\n                {{#companyTagline}}<p class=\"company-tagline\">{{companyTagline}}</p>{{/companyTagline}}\n                <div class=\"company-details\">\n                    <div>{{companyPhone}}</div>\n                    <div>{{companyEmail}}</div>\n                    <div>{{companyAddress}}</div>\n                </div>\n            </div>\n            {{#companyLogo}}\n            <div class=\"logo-container\">\n                <img src=\"{{companyLogo}}\" alt=\"Company Logo\" class=\"company-logo\" onerror=\"this.style.display='none'\">\n            </div>\n            {{/companyLogo}}\n        </div>\n\n        <!-- DOCUMENT TITLE -->\n        <h1 class=\"document-title\">INVOICE</h1>\n\n        <!-- DOCUMENT INFO -->\n        <div class=\"document-info\">\n            <div class=\"info-section\">\n                <div class=\"info-section-title\">Invoice Details</div>\n                <div class=\"info-details\">\n                    <div><span class=\"info-label\">Invoice #:</span> {{invoiceNumber}}</div>\n                    <div><span class=\"info-label\">Date Issued:</span> {{date}}</div>\n                    <div><span class=\"info-label\">Due Date:</span> {{dueDate}}</div>\n                </div>\n            </div>\n            <div class=\"info-section\">\n                <div class=\"info-section-title\">Bill To / Customer</div>\n                <div class=\"info-details\">\n                    <div><span class=\"info-label\">Name:</span> {{clientName}}</div>\n                    {{#clientCompany}}<div><span class=\"info-label\">Company:</span> {{clientCompany}}</div>{{/clientCompany}}\n                    <div><span class=\"info-label\">Email:</span> {{clientEmail}}</div>\n                    {{#clientPhone}}<div><span class=\"info-label\">Phone:</span> {{clientPhone}}</div>{{/clientPhone}}\n                    {{#clientAddress}}<div><span class=\"info-label\">Address:</span> {{clientAddress}}</div>{{/clientAddress}}\n                    {{#clientKraPin}}<div><span class=\"info-label\">KRA PIN:</span> {{clientKraPin}}</div>{{/clientKraPin}}\n                </div>\n            </div>\n        </div>\n\n        <!-- LINE ITEMS -->\n        <div class=\"line-items\">\n            <h2 class=\"section-title\">Line Items</h2>\n            <table class=\"items-table\">\n                <thead>\n                    <tr>\n                        <th>Description</th>\n                        <th>Qty</th>\n                        <th>Unit Price</th>\n                        <th>Amount</th>\n                    </tr>\n                </thead>\n                <tbody>\n                    {{#items}}\n                    <tr>\n                        <td>{{description}}</td>\n                        <td>{{quantity}}</td>\n                        <td>KES {{rateFormatted}}</td>\n                        <td>KES {{amountFormatted}}</td>\n                    </tr>\n                    {{/items}}\n                </tbody>\n            </table>\n        </div>\n\n        <!-- TOTALS -->\n        <div class=\"totals-container\">\n            <div class=\"totals-table\">\n                <table>\n                    <tr>\n                        <td><strong>Subtotal:</strong></td>\n                        <td>KES {{subtotalFormatted}}</td>\n                    </tr>\n                    {{#tax}}\n                    <tr>\n                        <td><strong>VAT ({{taxRate}}%):</strong></td>\n                        <td>KES {{taxFormatted}}</td>\n                    </tr>\n                    {{/tax}}\n                    <tr class=\"total-row\">\n                        <td><strong>Total Amount Due:</strong></td>\n                        <td>KES {{totalFormatted}}</td>\n                    </tr>\n                </table>\n            </div>\n        </div>\n\n        <!-- PAYMENT TERMS -->\n        {{#terms}}\n        <div class=\"terms\">\n            <h2 class=\"section-title\">Payment Terms & Conditions</h2>\n            <ol class=\"terms-list\">\n                <li><strong>Payment Terms:</strong> Payment due within 30 days from invoice date unless otherwise agreed.</li>\n                <li><strong>Late Payment Penalty:</strong> 1.5% interest per month charged on overdue amounts after 30 days.</li>\n                <li><strong>Payment Methods:</strong> Bank transfer, cheque, cash, or mobile payment (M-Pesa/Airtel Money).</li>\n                <li><strong>Currency:</strong> All amounts in Kenyan Shillings (KES).</li>\n                <li><strong>Tax Invoice:</strong> Valid tax invoice for VAT purposes where applicable.</li>\n            </ol>\n        </div>\n        {{/terms}}\n\n        <!-- FOOTER -->\n        <div class=\"footer\">\n            <div class=\"footer-content\">\n                <div class=\"footer-section\">\n                    <strong>{{companyName}}</strong>\n                    <div>{{companyAddress}}</div>\n                    <div>{{companyPhone}}</div>\n                </div>\n                <div class=\"footer-section\">\n                    <strong>Contact Us</strong>\n                    <div>{{companyEmail}}</div>\n                    {{#companyWebsite}}<div>{{companyWebsite}}</div>{{/companyWebsite}}\n                </div>\n            </div>\n            <div class=\"footer-note\">\n                For more information or queries, feel free to contact us at {{companyEmail}}\n            </div>\n        </div>\n    </div>\n</body>\n</html>";
// HTML Template for Receipts
var RECEIPT_TEMPLATE = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Receipt</title>\n    <style>\n        @media print {\n            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }\n            body { margin: 0; padding: 0; }\n        }\n\n        @page {\n            margin: 40px;\n            size: A4;\n        }\n\n        * { box-sizing: border-box; }\n        body {\n            margin: 0;\n            padding: 0;\n            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n            color: #2d3436;\n            background: #fff;\n        }\n\n        .document-container {\n            max-width: 600px;\n            margin: 0 auto;\n            padding: 32px;\n            background: white;\n            border: 2px solid #ff9f43;\n            border-radius: 8px;\n        }\n\n        .header {\n            text-align: center;\n            margin-bottom: 24px;\n            padding-bottom: 16px;\n            border-bottom: 2px solid #ff9f43;\n        }\n\n        .company-name {\n            font-size: 24px;\n            font-weight: 700;\n            color: #2d3436;\n            margin: 0 0 8px 0;\n        }\n\n        .receipt-title {\n            font-size: 28px;\n            font-weight: 700;\n            color: #ff9f43;\n            margin: 16px 0;\n        }\n\n        .receipt-details {\n            background: #f8f9fa;\n            padding: 20px;\n            border-radius: 6px;\n            margin: 20px 0;\n        }\n\n        .detail-row {\n            display: flex;\n            justify-content: space-between;\n            margin: 8px 0;\n            padding: 4px 0;\n            border-bottom: 1px solid #e9ecef;\n        }\n\n        .detail-row:last-child { border-bottom: none; }\n\n        .detail-label {\n            font-weight: 600;\n            color: #2d3436;\n        }\n\n        .detail-value {\n            color: #636e72;\n        }\n\n        .amount-highlight {\n            background: #ff9f43;\n            color: white;\n            padding: 16px;\n            border-radius: 6px;\n            text-align: center;\n            margin: 20px 0;\n        }\n\n        .amount-label {\n            font-size: 14px;\n            margin-bottom: 4px;\n            opacity: 0.9;\n        }\n\n        .amount-value {\n            font-size: 24px;\n            font-weight: 700;\n        }\n\n        .footer {\n            text-align: center;\n            margin-top: 24px;\n            padding-top: 16px;\n            border-top: 1px solid #dfe6e9;\n            font-size: 12px;\n            color: #636e72;\n        }\n    </style>\n</head>\n<body>\n    <div class=\"document-container\">\n        <div class=\"header\">\n            <h1 class=\"company-name\">{{companyName}}</h1>\n            <h2 class=\"receipt-title\">RECEIPT</h2>\n        </div>\n\n        <div class=\"receipt-details\">\n            <div class=\"detail-row\">\n                <span class=\"detail-label\">Receipt Number:</span>\n                <span class=\"detail-value\">{{receiptNumber}}</span>\n            </div>\n            <div class=\"detail-row\">\n                <span class=\"detail-label\">Date:</span>\n                <span class=\"detail-value\">{{date}}</span>\n            </div>\n            <div class=\"detail-row\">\n                <span class=\"detail-label\">Customer:</span>\n                <span class=\"detail-value\">{{clientName}}</span>\n            </div>\n            <div class=\"detail-row\">\n                <span class=\"detail-label\">Email:</span>\n                <span class=\"detail-value\">{{clientEmail}}</span>\n            </div>\n            {{#invoiceNumber}}\n            <div class=\"detail-row\">\n                <span class=\"detail-label\">Invoice Number:</span>\n                <span class=\"detail-value\">{{invoiceNumber}}</span>\n            </div>\n            {{/invoiceNumber}}\n            <div class=\"detail-row\">\n                <span class=\"detail-label\">Payment Method:</span>\n                <span class=\"detail-value\">{{paymentMethod}}</span>\n            </div>\n        </div>\n\n        <div class=\"amount-highlight\">\n            <div class=\"amount-label\">Amount Paid</div>\n            <div class=\"amount-value\">KES {{amountFormatted}}</div>\n        </div>\n\n        {{#notes}}\n        <div style=\"margin: 20px 0; padding: 16px; background: #f8f9fa; border-radius: 4px;\">\n            <strong style=\"color: #2d3436;\">Notes:</strong><br>\n            <span style=\"color: #636e72;\">{{notes}}</span>\n        </div>\n        {{/notes}}\n\n        <div class=\"footer\">\n            <div>Thank you for your business!</div>\n            <div style=\"margin-top: 8px;\">{{companyName}} | {{companyEmail}}</div>\n        </div>\n    </div>\n</body>\n</html>";
// HTML Template for Quotations
var QUOTATION_TEMPLATE = INVOICE_TEMPLATE.replace(/INVOICE/g, 'QUOTATION')
    .replace(/Invoice/g, 'Quotation')
    .replace(/Invoice Details/g, 'Quotation Details')
    .replace(/Bill To \/ Customer/g, 'Prepared For')
    .replace(/Invoice #:/g, 'Quotation #:');
// HTML Template for Debit Notes
var DEBIT_NOTE_TEMPLATE = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Debit Note</title>\n    <style>\n        @media print {\n            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }\n            body { margin: 0; padding: 0; }\n        }\n\n        @page {\n            margin: 40px;\n            size: A4;\n        }\n\n        * { box-sizing: border-box; }\n        body {\n            margin: 0;\n            padding: 0;\n            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n            color: #2d3436;\n            background: #fff;\n        }\n\n        .document-container {\n            max-width: 800px;\n            margin: 0 auto;\n            padding: 32px;\n            background: white;\n            border: 2px solid #e74c3c;\n            border-radius: 8px;\n        }\n\n        .header {\n            text-align: center;\n            margin-bottom: 24px;\n            padding-bottom: 16px;\n            border-bottom: 2px solid #e74c3c;\n        }\n\n        .company-name {\n            font-size: 24px;\n            font-weight: 700;\n            color: #2d3436;\n            margin: 0 0 8px 0;\n        }\n\n        .debit-note-title {\n            font-size: 28px;\n            font-weight: 700;\n            color: #e74c3c;\n            margin: 16px 0;\n        }\n\n        .debit-note-details {\n            background: #f8f9fa;\n            padding: 20px;\n            border-radius: 6px;\n            margin: 20px 0;\n            border-left: 4px solid #e74c3c;\n        }\n\n        .detail-row {\n            display: flex;\n            justify-content: space-between;\n            margin: 8px 0;\n            padding: 4px 0;\n        }\n\n        .detail-label {\n            font-weight: 600;\n            color: #2d3436;\n        }\n\n        .detail-value {\n            color: #636e72;\n        }\n\n        .reason-section {\n            background: #ffeaea;\n            border: 1px solid #f5c6cb;\n            border-radius: 6px;\n            padding: 16px;\n            margin: 20px 0;\n        }\n\n        .reason-title {\n            font-weight: 700;\n            color: #e74c3c;\n            margin-bottom: 8px;\n        }\n\n        .amount-highlight {\n            background: #e74c3c;\n            color: white;\n            padding: 20px;\n            border-radius: 6px;\n            text-align: center;\n            margin: 20px 0;\n        }\n\n        .amount-label {\n            font-size: 16px;\n            margin-bottom: 8px;\n            opacity: 0.9;\n        }\n\n        .amount-value {\n            font-size: 28px;\n            font-weight: 700;\n        }\n\n        .footer {\n            text-align: center;\n            margin-top: 24px;\n            padding-top: 16px;\n            border-top: 1px solid #dfe6e9;\n            font-size: 12px;\n            color: #636e72;\n        }\n    </style>\n</head>\n<body>\n    <div class=\"document-container\">\n        <div class=\"header\">\n            <h1 class=\"company-name\">{{companyName}}</h1>\n            <h2 class=\"debit-note-title\">DEBIT NOTE</h2>\n        </div>\n\n        <div class=\"debit-note-details\">\n            <div class=\"detail-row\">\n                <span class=\"detail-label\">Debit Note Number:</span>\n                <span class=\"detail-value\">{{debitNoteNumber}}</span>\n            </div>\n            <div class=\"detail-row\">\n                <span class=\"detail-label\">Date:</span>\n                <span class=\"detail-value\">{{date}}</span>\n            </div>\n            <div class=\"detail-row\">\n                <span class=\"detail-label\">Supplier:</span>\n                <span class=\"detail-value\">{{supplierName}}</span>\n            </div>\n            {{#supplierEmail}}\n            <div class=\"detail-row\">\n                <span class=\"detail-label\">Email:</span>\n                <span class=\"detail-value\">{{supplierEmail}}</span>\n            </div>\n            {{/supplierEmail}}\n            {{#supplierPhone}}\n            <div class=\"detail-row\">\n                <span class=\"detail-label\">Phone:</span>\n                <span class=\"detail-value\">{{supplierPhone}}</span>\n            </div>\n            {{/supplierPhone}}\n        </div>\n\n        <div class=\"reason-section\">\n            <div class=\"reason-title\">Reason for Debit Note:</div>\n            <div style=\"color: #636e72;\">{{reason}}</div>\n        </div>\n\n        <div class=\"amount-highlight\">\n            <div class=\"amount-label\">Debit Amount</div>\n            <div class=\"amount-value\">KES {{amountFormatted}}</div>\n        </div>\n\n        {{#notes}}\n        <div style=\"margin: 20px 0; padding: 16px; background: #f8f9fa; border-radius: 4px;\">\n            <strong style=\"color: #2d3436;\">Additional Notes:</strong><br>\n            <span style=\"color: #636e72;\">{{notes}}</span>\n        </div>\n        {{/notes}}\n\n        <div class=\"footer\">\n            <div>This debit note serves as official notification of the amount due.</div>\n            <div style=\"margin-top: 8px;\">{{companyName}} | {{companyEmail}}</div>\n        </div>\n    </div>\n</body>\n</html>";
// Simple template engine (basic replacement)
function interpolateTemplate(template, data) {
    var result = template;
    // Handle simple variables {{variable}}
    result = result.replace(/{{(\w+)}}/g, function (match, key) {
        return data[key] || '';
    });
    // Handle conditional blocks {{#variable}}...{{/variable}}
    result = result.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, function (match, key, content) {
        return data[key] ? content : '';
    });
    return result;
}
// Render HTML to PDF using html2canvas
function renderHTMLToPDF(htmlContent, filename) {
    return __awaiter(this, void 0, Promise, function () {
        var container, canvas, imgData, pdf, imgWidth, pageHeight, imgHeight, heightLeft, position, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    container = document.createElement('div');
                    container.innerHTML = htmlContent;
                    container.style.position = 'absolute';
                    container.style.left = '-9999px';
                    container.style.top = '-9999px';
                    container.style.width = '900px';
                    document.body.appendChild(container);
                    return [4 /*yield*/, html2canvas_1["default"](container, {
                            scale: 2,
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#ffffff',
                            width: 900,
                            height: container.scrollHeight
                        })];
                case 1:
                    canvas = _a.sent();
                    // Remove temporary container
                    document.body.removeChild(container);
                    imgData = canvas.toDataURL('image/png');
                    pdf = new jspdf_1["default"]({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });
                    imgWidth = 210;
                    pageHeight = 295;
                    imgHeight = (canvas.height * imgWidth) / canvas.width;
                    heightLeft = imgHeight;
                    position = 0;
                    // Add first page
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                    // Add additional pages if needed
                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }
                    // Download the PDF
                    downloadPDF(pdf, filename);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error rendering HTML to PDF:', error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Download PDF
function downloadPDF(doc, filename) {
    try {
        var pdfBlob = doc.output('blob');
        var url_1 = URL.createObjectURL(pdfBlob);
        var link = document.createElement('a');
        link.href = url_1;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function () { return URL.revokeObjectURL(url_1); }, 100);
    }
    catch (error) {
        console.error('PDF download error:', error);
        doc.save(filename);
    }
}
exports.downloadPDF = downloadPDF;
// Generate Invoice PDF
function generateInvoicePDF(data) {
    return __awaiter(this, void 0, Promise, function () {
        var templateData, htmlContent, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    templateData = {
                        companyName: companyInfoData.name,
                        companyTagline: companyInfoData.tagline,
                        companyPhone: companyInfoData.phone,
                        companyEmail: companyInfoData.email,
                        companyAddress: companyInfoData.address,
                        companyWebsite: companyInfoData.website,
                        companyLogo: companyInfoData.logo,
                        invoiceNumber: data.invoiceNumber,
                        date: data.date,
                        dueDate: data.dueDate,
                        clientName: data.client.name,
                        clientCompany: data.client.company,
                        clientEmail: data.client.email,
                        clientPhone: data.client.phone,
                        clientAddress: data.client.address,
                        clientKraPin: data.client.kraPin,
                        items: data.items.map(function (item) { return ({
                            description: item.description,
                            quantity: item.quantity,
                            rateFormatted: item.rate.toLocaleString(),
                            amountFormatted: item.amount.toLocaleString()
                        }); }),
                        subtotalFormatted: data.subtotal.toLocaleString(),
                        tax: data.tax,
                        taxRate: data.taxRate || 16,
                        taxFormatted: data.tax ? data.tax.toLocaleString() : '',
                        totalFormatted: data.total.toLocaleString(),
                        terms: data.terms
                    };
                    htmlContent = interpolateTemplate(INVOICE_TEMPLATE, templateData);
                    return [4 /*yield*/, renderHTMLToPDF(htmlContent, "Invoice-" + data.invoiceNumber + ".pdf")];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error generating invoice PDF:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.generateInvoicePDF = generateInvoicePDF;
// Generate Receipt PDF
function generateReceiptPDF(data) {
    return __awaiter(this, void 0, Promise, function () {
        var templateData, htmlContent, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    templateData = {
                        companyName: companyInfoData.name,
                        companyEmail: companyInfoData.email,
                        receiptNumber: data.receiptNumber,
                        date: data.date,
                        clientName: data.client.name,
                        clientEmail: data.client.email,
                        invoiceNumber: data.invoiceNumber,
                        paymentMethod: data.paymentMethod,
                        amountFormatted: data.amount.toLocaleString(),
                        notes: data.notes
                    };
                    htmlContent = interpolateTemplate(RECEIPT_TEMPLATE, templateData);
                    return [4 /*yield*/, renderHTMLToPDF(htmlContent, "Receipt-" + data.receiptNumber + ".pdf")];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error generating receipt PDF:', error_3);
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.generateReceiptPDF = generateReceiptPDF;
// Generate Quotation PDF
function generateQuotationPDF(data) {
    return __awaiter(this, void 0, Promise, function () {
        var templateData, htmlContent, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    templateData = {
                        companyName: companyInfoData.name,
                        companyTagline: companyInfoData.tagline,
                        companyPhone: companyInfoData.phone,
                        companyEmail: companyInfoData.email,
                        companyAddress: companyInfoData.address,
                        companyWebsite: companyInfoData.website,
                        companyLogo: companyInfoData.logo,
                        quotationNumber: data.quotationNumber,
                        date: data.date,
                        validUntil: data.validUntil,
                        clientName: data.client.name,
                        clientCompany: data.client.company,
                        clientEmail: data.client.email,
                        clientPhone: data.client.phone,
                        clientAddress: data.client.address,
                        clientKraPin: data.client.kraPin,
                        items: data.items.map(function (item) { return ({
                            description: item.description,
                            quantity: item.quantity,
                            rateFormatted: item.rate.toLocaleString(),
                            amountFormatted: item.amount.toLocaleString()
                        }); }),
                        subtotalFormatted: data.subtotal.toLocaleString(),
                        tax: data.tax,
                        taxRate: data.taxRate || 16,
                        taxFormatted: data.tax ? data.tax.toLocaleString() : '',
                        totalFormatted: data.total.toLocaleString(),
                        terms: data.terms
                    };
                    htmlContent = interpolateTemplate(QUOTATION_TEMPLATE, templateData);
                    return [4 /*yield*/, renderHTMLToPDF(htmlContent, "Quotation-" + data.quotationNumber + ".pdf")];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error generating quotation PDF:', error_4);
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.generateQuotationPDF = generateQuotationPDF;
// Generate Debit Note PDF
function generateDebitNotePDF(data) {
    return __awaiter(this, void 0, Promise, function () {
        var templateData, htmlContent, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    templateData = {
                        companyName: companyInfoData.name,
                        companyEmail: companyInfoData.email,
                        debitNoteNumber: data.debitNoteNumber,
                        date: data.date,
                        supplierName: data.supplier.name,
                        supplierEmail: data.supplier.email,
                        supplierPhone: data.supplier.phone,
                        reason: data.reason,
                        amountFormatted: data.amount.toLocaleString(),
                        notes: data.notes
                    };
                    htmlContent = interpolateTemplate(DEBIT_NOTE_TEMPLATE, templateData);
                    return [4 /*yield*/, renderHTMLToPDF(htmlContent, "DebitNote-" + data.debitNoteNumber + ".pdf")];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error generating debit note PDF:', error_5);
                    throw error_5;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.generateDebitNotePDF = generateDebitNotePDF;
