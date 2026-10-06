"use strict";
/**
 * Billing & Subscription Management tRPC Router
 * Handles SaaS pricing, subscriptions, invoices, and payments
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
exports.billingRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var db = require("../db");
var uuid_1 = require("uuid");
// Feature-based procedures
var billingReadProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("billing:read");
var billingWriteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("billing:edit");
var billingCreateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("billing:create");
exports.billingRouter = trpc_1.router({
    /**
     * Get available pricing plans
     */
    getPlans: trpc_1.protectedProcedure
        .input(zod_1.z.object({ tier: zod_1.z.string().optional() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var plans, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.getAvailablePlans(input === null || input === void 0 ? void 0 : input.tier)];
                    case 1:
                        plans = _b.sent();
                        return [2 /*return*/, { plans: plans, success: true }];
                    case 2:
                        error_1 = _b.sent();
                        console.error("[Billing] Error fetching plans:", error_1);
                        return [2 /*return*/, { plans: [], success: false }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get current subscription for user's client
     */
    getCurrentSubscription: billingReadProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user, subscription, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db.getUserById(ctx.user.id)];
                    case 1:
                        user = _b.sent();
                        if (!(user === null || user === void 0 ? void 0 : user.clientId)) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'User not associated with a client'
                            });
                        }
                        return [4 /*yield*/, db.getClientSubscription(user.clientId)];
                    case 2:
                        subscription = _b.sent();
                        return [2 /*return*/, { subscription: subscription, success: true }];
                    case 3:
                        error_2 = _b.sent();
                        return [2 /*return*/, { subscription: null, error: error_2 === null || error_2 === void 0 ? void 0 : error_2.message, success: false }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Create new subscription
     */
    createSubscription: billingCreateProcedure
        .input(zod_1.z.object({
        clientId: zod_1.z.string(),
        planId: zod_1.z.string(),
        billingCycle: zod_1.z["enum"](['monthly', 'annual']),
        autoRenew: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var client, plan, subscriptionId, now, renewalDate, price, subscription, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db.getClientById(input.clientId)];
                    case 1:
                        client = _b.sent();
                        if (!client) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Client not found'
                            });
                        }
                        return [4 /*yield*/, db.getPricingPlan(input.planId)];
                    case 2:
                        plan = _b.sent();
                        if (!plan) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Pricing plan not found'
                            });
                        }
                        subscriptionId = uuid_1.v4();
                        now = new Date();
                        renewalDate = new Date();
                        // Set renewal date based on billing cycle
                        if (input.billingCycle === 'monthly') {
                            renewalDate.setMonth(renewalDate.getMonth() + 1);
                        }
                        else {
                            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                        }
                        price = input.billingCycle === 'monthly'
                            ? plan.monthlyPrice
                            : plan.annualPrice;
                        return [4 /*yield*/, db.createSubscription({
                                id: subscriptionId,
                                clientId: input.clientId,
                                planId: input.planId,
                                status: 'trial',
                                billingCycle: input.billingCycle,
                                startDate: now.toISOString().replace('T', ' ').substring(0, 19),
                                renewalDate: renewalDate.toISOString(),
                                currentPrice: price,
                                autoRenew: input.autoRenew ? 1 : 0
                            })];
                    case 3:
                        subscription = _b.sent();
                        return [2 /*return*/, { subscription: subscription, success: true }];
                    case 4:
                        error_3 = _b.sent();
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: (error_3 === null || error_3 === void 0 ? void 0 : error_3.message) || 'Failed to create subscription'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get billing invoices for current client
     */
    getInvoices: billingReadProcedure
        .input(zod_1.z.object({
        status: zod_1.z.string().optional(),
        limit: zod_1.z.number()["default"](50)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user, invoices, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db.getUserById(ctx.user.id)];
                    case 1:
                        user = _b.sent();
                        if (!(user === null || user === void 0 ? void 0 : user.clientId)) {
                            return [2 /*return*/, { invoices: [], success: false }];
                        }
                        return [4 /*yield*/, db.getClientInvoices(user.clientId, input.status)];
                    case 2:
                        invoices = _b.sent();
                        return [2 /*return*/, { invoices: invoices.slice(0, input.limit), success: true }];
                    case 3:
                        error_4 = _b.sent();
                        console.error("[Billing] Error fetching invoices:", error_4);
                        return [2 /*return*/, { invoices: [], success: false }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    recordUsageMetric: billingWriteProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        metricDate: zod_1.z.string().optional(),
        usersCount: zod_1.z.number()["default"](0),
        projectsCount: zod_1.z.number()["default"](0),
        tasksCount: zod_1.z.number()["default"](0),
        documentsCount: zod_1.z.number()["default"](0),
        storageUsedMB: zod_1.z.number()["default"](0),
        apiCallsCount: zod_1.z.number()["default"](0),
        emailsSent: zod_1.z.number()["default"](0)
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var recordedAt, metric, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        recordedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.createBillingUsageMetric({
                                id: uuid_1.v4(),
                                subscriptionId: input.subscriptionId,
                                metricDate: input.metricDate || recordedAt,
                                usersCount: input.usersCount,
                                projectsCount: input.projectsCount,
                                tasksCount: input.tasksCount,
                                documentsCount: input.documentsCount,
                                storageUsedMB: input.storageUsedMB,
                                apiCallsCount: input.apiCallsCount,
                                emailsSent: input.emailsSent,
                                recordedAt: recordedAt
                            })];
                    case 1:
                        metric = _b.sent();
                        return [2 /*return*/, { success: true, metric: metric }];
                    case 2:
                        error_5 = _b.sent();
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: (error_5 === null || error_5 === void 0 ? void 0 : error_5.message) || 'Failed to record usage metric'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    getUsageMetrics: billingReadProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        limit: zod_1.z.number().min(1).max(200)["default"](50)
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var metrics, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.getBillingUsageMetrics(input.subscriptionId, input.startDate, input.endDate, input.limit)];
                    case 1:
                        metrics = _b.sent();
                        return [2 /*return*/, { success: true, metrics: metrics }];
                    case 2:
                        error_6 = _b.sent();
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: (error_6 === null || error_6 === void 0 ? void 0 : error_6.message) || 'Failed to fetch usage metrics'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    getUsageSummary: billingReadProcedure
        .input(zod_1.z.object({
        subscriptionId: zod_1.z.string(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var summary, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.getBillingUsageSummary(input.subscriptionId, input.startDate, input.endDate)];
                    case 1:
                        summary = _b.sent();
                        return [2 /*return*/, { success: true, summary: summary }];
                    case 2:
                        error_7 = _b.sent();
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: (error_7 === null || error_7 === void 0 ? void 0 : error_7.message) || 'Failed to fetch usage summary'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get invoice details
     */
    getInvoiceDetails: billingReadProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var invoice, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.getInvoiceById(input)];
                    case 1:
                        invoice = _b.sent();
                        if (!invoice) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Invoice not found'
                            });
                        }
                        return [2 /*return*/, { invoice: invoice, success: true }];
                    case 2:
                        error_8 = _b.sent();
                        return [2 /*return*/, { invoice: null, error: error_8 === null || error_8 === void 0 ? void 0 : error_8.message, success: false }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get payment methods for client
     */
    getPaymentMethods: billingReadProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user, methods, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db.getUserById(ctx.user.id)];
                    case 1:
                        user = _b.sent();
                        if (!(user === null || user === void 0 ? void 0 : user.clientId)) {
                            return [2 /*return*/, { methods: [], success: false }];
                        }
                        return [4 /*yield*/, db.getPaymentMethods(user.clientId)];
                    case 2:
                        methods = _b.sent();
                        // Don't return full account details
                        return [2 /*return*/, {
                                methods: methods.map(function (m) { return ({
                                    id: m.id,
                                    type: m.type,
                                    provider: m.provider,
                                    lastFourDigits: m.lastFourDigits,
                                    expiryMonth: m.expiryMonth,
                                    expiryYear: m.expiryYear,
                                    holderName: m.holderName,
                                    isDefault: m.isDefault,
                                    isActive: m.isActive
                                }); }),
                                success: true
                            }];
                    case 3:
                        error_9 = _b.sent();
                        console.error("[Billing] Error fetching payment methods:", error_9);
                        return [2 /*return*/, { methods: [], success: false }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Add payment method
     */
    addPaymentMethod: billingCreateProcedure
        .input(zod_1.z.object({
        type: zod_1.z["enum"](['credit_card', 'debit_card', 'bank_account', 'paypal', 'mpesa']),
        provider: zod_1.z.string(),
        lastFourDigits: zod_1.z.string().optional(),
        expiryMonth: zod_1.z.number().optional(),
        expiryYear: zod_1.z.number().optional(),
        holderName: zod_1.z.string().optional(),
        bankName: zod_1.z.string().optional(),
        providerMethodId: zod_1.z.string(),
        isDefault: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user, methodId, method, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db.getUserById(ctx.user.id)];
                    case 1:
                        user = _b.sent();
                        if (!(user === null || user === void 0 ? void 0 : user.clientId)) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'User not associated with a client'
                            });
                        }
                        methodId = uuid_1.v4();
                        return [4 /*yield*/, db.createPaymentMethod({
                                id: methodId,
                                clientId: user.clientId,
                                type: input.type,
                                provider: input.provider,
                                lastFourDigits: input.lastFourDigits,
                                expiryMonth: input.expiryMonth,
                                expiryYear: input.expiryYear,
                                holderName: input.holderName,
                                bankName: input.bankName,
                                providerMethodId: input.providerMethodId,
                                isDefault: input.isDefault ? 1 : 0,
                                isActive: 1
                            })];
                    case 2:
                        method = _b.sent();
                        return [2 /*return*/, { method: method, success: true }];
                    case 3:
                        error_10 = _b.sent();
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: (error_10 === null || error_10 === void 0 ? void 0 : error_10.message) || 'Failed to add payment method'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Process payment for invoice
     */
    processPayment: billingCreateProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        amount: zod_1.z.number(),
        paymentMethodId: zod_1.z.string(),
        paymentMethod: zod_1.z["enum"](['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'mpesa', 'other'])
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var invoice, paymentId, payment, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db.getInvoiceById(input.invoiceId)];
                    case 1:
                        invoice = _b.sent();
                        if (!invoice) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Invoice not found'
                            });
                        }
                        paymentId = uuid_1.v4();
                        return [4 /*yield*/, db.createPayment({
                                id: paymentId,
                                invoiceId: input.invoiceId,
                                amount: input.amount,
                                paymentMethod: input.paymentMethod,
                                status: 'processing',
                                transactionId: "TXN_" + uuid_1.v4()
                            })];
                    case 2:
                        payment = _b.sent();
                        // Update invoice status
                        return [4 /*yield*/, db.updateInvoice(input.invoiceId, { status: 'paid', paidAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })];
                    case 3:
                        // Update invoice status
                        _b.sent();
                        if (!(input.amount >= invoice.totalAmount)) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.createReceiptFromInvoice(input.invoiceId)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, { payment: payment, success: true }];
                    case 6:
                        error_11 = _b.sent();
                        if (error_11 instanceof server_1.TRPCError)
                            throw error_11;
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: (error_11 === null || error_11 === void 0 ? void 0 : error_11.message) || 'Payment processing failed'
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Check subscription status and lock if needed
     */
    checkSubscriptionStatus: trpc_1.protectedProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user, subscription, now, renewalDate, gracePeriodEnd, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db.getUserById(ctx.user.id)];
                    case 1:
                        user = _b.sent();
                        if (!(user === null || user === void 0 ? void 0 : user.clientId)) {
                            return [2 /*return*/, { status: 'error', message: 'No client association' }];
                        }
                        return [4 /*yield*/, db.getClientSubscription(user.clientId)];
                    case 2:
                        subscription = _b.sent();
                        if (!subscription) {
                            return [2 /*return*/, { status: 'no_subscription' }];
                        }
                        now = new Date();
                        renewalDate = new Date(subscription.renewalDate);
                        gracePeriodEnd = new Date(renewalDate);
                        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3 day grace period
                        if (!(now > gracePeriodEnd && !subscription.isLocked)) return [3 /*break*/, 4];
                        // Lock subscription if payment not made
                        return [4 /*yield*/, db.updateSubscription(subscription.id, {
                                isLocked: 1,
                                status: 'suspended'
                            })];
                    case 3:
                        // Lock subscription if payment not made
                        _b.sent();
                        return [2 /*return*/, { status: 'locked', message: 'Subscription locked - payment overdue' }];
                    case 4: return [2 /*return*/, { status: subscription.status, isLocked: subscription.isLocked }];
                    case 5:
                        error_12 = _b.sent();
                        console.error("[Billing] Error checking subscription:", error_12);
                        return [2 /*return*/, { status: 'error', message: 'Failed to check subscription status' }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Renew subscription after payment
     */
    renewSubscription: billingWriteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var subscription, newRenewalDate, error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db.getSubscriptionById(input)];
                    case 1:
                        subscription = _b.sent();
                        if (!subscription) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Subscription not found'
                            });
                        }
                        newRenewalDate = new Date(subscription.renewalDate);
                        if (subscription.billingCycle === 'monthly') {
                            newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
                        }
                        else {
                            newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
                        }
                        return [4 /*yield*/, db.updateSubscription(input, {
                                status: 'active',
                                renewalDate: newRenewalDate.toISOString(),
                                isLocked: 0
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, message: 'Subscription renewed' }];
                    case 3:
                        error_13 = _b.sent();
                        if (error_13 instanceof server_1.TRPCError)
                            throw error_13;
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: (error_13 === null || error_13 === void 0 ? void 0 : error_13.message) || 'Failed to renew subscription'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * System task: Check all subscriptions and lock those past grace period
     * This should be called by a cron job daily
     */
    systemCheckAndLockExpiredSubscriptions: billingWriteProcedure
        .mutation(function () { return __awaiter(void 0, void 0, void 0, function () {
        var allSubscriptions, now, lockedSubscriptions, _i, allSubscriptions_1, subscription, renewalDate, gracePeriodEnd, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, db.getAllSubscriptions()];
                case 1:
                    allSubscriptions = _a.sent();
                    now = new Date();
                    lockedSubscriptions = [];
                    _i = 0, allSubscriptions_1 = allSubscriptions;
                    _a.label = 2;
                case 2:
                    if (!(_i < allSubscriptions_1.length)) return [3 /*break*/, 6];
                    subscription = allSubscriptions_1[_i];
                    renewalDate = new Date(subscription.renewalDate);
                    gracePeriodEnd = new Date(renewalDate);
                    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3 day grace period
                    if (!(now > gracePeriodEnd && !subscription.isLocked)) return [3 /*break*/, 5];
                    return [4 /*yield*/, db.updateSubscription(subscription.id, {
                            isLocked: 1,
                            status: 'suspended'
                        })];
                case 3:
                    _a.sent();
                    // Create billing notification
                    return [4 /*yield*/, db.createBillingNotification({
                            id: uuid_1.v4(),
                            subscriptionId: subscription.id,
                            notificationType: 'system_locked',
                            message: "Your subscription has been locked due to payment overdue by " + Math.ceil((now.getTime() - gracePeriodEnd.getTime()) / (24 * 60 * 60 * 1000)) + " days",
                            channel: 'email',
                            isSent: 0
                        })];
                case 4:
                    // Create billing notification
                    _a.sent();
                    lockedSubscriptions.push({
                        subscriptionId: subscription.id,
                        clientId: subscription.clientId,
                        daysOverdue: Math.ceil((now.getTime() - gracePeriodEnd.getTime()) / (24 * 60 * 60 * 1000))
                    });
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/, {
                        success: true,
                        lockedCount: lockedSubscriptions.length,
                        lockedSubscriptions: lockedSubscriptions
                    }];
                case 7:
                    error_14 = _a.sent();
                    console.error('[Billing] System lock check failed:', error_14);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: (error_14 === null || error_14 === void 0 ? void 0 : error_14.message) || 'Failed to check subscriptions'
                    });
                case 8: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * System task: Send payment reminders and overdue warnings
     * This should be called by a cron job daily
     */
    systemSendBillingNotifications: billingWriteProcedure
        .mutation(function () { return __awaiter(void 0, void 0, void 0, function () {
        var allSubscriptions, now, notificationsSent, _i, allSubscriptions_2, subscription, renewalDate, daysUntilDue, shouldNotify, message, notificationType, error_15;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, db.getAllSubscriptions()];
                case 1:
                    allSubscriptions = _a.sent();
                    now = new Date();
                    notificationsSent = [];
                    _i = 0, allSubscriptions_2 = allSubscriptions;
                    _a.label = 2;
                case 2:
                    if (!(_i < allSubscriptions_2.length)) return [3 /*break*/, 5];
                    subscription = allSubscriptions_2[_i];
                    if (subscription.status !== 'active')
                        return [3 /*break*/, 4];
                    renewalDate = new Date(subscription.renewalDate);
                    daysUntilDue = Math.ceil((renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                    shouldNotify = false;
                    message = '';
                    notificationType = '';
                    // 7 days before due
                    if (daysUntilDue === 7) {
                        shouldNotify = true;
                        message = 'Payment due in 7 days. Please update your payment method.';
                        notificationType = 'payment_reminder_7d';
                    }
                    // 1 day before due
                    else if (daysUntilDue === 1) {
                        shouldNotify = true;
                        message = 'Payment due tomorrow. Your subscription will be suspended if not paid.';
                        notificationType = 'payment_reminder_1d';
                    }
                    // Overdue by 1 day
                    else if (daysUntilDue === -1) {
                        shouldNotify = true;
                        message = 'Your payment is 1 day overdue. Your subscription will be locked in 2 days.';
                        notificationType = 'overdue_warning_1d';
                    }
                    // Overdue by 3 days
                    else if (daysUntilDue === -3) {
                        shouldNotify = true;
                        message = 'Your payment is 3 days overdue. Your subscription will be locked immediately.';
                        notificationType = 'overdue_warning_3d';
                    }
                    if (!shouldNotify) return [3 /*break*/, 4];
                    return [4 /*yield*/, db.createBillingNotification({
                            id: uuid_1.v4(),
                            subscriptionId: subscription.id,
                            notificationType: notificationType,
                            message: message,
                            channel: 'email',
                            isSent: 0
                        })];
                case 3:
                    _a.sent();
                    notificationsSent.push({
                        subscriptionId: subscription.id,
                        type: notificationType,
                        daysUntilDue: daysUntilDue
                    });
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, {
                        success: true,
                        notificationsSentCount: notificationsSent.length,
                        notifications: notificationsSent
                    }];
                case 6:
                    error_15 = _a.sent();
                    console.error('[Billing] Send notifications failed:', error_15);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: (error_15 === null || error_15 === void 0 ? void 0 : error_15.message) || 'Failed to send notifications'
                    });
                case 7: return [2 /*return*/];
            }
        });
    }); })
});
