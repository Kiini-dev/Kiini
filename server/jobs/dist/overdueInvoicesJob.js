"use strict";
/**
 * Scheduled Job: Mark Overdue Invoices
 *
 * This job runs daily to check for invoices past their due date
 * and automatically marks them as overdue. Also sends notifications
 * for newly overdue invoices.
 */
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
exports.markOverdueInvoices = void 0;
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
/**
 * Find and mark overdue invoices
 */
function markOverdueInvoices() {
    return __awaiter(this, void 0, Promise, function () {
        var db, errors, markedIds, now, nowStr, systemUserId, overdueInvoices, _i, overdueInvoices_1, invoice, err_1, error_1, errorMsg, success, message, error_2, errorMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        return [2 /*return*/, {
                                success: false,
                                invoicesMarked: 0,
                                invoiceIds: [],
                                errors: ["Database not available"],
                                message: "Failed: Database connection unavailable",
                                itemsProcessed: 0,
                                itemsFailed: 0
                            }];
                    }
                    errors = [];
                    markedIds = [];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 14, , 15]);
                    now = new Date();
                    nowStr = now.toISOString().replace('T', ' ').substring(0, 19);
                    systemUserId = "system-job";
                    return [4 /*yield*/, db.select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.lt(schema_1.invoices.dueDate, nowStr), drizzle_orm_1.inArray(schema_1.invoices.status, ['sent', 'partial'])))];
                case 3:
                    overdueInvoices = _a.sent();
                    console.log("[OVERDUE_INVOICES] Found " + overdueInvoices.length + " invoices to mark as overdue");
                    _i = 0, overdueInvoices_1 = overdueInvoices;
                    _a.label = 4;
                case 4:
                    if (!(_i < overdueInvoices_1.length)) return [3 /*break*/, 13];
                    invoice = overdueInvoices_1[_i];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 11, , 12]);
                    return [4 /*yield*/, db.update(schema_1.invoices)
                            .set({
                            status: 'overdue',
                            updatedAt: nowStr
                        })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoice.id))];
                case 6:
                    _a.sent();
                    markedIds.push(invoice.id);
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                            id: uuid_1.v4(),
                            userId: systemUserId,
                            action: "invoice_marked_overdue",
                            entityType: "invoice",
                            entityId: invoice.id,
                            description: "Invoice " + invoice.invoiceNumber + " automatically marked as overdue (due: " + invoice.dueDate + ")"
                        })];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    err_1 = _a.sent();
                    console.warn("[OVERDUE_INVOICES] Could not log activity:", err_1);
                    return [3 /*break*/, 10];
                case 10:
                    console.log("[OVERDUE_INVOICES] Marked invoice " + invoice.invoiceNumber + " as overdue");
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _a.sent();
                    errorMsg = "Error marking invoice " + invoice.id + " as overdue: " + (error_1 instanceof Error ? error_1.message : String(error_1));
                    console.error("[OVERDUE_INVOICES] " + errorMsg);
                    errors.push(errorMsg);
                    return [3 /*break*/, 12];
                case 12:
                    _i++;
                    return [3 /*break*/, 4];
                case 13:
                    success = errors.length === 0;
                    message = success
                        ? "Marked " + markedIds.length + " invoice(s) as overdue"
                        : "Marked " + markedIds.length + " invoice(s) with " + errors.length + " error(s)";
                    console.log("[OVERDUE_INVOICES] Job completed: " + message);
                    return [2 /*return*/, {
                            success: success,
                            invoicesMarked: markedIds.length,
                            invoiceIds: markedIds,
                            errors: errors,
                            message: message,
                            itemsProcessed: overdueInvoices.length,
                            itemsFailed: errors.length
                        }];
                case 14:
                    error_2 = _a.sent();
                    errorMsg = "Fatal error in overdue invoices job: " + (error_2 instanceof Error ? error_2.message : String(error_2));
                    console.error("[OVERDUE_INVOICES] " + errorMsg);
                    return [2 /*return*/, {
                            success: false,
                            invoicesMarked: 0,
                            invoiceIds: [],
                            errors: [errorMsg],
                            message: errorMsg,
                            itemsProcessed: 0,
                            itemsFailed: 1
                        }];
                case 15: return [2 /*return*/];
            }
        });
    });
}
exports.markOverdueInvoices = markOverdueInvoices;
