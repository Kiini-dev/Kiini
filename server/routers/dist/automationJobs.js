"use strict";
/**
 * Automation Jobs Router
 *
 * Manages scheduled and manual triggers for automation jobs like:
 * - Recurring invoice generation
 * - Payment reminders
 * - Overdue notifications
 * - Other automated workflows
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
exports.automationJobsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var recurringInvoicesJob_1 = require("../jobs/recurringInvoicesJob");
var db_1 = require("../db");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("tools:automation");
exports.automationJobsRouter = trpc_1.router({
    /**
     * Generate due recurring invoices (can be triggered manually or by cron)
     */
    generateRecurringInvoices: trpc_1.publicProcedure
        .input(zod_1.z.object({
        apiKey: zod_1.z.string().optional()
    }).optional())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var expectedKey, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Verify API key if provided (for external cron triggers)
                        if (input === null || input === void 0 ? void 0 : input.apiKey) {
                            expectedKey = process.env.CRON_API_KEY;
                            if (!expectedKey || input.apiKey !== expectedKey) {
                                return [2 /*return*/, {
                                        success: false,
                                        message: "Unauthorized",
                                        invoicesGenerated: 0,
                                        invoiceIds: [],
                                        errors: ["Invalid API key"]
                                    }];
                            }
                        }
                        else if (!ctx.user || !["super_admin", "admin"].includes(ctx.user.role)) {
                            // Require admin role for authenticated calls
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Unauthorized",
                                    invoicesGenerated: 0,
                                    invoiceIds: [],
                                    errors: ["Admin access required"]
                                }];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, recurringInvoicesJob_1.generateDueRecurringInvoices()];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                message: "Failed to generate recurring invoices",
                                invoicesGenerated: 0,
                                invoiceIds: [],
                                errors: [error_1 instanceof Error ? error_1.message : String(error_1)]
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get automation job status and last run time
     */
    getJobStatus: readProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, activityLog, _a, eq, desc, lastRun, lastRunTime, now, nextRun, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _b.sent();
                    if (!db) {
                        return [2 /*return*/, {
                                recurringInvoices: {
                                    lastRun: null,
                                    nextScheduledRun: null,
                                    status: "unknown"
                                }
                            }];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 3:
                    activityLog = (_b.sent()).activityLog;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                case 4:
                    _a = _b.sent(), eq = _a.eq, desc = _a.desc;
                    return [4 /*yield*/, db.select()
                            .from(activityLog)
                            .where(eq(activityLog.action, "recurring_invoice_generated"))
                            .orderBy(desc(activityLog.createdAt))
                            .limit(1)];
                case 5:
                    lastRun = _b.sent();
                    lastRunTime = lastRun.length > 0 ? lastRun[0].createdAt : null;
                    now = new Date();
                    nextRun = new Date(now);
                    nextRun.setDate(nextRun.getDate() + 1);
                    nextRun.setHours(2, 0, 0, 0);
                    return [2 /*return*/, {
                            recurringInvoices: {
                                lastRun: lastRunTime,
                                nextScheduledRun: nextRun.toISOString(),
                                status: lastRunTime ? "active" : "pending"
                            }
                        }];
                case 6:
                    error_2 = _b.sent();
                    console.error("Error getting job status:", error_2);
                    return [2 /*return*/, {
                            recurringInvoices: {
                                lastRun: null,
                                nextScheduledRun: null,
                                status: "error"
                            }
                        }];
                case 7: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Send payment reminders for overdue invoices
     */
    sendPaymentReminders: readProcedure
        .input(zod_1.z.object({
        daysOverdue: zod_1.z.number()["default"](7).optional()
    }).optional())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, _b, invoices, clients, notifications, _c, eq, ne, lt, and, uuidv4, daysOverdue, cutoffDate, cutoffStr, overdueInvoices, remindersSent, _i, overdueInvoices_1, inv, paid, total, remaining, notifId, now, err_1, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _d.sent();
                        if (!db) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Database not available",
                                    remindersSent: 0
                                }];
                        }
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 13, , 14]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 3:
                        _b = _d.sent(), invoices = _b.invoices, clients = _b.clients, notifications = _b.notifications;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 4:
                        _c = _d.sent(), eq = _c.eq, ne = _c.ne, lt = _c.lt, and = _c.and;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("uuid"); })];
                    case 5:
                        uuidv4 = (_d.sent()).v4;
                        daysOverdue = (input === null || input === void 0 ? void 0 : input.daysOverdue) || 7;
                        cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);
                        cutoffStr = cutoffDate.toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.select()
                                .from(invoices)
                                .innerJoin(clients, eq(invoices.clientId, clients.id))
                                .where(and(lt(invoices.dueDate, cutoffStr), ne(invoices.status, 'paid'), ne(invoices.status, 'cancelled')))];
                    case 6:
                        overdueInvoices = _d.sent();
                        remindersSent = 0;
                        _i = 0, overdueInvoices_1 = overdueInvoices;
                        _d.label = 7;
                    case 7:
                        if (!(_i < overdueInvoices_1.length)) return [3 /*break*/, 12];
                        inv = overdueInvoices_1[_i];
                        _d.label = 8;
                    case 8:
                        _d.trys.push([8, 10, , 11]);
                        paid = inv.invoices.paidAmount || 0;
                        total = inv.invoices.total || 0;
                        remaining = total - paid;
                        if (remaining <= 0)
                            return [3 /*break*/, 11];
                        notifId = uuidv4();
                        now = new Date().toISOString().replace('T', ' ').substring(0, 19);
                        return [4 /*yield*/, db.insert(notifications).values({
                                id: notifId,
                                userId: inv.invoices.createdBy || "system",
                                title: "Payment Reminder: Invoice " + inv.invoices.invoiceNumber + " Overdue",
                                message: "Invoice " + inv.invoices.invoiceNumber + " for " + inv.clients.companyName + " is overdue. Remaining balance: KES " + remaining,
                                type: "warning",
                                category: "invoice_overdue",
                                entityType: "invoice",
                                entityId: inv.invoices.id,
                                actionUrl: "/invoices/" + inv.invoices.id,
                                isRead: 0,
                                priority: "high",
                                createdAt: now
                            })];
                    case 9:
                        _d.sent();
                        remindersSent++;
                        return [3 /*break*/, 11];
                    case 10:
                        err_1 = _d.sent();
                        console.warn("Error sending reminder for invoice:", err_1);
                        return [3 /*break*/, 11];
                    case 11:
                        _i++;
                        return [3 /*break*/, 7];
                    case 12: return [2 /*return*/, {
                            success: true,
                            message: "Sent " + remindersSent + " payment reminder(s)",
                            remindersSent: remindersSent
                        }];
                    case 13:
                        error_3 = _d.sent();
                        console.error("Error in sendPaymentReminders:", error_3);
                        return [2 /*return*/, {
                                success: false,
                                message: "Failed to send payment reminders",
                                remindersSent: 0
                            }];
                    case 14: return [2 /*return*/];
                }
            });
        });
    })
});
