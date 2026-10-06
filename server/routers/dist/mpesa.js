"use strict";
/**
 * M-Pesa Payment Router
 * tRPC endpoints for M-Pesa STK Push and payment processing
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
exports.mpesaRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var mpesaService = require("../services/mpesa");
var db = require("../db");
var server_1 = require("@trpc/server");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var uuid_1 = require("uuid");
// Feature-based access control
var mpesaPaymentsProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:payments:create");
var mpesaViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:payments:view");
exports.mpesaRouter = trpc_1.router({
    /**
     * Get M-Pesa configuration status
     */
    getStatus: trpc_1.protectedProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, mpesaService.getMPesaStatus()];
        });
    }); }),
    /**
     * Initiate STK Push (SMS payment prompt to customer phone)
     */
    initiateStKPush: mpesaPaymentsProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string().uuid(),
        phoneNumber: zod_1.z.string().regex(/^(?:\+254|254|0)[1-9]\d{8,9}$/, "Invalid Kenyan phone number"),
        amount: zod_1.z.number().positive("Amount must be positive"),
        accountReference: zod_1.z.string().max(50),
        description: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var result, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        if (!((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.clientId)) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "User not associated with a client"
                            });
                        }
                        return [4 /*yield*/, mpesaService.initiateSTKPush({
                                invoiceId: input.invoiceId,
                                clientId: ctx.user.clientId,
                                phoneNumber: input.phoneNumber,
                                amount: input.amount,
                                accountReference: input.accountReference,
                                description: input.description
                            })];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, result];
                    case 2:
                        error_1 = _c.sent();
                        if (error_1 instanceof server_1.TRPCError)
                            throw error_1;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: error_1 instanceof Error ? error_1.message : "Failed to initiate STK Push"
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Query the status of an STK Push transaction
     */
    queryTransactionStatus: mpesaViewProcedure
        .input(zod_1.z.object({
        checkoutRequestId: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, mpesaService.queryTransactionStatus(input.checkoutRequestId)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        error_2 = _b.sent();
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to query transaction status"
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Poll transaction status (frontend calls this to check if payment completed)
     */
    pollTransactionStatus: mpesaViewProcedure
        .input(zod_1.z.object({
        checkoutRequestId: zod_1.z.string(),
        invoiceId: zod_1.z.string().uuid()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, mpesaTransactions, eq, transaction, txn, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database connection failed"
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        mpesaTransactions = (_c.sent()).mpesaTransactions;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        eq = (_c.sent()).eq;
                        return [4 /*yield*/, database.select()
                                .from(mpesaTransactions)
                                .where(eq(mpesaTransactions.checkoutRequestId, input.checkoutRequestId))
                                .limit(1)];
                    case 4:
                        transaction = _c.sent();
                        if (!transaction.length || transaction[0].clientId !== ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.clientId)) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "Transaction not found or access denied"
                            });
                        }
                        txn = transaction[0];
                        return [2 /*return*/, {
                                checkoutRequestId: txn.checkoutRequestId,
                                status: txn.status,
                                amount: txn.amount,
                                phoneNumber: txn.phoneNumber,
                                mpesaReceiptNumber: txn.mpesaReceiptNumber,
                                transactionDate: txn.transactionDate,
                                resultDescription: txn.resultDescription,
                                completedAt: txn.completedAt
                            }];
                    case 5:
                        error_3 = _c.sent();
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to poll transaction status"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Confirm payment after M-Pesa callback received
     * Called when customer completes payment via phone prompt
     */
    confirmPayment: mpesaPaymentsProcedure
        .input(zod_1.z.object({
        checkoutRequestId: zod_1.z.string(),
        invoiceId: zod_1.z.string().uuid()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, mpesaTransactions, payments, invoices, eq, transaction, txn, existingPayment, invoice, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 11, , 12]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database connection failed"
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        mpesaTransactions = (_c.sent()).mpesaTransactions;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        payments = (_c.sent()).payments;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 4:
                        invoices = (_c.sent()).invoices;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 5:
                        eq = (_c.sent()).eq;
                        return [4 /*yield*/, database.select()
                                .from(mpesaTransactions)
                                .where(eq(mpesaTransactions.checkoutRequestId, input.checkoutRequestId))
                                .limit(1)];
                    case 6:
                        transaction = _c.sent();
                        if (!transaction.length || transaction[0].clientId !== ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.clientId)) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "Transaction not found or access denied"
                            });
                        }
                        txn = transaction[0];
                        // Verify transaction was completed
                        if (txn.status !== 'completed') {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Transaction status is '" + txn.status + "', cannot confirm. Expected 'completed'."
                            });
                        }
                        return [4 /*yield*/, database.select()
                                .from(payments)
                                .where(eq(payments.invoiceId, input.invoiceId))
                                .limit(1)];
                    case 7:
                        existingPayment = _c.sent();
                        if (!!existingPayment.length) return [3 /*break*/, 10];
                        return [4 /*yield*/, database.select()
                                .from(invoices)
                                .where(eq(invoices.id, input.invoiceId))
                                .limit(1)];
                    case 8:
                        invoice = _c.sent();
                        if (!invoice.length) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Invoice not found"
                            });
                        }
                        return [4 /*yield*/, database.insert(payments).values({
                                id: uuid_1.v4(),
                                invoiceId: input.invoiceId,
                                clientId: ctx.user.clientId,
                                amount: invoice[0].total || 0,
                                paymentDate: txn.transactionDate || new Date().toISOString().slice(0, 19).replace('T', ' '),
                                paymentMethod: 'mpesa',
                                status: 'completed',
                                referenceNumber: txn.mpesaReceiptNumber || "MPESA-" + input.checkoutRequestId.slice(0, 20),
                                createdBy: ctx.user.id
                            })];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10: return [2 /*return*/, { success: true, message: "M-Pesa payment confirmed" }];
                    case 11:
                        error_4 = _c.sent();
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to confirm payment"
                        });
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get M-Pesa transaction history for customer
     */
    getTransactionHistory: mpesaViewProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().max(50)["default"](10),
        status: zod_1.z["enum"](['pending', 'completed', 'failed', 'cancelled', 'expired', 'retry']).optional()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, mpesaTransactions, _b, eq, desc, and, query, transactions, error_5;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _e.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database connection failed"
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        mpesaTransactions = (_e.sent()).mpesaTransactions;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        _b = _e.sent(), eq = _b.eq, desc = _b.desc, and = _b.and;
                        query = database.select()
                            .from(mpesaTransactions)
                            .where(eq(mpesaTransactions.clientId, ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.clientId) || ""));
                        if (input.status) {
                            query = database.select()
                                .from(mpesaTransactions)
                                .where(and(eq(mpesaTransactions.clientId, ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.clientId) || ""), eq(mpesaTransactions.status, input.status)));
                        }
                        return [4 /*yield*/, query
                                .orderBy(desc(mpesaTransactions.completedAt))
                                .limit(input.limit)];
                    case 4:
                        transactions = _e.sent();
                        return [2 /*return*/, transactions.map(function (t) { return ({
                                id: t.id,
                                checkoutRequestId: t.checkoutRequestId,
                                invoiceId: t.invoiceId,
                                phoneNumber: t.phoneNumber,
                                amount: t.amount,
                                status: t.status,
                                mpesaReceiptNumber: t.mpesaReceiptNumber,
                                transactionDate: t.transactionDate,
                                completedAt: t.completedAt,
                                resultDescription: t.resultDescription
                            }); })];
                    case 5:
                        error_5 = _e.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to fetch transaction history"
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Retry failed M-Pesa transaction
     */
    retryTransaction: mpesaPaymentsProcedure
        .input(zod_1.z.object({
        checkoutRequestId: zod_1.z.string(),
        phoneNumber: zod_1.z.string(),
        amount: zod_1.z.number().positive()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, mpesaTransactions, eq, transaction, result, error_6;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database connection failed"
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        mpesaTransactions = (_c.sent()).mpesaTransactions;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        eq = (_c.sent()).eq;
                        return [4 /*yield*/, database.select()
                                .from(mpesaTransactions)
                                .where(eq(mpesaTransactions.checkoutRequestId, input.checkoutRequestId))
                                .limit(1)];
                    case 4:
                        transaction = _c.sent();
                        if (!transaction.length || transaction[0].clientId !== ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.clientId)) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "Transaction not found or access denied"
                            });
                        }
                        return [4 /*yield*/, mpesaService.initiateSTKPush({
                                invoiceId: transaction[0].invoiceId,
                                clientId: ctx.user.clientId,
                                phoneNumber: input.phoneNumber,
                                amount: input.amount,
                                accountReference: "RETRY-" + transaction[0].invoiceId,
                                description: "Retry payment for invoice " + transaction[0].invoiceId
                            })];
                    case 5:
                        result = _c.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_6 = _c.sent();
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to retry transaction"
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get M-Pesa account settings (admin only)
     */
    getSettings: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, mpesaSettings, settings, setting, error_7;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        // Require admin/super_admin role
                        if (!["admin", "super_admin"].includes(((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) || "")) {
                            throw new server_1.TRPCError({
                                code: "UNAUTHORIZED",
                                message: "Admin access required"
                            });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: "Database connection failed"
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        mpesaSettings = (_c.sent()).mpesaSettings;
                        return [4 /*yield*/, database.select().from(mpesaSettings).limit(1)];
                    case 3:
                        settings = _c.sent();
                        if (!settings.length) {
                            return [2 /*return*/, {
                                    isActive: false,
                                    environment: 'sandbox',
                                    message: 'M-Pesa not configured'
                                }];
                        }
                        setting = settings[0];
                        return [2 /*return*/, {
                                businessShortCode: setting.businessShortCode,
                                environment: setting.environment,
                                callbackUrl: setting.callbackUrl,
                                isActive: setting.isActive
                            }];
                    case 4:
                        error_7 = _c.sent();
                        if (error_7 instanceof server_1.TRPCError)
                            throw error_7;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to get M-Pesa settings"
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
exports["default"] = exports.mpesaRouter;
