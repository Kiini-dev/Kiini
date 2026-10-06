"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.intrachatRouter = void 0;
var base_js_1 = require("./base.js");
var zod_1 = require("zod");
var db_js_1 = require("../db.js");
var drizzle_orm_1 = require("drizzle-orm");
var schema_js_1 = require("../../drizzle/schema.js");
var enhancedRbac_js_1 = require("../middleware/enhancedRbac.js");
var nanoid_1 = require("nanoid");
/**
 * Intrachat Router
 * Handles messages, conversations, and secured internal communication
 */
exports.intrachatRouter = base_js_1.router({
    /**
     * Create a new conversation (direct, group, or channel)
     */
    createConversation: enhancedRbac_js_1.createFeatureRestrictedProcedure("communications:create")
        .input(zod_1.z.object({
        type: zod_1.z["enum"](["direct", "group", "channel"]),
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        memberIds: zod_1.z.array(zod_1.z.string()),
        isEncrypted: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conversationId_1, encryptionKey, memberIds, members, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        conversationId_1 = nanoid_1.nanoid(16);
                        encryptionKey = input.isEncrypted
                            ? Buffer.from("key_" + nanoid_1.nanoid(32)).toString("base64")
                            : null;
                        // Create conversation
                        return [4 /*yield*/, db.insert(schema_js_1.conversations).values({
                                id: conversationId_1,
                                type: input.type,
                                name: input.name || (input.type === "direct" ? "Direct Message" : ""),
                                description: input.description,
                                createdBy: ctx.user.id,
                                isEncrypted: input.isEncrypted ? 1 : 0,
                                encryptionKey: encryptionKey
                            })];
                    case 3:
                        // Create conversation
                        _b.sent();
                        memberIds = __spreadArrays([ctx.user.id], input.memberIds);
                        members = memberIds.map(function (userId) { return ({
                            id: nanoid_1.nanoid(16),
                            conversationId: conversationId_1,
                            userId: userId,
                            role: userId === ctx.user.id ? "admin" : "member",
                            isActive: 1
                        }); });
                        return [4 /*yield*/, db.insert(schema_js_1.conversationMembers).values(members)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                conversationId: conversationId_1,
                                message: "Conversation created successfully"
                            }];
                    case 5:
                        error_1 = _b.sent();
                        console.error("[Intrachat] Create conversation error:", error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Send a message
     */
    sendMessage: enhancedRbac_js_1.createFeatureRestrictedProcedure("communications:create")
        .input(zod_1.z.object({
        conversationId: zod_1.z.string(),
        content: zod_1.z.string(),
        messageType: zod_1.z["enum"](["text", "image", "file", "system"])["default"]("text"),
        fileUrl: zod_1.z.string().optional(),
        fileName: zod_1.z.string().optional(),
        fileSize: zod_1.z.number().optional(),
        mimeType: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, messageId, member, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        messageId = nanoid_1.nanoid(16);
                        return [4 /*yield*/, db.query.conversationMembers.findFirst({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_js_1.conversationMembers.conversationId, input.conversationId), drizzle_orm_1.eq(schema_js_1.conversationMembers.userId, ctx.user.id))
                            })];
                    case 3:
                        member = _b.sent();
                        if (!member) {
                            throw new Error("You are not a member of this conversation");
                        }
                        // Create message
                        return [4 /*yield*/, db.insert(schema_js_1.messages).values({
                                id: messageId,
                                conversationId: input.conversationId,
                                senderId: ctx.user.id,
                                messageType: input.messageType,
                                content: input.content,
                                fileUrl: input.fileUrl,
                                fileName: input.fileName,
                                fileSize: input.fileSize,
                                mimeType: input.mimeType
                            })];
                    case 4:
                        // Create message
                        _b.sent();
                        // Update conversation's last message time
                        return [4 /*yield*/, db
                                .update(schema_js_1.conversations)
                                .set({ lastMessageAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
                                .where(drizzle_orm_1.eq(schema_js_1.conversations.id, input.conversationId))];
                    case 5:
                        // Update conversation's last message time
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                messageId: messageId,
                                message: "Message sent successfully"
                            }];
                    case 6:
                        error_2 = _b.sent();
                        console.error("[Intrachat] Send message error:", error_2);
                        throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get messages in a conversation
     */
    getMessages: enhancedRbac_js_1.createFeatureRestrictedProcedure("communications:read")
        .input(zod_1.z.object({
        conversationId: zod_1.z.string(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, member, convMessages, messageIds, readReceipts, _b, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, db.query.conversationMembers.findFirst({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_js_1.conversationMembers.conversationId, input.conversationId), drizzle_orm_1.eq(schema_js_1.conversationMembers.userId, ctx.user.id))
                            })];
                    case 3:
                        member = _c.sent();
                        if (!member) {
                            throw new Error("You are not a member of this conversation");
                        }
                        return [4 /*yield*/, db.query.messages.findMany({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_js_1.messages.conversationId, input.conversationId), drizzle_orm_1.eq(schema_js_1.messages.isDeleted, 0)),
                                orderBy: drizzle_orm_1.desc(schema_js_1.messages.createdAt),
                                limit: input.limit,
                                offset: input.offset
                            })];
                    case 4:
                        convMessages = _c.sent();
                        messageIds = convMessages.map(function (m) { return m.id; });
                        if (!(messageIds.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, db.query.messageReadReceipts.findMany({
                                where: db.raw("messageId IN (" + messageIds.map(function () { return "?"; }).join(",") + ")")
                            })];
                    case 5:
                        _b = _c.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _b = [];
                        _c.label = 7;
                    case 7:
                        readReceipts = _b;
                        return [2 /*return*/, {
                                success: true,
                                data: convMessages.reverse(),
                                readReceipts: readReceipts
                            }];
                    case 8:
                        error_3 = _c.sent();
                        console.error("[Intrachat] Get messages error:", error_3);
                        throw error_3;
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get user's conversations
     */
    getConversations: enhancedRbac_js_1.createFeatureRestrictedProcedure("communications:read")
        .input(zod_1.z.object({
        limit: zod_1.z.number()["default"](20),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, userConversations, response, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_js_1.conversations)
                                .innerJoin(schema_js_1.conversationMembers, drizzle_orm_1.eq(schema_js_1.conversations.id, schema_js_1.conversationMembers.conversationId))
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_js_1.conversationMembers.userId, ctx.user.id), drizzle_orm_1.eq(schema_js_1.conversationMembers.isActive, 1), drizzle_orm_1.eq(schema_js_1.conversations.isArchived, 0)))
                                .orderBy(drizzle_orm_1.desc(schema_js_1.conversations.lastMessageAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 3:
                        userConversations = _b.sent();
                        return [4 /*yield*/, Promise.all(userConversations.map(function (uc) { return __awaiter(void 0, void 0, void 0, function () {
                                var unreadCount;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, db
                                                .select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                                                .from(schema_js_1.messages)
                                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_js_1.messages.conversationId, uc.conversations.id), db.raw("NOT EXISTS (SELECT 1 FROM messageReadReceipts WHERE messageId = messages.id AND userId = '" + ctx.user.id + "')")))];
                                        case 1:
                                            unreadCount = _b.sent();
                                            return [2 /*return*/, __assign(__assign({}, uc.conversations), { unreadCount: ((_a = unreadCount[0]) === null || _a === void 0 ? void 0 : _a.count) || 0 })];
                                    }
                                });
                            }); }))];
                    case 4:
                        response = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: response
                            }];
                    case 5:
                        error_4 = _b.sent();
                        console.error("[Intrachat] Get conversations error:", error_4);
                        throw error_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Mark messages as read
     */
    markAsRead: enhancedRbac_js_1.createFeatureRestrictedProcedure("communications:edit")
        .input(zod_1.z.object({ conversationId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, unreadMessages, receipts, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, db.query.messages.findMany({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_js_1.messages.conversationId, input.conversationId), db.raw("NOT EXISTS (SELECT 1 FROM messageReadReceipts WHERE messageId = messages.id AND userId = '" + ctx.user.id + "')"))
                            })];
                    case 3:
                        unreadMessages = _b.sent();
                        receipts = unreadMessages.map(function (msg) { return ({
                            id: nanoid_1.nanoid(16),
                            messageId: msg.id,
                            userId: ctx.user.id,
                            readAt: new Date().toISOString()
                        }); });
                        if (!(receipts.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.insert(schema_js_1.messageReadReceipts).values(receipts)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, { success: true, readCount: receipts.length }];
                    case 6:
                        error_5 = _b.sent();
                        console.error("[Intrachat] Mark as read error:", error_5);
                        throw error_5;
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Delete a message
     */
    deleteMessage: enhancedRbac_js_1.createFeatureRestrictedProcedure("communications:edit")
        .input(zod_1.z.object({ messageId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, message, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db.query.messages.findFirst({
                                where: drizzle_orm_1.eq(schema_js_1.messages.id, input.messageId)
                            })];
                    case 3:
                        message = _b.sent();
                        if (!message) {
                            throw new Error("Message not found");
                        }
                        if (message.senderId !== ctx.user.id) {
                            throw new Error("You can only delete your own messages");
                        }
                        // Soft delete
                        return [4 /*yield*/, db
                                .update(schema_js_1.messages)
                                .set({
                                isDeleted: 1,
                                deletedAt: new Date().toISOString(),
                                content: "[Deleted]"
                            })
                                .where(drizzle_orm_1.eq(schema_js_1.messages.id, input.messageId))];
                    case 4:
                        // Soft delete
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Message deleted" }];
                    case 5:
                        error_6 = _b.sent();
                        console.error("[Intrachat] Delete message error:", error_6);
                        throw error_6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Leave a conversation
     */
    leaveConversation: enhancedRbac_js_1.createFeatureRestrictedProcedure("communications:edit")
        .input(zod_1.z.object({ conversationId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_js_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database connection failed");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .update(schema_js_1.conversationMembers)
                                .set({
                                isActive: 0,
                                leftAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_js_1.conversationMembers.conversationId, input.conversationId), drizzle_orm_1.eq(schema_js_1.conversationMembers.userId, ctx.user.id)))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Left conversation" }];
                    case 4:
                        error_7 = _b.sent();
                        console.error("[Intrachat] Leave conversation error:", error_7);
                        throw error_7;
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1;
