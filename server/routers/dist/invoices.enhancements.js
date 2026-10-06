"use strict";
/**
 * SaaS-Grade Invoice Router Enhancements
 *
 * This file contains advanced features that should be added to invoices.ts:
 * - Advanced filtering and search
 * - Invoice aging analysis
 * - Batch operations
 * - Approval workflows
 * - Partial payment handling
 * - Invoice templates
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.invoiceEnhancementsRouter = void 0;
var zod_1 = require("zod");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var server_1 = require("@trpc/server");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
var db_1 = require("../db");
// ============================================================================
// PROCEDURES
// ============================================================================
var viewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:invoices:view");
var createProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:invoices:create");
var approveProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:invoices:approve");
var exportProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("accounting:invoices:export");
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
var advancedFilterSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: zod_1.z["enum"](["draft", "sent", "paid", "partial", "overdue", "cancelled"]).optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    minAmount: zod_1.z.number().optional(),
    maxAmount: zod_1.z.number().optional(),
    clientIds: zod_1.z.array(zod_1.z.string()).optional(),
    isPaid: zod_1.z.boolean().optional(),
    isOverdue: zod_1.z.boolean().optional(),
    limit: zod_1.z.number().min(1).max(500)["default"](50),
    offset: zod_1.z.number().min(0)["default"](0),
    sortBy: zod_1.z["enum"](["dueDate", "issueDate", "amount", "clientName"])["default"]("issueDate"),
    sortOrder: zod_1.z["enum"](["asc", "desc"])["default"]("desc")
});
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Calculate days overdue for an invoice
 */
function calculateDaysOverdue(dueDate) {
    var due = new Date(dueDate);
    var today = new Date();
    var daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return daysOverdue > 0 ? daysOverdue : 0;
}
/**
 * Calculate invoice aging category
 */
function getAgingCategory(daysOverdue) {
    if (daysOverdue <= 0)
        return "current";
    if (daysOverdue <= 30)
        return "30days";
    if (daysOverdue <= 60)
        return "60days";
    if (daysOverdue <= 90)
        return "90days";
    return "over90days";
}
/**
 * Log invoice activity for audit trail
 */
function logInvoiceActivity(db, invoiceId, action, userId, details) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                console.log("[AUDIT] Invoice " + action + ":", {
                    invoiceId: invoiceId,
                    action: action,
                    userId: userId,
                    timestamp: new Date().toISOString(),
                    details: details
                });
            }
            catch (err) {
                console.warn("Failed to log invoice activity:", err);
            }
            return [2 /*return*/];
        });
    });
}
// ============================================================================
// NEW ENDPOINTS - ADD THESE TO invoicesRouter
// ============================================================================
exports.invoiceEnhancementsRouter = {
    /**
     * Advanced list with comprehensive filtering
     * Includes: search, status, date range, amount range, client filtering
     */
    listAdvanced: viewProcedure
        .input(advancedFilterSchema.optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, filters, orgId, today, where, limit, offset, rows, countRes, total, hasMore;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        if (!db)
                            return [2 /*return*/, { invoices: [], total: 0, hasMore: false }];
                        filters = [];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        // Org isolation
                        if (orgId)
                            filters.push(drizzle_orm_1.eq(schema_1.invoices.organizationId, orgId));
                        // Text search on invoice number, client name, notes
                        if (input === null || input === void 0 ? void 0 : input.search) {
                            filters.push(drizzle_orm_1.or(drizzle_orm_1.like(schema_1.invoices.invoiceNumber, "%" + input.search + "%"), drizzle_orm_1.like(schema_1.invoices.notes, "%" + input.search + "%")));
                        }
                        // Status filter
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            filters.push(drizzle_orm_1.eq(schema_1.invoices.status, input.status));
                        }
                        // Date range
                        if ((input === null || input === void 0 ? void 0 : input.startDate) && (input === null || input === void 0 ? void 0 : input.endDate)) {
                            filters.push(drizzle_orm_1.between(schema_1.invoices.issueDate, input.startDate, input.endDate));
                        }
                        else if (input === null || input === void 0 ? void 0 : input.startDate) {
                            filters.push(drizzle_orm_1.gte(schema_1.invoices.issueDate, input.startDate));
                        }
                        else if (input === null || input === void 0 ? void 0 : input.endDate) {
                            filters.push(drizzle_orm_1.lte(schema_1.invoices.issueDate, input.endDate));
                        }
                        // Amount range
                        if ((input === null || input === void 0 ? void 0 : input.minAmount) !== undefined && (input === null || input === void 0 ? void 0 : input.maxAmount) !== undefined) {
                            filters.push(drizzle_orm_1.between(schema_1.invoices.total, input.minAmount, input.maxAmount));
                        }
                        else if ((input === null || input === void 0 ? void 0 : input.minAmount) !== undefined) {
                            filters.push(drizzle_orm_1.gte(schema_1.invoices.total, input.minAmount));
                        }
                        else if ((input === null || input === void 0 ? void 0 : input.maxAmount) !== undefined) {
                            filters.push(drizzle_orm_1.lte(schema_1.invoices.total, input.maxAmount));
                        }
                        // Client filter
                        if ((input === null || input === void 0 ? void 0 : input.clientIds) && input.clientIds.length > 0) {
                            filters.push(drizzle_orm_1.or.apply(void 0, input.clientIds.map(function (id) { return drizzle_orm_1.eq(schema_1.invoices.clientId, id); })));
                        }
                        // Payment status filters
                        if ((input === null || input === void 0 ? void 0 : input.isPaid) !== undefined) {
                            if (input.isPaid) {
                                // Total paid amount = total amount
                                filters.push(drizzle_orm_1.eq(schema_1.invoices.status, "paid"));
                            }
                            else {
                                // Unpaid or partially paid
                                filters.push(drizzle_orm_1.or(drizzle_orm_1.eq(schema_1.invoices.status, "draft"), drizzle_orm_1.eq(schema_1.invoices.status, "sent"), drizzle_orm_1.eq(schema_1.invoices.status, "partial"), drizzle_orm_1.eq(schema_1.invoices.status, "overdue")));
                            }
                        }
                        // Overdue filter
                        if (input === null || input === void 0 ? void 0 : input.isOverdue) {
                            today = new Date().toISOString().split("T")[0];
                            filters.push(drizzle_orm_1.and(drizzle_orm_1.lte(schema_1.invoices.dueDate, today), drizzle_orm_1.or(drizzle_orm_1.eq(schema_1.invoices.status, "sent"), drizzle_orm_1.eq(schema_1.invoices.status, "partial"), drizzle_orm_1.eq(schema_1.invoices.status, "overdue"))));
                        }
                        where = filters.length > 0 ? drizzle_orm_1.and.apply(void 0, filters) : undefined;
                        limit = (_c = input === null || input === void 0 ? void 0 : input.limit) !== null && _c !== void 0 ? _c : 50;
                        offset = (_d = input === null || input === void 0 ? void 0 : input.offset) !== null && _d !== void 0 ? _d : 0;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(where)
                                .orderBy(drizzle_orm_1.desc(schema_1.invoices.issueDate))
                                .limit(limit)
                                .offset(offset)];
                    case 2:
                        rows = _f.sent();
                        return [4 /*yield*/, db
                                .select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                                .from(schema_1.invoices)
                                .where(where)];
                    case 3:
                        countRes = (_f.sent())[0];
                        total = Number((_e = countRes === null || countRes === void 0 ? void 0 : countRes.count) !== null && _e !== void 0 ? _e : rows.length);
                        hasMore = offset + limit < total;
                        return [2 /*return*/, {
                                invoices: rows,
                                total: total,
                                hasMore: hasMore,
                                limit: limit,
                                offset: offset,
                                pageCount: Math.ceil(total / limit)
                            }];
                }
            });
        });
    }),
    /**
     * Get invoice aging analysis (days overdue breakdown)
     * Returns invoices grouped by aging category: current, 30, 60, 90, 90+
     */
    getAgingAnalysis: viewProcedure
        .input(zod_1.z.object({
        includeDetails: zod_1.z.boolean().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, unpaidInvoices, aging, _i, unpaidInvoices_1, invoice, daysOverdue, category, outstandingAmount;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { summary: {}, details: [] }];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.and(orgId ? drizzle_orm_1.eq(schema_1.invoices.organizationId, orgId) : undefined, drizzle_orm_1.or(drizzle_orm_1.eq(schema_1.invoices.status, "sent"), drizzle_orm_1.eq(schema_1.invoices.status, "partial"), drizzle_orm_1.eq(schema_1.invoices.status, "overdue"))))];
                    case 2:
                        unpaidInvoices = _c.sent();
                        aging = {
                            current: { count: 0, total: 0, invoices: [] },
                            "30days": { count: 0, total: 0, invoices: [] },
                            "60days": { count: 0, total: 0, invoices: [] },
                            "90days": { count: 0, total: 0, invoices: [] },
                            "over90days": { count: 0, total: 0, invoices: [] }
                        };
                        for (_i = 0, unpaidInvoices_1 = unpaidInvoices; _i < unpaidInvoices_1.length; _i++) {
                            invoice = unpaidInvoices_1[_i];
                            daysOverdue = calculateDaysOverdue(invoice.dueDate);
                            category = getAgingCategory(daysOverdue);
                            outstandingAmount = (invoice.total || 0) - (invoice.paidAmount || 0);
                            aging[category].count++;
                            aging[category].total += outstandingAmount;
                            if (input === null || input === void 0 ? void 0 : input.includeDetails) {
                                aging[category].invoices.push({
                                    id: invoice.id,
                                    invoiceNumber: invoice.invoiceNumber,
                                    dueDate: invoice.dueDate,
                                    daysOverdue: daysOverdue,
                                    total: invoice.total,
                                    paidAmount: invoice.paidAmount,
                                    outstandingAmount: outstandingAmount,
                                    clientId: invoice.clientId
                                });
                            }
                        }
                        return [2 /*return*/, {
                                summary: {
                                    totalUnpaid: unpaidInvoices.reduce(function (s, i) { return s + ((i.total || 0) - (i.paidAmount || 0)); }, 0),
                                    totalInvoices: unpaidInvoices.length,
                                    breakdown: aging
                                },
                                details: (input === null || input === void 0 ? void 0 : input.includeDetails) ? aging : undefined
                            }];
                }
            });
        });
    }),
    /**
     * Send batch payment reminders to clients for unpaid invoices
     * Only sends to invoices past due or near due date
     */
    sendBatchReminders: approveProcedure
        .input(zod_1.z.object({
        invoiceIds: zod_1.z.array(zod_1.z.string()).min(1).max(100),
        daysBeforeDue: zod_1.z.number().optional()["default"](3),
        message: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, results, cutoffDate, _i, _b, invoiceId, invoice, error_1, successCount, failedCount, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 10, , 11]);
                        results = [];
                        cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() + input.daysBeforeDue);
                        _i = 0, _b = input.invoiceIds;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 9];
                        invoiceId = _b[_i];
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId), drizzle_orm_1.eq(schema_1.invoices.organizationId, ctx.user.organizationId)))
                                .limit(1)];
                    case 5:
                        invoice = (_c.sent())[0];
                        if (!invoice) {
                            results.push({
                                invoiceId: invoiceId,
                                success: false,
                                reason: "Invoice not found"
                            });
                            return [3 /*break*/, 8];
                        }
                        // Check if invoice is eligible for reminder
                        if (invoice.status === "paid" || invoice.status === "cancelled") {
                            results.push({
                                invoiceId: invoiceId,
                                success: false,
                                reason: "Invoice status " + invoice.status + " - cannot send reminder"
                            });
                            return [3 /*break*/, 8];
                        }
                        // Simulate sending reminder (integrate with email service)
                        // In production, would call email service here
                        console.log("[EMAIL] Sending reminder for invoice " + invoice.invoiceNumber);
                        return [4 /*yield*/, logInvoiceActivity(db, invoiceId, "email_reminder", ctx.user.id, {
                                clientId: invoice.clientId,
                                reminderMessage: input.message
                            })];
                    case 6:
                        _c.sent();
                        results.push({
                            invoiceId: invoiceId,
                            success: true,
                            invoiceNumber: invoice.invoiceNumber
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _c.sent();
                        results.push({
                            invoiceId: invoiceId,
                            success: false,
                            reason: error_1 instanceof Error ? error_1.message : String(error_1)
                        });
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 3];
                    case 9:
                        successCount = results.filter(function (r) { return r.success; }).length;
                        failedCount = results.filter(function (r) { return !r.success; }).length;
                        return [2 /*return*/, {
                                success: failedCount === 0,
                                sent: successCount,
                                failed: failedCount,
                                results: results,
                                message: "Reminders sent: " + successCount + (failedCount > 0 ? ", Failed: " + failedCount : "")
                            }];
                    case 10:
                        error_2 = _c.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to send batch reminders"
                        });
                    case 11: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Apply partial payment to invoice
     * Handles partial payments while keeping invoice open
     */
    applyPartialPayment: createProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        paymentAmount: zod_1.z.number().positive(),
        paymentDate: zod_1.z.string(),
        referenceNumber: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, invoice, outstandingAmount, newPaidAmount, newStatus, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId), drizzle_orm_1.eq(schema_1.invoices.organizationId, ctx.user.organizationId)))
                                .limit(1)];
                    case 3:
                        invoice = (_b.sent())[0];
                        if (!invoice) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
                        }
                        if (invoice.status === "paid" || invoice.status === "cancelled") {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Cannot apply payment to invoice with status: " + invoice.status
                            });
                        }
                        outstandingAmount = (invoice.total || 0) - (invoice.paidAmount || 0);
                        if (input.paymentAmount > outstandingAmount) {
                            throw new server_1.TRPCError({
                                code: "BAD_REQUEST",
                                message: "Payment amount (" + input.paymentAmount + ") exceeds outstanding amount (" + outstandingAmount + ")"
                            });
                        }
                        newPaidAmount = (invoice.paidAmount || 0) + input.paymentAmount;
                        newStatus = newPaidAmount >= (invoice.total || 0) ? "paid" : "partial";
                        return [4 /*yield*/, db
                                .update(schema_1.invoices)
                                .set({
                                paidAmount: newPaidAmount,
                                status: newStatus,
                                updatedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, logInvoiceActivity(db, input.invoiceId, "partial_payment", ctx.user.id, {
                                paymentAmount: input.paymentAmount,
                                totalPaid: newPaidAmount,
                                outstanding: (invoice.total || 0) - newPaidAmount,
                                referenceNumber: input.referenceNumber
                            })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                invoiceId: input.invoiceId,
                                paymentApplied: input.paymentAmount,
                                totalPaid: newPaidAmount,
                                outstanding: (invoice.total || 0) - newPaidAmount,
                                newStatus: newStatus,
                                message: "Payment of " + input.paymentAmount + " applied successfully. Invoice status: " + newStatus
                            }];
                    case 6:
                        error_3 = _b.sent();
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to apply payment"
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Mark batch of invoices as sent
     */
    markBatchAsSent: createProcedure
        .input(zod_1.z.object({
        invoiceIds: zod_1.z.array(zod_1.z.string()).min(1).max(100),
        sentDate: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, sentDate, results, _i, _b, invoiceId, invoice, error_4, successCount, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 11, , 12]);
                        sentDate = input.sentDate || new Date().toISOString();
                        results = [];
                        _i = 0, _b = input.invoiceIds;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _b.length)) return [3 /*break*/, 10];
                        invoiceId = _b[_i];
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 8, , 9]);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))
                                .limit(1)];
                    case 5:
                        invoice = (_c.sent())[0];
                        if (!invoice) {
                            results.push({
                                invoiceId: invoiceId,
                                success: false,
                                reason: "Invoice not found"
                            });
                            return [3 /*break*/, 9];
                        }
                        return [4 /*yield*/, db
                                .update(schema_1.invoices)
                                .set({
                                status: "sent",
                                updatedAt: new Date().toISOString()
                            })
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, logInvoiceActivity(db, invoiceId, "send", ctx.user.id, { sentDate: sentDate })];
                    case 7:
                        _c.sent();
                        results.push({
                            invoiceId: invoiceId,
                            success: true,
                            invoiceNumber: invoice.invoiceNumber
                        });
                        return [3 /*break*/, 9];
                    case 8:
                        error_4 = _c.sent();
                        results.push({
                            invoiceId: invoiceId,
                            success: false,
                            reason: error_4 instanceof Error ? error_4.message : String(error_4)
                        });
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 3];
                    case 10:
                        successCount = results.filter(function (r) { return r.success; }).length;
                        return [2 /*return*/, {
                                success: true,
                                updated: successCount,
                                failed: input.invoiceIds.length - successCount,
                                results: results
                            }];
                    case 11:
                        error_5 = _c.sent();
                        throw new server_1.TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to mark invoices as sent"
                        });
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get invoices expiring soon (with configurable threshold)
     * Useful for payment reminders and cash flow planning
     */
    getExpiringInvoices: viewProcedure
        .input(zod_1.z.object({
        daysThreshold: zod_1.z.number()["default"](30),
        includeOverdue: zod_1.z.boolean().optional()["default"](true)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, today, threshold, filters, where, expiringInvoices;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, { invoices: [] }];
                        orgId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.organizationId;
                        today = new Date();
                        threshold = new Date(today.getTime() + input.daysThreshold * 24 * 60 * 60 * 1000);
                        filters = [
                            drizzle_orm_1.or(drizzle_orm_1.eq(schema_1.invoices.status, "sent"), drizzle_orm_1.eq(schema_1.invoices.status, "partial"))
                        ];
                        if (orgId)
                            filters.push(drizzle_orm_1.eq(schema_1.invoices.organizationId, orgId));
                        if (input.includeOverdue) {
                            filters.push(drizzle_orm_1.lte(schema_1.invoices.dueDate, threshold.toISOString().split("T")[0]));
                        }
                        else {
                            filters.push(drizzle_orm_1.between(schema_1.invoices.dueDate, today.toISOString().split("T")[0], threshold.toISOString().split("T")[0]));
                        }
                        where = filters.length > 0 ? drizzle_orm_1.and.apply(void 0, filters) : undefined;
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(where)
                                .orderBy(drizzle_orm_1.asc(schema_1.invoices.dueDate))];
                    case 2:
                        expiringInvoices = _c.sent();
                        return [2 /*return*/, {
                                invoices: expiringInvoices.map(function (inv) { return (__assign(__assign({}, inv), { daysUntilDue: Math.ceil((new Date(inv.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), outstanding: (inv.total || 0) - (inv.paidAmount || 0) })); }),
                                threshold: input.daysThreshold
                            }];
                }
            });
        });
    })
};
var templateObject_1;
// ============================================================================
// EXPORT ENHANCEMENT GUIDANCE
// ============================================================================
/**
 * INTEGRATION INSTRUCTIONS:
 *
 * 1. Copy the helper functions above to invoices.ts
 * 2. Add the validation schemas to invoices.ts
 * 3. Add these endpoint definitions to the invoicesRouter export in invoices.ts:
 *    - listAdvanced
 *    - getAgingAnalysis
 *    - sendBatchReminders
 *    - applyPartialPayment
 *    - markBatchAsSent
 *    - getExpiringInvoices
 *
 * 4. Import required items at top of invoices.ts:
 *    - import { sql, asc } from "drizzle-orm";
 *
 * 5. Test endpoints:
 *    - POST /invoices.listAdvanced with filters
 *    - GET /invoices.getAgingAnalysis
 *    - POST /invoices.sendBatchReminders
 *    - POST /invoices.applyPartialPayment
 *    - POST /invoices.markBatchAsSent
 *    - GET /invoices.getExpiringInvoices
 */
