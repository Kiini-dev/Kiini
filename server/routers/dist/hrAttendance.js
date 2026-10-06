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
exports.hrAttendanceRouter = void 0;
var trpc_1 = require("../_core/trpc");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var zod_1 = require("zod");
var uuid_1 = require("uuid");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var recordAttendanceSchema = zod_1.z.object({
    organizationId: zod_1.z.string(),
    employeeId: zod_1.z.string(),
    date: zod_1.z.string(),
    checkInTime: zod_1.z.string(),
    checkOutTime: zod_1.z.string().optional(),
    status: zod_1.z["enum"](['present', 'absent', 'late', 'half_day', 'work_from_home', 'on_leave'])["default"]('present'),
    remarks: zod_1.z.string().optional()
});
var approveAttendanceSchema = zod_1.z.object({
    attendanceId: zod_1.z.string(),
    approverId: zod_1.z.string(),
    approvalStatus: zod_1.z["enum"](['approved', 'rejected']),
    approvalComments: zod_1.z.string().optional()
});
var bulkRecordAttendanceSchema = zod_1.z.object({
    organizationId: zod_1.z.string(),
    date: zod_1.z.string(),
    records: zod_1.z.array(zod_1.z.object({
        employeeId: zod_1.z.string(),
        checkInTime: zod_1.z.string(),
        checkOutTime: zod_1.z.string().optional(),
        status: zod_1.z["enum"](['present', 'absent', 'late', 'half_day', 'work_from_home', 'on_leave'])
    }))
});
exports.hrAttendanceRouter = trpc_1.router({
    // Record attendance
    recordAttendance: enhancedRbac_1.createFeatureRestrictedProcedure(['attendance:manage', 'admin:all', 'hr:manage'])
        .input(recordAttendanceSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, existing, attendanceId, checkInDate, workingHours, checkOutDate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()
                        // Check if attendance already recorded for this date
                    ];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.query.attendance.findFirst({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.employeeId, input.employeeId), drizzle_orm_1.eq(schema_1.attendance.date, input.date))
                            })];
                    case 2:
                        existing = _b.sent();
                        if (!existing) return [3 /*break*/, 4];
                        // Update existing
                        return [4 /*yield*/, db.update(schema_1.attendance)
                                .set({
                                checkInTime: input.checkInTime,
                                checkOutTime: input.checkOutTime,
                                status: input.status,
                                remarks: input.remarks,
                                updatedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.attendance.id, existing.id))];
                    case 3:
                        // Update existing
                        _b.sent();
                        return [2 /*return*/, { attendanceId: existing.id, created: false }];
                    case 4:
                        attendanceId = uuid_1.v4();
                        checkInDate = new Date(input.date + "T" + input.checkInTime + ":00");
                        workingHours = 0;
                        if (input.checkOutTime) {
                            checkOutDate = new Date(input.date + "T" + input.checkOutTime + ":00");
                            workingHours = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
                        }
                        return [4 /*yield*/, db.insert(schema_1.attendance).values({
                                id: attendanceId,
                                organizationId: input.organizationId,
                                employeeId: input.employeeId,
                                date: input.date,
                                checkInTime: input.checkInTime,
                                checkOutTime: input.checkOutTime || null,
                                workingHours: workingHours > 0 ? workingHours : null,
                                status: input.status,
                                remarks: input.remarks,
                                approvalStatus: 'pending',
                                createdAt: new Date().toISOString(),
                                createdBy: ctx.user.id
                            })
                            // Create approval workflow
                        ];
                    case 5:
                        _b.sent();
                        // Create approval workflow
                        return [4 /*yield*/, db.insert(schema_1.approvalWorkflows).values({
                                id: uuid_1.v4(),
                                organizationId: input.organizationId,
                                workflowType: 'attendance',
                                entityId: attendanceId,
                                requestedBy: ctx.user.id,
                                requestedAt: new Date().toISOString(),
                                status: 'pending',
                                createdAt: new Date().toISOString()
                            })];
                    case 6:
                        // Create approval workflow
                        _b.sent();
                        return [2 /*return*/, { attendanceId: attendanceId, created: true }];
                }
            });
        });
    }),
    // Get attendance record
    getAttendance: trpc_1.publicProcedure
        .input(zod_1.z.object({ attendanceId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [2 /*return*/, db.query.attendance.findFirst({
                                where: drizzle_orm_1.eq(schema_1.attendance.id, input.attendanceId)
                            })];
                }
            });
        });
    }),
    // List attendance records with filters
    listAttendance: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        employeeId: zod_1.z.string().optional(),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        status: zod_1.z.string().optional(),
        approvalStatus: zod_1.z.string().optional(),
        limit: zod_1.z.number().int()["default"](100),
        offset: zod_1.z.number().int()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, query;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        query = db.select().from(schema_1.attendance).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.organizationId, input.organizationId), drizzle_orm_1.gte(schema_1.attendance.date, input.startDate), drizzle_orm_1.lte(schema_1.attendance.date, input.endDate)));
                        if (input.employeeId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.attendance.employeeId, input.employeeId));
                        }
                        if (input.status) {
                            query = query.where(drizzle_orm_1.eq(schema_1.attendance.status, input.status));
                        }
                        if (input.approvalStatus) {
                            query = query.where(drizzle_orm_1.eq(schema_1.attendance.approvalStatus, input.approvalStatus));
                        }
                        return [2 /*return*/, query.orderBy(drizzle_orm_1.desc(schema_1.attendance.date)).limit(input.limit).offset(input.offset)];
                }
            });
        });
    }),
    // Approve attendance
    approveAttendance: enhancedRbac_1.createFeatureRestrictedProcedure(['attendance:approve', 'admin:all', 'hr:manage'])
        .input(approveAttendanceSchema)
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, record;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.query.attendance.findFirst({
                                where: drizzle_orm_1.eq(schema_1.attendance.id, input.attendanceId)
                            })];
                    case 2:
                        record = _b.sent();
                        if (!record) {
                            throw new Error('Attendance record not found');
                        }
                        return [4 /*yield*/, db.update(schema_1.attendance)
                                .set({
                                approvalStatus: input.approvalStatus,
                                approvedBy: input.approverId,
                                approvalDate: new Date().toISOString(),
                                approvalComments: input.approvalComments
                            })
                                .where(drizzle_orm_1.eq(schema_1.attendance.id, input.attendanceId))
                            // Update approval workflow
                        ];
                    case 3:
                        _b.sent();
                        // Update approval workflow
                        return [4 /*yield*/, db.update(schema_1.approvalWorkflows)
                                .set({
                                status: input.approvalStatus === 'approved' ? 'approved' : 'rejected',
                                approvedBy: input.approverId,
                                approvedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.approvalWorkflows.entityId, input.attendanceId))];
                    case 4:
                        // Update approval workflow
                        _b.sent();
                        return [2 /*return*/, { attendanceId: input.attendanceId }];
                }
            });
        });
    }),
    // Bulk record attendance
    bulkRecordAttendance: enhancedRbac_1.createFeatureRestrictedProcedure(['attendance:manage', 'admin:all', 'hr:manage'])
        .input(bulkRecordAttendanceSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, results, _i, _b, record, existingRecord, attendanceId, checkInDate, workingHours, checkOutDate, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        results = [];
                        _i = 0, _b = input.records;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 11];
                        record = _b[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 9, , 10]);
                        return [4 /*yield*/, db.query.attendance.findFirst({
                                where: drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.employeeId, record.employeeId), drizzle_orm_1.eq(schema_1.attendance.date, input.date))
                            })];
                    case 4:
                        existingRecord = _c.sent();
                        attendanceId = (existingRecord === null || existingRecord === void 0 ? void 0 : existingRecord.id) || uuid_1.v4();
                        if (!existingRecord) return [3 /*break*/, 6];
                        return [4 /*yield*/, db.update(schema_1.attendance)
                                .set({
                                checkInTime: record.checkInTime,
                                checkOutTime: record.checkOutTime,
                                status: record.status
                            })
                                .where(drizzle_orm_1.eq(schema_1.attendance.id, attendanceId))];
                    case 5:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        checkInDate = new Date(input.date + "T" + record.checkInTime + ":00");
                        workingHours = 0;
                        if (record.checkOutTime) {
                            checkOutDate = new Date(input.date + "T" + record.checkOutTime + ":00");
                            workingHours = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
                        }
                        return [4 /*yield*/, db.insert(schema_1.attendance).values({
                                id: attendanceId,
                                organizationId: input.organizationId,
                                employeeId: record.employeeId,
                                date: input.date,
                                checkInTime: record.checkInTime,
                                checkOutTime: record.checkOutTime || null,
                                workingHours: workingHours > 0 ? workingHours : null,
                                status: record.status,
                                approvalStatus: 'pending',
                                createdAt: new Date().toISOString(),
                                createdBy: ctx.user.id
                            })];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        results.push({ employeeId: record.employeeId, status: 'success' });
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _c.sent();
                        results.push({ employeeId: record.employeeId, status: 'failed', error: error_1.message });
                        return [3 /*break*/, 10];
                    case 10:
                        _i++;
                        return [3 /*break*/, 2];
                    case 11: return [2 /*return*/, { results: results, processed: results.length }];
                }
            });
        });
    }),
    // Get attendance summary for month
    getMonthlyAttendanceSummary: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        employeeId: zod_1.z.string().optional(),
        year: zod_1.z.number().int(),
        month: zod_1.z.number().int().min(1).max(12)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, monthStart, monthEnd, monthEndStr, query, records, summary, _i, records_1, rec;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        monthStart = input.year + "-" + String(input.month).padStart(2, '0') + "-01";
                        monthEnd = new Date(input.year, input.month, 0);
                        monthEndStr = input.year + "-" + String(input.month).padStart(2, '0') + "-" + String(monthEnd.getDate()).padStart(2, '0');
                        query = db.select().from(schema_1.attendance).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.organizationId, input.organizationId), drizzle_orm_1.gte(schema_1.attendance.date, monthStart), drizzle_orm_1.lte(schema_1.attendance.date, monthEndStr)));
                        if (input.employeeId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.attendance.employeeId, input.employeeId));
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        records = _b.sent();
                        summary = {
                            totalDays: 0,
                            present: 0,
                            absent: 0,
                            late: 0,
                            halfDay: 0,
                            workFromHome: 0,
                            onLeave: 0,
                            totalWorkingHours: 0,
                            averageWorkingHours: 0
                        };
                        for (_i = 0, records_1 = records; _i < records_1.length; _i++) {
                            rec = records_1[_i];
                            summary.totalDays++;
                            if (rec.status === 'present')
                                summary.present++;
                            if (rec.status === 'absent')
                                summary.absent++;
                            if (rec.status === 'late')
                                summary.late++;
                            if (rec.status === 'half_day')
                                summary.halfDay++;
                            if (rec.status === 'work_from_home')
                                summary.workFromHome++;
                            if (rec.status === 'on_leave')
                                summary.onLeave++;
                            if (rec.workingHours)
                                summary.totalWorkingHours += rec.workingHours;
                        }
                        summary.averageWorkingHours = summary.totalDays > 0 ? summary.totalWorkingHours / summary.totalDays : 0;
                        return [2 /*return*/, summary];
                }
            });
        });
    }),
    // Get attendance analytics for organization
    getAttendanceAnalytics: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        year: zod_1.z.number().int(),
        month: zod_1.z.number().int().min(1).max(12)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, monthStart, monthEnd, monthEndStr, records, stats;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        monthStart = input.year + "-" + String(input.month).padStart(2, '0') + "-01";
                        monthEnd = new Date(input.year, input.month, 0);
                        monthEndStr = input.year + "-" + String(input.month).padStart(2, '0') + "-" + String(monthEnd.getDate()).padStart(2, '0');
                        return [4 /*yield*/, db.select().from(schema_1.attendance).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.organizationId, input.organizationId), drizzle_orm_1.gte(schema_1.attendance.date, monthStart), drizzle_orm_1.lte(schema_1.attendance.date, monthEndStr)))];
                    case 2:
                        records = _b.sent();
                        stats = {
                            totalRecords: records.length,
                            byStatus: {
                                present: records.filter(function (r) { return r.status === 'present'; }).length,
                                absent: records.filter(function (r) { return r.status === 'absent'; }).length,
                                late: records.filter(function (r) { return r.status === 'late'; }).length,
                                halfDay: records.filter(function (r) { return r.status === 'half_day'; }).length,
                                workFromHome: records.filter(function (r) { return r.status === 'work_from_home'; }).length,
                                onLeave: records.filter(function (r) { return r.status === 'on_leave'; }).length
                            },
                            byApprovalStatus: {
                                pending: records.filter(function (r) { return r.approvalStatus === 'pending'; }).length,
                                approved: records.filter(function (r) { return r.approvalStatus === 'approved'; }).length,
                                rejected: records.filter(function (r) { return r.approvalStatus === 'rejected'; }).length
                            },
                            attendanceRate: records.length > 0
                                ? Math.round((records.filter(function (r) { return r.status === 'present' || r.status === 'late'; }).length / records.length) * 100)
                                : 0
                        };
                        return [2 /*return*/, stats];
                }
            });
        });
    }),
    // Late arrivals report
    getLateArrivalsReport: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        threshold: zod_1.z.number()["default"](30)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, records;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.attendance).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.organizationId, input.organizationId), drizzle_orm_1.gte(schema_1.attendance.date, input.startDate), drizzle_orm_1.lte(schema_1.attendance.date, input.endDate), drizzle_orm_1.eq(schema_1.attendance.status, 'late')))];
                    case 2:
                        records = _b.sent();
                        return [2 /*return*/, records];
                }
            });
        });
    }),
    // Absent employees report
    getAbsentEmployeesReport: trpc_1.publicProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, records;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.attendance).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.organizationId, input.organizationId), drizzle_orm_1.gte(schema_1.attendance.date, input.startDate), drizzle_orm_1.lte(schema_1.attendance.date, input.endDate), drizzle_orm_1.eq(schema_1.attendance.status, 'absent')))];
                    case 2:
                        records = _b.sent();
                        return [2 /*return*/, records];
                }
            });
        });
    }),
    // Get employee attendance dashboard
    getEmployeeAttendanceDashboard: trpc_1.publicProcedure
        .input(zod_1.z.object({
        employeeId: zod_1.z.string(),
        year: zod_1.z.number().int()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, records, monthlyStats, _loop_1, month;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.attendance).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.attendance.employeeId, input.employeeId), drizzle_orm_1.gte(schema_1.attendance.date, input.year + "-01-01"), drizzle_orm_1.lte(schema_1.attendance.date, input.year + "-12-31")))];
                    case 2:
                        records = _b.sent();
                        monthlyStats = {};
                        _loop_1 = function (month) {
                            var monthStr = String(month).padStart(2, '0');
                            var monthRecords = records.filter(function (r) { var _a; return (_a = r.date) === null || _a === void 0 ? void 0 : _a.startsWith(input.year + "-" + monthStr); });
                            monthlyStats[monthStr] = {
                                present: monthRecords.filter(function (r) { return r.status === 'present'; }).length,
                                absent: monthRecords.filter(function (r) { return r.status === 'absent'; }).length,
                                late: monthRecords.filter(function (r) { return r.status === 'late'; }).length,
                                halfDay: monthRecords.filter(function (r) { return r.status === 'half_day'; }).length,
                                workFromHome: monthRecords.filter(function (r) { return r.status === 'work_from_home'; }).length,
                                onLeave: monthRecords.filter(function (r) { return r.status === 'on_leave'; }).length
                            };
                        };
                        for (month = 1; month <= 12; month++) {
                            _loop_1(month);
                        }
                        return [2 /*return*/, {
                                totalRecords: records.length,
                                yearStats: {
                                    present: records.filter(function (r) { return r.status === 'present'; }).length,
                                    absent: records.filter(function (r) { return r.status === 'absent'; }).length,
                                    late: records.filter(function (r) { return r.status === 'late'; }).length,
                                    halfDay: records.filter(function (r) { return r.status === 'half_day'; }).length,
                                    workFromHome: records.filter(function (r) { return r.status === 'work_from_home'; }).length,
                                    onLeave: records.filter(function (r) { return r.status === 'on_leave'; }).length
                                },
                                monthlyStats: monthlyStats
                            }];
                }
            });
        });
    })
});
