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
exports.emailRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var db = require("../db");
var mail_1 = require("../_core/mail");
var company_info_1 = require("../utils/company-info");
/**
 * Resolve an email template by looking up user-customized version from settings.
 * Falls back to the provided default if no custom template is saved.
 * Replaces {variable} placeholders with actual values.
 */
function resolveTemplate(templateId, variables, fallback) {
    var _a, _b;
    return __awaiter(this, void 0, Promise, function () {
        var database, rows, saved_1, subject, html, sigRows, footerRows, sigBody, footerBody, wrappedHtml, text, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _d.sent();
                    if (!database)
                        return [2 /*return*/, fallback];
                    return [4 /*yield*/, database.select().from(schema_1.settings)
                            .where(drizzle_orm_1.eq(schema_1.settings.category, "email_template:" + templateId))];
                case 2:
                    rows = _d.sent();
                    if (!rows.length)
                        return [2 /*return*/, fallback];
                    saved_1 = {};
                    rows.forEach(function (r) { var _a; if (r.key)
                        saved_1[r.key] = (_a = r.value) !== null && _a !== void 0 ? _a : ""; });
                    if (!saved_1.subject && !saved_1.body)
                        return [2 /*return*/, fallback];
                    subject = saved_1.subject || fallback.subject;
                    html = saved_1.body || fallback.html;
                    return [4 /*yield*/, database.select().from(schema_1.settings)
                            .where(drizzle_orm_1.eq(schema_1.settings.category, "email_template:email-signature-all"))];
                case 3:
                    sigRows = _d.sent();
                    return [4 /*yield*/, database.select().from(schema_1.settings)
                            .where(drizzle_orm_1.eq(schema_1.settings.category, "email_template:email-footer-all"))];
                case 4:
                    footerRows = _d.sent();
                    sigBody = ((_a = sigRows.find(function (r) { return r.key === "body"; })) === null || _a === void 0 ? void 0 : _a.value) || "";
                    footerBody = ((_b = footerRows.find(function (r) { return r.key === "body"; })) === null || _b === void 0 ? void 0 : _b.value) || "";
                    // Add general variables
                    variables.email_signature = replaceVars(sigBody, variables);
                    variables.email_footer = replaceVars(footerBody, variables);
                    variables.todays_date = variables.todays_date || new Date().toLocaleDateString();
                    subject = replaceVars(subject, variables);
                    html = replaceVars(html, variables);
                    wrappedHtml = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;\">" + html + (variables.email_signature ? "<div>" + variables.email_signature + "</div>" : "") + (variables.email_footer ? "<hr style=\"border: none; border-top: 1px solid #ddd; margin: 30px 0;\"><div>" + variables.email_footer + "</div>" : "") + "</div>";
                    text = wrappedHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
                    return [2 /*return*/, { subject: subject, html: wrappedHtml, text: text }];
                case 5:
                    _c = _d.sent();
                    return [2 /*return*/, fallback];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function replaceVars(template, vars) {
    return template.replace(/\{(\w+)\}/g, function (match, key) { var _a; return (_a = vars[key]) !== null && _a !== void 0 ? _a : match; });
}
function formatKES(amount) {
    return "KES " + (amount / 100).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
// Read company name from settings, fall back to env var, then default
function getCompanyName() {
    return __awaiter(this, void 0, Promise, function () {
        var info, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, company_info_1.getCompanyInfo()];
                case 1:
                    info = _b.sent();
                    return [2 /*return*/, info.name];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, process.env.COMPANY_NAME || "Your Company"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Email templates with HTML and text versions (defaults — overridden by settings)
var emailTemplates = {
    invoice: function (clientName, invoiceNumber, amount, dueDate, companyName) {
        if (companyName === void 0) { companyName = "Your Company"; }
        var html = "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;\">\n        <h2 style=\"color: #1a5490; margin-bottom: 20px;\">Invoice " + invoiceNumber + "</h2>\n        <p>Dear " + clientName + ",</p>\n        <p>Please find below the details of your invoice:</p>\n        <div style=\"background-color: #f5f5f5; border-left: 4px solid #1a5490; padding: 15px; margin: 20px 0;\">\n          <p style=\"margin: 5px 0;\"><strong>Invoice Number:</strong> " + invoiceNumber + "</p>\n          <p style=\"margin: 5px 0;\"><strong>Amount:</strong> " + formatKES(amount) + "</p>\n          <p style=\"margin: 5px 0;\"><strong>Due Date:</strong> " + dueDate + "</p>\n        </div>\n        <p>Thank you for your business!</p>\n        <p>Best regards,<br><strong>" + companyName + "</strong></p>\n        <hr style=\"border: none; border-top: 1px solid #ddd; margin: 30px 0;\">\n        <p style=\"color: #999; font-size: 12px;\">This is an automated email. Please do not reply directly.</p>\n      </div>\n    ";
        var text = "Invoice " + invoiceNumber + "\n\nDear " + clientName + ",\n\nPlease find below the details of your invoice:\n\nInvoice Number: " + invoiceNumber + "\nAmount: " + formatKES(amount) + "\nDue Date: " + dueDate + "\n\nThank you for your business!\n\nBest regards,\n" + companyName;
        return {
            subject: "Invoice " + invoiceNumber + " from " + companyName,
            html: html,
            text: text
        };
    },
    estimate: function (clientName, estimateNumber, amount, validUntil, companyName) {
        if (companyName === void 0) { companyName = "Your Company"; }
        var html = "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;\">\n        <h2 style=\"color: #1a5490; margin-bottom: 20px;\">Estimate " + estimateNumber + "</h2>\n        <p>Dear " + clientName + ",</p>\n        <p>Please find below the details of your estimate:</p>\n        <div style=\"background-color: #f5f5f5; border-left: 4px solid #1a5490; padding: 15px; margin: 20px 0;\">\n          <p style=\"margin: 5px 0;\"><strong>Estimate Number:</strong> " + estimateNumber + "</p>\n          <p style=\"margin: 5px 0;\"><strong>Amount:</strong> " + formatKES(amount) + "</p>\n          <p style=\"margin: 5px 0;\"><strong>Valid Until:</strong> " + validUntil + "</p>\n        </div>\n        <p>Please let us know if you have any questions or need any clarifications.</p>\n        <p>Best regards,<br><strong>" + companyName + "</strong></p>\n        <hr style=\"border: none; border-top: 1px solid #ddd; margin: 30px 0;\">\n        <p style=\"color: #999; font-size: 12px;\">This is an automated email. Please do not reply directly.</p>\n      </div>\n    ";
        var text = "Estimate " + estimateNumber + "\n\nDear " + clientName + ",\n\nPlease find below the details of your estimate:\n\nEstimate Number: " + estimateNumber + "\nAmount: " + formatKES(amount) + "\nValid Until: " + validUntil + "\n\nPlease let us know if you have any questions.\n\nBest regards,\n" + companyName;
        return {
            subject: "Estimate " + estimateNumber + " from " + companyName,
            html: html,
            text: text
        };
    },
    paymentReminder: function (clientName, invoiceNumber, amount, daysOverdue, dueDate, companyName) {
        if (companyName === void 0) { companyName = "Your Company"; }
        var html = "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;\">\n        <h2 style=\"color: #d32f2f; margin-bottom: 20px;\">Payment Reminder - Invoice Overdue</h2>\n        <p>Dear " + clientName + ",</p>\n        <p style=\"color: #d32f2f; font-weight: bold;\">This invoice is <strong>" + daysOverdue + " days overdue</strong>.</p>\n        <div style=\"background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;\">\n          <p style=\"margin: 5px 0;\"><strong>Invoice Number:</strong> " + invoiceNumber + "</p>\n          <p style=\"margin: 5px 0;\"><strong>Amount Due:</strong> " + formatKES(amount) + "</p>\n          <p style=\"margin: 5px 0;\"><strong>Original Due Date:</strong> " + dueDate + "</p>\n          <p style=\"margin: 5px 0;\"><strong>Days Overdue:</strong> " + daysOverdue + "</p>\n        </div>\n        <p>Please arrange payment at your earliest convenience. If you have already sent the payment, please disregard this notice.</p>\n        <p>Thank you,<br><strong>" + companyName + "</strong></p>\n        <hr style=\"border: none; border-top: 1px solid #ddd; margin: 30px 0;\">\n        <p style=\"color: #999; font-size: 12px;\">This is an automated reminder. Please do not reply directly.</p>\n      </div>\n    ";
        var text = "Payment Reminder - Invoice Overdue\n\nDear " + clientName + ",\n\nThis invoice is " + daysOverdue + " days overdue.\n\nInvoice Number: " + invoiceNumber + "\nAmount Due: " + formatKES(amount) + "\nOriginal Due Date: " + dueDate + "\nDays Overdue: " + daysOverdue + "\n\nPlease arrange payment at your earliest convenience.\n\nThank you,\n" + companyName;
        return {
            subject: "Payment Reminder: Invoice " + invoiceNumber + " is " + daysOverdue + " days overdue",
            html: html,
            text: text
        };
    },
    paymentReceived: function (clientName, invoiceNumber, amount, companyName) {
        if (companyName === void 0) { companyName = "Your Company"; }
        var html = "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;\">\n        <h2 style=\"color: #4CAF50; margin-bottom: 20px;\">Payment Received - Thank You!</h2>\n        <p>Dear " + clientName + ",</p>\n        <p>Thank you for your payment of <strong>" + formatKES(amount) + "</strong> for invoice <strong>" + invoiceNumber + "</strong>.</p>\n        <div style=\"background-color: #f1f8e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;\">\n          <p style=\"margin: 5px 0;\"><strong>Invoice Number:</strong> " + invoiceNumber + "</p>\n          <p style=\"margin: 5px 0;\"><strong>Amount Received:</strong> " + formatKES(amount) + "</p>\n          <p style=\"margin: 5px 0;\"><strong>Date:</strong> " + new Date().toLocaleDateString() + "</p>\n        </div>\n        <p>Your account is now up to date. We appreciate your prompt payment.</p>\n        <p>Best regards,<br><strong>" + companyName + "</strong></p>\n        <hr style=\"border: none; border-top: 1px solid #ddd; margin: 30px 0;\">\n        <p style=\"color: #999; font-size: 12px;\">This is an automated email. Please do not reply directly.</p>\n      </div>\n    ";
        var text = "Payment Received - Thank You!\n\nDear " + clientName + ",\n\nThank you for your payment of " + formatKES(amount) + " for invoice " + invoiceNumber + ".\n\nInvoice Number: " + invoiceNumber + "\nAmount Received: " + formatKES(amount) + "\nDate: " + new Date().toLocaleDateString() + "\n\nYour account is now up to date.\n\nBest regards,\n" + companyName;
        return {
            subject: "Payment Received for Invoice " + invoiceNumber,
            html: html,
            text: text
        };
    }
};
exports.emailRouter = trpc_1.router({
    // Send invoice to client
    sendInvoice: trpc_1.createFeatureRestrictedProcedure("communications:email")
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        recipientEmail: zod_1.z.string().email(),
        message: zod_1.z.string().max(1000).optional(),
        attachPDF: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, invoiceResult, invoice, clientResult, client, companyName, contactName, defaultTemplate, template, emailResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))
                                .limit(1)];
                    case 2:
                        invoiceResult = _b.sent();
                        if (!invoiceResult.length) {
                            throw new Error("Invoice not found");
                        }
                        invoice = invoiceResult[0];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.eq(schema_1.clients.id, invoice.clientId))
                                .limit(1)];
                    case 3:
                        clientResult = _b.sent();
                        if (!clientResult.length) {
                            throw new Error("Client not found");
                        }
                        client = clientResult[0];
                        return [4 /*yield*/, getCompanyName()];
                    case 4:
                        companyName = _b.sent();
                        contactName = client.contactPerson || client.companyName;
                        defaultTemplate = emailTemplates.invoice(contactName, invoice.invoiceNumber, invoice.total || 0, new Date(invoice.dueDate).toLocaleDateString(), companyName);
                        return [4 /*yield*/, resolveTemplate("invoice-new-client", {
                                first_name: contactName.split(" ")[0],
                                last_name: contactName.split(" ").slice(1).join(" "),
                                invoice_id: invoice.invoiceNumber,
                                invoice_amount: formatKES(invoice.total || 0),
                                invoice_amount_due: formatKES(invoice.total || 0),
                                invoice_date_created: new Date(invoice.createdAt || new Date()).toLocaleDateString(),
                                invoice_date_due: new Date(invoice.dueDate).toLocaleDateString(),
                                client_name: client.companyName,
                                client_id: client.id,
                                invoice_status: invoice.status || "pending",
                                invoice_url: (process.env.APP_URL || "") + "/invoices/" + invoice.id,
                                our_company_name: companyName,
                                dashboard_url: process.env.APP_URL || ""
                            }, defaultTemplate)];
                    case 5:
                        template = _b.sent();
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: input.recipientEmail,
                                subject: template.subject,
                                html: template.html,
                                text: template.text
                            })];
                    case 6:
                        emailResult = _b.sent();
                        if (!emailResult.success) {
                            throw new Error("Failed to send email: " + emailResult.error);
                        }
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "invoice_sent",
                                entityType: "invoice",
                                entityId: input.invoiceId,
                                description: "Sent invoice " + invoice.invoiceNumber + " to " + input.recipientEmail
                            })];
                    case 7:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Invoice sent to " + input.recipientEmail,
                                messageId: emailResult.messageId
                            }];
                }
            });
        });
    }),
    // Send estimate to client
    sendEstimate: trpc_1.createFeatureRestrictedProcedure("communications:email")
        .input(zod_1.z.object({
        estimateId: zod_1.z.string(),
        recipientEmail: zod_1.z.string().email(),
        message: zod_1.z.string().max(1000).optional(),
        attachPDF: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, estimateResult, estimate, clientResult, client, companyName, contactName, defaultTemplate, template, emailResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.estimates)
                                .where(drizzle_orm_1.eq(schema_1.estimates.id, input.estimateId))
                                .limit(1)];
                    case 2:
                        estimateResult = _b.sent();
                        if (!estimateResult.length) {
                            throw new Error("Estimate not found");
                        }
                        estimate = estimateResult[0];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.eq(schema_1.clients.id, estimate.clientId))
                                .limit(1)];
                    case 3:
                        clientResult = _b.sent();
                        if (!clientResult.length) {
                            throw new Error("Client not found");
                        }
                        client = clientResult[0];
                        return [4 /*yield*/, getCompanyName()];
                    case 4:
                        companyName = _b.sent();
                        contactName = client.contactPerson || client.companyName;
                        defaultTemplate = emailTemplates.estimate(contactName, estimate.estimateNumber, estimate.total || 0, new Date(estimate.expiryDate || new Date()).toLocaleDateString(), companyName);
                        return [4 /*yield*/, resolveTemplate("estimate-new-client", {
                                first_name: contactName.split(" ")[0],
                                last_name: contactName.split(" ").slice(1).join(" "),
                                estimate_id: estimate.estimateNumber,
                                estimate_amount: formatKES(estimate.total || 0),
                                estimate_date: new Date(estimate.createdAt || new Date()).toLocaleDateString(),
                                client_name: client.companyName,
                                client_id: client.id,
                                our_company_name: companyName,
                                dashboard_url: process.env.APP_URL || ""
                            }, defaultTemplate)];
                    case 5:
                        template = _b.sent();
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: input.recipientEmail,
                                subject: template.subject,
                                html: template.html,
                                text: template.text
                            })];
                    case 6:
                        emailResult = _b.sent();
                        if (!emailResult.success) {
                            throw new Error("Failed to send email: " + emailResult.error);
                        }
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "estimate_sent",
                                entityType: "estimate",
                                entityId: input.estimateId,
                                description: "Sent estimate " + estimate.estimateNumber + " to " + input.recipientEmail
                            })];
                    case 7:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Estimate sent to " + input.recipientEmail,
                                messageId: emailResult.messageId
                            }];
                }
            });
        });
    }),
    // Send payment reminder
    sendPaymentReminder: trpc_1.createFeatureRestrictedProcedure("communications:email")
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        recipientEmail: zod_1.z.string().email()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, invoiceResult, invoice, clientResult, client, daysOverdue, companyName, contactName, defaultTemplate, template, emailResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))
                                .limit(1)];
                    case 2:
                        invoiceResult = _b.sent();
                        if (!invoiceResult.length) {
                            throw new Error("Invoice not found");
                        }
                        invoice = invoiceResult[0];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.eq(schema_1.clients.id, invoice.clientId))
                                .limit(1)];
                    case 3:
                        clientResult = _b.sent();
                        if (!clientResult.length) {
                            throw new Error("Client not found");
                        }
                        client = clientResult[0];
                        daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                        return [4 /*yield*/, getCompanyName()];
                    case 4:
                        companyName = _b.sent();
                        contactName = client.contactPerson || client.companyName;
                        defaultTemplate = emailTemplates.paymentReminder(contactName, invoice.invoiceNumber, invoice.total || 0, Math.max(daysOverdue, 0), new Date(invoice.dueDate).toLocaleDateString(), companyName);
                        return [4 /*yield*/, resolveTemplate("invoice-reminder-client", {
                                first_name: contactName.split(" ")[0],
                                last_name: contactName.split(" ").slice(1).join(" "),
                                invoice_id: invoice.invoiceNumber,
                                invoice_amount: formatKES(invoice.total || 0),
                                invoice_amount_due: formatKES(invoice.total || 0),
                                invoice_date_due: new Date(invoice.dueDate).toLocaleDateString(),
                                client_name: client.companyName,
                                invoice_url: (process.env.APP_URL || "") + "/invoices/" + invoice.id,
                                our_company_name: companyName,
                                dashboard_url: process.env.APP_URL || ""
                            }, defaultTemplate)];
                    case 5:
                        template = _b.sent();
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: input.recipientEmail,
                                subject: template.subject,
                                html: template.html,
                                text: template.text
                            })];
                    case 6:
                        emailResult = _b.sent();
                        if (!emailResult.success) {
                            throw new Error("Failed to send email: " + emailResult.error);
                        }
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_reminder_sent",
                                entityType: "invoice",
                                entityId: input.invoiceId,
                                description: "Sent payment reminder for invoice " + invoice.invoiceNumber + " to " + input.recipientEmail
                            })];
                    case 7:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Payment reminder sent to " + input.recipientEmail,
                                messageId: emailResult.messageId
                            }];
                }
            });
        });
    }),
    // Send payment received notification
    sendPaymentReceivedNotification: trpc_1.createFeatureRestrictedProcedure("communications:email")
        .input(zod_1.z.object({
        invoiceId: zod_1.z.string(),
        recipientEmail: zod_1.z.string().email(),
        paymentAmount: zod_1.z.number()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, invoiceResult, invoice, clientResult, client, companyName, contactName, defaultTemplate, template, emailResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            throw new Error("Database not available");
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, input.invoiceId))
                                .limit(1)];
                    case 2:
                        invoiceResult = _b.sent();
                        if (!invoiceResult.length) {
                            throw new Error("Invoice not found");
                        }
                        invoice = invoiceResult[0];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.eq(schema_1.clients.id, invoice.clientId))
                                .limit(1)];
                    case 3:
                        clientResult = _b.sent();
                        if (!clientResult.length) {
                            throw new Error("Client not found");
                        }
                        client = clientResult[0];
                        return [4 /*yield*/, getCompanyName()];
                    case 4:
                        companyName = _b.sent();
                        contactName = client.contactPerson || client.companyName;
                        defaultTemplate = emailTemplates.paymentReceived(contactName, invoice.invoiceNumber, input.paymentAmount, companyName);
                        return [4 /*yield*/, resolveTemplate("payment-thankyou-client", {
                                first_name: contactName.split(" ")[0],
                                last_name: contactName.split(" ").slice(1).join(" "),
                                invoice_id: invoice.invoiceNumber,
                                payment_amount: formatKES(input.paymentAmount),
                                client_name: client.companyName,
                                our_company_name: companyName,
                                dashboard_url: process.env.APP_URL || ""
                            }, defaultTemplate)];
                    case 5:
                        template = _b.sent();
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: input.recipientEmail,
                                subject: template.subject,
                                html: template.html,
                                text: template.text
                            })];
                    case 6:
                        emailResult = _b.sent();
                        if (!emailResult.success) {
                            throw new Error("Failed to send email: " + emailResult.error);
                        }
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_notification_sent",
                                entityType: "invoice",
                                entityId: input.invoiceId,
                                description: "Sent payment received notification for invoice " + invoice.invoiceNumber + " to " + input.recipientEmail
                            })];
                    case 7:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Payment notification sent to " + input.recipientEmail,
                                messageId: emailResult.messageId
                            }];
                }
            });
        });
    }),
    // Batch send invoices
    batchSendInvoices: trpc_1.createFeatureRestrictedProcedure("communications:email")
        .input(zod_1.z.object({
        invoiceIds: zod_1.z.array(zod_1.z.string()).min(1),
        message: zod_1.z.string().max(1000).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, _b, invoiceId, invoiceResult, invoice, clientResult, client, companyName, contactName, defaultTemplate, template, emailResult, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        results = {
                            sent: 0,
                            failed: 0,
                            errors: []
                        };
                        _i = 0, _b = input.invoiceIds;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 12];
                        invoiceId = _b[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 10, , 11]);
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))
                                .limit(1)];
                    case 4:
                        invoiceResult = _c.sent();
                        if (!invoiceResult.length) {
                            results.failed++;
                            results.errors.push("Invoice " + invoiceId + " not found");
                            return [3 /*break*/, 11];
                        }
                        invoice = invoiceResult[0];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.eq(schema_1.clients.id, invoice.clientId))
                                .limit(1)];
                    case 5:
                        clientResult = _c.sent();
                        if (!clientResult.length || !clientResult[0].email) {
                            results.failed++;
                            results.errors.push("No email found for invoice " + invoice.invoiceNumber);
                            return [3 /*break*/, 11];
                        }
                        client = clientResult[0];
                        return [4 /*yield*/, getCompanyName()];
                    case 6:
                        companyName = _c.sent();
                        contactName = client.contactPerson || client.companyName;
                        defaultTemplate = emailTemplates.invoice(contactName, invoice.invoiceNumber, invoice.total || 0, new Date(invoice.dueDate).toLocaleDateString(), companyName);
                        return [4 /*yield*/, resolveTemplate("invoice-new-client", {
                                first_name: contactName.split(" ")[0],
                                last_name: contactName.split(" ").slice(1).join(" "),
                                invoice_id: invoice.invoiceNumber,
                                invoice_amount: formatKES(invoice.total || 0),
                                invoice_amount_due: formatKES(invoice.total || 0),
                                invoice_date_created: new Date(invoice.createdAt || new Date()).toLocaleDateString(),
                                invoice_date_due: new Date(invoice.dueDate).toLocaleDateString(),
                                client_name: client.companyName,
                                client_id: client.id,
                                invoice_status: invoice.status || "pending",
                                invoice_url: (process.env.APP_URL || "") + "/invoices/" + invoice.id,
                                our_company_name: companyName,
                                dashboard_url: process.env.APP_URL || ""
                            }, defaultTemplate)];
                    case 7:
                        template = _c.sent();
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: client.email,
                                subject: template.subject,
                                html: template.html,
                                text: template.text
                            })];
                    case 8:
                        emailResult = _c.sent();
                        if (!emailResult.success) {
                            results.failed++;
                            results.errors.push("Failed to send invoice " + invoice.invoiceNumber + ": " + emailResult.error);
                            return [3 /*break*/, 11];
                        }
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "invoice_sent",
                                entityType: "invoice",
                                entityId: invoiceId,
                                description: "Batch sent invoice " + invoice.invoiceNumber + " to " + client.email
                            })];
                    case 9:
                        // Log activity
                        _c.sent();
                        results.sent++;
                        return [3 /*break*/, 11];
                    case 10:
                        error_1 = _c.sent();
                        results.failed++;
                        results.errors.push("Error sending invoice " + invoiceId + ": " + error_1);
                        return [3 /*break*/, 11];
                    case 11:
                        _i++;
                        return [3 /*break*/, 2];
                    case 12: return [2 /*return*/, __assign(__assign({}, results), { message: "Sent " + results.sent + " invoice(s), " + results.failed + " failed" })];
                }
            });
        });
    }),
    // Batch send payment reminders
    batchSendPaymentReminders: trpc_1.createFeatureRestrictedProcedure("communications:email")
        .input(zod_1.z.object({
        invoiceIds: zod_1.z.array(zod_1.z.string()).min(1),
        daysOverdueThreshold: zod_1.z.number()["default"](0)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, results, _i, _b, invoiceId, invoiceResult, invoice, daysOverdue, clientResult, client, companyName, contactName, defaultTemplate, template, emailResult, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            throw new Error("Database not available");
                        results = {
                            sent: 0,
                            failed: 0,
                            errors: []
                        };
                        _i = 0, _b = input.invoiceIds;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 12];
                        invoiceId = _b[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 10, , 11]);
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.id, invoiceId))
                                .limit(1)];
                    case 4:
                        invoiceResult = _c.sent();
                        if (!invoiceResult.length) {
                            results.failed++;
                            results.errors.push("Invoice " + invoiceId + " not found");
                            return [3 /*break*/, 11];
                        }
                        invoice = invoiceResult[0];
                        daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                        if (daysOverdue < input.daysOverdueThreshold) {
                            results.failed++;
                            results.errors.push("Invoice " + invoice.invoiceNumber + " not overdue by " + input.daysOverdueThreshold + " days");
                            return [3 /*break*/, 11];
                        }
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.clients)
                                .where(drizzle_orm_1.eq(schema_1.clients.id, invoice.clientId))
                                .limit(1)];
                    case 5:
                        clientResult = _c.sent();
                        if (!clientResult.length || !clientResult[0].email) {
                            results.failed++;
                            results.errors.push("No email found for invoice " + invoice.invoiceNumber);
                            return [3 /*break*/, 11];
                        }
                        client = clientResult[0];
                        return [4 /*yield*/, getCompanyName()];
                    case 6:
                        companyName = _c.sent();
                        contactName = client.contactPerson || client.companyName;
                        defaultTemplate = emailTemplates.paymentReminder(contactName, invoice.invoiceNumber, invoice.total || 0, Math.max(daysOverdue, 0), new Date(invoice.dueDate).toLocaleDateString(), companyName);
                        return [4 /*yield*/, resolveTemplate("invoice-reminder-client", {
                                first_name: contactName.split(" ")[0],
                                last_name: contactName.split(" ").slice(1).join(" "),
                                invoice_id: invoice.invoiceNumber,
                                invoice_amount: formatKES(invoice.total || 0),
                                invoice_amount_due: formatKES(invoice.total || 0),
                                invoice_date_due: new Date(invoice.dueDate).toLocaleDateString(),
                                client_name: client.companyName,
                                invoice_url: (process.env.APP_URL || "") + "/invoices/" + invoice.id,
                                our_company_name: companyName,
                                dashboard_url: process.env.APP_URL || ""
                            }, defaultTemplate)];
                    case 7:
                        template = _c.sent();
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: client.email,
                                subject: template.subject,
                                html: template.html,
                                text: template.text
                            })];
                    case 8:
                        emailResult = _c.sent();
                        if (!emailResult.success) {
                            results.failed++;
                            results.errors.push("Failed to send reminder for invoice " + invoice.invoiceNumber + ": " + emailResult.error);
                            return [3 /*break*/, 11];
                        }
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: "payment_reminder_sent",
                                entityType: "invoice",
                                entityId: invoiceId,
                                description: "Batch sent payment reminder for invoice " + invoice.invoiceNumber + " to " + client.email
                            })];
                    case 9:
                        // Log activity
                        _c.sent();
                        results.sent++;
                        return [3 /*break*/, 11];
                    case 10:
                        error_2 = _c.sent();
                        results.failed++;
                        results.errors.push("Error sending reminder for invoice " + invoiceId + ": " + error_2);
                        return [3 /*break*/, 11];
                    case 11:
                        _i++;
                        return [3 /*break*/, 2];
                    case 12: return [2 /*return*/, __assign(__assign({}, results), { message: "Sent " + results.sent + " reminder(s), " + results.failed + " failed" })];
                }
            });
        });
    }),
    // Get email templates
    getTemplates: trpc_1.createFeatureRestrictedProcedure("communications:email")
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, {
                    invoice: "Invoice notification template",
                    estimate: "Estimate notification template",
                    paymentReminder: "Payment reminder template",
                    paymentReceived: "Payment received notification template"
                }];
        });
    }); })
});
