"use strict";
/**
 * Job Scheduler Service
 * Manages scheduled background jobs, monitoring, and alerting
 * Supports cron-based scheduling, manual triggers, and health checks
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
exports.shutdownScheduler = exports.getAllJobsStatus = exports.getJobHistory = exports.executeJobManually = exports.registerJob = exports.initializeScheduler = void 0;
var CronJob = require("cron");
var db = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
var JobSchedulerService = /** @class */ (function () {
    function JobSchedulerService() {
        this.jobs = new Map();
        this.jobHandlers = new Map();
        this.tickInterval = null;
    }
    /**
     * Initialize scheduler and load jobs from database
     */
    JobSchedulerService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var database, scheduledJobs, eq, jobs, _i, jobs_1, job, handler, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('[JobScheduler] Initializing...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, db.getDb()];
                    case 2:
                        database = _a.sent();
                        if (!database) {
                            console.warn('[JobScheduler] Database not available - jobs will not be scheduled');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        scheduledJobs = (_a.sent()).scheduledJobs;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 4:
                        eq = (_a.sent()).eq;
                        return [4 /*yield*/, database.select()
                                .from(scheduledJobs)
                                .where(eq(scheduledJobs.isActive, true))];
                    case 5:
                        jobs = _a.sent();
                        for (_i = 0, jobs_1 = jobs; _i < jobs_1.length; _i++) {
                            job = jobs_1[_i];
                            handler = this.getJobHandler(job.jobType);
                            if (handler) {
                                this.registerJob({
                                    jobName: job.jobName,
                                    description: job.description || undefined,
                                    jobType: job.jobType,
                                    cronExpression: job.cronExpression,
                                    handler: handler,
                                    isActive: true,
                                    timezone: job.timezone || 'UTC'
                                });
                            }
                        }
                        // Start health check tick
                        this.startHealthCheckTick();
                        console.log("[JobScheduler] Initialized with " + this.jobs.size + " active jobs");
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error('[JobScheduler] Initialization error:', error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register a new scheduled job
     */
    JobSchedulerService.prototype.registerJob = function (config) {
        var _this = this;
        try {
            // Stop existing job if any
            if (this.jobs.has(config.jobName)) {
                var existing = this.jobs.get(config.jobName);
                existing === null || existing === void 0 ? void 0 : existing.stop();
                this.jobs["delete"](config.jobName);
            }
            // Create and start cron job
            var cronJob = CronJob.CronJob.from({
                cronTime: config.cronExpression,
                onTick: function () { return _this.executeJob(config.jobName, config.handler); },
                start: config.isActive !== false,
                timeZone: config.timezone || 'UTC'
            });
            this.jobs.set(config.jobName, cronJob);
            this.jobHandlers.set(config.jobName, config.handler);
            console.log("[JobScheduler] Registered job: " + config.jobName + " (" + config.cronExpression + ")");
            return { success: true, jobId: config.jobName };
        }
        catch (error) {
            console.error("[JobScheduler] Failed to register job " + config.jobName + ":", error);
            return { success: false };
        }
    };
    /**
     * Execute a job immediately
     */
    JobSchedulerService.prototype.executeJob = function (jobName, handler) {
        return __awaiter(this, void 0, void 0, function () {
            var database, logId, startTime, jobExecutionLogs, scheduledJobs, eq, jobRecord, jobId, result, duration, error_2, duration, errorMsg, jobRecord;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _a.sent();
                        if (!database) {
                            console.error('[JobScheduler] Database not available - cannot execute job');
                            return [2 /*return*/];
                        }
                        logId = uuid_1.v4();
                        startTime = new Date();
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        jobExecutionLogs = (_a.sent()).jobExecutionLogs;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        scheduledJobs = (_a.sent()).scheduledJobs;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 4:
                        eq = (_a.sent()).eq;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 11, , 17]);
                        console.log("[JobScheduler] Executing job: " + jobName);
                        return [4 /*yield*/, database.select()
                                .from(scheduledJobs)
                                .where(eq(scheduledJobs.jobName, jobName))
                                .limit(1)];
                    case 6:
                        jobRecord = _a.sent();
                        if (!jobRecord.length) {
                            console.warn("[JobScheduler] Job record not found: " + jobName);
                            return [2 /*return*/];
                        }
                        jobId = jobRecord[0].id;
                        // Create execution log entry
                        return [4 /*yield*/, database.insert(jobExecutionLogs).values({
                                id: logId,
                                jobId: jobId,
                                status: 'running'
                            })];
                    case 7:
                        // Create execution log entry
                        _a.sent();
                        return [4 /*yield*/, Promise.race([
                                handler(),
                                new Promise(function (_, reject) {
                                    return setTimeout(function () { return reject(new Error('Job execution timeout (2h)')); }, 2 * 60 * 60 * 1000);
                                }),
                            ])];
                    case 8:
                        result = _a.sent();
                        duration = Date.now() - startTime.getTime();
                        // Update execution log
                        return [4 /*yield*/, database.update(jobExecutionLogs)
                                .set({
                                status: 'success',
                                duration: duration,
                                itemsProcessed: (result === null || result === void 0 ? void 0 : result.itemsProcessed) || 0,
                                itemsFailed: (result === null || result === void 0 ? void 0 : result.itemsFailed) || 0,
                                endTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                stdout: JSON.stringify(result, null, 2)
                            })
                                .where(eq(jobExecutionLogs.id, logId))];
                    case 9:
                        // Update execution log
                        _a.sent();
                        // Update job metadata
                        return [4 /*yield*/, database.update(scheduledJobs)
                                .set({
                                lastRunAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                lastRunStatus: 'success',
                                lastRunDuration: duration,
                                nextScheduledRun: this.getNextCronTime(jobName)
                            })
                                .where(eq(scheduledJobs.id, jobId))];
                    case 10:
                        // Update job metadata
                        _a.sent();
                        console.log("[JobScheduler] Job completed: " + jobName + " (" + duration + "ms)");
                        return [3 /*break*/, 17];
                    case 11:
                        error_2 = _a.sent();
                        duration = Date.now() - startTime.getTime();
                        errorMsg = error_2 instanceof Error ? error_2.message : String(error_2);
                        console.error("[JobScheduler] Job failed: " + jobName, error_2);
                        // Update execution log
                        return [4 /*yield*/, database.update(jobExecutionLogs)
                                .set({
                                status: 'failed',
                                duration: duration,
                                endTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                errorMessage: errorMsg,
                                stderr: errorMsg
                            })
                                .where(eq(jobExecutionLogs.id, logId))];
                    case 12:
                        // Update execution log
                        _a.sent();
                        return [4 /*yield*/, database.select()
                                .from(scheduledJobs)
                                .where(eq(scheduledJobs.jobName, jobName))
                                .limit(1)];
                    case 13:
                        jobRecord = _a.sent();
                        if (!jobRecord.length) return [3 /*break*/, 16];
                        return [4 /*yield*/, database.update(scheduledJobs)
                                .set({
                                lastRunAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                lastRunStatus: 'failed',
                                lastRunDuration: duration,
                                lastFailureReason: errorMsg,
                                nextScheduledRun: this.getNextCronTime(jobName)
                            })
                                .where(eq(scheduledJobs.id, jobRecord[0].id))];
                    case 14:
                        _a.sent();
                        // Trigger alerts if configured
                        return [4 /*yield*/, this.triggerJobAlert(jobRecord[0].id, 'failure', errorMsg)];
                    case 15:
                        // Trigger alerts if configured
                        _a.sent();
                        _a.label = 16;
                    case 16: return [3 /*break*/, 17];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute job manually
     */
    JobSchedulerService.prototype.executeJobManually = function (jobName) {
        return __awaiter(this, void 0, Promise, function () {
            var handler, startTime, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        handler = this.jobHandlers.get(jobName);
                        if (!handler) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: "Job not found: " + jobName
                            });
                        }
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.executeJob(jobName, handler)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                jobId: jobName,
                                status: 'success',
                                duration: Date.now() - startTime,
                                itemsProcessed: 0,
                                itemsFailed: 0
                            }];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                jobId: jobName,
                                status: 'failed',
                                duration: Date.now() - startTime,
                                itemsProcessed: 0,
                                itemsFailed: 0,
                                errorMessage: error_3 instanceof Error ? error_3.message : String(error_3)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get job execution history
     */
    JobSchedulerService.prototype.getJobHistory = function (jobId, limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var database, jobExecutionLogs, _a, eq, desc, logs, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database connection lost');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        jobExecutionLogs = (_b.sent()).jobExecutionLogs;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        _a = _b.sent(), eq = _a.eq, desc = _a.desc;
                        return [4 /*yield*/, database.select()
                                .from(jobExecutionLogs)
                                .where(eq(jobExecutionLogs.jobId, jobId))
                                .orderBy(desc(jobExecutionLogs.startTime))
                                .limit(limit)];
                    case 4:
                        logs = _b.sent();
                        return [2 /*return*/, logs];
                    case 5:
                        error_4 = _b.sent();
                        console.error('[JobScheduler] History retrieval error:', error_4);
                        return [2 /*return*/, []];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Health check tick (runs every 5 minutes)
     */
    JobSchedulerService.prototype.startHealthCheckTick = function () {
        var _this = this;
        if (this.tickInterval)
            clearInterval(this.tickInterval);
        this.tickInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.checkJobHealth()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('[JobScheduler] Health check error:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, 5 * 60 * 1000); // Every 5 minutes
    };
    /**
     * Check job health and trigger alerts
     */
    JobSchedulerService.prototype.checkJobHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var database, jobHeartbeat, scheduledJobs, eq, heartbeats, _i, heartbeats_1, hb, jobRecord, expectedInterval, timeSinceLastHeartbeat, newConsecutiveFailures, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 12, , 13]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _a.sent();
                        if (!database)
                            return [2 /*return*/];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        jobHeartbeat = (_a.sent()).jobHeartbeat;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        scheduledJobs = (_a.sent()).scheduledJobs;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 4:
                        eq = (_a.sent()).eq;
                        return [4 /*yield*/, database.select().from(jobHeartbeat)];
                    case 5:
                        heartbeats = _a.sent();
                        _i = 0, heartbeats_1 = heartbeats;
                        _a.label = 6;
                    case 6:
                        if (!(_i < heartbeats_1.length)) return [3 /*break*/, 11];
                        hb = heartbeats_1[_i];
                        return [4 /*yield*/, database.select()
                                .from(scheduledJobs)
                                .where(eq(scheduledJobs.id, hb.jobId))
                                .limit(1)];
                    case 7:
                        jobRecord = _a.sent();
                        if (!jobRecord.length)
                            return [3 /*break*/, 10];
                        expectedInterval = hb.expectedHeartbeatInterval || 86400;
                        timeSinceLastHeartbeat = (Date.now() - new Date(hb.lastHeartbeatAt).getTime()) / 1000;
                        if (!(timeSinceLastHeartbeat > expectedInterval)) return [3 /*break*/, 10];
                        newConsecutiveFailures = (hb.consecutiveFailures || 0) + 1;
                        return [4 /*yield*/, database.update(jobHeartbeat)
                                .set({
                                isHealthy: false,
                                consecutiveFailures: newConsecutiveFailures
                            })
                                .where(eq(jobHeartbeat.id, hb.id))];
                    case 8:
                        _a.sent();
                        if (!(newConsecutiveFailures >= 2)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.triggerJobAlert(hb.jobId, 'no_execution', "Job " + jobRecord[0].jobName + " hasn't executed in " + timeSinceLastHeartbeat + "s")];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 6];
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_6 = _a.sent();
                        console.error('[JobScheduler] Health check failed:', error_6);
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Trigger job alert
     */
    JobSchedulerService.prototype.triggerJobAlert = function (jobId, alertType, message) {
        return __awaiter(this, void 0, void 0, function () {
            var database, jobAlertRules, jobAlertHistory, _a, eq, and, rules, _i, rules_1, rule, emailService, recipients, _b, recipients_1, recipient, smsService, recipients, _c, recipients_2, recipient, error_7;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 19, , 20]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            return [2 /*return*/];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        jobAlertRules = (_d.sent()).jobAlertRules;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        jobAlertHistory = (_d.sent()).jobAlertHistory;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 4:
                        _a = _d.sent(), eq = _a.eq, and = _a.and;
                        return [4 /*yield*/, database.select()
                                .from(jobAlertRules)
                                .where(and(eq(jobAlertRules.jobId, jobId), eq(jobAlertRules.isActive, true)))];
                    case 5:
                        rules = _d.sent();
                        _i = 0, rules_1 = rules;
                        _d.label = 6;
                    case 6:
                        if (!(_i < rules_1.length)) return [3 /*break*/, 18];
                        rule = rules_1[_i];
                        // Log alert
                        return [4 /*yield*/, database.insert(jobAlertHistory).values({
                                id: uuid_1.v4(),
                                alertRuleId: rule.id,
                                jobId: jobId,
                                alert_type: alertType,
                                message: message,
                                recipients: rule.recipients
                            })];
                    case 7:
                        // Log alert
                        _d.sent();
                        // Send notification (email, SMS, webhook)
                        console.log("[JobScheduler] Alert triggered: " + alertType + " for job " + jobId);
                        if (!(rule.action === 'email' || rule.action === 'both')) return [3 /*break*/, 12];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./emailService'); })];
                    case 8:
                        emailService = _d.sent();
                        recipients = Array.isArray(rule.recipients) ? rule.recipients : [];
                        _b = 0, recipients_1 = recipients;
                        _d.label = 9;
                    case 9:
                        if (!(_b < recipients_1.length)) return [3 /*break*/, 12];
                        recipient = recipients_1[_b];
                        return [4 /*yield*/, emailService.queueEmail({
                                toEmail: recipient,
                                subject: "[ALERT] Job Scheduler: " + alertType,
                                htmlContent: "<p>" + message + "</p>",
                                relatedEntityType: 'job',
                                relatedEntityId: jobId
                            })];
                    case 10:
                        _d.sent();
                        _d.label = 11;
                    case 11:
                        _b++;
                        return [3 /*break*/, 9];
                    case 12:
                        if (!(rule.action === 'sms' || rule.action === 'both')) return [3 /*break*/, 17];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./smsService'); })];
                    case 13:
                        smsService = _d.sent();
                        recipients = Array.isArray(rule.recipients) ? rule.recipients : [];
                        _c = 0, recipients_2 = recipients;
                        _d.label = 14;
                    case 14:
                        if (!(_c < recipients_2.length)) return [3 /*break*/, 17];
                        recipient = recipients_2[_c];
                        return [4 /*yield*/, smsService.queueSms({
                                phoneNumber: recipient,
                                message: "Alert: " + alertType + " - " + message,
                                relatedEntityType: 'job',
                                relatedEntityId: jobId
                            })];
                    case 15:
                        _d.sent();
                        _d.label = 16;
                    case 16:
                        _c++;
                        return [3 /*break*/, 14];
                    case 17:
                        _i++;
                        return [3 /*break*/, 6];
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        error_7 = _d.sent();
                        console.error('[JobScheduler] Alert trigger error:', error_7);
                        return [3 /*break*/, 20];
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get next cron execution time
     */
    JobSchedulerService.prototype.getNextCronTime = function (jobName) {
        var job = this.jobs.get(jobName);
        if (!job)
            return new Date();
        return job.nextDate().toDate();
    };
    /**
     * Get job handler by type
     */
    JobSchedulerService.prototype.getJobHandler = function (jobType) {
        var _this = this;
        var handlers = {
            recurringInvoice: function () { return __awaiter(_this, void 0, void 0, function () {
                var generateDueRecurringInvoices;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../jobs/recurringInvoicesJob'); })];
                        case 1:
                            generateDueRecurringInvoices = (_a.sent()).generateDueRecurringInvoices;
                            return [2 /*return*/, generateDueRecurringInvoices()];
                    }
                });
            }); },
            recurringExpense: function () { return __awaiter(_this, void 0, void 0, function () {
                var generateDueRecurringExpenses;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../jobs/recurringExpensesJob'); })];
                        case 1:
                            generateDueRecurringExpenses = (_a.sent()).generateDueRecurringExpenses;
                            return [2 /*return*/, generateDueRecurringExpenses()];
                    }
                });
            }); },
            overdue_invoices: function () { return __awaiter(_this, void 0, void 0, function () {
                var markOverdueInvoices;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../jobs/overdueInvoicesJob'); })];
                        case 1:
                            markOverdueInvoices = (_a.sent()).markOverdueInvoices;
                            return [2 /*return*/, markOverdueInvoices()];
                    }
                });
            }); },
            payment_reminder: function () { return __awaiter(_this, void 0, void 0, function () {
                var sendPaymentReminders;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../jobs/invoiceReminders'); })];
                        case 1:
                            sendPaymentReminders = (_a.sent()).sendPaymentReminders;
                            return [2 /*return*/, sendPaymentReminders()];
                    }
                });
            }); },
            email_queue: function () { return __awaiter(_this, void 0, void 0, function () {
                var emailService;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./emailService'); })];
                        case 1:
                            emailService = _a.sent();
                            return [2 /*return*/, emailService.processEmailQueue(20)];
                    }
                });
            }); },
            sms_queue: function () { return __awaiter(_this, void 0, void 0, function () {
                var smsService;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./smsService'); })];
                        case 1:
                            smsService = _a.sent();
                            return [2 /*return*/, smsService.processSmsQueue(20)];
                    }
                });
            }); },
            cleanup: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    console.log('[JobScheduler] Running cleanup job');
                    return [2 /*return*/, { itemsProcessed: 0 }];
                });
            }); },
            reconciliation: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    console.log('[JobScheduler] Running reconciliation job');
                    return [2 /*return*/, { itemsProcessed: 0 }];
                });
            }); },
            subscription_renewal: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    console.log('[JobScheduler] Running subscription renewal job');
                    return [2 /*return*/, { itemsProcessed: 0 }];
                });
            }); }
        };
        return handlers[jobType] || null;
    };
    /**
     * Get all jobs and their status
     */
    JobSchedulerService.prototype.getAllJobsStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var database, scheduledJobs, jobs, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _a.sent();
                        if (!database)
                            throw new Error('Database connection lost');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        scheduledJobs = (_a.sent()).scheduledJobs;
                        return [4 /*yield*/, database.select().from(scheduledJobs)];
                    case 3:
                        jobs = _a.sent();
                        return [2 /*return*/, jobs.map(function (job) { return ({
                                id: job.id,
                                name: job.jobName,
                                type: job.jobType,
                                isActive: job.isActive,
                                cron: job.cronExpression,
                                lastRun: job.lastRunAt,
                                lastStatus: job.lastRunStatus,
                                nextRun: job.nextScheduledRun,
                                duration: job.lastRunDuration
                            }); })];
                    case 4:
                        error_8 = _a.sent();
                        console.error('[JobScheduler] Get status error:', error_8);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Shutdown scheduler
     */
    JobSchedulerService.prototype.shutdown = function () {
        console.log('[JobScheduler] Shutting down...');
        // Stop all cron jobs
        for (var _i = 0, _a = this.jobs.values(); _i < _a.length; _i++) {
            var job = _a[_i];
            job.stop();
        }
        this.jobs.clear();
        // Stop health check tick
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
        console.log('[JobScheduler] Stopped');
    };
    return JobSchedulerService;
}());
// Singleton instance
var scheduler = new JobSchedulerService();
exports["default"] = scheduler;
exports.initializeScheduler = function () { return scheduler.initialize(); };
exports.registerJob = function (config) { return scheduler.registerJob(config); };
exports.executeJobManually = function (jobName) { return scheduler.executeJobManually(jobName); };
exports.getJobHistory = function (jobId, limit) {
    return scheduler.getJobHistory(jobId, limit);
};
exports.getAllJobsStatus = function () { return scheduler.getAllJobsStatus(); };
exports.shutdownScheduler = function () { return scheduler.shutdown(); };
