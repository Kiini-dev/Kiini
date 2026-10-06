"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.emailQueueRouter = exports.sendEmailImmediately = exports.processEmailQueue = exports.queueEmail = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var uuid_1 = require("uuid");
var mail_1 = require("../_core/mail");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
/**
 * Queue an email for sending (with retry logic)
 */
function queueEmail(input) {
    return __awaiter(this, void 0, void 0, function () {
        var db, queueId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error("Database not available for email queue");
                        return [2 /*return*/, { success: false, error: "Database not available" }];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    queueId = uuid_1.v4();
                    return [4 /*yield*/, db.insert(schema_1.emailQueue).values({
                            id: queueId,
                            recipientEmail: input.recipientEmail,
                            recipientName: input.recipientName,
                            subject: input.subject,
                            htmlContent: input.htmlContent,
                            textContent: input.textContent,
                            eventType: input.eventType,
                            entityType: input.entityType,
                            entityId: input.entityId,
                            userId: input.userId,
                            status: "pending",
                            attempts: 0,
                            maxAttempts: 3,
                            metadata: input.metadata ? JSON.stringify(input.metadata) : null,
                            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                case 3:
                    _a.sent();
                    console.log("[EMAIL QUEUE] Queued email " + queueId + " to " + input.recipientEmail);
                    return [2 /*return*/, { success: true, queueId: queueId }];
                case 4:
                    error_1 = _a.sent();
                    console.error("[EMAIL QUEUE] Error queueing email:", error_1);
                    return [2 /*return*/, { success: false, error: String(error_1) }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.queueEmail = queueEmail;
/**
 * Process pending emails from queue
 * Run via cron job or manual trigger
 */
function processEmailQueue() {
    return __awaiter(this, void 0, void 0, function () {
        var db, now, pendingEmails, processed, failed, _i, pendingEmails_1, email, result, attempts, backoffMs, nextRetry, error_2, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        console.error("Database not available for email processing");
                        return [2 /*return*/, { success: false, processed: 0, failed: 0 }];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 18, , 19]);
                    now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.emailQueue)
                            .where(drizzle_orm_1.or(drizzle_orm_1.eq(schema_1.emailQueue.status, "pending"), drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.emailQueue.status, "retrying"), drizzle_orm_1.lte(schema_1.emailQueue.nextRetryAt, now))))
                            .limit(50)];
                case 3:
                    pendingEmails = _a.sent();
                    processed = 0;
                    failed = 0;
                    _i = 0, pendingEmails_1 = pendingEmails;
                    _a.label = 4;
                case 4:
                    if (!(_i < pendingEmails_1.length)) return [3 /*break*/, 17];
                    email = pendingEmails_1[_i];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 15, , 16]);
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: email.recipientEmail,
                            subject: email.subject,
                            html: email.htmlContent,
                            text: email.textContent || undefined
                        })];
                case 6:
                    result = _a.sent();
                    if (!result.success) return [3 /*break*/, 9];
                    // Mark as sent
                    return [4 /*yield*/, db.update(schema_1.emailQueue).set({ status: "sent", sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }).where(drizzle_orm_1.eq(schema_1.emailQueue.id, email.id))];
                case 7:
                    // Mark as sent
                    _a.sent();
                    // Log successful send
                    return [4 /*yield*/, db.insert(schema_1.emailLog).values({
                            id: uuid_1.v4(),
                            queueId: email.id,
                            recipientEmail: email.recipientEmail,
                            subject: email.subject,
                            eventType: email.eventType,
                            status: "sent",
                            messageId: result.messageId || "",
                            sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                case 8:
                    // Log successful send
                    _a.sent();
                    console.log("[EMAIL QUEUE] Processed email " + email.id + " to " + email.recipientEmail + " - SUCCESS");
                    processed++;
                    return [3 /*break*/, 14];
                case 9:
                    attempts = (email.attempts || 0) + 1;
                    if (!(attempts < (email.maxAttempts || 3))) return [3 /*break*/, 11];
                    backoffMs = Math.pow(5, attempts) * 60000;
                    nextRetry = new Date(Date.now() + backoffMs).toISOString().replace('T', ' ').substring(0, 19);
                    return [4 /*yield*/, db.update(schema_1.emailQueue).set({
                            status: "retrying",
                            attempts: attempts,
                            lastAttemptAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            nextRetryAt: nextRetry,
                            errorMessage: result.error || "Send failed"
                        }).where(drizzle_orm_1.eq(schema_1.emailQueue.id, email.id))];
                case 10:
                    _a.sent();
                    console.log("[EMAIL QUEUE] Email " + email.id + " will retry at " + nextRetry);
                    return [3 /*break*/, 14];
                case 11: 
                // Max retries exceeded
                return [4 /*yield*/, db.update(schema_1.emailQueue).set({ status: "failed", errorMessage: result.error || "Max retries exceeded" }).where(drizzle_orm_1.eq(schema_1.emailQueue.id, email.id))];
                case 12:
                    // Max retries exceeded
                    _a.sent();
                    return [4 /*yield*/, db.insert(schema_1.emailLog).values({
                            id: uuid_1.v4(),
                            queueId: email.id,
                            recipientEmail: email.recipientEmail,
                            subject: email.subject,
                            eventType: email.eventType,
                            status: "failed",
                            errorMessage: result.error,
                            sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        })];
                case 13:
                    _a.sent();
                    console.log("[EMAIL QUEUE] Email " + email.id + " to " + email.recipientEmail + " - FAILED after " + attempts + " attempts");
                    failed++;
                    _a.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_2 = _a.sent();
                    console.error("[EMAIL QUEUE] Error processing email " + email.id + ":", error_2);
                    failed++;
                    return [3 /*break*/, 16];
                case 16:
                    _i++;
                    return [3 /*break*/, 4];
                case 17: return [2 /*return*/, { success: true, processed: processed, failed: failed, total: pendingEmails.length }];
                case 18:
                    error_3 = _a.sent();
                    console.error("[EMAIL QUEUE] Error processing queue:", error_3);
                    return [2 /*return*/, { success: false, error: String(error_3), processed: 0, failed: 0 }];
                case 19: return [2 /*return*/];
            }
        });
    });
}
exports.processEmailQueue = processEmailQueue;
/**
 * Send an email immediately without queuing
 * Used for time-sensitive emails like P9 forms, emergency alerts, etc.
 */
function sendEmailImmediately(input) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: input.to,
                            subject: input.subject,
                            html: input.htmlContent,
                            text: input.textContent
                        })];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        console.log("[EMAIL] Sent immediate email to " + input.to + ": " + input.subject);
                        return [2 /*return*/, { success: true, messageId: result.messageId }];
                    }
                    else {
                        console.error("[EMAIL] Failed to send immediate email to " + input.to + ":", result.error);
                        return [2 /*return*/, { success: false, error: result.error }];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error("[EMAIL] Error sending immediate email to " + input.to + ":", error_4);
                    return [2 /*return*/, { success: false, error: String(error_4) }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sendEmailImmediately = sendEmailImmediately;
exports.emailQueueRouter = trpc_1.router({
    /**
     * Get queue status and stats
     */
    getStatus: trpc_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, rows, stats, _i, rows_1, r, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        return [2 /*return*/, { pending: 0, failed: 0, sent: 0, retrying: 0 }];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select({ status: schema_1.emailQueue.status, count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(schema_1.emailQueue)
                            .groupBy(schema_1.emailQueue.status)];
                case 3:
                    rows = _a.sent();
                    stats = { pending: 0, failed: 0, sent: 0, retrying: 0 };
                    for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        r = rows_1[_i];
                        stats[r.status] = Number(r.count);
                    }
                    return [2 /*return*/, stats];
                case 4:
                    error_5 = _a.sent();
                    console.error("[EMAIL QUEUE] Error getting status:", error_5);
                    return [2 /*return*/, { pending: 0, failed: 0, sent: 0, retrying: 0 }];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get queue entries (admin view)
     */
    getQueue: trpc_1.createFeatureRestrictedProcedure("communications:email_queue")
        .input(zod_1.z.object({
        status: zod_1.z["enum"](["pending", "sent", "failed", "retrying"]).optional(),
        limit: zod_1.z.number()["default"](50),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, entries, countResult, total, error_6;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db) {
                            return [2 /*return*/, { entries: [], total: 0 }];
                        }
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 5, , 6]);
                        conditions = [];
                        if (input.status)
                            conditions.push(drizzle_orm_1.eq(schema_1.emailQueue.status, input.status));
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.emailQueue)
                                .where(conditions.length === 1 ? conditions[0] : undefined)
                                .orderBy(drizzle_orm_1.desc(schema_1.emailQueue.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 3:
                        entries = _d.sent();
                        return [4 /*yield*/, db
                                .select({ count: drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                                .from(schema_1.emailQueue)
                                .where(conditions.length === 1 ? conditions[0] : undefined)];
                    case 4:
                        countResult = _d.sent();
                        total = Number((_c = (_b = countResult[0]) === null || _b === void 0 ? void 0 : _b.count) !== null && _c !== void 0 ? _c : 0);
                        return [2 /*return*/, { entries: entries, total: total }];
                    case 5:
                        error_6 = _d.sent();
                        console.error("[EMAIL QUEUE] Error getting queue entries:", error_6);
                        return [2 /*return*/, { entries: [], total: 0 }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Manually process queue (admin trigger)
     */
    processQueue: trpc_1.createFeatureRestrictedProcedure("communications:email_queue").mutation(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var result;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // Check admin/system role
                        if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== "admin" && ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "super_admin" && ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.role) !== "system") {
                            throw new Error("Unauthorized - admin only");
                        }
                        return [4 /*yield*/, processEmailQueue()];
                    case 1:
                        result = _e.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }),
    /**
     * Retry a specific failed email
     */
    retryEmail: trpc_1.createFeatureRestrictedProcedure("communications:email_queue")
        .input(zod_1.z.object({ emailId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, error_7;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role) !== "admin" && ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "super_admin") {
                            throw new Error("Unauthorized - admin only");
                        }
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db) {
                            return [2 /*return*/, { success: false, error: "Database not available" }];
                        }
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        // Reset to pending for retry
                        return [4 /*yield*/, db.update(schema_1.emailQueue)
                                .set({ status: "pending", attempts: 0, errorMessage: null, nextRetryAt: null })
                                .where(drizzle_orm_1.eq(schema_1.emailQueue.id, input.emailId))];
                    case 3:
                        // Reset to pending for retry
                        _d.sent();
                        console.log("[EMAIL QUEUE] Email " + input.emailId + " marked for retry");
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_7 = _d.sent();
                        return [2 /*return*/, { success: false, error: String(error_7) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get email logs for auditing
     */
    getLogs: trpc_1.createFeatureRestrictedProcedure("communications:email_queue")
        .input(zod_1.z.object({
        status: zod_1.z["enum"](["sent", "failed"]).optional(),
        limit: zod_1.z.number()["default"](100),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, logs, countResult, total, error_8;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db) {
                            return [2 /*return*/, { logs: [], total: 0 }];
                        }
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 5, , 6]);
                        conditions = [];
                        if (input.status)
                            conditions.push(drizzle_orm_1.eq(schema_1.emailLog.status, input.status));
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.emailLog)
                                .where(conditions.length === 1 ? conditions[0] : undefined)
                                .orderBy(drizzle_orm_1.desc(schema_1.emailLog.sentAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 3:
                        logs = _d.sent();
                        return [4 /*yield*/, db
                                .select({ count: drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                                .from(schema_1.emailLog)
                                .where(conditions.length === 1 ? conditions[0] : undefined)];
                    case 4:
                        countResult = _d.sent();
                        total = Number((_c = (_b = countResult[0]) === null || _b === void 0 ? void 0 : _b.count) !== null && _c !== void 0 ? _c : 0);
                        return [2 /*return*/, { logs: logs, total: total }];
                    case 5:
                        error_8 = _d.sent();
                        console.error("[EMAIL QUEUE] Error getting logs:", error_8);
                        return [2 /*return*/, { logs: [], total: 0 }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1, templateObject_2, templateObject_3;
