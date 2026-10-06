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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.payrollRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var exceljs_1 = require("exceljs");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var company_info_1 = require("../utils/company-info");
var uuid_1 = require("uuid");
var p9_form_generator_1 = require("../utils/p9-form-generator");
var kenyan_payroll_calculator_1 = require("../utils/kenyan-payroll-calculator");
var payrollJobs_1 = require("../jobs/payrollJobs");
var server_1 = require("@trpc/server");
function toDbDate(d) {
    return d.toISOString().replace("T", " ").substring(0, 19);
}
function parseMonthRange(month) {
    var _a = month.split("-").map(function (v) { return parseInt(v, 10); }), y = _a[0], m = _a[1];
    if (!y || !m || m < 1 || m > 12) {
        throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Invalid month format. Use YYYY-MM" });
    }
    var start = new Date(y, m - 1, 1);
    var end = new Date(y, m, 0);
    return { start: toDbDate(start), end: toDbDate(end) };
}
function resolvePayrollIds(input) {
    var ids = (input === null || input === void 0 ? void 0 : input.ids) || (input === null || input === void 0 ? void 0 : input.payrollIds) || [];
    return Array.isArray(ids) ? ids : [];
}
function buildP9ForEmployee(db, employeeId, certifiedBy, taxYear) {
    return __awaiter(this, void 0, void 0, function () {
        var employee, emp, year, payrollRecords, totalBasicSalary, totalAllowances, totalTax, totalNssf, totalShif, totalHousingLevy, totalNetSalary, _i, _a, record, parsedNotes, companyInfo, p9Data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.select().from(schema_1.employees).where(drizzle_orm_1.eq(schema_1.employees.id, employeeId)).limit(1)];
                case 1:
                    employee = _b.sent();
                    if (!employee || employee.length === 0) {
                        throw new Error("Employee not found");
                    }
                    emp = employee[0];
                    year = taxYear || new Date().getFullYear();
                    return [4 /*yield*/, db.select().from(schema_1.payroll).where(drizzle_orm_1.eq(schema_1.payroll.employeeId, employeeId))];
                case 2:
                    payrollRecords = _b.sent();
                    if (!payrollRecords || payrollRecords.length === 0) {
                        throw new Error("No payroll records found for employee");
                    }
                    totalBasicSalary = 0;
                    totalAllowances = 0;
                    totalTax = 0;
                    totalNssf = 0;
                    totalShif = 0;
                    totalHousingLevy = 0;
                    totalNetSalary = 0;
                    for (_i = 0, _a = payrollRecords; _i < _a.length; _i++) {
                        record = _a[_i];
                        totalBasicSalary += Number(record.basicSalary || 0);
                        totalAllowances += Number(record.allowances || 0);
                        totalTax += Number(record.tax || 0);
                        totalNetSalary += Number(record.netSalary || 0);
                        parsedNotes = {};
                        if (record.notes) {
                            try {
                                parsedNotes = JSON.parse(record.notes);
                            }
                            catch (_c) {
                                parsedNotes = {};
                            }
                        }
                        totalNssf += Number(parsedNotes.nssf || 0);
                        totalShif += Number(parsedNotes.shif || 0);
                        totalHousingLevy += Number(parsedNotes.housingLevy || 0);
                    }
                    return [4 /*yield*/, company_info_1.getCompanyInfo()];
                case 3:
                    companyInfo = _b.sent();
                    p9Data = {
                        employeeId: emp.employeeNumber || emp.id,
                        employeeName: emp.firstName + " " + emp.lastName,
                        nationalId: emp.nationalId || "N/A",
                        knRegNo: emp.taxId || "",
                        grossSalary: totalBasicSalary + totalAllowances,
                        paye: totalTax,
                        nssf: totalNssf,
                        shif: totalShif,
                        housingLevy: totalHousingLevy,
                        totalDeductions: totalTax + totalNssf + totalShif + totalHousingLevy,
                        netIncome: totalNetSalary,
                        taxYear: year,
                        monthFrom: 1,
                        monthTo: 12,
                        companyName: companyInfo.name,
                        companyKRAPin: companyInfo.kraPin || "N/A",
                        companyAddress: companyInfo.address || "N/A",
                        certificationDate: new Date(),
                        certifiedBy: certifiedBy,
                        certifiedByTitle: "Human Resources Manager"
                    };
                    return [2 /*return*/, {
                            htmlContent: p9_form_generator_1.generateP9Form(p9Data),
                            fileName: "P9-" + (emp.employeeNumber || emp.id) + "-" + year + ".html",
                            employeeName: emp.firstName ? emp.firstName + " " + emp.lastName : "Unknown"
                        }];
            }
        });
    });
}
exports.payrollRouter = trpc_1.router({
    // ===================== Main Payroll Management =====================
    list: trpc_1.createFeatureRestrictedProcedure("payroll:read")
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, empIds, empMap_1, empData, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.payroll)
                                .limit((input === null || input === void 0 ? void 0 : input.limit) || 50)
                                .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 3:
                        rows = _b.sent();
                        empIds = rows.map(function (r) { return r.employeeId; });
                        empMap_1 = new Map();
                        if (!empIds.length) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.select().from(schema_1.employees).where(drizzle_orm_1.inArray(schema_1.employees.id, empIds))];
                    case 4:
                        empData = _b.sent();
                        empMap_1 = new Map(empData.map(function (e) { return [e.id, e]; }));
                        _b.label = 5;
                    case 5: return [2 /*return*/, rows.map(function (r) {
                            var emp = empMap_1.get(r.employeeId) || {};
                            return __assign(__assign({}, r), { employeeName: emp.firstName ? (emp.firstName + " " + (emp.lastName || '')).trim() : undefined, department: emp.department, month: r.month || r.payPeriodStart || null });
                        })];
                    case 6:
                        error_1 = _b.sent();
                        console.warn("Error fetching payroll records:", error_1);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    getById: trpc_1.protectedProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result, row, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_1.payroll).where(drizzle_orm_1.eq(schema_1.payroll.id, input)).limit(1)];
                    case 3:
                        result = _b.sent();
                        row = result[0] || null;
                        if (!row)
                            return [2 /*return*/, null];
                        return [2 /*return*/, __assign(__assign({}, row), { month: row.month || row.payPeriodStart || null })];
                    case 4:
                        error_2 = _b.sent();
                        console.warn("Error fetching payroll by ID:", error_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    byEmployee: trpc_1.protectedProcedure
        .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result, error_3;
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
                        return [4 /*yield*/, db.select().from(schema_1.payroll).where(drizzle_orm_1.eq(schema_1.payroll.employeeId, input.employeeId))];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result.map(function (r) { return (__assign(__assign({}, r), { month: r.month || r.payPeriodStart || null })); })];
                    case 4:
                        error_3 = _b.sent();
                        console.warn("Error fetching payroll by employee:", error_3);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    previewBatch: trpc_1.createFeatureRestrictedProcedure("payroll:read")
        .input(zod_1.z.object({
        month: zod_1.z.string(),
        employeeIds: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, _b, start, end, employeeWhere, empRows, empIds, _c, structureRows, allowanceRows, deductionRows, structureByEmp, _i, _d, s, allowanceByEmp, _e, _f, a, amount, deductionByEmp, _g, _h, d, amount, records, totalGrossSalary, totalDeductions, totalNetSalary;
            var _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _k.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b = parseMonthRange(input.month), start = _b.start, end = _b.end;
                        employeeWhere = ((_j = input.employeeIds) === null || _j === void 0 ? void 0 : _j.length) ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.employees.status, "active"), drizzle_orm_1.inArray(schema_1.employees.id, input.employeeIds))
                            : drizzle_orm_1.eq(schema_1.employees.status, "active");
                        return [4 /*yield*/, db.select().from(schema_1.employees).where(employeeWhere)];
                    case 2:
                        empRows = _k.sent();
                        if (empRows.length === 0) {
                            return [2 /*return*/, {
                                    records: [],
                                    summary: {
                                        totalEmployees: 0,
                                        totalGrossSalary: 0,
                                        totalDeductions: 0,
                                        totalNetSalary: 0,
                                        averageSalary: 0
                                    }
                                }];
                        }
                        empIds = empRows.map(function (e) { return e.id; });
                        return [4 /*yield*/, Promise.all([
                                db.select().from(schema_extended_1.salaryStructures).where(drizzle_orm_1.inArray(schema_extended_1.salaryStructures.employeeId, empIds)),
                                db.select().from(schema_extended_1.salaryAllowances).where(drizzle_orm_1.inArray(schema_extended_1.salaryAllowances.employeeId, empIds)),
                                db.select().from(schema_extended_1.salaryDeductions).where(drizzle_orm_1.inArray(schema_extended_1.salaryDeductions.employeeId, empIds)),
                            ])];
                    case 3:
                        _c = _k.sent(), structureRows = _c[0], allowanceRows = _c[1], deductionRows = _c[2];
                        structureByEmp = new Map();
                        for (_i = 0, _d = structureRows; _i < _d.length; _i++) {
                            s = _d[_i];
                            if (!structureByEmp.has(s.employeeId))
                                structureByEmp.set(s.employeeId, s);
                        }
                        allowanceByEmp = new Map();
                        for (_e = 0, _f = allowanceRows; _e < _f.length; _e++) {
                            a = _f[_e];
                            amount = Number(a.amount || 0);
                            allowanceByEmp.set(a.employeeId, (allowanceByEmp.get(a.employeeId) || 0) + amount);
                        }
                        deductionByEmp = new Map();
                        for (_g = 0, _h = deductionRows; _g < _h.length; _g++) {
                            d = _h[_g];
                            amount = Number(d.amount || 0);
                            deductionByEmp.set(d.employeeId, (deductionByEmp.get(d.employeeId) || 0) + amount);
                        }
                        records = empRows.map(function (emp) {
                            var _a, _b, _c, _d, _e;
                            var structure = structureByEmp.get(emp.id);
                            var basicSalary = Number((_b = (_a = structure === null || structure === void 0 ? void 0 : structure.basicSalary) !== null && _a !== void 0 ? _a : emp.salary) !== null && _b !== void 0 ? _b : 0);
                            var structureAllowances = Number((_c = structure === null || structure === void 0 ? void 0 : structure.allowances) !== null && _c !== void 0 ? _c : 0);
                            var structureDeductions = Number((_d = structure === null || structure === void 0 ? void 0 : structure.deductions) !== null && _d !== void 0 ? _d : 0);
                            var dynamicAllowances = Number(allowanceByEmp.get(emp.id) || 0);
                            var dynamicDeductions = Number(deductionByEmp.get(emp.id) || 0);
                            var allowances = structureAllowances + dynamicAllowances;
                            var deductions = structureDeductions + dynamicDeductions;
                            var taxRateRaw = Number((_e = structure === null || structure === void 0 ? void 0 : structure.taxRate) !== null && _e !== void 0 ? _e : 0);
                            var taxRate = taxRateRaw > 1 ? taxRateRaw / 100 : taxRateRaw;
                            var grossSalary = basicSalary + allowances;
                            var tax = Math.max(0, Math.round(grossSalary * taxRate));
                            var netSalary = Math.max(0, grossSalary - deductions - tax);
                            return {
                                employeeId: emp.id,
                                firstName: emp.firstName,
                                lastName: emp.lastName,
                                department: emp.department,
                                month: input.month,
                                payPeriodStart: start,
                                payPeriodEnd: end,
                                basicSalary: basicSalary,
                                allowances: allowances,
                                deductions: deductions + tax,
                                netSalary: netSalary,
                                tax: tax
                            };
                        });
                        totalGrossSalary = records.reduce(function (sum, r) { return sum + r.basicSalary + r.allowances; }, 0);
                        totalDeductions = records.reduce(function (sum, r) { return sum + r.deductions; }, 0);
                        totalNetSalary = records.reduce(function (sum, r) { return sum + r.netSalary; }, 0);
                        return [2 /*return*/, {
                                records: records,
                                summary: {
                                    totalEmployees: records.length,
                                    totalGrossSalary: totalGrossSalary,
                                    totalDeductions: totalDeductions,
                                    totalNetSalary: totalNetSalary,
                                    averageSalary: records.length ? Math.floor(totalNetSalary / records.length) : 0
                                }
                            }];
                }
            });
        });
    }),
    processBatch: trpc_1.createFeatureRestrictedProcedure("payroll:create")
        .input(zod_1.z.object({
        month: zod_1.z.string(),
        employeeIds: zod_1.z.array(zod_1.z.string()).optional(),
        approverRole: zod_1.z.string().optional()["default"]("hr")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, preview, processed, skipped, errors, records, now, _i, preview_1, item, existing, payrollId, err_1, totalGrossSalary, totalDeductions, totalNetSalary;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, (function () { return __awaiter(void 0, void 0, void 0, function () {
                                var employeeWhere, empRows, empIds, _a, structureRows, allowanceRows, deductionRows, structureByEmp, _i, _b, s, allowanceByEmp, _c, _d, a, deductionByEmp, _e, _f, d, _g, start, end;
                                var _h;
                                return __generator(this, function (_j) {
                                    switch (_j.label) {
                                        case 0:
                                            employeeWhere = ((_h = input.employeeIds) === null || _h === void 0 ? void 0 : _h.length) ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.employees.status, "active"), drizzle_orm_1.inArray(schema_1.employees.id, input.employeeIds))
                                                : drizzle_orm_1.eq(schema_1.employees.status, "active");
                                            return [4 /*yield*/, db.select().from(schema_1.employees).where(employeeWhere)];
                                        case 1:
                                            empRows = _j.sent();
                                            if (empRows.length === 0)
                                                return [2 /*return*/, []];
                                            empIds = empRows.map(function (e) { return e.id; });
                                            return [4 /*yield*/, Promise.all([
                                                    db.select().from(schema_extended_1.salaryStructures).where(drizzle_orm_1.inArray(schema_extended_1.salaryStructures.employeeId, empIds)),
                                                    db.select().from(schema_extended_1.salaryAllowances).where(drizzle_orm_1.inArray(schema_extended_1.salaryAllowances.employeeId, empIds)),
                                                    db.select().from(schema_extended_1.salaryDeductions).where(drizzle_orm_1.inArray(schema_extended_1.salaryDeductions.employeeId, empIds)),
                                                ])];
                                        case 2:
                                            _a = _j.sent(), structureRows = _a[0], allowanceRows = _a[1], deductionRows = _a[2];
                                            structureByEmp = new Map();
                                            for (_i = 0, _b = structureRows; _i < _b.length; _i++) {
                                                s = _b[_i];
                                                if (!structureByEmp.has(s.employeeId))
                                                    structureByEmp.set(s.employeeId, s);
                                            }
                                            allowanceByEmp = new Map();
                                            for (_c = 0, _d = allowanceRows; _c < _d.length; _c++) {
                                                a = _d[_c];
                                                allowanceByEmp.set(a.employeeId, (allowanceByEmp.get(a.employeeId) || 0) + Number(a.amount || 0));
                                            }
                                            deductionByEmp = new Map();
                                            for (_e = 0, _f = deductionRows; _e < _f.length; _e++) {
                                                d = _f[_e];
                                                deductionByEmp.set(d.employeeId, (deductionByEmp.get(d.employeeId) || 0) + Number(d.amount || 0));
                                            }
                                            _g = parseMonthRange(input.month), start = _g.start, end = _g.end;
                                            return [2 /*return*/, empRows.map(function (emp) {
                                                    var _a, _b, _c, _d, _e;
                                                    var structure = structureByEmp.get(emp.id);
                                                    var basicSalary = Number((_b = (_a = structure === null || structure === void 0 ? void 0 : structure.basicSalary) !== null && _a !== void 0 ? _a : emp.salary) !== null && _b !== void 0 ? _b : 0);
                                                    var structureAllowances = Number((_c = structure === null || structure === void 0 ? void 0 : structure.allowances) !== null && _c !== void 0 ? _c : 0);
                                                    var structureDeductions = Number((_d = structure === null || structure === void 0 ? void 0 : structure.deductions) !== null && _d !== void 0 ? _d : 0);
                                                    var dynamicAllowances = Number(allowanceByEmp.get(emp.id) || 0);
                                                    var dynamicDeductions = Number(deductionByEmp.get(emp.id) || 0);
                                                    var allowances = structureAllowances + dynamicAllowances;
                                                    var deductionsBase = structureDeductions + dynamicDeductions;
                                                    var taxRateRaw = Number((_e = structure === null || structure === void 0 ? void 0 : structure.taxRate) !== null && _e !== void 0 ? _e : 0);
                                                    var taxRate = taxRateRaw > 1 ? taxRateRaw / 100 : taxRateRaw;
                                                    var grossSalary = basicSalary + allowances;
                                                    var tax = Math.max(0, Math.round(grossSalary * taxRate));
                                                    var deductions = deductionsBase + tax;
                                                    var netSalary = Math.max(0, grossSalary - deductions);
                                                    return {
                                                        employeeId: emp.id,
                                                        basicSalary: basicSalary,
                                                        allowances: allowances,
                                                        deductions: deductions,
                                                        tax: tax,
                                                        netSalary: netSalary,
                                                        payPeriodStart: start,
                                                        payPeriodEnd: end
                                                    };
                                                })];
                                    }
                                });
                            }); })()];
                    case 2:
                        preview = _b.sent();
                        if (preview.length === 0) {
                            return [2 /*return*/, {
                                    processed: 0,
                                    skipped: 0,
                                    errors: [],
                                    records: [],
                                    summary: {
                                        totalEmployees: 0,
                                        totalGrossSalary: 0,
                                        totalDeductions: 0,
                                        totalNetSalary: 0,
                                        averageSalary: 0
                                    }
                                }];
                        }
                        processed = 0;
                        skipped = 0;
                        errors = [];
                        records = [];
                        now = toDbDate(new Date());
                        _i = 0, preview_1 = preview;
                        _b.label = 3;
                    case 3:
                        if (!(_i < preview_1.length)) return [3 /*break*/, 10];
                        item = preview_1[_i];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 8, , 9]);
                        return [4 /*yield*/, db
                                .select({ id: schema_1.payroll.id })
                                .from(schema_1.payroll)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payroll.employeeId, item.employeeId), drizzle_orm_1.eq(schema_1.payroll.payPeriodStart, item.payPeriodStart)))
                                .limit(1)];
                    case 5:
                        existing = _b.sent();
                        if (existing.length > 0) {
                            skipped++;
                            return [3 /*break*/, 9];
                        }
                        payrollId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.payroll).values({
                                id: payrollId,
                                employeeId: item.employeeId,
                                payPeriodStart: item.payPeriodStart,
                                payPeriodEnd: item.payPeriodEnd,
                                basicSalary: item.basicSalary,
                                allowances: item.allowances,
                                deductions: item.deductions,
                                tax: item.tax,
                                netSalary: item.netSalary,
                                status: "processed",
                                createdBy: ctx.user.id,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, db.insert(schema_extended_1.payrollApprovals).values({
                                id: uuid_1.v4(),
                                payrollId: payrollId,
                                approverRole: input.approverRole || "hr",
                                approverId: ctx.user.id,
                                status: "pending",
                                createdAt: now
                            })];
                    case 7:
                        _b.sent();
                        records.push({
                            id: payrollId,
                            employeeId: item.employeeId,
                            basicSalary: item.basicSalary,
                            allowances: item.allowances,
                            deductions: item.deductions,
                            netSalary: item.netSalary
                        });
                        processed++;
                        return [3 /*break*/, 9];
                    case 8:
                        err_1 = _b.sent();
                        errors.push((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || "Failed to process payroll record");
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 3];
                    case 10:
                        totalGrossSalary = records.reduce(function (sum, r) { return sum + r.basicSalary + r.allowances; }, 0);
                        totalDeductions = records.reduce(function (sum, r) { return sum + r.deductions; }, 0);
                        totalNetSalary = records.reduce(function (sum, r) { return sum + r.netSalary; }, 0);
                        return [2 /*return*/, {
                                processed: processed,
                                skipped: skipped,
                                errors: errors,
                                records: records,
                                summary: {
                                    totalEmployees: records.length,
                                    totalGrossSalary: totalGrossSalary,
                                    totalDeductions: totalDeductions,
                                    totalNetSalary: totalNetSalary,
                                    averageSalary: records.length ? Math.floor(totalNetSalary / records.length) : 0
                                }
                            }];
                }
            });
        });
    }),
    create: trpc_1.createFeatureRestrictedProcedure("payroll:create")
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        // Accept `month` (YYYY-MM) from frontend for convenience
        month: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional(),
        payPeriodStart: zod_1.z.date().optional(),
        payPeriodEnd: zod_1.z.date().optional(),
        notes: zod_1.z.string().optional(),
        basicSalary: zod_1.z.number(),
        allowances: zod_1.z.number().optional(),
        deductions: zod_1.z.number().optional(),
        tax: zod_1.z.number().optional(),
        netSalary: zod_1.z.number(),
        status: zod_1.z["enum"](["draft", "processed", "paid"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, now, derivedStart, insertData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        derivedStart = undefined;
                        if (input.month) {
                            try {
                                if (input.month instanceof Date) {
                                    derivedStart = input.month.toISOString().replace('T', ' ').substring(0, 19);
                                }
                                else {
                                    derivedStart = new Date(input.month + "-01").toISOString().replace('T', ' ').substring(0, 19);
                                }
                            }
                            catch (e) {
                                derivedStart = undefined;
                            }
                        }
                        insertData = __assign(__assign({}, input), { payPeriodStart: input.payPeriodStart ? input.payPeriodStart.toISOString().replace('T', ' ').substring(0, 19) : derivedStart, payPeriodEnd: input.payPeriodEnd ? input.payPeriodEnd.toISOString().replace('T', ' ').substring(0, 19) : undefined, createdBy: ctx.user.id, createdAt: now, updatedAt: now });
                        return [4 /*yield*/, db.insert(schema_1.payroll).values(__assign({ id: id }, insertData))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: trpc_1.createFeatureRestrictedProcedure("payroll:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        employeeId: zod_1.z.string().optional(),
        // Allow updating via `month` as well (string YYYY-MM or Date)
        month: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional(),
        payPeriodStart: zod_1.z.date().optional(),
        payPeriodEnd: zod_1.z.date().optional(),
        notes: zod_1.z.string().optional(),
        basicSalary: zod_1.z.number().optional(),
        allowances: zod_1.z.number().optional(),
        deductions: zod_1.z.number().optional(),
        tax: zod_1.z.number().optional(),
        netSalary: zod_1.z.number().optional(),
        status: zod_1.z["enum"](["draft", "processed", "paid"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, data, now, derivedStart, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = input.id, data = __rest(input, ["id"]);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        derivedStart = undefined;
                        if (data.month) {
                            try {
                                if (data.month instanceof Date) {
                                    derivedStart = data.month.toISOString().replace('T', ' ').substring(0, 19);
                                }
                                else {
                                    derivedStart = new Date(data.month + "-01").toISOString().replace('T', ' ').substring(0, 19);
                                }
                            }
                            catch (e) {
                                derivedStart = undefined;
                            }
                        }
                        updateData = __assign(__assign({}, data), { payPeriodStart: data.payPeriodStart ? data.payPeriodStart.toISOString().replace('T', ' ').substring(0, 19) : derivedStart || undefined, payPeriodEnd: data.payPeriodEnd ? data.payPeriodEnd.toISOString().replace('T', ' ').substring(0, 19) : undefined, updatedAt: now });
                        // remove frontend-only key
                        delete updateData.month;
                        return [4 /*yield*/, db.update(schema_1.payroll).set(updateData).where(drizzle_orm_1.eq(schema_1.payroll.id, id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": trpc_1.createFeatureRestrictedProcedure("payroll:delete")
        .input(zod_1.z.string())
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
                        return [4 /*yield*/, db["delete"](schema_1.payroll).where(drizzle_orm_1.eq(schema_1.payroll.id, input))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // bulk operations for payroll records (Tier 3)
    bulkUpdateStatus: trpc_1.createFeatureRestrictedProcedure("payroll:edit")
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()).optional(),
        payrollIds: zod_1.z.array(zod_1.z.string()).optional(),
        status: zod_1.z["enum"](["draft", "processed", "paid"])
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, ids;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        ids = resolvePayrollIds(input);
                        if (ids.length === 0) {
                            return [2 /*return*/, { success: true }];
                        }
                        return [4 /*yield*/, db
                                .update(schema_1.payroll)
                                .set({ status: input.status })
                                .where(drizzle_orm_1.inArray(schema_1.payroll.id, ids))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    bulkDelete: trpc_1.createFeatureRestrictedProcedure("payroll:delete")
        .input(zod_1.z.object({ ids: zod_1.z.array(zod_1.z.string()).optional(), payrollIds: zod_1.z.array(zod_1.z.string()).optional() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, ids;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        ids = resolvePayrollIds(input);
                        if (ids.length === 0)
                            return [2 /*return*/, { success: true }];
                        return [4 /*yield*/, db["delete"](schema_1.payroll).where(drizzle_orm_1.inArray(schema_1.payroll.id, ids))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    bulkExport: trpc_1.createFeatureRestrictedProcedure("payroll:read")
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()).optional(),
        payrollIds: zod_1.z.array(zod_1.z.string()).optional(),
        format: zod_1.z["enum"](["xlsx", "csv"])["default"]("xlsx")
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, ids, query, records, workbook, worksheet_1, buffer, headers, rows, csv;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        ids = resolvePayrollIds(input);
                        if (ids.length === 0) {
                            return [2 /*return*/, { success: false, message: "No records selected" }];
                        }
                        query = database
                            .select()
                            .from(schema_1.payroll)
                            .where(drizzle_orm_1.inArray(schema_1.payroll.id, ids));
                        return [4 /*yield*/, query];
                    case 2:
                        records = _b.sent();
                        if (records.length === 0) {
                            return [2 /*return*/, { success: false, message: "No records selected" }];
                        }
                        if (!(input.format === "xlsx")) return [3 /*break*/, 4];
                        workbook = new exceljs_1["default"].Workbook();
                        worksheet_1 = workbook.addWorksheet("Payroll");
                        worksheet_1.columns = [
                            { header: "Employee ID", key: "employeeId", width: 20 },
                            { header: "Payment Date", key: "paymentDate", width: 15 },
                            { header: "Basic Salary", key: "basicSalary", width: 14 },
                            { header: "Allowances", key: "allowances", width: 12 },
                            { header: "Deductions", key: "deductions", width: 12 },
                            { header: "Net Salary", key: "netSalary", width: 12 },
                            { header: "Status", key: "status", width: 10 },
                        ];
                        records.forEach(function (r) { return worksheet_1.addRow(r); });
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 3:
                        buffer = _b.sent();
                        return [2 /*return*/, { data: Buffer.from(buffer).toString("base64"), format: "xlsx" }];
                    case 4:
                        headers = [
                            "Employee ID",
                            "Payment Date",
                            "Basic Salary",
                            "Allowances",
                            "Deductions",
                            "Net Salary",
                            "Status",
                        ];
                        rows = records.map(function (r) { return [
                            r.employeeId,
                            r.paymentDate,
                            r.basicSalary,
                            r.allowances,
                            r.deductions,
                            r.netSalary,
                            r.status,
                        ]; });
                        csv = __spreadArrays([headers.join(",")], rows.map(function (row) { return row.join(","); })).join("\n");
                        return [2 /*return*/, { data: csv, format: "csv" }];
                }
            });
        });
    }),
    // ===================== Salary Structure Management =====================
    salaryStructures: trpc_1.router({
        list: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
            var db, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _a.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_extended_1.salaryStructures)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_4 = _a.sent();
                        console.warn("Error fetching salary structures:", error_4);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        }); }),
        byEmployee: trpc_1.createFeatureRestrictedProcedure("payroll:read")
            .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, error_5;
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
                            return [4 /*yield*/, db.select().from(schema_extended_1.salaryStructures).where(drizzle_orm_1.eq(schema_extended_1.salaryStructures.employeeId, input.employeeId))];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            error_5 = _b.sent();
                            console.warn("Error fetching salary structures for employee:", error_5);
                            return [2 /*return*/, []];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }),
        create: trpc_1.createFeatureRestrictedProcedure("payroll:create")
            .input(zod_1.z.object({
            employeeId: zod_1.z.string(),
            basicSalary: zod_1.z.number(),
            allowances: zod_1.z.number().optional()["default"](0),
            deductions: zod_1.z.number().optional()["default"](0),
            taxRate: zod_1.z.number().optional()["default"](0),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, now, dateStr;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            now = new Date();
                            dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.insert(schema_extended_1.salaryStructures).values(__assign(__assign({ id: id }, input), { effectiveDate: dateStr, createdBy: ctx.user.id, createdAt: dateStr, updatedAt: dateStr }))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { id: id }];
                    }
                });
            });
        }),
        update: trpc_1.createFeatureRestrictedProcedure("payroll:edit")
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            basicSalary: zod_1.z.number().optional(),
            allowances: zod_1.z.number().optional(),
            deductions: zod_1.z.number().optional(),
            taxRate: zod_1.z.number().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, data, now;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = input.id, data = __rest(input, ["id"]);
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.update(schema_extended_1.salaryStructures).set(__assign(__assign({}, data), { updatedAt: now })).where(drizzle_orm_1.eq(schema_extended_1.salaryStructures.id, id))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        "delete": trpc_1.createFeatureRestrictedProcedure("payroll:delete")
            .input(zod_1.z.string())
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
                            return [4 /*yield*/, db["delete"](schema_extended_1.salaryStructures).where(drizzle_orm_1.eq(schema_extended_1.salaryStructures.id, input))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        })
    }),
    // ===================== Salary Allowances Management =====================
    allowances: trpc_1.router({
        list: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
            var db, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _a.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_extended_1.salaryAllowances)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_6 = _a.sent();
                        console.warn("Error fetching salary allowances:", error_6);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        }); }),
        byEmployee: trpc_1.createFeatureRestrictedProcedure("payroll:read")
            .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, error_7;
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
                            return [4 /*yield*/, db.select().from(schema_extended_1.salaryAllowances).where(drizzle_orm_1.eq(schema_extended_1.salaryAllowances.employeeId, input.employeeId))];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            error_7 = _b.sent();
                            console.warn("Error fetching salary allowances for employee:", error_7);
                            return [2 /*return*/, []];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }),
        create: trpc_1.createFeatureRestrictedProcedure("payroll:create")
            .input(zod_1.z.object({
            employeeId: zod_1.z.string(),
            allowanceType: zod_1.z.string(),
            amount: zod_1.z.number(),
            frequency: zod_1.z["enum"](["monthly", "quarterly", "annual", "one_time"]),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, now, dateStr;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            now = new Date();
                            dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.insert(schema_extended_1.salaryAllowances).values(__assign(__assign({ id: id }, input), { effectiveDate: dateStr, isActive: true, createdBy: ctx.user.id, createdAt: dateStr, updatedAt: dateStr }))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { id: id }];
                    }
                });
            });
        }),
        update: trpc_1.createFeatureRestrictedProcedure("payroll:edit")
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            allowanceType: zod_1.z.string().optional(),
            amount: zod_1.z.number().optional(),
            frequency: zod_1.z["enum"](["monthly", "quarterly", "annual", "one_time"]).optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, data, now;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = input.id, data = __rest(input, ["id"]);
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.update(schema_extended_1.salaryAllowances).set(__assign(__assign({}, data), { updatedAt: now })).where(drizzle_orm_1.eq(schema_extended_1.salaryAllowances.id, id))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        "delete": trpc_1.createFeatureRestrictedProcedure("payroll:delete")
            .input(zod_1.z.string())
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
                            return [4 /*yield*/, db["delete"](schema_extended_1.salaryAllowances).where(drizzle_orm_1.eq(schema_extended_1.salaryAllowances.id, input))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        })
    }),
    // ===================== Salary Deductions Management =====================
    deductions: trpc_1.router({
        list: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
            var db, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _a.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_extended_1.salaryDeductions)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_8 = _a.sent();
                        console.warn("Error fetching salary deductions:", error_8);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        }); }),
        byEmployee: trpc_1.createFeatureRestrictedProcedure("payroll:read")
            .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, error_9;
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
                            return [4 /*yield*/, db.select().from(schema_extended_1.salaryDeductions).where(drizzle_orm_1.eq(schema_extended_1.salaryDeductions.employeeId, input.employeeId))];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            error_9 = _b.sent();
                            console.warn("Error fetching salary deductions for employee:", error_9);
                            return [2 /*return*/, []];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }),
        create: trpc_1.createFeatureRestrictedProcedure("payroll:create")
            .input(zod_1.z.object({
            employeeId: zod_1.z.string(),
            deductionType: zod_1.z.string(),
            amount: zod_1.z.number(),
            frequency: zod_1.z["enum"](["monthly", "quarterly", "annual", "one_time"]),
            reference: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, now, dateStr;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            now = new Date();
                            dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.insert(schema_extended_1.salaryDeductions).values(__assign(__assign({ id: id }, input), { effectiveDate: dateStr, isActive: true, createdBy: ctx.user.id, createdAt: dateStr, updatedAt: dateStr }))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { id: id }];
                    }
                });
            });
        }),
        update: trpc_1.createFeatureRestrictedProcedure("payroll:edit")
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            deductionType: zod_1.z.string().optional(),
            amount: zod_1.z.number().optional(),
            frequency: zod_1.z["enum"](["monthly", "quarterly", "annual", "one_time"]).optional(),
            reference: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, data, now;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = input.id, data = __rest(input, ["id"]);
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.update(schema_extended_1.salaryDeductions).set(__assign(__assign({}, data), { updatedAt: now })).where(drizzle_orm_1.eq(schema_extended_1.salaryDeductions.id, id))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        "delete": trpc_1.createFeatureRestrictedProcedure("payroll:delete")
            .input(zod_1.z.string())
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
                            return [4 /*yield*/, db["delete"](schema_extended_1.salaryDeductions).where(drizzle_orm_1.eq(schema_extended_1.salaryDeductions.id, input))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        })
    }),
    // ===================== Employee Benefits Management =====================
    benefits: trpc_1.router({
        list: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
            var db, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _a.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_extended_1.employeeBenefits)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_10 = _a.sent();
                        console.warn("Error fetching employee benefits:", error_10);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        }); }),
        byEmployee: trpc_1.createFeatureRestrictedProcedure("payroll:read")
            .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, error_11;
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
                            return [4 /*yield*/, db.select().from(schema_extended_1.employeeBenefits).where(drizzle_orm_1.eq(schema_extended_1.employeeBenefits.employeeId, input.employeeId))];
                        case 3: return [2 /*return*/, _b.sent()];
                        case 4:
                            error_11 = _b.sent();
                            console.warn("Error fetching employee benefits for employee:", error_11);
                            return [2 /*return*/, []];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }),
        create: trpc_1.createFeatureRestrictedProcedure("payroll:create")
            .input(zod_1.z.object({
            employeeId: zod_1.z.string(),
            benefitType: zod_1.z.string(),
            provider: zod_1.z.string().optional(),
            coverage: zod_1.z.string().optional(),
            cost: zod_1.z.number().optional(),
            employerCost: zod_1.z.number().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, now, dateStr;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            now = new Date();
                            dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.insert(schema_extended_1.employeeBenefits).values(__assign(__assign({ id: id }, input), { enrollDate: dateStr, isActive: true, createdBy: ctx.user.id, createdAt: dateStr, updatedAt: dateStr }))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { id: id }];
                    }
                });
            });
        }),
        update: trpc_1.createFeatureRestrictedProcedure("payroll:edit")
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            benefitType: zod_1.z.string().optional(),
            provider: zod_1.z.string().optional(),
            coverage: zod_1.z.string().optional(),
            cost: zod_1.z.number().optional(),
            employerCost: zod_1.z.number().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, data, now;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = input.id, data = __rest(input, ["id"]);
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.update(schema_extended_1.employeeBenefits).set(__assign(__assign({}, data), { updatedAt: now })).where(drizzle_orm_1.eq(schema_extended_1.employeeBenefits.id, id))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        "delete": trpc_1.createFeatureRestrictedProcedure("payroll:delete")
            .input(zod_1.z.string())
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
                            return [4 /*yield*/, db["delete"](schema_extended_1.employeeBenefits).where(drizzle_orm_1.eq(schema_extended_1.employeeBenefits.id, input))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        })
    }),
    // ===================== Tax Information Management =====================
    taxInfo: trpc_1.router({
        byEmployee: trpc_1.createFeatureRestrictedProcedure("payroll:read")
            .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, result;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, null];
                            return [4 /*yield*/, db.select().from(schema_extended_1.employeeTaxInfo).where(drizzle_orm_1.eq(schema_extended_1.employeeTaxInfo.employeeId, input.employeeId))];
                        case 2:
                            result = _b.sent();
                            return [2 /*return*/, result[0] || null];
                    }
                });
            });
        }),
        create: trpc_1.createFeatureRestrictedProcedure("payroll:create")
            .input(zod_1.z.object({
            employeeId: zod_1.z.string(),
            taxNumber: zod_1.z.string(),
            taxBracket: zod_1.z.string().optional(),
            exemptions: zod_1.z.number().optional()["default"](0),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, now, dateStr;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            now = new Date();
                            dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.insert(schema_extended_1.employeeTaxInfo).values(__assign(__assign({ id: id }, input), { effectiveDate: dateStr, createdBy: ctx.user.id, createdAt: dateStr, updatedAt: dateStr }))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { id: id }];
                    }
                });
            });
        }),
        update: trpc_1.createFeatureRestrictedProcedure("payroll:edit")
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            taxBracket: zod_1.z.string().optional(),
            exemptions: zod_1.z.number().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, data, now;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = input.id, data = __rest(input, ["id"]);
                            now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.update(schema_extended_1.employeeTaxInfo).set(__assign(__assign({}, data), { updatedAt: now })).where(drizzle_orm_1.eq(schema_extended_1.employeeTaxInfo.id, id))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        "delete": trpc_1.createFeatureRestrictedProcedure("payroll:delete")
            .input(zod_1.z.string())
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
                            return [4 /*yield*/, db["delete"](schema_extended_1.employeeTaxInfo).where(drizzle_orm_1.eq(schema_extended_1.employeeTaxInfo.id, input))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        })
    }),
    // ===================== Salary Increment Management =====================
    increments: trpc_1.router({
        byEmployee: trpc_1.createFeatureRestrictedProcedure("payroll:read")
            .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, db.select().from(schema_extended_1.salaryIncrements).where(drizzle_orm_1.eq(schema_extended_1.salaryIncrements.employeeId, input.employeeId))];
                        case 2: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        }),
        create: trpc_1.createFeatureRestrictedProcedure("payroll:create")
            .input(zod_1.z.object({
            employeeId: zod_1.z.string(),
            previousSalary: zod_1.z.number(),
            newSalary: zod_1.z.number(),
            reason: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, previousSalary, newSalary, incrementPercent, now, dateStr;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            previousSalary = input.previousSalary;
                            newSalary = input.newSalary;
                            incrementPercent = previousSalary > 0 ? ((newSalary - previousSalary) / previousSalary) * 10000 : 0;
                            now = new Date();
                            dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
                            return [4 /*yield*/, db.insert(schema_extended_1.salaryIncrements).values(__assign(__assign({ id: id }, input), { incrementPercent: Math.round(incrementPercent), effectiveDate: dateStr, createdBy: ctx.user.id, createdAt: dateStr }))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { id: id }];
                    }
                });
            });
        }),
        approve: trpc_1.createFeatureRestrictedProcedure("payroll:edit")
            .input(zod_1.z.object({
            id: zod_1.z.string()
        }))
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
                            return [4 /*yield*/, db.update(schema_extended_1.salaryIncrements).set({
                                    approvedBy: ctx.user.id,
                                    approvalDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                }).where(drizzle_orm_1.eq(schema_extended_1.salaryIncrements.id, input.id))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        update: trpc_1.createFeatureRestrictedProcedure("payroll:edit")
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            previousSalary: zod_1.z.number().optional(),
            newSalary: zod_1.z.number().optional(),
            reason: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id, data, updateData, incrementPercent;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = input.id, data = __rest(input, ["id"]);
                            updateData = __assign({}, data);
                            if (data.previousSalary && data.newSalary) {
                                incrementPercent = data.previousSalary > 0 ? ((data.newSalary - data.previousSalary) / data.previousSalary) * 10000 : 0;
                                updateData.incrementPercent = Math.round(incrementPercent);
                            }
                            return [4 /*yield*/, db.update(schema_extended_1.salaryIncrements).set(__assign(__assign({}, updateData), { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })).where(drizzle_orm_1.eq(schema_extended_1.salaryIncrements.id, id))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        "delete": trpc_1.createFeatureRestrictedProcedure("payroll:delete")
            .input(zod_1.z.string())
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
                            return [4 /*yield*/, db["delete"](schema_extended_1.salaryIncrements).where(drizzle_orm_1.eq(schema_extended_1.salaryIncrements.id, input))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        })
    }),
    // ===================== Payroll Approval Workflow =====================
    approvals: trpc_1.router({
        list: trpc_1.createFeatureRestrictedProcedure("payroll:read")
            .input(zod_1.z.object({ status: zod_1.z.string().optional() }).optional())
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, params, conditions, rows, payrollIds, payrollRows, empIds, empRows, _b, payrollMap, empMap;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _c.sent();
                            if (!db)
                                return [2 /*return*/, []];
                            params = input || {};
                            conditions = [];
                            if (params.status)
                                conditions.push(drizzle_orm_1.eq(schema_extended_1.payrollApprovals.status, params.status));
                            return [4 /*yield*/, db.select().from(schema_extended_1.payrollApprovals).where(conditions.length ? drizzle_orm_1.and.apply(void 0, conditions) : undefined)];
                        case 2:
                            rows = _c.sent();
                            payrollIds = Array.from(new Set(rows.map(function (r) { return r.payrollId; })));
                            if (payrollIds.length === 0)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, db.select().from(schema_1.payroll).where(drizzle_orm_1.inArray(schema_1.payroll.id, payrollIds))];
                        case 3:
                            payrollRows = _c.sent();
                            empIds = Array.from(new Set(payrollRows.map(function (p) { return p.employeeId; })));
                            if (!empIds.length) return [3 /*break*/, 5];
                            return [4 /*yield*/, db.select().from(schema_1.employees).where(drizzle_orm_1.inArray(schema_1.employees.id, empIds))];
                        case 4:
                            _b = _c.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            _b = [];
                            _c.label = 6;
                        case 6:
                            empRows = _b;
                            payrollMap = Object.fromEntries(payrollRows.map(function (p) { return [p.id, p]; }));
                            empMap = Object.fromEntries(empRows.map(function (e) { return [e.id, e]; }));
                            return [2 /*return*/, rows.map(function (r) {
                                    var pr = payrollMap[r.payrollId];
                                    var emp = pr ? empMap[pr.employeeId] : null;
                                    return __assign(__assign({}, r), { employeeName: emp ? ((emp.firstName || "") + " " + (emp.lastName || "")).trim() : "Unknown", basicSalary: (pr === null || pr === void 0 ? void 0 : pr.basicSalary) || 0, netSalary: (pr === null || pr === void 0 ? void 0 : pr.netSalary) || 0, payPeriodStart: pr === null || pr === void 0 ? void 0 : pr.payPeriodStart, payPeriodEnd: pr === null || pr === void 0 ? void 0 : pr.payPeriodEnd });
                                })];
                    }
                });
            });
        }),
        byPayroll: trpc_1.createFeatureRestrictedProcedure("payroll:read")
            .input(zod_1.z.object({ payrollId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, db.select().from(schema_extended_1.payrollApprovals).where(drizzle_orm_1.eq(schema_extended_1.payrollApprovals.payrollId, input.payrollId))];
                        case 2: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        }),
        create: trpc_1.createFeatureRestrictedProcedure("payroll:create")
            .input(zod_1.z.object({
            payrollId: zod_1.z.string(),
            approverRole: zod_1.z.string()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, id;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            return [4 /*yield*/, db.insert(schema_extended_1.payrollApprovals).values(__assign(__assign({ id: id }, input), { approverId: ctx.user.id, status: "pending", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { id: id }];
                    }
                });
            });
        }),
        approve: trpc_1.createFeatureRestrictedProcedure("payroll:edit")
            .input(zod_1.z.object({
            id: zod_1.z.string()
        }))
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
                            return [4 /*yield*/, db.update(schema_extended_1.payrollApprovals).set({
                                    status: "approved",
                                    approvalDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                }).where(drizzle_orm_1.eq(schema_extended_1.payrollApprovals.id, input.id))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        }),
        reject: trpc_1.createFeatureRestrictedProcedure("payroll:edit")
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            reason: zod_1.z.string()
        }))
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
                            return [4 /*yield*/, db.update(schema_extended_1.payrollApprovals).set({
                                    status: "rejected",
                                    rejectionReason: input.reason,
                                    approvalDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                }).where(drizzle_orm_1.eq(schema_extended_1.payrollApprovals.id, input.id))];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        })
    }),
    // ===================== Kenyan Payroll Calculation =====================
    kenyanCalculate: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        basicSalary: zod_1.z.number(),
        allowances: zod_1.z.number().optional()["default"](0),
        housingAllowance: zod_1.z.number().optional()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_b) {
                try {
                    result = kenyan_payroll_calculator_1.calculateKenyanPayroll({
                        basicSalary: input.basicSalary,
                        allowances: input.allowances,
                        housingAllowance: input.housingAllowance
                    });
                    return [2 /*return*/, result];
                }
                catch (error) {
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to calculate payroll'
                    });
                }
                return [2 /*return*/];
            });
        });
    }),
    // Save calculated Kenyan payroll
    saveKenyanPayroll: trpc_1.createFeatureRestrictedProcedure("payroll:create")
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        basicSalary: zod_1.z.number(),
        allowances: zod_1.z.number().optional()["default"](0),
        housingAllowance: zod_1.z.number().optional()["default"](0),
        payPeriodStart: zod_1.z.date(),
        payPeriodEnd: zod_1.z.date(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, calculation, payrollId, now, periodStart, periodEnd, components, _i, components_1, comp, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        calculation = kenyan_payroll_calculator_1.calculateKenyanPayroll({
                            basicSalary: input.basicSalary,
                            allowances: input.allowances,
                            housingAllowance: input.housingAllowance
                        });
                        payrollId = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        periodStart = input.payPeriodStart.toISOString().replace('T', ' ').substring(0, 19);
                        periodEnd = input.payPeriodEnd.toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(schema_1.payroll).values({
                                id: payrollId,
                                employeeId: input.employeeId,
                                payPeriodStart: periodStart,
                                payPeriodEnd: periodEnd,
                                status: "processed",
                                basicSalary: calculation.basicSalary,
                                allowances: input.allowances * 100,
                                deductions: calculation.nssfContribution + calculation.payeeTax + calculation.shifContribution + calculation.housingLevyDeduction,
                                tax: calculation.payeeTax,
                                netSalary: calculation.netSalary,
                                notes: input.notes || "Kenyan payroll: NSSF=" + calculation.nssfContribution + ", PAYE=" + calculation.payeeTax + ", SHIF=" + calculation.shifContribution + ", Housing=" + calculation.housingLevyDeduction,
                                createdBy: ctx.user.id,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 3:
                        _b.sent();
                        components = [
                            { type: 'allowance', name: 'Allowances', amount: input.allowances * 100 },
                            { type: 'deduction', name: 'NSSF Tier 1', amount: calculation.details.nssfTier1 },
                            { type: 'deduction', name: 'NSSF Tier 2', amount: calculation.details.nssfTier2 },
                            { type: 'deduction', name: 'PAYE Tax', amount: calculation.payeeTax },
                            { type: 'deduction', name: 'SHIF Contribution', amount: calculation.shifContribution },
                            { type: 'deduction', name: 'Housing Levy', amount: calculation.housingLevyDeduction },
                            { type: 'deduction', name: 'Personal Relief', amount: calculation.personalRelief },
                        ];
                        _i = 0, components_1 = components;
                        _b.label = 4;
                    case 4:
                        if (!(_i < components_1.length)) return [3 /*break*/, 7];
                        comp = components_1[_i];
                        if (!(comp.amount > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, db.insert(schema_extended_1.payrollDetails).values({
                                id: uuid_1.v4(),
                                payrollId: payrollId,
                                componentType: comp.type,
                                component: comp.name,
                                amount: comp.amount,
                                notes: comp.name + " deduction for " + periodStart.split(' ')[0]
                            })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, {
                            id: payrollId,
                            calculation: calculation,
                            message: 'Kenyan payroll created successfully'
                        }];
                    case 8:
                        error_12 = _b.sent();
                        console.error('Payroll save error:', error_12);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to save payroll'
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    // ===================== P9 Form Generation =====================
    // Generate and send KRA P9 form to employee
    generateP9: trpc_1.createFeatureRestrictedProcedure("payroll:read")
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        taxYear: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, certifiedBy, generated, error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        certifiedBy = ctx.user.firstName ? ctx.user.firstName + " " + ctx.user.lastName : "HR Manager";
                        return [4 /*yield*/, buildP9ForEmployee(db, input.employeeId, certifiedBy, input.taxYear)];
                    case 2:
                        generated = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    htmlContent: generated.htmlContent,
                                    fileName: generated.fileName,
                                    employeeName: generated.employeeName
                                }
                            }];
                    case 3:
                        error_13 = _b.sent();
                        console.error('P9 form generation error:', error_13);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: "Failed to generate P9 form: " + ((error_13 === null || error_13 === void 0 ? void 0 : error_13.message) || 'Unknown error')
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // Download P9 form as PDF/HTML
    downloadP9: trpc_1.createFeatureRestrictedProcedure("payroll:read")
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        format: zod_1.z["enum"](['html', 'pdf']).optional()["default"]('html')
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, certifiedBy, generated, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        certifiedBy = ctx.user.firstName ? ctx.user.firstName + " " + ctx.user.lastName : "HR Manager";
                        return [4 /*yield*/, buildP9ForEmployee(db, input.employeeId, certifiedBy)];
                    case 2:
                        generated = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: generated.htmlContent,
                                fileName: generated.fileName,
                                mimeType: 'text/html'
                            }];
                    case 3:
                        error_14 = _b.sent();
                        console.error('P9 download error:', error_14);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: "Failed to download P9: " + ((error_14 === null || error_14 === void 0 ? void 0 : error_14.message) || 'Unknown error')
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // List and send P9 forms to multiple employees
    sendP9ToMultiple: trpc_1.createFeatureRestrictedProcedure("payroll:read")
        .input(zod_1.z.object({
        employeeIds: zod_1.z.array(zod_1.z.string()),
        sendEmail: zod_1.z.boolean().optional()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, results, errors, certifiedBy, _i, _b, employeeId, p9Result, err_2, error_15;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error("Database not available");
                        results = [];
                        errors = [];
                        certifiedBy = ctx.user.firstName ? ctx.user.firstName + " " + ctx.user.lastName : "HR Manager";
                        _i = 0, _b = input.employeeIds;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        employeeId = _b[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, buildP9ForEmployee(db, employeeId, certifiedBy)];
                    case 4:
                        p9Result = _c.sent();
                        results.push({
                            employeeId: employeeId,
                            success: true,
                            fileName: p9Result.fileName
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        err_2 = _c.sent();
                        errors.push({
                            employeeId: employeeId,
                            success: false,
                            error: (err_2 === null || err_2 === void 0 ? void 0 : err_2.message) || 'Unknown error'
                        });
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, {
                            success: errors.length === 0,
                            generated: results.length,
                            failed: errors.length,
                            results: results,
                            errors: errors
                        }];
                    case 8:
                        error_15 = _c.sent();
                        console.error('Bulk P9 generation error:', error_15);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: "Failed to generate P9 forms: " + ((error_15 === null || error_15 === void 0 ? void 0 : error_15.message) || 'Unknown error')
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    // ===================== Automated Payroll Admin Triggers =====================
    /** Manually trigger monthly payroll processing (admin/HR only) */
    processMonthly: trpc_1.createFeatureRestrictedProcedure("payroll:create")
        .input(zod_1.z.object({
        year: zod_1.z.number().optional(),
        month: zod_1.z.number().min(1).max(12).optional()
    }).optional())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, payrollJobs_1.processMonthlyPayroll(input === null || input === void 0 ? void 0 : input.year, input === null || input === void 0 ? void 0 : input.month, ctx.user.id)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    /** Manually trigger payslip dispatch (admin/HR only) */
    dispatchPayslips: trpc_1.createFeatureRestrictedProcedure("payroll:create")
        .input(zod_1.z.object({
        year: zod_1.z.number().optional(),
        month: zod_1.z.number().min(1).max(12).optional()
    }).optional())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, payrollJobs_1.dispatchPayslips(input === null || input === void 0 ? void 0 : input.year, input === null || input === void 0 ? void 0 : input.month)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    })
});
