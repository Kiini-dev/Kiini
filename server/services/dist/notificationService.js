"use strict";
/**
 * Unified Notification Service
 * Handles multi-channel notifications: in-app, email, SMS, and Slack
 *
 * Usage:
 * - Send in-app notification: notificationService.sendInApp(...)
 * - Send email: notificationService.sendEmail(...)
 * - Send SMS: notificationService.sendSms(...)
 * - Send to Slack: notificationService.sendSlack(...)
 * - Send multi-channel: notificationService.send(...) with channels array
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
exports.notificationService = void 0;
var uuid_1 = require("uuid");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../../drizzle/schema");
var notificationBroadcaster_1 = require("../websocket/notificationBroadcaster");
var NotificationService = /** @class */ (function () {
    function NotificationService() {
        this.emailConfig = null;
        this.smsConfig = null;
        this.slackConfig = null;
        this.initializeProviders();
    }
    /**
     * Initialize notification providers from environment variables
     */
    NotificationService.prototype.initializeProviders = function () {
        // Email Provider
        var emailProvider = process.env.NOTIFICATION_EMAIL_PROVIDER;
        if (emailProvider) {
            this.emailConfig = {
                provider: emailProvider,
                apiKey: process.env.NOTIFICATION_EMAIL_API_KEY,
                domain: process.env.NOTIFICATION_EMAIL_DOMAIN,
                fromEmail: process.env.NOTIFICATION_EMAIL_FROM || process.env.SMTP_FROM_EMAIL || "noreply@crm.app",
                fromName: process.env.NOTIFICATION_EMAIL_FROM_NAME || process.env.COMPANY_NAME || "CRM Platform"
            };
        }
        // SMS Provider
        var smsProvider = process.env.NOTIFICATION_SMS_PROVIDER;
        if (smsProvider) {
            this.smsConfig = {
                provider: smsProvider,
                apiKey: process.env.NOTIFICATION_SMS_API_KEY,
                accountSid: process.env.NOTIFICATION_SMS_ACCOUNT_SID,
                authToken: process.env.NOTIFICATION_SMS_AUTH_TOKEN,
                fromNumber: process.env.NOTIFICATION_SMS_FROM_NUMBER
            };
        }
        // Slack Webhook
        if (process.env.NOTIFICATION_SLACK_WEBHOOK) {
            this.slackConfig = {
                webhookUrl: process.env.NOTIFICATION_SLACK_WEBHOOK,
                botName: process.env.NOTIFICATION_SLACK_BOT_NAME || process.env.COMPANY_NAME || "CRM Bot",
                channel: process.env.NOTIFICATION_SLACK_CHANNEL
            };
        }
    };
    /**
     * Send in-app notification
     */
    NotificationService.prototype.sendInApp = function (payload) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var db, id, notificationData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        id = uuid_1.v4();
                        notificationData = {
                            id: id,
                            userId: payload.userId,
                            title: payload.title,
                            message: payload.message,
                            type: payload.type,
                            category: payload.category,
                            entityType: payload.entityType,
                            entityId: payload.entityId,
                            actionUrl: payload.actionUrl,
                            priority: payload.priority,
                            expiresAt: (_a = payload.expiresAt) === null || _a === void 0 ? void 0 : _a.toISOString().replace('T', ' ').substring(0, 19),
                            isRead: 0,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            readAt: null
                        };
                        return [4 /*yield*/, db.insert(schema_1.notifications).values(notificationData)];
                    case 2:
                        _b.sent();
                        // Broadcast real-time update
                        notificationBroadcaster_1.broadcastNotification(payload.userId, notificationData);
                        notificationBroadcaster_1.broadcastUnreadCountChanged(payload.userId, 1);
                        return [2 /*return*/, id];
                }
            });
        });
    };
    /**
     * Send email notification via Resend
     */
    NotificationService.prototype.sendViaResend = function (recipientEmail, subject, htmlContent) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var Resend, resend, result, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!((_a = this.emailConfig) === null || _a === void 0 ? void 0 : _a.apiKey)) {
                            throw new Error("Resend API key not configured");
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("resend"); })];
                    case 2:
                        Resend = (_c.sent()).Resend;
                        resend = new Resend(this.emailConfig.apiKey);
                        return [4 /*yield*/, resend.emails.send({
                                from: this.emailConfig.fromName + " <" + this.emailConfig.fromEmail + ">",
                                to: recipientEmail,
                                subject: subject,
                                html: htmlContent
                            })];
                    case 3:
                        result = _c.sent();
                        if (result.error) {
                            throw new Error("Resend error: " + result.error.message);
                        }
                        return [2 /*return*/, ((_b = result.data) === null || _b === void 0 ? void 0 : _b.id) || "unknown"];
                    case 4:
                        error_1 = _c.sent();
                        console.error("Resend email error:", error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send email notification via SendGrid
     */
    NotificationService.prototype.sendViaSendGrid = function (recipientEmail, subject, htmlContent) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var sgMail, msg, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!((_a = this.emailConfig) === null || _a === void 0 ? void 0 : _a.apiKey)) {
                            throw new Error("SendGrid API key not configured");
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("@sendgrid/mail"); })];
                    case 2:
                        sgMail = _b.sent();
                        sgMail["default"].setApiKey(this.emailConfig.apiKey);
                        msg = {
                            to: recipientEmail,
                            from: this.emailConfig.fromEmail || "noreply@crm.local",
                            subject: subject,
                            html: htmlContent
                        };
                        return [4 /*yield*/, sgMail["default"].send(msg)];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result[0].headers["x-message-id"] || "unknown"];
                    case 4:
                        error_2 = _b.sent();
                        console.error("SendGrid email error:", error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send email notification
     */
    NotificationService.prototype.sendEmail = function (recipientEmail, subject, htmlContent, userId) {
        return __awaiter(this, void 0, Promise, function () {
            var messageId, db, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        if (!this.emailConfig) {
                            return [2 /*return*/, { success: false, error: "Email provider not configured" }];
                        }
                        messageId = void 0;
                        if (!(this.emailConfig.provider === "resend")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendViaResend(recipientEmail, subject, htmlContent)];
                    case 1:
                        messageId = _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(this.emailConfig.provider === "sendgrid")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendViaSendGrid(recipientEmail, subject, htmlContent)];
                    case 3:
                        messageId = _a.sent();
                        return [3 /*break*/, 5];
                    case 4: return [2 /*return*/, { success: false, error: "Email provider '" + this.emailConfig.provider + "' not implemented" }];
                    case 5:
                        if (!userId) return [3 /*break*/, 8];
                        return [4 /*yield*/, db_1.getDb()];
                    case 6:
                        db = _a.sent();
                        if (!db) return [3 /*break*/, 8];
                        return [4 /*yield*/, db.insert(schema_1.emailGenerationHistory).values({
                                id: uuid_1.v4(),
                                userId: userId,
                                recipientEmail: recipientEmail,
                                subject: subject,
                                messageId: messageId,
                                provider: this.emailConfig.provider,
                                status: "sent",
                                sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/, { success: true, messageId: messageId }];
                    case 9:
                        error_3 = _a.sent();
                        console.error("Error sending email:", error_3);
                        return [2 /*return*/, { success: false, error: error_3.message }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send SMS notification via Twilio
     */
    NotificationService.prototype.sendViaTwilio = function (phoneNumber, message) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var twilio, client, result, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!((_a = this.smsConfig) === null || _a === void 0 ? void 0 : _a.accountSid) || !((_b = this.smsConfig) === null || _b === void 0 ? void 0 : _b.authToken)) {
                            throw new Error("Twilio credentials not configured");
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("twilio"); })];
                    case 2:
                        twilio = _c.sent();
                        client = twilio["default"](this.smsConfig.accountSid, this.smsConfig.authToken);
                        return [4 /*yield*/, client.messages.create({
                                body: message,
                                from: this.smsConfig.fromNumber,
                                to: phoneNumber
                            })];
                    case 3:
                        result = _c.sent();
                        return [2 /*return*/, result.sid];
                    case 4:
                        error_4 = _c.sent();
                        console.error("Twilio SMS error:", error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send SMS notification via Africa's Talking
     */
    NotificationService.prototype.sendViaAfricasTalking = function (phoneNumber, message) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var response, data, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!((_a = this.smsConfig) === null || _a === void 0 ? void 0 : _a.apiKey)) {
                            throw new Error("Africa's Talking API key not configured");
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("https://api.sandbox.africastalking.com/version1/messaging", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded",
                                    Accept: "application/json",
                                    apikey: this.smsConfig.apiKey
                                },
                                body: new URLSearchParams({
                                    username: "sandbox",
                                    message: message,
                                    recipients: phoneNumber
                                }).toString()
                            })];
                    case 2:
                        response = _c.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _c.sent();
                        if (((_b = data.SMSMessageData) === null || _b === void 0 ? void 0 : _b.Recipients) && data.SMSMessageData.Recipients.length > 0) {
                            return [2 /*return*/, data.SMSMessageData.Recipients[0].messageId];
                        }
                        throw new Error("No SMS recipients returned");
                    case 4:
                        error_5 = _c.sent();
                        console.error("Africa's Talking SMS error:", error_5);
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send SMS notification
     */
    NotificationService.prototype.sendSms = function (phoneNumber, message) {
        return __awaiter(this, void 0, Promise, function () {
            var messageId, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        if (!this.smsConfig) {
                            return [2 /*return*/, { success: false, error: "SMS provider not configured" }];
                        }
                        messageId = void 0;
                        if (!(this.smsConfig.provider === "twilio")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendViaTwilio(phoneNumber, message)];
                    case 1:
                        messageId = _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(this.smsConfig.provider === "africastalking")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendViaAfricasTalking(phoneNumber, message)];
                    case 3:
                        messageId = _a.sent();
                        return [3 /*break*/, 5];
                    case 4: return [2 /*return*/, { success: false, error: "SMS provider '" + this.smsConfig.provider + "' not implemented" }];
                    case 5: return [2 /*return*/, { success: true, messageId: messageId }];
                    case 6:
                        error_6 = _a.sent();
                        console.error("Error sending SMS:", error_6);
                        return [2 /*return*/, { success: false, error: error_6.message }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send notification to Slack
     */
    NotificationService.prototype.sendSlack = function (message, channel, additionalFields) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var payload, response, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!((_a = this.slackConfig) === null || _a === void 0 ? void 0 : _a.webhookUrl)) {
                            return [2 /*return*/, { success: false, error: "Slack webhook not configured" }];
                        }
                        payload = {
                            text: message,
                            channel: channel || this.slackConfig.channel,
                            username: this.slackConfig.botName || "CRM Bot",
                            attachments: additionalFields
                                ? [
                                    {
                                        color: additionalFields.color || "good",
                                        fields: Object.entries(additionalFields).map(function (_a) {
                                            var key = _a[0], value = _a[1];
                                            return ({
                                                title: key,
                                                value: String(value),
                                                short: true
                                            });
                                        })
                                    },
                                ]
                                : undefined
                        };
                        return [4 /*yield*/, fetch(this.slackConfig.webhookUrl, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            })];
                    case 1:
                        response = _b.sent();
                        if (!response.ok) {
                            throw new Error("Slack API error: " + response.statusText);
                        }
                        return [2 /*return*/, { success: true }];
                    case 2:
                        error_7 = _b.sent();
                        console.error("Error sending Slack notification:", error_7);
                        return [2 /*return*/, { success: false, error: error_7.message }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send multi-channel notification
     */
    NotificationService.prototype.send = function (payload) {
        return __awaiter(this, void 0, Promise, function () {
            var result, channels, _a, error_8, emailResult, error_9, smsResult, error_10, slackResult, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        result = {};
                        channels = payload.channels || ["in-app"];
                        if (!channels.includes("in-app")) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = result;
                        return [4 /*yield*/, this.sendInApp(payload)];
                    case 2:
                        _a.notificationId = _b.sent();
                        result.inApp = { success: true };
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _b.sent();
                        result.inApp = { success: false, error: error_8.message };
                        return [3 /*break*/, 4];
                    case 4:
                        if (!(channels.includes("email") && payload.emailData)) return [3 /*break*/, 8];
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.sendEmail(payload.emailData.to, payload.emailData.subject, payload.emailData.htmlContent, payload.userId)];
                    case 6:
                        emailResult = _b.sent();
                        result.email = emailResult;
                        return [3 /*break*/, 8];
                    case 7:
                        error_9 = _b.sent();
                        result.email = { success: false, error: error_9.message };
                        return [3 /*break*/, 8];
                    case 8:
                        if (!(channels.includes("sms") && payload.smsData)) return [3 /*break*/, 12];
                        _b.label = 9;
                    case 9:
                        _b.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this.sendSms(payload.smsData.phoneNumber, payload.smsData.message)];
                    case 10:
                        smsResult = _b.sent();
                        result.sms = smsResult;
                        return [3 /*break*/, 12];
                    case 11:
                        error_10 = _b.sent();
                        result.sms = { success: false, error: error_10.message };
                        return [3 /*break*/, 12];
                    case 12:
                        if (!(channels.includes("slack") && payload.slackData)) return [3 /*break*/, 16];
                        _b.label = 13;
                    case 13:
                        _b.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, this.sendSlack(payload.slackData.message, payload.slackData.channel)];
                    case 14:
                        slackResult = _b.sent();
                        result.slack = slackResult;
                        return [3 /*break*/, 16];
                    case 15:
                        error_11 = _b.sent();
                        result.slack = { success: false, error: error_11.message };
                        return [3 /*break*/, 16];
                    case 16: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Get user notification preferences
     */
    NotificationService.prototype.getUserPreferences = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var db, prefs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _a.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.notificationPreferences)
                                .where(drizzle_orm_1.eq(schema_1.notificationPreferences.userId, userId))];
                    case 2:
                        prefs = _a.sent();
                        return [2 /*return*/, prefs[0] || null];
                }
            });
        });
    };
    /**
     * Update user notification preferences
     */
    NotificationService.prototype.updateUserPreferences = function (userId, preferences) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _a.sent();
                        if (!db)
                            throw new Error("Database not available");
                        return [4 /*yield*/, db
                                .update(schema_1.notificationPreferences)
                                .set(__assign(__assign({}, preferences), { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }))
                                .where(drizzle_orm_1.eq(schema_1.notificationPreferences.userId, userId))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return NotificationService;
}());
exports.notificationService = new NotificationService();
