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
exports.payslipRouter = void 0;
/**
 * Payslip Generation Router
 * Generate, view, and send employee payslips
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var server_1 = require("@trpc/server");
function pool() {
    var p = db_1.getPool();
    if (!p)
        throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
    return p;
}
var payrollView = enhancedRbac_1.createFeatureRestrictedProcedure("payroll:view");
var payrollWrite = enhancedRbac_1.createFeatureRestrictedProcedure("payroll:edit");
exports.payslipRouter = trpc_1.router({
    // ── STAFF: List own payslips ──────────────────────────────────────────────
    listMine: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number()["default"](12),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, empRows, emp, rows, countRows, error_1;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        p = pool();
                        if (!((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id))
                            throw new server_1.TRPCError({ code: "UNAUTHORIZED" });
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, p.query("SELECT id, organizationId FROM employees WHERE userId = ? LIMIT 1", [ctx.user.id])];
                    case 2:
                        empRows = (_f.sent())[0];
                        emp = (_c = empRows) === null || _c === void 0 ? void 0 : _c[0];
                        if (!emp) {
                            return [2 /*return*/, { payslips: [], total: 0, message: "No employee record found for this user" }];
                        }
                        return [4 /*yield*/, p.query("SELECT id, payPeriod, payPeriodEnd as payDate, basicSalary, grossSalary as grossPay, totalDeductions, netSalary as netPay, status, createdAt, updatedAt\n           FROM payslips \n           WHERE employeeId = ? \n           ORDER BY payPeriod DESC \n           LIMIT ? OFFSET ?", [emp.id, input.limit, input.offset])];
                    case 3:
                        rows = (_f.sent())[0];
                        return [4 /*yield*/, p.query("SELECT COUNT(*) as total FROM payslips WHERE employeeId = ?", [emp.id])];
                    case 4:
                        countRows = (_f.sent())[0];
                        return [2 /*return*/, {
                                payslips: (rows || []).map(function (p) { return (__assign(__assign({}, p), { basicSalary: p.basicSalary / 100, grossPay: p.grossPay / 100, totalDeductions: p.totalDeductions / 100, netPay: p.netPay / 100 })); }),
                                total: ((_e = (_d = countRows) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.total) || 0
                            }];
                    case 5:
                        error_1 = _f.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch payslips: " + (error_1 === null || error_1 === void 0 ? void 0 : error_1.message)
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // ── STAFF: Get payslip details ────────────────────────────────────────────
    getOneForStaff: trpc_1.protectedProcedure
        .input(zod_1.z.object({ payslipId: zod_1.z.string() }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, empRows, emp, rows, payslip, error_2;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        p = pool();
                        if (!((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id))
                            throw new server_1.TRPCError({ code: "UNAUTHORIZED" });
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, p.query("SELECT id, firstName, lastName, email, department, position FROM employees WHERE userId = ? LIMIT 1", [ctx.user.id])];
                    case 2:
                        empRows = (_e.sent())[0];
                        emp = (_c = empRows) === null || _c === void 0 ? void 0 : _c[0];
                        if (!emp)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
                        return [4 /*yield*/, p.query("SELECT * FROM payslips WHERE id = ? AND employeeId = ? LIMIT 1", [input.payslipId, emp.id])];
                    case 3:
                        rows = (_e.sent())[0];
                        payslip = (_d = rows) === null || _d === void 0 ? void 0 : _d[0];
                        if (!payslip) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Payslip not found" });
                        }
                        return [2 /*return*/, __assign(__assign({}, payslip), { basicSalary: payslip.basicSalary / 100, grossPay: payslip.grossSalary / 100, totalDeductions: payslip.totalDeductions / 100, netPay: payslip.netSalary / 100, employee: {
                                    name: emp.firstName + " " + emp.lastName,
                                    email: emp.email,
                                    department: emp.department,
                                    position: emp.position
                                }, allowancesBreakdown: payslip.allowancesBreakdown ? JSON.parse(payslip.allowancesBreakdown) : [], deductionsBreakdown: payslip.deductionsBreakdown ? JSON.parse(payslip.deductionsBreakdown) : [] })];
                    case 4:
                        error_2 = _e.sent();
                        if (error_2.code && error_2.code.startsWith("NOT_FOUND"))
                            throw error_2;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch payslip: " + (error_2 === null || error_2 === void 0 ? void 0 : error_2.message)
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // ── STAFF: Download payslip PDF ────────────────────────────────────────────
    downloadPayslip: trpc_1.protectedProcedure
        .input(zod_1.z.object({ payslipId: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, empRows, emp, rows, payslip, error_3;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        p = pool();
                        if (!((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id))
                            throw new server_1.TRPCError({ code: "UNAUTHORIZED" });
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, p.query("SELECT id, firstName, lastName, email, employeeNumber FROM employees WHERE userId = ? LIMIT 1", [ctx.user.id])];
                    case 2:
                        empRows = (_e.sent())[0];
                        emp = (_c = empRows) === null || _c === void 0 ? void 0 : _c[0];
                        if (!emp)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
                        return [4 /*yield*/, p.query("SELECT * FROM payslips WHERE id = ? AND employeeId = ? LIMIT 1", [input.payslipId, emp.id])];
                    case 3:
                        rows = (_e.sent())[0];
                        payslip = (_d = rows) === null || _d === void 0 ? void 0 : _d[0];
                        if (!payslip)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Payslip not found" });
                        // Return HTML content for client-side PDF generation or direct HTML view
                        return [2 /*return*/, {
                                htmlContent: payslip.htmlContent,
                                fileName: "Payslip_" + emp.employeeNumber + "_" + payslip.payPeriod + ".pdf",
                                payPeriod: payslip.payPeriod
                            }];
                    case 4:
                        error_3 = _e.sent();
                        if (error_3.code && error_3.code.startsWith("NOT_FOUND"))
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to download payslip: " + (error_3 === null || error_3 === void 0 ? void 0 : error_3.message)
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // ── STAFF: Get payslip statistics ─────────────────────────────────────────
    getMyStats: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, empRows, emp, countRows, recentRows, count, error_4;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        p = pool();
                        if (!((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id))
                            throw new server_1.TRPCError({ code: "UNAUTHORIZED" });
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, p.query("SELECT id FROM employees WHERE userId = ? LIMIT 1", [ctx.user.id])];
                    case 2:
                        empRows = (_e.sent())[0];
                        emp = (_c = empRows) === null || _c === void 0 ? void 0 : _c[0];
                        if (!emp)
                            return [2 /*return*/, { totalPayslips: 0, recentPayslips: [] }];
                        return [4 /*yield*/, p.query("SELECT COUNT(*) as total, SUM(netSalary) as totalEarned FROM payslips WHERE employeeId = ?", [emp.id])];
                    case 3:
                        countRows = (_e.sent())[0];
                        return [4 /*yield*/, p.query("SELECT id, payPeriod, payPeriodEnd as payDate, basicSalary, grossSalary as grossPay, netSalary as netPay, status \n           FROM payslips WHERE employeeId = ? \n           ORDER BY payPeriod DESC LIMIT 6", [emp.id])];
                    case 4:
                        recentRows = (_e.sent())[0];
                        count = (_d = countRows) === null || _d === void 0 ? void 0 : _d[0];
                        return [2 /*return*/, {
                                totalPayslips: (count === null || count === void 0 ? void 0 : count.total) || 0,
                                totalEarned: ((count === null || count === void 0 ? void 0 : count.totalEarned) || 0) / 100,
                                recentPayslips: (recentRows || []).map(function (p) { return (__assign(__assign({}, p), { basicSalary: p.basicSalary / 100, grossPay: p.grossPay / 100, netPay: p.netPay / 100 })); })
                            }];
                    case 5:
                        error_4 = _e.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch stats: " + (error_4 === null || error_4 === void 0 ? void 0 : error_4.message)
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    listAll: payrollView
        .input(zod_1.z.object({
        employeeId: zod_1.z.string().optional(),
        payPeriod: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "generated", "sent", "viewed"]).optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, query, params, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        query = "SELECT p.*, e.firstName, e.lastName, e.employeeNumber, e.department, e.position\n        FROM payslips p\n        LEFT JOIN employees e ON p.employeeId = e.id\n        WHERE (p.organizationId = ? OR p.organizationId IS NULL)";
                        params = [orgId];
                        if (input === null || input === void 0 ? void 0 : input.employeeId) {
                            query += " AND p.employeeId = ?";
                            params.push(input.employeeId);
                        }
                        if (input === null || input === void 0 ? void 0 : input.payPeriod) {
                            query += " AND p.payPeriod = ?";
                            params.push(input.payPeriod);
                        }
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            query += " AND p.status = ?";
                            params.push(input.status);
                        }
                        query += " ORDER BY p.payPeriodEnd DESC LIMIT ? OFFSET ?";
                        params.push((input === null || input === void 0 ? void 0 : input.limit) || 50, (input === null || input === void 0 ? void 0 : input.offset) || 0);
                        return [4 /*yield*/, p.query(query, params)];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows || []];
                }
            });
        });
    }),
    getById: payrollView
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        return [4 /*yield*/, p.query("SELECT p.*, e.firstName, e.lastName, e.employeeNumber, e.department, e.position,\n                e.bankName, e.bankBranch, e.bankAccountNumber, e.nhifNumber, e.nssfNumber, e.taxId\n         FROM payslips p\n         LEFT JOIN employees e ON p.employeeId = e.id\n         WHERE p.id = ?", [input.id])];
                    case 1:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, (rows === null || rows === void 0 ? void 0 : rows[0]) || null];
                }
            });
        });
    }),
    // Generate payslips for a payroll period
    generate: payrollWrite
        .input(zod_1.z.object({
        payPeriod: zod_1.z.string(),
        payDate: zod_1.z.string(),
        employeeIds: zod_1.z.array(zod_1.z.string()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, empQuery, empParams, employees, generated, errors, _i, _b, emp, existing, basicSalary, allowances, totalAllowances, allowancesBreakdown, _c, _d, a, amount, deductions, customDeductions, deductionsBreakdown, _e, _f, d, amount, grossPay, nssf, nhif, housingLevy, taxableIncome, paye, totalDeductions, netPay, id, err_1;
            var _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        empQuery = "SELECT * FROM employees WHERE status = 'active'";
                        empParams = [];
                        if (orgId) {
                            empQuery += " AND organizationId = ?";
                            empParams.push(orgId);
                        }
                        if ((_g = input.employeeIds) === null || _g === void 0 ? void 0 : _g.length) {
                            empQuery += " AND id IN (" + input.employeeIds.map(function () { return "?"; }).join(",") + ")";
                            empParams.push.apply(empParams, input.employeeIds);
                        }
                        return [4 /*yield*/, p.query(empQuery, empParams)];
                    case 1:
                        employees = (_h.sent())[0];
                        generated = [];
                        errors = [];
                        _i = 0, _b = (employees || []);
                        _h.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 10];
                        emp = _b[_i];
                        _h.label = 3;
                    case 3:
                        _h.trys.push([3, 8, , 9]);
                        return [4 /*yield*/, p.query("SELECT id FROM payslips WHERE employeeId = ? AND payPeriod = ?", [emp.id, input.payPeriod])];
                    case 4:
                        existing = (_h.sent())[0];
                        if ((existing === null || existing === void 0 ? void 0 : existing.length) > 0) {
                            errors.push("Payslip already exists for " + emp.firstName + " " + emp.lastName);
                            return [3 /*break*/, 9];
                        }
                        basicSalary = emp.salary || 0;
                        return [4 /*yield*/, p.query("SELECT * FROM salaryAllowances WHERE employeeId = ? AND isActive = 1", [emp.id])];
                    case 5:
                        allowances = (_h.sent())[0];
                        totalAllowances = 0;
                        allowancesBreakdown = [];
                        for (_c = 0, _d = (allowances || []); _c < _d.length; _c++) {
                            a = _d[_c];
                            amount = a.amount || 0;
                            totalAllowances += amount;
                            allowancesBreakdown.push({ name: a.allowanceName || a.type, amount: amount });
                        }
                        return [4 /*yield*/, p.query("SELECT * FROM salaryDeductions WHERE employeeId = ? AND isActive = 1", [emp.id])];
                    case 6:
                        deductions = (_h.sent())[0];
                        customDeductions = 0;
                        deductionsBreakdown = [];
                        for (_e = 0, _f = (deductions || []); _e < _f.length; _e++) {
                            d = _f[_e];
                            amount = d.amount || 0;
                            customDeductions += amount;
                            deductionsBreakdown.push({ name: d.deductionName || d.type, amount: amount });
                        }
                        grossPay = basicSalary + totalAllowances;
                        nssf = Math.min(grossPay * 0.06, 1080);
                        nhif = Math.min(grossPay * 0.025, 15000);
                        housingLevy = Math.min(grossPay * 0.015, 15000);
                        taxableIncome = grossPay - nssf;
                        paye = 0;
                        if (taxableIncome > 32333)
                            paye += (Math.min(taxableIncome, 57333) - 32333) * 0.25;
                        if (taxableIncome > 57333)
                            paye += (taxableIncome - 57333) * 0.30;
                        if (taxableIncome <= 32333)
                            paye += taxableIncome * 0.10;
                        else
                            paye += 32333 * 0.10;
                        paye = Math.max(0, paye - 2400); // Personal relief
                        deductionsBreakdown.push({ name: "PAYE", amount: Math.round(paye) });
                        deductionsBreakdown.push({ name: "NSSF", amount: Math.round(nssf) });
                        deductionsBreakdown.push({ name: "NHIF/SHIF", amount: Math.round(nhif) });
                        deductionsBreakdown.push({ name: "Housing Levy", amount: Math.round(housingLevy) });
                        totalDeductions = Math.round(paye + nssf + nhif + housingLevy + customDeductions);
                        netPay = grossPay - totalDeductions;
                        id = uuid_1.v4();
                        return [4 /*yield*/, p.query("INSERT INTO payslips (id, organizationId, employeeId, payPeriod, payDate, basicSalary, grossPay, totalAllowances, totalDeductions, netPay, paye, nhif, nssf, housingLevy, allowancesBreakdown, deductionsBreakdown, status, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated', ?)", [id, orgId, emp.id, input.payPeriod, input.payDate, basicSalary, grossPay, totalAllowances, totalDeductions, netPay, Math.round(paye), Math.round(nhif), Math.round(nssf), Math.round(housingLevy), JSON.stringify(allowancesBreakdown), JSON.stringify(deductionsBreakdown), ctx.user.id])];
                    case 7:
                        _h.sent();
                        generated.push(id);
                        return [3 /*break*/, 9];
                    case 8:
                        err_1 = _h.sent();
                        errors.push("Error for " + emp.firstName + " " + emp.lastName + ": " + err_1.message);
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 2];
                    case 10: return [2 /*return*/, { generated: generated.length, errors: errors, payslipIds: generated }];
                }
            });
        });
    }),
    // Send payslips to employees via email
    sendPayslips: payrollWrite
        .input(zod_1.z.object({
        payslipIds: zod_1.z.array(zod_1.z.string())
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, sent, errors, _i, _b, payslipId, rows, payslip, sendEmail, allowances, deductions, err_2;
            var _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        p = pool();
                        sent = 0;
                        errors = [];
                        _i = 0, _b = input.payslipIds;
                        _f.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 9];
                        payslipId = _b[_i];
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, p.query("SELECT p.*, e.email, e.firstName, e.lastName FROM payslips p LEFT JOIN employees e ON p.employeeId = e.id WHERE p.id = ?", [payslipId])];
                    case 3:
                        rows = (_f.sent())[0];
                        payslip = rows === null || rows === void 0 ? void 0 : rows[0];
                        if (!(payslip === null || payslip === void 0 ? void 0 : payslip.email)) {
                            errors.push("No email for payslip " + payslipId);
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../_core/mail"); })];
                    case 4:
                        sendEmail = (_f.sent()).sendEmail;
                        allowances = JSON.parse(payslip.allowancesBreakdown || "[]");
                        deductions = JSON.parse(payslip.deductionsBreakdown || "[]");
                        return [4 /*yield*/, sendEmail({
                                to: payslip.email,
                                subject: "Payslip - " + payslip.payPeriod,
                                html: "\n              <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n                <div style=\"background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 20px; border-radius: 8px 8px 0 0; color: white;\">\n                  <h2 style=\"margin: 0;\">Payslip - " + payslip.payPeriod + "</h2>\n                  <p style=\"margin: 5px 0 0;\">" + payslip.firstName + " " + payslip.lastName + "</p>\n                </div>\n                <div style=\"background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;\">\n                  <table style=\"width: 100%; border-collapse: collapse;\">\n                    <tr><td style=\"padding: 8px; border-bottom: 1px solid #e5e7eb;\"><strong>Basic Salary</strong></td><td style=\"text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb;\">KES " + ((_c = payslip.basicSalary) === null || _c === void 0 ? void 0 : _c.toLocaleString()) + "</td></tr>\n                    " + allowances.map(function (a) { var _a; return "<tr><td style=\"padding: 8px; border-bottom: 1px solid #e5e7eb; color: #059669;\">" + a.name + "</td><td style=\"text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb; color: #059669;\">+ KES " + ((_a = a.amount) === null || _a === void 0 ? void 0 : _a.toLocaleString()) + "</td></tr>"; }).join("") + "\n                    <tr style=\"background: #dcfce7;\"><td style=\"padding: 8px; border-bottom: 2px solid #e5e7eb;\"><strong>Gross Pay</strong></td><td style=\"text-align: right; padding: 8px; border-bottom: 2px solid #e5e7eb;\"><strong>KES " + ((_d = payslip.grossPay) === null || _d === void 0 ? void 0 : _d.toLocaleString()) + "</strong></td></tr>\n                    " + deductions.map(function (d) { var _a; return "<tr><td style=\"padding: 8px; border-bottom: 1px solid #e5e7eb; color: #dc2626;\">" + d.name + "</td><td style=\"text-align: right; padding: 8px; border-bottom: 1px solid #e5e7eb; color: #dc2626;\">- KES " + ((_a = d.amount) === null || _a === void 0 ? void 0 : _a.toLocaleString()) + "</td></tr>"; }).join("") + "\n                    <tr style=\"background: #dbeafe;\"><td style=\"padding: 12px; font-size: 16px;\"><strong>Net Pay</strong></td><td style=\"text-align: right; padding: 12px; font-size: 16px;\"><strong>KES " + ((_e = payslip.netPay) === null || _e === void 0 ? void 0 : _e.toLocaleString()) + "</strong></td></tr>\n                  </table>\n                </div>\n                <div style=\"background: #f3f4f6; padding: 10px; border-radius: 0 0 8px 8px; text-align: center; color: #6b7280; font-size: 12px;\">\n                  Pay Date: " + payslip.payDate + " | This is a system-generated payslip.\n                </div>\n              </div>\n            "
                            })];
                    case 5:
                        _f.sent();
                        return [4 /*yield*/, p.query("UPDATE payslips SET status = 'sent', sentAt = NOW() WHERE id = ?", [payslipId])];
                    case 6:
                        _f.sent();
                        sent++;
                        return [3 /*break*/, 8];
                    case 7:
                        err_2 = _f.sent();
                        errors.push("Failed to send " + payslipId + ": " + err_2.message);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/, { sent: sent, errors: errors, total: input.payslipIds.length }];
                }
            });
        });
    }),
    // Delete a payslip
    "delete": payrollWrite
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p = pool();
                        return [4 /*yield*/, p.query("DELETE FROM payslips WHERE id = ?", [input.id])];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // Bulk generate for all active employees
    bulkGenerate: payrollWrite
        .input(zod_1.z.object({
        payPeriod: zod_1.z.string(),
        payDate: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, countRows;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, p.query("SELECT COUNT(*) as cnt FROM employees WHERE status = 'active' " + (orgId ? 'AND organizationId = ?' : ''), orgId ? [orgId] : [])];
                    case 1:
                        countRows = (_c.sent())[0];
                        return [2 /*return*/, { employeeCount: ((_b = countRows === null || countRows === void 0 ? void 0 : countRows[0]) === null || _b === void 0 ? void 0 : _b.cnt) || 0, message: "Use generate endpoint with no employeeIds to process all" }];
                }
            });
        });
    }),
    // ── STAFF: Add or update notes on payslip ──────────────────────────────
    addNote: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        payslipId: zod_1.z.string(),
        note: zod_1.z.string().max(500)
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, rows, error_5;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        p = pool();
                        if (!((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id))
                            throw new server_1.TRPCError({ code: "UNAUTHORIZED" });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, p.query("SELECT p.id FROM payslips p\n           INNER JOIN employees e ON p.employeeId = e.id\n           WHERE p.id = ? AND e.userId = ? LIMIT 1", [input.payslipId, ctx.user.id])];
                    case 2:
                        rows = (_c.sent())[0];
                        if (!rows || rows.length === 0) {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "You don't have access to this payslip" });
                        }
                        // Update notes
                        return [4 /*yield*/, p.query("UPDATE payslips SET employeeNotes = ?, updatedAt = NOW() WHERE id = ?", [input.note, input.payslipId])];
                    case 3:
                        // Update notes
                        _c.sent();
                        return [2 /*return*/, { success: true, message: "Note added to payslip" }];
                    case 4:
                        error_5 = _c.sent();
                        if (error_5.code)
                            throw error_5;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to add note: " + (error_5 === null || error_5 === void 0 ? void 0 : error_5.message)
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // ── HR: Export payslip as PDF ──────────────────────────────────────────
    exportAsPDF: payrollView
        .input(zod_1.z.object({ payslipId: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, rows, payslip, error_6;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, p.query("SELECT p.*, e.firstName, e.lastName, e.email FROM payslips p\n           LEFT JOIN employees e ON p.employeeId = e.id\n           WHERE p.id = ? AND p.organizationId = ? LIMIT 1", [input.payslipId, orgId])];
                    case 2:
                        rows = (_c.sent())[0];
                        payslip = (_b = rows) === null || _b === void 0 ? void 0 : _b[0];
                        if (!payslip)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Payslip not found" });
                        // Return HTML content that client can convert to PDF using html2pdf or similar
                        // The actual PDF conversion happens on the client side with a library like html2pdf
                        return [2 /*return*/, {
                                htmlContent: payslip.htmlContent,
                                fileName: "Payslip_" + payslip.firstName + "_" + payslip.lastName + "_" + payslip.payPeriod + ".pdf",
                                employeeName: payslip.firstName + " " + payslip.lastName,
                                payPeriod: payslip.payPeriod
                            }];
                    case 3:
                        error_6 = _c.sent();
                        if (error_6.code === "NOT_FOUND")
                            throw error_6;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to export payslip: " + (error_6 === null || error_6 === void 0 ? void 0 : error_6.message)
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // ── STAFF: Request reprint of previous payslip ──────────────────────────
    requestReprint: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        payslipId: zod_1.z.string(),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, rows, payslip, createNotification, error_7;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        p = pool();
                        if (!((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id))
                            throw new server_1.TRPCError({ code: "UNAUTHORIZED" });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, p.query("SELECT p.id, p.payPeriod FROM payslips p\n           INNER JOIN employees e ON p.employeeId = e.id\n           WHERE p.id = ? AND e.userId = ? LIMIT 1", [input.payslipId, ctx.user.id])];
                    case 2:
                        rows = (_c.sent())[0];
                        if (!rows || rows.length === 0) {
                            throw new server_1.TRPCError({ code: "FORBIDDEN", message: "You don't have access to this payslip" });
                        }
                        payslip = rows[0];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../utils/notification"); })];
                    case 3:
                        createNotification = (_c.sent()).createNotification;
                        return [4 /*yield*/, createNotification({
                                userId: ctx.user.id,
                                title: "Payslip Reprint Requested",
                                message: "Reprint requested for payslip " + payslip.payPeriod + ". " + (input.reason ? "Reason: " + input.reason : ""),
                                type: "request",
                                organizationId: ctx.user.organizationId
                            })];
                    case 4:
                        _c.sent();
                        console.log("[PAYSLIPS] Reprint requested for payslip " + input.payslipId + " by employee " + ctx.user.id);
                        return [2 /*return*/, {
                                success: true,
                                message: "Reprint request submitted. HR will contact you soon."
                            }];
                    case 5:
                        error_7 = _c.sent();
                        if (error_7.code)
                            throw error_7;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to request reprint: " + (error_7 === null || error_7 === void 0 ? void 0 : error_7.message)
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // ── HR: Get payslip reprint requests ───────────────────────────────────
    getReprintRequests: payrollView.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId;
            return __generator(this, function (_b) {
                p = pool();
                orgId = ctx.user.organizationId;
                try {
                    // This would require a separate reprintRequests table to track
                    // For now, we'll return a placeholder
                    return [2 /*return*/, {
                            requests: [],
                            message: "Reprint requests are tracked via notifications system"
                        }];
                }
                catch (error) {
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch requests: " + (error === null || error === void 0 ? void 0 : error.message)
                    });
                }
                return [2 /*return*/];
            });
        });
    })
});
