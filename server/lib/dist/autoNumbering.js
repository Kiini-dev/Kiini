"use strict";
/**
 * Auto-numbering generator for various document types
 * Provides sequential numbering with proper formatting and prefixes
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
exports.formatDocumentNumber = exports.getDocumentTypes = exports.generateNextNumber = void 0;
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
var schema_extended_1 = require("../../drizzle/schema-extended");
var AUTO_NUMBER_CONFIGS = {
    'debit-notes': {
        prefix: 'DN',
        table: schema_1.debitNotes,
        field: 'debitNoteNumber',
        format: 'sequential',
        length: 6
    },
    'credit-notes': {
        prefix: 'CN',
        table: schema_1.creditNotes,
        field: 'creditNoteNumber',
        format: 'sequential',
        length: 6
    },
    'suppliers': {
        prefix: 'SUP',
        table: schema_extended_1.suppliers,
        field: 'supplierNumber',
        format: 'sequential',
        length: 6
    },
    'products': {
        prefix: 'PRD',
        table: schema_1.products,
        field: 'sku',
        format: 'sequential',
        length: 6
    },
    'services': {
        prefix: 'SVC',
        table: schema_1.services,
        field: 'serviceCode',
        format: 'sequential',
        length: 6
    },
    'purchase-orders': {
        prefix: 'PO',
        table: schema_extended_1.lpos,
        field: 'lpoNumber',
        format: 'year-month',
        length: 6,
        separator: '/'
    },
    'imprest': {
        prefix: 'IMP',
        table: schema_extended_1.imprests,
        field: 'imprestNumber',
        format: 'sequential',
        length: 6
    },
    'delivery-notes': {
        prefix: 'DN',
        table: schema_1.deliveryNotes,
        field: 'deliveryNoteNumber',
        format: 'year-month',
        length: 6,
        separator: '/'
    },
    'grn': {
        prefix: 'GRN',
        table: schema_1.grnRecords,
        field: 'grnNumber',
        format: 'sequential',
        length: 6
    },
    'work-orders': {
        prefix: 'WO',
        table: schema_1.workOrders,
        field: 'workOrderNumber',
        format: 'year-month',
        length: 6,
        separator: '/'
    },
    'departments': {
        prefix: 'DEPT',
        table: schema_1.departments,
        field: 'departmentCode',
        format: 'sequential',
        length: 4
    },
    'tickets': {
        prefix: 'TKT',
        table: schema_1.tickets,
        field: 'ticketNumber',
        format: 'sequential',
        length: 6
    },
    'quotations': {
        prefix: 'QT',
        table: schema_1.quotations,
        field: 'quotationNumber',
        format: 'year-month',
        length: 6,
        separator: '/'
    },
    'proposals': {
        prefix: 'PROP',
        table: schema_1.proposals,
        field: 'proposalNumber',
        format: 'sequential',
        length: 6
    },
    'contracts': {
        prefix: 'CNT',
        table: schema_1.contracts,
        field: 'contractNumber',
        format: 'sequential',
        length: 6
    },
    'warranties': {
        prefix: 'WAR',
        table: schema_1.warranties,
        field: 'warrantyNumber',
        format: 'sequential',
        length: 6
    },
    'service-invoices': {
        prefix: 'SI',
        table: schema_1.serviceInvoices,
        field: 'serviceInvoiceNumber',
        format: 'year-month',
        length: 6,
        separator: '/'
    },
    'invoices': {
        prefix: 'INV',
        table: schema_1.invoices,
        field: 'invoiceNumber',
        format: 'year-month',
        length: 6,
        separator: '/'
    },
    'estimates': {
        prefix: 'EST',
        table: schema_1.estimates,
        field: 'estimateNumber',
        format: 'sequential',
        length: 6
    },
    'expenses': {
        prefix: 'EXP',
        table: schema_1.expenses,
        field: 'expenseNumber',
        format: 'sequential',
        length: 6
    }
};
/**
 * Generate next number for a document type
 */
function generateNextNumber(documentType, customConfig) {
    return __awaiter(this, void 0, Promise, function () {
        var database, config, lastDoc, lastNumber, sequence, match, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database) {
                        throw new Error("Database not available");
                    }
                    config = __assign(__assign({}, AUTO_NUMBER_CONFIGS[documentType]), customConfig);
                    if (!config || !config.table) {
                        throw new Error("Unknown document type: " + documentType);
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, database
                            .select({ number: config.table[config.field] })
                            .from(config.table)
                            .orderBy(drizzle_orm_1.desc(config.table[config.field]))
                            .limit(1)];
                case 3:
                    lastDoc = _a.sent();
                    if (!lastDoc || !lastDoc.length) {
                        // First document
                        return [2 /*return*/, formatNumber(config.prefix, 1, config)];
                    }
                    lastNumber = lastDoc[0].number;
                    if (!lastNumber) {
                        return [2 /*return*/, formatNumber(config.prefix, 1, config)];
                    }
                    sequence = 1;
                    match = lastNumber.match(/(\d+)(?:$|[\D])/);
                    if (match) {
                        sequence = parseInt(match[1]) + 1;
                    }
                    return [2 /*return*/, formatNumber(config.prefix, sequence, config)];
                case 4:
                    error_1 = _a.sent();
                    console.warn("Error generating " + documentType + " number:", error_1);
                    // Fallback to timestamp-based number
                    return [2 /*return*/, config.prefix + "-" + Date.now()];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.generateNextNumber = generateNextNumber;
/**
 * Format number according to configuration
 */
function formatNumber(prefix, sequence, config) {
    var length = config.length || 6;
    var paddedSequence = String(sequence).padStart(length, '0');
    var separator = config.separator || '-';
    switch (config.format) {
        case 'year-month': {
            var now = new Date();
            var year = String(now.getFullYear()).slice(-2); // YY
            var month = String(now.getMonth() + 1).padStart(2, '0'); // MM
            return "" + prefix + separator + year + month + separator + paddedSequence;
        }
        case 'year': {
            var year = new Date().getFullYear();
            return "" + prefix + separator + year + separator + paddedSequence;
        }
        case 'custom':
        case 'sequential':
        default:
            return prefix + "-" + paddedSequence;
    }
}
/**
 * Get document type list for dropdown/selection
 */
function getDocumentTypes() {
    return Object.keys(AUTO_NUMBER_CONFIGS).sort();
}
exports.getDocumentTypes = getDocumentTypes;
/**
 * Format a number according to a document type's configuration
 */
function formatDocumentNumber(documentType, sequence) {
    var config = AUTO_NUMBER_CONFIGS[documentType];
    if (!config) {
        throw new Error("Unknown document type: " + documentType);
    }
    return formatNumber(config.prefix, sequence, config);
}
exports.formatDocumentNumber = formatDocumentNumber;
