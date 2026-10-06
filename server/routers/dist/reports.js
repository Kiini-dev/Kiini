"use strict";
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
exports.reportsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
exports.reportsRouter = trpc_1.router({
    // Profit & Loss Report
    profitAndLoss: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.date(),
        endDate: zod_1.z.date()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, revenueAccounts, expenseAccounts, totalRevenue, totalExpenses, netIncome;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.accountType, 'revenue'), drizzle_orm_1.eq(schema_1.accounts.isActive, 1)))];
                    case 2:
                        revenueAccounts = _b.sent();
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.accounts)
                                .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.accountType, 'expense'), drizzle_orm_1.eq(schema_1.accounts.isActive, 1)))];
                    case 3:
                        expenseAccounts = _b.sent();
                        totalRevenue = revenueAccounts.reduce(function (sum, a) { return sum + (a.balance || 0); }, 0);
                        totalExpenses = expenseAccounts.reduce(function (sum, a) { return sum + (a.balance || 0); }, 0);
                        netIncome = totalRevenue - totalExpenses;
                        return [2 /*return*/, {
                                period: {
                                    startDate: input.startDate,
                                    endDate: input.endDate
                                },
                                revenue: {
                                    accounts: revenueAccounts,
                                    total: totalRevenue
                                },
                                expenses: {
                                    accounts: expenseAccounts,
                                    total: totalExpenses
                                },
                                netIncome: netIncome,
                                netIncomePercentage: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0
                            }];
                }
            });
        });
    }),
    // Balance Sheet Report
    balanceSheet: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, assetAccounts, liabilityAccounts, equityAccounts, totalAssets, totalLiabilities, totalEquity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.accounts)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.accountType, 'asset'), drizzle_orm_1.eq(schema_1.accounts.isActive, 1)))];
                case 2:
                    assetAccounts = _a.sent();
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.accounts)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.accountType, 'liability'), drizzle_orm_1.eq(schema_1.accounts.isActive, 1)))];
                case 3:
                    liabilityAccounts = _a.sent();
                    return [4 /*yield*/, database
                            .select()
                            .from(schema_1.accounts)
                            .where(drizzle_orm_1.and(drizzle_orm_1.eq(schema_1.accounts.accountType, 'equity'), drizzle_orm_1.eq(schema_1.accounts.isActive, 1)))];
                case 4:
                    equityAccounts = _a.sent();
                    totalAssets = assetAccounts.reduce(function (sum, a) { return sum + (a.balance || 0); }, 0);
                    totalLiabilities = liabilityAccounts.reduce(function (sum, a) { return sum + (a.balance || 0); }, 0);
                    totalEquity = equityAccounts.reduce(function (sum, a) { return sum + (a.balance || 0); }, 0);
                    return [2 /*return*/, {
                            assets: {
                                accounts: assetAccounts,
                                total: totalAssets
                            },
                            liabilities: {
                                accounts: liabilityAccounts,
                                total: totalLiabilities
                            },
                            equity: {
                                accounts: equityAccounts,
                                total: totalEquity
                            },
                            totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
                            balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
                        }];
            }
        });
    }); }),
    // Sales Report
    salesReport: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.date(),
        endDate: zod_1.z.date(),
        groupBy: zod_1.z["enum"](['day', 'week', 'month'])["default"]('month')
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, invoiceData, clientsData, salesByClient, totalSales, totalPaid, totalPending;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.invoices)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.invoices.issueDate, input.startDate.toISOString()), drizzle_orm_1.lte(schema_1.invoices.issueDate, input.endDate.toISOString())))];
                    case 2:
                        invoiceData = _b.sent();
                        return [4 /*yield*/, database.select().from(schema_1.clients)];
                    case 3:
                        clientsData = _b.sent();
                        salesByClient = {};
                        invoiceData.forEach(function (inv) {
                            var client = clientsData.find(function (c) { return c.id === inv.clientId; });
                            var clientName = (client === null || client === void 0 ? void 0 : client.companyName) || 'Unknown';
                            if (!salesByClient[clientName]) {
                                salesByClient[clientName] = {
                                    clientId: inv.clientId,
                                    clientName: clientName,
                                    invoiceCount: 0,
                                    totalSales: 0,
                                    paidAmount: 0,
                                    pendingAmount: 0
                                };
                            }
                            salesByClient[clientName].invoiceCount++;
                            salesByClient[clientName].totalSales += inv.total || 0;
                            salesByClient[clientName].paidAmount += inv.paidAmount || 0;
                            salesByClient[clientName].pendingAmount += (inv.total || 0) - (inv.paidAmount || 0);
                        });
                        totalSales = Object.values(salesByClient).reduce(function (sum, s) { return sum + s.totalSales; }, 0);
                        totalPaid = Object.values(salesByClient).reduce(function (sum, s) { return sum + s.paidAmount; }, 0);
                        totalPending = Object.values(salesByClient).reduce(function (sum, s) { return sum + s.pendingAmount; }, 0);
                        return [2 /*return*/, {
                                period: {
                                    startDate: input.startDate,
                                    endDate: input.endDate
                                },
                                summary: {
                                    totalInvoices: invoiceData.length,
                                    totalSales: totalSales,
                                    totalPaid: totalPaid,
                                    totalPending: totalPending,
                                    collectionRate: totalSales > 0 ? (totalPaid / totalSales) * 100 : 0
                                },
                                byClient: Object.values(salesByClient),
                                byStatus: {
                                    paid: invoiceData.filter(function (i) { return i.status === 'paid'; }).length,
                                    pending: invoiceData.filter(function (i) { return i.status === 'sent'; }).length,
                                    overdue: invoiceData.filter(function (i) { return i.status === 'overdue'; }).length,
                                    draft: invoiceData.filter(function (i) { return i.status === 'draft'; }).length
                                }
                            }];
                }
            });
        });
    }),
    // Cash Flow Report
    cashFlowReport: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.date(),
        endDate: zod_1.z.date()
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, paymentData, expenseData, totalInflow, totalOutflow, netCashFlow, paymentsByMethod;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.payments)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.payments.paymentDate, input.startDate.toISOString()), drizzle_orm_1.lte(schema_1.payments.paymentDate, input.endDate.toISOString())))];
                    case 2:
                        paymentData = _b.sent();
                        return [4 /*yield*/, database
                                .select()
                                .from(schema_1.expenses)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(schema_1.expenses.expenseDate, input.startDate.toISOString()), drizzle_orm_1.lte(schema_1.expenses.expenseDate, input.endDate.toISOString())))];
                    case 3:
                        expenseData = _b.sent();
                        totalInflow = paymentData.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        totalOutflow = expenseData.reduce(function (sum, e) { return sum + (e.amount || 0); }, 0);
                        netCashFlow = totalInflow - totalOutflow;
                        paymentsByMethod = {};
                        paymentData.forEach(function (p) {
                            var method = p.paymentMethod || 'other';
                            paymentsByMethod[method] = (paymentsByMethod[method] || 0) + (p.amount || 0);
                        });
                        return [2 /*return*/, {
                                period: {
                                    startDate: input.startDate,
                                    endDate: input.endDate
                                },
                                inflow: {
                                    totalPayments: totalInflow,
                                    paymentCount: paymentData.length,
                                    byMethod: paymentsByMethod
                                },
                                outflow: {
                                    totalExpenses: totalOutflow,
                                    expenseCount: expenseData.length
                                },
                                netCashFlow: netCashFlow,
                                cashFlowTrend: netCashFlow > 0 ? 'positive' : netCashFlow < 0 ? 'negative' : 'neutral'
                            }];
                }
            });
        });
    }),
    // Monthly Recurring Revenue (MRR)
    mrr: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, recs, _a, _b, invoicesTable, monthlyTotal, _loop_1, _i, recs_1, r;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _c.sent();
                    if (!database)
                        return [2 /*return*/, null];
                    _b = (_a = database.select()).from;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 2: return [4 /*yield*/, _b.apply(_a, [(_c.sent()).recurringInvoices])];
                case 3:
                    recs = _c.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 4:
                    invoicesTable = (_c.sent()).invoices;
                    monthlyTotal = 0;
                    _loop_1 = function (r) {
                        var templateInvoice, res, amount, factor;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    templateInvoice = null;
                                    if (!r.templateInvoiceId) return [3 /*break*/, 2];
                                    return [4 /*yield*/, database.select().from(invoicesTable).where(drizzle_orm_1.eq(invoicesTable.id, r.templateInvoiceId)).limit(1)];
                                case 1:
                                    res = _a.sent();
                                    templateInvoice = res === null || res === void 0 ? void 0 : res[0];
                                    _a.label = 2;
                                case 2:
                                    amount = (templateInvoice === null || templateInvoice === void 0 ? void 0 : templateInvoice.total) || 0;
                                    factor = (function () {
                                        switch (r.frequency) {
                                            case 'weekly': return 52 / 12;
                                            case 'biweekly': return 26 / 12;
                                            case 'monthly': return 1;
                                            case 'quarterly': return 1 / 3;
                                            case 'annually': return 1 / 12;
                                            default: return 0;
                                        }
                                    })();
                                    monthlyTotal += amount * factor;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, recs_1 = recs;
                    _c.label = 5;
                case 5:
                    if (!(_i < recs_1.length)) return [3 /*break*/, 8];
                    r = recs_1[_i];
                    return [5 /*yield**/, _loop_1(r)];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [2 /*return*/, {
                        mrr: Math.round(monthlyTotal),
                        currency: 'KES',
                        sourceCount: recs.length
                    }];
            }
        });
    }); }),
    // Project performance metrics
    projectMetrics: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, projectsTable, allProjects, total, completed, avgProgress, onTimeCompleted, onTimeRate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                case 2:
                    projectsTable = (_a.sent()).projects;
                    return [4 /*yield*/, database.select().from(projectsTable)];
                case 3:
                    allProjects = _a.sent();
                    total = allProjects.length;
                    completed = allProjects.filter(function (p) { return p.status === 'completed'; }).length;
                    avgProgress = total > 0 ? Math.round((allProjects.reduce(function (s, p) { return s + (p.progress || 0); }, 0) / total) * 100) / 100 : 0;
                    onTimeCompleted = allProjects.filter(function (p) { return p.status === 'completed' && p.actualEndDate && p.endDate && new Date(p.actualEndDate) <= new Date(p.endDate); }).length;
                    onTimeRate = completed > 0 ? Math.round((onTimeCompleted / completed) * 10000) / 100 : 0;
                    return [2 /*return*/, {
                            totalProjects: total,
                            completedProjects: completed,
                            completionRate: total > 0 ? Math.round((completed / total) * 10000) / 100 : 0,
                            avgProgress: avgProgress,
                            onTimeCompletionRate: onTimeRate
                        }];
            }
        });
    }); }),
    // Simple cash flow forecast (based on average monthly inflow)
    cashFlowForecast: trpc_1.protectedProcedure
        .input(zod_1.z.object({ monthsAhead: zod_1.z.number().min(1).max(24)["default"](3) }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, paymentsTable, now, lookbackStart, payments, totalInflow, avgMonthly, forecast, i, d;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        paymentsTable = (_b.sent()).payments;
                        now = new Date();
                        lookbackStart = new Date(now);
                        lookbackStart.setMonth(lookbackStart.getMonth() - 3);
                        return [4 /*yield*/, database
                                .select()
                                .from(paymentsTable)
                                .where(drizzle_orm_1.and(drizzle_orm_1.gte(paymentsTable.paymentDate, lookbackStart.toISOString()), drizzle_orm_1.lte(paymentsTable.paymentDate, now.toISOString())))];
                    case 3:
                        payments = _b.sent();
                        totalInflow = payments.reduce(function (s, p) { return s + (p.amount || 0); }, 0);
                        avgMonthly = totalInflow / 3;
                        forecast = [];
                        for (i = 1; i <= input.monthsAhead; i++) {
                            d = new Date(now);
                            d.setMonth(d.getMonth() + i);
                            forecast.push({ month: d.toISOString().slice(0, 7), projectedInflow: Math.round(avgMonthly) });
                        }
                        return [2 /*return*/, {
                                lookbackMonths: 3,
                                avgMonthlyInflow: Math.round(avgMonthly),
                                forecast: forecast
                            }];
                }
            });
        });
    }),
    // Customer Analysis Report
    customerAnalysis: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, clientsData, invoiceData, paymentData, customerMetrics, topCustomers, totalCustomerRevenue, avgCustomerValue;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _b.sent();
                    if (!database)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, database.select().from(schema_1.clients)];
                case 2:
                    clientsData = _b.sent();
                    return [4 /*yield*/, database.select().from(schema_1.invoices)];
                case 3:
                    invoiceData = _b.sent();
                    return [4 /*yield*/, database.select().from(schema_1.payments)];
                case 4:
                    paymentData = _b.sent();
                    customerMetrics = clientsData.map(function (client) {
                        var clientInvoices = invoiceData.filter(function (i) { return i.clientId === client.id; });
                        var clientPayments = paymentData.filter(function (p) { return p.clientId === client.id; });
                        var totalRevenue = clientInvoices.reduce(function (sum, i) { return sum + (i.total || 0); }, 0);
                        var totalPaid = clientPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
                        var outstanding = totalRevenue - totalPaid;
                        var avgInvoiceValue = clientInvoices.length > 0 ? totalRevenue / clientInvoices.length : 0;
                        return {
                            clientId: client.id,
                            clientName: client.companyName,
                            contactPerson: client.contactPerson,
                            invoiceCount: clientInvoices.length,
                            totalRevenue: totalRevenue,
                            totalPaid: totalPaid,
                            outstanding: outstanding,
                            avgInvoiceValue: avgInvoiceValue,
                            paymentRate: totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0,
                            status: client.status
                        };
                    });
                    // Sort by revenue
                    customerMetrics.sort(function (a, b) { return b.totalRevenue - a.totalRevenue; });
                    topCustomers = customerMetrics.slice(0, 10);
                    totalCustomerRevenue = customerMetrics.reduce(function (sum, c) { return sum + c.totalRevenue; }, 0);
                    avgCustomerValue = customerMetrics.length > 0 ? totalCustomerRevenue / customerMetrics.length : 0;
                    return [2 /*return*/, {
                            summary: {
                                totalCustomers: customerMetrics.length,
                                totalRevenue: totalCustomerRevenue,
                                avgCustomerValue: avgCustomerValue,
                                topCustomerRevenue: ((_a = topCustomers[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0
                            },
                            topCustomers: topCustomers,
                            allCustomers: customerMetrics
                        }];
            }
        });
    }); }),
    // Aging Report (for receivables)
    agingReport: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, invoiceData, today, aged, totals, grandTotal;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, database.select().from(schema_1.invoices)];
                case 2:
                    invoiceData = _a.sent();
                    today = new Date();
                    aged = {
                        current: [],
                        thirtyDays: [],
                        sixtyDays: [],
                        ninetyDays: [],
                        over90Days: []
                    };
                    invoiceData.forEach(function (inv) {
                        if (inv.status === 'paid')
                            return;
                        var daysOverdue = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                        var outstanding = (inv.total || 0) - (inv.paidAmount || 0);
                        if (daysOverdue <= 0) {
                            aged.current.push(__assign(__assign({}, inv), { outstanding: outstanding, daysOverdue: 0 }));
                        }
                        else if (daysOverdue <= 30) {
                            aged.thirtyDays.push(__assign(__assign({}, inv), { outstanding: outstanding, daysOverdue: daysOverdue }));
                        }
                        else if (daysOverdue <= 60) {
                            aged.sixtyDays.push(__assign(__assign({}, inv), { outstanding: outstanding, daysOverdue: daysOverdue }));
                        }
                        else if (daysOverdue <= 90) {
                            aged.ninetyDays.push(__assign(__assign({}, inv), { outstanding: outstanding, daysOverdue: daysOverdue }));
                        }
                        else {
                            aged.over90Days.push(__assign(__assign({}, inv), { outstanding: outstanding, daysOverdue: daysOverdue }));
                        }
                    });
                    totals = {
                        current: aged.current.reduce(function (sum, i) { return sum + i.outstanding; }, 0),
                        thirtyDays: aged.thirtyDays.reduce(function (sum, i) { return sum + i.outstanding; }, 0),
                        sixtyDays: aged.sixtyDays.reduce(function (sum, i) { return sum + i.outstanding; }, 0),
                        ninetyDays: aged.ninetyDays.reduce(function (sum, i) { return sum + i.outstanding; }, 0),
                        over90Days: aged.over90Days.reduce(function (sum, i) { return sum + i.outstanding; }, 0)
                    };
                    grandTotal = Object.values(totals).reduce(function (sum, v) { return sum + v; }, 0);
                    return [2 /*return*/, {
                            aged: aged,
                            totals: totals,
                            grandTotal: grandTotal,
                            percentages: {
                                current: grandTotal > 0 ? (totals.current / grandTotal) * 100 : 0,
                                thirtyDays: grandTotal > 0 ? (totals.thirtyDays / grandTotal) * 100 : 0,
                                sixtyDays: grandTotal > 0 ? (totals.sixtyDays / grandTotal) * 100 : 0,
                                ninetyDays: grandTotal > 0 ? (totals.ninetyDays / grandTotal) * 100 : 0,
                                over90Days: grandTotal > 0 ? (totals.over90Days / grandTotal) * 100 : 0
                            }
                        }];
            }
        });
    }); }),
    // Schema introspection for custom report builder
    schemaIntrospection: trpc_1.protectedProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, schemaMetadata;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, { tables: [] }];
                    schemaMetadata = {
                        tables: [
                            {
                                value: "invoices",
                                label: "Invoices",
                                fields: [
                                    { value: "invoiceNumber", label: "Invoice Number", type: "string" },
                                    { value: "clientId", label: "Client", type: "string" },
                                    { value: "amount", label: "Amount", type: "number" },
                                    { value: "total", label: "Total", type: "number" },
                                    { value: "status", label: "Status", type: "string" },
                                    { value: "issueDate", label: "Issue Date", type: "date" },
                                    { value: "dueDate", label: "Due Date", type: "date" },
                                    { value: "paidAmount", label: "Paid Amount", type: "number" },
                                    { value: "taxAmount", label: "Tax Amount", type: "number" },
                                    { value: "discountAmount", label: "Discount Amount", type: "number" },
                                ]
                            },
                            {
                                value: "payments",
                                label: "Payments",
                                fields: [
                                    { value: "paymentNumber", label: "Payment Number", type: "string" },
                                    { value: "invoiceId", label: "Invoice", type: "string" },
                                    { value: "amount", label: "Amount", type: "number" },
                                    { value: "paymentDate", label: "Payment Date", type: "date" },
                                    { value: "method", label: "Payment Method", type: "string" },
                                    { value: "status", label: "Status", type: "string" },
                                    { value: "reference", label: "Reference", type: "string" },
                                ]
                            },
                            {
                                value: "expenses",
                                label: "Expenses",
                                fields: [
                                    { value: "expenseNumber", label: "Expense Number", type: "string" },
                                    { value: "category", label: "Category", type: "string" },
                                    { value: "amount", label: "Amount", type: "number" },
                                    { value: "vendor", label: "Vendor", type: "string" },
                                    { value: "status", label: "Status", type: "string" },
                                    { value: "expenseDate", label: "Expense Date", type: "date" },
                                    { value: "description", label: "Description", type: "string" },
                                ]
                            },
                            {
                                value: "employees",
                                label: "Employees",
                                fields: [
                                    { value: "firstName", label: "First Name", type: "string" },
                                    { value: "lastName", label: "Last Name", type: "string" },
                                    { value: "email", label: "Email", type: "string" },
                                    { value: "departmentId", label: "Department", type: "string" },
                                    { value: "hireDate", label: "Hire Date", type: "date" },
                                    { value: "salary", label: "Salary", type: "number" },
                                    { value: "status", label: "Status", type: "string" },
                                ]
                            },
                            {
                                value: "payroll",
                                label: "Payroll",
                                fields: [
                                    { value: "employeeId", label: "Employee", type: "string" },
                                    { value: "basicSalary", label: "Basic Salary", type: "number" },
                                    { value: "allowances", label: "Allowances", type: "number" },
                                    { value: "deductions", label: "Deductions", type: "number" },
                                    { value: "netPay", label: "Net Pay", type: "number" },
                                    { value: "paymentDate", label: "Payment Date", type: "date" },
                                    { value: "taxAmount", label: "Tax Amount", type: "number" },
                                ]
                            },
                            {
                                value: "clients",
                                label: "Clients",
                                fields: [
                                    { value: "name", label: "Name", type: "string" },
                                    { value: "email", label: "Email", type: "string" },
                                    { value: "phone", label: "Phone", type: "string" },
                                    { value: "city", label: "City", type: "string" },
                                    { value: "country", label: "Country", type: "string" },
                                    { value: "status", label: "Status", type: "string" },
                                    { value: "createdAt", label: "Created Date", type: "date" },
                                ]
                            },
                            {
                                value: "projects",
                                label: "Projects",
                                fields: [
                                    { value: "name", label: "Name", type: "string" },
                                    { value: "status", label: "Status", type: "string" },
                                    { value: "budget", label: "Budget", type: "number" },
                                    { value: "spent", label: "Spent", type: "number" },
                                    { value: "startDate", label: "Start Date", type: "date" },
                                    { value: "endDate", label: "End Date", type: "date" },
                                    { value: "clientId", label: "Client", type: "string" },
                                ]
                            },
                        ]
                    };
                    return [2 /*return*/, schemaMetadata];
            }
        });
    }); }),
    // Get data for custom reports
    getReportData: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        table: zod_1.z.string(),
        fields: zod_1.z.array(zod_1.z.string()),
        filters: zod_1.z.array(zod_1.z.object({
            field: zod_1.z.string(),
            operator: zod_1.z["enum"](['eq', 'gt', 'lt', 'gte', 'lte', 'contains', 'startsWith']),
            value: zod_1.z.any()
        })).optional(),
        limit: zod_1.z.number()["default"](1000),
        offset: zod_1.z.number()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, invoiceData, paymentData, expenseData, clientData, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 13, , 14]);
                        _b = input.table;
                        switch (_b) {
                            case 'invoices': return [3 /*break*/, 3];
                            case 'payments': return [3 /*break*/, 5];
                            case 'expenses': return [3 /*break*/, 7];
                            case 'clients': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 3: return [4 /*yield*/, database.select().from(schema_1.invoices)];
                    case 4:
                        invoiceData = _c.sent();
                        return [2 /*return*/, invoiceData.slice(input.offset, input.offset + input.limit)];
                    case 5: return [4 /*yield*/, database.select().from(schema_1.payments)];
                    case 6:
                        paymentData = _c.sent();
                        return [2 /*return*/, paymentData.slice(input.offset, input.offset + input.limit)];
                    case 7: return [4 /*yield*/, database.select().from(schema_1.expenses)];
                    case 8:
                        expenseData = _c.sent();
                        return [2 /*return*/, expenseData.slice(input.offset, input.offset + input.limit)];
                    case 9: return [4 /*yield*/, database.select().from(schema_1.clients)];
                    case 10:
                        clientData = _c.sent();
                        return [2 /*return*/, clientData.slice(input.offset, input.offset + input.limit)];
                    case 11: return [2 /*return*/, []];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        err_1 = _c.sent();
                        console.error("Error fetching " + input.table + " data:", err_1);
                        return [2 /*return*/, []];
                    case 14: return [2 /*return*/];
                }
            });
        });
    }),
    // Export report
    exportReport: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        reportType: zod_1.z["enum"](['pl', 'balanceSheet', 'sales', 'cashFlow', 'customer', 'aging']),
        format: zod_1.z["enum"](['json', 'csv'])["default"]('json'),
        startDate: zod_1.z.date().optional(),
        endDate: zod_1.z.date().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // This would call the appropriate report function and format the output
                return [2 /*return*/, {
                        success: true,
                        format: (input === null || input === void 0 ? void 0 : input.format) || 'json',
                        message: "Report exported as " + ((input === null || input === void 0 ? void 0 : input.format) || 'json')
                    }];
            });
        });
    })
});
