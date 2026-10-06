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
exports.expensesRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
var rbac_1 = require("../middleware/rbac");
var server_1 = require("@trpc/server");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var budgetEnforcer_1 = require("../utils/budgetEnforcer");
var coaLedger_1 = require("../utils/coaLedger");
// Permission-restricted procedure instances
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:expenses:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:expenses:create");
var approveProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:expenses:approve");
var rejectProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:expenses:reject");
var budgetProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:expenses:budget");
var deleteProcedure = enhancedRbac_1.createRoleRestrictedProcedure(["super_admin", "admin"]);
// Helper function to generate next expense number in format EXP-000000
function generateNextExpenseNumber(database) {
    return __awaiter(this, void 0, Promise, function () {
        var result, maxSequence, match, nextSequence, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, database.select({ expNum: schema_1.expenses.expenseNumber })
                            .from(schema_1.expenses)
                            .orderBy(drizzle_orm_1.desc(schema_1.expenses.expenseNumber))
                            .limit(1)];
                case 1:
                    result = _a.sent();
                    maxSequence = 0;
                    if (result && result.length > 0 && result[0].expNum) {
                        match = result[0].expNum.match(/(\d+)$/);
                        if (match) {
                            maxSequence = parseInt(match[1]);
                        }
                    }
                    nextSequence = maxSequence + 1;
                    return [2 /*return*/, "EXP-" + String(nextSequence).padStart(6, '0')];
                case 2:
                    err_1 = _a.sent();
                    console.warn("Error generating expense number, using default:", err_1);
                    return [2 /*return*/, "EXP-000001"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Helper function to update COA balance
function updateCOABalance(database, chartOfAccountId, amount, operation) {
    return __awaiter(this, void 0, void 0, function () {
        var coa, currentBalance, newBalance, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!chartOfAccountId)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.accounts)
                            .where(drizzle_orm_1.eq(schema_1.accounts.id, chartOfAccountId.toString()))
                            .limit(1)];
                case 2:
                    coa = _a.sent();
                    if (!coa.length)
                        return [2 /*return*/];
                    currentBalance = coa[0].balance || 0;
                    newBalance = operation === 'add' ? currentBalance + amount : currentBalance - amount;
                    return [4 /*yield*/, database
                            .update(schema_1.accounts)
                            .set({ balance: newBalance })
                            .where(drizzle_orm_1.eq(schema_1.accounts.id, chartOfAccountId.toString()))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error updating COA balance:", error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.expensesRouter = trpc_1.router({
    list: viewProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        status: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, query, results, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        query = orgId
                            ? database.select().from(schema_1.expenses).where(drizzle_orm_1.eq(schema_1.expenses.organizationId, orgId))
                            : database.select().from(schema_1.expenses);
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            query = orgId
                                ? database.select().from(schema_1.expenses).where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.expenses.organizationId, orgId), drizzle_orm_1.eq(schema_1.expenses.status, input.status)))
                                : database.select().from(schema_1.expenses).where(drizzle_orm_1.eq(schema_1.expenses.status, input.status));
                        }
                        return [4 /*yield*/, query.limit((input === null || input === void 0 ? void 0 : input.limit) || 100).offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2:
                        results = _b.sent();
                        return [2 /*return*/, results];
                    case 3:
                        error_2 = _b.sent();
                        console.error("Error fetching expenses list:", error_2);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    getNextExpenseNumber: viewProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, nextNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error("Database not available");
                    return [4 /*yield*/, generateNextExpenseNumber(database)];
                case 2:
                    nextNumber = _a.sent();
                    return [2 /*return*/, { expenseNumber: nextNumber }];
            }
        });
    }); }),
    getById: viewProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where, result, items;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.expenses.id, input), drizzle_orm_1.eq(schema_1.expenses.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.expenses.id, input);
                        return [4 /*yield*/, database.select().from(schema_1.expenses).where(where).limit(1)];
                    case 2:
                        result = _b.sent();
                        if (!result[0])
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(schema_1.lineItems)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.lineItems.documentId, input), drizzle_orm_1.eq(schema_1.lineItems.documentType, 'expense')))];
                    case 3:
                        items = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, result[0]), { items: items })];
                }
            });
        });
    }),
    create: createProcedure
        .input(zod_1.z.object({
        expenseNumber: zod_1.z.string().optional(),
        expenseDate: zod_1.z.date().or(zod_1.z.string()),
        category: zod_1.z.string().max(100),
        description: zod_1.z.string().max(500).optional(),
        amount: zod_1.z.number().positive(),
        vendor: zod_1.z.string().max(255).optional(),
        paymentMethod: zod_1.z["enum"](['cash', 'bank_transfer', 'cheque', 'card', 'other']).optional(),
        status: zod_1.z["enum"](['pending', 'approved', 'rejected', 'paid']).optional(),
        receiptUrl: zod_1.z.string().optional(),
        accountId: zod_1.z.string().optional(),
        chartOfAccountId: zod_1.z.number().int().nonnegative().optional(),
        budgetAllocationId: zod_1.z.string().optional(),
        items: zod_1.z.array(zod_1.z.object({
            description: zod_1.z.string().min(1),
            quantity: zod_1.z.number().int().positive(),
            rate: zod_1.z.number().positive(),
            amount: zod_1.z.number().positive(),
            taxRate: zod_1.z.number().optional(),
            taxAmount: zod_1.z.number().optional()
        })).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, expenseNumber, id, convertToMySQLDateTime, expenseDate, now, values, itemInserts, _i, itemInserts_1, itemInsert, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        expenseNumber = input.expenseNumber;
                        if (!!expenseNumber) return [3 /*break*/, 3];
                        return [4 /*yield*/, generateNextExpenseNumber(database)];
                    case 2:
                        expenseNumber = _c.sent();
                        _c.label = 3;
                    case 3:
                        id = uuid_1.v4();
                        convertToMySQLDateTime = function (date) {
                            if (!date)
                                return new Date().toISOString().replace('T', ' ').substring(0, 19);
                            if (typeof date === 'string')
                                return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
                            if (date instanceof Date)
                                return date.toISOString().replace('T', ' ').substring(0, 19);
                            return new Date().toISOString().replace('T', ' ').substring(0, 19);
                        };
                        expenseDate = convertToMySQLDateTime(input.expenseDate);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 13, , 14]);
                        values = {
                            id: id,
                            expenseNumber: expenseNumber,
                            expenseDate: expenseDate,
                            category: input.category,
                            amount: input.amount,
                            paymentMethod: input.paymentMethod || 'cash',
                            status: input.status || 'pending',
                            organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                            createdBy: ctx.user.id,
                            description: input.description || null,
                            vendor: input.vendor || null,
                            receiptUrl: input.receiptUrl || null,
                            accountId: input.accountId || null,
                            budgetAllocationId: input.budgetAllocationId || null,
                            chartOfAccountId: input.chartOfAccountId || null,
                            createdAt: now,
                            updatedAt: now
                        };
                        return [4 /*yield*/, database.insert(schema_1.expenses).values(values)];
                    case 5:
                        _c.sent();
                        if (!(input.items && input.items.length > 0)) return [3 /*break*/, 9];
                        itemInserts = input.items.map(function (item, idx) { return ({
                            id: uuid_1.v4(),
                            documentId: id,
                            documentType: 'expense',
                            description: item.description,
                            quantity: item.quantity,
                            rate: item.rate,
                            amount: item.amount,
                            taxRate: item.taxRate || 0,
                            taxAmount: item.taxAmount || 0,
                            lineNumber: idx + 1,
                            createdBy: ctx.user.id,
                            createdAt: now,
                            updatedAt: now
                        }); });
                        _i = 0, itemInserts_1 = itemInserts;
                        _c.label = 6;
                    case 6:
                        if (!(_i < itemInserts_1.length)) return [3 /*break*/, 9];
                        itemInsert = itemInserts_1[_i];
                        return [4 /*yield*/, database.insert(schema_1.lineItems).values(itemInsert)];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 6];
                    case 9:
                        if (!input.chartOfAccountId) return [3 /*break*/, 11];
                        return [4 /*yield*/, updateCOABalance(database, input.chartOfAccountId, input.amount, 'add')];
                    case 10:
                        _c.sent();
                        _c.label = 11;
                    case 11: 
                    // Log activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "expense_created",
                            entityType: "expense",
                            entityId: id,
                            description: "Created expense: " + input.category + " - Ksh " + input.amount / 100
                        })];
                    case 12:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { id: id }];
                    case 13:
                        error_3 = _c.sent();
                        console.error("Error creating expense:", error_3);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create expense: " + error_3.message
                        });
                    case 14: return [2 /*return*/];
                }
            });
        });
    }),
    update: createProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        expenseNumber: zod_1.z.string().optional(),
        expenseDate: zod_1.z.date().or(zod_1.z.string()).optional(),
        category: zod_1.z.string().max(100).optional(),
        description: zod_1.z.string().max(500).optional(),
        amount: zod_1.z.number().positive().optional(),
        vendor: zod_1.z.string().max(255).optional(),
        paymentMethod: zod_1.z["enum"](['cash', 'bank_transfer', 'cheque', 'card', 'other']).optional(),
        status: zod_1.z["enum"](['pending', 'approved', 'rejected', 'paid']).optional(),
        receiptUrl: zod_1.z.string().optional(),
        accountId: zod_1.z.string().optional(),
        chartOfAccountId: zod_1.z.number().int().nonnegative().optional(),
        budgetAllocationId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, ownerCheck, expense, oldExpense, updateData, date, oldCoaId, newCoaId, oldAmount, newAmount, difference;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        ownerCheck = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.expenses.id, input.id), drizzle_orm_1.eq(schema_1.expenses.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.expenses.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.expenses).where(ownerCheck).limit(1)];
                    case 2:
                        expense = _b.sent();
                        if (!expense.length)
                            throw new Error("Expense not found");
                        oldExpense = expense[0];
                        updateData = {};
                        if (input.expenseDate) {
                            date = typeof input.expenseDate === 'string'
                                ? new Date(input.expenseDate).toISOString().replace('T', ' ').substring(0, 19)
                                : input.expenseDate.toISOString().replace('T', ' ').substring(0, 19);
                            updateData.expenseDate = date;
                        }
                        if (input.expenseNumber)
                            updateData.expenseNumber = input.expenseNumber;
                        if (input.category)
                            updateData.category = input.category;
                        if (input.description)
                            updateData.description = input.description;
                        if (input.amount)
                            updateData.amount = input.amount;
                        if (input.vendor)
                            updateData.vendor = input.vendor;
                        if (input.paymentMethod)
                            updateData.paymentMethod = input.paymentMethod;
                        if (input.status)
                            updateData.status = input.status;
                        if (input.receiptUrl)
                            updateData.receiptUrl = input.receiptUrl;
                        if (input.accountId)
                            updateData.accountId = input.accountId;
                        if (input.budgetAllocationId !== undefined)
                            updateData.budgetAllocationId = input.budgetAllocationId;
                        if (input.chartOfAccountId !== undefined)
                            updateData.chartOfAccountId = input.chartOfAccountId;
                        updateData.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        if (!(input.chartOfAccountId !== undefined || input.amount !== undefined)) return [3 /*break*/, 8];
                        oldCoaId = oldExpense.chartOfAccountId;
                        newCoaId = input.chartOfAccountId !== undefined ? input.chartOfAccountId : oldExpense.chartOfAccountId;
                        oldAmount = oldExpense.amount;
                        newAmount = input.amount || oldExpense.amount;
                        if (!(oldCoaId && oldCoaId !== newCoaId)) return [3 /*break*/, 6];
                        return [4 /*yield*/, updateCOABalance(database, oldCoaId, oldAmount, 'subtract')];
                    case 3:
                        _b.sent();
                        if (!newCoaId) return [3 /*break*/, 5];
                        return [4 /*yield*/, updateCOABalance(database, newCoaId, newAmount, 'add')];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        if (!(oldAmount !== newAmount && newCoaId)) return [3 /*break*/, 8];
                        difference = newAmount - oldAmount;
                        return [4 /*yield*/, updateCOABalance(database, newCoaId, difference, 'add')];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [4 /*yield*/, database.update(schema_1.expenses).set(updateData).where(drizzle_orm_1.eq(schema_1.expenses.id, input.id))];
                    case 9:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "expense_updated",
                                entityType: "expense",
                                entityId: input.id,
                                description: "Updated expense: " + oldExpense.category
                            })];
                    case 10:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, expense, orgId, where;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        // Check permission to delete expenses
                        if (!rbac_1.hasPermission(ctx.user.role, "DELETE_EXPENSE")) {
                            throw new server_1.TRPCError({
                                code: "FORBIDDEN",
                                message: "You do not have permission to delete expenses. Only Super Admin, Admin, and Accountant roles can delete expenses."
                            });
                        }
                        return [4 /*yield*/, database.select().from(schema_1.expenses).where(drizzle_orm_1.eq(schema_1.expenses.id, input)).limit(1)];
                    case 2:
                        expense = _b.sent();
                        if (!expense.length)
                            throw new Error("Expense not found");
                        if (!expense[0].chartOfAccountId) return [3 /*break*/, 4];
                        return [4 /*yield*/, updateCOABalance(database, expense[0].chartOfAccountId, expense[0].amount, 'subtract')];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.expenses.id, input), drizzle_orm_1.eq(schema_1.expenses.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.expenses.id, input);
                        return [4 /*yield*/, database["delete"](schema_1.expenses).where(where)];
                    case 5:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "expense_deleted",
                                entityType: "expense",
                                entityId: input,
                                description: "Deleted expense: " + expense[0].category
                            })];
                    case 6:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    approve: approveProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, expense, orgId, lines;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        rbac_1.validateApprovalAction(ctx.user.role, "expense");
                        return [4 /*yield*/, database.select().from(schema_1.expenses).where(drizzle_orm_1.eq(schema_1.expenses.id, input.id)).limit(1)];
                    case 2:
                        expense = _b.sent();
                        if (!expense.length)
                            throw new Error("Expense not found");
                        if (expense[0].status === "approved") {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Expense is already approved"
                            });
                        }
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 4];
                        return [4 /*yield*/, budgetEnforcer_1.enforceBudget(database, orgId, expense[0].amount)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [4 /*yield*/, database.update(schema_1.expenses).set({
                            status: "approved",
                            approvedBy: ctx.user.id,
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        }).where(drizzle_orm_1.eq(schema_1.expenses.id, input.id))];
                    case 5:
                        _b.sent();
                        if (!(orgId && expense[0].accountId)) return [3 /*break*/, 7];
                        lines = [];
                        if (expense[0].chartOfAccountId) {
                            lines.push({
                                accountId: String(expense[0].chartOfAccountId),
                                debit: expense[0].amount,
                                credit: 0,
                                description: "Expense: " + expense[0].category
                            });
                        }
                        lines.push({
                            accountId: expense[0].accountId,
                            debit: 0,
                            credit: expense[0].amount,
                            description: "Payment account credit: " + expense[0].category
                        });
                        return [4 /*yield*/, coaLedger_1.postJournalEntry(database, {
                                referenceType: "expense",
                                referenceId: input.id,
                                description: "Expense approved: " + expense[0].category + " \u2013 Ksh " + expense[0].amount / 100,
                                lines: lines,
                                date: new Date(),
                                createdBy: ctx.user.id
                            })["catch"](function (err) { return console.warn("Journal entry failed (non-fatal):", err); })];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: 
                    // Log activity
                    return [4 /*yield*/, db.logActivity({
                            userId: ctx.user.id,
                            action: "expense_approved",
                            entityType: "expense",
                            entityId: input.id,
                            description: "Approved expense: " + expense[0].category + " - Ksh " + expense[0].amount / 100 + (input.notes ? " (Notes: " + input.notes + ")" : '')
                        })];
                    case 8:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Expense approved successfully" }];
                }
            });
        });
    }),
    reject: rejectProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        reason: zod_1.z.string().min(1, "Rejection reason is required")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, expense;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        rbac_1.validateApprovalAction(ctx.user.role, "expense");
                        return [4 /*yield*/, database.select().from(schema_1.expenses).where(drizzle_orm_1.eq(schema_1.expenses.id, input.id)).limit(1)];
                    case 2:
                        expense = _b.sent();
                        if (!expense.length)
                            throw new Error("Expense not found");
                        if (expense[0].status === "rejected") {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Expense is already rejected"
                            });
                        }
                        return [4 /*yield*/, database.update(schema_1.expenses).set({
                                status: "rejected",
                                rejectedBy: ctx.user.id,
                                rejectionReason: input.reason,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            }).where(drizzle_orm_1.eq(schema_1.expenses.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "expense_rejected",
                                entityType: "expense",
                                entityId: input.id,
                                description: "Rejected expense: " + expense[0].category + " - Ksh " + expense[0].amount / 100 + " (Reason: " + input.reason + ")"
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Expense rejected successfully" }];
                }
            });
        });
    }),
    bulkApprove: approveProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()).min(1),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, _b, expenseId, expense, bulkOrgId, budgetErr_1, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        rbac_1.validateApprovalAction(ctx.user.role, "expense");
                        results = {
                            approved: 0,
                            failed: 0,
                            errors: []
                        };
                        _i = 0, _b = input.ids;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 13];
                        expenseId = _b[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 11, , 12]);
                        return [4 /*yield*/, database.select().from(schema_1.expenses).where(drizzle_orm_1.eq(schema_1.expenses.id, expenseId)).limit(1)];
                    case 4:
                        expense = _c.sent();
                        if (!expense.length) {
                            results.failed++;
                            results.errors.push("Expense " + expenseId + " not found");
                            return [3 /*break*/, 12];
                        }
                        if (expense[0].status === "approved") {
                            results.failed++;
                            results.errors.push("Expense " + expenseId + " is already approved");
                            return [3 /*break*/, 12];
                        }
                        bulkOrgId = ctx.user.organizationId;
                        if (!bulkOrgId) return [3 /*break*/, 8];
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, budgetEnforcer_1.enforceBudget(database, bulkOrgId, expense[0].amount)];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        budgetErr_1 = _c.sent();
                        results.failed++;
                        results.errors.push("Expense " + expenseId + ": " + budgetErr_1.message);
                        return [3 /*break*/, 12];
                    case 8: return [4 /*yield*/, database.update(schema_1.expenses).set({
                            status: "approved",
                            approvedBy: ctx.user.id,
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        }).where(drizzle_orm_1.eq(schema_1.expenses.id, expenseId))];
                    case 9:
                        _c.sent();
                        results.approved++;
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "expense_approved",
                                entityType: "expense",
                                entityId: expenseId,
                                description: "Bulk approved expense: " + expense[0].category + " - Ksh " + expense[0].amount / 100
                            })];
                    case 10:
                        // Log activity
                        _c.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        error_4 = _c.sent();
                        results.failed++;
                        results.errors.push("Error approving expense " + expenseId + ": " + error_4.message);
                        return [3 /*break*/, 12];
                    case 12:
                        _i++;
                        return [3 /*break*/, 2];
                    case 13: return [2 /*return*/, results];
                }
            });
        });
    }),
    // Get available budget allocations for linking with expenses
    getAvailableBudgetAllocations: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, budgetAllocations, _b, budgets, departments, _c, eq_1, isNull, and_1, allocations, allocationErr_1, budgetRows, error_5;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _e.sent();
                        if (!database) {
                            console.error("Database not available");
                            return [2 /*return*/, []];
                        }
                        orgId = ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.organizationId) || null;
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 11, , 12]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema-extended"); })];
                    case 3:
                        budgetAllocations = (_e.sent()).budgetAllocations;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 4:
                        _b = _e.sent(), budgets = _b.budgets, departments = _b.departments;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 5:
                        _c = _e.sent(), eq_1 = _c.eq, isNull = _c.isNull, and_1 = _c.and;
                        allocations = [];
                        _e.label = 6;
                    case 6:
                        _e.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, database
                                .select({
                                id: budgetAllocations.id,
                                budgetId: budgetAllocations.budgetId,
                                categoryName: budgetAllocations.categoryName,
                                allocatedAmount: budgetAllocations.allocatedAmount,
                                spentAmount: budgetAllocations.spentAmount
                            })
                                .from(budgetAllocations)
                                .innerJoin(budgets, eq_1(budgetAllocations.budgetId, budgets.id))
                                .where(orgId ? eq_1(budgets.organizationId, orgId) : isNull(budgets.organizationId))
                                .orderBy(budgetAllocations.categoryName)];
                    case 7:
                        allocations = _e.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        allocationErr_1 = _e.sent();
                        console.warn("Budget allocations table not available or error:", allocationErr_1.message);
                        allocations = [];
                        return [3 /*break*/, 9];
                    case 9:
                        if (allocations && allocations.length > 0) {
                            return [2 /*return*/, allocations.map(function (allocation) { return ({
                                    id: allocation.id,
                                    budgetId: allocation.budgetId,
                                    categoryName: allocation.categoryName,
                                    allocatedAmount: allocation.allocatedAmount || 0,
                                    spentAmount: allocation.spentAmount || 0,
                                    remaining: (allocation.allocatedAmount || 0) - (allocation.spentAmount || 0)
                                }); })];
                        }
                        return [4 /*yield*/, database
                                .select({
                                id: budgets.id,
                                budgetName: budgets.budgetName,
                                fiscalYear: budgets.fiscalYear,
                                amount: budgets.amount,
                                remaining: budgets.remaining,
                                totalActual: budgets.totalActual,
                                departmentName: departments.name
                            })
                                .from(budgets)
                                .leftJoin(departments, eq_1(budgets.departmentId, departments.id))
                                .where(orgId ? eq_1(budgets.organizationId, orgId) : isNull(budgets.organizationId))
                                .orderBy(budgets.fiscalYear)];
                    case 10:
                        budgetRows = _e.sent();
                        if (!budgetRows || budgetRows.length === 0) {
                            console.log("[Budget Allocations] No budgets found for organization: " + orgId);
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, budgetRows.map(function (b) {
                                var _a;
                                return ({
                                    id: b.id,
                                    budgetId: b.id,
                                    categoryName: b.budgetName
                                        || (b.departmentName ? b.departmentName + " - FY" + b.fiscalYear : "Budget FY" + b.fiscalYear),
                                    allocatedAmount: b.amount || 0,
                                    spentAmount: b.totalActual || 0,
                                    remaining: (_a = b.remaining) !== null && _a !== void 0 ? _a : ((b.amount || 0) - (b.totalActual || 0))
                                });
                            })];
                    case 11:
                        error_5 = _e.sent();
                        console.error("Error fetching budget allocations:", error_5);
                        return [2 /*return*/, []];
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    // Update expense with budget allocation
    updateBudgetAllocation: budgetProcedure
        .input(zod_1.z.object({
        expenseId: zod_1.z.string(),
        budgetAllocationId: zod_1.z.string().or(zod_1.z["null"]())
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, expense, error_6;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, database.select().from(schema_1.expenses).where(drizzle_orm_1.eq(schema_1.expenses.id, input.expenseId)).limit(1)];
                    case 3:
                        expense = _c.sent();
                        if (!expense.length) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Expense not found" });
                        }
                        // Update the expense with budget allocation
                        return [4 /*yield*/, database
                                .update(schema_1.expenses)
                                .set({
                                budgetAllocationId: (_b = input.budgetAllocationId) !== null && _b !== void 0 ? _b : null,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.expenses.id, input.expenseId))];
                    case 4:
                        // Update the expense with budget allocation
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "expense_budget_updated",
                                entityType: "expense",
                                entityId: input.expenseId,
                                description: input.budgetAllocationId
                                    ? "Linked expense to budget allocation " + input.budgetAllocationId
                                    : "Removed budget allocation from expense"
                            })];
                    case 5:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true, message: "Budget allocation updated" }];
                    case 6:
                        error_6 = _c.sent();
                        console.error("Error updating budget allocation:", error_6);
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_6.message || "Failed to update budget allocation"
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    // Get budget allocation report (which allocations are being used)
    getBudgetAllocationReport: budgetProcedure
        .input(zod_1.z.object({
        budgetAllocationId: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, budgetAllocations, budgets, _b, eqOp, isNullOp, andOp, query, orgCondition, result, error_7;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.organizationId) || null;
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema-extended"); })];
                    case 3:
                        budgetAllocations = (_d.sent()).budgetAllocations;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 4:
                        budgets = (_d.sent()).budgets;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 5:
                        _b = _d.sent(), eqOp = _b.eq, isNullOp = _b.isNull, andOp = _b.and;
                        query = database
                            .select({
                            allocationId: budgetAllocations.id,
                            budgetId: budgetAllocations.budgetId,
                            categoryName: budgetAllocations.categoryName,
                            allocatedAmount: budgetAllocations.allocatedAmount,
                            spentAmount: budgetAllocations.spentAmount,
                            expenseCount: database.fn.count(schema_1.expenses.id),
                            totalExpenseAmount: database.fn.sum(schema_1.expenses.amount)
                        })
                            .from(budgetAllocations)
                            .innerJoin(budgets, eqOp(budgetAllocations.budgetId, budgets.id))
                            .leftJoin(schema_1.expenses, eqOp(schema_1.expenses.budgetAllocationId, budgetAllocations.id));
                        orgCondition = orgId ? eqOp(budgets.organizationId, orgId) : isNullOp(budgets.organizationId);
                        if (input === null || input === void 0 ? void 0 : input.budgetAllocationId) {
                            query = query.where(andOp(orgCondition, eqOp(budgetAllocations.id, input.budgetAllocationId)));
                        }
                        else {
                            query = query.where(orgCondition);
                        }
                        return [4 /*yield*/, query.groupBy(budgetAllocations.id)];
                    case 6:
                        result = _d.sent();
                        return [2 /*return*/, result.map(function (row) { return ({
                                id: row.allocationId,
                                budgetId: row.budgetId,
                                categoryName: row.categoryName,
                                allocatedAmount: row.allocatedAmount,
                                spentAmount: row.spentAmount,
                                linkedExpenses: row.expenseCount || 0,
                                totalLinkedAmount: row.totalExpenseAmount || 0,
                                remaining: row.allocatedAmount - (row.spentAmount || 0),
                                utilizationPercentage: Math.round(((row.spentAmount || 0) / row.allocatedAmount) * 100)
                            }); })];
                    case 7:
                        error_7 = _d.sent();
                        console.error("Error fetching budget allocation report:", error_7);
                        return [2 /*return*/, []];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    // ── Recurring Expenses ───────────────────────────────────────────────
    createRecurringExpense: createProcedure
        .input(zod_1.z.object({
        category: zod_1.z.string(),
        vendor: zod_1.z.string().optional(),
        amount: zod_1.z.number(),
        description: zod_1.z.string().optional(),
        paymentMethod: zod_1.z["enum"](['cash', 'bank_transfer', 'cheque', 'card', 'other']).optional(),
        frequency: zod_1.z["enum"](['weekly', 'biweekly', 'monthly', 'quarterly', 'annually']),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string().optional(),
        dayOfMonth: zod_1.z.number().min(1).max(28).optional(),
        reminderDaysBefore: zod_1.z.number().min(0).max(30).optional(),
        chartOfAccountId: zod_1.z.number().optional()
    }))
        .mutation(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, id, startDate, now, rows;
            var _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _h.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        id = uuid_1.v4();
                        startDate = new Date(input.startDate);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.insert(schema_1.recurringExpenses).values({
                                id: id,
                                category: input.category,
                                vendor: (_b = input.vendor) !== null && _b !== void 0 ? _b : null,
                                amount: input.amount,
                                description: (_c = input.description) !== null && _c !== void 0 ? _c : null,
                                paymentMethod: (_d = input.paymentMethod) !== null && _d !== void 0 ? _d : null,
                                frequency: input.frequency,
                                startDate: startDate.toISOString().replace('T', ' ').substring(0, 19),
                                endDate: input.endDate ? new Date(input.endDate).toISOString().replace('T', ' ').substring(0, 19) : null,
                                nextDueDate: startDate.toISOString().replace('T', ' ').substring(0, 19),
                                dayOfMonth: (_e = input.dayOfMonth) !== null && _e !== void 0 ? _e : startDate.getDate(),
                                reminderDaysBefore: (_f = input.reminderDaysBefore) !== null && _f !== void 0 ? _f : 3,
                                isActive: 1,
                                chartOfAccountId: (_g = input.chartOfAccountId) !== null && _g !== void 0 ? _g : null,
                                createdBy: ctx.user.id,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 2:
                        _h.sent();
                        return [4 /*yield*/, database.select().from(schema_1.recurringExpenses).where(drizzle_orm_1.eq(schema_1.recurringExpenses.id, id))];
                    case 3:
                        rows = _h.sent();
                        return [2 /*return*/, rows[0]];
                }
            });
        });
    }),
    listRecurringExpenses: viewProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, []];
                    return [2 /*return*/, database.select().from(schema_1.recurringExpenses).orderBy(drizzle_orm_1.desc(schema_1.recurringExpenses.createdAt))];
            }
        });
    }); }),
    updateRecurringExpense: createProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        isActive: zod_1.z.boolean().optional(),
        amount: zod_1.z.number().optional(),
        endDate: zod_1.z.string().optional(),
        reminderDaysBefore: zod_1.z.number().optional(),
        frequency: zod_1.z["enum"](['weekly', 'biweekly', 'monthly', 'quarterly', 'annually']).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, updates, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        updates = { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
                        if (input.isActive !== undefined)
                            updates.isActive = input.isActive ? 1 : 0;
                        if (input.amount !== undefined)
                            updates.amount = input.amount;
                        if (input.endDate !== undefined)
                            updates.endDate = new Date(input.endDate).toISOString().replace('T', ' ').substring(0, 19);
                        if (input.reminderDaysBefore !== undefined)
                            updates.reminderDaysBefore = input.reminderDaysBefore;
                        if (input.frequency !== undefined)
                            updates.frequency = input.frequency;
                        return [4 /*yield*/, database.update(schema_1.recurringExpenses).set(updates).where(drizzle_orm_1.eq(schema_1.recurringExpenses.id, input.id))];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, database.select().from(schema_1.recurringExpenses).where(drizzle_orm_1.eq(schema_1.recurringExpenses.id, input.id))];
                    case 3:
                        rows = _b.sent();
                        return [2 /*return*/, rows[0]];
                }
            });
        });
    }),
    deleteRecurringExpense: deleteProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        return [4 /*yield*/, database["delete"](schema_1.recurringExpenses).where(drizzle_orm_1.eq(schema_1.recurringExpenses.id, input.id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    getRecurringExpenseById: viewProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        return [4 /*yield*/, database.select().from(schema_1.recurringExpenses).where(drizzle_orm_1.eq(schema_1.recurringExpenses.id, input.id)).limit(1)];
                    case 2:
                        rows = _b.sent();
                        if (!rows.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Recurring expense not found" });
                        return [2 /*return*/, rows[0]];
                }
            });
        });
    }),
    toggleRecurringExpenseActive: createProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), isActive: zod_1.z.boolean() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.recurringExpenses)
                                .set({ isActive: input.isActive ? 1 : 0, updatedAt: now })
                                .where(drizzle_orm_1.eq(schema_1.recurringExpenses.id, input.id))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    triggerRecurringExpenseGeneration: createProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var ctx = _a.ctx, recurringExpenseId = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, rows, pattern, now, nowStr, expenseNumber, newExpenseId, monthNames, monthName, currentYear, baseDesc, autoDescription, frequencyDays, daysToAdd, nextDueDate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
                        return [4 /*yield*/, database.select().from(schema_1.recurringExpenses).where(drizzle_orm_1.eq(schema_1.recurringExpenses.id, recurringExpenseId)).limit(1)];
                    case 2:
                        rows = _b.sent();
                        if (!rows.length)
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Recurring expense not found" });
                        pattern = rows[0];
                        now = new Date();
                        nowStr = now.toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, generateNextExpenseNumber(database)];
                    case 3:
                        expenseNumber = _b.sent();
                        newExpenseId = uuid_1.v4();
                        monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        monthName = monthNames[now.getMonth()];
                        currentYear = now.getFullYear();
                        baseDesc = pattern.description || pattern.vendor || 'Recurring expense';
                        autoDescription = baseDesc + " for the month of " + monthName + ", " + currentYear + " (Auto-generated from recurring)";
                        // Create the expense from the recurring template
                        return [4 /*yield*/, database.insert(schema_1.expenses).values({
                                id: newExpenseId,
                                organizationId: pattern.organizationId,
                                expenseNumber: expenseNumber,
                                category: pattern.category,
                                vendor: pattern.vendor,
                                amount: pattern.amount,
                                expenseDate: nowStr,
                                paymentMethod: pattern.paymentMethod,
                                description: autoDescription,
                                chartOfAccountId: pattern.chartOfAccountId,
                                status: 'pending',
                                createdBy: ctx.user.id,
                                createdAt: nowStr,
                                updatedAt: nowStr
                            })];
                    case 4:
                        // Create the expense from the recurring template
                        _b.sent();
                        frequencyDays = {
                            weekly: 7, biweekly: 14, monthly: 30, quarterly: 90, annually: 365
                        };
                        daysToAdd = frequencyDays[pattern.frequency] || 30;
                        nextDueDate = new Date(pattern.nextDueDate);
                        nextDueDate.setDate(nextDueDate.getDate() + daysToAdd);
                        // Update recurring expense
                        return [4 /*yield*/, database.update(schema_1.recurringExpenses)
                                .set({
                                nextDueDate: nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
                                lastGeneratedDate: nowStr,
                                updatedAt: nowStr
                            })
                                .where(drizzle_orm_1.eq(schema_1.recurringExpenses.id, recurringExpenseId))];
                    case 5:
                        // Update recurring expense
                        _b.sent();
                        return [2 /*return*/, { success: true, expenseId: newExpenseId, expenseNumber: expenseNumber }];
                }
            });
        });
    })
});
