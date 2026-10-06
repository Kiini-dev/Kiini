"use strict";
/**
 * Auto-Numbering Utility
 *
 * Provides functions to generate auto-numbered document identifiers
 * for invoices, estimates, receipts, expenses, etc.
 */
exports.__esModule = true;
exports.formatDocumentNumber = exports.formatAmountFromStorage = exports.formatAmountForStorage = exports.AUTO_NUMBER_PRESETS = exports.getNextSequenceNumber = exports.generateAutoNumber = void 0;
/**
 * Generate auto-numbered identifier
 *
 * @example
 * // Simple: "INV-000001"
 * generateAutoNumber({ prefix: "INV" }, 1)
 *
 * // With year: "INV-2026-000001"
 * generateAutoNumber({ prefix: "INV", includeYear: true }, 1)
 *
 * // With year/month: "INV-202603-000001"
 * generateAutoNumber({ prefix: "INV", includeYear: true, includeMonth: true }, 1)
 */
function generateAutoNumber(config, sequenceNumber) {
    var prefix = config.prefix, _a = config.padLength, padLength = _a === void 0 ? 6 : _a, _b = config.separatorChar, separatorChar = _b === void 0 ? "-" : _b, _c = config.includeYear, includeYear = _c === void 0 ? false : _c, _d = config.includeMonth, includeMonth = _d === void 0 ? false : _d;
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var number = prefix;
    if (includeYear) {
        number += separatorChar + year;
    }
    if (includeMonth) {
        if (!includeYear) {
            number += separatorChar + (year.toString().slice(-2) + month);
        }
        else {
            number += separatorChar + month;
        }
    }
    // Pad the sequence number
    var paddedSequence = String(sequenceNumber).padStart(padLength, "0");
    number += separatorChar + paddedSequence;
    return number;
}
exports.generateAutoNumber = generateAutoNumber;
/**
 * Get next number in sequence
 * Useful for getting the next invoice/receipt number
 */
function getNextSequenceNumber(lastNumber, config) {
    if (!lastNumber)
        return 1;
    // Extract the numeric part from the end
    var match = lastNumber.match(/(\d+)$/);
    if (match) {
        return parseInt(match[1]) + 1;
    }
    return 1;
}
exports.getNextSequenceNumber = getNextSequenceNumber;
/**
 * Configuration presets for common document types
 */
exports.AUTO_NUMBER_PRESETS = {
    // Accounting
    invoice: {
        prefix: "INV",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    },
    receipt: {
        prefix: "RCP",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    },
    estimate: {
        prefix: "EST",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    },
    creditNote: {
        prefix: "CN",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    },
    debitNote: {
        prefix: "DN",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    },
    expenseClaim: {
        prefix: "EXP",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    },
    serviceInvoice: {
        prefix: "SRV",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    },
    // HR
    ticket: {
        prefix: "TKT",
        padLength: 6,
        separatorChar: "-",
        includeYear: false,
        includeMonth: false
    },
    payroll: {
        prefix: "PAY",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    },
    // Projects
    project: {
        prefix: "PRJ",
        padLength: 5,
        separatorChar: "-",
        includeYear: false,
        includeMonth: false
    },
    workOrder: {
        prefix: "WO",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: false
    },
    // Procurement
    purchaseOrder: {
        prefix: "PO",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    },
    // Opportunities
    opportunity: {
        prefix: "OPP",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: false
    },
    // Communication/Lifecycle
    quote: {
        prefix: "QT",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    },
    proposal: {
        prefix: "PROP",
        padLength: 5,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    },
    // Banking
    reconciliationBatch: {
        prefix: "REC",
        padLength: 6,
        separatorChar: "-",
        includeYear: true,
        includeMonth: true
    }
};
/**
 * Format a number for database storage (multiply by 100 for cents)
 */
function formatAmountForStorage(amount) {
    return Math.round(amount * 100);
}
exports.formatAmountForStorage = formatAmountForStorage;
/**
 * Format a number from database storage (divide by 100)
 */
function formatAmountFromStorage(amount) {
    return Math.round((amount / 100) * 100) / 100;
}
exports.formatAmountFromStorage = formatAmountFromStorage;
/**
 * Hook to generate auto-numbered identifiers for documents
 * Usage in React components:
 *
 * const invoiceNumber = useAutoNumber("invoice", 1);
 * // Returns: "INV-2026-03-000001"
 */
function formatDocumentNumber(type, sequence) {
    var config = exports.AUTO_NUMBER_PRESETS[type];
    if (!config) {
        console.warn("Unknown document type: " + type);
        return "" + sequence;
    }
    return generateAutoNumber(config, sequence);
}
exports.formatDocumentNumber = formatDocumentNumber;
