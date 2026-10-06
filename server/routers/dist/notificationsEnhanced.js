"use strict";
/**
 * Enhanced Notifications Router
 * Multi-channel notification delivery (in-app, email, SMS, Slack)
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
exports.notificationsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var notificationBroadcaster_1 = require("../websocket/notificationBroadcaster");
var notificationService_1 = require("../services/notificationService");
var notificationProcedure = trpc_1.createFeatureRestrictedProcedure("notifications:read");
var notificationCreateProcedure = trpc_1.createFeatureRestrictedProcedure("notifications:create");
var notificationEditProcedure = trpc_1.createFeatureRestrictedProcedure("notifications:edit");
var notificationDeleteProcedure = trpc_1.createFeatureRestrictedProcedure("notifications:delete");
exports.notificationsRouter = trpc_1.router({
    /**
     * Get user's unread notifications
     */
    unread: notificationProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, results;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.notifications)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.notifications.isRead, 0)))
                                .orderBy(drizzle_orm_1.desc(schema_1.notifications.createdAt))];
                    case 2:
                        results = _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    /**
     * Get paginated user notifications with filtering
     */
    list: notificationProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100)["default"](20),
        offset: zod_1.z.number().min(0)["default"](0),
        unreadOnly: zod_1.z.boolean()["default"](false),
        category: zod_1.z.string().optional(),
        type: zod_1.z["enum"](["info", "success", "warning", "error", "reminder"]).optional(),
        priority: zod_1.z["enum"](["low", "normal", "high"]).optional()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, whereConditions, whereClause, allResults, total, results;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { data: [], total: 0 }];
                        whereConditions = [drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id)];
                        if (input.unreadOnly) {
                            whereConditions.push(drizzle_orm_1.eq(schema_1.notifications.isRead, 0));
                        }
                        if (input.category) {
                            whereConditions.push(drizzle_orm_1.eq(schema_1.notifications.category, input.category));
                        }
                        if (input.type) {
                            whereConditions.push(drizzle_orm_1.eq(schema_1.notifications.type, input.type));
                        }
                        if (input.priority) {
                            whereConditions.push(drizzle_orm_1.eq(schema_1.notifications.priority, input.priority));
                        }
                        whereClause = drizzle_orm_1.and.apply(void 0, whereConditions);
                        return [4 /*yield*/, db.select().from(schema_1.notifications).where(whereClause)];
                    case 2:
                        allResults = _b.sent();
                        total = allResults.length;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.notifications)
                                .where(whereClause)
                                .orderBy(drizzle_orm_1.desc(schema_1.notifications.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 3:
                        results = _b.sent();
                        return [2 /*return*/, { data: results, total: total }];
                }
            });
        });
    }),
    /**
     * Get unread notification count
     */
    unreadCount: notificationProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, 0];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.notifications)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.notifications.isRead, 0)))];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result.length];
                }
            });
        });
    }),
    /**
     * Mark single notification as read
     */
    markAsRead: notificationEditProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .update(schema_1.notifications)
                                .set({
                                isRead: 1,
                                readAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.id, input.id), drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id)))];
                    case 2:
                        _b.sent();
                        notificationBroadcaster_1.broadcastNotificationRead(ctx.user.id, input.id);
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Mark all notifications as read
     */
    markAllAsRead: notificationEditProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .update(schema_1.notifications)
                                .set({
                                isRead: 1,
                                readAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.notifications.isRead, 0)))];
                    case 2:
                        _b.sent();
                        notificationBroadcaster_1.broadcastUnreadCountChanged(ctx.user.id, 0);
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Send multi-channel notification
     */
    send: notificationCreateProcedure
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        title: zod_1.z.string().min(1),
        message: zod_1.z.string().min(1),
        type: zod_1.z["enum"](["info", "success", "warning", "error", "reminder"])["default"]("info"),
        category: zod_1.z.string().optional(),
        entityType: zod_1.z.string().optional(),
        entityId: zod_1.z.string().optional(),
        actionUrl: zod_1.z.string().optional(),
        priority: zod_1.z["enum"](["low", "normal", "high"])["default"]("normal"),
        channels: zod_1.z.array(zod_1.z["enum"](["in-app", "email", "sms", "slack"]))["default"](["in-app"]),
        emailData: zod_1.z
            .object({
            to: zod_1.z.string().email(),
            subject: zod_1.z.string(),
            htmlContent: zod_1.z.string()
        })
            .optional(),
        smsData: zod_1.z
            .object({
            phoneNumber: zod_1.z.string(),
            message: zod_1.z.string()
        })
            .optional(),
        slackData: zod_1.z
            .object({
            channel: zod_1.z.string(),
            message: zod_1.z.string()
        })
            .optional(),
        expiresAt: zod_1.z.date().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, notificationService_1.notificationService.send({
                            userId: input.userId,
                            title: input.title,
                            message: input.message,
                            type: input.type,
                            category: input.category || "general",
                            entityType: input.entityType,
                            entityId: input.entityId,
                            actionUrl: input.actionUrl,
                            priority: input.priority,
                            channels: input.channels,
                            emailData: input.emailData,
                            smsData: input.smsData,
                            slackData: input.slackData,
                            expiresAt: input.expiresAt
                        })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    /**
     * Delete single notification
     */
    "delete": notificationDeleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db["delete"](schema_1.notifications)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.id, input), drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id)))];
                    case 2:
                        _b.sent();
                        notificationBroadcaster_1.broadcastNotificationDeleted(ctx.user.id, input);
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Delete all read notifications
     */
    deleteRead: notificationDeleteProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db["delete"](schema_1.notifications)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.notifications.isRead, 1)))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Delete all expired notifications
     */
    deleteExpired: notificationDeleteProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, now, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        now = new Date().toISOString();
                        return [4 /*yield*/, db["delete"](schema_1.notifications)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id), drizzle_orm_1.gt(schema_1.notifications.expiresAt, now)))];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Get notifications by category
     */
    byCategory: notificationProcedure
        .input(zod_1.z.object({
        category: zod_1.z.string(),
        unreadOnly: zod_1.z.boolean()["default"](false),
        limit: zod_1.z.number()["default"](20)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, whereConditions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        whereConditions = [
                            drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id),
                            drizzle_orm_1.eq(schema_1.notifications.category, input.category),
                        ];
                        if (input.unreadOnly) {
                            whereConditions.push(drizzle_orm_1.eq(schema_1.notifications.isRead, 0));
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.notifications)
                                .where(drizzle_orm_1.and.apply(void 0, whereConditions))
                                .orderBy(drizzle_orm_1.desc(schema_1.notifications.createdAt))
                                .limit(input.limit)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Get notifications by type
     */
    byType: notificationProcedure
        .input(zod_1.z.object({
        type: zod_1.z["enum"](["info", "success", "warning", "error", "reminder"]),
        limit: zod_1.z.number()["default"](20)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.notifications)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.notifications.type, input.type)))
                                .orderBy(drizzle_orm_1.desc(schema_1.notifications.createdAt))
                                .limit(input.limit)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Get high-priority notifications
     */
    highPriority: notificationProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.notifications)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.notifications.priority, "high"), drizzle_orm_1.eq(schema_1.notifications.isRead, 0)))
                                .orderBy(drizzle_orm_1.desc(schema_1.notifications.createdAt))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Get notification by ID with full details
     */
    getById: notificationProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.notifications)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.id, input), drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id)))];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    /**
     * Get email send history
     */
    emailHistory: notificationProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.emailGenerationHistory)
                                .where(drizzle_orm_1.eq(schema_1.emailGenerationHistory.userId, ctx.user.id))
                                .orderBy(drizzle_orm_1.desc(schema_1.emailGenerationHistory.sentAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Resend notification via different channel
     */
    resendVia: notificationCreateProcedure
        .input(zod_1.z.object({
        notificationId: zod_1.z.string(),
        channel: zod_1.z["enum"](["email", "sms", "slack"]),
        recipient: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, originalNotif, notif;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.notifications)
                                .where(drizzle_orm_1.eq(schema_1.notifications.id, input.notificationId))];
                    case 2:
                        originalNotif = _b.sent();
                        if (!originalNotif[0]) {
                            throw new Error("Notification not found");
                        }
                        notif = originalNotif[0];
                        if (!(input.channel === "email" && recipient)) return [3 /*break*/, 4];
                        return [4 /*yield*/, notificationService_1.notificationService.sendEmail(input.recipient || "", notif.title, notif.message, notif.userId)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        if (!(input.channel === "sms" && input.recipient)) return [3 /*break*/, 6];
                        return [4 /*yield*/, notificationService_1.notificationService.sendSms(input.recipient, notif.message)];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6:
                        if (!(input.channel === "slack")) return [3 /*break*/, 8];
                        return [4 /*yield*/, notificationService_1.notificationService.sendSlack(notif.message)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [2 /*return*/, { success: false, error: "Invalid channel or missing recipient" }];
                }
            });
        });
    }),
    /**
     * Subscribe to real-time notification updates
     */
    onNotification: notificationBroadcaster_1.notificationsSubscription
});
