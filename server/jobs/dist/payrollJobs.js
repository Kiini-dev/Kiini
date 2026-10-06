"use strict";
/**
 * Payroll Job Runners
 *
 * Called by monthly cron jobs and manual admin triggers.
 * Uses getPool() (raw MySQL pool) for compatibility with payslips table
 * which is managed via raw SQL.
 *
 * Payroll processing steps:
 *   1. Fetch all active employees per org
 *   2. Load salary structures, allowances, deductions from schema-extended tables
 *   3. Compute gross pay = basicSalary + active allowances
 *   4. Compute statutory deductions: PAYE, NSSF, SHIF, Housing Levy (Kenyan law)
 *   5. Compute net pay = gross - all deductions
 *   6. Insert payslip record (idempotent — skips if already exists for that period)
 *   7. Deduct net pay from department budget (non-blocking)
 *   8. Insert in-app notifications for all admin/HR users of that org
 */
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.dispatchPayslips = exports.processMonthlyPayroll = void 0;
var db_1 = require("../db");
var uuid_1 = require("uuid");
// ─── Kenyan Statutory Deduction Calculators ──────────────────────────────────
function computeNSSF(grossMonthly) {
    // NSSF Act 2013 – Tier 1: 6% up to KES 18,000
    var tier1 = Math.min(grossMonthly * 0.06, 18000);
    // Tier 2: 6% on salary above KES 300,000
    var tier2 = grossMonthly > 300000 ? (grossMonthly - 300000) * 0.06 : 0;
    return { tier1: Math.round(tier1), tier2: Math.round(tier2), total: Math.round(tier1 + tier2) };
}
function computeSHIF(grossMonthly) {
    // Social Health Insurance Fund: 2.5% capped at KES 15,000/month
    return Math.round(Math.min(grossMonthly * 0.025, 15000));
}
function computeHousingLevy(grossMonthly) {
    // Affordable Housing Levy: 1.5% capped at KES 15,000/month
    return Math.round(Math.min(grossMonthly * 0.015, 15000));
}
// 2024 KRA PAYE bands (monthly)
var PAYE_BANDS = [
    { min: 0, max: 24000, rate: 0.10 },
    { min: 24001, max: 32333, rate: 0.25 },
    { min: 32334, max: 500000, rate: 0.30 },
    { min: 500001, max: 800000, rate: 0.325 },
    { min: 800001, max: Infinity, rate: 0.35 },
];
var PERSONAL_RELIEF_MONTHLY = 2400; // KES per month
function computePAYE(taxableMonthly) {
    var tax = 0;
    for (var _i = 0, PAYE_BANDS_1 = PAYE_BANDS; _i < PAYE_BANDS_1.length; _i++) {
        var band = PAYE_BANDS_1[_i];
        if (taxableMonthly > band.min) {
            tax += (Math.min(taxableMonthly, band.max) - band.min) * band.rate;
        }
    }
    return Math.max(0, Math.round(tax - PERSONAL_RELIEF_MONTHLY));
}
// ─── Main payroll processing function ────────────────────────────────────────
/**
 * Process monthly payroll for all active employees across all organizations.
 * Generates payslips, deducts from budgets, and notifies admin/HR users.
 */
function processMonthlyPayroll(year, month, triggeredBy) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, Promise, function () {
        var pool, result, now, targetYear, targetMonth, payPeriod, payDate, nowStr, runId, employees, totalGross, totalNet, totalPaye, totalNssf, totalNhif, totalHousing, orgRunMap, _i, employees_1, emp, existing, basicSalary, allowances, totalAllowances, allowancesBreakdown, _g, allowances_1, a, amt, grossPay, nssf, shif, housingLevy, taxable, paye, customDeds, customDeductionsTotal, deductionsBreakdown, _h, customDeds_1, d, amt, totalDeductions, netPay, payslipId, empErr_1, _j, _k, _l, orgId, totals, err_1;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    pool = db_1.getPool();
                    result = { success: true, processed: 0, errors: [], message: "" };
                    if (!pool) {
                        result.success = false;
                        result.message = "Database pool not available";
                        return [2 /*return*/, result];
                    }
                    now = new Date();
                    targetYear = year !== null && year !== void 0 ? year : now.getFullYear();
                    targetMonth = month !== null && month !== void 0 ? month : now.getMonth() + 1;
                    payPeriod = targetYear + "-" + String(targetMonth).padStart(2, "0");
                    payDate = targetYear + "-" + String(targetMonth).padStart(2, "0") + "-28";
                    nowStr = now.toISOString().slice(0, 19).replace("T", " ");
                    runId = uuid_1.v4();
                    return [4 /*yield*/, pool.query("INSERT IGNORE INTO payrollRuns (id, payPeriod, runType, status, triggeredBy, startedAt, createdAt) VALUES (?, ?, 'automatic', 'processing', ?, ?, ?)", [runId, payPeriod, triggeredBy !== null && triggeredBy !== void 0 ? triggeredBy : "system", nowStr, nowStr])["catch"](function () { })];
                case 1:
                    _m.sent();
                    _m.label = 2;
                case 2:
                    _m.trys.push([2, 20, , 22]);
                    return [4 /*yield*/, pool.query("SELECT id, organizationId, userId, firstName, lastName, email, department, position, salary, employeeNumber\n       FROM employees WHERE status = 'active'")];
                case 3:
                    employees = (_m.sent())[0];
                    if (!employees.length) {
                        result.message = "No active employees found.";
                        return [2 /*return*/, result];
                    }
                    totalGross = 0, totalNet = 0, totalPaye = 0, totalNssf = 0, totalNhif = 0, totalHousing = 0;
                    orgRunMap = {};
                    _i = 0, employees_1 = employees;
                    _m.label = 4;
                case 4:
                    if (!(_i < employees_1.length)) return [3 /*break*/, 14];
                    emp = employees_1[_i];
                    _m.label = 5;
                case 5:
                    _m.trys.push([5, 12, , 13]);
                    return [4 /*yield*/, pool.query("SELECT id FROM payslips WHERE employeeId = ? AND payPeriod = ? LIMIT 1", [emp.id, payPeriod])];
                case 6:
                    existing = (_m.sent())[0];
                    if (existing.length > 0)
                        return [3 /*break*/, 13];
                    basicSalary = (_a = emp.salary) !== null && _a !== void 0 ? _a : 0;
                    return [4 /*yield*/, pool.query("SELECT allowanceType, amount FROM salaryAllowances WHERE employeeId = ? AND isActive = 1", [emp.id])["catch"](function () { return [[]]; })];
                case 7:
                    allowances = (_m.sent())[0];
                    totalAllowances = 0;
                    allowancesBreakdown = [];
                    for (_g = 0, allowances_1 = allowances; _g < allowances_1.length; _g++) {
                        a = allowances_1[_g];
                        amt = Math.round((_b = a.amount) !== null && _b !== void 0 ? _b : 0);
                        if (amt > 0) {
                            totalAllowances += amt;
                            allowancesBreakdown.push({ name: (_c = a.allowanceType) !== null && _c !== void 0 ? _c : "Allowance", amount: amt });
                        }
                    }
                    grossPay = basicSalary + totalAllowances;
                    nssf = computeNSSF(grossPay);
                    shif = computeSHIF(grossPay);
                    housingLevy = computeHousingLevy(grossPay);
                    taxable = Math.max(0, grossPay - nssf.total - housingLevy);
                    paye = computePAYE(taxable);
                    return [4 /*yield*/, pool.query("SELECT deductionType, amount FROM salaryDeductions WHERE employeeId = ? AND isActive = 1", [emp.id])["catch"](function () { return [[]]; })];
                case 8:
                    customDeds = (_m.sent())[0];
                    customDeductionsTotal = 0;
                    deductionsBreakdown = [
                        { name: "PAYE", amount: paye },
                        { name: "NSSF", amount: nssf.total },
                        { name: "NHIF/SHIF", amount: shif },
                        { name: "Housing Levy", amount: housingLevy },
                    ];
                    for (_h = 0, customDeds_1 = customDeds; _h < customDeds_1.length; _h++) {
                        d = customDeds_1[_h];
                        amt = Math.round((_d = d.amount) !== null && _d !== void 0 ? _d : 0);
                        if (amt > 0) {
                            customDeductionsTotal += amt;
                            deductionsBreakdown.push({ name: (_e = d.deductionType) !== null && _e !== void 0 ? _e : "Deduction", amount: amt });
                        }
                    }
                    totalDeductions = paye + nssf.total + shif + housingLevy + customDeductionsTotal;
                    netPay = Math.max(0, grossPay - totalDeductions);
                    payslipId = uuid_1.v4();
                    return [4 /*yield*/, pool.query("INSERT INTO payslips\n             (id, organizationId, employeeId, payPeriod, payDate,\n              basicSalary, totalAllowances, grossPay,\n              paye, nssf, nhif, housingLevy, customDeductions, totalDeductions, netPay,\n              allowancesBreakdown, deductionsBreakdown,\n              status, processedBy, createdBy, createdAt, updatedAt)\n           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated', ?, ?, ?, ?)", [
                            payslipId,
                            (_f = emp.organizationId) !== null && _f !== void 0 ? _f : null,
                            emp.id, payPeriod, payDate,
                            basicSalary, totalAllowances, grossPay,
                            paye, nssf.total, shif, housingLevy, customDeductionsTotal, totalDeductions, netPay,
                            JSON.stringify(allowancesBreakdown), JSON.stringify(deductionsBreakdown),
                            triggeredBy !== null && triggeredBy !== void 0 ? triggeredBy : "system",
                            triggeredBy !== null && triggeredBy !== void 0 ? triggeredBy : "system",
                            nowStr, nowStr,
                        ])];
                case 9:
                    _m.sent();
                    if (!(emp.organizationId && emp.department)) return [3 /*break*/, 11];
                    return [4 /*yield*/, pool.query("UPDATE budgets\n             SET totalActual = totalActual + ?,\n                 remaining   = GREATEST(0, remaining - ?),\n                 updatedAt   = ?\n             WHERE organizationId = ?\n               AND budgetStatus = 'active'\n               AND EXISTS (\n                 SELECT 1 FROM departments d\n                 WHERE d.id = budgets.departmentId\n                   AND d.name = ? AND d.organizationId = budgets.organizationId\n               )\n             LIMIT 1", [netPay, netPay, nowStr, emp.organizationId, emp.department])["catch"](function () { })];
                case 10:
                    _m.sent();
                    _m.label = 11;
                case 11:
                    if (emp.organizationId) {
                        if (!orgRunMap[emp.organizationId])
                            orgRunMap[emp.organizationId] = { processed: 0, totalNet: 0 };
                        orgRunMap[emp.organizationId].processed++;
                        orgRunMap[emp.organizationId].totalNet += netPay;
                    }
                    totalGross += grossPay;
                    totalNet += netPay;
                    totalPaye += paye;
                    totalNssf += nssf.total;
                    totalNhif += shif;
                    totalHousing += housingLevy;
                    result.processed++;
                    return [3 /*break*/, 13];
                case 12:
                    empErr_1 = _m.sent();
                    result.errors.push("Employee " + emp.id + " (" + emp.firstName + " " + emp.lastName + "): " + empErr_1.message);
                    return [3 /*break*/, 13];
                case 13:
                    _i++;
                    return [3 /*break*/, 4];
                case 14:
                    _j = 0, _k = Object.entries(orgRunMap);
                    _m.label = 15;
                case 15:
                    if (!(_j < _k.length)) return [3 /*break*/, 18];
                    _l = _k[_j], orgId = _l[0], totals = _l[1];
                    return [4 /*yield*/, notifyAdminsPayrollReady(pool, orgId, payPeriod, totals.processed, totals.totalNet, nowStr)];
                case 16:
                    _m.sent();
                    _m.label = 17;
                case 17:
                    _j++;
                    return [3 /*break*/, 15];
                case 18: 
                // Update run record
                return [4 /*yield*/, pool.query("UPDATE payrollRuns\n       SET status = ?, processedCount = ?, employeesCount = ?,\n           totalGross = ?, totalNet = ?, totalPaye = ?, totalNssf = ?,\n           totalNhif = ?, totalHousingLevy = ?, completedAt = ?, errorLog = ?\n       WHERE id = ?", [
                        result.errors.length > 0 ? "partial" : "completed",
                        result.processed, employees.length,
                        totalGross, totalNet, totalPaye, totalNssf, totalNhif, totalHousing,
                        nowStr, JSON.stringify(result.errors), runId,
                    ])["catch"](function () { })];
                case 19:
                    // Update run record
                    _m.sent();
                    result.message = "Payroll processed for " + payPeriod + ". " + result.processed + " payslips generated.";
                    if (result.errors.length)
                        result.success = false;
                    return [3 /*break*/, 22];
                case 20:
                    err_1 = _m.sent();
                    result.success = false;
                    result.message = "Payroll job failed: " + err_1.message;
                    return [4 /*yield*/, pool.query("UPDATE payrollRuns SET status = 'failed', errorLog = ?, completedAt = ? WHERE id = ?", [JSON.stringify([err_1.message]), nowStr, runId])["catch"](function () { })];
                case 21:
                    _m.sent();
                    return [3 /*break*/, 22];
                case 22: return [2 /*return*/, result];
            }
        });
    });
}
exports.processMonthlyPayroll = processMonthlyPayroll;
// ─── Dispatch Payslips ────────────────────────────────────────────────────────
/**
 * Send payslips by email and create in-app notifications for each employee.
 */
function dispatchPayslips(year, month) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var pool, result, now, targetYear, targetMonth, payPeriod, nowStr, displayPeriod, payslips, sendEmail, _i, payslips_1, slip, allowances, deductions, slipErr_1, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pool = db_1.getPool();
                    result = { success: true, processed: 0, errors: [], message: "" };
                    if (!pool) {
                        result.success = false;
                        result.message = "Database pool not available";
                        return [2 /*return*/, result];
                    }
                    now = new Date();
                    targetYear = year !== null && year !== void 0 ? year : now.getFullYear();
                    targetMonth = month !== null && month !== void 0 ? month : now.getMonth() + 1;
                    payPeriod = targetYear + "-" + String(targetMonth).padStart(2, "0");
                    nowStr = now.toISOString().slice(0, 19).replace("T", " ");
                    displayPeriod = new Date(targetYear, targetMonth - 1, 1)
                        .toLocaleString("en-KE", { month: "long", year: "numeric" });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 14, , 15]);
                    return [4 /*yield*/, pool.query("SELECT p.*, e.firstName, e.lastName, e.email, e.employeeNumber,\n              e.department, e.position, e.bankName, e.bankBranch, e.bankAccountNumber,\n              e.nssfNumber, e.nhifNumber, e.taxId, e.userId\n       FROM payslips p\n       LEFT JOIN employees e ON p.employeeId = e.id\n       WHERE p.payPeriod = ? AND p.status = 'generated'", [payPeriod])];
                case 2:
                    payslips = (_b.sent())[0];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../_core/mail"); })];
                case 3:
                    sendEmail = (_b.sent()).sendEmail;
                    _i = 0, payslips_1 = payslips;
                    _b.label = 4;
                case 4:
                    if (!(_i < payslips_1.length)) return [3 /*break*/, 13];
                    slip = payslips_1[_i];
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 11, , 12]);
                    allowances = JSON.parse(slip.allowancesBreakdown || "[]");
                    deductions = JSON.parse(slip.deductionsBreakdown || "[]");
                    if (!slip.email) return [3 /*break*/, 7];
                    return [4 /*yield*/, sendEmail({
                            to: slip.email,
                            subject: "Payslip \u2013 " + displayPeriod,
                            html: buildPayslipEmail(slip, allowances, deductions, displayPeriod)
                        })["catch"](function () { })];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [4 /*yield*/, pool.query("UPDATE payslips SET status = 'sent', sentAt = ? WHERE id = ?", [nowStr, slip.id])];
                case 8:
                    _b.sent();
                    if (!slip.userId) return [3 /*break*/, 10];
                    return [4 /*yield*/, pool.query("INSERT INTO notifications\n               (id, userId, type, title, message, category, entityType, entityId, priority, actionUrl, isRead, deliveryStatus, status, createdAt)\n             VALUES (?, ?, 'success', ?, ?, 'payroll', 'payslip', ?, 'normal', '/payslips', 0, 'pending', 'active', ?)", [
                            uuid_1.v4(), slip.userId,
                            "Your Payslip for " + displayPeriod + " is Ready",
                            "Net Pay: KES " + Math.round(((_a = slip.netPay) !== null && _a !== void 0 ? _a : 0)).toLocaleString("en-KE") + ". Tap to view your payslip.",
                            slip.id, nowStr,
                        ])["catch"](function () { })];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10:
                    result.processed++;
                    return [3 /*break*/, 12];
                case 11:
                    slipErr_1 = _b.sent();
                    result.errors.push("Payslip " + slip.id + ": " + slipErr_1.message);
                    return [3 /*break*/, 12];
                case 12:
                    _i++;
                    return [3 /*break*/, 4];
                case 13:
                    result.message = "Dispatched " + result.processed + " payslips for " + payPeriod + ".";
                    if (result.errors.length)
                        result.success = false;
                    return [3 /*break*/, 15];
                case 14:
                    err_2 = _b.sent();
                    result.success = false;
                    result.message = "Dispatch job failed: " + err_2.message;
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/, result];
            }
        });
    });
}
exports.dispatchPayslips = dispatchPayslips;
// ─── Helpers ──────────────────────────────────────────────────────────────────
function notifyAdminsPayrollReady(pool, orgId, payPeriod, count, totalNet, nowStr) {
    return __awaiter(this, void 0, Promise, function () {
        var admins, _a, y, m, displayPeriod, _i, admins_1, admin, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, pool.query("SELECT id FROM users WHERE organizationId = ? AND role IN ('admin','hr') AND isActive = 1", [orgId])];
                case 1:
                    admins = (_c.sent())[0];
                    _a = payPeriod.split("-").map(Number), y = _a[0], m = _a[1];
                    displayPeriod = new Date(y, m - 1, 1).toLocaleString("en-KE", { month: "long", year: "numeric" });
                    _i = 0, admins_1 = admins;
                    _c.label = 2;
                case 2:
                    if (!(_i < admins_1.length)) return [3 /*break*/, 5];
                    admin = admins_1[_i];
                    return [4 /*yield*/, pool.query("INSERT INTO notifications\n           (id, userId, type, title, message, category, entityType, priority, actionUrl, isRead, deliveryStatus, status, createdAt)\n         VALUES (?, ?, 'success', ?, ?, 'payroll', 'payroll', 'high', '/payroll', 0, 'pending', 'active', ?)", [
                            uuid_1.v4(), admin.id,
                            "Payroll Ready \u2013 " + displayPeriod,
                            "Payroll for " + displayPeriod + " has been automatically processed. " + count + " payslip(s) generated. Total net payout: KES " + Math.round(totalNet).toLocaleString("en-KE") + ". Review and approve before dispatching.",
                            nowStr,
                        ])["catch"](function () { })];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6:
                    _b = _c.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function buildPayslipEmail(slip, allowances, deductions, displayPeriod) {
    var _a, _b, _c, _d;
    var r = "padding:8px 12px;border-bottom:1px solid #e5e7eb;";
    var ra = "text-align:right;" + r;
    var earningsRows = __spreadArrays([
        "<tr><td style=\"" + r + "\">Basic Salary</td><td style=\"" + ra + "\">KES " + ((_a = slip.basicSalary) !== null && _a !== void 0 ? _a : 0).toLocaleString() + "</td></tr>"
    ], allowances.map(function (a) { var _a; return "<tr style=\"color:#15803d\"><td style=\"" + r + "\">" + a.name + "</td><td style=\"" + ra + "\">+ KES " + ((_a = a.amount) !== null && _a !== void 0 ? _a : 0).toLocaleString() + "</td></tr>"; }), [
        "<tr style=\"background:#f0fdf4;font-weight:600\"><td style=\"" + r + "\">Gross Pay</td><td style=\"" + ra + "\">KES " + ((_b = slip.grossPay) !== null && _b !== void 0 ? _b : 0).toLocaleString() + "</td></tr>",
    ]).join("");
    var deductionRows = __spreadArrays(deductions.map(function (d) { var _a; return "<tr style=\"color:#dc2626\"><td style=\"" + r + "\">" + d.name + "</td><td style=\"" + ra + "\">- KES " + ((_a = d.amount) !== null && _a !== void 0 ? _a : 0).toLocaleString() + "</td></tr>"; }), [
        "<tr style=\"background:#fef2f2;font-weight:600\"><td style=\"" + r + "\">Total Deductions</td><td style=\"" + ra + "\">KES " + ((_c = slip.totalDeductions) !== null && _c !== void 0 ? _c : 0).toLocaleString() + "</td></tr>",
    ]).join("");
    return "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"></head>\n<body style=\"margin:0;padding:20px;background:#f3f4f6;font-family:Arial,sans-serif;\">\n<div style=\"max-width:620px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);\">\n<div style=\"background:linear-gradient(135deg,#1d4ed8,#7c3aed);padding:24px 28px;color:#fff;\">\n  <h1 style=\"margin:0;font-size:20px;letter-spacing:1px;\">PAYSLIP</h1>\n  <p style=\"margin:4px 0 0;opacity:.9;font-size:14px;\">" + displayPeriod + "</p>\n  <p style=\"margin:4px 0 0;opacity:.75;font-size:12px;\">Pay Date: " + (slip.payDate || "") + " | Employee #: " + (slip.employeeNumber || slip.employeeId) + "</p>\n</div>\n<div style=\"background:#f8fafc;padding:16px 28px;border-bottom:1px solid #e2e8f0;font-size:13px;\">\n  <strong style=\"font-size:15px;\">" + (slip.firstName || "") + " " + (slip.lastName || "") + "</strong><br>\n  " + (slip.position || "") + " \u2013 " + (slip.department || "") + "<br>\n  NSSF: " + (slip.nssfNumber || "—") + " | NHIF: " + (slip.nhifNumber || "—") + " | Tax PIN: " + (slip.taxId || "—") + "\n</div>\n<div style=\"padding:0 28px;\">\n  <table style=\"width:100%;border-collapse:collapse;margin-top:16px;\">\n    <thead><tr style=\"background:#eff6ff;font-size:11px;text-transform:uppercase;color:#3b82f6;\">\n      <th style=\"padding:8px 12px;text-align:left;\">Earnings</th><th style=\"padding:8px 12px;text-align:right;\">KES</th>\n    </tr></thead><tbody>" + earningsRows + "</tbody>\n  </table>\n  <table style=\"width:100%;border-collapse:collapse;margin-top:16px;\">\n    <thead><tr style=\"background:#fef2f2;font-size:11px;text-transform:uppercase;color:#dc2626;\">\n      <th style=\"padding:8px 12px;text-align:left;\">Deductions</th><th style=\"padding:8px 12px;text-align:right;\">KES</th>\n    </tr></thead><tbody>" + deductionRows + "</tbody>\n  </table>\n</div>\n<div style=\"margin:20px 28px;padding:16px 20px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);border-radius:8px;color:#fff;display:flex;justify-content:space-between;align-items:center;\">\n  <span style=\"font-size:15px;font-weight:600;\">NET PAY</span>\n  <span style=\"font-size:22px;font-weight:800;\">KES " + ((_d = slip.netPay) !== null && _d !== void 0 ? _d : 0).toLocaleString() + "</span>\n</div>\n<div style=\"padding:0 28px 16px;font-size:12px;color:#6b7280;\">\n  <strong style=\"color:#374151;\">Bank:</strong> " + (slip.bankName || "—") + " | " + (slip.bankBranch || "") + " | Acct: " + (slip.bankAccountNumber || "—") + "\n</div>\n<div style=\"background:#f8fafc;padding:10px 28px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;\">\n  Computer-generated payslip \u2013 No signature required | " + displayPeriod + "\n</div>\n</div></body></html>";
}
