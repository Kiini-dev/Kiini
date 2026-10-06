"use strict";
/**
 * Accounting Automation Engine
 * Handles automatic accounting processes including invoice reconciliation, payments, and reporting
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
exports.runAllAccountingAutomations = exports.generateRevenueAnalysisSummary = exports.generateTaxComplianceReminder = exports.generateExpenseReconciliationReport = exports.autoGenerateCreditNotes = exports.checkBankReconciliationStatus = exports.autoCreateJournalEntries = exports.generateOverdueInvoiceAlerts = exports.autoUpdateInvoiceStatus = void 0;
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
var uuid_1 = require("uuid");
/**
 * Automatic Invoice Status Updates
 * Updates invoice status based on payment receipt
 */
function autoUpdateInvoiceStatus(ctx) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var db, unpaidInvoices, _i, unpaidInvoices_1, invoice, payment, totalPaid, paidAmount, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 12, , 13]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.organizationId, ctx.organizationId), drizzle_orm_1.eq(schema_1.invoices.status, "sent")))];
                case 3:
                    unpaidInvoices = _b.sent();
                    _i = 0, unpaidInvoices_1 = unpaidInvoices;
                    _b.label = 4;
                case 4:
                    if (!(_i < unpaidInvoices_1.length)) return [3 /*break*/, 11];
                    invoice = unpaidInvoices_1[_i];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.payments)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.invoiceId, invoice.id), drizzle_orm_1.eq(schema_1.payments.status, "completed")))
                            .limit(1)];
                case 5:
                    payment = _b.sent();
                    if (!(payment.length > 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, db
                            .select({
                            sum: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SUM(amount)"], ["SUM(amount)"])))
                        })
                            .from(schema_1.payments)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.invoiceId, invoice.id), drizzle_orm_1.eq(schema_1.payments.status, "completed")))];
                case 6:
                    totalPaid = _b.sent();
                    paidAmount = ((_a = totalPaid[0]) === null || _a === void 0 ? void 0 : _a.sum) || 0;
                    if (!(paidAmount >= invoice.totalAmount)) return [3 /*break*/, 8];
                    return [4 /*yield*/, db
                            .update(schema_1.invoices)
                            .set({ status: "paid", paidDate: new Date() })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoice.id))];
                case 7:
                    _b.sent();
                    console.log("[Accounting Automation] Invoice " + invoice.id + " marked as paid");
                    return [3 /*break*/, 10];
                case 8:
                    if (!(paidAmount > 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, db
                            .update(schema_1.invoices)
                            .set({ status: "partial" })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoice.id))];
                case 9:
                    _b.sent();
                    console.log("[Accounting Automation] Invoice " + invoice.id + " marked as partially paid");
                    _b.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 4];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_1 = _b.sent();
                    console.error("[Accounting Automation] Invoice status update error:", error_1);
                    throw error_1;
                case 13: return [2 /*return*/];
            }
        });
    });
}
exports.autoUpdateInvoiceStatus = autoUpdateInvoiceStatus;
/**
 * Generate Overdue Invoice Alerts
 */
function generateOverdueInvoiceAlerts(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var db, today_1, overdueInvoices, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    today_1 = new Date();
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.organizationId, ctx.organizationId), drizzle_orm_1.eq(schema_1.invoices.status, "sent"), drizzle_orm_1.lte(schema_1.invoices.dueDate, today_1)))];
                case 3:
                    overdueInvoices = _a.sent();
                    return [2 /*return*/, overdueInvoices.map(function (inv) {
                            var daysOverdue = Math.floor((today_1.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                            return {
                                invoiceId: inv.id,
                                invoiceNumber: inv.invoiceNumber,
                                type: "overdue_invoice",
                                clientName: inv.clientId,
                                amount: inv.totalAmount,
                                daysOverdue: daysOverdue,
                                message: "Invoice " + inv.invoiceNumber + " is " + daysOverdue + " days overdue",
                                priority: daysOverdue > 30 ? "critical" : daysOverdue > 14 ? "high" : "medium",
                                createdAt: today_1
                            };
                        })];
                case 4:
                    error_2 = _a.sent();
                    console.error("[Accounting Automation] Overdue invoice alert error:", error_2);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.generateOverdueInvoiceAlerts = generateOverdueInvoiceAlerts;
/**
 * Auto-Create Journal Entries for Transactions
 */
function autoCreateJournalEntries(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var db, unmatchedPayments, _i, unmatchedPayments_1, payment, existingEntry, journalEntryId, journalEntryNumber, cashAccount, revenueAccount, cashAccountId, revenueAccountId, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 14, , 15]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.payments)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.organizationId, ctx.organizationId), drizzle_orm_1.eq(schema_1.payments.status, "completed")))];
                case 3:
                    unmatchedPayments = _a.sent();
                    _i = 0, unmatchedPayments_1 = unmatchedPayments;
                    _a.label = 4;
                case 4:
                    if (!(_i < unmatchedPayments_1.length)) return [3 /*break*/, 13];
                    payment = unmatchedPayments_1[_i];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.journalEntries)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.journalEntries.referenceId, payment.id), drizzle_orm_1.eq(schema_1.journalEntries.referenceType, "payment")))
                            .limit(1)];
                case 5:
                    existingEntry = _a.sent();
                    if (!(existingEntry.length === 0)) return [3 /*break*/, 12];
                    journalEntryId = uuid_1.v4();
                    journalEntryNumber = "JE-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
                    return [4 /*yield*/, db.insert(schema_1.journalEntries).values({
                            id: journalEntryId,
                            entryNumber: journalEntryNumber,
                            entryDate: payment.paymentDate || new Date(),
                            description: "Payment received - Invoice " + payment.invoiceId,
                            referenceType: "payment",
                            referenceId: payment.id,
                            createdBy: ctx.userId || null,
                            createdAt: new Date()
                        })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.accounts)
                            .where(drizzle_orm_1.eq(schema_1.accounts.accountCode, "1000"))
                            .limit(1)];
                case 7:
                    cashAccount = (_a.sent())[0];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.accounts)
                            .where(drizzle_orm_1.eq(schema_1.accounts.accountCode, "3000"))
                            .limit(1)];
                case 8:
                    revenueAccount = (_a.sent())[0];
                    cashAccountId = cashAccount === null || cashAccount === void 0 ? void 0 : cashAccount.id;
                    revenueAccountId = revenueAccount === null || revenueAccount === void 0 ? void 0 : revenueAccount.id;
                    if (!(cashAccountId && revenueAccountId)) return [3 /*break*/, 11];
                    return [4 /*yield*/, db.insert(schema_1.journalEntryLines).values({
                            id: uuid_1.v4(),
                            journalEntryId: journalEntryId,
                            accountId: cashAccountId,
                            debit: payment.amount,
                            credit: 0,
                            description: "Payment received - Invoice " + payment.invoiceId,
                            createdAt: new Date()
                        })];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, db.insert(schema_1.journalEntryLines).values({
                            id: uuid_1.v4(),
                            journalEntryId: journalEntryId,
                            accountId: revenueAccountId,
                            debit: 0,
                            credit: payment.amount,
                            description: "Payment received - Invoice " + payment.invoiceId,
                            createdAt: new Date()
                        })];
                case 10:
                    _a.sent();
                    console.log("[Accounting Automation] Created journal entries for payment " + payment.id);
                    return [3 /*break*/, 12];
                case 11:
                    console.warn("[Accounting Automation] Skipped journal lines for payment " + payment.id + " because one or more accounts were missing");
                    _a.label = 12;
                case 12:
                    _i++;
                    return [3 /*break*/, 4];
                case 13: return [3 /*break*/, 15];
                case 14:
                    error_3 = _a.sent();
                    console.error("[Accounting Automation] Journal entry creation error:", error_3);
                    throw error_3;
                case 15: return [2 /*return*/];
            }
        });
    });
}
exports.autoCreateJournalEntries = autoCreateJournalEntries;
/**
 * Bank Reconciliation Status Check
 */
function checkBankReconciliationStatus(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var db, reconciliations, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.bankTransactions)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.bankTransactions.organizationId, ctx.organizationId), drizzle_orm_1.eq(schema_1.bankTransactions.isReconciled, 0)))];
                case 3:
                    reconciliations = _a.sent();
                    return [2 /*return*/, reconciliations.map(function (rec) { return ({
                            reconciliationId: rec.id,
                            type: "reconciliation_pending",
                            bankAccount: rec.bankAccountId,
                            period: "" + rec.transactionDate,
                            message: "Bank reconciliation pending for transaction " + (rec.referenceNumber || rec.id),
                            priority: "medium",
                            createdAt: new Date()
                        }); })];
                case 4:
                    error_4 = _a.sent();
                    console.error("[Accounting Automation] Reconciliation check error:", error_4);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.checkBankReconciliationStatus = checkBankReconciliationStatus;
/**
 * Auto-Generate Credit Notes for Returns
 */
function autoGenerateCreditNotes(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var db, thirtyDaysAgo, recentInvoices, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.organizationId, ctx.organizationId), drizzle_orm_1.eq(schema_1.invoices.status, "paid"), drizzle_orm_1.gte(schema_1.invoices.paidDate, thirtyDaysAgo)))];
                case 3:
                    recentInvoices = _a.sent();
                    // This would typically be triggered by a return event, not auto-generated
                    console.log("[Accounting Automation] Checked " + recentInvoices.length + " recent invoices for returns");
                    return [3 /*break*/, 5];
                case 4:
                    error_5 = _a.sent();
                    console.error("[Accounting Automation] Credit note generation error:", error_5);
                    throw error_5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.autoGenerateCreditNotes = autoGenerateCreditNotes;
/**
 * Monthly Expense Reconciliation Summary
 */
function generateExpenseReconciliationReport(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var db, today, monthStart, monthEnd, monthlyExpenses, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    today = new Date();
                    monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    return [4 /*yield*/, db
                            .select({
                            totalAmount: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SUM(amount)"], ["SUM(amount)"]))),
                            count: drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))),
                            category: schema_1.expenses.category
                        })
                            .from(schema_1.expenses)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.expenses.organizationId, ctx.organizationId), drizzle_orm_1.gte(schema_1.expenses.expenseDate, monthStart), drizzle_orm_1.lte(schema_1.expenses.expenseDate, monthEnd)))];
                case 3:
                    monthlyExpenses = _a.sent();
                    return [2 /*return*/, {
                            type: "monthly_expense_report",
                            month: today.toLocaleString("default", { month: "long", year: "numeric" }),
                            totalExpenses: monthlyExpenses.reduce(function (sum, exp) { return sum + (exp.totalAmount || 0); }, 0),
                            expenseCount: monthlyExpenses.reduce(function (sum, exp) { return sum + (exp.count || 0); }, 0),
                            byCategory: monthlyExpenses,
                            generatedAt: today
                        }];
                case 4:
                    error_6 = _a.sent();
                    console.error("[Accounting Automation] Expense report error:", error_6);
                    throw error_6;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.generateExpenseReconciliationReport = generateExpenseReconciliationReport;
/**
 * Tax Compliance Reminder
 */
function generateTaxComplianceReminder(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var db, today, reminders, vatFilingDates, dayOfYear, _i, vatFilingDates_1, filingDay;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    try {
                        today = new Date();
                        reminders = [];
                        vatFilingDates = [14, 104, 194, 284];
                        dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
                        for (_i = 0, vatFilingDates_1 = vatFilingDates; _i < vatFilingDates_1.length; _i++) {
                            filingDay = vatFilingDates_1[_i];
                            if (dayOfYear >= filingDay - 7 && dayOfYear <= filingDay) {
                                reminders.push({
                                    type: "tax_compliance",
                                    taxType: "VAT",
                                    message: "VAT filing deadline approaching",
                                    dueDate: new Date(today.getFullYear(), Math.floor(filingDay / 91) * 3, 15),
                                    priority: "high",
                                    createdAt: today
                                });
                            }
                        }
                        // PAYE/Income tax reminder (monthly - 10th of next month)
                        if (today.getDate() >= 3 && today.getDate() <= 10) {
                            reminders.push({
                                type: "tax_compliance",
                                taxType: "PAYE",
                                message: "Monthly PAYE filing deadline approaching (10th)",
                                dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 10),
                                priority: "high",
                                createdAt: today
                            });
                        }
                        return [2 /*return*/, reminders];
                    }
                    catch (error) {
                        console.error("[Accounting Automation] Tax compliance reminder error:", error);
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.generateTaxComplianceReminder = generateTaxComplianceReminder;
/**
 * Revenue Analysis Summary
 */
function generateRevenueAnalysisSummary(ctx) {
    var _a, _b, _c;
    return __awaiter(this, void 0, Promise, function () {
        var db, today, lastMonth, paidInvoices, error_7;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _d.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    today = new Date();
                    lastMonth = new Date(today);
                    lastMonth.setMonth(lastMonth.getMonth() - 1);
                    return [4 /*yield*/, db
                            .select({
                            totalRevenue: drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["SUM(totalAmount)"], ["SUM(totalAmount)"]))),
                            invoiceCount: drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))),
                            averageInvoiceValue: drizzle_orm_1.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["AVG(totalAmount)"], ["AVG(totalAmount)"])))
                        })
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.organizationId, ctx.organizationId), drizzle_orm_1.eq(schema_1.invoices.status, "paid"), drizzle_orm_1.gte(schema_1.invoices.paidDate, lastMonth)))];
                case 3:
                    paidInvoices = _d.sent();
                    return [2 /*return*/, {
                            type: "revenue_analysis",
                            period: "Last 30 Days",
                            totalRevenue: ((_a = paidInvoices[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0,
                            invoiceCount: ((_b = paidInvoices[0]) === null || _b === void 0 ? void 0 : _b.invoiceCount) || 0,
                            averageInvoiceValue: ((_c = paidInvoices[0]) === null || _c === void 0 ? void 0 : _c.averageInvoiceValue) || 0,
                            generatedAt: today
                        }];
                case 4:
                    error_7 = _d.sent();
                    console.error("[Accounting Automation] Revenue analysis error:", error_7);
                    throw error_7;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.generateRevenueAnalysisSummary = generateRevenueAnalysisSummary;
/**
 * Run all Accounting automations
 */
function runAllAccountingAutomations(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var overdueInvoices, reconciliationStatus, taxReminders, monthlyExpenseReport, revenueAnalysis, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    console.log("[Accounting Automation] Starting all automations for org " + ctx.organizationId);
                    return [4 /*yield*/, autoUpdateInvoiceStatus(ctx)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, autoCreateJournalEntries(ctx)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, generateOverdueInvoiceAlerts(ctx)];
                case 3:
                    overdueInvoices = _a.sent();
                    return [4 /*yield*/, checkBankReconciliationStatus(ctx)];
                case 4:
                    reconciliationStatus = _a.sent();
                    return [4 /*yield*/, generateTaxComplianceReminder(ctx)];
                case 5:
                    taxReminders = _a.sent();
                    return [4 /*yield*/, generateExpenseReconciliationReport(ctx)];
                case 6:
                    monthlyExpenseReport = _a.sent();
                    return [4 /*yield*/, generateRevenueAnalysisSummary(ctx)];
                case 7:
                    revenueAnalysis = _a.sent();
                    console.log("[Accounting Automation] Completed all automations");
                    return [2 /*return*/, {
                            overdueInvoices: overdueInvoices,
                            reconciliationStatus: reconciliationStatus,
                            taxReminders: taxReminders,
                            monthlyExpenseReport: monthlyExpenseReport,
                            revenueAnalysis: revenueAnalysis
                        }];
                case 8:
                    error_8 = _a.sent();
                    console.error("[Accounting Automation] Error running automations:", error_8);
                    throw error_8;
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.runAllAccountingAutomations = runAllAccountingAutomations;
exports["default"] = {
    autoUpdateInvoiceStatus: autoUpdateInvoiceStatus,
    autoCreateJournalEntries: autoCreateJournalEntries,
    autoGenerateCreditNotes: autoGenerateCreditNotes,
    generateOverdueInvoiceAlerts: generateOverdueInvoiceAlerts,
    checkBankReconciliationStatus: checkBankReconciliationStatus,
    generateExpenseReconciliationReport: generateExpenseReconciliationReport,
    generateTaxComplianceReminder: generateTaxComplianceReminder,
    generateRevenueAnalysisSummary: generateRevenueAnalysisSummary,
    runAllAccountingAutomations: runAllAccountingAutomations
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
