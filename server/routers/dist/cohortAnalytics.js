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
exports.cohortAnalyticsRouter = void 0;
/**
 * Cohort Analytics Router - DB-backed
 */
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var uuid_1 = require("uuid");
var featureViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('analytics:view');
var featureEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('analytics:edit');
exports.cohortAnalyticsRouter = trpc_1.router({
    getCohortAnalysis: featureViewProcedure
        .input(zod_1.z.object({ cohortType: zod_1.z["enum"](["SIGNUP_DATE", "FIRST_PURCHASE", "REGION"]), period: zod_1.z.string()["default"]("MONTHLY") }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        return [4 /*yield*/, db.select().from(schema_1.cohortAnalyses)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.cohortAnalyses.analysisType, 'cohort'), drizzle_orm_1.eq(schema_1.cohortAnalyses.cohortType, input.cohortType)))
                                .orderBy(drizzle_orm_1.desc(schema_1.cohortAnalyses.createdAt))
                                .limit(20)];
                    case 2:
                        rows = _c.sent();
                        return [2 /*return*/, {
                                cohortType: input.cohortType,
                                period: input.period,
                                cohorts: rows.map(function (r) { return ({
                                    cohort: r.name || '',
                                    users: r.retentionData ? JSON.parse(r.retentionData).users || 0 : 0,
                                    retention: r.retentionData ? JSON.parse(r.retentionData).retention || [] : [],
                                    churnRate: r.retentionData ? JSON.parse(r.retentionData).churnRate || 0 : 0,
                                    avgLifetimeValue: r.retentionData ? JSON.parse(r.retentionData).avgLifetimeValue || 0 : 0,
                                    avgRetentionDays: r.retentionData ? JSON.parse(r.retentionData).avgRetentionDays || 0 : 0
                                }); }),
                                overallRetention: 0,
                                bestPerformingCohort: ((_b = rows[0]) === null || _b === void 0 ? void 0 : _b.name) || '',
                                worstPerformingCohort: '',
                                segment: ''
                            }];
                }
            });
        });
    }),
    getAttributionModel: featureViewProcedure
        .input(zod_1.z.object({ model: zod_1.z["enum"](["FIRST_TOUCH", "LAST_TOUCH", "LINEAR", "TIME_DECAY", "POSITION_BASED"]), conversionType: zod_1.z.string().optional() }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.cohortAnalyses)
                                .where(drizzle_orm_1.eq(schema_1.cohortAnalyses.analysisType, 'attribution'))
                                .orderBy(drizzle_orm_1.desc(schema_1.cohortAnalyses.createdAt))
                                .limit(10)];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, {
                                attributionModel: input.model,
                                conversionType: input.conversionType || "PURCHASE",
                                totalConversions: 0,
                                channels: rows.map(function (r) { return ({
                                    channel: r.name || '',
                                    credit: r.dataPayload ? JSON.parse(r.dataPayload).credit || 0 : 0,
                                    percentage: r.dataPayload ? JSON.parse(r.dataPayload).percentage || 0 : 0,
                                    trend: r.dataPayload ? JSON.parse(r.dataPayload).trend || 0 : 0
                                }); }),
                                avgTouchpoints: 0,
                                conversionLag: 0,
                                cycleTime: 0,
                                multiTouchConversions: 0
                            }];
                }
            });
        });
    }),
    analyzeFunnels: featureViewProcedure
        .input(zod_1.z.object({ funnelId: zod_1.z.string(), timeRange: zod_1.z.string()["default"]("30d") }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, row, funnelData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.cohortAnalyses)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.cohortAnalyses.analysisType, 'funnel'), drizzle_orm_1.eq(schema_1.cohortAnalyses.name, input.funnelId)))
                                .orderBy(drizzle_orm_1.desc(schema_1.cohortAnalyses.createdAt))
                                .limit(1)];
                    case 2:
                        rows = _b.sent();
                        row = rows[0];
                        funnelData = (row === null || row === void 0 ? void 0 : row.funnelData) ? JSON.parse(row.funnelData) : {};
                        return [2 /*return*/, {
                                funnelId: input.funnelId,
                                funnelName: funnelData.funnelName || input.funnelId,
                                timeRange: input.timeRange,
                                steps: funnelData.steps || [],
                                overallConversionRate: funnelData.overallConversionRate || 0,
                                biggestDropoff: funnelData.biggestDropoff || { step: '', percentage: 0 },
                                avgTimePerStep: funnelData.avgTimePerStep || 0,
                                totalFunnelTime: funnelData.totalFunnelTime || 0
                            }];
                }
            });
        });
    }),
    getCustomMetricsDefinition: featureEditProcedure
        .input(zod_1.z.object({ metricName: zod_1.z.string(), calculation: zod_1.z.string(), dimensions: zod_1.z.array(zod_1.z.string()).optional() }).strict())
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, id;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        id = uuid_1.v4();
                        return [4 /*yield*/, db.insert(schema_1.cohortAnalyses).values({
                                id: id,
                                analysisType: 'custom_metric',
                                name: input.metricName,
                                dataPayload: JSON.stringify({ calculation: input.calculation, dimensions: input.dimensions || [] }),
                                status: 'ACTIVE',
                                createdBy: ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id) || 'system'
                            })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, {
                                metricId: id,
                                metricName: input.metricName,
                                calculation: input.calculation,
                                dimensions: input.dimensions || [],
                                status: "ACTIVE",
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                lastUpdated: new Date(),
                                dataSource: "EVENTS",
                                refreshFrequency: "HOURLY",
                                historicalData: true,
                                comparableMetrics: [],
                                visualization: "LINE_CHART"
                            }];
                }
            });
        });
    }),
    runCohortRetention: featureViewProcedure
        .input(zod_1.z.object({ startDate: zod_1.z.string(), endDate: zod_1.z.string() }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows, row, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.cohortAnalyses)
                                .where(drizzle_orm_1.eq(schema_1.cohortAnalyses.analysisType, 'retention'))
                                .orderBy(drizzle_orm_1.desc(schema_1.cohortAnalyses.createdAt))
                                .limit(1)];
                    case 2:
                        rows = _b.sent();
                        row = rows[0];
                        data = (row === null || row === void 0 ? void 0 : row.retentionData) ? JSON.parse(row.retentionData) : {};
                        return [2 /*return*/, {
                                period: input.startDate + " to " + input.endDate,
                                totalCohorts: data.totalCohorts || 0,
                                cohortSize: data.cohortSize || 0,
                                retentionInsights: data.retentionInsights || { d1Retention: 0, d7Retention: 0, d30Retention: 0, d90Retention: 0 },
                                churnByWeek: data.churnByWeek || [],
                                cumulativeChurn: data.cumulativeChurn || 0,
                                retentionTrend: data.retentionTrend || 'STABLE',
                                negativeImpactFactors: data.negativeImpactFactors || [],
                                recommendedActions: data.recommendedActions || []
                            }];
                }
            });
        });
    }),
    predictChurnRisk: featureViewProcedure
        .input(zod_1.z.object({ subscriptionId: zod_1.z.string().optional() }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, subscriptionConditions, allSubscriptions, activeCount, churnedCount, totalSubscriptions, churnRate, overdueConditions, overdueInvoices, overdueRatio, score, riskLevel, latestChurn, churnPayload;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        subscriptionConditions = [];
                        if (input.subscriptionId) {
                            subscriptionConditions.push(drizzle_orm_1.eq(schema_1.subscriptions.id, input.subscriptionId));
                        }
                        return [4 /*yield*/, db.select().from(schema_1.subscriptions)
                                .where(subscriptionConditions.length > 0 ? drizzle_orm_1.and.apply(void 0, subscriptionConditions) : undefined)];
                    case 2:
                        allSubscriptions = _c.sent();
                        activeCount = allSubscriptions.filter(function (sub) { return sub.status === 'active'; }).length;
                        churnedCount = allSubscriptions.filter(function (sub) { return ['cancelled', 'suspended', 'expired'].includes(sub.status); }).length;
                        totalSubscriptions = allSubscriptions.length;
                        churnRate = totalSubscriptions ? churnedCount / totalSubscriptions : 0;
                        overdueConditions = [drizzle_orm_1.eq(schema_1.billingInvoices.status, 'pending'), drizzle_orm_1.lte(schema_1.billingInvoices.dueDate, new Date().toISOString())];
                        if (input.subscriptionId) {
                            overdueConditions.push(drizzle_orm_1.eq(schema_1.billingInvoices.subscriptionId, input.subscriptionId));
                        }
                        return [4 /*yield*/, db.select().from(schema_1.billingInvoices)
                                .where(drizzle_orm_1.and.apply(void 0, overdueConditions))];
                    case 3:
                        overdueInvoices = _c.sent();
                        overdueRatio = totalSubscriptions ? Math.min(1, overdueInvoices.length / totalSubscriptions) : 0;
                        score = Math.min(100, Math.round(20 + churnRate * 45 + overdueRatio * 40 + (activeCount === 0 && totalSubscriptions > 0 ? 15 : 0)));
                        riskLevel = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
                        return [4 /*yield*/, db.select().from(schema_1.cohortAnalyses)
                                .where(drizzle_orm_1.eq(schema_1.cohortAnalyses.analysisType, 'churn'))
                                .orderBy(drizzle_orm_1.desc(schema_1.cohortAnalyses.createdAt))
                                .limit(1)];
                    case 4:
                        latestChurn = _c.sent();
                        churnPayload = ((_b = latestChurn[0]) === null || _b === void 0 ? void 0 : _b.dataPayload) ? JSON.parse(latestChurn[0].dataPayload) : {};
                        return [2 /*return*/, {
                                subscriptionId: input.subscriptionId || null,
                                totalSubscriptions: totalSubscriptions,
                                activeCount: activeCount,
                                churnedCount: churnedCount,
                                churnRate: Math.round(churnRate * 10000) / 100,
                                overdueInvoiceCount: overdueInvoices.length,
                                overdueRatio: Math.round(overdueRatio * 10000) / 100,
                                riskScore: score,
                                riskLevel: riskLevel,
                                drivers: [
                                    { name: 'Churn rate', value: Math.round(churnRate * 10000) / 100 },
                                    { name: 'Overdue invoices', value: Math.round(overdueRatio * 10000) / 100 },
                                    { name: 'Active subscriptions', value: activeCount },
                                ],
                                prediction: churnPayload.prediction || 'Churn risk is driven by subscription cancellations and overdue payments.',
                                recommendedActions: churnPayload.recommendedActions || [
                                    'Review overdue renewals',
                                    'Engage at-risk customers with early retention offers',
                                    'Monitor subscription downgrades closely',
                                ]
                            }];
                }
            });
        });
    }),
    getAnalyticsInteraction: featureViewProcedure
        .input(zod_1.z.object({ eventType: zod_1.z.string(), userId: zod_1.z.string().optional() }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        return [4 /*yield*/, db.select().from(schema_1.cohortAnalyses)
                                .where(drizzle_orm_1.eq(schema_1.cohortAnalyses.analysisType, 'interaction'))
                                .orderBy(drizzle_orm_1.desc(schema_1.cohortAnalyses.createdAt))
                                .limit(10)];
                    case 2:
                        rows = _b.sent();
                        return [2 /*return*/, {
                                eventType: input.eventType,
                                totalEvents: 0,
                                uniqueUsers: 0,
                                avgEventsPerUser: 0,
                                eventDistribution: {},
                                topPages: rows.map(function (r) { return ({ page: r.name || '', events: 0, users: 0 }); }),
                                avgSessionDuration: 0,
                                bounceRate: 0,
                                userFlow: ''
                            }];
                }
            });
        });
    })
});
