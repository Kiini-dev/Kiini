"use strict";
/**
 * Email Notification Templates & Service
 * SendGrid/Mailgun integration for all billing and subscription emails
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
exports.sendEmailBatch = exports.sendEmail = void 0;
var mail_1 = require("@sendgrid/mail");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
mail_1["default"].setApiKey(process.env.SENDGRID_API_KEY || "");
function formatCurrency(amount, currency) {
    if (currency === void 0) { currency = "KES"; }
    return currency + " " + (amount / 100).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
/**
 * Email template registry with subject and body generators
 */
var emailTemplates = {
    trial_7day_warning: function (ctx) { return ({
        subject: "⏰ Your Kiini CRM Trial Ends in 7 Days",
        html: "\n      <h2>Hi " + (ctx.contactName || "there") + ",</h2>\n      <p>Your <strong>" + ctx.organizationName + "</strong> trial for Kiini CRM ends in <strong>7 days</strong>.</p>\n      <p>Don't lose access! Upgrade to a paid plan now to keep using all features.</p>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/pricing\" \n           style=\"background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;\">\n          View Pricing Plans \u2192\n        </a>\n      </div>\n      <h4>Your trial includes:</h4>\n      <ul>\n        <li>\u2705 Full CRM access with 5 users</li>\n        <li>\u2705 Invoice management</li>\n        <li>\u2705 Customer database</li>\n        <li>\u2705 Basic reporting</li>\n      </ul>\n      <p><strong>Need more time?</strong> Reply to this email and we'll work something out.</p>\n      <hr style=\"margin-top: 30px;\"/>\n      <p style=\"font-size: 12px; color: #666;\">\n        Trial expires on <strong>" + new Date(ctx.trialEndDate).toLocaleDateString() + "</strong><br/>\n        Organization: " + ctx.organizationName + "\n      </p>\n    "
    }); },
    trial_24h_critical: function (ctx) { return ({
        subject: "🚨 URGENT: Your Kiini CRM Trial Expires Tomorrow",
        html: "\n      <h2 style=\"color: #d32f2f;\">Your trial expires in 24 hours!</h2>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p>Your trial access to Kiini CRM will end <strong>tomorrow midnight</strong>.</p>\n      <p style=\"background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800;\">\n        <strong>\u26A0\uFE0F Act now:</strong> After midnight, you'll lose access to all CRM data and features until you upgrade.\n      </p>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/pricing\" \n           style=\"background-color: #d32f2f; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px;\">\n          Upgrade Now - Don't Lose Access \u2715\n        </a>\n      </div>\n      <p style=\"margin-top: 20px;\">Have questions? <a href=\"mailto:support@kiini.africa\">Contact our support team</a>.</p>\n      <hr style=\"margin-top: 30px;\"/>\n      <p style=\"font-size: 12px; color: #666;\">\n        Trial expires on <strong>" + new Date(ctx.trialEndDate).toLocaleString() + "</strong>\n      </p>\n    "
    }); },
    trial_expired: function (ctx) { return ({
        subject: "Your Trial Has Ended 🔒",
        html: "\n      <h2>Your trial access has ended</h2>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p>Unfortunately, your Kiini CRM trial for <strong>" + ctx.organizationName + "</strong> expired on " + new Date(ctx.trialEndDate).toLocaleDateString() + ".</p>\n      <p>Your data is safe and waiting for you! Upgrade anytime to regain access.</p>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/pricing\" \n           style=\"background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;\">\n          Choose Your Plan & Reactivate\n        </a>\n      </div>\n      <h4>Popular plans:</h4>\n      <ul>\n        <li><strong>Accounting Only - $49/mo</strong>: Perfect for invoicing and accounting</li>\n        <li><strong>Starter - $99/mo</strong>: Full CRM with HR basics (most popular)</li>\n        <li><strong>Professional - $399/mo</strong>: Everything + Procurement + Payroll</li>\n      </ul>\n      <p style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;\">\n        <strong>Special offer:</strong> First month 50% off when you upgrade today!<br/>\n        Use code: <code style=\"background-color: #f5f5f5; padding: 2px 6px;\">RESTART50</code>\n      </p>\n    "
    }); },
    renewal_invoice: function (ctx) { return ({
        subject: "\uD83E\uDDFE Your Subscription Renewal Invoice",
        html: "\n      <h2>Subscription Renewal Invoice</h2>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p>Your subscription renewal invoice for <strong>" + ctx.organizationName + "</strong> is ready.</p>\n      <table style=\"width: 100%; border-collapse: collapse; margin: 20px 0;\">\n        <tr style=\"background-color: #f5f5f5;\">\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Plan</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + ctx.pricingTier + "</strong></td>\n        </tr>\n        <tr>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Amount</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + formatCurrency(ctx.amount) + "</strong></td>\n        </tr>\n        <tr style=\"background-color: #f5f5f5;\">\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Billing Period</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">" + new Date(ctx.invoiceDate).toLocaleDateString() + " - " + new Date(ctx.nextBillingDate).toLocaleDateString() + "</td>\n        </tr>\n        <tr>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Due Date</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + new Date(ctx.dueDate).toLocaleDateString() + "</strong></td>\n        </tr>\n      </table>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/invoices/" + ctx.invoiceId + "\" \n           style=\"background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;\">\n          View & Pay Invoice\n        </a>\n      </div>\n      <p><strong>Payment options:</strong></p>\n      <ul>\n        <li>\uD83D\uDCB3 Stripe: Secure card payment</li>\n        <li>\uD83D\uDCF1 M-Pesa: Pay via STK or Paybill (Business Short Code: <code>246247</code>)</li>\n        <li>\uD83C\uDFE6 Bank Transfer: Check your account for details</li>\n      </ul>\n    "
    }); },
    payment_reminder_upcoming: function (ctx) { return ({
        subject: "\uD83D\uDCB0 Payment Due in " + ctx.daysToDue + " Day(s): Invoice " + ctx.invoiceNumber,
        html: "\n      <h3>Friendly Payment Reminder</h3>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p>Payment for invoice <strong>" + ctx.invoiceNumber + "</strong> is due <strong>" + ctx.daysToDue + " day(s)</strong> from now.</p>\n      <table style=\"width: 100%; margin: 20px 0; border-collapse: collapse;\">\n        <tr style=\"background-color: #e8f5e9;\">\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Invoice Number</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + ctx.invoiceNumber + "</strong></td>\n        </tr>\n        <tr>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Amount</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + formatCurrency(ctx.amount) + "</strong></td>\n        </tr>\n        <tr style=\"background-color: #e8f5e9;\">\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Due</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + ctx.dueDate + "</strong></td>\n        </tr>\n      </table>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/invoices/" + ctx.invoiceId + "\" \n           style=\"background-color: #4caf50; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;\">\n          Pay Now\n        </a>\n      </div>\n      <p>Thank you for your business!</p>\n    "
    }); },
    payment_reminder_overdue: function (ctx) { return ({
        subject: "\u23F0 Invoice " + ctx.invoiceNumber + " Payment is Overdue",
        html: "\n      <h3>Payment Reminder</h3>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p>Invoice <strong>" + ctx.invoiceNumber + "</strong> is now <strong>" + ctx.daysOverdue + " days overdue</strong>.</p>\n      <p style=\"background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800;\">\n        Please settle this payment to avoid service interruption.\n      </p>\n      <table style=\"width: 100%; margin: 20px 0; border-collapse: collapse;\">\n        <tr>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Invoice</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + ctx.invoiceNumber + "</strong></td>\n        </tr>\n        <tr style=\"background-color: #f5f5f5;\">\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Amount Due</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + formatCurrency(ctx.amount) + "</strong></td>\n        </tr>\n        <tr>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Days Overdue</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong style=\"color: #d32f2f;\">" + ctx.daysOverdue + " days</strong></td>\n        </tr>\n      </table>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/invoices/" + ctx.invoiceId + "\" \n           style=\"background-color: #ff9800; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;\">\n          Settle Payment Now\n        </a>\n      </div>\n    "
    }); },
    payment_critical_overdue: function (ctx) { return ({
        subject: "\uD83D\uDEA8 CRITICAL: Invoice " + ctx.invoiceNumber + " is " + ctx.daysOverdue + "+ Days Overdue",
        html: "\n      <h2 style=\"color: #d32f2f;\">URGENT: Payment is Critically Overdue</h2>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p style=\"background-color: #ffebee; padding: 15px; border-left: 4px solid #d32f2f;\">\n        <strong>Invoice " + ctx.invoiceNumber + " is " + ctx.daysOverdue + " days overdue.</strong> Your account is at risk of suspension if payment is not received immediately.\n      </p>\n      <table style=\"width: 100%; margin: 20px 0; border-collapse: collapse;\">\n        <tr style=\"background-color: #ffcdd2;\">\n          <td style=\"padding: 10px; border: 1px solid #f44336;\">Invoice</td>\n          <td style=\"padding: 10px; border: 1px solid #f44336;\"><strong>" + ctx.invoiceNumber + "</strong></td>\n        </tr>\n        <tr>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Amount Due</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + formatCurrency(ctx.amount) + "</strong></td>\n        </tr>\n        <tr style=\"background-color: #ffcdd2;\">\n          <td style=\"padding: 10px; border: 1px solid #f44336;\">Days Overdue</td>\n          <td style=\"padding: 10px; border: 1px solid #f44336;\"><strong>" + ctx.daysOverdue + " days</strong></td>\n        </tr>\n      </table>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/invoices/" + ctx.invoiceId + "\" \n           style=\"background-color: #d32f2f; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px;\">\n          PAY NOW TO AVOID SERVICE SUSPENSION\n        </a>\n      </div>\n      <p style=\"margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;\">\n        <strong>Need to discuss payment arrangements?</strong><br/>\n        Contact our billing team: <a href=\"mailto:support@kiini.africa\">support@kiini.africa</a> or call <strong>+254 (0)726-123456</strong>\n      </p>\n    "
    }); },
    payment_received: function (ctx) { return ({
        subject: "\u2705 Payment Received - Invoice " + ctx.invoiceNumber,
        html: "\n      <h2 style=\"color: #4caf50;\">Payment Received \u2713</h2>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p>Thank you! We've received your payment.</p>\n      <table style=\"width: 100%; margin: 20px 0; border-collapse: collapse;\">\n        <tr style=\"background-color: #e8f5e9;\">\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Invoice Number</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + ctx.invoiceNumber + "</strong></td>\n        </tr>\n        <tr>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Amount</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + formatCurrency(ctx.amount) + "</strong></td>\n        </tr>\n        <tr style=\"background-color: #e8f5e9;\">\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Payment Date</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + new Date().toLocaleDateString() + "</strong></td>\n        </tr>\n        <tr>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Reference</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + (ctx.transactionReference || "See receipt") + "</strong></td>\n        </tr>\n      </table>\n      <p>Your receipt has been sent separately. Keep it for your records.</p>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/invoices/" + ctx.invoiceId + "\" \n           style=\"background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;\">\n          View Invoice & Receipt\n        </a>\n      </div>\n    "
    }); },
    payment_failed: function (ctx) { return ({
        subject: "\u26A0\uFE0F Payment Failed - Invoice " + ctx.invoiceNumber,
        html: "\n      <h3>Your Payment Could Not Be Processed</h3>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p>Your payment attempt for invoice <strong>" + ctx.invoiceNumber + "</strong> was unsuccessful.</p>\n      <p style=\"background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800;\">\n        <strong>Reason:</strong> " + (ctx.failureReason || "Card was declined or payment processor returned an error") + "\n      </p>\n      <table style=\"width: 100%; margin: 20px 0; border-collapse: collapse;\">\n        <tr>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Invoice</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + ctx.invoiceNumber + "</strong></td>\n        </tr>\n        <tr style=\"background-color: #f5f5f5;\">\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Amount</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + formatCurrency(ctx.amount) + "</strong></td>\n        </tr>\n      </table>\n      <p><strong>We will automatically retry your payment in 3 days.</strong></p>\n      <p>If you'd like to try again now:</p>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/invoices/" + ctx.invoiceId + "\" \n           style=\"background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;\">\n          Retry Payment\n        </a>\n      </div>\n      <p style=\"margin-top: 30px;\">\n        <strong>Having issues?</strong><br/>\n        Try a different payment method or contact <a href=\"mailto:support@kiini.africa\">support@kiini.africa</a>\n      </p>\n    "
    }); },
    invoice_generated: function (ctx) { return ({
        subject: "\uD83D\uDCC4 New Invoice: " + ctx.invoiceNumber,
        html: "\n      <h2>New Invoice Ready</h2>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p>A new invoice has been generated for <strong>" + ctx.organizationName + "</strong>.</p>\n      <table style=\"width: 100%; margin: 20px 0; border-collapse: collapse;\">\n        <tr style=\"background-color: #f5f5f5;\">\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Invoice Number</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + ctx.invoiceNumber + "</strong></td>\n        </tr>\n        <tr>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Amount</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + formatCurrency(ctx.amount) + "</strong></td>\n        </tr>\n        <tr style=\"background-color: #f5f5f5;\">\n          <td style=\"padding: 10px; border: 1px solid #ddd;\">Due Date</td>\n          <td style=\"padding: 10px; border: 1px solid #ddd;\"><strong>" + ctx.dueDate + "</strong></td>\n        </tr>\n      </table>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/invoices/" + ctx.invoiceId + "\" \n           style=\"background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;\">\n          View Invoice\n        </a>\n      </div>\n    "
    }); },
    subscription_upgraded: function (ctx) {
        var _a;
        return ({
            subject: "\uD83C\uDF89 Welcome to " + ctx.newPricingTier + "!",
            html: "\n      <h2>Congratulations on Your Upgrade!</h2>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p>Your Kiini CRM subscription has been successfully upgraded to <strong>" + ctx.newPricingTier + "</strong>.</p>\n      <h4>New Features Now Available:</h4>\n      <ul>\n        " + (((_a = ctx.newFeatures) === null || _a === void 0 ? void 0 : _a.map(function (f) { return "<li>\u2705 " + f + "</li>"; }).join("")) || "") + "\n      </ul>\n      <p>Your team of <strong>" + ctx.maxUsers + " users</strong> can now access all advanced features.</p>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/admin/features\" \n           style=\"background-color: #4caf50; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;\">\n          Explore New Features\n        </a>\n      </div>\n    "
        });
    },
    subscription_downgraded: function (ctx) { return ({
        subject: "Plan Downgrade Complete",
        html: "\n      <h2>Your Plan Has Been Downgraded</h2>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p>Your subscription has been downgraded to <strong>" + ctx.newPricingTier + "</strong> effective immediately.</p>\n      <p style=\"background-color: #fff3e0; padding: 15px;\">\n        <strong>Note:</strong> Some features may no longer be available at this tier. Users above your new limit will need to be archived.\n      </p>\n    "
    }); },
    subscription_canceled: function (ctx) { return ({
        subject: "Subscription Canceled",
        html: "\n      <h2>Your Subscription Has Been Canceled</h2>\n      <p>Hi " + (ctx.contactName || "there") + ",</p>\n      <p>Your Kiini CRM subscription has been canceled effective <strong>" + ctx.effectiveDate + "</strong>.</p>\n      <p>Your data will be retained for 30 days. You can reactivate your account anytime by upgrading to a paid plan.</p>\n      <div style=\"margin: 30px 0;\">\n        <a href=\"" + process.env.APP_URL + "/pricing\" \n           style=\"background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;\">\n          Reactivate Your Account\n        </a>\n      </div>\n    "
    }); }
};
/**
 * Send email using SendGrid
 */
function sendEmail(to, template, context) {
    return __awaiter(this, void 0, Promise, function () {
        var templateGenerator, _a, subject, html, msg, response, db, logError_1, error_1, db, logError_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 15]);
                    templateGenerator = emailTemplates[template];
                    if (!templateGenerator) {
                        throw new Error("Unknown email template: " + template);
                    }
                    _a = templateGenerator(context), subject = _a.subject, html = _a.html;
                    msg = {
                        to: to,
                        from: process.env.SENDGRID_FROM_EMAIL || "noreply@kiini.africa",
                        subject: subject,
                        html: html,
                        replyTo: "support@kiini.africa"
                    };
                    return [4 /*yield*/, mail_1["default"].send(msg)];
                case 1:
                    response = _b.sent();
                    console.log("\uD83D\uDCE7 Email sent (" + template + ") to " + to);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, db_1.getDb()];
                case 3:
                    db = _b.sent();
                    if (!db) return [3 /*break*/, 5];
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            organizationId: context.organizationId,
                            userId: "email-service",
                            action: "email_sent",
                            entityType: "email",
                            entityId: template,
                            severity: "info",
                            ipAddress: "internal",
                            userAgent: "SendGrid",
                            timestamp: new Date(),
                            details: JSON.stringify({
                                to: to,
                                template: template,
                                subject: subject,
                                status: "sent"
                            })
                        })];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    logError_1 = _b.sent();
                    console.warn("Failed to log email send:", logError_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, {
                        success: true,
                        messageId: response[0].headers["x-message-id"]
                    }];
                case 8:
                    error_1 = _b.sent();
                    console.error("\u274C Error sending email (" + template + "):", error_1.message);
                    _b.label = 9;
                case 9:
                    _b.trys.push([9, 13, , 14]);
                    return [4 /*yield*/, db_1.getDb()];
                case 10:
                    db = _b.sent();
                    if (!(db && context.organizationId)) return [3 /*break*/, 12];
                    return [4 /*yield*/, db.insert(schema_1.auditLogs).values({
                            organizationId: context.organizationId,
                            userId: "email-service",
                            action: "email_failed",
                            entityType: "email",
                            entityId: template,
                            severity: "warning",
                            ipAddress: "internal",
                            userAgent: "SendGrid",
                            timestamp: new Date(),
                            details: JSON.stringify({
                                to: context.email,
                                template: template,
                                error: error_1.message
                            })
                        })];
                case 11:
                    _b.sent();
                    _b.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    logError_2 = _b.sent();
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/, {
                        success: false,
                        error: error_1.message
                    }];
                case 15: return [2 /*return*/];
            }
        });
    });
}
exports.sendEmail = sendEmail;
/**
 * Send batch emails
 */
function sendEmailBatch(recipients, template) {
    return __awaiter(this, void 0, void 0, function () {
        var results, _i, recipients_1, recipient, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83D\uDCE7 Sending " + recipients.length + " emails (" + template + ")...");
                    results = {
                        sent: 0,
                        failed: 0,
                        errors: []
                    };
                    _i = 0, recipients_1 = recipients;
                    _a.label = 1;
                case 1:
                    if (!(_i < recipients_1.length)) return [3 /*break*/, 5];
                    recipient = recipients_1[_i];
                    return [4 /*yield*/, sendEmail(recipient.email, template, recipient.context)];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        results.sent++;
                    }
                    else {
                        results.failed++;
                        results.errors.push(recipient.email + ": " + result.error);
                    }
                    // Rate limiting: 10 emails per second max
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 3:
                    // Rate limiting: 10 emails per second max
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    console.log("\u2705 Batch complete: " + results.sent + " sent, " + results.failed + " failed");
                    return [2 /*return*/, results];
            }
        });
    });
}
exports.sendEmailBatch = sendEmailBatch;
exports["default"] = {
    sendEmail: sendEmail,
    sendEmailBatch: sendEmailBatch,
    emailTemplates: emailTemplates
};
