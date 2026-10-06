"use strict";
/**
 * Analytics Router
 *
 * Provides real-time metrics, KPIs, and financial analytics
 * for dashboard and reporting
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
exports.analyticsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
exports.analyticsRouter = trpc_1.router({
    /**
     * Get financial summary metrics
     */
    financialSummary: trpc_1.createFeatureRestrictedProcedure("analytics:view")
        .input(zod_1.z.object({
        dateFrom: zod_1.z.string().optional(),
        dateTo: zod_1.z.string().optional()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, conditions, invoiceStats, expenseStats, totalInvoiced, totalPaid, totalOutstanding, totalExpenses, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        conditions = [];
                        if (input.dateFrom) {
                            conditions.push(drizzle_orm_1.gte(schema_1.invoices.issueDate, input.dateFrom));
                        }
                        if (input.dateTo) {
                            conditions.push(drizzle_orm_1.lte(schema_1.invoices.issueDate, input.dateTo));
                        }
                        return [4 /*yield*/, db
                                .select({
                                status: schema_1.invoices.status,
                                count: drizzle_orm_1.count().as("count"),
                                total: drizzle_orm_1.sum(schema_1.invoices.total).as("total")
                            })
                                .from(schema_1.invoices)
                                .where(conditions.length > 0 ? drizzle_orm_1.and.apply(void 0, conditions) : undefined)
                                .groupBy(schema_1.invoices.status)];
                    case 3:
                        invoiceStats = _b.sent();
                        return [4 /*yield*/, db
                                .select({
                                status: schema_1.expenses.status,
                                count: drizzle_orm_1.count().as("count"),
                                total: drizzle_orm_1.sum(schema_1.expenses.amount).as("total")
                            })
                                .from(schema_1.expenses)
                                .groupBy(schema_1.expenses.status)];
                    case 4:
                        expenseStats = _b.sent();
                        totalInvoiced = invoiceStats.reduce(function (sum, s) { return sum + (parseFloat(s.total || "0")); }, 0);
                        totalPaid = invoiceStats
                            .filter(function (s) { return s.status === "paid"; })
                            .reduce(function (sum, s) { return sum + (parseFloat(s.total || "0")); }, 0);
                        totalOutstanding = totalInvoiced - totalPaid;
                        totalExpenses = expenseStats.reduce(function (sum, s) { return sum + (parseFloat(s.total || "0")); }, 0);
                        return [2 /*return*/, {
                                totalInvoiced: totalInvoiced,
                                totalPaid: totalPaid,
                                totalOutstanding: totalOutstanding,
                                totalExpenses: totalExpenses,
                                netProfit: totalPaid - totalExpenses,
                                invoiceStats: invoiceStats,
                                expenseStats: expenseStats
                            }];
                    case 5:
                        error_1 = _b.sent();
                        console.error("Financial summary error:", error_1);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get revenue trends over time
     */
    revenueTrends: trpc_1.createFeatureRestrictedProcedure("analytics:view")
        .input(zod_1.z.object({
        months: zod_1.z.number()["default"](12)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, trends, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .select({
                                month: schema_1.invoices.issueDate,
                                total: drizzle_orm_1.sum(schema_1.invoices.total).as("total"),
                                count: drizzle_orm_1.count().as("count")
                            })
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.eq(schema_1.invoices.status, "paid"))
                                .groupBy(schema_1.invoices.issueDate)
                                .limit(input.months)];
                    case 3:
                        trends = _b.sent();
                        return [2 /*return*/, trends];
                    case 4:
                        error_2 = _b.sent();
                        console.error("Revenue trends error:", error_2);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get project status distribution
     */
    projectStatusDistribution: trpc_1.createFeatureRestrictedProcedure("analytics:view").query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, distribution, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select({
                            status: schema_1.projects.status,
                            count: drizzle_orm_1.count().as("count")
                        })
                            .from(schema_1.projects)
                            .groupBy(schema_1.projects.status)];
                case 3:
                    distribution = _a.sent();
                    return [2 /*return*/, distribution];
                case 4:
                    error_3 = _a.sent();
                    console.error("Project status distribution error:", error_3);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get client distribution metrics
     */
    clientDistribution: trpc_1.createFeatureRestrictedProcedure("analytics:view").query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, distribution, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select({
                            status: schema_1.clients.status,
                            count: drizzle_orm_1.count().as("count")
                        })
                            .from(schema_1.clients)
                            .groupBy(schema_1.clients.status)];
                case 3:
                    distribution = _a.sent();
                    return [2 /*return*/, distribution];
                case 4:
                    error_4 = _a.sent();
                    console.error("Client distribution error:", error_4);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get invoice status metrics
     */
    invoiceMetrics: trpc_1.createFeatureRestrictedProcedure("analytics:view").query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, metrics, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select({
                            status: schema_1.invoices.status,
                            count: drizzle_orm_1.count().as("count"),
                            total: drizzle_orm_1.sum(schema_1.invoices.total).as("total"),
                            average: drizzle_orm_1.sum(schema_1.invoices.total).divide(drizzle_orm_1.count()).as("average")
                        })
                            .from(schema_1.invoices)
                            .groupBy(schema_1.invoices.status)];
                case 3:
                    metrics = _a.sent();
                    return [2 /*return*/, metrics];
                case 4:
                    error_5 = _a.sent();
                    console.error("Invoice metrics error:", error_5);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get expense metrics by category
     */
    expenseMetrics: trpc_1.createFeatureRestrictedProcedure("analytics:view").query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, metrics, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select({
                            category: schema_1.expenses.category,
                            count: drizzle_orm_1.count().as("count"),
                            total: drizzle_orm_1.sum(schema_1.expenses.amount).as("total")
                        })
                            .from(schema_1.expenses)
                            .groupBy(schema_1.expenses.category)];
                case 3:
                    metrics = _a.sent();
                    return [2 /*return*/, metrics];
                case 4:
                    error_6 = _a.sent();
                    console.error("Expense metrics error:", error_6);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get top clients by revenue
     */
    topClients: trpc_1.createFeatureRestrictedProcedure("analytics:view")
        .input(zod_1.z.object({
        limit: zod_1.z.number()["default"](10)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, topClients, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, db
                                .select({
                                clientId: schema_1.invoices.clientId,
                                clientName: schema_1.clients.companyName,
                                totalRevenue: drizzle_orm_1.sum(schema_1.invoices.total).as("totalRevenue"),
                                invoiceCount: drizzle_orm_1.count().as("invoiceCount")
                            })
                                .from(schema_1.invoices)
                                .leftJoin(schema_1.clients, drizzle_orm_1.eq(schema_1.invoices.clientId, schema_1.clients.id))
                                .groupBy(schema_1.invoices.clientId)
                                .orderBy(function (t) { return t.totalRevenue; })
                                .limit(input.limit)];
                    case 3:
                        topClients = _b.sent();
                        return [2 /*return*/, topClients];
                    case 4:
                        error_7 = _b.sent();
                        console.error("Top clients error:", error_7);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get payment method distribution
     */
    paymentMethodDistribution: trpc_1.createFeatureRestrictedProcedure("analytics:view").query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, distribution, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select({
                            method: schema_1.payments.paymentMethod,
                            count: drizzle_orm_1.count().as("count"),
                            total: drizzle_orm_1.sum(schema_1.payments.amount).as("total")
                        })
                            .from(schema_1.payments)
                            .groupBy(schema_1.payments.paymentMethod)];
                case 3:
                    distribution = _a.sent();
                    return [2 /*return*/, distribution];
                case 4:
                    error_8 = _a.sent();
                    console.error("Payment method distribution error:", error_8);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get monthly comparison data
     */
    monthlyComparison: trpc_1.createFeatureRestrictedProcedure("analytics:view")
        .input(zod_1.z.object({
        currentMonth: zod_1.z.string(),
        previousMonth: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, currentMonthData, previousMonthData, current, previous, currentTotal, previousTotal, percentChange, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, null];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, db
                                .select({
                                total: drizzle_orm_1.sum(schema_1.invoices.total).as("total"),
                                count: drizzle_orm_1.count().as("count")
                            })
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.invoices.issueDate, input.currentMonth), drizzle_orm_1.lte(schema_1.invoices.issueDate, input.currentMonth)))];
                    case 3:
                        currentMonthData = _b.sent();
                        return [4 /*yield*/, db
                                .select({
                                total: drizzle_orm_1.sum(schema_1.invoices.total).as("total"),
                                count: drizzle_orm_1.count().as("count")
                            })
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.invoices.issueDate, input.previousMonth), drizzle_orm_1.lte(schema_1.invoices.issueDate, input.previousMonth)))];
                    case 4:
                        previousMonthData = _b.sent();
                        current = currentMonthData[0] || { total: 0, count: 0 };
                        previous = previousMonthData[0] || { total: 0, count: 0 };
                        currentTotal = parseFloat(current.total || "0");
                        previousTotal = parseFloat(previous.total || "0");
                        percentChange = previousTotal > 0
                            ? ((currentTotal - previousTotal) / previousTotal) * 100
                            : 0;
                        return [2 /*return*/, {
                                currentMonth: {
                                    total: currentTotal,
                                    count: current.count
                                },
                                previousMonth: {
                                    total: previousTotal,
                                    count: previous.count
                                },
                                percentChange: percentChange,
                                trend: currentTotal > previousTotal ? "up" : "down"
                            }];
                    case 5:
                        error_9 = _b.sent();
                        console.error("Monthly comparison error:", error_9);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get KPI summary
     */
    kpiSummary: trpc_1.createFeatureRestrictedProcedure("analytics:view").query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, invoiceData, paidData, overdueData, activeProjects, activeClients, invoiceTotal, paidTotal, error_10;
        var _a, _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _h.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _h.label = 2;
                case 2:
                    _h.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, db
                            .select({
                            total: drizzle_orm_1.sum(schema_1.invoices.total).as("total"),
                            count: drizzle_orm_1.count().as("count")
                        })
                            .from(schema_1.invoices)];
                case 3:
                    invoiceData = _h.sent();
                    return [4 /*yield*/, db
                            .select({
                            total: drizzle_orm_1.sum(schema_1.invoices.total).as("total")
                        })
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.eq(schema_1.invoices.status, "paid"))];
                case 4:
                    paidData = _h.sent();
                    return [4 /*yield*/, db
                            .select({
                            total: drizzle_orm_1.sum(schema_1.invoices.total).as("total"),
                            count: drizzle_orm_1.count().as("count")
                        })
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.eq(schema_1.invoices.status, "overdue"))];
                case 5:
                    overdueData = _h.sent();
                    return [4 /*yield*/, db
                            .select({
                            count: drizzle_orm_1.count().as("count")
                        })
                            .from(schema_1.projects)
                            .where(drizzle_orm_1.eq(schema_1.projects.status, "active"))];
                case 6:
                    activeProjects = _h.sent();
                    return [4 /*yield*/, db
                            .select({
                            count: drizzle_orm_1.count().as("count")
                        })
                            .from(schema_1.clients)
                            .where(drizzle_orm_1.eq(schema_1.clients.status, "active"))];
                case 7:
                    activeClients = _h.sent();
                    invoiceTotal = parseFloat(((_a = invoiceData[0]) === null || _a === void 0 ? void 0 : _a.total) || "0");
                    paidTotal = parseFloat(((_b = paidData[0]) === null || _b === void 0 ? void 0 : _b.total) || "0");
                    return [2 /*return*/, {
                            totalInvoiced: invoiceTotal,
                            totalInvoiceCount: ((_c = invoiceData[0]) === null || _c === void 0 ? void 0 : _c.count) || 0,
                            totalPaid: paidTotal,
                            totalOutstanding: invoiceTotal - paidTotal,
                            overdueAmount: parseFloat(((_d = overdueData[0]) === null || _d === void 0 ? void 0 : _d.total) || "0"),
                            overdueCount: ((_e = overdueData[0]) === null || _e === void 0 ? void 0 : _e.count) || 0,
                            activeProjects: ((_f = activeProjects[0]) === null || _f === void 0 ? void 0 : _f.count) || 0,
                            activeClients: ((_g = activeClients[0]) === null || _g === void 0 ? void 0 : _g.count) || 0
                        }];
                case 8:
                    error_10 = _h.sent();
                    console.error("KPI summary error:", error_10);
                    return [2 /*return*/, null];
                case 9: return [2 /*return*/];
            }
        });
    }); })
});
