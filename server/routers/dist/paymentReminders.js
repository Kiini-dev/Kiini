"use strict";
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
exports.paymentRemindersRouter = exports.sendOverdueReminders = exports.recordReminderSent = exports.hasReminderBeenSent = exports.getOverdueInvoices = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var emailQueue_1 = require("./emailQueue");
var date_fns_1 = require("date-fns");
function formatCurrency(amount, currency) {
    if (currency === void 0) { currency = "KES"; }
    return currency + " " + (amount / 100).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
var readProcedure = trpc_1.createFeatureRestrictedProcedure("accounting:payments:view");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("tools:automation");
/**
 * Get overdue invoices for a client
 */
function getOverdueInvoices(options) {
    return __awaiter(this, void 0, void 0, function () {
        var db, query, invoices, results, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    query = db.collection("invoices")
                        .where("status", "in", ["overdue", "sent"])
                        .where("dueDate", "<", new Date().toISOString().replace('T', ' ').substring(0, 19))
                        .where("paidAmount", "<", db.raw("total"));
                    if (options === null || options === void 0 ? void 0 : options.clientId) {
                        query = query.where("clientId", "==", options.clientId);
                    }
                    return [4 /*yield*/, query.get()];
                case 3:
                    invoices = _a.sent();
                    results = invoices.docs.map(function (doc) { return (__assign({ id: doc.id }, doc.data())); });
                    if ((options === null || options === void 0 ? void 0 : options.daysOverdue) || (options === null || options === void 0 ? void 0 : options.daysOverdue) === 0) {
                        results = results.filter(function (invoice) {
                            var daysLate = date_fns_1.differenceInDays(new Date(), new Date(invoice.dueDate));
                            return daysLate >= (options.daysOverdue || 1);
                        });
                    }
                    return [2 /*return*/, results];
                case 4:
                    error_1 = _a.sent();
                    console.error("[OVERDUE REMINDERS] Error getting overdue invoices:", error_1);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getOverdueInvoices = getOverdueInvoices;
/**
 * Check if reminder was already sent for this invoice/type combination
 */
function hasReminderBeenSent(invoiceId, reminderType) {
    return __awaiter(this, void 0, Promise, function () {
        var db, reminders, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, false];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.queryInvoiceReminders(invoiceId, reminderType)];
                case 3:
                    reminders = _a.sent();
                    return [2 /*return*/, reminders.length > 0];
                case 4:
                    error_2 = _a.sent();
                    console.error("[OVERDUE REMINDERS] Error checking reminder history:", error_2);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.hasReminderBeenSent = hasReminderBeenSent;
/**
 * Record that a reminder was sent
 */
function recordReminderSent(invoiceId, reminderType, clientEmail, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.insertInvoiceReminder({
                            id: uuid_1.v4(),
                            invoiceId: invoiceId,
                            reminderType: reminderType,
                            clientEmail: clientEmail,
                            sentBy: userId,
                            sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error("[OVERDUE REMINDERS] Error recording reminder:", error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.recordReminderSent = recordReminderSent;
/**
 * Generate overdue reminder email template
 */
function generateOverdueReminderTemplate(input) {
    var appName = input.appName || 'CRM';
    var cur = input.currency || 'KES';
    var html = "\n    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n      <h2 style=\"color: #d32f2f;\">Payment Reminder - Invoice Overdue</h2>\n      \n      <p>Dear " + input.clientName + ",</p>\n      \n      <p style=\"color: #333;\">\n        This invoice is now <strong style=\"color: #d32f2f;\">" + input.daysOverdue + " days overdue</strong>.\n      </p>\n      \n      <div style=\"background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;\">\n        <p style=\"margin: 5px 0;\"><strong>Invoice #:</strong> " + input.invoiceNumber + "</p>\n        <p style=\"margin: 5px 0;\"><strong>Amount Due:</strong> " + formatCurrency(input.amount, cur) + "</p>\n        <p style=\"margin: 5px 0;\"><strong>Original Due Date:</strong> " + new Date(input.dueDate).toLocaleDateString() + "</p>\n        <p style=\"margin: 5px 0;\"><strong>Days Overdue:</strong> " + input.daysOverdue + "</p>\n      </div>\n      \n      <p>Please arrange payment at your earliest convenience. If you have already sent the payment, please disregard this notice.</p>\n      \n      <p style=\"margin-bottom: 30px;\">\n        <a href=\"" + input.link + "\" style=\"background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;\">\n          Pay Invoice\n        </a>\n      </p>\n      \n      <hr style=\"border: none; border-top: 1px solid #ddd; margin: 30px 0;\">\n      \n      <p style=\"color: #999; font-size: 12px;\">\n        " + appName + " - Financial Management System<br>\n        This is an automated reminder. Please do not reply to this email.\n      </p>\n    </div>\n  ";
    var text = "\nPayment Reminder - Invoice Overdue\n\nDear " + input.clientName + ",\n\nThis invoice is now " + input.daysOverdue + " days overdue.\n\nInvoice #: " + input.invoiceNumber + "\nAmount Due: " + formatCurrency(input.amount, cur) + "\nOriginal Due Date: " + new Date(input.dueDate).toLocaleDateString() + "\nDays Overdue: " + input.daysOverdue + "\n\nPlease arrange payment at your earliest convenience. If you have already sent the payment, please disregard this notice.\n\nView Invoice: " + input.link + "\n\n---\n" + appName + " - Financial Management System\nThis is an automated reminder. Please do not reply to this email.\n  ";
    return { html: html, text: text };
}
/**
 * Send overdue reminders based on configured schedule
 * 1 day late, 3 days late, 7 days late, 14 days late, 30 days late
 */
function sendOverdueReminders() {
    return __awaiter(this, void 0, void 0, function () {
        var db, appName, cur, baseUrl, getCompanyInfo, info, _a, sent, skipped, errors, allInvoices, _i, allInvoices_1, invoice, daysOverdue, remindersToSend, client, _b, remindersToSend_1, reminder, alreadySent, _c, html, text, queueResult, error_4, error_5;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _d.sent();
                    if (!db) {
                        console.error("[OVERDUE REMINDERS] Database not available");
                        return [2 /*return*/, { sent: 0, skipped: 0, errors: 0 }];
                    }
                    appName = 'CRM';
                    cur = 'KES';
                    baseUrl = process.env.APP_URL || '';
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/company-info'); })];
                case 3:
                    getCompanyInfo = (_d.sent()).getCompanyInfo;
                    return [4 /*yield*/, getCompanyInfo()];
                case 4:
                    info = _d.sent();
                    if (info.name)
                        appName = info.name;
                    if (info.currency)
                        cur = info.currency;
                    return [3 /*break*/, 6];
                case 5:
                    _a = _d.sent();
                    return [3 /*break*/, 6];
                case 6:
                    sent = 0;
                    skipped = 0;
                    errors = 0;
                    _d.label = 7;
                case 7:
                    _d.trys.push([7, 22, , 23]);
                    return [4 /*yield*/, getOverdueInvoices()];
                case 8:
                    allInvoices = _d.sent();
                    _i = 0, allInvoices_1 = allInvoices;
                    _d.label = 9;
                case 9:
                    if (!(_i < allInvoices_1.length)) return [3 /*break*/, 21];
                    invoice = allInvoices_1[_i];
                    _d.label = 10;
                case 10:
                    _d.trys.push([10, 19, , 20]);
                    daysOverdue = date_fns_1.differenceInDays(new Date(), new Date(invoice.dueDate));
                    remindersToSend = [];
                    if (daysOverdue >= 1)
                        remindersToSend.push({ type: "overdue_1day", days: 1 });
                    if (daysOverdue >= 3)
                        remindersToSend.push({ type: "overdue_3days", days: 3 });
                    if (daysOverdue >= 7)
                        remindersToSend.push({ type: "overdue_7days", days: 7 });
                    if (daysOverdue >= 14)
                        remindersToSend.push({ type: "overdue_14days", days: 14 });
                    if (daysOverdue >= 30)
                        remindersToSend.push({ type: "overdue_30days", days: 30 });
                    return [4 /*yield*/, db.getClient(invoice.clientId)];
                case 11:
                    client = _d.sent();
                    if (!(client === null || client === void 0 ? void 0 : client.email)) {
                        console.warn("[OVERDUE REMINDERS] No email for client " + invoice.clientId);
                        skipped++;
                        return [3 /*break*/, 20];
                    }
                    _b = 0, remindersToSend_1 = remindersToSend;
                    _d.label = 12;
                case 12:
                    if (!(_b < remindersToSend_1.length)) return [3 /*break*/, 18];
                    reminder = remindersToSend_1[_b];
                    return [4 /*yield*/, hasReminderBeenSent(invoice.id, reminder.type)];
                case 13:
                    alreadySent = _d.sent();
                    if (alreadySent) {
                        console.log("[OVERDUE REMINDERS] Reminder " + reminder.type + " already sent for invoice " + invoice.id);
                        skipped++;
                        return [3 /*break*/, 17];
                    }
                    _c = generateOverdueReminderTemplate({
                        clientName: client.companyName,
                        invoiceNumber: invoice.invoiceNumber,
                        amount: invoice.total - invoice.paidAmount,
                        daysOverdue: daysOverdue,
                        dueDate: invoice.dueDate,
                        link: baseUrl + "/invoices/" + invoice.id,
                        appName: appName,
                        currency: cur
                    }), html = _c.html, text = _c.text;
                    return [4 /*yield*/, emailQueue_1.queueEmail({
                            recipientEmail: client.email,
                            recipientName: client.companyName,
                            subject: "Payment Reminder: Invoice " + invoice.invoiceNumber + " is " + daysOverdue + " days overdue",
                            htmlContent: html,
                            textContent: text,
                            eventType: "invoice_overdue",
                            entityType: "invoice",
                            entityId: invoice.id,
                            metadata: {
                                reminderType: reminder.type,
                                daysOverdue: daysOverdue,
                                amountDue: invoice.total - invoice.paidAmount
                            }
                        })];
                case 14:
                    queueResult = _d.sent();
                    if (!queueResult.success) return [3 /*break*/, 16];
                    // Record that this reminder was sent
                    return [4 /*yield*/, recordReminderSent(invoice.id, reminder.type, client.email)];
                case 15:
                    // Record that this reminder was sent
                    _d.sent();
                    console.log("[OVERDUE REMINDERS] Queued " + reminder.type + " reminder for invoice " + invoice.invoiceNumber);
                    sent++;
                    return [3 /*break*/, 17];
                case 16:
                    console.error("[OVERDUE REMINDERS] Failed to queue reminder for invoice " + invoice.id + ":", queueResult.error);
                    errors++;
                    _d.label = 17;
                case 17:
                    _b++;
                    return [3 /*break*/, 12];
                case 18: return [3 /*break*/, 20];
                case 19:
                    error_4 = _d.sent();
                    console.error("[OVERDUE REMINDERS] Error processing invoice " + invoice.id + ":", error_4);
                    errors++;
                    return [3 /*break*/, 20];
                case 20:
                    _i++;
                    return [3 /*break*/, 9];
                case 21:
                    console.log("[OVERDUE REMINDERS] Processed " + allInvoices.length + " invoices - Sent: " + sent + ", Skipped: " + skipped + ", Errors: " + errors);
                    return [2 /*return*/, { sent: sent, skipped: skipped, errors: errors }];
                case 22:
                    error_5 = _d.sent();
                    console.error("[OVERDUE REMINDERS] Error sending overdue reminders:", error_5);
                    return [2 /*return*/, { sent: 0, skipped: 0, errors: allInvoices.length }];
                case 23: return [2 /*return*/];
            }
        });
    });
}
exports.sendOverdueReminders = sendOverdueReminders;
exports.paymentRemindersRouter = trpc_1.router({
    /**
     * Get overdue invoices for current user's clients
     */
    getOverdueInvoices: readProcedure
        .input(zod_1.z.object({
        daysOverdue: zod_1.z.number().optional(),
        limit: zod_1.z.number()["default"](50)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, invoices, error_6;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { invoices: [], total: 0 }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.getOverdueInvoicesByUser(((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "", input.daysOverdue, input.limit)];
                    case 3:
                        invoices = _c.sent();
                        return [2 /*return*/, { invoices: invoices, total: invoices.length }];
                    case 4:
                        error_6 = _c.sent();
                        console.error("[PAYMENT REMINDERS] Error getting overdue invoices:", error_6);
                        return [2 /*return*/, { invoices: [], total: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Send overdue reminder for specific invoice
     */
    sendReminder: writeProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        reminderType: zod_1.z["enum"](["overdue_1day", "overdue_3days", "overdue_7days", "overdue_14days", "overdue_30days"])
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, invoice, daysOverdue, client, appName, cur, getCompanyInfo, info, _b, _c, html, text, queueResult, error_7;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        if (!db) {
                            return [2 /*return*/, { success: false, error: "Database not available" }];
                        }
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 12, , 13]);
                        return [4 /*yield*/, db.getInvoice(input.invoiceId)];
                    case 3:
                        invoice = _f.sent();
                        if (!invoice) {
                            return [2 /*return*/, { success: false, error: "Invoice not found" }];
                        }
                        daysOverdue = date_fns_1.differenceInDays(new Date(), new Date(invoice.dueDate));
                        if (daysOverdue < 0) {
                            return [2 /*return*/, { success: false, error: "Invoice is not overdue" }];
                        }
                        return [4 /*yield*/, db.getClient(invoice.clientId)];
                    case 4:
                        client = _f.sent();
                        if (!(client === null || client === void 0 ? void 0 : client.email)) {
                            return [2 /*return*/, { success: false, error: "Client has no email address" }];
                        }
                        appName = 'CRM';
                        cur = 'KES';
                        _f.label = 5;
                    case 5:
                        _f.trys.push([5, 8, , 9]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/company-info'); })];
                    case 6:
                        getCompanyInfo = (_f.sent()).getCompanyInfo;
                        return [4 /*yield*/, getCompanyInfo()];
                    case 7:
                        info = _f.sent();
                        if (info.name)
                            appName = info.name;
                        if (info.currency)
                            cur = info.currency;
                        return [3 /*break*/, 9];
                    case 8:
                        _b = _f.sent();
                        return [3 /*break*/, 9];
                    case 9:
                        _c = generateOverdueReminderTemplate({
                            clientName: client.companyName,
                            invoiceNumber: invoice.invoiceNumber,
                            amount: invoice.total - invoice.paidAmount,
                            daysOverdue: daysOverdue,
                            dueDate: invoice.dueDate,
                            link: (process.env.APP_URL || '') + "/invoices/" + invoice.id,
                            appName: appName,
                            currency: cur
                        }), html = _c.html, text = _c.text;
                        return [4 /*yield*/, emailQueue_1.queueEmail({
                                recipientEmail: client.email,
                                recipientName: client.companyName,
                                subject: "Payment Reminder: Invoice " + invoice.invoiceNumber + " is " + daysOverdue + " days overdue",
                                htmlContent: html,
                                textContent: text,
                                eventType: "invoice_overdue",
                                entityType: "invoice",
                                entityId: invoice.id,
                                userId: (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id,
                                metadata: {
                                    reminderType: input.reminderType,
                                    daysOverdue: daysOverdue,
                                    manuallyTriggered: true
                                }
                            })];
                    case 10:
                        queueResult = _f.sent();
                        if (!queueResult.success) {
                            return [2 /*return*/, { success: false, error: queueResult.error }];
                        }
                        // Record reminder sent
                        return [4 /*yield*/, recordReminderSent(invoice.id, input.reminderType, client.email, (_e = ctx.user) === null || _e === void 0 ? void 0 : _e.id)];
                    case 11:
                        // Record reminder sent
                        _f.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Reminder queued for " + client.companyName,
                                queueId: queueResult.queueId
                            }];
                    case 12:
                        error_7 = _f.sent();
                        console.error("[PAYMENT REMINDERS] Error sending reminder:", error_7);
                        return [2 /*return*/, { success: false, error: String(error_7) }];
                    case 13: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get reminder history for invoice
     */
    getReminderHistory: readProcedure
        .input(zod_1.z.object({ invoiceId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, reminders, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { reminders: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.getInvoiceReminderHistory(input.invoiceId)];
                    case 3:
                        reminders = _b.sent();
                        return [2 /*return*/, { reminders: reminders }];
                    case 4:
                        error_8 = _b.sent();
                        console.error("[PAYMENT REMINDERS] Error getting reminder history:", error_8);
                        return [2 /*return*/, { reminders: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Manually trigger overdue reminder process (admin)
     */
    processOverdueReminders: writeProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== "admin" && ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "super_admin" && ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.role) !== "system") {
                            throw new Error("Unauthorized - admin only");
                        }
                        return [4 /*yield*/, sendOverdueReminders()];
                    case 1:
                        result = _e.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    })
});
