"use strict";
/**
 * Scheduled Job: Generate Due Recurring Invoices
 *
 * This job runs periodically to check for recurring invoices that are due
 * and automatically generates new invoices from them.
 *
 * Should be called at least once daily, preferably during off-peak hours
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.generateDueRecurringInvoices = void 0;
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var recurringLabels_1 = require("../utils/recurringLabels");
/**
 * Generate invoices for all due recurring patterns
 */
function generateDueRecurringInvoices() {
    return __awaiter(this, void 0, Promise, function () {
        // Helper to generate next invoice number
        function generateNextInvoiceNumber() {
            return __awaiter(this, void 0, Promise, function () {
                var result, maxSequence, _i, result_1, rec, match, seq, nextSequence, err_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, db.select({ invNum: schema_1.invoices.invoiceNumber })
                                    .from(schema_1.invoices)
                                    .orderBy(schema_1.invoices.invoiceNumber)
                                    .limit(1000)];
                        case 1:
                            result = _a.sent();
                            maxSequence = 0;
                            for (_i = 0, result_1 = result; _i < result_1.length; _i++) {
                                rec = result_1[_i];
                                if (rec.invNum) {
                                    match = rec.invNum.match(/(\d+)$/);
                                    if (match) {
                                        seq = parseInt(match[1]);
                                        if (seq > maxSequence)
                                            maxSequence = seq;
                                    }
                                }
                            }
                            nextSequence = maxSequence + 1;
                            return [2 /*return*/, "INV-" + String(nextSequence).padStart(6, '0')];
                        case 2:
                            err_3 = _a.sent();
                            console.warn("Error generating invoice number:", err_3);
                            return [2 /*return*/, "INV-" + Date.now()];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        var db, errors, generatedInvoiceIds, now, nowStr, systemUserId, duePatterns, _i, duePatterns_1, pattern, templateData, template, newInvoiceId, newInvoiceNumber, issueDate, dueDate, dueDateStr, baseTitle, baseNotes, _a, labeledTitle, labeledNotes, newInvoiceValues, templateItems, _b, templateItems_1, item, err_1, nextDueDate, frequencyDays, daysToAdd, err_2, error_1, errorMsg, success, message, error_2, errorMsg;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _c.sent();
                    if (!db) {
                        return [2 /*return*/, {
                                success: false,
                                invoicesGenerated: 0,
                                invoiceIds: [],
                                errors: ["Database not available"],
                                message: "Failed: Database connection unavailable"
                            }];
                    }
                    errors = [];
                    generatedInvoiceIds = [];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 28, , 29]);
                    now = new Date();
                    nowStr = now.toISOString().replace('T', ' ').substring(0, 19);
                    systemUserId = "system-job";
                    return [4 /*yield*/, db.select()
                            .from(schema_1.recurringInvoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.recurringInvoices.isActive, 1), drizzle_orm_1.lte(schema_1.recurringInvoices.nextDueDate, nowStr)))];
                case 3:
                    duePatterns = _c.sent();
                    console.log("[RECURRING_INVOICES] Found " + duePatterns.length + " due patterns to process");
                    _i = 0, duePatterns_1 = duePatterns;
                    _c.label = 4;
                case 4:
                    if (!(_i < duePatterns_1.length)) return [3 /*break*/, 27];
                    pattern = duePatterns_1[_i];
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 25, , 26]);
                    if (!(pattern.endDate && pattern.endDate < nowStr)) return [3 /*break*/, 7];
                    // Mark as inactive
                    return [4 /*yield*/, db.update(schema_1.recurringInvoices)
                            .set({ isActive: 0, updatedAt: nowStr })
                            .where(drizzle_orm_1.eq(schema_1.recurringInvoices.id, pattern.id))];
                case 6:
                    // Mark as inactive
                    _c.sent();
                    console.log("[RECURRING_INVOICES] Marked pattern " + pattern.id + " as inactive (ended)");
                    return [3 /*break*/, 26];
                case 7:
                    templateData = null;
                    if (!pattern.templateInvoiceId) return [3 /*break*/, 9];
                    return [4 /*yield*/, db.select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, pattern.templateInvoiceId))
                            .limit(1)];
                case 8:
                    template = _c.sent();
                    if (template.length > 0) {
                        templateData = template[0];
                    }
                    _c.label = 9;
                case 9:
                    newInvoiceId = uuid_1.v4();
                    return [4 /*yield*/, generateNextInvoiceNumber()];
                case 10:
                    newInvoiceNumber = _c.sent();
                    issueDate = now.toISOString().replace('T', ' ').substring(0, 19);
                    dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    dueDateStr = dueDate.toISOString().replace('T', ' ').substring(0, 19);
                    baseTitle = (templateData === null || templateData === void 0 ? void 0 : templateData.title) || "Invoice for " + pattern.clientId;
                    baseNotes = pattern.noteToInvoice || (templateData === null || templateData === void 0 ? void 0 : templateData.notes) || "";
                    _a = recurringLabels_1.applyRecurringLabel(baseTitle, baseNotes, pattern.noteToInvoice, now), labeledTitle = _a.title, labeledNotes = _a.notes;
                    newInvoiceValues = {
                        id: newInvoiceId,
                        invoiceNumber: newInvoiceNumber,
                        invoiceSequence: parseInt(newInvoiceNumber.replace('INV-', '')) || 0,
                        clientId: pattern.clientId,
                        title: labeledTitle,
                        status: "draft",
                        issueDate: issueDate,
                        dueDate: dueDateStr,
                        subtotal: (templateData === null || templateData === void 0 ? void 0 : templateData.subtotal) || 0,
                        taxAmount: (templateData === null || templateData === void 0 ? void 0 : templateData.taxAmount) || 0,
                        discountAmount: (templateData === null || templateData === void 0 ? void 0 : templateData.discountAmount) || 0,
                        total: (templateData === null || templateData === void 0 ? void 0 : templateData.total) || 0,
                        paidAmount: 0,
                        notes: labeledNotes,
                        terms: (templateData === null || templateData === void 0 ? void 0 : templateData.terms) || null,
                        createdBy: systemUserId,
                        createdAt: nowStr,
                        updatedAt: nowStr
                    };
                    return [4 /*yield*/, db.insert(schema_1.invoices).values(newInvoiceValues)];
                case 11:
                    _c.sent();
                    generatedInvoiceIds.push(newInvoiceId);
                    if (!(pattern.templateInvoiceId && templateData)) return [3 /*break*/, 19];
                    _c.label = 12;
                case 12:
                    _c.trys.push([12, 18, , 19]);
                    return [4 /*yield*/, db.select()
                            .from(schema_1.invoiceItems)
                            .where(drizzle_orm_1.eq(schema_1.invoiceItems.invoiceId, pattern.templateInvoiceId))];
                case 13:
                    templateItems = _c.sent();
                    _b = 0, templateItems_1 = templateItems;
                    _c.label = 14;
                case 14:
                    if (!(_b < templateItems_1.length)) return [3 /*break*/, 17];
                    item = templateItems_1[_b];
                    return [4 /*yield*/, db.insert(schema_1.invoiceItems).values({
                            id: uuid_1.v4(),
                            invoiceId: newInvoiceId,
                            itemType: item.itemType,
                            itemId: item.itemId,
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.total,
                            taxRate: item.taxRate,
                            discountPercent: item.discountPercent,
                            createdAt: nowStr
                        })];
                case 15:
                    _c.sent();
                    _c.label = 16;
                case 16:
                    _b++;
                    return [3 /*break*/, 14];
                case 17: return [3 /*break*/, 19];
                case 18:
                    err_1 = _c.sent();
                    console.warn("[RECURRING_INVOICES] Could not copy line items for " + newInvoiceId + ":", err_1);
                    return [3 /*break*/, 19];
                case 19:
                    nextDueDate = new Date(pattern.nextDueDate);
                    frequencyDays = {
                        weekly: 7,
                        biweekly: 14,
                        monthly: 30,
                        quarterly: 90,
                        annually: 365
                    };
                    daysToAdd = frequencyDays[pattern.frequency] || 30;
                    nextDueDate.setDate(nextDueDate.getDate() + daysToAdd);
                    // Update pattern with next due date
                    return [4 /*yield*/, db.update(schema_1.recurringInvoices)
                            .set({
                            nextDueDate: nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
                            lastGeneratedDate: nowStr,
                            updatedAt: nowStr
                        })
                            .where(drizzle_orm_1.eq(schema_1.recurringInvoices.id, pattern.id))];
                case 20:
                    // Update pattern with next due date
                    _c.sent();
                    _c.label = 21;
                case 21:
                    _c.trys.push([21, 23, , 24]);
                    return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                            id: uuid_1.v4(),
                            userId: systemUserId,
                            action: "recurring_invoice_generated",
                            entityType: "invoice",
                            entityId: newInvoiceId,
                            description: "Auto-generated invoice " + newInvoiceNumber + " from recurring pattern " + pattern.id
                        })];
                case 22:
                    _c.sent();
                    return [3 /*break*/, 24];
                case 23:
                    err_2 = _c.sent();
                    console.warn("Could not log activity:", err_2);
                    return [3 /*break*/, 24];
                case 24:
                    console.log("[RECURRING_INVOICES] Generated invoice " + newInvoiceNumber + " for pattern " + pattern.id);
                    return [3 /*break*/, 26];
                case 25:
                    error_1 = _c.sent();
                    errorMsg = "Error generating invoice for pattern " + pattern.id + ": " + (error_1 instanceof Error ? error_1.message : String(error_1));
                    console.error("[RECURRING_INVOICES] " + errorMsg);
                    errors.push(errorMsg);
                    return [3 /*break*/, 26];
                case 26:
                    _i++;
                    return [3 /*break*/, 4];
                case 27:
                    success = errors.length === 0;
                    message = success
                        ? "Successfully generated " + generatedInvoiceIds.length + " invoice(s)"
                        : "Generated " + generatedInvoiceIds.length + " invoice(s) with " + errors.length + " error(s)";
                    console.log("[RECURRING_INVOICES] Job completed: " + message);
                    return [2 /*return*/, {
                            success: success,
                            invoicesGenerated: generatedInvoiceIds.length,
                            invoiceIds: generatedInvoiceIds,
                            errors: errors,
                            message: message
                        }];
                case 28:
                    error_2 = _c.sent();
                    errorMsg = "Fatal error in recurring invoices job: " + (error_2 instanceof Error ? error_2.message : String(error_2));
                    console.error("[RECURRING_INVOICES] " + errorMsg);
                    return [2 /*return*/, {
                            success: false,
                            invoicesGenerated: 0,
                            invoiceIds: generatedInvoiceIds,
                            errors: __spreadArrays(errors, [errorMsg]),
                            message: "Job failed with errors"
                        }];
                case 29: return [2 /*return*/];
            }
        });
    });
}
exports.generateDueRecurringInvoices = generateDueRecurringInvoices;
