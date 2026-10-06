"use strict";
/**
 * M-Pesa Payment Service (MPesa Daraja API)
 * Handles STK Push, payment confirmation, and transaction tracking
 *
 * Environment Variables Required:
 * - MPESA_CONSUMER_KEY: Daraja API consumer key
 * - MPESA_CONSUMER_SECRET: Daraja API consumer secret
 * - MPESA_BUSINESS_SHORT_CODE: Your business short code
 * - MPESA_PASSKEY: LNM passkey for STK push
 * - MPESA_ENVIRONMENT: 'sandbox' or 'production'
 * - MPESA_CALLBACK_URL: Webhook URL for payment callbacks
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
exports.getMPesaStatus = exports.handleCallback = exports.queryTransactionStatus = exports.initiateSTKPush = void 0;
var axios_1 = require("axios");
var server_1 = require("@trpc/server");
var db = require("../db");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
// Helper: read mpesa setting from DB (category "payment_mpesa")
function getMpesaSetting(key) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var database, rows, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    database = db_1.getDb();
                    return [4 /*yield*/, database.select().from(schema_1.settings)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.settings.category, "payment_mpesa"), drizzle_orm_1.eq(schema_1.settings.key, key)))
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
var MPesaService = /** @class */ (function () {
    function MPesaService() {
        this.accessToken = null;
        this.tokenExpiry = 0;
        this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
        this.consumerKey = process.env.MPESA_CONSUMER_KEY || '';
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
        this.businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE || '';
        this.passkey = process.env.MPESA_PASSKEY || '';
        this.callbackUrl = process.env.MPESA_CALLBACK_URL || '';
        var baseURL = this.environment === 'sandbox'
            ? 'https://sandbox.safaricom.co.ke'
            : 'https://api.safaricom.co.ke';
        this.apiClient = axios_1["default"].create({
            baseURL: baseURL,
            timeout: 10000
        });
    }
    /**
     * Load missing config from settings table if env vars not set
     */
    MPesaService.prototype.ensureConfig = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!!this.consumerKey) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, getMpesaSetting("consumerKey")];
                    case 1:
                        _a.consumerKey = (_f.sent()) || '';
                        _f.label = 2;
                    case 2:
                        if (!!this.consumerSecret) return [3 /*break*/, 4];
                        _b = this;
                        return [4 /*yield*/, getMpesaSetting("consumerSecret")];
                    case 3:
                        _b.consumerSecret = (_f.sent()) || '';
                        _f.label = 4;
                    case 4:
                        if (!!this.businessShortCode) return [3 /*break*/, 6];
                        _c = this;
                        return [4 /*yield*/, getMpesaSetting("shortCode")];
                    case 5:
                        _c.businessShortCode = (_f.sent()) || '';
                        _f.label = 6;
                    case 6:
                        if (!!this.passkey) return [3 /*break*/, 8];
                        _d = this;
                        return [4 /*yield*/, getMpesaSetting("passkey")];
                    case 7:
                        _d.passkey = (_f.sent()) || '';
                        _f.label = 8;
                    case 8:
                        if (!!this.callbackUrl) return [3 /*break*/, 10];
                        _e = this;
                        return [4 /*yield*/, getMpesaSetting("callbackUrl")];
                    case 9:
                        _e.callbackUrl = (_f.sent()) || '';
                        _f.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get access token from Daraja API
     */
    MPesaService.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, Promise, function () {
            var now, credentials, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureConfig()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        now = Date.now();
                        // Return cached token if still valid
                        if (this.accessToken && this.tokenExpiry > now) {
                            return [2 /*return*/, this.accessToken];
                        }
                        credentials = Buffer.from(this.consumerKey + ":" + this.consumerSecret).toString('base64');
                        return [4 /*yield*/, this.apiClient.get('/oauth/v1/generate?grant_type=client_credentials', {
                                headers: {
                                    Authorization: "Basic " + credentials
                                }
                            })];
                    case 3:
                        response = _a.sent();
                        this.accessToken = response.data.access_token;
                        this.tokenExpiry = now + (response.data.expires_in * 1000);
                        return [2 /*return*/, this.accessToken];
                    case 4:
                        error_1 = _a.sent();
                        console.error('[M-Pesa] Token generation error:', error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to authenticate with M-Pesa'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initiate STK Push for payment collection
     */
    MPesaService.prototype.initiateSTKPush = function (input) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var token, timestamp, password, payload, response, database, mpesaTransactions, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        if (!this.businessShortCode || !this.passkey) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'M-Pesa is not properly configured'
                            });
                        }
                        // Validate phone number (Kenya format)
                        if (!this.validateKenyanPhoneNumber(input.phoneNumber)) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Invalid Kenyan phone number'
                            });
                        }
                        return [4 /*yield*/, this.getAccessToken()];
                    case 1:
                        token = _c.sent();
                        timestamp = new Date().toISOString().replace(/[:-]/g, '').slice(0, 14);
                        password = Buffer.from("" + this.businessShortCode + this.passkey + timestamp).toString('base64');
                        payload = {
                            BusinessShortCode: this.businessShortCode,
                            Password: password,
                            Timestamp: timestamp,
                            TransactionType: 'CustomerPayBillOnline',
                            Amount: Math.floor(input.amount),
                            PartyA: this.formatPhoneNumber(input.phoneNumber),
                            PartyB: this.businessShortCode,
                            PhoneNumber: this.formatPhoneNumber(input.phoneNumber),
                            CallBackURL: this.callbackUrl,
                            AccountReference: input.accountReference,
                            TransactionDesc: input.description || "Invoice " + input.invoiceId
                        };
                        return [4 /*yield*/, this.apiClient.post('/mpesa/stkpush/v1/processrequest', payload, {
                                headers: {
                                    Authorization: "Bearer " + token,
                                    'Content-Type': 'application/json'
                                }
                            })];
                    case 2:
                        response = _c.sent();
                        return [4 /*yield*/, db.getDb()];
                    case 3:
                        database = _c.sent();
                        if (!database) return [3 /*break*/, 6];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 4:
                        mpesaTransactions = (_c.sent()).mpesaTransactions;
                        return [4 /*yield*/, database.insert(mpesaTransactions).values({
                                id: uuid_1.v4(),
                                checkoutRequestId: response.data.CheckoutRequestID,
                                invoiceId: input.invoiceId,
                                clientId: input.clientId,
                                phoneNumber: input.phoneNumber,
                                amount: Math.floor(input.amount),
                                businessShortCode: this.businessShortCode,
                                status: 'pending'
                            })];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [2 /*return*/, {
                            success: response.data.ResponseCode === '0',
                            checkoutRequestId: response.data.CheckoutRequestID,
                            merchantRequestId: response.data.MerchantRequestID,
                            customerMessage: response.data.CustomerMessage,
                            responseDescription: response.data.ResponseDescription
                        }];
                    case 7:
                        error_2 = _c.sent();
                        console.error('[M-Pesa] STK Push error:', error_2);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: ((_b = (_a = error_2 === null || error_2 === void 0 ? void 0 : error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errorMessage) || 'STK Push failed'
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Query transaction status
     */
    MPesaService.prototype.queryTransactionStatus = function (checkoutRequestId) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var token, timestamp, password, payload, response, status, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getAccessToken()];
                    case 1:
                        token = _b.sent();
                        timestamp = new Date().toISOString().replace(/[:-]/g, '').slice(0, 14);
                        password = Buffer.from("" + this.businessShortCode + this.passkey + timestamp).toString('base64');
                        payload = {
                            BusinessShortCode: this.businessShortCode,
                            Password: password,
                            Timestamp: timestamp,
                            CheckoutRequestID: checkoutRequestId
                        };
                        return [4 /*yield*/, this.apiClient.post('/mpesa/stkpushquery/v1/query', payload, {
                                headers: {
                                    Authorization: "Bearer " + token,
                                    'Content-Type': 'application/json'
                                }
                            })];
                    case 2:
                        response = _b.sent();
                        status = response.data.ResponseCode === '0' ? 'completed' : 'pending';
                        return [2 /*return*/, {
                                transactionId: checkoutRequestId,
                                phoneNumber: response.data.PhoneNumber || '',
                                status: status,
                                mpesaReceiptNumber: response.data.MpesaReceiptNumber,
                                amount: ((_a = response.data.ResultDesc) === null || _a === void 0 ? void 0 : _a.includes('completed')) ? parseFloat(response.data.CheckoutRequestID) || undefined
                                    : undefined,
                                transactionDate: response.data.TransactionDate,
                                resultDescription: response.data.ResultDesc
                            }];
                    case 3:
                        error_3 = _b.sent();
                        console.error('[M-Pesa] Query status error:', error_3);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to query transaction status'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle callback from M-Pesa
     */
    MPesaService.prototype.handleCallback = function (body) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function () {
            var database, mpesaTransactions, eq_1, result, checkoutRequestId, resultCode, resultDescription, transaction, newStatus, error_4;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _h.sent();
                        if (!database) {
                            throw new Error('Database connection lost');
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        mpesaTransactions = (_h.sent()).mpesaTransactions;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        eq_1 = (_h.sent()).eq;
                        result = ((_a = body.Body) === null || _a === void 0 ? void 0 : _a.stkCallback) || body;
                        checkoutRequestId = result.CheckoutRequestID;
                        resultCode = result.ResultCode;
                        resultDescription = result.ResultDesc || '';
                        return [4 /*yield*/, database.select()
                                .from(mpesaTransactions)
                                .where(eq_1(mpesaTransactions.checkoutRequestId, checkoutRequestId))
                                .limit(1)];
                    case 4:
                        transaction = _h.sent();
                        if (!(transaction.length > 0)) return [3 /*break*/, 6];
                        newStatus = resultCode === 0 ? 'completed' : 'failed';
                        return [4 /*yield*/, database.update(mpesaTransactions)
                                .set({
                                status: newStatus,
                                resultCode: resultCode,
                                resultDescription: resultDescription,
                                mpesaReceiptNumber: (_d = (_c = (_b = result.CallbackMetadata) === null || _b === void 0 ? void 0 : _b.Item) === null || _c === void 0 ? void 0 : _c.find(function (item) { return item.Name === 'MpesaReceiptNumber'; })) === null || _d === void 0 ? void 0 : _d.Value,
                                transactionDate: (_g = (_f = (_e = result.CallbackMetadata) === null || _e === void 0 ? void 0 : _e.Item) === null || _f === void 0 ? void 0 : _f.find(function (item) { return item.Name === 'TransactionDate'; })) === null || _g === void 0 ? void 0 : _g.Value,
                                completedAt: new Date()
                            })
                                .where(eq_1(mpesaTransactions.id, transaction[0].id))];
                    case 5:
                        _h.sent();
                        _h.label = 6;
                    case 6: return [2 /*return*/, { processed: true, checkoutRequestId: checkoutRequestId, status: resultCode === 0 ? 'success' : 'failed' }];
                    case 7:
                        error_4 = _h.sent();
                        console.error('[M-Pesa] Callback processing error:', error_4);
                        throw error_4;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate Kenyan phone number
     */
    MPesaService.prototype.validateKenyanPhoneNumber = function (phoneNumber) {
        var pattern = /^(?:\+254|0)[1-9]\d{8}$/;
        return pattern.test(phoneNumber);
    };
    /**
     * Format phone number to M-Pesa standard (254...)
     */
    MPesaService.prototype.formatPhoneNumber = function (phoneNumber) {
        var formatted = phoneNumber.replace(/\D/g, '');
        if (formatted.startsWith('0')) {
            formatted = '254' + formatted.slice(1);
        }
        else if (!formatted.startsWith('254')) {
            formatted = '254' + formatted;
        }
        return formatted;
    };
    /**
     * Get M-Pesa service status
     */
    MPesaService.prototype.getStatus = function () {
        return {
            isConfigured: !!(this.consumerKey && this.consumerSecret && this.businessShortCode),
            environment: this.environment,
            hasCallbackUrl: !!this.callbackUrl
        };
    };
    return MPesaService;
}());
// Singleton instance
var mpesaService = new MPesaService();
exports["default"] = mpesaService;
exports.initiateSTKPush = function (input) { return mpesaService.initiateSTKPush(input); };
exports.queryTransactionStatus = function (checkoutRequestId) {
    return mpesaService.queryTransactionStatus(checkoutRequestId);
};
exports.handleCallback = function (body) { return mpesaService.handleCallback(body); };
exports.getMPesaStatus = function () { return mpesaService.getStatus(); };
