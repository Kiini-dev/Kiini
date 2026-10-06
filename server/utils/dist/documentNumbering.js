"use strict";
/**
 * Automatic Document Numbering Utility
 *
 * Provides centralized numbering system for all procurement and business documents
 * Ensures sequential, consistent numbering across the application
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.extractSequenceNumber = exports.getDocumentTypeFromNumber = exports.isValidDocumentNumber = exports.getNextDocumentNumbers = exports.getNextDocumentNumber = void 0;
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var NUMBERING_CONFIG = {
    lpo: { prefix: "LPO", table: schema_1.lpos, field: "lpoNumber", padding: 6 },
    purchase_order: { prefix: "PO", table: schema_1.orders, field: "orderNumber", padding: 6 },
    imprest: { prefix: "IMP", table: schema_1.imprests, field: "imprestNumber", padding: 6 },
    imprest_surrender: { prefix: "IMPS", table: schema_1.imprestSurrender, field: "surrenderNumber", padding: 6 },
    receipt: { prefix: "REC", table: schema_1.receipts, field: "receiptNumber", padding: 6 },
    invoice: { prefix: "INV", table: schema_1.invoices, field: "invoiceNumber", padding: 6 },
    estimate: { prefix: "EST", table: schema_1.estimates, field: "estimateNumber", padding: 6 },
    payment: { prefix: "PAY", table: schema_1.payments, field: "paymentNumber", padding: 6 },
    expense: { prefix: "EXP", table: schema_1.expenses, field: "expenseNumber", padding: 6 },
    supplier: { prefix: "SUP", table: schema_extended_1.suppliers, field: "supplierNumber", padding: 4 },
    // Additional document types (table references to be added as needed)
    debit_note: { prefix: "DN", table: null, field: "debitNoteNumber", padding: 6 },
    credit_note: { prefix: "CN", table: null, field: "creditNoteNumber", padding: 6 },
    quotation: { prefix: "QT", table: null, field: "quotationNumber", padding: 6 },
    proposal: { prefix: "PROP", table: null, field: "proposalNumber", padding: 6 },
    order: { prefix: "ORD", table: null, field: "orderNumber", padding: 6 },
    service_invoice: { prefix: "SI", table: null, field: "serviceInvoiceNumber", padding: 6 },
    work_order: { prefix: "WO", table: null, field: "workOrderNumber", padding: 6 },
    grn: { prefix: "GRN", table: null, field: "grnNumber", padding: 6 },
    delivery_note: { prefix: "DN", table: null, field: "deliveryNoteNumber", padding: 6 },
    payslip: { prefix: "PS", table: null, field: "payslipNumber", padding: 6 },
    contract: { prefix: "CNT", table: null, field: "contractNumber", padding: 6 },
    warranty: { prefix: "WRT", table: null, field: "warrantyNumber", padding: 6 },
    ticket: { prefix: "TKT", table: null, field: "ticketNumber", padding: 6 },
    product: { prefix: "PROD", table: null, field: "productNumber", padding: 5 },
    service: { prefix: "SRV", table: null, field: "serviceNumber", padding: 5 },
    subscription: { prefix: "SUB", table: null, field: "subscriptionNumber", padding: 6 },
    department: { prefix: "DEPT", table: null, field: "departmentNumber", padding: 4 }
};
/**
 * Generate next document number with automatic sequencing
 * Example: "LPO-000001", "INV-000042", etc.
 */
function getNextDocumentNumber(documentType) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var config, database, lastDoc, lastNumber, match, num, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    config = NUMBERING_CONFIG[documentType];
                    if (!config) {
                        throw new Error("Unknown document type: " + documentType);
                    }
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _b.sent();
                    if (!database) {
                        // Fallback: return with timestamp if DB unavailable
                        return [2 /*return*/, config.prefix + "-" + Date.now().toString().slice(-6)];
                    }
                    return [4 /*yield*/, database
                            .select()
                            .from(config.table)
                            .orderBy(drizzle_orm_1.desc(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["created_at"], ["created_at"])))))
                            .limit(1)];
                case 2:
                    lastDoc = _b.sent();
                    if (!lastDoc.length) {
                        // First document
                        return [2 /*return*/, config.prefix + "-" + String(1).padStart(config.padding, "0")];
                    }
                    lastNumber = lastDoc[0][config.field];
                    match = lastNumber === null || lastNumber === void 0 ? void 0 : lastNumber.match(new RegExp(config.prefix + "-(\\d+)"));
                    if (match) {
                        num = parseInt(match[1], 10) + 1;
                        return [2 /*return*/, config.prefix + "-" + String(num).padStart(config.padding, "0")];
                    }
                    // Fallback if pattern doesn't match
                    return [2 /*return*/, config.prefix + "-" + String(lastDoc.length + 1).padStart(config.padding, "0")];
                case 3:
                    error_1 = _b.sent();
                    console.error("Error generating " + documentType + " number:", error_1);
                    // Fallback: use timestamp-based number
                    return [2 /*return*/, (((_a = NUMBERING_CONFIG[documentType]) === null || _a === void 0 ? void 0 : _a.prefix) || "DOC") + "-" + Date.now().toString().slice(-6)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getNextDocumentNumber = getNextDocumentNumber;
/**
 * Generate multiple document numbers at once
 * Useful for batch operations
 */
function getNextDocumentNumbers(documentType, count) {
    return __awaiter(this, void 0, Promise, function () {
        var firstNumber, config_1, match, startNum_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getNextDocumentNumber(documentType)];
                case 1:
                    firstNumber = _a.sent();
                    config_1 = NUMBERING_CONFIG[documentType];
                    match = firstNumber.match(/(\d+)$/);
                    if (!match) {
                        // Fallback: generate based on timestamp
                        return [2 /*return*/, Array.from({ length: count }, function (_, i) {
                                return config_1.prefix + "-" + String(Date.now() + i).slice(-6);
                            })];
                    }
                    startNum_1 = parseInt(match[1], 10);
                    return [2 /*return*/, Array.from({ length: count }, function (_, i) {
                            return config_1.prefix + "-" + String(startNum_1 + i).padStart(config_1.padding, "0");
                        })];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error generating batch " + documentType + " numbers:", error_2);
                    return [2 /*return*/, Array.from({ length: count }, function (_, i) { var _a; return (((_a = NUMBERING_CONFIG[documentType]) === null || _a === void 0 ? void 0 : _a.prefix) || "DOC") + "-" + i; })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getNextDocumentNumbers = getNextDocumentNumbers;
/**
 * Validate if a document number follows the correct format
 */
function isValidDocumentNumber(documentType, number) {
    var config = NUMBERING_CONFIG[documentType];
    if (!config)
        return false;
    var pattern = new RegExp("^" + config.prefix + "-\\d{" + config.padding + "}$");
    return pattern.test(number);
}
exports.isValidDocumentNumber = isValidDocumentNumber;
/**
 * Get document type from document number
 */
function getDocumentTypeFromNumber(number) {
    for (var _i = 0, _a = Object.entries(NUMBERING_CONFIG); _i < _a.length; _i++) {
        var _b = _a[_i], type = _b[0], config = _b[1];
        if (number.startsWith(config.prefix)) {
            return type;
        }
    }
    return null;
}
exports.getDocumentTypeFromNumber = getDocumentTypeFromNumber;
/**
 * Extract numeric sequence from document number
 */
function extractSequenceNumber(number) {
    var match = number.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
}
exports.extractSequenceNumber = extractSequenceNumber;
var templateObject_1;
