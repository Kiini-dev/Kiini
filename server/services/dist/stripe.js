"use strict";
/**
 * Stripe Payment Service
 * Handles all Stripe payment processing, webhook verification, and reconciliation
 *
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY: Stripe secret API key
 * - STRIPE_PUBLISHABLE_KEY: Stripe publishable key (for frontend)
 * - STRIPE_WEBHOOK_SECRET: Webhook signing secret
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
exports.getStripeStatus = exports.handleWebhookEvent = exports.getPaymentMethods = exports.processRefund = exports.getPaymentIntentStatus = exports.createPaymentIntent = void 0;
var stripe_1 = require("stripe");
var server_1 = require("@trpc/server");
var db = require("../db");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
// Helper: read a Stripe setting from DB (category "payment_stripe")
function getStripeSetting(key) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var database, rows, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    database = db_1.getDb();
                    return [4 /*yield*/, database.select().from(schema_1.settings)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.settings.category, "payment_stripe"), drizzle_orm_1.eq(schema_1.settings.key, key)))
                            .limit(1)];
                case 1:
                    rows = _c.sent();
                    return [2 /*return*/, ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.value) || undefined];
                case 2:
                    _b = _c.sent();
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var stripeSecretKey = process.env.STRIPE_SECRET_KEY;
var stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
var stripe = null;
var stripeInitialized = false;
function getStripe() {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (stripeInitialized)
                        return [2 /*return*/, stripe];
                    if (!!stripeSecretKey) return [3 /*break*/, 2];
                    return [4 /*yield*/, getStripeSetting("secretKey")];
                case 1:
                    stripeSecretKey = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!!stripeWebhookSecret) return [3 /*break*/, 4];
                    return [4 /*yield*/, getStripeSetting("webhookSecret")];
                case 3:
                    stripeWebhookSecret = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!stripeSecretKey) {
                        console.warn('[Stripe] STRIPE_SECRET_KEY not configured - Stripe payments will be disabled');
                        stripeInitialized = true;
                        return [2 /*return*/, null];
                    }
                    stripe = new stripe_1["default"](stripeSecretKey, { apiVersion: '2024-06-20' });
                    stripeInitialized = true;
                    return [2 /*return*/, stripe];
            }
        });
    });
}
/**
 * Create a new payment intent for an invoice
 */
function createPaymentIntent(input) {
    return __awaiter(this, void 0, Promise, function () {
        var stripeClient, invoiceId, clientId, amount, _a, currency, receiptEmail, description, database, paymentIntent, databaseId, stripePaymentIntents, eq_1, existing, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getStripe()];
                case 1:
                    stripeClient = _b.sent();
                    if (!stripeClient) {
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Stripe integration is not configured'
                        });
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 11, , 12]);
                    invoiceId = input.invoiceId, clientId = input.clientId, amount = input.amount, _a = input.currency, currency = _a === void 0 ? 'KES' : _a, receiptEmail = input.receiptEmail, description = input.description;
                    return [4 /*yield*/, db.getDb()];
                case 3:
                    database = _b.sent();
                    if (!database) {
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Database connection failed'
                        });
                    }
                    return [4 /*yield*/, stripeClient.paymentIntents.create({
                            amount: Math.round(amount * 100),
                            currency: currency.toLowerCase(),
                            receipt_email: receiptEmail,
                            description: description || "Invoice " + invoiceId,
                            metadata: {
                                invoiceId: invoiceId,
                                clientId: clientId
                            },
                            automatic_payment_methods: {
                                enabled: true
                            }
                        })];
                case 4:
                    paymentIntent = _b.sent();
                    databaseId = uuid_1.v4();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 5:
                    stripePaymentIntents = (_b.sent()).stripePaymentIntents;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                case 6:
                    eq_1 = (_b.sent()).eq;
                    return [4 /*yield*/, database.select()
                            .from(stripePaymentIntents)
                            .where(eq_1(stripePaymentIntents.invoiceId, invoiceId))];
                case 7:
                    existing = _b.sent();
                    if (!(existing.length > 0)) return [3 /*break*/, 9];
                    return [4 /*yield*/, database["delete"](stripePaymentIntents)
                            .where(eq_1(stripePaymentIntents.invoiceId, invoiceId))];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [4 /*yield*/, database.insert(stripePaymentIntents).values({
                        id: databaseId,
                        invoiceId: invoiceId,
                        stripeIntentId: paymentIntent.id,
                        clientId: clientId,
                        amount: Math.round(amount * 100),
                        currency: currency.toUpperCase(),
                        status: paymentIntent.status,
                        receiptEmail: receiptEmail,
                        metadata: { description: description }
                    })];
                case 10:
                    _b.sent();
                    return [2 /*return*/, {
                            clientSecret: paymentIntent.client_secret || '',
                            paymentIntentId: paymentIntent.id,
                            status: paymentIntent.status,
                            amount: paymentIntent.amount,
                            databaseId: databaseId
                        }];
                case 11:
                    error_1 = _b.sent();
                    console.error('[Stripe] Error creating payment intent:', error_1);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: error_1 instanceof Error ? error_1.message : 'Failed to create payment intent'
                    });
                case 12: return [2 /*return*/];
            }
        });
    });
}
exports.createPaymentIntent = createPaymentIntent;
/**
 * Get payment intent status
 */
function getPaymentIntentStatus(paymentIntentId) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var stripeClient, paymentIntent, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getStripe()];
                case 1:
                    stripeClient = _b.sent();
                    if (!stripeClient) {
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Stripe integration is not configured'
                        });
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, stripeClient.paymentIntents.retrieve(paymentIntentId)];
                case 3:
                    paymentIntent = _b.sent();
                    return [2 /*return*/, {
                            id: paymentIntent.id,
                            status: paymentIntent.status,
                            amount: paymentIntent.amount,
                            currency: paymentIntent.currency,
                            receiptEmail: paymentIntent.receipt_email,
                            chargeId: ((_a = paymentIntent.charges.data[0]) === null || _a === void 0 ? void 0 : _a.id) || null
                        }];
                case 4:
                    error_2 = _b.sent();
                    console.error('[Stripe] Error retrieving payment intent:', error_2);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to retrieve payment intent status'
                    });
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getPaymentIntentStatus = getPaymentIntentStatus;
/**
 * Process refund for a payment
 */
function processRefund(chargeId, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var stripeClient, refund, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getStripe()];
                case 1:
                    stripeClient = _a.sent();
                    if (!stripeClient) {
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Stripe integration is not configured'
                        });
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, stripeClient.refunds.create({
                            charge: chargeId,
                            amount: amount ? Math.round(amount * 100) : undefined
                        })];
                case 3:
                    refund = _a.sent();
                    return [2 /*return*/, {
                            refundId: refund.id,
                            status: refund.status,
                            amount: refund.amount,
                            charge: refund.charge
                        }];
                case 4:
                    error_3 = _a.sent();
                    console.error('[Stripe] Error processing refund:', error_3);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to process refund'
                    });
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.processRefund = processRefund;
/**
 * Get payment methods for a customer
 */
function getPaymentMethods(stripeCustomerId) {
    return __awaiter(this, void 0, void 0, function () {
        var stripeClient, paymentMethods, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getStripe()];
                case 1:
                    stripeClient = _a.sent();
                    if (!stripeClient) {
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Stripe integration is not configured'
                        });
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, stripeClient.paymentMethods.list({
                            customer: stripeCustomerId,
                            type: 'card'
                        })];
                case 3:
                    paymentMethods = _a.sent();
                    return [2 /*return*/, paymentMethods.data.map(function (pm) {
                            var _a, _b, _c, _d;
                            return ({
                                id: pm.id,
                                brand: ((_a = pm.card) === null || _a === void 0 ? void 0 : _a.brand) || '',
                                lastFourDigits: ((_b = pm.card) === null || _b === void 0 ? void 0 : _b.last4) || '',
                                expMonth: ((_c = pm.card) === null || _c === void 0 ? void 0 : _c.exp_month) || 0,
                                expYear: ((_d = pm.card) === null || _d === void 0 ? void 0 : _d.exp_year) || 0
                            });
                        })];
                case 4:
                    error_4 = _a.sent();
                    console.error('[Stripe] Error fetching payment methods:', error_4);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to fetch payment methods'
                    });
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getPaymentMethods = getPaymentMethods;
/**
 * Handle Stripe webhook events
 */
function handleWebhookEvent(body, signature) {
    return __awaiter(this, void 0, Promise, function () {
        var stripeClient, event, database, stripeWebhookEvents, stripePaymentIntents, payments, eq_2, invoiceId, _a, paymentIntent, dbIntent, existingPayments, paymentIntent, dbIntent, charge, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getStripe()];
                case 1:
                    stripeClient = _b.sent();
                    if (!stripeClient || !stripeWebhookSecret) {
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Stripe webhook is not configured'
                        });
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 23, , 24]);
                    event = stripeClient.webhooks.constructEvent(body, signature, stripeWebhookSecret);
                    return [4 /*yield*/, db.getDb()];
                case 3:
                    database = _b.sent();
                    if (!database) {
                        throw new Error('Database connection lost');
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 4:
                    stripeWebhookEvents = (_b.sent()).stripeWebhookEvents;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 5:
                    stripePaymentIntents = (_b.sent()).stripePaymentIntents;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 6:
                    payments = (_b.sent()).payments;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                case 7:
                    eq_2 = (_b.sent()).eq;
                    // Store event
                    return [4 /*yield*/, database.insert(stripeWebhookEvents).values({
                            id: uuid_1.v4(),
                            stripeEventId: event.id,
                            type: event.type,
                            data: event.data,
                            processed: 0
                        })];
                case 8:
                    // Store event
                    _b.sent();
                    invoiceId = void 0;
                    _a = event.type;
                    switch (_a) {
                        case 'payment_intent.succeeded': return [3 /*break*/, 9];
                        case 'payment_intent.payment_failed': return [3 /*break*/, 16];
                        case 'charge.refunded': return [3 /*break*/, 20];
                    }
                    return [3 /*break*/, 21];
                case 9:
                    paymentIntent = event.data.object;
                    return [4 /*yield*/, database.select()
                            .from(stripePaymentIntents)
                            .where(eq_2(stripePaymentIntents.stripeIntentId, paymentIntent.id))
                            .limit(1)];
                case 10:
                    dbIntent = _b.sent();
                    if (!(dbIntent.length > 0)) return [3 /*break*/, 15];
                    invoiceId = dbIntent[0].invoiceId;
                    return [4 /*yield*/, database.select()
                            .from(payments)
                            .where(eq_2(payments.invoiceId, invoiceId))
                            .limit(1)];
                case 11:
                    existingPayments = _b.sent();
                    if (!(existingPayments.length > 0)) return [3 /*break*/, 13];
                    return [4 /*yield*/, database.update(payments)
                            .set({
                            status: 'completed',
                            paymentDate: new Date().toISOString().slice(0, 19).replace('T', ' ')
                        })
                            .where(eq_2(payments.id, existingPayments[0].id))];
                case 12:
                    _b.sent();
                    _b.label = 13;
                case 13: 
                // Update stripe intent status
                return [4 /*yield*/, database.update(stripePaymentIntents)
                        .set({ status: 'succeeded' })
                        .where(eq_2(stripePaymentIntents.id, dbIntent[0].id))];
                case 14:
                    // Update stripe intent status
                    _b.sent();
                    _b.label = 15;
                case 15: return [3 /*break*/, 21];
                case 16:
                    paymentIntent = event.data.object;
                    return [4 /*yield*/, database.select()
                            .from(stripePaymentIntents)
                            .where(eq_2(stripePaymentIntents.stripeIntentId, paymentIntent.id))
                            .limit(1)];
                case 17:
                    dbIntent = _b.sent();
                    if (!(dbIntent.length > 0)) return [3 /*break*/, 19];
                    invoiceId = dbIntent[0].invoiceId;
                    return [4 /*yield*/, database.update(stripePaymentIntents)
                            .set({ status: 'canceled' })
                            .where(eq_2(stripePaymentIntents.id, dbIntent[0].id))];
                case 18:
                    _b.sent();
                    _b.label = 19;
                case 19: return [3 /*break*/, 21];
                case 20:
                    {
                        charge = event.data.object;
                        // Find payment by charge ID and mark as refunded
                        // Implementation depends on your payment tracking
                        console.log('[Stripe] Charge refunded:', charge.id);
                        return [3 /*break*/, 21];
                    }
                    _b.label = 21;
                case 21: 
                // Mark event as processed
                return [4 /*yield*/, database.update(stripeWebhookEvents)
                        .set({ processed: 1, processedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
                        .where(eq_2(stripeWebhookEvents.stripeEventId, event.id))];
                case 22:
                    // Mark event as processed
                    _b.sent();
                    return [2 /*return*/, { processed: true, eventType: event.type, invoiceId: invoiceId }];
                case 23:
                    error_5 = _b.sent();
                    console.error('[Stripe] Webhook processing error:', error_5);
                    throw error_5;
                case 24: return [2 /*return*/];
            }
        });
    });
}
exports.handleWebhookEvent = handleWebhookEvent;
/**
 * Get Stripe API status
 */
function getStripeStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var stripeClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getStripe()];
                case 1:
                    stripeClient = _a.sent();
                    return [2 /*return*/, {
                            isConfigured: !!stripeClient,
                            hasWebhookSecret: !!stripeWebhookSecret,
                            environment: (stripeSecretKey === null || stripeSecretKey === void 0 ? void 0 : stripeSecretKey.startsWith('sk_test_')) ? 'test' : 'production'
                        }];
            }
        });
    });
}
exports.getStripeStatus = getStripeStatus;
exports["default"] = {
    createPaymentIntent: createPaymentIntent,
    getPaymentIntentStatus: getPaymentIntentStatus,
    processRefund: processRefund,
    getPaymentMethods: getPaymentMethods,
    handleWebhookEvent: handleWebhookEvent,
    getStripeStatus: getStripeStatus
};
