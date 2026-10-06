"use strict";
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
exports.emailNotificationRouter = exports.triggerEventNotification = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var mail_1 = require("../_core/mail");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var company_info_1 = require("../utils/company-info");
var notificationCreateProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("notifications:create");
// Map event types to notification preference keys (from Settings → Notifications)
var EVENT_TO_PREF_KEY = {
    invoice_created: "invoiceDue",
    invoice_sent: "invoiceDue",
    invoice_overdue: "invoiceDue",
    invoice_approved: "invoiceDue",
    payment_received: "paymentReceived",
    receipt_created: "paymentReceived",
    client_created: "newClient",
    proposal_sent: "invoiceDue",
    estimate_converted: "invoiceDue",
    project_created: "invoiceDue"
};
/** Check if notification pref is enabled in settings (defaults to enabled) */
function isNotificationEnabled(eventType) {
    return __awaiter(this, void 0, Promise, function () {
        var prefKey, db, rows, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    prefKey = EVENT_TO_PREF_KEY[eventType];
                    if (!prefKey)
                        return [2 /*return*/, true]; // unknown events default to enabled
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, db_1.getDb()];
                case 2:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, true];
                    return [4 /*yield*/, db.select().from(schema_1.settings)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.settings.category, "notifications"), drizzle_orm_1.eq(schema_1.settings.key, prefKey)))
                            .limit(1)];
                case 3:
                    rows = _b.sent();
                    if (!rows.length)
                        return [2 /*return*/, true]; // not configured = enabled
                    return [2 /*return*/, rows[0].value !== "false" && rows[0].value !== "0"];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, true];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Send email and create database notification for event.
 * Respects notification preferences from Settings → Notifications.
 */
function triggerEventNotification(input) {
    return __awaiter(this, void 0, void 0, function () {
        var db, enabled, notificationId, mailResult, err_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error("Database not available for notification trigger");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, isNotificationEnabled(input.eventType)];
                case 2:
                    enabled = _a.sent();
                    if (!enabled) {
                        console.log("[NOTIFY] Skipping " + input.eventType + " \u2014 disabled in settings");
                        return [2 /*return*/];
                    }
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 9, , 10]);
                    notificationId = uuid_1.v4();
                    return [4 /*yield*/, db_1.createNotification({
                            userId: input.userId,
                            title: input.subject,
                            message: input.htmlContent.substring(0, 200),
                            type: getNotificationType(input.eventType),
                            category: input.eventType,
                            entityType: input.entityType,
                            entityId: input.entityId,
                            actionUrl: input.actionUrl,
                            priority: getPriority(input.eventType)
                        })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: input.recipientEmail,
                            subject: input.subject,
                            html: input.htmlContent
                        })];
                case 6:
                    mailResult = _a.sent();
                    if (!mailResult.success) {
                        console.warn('[EMAIL] Sending failed for', input.recipientEmail, mailResult.error);
                    }
                    return [3 /*break*/, 8];
                case 7:
                    err_1 = _a.sent();
                    console.error('[EMAIL] Error sending email:', err_1);
                    return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_1 = _a.sent();
                    console.error("Error triggering notification:", error_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.triggerEventNotification = triggerEventNotification;
function getNotificationType(eventType) {
    var typeMap = {
        invoice_created: "info",
        invoice_sent: "info",
        payment_received: "success",
        invoice_overdue: "warning",
        proposal_sent: "info",
        estimate_converted: "success"
    };
    return typeMap[eventType] || "info";
}
function getPriority(eventType) {
    var priorityMap = {
        invoice_created: "normal",
        invoice_sent: "normal",
        payment_received: "high",
        invoice_overdue: "high",
        proposal_sent: "normal",
        estimate_converted: "high"
    };
    return priorityMap[eventType] || "normal";
}
exports.emailNotificationRouter = trpc_1.router({
    /**
     * Send invoice created notification to accountant
     */
    onInvoiceCreated: notificationCreateProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        invoiceNumber: zod_1.z.string(),
        clientName: zod_1.z.string(),
        amount: zod_1.z.number(),
        accountantEmail: zod_1.z.string().email(),
        dueDate: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var htmlContent;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        htmlContent = "\n        <h2>New Invoice Created</h2>\n        <p>Invoice <strong>" + input.invoiceNumber + "</strong> has been created for <strong>" + input.clientName + "</strong>.</p>\n        <ul>\n          <li><strong>Amount:</strong> Ksh " + (input.amount / 100).toLocaleString("en-KE") + "</li>\n          <li><strong>Due Date:</strong> " + input.dueDate + "</li>\n        </ul>\n        <p><a href=\"/invoices/" + input.invoiceId + "\">View Invoice</a></p>\n      ";
                        return [4 /*yield*/, triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "invoice_created",
                                recipientEmail: input.accountantEmail,
                                recipientName: "Accountant",
                                subject: "Invoice " + input.invoiceNumber + " Created - " + input.clientName,
                                htmlContent: htmlContent,
                                entityType: "invoice",
                                entityId: input.invoiceId,
                                actionUrl: "/invoices/" + input.invoiceId
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Send invoice sent notification
     */
    onInvoiceSent: notificationCreateProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        invoiceNumber: zod_1.z.string(),
        clientEmail: zod_1.z.string().email(),
        clientName: zod_1.z.string(),
        amount: zod_1.z.number(),
        dueDate: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var htmlContent, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        htmlContent = "\n        <h2>Invoice Sent</h2>\n        <p>Hello " + input.clientName + ",</p>\n        <p>We have sent you invoice <strong>" + input.invoiceNumber + "</strong>.</p>\n        <ul>\n          <li><strong>Amount:</strong> Ksh " + (input.amount / 100).toLocaleString("en-KE") + "</li>\n          <li><strong>Due Date:</strong> " + input.dueDate + "</li>\n        </ul>\n        <p>Please remit payment by the due date to avoid late fees.</p>\n        <p>Thank you for your business!</p>\n      ";
                        _b = triggerEventNotification;
                        _c = {
                            userId: ctx.user.id,
                            eventType: "invoice_sent",
                            recipientEmail: input.clientEmail,
                            recipientName: input.clientName
                        };
                        _d = "Invoice " + input.invoiceNumber + " from ";
                        return [4 /*yield*/, company_info_1.getCompanyInfo()];
                    case 1: return [4 /*yield*/, _b.apply(void 0, [(_c.subject = _d + (_e.sent()).name,
                                _c.htmlContent = htmlContent,
                                _c.entityType = "invoice",
                                _c.entityId = input.invoiceId,
                                _c.actionUrl = "/invoices/" + input.invoiceId,
                                _c)])];
                    case 2:
                        _e.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Send payment received notification
     */
    onPaymentReceived: notificationCreateProcedure
        .input(zod_1.z.object({
        paymentId: zod_1.z.string(),
        invoiceId: zod_1.z.string(),
        invoiceNumber: zod_1.z.string(),
        clientEmail: zod_1.z.string().email(),
        clientName: zod_1.z.string(),
        amount: zod_1.z.number(),
        referenceNumber: zod_1.z.string().optional(),
        accountantEmail: zod_1.z.string().email()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var clientHtml, accountantHtml;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        clientHtml = "\n        <h2>Payment Received</h2>\n        <p>Hello " + input.clientName + ",</p>\n        <p>Thank you! We have received your payment of <strong>Ksh " + (input.amount / 100).toLocaleString("en-KE") + "</strong> for invoice <strong>" + input.invoiceNumber + "</strong>.</p>\n        " + (input.referenceNumber ? "<p><strong>Reference Number:</strong> " + input.referenceNumber + "</p>" : "") + "\n        <p>Your receipt has been generated and is available for download.</p>\n      ";
                        accountantHtml = "\n        <h2>Payment Recorded</h2>\n        <p>Payment of <strong>Ksh " + (input.amount / 100).toLocaleString("en-KE") + "</strong> has been recorded for invoice <strong>" + input.invoiceNumber + "</strong> from " + input.clientName + ".</p>\n        " + (input.referenceNumber ? "<p><strong>Reference Number:</strong> " + input.referenceNumber + "</p>" : "") + "\n      ";
                        // Notify client
                        return [4 /*yield*/, triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "payment_received",
                                recipientEmail: input.clientEmail,
                                recipientName: input.clientName,
                                subject: "Payment Received - Invoice " + input.invoiceNumber,
                                htmlContent: clientHtml,
                                entityType: "payment",
                                entityId: input.paymentId,
                                actionUrl: "/invoices/" + input.invoiceId
                            })];
                    case 1:
                        // Notify client
                        _b.sent();
                        // Notify accountant
                        return [4 /*yield*/, triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "payment_received",
                                recipientEmail: input.accountantEmail,
                                recipientName: "Accountant",
                                subject: "Payment Recorded - Invoice " + input.invoiceNumber,
                                htmlContent: accountantHtml,
                                entityType: "payment",
                                entityId: input.paymentId,
                                actionUrl: "/payments/" + input.paymentId
                            })];
                    case 2:
                        // Notify accountant
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Send invoice overdue notification
     */
    onInvoiceOverdue: notificationCreateProcedure
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        invoiceNumber: zod_1.z.string(),
        clientEmail: zod_1.z.string().email(),
        clientName: zod_1.z.string(),
        amount: zod_1.z.number(),
        daysOverdue: zod_1.z.number(),
        accountantEmail: zod_1.z.string().email()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var clientHtml, accountantHtml;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        clientHtml = "\n        <h2>Payment Reminder</h2>\n        <p>Hello " + input.clientName + ",</p>\n        <p>Invoice <strong>" + input.invoiceNumber + "</strong> is now <strong>" + input.daysOverdue + " days overdue</strong>.</p>\n        <p><strong>Amount Due:</strong> Ksh " + (input.amount / 100).toLocaleString("en-KE") + "</p>\n        <p>Please process payment immediately to avoid further action.</p>\n        <p>Contact us if you have any questions.</p>\n      ";
                        accountantHtml = "\n        <h2>Overdue Invoice Alert</h2>\n        <p>Invoice <strong>" + input.invoiceNumber + "</strong> from " + input.clientName + " is <strong>" + input.daysOverdue + " days overdue</strong>.</p>\n        <p><strong>Amount Due:</strong> Ksh " + (input.amount / 100).toLocaleString("en-KE") + "</p>\n        <p>Consider following up with the client.</p>\n      ";
                        // Notify client
                        return [4 /*yield*/, triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "invoice_overdue",
                                recipientEmail: input.clientEmail,
                                recipientName: input.clientName,
                                subject: "Payment Reminder - Invoice " + input.invoiceNumber + " is Overdue",
                                htmlContent: clientHtml,
                                entityType: "invoice",
                                entityId: input.invoiceId,
                                actionUrl: "/invoices/" + input.invoiceId
                            })];
                    case 1:
                        // Notify client
                        _b.sent();
                        // Notify accountant
                        return [4 /*yield*/, triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "invoice_overdue",
                                recipientEmail: input.accountantEmail,
                                recipientName: "Accountant",
                                subject: "Overdue Invoice Alert - " + input.invoiceNumber,
                                htmlContent: accountantHtml,
                                entityType: "invoice",
                                entityId: input.invoiceId,
                                actionUrl: "/invoices/" + input.invoiceId
                            })];
                    case 2:
                        // Notify accountant
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Send proposal/estimate sent notification
     */
    onProposalSent: notificationCreateProcedure
        .input(zod_1.z.object({
        proposalId: zod_1.z.string(),
        proposalNumber: zod_1.z.string(),
        clientEmail: zod_1.z.string().email(),
        clientName: zod_1.z.string(),
        amount: zod_1.z.number(),
        expiryDate: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var htmlContent, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        htmlContent = "\n        <h2>Proposal Sent</h2>\n        <p>Hello " + input.clientName + ",</p>\n        <p>We have sent you proposal <strong>" + input.proposalNumber + "</strong> for your consideration.</p>\n        <ul>\n          <li><strong>Amount:</strong> Ksh " + (input.amount / 100).toLocaleString("en-KE") + "</li>\n          <li><strong>Valid Until:</strong> " + input.expiryDate + "</li>\n        </ul>\n        <p>Please review and let us know if you have any questions.</p>\n      ";
                        _b = triggerEventNotification;
                        _c = {
                            userId: ctx.user.id,
                            eventType: "proposal_sent",
                            recipientEmail: input.clientEmail,
                            recipientName: input.clientName
                        };
                        _d = "Proposal " + input.proposalNumber + " from ";
                        return [4 /*yield*/, company_info_1.getCompanyInfo()];
                    case 1: return [4 /*yield*/, _b.apply(void 0, [(_c.subject = _d + (_e.sent()).name,
                                _c.htmlContent = htmlContent,
                                _c.entityType = "proposal",
                                _c.entityId = input.proposalId,
                                _c.actionUrl = "/proposals/" + input.proposalId,
                                _c)])];
                    case 2:
                        _e.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Send team assignment notification to employee
     */
    onTeamAssigned: notificationCreateProcedure
        .input(zod_1.z.object({
        employeeEmail: zod_1.z.string().email(),
        employeeName: zod_1.z.string(),
        projectName: zod_1.z.string(),
        projectId: zod_1.z.string(),
        role: zod_1.z.string(),
        hoursAllocated: zod_1.z.number(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var htmlContent;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        htmlContent = "\n        <h2>Team Assignment Notification</h2>\n        <p>Dear " + input.employeeName + ",</p>\n        <p>You have been assigned to a new project. Here are the details:</p>\n        <ul>\n          <li><strong>Project:</strong> " + input.projectName + "</li>\n          <li><strong>Role:</strong> " + input.role + "</li>\n          <li><strong>Hours Allocated:</strong> " + input.hoursAllocated + " hours per week</li>\n          " + (input.startDate ? "<li><strong>Start Date:</strong> " + new Date(input.startDate).toLocaleDateString("en-KE") + "</li>" : "") + "\n          " + (input.endDate ? "<li><strong>End Date:</strong> " + new Date(input.endDate).toLocaleDateString("en-KE") + "</li>" : "") + "\n        </ul>\n        <p>If you have any questions about this assignment, please reach out to your manager.</p>\n      ";
                        return [4 /*yield*/, triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "invoice_sent",
                                recipientEmail: input.employeeEmail,
                                recipientName: input.employeeName,
                                subject: "Team Assignment: " + input.projectName,
                                htmlContent: htmlContent,
                                entityType: "project",
                                entityId: input.projectId,
                                actionUrl: "/projects/" + input.projectId
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Send bulk operation completion notification
     */
    onBulkOperationComplete: notificationCreateProcedure
        .input(zod_1.z.object({
        userEmail: zod_1.z.string().email(),
        userName: zod_1.z.string(),
        operationType: zod_1.z.string(),
        itemsProcessed: zod_1.z.number(),
        successCount: zod_1.z.number(),
        failureCount: zod_1.z.number()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var htmlContent;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        htmlContent = "\n        <h2>Bulk Operation Complete</h2>\n        <p>Dear " + input.userName + ",</p>\n        <p>Your batch operation has been completed. Here is the summary:</p>\n        <ul>\n          <li><strong>Operation:</strong> " + input.operationType + "</li>\n          <li><strong>Total Items:</strong> " + input.itemsProcessed + "</li>\n          <li><strong>Successful:</strong> " + input.successCount + "</li>\n          <li><strong>Failed:</strong> " + input.failureCount + "</li>\n          <li><strong>Success Rate:</strong> " + ((input.successCount / input.itemsProcessed) * 100).toFixed(1) + "%</li>\n        </ul>\n        " + (input.failureCount > 0
                            ? "<p style='color: orange;'>Some items failed processing. Please review the operation details.</p>"
                            : "<p style='color: green;'>All items were processed successfully!</p>") + "\n      ";
                        return [4 /*yield*/, triggerEventNotification({
                                userId: ctx.user.id,
                                eventType: "invoice_sent",
                                recipientEmail: input.userEmail,
                                recipientName: input.userName,
                                subject: "Bulk Operation Complete: " + input.operationType,
                                htmlContent: htmlContent,
                                entityType: "operation",
                                entityId: "bulk_" + Date.now()
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    })
});
