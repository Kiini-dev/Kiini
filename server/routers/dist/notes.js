"use strict";
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
exports.notesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var schema_1 = require("../../drizzle/schema");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var nanoid_1 = require("nanoid");
var server_1 = require("@trpc/server");
exports.notesRouter = trpc_1.router({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        category: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        filters = [drizzle_orm_1.eq(schema_1.notes.createdBy, ctx.user.id)];
                        if (input === null || input === void 0 ? void 0 : input.category) {
                            filters.push(drizzle_orm_1.eq(schema_1.notes.category, input.category));
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.notes)
                                .where(drizzle_orm_1.and.apply(void 0, filters))
                                .orderBy(drizzle_orm_1.desc(schema_1.notes.createdAt))];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, rows.map(function (r) { return (__assign(__assign({}, r), { pinned: r.pinned === 1, favorite: r.favorite === 1 })); })];
                }
            });
        });
    }),
    create: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string().min(1).max(300),
        content: zod_1.z.string().optional(),
        category: zod_1.z.string()["default"]("General"),
        pinned: zod_1.z.boolean()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = nanoid_1.nanoid();
                        return [4 /*yield*/, db.insert(schema_1.notes).values({
                                id: id,
                                title: input.title,
                                content: (_b = input.content) !== null && _b !== void 0 ? _b : "",
                                category: input.category,
                                pinned: input.pinned ? 1 : 0,
                                favorite: 0,
                                createdBy: ctx.user.id,
                                organizationId: (_c = ctx.user.organizationId) !== null && _c !== void 0 ? _c : null
                            })];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, { id: id, success: true }];
                }
            });
        });
    }),
    update: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string().min(1).max(300).optional(),
        content: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        pinned: zod_1.z.boolean().optional(),
        favorite: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, existing, updates;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db.select().from(schema_1.notes).where(drizzle_orm_1.eq(schema_1.notes.id, input.id)).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Note not found" });
                        if (existing[0].createdBy !== ctx.user.id)
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Not your note" });
                        updates = {};
                        if (input.title !== undefined)
                            updates.title = input.title;
                        if (input.content !== undefined)
                            updates.content = input.content;
                        if (input.category !== undefined)
                            updates.category = input.category;
                        if (input.pinned !== undefined)
                            updates.pinned = input.pinned ? 1 : 0;
                        if (input.favorite !== undefined)
                            updates.favorite = input.favorite ? 1 : 0;
                        return [4 /*yield*/, db.update(schema_1.notes).set(updates).where(drizzle_orm_1.eq(schema_1.notes.id, input.id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, existing;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db.select().from(schema_1.notes).where(drizzle_orm_1.eq(schema_1.notes.id, input)).limit(1)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Note not found" });
                        if (existing[0].createdBy !== ctx.user.id)
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Not your note" });
                        return [4 /*yield*/, db["delete"](schema_1.notes).where(drizzle_orm_1.eq(schema_1.notes.id, input))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
