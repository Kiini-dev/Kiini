"use strict";
/**
 * Template-based PDF/HTML renderer for documents
 * Fetches the default (or specified) document template from documentTemplates table,
 * binds actual DB data, and returns rendered HTML for PDF/print rendering.
 */
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
exports.renderDocumentTemplate = exports.renderEstimateTemplate = exports.renderReceiptTemplate = exports.renderInvoiceTemplate = void 0;
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var fs = require("fs");
var path = require("path");
// Map document type to template type name in documentTemplates table
var TYPE_MAP = {
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
    asset: 'asset'
};
// Map document type to fallback HTML template file
var TEMPLATE_FILE_MAP = {
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
    asset: 'assets-template.html'
};
/**
 * Get template HTML content: from DB (default template) or fallback to file system
 */
function getTemplateContent(documentType, organizationId, templateId) {
    return __awaiter(this, void 0, Promise, function () {
        var pool, type, rows_1, _a, arr_1, rows_2, arr_2, rows, arr, first, _b, firstArr, templateFile, filePath;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    pool = db_1.getPool();
                    if (!pool)
                        return [2 /*return*/, null];
                    type = TYPE_MAP[documentType] || documentType;
                    if (!templateId) return [3 /*break*/, 5];
                    if (!organizationId) return [3 /*break*/, 2];
                    return [4 /*yield*/, pool.query("SELECT content FROM documentTemplates WHERE id = ? AND organizationId = ?", [templateId, organizationId])];
                case 1:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, pool.query("SELECT content FROM documentTemplates WHERE id = ?", [templateId])];
                case 3:
                    _a = _c.sent();
                    _c.label = 4;
                case 4:
                    rows_1 = (_a)[0];
                    arr_1 = rows_1;
                    if (arr_1.length)
                        return [2 /*return*/, arr_1[0].content];
                    _c.label = 5;
                case 5:
                    if (!organizationId) return [3 /*break*/, 7];
                    return [4 /*yield*/, pool.query("SELECT content FROM documentTemplates WHERE type = ? AND organizationId = ? AND isDefault = 1 LIMIT 1", [type, organizationId])];
                case 6:
                    rows_2 = (_c.sent())[0];
                    arr_2 = rows_2;
                    if (arr_2.length)
                        return [2 /*return*/, arr_2[0].content];
                    _c.label = 7;
                case 7: return [4 /*yield*/, pool.query("SELECT content FROM documentTemplates WHERE type = ? AND isDefault = 1 LIMIT 1", [type])];
                case 8:
                    rows = (_c.sent())[0];
                    arr = rows;
                    if (arr.length)
                        return [2 /*return*/, arr[0].content];
                    if (!organizationId) return [3 /*break*/, 10];
                    return [4 /*yield*/, pool.query("SELECT content FROM documentTemplates WHERE type = ? AND organizationId = ? ORDER BY createdAt ASC LIMIT 1", [type, organizationId])];
                case 9:
                    _b = _c.sent();
                    return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, pool.query("SELECT content FROM documentTemplates WHERE type = ? ORDER BY createdAt ASC LIMIT 1", [type])];
                case 11:
                    _b = _c.sent();
                    _c.label = 12;
                case 12:
                    first = (_b)[0];
                    firstArr = first;
                    if (firstArr.length)
                        return [2 /*return*/, firstArr[0].content];
                    templateFile = TEMPLATE_FILE_MAP[documentType];
                    if (templateFile) {
                        filePath = path.resolve(process.cwd(), 'templates', templateFile);
                        try {
                            if (fs.existsSync(filePath)) {
                                return [2 /*return*/, fs.readFileSync(filePath, 'utf-8')];
                            }
                        }
                        catch ( /* ignore */_d) { /* ignore */ }
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Fetch common company info from settings
 */
function fetchCompanyInfo(db) {
    return __awaiter(this, void 0, Promise, function () {
        var companyRows, company;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, 'company'))];
                case 1:
                    companyRows = _a.sent();
                    company = {};
                    companyRows.forEach(function (s) { var _a; if (s.key)
                        company[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ''; });
                    return [2 /*return*/, company];
            }
        });
    });
}
/**
 * Fetch payment settings (bank + mpesa)
 */
function fetchPaymentSettings(db) {
    return __awaiter(this, void 0, Promise, function () {
        var bankRows, bank, mpesaRows, mpesa;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, 'payment_bank'))];
                case 1:
                    bankRows = _a.sent();
                    bank = {};
                    bankRows.forEach(function (s) { var _a; if (s.key)
                        bank[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ''; });
                    return [4 /*yield*/, db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, 'payment_mpesa'))];
                case 2:
                    mpesaRows = _a.sent();
                    mpesa = {};
                    mpesaRows.forEach(function (s) { var _a; if (s.key)
                        mpesa[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ''; });
                    return [2 /*return*/, { bank: bank, mpesa: mpesa }];
            }
        });
    });
}
/**
 * Fetch currency setting
 */
function fetchCurrency(db) {
    return __awaiter(this, void 0, Promise, function () {
        var currRows, currMap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, 'currency'))];
                case 1:
                    currRows = _a.sent();
                    currMap = {};
                    currRows.forEach(function (s) { var _a; if (s.key)
                        currMap[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ''; });
                    return [2 /*return*/, currMap.code || currMap.symbol || 'KES'];
            }
        });
    });
}
/**
 * Fetch invoice terms from settings
 */
function fetchInvoiceTerms(db) {
    return __awaiter(this, void 0, Promise, function () {
        var rows, map;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, 'invoice_settings'))];
                case 1:
                    rows = _a.sent();
                    map = {};
                    rows.forEach(function (s) { var _a; if (s.key)
                        map[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ''; });
                    return [2 /*return*/, map.termsAndConditions || ''];
            }
        });
    });
}
/**
 * Bind data to template HTML by replacing placeholders
 */
function bindDataToTemplate(html, data) {
    var result = html;
    // Replace ${companyInfo.*} placeholders
    if (data.companyInfo) {
        result = result.replace(/\$\{companyInfo\.(\w+)\}/g, function (_m, key) {
            return data.companyInfo[key] || '';
        });
    }
    // Replace [PLACEHOLDER] format
    for (var _i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value !== null && value !== undefined && typeof value !== 'object') {
            var placeholder = "[" + key + "]";
            result = result.split(placeholder).join(String(value));
        }
    }
    // Replace {{placeholder}} format (used by DocumentTemplates.tsx editor)
    for (var _c = 0, _d = Object.entries(data); _c < _d.length; _c++) {
        var _e = _d[_c], key = _e[0], value = _e[1];
        if (value !== null && value !== undefined && typeof value !== 'object') {
            var placeholder = "{{" + key + "}}";
            result = result.split(placeholder).join(String(value));
        }
    }
    return result;
}
/**
 * Build line items HTML table rows
 */
function buildLineItemsTable(items, currency) {
    if (!items.length)
        return '<tr><td colspan="4" style="text-align:center;padding:12px;color:#636e72;">No line items</td></tr>';
    return items.map(function (item, index) {
        var _a, _b, _c, _d, _e;
        var qty = (_a = item.quantity) !== null && _a !== void 0 ? _a : 1;
        var unitPrice = ((_c = (_b = item.unitPrice) !== null && _b !== void 0 ? _b : item.rate) !== null && _c !== void 0 ? _c : 0) / 100;
        var total = ((_e = (_d = item.total) !== null && _d !== void 0 ? _d : item.amount) !== null && _e !== void 0 ? _e : 0) / 100;
        var desc = item.description || item.itemType || "Item " + (index + 1);
        return "<tr>\n      <td style=\"padding: 10px 12px; border-bottom: 1px solid #dfe6e9;\">" + desc + "</td>\n      <td style=\"padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: center;\">" + qty + "</td>\n      <td style=\"padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: right;\">" + currency + " " + unitPrice.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "</td>\n      <td style=\"padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: right;\">" + currency + " " + total.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "</td>\n    </tr>";
    }).join('\n');
}
/**
 * Render an invoice using the document template
 */
function renderInvoiceTemplate(invoiceId, organizationId, templateId) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var db, invoiceData, invoice, clientData, client, items, company, payment, currency, defaultTerms, templateHtml, formatDate, formatAmount, itemsTableRows, itemsTableHtml, subtotal, taxAmount, discountAmount, total, totalsHtml, paymentHtml, itemVariables, boundHtml;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId)).limit(1)];
                case 2:
                    invoiceData = _b.sent();
                    if (!invoiceData.length)
                        return [2 /*return*/, null];
                    invoice = invoiceData[0];
                    return [4 /*yield*/, db.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, invoice.clientId)).limit(1)];
                case 3:
                    clientData = _b.sent();
                    client = clientData.length ? clientData[0] : null;
                    return [4 /*yield*/, db.select().from(schema_1.invoiceItems).where(drizzle_orm_1.eq(schema_1.invoiceItems.invoiceId, invoiceId))];
                case 4:
                    items = _b.sent();
                    return [4 /*yield*/, fetchCompanyInfo(db)];
                case 5:
                    company = _b.sent();
                    return [4 /*yield*/, fetchPaymentSettings(db)];
                case 6:
                    payment = _b.sent();
                    return [4 /*yield*/, fetchCurrency(db)];
                case 7:
                    currency = _b.sent();
                    return [4 /*yield*/, fetchInvoiceTerms(db)];
                case 8:
                    defaultTerms = _b.sent();
                    return [4 /*yield*/, getTemplateContent('invoice', organizationId, templateId)];
                case 9:
                    templateHtml = _b.sent();
                    if (!templateHtml)
                        return [2 /*return*/, null];
                    formatDate = function (d) {
                        if (!d)
                            return '';
                        try {
                            return new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
                        }
                        catch (_a) {
                            return String(d);
                        }
                    };
                    formatAmount = function (amt) {
                        var n = (Number(amt) || 0) / 100;
                        return currency + " " + n.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                    };
                    itemsTableRows = buildLineItemsTable(items, currency);
                    itemsTableHtml = "<table style=\"width: 100%; border-collapse: collapse;\">\n    <thead>\n      <tr style=\"background: #2d3436; color: #fff;\">\n        <th style=\"padding: 10px 12px; text-align: left; font-weight: 600;\">Description</th>\n        <th style=\"padding: 10px 12px; text-align: center; font-weight: 600;\">Qty</th>\n        <th style=\"padding: 10px 12px; text-align: right; font-weight: 600;\">Unit Price</th>\n        <th style=\"padding: 10px 12px; text-align: right; font-weight: 600;\">Amount</th>\n      </tr>\n    </thead>\n    <tbody>" + itemsTableRows + "</tbody>\n  </table>";
                    subtotal = (Number(invoice.subtotal) || 0) / 100;
                    taxAmount = (Number(invoice.taxAmount) || 0) / 100;
                    discountAmount = (Number(invoice.discountAmount) || 0) / 100;
                    total = (Number(invoice.total) || 0) / 100;
                    totalsHtml = "\n    <div style=\"margin-top: 16px; text-align: right;\">\n      <div style=\"margin: 4px 0;\"><strong>Subtotal:</strong> " + currency + " " + subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "</div>\n      " + (taxAmount > 0 ? "<div style=\"margin: 4px 0;\"><strong>Tax:</strong> " + currency + " " + taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "</div>" : '') + "\n      " + (discountAmount > 0 ? "<div style=\"margin: 4px 0;\"><strong>Discount:</strong> -" + currency + " " + discountAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "</div>" : '') + "\n      <div style=\"margin-top: 8px; padding-top: 8px; border-top: 2px solid #ff9f43; font-size: 18px; font-weight: 700; color: #ff9f43;\">\n        Total: " + currency + " " + total.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "\n      </div>\n    </div>";
                    paymentHtml = "<div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;\">\n    <div style=\"background: #f8f9fa; padding: 12px; border-radius: 4px;\">\n      <strong style=\"display: block; margin-bottom: 6px;\">Bank Details</strong>\n      " + (payment.bank.bankName ? "<div>Bank: " + payment.bank.bankName + "</div>" : '') + "\n      " + (payment.bank.branch ? "<div>Branch: " + payment.bank.branch + "</div>" : '') + "\n      " + (payment.bank.accountNumber ? "<div>Account: " + payment.bank.accountNumber + "</div>" : '') + "\n      " + (payment.bank.accountName ? "<div>Name: " + payment.bank.accountName + "</div>" : '') + "\n    </div>\n    <div style=\"background: #f8f9fa; padding: 12px; border-radius: 4px;\">\n      <strong style=\"display: block; margin-bottom: 6px;\">M-Pesa Payment</strong>\n      " + (payment.mpesa.paybillNumber ? "<div>Paybill: " + payment.mpesa.paybillNumber + "</div>" : '') + "\n      " + (payment.mpesa.accountNumber ? "<div>Account: " + payment.mpesa.accountNumber + "</div>" : '') + "\n    </div>\n  </div>";
                    itemVariables = {};
                    items.forEach(function (item, index) {
                        var _a, _b, _c, _d, _e;
                        var itemNum = index + 1;
                        var qty = (_a = item.quantity) !== null && _a !== void 0 ? _a : 1;
                        var unitPrice = ((_c = (_b = item.unitPrice) !== null && _b !== void 0 ? _b : item.rate) !== null && _c !== void 0 ? _c : 0) / 100;
                        var itemTotal = ((_e = (_d = item.total) !== null && _d !== void 0 ? _d : item.amount) !== null && _e !== void 0 ? _e : 0) / 100;
                        var desc = item.description || item.itemType || "Item " + itemNum;
                        itemVariables["ITEM_" + itemNum + "_DESCRIPTION"] = desc;
                        itemVariables["ITEM_" + itemNum + "_QUANTITY"] = qty;
                        itemVariables["ITEM_" + itemNum + "_UNIT_PRICE"] = currency + " " + unitPrice.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                        itemVariables["ITEM_" + itemNum + "_AMOUNT"] = currency + " " + itemTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                        itemVariables["ITEM_" + itemNum + "_TOTAL"] = currency + " " + itemTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                    });
                    boundHtml = bindDataToTemplate(templateHtml, __assign({ companyInfo: company, 
                        // Document details
                        INVOICE_NUMBER: invoice.invoiceNumber, invoice_number: invoice.invoiceNumber, DOCUMENT_NUMBER: invoice.invoiceNumber, document_number: invoice.invoiceNumber, DATE_ISSUED: formatDate(invoice.issueDate), date_issued: formatDate(invoice.issueDate), ISSUE_DATE: formatDate(invoice.issueDate), issue_date: formatDate(invoice.issueDate), DUE_DATE: formatDate(invoice.dueDate), due_date: formatDate(invoice.dueDate), STATUS: ((_a = invoice.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || 'DRAFT', TAX_RATE: invoice.taxAmount ? ((Number(invoice.taxAmount) / Number(invoice.subtotal)) * 100).toFixed(1) + "%" : '0%', 
                        // Client/Payer details
                        CLIENT_NAME: (client === null || client === void 0 ? void 0 : client.companyName) || (client === null || client === void 0 ? void 0 : client.contactPerson) || '', client_name: (client === null || client === void 0 ? void 0 : client.companyName) || (client === null || client === void 0 ? void 0 : client.contactPerson) || '', CLIENT_COMPANY: (client === null || client === void 0 ? void 0 : client.companyName) || '', client_company: (client === null || client === void 0 ? void 0 : client.companyName) || '', COMPANY_NAME: (client === null || client === void 0 ? void 0 : client.companyName) || '', CLIENT_EMAIL: (client === null || client === void 0 ? void 0 : client.email) || '', client_email: (client === null || client === void 0 ? void 0 : client.email) || '', CLIENT_PHONE: (client === null || client === void 0 ? void 0 : client.phone) || '', client_phone: (client === null || client === void 0 ? void 0 : client.phone) || '', CLIENT_ADDRESS: (client === null || client === void 0 ? void 0 : client.address) || '', client_address: (client === null || client === void 0 ? void 0 : client.address) || '', CONTACT_PERSON: (client === null || client === void 0 ? void 0 : client.contactPerson) || '', 
                        // Amounts
                        SUBTOTAL: formatAmount(invoice.subtotal), TAX_AMOUNT: formatAmount(invoice.taxAmount), DISCOUNT: formatAmount(invoice.discountAmount), TOTAL: formatAmount(invoice.total), PAID_AMOUNT: formatAmount(invoice.paidAmount), BALANCE_DUE: formatAmount((Number(invoice.total) || 0) - (Number(invoice.paidAmount) || 0)), 
                        // Table
                        ITEMS_TABLE: itemsTableHtml, items_table: itemsTableHtml, LINE_ITEMS: itemsTableHtml, 
                        // Totals section
                        TOTALS_SECTION: totalsHtml, 
                        // Payment
                        PAYMENT_INSTRUCTIONS: paymentHtml, BANK_NAME: payment.bank.bankName || '', BANK_BRANCH: payment.bank.branch || '', BANK_ACCOUNT: payment.bank.accountNumber || '', BANK_ACCOUNT_NAME: payment.bank.accountName || '', MPESA_PAYBILL: payment.mpesa.paybillNumber || '', MPESA_ACCOUNT: payment.mpesa.accountNumber || '', 
                        // Terms & Notes
                        NOTES: invoice.notes || '', TERMS: invoice.terms || defaultTerms || '', TERMS_AND_CONDITIONS: invoice.terms || defaultTerms || '', 
                        // Footer
                        FOOTER_TEXT: "This is a system generated invoice. For inquiries, contact " + (company.email || '') }, itemVariables));
                    return [2 /*return*/, {
                            html: boundHtml,
                            title: "Invoice " + invoice.invoiceNumber
                        }];
            }
        });
    });
}
exports.renderInvoiceTemplate = renderInvoiceTemplate;
/**
 * Render a receipt using the document template
 */
function renderReceiptTemplate(receiptId, organizationId, templateId) {
    var _a, _b;
    return __awaiter(this, void 0, Promise, function () {
        var db, receiptData, receipt, clientData, client, items, company, currency, templateHtml, formatDate, amount, formatAmount, itemsTableRows, itemVariables, boundHtml;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(schema_1.receipts).where(drizzle_orm_1.eq(schema_1.receipts.id, receiptId)).limit(1)];
                case 2:
                    receiptData = _c.sent();
                    if (!receiptData.length)
                        return [2 /*return*/, null];
                    receipt = receiptData[0];
                    return [4 /*yield*/, db.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, receipt.clientId)).limit(1)];
                case 3:
                    clientData = _c.sent();
                    client = clientData.length ? clientData[0] : null;
                    return [4 /*yield*/, db.select().from(schema_1.lineItems).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, receiptId), drizzle_orm_1.eq(schema_1.lineItems.documentType, 'receipt')))];
                case 4:
                    items = _c.sent();
                    return [4 /*yield*/, fetchCompanyInfo(db)];
                case 5:
                    company = _c.sent();
                    return [4 /*yield*/, fetchCurrency(db)];
                case 6:
                    currency = _c.sent();
                    return [4 /*yield*/, getTemplateContent('receipt', organizationId, templateId)];
                case 7:
                    templateHtml = _c.sent();
                    if (!templateHtml)
                        return [2 /*return*/, null];
                    formatDate = function (d) {
                        if (!d)
                            return '';
                        try {
                            return new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
                        }
                        catch (_a) {
                            return String(d);
                        }
                    };
                    amount = (Number(receipt.amount) || 0) / 100;
                    formatAmount = function (amt) {
                        var n = (Number(amt) || 0) / 100;
                        return currency + " " + n.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                    };
                    itemsTableRows = items.length ? items.map(function (item, index) {
                        var _a, _b, _c;
                        var qty = (_a = item.quantity) !== null && _a !== void 0 ? _a : 1;
                        var rate = ((_b = item.rate) !== null && _b !== void 0 ? _b : 0) / 100;
                        var total = ((_c = item.amount) !== null && _c !== void 0 ? _c : 0) / 100;
                        return "<tr>\n      <td style=\"padding: 10px 12px; border-bottom: 1px solid #dfe6e9;\">" + (item.description || "Item " + (index + 1)) + "</td>\n      <td style=\"padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: center;\">" + qty + "</td>\n      <td style=\"padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: right;\">" + currency + " " + rate.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "</td>\n      <td style=\"padding: 10px 12px; border-bottom: 1px solid #dfe6e9; text-align: right;\">" + currency + " " + total.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "</td>\n    </tr>";
                    }).join('\n') : "<tr><td colspan=\"4\" style=\"text-align:center;padding:12px;\">Payment received - " + currency + " " + amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "</td></tr>";
                    itemVariables = {};
                    items.forEach(function (item, index) {
                        var _a, _b, _c;
                        var itemNum = index + 1;
                        var qty = (_a = item.quantity) !== null && _a !== void 0 ? _a : 1;
                        var rate = ((_b = item.rate) !== null && _b !== void 0 ? _b : 0) / 100;
                        var itemTotal = ((_c = item.amount) !== null && _c !== void 0 ? _c : 0) / 100;
                        var desc = item.description || "Item " + itemNum;
                        itemVariables["ITEM_" + itemNum + "_DESCRIPTION"] = desc;
                        itemVariables["ITEM_" + itemNum + "_QUANTITY"] = qty;
                        itemVariables["ITEM_" + itemNum + "_UNIT_PRICE"] = currency + " " + rate.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                        itemVariables["ITEM_" + itemNum + "_AMOUNT"] = currency + " " + itemTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                        itemVariables["ITEM_" + itemNum + "_TOTAL"] = currency + " " + itemTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                    });
                    boundHtml = bindDataToTemplate(templateHtml, __assign({ companyInfo: company, RECEIPT_NUMBER: receipt.receiptNumber, receipt_number: receipt.receiptNumber, DOCUMENT_NUMBER: receipt.receiptNumber, document_number: receipt.receiptNumber, RECEIPT_DATE: formatDate(receipt.receiptDate), receipt_date: formatDate(receipt.receiptDate), ISSUE_DATE: formatDate(receipt.receiptDate), issue_date: formatDate(receipt.receiptDate), PAYMENT_METHOD: ((_a = receipt.paymentMethod) === null || _a === void 0 ? void 0 : _a.replace(/_/g, ' ').toUpperCase()) || '', payment_method: ((_b = receipt.paymentMethod) === null || _b === void 0 ? void 0 : _b.replace(/_/g, ' ')) || '', AMOUNT: currency + " " + amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }), amount: currency + " " + amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }), TOTAL: currency + " " + amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }), CLIENT_NAME: (client === null || client === void 0 ? void 0 : client.companyName) || (client === null || client === void 0 ? void 0 : client.contactPerson) || '', client_name: (client === null || client === void 0 ? void 0 : client.companyName) || (client === null || client === void 0 ? void 0 : client.contactPerson) || '', CLIENT_COMPANY: (client === null || client === void 0 ? void 0 : client.companyName) || '', client_company: (client === null || client === void 0 ? void 0 : client.companyName) || '', CLIENT_EMAIL: (client === null || client === void 0 ? void 0 : client.email) || '', CLIENT_PHONE: (client === null || client === void 0 ? void 0 : client.phone) || '', CLIENT_ADDRESS: (client === null || client === void 0 ? void 0 : client.address) || '', ITEMS_TABLE: "<table style=\"width: 100%; border-collapse: collapse;\">\n      <thead><tr style=\"background: #2d3436; color: #fff;\">\n        <th style=\"padding: 10px 12px; text-align: left;\">Description</th>\n        <th style=\"padding: 10px 12px; text-align: center;\">Qty</th>\n        <th style=\"padding: 10px 12px; text-align: right;\">Rate</th>\n        <th style=\"padding: 10px 12px; text-align: right;\">Amount</th>\n      </tr></thead>\n      <tbody>" + itemsTableRows + "</tbody></table>", items_table: "<table style=\"width: 100%; border-collapse: collapse;\"><tbody>" + itemsTableRows + "</tbody></table>", NOTES: receipt.notes || '', FOOTER_TEXT: "This is a system generated receipt. For inquiries, contact " + (company.email || '') }, itemVariables));
                    return [2 /*return*/, {
                            html: boundHtml,
                            title: "Receipt " + receipt.receiptNumber
                        }];
            }
        });
    });
}
exports.renderReceiptTemplate = renderReceiptTemplate;
/**
 * Render an estimate using the document template
 */
function renderEstimateTemplate(estimateId, organizationId, templateId) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var db, estimateData, estimate, clientData, client, items, company, payment, currency, defaultTerms, templateHtml, formatDate, formatAmount, itemsTableRows, itemsTableHtml, subtotal, taxAmount, discountAmount, total, totalsHtml, paymentHtml, itemVariables, boundHtml;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(schema_1.estimates).where(drizzle_orm_1.eq(schema_1.estimates.id, estimateId)).limit(1)];
                case 2:
                    estimateData = _b.sent();
                    if (!estimateData.length)
                        return [2 /*return*/, null];
                    estimate = estimateData[0];
                    return [4 /*yield*/, db.select().from(schema_1.clients).where(drizzle_orm_1.eq(schema_1.clients.id, estimate.clientId)).limit(1)];
                case 3:
                    clientData = _b.sent();
                    client = clientData.length ? clientData[0] : null;
                    return [4 /*yield*/, db.select().from(schema_1.estimateItems).where(drizzle_orm_1.eq(schema_1.estimateItems.estimateId, estimateId))];
                case 4:
                    items = _b.sent();
                    return [4 /*yield*/, fetchCompanyInfo(db)];
                case 5:
                    company = _b.sent();
                    return [4 /*yield*/, fetchPaymentSettings(db)];
                case 6:
                    payment = _b.sent();
                    return [4 /*yield*/, fetchCurrency(db)];
                case 7:
                    currency = _b.sent();
                    return [4 /*yield*/, fetchInvoiceTerms(db)];
                case 8:
                    defaultTerms = _b.sent();
                    return [4 /*yield*/, getTemplateContent('estimate', organizationId, templateId)];
                case 9:
                    templateHtml = _b.sent();
                    if (!templateHtml)
                        return [2 /*return*/, null];
                    formatDate = function (d) {
                        if (!d)
                            return '';
                        try {
                            return new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
                        }
                        catch (_a) {
                            return String(d);
                        }
                    };
                    formatAmount = function (amt) {
                        var n = (Number(amt) || 0) / 100;
                        return currency + " " + n.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                    };
                    itemsTableRows = buildLineItemsTable(items, currency);
                    itemsTableHtml = "<table style=\"width: 100%; border-collapse: collapse;\">\n    <thead>\n      <tr style=\"background: #2d3436; color: #fff;\">\n        <th style=\"padding: 10px 12px; text-align: left; font-weight: 600;\">Description</th>\n        <th style=\"padding: 10px 12px; text-align: center; font-weight: 600;\">Qty</th>\n        <th style=\"padding: 10px 12px; text-align: right; font-weight: 600;\">Unit Price</th>\n        <th style=\"padding: 10px 12px; text-align: right; font-weight: 600;\">Amount</th>\n      </tr>\n    </thead>\n    <tbody>" + itemsTableRows + "</tbody>\n  </table>";
                    subtotal = (Number(estimate.subtotal) || 0) / 100;
                    taxAmount = (Number(estimate.taxAmount) || 0) / 100;
                    discountAmount = (Number(estimate.discountAmount) || 0) / 100;
                    total = (Number(estimate.total) || 0) / 100;
                    totalsHtml = "\n    <div style=\"margin-top: 16px; text-align: right;\">\n      <div style=\"margin: 4px 0;\"><strong>Subtotal:</strong> " + currency + " " + subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "</div>\n      " + (taxAmount > 0 ? "<div style=\"margin: 4px 0;\"><strong>Tax:</strong> " + currency + " " + taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "</div>" : '') + "\n      " + (discountAmount > 0 ? "<div style=\"margin: 4px 0;\"><strong>Discount:</strong> -" + currency + " " + discountAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "</div>" : '') + "\n      <div style=\"margin-top: 8px; padding-top: 8px; border-top: 2px solid #ff9f43; font-size: 18px; font-weight: 700; color: #ff9f43;\">\n        Total: " + currency + " " + total.toLocaleString('en-KE', { minimumFractionDigits: 2 }) + "\n      </div>\n    </div>";
                    paymentHtml = "<div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;\">\n    <div style=\"background: #f8f9fa; padding: 12px; border-radius: 4px;\">\n      <strong style=\"display: block; margin-bottom: 6px;\">Bank Details</strong>\n      " + (payment.bank.bankName ? "<div>Bank: " + payment.bank.bankName + "</div>" : '') + "\n      " + (payment.bank.branch ? "<div>Branch: " + payment.bank.branch + "</div>" : '') + "\n      " + (payment.bank.accountNumber ? "<div>Account: " + payment.bank.accountNumber + "</div>" : '') + "\n      " + (payment.bank.accountName ? "<div>Name: " + payment.bank.accountName + "</div>" : '') + "\n    </div>\n    <div style=\"background: #f8f9fa; padding: 12px; border-radius: 4px;\">\n      <strong style=\"display: block; margin-bottom: 6px;\">M-Pesa Payment</strong>\n      " + (payment.mpesa.paybillNumber ? "<div>Paybill: " + payment.mpesa.paybillNumber + "</div>" : '') + "\n      " + (payment.mpesa.accountNumber ? "<div>Account: " + payment.mpesa.accountNumber + "</div>" : '') + "\n    </div>\n  </div>";
                    itemVariables = {};
                    items.forEach(function (item, index) {
                        var _a, _b, _c, _d, _e;
                        var itemNum = index + 1;
                        var qty = (_a = item.quantity) !== null && _a !== void 0 ? _a : 1;
                        var unitPrice = ((_c = (_b = item.unitPrice) !== null && _b !== void 0 ? _b : item.rate) !== null && _c !== void 0 ? _c : 0) / 100;
                        var itemTotal = ((_e = (_d = item.total) !== null && _d !== void 0 ? _d : item.amount) !== null && _e !== void 0 ? _e : 0) / 100;
                        var desc = item.description || item.itemType || "Item " + itemNum;
                        itemVariables["ITEM_" + itemNum + "_DESCRIPTION"] = desc;
                        itemVariables["ITEM_" + itemNum + "_QUANTITY"] = qty;
                        itemVariables["ITEM_" + itemNum + "_UNIT_PRICE"] = currency + " " + unitPrice.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                        itemVariables["ITEM_" + itemNum + "_AMOUNT"] = currency + " " + itemTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                        itemVariables["ITEM_" + itemNum + "_TOTAL"] = currency + " " + itemTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 });
                    });
                    boundHtml = bindDataToTemplate(templateHtml, __assign({ companyInfo: company, 
                        // Document details
                        ESTIMATE_NUMBER: estimate.estimateNumber, estimate_number: estimate.estimateNumber, DOCUMENT_NUMBER: estimate.estimateNumber, document_number: estimate.estimateNumber, DATE_ISSUED: formatDate(estimate.issueDate), date_issued: formatDate(estimate.issueDate), ISSUE_DATE: formatDate(estimate.issueDate), issue_date: formatDate(estimate.issueDate), EXPIRY_DATE: formatDate(estimate.expiryDate), expiry_date: formatDate(estimate.expiryDate), DUE_DATE: formatDate(estimate.expiryDate), due_date: formatDate(estimate.expiryDate), STATUS: ((_a = estimate.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || 'DRAFT', TAX_RATE: estimate.taxAmount ? ((Number(estimate.taxAmount) / Number(estimate.subtotal)) * 100).toFixed(1) + "%" : '0%', 
                        // Client/Payer details
                        CLIENT_NAME: (client === null || client === void 0 ? void 0 : client.companyName) || (client === null || client === void 0 ? void 0 : client.contactPerson) || '', client_name: (client === null || client === void 0 ? void 0 : client.companyName) || (client === null || client === void 0 ? void 0 : client.contactPerson) || '', CLIENT_COMPANY: (client === null || client === void 0 ? void 0 : client.companyName) || '', client_company: (client === null || client === void 0 ? void 0 : client.companyName) || '', COMPANY_NAME: (client === null || client === void 0 ? void 0 : client.companyName) || '', CLIENT_EMAIL: (client === null || client === void 0 ? void 0 : client.email) || '', client_email: (client === null || client === void 0 ? void 0 : client.email) || '', CLIENT_PHONE: (client === null || client === void 0 ? void 0 : client.phone) || '', client_phone: (client === null || client === void 0 ? void 0 : client.phone) || '', CLIENT_ADDRESS: (client === null || client === void 0 ? void 0 : client.address) || '', client_address: (client === null || client === void 0 ? void 0 : client.address) || '', CONTACT_PERSON: (client === null || client === void 0 ? void 0 : client.contactPerson) || '', 
                        // Amounts
                        SUBTOTAL: formatAmount(estimate.subtotal), TAX_AMOUNT: formatAmount(estimate.taxAmount), DISCOUNT: formatAmount(estimate.discountAmount), TOTAL: formatAmount(estimate.total), 
                        // Table
                        ITEMS_TABLE: itemsTableHtml, items_table: itemsTableHtml, LINE_ITEMS: itemsTableHtml, 
                        // Totals section
                        TOTALS_SECTION: totalsHtml, 
                        // Payment
                        PAYMENT_INSTRUCTIONS: paymentHtml, BANK_NAME: payment.bank.bankName || '', BANK_BRANCH: payment.bank.branch || '', BANK_ACCOUNT: payment.bank.accountNumber || '', BANK_ACCOUNT_NAME: payment.bank.accountName || '', MPESA_PAYBILL: payment.mpesa.paybillNumber || '', MPESA_ACCOUNT: payment.mpesa.accountNumber || '', 
                        // Terms & Notes
                        NOTES: estimate.notes || '', TERMS: estimate.terms || defaultTerms || '', TERMS_AND_CONDITIONS: estimate.terms || defaultTerms || '', 
                        // Footer
                        FOOTER_TEXT: "This is a system generated estimate. For inquiries, contact " + (company.email || '') }, itemVariables));
                    return [2 /*return*/, {
                            html: boundHtml,
                            title: "Estimate " + estimate.estimateNumber
                        }];
            }
        });
    });
}
exports.renderEstimateTemplate = renderEstimateTemplate;
/**
 * Generic document template renderer - routes to specific renderers
 */
function renderDocumentTemplate(documentType, documentId, organizationId, templateId) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            switch (documentType) {
                case 'invoice':
                    return [2 /*return*/, renderInvoiceTemplate(documentId, organizationId, templateId)];
                case 'receipt':
                    return [2 /*return*/, renderReceiptTemplate(documentId, organizationId, templateId)];
                case 'estimate':
                    return [2 /*return*/, renderEstimateTemplate(documentId, organizationId, templateId)];
                default:
                    // For other document types, return null (fallback to jsPDF)
                    return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    });
}
exports.renderDocumentTemplate = renderDocumentTemplate;
