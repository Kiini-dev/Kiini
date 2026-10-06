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
exports.enhancedPaymentsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var db = require("../db");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("accounting:payments:view");
var writeProcedure = trpc_1.createFeatureRestrictedProcedure("accounting:payments:create");
/**
 * Enhanced Payments Router with Chart of Accounts Integration
 * Handles payment creation with automatic COA balance updates
 */
exports.enhancedPaymentsRouter = trpc_1.router({
    /**
     * Create payment with automatic COA balance update
     */
    createPaymentWithCOA: writeProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        clientId: zod_1.z.string(),
        accountId: zod_1.z.string().describe("Chart of Accounts ID for payment destination"),
        amount: zod_1.z.number().positive(),
        paymentDate: zod_1.z.string(),
        paymentMethod: zod_1.z["enum"](['cash', 'bank_transfer', 'cheque', 'mpesa', 'card', 'other']),
        referenceNumber: zod_1.z.string().optional(),
        chartOfAccountType: zod_1.z["enum"](['debit', 'credit'])["default"]('debit'),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, invoiceData, invoice, accountData, account, existingPayments, totalPaid, paymentId, balanceChange, newBalance, newPaidAmount, newInvoiceStatus, error_1;
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
                        _b.trys.push([2, 10, , 11]);
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))
                                .limit(1)];
                    case 3:
                        invoiceData = _b.sent();
                        if (!invoiceData || invoiceData.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Invoice not found"
                            });
                        }
                        invoice = invoiceData[0];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.eq(schema_1.accounts.id, input.accountId))
                                .limit(1)];
                    case 4:
                        accountData = _b.sent();
                        if (!accountData || accountData.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Chart of Accounts entry not found"
                            });
                        }
                        account = accountData[0];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.payments)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.invoiceId, input.invoiceId), drizzle_orm_1.eq(schema_1.payments.status, 'completed')))];
                    case 5:
                        existingPayments = _b.sent();
                        totalPaid = existingPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        if (totalPaid + input.amount > invoice.total) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Payment amount exceeds invoice total. Invoice: " + invoice.total + ", Already paid: " + totalPaid + ", Attempting to pay: " + input.amount
                            });
                        }
                        paymentId = uuid_1.v4();
                        return [4 /*yield*/, database.insert(schema_1.payments).values({
                                id: paymentId,
                                invoiceId: input.invoiceId,
                                clientId: input.clientId,
                                accountId: input.accountId,
                                amount: input.amount,
                                paymentDate: new Date(input.paymentDate).toISOString(),
                                paymentMethod: input.paymentMethod,
                                referenceNumber: input.referenceNumber || null,
                                chartOfAccountType: input.chartOfAccountType,
                                notes: input.notes || null,
                                status: 'completed',
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 6:
                        _b.sent();
                        balanceChange = input.chartOfAccountType === 'debit'
                            ? input.amount
                            : -input.amount;
                        newBalance = (account.balance || 0) + balanceChange;
                        return [4 /*yield*/, database
                                .update(schema_1.accounts)
                                .set({
                                balance: newBalance,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.accounts.id, input.accountId))];
                    case 7:
                        _b.sent();
                        newPaidAmount = invoice.paidAmount + input.amount;
                        newInvoiceStatus = newPaidAmount >= invoice.total ? 'paid' : 'partial';
                        return [4 /*yield*/, database
                                .update(schema_1.invoices)
                                .set({
                                paidAmount: newPaidAmount,
                                status: newInvoiceStatus,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))];
                    case 8:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_created_with_coa_update",
                                entityType: "payment",
                                entityId: paymentId,
                                description: "Payment of " + input.amount + " created for invoice " + invoice.invoiceNumber + " with COA " + account.accountCode + " update"
                            })];
                    case 9:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                paymentId: paymentId,
                                newBalance: newBalance,
                                invoiceStatus: newInvoiceStatus,
                                message: "Payment processed successfully with COA balance updated"
                            }];
                    case 10:
                        error_1 = _b.sent();
                        if (error_1 instanceof server_1.TRPCError)
                            throw error_1;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create payment: " + error_1
                        });
                    case 11: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get payment with COA details
     */
    getPaymentWithCOA: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, paymentData, payment, invoiceData, accountData, _b;
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
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.payments)
                                .where(drizzle_orm_1.eq(schema_1.payments.id, input))
                                .limit(1)];
                    case 2:
                        paymentData = _c.sent();
                        if (!paymentData || paymentData.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Payment not found"
                            });
                        }
                        payment = paymentData[0];
                        return [4 /*yield*/, database.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, payment.invoiceId))];
                    case 3:
                        invoiceData = _c.sent();
                        if (!payment.accountId) return [3 /*break*/, 5];
                        return [4 /*yield*/, database.select().from(schema_1.accounts).where(drizzle_orm_1.eq(schema_1.accounts.id, payment.accountId))];
                    case 4:
                        _b = _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _b = [];
                        _c.label = 6;
                    case 6:
                        accountData = _b;
                        return [2 /*return*/, {
                                payment: payment,
                                invoice: invoiceData[0] || null,
                                account: accountData[0] || null
                            }];
                }
            });
        });
    }),
    /**
     * List payments for an invoice with COA details
     */
    listInvoicePayments: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, paymentList, enriched;
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
                                .from(schema_1.payments)
                                .where(drizzle_orm_1.eq(schema_1.payments.invoiceId, input))];
                    case 2:
                        paymentList = _b.sent();
                        return [4 /*yield*/, Promise.all(paymentList.map(function (payment) { return __awaiter(void 0, void 0, void 0, function () {
                                var accountData;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!payment.accountId)
                                                return [2 /*return*/, payment];
                                            return [4 /*yield*/, database
                                                    .select()
                                                    .from(schema_1.accounts)
                                                    .where(drizzle_orm_1.eq(schema_1.accounts.id, payment.accountId))];
                                        case 1:
                                            accountData = _a.sent();
                                            return [2 /*return*/, __assign(__assign({}, payment), { account: accountData[0] || null })];
                                    }
                                });
                            }); }))];
                    case 3:
                        enriched = _b.sent();
                        return [2 /*return*/, enriched];
                }
            });
        });
    }),
    /**
     * Reverse payment and update COA balance
     */
    reversePayment: writeProcedure
        .input(zod_1.z.object({
        paymentId: zod_1.z.string(),
        reason: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, paymentData, payment, accountData, account, balanceChange, newBalance, invoiceData, invoice, newPaidAmount, newInvoiceStatus, error_2;
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
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.payments)
                                .where(drizzle_orm_1.eq(schema_1.payments.id, input.paymentId))];
                    case 3:
                        paymentData = _b.sent();
                        if (!paymentData || paymentData.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Payment not found"
                            });
                        }
                        payment = paymentData[0];
                        if (payment.status !== 'completed') {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Cannot reverse a " + payment.status + " payment"
                            });
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.eq(schema_1.accounts.id, payment.accountId))];
                    case 4:
                        accountData = _b.sent();
                        if (!accountData || accountData.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Chart of Accounts entry not found"
                            });
                        }
                        account = accountData[0];
                        balanceChange = payment.chartOfAccountType === 'debit'
                            ? -(payment.amount || 0)
                            : (payment.amount || 0);
                        newBalance = (account.balance || 0) + balanceChange;
                        return [4 /*yield*/, database
                                .update(schema_1.accounts)
                                .set({
                                balance: newBalance,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.accounts.id, payment.accountId))];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, payment.invoiceId))];
                    case 6:
                        invoiceData = _b.sent();
                        if (!(invoiceData && invoiceData.length > 0)) return [3 /*break*/, 8];
                        invoice = invoiceData[0];
                        newPaidAmount = Math.max(0, (invoice.paidAmount || 0) - (payment.amount || 0));
                        newInvoiceStatus = newPaidAmount === 0 ? 'draft' : 'partial';
                        return [4 /*yield*/, database
                                .update(schema_1.invoices)
                                .set({
                                paidAmount: newPaidAmount,
                                status: newInvoiceStatus,
                                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, payment.invoiceId))];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: 
                    // Mark payment as cancelled
                    return [4 /*yield*/, database
                            .update(schema_1.payments)
                            .set({
                            status: 'cancelled',
                            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })
                            .where(drizzle_orm_1.eq(schema_1.payments.id, input.paymentId))];
                    case 9:
                        // Mark payment as cancelled
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_reversed",
                                entityType: "payment",
                                entityId: input.paymentId,
                                description: "Payment reversed: " + (input.reason || 'No reason provided')
                            })];
                    case 10:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Payment reversed successfully with COA balance updated",
                                newBalance: newBalance
                            }];
                    case 11:
                        error_2 = _b.sent();
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to reverse payment: " + error_2
                        });
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get COA account balance for payment verification
     */
    getAccountBalance: readProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, accountData;
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
                                .where(drizzle_orm_1.eq(schema_1.accounts.id, input))];
                    case 2:
                        accountData = _b.sent();
                        if (!accountData || accountData.length === 0) {
                            throw new server_1.TRPCError({
                                code: "NOT_FOUND",
                                message: "Account not found"
                            });
                        }
                        return [2 /*return*/, accountData[0]];
                }
            });
        });
    })
});
