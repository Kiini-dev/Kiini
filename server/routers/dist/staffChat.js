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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.staffChatRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
function normalizeMembers(members) {
    if (Array.isArray(members)) {
        return members.filter(function (m) { return typeof m === "string"; });
    }
    if (typeof members === "string") {
        try {
            var parsed = JSON.parse(members);
            if (Array.isArray(parsed)) {
                return parsed.filter(function (m) { return typeof m === "string"; });
            }
        }
        catch (_a) {
            return [];
        }
    }
    return [];
}
// Define typed procedures
var createProcedure = trpc_1.createFeatureRestrictedProcedure("chat:send");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("chat:read");
var deleteProcedure = trpc_1.createFeatureRestrictedProcedure("chat:delete");
exports.staffChatRouter = trpc_1.router({
    // ===== CHANNEL MANAGEMENT =====
    // Create a channel (team or private)
    createChannel: createProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        type: zod_1.z["enum"](["team", "private"]),
        description: zod_1.z.string().max(255).optional(),
        members: zod_1.z.array(zod_1.z.string()).min(1)
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, channelId, memberList, existing, found, rows;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        channelId = uuid_1.v4();
                        memberList = Array.from(new Set(__spreadArrays([ctx.user.id], input.members)));
                        if (!(input.type === "private" && memberList.length === 2)) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.select().from(schema_1.staffChatChannels).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.staffChatChannels.type, "private"), drizzle_orm_1.eq(schema_1.staffChatChannels.isActive, 1)))];
                    case 2:
                        existing = _c.sent();
                        found = existing.find(function (ch) {
                            var chMembers = ch.members || [];
                            return chMembers.length === 2 && memberList.every(function (m) { return chMembers.includes(m); });
                        });
                        if (found)
                            return [2 /*return*/, found];
                        _c.label = 3;
                    case 3: return [4 /*yield*/, db.insert(schema_1.staffChatChannels).values({
                            id: channelId,
                            name: input.name,
                            type: input.type,
                            description: (_b = input.description) !== null && _b !== void 0 ? _b : null,
                            members: memberList,
                            createdBy: ctx.user.id,
                            isActive: 1
                        })];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, db.select().from(schema_1.staffChatChannels).where(drizzle_orm_1.eq(schema_1.staffChatChannels.id, channelId)).limit(1)];
                    case 5:
                        rows = _c.sent();
                        return [2 /*return*/, rows[0]];
                }
            });
        });
    }),
    // List channels the user belongs to (+ "general" always)
    listChannels: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, allChannels, myChannels, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, [
                                    { id: "general", name: "General Chat", type: "general", description: "Open channel for all staff", members: [], createdBy: "system", isActive: 1, createdAt: null, updatedAt: null },
                                ]];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_1.staffChatChannels).where(drizzle_orm_1.eq(schema_1.staffChatChannels.isActive, 1))];
                    case 3:
                        allChannels = _b.sent();
                        myChannels = allChannels.filter(function (ch) {
                            var members = normalizeMembers(ch.members);
                            return ch.type === "team" || members.includes(ctx.user.id);
                        });
                        return [2 /*return*/, __spreadArrays([
                                { id: "general", name: "General Chat", type: "general", description: "Open channel for all staff", members: [], createdBy: "system", isActive: 1, createdAt: null, updatedAt: null }
                            ], myChannels)];
                    case 4:
                        error_1 = _b.sent();
                        console.error("staffChat.listChannels error:", error_1);
                        return [2 /*return*/, [
                                { id: "general", name: "General Chat", type: "general", description: "Open channel for all staff", members: [], createdBy: "system", isActive: 1, createdAt: null, updatedAt: null },
                            ]];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Update channel
    updateChannel: createProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(255).optional(),
        members: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, updates, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        updates = {};
                        if (input.name)
                            updates.name = input.name;
                        if (input.description !== undefined)
                            updates.description = input.description;
                        if (input.members)
                            updates.members = input.members;
                        return [4 /*yield*/, db.update(schema_1.staffChatChannels).set(updates).where(drizzle_orm_1.eq(schema_1.staffChatChannels.id, input.id))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.staffChatChannels).where(drizzle_orm_1.eq(schema_1.staffChatChannels.id, input.id)).limit(1)];
                    case 3:
                        rows = _b.sent();
                        return [2 /*return*/, rows[0]];
                }
            });
        });
    }),
    // Delete / archive channel
    deleteChannel: deleteProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        return [4 /*yield*/, db.update(schema_1.staffChatChannels).set({ isActive: 0 }).where(drizzle_orm_1.eq(schema_1.staffChatChannels.id, input.id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ===== MESSAGES =====
    // Send a new message
    sendMessage: createProcedure
        .input(zod_1.z.object({
        content: zod_1.z.string().min(1).max(2000),
        channelId: zod_1.z.string()["default"]("general"),
        emoji: zod_1.z.string().optional(),
        replyToId: zod_1.z.string().optional(),
        fileUrl: zod_1.z.string().max(2000).optional(),
        fileName: zod_1.z.string().max(255).optional(),
        fileType: zod_1.z.string().max(50).optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, replyToUser, replyMsg, messageId, rows;
            var _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _h.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        if (!input.replyToId) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.select().from(schema_1.staffChatMessages).where(drizzle_orm_1.eq(schema_1.staffChatMessages.id, input.replyToId)).limit(1)];
                    case 2:
                        replyMsg = _h.sent();
                        replyToUser = (_b = replyMsg[0]) === null || _b === void 0 ? void 0 : _b.userName;
                        _h.label = 3;
                    case 3:
                        messageId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.staffChatMessages).values({
                                id: messageId,
                                channelId: input.channelId,
                                userId: ctx.user.id,
                                userName: ctx.user.name || ctx.user.email || "Unknown",
                                content: input.content,
                                emoji: (_c = input.emoji) !== null && _c !== void 0 ? _c : null,
                                replyToId: (_d = input.replyToId) !== null && _d !== void 0 ? _d : null,
                                replyToUser: replyToUser !== null && replyToUser !== void 0 ? replyToUser : null,
                                fileUrl: (_e = input.fileUrl) !== null && _e !== void 0 ? _e : null,
                                fileName: (_f = input.fileName) !== null && _f !== void 0 ? _f : null,
                                fileType: (_g = input.fileType) !== null && _g !== void 0 ? _g : null,
                                isEdited: 0
                            })];
                    case 4:
                        _h.sent();
                        return [4 /*yield*/, db.select().from(schema_1.staffChatMessages).where(drizzle_orm_1.eq(schema_1.staffChatMessages.id, messageId)).limit(1)];
                    case 5:
                        rows = _h.sent();
                        return [2 /*return*/, rows[0]];
                }
            });
        });
    }),
    // Get messages with pagination, filtered by channel
    getMessages: readProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.string()["default"]("general"),
        limit: zod_1.z.number().max(100)["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, countRows, total;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { messages: [], total: 0, hasMore: false }];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.staffChatMessages)
                                .where(drizzle_orm_1.eq(schema_1.staffChatMessages.channelId, input.channelId))
                                .orderBy(drizzle_orm_1.desc(schema_1.staffChatMessages.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 2:
                        rows = _b.sent();
                        return [4 /*yield*/, db.select({ id: schema_1.staffChatMessages.id }).from(schema_1.staffChatMessages)
                                .where(drizzle_orm_1.eq(schema_1.staffChatMessages.channelId, input.channelId))];
                    case 3:
                        countRows = _b.sent();
                        total = countRows.length;
                        return [2 /*return*/, {
                                messages: rows.reverse(),
                                total: total,
                                hasMore: input.offset + input.limit < total
                            }];
                }
            });
        });
    }),
    // Delete a message (only by sender or admin)
    deleteMessage: deleteProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        return [4 /*yield*/, db.select().from(schema_1.staffChatMessages).where(drizzle_orm_1.eq(schema_1.staffChatMessages.id, input.id)).limit(1)];
                    case 2:
                        rows = _b.sent();
                        if (!rows.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Message not found" });
                        }
                        message = rows[0];
                        if (message.userId !== ctx.user.id && ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "You can only delete your own messages" });
                        }
                        return [4 /*yield*/, db["delete"](schema_1.staffChatMessages).where(drizzle_orm_1.eq(schema_1.staffChatMessages.id, input.id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Edit a message (only by sender)
    editMessage: createProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        content: zod_1.z.string().min(1).max(2000),
        emoji: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, message, updated;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        return [4 /*yield*/, db.select().from(schema_1.staffChatMessages).where(drizzle_orm_1.eq(schema_1.staffChatMessages.id, input.id)).limit(1)];
                    case 2:
                        rows = _c.sent();
                        if (!rows.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Message not found" });
                        }
                        message = rows[0];
                        if (message.userId !== ctx.user.id) {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "You can only edit your own messages" });
                        }
                        return [4 /*yield*/, db.update(schema_1.staffChatMessages).set({
                                content: input.content,
                                emoji: (_b = input.emoji) !== null && _b !== void 0 ? _b : message.emoji,
                                isEdited: 1
                            }).where(drizzle_orm_1.eq(schema_1.staffChatMessages.id, input.id))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, db.select().from(schema_1.staffChatMessages).where(drizzle_orm_1.eq(schema_1.staffChatMessages.id, input.id)).limit(1)];
                    case 4:
                        updated = _c.sent();
                        return [2 /*return*/, updated[0]];
                }
            });
        });
    }),
    // Get online members (users who sent messages recently)
    getMembers: readProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, rows, seen, _i, rows_1, row;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.staffChatMessages)
                            .orderBy(drizzle_orm_1.desc(schema_1.staffChatMessages.createdAt))
                            .limit(200)];
                case 2:
                    rows = _a.sent();
                    seen = new Map();
                    for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        row = rows_1[_i];
                        if (!seen.has(row.userId)) {
                            seen.set(row.userId, { userId: row.userId, userName: row.userName, lastSeen: row.createdAt || "" });
                        }
                    }
                    return [2 /*return*/, Array.from(seen.values())];
            }
        });
    }); }),
    // Search messages
    searchMessages: readProcedure
        .input(zod_1.z.object({ query: zod_1.z.string().min(1), channelId: zod_1.z.string().optional() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, q, conditions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        q = "%" + input.query + "%";
                        conditions = [
                            drizzle_orm_1.or(drizzle_orm_1.like(schema_1.staffChatMessages.content, q), drizzle_orm_1.like(schema_1.staffChatMessages.userName, q)),
                        ];
                        if (input.channelId) {
                            conditions.push(drizzle_orm_1.eq(schema_1.staffChatMessages.channelId, input.channelId));
                        }
                        return [2 /*return*/, db.select().from(schema_1.staffChatMessages).where(conditions.length > 1 ? drizzle_orm_1.and.apply(void 0, conditions) : conditions[0]).orderBy(drizzle_orm_1.desc(schema_1.staffChatMessages.createdAt)).limit(50)];
                }
            });
        });
    }),
    // Clear chat history (admin only)
    clearHistory: deleteProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Only admins can clear chat history" });
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        return [4 /*yield*/, db["delete"](schema_1.staffChatMessages)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Mark messages as read up to a given message ID
    markChatRead: createProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.string()["default"]("general"),
        lastReadMessageId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = db_1.getPool();
                        if (!p)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        id = "crs_" + ctx.user.id + "_" + input.channelId;
                        return [4 /*yield*/, p.query("INSERT INTO chat_read_status (id, user_id, channel_id, last_read_message_id)\n         VALUES (?, ?, ?, ?)\n         ON DUPLICATE KEY UPDATE last_read_message_id = VALUES(last_read_message_id), read_at = NOW()", [id, ctx.user.id, input.channelId, input.lastReadMessageId])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Get unread message count per channel for current user
    getUnreadCounts: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = db_1.getPool();
                        if (!p)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, p.query("SELECT m.channelId AS channelId, COUNT(*) AS unreadCount\n       FROM staffChatMessages m\n       LEFT JOIN chat_read_status crs\n         ON crs.user_id = ? AND crs.channel_id = m.channelId\n       WHERE m.userId != ?\n         AND (crs.last_read_message_id IS NULL OR m.id > crs.last_read_message_id)\n       GROUP BY m.channelId", [ctx.user.id, ctx.user.id])];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    }),
    // Get unread messages only (for floating notification popups)
    getUnreadMessages: readProcedure
        .input(zod_1.z.object({
        channelId: zod_1.z.string().optional(),
        limit: zod_1.z.number().max(50)["default"](10)
    }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, query, params, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = db_1.getPool();
                        if (!p)
                            return [2 /*return*/, []];
                        query = input.channelId
                            ? "SELECT m.*\n           FROM staffChatMessages m\n           LEFT JOIN chat_read_status crs\n             ON crs.user_id = ? AND crs.channel_id = m.channel_id\n           WHERE m.user_id != ?\n             AND m.channel_id = ?\n             AND (crs.last_read_message_id IS NULL OR m.id > crs.last_read_message_id)\n           ORDER BY m.created_at DESC\n           LIMIT ?"
                            : "SELECT m.*\n           FROM staffChatMessages m\n           LEFT JOIN chat_read_status crs\n             ON crs.user_id = ? AND crs.channel_id = m.channel_id\n           WHERE m.user_id != ?\n             AND (crs.last_read_message_id IS NULL OR m.id > crs.last_read_message_id)\n           ORDER BY m.created_at DESC\n           LIMIT ?";
                        params = input.channelId
                            ? [ctx.user.id, ctx.user.id, input.channelId, input.limit]
                            : [ctx.user.id, ctx.user.id, input.limit];
                        return [4 /*yield*/, p.query(query, params)];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows || []];
                }
            });
        });
    }),
    // List all active system users for member selection (private chat, group channel)
    listUsers: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, db
                                .select({ id: schema_1.users.id, name: schema_1.users.name, email: schema_1.users.email, department: schema_1.users.department, role: schema_1.users.role })
                                .from(schema_1.users)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.users.isActive, 1), drizzle_orm_1.eq(schema_1.users.organizationId, orgId)))];
                    case 2:
                        rows = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db
                            .select({ id: schema_1.users.id, name: schema_1.users.name, email: schema_1.users.email, department: schema_1.users.department, role: schema_1.users.role })
                            .from(schema_1.users)
                            .where(drizzle_orm_1.eq(schema_1.users.isActive, 1))];
                    case 4:
                        rows = _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, rows];
                }
            });
        });
    })
});
