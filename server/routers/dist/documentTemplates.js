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
exports.documentTemplatesRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
function mapRow(row) {
    return {
        id: row.id,
        type: row.type,
        title: row.title,
        content: row.content,
        isDefault: Boolean(row.isDefault),
        createdBy: row.createdBy || "System",
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
}
exports.documentTemplatesRouter = trpc_1.router({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({ type: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
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
                        return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE type = ? AND organizationId = ? ORDER BY createdAt DESC", [input.type, orgId])];
                    case 1:
                        rows_1 = (_c.sent())[0];
                        return [2 /*return*/, rows_1.map(mapRow)];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE type = ? ORDER BY createdAt DESC", [input.type])];
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
                        return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        rows_2 = (_c.sent())[0];
                        arr_1 = rows_2;
                        return [2 /*return*/, arr_1.length ? mapRow(arr_1[0]) : null];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input])];
                    case 3:
                        rows = (_c.sent())[0];
                        arr = rows;
                        return [2 /*return*/, arr.length ? mapRow(arr[0]) : null];
                }
            });
        });
    }),
    create: trpc_1.adminProcedure
        .input(zod_1.z.object({ type: zod_1.z.string(), title: zod_1.z.string().min(1), content: zod_1.z.string(), isDefault: zod_1.z.boolean().optional() }))
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
                        if (!(input.isDefault && orgId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("UPDATE documentTemplates SET isDefault = 0 WHERE type = ? AND organizationId = ? AND isDefault = 1", [input.type, orgId])];
                    case 1:
                        _e.sent();
                        _e.label = 2;
                    case 2: return [4 /*yield*/, pool.query("INSERT INTO documentTemplates (id, type, title, content, createdBy, organizationId, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, input.type, input.title, input.content, ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.name) || ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) || "System", orgId, input.isDefault ? 1 : 0])];
                    case 3:
                        _e.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE id = ?", [id])];
                    case 4:
                        rows = (_e.sent())[0];
                        return [2 /*return*/, mapRow(rows[0])];
                }
            });
        });
    }),
    update: trpc_1.adminProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), title: zod_1.z.string().optional(), content: zod_1.z.string().optional(), isDefault: zod_1.z.boolean().optional() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, existing, _b, existingTemplate, updates, values, rows;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE id = ? AND organizationId = ?", [input.id, orgId])];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input.id])];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        existing = (_b)[0];
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Template not found" });
                        existingTemplate = existing[0];
                        updates = [];
                        values = [];
                        if (input.title !== undefined) {
                            updates.push("title = ?");
                            values.push(input.title);
                        }
                        if (input.content !== undefined) {
                            updates.push("content = ?");
                            values.push(input.content);
                        }
                        if (input.isDefault !== undefined) {
                            updates.push("isDefault = ?");
                            values.push(input.isDefault ? 1 : 0);
                        }
                        if (!updates.length) return [3 /*break*/, 8];
                        if (!(input.isDefault && orgId)) return [3 /*break*/, 6];
                        return [4 /*yield*/, pool.query("UPDATE documentTemplates SET isDefault = 0 WHERE type = ? AND organizationId = ? AND isDefault = 1 AND id != ?", [existingTemplate.type, orgId, input.id])];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6:
                        values.push(input.id);
                        return [4 /*yield*/, pool.query("UPDATE documentTemplates SET " + updates.join(", ") + " WHERE id = ?", values)];
                    case 7:
                        _d.sent();
                        _d.label = 8;
                    case 8: return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input.id])];
                    case 9:
                        rows = (_d.sent())[0];
                        return [2 /*return*/, mapRow(rows[0])];
                }
            });
        });
    }),
    "delete": trpc_1.adminProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("DELETE FROM documentTemplates WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("DELETE FROM documentTemplates WHERE id = ?", [input])];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    duplicate: trpc_1.adminProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, rows, _b, arr, orig, newId, newRows;
            var _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        _b = _f.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input])];
                    case 3:
                        _b = _f.sent();
                        _f.label = 4;
                    case 4:
                        rows = (_b)[0];
                        arr = rows;
                        if (!arr.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Template not found" });
                        orig = arr[0];
                        newId = uuid_1.v4();
                        return [4 /*yield*/, pool.query("INSERT INTO documentTemplates (id, type, title, content, createdBy, organizationId, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?)", [newId, orig.type, orig.title + " (Copy)", orig.content, ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.name) || ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.id) || "System", orig.organizationId, 0])];
                    case 5:
                        _f.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE id = ?", [newId])];
                    case 6:
                        newRows = (_f.sent())[0];
                        return [2 /*return*/, mapRow(newRows[0])];
                }
            });
        });
    }),
    setDefault: trpc_1.adminProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, templateRows, _b, templateArr, templateType, rows;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT type FROM documentTemplates WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT type FROM documentTemplates WHERE id = ?", [input])];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        templateRows = (_b)[0];
                        templateArr = templateRows;
                        if (!templateArr.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Template not found" });
                        templateType = templateArr[0].type;
                        if (!orgId) return [3 /*break*/, 6];
                        return [4 /*yield*/, pool.query("UPDATE documentTemplates SET isDefault = 0 WHERE type = ? AND organizationId = ? AND id != ?", [templateType, orgId, input])];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6: 
                    // Set this template as default
                    return [4 /*yield*/, pool.query("UPDATE documentTemplates SET isDefault = 1 WHERE id = ?", [input])];
                    case 7:
                        // Set this template as default
                        _d.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input])];
                    case 8:
                        rows = (_d.sent())[0];
                        return [2 /*return*/, mapRow(rows[0])];
                }
            });
        });
    }),
    unsetDefault: trpc_1.adminProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var pool, orgId, templateRows, _b, rows;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        pool = db_1.getPool();
                        if (!pool)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 2];
                        return [4 /*yield*/, pool.query("SELECT id FROM documentTemplates WHERE id = ? AND organizationId = ?", [input, orgId])];
                    case 1:
                        _b = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, pool.query("SELECT id FROM documentTemplates WHERE id = ?", [input])];
                    case 3:
                        _b = _d.sent();
                        _d.label = 4;
                    case 4:
                        templateRows = (_b)[0];
                        if (!templateRows.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Template not found" });
                        // Unset this template as default
                        return [4 /*yield*/, pool.query("UPDATE documentTemplates SET isDefault = 0 WHERE id = ?", [input])];
                    case 5:
                        // Unset this template as default
                        _d.sent();
                        return [4 /*yield*/, pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input])];
                    case 6:
                        rows = (_d.sent())[0];
                        return [2 /*return*/, mapRow(rows[0])];
                }
            });
        });
    })
});
