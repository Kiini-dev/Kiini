"use strict";
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
exports.generateInvoicePDF = void 0;
var jspdf_1 = require("jspdf");
var jspdf_autotable_1 = require("jspdf-autotable");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
/**
 * Generate an invoice PDF buffer using professional template layout
 * @param invoiceId - The ID of the invoice to generate
 * @returns Buffer containing the PDF data
 */
function generateInvoicePDF(invoiceId) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var db, invoiceData, invoice, clientData, client, items, companyRows, company, bankRows, bankPay, mpesaRows, mpesaPay, invSettingsRows, invSettings, currRows, currMap, cur, doc, currentY, contactLines, clientDetails, tableData, totalLineY, bankLines, mpesaLines, notesLines, defaultTerms, termsLines, footerY, pdfOutput;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        throw new Error('Database connection not available');
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))
                            .limit(1)];
                case 2:
                    invoiceData = _b.sent();
                    if (!invoiceData || invoiceData.length === 0) {
                        throw new Error("Invoice with ID " + invoiceId + " not found");
                    }
                    invoice = invoiceData[0];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.clients)
                            .where(drizzle_orm_1.eq(schema_1.clients.id, invoice.clientId))
                            .limit(1)];
                case 3:
                    clientData = _b.sent();
                    client = clientData && clientData.length > 0 ? clientData[0] : null;
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoiceItems)
                            .where(drizzle_orm_1.eq(schema_1.invoiceItems.invoiceId, invoiceId))];
                case 4:
                    items = _b.sent();
                    return [4 /*yield*/, db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, 'company'))];
                case 5:
                    companyRows = _b.sent();
                    company = {};
                    companyRows.forEach(function (s) { var _a; if (s.key)
                        company[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ''; });
                    return [4 /*yield*/, db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, 'payment_bank'))];
                case 6:
                    bankRows = _b.sent();
                    bankPay = {};
                    bankRows.forEach(function (s) { var _a; if (s.key)
                        bankPay[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ''; });
                    return [4 /*yield*/, db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, 'payment_mpesa'))];
                case 7:
                    mpesaRows = _b.sent();
                    mpesaPay = {};
                    mpesaRows.forEach(function (s) { var _a; if (s.key)
                        mpesaPay[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ''; });
                    return [4 /*yield*/, db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, 'invoice_settings'))];
                case 8:
                    invSettingsRows = _b.sent();
                    invSettings = {};
                    invSettingsRows.forEach(function (s) { var _a; if (s.key)
                        invSettings[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ''; });
                    return [4 /*yield*/, db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, 'currency'))];
                case 9:
                    currRows = _b.sent();
                    currMap = {};
                    currRows.forEach(function (s) { var _a; if (s.key)
                        currMap[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ''; });
                    cur = currMap.code || 'KES';
                    doc = new jspdf_1["default"]();
                    currentY = 15;
                    // ========== HEADER WITH BRANDING ==========
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(20);
                    doc.setTextColor(40, 40, 40);
                    doc.text((company.name || 'Company Name').toUpperCase(), 20, currentY);
                    currentY += 6;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    if (company.tagline)
                        doc.text(company.tagline, 20, currentY);
                    currentY += 6;
                    doc.setFontSize(9);
                    contactLines = [];
                    if (company.phone)
                        contactLines.push(company.phone);
                    if (company.email)
                        contactLines.push(company.email);
                    if (company.address)
                        contactLines.push(company.address);
                    if (contactLines.length)
                        doc.text(contactLines, 20, currentY);
                    // Document type on right
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(24);
                    doc.setTextColor(40, 40, 40);
                    doc.text('INVOICE', 190, currentY - 6, { align: 'right' });
                    currentY = 50;
                    // ========== DOCUMENT METADATA ==========
                    doc.setDrawColor(220, 220, 220);
                    doc.rect(20, currentY - 5, 170, 15);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(40, 40, 40);
                    doc.text("Invoice #: " + invoice.invoiceNumber, 25, currentY + 2);
                    doc.text("Date: " + new Date(invoice.issueDate).toLocaleDateString(), 110, currentY + 2);
                    doc.text("Due: " + new Date(invoice.dueDate).toLocaleDateString(), 150, currentY + 2);
                    currentY += 20;
                    // ========== BILL TO / CLIENT DETAILS ==========
                    doc.setDrawColor(240, 240, 240);
                    doc.rect(20, currentY - 5, 170, 35);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(11);
                    doc.setTextColor(40, 40, 40);
                    doc.text('Bill To / Client Details', 25, currentY);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    doc.setTextColor(80, 80, 80);
                    clientDetails = [];
                    if (client) {
                        clientDetails.push("" + (client.companyName || ''));
                        if (client.contactPerson)
                            clientDetails.push("Contact: " + client.contactPerson);
                        if (client.email)
                            clientDetails.push("Email: " + client.email);
                        if (client.phone)
                            clientDetails.push("Phone: " + client.phone);
                        if (client.address)
                            clientDetails.push("Address: " + client.address);
                    }
                    doc.text(clientDetails, 25, currentY + 6);
                    currentY += 40;
                    tableData = items.map(function (item) { return [
                        item.description || '',
                        item.quantity.toString(),
                        cur + " " + (item.unitPrice / 100).toFixed(2),
                        cur + " " + (item.total / 100).toFixed(2),
                    ]; });
                    jspdf_autotable_1["default"](doc, {
                        startY: currentY,
                        head: [['Description', 'Qty', 'Unit Price', 'Amount']],
                        body: tableData,
                        theme: 'grid',
                        headStyles: {
                            fillColor: [66, 66, 66],
                            textColor: [255, 255, 255],
                            fontStyle: 'bold',
                            fontSize: 10,
                            halign: 'center'
                        },
                        bodyStyles: {
                            fontSize: 9,
                            textColor: [80, 80, 80]
                        },
                        footStyles: {
                            fontSize: 10,
                            fontStyle: 'bold'
                        },
                        styles: {
                            cellPadding: 6
                        },
                        columnStyles: {
                            0: { cellWidth: 80, halign: 'left' },
                            1: { cellWidth: 20, halign: 'center' },
                            2: { cellWidth: 35, halign: 'right' },
                            3: { cellWidth: 35, halign: 'right' }
                        },
                        margin: { left: 20, right: 20 }
                    });
                    currentY = ((_a = doc.lastAutoTable) === null || _a === void 0 ? void 0 : _a.finalY) || currentY + 40;
                    currentY += 10;
                    // ========== TOTALS SECTION ==========
                    doc.setDrawColor(240, 240, 240);
                    doc.rect(120, currentY - 5, 70, 5 + (invoice.taxAmount ? 5 : 0) + (invoice.discountAmount ? 5 : 0) + 8);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.setTextColor(80, 80, 80);
                    doc.text('Subtotal:', 125, currentY + 2);
                    doc.text(cur + " " + (invoice.subtotal / 100).toFixed(2), 185, currentY + 2, { align: 'right' });
                    totalLineY = currentY + 2;
                    if (invoice.taxAmount && invoice.taxAmount > 0) {
                        totalLineY += 5;
                        doc.text('Tax:', 125, totalLineY);
                        doc.text(cur + " " + (invoice.taxAmount / 100).toFixed(2), 185, totalLineY, { align: 'right' });
                    }
                    if (invoice.discountAmount && invoice.discountAmount > 0) {
                        totalLineY += 5;
                        doc.text('Discount:', 125, totalLineY);
                        doc.text("-" + cur + " " + (invoice.discountAmount / 100).toFixed(2), 185, totalLineY, { align: 'right' });
                    }
                    totalLineY += 8;
                    // Highlight box for total
                    doc.setDrawColor(255, 159, 67);
                    doc.setFillColor(255, 159, 67);
                    doc.rect(120, totalLineY - 5, 70, 8, 'F');
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(12);
                    doc.setTextColor(255, 255, 255);
                    doc.text('Total:', 125, totalLineY + 1);
                    doc.text(cur + " " + (invoice.total / 100).toFixed(2), 185, totalLineY + 1, { align: 'right' });
                    currentY = totalLineY + 15;
                    // ========== PAYMENT INSTRUCTIONS ==========
                    if (currentY > 200) {
                        doc.addPage();
                        currentY = 15;
                    }
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(11);
                    doc.setTextColor(40, 40, 40);
                    doc.text('Payment Instructions', 20, currentY);
                    currentY += 10;
                    // Bank Details Box
                    doc.setDrawColor(240, 240, 240);
                    doc.rect(20, currentY - 5, 80, 35);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(40, 40, 40);
                    doc.text('Bank Details', 25, currentY);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    doc.setTextColor(80, 80, 80);
                    bankLines = [];
                    if (bankPay.bankName)
                        bankLines.push("Bank: " + bankPay.bankName);
                    if (bankPay.branch)
                        bankLines.push("Branch: " + bankPay.branch);
                    if (bankPay.accountNumber)
                        bankLines.push("Account: " + bankPay.accountNumber);
                    if (bankPay.accountName)
                        bankLines.push("Name: " + bankPay.accountName);
                    if (bankLines.length)
                        doc.text(bankLines, 25, currentY + 6);
                    // M-Pesa Box
                    doc.setDrawColor(240, 240, 240);
                    doc.rect(110, currentY - 5, 80, 35);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(40, 40, 40);
                    doc.text('M-Pesa Payment', 115, currentY);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    doc.setTextColor(80, 80, 80);
                    mpesaLines = [];
                    if (mpesaPay.paybillNumber)
                        mpesaLines.push("Paybill: " + mpesaPay.paybillNumber);
                    if (mpesaPay.accountNumber)
                        mpesaLines.push("Account: " + mpesaPay.accountNumber);
                    if (mpesaLines.length)
                        doc.text(mpesaLines, 115, currentY + 6);
                    currentY += 40;
                    // ========== NOTES & TERMS ==========
                    if (invoice.notes) {
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(10);
                        doc.setTextColor(40, 40, 40);
                        doc.text('Notes:', 20, currentY);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(9);
                        doc.setTextColor(80, 80, 80);
                        notesLines = doc.splitTextToSize(invoice.notes, 170);
                        doc.text(notesLines, 20, currentY + 5);
                        currentY += 5 + (notesLines.length * 4);
                    }
                    // Terms & Conditions
                    currentY += 5;
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(40, 40, 40);
                    doc.text('Terms & Conditions:', 20, currentY);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(80, 80, 80);
                    defaultTerms = invoice.terms || invSettings.termsAndConditions || "1. All prices are in Kenya Shillings (KES)\n2. VAT charged where applicable\n3. Invoice valid for 7 days from date of generation\n4. Late payment may result in suspension of services";
                    termsLines = doc.splitTextToSize(defaultTerms, 170);
                    doc.text(termsLines, 20, currentY + 5);
                    footerY = doc.internal.pageSize.height - 10;
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(8);
                    doc.setTextColor(120, 120, 120);
                    doc.text("This is a system generated invoice. For inquiries, contact " + (company.email || ''), doc.internal.pageSize.width / 2, footerY, { align: 'center' });
                    pdfOutput = doc.output('arraybuffer');
                    return [2 /*return*/, Buffer.from(pdfOutput)];
            }
        });
    });
}
exports.generateInvoicePDF = generateInvoicePDF;
