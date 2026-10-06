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
exports.timeEntriesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var schema_1 = require("../../drizzle/schema");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var nanoid_1 = require("nanoid");
var server_1 = require("@trpc/server");
// Feature-based procedures
var readProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("timeEntries:read");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("timeEntries:create");
var updateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("timeEntries:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("timeEntries:delete");
var writeProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("timeEntries:edit");
var createEntrySchema = zod_1.z.object({
    projectId: zod_1.z.string(),
    projectTaskId: zod_1.z.string().optional(),
    entryDate: zod_1.z.string().datetime(),
    durationMinutes: zod_1.z.number().int().min(1).max(1440),
    description: zod_1.z.string().min(1).max(500),
    billable: zod_1.z.boolean()["default"](true),
    hourlyRate: zod_1.z.number().int().optional(),
    notes: zod_1.z.string().optional()
});
var updateEntrySchema = zod_1.z.object({
    id: zod_1.z.string(),
    entryDate: zod_1.z.string().datetime().optional(),
    durationMinutes: zod_1.z.number().int().min(1).max(1440).optional(),
    description: zod_1.z.string().min(1).max(500).optional(),
    billable: zod_1.z.boolean().optional(),
    hourlyRate: zod_1.z.number().int().optional(),
    notes: zod_1.z.string().optional()
});
var listEntriesSchema = zod_1.z.object({
    projectId: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
    status: zod_1.z["enum"](["draft", "submitted", "approved", "invoiced", "rejected"]).optional(),
    billable: zod_1.z.boolean().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional()
});
exports.timeEntriesRouter = trpc_1.router({
    create: writeProcedure
        .input(createEntrySchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, project, task, id, amount, entryDate, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.projects)
                                .where(drizzle_orm_1.eq(schema_1.projects.id, input.projectId))
                                .limit(1)];
                    case 3:
                        project = _b.sent();
                        if (!project.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Project not found"
                            });
                        }
                        if (!input.projectTaskId) return [3 /*break*/, 5];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.projectTasks)
                                .where(drizzle_orm_1.eq(schema_1.projectTasks.id, input.projectTaskId))
                                .limit(1)];
                    case 4:
                        task = _b.sent();
                        if (!task.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Project task not found"
                            });
                        }
                        _b.label = 5;
                    case 5:
                        id = nanoid_1.nanoid();
                        amount = input.hourlyRate
                            ? Math.round((input.durationMinutes / 60) * input.hourlyRate)
                            : 0;
                        entryDate = new Date(input.entryDate).toISOString().slice(0, 19).replace("T", " ");
                        return [4 /*yield*/, db.insert(schema_1.timeEntries).values({
                                id: id,
                                projectId: input.projectId,
                                projectTaskId: input.projectTaskId,
                                userId: ctx.user.id,
                                entryDate: entryDate,
                                durationMinutes: input.durationMinutes,
                                description: input.description,
                                billable: input.billable ? 1 : 0,
                                hourlyRate: input.hourlyRate,
                                amount: amount,
                                status: "draft",
                                notes: input.notes,
                                createdBy: ctx.user.id
                            })];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, { id: id, success: true }];
                    case 7:
                        error_1 = _b.sent();
                        console.error("[TIME_ENTRIES] Create error:", error_1);
                        if (error_1 instanceof server_1.TRPCError)
                            throw error_1;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create time entry"
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    list: readProcedure
        .input(listEntriesSchema.optional()["default"]({}))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, entries, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        filters = [];
                        if (input.projectId) {
                            filters.push(drizzle_orm_1.eq(schema_1.timeEntries.projectId, input.projectId));
                        }
                        if (input.userId) {
                            filters.push(drizzle_orm_1.eq(schema_1.timeEntries.userId, input.userId));
                        }
                        else {
                            // Non-admins see only their own entries by default
                            if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin" && ctx.user.role !== "staff") {
                                filters.push(drizzle_orm_1.eq(schema_1.timeEntries.userId, ctx.user.id));
                            }
                        }
                        if (input.status) {
                            filters.push(drizzle_orm_1.eq(schema_1.timeEntries.status, input.status));
                        }
                        if (input.billable !== undefined) {
                            filters.push(drizzle_orm_1.eq(schema_1.timeEntries.billable, input.billable ? 1 : 0));
                        }
                        if (input.startDate) {
                            filters.push(drizzle_orm_1.gte(schema_1.timeEntries.entryDate, input.startDate));
                        }
                        if (input.endDate) {
                            filters.push(drizzle_orm_1.lte(schema_1.timeEntries.entryDate, input.endDate));
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.timeEntries)
                                .where(filters.length > 0 ? drizzle_orm_1.and.apply(void 0, filters) : undefined)
                                .orderBy(drizzle_orm_1.desc(schema_1.timeEntries.entryDate))];
                    case 3:
                        entries = _b.sent();
                        return [2 /*return*/, entries.map(function (entry) { return (__assign(__assign({}, entry), { billable: entry.billable === 1 })); })];
                    case 4:
                        error_2 = _b.sent();
                        console.error("[TIME_ENTRIES] List error:", error_2);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to list time entries"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, entry, e, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.timeEntries)
                                .where(drizzle_orm_1.eq(schema_1.timeEntries.id, input))
                                .limit(1)];
                    case 3:
                        entry = _b.sent();
                        if (!entry.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Time entry not found"
                            });
                        }
                        e = entry[0];
                        if (ctx.user.id !== e.userId &&
                            ctx.user.role !== "admin" &&
                            ctx.user.role !== "super_admin" &&
                            ctx.user.role !== "staff") {
                            throw new server_1.TRPCError({
                                code: "FORBIDDEN",
                                message: "Not authorized to view this entry"
                            });
                        }
                        return [2 /*return*/, __assign(__assign({}, e), { billable: e.billable === 1 })];
                    case 4:
                        error_3 = _b.sent();
                        console.error("[TIME_ENTRIES] GetById error:", error_3);
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch time entry"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    update: writeProcedure
        .input(updateEntrySchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, entry, e, durationMinutes, hourlyRate, amount, error_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.timeEntries)
                                .where(drizzle_orm_1.eq(schema_1.timeEntries.id, input.id))
                                .limit(1)];
                    case 3:
                        entry = _d.sent();
                        if (!entry.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Time entry not found"
                            });
                        }
                        e = entry[0];
                        // Check authorization - only owner or admin can update
                        if (ctx.user.id !== e.userId &&
                            ctx.user.role !== "admin" &&
                            ctx.user.role !== "super_admin") {
                            throw new server_1.TRPCError({
                                code: "FORBIDDEN",
                                message: "Not authorized to update this entry"
                            });
                        }
                        // Can't update if already invoiced or approved (unless admin)
                        if ((e.status === "invoiced" || e.status === "approved") && ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Cannot update approved or invoiced entries"
                            });
                        }
                        durationMinutes = (_b = input.durationMinutes) !== null && _b !== void 0 ? _b : e.durationMinutes;
                        hourlyRate = (_c = input.hourlyRate) !== null && _c !== void 0 ? _c : e.hourlyRate;
                        amount = hourlyRate
                            ? Math.round((durationMinutes / 60) * hourlyRate)
                            : e.amount;
                        return [4 /*yield*/, db
                                .update(schema_1.timeEntries)
                                .set({
                                entryDate: input.entryDate,
                                durationMinutes: durationMinutes,
                                description: input.description,
                                billable: input.billable !== undefined ? (input.billable ? 1 : 0) : e.billable,
                                hourlyRate: hourlyRate,
                                amount: amount,
                                notes: input.notes,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.timeEntries.id, input.id))];
                    case 4:
                        _d.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_4 = _d.sent();
                        console.error("[TIME_ENTRIES] Update error:", error_4);
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update time entry"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, entry, e, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.timeEntries)
                                .where(drizzle_orm_1.eq(schema_1.timeEntries.id, input))
                                .limit(1)];
                    case 3:
                        entry = _b.sent();
                        if (!entry.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Time entry not found"
                            });
                        }
                        e = entry[0];
                        // Check authorization
                        if (ctx.user.id !== e.userId &&
                            ctx.user.role !== "admin" &&
                            ctx.user.role !== "super_admin") {
                            throw new server_1.TRPCError({
                                code: "FORBIDDEN",
                                message: "Not authorized to delete this entry"
                            });
                        }
                        // Can't delete if invoiced or approved (unless admin)
                        if ((e.status === "invoiced" || e.status === "approved") && ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Cannot delete approved or invoiced entries"
                            });
                        }
                        return [4 /*yield*/, db["delete"](schema_1.timeEntries).where(drizzle_orm_1.eq(schema_1.timeEntries.id, input))];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_5 = _b.sent();
                        console.error("[TIME_ENTRIES] Delete error:", error_5);
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to delete time entry"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    submit: updateProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, entry, e, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.timeEntries)
                                .where(drizzle_orm_1.eq(schema_1.timeEntries.id, input))
                                .limit(1)];
                    case 3:
                        entry = _b.sent();
                        if (!entry.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Time entry not found"
                            });
                        }
                        e = entry[0];
                        if (ctx.user.id !== e.userId && ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
                            throw new server_1.TRPCError({
                                code: "FORBIDDEN",
                                message: "Not authorized to submit this entry"
                            });
                        }
                        if (e.status !== "draft") {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Can only submit draft entries"
                            });
                        }
                        return [4 /*yield*/, db
                                .update(schema_1.timeEntries)
                                .set({
                                status: "submitted",
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.timeEntries.id, input))];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_6 = _b.sent();
                        console.error("[TIME_ENTRIES] Submit error:", error_6);
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to submit time entry"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    approve: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        approve: zod_1.z.boolean()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, entry, e, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        // Only admins/staff can approve
                        if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin" && ctx.user.role !== "staff") {
                            throw new server_1.TRPCError({
                                code: "FORBIDDEN",
                                message: "Only admins can approve time entries"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.timeEntries)
                                .where(drizzle_orm_1.eq(schema_1.timeEntries.id, input.id))
                                .limit(1)];
                    case 3:
                        entry = _b.sent();
                        if (!entry.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Time entry not found"
                            });
                        }
                        e = entry[0];
                        if (e.status !== "submitted") {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Can only approve submitted entries"
                            });
                        }
                        return [4 /*yield*/, db
                                .update(schema_1.timeEntries)
                                .set({
                                status: input.approve ? "approved" : "rejected",
                                approvedBy: ctx.user.id,
                                approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.timeEntries.id, input.id))];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_7 = _b.sent();
                        console.error("[TIME_ENTRIES] Approve error:", error_7);
                        if (error_7 instanceof server_1.TRPCError)
                            throw error_7;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to approve time entry"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    getUtilizationReport: readProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().optional(),
        userId: zod_1.z.string().optional(),
        startDate: zod_1.z.string().datetime(),
        endDate: zod_1.z.string().datetime()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, entries, report_1, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        filters = [];
                        if (input.projectId) {
                            filters.push(drizzle_orm_1.eq(schema_1.timeEntries.projectId, input.projectId));
                        }
                        if (input.userId) {
                            filters.push(drizzle_orm_1.eq(schema_1.timeEntries.userId, input.userId));
                        }
                        else {
                            // Non-admins see only their own data
                            if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin" && ctx.user.role !== "staff") {
                                filters.push(drizzle_orm_1.eq(schema_1.timeEntries.userId, ctx.user.id));
                            }
                        }
                        filters.push(drizzle_orm_1.gte(schema_1.timeEntries.entryDate, input.startDate));
                        filters.push(drizzle_orm_1.lte(schema_1.timeEntries.entryDate, input.endDate));
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.timeEntries)
                                .where(drizzle_orm_1.and.apply(void 0, filters))];
                    case 3:
                        entries = _b.sent();
                        report_1 = {
                            totalMinutes: 0,
                            billableMinutes: 0,
                            nonBillableMinutes: 0,
                            totalAmount: 0,
                            entryCount: entries.length,
                            draftCount: 0,
                            submittedCount: 0,
                            approvedCount: 0,
                            invoicedCount: 0,
                            utilization: 0
                        };
                        entries.forEach(function (entry) {
                            report_1.totalMinutes += entry.durationMinutes;
                            report_1.totalAmount += entry.amount || 0;
                            if (entry.billable === 1) {
                                report_1.billableMinutes += entry.durationMinutes;
                            }
                            else {
                                report_1.nonBillableMinutes += entry.durationMinutes;
                            }
                            if (entry.status === "draft")
                                report_1.draftCount++;
                            else if (entry.status === "submitted")
                                report_1.submittedCount++;
                            else if (entry.status === "approved")
                                report_1.approvedCount++;
                            else if (entry.status === "invoiced")
                                report_1.invoicedCount++;
                        });
                        // Calculate utilization percentage
                        if (report_1.totalMinutes > 0) {
                            report_1.utilization = Math.round((report_1.billableMinutes / report_1.totalMinutes) * 100);
                        }
                        return [2 /*return*/, report_1];
                    case 4:
                        error_8 = _b.sent();
                        console.error("[TIME_ENTRIES] GetUtilizationReport error:", error_8);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to generate utilization report"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getProjectSummary: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, project, entries, summary_1, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.projects)
                                .where(drizzle_orm_1.eq(schema_1.projects.id, input))
                                .limit(1)];
                    case 3:
                        project = _b.sent();
                        if (!project.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Project not found"
                            });
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.timeEntries)
                                .where(drizzle_orm_1.eq(schema_1.timeEntries.projectId, input))];
                    case 4:
                        entries = _b.sent();
                        summary_1 = {
                            projectId: input,
                            totalMinutes: 0,
                            billableMinutes: 0,
                            totalAmount: 0,
                            entryCount: entries.length,
                            approvedAmount: 0,
                            invoicedAmount: 0,
                            pendingAmount: 0,
                            byUser: {}
                        };
                        entries.forEach(function (entry) {
                            summary_1.totalMinutes += entry.durationMinutes;
                            summary_1.totalAmount += entry.amount || 0;
                            if (entry.billable === 1) {
                                summary_1.billableMinutes += entry.durationMinutes;
                            }
                            if (entry.status === "approved" || entry.status === "invoiced") {
                                summary_1.approvedAmount += entry.amount || 0;
                            }
                            if (entry.status === "invoiced") {
                                summary_1.invoicedAmount += entry.amount || 0;
                            }
                            else if (entry.status === "approved" || entry.status === "submitted") {
                                summary_1.pendingAmount += entry.amount || 0;
                            }
                            // Group by user
                            if (!summary_1.byUser[entry.userId]) {
                                summary_1.byUser[entry.userId] = {
                                    userId: entry.userId,
                                    minutes: 0,
                                    amount: 0,
                                    entryCount: 0
                                };
                            }
                            summary_1.byUser[entry.userId].minutes += entry.durationMinutes;
                            summary_1.byUser[entry.userId].amount += entry.amount || 0;
                            summary_1.byUser[entry.userId].entryCount += 1;
                        });
                        return [2 /*return*/, summary_1];
                    case 5:
                        error_9 = _b.sent();
                        console.error("[TIME_ENTRIES] GetProjectSummary error:", error_9);
                        if (error_9 instanceof server_1.TRPCError)
                            throw error_9;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to generate project summary"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    })
});
