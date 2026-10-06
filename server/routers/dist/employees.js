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
exports.employeesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var passwordUtils_1 = require("../lib/passwordUtils");
var organizationIsolationEnforcer_1 = require("../middleware/organizationIsolationEnforcer");
// Helper function to generate next employee number
function generateNextEmployeeNumber(db) {
    return __awaiter(this, void 0, Promise, function () {
        var result, lastNumber, match, nextNum, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.select({ empNum: schema_1.employees.employeeNumber })
                            .from(schema_1.employees)
                            .orderBy(drizzle_orm_1.desc(schema_1.employees.employeeNumber))
                            .limit(1)];
                case 1:
                    result = _a.sent();
                    if (result.length === 0) {
                        return [2 /*return*/, "EMP-00100"];
                    }
                    lastNumber = result[0].empNum;
                    match = lastNumber.match(/(\d+)$/);
                    if (!match) {
                        return [2 /*return*/, "EMP-00100"];
                    }
                    nextNum = parseInt(match[1]) + 1;
                    return [2 /*return*/, "EMP-" + String(nextNum).padStart(6, '0')];
                case 2:
                    err_1 = _a.sent();
                    console.warn("Error generating employee number, using default:", err_1);
                    return [2 /*return*/, "EMP-00100"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.employeesRouter = trpc_1.router({
    list: enhancedRbac_1.createFeatureRestrictedProcedure("employees:read")
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgFilter, limit, offset, result, _b, error_1, errorMessage;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db) {
                            console.error("[Employees] Database connection not available");
                            return [2 /*return*/, []];
                        }
                        orgFilter = organizationIsolationEnforcer_1.enforceOrganizationIsolation(ctx.user, schema_1.employees.organizationId, false);
                        console.log("[Employees] Attempting to fetch employees with limit:", (input === null || input === void 0 ? void 0 : input.limit) || 50);
                        limit = (input === null || input === void 0 ? void 0 : input.limit) || 50;
                        offset = (input === null || input === void 0 ? void 0 : input.offset) || 0;
                        if (!orgFilter) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.select().from(schema_1.employees).where(orgFilter).limit(limit).offset(offset)];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.select().from(schema_1.employees).limit(limit).offset(offset)];
                    case 4:
                        _b = _c.sent();
                        _c.label = 5;
                    case 5:
                        result = _b;
                        console.log("[Employees] Successfully fetched", (result === null || result === void 0 ? void 0 : result.length) || 0, "employees");
                        return [2 /*return*/, result];
                    case 6:
                        error_1 = _c.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        console.error("[Employees] Error fetching employees - Database Error:", errorMessage);
                        console.error("[Employees] Full error details:", error_1);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    getById: enhancedRbac_1.createFeatureRestrictedProcedure("employees:read")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgFilter, where, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        orgFilter = organizationIsolationEnforcer_1.enforceOrganizationIsolation(ctx.user, schema_1.employees.organizationId, false);
                        where = orgFilter ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.employees.id, input), orgFilter) : drizzle_orm_1.eq(schema_1.employees.id, input);
                        return [4 /*yield*/, db.select().from(schema_1.employees).where(where).limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    byDepartment: enhancedRbac_1.createFeatureRestrictedProcedure("employees:read")
        .input(zod_1.z.object({ department: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, where, result, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        where = organizationIsolationEnforcer_1.combineOrgFilters(ctx.user, schema_1.employees.organizationId, drizzle_orm_1.eq(schema_1.employees.department, input.department), false);
                        if (!where) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.select().from(schema_1.employees).where(where)];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.select().from(schema_1.employees).where(drizzle_orm_1.eq(schema_1.employees.department, input.department))];
                    case 4:
                        _b = _c.sent();
                        _c.label = 5;
                    case 5:
                        result = _b;
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    byJobGroup: enhancedRbac_1.createFeatureRestrictedProcedure("employees:read")
        .input(zod_1.z.object({ jobGroupId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, where, result, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        where = organizationIsolationEnforcer_1.combineOrgFilters(ctx.user, schema_1.employees.organizationId, drizzle_orm_1.eq(schema_1.employees.jobGroupId, input.jobGroupId), false);
                        if (!where) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.select().from(schema_1.employees).where(where)];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.select().from(schema_1.employees).where(drizzle_orm_1.eq(schema_1.employees.jobGroupId, input.jobGroupId))];
                    case 4:
                        _b = _c.sent();
                        _c.label = 5;
                    case 5:
                        result = _b;
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    getNextEmployeeNumber: enhancedRbac_1.createFeatureRestrictedProcedure("employees:read")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, nextNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    return [4 /*yield*/, generateNextEmployeeNumber(db)];
                case 2:
                    nextNumber = _a.sent();
                    return [2 /*return*/, { employeeNumber: nextNumber }];
            }
        });
    }); }),
    create: enhancedRbac_1.createFeatureRestrictedProcedure("employees:create")
        .input(zod_1.z.object({
        employeeNumber: zod_1.z.string().optional(),
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        gender: zod_1.z["enum"](['male', 'female', 'other']).optional(),
        maritalStatus: zod_1.z["enum"](['single', 'married', 'divorced', 'widowed']).optional(),
        dateOfBirth: zod_1.z.date().optional(),
        hireDate: zod_1.z.date(),
        probationEndDate: zod_1.z.date().optional(),
        contractEndDate: zod_1.z.date().optional(),
        department: zod_1.z.string().optional(),
        position: zod_1.z.string().optional(),
        jobGroupId: zod_1.z.string(),
        salary: zod_1.z.number().optional(),
        employmentType: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        photoUrl: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        emergencyContactName: zod_1.z.string().optional(),
        emergencyContactRelationship: zod_1.z.string().optional(),
        emergencyContactPhone: zod_1.z.string().optional(),
        emergencyContact: zod_1.z.string().optional(),
        bankName: zod_1.z.string().optional(),
        bankBranch: zod_1.z.string().optional(),
        bankAccountNumber: zod_1.z.string().optional(),
        nhifNumber: zod_1.z.string().optional(),
        nssfNumber: zod_1.z.string().optional(),
        taxId: zod_1.z.string().optional(),
        nationalId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, userId, employeeNumber, jobGroup, now, hireDate, generatedPassword, userExists, assignedRole, assignedCustomRoleId, deptResult, defaultRole, systemRoles, customRole, deptErr_1, passwordHash, userError_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        userId = null;
                        employeeNumber = input.employeeNumber;
                        if (!!employeeNumber) return [3 /*break*/, 3];
                        return [4 /*yield*/, generateNextEmployeeNumber(db)];
                    case 2:
                        employeeNumber = _d.sent();
                        _d.label = 3;
                    case 3: return [4 /*yield*/, db.select().from(schema_1.jobGroups)
                            .where(drizzle_orm_1.eq(schema_1.jobGroups.id, input.jobGroupId))
                            .limit(1)];
                    case 4:
                        jobGroup = _d.sent();
                        if (!jobGroup || jobGroup.length === 0) {
                            throw new Error("Job group not found");
                        }
                        // Validate salary is within job group range if provided
                        if (input.salary) {
                            if (input.salary < jobGroup[0].minimumGrossSalary ||
                                input.salary > jobGroup[0].maximumGrossSalary) {
                                throw new Error("Salary must be between " + jobGroup[0].minimumGrossSalary + " and " + jobGroup[0].maximumGrossSalary + " for this job group");
                            }
                        }
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        hireDate = input.hireDate instanceof Date
                            ? input.hireDate.toISOString().replace('T', ' ').substring(0, 19)
                            : new Date(input.hireDate).toISOString().replace('T', ' ').substring(0, 19);
                        generatedPassword = null;
                        if (!input.email) return [3 /*break*/, 19];
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 18, , 19]);
                        userId = uuid_1.v4();
                        return [4 /*yield*/, db.select().from(schema_1.users)
                                .where(drizzle_orm_1.eq(schema_1.users.email, input.email))
                                .limit(1)];
                    case 6:
                        userExists = _d.sent();
                        if (!(!userExists || userExists.length === 0)) return [3 /*break*/, 16];
                        assignedRole = 'staff';
                        assignedCustomRoleId = null;
                        if (!input.department) return [3 /*break*/, 13];
                        _d.label = 7;
                    case 7:
                        _d.trys.push([7, 12, , 13]);
                        return [4 /*yield*/, db.select().from(schema_1.departments)
                                .where(drizzle_orm_1.eq(schema_1.departments.name, input.department))
                                .limit(1)];
                    case 8:
                        deptResult = _d.sent();
                        if (!(deptResult.length > 0 && deptResult[0].defaultRole)) return [3 /*break*/, 11];
                        defaultRole = deptResult[0].defaultRole;
                        systemRoles = ['user', 'admin', 'staff', 'accountant', 'client', 'super_admin', 'project_manager', 'hr', 'ict_manager', 'procurement_manager', 'sales_manager'];
                        if (!systemRoles.includes(defaultRole)) return [3 /*break*/, 9];
                        assignedRole = defaultRole;
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, db.select().from(schema_1.customRoles)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.customRoles.id, defaultRole), drizzle_orm_1.eq(schema_1.customRoles.isActive, 1)))
                            .limit(1)];
                    case 10:
                        customRole = _d.sent();
                        if (customRole.length > 0) {
                            assignedCustomRoleId = customRole[0].id;
                            assignedRole = customRole[0].baseRole || 'staff';
                        }
                        _d.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        deptErr_1 = _d.sent();
                        console.warn("Failed to look up department default role:", deptErr_1);
                        return [3 /*break*/, 13];
                    case 13:
                        // Generate a strong password
                        generatedPassword = passwordUtils_1.generatePassword(14);
                        return [4 /*yield*/, passwordUtils_1.hashPassword(generatedPassword)];
                    case 14:
                        passwordHash = _d.sent();
                        return [4 /*yield*/, db.insert(schema_1.users).values({
                                id: userId,
                                name: (input.firstName + " " + input.lastName).trim(),
                                email: input.email,
                                role: assignedRole,
                                passwordHash: passwordHash,
                                isActive: 1,
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                customRoleId: assignedCustomRoleId,
                                createdAt: now
                            })];
                    case 15:
                        _d.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        // User already exists, link to existing user
                        userId = userExists[0].id;
                        _d.label = 17;
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        userError_1 = _d.sent();
                        // Log the error but continue with employee creation
                        console.error("Failed to create/link user account for employee:", userError_1);
                        return [3 /*break*/, 19];
                    case 19: return [4 /*yield*/, db.insert(schema_1.employees).values({
                            id: id,
                            userId: userId || null,
                            employeeNumber: employeeNumber,
                            firstName: input.firstName,
                            lastName: input.lastName,
                            email: input.email || null,
                            phone: input.phone || null,
                            gender: input.gender || null,
                            maritalStatus: input.maritalStatus || null,
                            dateOfBirth: input.dateOfBirth ? input.dateOfBirth.toISOString().replace('T', ' ').substring(0, 19) : null,
                            hireDate: hireDate,
                            probationEndDate: input.probationEndDate ? input.probationEndDate.toISOString().replace('T', ' ').substring(0, 19) : null,
                            contractEndDate: input.contractEndDate ? input.contractEndDate.toISOString().replace('T', ' ').substring(0, 19) : null,
                            department: input.department || null,
                            position: input.position || null,
                            jobGroupId: input.jobGroupId,
                            salary: input.salary || null,
                            employmentType: input.employmentType || 'full_time',
                            status: input.status || 'active',
                            photoUrl: input.photoUrl || null,
                            address: input.address || null,
                            emergencyContactName: input.emergencyContactName || null,
                            emergencyContactRelationship: input.emergencyContactRelationship || null,
                            emergencyContactPhone: input.emergencyContactPhone || null,
                            emergencyContact: input.emergencyContact || null,
                            bankName: input.bankName || null,
                            bankBranch: input.bankBranch || null,
                            bankAccountNumber: input.bankAccountNumber || null,
                            nhifNumber: input.nhifNumber || null,
                            nssfNumber: input.nssfNumber || null,
                            taxId: input.taxId || null,
                            nationalId: input.nationalId || null,
                            createdBy: ctx.user.id,
                            createdAt: now,
                            updatedAt: now,
                            organizationId: (_c = ctx.user.organizationId) !== null && _c !== void 0 ? _c : null
                        })];
                    case 20:
                        _d.sent();
                        return [2 /*return*/, { id: id, employeeNumber: employeeNumber, generatedPassword: generatedPassword, userId: userId }];
                }
            });
        });
    }),
    update: enhancedRbac_1.createFeatureRestrictedProcedure("employees:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        employeeNumber: zod_1.z.string().optional(),
        firstName: zod_1.z.string().optional(),
        lastName: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        gender: zod_1.z.string().optional(),
        maritalStatus: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z.date().optional(),
        hireDate: zod_1.z.date().optional(),
        probationEndDate: zod_1.z.string().optional(),
        contractEndDate: zod_1.z.string().optional(),
        department: zod_1.z.string().optional(),
        position: zod_1.z.string().optional(),
        jobGroupId: zod_1.z.string().optional(),
        salary: zod_1.z.number().optional(),
        employmentType: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        photoUrl: zod_1.z.string().optional(),
        nationalId: zod_1.z.string().optional(),
        taxId: zod_1.z.string().optional(),
        nhifNumber: zod_1.z.string().optional(),
        nssfNumber: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        emergencyContactName: zod_1.z.string().optional(),
        emergencyContactRelationship: zod_1.z.string().optional(),
        emergencyContactPhone: zod_1.z.string().optional(),
        emergencyContact: zod_1.z.string().optional(),
        bankName: zod_1.z.string().optional(),
        bankBranch: zod_1.z.string().optional(),
        bankAccountNumber: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, data, orgId, ownerCheck, currentEmployee, jobGroupId, jobGroup, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, data = __rest(input, ["id"]);
                        orgId = ctx.user.organizationId;
                        ownerCheck = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.employees.id, id), drizzle_orm_1.eq(schema_1.employees.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.employees.id, id);
                        if (!(data.jobGroupId || data.salary !== undefined)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.select().from(schema_1.employees)
                                .where(ownerCheck)
                                .limit(1)];
                    case 2:
                        currentEmployee = _b.sent();
                        if (!currentEmployee || currentEmployee.length === 0) {
                            throw new Error("Employee not found");
                        }
                        jobGroupId = data.jobGroupId || currentEmployee[0].jobGroupId;
                        return [4 /*yield*/, db.select().from(schema_1.jobGroups)
                                .where(drizzle_orm_1.eq(schema_1.jobGroups.id, jobGroupId))
                                .limit(1)];
                    case 3:
                        jobGroup = _b.sent();
                        if (!jobGroup || jobGroup.length === 0) {
                            throw new Error("Job group not found");
                        }
                        // Validate salary if provided
                        if (data.salary !== undefined) {
                            if (data.salary < jobGroup[0].minimumGrossSalary ||
                                data.salary > jobGroup[0].maximumGrossSalary) {
                                throw new Error("Salary must be between " + jobGroup[0].minimumGrossSalary + " and " + jobGroup[0].maximumGrossSalary + " for this job group");
                            }
                        }
                        _b.label = 4;
                    case 4:
                        updateData = __assign(__assign({}, data), { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) });
                        // Convert date fields if provided
                        if (data.hireDate) {
                            updateData.hireDate = data.hireDate instanceof Date
                                ? data.hireDate.toISOString().replace('T', ' ').substring(0, 19)
                                : new Date(data.hireDate).toISOString().replace('T', ' ').substring(0, 19);
                        }
                        if (data.dateOfBirth) {
                            updateData.dateOfBirth = data.dateOfBirth instanceof Date
                                ? data.dateOfBirth.toISOString().replace('T', ' ').substring(0, 19)
                                : new Date(data.dateOfBirth).toISOString().replace('T', ' ').substring(0, 19);
                        }
                        return [4 /*yield*/, db.update(schema_1.employees).set(updateData).where(drizzle_orm_1.eq(schema_1.employees.id, id))];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": enhancedRbac_1.createFeatureRestrictedProcedure("employees:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.employees.id, input), drizzle_orm_1.eq(schema_1.employees.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.employees.id, input);
                        return [4 /*yield*/, db["delete"](schema_1.employees).where(where)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    bulkUpdateStatus: enhancedRbac_1.createFeatureRestrictedProcedure("employees:edit")
        .input(zod_1.z.object({ employeeIds: zod_1.z.array(zod_1.z.string()), status: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, where;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.inArray(schema_1.employees.id, input.employeeIds), drizzle_orm_1.eq(schema_1.employees.organizationId, orgId)) : drizzle_orm_1.inArray(schema_1.employees.id, input.employeeIds);
                        return [4 /*yield*/, db
                                .update(schema_1.employees)
                                .set({ status: input.status, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
                                .where(where)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, count: input.employeeIds.length }];
                }
            });
        });
    }),
    bulkUpdateDepartment: enhancedRbac_1.createFeatureRestrictedProcedure("employees:edit")
        .input(zod_1.z.object({ employeeIds: zod_1.z.array(zod_1.z.string()), department: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .update(schema_1.employees)
                                .set({ department: input.department, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
                                .where(drizzle_orm_1.inArray(schema_1.employees.id, input.employeeIds))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, count: input.employeeIds.length }];
                }
            });
        });
    }),
    bulkDelete: enhancedRbac_1.createFeatureRestrictedProcedure("employees:delete")
        .input(zod_1.z.array(zod_1.z.string()))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db["delete"](schema_1.employees).where(drizzle_orm_1.inArray(schema_1.employees.id, input))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, count: input.length }];
                }
            });
        });
    }),
    // Promote employee to a new job group
    promote: enhancedRbac_1.createFeatureRestrictedProcedure("employees:edit")
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        newJobGroupId: zod_1.z.string(),
        newSalary: zod_1.z.number().optional().describe("New salary for the promoted position"),
        effectiveDate: zod_1.z.date()["default"](function () { return new Date(); }),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, employee, newJobGroup, now, effectiveDate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        return [4 /*yield*/, db.select().from(schema_1.employees).where(drizzle_orm_1.eq(schema_1.employees.id, input.employeeId)).limit(1)];
                    case 2:
                        employee = _b.sent();
                        if (!employee || employee.length === 0) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
                        }
                        return [4 /*yield*/, db.select().from(schema_1.jobGroups).where(drizzle_orm_1.eq(schema_1.jobGroups.id, input.newJobGroupId)).limit(1)];
                    case 3:
                        newJobGroup = _b.sent();
                        if (!newJobGroup || newJobGroup.length === 0) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "New job group not found" });
                        }
                        // Validate salary is within new job group range if provided
                        if (input.newSalary) {
                            if (input.newSalary < newJobGroup[0].minimumGrossSalary || input.newSalary > newJobGroup[0].maximumGrossSalary) {
                                throw new server_1.TRPCError({
                                    code: "BAD_REQUEST",
                                    message: "Salary must be between " + newJobGroup[0].minimumGrossSalary + " and " + newJobGroup[0].maximumGrossSalary + " for the new job group"
                                });
                            }
                        }
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        effectiveDate = input.effectiveDate instanceof Date
                            ? input.effectiveDate.toISOString().replace('T', ' ').substring(0, 19)
                            : new Date(input.effectiveDate).toISOString().replace('T', ' ').substring(0, 19);
                        // Update employee with new job group and salary
                        return [4 /*yield*/, db.update(schema_1.employees)
                                .set({
                                jobGroupId: input.newJobGroupId,
                                salary: input.newSalary || employee[0].salary,
                                updatedAt: now
                            })
                                .where(drizzle_orm_1.eq(schema_1.employees.id, input.employeeId))];
                    case 4:
                        // Update employee with new job group and salary
                        _b.sent();
                        // Log the promotion
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "employee_promoted",
                                entityType: "employee",
                                entityId: input.employeeId,
                                description: "Employee promoted from " + employee[0].jobGroupId + " to " + input.newJobGroupId + ". Effective: " + effectiveDate + ". " + (input.notes ? "Notes: " + input.notes : "")
                            })];
                    case 5:
                        // Log the promotion
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Employee promoted to " + newJobGroup[0].name,
                                employee: {
                                    id: input.employeeId,
                                    newJobGroup: newJobGroup[0].name,
                                    newSalary: input.newSalary || employee[0].salary,
                                    effectiveDate: effectiveDate
                                }
                            }];
                }
            });
        });
    }),
    // Demote employee to a different job group
    demote: enhancedRbac_1.createFeatureRestrictedProcedure("employees:edit")
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        newJobGroupId: zod_1.z.string(),
        newSalary: zod_1.z.number().optional(),
        effectiveDate: zod_1.z.date()["default"](function () { return new Date(); }),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, employee, newJobGroup, now, effectiveDate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        return [4 /*yield*/, db.select().from(schema_1.employees).where(drizzle_orm_1.eq(schema_1.employees.id, input.employeeId)).limit(1)];
                    case 2:
                        employee = _b.sent();
                        if (!employee || employee.length === 0) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
                        }
                        return [4 /*yield*/, db.select().from(schema_1.jobGroups).where(drizzle_orm_1.eq(schema_1.jobGroups.id, input.newJobGroupId)).limit(1)];
                    case 3:
                        newJobGroup = _b.sent();
                        if (!newJobGroup || newJobGroup.length === 0) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "New job group not found" });
                        }
                        // Validate salary is within new job group range if provided
                        if (input.newSalary) {
                            if (input.newSalary < newJobGroup[0].minimumGrossSalary || input.newSalary > newJobGroup[0].maximumGrossSalary) {
                                throw new server_1.TRPCError({
                                    code: "BAD_REQUEST",
                                    message: "Salary must be between " + newJobGroup[0].minimumGrossSalary + " and " + newJobGroup[0].maximumGrossSalary + " for the new job group"
                                });
                            }
                        }
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        effectiveDate = input.effectiveDate instanceof Date
                            ? input.effectiveDate.toISOString().replace('T', ' ').substring(0, 19)
                            : new Date(input.effectiveDate).toISOString().replace('T', ' ').substring(0, 19);
                        // Update employee with new job group and salary
                        return [4 /*yield*/, db.update(schema_1.employees)
                                .set({
                                jobGroupId: input.newJobGroupId,
                                salary: input.newSalary || employee[0].salary,
                                updatedAt: now
                            })
                                .where(drizzle_orm_1.eq(schema_1.employees.id, input.employeeId))];
                    case 4:
                        // Update employee with new job group and salary
                        _b.sent();
                        // Log the demotion
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "employee_demoted",
                                entityType: "employee",
                                entityId: input.employeeId,
                                description: "Employee demoted from " + employee[0].jobGroupId + " to " + input.newJobGroupId + ". Effective: " + effectiveDate + ". " + (input.reason ? "Reason: " + input.reason : "")
                            })];
                    case 5:
                        // Log the demotion
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Employee demoted to " + newJobGroup[0].name,
                                employee: {
                                    id: input.employeeId,
                                    newJobGroup: newJobGroup[0].name,
                                    newSalary: input.newSalary || employee[0].salary,
                                    effectiveDate: effectiveDate
                                }
                            }];
                }
            });
        });
    })
});
