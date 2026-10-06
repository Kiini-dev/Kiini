"use strict";
/**
 * Scheduled Job: Generate Due Recurring Expenses
 *
 * This job runs periodically to check for recurring expenses that are due
 * and automatically generates new expense records from them.
 *
 * Should be called at least once daily, preferably during off-peak hours.
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
exports.generateDueRecurringExpenses = void 0;
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var recurringLabels_1 = require("../utils/recurringLabels");
/**
 * Generate next expense number (EXP-XXXXXX)
 */
function generateNextExpenseNumber(db) {
    return __awaiter(this, void 0, Promise, function () {
        var result, maxSequence, _i, result_1, rec, match, seq, nextSequence, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.select({ expNum: schema_1.expenses.expenseNumber })
                            .from(schema_1.expenses)
                            .orderBy(drizzle_orm_1.desc(schema_1.expenses.expenseNumber))
                            .limit(1000)];
                case 1:
                    result = _a.sent();
                    maxSequence = 0;
                    for (_i = 0, result_1 = result; _i < result_1.length; _i++) {
                        rec = result_1[_i];
                        if (rec.expNum) {
                            match = rec.expNum.match(/(\d+)$/);
                            if (match) {
                                seq = parseInt(match[1]);
                                if (seq > maxSequence)
                                    maxSequence = seq;
                            }
                        }
                    }
                    nextSequence = maxSequence + 1;
                    return [2 /*return*/, "EXP-" + String(nextSequence).padStart(6, '0')];
                case 2:
                    err_1 = _a.sent();
                    console.warn("[RECURRING_EXPENSES] Error generating expense number:", err_1);
                    return [2 /*return*/, "EXP-" + Date.now()];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Calculate next due date based on frequency
 */
function calculateNextDueDate(currentDueDate, frequency, dayOfMonth) {
    var current = new Date(currentDueDate);
    switch (frequency) {
        case 'weekly':
            current.setDate(current.getDate() + 7);
            break;
        case 'biweekly':
            current.setDate(current.getDate() + 14);
            break;
        case 'monthly':
            current.setMonth(current.getMonth() + 1);
            if (dayOfMonth) {
                var maxDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
                current.setDate(Math.min(dayOfMonth, maxDay));
            }
            break;
        case 'quarterly':
            current.setMonth(current.getMonth() + 3);
            if (dayOfMonth) {
                var maxDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
                current.setDate(Math.min(dayOfMonth, maxDay));
            }
            break;
        case 'annually':
            current.setFullYear(current.getFullYear() + 1);
            break;
        default:
            current.setMonth(current.getMonth() + 1);
    }
    return current;
}
/**
 * Generate expenses for all due recurring patterns
 */
function generateDueRecurringExpenses() {
    return __awaiter(this, void 0, Promise, function () {
        var db, errors, generatedExpenseIds, now, nowStr, systemUserId, duePatterns, _i, duePatterns_1, pattern, newExpenseId, expenseNumber, baseDescription, labeledDescription, auditSuffix, nextDueDate, err_2, error_1, errorMsg, success, message, error_2, errorMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        return [2 /*return*/, {
                                success: false,
                                expensesGenerated: 0,
                                expenseIds: [],
                                errors: ["Database not available"],
                                message: "Failed: Database connection unavailable",
                                itemsProcessed: 0,
                                itemsFailed: 0
                            }];
                    }
                    errors = [];
                    generatedExpenseIds = [];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 18, , 19]);
                    now = new Date();
                    nowStr = now.toISOString().replace('T', ' ').substring(0, 19);
                    systemUserId = "system-job";
                    return [4 /*yield*/, db.select()
                            .from(schema_1.recurringExpenses)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.recurringExpenses.isActive, 1), drizzle_orm_1.lte(schema_1.recurringExpenses.nextDueDate, nowStr)))];
                case 3:
                    duePatterns = _a.sent();
                    console.log("[RECURRING_EXPENSES] Found " + duePatterns.length + " due patterns to process");
                    _i = 0, duePatterns_1 = duePatterns;
                    _a.label = 4;
                case 4:
                    if (!(_i < duePatterns_1.length)) return [3 /*break*/, 17];
                    pattern = duePatterns_1[_i];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 15, , 16]);
                    if (!(pattern.endDate && pattern.endDate < nowStr)) return [3 /*break*/, 7];
                    return [4 /*yield*/, db.update(schema_1.recurringExpenses)
                            .set({ isActive: 0, updatedAt: nowStr })
                            .where(drizzle_orm_1.eq(schema_1.recurringExpenses.id, pattern.id))];
                case 6:
                    _a.sent();
                    console.log("[RECURRING_EXPENSES] Marked pattern " + pattern.id + " as inactive (ended)");
                    return [3 /*break*/, 16];
                case 7:
                    newExpenseId = uuid_1.v4();
                    return [4 /*yield*/, generateNextExpenseNumber(db)];
                case 8:
                    expenseNumber = _a.sent();
                    baseDescription = pattern.description || "Recurring " + pattern.category + " expense";
                    labeledDescription = recurringLabels_1.generateRecurringLabel(baseDescription, now);
                    auditSuffix = " (Auto-generated from recurring)";
                    return [4 /*yield*/, db.insert(schema_1.expenses).values({
                            id: newExpenseId,
                            organizationId: pattern.organizationId,
                            expenseNumber: expenseNumber,
                            category: pattern.category,
                            vendor: pattern.vendor,
                            amount: pattern.amount,
                            expenseDate: nowStr,
                            paymentMethod: pattern.paymentMethod,
                            description: labeledDescription + auditSuffix,
                            chartOfAccountId: pattern.chartOfAccountId,
                            status: 'pending',
                            createdBy: systemUserId,
                            createdAt: nowStr,
                            updatedAt: nowStr
                        })];
                case 9:
                    _a.sent();
                    generatedExpenseIds.push(newExpenseId);
                    nextDueDate = calculateNextDueDate(pattern.nextDueDate, pattern.frequency, pattern.dayOfMonth);
                    // Update recurring pattern
                    return [4 /*yield*/, db.update(schema_1.recurringExpenses)
                            .set({
                            nextDueDate: nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
                            lastGeneratedDate: nowStr,
                            updatedAt: nowStr
                        })
                            .where(drizzle_orm_1.eq(schema_1.recurringExpenses.id, pattern.id))];
                case 10:
                    // Update recurring pattern
                    _a.sent();
                    _a.label = 11;
                case 11:
                    _a.trys.push([11, 13, , 14]);
                    return [4 /*yield*/, db.insert(schema_1.activityLog).values({
                            id: uuid_1.v4(),
                            userId: systemUserId,
                            action: "recurring_expense_generated",
                            entityType: "expense",
                            entityId: newExpenseId,
                            description: "Auto-generated expense " + expenseNumber + " from recurring pattern " + pattern.id + " (" + pattern.category + ")"
                        })];
                case 12:
                    _a.sent();
                    return [3 /*break*/, 14];
                case 13:
                    err_2 = _a.sent();
                    console.warn("[RECURRING_EXPENSES] Could not log activity:", err_2);
                    return [3 /*break*/, 14];
                case 14:
                    console.log("[RECURRING_EXPENSES] Generated expense " + expenseNumber + " for pattern " + pattern.id);
                    return [3 /*break*/, 16];
                case 15:
                    error_1 = _a.sent();
                    errorMsg = "Error generating expense for pattern " + pattern.id + ": " + (error_1 instanceof Error ? error_1.message : String(error_1));
                    console.error("[RECURRING_EXPENSES] " + errorMsg);
                    errors.push(errorMsg);
                    return [3 /*break*/, 16];
                case 16:
                    _i++;
                    return [3 /*break*/, 4];
                case 17:
                    success = errors.length === 0;
                    message = success
                        ? "Successfully generated " + generatedExpenseIds.length + " expense(s)"
                        : "Generated " + generatedExpenseIds.length + " expense(s) with " + errors.length + " error(s)";
                    console.log("[RECURRING_EXPENSES] Job completed: " + message);
                    return [2 /*return*/, {
                            success: success,
                            expensesGenerated: generatedExpenseIds.length,
                            expenseIds: generatedExpenseIds,
                            errors: errors,
                            message: message,
                            itemsProcessed: duePatterns.length,
                            itemsFailed: errors.length
                        }];
                case 18:
                    error_2 = _a.sent();
                    errorMsg = "Fatal error in recurring expenses job: " + (error_2 instanceof Error ? error_2.message : String(error_2));
                    console.error("[RECURRING_EXPENSES] " + errorMsg);
                    return [2 /*return*/, {
                            success: false,
                            expensesGenerated: generatedExpenseIds.length,
                            expenseIds: generatedExpenseIds,
                            errors: [errorMsg],
                            message: errorMsg,
                            itemsProcessed: 0,
                            itemsFailed: 1
                        }];
                case 19: return [2 /*return*/];
            }
        });
    });
}
exports.generateDueRecurringExpenses = generateDueRecurringExpenses;
