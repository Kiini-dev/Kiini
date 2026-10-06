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
exports.leaveRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var checkModuleAccess_1 = require("../modules/checkModuleAccess");
// Define typed procedures
var readProcedure = trpc_1.protectedProcedure;
exports.leaveRouter = trpc_1.router({
    list: readProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, leaves, _b, ids, employeesData, empMap;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: 
                    // Module access guard
                    return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        // Module access guard
                        _d.sent();
                        return [4 /*yield*/, db_1.getDb()];
                    case 2:
                        db = _d.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.select().from(schema_1.leaveRequests).where(drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, orgId)).limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 3:
                        _b = _d.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, db.select().from(schema_1.leaveRequests).limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 5:
                        _b = _d.sent();
                        _d.label = 6;
                    case 6:
                        leaves = _b;
                        ids = leaves.map(function (l) { return l.employeeId; });
                        if (ids.length === 0)
                            return [2 /*return*/, leaves];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.employees)
                                .where(drizzle_orm_1.inArray(schema_1.employees.id, ids))];
                    case 7:
                        employeesData = _d.sent();
                        empMap = new Map(employeesData.map(function (e) { return [e.id, e]; }));
                        return [2 /*return*/, leaves.map(function (l) {
                                var emp = empMap.get(l.employeeId);
                                return __assign(__assign({}, l), { employeeName: emp ? ((emp.firstName || '') + " " + (emp.lastName || '')).trim() : undefined, employeeEmail: emp ? emp.email : undefined });
                            })];
                }
            });
        });
    }),
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveRequests.id, input), drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.leaveRequests.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.leaveRequests).where(where).limit(1)];
                    case 2:
                        result = _c.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    byEmployee: readProcedure
        .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveRequests.employeeId, input.employeeId), drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.leaveRequests.employeeId, input.employeeId);
                        return [4 /*yield*/, db.select().from(schema_1.leaveRequests).where(where)];
                    case 2:
                        result = _c.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    create: trpc_1.createFeatureRestrictedProcedure("leave:create")
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        leaveType: zod_1.z["enum"](["annual", "sick", "maternity", "paternity", "unpaid", "other"]),
        startDate: zod_1.z.date(),
        endDate: zod_1.z.date(),
        days: zod_1.z.number().min(0, "Days must be zero or positive"),
        reason: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["pending", "approved", "rejected", "cancelled"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, insertData;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        insertData = __assign(__assign({}, input), { startDate: input.startDate ? input.startDate.toISOString().replace('T', ' ').substring(0, 19) : undefined, endDate: input.endDate ? input.endDate.toISOString().replace('T', ' ').substring(0, 19) : undefined, approvalDate: input.approvalDate ? input.approvalDate.toISOString().replace('T', ' ').substring(0, 19) : undefined });
                        return [4 /*yield*/, db.insert(schema_1.leaveRequests).values(__assign(__assign({ id: id }, insertData), { organizationId: (_c = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) !== null && _c !== void 0 ? _c : null }))];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: trpc_1.createFeatureRestrictedProcedure("leave:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        employeeId: zod_1.z.string().optional(),
        leaveType: zod_1.z["enum"](["annual", "sick", "maternity", "paternity", "unpaid", "other"]).optional(),
        startDate: zod_1.z.date().optional(),
        endDate: zod_1.z.date().optional(),
        days: zod_1.z.number().min(0, "Days must be zero or positive").optional(),
        reason: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["pending", "approved", "rejected", "cancelled"]).optional(),
        approvedBy: zod_1.z.string().optional(),
        approvalDate: zod_1.z.date().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, data, orgId, updateWhere, updateData;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, data = __rest(input, ["id"]);
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        updateWhere = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveRequests.id, id), drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.leaveRequests.id, id);
                        updateData = __assign(__assign({}, data), { startDate: data.startDate ? data.startDate.toISOString().replace('T', ' ').substring(0, 19) : undefined, endDate: data.endDate ? data.endDate.toISOString().replace('T', ' ').substring(0, 19) : undefined, approvalDate: data.approvalDate ? data.approvalDate.toISOString().replace('T', ' ').substring(0, 19) : undefined });
                        return [4 /*yield*/, db.update(schema_1.leaveRequests).set(updateData).where(updateWhere)];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": trpc_1.createFeatureRestrictedProcedure("leave:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, deleteWhere;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        deleteWhere = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveRequests.id, input), drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.leaveRequests.id, input);
                        return [4 /*yield*/, db["delete"](schema_1.leaveRequests).where(deleteWhere)];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    byStatus: readProcedure
        .input(zod_1.z.object({ status: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveRequests.status, input.status), drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.leaveRequests.status, input.status);
                        return [4 /*yield*/, db.select().from(schema_1.leaveRequests).where(where)];
                    case 2:
                        result = _c.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    })
});
