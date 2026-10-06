"use strict";
/**
 * Automatic Document Numbering Utility
 * Generates sequential numbers for all document types using a unified format
 */
exports.__esModule = true;
exports.getNextSequenceNumber = exports.extractDateFromNumber = exports.extractSequenceNumber = exports.generateDocumentNumber = exports.DOCUMENT_PREFIXES = void 0;
exports.DOCUMENT_PREFIXES = {
    debitNote: "DN",
    creditNote: "CN",
    supplier: "SUP",
    product: "PRD",
    service: "SRV",
    subscription: "SUB",
    purchaseOrder: "PO",
    order: "ORD",
    imprest: "IMP",
    deliveryNote: "DN",
    grn: "GRN",
    stock: "STK",
    asset: "AST",
    serviceInvoice: "SI",
    proposal: "PROP",
    quotation: "QT",
    contract: "CON",
    warranty: "WAR",
    workOrder: "WO",
    department: "DEPT",
    ticket: "TKT",
    receipt: "REC",
    invoice: "INV"
};
/**
 * Generate a formatted document number
 * Format: PREFIX-YYMMDD-SEQUENCE
 * Example: INV-260429-001
 */
exports.generateDocumentNumber = function (documentType, sequenceNumber, date) {
    if (date === void 0) { date = new Date(); }
    var prefix = exports.DOCUMENT_PREFIXES[documentType];
    var year = String(date.getFullYear()).slice(-2); // Last 2 digits
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    var sequence = String(sequenceNumber).padStart(3, "0");
    return prefix + "-" + year + month + day + "-" + sequence;
};
/**
 * Extract sequence number from a formatted document number
 * From "INV-260429-001" extracts 1
 */
exports.extractSequenceNumber = function (documentNumber) {
    var match = documentNumber.match(/-(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
};
/**
 * Extract date from a formatted document number
 * From "INV-260429-001" extracts 2026-04-29
 */
exports.extractDateFromNumber = function (documentNumber) {
    var match = documentNumber.match(/-(\d{6})-/);
    if (!match)
        return null;
    var dateStr = match[1];
    var year = parseInt("20" + dateStr.slice(0, 2), 10);
    var month = parseInt(dateStr.slice(2, 4), 10) - 1; // Month is 0-indexed
    var day = parseInt(dateStr.slice(4, 6), 10);
    return new Date(year, month, day);
};
/**
 * Get the next sequence number for a document type based on existing numbers
 */
exports.getNextSequenceNumber = function (existingNumbers, documentType, date) {
    if (date === void 0) { date = new Date(); }
    var dateStr = "" + String(date.getFullYear()).slice(-2) + String(date.getMonth() + 1).padStart(2, "0") + String(date.getDate()).padStart(2, "0");
    // Filter numbers for today's date
    var todaysNumbers = existingNumbers.filter(function (num) {
        var dateMatch = num.match(/-(\d{6})-/);
        return dateMatch && dateMatch[1] === dateStr;
    });
    // Get the highest sequence number for today
    var maxSequence = 0;
    for (var _i = 0, todaysNumbers_1 = todaysNumbers; _i < todaysNumbers_1.length; _i++) {
        var num = todaysNumbers_1[_i];
        var sequence = exports.extractSequenceNumber(num);
        if (sequence > maxSequence) {
            maxSequence = sequence;
        }
    }
    return maxSequence + 1;
};
