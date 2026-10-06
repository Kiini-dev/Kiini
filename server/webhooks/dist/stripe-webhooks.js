"use strict";
/**
 * Stripe Webhook Handlers
 * Handles payment events from Stripe: succeeded, failed, disputed, etc.
 * Integrates with organization subscription and payment procedures
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.stripeWebhookRouter = void 0;
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var stripe_1 = require("stripe");
var express_1 = require("express");
var schema_1 = require("../../drizzle/schema");
var stripe = new stripe_1["default"](process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-10-28.acacia" });
var webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
exports.stripeWebhookRouter = express_1.Router();
/**
 * Verify Stripe webhook signature
 */
function verifyStripeWebhookSignature(req, webhookSecret) {
    var sig = req.headers["stripe-signature"];
    try {
        var event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        return event;
    }
    catch (err) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return null;
    }
}
/**
 * Handle successful payment (payment_intent.succeeded)
 * Updates invoice status and organization subscription
 */
function handlePaymentSucceeded(event) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var paymentIntent, db, invoiceId, organizationId_1, subscriptionData, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    paymentIntent = event.data.object;
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _d.sent();
                    if (!db) {
                        console.error("❌ Database connection unavailable");
                        return [2 /*return*/];
                    }
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 8, , 9]);
                    invoiceId = (_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.invoiceId;
                    organizationId_1 = (_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.organizationId;
                    if (!invoiceId || !organizationId_1) {
                        console.warn("⚠️ Payment succeeded but missing invoiceId or organizationId in metadata");
                        return [2 /*return*/];
                    }
                    // Update the invoice status to 'paid'
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["UPDATE invoices SET status = 'paid', paymentDate = NOW() WHERE id = ", ""], ["UPDATE invoices SET status = 'paid', paymentDate = NOW() WHERE id = ", ""])), invoiceId))];
                case 3:
                    // Update the invoice status to 'paid'
                    _d.sent();
                    // Create audit log entry
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            organizationId: organizationId_1,
                            userId: "stripe-webhook",
                            action: "payment_received",
                            entityType: "invoice",
                            entityId: invoiceId,
                            oldValues: JSON.stringify({ status: "pending" }),
                            newValues: JSON.stringify({ status: "paid", amount: paymentIntent.amount / 100 }),
                            severity: "info",
                            ipAddress: "stripe",
                            userAgent: "Stripe Webhook",
                            timestamp: new Date(),
                            details: JSON.stringify({
                                stripePaymentIntentId: paymentIntent.id,
                                chargeId: (_c = paymentIntent.charges.data[0]) === null || _c === void 0 ? void 0 : _c.id
                            })
                        })];
                case 4:
                    // Create audit log entry
                    _d.sent();
                    console.log("\u2705 Payment succeeded for invoice " + invoiceId);
                    return [4 /*yield*/, db.query.organizationSubscriptions.findFirst({
                            where: function (sub, _a) {
                                var eq = _a.eq;
                                return eq(sub.organizationId, organizationId_1);
                            }
                        })];
                case 5:
                    subscriptionData = _d.sent();
                    if (!((subscriptionData === null || subscriptionData === void 0 ? void 0 : subscriptionData.trialEndDate) && new Date(subscriptionData.trialEndDate) > new Date())) return [3 /*break*/, 7];
                    // Trial converted to paid - clear trial date
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["UPDATE organizationSubscriptions \n            SET trialEndDate = NULL, \n                subscriptionStatus = 'active',\n                nextBillingDate = DATE_ADD(NOW(), INTERVAL ", " MONTH)\n            WHERE organizationId = ", ""], ["UPDATE organizationSubscriptions \n            SET trialEndDate = NULL, \n                subscriptionStatus = 'active',\n                nextBillingDate = DATE_ADD(NOW(), INTERVAL ", " MONTH)\n            WHERE organizationId = ", ""])), subscriptionData.billingCycleMonths, organizationId_1))];
                case 6:
                    // Trial converted to paid - clear trial date
                    _d.sent();
                    console.log("\u2705 Trial converted to paid for organization " + organizationId_1);
                    _d.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_1 = _d.sent();
                    console.error("❌ Error handling payment_intent.succeeded:", error_1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle failed payment (payment_intent.payment_failed)
 * Creates reminder alert and schedules retry
 */
function handlePaymentFailed(event) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function () {
        var paymentIntent, db, invoiceId, organizationId, retryDate, error_2;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    paymentIntent = event.data.object;
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _h.sent();
                    if (!db) {
                        console.error("❌ Database connection unavailable");
                        return [2 /*return*/];
                    }
                    _h.label = 2;
                case 2:
                    _h.trys.push([2, 5, , 6]);
                    invoiceId = (_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.invoiceId;
                    organizationId = (_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.organizationId;
                    if (!invoiceId || !organizationId) {
                        console.warn("⚠️ Payment failed but missing metadata");
                        return [2 /*return*/];
                    }
                    retryDate = new Date();
                    retryDate.setDate(retryDate.getDate() + 3);
                    return [4 /*yield*/, db.insert(schema_1.paymentTriggers).values({
                            organizationId: organizationId,
                            invoiceId: invoiceId,
                            triggerType: "payment_retry",
                            triggerDate: retryDate,
                            status: "pending",
                            actionType: "email_reminder",
                            retryCount: ((_d = (_c = paymentIntent.charges.data[0]) === null || _c === void 0 ? void 0 : _c.payment_error_codes) === null || _d === void 0 ? void 0 : _d.length) || 1,
                            metadata: JSON.stringify({
                                failureReason: (_e = paymentIntent.last_payment_error) === null || _e === void 0 ? void 0 : _e.message,
                                stripePaymentIntentId: paymentIntent.id,
                                chargeId: (_f = paymentIntent.charges.data[0]) === null || _f === void 0 ? void 0 : _f.id
                            })
                        })];
                case 3:
                    _h.sent();
                    // Create audit log
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            organizationId: organizationId,
                            userId: "stripe-webhook",
                            action: "payment_failed",
                            entityType: "invoice",
                            entityId: invoiceId,
                            severity: "warning",
                            ipAddress: "stripe",
                            userAgent: "Stripe Webhook",
                            timestamp: new Date(),
                            details: JSON.stringify({
                                reason: (_g = paymentIntent.last_payment_error) === null || _g === void 0 ? void 0 : _g.message,
                                stripePaymentIntentId: paymentIntent.id
                            })
                        })];
                case 4:
                    // Create audit log
                    _h.sent();
                    console.log("\u26A0\uFE0F Payment failed for invoice " + invoiceId + ", retry scheduled for " + retryDate.toISOString());
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _h.sent();
                    console.error("❌ Error handling payment_intent.payment_failed:", error_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle charge dispute (charge.dispute.created)
 * Escalates to super admin for manual review
 */
function handleChargeDispute(event) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var dispute, db, organizationId, chargeId, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dispute = event.data.object;
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        console.error("❌ Database connection unavailable");
                        return [2 /*return*/];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    organizationId = (_a = dispute.metadata) === null || _a === void 0 ? void 0 : _a.organizationId;
                    chargeId = dispute.charge;
                    if (!organizationId) return [3 /*break*/, 4];
                    // Create high-priority audit log for manual review
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            organizationId: organizationId,
                            userId: "stripe-webhook",
                            action: "payment_disputed",
                            entityType: "charge",
                            entityId: chargeId,
                            severity: "critical",
                            ipAddress: "stripe",
                            userAgent: "Stripe Webhook",
                            timestamp: new Date(),
                            details: JSON.stringify({
                                disputeId: dispute.id,
                                reason: dispute.reason,
                                amount: dispute.amount,
                                evidence_due_by: dispute.evidence_due_by
                            })
                        })];
                case 3:
                    // Create high-priority audit log for manual review
                    _b.sent();
                    console.log("\uD83D\uDEA8 Charge dispute created: " + dispute.id + " for organization " + organizationId);
                    _b.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_3 = _b.sent();
                    console.error("❌ Error handling charge.dispute.created:", error_3);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle customer subscription update (customer.subscription.updated)
 * Syncs Stripe subscription changes with our database
 */
function handleSubscriptionUpdated(event) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var subscription, db, organizationId, nextBillingDate, status, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    subscription = event.data.object;
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        console.error("❌ Database connection unavailable");
                        return [2 /*return*/];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    organizationId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.organizationId;
                    if (!organizationId) {
                        console.warn("⚠️ Subscription updated but missing organizationId in metadata");
                        return [2 /*return*/];
                    }
                    nextBillingDate = new Date(subscription.current_period_end * 1000);
                    status = subscription.status;
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["UPDATE organizationSubscriptions \n          SET subscriptionStatus = ", ",\n              nextBillingDate = ", ",\n              stripeSubscriptionId = ", ",\n              lastSyncedAt = NOW()\n          WHERE organizationId = ", ""], ["UPDATE organizationSubscriptions \n          SET subscriptionStatus = ", ",\n              nextBillingDate = ", ",\n              stripeSubscriptionId = ", ",\n              lastSyncedAt = NOW()\n          WHERE organizationId = ", ""])), status, nextBillingDate, subscription.id, organizationId))];
                case 3:
                    _b.sent();
                    // Create audit log
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            organizationId: organizationId,
                            userId: "stripe-webhook",
                            action: "subscription_updated",
                            entityType: "subscription",
                            entityId: subscription.id,
                            severity: "info",
                            ipAddress: "stripe",
                            userAgent: "Stripe Webhook",
                            timestamp: new Date(),
                            details: JSON.stringify({
                                stripeStatus: status,
                                nextBillingDate: nextBillingDate.toISOString()
                            })
                        })];
                case 4:
                    // Create audit log
                    _b.sent();
                    console.log("\u2705 Subscription updated for organization " + organizationId + ": " + status);
                    return [3 /*break*/, 6];
                case 5:
                    error_4 = _b.sent();
                    console.error("❌ Error handling customer.subscription.updated:", error_4);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Main webhook handler endpoint
 */
exports.stripeWebhookRouter.post("/stripe", function (req, res) {
    // Parse raw body for signature verification
    var event = null;
    if (typeof req.body === "string") {
        event = verifyStripeWebhookSignature(req, webhookSecret);
    }
    if (!event) {
        res.status(400).json({ error: "Invalid webhook signature" });
        return;
    }
    console.log("\uD83D\uDCE8 Received Stripe webhook event: " + event.type);
    // Route to appropriate handler
    switch (event.type) {
        case "payment_intent.succeeded":
            handlePaymentSucceeded(event);
            break;
        case "payment_intent.payment_failed":
            handlePaymentFailed(event);
            break;
        case "charge.dispute.created":
            handleChargeDispute(event);
            break;
        case "customer.subscription.updated":
            handleSubscriptionUpdated(event);
            break;
        case "charge.refunded":
            console.log("📝 Charge refunded - logging for audit");
            break;
        default:
            console.log("\u2139\uFE0F Unhandled event type: " + event.type);
    }
    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true, eventId: event.id });
});
exports["default"] = exports.stripeWebhookRouter;
var templateObject_1, templateObject_2, templateObject_3;
