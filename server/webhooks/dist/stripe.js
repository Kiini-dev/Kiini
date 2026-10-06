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
exports.verifyStripeSignature = exports.handleStripeWebhook = void 0;
var stripe_1 = require("stripe");
var db_1 = require("~/server/db");
var schema_1 = require("~/server/db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var emailService_1 = require("~/server/email/emailService");
var logger_1 = require("~/server/utils/logger");
var stripe = new stripe_1["default"](process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});
/**
 * Stripe Webhook Handler
 * Processes payment events from Stripe
 * Events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
 */
function handleStripeWebhook(event) {
    return __awaiter(this, void 0, Promise, function () {
        var _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 13, , 14]);
                    logger_1.logger.info("[Stripe] Processing event: " + event.type);
                    _a = event.type;
                    switch (_a) {
                        case 'payment_intent.succeeded': return [3 /*break*/, 1];
                        case 'payment_intent.payment_failed': return [3 /*break*/, 3];
                        case 'charge.refunded': return [3 /*break*/, 5];
                        case 'customer.subscription.updated': return [3 /*break*/, 7];
                        case 'customer.subscription.deleted': return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 11];
                case 1: return [4 /*yield*/, handlePaymentSucceeded(event.data.object)];
                case 2: return [2 /*return*/, _b.sent()];
                case 3: return [4 /*yield*/, handlePaymentFailed(event.data.object)];
                case 4: return [2 /*return*/, _b.sent()];
                case 5: return [4 /*yield*/, handleChargeRefunded(event.data.object)];
                case 6: return [2 /*return*/, _b.sent()];
                case 7: return [4 /*yield*/, handleSubscriptionUpdated(event.data.object)];
                case 8: return [2 /*return*/, _b.sent()];
                case 9: return [4 /*yield*/, handleSubscriptionDeleted(event.data.object)];
                case 10: return [2 /*return*/, _b.sent()];
                case 11:
                    logger_1.logger.info("[Stripe] Unhandled event type: " + event.type);
                    return [2 /*return*/, { received: true, processed: false }];
                case 12: return [3 /*break*/, 14];
                case 13:
                    error_1 = _b.sent();
                    logger_1.logger.error('[Stripe] Webhook error:', error_1);
                    return [2 /*return*/, {
                            received: true,
                            processed: false,
                            error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }];
                case 14: return [2 /*return*/];
            }
        });
    });
}
exports.handleStripeWebhook = handleStripeWebhook;
/**
 * Handle successful payment
 */
function handlePaymentSucceeded(paymentIntent) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function () {
        var invoiceId, organizationId, invoice, subscription, nextBillingDate, error_2;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 6, , 7]);
                    invoiceId = (_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.invoiceId;
                    organizationId = (_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.organizationId;
                    if (!invoiceId || !organizationId) {
                        logger_1.logger.warn('[Stripe] Missing metadata in payment intent', { paymentIntent: paymentIntent });
                        return [2 /*return*/, { received: true, processed: false, error: 'Missing metadata' }];
                    }
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.invoices)
                            .set({
                            status: 'paid',
                            paidDate: new Date(),
                            paymentMethod: 'stripe',
                            stripePaymentIntentId: paymentIntent.id,
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))];
                case 1:
                    invoice = _f.sent();
                    return [4 /*yield*/, db_1.db.query.organizationSubscriptions.findFirst({
                            where: drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, organizationId)
                        })];
                case 2:
                    subscription = _f.sent();
                    if (!subscription) return [3 /*break*/, 4];
                    nextBillingDate = new Date();
                    nextBillingDate.setMonth(nextBillingDate.getMonth() + (subscription.billingCycleMonths || 1));
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.organizationSubscriptions)
                            .set({
                            renewalDate: nextBillingDate,
                            nextBillingDate: nextBillingDate,
                            autoRenewEnabled: true,
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, organizationId))];
                case 3:
                    _f.sent();
                    _f.label = 4;
                case 4: 
                // Send payment receipt email
                return [4 /*yield*/, emailService_1.sendEmail({
                        to: ((_c = paymentIntent.metadata) === null || _c === void 0 ? void 0 : _c.customerEmail) || '',
                        subject: 'Payment Received - Invoice Receipt',
                        template: 'payment-received',
                        context: {
                            organizationName: ((_d = paymentIntent.metadata) === null || _d === void 0 ? void 0 : _d.organizationName) || 'Your Organization',
                            invoiceId: invoiceId,
                            amount: (paymentIntent.amount / 100).toFixed(2),
                            currency: ((_e = paymentIntent.currency) === null || _e === void 0 ? void 0 : _e.toUpperCase()) || 'USD',
                            date: new Date().toLocaleDateString()
                        }
                    })];
                case 5:
                    // Send payment receipt email
                    _f.sent();
                    logger_1.logger.info('[Stripe] Payment succeeded', { invoiceId: invoiceId, organizationId: organizationId });
                    return [2 /*return*/, { received: true, processed: true }];
                case 6:
                    error_2 = _f.sent();
                    logger_1.logger.error('[Stripe] Error handling payment succeeded:', error_2);
                    return [2 /*return*/, {
                            received: true,
                            processed: false,
                            error: error_2 instanceof Error ? error_2.message : 'Unknown error'
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle failed payment
 */
function handlePaymentFailed(paymentIntent) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function () {
        var invoiceId, organizationId, error_3;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _h.trys.push([0, 3, , 4]);
                    invoiceId = (_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.invoiceId;
                    organizationId = (_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.organizationId;
                    if (!invoiceId || !organizationId) {
                        return [2 /*return*/, { received: true, processed: false, error: 'Missing metadata' }];
                    }
                    // Update invoice status to failed
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.invoices)
                            .set({
                            status: 'failed',
                            failureReason: ((_c = paymentIntent.last_payment_error) === null || _c === void 0 ? void 0 : _c.message) || 'Payment declined',
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))];
                case 1:
                    // Update invoice status to failed
                    _h.sent();
                    // Send payment failure notification email
                    return [4 /*yield*/, emailService_1.sendEmail({
                            to: ((_d = paymentIntent.metadata) === null || _d === void 0 ? void 0 : _d.customerEmail) || '',
                            subject: 'Payment Failed - Action Required',
                            template: 'payment-failed',
                            context: {
                                organizationName: ((_e = paymentIntent.metadata) === null || _e === void 0 ? void 0 : _e.organizationName) || 'Your Organization',
                                invoiceId: invoiceId,
                                amount: (paymentIntent.amount / 100).toFixed(2),
                                currency: ((_f = paymentIntent.currency) === null || _f === void 0 ? void 0 : _f.toUpperCase()) || 'USD',
                                reason: ((_g = paymentIntent.last_payment_error) === null || _g === void 0 ? void 0 : _g.message) || 'Unknown'
                            }
                        })];
                case 2:
                    // Send payment failure notification email
                    _h.sent();
                    logger_1.logger.warn('[Stripe] Payment failed', { invoiceId: invoiceId, organizationId: organizationId });
                    return [2 /*return*/, { received: true, processed: true }];
                case 3:
                    error_3 = _h.sent();
                    logger_1.logger.error('[Stripe] Error handling payment failed:', error_3);
                    return [2 /*return*/, {
                            received: true,
                            processed: false,
                            error: error_3 instanceof Error ? error_3.message : 'Unknown error'
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle refund
 */
function handleChargeRefunded(charge) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var invoiceId, organizationId, error_4;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 3, , 4]);
                    invoiceId = (_a = charge.metadata) === null || _a === void 0 ? void 0 : _a.invoiceId;
                    organizationId = (_b = charge.metadata) === null || _b === void 0 ? void 0 : _b.organizationId;
                    if (!invoiceId || !organizationId) {
                        return [2 /*return*/, { received: true, processed: false, error: 'Missing metadata' }];
                    }
                    // Update invoice status to refunded
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.invoices)
                            .set({
                            status: 'refunded',
                            refundedAmount: charge.amount_refunded / 100,
                            refundedDate: new Date(),
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))];
                case 1:
                    // Update invoice status to refunded
                    _e.sent();
                    // Send refund notification email
                    return [4 /*yield*/, emailService_1.sendEmail({
                            to: ((_c = charge.billing_details) === null || _c === void 0 ? void 0 : _c.email) || '',
                            subject: 'Refund Processed',
                            template: 'refund-processed',
                            context: {
                                invoiceId: invoiceId,
                                amount: (charge.amount_refunded / 100).toFixed(2),
                                currency: ((_d = charge.currency) === null || _d === void 0 ? void 0 : _d.toUpperCase()) || 'USD'
                            }
                        })];
                case 2:
                    // Send refund notification email
                    _e.sent();
                    logger_1.logger.info('[Stripe] Refund processed', { invoiceId: invoiceId, organizationId: organizationId });
                    return [2 /*return*/, { received: true, processed: true }];
                case 3:
                    error_4 = _e.sent();
                    logger_1.logger.error('[Stripe] Error handling refund:', error_4);
                    return [2 /*return*/, {
                            received: true,
                            processed: false,
                            error: error_4 instanceof Error ? error_4.message : 'Unknown error'
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle subscription update (e.g., plan upgrade during trial)
 */
function handleSubscriptionUpdated(subscription) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var organizationId;
        return __generator(this, function (_b) {
            try {
                organizationId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.organizationId;
                if (!organizationId) {
                    return [2 /*return*/, { received: true, processed: false, error: 'Missing organizationId' }];
                }
                logger_1.logger.info('[Stripe] Subscription updated', { organizationId: organizationId });
                return [2 /*return*/, { received: true, processed: true }];
            }
            catch (error) {
                logger_1.logger.error('[Stripe] Error handling subscription update:', error);
                return [2 /*return*/, {
                        received: true,
                        processed: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Handle subscription cancellation
 */
function handleSubscriptionDeleted(subscription) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var organizationId, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    organizationId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.organizationId;
                    if (!organizationId) {
                        return [2 /*return*/, { received: true, processed: false, error: 'Missing organizationId' }];
                    }
                    // Update organization subscription status
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.organizationSubscriptions)
                            .set({
                            autoRenewEnabled: false,
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, organizationId))];
                case 1:
                    // Update organization subscription status
                    _b.sent();
                    logger_1.logger.info('[Stripe] Subscription cancelled', { organizationId: organizationId });
                    return [2 /*return*/, { received: true, processed: true }];
                case 2:
                    error_5 = _b.sent();
                    logger_1.logger.error('[Stripe] Error handling subscription deletion:', error_5);
                    return [2 /*return*/, {
                            received: true,
                            processed: false,
                            error: error_5 instanceof Error ? error_5.message : 'Unknown error'
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Verify Stripe webhook signature
 */
function verifyStripeSignature(body, signature, secret) {
    try {
        return stripe.webhooks.constructEvent(body, signature, secret);
    }
    catch (error) {
        logger_1.logger.error('[Stripe] Signature verification failed:', error);
        return null;
    }
}
exports.verifyStripeSignature = verifyStripeSignature;
