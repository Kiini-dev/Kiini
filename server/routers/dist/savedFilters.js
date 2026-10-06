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
exports.savedFiltersRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Validation schemas
var SaveFilterInput = zod_1.z.object({
    moduleName: zod_1.z.string().min(1, "Module name is required"),
    filterName: zod_1.z.string().min(1, "Filter name is required"),
    description: zod_1.z.string().optional(),
    filterConfig: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    isDefault: zod_1.z.boolean().optional()["default"](false)
});
var UpdateFilterInput = zod_1.z.object({
    id: zod_1.z.string(),
    filterName: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    filterConfig: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    isDefault: zod_1.z.boolean().optional()
});
var createProcedure = trpc_1.createFeatureRestrictedProcedure("filters:create");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("filters:read");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("filters:update");
exports.savedFiltersRouter = trpc_1.router({
    // Create a new saved filter
    create: createProcedure
        .input(SaveFilterInput)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, now, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = crypto.randomUUID();
                        now = new Date().toISOString();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.insert(schema_1.savedFilters).values({
                                id: id,
                                userId: ctx.user.id,
                                moduleName: input.moduleName,
                                filterName: input.filterName,
                                description: input.description || null,
                                filterConfig: JSON.stringify(input.filterConfig),
                                isDefault: input.isDefault ? 1 : 0,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, {
                                id: id,
                                moduleName: input.moduleName,
                                filterName: input.filterName,
                                description: input.description,
                                filterConfig: input.filterConfig,
                                isDefault: input.isDefault,
                                createdAt: now,
                                updatedAt: now
                            }];
                    case 4:
                        error_1 = _b.sent();
                        console.error("Failed to create saved filter:", error_1);
                        throw new Error("Failed to create saved filter");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Get all saved filters for a module
    listByModule: readProcedure
        .input(zod_1.z.object({ moduleName: zod_1.z.string() }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.savedFilters)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.savedFilters.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.savedFilters.moduleName, input.moduleName)))];
                    case 3:
                        filters = _b.sent();
                        return [2 /*return*/, filters.map(function (f) {
                                var _a, _b, _c;
                                return ({
                                    id: f.id,
                                    moduleName: f.moduleName,
                                    filterName: f.filterName,
                                    description: (_a = f.description) !== null && _a !== void 0 ? _a : undefined,
                                    filterConfig: JSON.parse(f.filterConfig),
                                    isDefault: f.isDefault === 1,
                                    createdAt: (_b = f.createdAt) !== null && _b !== void 0 ? _b : '',
                                    updatedAt: (_c = f.updatedAt) !== null && _c !== void 0 ? _c : ''
                                });
                            })];
                    case 4:
                        error_2 = _b.sent();
                        console.error("Failed to list saved filters:", error_2);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Get all saved filters for user
    listAll: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.savedFilters)
                                .where(drizzle_orm_1.eq(schema_1.savedFilters.userId, ctx.user.id))];
                    case 3:
                        filters = _b.sent();
                        return [2 /*return*/, filters.map(function (f) {
                                var _a, _b, _c;
                                return ({
                                    id: f.id,
                                    moduleName: f.moduleName,
                                    filterName: f.filterName,
                                    description: (_a = f.description) !== null && _a !== void 0 ? _a : undefined,
                                    filterConfig: JSON.parse(f.filterConfig),
                                    isDefault: f.isDefault === 1,
                                    createdAt: (_b = f.createdAt) !== null && _b !== void 0 ? _b : '',
                                    updatedAt: (_c = f.updatedAt) !== null && _c !== void 0 ? _c : ''
                                });
                            })];
                    case 4:
                        error_3 = _b.sent();
                        console.error("Failed to list all saved filters:", error_3);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Update a saved filter
    update: writeProcedure
        .input(UpdateFilterInput)
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, updateData, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        updateData = {
                            updatedAt: new Date().toISOString()
                        };
                        if (input.filterName)
                            updateData.filterName = input.filterName;
                        if (input.description !== undefined)
                            updateData.description = input.description;
                        if (input.filterConfig)
                            updateData.filterConfig = JSON.stringify(input.filterConfig);
                        if (input.isDefault !== undefined)
                            updateData.isDefault = input.isDefault ? 1 : 0;
                        return [4 /*yield*/, db
                                .update(schema_1.savedFilters)
                                .set(updateData)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.savedFilters.id, input.id), drizzle_orm_1.eq(schema_1.savedFilters.userId, ctx.user.id)))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_4 = _b.sent();
                        console.error("Failed to update saved filter:", error_4);
                        throw new Error("Failed to update saved filter");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Delete a saved filter
    "delete": writeProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db["delete"](schema_1.savedFilters)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.savedFilters.id, input.id), drizzle_orm_1.eq(schema_1.savedFilters.userId, ctx.user.id)))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_5 = _b.sent();
                        console.error("Failed to delete saved filter:", error_5);
                        throw new Error("Failed to delete saved filter");
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Set a filter as default for a module
    setDefault: writeProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), moduleName: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        // Remove default from all other filters in this module
                        return [4 /*yield*/, db
                                .update(schema_1.savedFilters)
                                .set({ isDefault: 0 })
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.savedFilters.userId, ctx.user.id), drizzle_orm_1.eq(schema_1.savedFilters.moduleName, input.moduleName)))];
                    case 3:
                        // Remove default from all other filters in this module
                        _b.sent();
                        // Set this filter as default
                        return [4 /*yield*/, db
                                .update(schema_1.savedFilters)
                                .set({ isDefault: 1 })
                                .where(drizzle_orm_1.eq(schema_1.savedFilters.id, input.id))];
                    case 4:
                        // Set this filter as default
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_6 = _b.sent();
                        console.error("Failed to set default filter:", error_6);
                        throw new Error("Failed to set default filter");
                    case 6: return [2 /*return*/];
                }
            });
        });
    })
});
