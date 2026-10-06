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
exports.tenantCommunicationsRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
function mapRow(row) {
    var toStr = function (v) { return v instanceof Date ? v.toISOString() : v !== null && v !== void 0 ? v : null; };
    return {
        id: row.id,
        organizationId: row.organizationId,
        subject: row.subject,
        message: row.message,
        type: row.type,
        priority: row.priority,
        status: row.status,
        recipientType: row.recipientType,
        recipientFilter: row.recipientFilter ? (typeof row.recipientFilter === "string" ? JSON.parse(row.recipientFilter) : row.recipientFilter) : null,
        sentAt: toStr(row.sentAt),
        scheduledAt: toStr(row.scheduledAt),
        createdBy: row.createdBy,
        createdAt: toStr(row.createdAt),
        updatedAt: toStr(row.updatedAt)
    };
}
exports.tenantCommunicationsRouter = trpc_1.router({
    list: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, rows_1, rows;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, []];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT * FROM tenantCommunications\n         WHERE organizationId = ? OR recipientType = 'all_tenants'\n         ORDER BY createdAt DESC", [orgId])];
                    case 1:
                        rows_1 = (_c.sent())[0];
                        return [2 /*return*/, rows_1.map(mapRow)];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM tenantCommunications ORDER BY createdAt DESC")];
                    case 3:
                        rows = (_c.sent())[0];
                        return [2 /*return*/, rows.map(mapRow)];
                }
            });
        });
    }),
    getById: trpc_1.protectedProcedure.input(zod_1.z.string()).query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, rows, _b, arr;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, null];
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT * FROM tenantCommunications\n           WHERE id = ?\n           AND (organizationId = ? OR recipientType = 'all_tenants')", [input, orgId])];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM tenantCommunications WHERE id = ?", [input])];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        rows = (_b)[0];
                        arr = rows;
                        return [2 /*return*/, arr.length ? mapRow(arr[0]) : null];
                }
            });
        });
    }),
    create: trpc_1.adminProcedure
        .input(zod_1.z.object({
        subject: zod_1.z.string().min(1),
        message: zod_1.z.string().min(1),
        type: zod_1.z["enum"](["announcement", "alert", "notice", "update", "maintenance"])["default"]("announcement"),
        priority: zod_1.z["enum"](["low", "normal", "high", "urgent"])["default"]("normal"),
        status: zod_1.z["enum"](["draft", "sent", "scheduled"])["default"]("draft"),
        recipientType: zod_1.z["enum"](["all_tenants", "specific_tenant", "tier_based"])["default"]("all_tenants"),
        recipientFilter: zod_1.z.any().optional(),
        scheduledAt: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, id, orgId, sentAt, rows;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        id = uuid_1.v4();
                        orgId = input.recipientType === 'all_tenants' ? null : ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || null;
                        sentAt = input.status === "sent" ? new Date().toISOString().slice(0, 19).replace("T", " ") : null;
                        return [4 /*yield*/, pool.query("INSERT INTO tenantCommunications (id, organizationId, subject, message, type, priority, status, recipientType, recipientFilter, sentAt, scheduledAt, createdBy)\n         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                id, orgId, input.subject, input.message, input.type, input.priority, input.status,
                                input.recipientType, input.recipientFilter ? JSON.stringify(input.recipientFilter) : null,
                                sentAt, input.scheduledAt || null,
                                ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || null,
                            ])];
                    case 1:
                        _e.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || 'system',
                                action: 'tenantCommunication:create',
                                entityType: 'tenantCommunication',
                                entityId: id,
                                description: "Created communication '" + input.subject + "'",
                                metadata: JSON.stringify({ recipientType: input.recipientType, status: input.status })
                            })];
                    case 2:
                        _e.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM tenantCommunications WHERE id = ?", [id])];
                    case 3:
                        rows = (_e.sent())[0];
                        return [2 /*return*/, mapRow(rows[0])];
                }
            });
        });
    }),
    update: trpc_1.adminProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        subject: zod_1.z.string().optional(),
        message: zod_1.z.string().optional(),
        type: zod_1.z["enum"](["announcement", "alert", "notice", "update", "maintenance"]).optional(),
        priority: zod_1.z["enum"](["low", "normal", "high", "urgent"]).optional(),
        status: zod_1.z["enum"](["draft", "sent", "scheduled"]).optional(),
        recipientType: zod_1.z["enum"](["all_tenants", "specific_tenant", "tier_based"]).optional(),
        recipientFilter: zod_1.z.any().optional(),
        scheduledAt: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, existing, _b, sets, vals, rows;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT id FROM tenantCommunications WHERE id = ? AND organizationId = ?", [input.id, orgId])];
                    case 1:
                        _b = _e.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT id FROM tenantCommunications WHERE id = ?", [input.id])];
                    case 3:
                        _b = _e.sent();
                        _e.label = 4;
                    case 4:
                        existing = (_b)[0];
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Communication not found" });
                        sets = [];
                        vals = [];
                        if (input.subject !== undefined) {
                            sets.push("subject = ?");
                            vals.push(input.subject);
                        }
                        if (input.message !== undefined) {
                            sets.push("message = ?");
                            vals.push(input.message);
                        }
                        if (input.type !== undefined) {
                            sets.push("type = ?");
                            vals.push(input.type);
                        }
                        if (input.priority !== undefined) {
                            sets.push("priority = ?");
                            vals.push(input.priority);
                        }
                        if (input.status !== undefined) {
                            sets.push("status = ?");
                            vals.push(input.status);
                            if (input.status === "sent") {
                                sets.push("sentAt = NOW()");
                            }
                        }
                        if (input.recipientType !== undefined) {
                            sets.push("recipientType = ?");
                            vals.push(input.recipientType);
                        }
                        if (input.recipientFilter !== undefined) {
                            sets.push("recipientFilter = ?");
                            vals.push(JSON.stringify(input.recipientFilter));
                        }
                        if (input.scheduledAt !== undefined) {
                            sets.push("scheduledAt = ?");
                            vals.push(input.scheduledAt);
                        }
                        if (!(sets.length > 0)) return [3 /*break*/, 6];
                        vals.push(input.id);
                        return [4 /*yield*/, pool.query("UPDATE tenantCommunications SET " + sets.join(", ") + " WHERE id = ?", vals)];
                    case 5:
                        _e.sent();
                        _e.label = 6;
                    case 6: return [4 /*yield*/, db_1.logActivity({
                            userId: ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || 'system',
                            action: 'tenantCommunication:update',
                            entityType: 'tenantCommunication',
                            entityId: input.id,
                            description: "Updated communication " + input.id,
                            metadata: JSON.stringify({ updatedFields: sets })
                        })];
                    case 7:
                        _e.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM tenantCommunications WHERE id = ?", [input.id])];
                    case 8:
                        rows = (_e.sent())[0];
                        return [2 /*return*/, mapRow(rows[0])];
                }
            });
        });
    }),
    "delete": trpc_1.adminProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, existing, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT id FROM tenantCommunications WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        _b = _e.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT id FROM tenantCommunications WHERE id = ?", [input])];
                    case 3:
                        _b = _e.sent();
                        _e.label = 4;
                    case 4:
                        existing = (_b)[0];
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Communication not found" });
                        return [4 /*yield*/, pool.query("DELETE FROM tenantCommunications WHERE id = ?", [input])];
                    case 5:
                        _e.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || 'system',
                                action: 'tenantCommunication:delete',
                                entityType: 'tenantCommunication',
                                entityId: input,
                                description: "Deleted communication " + input
                            })];
                    case 6:
                        _e.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    send: trpc_1.adminProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, rows, _b, arr, updated;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT * FROM tenantCommunications WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        _b = _e.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM tenantCommunications WHERE id = ?", [input])];
                    case 3:
                        _b = _e.sent();
                        _e.label = 4;
                    case 4:
                        rows = (_b)[0];
                        arr = rows;
                        if (!arr.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Communication not found" });
                        return [4 /*yield*/, pool.query("UPDATE tenantCommunications SET status = 'sent', sentAt = NOW() WHERE id = ?", [input])];
                    case 5:
                        _e.sent();
                        return [4 /*yield*/, db_1.logActivity({
                                userId: ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || 'system',
                                action: 'tenantCommunication:send',
                                entityType: 'tenantCommunication',
                                entityId: input,
                                description: "Sent communication " + input
                            })];
                    case 6:
                        _e.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM tenantCommunications WHERE id = ?", [input])];
                    case 7:
                        updated = (_e.sent())[0];
                        return [2 /*return*/, mapRow(updated[0])];
                }
            });
        });
    }),
    // ─── Read Tracking ───────────────────────────────────────────
    markAsRead: trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var commId = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, userId;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, { success: false }];
                        userId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id;
                        if (!userId)
                            return [2 /*return*/, { success: false }];
                        return [4 /*yield*/, pool.query("INSERT IGNORE INTO tenantCommunicationReads (id, communicationId, userId, readAt) VALUES (?, ?, ?, NOW())", [uuid_1.v4(), commId, userId])];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    getUnreadCount: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, userId, orgId, rows, _b, _c;
            var _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, 0];
                        userId = (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id;
                        if (!userId)
                            return [2 /*return*/, 0];
                        orgId = (_e = ctx.user) === null || _e === void 0 ? void 0 : _e.organizationId;
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 6, , 7]);
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, pool.query("SELECT COUNT(*) as cnt FROM tenantCommunications tc\n             WHERE tc.status = 'sent'\n             AND (tc.recipientType = 'all_tenants' OR tc.organizationId = ?)\n             AND tc.id NOT IN (SELECT communicationId FROM tenantCommunicationReads WHERE userId = ?)", [orgId, userId])];
                    case 2:
                        _b = _h.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, pool.query("SELECT COUNT(*) as cnt FROM tenantCommunications tc\n             WHERE tc.status = 'sent'\n             AND tc.id NOT IN (SELECT communicationId FROM tenantCommunicationReads WHERE userId = ?)", [userId])];
                    case 4:
                        _b = _h.sent();
                        _h.label = 5;
                    case 5:
                        rows = (_b)[0];
                        return [2 /*return*/, Number((_g = (_f = rows[0]) === null || _f === void 0 ? void 0 : _f.cnt) !== null && _g !== void 0 ? _g : 0)];
                    case 6:
                        _c = _h.sent();
                        return [2 /*return*/, 0];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    getUnreadMessages: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, userId, orgId, rows, _b, _c;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, []];
                        userId = (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id;
                        if (!userId)
                            return [2 /*return*/, []];
                        orgId = (_e = ctx.user) === null || _e === void 0 ? void 0 : _e.organizationId;
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 6, , 7]);
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, pool.query("SELECT tc.* FROM tenantCommunications tc\n             WHERE tc.status = 'sent'\n             AND (tc.recipientType = 'all_tenants' OR tc.organizationId = ?)\n             AND tc.id NOT IN (SELECT communicationId FROM tenantCommunicationReads WHERE userId = ?)\n             ORDER BY FIELD(tc.priority, 'urgent', 'high', 'normal', 'low'), tc.sentAt DESC\n             LIMIT 20", [orgId, userId])];
                    case 2:
                        _b = _f.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, pool.query("SELECT tc.* FROM tenantCommunications tc\n             WHERE tc.status = 'sent'\n             AND tc.id NOT IN (SELECT communicationId FROM tenantCommunicationReads WHERE userId = ?)\n             ORDER BY FIELD(tc.priority, 'urgent', 'high', 'normal', 'low'), tc.sentAt DESC\n             LIMIT 20", [userId])];
                    case 4:
                        _b = _f.sent();
                        _f.label = 5;
                    case 5:
                        rows = (_b)[0];
                        return [2 /*return*/, rows.map(mapRow)];
                    case 6:
                        _c = _f.sent();
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    getCriticalMessages: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, userId, orgId, rows, _b, _c;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, []];
                        userId = (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id;
                        if (!userId)
                            return [2 /*return*/, []];
                        orgId = (_e = ctx.user) === null || _e === void 0 ? void 0 : _e.organizationId;
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 6, , 7]);
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, pool.query("SELECT tc.* FROM tenantCommunications tc\n             WHERE tc.status = 'sent' AND tc.priority IN ('urgent', 'high')\n             AND (tc.recipientType = 'all_tenants' OR tc.organizationId = ?)\n             AND tc.id NOT IN (SELECT communicationId FROM tenantCommunicationReads WHERE userId = ?)\n             ORDER BY FIELD(tc.priority, 'urgent', 'high') ASC, tc.sentAt DESC\n             LIMIT 5", [orgId, userId])];
                    case 2:
                        _b = _f.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, pool.query("SELECT tc.* FROM tenantCommunications tc\n             WHERE tc.status = 'sent' AND tc.priority IN ('urgent', 'high')\n             AND tc.id NOT IN (SELECT communicationId FROM tenantCommunicationReads WHERE userId = ?)\n             ORDER BY FIELD(tc.priority, 'urgent', 'high') ASC, tc.sentAt DESC\n             LIMIT 5", [userId])];
                    case 4:
                        _b = _f.sent();
                        _f.label = 5;
                    case 5:
                        rows = (_b)[0];
                        return [2 /*return*/, rows.map(mapRow)];
                    case 6:
                        _c = _f.sent();
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    })
});
