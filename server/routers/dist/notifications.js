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
exports.notificationsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var notificationBroadcaster_1 = require("../websocket/notificationBroadcaster");
exports.notificationsRouter = trpc_1.router({
    /**
     * Get user's unread notifications
     */
    unread: trpc_1.protectedProcedure.query(function (_a) {
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
     * Get user's notifications with optional filtering
     */
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number()["default"](20),
        offset: zod_1.z.number()["default"](0),
        unreadOnly: zod_1.z.boolean()["default"](false),
        category: zod_1.z.string().optional()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, whereConditions, results;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        whereConditions = [drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id)];
                        if (input.unreadOnly) {
                            whereConditions.push(drizzle_orm_1.eq(schema_1.notifications.isRead, 0));
                        }
                        if (input.category) {
                            whereConditions.push(drizzle_orm_1.eq(schema_1.notifications.type, input.category));
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.notifications)
                                .where(drizzle_orm_1.and.apply(void 0, whereConditions))
                                .orderBy(drizzle_orm_1.desc(schema_1.notifications.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 2:
                        results = _b.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    }),
    /**
     * Get count of unread notifications
     */
    unreadCount: trpc_1.protectedProcedure.query(function (_a) {
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
     * Mark notification as read
     */
    markAsRead: trpc_1.createFeatureRestrictedProcedure("notifications:edit")
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
                                readAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.id, input.id), drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id)))];
                    case 2:
                        _b.sent();
                        // Broadcast read event
                        notificationBroadcaster_1.broadcastNotificationRead(ctx.user.id, input.id);
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Mark notification as unread
     */
    markAsUnread: trpc_1.createFeatureRestrictedProcedure("notifications:edit")
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
                                isRead: 0,
                                readAt: null
                            })
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.id, input.id), drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id)))];
                    case 2:
                        _b.sent();
                        notificationBroadcaster_1.broadcastUnreadCountChanged(ctx.user.id, 1);
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Mark all notifications as read
     */
    markAllAsRead: trpc_1.createFeatureRestrictedProcedure("notifications:edit").mutation(function (_a) {
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
                                readAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.notifications.isRead, 0)))];
                    case 2:
                        _b.sent();
                        // Broadcast count change
                        notificationBroadcaster_1.broadcastUnreadCountChanged(ctx.user.id, 0);
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Create notification (internal use by other routers)
     */
    create: trpc_1.createFeatureRestrictedProcedure("notifications:create")
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        title: zod_1.z.string(),
        message: zod_1.z.string(),
        type: zod_1.z["enum"](["info", "success", "warning", "error", "reminder"])["default"]("info"),
        category: zod_1.z.string().optional(),
        entityType: zod_1.z.string().optional(),
        entityId: zod_1.z.string().optional(),
        actionUrl: zod_1.z.string().optional(),
        priority: zod_1.z["enum"](["low", "normal", "high"])["default"]("normal"),
        expiresAt: zod_1.z.date().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, notificationData;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        notificationData = {
                            id: id,
                            userId: input.userId,
                            title: input.title,
                            message: input.message,
                            type: input.type,
                            category: input.category,
                            entityType: input.entityType,
                            entityId: input.entityId,
                            actionUrl: input.actionUrl,
                            priority: input.priority,
                            expiresAt: (_b = input.expiresAt) === null || _b === void 0 ? void 0 : _b.toISOString().replace('T', ' ').substring(0, 19),
                            isRead: 0,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            readAt: null
                        };
                        return [4 /*yield*/, db.insert(schema_1.notifications).values(notificationData)];
                    case 2:
                        _c.sent();
                        // Broadcast notification to subscribed clients
                        notificationBroadcaster_1.broadcastNotification(input.userId, notificationData);
                        notificationBroadcaster_1.broadcastUnreadCountChanged(input.userId, 1); // Increment unread count
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    /**
     * Delete notification
     */
    "delete": trpc_1.createFeatureRestrictedProcedure("notifications:delete")
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
                        // Broadcast delete event
                        notificationBroadcaster_1.broadcastNotificationDeleted(ctx.user.id, input);
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Delete all read notifications
     */
    deleteRead: trpc_1.createFeatureRestrictedProcedure("notifications:delete").mutation(function (_a) {
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
     * Get notifications by category
     */
    byCategory: trpc_1.createFeatureRestrictedProcedure("notifications:read")
        .input(zod_1.z.object({
        category: zod_1.z.string(),
        unreadOnly: zod_1.z.boolean()["default"](false)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        query = db
                            .select()
                            .from(schema_1.notifications)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.notifications.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.notifications.category, input.category)));
                        if (input.unreadOnly) {
                            query = query.where(drizzle_orm_1.eq(schema_1.notifications.isRead, 0));
                        }
                        return [4 /*yield*/, query.orderBy(drizzle_orm_1.desc(schema_1.notifications.createdAt))];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Subscribe to real-time notification updates
     */
    onNotification: notificationBroadcaster_1.notificationsSubscription
});
