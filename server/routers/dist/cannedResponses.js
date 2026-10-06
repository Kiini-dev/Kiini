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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.cannedResponsesRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
exports.cannedResponsesRouter = trpc_1.router({
    list: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, rows;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.cannedResponses)
                                .where(orgId ? drizzle_orm_1.eq(schema_1.cannedResponses.organizationId, orgId) : undefined)
                                .orderBy(drizzle_orm_1.asc(schema_1.cannedResponses.category), drizzle_orm_1.asc(schema_1.cannedResponses.title))];
                    case 2:
                        rows = _c.sent();
                        return [2 /*return*/, rows];
                }
            });
        });
    }),
    create: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string().min(1).max(255),
        content: zod_1.z.string().min(1),
        category: zod_1.z.string().min(1).max(100)["default"]("General"),
        shortCode: zod_1.z.string().max(50).optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, orgId, created;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        id = uuid_1.v4();
                        orgId = (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null;
                        return [4 /*yield*/, db.insert(schema_1.cannedResponses).values({
                                id: id,
                                organizationId: orgId,
                                title: input.title,
                                content: input.content,
                                category: input.category,
                                shortCode: (_c = input.shortCode) !== null && _c !== void 0 ? _c : null,
                                createdBy: ctx.user.id
                            })];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, db.select().from(schema_1.cannedResponses).where(drizzle_orm_1.eq(schema_1.cannedResponses.id, id)).limit(1)];
                    case 3:
                        created = (_d.sent())[0];
                        return [2 /*return*/, created];
                }
            });
        });
    }),
    update: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string().min(1).max(255).optional(),
        content: zod_1.z.string().min(1).optional(),
        category: zod_1.z.string().min(1).max(100).optional(),
        shortCode: zod_1.z.string().max(50).optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, rest, updated;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        id = input.id, rest = __rest(input, ["id"]);
                        return [4 /*yield*/, db
                                .update(schema_1.cannedResponses)
                                .set(__assign(__assign({}, rest), { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }))
                                .where(drizzle_orm_1.eq(schema_1.cannedResponses.id, id))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.cannedResponses).where(drizzle_orm_1.eq(schema_1.cannedResponses.id, id)).limit(1)];
                    case 3:
                        updated = (_b.sent())[0];
                        return [2 /*return*/, updated];
                }
            });
        });
    }),
    "delete": trpc_1.protectedProcedure
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
                        return [4 /*yield*/, db["delete"](schema_1.cannedResponses).where(drizzle_orm_1.eq(schema_1.cannedResponses.id, input.id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    categories: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, rows, seen, cats, _i, rows_1, row;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        orgId = (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null;
                        return [4 /*yield*/, db
                                .select({ category: schema_1.cannedResponses.category })
                                .from(schema_1.cannedResponses)
                                .where(orgId ? drizzle_orm_1.eq(schema_1.cannedResponses.organizationId, orgId) : undefined)
                                .orderBy(drizzle_orm_1.asc(schema_1.cannedResponses.category))];
                    case 2:
                        rows = _c.sent();
                        seen = new Set();
                        cats = [];
                        for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                            row = rows_1[_i];
                            if (!seen.has(row.category)) {
                                seen.add(row.category);
                                cats.push(row.category);
                            }
                        }
                        return [2 /*return*/, cats];
                }
            });
        });
    })
});
