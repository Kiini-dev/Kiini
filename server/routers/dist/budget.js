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
exports.budgetRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var readProcedure = trpc_1.protectedProcedure;
var schema_1 = require("../../drizzle/schema");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
// Feature-based procedures
var writeProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("budget:edit");
exports.budgetRouter = trpc_1.router({
    // ========== TOP-LEVEL BUDGET LIST & ALLOCATIONS ==========
    // List budgets for a fiscal year
    list: readProcedure
        .input(zod_1.z.object({ year: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, year, conditions, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        year = (input === null || input === void 0 ? void 0 : input.year) || new Date().getFullYear();
                        conditions = [drizzle_orm_1.eq(schema_1.budgets.fiscalYear, year)];
                        if (orgId)
                            conditions.push(drizzle_orm_1.eq(schema_1.budgets.organizationId, orgId));
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database
                                .select({
                                id: schema_1.budgets.id,
                                budgetName: schema_1.budgets.budgetName,
                                departmentId: schema_1.budgets.departmentId,
                                amount: schema_1.budgets.amount,
                                remaining: schema_1.budgets.remaining,
                                totalActual: schema_1.budgets.totalActual,
                                totalBudgeted: schema_1.budgets.totalBudgeted,
                                fiscalYear: schema_1.budgets.fiscalYear,
                                budgetStatus: schema_1.budgets.budgetStatus,
                                departmentName: schema_1.departments.name
                            })
                                .from(schema_1.budgets)
                                .leftJoin(schema_1.departments, drizzle_orm_1.eq(schema_1.budgets.departmentId, schema_1.departments.id))
                                .where(drizzle_orm_1.and.apply(void 0, conditions))
                                .orderBy(drizzle_orm_1.desc(schema_1.budgets.createdAt))];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result.map(function (b) {
                                var _a;
                                return ({
                                    id: b.id,
                                    budgetName: b.budgetName || "Budget FY" + b.fiscalYear,
                                    departmentId: b.departmentId,
                                    departmentName: b.departmentName || "Unassigned",
                                    totalAmount: b.amount,
                                    spent: b.totalActual || 0,
                                    remaining: (_a = b.remaining) !== null && _a !== void 0 ? _a : (b.amount - (b.totalActual || 0)),
                                    fiscalYear: b.fiscalYear,
                                    status: b.budgetStatus
                                });
                            })];
                    case 4:
                        error_1 = _b.sent();
                        console.error("Error listing budgets:", error_1);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // Get budget allocations (budgets grouped/listed with department context)
    getAllocations: readProcedure
        .input(zod_1.z.object({ year: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, year, conditions, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        year = (input === null || input === void 0 ? void 0 : input.year) || new Date().getFullYear();
                        conditions = [drizzle_orm_1.eq(schema_1.budgets.fiscalYear, year)];
                        if (orgId)
                            conditions.push(drizzle_orm_1.eq(schema_1.budgets.organizationId, orgId));
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, database
                                .select({
                                id: schema_1.budgets.id,
                                budgetName: schema_1.budgets.budgetName,
                                departmentId: schema_1.budgets.departmentId,
                                amount: schema_1.budgets.amount,
                                remaining: schema_1.budgets.remaining,
                                totalActual: schema_1.budgets.totalActual,
                                fiscalYear: schema_1.budgets.fiscalYear,
                                budgetStatus: schema_1.budgets.budgetStatus,
                                departmentName: schema_1.departments.name
                            })
                                .from(schema_1.budgets)
                                .leftJoin(schema_1.departments, drizzle_orm_1.eq(schema_1.budgets.departmentId, schema_1.departments.id))
                                .where(drizzle_orm_1.and.apply(void 0, conditions))
                                .orderBy(schema_1.budgets.budgetName)];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result.map(function (b) {
                                var _a;
                                return ({
                                    id: b.id,
                                    budgetName: b.budgetName || "Budget FY" + b.fiscalYear,
                                    departmentId: b.departmentId,
                                    departmentName: b.departmentName || "Unassigned",
                                    totalAmount: b.amount,
                                    spent: b.totalActual || 0,
                                    remaining: (_a = b.remaining) !== null && _a !== void 0 ? _a : (b.amount - (b.totalActual || 0)),
                                    fiscalYear: b.fiscalYear,
                                    status: b.budgetStatus
                                });
                            })];
                    case 4:
                        error_2 = _b.sent();
                        console.error("Error fetching budget allocations:", error_2);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    // ========== PROJECT BUDGETS ==========
    projectBudgets: trpc_1.router({
        // List project budgets
        list: trpc_1.protectedProcedure
            .input(zod_1.z.object({
            projectId: zod_1.z.string().optional(),
            status: zod_1.z["enum"](["under", "at", "over"]).optional(),
            limit: zod_1.z.number().optional(),
            offset: zod_1.z.number().optional()
        }).optional())
            .query(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, orgId, conditions, whereClause;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _b.sent();
                            if (!database)
                                return [2 /*return*/, []];
                            orgId = ctx.user.organizationId;
                            conditions = [];
                            if (orgId)
                                conditions.push(drizzle_orm_1.eq(schema_extended_1.projectBudgets.organizationId, orgId));
                            if (input === null || input === void 0 ? void 0 : input.projectId)
                                conditions.push(drizzle_orm_1.eq(schema_extended_1.projectBudgets.projectId, input.projectId));
                            if (input === null || input === void 0 ? void 0 : input.status)
                                conditions.push(drizzle_orm_1.eq(schema_extended_1.projectBudgets.budgetStatus, input.status));
                            whereClause = conditions.length === 1 ? conditions[0] : conditions.length > 1 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined;
                            return [4 /*yield*/, database.select().from(schema_extended_1.projectBudgets)
                                    .where(whereClause)
                                    .orderBy(drizzle_orm_1.desc(schema_extended_1.projectBudgets.createdAt))
                                    .limit((input === null || input === void 0 ? void 0 : input.limit) || 50)
                                    .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                        case 2: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        }),
        // Get budget by ID
        getById: readProcedure
            .input(zod_1.z.string())
            .query(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, orgId, where, result;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _b.sent();
                            if (!database)
                                return [2 /*return*/, null];
                            orgId = ctx.user.organizationId;
                            where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.projectBudgets.id, input), drizzle_orm_1.eq(schema_extended_1.projectBudgets.organizationId, orgId)) : drizzle_orm_1.eq(schema_extended_1.projectBudgets.id, input);
                            return [4 /*yield*/, database
                                    .select()
                                    .from(schema_extended_1.projectBudgets)
                                    .where(where)
                                    .limit(1)];
                        case 2:
                            result = _b.sent();
                            return [2 /*return*/, result[0] || null];
                    }
                });
            });
        }),
        // Create project budget
        create: writeProcedure
            .input(zod_1.z.object({
            projectId: zod_1.z.string(),
            budgetedAmount: zod_1.z.number(),
            startDate: zod_1.z.string(),
            endDate: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, id, budgetedCents, error_3;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _c.sent();
                            if (!database)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            budgetedCents = Math.round(input.budgetedAmount * 100);
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 5, , 6]);
                            return [4 /*yield*/, database.insert(schema_extended_1.projectBudgets).values({
                                    id: id,
                                    organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                    projectId: input.projectId,
                                    budgetedAmount: budgetedCents,
                                    spent: 0,
                                    remaining: budgetedCents,
                                    budgetStatus: "under",
                                    startDate: new Date(input.startDate),
                                    endDate: input.endDate ? new Date(input.endDate) : null,
                                    notes: input.notes,
                                    createdBy: ctx.user.id,
                                    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                })];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, db.logActivity({
                                    userId: ctx.user.id,
                                    action: "project_budget_created",
                                    entityType: "projectBudget",
                                    entityId: id,
                                    description: "Created budget for project: " + input.budgetedAmount
                                })];
                        case 4:
                            _c.sent();
                            return [2 /*return*/, { id: id }];
                        case 5:
                            error_3 = _c.sent();
                            console.error("Error creating project budget:", error_3);
                            throw new Error("Failed to create project budget");
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }),
        // Update project budget
        update: writeProcedure
            .input(zod_1.z.object({
            id: zod_1.z.string(),
            budgetedAmount: zod_1.z.number().optional(),
            spent: zod_1.z.number().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, budget, orgId, updates, budgeted, spent, remaining, status, error_4;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _b.sent();
                            if (!database)
                                throw new Error("Database not available");
                            return [4 /*yield*/, database
                                    .select()
                                    .from(schema_extended_1.projectBudgets)
                                    .where(drizzle_orm_1.eq(schema_extended_1.projectBudgets.id, input.id))
                                    .limit(1)];
                        case 2:
                            budget = _b.sent();
                            if (!budget[0])
                                throw new Error("Budget not found");
                            orgId = ctx.user.organizationId;
                            if (orgId && budget[0].organizationId !== orgId)
                                throw new Error("Budget not found");
                            updates = { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
                            budgeted = budget[0].budgetedAmount;
                            spent = budget[0].spent;
                            if (input.budgetedAmount !== undefined) {
                                budgeted = Math.round(input.budgetedAmount * 100);
                                updates.budgetedAmount = budgeted;
                            }
                            if (input.spent !== undefined) {
                                spent = Math.round(input.spent * 100);
                                updates.spent = spent;
                            }
                            if (input.notes !== undefined) {
                                updates.notes = input.notes;
                            }
                            remaining = budgeted - spent;
                            status = spent > budgeted ? "over" : spent === budgeted ? "at" : "under";
                            updates.remaining = remaining;
                            updates.budgetStatus = status;
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 6, , 7]);
                            return [4 /*yield*/, database.update(schema_extended_1.projectBudgets).set(updates).where(drizzle_orm_1.eq(schema_extended_1.projectBudgets.id, input.id))];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, db.logActivity({
                                    userId: ctx.user.id,
                                    action: "project_budget_updated",
                                    entityType: "projectBudget",
                                    entityId: input.id,
                                    description: "Updated project budget"
                                })];
                        case 5:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                        case 6:
                            error_4 = _b.sent();
                            console.error("Error updating project budget:", error_4);
                            throw new Error("Failed to update project budget");
                        case 7: return [2 /*return*/];
                    }
                });
            });
        }),
        // Delete project budget
        "delete": writeProcedure
            .input(zod_1.z.string())
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, orgId, existing, error_5;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _b.sent();
                            if (!database)
                                throw new Error("Database not available");
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 7, , 8]);
                            orgId = ctx.user.organizationId;
                            if (!orgId) return [3 /*break*/, 4];
                            return [4 /*yield*/, database.select().from(schema_extended_1.projectBudgets).where(drizzle_orm_1.eq(schema_extended_1.projectBudgets.id, input)).limit(1)];
                        case 3:
                            existing = _b.sent();
                            if (!existing.length || existing[0].organizationId !== orgId)
                                throw new Error("Budget not found");
                            _b.label = 4;
                        case 4: return [4 /*yield*/, database["delete"](schema_extended_1.projectBudgets).where(drizzle_orm_1.eq(schema_extended_1.projectBudgets.id, input))];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, db.logActivity({
                                    userId: ctx.user.id,
                                    action: "project_budget_deleted",
                                    entityType: "projectBudget",
                                    entityId: input,
                                    description: "Deleted project budget"
                                })];
                        case 6:
                            _b.sent();
                            return [2 /*return*/, { success: true }];
                        case 7:
                            error_5 = _b.sent();
                            console.error("Error deleting project budget:", error_5);
                            throw new Error("Failed to delete project budget");
                        case 8: return [2 /*return*/];
                    }
                });
            });
        })
    }),
    // ========== DEPARTMENT BUDGETS ==========
    departmentBudgets: trpc_1.router({
        // List department budgets
        list: readProcedure
            .input(zod_1.z.object({
            year: zod_1.z.number(),
            departmentId: zod_1.z.string().optional(),
            status: zod_1.z["enum"](["under", "at", "over"]).optional()
        }).optional())
            .query(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, orgId, conditions, whereClause;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _b.sent();
                            if (!database)
                                return [2 /*return*/, []];
                            orgId = ctx.user.organizationId;
                            conditions = [];
                            conditions.push(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.year, (input === null || input === void 0 ? void 0 : input.year) || new Date().getFullYear()));
                            if (orgId)
                                conditions.push(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.organizationId, orgId));
                            if (input === null || input === void 0 ? void 0 : input.departmentId)
                                conditions.push(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.departmentId, input.departmentId));
                            if (input === null || input === void 0 ? void 0 : input.status)
                                conditions.push(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.budgetStatus, input.status));
                            whereClause = conditions.length === 1 ? conditions[0] : drizzle_orm_1.and.apply(void 0, conditions);
                            return [4 /*yield*/, database.select().from(schema_extended_1.departmentBudgets)
                                    .where(whereClause)
                                    .orderBy(drizzle_orm_1.desc(schema_extended_1.departmentBudgets.createdAt))];
                        case 2: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        }),
        // Create department budget
        create: writeProcedure
            .input(zod_1.z.object({
            departmentId: zod_1.z.string(),
            year: zod_1.z.number(),
            budgetedAmount: zod_1.z.number(),
            category: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, id, budgetedCents, error_6;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _b.sent();
                            if (!database)
                                throw new Error("Database not available");
                            id = uuid_1.v4();
                            budgetedCents = Math.round(input.budgetedAmount * 100);
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 5, , 6]);
                            return [4 /*yield*/, database.insert(schema_extended_1.departmentBudgets).values({
                                    id: id,
                                    departmentId: input.departmentId,
                                    year: input.year,
                                    budgetedAmount: budgetedCents,
                                    spent: 0,
                                    remaining: budgetedCents,
                                    budgetStatus: "under",
                                    category: input.category,
                                    notes: input.notes,
                                    createdBy: ctx.user.id,
                                    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                })];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, db.logActivity({
                                    userId: ctx.user.id,
                                    action: "department_budget_created",
                                    entityType: "departmentBudget",
                                    entityId: id,
                                    description: "Created budget for department " + input.year
                                })];
                        case 4:
                            _b.sent();
                            return [2 /*return*/, { id: id }];
                        case 5:
                            error_6 = _b.sent();
                            console.error("Error creating department budget:", error_6);
                            throw new Error("Failed to create department budget");
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }),
        // Update department budget spent amount (based on actual expenses linked via budgetAllocations)
        updateSpent: writeProcedure
            .input(zod_1.z.object({
            departmentId: zod_1.z.string(),
            year: zod_1.z.number()
        }))
            .mutation(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, orgId, budgetConditions, budget, yearStart, yearEnd, result, totalSpent, error_7;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _c.sent();
                            if (!database)
                                throw new Error("Database unavailable");
                            orgId = ctx.user.organizationId;
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 6, , 7]);
                            budgetConditions = [
                                drizzle_orm_1.eq(schema_extended_1.departmentBudgets.departmentId, input.departmentId),
                                drizzle_orm_1.eq(schema_extended_1.departmentBudgets.year, input.year),
                            ];
                            if (orgId)
                                budgetConditions.push(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.organizationId, orgId));
                            return [4 /*yield*/, database.select().from(schema_extended_1.departmentBudgets)
                                    .where(drizzle_orm_1.and.apply(void 0, budgetConditions)).limit(1)];
                        case 3:
                            budget = (_c.sent())[0];
                            if (!budget)
                                throw new Error("Department budget not found");
                            yearStart = input.year + "-01-01";
                            yearEnd = input.year + "-12-31";
                            return [4 /*yield*/, database.execute("SELECT COALESCE(SUM(e.amount), 0) as totalSpent\n             FROM expenses e\n             INNER JOIN employees emp ON e.createdBy = emp.userId\n             WHERE emp.department = (SELECT name FROM departments WHERE id = ?)\n             AND e.status = 'approved'\n             AND e.expenseDate BETWEEN ? AND ?\n             " + (orgId ? 'AND e.organizationId = ?' : ''), orgId ? [input.departmentId, yearStart, yearEnd, orgId] : [input.departmentId, yearStart, yearEnd])];
                        case 4:
                            result = (_c.sent())[0];
                            totalSpent = Number(((_b = result === null || result === void 0 ? void 0 : result[0]) === null || _b === void 0 ? void 0 : _b.totalSpent) || 0);
                            return [4 /*yield*/, database.update(schema_extended_1.departmentBudgets).set({
                                    spent: totalSpent,
                                    budgetStatus: totalSpent > budget.amount ? 'over' : 'under',
                                    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                                }).where(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.id, budget.id))];
                        case 5:
                            _c.sent();
                            return [2 /*return*/, { success: true, spent: totalSpent, budgetId: budget.id }];
                        case 6:
                            error_7 = _c.sent();
                            console.error("Error updating department budget spent:", error_7);
                            throw new Error("Failed to update department budget spent amount");
                        case 7: return [2 /*return*/];
                    }
                });
            });
        })
    }),
    // ========== BUDGET DASHBOARD & ANALYTICS ==========
    dashboard: trpc_1.router({
        // Get overall budget summary
        summary: readProcedure
            .input(zod_1.z.object({ year: zod_1.z.number().optional() }).optional())
            .query(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, year, orgId, projectBudgetsData, _b, deptBudgetData, _c, totalProjectBudget, totalProjectSpent, totalDeptBudget, totalDeptSpent, overBudgetCount, error_8;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _d.sent();
                            if (!database)
                                return [2 /*return*/, null];
                            year = (input === null || input === void 0 ? void 0 : input.year) || new Date().getFullYear();
                            orgId = ctx.user.organizationId;
                            _d.label = 2;
                        case 2:
                            _d.trys.push([2, 11, , 12]);
                            if (!orgId) return [3 /*break*/, 4];
                            return [4 /*yield*/, database.select().from(schema_extended_1.projectBudgets).where(drizzle_orm_1.eq(schema_extended_1.projectBudgets.organizationId, orgId))];
                        case 3:
                            _b = _d.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, database.select().from(schema_extended_1.projectBudgets)];
                        case 5:
                            _b = _d.sent();
                            _d.label = 6;
                        case 6:
                            projectBudgetsData = _b;
                            if (!orgId) return [3 /*break*/, 8];
                            return [4 /*yield*/, database.select().from(schema_extended_1.departmentBudgets).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.year, year), drizzle_orm_1.eq(schema_extended_1.departmentBudgets.organizationId, orgId)))];
                        case 7:
                            _c = _d.sent();
                            return [3 /*break*/, 10];
                        case 8: return [4 /*yield*/, database.select().from(schema_extended_1.departmentBudgets).where(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.year, year))];
                        case 9:
                            _c = _d.sent();
                            _d.label = 10;
                        case 10:
                            deptBudgetData = _c;
                            totalProjectBudget = projectBudgetsData.reduce(function (sum, b) { return sum + (b.budgetedAmount || 0); }, 0);
                            totalProjectSpent = projectBudgetsData.reduce(function (sum, b) { return sum + (b.spent || 0); }, 0);
                            totalDeptBudget = deptBudgetData.reduce(function (sum, b) { return sum + (b.budgetedAmount || 0); }, 0);
                            totalDeptSpent = deptBudgetData.reduce(function (sum, b) { return sum + (b.spent || 0); }, 0);
                            overBudgetCount = deptBudgetData.filter(function (b) { return b.budgetStatus === "over"; }).length;
                            return [2 /*return*/, {
                                    year: year,
                                    projects: {
                                        total: totalProjectBudget,
                                        spent: totalProjectSpent,
                                        remaining: totalProjectBudget - totalProjectSpent,
                                        percentage: totalProjectBudget > 0 ? Math.round((totalProjectSpent / totalProjectBudget) * 100) : 0
                                    },
                                    departments: {
                                        total: totalDeptBudget,
                                        spent: totalDeptSpent,
                                        remaining: totalDeptBudget - totalDeptSpent,
                                        percentage: totalDeptBudget > 0 ? Math.round((totalDeptSpent / totalDeptBudget) * 100) : 0,
                                        overBudgetCount: overBudgetCount
                                    },
                                    combined: {
                                        total: totalProjectBudget + totalDeptBudget,
                                        spent: totalProjectSpent + totalDeptSpent,
                                        remaining: (totalProjectBudget + totalDeptBudget) - (totalProjectSpent + totalDeptSpent)
                                    }
                                }];
                        case 11:
                            error_8 = _d.sent();
                            console.error("Error fetching budget summary:", error_8);
                            return [2 /*return*/, null];
                        case 12: return [2 /*return*/];
                    }
                });
            });
        }),
        // Get budget vs actual comparison by department
        byDepartment: readProcedure
            .input(zod_1.z.object({ year: zod_1.z.number().optional() }).optional())
            .query(function (_a) {
            var input = _a.input, ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, year, orgId, deptBudgets, _b, error_9;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _c.sent();
                            if (!database)
                                return [2 /*return*/, []];
                            year = (input === null || input === void 0 ? void 0 : input.year) || new Date().getFullYear();
                            orgId = ctx.user.organizationId;
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 7, , 8]);
                            if (!orgId) return [3 /*break*/, 4];
                            return [4 /*yield*/, database.select().from(schema_extended_1.departmentBudgets).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.year, year), drizzle_orm_1.eq(schema_extended_1.departmentBudgets.organizationId, orgId)))];
                        case 3:
                            _b = _c.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, database.select().from(schema_extended_1.departmentBudgets).where(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.year, year))];
                        case 5:
                            _b = _c.sent();
                            _c.label = 6;
                        case 6:
                            deptBudgets = _b;
                            return [2 /*return*/, deptBudgets.map(function (budget) { return ({
                                    id: budget.id,
                                    departmentId: budget.departmentId,
                                    category: budget.category,
                                    budgeted: budget.budgetedAmount,
                                    spent: budget.spent,
                                    remaining: budget.remaining,
                                    percentage: budget.budgetedAmount > 0 ? Math.round((budget.spent / budget.budgetedAmount) * 100) : 0,
                                    status: budget.budgetStatus,
                                    notes: budget.notes
                                }); })];
                        case 7:
                            error_9 = _c.sent();
                            console.error("Error fetching department budgets:", error_9);
                            return [2 /*return*/, []];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        }),
        // Get budget vs actual comparison by project
        byProject: readProcedure.query(function (_a) {
            var ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, orgId, budgets_1, _b, error_10;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _c.sent();
                            if (!database)
                                return [2 /*return*/, []];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 7, , 8]);
                            orgId = ctx.user.organizationId;
                            if (!orgId) return [3 /*break*/, 4];
                            return [4 /*yield*/, database.select().from(schema_extended_1.projectBudgets).where(drizzle_orm_1.eq(schema_extended_1.projectBudgets.organizationId, orgId))];
                        case 3:
                            _b = _c.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, database.select().from(schema_extended_1.projectBudgets)];
                        case 5:
                            _b = _c.sent();
                            _c.label = 6;
                        case 6:
                            budgets_1 = _b;
                            return [2 /*return*/, budgets_1.map(function (budget) { return ({
                                    id: budget.id,
                                    projectId: budget.projectId,
                                    budgeted: budget.budgetedAmount,
                                    spent: budget.spent,
                                    remaining: budget.remaining,
                                    percentage: budget.budgetedAmount > 0 ? Math.round((budget.spent / budget.budgetedAmount) * 100) : 0,
                                    status: budget.budgetStatus,
                                    startDate: budget.startDate,
                                    endDate: budget.endDate
                                }); })];
                        case 7:
                            error_10 = _c.sent();
                            console.error("Error fetching project budgets:", error_10);
                            return [2 /*return*/, []];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        }),
        // Get alerts for over-budget items
        alerts: readProcedure.query(function (_a) {
            var ctx = _a.ctx;
            return __awaiter(void 0, void 0, void 0, function () {
                var database, orgId, overBudget, _b, error_11;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, db_1.getDb()];
                        case 1:
                            database = _c.sent();
                            if (!database)
                                return [2 /*return*/, []];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 7, , 8]);
                            orgId = ctx.user.organizationId;
                            if (!orgId) return [3 /*break*/, 4];
                            return [4 /*yield*/, database.select().from(schema_extended_1.departmentBudgets).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.budgetStatus, "over"), drizzle_orm_1.eq(schema_extended_1.departmentBudgets.organizationId, orgId)))];
                        case 3:
                            _b = _c.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, database.select().from(schema_extended_1.departmentBudgets).where(drizzle_orm_1.eq(schema_extended_1.departmentBudgets.budgetStatus, "over"))];
                        case 5:
                            _b = _c.sent();
                            _c.label = 6;
                        case 6:
                            overBudget = _b;
                            return [2 /*return*/, overBudget.map(function (budget) { return ({
                                    id: budget.id,
                                    type: "department",
                                    name: budget.departmentId,
                                    category: budget.category,
                                    budgeted: budget.budgetedAmount,
                                    spent: budget.spent,
                                    overage: budget.spent - budget.budgetedAmount,
                                    percentage: Math.round((budget.spent / budget.budgetedAmount) * 100),
                                    severity: budget.spent > budget.budgetedAmount * 1.2 ? "critical" : "warning"
                                }); })];
                        case 7:
                            error_11 = _c.sent();
                            console.error("Error fetching budget alerts:", error_11);
                            return [2 /*return*/, []];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        })
    })
});
