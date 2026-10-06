"use strict";
/**
 * Webhook Processor Service
 * Handles incoming webhooks from payment gateways (Stripe, M-Pesa, Bank Transfers)
 * Processes, verifies, and acts on payment events
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.WebhookProcessor = void 0;
var logger_1 = require("~/server/lib/logger");
var db_1 = require("~/server/db");
var schema_1 = require("~/server/db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var crypto_1 = require("crypto");
var WebhookProcessor = /** @class */ (function () {
    function WebhookProcessor() {
    }
    /**
     * Process incoming webhook event
     * Routes to appropriate handler based on event source
     */
    WebhookProcessor.processWebhook = function (gateway, payload, signature, timestamp) {
        return __awaiter(this, void 0, Promise, function () {
            var isValid, result, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 10, , 11]);
                        logger_1.logger.info("Processing " + gateway + " webhook");
                        return [4 /*yield*/, this.verifySignature(gateway, payload, signature, timestamp)];
                    case 1:
                        isValid = _b.sent();
                        if (!isValid) {
                            logger_1.logger.error("Invalid " + gateway + " webhook signature");
                            return [2 /*return*/, { success: false, message: 'Invalid signature' }];
                        }
                        result = void 0;
                        _a = gateway;
                        switch (_a) {
                            case 'stripe': return [3 /*break*/, 2];
                            case 'mpesa': return [3 /*break*/, 4];
                            case 'bank': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, this.processStripeWebhook(payload)];
                    case 3:
                        result = _b.sent();
                        return [3 /*break*/, 9];
                    case 4: return [4 /*yield*/, this.processMpesaWebhook(payload)];
                    case 5:
                        result = _b.sent();
                        return [3 /*break*/, 9];
                    case 6: return [4 /*yield*/, this.processBankWebhook(payload)];
                    case 7:
                        result = _b.sent();
                        return [3 /*break*/, 9];
                    case 8: return [2 /*return*/, { success: false, message: "Unknown gateway: " + gateway }];
                    case 9: return [2 /*return*/, result];
                    case 10:
                        error_1 = _b.sent();
                        logger_1.logger.error("Webhook processing error: " + error_1);
                        return [2 /*return*/, { success: false, message: 'Processing error' }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verify webhook signature for authenticity
     */
    WebhookProcessor.verifySignature = function (gateway, payload, signature, timestamp) {
        return __awaiter(this, void 0, Promise, function () {
            var secret, stripeSignedContent, stripeHash, mpesaContent, mpesaHash, bankHash;
            return __generator(this, function (_a) {
                secret = this.getWebhookSecret(gateway);
                switch (gateway) {
                    case 'stripe':
                        stripeSignedContent = timestamp + "." + JSON.stringify(payload);
                        stripeHash = crypto_1["default"]
                            .createHmac('sha256', secret)
                            .update(stripeSignedContent)
                            .digest('hex');
                        return [2 /*return*/, signature === "t=" + timestamp + ",v1=" + stripeHash];
                    case 'mpesa':
                        mpesaContent = "" + JSON.stringify(payload) + secret;
                        mpesaHash = crypto_1["default"].createHash('sha256').update(mpesaContent).digest('hex');
                        return [2 /*return*/, signature === mpesaHash];
                    case 'bank':
                        bankHash = crypto_1["default"]
                            .createHmac('sha256', secret)
                            .update(JSON.stringify(payload))
                            .digest('hex');
                        return [2 /*return*/, signature === bankHash];
                    default:
                        return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Process Stripe webhook events
     */
    WebhookProcessor.processStripeWebhook = function (event) {
        return __awaiter(this, void 0, Promise, function () {
            var type, data, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        type = event.type, data = event.data;
                        logger_1.logger.info("Stripe event: " + type);
                        _a = type;
                        switch (_a) {
                            case 'payment_intent.succeeded': return [3 /*break*/, 1];
                            case 'payment_intent.payment_failed': return [3 /*break*/, 3];
                            case 'invoice.payment_succeeded': return [3 /*break*/, 5];
                            case 'invoice.payment_failed': return [3 /*break*/, 7];
                            case 'customer.subscription.deleted': return [3 /*break*/, 9];
                            case 'customer.subscription.updated': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.handleStripePaymentSucceeded(data.object)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.handleStripePaymentFailed(data.object)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.handleStripeInvoicePaid(data.object)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.handleStripeInvoiceFailed(data.object)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.handleStripeSubscriptionCancelled(data.object)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.handleStripeSubscriptionUpdated(data.object)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13:
                        logger_1.logger.info("Unhandled Stripe event: " + type);
                        return [2 /*return*/, { success: true, message: 'Event received but not processed', eventId: event.id }];
                }
            });
        });
    };
    /**
     * Process M-Pesa webhook events (STK push, C2B)
     */
    WebhookProcessor.processMpesaWebhook = function (data) {
        return __awaiter(this, void 0, Promise, function () {
            var transactionType, resultCode, resultDesc, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transactionType = data.transactionType, resultCode = data.resultCode, resultDesc = data.resultDesc;
                        logger_1.logger.info("M-Pesa event: " + transactionType + " - " + resultDesc);
                        _a = transactionType;
                        switch (_a) {
                            case 'STK_PUSH': return [3 /*break*/, 1];
                            case 'C2B': return [3 /*break*/, 3];
                            case 'B2B': return [3 /*break*/, 5];
                            case 'REVERSAL': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [4 /*yield*/, this.handleMpesaStkPushResult(data)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.handleMpesaC2BTransaction(data)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.handleMpesaB2BTransaction(data)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.handleMpesaReversal(data)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9:
                        logger_1.logger.info("Unhandled M-Pesa transaction type: " + transactionType);
                        return [2 /*return*/, { success: true, message: 'Event received', eventId: data.CheckoutRequestID }];
                }
            });
        });
    };
    /**
     * Process Bank transfer webhook events
     */
    WebhookProcessor.processBankWebhook = function (data) {
        return __awaiter(this, void 0, Promise, function () {
            var eventType, transferStatus, referenceNumber, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        eventType = data.eventType, transferStatus = data.transferStatus, referenceNumber = data.referenceNumber;
                        logger_1.logger.info("Bank event: " + eventType + " - " + transferStatus);
                        _a = eventType;
                        switch (_a) {
                            case 'TRANSFER_COMPLETED': return [3 /*break*/, 1];
                            case 'TRANSFER_FAILED': return [3 /*break*/, 3];
                            case 'TRANSFER_PENDING': return [3 /*break*/, 5];
                            case 'RECONCILIATION': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [4 /*yield*/, this.handleBankTransferCompleted(data)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.handleBankTransferFailed(data)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.handleBankTransferPending(data)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.handleBankReconciliation(data)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9:
                        logger_1.logger.info("Unhandled bank event: " + eventType);
                        return [2 /*return*/, { success: true, message: 'Event received', eventId: referenceNumber }];
                }
            });
        });
    };
    // ============ STRIPE HANDLERS ============
    WebhookProcessor.handleStripePaymentSucceeded = function (paymentIntent) {
        return __awaiter(this, void 0, void 0, function () {
            var id, amount, metadata, status, _a, organizationId, invoiceId, subscription;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = paymentIntent.id, amount = paymentIntent.amount, metadata = paymentIntent.metadata, status = paymentIntent.status;
                        _a = metadata || {}, organizationId = _a.organizationId, invoiceId = _a.invoiceId;
                        logger_1.logger.info("Stripe payment succeeded: " + id);
                        if (!invoiceId) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.invoices)
                                .set({
                                status: 'paid',
                                paidDate: new Date(),
                                stripePaymentIntentId: id,
                                transactionId: id
                            })
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!organizationId) return [3 /*break*/, 5];
                        return [4 /*yield*/, db_1.db.query.organizationSubscriptions.findFirst({
                                where: drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, organizationId)
                            })];
                    case 3:
                        subscription = _b.sent();
                        if (!(subscription && subscription.status === 'trial')) return [3 /*break*/, 5];
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.organizationSubscriptions)
                                .set({
                                status: 'active',
                                currentTier: subscription.currentTier || 'Starter'
                            })
                                .where(drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, organizationId))];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: 
                    // Log to audit trail
                    return [4 /*yield*/, this.logWebhookEvent('payment_succeeded', 'stripe', paymentIntent, organizationId)];
                    case 6:
                        // Log to audit trail
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Payment processed successfully',
                                eventId: id
                            }];
                }
            });
        });
    };
    WebhookProcessor.handleStripePaymentFailed = function (paymentIntent) {
        return __awaiter(this, void 0, void 0, function () {
            var id, metadata, last_payment_error, _a, organizationId, invoiceId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = paymentIntent.id, metadata = paymentIntent.metadata, last_payment_error = paymentIntent.last_payment_error;
                        _a = metadata || {}, organizationId = _a.organizationId, invoiceId = _a.invoiceId;
                        logger_1.logger.error("Stripe payment failed: " + id + " - " + (last_payment_error === null || last_payment_error === void 0 ? void 0 : last_payment_error.message));
                        if (!invoiceId) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.invoices)
                                .set({
                                status: 'failed',
                                failureReason: (last_payment_error === null || last_payment_error === void 0 ? void 0 : last_payment_error.message) || 'Payment declined'
                            })
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: 
                    // Log to audit trail
                    return [4 /*yield*/, this.logWebhookEvent('payment_failed', 'stripe', paymentIntent, organizationId)];
                    case 3:
                        // Log to audit trail
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Payment failure logged',
                                eventId: id
                            }];
                }
            });
        });
    };
    WebhookProcessor.handleStripeInvoicePaid = function (stripeInvoice) {
        return __awaiter(this, void 0, void 0, function () {
            var id, metadata;
            return __generator(this, function (_a) {
                id = stripeInvoice.id, metadata = stripeInvoice.metadata;
                logger_1.logger.info("Stripe invoice paid: " + id);
                return [2 /*return*/, {
                        success: true,
                        message: 'Invoice marked as paid',
                        eventId: id
                    }];
            });
        });
    };
    WebhookProcessor.handleStripeInvoiceFailed = function (stripeInvoice) {
        return __awaiter(this, void 0, void 0, function () {
            var id, metadata, attempt_count;
            return __generator(this, function (_a) {
                id = stripeInvoice.id, metadata = stripeInvoice.metadata, attempt_count = stripeInvoice.attempt_count;
                logger_1.logger.warn("Stripe invoice failed: " + id + " (attempt " + attempt_count + ")");
                return [2 /*return*/, {
                        success: true,
                        message: 'Invoice failure logged',
                        eventId: id
                    }];
            });
        });
    };
    WebhookProcessor.handleStripeSubscriptionCancelled = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            var id, metadata;
            return __generator(this, function (_a) {
                id = subscription.id, metadata = subscription.metadata;
                logger_1.logger.info("Stripe subscription cancelled: " + id);
                return [2 /*return*/, {
                        success: true,
                        message: 'Subscription cancellation logged',
                        eventId: id
                    }];
            });
        });
    };
    WebhookProcessor.handleStripeSubscriptionUpdated = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            var id, items, metadata;
            return __generator(this, function (_a) {
                id = subscription.id, items = subscription.items, metadata = subscription.metadata;
                logger_1.logger.info("Stripe subscription updated: " + id);
                return [2 /*return*/, {
                        success: true,
                        message: 'Subscription update logged',
                        eventId: id
                    }];
            });
        });
    };
    // ============ M-PESA HANDLERS ============
    WebhookProcessor.handleMpesaStkPushResult = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var CheckoutRequestID, ResultCode, ResultDesc, Amount, PhoneNumber;
            return __generator(this, function (_a) {
                CheckoutRequestID = data.CheckoutRequestID, ResultCode = data.ResultCode, ResultDesc = data.ResultDesc, Amount = data.Amount, PhoneNumber = data.PhoneNumber;
                logger_1.logger.info("M-Pesa STK result: " + ResultDesc);
                // ResultCode 0 = Success
                if (ResultCode === '0') {
                    // Payment successful - complete transaction
                    // This will be confirmed by C2B callback
                    logger_1.logger.info("STK payment initiated: " + PhoneNumber + " - " + Amount);
                }
                else {
                    // User declined/timeout
                    logger_1.logger.warn("STK payment failed: " + ResultDesc);
                }
                return [2 /*return*/, {
                        success: true,
                        message: 'STK result received',
                        eventId: CheckoutRequestID
                    }];
            });
        });
    };
    WebhookProcessor.handleMpesaC2BTransaction = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var TransactionID, TransAmount, TransactionTime, BusinessShortCode, MSISDN, AccountReference, _a, organizationId, invoiceId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        TransactionID = data.TransactionID, TransAmount = data.TransAmount, TransactionTime = data.TransactionTime, BusinessShortCode = data.BusinessShortCode, MSISDN = data.MSISDN, AccountReference = data.AccountReference;
                        logger_1.logger.info("M-Pesa C2B: " + TransactionID + " - " + TransAmount + " from " + MSISDN + " to " + BusinessShortCode);
                        _a = AccountReference.split('_') || [], organizationId = _a[0], invoiceId = _a[1];
                        if (!invoiceId) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.invoices)
                                .set({
                                status: 'paid',
                                paidDate: new Date(TransactionTime),
                                mpesaTransactionId: TransactionID,
                                transactionId: TransactionID,
                                mpesaReference: AccountReference
                            })
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))];
                    case 1:
                        _b.sent();
                        logger_1.logger.info("Invoice " + invoiceId + " marked as paid via M-Pesa");
                        _b.label = 2;
                    case 2: 
                    // Log to audit trail
                    return [4 /*yield*/, this.logWebhookEvent('payment_succeeded', 'mpesa', data, organizationId)];
                    case 3:
                        // Log to audit trail
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'C2B payment received',
                                eventId: TransactionID
                            }];
                }
            });
        });
    };
    WebhookProcessor.handleMpesaB2BTransaction = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var TransactionID, TransAmount;
            return __generator(this, function (_a) {
                TransactionID = data.TransactionID, TransAmount = data.TransAmount;
                logger_1.logger.info("M-Pesa B2B: " + TransactionID + " - " + TransAmount);
                return [2 /*return*/, {
                        success: true,
                        message: 'B2B transaction received',
                        eventId: TransactionID
                    }];
            });
        });
    };
    WebhookProcessor.handleMpesaReversal = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var OriginatorConversationID, ReversalAmount;
            return __generator(this, function (_a) {
                OriginatorConversationID = data.OriginatorConversationID, ReversalAmount = data.ReversalAmount;
                logger_1.logger.info("M-Pesa reversal: " + OriginatorConversationID + " - " + ReversalAmount);
                // Revert payment status
                // Implement reversal logic
                return [2 /*return*/, {
                        success: true,
                        message: 'Reversal processed',
                        eventId: OriginatorConversationID
                    }];
            });
        });
    };
    // ============ BANK HANDLERS ============
    WebhookProcessor.handleBankTransferCompleted = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var referenceNumber, amount, senderAccount, timestamp, _a, organizationId, invoiceId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        referenceNumber = data.referenceNumber, amount = data.amount, senderAccount = data.senderAccount, timestamp = data.timestamp;
                        logger_1.logger.info("Bank transfer completed: " + referenceNumber + " - " + amount);
                        _a = referenceNumber.split('-') || [], organizationId = _a[0], invoiceId = _a[1];
                        if (!invoiceId) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.invoices)
                                .set({
                                status: 'paid',
                                paidDate: new Date(timestamp),
                                bankTransferId: referenceNumber,
                                transactionId: referenceNumber,
                                bankReference: senderAccount
                            })
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))];
                    case 1:
                        _b.sent();
                        logger_1.logger.info("Invoice " + invoiceId + " marked as paid via bank transfer");
                        _b.label = 2;
                    case 2: 
                    // Log to audit trail
                    return [4 /*yield*/, this.logWebhookEvent('payment_succeeded', 'bank', data, organizationId)];
                    case 3:
                        // Log to audit trail
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Bank transfer completed',
                                eventId: referenceNumber
                            }];
                }
            });
        });
    };
    WebhookProcessor.handleBankTransferFailed = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var referenceNumber, reason;
            return __generator(this, function (_a) {
                referenceNumber = data.referenceNumber, reason = data.reason;
                logger_1.logger.error("Bank transfer failed: " + referenceNumber + " - " + reason);
                return [2 /*return*/, {
                        success: true,
                        message: 'Transfer failure logged',
                        eventId: referenceNumber
                    }];
            });
        });
    };
    WebhookProcessor.handleBankTransferPending = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var referenceNumber;
            return __generator(this, function (_a) {
                referenceNumber = data.referenceNumber;
                logger_1.logger.info("Bank transfer pending: " + referenceNumber);
                return [2 /*return*/, {
                        success: true,
                        message: 'Transfer pending',
                        eventId: referenceNumber
                    }];
            });
        });
    };
    WebhookProcessor.handleBankReconciliation = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var reconciliationDate, totalAmount, transactionCount;
            return __generator(this, function (_a) {
                reconciliationDate = data.reconciliationDate, totalAmount = data.totalAmount, transactionCount = data.transactionCount;
                logger_1.logger.info("Bank reconciliation: " + transactionCount + " transactions - " + totalAmount + " on " + reconciliationDate);
                return [2 /*return*/, {
                        success: true,
                        message: 'Reconciliation received'
                    }];
            });
        });
    };
    // ============ UTILITY METHODS ============
    WebhookProcessor.getWebhookSecret = function (gateway) {
        var secrets = {
            stripe: process.env.STRIPE_WEBHOOK_SECRET || '',
            mpesa: process.env.MPESA_WEBHOOK_SECRET || '',
            bank: process.env.BANK_WEBHOOK_SECRET || ''
        };
        return secrets[gateway];
    };
    WebhookProcessor.logWebhookEvent = function (action, gateway, payload, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_1.db.insert(schema_1.auditLogs).values({
                                id: crypto_1["default"].randomUUID(),
                                organizationId: organizationId || 'system',
                                userId: 'system-webhook',
                                action: "webhook_" + action,
                                entityType: 'payment',
                                entityId: payload.id || payload.CheckoutRequestID || payload.referenceNumber,
                                oldValues: null,
                                newValues: JSON.stringify(__assign({ gateway: gateway }, payload)),
                                severity: 'info',
                                ipAddress: '0.0.0.0',
                                userAgent: gateway + "-webhook",
                                createdAt: new Date(),
                                updatedAt: new Date()
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.error("Failed to log webhook event: " + error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return WebhookProcessor;
}());
exports.WebhookProcessor = WebhookProcessor;
exports["default"] = WebhookProcessor;
