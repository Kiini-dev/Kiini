"use strict";
/**
 * Organization Subscription Lifecycle Management
 * Handles automated renewal, overdue detection, and email notifications
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
exports.checkAndSuspendOverdue = exports.sendBillingReminders = exports.processSubscriptionRenewals = exports.initializeBillingCronJobs = void 0;
var node_cron_1 = require("node-cron");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var mail_1 = require("../_core/mail");
var logger = console;
/**
 * Daily task: Check subscriptions for renewal dates and auto-pay
 * Runs at 2 AM UTC every day
 */
function processSubscriptionRenewals() {
    return __awaiter(this, void 0, void 0, function () {
        var database, activeSubscriptions, now, processedCount, _i, activeSubscriptions_1, sub, renewalDate, hoursUntilRenewal, org, invoiceId, newRenewalDate, invoiceData, existingInvoice, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 12]);
                    logger.log("[OrgBilling] Starting subscription renewal check...");
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error("Database not available");
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.subscriptions.autoRenew, 1), drizzle_orm_1.eq(schema_1.subscriptions.status, "active")))];
                case 2:
                    activeSubscriptions = _a.sent();
                    now = new Date();
                    processedCount = 0;
                    _i = 0, activeSubscriptions_1 = activeSubscriptions;
                    _a.label = 3;
                case 3:
                    if (!(_i < activeSubscriptions_1.length)) return [3 /*break*/, 10];
                    sub = activeSubscriptions_1[_i];
                    renewalDate = new Date(sub.renewalDate);
                    hoursUntilRenewal = (renewalDate.getTime() - now.getTime()) / (60 * 60 * 1000);
                    if (hoursUntilRenewal > 24)
                        return [3 /*break*/, 9];
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.organizations)
                            .where(drizzle_orm_1.eq(schema_1.organizations.id, sub.organizationId || ""))
                            .limit(1)];
                case 4:
                    org = _a.sent();
                    if (!org.length) {
                        logger.warn("[OrgBilling] Organization not found for subscription " + sub.id);
                        return [3 /*break*/, 9];
                    }
                    invoiceId = sub.id;
                    newRenewalDate = new Date(renewalDate);
                    if (sub.billingCycle === "monthly") {
                        newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
                    }
                    else {
                        newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
                    }
                    invoiceData = {
                        id: invoiceId,
                        subscriptionId: sub.id,
                        invoiceNumber: "INV-" + org[0].id.slice(0, 4) + "-" + Date.now().toString().slice(-6),
                        amount: sub.currentPrice || 0,
                        tax: 0,
                        totalAmount: sub.currentPrice || 0,
                        currency: org[0].currency || "KES",
                        status: "pending",
                        billingPeriodStart: renewalDate,
                        billingPeriodEnd: newRenewalDate,
                        dueDate: renewalDate,
                        sentAt: now,
                        paidAt: null,
                        paymentMethod: null,
                        paymentReference: null,
                        notes: "Auto-renewal for " + sub.billingCycle + " subscription",
                        createdAt: now,
                        updatedAt: now
                    };
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.billingInvoices)
                            .where(drizzle_orm_1.eq(schema_1.billingInvoices.subscriptionId, sub.id))
                            .limit(1)];
                case 5:
                    existingInvoice = _a.sent();
                    if (!!existingInvoice.length) return [3 /*break*/, 9];
                    return [4 /*yield*/, database.insert(schema_1.billingInvoices).values(invoiceData)];
                case 6:
                    _a.sent();
                    if (!org[0].billingEmail) return [3 /*break*/, 8];
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: org[0].billingEmail,
                            subject: "Invoice " + invoiceData.invoiceNumber + " - " + org[0].name,
                            html: "\n              <h2>Invoice for Your Subscription</h2>\n              <p>Dear " + org[0].name + ",</p>\n              <p>Your subscription invoice is attached below:</p>\n              <table>\n                <tr><td>Invoice Number:</td><td>" + invoiceData.invoiceNumber + "</td></tr>\n                <tr><td>Billing Period:</td><td>" + renewalDate.toLocaleDateString() + " - " + newRenewalDate.toLocaleDateString() + "</td></tr>\n                <tr><td>Amount:</td><td>" + invoiceData.totalAmount + " " + invoiceData.currency + "</td></tr>\n                <tr><td>Due Date:</td><td>" + renewalDate.toLocaleDateString() + "</td></tr>\n              </table>\n              <p>Please make payment by the due date to avoid service interruption.</p>\n            "
                        })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    processedCount++;
                    logger.log("[OrgBilling] Created renewal invoice for org " + org[0].id);
                    _a.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 3];
                case 10:
                    logger.log("[OrgBilling] Processed " + processedCount + " subscription renewals");
                    return [2 /*return*/, { success: true, count: processedCount }];
                case 11:
                    error_1 = _a.sent();
                    logger.error("[OrgBilling] Subscription renewal check failed:", error_1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
exports.processSubscriptionRenewals = processSubscriptionRenewals;
/**
 * Daily task: Send payment reminders and overdue warnings
 * Runs at 3 AM UTC every day
 */
function sendBillingReminders() {
    return __awaiter(this, void 0, void 0, function () {
        var database, activeSubscriptions, now, remindersSent, _i, activeSubscriptions_2, sub, renewalDate, daysUntilDue, org, shouldSendReminder, reminderType, message, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    logger.log("[OrgBilling] Starting billing reminders check...");
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error("Database not available");
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.status, "active"))];
                case 2:
                    activeSubscriptions = _a.sent();
                    now = new Date();
                    remindersSent = 0;
                    _i = 0, activeSubscriptions_2 = activeSubscriptions;
                    _a.label = 3;
                case 3:
                    if (!(_i < activeSubscriptions_2.length)) return [3 /*break*/, 7];
                    sub = activeSubscriptions_2[_i];
                    renewalDate = new Date(sub.renewalDate);
                    daysUntilDue = Math.ceil((renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.organizations)
                            .where(drizzle_orm_1.eq(schema_1.organizations.id, sub.organizationId || ""))
                            .limit(1)];
                case 4:
                    org = _a.sent();
                    if (!org.length || !org[0].billingEmail)
                        return [3 /*break*/, 6];
                    shouldSendReminder = false;
                    reminderType = "";
                    message = "";
                    // 7 days before due
                    if (daysUntilDue === 7) {
                        shouldSendReminder = true;
                        reminderType = "payment_due_7d";
                        message = "Your subscription payment is due in 7 days (" + renewalDate.toLocaleDateString() + "). Please ensure your payment method is up to date.";
                    }
                    // 3 days before due
                    else if (daysUntilDue === 3) {
                        shouldSendReminder = true;
                        reminderType = "payment_due_3d";
                        message = "Your subscription payment is due in 3 days (" + renewalDate.toLocaleDateString() + "). Please update your payment method if needed.";
                    }
                    // 1 day before due
                    else if (daysUntilDue === 1) {
                        shouldSendReminder = true;
                        reminderType = "payment_due_1d";
                        message = "Your subscription payment is due tomorrow (" + renewalDate.toLocaleDateString() + "). Your service will be suspended if payment is not made.";
                    }
                    // 1 day overdue
                    else if (daysUntilDue === -1) {
                        shouldSendReminder = true;
                        reminderType = "payment_overdue_1d";
                        message = "Your subscription payment is now 1 day overdue. Please make payment immediately to avoid service suspension.";
                    }
                    // 3 days overdue
                    else if (daysUntilDue === -3) {
                        shouldSendReminder = true;
                        reminderType = "payment_overdue_3d";
                        message = "Your subscription payment is 3 days overdue. Your account will be suspended in 24 hours if payment is not made.";
                    }
                    if (!shouldSendReminder) return [3 /*break*/, 6];
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: org[0].billingEmail,
                            subject: "Payment Reminder - " + org[0].name,
                            html: "\n            <h2>Payment Reminder</h2>\n            <p>Dear " + org[0].name + ",</p>\n            <p>" + message + "</p>\n            <p>Please log in to your account to view your invoice and make payment.</p>\n            <p>If you have any questions, please contact our billing support team.</p>\n          "
                        })];
                case 5:
                    _a.sent();
                    remindersSent++;
                    logger.log("[OrgBilling] Sent " + reminderType + " reminder to org " + org[0].id);
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7:
                    logger.log("[OrgBilling] Sent " + remindersSent + " billing reminders");
                    return [2 /*return*/, { success: true, count: remindersSent }];
                case 8:
                    error_2 = _a.sent();
                    logger.error("[OrgBilling] Billing reminders check failed:", error_2);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.sendBillingReminders = sendBillingReminders;
/**
 * Daily task: Check and suspend overdue subscriptions
 * Runs at 4 AM UTC every day
 */
function checkAndSuspendOverdue() {
    return __awaiter(this, void 0, void 0, function () {
        var database, allSubscriptions, now, suspendedCount, _i, allSubscriptions_1, sub, renewalDate, gracePeriodEnd, org, daysOverdue, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    logger.log("[OrgBilling] Starting overdue subscription check...");
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error("Database not available");
                    return [4 /*yield*/, database.select().from(schema_1.subscriptions)];
                case 2:
                    allSubscriptions = _a.sent();
                    now = new Date();
                    suspendedCount = 0;
                    _i = 0, allSubscriptions_1 = allSubscriptions;
                    _a.label = 3;
                case 3:
                    if (!(_i < allSubscriptions_1.length)) return [3 /*break*/, 9];
                    sub = allSubscriptions_1[_i];
                    // Skip already suspended/cancelled subscriptions
                    if (sub.status === "suspended" || sub.status === "cancelled" || sub.isLocked) {
                        return [3 /*break*/, 8];
                    }
                    renewalDate = new Date(sub.renewalDate);
                    gracePeriodEnd = new Date(renewalDate);
                    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3 day grace period
                    if (!(now > gracePeriodEnd)) return [3 /*break*/, 8];
                    return [4 /*yield*/, database
                            .update(schema_1.subscriptions)
                            .set({
                            status: "suspended",
                            isLocked: 1,
                            updatedAt: now
                        })
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.id, sub.id))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.organizations)
                            .where(drizzle_orm_1.eq(schema_1.organizations.id, sub.organizationId || ""))
                            .limit(1)];
                case 5:
                    org = _a.sent();
                    if (!(org.length && org[0].billingEmail)) return [3 /*break*/, 7];
                    daysOverdue = Math.ceil((now.getTime() - gracePeriodEnd.getTime()) / (24 * 60 * 60 * 1000));
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: org[0].billingEmail,
                            subject: "Account Suspended - Overdue Payment",
                            html: "\n              <h2>Account Suspension Notice</h2>\n              <p>Dear " + org[0].name + ",</p>\n              <p>Your subscription has been suspended due to non-payment. Your account has been " + daysOverdue + " days without payment.</p>\n              <p>To restore your service, please:</p>\n              <ol>\n                <li>Log in to your account</li>\n                <li>Update your payment method</li>\n                <li>Pay any outstanding invoices</li>\n              </ol>\n              <p>Your account will be permanently cancelled after 30 days of suspension.</p>\n              <p>Contact us immediately if you have any questions.</p>\n            "
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    suspendedCount++;
                    logger.log("[OrgBilling] Suspended subscription " + sub.id + " (org: " + sub.organizationId + ")");
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 3];
                case 9:
                    logger.log("[OrgBilling] Suspended " + suspendedCount + " overdue subscriptions");
                    return [2 /*return*/, { success: true, count: suspendedCount }];
                case 10:
                    error_3 = _a.sent();
                    logger.error("[OrgBilling] Overdue subscription check failed:", error_3);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.checkAndSuspendOverdue = checkAndSuspendOverdue;
/**
 * Initialize all billing-related cron jobs
 */
function initializeBillingCronJobs() {
    logger.log("[OrgBilling] Initializing billing cron jobs...");
    // Subscription renewal processing - 2 AM UTC daily
    node_cron_1["default"].schedule("0 2 * * *", function () {
        processSubscriptionRenewals()["catch"](function (err) {
            return logger.error("[OrgBilling] Renewal processing error:", err);
        });
    });
    // Billing reminders - 3 AM UTC daily
    node_cron_1["default"].schedule("0 3 * * *", function () {
        sendBillingReminders()["catch"](function (err) {
            return logger.error("[OrgBilling] Reminder sending error:", err);
        });
    });
    // Overdue suspension check - 4 AM UTC daily
    node_cron_1["default"].schedule("0 4 * * *", function () {
        checkAndSuspendOverdue()["catch"](function (err) {
            return logger.error("[OrgBilling] Suspension check error:", err);
        });
    });
    logger.log("[OrgBilling] Billing cron jobs initialized successfully");
}
exports.initializeBillingCronJobs = initializeBillingCronJobs;
