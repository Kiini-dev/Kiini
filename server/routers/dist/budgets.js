"use strict";
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
exports.budgetsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var db = require("../db");
var server_1 = require("@trpc/server");
var schema_1 = require("../../drizzle/schema");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
exports.budgetsRouter = trpc_1.router({
    listLines: trpc_1.createFeatureRestrictedProcedure("budgets:view")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, rows, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.budgetAllocations)
                                .where(drizzle_orm_1.eq(schema_extended_1.budgetAllocations.budgetId, input))
                                .orderBy(schema_extended_1.budgetAllocations.categoryName)];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, rows.map(function (row) {
                                var allocated = row.allocatedAmount || 0;
                                var spent = row.spentAmount || 0;
                                var remaining = allocated - spent;
                                var utilization = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
                                var status = remaining <= 0 ? "exhausted" : "active";
                                return {
                                    id: row.id,
                                    budgetId: row.budgetId,
                                    category: row.categoryName,
                                    lineDescription: row.notes || "",
                                    allocatedAmount: allocated,
                                    spentAmount: spent,
                                    remainingAmount: remaining,
                                    utilizationPercentage: utilization,
                                    status: status
                                };
                            })];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching budget lines:", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    createLine: trpc_1.createFeatureRestrictedProcedure("budgets:create")
        .input(zod_1.z.object({
        budgetId: zod_1.z.string(),
        category: zod_1.z.string().min(1),
        lineDescription: zod_1.z.string().optional(),
        allocatedAmount: zod_1.z.number().nonnegative()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, now, totalBudgetedRow, totalBudgeted, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.insert(schema_extended_1.budgetAllocations).values({
                                id: id,
                                budgetId: input.budgetId,
                                categoryName: input.category,
                                allocatedAmount: input.allocatedAmount,
                                spentAmount: 0,
                                notes: input.lineDescription || null,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, database
                                .select({ total: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["COALESCE(SUM(", "), 0)"], ["COALESCE(SUM(", "), 0)"])), schema_extended_1.budgetAllocations.allocatedAmount) })
                                .from(schema_extended_1.budgetAllocations)
                                .where(drizzle_orm_1.eq(schema_extended_1.budgetAllocations.budgetId, input.budgetId))];
                    case 3:
                        totalBudgetedRow = _c.sent();
                        totalBudgeted = ((_b = totalBudgetedRow === null || totalBudgetedRow === void 0 ? void 0 : totalBudgetedRow[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
                        return [4 /*yield*/, database.update(schema_1.budgets).set({
                                totalBudgeted: totalBudgeted,
                                updatedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.budgets.id, input.budgetId))];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_line_created",
                                entityType: "budgetAllocation",
                                entityId: id,
                                description: "Created budget line for budget " + input.budgetId + " with Ksh " + input.allocatedAmount / 100
                            })];
                    case 5:
                        _c.sent();
                        return [2 /*return*/, { id: id }];
                    case 6:
                        error_2 = _c.sent();
                        console.error("Error creating budget line:", error_2);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create budget line: " + error_2.message
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    updateLine: trpc_1.createFeatureRestrictedProcedure("budgets:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        category: zod_1.z.string().optional(),
        lineDescription: zod_1.z.string().optional(),
        allocatedAmount: zod_1.z.number().nonnegative().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing, updateData, budgetId, totalBudgetedRow, totalBudgeted, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.budgetAllocations)
                                .where(drizzle_orm_1.eq(schema_extended_1.budgetAllocations.id, input.id))
                                .limit(1)];
                    case 2:
                        existing = _c.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Budget line not found" });
                        }
                        updateData = {
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        if (input.category !== undefined)
                            updateData.categoryName = input.category;
                        if (input.lineDescription !== undefined)
                            updateData.notes = input.lineDescription;
                        if (input.allocatedAmount !== undefined)
                            updateData.allocatedAmount = input.allocatedAmount;
                        return [4 /*yield*/, database.update(schema_extended_1.budgetAllocations).set(updateData).where(drizzle_orm_1.eq(schema_extended_1.budgetAllocations.id, input.id))];
                    case 3:
                        _c.sent();
                        budgetId = existing[0].budgetId;
                        return [4 /*yield*/, database
                                .select({ total: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["COALESCE(SUM(", "), 0)"], ["COALESCE(SUM(", "), 0)"])), schema_extended_1.budgetAllocations.allocatedAmount) })
                                .from(schema_extended_1.budgetAllocations)
                                .where(drizzle_orm_1.eq(schema_extended_1.budgetAllocations.budgetId, budgetId))];
                    case 4:
                        totalBudgetedRow = _c.sent();
                        totalBudgeted = ((_b = totalBudgetedRow === null || totalBudgetedRow === void 0 ? void 0 : totalBudgetedRow[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
                        return [4 /*yield*/, database.update(schema_1.budgets).set({
                                totalBudgeted: totalBudgeted,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            }).where(drizzle_orm_1.eq(schema_1.budgets.id, budgetId))];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_line_updated",
                                entityType: "budgetAllocation",
                                entityId: input.id,
                                description: "Updated budget line " + input.id
                            })];
                    case 6:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 7:
                        error_3 = _c.sent();
                        console.error("Error updating budget line:", error_3);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update budget line: " + error_3.message
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    deleteLine: trpc_1.createFeatureRestrictedProcedure("budgets:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing, budgetId, totalBudgetedRow, totalBudgeted, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_extended_1.budgetAllocations)
                                .where(drizzle_orm_1.eq(schema_extended_1.budgetAllocations.id, input))
                                .limit(1)];
                    case 2:
                        existing = _c.sent();
                        if (!existing.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Budget line not found" });
                        }
                        budgetId = existing[0].budgetId;
                        return [4 /*yield*/, database["delete"](schema_extended_1.budgetAllocations).where(drizzle_orm_1.eq(schema_extended_1.budgetAllocations.id, input))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, database
                                .select({ total: drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["COALESCE(SUM(", "), 0)"], ["COALESCE(SUM(", "), 0)"])), schema_extended_1.budgetAllocations.allocatedAmount) })
                                .from(schema_extended_1.budgetAllocations)
                                .where(drizzle_orm_1.eq(schema_extended_1.budgetAllocations.budgetId, budgetId))];
                    case 4:
                        totalBudgetedRow = _c.sent();
                        totalBudgeted = ((_b = totalBudgetedRow === null || totalBudgetedRow === void 0 ? void 0 : totalBudgetedRow[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
                        return [4 /*yield*/, database.update(schema_1.budgets).set({
                                totalBudgeted: totalBudgeted,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            }).where(drizzle_orm_1.eq(schema_1.budgets.id, budgetId))];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_line_deleted",
                                entityType: "budgetAllocation",
                                entityId: input,
                                description: "Deleted budget line " + input
                            })];
                    case 6:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 7:
                        error_4 = _c.sent();
                        console.error("Error deleting budget line:", error_4);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to delete budget line: " + error_4.message
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    list: trpc_1.createFeatureRestrictedProcedure("budgets:view")
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        departmentId: zod_1.z.string().optional(),
        fiscalYear: zod_1.z.number().optional()
    }).optional())
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, q, results, _b, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        q = database
                            .select({
                            id: schema_1.budgets.id,
                            departmentId: schema_1.budgets.departmentId,
                            departmentName: schema_1.departments.name,
                            amount: schema_1.budgets.amount,
                            remaining: schema_1.budgets.remaining,
                            fiscalYear: schema_1.budgets.fiscalYear,
                            createdAt: schema_1.budgets.createdAt
                        })
                            .from(schema_1.budgets)
                            .leftJoin(schema_1.departments, drizzle_orm_1.eq(schema_1.budgets.departmentId, schema_1.departments.id));
                        if (!orgId) return [3 /*break*/, 3];
                        return [4 /*yield*/, q.where(drizzle_orm_1.eq(schema_1.budgets.organizationId, orgId)).orderBy(drizzle_orm_1.desc(schema_1.budgets.fiscalYear), drizzle_orm_1.desc(schema_1.budgets.createdAt)).limit(100).offset(0)];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, q.orderBy(drizzle_orm_1.desc(schema_1.budgets.fiscalYear), drizzle_orm_1.desc(schema_1.budgets.createdAt)).limit(100).offset(0)];
                    case 4:
                        _b = _c.sent();
                        _c.label = 5;
                    case 5:
                        results = _b;
                        return [2 /*return*/, results || []];
                    case 6:
                        error_5 = _c.sent();
                        console.error("Error fetching budgets:", error_5);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    getById: trpc_1.createFeatureRestrictedProcedure("budgets:view")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, result, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database
                                .select({
                                id: schema_1.budgets.id,
                                departmentId: schema_1.budgets.departmentId,
                                departmentName: schema_1.departments.name,
                                amount: schema_1.budgets.amount,
                                remaining: schema_1.budgets.remaining,
                                fiscalYear: schema_1.budgets.fiscalYear,
                                createdAt: schema_1.budgets.createdAt
                            })
                                .from(schema_1.budgets)
                                .leftJoin(schema_1.departments, drizzle_orm_1.eq(schema_1.budgets.departmentId, schema_1.departments.id))
                                .where(drizzle_orm_1.eq(schema_1.budgets.id, input))
                                .limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, (result === null || result === void 0 ? void 0 : result[0]) || null];
                    case 3:
                        error_6 = _b.sent();
                        console.error("Error fetching budget:", error_6);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    create: trpc_1.createFeatureRestrictedProcedure("budgets:create")
        .input(zod_1.z.object({
        departmentId: zod_1.z.string(),
        amount: zod_1.z.number().positive(),
        remaining: zod_1.z.number().positive(),
        fiscalYear: zod_1.z.number()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, now, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.insert(schema_1.budgets).values({
                                id: id,
                                departmentId: input.departmentId,
                                amount: input.amount,
                                remaining: input.remaining,
                                fiscalYear: input.fiscalYear,
                                budgetStatus: 'draft',
                                totalBudgeted: input.amount,
                                totalActual: 0,
                                variance: input.amount,
                                variancePercent: 0,
                                createdAt: now,
                                updatedAt: now,
                                organizationId: ctx.user.organizationId || null
                            })];
                    case 2:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_created",
                                entityType: "budget",
                                entityId: id,
                                description: "Created budget: Ksh " + input.amount.toLocaleString() + " for FY " + input.fiscalYear
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { id: id }];
                    case 4:
                        error_7 = _b.sent();
                        console.error("Error creating budget:", error_7);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create budget: " + error_7.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    update: trpc_1.createFeatureRestrictedProcedure("budgets:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        amount: zod_1.z.number().positive().optional(),
        remaining: zod_1.z.number().optional(),
        fiscalYear: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, updateData, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        updateData = {};
                        if (input.amount !== undefined)
                            updateData.amount = input.amount;
                        if (input.remaining !== undefined)
                            updateData.remaining = input.remaining;
                        if (input.fiscalYear !== undefined)
                            updateData.fiscalYear = input.fiscalYear;
                        if (Object.keys(updateData).length === 0) {
                            throw new Error("No fields to update");
                        }
                        updateData.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.budgets).set(updateData).where(drizzle_orm_1.eq(schema_1.budgets.id, input.id))];
                    case 2:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_updated",
                                entityType: "budget",
                                entityId: input.id,
                                description: "Updated budget"
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_8 = _b.sent();
                        console.error("Error updating budget:", error_8);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to update budget: " + error_8.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    "delete": trpc_1.createFeatureRestrictedProcedure("budgets:delete")
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database["delete"](schema_1.budgets).where(drizzle_orm_1.eq(schema_1.budgets.id, input))];
                    case 2:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_deleted",
                                entityType: "budget",
                                entityId: input,
                                description: "Deleted budget"
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_9 = _b.sent();
                        console.error("Error deleting budget:", error_9);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to delete budget: " + error_9.message
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    deductFromBudget: trpc_1.createFeatureRestrictedProcedure("budgets:edit")
        .input(zod_1.z.object({
        budgetId: zod_1.z.string(),
        amount: zod_1.z.number().positive(),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, budgetRecord, remaining, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select({ remaining: schema_1.budgets.remaining })
                                .from(schema_1.budgets)
                                .where(drizzle_orm_1.eq(schema_1.budgets.id, input.budgetId))
                                .limit(1)];
                    case 2:
                        budgetRecord = _b.sent();
                        if (!budgetRecord || budgetRecord.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Budget not found"
                            });
                        }
                        remaining = budgetRecord[0].remaining - input.amount;
                        if (remaining < 0) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Insufficient budget. Available: Ksh " + budgetRecord[0].remaining / 100
                            });
                        }
                        return [4 /*yield*/, database
                                .update(schema_1.budgets)
                                .set({
                                remaining: remaining,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.budgets.id, input.budgetId))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_deducted",
                                entityType: "budget",
                                entityId: input.budgetId,
                                description: "Deducted Ksh " + input.amount / 100 + " from budget. " + (input.reason || "")
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { remaining: remaining }];
                    case 5:
                        error_10 = _b.sent();
                        console.error("Error deducting from budget:", error_10);
                        if (error_10 instanceof server_1.TRPCError)
                            throw error_10;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to deduct from budget: " + error_10.message
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    getSummary: trpc_1.createFeatureRestrictedProcedure("budgets:view")
        .input(zod_1.z.object({
        fiscalYear: zod_1.z.number().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, year, result, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        year = (input === null || input === void 0 ? void 0 : input.fiscalYear) || new Date().getFullYear();
                        return [4 /*yield*/, database
                                .select({
                                totalBudget: drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["CAST(SUM(", ") AS UNSIGNED)"], ["CAST(SUM(", ") AS UNSIGNED)"])), schema_1.budgets.amount),
                                totalRemaining: drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["CAST(SUM(", ") AS UNSIGNED)"], ["CAST(SUM(", ") AS UNSIGNED)"])), schema_1.budgets.remaining),
                                totalSpent: drizzle_orm_1.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["CAST(SUM(", " - ", ") AS UNSIGNED)"], ["CAST(SUM(", " - ", ") AS UNSIGNED)"])), schema_1.budgets.amount, schema_1.budgets.remaining),
                                budgetCount: drizzle_orm_1.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))),
                                utilizationPercent: drizzle_orm_1.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["ROUND(((SUM(", ") - SUM(", ")) / SUM(", ")) * 100, 2)"], ["ROUND(((SUM(", ") - SUM(", ")) / SUM(", ")) * 100, 2)"])), schema_1.budgets.amount, schema_1.budgets.remaining, schema_1.budgets.amount)
                            })
                                .from(schema_1.budgets)
                                .where(drizzle_orm_1.eq(schema_1.budgets.fiscalYear, year))];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, (result === null || result === void 0 ? void 0 : result[0]) || null];
                    case 3:
                        error_11 = _b.sent();
                        console.error("Error fetching budget summary:", error_11);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8;
