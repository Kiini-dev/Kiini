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
exports.generateNextDocumentNumber = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
// Default prefixes — overridden by settings
var DEFAULT_PREFIXES = {
    invoice: "INV",
    estimate: "EST",
    expense: "EXP",
    receipt: "REC",
    proposal: "PROP",
    payment: "PAY"
};
// Settings key names (match Settings.tsx document numbering keys)
var PREFIX_SETTING_KEYS = {
    invoice: "invoicePrefix",
    estimate: "estimatePrefix",
    expense: "expensePrefix",
    receipt: "receiptPrefix",
    proposal: "proposalPrefix",
    payment: "paymentPrefix"
};
/**
 * Helper function to generate next document number in format PREFIX-000000
 * Reads custom prefix from settings table, falls back to defaults
 */
function generateNextDocumentNumber(db, documentType) {
    return __awaiter(this, void 0, Promise, function () {
        var prefix, settingKey, rows, _a, tableConfig, config, result, maxSequence, match, nextSequence, err_1, p;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    prefix = DEFAULT_PREFIXES[documentType] || "DOC";
                    settingKey = PREFIX_SETTING_KEYS[documentType];
                    if (!settingKey) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db.select().from(schema_1.settings)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.settings.category, "numbering"), drizzle_orm_1.eq(schema_1.settings.key, settingKey)))
                            .limit(1)];
                case 2:
                    rows = _b.sent();
                    if (rows.length > 0 && rows[0].value) {
                        prefix = rows[0].value;
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4:
                    tableConfig = {
                        invoice: { table: schema_1.invoices, field: schema_1.invoices.invoiceNumber },
                        estimate: { table: schema_1.estimates, field: schema_1.estimates.estimateNumber },
                        expense: { table: schema_1.expenses, field: schema_1.expenses.expenseNumber },
                        receipt: { table: schema_1.receipts, field: schema_1.receipts.receiptNumber },
                        proposal: { table: schema_1.proposals, field: schema_1.proposals.proposalNumber },
                        payment: { table: schema_1.payments, field: schema_1.payments.referenceNumber }
                    };
                    config = tableConfig[documentType];
                    if (!config)
                        throw new Error("Unknown document type: " + documentType);
                    return [4 /*yield*/, db
                            .select({ docNum: config.field })
                            .from(config.table)
                            .orderBy(drizzle_orm_1.desc(config.field))
                            .limit(1)];
                case 5:
                    result = _b.sent();
                    maxSequence = 0;
                    if (result && result.length > 0 && result[0].docNum) {
                        match = result[0].docNum.match(/(\d+)$/);
                        if (match) {
                            maxSequence = parseInt(match[1]);
                        }
                    }
                    nextSequence = maxSequence + 1;
                    return [2 /*return*/, prefix + "-" + String(nextSequence).padStart(6, "0")];
                case 6:
                    err_1 = _b.sent();
                    console.warn("Error generating " + documentType + " number, using default:", err_1);
                    p = DEFAULT_PREFIXES[documentType] || "DOC";
                    return [2 /*return*/, p + "-000001"];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.generateNextDocumentNumber = generateNextDocumentNumber;
