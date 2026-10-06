"use strict";
/**
 * Budget Enforcement Utility
 *
 * Provides helpers to find active budgets, check availability, and deduct
 * amounts. Used by expenses, procurement, payments, and assets routers to
 * enforce spend limits and reject transactions when a budget is depleted.
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
exports.enforceBudget = exports.deductFromBudget = exports.findActiveBudget = void 0;
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
/**
 * Find the active budget for an organization in the given (or current) fiscal year.
 * If departmentId is supplied, tries a department-specific budget first, then
 * falls back to any active org-level budget.
 */
function findActiveBudget(database, orgId, departmentId, fiscalYear) {
    return __awaiter(this, void 0, Promise, function () {
        var year, rows_1, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    year = fiscalYear !== null && fiscalYear !== void 0 ? fiscalYear : new Date().getFullYear();
                    if (!departmentId) return [3 /*break*/, 2];
                    return [4 /*yield*/, database
                            .select({
                            id: schema_1.budgets.id,
                            remaining: schema_1.budgets.remaining,
                            amount: schema_1.budgets.amount,
                            departmentId: schema_1.budgets.departmentId
                        })
                            .from(schema_1.budgets)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.budgets.organizationId, orgId), drizzle_orm_1.eq(schema_1.budgets.fiscalYear, year), drizzle_orm_1.eq(schema_1.budgets.budgetStatus, "active"), drizzle_orm_1.eq(schema_1.budgets.departmentId, departmentId)))
                            .limit(1)];
                case 1:
                    rows_1 = _a.sent();
                    if (rows_1.length) {
                        return [2 /*return*/, { budgetId: rows_1[0].id, remaining: rows_1[0].remaining, amount: rows_1[0].amount, departmentId: rows_1[0].departmentId }];
                    }
                    _a.label = 2;
                case 2: return [4 /*yield*/, database
                        .select({
                        id: schema_1.budgets.id,
                        remaining: schema_1.budgets.remaining,
                        amount: schema_1.budgets.amount,
                        departmentId: schema_1.budgets.departmentId
                    })
                        .from(schema_1.budgets)
                        .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.budgets.organizationId, orgId), drizzle_orm_1.eq(schema_1.budgets.fiscalYear, year), drizzle_orm_1.eq(schema_1.budgets.budgetStatus, "active")))
                        .limit(1)];
                case 3:
                    rows = _a.sent();
                    if (!rows.length)
                        return [2 /*return*/, null];
                    return [2 /*return*/, {
                            budgetId: rows[0].id,
                            remaining: rows[0].remaining,
                            amount: rows[0].amount,
                            departmentId: rows[0].departmentId
                        }];
            }
        });
    });
}
exports.findActiveBudget = findActiveBudget;
/**
 * Deduct amountCents from an existing budget record.
 * Throws BAD_REQUEST if the budget would go below zero.
 * Returns the new remaining balance.
 */
function deductFromBudget(database, budgetId, amountCents) {
    return __awaiter(this, void 0, Promise, function () {
        var now, record, newRemaining, available;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = new Date().toISOString().replace("T", " ").substring(0, 19);
                    return [4 /*yield*/, database
                            .select({ remaining: schema_1.budgets.remaining })
                            .from(schema_1.budgets)
                            .where(drizzle_orm_1.eq(schema_1.budgets.id, budgetId))
                            .limit(1)];
                case 1:
                    record = _a.sent();
                    if (!record.length) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Budget record not found." });
                    }
                    newRemaining = record[0].remaining - amountCents;
                    if (newRemaining < 0) {
                        available = (record[0].remaining / 100).toLocaleString("en-KE", {
                            style: "currency",
                            currency: "KES",
                            maximumFractionDigits: 2
                        });
                        throw new server_1.TRPCError({
                            code: "BAD_REQUEST",
                            message: "Budget depleted. Available balance: " + available + ". Transaction rejected."
                        });
                    }
                    return [4 /*yield*/, database
                            .update(schema_1.budgets)
                            .set({ remaining: newRemaining, updatedAt: now })
                            .where(drizzle_orm_1.eq(schema_1.budgets.id, budgetId))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, newRemaining];
            }
        });
    });
}
exports.deductFromBudget = deductFromBudget;
/**
 * High-level helper: find the active budget for an org/department and deduct
 * amountCents from it.
 *
 * - If no active budget is configured → returns null (transaction allowed through).
 * - If a budget exists but is depleted → throws BAD_REQUEST (transaction rejected).
 * - On success → returns the budgetId and new remaining balance.
 */
function enforceBudget(database, orgId, amountCents, options) {
    return __awaiter(this, void 0, Promise, function () {
        var budget, remaining;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, findActiveBudget(database, orgId, options === null || options === void 0 ? void 0 : options.departmentId, options === null || options === void 0 ? void 0 : options.fiscalYear)];
                case 1:
                    budget = _a.sent();
                    if (!budget) {
                        // No active budget configured — allow the transaction without enforcement
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, deductFromBudget(database, budget.budgetId, amountCents)];
                case 2:
                    remaining = _a.sent();
                    return [2 /*return*/, { budgetId: budget.budgetId, remaining: remaining }];
            }
        });
    });
}
exports.enforceBudget = enforceBudget;
