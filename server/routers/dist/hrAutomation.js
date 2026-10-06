"use strict";
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
exports.hrAutomationRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../_core/trpc");
var trpc_2 = require("../_core/trpc");
var db_1 = require("../db");
var server_1 = require("@trpc/server");
var checkModuleAccess_1 = require("../modules/checkModuleAccess");
var hrAutomationModule = require("../modules/hrAutomation");
var hrViewProcedure = trpc_2.createFeatureRestrictedProcedure("hr:view");
var hrEditProcedure = trpc_2.createFeatureRestrictedProcedure("hr:edit");
function pool() {
    var p = db_1.getPool();
    if (!p)
        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    return p;
}
exports.hrAutomationRouter = trpc_1.router({
    // ── Automation Dashboard Stats ─────────────────────────────────
    getStats: hrViewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, expiringContracts, pendingAccrual, pendingPayroll, automationRules;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _f.sent();
                        p = pool();
                        return [4 /*yield*/, p.query("SELECT COUNT(*) as count FROM employee_contracts\n       WHERE status = 'active' AND end_date IS NOT NULL\n       AND end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)")];
                    case 2:
                        expiringContracts = (_f.sent())[0];
                        return [4 /*yield*/, p.query("SELECT COUNT(DISTINCT employee_id) as count FROM leave_balances\n       WHERE YEAR(created_at) = YEAR(CURDATE())")];
                    case 3:
                        pendingAccrual = (_f.sent())[0];
                        return [4 /*yield*/, p.query("SELECT COUNT(*) as count FROM payroll WHERE status = 'draft'")];
                    case 4:
                        pendingPayroll = (_f.sent())[0];
                        return [4 /*yield*/, p.query("SELECT COUNT(*) as count FROM hr_automation_rules WHERE is_active = 1")];
                    case 5:
                        automationRules = (_f.sent())[0];
                        return [2 /*return*/, {
                                expiringContracts: ((_b = expiringContracts[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
                                pendingAccrual: ((_c = pendingAccrual[0]) === null || _c === void 0 ? void 0 : _c.count) || 0,
                                pendingPayroll: ((_d = pendingPayroll[0]) === null || _d === void 0 ? void 0 : _d.count) || 0,
                                activeRules: ((_e = automationRules[0]) === null || _e === void 0 ? void 0 : _e.count) || 0
                            }];
                }
            });
        });
    }),
    // ── Contract Expiry Alerts ─────────────────────────────────────
    getExpiringContracts: hrViewProcedure
        .input(zod_1.z.object({ days: zod_1.z.number()["default"](30) }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _b.sent();
                        p = pool();
                        return [4 /*yield*/, p.query("SELECT ec.*, e.first_name, e.last_name, e.email, e.department\n         FROM employee_contracts ec\n         LEFT JOIN employees e ON ec.employee_id = e.id\n         WHERE ec.status = 'active' AND ec.end_date IS NOT NULL\n         AND ec.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)\n         ORDER BY ec.end_date ASC", [input.days])];
                    case 2:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    }),
    // ── Leave Accrual ──────────────────────────────────────────────
    runLeaveAccrual: hrEditProcedure
        .input(zod_1.z.object({
        leaveType: zod_1.z.string()["default"]("annual"),
        accrualDays: zod_1.z.number()["default"](1.75),
        year: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, year, month, employees, accrued, _i, _b, emp, existing, balRow, bal, id;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _c.sent();
                        p = pool();
                        year = input.year || new Date().getFullYear();
                        month = new Date().getMonth() + 1;
                        return [4 /*yield*/, p.query("SELECT id, first_name, last_name FROM employees WHERE status = 'active'")];
                    case 2:
                        employees = (_c.sent())[0];
                        accrued = 0;
                        _i = 0, _b = employees;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 11];
                        emp = _b[_i];
                        return [4 /*yield*/, p.query("SELECT id FROM leave_balances\n           WHERE employee_id = ? AND leave_type = ? AND YEAR(created_at) = ?\n           AND MONTH(created_at) = ?", [emp.id, input.leaveType, year, month])];
                    case 4:
                        existing = (_c.sent())[0];
                        if (!(existing.length === 0)) return [3 /*break*/, 10];
                        return [4 /*yield*/, p.query("SELECT id, total_days, used_days FROM leave_balances\n             WHERE employee_id = ? AND leave_type = ? AND YEAR(created_at) = YEAR(CURDATE())", [emp.id, input.leaveType])];
                    case 5:
                        balRow = (_c.sent())[0];
                        if (!(balRow.length > 0)) return [3 /*break*/, 7];
                        bal = balRow[0];
                        return [4 /*yield*/, p.query("UPDATE leave_balances SET total_days = total_days + ? WHERE id = ?", [input.accrualDays, bal.id])];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        id = "lb_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
                        return [4 /*yield*/, p.query("INSERT INTO leave_balances (id, employee_id, leave_type, total_days, used_days, year, created_at)\n               VALUES (?, ?, ?, ?, 0, ?, NOW())", [id, emp.id, input.leaveType, input.accrualDays, year])];
                    case 8:
                        _c.sent();
                        _c.label = 9;
                    case 9:
                        accrued++;
                        _c.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 3];
                    case 11: return [2 /*return*/, { success: true, accrued: accrued, message: "Leave accrual completed for " + accrued + " employees" }];
                }
            });
        });
    }),
    // ── Auto Payroll Generation ────────────────────────────────────
    generatePayroll: hrEditProcedure
        .input(zod_1.z.object({
        month: zod_1.z.number().min(1).max(12),
        year: zod_1.z.number()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, period, existing, employees, generated, _i, _b, emp, basic, nhif, nssf, housingLevy, taxableIncome, paye, totalDeductions, netPay, payrollId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _c.sent();
                        p = pool();
                        period = input.year + "-" + String(input.month).padStart(2, "0");
                        return [4 /*yield*/, p.query("SELECT id FROM payroll WHERE pay_period = ? LIMIT 1", [period])];
                    case 2:
                        existing = (_c.sent())[0];
                        if (existing.length > 0) {
                            throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Payroll for " + period + " already exists" });
                        }
                        return [4 /*yield*/, p.query("SELECT e.id, e.first_name, e.last_name, e.email, e.department,\n                COALESCE(e.basic_salary, 0) as basic_salary\n         FROM employees e\n         WHERE e.status = 'active' AND e.basic_salary > 0")];
                    case 3:
                        employees = (_c.sent())[0];
                        generated = 0;
                        _i = 0, _b = employees;
                        _c.label = 4;
                    case 4:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        emp = _b[_i];
                        basic = parseFloat(emp.basic_salary) || 0;
                        if (basic <= 0)
                            return [3 /*break*/, 6];
                        nhif = basic <= 5999 ? 150 : basic <= 7999 ? 300 : basic <= 11999 ? 400 : basic <= 14999 ? 500 : basic <= 19999 ? 600 : basic <= 24999 ? 750 : basic <= 29999 ? 850 : basic <= 34999 ? 900 : basic <= 39999 ? 950 : basic <= 44999 ? 1000 : basic <= 49999 ? 1100 : basic <= 59999 ? 1200 : basic <= 69999 ? 1300 : basic <= 79999 ? 1400 : basic <= 89999 ? 1500 : basic <= 99999 ? 1600 : 1700;
                        nssf = Math.min(basic * 0.06, 1080);
                        housingLevy = basic * 0.015;
                        taxableIncome = basic - nssf;
                        paye = 0;
                        if (taxableIncome > 0) {
                            if (taxableIncome <= 24000)
                                paye = taxableIncome * 0.10;
                            else if (taxableIncome <= 32333)
                                paye = 2400 + (taxableIncome - 24000) * 0.25;
                            else
                                paye = 2400 + 2083.25 + (taxableIncome - 32333) * 0.30;
                            paye = Math.max(0, paye - 2400); // Personal relief
                        }
                        totalDeductions = nhif + nssf + housingLevy + paye;
                        netPay = basic - totalDeductions;
                        payrollId = "pay_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
                        return [4 /*yield*/, p.query("INSERT INTO payroll (id, employee_id, pay_period, basic_salary, gross_salary, nhif, nssf, paye, housing_levy, total_deductions, net_salary, status, created_at)\n           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW())", [payrollId, emp.id, period, basic, basic, nhif, nssf, paye, housingLevy, totalDeductions, netPay])];
                    case 5:
                        _c.sent();
                        generated++;
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, { success: true, generated: generated, message: "Generated payroll for " + generated + " employees for " + period }];
                }
            });
        });
    }),
    // ── Automation Rules CRUD ──────────────────────────────────────
    getRules: hrViewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _b.sent();
                        p = pool();
                        return [4 /*yield*/, p.query("SELECT * FROM hr_automation_rules ORDER BY created_at DESC")];
                    case 2:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    }),
    createRule: hrEditProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().max(200),
        type: zod_1.z["enum"](["leave_accrual", "contract_alert", "payroll_generation", "probation_alert", "birthday_reminder"]),
        schedule: zod_1.z.string().max(100)["default"]("monthly"),
        config: zod_1.z.string().max(2000)["default"]("{}"),
        isActive: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _b.sent();
                        p = pool();
                        id = "rule_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
                        return [4 /*yield*/, p.query("INSERT INTO hr_automation_rules (id, name, type, schedule, config, is_active, created_at)\n         VALUES (?, ?, ?, ?, ?, ?, NOW())", [id, input.name, input.type, input.schedule, input.config, input.isActive ? 1 : 0])];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, id: id }];
                }
            });
        });
    }),
    updateRule: hrEditProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().max(200).optional(),
        schedule: zod_1.z.string().max(100).optional(),
        config: zod_1.z.string().max(2000).optional(),
        isActive: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, sets, vals;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _b.sent();
                        p = pool();
                        sets = [];
                        vals = [];
                        if (input.name !== undefined) {
                            sets.push("name = ?");
                            vals.push(input.name);
                        }
                        if (input.schedule !== undefined) {
                            sets.push("schedule = ?");
                            vals.push(input.schedule);
                        }
                        if (input.config !== undefined) {
                            sets.push("config = ?");
                            vals.push(input.config);
                        }
                        if (input.isActive !== undefined) {
                            sets.push("is_active = ?");
                            vals.push(input.isActive ? 1 : 0);
                        }
                        if (sets.length === 0)
                            return [2 /*return*/, { success: true }];
                        vals.push(input.id);
                        return [4 /*yield*/, p.query("UPDATE hr_automation_rules SET " + sets.join(", ") + " WHERE id = ?", vals)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    deleteRule: hrEditProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _b.sent();
                        p = pool();
                        return [4 /*yield*/, p.query("DELETE FROM hr_automation_rules WHERE id = ?", [input.id])];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Automation Logs ────────────────────────────────────────────
    getLogs: hrViewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _b.sent();
                        p = pool();
                        return [4 /*yield*/, p.query("SELECT * FROM hr_automation_logs ORDER BY executed_at DESC LIMIT ?", [input.limit])];
                    case 2:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                }
            });
        });
    }),
    // ── Run All Active Automation ──────────────────────────────────
    runAutomation: hrEditProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var p, rules, results, _i, _b, rule, logId, result, config, _c, days, expiring, days, probation, err_1;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _f.sent();
                        p = pool();
                        return [4 /*yield*/, p.query("SELECT * FROM hr_automation_rules WHERE is_active = 1")];
                    case 2:
                        rules = (_f.sent())[0];
                        results = [];
                        _i = 0, _b = rules;
                        _f.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 15];
                        rule = _b[_i];
                        logId = "log_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
                        _f.label = 4;
                    case 4:
                        _f.trys.push([4, 12, , 14]);
                        result = "";
                        config = JSON.parse(rule.config || "{}");
                        _c = rule.type;
                        switch (_c) {
                            case "contract_alert": return [3 /*break*/, 5];
                            case "probation_alert": return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 5:
                        days = config.days || 30;
                        return [4 /*yield*/, p.query("SELECT COUNT(*) as count FROM employee_contracts\n               WHERE status = 'active' AND end_date IS NOT NULL\n               AND end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)", [days])];
                    case 6:
                        expiring = (_f.sent())[0];
                        result = "Found " + (((_d = expiring[0]) === null || _d === void 0 ? void 0 : _d.count) || 0) + " contracts expiring within " + days + " days";
                        return [3 /*break*/, 10];
                    case 7:
                        days = config.days || 90;
                        return [4 /*yield*/, p.query("SELECT COUNT(*) as count FROM employee_contracts\n               WHERE contract_type = 'probation' AND status = 'active'\n               AND start_date <= DATE_SUB(CURDATE(), INTERVAL ? DAY)", [days])];
                    case 8:
                        probation = (_f.sent())[0];
                        result = "Found " + (((_e = probation[0]) === null || _e === void 0 ? void 0 : _e.count) || 0) + " employees completing probation";
                        return [3 /*break*/, 10];
                    case 9:
                        result = "Rule type '" + rule.type + "' executed";
                        _f.label = 10;
                    case 10: return [4 /*yield*/, p.query("INSERT INTO hr_automation_logs (id, rule_id, rule_name, status, result, executed_at)\n           VALUES (?, ?, ?, 'success', ?, NOW())", [logId, rule.id, rule.name, result])];
                    case 11:
                        _f.sent();
                        results.push({ ruleId: rule.id, status: "success", result: result });
                        return [3 /*break*/, 14];
                    case 12:
                        err_1 = _f.sent();
                        return [4 /*yield*/, p.query("INSERT INTO hr_automation_logs (id, rule_id, rule_name, status, result, executed_at)\n           VALUES (?, ?, ?, 'error', ?, NOW())", [logId, rule.id, rule.name, err_1.message || "Unknown error"])];
                    case 13:
                        _f.sent();
                        results.push({ ruleId: rule.id, status: "error", result: err_1.message });
                        return [3 /*break*/, 14];
                    case 14:
                        _i++;
                        return [3 /*break*/, 3];
                    case 15: return [2 /*return*/, { success: true, results: results }];
                }
            });
        });
    }),
    // ── HR Automation Procedures ───────────────────────────────────
    runAllAutomations: hrEditProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var result, err_2;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, hrAutomationModule.runAllHRAutomations({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        result = _d.sent();
                        return [2 /*return*/, { success: true, data: result, message: "All HR automations completed" }];
                    case 4:
                        err_2 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "HR automation failed: " + err_2.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    resetLeaveBalances: hrEditProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var err_3;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, hrAutomationModule.autoResetLeaveBalances({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, { success: true, message: "Leave balances reset successfully" }];
                    case 4:
                        err_3 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Leave reset failed: " + err_3.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    approvePendingSickLeave: hrEditProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var err_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, hrAutomationModule.autoApproveSickLeave({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, { success: true, message: "Sick leave auto-approval completed" }];
                    case 4:
                        err_4 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Sick leave approval failed: " + err_4.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    schedulePerformanceReviews: hrEditProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var err_5;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, hrAutomationModule.schedulePerformanceReviews({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, { success: true, message: "Performance reviews scheduled successfully" }];
                    case 4:
                        err_5 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Performance review scheduling failed: " + err_5.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getBirthdayReminders: hrViewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var reminders, err_6;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, hrAutomationModule.generateBirthdayReminders({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        reminders = _d.sent();
                        return [2 /*return*/, { success: true, data: reminders }];
                    case 4:
                        err_6 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Birthday reminder generation failed: " + err_6.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getAbsenteeismAlerts: hrViewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var alerts, err_7;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, hrAutomationModule.generateAbsenteeismAlerts({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        alerts = _d.sent();
                        return [2 /*return*/, { success: true, data: alerts }];
                    case 4:
                        err_7 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Absenteeism alert generation failed: " + err_7.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getTrainingReminders: hrViewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var reminders, err_8;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, hrAutomationModule.generateTrainingReminders({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        reminders = _d.sent();
                        return [2 /*return*/, { success: true, data: reminders }];
                    case 4:
                        err_8 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Training reminder generation failed: " + err_8.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getPayrollAlerts: hrViewProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var alerts, err_9;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, checkModuleAccess_1.checkModuleAccess(ctx, 'hr')];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, hrAutomationModule.generatePayrollProcessingAlerts({
                                organizationId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId) || "global",
                                userId: (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id
                            })];
                    case 3:
                        alerts = _d.sent();
                        return [2 /*return*/, { success: true, data: alerts }];
                    case 4:
                        err_9 = _d.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Payroll alert generation failed: " + err_9.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
