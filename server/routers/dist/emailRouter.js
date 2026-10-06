"use strict";
/**
 * Email Router
 * tRPC endpoints for email queue management, templates, and delivery tracking
 *
 * Endpoints:
 * - emailRouter.queueEmail() - Queue a new email
 * - emailRouter.getQueueStatus() - Check email queue status
 * - emailRouter.getEmailTemplates() - List available templates
 * - emailRouter.sendEmailTemplate() - Send email using template
 * - emailRouter.getDeliveryHistory() - View email delivery history
 * - emailRouter.getQueueStats() - Admin dashboard statistics
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
exports.emailRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var emailService = require("../services/emailService");
var db = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
// Feature-restricted procedure for email operations
var emailProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var _b;
    var ctx = _a.ctx, next = _a.next;
    if (!((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id)) {
        throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'User authentication required' });
    }
    return next({ ctx: ctx });
});
// Admin-only procedure for email management
var emailAdminProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var _b, _c;
    var ctx = _a.ctx, next = _a.next;
    if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin' && ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== 'super_admin') {
        throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    return next({ ctx: ctx });
});
exports.emailRouter = trpc_1.router({
    /**
     * Queue an email for sending
     * Supports immediate send or queued delivery
     */
    queueEmail: emailProcedure.input(zod_1.z.object({
        toEmail: zod_1.z.string().email('Invalid email address'),
        subject: zod_1.z.string().min(1, 'Subject required'),
        htmlContent: zod_1.z.string().optional(),
        plainTextContent: zod_1.z.string().optional(),
        templateId: zod_1.z.string().optional(),
        templateVariables: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        relatedEntityType: zod_1.z["enum"](['invoice', 'receipt', 'payment', 'quote', 'ticket']).optional(),
        relatedEntityId: zod_1.z.string().optional(),
        sendImmediately: zod_1.z.boolean()["default"](false)
    })).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var result, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        if (!input.htmlContent && !input.templateId) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Either htmlContent or templateId required'
                            });
                        }
                        if (!input.sendImmediately) return [3 /*break*/, 2];
                        return [4 /*yield*/, emailService.sendEmailImmediately({
                                toEmail: input.toEmail,
                                subject: input.subject,
                                htmlContent: input.htmlContent,
                                plainTextContent: input.plainTextContent,
                                templateId: input.templateId,
                                templateVariables: input.templateVariables
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                queued: false,
                                messageId: result.messageId
                            }];
                    case 2: return [4 /*yield*/, emailService.queueEmail({
                            toEmail: input.toEmail,
                            subject: input.subject,
                            htmlContent: input.htmlContent,
                            plainTextContent: input.plainTextContent,
                            templateId: input.templateId,
                            templateVariables: input.templateVariables,
                            relatedEntityType: input.relatedEntityType,
                            relatedEntityId: input.relatedEntityId
                        })];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                queued: true,
                                queueId: result.queueId
                            }];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        console.error('[emailRouter] queueEmail error:', error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_1 instanceof Error ? error_1.message : 'Failed to queue email'
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Check email queue status for a specific email
     */
    getQueueStatus: emailProcedure.input(zod_1.z.object({
        queueId: zod_1.z.string()
    })).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, emailQueue, record, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        emailQueue = (_b.sent()).emailQueue;
                        return [4 /*yield*/, database.select().from(emailQueue).where(drizzle_orm_1.eq(emailQueue.id, input.queueId)).limit(1)];
                    case 3:
                        record = (_b.sent())[0];
                        if (!record) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Email queue record not found'
                            });
                        }
                        return [2 /*return*/, {
                                queueId: record.id,
                                status: record.status,
                                toEmail: record.toEmail,
                                subject: record.subject,
                                createdAt: record.createdAt,
                                sentAt: record.sentAt,
                                failureReason: record.failureReason,
                                retryCount: record.retryCount,
                                nextRetryAt: record.nextRetryAt
                            }];
                    case 4:
                        error_2 = _b.sent();
                        console.error('[emailRouter] getQueueStatus error:', error_2);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch queue status'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get list of available email templates
     */
    getEmailTemplates: emailProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, emailTemplates, templates, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error('Database unavailable');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 2:
                    emailTemplates = (_a.sent()).emailTemplates;
                    return [4 /*yield*/, database.select().from(emailTemplates)];
                case 3:
                    templates = _a.sent();
                    return [2 /*return*/, templates.map(function (t) { return ({
                            id: t.id,
                            name: t.name,
                            subject: t.subject,
                            description: t.description,
                            variables: t.variables,
                            createdAt: t.createdAt
                        }); })];
                case 4:
                    error_3 = _a.sent();
                    console.error('[emailRouter] getEmailTemplates error:', error_3);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to fetch templates'
                    });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Send email using a template
     */
    sendEmailTemplate: emailProcedure.input(zod_1.z.object({
        toEmail: zod_1.z.string().email(),
        templateId: zod_1.z.string(),
        templateVariables: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        relatedEntityType: zod_1.z["enum"](['invoice', 'receipt', 'payment', 'quote', 'ticket']).optional(),
        relatedEntityId: zod_1.z.string().optional(),
        sendImmediately: zod_1.z.boolean()["default"](true)
    })).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, emailTemplates, templateRows, template, result, result, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        emailTemplates = (_b.sent()).emailTemplates;
                        return [4 /*yield*/, database.select().from(emailTemplates).where(drizzle_orm_1.eq(emailTemplates.id, input.templateId)).limit(1)];
                    case 3:
                        templateRows = _b.sent();
                        template = templateRows[0];
                        if (!template) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Email template not found'
                            });
                        }
                        if (!input.sendImmediately) return [3 /*break*/, 5];
                        return [4 /*yield*/, emailService.sendEmailImmediately({
                                toEmail: input.toEmail,
                                subject: template.subject,
                                htmlContent: template.htmlContent,
                                templateVariables: input.templateVariables,
                                templateId: input.templateId
                            })];
                    case 4:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                queued: false,
                                messageId: result.messageId
                            }];
                    case 5: return [4 /*yield*/, emailService.queueEmail({
                            toEmail: input.toEmail,
                            subject: template.subject,
                            templateId: input.templateId,
                            templateVariables: input.templateVariables,
                            relatedEntityType: input.relatedEntityType,
                            relatedEntityId: input.relatedEntityId
                        })];
                    case 6:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                queued: true,
                                queueId: result.queueId
                            }];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_4 = _b.sent();
                        console.error('[emailRouter] sendEmailTemplate error:', error_4);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_4 instanceof Error ? error_4.message : 'Failed to send email'
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get email delivery history
     */
    getDeliveryHistory: emailProcedure.input(zod_1.z.object({
        limit: zod_1.z.number().max(200)["default"](50),
        offset: zod_1.z.number()["default"](0),
        status: zod_1.z["enum"](['pending', 'sending', 'delivered', 'failed']).optional(),
        relatedEntityId: zod_1.z.string().optional()
    })).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, emailQueue, where, records, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        emailQueue = (_b.sent()).emailQueue;
                        where = drizzle_orm_1.and(input.status ? drizzle_orm_1.eq(emailQueue.status, input.status) : undefined, input.relatedEntityId ? drizzle_orm_1.eq(emailQueue.relatedEntityId, input.relatedEntityId) : undefined);
                        return [4 /*yield*/, database.select()
                                .from(emailQueue)
                                .where(where)
                                .orderBy(drizzle_orm_1.desc(emailQueue.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 3:
                        records = _b.sent();
                        return [2 /*return*/, records.map(function (r) { return ({
                                queueId: r.id,
                                toEmail: r.toEmail,
                                subject: r.subject,
                                status: r.status,
                                createdAt: r.createdAt,
                                sentAt: r.sentAt,
                                failureReason: r.failureReason,
                                retryCount: r.retryCount
                            }); })];
                    case 4:
                        error_5 = _b.sent();
                        console.error('[emailRouter] getDeliveryHistory error:', error_5);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch delivery history'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get email queue statistics (admin only)
     */
    getQueueStats: emailAdminProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, emailQueue, _a, eq_1, count, ne, stats, yesterday, yesterdayStats, statusMap, error_6;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _c.sent();
                    if (!database)
                        throw new Error('Database unavailable');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 2:
                    emailQueue = (_c.sent()).emailQueue;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                case 3:
                    _a = _c.sent(), eq_1 = _a.eq, count = _a.count, ne = _a.ne;
                    return [4 /*yield*/, database.select({
                            status: emailQueue.status,
                            count: count()
                        })
                            .from(emailQueue)
                            .groupBy(emailQueue.status)];
                case 4:
                    stats = _c.sent();
                    yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, database.select({
                            count: count()
                        })
                            .from(emailQueue)
                            .where(drizzle_orm_1.gte(emailQueue.createdAt, yesterday))];
                case 5:
                    yesterdayStats = _c.sent();
                    statusMap = Object.fromEntries(stats.map(function (s) { return [s.status, s.count]; }));
                    return [2 /*return*/, {
                            pending: statusMap['pending'] || 0,
                            sending: statusMap['sending'] || 0,
                            delivered: statusMap['delivered'] || 0,
                            failed: statusMap['failed'] || 0,
                            total: Object.values(statusMap).reduce(function (a, b) { return a + b; }, 0),
                            totalLastDay: ((_b = yesterdayStats[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
                            averageRetries: 2.5
                        }];
                case 6:
                    error_6 = _c.sent();
                    console.error('[emailRouter] getQueueStats error:', error_6);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to fetch queue statistics'
                    });
                case 7: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Retry sending a failed email (admin only)
     */
    retryEmail: emailAdminProcedure.input(zod_1.z.object({
        queueId: zod_1.z.string()
    })).mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, emailQueue, record, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error('Database unavailable');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        emailQueue = (_b.sent()).emailQueue;
                        return [4 /*yield*/, database.select().from(emailQueue).where(drizzle_orm_1.eq(emailQueue.id, input.queueId)).limit(1)];
                    case 3:
                        record = (_b.sent())[0];
                        if (!record) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Email queue record not found'
                            });
                        }
                        // Reset status to pending for retry
                        return [4 /*yield*/, database.update(emailQueue)
                                .set({
                                status: 'pending',
                                nextRetryAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                retryCount: (record.retryCount || 0) + 1
                            })
                                .where(drizzle_orm_1.eq(emailQueue.id, input.queueId))];
                    case 4:
                        // Reset status to pending for retry
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Email queued for retry'
                            }];
                    case 5:
                        error_7 = _b.sent();
                        console.error('[emailRouter] retryEmail error:', error_7);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to retry email'
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    })
});
