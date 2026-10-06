"use strict";
/**
 * SMS Automation Router
 * Handles SMS templates, scheduling, sending, and automation triggers
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.smsAutomationRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var drizzle_orm_1 = require("drizzle-orm");
var db_1 = require("../db");
var smsService = require("../services/smsService");
var schema_1 = require("../../drizzle/schema");
var uuid_1 = require("uuid");
var smsReadProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("communications:read");
var smsWriteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("communications:write");
exports.smsAutomationRouter = trpc_1.router({
    /**
     * Create SMS template
     */
    createTemplate: smsWriteProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(255),
        content: zod_1.z.string().min(1).max(1600),
        category: zod_1.z["enum"]([
            'invoice_notification',
            'payment_reminder',
            'delivery_notification',
            'appointment_reminder',
            'promotional',
            'transactional',
            'custom',
        ]),
        variables: zod_1.z.array(zod_1.z.string()).optional(),
        isActive: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, templateId, template, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        templateId = uuid_1.v4();
                        template = {
                            id: templateId,
                            organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id),
                            name: input.name,
                            content: input.content,
                            category: input.category,
                            variables: input.variables || [],
                            isActive: input.isActive,
                            usageCount: 0,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, database.insert(schema_1.smsTemplates).values(template)];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, {
                                template: template,
                                success: true,
                                message: 'SMS template created successfully'
                            }];
                    case 3:
                        error_1 = _d.sent();
                        console.error("[SMS] Error creating template:", error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create SMS template'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get all SMS templates
     */
    getTemplates: smsReadProcedure
        .input(zod_1.z.object({
        category: zod_1.z.string().optional(),
        limit: zod_1.z.number().int()["default"](20),
        offset: zod_1.z.number().int()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizationId, query, countRow, templateQuery, templates, error_2;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _e.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        organizationId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id);
                        query = database.select({ total: drizzle_orm_1.count() }).from(schema_1.smsTemplates)
                            .where(drizzle_orm_1.eq(schema_1.smsTemplates.organizationId, organizationId));
                        if (input.category) {
                            query = query.where(drizzle_orm_1.eq(schema_1.smsTemplates.category, input.category));
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        countRow = (_e.sent())[0];
                        templateQuery = database.select().from(schema_1.smsTemplates)
                            .where(drizzle_orm_1.eq(schema_1.smsTemplates.organizationId, organizationId));
                        if (input.category) {
                            templateQuery = templateQuery.where(drizzle_orm_1.eq(schema_1.smsTemplates.category, input.category));
                        }
                        return [4 /*yield*/, templateQuery
                                .orderBy(drizzle_orm_1.desc(schema_1.smsTemplates.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 3:
                        templates = _e.sent();
                        return [2 /*return*/, {
                                templates: templates,
                                total: Number((_d = countRow === null || countRow === void 0 ? void 0 : countRow.total) !== null && _d !== void 0 ? _d : 0),
                                limit: input.limit,
                                offset: input.offset,
                                success: true
                            }];
                    case 4:
                        error_2 = _e.sent();
                        console.error("[SMS] Error fetching templates:", error_2);
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        return [2 /*return*/, { templates: [], total: 0, limit: input.limit, offset: input.offset, success: false }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update SMS template
     */
    updateTemplate: smsWriteProcedure
        .input(zod_1.z.object({
        templateId: zod_1.z.string(),
        name: zod_1.z.string().optional(),
        content: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        variables: zod_1.z.array(zod_1.z.string()).optional(),
        isActive: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizationId, existing, updates, error_3;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        organizationId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id);
                        return [4 /*yield*/, database.select().from(schema_1.smsTemplates).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.smsTemplates.id, input.templateId), drizzle_orm_1.eq(schema_1.smsTemplates.organizationId, organizationId))).limit(1)];
                    case 2:
                        existing = _d.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'SMS template not found' });
                        }
                        updates = {
                            updatedAt: new Date().toISOString()
                        };
                        if (input.name !== undefined)
                            updates.name = input.name;
                        if (input.content !== undefined)
                            updates.content = input.content;
                        if (input.category !== undefined)
                            updates.category = input.category;
                        if (input.variables !== undefined)
                            updates.variables = input.variables;
                        if (input.isActive !== undefined)
                            updates.isActive = input.isActive;
                        return [4 /*yield*/, database.update(schema_1.smsTemplates).set(updates).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.smsTemplates.id, input.templateId), drizzle_orm_1.eq(schema_1.smsTemplates.organizationId, organizationId)))];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'SMS template updated successfully'
                            }];
                    case 4:
                        error_3 = _d.sent();
                        console.error("[SMS] Error updating template:", error_3);
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to update SMS template'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Delete SMS template
     */
    deleteTemplate: smsWriteProcedure
        .input(zod_1.z.object({ templateId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizationId, inUse, error_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        organizationId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id);
                        return [4 /*yield*/, database.select().from(schema_1.smsAutomationRules).where(drizzle_orm_1.eq(schema_1.smsAutomationRules.templateId, input.templateId)).limit(1)];
                    case 2:
                        inUse = _d.sent();
                        if (inUse.length) {
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Template is in use by automation rules' });
                        }
                        return [4 /*yield*/, database["delete"](schema_1.smsTemplates).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.smsTemplates.id, input.templateId), drizzle_orm_1.eq(schema_1.smsTemplates.organizationId, organizationId)))];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'SMS template deleted successfully'
                            }];
                    case 4:
                        error_4 = _d.sent();
                        console.error("[SMS] Error deleting template:", error_4);
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to delete SMS template'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Send SMS immediately
     */
    sendSMS: smsWriteProcedure
        .input(zod_1.z.object({
        toNumber: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/),
        templateId: zod_1.z.string().optional(),
        content: zod_1.z.string().optional(),
        variables: zod_1.z.record(zod_1.z.string()).optional(),
        metadata: zod_1.z.record(zod_1.z.any()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, finalContent_1, template, queueResult, sms, error_5;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 6, , 7]);
                        if (!input.templateId && !input.content) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Either templateId or content must be provided'
                            });
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _g.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        finalContent_1 = input.content || '';
                        if (!input.templateId) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.select().from(schema_1.smsTemplates).where(drizzle_orm_1.eq(schema_1.smsTemplates.id, input.templateId)).limit(1)];
                    case 2:
                        template = (_g.sent())[0];
                        if (!template) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'SMS template not found' });
                        }
                        finalContent_1 = template.content;
                        if (input.variables) {
                            Object.entries(input.variables).forEach(function (_a) {
                                var key = _a[0], value = _a[1];
                                var escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                finalContent_1 = finalContent_1.replace(new RegExp("{{\\s*" + escapedKey + "\\s*}}", 'g'), String(value));
                            });
                        }
                        return [4 /*yield*/, database.update(schema_1.smsTemplates)
                                .set({ usageCount: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " + 1"], ["", " + 1"])), schema_1.smsTemplates.usageCount), updatedAt: new Date().toISOString() })
                                .where(drizzle_orm_1.eq(schema_1.smsTemplates.id, input.templateId))];
                    case 3:
                        _g.sent();
                        _g.label = 4;
                    case 4:
                        if (!finalContent_1) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'SMS content cannot be empty'
                            });
                        }
                        return [4 /*yield*/, smsService.queueSms({
                                phoneNumber: input.toNumber,
                                message: finalContent_1,
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id),
                                createdBy: (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id,
                                templateId: input.templateId,
                                metadata: input.metadata || {}
                            })];
                    case 5:
                        queueResult = _g.sent();
                        sms = {
                            id: queueResult.queueId,
                            organizationId: ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.organizationId) || ((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.id),
                            toNumber: input.toNumber,
                            content: finalContent_1,
                            status: 'pending',
                            templateId: input.templateId,
                            sentAt: null,
                            deliveredAt: null,
                            failureReason: null,
                            metadata: input.metadata || {},
                            createdAt: new Date().toISOString()
                        };
                        return [2 /*return*/, {
                                sms: sms,
                                success: true,
                                message: 'SMS queued for sending'
                            }];
                    case 6:
                        error_5 = _g.sent();
                        console.error("[SMS] Error sending SMS:", error_5);
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to send SMS'
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Schedule SMS for later delivery
     */
    scheduleSMS: smsWriteProcedure
        .input(zod_1.z.object({
        toNumber: zod_1.z.string(),
        templateId: zod_1.z.string().optional(),
        content: zod_1.z.string().optional(),
        variables: zod_1.z.record(zod_1.z.string()).optional(),
        scheduleTime: zod_1.z.string().datetime(),
        recurring: zod_1.z["enum"](['once', 'daily', 'weekly', 'monthly']).optional(),
        recurringEnd: zod_1.z.string().datetime().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var scheduleId, database, message_1, templateId, template, schedule, error_6;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        scheduleId = uuid_1.v4();
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _e.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        message_1 = input.content || '';
                        templateId = input.templateId;
                        if (!input.templateId) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.select().from(schema_1.smsTemplates).where(drizzle_orm_1.eq(schema_1.smsTemplates.id, input.templateId)).limit(1)];
                    case 2:
                        template = (_e.sent())[0];
                        if (!template) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'SMS template not found' });
                        }
                        message_1 = template.content;
                        if (input.variables) {
                            Object.entries(input.variables).forEach(function (_a) {
                                var key = _a[0], value = _a[1];
                                var escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                message_1 = message_1.replace(new RegExp("{{\\s*" + escapedKey + "\\s*}}", 'g'), String(value));
                            });
                        }
                        return [4 /*yield*/, database.update(schema_1.smsTemplates)
                                .set({ usageCount: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", " + 1"], ["", " + 1"])), schema_1.smsTemplates.usageCount), updatedAt: new Date().toISOString() })
                                .where(drizzle_orm_1.eq(schema_1.smsTemplates.id, input.templateId))];
                    case 3:
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        if (!message_1) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'SMS content is required for scheduling'
                            });
                        }
                        schedule = {
                            id: scheduleId,
                            phoneNumber: input.toNumber,
                            message: message_1,
                            status: 'pending',
                            retryCount: 0,
                            provider: process.env.SMS_PROVIDER || 'africa_talking',
                            externalId: null,
                            error: null,
                            failureReason: null,
                            relatedEntityType: null,
                            relatedEntityId: null,
                            sentAt: null,
                            nextRetryAt: input.scheduleTime,
                            organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id),
                            createdBy: (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id,
                            templateId: templateId,
                            batchId: null,
                            metadata: null,
                            attemptCount: 0,
                            maxAttempts: 3,
                            providerReference: null,
                            deliveryStatus: 'pending',
                            deliveredAt: null,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, database.insert(schema_1.smsQueue).values(schedule)];
                    case 5:
                        _e.sent();
                        return [2 /*return*/, {
                                schedule: schedule,
                                success: true,
                                message: 'SMS scheduled successfully'
                            }];
                    case 6:
                        error_6 = _e.sent();
                        console.error("[SMS] Error scheduling SMS:", error_6);
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to schedule SMS'
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Send bulk SMS
     */
    sendBulkSMS: smsWriteProcedure
        .input(zod_1.z.object({
        recipients: zod_1.z.array(zod_1.z.object({
            toNumber: zod_1.z.string(),
            variables: zod_1.z.record(zod_1.z.string()).optional()
        })),
        templateId: zod_1.z.string().optional(),
        content: zod_1.z.string().optional(),
        scheduleTime: zod_1.z.string().datetime().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var batchId_1, count_1, database, template_1, foundTemplate, records, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        batchId_1 = uuid_1.v4();
                        count_1 = input.recipients.length;
                        if (count_1 === 0) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'At least one recipient is required'
                            });
                        }
                        if (count_1 > 10000) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Maximum 10,000 recipients per batch'
                            });
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        template_1 = null;
                        if (!input.templateId) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.select().from(schema_1.smsTemplates).where(drizzle_orm_1.eq(schema_1.smsTemplates.id, input.templateId)).limit(1)];
                    case 2:
                        foundTemplate = (_b.sent())[0];
                        if (!foundTemplate) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'SMS template not found' });
                        }
                        template_1 = foundTemplate;
                        return [4 /*yield*/, database.update(schema_1.smsTemplates)
                                .set({ usageCount: drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", " + ", ""], ["", " + ", ""])), schema_1.smsTemplates.usageCount, count_1), updatedAt: new Date().toISOString() })
                                .where(drizzle_orm_1.eq(schema_1.smsTemplates.id, input.templateId))];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        records = input.recipients.map(function (recipient) {
                            var _a, _b, _c;
                            var message = input.content || '';
                            if (template_1) {
                                message = template_1.content;
                                var variables = __assign(__assign({}, (input.variables || {})), (recipient.variables || {}));
                                Object.entries(variables).forEach(function (_a) {
                                    var key = _a[0], value = _a[1];
                                    var escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                    message = message.replace(new RegExp("{{\\s*" + escapedKey + "\\s*}}", 'g'), String(value));
                                });
                            }
                            if (!message) {
                                throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Bulk SMS requires a template or static content' });
                            }
                            return {
                                id: uuid_1.v4(),
                                phoneNumber: recipient.toNumber,
                                message: message,
                                status: 'pending',
                                retryCount: 0,
                                attemptCount: 0,
                                maxAttempts: 3,
                                provider: process.env.SMS_PROVIDER || 'africa_talking',
                                externalId: null,
                                providerReference: null,
                                deliveryStatus: 'pending',
                                deliveredAt: null,
                                error: null,
                                failureReason: null,
                                relatedEntityType: null,
                                relatedEntityId: null,
                                batchId: batchId_1,
                                templateId: input.templateId,
                                metadata: null,
                                sentAt: null,
                                nextRetryAt: input.scheduleTime || null,
                                organizationId: ((_a = ctx.user) === null || _a === void 0 ? void 0 : _a.organizationId) || ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id),
                                createdBy: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            };
                        });
                        return [4 /*yield*/, database.insert(schema_1.smsQueue).values(records)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, {
                                batchId: batchId_1,
                                recipientCount: count_1,
                                status: 'processing',
                                success: true,
                                message: "Bulk SMS queued for " + count_1 + " recipients"
                            }];
                    case 6:
                        error_7 = _b.sent();
                        console.error("[SMS] Error sending bulk SMS:", error_7);
                        if (error_7 instanceof server_1.TRPCError)
                            throw error_7;
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to send bulk SMS'
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get SMS delivery status
     */
    getDeliveryStatus: smsReadProcedure
        .input(zod_1.z.object({ smsId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, message, status, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        return [4 /*yield*/, database.select().from(schema_1.smsQueue).where(drizzle_orm_1.eq(schema_1.smsQueue.id, input.smsId)).limit(1)];
                    case 2:
                        message = (_b.sent())[0];
                        if (!message) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'SMS message not found' });
                        }
                        status = {
                            smsId: input.smsId,
                            status: message.status,
                            sentAt: message.sentAt,
                            deliveredAt: message.deliveredAt,
                            failureReason: message.failureReason
                        };
                        return [2 /*return*/, { status: status, success: true }];
                    case 3:
                        error_8 = _b.sent();
                        console.error("[SMS] Error fetching delivery status:", error_8);
                        if (error_8 instanceof server_1.TRPCError)
                            throw error_8;
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch SMS status'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get SMS history
     */
    getHistory: smsReadProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().int()["default"](50),
        offset: zod_1.z.number().int()["default"](0),
        status: zod_1.z.string().optional(),
        dateRange: zod_1.z.object({
            start: zod_1.z.string().datetime(),
            end: zod_1.z.string().datetime()
        }).optional()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizationId, countQuery, countRow, historyQuery, history, error_9;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _e.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        organizationId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id);
                        countQuery = database.select({ total: drizzle_orm_1.count() }).from(schema_1.smsQueue)
                            .where(drizzle_orm_1.eq(schema_1.smsQueue.organizationId, organizationId));
                        if (input.status) {
                            countQuery = countQuery.where(drizzle_orm_1.eq(schema_1.smsQueue.status, input.status));
                        }
                        if (input.dateRange) {
                            countQuery = countQuery.where(drizzle_orm_1.gte(schema_1.smsQueue.createdAt, input.dateRange.start))
                                .where(drizzle_orm_1.lte(schema_1.smsQueue.createdAt, input.dateRange.end));
                        }
                        return [4 /*yield*/, countQuery];
                    case 2:
                        countRow = (_e.sent())[0];
                        historyQuery = database.select().from(schema_1.smsQueue)
                            .where(drizzle_orm_1.eq(schema_1.smsQueue.organizationId, organizationId));
                        if (input.status) {
                            historyQuery = historyQuery.where(drizzle_orm_1.eq(schema_1.smsQueue.status, input.status));
                        }
                        if (input.dateRange) {
                            historyQuery = historyQuery.where(drizzle_orm_1.gte(schema_1.smsQueue.createdAt, input.dateRange.start))
                                .where(drizzle_orm_1.lte(schema_1.smsQueue.createdAt, input.dateRange.end));
                        }
                        return [4 /*yield*/, historyQuery
                                .orderBy(drizzle_orm_1.desc(schema_1.smsQueue.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 3:
                        history = _e.sent();
                        return [2 /*return*/, {
                                history: history,
                                total: Number((_d = countRow === null || countRow === void 0 ? void 0 : countRow.total) !== null && _d !== void 0 ? _d : 0),
                                limit: input.limit,
                                offset: input.offset,
                                success: true
                            }];
                    case 4:
                        error_9 = _e.sent();
                        console.error("[SMS] Error fetching history:", error_9);
                        if (error_9 instanceof server_1.TRPCError)
                            throw error_9;
                        return [2 /*return*/, { history: [], total: 0, limit: input.limit, offset: input.offset, success: false }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Create SMS automation rule
     */
    createAutomationRule: smsWriteProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1),
        trigger: zod_1.z["enum"]([
            'invoice_created',
            'payment_failed',
            'payment_received',
            'subscription_expiring',
            'appointment_reminder',
            'custom_event',
        ]),
        templateId: zod_1.z.string(),
        conditions: zod_1.z.record(zod_1.z.any()).optional(),
        isActive: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, ruleId, rule, error_10;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        ruleId = uuid_1.v4();
                        rule = {
                            id: ruleId,
                            organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id),
                            name: input.name,
                            trigger: input.trigger,
                            templateId: input.templateId,
                            conditions: input.conditions || {},
                            isActive: input.isActive,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, database.insert(schema_1.smsAutomationRules).values(rule)];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, {
                                rule: rule,
                                success: true,
                                message: 'SMS automation rule created successfully'
                            }];
                    case 3:
                        error_10 = _d.sent();
                        console.error("[SMS] Error creating automation rule:", error_10);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create SMS automation rule'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get SMS automation rules
     */
    getAutomationRules: smsReadProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizationId, rules, error_11;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        organizationId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id);
                        return [4 /*yield*/, database.select().from(schema_1.smsAutomationRules).where(drizzle_orm_1.eq(schema_1.smsAutomationRules.organizationId, organizationId))];
                    case 2:
                        rules = _d.sent();
                        return [2 /*return*/, { rules: rules, success: true }];
                    case 3:
                        error_11 = _d.sent();
                        console.error("[SMS] Error fetching automation rules:", error_11);
                        return [2 /*return*/, { rules: [], success: false }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1, templateObject_2, templateObject_3;
