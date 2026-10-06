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
exports.departmentsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
var numbering_1 = require("../utils/numbering");
// Resolve department head name from employees or users tables
function resolveHeadName(database, headId) {
    return __awaiter(this, void 0, Promise, function () {
        var emp, usr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!headId)
                        return [2 /*return*/, "Unassigned"];
                    return [4 /*yield*/, database.select({ firstName: schema_1.employees.firstName, lastName: schema_1.employees.lastName })
                            .from(schema_1.employees).where(drizzle_orm_1.eq(schema_1.employees.id, headId)).limit(1)];
                case 1:
                    emp = _a.sent();
                    if (emp.length)
                        return [2 /*return*/, emp[0].firstName + " " + emp[0].lastName];
                    return [4 /*yield*/, database.select({ name: schema_1.users.name }).from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, headId)).limit(1)];
                case 2:
                    usr = _a.sent();
                    if (usr.length)
                        return [2 /*return*/, usr[0].name || "Unknown"];
                    return [2 /*return*/, "Unassigned"];
            }
        });
    });
}
exports.departmentsRouter = trpc_1.router({
    list: trpc_1.createFeatureRestrictedProcedure("hr:departments:view")
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, query, rows, allEmployees, _b, empCountMap, _i, allEmployees_1, e;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        query = orgId
                            ? database.select().from(schema_1.departments).where(drizzle_orm_1.eq(schema_1.departments.organizationId, orgId))
                            : database.select().from(schema_1.departments);
                        return [4 /*yield*/, query.limit((input === null || input === void 0 ? void 0 : input.limit) || 100).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2:
                        rows = _c.sent();
                        if (!orgId) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.select({ department: schema_1.employees.department }).from(schema_1.employees).where(drizzle_orm_1.eq(schema_1.employees.organizationId, orgId))];
                    case 3:
                        _b = _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, database.select({ department: schema_1.employees.department }).from(schema_1.employees)];
                    case 5:
                        _b = _c.sent();
                        _c.label = 6;
                    case 6:
                        allEmployees = _b;
                        empCountMap = new Map();
                        for (_i = 0, allEmployees_1 = allEmployees; _i < allEmployees_1.length; _i++) {
                            e = allEmployees_1[_i];
                            if (e.department)
                                empCountMap.set(e.department, (empCountMap.get(e.department) || 0) + 1);
                        }
                        return [4 /*yield*/, Promise.all(rows.map(function (r) { return __awaiter(void 0, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _a = [__assign({}, r)];
                                            _b = { isActive: r.isActive !== undefined ? r.isActive : (r.status !== 'inactive') };
                                            return [4 /*yield*/, resolveHeadName(database, r.headId)];
                                        case 1: return [2 /*return*/, (__assign.apply(void 0, _a.concat([(_b.headName = _c.sent(), _b.employeeCount = empCountMap.get(r.name) || 0, _b)])))];
                                    }
                                });
                            }); }))];
                    case 7: return [2 /*return*/, _c.sent()];
                }
            });
        });
    }),
    getById: trpc_1.createFeatureRestrictedProcedure("hr:departments:view")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where, result, row, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.departments.id, input), drizzle_orm_1.eq(schema_1.departments.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.departments.id, input);
                        return [4 /*yield*/, database.select().from(schema_1.departments).where(where).limit(1)];
                    case 2:
                        result = _d.sent();
                        row = result[0] || null;
                        if (!row)
                            return [2 /*return*/, null];
                        _b = [__assign({}, row)];
                        _c = { isActive: row.isActive !== undefined ? row.isActive : (row.status !== 'inactive') };
                        return [4 /*yield*/, resolveHeadName(database, row.headId)];
                    case 3: return [2 /*return*/, __assign.apply(void 0, _b.concat([(_c.headName = _d.sent(), _c)]))];
                }
            });
        });
    }),
    create: trpc_1.createFeatureRestrictedProcedure("hr:departments:create")
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        departmentName: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(500).optional(),
        headId: zod_1.z.string().optional(),
        budget: zod_1.z.number().nonnegative().optional(),
        isActive: zod_1.z.boolean().optional(),
        status: zod_1.z.string().optional(),
        defaultRole: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, deptName, existing, id, departmentCode;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        deptName = (input.name || input.departmentName);
                        if (!deptName)
                            throw new Error('Department name is required');
                        return [4 /*yield*/, database.select().from(schema_1.departments).where(drizzle_orm_1.eq(schema_1.departments.name, deptName)).limit(1)];
                    case 2:
                        existing = _c.sent();
                        if (existing.length > 0) {
                            throw new Error("Department '" + deptName + "' already exists");
                        }
                        id = uuid_1.v4();
                        return [4 /*yield*/, numbering_1.nextNumber(database, schema_1.departments, schema_1.departments.departmentCode, "DEPT")];
                    case 3:
                        departmentCode = _c.sent();
                        return [4 /*yield*/, database.insert(schema_1.departments).values({
                                id: id,
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                departmentCode: departmentCode,
                                name: deptName,
                                description: input.description || '',
                                headId: input.headId && input.headId !== 'none' ? input.headId : null,
                                budget: input.budget || 0,
                                status: input.status || (input.isActive === false ? 'inactive' : 'active'),
                                defaultRole: input.defaultRole && input.defaultRole !== 'none' ? input.defaultRole : null,
                                createdBy: ctx.user.id
                            })];
                    case 4:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "department_created",
                                entityType: "department",
                                entityId: id,
                                description: "Created department: " + deptName
                            })];
                    case 5:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: trpc_1.createFeatureRestrictedProcedure("hr:departments:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().min(1).max(100).optional(),
        departmentName: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(500).optional(),
        headId: zod_1.z.string().optional(),
        budget: zod_1.z.number().nonnegative().optional(),
        isActive: zod_1.z.boolean().optional(),
        status: zod_1.z.string().optional(),
        defaultRole: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, department, orgId, existing, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.departments).where(drizzle_orm_1.eq(schema_1.departments.id, input.id)).limit(1)];
                    case 2:
                        department = _b.sent();
                        if (!department.length)
                            throw new Error("Department not found");
                        orgId = ctx.user.organizationId;
                        if (orgId && department[0].organizationId !== orgId)
                            throw new Error("Department not found");
                        if (!(input.name && input.name !== department[0].name)) return [3 /*break*/, 4];
                        return [4 /*yield*/, database.select().from(schema_1.departments).where(drizzle_orm_1.eq(schema_1.departments.name, input.name)).limit(1)];
                    case 3:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            throw new Error("Department '" + input.name + "' already exists");
                        }
                        _b.label = 4;
                    case 4:
                        updateData = {};
                        if (input.name || input.departmentName)
                            updateData.name = input.name || input.departmentName;
                        if (input.description !== undefined)
                            updateData.description = input.description;
                        if (input.headId !== undefined)
                            updateData.headId = input.headId === 'none' ? null : input.headId;
                        if (input.budget !== undefined)
                            updateData.budget = input.budget;
                        if (input.isActive !== undefined)
                            updateData.status = input.isActive ? 'active' : 'inactive';
                        if (input.status !== undefined)
                            updateData.status = input.status;
                        if (input.defaultRole !== undefined)
                            updateData.defaultRole = input.defaultRole === 'none' ? null : input.defaultRole;
                        return [4 /*yield*/, database.update(schema_1.departments).set(updateData).where(drizzle_orm_1.eq(schema_1.departments.id, input.id))];
                    case 5:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "department_updated",
                                entityType: "department",
                                entityId: input.id,
                                description: "Updated department: " + department[0].name
                            })];
                    case 6:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": trpc_1.createFeatureRestrictedProcedure("hr:departments:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, department, orgId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database.select().from(schema_1.departments).where(drizzle_orm_1.eq(schema_1.departments.id, input)).limit(1)];
                    case 2:
                        department = _b.sent();
                        if (!department.length)
                            throw new Error("Department not found");
                        orgId = ctx.user.organizationId;
                        if (orgId && department[0].organizationId !== orgId)
                            throw new Error("Department not found");
                        return [4 /*yield*/, database["delete"](schema_1.departments).where(drizzle_orm_1.eq(schema_1.departments.id, input))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "department_deleted",
                                entityType: "department",
                                entityId: input,
                                description: "Deleted department: " + department[0].name
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    getActive: trpc_1.createFeatureRestrictedProcedure("hr:departments:view")
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.departments.status, 'active'), drizzle_orm_1.eq(schema_1.departments.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.departments.status, 'active');
                        return [4 /*yield*/, database.select().from(schema_1.departments).where(where)];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, rows.map(function (r) { return (__assign(__assign({}, r), { isActive: true })); })];
                }
            });
        });
    }),
    getSummary: trpc_1.createFeatureRestrictedProcedure("hr:departments:view")
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, allDepartments, _b, activeDepartments, totalBudget;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            return [2 /*return*/, {
                                    totalDepartments: 0,
                                    activeDepartments: 0,
                                    totalBudget: 0
                                }];
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, database.select().from(schema_1.departments).where(drizzle_orm_1.eq(schema_1.departments.organizationId, orgId))];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, database.select().from(schema_1.departments)];
                    case 4:
                        _b = _c.sent();
                        _c.label = 5;
                    case 5:
                        allDepartments = _b;
                        activeDepartments = allDepartments.filter(function (d) { return d.status === 'active'; }).length;
                        totalBudget = allDepartments.reduce(function (sum, d) { return sum + (d.budget || 0); }, 0);
                        return [2 /*return*/, {
                                totalDepartments: allDepartments.length,
                                activeDepartments: activeDepartments,
                                totalBudget: totalBudget
                            }];
                }
            });
        });
    }),
    bulkDelete: trpc_1.createFeatureRestrictedProcedure("hr:departments:delete")
        .input(zod_1.z.array(zod_1.z.string()).min(1))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, input_1, departmentId, department, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        results = {
                            deleted: 0,
                            failed: 0,
                            errors: []
                        };
                        _i = 0, input_1 = input;
                        _b.label = 2;
                    case 2:
                        if (!(_i < input_1.length)) return [3 /*break*/, 9];
                        departmentId = input_1[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, database.select().from(schema_1.departments).where(drizzle_orm_1.eq(schema_1.departments.id, departmentId)).limit(1)];
                    case 4:
                        department = _b.sent();
                        if (!department.length) {
                            results.failed++;
                            results.errors.push("Department " + departmentId + " not found");
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, database["delete"](schema_1.departments).where(drizzle_orm_1.eq(schema_1.departments.id, departmentId))];
                    case 5:
                        _b.sent();
                        results.deleted++;
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "department_deleted",
                                entityType: "department",
                                entityId: departmentId,
                                description: "Bulk deleted department: " + department[0].name
                            })];
                    case 6:
                        // Log activity
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _b.sent();
                        results.failed++;
                        results.errors.push("Error deleting " + departmentId + ": " + error_1);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, results];
                }
            });
        });
    })
});
