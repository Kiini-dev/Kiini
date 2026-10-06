"use strict";
/**
 * Job Scheduler Router
 * tRPC endpoints for job management, health monitoring, and alerting
 *
 * Endpoints:
 * - schedulerRouter.listJobs() - List all scheduled jobs
 * - schedulerRouter.getJobDetails() - Get job details and execution stats
 * - schedulerRouter.triggerJobNow() - Manually trigger a job (admin only)
 * - schedulerRouter.getExecutionHistory() - View job execution history
 * - schedulerRouter.getHealthStatus() - Get scheduler health status
 * - schedulerRouter.getAlertRules() - View alert configuration (admin only)
 * - schedulerRouter.updateAlertRules() - Modify alert rules (admin only)
 * - schedulerRouter.getMetrics() - Get performance metrics
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
exports.schedulerRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var db = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
// Feature-restricted procedure for scheduler operations
var schedulerProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var _b;
    var ctx = _a.ctx, next = _a.next;
    if (!((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id)) {
        throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'User authentication required' });
    }
    return next({ ctx: ctx });
});
// Admin-only procedure for sensitive scheduler operations
var schedulerAdminProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var _b, _c;
    var ctx = _a.ctx, next = _a.next;
    if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin' && ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== 'super_admin') {
        throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    return next({ ctx: ctx });
});
exports.schedulerRouter = trpc_1.router({
    /**
     * List all scheduled jobs
     */
    listJobs: schedulerProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, scheduledJobs, jobs, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error('Database unavailable');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 2:
                    scheduledJobs = (_a.sent()).scheduledJobs;
                    return [4 /*yield*/, database.select().from(scheduledJobs)];
                case 3:
                    jobs = _a.sent();
                    return [2 /*return*/, jobs.map(function (job) { return ({
                            jobId: job.id,
                            jobName: job.jobName,
                            jobType: job.jobType,
                            description: job.description,
                            cronExpression: job.cronExpression,
                            timezone: job.timezone || 'UTC',
                            isActive: job.isActive,
                            isManualOnly: job.isManualOnly,
                            lastExecutedAt: job.lastExecutedAt,
                            nextExecutionAt: job.nextExecutionAt,
                            failureCount: job.failureCount || 0
                        }); })];
                case 4:
                    error_1 = _a.sent();
                    console.error('[schedulerRouter] listJobs error:', error_1);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to fetch jobs list'
                    });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get job details with recent execution stats
     */
    getJobDetails: schedulerProcedure.input(zod_1.z.object({
        jobId: zod_1.z.string()
    })).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, scheduledJobs, jobLogs, jobRows, job, recentExecutions, successCount, failureCount, avgDuration, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        scheduledJobs = (_c.sent()).scheduledJobs;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        jobLogs = (_c.sent()).jobExecutionLogs;
                        return [4 /*yield*/, database.select().from(scheduledJobs).where(drizzle_orm_1.eq(scheduledJobs.id, input.jobId)).limit(1)];
                    case 4:
                        jobRows = _c.sent();
                        job = jobRows[0];
                        if (!job) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Job not found'
                            });
                        }
                        return [4 /*yield*/, database.select()
                                .from(jobLogs)
                                .where(drizzle_orm_1.eq(jobLogs.jobId, input.jobId))
                                .orderBy(drizzle_orm_1.desc(jobLogs.executedAt))
                                .limit(10)];
                    case 5:
                        recentExecutions = _c.sent();
                        successCount = recentExecutions.filter(function (e) { return e.status === 'success'; }).length;
                        failureCount = recentExecutions.filter(function (e) { return e.status === 'failed'; }).length;
                        avgDuration = recentExecutions.length > 0
                            ? recentExecutions.reduce(function (sum, e) { return sum + (e.durationMs || 0); }, 0) / recentExecutions.length
                            : 0;
                        return [2 /*return*/, {
                                jobId: job.id,
                                jobName: job.jobName,
                                jobType: job.jobType,
                                description: job.description,
                                cronExpression: job.cronExpression,
                                timezone: job.timezone || 'UTC',
                                isActive: job.isActive,
                                isManualOnly: job.isManualOnly,
                                lastExecutedAt: job.lastExecutedAt,
                                nextExecutionAt: job.nextExecutionAt,
                                stats: {
                                    totalExecutions: recentExecutions.length,
                                    successCount: successCount,
                                    failureCount: failureCount,
                                    successRate: recentExecutions.length > 0 ? (successCount / recentExecutions.length) * 100 : 0,
                                    averageDuration: Math.round(avgDuration),
                                    lastStatus: ((_b = recentExecutions[0]) === null || _b === void 0 ? void 0 : _b.status) || 'unknown'
                                },
                                recentExecutions: recentExecutions.slice(0, 5).map(function (e) { return ({
                                    executedAt: e.executedAt,
                                    status: e.status,
                                    durationMs: e.durationMs,
                                    itemsProcessed: e.itemsProcessed,
                                    itemsFailed: e.itemsFailed,
                                    errorMessage: e.errorMessage
                                }); })
                            }];
                    case 6:
                        error_2 = _c.sent();
                        console.error('[schedulerRouter] getJobDetails error:', error_2);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch job details'
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Manually trigger a job execution (admin only)
     */
    triggerJobNow: schedulerAdminProcedure.input(zod_1.z.object({
        jobId: zod_1.z.string()
    })).mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, scheduledJobs, job, jobLogs, logId, startTime, jobResult, _b, generateDueRecurringExpenses, result, generateDueRecurringInvoices, result, markOverdueInvoices, result, processInvoiceReminders, sendUsageReminders, result, durationMs, execError_1, durationMs, error_3;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 28, , 29]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        scheduledJobs = (_d.sent()).scheduledJobs;
                        return [4 /*yield*/, database.select().from(scheduledJobs).where(drizzle_orm_1.eq(scheduledJobs.id, input.jobId)).limit(1)];
                    case 3:
                        job = (_d.sent())[0];
                        if (!job) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Job not found'
                            });
                        }
                        if (!job.isActive) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Cannot trigger inactive job'
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 4:
                        jobLogs = (_d.sent()).jobExecutionLogs;
                        logId = "log-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
                        startTime = Date.now();
                        jobResult = { success: false, itemsProcessed: 0, itemsFailed: 0, message: '', errors: [] };
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 25, , 27]);
                        _b = job.jobName;
                        switch (_b) {
                            case 'generateRecurringExpenses': return [3 /*break*/, 6];
                            case 'generateRecurringInvoices': return [3 /*break*/, 9];
                            case 'generateInvoices': return [3 /*break*/, 9];
                            case 'markOverdueInvoices': return [3 /*break*/, 12];
                            case 'sendInvoiceReminders': return [3 /*break*/, 15];
                            case 'sendUsageReminders': return [3 /*break*/, 18];
                        }
                        return [3 /*break*/, 21];
                    case 6: return [4 /*yield*/, Promise.resolve().then(function () { return require('../jobs/recurringExpensesJob'); })];
                    case 7:
                        generateDueRecurringExpenses = (_d.sent()).generateDueRecurringExpenses;
                        return [4 /*yield*/, generateDueRecurringExpenses()];
                    case 8:
                        result = _d.sent();
                        jobResult = { success: result.success, itemsProcessed: result.itemsProcessed, itemsFailed: result.itemsFailed, message: result.message, errors: result.errors };
                        return [3 /*break*/, 22];
                    case 9: return [4 /*yield*/, Promise.resolve().then(function () { return require('../jobs/recurringInvoicesJob'); })];
                    case 10:
                        generateDueRecurringInvoices = (_d.sent()).generateDueRecurringInvoices;
                        return [4 /*yield*/, generateDueRecurringInvoices()];
                    case 11:
                        result = _d.sent();
                        jobResult = { success: result.success, itemsProcessed: result.itemsProcessed || 0, itemsFailed: result.itemsFailed || 0, message: result.message, errors: result.errors || [] };
                        return [3 /*break*/, 22];
                    case 12: return [4 /*yield*/, Promise.resolve().then(function () { return require('../jobs/overdueInvoicesJob'); })];
                    case 13:
                        markOverdueInvoices = (_d.sent()).markOverdueInvoices;
                        return [4 /*yield*/, markOverdueInvoices()];
                    case 14:
                        result = _d.sent();
                        jobResult = { success: result.success, itemsProcessed: result.count || 0, itemsFailed: ((_c = result.errors) === null || _c === void 0 ? void 0 : _c.length) || 0, message: result.message, errors: result.errors || [] };
                        return [3 /*break*/, 22];
                    case 15: return [4 /*yield*/, Promise.resolve().then(function () { return require('../jobs/invoiceReminders'); })];
                    case 16:
                        processInvoiceReminders = (_d.sent()).processInvoiceReminders;
                        return [4 /*yield*/, processInvoiceReminders()];
                    case 17:
                        _d.sent();
                        jobResult = { success: true, itemsProcessed: 1, itemsFailed: 0, message: 'Invoice reminders processed', errors: [] };
                        return [3 /*break*/, 22];
                    case 18: return [4 /*yield*/, Promise.resolve().then(function () { return require('../jobs/usageReminders'); })];
                    case 19:
                        sendUsageReminders = (_d.sent()).sendUsageReminders;
                        return [4 /*yield*/, sendUsageReminders()];
                    case 20:
                        result = _d.sent();
                        jobResult = { success: true, itemsProcessed: result.sent || 0, itemsFailed: result.errors || 0, message: "Usage reminders: " + result.sent + " sent, " + result.skipped + " skipped", errors: [] };
                        return [3 /*break*/, 22];
                    case 21:
                        jobResult = { success: false, itemsProcessed: 0, itemsFailed: 0, message: "Unknown job type: " + job.jobName, errors: ["No handler registered for job: " + job.jobName] };
                        _d.label = 22;
                    case 22:
                        durationMs = Date.now() - startTime;
                        // Log execution result
                        return [4 /*yield*/, database.insert(jobLogs).values({
                                id: logId,
                                jobId: job.id,
                                executedAt: new Date(),
                                status: jobResult.success ? 'success' : 'failed',
                                durationMs: durationMs,
                                itemsProcessed: jobResult.itemsProcessed,
                                itemsFailed: jobResult.itemsFailed,
                                errorMessage: jobResult.errors.length > 0 ? jobResult.errors.join('; ') : null,
                                stdout: jobResult.message
                            })];
                    case 23:
                        // Log execution result
                        _d.sent();
                        // Update job's lastExecutedAt
                        return [4 /*yield*/, database.update(scheduledJobs).set({ lastExecutedAt: new Date() }).where(drizzle_orm_1.eq(scheduledJobs.id, job.id))];
                    case 24:
                        // Update job's lastExecutedAt
                        _d.sent();
                        console.log("[Scheduler] Job \"" + job.jobName + "\" completed: " + jobResult.message);
                        return [3 /*break*/, 27];
                    case 25:
                        execError_1 = _d.sent();
                        durationMs = Date.now() - startTime;
                        return [4 /*yield*/, database.insert(jobLogs).values({
                                id: logId,
                                jobId: job.id,
                                executedAt: new Date(),
                                status: 'failed',
                                durationMs: durationMs,
                                itemsProcessed: 0,
                                itemsFailed: 1,
                                errorMessage: (execError_1 === null || execError_1 === void 0 ? void 0 : execError_1.message) || 'Unknown execution error'
                            })["catch"](function () { })];
                    case 26:
                        _d.sent();
                        console.error("[Scheduler] Job \"" + job.jobName + "\" failed:", execError_1);
                        return [3 /*break*/, 27];
                    case 27: return [2 /*return*/, {
                            success: jobResult.success,
                            message: jobResult.success ? "Job \"" + job.jobName + "\" completed: " + jobResult.message : "Job \"" + job.jobName + "\" failed: " + jobResult.message,
                            jobId: job.id,
                            itemsProcessed: jobResult.itemsProcessed,
                            itemsFailed: jobResult.itemsFailed
                        }];
                    case 28:
                        error_3 = _d.sent();
                        console.error('[schedulerRouter] triggerJobNow error:', error_3);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to trigger job'
                        });
                    case 29: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get job execution history with filtering
     */
    getExecutionHistory: schedulerProcedure.input(zod_1.z.object({
        jobId: zod_1.z.string().optional(),
        status: zod_1.z["enum"](['success', 'failed', 'partial', 'timeout']).optional(),
        limit: zod_1.z.number().max(500)["default"](100),
        offset: zod_1.z.number()["default"](0),
        startDate: zod_1.z.date().optional(),
        endDate: zod_1.z.date().optional()
    })).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, jobLogs, conditions, where, records, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        jobLogs = (_b.sent()).jobExecutionLogs;
                        conditions = [];
                        if (input.jobId)
                            conditions.push(drizzle_orm_1.eq(jobLogs.jobId, input.jobId));
                        if (input.status)
                            conditions.push(drizzle_orm_1.eq(jobLogs.status, input.status));
                        if (input.startDate)
                            conditions.push(drizzle_orm_1.gte(jobLogs.executedAt, input.startDate));
                        if (input.endDate)
                            conditions.push(drizzle_orm_1.gte(jobLogs.executedAt, input.endDate));
                        where = conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined;
                        return [4 /*yield*/, database.select()
                                .from(jobLogs)
                                .where(where)
                                .orderBy(drizzle_orm_1.desc(jobLogs.executedAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 3:
                        records = _b.sent();
                        return [2 /*return*/, records.map(function (log) { return ({
                                logId: log.id,
                                jobId: log.jobId,
                                executedAt: log.executedAt,
                                status: log.status,
                                durationMs: log.durationMs,
                                itemsProcessed: log.itemsProcessed,
                                itemsFailed: log.itemsFailed,
                                errorMessage: log.errorMessage,
                                stdout: log.stdout ? log.stdout.substring(0, 200) : null
                            }); })];
                    case 4:
                        error_4 = _b.sent();
                        console.error('[schedulerRouter] getExecutionHistory error:', error_4);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch execution history'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get overall scheduler health status
     */
    getHealthStatus: schedulerProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, scheduledJobs, jobHeartbeat, activeJobsCount, heartbeats, latestHeartbeat, isHealthy, jobLogs, recentFailures, error_5;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _c.sent();
                    if (!database)
                        throw new Error('Database unavailable');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 2:
                    scheduledJobs = (_c.sent()).scheduledJobs;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 3:
                    jobHeartbeat = (_c.sent()).jobHeartbeat;
                    return [4 /*yield*/, database.select({ count: drizzle_orm_1.count() })
                            .from(scheduledJobs)
                            .where(drizzle_orm_1.eq(scheduledJobs.isActive, true))];
                case 4:
                    activeJobsCount = _c.sent();
                    return [4 /*yield*/, database.select()
                            .from(jobHeartbeat)
                            .orderBy(drizzle_orm_1.desc(jobHeartbeat.checkedAt))
                            .limit(1)];
                case 5:
                    heartbeats = _c.sent();
                    latestHeartbeat = heartbeats[0];
                    isHealthy = latestHeartbeat && (Date.now() - latestHeartbeat.checkedAt.getTime()) < 5 * 60 * 1000;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 6:
                    jobLogs = (_c.sent()).jobExecutionLogs;
                    return [4 /*yield*/, database.select({ count: drizzle_orm_1.count() })
                            .from(jobLogs)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(jobLogs.status, 'failed'), drizzle_orm_1.gte(jobLogs.executedAt, new Date(Date.now() - 1 * 60 * 60 * 1000)) // Last hour
                        ))];
                case 7:
                    recentFailures = _c.sent();
                    return [2 /*return*/, {
                            isHealthy: isHealthy,
                            statusMessage: isHealthy ? 'Scheduler running normally' : 'Scheduler health check stale',
                            activeJobsCount: ((_a = activeJobsCount[0]) === null || _a === void 0 ? void 0 : _a.count) || 0,
                            lastHeartbeatAt: latestHeartbeat === null || latestHeartbeat === void 0 ? void 0 : latestHeartbeat.checkedAt,
                            recentFailuresLastHour: ((_b = recentFailures[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
                            uptime: latestHeartbeat ? Date.now() - latestHeartbeat.checkedAt.getTime() : null
                        }];
                case 8:
                    error_5 = _c.sent();
                    console.error('[schedulerRouter] getHealthStatus error:', error_5);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to fetch health status'
                    });
                case 9: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get alert rules configuration (admin only)
     */
    getAlertRules: schedulerAdminProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, alertRules, rules, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error('Database unavailable');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 2:
                    alertRules = (_a.sent()).jobAlertRules;
                    return [4 /*yield*/, database.select().from(alertRules)];
                case 3:
                    rules = _a.sent();
                    return [2 /*return*/, rules.map(function (rule) { return ({
                            ruleId: rule.id,
                            jobId: rule.jobId,
                            triggerCondition: rule.triggerCondition,
                            failureThreshold: rule.failureThreshold,
                            durationThresholdMs: rule.durationThresholdMs,
                            notificationChannels: rule.notificationChannels,
                            isActive: rule.isActive,
                            createdAt: rule.createdAt
                        }); })];
                case 4:
                    error_6 = _a.sent();
                    console.error('[schedulerRouter] getAlertRules error:', error_6);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to fetch alert rules'
                    });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Update alert rules (admin only)
     */
    updateAlertRules: schedulerAdminProcedure.input(zod_1.z.object({
        ruleId: zod_1.z.string(),
        triggerCondition: zod_1.z["enum"](['on_failure', 'on_duration_threshold', 'on_multiple_failures']).optional(),
        failureThreshold: zod_1.z.number().min(1).max(10).optional(),
        durationThresholdMs: zod_1.z.number().min(1000).optional(),
        notificationChannels: zod_1.z.array(zod_1.z["enum"](['email', 'sms', 'slack', 'webhook'])).optional(),
        isActive: zod_1.z.boolean().optional()
    })).mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, alertRules, rule, error_7;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _g.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        alertRules = (_g.sent()).jobAlertRules;
                        return [4 /*yield*/, database.select().from(alertRules).where(drizzle_orm_1.eq(alertRules.id, input.ruleId)).limit(1)];
                    case 3:
                        rule = (_g.sent())[0];
                        if (!rule) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Alert rule not found'
                            });
                        }
                        return [4 /*yield*/, database.update(alertRules)
                                .set({
                                triggerCondition: (_b = input.triggerCondition) !== null && _b !== void 0 ? _b : rule.triggerCondition,
                                failureThreshold: (_c = input.failureThreshold) !== null && _c !== void 0 ? _c : rule.failureThreshold,
                                durationThresholdMs: (_d = input.durationThresholdMs) !== null && _d !== void 0 ? _d : rule.durationThresholdMs,
                                notificationChannels: (_e = input.notificationChannels) !== null && _e !== void 0 ? _e : rule.notificationChannels,
                                isActive: (_f = input.isActive) !== null && _f !== void 0 ? _f : rule.isActive
                            })
                                .where(drizzle_orm_1.eq(alertRules.id, input.ruleId))];
                    case 4:
                        _g.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Alert rule updated successfully'
                            }];
                    case 5:
                        error_7 = _g.sent();
                        console.error('[schedulerRouter] updateAlertRules error:', error_7);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to update alert rules'
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get scheduler performance metrics
     */
    getMetrics: schedulerProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, jobLogs, lastDay, logsLastDay, successCount, failureCount, avgDuration, last7Days, logsLast7Days, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error('Database unavailable');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 2:
                    jobLogs = (_a.sent()).jobExecutionLogs;
                    lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, database.select()
                            .from(jobLogs)
                            .where(drizzle_orm_1.gte(jobLogs.executedAt, lastDay))];
                case 3:
                    logsLastDay = _a.sent();
                    successCount = logsLastDay.filter(function (e) { return e.status === 'success'; }).length;
                    failureCount = logsLastDay.filter(function (e) { return e.status === 'failed'; }).length;
                    avgDuration = logsLastDay.length > 0
                        ? logsLastDay.reduce(function (sum, e) { return sum + (e.durationMs || 0); }, 0) / logsLastDay.length
                        : 0;
                    last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, database.select()
                            .from(jobLogs)
                            .where(drizzle_orm_1.gte(jobLogs.executedAt, last7Days))];
                case 4:
                    logsLast7Days = _a.sent();
                    return [2 /*return*/, {
                            lastTwentyFourHours: {
                                totalExecutions: logsLastDay.length,
                                successCount: successCount,
                                failureCount: failureCount,
                                successRate: logsLastDay.length > 0 ? (successCount / logsLastDay.length) * 100 : 0,
                                averageDurationMs: Math.round(avgDuration)
                            },
                            last7Days: {
                                totalExecutions: logsLast7Days.length,
                                averageExecutionsPerDay: Math.round(logsLast7Days.length / 7),
                                successRate: logsLast7Days.length > 0
                                    ? (logsLast7Days.filter(function (e) { return e.status === 'success'; }).length / logsLast7Days.length) * 100
                                    : 0
                            },
                            topFailingJobs: []
                        }];
                case 5:
                    error_8 = _a.sent();
                    console.error('[schedulerRouter] getMetrics error:', error_8);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to fetch metrics'
                    });
                case 6: return [2 /*return*/];
            }
        });
    }); })
});
