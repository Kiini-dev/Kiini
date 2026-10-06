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
exports.initializeBillingAutomation = exports.scheduleOverdueSubscriptionLock = exports.schedulePaymentReminders = exports.scheduleRenewalInvoiceGeneration = exports.scheduleTrialExpirationCheck = void 0;
var node_cron_1 = require("node-cron");
var db_1 = require("~/server/db");
var schema_1 = require("~/server/db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var emailService_1 = require("~/server/email/emailService");
var logger_1 = require("~/server/utils/logger");
/**
 * Billing Automation Jobs
 * Runs automated billing tasks via cron schedule
 */
/**
 * Daily job: Check trial expirations and convert to paid
 * Runs at 2 AM UTC every day
 */
function scheduleTrialExpirationCheck() {
    var _this = this;
    node_cron_1["default"].schedule('0 2 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        var now, today, tomorrow, expiringTrials, _i, expiringTrials_1, subscription, invoiceId, org, invoice, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    logger_1.logger.info('[Cron] Starting trial expiration check...');
                    now = new Date();
                    today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return [4 /*yield*/, db_1.db.query.organizationSubscriptions.findMany({
                            where: drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.organizationSubscriptions.trialEndDate, today), drizzle_orm_1.lt(schema_1.organizationSubscriptions.trialEndDate, tomorrow), drizzle_orm_1.eq(schema_1.organizationSubscriptions.status, 'trial')),
                            "with": { organization: true }
                        })];
                case 1:
                    expiringTrials = _a.sent();
                    logger_1.logger.info("[Cron] Found " + expiringTrials.length + " expiring trials");
                    _i = 0, expiringTrials_1 = expiringTrials;
                    _a.label = 2;
                case 2:
                    if (!(_i < expiringTrials_1.length)) return [3 /*break*/, 9];
                    subscription = expiringTrials_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 7, , 8]);
                    invoiceId = "INV-" + subscription.organizationId + "-" + Date.now();
                    org = subscription.organization;
                    return [4 /*yield*/, db_1.db.insert(schema_1.invoices).values({
                            id: invoiceId,
                            organizationId: subscription.organizationId,
                            invoiceNumber: (org.invoicePrefix || 'INV') + "-" + new Date().getFullYear() + "-" + Math.random().toString().slice(2, 6),
                            status: 'pending',
                            issueDate: new Date(),
                            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            totalAmount: getPricingTierPrice(subscription.currentTier),
                            taxAmount: 0,
                            discountAmount: 0,
                            paymentMethod: subscription.preferredPaymentMethod || 'stripe',
                            description: "Subscription renewal for " + subscription.currentTier + " tier",
                            createdAt: new Date(),
                            updatedAt: new Date()
                        })];
                case 4:
                    invoice = _a.sent();
                    // Update subscription to paid status
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.organizationSubscriptions)
                            .set({
                            status: 'paid',
                            renewalDate: new Date(),
                            nextBillingDate: new Date(Date.now() + (subscription.billingCycleMonths || 1) * 30 * 24 * 60 * 60 * 1000),
                            autoRenewEnabled: true,
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, subscription.organizationId))];
                case 5:
                    // Update subscription to paid status
                    _a.sent();
                    // Send notification email
                    return [4 /*yield*/, emailService_1.sendEmail({
                            to: org.billingEmail || org.email || '',
                            subject: 'Trial Period Ended - Subscription Converted to Paid',
                            template: 'trial-converted-to-paid',
                            context: {
                                organizationName: org.name,
                                tier: subscription.currentTier,
                                invoiceId: invoiceId,
                                amount: getPricingTierPrice(subscription.currentTier).toFixed(2),
                                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                            }
                        })];
                case 6:
                    // Send notification email
                    _a.sent();
                    logger_1.logger.info("[Cron] Trial converted to paid: " + subscription.organizationId);
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    logger_1.logger.error("[Cron] Error processing trial expiration: " + subscription.organizationId, error_1);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 2];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_2 = _a.sent();
                    logger_1.logger.error('[Cron] Trial expiration check error:', error_2);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    }); });
    logger_1.logger.info('[Cron] Trial expiration check scheduled (daily at 2 AM UTC)');
}
exports.scheduleTrialExpirationCheck = scheduleTrialExpirationCheck;
/**
 * Daily job: Check for invoices due for renewal
 * Runs at 3 AM UTC every day
 */
function scheduleRenewalInvoiceGeneration() {
    var _this = this;
    node_cron_1["default"].schedule('0 3 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        var now, today, tomorrow, renewalDue, _i, renewalDue_1, subscription, org, invoiceId, nextDate, error_3, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    logger_1.logger.info('[Cron] Starting renewal invoice generation...');
                    now = new Date();
                    today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return [4 /*yield*/, db_1.db.query.organizationSubscriptions.findMany({
                            where: drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.organizationSubscriptions.nextBillingDate, today), drizzle_orm_1.lt(schema_1.organizationSubscriptions.nextBillingDate, tomorrow), drizzle_orm_1.eq(schema_1.organizationSubscriptions.autoRenewEnabled, true), drizzle_orm_1.eq(schema_1.organizationSubscriptions.status, 'paid')),
                            "with": { organization: true }
                        })];
                case 1:
                    renewalDue = _a.sent();
                    logger_1.logger.info("[Cron] Found " + renewalDue.length + " renewals due");
                    _i = 0, renewalDue_1 = renewalDue;
                    _a.label = 2;
                case 2:
                    if (!(_i < renewalDue_1.length)) return [3 /*break*/, 9];
                    subscription = renewalDue_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 7, , 8]);
                    org = subscription.organization;
                    invoiceId = "INV-" + subscription.organizationId + "-REN-" + Date.now();
                    // Create renewal invoice
                    return [4 /*yield*/, db_1.db.insert(schema_1.invoices).values({
                            id: invoiceId,
                            organizationId: subscription.organizationId,
                            invoiceNumber: (org.invoicePrefix || 'INV') + "-" + new Date().getFullYear() + "-" + Math.random().toString().slice(2, 6),
                            status: 'pending',
                            issueDate: new Date(),
                            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            totalAmount: getPricingTierPrice(subscription.currentTier),
                            taxAmount: 0,
                            discountAmount: 0,
                            paymentMethod: subscription.preferredPaymentMethod || 'stripe',
                            description: "Renewal: " + subscription.currentTier + " tier (" + subscription.billingCycleMonths + " months)",
                            createdAt: new Date(),
                            updatedAt: new Date()
                        })];
                case 4:
                    // Create renewal invoice
                    _a.sent();
                    nextDate = new Date();
                    nextDate.setMonth(nextDate.getMonth() + (subscription.billingCycleMonths || 1));
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.organizationSubscriptions)
                            .set({
                            nextBillingDate: nextDate,
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, subscription.organizationId))];
                case 5:
                    _a.sent();
                    // Send notification
                    return [4 /*yield*/, emailService_1.sendEmail({
                            to: org.billingEmail || org.email || '',
                            subject: 'Renewal Invoice Generated',
                            template: 'renewal-invoice-generated',
                            context: {
                                organizationName: org.name,
                                invoiceId: invoiceId,
                                amount: getPricingTierPrice(subscription.currentTier).toFixed(2),
                                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                            }
                        })];
                case 6:
                    // Send notification
                    _a.sent();
                    logger_1.logger.info("[Cron] Renewal invoice generated: " + subscription.organizationId);
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _a.sent();
                    logger_1.logger.error("[Cron] Error generating renewal invoice: " + subscription.organizationId, error_3);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 2];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_4 = _a.sent();
                    logger_1.logger.error('[Cron] Renewal invoice generation error:', error_4);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    }); });
    logger_1.logger.info('[Cron] Renewal invoice generation scheduled (daily at 3 AM UTC)');
}
exports.scheduleRenewalInvoiceGeneration = scheduleRenewalInvoiceGeneration;
/**
 * Daily job: Send payment reminders
 * - 7 days before due date
 * - 1 day before due date
 * - On overdue date
 * Runs at 4 AM UTC every day
 */
function schedulePaymentReminders() {
    var _this = this;
    node_cron_1["default"].schedule('0 4 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        var now, sevenDaysFromNow, sevenDaysStart, sevenDaysEnd, sevenDaysPending, _i, sevenDaysPending_1, invoice, org, error_5, oneDayFromNow, oneDayStart, oneDayEnd, oneDayPending, _a, oneDayPending_1, invoice, org, error_6, error_7;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 17, , 18]);
                    logger_1.logger.info('[Cron] Starting payment reminder sending...');
                    now = new Date();
                    sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    sevenDaysStart = new Date(sevenDaysFromNow.getFullYear(), sevenDaysFromNow.getMonth(), sevenDaysFromNow.getDate());
                    sevenDaysEnd = new Date(sevenDaysStart);
                    sevenDaysEnd.setDate(sevenDaysEnd.getDate() + 1);
                    return [4 /*yield*/, db_1.db.query.invoices.findMany({
                            where: drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.invoices.dueDate, sevenDaysStart), drizzle_orm_1.lt(schema_1.invoices.dueDate, sevenDaysEnd), drizzle_orm_1.eq(schema_1.invoices.status, 'pending'), drizzle_orm_1.isNull(schema_1.invoices.reminderSent7Days)),
                            "with": { organization: true }
                        })];
                case 1:
                    sevenDaysPending = _b.sent();
                    _i = 0, sevenDaysPending_1 = sevenDaysPending;
                    _b.label = 2;
                case 2:
                    if (!(_i < sevenDaysPending_1.length)) return [3 /*break*/, 8];
                    invoice = sevenDaysPending_1[_i];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 6, , 7]);
                    org = invoice.organization;
                    return [4 /*yield*/, emailService_1.sendEmail({
                            to: org.billingEmail || org.email || '',
                            subject: "Payment Due Soon - Invoice " + invoice.invoiceNumber,
                            template: 'payment-reminder-7days',
                            context: {
                                organizationName: org.name,
                                invoiceId: invoice.id,
                                invoiceNumber: invoice.invoiceNumber,
                                amount: invoice.totalAmount.toFixed(2),
                                dueDate: invoice.dueDate.toLocaleDateString(),
                                daysRemaining: 7
                            }
                        })];
                case 4:
                    _b.sent();
                    // Mark as sent
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.invoices)
                            .set({
                            reminderSent7Days: new Date(),
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoice.id))];
                case 5:
                    // Mark as sent
                    _b.sent();
                    logger_1.logger.info("[Cron] 7-day reminder sent: " + invoice.id);
                    return [3 /*break*/, 7];
                case 6:
                    error_5 = _b.sent();
                    logger_1.logger.error("[Cron] Error sending 7-day reminder: " + invoice.id, error_5);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
                    oneDayStart = new Date(oneDayFromNow.getFullYear(), oneDayFromNow.getMonth(), oneDayFromNow.getDate());
                    oneDayEnd = new Date(oneDayStart);
                    oneDayEnd.setDate(oneDayEnd.getDate() + 1);
                    return [4 /*yield*/, db_1.db.query.invoices.findMany({
                            where: drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.invoices.dueDate, oneDayStart), drizzle_orm_1.lt(schema_1.invoices.dueDate, oneDayEnd), drizzle_orm_1.eq(schema_1.invoices.status, 'pending'), drizzle_orm_1.isNull(schema_1.invoices.reminderSent1Day)),
                            "with": { organization: true }
                        })];
                case 9:
                    oneDayPending = _b.sent();
                    _a = 0, oneDayPending_1 = oneDayPending;
                    _b.label = 10;
                case 10:
                    if (!(_a < oneDayPending_1.length)) return [3 /*break*/, 16];
                    invoice = oneDayPending_1[_a];
                    _b.label = 11;
                case 11:
                    _b.trys.push([11, 14, , 15]);
                    org = invoice.organization;
                    return [4 /*yield*/, emailService_1.sendEmail({
                            to: org.billingEmail || org.email || '',
                            subject: "URGENT: Payment Due Tomorrow - Invoice " + invoice.invoiceNumber,
                            template: 'payment-reminder-1day',
                            context: {
                                organizationName: org.name,
                                invoiceId: invoice.id,
                                invoiceNumber: invoice.invoiceNumber,
                                amount: invoice.totalAmount.toFixed(2),
                                dueDate: invoice.dueDate.toLocaleDateString()
                            }
                        })];
                case 12:
                    _b.sent();
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.invoices)
                            .set({
                            reminderSent1Day: new Date(),
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoice.id))];
                case 13:
                    _b.sent();
                    logger_1.logger.info("[Cron] 1-day reminder sent: " + invoice.id);
                    return [3 /*break*/, 15];
                case 14:
                    error_6 = _b.sent();
                    logger_1.logger.error("[Cron] Error sending 1-day reminder: " + invoice.id, error_6);
                    return [3 /*break*/, 15];
                case 15:
                    _a++;
                    return [3 /*break*/, 10];
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_7 = _b.sent();
                    logger_1.logger.error('[Cron] Payment reminder error:', error_7);
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/];
            }
        });
    }); });
    logger_1.logger.info('[Cron] Payment reminders scheduled (daily at 4 AM UTC)');
}
exports.schedulePaymentReminders = schedulePaymentReminders;
/**
 * Daily job: Lock overdue subscriptions
 * If payment is overdue 3+ days, lock subscription access
 * Runs at 5 AM UTC every day
 */
function scheduleOverdueSubscriptionLock() {
    var _this = this;
    node_cron_1["default"].schedule('0 5 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        var threeDaysAgo, overdueInvoices, _i, overdueInvoices_1, invoice, org, error_8, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    logger_1.logger.info('[Cron] Starting overdue subscription lock...');
                    threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, db_1.db.query.invoices.findMany({
                            where: drizzle_orm_1.and(drizzle_orm_1.lte(schema_1.invoices.dueDate, threeDaysAgo), drizzle_orm_1.eq(schema_1.invoices.status, 'pending')),
                            "with": { organization: true }
                        })];
                case 1:
                    overdueInvoices = _a.sent();
                    logger_1.logger.info("[Cron] Found " + overdueInvoices.length + " overdue invoices");
                    _i = 0, overdueInvoices_1 = overdueInvoices;
                    _a.label = 2;
                case 2:
                    if (!(_i < overdueInvoices_1.length)) return [3 /*break*/, 8];
                    invoice = overdueInvoices_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    org = invoice.organization;
                    // Lock subscription
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.organizationSubscriptions)
                            .set({
                            status: 'locked',
                            lockedReason: 'Payment overdue 3+ days',
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, invoice.organizationId))];
                case 4:
                    // Lock subscription
                    _a.sent();
                    // Send urgent payment required email
                    return [4 /*yield*/, emailService_1.sendEmail({
                            to: org.billingEmail || org.email || '',
                            subject: 'URGENT: Account Suspended - Payment Required',
                            template: 'payment-overdue-locked',
                            context: {
                                organizationName: org.name,
                                invoiceId: invoice.id,
                                invoiceNumber: invoice.invoiceNumber,
                                amount: invoice.totalAmount.toFixed(2),
                                daysOverdue: Math.floor((Date.now() - invoice.dueDate.getTime()) / (24 * 60 * 60 * 1000))
                            }
                        })];
                case 5:
                    // Send urgent payment required email
                    _a.sent();
                    logger_1.logger.info("[Cron] Subscription locked (overdue): " + invoice.organizationId);
                    return [3 /*break*/, 7];
                case 6:
                    error_8 = _a.sent();
                    logger_1.logger.error("[Cron] Error locking subscription: " + invoice.organizationId, error_8);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_9 = _a.sent();
                    logger_1.logger.error('[Cron] Overdue subscription lock error:', error_9);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); });
    logger_1.logger.info('[Cron] Overdue subscription lock scheduled (daily at 5 AM UTC)');
}
exports.scheduleOverdueSubscriptionLock = scheduleOverdueSubscriptionLock;
/**
 * Initialize all billing automation jobs
 */
function initializeBillingAutomation() {
    logger_1.logger.info('[Cron] Initializing billing automation jobs...');
    scheduleTrialExpirationCheck();
    scheduleRenewalInvoiceGeneration();
    schedulePaymentReminders();
    scheduleOverdueSubscriptionLock();
    logger_1.logger.info('[Cron] All billing automation jobs initialized');
}
exports.initializeBillingAutomation = initializeBillingAutomation;
/**
 * Get pricing for tier
 * TODO: Fetch from pricingTierDescriptions table
 */
function getPricingTierPrice(tier) {
    var prices = {
        Trial: 0,
        'Accounting-Only': 49,
        Starter: 99,
        Growth: 199,
        Professional: 399,
        Enterprise: 999
    };
    return prices[tier] || 0;
}
