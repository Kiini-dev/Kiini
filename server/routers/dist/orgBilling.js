"use strict";
/**
 * Organization Billing & Subscription Management Router
 * Handles subscription management, invoices, payment methods, and automated billing for organizations
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
exports.orgBillingRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var db = require("../db");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Feature-based procedures
var orgBillingReadProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("org:billing:read");
var orgBillingWriteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("org:billing:edit");
var orgBillingCreateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("org:billing:create");
exports.orgBillingRouter = trpc_1.router({
    /**
     * Get organization subscription details
     */
    getOrgSubscription: orgBillingReadProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var orgId = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, subscription, error_1;
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
                                .select()
                                .from(schema_1.subscriptions)
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.organizationId, orgId))
                                .limit(1)];
                    case 2:
                        subscription = _b.sent();
                        return [2 /*return*/, {
                                subscription: subscription[0] || null,
                                success: true
                            }];
                    case 3:
                        error_1 = _b.sent();
                        console.error("[OrgBilling] Error fetching subscription:", error_1);
                        return [2 /*return*/, {
                                subscription: null,
                                error: error_1.message,
                                success: false
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get billing invoices for organization
     */
    getOrgInvoices: orgBillingReadProcedure
        .input(zod_1.z.object({
        orgId: zod_1.z.string(),
        status: zod_1.z.string().optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, subscription, query, invoices_1, invoices, error_2;
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
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.organizationId, input.orgId))
                                .limit(1)];
                    case 2:
                        subscription = _b.sent();
                        if (!subscription.length) {
                            return [2 /*return*/, { invoices: [], total: 0, success: true }];
                        }
                        query = database
                            .select()
                            .from(schema_1.billingInvoices)
                            .where(drizzle_orm_1.eq(schema_1.billingInvoices.subscriptionId, subscription[0].id));
                        if (!input.status) return [3 /*break*/, 4];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.billingInvoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.billingInvoices.subscriptionId, subscription[0].id), drizzle_orm_1.eq(schema_1.billingInvoices.status, input.status)))];
                    case 3:
                        invoices_1 = _b.sent();
                        return [2 /*return*/, {
                                invoices: invoices_1.slice(input.offset, input.offset + input.limit),
                                total: invoices_1.length,
                                success: true
                            }];
                    case 4: return [4 /*yield*/, query];
                    case 5:
                        invoices = _b.sent();
                        return [2 /*return*/, {
                                invoices: invoices.slice(input.offset, input.offset + input.limit),
                                total: invoices.length,
                                success: true
                            }];
                    case 6:
                        error_2 = _b.sent();
                        console.error("[OrgBilling] Error fetching invoices:", error_2);
                        return [2 /*return*/, {
                                invoices: [],
                                total: 0,
                                error: error_2.message,
                                success: false
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get payment methods for organization
     */
    getOrgPaymentMethods: orgBillingReadProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var orgId = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, methods, error_3;
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
                                .select()
                                .from(schema_1.paymentMethods)
                                .where(drizzle_orm_1.eq(schema_1.paymentMethods.clientId, orgId))];
                    case 2:
                        methods = _b.sent();
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
                                    isActive: m.isActive,
                                    createdAt: m.createdAt
                                }); }),
                                success: true
                            }];
                    case 3:
                        error_3 = _b.sent();
                        console.error("[OrgBilling] Error fetching payment methods:", error_3);
                        return [2 /*return*/, {
                                methods: [],
                                error: error_3.message,
                                success: false
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Add payment method to organization
     */
    addPaymentMethod: orgBillingCreateProcedure
        .input(zod_1.z.object({
        orgId: zod_1.z.string(),
        type: zod_1.z["enum"](["credit_card", "debit_card", "bank_account", "paypal", "mpesa"]),
        provider: zod_1.z.string(),
        lastFourDigits: zod_1.z.string().optional(),
        expiryMonth: zod_1.z.number().optional(),
        expiryYear: zod_1.z.number().optional(),
        holderName: zod_1.z.string().optional(),
        bankName: zod_1.z.string().optional(),
        accountNumber: zod_1.z.string().optional(),
        providerMethodId: zod_1.z.string(),
        isDefault: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, methodId, now, method, error_4;
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
                        methodId = uuid_1.v4();
                        now = new Date().toISOString();
                        method = {
                            id: methodId,
                            clientId: input.orgId,
                            type: input.type,
                            provider: input.provider,
                            lastFourDigits: input.lastFourDigits,
                            expiryMonth: input.expiryMonth,
                            expiryYear: input.expiryYear,
                            holderName: input.holderName,
                            bankName: input.bankName,
                            accountNumber: input.accountNumber,
                            isDefault: input.isDefault ? 1 : 0,
                            isActive: 1,
                            providerMethodId: input.providerMethodId,
                            createdAt: now,
                            updatedAt: now
                        };
                        return [4 /*yield*/, database.insert(schema_1.paymentMethods).values(method)];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_method.added",
                                entityType: "Billing",
                                entityId: input.orgId,
                                description: "Added new " + input.type + " payment method for organization " + input.orgId,
                                metadata: JSON.stringify({ paymentMethodId: methodId, methodType: input.type }),
                                ipAddress: (_c = (_b = ctx.req) === null || _b === void 0 ? void 0 : _b.ip) !== null && _c !== void 0 ? _c : null
                            })];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, { method: method, success: true }];
                    case 4:
                        error_4 = _d.sent();
                        console.error("[OrgBilling] Error adding payment method:", error_4);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_4.message || "Failed to add payment method"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Create or activate a subscription for an organization
     */
    createOrgSubscription: orgBillingCreateProcedure
        .input(zod_1.z.object({
        orgId: zod_1.z.string(),
        planId: zod_1.z.string(),
        billingCycle: zod_1.z["enum"](["monthly", "annual"]),
        autoRenew: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, org, existingSubscription, plan, subscriptionId, now, renewalDate, currentPrice, subscription, error_5;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.organizations)
                                .where(drizzle_orm_1.eq(schema_1.organizations.id, input.orgId))
                                .limit(1)];
                    case 2:
                        org = _d.sent();
                        if (!org.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Organization not found"
                            });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.subscriptions)
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.organizationId, input.orgId))
                                .limit(1)];
                    case 3:
                        existingSubscription = _d.sent();
                        if (existingSubscription.length) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "An active subscription already exists for this organization."
                            });
                        }
                        return [4 /*yield*/, db.getPricingPlan(input.planId)];
                    case 4:
                        plan = _d.sent();
                        if (!plan) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Pricing plan not found"
                            });
                        }
                        subscriptionId = uuid_1.v4();
                        now = new Date();
                        renewalDate = new Date(now);
                        if (input.billingCycle === "monthly") {
                            renewalDate.setMonth(renewalDate.getMonth() + 1);
                        }
                        else {
                            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                        }
                        currentPrice = input.billingCycle === "monthly"
                            ? plan.monthlyPrice
                            : plan.annualPrice;
                        return [4 /*yield*/, db.createSubscription({
                                id: subscriptionId,
                                organizationId: input.orgId,
                                planId: input.planId,
                                status: "active",
                                billingCycle: input.billingCycle,
                                startDate: now.toISOString().replace("T", " ").substring(0, 19),
                                renewalDate: renewalDate.toISOString(),
                                currentPrice: currentPrice,
                                autoRenew: input.autoRenew ? 1 : 0,
                                createdBy: ctx.user.id,
                                createdAt: now.toISOString().replace("T", " ").substring(0, 19)
                            })];
                    case 5:
                        subscription = _d.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "subscription.created",
                                entityType: "Subscription",
                                entityId: subscriptionId,
                                description: "Created subscription " + subscriptionId + " for organization " + input.orgId,
                                metadata: JSON.stringify({ planId: input.planId, billingCycle: input.billingCycle, autoRenew: input.autoRenew }),
                                ipAddress: (_c = (_b = ctx.req) === null || _b === void 0 ? void 0 : _b.ip) !== null && _c !== void 0 ? _c : null
                            })];
                    case 6:
                        _d.sent();
                        return [2 /*return*/, { subscription: subscription, success: true }];
                    case 7:
                        error_5 = _d.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        console.error("[OrgBilling] Error creating subscription:", error_5);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_5.message || "Failed to create subscription"
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Process payment for organization subscription
     */
    processPayment: orgBillingCreateProcedure
        .input(zod_1.z.object({
        orgId: zod_1.z.string(),
        invoiceId: zod_1.z.string(),
        amount: zod_1.z.number().positive(),
        paymentMethodId: zod_1.z.string(),
        paymentMethod: zod_1.z["enum"](["credit_card", "debit_card", "bank_transfer", "mpesa", "stripe", "paypal"]),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, invoice, invoiceData, paymentId, now, payment, subscription, sub, newRenewalDate, error_6;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.billingInvoices)
                                .where(drizzle_orm_1.eq(schema_1.billingInvoices.id, input.invoiceId))
                                .limit(1)];
                    case 2:
                        invoice = _d.sent();
                        if (!invoice.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Invoice not found"
                            });
                        }
                        invoiceData = invoice[0];
                        paymentId = uuid_1.v4();
                        now = new Date().toISOString();
                        payment = {
                            id: paymentId,
                            organizationId: input.orgId,
                            invoiceId: input.invoiceId,
                            clientId: input.orgId,
                            accountId: null,
                            amount: Math.round(input.amount * 100),
                            paymentDate: now,
                            paymentMethod: input.paymentMethod,
                            referenceNumber: "PAY_" + Date.now(),
                            chartOfAccountType: "credit",
                            notes: input.notes,
                            status: "pending",
                            approvedBy: null,
                            approvedAt: null,
                            createdBy: ctx.user.id,
                            createdAt: now
                        };
                        return [4 /*yield*/, database.insert(schema_1.payments).values(payment)];
                    case 3:
                        _d.sent();
                        // Mark invoice as paid
                        return [4 /*yield*/, database
                                .update(schema_1.billingInvoices)
                                .set({
                                status: "paid",
                                paidAt: new Date().toISOString(),
                                paymentReference: paymentId
                            })
                                .where(drizzle_orm_1.eq(schema_1.billingInvoices.id, input.invoiceId))];
                    case 4:
                        // Mark invoice as paid
                        _d.sent();
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.subscriptions)
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, invoiceData.subscriptionId))
                                .limit(1)];
                    case 5:
                        subscription = _d.sent();
                        if (!subscription.length) return [3 /*break*/, 7];
                        sub = subscription[0];
                        if (!(sub.status === "suspended" || sub.isLocked)) return [3 /*break*/, 7];
                        newRenewalDate = new Date(sub.renewalDate);
                        if (sub.billingCycle === "monthly") {
                            newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
                        }
                        else {
                            newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
                        }
                        return [4 /*yield*/, database
                                .update(schema_1.subscriptions)
                                .set({
                                status: "active",
                                isLocked: 0,
                                renewalDate: newRenewalDate.toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, sub.id))];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "payment.processed",
                            entityType: "Invoice",
                            entityId: input.invoiceId,
                            description: "Processed payment for invoice " + input.invoiceId + " using " + input.paymentMethod,
                            metadata: JSON.stringify({ amount: input.amount, paymentMethodId: input.paymentMethodId, orgId: input.orgId }),
                            ipAddress: (_c = (_b = ctx.req) === null || _b === void 0 ? void 0 : _b.ip) !== null && _c !== void 0 ? _c : null
                        })];
                    case 8:
                        _d.sent();
                        return [2 /*return*/, { payment: payment, success: true, message: "Payment processed successfully" }];
                    case 9:
                        error_6 = _d.sent();
                        console.error("[OrgBilling] Error processing payment:", error_6);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_6.message || "Failed to process payment"
                        });
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get subscription status and billing information for org dashboard
     */
    getOrgBillingStatus: orgBillingReadProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var orgId = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, subscription, sub, now, renewalDate, daysUntilRenewal, unpaidInvoices, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.subscriptions)
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.organizationId, orgId))
                                .limit(1)];
                    case 2:
                        subscription = _b.sent();
                        if (!subscription.length) {
                            return [2 /*return*/, { status: "no_subscription", success: true }];
                        }
                        sub = subscription[0];
                        now = new Date();
                        renewalDate = new Date(sub.renewalDate);
                        daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.billingInvoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.billingInvoices.subscriptionId, sub.id), drizzle_orm_1.eq(schema_1.billingInvoices.status, "pending")))];
                    case 3:
                        unpaidInvoices = _b.sent();
                        return [2 /*return*/, {
                                status: sub.status,
                                isLocked: sub.isLocked === 1,
                                daysUntilRenewal: daysUntilRenewal,
                                plan: sub.billingCycle,
                                currentPrice: sub.currentPrice,
                                renewalDate: sub.renewalDate,
                                unpaidInvoices: unpaidInvoices.length,
                                autoRenew: sub.autoRenew === 1,
                                success: true
                            }];
                    case 4:
                        error_7 = _b.sent();
                        console.error("[OrgBilling] Error getting billing status:", error_7);
                        return [2 /*return*/, {
                                status: "error",
                                error: error_7.message,
                                success: false
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update default payment method
     */
    setDefaultPaymentMethod: orgBillingWriteProcedure
        .input(zod_1.z.object({
        orgId: zod_1.z.string(),
        paymentMethodId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, error_8;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        // First, unset all other default methods for this org
                        return [4 /*yield*/, database
                                .update(schema_1.paymentMethods)
                                .set({ isDefault: 0 })
                                .where(drizzle_orm_1.eq(schema_1.paymentMethods.clientId, input.orgId))];
                    case 2:
                        // First, unset all other default methods for this org
                        _d.sent();
                        // Set this one as default
                        return [4 /*yield*/, database
                                .update(schema_1.paymentMethods)
                                .set({ isDefault: 1 })
                                .where(drizzle_orm_1.eq(schema_1.paymentMethods.id, input.paymentMethodId))];
                    case 3:
                        // Set this one as default
                        _d.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_method.default_updated",
                                entityType: "Billing",
                                entityId: input.orgId,
                                description: "Set payment method " + input.paymentMethodId + " as default for organization " + input.orgId,
                                metadata: JSON.stringify({ paymentMethodId: input.paymentMethodId }),
                                ipAddress: (_c = (_b = ctx.req) === null || _b === void 0 ? void 0 : _b.ip) !== null && _c !== void 0 ? _c : null
                            })];
                    case 4:
                        _d.sent();
                        return [2 /*return*/, { success: true, message: "Default payment method updated" }];
                    case 5:
                        error_8 = _d.sent();
                        console.error("[OrgBilling] Error setting default payment method:", error_8);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_8.message || "Failed to set default payment method"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Delete payment method
     */
    deletePaymentMethod: orgBillingWriteProcedure
        .input(zod_1.z.object({
        orgId: zod_1.z.string(),
        paymentMethodId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, method, error_9;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.paymentMethods)
                                .where(drizzle_orm_1.eq(schema_1.paymentMethods.id, input.paymentMethodId))
                                .limit(1)];
                    case 2:
                        method = _d.sent();
                        if (method.length && method[0].isDefault) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Cannot delete default payment method. Set another as default first."
                            });
                        }
                        // Soft delete by marking inactive
                        return [4 /*yield*/, database
                                .update(schema_1.paymentMethods)
                                .set({ isActive: 0 })
                                .where(drizzle_orm_1.eq(schema_1.paymentMethods.id, input.paymentMethodId))];
                    case 3:
                        // Soft delete by marking inactive
                        _d.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_method.deleted",
                                entityType: "Billing",
                                entityId: input.orgId,
                                description: "Deleted payment method " + input.paymentMethodId + " for organization " + input.orgId,
                                metadata: JSON.stringify({ paymentMethodId: input.paymentMethodId }),
                                ipAddress: (_c = (_b = ctx.req) === null || _b === void 0 ? void 0 : _b.ip) !== null && _c !== void 0 ? _c : null
                            })];
                    case 4:
                        _d.sent();
                        return [2 /*return*/, { success: true, message: "Payment method deleted" }];
                    case 5:
                        error_9 = _d.sent();
                        console.error("[OrgBilling] Error deleting payment method:", error_9);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_9.message || "Failed to delete payment method"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get invoice PDF or details for download
     */
    downloadInvoice: orgBillingReadProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var invoiceId = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, invoice, error_10;
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
                                .select()
                                .from(schema_1.billingInvoices)
                                .where(drizzle_orm_1.eq(schema_1.billingInvoices.id, invoiceId))
                                .limit(1)];
                    case 2:
                        invoice = _b.sent();
                        if (!invoice.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Invoice not found"
                            });
                        }
                        return [2 /*return*/, {
                                invoice: invoice[0],
                                downloadUrl: "/api/invoices/" + invoiceId + "/pdf",
                                success: true
                            }];
                    case 3:
                        error_10 = _b.sent();
                        console.error("[OrgBilling] Error downloading invoice:", error_10);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_10.message || "Failed to download invoice"
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * System: Process automatic payments for subscriptions with auto-pay enabled
     * Should be called by cron job on renewal date
     */
    systemProcessAutomaticPayments: orgBillingWriteProcedure
        .mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, activeSubscriptions, now, timestamp, processedPayments, _i, activeSubscriptions_1, sub, renewalDate, defaultPaymentMethod, invoiceId, newRenewalDate, invoiceData, paymentId, payment, error_11;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 12, , 13]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.subscriptions)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.subscriptions.autoRenew, 1), drizzle_orm_1.eq(schema_1.subscriptions.status, "active")))];
                    case 2:
                        activeSubscriptions = _d.sent();
                        now = new Date();
                        timestamp = new Date().toISOString();
                        processedPayments = [];
                        _i = 0, activeSubscriptions_1 = activeSubscriptions;
                        _d.label = 3;
                    case 3:
                        if (!(_i < activeSubscriptions_1.length)) return [3 /*break*/, 10];
                        sub = activeSubscriptions_1[_i];
                        renewalDate = new Date(sub.renewalDate);
                        // Only process if renewal date has passed
                        if (now < renewalDate)
                            return [3 /*break*/, 9];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.paymentMethods)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.paymentMethods.clientId, sub.organizationId || ""), drizzle_orm_1.eq(schema_1.paymentMethods.isDefault, 1), drizzle_orm_1.eq(schema_1.paymentMethods.isActive, 1)))
                                .limit(1)];
                    case 4:
                        defaultPaymentMethod = _d.sent();
                        if (!defaultPaymentMethod.length) {
                            console.warn("[OrgBilling] No default payment method for org " + sub.organizationId);
                            return [3 /*break*/, 9];
                        }
                        invoiceId = uuid_1.v4();
                        newRenewalDate = new Date(renewalDate);
                        if (sub.billingCycle === "monthly") {
                            newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
                        }
                        else {
                            newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
                        }
                        invoiceData = {
                            id: invoiceId,
                            subscriptionId: sub.id,
                            invoiceNumber: "INV-" + Date.now() + "-" + sub.id.slice(0, 8),
                            amount: sub.currentPrice || 0,
                            tax: 0,
                            totalAmount: sub.currentPrice || 0,
                            currency: "KES",
                            status: "pending",
                            billingPeriodStart: renewalDate.toISOString(),
                            billingPeriodEnd: newRenewalDate.toISOString(),
                            dueDate: renewalDate.toISOString(),
                            sentAt: timestamp,
                            paidAt: null,
                            paymentMethod: defaultPaymentMethod[0].type,
                            paymentReference: null,
                            notes: "Automatic renewal",
                            createdAt: timestamp,
                            updatedAt: timestamp
                        };
                        return [4 /*yield*/, database.insert(schema_1.billingInvoices).values(invoiceData)];
                    case 5:
                        _d.sent();
                        paymentId = uuid_1.v4();
                        payment = {
                            id: paymentId,
                            organizationId: sub.organizationId,
                            invoiceId: invoiceId,
                            clientId: sub.organizationId || "",
                            accountId: null,
                            amount: Math.round((sub.currentPrice || 0) * 100),
                            paymentDate: timestamp,
                            paymentMethod: defaultPaymentMethod[0].type,
                            referenceNumber: "AUTO_PAY_" + Date.now(),
                            chartOfAccountType: "credit",
                            notes: "Automatic renewal payment",
                            status: "completed",
                            approvedBy: null,
                            approvedAt: timestamp,
                            createdBy: "system",
                            createdAt: timestamp
                        };
                        return [4 /*yield*/, database.insert(schema_1.payments).values(payment)];
                    case 6:
                        _d.sent();
                        // Update invoice status
                        return [4 /*yield*/, database
                                .update(schema_1.billingInvoices)
                                .set({ status: "paid", paidAt: timestamp })
                                .where(drizzle_orm_1.eq(schema_1.billingInvoices.id, invoiceId))];
                    case 7:
                        // Update invoice status
                        _d.sent();
                        // Update subscription
                        return [4 /*yield*/, database
                                .update(schema_1.subscriptions)
                                .set({
                                renewalDate: newRenewalDate.toISOString(),
                                status: "active",
                                isLocked: 0
                            })
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, sub.id))];
                    case 8:
                        // Update subscription
                        _d.sent();
                        processedPayments.push({
                            subscriptionId: sub.id,
                            orgId: sub.organizationId,
                            invoiceId: invoiceId,
                            amount: sub.currentPrice
                        });
                        _d.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 3];
                    case 10: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "subscription.automatic_payments_processed",
                            entityType: "Billing",
                            entityId: null,
                            description: "Processed " + processedPayments.length + " automatic renewal payments",
                            metadata: JSON.stringify({ processedPayments: processedPayments }),
                            ipAddress: (_c = (_b = ctx.req) === null || _b === void 0 ? void 0 : _b.ip) !== null && _c !== void 0 ? _c : null
                        })];
                    case 11:
                        _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                processedCount: processedPayments.length,
                                payments: processedPayments
                            }];
                    case 12:
                        error_11 = _d.sent();
                        console.error("[OrgBilling] System automatic payment processing failed:", error_11);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_11.message || "Failed to process automatic payments"
                        });
                    case 13: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * System: Check and suspend overdue subscriptions
     * Should be called by cron job daily
     */
    systemCheckAndSuspendOverdue: orgBillingWriteProcedure
        .mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, allSubscriptions, now, suspendedSubscriptions, _i, allSubscriptions_1, sub, renewalDate, gracePeriodEnd, error_12;
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
                        return [4 /*yield*/, database.select().from(schema_1.subscriptions)];
                    case 2:
                        allSubscriptions = _d.sent();
                        now = new Date();
                        suspendedSubscriptions = [];
                        _i = 0, allSubscriptions_1 = allSubscriptions;
                        _d.label = 3;
                    case 3:
                        if (!(_i < allSubscriptions_1.length)) return [3 /*break*/, 6];
                        sub = allSubscriptions_1[_i];
                        if (sub.status === "suspended" || sub.status === "cancelled" || (sub.isLocked === 1)) {
                            return [3 /*break*/, 5];
                        }
                        renewalDate = new Date(sub.renewalDate);
                        gracePeriodEnd = new Date(renewalDate);
                        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3 day grace period
                        if (!(now > gracePeriodEnd)) return [3 /*break*/, 5];
                        return [4 /*yield*/, database
                                .update(schema_1.subscriptions)
                                .set({
                                status: "suspended",
                                isLocked: 1
                            })
                                .where(drizzle_orm_1.eq(schema_1.subscriptions.id, sub.id))];
                    case 4:
                        _d.sent();
                        suspendedSubscriptions.push({
                            subscriptionId: sub.id,
                            orgId: sub.organizationId,
                            daysOverdue: Math.ceil((now.getTime() - gracePeriodEnd.getTime()) / (24 * 60 * 60 * 1000))
                        });
                        _d.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "subscription.overdue_suspensions",
                            entityType: "Subscription",
                            entityId: null,
                            description: "Suspended " + suspendedSubscriptions.length + " overdue subscriptions",
                            metadata: JSON.stringify({ suspendedSubscriptions: suspendedSubscriptions }),
                            ipAddress: (_c = (_b = ctx.req) === null || _b === void 0 ? void 0 : _b.ip) !== null && _c !== void 0 ? _c : null
                        })];
                    case 7:
                        _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                suspendedCount: suspendedSubscriptions.length,
                                suspendedSubscriptions: suspendedSubscriptions
                            }];
                    case 8:
                        error_12 = _d.sent();
                        console.error("[OrgBilling] System suspension check failed:", error_12);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_12.message || "Failed to check subscriptions"
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    })
});
