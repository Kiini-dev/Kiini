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
exports.auditLogsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
exports.auditLogsRouter = trpc_1.router({
    list: enhancedRbac_1.createFeatureRestrictedProcedure("admin:audit-logs:view")
        .input(zod_1.z.object({
        limit: zod_1.z.number().optional()["default"](50),
        offset: zod_1.z.number().optional()["default"](0),
        severity: zod_1.z["enum"](["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional()["default"]("ALL"),
        dateRange: zod_1.z["enum"](["24h", "7d", "30d", "90d"]).optional()["default"]("7d"),
        actionFilter: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var _b = _a.input, input = _b === void 0 ? {} : _b;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, dateFilter, now, whereConditions, finalWhere, logs, countResult, total, enrichedLogs, stats, err_1;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db) {
                            console.error("[AuditLogs] Database connection not available");
                            return [2 /*return*/, {
                                    logs: [],
                                    total: 0,
                                    stats: {
                                        totalEvents: 0,
                                        criticalEvents: 0,
                                        failedAttempts: 0,
                                        successfulActions: 0
                                    }
                                }];
                        }
                        dateFilter = null;
                        now = new Date();
                        switch (input.dateRange) {
                            case "24h":
                                dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                                break;
                            case "7d":
                                dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                break;
                            case "30d":
                                dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                                break;
                            case "90d":
                                dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                                break;
                        }
                        whereConditions = [];
                        if (dateFilter) {
                            whereConditions.push(drizzle_orm_1.gte(schema_1.activityLog.createdAt, dateFilter.toISOString()));
                        }
                        if (input.actionFilter) {
                            whereConditions.push(drizzle_orm_1.eq(schema_1.activityLog.action, input.actionFilter));
                        }
                        finalWhere = whereConditions.length > 0 ? drizzle_orm_1.and.apply(void 0, whereConditions) : undefined;
                        return [4 /*yield*/, db
                                .select({
                                id: schema_1.activityLog.id,
                                timestamp: schema_1.activityLog.createdAt,
                                userId: schema_1.activityLog.userId,
                                userName: schema_1.users.name,
                                userEmail: schema_1.users.email,
                                action: schema_1.activityLog.action,
                                resourceType: schema_1.activityLog.entityType,
                                resourceId: schema_1.activityLog.entityId,
                                ipAddress: schema_1.activityLog.ipAddress,
                                changes: schema_1.activityLog.description
                            })
                                .from(schema_1.activityLog)
                                .leftJoin(schema_1.users, drizzle_orm_1.eq(schema_1.activityLog.userId, schema_1.users.id))
                                .where(finalWhere)
                                .orderBy(drizzle_orm_1.desc(schema_1.activityLog.createdAt))
                                .limit(input.limit)
                                .offset(input.offset)];
                    case 2:
                        logs = _e.sent();
                        return [4 /*yield*/, db
                                .select({ count: drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))).as('count') })
                                .from(schema_1.activityLog)
                                .where(finalWhere)];
                    case 3:
                        countResult = _e.sent();
                        total = Number((_d = (_c = countResult[0]) === null || _c === void 0 ? void 0 : _c.count) !== null && _d !== void 0 ? _d : 0);
                        enrichedLogs = logs.map(function (log) {
                            var severity = "LOW";
                            if (log.action.includes("Delete") ||
                                log.action.includes("Permission") ||
                                log.action.includes("Role") ||
                                log.action.includes("Admin")) {
                                severity = "CRITICAL";
                            }
                            else if (log.action.includes("Update") ||
                                log.action.includes("Modify") ||
                                log.action.includes("Edit")) {
                                severity = "HIGH";
                            }
                            else if (log.action.includes("Failed")) {
                                severity = "MEDIUM";
                            }
                            return __assign(__assign({}, log), { user: log.userName || log.userEmail || log.userId, userName: log.userName || null, userEmail: log.userEmail || null, severity: severity, status: log.action.includes("Failed") ? "FAILED" : "SUCCESS" });
                        });
                        stats = {
                            totalEvents: total,
                            criticalEvents: enrichedLogs.filter(function (l) { return l.severity === "CRITICAL"; }).length,
                            failedAttempts: enrichedLogs.filter(function (l) { return l.status === "FAILED"; }).length,
                            successfulActions: enrichedLogs.filter(function (l) { return l.status === "SUCCESS"; }).length
                        };
                        return [2 /*return*/, {
                                logs: enrichedLogs,
                                total: total,
                                stats: stats
                            }];
                    case 4:
                        err_1 = _e.sent();
                        console.error("[AuditLogs] Error fetching logs:", err_1);
                        return [2 /*return*/, {
                                logs: [],
                                total: 0,
                                stats: {
                                    totalEvents: 0,
                                    criticalEvents: 0,
                                    failedAttempts: 0,
                                    successfulActions: 0
                                }
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    getStats: enhancedRbac_1.createFeatureRestrictedProcedure("admin:audit-logs:view")
        .input(zod_1.z.object({
        dateRange: zod_1.z["enum"](["24h", "7d", "30d", "90d"]).optional()["default"]("7d")
    }).optional())
        .query(function (_a) {
        var _b = _a.input, input = _b === void 0 ? {} : _b;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, dateFilter, now, logs, criticalCount, failedCount, err_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db) {
                            return [2 /*return*/, {
                                    totalEvents: 0,
                                    criticalEvents: 0,
                                    failedAttempts: 0,
                                    successfulActions: 0
                                }];
                        }
                        dateFilter = null;
                        now = new Date();
                        switch (input.dateRange) {
                            case "24h":
                                dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                                break;
                            case "7d":
                                dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                break;
                            case "30d":
                                dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                                break;
                            case "90d":
                                dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                                break;
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.activityLog)
                                .where(dateFilter ? drizzle_orm_1.gte(schema_1.activityLog.createdAt, dateFilter.toISOString()) : undefined)];
                    case 2:
                        logs = _c.sent();
                        criticalCount = logs.filter(function (l) {
                            return l.action.includes("Delete") ||
                                l.action.includes("delete") ||
                                l.action.includes("Permission") ||
                                l.action.includes("Role");
                        }).length;
                        failedCount = logs.filter(function (l) { return l.action.includes("Failed") || l.action.includes("failed"); }).length;
                        return [2 /*return*/, {
                                totalEvents: logs.length,
                                criticalEvents: criticalCount,
                                failedAttempts: failedCount,
                                successfulActions: logs.length - failedCount
                            }];
                    case 3:
                        err_2 = _c.sent();
                        console.error("[AuditLogs] Error fetching stats:", err_2);
                        return [2 /*return*/, {
                                totalEvents: 0,
                                criticalEvents: 0,
                                failedAttempts: 0,
                                successfulActions: 0
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    "export": enhancedRbac_1.createFeatureRestrictedProcedure("admin:audit-logs:export")
        .input(zod_1.z.object({
        dateRange: zod_1.z["enum"](["24h", "7d", "30d", "90d"]).optional()["default"]("7d")
    }).optional())
        .query(function (_a) {
        var _b = _a.input, input = _b === void 0 ? {} : _b;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, dateFilter, now, logs, err_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        dateFilter = null;
                        now = new Date();
                        switch (input === null || input === void 0 ? void 0 : input.dateRange) {
                            case "24h":
                                dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                                break;
                            case "7d":
                                dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                break;
                            case "30d":
                                dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                                break;
                            case "90d":
                                dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                                break;
                        }
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.activityLog)
                                .where(dateFilter ? drizzle_orm_1.gte(schema_1.activityLog.createdAt, dateFilter.toISOString()) : undefined)
                                .orderBy(drizzle_orm_1.desc(schema_1.activityLog.createdAt))];
                    case 2:
                        logs = _c.sent();
                        return [2 /*return*/, logs.map(function (log) { return ({
                                timestamp: log.createdAt,
                                user: log.userId,
                                action: log.action,
                                resourceType: log.entityType,
                                resourceId: log.entityId,
                                ipAddress: log.ipAddress,
                                status: log.action.includes("Failed") || log.action.includes("failed") ? "FAILED" : "SUCCESS"
                            }); })];
                    case 3:
                        err_3 = _c.sent();
                        console.error("[AuditLogs] Error exporting logs:", err_3);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1;
