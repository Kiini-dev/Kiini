"use strict";
/**
 * SMS Service with Queue Management (Africa's Talking)
 * Handles SMS queuing, delivery tracking, and customer preferences
 *
 * Environment Variables Required:
 * - SMS_PROVIDER: 'africa_talking' or 'twilio'
 * - AFRICA_TALKING_API_KEY: Africa's Talking API key
 * - AFRICA_TALKING_USERNAME: Africa's Talking username
 * - AFRICA_TALKING_SHORT_CODE: SMS short code
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
exports.updateCustomerPreferences = exports.getCustomerPreferences = exports.getSmsStatus = exports.getSmsQueueStatus = exports.processSmsQueue = exports.sendSmsImmediately = exports.queueSms = void 0;
var axios_1 = require("axios");
var server_1 = require("@trpc/server");
var db = require("../db");
var uuid_1 = require("uuid");
var SMSService = /** @class */ (function () {
    function SMSService() {
        this.isConfigured = false;
        this.provider = process.env.SMS_PROVIDER || 'africa_talking';
        this.apiKey = process.env.AFRICA_TALKING_API_KEY || '';
        this.username = process.env.AFRICA_TALKING_USERNAME || '';
        this.shortCode = process.env.AFRICA_TALKING_SHORT_CODE || '';
        this.apiClient = axios_1["default"].create({
            baseURL: 'https://api.africastalking.com/version1',
            timeout: 10000
        });
        if (this.apiKey && this.username && this.shortCode) {
            this.isConfigured = true;
            console.log('[SMS] Service initialized successfully');
        }
        else {
            console.warn('[SMS] Africa\'s Talking credentials not configured - SMS will be queued but not sent');
        }
    }
    /**
     * Queue an SMS for sending
     */
    SMSService.prototype.queueSms = function (input) {
        return __awaiter(this, void 0, Promise, function () {
            var database, smsQueue, queueId, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _a.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Database connection failed'
                            });
                        }
                        // Validate phone number
                        if (!this.isValidPhoneNumber(input.phoneNumber)) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Invalid phone number format'
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        smsQueue = (_a.sent()).smsQueue;
                        queueId = uuid_1.v4();
                        return [4 /*yield*/, database.insert(smsQueue).values({
                                id: queueId,
                                phoneNumber: input.phoneNumber,
                                message: input.message,
                                provider: this.provider,
                                status: 'pending',
                                relatedEntityType: input.relatedEntityType,
                                relatedEntityId: input.relatedEntityId,
                                organizationId: input.organizationId,
                                createdBy: input.createdBy,
                                templateId: input.templateId,
                                batchId: input.batchId,
                                metadata: input.metadata || null,
                                attemptCount: 0,
                                maxAttempts: 3
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, { queueId: queueId, success: true }];
                    case 4:
                        error_1 = _a.sent();
                        console.error('[SMS] Queue error:', error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_1 instanceof Error ? error_1.message : 'Failed to queue SMS'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send SMS immediately (bypasses queue)
     */
    SMSService.prototype.sendSmsImmediately = function (phoneNumber, message) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var response, responseData, success, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.isConfigured) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'SMS service is not configured'
                            });
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.apiClient.post('/messaging', {
                                username: this.username,
                                to: this.formatPhoneNumber(phoneNumber),
                                message: message.slice(0, 160)
                            }, {
                                headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    apiKey: this.apiKey
                                }
                            })];
                    case 2:
                        response = _c.sent();
                        responseData = (_b = (_a = response.data.SMSMessageData) === null || _a === void 0 ? void 0 : _a.Recipients) === null || _b === void 0 ? void 0 : _b[0];
                        success = (responseData === null || responseData === void 0 ? void 0 : responseData.statusCode) === 0;
                        return [2 /*return*/, {
                                success: success,
                                reference: responseData === null || responseData === void 0 ? void 0 : responseData.messageId
                            }];
                    case 3:
                        error_2 = _c.sent();
                        console.error('[SMS] Send error:', error_2);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_2 instanceof Error ? error_2.message : 'Failed to send SMS'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process SMS queue (background job)
     */
    SMSService.prototype.processSmsQueue = function (batchSize) {
        if (batchSize === void 0) { batchSize = 20; }
        return __awaiter(this, void 0, Promise, function () {
            var database, smsQueue, _a, eq, and, or, lt, now, pendingSms, sent, failed, _i, pendingSms_1, sms, result, error_3, attemptCount, maxAttempts, delaySeconds, nextRetry, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isConfigured) {
                            console.warn('[SMS] SMS service not configured - skipping queue processing');
                            return [2 /*return*/, { sent: 0, failed: 0 }];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 20, , 21]);
                        return [4 /*yield*/, db.getDb()];
                    case 2:
                        database = _b.sent();
                        if (!database) {
                            throw new Error('Database connection lost');
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        smsQueue = (_b.sent()).smsQueue;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 4:
                        _a = _b.sent(), eq = _a.eq, and = _a.and, or = _a.or, lt = _a.lt;
                        now = new Date();
                        return [4 /*yield*/, database.select()
                                .from(smsQueue)
                                .where(and(eq(smsQueue.status, 'pending'), or(eq(smsQueue.nextRetryAt, null), lt(smsQueue.nextRetryAt, now))))
                                .limit(batchSize)];
                    case 5:
                        pendingSms = _b.sent();
                        sent = 0;
                        failed = 0;
                        _i = 0, pendingSms_1 = pendingSms;
                        _b.label = 6;
                    case 6:
                        if (!(_i < pendingSms_1.length)) return [3 /*break*/, 19];
                        sms = pendingSms_1[_i];
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, 13, , 18]);
                        // Update status to sending
                        return [4 /*yield*/, database.update(smsQueue)
                                .set({ status: 'queued' })
                                .where(eq(smsQueue.id, sms.id))];
                    case 8:
                        // Update status to sending
                        _b.sent();
                        return [4 /*yield*/, this.sendSmsImmediately(sms.phoneNumber, sms.message)];
                    case 9:
                        result = _b.sent();
                        if (!result.success) return [3 /*break*/, 11];
                        // Mark as sent (delivery status will be updated by callback)
                        return [4 /*yield*/, database.update(smsQueue)
                                .set({
                                status: 'sent',
                                sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                providerReference: result.reference
                            })
                                .where(eq(smsQueue.id, sms.id))];
                    case 10:
                        // Mark as sent (delivery status will be updated by callback)
                        _b.sent();
                        sent++;
                        return [3 /*break*/, 12];
                    case 11: throw new Error('Provider returned non-success status');
                    case 12: return [3 /*break*/, 18];
                    case 13:
                        error_3 = _b.sent();
                        failed++;
                        attemptCount = (sms.attemptCount || 0) + 1;
                        maxAttempts = sms.maxAttempts || 3;
                        if (!(attemptCount < maxAttempts)) return [3 /*break*/, 15];
                        delaySeconds = [60, 300, 900][attemptCount - 1] || 900;
                        nextRetry = new Date(now.getTime() + delaySeconds * 1000);
                        return [4 /*yield*/, database.update(smsQueue)
                                .set({
                                status: 'pending',
                                attemptCount: attemptCount,
                                nextRetryAt: nextRetry,
                                failureReason: error_3 instanceof Error ? error_3.message : String(error_3)
                            })
                                .where(eq(smsQueue.id, sms.id))];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 17];
                    case 15: 
                    // Max retries exhausted
                    return [4 /*yield*/, database.update(smsQueue)
                            .set({
                            status: 'failed',
                            attemptCount: attemptCount,
                            failureReason: "Failed after " + maxAttempts + " attempts"
                        })
                            .where(eq(smsQueue.id, sms.id))];
                    case 16:
                        // Max retries exhausted
                        _b.sent();
                        _b.label = 17;
                    case 17: return [3 /*break*/, 18];
                    case 18:
                        _i++;
                        return [3 /*break*/, 6];
                    case 19: return [2 /*return*/, { sent: sent, failed: failed }];
                    case 20:
                        error_4 = _b.sent();
                        console.error('[SMS] Queue processing error:', error_4);
                        return [2 /*return*/, { sent: 0, failed: 0 }];
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get SMS queue status
     */
    SMSService.prototype.getQueueStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var database, smsQueue, messages, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _a.sent();
                        if (!database)
                            throw new Error('Database connection lost');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        smsQueue = (_a.sent()).smsQueue;
                        return [4 /*yield*/, database.select().from(smsQueue)];
                    case 3:
                        messages = _a.sent();
                        return [2 /*return*/, {
                                pending: messages.filter(function (m) { return m.status === 'pending'; }).length,
                                queued: messages.filter(function (m) { return m.status === 'queued'; }).length,
                                sent: messages.filter(function (m) { return m.status === 'sent'; }).length,
                                delivered: messages.filter(function (m) { return m.status === 'delivered'; }).length,
                                failed: messages.filter(function (m) { return m.status === 'failed'; }).length
                            }];
                    case 4:
                        error_5 = _a.sent();
                        console.error('[SMS] Queue status error:', error_5);
                        return [2 /*return*/, { pending: 0, queued: 0, sent: 0, delivered: 0, failed: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get customer SMS preferences
     */
    SMSService.prototype.getCustomerPreferences = function (clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var database, smsCustomerPreferences, eq, prefs, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _a.sent();
                        if (!database)
                            throw new Error('Database connection lost');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        smsCustomerPreferences = (_a.sent()).smsCustomerPreferences;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        eq = (_a.sent()).eq;
                        return [4 /*yield*/, database.select()
                                .from(smsCustomerPreferences)
                                .where(eq(smsCustomerPreferences.clientId, clientId))
                                .limit(1)];
                    case 4:
                        prefs = _a.sent();
                        return [2 /*return*/, prefs[0] || null];
                    case 5:
                        error_6 = _a.sent();
                        console.error('[SMS] Get preferences error:', error_6);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update customer SMS preferences
     */
    SMSService.prototype.updateCustomerPreferences = function (clientId, preferences) {
        return __awaiter(this, void 0, void 0, function () {
            var database, smsCustomerPreferences, eq, existing, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _a.sent();
                        if (!database)
                            throw new Error('Database connection lost');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        smsCustomerPreferences = (_a.sent()).smsCustomerPreferences;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        eq = (_a.sent()).eq;
                        return [4 /*yield*/, database.select()
                                .from(smsCustomerPreferences)
                                .where(eq(smsCustomerPreferences.clientId, clientId))];
                    case 4:
                        existing = _a.sent();
                        if (!(existing.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, database.update(smsCustomerPreferences)
                                .set(preferences)
                                .where(eq(smsCustomerPreferences.clientId, clientId))];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, database.insert(smsCustomerPreferences).values(__assign({ id: uuid_1.v4(), clientId: clientId }, preferences))];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/, { success: true }];
                    case 9:
                        error_7 = _a.sent();
                        console.error('[SMS] Update preferences error:', error_7);
                        throw error_7;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle delivery callback
     */
    SMSService.prototype.handleDeliveryCallback = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var database, smsQueue, smsDeliveryEvents, eq, message, status, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _a.sent();
                        if (!database)
                            throw new Error('Database connection lost');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        smsQueue = (_a.sent()).smsQueue;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        smsDeliveryEvents = (_a.sent()).smsDeliveryEvents;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 4:
                        eq = (_a.sent()).eq;
                        return [4 /*yield*/, database.select()
                                .from(smsQueue)
                                .where(eq(smsQueue.providerReference, data.id))
                                .limit(1)];
                    case 5:
                        message = _a.sent();
                        if (!(message.length > 0)) return [3 /*break*/, 8];
                        status = data.status === 'Success' ? 'delivered' : 'failed';
                        return [4 /*yield*/, database.update(smsQueue)
                                .set({
                                status: status,
                                deliveredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                deliveryStatus: data.status
                            })
                                .where(eq(smsQueue.id, message[0].id))];
                    case 6:
                        _a.sent();
                        // Log event
                        return [4 /*yield*/, database.insert(smsDeliveryEvents).values({
                                id: uuid_1.v4(),
                                queueId: message[0].id,
                                eventType: status,
                                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                metadata: { data: data }
                            })];
                    case 7:
                        // Log event
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/, { processed: true }];
                    case 9:
                        error_8 = _a.sent();
                        console.error('[SMS] Callback processing error:', error_8);
                        throw error_8;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate phone number format
     */
    SMSService.prototype.isValidPhoneNumber = function (phoneNumber) {
        // Simplified validation for Kenyan and broader African numbers
        var pattern = /^(?:\+254|254|0)[1-9]\d{8,9}$/;
        return pattern.test(phoneNumber.replace(/[\s-]/g, ''));
    };
    /**
     * Format phone number to Africa's Talking standard
     */
    SMSService.prototype.formatPhoneNumber = function (phoneNumber) {
        var formatted = phoneNumber.replace(/[\s-]/g, '');
        if (formatted.startsWith('0')) {
            formatted = '+254' + formatted.slice(1);
        }
        else if (formatted.startsWith('254')) {
            formatted = '+' + formatted;
        }
        else if (!formatted.startsWith('+')) {
            formatted = '+' + formatted;
        }
        return formatted;
    };
    /**
     * Get configured status
     */
    SMSService.prototype.getStatus = function () {
        return {
            isConfigured: this.isConfigured,
            provider: this.provider,
            username: this.username
        };
    };
    return SMSService;
}());
// Singleton instance
var smsService = new SMSService();
exports["default"] = smsService;
exports.queueSms = function (input) { return smsService.queueSms(input); };
exports.sendSmsImmediately = function (phone, msg) {
    return smsService.sendSmsImmediately(phone, msg);
};
exports.processSmsQueue = function (batchSize) { return smsService.processSmsQueue(batchSize); };
exports.getSmsQueueStatus = function () { return smsService.getQueueStatus(); };
exports.getSmsStatus = function () { return smsService.getStatus(); };
exports.getCustomerPreferences = function (clientId) {
    return smsService.getCustomerPreferences(clientId);
};
exports.updateCustomerPreferences = function (clientId, prefs) {
    return smsService.updateCustomerPreferences(clientId, prefs);
};
