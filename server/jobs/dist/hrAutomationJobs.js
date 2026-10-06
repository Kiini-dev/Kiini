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
exports.initializeHRAutomationJobs = exports.performanceReviewCycle = exports.timesheetReminder = exports.workAnniversaryReminder = exports.birthdayReminder = exports.leaveExpiryReminder = exports.yearlyP9Generation = exports.automatedPayslipGeneration = exports.automatedPayrollCalculation = exports.monthlyLeaveAccrual = exports.dailyAttendanceReminder = void 0;
var node_cron_1 = require("node-cron");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var mail_1 = require("../_core/mail");
var jobs = [];
// 1. DAILY ATTENDANCE REMINDER - 9 AM
// Sends reminder to employees who haven't logged attendance
exports.dailyAttendanceReminder = function () { return ({
    name: 'Daily Attendance Reminder',
    schedule: '0 9 * * *',
    handler: function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, activeEmployees, _i, activeEmployees_1, emp, today, attendance_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Running daily attendance reminder...');
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error('Database not available');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db.query.employees.findMany({
                            where: drizzle_orm_1.eq(schema_1.employees.status, 'active')
                        })];
                case 2:
                    activeEmployees = _a.sent();
                    _i = 0, activeEmployees_1 = activeEmployees;
                    _a.label = 3;
                case 3:
                    if (!(_i < activeEmployees_1.length)) return [3 /*break*/, 7];
                    emp = activeEmployees_1[_i];
                    today = new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, db.query.attendance.findFirst({
                            where: drizzle_orm_1.and(drizzle_orm_1.eq(attendance_1.employeeId, emp.id), drizzle_orm_1.gte(attendance_1.date, today), drizzle_orm_1.lte(attendance_1.date, today))
                        })];
                case 4:
                    attendance_1 = _a.sent();
                    if (!!attendance_1) return [3 /*break*/, 6];
                    // Send reminder
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: emp.email,
                            subject: 'Attendance Reminder',
                            html: "<p>Dear " + emp.firstName + ",</p><p>Please log your attendance for today.</p>"
                        })];
                case 5:
                    // Send reminder
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7: return [2 /*return*/];
            }
        });
    }); }
}); };
jobs.push(exports.dailyAttendanceReminder());
// 2. MONTHLY LEAVE ACCRUAL - 1st of month
// Accrues annual leave for employees
exports.monthlyLeaveAccrual = function () { return ({
    name: 'Monthly Leave Accrual',
    schedule: '0 0 1 * *',
    handler: function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, organizations, _i, organizations_1, org, activeEmployees, currentYear, _a, activeEmployees_2, emp, settings, leavePolicy, balance, monthlyAccrual, newAccrued;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Running monthly leave accrual...');
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        console.error('Database not available');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db.select().from(schema_1.hrSettings).distinct()];
                case 2:
                    organizations = _b.sent();
                    _i = 0, organizations_1 = organizations;
                    _b.label = 3;
                case 3:
                    if (!(_i < organizations_1.length)) return [3 /*break*/, 11];
                    org = organizations_1[_i];
                    return [4 /*yield*/, db.query.employees.findMany({
                            where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.employees.organizationId, org.organizationId), drizzle_orm_1.eq(schema_1.employees.status, 'active'))
                        })];
                case 4:
                    activeEmployees = _b.sent();
                    currentYear = new Date().getFullYear();
                    _a = 0, activeEmployees_2 = activeEmployees;
                    _b.label = 5;
                case 5:
                    if (!(_a < activeEmployees_2.length)) return [3 /*break*/, 10];
                    emp = activeEmployees_2[_a];
                    return [4 /*yield*/, db.query.hrSettings.findFirst({
                            where: drizzle_orm_1.eq(schema_1.hrSettings.organizationId, emp.organizationId)
                        })];
                case 6:
                    settings = _b.sent();
                    leavePolicy = (settings === null || settings === void 0 ? void 0 : settings.leavePolicy) || { accrualRatePerMonth: 2, maxCarryover: 5 };
                    return [4 /*yield*/, db.query.leaveBalances.findFirst({
                            where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveBalances.employeeId, emp.id), drizzle_orm_1.eq(schema_1.leaveBalances.leaveType, 'annual'), drizzle_orm_1.eq(schema_1.leaveBalances.fiscalYear, currentYear))
                        })];
                case 7:
                    balance = _b.sent();
                    if (!balance) return [3 /*break*/, 9];
                    monthlyAccrual = Math.round(balance.totalEntitlement / 12 || leavePolicy.accrualRatePerMonth);
                    newAccrued = (balance.accrued || 0) + (leavePolicy.accrualRatePerMonth || monthlyAccrual);
                    return [4 /*yield*/, db.update(schema_1.leaveBalances)
                            .set({
                            accrued: newAccrued,
                            available: newAccrued - (balance.used || 0),
                            lastAccrualDate: new Date().toISOString()
                        })
                            .where(drizzle_orm_1.eq(schema_1.leaveBalances.id, balance.id))];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9:
                    _a++;
                    return [3 /*break*/, 5];
                case 10:
                    _i++;
                    return [3 /*break*/, 3];
                case 11: return [2 /*return*/];
            }
        });
    }); }
}); };
jobs.push(exports.monthlyLeaveAccrual());
// 3. AUTOMATED PAYROLL CALCULATION - 20th of month
// Automatically calculates payroll
exports.automatedPayrollCalculation = function () { return ({
    name: 'Automated Payroll Calculation',
    schedule: '0 0 20 * *',
    handler: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('Running automated payroll calculation...');
            return [2 /*return*/];
        });
    }); }
}); };
jobs.push(exports.automatedPayrollCalculation());
// 4. AUTOMATED PAYSLIP GENERATION AND SENDING - 23rd of month
// Generates and emails payslips
exports.automatedPayslipGeneration = function () { return ({
    name: 'Automated Payslip Generation',
    schedule: '0 8 23 * *',
    handler: function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, currentMonth, monthStart, monthEnd, batches, _i, batches_1, batch, payslips_list, _a, payslips_list_1, slip, employee;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('Running automated payslip generation...');
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _c.sent();
                    if (!db) {
                        console.error('Database not available');
                        return [2 /*return*/];
                    }
                    currentMonth = new Date();
                    monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
                    monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();
                    return [4 /*yield*/, db.query.payrollBatches.findMany({
                            where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payrollBatches.status, 'processed'), drizzle_orm_1.gte(schema_1.payrollBatches.payMonth, monthStart), drizzle_orm_1.lte(schema_1.payrollBatches.payMonth, monthEnd))
                        })];
                case 2:
                    batches = _c.sent();
                    _i = 0, batches_1 = batches;
                    _c.label = 3;
                case 3:
                    if (!(_i < batches_1.length)) return [3 /*break*/, 11];
                    batch = batches_1[_i];
                    return [4 /*yield*/, db.query.payslips.findMany({
                            where: drizzle_orm_1.eq(schema_2.payslips.id, batch.id)
                        })
                        // Send email for each payslip
                    ];
                case 4:
                    payslips_list = _c.sent();
                    _a = 0, payslips_list_1 = payslips_list;
                    _c.label = 5;
                case 5:
                    if (!(_a < payslips_list_1.length)) return [3 /*break*/, 10];
                    slip = payslips_list_1[_a];
                    return [4 /*yield*/, db.query.employees.findFirst({
                            where: drizzle_orm_1.eq(schema_1.employees.id, slip.employeeId)
                        })];
                case 6:
                    employee = _c.sent();
                    if (!(employee === null || employee === void 0 ? void 0 : employee.email)) return [3 /*break*/, 9];
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: employee.email,
                            subject: "Your Payslip - " + ((_b = slip.payMonth) === null || _b === void 0 ? void 0 : _b.substring(0, 7)),
                            html: generatePayslipHTML(slip, employee)
                        })
                        // Update payslip status
                    ];
                case 7:
                    _c.sent();
                    // Update payslip status
                    return [4 /*yield*/, db.update(schema_2.payslips)
                            .set({ status: 'sent', sentAt: new Date().toISOString() })
                            .where(drizzle_orm_1.eq(schema_2.payslips.id, slip.id))];
                case 8:
                    // Update payslip status
                    _c.sent();
                    _c.label = 9;
                case 9:
                    _a++;
                    return [3 /*break*/, 5];
                case 10:
                    _i++;
                    return [3 /*break*/, 3];
                case 11: return [2 /*return*/];
            }
        });
    }); }
}); };
jobs.push(exports.automatedPayslipGeneration());
// 5. YEARLY P9 GENERATION - December 20th
// Automatically generates P9 tax forms
exports.yearlyP9Generation = function () { return ({
    name: 'Yearly P9 Generation',
    schedule: '0 0 20 12 *',
    handler: function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, currentYear, previousYear, allEmployees, _i, allEmployees_1, emp, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Running yearly P9 generation...');
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error('Database not available');
                        return [2 /*return*/];
                    }
                    currentYear = new Date().getFullYear();
                    previousYear = currentYear - 1;
                    return [4 /*yield*/, db.query.employees.findMany({
                            where: drizzle_orm_1.eq(schema_1.employees.status, 'active')
                        })];
                case 2:
                    allEmployees = _a.sent();
                    _i = 0, allEmployees_1 = allEmployees;
                    _a.label = 3;
                case 3:
                    if (!(_i < allEmployees_1.length)) return [3 /*break*/, 6];
                    emp = allEmployees_1[_i];
                    return [4 /*yield*/, db.query.taxCompliance.findFirst({
                            where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.taxCompliance.employeeId, emp.id), drizzle_orm_1.eq(schema_1.taxCompliance.taxYear, previousYear))
                        })];
                case 4:
                    existing = _a.sent();
                    if (!existing) {
                        // Generate P9 (this would call generateP9 procedure)
                        console.log("Generating P9 for employee " + emp.id + " for year " + previousYear);
                    }
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    }); }
}); };
jobs.push(exports.yearlyP9Generation());
// 6. LEAVE EXPIRY REMINDER - November 20th
// Reminds about leave carryover limits
exports.leaveExpiryReminder = function () { return ({
    name: 'Leave Expiry Reminder',
    schedule: '0 9 20 11 *',
    handler: function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, currentYear, allEmployees, _i, allEmployees_2, emp, balance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Running leave expiry reminder...');
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error('Database not available');
                        return [2 /*return*/];
                    }
                    currentYear = new Date().getFullYear();
                    return [4 /*yield*/, db.query.employees.findMany({
                            where: drizzle_orm_1.eq(schema_1.employees.status, 'active')
                        })];
                case 2:
                    allEmployees = _a.sent();
                    _i = 0, allEmployees_2 = allEmployees;
                    _a.label = 3;
                case 3:
                    if (!(_i < allEmployees_2.length)) return [3 /*break*/, 7];
                    emp = allEmployees_2[_i];
                    return [4 /*yield*/, db.query.leaveBalances.findFirst({
                            where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveBalances.employeeId, emp.id), drizzle_orm_1.eq(schema_1.leaveBalances.leaveType, 'annual'), drizzle_orm_1.eq(schema_1.leaveBalances.fiscalYear, currentYear))
                        })];
                case 4:
                    balance = _a.sent();
                    if (!(balance && (balance.available || 0) > 5)) return [3 /*break*/, 6];
                    // Employee has more than max carryover (5 days), send warning
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: emp.email,
                            subject: 'Leave Carryover Notice',
                            html: "<p>Dear " + emp.firstName + ",</p><p>You have " + balance.available + " days of leave remaining. Only 5 days can be carried to next year. Please plan your leave accordingly.</p>"
                        })];
                case 5:
                    // Employee has more than max carryover (5 days), send warning
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7: return [2 /*return*/];
            }
        });
    }); }
}); };
jobs.push(exports.leaveExpiryReminder());
// 7. BIRTHDAY REMINDERS - Daily
// Notifies managers about employee birthdays
exports.birthdayReminder = function () { return ({
    name: 'Birthday Reminder',
    schedule: '0 8 * * *',
    handler: function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, today, todayMonth, todayDate, birthdayEmployees, birthdays, _i, birthdays_1, emp, managers, _a, managers_1, manager;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Running birthday reminder...');
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        console.error('Database not available');
                        return [2 /*return*/];
                    }
                    today = new Date();
                    todayMonth = String(today.getMonth() + 1).padStart(2, '0');
                    todayDate = String(today.getDate()).padStart(2, '0');
                    return [4 /*yield*/, db.query.employees.findMany({
                            where: drizzle_orm_1.eq(schema_1.employees.status, 'active')
                        })];
                case 2:
                    birthdayEmployees = _b.sent();
                    birthdays = birthdayEmployees.filter(function (emp) {
                        if (!emp.dateOfBirth)
                            return false;
                        var empMonth = emp.dateOfBirth.substring(5, 7);
                        var empDate = emp.dateOfBirth.substring(8, 10);
                        return empMonth === todayMonth && empDate === todayDate;
                    });
                    _i = 0, birthdays_1 = birthdays;
                    _b.label = 3;
                case 3:
                    if (!(_i < birthdays_1.length)) return [3 /*break*/, 9];
                    emp = birthdays_1[_i];
                    return [4 /*yield*/, db.query.employees.findMany({
                            where: drizzle_orm_1.eq(schema_1.employees.department, emp.department)
                        })];
                case 4:
                    managers = _b.sent();
                    _a = 0, managers_1 = managers;
                    _b.label = 5;
                case 5:
                    if (!(_a < managers_1.length)) return [3 /*break*/, 8];
                    manager = managers_1[_a];
                    if (!(manager.id !== emp.id)) return [3 /*break*/, 7];
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: manager.email,
                            subject: "Birthday Reminder: " + emp.firstName + " " + emp.lastName,
                            html: "<p>Today is " + emp.firstName + "'s birthday! Don't forget to wish them.</p>"
                        })];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    _a++;
                    return [3 /*break*/, 5];
                case 8:
                    _i++;
                    return [3 /*break*/, 3];
                case 9: return [2 /*return*/];
            }
        });
    }); }
}); };
jobs.push(exports.birthdayReminder());
// 8. WORK ANNIVERSARY REMINDER - Annually
// Notifies about work anniversaries
exports.workAnniversaryReminder = function () { return ({
    name: 'Work Anniversary Reminder',
    schedule: '0 8 * * *',
    handler: function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, today, todayMonth, todayDate, allEmployees, anniversaries, _i, anniversaries_1, emp, years;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Running work anniversary reminder...');
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error('Database not available');
                        return [2 /*return*/];
                    }
                    today = new Date();
                    todayMonth = String(today.getMonth() + 1).padStart(2, '0');
                    todayDate = String(today.getDate()).padStart(2, '0');
                    return [4 /*yield*/, db.query.employees.findMany({
                            where: drizzle_orm_1.eq(schema_1.employees.status, 'active')
                        })];
                case 2:
                    allEmployees = _a.sent();
                    anniversaries = allEmployees.filter(function (emp) {
                        if (!emp.hireDate)
                            return false;
                        var hireMonth = emp.hireDate.substring(5, 7);
                        var hireDate = emp.hireDate.substring(8, 10);
                        return hireMonth === todayMonth && hireDate === todayDate;
                    });
                    _i = 0, anniversaries_1 = anniversaries;
                    _a.label = 3;
                case 3:
                    if (!(_i < anniversaries_1.length)) return [3 /*break*/, 6];
                    emp = anniversaries_1[_i];
                    years = today.getFullYear() - parseInt(emp.hireDate.substring(0, 4));
                    if (!(years > 0)) return [3 /*break*/, 5];
                    // Send email to HR/Manager
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: 'hr@company.com',
                            subject: "Work Anniversary: " + emp.firstName + " " + emp.lastName + " - " + years + " years",
                            html: "<p>Today marks " + emp.firstName + "'s " + years + "th work anniversary!</p>"
                        })];
                case 4:
                    // Send email to HR/Manager
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    }); }
}); };
jobs.push(exports.workAnniversaryReminder());
// 9. TIMESHEET REMINDER - Weekly on Friday
// Reminds employees to submit timesheets
exports.timesheetReminder = function () { return ({
    name: 'Timesheet Reminder',
    schedule: '0 16 * * 5',
    handler: function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, today, weekStart, allEmployees, _i, allEmployees_3, emp, timesheet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Running timesheet reminder...');
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error('Database not available');
                        return [2 /*return*/];
                    }
                    today = new Date();
                    weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    weekStart.setHours(0, 0, 0, 0);
                    return [4 /*yield*/, db.query.employees.findMany({
                            where: drizzle_orm_1.eq(schema_1.employees.status, 'active')
                        })];
                case 2:
                    allEmployees = _a.sent();
                    _i = 0, allEmployees_3 = allEmployees;
                    _a.label = 3;
                case 3:
                    if (!(_i < allEmployees_3.length)) return [3 /*break*/, 7];
                    emp = allEmployees_3[_i];
                    return [4 /*yield*/, db.query.timesheets.findFirst({
                            where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.timesheets.employeeId, emp.id), drizzle_orm_1.eq(schema_1.timesheets.status, 'draft'))
                        })];
                case 4:
                    timesheet = _a.sent();
                    if (!(!timesheet && emp.email)) return [3 /*break*/, 6];
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: emp.email,
                            subject: 'Timesheet Submission Reminder',
                            html: "<p>Dear " + emp.firstName + ",</p><p>Please submit your timesheet for this week before end of day Friday.</p>"
                        })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7: return [2 /*return*/];
            }
        });
    }); }
}); };
jobs.push(exports.timesheetReminder());
// 10. PERFORMANCE REVIEW CYCLE - Q1, Q2, Q3, Q4 start
// Initiates performance review cycles
exports.performanceReviewCycle = function () { return ({
    name: 'Performance Review Cycle',
    schedule: '0 0 1 1,4,7,10 *',
    handler: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('Running performance review cycle...');
            return [2 /*return*/];
        });
    }); }
}); };
jobs.push(exports.performanceReviewCycle());
// Initialize all cron jobs
exports.initializeHRAutomationJobs = function () {
    console.log('Initializing HR automation jobs...');
    for (var _i = 0, jobs_1 = jobs; _i < jobs_1.length; _i++) {
        var job = jobs_1[_i];
        node_cron_1["default"].schedule(job.schedule, job.handler);
        console.log("\u2713 Scheduled: " + job.name + " (" + job.schedule + ")");
    }
    console.log("HR automation: " + jobs.length + " jobs initialized");
};
// Helper function to generate payslip HTML
function generatePayslipHTML(slip, employee) {
    var _a;
    return "\n    <html>\n      <body style=\"font-family: Arial, sans-serif;\">\n        <h2>PAYSLIP</h2>\n        <p><strong>Month:</strong> " + ((_a = slip.payMonth) === null || _a === void 0 ? void 0 : _a.substring(0, 7)) + "</p>\n        <p><strong>Employee:</strong> " + employee.firstName + " " + employee.lastName + "</p>\n        <hr />\n        <h3>EARNINGS</h3>\n        <table border=\"1\" cellpadding=\"5\">\n          <tr><td>Basic Salary</td><td>KES " + slip.basicSalary.toLocaleString() + "</td></tr>\n          <tr><td>Allowances</td><td>KES " + slip.allowances.toLocaleString() + "</td></tr>\n          <tr><td>Bonuses</td><td>KES " + slip.bonuses.toLocaleString() + "</td></tr>\n          <tr><strong><td>GROSS SALARY</td><td>KES " + slip.grossSalary.toLocaleString() + "</td></strong></tr>\n        </table>\n        <h3>DEDUCTIONS</h3>\n        <table border=\"1\" cellpadding=\"5\">\n          <tr><td>NSSF (6%)</td><td>KES " + slip.nssfDeduction.toLocaleString() + "</td></tr>\n          <tr><td>NHIF</td><td>KES " + slip.nhifDeduction.toLocaleString() + "</td></tr>\n          <tr><td>PAYE</td><td>KES " + slip.payeDeduction.toLocaleString() + "</td></tr>\n          <tr><td>Other Deductions</td><td>KES " + slip.otherDeductions.toLocaleString() + "</td></tr>\n          <tr><strong><td>TOTAL DEDUCTIONS</td><td>KES " + slip.totalDeductions.toLocaleString() + "</td></strong></tr>\n        </table>\n        <h3 style=\"color: green;\">NET SALARY: KES " + slip.netSalary.toLocaleString() + "</h3>\n      </body>\n    </html>\n  ";
}
// Import additional tables
var schema_2 = require("../../drizzle/schema");
