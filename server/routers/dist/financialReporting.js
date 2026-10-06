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
exports.financialReportingRouter = void 0;
var trpc_1 = require("../_core/trpc");
var zod_1 = require("zod");
var db_1 = require("../db");
var date_fns_1 = require("date-fns");
var schema_1 = require("../../drizzle/schema");
var drizzle_orm_1 = require("drizzle-orm");
var readProcedure = trpc_1.createFeatureRestrictedProcedure("reports:financial");
function getInvoicesByDateRange(startDate, endDate, organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, start, end, conditions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    start = startDate.toISOString().replace('T', ' ').substring(0, 19);
                    end = endDate.toISOString().replace('T', ' ').substring(0, 19);
                    conditions = [drizzle_orm_1.gte(schema_1.invoices.createdAt, start), drizzle_orm_1.lte(schema_1.invoices.createdAt, end)];
                    if (organizationId)
                        conditions.push(drizzle_orm_1.eq(schema_1.invoices.organizationId, organizationId));
                    return [2 /*return*/, db.select().from(schema_1.invoices).where(drizzle_orm_1.and.apply(void 0, conditions))];
            }
        });
    });
}
function getExpensesByDateRange(startDate, endDate, organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, start, end, conditions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    start = startDate.toISOString().replace('T', ' ').substring(0, 19);
                    end = endDate.toISOString().replace('T', ' ').substring(0, 19);
                    conditions = [drizzle_orm_1.gte(schema_1.expenses.expenseDate, start), drizzle_orm_1.lte(schema_1.expenses.expenseDate, end)];
                    if (organizationId)
                        conditions.push(drizzle_orm_1.eq(schema_1.expenses.organizationId, organizationId));
                    return [2 /*return*/, db.select().from(schema_1.expenses).where(drizzle_orm_1.and.apply(void 0, conditions))];
            }
        });
    });
}
function getProjectsByDateRange(startDate, endDate, organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, start, end, conditions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    start = startDate.toISOString().replace('T', ' ').substring(0, 19);
                    end = endDate.toISOString().replace('T', ' ').substring(0, 19);
                    conditions = [drizzle_orm_1.gte(schema_1.projects.createdAt, start), drizzle_orm_1.lte(schema_1.projects.createdAt, end)];
                    if (organizationId)
                        conditions.push(drizzle_orm_1.eq(schema_1.projects.organizationId, organizationId));
                    return [2 /*return*/, db.select().from(schema_1.projects).where(drizzle_orm_1.and.apply(void 0, conditions))];
            }
        });
    });
}
function getExpensesByCategory(startDate, endDate, organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, grouped, _i, rows_1, expense, category;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getExpensesByDateRange(startDate, endDate, organizationId)];
                case 1:
                    rows = _a.sent();
                    grouped = {};
                    for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                        expense = rows_1[_i];
                        category = expense.category || "Uncategorized";
                        if (!grouped[category]) {
                            grouped[category] = { category: category, amount: 0, count: 0 };
                        }
                        grouped[category].amount += expense.amount || 0;
                        grouped[category].count += 1;
                    }
                    return [2 /*return*/, Object.values(grouped)];
            }
        });
    });
}
function getInvoicesByStatus(organizationId) {
    var statuses = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        statuses[_i - 1] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var db, conditions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    conditions = [drizzle_orm_1.inArray(schema_1.invoices.status, statuses)];
                    if (organizationId)
                        conditions.push(drizzle_orm_1.eq(schema_1.invoices.organizationId, organizationId));
                    return [2 /*return*/, conditions.length > 1
                            ? db.select().from(schema_1.invoices).where(drizzle_orm_1.and.apply(void 0, conditions))
                            : db.select().from(schema_1.invoices).where(drizzle_orm_1.inArray(schema_1.invoices.status, statuses))];
            }
        });
    });
}
function getTaxDeductibleExpenses(startDate, endDate, organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getExpensesByDateRange(startDate, endDate, organizationId)];
                case 1:
                    rows = _a.sent();
                    return [2 /*return*/, rows.filter(function (expense) { return expense.category && expense.category.toLowerCase() !== "non-deductible"; })];
            }
        });
    });
}
function getRevenueByClient(limit, organizationId) {
    if (limit === void 0) { limit = 50; }
    return __awaiter(this, void 0, void 0, function () {
        var db, query, rows, revenue, _i, rows_2, invoice, clientId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    query = db.select().from(schema_1.invoices).limit(limit);
                    if (organizationId) {
                        query = query.where(drizzle_orm_1.eq(schema_1.invoices.organizationId, organizationId));
                    }
                    return [4 /*yield*/, query];
                case 2:
                    rows = _a.sent();
                    revenue = {};
                    for (_i = 0, rows_2 = rows; _i < rows_2.length; _i++) {
                        invoice = rows_2[_i];
                        clientId = invoice.clientId || "unknown";
                        if (!revenue[clientId]) {
                            revenue[clientId] = { clientId: clientId, total: 0, invoices: 0 };
                        }
                        revenue[clientId].total += invoice.total || 0;
                        revenue[clientId].invoices += 1;
                    }
                    return [2 /*return*/, Object.values(revenue).sort(function (a, b) { return b.total - a.total; }).slice(0, limit)];
            }
        });
    });
}
function getRevenueByProject(limit, organizationId) {
    if (limit === void 0) { limit = 50; }
    return __awaiter(this, void 0, void 0, function () {
        var rows, revenue, _i, rows_3, project, projectId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getProjectsByDateRange(new Date(0), new Date(), organizationId)];
                case 1:
                    rows = _a.sent();
                    revenue = {};
                    for (_i = 0, rows_3 = rows; _i < rows_3.length; _i++) {
                        project = rows_3[_i];
                        projectId = project.id || "unknown";
                        if (!revenue[projectId]) {
                            revenue[projectId] = { projectId: projectId, totalCost: 0, projectName: project.name || "Unnamed Project" };
                        }
                        revenue[projectId].totalCost += project.actualCost || 0;
                    }
                    return [2 /*return*/, Object.values(revenue).sort(function (a, b) { return b.totalCost - a.totalCost; }).slice(0, limit)];
            }
        });
    });
}
/**
 * Generate P&L (Profit & Loss) statement for given period
 */
function generatePLStatement(startDate, endDate, organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, invoiceRows, totalRevenue, expenseRows, totalExpenses, projectRows, cogs, grossProfit, grossMargin, operatingProfit, operatingMargin, expensesByCategory, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, getInvoicesByDateRange(startDate, endDate, organizationId)];
                case 3:
                    invoiceRows = _a.sent();
                    totalRevenue = invoiceRows.reduce(function (sum, inv) { return sum + (inv.paidAmount || 0); }, 0);
                    return [4 /*yield*/, getExpensesByDateRange(startDate, endDate, organizationId)];
                case 4:
                    expenseRows = _a.sent();
                    totalExpenses = expenseRows.reduce(function (sum, exp) { return sum + (exp.amount || 0); }, 0);
                    return [4 /*yield*/, getProjectsByDateRange(startDate, endDate, organizationId)];
                case 5:
                    projectRows = _a.sent();
                    cogs = projectRows.reduce(function (sum, proj) { return sum + (proj.cost || 0); }, 0);
                    grossProfit = totalRevenue - cogs;
                    grossMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 10000) / 100 : 0;
                    operatingProfit = grossProfit - totalExpenses;
                    operatingMargin = totalRevenue > 0 ? Math.round((operatingProfit / totalRevenue) * 10000) / 100 : 0;
                    return [4 /*yield*/, getExpensesByCategory(startDate, endDate, organizationId)];
                case 6:
                    expensesByCategory = _a.sent();
                    return [2 /*return*/, {
                            period: startDate.toLocaleDateString() + " - " + endDate.toLocaleDateString(),
                            totalRevenue: totalRevenue,
                            cogs: cogs,
                            grossProfit: grossProfit,
                            grossMargin: grossMargin,
                            expenses: expensesByCategory,
                            totalExpenses: totalExpenses,
                            operatingProfit: operatingProfit,
                            operatingMargin: operatingMargin,
                            netProfit: operatingProfit
                        }];
                case 7:
                    error_1 = _a.sent();
                    console.error("[FINANCIAL REPORTING] Error generating P&L:", error_1);
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate cash flow projection
 */
function generateCashFlowProjection(months, organizationId) {
    if (months === void 0) { months = 12; }
    return __awaiter(this, void 0, void 0, function () {
        var db, projection, today, i, month, monthStart, monthEnd, invoicesThisMonth, expectedInflows, expensesThisMonth, expectedOutflows, netCashFlow, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    projection = [];
                    today = new Date();
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < months)) return [3 /*break*/, 7];
                    month = new Date(today.getFullYear(), today.getMonth() + i, 1);
                    monthStart = date_fns_1.startOfMonth(month);
                    monthEnd = date_fns_1.endOfMonth(month);
                    return [4 /*yield*/, getInvoicesByDateRange(monthStart, monthEnd, organizationId)];
                case 4:
                    invoicesThisMonth = _a.sent();
                    expectedInflows = invoicesThisMonth.reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0);
                    return [4 /*yield*/, getExpensesByDateRange(monthStart, monthEnd, organizationId)];
                case 5:
                    expensesThisMonth = _a.sent();
                    expectedOutflows = expensesThisMonth.reduce(function (sum, exp) { return sum + (exp.amount || 0); }, 0);
                    netCashFlow = expectedInflows - expectedOutflows;
                    projection.push({
                        month: month.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
                        inflows: expectedInflows,
                        outflows: expectedOutflows,
                        netCashFlow: netCashFlow
                    });
                    _a.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 3];
                case 7: return [2 /*return*/, projection];
                case 8:
                    error_2 = _a.sent();
                    console.error("[FINANCIAL REPORTING] Error generating cash flow:", error_2);
                    return [2 /*return*/, null];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate receivables aging report
 */
function generateReceivablesAging(organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, invoicesByStatus, today, aged, _i, invoicesByStatus_1, invoice, daysOld, outstandingAmount, totalOutstanding, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, getInvoicesByStatus(organizationId, 'sent', 'partial', 'overdue')];
                case 3:
                    invoicesByStatus = _a.sent();
                    today = new Date();
                    aged = {
                        current: { count: 0, amount: 0 },
                        days30: { count: 0, amount: 0 },
                        days60: { count: 0, amount: 0 },
                        days90: { count: 0, amount: 0 },
                        daysOver90: { count: 0, amount: 0 }
                    };
                    for (_i = 0, invoicesByStatus_1 = invoicesByStatus; _i < invoicesByStatus_1.length; _i++) {
                        invoice = invoicesByStatus_1[_i];
                        daysOld = Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                        outstandingAmount = (invoice.total || 0) - (invoice.paidAmount || 0);
                        if (daysOld <= 0) {
                            aged.current.count++;
                            aged.current.amount += outstandingAmount;
                        }
                        else if (daysOld <= 30) {
                            aged.days30.count++;
                            aged.days30.amount += outstandingAmount;
                        }
                        else if (daysOld <= 60) {
                            aged.days60.count++;
                            aged.days60.amount += outstandingAmount;
                        }
                        else if (daysOld <= 90) {
                            aged.days90.count++;
                            aged.days90.amount += outstandingAmount;
                        }
                        else {
                            aged.daysOver90.count++;
                            aged.daysOver90.amount += outstandingAmount;
                        }
                    }
                    totalOutstanding = aged.current.amount + aged.days30.amount + aged.days60.amount + aged.days90.amount + aged.daysOver90.amount;
                    return [2 /*return*/, {
                            current: __assign(__assign({}, aged.current), { percentage: totalOutstanding > 0 ? Math.round((aged.current.amount / totalOutstanding) * 100) : 0 }),
                            days30: __assign(__assign({}, aged.days30), { percentage: totalOutstanding > 0 ? Math.round((aged.days30.amount / totalOutstanding) * 100) : 0 }),
                            days60: __assign(__assign({}, aged.days60), { percentage: totalOutstanding > 0 ? Math.round((aged.days60.amount / totalOutstanding) * 100) : 0 }),
                            days90: __assign(__assign({}, aged.days90), { percentage: totalOutstanding > 0 ? Math.round((aged.days90.amount / totalOutstanding) * 100) : 0 }),
                            daysOver90: __assign(__assign({}, aged.daysOver90), { percentage: totalOutstanding > 0 ? Math.round((aged.daysOver90.amount / totalOutstanding) * 100) : 0 }),
                            totalOutstanding: totalOutstanding
                        }];
                case 4:
                    error_3 = _a.sent();
                    console.error("[FINANCIAL REPORTING] Error generating aging:", error_3);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.financialReportingRouter = trpc_1.router({
    /**
     * Get P&L for specified period
     */
    getPLStatement: readProcedure
        .input(zod_1.z.object({
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, pl, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, generatePLStatement(new Date(input.startDate), new Date(input.endDate), orgId)];
                    case 1:
                        pl = _b.sent();
                        return [2 /*return*/, pl || { error: 'Failed to generate P&L' }];
                    case 2:
                        error_4 = _b.sent();
                        console.error("[FINANCIAL REPORTING] Error:", error_4);
                        return [2 /*return*/, { error: String(error_4) }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get P&L for current year
     */
    getYearToDatePL: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, startDate, endDate, pl, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        orgId = ctx.user.organizationId;
                        startDate = new Date(new Date().getFullYear(), 0, 1);
                        endDate = new Date();
                        return [4 /*yield*/, generatePLStatement(startDate, endDate, orgId)];
                    case 1:
                        pl = _b.sent();
                        return [2 /*return*/, pl || { error: 'Failed to generate P&L' }];
                    case 2:
                        error_5 = _b.sent();
                        console.error("[FINANCIAL REPORTING] Error:", error_5);
                        return [2 /*return*/, { error: String(error_5) }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get P&L for last 12 months
     */
    get12MonthsPL: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, endDate, startDate, pl, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        orgId = ctx.user.organizationId;
                        endDate = new Date();
                        startDate = date_fns_1.subMonths(endDate, 12);
                        return [4 /*yield*/, generatePLStatement(startDate, endDate, orgId)];
                    case 1:
                        pl = _b.sent();
                        return [2 /*return*/, pl || { error: 'Failed to generate P&L' }];
                    case 2:
                        error_6 = _b.sent();
                        console.error("[FINANCIAL REPORTING] Error:", error_6);
                        return [2 /*return*/, { error: String(error_6) }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get monthly P&L breakdown
     */
    getMonthlyPLBreakdown: readProcedure
        .input(zod_1.z.object({ months: zod_1.z.number()["default"](12) }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, breakdown, today, i, month, monthStart, monthEnd, pl, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        orgId = ctx.user.organizationId;
                        breakdown = [];
                        today = new Date();
                        i = input.months - 1;
                        _b.label = 1;
                    case 1:
                        if (!(i >= 0)) return [3 /*break*/, 4];
                        month = new Date(today.getFullYear(), today.getMonth() - i, 1);
                        monthStart = date_fns_1.startOfMonth(month);
                        monthEnd = date_fns_1.endOfMonth(month);
                        return [4 /*yield*/, generatePLStatement(monthStart, monthEnd, orgId)];
                    case 2:
                        pl = _b.sent();
                        if (pl) {
                            breakdown.push(__assign({ month: month.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) }, pl));
                        }
                        _b.label = 3;
                    case 3:
                        i--;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, { breakdown: breakdown }];
                    case 5:
                        error_7 = _b.sent();
                        console.error("[FINANCIAL REPORTING] Error:", error_7);
                        return [2 /*return*/, { breakdown: [], error: String(error_7) }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get cash flow projection
     */
    getCashFlowProjection: readProcedure
        .input(zod_1.z.object({ months: zod_1.z.number()["default"](12) }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, projection, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, generateCashFlowProjection(input.months, orgId)];
                    case 1:
                        projection = _b.sent();
                        return [2 /*return*/, { projection: projection } || { projection: [] }];
                    case 2:
                        error_8 = _b.sent();
                        console.error("[FINANCIAL REPORTING] Error:", error_8);
                        return [2 /*return*/, { projection: [], error: String(error_8) }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get receivables aging
     */
    getReceivablesAging: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, aging, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, generateReceivablesAging(orgId)];
                    case 1:
                        aging = _b.sent();
                        return [2 /*return*/, aging || { error: 'Failed to generate aging report' }];
                    case 2:
                        error_9 = _b.sent();
                        console.error("[FINANCIAL REPORTING] Error:", error_9);
                        return [2 /*return*/, { error: String(error_9) }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get accounts receivable summary
     */
    getARSummary: readProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, invoices_2, today, totalAR, totalOverdue, totalDays, debtors, _loop_1, _i, invoices_1, invoice, topDebtors, avgCollectionDays, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db) {
                            return [2 /*return*/, { totalAR: 0, overdue: 0, avgCollectionDays: 0, topDebtors: [] }];
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, getInvoicesByStatus(orgId, 'sent', 'partial', 'overdue')];
                    case 3:
                        invoices_2 = _b.sent();
                        today = new Date();
                        totalAR = 0;
                        totalOverdue = 0;
                        totalDays = 0;
                        debtors = [];
                        _loop_1 = function (invoice) {
                            var outstanding = (invoice.total || 0) - (invoice.paidAmount || 0);
                            totalAR += outstanding;
                            totalDays += Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                            if (new Date(invoice.dueDate) < today) {
                                totalOverdue += outstanding;
                            }
                            var debtorIndex = debtors.findIndex(function (d) { return d.clientId === invoice.clientId; });
                            if (debtorIndex >= 0) {
                                debtors[debtorIndex].amount += outstanding;
                            }
                            else {
                                debtors.push({ clientId: invoice.clientId, amount: outstanding });
                            }
                        };
                        for (_i = 0, invoices_1 = invoices_2; _i < invoices_1.length; _i++) {
                            invoice = invoices_1[_i];
                            _loop_1(invoice);
                        }
                        topDebtors = debtors
                            .sort(function (a, b) { return b.amount - a.amount; })
                            .slice(0, 10);
                        avgCollectionDays = invoices_2.length > 0 ? Math.round(totalDays / invoices_2.length) : 0;
                        return [2 /*return*/, {
                                totalAR: totalAR,
                                overdue: totalOverdue,
                                avgCollectionDays: avgCollectionDays,
                                topDebtors: topDebtors
                            }];
                    case 4:
                        error_10 = _b.sent();
                        console.error("[FINANCIAL REPORTING] Error:", error_10);
                        return [2 /*return*/, { totalAR: 0, overdue: 0, avgCollectionDays: 0, topDebtors: [] }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get tax-deductible expenses
     */
    getTaxDeductibleExpenses: readProcedure
        .input(zod_1.z.object({ year: zod_1.z.number() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, startDate, endDate, expenses_1, total, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { expenses: [], total: 0 }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        orgId = ctx.user.organizationId;
                        startDate = new Date(input.year, 0, 1);
                        endDate = new Date(input.year + 1, 0, 1);
                        return [4 /*yield*/, getTaxDeductibleExpenses(startDate, endDate, orgId)];
                    case 3:
                        expenses_1 = _b.sent();
                        total = expenses_1.reduce(function (sum, exp) { return sum + (exp.amount || 0); }, 0);
                        return [2 /*return*/, { expenses: expenses_1, total: total }];
                    case 4:
                        error_11 = _b.sent();
                        console.error("[FINANCIAL REPORTING] Error:", error_11);
                        return [2 /*return*/, { expenses: [], total: 0, error: String(error_11) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get revenue by client
     */
    getRevenueByClient: readProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, revenue, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { clients: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, getRevenueByClient(input.limit, orgId)];
                    case 3:
                        revenue = _b.sent();
                        return [2 /*return*/, { clients: revenue }];
                    case 4:
                        error_12 = _b.sent();
                        console.error("[FINANCIAL REPORTING] Error:", error_12);
                        return [2 /*return*/, { clients: [], error: String(error_12) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get revenue by project
     */
    getRevenueByProject: readProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number()["default"](50) }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, revenue, error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _b.sent();
                        if (!db)
                            return [2 /*return*/, { projects: [] }];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, getRevenueByProject(input.limit, orgId)];
                    case 3:
                        revenue = _b.sent();
                        return [2 /*return*/, { projects: revenue }];
                    case 4:
                        error_13 = _b.sent();
                        console.error("[FINANCIAL REPORTING] Error:", error_13);
                        return [2 /*return*/, { projects: [], error: String(error_13) }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
