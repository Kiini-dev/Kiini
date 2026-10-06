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
exports.professionalBudgetingRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
// Define typed procedures
var readProcedure = trpc_1.createFeatureRestrictedProcedure("budget:read");
var createProcedure = trpc_1.createFeatureRestrictedProcedure("budget:create");
var updateProcedure = trpc_1.createFeatureRestrictedProcedure("budget:update");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("budget:update");
/**
 * Professional Budgeting Router
 * Implements professional budgeting standards with multi-level allocations,
 * variance analysis, and detailed tracking
 */
exports.professionalBudgetingRouter = trpc_1.router({
    /**
     * Create professional budget with line items
     */
    createBudget: createProcedure
        .input(zod_1.z.object({
        budgetName: zod_1.z.string().min(1),
        budgetDescription: zod_1.z.string().optional(),
        departmentId: zod_1.z.string(),
        fiscalYear: zod_1.z.number(),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        budgetLines: zod_1.z.array(zod_1.z.object({
            accountId: zod_1.z.string(),
            budgeted: zod_1.z.number().nonnegative(),
            description: zod_1.z.string().optional()
        })),
        approvalRequired: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, deptData, totalBudgeted, accountsToProcess, _i, _b, line, accountData, budgetId_1, convertToMySQLDateTime, budgetData, budgetLinesData, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database not available"
                            });
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 10, , 11]);
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.departments)
                                .where(drizzle_orm_1.eq(schema_1.departments.id, input.departmentId))];
                    case 3:
                        deptData = _c.sent();
                        if (!deptData || deptData.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Department not found"
                            });
                        }
                        totalBudgeted = 0;
                        accountsToProcess = [];
                        _i = 0, _b = input.budgetLines;
                        _c.label = 4;
                    case 4:
                        if (!(_i < _b.length)) return [3 /*break*/, 7];
                        line = _b[_i];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.eq(schema_1.accounts.id, line.accountId))];
                    case 5:
                        accountData = _c.sent();
                        if (!accountData || accountData.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Account " + line.accountId + " not found"
                            });
                        }
                        totalBudgeted += line.budgeted;
                        accountsToProcess.push({ account: accountData[0], line: line });
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        budgetId_1 = uuid_1.v4();
                        convertToMySQLDateTime = function (date) {
                            var d = typeof date === 'string' ? new Date(date) : date;
                            return d.toISOString().replace('T', ' ').substring(0, 19);
                        };
                        budgetData = {
                            id: budgetId_1,
                            departmentId: input.departmentId,
                            amount: totalBudgeted,
                            remaining: totalBudgeted,
                            fiscalYear: input.fiscalYear,
                            budgetStatus: input.approvalRequired ? 'draft' : 'active',
                            createdBy: ctx.user.id
                        };
                        if (input.budgetName)
                            budgetData.budgetName = input.budgetName;
                        if (input.budgetDescription)
                            budgetData.budgetDescription = input.budgetDescription;
                        if (input.startDate)
                            budgetData.startDate = convertToMySQLDateTime(input.startDate);
                        if (input.endDate)
                            budgetData.endDate = convertToMySQLDateTime(input.endDate);
                        budgetData.totalBudgeted = totalBudgeted;
                        return [4 /*yield*/, database.insert(schema_1.budgets).values(budgetData)];
                    case 8:
                        _c.sent();
                        budgetLinesData = accountsToProcess.map(function (_a) {
                            var account = _a.account, line = _a.line;
                            return ({
                                id: uuid_1.v4(),
                                budgetId: budgetId_1,
                                accountId: line.accountId,
                                accountCode: account.accountCode,
                                accountName: account.accountName,
                                budgeted: line.budgeted,
                                actual: 0,
                                variance: line.budgeted,
                                description: line.description
                            });
                        });
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_created",
                                entityType: "budget",
                                entityId: budgetId_1,
                                description: "Professional budget \"" + input.budgetName + "\" created for FY" + input.fiscalYear + " with " + input.budgetLines.length + " line items, total: " + totalBudgeted
                            })];
                    case 9:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                budgetId: budgetId_1,
                                totalBudgeted: totalBudgeted,
                                budgetLines: budgetLinesData,
                                status: input.approvalRequired ? 'draft' : 'active'
                            }];
                    case 10:
                        error_1 = _c.sent();
                        if (error_1 instanceof server_1.TRPCError)
                            throw error_1;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create budget: " + error_1
                        });
                    case 11: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Import budget from CSV file
     * Supports bulk budget creation from structured CSV data
     */
    importBudgetFromCSV: createProcedure
        .input(zod_1.z.object({
        budgetName: zod_1.z.string(),
        budgetDescription: zod_1.z.string().optional(),
        departmentId: zod_1.z.string(),
        fiscalYear: zod_1.z.number(),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        csvData: zod_1.z.array(zod_1.z.object({
            accountCode: zod_1.z.string(),
            accountName: zod_1.z.string().optional(),
            budgeted: zod_1.z.number().nonnegative(),
            description: zod_1.z.string().optional()
        }))
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, errors, budgetLines, totalBudgeted, idx, row, csvLine, accountData, account, error_2, budgetId_2, convertToMySQLDateTime, budgetData, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database not available"
                            });
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 11, , 12]);
                        errors = [];
                        budgetLines = [];
                        totalBudgeted = 0;
                        idx = 0;
                        _b.label = 3;
                    case 3:
                        if (!(idx < input.csvData.length)) return [3 /*break*/, 8];
                        row = idx + 1;
                        csvLine = input.csvData[idx];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.eq(schema_1.accounts.accountCode, csvLine.accountCode))];
                    case 5:
                        accountData = _b.sent();
                        if (!accountData || accountData.length === 0) {
                            errors.push({
                                row: row,
                                message: "Account with code " + csvLine.accountCode + " not found"
                            });
                            return [3 /*break*/, 7];
                        }
                        account = accountData[0];
                        totalBudgeted += csvLine.budgeted;
                        budgetLines.push({
                            id: uuid_1.v4(),
                            budgetId: '',
                            accountId: account.id,
                            accountCode: account.accountCode,
                            accountName: account.accountName,
                            budgeted: csvLine.budgeted,
                            actual: 0,
                            variance: csvLine.budgeted,
                            description: csvLine.description || account.description || undefined
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _b.sent();
                        errors.push({
                            row: row,
                            message: "Error processing row: " + error_2
                        });
                        return [3 /*break*/, 7];
                    case 7:
                        idx++;
                        return [3 /*break*/, 3];
                    case 8:
                        if (budgetLines.length === 0) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "No valid budget lines could be imported from CSV. Errors: " + errors.map(function (e) { return e.message; }).join('; ')
                            });
                        }
                        budgetId_2 = uuid_1.v4();
                        convertToMySQLDateTime = function (date) {
                            var d = typeof date === 'string' ? new Date(date) : date;
                            return d.toISOString().replace('T', ' ').substring(0, 19);
                        };
                        budgetData = {
                            id: budgetId_2,
                            departmentId: input.departmentId,
                            amount: totalBudgeted,
                            remaining: totalBudgeted,
                            fiscalYear: input.fiscalYear,
                            budgetStatus: 'draft',
                            createdBy: ctx.user.id,
                            totalBudgeted: totalBudgeted
                        };
                        if (input.budgetName)
                            budgetData.budgetName = input.budgetName;
                        if (input.budgetDescription)
                            budgetData.budgetDescription = input.budgetDescription;
                        if (input.startDate)
                            budgetData.startDate = convertToMySQLDateTime(input.startDate);
                        if (input.endDate)
                            budgetData.endDate = convertToMySQLDateTime(input.endDate);
                        return [4 /*yield*/, database.insert(schema_1.budgets).values(budgetData)];
                    case 9:
                        _b.sent();
                        // Update budgetId in budget lines
                        budgetLines.forEach(function (line) { return line.budgetId = budgetId_2; });
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_imported_from_csv",
                                entityType: "budget",
                                entityId: budgetId_2,
                                description: "Budget imported from CSV with " + budgetLines.length + " line items (" + errors.length + " errors)"
                            })];
                    case 10:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                budgetId: budgetId_2,
                                totalBudgeted: totalBudgeted,
                                budgetLinesCount: budgetLines.length,
                                budgetLines: budgetLines,
                                errors: errors.length > 0 ? errors : undefined,
                                message: "Budget imported with " + budgetLines.length + " lines"
                            }];
                    case 11:
                        error_3 = _b.sent();
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to import budget: " + error_3
                        });
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Approve budget for implementation
     */
    approveBudget: writeProcedure
        .input(zod_1.z.object({
        budgetId: zod_1.z.string(),
        approvalNotes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, budgetData, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database not available"
                            });
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        // Only admins/super_admins/managers can approve budgets
                        if (!['super_admin', 'admin', 'manager'].includes(ctx.user.role)) {
                            throw new server_1.TRPCError({
                                code: "FORBIDDEN",
                                message: "Only admins or managers can approve budgets"
                            });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.budgets)
                                .where(drizzle_orm_1.eq(schema_1.budgets.id, input.budgetId))];
                    case 3:
                        budgetData = _b.sent();
                        if (!budgetData || budgetData.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Budget not found"
                            });
                        }
                        return [4 /*yield*/, database
                                .update(schema_1.budgets)
                                .set({
                                budgetStatus: 'active',
                                approvedBy: ctx.user.id,
                                approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.budgets.id, input.budgetId))];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_approved",
                                entityType: "budget",
                                entityId: input.budgetId,
                                description: "Budget approved for implementation. " + (input.approvalNotes || '')
                            })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Budget approved successfully"
                            }];
                    case 6:
                        error_4 = _b.sent();
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to approve budget: " + error_4
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get budget with variance analysis
     */
    getBudgetAnalysis: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, budgetData, budget;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database not available"
                            });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.budgets)
                                .where(drizzle_orm_1.eq(schema_1.budgets.id, input))];
                    case 2:
                        budgetData = _b.sent();
                        if (!budgetData || budgetData.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Budget not found"
                            });
                        }
                        budget = budgetData[0];
                        return [2 /*return*/, {
                                budget: budget,
                                variance: (budget.variancePercent || 0) / 100,
                                status: budget.budgetStatus,
                                utilizationPercent: budget.totalBudgeted > 0
                                    ? ((budget.totalActual || 0) / budget.totalBudgeted) * 100
                                    : 0
                            }];
                }
            });
        });
    }),
    /**
     * List all budgets for department/fiscal year with summary
     */
    listBudgets: readProcedure
        .input(zod_1.z.object({
        departmentId: zod_1.z.string().optional(),
        fiscalYear: zod_1.z.number().optional(),
        status: zod_1.z["enum"](['draft', 'active', 'inactive', 'closed']).optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, query, budgetList;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database not available"
                            });
                        }
                        query = database.select().from(schema_1.budgets);
                        if (input.departmentId) {
                            query = query.where(drizzle_orm_1.eq(schema_1.budgets.departmentId, input.departmentId));
                        }
                        if (input.fiscalYear) {
                            query = query.where(drizzle_orm_1.eq(schema_1.budgets.fiscalYear, input.fiscalYear));
                        }
                        if (input.status) {
                            query = query.where(drizzle_orm_1.eq(schema_1.budgets.budgetStatus, input.status));
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        budgetList = _b.sent();
                        return [2 /*return*/, budgetList.map(function (b) { return (__assign(__assign({}, b), { utilizationPercent: b.totalBudgeted > 0
                                    ? ((b.totalActual || 0) / b.totalBudgeted) * 100
                                    : 0, variancePercent: ((b.variancePercent || 0) / 100) })); })];
                }
            });
        });
    }),
    /**
     * Generate budget template for download
     */
    generateBudgetTemplate: writeProcedure
        .input(zod_1.z.object({
        fiscalYear: zod_1.z.number(),
        departmentId: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, accountList, template;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database not available"
                            });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.eq(schema_1.accounts.isActive, 1))];
                    case 2:
                        accountList = _b.sent();
                        template = {
                            budgetName: "FY" + input.fiscalYear + " Department Budget",
                            budgetDescription: 'Professional budget template',
                            departmentId: input.departmentId,
                            fiscalYear: input.fiscalYear,
                            startDate: input.fiscalYear + "-01-01",
                            endDate: input.fiscalYear + "-12-31",
                            instructions: [
                                '1. Fill in budgeted amounts for each account',
                                '2. Ensure all required accounts are included',
                                '3. Submit for approval',
                                '4. Budget cannot be modified after approval',
                            ],
                            csvData: accountList.map(function (acc) { return ({
                                accountCode: acc.accountCode,
                                accountName: acc.accountName,
                                budgeted: 0,
                                description: acc.description || ''
                            }); })
                        };
                        return [2 /*return*/, template];
                }
            });
        });
    })
});
