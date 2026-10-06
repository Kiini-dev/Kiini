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
exports.favoritesRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var db = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
exports.favoritesRouter = trpc_1.router({
    /** List current user's favorites, optionally filtered by type */
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        entityType: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, conditions, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        conditions = [drizzle_orm_1.eq(schema_1.userFavorites.userId, ctx.user.id)];
                        if (input === null || input === void 0 ? void 0 : input.entityType) {
                            conditions.push(drizzle_orm_1.eq(schema_1.userFavorites.entityType, input.entityType));
                        }
                        return [4 /*yield*/, database.select().from(schema_1.userFavorites)
                                .where(drizzle_orm_1.and.apply(void 0, conditions))
                                .orderBy(drizzle_orm_1.desc(schema_1.userFavorites.createdAt))
                                .limit(100)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        e_1 = _b.sent();
                        // Table may not exist yet — return empty gracefully
                        if ((e_1 === null || e_1 === void 0 ? void 0 : e_1.code) === 'ER_NO_SUCH_TABLE')
                            return [2 /*return*/, []];
                        throw e_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /** Toggle a favorite on/off. Returns { starred: boolean } */
    toggle: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        entityType: zod_1.z.string(),
        entityId: zod_1.z.string(),
        entityName: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing, crypto_1, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 9, , 10]);
                        return [4 /*yield*/, database.select().from(schema_1.userFavorites)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.userFavorites.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.userFavorites.entityType, input.entityType), drizzle_orm_1.eq(schema_1.userFavorites.entityId, input.entityId)))
                                .limit(1)];
                    case 3:
                        existing = _b.sent();
                        if (!(existing.length > 0)) return [3 /*break*/, 5];
                        // Remove favorite
                        return [4 /*yield*/, database["delete"](schema_1.userFavorites)
                                .where(drizzle_orm_1.eq(schema_1.userFavorites.id, existing[0].id))];
                    case 4:
                        // Remove favorite
                        _b.sent();
                        return [2 /*return*/, { starred: false }];
                    case 5: return [4 /*yield*/, Promise.resolve().then(function () { return require('crypto'); })];
                    case 6:
                        crypto_1 = _b.sent();
                        return [4 /*yield*/, database.insert(schema_1.userFavorites).values({
                                id: crypto_1.randomUUID(),
                                userId: ctx.user.id,
                                entityType: input.entityType,
                                entityId: input.entityId,
                                entityName: input.entityName || null
                            })];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, { starred: true }];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        e_2 = _b.sent();
                        if ((e_2 === null || e_2 === void 0 ? void 0 : e_2.code) === 'ER_NO_SUCH_TABLE')
                            return [2 /*return*/, { starred: false }];
                        throw e_2;
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    /** Check if an entity is starred by the current user */
    isStarred: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        entityType: zod_1.z.string(),
        entityId: zod_1.z.string()
    }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing, e_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database.select().from(schema_1.userFavorites)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.userFavorites.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.userFavorites.entityType, input.entityType), drizzle_orm_1.eq(schema_1.userFavorites.entityId, input.entityId)))
                                .limit(1)];
                    case 3:
                        existing = _b.sent();
                        return [2 /*return*/, { starred: existing.length > 0 }];
                    case 4:
                        e_3 = _b.sent();
                        if ((e_3 === null || e_3 === void 0 ? void 0 : e_3.code) === 'ER_NO_SUCH_TABLE')
                            return [2 /*return*/, { starred: false }];
                        throw e_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /** Remove a specific favorite by ID */
    remove: trpc_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, e_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database["delete"](schema_1.userFavorites)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.userFavorites.id, input.id), drizzle_orm_1.eq(schema_1.userFavorites.userId, ctx.user.id)))];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_4 = _b.sent();
                        if ((e_4 === null || e_4 === void 0 ? void 0 : e_4.code) !== 'ER_NO_SUCH_TABLE')
                            throw e_4;
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
