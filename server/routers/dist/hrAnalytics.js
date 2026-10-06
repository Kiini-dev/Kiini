"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.hrAnalyticsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Feature-based procedures
var hrReadProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("hr:analytics");
exports.hrAnalyticsRouter = trpc_1.router({
    /**
     * Get employee headcount trends over time
     */
    getHeadcountTrends: hrReadProcedure
        .input(zod_1.z.object({
        months: zod_1.z.number()["default"](12)
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, allEmployees, numMonths, now, months, _loop_1, i, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database.select({
                                hireDate: schema_1.employees.hireDate,
                                status: schema_1.employees.status
                            }).from(schema_1.employees)];
                    case 3:
                        allEmployees = _b.sent();
                        numMonths = (input === null || input === void 0 ? void 0 : input.months) || 12;
                        now = new Date();
                        months = [];
                        _loop_1 = function (i) {
                            var date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                            var monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
                            var monthKey = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, '0');
                            var headcount = allEmployees.filter(function (e) {
                                var hd = new Date(e.hireDate);
                                return hd <= monthEnd;
                            }).length;
                            var newHires = allEmployees.filter(function (e) {
                                var hd = new Date(e.hireDate);
                                return hd >= date && hd <= monthEnd;
                            }).length;
                            months.push({ month: monthKey, headcount: headcount, newHires: newHires });
                        };
                        for (i = numMonths - 1; i >= 0; i--) {
                            _loop_1(i);
                        }
                        return [2 /*return*/, months];
                    case 4:
                        error_1 = _b.sent();
                        console.error("Error fetching headcount trends:", error_1);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get salary distribution by department
     */
    getSalaryDistribution: hrReadProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, allEmployees, deptMap, _i, allEmployees_1, emp, dept, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, database.select({
                            department: schema_1.employees.department,
                            salary: schema_1.employees.salary
                        }).from(schema_1.employees)];
                case 3:
                    allEmployees = _a.sent();
                    deptMap = {};
                    for (_i = 0, allEmployees_1 = allEmployees; _i < allEmployees_1.length; _i++) {
                        emp = allEmployees_1[_i];
                        dept = emp.department || "Unassigned";
                        if (!deptMap[dept])
                            deptMap[dept] = [];
                        if (emp.salary)
                            deptMap[dept].push(emp.salary);
                    }
                    return [2 /*return*/, Object.entries(deptMap).map(function (_a) {
                            var dept = _a[0], salaries = _a[1];
                            var avg = salaries.length > 0 ? Math.round(salaries.reduce(function (a, b) { return a + b; }, 0) / salaries.length) : 0;
                            return {
                                department: dept,
                                avgSalary: avg,
                                minSalary: salaries.length > 0 ? Math.min.apply(Math, salaries) : 0,
                                maxSalary: salaries.length > 0 ? Math.max.apply(Math, salaries) : 0,
                                employeeCount: salaries.length
                            };
                        })];
                case 4:
                    error_2 = _a.sent();
                    console.error("Error fetching salary distribution:", error_2);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get turnover analysis and trends
     */
    getTurnoverAnalysis: hrReadProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, allEmployees, total, active, onLeave, terminated, suspended, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, { totalEmployees: 0, active: 0, inactive: 0, onLeave: 0, terminated: 0, turnoverRate: 0 }];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, database.select({
                            status: schema_1.employees.status
                        }).from(schema_1.employees)];
                case 3:
                    allEmployees = _a.sent();
                    total = allEmployees.length;
                    active = allEmployees.filter(function (e) { return e.status === 'active'; }).length;
                    onLeave = allEmployees.filter(function (e) { return e.status === 'on_leave'; }).length;
                    terminated = allEmployees.filter(function (e) { return e.status === 'terminated'; }).length;
                    suspended = allEmployees.filter(function (e) { return e.status === 'suspended'; }).length;
                    return [2 /*return*/, {
                            totalEmployees: total,
                            active: active,
                            inactive: suspended,
                            onLeave: onLeave,
                            terminated: terminated,
                            turnoverRate: total > 0 ? (terminated / total) * 100 : 0
                        }];
                case 4:
                    error_3 = _a.sent();
                    console.error("Error fetching turnover analysis:", error_3);
                    return [2 /*return*/, { totalEmployees: 0, active: 0, inactive: 0, onLeave: 0, terminated: 0, turnoverRate: 0 }];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get attendance patterns and KPIs
     */
    getAttendanceKPIs: hrReadProcedure
        .input(zod_1.z.object({
        months: zod_1.z.number()["default"](3)
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, monthsAgo, attendanceRecords, total, present, absent, late, halfDay, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, { present: 0, absent: 0, late: 0, halfDay: 0, total: 0, presentPercentage: 0, absentPercentage: 0, latePercentage: 0 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        monthsAgo = new Date();
                        monthsAgo.setMonth(monthsAgo.getMonth() - ((input === null || input === void 0 ? void 0 : input.months) || 3));
                        return [4 /*yield*/, database.select({
                                status: schema_1.attendance.status
                            }).from(schema_1.attendance).where(drizzle_orm_1.gte(schema_1.attendance.attendanceDate, monthsAgo.toISOString().replace('T', ' ').substring(0, 19)))];
                    case 3:
                        attendanceRecords = _b.sent();
                        total = attendanceRecords.length;
                        present = attendanceRecords.filter(function (a) { return a.status === 'present'; }).length;
                        absent = attendanceRecords.filter(function (a) { return a.status === 'absent'; }).length;
                        late = attendanceRecords.filter(function (a) { return a.status === 'late'; }).length;
                        halfDay = attendanceRecords.filter(function (a) { return a.status === 'half_day'; }).length;
                        return [2 /*return*/, {
                                present: present,
                                absent: absent,
                                late: late,
                                halfDay: halfDay,
                                total: total,
                                presentPercentage: total > 0 ? (present / total) * 100 : 0,
                                absentPercentage: total > 0 ? (absent / total) * 100 : 0,
                                latePercentage: total > 0 ? (late / total) * 100 : 0
                            }];
                    case 4:
                        error_4 = _b.sent();
                        console.error("Error fetching attendance KPIs:", error_4);
                        return [2 /*return*/, { present: 0, absent: 0, late: 0, halfDay: 0, total: 0, presentPercentage: 0, absentPercentage: 0, latePercentage: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get leave utilization statistics
     */
    getLeaveUtilization: hrReadProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, allLeaves, typeMap, _i, allLeaves_1, leave, type, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, database.select({
                            leaveType: schema_1.leaveRequests.leaveType,
                            numberOfDays: schema_1.leaveRequests.days,
                            status: schema_1.leaveRequests.status
                        }).from(schema_1.leaveRequests).where(drizzle_orm_1.eq(schema_1.leaveRequests.status, 'approved'))];
                case 3:
                    allLeaves = _a.sent();
                    typeMap = {};
                    for (_i = 0, allLeaves_1 = allLeaves; _i < allLeaves_1.length; _i++) {
                        leave = allLeaves_1[_i];
                        type = leave.leaveType || "Unknown";
                        if (!typeMap[type])
                            typeMap[type] = [];
                        typeMap[type].push(leave.numberOfDays || 1);
                    }
                    return [2 /*return*/, Object.entries(typeMap).map(function (_a) {
                            var type = _a[0], days = _a[1];
                            return ({
                                type: type,
                                count: days.length,
                                totalDays: days.reduce(function (a, b) { return a + b; }, 0),
                                avgDuration: Math.round(days.reduce(function (a, b) { return a + b; }, 0) / days.length)
                            });
                        })];
                case 4:
                    error_5 = _a.sent();
                    console.error("Error fetching leave utilization:", error_5);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get department-wise analytics
     */
    getDepartmentAnalytics: hrReadProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, allEmployees, deptMap, _i, allEmployees_2, emp, dept, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, database.select({
                            department: schema_1.employees.department,
                            salary: schema_1.employees.salary
                        }).from(schema_1.employees)];
                case 3:
                    allEmployees = _a.sent();
                    deptMap = {};
                    for (_i = 0, allEmployees_2 = allEmployees; _i < allEmployees_2.length; _i++) {
                        emp = allEmployees_2[_i];
                        dept = emp.department || "Unassigned";
                        if (!deptMap[dept])
                            deptMap[dept] = { salaries: [] };
                        if (emp.salary)
                            deptMap[dept].salaries.push(emp.salary);
                    }
                    return [2 /*return*/, Object.entries(deptMap).map(function (_a) {
                            var name = _a[0], data = _a[1];
                            return ({
                                id: name,
                                name: name,
                                employees: data.salaries.length,
                                avgSalary: data.salaries.length > 0
                                    ? Math.round(data.salaries.reduce(function (a, b) { return a + b; }, 0) / data.salaries.length)
                                    : 0
                            });
                        })];
                case 4:
                    error_6 = _a.sent();
                    console.error("Error fetching department analytics:", error_6);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get employee performance metrics
     */
    getPerformanceMetrics: hrReadProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, totalResult, lastMonth, attendanceRecords, totalRecords, presentCount, avgPresenceRate, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, { totalEmployees: 0, avgPresenceRate: 0, highPerformers: 0, needsImprovement: 0 }];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, database
                            .select({ totalCount: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(", ")"], ["count(", ")"])), schema_1.employees.id) })
                            .from(schema_1.employees)];
                case 3:
                    totalResult = (_a.sent())[0];
                    lastMonth = new Date();
                    lastMonth.setMonth(lastMonth.getMonth() - 1);
                    return [4 /*yield*/, database.select({
                            status: schema_1.attendance.status
                        }).from(schema_1.attendance).where(drizzle_orm_1.gte(schema_1.attendance.attendanceDate, lastMonth.toISOString().replace('T', ' ').substring(0, 19)))];
                case 4:
                    attendanceRecords = _a.sent();
                    totalRecords = attendanceRecords.length;
                    presentCount = attendanceRecords.filter(function (a) { return a.status === 'present'; }).length;
                    avgPresenceRate = totalRecords > 0 ? presentCount / totalRecords : 0;
                    return [2 /*return*/, {
                            totalEmployees: (totalResult === null || totalResult === void 0 ? void 0 : totalResult.totalCount) || 0,
                            avgPresenceRate: avgPresenceRate,
                            highPerformers: 0,
                            needsImprovement: 0
                        }];
                case 5:
                    error_7 = _a.sent();
                    console.error("Error fetching performance metrics:", error_7);
                    return [2 /*return*/, { totalEmployees: 0, avgPresenceRate: 0, highPerformers: 0, needsImprovement: 0 }];
                case 6: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get salary expense trends
     */
    getSalaryExpenseTrends: hrReadProcedure
        .input(zod_1.z.object({
        months: zod_1.z.number()["default"](12)
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, allPayroll, numMonths, now, months, _loop_2, i, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database.select({
                                basicSalary: schema_1.payroll.basicSalary,
                                netSalary: schema_1.payroll.netSalary,
                                employeeId: schema_1.payroll.employeeId,
                                paymentDate: schema_1.payroll.paymentDate,
                                payPeriodStart: schema_1.payroll.payPeriodStart
                            }).from(schema_1.payroll)];
                    case 3:
                        allPayroll = _b.sent();
                        numMonths = (input === null || input === void 0 ? void 0 : input.months) || 12;
                        now = new Date();
                        months = [];
                        _loop_2 = function (i) {
                            var date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                            var monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
                            var monthKey = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, '0');
                            var monthRecords = allPayroll.filter(function (p) {
                                var pd = new Date(p.paymentDate || p.payPeriodStart);
                                return pd >= date && pd <= monthEnd;
                            });
                            var totalCost = monthRecords.reduce(function (sum, p) { return sum + (p.netSalary || p.basicSalary || 0); }, 0);
                            var uniqueEmployees = new Set(monthRecords.map(function (p) { return p.employeeId; }));
                            months.push({ month: monthKey, totalCost: totalCost, employeeCount: uniqueEmployees.size });
                        };
                        for (i = numMonths - 1; i >= 0; i--) {
                            _loop_2(i);
                        }
                        return [2 /*return*/, months];
                    case 4:
                        error_8 = _b.sent();
                        console.error("Error fetching salary expense trends:", error_8);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get attendance patterns (by day of week) — alias mirrors getAttendanceKPIs
     * Returns day-of-week breakdown and monthly trend data for dashboard charts.
     */
    getAttendancePatterns: hrReadProcedure
        .input(zod_1.z.object({
        months: zod_1.z.number()["default"](3)
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, monthsAgo, dateStr, records, total, present, absent, late, halfDay, days, dayMap_1, _i, days_1, day, _b, records_1, r, d, dayName, byDayOfWeek, monthlyMap, _c, records_2, r, d, key, monthly, error_9;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            return [2 /*return*/, { byDayOfWeek: [], monthly: [], kpis: { present: 0, absent: 0, late: 0, halfDay: 0, total: 0, presentPercentage: 0, absentPercentage: 0, latePercentage: 0 } }];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        monthsAgo = new Date();
                        monthsAgo.setMonth(monthsAgo.getMonth() - ((input === null || input === void 0 ? void 0 : input.months) || 3));
                        dateStr = monthsAgo.toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.select({
                                status: schema_1.attendance.status,
                                attendanceDate: schema_1.attendance.attendanceDate
                            }).from(schema_1.attendance).where(drizzle_orm_1.gte(schema_1.attendance.attendanceDate, dateStr))];
                    case 3:
                        records = _d.sent();
                        total = records.length;
                        present = records.filter(function (a) { return a.status === 'present'; }).length;
                        absent = records.filter(function (a) { return a.status === 'absent'; }).length;
                        late = records.filter(function (a) { return a.status === 'late'; }).length;
                        halfDay = records.filter(function (a) { return a.status === 'half_day'; }).length;
                        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        dayMap_1 = {};
                        for (_i = 0, days_1 = days; _i < days_1.length; _i++) {
                            day = days_1[_i];
                            dayMap_1[day] = { present: 0, absent: 0, late: 0 };
                        }
                        for (_b = 0, records_1 = records; _b < records_1.length; _b++) {
                            r = records_1[_b];
                            d = new Date(r.attendanceDate);
                            if (!isNaN(d.getTime())) {
                                dayName = days[d.getDay()];
                                if (r.status === 'present')
                                    dayMap_1[dayName].present++;
                                else if (r.status === 'absent')
                                    dayMap_1[dayName].absent++;
                                else if (r.status === 'late')
                                    dayMap_1[dayName].late++;
                            }
                        }
                        byDayOfWeek = days.map(function (day) { return (__assign({ day: day }, dayMap_1[day])); });
                        monthlyMap = {};
                        for (_c = 0, records_2 = records; _c < records_2.length; _c++) {
                            r = records_2[_c];
                            d = new Date(r.attendanceDate);
                            if (!isNaN(d.getTime())) {
                                key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0');
                                if (!monthlyMap[key])
                                    monthlyMap[key] = { present: 0, absent: 0, late: 0 };
                                if (r.status === 'present')
                                    monthlyMap[key].present++;
                                else if (r.status === 'absent')
                                    monthlyMap[key].absent++;
                                else if (r.status === 'late')
                                    monthlyMap[key].late++;
                            }
                        }
                        monthly = Object.entries(monthlyMap).sort(function (a, b) { return a[0].localeCompare(b[0]); }).map(function (_a) {
                            var month = _a[0], data = _a[1];
                            return (__assign({ month: month }, data));
                        });
                        return [2 /*return*/, {
                                byDayOfWeek: byDayOfWeek,
                                monthly: monthly,
                                kpis: {
                                    present: present, absent: absent, late: late, halfDay: halfDay, total: total,
                                    presentPercentage: total > 0 ? (present / total) * 100 : 0,
                                    absentPercentage: total > 0 ? (absent / total) * 100 : 0,
                                    latePercentage: total > 0 ? (late / total) * 100 : 0
                                }
                            }];
                    case 4:
                        error_9 = _d.sent();
                        console.error("Error fetching attendance patterns:", error_9);
                        return [2 /*return*/, { byDayOfWeek: [], monthly: [], kpis: { present: 0, absent: 0, late: 0, halfDay: 0, total: 0, presentPercentage: 0, absentPercentage: 0, latePercentage: 0 } }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1;
