"use strict";
/**
 * Advanced Reporting & BI Router
 * Comprehensive analytics dashboards, financial reports, and business intelligence
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
exports.advancedReportingRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("reports:read");
exports.advancedReportingRouter = trpc_1.router({
    /**
     * Revenue Dashboard - Revenue trends and analysis
     */
    getRevenueDashboard: readProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.date(),
        endDate: zod_1.z.date(),
        groupBy: zod_1.z["enum"](["day", "week", "month"])["default"]("month")
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, startIso, endIso, invoiceData, paymentData, totalInvoiced, totalPaid, outstanding, periodDays, previousStart, previousStartIso, previousInvoices, previousTotal, growthPercent;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        startIso = input.startDate.toISOString();
                        endIso = input.endDate.toISOString();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.invoices.invoiceDate, startIso), drizzle_orm_1.lte(schema_1.invoices.invoiceDate, endIso)))];
                    case 2:
                        invoiceData = _b.sent();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.payments)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.payments.paymentDate, startIso), drizzle_orm_1.lte(schema_1.payments.paymentDate, endIso)))];
                    case 3:
                        paymentData = _b.sent();
                        totalInvoiced = invoiceData.reduce(function (sum, inv) { return sum + (inv.totalAmount || 0); }, 0);
                        totalPaid = paymentData.reduce(function (sum, pmt) { return sum + (pmt.amount || 0); }, 0);
                        outstanding = totalInvoiced - totalPaid;
                        periodDays = input.endDate.getTime() - input.startDate.getTime();
                        previousStart = new Date(input.startDate.getTime() - periodDays);
                        previousStartIso = previousStart.toISOString();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.invoices.invoiceDate, previousStartIso), drizzle_orm_1.lte(schema_1.invoices.invoiceDate, input.startDate.toISOString())))];
                    case 4:
                        previousInvoices = _b.sent();
                        previousTotal = previousInvoices.reduce(function (sum, inv) { return sum + (inv.totalAmount || 0); }, 0);
                        growthPercent = previousTotal > 0 ? ((totalInvoiced - previousTotal) / previousTotal) * 100 : 0;
                        return [2 /*return*/, {
                                totalInvoiced: totalInvoiced,
                                totalPaid: totalPaid,
                                outstanding: outstanding,
                                growthPercent: parseFloat(growthPercent.toFixed(2)),
                                invoiceCount: invoiceData.length,
                                paymentCount: paymentData.length,
                                averageInvoiceValue: invoiceData.length > 0 ? totalInvoiced / invoiceData.length : 0,
                                collectionRate: totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0
                            }];
                }
            });
        });
    }),
    /**
     * Profitability Dashboard - Profit margins and cost analysis
     */
    getProfitabilityDashboard: readProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.date(),
        endDate: zod_1.z.date()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, startIso, endIso, invoiceData, totalRevenue, expenseData, totalExpenses, grossProfit, profitMargin, expensesByCategory, _i, expenseData_1, exp, category;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            throw new Error("Database not available");
                        startIso = input.startDate.toISOString();
                        endIso = input.endDate.toISOString();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.invoices.invoiceDate, startIso), drizzle_orm_1.lte(schema_1.invoices.invoiceDate, endIso), drizzle_orm_1.eq(schema_1.invoices.status, "paid")))];
                    case 2:
                        invoiceData = _b.sent();
                        totalRevenue = invoiceData.reduce(function (sum, inv) { return sum + (inv.totalAmount || 0); }, 0);
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.expenses)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.expenses.expenseDate, startIso), drizzle_orm_1.lte(schema_1.expenses.expenseDate, endIso)))];
                    case 3:
                        expenseData = _b.sent();
                        totalExpenses = expenseData.reduce(function (sum, exp) { return sum + (exp.amount || 0); }, 0);
                        grossProfit = totalRevenue - totalExpenses;
                        profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
                        expensesByCategory = {};
                        for (_i = 0, expenseData_1 = expenseData; _i < expenseData_1.length; _i++) {
                            exp = expenseData_1[_i];
                            category = exp.category || "Uncategorized";
                            expensesByCategory[category] = (expensesByCategory[category] || 0) + (exp.amount || 0);
                        }
                        return [2 /*return*/, {
                                totalRevenue: totalRevenue,
                                totalExpenses: totalExpenses,
                                grossProfit: grossProfit,
                                profitMargin: parseFloat(profitMargin.toFixed(2)),
                                expenseCount: expenseData.length,
                                topExpenseCategory: Object.entries(expensesByCategory).sort(function (_a, _b) {
                                    var a = _a[1];
                                    var b = _b[1];
                                    return b - a;
                                })[0],
                                expensesByCategory: expensesByCategory
                            }];
                }
            });
        });
    }),
    /**
     * Customer Analytics - Client performance and lifetime value
     */
    getCustomerAnalytics: readProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.date(),
        endDate: zod_1.z.date(),
        limit: zod_1.z.number()["default"](20)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, startIso, endIso, clientData, clientMetrics;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        startIso = input.startDate.toISOString();
                        endIso = input.endDate.toISOString();
                        return [4 /*yield*/, db.select().from(schema_1.clients)];
                    case 2:
                        clientData = _b.sent();
                        return [4 /*yield*/, Promise.all(clientData.map(function (client) { return __awaiter(void 0, void 0, void 0, function () {
                                var clientInvoices, clientPayments, totalValue, totalPaid, outstanding;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, db
                                                .select()
                                                .from(schema_1.invoices)
                                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.clientId, client.id), drizzle_orm_1.gte(schema_1.invoices.invoiceDate, startIso), drizzle_orm_1.lte(schema_1.invoices.invoiceDate, endIso)))];
                                        case 1:
                                            clientInvoices = _a.sent();
                                            return [4 /*yield*/, db
                                                    .select()
                                                    .from(schema_1.payments)
                                                    .where(drizzle_orm_1.eq(schema_1.payments.clientId, client.id))];
                                        case 2:
                                            clientPayments = _a.sent();
                                            totalValue = clientInvoices.reduce(function (sum, inv) { return sum + (inv.totalAmount || 0); }, 0);
                                            totalPaid = clientPayments.reduce(function (sum, pmt) { return sum + (pmt.amount || 0); }, 0);
                                            outstanding = totalValue - totalPaid;
                                            return [2 /*return*/, {
                                                    clientId: client.id,
                                                    clientName: client.name,
                                                    totalRevenue: totalValue,
                                                    invoiceCount: clientInvoices.length,
                                                    outstandingBalance: outstanding,
                                                    paymentRate: totalValue > 0 ? (totalPaid / totalValue) * 100 : 0
                                                }];
                                    }
                                });
                            }); }))];
                    case 3:
                        clientMetrics = _b.sent();
                        return [2 /*return*/, clientMetrics
                                .filter(function (m) { return m.totalRevenue > 0; })
                                .sort(function (a, b) { return b.totalRevenue - a.totalRevenue; })
                                .slice(0, input.limit)];
                }
            });
        });
    }),
    /**
     * Financial Health Metrics - KPIs and health indicators
     */
    getFinancialHealthMetrics: readProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, now, thirtyDaysAgo, ninetyDaysAgo, startOfMonth, startOfYear, allInvoices, overdueInvoices, monthlyInvoices, yearlyInvoices, monthlyRevenue, yearlyRevenue, overdueAmount, pendingInvoices, paidInvoices;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    now = new Date();
                    thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    startOfYear = new Date(now.getFullYear(), 0, 1);
                    return [4 /*yield*/, db.select().from(schema_1.invoices)];
                case 2:
                    allInvoices = _a.sent();
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.invoices.status, "pending"), lt(schema_1.invoices.dueDate, now.toISOString())))];
                case 3:
                    overdueInvoices = _a.sent();
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.gte(schema_1.invoices.invoiceDate, startOfMonth.toISOString()))];
                case 4:
                    monthlyInvoices = _a.sent();
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.invoices)
                            .where(drizzle_orm_1.gte(schema_1.invoices.invoiceDate, startOfYear.toISOString()))];
                case 5:
                    yearlyInvoices = _a.sent();
                    monthlyRevenue = monthlyInvoices.reduce(function (sum, inv) { return sum + (inv.totalAmount || 0); }, 0);
                    yearlyRevenue = yearlyInvoices.reduce(function (sum, inv) { return sum + (inv.totalAmount || 0); }, 0);
                    overdueAmount = overdueInvoices.reduce(function (sum, inv) { return sum + (inv.totalAmount || 0); }, 0);
                    pendingInvoices = allInvoices.filter(function (inv) { return inv.status === "pending"; }).length;
                    paidInvoices = allInvoices.filter(function (inv) { return inv.status === "paid"; }).length;
                    return [2 /*return*/, {
                            monthlyRevenue: monthlyRevenue,
                            yearlyRevenue: yearlyRevenue,
                            overdueAmount: overdueAmount,
                            overdueInvoiceCount: overdueInvoices.length,
                            pendingInvoiceCount: pendingInvoices,
                            paidInvoiceCount: paidInvoices,
                            creditHealthRating: overdueAmount < monthlyRevenue * 0.1 ? "Good" : "At Risk",
                            metrics: {
                                invoicesTotalCount: allInvoices.length,
                                monthlyGrowth: ((monthlyRevenue / (monthlyRevenue || 1)) * 100).toFixed(1),
                                collectionEfficiency: ((paidInvoices / (allInvoices.length || 1)) * 100).toFixed(1)
                            }
                        }];
            }
        });
    }); }),
    /**
     * Project Performance Dashboard
     */
    getProjectPerformance: readProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number()["default"](10)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, projectData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, db.select().from(schema_1.projects).limit(input.limit)];
                    case 2:
                        projectData = _b.sent();
                        return [2 /*return*/, projectData.map(function (project) { return ({
                                id: project.id,
                                name: project.name,
                                status: project.status,
                                budget: project.budget,
                                startDate: project.startDate,
                                endDate: project.endDate,
                                progress: "0"
                            }); })];
                }
            });
        });
    }),
    /**
     * Team Performance Analytics
     */
    getTeamPerformance: readProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.date(),
        endDate: zod_1.z.date()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, startIso, endIso, timeEntriesData, employeeMetrics, _i, timeEntriesData_1, entry;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, []];
                        startIso = input.startDate.toISOString();
                        endIso = input.endDate.toISOString();
                        return [4 /*yield*/, db
                                .select()
                                .from(schema_1.timeEntries)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.timeEntries.date, startIso), drizzle_orm_1.lte(schema_1.timeEntries.date, endIso)))];
                    case 2:
                        timeEntriesData = _b.sent();
                        employeeMetrics = {};
                        for (_i = 0, timeEntriesData_1 = timeEntriesData; _i < timeEntriesData_1.length; _i++) {
                            entry = timeEntriesData_1[_i];
                            if (!employeeMetrics[entry.userId]) {
                                employeeMetrics[entry.userId] = {
                                    userId: entry.userId,
                                    totalHours: 0,
                                    projectCount: new Set(),
                                    taskCount: 0
                                };
                            }
                            employeeMetrics[entry.userId].totalHours += entry.hoursWorked || 0;
                            if (entry.projectId) {
                                employeeMetrics[entry.userId].projectCount.add(entry.projectId);
                            }
                            employeeMetrics[entry.userId].taskCount += 1;
                        }
                        return [2 /*return*/, Object.values(employeeMetrics)
                                .map(function (m) { return ({
                                userId: m.userId,
                                totalHours: m.totalHours,
                                projectCount: m.projectCount.size,
                                taskCount: m.taskCount,
                                averageHoursPerTask: m.taskCount > 0 ? (m.totalHours / m.taskCount).toFixed(2) : 0
                            }); })
                                .sort(function (a, b) { return b.totalHours - a.totalHours; })];
                }
            });
        });
    }),
    /**
     * Export report as PDF - metadata only (implement in separate service)
     */
    generateReportMetadata: readProcedure
        .input(zod_1.z.object({
        type: zod_1.z["enum"](["revenue", "profitability", "customer", "team", "project"]),
        startDate: zod_1.z.date(),
        endDate: zod_1.z.date()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, {
                        type: input.type,
                        generatedAt: new Date().toISOString(),
                        period: input.startDate.toDateString() + " - " + input.endDate.toDateString(),
                        exported: false,
                        format: "json"
                    }];
            });
        });
    })
});
