"use strict";
/**
 * Organization Subscription Jobs
 * Creates and manages recurring subscription-related jobs when organizations are created.
 * Handles trial expiration, billing cycles, renewal reminders, and usage monitoring.
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
exports.removeOrgSubscriptionJobs = exports.updateOrgSubscriptionJobs = exports.createOrgSubscriptionJobs = void 0;
var db_1 = require("../db");
var uuid_1 = require("uuid");
// Tier configurations for subscription jobs
var TIER_JOB_CONFIG = {
    trial: { trialDays: 14, billingCycleDays: 0, reminderBeforeDays: [3, 1], usageCheckInterval: '0 8 * * *', maxUsers: 10 },
    starter: { trialDays: 0, billingCycleDays: 30, reminderBeforeDays: [7, 3, 1], usageCheckInterval: '0 6 * * *', maxUsers: 50 },
    professional: { trialDays: 0, billingCycleDays: 30, reminderBeforeDays: [7, 3, 1], usageCheckInterval: '0 6 * * *', maxUsers: 200 },
    enterprise: { trialDays: 0, billingCycleDays: 30, reminderBeforeDays: [14, 7, 3, 1], usageCheckInterval: '0 0 * * *', maxUsers: 99999 },
    custom: { trialDays: 0, billingCycleDays: 30, reminderBeforeDays: [7, 3, 1], usageCheckInterval: '0 6 * * *', maxUsers: 99999 }
};
/**
 * Create all subscription-related scheduled jobs when a new organization is created.
 * Jobs are tied to the organization and run from the date of creation.
 */
function createOrgSubscriptionJobs(orgId, orgName, plan) {
    return __awaiter(this, void 0, Promise, function () {
        var pool, config, jobsCreated, now, trialEndDate, jobId, nextRenewal, jobId, jobId, jobId, jobId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = db_1.getPool();
                    config = TIER_JOB_CONFIG[plan] || TIER_JOB_CONFIG['trial'];
                    jobsCreated = [];
                    now = new Date();
                    if (!(plan === 'trial')) return [3 /*break*/, 2];
                    trialEndDate = new Date(now.getTime() + config.trialDays * 24 * 60 * 60 * 1000);
                    jobId = "job_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                    return [4 /*yield*/, pool.query("INSERT INTO scheduledJobs (id, jobName, description, jobType, cronExpression, handler, isActive, isManualOnly, nextScheduledRun, timezone, createdBy, organizationId)\n       VALUES (?, ?, ?, 'custom', '0 8 * * *', ?, 1, 0, ?, 'Africa/Nairobi', ?, ?)", [
                            jobId,
                            "org_trial_expiry_" + orgId,
                            "Trial expiration monitor for " + orgName,
                            "orgTrialExpiry:" + orgId,
                            trialEndDate.toISOString().slice(0, 19).replace('T', ' '),
                            orgId,
                            orgId,
                        ])];
                case 1:
                    _a.sent();
                    jobsCreated.push('trial_expiration');
                    _a.label = 2;
                case 2:
                    if (!(plan !== 'trial')) return [3 /*break*/, 4];
                    nextRenewal = new Date(now.getTime() + config.billingCycleDays * 24 * 60 * 60 * 1000);
                    jobId = "job_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                    return [4 /*yield*/, pool.query("INSERT INTO scheduledJobs (id, jobName, description, jobType, cronExpression, handler, isActive, isManualOnly, nextScheduledRun, timezone, createdBy, organizationId)\n       VALUES (?, ?, ?, 'subscription_renewal', '0 2 * * *', ?, 1, 0, ?, 'Africa/Nairobi', ?, ?)", [
                            jobId,
                            "org_renewal_" + orgId,
                            "Subscription renewal for " + orgName + " (" + plan + ")",
                            "orgRenewal:" + orgId,
                            nextRenewal.toISOString().slice(0, 19).replace('T', ' '),
                            orgId,
                            orgId,
                        ])];
                case 3:
                    _a.sent();
                    jobsCreated.push('subscription_renewal');
                    _a.label = 4;
                case 4:
                    jobId = "job_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                    return [4 /*yield*/, pool.query("INSERT INTO scheduledJobs (id, jobName, description, jobType, cronExpression, handler, isActive, isManualOnly, timezone, createdBy, organizationId)\n       VALUES (?, ?, ?, 'payment_reminder', '0 9 * * *', ?, 1, 0, 'Africa/Nairobi', ?, ?)", [
                            jobId,
                            "org_payment_reminder_" + orgId,
                            "Payment/billing reminders for " + orgName,
                            "orgPaymentReminder:" + orgId,
                            orgId,
                            orgId,
                        ])];
                case 5:
                    _a.sent();
                    jobsCreated.push('payment_reminder');
                    jobId = "job_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                    return [4 /*yield*/, pool.query("INSERT INTO scheduledJobs (id, jobName, description, jobType, cronExpression, handler, isActive, isManualOnly, timezone, createdBy, organizationId)\n       VALUES (?, ?, ?, 'custom', ?, ?, 1, 0, 'Africa/Nairobi', ?, ?)", [
                            jobId,
                            "org_usage_monitor_" + orgId,
                            "Usage monitoring for " + orgName + " (max " + config.maxUsers + " users)",
                            "orgUsageMonitor:" + orgId,
                            config.usageCheckInterval,
                            orgId,
                            orgId,
                        ])];
                case 6:
                    _a.sent();
                    jobsCreated.push('usage_monitor');
                    if (!(plan !== 'trial')) return [3 /*break*/, 8];
                    jobId = "job_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                    return [4 /*yield*/, pool.query("INSERT INTO scheduledJobs (id, jobName, description, jobType, cronExpression, handler, isActive, isManualOnly, timezone, createdBy, organizationId)\n       VALUES (?, ?, ?, 'recurring_invoice', '0 1 1 * *', ?, 1, 0, 'Africa/Nairobi', ?, ?)", [
                            jobId,
                            "org_billing_invoice_" + orgId,
                            "Monthly billing invoice generation for " + orgName,
                            "orgBillingInvoice:" + orgId,
                            orgId,
                            orgId,
                        ])];
                case 7:
                    _a.sent();
                    jobsCreated.push('billing_invoice');
                    _a.label = 8;
                case 8:
                    console.log("[OrgSubscription] Created " + jobsCreated.length + " jobs for org " + orgName + " (" + plan + "):", jobsCreated);
                    return [2 /*return*/, { jobsCreated: jobsCreated }];
            }
        });
    });
}
exports.createOrgSubscriptionJobs = createOrgSubscriptionJobs;
/**
 * Update subscription jobs when an organization's tier/plan changes.
 * Removes old trial job if upgrading from trial, adjusts renewal schedules, etc.
 */
function updateOrgSubscriptionJobs(orgId, orgName, oldPlan, newPlan) {
    return __awaiter(this, void 0, Promise, function () {
        var pool, newConfig, updated, created, removed, now, nextRenewal, renewalJobId, invoiceJobId, now, trialEndDate, trialJobId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = db_1.getPool();
                    newConfig = TIER_JOB_CONFIG[newPlan] || TIER_JOB_CONFIG['trial'];
                    updated = [];
                    created = [];
                    removed = [];
                    if (!(oldPlan === 'trial' && newPlan !== 'trial')) return [3 /*break*/, 4];
                    // Remove trial expiry job
                    return [4 /*yield*/, pool.query("DELETE FROM scheduledJobs WHERE jobName = ?", ["org_trial_expiry_" + orgId])];
                case 1:
                    // Remove trial expiry job
                    _a.sent();
                    removed.push('trial_expiration');
                    now = new Date();
                    nextRenewal = new Date(now.getTime() + newConfig.billingCycleDays * 24 * 60 * 60 * 1000);
                    renewalJobId = "job_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                    return [4 /*yield*/, pool.query("INSERT INTO scheduledJobs (id, jobName, description, jobType, cronExpression, handler, isActive, isManualOnly, nextScheduledRun, timezone, createdBy, organizationId)\n       VALUES (?, ?, ?, 'subscription_renewal', '0 2 * * *', ?, 1, 0, ?, 'Africa/Nairobi', ?, ?)\n       ON DUPLICATE KEY UPDATE description = VALUES(description), isActive = 1", [
                            renewalJobId,
                            "org_renewal_" + orgId,
                            "Subscription renewal for " + orgName + " (" + newPlan + ")",
                            "orgRenewal:" + orgId,
                            nextRenewal.toISOString().slice(0, 19).replace('T', ' '),
                            orgId,
                            orgId,
                        ])];
                case 2:
                    _a.sent();
                    created.push('subscription_renewal');
                    invoiceJobId = "job_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                    return [4 /*yield*/, pool.query("INSERT INTO scheduledJobs (id, jobName, description, jobType, cronExpression, handler, isActive, isManualOnly, timezone, createdBy, organizationId)\n       VALUES (?, ?, ?, 'recurring_invoice', '0 1 1 * *', ?, 1, 0, 'Africa/Nairobi', ?, ?)\n       ON DUPLICATE KEY UPDATE description = VALUES(description), isActive = 1", [
                            invoiceJobId,
                            "org_billing_invoice_" + orgId,
                            "Monthly billing invoice generation for " + orgName,
                            "orgBillingInvoice:" + orgId,
                            orgId,
                            orgId,
                        ])];
                case 3:
                    _a.sent();
                    created.push('billing_invoice');
                    _a.label = 4;
                case 4:
                    if (!(oldPlan !== 'trial' && newPlan === 'trial')) return [3 /*break*/, 8];
                    return [4 /*yield*/, pool.query("DELETE FROM scheduledJobs WHERE jobName = ?", ["org_renewal_" + orgId])];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, pool.query("DELETE FROM scheduledJobs WHERE jobName = ?", ["org_billing_invoice_" + orgId])];
                case 6:
                    _a.sent();
                    removed.push('subscription_renewal', 'billing_invoice');
                    now = new Date();
                    trialEndDate = new Date(now.getTime() + newConfig.trialDays * 24 * 60 * 60 * 1000);
                    trialJobId = "job_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                    return [4 /*yield*/, pool.query("INSERT INTO scheduledJobs (id, jobName, description, jobType, cronExpression, handler, isActive, isManualOnly, nextScheduledRun, timezone, createdBy, organizationId)\n       VALUES (?, ?, ?, 'custom', '0 8 * * *', ?, 1, 0, ?, 'Africa/Nairobi', ?, ?)\n       ON DUPLICATE KEY UPDATE description = VALUES(description), isActive = 1", [
                            trialJobId,
                            "org_trial_expiry_" + orgId,
                            "Trial expiration monitor for " + orgName,
                            "orgTrialExpiry:" + orgId,
                            trialEndDate.toISOString().slice(0, 19).replace('T', ' '),
                            orgId,
                            orgId,
                        ])];
                case 7:
                    _a.sent();
                    created.push('trial_expiration');
                    _a.label = 8;
                case 8: 
                // Update usage monitor cron schedule for new tier
                return [4 /*yield*/, pool.query("UPDATE scheduledJobs SET cronExpression = ?, description = ? WHERE jobName = ?", [
                        newConfig.usageCheckInterval,
                        "Usage monitoring for " + orgName + " (max " + newConfig.maxUsers + " users)",
                        "org_usage_monitor_" + orgId,
                    ])];
                case 9:
                    // Update usage monitor cron schedule for new tier
                    _a.sent();
                    updated.push('usage_monitor');
                    if (!(oldPlan !== 'trial' && newPlan !== 'trial')) return [3 /*break*/, 11];
                    return [4 /*yield*/, pool.query("UPDATE scheduledJobs SET description = ? WHERE jobName = ?", ["Subscription renewal for " + orgName + " (" + newPlan + ")", "org_renewal_" + orgId])];
                case 10:
                    _a.sent();
                    updated.push('subscription_renewal');
                    _a.label = 11;
                case 11: 
                // Update payment reminder description
                return [4 /*yield*/, pool.query("UPDATE scheduledJobs SET description = ? WHERE jobName = ?", ["Payment/billing reminders for " + orgName + " (" + newPlan + ")", "org_payment_reminder_" + orgId])];
                case 12:
                    // Update payment reminder description
                    _a.sent();
                    updated.push('payment_reminder');
                    console.log("[OrgSubscription] Tier change " + oldPlan + " \u2192 " + newPlan + " for " + orgName + ": updated=" + updated + ", created=" + created + ", removed=" + removed);
                    return [2 /*return*/, { updated: updated, created: created, removed: removed }];
            }
        });
    });
}
exports.updateOrgSubscriptionJobs = updateOrgSubscriptionJobs;
/**
 * Remove all subscription jobs for an organization (e.g. on org deletion)
 */
function removeOrgSubscriptionJobs(orgId) {
    return __awaiter(this, void 0, Promise, function () {
        var pool, patterns, removed, _i, patterns_1, jobName, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = db_1.getPool();
                    patterns = [
                        "org_trial_expiry_" + orgId,
                        "org_renewal_" + orgId,
                        "org_payment_reminder_" + orgId,
                        "org_usage_monitor_" + orgId,
                        "org_billing_invoice_" + orgId,
                    ];
                    removed = 0;
                    _i = 0, patterns_1 = patterns;
                    _a.label = 1;
                case 1:
                    if (!(_i < patterns_1.length)) return [3 /*break*/, 4];
                    jobName = patterns_1[_i];
                    return [4 /*yield*/, pool.query("DELETE FROM scheduledJobs WHERE jobName = ?", [jobName])];
                case 2:
                    result = (_a.sent())[0];
                    removed += result.affectedRows || 0;
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("[OrgSubscription] Removed " + removed + " jobs for org " + orgId);
                    return [2 /*return*/, removed];
            }
        });
    });
}
exports.removeOrgSubscriptionJobs = removeOrgSubscriptionJobs;
