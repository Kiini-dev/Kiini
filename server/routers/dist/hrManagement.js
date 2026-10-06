"use strict";
/**
 * Comprehensive HR Router
 * Integrates payroll, leave, attendance, performance reviews, benefits, and contracts
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
exports.hrManagementRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var hrManagementService_1 = require("../services/hrManagementService");
var db_1 = require("../db");
var server_1 = require("@trpc/server");
var schema = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var hrView = trpc_1.createFeatureRestrictedProcedure("hr:view");
var hrEdit = trpc_1.createFeatureRestrictedProcedure("hr:edit");
exports.hrManagementRouter = trpc_1.router({
    // ==================== PAYROLL ====================
    payroll: trpc_1.router({
        processMonthly: hrEdit
            .input(zod_1.z.object({
            month: zod_1.z.string(),
            employeeIds: zod_1.z.array(zod_1.z.string()).optional(),
            dryRun: zod_1.z.boolean()["default"](false),
            approvalRequired: zod_1.z.boolean()["default"](false)
        }))
            .mutation(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var result, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, hrManagementService_1.processMonthlyPayroll({
                                    month: input.month,
                                    employeeIds: input.employeeIds,
                                    dryRun: input.dryRun,
                                    approvalRequired: input.approvalRequired
                                })];
                        case 1:
                            result = _b.sent();
                            return [2 /*return*/, { success: true, data: result }];
                        case 2:
                            error_1 = _b.sent();
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error_1.message
                            });
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }),
        getSummary: hrView
            .input(zod_1.z.object({ employeeId: zod_1.z.string(), year: zod_1.z.number() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, hrManagementService_1.getEmployeePayrollSummary(input.employeeId, input.year)];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            error_2 = _b.sent();
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error_2.message
                            });
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }),
        getMonthly: hrView
            .input(zod_1.z.object({ employeeId: zod_1.z.string(), month: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, record;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                            return [4 /*yield*/, db
                                    .select()
                                    .from(schema.payroll)
                                    .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema.payroll.employeeId, input.employeeId), drizzle_orm_1.eq(schema.payroll.month, input.month)))
                                    .limit(1)];
                        case 2:
                            record = _b.sent();
                            return [2 /*return*/, record[0] || null];
                    }
                });
            });
        }),
        list: hrView
            .input(zod_1.z.object({ month: zod_1.z.string().optional(), limit: zod_1.z.number()["default"](100) }))
            .query(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, query;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                            query = db.select().from(schema.payroll);
                            if (input.month) {
                                query = query.where(drizzle_orm_1.eq(schema.payroll.month, input.month));
                            }
                            return [2 /*return*/, query.limit(input.limit)];
                    }
                });
            });
        })
    }),
    // ==================== LEAVE MANAGEMENT ====================
    leave: trpc_1.router({
        request: trpc_1.protectedProcedure
            .input(zod_1.z.object({
            leaveType: zod_1.z["enum"](["annual", "sick", "maternity", "paternity", "unpaid", "other"]),
            startDate: zod_1.z.string(),
            endDate: zod_1.z.string(),
            reason: zod_1.z.string()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, hrManagementService_1.requestLeave({
                                    employeeId: ctx.user.id,
                                    leaveType: input.leaveType,
                                    startDate: input.startDate,
                                    endDate: input.endDate,
                                    reason: input.reason
                                })];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            error_3 = _b.sent();
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error_3.message
                            });
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }),
        approve: hrEdit
            .input(zod_1.z.object({ id: zod_1.z.string() }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var error_4;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, hrManagementService_1.approveLeaveRequest(input.id, ctx.user.id)];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            error_4 = _b.sent();
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error_4.message
                            });
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }),
        reject: hrEdit
            .input(zod_1.z.object({ id: zod_1.z.string(), reason: zod_1.z.string() }))
            .mutation(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var error_5;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, hrManagementService_1.rejectLeaveRequest(input.id, input.reason)];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            error_5 = _b.sent();
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error_5.message
                            });
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }),
        list: hrView
            .input(zod_1.z.object({
            status: zod_1.z["enum"](["pending", "approved", "rejected"]).optional(),
            employeeId: zod_1.z.string().optional()
        }))
            .query(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, query;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                            query = db.select().from(schema.leaveRequests);
                            if (input.status) {
                                query = query.where(drizzle_orm_1.eq(schema.leaveRequests.status, input.status));
                            }
                            if (input.employeeId) {
                                query = query.where(drizzle_orm_1.eq(schema.leaveRequests.employeeId, input.employeeId));
                            }
                            return [2 /*return*/, query];
                    }
                });
            });
        })
    }),
    // ==================== ATTENDANCE ====================
    attendance: trpc_1.router({
        mark: trpc_1.protectedProcedure
            .input(zod_1.z.object({
            date: zod_1.z.string(),
            status: zod_1.z["enum"](["present", "absent", "late", "leave"]),
            checkInTime: zod_1.z.string().optional(),
            checkOutTime: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var error_6;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, hrManagementService_1.markAttendance({
                                    employeeId: ctx.user.id,
                                    date: input.date,
                                    status: input.status,
                                    checkInTime: input.checkInTime,
                                    checkOutTime: input.checkOutTime,
                                    notes: input.notes
                                })];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            error_6 = _b.sent();
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error_6.message
                            });
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }),
        bulkMark: hrEdit
            .input(zod_1.z.object({
            records: zod_1.z.array(zod_1.z.object({
                employeeId: zod_1.z.string(),
                date: zod_1.z.string(),
                status: zod_1.z["enum"](["present", "absent", "late", "leave"]),
                checkInTime: zod_1.z.string().optional(),
                checkOutTime: zod_1.z.string().optional()
            }))
        }))
            .mutation(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var marked, _i, _b, record, error_7;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 5, , 6]);
                            marked = 0;
                            _i = 0, _b = input.records;
                            _c.label = 1;
                        case 1:
                            if (!(_i < _b.length)) return [3 /*break*/, 4];
                            record = _b[_i];
                            return [4 /*yield*/, hrManagementService_1.markAttendance({
                                    employeeId: record.employeeId,
                                    date: record.date,
                                    status: record.status,
                                    checkInTime: record.checkInTime,
                                    checkOutTime: record.checkOutTime
                                })];
                        case 2:
                            _c.sent();
                            marked++;
                            _c.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, { success: true, marked: marked }];
                        case 5:
                            error_7 = _c.sent();
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error_7.message
                            });
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }),
        getReport: hrView
            .input(zod_1.z.object({
            employeeId: zod_1.z.string(),
            startDate: zod_1.z.string(),
            endDate: zod_1.z.string()
        }))
            .query(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var error_8;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, hrManagementService_1.getAttendanceReport(input.employeeId, input.startDate, input.endDate)];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            error_8 = _b.sent();
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error_8.message
                            });
                        case 3: return [2 /*return*/];
                    }
                });
            });
        })
    }),
    // ==================== PERFORMANCE REVIEWS ====================
    performanceReviews: trpc_1.router({
        create: hrEdit
            .input(zod_1.z.object({
            employeeId: zod_1.z.string(),
            reviewPeriod: zod_1.z.string(),
            performanceScore: zod_1.z.number().min(0).max(100),
            strengths: zod_1.z.string(),
            areasForImprovement: zod_1.z.string(),
            goals: zod_1.z.string(),
            overallRating: zod_1.z["enum"](["exceeds", "meets", "needs_improvement", "unsatisfactory"])
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var error_9;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, hrManagementService_1.createPerformanceReview({
                                    employeeId: input.employeeId,
                                    reviewerId: ctx.user.id,
                                    reviewPeriod: input.reviewPeriod,
                                    performanceScore: input.performanceScore,
                                    strengths: input.strengths,
                                    areasForImprovement: input.areasForImprovement,
                                    goals: input.goals,
                                    overallRating: input.overallRating
                                })];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            error_9 = _b.sent();
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error_9.message
                            });
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }),
        list: hrView
            .input(zod_1.z.object({ employeeId: zod_1.z.string().optional(), year: zod_1.z.number().optional() }))
            .query(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db, query;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                            query = db.select().from(schema.performanceReviews);
                            if (input.employeeId) {
                                query = query.where(drizzle_orm_1.eq(schema.performanceReviews.employeeId, input.employeeId));
                            }
                            return [2 /*return*/, query];
                    }
                });
            });
        })
    }),
    // ==================== BENEFITS ====================
    benefits: trpc_1.router({
        add: hrEdit
            .input(zod_1.z.object({
            employeeId: zod_1.z.string(),
            benefitType: zod_1.z.string(),
            benefitName: zod_1.z.string(),
            description: zod_1.z.string(),
            startDate: zod_1.z.string(),
            endDate: zod_1.z.string().optional(),
            value: zod_1.z.number(),
            isActive: zod_1.z.boolean()["default"](true)
        }))
            .mutation(function (_a) {
            var input = _a.input;
            return __awaiter(void 0, void 0, void 0, function () {
                var error_10;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, hrManagementService_1.addEmployeeBenefit({
                                    employeeId: input.employeeId,
                                    benefitType: input.benefitType,
                                    benefitName: input.benefitName,
                                    description: input.description,
                                    startDate: input.startDate,
                                    endDate: input.endDate,
                                    value: input.value,
                                    isActive: input.isActive
                                })];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            error_10 = _b.sent();
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error_10.message
                            });
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }),
        list: hrView
            .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
            .query(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var db;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            db = _b.sent();
                            if (!db)
                                throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                            return [2 /*return*/, db.select().from(schema.employeeBenefits).where(drizzle_orm_1.eq(schema.employeeBenefits.employeeId, input.employeeId))];
                    }
                });
            });
        })
    }),
    // ==================== SALARY INCREMENTS ====================
    salaryIncrements: trpc_1.router({
        approve: hrEdit
            .input(zod_1.z.object({
            employeeId: zod_1.z.string(),
            effectiveDate: zod_1.z.string(),
            incrementAmount: zod_1.z.number(),
            incrementPercentage: zod_1.z.number(),
            reason: zod_1.z.string()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var error_11;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, hrManagementService_1.approveSalaryIncrement({
                                    employeeId: input.employeeId,
                                    effectiveDate: input.effectiveDate,
                                    incrementAmount: input.incrementAmount,
                                    incrementPercentage: input.incrementPercentage,
                                    reason: input.reason,
                                    approvedBy: ctx.user.id
                                })];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            error_11 = _b.sent();
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error_11.message
                            });
                        case 3: return [2 /*return*/];
                    }
                });
            });
        })
    })
});
