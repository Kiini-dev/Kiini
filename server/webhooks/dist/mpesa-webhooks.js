"use strict";
/**
 * M-Pesa Webhook Handlers
 * Handles payment callbacks from M-Pesa: STK completion, balance query, transaction confirmation
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
exports.mpesaWebhookRouter = void 0;
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var express_1 = require("express");
var schema_1 = require("../../drizzle/schema");
var crypto_1 = require("crypto");
exports.mpesaWebhookRouter = express_1.Router();
/**
 * Verify M-Pesa signature (optional but recommended)
 */
function verifyMpesaSignature(data, signature, shortcode, timestamp) {
    if (!process.env.MPESA_PASSKEY)
        return false;
    var input = shortcode + process.env.MPESA_PASSKEY + timestamp;
    var hash = crypto_1["default"].createHash("sha256").update(input).digest("base64");
    return hash === signature;
}
/**
 * Extract M-Pesa callback data
 */
function extractCallbackData(callbackData) {
    var _a, _b, _c;
    var result = {};
    if ((_c = (_b = (_a = callbackData.Body) === null || _a === void 0 ? void 0 : _a.stkCallback) === null || _b === void 0 ? void 0 : _b.CallbackMetadata) === null || _c === void 0 ? void 0 : _c.Item) {
        callbackData.Body.stkCallback.CallbackMetadata.Item.forEach(function (item) {
            result[item.Name] = item.Value;
        });
    }
    return result;
}
/**
 * Handle STK Push Callback (user completes payment on phone)
 */
function handleStkPushCallback(event) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var db, stkCallback, resultCode, resultDesc, metadata, invoiceId, organizationId_1, amount, mpesaCode, phoneNumber, subscriptionData, retryDate, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        console.error("❌ Database connection unavailable");
                        return [2 /*return*/];
                    }
                    stkCallback = (_a = event.Body) === null || _a === void 0 ? void 0 : _a.stkCallback;
                    resultCode = stkCallback === null || stkCallback === void 0 ? void 0 : stkCallback.ResultCode;
                    resultDesc = stkCallback === null || stkCallback === void 0 ? void 0 : stkCallback.ResultDesc;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 12, , 13]);
                    metadata = extractCallbackData(event);
                    invoiceId = metadata.InvoiceID;
                    organizationId_1 = metadata.OrganizationID;
                    amount = metadata.Amount;
                    mpesaCode = metadata.MpesaReceiptNumber;
                    phoneNumber = metadata.PhoneNumber;
                    if (!invoiceId || !organizationId_1) {
                        console.warn("⚠️ STK callback missing invoiceId or organizationId");
                        return [2 /*return*/];
                    }
                    if (!(resultCode === 0)) return [3 /*break*/, 8];
                    console.log("\u2705 M-Pesa payment successful: " + mpesaCode);
                    // Update invoice status to paid
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["UPDATE invoices \n            SET status = 'paid', \n                paymentDate = NOW(),\n                paymentMethod = 'mpesa',\n                transactionReference = ", "\n            WHERE id = ", ""], ["UPDATE invoices \n            SET status = 'paid', \n                paymentDate = NOW(),\n                paymentMethod = 'mpesa',\n                transactionReference = ", "\n            WHERE id = ", ""])), mpesaCode, invoiceId))];
                case 3:
                    // Update invoice status to paid
                    _b.sent();
                    // Create audit log
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            organizationId: organizationId_1,
                            userId: "mpesa-webhook",
                            action: "payment_received",
                            entityType: "invoice",
                            entityId: invoiceId,
                            severity: "info",
                            ipAddress: "mpesa",
                            userAgent: "M-Pesa Webhook",
                            timestamp: new Date(),
                            details: JSON.stringify({
                                mpesaCode: mpesaCode,
                                phoneNumber: phoneNumber,
                                amount: amount,
                                transactionType: "STK Push"
                            })
                        })];
                case 4:
                    // Create audit log
                    _b.sent();
                    return [4 /*yield*/, db.query.organizationSubscriptions.findFirst({
                            where: function (sub, _a) {
                                var eq = _a.eq;
                                return eq(sub.organizationId, organizationId_1);
                            }
                        })];
                case 5:
                    subscriptionData = _b.sent();
                    if (!((subscriptionData === null || subscriptionData === void 0 ? void 0 : subscriptionData.trialEndDate) && new Date(subscriptionData.trialEndDate) > new Date())) return [3 /*break*/, 7];
                    // Convert trial to paid
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["UPDATE organizationSubscriptions \n              SET trialEndDate = NULL, \n                  subscriptionStatus = 'active',\n                  nextBillingDate = DATE_ADD(NOW(), INTERVAL ", " MONTH),\n                  lastPaymentDate = NOW()\n              WHERE organizationId = ", ""], ["UPDATE organizationSubscriptions \n              SET trialEndDate = NULL, \n                  subscriptionStatus = 'active',\n                  nextBillingDate = DATE_ADD(NOW(), INTERVAL ", " MONTH),\n                  lastPaymentDate = NOW()\n              WHERE organizationId = ", ""])), subscriptionData.billingCycleMonths, organizationId_1))];
                case 6:
                    // Convert trial to paid
                    _b.sent();
                    console.log("\u2705 Trial converted to paid via M-Pesa for organization " + organizationId_1);
                    _b.label = 7;
                case 7: return [3 /*break*/, 11];
                case 8:
                    // Payment failed (ResultCode > 0)
                    console.warn("\u26A0\uFE0F M-Pesa payment failed: " + resultDesc + " (Code: " + resultCode + ")");
                    retryDate = new Date();
                    retryDate.setDate(retryDate.getDate() + 2); // Retry in 2 days
                    return [4 /*yield*/, db.insert(schema_1.paymentTriggers).values({
                            organizationId: organizationId_1,
                            invoiceId: invoiceId,
                            triggerType: "payment_retry",
                            triggerDate: retryDate,
                            status: "pending",
                            actionType: "email_reminder",
                            retryCount: 1,
                            metadata: JSON.stringify({
                                failureReason: resultDesc,
                                resultCode: resultCode,
                                mpesaCheckoutRequestId: stkCallback.CheckoutRequestID
                            })
                        })];
                case 9:
                    _b.sent();
                    // Create audit log for failure
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            organizationId: organizationId_1,
                            userId: "mpesa-webhook",
                            action: "payment_failed",
                            entityType: "invoice",
                            entityId: invoiceId,
                            severity: "warning",
                            ipAddress: "mpesa",
                            userAgent: "M-Pesa Webhook",
                            timestamp: new Date(),
                            details: JSON.stringify({
                                resultCode: resultCode,
                                resultDesc: resultDesc,
                                retryScheduledFor: retryDate.toISOString()
                            })
                        })];
                case 10:
                    // Create audit log for failure
                    _b.sent();
                    _b.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_1 = _b.sent();
                    console.error("❌ Error handling STK Push callback:", error_1);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle C2B Confirmation (Direct Payment)
 * Used when customer sends money directly to paybill
 */
function handleC2bConfirmation(event) {
    return __awaiter(this, void 0, void 0, function () {
        var db, billRef_1, organizationId_2, amount, mpesaCode, phoneNumber, targetInvoice, subscriptionData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error("❌ Database connection unavailable");
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 11, , 12]);
                    billRef_1 = event.BillRefNumber || event.InvoiceNumber;
                    organizationId_2 = event.OrgAccountID;
                    amount = parseFloat(event.TransAmount);
                    mpesaCode = event.TransID;
                    phoneNumber = event.MSISDN;
                    if (!organizationId_2 || !billRef_1) {
                        console.warn("⚠️ C2B confirmation missing organizationId or billRef");
                        return [2 /*return*/];
                    }
                    console.log("\u2705 C2B Confirmation received: " + mpesaCode + " for " + billRef_1);
                    return [4 /*yield*/, db.query.invoices.findFirst({
                            where: function (inv, _a) {
                                var eq = _a.eq;
                                return eq(inv.referenceNumber, billRef_1);
                            }
                        })];
                case 3:
                    targetInvoice = _a.sent();
                    if (!!targetInvoice) return [3 /*break*/, 5];
                    console.warn("\u26A0\uFE0F No invoice found for bill reference: " + billRef_1);
                    // Create audit log for unmatched payment
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            organizationId: organizationId_2,
                            userId: "mpesa-webhook",
                            action: "payment_unmatched",
                            entityType: "payment",
                            entityId: mpesaCode,
                            severity: "warning",
                            ipAddress: "mpesa",
                            userAgent: "M-Pesa Webhook",
                            timestamp: new Date(),
                            details: JSON.stringify({
                                mpesaCode: mpesaCode,
                                phoneNumber: phoneNumber,
                                amount: amount,
                                billRef: billRef_1,
                                message: "Payment received but no matching invoice found"
                            })
                        })];
                case 4:
                    // Create audit log for unmatched payment
                    _a.sent();
                    return [2 /*return*/];
                case 5: 
                // Update invoice
                return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["UPDATE invoices \n          SET status = 'paid',\n              paymentDate = NOW(),\n              paymentMethod = 'mpesa',\n              transactionReference = ", ",\n              amountPaid = ", "\n          WHERE id = ", ""], ["UPDATE invoices \n          SET status = 'paid',\n              paymentDate = NOW(),\n              paymentMethod = 'mpesa',\n              transactionReference = ", ",\n              amountPaid = ", "\n          WHERE id = ", ""])), mpesaCode, amount, targetInvoice.id))];
                case 6:
                    // Update invoice
                    _a.sent();
                    // Create audit log
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            organizationId: organizationId_2,
                            userId: "mpesa-webhook",
                            action: "payment_received",
                            entityType: "invoice",
                            entityId: targetInvoice.id,
                            severity: "info",
                            ipAddress: "mpesa",
                            userAgent: "M-Pesa Webhook",
                            timestamp: new Date(),
                            details: JSON.stringify({
                                mpesaCode: mpesaCode,
                                phoneNumber: phoneNumber,
                                amount: amount,
                                transactionType: "C2B Confirmation"
                            })
                        })];
                case 7:
                    // Create audit log
                    _a.sent();
                    return [4 /*yield*/, db.query.organizationSubscriptions.findFirst({
                            where: function (sub, _a) {
                                var eq = _a.eq;
                                return eq(sub.organizationId, organizationId_2);
                            }
                        })];
                case 8:
                    subscriptionData = _a.sent();
                    if (!((subscriptionData === null || subscriptionData === void 0 ? void 0 : subscriptionData.trialEndDate) && new Date(subscriptionData.trialEndDate) > new Date())) return [3 /*break*/, 10];
                    return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["UPDATE organizationSubscriptions \n            SET trialEndDate = NULL,\n                subscriptionStatus = 'active',\n                nextBillingDate = DATE_ADD(NOW(), INTERVAL ", " MONTH),\n                lastPaymentDate = NOW()\n            WHERE organizationId = ", ""], ["UPDATE organizationSubscriptions \n            SET trialEndDate = NULL,\n                subscriptionStatus = 'active',\n                nextBillingDate = DATE_ADD(NOW(), INTERVAL ", " MONTH),\n                lastPaymentDate = NOW()\n            WHERE organizationId = ", ""])), subscriptionData.billingCycleMonths, organizationId_2))];
                case 9:
                    _a.sent();
                    console.log("\u2705 Trial converted via C2B for organization " + organizationId_2);
                    _a.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_2 = _a.sent();
                    console.error("❌ Error handling C2B confirmation:", error_2);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle Validation Request
 * M-Pesa sends this to validate before processing C2B
 */
function handleValidationRequest(event) {
    return __awaiter(this, void 0, void 0, function () {
        var db, billRef_2, invoice, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error("❌ Database connection unavailable");
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    billRef_2 = event.BillRefNumber || event.InvoiceNumber;
                    return [4 /*yield*/, db.query.invoices.findFirst({
                            where: function (inv, _a) {
                                var eq = _a.eq;
                                return eq(inv.referenceNumber, billRef_2);
                            }
                        })];
                case 3:
                    invoice = _a.sent();
                    if (invoice) {
                        // Validation successful - M-Pesa will proceed with confirmation
                        console.log("\u2705 Validation successful for invoice: " + billRef_2);
                        return [2 /*return*/, { ResultCode: 0, ResultDesc: "Validation successful" }];
                    }
                    else {
                        // Validation failed - reject the payment
                        console.warn("\u26A0\uFE0F Validation failed for invoice: " + billRef_2);
                        return [2 /*return*/, { ResultCode: 1, ResultDesc: "Invalid bill reference" }];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error("❌ Error handling validation request:", error_3);
                    return [2 /*return*/, { ResultCode: 1, ResultDesc: "Validation error" }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Main M-Pesa webhook endpoint
 */
exports.mpesaWebhookRouter.post("/mpesa", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var event, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                console.log("\uD83D\uDCE8 Received M-Pesa webhook event");
                event = req.body;
                if (!((_a = event.Body) === null || _a === void 0 ? void 0 : _a.stkCallback)) return [3 /*break*/, 2];
                // STK Push callback
                return [4 /*yield*/, handleStkPushCallback(event)];
            case 1:
                // STK Push callback
                _b.sent();
                return [3 /*break*/, 4];
            case 2:
                if (!event.TransactionType) return [3 /*break*/, 4];
                if (!(event.TransactionType === "Pay Bill Online")) return [3 /*break*/, 4];
                return [4 /*yield*/, handleC2bConfirmation(event)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                // Always return 200 OK
                res.status(200).json({
                    ResultCode: 0,
                    ResultDesc: "Webhook received successfully"
                });
                return [3 /*break*/, 6];
            case 5:
                error_4 = _b.sent();
                console.error("❌ Error processing M-Pesa webhook:", error_4);
                res.status(200).json({
                    ResultCode: 1,
                    ResultDesc: "Webhook processing error"
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports["default"] = exports.mpesaWebhookRouter;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
