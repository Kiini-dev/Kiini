"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.quotationsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var uuid_1 = require("uuid");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var numbering_1 = require("../utils/numbering");
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("quotations:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("quotations:create");
var editProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("quotations:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("quotations:delete");
exports.quotationsRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        status: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, orgId, whereClause, all, countResult, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        conditions = [];
                        orgId = ctx.user.organizationId;
                        if (orgId)
                            conditions.push(drizzle_orm_1.eq(schema_1.quotations.organizationId, orgId));
                        if (input === null || input === void 0 ? void 0 : input.status)
                            conditions.push(drizzle_orm_1.eq(schema_1.quotations.status, input.status));
                        whereClause = conditions.length === 1 ? conditions[0] : conditions.length > 1 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined;
                        return [4 /*yield*/, db.select().from(schema_1.quotations)
                                .where(whereClause)
                                .orderBy(drizzle_orm_1.desc(schema_1.quotations.createdAt))
                                .limit((input === null || input === void 0 ? void 0 : input.limit) || 50)
                                .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 3:
                        all = _c.sent();
                        return [4 /*yield*/, db.select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) }).from(schema_1.quotations)
                                .where(whereClause)];
                    case 4:
                        countResult = _c.sent();
                        return [2 /*return*/, { data: all, total: ((_b = countResult[0]) === null || _b === void 0 ? void 0 : _b.count) || 0 }];
                    case 5:
                        error_1 = _c.sent();
                        console.error("Error listing quotations:", error_1);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch quotations" });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.quotations.id, input), drizzle_orm_1.eq(schema_1.quotations.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.quotations.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.quotations).where(where)];
                    case 3:
                        result = _b.sent();
                        if (!result.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });
                        return [2 /*return*/, result[0]];
                    case 4:
                        error_2 = _b.sent();
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch quotation" });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        rfqNo: zod_1.z.string().optional(),
        supplier: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        amount: zod_1.z.number().positive(),
        dueDate: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "submitted", "under_review", "approved", "rejected"])["default"]("draft")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, _b, _c, _d, _e, created, error_3;
            var _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _j.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _j.label = 2;
                    case 2:
                        _j.trys.push([2, 7, , 8]);
                        id = uuid_1.v4();
                        _c = (_b = db.insert(schema_1.quotations)).values;
                        _d = {
                            id: id,
                            organizationId: (_g = (_f = ctx.user) === null || _f === void 0 ? void 0 : _f.organizationId) !== null && _g !== void 0 ? _g : null
                        };
                        _e = input.rfqNo;
                        if (_e) return [3 /*break*/, 4];
                        return [4 /*yield*/, numbering_1.nextNumber(db, schema_1.quotations, schema_1.quotations.rfqNo, "RFQ")];
                    case 3:
                        _e = (_j.sent());
                        _j.label = 4;
                    case 4: return [4 /*yield*/, _c.apply(_b, [(_d.rfqNo = _e,
                                _d.supplier = input.supplier,
                                _d.description = input.description || null,
                                _d.amount = Math.round(input.amount * 100),
                                _d.dueDate = input.dueDate || null,
                                _d.status = input.status,
                                _d.createdBy = ((_h = ctx.user) === null || _h === void 0 ? void 0 : _h.id) || "",
                                _d)])];
                    case 5:
                        _j.sent();
                        return [4 /*yield*/, db.select().from(schema_1.quotations).where(drizzle_orm_1.eq(schema_1.quotations.id, id))];
                    case 6:
                        created = _j.sent();
                        return [2 /*return*/, created[0] || __assign({ id: id }, input)];
                    case 7:
                        error_3 = _j.sent();
                        console.error("Error creating quotation:", error_3);
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create quotation" });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    update: editProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        rfqNo: zod_1.z.string().optional(),
        supplier: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        amount: zod_1.z.number().positive().optional(),
        dueDate: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "submitted", "under_review", "approved", "rejected"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, ownerCheck, existing, id, updates, setObj, updated, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        orgId = ctx.user.organizationId;
                        ownerCheck = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.quotations.id, input.id), drizzle_orm_1.eq(schema_1.quotations.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.quotations.id, input.id);
                        return [4 /*yield*/, db.select().from(schema_1.quotations).where(ownerCheck)];
                    case 3:
                        existing = _b.sent();
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });
                        id = input.id, updates = __rest(input, ["id"]);
                        setObj = {};
                        if (updates.rfqNo !== undefined)
                            setObj.rfqNo = updates.rfqNo;
                        if (updates.supplier !== undefined)
                            setObj.supplier = updates.supplier;
                        if (updates.description !== undefined)
                            setObj.description = updates.description;
                        if (updates.amount !== undefined)
                            setObj.amount = Math.round(updates.amount * 100);
                        if (updates.dueDate !== undefined)
                            setObj.dueDate = updates.dueDate;
                        if (updates.status !== undefined)
                            setObj.status = updates.status;
                        return [4 /*yield*/, db.update(schema_1.quotations).set(setObj).where(drizzle_orm_1.eq(schema_1.quotations.id, id))];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.quotations).where(drizzle_orm_1.eq(schema_1.quotations.id, id))];
                    case 5:
                        updated = _b.sent();
                        return [2 /*return*/, updated[0]];
                    case 6:
                        error_4 = _b.sent();
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update quotation" });
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
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.quotations.id, input), drizzle_orm_1.eq(schema_1.quotations.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.quotations.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.quotations).where(where)];
                    case 3:
                        existing = _b.sent();
                        if (!existing.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });
                        return [4 /*yield*/, db["delete"](schema_1.quotations).where(where)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_5 = _b.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete quotation" });
                    case 6: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1;
