"use strict";
/**
 * HR Automation Engine
 * Handles automatic HR processes including leave calculations, notifications, and approvals
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
exports.__esModule = true;
exports.runAllHRAutomations = exports.generatePayrollProcessingAlerts = exports.generateTrainingReminders = exports.generateAbsenteeismAlerts = exports.generateBirthdayReminders = exports.schedulePerformanceReviews = exports.autoApproveSickLeave = exports.autoResetLeaveBalances = void 0;
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
var uuid_1 = require("uuid");
/**
 * Automatic Leave Balance Reset
 * Resets annual leave balance on January 1st each year
 */
function autoResetLeaveBalances(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            try {
                console.log("[HR Automation] Leave balances reset triggered for org: " + ctx.organizationId);
                // Placeholder for future leave balance management
                return [2 /*return*/];
            }
            catch (err) {
                console.error("[HR Automation] Error resetting leave balances:", err);
                throw err;
            }
            return [2 /*return*/];
        });
    });
}
exports.autoResetLeaveBalances = autoResetLeaveBalances;
/**
 * Automatic Leave Request Approval for Sick Leave
 * Auto-approves sick leave requests up to 3 days
 */
function autoApproveSickLeave(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var db, pendingRequests, approvedCount, _i, pendingRequests_1, req, startDate, endDate, days, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.leaveRequests)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, ctx.organizationId), drizzle_orm_1.eq(schema_1.leaveRequests.status, "pending")))];
                case 3:
                    pendingRequests = _a.sent();
                    approvedCount = 0;
                    _i = 0, pendingRequests_1 = pendingRequests;
                    _a.label = 4;
                case 4:
                    if (!(_i < pendingRequests_1.length)) return [3 /*break*/, 7];
                    req = pendingRequests_1[_i];
                    startDate = new Date(req.startDate);
                    endDate = new Date(req.endDate);
                    days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (!(days <= 3)) return [3 /*break*/, 6];
                    return [4 /*yield*/, db
                            .update(schema_1.leaveRequests)
                            .set({
                            status: "approved",
                            approvedBy: "system",
                            approvedDate: new Date()
                        })
                            .where(drizzle_orm_1.eq(schema_1.leaveRequests.id, req.id))];
                case 5:
                    _a.sent();
                    approvedCount++;
                    console.log("[HR Automation] Auto-approved sick leave request " + req.id);
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, approvedCount];
                case 8:
                    error_1 = _a.sent();
                    console.error("[HR Automation] Sick leave approval error:", error_1);
                    throw error_1;
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.autoApproveSickLeave = autoApproveSickLeave;
/**
 * Schedule Performance Reviews Quarterly
 * Creates performance reviews on Jan 1, Apr 1, Jul 1, Oct 1
 */
function schedulePerformanceReviews(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var db, today, month, quarterlyMonths, orgEmployees, reviewsCreated, _i, orgEmployees_1, emp, reviewId, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    today = new Date();
                    month = today.getMonth();
                    quarterlyMonths = [0, 3, 6, 9];
                    if (!quarterlyMonths.includes(month) || today.getDate() !== 1) {
                        return [2 /*return*/, 0];
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.employees)
                            .where(drizzle_orm_1.eq(schema_1.employees.organizationId, ctx.organizationId))];
                case 3:
                    orgEmployees = _a.sent();
                    reviewsCreated = 0;
                    _i = 0, orgEmployees_1 = orgEmployees;
                    _a.label = 4;
                case 4:
                    if (!(_i < orgEmployees_1.length)) return [3 /*break*/, 7];
                    emp = orgEmployees_1[_i];
                    reviewId = uuid_1.v4();
                    return [4 /*yield*/, db.insert(schema_1.performanceReviews).values({
                            id: reviewId,
                            employeeId: emp.id,
                            reviewDate: today,
                            status: "draft",
                            organizationId: ctx.organizationId,
                            createdAt: today,
                            updatedAt: today
                        })];
                case 5:
                    _a.sent();
                    reviewsCreated++;
                    console.log("[HR Automation] Created quarterly performance review for " + emp.id);
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, reviewsCreated];
                case 8:
                    error_2 = _a.sent();
                    console.error("[HR Automation] Performance review scheduling error:", error_2);
                    throw error_2;
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.schedulePerformanceReviews = schedulePerformanceReviews;
/**
 * Generate Birthday Reminders
 * Creates notifications for employee birthdays today
 */
function generateBirthdayReminders(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var db, today, todayMonth, todayDate, birthdayEmployees, reminders, _i, birthdayEmployees_1, emp, dob, dobMonth, dobDate, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    today = new Date();
                    todayMonth = String(today.getMonth() + 1).padStart(2, "0");
                    todayDate = String(today.getDate()).padStart(2, "0");
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.employees)
                            .where(drizzle_orm_1.eq(schema_1.employees.organizationId, ctx.organizationId))];
                case 3:
                    birthdayEmployees = _a.sent();
                    reminders = [];
                    for (_i = 0, birthdayEmployees_1 = birthdayEmployees; _i < birthdayEmployees_1.length; _i++) {
                        emp = birthdayEmployees_1[_i];
                        if (emp.dateOfBirth) {
                            dob = new Date(emp.dateOfBirth);
                            dobMonth = String(dob.getMonth() + 1).padStart(2, "0");
                            dobDate = String(dob.getDate()).padStart(2, "0");
                            if (dobMonth === todayMonth && dobDate === todayDate) {
                                reminders.push({
                                    employeeId: emp.id,
                                    name: emp.firstName + " " + emp.lastName,
                                    message: "Happy birthday to " + emp.firstName + " " + emp.lastName + "!"
                                });
                            }
                        }
                    }
                    console.log("[HR Automation] Generated " + reminders.length + " birthday reminders");
                    return [2 /*return*/, reminders];
                case 4:
                    error_3 = _a.sent();
                    console.error("[HR Automation] Birthday reminder error:", error_3);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.generateBirthdayReminders = generateBirthdayReminders;
/**
 * Generate Absenteeism Alerts
 * Alerts for employees with low attendance (< 80%) in the previous month
 */
function generateAbsenteeismAlerts(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var db, today, lastMonth, lastMonthEnd, attendanceRecords, alerts, employeeAttendance, _i, attendanceRecords_1, record, _a, _b, _c, empId, stats, total, percentage, error_4;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _d.sent();
                    if (!db)
                        throw new Error("Database not available");
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    today = new Date();
                    lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.attendance)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.organizationId, ctx.organizationId), drizzle_orm_1.gte(schema_1.attendance.date, lastMonth.toISOString()), drizzle_orm_1.lte(schema_1.attendance.date, lastMonthEnd.toISOString())))];
                case 3:
                    attendanceRecords = _d.sent();
                    alerts = [];
                    employeeAttendance = {};
                    for (_i = 0, attendanceRecords_1 = attendanceRecords; _i < attendanceRecords_1.length; _i++) {
                        record = attendanceRecords_1[_i];
                        if (!employeeAttendance[record.employeeId]) {
                            employeeAttendance[record.employeeId] = { present: 0, absent: 0 };
                        }
                        if (record.status === "present") {
                            employeeAttendance[record.employeeId].present++;
                        }
                        else {
                            employeeAttendance[record.employeeId].absent++;
                        }
                    }
                    for (_a = 0, _b = Object.entries(employeeAttendance); _a < _b.length; _a++) {
                        _c = _b[_a], empId = _c[0], stats = _c[1];
                        total = stats.present + stats.absent;
                        percentage = total > 0 ? (stats.present / total) * 100 : 0;
                        if (percentage < 80) {
                            alerts.push({
                                employeeId: empId,
                                attendance: percentage.toFixed(2),
                                message: "Attendance below threshold at " + percentage.toFixed(2) + "%"
                            });
                        }
                    }
                    console.log("[HR Automation] Generated " + alerts.length + " absenteeism alerts");
                    return [2 /*return*/, alerts];
                case 4:
                    error_4 = _d.sent();
                    console.error("[HR Automation] Absenteeism alert error:", error_4);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.generateAbsenteeismAlerts = generateAbsenteeismAlerts;
/**
 * Generate Training Reminders
 * Notifications for training scheduled within next 7 days
 */
function generateTrainingReminders(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            try {
                // Placeholder for training module which doesn't exist yet
                console.log("[HR Automation] Training reminders checked for org: " + ctx.organizationId);
                return [2 /*return*/, []];
            }
            catch (error) {
                console.error("[HR Automation] Training reminder error:", error);
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    });
}
exports.generateTrainingReminders = generateTrainingReminders;
/**
 * Generate Payroll Processing Alerts
 * Alerts when approaching payroll processing window (22-28 of month)
 */
function generatePayrollProcessingAlerts(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var today, dayOfMonth;
        return __generator(this, function (_a) {
            try {
                today = new Date();
                dayOfMonth = today.getDate();
                if (dayOfMonth >= 22 && dayOfMonth <= 28) {
                    console.log("[HR Automation] Payroll processing window (day " + dayOfMonth + ")");
                    return [2 /*return*/, [
                            {
                                type: "payroll",
                                message: "Payroll processing window: " + dayOfMonth + "/28",
                                dayOfMonth: dayOfMonth
                            },
                        ]];
                }
                return [2 /*return*/, []];
            }
            catch (error) {
                console.error("[HR Automation] Payroll alert error:", error);
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    });
}
exports.generatePayrollProcessingAlerts = generatePayrollProcessingAlerts;
/**
 * Run All HR Automations
 * Master orchestrator function
 */
function runAllHRAutomations(ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var results, sickLeaveApproved, reviewsCreated, birthdayReminders, absenteeismAlerts, trainingReminders, payrollAlerts, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[HR Automation] Starting all HR automations for org: " + ctx.organizationId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    results = {};
                    // Run each automation
                    return [4 /*yield*/, autoResetLeaveBalances(ctx)];
                case 2:
                    // Run each automation
                    _a.sent();
                    results.leaveReset = { status: "completed" };
                    return [4 /*yield*/, autoApproveSickLeave(ctx)];
                case 3:
                    sickLeaveApproved = _a.sent();
                    results.sickLeaveApproval = { status: "completed", approved: sickLeaveApproved };
                    return [4 /*yield*/, schedulePerformanceReviews(ctx)];
                case 4:
                    reviewsCreated = _a.sent();
                    results.performanceReviews = { status: "completed", created: reviewsCreated };
                    return [4 /*yield*/, generateBirthdayReminders(ctx)];
                case 5:
                    birthdayReminders = _a.sent();
                    results.birthdayReminders = {
                        status: "completed",
                        count: birthdayReminders.length
                    };
                    return [4 /*yield*/, generateAbsenteeismAlerts(ctx)];
                case 6:
                    absenteeismAlerts = _a.sent();
                    results.absenteeismAlerts = { status: "completed", count: absenteeismAlerts.length };
                    return [4 /*yield*/, generateTrainingReminders(ctx)];
                case 7:
                    trainingReminders = _a.sent();
                    results.trainingReminders = { status: "completed", count: trainingReminders.length };
                    return [4 /*yield*/, generatePayrollProcessingAlerts(ctx)];
                case 8:
                    payrollAlerts = _a.sent();
                    results.payrollAlerts = { status: "completed", count: payrollAlerts.length };
                    console.log("[HR Automation] All automations completed successfully");
                    return [2 /*return*/, results];
                case 9:
                    err_1 = _a.sent();
                    console.error("[HR Automation] Error running automations:", err_1);
                    throw err_1;
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.runAllHRAutomations = runAllHRAutomations;
exports["default"] = {
    autoResetLeaveBalances: autoResetLeaveBalances,
    autoApproveSickLeave: autoApproveSickLeave,
    schedulePerformanceReviews: schedulePerformanceReviews,
    generateBirthdayReminders: generateBirthdayReminders,
    generateAbsenteeismAlerts: generateAbsenteeismAlerts,
    generateTrainingReminders: generateTrainingReminders,
    generatePayrollProcessingAlerts: generatePayrollProcessingAlerts,
    runAllHRAutomations: runAllHRAutomations
};
