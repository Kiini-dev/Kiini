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
exports.stopScheduledJobs = exports.initializeScheduledJobs = void 0;
var cron_1 = require("cron");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var emailNotifications_1 = require("../routers/emailNotifications");
var nanoid_1 = require("nanoid");
/**
 * Initialize scheduled jobs for invoice reminders
 * Runs daily at 9 AM to check for overdue invoices and send reminders
 */
function initializeScheduledJobs() {
    var _this = this;
    // Daily invoice reminder job - runs at 9:00 AM
    var invoiceReminderJob = new cron_1.CronJob("0 9 * * *", // Every day at 9 AM
    function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[CRON] Running invoice reminder job...");
                    return [4 /*yield*/, processInvoiceReminders()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, null, true, // Start immediately
    "Africa/Nairobi" // Timezone
    );
    // Weekly unpaid invoice summary - runs every Monday at 8 AM
    var weeklyUnpaidJob = new cron_1.CronJob("0 8 * * 1", // Every Monday at 8 AM
    function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[CRON] Running weekly unpaid invoices summary job...");
                    return [4 /*yield*/, sendWeeklyUnpaidSummary()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, null, true, // Start immediately
    "Africa/Nairobi");
    // Recurring invoices generation job - runs at 10:00 AM
    var recurringInvoicesJob = new cron_1.CronJob("0 10 * * *", // Every day at 10 AM
    function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[CRON] Running recurring invoices generation job...");
                    return [4 /*yield*/, processRecurringInvoices()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, null, true, // Start immediately
    "Africa/Nairobi");
    // Installment reminders job - runs at 11:00 AM daily
    var installmentRemindersJob = new cron_1.CronJob("0 11 * * *", // Every day at 11 AM
    function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[CRON] Running installment reminders job...");
                    return [4 /*yield*/, processInstallmentReminders()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, null, true, // Start immediately
    "Africa/Nairobi");
    // Milestone reminders job - runs at 12:00 PM daily
    var milestoneRemindersJob = new cron_1.CronJob("0 12 * * *", // Every day at 12 PM
    function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[CRON] Running milestone reminders job...");
                    return [4 /*yield*/, processMilestoneReminders()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, null, true, // Start immediately
    "Africa/Nairobi");
    console.log("[SCHEDULER] Invoice reminder jobs initialized");
    return {
        invoiceReminder: invoiceReminderJob,
        weeklyUnpaid: weeklyUnpaidJob,
        recurringInvoices: recurringInvoicesJob,
        installmentReminders: installmentRemindersJob,
        milestoneReminders: milestoneRemindersJob
    };
}
exports.initializeScheduledJobs = initializeScheduledJobs;
/**
 * Process overdue invoices and send reminders
 */
function processInvoiceReminders() {
    return __awaiter(this, void 0, void 0, function () {
        var db, now, oneDayBefore, overdueBefore, upcomingInvoices, _i, upcomingInvoices_1, invoice, daysUntilDue, err_1, overdueInvoices, _a, overdueInvoices_1, invoice, daysOverdue, err_2, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 18, , 19]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        console.error("[CRON] Database not available");
                        return [2 /*return*/];
                    }
                    now = new Date();
                    oneDayBefore = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
                    overdueBefore = new Date(now.getTime() - 0 * 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.status, "sent"), 
                        // Due within next 24 hours
                        drizzle_orm_1.lt(schema_1.invoices.dueDate, new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19))))
                            .limit(100)];
                case 2:
                    upcomingInvoices = _b.sent();
                    console.log("[CRON] Found " + upcomingInvoices.length + " invoices with upcoming due dates");
                    _i = 0, upcomingInvoices_1 = upcomingInvoices;
                    _b.label = 3;
                case 3:
                    if (!(_i < upcomingInvoices_1.length)) return [3 /*break*/, 9];
                    invoice = upcomingInvoices_1[_i];
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 7, , 8]);
                    daysUntilDue = Math.ceil((new Date(invoice.dueDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                    if (!(daysUntilDue <= 1 && daysUntilDue > 0)) return [3 /*break*/, 6];
                    console.log("[CRON] Sending reminder for invoice " + invoice.invoiceNumber + " (due in " + daysUntilDue + " day)");
                    return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                            userId: invoice.createdBy || "system",
                            eventType: "invoice_overdue",
                            recipientEmail: "client@example.com",
                            recipientName: "Client",
                            subject: "Invoice Reminder - " + invoice.invoiceNumber + " Due Tomorrow",
                            htmlContent: "\n              <h2>Payment Reminder</h2>\n              <p>Invoice <strong>" + invoice.invoiceNumber + "</strong> is due tomorrow!</p>\n              <ul>\n                <li><strong>Amount:</strong> Ksh " + (invoice.total / 100).toLocaleString("en-KE") + "</li>\n                <li><strong>Due Date:</strong> " + new Date(invoice.dueDate).toLocaleDateString() + "</li>\n              </ul>\n              <p>Please process payment to avoid late fees.</p>\n            ",
                            entityType: "invoice",
                            entityId: invoice.id,
                            actionUrl: "/invoices/" + invoice.id
                        })];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    err_1 = _b.sent();
                    console.error("[CRON] Failed to send reminder for invoice " + invoice.invoiceNumber + ":", err_1);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 3];
                case 9: return [4 /*yield*/, db
                        .select()
                        .from(schema_1.invoices)
                        .where(drizzle_orm_1.and(
                    // Not paid or partial
                    drizzle_orm_1.lt(schema_1.invoices.paidAmount, schema_1.invoices.total), 
                    // Past due date
                    drizzle_orm_1.lt(schema_1.invoices.dueDate, now.toISOString().replace('T', ' ').substring(0, 19))))
                        .limit(100)];
                case 10:
                    overdueInvoices = _b.sent();
                    console.log("[CRON] Found " + overdueInvoices.length + " overdue invoices");
                    _a = 0, overdueInvoices_1 = overdueInvoices;
                    _b.label = 11;
                case 11:
                    if (!(_a < overdueInvoices_1.length)) return [3 /*break*/, 17];
                    invoice = overdueInvoices_1[_a];
                    _b.label = 12;
                case 12:
                    _b.trys.push([12, 15, , 16]);
                    daysOverdue = Math.ceil((now.getTime() - new Date(invoice.dueDate).getTime()) / (24 * 60 * 60 * 1000));
                    if (!(daysOverdue > 0 && daysOverdue <= 30)) return [3 /*break*/, 14];
                    // Limit reminders to first 30 days
                    console.log("[CRON] Sending overdue reminder for invoice " + invoice.invoiceNumber + " (" + daysOverdue + " days overdue)");
                    return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                            userId: invoice.createdBy || "system",
                            eventType: "invoice_overdue",
                            recipientEmail: "client@example.com",
                            recipientName: "Client",
                            subject: "Urgent: Invoice " + invoice.invoiceNumber + " is " + daysOverdue + " Days Overdue",
                            htmlContent: "\n              <h2>Payment Urgent</h2>\n              <p>Invoice <strong>" + invoice.invoiceNumber + "</strong> is now <strong>" + daysOverdue + " days overdue</strong>.</p>\n              <ul>\n                <li><strong>Amount Due:</strong> Ksh " + ((invoice.total - (invoice.paidAmount || 0)) / 100).toLocaleString("en-KE") + "</li>\n                <li><strong>Due Date:</strong> " + new Date(invoice.dueDate).toLocaleDateString() + "</li>\n              </ul>\n              <p>Please remit payment immediately. Contact us if you have any questions.</p>\n            ",
                            entityType: "invoice",
                            entityId: invoice.id,
                            actionUrl: "/invoices/" + invoice.id
                        })];
                case 13:
                    _b.sent();
                    _b.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    err_2 = _b.sent();
                    console.error("[CRON] Failed to send overdue reminder for invoice " + invoice.invoiceNumber + ":", err_2);
                    return [3 /*break*/, 16];
                case 16:
                    _a++;
                    return [3 /*break*/, 11];
                case 17:
                    console.log("[CRON] Invoice reminder job completed successfully");
                    return [3 /*break*/, 19];
                case 18:
                    err_3 = _b.sent();
                    console.error("[CRON] Error processing invoice reminders:", err_3);
                    return [3 /*break*/, 19];
                case 19: return [2 /*return*/];
            }
        });
    });
}
/**
 * Send weekly summary of unpaid invoices
 */
function sendWeeklyUnpaidSummary() {
    return __awaiter(this, void 0, void 0, function () {
        var db, now, unpaidInvoices, totalUnpaid, overdueCount, invoiceList, htmlContent, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error("[CRON] Database not available");
                        return [2 /*return*/];
                    }
                    now = new Date();
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.lt(schema_1.invoices.paidAmount, schema_1.invoices.total) // paidAmount < total
                        )
                            .limit(100)];
                case 2:
                    unpaidInvoices = _a.sent();
                    if (unpaidInvoices.length === 0) {
                        console.log("[CRON] No unpaid invoices for weekly summary");
                        return [2 /*return*/];
                    }
                    console.log("[CRON] Sending weekly summary for " + unpaidInvoices.length + " unpaid invoices");
                    totalUnpaid = unpaidInvoices.reduce(function (sum, inv) { return sum + (inv.total - (inv.paidAmount || 0)); }, 0);
                    overdueCount = unpaidInvoices.filter(function (inv) { return new Date(inv.dueDate) < new Date(); }).length;
                    invoiceList = unpaidInvoices
                        .slice(0, 10)
                        .map(function (inv) {
                        return "<li>" + inv.invoiceNumber + " - Ksh " + ((inv.total - (inv.paidAmount || 0)) / 100).toLocaleString("en-KE") + " (Due: " + new Date(inv.dueDate).toLocaleDateString() + ")</li>";
                    })
                        .join("");
                    htmlContent = "\n      <h2>Weekly Unpaid Invoices Summary</h2>\n      <p>Total unpaid invoices: <strong>" + unpaidInvoices.length + "</strong></p>\n      <p>Total amount due: <strong>Ksh " + (totalUnpaid / 100).toLocaleString("en-KE") + "</strong></p>\n      <p>Overdue invoices: <strong>" + overdueCount + "</strong></p>\n      \n      <h3>Top Unpaid Invoices</h3>\n      <ul>" + invoiceList + "</ul>\n      \n      <p><a href=\"/invoices?status=unpaid\">View All Unpaid Invoices</a></p>\n    ";
                    return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                            userId: "system",
                            eventType: "invoice_overdue",
                            recipientEmail: "accounting@company.com",
                            recipientName: "Accounting Team",
                            subject: "Weekly Summary: " + unpaidInvoices.length + " Unpaid Invoices Worth Ksh " + (totalUnpaid / 100).toLocaleString("en-KE"),
                            htmlContent: htmlContent,
                            entityType: "invoice",
                            entityId: "summary",
                            actionUrl: "/invoices?status=unpaid"
                        })];
                case 3:
                    _a.sent();
                    console.log("[CRON] Weekly unpaid summary sent successfully");
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    console.error("[CRON] Error sending weekly unpaid summary:", err_4);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Stop all scheduled jobs
 */
function stopScheduledJobs(jobs) {
    try {
        jobs.invoiceReminder.stop();
        jobs.weeklyUnpaid.stop();
        jobs.recurringInvoices.stop();
        jobs.installmentReminders.stop();
        jobs.milestoneReminders.stop();
        console.log("[SCHEDULER] All scheduled jobs stopped");
    }
    catch (err) {
        console.error("[SCHEDULER] Error stopping scheduled jobs:", err);
    }
}
exports.stopScheduledJobs = stopScheduledJobs;
/**
 * Process recurring invoices and auto-generate new invoices when due
 */
function processRecurringInvoices() {
    return __awaiter(this, void 0, void 0, function () {
        var db, now, dueRecurringInvoices, _loop_1, _i, dueRecurringInvoices_1, recurring, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error("[CRON] Database not available for recurring invoices");
                        return [2 /*return*/];
                    }
                    now = new Date();
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.recurringInvoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.recurringInvoices.isActive, 1), drizzle_orm_1.lte(schema_1.recurringInvoices.nextDueDate, now.toISOString().replace('T', ' ').substring(0, 19))))
                            .limit(100)];
                case 2:
                    dueRecurringInvoices = _a.sent();
                    console.log("[CRON] Found " + dueRecurringInvoices.length + " recurring invoices to process");
                    _loop_1 = function (recurring) {
                        var template, templateLineItems, newInvoiceId_1, invoiceNumber, nextDueDate, err_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 10, , 11]);
                                    if (!(recurring.endDate && new Date(recurring.endDate) < now)) return [3 /*break*/, 2];
                                    console.log("[CRON] Recurring invoice " + recurring.id + " has passed end date, deactivating");
                                    return [4 /*yield*/, db
                                            .update(schema_1.recurringInvoices)
                                            .set({ isActive: 0 })
                                            .where(drizzle_orm_1.eq(schema_1.recurringInvoices.id, recurring.id))];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, "continue"];
                                case 2: return [4 /*yield*/, db
                                        .select()
                                        .from(schema_1.invoices)
                                        .where(drizzle_orm_1.eq(schema_1.invoices.id, recurring.templateInvoiceId))
                                        .limit(1)];
                                case 3:
                                    template = _a.sent();
                                    if (!template.length) {
                                        console.error("[CRON] Template invoice " + recurring.templateInvoiceId + " not found");
                                        return [2 /*return*/, "continue"];
                                    }
                                    return [4 /*yield*/, db
                                            .select()
                                            .from(schema_1.lineItems)
                                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, template[0].id), drizzle_orm_1.eq(schema_1.lineItems.documentType, "invoice")))];
                                case 4:
                                    templateLineItems = _a.sent();
                                    newInvoiceId_1 = nanoid_1.nanoid();
                                    invoiceNumber = template[0].invoiceNumber + "-REC-" + now.toISOString().split("T")[0].replace(/-/g, "");
                                    nextDueDate = calculateNextDueDate(now, recurring.frequency);
                                    return [4 /*yield*/, db.insert(schema_1.invoices).values({
                                            id: newInvoiceId_1,
                                            invoiceNumber: invoiceNumber,
                                            clientId: recurring.clientId,
                                            recurringInvoiceId: recurring.id,
                                            title: template[0].title,
                                            status: "draft",
                                            issueDate: now.toISOString().replace('T', ' ').substring(0, 19),
                                            dueDate: nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
                                            subtotal: template[0].subtotal,
                                            taxAmount: template[0].taxAmount || 0,
                                            discountAmount: template[0].discountAmount || 0,
                                            total: template[0].total,
                                            paidAmount: 0,
                                            createdFromRecurring: 1,
                                            notes: (template[0].notes || "") +
                                                "\n\n--- Auto-generated from recurring invoice ---" +
                                                (recurring.noteToInvoice ? "\n" + recurring.noteToInvoice : ""),
                                            terms: template[0].terms,
                                            createdBy: "system"
                                        })];
                                case 5:
                                    _a.sent();
                                    if (!(templateLineItems.length > 0)) return [3 /*break*/, 7];
                                    return [4 /*yield*/, db.insert(schema_1.lineItems).values(templateLineItems.map(function (item) { return ({
                                            id: nanoid_1.nanoid(),
                                            documentId: newInvoiceId_1,
                                            documentType: "invoice",
                                            description: item.description,
                                            quantity: item.quantity,
                                            rate: item.rate,
                                            amount: item.amount,
                                            productId: item.productId,
                                            serviceId: item.serviceId,
                                            taxRate: item.taxRate || 0,
                                            taxAmount: item.taxAmount || 0,
                                            lineNumber: item.lineNumber || 1,
                                            createdBy: "system"
                                        }); }))];
                                case 6:
                                    _a.sent();
                                    _a.label = 7;
                                case 7: 
                                // Update recurring invoice's nextDueDate and lastGeneratedDate
                                return [4 /*yield*/, db
                                        .update(schema_1.recurringInvoices)
                                        .set({
                                        nextDueDate: nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
                                        lastGeneratedDate: now.toISOString().replace('T', ' ').substring(0, 19)
                                    })
                                        .where(drizzle_orm_1.eq(schema_1.recurringInvoices.id, recurring.id))];
                                case 8:
                                    // Update recurring invoice's nextDueDate and lastGeneratedDate
                                    _a.sent();
                                    console.log("[CRON] Generated invoice " + invoiceNumber + " from recurring template " + recurring.id);
                                    // Trigger notification
                                    return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                            userId: "system",
                                            eventType: "invoice_created",
                                            recipientEmail: "accounting@company.com",
                                            recipientName: "Accounting Team",
                                            subject: "Recurring Invoice Generated: " + invoiceNumber,
                                            htmlContent: "\n            <h2>Recurring Invoice Generated</h2>\n            <p>Invoice <strong>" + invoiceNumber + "</strong> has been auto-generated from recurring template.</p>\n            <ul>\n              <li><strong>Amount:</strong> Ksh " + (template[0].total / 100).toLocaleString("en-KE") + "</li>\n              <li><strong>Due Date:</strong> " + nextDueDate.toLocaleDateString() + "</li>\n              <li><strong>From Template:</strong> " + template[0].invoiceNumber + "</li>\n            </ul>\n            <p><a href=\"/invoices/" + newInvoiceId_1 + "\">View Invoice</a></p>\n          ",
                                            entityType: "invoice",
                                            entityId: newInvoiceId_1,
                                            actionUrl: "/invoices/" + newInvoiceId_1
                                        })];
                                case 9:
                                    // Trigger notification
                                    _a.sent();
                                    return [3 /*break*/, 11];
                                case 10:
                                    err_6 = _a.sent();
                                    console.error("[CRON] Error processing recurring invoice " + recurring.id + ":", err_6);
                                    return [3 /*break*/, 11];
                                case 11: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, dueRecurringInvoices_1 = dueRecurringInvoices;
                    _a.label = 3;
                case 3:
                    if (!(_i < dueRecurringInvoices_1.length)) return [3 /*break*/, 6];
                    recurring = dueRecurringInvoices_1[_i];
                    return [5 /*yield**/, _loop_1(recurring)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    err_5 = _a.sent();
                    console.error("[CRON] Error in processRecurringInvoices:", err_5);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Calculate next due date based on frequency
 */
function calculateNextDueDate(currentDate, frequency) {
    var nextDate = new Date(currentDate);
    switch (frequency) {
        case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case "biweekly":
            nextDate.setDate(nextDate.getDate() + 14);
            break;
        case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case "quarterly":
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
        case "annually":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
    }
    return nextDate;
}
/**
 * Process payment plan installment reminders
 */
function processInstallmentReminders() {
    return __awaiter(this, void 0, void 0, function () {
        var db, now, tomorrow, overdueBefore, upcomingInstallments, _i, upcomingInstallments_1, record, installment, plan, err_7, overdueInstallments, _a, overdueInstallments_1, record, installment, plan, daysOverdue, err_8, err_9;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 17, , 18]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        console.error("[CRON] Database not available for installment reminders");
                        return [2 /*return*/];
                    }
                    now = new Date();
                    tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
                    overdueBefore = new Date(now.getTime());
                    return [4 /*yield*/, db
                            .select({
                            installment: schema_1.paymentPlanInstallments,
                            plan: schema_1.paymentPlans
                        })
                            .from(schema_1.paymentPlanInstallments)
                            .innerJoin(schema_1.paymentPlans, drizzle_orm_1.eq(schema_1.paymentPlanInstallments.paymentPlanId, schema_1.paymentPlans.id))
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.paymentPlanInstallments.status, "pending"), drizzle_orm_1.gte(schema_1.paymentPlanInstallments.dueDate, now.toISOString()), drizzle_orm_1.lte(schema_1.paymentPlanInstallments.dueDate, tomorrow.toISOString()), drizzle_orm_1.eq(schema_1.paymentPlans.status, "active")))];
                case 2:
                    upcomingInstallments = _b.sent();
                    console.log("[CRON] Found " + upcomingInstallments.length + " upcoming payment plan installments");
                    _i = 0, upcomingInstallments_1 = upcomingInstallments;
                    _b.label = 3;
                case 3:
                    if (!(_i < upcomingInstallments_1.length)) return [3 /*break*/, 8];
                    record = upcomingInstallments_1[_i];
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    installment = record.installment, plan = record.plan;
                    console.log("[CRON] Sending reminder for installment " + installment.installmentNumber + " of plan " + plan.id);
                    return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                            userId: plan.createdBy || "system",
                            eventType: "invoice_overdue",
                            recipientEmail: "client@example.com",
                            recipientName: "Client",
                            subject: "Payment Reminder - Installment " + installment.installmentNumber + " Due Tomorrow",
                            htmlContent: "\n            <h2>Payment Plan Installment Due Tomorrow</h2>\n            <ul>\n              <li><strong>Installment:</strong> " + installment.installmentNumber + "</li>\n              <li><strong>Amount:</strong> Ksh " + (installment.amount / 100).toLocaleString("en-KE") + "</li>\n              <li><strong>Due Date:</strong> " + new Date(installment.dueDate).toLocaleDateString() + "</li>\n            </ul>\n            <p>Please process payment to avoid late penalties.</p>\n          ",
                            entityType: "payment_plan",
                            entityId: plan.id
                        })];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    err_7 = _b.sent();
                    console.error("[CRON] Error processing upcoming installment " + record.installment.id + ":", err_7);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [4 /*yield*/, db
                        .select({
                        installment: schema_1.paymentPlanInstallments,
                        plan: schema_1.paymentPlans
                    })
                        .from(schema_1.paymentPlanInstallments)
                        .innerJoin(schema_1.paymentPlans, drizzle_orm_1.eq(schema_1.paymentPlanInstallments.paymentPlanId, schema_1.paymentPlans.id))
                        .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.paymentPlanInstallments.status, "pending"), drizzle_orm_1.lte(schema_1.paymentPlanInstallments.dueDate, overdueBefore.toISOString()), drizzle_orm_1.eq(schema_1.paymentPlans.status, "active")))];
                case 9:
                    overdueInstallments = _b.sent();
                    console.log("[CRON] Found " + overdueInstallments.length + " overdue installments");
                    _a = 0, overdueInstallments_1 = overdueInstallments;
                    _b.label = 10;
                case 10:
                    if (!(_a < overdueInstallments_1.length)) return [3 /*break*/, 16];
                    record = overdueInstallments_1[_a];
                    _b.label = 11;
                case 11:
                    _b.trys.push([11, 14, , 15]);
                    installment = record.installment, plan = record.plan;
                    console.log("[CRON] Sending overdue notice for installment " + installment.installmentNumber + " of plan " + plan.id);
                    // Mark as overdue in DB
                    return [4 /*yield*/, db
                            .update(schema_1.paymentPlanInstallments)
                            .set({ status: "overdue" })
                            .where(drizzle_orm_1.eq(schema_1.paymentPlanInstallments.id, installment.id))];
                case 12:
                    // Mark as overdue in DB
                    _b.sent();
                    daysOverdue = Math.floor((now.getTime() - new Date(installment.dueDate).getTime()) / (24 * 60 * 60 * 1000));
                    return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                            userId: plan.createdBy || "system",
                            eventType: "invoice_overdue",
                            recipientEmail: "client@example.com",
                            recipientName: "Client",
                            subject: "URGENT: Overdue Payment - Installment " + installment.installmentNumber + " (" + daysOverdue + " days overdue)",
                            htmlContent: "\n            <h2>URGENT: Overdue Payment Notification</h2>\n            <p style=\"color: red;\"><strong>Your payment is " + daysOverdue + " days overdue</strong></p>\n            <ul>\n              <li><strong>Installment:</strong> " + installment.installmentNumber + "</li>\n              <li><strong>Amount:</strong> Ksh " + (installment.amount / 100).toLocaleString("en-KE") + "</li>\n              <li><strong>Due Date:</strong> " + new Date(installment.dueDate).toLocaleDateString() + "</li>\n              <li><strong>Days Overdue:</strong> " + daysOverdue + "</li>\n            </ul>\n            <p>Immediate payment is required to avoid additional penalties and suspension of further credits.</p>\n          ",
                            entityType: "payment_plan",
                            entityId: plan.id
                        })];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 14:
                    err_8 = _b.sent();
                    console.error("[CRON] Error processing overdue installment " + record.installment.id + ":", err_8);
                    return [3 /*break*/, 15];
                case 15:
                    _a++;
                    return [3 /*break*/, 10];
                case 16:
                    console.log("[CRON] Installment reminders processed successfully");
                    return [3 /*break*/, 18];
                case 17:
                    err_9 = _b.sent();
                    console.error("[CRON] Error in processInstallmentReminders:", err_9);
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/];
            }
        });
    });
}
/**
 * Process project milestone reminders
 */
function processMilestoneReminders() {
    return __awaiter(this, void 0, void 0, function () {
        var db, now, tomorrow, upcomingMilestones, _i, upcomingMilestones_1, record, milestone, project, err_10, overdueMilestones, _a, overdueMilestones_1, record, milestone, project, daysOverdue, err_11, err_12;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 16, , 17]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        console.error("[CRON] Database not available for milestone reminders");
                        return [2 /*return*/];
                    }
                    now = new Date();
                    tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, db
                            .select({
                            milestone: schema_1.projectMilestones,
                            project: schema_1.projects
                        })
                            .from(schema_1.projectMilestones)
                            .innerJoin(schema_1.projects, drizzle_orm_1.eq(schema_1.projectMilestones.projectId, schema_1.projects.id))
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.projectMilestones.status, "planning"), drizzle_orm_1.gte(schema_1.projectMilestones.dueDate, now.toISOString()), drizzle_orm_1.lte(schema_1.projectMilestones.dueDate, tomorrow.toISOString())))];
                case 2:
                    upcomingMilestones = _b.sent();
                    console.log("[CRON] Found " + upcomingMilestones.length + " upcoming project milestones");
                    _i = 0, upcomingMilestones_1 = upcomingMilestones;
                    _b.label = 3;
                case 3:
                    if (!(_i < upcomingMilestones_1.length)) return [3 /*break*/, 8];
                    record = upcomingMilestones_1[_i];
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    milestone = record.milestone, project = record.project;
                    console.log("[CRON] Sending reminder for milestone \"" + milestone.phaseName + "\" of project " + project.projectNumber);
                    return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                            userId: project.projectManager || project.createdBy || "system",
                            eventType: "invoice_overdue",
                            recipientEmail: "team@company.com",
                            recipientName: "Project Team",
                            subject: "Project Milestone Reminder: " + project.projectNumber + " - " + milestone.phaseName,
                            htmlContent: "\n            <h2>Project Milestone Due Tomorrow</h2>\n            <p><strong>Project:</strong> " + project.projectNumber + " - " + project.name + "</p>\n            <p><strong>Milestone:</strong> " + milestone.phaseName + "</p>\n            <p><strong>Due Date:</strong> " + new Date(milestone.dueDate).toLocaleDateString() + "</p>\n            " + (milestone.deliverables ? "<p><strong>Deliverables:</strong> " + milestone.deliverables + "</p>" : "") + "\n            <p>Please ensure all deliverables are on track for completion.</p>\n          ",
                            entityType: "project_milestone",
                            entityId: milestone.id,
                            actionUrl: "/projects/" + project.id
                        })];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    err_10 = _b.sent();
                    console.error("[CRON] Error processing upcoming milestone " + record.milestone.id + ":", err_10);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [4 /*yield*/, db
                        .select({
                        milestone: schema_1.projectMilestones,
                        project: schema_1.projects
                    })
                        .from(schema_1.projectMilestones)
                        .innerJoin(schema_1.projects, drizzle_orm_1.eq(schema_1.projectMilestones.projectId, schema_1.projects.id))
                        .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.projectMilestones.status, "in_progress"), drizzle_orm_1.lte(schema_1.projectMilestones.dueDate, now.toISOString())))];
                case 9:
                    overdueMilestones = _b.sent();
                    console.log("[CRON] Found " + overdueMilestones.length + " overdue project milestones");
                    _a = 0, overdueMilestones_1 = overdueMilestones;
                    _b.label = 10;
                case 10:
                    if (!(_a < overdueMilestones_1.length)) return [3 /*break*/, 15];
                    record = overdueMilestones_1[_a];
                    _b.label = 11;
                case 11:
                    _b.trys.push([11, 13, , 14]);
                    milestone = record.milestone, project = record.project;
                    console.log("[CRON] Sending overdue notice for milestone \"" + milestone.phaseName + "\" of project " + project.projectNumber);
                    daysOverdue = Math.floor((now.getTime() - new Date(milestone.dueDate).getTime()) / (24 * 60 * 60 * 1000));
                    return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                            userId: project.projectManager || project.createdBy || "system",
                            eventType: "invoice_overdue",
                            recipientEmail: "team@company.com",
                            recipientName: "Project Team",
                            subject: "URGENT: Overdue Project Milestone - " + project.projectNumber + " (" + daysOverdue + " days overdue)",
                            htmlContent: "\n            <h2>URGENT: Overdue Project Milestone</h2>\n            <p style=\"color: red;\"><strong>Milestone is " + daysOverdue + " day(s) overdue</strong></p>\n            <p><strong>Project:</strong> " + project.projectNumber + " - " + project.name + "</p>\n            <p><strong>Milestone:</strong> " + milestone.phaseName + "</p>\n            <p><strong>Due Date:</strong> " + new Date(milestone.dueDate).toLocaleDateString() + "</p>\n            <p><strong>Days Overdue:</strong> " + daysOverdue + "</p>\n            " + (milestone.deliverables ? "<p><strong>Deliverables:</strong> " + milestone.deliverables + "</p>" : "") + "\n            <p>Immediate action is required to get this milestone back on track.</p>\n          ",
                            entityType: "project_milestone",
                            entityId: milestone.id,
                            actionUrl: "/projects/" + project.id
                        })];
                case 12:
                    _b.sent();
                    return [3 /*break*/, 14];
                case 13:
                    err_11 = _b.sent();
                    console.error("[CRON] Error processing overdue milestone " + record.milestone.id + ":", err_11);
                    return [3 /*break*/, 14];
                case 14:
                    _a++;
                    return [3 /*break*/, 10];
                case 15:
                    console.log("[CRON] Milestone reminders processed successfully");
                    return [3 /*break*/, 17];
                case 16:
                    err_12 = _b.sent();
                    console.error("[CRON] Error in processMilestoneReminders:", err_12);
                    return [3 /*break*/, 17];
                case 17: return [2 /*return*/];
            }
        });
    });
}
