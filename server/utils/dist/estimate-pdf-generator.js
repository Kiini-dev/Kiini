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
exports.generateEstimatePDF = void 0;
var jspdf_1 = require("jspdf");
var jspdf_autotable_1 = require("jspdf-autotable");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var company_info_1 = require("./company-info");
/**
 * Generate an estimate PDF buffer
 * @param estimateId - The ID of the estimate to generate
 * @returns Buffer containing the PDF data
 */
function generateEstimatePDF(estimateId) {
    return __awaiter(this, void 0, Promise, function () {
        var db, estimateData, estimate, clientData, client, items, doc, companyInfo, validUntilText, tableData, finalY, totalsStartY, totalY, notesY, splitNotes, defaultEstimateTerms, termsY, termsToUse, splitTerms, footerY, pdfOutput;
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
                            .from(schema_1.estimates)
                            .where(drizzle_orm_1.eq(schema_1.estimates.id, estimateId))
                            .limit(1)];
                case 2:
                    estimateData = _a.sent();
                    if (!estimateData || estimateData.length === 0) {
                        throw new Error("Estimate with ID " + estimateId + " not found");
                    }
                    estimate = estimateData[0];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.clients)
                            .where(drizzle_orm_1.eq(schema_1.clients.id, estimate.clientId))
                            .limit(1)];
                case 3:
                    clientData = _a.sent();
                    client = clientData && clientData.length > 0 ? clientData[0] : null;
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.estimateItems)
                            .where(drizzle_orm_1.eq(schema_1.estimateItems.estimateId, estimateId))];
                case 4:
                    items = _a.sent();
                    doc = new jspdf_1["default"]();
                    // Set font
                    doc.setFont('helvetica');
                    return [4 /*yield*/, company_info_1.getCompanyInfo()];
                case 5:
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
                    // Add ESTIMATE title and number on the right
                    doc.setFontSize(24);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text('ESTIMATE', 200, 20, { align: 'right' });
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
                    doc.text(estimate.estimateNumber, 200, 28, { align: 'right' });
                    // Add estimate details
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text("Estimate Number: " + estimate.estimateNumber, 20, 50);
                    doc.text("Issue Date: " + new Date(estimate.issueDate).toLocaleDateString(), 20, 57);
                    validUntilText = estimate.expiryDate ? new Date(estimate.expiryDate).toLocaleDateString() : 'N/A';
                    doc.text("Valid Until: " + validUntilText, 20, 64);
                    doc.text("Status: " + estimate.status.toUpperCase(), 20, 71);
                    // Add client information
                    doc.setFontSize(12);
                    doc.setTextColor(40, 40, 40);
                    doc.text('Prepared For:', 20, 85);
                    doc.setFontSize(10);
                    doc.setTextColor(60, 60, 60);
                    if (client) {
                        doc.text(client.companyName || 'N/A', 20, 92);
                        if (client.contactPerson)
                            doc.text(client.contactPerson, 20, 99);
                        if (client.email)
                            doc.text(client.email, 20, 106);
                        if (client.phone)
                            doc.text(client.phone, 20, 113);
                        if (client.address)
                            doc.text(client.address, 20, 120);
                    }
                    else {
                        doc.text('Client information not available', 20, 92);
                    }
                    tableData = items.map(function (item) { return [
                        item.description || '',
                        item.quantity.toString(),
                        "KES " + (item.unitPrice / 100).toFixed(2),
                        (item.taxRate || 0) + "%",
                        (item.discountPercent || 0) + "%",
                        "KES " + (item.total / 100).toFixed(2),
                    ]; });
                    jspdf_autotable_1["default"](doc, {
                        startY: 135,
                        head: [['Description', 'Qty', 'Unit Price', 'Tax', 'Discount', 'Total']],
                        body: tableData,
                        theme: 'striped',
                        headStyles: {
                            fillColor: [66, 66, 66],
                            textColor: [255, 255, 255],
                            fontStyle: 'bold'
                        },
                        styles: {
                            fontSize: 9,
                            cellPadding: 5
                        },
                        columnStyles: {
                            0: { cellWidth: 60 },
                            1: { cellWidth: 20, halign: 'center' },
                            2: { cellWidth: 30, halign: 'right' },
                            3: { cellWidth: 20, halign: 'center' },
                            4: { cellWidth: 25, halign: 'center' },
                            5: { cellWidth: 35, halign: 'right' }
                        }
                    });
                    finalY = doc.lastAutoTable.finalY || 135;
                    totalsStartY = finalY + 10;
                    doc.setFontSize(10);
                    doc.setTextColor(60, 60, 60);
                    doc.text('Subtotal:', 130, totalsStartY);
                    doc.text("KES " + (estimate.subtotal / 100).toFixed(2), 170, totalsStartY, { align: 'right' });
                    if (estimate.taxAmount && estimate.taxAmount > 0) {
                        doc.text('Tax:', 130, totalsStartY + 7);
                        doc.text("KES " + (estimate.taxAmount / 100).toFixed(2), 170, totalsStartY + 7, { align: 'right' });
                    }
                    if (estimate.discountAmount && estimate.discountAmount > 0) {
                        doc.text('Discount:', 130, totalsStartY + 14);
                        doc.text("-KES " + (estimate.discountAmount / 100).toFixed(2), 170, totalsStartY + 14, { align: 'right' });
                    }
                    // Total line
                    doc.setFontSize(12);
                    doc.setTextColor(40, 40, 40);
                    doc.setFont('helvetica', 'bold');
                    totalY = estimate.taxAmount || estimate.discountAmount ? totalsStartY + 21 : totalsStartY + 7;
                    doc.text('Total:', 130, totalY);
                    doc.text("KES " + (estimate.total / 100).toFixed(2), 170, totalY, { align: 'right' });
                    // Add notes if available
                    if (estimate.notes) {
                        notesY = totalY + 15;
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(10);
                        doc.setTextColor(40, 40, 40);
                        doc.text('Notes:', 20, notesY);
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(60, 60, 60);
                        splitNotes = doc.splitTextToSize(estimate.notes, 170);
                        doc.text(splitNotes, 20, notesY + 7);
                    }
                    defaultEstimateTerms = "1. All prices are in Kenya shillings (KSHs)\n2. VAT is charged where applicable.\n3. Quotation is valid for 45 days from date of generation.\n4. Payment of 75% is expected before commencement of the project.";
                    termsY = totalY + 30 + (estimate.notes ? 15 : 0);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(40, 40, 40);
                    doc.text('Terms & Conditions:', 20, termsY);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    doc.setTextColor(60, 60, 60);
                    termsToUse = estimate.terms || defaultEstimateTerms;
                    splitTerms = doc.splitTextToSize(termsToUse, 170);
                    doc.text(splitTerms, 20, termsY + 7);
                    footerY = doc.internal.pageSize.height - 15;
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text("This is a system generated estimate and is digitally signed under " + companyInfo.name + ".", doc.internal.pageSize.width / 2, footerY, { align: 'center' });
                    pdfOutput = doc.output('arraybuffer');
                    return [2 /*return*/, Buffer.from(pdfOutput)];
            }
        });
    });
}
exports.generateEstimatePDF = generateEstimatePDF;
