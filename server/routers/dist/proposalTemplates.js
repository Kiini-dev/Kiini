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
exports.proposalTemplatesRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
function mapRow(row) {
    return {
        id: row.id,
        title: row.title,
        content: row.content,
        createdBy: row.createdBy || "System",
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
}
exports.proposalTemplatesRouter = trpc_1.router({
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
                        return [4 /*yield*/, pool.query("SELECT * FROM proposalTemplates WHERE organizationId = ? ORDER BY createdAt DESC", [orgId])];
                    case 1:
                        rows_1 = (_c.sent())[0];
                        return [2 /*return*/, rows_1.map(mapRow)];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM proposalTemplates ORDER BY createdAt DESC")];
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
            var pool, orgId, rows_2, arr_1, rows, arr;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            return [2 /*return*/, null];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT * FROM proposalTemplates WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        rows_2 = (_c.sent())[0];
                        arr_1 = rows_2;
                        return [2 /*return*/, arr_1.length ? mapRow(arr_1[0]) : null];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM proposalTemplates WHERE id = ?", [input])];
                    case 3:
                        rows = (_c.sent())[0];
                        arr = rows;
                        return [2 /*return*/, arr.length ? mapRow(arr[0]) : null];
                }
            });
        });
    }),
    create: trpc_1.adminProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string().min(1),
        content: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, id, orgId, rows;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        id = uuid_1.v4();
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || null;
                        return [4 /*yield*/, pool.query("INSERT INTO proposalTemplates (id, title, content, createdBy, organizationId) VALUES (?, ?, ?, ?, ?)", [id, input.title, input.content, ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.name) || ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || "System", orgId])];
                    case 1:
                        _e.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM proposalTemplates WHERE id = ?", [id])];
                    case 2:
                        rows = (_e.sent())[0];
                        return [2 /*return*/, mapRow(rows[0])];
                }
            });
        });
    }),
    update: trpc_1.adminProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string().optional(),
        content: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, existing, _b, sets, vals, rows;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT id FROM proposalTemplates WHERE id = ? AND organizationId = ?", [input.id, orgId])];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT id FROM proposalTemplates WHERE id = ?", [input.id])];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        existing = (_b)[0];
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Template not found" });
                        sets = [];
                        vals = [];
                        if (input.title !== undefined) {
                            sets.push("title = ?");
                            vals.push(input.title);
                        }
                        if (input.content !== undefined) {
                            sets.push("content = ?");
                            vals.push(input.content);
                        }
                        if (!(sets.length > 0)) return [3 /*break*/, 6];
                        vals.push(input.id);
                        return [4 /*yield*/, pool.query("UPDATE proposalTemplates SET " + sets.join(", ") + " WHERE id = ?", vals)];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6: return [4 /*yield*/, pool.query("SELECT * FROM proposalTemplates WHERE id = ?", [input.id])];
                    case 7:
                        rows = (_d.sent())[0];
                        return [2 /*return*/, mapRow(rows[0])];
                }
            });
        });
    }),
    "delete": trpc_1.adminProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, existing, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT id FROM proposalTemplates WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT id FROM proposalTemplates WHERE id = ?", [input])];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        existing = (_b)[0];
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Template not found" });
                        return [4 /*yield*/, pool.query("DELETE FROM proposalTemplates WHERE id = ?", [input])];
                    case 5:
                        _d.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    duplicate: trpc_1.adminProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, rows, arr, orig, newId, orgId, newRows;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        return [4 /*yield*/, pool.query("SELECT * FROM proposalTemplates WHERE id = ?", [input])];
                    case 1:
                        rows = (_e.sent())[0];
                        arr = rows;
                        if (!arr.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Template not found" });
                        orig = arr[0];
                        newId = uuid_1.v4();
                        orgId = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || null;
                        return [4 /*yield*/, pool.query("INSERT INTO proposalTemplates (id, title, content, createdBy, organizationId) VALUES (?, ?, ?, ?, ?)", [newId, orig.title + " (Copy)", orig.content, ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.name) || ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || "System", orgId])];
                    case 2:
                        _e.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM proposalTemplates WHERE id = ?", [newId])];
                    case 3:
                        newRows = (_e.sent())[0];
                        return [2 /*return*/, mapRow(newRows[0])];
                }
            });
        });
    })
});
