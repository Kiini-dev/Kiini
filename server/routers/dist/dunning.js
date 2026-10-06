"use strict";
/**
 * Dunning Management Router
 * Handles payment retry logic, policies, and subscription lifecycle management
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
exports.dunningRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var db = require("../db");
var uuid_1 = require("uuid");
var billingReadProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("billing:read");
var billingWriteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("billing:edit");
exports.dunningRouter = trpc_1.router({
    /**
     * Create a dunning policy
     */
    createPolicy: billingWriteProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        maxRetries: zod_1.z.number().int().min(1).max(10)["default"](3),
        retryIntervalDays: zod_1.z.number().int().min(1)["default"](3),
        finalRetryDays: zod_1.z.number().int().min(1)["default"](14),
        suspendAfterDays: zod_1.z.number().int().min(1)["default"](21),
        cancelAfterDays: zod_1.z.number().int().min(1)["default"](30)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var policyId, policy, savedPolicy, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        policyId = uuid_1.v4();
                        policy = {
                            id: policyId,
                            organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id),
                            name: input.name,
                            description: input.description,
                            maxRetries: input.maxRetries,
                            retryIntervalDays: input.retryIntervalDays,
                            finalRetryDays: input.finalRetryDays,
                            suspendAfterDays: input.suspendAfterDays,
                            cancelAfterDays: input.cancelAfterDays,
                            isActive: 1,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, db.createDunningPolicy(policy)];
                    case 1:
                        savedPolicy = _d.sent();
                        return [2 /*return*/, { policy: savedPolicy, success: true }];
                    case 2:
                        error_1 = _d.sent();
                        console.error("[Dunning] Error creating policy:", error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create dunning policy'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get all dunning policies for organization
     */
    getPolicies: billingReadProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var policies, error_2;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.getDunningPolicies(((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id))];
                    case 1:
                        policies = _d.sent();
                        return [2 /*return*/, { policies: policies, success: true }];
                    case 2:
                        error_2 = _d.sent();
                        console.error("[Dunning] Error fetching policies:", error_2);
                        return [2 /*return*/, { policies: [], success: false }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Record a payment retry attempt
     */
    recordRetryAttempt: billingWriteProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        subscriptionId: zod_1.z.string(),
        paymentMethod: zod_1.z.string().optional(),
        failureReason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var retryId, retry, savedRetry, event, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        retryId = uuid_1.v4();
                        retry = {
                            id: retryId,
                            invoiceId: input.invoiceId,
                            subscriptionId: input.subscriptionId,
                            attemptNumber: 1,
                            status: 'pending',
                            failureReason: input.failureReason,
                            paymentMethod: input.paymentMethod,
                            attemptedAt: null,
                            nextRetryAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                            metadata: {},
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, db.recordPaymentRetry(retry)];
                    case 1:
                        savedRetry = _b.sent();
                        event = {
                            id: uuid_1.v4(),
                            subscriptionId: input.subscriptionId,
                            invoiceId: input.invoiceId,
                            eventType: 'retry_scheduled',
                            details: { retryId: retryId, attemptNumber: 1 },
                            triggeredBy: 'system',
                            createdAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, db.logDunningEvent(event)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { retry: savedRetry, success: true }];
                    case 3:
                        error_3 = _b.sent();
                        console.error("[Dunning] Error recording retry:", error_3);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to record payment retry'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get retry history for invoice
     */
    getRetryHistory: billingReadProcedure
        .input(zod_1.z.object({ invoiceId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var retries, latestAttempt, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.getRetryHistory(input.invoiceId)];
                    case 1:
                        retries = _b.sent();
                        latestAttempt = retries[0] || null;
                        return [2 /*return*/, {
                                retries: retries,
                                totalAttempts: retries.length,
                                lastAttemptAt: (latestAttempt === null || latestAttempt === void 0 ? void 0 : latestAttempt.attemptedAt) || null,
                                nextRetryAt: (latestAttempt === null || latestAttempt === void 0 ? void 0 : latestAttempt.nextRetryAt) || null,
                                success: true
                            }];
                    case 2:
                        error_4 = _b.sent();
                        console.error("[Dunning] Error fetching retry history:", error_4);
                        return [2 /*return*/, { retries: [], totalAttempts: 0, lastAttemptAt: null, nextRetryAt: null, success: false }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get dunning status for subscription
     */
    getStatus: billingReadProcedure
        .input(zod_1.z.object({ subscriptionId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var status, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.getDunningStatus(input.subscriptionId)];
                    case 1:
                        status = _b.sent();
                        return [2 /*return*/, { status: status || {
                                    subscriptionId: input.subscriptionId,
                                    isDunning: false,
                                    overdueDays: 0,
                                    retryCount: 0,
                                    nextRetryAt: null,
                                    dunningPhase: 'none',
                                    events: []
                                }, success: true }];
                    case 2:
                        error_5 = _b.sent();
                        console.error("[Dunning] Error fetching dunning status:", error_5);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch dunning status'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Execute dunning workflow (automatic retry scheduler)
     */
    executeDunningWorkflow: billingWriteProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        policyId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var workflowId, status, policy, _b, now, nextRetryAt, event, result, error_6;
            var _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 7, , 8]);
                        workflowId = uuid_1.v4();
                        return [4 /*yield*/, db.getDunningStatus(input.subscriptionId)];
                    case 1:
                        status = _h.sent();
                        if (!input.policyId) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.getDunningPolicy(input.policyId)];
                    case 2:
                        _b = _h.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.getActiveDunningPolicy(((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId) || ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id))];
                    case 4:
                        _b = _h.sent();
                        _h.label = 5;
                    case 5:
                        policy = _b;
                        if (!policy) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'No active dunning policy found'
                            });
                        }
                        now = new Date();
                        nextRetryAt = (status === null || status === void 0 ? void 0 : status.nextRetryAt) ? new Date(status.nextRetryAt)
                            : new Date(now.getTime() + policy.retryIntervalDays * 24 * 60 * 60 * 1000);
                        event = {
                            id: uuid_1.v4(),
                            subscriptionId: input.subscriptionId,
                            invoiceId: ((_f = (_e = status === null || status === void 0 ? void 0 : status.events) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.invoiceId) || null,
                            eventType: 'retry_scheduled',
                            details: {
                                policyId: policy.id,
                                nextRetryAt: nextRetryAt.toISOString(),
                                retryCount: (_g = status === null || status === void 0 ? void 0 : status.retryCount) !== null && _g !== void 0 ? _g : 0
                            },
                            triggeredBy: 'system',
                            createdAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, db.logDunningEvent(event)];
                    case 6:
                        _h.sent();
                        result = {
                            workflowId: workflowId,
                            status: 'scheduled',
                            actionsScheduled: 1,
                            nextAction: "Retry scheduled for " + nextRetryAt.toISOString()
                        };
                        return [2 /*return*/, { result: result, success: true }];
                    case 7:
                        error_6 = _h.sent();
                        console.error("[Dunning] Error executing workflow:", error_6);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to execute dunning workflow'
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Recover payment for subscription (manual intervention)
     */
    recoverPayment: billingWriteProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        invoiceId: zod_1.z.string(),
        method: zod_1.z["enum"](['email', 'manual', 'retry_now'])
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var event, error_7;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        event = {
                            id: uuid_1.v4(),
                            subscriptionId: input.subscriptionId,
                            invoiceId: input.invoiceId,
                            eventType: 'payment_recovered',
                            details: { method: input.method, recoveredBy: (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id },
                            triggeredBy: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id,
                            createdAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, db.logDunningEvent(event)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Payment recovery initiated via " + input.method
                            }];
                    case 2:
                        error_7 = _d.sent();
                        console.error("[Dunning] Error recovering payment:", error_7);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to recover payment'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Suspend subscription due to non-payment
     */
    suspendSubscription: billingWriteProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var updated, event, error_8;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db.updateSubscription(input.subscriptionId, {
                                status: 'suspended',
                                updatedAt: new Date().toISOString()
                            })];
                    case 1:
                        updated = _c.sent();
                        event = {
                            id: uuid_1.v4(),
                            subscriptionId: input.subscriptionId,
                            eventType: 'subscription_suspended',
                            details: { reason: input.reason || 'Non-payment' },
                            triggeredBy: (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id,
                            createdAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, db.logDunningEvent(event)];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Subscription suspended',
                                subscription: updated
                            }];
                    case 3:
                        error_8 = _c.sent();
                        console.error("[Dunning] Error suspending subscription:", error_8);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to suspend subscription'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Cancel subscription due to non-payment
     */
    cancelSubscription: billingWriteProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var updated, event, error_9;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db.updateSubscription(input.subscriptionId, {
                                status: 'cancelled',
                                updatedAt: new Date().toISOString()
                            })];
                    case 1:
                        updated = _c.sent();
                        event = {
                            id: uuid_1.v4(),
                            subscriptionId: input.subscriptionId,
                            eventType: 'subscription_cancelled',
                            details: { reason: input.reason || 'Non-payment' },
                            triggeredBy: (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id,
                            createdAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, db.logDunningEvent(event)];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Subscription cancelled',
                                subscription: updated
                            }];
                    case 3:
                        error_9 = _c.sent();
                        console.error("[Dunning] Error cancelling subscription:", error_9);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to cancel subscription'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get dunning events audit log
     */
    getEventLog: billingReadProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string().optional(),
        limit: zod_1.z.number().int()["default"](20),
        offset: zod_1.z.number().int()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var events, total, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.getDunningEvents(input.subscriptionId || '', input.limit, input.offset)];
                    case 1:
                        events = _b.sent();
                        total = events.length;
                        return [2 /*return*/, {
                                events: events,
                                total: total,
                                limit: input.limit,
                                offset: input.offset,
                                success: true
                            }];
                    case 2:
                        error_10 = _b.sent();
                        console.error("[Dunning] Error fetching event log:", error_10);
                        return [2 /*return*/, { events: [], total: 0, limit: input.limit, offset: input.offset, success: false }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    })
});
