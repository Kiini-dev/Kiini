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
exports.advancedSchedulingRouter = exports.teamPerformanceRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Define typed procedures
var createProcedure = trpc_1.createFeatureRestrictedProcedure("hr:performance");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("hr:read");
var updateProcedure = trpc_1.createFeatureRestrictedProcedure("hr:performance");
exports.teamPerformanceRouter = trpc_1.router({
    /**
     * Create performance review
     */
    createReview: createProcedure
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        period: zod_1.z.string(),
        overallRating: zod_1.z.number().min(1).max(5),
        performanceScore: zod_1.z.number().min(0).max(100),
        productivity: zod_1.z.number().min(0).max(10),
        collaboration: zod_1.z.number().min(0).max(10),
        communication: zod_1.z.number().min(0).max(10),
        technicalSkills: zod_1.z.number().min(0).max(10),
        leadership: zod_1.z.number().min(0).max(10),
        comments: zod_1.z.string().optional(),
        goals: zod_1.z.string().optional(),
        developmentPlan: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, reviewId, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        reviewId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.performanceReviews).values({
                                id: reviewId,
                                employeeId: input.employeeId,
                                reviewerId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "",
                                period: input.period,
                                overallRating: input.overallRating,
                                performanceScore: input.performanceScore,
                                productivity: input.productivity,
                                collaboration: input.collaboration,
                                communication: input.communication,
                                technicalSkills: input.technicalSkills,
                                leadership: input.leadership,
                                comments: input.comments,
                                goals: input.goals,
                                developmentPlan: input.developmentPlan,
                                status: "completed"
                            })];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, { success: true, reviewId: reviewId }];
                    case 4:
                        error_1 = _c.sent();
                        console.error("[TEAM PERFORMANCE] Error creating review:", error_1);
                        return [2 /*return*/, { success: false, error: String(error_1) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get reviews for employee
     */
    getEmployeeReviews: readProcedure
        .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, reviews, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { reviews: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_1.performanceReviews)
                                .where(drizzle_orm_1.eq(schema_1.performanceReviews.employeeId, input.employeeId))
                                .orderBy(drizzle_orm_1.desc(schema_1.performanceReviews.reviewDate))];
                    case 3:
                        reviews = _b.sent();
                        return [2 /*return*/, { reviews: reviews }];
                    case 4:
                        error_2 = _b.sent();
                        console.error("[TEAM PERFORMANCE] Error:", error_2);
                        return [2 /*return*/, { reviews: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Add skill to employee
     */
    addSkill: createProcedure
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        skillName: zod_1.z.string(),
        proficiencyLevel: zod_1.z["enum"](['beginner', 'intermediate', 'advanced', 'expert']),
        yearsOfExperience: zod_1.z.number(),
        certifications: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, skillId, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        skillId = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.skillsMatrix).values({
                                id: skillId,
                                employeeId: input.employeeId,
                                skillName: input.skillName,
                                proficiencyLevel: input.proficiencyLevel,
                                yearsOfExperience: input.yearsOfExperience,
                                certifications: input.certifications
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true, skillId: skillId }];
                    case 4:
                        error_3 = _b.sent();
                        return [2 /*return*/, { success: false, error: String(error_3) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get skill matrix for employee
     */
    getEmployeeSkills: readProcedure
        .input(zod_1.z.object({ employeeId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, skills, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { skills: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_1.skillsMatrix)
                                .where(drizzle_orm_1.eq(schema_1.skillsMatrix.employeeId, input.employeeId))];
                    case 3:
                        skills = _b.sent();
                        return [2 /*return*/, { skills: skills }];
                    case 4:
                        error_4 = _b.sent();
                        return [2 /*return*/, { skills: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get team performance dashboard
     */
    getTeamDashboard: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, emps, _b, dashboard, _i, emps_1, emp, latestReview, skills, error_5;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            return [2 /*return*/, { team: [] }];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 12, , 13]);
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.select().from(schema_1.employees).where(drizzle_orm_1.eq(schema_1.employees.organizationId, orgId)).limit(50)];
                    case 3:
                        _b = _d.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, db.select().from(schema_1.employees).limit(50)];
                    case 5:
                        _b = _d.sent();
                        _d.label = 6;
                    case 6:
                        emps = _b;
                        dashboard = [];
                        _i = 0, emps_1 = emps;
                        _d.label = 7;
                    case 7:
                        if (!(_i < emps_1.length)) return [3 /*break*/, 11];
                        emp = emps_1[_i];
                        return [4 /*yield*/, db.select().from(schema_1.performanceReviews)
                                .where(drizzle_orm_1.eq(schema_1.performanceReviews.employeeId, emp.id))
                                .orderBy(drizzle_orm_1.desc(schema_1.performanceReviews.reviewDate))
                                .limit(1)];
                    case 8:
                        latestReview = (_d.sent())[0];
                        return [4 /*yield*/, db.select().from(schema_1.skillsMatrix)
                                .where(drizzle_orm_1.eq(schema_1.skillsMatrix.employeeId, emp.id))];
                    case 9:
                        skills = _d.sent();
                        dashboard.push(__assign(__assign({}, emp), { latestReview: latestReview || null, skillCount: skills.length }));
                        _d.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 7];
                    case 11: return [2 /*return*/, { team: dashboard }];
                    case 12:
                        error_5 = _d.sent();
                        return [2 /*return*/, { team: [] }];
                    case 13: return [2 /*return*/];
                }
            });
        });
    })
});
exports.advancedSchedulingRouter = trpc_1.router({
    /**
     * Create schedule/task
     */
    createSchedule: createProcedure
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        taskTitle: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        priority: zod_1.z["enum"](['low', 'medium', 'high', 'urgent']),
        projectId: zod_1.z.string().optional(),
        recurrencePattern: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, scheduleId, duration, error_6;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        scheduleId = uuid_1.v4();
                        duration = new Date(input.endDate).getTime() - new Date(input.startDate).getTime();
                        return [4 /*yield*/, db.insert(schema_1.schedules).values({
                                id: scheduleId,
                                employeeId: input.employeeId,
                                taskTitle: input.taskTitle,
                                description: input.description,
                                startDate: input.startDate,
                                endDate: input.endDate,
                                duration: Math.ceil(duration / (1000 * 60 * 60)),
                                priority: input.priority,
                                projectId: input.projectId,
                                recurrencePattern: input.recurrencePattern,
                                assignedTo: (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id,
                                status: 'scheduled'
                            })];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, { success: true, scheduleId: scheduleId }];
                    case 4:
                        error_6 = _c.sent();
                        return [2 /*return*/, { success: false, error: String(error_6) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get team calendar
     */
    getTeamCalendar: readProcedure
        .input(zod_1.z.object({ startDate: zod_1.z.string(), endDate: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, events, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { events: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_1.schedules)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.schedules.startDate, input.startDate), drizzle_orm_1.lte(schema_1.schedules.endDate, input.endDate)))];
                    case 3:
                        events = _b.sent();
                        return [2 /*return*/, { events: events }];
                    case 4:
                        error_7 = _b.sent();
                        return [2 /*return*/, { events: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Request vacation
     */
    requestVacation: createProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        vacationType: zod_1.z["enum"](['vacation', 'sick_leave', 'personal', 'sabbatical']),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, requestId, daysRequested, error_8;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        requestId = uuid_1.v4();
                        daysRequested = Math.ceil((new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / (1000 * 60 * 60 * 24));
                        return [4 /*yield*/, db.insert(schema_1.vacationRequests).values({
                                id: requestId,
                                employeeId: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || "",
                                startDate: input.startDate,
                                endDate: input.endDate,
                                daysRequested: daysRequested,
                                vacationType: input.vacationType,
                                reason: input.reason,
                                status: 'pending'
                            })];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, { success: true, requestId: requestId }];
                    case 4:
                        error_8 = _c.sent();
                        return [2 /*return*/, { success: false, error: String(error_8) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get vacation requests (for manager)
     */
    getVacationRequests: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, allRequests, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { requests: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.select().from(schema_1.vacationRequests)
                                .where(drizzle_orm_1.eq(schema_1.vacationRequests.status, "pending"))
                                .orderBy(drizzle_orm_1.desc(schema_1.vacationRequests.createdAt))];
                    case 3:
                        allRequests = _b.sent();
                        return [2 /*return*/, { requests: allRequests }];
                    case 4:
                        error_9 = _b.sent();
                        return [2 /*return*/, { requests: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Approve/reject vacation
     */
    approveVacation: updateProcedure
        .input(zod_1.z.object({
        requestId: zod_1.z.string(),
        approved: zod_1.z.boolean(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_10;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { success: false }];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.update(schema_1.vacationRequests)
                                .set({
                                status: input.approved ? 'approved' : 'rejected',
                                approvedBy: (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id,
                                approvalDate: new Date().toISOString().slice(0, 19).replace("T", " "),
                                notes: input.notes
                            })
                                .where(drizzle_orm_1.eq(schema_1.vacationRequests.id, input.requestId))];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_10 = _c.sent();
                        return [2 /*return*/, { success: false, error: String(error_10) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get team utilization
     */
    getTeamUtilization: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, emps, _b, utilization, _i, emps_2, emp, empSchedules, totalHours, utilizationRate, error_11;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            return [2 /*return*/, { team: [] }];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 11, , 12]);
                        orgId = (_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId;
                        if (!orgId) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.select().from(schema_1.employees).where(drizzle_orm_1.eq(schema_1.employees.organizationId, orgId)).limit(50)];
                    case 3:
                        _b = _d.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, db.select().from(schema_1.employees).limit(50)];
                    case 5:
                        _b = _d.sent();
                        _d.label = 6;
                    case 6:
                        emps = _b;
                        utilization = [];
                        _i = 0, emps_2 = emps;
                        _d.label = 7;
                    case 7:
                        if (!(_i < emps_2.length)) return [3 /*break*/, 10];
                        emp = emps_2[_i];
                        return [4 /*yield*/, db.select().from(schema_1.schedules)
                                .where(drizzle_orm_1.eq(schema_1.schedules.employeeId, emp.id))];
                    case 8:
                        empSchedules = _d.sent();
                        totalHours = empSchedules.reduce(function (sum, s) { return sum + (s.duration || 0); }, 0);
                        utilizationRate = totalHours > 0 ? Math.min(100, Math.round((totalHours / 160) * 100)) : 0;
                        utilization.push({
                            employeeId: emp.id,
                            employeeName: emp.firstName + " " + emp.lastName,
                            totalHours: totalHours,
                            utilizationRate: utilizationRate,
                            status: utilizationRate < 50 ? 'underutilized' : utilizationRate > 100 ? 'overbooked' : 'optimal'
                        });
                        _d.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 7];
                    case 10: return [2 /*return*/, { team: utilization }];
                    case 11:
                        error_11 = _d.sent();
                        return [2 /*return*/, { team: [] }];
                    case 12: return [2 /*return*/];
                }
            });
        });
    })
});
