"use strict";
/**
 * Comprehensive HR Management Service
 * Handles payroll processing, employee workflows, leave management, attendance,
 * performance reviews, training, onboarding, and recruitment
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.getEmployeePayrollSummary = exports.approveSalaryIncrement = exports.createEmployeeContract = exports.addEmployeeBenefit = exports.createPerformanceReview = exports.getAttendanceReport = exports.markAttendance = exports.rejectLeaveRequest = exports.approveLeaveRequest = exports.requestLeave = exports.processMonthlyPayroll = void 0;
var db_1 = require("../db");
var server_1 = require("@trpc/server");
var schema = require("../../drizzle/schema");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var kenyan_payroll_calculator_1 = require("../utils/kenyan-payroll-calculator");
/**
 * Process monthly payroll for specified employees or all active employees
 */
function processMonthlyPayroll(options) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var db, result, _b, year, month, employees, _i, employees_1, employee, payrollData, payrollId, error_1, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                    result = {
                        processed: 0,
                        failed: 0,
                        totalGross: 0,
                        totalDeductions: 0,
                        totalNet: 0,
                        errors: []
                    };
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 16, , 17]);
                    _b = options.month.split("-").map(Number), year = _b[0], month = _b[1];
                    if (!year || !month || month < 1 || month > 12) {
                        throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Invalid month format (use YYYY-MM)" });
                    }
                    employees = void 0;
                    if (!((_a = options.employeeIds) === null || _a === void 0 ? void 0 : _a.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, db
                            .select()
                            .from(schema.employees)
                            .where(drizzle_orm_1.and(schema.employees.status.eq("active"), drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " IN (", ")"], ["", " IN (", ")"])), schema.employees.id, drizzle_orm_1.sql.placeholder.apply(drizzle_orm_1.sql, options.employeeIds))))];
                case 3:
                    employees = _c.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, db.select().from(schema.employees).where(schema.employees.status.eq("active"))];
                case 5:
                    employees = _c.sent();
                    _c.label = 6;
                case 6:
                    _i = 0, employees_1 = employees;
                    _c.label = 7;
                case 7:
                    if (!(_i < employees_1.length)) return [3 /*break*/, 15];
                    employee = employees_1[_i];
                    _c.label = 8;
                case 8:
                    _c.trys.push([8, 13, , 14]);
                    return [4 /*yield*/, calculateEmployeePayroll(db, employee, year, month)];
                case 9:
                    payrollData = _c.sent();
                    if (!!options.dryRun) return [3 /*break*/, 12];
                    payrollId = uuid_1.v4();
                    return [4 /*yield*/, db.insert(schema.payroll).values({
                            id: payrollId,
                            employeeId: employee.id,
                            month: year + "-" + String(month).padStart(2, "0"),
                            basicSalary: Math.round(payrollData.basicSalary),
                            allowances: Math.round(payrollData.allowances),
                            deductions: Math.round(payrollData.deductions),
                            tax: Math.round(payrollData.tax),
                            netSalary: Math.round(payrollData.netSalary),
                            status: options.approvalRequired ? "pending_approval" : "processed",
                            notes: JSON.stringify(payrollData.breakdown),
                            createdAt: new Date().toISOString(),
                            paymentDate: null
                        })];
                case 10:
                    _c.sent();
                    // Save detailed breakdown if record exists
                    return [4 /*yield*/, db
                            .insert(schema_extended_1.payrollDetails)
                            .values({
                            id: uuid_1.v4(),
                            payrollId: payrollId,
                            employeeId: employee.id,
                            basicSalary: Math.round(payrollData.basicSalary),
                            allowancesTotal: Math.round(payrollData.allowances),
                            deductionsTotal: Math.round(payrollData.deductions),
                            taxAmount: Math.round(payrollData.tax),
                            netPayment: Math.round(payrollData.netSalary),
                            notes: JSON.stringify(payrollData.breakdown),
                            createdAt: new Date().toISOString()
                        })["catch"](function () { })];
                case 11:
                    // Save detailed breakdown if record exists
                    _c.sent();
                    _c.label = 12;
                case 12:
                    result.processed++;
                    result.totalGross += payrollData.basicSalary + payrollData.allowances;
                    result.totalDeductions += payrollData.deductions + payrollData.tax;
                    result.totalNet += payrollData.netSalary;
                    return [3 /*break*/, 14];
                case 13:
                    error_1 = _c.sent();
                    result.failed++;
                    result.errors.push({
                        employeeId: employee.id,
                        error: error_1.message
                    });
                    return [3 /*break*/, 14];
                case 14:
                    _i++;
                    return [3 /*break*/, 7];
                case 15: return [2 /*return*/, result];
                case 16:
                    error_2 = _c.sent();
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Payroll processing failed: " + error_2.message
                    });
                case 17: return [2 /*return*/];
            }
        });
    });
}
exports.processMonthlyPayroll = processMonthlyPayroll;
/**
 * Calculate payroll for a single employee
 */
function calculateEmployeePayroll(db, employee, year, month) {
    return __awaiter(this, void 0, void 0, function () {
        var structures, basicSalary, allowances, allowancesTotal, deductions, deductionsTotal, grossSalary, taxCalculation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.select().from(schema_extended_1.salaryStructures).where(drizzle_orm_1.eq(schema_extended_1.salaryStructures.employeeId, employee.id))];
                case 1:
                    structures = _a.sent();
                    basicSalary = employee.salary || 0;
                    if (structures.length > 0) {
                        basicSalary = structures[0].basicSalary || basicSalary;
                    }
                    return [4 /*yield*/, db.select().from(schema_extended_1.salaryAllowances).where(drizzle_orm_1.eq(schema_extended_1.salaryAllowances.employeeId, employee.id))];
                case 2:
                    allowances = _a.sent();
                    allowancesTotal = 0;
                    allowances.forEach(function (a) {
                        allowancesTotal += a.amount || 0;
                    });
                    return [4 /*yield*/, db.select().from(schema_extended_1.salaryDeductions).where(drizzle_orm_1.eq(schema_extended_1.salaryDeductions.employeeId, employee.id))];
                case 3:
                    deductions = _a.sent();
                    deductionsTotal = 0;
                    deductions.forEach(function (d) {
                        deductionsTotal += d.amount || 0;
                    });
                    grossSalary = basicSalary + allowancesTotal;
                    taxCalculation = kenyan_payroll_calculator_1.calculateKenyanPayroll({
                        basicSalary: basicSalary,
                        allowances: allowancesTotal,
                        deductions: deductionsTotal,
                        employeeId: employee.id
                    });
                    return [2 /*return*/, {
                            basicSalary: basicSalary,
                            allowances: allowancesTotal,
                            deductions: deductionsTotal,
                            tax: taxCalculation.tax,
                            netSalary: grossSalary - deductionsTotal - taxCalculation.tax,
                            breakdown: {
                                basicSalary: basicSalary,
                                allowances: allowances.map(function (a) { return ({ name: a.name, amount: a.amount }); }),
                                deductions: deductions.map(function (d) { return ({ name: d.name, amount: d.amount }); }),
                                tax: taxCalculation.tax,
                                nssf: taxCalculation.nssf,
                                shif: taxCalculation.shif,
                                housingLevy: taxCalculation.housingLevy
                            }
                        }];
            }
        });
    });
}
function requestLeave(input) {
    return __awaiter(this, void 0, Promise, function () {
        var db, id, startDate, endDate, days;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                    id = uuid_1.v4();
                    startDate = new Date(input.startDate);
                    endDate = new Date(input.endDate);
                    days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    return [4 /*yield*/, db.insert(schema.leaveRequests).values({
                            id: id,
                            employeeId: input.employeeId,
                            leaveType: input.leaveType,
                            startDate: input.startDate,
                            endDate: input.endDate,
                            daysRequested: days,
                            reason: input.reason,
                            status: "pending",
                            createdAt: new Date().toISOString()
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { id: id, success: true }];
            }
        });
    });
}
exports.requestLeave = requestLeave;
function approveLeaveRequest(id, approvedBy) {
    return __awaiter(this, void 0, Promise, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                    return [4 /*yield*/, db
                            .update(schema.leaveRequests)
                            .set({ status: "approved", approvedAt: new Date().toISOString(), approvedBy: approvedBy })
                            .where(drizzle_orm_1.eq(schema.leaveRequests.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.approveLeaveRequest = approveLeaveRequest;
function rejectLeaveRequest(id, rejectionReason) {
    return __awaiter(this, void 0, Promise, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                    return [4 /*yield*/, db
                            .update(schema.leaveRequests)
                            .set({ status: "rejected", rejectionReason: rejectionReason })
                            .where(drizzle_orm_1.eq(schema.leaveRequests.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.rejectLeaveRequest = rejectLeaveRequest;
function markAttendance(input) {
    return __awaiter(this, void 0, Promise, function () {
        var db, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                    id = uuid_1.v4();
                    return [4 /*yield*/, db.insert(schema.attendance).values({
                            id: id,
                            employeeId: input.employeeId,
                            date: input.date,
                            status: input.status,
                            checkInTime: input.checkInTime || null,
                            checkOutTime: input.checkOutTime || null,
                            notes: input.notes || null,
                            createdAt: new Date().toISOString()
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { id: id, success: true }];
            }
        });
    });
}
exports.markAttendance = markAttendance;
function getAttendanceReport(employeeId, startDate, endDate) {
    return __awaiter(this, void 0, Promise, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                    return [4 /*yield*/, db
                            .select()
                            .from(schema.attendance)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema.attendance.employeeId, employeeId), drizzle_orm_1.gte(schema.attendance.date, startDate), drizzle_orm_1.lte(schema.attendance.date, endDate)))
                            .orderBy(drizzle_orm_1.desc(schema.attendance.date))];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getAttendanceReport = getAttendanceReport;
function createPerformanceReview(input) {
    return __awaiter(this, void 0, Promise, function () {
        var db, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                    id = uuid_1.v4();
                    return [4 /*yield*/, db.insert(schema_extended_1.performanceReviews).values({
                            id: id,
                            employeeId: input.employeeId,
                            reviewerId: input.reviewerId,
                            reviewPeriod: input.reviewPeriod,
                            performanceScore: input.performanceScore,
                            strengths: input.strengths,
                            areasForImprovement: input.areasForImprovement,
                            goals: input.goals,
                            overallRating: input.overallRating,
                            createdAt: new Date().toISOString()
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { id: id, success: true }];
            }
        });
    });
}
exports.createPerformanceReview = createPerformanceReview;
function addEmployeeBenefit(input) {
    return __awaiter(this, void 0, Promise, function () {
        var db, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                    id = uuid_1.v4();
                    return [4 /*yield*/, db.insert(schema_extended_1.employeeBenefits).values({
                            id: id,
                            employeeId: input.employeeId,
                            benefitType: input.benefitType,
                            benefitName: input.benefitName,
                            description: input.description,
                            startDate: input.startDate,
                            endDate: input.endDate || null,
                            value: input.value,
                            isActive: input.isActive,
                            createdAt: new Date().toISOString()
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { id: id, success: true }];
            }
        });
    });
}
exports.addEmployeeBenefit = addEmployeeBenefit;
// ===================== EMPLOYEE CONTRACTS =====================
function createEmployeeContract(input) {
    return __awaiter(this, void 0, Promise, function () {
        var db, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                    id = uuid_1.v4();
                    return [4 /*yield*/, db.update(schema.employees).set({
                            contractStartDate: input.startDate,
                            contractEndDate: input.endDate || null,
                            salary: Math.round(input.salary),
                            position: input.position,
                            department: input.department
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { id: id, success: true }];
            }
        });
    });
}
exports.createEmployeeContract = createEmployeeContract;
function approveSalaryIncrement(input) {
    return __awaiter(this, void 0, Promise, function () {
        var db, id, employee, currentSalary, newSalary;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                    id = uuid_1.v4();
                    return [4 /*yield*/, db.select().from(schema.employees).where(drizzle_orm_1.eq(schema.employees.id, input.employeeId))];
                case 2:
                    employee = _a.sent();
                    if (!employee || employee.length === 0) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
                    }
                    currentSalary = employee[0].salary || 0;
                    newSalary = currentSalary + input.incrementAmount;
                    // Create salary increment record
                    return [4 /*yield*/, db.insert(schema_extended_1.salaryIncrements).values({
                            id: id,
                            employeeId: input.employeeId,
                            effectiveDate: input.effectiveDate,
                            oldSalary: currentSalary,
                            newSalary: newSalary,
                            incrementAmount: input.incrementAmount,
                            incrementPercentage: input.incrementPercentage,
                            reason: input.reason,
                            approvedBy: input.approvedBy,
                            status: "approved",
                            approvedAt: new Date().toISOString(),
                            createdAt: new Date().toISOString()
                        })];
                case 3:
                    // Create salary increment record
                    _a.sent();
                    // Update employee salary
                    return [4 /*yield*/, db.update(schema.employees).set({ salary: newSalary }).where(drizzle_orm_1.eq(schema.employees.id, input.employeeId))];
                case 4:
                    // Update employee salary
                    _a.sent();
                    return [2 /*return*/, { id: id, success: true }];
            }
        });
    });
}
exports.approveSalaryIncrement = approveSalaryIncrement;
function getEmployeePayrollSummary(employeeId, year) {
    return __awaiter(this, void 0, void 0, function () {
        var db, payrollRecords, totalGross, totalDeductions, totalNet, totalTax;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                    return [4 /*yield*/, db
                            .select()
                            .from(schema.payroll)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema.payroll.employeeId, employeeId), drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["YEAR(", ") = ", ""], ["YEAR(", ") = ", ""])), schema.payroll.createdAt, year)))];
                case 2:
                    payrollRecords = _a.sent();
                    totalGross = 0;
                    totalDeductions = 0;
                    totalNet = 0;
                    totalTax = 0;
                    payrollRecords.forEach(function (record) {
                        totalGross += (record.basicSalary || 0) + (record.allowances || 0);
                        totalDeductions += record.deductions || 0;
                        totalTax += record.tax || 0;
                        totalNet += record.netSalary || 0;
                    });
                    return [2 /*return*/, {
                            employeeId: employeeId,
                            year: year,
                            monthsProcessed: payrollRecords.length,
                            totalGross: Math.round(totalGross),
                            totalDeductions: Math.round(totalDeductions),
                            totalTax: Math.round(totalTax),
                            totalNet: Math.round(totalNet),
                            averageMonthly: Math.round(totalNet / (payrollRecords.length || 1))
                        }];
            }
        });
    });
}
exports.getEmployeePayrollSummary = getEmployeePayrollSummary;
var templateObject_1, templateObject_2;
