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
exports.generateReceiptPDF = void 0;
var jspdf_1 = require("jspdf");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var company_info_1 = require("./company-info");
/**
 * Generate a receipt PDF buffer
 * @param receiptId - The ID of the receipt to generate
 * @returns Buffer containing the PDF data
 */
function generateReceiptPDF(receiptId) {
    return __awaiter(this, void 0, Promise, function () {
        var db, receiptData, receipt, client, clientData, payment, paymentData, doc, companyInfo, boxStartY, descriptionText, notesY, splitNotes, thankYouY, footerY, pdfOutput;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error('Database connection not available');
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.receipts)
                            .where(drizzle_orm_1.eq(schema_1.receipts.id, receiptId))
                            .limit(1)];
                case 2:
                    receiptData = _a.sent();
                    if (!receiptData || receiptData.length === 0) {
                        throw new Error("Receipt with ID " + receiptId + " not found");
                    }
                    receipt = receiptData[0];
                    client = null;
                    if (!receipt.clientId) return [3 /*break*/, 4];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.clients)
                            .where(drizzle_orm_1.eq(schema_1.clients.id, receipt.clientId))
                            .limit(1)];
                case 3:
                    clientData = _a.sent();
                    client = clientData && clientData.length > 0 ? clientData[0] : null;
                    _a.label = 4;
                case 4:
                    payment = null;
                    if (!receipt.paymentId) return [3 /*break*/, 6];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.payments)
                            .where(drizzle_orm_1.eq(schema_1.payments.id, receipt.paymentId))
                            .limit(1)];
                case 5:
                    paymentData = _a.sent();
                    payment = paymentData && paymentData.length > 0 ? paymentData[0] : null;
                    _a.label = 6;
                case 6:
                    doc = new jspdf_1["default"]();
                    // Set font
                    doc.setFont('helvetica');
                    return [4 /*yield*/, company_info_1.getCompanyInfo()];
                case 7:
                    companyInfo = _a.sent();
                    // Add company header with logo placeholder and contact details
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text(companyInfo.name, 20, 20);
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(60, 60, 60);
                    if (companyInfo.email)
                        doc.text("Email: " + companyInfo.email, 20, 27);
                    if (companyInfo.phone)
                        doc.text("Phone: " + companyInfo.phone, 20, 32);
                    if (companyInfo.address)
                        doc.text("Address: " + companyInfo.address, 20, 37);
                    // Add RECEIPT title and number on the right
                    doc.setFontSize(24);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text('RECEIPT', 200, 20, { align: 'right' });
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
                    doc.text(receipt.receiptNumber, 200, 28, { align: 'right' });
                    // Add receipt details
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text("Receipt Number: " + receipt.receiptNumber, 20, 55);
                    doc.text("Date: " + new Date(receipt.receiptDate).toLocaleDateString(), 20, 62);
                    doc.text("Payment Method: " + (receipt.paymentMethod || 'N/A'), 20, 69);
                    // Add client information if available
                    if (client) {
                        doc.setFontSize(12);
                        doc.setTextColor(40, 40, 40);
                        doc.text('Received From:', 20, 85);
                        doc.setFontSize(10);
                        doc.setTextColor(60, 60, 60);
                        doc.text(client.companyName || 'N/A', 20, 92);
                        if (client.contactPerson)
                            doc.text(client.contactPerson, 20, 99);
                        if (client.email)
                            doc.text(client.email, 20, 106);
                        if (client.phone)
                            doc.text(client.phone, 20, 113);
                    }
                    boxStartY = 130;
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.5);
                    doc.rect(20, boxStartY, 170, 40);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text('Payment Details', 25, boxStartY + 10);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(60, 60, 60);
                    descriptionText = (payment && payment.notes) || receipt.notes || 'Payment received';
                    doc.text("Description: " + descriptionText, 25, boxStartY + 20);
                    // Amount in large text
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text("Amount: KES " + (receipt.amount / 100).toFixed(2), 25, boxStartY + 32);
                    // Add notes if available
                    if (receipt.notes) {
                        notesY = boxStartY + 55;
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(10);
                        doc.setTextColor(40, 40, 40);
                        doc.text('Notes:', 20, notesY);
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(60, 60, 60);
                        splitNotes = doc.splitTextToSize(receipt.notes, 170);
                        doc.text(splitNotes, 20, notesY + 7);
                    }
                    thankYouY = boxStartY + (receipt.notes ? 80 : 60);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(12);
                    doc.setTextColor(40, 40, 40);
                    doc.text('Thank you for your business.', doc.internal.pageSize.width / 2, thankYouY, { align: 'center' });
                    footerY = doc.internal.pageSize.height - 15;
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text("This is a system generated receipt from " + companyInfo.name + ".", doc.internal.pageSize.width / 2, footerY, { align: 'center' });
                    pdfOutput = doc.output('arraybuffer');
                    return [2 /*return*/, Buffer.from(pdfOutput)];
            }
        });
    });
}
exports.generateReceiptPDF = generateReceiptPDF;
