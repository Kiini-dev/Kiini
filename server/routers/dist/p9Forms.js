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
exports.p9FormRouter = void 0;
/**
 * P9 Forms Router
 * Generate, view, and send annual tax forms
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var server_1 = require("@trpc/server");
var p9_forms_1 = require("../utils/p9-forms");
var emailQueue_1 = require("../routers/emailQueue");
function pool() {
    var p = db_1.getPool();
    if (!p)
        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    return p;
}
var hrManage = enhancedRbac_1.createFeatureRestrictedProcedure("hr:manage");
var payrollView = enhancedRbac_1.createFeatureRestrictedProcedure("payroll:view");
exports.p9FormRouter = trpc_1.router({
    // ── HR: Generate P9 forms for all employees in a tax year ──────────────
    generateForTaxYear: hrManage
        .input(zod_1.z.object({ taxYear: zod_1.z.number().min(2000).max(2100) }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, empRows, employees, generated, errors, _i, _b, emp, result, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, p.query("SELECT id FROM employees WHERE organizationId = ? AND status = 'active'", [orgId])];
                    case 2:
                        empRows = (_c.sent())[0];
                        employees = empRows || [];
                        generated = 0;
                        errors = [];
                        _i = 0, _b = employees;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 6];
                        emp = _b[_i];
                        return [4 /*yield*/, p9_forms_1.generateP9Form({
                                employeeId: emp.id,
                                organizationId: orgId,
                                taxYear: input.taxYear
                            }, ctx.user.id)];
                    case 4:
                        result = _c.sent();
                        if (result) {
                            generated++;
                        }
                        else {
                            errors.push("Failed to generate P9 for employee " + emp.id);
                        }
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        console.log("[P9-ROUTER] Generated " + generated + " P9 forms for " + input.taxYear + ", errors: " + errors.length);
                        return [2 /*return*/, {
                                generated: generated,
                                total: employees.length,
                                errors: errors,
                                message: "Generated " + generated + " of " + employees.length + " P9 forms"
                            }];
                    case 7:
                        error_1 = _c.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to generate P9 forms: " + (error_1 === null || error_1 === void 0 ? void 0 : error_1.message)
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    // ── HR: List P9 forms ─────────────────────────────────────────────────
    list: payrollView
        .input(zod_1.z.object({
        taxYear: zod_1.z.number().optional(),
        employeeId: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["draft", "generated", "sent", "received"]).optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, query, params, rows, countQuery, countParams, countRows, total, error_2;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        query = "\n          SELECT p.*, e.firstName, e.lastName, e.email, e.employeeNumber\n          FROM p9_forms p\n          LEFT JOIN employees e ON p.employeeId = e.id\n          WHERE p.organizationId = ?\n        ";
                        params = [orgId];
                        if (input.taxYear) {
                            query += " AND p.taxYear = ?";
                            params.push(input.taxYear);
                        }
                        if (input.employeeId) {
                            query += " AND p.employeeId = ?";
                            params.push(input.employeeId);
                        }
                        if (input.status) {
                            query += " AND p.status = ?";
                            params.push(input.status);
                        }
                        query += " ORDER BY p.taxYear DESC, e.lastName ASC LIMIT ? OFFSET ?";
                        params.push(input.limit, input.offset);
                        return [4 /*yield*/, p.query(query, params)];
                    case 2:
                        rows = (_d.sent())[0];
                        countQuery = "SELECT COUNT(*) as total FROM p9_forms WHERE organizationId = ?";
                        countParams = [orgId];
                        if (input.taxYear) {
                            countQuery += " AND taxYear = ?";
                            countParams.push(input.taxYear);
                        }
                        if (input.employeeId) {
                            countQuery += " AND employeeId = ?";
                            countParams.push(input.employeeId);
                        }
                        if (input.status) {
                            countQuery += " AND status = ?";
                            countParams.push(input.status);
                        }
                        return [4 /*yield*/, p.query(countQuery, countParams)];
                    case 3:
                        countRows = (_d.sent())[0];
                        total = ((_c = (_b = countRows) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.total) || 0;
                        return [2 /*return*/, {
                                p9Forms: (rows || []).map(function (p) { return (__assign(__assign({}, p), { grossIncome: p.grossIncome / 100, netTaxPayable: p.netTaxPayable / 100, paye: p.paye / 100, nssf: p.nssf / 100, shif: p.shif / 100, housingLevy: p.housingLevy / 100, totalDeductions: p.totalDeductions / 100 })); }),
                                total: total
                            }];
                    case 4:
                        error_2 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch P9 forms: " + (error_2 === null || error_2 === void 0 ? void 0 : error_2.message)
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // ── HR: Get specific P9 form ───────────────────────────────────────────
    getById: payrollView
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, rows, p9, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, p.query("SELECT p.*, e.firstName, e.lastName, e.email, e.department\n           FROM p9_forms p\n           LEFT JOIN employees e ON p.employeeId = e.id\n           WHERE p.id = ? AND p.organizationId = ? LIMIT 1", [input.id, orgId])];
                    case 2:
                        rows = (_c.sent())[0];
                        p9 = (_b = rows) === null || _b === void 0 ? void 0 : _b[0];
                        if (!p9)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "P9 form not found" });
                        return [2 /*return*/, __assign(__assign({}, p9), { grossIncome: p9.grossIncome / 100, netTaxPayable: p9.netTaxPayable / 100, paye: p9.paye / 100, nssf: p9.nssf / 100, shif: p9.shif / 100, housingLevy: p9.housingLevy / 100, totalDeductions: p9.totalDeductions / 100 })];
                    case 3:
                        error_3 = _c.sent();
                        if (error_3.code === "NOT_FOUND")
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch P9 form: " + (error_3 === null || error_3 === void 0 ? void 0 : error_3.message)
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // ── HR: Download P9 form ───────────────────────────────────────────────
    download: payrollView
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, rows, p9, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, p.query("SELECT p.*, e.firstName, e.lastName FROM p9_forms p\n           LEFT JOIN employees e ON p.employeeId = e.id\n           WHERE p.id = ? AND p.organizationId = ? LIMIT 1", [input.id, orgId])];
                    case 2:
                        rows = (_c.sent())[0];
                        p9 = (_b = rows) === null || _b === void 0 ? void 0 : _b[0];
                        if (!p9)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "P9 form not found" });
                        return [2 /*return*/, {
                                htmlContent: p9.htmlContent,
                                fileName: "P9_" + p9.taxYear + "_" + p9.firstName + "_" + p9.lastName + ".html",
                                taxYear: p9.taxYear
                            }];
                    case 3:
                        error_4 = _c.sent();
                        if (error_4.code === "NOT_FOUND")
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to download P9: " + (error_4 === null || error_4 === void 0 ? void 0 : error_4.message)
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    // ── HR: Send P9 form to employee via email ────────────────────────────
    sendToEmployee: hrManage
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, rows, p9, error_5;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, p.query("SELECT p.*, e.firstName, e.lastName, e.email\n           FROM p9_forms p\n           LEFT JOIN employees e ON p.employeeId = e.id\n           WHERE p.id = ? AND p.organizationId = ? LIMIT 1", [input.id, orgId])];
                    case 2:
                        rows = (_c.sent())[0];
                        p9 = (_b = rows) === null || _b === void 0 ? void 0 : _b[0];
                        if (!p9)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "P9 form not found" });
                        // Send email
                        return [4 /*yield*/, emailQueue_1.sendEmailImmediately({
                                to: p9.email,
                                subject: "Your P9 Tax Form for " + p9.taxYear,
                                htmlContent: "\n            <p>Dear " + p9.firstName + " " + p9.lastName + ",</p>\n            <p>Please find attached your annual P9 tax form for the year " + p9.taxYear + ".</p>\n            <p>This form is required for your personal tax filing with Kenya Revenue Authority.</p>\n            <p>Key Information:</p>\n            <ul>\n              <li>Total Gross Income: KES " + (p9.grossIncome / 100).toLocaleString("en-KE") + "</li>\n              <li>PAYE Tax Deducted: KES " + (p9.paye / 100).toLocaleString("en-KE") + "</li>\n              <li>NSSF Contributions: KES " + (p9.nssf / 100).toLocaleString("en-KE") + "</li>\n              <li>Housing Levy: KES " + (p9.housingLevy / 100).toLocaleString("en-KE") + "</li>\n            </ul>\n            <p>If you have any questions, please contact your HR department.</p>\n            <p>Best regards,<br/>HR Department</p>\n          ",
                                plainTextContent: "Your P9 tax form for " + p9.taxYear + " is ready. Please contact HR if you need assistance."
                            })];
                    case 3:
                        // Send email
                        _c.sent();
                        // Update status to sent
                        return [4 /*yield*/, p.query("UPDATE p9_forms SET status = 'sent', sentTo = ?, sentAt = NOW(), updatedAt = NOW()\n           WHERE id = ?", [p9.email, input.id])];
                    case 4:
                        // Update status to sent
                        _c.sent();
                        console.log("[P9-ROUTER] Sent P9 form to " + p9.email);
                        return [2 /*return*/, { success: true, message: "P9 form sent to " + p9.email }];
                    case 5:
                        error_5 = _c.sent();
                        if (error_5.code === "NOT_FOUND")
                            throw error_5;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to send P9 form: " + (error_5 === null || error_5 === void 0 ? void 0 : error_5.message)
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // ── Staff: View their own P9 forms ────────────────────────────────────
    viewMine: trpc_1.protectedProcedure
        .input(zod_1.z.object({ taxYear: zod_1.z.number().optional() }))
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, orgId, empRows, emp, query, params, rows, error_6;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        p = pool();
                        orgId = ctx.user.organizationId;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, p.query("SELECT id FROM employees WHERE userId = ? AND organizationId = ? LIMIT 1", [ctx.user.id, orgId])];
                    case 2:
                        empRows = (_d.sent())[0];
                        emp = (_b = empRows) === null || _b === void 0 ? void 0 : _b[0];
                        if (!emp)
                            return [2 /*return*/, { p9Forms: [] }];
                        query = "\n          SELECT * FROM p9_forms\n          WHERE employeeId = ? AND organizationId = ?\n        ";
                        params = [emp.id, orgId];
                        if ((_c = ctx.input) === null || _c === void 0 ? void 0 : _c.taxYear) {
                            query += " AND taxYear = ?";
                            params.push(ctx.input.taxYear);
                        }
                        query += " ORDER BY taxYear DESC";
                        return [4 /*yield*/, p.query(query, params)];
                    case 3:
                        rows = (_d.sent())[0];
                        return [2 /*return*/, {
                                p9Forms: (rows || []).map(function (p) { return (__assign(__assign({}, p), { grossIncome: p.grossIncome / 100, netTaxPayable: p.netTaxPayable / 100, paye: p.paye / 100, nssf: p.nssf / 100, shif: p.shif / 100, housingLevy: p.housingLevy / 100 })); })
                            }];
                    case 4:
                        error_6 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch your P9 forms: " + (error_6 === null || error_6 === void 0 ? void 0 : error_6.message)
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
