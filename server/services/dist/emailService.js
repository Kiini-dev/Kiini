"use strict";
/**
 * Email Service with Queue Management
 * Handles email queuing, retry logic, template rendering, and delivery tracking
 *
 * SMTP configuration is resolved from environment variables first,
 * then falls back to database settings (Settings → Email).
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
exports.getEmailStatus = exports.getEmailQueueStatus = exports.processEmailQueue = exports.sendEmailImmediately = exports.queueEmail = void 0;
var server_1 = require("@trpc/server");
var mail_1 = require("../_core/mail");
var db = require("../db");
var uuid_1 = require("uuid");
var EmailService = /** @class */ (function () {
    function EmailService() {
        this.emailFrom = process.env.EMAIL_FROM || 'noreply@crm.local';
    }
    /**
     * Queue an email for sending
     */
    EmailService.prototype.queueEmail = function (input) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var database, emailQueue, queueId, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Database connection failed'
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        emailQueue = (_b.sent()).emailQueue;
                        queueId = uuid_1.v4();
                        return [4 /*yield*/, database.insert(emailQueue).values({
                                id: queueId,
                                recipientEmail: input.toEmail,
                                subject: input.subject,
                                htmlContent: (_a = input.htmlContent) !== null && _a !== void 0 ? _a : '',
                                textContent: input.plainTextContent,
                                eventType: 'manual',
                                entityType: input.relatedEntityType,
                                entityId: input.relatedEntityId,
                                status: 'pending'
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { queueId: queueId }];
                    case 4:
                        error_1 = _b.sent();
                        console.error('[Email] Queue error:', error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to queue email'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send email immediately (bypasses queue)
     */
    EmailService.prototype.sendEmailImmediately = function (input) {
        return __awaiter(this, void 0, Promise, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: input.toEmail,
                                subject: input.subject,
                                html: input.htmlContent,
                                text: input.plainTextContent
                            })];
                    case 1:
                        result = _a.sent();
                        if (!result.success) {
                            throw new Error(result.error || 'Failed to send email');
                        }
                        return [2 /*return*/, { success: true, messageId: result.messageId }];
                    case 2:
                        error_2 = _a.sent();
                        console.error('[Email] Send error:', error_2);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_2 instanceof Error ? error_2.message : 'Failed to send email'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process email queue (background job)
     */
    EmailService.prototype.processEmailQueue = function (batchSize) {
        if (batchSize === void 0) { batchSize = 10; }
        return __awaiter(this, void 0, Promise, function () {
            var database, emailQueue, _a, eq, and, lt, or, now, pendingEmails, sent, failed, _i, pendingEmails_1, email, result, error_3, attempts, maxAttempts, delayMinutes, nextRetry, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 17, , 18]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new Error('Database connection lost');
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        emailQueue = (_b.sent()).emailQueue;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        _a = _b.sent(), eq = _a.eq, and = _a.and, lt = _a.lt, or = _a.or;
                        now = new Date();
                        return [4 /*yield*/, database.select()
                                .from(emailQueue)
                                .where(and(eq(emailQueue.status, 'pending'), or(eq(emailQueue.nextRetryAt, null), lt(emailQueue.nextRetryAt, now))))
                                .limit(batchSize)];
                    case 4:
                        pendingEmails = _b.sent();
                        sent = 0;
                        failed = 0;
                        _i = 0, pendingEmails_1 = pendingEmails;
                        _b.label = 5;
                    case 5:
                        if (!(_i < pendingEmails_1.length)) return [3 /*break*/, 16];
                        email = pendingEmails_1[_i];
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 10, , 15]);
                        // Update status to retrying while sending
                        return [4 /*yield*/, database.update(emailQueue)
                                .set({ status: 'retrying' })
                                .where(eq(emailQueue.id, email.id))];
                    case 7:
                        // Update status to retrying while sending
                        _b.sent();
                        return [4 /*yield*/, mail_1.sendEmail({
                                to: email.recipientEmail,
                                subject: email.subject,
                                html: email.htmlContent,
                                text: email.textContent
                            })];
                    case 8:
                        result = _b.sent();
                        if (!result.success) {
                            throw new Error(result.error || 'Send failed');
                        }
                        // Mark as sent
                        return [4 /*yield*/, database.update(emailQueue)
                                .set({
                                status: 'sent',
                                sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })
                                .where(eq(emailQueue.id, email.id))];
                    case 9:
                        // Mark as sent
                        _b.sent();
                        sent++;
                        return [3 /*break*/, 15];
                    case 10:
                        error_3 = _b.sent();
                        failed++;
                        attempts = (email.attempts || 0) + 1;
                        maxAttempts = email.maxAttempts || 3;
                        if (!(attempts < maxAttempts)) return [3 /*break*/, 12];
                        delayMinutes = [5, 15, 60][attempts - 1] || 60;
                        nextRetry = new Date(now.getTime() + delayMinutes * 60 * 1000);
                        return [4 /*yield*/, database.update(emailQueue)
                                .set({
                                status: 'pending',
                                attempts: attempts,
                                nextRetryAt: nextRetry.toISOString().replace('T', ' ').substring(0, 19),
                                errorMessage: error_3 instanceof Error ? error_3.message : String(error_3)
                            })
                                .where(eq(emailQueue.id, email.id))];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 12: 
                    // Max retries exhausted
                    return [4 /*yield*/, database.update(emailQueue)
                            .set({
                            status: 'failed',
                            attempts: attempts,
                            errorMessage: "Failed after " + maxAttempts + " attempts: " + (error_3 instanceof Error ? error_3.message : String(error_3))
                        })
                            .where(eq(emailQueue.id, email.id))];
                    case 13:
                        // Max retries exhausted
                        _b.sent();
                        _b.label = 14;
                    case 14: return [3 /*break*/, 15];
                    case 15:
                        _i++;
                        return [3 /*break*/, 5];
                    case 16: return [2 /*return*/, { sent: sent, failed: failed }];
                    case 17:
                        error_4 = _b.sent();
                        console.error('[Email] Queue processing error:', error_4);
                        return [2 /*return*/, { sent: 0, failed: 0 }];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get email queue status
     */
    EmailService.prototype.getQueueStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var database, emailQueue, counts, statuses, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _a.sent();
                        if (!database)
                            throw new Error('Database connection lost');
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        emailQueue = (_a.sent()).emailQueue;
                        return [4 /*yield*/, database.select()
                                .from(emailQueue)];
                    case 3:
                        counts = _a.sent();
                        statuses = {
                            pending: counts.filter(function (e) { return e.status === 'pending'; }).length,
                            retrying: counts.filter(function (e) { return e.status === 'retrying'; }).length,
                            sent: counts.filter(function (e) { return e.status === 'sent'; }).length,
                            failed: counts.filter(function (e) { return e.status === 'failed'; }).length
                        };
                        return [2 /*return*/, statuses];
                    case 4:
                        error_5 = _a.sent();
                        console.error('[Email] Queue status error:', error_5);
                        return [2 /*return*/, { pending: 0, sending: 0, sent: 0, failed: 0, bounced: 0 }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get configured status
     */
    EmailService.prototype.getStatus = function () {
        return {
            isConfigured: true,
            emailFrom: this.emailFrom
        };
    };
    return EmailService;
}());
// Singleton instance
var emailService = new EmailService();
exports["default"] = emailService;
exports.queueEmail = function (input) { return emailService.queueEmail(input); };
exports.sendEmailImmediately = function (input) { return emailService.sendEmailImmediately(input); };
exports.processEmailQueue = function (batchSize) { return emailService.processEmailQueue(batchSize); };
exports.getEmailQueueStatus = function () { return emailService.getQueueStatus(); };
exports.getEmailStatus = function () { return emailService.getStatus(); };
