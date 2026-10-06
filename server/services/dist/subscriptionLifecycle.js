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
exports.runSubscriptionAutomationCycle = exports.sendPendingBillingNotifications = exports.reconcileOrganizationSubscriptionState = exports.ensureSubscriptionsForAllOrganizations = exports.ensureSubscriptionForOrganization = void 0;
var uuid_1 = require("uuid");
var drizzle_orm_1 = require("drizzle-orm");
var db = require("../db");
var emailService_1 = require("./emailService");
function toSqlDateTime(value) {
    return value.toISOString().slice(0, 19).replace("T", " ");
}
function addBillingCycle(base, cycle) {
    var next = new Date(base);
    if (cycle === "annual") {
        next.setFullYear(next.getFullYear() + 1);
    }
    else {
        next.setMonth(next.getMonth() + 1);
    }
    return next;
}
function normalizePlanKey(plan) {
    return (plan || "trial").toLowerCase();
}
function isFreeLikePlan(planKey) {
    var key = normalizePlanKey(planKey);
    return key === "trial" || key === "free";
}
function resolvePlanForOrg(planKey) {
    return __awaiter(this, void 0, void 0, function () {
        var database, pricingPlans, candidates, normalized;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 2:
                    pricingPlans = (_a.sent()).pricingPlans;
                    return [4 /*yield*/, database
                            .select()
                            .from(pricingPlans)
                            .where(drizzle_orm_1.eq(pricingPlans.isActive, 1))];
                case 3:
                    candidates = _a.sent();
                    normalized = normalizePlanKey(planKey);
                    return [2 /*return*/, (candidates.find(function (p) { return p.id === normalized; }) ||
                            candidates.find(function (p) { return (p.planSlug || "").toLowerCase() === normalized; }) ||
                            candidates.find(function (p) { return (p.tier || "").toLowerCase() === normalized; }) ||
                            candidates[0] ||
                            null)];
            }
        });
    });
}
function resolvePlanCatalog() {
    return __awaiter(this, void 0, Promise, function () {
        var catalog, setting, parsed, _i, _a, _b, key, value;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    catalog = {};
                    return [4 /*yield*/, db.getSetting("plan_prices")];
                case 1:
                    setting = _c.sent();
                    if (setting === null || setting === void 0 ? void 0 : setting.value) {
                        try {
                            parsed = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
                            if (parsed && typeof parsed === "object") {
                                for (_i = 0, _a = Object.entries(parsed); _i < _a.length; _i++) {
                                    _b = _a[_i], key = _b[0], value = _b[1];
                                    catalog[normalizePlanKey(key)] = value;
                                }
                            }
                        }
                        catch (_d) {
                            // Ignore malformed settings and continue with DB pricingPlans.
                        }
                    }
                    return [2 /*return*/, catalog];
            }
        });
    });
}
function resolvePlanPrice(planKey, cycle) {
    var _a, _b;
    return __awaiter(this, void 0, Promise, function () {
        var plan, catalog, entry;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, resolvePlanForOrg(planKey)];
                case 1:
                    plan = _c.sent();
                    if (plan) {
                        return [2 /*return*/, String(cycle === "annual" ? plan.annualPrice || "0" : plan.monthlyPrice || "0")];
                    }
                    return [4 /*yield*/, resolvePlanCatalog()];
                case 2:
                    catalog = _c.sent();
                    entry = catalog[normalizePlanKey(planKey)];
                    if (entry) {
                        return [2 /*return*/, String(cycle === "annual" ? (_a = entry.annualKes) !== null && _a !== void 0 ? _a : 0 : (_b = entry.monthlyKes) !== null && _b !== void 0 ? _b : 0)];
                    }
                    return [2 /*return*/, "0"];
            }
        });
    });
}
function ensureSubscriptionForOrganization(org) {
    return __awaiter(this, void 0, Promise, function () {
        var database, subscriptions, existing, billingCycle, now, renewalDate, planKey, isOpenPlan, currentPrice, _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _f.sent();
                    if (!database)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 2:
                    subscriptions = (_f.sent()).subscriptions;
                    return [4 /*yield*/, database
                            .select({ id: subscriptions.id })
                            .from(subscriptions)
                            .where(drizzle_orm_1.or(drizzle_orm_1.eq(subscriptions.organizationId, org.id), drizzle_orm_1.eq(subscriptions.clientId, org.id)))
                            .limit(1)];
                case 3:
                    existing = _f.sent();
                    if (existing.length > 0)
                        return [2 /*return*/, false];
                    billingCycle = "monthly";
                    now = new Date();
                    renewalDate = addBillingCycle(now, billingCycle);
                    planKey = normalizePlanKey(org.plan);
                    isOpenPlan = isFreeLikePlan(planKey);
                    return [4 /*yield*/, resolvePlanPrice(planKey, billingCycle)];
                case 4:
                    currentPrice = _f.sent();
                    return [4 /*yield*/, database.insert(subscriptions).values({
                            id: "sub_" + uuid_1.v4().replace(/-/g, "").slice(0, 20),
                            organizationId: org.id,
                            clientId: null,
                            planId: planKey,
                            status: isOpenPlan ? "trial" : "suspended",
                            billingCycle: billingCycle,
                            startDate: toSqlDateTime(now),
                            renewalDate: toSqlDateTime(renewalDate),
                            currentPrice: currentPrice,
                            autoRenew: 1,
                            isLocked: isOpenPlan ? 0 : 1,
                            createdAt: toSqlDateTime(now),
                            updatedAt: toSqlDateTime(now)
                        })];
                case 5:
                    _f.sent();
                    _c = (_b = database).update;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 6:
                    _d = (_a = _c.apply(_b, [(_f.sent()).organizations])
                        .set({ isActive: isOpenPlan ? 1 : 0, updatedAt: toSqlDateTime(now) })).where;
                    _e = drizzle_orm_1.eq;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 7: 
                // Ensure org active-state reflects subscription state.
                return [4 /*yield*/, _d.apply(_a, [_e.apply(void 0, [(_f.sent()).organizations.id, org.id])])];
                case 8:
                    // Ensure org active-state reflects subscription state.
                    _f.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.ensureSubscriptionForOrganization = ensureSubscriptionForOrganization;
function ensureSubscriptionsForAllOrganizations() {
    return __awaiter(this, void 0, Promise, function () {
        var database, organizations, rows, checked, created, errors, _i, _a, org, made, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _b.sent();
                    if (!database)
                        return [2 /*return*/, { checked: 0, created: 0, errors: 1 }];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 2:
                    organizations = (_b.sent()).organizations;
                    return [4 /*yield*/, database.select().from(organizations)];
                case 3:
                    rows = _b.sent();
                    checked = 0;
                    created = 0;
                    errors = 0;
                    _i = 0, _a = rows;
                    _b.label = 4;
                case 4:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    org = _a[_i];
                    checked += 1;
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, ensureSubscriptionForOrganization(org)];
                case 6:
                    made = _b.sent();
                    if (made)
                        created += 1;
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _b.sent();
                    errors += 1;
                    console.error("[SubscriptionLifecycle] ensure subscription failed", { orgId: org.id, error: error_1 });
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9: return [2 /*return*/, { checked: checked, created: created, errors: errors }];
            }
        });
    });
}
exports.ensureSubscriptionsForAllOrganizations = ensureSubscriptionsForAllOrganizations;
function createRenewalInvoice(subscription, org, leadDays, sendEmail) {
    return __awaiter(this, void 0, Promise, function () {
        var database, billingInvoices, now, renewalDate, msPerDay, daysToRenewal, openInvoice, invoiceId, orgSuffix, invoiceNumber, nextPeriodEnd, dueDate, recipient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 2:
                    billingInvoices = (_a.sent()).billingInvoices;
                    now = new Date();
                    renewalDate = new Date(subscription.renewalDate);
                    msPerDay = 24 * 60 * 60 * 1000;
                    daysToRenewal = Math.floor((renewalDate.getTime() - now.getTime()) / msPerDay);
                    if (daysToRenewal > leadDays)
                        return [2 /*return*/, false];
                    if (!subscription.autoRenew)
                        return [2 /*return*/, false];
                    if (subscription.status === "cancelled" || subscription.status === "expired")
                        return [2 /*return*/, false];
                    return [4 /*yield*/, database
                            .select({ id: billingInvoices.id })
                            .from(billingInvoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(billingInvoices.subscriptionId, subscription.id), drizzle_orm_1.or(drizzle_orm_1.eq(billingInvoices.status, "pending"), drizzle_orm_1.eq(billingInvoices.status, "sent"), drizzle_orm_1.eq(billingInvoices.status, "viewed")), drizzle_orm_1.lte(billingInvoices.billingPeriodStart, toSqlDateTime(renewalDate)), drizzle_orm_1.gte(billingInvoices.billingPeriodEnd, toSqlDateTime(renewalDate))))
                            .limit(1)];
                case 3:
                    openInvoice = _a.sent();
                    if (openInvoice.length > 0)
                        return [2 /*return*/, false];
                    invoiceId = "binv_" + uuid_1.v4().replace(/-/g, "").slice(0, 20);
                    orgSuffix = (org.id || "ORG").slice(-6).toUpperCase();
                    invoiceNumber = "SUB-" + orgSuffix + "-" + Date.now().toString(36).toUpperCase();
                    nextPeriodEnd = addBillingCycle(renewalDate, subscription.billingCycle);
                    dueDate = new Date(renewalDate);
                    return [4 /*yield*/, database.insert(billingInvoices).values({
                            id: invoiceId,
                            subscriptionId: subscription.id,
                            invoiceNumber: invoiceNumber,
                            amount: subscription.currentPrice || "0",
                            tax: "0",
                            totalAmount: subscription.currentPrice || "0",
                            currency: org.currency || "KES",
                            status: "pending",
                            billingPeriodStart: toSqlDateTime(renewalDate),
                            billingPeriodEnd: toSqlDateTime(nextPeriodEnd),
                            dueDate: toSqlDateTime(dueDate),
                            notes: "Auto-generated subscription renewal invoice for " + (org.name || org.id),
                            createdAt: toSqlDateTime(now),
                            updatedAt: toSqlDateTime(now)
                        })];
                case 4:
                    _a.sent();
                    if (!sendEmail) return [3 /*break*/, 7];
                    recipient = org.billingEmail || org.contactEmail;
                    if (!recipient) return [3 /*break*/, 7];
                    return [4 /*yield*/, emailService_1.queueEmail({
                            toEmail: recipient,
                            subject: "Subscription Invoice " + invoiceNumber,
                            htmlContent: "<p>Hello " + (org.name || "there") + ",</p><p>Your subscription invoice <strong>" + invoiceNumber + "</strong> has been generated.</p><p>Amount: <strong>" + (subscription.currentPrice || "0") + " " + (org.currency || "KES") + "</strong><br/>Due date: <strong>" + dueDate.toDateString() + "</strong></p><p>Please complete payment to keep your service active.</p>",
                            relatedEntityType: "billing_invoice",
                            relatedEntityId: invoiceId
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, database.update(billingInvoices)
                            .set({ status: "sent", sentAt: toSqlDateTime(new Date()) })
                            .where(drizzle_orm_1.eq(billingInvoices.id, invoiceId))];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/, true];
            }
        });
    });
}
function reconcileOrganizationSubscriptionState(options) {
    var _a;
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var _b, graceDays, _c, invoiceLeadDays, _d, sendInvoiceEmails, _e, generateInvoices, database, _f, subscriptions, organizations, billingInvoices, subs, now, suspended, reactivated, invoicesGenerated, errors, _i, _g, sub, orgId, orgRows, org, renewalDate, graceEnd, latestPaid, overdueUnpaid, paidInvoice, hasRecentPayment, nextRenewalBase, nextRenewal, generated, error_2;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _b = options.graceDays, graceDays = _b === void 0 ? 3 : _b, _c = options.invoiceLeadDays, invoiceLeadDays = _c === void 0 ? 7 : _c, _d = options.sendInvoiceEmails, sendInvoiceEmails = _d === void 0 ? true : _d, _e = options.generateInvoices, generateInvoices = _e === void 0 ? true : _e;
                    return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _h.sent();
                    if (!database) {
                        return [2 /*return*/, { checked: 0, suspended: 0, reactivated: 0, invoicesGenerated: 0, errors: 1 }];
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 2:
                    _f = _h.sent(), subscriptions = _f.subscriptions, organizations = _f.organizations, billingInvoices = _f.billingInvoices;
                    return [4 /*yield*/, database.select().from(subscriptions).orderBy(drizzle_orm_1.desc(subscriptions.updatedAt))];
                case 3:
                    subs = _h.sent();
                    now = new Date();
                    suspended = 0;
                    reactivated = 0;
                    invoicesGenerated = 0;
                    errors = 0;
                    _i = 0, _g = subs;
                    _h.label = 4;
                case 4:
                    if (!(_i < _g.length)) return [3 /*break*/, 19];
                    sub = _g[_i];
                    _h.label = 5;
                case 5:
                    _h.trys.push([5, 17, , 18]);
                    orgId = sub.organizationId || sub.clientId;
                    if (!orgId)
                        return [3 /*break*/, 18];
                    return [4 /*yield*/, database.select().from(organizations).where(drizzle_orm_1.eq(organizations.id, orgId)).limit(1)];
                case 6:
                    orgRows = _h.sent();
                    org = orgRows[0];
                    if (!org)
                        return [3 /*break*/, 18];
                    renewalDate = new Date(sub.renewalDate);
                    graceEnd = new Date(renewalDate.getTime() + graceDays * 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, database
                            .select()
                            .from(billingInvoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(billingInvoices.subscriptionId, sub.id), drizzle_orm_1.eq(billingInvoices.status, "paid")))
                            .orderBy(drizzle_orm_1.desc(billingInvoices.paidAt), drizzle_orm_1.desc(billingInvoices.updatedAt))
                            .limit(1)];
                case 7:
                    latestPaid = _h.sent();
                    return [4 /*yield*/, database
                            .select({ id: billingInvoices.id })
                            .from(billingInvoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(billingInvoices.subscriptionId, sub.id), drizzle_orm_1.or(drizzle_orm_1.eq(billingInvoices.status, "pending"), drizzle_orm_1.eq(billingInvoices.status, "sent"), drizzle_orm_1.eq(billingInvoices.status, "viewed")), drizzle_orm_1.lte(billingInvoices.dueDate, toSqlDateTime(now))))
                            .orderBy(drizzle_orm_1.desc(billingInvoices.dueDate))
                            .limit(1)];
                case 8:
                    overdueUnpaid = _h.sent();
                    paidInvoice = latestPaid[0];
                    hasRecentPayment = Boolean(paidInvoice &&
                        paidInvoice.paidAt &&
                        new Date(paidInvoice.paidAt).getTime() >= renewalDate.getTime());
                    if (!hasRecentPayment) return [3 /*break*/, 11];
                    nextRenewalBase = renewalDate > now ? renewalDate : now;
                    nextRenewal = addBillingCycle(nextRenewalBase, sub.billingCycle);
                    return [4 /*yield*/, database.update(subscriptions)
                            .set({
                            status: "active",
                            isLocked: 0,
                            renewalDate: toSqlDateTime(nextRenewal),
                            updatedAt: toSqlDateTime(now)
                        })
                            .where(drizzle_orm_1.eq(subscriptions.id, sub.id))];
                case 9:
                    _h.sent();
                    return [4 /*yield*/, database.update(organizations)
                            .set({ isActive: 1, updatedAt: toSqlDateTime(now) })
                            .where(drizzle_orm_1.eq(organizations.id, orgId))];
                case 10:
                    _h.sent();
                    reactivated += 1;
                    return [3 /*break*/, 14];
                case 11:
                    if (!(overdueUnpaid.length > 0 && now > graceEnd)) return [3 /*break*/, 14];
                    return [4 /*yield*/, database.update(subscriptions)
                            .set({
                            status: "suspended",
                            isLocked: 1,
                            updatedAt: toSqlDateTime(now)
                        })
                            .where(drizzle_orm_1.eq(subscriptions.id, sub.id))];
                case 12:
                    _h.sent();
                    return [4 /*yield*/, database.update(organizations)
                            .set({ isActive: 0, updatedAt: toSqlDateTime(now) })
                            .where(drizzle_orm_1.eq(organizations.id, orgId))];
                case 13:
                    _h.sent();
                    suspended += 1;
                    _h.label = 14;
                case 14:
                    if (!generateInvoices) return [3 /*break*/, 16];
                    return [4 /*yield*/, createRenewalInvoice(sub, org, invoiceLeadDays, sendInvoiceEmails)];
                case 15:
                    generated = _h.sent();
                    if (generated)
                        invoicesGenerated += 1;
                    _h.label = 16;
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_2 = _h.sent();
                    errors += 1;
                    console.error("[SubscriptionLifecycle] reconcile failed", { subscriptionId: (_a = sub) === null || _a === void 0 ? void 0 : _a.id, error: error_2 });
                    return [3 /*break*/, 18];
                case 18:
                    _i++;
                    return [3 /*break*/, 4];
                case 19: return [2 /*return*/, { checked: subs.length, suspended: suspended, reactivated: reactivated, invoicesGenerated: invoicesGenerated, errors: errors }];
            }
        });
    });
}
exports.reconcileOrganizationSubscriptionState = reconcileOrganizationSubscriptionState;
function createBillingNotification(subscriptionId, notificationType, message, recipientEmail) {
    return __awaiter(this, void 0, Promise, function () {
        var database, billingNotifications, now, notificationId, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 2:
                    billingNotifications = (_a.sent()).billingNotifications;
                    now = new Date();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    notificationId = "bn_" + uuid_1.v4().replace(/-/g, "").slice(0, 20);
                    return [4 /*yield*/, database.insert(billingNotifications).values({
                            id: notificationId,
                            subscriptionId: subscriptionId,
                            notificationType: notificationType,
                            message: message,
                            sentTo: recipientEmail,
                            isSent: 0,
                            createdAt: toSqlDateTime(now)
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, true];
                case 5:
                    error_3 = _a.sent();
                    console.error("[SubscriptionLifecycle] Failed to create billing notification", error_3);
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function sendPendingBillingNotifications() {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var database, _b, billingNotifications, subscriptions, organizations, pending, sent, failed, _i, _c, note, subRows, sub, orgId, orgRows, org, recipient, error_4;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _d.sent();
                    if (!database)
                        return [2 /*return*/, { sent: 0, failed: 0 }];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 2:
                    _b = _d.sent(), billingNotifications = _b.billingNotifications, subscriptions = _b.subscriptions, organizations = _b.organizations;
                    return [4 /*yield*/, database.select()
                            .from(billingNotifications)
                            .where(drizzle_orm_1.eq(billingNotifications.isSent, 0))
                            .orderBy(drizzle_orm_1.desc(billingNotifications.createdAt))
                            .limit(200)];
                case 3:
                    pending = _d.sent();
                    sent = 0;
                    failed = 0;
                    _i = 0, _c = pending;
                    _d.label = 4;
                case 4:
                    if (!(_i < _c.length)) return [3 /*break*/, 12];
                    note = _c[_i];
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 10, , 11]);
                    return [4 /*yield*/, database.select()
                            .from(subscriptions)
                            .where(drizzle_orm_1.eq(subscriptions.id, note.subscriptionId))
                            .limit(1)];
                case 6:
                    subRows = _d.sent();
                    sub = subRows[0];
                    if (!sub)
                        return [3 /*break*/, 11];
                    orgId = sub.organizationId || sub.clientId;
                    if (!orgId)
                        return [3 /*break*/, 11];
                    return [4 /*yield*/, database.select()
                            .from(organizations)
                            .where(drizzle_orm_1.eq(organizations.id, orgId))
                            .limit(1)];
                case 7:
                    orgRows = _d.sent();
                    org = orgRows[0];
                    if (!org)
                        return [3 /*break*/, 11];
                    recipient = note.sentTo || org.billingEmail || org.contactEmail;
                    if (!recipient)
                        return [3 /*break*/, 11];
                    return [4 /*yield*/, emailService_1.queueEmail({
                            toEmail: recipient,
                            subject: "Subscription notice: " + String(note.notificationType).replace(/_/g, " "),
                            htmlContent: "<p>Hello " + (org.name || "there") + ",</p><p>" + (note.message || "Please review your subscription billing status.") + "</p>",
                            relatedEntityType: "subscription",
                            relatedEntityId: sub.id
                        })];
                case 8:
                    _d.sent();
                    return [4 /*yield*/, database.update(billingNotifications)
                            .set({
                            isSent: 1,
                            sentAt: toSqlDateTime(new Date())
                        })
                            .where(drizzle_orm_1.eq(billingNotifications.id, note.id))];
                case 9:
                    _d.sent();
                    sent += 1;
                    return [3 /*break*/, 11];
                case 10:
                    error_4 = _d.sent();
                    failed += 1;
                    console.error("[SubscriptionLifecycle] Failed to send billing notification", { id: (_a = note) === null || _a === void 0 ? void 0 : _a.id, error: error_4 });
                    return [3 /*break*/, 11];
                case 11:
                    _i++;
                    return [3 /*break*/, 4];
                case 12: return [2 /*return*/, { sent: sent, failed: failed }];
            }
        });
    });
}
exports.sendPendingBillingNotifications = sendPendingBillingNotifications;
function runSubscriptionAutomationCycle(options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var ensured, reconciled, notifications;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureSubscriptionsForAllOrganizations()];
                case 1:
                    ensured = _a.sent();
                    return [4 /*yield*/, reconcileOrganizationSubscriptionState(options)];
                case 2:
                    reconciled = _a.sent();
                    return [4 /*yield*/, sendPendingBillingNotifications()];
                case 3:
                    notifications = _a.sent();
                    return [2 /*return*/, { ensured: ensured, reconciled: reconciled, notifications: notifications }];
            }
        });
    });
}
exports.runSubscriptionAutomationCycle = runSubscriptionAutomationCycle;
