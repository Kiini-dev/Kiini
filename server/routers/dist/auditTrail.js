"use strict";
/**
 * Activity & Audit Trail Router
 *
 * Activity tracking and audit logging with real data from activityLog table.
 * Enhanced with organization isolation and enterprise audit capabilities.
 */
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
exports.auditTrailRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
// Feature-based procedures
var auditViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('audit:view');
var auditEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('audit:edit');
// Org-scoped audit procedure for organization admins
var orgAuditViewProcedure = auditViewProcedure
    .use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (!ctx.user.organizationId && ctx.user.role !== 'super_admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Organization access required for audit logs'
        });
    }
    return next({ ctx: ctx });
});
// Helper function to generate compliance recommendations
function generateComplianceRecommendations(reportType, activities) {
    var recommendations = [];
    switch (reportType) {
        case 'gdpr':
            if (activities.filter(function (a) { return a.action === 'data_deletion'; }).length === 0) {
                recommendations.push('Implement regular data deletion procedures for user data removal requests');
            }
            if (activities.filter(function (a) { return a.action.includes('consent'); }).length === 0) {
                recommendations.push('Establish user consent tracking for data processing activities');
            }
            break;
        case 'sox':
            if (activities.filter(function (a) { return a.action === 'financial_record_modified'; }).length === 0) {
                recommendations.push('Enhance financial record modification tracking');
            }
            if (activities.filter(function (a) { return a.action === 'audit_log_accessed'; }).length === 0) {
                recommendations.push('Implement audit log access monitoring');
            }
            break;
        case 'hipaa':
            if (activities.filter(function (a) { return a.action === 'patient_data_accessed'; }).length === 0) {
                recommendations.push('Add patient data access logging');
            }
            break;
        default:
            if (activities.length < 10) {
                recommendations.push('Increase audit logging coverage across system activities');
            }
    }
    if (recommendations.length === 0) {
        recommendations.push('Audit logging appears comprehensive for this compliance framework');
    }
    return recommendations;
}
exports.auditTrailRouter = trpc_1.router({
    /**
     * Get activity log for a specific entity
     */
    getEntityActivityLog: auditViewProcedure
        .input(zod_1.z.object({
        entityType: zod_1.z.string(),
        entityId: zod_1.z.number(),
        limit: zod_1.z.number().min(1).max(100)["default"](20),
        offset: zod_1.z.number().min(0)["default"](0)
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, countResult, total, activities, error_1;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT * FROM activityLog WHERE entityType = ", " AND entityId = ", " ORDER BY createdAt DESC LIMIT ", " OFFSET ", ""], ["SELECT * FROM activityLog WHERE entityType = ", " AND entityId = ", " ORDER BY createdAt DESC LIMIT ", " OFFSET ", ""])), input.entityType, String(input.entityId), input.limit, input.offset))];
                    case 2:
                        rows = (_e.sent())[0];
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT COUNT(*) as total FROM activityLog WHERE entityType = ", " AND entityId = ", ""], ["SELECT COUNT(*) as total FROM activityLog WHERE entityType = ", " AND entityId = ", ""])), input.entityType, String(input.entityId)))];
                    case 3:
                        countResult = (_e.sent())[0];
                        total = (_d = (_c = (_b = countResult) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.total) !== null && _d !== void 0 ? _d : 0;
                        activities = (rows || []).map(function (row) { return ({
                            id: row.id,
                            timestamp: row.createdAt,
                            userId: row.userId,
                            userName: row.userId,
                            action: row.action,
                            description: row.description,
                            changes: row.metadata ? JSON.parse(row.metadata) : null,
                            ipAddress: row.ipAddress
                        }); });
                        return [2 /*return*/, {
                                entityType: input.entityType,
                                entityId: input.entityId,
                                activities: activities,
                                total: total,
                                offset: input.offset,
                                limit: input.limit
                            }];
                    case 4:
                        error_1 = _e.sent();
                        console.error('Error in getEntityActivityLog:', error_1);
                        return [2 /*return*/, { entityType: input.entityType, entityId: input.entityId, activities: [], total: 0, offset: input.offset, limit: input.limit }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get user activity timeline
     */
    getUserActivityTimeline: auditViewProcedure
        .input(zod_1.z.object({
        userId: zod_1.z.number(),
        dateRange: zod_1.z.object({
            start: zod_1.z.string(),
            end: zod_1.z.string()
        }).optional(),
        actionType: zod_1.z.string().optional(),
        limit: zod_1.z.number().min(1).max(100)["default"](30)
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, whereClause, rows, statsRows, statsData, todayRows, todaysActivities, activities, error_2;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        conditions = [drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["userId = ", ""], ["userId = ", ""])), String(input.userId))];
                        if (input.dateRange) {
                            conditions.push(drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["createdAt >= ", ""], ["createdAt >= ", ""])), input.dateRange.start));
                            conditions.push(drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["createdAt <= ", ""], ["createdAt <= ", ""])), input.dateRange.end));
                        }
                        if (input.actionType) {
                            conditions.push(drizzle_orm_1.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["action = ", ""], ["action = ", ""])), input.actionType));
                        }
                        whereClause = drizzle_orm_1.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["WHERE ", ""], ["WHERE ", ""])), drizzle_orm_1.sql.join(conditions, drizzle_orm_1.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject([" AND "], [" AND "])))));
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["SELECT * FROM activityLog ", " ORDER BY createdAt DESC LIMIT ", ""], ["SELECT * FROM activityLog ", " ORDER BY createdAt DESC LIMIT ", ""])), whereClause, input.limit))];
                    case 2:
                        rows = (_f.sent())[0];
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["SELECT COUNT(*) as totalActivities, MAX(createdAt) as lastActive FROM activityLog WHERE userId = ", ""], ["SELECT COUNT(*) as totalActivities, MAX(createdAt) as lastActive FROM activityLog WHERE userId = ", ""])), String(input.userId)))];
                    case 3:
                        statsRows = (_f.sent())[0];
                        statsData = ((_b = statsRows) === null || _b === void 0 ? void 0 : _b[0]) || {};
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["SELECT COUNT(*) as cnt FROM activityLog WHERE userId = ", " AND createdAt >= CURDATE()"], ["SELECT COUNT(*) as cnt FROM activityLog WHERE userId = ", " AND createdAt >= CURDATE()"])), String(input.userId)))];
                    case 4:
                        todayRows = (_f.sent())[0];
                        todaysActivities = (_e = (_d = (_c = todayRows) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.cnt) !== null && _e !== void 0 ? _e : 0;
                        activities = (rows || []).map(function (row) { return ({
                            id: row.id,
                            timestamp: row.createdAt,
                            action: row.action,
                            entityType: row.entityType,
                            entityId: row.entityId,
                            description: row.description,
                            status: 'success',
                            duration: 0
                        }); });
                        return [2 /*return*/, {
                                userId: input.userId,
                                activities: activities,
                                stats: {
                                    totalActivities: Number(statsData.totalActivities || 0),
                                    todaysActivities: Number(todaysActivities),
                                    successRate: 100,
                                    lastActive: statsData.lastActive || null
                                }
                            }];
                    case 5:
                        error_2 = _f.sent();
                        console.error('Error in getUserActivityTimeline:', error_2);
                        return [2 /*return*/, { userId: input.userId, activities: [], stats: { totalActivities: 0, todaysActivities: 0, successRate: 0, lastActive: null } }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get change history for a record
     */
    getChangeHistory: auditViewProcedure
        .input(zod_1.z.object({
        entityType: zod_1.z.string(),
        entityId: zod_1.z.number()
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, entries, versions, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_12 || (templateObject_12 = __makeTemplateObject(["SELECT * FROM activityLog WHERE entityType = ", " AND entityId = ", " ORDER BY createdAt ASC"], ["SELECT * FROM activityLog WHERE entityType = ", " AND entityId = ", " ORDER BY createdAt ASC"])), input.entityType, String(input.entityId)))];
                    case 2:
                        rows = (_b.sent())[0];
                        entries = rows || [];
                        versions = entries.map(function (row, idx) { return ({
                            version: idx + 1,
                            timestamp: row.createdAt,
                            changedBy: row.userId,
                            action: row.action,
                            description: row.description,
                            changes: row.metadata ? JSON.parse(row.metadata) : {}
                        }); });
                        return [2 /*return*/, {
                                entityType: input.entityType,
                                entityId: input.entityId,
                                versions: versions,
                                currentVersion: versions.length,
                                totalVersions: versions.length
                            }];
                    case 3:
                        error_3 = _b.sent();
                        console.error('Error in getChangeHistory:', error_3);
                        return [2 /*return*/, { entityType: input.entityType, entityId: input.entityId, versions: [], currentVersion: 0, totalVersions: 0 }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get audit trail summary and statistics
     */
    getAuditStatistics: auditViewProcedure
        .input(zod_1.z.object({
        dateRange: zod_1.z.object({
            start: zod_1.z.string(),
            end: zod_1.z.string()
        }).optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, dateFilter, summaryRows, summary, byActionRows, byAction, _i, _b, row, byEntityRows, byEntityType, _c, _d, row, topUserRows, totalAct_1, topUsers, error_4;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _f.sent();
                        dateFilter = input.dateRange
                            ? drizzle_orm_1.sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["WHERE createdAt >= ", " AND createdAt <= ", ""], ["WHERE createdAt >= ", " AND createdAt <= ", ""])), input.dateRange.start, input.dateRange.end) : drizzle_orm_1.sql(templateObject_14 || (templateObject_14 = __makeTemplateObject([""], [""])));
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_15 || (templateObject_15 = __makeTemplateObject(["SELECT COUNT(*) as totalActivities, COUNT(DISTINCT userId) as uniqueUsers FROM activityLog ", ""], ["SELECT COUNT(*) as totalActivities, COUNT(DISTINCT userId) as uniqueUsers FROM activityLog ", ""])), dateFilter))];
                    case 2:
                        summaryRows = (_f.sent())[0];
                        summary = ((_e = summaryRows) === null || _e === void 0 ? void 0 : _e[0]) || {};
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_16 || (templateObject_16 = __makeTemplateObject(["SELECT action, COUNT(*) as count FROM activityLog ", " GROUP BY action ORDER BY count DESC"], ["SELECT action, COUNT(*) as count FROM activityLog ", " GROUP BY action ORDER BY count DESC"])), dateFilter))];
                    case 3:
                        byActionRows = (_f.sent())[0];
                        byAction = {};
                        for (_i = 0, _b = byActionRows || []; _i < _b.length; _i++) {
                            row = _b[_i];
                            byAction[row.action] = Number(row.count);
                        }
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_17 || (templateObject_17 = __makeTemplateObject(["SELECT entityType, COUNT(*) as count FROM activityLog ", " GROUP BY entityType ORDER BY count DESC"], ["SELECT entityType, COUNT(*) as count FROM activityLog ", " GROUP BY entityType ORDER BY count DESC"])), dateFilter))];
                    case 4:
                        byEntityRows = (_f.sent())[0];
                        byEntityType = {};
                        for (_c = 0, _d = byEntityRows || []; _c < _d.length; _c++) {
                            row = _d[_c];
                            byEntityType[row.entityType || 'other'] = Number(row.count);
                        }
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_18 || (templateObject_18 = __makeTemplateObject(["SELECT userId, COUNT(*) as activityCount FROM activityLog ", " GROUP BY userId ORDER BY activityCount DESC LIMIT 10"], ["SELECT userId, COUNT(*) as activityCount FROM activityLog ", " GROUP BY userId ORDER BY activityCount DESC LIMIT 10"])), dateFilter))];
                    case 5:
                        topUserRows = (_f.sent())[0];
                        totalAct_1 = Number(summary.totalActivities || 0);
                        topUsers = (topUserRows || []).map(function (row) { return ({
                            userName: row.userId,
                            activityCount: Number(row.activityCount),
                            percentage: totalAct_1 > 0 ? Math.round((Number(row.activityCount) / totalAct_1) * 1000) / 10 : 0
                        }); });
                        return [2 /*return*/, {
                                period: input.dateRange,
                                summary: {
                                    totalActivities: totalAct_1,
                                    uniqueUsers: Number(summary.uniqueUsers || 0),
                                    entitiesModified: Object.keys(byEntityType).length,
                                    deletedRecords: byAction['deleted'] || 0,
                                    failedActions: 0,
                                    successRate: 100
                                },
                                byAction: byAction,
                                byEntityType: byEntityType,
                                topUsers: topUsers
                            }];
                    case 6:
                        error_4 = _f.sent();
                        console.error('Error in getAuditStatistics:', error_4);
                        return [2 /*return*/, { summary: { totalActivities: 0, uniqueUsers: 0, entitiesModified: 0, deletedRecords: 0, failedActions: 0, successRate: 0 }, byAction: {}, byEntityType: {}, topUsers: [] }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Search audit log
     */
    searchAuditLog: auditViewProcedure
        .input(zod_1.z.object({
        query: zod_1.z.string(),
        actionType: zod_1.z.string().optional(),
        userId: zod_1.z.number().optional(),
        entityType: zod_1.z.string().optional(),
        limit: zod_1.z.number().min(1).max(100)["default"](20)
    }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, whereClause, rows, results, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        conditions = [drizzle_orm_1.sql(templateObject_19 || (templateObject_19 = __makeTemplateObject(["description LIKE ", ""], ["description LIKE ", ""])), "%" + input.query + "%")];
                        if (input.actionType)
                            conditions.push(drizzle_orm_1.sql(templateObject_20 || (templateObject_20 = __makeTemplateObject(["action = ", ""], ["action = ", ""])), input.actionType));
                        if (input.userId)
                            conditions.push(drizzle_orm_1.sql(templateObject_21 || (templateObject_21 = __makeTemplateObject(["userId = ", ""], ["userId = ", ""])), String(input.userId)));
                        if (input.entityType)
                            conditions.push(drizzle_orm_1.sql(templateObject_22 || (templateObject_22 = __makeTemplateObject(["entityType = ", ""], ["entityType = ", ""])), input.entityType));
                        whereClause = drizzle_orm_1.sql(templateObject_24 || (templateObject_24 = __makeTemplateObject(["WHERE ", ""], ["WHERE ", ""])), drizzle_orm_1.sql.join(conditions, drizzle_orm_1.sql(templateObject_23 || (templateObject_23 = __makeTemplateObject([" AND "], [" AND "])))));
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_25 || (templateObject_25 = __makeTemplateObject(["SELECT * FROM activityLog ", " ORDER BY createdAt DESC LIMIT ", ""], ["SELECT * FROM activityLog ", " ORDER BY createdAt DESC LIMIT ", ""])), whereClause, input.limit))];
                    case 2:
                        rows = (_b.sent())[0];
                        results = (rows || []).map(function (row) { return ({
                            id: row.id,
                            timestamp: row.createdAt,
                            userId: row.userId,
                            userName: row.userId,
                            action: row.action,
                            entityType: row.entityType,
                            entityId: row.entityId,
                            description: row.description
                        }); });
                        return [2 /*return*/, {
                                query: input.query,
                                results: results,
                                total: results.length
                            }];
                    case 3:
                        error_5 = _b.sent();
                        console.error('Error in searchAuditLog:', error_5);
                        return [2 /*return*/, { query: input.query, results: [], total: 0 }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Export audit report
     */
    exportAuditReport: auditViewProcedure
        .input(zod_1.z.object({
        format: zod_1.z["enum"](['pdf', 'excel', 'csv']),
        dateRange: zod_1.z.object({
            start: zod_1.z.string(),
            end: zod_1.z.string()
        }).optional(),
        filters: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, dateFilter, countResult, recordCount, reportData, error_6;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        dateFilter = input.dateRange
                            ? drizzle_orm_1.sql(templateObject_26 || (templateObject_26 = __makeTemplateObject(["WHERE createdAt >= ", " AND createdAt <= ", ""], ["WHERE createdAt >= ", " AND createdAt <= ", ""])), input.dateRange.start, input.dateRange.end) : drizzle_orm_1.sql(templateObject_27 || (templateObject_27 = __makeTemplateObject([""], [""])));
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_28 || (templateObject_28 = __makeTemplateObject(["SELECT COUNT(*) as cnt FROM activityLog ", ""], ["SELECT COUNT(*) as cnt FROM activityLog ", ""])), dateFilter))];
                    case 2:
                        countResult = (_e.sent())[0];
                        recordCount = (_d = (_c = (_b = countResult) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.cnt) !== null && _d !== void 0 ? _d : 0;
                        reportData = {
                            recordCount: recordCount,
                            generatedAt: new Date().toISOString(),
                            filters: input.filters || {}
                        };
                        return [2 /*return*/, reportData];
                    case 3:
                        error_6 = _e.sent();
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to export audit report'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get organization audit log (org-scoped)
     */
    getOrganizationAuditLog: orgAuditViewProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100)["default"](50),
        offset: zod_1.z.number().min(0)["default"](0),
        dateRange: zod_1.z.object({
            start: zod_1.z.string(),
            end: zod_1.z.string()
        }).optional(),
        actionType: zod_1.z.string().optional(),
        userId: zod_1.z.number().optional(),
        entityType: zod_1.z.string().optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, conditions, whereClause, rows, countResult, total, activities, error_7;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        orgId = ctx.user.organizationId;
                        conditions = [];
                        if (ctx.user.role !== 'super_admin') {
                            // For org users, only show activities within their organization
                            conditions.push(drizzle_orm_1.sql(templateObject_29 || (templateObject_29 = __makeTemplateObject(["organizationId = ", ""], ["organizationId = ", ""])), orgId));
                        }
                        if (input.dateRange) {
                            conditions.push(drizzle_orm_1.sql(templateObject_30 || (templateObject_30 = __makeTemplateObject(["createdAt >= ", ""], ["createdAt >= ", ""])), input.dateRange.start));
                            conditions.push(drizzle_orm_1.sql(templateObject_31 || (templateObject_31 = __makeTemplateObject(["createdAt <= ", ""], ["createdAt <= ", ""])), input.dateRange.end));
                        }
                        if (input.actionType) {
                            conditions.push(drizzle_orm_1.sql(templateObject_32 || (templateObject_32 = __makeTemplateObject(["action = ", ""], ["action = ", ""])), input.actionType));
                        }
                        if (input.userId) {
                            conditions.push(drizzle_orm_1.sql(templateObject_33 || (templateObject_33 = __makeTemplateObject(["userId = ", ""], ["userId = ", ""])), String(input.userId)));
                        }
                        if (input.entityType) {
                            conditions.push(drizzle_orm_1.sql(templateObject_34 || (templateObject_34 = __makeTemplateObject(["entityType = ", ""], ["entityType = ", ""])), input.entityType));
                        }
                        whereClause = conditions.length > 0 ? drizzle_orm_1.sql(templateObject_36 || (templateObject_36 = __makeTemplateObject(["WHERE ", ""], ["WHERE ", ""])), drizzle_orm_1.sql.join(conditions, drizzle_orm_1.sql(templateObject_35 || (templateObject_35 = __makeTemplateObject([" AND "], [" AND "]))))) : drizzle_orm_1.sql(templateObject_37 || (templateObject_37 = __makeTemplateObject([""], [""])));
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_38 || (templateObject_38 = __makeTemplateObject(["SELECT * FROM activityLog ", " ORDER BY createdAt DESC LIMIT ", " OFFSET ", ""], ["SELECT * FROM activityLog ", " ORDER BY createdAt DESC LIMIT ", " OFFSET ", ""])), whereClause, input.limit, input.offset))];
                    case 2:
                        rows = (_e.sent())[0];
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_39 || (templateObject_39 = __makeTemplateObject(["SELECT COUNT(*) as total FROM activityLog ", ""], ["SELECT COUNT(*) as total FROM activityLog ", ""])), whereClause))];
                    case 3:
                        countResult = (_e.sent())[0];
                        total = (_d = (_c = (_b = countResult) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.total) !== null && _d !== void 0 ? _d : 0;
                        activities = (rows || []).map(function (row) { return ({
                            id: row.id,
                            timestamp: row.createdAt,
                            userId: row.userId,
                            userName: row.userId,
                            action: row.action,
                            description: row.description,
                            entityType: row.entityType,
                            entityId: row.entityId,
                            changes: row.metadata ? JSON.parse(row.metadata) : null,
                            ipAddress: row.ipAddress,
                            organizationId: row.organizationId
                        }); });
                        return [2 /*return*/, {
                                activities: activities,
                                total: total,
                                offset: input.offset,
                                limit: input.limit,
                                hasMore: (input.offset + input.limit) < total
                            }];
                    case 4:
                        error_7 = _e.sent();
                        console.error('Error in getOrganizationAuditLog:', error_7);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch organization audit log'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get organization audit statistics
     */
    getOrganizationAuditStats: orgAuditViewProcedure
        .input(zod_1.z.object({
        dateRange: zod_1.z.object({
            start: zod_1.z.string(),
            end: zod_1.z.string()
        }).optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, conditions, whereClause, summaryRows, summary, actionRows, byAction, entityRows, byEntity, trendRows, activityTrend, error_8;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        orgId = ctx.user.organizationId;
                        conditions = [];
                        if (ctx.user.role !== 'super_admin') {
                            conditions.push(drizzle_orm_1.sql(templateObject_40 || (templateObject_40 = __makeTemplateObject(["organizationId = ", ""], ["organizationId = ", ""])), orgId));
                        }
                        if (input.dateRange) {
                            conditions.push(drizzle_orm_1.sql(templateObject_41 || (templateObject_41 = __makeTemplateObject(["createdAt >= ", ""], ["createdAt >= ", ""])), input.dateRange.start));
                            conditions.push(drizzle_orm_1.sql(templateObject_42 || (templateObject_42 = __makeTemplateObject(["createdAt <= ", ""], ["createdAt <= ", ""])), input.dateRange.end));
                        }
                        whereClause = conditions.length > 0 ? drizzle_orm_1.sql(templateObject_44 || (templateObject_44 = __makeTemplateObject(["WHERE ", ""], ["WHERE ", ""])), drizzle_orm_1.sql.join(conditions, drizzle_orm_1.sql(templateObject_43 || (templateObject_43 = __makeTemplateObject([" AND "], [" AND "]))))) : drizzle_orm_1.sql(templateObject_45 || (templateObject_45 = __makeTemplateObject([""], [""])));
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_46 || (templateObject_46 = __makeTemplateObject(["SELECT\n            COUNT(*) as totalActivities,\n            COUNT(DISTINCT userId) as activeUsers,\n            COUNT(DISTINCT entityType) as entityTypes,\n            MAX(createdAt) as lastActivity\n          FROM activityLog ", ""], ["SELECT\n            COUNT(*) as totalActivities,\n            COUNT(DISTINCT userId) as activeUsers,\n            COUNT(DISTINCT entityType) as entityTypes,\n            MAX(createdAt) as lastActivity\n          FROM activityLog ", ""])), whereClause))];
                    case 2:
                        summaryRows = (_c.sent())[0];
                        summary = ((_b = summaryRows) === null || _b === void 0 ? void 0 : _b[0]) || {};
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_47 || (templateObject_47 = __makeTemplateObject(["SELECT action, COUNT(*) as count FROM activityLog ", " GROUP BY action ORDER BY count DESC LIMIT 10"], ["SELECT action, COUNT(*) as count FROM activityLog ", " GROUP BY action ORDER BY count DESC LIMIT 10"])), whereClause))];
                    case 3:
                        actionRows = (_c.sent())[0];
                        byAction = (actionRows || []).map(function (row) { return ({
                            action: row.action,
                            count: row.count
                        }); });
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_48 || (templateObject_48 = __makeTemplateObject(["SELECT entityType, COUNT(*) as count FROM activityLog ", " GROUP BY entityType ORDER BY count DESC LIMIT 10"], ["SELECT entityType, COUNT(*) as count FROM activityLog ", " GROUP BY entityType ORDER BY count DESC LIMIT 10"])), whereClause))];
                    case 4:
                        entityRows = (_c.sent())[0];
                        byEntity = (entityRows || []).map(function (row) { return ({
                            entityType: row.entityType || 'other',
                            count: row.count
                        }); });
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_49 || (templateObject_49 = __makeTemplateObject(["SELECT\n            DATE(createdAt) as date,\n            COUNT(*) as count\n          FROM activityLog ", "\n            AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)\n          GROUP BY DATE(createdAt)\n          ORDER BY date DESC"], ["SELECT\n            DATE(createdAt) as date,\n            COUNT(*) as count\n          FROM activityLog ", "\n            AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)\n          GROUP BY DATE(createdAt)\n          ORDER BY date DESC"])), whereClause))];
                    case 5:
                        trendRows = (_c.sent())[0];
                        activityTrend = (trendRows || []).map(function (row) { return ({
                            date: row.date,
                            count: row.count
                        }); });
                        return [2 /*return*/, {
                                period: input.dateRange,
                                summary: {
                                    totalActivities: summary.totalActivities || 0,
                                    activeUsers: summary.activeUsers || 0,
                                    entityTypes: summary.entityTypes || 0,
                                    lastActivity: summary.lastActivity
                                },
                                byAction: byAction,
                                byEntity: byEntity,
                                activityTrend: activityTrend
                            }];
                    case 6:
                        error_8 = _c.sent();
                        console.error('Error in getOrganizationAuditStats:', error_8);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch organization audit statistics'
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get security events and suspicious activities
     */
    getSecurityEvents: auditViewProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string().optional(),
        dateRange: zod_1.z.object({
            start: zod_1.z.string(),
            end: zod_1.z.string()
        }).optional(),
        severity: zod_1.z["enum"](['low', 'medium', 'high', 'critical']).optional(),
        limit: zod_1.z.number().min(1).max(100)["default"](50)
    }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, securityActions, conditions, whereClause, rows, events, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        securityActions = [
                            'login_failed',
                            'password_reset',
                            'permission_denied',
                            'unauthorized_access',
                            'suspicious_activity',
                            'account_locked',
                            'admin_action',
                        ];
                        conditions = [drizzle_orm_1.sql(templateObject_52 || (templateObject_52 = __makeTemplateObject(["action IN (", ")"], ["action IN (", ")"])), drizzle_orm_1.sql.join(securityActions.map(function (a) { return drizzle_orm_1.sql(templateObject_50 || (templateObject_50 = __makeTemplateObject(["", ""], ["", ""])), a); }), drizzle_orm_1.sql(templateObject_51 || (templateObject_51 = __makeTemplateObject([", "], [", "])))))];
                        if (input.organizationId && ctx.user.role === 'super_admin') {
                            conditions.push(drizzle_orm_1.sql(templateObject_53 || (templateObject_53 = __makeTemplateObject(["organizationId = ", ""], ["organizationId = ", ""])), input.organizationId));
                        }
                        else if (ctx.user.organizationId) {
                            conditions.push(drizzle_orm_1.sql(templateObject_54 || (templateObject_54 = __makeTemplateObject(["organizationId = ", ""], ["organizationId = ", ""])), ctx.user.organizationId));
                        }
                        if (input.dateRange) {
                            conditions.push(drizzle_orm_1.sql(templateObject_55 || (templateObject_55 = __makeTemplateObject(["createdAt >= ", ""], ["createdAt >= ", ""])), input.dateRange.start));
                            conditions.push(drizzle_orm_1.sql(templateObject_56 || (templateObject_56 = __makeTemplateObject(["createdAt <= ", ""], ["createdAt <= ", ""])), input.dateRange.end));
                        }
                        whereClause = drizzle_orm_1.sql(templateObject_58 || (templateObject_58 = __makeTemplateObject(["WHERE ", ""], ["WHERE ", ""])), drizzle_orm_1.sql.join(conditions, drizzle_orm_1.sql(templateObject_57 || (templateObject_57 = __makeTemplateObject([" AND "], [" AND "])))));
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_59 || (templateObject_59 = __makeTemplateObject(["SELECT * FROM activityLog ", " ORDER BY createdAt DESC LIMIT ", ""], ["SELECT * FROM activityLog ", " ORDER BY createdAt DESC LIMIT ", ""])), whereClause, input.limit))];
                    case 2:
                        rows = (_b.sent())[0];
                        events = (rows || []).map(function (row) {
                            // Determine severity based on action type
                            var severity = 'low';
                            if (['account_locked', 'unauthorized_access'].includes(row.action)) {
                                severity = 'high';
                            }
                            else if (['login_failed', 'permission_denied'].includes(row.action)) {
                                severity = 'medium';
                            }
                            return {
                                id: row.id,
                                timestamp: row.createdAt,
                                userId: row.userId,
                                action: row.action,
                                description: row.description,
                                severity: severity,
                                entityType: row.entityType,
                                entityId: row.entityId,
                                ipAddress: row.ipAddress,
                                organizationId: row.organizationId,
                                metadata: row.metadata ? JSON.parse(row.metadata) : null
                            };
                        });
                        return [2 /*return*/, {
                                events: events,
                                total: events.length,
                                severity: input.severity
                            }];
                    case 3:
                        error_9 = _b.sent();
                        console.error('Error in getSecurityEvents:', error_9);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch security events'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get compliance audit report
     */
    getComplianceReport: auditViewProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string().optional(),
        reportType: zod_1.z["enum"](['gdpr', 'sox', 'hipaa', 'general']),
        dateRange: zod_1.z.object({
            start: zod_1.z.string(),
            end: zod_1.z.string()
        })
    }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, whereClause, complianceActions, relevantActions, finalWhereClause, rows, activities, summary, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        conditions = [];
                        if (input.organizationId && ctx.user.role === 'super_admin') {
                            conditions.push(drizzle_orm_1.sql(templateObject_60 || (templateObject_60 = __makeTemplateObject(["organizationId = ", ""], ["organizationId = ", ""])), input.organizationId));
                        }
                        else if (ctx.user.organizationId) {
                            conditions.push(drizzle_orm_1.sql(templateObject_61 || (templateObject_61 = __makeTemplateObject(["organizationId = ", ""], ["organizationId = ", ""])), ctx.user.organizationId));
                        }
                        conditions.push(drizzle_orm_1.sql(templateObject_62 || (templateObject_62 = __makeTemplateObject(["createdAt >= ", ""], ["createdAt >= ", ""])), input.dateRange.start));
                        conditions.push(drizzle_orm_1.sql(templateObject_63 || (templateObject_63 = __makeTemplateObject(["createdAt <= ", ""], ["createdAt <= ", ""])), input.dateRange.end));
                        whereClause = drizzle_orm_1.sql(templateObject_65 || (templateObject_65 = __makeTemplateObject(["WHERE ", ""], ["WHERE ", ""])), drizzle_orm_1.sql.join(conditions, drizzle_orm_1.sql(templateObject_64 || (templateObject_64 = __makeTemplateObject([" AND "], [" AND "])))));
                        complianceActions = {
                            gdpr: ['data_export', 'data_deletion', 'consent_given', 'consent_revoked', 'privacy_policy_viewed'],
                            sox: ['financial_record_modified', 'audit_log_accessed', 'admin_action', 'permission_changed'],
                            hipaa: ['patient_data_accessed', 'medical_record_modified', 'consent_given', 'data_deletion'],
                            general: ['user_created', 'user_deleted', 'permission_changed', 'data_modified', 'admin_action']
                        };
                        relevantActions = complianceActions[input.reportType];
                        conditions.push(drizzle_orm_1.sql(templateObject_68 || (templateObject_68 = __makeTemplateObject(["action IN (", ")"], ["action IN (", ")"])), drizzle_orm_1.sql.join(relevantActions.map(function (a) { return drizzle_orm_1.sql(templateObject_66 || (templateObject_66 = __makeTemplateObject(["", ""], ["", ""])), a); }), drizzle_orm_1.sql(templateObject_67 || (templateObject_67 = __makeTemplateObject([", "], [", "]))))));
                        finalWhereClause = drizzle_orm_1.sql(templateObject_70 || (templateObject_70 = __makeTemplateObject(["WHERE ", ""], ["WHERE ", ""])), drizzle_orm_1.sql.join(conditions, drizzle_orm_1.sql(templateObject_69 || (templateObject_69 = __makeTemplateObject([" AND "], [" AND "])))));
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_71 || (templateObject_71 = __makeTemplateObject(["SELECT * FROM activityLog ", " ORDER BY createdAt DESC"], ["SELECT * FROM activityLog ", " ORDER BY createdAt DESC"])), finalWhereClause))];
                    case 2:
                        rows = (_b.sent())[0];
                        activities = (rows || []).map(function (row) { return ({
                            id: row.id,
                            timestamp: row.createdAt,
                            userId: row.userId,
                            action: row.action,
                            description: row.description,
                            entityType: row.entityType,
                            entityId: row.entityId,
                            complianceCategory: input.reportType,
                            metadata: row.metadata ? JSON.parse(row.metadata) : null
                        }); });
                        summary = {
                            reportType: input.reportType,
                            period: input.dateRange,
                            totalActivities: activities.length,
                            complianceStatus: activities.length > 0 ? 'compliant' : 'no_activity',
                            lastAuditDate: activities.length > 0 ? activities[0].timestamp : null,
                            criticalEvents: activities.filter(function (a) {
                                return ['data_deletion', 'permission_changed', 'admin_action'].includes(a.action);
                            }).length
                        };
                        return [2 /*return*/, {
                                summary: summary,
                                activities: activities,
                                recommendations: generateComplianceRecommendations(input.reportType, activities)
                            }];
                    case 3:
                        error_10 = _b.sent();
                        console.error('Error in getComplianceReport:', error_10);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to generate compliance report'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21, templateObject_22, templateObject_23, templateObject_24, templateObject_25, templateObject_26, templateObject_27, templateObject_28, templateObject_29, templateObject_30, templateObject_31, templateObject_32, templateObject_33, templateObject_34, templateObject_35, templateObject_36, templateObject_37, templateObject_38, templateObject_39, templateObject_40, templateObject_41, templateObject_42, templateObject_43, templateObject_44, templateObject_45, templateObject_46, templateObject_47, templateObject_48, templateObject_49, templateObject_50, templateObject_51, templateObject_52, templateObject_53, templateObject_54, templateObject_55, templateObject_56, templateObject_57, templateObject_58, templateObject_59, templateObject_60, templateObject_61, templateObject_62, templateObject_63, templateObject_64, templateObject_65, templateObject_66, templateObject_67, templateObject_68, templateObject_69, templateObject_70, templateObject_71;
