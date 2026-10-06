"use strict";
/**
 * Billing Automation Jobs Orchestrator
 * Manages all scheduled billing tasks: trial expiration, renewal invoices, payment reminders
 * Uses node-cron for scheduling
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
exports.initializeBillingJobs = exports.handlePaymentRetries = exports.handlePaymentReminders = exports.handleSubscriptionRenewal = exports.handleTrialExpiration = void 0;
var node_cron_1 = require("node-cron");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
/**
 * Trial Expiration Job (runs daily at 2 AM UTC)
 * 1. Sends warning email 7 days before trial ends
 * 2. Sends critical warning 24 hours before
 * 3. Marks org as suspended 1 day after trial ends (no payment)
 */
function handleTrialExpiration() {
    return __awaiter(this, void 0, Promise, function () {
        var db, errors, processedCount, expiringTrials, trials, _i, trials_1, trial, daysRemaining, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        return [2 /*return*/, {
                                jobName: "trial_expiration",
                                timestamp: new Date(),
                                success: false,
                                itemsProcessed: 0,
                                message: "Database unavailable",
                                errors: ["DB connection failed"]
                            }];
                    }
                    errors = [];
                    processedCount = 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 14, , 15]);
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT \n        os.organizationId, \n        os.trialEndDate,\n        o.organizationName,\n        o.email,\n        DATEDIFF(os.trialEndDate, NOW()) as daysRemaining\n      FROM organizationSubscriptions os\n      JOIN organizations o ON os.organizationId = o.id\n      WHERE os.trialEndDate IS NOT NULL \n        AND os.subscriptionStatus = 'trial'\n        AND os.trialEndDate > NOW()"], ["SELECT \n        os.organizationId, \n        os.trialEndDate,\n        o.organizationName,\n        o.email,\n        DATEDIFF(os.trialEndDate, NOW()) as daysRemaining\n      FROM organizationSubscriptions os\n      JOIN organizations o ON os.organizationId = o.id\n      WHERE os.trialEndDate IS NOT NULL \n        AND os.subscriptionStatus = 'trial'\n        AND os.trialEndDate > NOW()"]))))];
                case 3:
                    expiringTrials = _a.sent();
                    trials = expiringTrials.records || [];
                    _i = 0, trials_1 = trials;
                    _a.label = 4;
                case 4:
                    if (!(_i < trials_1.length)) return [3 /*break*/, 13];
                    trial = trials_1[_i];
                    daysRemaining = trial.daysRemaining || 0;
                    if (!(Math.abs(daysRemaining - 7) < 1)) return [3 /*break*/, 6];
                    return [4 /*yield*/, createPaymentTrigger(trial.organizationId, "trial_warning_7d", "email_reminder", trial)];
                case 5:
                    _a.sent();
                    processedCount++;
                    console.log("\uD83D\uDCE7 Trial 7-day warning scheduled for " + trial.organizationName);
                    _a.label = 6;
                case 6:
                    if (!(Math.abs(daysRemaining - 1) < 1)) return [3 /*break*/, 8];
                    return [4 /*yield*/, createPaymentTrigger(trial.organizationId, "trial_warning_24h", "email_critical", trial)];
                case 7:
                    _a.sent();
                    processedCount++;
                    console.log("\uD83D\uDD34 Trial critical warning scheduled for " + trial.organizationName);
                    _a.label = 8;
                case 8:
                    if (!(daysRemaining < -1)) return [3 /*break*/, 12];
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["UPDATE organizationSubscriptions \n              SET subscriptionStatus = 'suspended'\n              WHERE organizationId = ", ""], ["UPDATE organizationSubscriptions \n              SET subscriptionStatus = 'suspended'\n              WHERE organizationId = ", ""])), trial.organizationId))];
                case 9:
                    _a.sent();
                    // Disable all features
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["UPDATE organizations \n              SET isActive = false \n              WHERE id = ", ""], ["UPDATE organizations \n              SET isActive = false \n              WHERE id = ", ""])), trial.organizationId))];
                case 10:
                    // Disable all features
                    _a.sent();
                    return [4 /*yield*/, createAuditLog(trial.organizationId, "subscription_suspended", "organization", trial.organizationId, "Trial period ended without conversion to paid")];
                case 11:
                    _a.sent();
                    processedCount++;
                    console.log("\u26A0\uFE0F Organization suspended due to trial expiration: " + trial.organizationName);
                    _a.label = 12;
                case 12:
                    _i++;
                    return [3 /*break*/, 4];
                case 13: return [2 /*return*/, {
                        jobName: "trial_expiration",
                        timestamp: new Date(),
                        success: true,
                        itemsProcessed: processedCount,
                        message: "Processed " + processedCount + " trial expiration events",
                        errors: errors
                    }];
                case 14:
                    error_1 = _a.sent();
                    errors.push(error_1.message);
                    return [2 /*return*/, {
                            jobName: "trial_expiration",
                            timestamp: new Date(),
                            success: false,
                            itemsProcessed: 0,
                            message: "Error processing trial expirations",
                            errors: errors
                        }];
                case 15: return [2 /*return*/];
            }
        });
    });
}
exports.handleTrialExpiration = handleTrialExpiration;
/**
 * Subscription Renewal Job (runs daily at 3 AM UTC)
 * Generates invoices for organizations on auto-renew whose renewal date has arrived
 */
function handleSubscriptionRenewal() {
    return __awaiter(this, void 0, Promise, function () {
        var db, errors, processedCount, renewalDue, renewals, _i, renewals_1, renewal, amount, invoiceId, invoiceNumber, nextBillingDate, itemError_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        return [2 /*return*/, {
                                jobName: "subscription_renewal",
                                timestamp: new Date(),
                                success: false,
                                itemsProcessed: 0,
                                message: "Database unavailable",
                                errors: ["DB connection failed"]
                            }];
                    }
                    errors = [];
                    processedCount = 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 13, , 14]);
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["SELECT \n        os.organizationId,\n        os.nextBillingDate,\n        os.pricingTier,\n        o.organizationName,\n        o.email,\n        ptd.monthlyPrice,\n        ptd.annualPrice\n      FROM organizationSubscriptions os\n      JOIN organizations o ON os.organizationId = o.id\n      JOIN pricingTierDescriptions ptd ON os.pricingTier = ptd.tier\n      WHERE os.nextBillingDate <= NOW()\n        AND os.subscriptionStatus IN ('active', 'past_due')\n        AND os.autoRenewEnabled = true"], ["SELECT \n        os.organizationId,\n        os.nextBillingDate,\n        os.pricingTier,\n        o.organizationName,\n        o.email,\n        ptd.monthlyPrice,\n        ptd.annualPrice\n      FROM organizationSubscriptions os\n      JOIN organizations o ON os.organizationId = o.id\n      JOIN pricingTierDescriptions ptd ON os.pricingTier = ptd.tier\n      WHERE os.nextBillingDate <= NOW()\n        AND os.subscriptionStatus IN ('active', 'past_due')\n        AND os.autoRenewEnabled = true"]))))];
                case 3:
                    renewalDue = _a.sent();
                    renewals = renewalDue.records || [];
                    _i = 0, renewals_1 = renewals;
                    _a.label = 4;
                case 4:
                    if (!(_i < renewals_1.length)) return [3 /*break*/, 12];
                    renewal = renewals_1[_i];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 10, , 11]);
                    amount = renewal.monthlyPrice;
                    invoiceId = crypto.randomUUID();
                    invoiceNumber = "INV-" + Date.now();
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["INSERT INTO invoices (\n            id, organizationId, invoiceNumber, amount, status, \n            invoiceDate, dueDate, description, type\n          ) VALUES (\n            ", ", ", ", ", ",\n            ", ", 'pending', NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY),\n            'Subscription Renewal - ", "', 'subscription'\n          )"], ["INSERT INTO invoices (\n            id, organizationId, invoiceNumber, amount, status, \n            invoiceDate, dueDate, description, type\n          ) VALUES (\n            ", ", ", ", ", ",\n            ", ", 'pending', NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY),\n            'Subscription Renewal - ", "', 'subscription'\n          )"])), invoiceId, renewal.organizationId, invoiceNumber, amount, renewal.pricingTier))];
                case 6:
                    _a.sent();
                    nextBillingDate = new Date();
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["UPDATE organizationSubscriptions \n              SET nextBillingDate = ", "\n              WHERE organizationId = ", ""], ["UPDATE organizationSubscriptions \n              SET nextBillingDate = ", "\n              WHERE organizationId = ", ""])), nextBillingDate, renewal.organizationId))];
                case 7:
                    _a.sent();
                    // Create payment trigger to send invoice
                    return [4 /*yield*/, createPaymentTrigger(renewal.organizationId, "subscription_renewal", "send_invoice", renewal, invoiceId)];
                case 8:
                    // Create payment trigger to send invoice
                    _a.sent();
                    // Create audit log
                    return [4 /*yield*/, createAuditLog(renewal.organizationId, "subscription_renewed", "subscription", renewal.organizationId, "Invoice " + invoiceNumber + " generated for renewal")];
                case 9:
                    // Create audit log
                    _a.sent();
                    processedCount++;
                    console.log("\u2705 Renewal invoice generated for " + renewal.organizationName + ": " + invoiceNumber);
                    return [3 /*break*/, 11];
                case 10:
                    itemError_1 = _a.sent();
                    errors.push("Failed to renew " + renewal.organizationName + ": " + itemError_1.message);
                    return [3 /*break*/, 11];
                case 11:
                    _i++;
                    return [3 /*break*/, 4];
                case 12: return [2 /*return*/, {
                        jobName: "subscription_renewal",
                        timestamp: new Date(),
                        success: true,
                        itemsProcessed: processedCount,
                        message: "Generated " + processedCount + " renewal invoices",
                        errors: errors
                    }];
                case 13:
                    error_2 = _a.sent();
                    errors.push(error_2.message);
                    return [2 /*return*/, {
                            jobName: "subscription_renewal",
                            timestamp: new Date(),
                            success: false,
                            itemsProcessed: 0,
                            message: "Error processing subscription renewals",
                            errors: errors
                        }];
                case 14: return [2 /*return*/];
            }
        });
    });
}
exports.handleSubscriptionRenewal = handleSubscriptionRenewal;
/**
 * Payment Reminder Job (runs daily at 4 AM UTC)
 * Sends reminders for overdue and upcoming due invoices
 */
function handlePaymentReminders() {
    return __awaiter(this, void 0, Promise, function () {
        var db, errors, processedCount, overdueInvoices, overdue, _i, overdue_1, invoice, daysOverdue, triggerType, actionType, itemError_2, upcomingDue, upcoming, _a, upcoming_1, invoice, daysToDue, itemError_3, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        return [2 /*return*/, {
                                jobName: "payment_reminders",
                                timestamp: new Date(),
                                success: false,
                                itemsProcessed: 0,
                                message: "Database unavailable",
                                errors: ["DB connection failed"]
                            }];
                    }
                    errors = [];
                    processedCount = 0;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 20, , 21]);
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["SELECT \n        i.id, i.organizationId, i.invoiceNumber, i.amount, i.dueDate, i.invoiceDate,\n        o.organizationName, o.email,\n        DATEDIFF(NOW(), i.dueDate) as daysOverdue\n      FROM invoices i\n      JOIN organizations o ON i.organizationId = o.id\n      WHERE i.status = 'pending' \n        AND i.dueDate < NOW()\n        AND (i.lastReminderSent IS NULL OR DATEDIFF(NOW(), i.lastReminderSent) >= 3)"], ["SELECT \n        i.id, i.organizationId, i.invoiceNumber, i.amount, i.dueDate, i.invoiceDate,\n        o.organizationName, o.email,\n        DATEDIFF(NOW(), i.dueDate) as daysOverdue\n      FROM invoices i\n      JOIN organizations o ON i.organizationId = o.id\n      WHERE i.status = 'pending' \n        AND i.dueDate < NOW()\n        AND (i.lastReminderSent IS NULL OR DATEDIFF(NOW(), i.lastReminderSent) >= 3)"]))))];
                case 3:
                    overdueInvoices = _b.sent();
                    overdue = overdueInvoices.records || [];
                    _i = 0, overdue_1 = overdue;
                    _b.label = 4;
                case 4:
                    if (!(_i < overdue_1.length)) return [3 /*break*/, 10];
                    invoice = overdue_1[_i];
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 8, , 9]);
                    daysOverdue = invoice.daysOverdue || 0;
                    triggerType = "payment_reminder_overdue";
                    actionType = "email_reminder";
                    if (daysOverdue > 14) {
                        triggerType = "payment_critical_overdue";
                        actionType = "email_critical_overdue";
                    }
                    else if (daysOverdue > 7) {
                        triggerType = "payment_escalation";
                        actionType = "email_escalation";
                    }
                    return [4 /*yield*/, createPaymentTrigger(invoice.organizationId, triggerType, actionType, {
                            invoiceNumber: invoice.invoiceNumber,
                            amount: invoice.amount,
                            organizationName: invoice.organizationName,
                            daysOverdue: daysOverdue
                        }, invoice.id)];
                case 6:
                    _b.sent();
                    // Update last reminder sent
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["UPDATE invoices SET lastReminderSent = NOW() WHERE id = ", ""], ["UPDATE invoices SET lastReminderSent = NOW() WHERE id = ", ""])), invoice.id))];
                case 7:
                    // Update last reminder sent
                    _b.sent();
                    processedCount++;
                    console.log("\uD83D\uDCE7 " + triggerType + " scheduled for invoice " + invoice.invoiceNumber + " (" + daysOverdue + "d overdue)");
                    return [3 /*break*/, 9];
                case 8:
                    itemError_2 = _b.sent();
                    errors.push("Failed to process reminder for " + invoice.invoiceNumber + ": " + itemError_2.message);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 4];
                case 10: return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["SELECT \n        i.id, i.organizationId, i.invoiceNumber, i.amount, i.dueDate,\n        o.organizationName, o.email,\n        DATEDIFF(i.dueDate, NOW()) as daysToDue\n      FROM invoices i\n      JOIN organizations o ON i.organizationId = o.id\n      WHERE i.status = 'pending'\n        AND i.dueDate > NOW()\n        AND DATEDIFF(i.dueDate, NOW()) <= 7\n        AND DATEDIFF(i.dueDate, NOW()) > 0\n        AND (i.lastReminderSent IS NULL OR DATEDIFF(NOW(), i.lastReminderSent) >= 1)"], ["SELECT \n        i.id, i.organizationId, i.invoiceNumber, i.amount, i.dueDate,\n        o.organizationName, o.email,\n        DATEDIFF(i.dueDate, NOW()) as daysToDue\n      FROM invoices i\n      JOIN organizations o ON i.organizationId = o.id\n      WHERE i.status = 'pending'\n        AND i.dueDate > NOW()\n        AND DATEDIFF(i.dueDate, NOW()) <= 7\n        AND DATEDIFF(i.dueDate, NOW()) > 0\n        AND (i.lastReminderSent IS NULL OR DATEDIFF(NOW(), i.lastReminderSent) >= 1)"]))))];
                case 11:
                    upcomingDue = _b.sent();
                    upcoming = upcomingDue.records || [];
                    _a = 0, upcoming_1 = upcoming;
                    _b.label = 12;
                case 12:
                    if (!(_a < upcoming_1.length)) return [3 /*break*/, 19];
                    invoice = upcoming_1[_a];
                    _b.label = 13;
                case 13:
                    _b.trys.push([13, 17, , 18]);
                    daysToDue = invoice.daysToDue || 0;
                    if (!(daysToDue <= 2)) return [3 /*break*/, 16];
                    return [4 /*yield*/, createPaymentTrigger(invoice.organizationId, "payment_reminder_upcoming", "email_reminder", {
                            invoiceNumber: invoice.invoiceNumber,
                            amount: invoice.amount,
                            organizationName: invoice.organizationName,
                            daysToDue: daysToDue
                        }, invoice.id)];
                case 14:
                    _b.sent();
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["UPDATE invoices SET lastReminderSent = NOW() WHERE id = ", ""], ["UPDATE invoices SET lastReminderSent = NOW() WHERE id = ", ""])), invoice.id))];
                case 15:
                    _b.sent();
                    processedCount++;
                    console.log("\uD83D\uDCE7 Upcoming due reminder scheduled for invoice " + invoice.invoiceNumber + " (" + daysToDue + "d away)");
                    _b.label = 16;
                case 16: return [3 /*break*/, 18];
                case 17:
                    itemError_3 = _b.sent();
                    errors.push("Failed to process upcoming reminder for " + invoice.invoiceNumber + ": " + itemError_3.message);
                    return [3 /*break*/, 18];
                case 18:
                    _a++;
                    return [3 /*break*/, 12];
                case 19: return [2 /*return*/, {
                        jobName: "payment_reminders",
                        timestamp: new Date(),
                        success: true,
                        itemsProcessed: processedCount,
                        message: "Processed " + processedCount + " payment reminders",
                        errors: errors
                    }];
                case 20:
                    error_3 = _b.sent();
                    errors.push(error_3.message);
                    return [2 /*return*/, {
                            jobName: "payment_reminders",
                            timestamp: new Date(),
                            success: false,
                            itemsProcessed: 0,
                            message: "Error processing payment reminders",
                            errors: errors
                        }];
                case 21: return [2 /*return*/];
            }
        });
    });
}
exports.handlePaymentReminders = handlePaymentReminders;
/**
 * Payment Retry Job (runs every 6 hours)
 * Processes failed payments scheduled for retry via payment_triggers table
 */
function handlePaymentRetries() {
    return __awaiter(this, void 0, Promise, function () {
        var db, errors, processedCount, dueRetries, retries, _i, retries_1, trigger, _a, itemError_4, currentRetries, nextRetry, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        return [2 /*return*/, {
                                jobName: "payment_retries",
                                timestamp: new Date(),
                                success: false,
                                itemsProcessed: 0,
                                message: "Database unavailable",
                                errors: ["DB connection failed"]
                            }];
                    }
                    errors = [];
                    processedCount = 0;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 19, , 20]);
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["SELECT \n        pt.id, pt.organizationId, pt.invoiceId, pt.triggerType, \n        pt.actionType, pt.retryCount, pt.metadata,\n        i.invoiceNumber, i.amount, o.organizationName\n      FROM paymentTriggers pt\n      LEFT JOIN invoices i ON pt.invoiceId = i.id\n      LEFT JOIN organizations o ON pt.organizationId = o.id\n      WHERE pt.status = 'pending'\n        AND pt.triggerDate <= NOW()\n        AND pt.retryCount <= 3"], ["SELECT \n        pt.id, pt.organizationId, pt.invoiceId, pt.triggerType, \n        pt.actionType, pt.retryCount, pt.metadata,\n        i.invoiceNumber, i.amount, o.organizationName\n      FROM paymentTriggers pt\n      LEFT JOIN invoices i ON pt.invoiceId = i.id\n      LEFT JOIN organizations o ON pt.organizationId = o.id\n      WHERE pt.status = 'pending'\n        AND pt.triggerDate <= NOW()\n        AND pt.retryCount <= 3"]))))];
                case 3:
                    dueRetries = _b.sent();
                    retries = dueRetries.records || [];
                    _i = 0, retries_1 = retries;
                    _b.label = 4;
                case 4:
                    if (!(_i < retries_1.length)) return [3 /*break*/, 18];
                    trigger = retries_1[_i];
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 12, , 17]);
                    _a = trigger.actionType;
                    switch (_a) {
                        case "email_reminder": return [3 /*break*/, 6];
                        case "email_critical_overdue": return [3 /*break*/, 6];
                        case "email_escalation": return [3 /*break*/, 6];
                        case "send_invoice": return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 9];
                case 6: 
                // Trigger email job
                return [4 /*yield*/, createPaymentTrigger(trigger.organizationId, trigger.triggerType, trigger.actionType, JSON.parse(trigger.metadata || "{}"))];
                case 7:
                    // Trigger email job
                    _b.sent();
                    return [3 /*break*/, 10];
                case 8:
                    // Trigger invoice send
                    console.log("\uD83D\uDCC4 Resending invoice " + trigger.invoiceNumber);
                    return [3 /*break*/, 10];
                case 9:
                    console.log("\u26A0\uFE0F Unknown action type: " + trigger.actionType);
                    _b.label = 10;
                case 10: 
                // Mark as triggered
                return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_12 || (templateObject_12 = __makeTemplateObject(["UPDATE paymentTriggers \n              SET status = 'triggered',\n                  lastRetryAt = NOW(),\n                  retryCount = retryCount + 1\n              WHERE id = ", ""], ["UPDATE paymentTriggers \n              SET status = 'triggered',\n                  lastRetryAt = NOW(),\n                  retryCount = retryCount + 1\n              WHERE id = ", ""])), trigger.id))];
                case 11:
                    // Mark as triggered
                    _b.sent();
                    processedCount++;
                    console.log("\u2705 Payment trigger executed: " + trigger.triggerType + " for " + trigger.organizationName);
                    return [3 /*break*/, 17];
                case 12:
                    itemError_4 = _b.sent();
                    errors.push("Failed to process trigger " + trigger.id + ": " + itemError_4.message);
                    currentRetries = trigger.retryCount || 0;
                    if (!(currentRetries < 3)) return [3 /*break*/, 14];
                    nextRetry = new Date();
                    nextRetry.setHours(nextRetry.getHours() + 6); // Retry in 6 hours
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["UPDATE paymentTriggers \n                SET retryCount = retryCount + 1,\n                    triggerDate = ", "\n                WHERE id = ", ""], ["UPDATE paymentTriggers \n                SET retryCount = retryCount + 1,\n                    triggerDate = ", "\n                WHERE id = ", ""])), nextRetry, trigger.id))];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 16];
                case 14: 
                // Max retries exceeded - mark as failed
                return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_14 || (templateObject_14 = __makeTemplateObject(["UPDATE paymentTriggers SET status = 'failed' WHERE id = ", ""], ["UPDATE paymentTriggers SET status = 'failed' WHERE id = ", ""])), trigger.id))];
                case 15:
                    // Max retries exceeded - mark as failed
                    _b.sent();
                    _b.label = 16;
                case 16: return [3 /*break*/, 17];
                case 17:
                    _i++;
                    return [3 /*break*/, 4];
                case 18: return [2 /*return*/, {
                        jobName: "payment_retries",
                        timestamp: new Date(),
                        success: true,
                        itemsProcessed: processedCount,
                        message: "Processed " + processedCount + " payment retries",
                        errors: errors
                    }];
                case 19:
                    error_4 = _b.sent();
                    errors.push(error_4.message);
                    return [2 /*return*/, {
                            jobName: "payment_retries",
                            timestamp: new Date(),
                            success: false,
                            itemsProcessed: 0,
                            message: "Error processing payment retries",
                            errors: errors
                        }];
                case 20: return [2 /*return*/];
            }
        });
    });
}
exports.handlePaymentRetries = handlePaymentRetries;
/**
 * Helper: Create payment trigger
 */
function createPaymentTrigger(organizationId, triggerType, actionType, metadata, invoiceId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, triggerDate, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/];
                    triggerDate = new Date();
                    triggerDate.setHours(triggerDate.getHours() + 1); // Execute in 1 hour
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db.insert(schema_1.paymentTriggers).values({
                            organizationId: organizationId,
                            invoiceId: invoiceId || undefined,
                            triggerType: triggerType,
                            triggerDate: triggerDate,
                            status: "pending",
                            actionType: actionType,
                            retryCount: 0,
                            metadata: JSON.stringify(metadata)
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_5 = _a.sent();
                    console.error("Error creating payment trigger: " + error_5.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Helper: Create audit log
 */
function createAuditLog(organizationId, action, entityType, entityId, details) {
    return __awaiter(this, void 0, void 0, function () {
        var db, error_6;
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
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            organizationId: organizationId,
                            userId: "billing-job",
                            action: action,
                            entityType: entityType,
                            entityId: entityId,
                            severity: "info",
                            ipAddress: "internal-job",
                            userAgent: "Billing Automation",
                            timestamp: new Date(),
                            details: JSON.stringify({ message: details })
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_6 = _a.sent();
                    console.error("Error creating audit log: " + error_6.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Initialize and start all cron jobs
 */
function initializeBillingJobs() {
    var _this = this;
    console.log("🚀 Initializing billing automation jobs...");
    // Trial expiration check (daily at 2 AM UTC)
    node_cron_1["default"].schedule("0 2 * * *", function () { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n⏰ [CRON] Running trial expiration job...");
                    return [4 /*yield*/, handleTrialExpiration()];
                case 1:
                    result = _a.sent();
                    console.log((result.success ? "✅" : "❌") + " " + result.jobName + ": " + result.message + "\n");
                    return [2 /*return*/];
            }
        });
    }); });
    // Subscription renewal (daily at 3 AM UTC)
    node_cron_1["default"].schedule("0 3 * * *", function () { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n⏰ [CRON] Running subscription renewal job...");
                    return [4 /*yield*/, handleSubscriptionRenewal()];
                case 1:
                    result = _a.sent();
                    console.log((result.success ? "✅" : "❌") + " " + result.jobName + ": " + result.message + "\n");
                    return [2 /*return*/];
            }
        });
    }); });
    // Payment reminders (daily at 4 AM UTC)
    node_cron_1["default"].schedule("0 4 * * *", function () { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n⏰ [CRON] Running payment reminders job...");
                    return [4 /*yield*/, handlePaymentReminders()];
                case 1:
                    result = _a.sent();
                    console.log((result.success ? "✅" : "❌") + " " + result.jobName + ": " + result.message + "\n");
                    return [2 /*return*/];
            }
        });
    }); });
    // Payment retry processing (every 6 hours)
    node_cron_1["default"].schedule("0 */6 * * *", function () { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n⏰ [CRON] Running payment retries job...");
                    return [4 /*yield*/, handlePaymentRetries()];
                case 1:
                    result = _a.sent();
                    console.log((result.success ? "✅" : "❌") + " " + result.jobName + ": " + result.message + "\n");
                    return [2 /*return*/];
            }
        });
    }); });
    console.log("✅ All billing jobs initialized successfully");
}
exports.initializeBillingJobs = initializeBillingJobs;
exports["default"] = {
    initializeBillingJobs: initializeBillingJobs,
    handleTrialExpiration: handleTrialExpiration,
    handleSubscriptionRenewal: handleSubscriptionRenewal,
    handlePaymentReminders: handlePaymentReminders,
    handlePaymentRetries: handlePaymentRetries
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14;
