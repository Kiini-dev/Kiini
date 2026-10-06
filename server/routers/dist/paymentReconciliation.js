"use strict";
/**
 * Payment Reconciliation Router
 *
 * Provides payment matching, discrepancy detection, and reconciliation workflows
 */
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
exports.paymentReconciliationRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Feature-based procedures
var reconciliationViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("payments:view");
var reconciliationEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("payments:edit", "reconciliation");
exports.paymentReconciliationRouter = trpc_1.router({
    /**
     * Get reconciliation status summary
     * Shows counts of matched, unmatched, and discrepant payments
     */
    getReconciliationStatus: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        dateFrom: zod_1.z.date().optional(),
        dateTo: zod_1.z.date().optional(),
        accountId: zod_1.z.string().optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, allPayments, totalAmount, matchedPayments, unmatchedPayments, matchedInvoiceIds, matchedInvoicesMap, _b, discrepancies;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        conditions = [];
                        if (input.dateFrom)
                            conditions.push(drizzle_orm_1.gte(schema_1.payments.paymentDate, input.dateFrom.toISOString()));
                        if (input.dateTo)
                            conditions.push(drizzle_orm_1.lte(schema_1.payments.paymentDate, input.dateTo.toISOString()));
                        if (input.accountId)
                            conditions.push(drizzle_orm_1.eq(schema_1.payments.accountId, input.accountId));
                        return [4 /*yield*/, db.select().from(schema_1.payments).where(conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined)];
                    case 2:
                        allPayments = _c.sent();
                        totalAmount = allPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        matchedPayments = allPayments.filter(function (p) { return p.invoiceId; });
                        unmatchedPayments = allPayments.filter(function (p) { return !p.invoiceId; });
                        matchedInvoiceIds = matchedPayments
                            .map(function (p) { return p.invoiceId; })
                            .filter(function (id) { return id !== null; });
                        if (!(matchedInvoiceIds.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.query.invoices.findMany({
                                where: drizzle_orm_1.eq(schema_1.invoices.id, matchedInvoiceIds[0])
                            })];
                    case 3:
                        _b = (_c.sent()).reduce(function (map, inv) { return map.set(inv.id, inv); }, new Map());
                        return [3 /*break*/, 5];
                    case 4:
                        _b = new Map();
                        _c.label = 5;
                    case 5:
                        matchedInvoicesMap = _b;
                        discrepancies = matchedPayments
                            .map(function (payment) {
                            var invoice = matchedInvoicesMap.get(payment.invoiceId || "");
                            if (!invoice || Math.abs((payment.amount || 0) - (invoice.total || 0)) <= 0.01)
                                return null;
                            return {
                                paymentId: payment.id,
                                invoiceId: invoice.id,
                                paymentAmount: payment.amount,
                                invoiceAmount: invoice.total,
                                difference: (payment.amount || 0) - (invoice.total || 0),
                                invoiceNumber: invoice.invoiceNumber
                            };
                        })
                            .filter(function (d) { return d !== null; });
                        return [2 /*return*/, {
                                totalPayments: allPayments.length,
                                matchedPayments: matchedPayments.length,
                                unmatchedPayments: unmatchedPayments.length,
                                discrepancyCount: discrepancies.length,
                                totalAmount: totalAmount,
                                matchedAmount: matchedPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0),
                                unmatchedAmount: unmatchedPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0),
                                reconciliationRate: allPayments.length > 0 ? (matchedPayments.length / allPayments.length) * 100 : 0
                            }];
                }
            });
        });
    }),
    /**
     * Get list of unmatched payments
     */
    getUnmatchedPayments: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100)["default"](20),
        offset: zod_1.z.number().min(0)["default"](0),
        dateFrom: zod_1.z.date().optional(),
        dateTo: zod_1.z.date().optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, allPayments, unmatchedPayments, paginated;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.query.payments.findMany({})];
                    case 2:
                        allPayments = _b.sent();
                        unmatchedPayments = allPayments.filter(function (p) { return !p.invoiceId; });
                        paginated = unmatchedPayments.slice(input.offset, input.offset + input.limit);
                        return [2 /*return*/, {
                                payments: paginated.map(function (p) { return ({
                                    id: p.id,
                                    reference: p.reference,
                                    amount: p.amount,
                                    paymentDate: p.createdAt,
                                    method: p.paymentMethod,
                                    status: p.paymentStatus,
                                    notes: p.notes
                                }); }),
                                total: unmatchedPayments.length,
                                limit: input.limit,
                                offset: input.offset
                            }];
                }
            });
        });
    }),
    /**
     * Get discrepant payments (matched but with amount differences)
     */
    getDiscrepancies: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100)["default"](20),
        offset: zod_1.z.number().min(0)["default"](0),
        threshold: zod_1.z.number().min(0)["default"](0.01)
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, matchedPayments, discrepancies, _i, matchedPayments_1, payment, invoice, diff, paginated;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.query.payments.findMany({
                                where: drizzle_orm_1.ne(schema_1.payments.invoiceId, null)
                            })];
                    case 2:
                        matchedPayments = _b.sent();
                        discrepancies = [];
                        _i = 0, matchedPayments_1 = matchedPayments;
                        _b.label = 3;
                    case 3:
                        if (!(_i < matchedPayments_1.length)) return [3 /*break*/, 6];
                        payment = matchedPayments_1[_i];
                        if (!payment.invoiceId)
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, db.query.invoices.findFirst({
                                where: drizzle_orm_1.eq(schema_1.invoices.id, payment.invoiceId)
                            })];
                    case 4:
                        invoice = _b.sent();
                        if (invoice) {
                            diff = Math.abs((payment.amount || 0) - (invoice.total || 0));
                            if (diff > input.threshold) {
                                discrepancies.push({
                                    paymentId: payment.id,
                                    invoiceId: invoice.id,
                                    invoiceNumber: invoice.invoiceNumber,
                                    clientName: invoice.clientName,
                                    paymentAmount: payment.amount,
                                    invoiceAmount: invoice.total,
                                    difference: (payment.amount || 0) - (invoice.total || 0),
                                    variancePercent: invoice.total ? ((diff / invoice.total) * 100).toFixed(2) : 0,
                                    paymentDate: payment.createdAt,
                                    invoiceDate: invoice.createdAt,
                                    status: "discrepancy"
                                });
                            }
                        }
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        // Sort by absolute difference (largest first)
                        discrepancies.sort(function (a, b) { return Math.abs(b.difference) - Math.abs(a.difference); });
                        paginated = discrepancies.slice(input.offset, input.offset + input.limit);
                        return [2 /*return*/, {
                                discrepancies: paginated,
                                total: discrepancies.length,
                                totalDiscrepancyAmount: discrepancies.reduce(function (sum, d) { return sum + Math.abs(d.difference); }, 0),
                                averageDiscrepancy: discrepancies.length > 0
                                    ? discrepancies.reduce(function (sum, d) { return sum + Math.abs(d.difference); }, 0) / discrepancies.length
                                    : 0,
                                limit: input.limit,
                                offset: input.offset
                            }];
                }
            });
        });
    }),
    /**
     * Get pending reconciliation items
     * Shows payments and invoices that need attention
     */
    getPendingReconciliation: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100)["default"](20)
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, unmatchedPayments, unpaidInvoices, paidInvoiceIds, _b, filteredUnpaidInvoices;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        return [4 /*yield*/, db.query.payments.findMany({
                                where: drizzle_orm_1.isNull(schema_1.payments.invoiceId),
                                limit: input.limit
                            })];
                    case 2:
                        unmatchedPayments = _c.sent();
                        return [4 /*yield*/, db.query.invoices.findMany({
                                limit: input.limit
                            })];
                    case 3:
                        unpaidInvoices = _c.sent();
                        _b = Set.bind;
                        return [4 /*yield*/, db.query.payments.findMany({
                                where: drizzle_orm_1.ne(schema_1.payments.invoiceId, null),
                                columns: { invoiceId: true }
                            })];
                    case 4:
                        paidInvoiceIds = new (_b.apply(Set, [void 0, (_c.sent()).map(function (p) { return p.invoiceId; })]))();
                        filteredUnpaidInvoices = unpaidInvoices.filter(function (inv) { return !paidInvoiceIds.has(inv.id); }).slice(0, input.limit);
                        return [2 /*return*/, {
                                unmatchedPayments: unmatchedPayments.map(function (p) { return ({
                                    type: "payment",
                                    id: p.id,
                                    reference: p.reference,
                                    amount: p.amount,
                                    date: p.createdAt,
                                    action: "Match to invoice"
                                }); }),
                                unpaidInvoices: filteredUnpaidInvoices.map(function (inv) { return ({
                                    type: "invoice",
                                    id: inv.id,
                                    reference: inv.invoiceNumber,
                                    amount: inv.total,
                                    date: inv.createdAt,
                                    action: "Link payment"
                                }); }),
                                totalPending: unmatchedPayments.length + filteredUnpaidInvoices.length
                            }];
                }
            });
        });
    }),
    /**
     * Match payments to invoices automatically
     * Uses fuzzy matching on amounts and dates
     */
    autoMatchPayments: reconciliationEditProcedure
        .input(zod_1.z.object({
        paymentId: zod_1.z.string().optional(),
        threshold: zod_1.z.number().min(0).max(1)["default"](0.99)
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, unmatchedPayments, allInvoices, matches, matchCount, _loop_1, _i, unmatchedPayments_1, payment;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        conditions = [drizzle_orm_1.isNull(schema_1.payments.invoiceId)];
                        if (input.paymentId) {
                            conditions.push(drizzle_orm_1.eq(schema_1.payments.id, input.paymentId));
                        }
                        return [4 /*yield*/, db.query.payments.findMany({
                                where: drizzle_orm_1.and.apply(void 0, conditions),
                                limit: 50
                            })];
                    case 2:
                        unmatchedPayments = _b.sent();
                        return [4 /*yield*/, db.query.invoices.findMany({
                                where: drizzle_orm_1.isNull(schema_1.invoices.id)
                            })];
                    case 3:
                        allInvoices = _b.sent();
                        matches = [];
                        matchCount = 0;
                        _loop_1 = function (payment) {
                            // Find invoices with similar amounts (within 1%)
                            var candidates = allInvoices.filter(function (inv) {
                                var diff = Math.abs((payment.amount || 0) - (inv.total || 0));
                                var tolerance = (inv.total || 0) * 0.01;
                                return diff <= tolerance;
                            });
                            // If exactly one match found, auto-match
                            if (candidates.length === 1) {
                                matches.push({
                                    paymentId: payment.id,
                                    invoiceId: candidates[0].id,
                                    confidence: 0.99,
                                    matched: true
                                });
                                matchCount++;
                            }
                            else if (candidates.length > 1) {
                                // Multiple candidates - find best match by date proximity
                                candidates.sort(function (a, b) {
                                    var _a, _b, _c, _d;
                                    var aDiff = Math.abs((((_a = payment.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.createdAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0));
                                    var bDiff = Math.abs((((_c = payment.createdAt) === null || _c === void 0 ? void 0 : _c.getTime()) || 0) - (((_d = b.createdAt) === null || _d === void 0 ? void 0 : _d.getTime()) || 0));
                                    return aDiff - bDiff;
                                });
                                matches.push({
                                    paymentId: payment.id,
                                    invoiceId: candidates[0].id,
                                    confidence: 0.85,
                                    matched: true
                                });
                                matchCount++;
                            }
                        };
                        for (_i = 0, unmatchedPayments_1 = unmatchedPayments; _i < unmatchedPayments_1.length; _i++) {
                            payment = unmatchedPayments_1[_i];
                            _loop_1(payment);
                        }
                        return [2 /*return*/, {
                                matchesFound: matches,
                                matchCount: matchCount,
                                totalProcessed: unmatchedPayments.length,
                                successRate: unmatchedPayments.length > 0 ? (matchCount / unmatchedPayments.length) * 100 : 0
                            }];
                }
            });
        });
    }),
    /**
     * Manually match payment to invoice
     */
    matchPaymentToInvoice: reconciliationEditProcedure
        .input(zod_1.z.object({
        paymentId: zod_1.z.string(),
        invoiceId: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        // Update payment to link invoice
                        return [4 /*yield*/, db.update(schema_1.payments)
                                .set({ invoiceId: input.invoiceId })
                                .where(drizzle_orm_1.eq(schema_1.payments.id, input.paymentId))];
                    case 3:
                        // Update payment to link invoice
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                paymentId: input.paymentId,
                                invoiceId: input.invoiceId,
                                message: "Payment successfully matched to invoice",
                                timestamp: new Date()
                            }];
                    case 4:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to match payment: " + (error_1 instanceof Error ? error_1.message : "Unknown error"),
                                timestamp: new Date()
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Reverse/undo a payment match
     */
    reversePaymentMatch: reconciliationEditProcedure
        .input(zod_1.z.object({
        paymentId: zod_1.z.string(),
        reason: zod_1.z.string().optional()
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, payment, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db.query.payments.findFirst({
                                where: drizzle_orm_1.eq(schema_1.payments.id, input.paymentId)
                            })];
                    case 3:
                        payment = _b.sent();
                        if (!payment) {
                            return [2 /*return*/, { success: false, error: "Payment not found" }];
                        }
                        if (!payment.invoiceId) {
                            return [2 /*return*/, { success: false, error: "Payment is not currently matched" }];
                        }
                        // Clear the invoice link
                        return [4 /*yield*/, db.update(schema_1.payments)
                                .set({ invoiceId: null })
                                .where(drizzle_orm_1.eq(schema_1.payments.id, input.paymentId))];
                    case 4:
                        // Clear the invoice link
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                paymentId: input.paymentId,
                                previousInvoiceId: payment.invoiceId,
                                message: "Payment match successfully reversed",
                                timestamp: new Date()
                            }];
                    case 5:
                        error_2 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to reverse match: " + (error_2 instanceof Error ? error_2.message : "Unknown error"),
                                timestamp: new Date()
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk match multiple payments
     */
    bulkMatchPayments: reconciliationEditProcedure
        .input(zod_1.z.object({
        matches: zod_1.z.array(zod_1.z.object({
            paymentId: zod_1.z.string(),
            invoiceId: zod_1.z.string()
        })),
        confirmOverwrite: zod_1.z.boolean()["default"](false)
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, results, _i, _b, match, payment, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        results = {
                            successful: 0,
                            failed: 0,
                            skipped: 0,
                            errors: []
                        };
                        _i = 0, _b = input.matches;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        match = _b[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, db.query.payments.findFirst({
                                where: drizzle_orm_1.eq(schema_1.payments.id, match.paymentId)
                            })];
                    case 4:
                        payment = _c.sent();
                        if (!payment) {
                            results.errors.push("Payment " + match.paymentId + " not found");
                            results.failed++;
                            return [3 /*break*/, 7];
                        }
                        if (payment.invoiceId && !input.confirmOverwrite) {
                            results.errors.push("Payment " + match.paymentId + " already matched (use confirmOverwrite to replace)");
                            results.skipped++;
                            return [3 /*break*/, 7];
                        }
                        return [4 /*yield*/, db.update(schema_1.payments)
                                .set({ invoiceId: match.invoiceId })
                                .where(drizzle_orm_1.eq(schema_1.payments.id, match.paymentId))];
                    case 5:
                        _c.sent();
                        results.successful++;
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _c.sent();
                        results.errors.push("Error matching " + match.paymentId + ": " + (error_3 instanceof Error ? error_3.message : "Unknown error"));
                        results.failed++;
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/, __assign(__assign({}, results), { totalProcessed: input.matches.length, successRate: input.matches.length > 0 ? (results.successful / input.matches.length) * 100 : 0, timestamp: new Date() })];
                }
            });
        });
    }),
    /**
     * Get reconciliation report
     * Generates detailed report of reconciliation status
     */
    getReconciliationReport: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        dateFrom: zod_1.z.date().optional(),
        dateTo: zod_1.z.date().optional(),
        includeDetails: zod_1.z.boolean()["default"](false)
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, allPayments, allInvoices, matchedPayments, unmatchedPayments, totalPaymentAmount, matchedAmount, unmatchedAmount, totalInvoiceAmount, linkedInvoiceAmount, now, thirtyDaysAgo, sixtyDaysAgo, unmatchedUnder30, unmatchedUnder60, unmatchedOver60;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.query.payments.findMany({})];
                    case 2:
                        allPayments = _b.sent();
                        return [4 /*yield*/, db.query.invoices.findMany({})];
                    case 3:
                        allInvoices = _b.sent();
                        matchedPayments = allPayments.filter(function (p) { return p.invoiceId; });
                        unmatchedPayments = allPayments.filter(function (p) { return !p.invoiceId; });
                        totalPaymentAmount = allPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        matchedAmount = matchedPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        unmatchedAmount = unmatchedPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        totalInvoiceAmount = allInvoices.reduce(function (sum, i) { return sum + (i.total || 0); }, 0);
                        linkedInvoiceAmount = allInvoices
                            .filter(function (i) { return matchedPayments.some(function (p) { return p.invoiceId === i.id; }); })
                            .reduce(function (sum, i) { return sum + (i.total || 0); }, 0);
                        now = new Date();
                        thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
                        unmatchedUnder30 = unmatchedPayments.filter(function (p) { return (p.createdAt || now) > thirtyDaysAgo; });
                        unmatchedUnder60 = unmatchedPayments.filter(function (p) { return (p.createdAt || now) <= thirtyDaysAgo && (p.createdAt || now) > sixtyDaysAgo; });
                        unmatchedOver60 = unmatchedPayments.filter(function (p) { return (p.createdAt || now) <= sixtyDaysAgo; });
                        return [2 /*return*/, {
                                summary: {
                                    reportDate: new Date(),
                                    periodStart: input.dateFrom,
                                    periodEnd: input.dateTo
                                },
                                payments: {
                                    total: allPayments.length,
                                    matched: matchedPayments.length,
                                    unmatched: unmatchedPayments.length,
                                    matchRate: allPayments.length > 0 ? (matchedPayments.length / allPayments.length) * 100 : 0
                                },
                                amounts: {
                                    totalPayments: totalPaymentAmount,
                                    matchedPayments: matchedAmount,
                                    unmatchedPayments: unmatchedAmount,
                                    totalInvoices: totalInvoiceAmount,
                                    linkedInvoices: linkedInvoiceAmount,
                                    unreconciledDifference: Math.abs(totalPaymentAmount - matchedAmount)
                                },
                                age: {
                                    unmatchedUnder30Days: {
                                        count: unmatchedUnder30.length,
                                        amount: unmatchedUnder30.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0)
                                    },
                                    unmatchedUnder60Days: {
                                        count: unmatchedUnder60.length,
                                        amount: unmatchedUnder60.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0)
                                    },
                                    unmatchedOver60Days: {
                                        count: unmatchedOver60.length,
                                        amount: unmatchedOver60.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0)
                                    }
                                },
                                actions: {
                                    automatchAttempted: false,
                                    automatchSuccessful: 0,
                                    manualMatchesRequired: unmatchedPayments.length
                                }
                            }];
                }
            });
        });
    }),
    /**
     * Get reconciliation history/timeline
     */
    getReconciliationHistory: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100)["default"](50)
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, activityLog, logs, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        activityLog = (_c.sent()).activityLog;
                        return [4 /*yield*/, db.select().from(activityLog)
                                .where(drizzle_orm_1.eq(activityLog.entityType, 'reconciliation'))
                                .orderBy(drizzle_orm_1.desc(activityLog.createdAt))
                                .limit(input.limit)];
                    case 4:
                        logs = _c.sent();
                        return [2 /*return*/, {
                                history: logs.map(function (log) {
                                    var _a, _b;
                                    return ({
                                        id: log.id,
                                        date: log.createdAt,
                                        action: log.action,
                                        paymentId: log.entityId,
                                        invoiceId: ((_b = (_a = log.description) === null || _a === void 0 ? void 0 : _a.match(/invoice\s+(\S+)/i)) === null || _b === void 0 ? void 0 : _b[1]) || null,
                                        user: log.userId || 'system',
                                        status: 'completed'
                                    });
                                }),
                                total: logs.length
                            }];
                    case 5:
                        _b = _c.sent();
                        return [2 /*return*/, { history: [], total: 0 }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export reconciliation data as CSV
     */
    exportReconciliationData: reconciliationViewProcedure
        .input(zod_1.z.object({
        dataType: zod_1.z["enum"](["unmatched", "discrepancies", "all"])["default"]("all"),
        dateFrom: zod_1.z.date().optional(),
        dateTo: zod_1.z.date().optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, allPayments, allInvoices, csvContent, unmatchedPayments, _i, unmatchedPayments_2, payment, matchedPayments, _b, matchedPayments_2, payment, invoice, diff, variancePercent;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        return [4 /*yield*/, db.query.payments.findMany({})];
                    case 2:
                        allPayments = _c.sent();
                        return [4 /*yield*/, db.query.invoices.findMany({})];
                    case 3:
                        allInvoices = _c.sent();
                        csvContent = "";
                        if (input.dataType === "unmatched" || input.dataType === "all") {
                            csvContent += "UNMATCHED PAYMENTS\n";
                            csvContent += "Payment ID,Reference,Amount,Date,Method,Status\n";
                            unmatchedPayments = allPayments.filter(function (p) { return !p.invoiceId; });
                            for (_i = 0, unmatchedPayments_2 = unmatchedPayments; _i < unmatchedPayments_2.length; _i++) {
                                payment = unmatchedPayments_2[_i];
                                csvContent += payment.id + ",\"" + payment.reference + "\"," + payment.amount + ",\"" + payment.createdAt + "\",\"" + payment.paymentMethod + "\",\"" + payment.paymentStatus + "\"\n";
                            }
                            csvContent += "\n\n";
                        }
                        if (!(input.dataType === "discrepancies" || input.dataType === "all")) return [3 /*break*/, 7];
                        csvContent += "DISCREPANCIES\n";
                        csvContent += "Payment ID,Invoice ID,Invoice Number,Payment Amount,Invoice Amount,Difference,Variance %\n";
                        matchedPayments = allPayments.filter(function (p) { return p.invoiceId; });
                        _b = 0, matchedPayments_2 = matchedPayments;
                        _c.label = 4;
                    case 4:
                        if (!(_b < matchedPayments_2.length)) return [3 /*break*/, 7];
                        payment = matchedPayments_2[_b];
                        if (!payment.invoiceId)
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, db.query.invoices.findFirst({
                                where: drizzle_orm_1.eq(schema_1.invoices.id, payment.invoiceId)
                            })];
                    case 5:
                        invoice = _c.sent();
                        if (invoice) {
                            diff = Math.abs((payment.amount || 0) - (invoice.total || 0));
                            if (diff > 0.01) {
                                variancePercent = invoice.total ? ((diff / invoice.total) * 100).toFixed(2) : "0";
                                csvContent += payment.id + ",\"" + invoice.id + "\",\"" + invoice.invoiceNumber + "\"," + payment.amount + "," + invoice.total + "," + diff + ",\"" + variancePercent + "%\"\n";
                            }
                        }
                        _c.label = 6;
                    case 6:
                        _b++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, {
                            filename: "reconciliation_" + new Date().toISOString().split("T")[0] + ".csv",
                            content: csvContent,
                            size: csvContent.length,
                            timestamp: new Date(),
                            type: input.dataType
                        }];
                }
            });
        });
    }),
    /**
     * Import reconciliation matches from CSV
     */
    importReconciliationMatches: reconciliationEditProcedure
        .input(zod_1.z.object({
        csvContent: zod_1.z.string(),
        dryRun: zod_1.z.boolean()["default"](true)
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, lines, results, i, parts, paymentId, invoiceId, payment, invoice, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        lines = input.csvContent.split("\n").filter(function (line) { return line.trim(); });
                        results = {
                            totalLines: lines.length,
                            parsed: 0,
                            successful: 0,
                            failed: 0,
                            errors: [],
                            matches: []
                        };
                        i = 1;
                        _b.label = 2;
                    case 2:
                        if (!(i < lines.length)) return [3 /*break*/, 10];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 8, , 9]);
                        parts = lines[i].split(",").map(function (p) { return p.trim(); });
                        if (parts.length < 2)
                            return [3 /*break*/, 9];
                        paymentId = parts[0];
                        invoiceId = parts[1];
                        results.parsed++;
                        return [4 /*yield*/, db.query.payments.findFirst({
                                where: drizzle_orm_1.eq(schema_1.payments.id, paymentId)
                            })];
                    case 4:
                        payment = _b.sent();
                        return [4 /*yield*/, db.query.invoices.findFirst({
                                where: drizzle_orm_1.eq(schema_1.invoices.id, invoiceId)
                            })];
                    case 5:
                        invoice = _b.sent();
                        if (!payment || !invoice) {
                            results.errors.push("Line " + i + ": Payment or invoice not found");
                            results.failed++;
                            return [3 /*break*/, 9];
                        }
                        results.matches.push({ paymentId: paymentId, invoiceId: invoiceId });
                        if (!!input.dryRun) return [3 /*break*/, 7];
                        return [4 /*yield*/, db.update(schema_1.payments)
                                .set({ invoiceId: invoiceId })
                                .where(drizzle_orm_1.eq(schema_1.payments.id, paymentId))];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        results.successful++;
                        return [3 /*break*/, 9];
                    case 8:
                        error_4 = _b.sent();
                        results.errors.push("Line " + i + ": " + (error_4 instanceof Error ? error_4.message : "Parse error"));
                        results.failed++;
                        return [3 /*break*/, 9];
                    case 9:
                        i++;
                        return [3 /*break*/, 2];
                    case 10: return [2 /*return*/, __assign(__assign({}, results), { dryRun: input.dryRun, timestamp: new Date() })];
                }
            });
        });
    })
});
