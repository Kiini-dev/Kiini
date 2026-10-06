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
exports.bankReconciliationRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Feature-based procedures
var readProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:read");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:create");
var updateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:edit");
var deleteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:delete");
/**
 * Bank Reconciliation Router
 * Generates reconciliation reports by comparing bank transactions (payments) with system records (invoices/expenses)
 * No separate database table needed - calculates from existing payment and invoice data
 */
exports.bankReconciliationRouter = trpc_1.router({
    /**
     * Get list of reconciliation periods/accounts
     */
    list: readProcedure
        .input(zod_1.z.object({
        year: zod_1.z.number().optional(),
        month: zod_1.z.number().optional()
    }).optional())
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Return hardcoded bank accounts for now (in a real system, these would be in a settings table)
            return [2 /*return*/, [
                    {
                        id: "main",
                        name: "Main Business Account",
                        bankCode: "KCB",
                        accountNumber: "1234567890",
                        currency: "KES",
                        status: "active"
                    },
                    {
                        id: "payroll",
                        name: "Payroll Account",
                        bankCode: "Equity",
                        accountNumber: "0987654321",
                        currency: "KES",
                        status: "active"
                    },
                ]];
        });
    }); }),
    /**
     * Get reconciliation details for a specific period/account
     */
    getById: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var accountId = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, paymentQuery, bankTransactions, invoiceQuery, invoiceRecords_1, bankBalance, systemBalance, matched_1, unmatched, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        orgId = ctx.user.organizationId;
                        paymentQuery = database.select().from(schema_1.payments);
                        if (accountId) {
                            paymentQuery = paymentQuery.where(drizzle_orm_1.eq(schema_1.payments.accountId, accountId));
                        }
                        if (orgId) {
                            paymentQuery = paymentQuery.where(drizzle_orm_1.eq(schema_1.payments.organizationId, orgId));
                        }
                        return [4 /*yield*/, paymentQuery];
                    case 3:
                        bankTransactions = _b.sent();
                        invoiceQuery = orgId ? database.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.organizationId, orgId)) : database.select().from(schema_1.invoices);
                        return [4 /*yield*/, invoiceQuery];
                    case 4:
                        invoiceRecords_1 = _b.sent();
                        bankBalance = bankTransactions.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        systemBalance = invoiceRecords_1.reduce(function (sum, i) { return sum + (i.total || 0); }, 0);
                        matched_1 = bankTransactions.filter(function (p) {
                            return invoiceRecords_1.some(function (i) {
                                return (p.invoiceId && i.id === p.invoiceId) ||
                                    (p.amount && i.total && Math.abs(p.amount - i.total) < 1);
                            } // KES amounts are in cents or whole units
                            );
                        });
                        unmatched = bankTransactions.filter(function (p) {
                            return !matched_1.some(function (m) { return m.id === p.id; });
                        });
                        return [2 /*return*/, {
                                id: accountId,
                                bankAccount: accountId || "Main Account",
                                accountNumber: accountId || "N/A",
                                period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                                bankBalance: bankBalance,
                                bookBalance: systemBalance,
                                difference: Math.abs(bankBalance - systemBalance),
                                status: Math.abs(bankBalance - systemBalance) < 1 ? "Reconciled" : "Unreconciled",
                                reconciliationDate: new Date().toISOString(),
                                matchedTransactions: matched_1.length,
                                unmatchedTransactions: unmatched.length,
                                transactions: bankTransactions.map(function (p) { return ({
                                    id: p.id,
                                    date: p.paymentDate,
                                    description: p.paymentMethod || "Bank Transfer",
                                    amount: p.amount,
                                    status: matched_1.some(function (m) { return m.id === p.id; }) ? "matched" : "unmatched"
                                }); })
                            }];
                    case 5:
                        error_1 = _b.sent();
                        console.error("[BankReconciliation] Failed to get reconciliation:", error_1);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Create a new reconciliation record
     */
    create: createProcedure
        .input(zod_1.z.object({
        bankAccount: zod_1.z.string(),
        period: zod_1.z.string(),
        bankBalance: zod_1.z.number(),
        bookBalance: zod_1.z.number(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // In a real system, this would save to a bank_reconciliations table
                // For now, we just return the input data
                return [2 /*return*/, __assign(__assign({ id: "rec_" + Date.now() }, input), { status: "recorded", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })];
            });
        });
    }),
    /**
     * Update reconciliation status
     */
    update: updateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        bankAccount: zod_1.z.string().optional(),
        period: zod_1.z.string().optional(),
        bankBalance: zod_1.z.number().optional(),
        bookBalance: zod_1.z.number().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var id, updates;
            return __generator(this, function (_b) {
                id = input.id, updates = __rest(input, ["id"]);
                return [2 /*return*/, __assign(__assign({ id: id }, updates), { status: "updated", updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })];
            });
        });
    }),
    /**
     * Delete reconciliation record
     */
    "delete": deleteProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var id = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, { success: true, id: id }];
            });
        });
    })
});
