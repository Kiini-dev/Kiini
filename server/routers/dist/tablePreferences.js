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
exports.tablePreferencesRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var nanoid_1 = require("nanoid");
exports.tablePreferencesRouter = trpc_1.router({
    /** Get table preferences for the current user + table */
    get: trpc_1.protectedProcedure
        .input(zod_1.z.object({ tableName: zod_1.z.string().min(1).max(100) }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, pref;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_extended_1.userTablePreferences)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.userTablePreferences.userId, ctx.user.id), drizzle_orm_1.eq(schema_extended_1.userTablePreferences.tableName, input.tableName)))
                                .limit(1)];
                    case 2:
                        pref = (_c.sent())[0];
                        if (!pref)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                id: pref.id,
                                tableName: pref.tableName,
                                visibleColumns: pref.visibleColumns
                                    ? JSON.parse(pref.visibleColumns)
                                    : null,
                                columnOrder: pref.columnOrder
                                    ? JSON.parse(pref.columnOrder)
                                    : null,
                                pageSize: (_b = pref.pageSize) !== null && _b !== void 0 ? _b : 25
                            }];
                }
            });
        });
    }),
    /** Upsert table preferences (create or update) */
    save: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        tableName: zod_1.z.string().min(1).max(100),
        visibleColumns: zod_1.z.array(zod_1.z.string()).optional(),
        columnOrder: zod_1.z.array(zod_1.z.string()).optional(),
        pageSize: zod_1.z.number().min(5).max(200).optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, existing, id;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_extended_1.userTablePreferences)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.userTablePreferences.userId, ctx.user.id), drizzle_orm_1.eq(schema_extended_1.userTablePreferences.tableName, input.tableName)))
                                .limit(1)];
                    case 2:
                        existing = (_d.sent())[0];
                        if (!existing) return [3 /*break*/, 4];
                        return [4 /*yield*/, db
                                .update(schema_extended_1.userTablePreferences)
                                .set(__assign(__assign(__assign(__assign({}, (input.visibleColumns !== undefined && {
                                visibleColumns: JSON.stringify(input.visibleColumns)
                            })), (input.columnOrder !== undefined && {
                                columnOrder: JSON.stringify(input.columnOrder)
                            })), (input.pageSize !== undefined && { pageSize: input.pageSize })), { updatedAt: new Date() }))
                                .where(drizzle_orm_1.eq(schema_extended_1.userTablePreferences.id, existing.id))];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, { id: existing.id }];
                    case 4:
                        id = nanoid_1.nanoid();
                        return [4 /*yield*/, db.insert(schema_extended_1.userTablePreferences).values({
                                id: id,
                                userId: ctx.user.id,
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                tableName: input.tableName,
                                visibleColumns: input.visibleColumns
                                    ? JSON.stringify(input.visibleColumns)
                                    : null,
                                columnOrder: input.columnOrder
                                    ? JSON.stringify(input.columnOrder)
                                    : null,
                                pageSize: (_c = input.pageSize) !== null && _c !== void 0 ? _c : 25
                            })];
                    case 5:
                        _d.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    /** Reset table preferences to defaults */
    reset: trpc_1.protectedProcedure
        .input(zod_1.z.object({ tableName: zod_1.z.string().min(1).max(100) }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db["delete"](schema_extended_1.userTablePreferences)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.userTablePreferences.userId, ctx.user.id), drizzle_orm_1.eq(schema_extended_1.userTablePreferences.tableName, input.tableName)))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
