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
exports.initiateM2MPayment = exports.validateMpesaSignature = exports.handleMpesaConfirmation = exports.handleMpesaCallback = void 0;
var db_1 = require("~/server/db");
var schema_1 = require("~/server/db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var emailService_1 = require("~/server/email/emailService");
var logger_1 = require("~/server/utils/logger");
var crypto_1 = require("crypto");
/**
 * Handle M-Pesa STK Pop callback (from mobile device)
 */
function handleMpesaCallback(callbackData) {
    return __awaiter(this, void 0, void 0, function () {
        var stkCallback, checkoutRequestId, resultCode, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    stkCallback = callbackData.Body.stkCallback;
                    checkoutRequestId = stkCallback.CheckoutRequestID;
                    resultCode = stkCallback.ResultCode;
                    logger_1.logger.info('[M-Pesa] Processing STK callback', { checkoutRequestId: checkoutRequestId, resultCode: resultCode });
                    if (!(resultCode === 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, processMpesaPaymentSuccess(stkCallback)];
                case 1: 
                // Payment successful
                return [2 /*return*/, _a.sent()];
                case 2: return [4 /*yield*/, processMpesaPaymentFailure(stkCallback)];
                case 3: 
                // Payment failed
                return [2 /*return*/, _a.sent()];
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    logger_1.logger.error('[M-Pesa] Callback processing error:', error_1);
                    return [2 /*return*/, { received: true, processed: false, error: error_1 instanceof Error ? error_1.message : 'Unknown error' }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.handleMpesaCallback = handleMpesaCallback;
/**
 * Handle M-Pesa C2B confirmation (for payment confirmation)
 */
function handleMpesaConfirmation(confirmationData) {
    return __awaiter(this, void 0, void 0, function () {
        var invoiceId, amount, transactionId, invoice, subscription, nextBillingDate, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    invoiceId = confirmationData.BillRefNumber;
                    amount = confirmationData.TransAmount;
                    transactionId = confirmationData.TransID;
                    logger_1.logger.info('[M-Pesa] Processing confirmation', { invoiceId: invoiceId, amount: amount, transactionId: transactionId });
                    return [4 /*yield*/, db_1.db.query.invoices.findFirst({
                            where: drizzle_orm_1.eq(schema_1.invoices.id, invoiceId)
                        })];
                case 1:
                    invoice = _a.sent();
                    if (!invoice) {
                        logger_1.logger.warn('[M-Pesa] Invoice not found', { invoiceId: invoiceId });
                        return [2 /*return*/, { received: true, processed: false, error: 'Invoice not found' }];
                    }
                    // Verify amount matches
                    if (Math.abs(invoice.totalAmount - amount) > 0.01) {
                        logger_1.logger.warn('[M-Pesa] Amount mismatch', { expected: invoice.totalAmount, received: amount });
                        return [2 /*return*/, { received: true, processed: false, error: 'Amount mismatch' }];
                    }
                    // Update invoice
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.invoices)
                            .set({
                            status: 'paid',
                            paidDate: new Date(),
                            paymentMethod: 'mpesa',
                            mpesaTransactionId: transactionId,
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))];
                case 2:
                    // Update invoice
                    _a.sent();
                    return [4 /*yield*/, db_1.db.query.organizationSubscriptions.findFirst({
                            where: drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, invoice.organizationId)
                        })];
                case 3:
                    subscription = _a.sent();
                    if (!subscription) return [3 /*break*/, 5];
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
                            .where(drizzle_orm_1.eq(schema_1.organizationSubscriptions.organizationId, invoice.organizationId))];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: 
                // Send receipt email
                return [4 /*yield*/, emailService_1.sendEmail({
                        to: confirmationData.MSISDN + "@mpesa.local" || '',
                        subject: 'Payment Received - M-Pesa Receipt',
                        template: 'payment-received-mpesa',
                        context: {
                            invoiceId: invoiceId,
                            amount: amount.toFixed(2),
                            currency: 'KES',
                            transactionId: transactionId,
                            date: new Date().toLocaleDateString(),
                            msisdn: confirmationData.MSISDN
                        }
                    })];
                case 6:
                    // Send receipt email
                    _a.sent();
                    logger_1.logger.info('[M-Pesa] Payment confirmed', { invoiceId: invoiceId, amount: amount });
                    return [2 /*return*/, { received: true, processed: true }];
                case 7:
                    error_2 = _a.sent();
                    logger_1.logger.error('[M-Pesa] Confirmation processing error:', error_2);
                    return [2 /*return*/, { received: true, processed: false, error: error_2 instanceof Error ? error_2.message : 'Unknown error' }];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.handleMpesaConfirmation = handleMpesaConfirmation;
/**
 * Process successful M-Pesa payment from STK callback
 */
function processMpesaPaymentSuccess(stkCallback) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var callbackMetadata, metadataMap, invoiceId, amount, mpesaReceiptNumber, phoneNumber, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    callbackMetadata = ((_a = stkCallback.CallbackMetadata) === null || _a === void 0 ? void 0 : _a.Item) || [];
                    metadataMap = callbackMetadata.reduce(function (acc, item) {
                        acc[item.Name] = item.Value;
                        return acc;
                    }, {});
                    invoiceId = metadataMap.BillRefNumber;
                    amount = metadataMap.Amount;
                    mpesaReceiptNumber = metadataMap.MpesaReceiptNumber;
                    phoneNumber = metadataMap.PhoneNumber;
                    if (!invoiceId || !amount) {
                        logger_1.logger.warn('[M-Pesa] Missing metadata', { metadataMap: metadataMap });
                        return [2 /*return*/, { received: true, processed: false, error: 'Missing metadata' }];
                    }
                    // Update invoice
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.invoices)
                            .set({
                            status: 'paid',
                            paidDate: new Date(),
                            paymentMethod: 'mpesa',
                            mpesaTransactionId: mpesaReceiptNumber,
                            updatedAt: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))];
                case 1:
                    // Update invoice
                    _b.sent();
                    logger_1.logger.info('[M-Pesa] Payment success processed', { invoiceId: invoiceId, amount: amount });
                    return [2 /*return*/, { received: true, processed: true }];
                case 2:
                    error_3 = _b.sent();
                    logger_1.logger.error('[M-Pesa] Error processing payment success:', error_3);
                    return [2 /*return*/, { received: true, processed: false, error: error_3 instanceof Error ? error_3.message : 'Unknown error' }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Process failed M-Pesa payment
 */
function processMpesaPaymentFailure(stkCallback) {
    return __awaiter(this, void 0, void 0, function () {
        var resultDesc;
        return __generator(this, function (_a) {
            try {
                resultDesc = stkCallback.ResultDesc;
                logger_1.logger.warn('[M-Pesa] Payment failed', { resultDesc: resultDesc });
                // Could log failed attempt for analytics
                return [2 /*return*/, { received: true, processed: true }];
            }
            catch (error) {
                logger_1.logger.error('[M-Pesa] Error processing payment failure:', error);
                return [2 /*return*/, { received: true, processed: false, error: error instanceof Error ? error.message : 'Unknown error' }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Validate M-Pesa webhook signature (if using signed webhooks)
 */
function validateMpesaSignature(body, signature, publicKey) {
    try {
        var verifier = crypto_1["default"].createVerify('sha256');
        verifier.update(body);
        return verifier.verify(publicKey, signature, 'base64');
    }
    catch (error) {
        logger_1.logger.error('[M-Pesa] Signature validation error:', error);
        return false;
    }
}
exports.validateMpesaSignature = validateMpesaSignature;
/**
 * M-Pesa Payment Request (to initiate STK push)
 * Called by frontend to trigger M-Pesa payment
 */
function initiateM2MPayment(organizationId, invoiceId, phoneNumber, amount) {
    return __awaiter(this, void 0, Promise, function () {
        var accessToken, response, data, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getM2MAccessToken()];
                case 1:
                    accessToken = _a.sent();
                    return [4 /*yield*/, fetch('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer " + accessToken
                            },
                            body: JSON.stringify({
                                BusinessShortCode: process.env.MPESA_SHORTCODE,
                                Password: generateMpesaPassword(),
                                Timestamp: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14),
                                TransactionType: 'CustomerPayBillOnline',
                                Amount: Math.round(amount),
                                PartyA: "254" + phoneNumber.slice(-9),
                                PartyB: process.env.MPESA_SHORTCODE,
                                PhoneNumber: "254" + phoneNumber.slice(-9),
                                CallBackURL: process.env.API_URL + "/webhooks/mpesa/callback",
                                AccountReference: invoiceId,
                                TransactionDesc: "Invoice " + invoiceId + " for Organization " + organizationId
                            })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = (_a.sent());
                    if (data.ResponseCode === '0') {
                        logger_1.logger.info('[M-Pesa] STK push initiated', { invoiceId: invoiceId, phoneNumber: phoneNumber });
                        return [2 /*return*/, { success: true, checkoutRequestId: data.CheckoutRequestID }];
                    }
                    else {
                        logger_1.logger.warn('[M-Pesa] STK push failed', { error: data.errorMessage });
                        return [2 /*return*/, { success: false, error: data.errorMessage }];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    logger_1.logger.error('[M-Pesa] Error initiating payment:', error_4);
                    return [2 /*return*/, { success: false, error: error_4 instanceof Error ? error_4.message : 'Unknown error' }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.initiateM2MPayment = initiateM2MPayment;
/**
 * Get M-Pesa OAuth token
 */
function getM2MAccessToken() {
    return __awaiter(this, void 0, Promise, function () {
        var auth, response, data, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    auth = Buffer.from(process.env.MPESA_CONSUMER_KEY + ":" + process.env.MPESA_CONSUMER_SECRET).toString('base64');
                    return [4 /*yield*/, fetch('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
                            method: 'GET',
                            headers: {
                                Authorization: "Basic " + auth
                            }
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = (_a.sent());
                    return [2 /*return*/, data.access_token];
                case 3:
                    error_5 = _a.sent();
                    logger_1.logger.error('[M-Pesa] Error getting access token:', error_5);
                    throw error_5;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate M-Pesa password
 */
function generateMpesaPassword() {
    var timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    var data = "" + process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp;
    return Buffer.from(data).toString('base64');
}
