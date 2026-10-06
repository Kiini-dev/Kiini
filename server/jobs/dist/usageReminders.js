"use strict";
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
exports.sendUsageReminders = void 0;
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var mail_1 = require("../_core/mail");
var emailTemplates_1 = require("../_core/emailTemplates");
/**
 * Usage Reminder Email Scheduler
 * Sends periodic reminder emails to app users encouraging them to:
 * - Create their first client (if none exist)
 * - Create invoices (if none in the last 30 days)
 * - Complete company profile settings
 *
 * Runs weekly (called from scheduler.ts). Respects a per-user
 * "last_usage_reminder" setting to avoid spamming.
 */
var REMINDER_COOLDOWN_DAYS = 7; // Don't re-send within this window
function sendUsageReminders() {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, Promise, function () {
        var result, db, reminderRows, companyRows, company_1, appName, activeUsers, cutoff, cutoffStr, _i, activeUsers_1, user, lastSentRows, orgFilter, clientCount, thirtyDaysAgo, thirtyDaysStr, invoiceCount, tips, tipsHtml, emailPayload, now, err_1, err_2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    result = { sent: 0, skipped: 0, errors: 0 };
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 19, , 20]);
                    return [4 /*yield*/, db_1.getDb()];
                case 2:
                    db = _e.sent();
                    if (!db)
                        return [2 /*return*/, __assign(__assign({}, result), { errors: 1 })];
                    return [4 /*yield*/, db.select().from(schema_1.settings)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.settings.category, 'notifications'), drizzle_orm_1.eq(schema_1.settings.key, 'usageReminders')))
                            .limit(1)];
                case 3:
                    reminderRows = _e.sent();
                    if (((_a = reminderRows[0]) === null || _a === void 0 ? void 0 : _a.value) === 'false') {
                        return [2 /*return*/, result]; // Disabled
                    }
                    return [4 /*yield*/, db.select().from(schema_1.settings).where(drizzle_orm_1.eq(schema_1.settings.category, 'company'))];
                case 4:
                    companyRows = _e.sent();
                    company_1 = {};
                    companyRows.forEach(function (s) { var _a; if (s.key)
                        company_1[s.key] = (_a = s.value) !== null && _a !== void 0 ? _a : ''; });
                    appName = company_1.name || 'CRM';
                    return [4 /*yield*/, db.select({
                            id: schema_1.users.id,
                            name: schema_1.users.name,
                            email: schema_1.users.email,
                            role: schema_1.users.role,
                            organizationId: schema_1.users.organizationId
                        }).from(schema_1.users)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.users.isActive, 1), drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " NOT IN ('client')"], ["", " NOT IN ('client')"])), schema_1.users.role)))];
                case 5:
                    activeUsers = _e.sent();
                    cutoff = new Date();
                    cutoff.setDate(cutoff.getDate() - REMINDER_COOLDOWN_DAYS);
                    cutoffStr = cutoff.toISOString().slice(0, 19).replace('T', ' ');
                    _i = 0, activeUsers_1 = activeUsers;
                    _e.label = 6;
                case 6:
                    if (!(_i < activeUsers_1.length)) return [3 /*break*/, 18];
                    user = activeUsers_1[_i];
                    _e.label = 7;
                case 7:
                    _e.trys.push([7, 16, , 17]);
                    if (!user.email) {
                        result.skipped++;
                        return [3 /*break*/, 17];
                    }
                    return [4 /*yield*/, db.select().from(schema_1.settings)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.settings.category, 'usage_reminders'), drizzle_orm_1.eq(schema_1.settings.key, user.id))).limit(1)];
                case 8:
                    lastSentRows = _e.sent();
                    if (((_b = lastSentRows[0]) === null || _b === void 0 ? void 0 : _b.value) && lastSentRows[0].value > cutoffStr) {
                        result.skipped++;
                        return [3 /*break*/, 17];
                    }
                    orgFilter = user.organizationId
                        ? drizzle_orm_1.eq(schema_1.clients.organizationId, user.organizationId)
                        : drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["1=1"], ["1=1"])));
                    return [4 /*yield*/, db.select({ count: drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                            .from(schema_1.clients)
                            .where(orgFilter)];
                case 9:
                    clientCount = (_e.sent())[0];
                    thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    thirtyDaysStr = thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ');
                    return [4 /*yield*/, db.select({ count: drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.invoices.createdAt, thirtyDaysStr), user.organizationId ? drizzle_orm_1.eq(schema_1.invoices.organizationId, user.organizationId) : drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["1=1"], ["1=1"])))))];
                case 10:
                    invoiceCount = (_e.sent())[0];
                    tips = [];
                    if (Number((_c = clientCount === null || clientCount === void 0 ? void 0 : clientCount.count) !== null && _c !== void 0 ? _c : 0) === 0) {
                        tips.push('Add your first client to start managing contacts and sending invoices.');
                    }
                    if (Number((_d = invoiceCount === null || invoiceCount === void 0 ? void 0 : invoiceCount.count) !== null && _d !== void 0 ? _d : 0) === 0) {
                        tips.push('Create an invoice to get paid faster – you haven\'t sent one in the last 30 days.');
                    }
                    if (!company_1.name) {
                        tips.push('Complete your company profile in Settings so your documents look professional.');
                    }
                    // Only send if there are actionable tips
                    if (tips.length === 0) {
                        result.skipped++;
                        return [3 /*break*/, 17];
                    }
                    tipsHtml = "<ul style=\"margin: 16px 0; padding-left: 0; list-style: none;\">" + tips.map(function (t) {
                        return "<li style=\"padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 14px; font-family: Arial, sans-serif;\">\n            <span style=\"color: #4F46E5; font-weight: bold; margin-right: 8px;\">\u2192</span>" + t + "\n          </li>";
                    }).join('') + "</ul>";
                    emailPayload = emailTemplates_1.notificationEmail({
                        title: 'Boost your productivity this week',
                        recipientName: user.name || 'there',
                        message: "<p style=\"margin: 0 0 16px; color: #374151; font-size: 15px;\">Here are some quick actions to help you get the most out of <strong>" + appName + "</strong>:</p>" + tipsHtml + "<p style=\"margin: 16px 0 0; color: #9ca3af; font-size: 13px;\">You can disable these reminders in <strong>Settings \u2192 Notifications</strong>.</p>",
                        branding: { companyName: appName }
                    });
                    return [4 /*yield*/, mail_1.sendEmail({
                            to: user.email,
                            subject: emailPayload.subject,
                            html: emailPayload.html,
                            text: emailPayload.text
                        })];
                case 11:
                    _e.sent();
                    now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    if (!lastSentRows[0]) return [3 /*break*/, 13];
                    return [4 /*yield*/, db.update(schema_1.settings)
                            .set({ value: now })
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.settings.category, 'usage_reminders'), drizzle_orm_1.eq(schema_1.settings.key, user.id)))];
                case 12:
                    _e.sent();
                    return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, db.insert(schema_1.settings).values({
                        id: crypto.randomUUID(),
                        category: 'usage_reminders',
                        key: user.id,
                        value: now
                    })];
                case 14:
                    _e.sent();
                    _e.label = 15;
                case 15:
                    result.sent++;
                    return [3 /*break*/, 17];
                case 16:
                    err_1 = _e.sent();
                    console.error("[USAGE_REMINDERS] Error processing user " + user.id + ":", err_1);
                    result.errors++;
                    return [3 /*break*/, 17];
                case 17:
                    _i++;
                    return [3 /*break*/, 6];
                case 18: return [3 /*break*/, 20];
                case 19:
                    err_2 = _e.sent();
                    console.error('[USAGE_REMINDERS] Fatal error:', err_2);
                    result.errors++;
                    return [3 /*break*/, 20];
                case 20: return [2 /*return*/, result];
            }
        });
    });
}
exports.sendUsageReminders = sendUsageReminders;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
