"use strict";
/**
 * SMS Router
 * tRPC endpoints for SMS queue management, delivery tracking, and customer preferences
 *
 * Endpoints:
 * - smsRouter.queueSms() - Queue a new SMS
 * - smsRouter.getQueueStatus() - Check SMS queue status
 * - smsRouter.getDeliveryHistory() - View SMS delivery history
 * - smsRouter.getCustomerPreferences() - Get customer SMS preferences
 * - smsRouter.updatePreferences() - Update opt-in/out preferences
 * - smsRouter.getQueueStats() - Admin dashboard statistics
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
exports.smsRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var smsService = require("../services/smsService");
var db = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
// Feature-restricted procedure for SMS operations
var smsProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var _b;
    var ctx = _a.ctx, next = _a.next;
    if (!((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id)) {
        throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'User authentication required' });
    }
    return next({ ctx: ctx });
});
// Admin-only procedure for SMS management
var smsAdminProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var _b, _c;
    var ctx = _a.ctx, next = _a.next;
    if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin' && ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== 'super_admin') {
        throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    return next({ ctx: ctx });
});
exports.smsRouter = trpc_1.router({
    /**
     * Queue an SMS for sending
     */
    queueSms: smsProcedure.input(zod_1.z.object({
        phoneNumber: zod_1.z.string().regex(/^(?:\+254|254|0)[1-9]\d{8,9}$/, 'Invalid Kenyan phone number format'),
        message: zod_1.z.string().min(1, 'Message required').max(160, 'Message too long'),
        relatedEntityType: zod_1.z["enum"](['invoice', 'receipt', 'payment', 'quote', 'ticket']).optional(),
        relatedEntityId: zod_1.z.string().optional(),
        sendImmediately: zod_1.z.boolean()["default"](true)
    })).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var normalizedPhone, result, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        // Validate phone number format
                        if (!input.phoneNumber.match(/^(?:\+254|254|0)[1-9]\d{8,9}$/)) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Invalid Kenyan phone number'
                            });
                        }
                        normalizedPhone = input.phoneNumber;
                        if (normalizedPhone.startsWith('0')) {
                            normalizedPhone = '+254' + normalizedPhone.slice(1);
                        }
                        else if (normalizedPhone.startsWith('254')) {
                            normalizedPhone = '+' + normalizedPhone;
                        }
                        if (!input.sendImmediately) return [3 /*break*/, 2];
                        return [4 /*yield*/, smsService.sendSmsImmediately({
                                phoneNumber: normalizedPhone,
                                message: input.message,
                                relatedEntityType: input.relatedEntityType,
                                relatedEntityId: input.relatedEntityId
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: result.success,
                                queued: false,
                                statusCode: result.statusCode
                            }];
                    case 2: return [4 /*yield*/, smsService.queueSms({
                            phoneNumber: normalizedPhone,
                            message: input.message,
                            relatedEntityType: input.relatedEntityType,
                            relatedEntityId: input.relatedEntityId
                        })];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: result.success,
                                queued: true,
                                queueId: result.queueId
                            }];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        console.error('[smsRouter] queueSms error:', error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_1 instanceof Error ? error_1.message : 'Failed to queue SMS'
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Check SMS queue status
     */
    getQueueStatus: smsProcedure.input(zod_1.z.object({
        queueId: zod_1.z.string()
    })).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, records, record, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        return [4 /*yield*/, database.select().from(schema_1.smsQueue).where(drizzle_orm_1.eq(schema_1.smsQueue.id, input.queueId)).limit(1)];
                    case 2:
                        records = _b.sent();
                        record = records[0] || null;
                        if (!record) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'SMS queue record not found'
                            });
                        }
                        return [2 /*return*/, {
                                queueId: record.id,
                                status: record.status,
                                phoneNumber: record.phoneNumber.replace(/\d(?=\d{4})/g, '*'),
                                message: record.message.substring(0, 50) + (record.message.length > 50 ? '...' : ''),
                                createdAt: record.createdAt,
                                sentAt: record.sentAt,
                                failureReason: record.failureReason,
                                retryCount: record.retryCount
                            }];
                    case 3:
                        error_2 = _b.sent();
                        console.error('[smsRouter] getQueueStatus error:', error_2);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch queue status'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get SMS delivery history
     */
    getDeliveryHistory: smsProcedure.input(zod_1.z.object({
        limit: zod_1.z.number().max(200)["default"](50),
        offset: zod_1.z.number()["default"](0),
        status: zod_1.z["enum"](['pending', 'sending', 'delivered', 'failed']).optional(),
        relatedEntityId: zod_1.z.string().optional()
    })).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, where, records, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        where = drizzle_orm_1.and(input.status ? drizzle_orm_1.eq(schema_1.smsQueue.status, input.status) : undefined, input.relatedEntityId ? drizzle_orm_1.eq(schema_1.smsQueue.relatedEntityId, input.relatedEntityId) : undefined);
                        return [4 /*yield*/, database.select()
                                .from(schema_1.smsQueue)
                                .where(where)
                                .orderBy(drizzle_orm_1.desc(schema_1.smsQueue.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 2:
                        records = _b.sent();
                        return [2 /*return*/, records.map(function (r) { return ({
                                queueId: r.id,
                                phoneNumber: r.phoneNumber.replace(/\d(?=\d{4})/g, '*'),
                                status: r.status,
                                createdAt: r.createdAt,
                                sentAt: r.sentAt,
                                failureReason: r.failureReason,
                                retryCount: r.retryCount
                            }); })];
                    case 3:
                        error_3 = _b.sent();
                        console.error('[smsRouter] getDeliveryHistory error:', error_3);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch delivery history'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get customer SMS preferences
     */
    getCustomerPreferences: smsProcedure.input(zod_1.z.object({
        phoneNumber: zod_1.z.string().regex(/^(?:\+254|254|0)[1-9]\d{8,9}$/, 'Invalid phone number')
    })).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, normalizedPhone, records, record, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        normalizedPhone = input.phoneNumber;
                        if (normalizedPhone.startsWith('0')) {
                            normalizedPhone = '+254' + normalizedPhone.slice(1);
                        }
                        else if (normalizedPhone.startsWith('254')) {
                            normalizedPhone = '+' + normalizedPhone;
                        }
                        return [4 /*yield*/, database.select().from(schema_1.smsCustomerPreferences)
                                .where(drizzle_orm_1.eq(schema_1.smsCustomerPreferences.phoneNumber, normalizedPhone))
                                .limit(1)];
                    case 2:
                        records = _b.sent();
                        record = records[0] || null;
                        if (!record) {
                            // Return default preferences
                            return [2 /*return*/, {
                                    phoneNumber: normalizedPhone,
                                    optedIn: true,
                                    marketingOptedIn: false,
                                    transactionalOptedIn: true,
                                    reminderPreferences: {
                                        invoices: true,
                                        payments: true,
                                        receipts: true
                                    },
                                    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                }];
                        }
                        return [2 /*return*/, {
                                phoneNumber: record.phoneNumber,
                                optedIn: record.optedIn,
                                marketingOptedIn: record.marketingOptedIn,
                                transactionalOptedIn: record.transactionalOptedIn,
                                reminderPreferences: record.reminderPreferences,
                                updatedAt: record.updatedAt
                            }];
                    case 3:
                        error_4 = _b.sent();
                        console.error('[smsRouter] getCustomerPreferences error:', error_4);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch customer preferences'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update customer SMS preferences
     */
    updatePreferences: smsProcedure.input(zod_1.z.object({
        phoneNumber: zod_1.z.string().regex(/^(?:\+254|254|0)[1-9]\d{8,9}$/, 'Invalid phone number'),
        optedIn: zod_1.z.boolean().optional(),
        marketingOptedIn: zod_1.z.boolean().optional(),
        transactionalOptedIn: zod_1.z.boolean().optional(),
        reminderPreferences: zod_1.z.object({
            invoices: zod_1.z.boolean().optional(),
            payments: zod_1.z.boolean().optional(),
            receipts: zod_1.z.boolean().optional()
        }).optional()
    })).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, normalizedPhone, existingRecords, existing, crypto_1, error_5;
            var _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _h.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        normalizedPhone = input.phoneNumber;
                        if (normalizedPhone.startsWith('0')) {
                            normalizedPhone = '+254' + normalizedPhone.slice(1);
                        }
                        else if (normalizedPhone.startsWith('254')) {
                            normalizedPhone = '+' + normalizedPhone;
                        }
                        return [4 /*yield*/, database.select().from(schema_1.smsCustomerPreferences)
                                .where(drizzle_orm_1.eq(schema_1.smsCustomerPreferences.phoneNumber, normalizedPhone))
                                .limit(1)];
                    case 2:
                        existingRecords = _h.sent();
                        existing = existingRecords[0] || null;
                        if (!existing) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.update(schema_1.smsCustomerPreferences)
                                .set({
                                optedIn: (_b = input.optedIn) !== null && _b !== void 0 ? _b : existing.optedIn,
                                marketingOptedIn: (_c = input.marketingOptedIn) !== null && _c !== void 0 ? _c : existing.marketingOptedIn,
                                transactionalOptedIn: (_d = input.transactionalOptedIn) !== null && _d !== void 0 ? _d : existing.transactionalOptedIn,
                                reminderPreferences: input.reminderPreferences
                                    ? __assign(__assign({}, existing.reminderPreferences), input.reminderPreferences) : existing.reminderPreferences,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.smsCustomerPreferences.phoneNumber, normalizedPhone))];
                    case 3:
                        _h.sent();
                        return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, Promise.resolve().then(function () { return require('crypto'); })];
                    case 5:
                        crypto_1 = _h.sent();
                        return [4 /*yield*/, database.insert(schema_1.smsCustomerPreferences).values({
                                id: crypto_1.randomUUID(),
                                phoneNumber: normalizedPhone,
                                optedIn: (_e = input.optedIn) !== null && _e !== void 0 ? _e : true,
                                marketingOptedIn: (_f = input.marketingOptedIn) !== null && _f !== void 0 ? _f : false,
                                transactionalOptedIn: (_g = input.transactionalOptedIn) !== null && _g !== void 0 ? _g : true,
                                reminderPreferences: input.reminderPreferences || {
                                    invoices: true,
                                    payments: true,
                                    receipts: true
                                }
                            })];
                    case 6:
                        _h.sent();
                        _h.label = 7;
                    case 7: return [2 /*return*/, {
                            success: true,
                            message: 'Preferences updated successfully'
                        }];
                    case 8:
                        error_5 = _h.sent();
                        console.error('[smsRouter] updatePreferences error:', error_5);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to update preferences'
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get SMS queue statistics (admin only)
     */
    getQueueStats: smsAdminProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, stats, yesterday, yesterdayStats, statusMap, error_6;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _b.sent();
                    if (!database)
                        throw new Error('Database unavailable');
                    return [4 /*yield*/, database.select({
                            status: schema_1.smsQueue.status,
                            count: drizzle_orm_1.count()
                        })
                            .from(schema_1.smsQueue)
                            .groupBy(schema_1.smsQueue.status)];
                case 2:
                    stats = _b.sent();
                    yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, database.select({
                            count: drizzle_orm_1.count()
                        })
                            .from(schema_1.smsQueue)
                            .where(drizzle_orm_1.gte(schema_1.smsQueue.createdAt, yesterday))];
                case 3:
                    yesterdayStats = _b.sent();
                    statusMap = Object.fromEntries(stats.map(function (s) { return [s.status, s.count]; }));
                    return [2 /*return*/, {
                            pending: statusMap['pending'] || 0,
                            sending: statusMap['sending'] || 0,
                            delivered: statusMap['delivered'] || 0,
                            failed: statusMap['failed'] || 0,
                            total: Object.values(statusMap).reduce(function (a, b) { return a + b; }, 0),
                            totalLastDay: ((_a = yesterdayStats[0]) === null || _a === void 0 ? void 0 : _a.count) || 0,
                            provider: process.env.SMS_PROVIDER || 'africa_talking'
                        }];
                case 4:
                    error_6 = _b.sent();
                    console.error('[smsRouter] getQueueStats error:', error_6);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to fetch queue statistics'
                    });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Retry sending a failed SMS (admin only)
     */
    retrySms: smsAdminProcedure.input(zod_1.z.object({
        queueId: zod_1.z.string()
    })).mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, records, record, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        return [4 /*yield*/, database.select().from(schema_1.smsQueue).where(drizzle_orm_1.eq(schema_1.smsQueue.id, input.queueId)).limit(1)];
                    case 2:
                        records = _b.sent();
                        record = records[0] || null;
                        if (!record) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'SMS queue record not found'
                            });
                        }
                        // Reset status to pending for retry
                        return [4 /*yield*/, database.update(schema_1.smsQueue)
                                .set({
                                status: 'pending',
                                nextRetryAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                retryCount: (record.retryCount || 0) + 1
                            })
                                .where(drizzle_orm_1.eq(schema_1.smsQueue.id, input.queueId))];
                    case 3:
                        // Reset status to pending for retry
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'SMS queued for retry'
                            }];
                    case 4:
                        error_7 = _b.sent();
                        console.error('[smsRouter] retrySms error:', error_7);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to retry SMS'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
