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
exports.contractsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var uuid_1 = require("uuid");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Permission-restricted procedures
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("contracts:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("contracts:create");
var editProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("contracts:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("contracts:delete");
exports.contractsRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        status: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, statusFilter, where, limit, offset, _b, rows, countResult, error_1;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        orgId = ctx.user.organizationId;
                        statusFilter = (input === null || input === void 0 ? void 0 : input.status) ? drizzle_orm_1.eq(schema_1.contracts.status, input.status) : undefined;
                        where = orgId && statusFilter ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.contracts.organizationId, orgId), statusFilter) : orgId ? drizzle_orm_1.eq(schema_1.contracts.organizationId, orgId) : statusFilter;
                        limit = (input === null || input === void 0 ? void 0 : input.limit) || 50;
                        offset = (input === null || input === void 0 ? void 0 : input.offset) || 0;
                        return [4 /*yield*/, Promise.all([
                                db.select().from(schema_1.contracts).where(where).orderBy(drizzle_orm_1.desc(schema_1.contracts.createdAt)).limit(limit).offset(offset),
                                db.select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) }).from(schema_1.contracts).where(where),
                            ])];
                    case 2:
                        _b = _e.sent(), rows = _b[0], countResult = _b[1];
                        return [2 /*return*/, {
                                data: rows,
                                total: (_d = (_c = countResult[0]) === null || _c === void 0 ? void 0 : _c.count) !== null && _d !== void 0 ? _d : 0
                            }];
                    case 3:
                        error_1 = _e.sent();
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch contracts" });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, rows, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.contracts.id, input), drizzle_orm_1.eq(schema_1.contracts.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.contracts.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.contracts).where(where)];
                    case 2:
                        rows = _b.sent();
                        if (!rows.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
                        }
                        return [2 /*return*/, rows[0]];
                    case 3:
                        error_2 = _b.sent();
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch contract" });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1),
        vendor: zod_1.z.string().min(1),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        value: zod_1.z.number().positive(),
        status: zod_1.z["enum"](["draft", "active", "expired", "terminated"])["default"]("draft"),
        contractType: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, contractNumber, record, rows, error_3;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db_1.getNextDocumentNumber('contract')];
                    case 2:
                        contractNumber = _f.sent();
                        record = {
                            id: id,
                            contractNumber: contractNumber,
                            name: input.name,
                            vendor: input.vendor,
                            startDate: input.startDate,
                            endDate: input.endDate,
                            value: Math.round(input.value * 100),
                            status: input.status,
                            contractType: (_b = input.contractType) !== null && _b !== void 0 ? _b : null,
                            description: (_c = input.description) !== null && _c !== void 0 ? _c : null,
                            notes: (_d = input.notes) !== null && _d !== void 0 ? _d : null,
                            createdBy: ctx.user.id,
                            organizationId: (_e = ctx.user.organizationId) !== null && _e !== void 0 ? _e : null
                        };
                        return [4 /*yield*/, db.insert(schema_1.contracts).values(record)];
                    case 3:
                        _f.sent();
                        return [4 /*yield*/, db.select().from(schema_1.contracts).where(drizzle_orm_1.eq(schema_1.contracts.id, id))];
                    case 4:
                        rows = _f.sent();
                        return [2 /*return*/, rows[0]];
                    case 5:
                        error_3 = _f.sent();
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create contract" });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    update: editProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().optional(),
        vendor: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        value: zod_1.z.number().positive().optional(),
        status: zod_1.z["enum"](["draft", "active", "expired", "terminated"]).optional(),
        contractType: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, ownerCheck, existing, id, updates, setValues, rows, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        orgId = ctx.user.organizationId;
                        ownerCheck = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.contracts.id, input.id), drizzle_orm_1.eq(schema_1.contracts.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.contracts.id, input.id);
                        return [4 /*yield*/, db.select().from(schema_1.contracts).where(ownerCheck)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
                        }
                        id = input.id, updates = __rest(input, ["id"]);
                        setValues = {};
                        if (updates.name !== undefined)
                            setValues.name = updates.name;
                        if (updates.vendor !== undefined)
                            setValues.vendor = updates.vendor;
                        if (updates.startDate !== undefined)
                            setValues.startDate = updates.startDate;
                        if (updates.endDate !== undefined)
                            setValues.endDate = updates.endDate;
                        if (updates.value !== undefined)
                            setValues.value = Math.round(updates.value * 100);
                        if (updates.status !== undefined)
                            setValues.status = updates.status;
                        if (updates.contractType !== undefined)
                            setValues.contractType = updates.contractType;
                        if (updates.description !== undefined)
                            setValues.description = updates.description;
                        if (updates.notes !== undefined)
                            setValues.notes = updates.notes;
                        if (!(Object.keys(setValues).length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.update(schema_1.contracts).set(setValues).where(drizzle_orm_1.eq(schema_1.contracts.id, id))];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [4 /*yield*/, db.select().from(schema_1.contracts).where(drizzle_orm_1.eq(schema_1.contracts.id, id))];
                    case 5:
                        rows = _b.sent();
                        return [2 /*return*/, rows[0]];
                    case 6:
                        error_4 = _b.sent();
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update contract" });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, existing, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.contracts.id, input), drizzle_orm_1.eq(schema_1.contracts.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.contracts.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.contracts).where(where)];
                    case 2:
                        existing = _b.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
                        }
                        return [4 /*yield*/, db["delete"](schema_1.contracts).where(where)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_5 = _b.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete contract" });
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1;
