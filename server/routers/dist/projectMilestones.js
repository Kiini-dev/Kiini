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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.projectMilestonesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var schema_1 = require("../../drizzle/schema");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var nanoid_1 = require("nanoid");
var server_1 = require("@trpc/server");
// Define typed procedures
var createProcedure = trpc_1.createFeatureRestrictedProcedure("projects:milestones");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("projects:read");
var updateProcedure = trpc_1.createFeatureRestrictedProcedure("projects:milestones");
var deleteProcedure = trpc_1.createFeatureRestrictedProcedure("projects:delete");
var createMilestoneSchema = zod_1.z.object({
    projectId: zod_1.z.string(),
    phaseName: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    deliverables: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().datetime(),
    startDate: zod_1.z.string().datetime().optional(),
    budget: zod_1.z.number().int().optional(),
    assignedTo: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
var updateMilestoneSchema = zod_1.z.object({
    id: zod_1.z.string(),
    phaseName: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    deliverables: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    status: zod_1.z["enum"](["planning", "in_progress", "on_hold", "completed", "cancelled"]).optional(),
    completionPercentage: zod_1.z.number().int().min(0).max(100).optional(),
    assignedTo: zod_1.z.string().optional(),
    budget: zod_1.z.number().int().optional(),
    actualCost: zod_1.z.number().int().optional(),
    notes: zod_1.z.string().optional()
});
exports.projectMilestonesRouter = trpc_1.router({
    create: createProcedure
        .input(createMilestoneSchema)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, project, id, toMysqlDate, error_1, msg;
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
                        id = nanoid_1.nanoid();
                        toMysqlDate = function (iso) { return iso.replace('T', ' ').substring(0, 19); };
                        return [4 /*yield*/, db.insert(schema_1.projectMilestones).values({
                                id: id,
                                projectId: input.projectId,
                                phaseName: input.phaseName,
                                description: input.description,
                                deliverables: input.deliverables,
                                dueDate: toMysqlDate(input.dueDate),
                                startDate: input.startDate ? toMysqlDate(input.startDate) : undefined,
                                budget: input.budget,
                                assignedTo: input.assignedTo,
                                notes: input.notes,
                                status: "planning",
                                completionPercentage: 0,
                                createdBy: ctx.user.id
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { id: id, success: true }];
                    case 5:
                        error_1 = _b.sent();
                        console.error("[PROJECT_MILESTONES] Create error:", error_1);
                        if (error_1 instanceof server_1.TRPCError)
                            throw error_1;
                        msg = error_1 instanceof Error ? error_1.message : String(error_1);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create milestone: " + msg
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    list: readProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().optional(),
        status: zod_1.z["enum"](["planning", "in_progress", "on_hold", "completed", "cancelled"]).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, result, error_2;
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
                            filters.push(drizzle_orm_1.eq(schema_1.projectMilestones.projectId, input.projectId));
                        }
                        if (input.status) {
                            filters.push(drizzle_orm_1.eq(schema_1.projectMilestones.status, input.status));
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.projectMilestones)
                                .where(filters.length > 0 ? drizzle_orm_1.and.apply(void 0, filters) : undefined)
                                .orderBy(schema_1.projectMilestones.dueDate)];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_2 = _b.sent();
                        console.error("[PROJECT_MILESTONES] List error:", error_2);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch milestones"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getById: readProcedure.input(zod_1.z.string()).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, result, error_3;
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
                                .from(schema_1.projectMilestones)
                                .where(drizzle_orm_1.eq(schema_1.projectMilestones.id, input))
                                .limit(1)];
                    case 3:
                        result = _b.sent();
                        if (!result.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Milestone not found"
                            });
                        }
                        return [2 /*return*/, result[0]];
                    case 4:
                        error_3 = _b.sent();
                        console.error("[PROJECT_MILESTONES] GetById error:", error_3);
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch milestone"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    update: updateProcedure
        .input(updateMilestoneSchema)
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id, updateData, existing, updates, error_4;
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
                        id = input.id, updateData = __rest(input, ["id"]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.projectMilestones)
                                .where(drizzle_orm_1.eq(schema_1.projectMilestones.id, id))
                                .limit(1)];
                    case 3:
                        existing = _b.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Milestone not found"
                            });
                        }
                        updates = {
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        if (updateData.phaseName !== undefined) {
                            updates.phaseName = updateData.phaseName;
                        }
                        if (updateData.description !== undefined) {
                            updates.description = updateData.description;
                        }
                        if (updateData.deliverables !== undefined) {
                            updates.deliverables = updateData.deliverables;
                        }
                        if (updateData.dueDate !== undefined) {
                            updates.dueDate = updateData.dueDate;
                        }
                        if (updateData.startDate !== undefined) {
                            updates.startDate = updateData.startDate;
                        }
                        if (updateData.status !== undefined) {
                            updates.status = updateData.status;
                            if (updateData.status === "completed") {
                                updates.completionPercentage = 100;
                                updates.completionDate = new Date().toISOString();
                            }
                        }
                        if (updateData.completionPercentage !== undefined) {
                            updates.completionPercentage = updateData.completionPercentage;
                            if (updateData.completionPercentage === 100 && !updates.completionDate) {
                                updates.completionDate = new Date().toISOString();
                                updates.status = "completed";
                            }
                        }
                        if (updateData.assignedTo !== undefined) {
                            updates.assignedTo = updateData.assignedTo;
                        }
                        if (updateData.budget !== undefined) {
                            updates.budget = updateData.budget;
                        }
                        if (updateData.actualCost !== undefined) {
                            updates.actualCost = updateData.actualCost;
                        }
                        if (updateData.notes !== undefined) {
                            updates.notes = updateData.notes;
                        }
                        return [4 /*yield*/, db
                                .update(schema_1.projectMilestones)
                                .set(updates)
                                .where(drizzle_orm_1.eq(schema_1.projectMilestones.id, id))];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_4 = _b.sent();
                        console.error("[PROJECT_MILESTONES] Update error:", error_4);
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update milestone"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": deleteProcedure.input(zod_1.z.string()).mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_5;
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
                        return [4 /*yield*/, db["delete"](schema_1.projectMilestones)
                                .where(drizzle_orm_1.eq(schema_1.projectMilestones.id, input))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_5 = _b.sent();
                        console.error("[PROJECT_MILESTONES] Delete error:", error_5);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to delete milestone"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    updateProgress: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        completionPercentage: zod_1.z.number().int().min(0).max(100)
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, updates, error_6;
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
                        updates = {
                            completionPercentage: input.completionPercentage,
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        // Auto-complete if 100%
                        if (input.completionPercentage === 100) {
                            updates.status = "completed";
                            updates.completionDate = new Date().toISOString();
                        }
                        else if (input.completionPercentage > 0) {
                            updates.status = "in_progress";
                        }
                        return [4 /*yield*/, db
                                .update(schema_1.projectMilestones)
                                .set(updates)
                                .where(drizzle_orm_1.eq(schema_1.projectMilestones.id, input.id))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_6 = _b.sent();
                        console.error("[PROJECT_MILESTONES] UpdateProgress error:", error_6);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update milestone progress"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getUpcomingMilestones: readProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().optional(),
        daysAhead: zod_1.z.number().int()["default"](30)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, now, futureDate, filters, result, error_7;
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
                        now = new Date();
                        futureDate = new Date(now.getTime() + input.daysAhead * 24 * 60 * 60 * 1000);
                        filters = [
                            drizzle_orm_1.eq(schema_1.projectMilestones.status, "planning"),
                            drizzle_orm_1.gte(schema_1.projectMilestones.dueDate, now.toISOString().replace('T', ' ').substring(0, 19)),
                            drizzle_orm_1.lte(schema_1.projectMilestones.dueDate, futureDate.toISOString().replace('T', ' ').substring(0, 19)),
                        ];
                        if (input.projectId) {
                            filters.push(drizzle_orm_1.eq(schema_1.projectMilestones.projectId, input.projectId));
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.projectMilestones)
                                .where(drizzle_orm_1.and.apply(void 0, filters))
                                .orderBy(schema_1.projectMilestones.dueDate)];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_7 = _b.sent();
                        console.error("[PROJECT_MILESTONES] GetUpcoming error:", error_7);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch upcoming milestones"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getOverdueMilestones: readProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string().optional() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, now, filters, result, error_8;
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
                        now = new Date();
                        filters = [
                            drizzle_orm_1.eq(schema_1.projectMilestones.status, "in_progress"),
                            drizzle_orm_1.lte(schema_1.projectMilestones.dueDate, now.toISOString().replace('T', ' ').substring(0, 19)),
                        ];
                        if (input.projectId) {
                            filters.push(drizzle_orm_1.eq(schema_1.projectMilestones.projectId, input.projectId));
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.projectMilestones)
                                .where(drizzle_orm_1.and.apply(void 0, filters))
                                .orderBy(schema_1.projectMilestones.dueDate)];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_8 = _b.sent();
                        console.error("[PROJECT_MILESTONES] GetOverdue error:", error_8);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch overdue milestones"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getProjectStats: readProcedure.input(zod_1.z.string()).query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, milestones, total, completed, inProgress, avgCompletion, error_9;
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
                                .from(schema_1.projectMilestones)
                                .where(drizzle_orm_1.eq(schema_1.projectMilestones.projectId, input))];
                    case 3:
                        milestones = _b.sent();
                        total = milestones.length;
                        completed = milestones.filter(function (m) { return m.status === "completed"; }).length;
                        inProgress = milestones.filter(function (m) { return m.status === "in_progress"; }).length;
                        avgCompletion = total > 0
                            ? Math.round(milestones.reduce(function (sum, m) { return sum + m.completionPercentage; }, 0) / total)
                            : 0;
                        return [2 /*return*/, {
                                total: total,
                                completed: completed,
                                inProgress: inProgress,
                                avgCompletion: avgCompletion,
                                milestones: milestones
                            }];
                    case 4:
                        error_9 = _b.sent();
                        console.error("[PROJECT_MILESTONES] GetStats error:", error_9);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch milestone stats"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
