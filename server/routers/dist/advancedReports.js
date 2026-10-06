"use strict";
/**
 * Advanced Reporting Router
 *
 * Provides analytics and reporting endpoints for quotes, conversions, revenue, and performance
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
exports.advancedReportsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_extended_1 = require("../../drizzle/schema-extended");
var drizzle_orm_1 = require("drizzle-orm");
exports.advancedReportsRouter = trpc_1.router({
    /**
     * Get overall quote metrics
     */
    getQuoteMetrics: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        dateFrom: zod_1.z.date().optional(),
        dateTo: zod_1.z.date().optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, allQuotes, metrics, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        conditions = [];
                        if (input.dateFrom)
                            conditions.push(drizzle_orm_1.gte(schema_extended_1.quotes.createdAt, input.dateFrom.toISOString()));
                        if (input.dateTo)
                            conditions.push(drizzle_orm_1.lte(schema_extended_1.quotes.createdAt, input.dateTo.toISOString()));
                        return [4 /*yield*/, db.query.quotes.findMany({
                                where: conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined,
                                limit: 10000
                            })];
                    case 3:
                        allQuotes = _b.sent();
                        metrics = {
                            total: allQuotes.length,
                            draft: allQuotes.filter(function (q) { return q.status === "draft"; }).length,
                            sent: allQuotes.filter(function (q) { return q.status === "sent"; }).length,
                            accepted: allQuotes.filter(function (q) { return q.status === "accepted"; }).length,
                            declined: allQuotes.filter(function (q) { return q.status === "declined"; }).length,
                            expired: allQuotes.filter(function (q) { return q.status === "expired"; }).length,
                            converted: allQuotes.filter(function (q) { return q.status === "converted"; }).length,
                            totalValue: allQuotes.reduce(function (sum, q) { return sum + (q.total || 0); }, 0),
                            averageValue: allQuotes.length > 0
                                ? allQuotes.reduce(function (sum, q) { return sum + (q.total || 0); }, 0) / allQuotes.length
                                : 0
                        };
                        return [2 /*return*/, metrics];
                    case 4:
                        error_1 = _b.sent();
                        console.error("Metrics error:", error_1);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get quote to invoice conversion analytics
     */
    getConversionAnalytics: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        dateFrom: zod_1.z.date().optional(),
        dateTo: zod_1.z.date().optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, allQuotes, converted, total, conversionRate, monthlyData_1, monthlyTrends, statusBreakdown, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        conditions = [];
                        if (input.dateFrom)
                            conditions.push(drizzle_orm_1.gte(schema_extended_1.quotes.createdAt, input.dateFrom.toISOString()));
                        if (input.dateTo)
                            conditions.push(drizzle_orm_1.lte(schema_extended_1.quotes.createdAt, input.dateTo.toISOString()));
                        return [4 /*yield*/, db.query.quotes.findMany({
                                where: conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined,
                                limit: 10000
                            })];
                    case 3:
                        allQuotes = _c.sent();
                        converted = allQuotes.filter(function (q) { return q.status === "converted"; }).length;
                        total = allQuotes.length;
                        conversionRate = total > 0 ? (converted / total) * 100 : 0;
                        monthlyData_1 = new Map();
                        allQuotes.forEach(function (q) {
                            if (q.createdAt) {
                                var month = q.createdAt.toISOString().replace('T', ' ').substring(0, 19).slice(0, 7); // YYYY-MM
                                var current = monthlyData_1.get(month) || { sent: 0, converted: 0 };
                                current.sent++;
                                if (q.status === "converted")
                                    current.converted++;
                                monthlyData_1.set(month, current);
                            }
                        });
                        monthlyTrends = Array.from(monthlyData_1.entries())
                            .sort()
                            .map(function (_a) {
                            var month = _a[0], data = _a[1];
                            return ({
                                month: month,
                                sent: data.sent,
                                converted: data.converted,
                                conversionRate: data.sent > 0 ? (data.converted / data.sent) * 100 : 0
                            });
                        });
                        statusBreakdown = {
                            draft: allQuotes.filter(function (q) { return q.status === "draft"; }).length,
                            sent: allQuotes.filter(function (q) { return q.status === "sent"; }).length,
                            accepted: allQuotes.filter(function (q) { return q.status === "accepted"; }).length,
                            declined: allQuotes.filter(function (q) { return q.status === "declined"; }).length,
                            expired: allQuotes.filter(function (q) { return q.status === "expired"; }).length,
                            converted: allQuotes.filter(function (q) { return q.status === "converted"; }).length
                        };
                        return [2 /*return*/, {
                                overallConversionRate: conversionRate,
                                totalQuotes: total,
                                convertedQuotes: converted,
                                monthlyTrends: monthlyTrends,
                                statusBreakdown: statusBreakdown,
                                topConvertedAmount: ((_b = allQuotes
                                    .filter(function (q) { return q.status === "converted"; })
                                    .sort(function (a, b) { return (b.total || 0) - (a.total || 0); })[0]) === null || _b === void 0 ? void 0 : _b.total) || 0,
                                averageConversionTime: 0
                            }];
                    case 4:
                        error_2 = _c.sent();
                        console.error("Conversion analytics error:", error_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get revenue forecasting data
     */
    getRevenueForecasting: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        months: zod_1.z.number().min(1).max(24)["default"](12)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, allQuotes, monthlyRevenue_1, revenueArray, averageMonthlyRevenue, historicalMonths, currentDate, forecast, i, futureDate, month, variation, forecastedRevenue, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.query.quotes.findMany({
                                where: drizzle_orm_1.eq(schema_extended_1.quotes.status, "converted"),
                                limit: 10000
                            })];
                    case 3:
                        allQuotes = _b.sent();
                        monthlyRevenue_1 = new Map();
                        allQuotes.forEach(function (q) {
                            if (q.status === "converted" && q.createdAt) {
                                var month = q.createdAt.toISOString().replace('T', ' ').substring(0, 19).slice(0, 7);
                                var current = monthlyRevenue_1.get(month) || 0;
                                monthlyRevenue_1.set(month, current + (q.total || 0));
                            }
                        });
                        revenueArray = Array.from(monthlyRevenue_1.entries())
                            .sort()
                            .slice(-3)
                            .map(function (_a) {
                            var _ = _a[0], rev = _a[1];
                            return rev;
                        });
                        averageMonthlyRevenue = revenueArray.length > 0
                            ? revenueArray.reduce(function (a, b) { return a + b; }, 0) / revenueArray.length
                            : 0;
                        historicalMonths = Array.from(monthlyRevenue_1.entries())
                            .sort()
                            .map(function (_a) {
                            var month = _a[0], revenue = _a[1];
                            return ({
                                month: month,
                                actual: revenue,
                                forecast: null
                            });
                        });
                        currentDate = new Date();
                        forecast = [];
                        for (i = 1; i <= input.months; i++) {
                            futureDate = new Date(currentDate);
                            futureDate.setMonth(futureDate.getMonth() + i);
                            month = futureDate.toISOString().slice(0, 7);
                            variation = (Math.random() - 0.5) * 0.3;
                            forecastedRevenue = averageMonthlyRevenue * (1 + variation);
                            forecast.push({
                                month: month,
                                actual: null,
                                forecast: Math.max(0, forecastedRevenue)
                            });
                        }
                        return [2 /*return*/, {
                                averageMonthlyRevenue: averageMonthlyRevenue,
                                historicalData: historicalMonths,
                                forecastData: forecast,
                                totalHistoricalRevenue: Array.from(monthlyRevenue_1.values()).reduce(function (a, b) { return a + b; }, 0),
                                projectedRevenue: forecast.reduce(function (sum, m) { return sum + (m.forecast || 0); }, 0)
                            }];
                    case 4:
                        error_3 = _b.sent();
                        console.error("Revenue forecasting error:", error_3);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get client performance metrics
     */
    getClientPerformance: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(50)["default"](10)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, allQuotes, clientMap_1, clientPerformance, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.query.quotes.findMany({
                                limit: 10000
                            })];
                    case 3:
                        allQuotes = _b.sent();
                        clientMap_1 = new Map();
                        allQuotes.forEach(function (q) {
                            var clientId = q.clientId;
                            var current = clientMap_1.get(clientId) || {
                                clientId: clientId,
                                totalQuotes: 0,
                                convertedQuotes: 0,
                                conversionRate: 0,
                                totalValue: 0,
                                averageValue: 0
                            };
                            current.totalQuotes++;
                            if (q.status === "converted")
                                current.convertedQuotes++;
                            current.totalValue += q.total || 0;
                            clientMap_1.set(clientId, current);
                        });
                        clientPerformance = Array.from(clientMap_1.values())
                            .map(function (c) { return (__assign(__assign({}, c), { conversionRate: c.totalQuotes > 0 ? (c.convertedQuotes / c.totalQuotes) * 100 : 0, averageValue: c.totalQuotes > 0 ? c.totalValue / c.totalQuotes : 0 })); })
                            .sort(function (a, b) { return b.totalValue - a.totalValue; })
                            .slice(0, input.limit);
                        return [2 /*return*/, {
                                topClients: clientPerformance,
                                totalUniqueClients: clientMap_1.size,
                                averageClientValue: Array.from(clientMap_1.values()).reduce(function (sum, c) { return sum + c.totalValue; }, 0) / clientMap_1.size
                            }];
                    case 4:
                        error_4 = _b.sent();
                        console.error("Client performance error:", error_4);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get monthly trends data
     */
    getMonthlyTrends: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        months: zod_1.z.number().min(1).max(24)["default"](12)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, allQuotes, monthlyData_2, trends, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.query.quotes.findMany({
                                limit: 10000
                            })];
                    case 3:
                        allQuotes = _b.sent();
                        monthlyData_2 = new Map();
                        allQuotes.forEach(function (q) {
                            if (q.createdAt) {
                                var month = q.createdAt.toISOString().replace('T', ' ').substring(0, 19).slice(0, 7);
                                var current = monthlyData_2.get(month) || {
                                    created: 0,
                                    sent: 0,
                                    accepted: 0,
                                    converted: 0,
                                    declined: 0,
                                    revenue: 0
                                };
                                current.created++;
                                if (q.status === "sent")
                                    current.sent++;
                                if (q.status === "accepted")
                                    current.accepted++;
                                if (q.status === "converted") {
                                    current.converted++;
                                    current.revenue += q.total || 0;
                                }
                                if (q.status === "declined")
                                    current.declined++;
                                monthlyData_2.set(month, current);
                            }
                        });
                        trends = Array.from(monthlyData_2.entries())
                            .sort()
                            .slice(-input.months)
                            .map(function (_a) {
                            var month = _a[0], data = _a[1];
                            return (__assign({ month: month }, data));
                        });
                        return [2 /*return*/, {
                                trends: trends,
                                totalMonths: monthlyData_2.size
                            }];
                    case 4:
                        error_5 = _b.sent();
                        console.error("Monthly trends error:", error_5);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get quote status distribution
     */
    getStatusDistribution: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, allQuotes, distribution, total, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db.query.quotes.findMany({
                                limit: 10000
                            })];
                    case 3:
                        allQuotes = _b.sent();
                        distribution = {
                            draft: allQuotes.filter(function (q) { return q.status === "draft"; }).length,
                            sent: allQuotes.filter(function (q) { return q.status === "sent"; }).length,
                            accepted: allQuotes.filter(function (q) { return q.status === "accepted"; }).length,
                            declined: allQuotes.filter(function (q) { return q.status === "declined"; }).length,
                            expired: allQuotes.filter(function (q) { return q.status === "expired"; }).length,
                            converted: allQuotes.filter(function (q) { return q.status === "converted"; }).length
                        };
                        total = Object.values(distribution).reduce(function (a, b) { return a + b; }, 0);
                        return [2 /*return*/, {
                                distribution: distribution,
                                total: total,
                                percentages: {
                                    draft: total > 0 ? (distribution.draft / total) * 100 : 0,
                                    sent: total > 0 ? (distribution.sent / total) * 100 : 0,
                                    accepted: total > 0 ? (distribution.accepted / total) * 100 : 0,
                                    declined: total > 0 ? (distribution.declined / total) * 100 : 0,
                                    expired: total > 0 ? (distribution.expired / total) * 100 : 0,
                                    converted: total > 0 ? (distribution.converted / total) * 100 : 0
                                }
                            }];
                    case 4:
                        error_6 = _b.sent();
                        console.error("Status distribution error:", error_6);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
