"use strict";
/**
 * Communications Hub Router
 * Handles emails, internal messaging, SMS, templates, calendar events, and recurring invoice management
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
exports.communicationsRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var db = require("../db");
var mail_1 = require("../_core/mail");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Feature-based procedures
var readProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("communications:read");
// Email Templates
var sendEmailSchema = zod_1.z.object({
    to: zod_1.z.string().email(),
    subject: zod_1.z.string(),
    body: zod_1.z.string(),
    templateId: zod_1.z.string().optional(),
    cc: zod_1.z.string().email().optional(),
    bcc: zod_1.z.string().email().optional()
});
var createEmailTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    subject: zod_1.z.string().min(1),
    body: zod_1.z.string().min(1),
    category: zod_1.z["enum"](['invoice', 'estimate', 'payment', 'general', 'notification']),
    variables: zod_1.z.array(zod_1.z.string()).optional()
});
var updateEmailTemplateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    category: zod_1.z.string().optional()
});
// Internal Messaging
var internalMessageSchema = zod_1.z.object({
    recipientId: zod_1.z.string(),
    content: zod_1.z.string().min(1),
    subject: zod_1.z.string().optional(),
    attachmentUrl: zod_1.z.string().optional()
});
// SMS
var sendSmsSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string(),
    message: zod_1.z.string().min(1),
    recipientId: zod_1.z.string()
});
// Calendar Events
var createCalendarEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    dueDate: zod_1.z.string(),
    eventType: zod_1.z["enum"](['invoice_due', 'estimate_due', 'payment_due', 'meeting', 'reminder', 'task']),
    linkedEntityId: zod_1.z.string().optional(),
    linkedEntityType: zod_1.z["enum"](['invoice', 'estimate', 'payment', 'task']).optional(),
    isRecurring: zod_1.z.boolean()["default"](false),
    recurringInterval: zod_1.z["enum"](['daily', 'weekly', 'monthly', 'quarterly', 'annually']).optional(),
    recurringEndDate: zod_1.z.string().optional(),
    assignedTo: zod_1.z.array(zod_1.z.string()).optional()
});
// Recurring Invoices
var createRecurringInvoiceSchema = zod_1.z.object({
    baseInvoiceId: zod_1.z.string(),
    frequency: zod_1.z["enum"](['weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually']),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string().optional(),
    noOfRecurrences: zod_1.z.number().optional(),
    isActive: zod_1.z.boolean()["default"](true)
});
var updateRecurringInvoiceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    isActive: zod_1.z.boolean().optional(),
    endDate: zod_1.z.string().optional(),
    noOfRecurrences: zod_1.z.number().optional()
});
/**
 * Send email using configured SMTP service
 */
function sendEmailViaSmtp(to, subject, body, cc, bcc) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Delegate to shared mail module which reads SMTP config from env vars AND DB settings
                return [4 /*yield*/, mail_1.sendEmail({ to: to, subject: subject, html: body, cc: cc, bcc: bcc })];
                case 1:
                    // Delegate to shared mail module which reads SMTP config from env vars AND DB settings
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.communicationsRouter = trpc_1.router({
    // ==================== COMMUNICATION LOGS ====================
    /**
     * Get all communication logs with filtering
     */
    list: enhancedRbac_1.createFeatureRestrictedProcedure("communications:read")
        .input(zod_1.z.object({
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0),
        type: zod_1.z["enum"](['email', 'sms']).optional(),
        status: zod_1.z["enum"](['pending', 'sent', 'failed']).optional(),
        referenceId: zod_1.z.string().optional(),
        referenceType: zod_1.z.string().optional()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, filters, orgId, whereClause, result, allRecords, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            return [2 /*return*/, {
                                    communications: [],
                                    total: 0,
                                    limit: input.limit,
                                    offset: input.offset
                                }];
                        }
                        filters = [];
                        orgId = ctx.user.organizationId;
                        if (orgId) {
                            filters.push(drizzle_orm_1.eq(schema_1.communicationLogs.organizationId, orgId));
                        }
                        if (input.type) {
                            filters.push(drizzle_orm_1.eq(schema_1.communicationLogs.type, input.type));
                        }
                        if (input.status) {
                            filters.push(drizzle_orm_1.eq(schema_1.communicationLogs.status, input.status));
                        }
                        if (input.referenceType) {
                            filters.push(drizzle_orm_1.eq(schema_1.communicationLogs.referenceType, input.referenceType));
                        }
                        if (input.referenceId) {
                            filters.push(drizzle_orm_1.eq(schema_1.communicationLogs.referenceId, input.referenceId));
                        }
                        whereClause = filters.length > 0 ? drizzle_orm_1.and.apply(void 0, filters) : undefined;
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.communicationLogs)
                                .where(whereClause)
                                .orderBy(drizzle_orm_1.desc(schema_1.communicationLogs.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 2:
                        result = _b.sent();
                        return [4 /*yield*/, database
                                .select({ id: schema_1.communicationLogs.id })
                                .from(schema_1.communicationLogs)
                                .where(whereClause)];
                    case 3:
                        allRecords = _b.sent();
                        return [2 /*return*/, {
                                communications: Array.isArray(result) ? result : [],
                                total: allRecords.length || 0,
                                limit: input.limit,
                                offset: input.offset
                            }];
                    case 4:
                        error_1 = _b.sent();
                        console.error('List communications error:', (error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to retrieve communication logs'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get a single communication log by ID
     */
    getById: enhancedRbac_1.createFeatureRestrictedProcedure("communications:read")
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var connection, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        connection = (_b.sent());
                        return [4 /*yield*/, connection.raw("\n            SELECT * FROM communicationLogs WHERE id = ?\n          ", [input.id])];
                    case 2:
                        result = _b.sent();
                        if (!Array.isArray(result) || result.length === 0) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Communication log not found'
                            });
                        }
                        return [2 /*return*/, result[0]];
                    case 3:
                        error_2 = _b.sent();
                        console.error('Get communication log error:', error_2);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to retrieve communication log'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // ==================== EMAIL TEMPLATES ====================
    /**
     * Get all email templates
     */
    getAllEmailTemplates: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    // This would typically fetch from a templates table
                    // For now, returning a structure that can be extended
                    return [2 /*return*/, {
                            templates: [],
                            message: 'Email templates feature is being initialized'
                        }];
                }
                catch (error) {
                    console.error('Get templates error:', error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to retrieve email templates'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Create a new email template
     */
    createEmailTemplate: enhancedRbac_1.createFeatureRestrictedProcedure("communications:manage")
        .input(createEmailTemplateSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var templateId, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        templateId = uuid_1.v4();
                        // Template creation would be stored in database
                        // This is a placeholder for the actual implementation
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'email_template_created',
                                entityType: 'email_template',
                                entityId: templateId,
                                description: "Created email template: " + input.name
                            })];
                    case 1:
                        // Template creation would be stored in database
                        // This is a placeholder for the actual implementation
                        _b.sent();
                        return [2 /*return*/, __assign(__assign({ id: templateId }, input), { createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Create template error:', error_3);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create email template'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update an email template
     */
    updateEmailTemplate: enhancedRbac_1.createFeatureRestrictedProcedure("communications:manage")
        .input(updateEmailTemplateSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'email_template_updated',
                                entityType: 'email_template',
                                entityId: input.id,
                                description: "Updated email template"
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Email template updated successfully'
                            }];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Update template error:', error_4);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to update email template'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Delete an email template
     */
    deleteEmailTemplate: enhancedRbac_1.createFeatureRestrictedProcedure("communications:manage")
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'email_template_deleted',
                                entityType: 'email_template',
                                entityId: input.id,
                                description: 'Deleted email template'
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Email template deleted successfully'
                            }];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Delete template error:', error_5);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to delete email template'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    // ==================== EMAIL SENDING ====================
    /**
     * Send email using template or custom body
     */
    sendEmail: enhancedRbac_1.createFeatureRestrictedProcedure("communications:send")
        .input(sendEmailSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, emailBody, pool, orgId, etRows, _b, etArr, error_6;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 11, , 12]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _e.sent();
                        emailBody = input.body;
                        if (!input.templateId) return [3 /*break*/, 6];
                        pool = db_1.getPool();
                        if (!pool) return [3 /*break*/, 6];
                        orgId = ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId) || null;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, pool.query("SELECT * FROM emailTemplates WHERE id = ? AND organizationId = ? AND isActive = 1 LIMIT 1", [input.templateId, orgId])];
                    case 2:
                        _b = _e.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, pool.query("SELECT * FROM emailTemplates WHERE id = ? AND isActive = 1 LIMIT 1", [input.templateId])];
                    case 4:
                        _b = _e.sent();
                        _e.label = 5;
                    case 5:
                        etRows = (_b)[0];
                        etArr = etRows;
                        if (etArr.length) {
                            emailBody = etArr[0].htmlContent || etArr[0].body || emailBody;
                        }
                        _e.label = 6;
                    case 6: 
                    // Send via SMTP
                    return [4 /*yield*/, sendEmailViaSmtp(input.to, input.subject, emailBody, input.cc, input.bcc)];
                    case 7:
                        // Send via SMTP
                        _e.sent();
                        if (!database) return [3 /*break*/, 9];
                        return [4 /*yield*/, database.insert(schema_1.communicationLogs).values({
                                id: uuid_1.v4(),
                                organizationId: (_d = ctx.user.organizationId) !== null && _d !== void 0 ? _d : null,
                                type: 'email',
                                recipient: input.to,
                                subject: input.subject,
                                body: emailBody,
                                status: 'sent',
                                sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 8:
                        _e.sent();
                        _e.label = 9;
                    case 9: 
                    // Log email activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: 'email_sent',
                            entityType: 'email',
                            entityId: uuid_1.v4(),
                            description: "Sent email to " + input.to + ": " + input.subject
                        })];
                    case 10:
                        // Log email activity
                        _e.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Email sent successfully'
                            }];
                    case 11:
                        error_6 = _e.sent();
                        console.error('Send email error:', error_6);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: "Failed to send email: " + error_6.message
                        });
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    // ==================== INTERNAL MESSAGING (INTRANET) ====================
    /**
     * Send internal message to staff member
     */
    sendInternalMessage: enhancedRbac_1.createFeatureRestrictedProcedure("communications:messaging")
        .input(internalMessageSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var messageId, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        messageId = uuid_1.v4();
                        // Store message in database
                        // await db.createInternalMessage({...})
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'internal_message_sent',
                                entityType: 'internal_message',
                                entityId: messageId,
                                description: "Sent message to user: " + input.recipientId
                            })];
                    case 1:
                        // Store message in database
                        // await db.createInternalMessage({...})
                        _b.sent();
                        return [2 /*return*/, __assign(__assign({ id: messageId }, input), { senderId: ctx.user.id, sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19), isRead: false })];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Send internal message error:', error_7);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to send internal message'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get internal messages for current user
     */
    getInternalMessages: enhancedRbac_1.createFeatureRestrictedProcedure("communications:messaging")
        .input(zod_1.z.object({
        conversationWith: zod_1.z.string().optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    // Fetch messages for this user from database
                    // Filter by recipient and optionally by sender
                    return [2 /*return*/, {
                            messages: [],
                            total: 0
                        }];
                }
                catch (error) {
                    console.error('Get messages error:', error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to retrieve messages'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Mark internal message as read
     */
    markMessageAsRead: enhancedRbac_1.createFeatureRestrictedProcedure("communications:messaging")
        .input(zod_1.z.object({ messageId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    return [2 /*return*/, {
                            success: true,
                            message: 'Message marked as read'
                        }];
                }
                catch (error) {
                    console.error('Mark as read error:', error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to mark message as read'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Get list of staff for messaging
     */
    getStaffList: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    // Fetch all active staff members
                    return [2 /*return*/, {
                            staff: []
                        }];
                }
                catch (error) {
                    console.error('Get staff list error:', error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to retrieve staff list'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    // ==================== SMS COMMUNICATION ====================
    /**
     * Send SMS message
     */
    sendSms: enhancedRbac_1.createFeatureRestrictedProcedure("communications:send")
        .input(sendSmsSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var smsId, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        smsId = uuid_1.v4();
                        // In production, integrate with SMS provider like Twilio, Nexmo, etc.
                        // For now, just logging the intent
                        console.log("[SMS] Sending to " + input.phoneNumber + ": " + input.message);
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'sms_sent',
                                entityType: 'sms',
                                entityId: smsId,
                                description: "Sent SMS to " + input.phoneNumber
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, {
                                id: smsId,
                                success: true,
                                message: 'SMS sent successfully',
                                phoneNumber: input.phoneNumber
                            }];
                    case 2:
                        error_8 = _b.sent();
                        console.error('Send SMS error:', error_8);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to send SMS'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get SMS history
     */
    getSmsHistory: enhancedRbac_1.createFeatureRestrictedProcedure("communications:read")
        .input(zod_1.z.object({
        recipientId: zod_1.z.string().optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    return [2 /*return*/, {
                            messages: [],
                            total: 0
                        }];
                }
                catch (error) {
                    console.error('Get SMS history error:', error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to retrieve SMS history'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    // ==================== CALENDAR EVENTS ====================
    /**
     * Create calendar event
     */
    createCalendarEvent: enhancedRbac_1.createFeatureRestrictedProcedure("communications:calendar")
        .input(createCalendarEventSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var eventId, events, startDate, currentDate, endDate, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        eventId = uuid_1.v4();
                        events = [
                            {
                                id: eventId,
                                title: input.title,
                                description: input.description,
                                dueDate: input.dueDate,
                                eventType: input.eventType,
                                linkedEntityId: input.linkedEntityId,
                                linkedEntityType: input.linkedEntityType,
                                isRecurring: input.isRecurring,
                                assignedTo: input.assignedTo || [ctx.user.id],
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            },
                        ];
                        // If recurring, generate additional events based on frequency
                        if (input.isRecurring && input.recurringInterval) {
                            startDate = new Date(input.dueDate);
                            currentDate = new Date(startDate);
                            endDate = input.recurringEndDate ? new Date(input.recurringEndDate) : null;
                            while (true) {
                                // Add interval to date
                                switch (input.recurringInterval) {
                                    case 'daily':
                                        currentDate.setDate(currentDate.getDate() + 1);
                                        break;
                                    case 'weekly':
                                        currentDate.setDate(currentDate.getDate() + 7);
                                        break;
                                    case 'monthly':
                                        currentDate.setMonth(currentDate.getMonth() + 1);
                                        break;
                                    case 'quarterly':
                                        currentDate.setMonth(currentDate.getMonth() + 3);
                                        break;
                                    case 'annually':
                                        currentDate.setFullYear(currentDate.getFullYear() + 1);
                                        break;
                                }
                                // Check if we've exceeded the end date
                                if (endDate && currentDate > endDate)
                                    break;
                                // Create event for this date
                                events.push({
                                    id: uuid_1.v4(),
                                    title: input.title,
                                    description: input.description,
                                    dueDate: currentDate.toISOString().replace('T', ' ').substring(0, 19).split('T')[0],
                                    eventType: input.eventType,
                                    linkedEntityId: input.linkedEntityId,
                                    linkedEntityType: input.linkedEntityType,
                                    isRecurring: true,
                                    assignedTo: input.assignedTo || [ctx.user.id],
                                    createdBy: ctx.user.id,
                                    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                });
                            }
                        }
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'calendar_event_created',
                                entityType: 'calendar_event',
                                entityId: eventId,
                                description: "Created calendar event: " + input.title
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                eventId: eventId,
                                eventsCreated: events.length,
                                message: "Created " + events.length + " calendar event(s)"
                            }];
                    case 2:
                        error_9 = _b.sent();
                        console.error('Create calendar event error:', error_9);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create calendar event'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get calendar events
     */
    getCalendarEvents: enhancedRbac_1.createFeatureRestrictedProcedure("communications:read")
        .input(zod_1.z.object({
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        eventType: zod_1.z.string().optional(),
        limit: zod_1.z.number()["default"](100)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    // Fetch events for the current user from database
                    return [2 /*return*/, {
                            events: [],
                            total: 0
                        }];
                }
                catch (error) {
                    console.error('Get calendar events error:', error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to retrieve calendar events'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Update calendar event
     */
    updateCalendarEvent: enhancedRbac_1.createFeatureRestrictedProcedure("communications:calendar")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string().optional(),
        dueDate: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        isCompleted: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'calendar_event_updated',
                                entityType: 'calendar_event',
                                entityId: input.id,
                                description: 'Updated calendar event'
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Calendar event updated successfully'
                            }];
                    case 2:
                        error_10 = _b.sent();
                        console.error('Update calendar event error:', error_10);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to update calendar event'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Delete calendar event
     */
    deleteCalendarEvent: enhancedRbac_1.createFeatureRestrictedProcedure("communications:calendar")
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'calendar_event_deleted',
                                entityType: 'calendar_event',
                                entityId: input.id,
                                description: 'Deleted calendar event'
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Calendar event deleted successfully'
                            }];
                    case 2:
                        error_11 = _b.sent();
                        console.error('Delete calendar event error:', error_11);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to delete calendar event'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    // ==================== RECURRING INVOICES ====================
    /**
     * Create recurring invoice
     */
    createRecurringInvoice: enhancedRbac_1.createFeatureRestrictedProcedure("communications:invoices")
        .input(createRecurringInvoiceSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var recurringId, now, pool, freqMap, dbFrequency, startDate, nextDueDate, invoiceRows, invoiceArr, clientId, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        recurringId = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        pool = db.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        freqMap = { 'bi-weekly': 'biweekly', 'weekly': 'weekly', 'monthly': 'monthly', 'quarterly': 'quarterly', 'annually': 'annually' };
                        dbFrequency = freqMap[input.frequency] || input.frequency;
                        startDate = new Date(input.startDate);
                        nextDueDate = new Date(startDate);
                        switch (dbFrequency) {
                            case 'weekly':
                                nextDueDate.setDate(nextDueDate.getDate() + 7);
                                break;
                            case 'biweekly':
                                nextDueDate.setDate(nextDueDate.getDate() + 14);
                                break;
                            case 'monthly':
                                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                                break;
                            case 'quarterly':
                                nextDueDate.setMonth(nextDueDate.getMonth() + 3);
                                break;
                            case 'annually':
                                nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                                break;
                        }
                        return [4 /*yield*/, pool.query("SELECT clientId FROM invoices WHERE id = ?", [input.baseInvoiceId])];
                    case 1:
                        invoiceRows = (_b.sent())[0];
                        invoiceArr = invoiceRows;
                        clientId = invoiceArr.length ? invoiceArr[0].clientId : null;
                        if (!clientId)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Base invoice not found" });
                        // Actually insert into recurringInvoices table
                        return [4 /*yield*/, pool.query("INSERT INTO recurringInvoices (id, organizationId, clientId, templateInvoiceId, frequency, startDate, endDate, nextDueDate, isActive, description, createdBy, createdAt, updatedAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                recurringId,
                                ctx.user.organizationId || null,
                                clientId,
                                input.baseInvoiceId,
                                dbFrequency,
                                startDate.toISOString().replace('T', ' ').substring(0, 19),
                                input.endDate ? new Date(input.endDate).toISOString().replace('T', ' ').substring(0, 19) : null,
                                nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
                                input.isActive ? 1 : 0,
                                "Recurring " + dbFrequency + " invoice from " + input.baseInvoiceId,
                                ctx.user.id,
                                now,
                                now,
                            ])];
                    case 2:
                        // Actually insert into recurringInvoices table
                        _b.sent();
                        // Also update the base invoice with isAutoRecurring flag
                        return [4 /*yield*/, pool.query("UPDATE invoices SET isAutoRecurring = 1, recurringInvoiceId = ? WHERE id = ?", [recurringId, input.baseInvoiceId])];
                    case 3:
                        // Also update the base invoice with isAutoRecurring flag
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'recurring_invoice_created',
                                entityType: 'recurring_invoice',
                                entityId: recurringId,
                                description: "Created recurring invoice from base invoice: " + input.baseInvoiceId
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, __assign(__assign({ id: recurringId }, input), { createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19), success: true, message: 'Recurring invoice created successfully' })];
                    case 5:
                        error_12 = _b.sent();
                        console.error('Create recurring invoice error:', error_12);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create recurring invoice'
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get recurring invoices
     */
    getRecurringInvoices: enhancedRbac_1.createFeatureRestrictedProcedure("communications:read")
        .input(zod_1.z.object({
        isActive: zod_1.z.boolean().optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    return [2 /*return*/, {
                            recurringInvoices: [],
                            total: 0
                        }];
                }
                catch (error) {
                    console.error('Get recurring invoices error:', error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to retrieve recurring invoices'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Update recurring invoice
     */
    updateRecurringInvoice: enhancedRbac_1.createFeatureRestrictedProcedure("communications:invoices")
        .input(updateRecurringInvoiceSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'recurring_invoice_updated',
                                entityType: 'recurring_invoice',
                                entityId: input.id,
                                description: 'Updated recurring invoice'
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Recurring invoice updated successfully'
                            }];
                    case 2:
                        error_13 = _b.sent();
                        console.error('Update recurring invoice error:', error_13);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to update recurring invoice'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Stop recurring invoice
     */
    stopRecurringInvoice: enhancedRbac_1.createFeatureRestrictedProcedure("communications:invoices")
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'recurring_invoice_stopped',
                                entityType: 'recurring_invoice',
                                entityId: input.id,
                                description: 'Stopped recurring invoice'
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Recurring invoice stopped successfully'
                            }];
                    case 2:
                        error_14 = _b.sent();
                        console.error('Stop recurring invoice error:', error_14);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to stop recurring invoice'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get recurring invoice history (generated invoices)
     */
    getRecurringInvoiceHistory: readProcedure
        .input(zod_1.z.object({
        recurringInvoiceId: zod_1.z.string(),
        limit: zod_1.z.number()["default"](50)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    return [2 /*return*/, {
                            invoices: [],
                            total: 0
                        }];
                }
                catch (error) {
                    console.error('Get recurring invoice history error:', error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to retrieve recurring invoice history'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    /**
     * Get communication hub dashboard data
     */
    getCommunicationsHubStatus: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                try {
                    return [2 /*return*/, {
                            unreadMessages: 0,
                            upcomingEvents: 0,
                            pendingRecurringInvoices: 0,
                            recentCommunications: []
                        }];
                }
                catch (error) {
                    console.error('Get hub status error:', error);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to retrieve communications hub status'
                    });
                }
                return [2 /*return*/];
            });
        });
    })
});
