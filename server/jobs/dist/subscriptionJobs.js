"use strict";
/**
 * Subscription Jobs
 * Background cron functions for subscription lifecycle management:
 * - Suspend expired subscriptions after grace period
 * - Expire overdue trial accounts
 * - Send billing reminders (7d, 1d, overdue-1d, overdue-3d)
 * - Activate subscription after successful payment
 * - Generate invoices for upcoming renewals and email to billing contact
 * - Ensure all orgs have a subscription record
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
exports.ensureOrgsHaveSubscriptions = exports.generateSubscriptionInvoices = exports.activateSubscriptionAfterPayment = exports.sendBillingReminders = exports.processTrialExpirations = exports.checkAndSuspendExpiredSubscriptions = void 0;
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var subscriptionGuard_1 = require("../middleware/subscriptionGuard");
var mail_1 = require("../_core/mail");
function nowIso() {
    return new Date().toISOString().replace("T", " ").slice(0, 19);
}
function addDays(date, days) {
    return new Date(date.getTime() + days * 86400000);
}
// ── Suspend Expired Subscriptions ────────────────────────────────────────────
/**
 * Suspend subscriptions where the grace period has elapsed.
 * Grace period = 3 days after renewalDate.
 * This runs daily — it sets isLocked=1, status='suspended', and deactivates the org.
 */
function checkAndSuspendExpiredSubscriptions() {
    return __awaiter(this, void 0, Promise, function () {
        var db, now, graceCutoff, graceCutoffStr, suspended, expired, _i, expired_1, sub, subId, orgId, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error("[SubscriptionJobs] DB unavailable for suspension check");
                        return [2 /*return*/, { suspended: 0 }];
                    }
                    now = new Date();
                    graceCutoff = addDays(now, -3);
                    graceCutoffStr = graceCutoff.toISOString().replace("T", " ").slice(0, 19);
                    suspended = 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 11, , 12]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.and(drizzle_orm_1.inArray(schema_1.subscriptions.status, ["active", "trial"]), drizzle_orm_1.lte(schema_1.subscriptions.renewalDate, graceCutoffStr), drizzle_orm_1.eq(schema_1.subscriptions.isLocked, 0)))];
                case 3:
                    expired = _a.sent();
                    _i = 0, expired_1 = expired;
                    _a.label = 4;
                case 4:
                    if (!(_i < expired_1.length)) return [3 /*break*/, 10];
                    sub = expired_1[_i];
                    subId = sub.id;
                    orgId = sub.organizationId;
                    // Suspend subscription
                    return [4 /*yield*/, db
                            .update(schema_1.subscriptions)
                            .set({
                            status: "suspended",
                            isLocked: 1,
                            updatedAt: nowIso()
                        })
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.id, subId))];
                case 5:
                    // Suspend subscription
                    _a.sent();
                    if (!orgId) return [3 /*break*/, 7];
                    return [4 /*yield*/, db
                            .update(schema_1.organizations)
                            .set({ isActive: 0, updatedAt: nowIso() })
                            .where(drizzle_orm_1.eq(schema_1.organizations.id, orgId))["catch"](function (e) { return console.warn("[SubscriptionJobs] Org deactivate failed:", e); })];
                case 6:
                    _a.sent();
                    subscriptionGuard_1.invalidateSubscriptionCache(orgId);
                    _a.label = 7;
                case 7: 
                // Create system_locked billing notification
                return [4 /*yield*/, db
                        .insert(schema_1.billingNotifications)
                        .values({
                        id: uuid_1.v4(),
                        subscriptionId: subId,
                        notificationType: "system_locked",
                        message: "Your subscription has been suspended due to non-payment. Please renew to restore access.",
                        sentTo: null,
                        channel: "in_app",
                        isSent: 0,
                        isRead: 0,
                        createdAt: nowIso()
                    })["catch"](function (e) { return console.warn("[SubscriptionJobs] Notification insert failed:", e); })];
                case 8:
                    // Create system_locked billing notification
                    _a.sent();
                    suspended++;
                    console.log("[SubscriptionJobs] Suspended subscription " + subId + " (org: " + orgId + ")");
                    _a.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 4];
                case 10: return [3 /*break*/, 12];
                case 11:
                    err_1 = _a.sent();
                    console.error("[SubscriptionJobs] checkAndSuspendExpiredSubscriptions error:", err_1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/, { suspended: suspended }];
            }
        });
    });
}
exports.checkAndSuspendExpiredSubscriptions = checkAndSuspendExpiredSubscriptions;
// ── Expire Trial Subscriptions ────────────────────────────────────────────────
/**
 * Mark trial subscriptions as expired when their expiryDate has passed.
 */
function processTrialExpirations() {
    return __awaiter(this, void 0, Promise, function () {
        var db, nowStr, expired, trials, _i, trials_1, sub, subId, orgId, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, { expired: 0 }];
                    nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
                    expired = 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 11, , 12]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.subscriptions.status, "trial"), drizzle_orm_1.lte(schema_1.subscriptions.expiryDate, nowStr)))];
                case 3:
                    trials = _a.sent();
                    _i = 0, trials_1 = trials;
                    _a.label = 4;
                case 4:
                    if (!(_i < trials_1.length)) return [3 /*break*/, 10];
                    sub = trials_1[_i];
                    subId = sub.id;
                    orgId = sub.organizationId;
                    return [4 /*yield*/, db
                            .update(schema_1.subscriptions)
                            .set({
                            status: "expired",
                            isLocked: 1,
                            updatedAt: nowIso()
                        })
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.id, subId))];
                case 5:
                    _a.sent();
                    if (!orgId) return [3 /*break*/, 7];
                    return [4 /*yield*/, db
                            .update(schema_1.organizations)
                            .set({ isActive: 0, updatedAt: nowIso() })
                            .where(drizzle_orm_1.eq(schema_1.organizations.id, orgId))["catch"](function () { })];
                case 6:
                    _a.sent();
                    subscriptionGuard_1.invalidateSubscriptionCache(orgId);
                    _a.label = 7;
                case 7: return [4 /*yield*/, db
                        .insert(schema_1.billingNotifications)
                        .values({
                        id: uuid_1.v4(),
                        subscriptionId: subId,
                        notificationType: "subscription_expired",
                        message: "Your trial has expired. Please subscribe to continue using the service.",
                        sentTo: null,
                        channel: "in_app",
                        isSent: 0,
                        isRead: 0,
                        createdAt: nowIso()
                    })["catch"](function () { })];
                case 8:
                    _a.sent();
                    expired++;
                    console.log("[SubscriptionJobs] Trial expired: " + subId + " (org: " + orgId + ")");
                    _a.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 4];
                case 10: return [3 /*break*/, 12];
                case 11:
                    err_2 = _a.sent();
                    console.error("[SubscriptionJobs] processTrialExpirations error:", err_2);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/, { expired: expired }];
            }
        });
    });
}
exports.processTrialExpirations = processTrialExpirations;
var REMINDER_WINDOWS = [
    {
        daysOffset: -7,
        notificationType: "payment_due_7days",
        message: "Your subscription renewal is due in 7 days. Please ensure payment is made on time."
    },
    {
        daysOffset: -1,
        notificationType: "payment_due_today",
        message: "Your subscription renews tomorrow. Ensure your payment method is up to date."
    },
    {
        daysOffset: 1,
        notificationType: "payment_overdue_1day",
        message: "Your subscription payment is 1 day overdue. Service will be suspended in 2 days."
    },
    {
        daysOffset: 3,
        notificationType: "payment_overdue_3days",
        message: "Your subscription payment is 3 days overdue. Your account has been or will be suspended shortly."
    },
];
/**
 * Send billing reminders at 7d/1d before and 1d/3d after renewal date.
 * Avoids duplicate notifications by checking if one was already sent today.
 */
function sendBillingReminders() {
    return __awaiter(this, void 0, Promise, function () {
        var db, sent, now, todayStr, activeSubs, _i, activeSubs_1, sub, subId, renewalDate, daysUntilRenewal, _a, REMINDER_WINDOWS_1, window, existing, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, { sent: 0 }];
                    sent = 0;
                    now = new Date();
                    todayStr = now.toISOString().slice(0, 10);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 11, , 12]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.inArray(schema_1.subscriptions.status, ["active", "trial"]))];
                case 3:
                    activeSubs = _b.sent();
                    _i = 0, activeSubs_1 = activeSubs;
                    _b.label = 4;
                case 4:
                    if (!(_i < activeSubs_1.length)) return [3 /*break*/, 10];
                    sub = activeSubs_1[_i];
                    subId = sub.id;
                    renewalDate = new Date(sub.renewalDate);
                    if (isNaN(renewalDate.getTime()))
                        return [3 /*break*/, 9];
                    daysUntilRenewal = Math.round((renewalDate.getTime() - now.getTime()) / 86400000);
                    _a = 0, REMINDER_WINDOWS_1 = REMINDER_WINDOWS;
                    _b.label = 5;
                case 5:
                    if (!(_a < REMINDER_WINDOWS_1.length)) return [3 /*break*/, 9];
                    window = REMINDER_WINDOWS_1[_a];
                    if (daysUntilRenewal !== -window.daysOffset)
                        return [3 /*break*/, 8];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.billingNotifications)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.billingNotifications.subscriptionId, subId), drizzle_orm_1.eq(schema_1.billingNotifications.notificationType, window.notificationType), drizzle_orm_1.gte(schema_1.billingNotifications.createdAt, todayStr + " 00:00:00")))
                            .limit(1)];
                case 6:
                    existing = _b.sent();
                    if (existing.length > 0)
                        return [3 /*break*/, 8];
                    return [4 /*yield*/, db
                            .insert(schema_1.billingNotifications)
                            .values({
                            id: uuid_1.v4(),
                            subscriptionId: subId,
                            notificationType: window.notificationType,
                            message: window.message,
                            sentTo: null,
                            channel: "in_app",
                            isSent: 0,
                            isRead: 0,
                            createdAt: nowIso()
                        })["catch"](function () { })];
                case 7:
                    _b.sent();
                    sent++;
                    console.log("[SubscriptionJobs] Reminder '" + window.notificationType + "' for sub " + subId);
                    _b.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 5];
                case 9:
                    _i++;
                    return [3 /*break*/, 4];
                case 10: return [3 /*break*/, 12];
                case 11:
                    err_3 = _b.sent();
                    console.error("[SubscriptionJobs] sendBillingReminders error:", err_3);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/, { sent: sent }];
            }
        });
    });
}
exports.sendBillingReminders = sendBillingReminders;
// ── Activate Subscription After Payment ──────────────────────────────────────
/**
 * Called when a billing invoice payment is confirmed (M-Pesa, Stripe, or manual).
 * Advances renewalDate, unlocks the subscription, reactivates the org.
 */
function activateSubscriptionAfterPayment(subscriptionId, billingCycle) {
    var _a, _b;
    return __awaiter(this, void 0, Promise, function () {
        var db, rows, sub, cycle, orgId, now, newRenewal, newRenewalStr, err_4;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, { success: false }];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.id, subscriptionId))
                            .limit(1)];
                case 3:
                    rows = _c.sent();
                    if (rows.length === 0) {
                        console.warn("[SubscriptionJobs] Subscription not found: " + subscriptionId);
                        return [2 /*return*/, { success: false }];
                    }
                    sub = rows[0];
                    cycle = (_a = billingCycle !== null && billingCycle !== void 0 ? billingCycle : sub.billingCycle) !== null && _a !== void 0 ? _a : "monthly";
                    orgId = (_b = sub.organizationId) !== null && _b !== void 0 ? _b : null;
                    now = new Date();
                    newRenewal = cycle === "annual" ? addDays(now, 365) : addDays(now, 30);
                    newRenewalStr = newRenewal.toISOString().replace("T", " ").slice(0, 19);
                    return [4 /*yield*/, db
                            .update(schema_1.subscriptions)
                            .set({
                            status: "active",
                            isLocked: 0,
                            renewalDate: newRenewalStr,
                            gracePeriodEnd: null,
                            updatedAt: nowIso()
                        })
                            .where(drizzle_orm_1.eq(schema_1.subscriptions.id, subscriptionId))];
                case 4:
                    _c.sent();
                    if (!orgId) return [3 /*break*/, 6];
                    return [4 /*yield*/, db
                            .update(schema_1.organizations)
                            .set({ isActive: 1, updatedAt: nowIso() })
                            .where(drizzle_orm_1.eq(schema_1.organizations.id, orgId))["catch"](function (e) { return console.warn("[SubscriptionJobs] Org reactivate failed:", e); })];
                case 5:
                    _c.sent();
                    subscriptionGuard_1.invalidateSubscriptionCache(orgId);
                    _c.label = 6;
                case 6: 
                // Billing notification
                return [4 /*yield*/, db
                        .insert(schema_1.billingNotifications)
                        .values({
                        id: uuid_1.v4(),
                        subscriptionId: subscriptionId,
                        notificationType: "renewal_successful",
                        message: "Subscription renewed successfully. Next renewal: " + newRenewalStr.slice(0, 10) + ".",
                        sentTo: null,
                        channel: "in_app",
                        isSent: 0,
                        isRead: 0,
                        createdAt: nowIso()
                    })["catch"](function () { })];
                case 7:
                    // Billing notification
                    _c.sent();
                    console.log("[SubscriptionJobs] Activated subscription " + subscriptionId + " (org: " + orgId + "), next renewal: " + newRenewalStr);
                    return [2 /*return*/, { success: true, orgId: orgId !== null && orgId !== void 0 ? orgId : undefined }];
                case 8:
                    err_4 = _c.sent();
                    console.error("[SubscriptionJobs] activateSubscriptionAfterPayment error:", err_4);
                    return [2 /*return*/, { success: false }];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.activateSubscriptionAfterPayment = activateSubscriptionAfterPayment;
// ── Generate Subscription Invoices ───────────────────────────────────────────
/**
 * Generate billing invoices 7 days before renewal for active/trial subscriptions.
 * Also emails the invoice to the org's billingEmail (or falls back to org contact email).
 * Runs daily — skips if an invoice already exists for the upcoming period.
 */
function generateSubscriptionInvoices() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, Promise, function () {
        var db, generated, emailed, now, sevenDaysOut, sevenDaysOutStr, todayStr, dueSubs, _i, dueSubs_1, sub, subId, orgId, planId, billingCycle, renewalDate, periodStart, existing, planRows, plan, amount, tax, total, orgRows, org, billingEmail, orgName, currency, periodEndDate, periodEnd, dueDate, invoiceSeq, invoiceNumber, invoiceId, planName, subject, html, emailErr_1, err_5;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _j.sent();
                    if (!db)
                        return [2 /*return*/, { generated: 0, emailed: 0 }];
                    generated = 0;
                    emailed = 0;
                    now = new Date();
                    sevenDaysOut = addDays(now, 7);
                    sevenDaysOutStr = sevenDaysOut.toISOString().replace("T", " ").slice(0, 19);
                    todayStr = now.toISOString().slice(0, 10);
                    _j.label = 2;
                case 2:
                    _j.trys.push([2, 17, , 18]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.subscriptions)
                            .where(drizzle_orm_1.and(drizzle_orm_1.inArray(schema_1.subscriptions.status, ["active", "trial"]), drizzle_orm_1.lte(schema_1.subscriptions.renewalDate, sevenDaysOutStr), drizzle_orm_1.gte(schema_1.subscriptions.renewalDate, nowIso()), drizzle_orm_1.eq(schema_1.subscriptions.isLocked, 0)))];
                case 3:
                    dueSubs = _j.sent();
                    _i = 0, dueSubs_1 = dueSubs;
                    _j.label = 4;
                case 4:
                    if (!(_i < dueSubs_1.length)) return [3 /*break*/, 16];
                    sub = dueSubs_1[_i];
                    subId = sub.id;
                    orgId = sub.organizationId;
                    planId = sub.planId;
                    billingCycle = (_a = sub.billingCycle) !== null && _a !== void 0 ? _a : "monthly";
                    renewalDate = sub.renewalDate;
                    periodStart = renewalDate.slice(0, 10);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.billingInvoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.billingInvoices.subscriptionId, subId), drizzle_orm_1.gte(schema_1.billingInvoices.billingPeriodStart, periodStart + " 00:00:00")))
                            .limit(1)];
                case 5:
                    existing = _j.sent();
                    if (existing.length > 0)
                        return [3 /*break*/, 15];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.pricingPlans)
                            .where(drizzle_orm_1.eq(schema_1.pricingPlans.id, planId))
                            .limit(1)];
                case 6:
                    planRows = _j.sent();
                    plan = planRows[0];
                    amount = billingCycle === "annual"
                        ? parseFloat((_c = (_b = plan === null || plan === void 0 ? void 0 : plan.annualPrice) !== null && _b !== void 0 ? _b : plan === null || plan === void 0 ? void 0 : plan.monthlyPrice) !== null && _c !== void 0 ? _c : "0")
                        : parseFloat((_d = plan === null || plan === void 0 ? void 0 : plan.monthlyPrice) !== null && _d !== void 0 ? _d : "0");
                    if (amount === 0 && planId === "trial")
                        return [3 /*break*/, 15]; // No invoice for free trial
                    tax = Math.round(amount * 0.16 * 100) / 100;
                    total = Math.round((amount + tax) * 100) / 100;
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.organizations)
                            .where(drizzle_orm_1.eq(schema_1.organizations.id, orgId))
                            .limit(1)];
                case 7:
                    orgRows = _j.sent();
                    org = orgRows[0];
                    billingEmail = (_e = org === null || org === void 0 ? void 0 : org.billingEmail) !== null && _e !== void 0 ? _e : null;
                    orgName = (_f = org === null || org === void 0 ? void 0 : org.name) !== null && _f !== void 0 ? _f : orgId;
                    currency = (_g = org === null || org === void 0 ? void 0 : org.currency) !== null && _g !== void 0 ? _g : "KES";
                    periodEndDate = billingCycle === "annual" ? addDays(new Date(renewalDate), 365) : addDays(new Date(renewalDate), 30);
                    periodEnd = periodEndDate.toISOString().replace("T", " ").slice(0, 19);
                    dueDate = renewalDate;
                    invoiceSeq = Math.floor(Math.random() * 900000) + 100000;
                    invoiceNumber = "INV-" + todayStr.replace(/-/g, "") + "-" + invoiceSeq;
                    invoiceId = uuid_1.v4();
                    return [4 /*yield*/, db
                            .insert(schema_1.billingInvoices)
                            .values({
                            id: invoiceId,
                            subscriptionId: subId,
                            invoiceNumber: invoiceNumber,
                            amount: String(amount),
                            tax: String(tax),
                            totalAmount: String(total),
                            currency: currency,
                            status: "sent",
                            billingPeriodStart: renewalDate,
                            billingPeriodEnd: periodEnd,
                            dueDate: dueDate,
                            sentAt: nowIso(),
                            notes: "Auto-generated invoice for " + billingCycle + " subscription renewal",
                            createdAt: nowIso(),
                            updatedAt: nowIso()
                        })];
                case 8:
                    _j.sent();
                    generated++;
                    // Create in-app billing notification
                    return [4 /*yield*/, db
                            .insert(schema_1.billingNotifications)
                            .values({
                            id: uuid_1.v4(),
                            subscriptionId: subId,
                            notificationType: "invoice_generated",
                            message: "Invoice " + invoiceNumber + " for " + currency + " " + total.toLocaleString() + " has been generated. Due: " + dueDate.slice(0, 10) + ".",
                            sentTo: billingEmail !== null && billingEmail !== void 0 ? billingEmail : null,
                            channel: "in_app",
                            isSent: 1,
                            isRead: 0,
                            createdAt: nowIso()
                        })["catch"](function () { })];
                case 9:
                    // Create in-app billing notification
                    _j.sent();
                    if (!billingEmail) return [3 /*break*/, 14];
                    _j.label = 10;
                case 10:
                    _j.trys.push([10, 13, , 14]);
                    planName = (_h = plan === null || plan === void 0 ? void 0 : plan.planName) !== null && _h !== void 0 ? _h : planId;
                    subject = "Invoice " + invoiceNumber + " \u2014 " + orgName + " Subscription Renewal";
                    html = "\n            <div style=\"font-family:sans-serif;max-width:600px;margin:0 auto\">\n              <h2 style=\"color:#4f46e5\">Subscription Invoice</h2>\n              <p>Dear " + orgName + ",</p>\n              <p>Your subscription is renewing on <strong>" + dueDate.slice(0, 10) + "</strong>. Please find your invoice details below.</p>\n              <table style=\"width:100%;border-collapse:collapse;margin:16px 0\">\n                <tr style=\"background:#f3f4f6\">\n                  <th style=\"text-align:left;padding:8px;border:1px solid #e5e7eb\">Invoice Number</th>\n                  <td style=\"padding:8px;border:1px solid #e5e7eb\">" + invoiceNumber + "</td>\n                </tr>\n                <tr>\n                  <th style=\"text-align:left;padding:8px;border:1px solid #e5e7eb\">Plan</th>\n                  <td style=\"padding:8px;border:1px solid #e5e7eb\">" + planName + " (" + billingCycle + ")</td>\n                </tr>\n                <tr style=\"background:#f3f4f6\">\n                  <th style=\"text-align:left;padding:8px;border:1px solid #e5e7eb\">Billing Period</th>\n                  <td style=\"padding:8px;border:1px solid #e5e7eb\">" + dueDate.slice(0, 10) + " \u2192 " + periodEnd.slice(0, 10) + "</td>\n                </tr>\n                <tr>\n                  <th style=\"text-align:left;padding:8px;border:1px solid #e5e7eb\">Subtotal</th>\n                  <td style=\"padding:8px;border:1px solid #e5e7eb\">" + currency + " " + amount.toFixed(2) + "</td>\n                </tr>\n                <tr style=\"background:#f3f4f6\">\n                  <th style=\"text-align:left;padding:8px;border:1px solid #e5e7eb\">VAT (16%)</th>\n                  <td style=\"padding:8px;border:1px solid #e5e7eb\">" + currency + " " + tax.toFixed(2) + "</td>\n                </tr>\n                <tr style=\"font-weight:bold\">\n                  <th style=\"text-align:left;padding:8px;border:1px solid #e5e7eb\">Total Due</th>\n                  <td style=\"padding:8px;border:1px solid #e5e7eb\">" + currency + " " + total.toFixed(2) + "</td>\n                </tr>\n                <tr>\n                  <th style=\"text-align:left;padding:8px;border:1px solid #e5e7eb\">Due Date</th>\n                  <td style=\"padding:8px;border:1px solid #e5e7eb\">" + dueDate.slice(0, 10) + "</td>\n                </tr>\n              </table>\n              <p>Please log in to your account to make a payment and keep your service active.</p>\n              <p style=\"color:#6b7280;font-size:0.875rem\">If you have any questions, please contact our billing team.</p>\n            </div>";
                    return [4 /*yield*/, mail_1.sendEmail({ to: billingEmail, subject: subject, html: html })];
                case 11:
                    _j.sent();
                    emailed++;
                    // Mark notification as emailed
                    return [4 /*yield*/, db
                            .update(schema_1.billingNotifications)
                            .set({ channel: "email", isSent: 1 })
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.billingNotifications.subscriptionId, subId), drizzle_orm_1.eq(schema_1.billingNotifications.notificationType, "invoice_generated")))["catch"](function () { })];
                case 12:
                    // Mark notification as emailed
                    _j.sent();
                    return [3 /*break*/, 14];
                case 13:
                    emailErr_1 = _j.sent();
                    console.warn("[SubscriptionJobs] Failed to email invoice " + invoiceNumber + " to " + billingEmail + ":", emailErr_1);
                    return [3 /*break*/, 14];
                case 14:
                    console.log("[SubscriptionJobs] Generated invoice " + invoiceNumber + " for sub " + subId + " (org: " + orgId + ")");
                    _j.label = 15;
                case 15:
                    _i++;
                    return [3 /*break*/, 4];
                case 16: return [3 /*break*/, 18];
                case 17:
                    err_5 = _j.sent();
                    console.error("[SubscriptionJobs] generateSubscriptionInvoices error:", err_5);
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/, { generated: generated, emailed: emailed }];
            }
        });
    });
}
exports.generateSubscriptionInvoices = generateSubscriptionInvoices;
// ── Ensure All Orgs Have Subscriptions ───────────────────────────────────────
/**
 * Find organizations that have no subscription record and create a default trial subscription.
 * Runs daily on startup — ensures no org is left without billing context.
 */
function ensureOrgsHaveSubscriptions() {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var db, created, allOrgs, existingSubs, subscribedOrgIds, _loop_1, _i, allOrgs_1, org, err_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, { created: 0 }];
                    created = 0;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 9, , 10]);
                    return [4 /*yield*/, db.select().from(schema_1.organizations).where(drizzle_orm_1.eq(schema_1.organizations.isArchived, 0))];
                case 3:
                    allOrgs = _b.sent();
                    return [4 /*yield*/, db.select().from(schema_1.subscriptions)];
                case 4:
                    existingSubs = _b.sent();
                    subscribedOrgIds = new Set(existingSubs.map(function (s) { return s.organizationId; }).filter(Boolean));
                    _loop_1 = function (org) {
                        var orgId, orgPlan, now, renewalDate, expiryDate, subId;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    orgId = org.id;
                                    if (subscribedOrgIds.has(orgId))
                                        return [2 /*return*/, "continue"];
                                    orgPlan = (_a = org.plan) !== null && _a !== void 0 ? _a : "trial";
                                    now = new Date();
                                    renewalDate = addDays(now, 30);
                                    expiryDate = addDays(now, 14);
                                    subId = "sub_" + uuid_1.v4().replace(/-/g, "").slice(0, 20);
                                    return [4 /*yield*/, db
                                            .insert(schema_1.subscriptions)
                                            .values({
                                            id: subId,
                                            organizationId: orgId,
                                            planId: orgPlan,
                                            status: orgPlan === "trial" || orgPlan === "free" ? "trial" : "active",
                                            billingCycle: "monthly",
                                            startDate: now.toISOString().replace("T", " ").slice(0, 19),
                                            renewalDate: renewalDate.toISOString().replace("T", " ").slice(0, 19),
                                            expiryDate: orgPlan === "trial" || orgPlan === "free"
                                                ? expiryDate.toISOString().replace("T", " ").slice(0, 19)
                                                : null,
                                            currentPrice: "0",
                                            isLocked: 0,
                                            autoRenew: 1,
                                            createdAt: now.toISOString().replace("T", " ").slice(0, 19),
                                            updatedAt: now.toISOString().replace("T", " ").slice(0, 19)
                                        })["catch"](function (e) { return console.warn("[SubscriptionJobs] Failed to create subscription for org " + orgId + ":", e); })];
                                case 1:
                                    _a.sent();
                                    created++;
                                    console.log("[SubscriptionJobs] Created subscription for org " + orgId + " (plan: " + orgPlan + ")");
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, allOrgs_1 = allOrgs;
                    _b.label = 5;
                case 5:
                    if (!(_i < allOrgs_1.length)) return [3 /*break*/, 8];
                    org = allOrgs_1[_i];
                    return [5 /*yield**/, _loop_1(org)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [3 /*break*/, 10];
                case 9:
                    err_6 = _b.sent();
                    console.error("[SubscriptionJobs] ensureOrgsHaveSubscriptions error:", err_6);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/, { created: created }];
            }
        });
    });
}
exports.ensureOrgsHaveSubscriptions = ensureOrgsHaveSubscriptions;
