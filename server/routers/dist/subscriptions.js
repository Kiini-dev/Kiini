"use strict";
/**
 * Main Application Subscription Management Router
 * Handles organization subscription lifecycle, upgrades, downgrades, and management
 * Global permissions-based access for admins and accountants
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.subscriptionsRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var db = require("../db");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
// Feature-based procedures
var subscriptionReadProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("subscriptions:read");
var subscriptionWriteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("subscriptions:write");
var billingReadProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("billing:read");
exports.subscriptionsRouter = trpc_1.router({
    /**
     * List all subscriptions (admin/accountant only)
     */
    list: subscriptionReadProcedure
        .input(zod_1.z.object({
        status: zod_1.z["enum"](["trial", "active", "suspended", "cancelled", "expired"]).optional(),
        tier: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        limit: zod_1.z.number().max(100)["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, conditions, query, subs, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        conditions = [];
                        if (input.status) {
                            conditions.push(drizzle_orm_1.eq(schema_1.subscriptions.status, input.status));
                        }
                        query = conditions.length > 0
                            ? database.select().from(schema_1.subscriptions).where(drizzle_orm_1.and.apply(void 0, conditions))
                            : database.select().from(schema_1.subscriptions);
                        return [4 /*yield*/, query
                                .orderBy(drizzle_orm_1.desc(schema_1.subscriptions.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 2:
                        subs = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                subscriptions: subs,
                                count: subs.length
                            }];
                    case 3:
                        error_1 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_1.message || "Failed to fetch subscriptions"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get subscription details
     */
    getDetail: subscriptionReadProcedure
        .input(zod_1.z.object({ subscriptionId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, sub, plan, invoices, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.subscriptions)
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, input.subscriptionId))
                                .limit(1)];
                    case 2:
                        sub = _b.sent();
                        if (!sub.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Subscription not found"
                            });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.pricingPlans)
                                .where(drizzle_orm_1.eq(schema_1.pricingPlans.id, sub[0].planId))
                                .limit(1)];
                    case 3:
                        plan = _b.sent();
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.billingInvoices)
                                .where(drizzle_orm_1.eq(schema_1.billingInvoices.subscriptionId, input.subscriptionId))
                                .orderBy(drizzle_orm_1.desc(schema_1.billingInvoices.createdAt))
                                .limit(10)];
                    case 4:
                        invoices = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                subscription: sub[0],
                                plan: plan[0] || null,
                                recentInvoices: invoices
                            }];
                    case 5:
                        error_2 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_2.message || "Failed to fetch subscription details"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Upgrade or downgrade subscription plan
     */
    changeplan: subscriptionWriteProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        newPlanId: zod_1.z.string(),
        effectiveDate: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, currentSub, newPlan, now, effectiveDate, invoiceId, currentPrice, newPrice, priceDifference, error_3;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.subscriptions)
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, input.subscriptionId))
                                .limit(1)];
                    case 2:
                        currentSub = _d.sent();
                        if (!currentSub.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Subscription not found"
                            });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.pricingPlans)
                                .where(drizzle_orm_1.eq(schema_1.pricingPlans.id, input.newPlanId))
                                .limit(1)];
                    case 3:
                        newPlan = _d.sent();
                        if (!newPlan.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Pricing plan not found"
                            });
                        }
                        now = new Date().toISOString();
                        effectiveDate = input.effectiveDate || now;
                        invoiceId = uuid_1.v4();
                        currentPrice = currentSub[0].currentPrice;
                        newPrice = currentSub[0].billingCycle === "monthly"
                            ? newPlan[0].monthlyPrice
                            : newPlan[0].annualPrice;
                        priceDifference = newPrice - currentPrice;
                        // Update subscription
                        return [4 /*yield*/, database
                                .update(schema_1.subscriptions)
                                .set({
                                planId: input.newPlanId,
                                currentPrice: newPrice,
                                updatedAt: now
                            })
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, input.subscriptionId))];
                    case 4:
                        // Update subscription
                        _d.sent();
                        if (!(priceDifference !== 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, database.insert(schema_1.billingInvoices).values({
                                id: invoiceId,
                                subscriptionId: input.subscriptionId,
                                invoiceNumber: "ADJ-" + Date.now() + "-" + currentSub[0].id.slice(0, 8),
                                amount: Math.abs(priceDifference),
                                tax: 0,
                                totalAmount: Math.abs(priceDifference),
                                currency: "KES",
                                status: priceDifference > 0 ? "pending" : "paid",
                                billingPeriodStart: effectiveDate,
                                billingPeriodEnd: currentSub[0].renewalDate,
                                dueDate: effectiveDate,
                                sentAt: now,
                                paidAt: priceDifference <= 0 ? now : null,
                                paymentMethod: null,
                                paymentReference: null,
                                notes: "Plan upgrade/downgrade from " + currentSub[0].planId + " to " + input.newPlanId,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "subscription.plan_changed",
                            entityType: "Subscription",
                            entityId: input.subscriptionId,
                            description: "Changed subscription plan from " + currentSub[0].planId + " to " + input.newPlanId,
                            metadata: JSON.stringify({ newPlanId: input.newPlanId, priceDifference: priceDifference }),
                            ipAddress: (_c = (_b = ctx.req) === null || _b === void 0 ? void 0 : _b.ip) !== null && _c !== void 0 ? _c : null
                        })];
                    case 7:
                        _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                subscriptionId: input.subscriptionId,
                                priceDifference: priceDifference,
                                message: priceDifference > 0
                                    ? "Plan upgraded. Additional charges will be applied."
                                    : "Plan downgraded. Credit will be applied to next invoice."
                            }];
                    case 8:
                        error_3 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_3.message || "Failed to change subscription plan"
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Toggle auto-renewal
     */
    toggleAutoRenew: subscriptionWriteProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        autoRenew: zod_1.z.boolean()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, error_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .update(schema_1.subscriptions)
                                .set({
                                autoRenew: input.autoRenew ? 1 : 0,
                                updatedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, input.subscriptionId))];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "subscription.auto_renew_toggled",
                                entityType: "Subscription",
                                entityId: input.subscriptionId,
                                description: "Auto-renew " + (input.autoRenew ? "enabled" : "disabled"),
                                metadata: JSON.stringify({ autoRenew: input.autoRenew }),
                                ipAddress: (_c = (_b = ctx.req) === null || _b === void 0 ? void 0 : _b.ip) !== null && _c !== void 0 ? _c : null
                            })];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                autoRenew: input.autoRenew
                            }];
                    case 4:
                        error_4 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_4.message || "Failed to toggle auto-renewal"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Suspend subscription
     */
    suspend: subscriptionWriteProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .update(schema_1.subscriptions)
                                .set({
                                status: "suspended",
                                isLocked: 1,
                                updatedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, input.subscriptionId))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Subscription suspended" + (input.reason ? ": " + input.reason : "")
                            }];
                    case 3:
                        error_5 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_5.message || "Failed to suspend subscription"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Reactivate suspended subscription
     */
    reactivate: subscriptionWriteProcedure
        .input(zod_1.z.object({ subscriptionId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, sub, overduePay, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.subscriptions)
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, input.subscriptionId))
                                .limit(1)];
                    case 2:
                        sub = _b.sent();
                        if (!sub.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Subscription not found"
                            });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.billingInvoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.billingInvoices.subscriptionId, input.subscriptionId), drizzle_orm_1.eq(schema_1.billingInvoices.status, "pending"), drizzle_orm_1.lte(schema_1.billingInvoices.dueDate, new Date().toISOString())))];
                    case 3:
                        overduePay = _b.sent();
                        if (overduePay.length > 0) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Cannot reactivate: " + overduePay.length + " overdue invoice(s) must be paid first"
                            });
                        }
                        return [4 /*yield*/, database
                                .update(schema_1.subscriptions)
                                .set({
                                status: "active",
                                isLocked: 0,
                                updatedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, input.subscriptionId))];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Subscription reactivated"
                            }];
                    case 5:
                        error_6 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_6.message || "Failed to reactivate subscription"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Cancel subscription
     */
    cancel: subscriptionWriteProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        reason: zod_1.z.string().optional(),
        refundPending: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, sub, now, refundId, refundAmount, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.subscriptions)
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, input.subscriptionId))
                                .limit(1)];
                    case 2:
                        sub = _b.sent();
                        if (!sub.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Subscription not found"
                            });
                        }
                        now = new Date().toISOString();
                        return [4 /*yield*/, database
                                .update(schema_1.subscriptions)
                                .set({
                                status: "cancelled",
                                isLocked: 1,
                                autoRenew: 0,
                                updatedAt: now
                            })
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, input.subscriptionId))];
                    case 3:
                        _b.sent();
                        if (!(input.refundPending && sub[0].currentPrice)) return [3 /*break*/, 5];
                        refundId = uuid_1.v4();
                        refundAmount = sub[0].currentPrice * 0.1;
                        return [4 /*yield*/, database.insert(schema_1.billingInvoices).values({
                                id: refundId,
                                subscriptionId: input.subscriptionId,
                                invoiceNumber: "REFUND-" + Date.now() + "-" + sub[0].id.slice(0, 8),
                                amount: refundAmount,
                                tax: 0,
                                totalAmount: refundAmount,
                                currency: "KES",
                                status: "pending",
                                billingPeriodStart: now,
                                billingPeriodEnd: now,
                                dueDate: now,
                                sentAt: now,
                                paidAt: null,
                                paymentMethod: null,
                                paymentReference: null,
                                notes: "Subscription cancellation" + (input.reason ? ": " + input.reason : "") + ". Refund after 10% processing fee.",
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, {
                            success: true,
                            message: "Subscription cancelled" + (input.reason ? ": " + input.reason : "")
                        }];
                    case 6:
                        error_7 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_7.message || "Failed to cancel subscription"
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get subscription analytics
     */
    getAnalytics: subscriptionReadProcedure
        .input(zod_1.z.object({
        dateRange: zod_1.z["enum"](["7d", "30d", "90d", "1y"]).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, now, startDate, allSubs, activeCount, trialCount, suspendedCount, cancelledCount, activeWithMonthly, mrr, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        now = new Date();
                        startDate = new Date();
                        switch (input.dateRange) {
                            case "7d":
                                startDate.setDate(now.getDate() - 7);
                                break;
                            case "30d":
                                startDate.setDate(now.getDate() - 30);
                                break;
                            case "90d":
                                startDate.setDate(now.getDate() - 90);
                                break;
                            case "1y":
                                startDate.setFullYear(now.getFullYear() - 1);
                                break;
                            default:
                                startDate.setDate(now.getDate() - 30);
                        }
                        return [4 /*yield*/, database.select().from(schema_1.subscriptions)];
                    case 2:
                        allSubs = _b.sent();
                        activeCount = allSubs.filter(function (s) { return s.status === "active"; }).length;
                        trialCount = allSubs.filter(function (s) { return s.status === "trial"; }).length;
                        suspendedCount = allSubs.filter(function (s) { return s.status === "suspended"; }).length;
                        cancelledCount = allSubs.filter(function (s) { return s.status === "cancelled"; }).length;
                        activeWithMonthly = allSubs.filter(function (s) { return s.status === "active" && s.billingCycle === "monthly"; });
                        mrr = activeWithMonthly.reduce(function (sum, s) { return sum + (parseFloat(s.currentPrice) || 0); }, 0);
                        return [2 /*return*/, {
                                success: true,
                                analytics: {
                                    totalSubscriptions: allSubs.length,
                                    activeCount: activeCount,
                                    trialCount: trialCount,
                                    suspendedCount: suspendedCount,
                                    cancelledCount: cancelledCount,
                                    mrr: Math.round(mrr * 100) / 100,
                                    activePercentage: Math.round((activeCount / allSubs.length) * 100)
                                }
                            }];
                    case 3:
                        error_8 = _b.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_8.message || "Failed to fetch subscription analytics"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export subscriptions to CSV
     */
    "export": subscriptionReadProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, subs, headers, rows, csv, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error("Database not available");
                    return [4 /*yield*/, database.select().from(schema_1.subscriptions).orderBy(drizzle_orm_1.desc(schema_1.subscriptions.createdAt))];
                case 2:
                    subs = _a.sent();
                    headers = [
                        "ID",
                        "Client ID",
                        "Plan ID",
                        "Status",
                        "Billing Cycle",
                        "Current Price",
                        "Start Date",
                        "Renewal Date",
                        "Auto Renew",
                        "Created At",
                    ];
                    rows = subs.map(function (s) { return [
                        s.id,
                        s.clientId,
                        s.planId,
                        s.status,
                        s.billingCycle,
                        s.currentPrice,
                        s.startDate,
                        s.renewalDate,
                        s.autoRenew ? "Yes" : "No",
                        s.createdAt,
                    ]; });
                    csv = __spreadArrays([headers], rows).map(function (row) { return row.join(","); }).join("\n");
                    return [2 /*return*/, {
                            success: true,
                            data: csv,
                            filename: "subscriptions_" + new Date().toISOString().split("T")[0] + ".csv"
                        }];
                case 3:
                    error_9 = _a.sent();
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: error_9.message || "Failed to export subscriptions"
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); })
});
