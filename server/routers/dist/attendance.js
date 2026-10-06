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
exports.attendanceRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var checkModuleAccess_1 = require("../modules/checkModuleAccess");
exports.attendanceRouter = trpc_1.router({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, rows, _b, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: 
                    // Module access guard
                    return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        // Module access guard
                        _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 3:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.select().from(schema_1.attendance).where(drizzle_orm_1.eq(schema_1.attendance.organizationId, orgId)).limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 4:
                        _b = _c.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, db.select().from(schema_1.attendance).limit((input === null || input === void 0 ? void 0 : input.limit) || 50).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 6:
                        _b = _c.sent();
                        _c.label = 7;
                    case 7:
                        rows = _b;
                        return [2 /*return*/, rows.map(function (r) { return (__assign(__assign({}, r), { checkIn: r.checkIn || r.checkInTime || null, checkOut: r.checkOut || r.checkOutTime || null })); })];
                    case 8:
                        error_1 = _c.sent();
                        console.error('Attendance list error:', (error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || error_1);
                        throw new Error('Failed to retrieve attendance records');
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    getById: trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result, row, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.id, input), drizzle_orm_1.eq(schema_1.attendance.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.attendance.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.attendance).where(where).limit(1)];
                    case 2:
                        result = _b.sent();
                        row = result[0] || null;
                        if (!row)
                            return [2 /*return*/, null];
                        return [2 /*return*/, __assign(__assign({}, row), { checkIn: row.checkIn || row.checkInTime || null, checkOut: row.checkOut || row.checkOutTime || null })];
                    case 3:
                        error_2 = _b.sent();
                        console.error('Attendance getById error:', error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    byEmployee: trpc_1.protectedProcedure
        .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where, result, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.employeeId, input.employeeId), drizzle_orm_1.eq(schema_1.attendance.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.attendance.employeeId, input.employeeId);
                        return [4 /*yield*/, db.select().from(schema_1.attendance).where(where)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result.map(function (r) { return (__assign(__assign({}, r), { checkIn: r.checkIn || r.checkInTime || null, checkOut: r.checkOut || r.checkOutTime || null })); })];
                    case 3:
                        error_3 = _b.sent();
                        console.error('Attendance byEmployee error:', (error_3 === null || error_3 === void 0 ? void 0 : error_3.message) || error_3);
                        throw new Error('Failed to retrieve employee attendance');
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    create: trpc_1.createFeatureRestrictedProcedure("attendance:create")
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        date: zod_1.z.date(),
        checkInTime: zod_1.z.date().optional(),
        checkOutTime: zod_1.z.date().optional(),
        status: zod_1.z["enum"](["present", "absent", "late", "leave"]),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, insertData;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        insertData = __assign({}, input);
                        return [4 /*yield*/, db.insert(schema_1.attendance).values(__assign(__assign({ id: id }, insertData), { organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null }))];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: trpc_1.createFeatureRestrictedProcedure("attendance:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        employeeId: zod_1.z.string().optional(),
        date: zod_1.z.date().optional(),
        checkInTime: zod_1.z.date().optional(),
        checkOutTime: zod_1.z.date().optional(),
        status: zod_1.z["enum"](["present", "absent", "late", "leave"]).optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, data, orgId, updateWhere, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, data = __rest(input, ["id"]);
                        orgId = ctx.user.organizationId;
                        updateWhere = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.id, id), drizzle_orm_1.eq(schema_1.attendance.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.attendance.id, id);
                        updateData = __assign({}, data);
                        return [4 /*yield*/, db.update(schema_1.attendance).set(updateData).where(updateWhere)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": trpc_1.createFeatureRestrictedProcedure("attendance:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, deleteWhere;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        deleteWhere = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.id, input), drizzle_orm_1.eq(schema_1.attendance.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.attendance.id, input);
                        return [4 /*yield*/, db["delete"](schema_1.attendance).where(deleteWhere)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
