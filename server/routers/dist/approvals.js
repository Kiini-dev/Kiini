"use strict";
/**
 * Approval Router
 *
 * Centralized approval endpoints for invoices, estimates, payments, and expenses
 * with role-based access control
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
exports.approvalsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var rbac_1 = require("../middleware/rbac");
var server_1 = require("@trpc/server");
var db = require("../db");
var emailNotifications_1 = require("./emailNotifications");
var triggerEngine_1 = require("../workflows/triggerEngine");
var uuid_1 = require("uuid");
// Helper function to create in-app notification
function createApprovalNotification(database, userId, title, message, type, category, actionUrl, priority) {
    if (priority === void 0) { priority = "normal"; }
    return __awaiter(this, void 0, void 0, function () {
        var notifId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    notifId = uuid_1.v4();
                    return [4 /*yield*/, database.insert(schema_1.notifications).values({
                            id: notifId,
                            userId: userId,
                            title: title,
                            message: message,
                            type: type,
                            category: category,
                            actionUrl: actionUrl,
                            priority: priority,
                            isRead: 0,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Failed to create notification:", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Helper function to convert cents (int) to currency (decimal)
var centsToCurrency = function (cents) {
    if (!cents)
        return 0;
    return cents / 100;
};
exports.approvalsRouter = trpc_1.router({
    // Approve invoice
    approveInvoice: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:approve")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, invoiceCond, invoice, now, creator, _b, error_2, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        // Validate user has permission to approve invoices
                        rbac_1.validateApprovalAction(ctx.user.role, "invoice");
                        orgId = ctx.user.organizationId;
                        invoiceCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.id, input.id), drizzle_orm_1.eq(schema_1.invoices.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.invoices.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.invoices).where(invoiceCond).limit(1)];
                    case 2:
                        invoice = _c.sent();
                        if (!invoice.length)
                            throw new Error("Invoice not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.invoices).set({
                                status: "sent",
                                approvedBy: ctx.user.id,
                                approvedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.invoices.id, input.id))];
                    case 3:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "invoice_approved",
                                entityType: "invoice",
                                entityId: input.id,
                                description: "Approved invoice: " + invoice[0].invoiceNumber + " - Total: " + invoice[0].total + (input.notes ? " (Notes: " + input.notes + ")" : '')
                            })];
                    case 4:
                        // Log activity
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 12, , 13]);
                        if (!invoice[0].createdBy) return [3 /*break*/, 7];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, invoice[0].createdBy)).limit(1)];
                    case 6:
                        _b = _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _b = null;
                        _c.label = 8;
                    case 8:
                        creator = _b;
                        if (!(creator && creator.length && creator[0].email)) return [3 /*break*/, 11];
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: invoice[0].createdBy,
                                eventType: "invoice_approved",
                                recipientEmail: creator[0].email,
                                recipientName: creator[0].name,
                                subject: "Invoice " + invoice[0].invoiceNumber + " Approved",
                                htmlContent: "<p>Your invoice <strong>" + invoice[0].invoiceNumber + "</strong> has been approved.</p><p><strong>Amount:</strong> KES " + invoice[0].total + "</p>" + (input.notes ? "<p><strong>Notes:</strong> " + input.notes + "</p>" : ''),
                                entityType: "invoice",
                                entityId: input.id,
                                actionUrl: "/invoices/" + input.id
                            })];
                    case 9:
                        _c.sent();
                        // Create in-app notification for creator
                        return [4 /*yield*/, createApprovalNotification(database, invoice[0].createdBy, "Invoice Approved", "Your invoice " + invoice[0].invoiceNumber + " has been approved by " + (ctx.user.name || ctx.user.email) + ". " + (input.notes ? "Notes: " + input.notes : ''), "success", "invoices", "/invoices/" + input.id, "high")];
                    case 10:
                        // Create in-app notification for creator
                        _c.sent();
                        _c.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_2 = _c.sent();
                        console.error("Failed to send approval notification:", error_2);
                        return [3 /*break*/, 13];
                    case 13:
                        _c.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, triggerEngine_1.workflowTriggerEngine.trigger({
                                triggerType: "invoice_approved",
                                entityType: "invoice",
                                entityId: input.id,
                                data: {
                                    invoiceId: invoice[0].id,
                                    invoiceNumber: invoice[0].invoiceNumber,
                                    total: invoice[0].total,
                                    approvedBy: ctx.user.id
                                },
                                userId: ctx.user.id
                            })];
                    case 14:
                        _c.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        err_1 = _c.sent();
                        console.error("Workflow trigger (invoice_approved) failed:", err_1);
                        return [3 /*break*/, 16];
                    case 16: return [2 /*return*/, { success: true, message: "Invoice approved successfully" }];
                }
            });
        });
    }),
    // Reject invoice
    rejectInvoice: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:reject")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        reason: zod_1.z.string().min(1, "Rejection reason is required")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, invoiceCond, invoice, now, creator, _b, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        rbac_1.validateApprovalAction(ctx.user.role, "invoice");
                        orgId = ctx.user.organizationId;
                        invoiceCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.id, input.id), drizzle_orm_1.eq(schema_1.invoices.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.invoices.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.invoices).where(invoiceCond).limit(1)];
                    case 2:
                        invoice = _c.sent();
                        if (!invoice.length)
                            throw new Error("Invoice not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.invoices).set({
                                status: "rejected",
                                approvedBy: ctx.user.id,
                                approvedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.invoices.id, input.id))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "invoice_rejected",
                                entityType: "invoice",
                                entityId: input.id,
                                description: "Rejected invoice: " + invoice[0].invoiceNumber + " - Reason: " + input.reason
                            })];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 12, , 13]);
                        if (!invoice[0].createdBy) return [3 /*break*/, 7];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, invoice[0].createdBy)).limit(1)];
                    case 6:
                        _b = _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _b = null;
                        _c.label = 8;
                    case 8:
                        creator = _b;
                        if (!(creator && creator.length && creator[0].email)) return [3 /*break*/, 11];
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: invoice[0].createdBy,
                                eventType: "invoice_rejected",
                                recipientEmail: creator[0].email,
                                recipientName: creator[0].name,
                                subject: "Invoice " + invoice[0].invoiceNumber + " Rejected",
                                htmlContent: "<p>Your invoice <strong>" + invoice[0].invoiceNumber + "</strong> has been rejected.</p><p><strong>Reason:</strong> " + input.reason + "</p>",
                                entityType: "invoice",
                                entityId: input.id,
                                actionUrl: "/invoices/" + input.id
                            })];
                    case 9:
                        _c.sent();
                        // Create in-app notification for creator
                        return [4 /*yield*/, createApprovalNotification(database, invoice[0].createdBy, "Invoice Rejected", "Your invoice " + invoice[0].invoiceNumber + " has been rejected. Reason: " + input.reason, "error", "invoices", "/invoices/" + input.id, "high")];
                    case 10:
                        // Create in-app notification for creator
                        _c.sent();
                        _c.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_3 = _c.sent();
                        console.error("Failed to send rejection notification:", error_3);
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/, { success: true, message: "Invoice rejected successfully" }];
                }
            });
        });
    }),
    // Approve estimate
    approveEstimate: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:approve")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, estimateCond, estimate, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        // Validate user has permission to approve estimates
                        rbac_1.validateApprovalAction(ctx.user.role, "estimate");
                        orgId = ctx.user.organizationId;
                        estimateCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.estimates.id, input.id), drizzle_orm_1.eq(schema_1.estimates.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.estimates.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.estimates).where(estimateCond).limit(1)];
                    case 2:
                        estimate = _b.sent();
                        if (!estimate.length)
                            throw new Error("Estimate not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.estimates).set({
                                status: "accepted",
                                approvedBy: ctx.user.id,
                                approvedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.estimates.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "estimate_approved",
                                entityType: "estimate",
                                entityId: input.id,
                                description: "Approved estimate: " + estimate[0].estimateNumber + " - Total: " + estimate[0].total + (input.notes ? " (Notes: " + input.notes + ")" : '')
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Estimate approved successfully" }];
                }
            });
        });
    }),
    // Reject estimate
    rejectEstimate: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:reject")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        reason: zod_1.z.string().min(1, "Rejection reason is required")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, estimateCond, estimate, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        rbac_1.validateApprovalAction(ctx.user.role, "estimate");
                        orgId = ctx.user.organizationId;
                        estimateCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.estimates.id, input.id), drizzle_orm_1.eq(schema_1.estimates.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.estimates.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.estimates).where(estimateCond).limit(1)];
                    case 2:
                        estimate = _b.sent();
                        if (!estimate.length)
                            throw new Error("Estimate not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.estimates).set({
                                status: "rejected",
                                approvedBy: ctx.user.id,
                                approvedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.estimates.id, input.id))];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "estimate_rejected",
                                entityType: "estimate",
                                entityId: input.id,
                                description: "Rejected estimate: " + estimate[0].estimateNumber + " - Reason: " + input.reason
                            })];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Estimate rejected successfully" }];
                }
            });
        });
    }),
    // Approve payment
    approvePayment: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:approve")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, paymentCond, payment, now, creator, _b, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        // Validate user has permission to approve payments
                        rbac_1.validateApprovalAction(ctx.user.role, "payment");
                        orgId = ctx.user.organizationId;
                        paymentCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.id, input.id), drizzle_orm_1.eq(schema_1.payments.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.payments.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.payments).where(paymentCond).limit(1)];
                    case 2:
                        payment = _c.sent();
                        if (!payment.length)
                            throw new Error("Payment not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.payments).set({
                                status: "completed",
                                approvedBy: ctx.user.id,
                                approvedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.payments.id, input.id))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_approved",
                                entityType: "payment",
                                entityId: input.id,
                                description: "Approved payment: " + (payment[0].referenceNumber || input.id) + " - Ksh " + payment[0].amount / 100 + (input.notes ? " (Notes: " + input.notes + ")" : '')
                            })];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 11, , 12]);
                        if (!payment[0].createdBy) return [3 /*break*/, 7];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, payment[0].createdBy)).limit(1)];
                    case 6:
                        _b = _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _b = null;
                        _c.label = 8;
                    case 8:
                        creator = _b;
                        if (!(creator && creator.length && creator[0].email)) return [3 /*break*/, 10];
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: payment[0].createdBy,
                                eventType: "payment_approved",
                                recipientEmail: creator[0].email,
                                recipientName: creator[0].name,
                                subject: "Payment Approved",
                                htmlContent: "<p>Your payment for <strong>" + (payment[0].referenceNumber || input.id) + "</strong> has been approved.</p><p><strong>Amount:</strong> KES " + payment[0].amount / 100 + "</p>" + (input.notes ? "<p><strong>Notes:</strong> " + input.notes + "</p>" : ''),
                                entityType: "payment",
                                entityId: input.id,
                                actionUrl: "/payments/" + input.id
                            })];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_4 = _c.sent();
                        console.error("Failed to send approval notification:", error_4);
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/, { success: true, message: "Payment approved successfully" }];
                }
            });
        });
    }),
    // Reject payment
    rejectPayment: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:reject")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        reason: zod_1.z.string().min(1, "Rejection reason is required")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, paymentCond, payment, now, creator, _b, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        rbac_1.validateApprovalAction(ctx.user.role, "payment");
                        orgId = ctx.user.organizationId;
                        paymentCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.payments.id, input.id), drizzle_orm_1.eq(schema_1.payments.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.payments.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.payments).where(paymentCond).limit(1)];
                    case 2:
                        payment = _c.sent();
                        if (!payment.length)
                            throw new Error("Payment not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.payments).set({
                                status: "rejected",
                                approvedBy: ctx.user.id,
                                approvedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.payments.id, input.id))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_rejected",
                                entityType: "payment",
                                entityId: input.id,
                                description: "Rejected payment: " + (payment[0].referenceNumber || input.id) + " - Reason: " + input.reason
                            })];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 11, , 12]);
                        if (!payment[0].createdBy) return [3 /*break*/, 7];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, payment[0].createdBy)).limit(1)];
                    case 6:
                        _b = _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _b = null;
                        _c.label = 8;
                    case 8:
                        creator = _b;
                        if (!(creator && creator.length && creator[0].email)) return [3 /*break*/, 10];
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: payment[0].createdBy,
                                eventType: "payment_rejected",
                                recipientEmail: creator[0].email,
                                recipientName: creator[0].name,
                                subject: "Payment Rejected",
                                htmlContent: "<p>Your payment for <strong>" + (payment[0].referenceNumber || input.id) + "</strong> has been rejected.</p><p><strong>Reason:</strong> " + input.reason + "</p>",
                                entityType: "payment",
                                entityId: input.id,
                                actionUrl: "/payments/" + input.id
                            })];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_5 = _c.sent();
                        console.error("Failed to send rejection notification:", error_5);
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/, { success: true, message: "Payment rejected successfully" }];
                }
            });
        });
    }),
    // Approve expense
    approveExpense: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:approve")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, expenseCond, expense, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        // Validate user has permission to approve expenses
                        rbac_1.validateApprovalAction(ctx.user.role, "expense");
                        orgId = ctx.user.organizationId;
                        expenseCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.expenses.id, input.id), drizzle_orm_1.eq(schema_1.expenses.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.expenses.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.expenses).where(expenseCond).limit(1)];
                    case 2:
                        expense = _b.sent();
                        if (!expense.length)
                            throw new Error("Expense not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.expenses).set({
                                status: "approved",
                                approvedBy: ctx.user.id,
                                approvedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.expenses.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "expense_approved",
                                entityType: "expense",
                                entityId: input.id,
                                description: "Approved expense: " + input.id + (input.notes ? " (Notes: " + input.notes + ")" : '')
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Expense approved successfully" }];
                }
            });
        });
    }),
    // Reject expense
    rejectExpense: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:reject")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        reason: zod_1.z.string().min(1, "Rejection reason is required")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, expenseCond, expense, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        // Validate user has permission to approve expenses
                        rbac_1.validateApprovalAction(ctx.user.role, "expense");
                        orgId = ctx.user.organizationId;
                        expenseCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.expenses.id, input.id), drizzle_orm_1.eq(schema_1.expenses.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.expenses.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.expenses).where(expenseCond).limit(1)];
                    case 2:
                        expense = _b.sent();
                        if (!expense.length)
                            throw new Error("Expense not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.expenses).set({
                                status: "rejected",
                                approvedBy: ctx.user.id,
                                approvedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.expenses.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "expense_rejected",
                                entityType: "expense",
                                entityId: input.id,
                                description: "Rejected expense: " + input.id + " - Reason: " + input.reason
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Expense rejected successfully" }];
                }
            });
        });
    }),
    // Approve Budget
    approveBudget: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:approve")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, budgetCond, budget, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        budgetCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.budgets.id, input.id), drizzle_orm_1.eq(schema_1.budgets.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.budgets.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.budgets).where(budgetCond).limit(1)];
                    case 2:
                        budget = _b.sent();
                        if (!budget.length)
                            throw new Error("Budget not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.budgets).set({
                                budgetStatus: "active",
                                approvedBy: ctx.user.id,
                                approvedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.budgets.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_approved",
                                entityType: "budget",
                                entityId: input.id,
                                description: "Approved budget: " + budget[0].budgetName + " - KES " + budget[0].amount + (input.notes ? " (Notes: " + input.notes + ")" : '')
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Budget approved successfully" }];
                }
            });
        });
    }),
    // Reject Budget
    rejectBudget: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:reject")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        reason: zod_1.z.string().min(1, "Rejection reason is required")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, budgetCond, budget, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        orgId = ctx.user.organizationId;
                        budgetCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.budgets.id, input.id), drizzle_orm_1.eq(schema_1.budgets.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.budgets.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.budgets).where(budgetCond).limit(1)];
                    case 2:
                        budget = _b.sent();
                        if (!budget.length)
                            throw new Error("Budget not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.budgets).set({
                                budgetStatus: "inactive",
                                approvedBy: ctx.user.id,
                                approvedAt: now
                            }).where(drizzle_orm_1.eq(schema_1.budgets.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "budget_rejected",
                                entityType: "budget",
                                entityId: input.id,
                                description: "Rejected budget: " + budget[0].budgetName + " - Reason: " + input.reason
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "Budget rejected successfully" }];
                }
            });
        });
    }),
    // Approve LPO
    approveLPO: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:approve")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, now, orgId, lpoSql, lpoParams, error_6;
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
                        _c.trys.push([2, 5, , 6]);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        orgId = ctx.user.organizationId;
                        lpoSql = orgId
                            ? "UPDATE lpos SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ? AND organizationId = ?"
                            : "UPDATE lpos SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ?";
                        lpoParams = orgId
                            ? ["approved", ctx.user.id, now, now, input.id, orgId]
                            : ["approved", ctx.user.id, now, now, input.id];
                        return [4 /*yield*/, ((_b = database.raw) === null || _b === void 0 ? void 0 : _b.call(database, lpoSql, lpoParams))];
                    case 3:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "lpo_approved",
                                entityType: "lpo",
                                entityId: input.id,
                                description: "Approved LPO: " + input.id + (input.notes ? " (Notes: " + input.notes + ")" : '')
                            })];
                    case 4:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true, message: "LPO approved successfully" }];
                    case 5:
                        error_6 = _c.sent();
                        throw new Error("Failed to approve LPO");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Reject LPO
    rejectLPO: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:reject")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        reason: zod_1.z.string().min(1, "Rejection reason is required")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, now, orgId, lpoSql, lpoParams, error_7;
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
                        _c.trys.push([2, 5, , 6]);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        orgId = ctx.user.organizationId;
                        lpoSql = orgId
                            ? "UPDATE lpos SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ? AND organizationId = ?"
                            : "UPDATE lpos SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ?";
                        lpoParams = orgId
                            ? ["rejected", ctx.user.id, now, now, input.id, orgId]
                            : ["rejected", ctx.user.id, now, now, input.id];
                        return [4 /*yield*/, ((_b = database.raw) === null || _b === void 0 ? void 0 : _b.call(database, lpoSql, lpoParams))];
                    case 3:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "lpo_rejected",
                                entityType: "lpo",
                                entityId: input.id,
                                description: "Rejected LPO: " + input.id + " - Reason: " + input.reason
                            })];
                    case 4:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true, message: "LPO rejected successfully" }];
                    case 5:
                        error_7 = _c.sent();
                        throw new Error("Failed to reject LPO");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Approve Purchase Order
    approvePurchaseOrder: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:approve")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, now, orgId, poSql, poParams, error_8;
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
                        _c.trys.push([2, 5, , 6]);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        orgId = ctx.user.organizationId;
                        poSql = orgId
                            ? "UPDATE purchase_orders SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ? AND organizationId = ?"
                            : "UPDATE purchase_orders SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ?";
                        poParams = orgId
                            ? ["confirmed", ctx.user.id, now, now, input.id, orgId]
                            : ["confirmed", ctx.user.id, now, now, input.id];
                        return [4 /*yield*/, ((_b = database.raw) === null || _b === void 0 ? void 0 : _b.call(database, poSql, poParams))];
                    case 3:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "purchase_order_approved",
                                entityType: "purchase_order",
                                entityId: input.id,
                                description: "Approved Purchase Order: " + input.id + (input.notes ? " (Notes: " + input.notes + ")" : '')
                            })];
                    case 4:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true, message: "Purchase Order approved successfully" }];
                    case 5:
                        error_8 = _c.sent();
                        throw new Error("Failed to approve Purchase Order");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Reject Purchase Order
    rejectPurchaseOrder: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:reject")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        reason: zod_1.z.string().min(1, "Rejection reason is required")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, now, orgId, poSql, poParams, error_9;
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
                        _c.trys.push([2, 5, , 6]);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        orgId = ctx.user.organizationId;
                        poSql = orgId
                            ? "UPDATE purchase_orders SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ? AND organizationId = ?"
                            : "UPDATE purchase_orders SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ?";
                        poParams = orgId
                            ? ["cancelled", ctx.user.id, now, now, input.id, orgId]
                            : ["cancelled", ctx.user.id, now, now, input.id];
                        return [4 /*yield*/, ((_b = database.raw) === null || _b === void 0 ? void 0 : _b.call(database, poSql, poParams))];
                    case 3:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "purchase_order_rejected",
                                entityType: "purchase_order",
                                entityId: input.id,
                                description: "Rejected Purchase Order: " + input.id + " - Reason: " + input.reason
                            })];
                    case 4:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true, message: "Purchase Order rejected successfully" }];
                    case 5:
                        error_9 = _c.sent();
                        throw new Error("Failed to reject Purchase Order");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Approve Imprest
    approveImprest: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:approve")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, now, orgId, impSql, impParams, error_10;
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
                        _c.trys.push([2, 5, , 6]);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        orgId = ctx.user.organizationId;
                        impSql = orgId
                            ? "UPDATE imprests SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ? AND organizationId = ?"
                            : "UPDATE imprests SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ?";
                        impParams = orgId
                            ? ["approved", ctx.user.id, now, now, input.id, orgId]
                            : ["approved", ctx.user.id, now, now, input.id];
                        return [4 /*yield*/, ((_b = database.raw) === null || _b === void 0 ? void 0 : _b.call(database, impSql, impParams))];
                    case 3:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "imprest_approved",
                                entityType: "imprest",
                                entityId: input.id,
                                description: "Approved Imprest: " + input.id + (input.notes ? " (Notes: " + input.notes + ")" : '')
                            })];
                    case 4:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true, message: "Imprest approved successfully" }];
                    case 5:
                        error_10 = _c.sent();
                        throw new Error("Failed to approve Imprest");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Reject Imprest
    rejectImprest: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:reject")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        reason: zod_1.z.string().min(1, "Rejection reason is required")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, now, orgId, impSql, impParams, error_11;
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
                        _c.trys.push([2, 5, , 6]);
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        orgId = ctx.user.organizationId;
                        impSql = orgId
                            ? "UPDATE imprests SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ? AND organizationId = ?"
                            : "UPDATE imprests SET status = ?, approvedBy = ?, approvedAt = ?, updatedAt = ? WHERE id = ?";
                        impParams = orgId
                            ? ["rejected", ctx.user.id, now, now, input.id, orgId]
                            : ["rejected", ctx.user.id, now, now, input.id];
                        return [4 /*yield*/, ((_b = database.raw) === null || _b === void 0 ? void 0 : _b.call(database, impSql, impParams))];
                    case 3:
                        _c.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "imprest_rejected",
                                entityType: "imprest",
                                entityId: input.id,
                                description: "Rejected Imprest: " + input.id + " - Reason: " + input.reason
                            })];
                    case 4:
                        // Log activity
                        _c.sent();
                        return [2 /*return*/, { success: true, message: "Imprest rejected successfully" }];
                    case 5:
                        error_11 = _c.sent();
                        throw new Error("Failed to reject Imprest");
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    // Approve leave request
    approveLeaveRequest: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:approve")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, leaveCond, leave, now, employee, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        // Validate user has permission to approve leave requests
                        rbac_1.validateApprovalAction(ctx.user.role, "leave_request");
                        orgId = ctx.user.organizationId;
                        leaveCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveRequests.id, input.id), drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.leaveRequests.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.leaveRequests).where(leaveCond).limit(1)];
                    case 2:
                        leave = _b.sent();
                        if (!leave.length)
                            throw new Error("Leave request not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.leaveRequests).set({
                                status: "approved",
                                approvedBy: ctx.user.id,
                                approvalDate: now
                            }).where(drizzle_orm_1.eq(schema_1.leaveRequests.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "leave_request_approved",
                                entityType: "leave_request",
                                entityId: input.id,
                                description: "Approved leave request: " + leave[0].leaveType + " from " + leave[0].startDate + " to " + leave[0].endDate + (input.notes ? " (Notes: " + input.notes + ")" : '')
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 9, , 10]);
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, leave[0].employeeId)).limit(1)];
                    case 6:
                        employee = _b.sent();
                        if (!(employee.length && employee[0].email)) return [3 /*break*/, 8];
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: leave[0].employeeId,
                                eventType: "leave_request_approved",
                                recipientEmail: employee[0].email,
                                recipientName: employee[0].name,
                                subject: "Leave Request Approved",
                                htmlContent: "<p>Your " + leave[0].leaveType + " leave request from " + leave[0].startDate + " to " + leave[0].endDate + " has been approved.</p>" + (input.notes ? "<p><strong>Notes:</strong> " + input.notes + "</p>" : ''),
                                entityType: "leave_request",
                                entityId: input.id,
                                actionUrl: "/leave-management/" + input.id
                            })];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_12 = _b.sent();
                        console.error("Failed to send notification:", error_12);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, { success: true, message: "Leave request approved successfully" }];
                }
            });
        });
    }),
    // Reject leave request
    rejectLeaveRequest: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:reject")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        reason: zod_1.z.string().min(1, "Rejection reason is required")
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, orgId, leaveCond, leave, now, employee, error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        rbac_1.validateApprovalAction(ctx.user.role, "leave_request");
                        orgId = ctx.user.organizationId;
                        leaveCond = orgId
                            ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.leaveRequests.id, input.id), drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, orgId))
                            : drizzle_orm_1.eq(schema_1.leaveRequests.id, input.id);
                        return [4 /*yield*/, database.select().from(schema_1.leaveRequests).where(leaveCond).limit(1)];
                    case 2:
                        leave = _b.sent();
                        if (!leave.length)
                            throw new Error("Leave request not found");
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, database.update(schema_1.leaveRequests).set({
                                status: "rejected",
                                approvedBy: ctx.user.id,
                                approvalDate: now,
                                notes: input.reason
                            }).where(drizzle_orm_1.eq(schema_1.leaveRequests.id, input.id))];
                    case 3:
                        _b.sent();
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "leave_request_rejected",
                                entityType: "leave_request",
                                entityId: input.id,
                                description: "Rejected leave request: " + leave[0].leaveType + " - Reason: " + input.reason
                            })];
                    case 4:
                        // Log activity
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 9, , 10]);
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, leave[0].employeeId)).limit(1)];
                    case 6:
                        employee = _b.sent();
                        if (!(employee.length && employee[0].email)) return [3 /*break*/, 8];
                        return [4 /*yield*/, emailNotifications_1.triggerEventNotification({
                                userId: leave[0].employeeId,
                                eventType: "leave_request_rejected",
                                recipientEmail: employee[0].email,
                                recipientName: employee[0].name,
                                subject: "Leave Request Rejected",
                                htmlContent: "<p>Your " + leave[0].leaveType + " leave request from " + leave[0].startDate + " to " + leave[0].endDate + " has been rejected.</p><p><strong>Reason:</strong> " + input.reason + "</p>",
                                entityType: "leave_request",
                                entityId: input.id,
                                actionUrl: "/leave-management/" + input.id
                            })];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_13 = _b.sent();
                        console.error("Failed to send notification:", error_13);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, { success: true, message: "Leave request rejected successfully" }];
                }
            });
        });
    }),
    // Get pending approvals for current user
    getPendingApprovals: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:read")
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, canApprove, pendingInvoices, pendingEstimates, pendingExpenses;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, {
                                    expenses: [],
                                    invoices: [],
                                    estimates: []
                                }];
                        canApprove = ["super_admin", "admin", "accountant", "hr"].includes(ctx.user.role);
                        if (!canApprove) {
                            return [2 /*return*/, {
                                    expenses: [],
                                    invoices: [],
                                    estimates: []
                                }];
                        }
                        return [4 /*yield*/, database.select().from(schema_1.invoices).where(ctx.user.organizationId
                                ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.status, "draft"), drizzle_orm_1.eq(schema_1.invoices.organizationId, ctx.user.organizationId))
                                : drizzle_orm_1.eq(schema_1.invoices.status, "draft"))];
                    case 2:
                        pendingInvoices = _b.sent();
                        return [4 /*yield*/, database.select().from(schema_1.estimates).where(ctx.user.organizationId
                                ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.estimates.status, "draft"), drizzle_orm_1.eq(schema_1.estimates.organizationId, ctx.user.organizationId))
                                : drizzle_orm_1.eq(schema_1.estimates.status, "draft"))];
                    case 3:
                        pendingEstimates = _b.sent();
                        return [4 /*yield*/, database.select().from(schema_1.expenses).where(ctx.user.organizationId
                                ? drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.expenses.status, "pending"), drizzle_orm_1.eq(schema_1.expenses.organizationId, ctx.user.organizationId))
                                : drizzle_orm_1.eq(schema_1.expenses.status, "pending"))];
                    case 4:
                        pendingExpenses = _b.sent();
                        return [2 /*return*/, {
                                invoices: pendingInvoices,
                                estimates: pendingEstimates,
                                expenses: pendingExpenses
                            }];
                }
            });
        });
    }),
    // Get comprehensive list of all approvals (unified endpoint)
    getApprovals: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:read")
        .input(zod_1.z.object({
        type: zod_1.z["enum"](["all", "invoice", "expense", "payment", "purchase_order", "leave_request"]).optional(),
        status: zod_1.z["enum"](["pending", "approved", "rejected"]).optional(),
        priority: zod_1.z["enum"](["low", "medium", "high", "critical"]).optional(),
        search: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, canApprove, approvals, search, orgId, invoiceWhere, invoiceRecords, _i, invoiceRecords_1, invoice, statusFilter, invoiceStatus, requestedBy, _b, approvedByUser, _c, err_2, orgId, expenseWhere, expenseRecords, _d, expenseRecords_1, expense, status, requestedBy, _e, approvedByUser, _f, priority, err_3, orgId, paymentsWhere, paymentRecords, _g, paymentRecords_1, payment, paymentStatus, requestedBy, _h, approvedByUser, _j, priority, displayStatus, err_4, orgId, leaveWhere, leaveRecords, _k, leaveRecords_1, leave, leaveStatus, requestedBy, _l, approvedByUser, _m, err_5, orgId, budgetWhere, budgetRecords, _o, budgetRecords_1, budget, budgetStatus, requestedBy, _p, approvedByUser, _q, priority, displayStatus, err_6, orgId, lpoRecords, _r, _s, lpoRecords_1, lpo, lpoStatus, priority, displayStatus, e_1, orgId, orderRecords, _t, _u, orderRecords_1, order, orderStatus, priority, displayStatus, e_2, imprestRecords, _v, imprestRecords_1, imprest, imprestStatus, priority, e_3;
            var _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
            return __generator(this, function (_14) {
                switch (_14.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _14.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        canApprove = ["super_admin", "admin", "accountant", "hr"].includes(ctx.user.role);
                        if (!canApprove) {
                            return [2 /*return*/, []];
                        }
                        approvals = [];
                        search = ((_w = input === null || input === void 0 ? void 0 : input.search) === null || _w === void 0 ? void 0 : _w.toLowerCase()) || "";
                        if (!(!(input === null || input === void 0 ? void 0 : input.type) || input.type === "all" || input.type === "invoice")) return [3 /*break*/, 14];
                        _14.label = 2;
                    case 2:
                        _14.trys.push([2, 13, , 14]);
                        orgId = ctx.user.organizationId;
                        invoiceWhere = orgId ? drizzle_orm_1.eq(schema_1.invoices.organizationId, orgId) : undefined;
                        return [4 /*yield*/, database.select().from(schema_1.invoices).where(invoiceWhere)];
                    case 3:
                        invoiceRecords = _14.sent();
                        _i = 0, invoiceRecords_1 = invoiceRecords;
                        _14.label = 4;
                    case 4:
                        if (!(_i < invoiceRecords_1.length)) return [3 /*break*/, 12];
                        invoice = invoiceRecords_1[_i];
                        statusFilter = (input === null || input === void 0 ? void 0 : input.status) || "pending";
                        if (statusFilter !== "pending" && statusFilter !== "approved" && statusFilter !== "rejected")
                            return [3 /*break*/, 11];
                        invoiceStatus = invoice.status === "draft" ? "pending" : invoice.status === "sent" ? "approved" : "rejected";
                        if ((input === null || input === void 0 ? void 0 : input.status) && invoiceStatus !== input.status)
                            return [3 /*break*/, 11];
                        if (search && !((_x = invoice.invoiceNumber) === null || _x === void 0 ? void 0 : _x.toLowerCase().includes(search)) && !((_y = invoice.clientId) === null || _y === void 0 ? void 0 : _y.toLowerCase().includes(search)))
                            return [3 /*break*/, 11];
                        if (!invoice.createdBy) return [3 /*break*/, 6];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, invoice.createdBy)).then(function (r) { return r[0]; })];
                    case 5:
                        _b = _14.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _b = null;
                        _14.label = 7;
                    case 7:
                        requestedBy = _b;
                        if (!invoice.approvedBy) return [3 /*break*/, 9];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, invoice.approvedBy)).then(function (r) { return r[0]; })];
                    case 8:
                        _c = _14.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        _c = null;
                        _14.label = 10;
                    case 10:
                        approvedByUser = _c;
                        approvals.push({
                            id: invoice.id,
                            type: "invoice",
                            referenceId: invoice.id,
                            referenceNo: invoice.invoiceNumber || "INV-" + invoice.id,
                            amount: centsToCurrency(invoice.total),
                            requestedBy: (requestedBy === null || requestedBy === void 0 ? void 0 : requestedBy.name) || (requestedBy === null || requestedBy === void 0 ? void 0 : requestedBy.email) || "Unknown",
                            requestedAt: invoice.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
                            approvedBy: (approvedByUser === null || approvedByUser === void 0 ? void 0 : approvedByUser.name) || (approvedByUser === null || approvedByUser === void 0 ? void 0 : approvedByUser.email) || null,
                            approvedAt: invoice.approvedAt || null,
                            status: invoiceStatus,
                            priority: "medium",
                            description: "Invoice for KES " + invoice.total,
                            approvers: ["Super Admin", "Admin", "Accountant"]
                        });
                        _14.label = 11;
                    case 11:
                        _i++;
                        return [3 /*break*/, 4];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        err_2 = _14.sent();
                        console.warn("Error fetching invoices for approvals:", err_2);
                        return [3 /*break*/, 14];
                    case 14:
                        if (!(!(input === null || input === void 0 ? void 0 : input.type) || input.type === "all" || input.type === "expense")) return [3 /*break*/, 27];
                        _14.label = 15;
                    case 15:
                        _14.trys.push([15, 26, , 27]);
                        orgId = ctx.user.organizationId;
                        expenseWhere = orgId ? drizzle_orm_1.eq(schema_1.expenses.organizationId, orgId) : undefined;
                        return [4 /*yield*/, database.select().from(schema_1.expenses).where(expenseWhere)];
                    case 16:
                        expenseRecords = _14.sent();
                        _d = 0, expenseRecords_1 = expenseRecords;
                        _14.label = 17;
                    case 17:
                        if (!(_d < expenseRecords_1.length)) return [3 /*break*/, 25];
                        expense = expenseRecords_1[_d];
                        status = expense.status;
                        if ((input === null || input === void 0 ? void 0 : input.status) && status !== input.status)
                            return [3 /*break*/, 24];
                        if (search && !((_z = expense.expenseNumber) === null || _z === void 0 ? void 0 : _z.toLowerCase().includes(search)) && !((_0 = expense.description) === null || _0 === void 0 ? void 0 : _0.toLowerCase().includes(search)))
                            return [3 /*break*/, 24];
                        if (!expense.createdBy) return [3 /*break*/, 19];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, expense.createdBy)).then(function (r) { return r[0]; })];
                    case 18:
                        _e = _14.sent();
                        return [3 /*break*/, 20];
                    case 19:
                        _e = null;
                        _14.label = 20;
                    case 20:
                        requestedBy = _e;
                        if (!expense.approvedBy) return [3 /*break*/, 22];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, expense.approvedBy)).then(function (r) { return r[0]; })];
                    case 21:
                        _f = _14.sent();
                        return [3 /*break*/, 23];
                    case 22:
                        _f = null;
                        _14.label = 23;
                    case 23:
                        approvedByUser = _f;
                        priority = "low";
                        if (expense.amount >= 100000)
                            priority = "critical";
                        else if (expense.amount >= 50000)
                            priority = "high";
                        else if (expense.amount >= 10000)
                            priority = "medium";
                        if ((input === null || input === void 0 ? void 0 : input.priority) && priority !== input.priority)
                            return [3 /*break*/, 24];
                        approvals.push({
                            id: expense.id,
                            type: "expense",
                            referenceId: expense.id,
                            referenceNo: expense.expenseNumber || "EXP-" + expense.id.substring(0, 8),
                            amount: centsToCurrency(expense.amount),
                            requestedBy: (requestedBy === null || requestedBy === void 0 ? void 0 : requestedBy.name) || (requestedBy === null || requestedBy === void 0 ? void 0 : requestedBy.email) || "Unknown",
                            requestedAt: expense.expenseDate || new Date().toISOString(),
                            approvedBy: (approvedByUser === null || approvedByUser === void 0 ? void 0 : approvedByUser.name) || (approvedByUser === null || approvedByUser === void 0 ? void 0 : approvedByUser.email) || null,
                            approvedAt: expense.approvedAt || null,
                            status: status,
                            priority: priority,
                            description: expense.description || "Expense: " + expense.category,
                            approvers: ["Super Admin", "Manager", "Finance"]
                        });
                        _14.label = 24;
                    case 24:
                        _d++;
                        return [3 /*break*/, 17];
                    case 25: return [3 /*break*/, 27];
                    case 26:
                        err_3 = _14.sent();
                        console.warn("Error fetching expenses for approvals:", err_3);
                        return [3 /*break*/, 27];
                    case 27:
                        if (!(!(input === null || input === void 0 ? void 0 : input.type) || input.type === "all" || input.type === "payment")) return [3 /*break*/, 40];
                        _14.label = 28;
                    case 28:
                        _14.trys.push([28, 39, , 40]);
                        orgId = ctx.user.organizationId;
                        paymentsWhere = orgId ? drizzle_orm_1.eq(schema_1.payments.organizationId, orgId) : undefined;
                        return [4 /*yield*/, database.select().from(schema_1.payments).where(paymentsWhere)];
                    case 29:
                        paymentRecords = _14.sent();
                        _g = 0, paymentRecords_1 = paymentRecords;
                        _14.label = 30;
                    case 30:
                        if (!(_g < paymentRecords_1.length)) return [3 /*break*/, 38];
                        payment = paymentRecords_1[_g];
                        paymentStatus = payment.status;
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            if (input.status === "pending" && paymentStatus !== "pending")
                                return [3 /*break*/, 37];
                            if (input.status === "approved" && paymentStatus !== "completed")
                                return [3 /*break*/, 37];
                            if (input.status === "rejected" && paymentStatus !== "failed")
                                return [3 /*break*/, 37];
                        }
                        if (search && !((_1 = payment.referenceNumber) === null || _1 === void 0 ? void 0 : _1.toLowerCase().includes(search)))
                            return [3 /*break*/, 37];
                        if (!payment.createdBy) return [3 /*break*/, 32];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, payment.createdBy)).then(function (r) { return r[0]; })];
                    case 31:
                        _h = _14.sent();
                        return [3 /*break*/, 33];
                    case 32:
                        _h = null;
                        _14.label = 33;
                    case 33:
                        requestedBy = _h;
                        if (!payment.approvedBy) return [3 /*break*/, 35];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, payment.approvedBy)).then(function (r) { return r[0]; })];
                    case 34:
                        _j = _14.sent();
                        return [3 /*break*/, 36];
                    case 35:
                        _j = null;
                        _14.label = 36;
                    case 36:
                        approvedByUser = _j;
                        priority = "low";
                        if (payment.amount >= 500000)
                            priority = "critical";
                        else if (payment.amount >= 250000)
                            priority = "high";
                        else if (payment.amount >= 50000)
                            priority = "medium";
                        if ((input === null || input === void 0 ? void 0 : input.priority) && priority !== input.priority)
                            return [3 /*break*/, 37];
                        displayStatus = paymentStatus === "pending" ? "pending" : paymentStatus === "completed" ? "approved" : "rejected";
                        approvals.push({
                            id: payment.id,
                            type: "payment",
                            referenceId: payment.id,
                            referenceNo: payment.referenceNumber || "PAY-" + payment.id.substring(0, 8),
                            amount: centsToCurrency(payment.amount),
                            requestedBy: (requestedBy === null || requestedBy === void 0 ? void 0 : requestedBy.name) || (requestedBy === null || requestedBy === void 0 ? void 0 : requestedBy.email) || "Unknown",
                            requestedAt: payment.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
                            approvedBy: (approvedByUser === null || approvedByUser === void 0 ? void 0 : approvedByUser.name) || (approvedByUser === null || approvedByUser === void 0 ? void 0 : approvedByUser.email) || null,
                            approvedAt: payment.approvedAt || null,
                            status: displayStatus,
                            priority: priority,
                            description: "Payment: " + (payment.description || "No description"),
                            approvers: ["Super Admin", "Finance Manager", "Accounting Director"]
                        });
                        _14.label = 37;
                    case 37:
                        _g++;
                        return [3 /*break*/, 30];
                    case 38: return [3 /*break*/, 40];
                    case 39:
                        err_4 = _14.sent();
                        console.warn("Error fetching payments for approvals:", err_4);
                        return [3 /*break*/, 40];
                    case 40:
                        if (!(!(input === null || input === void 0 ? void 0 : input.type) || input.type === "all" || input.type === "leave_request")) return [3 /*break*/, 53];
                        _14.label = 41;
                    case 41:
                        _14.trys.push([41, 52, , 53]);
                        orgId = ctx.user.organizationId;
                        leaveWhere = orgId ? drizzle_orm_1.eq(schema_1.leaveRequests.organizationId, orgId) : undefined;
                        return [4 /*yield*/, database.select().from(schema_1.leaveRequests).where(leaveWhere)];
                    case 42:
                        leaveRecords = _14.sent();
                        _k = 0, leaveRecords_1 = leaveRecords;
                        _14.label = 43;
                    case 43:
                        if (!(_k < leaveRecords_1.length)) return [3 /*break*/, 51];
                        leave = leaveRecords_1[_k];
                        leaveStatus = leave.status;
                        if ((input === null || input === void 0 ? void 0 : input.status) && leaveStatus !== input.status)
                            return [3 /*break*/, 50];
                        if ((input === null || input === void 0 ? void 0 : input.priority) && "low" !== input.priority)
                            return [3 /*break*/, 50];
                        if (!leave.employeeId) return [3 /*break*/, 45];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, leave.employeeId)).then(function (r) { return r[0]; })];
                    case 44:
                        _l = _14.sent();
                        return [3 /*break*/, 46];
                    case 45:
                        _l = null;
                        _14.label = 46;
                    case 46:
                        requestedBy = _l;
                        if (!(leave.approvalDate && leave.approvedBy)) return [3 /*break*/, 48];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, leave.approvedBy)).then(function (r) { return r[0]; })];
                    case 47:
                        _m = _14.sent();
                        return [3 /*break*/, 49];
                    case 48:
                        _m = null;
                        _14.label = 49;
                    case 49:
                        approvedByUser = _m;
                        approvals.push({
                            id: leave.id,
                            type: "leave_request",
                            referenceId: leave.id,
                            referenceNo: "LEAVE-" + leave.id.substring(0, 8),
                            requestedBy: (requestedBy === null || requestedBy === void 0 ? void 0 : requestedBy.name) || (requestedBy === null || requestedBy === void 0 ? void 0 : requestedBy.email) || "Unknown",
                            requestedAt: leave.startDate || new Date().toISOString().replace('T', ' ').substring(0, 19),
                            approvedBy: (approvedByUser === null || approvedByUser === void 0 ? void 0 : approvedByUser.name) || (approvedByUser === null || approvedByUser === void 0 ? void 0 : approvedByUser.email) || null,
                            approvedAt: leave.approvalDate || null,
                            status: leaveStatus,
                            priority: "low",
                            description: "Leave request: " + leave.leaveType,
                            approvers: ["Super Admin", "HR Manager"]
                        });
                        _14.label = 50;
                    case 50:
                        _k++;
                        return [3 /*break*/, 43];
                    case 51: return [3 /*break*/, 53];
                    case 52:
                        err_5 = _14.sent();
                        console.warn("Error fetching leave requests for approvals:", err_5);
                        return [3 /*break*/, 53];
                    case 53:
                        if (!(!(input === null || input === void 0 ? void 0 : input.type) || input.type === "all" || input.type === "budget")) return [3 /*break*/, 66];
                        _14.label = 54;
                    case 54:
                        _14.trys.push([54, 65, , 66]);
                        orgId = ctx.user.organizationId;
                        budgetWhere = orgId ? drizzle_orm_1.eq(schema_1.budgets.organizationId, orgId) : undefined;
                        return [4 /*yield*/, database.select().from(schema_1.budgets).where(budgetWhere)];
                    case 55:
                        budgetRecords = _14.sent();
                        _o = 0, budgetRecords_1 = budgetRecords;
                        _14.label = 56;
                    case 56:
                        if (!(_o < budgetRecords_1.length)) return [3 /*break*/, 64];
                        budget = budgetRecords_1[_o];
                        budgetStatus = budget.budgetStatus;
                        if (input === null || input === void 0 ? void 0 : input.status) {
                            if (input.status === "pending" && budgetStatus !== "draft")
                                return [3 /*break*/, 63];
                            if (input.status === "approved" && budgetStatus !== "active")
                                return [3 /*break*/, 63];
                            if (input.status === "rejected" && budgetStatus !== "inactive")
                                return [3 /*break*/, 63];
                        }
                        if (search && !((_2 = budget.budgetName) === null || _2 === void 0 ? void 0 : _2.toLowerCase().includes(search)))
                            return [3 /*break*/, 63];
                        if (!budget.createdBy) return [3 /*break*/, 58];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, budget.createdBy)).then(function (r) { return r[0]; })];
                    case 57:
                        _p = _14.sent();
                        return [3 /*break*/, 59];
                    case 58:
                        _p = null;
                        _14.label = 59;
                    case 59:
                        requestedBy = _p;
                        if (!budget.approvedBy) return [3 /*break*/, 61];
                        return [4 /*yield*/, database.select().from(schema_1.users).where(drizzle_orm_1.eq(schema_1.users.id, budget.approvedBy)).then(function (r) { return r[0]; })];
                    case 60:
                        _q = _14.sent();
                        return [3 /*break*/, 62];
                    case 61:
                        _q = null;
                        _14.label = 62;
                    case 62:
                        approvedByUser = _q;
                        priority = "low";
                        if (budget.amount >= 1000000)
                            priority = "critical";
                        else if (budget.amount >= 500000)
                            priority = "high";
                        else if (budget.amount >= 100000)
                            priority = "medium";
                        if ((input === null || input === void 0 ? void 0 : input.priority) && priority !== input.priority)
                            return [3 /*break*/, 63];
                        displayStatus = budgetStatus === "draft" ? "pending" : budgetStatus === "active" ? "approved" : "rejected";
                        approvals.push({
                            id: budget.id,
                            type: "budget",
                            referenceId: budget.id,
                            referenceNo: "BUD-" + budget.id.substring(0, 8),
                            amount: centsToCurrency(budget.amount),
                            requestedBy: (requestedBy === null || requestedBy === void 0 ? void 0 : requestedBy.name) || (requestedBy === null || requestedBy === void 0 ? void 0 : requestedBy.email) || "Unknown",
                            requestedAt: budget.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
                            approvedBy: (approvedByUser === null || approvedByUser === void 0 ? void 0 : approvedByUser.name) || (approvedByUser === null || approvedByUser === void 0 ? void 0 : approvedByUser.email) || null,
                            approvedAt: budget.approvedAt || null,
                            status: displayStatus,
                            priority: priority,
                            description: "Budget: " + budget.budgetName + " - KES " + budget.amount,
                            approvers: ["Super Admin", "Finance Manager"]
                        });
                        _14.label = 63;
                    case 63:
                        _o++;
                        return [3 /*break*/, 56];
                    case 64: return [3 /*break*/, 66];
                    case 65:
                        err_6 = _14.sent();
                        console.warn("Error fetching budgets for approvals:", err_6);
                        return [3 /*break*/, 66];
                    case 66:
                        if (!(!(input === null || input === void 0 ? void 0 : input.type) || input.type === "all" || input.type === "lpo")) return [3 /*break*/, 73];
                        _14.label = 67;
                    case 67:
                        _14.trys.push([67, 72, , 73]);
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 69];
                        return [4 /*yield*/, ((_3 = database.raw) === null || _3 === void 0 ? void 0 : _3.call(database, "SELECT * FROM lpos WHERE organizationId = ?", [orgId]))];
                    case 68:
                        _r = (_14.sent()) || [];
                        return [3 /*break*/, 71];
                    case 69: return [4 /*yield*/, ((_4 = database.raw) === null || _4 === void 0 ? void 0 : _4.call(database, "SELECT * FROM lpos WHERE 1=1"))];
                    case 70:
                        _r = (_14.sent()) || [];
                        _14.label = 71;
                    case 71:
                        lpoRecords = _r;
                        for (_s = 0, lpoRecords_1 = lpoRecords; _s < lpoRecords_1.length; _s++) {
                            lpo = lpoRecords_1[_s];
                            lpoStatus = lpo.status;
                            if (input === null || input === void 0 ? void 0 : input.status) {
                                if (input.status === "pending" && !["draft", "submitted"].includes(lpoStatus))
                                    continue;
                                if (input.status === "approved" && lpoStatus !== "approved")
                                    continue;
                                if (input.status === "rejected" && lpoStatus !== "rejected")
                                    continue;
                            }
                            if (search && !((_5 = lpo.lpoNumber) === null || _5 === void 0 ? void 0 : _5.toLowerCase().includes(search)) && !((_6 = lpo.vendorName) === null || _6 === void 0 ? void 0 : _6.toLowerCase().includes(search)))
                                continue;
                            priority = "low";
                            if (lpo.totalAmount >= 500000)
                                priority = "critical";
                            else if (lpo.totalAmount >= 250000)
                                priority = "high";
                            else if (lpo.totalAmount >= 50000)
                                priority = "medium";
                            if ((input === null || input === void 0 ? void 0 : input.priority) && priority !== input.priority)
                                continue;
                            displayStatus = ["draft", "submitted"].includes(lpoStatus) ? "pending" : lpoStatus;
                            approvals.push({
                                id: lpo.id,
                                type: "lpo",
                                referenceId: lpo.id,
                                referenceNo: lpo.lpoNumber || "LPO-" + lpo.id.substring(0, 8),
                                amount: centsToCurrency(lpo.totalAmount),
                                requestedBy: lpo.createdBy || "Unknown",
                                requestedAt: lpo.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
                                status: displayStatus,
                                priority: priority,
                                description: "LPO from " + lpo.vendorName + " - KES " + lpo.totalAmount,
                                approvers: ["Super Admin", "Procurement Manager"]
                            });
                        }
                        return [3 /*break*/, 73];
                    case 72:
                        e_1 = _14.sent();
                        return [3 /*break*/, 73];
                    case 73:
                        if (!(!(input === null || input === void 0 ? void 0 : input.type) || input.type === "all" || input.type === "purchase_order")) return [3 /*break*/, 80];
                        _14.label = 74;
                    case 74:
                        _14.trys.push([74, 79, , 80]);
                        orgId = ctx.user.organizationId;
                        if (!orgId) return [3 /*break*/, 76];
                        return [4 /*yield*/, ((_7 = database.raw) === null || _7 === void 0 ? void 0 : _7.call(database, "SELECT * FROM purchase_orders WHERE organizationId = ?", [orgId]))];
                    case 75:
                        _t = (_14.sent()) || [];
                        return [3 /*break*/, 78];
                    case 76: return [4 /*yield*/, ((_8 = database.raw) === null || _8 === void 0 ? void 0 : _8.call(database, "SELECT * FROM purchase_orders WHERE 1=1"))];
                    case 77:
                        _t = (_14.sent()) || [];
                        _14.label = 78;
                    case 78:
                        orderRecords = _t;
                        for (_u = 0, orderRecords_1 = orderRecords; _u < orderRecords_1.length; _u++) {
                            order = orderRecords_1[_u];
                            orderStatus = order.status;
                            if (input === null || input === void 0 ? void 0 : input.status) {
                                if (input.status === "pending" && !["draft", "sent", "confirmed"].includes(orderStatus))
                                    continue;
                                if (input.status === "approved" && orderStatus !== "confirmed")
                                    continue;
                                if (input.status === "rejected" && !["delivered", "invoiced"].includes(orderStatus))
                                    continue;
                            }
                            if (search && !((_9 = order.orderNumber) === null || _9 === void 0 ? void 0 : _9.toLowerCase().includes(search)) && !((_10 = order.supplierName) === null || _10 === void 0 ? void 0 : _10.toLowerCase().includes(search)))
                                continue;
                            priority = "low";
                            if (order.totalAmount >= 500000)
                                priority = "critical";
                            else if (order.totalAmount >= 250000)
                                priority = "high";
                            else if (order.totalAmount >= 50000)
                                priority = "medium";
                            if ((input === null || input === void 0 ? void 0 : input.priority) && priority !== input.priority)
                                continue;
                            displayStatus = ["draft", "sent", "confirmed"].includes(orderStatus) ? "pending" : orderStatus === "delivered" ? "approved" : "rejected";
                            approvals.push({
                                id: order.id,
                                type: "purchase_order",
                                referenceId: order.id,
                                referenceNo: order.orderNumber || "PO-" + order.id.substring(0, 8),
                                amount: centsToCurrency(order.totalAmount),
                                requestedBy: order.createdBy || "Unknown",
                                requestedAt: order.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
                                status: displayStatus,
                                priority: priority,
                                description: "Purchase Order from " + order.supplierName + " - KES " + order.totalAmount,
                                approvers: ["Super Admin", "Procurement Manager"]
                            });
                        }
                        return [3 /*break*/, 80];
                    case 79:
                        e_2 = _14.sent();
                        return [3 /*break*/, 80];
                    case 80:
                        if (!(!(input === null || input === void 0 ? void 0 : input.type) || input.type === "all" || input.type === "imprest")) return [3 /*break*/, 84];
                        _14.label = 81;
                    case 81:
                        _14.trys.push([81, 83, , 84]);
                        return [4 /*yield*/, ((_11 = database.raw) === null || _11 === void 0 ? void 0 : _11.call(database, "SELECT * FROM imprests WHERE 1=1"))];
                    case 82:
                        imprestRecords = (_14.sent()) || [];
                        for (_v = 0, imprestRecords_1 = imprestRecords; _v < imprestRecords_1.length; _v++) {
                            imprest = imprestRecords_1[_v];
                            imprestStatus = imprest.status;
                            if (input === null || input === void 0 ? void 0 : input.status) {
                                if (input.status === "pending" && imprestStatus !== "requested")
                                    continue;
                                if (input.status === "approved" && imprestStatus !== "approved")
                                    continue;
                                if (input.status === "rejected" && imprestStatus !== "rejected")
                                    continue;
                            }
                            if (search && !((_12 = imprest.imprestNumber) === null || _12 === void 0 ? void 0 : _12.toLowerCase().includes(search)) && !((_13 = imprest.employeeName) === null || _13 === void 0 ? void 0 : _13.toLowerCase().includes(search)))
                                continue;
                            priority = "low";
                            if (imprest.amount >= 100000)
                                priority = "critical";
                            else if (imprest.amount >= 50000)
                                priority = "high";
                            else if (imprest.amount >= 10000)
                                priority = "medium";
                            if ((input === null || input === void 0 ? void 0 : input.priority) && priority !== input.priority)
                                continue;
                            approvals.push({
                                id: imprest.id,
                                type: "imprest",
                                referenceId: imprest.id,
                                referenceNo: imprest.imprestNumber || "IMP-" + imprest.id.substring(0, 8),
                                amount: centsToCurrency(imprest.amount),
                                requestedBy: imprest.employeeName || "Unknown",
                                requestedAt: imprest.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
                                status: imprestStatus,
                                priority: priority,
                                description: "Imprest for " + imprest.purpose + " - KES " + imprest.amount,
                                approvers: ["Super Admin", "Finance Manager"]
                            });
                        }
                        return [3 /*break*/, 84];
                    case 83:
                        e_3 = _14.sent();
                        return [3 /*break*/, 84];
                    case 84: 
                    // Sort by requested date (newest first)
                    return [2 /*return*/, approvals.sort(function (a, b) { return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(); })];
                }
            });
        });
    }),
    // Delete/Restore an approval item to draft (only pending approvals)
    deleteApproval: enhancedRbac_1.createFeatureRestrictedProcedure("approvals:delete")
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, invoice, expense, payment, leave, error_14;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 21, , 22]);
                        _b = input.type;
                        switch (_b) {
                            case "invoice": return [3 /*break*/, 3];
                            case "expense": return [3 /*break*/, 7];
                            case "payment": return [3 /*break*/, 11];
                            case "leave_request": return [3 /*break*/, 15];
                        }
                        return [3 /*break*/, 19];
                    case 3: return [4 /*yield*/, database.select().from(schema_1.invoices).where(drizzle_orm_1.eq(schema_1.invoices.id, input.id)).limit(1)];
                    case 4:
                        invoice = _c.sent();
                        if (!invoice.length)
                            throw new Error("Invoice not found");
                        return [4 /*yield*/, database.update(schema_1.invoices).set({
                                status: "draft",
                                approvedBy: null,
                                approvedAt: null
                            }).where(drizzle_orm_1.eq(schema_1.invoices.id, input.id))];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "invoice_reverted_to_draft",
                                entityType: "invoice",
                                entityId: input.id,
                                description: "Reverted invoice to draft: " + invoice[0].invoiceNumber
                            })];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 20];
                    case 7: return [4 /*yield*/, database.select().from(schema_1.expenses).where(drizzle_orm_1.eq(schema_1.expenses.id, input.id)).limit(1)];
                    case 8:
                        expense = _c.sent();
                        if (!expense.length)
                            throw new Error("Expense not found");
                        return [4 /*yield*/, database.update(schema_1.expenses).set({
                                status: "pending",
                                approvedBy: null,
                                approvedAt: null
                            }).where(drizzle_orm_1.eq(schema_1.expenses.id, input.id))];
                    case 9:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "expense_reverted_to_pending",
                                entityType: "expense",
                                entityId: input.id,
                                description: "Reverted expense to pending: " + expense[0].expenseNumber
                            })];
                    case 10:
                        _c.sent();
                        return [3 /*break*/, 20];
                    case 11: return [4 /*yield*/, database.select().from(schema_1.payments).where(drizzle_orm_1.eq(schema_1.payments.id, input.id)).limit(1)];
                    case 12:
                        payment = _c.sent();
                        if (!payment.length)
                            throw new Error("Payment not found");
                        return [4 /*yield*/, database.update(schema_1.payments).set({
                                status: "pending",
                                approvedBy: null,
                                approvedAt: null
                            }).where(drizzle_orm_1.eq(schema_1.payments.id, input.id))];
                    case 13:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_reverted_to_pending",
                                entityType: "payment",
                                entityId: input.id,
                                description: "Reverted payment to pending: " + payment[0].referenceNumber
                            })];
                    case 14:
                        _c.sent();
                        return [3 /*break*/, 20];
                    case 15: return [4 /*yield*/, database.select().from(schema_1.leaveRequests).where(drizzle_orm_1.eq(schema_1.leaveRequests.id, input.id)).limit(1)];
                    case 16:
                        leave = _c.sent();
                        if (!leave.length)
                            throw new Error("Leave request not found");
                        return [4 /*yield*/, database.update(schema_1.leaveRequests).set({
                                status: "pending",
                                approvedBy: null,
                                approvalDate: null
                            }).where(drizzle_orm_1.eq(schema_1.leaveRequests.id, input.id))];
                    case 17:
                        _c.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "leave_request_reverted",
                                entityType: "leave_request",
                                entityId: input.id,
                                description: "Reverted leave request to pending"
                            })];
                    case 18:
                        _c.sent();
                        return [3 /*break*/, 20];
                    case 19: throw new Error("Unsupported approval type");
                    case 20: return [2 /*return*/, { success: true, message: "Approval item reverted to draft successfully" }];
                    case 21:
                        error_14 = _c.sent();
                        throw new server_1.TRPCError({
                            code: "BAD_REQUEST",
                            message: error_14.message || "Failed to revert approval item"
                        });
                    case 22: return [2 /*return*/];
                }
            });
        });
    })
});
