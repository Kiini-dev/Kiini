"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.assetsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var uuid_1 = require("uuid");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var budgetEnforcer_1 = require("../utils/budgetEnforcer");
var numbering_1 = require("../utils/numbering");
// Permission-restricted procedures
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("assets:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("assets:create");
var editProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("assets:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("assets:delete");
exports.assetsRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        category: zod_1.z.string().optional(),
        status: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, where, limit, offset, _b, rows, countResult, error_1;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        conditions = [];
                        if (input === null || input === void 0 ? void 0 : input.category)
                            conditions.push(drizzle_orm_1.eq(schema_1.assets.category, input.category));
                        if (input === null || input === void 0 ? void 0 : input.status)
                            conditions.push(drizzle_orm_1.eq(schema_1.assets.status, input.status));
                        where = conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined;
                        limit = (input === null || input === void 0 ? void 0 : input.limit) || 50;
                        offset = (input === null || input === void 0 ? void 0 : input.offset) || 0;
                        return [4 /*yield*/, Promise.all([
                                db.select().from(schema_1.assets).where(where).orderBy(drizzle_orm_1.desc(schema_1.assets.createdAt)).limit(limit).offset(offset),
                                db.select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) }).from(schema_1.assets).where(where),
                            ])];
                    case 2:
                        _b = _e.sent(), rows = _b[0], countResult = _b[1];
                        return [2 /*return*/, {
                                data: rows,
                                total: (_d = (_c = countResult[0]) === null || _c === void 0 ? void 0 : _c.count) !== null && _d !== void 0 ? _d : 0
                            }];
                    case 3:
                        error_1 = _e.sent();
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch assets" });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.assets).where(drizzle_orm_1.eq(schema_1.assets.id, input))];
                    case 2:
                        rows = _b.sent();
                        if (!rows.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
                        }
                        return [2 /*return*/, rows[0]];
                    case 3:
                        error_2 = _b.sent();
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch asset" });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1),
        category: zod_1.z.string().min(1),
        location: zod_1.z.string().min(1),
        value: zod_1.z.number().positive(),
        assignedTo: zod_1.z.string().optional(),
        serialNumber: zod_1.z.string().optional(),
        purchaseDate: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["active", "inactive", "maintenance", "disposed"])["default"]("active"),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, assetCode, valueCents, record, orgId, rows, error_3;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        id = uuid_1.v4();
                        return [4 /*yield*/, numbering_1.nextNumber(db, schema_1.assets, schema_1.assets.assetCode, "AST")];
                    case 2:
                        assetCode = _f.sent();
                        valueCents = Math.round(input.value * 100);
                        record = {
                            id: id,
                            assetCode: assetCode,
                            name: input.name,
                            category: input.category,
                            location: input.location,
                            value: valueCents,
                            assignedTo: (_b = input.assignedTo) !== null && _b !== void 0 ? _b : null,
                            serialNumber: (_c = input.serialNumber) !== null && _c !== void 0 ? _c : null,
                            purchaseDate: (_d = input.purchaseDate) !== null && _d !== void 0 ? _d : null,
                            status: input.status,
                            notes: (_e = input.notes) !== null && _e !== void 0 ? _e : null,
                            createdBy: ctx.user.id
                        };
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 4];
                        return [4 /*yield*/, budgetEnforcer_1.enforceBudget(db, orgId, valueCents)];
                    case 3:
                        _f.sent();
                        _f.label = 4;
                    case 4: return [4 /*yield*/, db.insert(schema_1.assets).values(record)];
                    case 5:
                        _f.sent();
                        return [4 /*yield*/, db.select().from(schema_1.assets).where(drizzle_orm_1.eq(schema_1.assets.id, id))];
                    case 6:
                        rows = _f.sent();
                        return [2 /*return*/, rows[0]];
                    case 7:
                        error_3 = _f.sent();
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create asset" });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    update: editProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        value: zod_1.z.number().positive().optional(),
        assignedTo: zod_1.z.string().optional(),
        serialNumber: zod_1.z.string().optional(),
        purchaseDate: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["active", "inactive", "maintenance", "disposed"]).optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, existing, id, updates, setValues, rows, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.assets).where(drizzle_orm_1.eq(schema_1.assets.id, input.id))];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
                        }
                        id = input.id, updates = __rest(input, ["id"]);
                        setValues = {};
                        if (updates.name !== undefined)
                            setValues.name = updates.name;
                        if (updates.category !== undefined)
                            setValues.category = updates.category;
                        if (updates.location !== undefined)
                            setValues.location = updates.location;
                        if (updates.value !== undefined)
                            setValues.value = Math.round(updates.value * 100);
                        if (updates.assignedTo !== undefined)
                            setValues.assignedTo = updates.assignedTo;
                        if (updates.serialNumber !== undefined)
                            setValues.serialNumber = updates.serialNumber;
                        if (updates.purchaseDate !== undefined)
                            setValues.purchaseDate = updates.purchaseDate;
                        if (updates.status !== undefined)
                            setValues.status = updates.status;
                        if (updates.notes !== undefined)
                            setValues.notes = updates.notes;
                        if (!(Object.keys(setValues).length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.update(schema_1.assets).set(setValues).where(drizzle_orm_1.eq(schema_1.assets.id, id))];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [4 /*yield*/, db.select().from(schema_1.assets).where(drizzle_orm_1.eq(schema_1.assets.id, id))];
                    case 5:
                        rows = _b.sent();
                        return [2 /*return*/, rows[0]];
                    case 6:
                        error_4 = _b.sent();
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update asset" });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, existing, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.assets).where(drizzle_orm_1.eq(schema_1.assets.id, input))];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
                        }
                        return [4 /*yield*/, db["delete"](schema_1.assets).where(drizzle_orm_1.eq(schema_1.assets.id, input))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_5 = _b.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete asset" });
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1;
