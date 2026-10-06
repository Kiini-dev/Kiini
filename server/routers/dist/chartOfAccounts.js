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
exports.chartOfAccountsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
// Validation schemas
var accountCodeSchema = zod_1.z.string().min(1, "Account code is required");
var accountTypeEnum = zod_1.z["enum"](['asset', 'liability', 'equity', 'revenue', 'expense', 'cost of goods sold', 'operating expense', 'capital expenditure', 'other income', 'other expense']);
exports.chartOfAccountsRouter = trpc_1.router({
    list: trpc_1.createFeatureRestrictedProcedure("chartOfAccounts:read")
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        type: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, activeFilter, query, typeFilter;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        orgId = ctx.user.organizationId;
                        activeFilter = drizzle_orm_1.eq(schema_1.accounts.isActive, 1);
                        query = database.select().from(schema_1.accounts).where(orgId ? drizzle_orm_1.and(activeFilter, drizzle_orm_1.eq(schema_1.accounts.organizationId, orgId)) : activeFilter);
                        if ((input === null || input === void 0 ? void 0 : input.type) && input.type !== 'all') {
                            typeFilter = drizzle_orm_1.eq(schema_1.accounts.accountType, input.type);
                            query = database
                                .select()
                                .from(schema_1.accounts)
                                .where(orgId ? drizzle_orm_1.and(typeFilter, activeFilter, drizzle_orm_1.eq(schema_1.accounts.organizationId, orgId)) : drizzle_orm_1.and(typeFilter, activeFilter));
                        }
                        return [4 /*yield*/, query
                                .orderBy(drizzle_orm_1.desc(schema_1.accounts.createdAt))
                                .limit((input === null || input === void 0 ? void 0 : input.limit) || 100)
                                .offset((input === null || input === void 0 ? void 0 : input.offset) || 0)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    getById: trpc_1.createFeatureRestrictedProcedure("chartOfAccounts:read")
        .input(zod_1.z.object({ id: zod_1.z.string() }))
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
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.id, input.id), drizzle_orm_1.eq(schema_1.accounts.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.accounts.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.accounts).where(where).limit(1)];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    }),
    create: trpc_1.createFeatureRestrictedProcedure("chartOfAccounts:create")
        .input(zod_1.z.object({
        accountCode: accountCodeSchema,
        accountName: zod_1.z.string().min(1, "Account name is required").max(100),
        accountType: accountTypeEnum,
        parentAccountId: zod_1.z.string().nullable().optional(),
        balance: zod_1.z.number().optional()["default"](0),
        description: zod_1.z.string().max(500).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existing, id, now;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.accountCode, input.accountCode), drizzle_orm_1.eq(schema_1.accounts.isActive, 1)))
                                .limit(1)];
                    case 2:
                        existing = _c.sent();
                        if (existing.length > 0) {
                            throw new Error("Account code '" + input.accountCode + "' already exists");
                        }
                        id = uuid_1.v4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.insert(schema_1.accounts).values({
                                id: id,
                                accountCode: input.accountCode,
                                accountName: input.accountName,
                                accountType: input.accountType,
                                parentAccountId: input.parentAccountId || null,
                                balance: input.balance,
                                description: input.description,
                                isActive: 1,
                                createdAt: now,
                                updatedAt: now,
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null
                            })];
                    case 3:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "account_created",
                                entityType: "account",
                                entityId: id,
                                description: "Created account: " + input.accountCode + " - " + input.accountName
                            })];
                    case 4:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { id: id }];
                }
            });
        });
    }),
    update: trpc_1.createFeatureRestrictedProcedure("chartOfAccounts:edit")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        accountCode: accountCodeSchema.optional(),
        accountName: zod_1.z.string().max(100).optional(),
        accountType: accountTypeEnum.optional(),
        parentAccountId: zod_1.z.string().nullable().optional(),
        balance: zod_1.z.number().optional(),
        description: zod_1.z.string().max(500).optional(),
        isActive: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, existingAccount, orgId, duplicate, id, isActive, data, updateData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.eq(schema_1.accounts.id, input.id))
                                .limit(1)];
                    case 2:
                        existingAccount = _b.sent();
                        if (!existingAccount.length) {
                            throw new Error("Account not found");
                        }
                        orgId = ctx.user.organizationId;
                        if (orgId && existingAccount[0].organizationId !== orgId) {
                            throw new Error("Account not found");
                        }
                        if (!(input.accountCode && input.accountCode !== existingAccount[0].accountCode)) return [3 /*break*/, 4];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.accountCode, input.accountCode), drizzle_orm_1.eq(schema_1.accounts.isActive, 1)))
                                .limit(1)];
                    case 3:
                        duplicate = _b.sent();
                        if (duplicate.length > 0) {
                            throw new Error("Account code '" + input.accountCode + "' already exists");
                        }
                        _b.label = 4;
                    case 4:
                        id = input.id, isActive = input.isActive, data = __rest(input, ["id", "isActive"]);
                        updateData = __assign({}, data);
                        if (isActive !== undefined) {
                            updateData.isActive = isActive ? 1 : 0;
                        }
                        return [4 /*yield*/, database.update(schema_1.accounts).set(updateData).where(drizzle_orm_1.eq(schema_1.accounts.id, id))];
                    case 5:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "account_updated",
                                entityType: "account",
                                entityId: id,
                                description: "Updated account: " + existingAccount[0].accountCode
                            })];
                    case 6:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    validateCanDelete: trpc_1.createFeatureRestrictedProcedure("chartOfAccounts:read")
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, where, account, childAccounts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        where = orgId ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.id, input), drizzle_orm_1.eq(schema_1.accounts.organizationId, orgId)) : drizzle_orm_1.eq(schema_1.accounts.id, input);
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(where)
                                .limit(1)];
                    case 2:
                        account = _b.sent();
                        if (!account.length) {
                            return [2 /*return*/, { canDelete: false, reason: "Account not found" }];
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.parentAccountId, input), drizzle_orm_1.eq(schema_1.accounts.isActive, 1)))
                                .limit(1)];
                    case 3:
                        childAccounts = _b.sent();
                        if (childAccounts.length > 0) {
                            return [2 /*return*/, {
                                    canDelete: false,
                                    reason: "Cannot delete: This account has " + childAccounts.length + " sub-account(s). Please move or delete sub-accounts first."
                                }];
                        }
                        // Check if account has non-zero balance
                        if (account[0].balance !== null && account[0].balance !== 0) {
                            return [2 /*return*/, {
                                    canDelete: false,
                                    reason: "Cannot delete: Account has a balance of " + account[0].balance + ". Please reconcile the balance first."
                                }];
                        }
                        return [2 /*return*/, { canDelete: true, reason: "" }];
                }
            });
        });
    }),
    "delete": trpc_1.createFeatureRestrictedProcedure("chartOfAccounts:delete")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        force: zod_1.z.boolean().optional()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, account, orgId, childAccounts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.eq(schema_1.accounts.id, input.id))
                                .limit(1)];
                    case 2:
                        account = _b.sent();
                        if (!account.length) {
                            throw new Error("Account not found");
                        }
                        orgId = ctx.user.organizationId;
                        if (orgId && account[0].organizationId !== orgId) {
                            throw new Error("Account not found");
                        }
                        if (!!input.force) return [3 /*break*/, 4];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.parentAccountId, input.id), drizzle_orm_1.eq(schema_1.accounts.isActive, 1)))];
                    case 3:
                        childAccounts = _b.sent();
                        if (childAccounts.length > 0) {
                            throw new Error("Cannot delete: This account has " + childAccounts.length + " sub-account(s). Please move or delete sub-accounts first.");
                        }
                        // Check if account has non-zero balance
                        if (account[0].balance !== null && account[0].balance !== 0) {
                            throw new Error("Cannot delete: Account has a balance of " + account[0].balance + ". Please reconcile the balance first.");
                        }
                        _b.label = 4;
                    case 4: 
                    // Soft delete
                    return [4 /*yield*/, database.update(schema_1.accounts).set({ isActive: 0 }).where(drizzle_orm_1.eq(schema_1.accounts.id, input.id))];
                    case 5:
                        // Soft delete
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "account_deleted",
                                entityType: "account",
                                entityId: input.id,
                                description: "Deleted account: " + account[0].accountCode + " - " + account[0].accountName + (input.force ? ' (force)' : '')
                            })];
                    case 6:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    getSummary: trpc_1.createFeatureRestrictedProcedure("chartOfAccounts:read")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, allAccounts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, {
                                totalAssets: 0,
                                totalLiabilities: 0,
                                totalEquity: 0,
                                totalRevenue: 0,
                                totalExpenses: 0
                            }];
                    return [4 /*yield*/, database.select().from(schema_1.accounts).where(drizzle_orm_1.eq(schema_1.accounts.isActive, 1))];
                case 2:
                    allAccounts = _a.sent();
                    return [2 /*return*/, {
                            totalAssets: allAccounts.filter(function (a) { return a.accountType === 'asset'; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
                            totalLiabilities: allAccounts.filter(function (a) { return a.accountType === 'liability'; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
                            totalEquity: allAccounts.filter(function (a) { return a.accountType === 'equity'; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
                            totalRevenue: allAccounts.filter(function (a) { return a.accountType === 'revenue'; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
                            totalExpenses: allAccounts.filter(function (a) { return a.accountType === 'expense'; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
                            totalCostOfGoodsSold: allAccounts.filter(function (a) { return a.accountType === 'cost of goods sold'; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
                            totalOperatingExpense: allAccounts.filter(function (a) { return a.accountType === 'operating expense'; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
                            totalCapitalExpenditure: allAccounts.filter(function (a) { return a.accountType === 'capital expenditure'; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
                            totalOtherIncome: allAccounts.filter(function (a) { return a.accountType === 'other income'; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
                            totalOtherExpense: allAccounts.filter(function (a) { return a.accountType === 'other expense'; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0)
                        }];
            }
        });
    }); }),
    getHierarchy: trpc_1.createFeatureRestrictedProcedure("chartOfAccounts:read")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, allAccounts, buildHierarchy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, database.select().from(schema_1.accounts).where(drizzle_orm_1.eq(schema_1.accounts.isActive, 1))];
                case 2:
                    allAccounts = _a.sent();
                    buildHierarchy = function (items, parentId) {
                        if (parentId === void 0) { parentId = null; }
                        return items
                            .filter(function (item) { return item.parentAccountId === parentId; })
                            .map(function (item) { return (__assign(__assign({}, item), { children: buildHierarchy(items, item.id), isParent: allAccounts.some(function (a) { return a.parentAccountId === item.id; }) })); })
                            .sort(function (a, b) { return a.accountCode.localeCompare(b.accountCode); });
                    };
                    return [2 /*return*/, buildHierarchy(allAccounts)];
            }
        });
    }); }),
    updateBalance: trpc_1.createFeatureRestrictedProcedure("chartOfAccounts:edit")
        .input(zod_1.z.object({
        accountId: zod_1.z.string(),
        amount: zod_1.z.number(),
        operation: zod_1.z["enum"](['add', 'subtract', 'set'])["default"]('set')
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, account, currentBalance, newBalance;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.eq(schema_1.accounts.id, input.accountId))
                                .limit(1)];
                    case 2:
                        account = _b.sent();
                        if (!account.length) {
                            throw new Error("Account not found");
                        }
                        currentBalance = account[0].balance || 0;
                        newBalance = currentBalance;
                        if (input.operation === 'add') {
                            newBalance = currentBalance + input.amount;
                        }
                        else if (input.operation === 'subtract') {
                            newBalance = currentBalance - input.amount;
                        }
                        else {
                            newBalance = input.amount;
                        }
                        return [4 /*yield*/, database.update(schema_1.accounts).set({ balance: newBalance }).where(drizzle_orm_1.eq(schema_1.accounts.id, input.accountId))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "account_balance_updated",
                                entityType: "account",
                                entityId: input.accountId,
                                description: "Updated balance for " + account[0].accountCode + ": " + input.operation + " " + input.amount + ", new balance: " + newBalance
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true, newBalance: newBalance }];
                }
            });
        });
    })
});
