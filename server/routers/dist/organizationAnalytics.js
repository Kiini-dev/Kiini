"use strict";
/**
 * Organization Analytics Router
 *
 * Provides organizational-level analytics, metrics, and insights for org admins.
 * Complements enterpriseTenants router (super-admin multi-tenant view).
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
exports.organizationAnalyticsRouter = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var zod_1 = require("zod");
var db_1 = require("../db");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
// Org-scoped analytics procedure
var orgAnalyticsViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('analytics:view')
    .use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (!ctx.user.organizationId) {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Organization access required'
        });
    }
    return next({ ctx: ctx });
});
exports.organizationAnalyticsRouter = trpc_1.router({
    /**
     * Get organization dashboard metrics overview
     */
    getDashboardMetrics: orgAnalyticsViewProcedure
        .input(zod_1.z.object({
        month: zod_1.z.string().optional().describe('YYYY-MM format'),
        year: zod_1.z.number().optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, now, month, _b, year, monthNum, monthStart, monthEnd, revenueData, expenseData, teamData, clientData, revenue, expenses_1, team, clients_1, error_1;
            var _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _g.sent();
                        if (!db)
                            throw new Error('Database not available');
                        orgId = ctx.user.organizationId;
                        now = new Date();
                        month = input.month || now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0');
                        _b = month.split('-').map(Number), year = _b[0], monthNum = _b[1];
                        monthStart = new Date(year, monthNum - 1, 1);
                        monthEnd = new Date(year, monthNum, 0);
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            SELECT \n              COUNT(*) as invoiceCount,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as totalRevenue,\n              COUNT(CASE WHEN status = 'paid' THEN 1 END) as paidCount,\n              COALESCE(SUM(CASE WHEN status = 'paid' THEN CAST(amount AS DECIMAL(10,2)) ELSE 0 END), 0) as paidAmount\n            FROM invoices\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n          "], ["\n            SELECT \n              COUNT(*) as invoiceCount,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as totalRevenue,\n              COUNT(CASE WHEN status = 'paid' THEN 1 END) as paidCount,\n              COALESCE(SUM(CASE WHEN status = 'paid' THEN CAST(amount AS DECIMAL(10,2)) ELSE 0 END), 0) as paidAmount\n            FROM invoices\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n          "])), orgId, monthStart.toISOString(), monthEnd.toISOString()))];
                    case 2:
                        revenueData = (_g.sent())[0];
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n            SELECT \n              COUNT(*) as expenseCount,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as totalExpenses,\n              COUNT(DISTINCT category) as categoryCount\n            FROM expenses\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n          "], ["\n            SELECT \n              COUNT(*) as expenseCount,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as totalExpenses,\n              COUNT(DISTINCT category) as categoryCount\n            FROM expenses\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n          "])), orgId, monthStart.toISOString(), monthEnd.toISOString()))];
                    case 3:
                        expenseData = (_g.sent())[0];
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n            SELECT \n              COUNT(*) as activeEmployees,\n              COUNT(DISTINCT department) as departmentCount\n            FROM employees\n            WHERE organizationId = ", "\n              AND status = 'active'\n          "], ["\n            SELECT \n              COUNT(*) as activeEmployees,\n              COUNT(DISTINCT department) as departmentCount\n            FROM employees\n            WHERE organizationId = ", "\n              AND status = 'active'\n          "])), orgId))];
                    case 4:
                        teamData = (_g.sent())[0];
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n            SELECT \n              COUNT(*) as totalClients,\n              COUNT(CASE WHEN status = 'active' THEN 1 END) as activeClients\n            FROM clients\n            WHERE organizationId = ", "\n          "], ["\n            SELECT \n              COUNT(*) as totalClients,\n              COUNT(CASE WHEN status = 'active' THEN 1 END) as activeClients\n            FROM clients\n            WHERE organizationId = ", "\n          "])), orgId))];
                    case 5:
                        clientData = (_g.sent())[0];
                        revenue = ((_c = revenueData) === null || _c === void 0 ? void 0 : _c[0]) || {};
                        expenses_1 = ((_d = expenseData) === null || _d === void 0 ? void 0 : _d[0]) || {};
                        team = ((_e = teamData) === null || _e === void 0 ? void 0 : _e[0]) || {};
                        clients_1 = ((_f = clientData) === null || _f === void 0 ? void 0 : _f[0]) || {};
                        return [2 /*return*/, {
                                period: month,
                                revenue: {
                                    total: parseFloat(revenue.totalRevenue || 0),
                                    invoiceCount: revenue.invoiceCount || 0,
                                    paid: parseFloat(revenue.paidAmount || 0),
                                    paidCount: revenue.paidCount || 0,
                                    pending: parseFloat(revenue.totalRevenue || 0) - parseFloat(revenue.paidAmount || 0)
                                },
                                expenses: {
                                    total: parseFloat(expenses_1.totalExpenses || 0),
                                    count: expenses_1.expenseCount || 0,
                                    categories: expenses_1.categoryCount || 0
                                },
                                team: {
                                    activeEmployees: team.activeEmployees || 0,
                                    departments: team.departmentCount || 0
                                },
                                clients: {
                                    total: clients_1.totalClients || 0,
                                    active: clients_1.activeClients || 0
                                },
                                profitMargin: revenue.totalRevenue
                                    ? (((parseFloat(revenue.totalRevenue || 0) - parseFloat(expenses_1.totalExpenses || 0)) / parseFloat(revenue.totalRevenue || 0)) * 100).toFixed(2)
                                    : 0
                            }];
                    case 6:
                        error_1 = _g.sent();
                        console.error('Error getting dashboard metrics:', error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch dashboard metrics'
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get revenue trend over time
     */
    getRevenueTrend: orgAnalyticsViewProcedure
        .input(zod_1.z.object({
        months: zod_1.z.number().min(3).max(12)["default"](6)
    }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, months, trendData, i, d, year, month, monthStr, start, end, monthData, data, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error('Database not available');
                        orgId = ctx.user.organizationId;
                        months = input.months;
                        trendData = [];
                        i = months - 1;
                        _c.label = 2;
                    case 2:
                        if (!(i >= 0)) return [3 /*break*/, 5];
                        d = new Date();
                        d.setMonth(d.getMonth() - i);
                        year = d.getFullYear();
                        month = String(d.getMonth() + 1).padStart(2, '0');
                        monthStr = year + "-" + month;
                        start = new Date(year, d.getMonth(), 1);
                        end = new Date(year, d.getMonth() + 1, 0);
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n              SELECT \n                COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as revenue,\n                COUNT(*) as invoiceCount\n              FROM invoices\n              WHERE organizationId = ", "\n                AND createdAt BETWEEN ", " AND ", "\n            "], ["\n              SELECT \n                COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as revenue,\n                COUNT(*) as invoiceCount\n              FROM invoices\n              WHERE organizationId = ", "\n                AND createdAt BETWEEN ", " AND ", "\n            "])), orgId, start.toISOString(), end.toISOString()))];
                    case 3:
                        monthData = (_c.sent())[0];
                        data = ((_b = monthData) === null || _b === void 0 ? void 0 : _b[0]) || {};
                        trendData.push({
                            month: monthStr,
                            revenue: parseFloat(data.revenue || 0),
                            invoiceCount: data.invoiceCount || 0
                        });
                        _c.label = 4;
                    case 4:
                        i--;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, { trend: trendData }];
                    case 6:
                        error_2 = _c.sent();
                        console.error('Error getting revenue trend:', error_2);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch revenue trend'
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get expense breakdown by category
     */
    getExpenseBreakdown: orgAnalyticsViewProcedure
        .input(zod_1.z.object({
        month: zod_1.z.string().optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, now, month, _b, year, monthNum, monthStart, monthEnd, breakdown, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error('Database not available');
                        orgId = ctx.user.organizationId;
                        now = new Date();
                        month = input.month || now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0');
                        _b = month.split('-').map(Number), year = _b[0], monthNum = _b[1];
                        monthStart = new Date(year, monthNum - 1, 1);
                        monthEnd = new Date(year, monthNum, 0);
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n            SELECT \n              category,\n              COUNT(*) as count,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total\n            FROM expenses\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n            GROUP BY category\n            ORDER BY total DESC\n          "], ["\n            SELECT \n              category,\n              COUNT(*) as count,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total\n            FROM expenses\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n            GROUP BY category\n            ORDER BY total DESC\n          "])), orgId, monthStart.toISOString(), monthEnd.toISOString()))];
                    case 2:
                        breakdown = (_c.sent())[0];
                        return [2 /*return*/, {
                                period: month,
                                breakdown: (breakdown || []).map(function (row) { return ({
                                    category: row.category || 'Uncategorized',
                                    count: row.count || 0,
                                    amount: parseFloat(row.total || 0)
                                }); })
                            }];
                    case 3:
                        error_3 = _c.sent();
                        console.error('Error getting expense breakdown:', error_3);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch expense breakdown'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get top clients by revenue
     */
    getTopClients: orgAnalyticsViewProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(50)["default"](10),
        month: zod_1.z.string().optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, now, month, _b, year, monthNum, monthStart, monthEnd, topClients, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error('Database not available');
                        orgId = ctx.user.organizationId;
                        now = new Date();
                        month = input.month || now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0');
                        _b = month.split('-').map(Number), year = _b[0], monthNum = _b[1];
                        monthStart = new Date(year, monthNum - 1, 1);
                        monthEnd = new Date(year, monthNum, 0);
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n            SELECT \n              c.id,\n              c.name,\n              COUNT(i.id) as invoiceCount,\n              COALESCE(SUM(CAST(i.amount AS DECIMAL(10,2))), 0) as totalRevenue\n            FROM clients c\n            LEFT JOIN invoices i ON c.id = i.clientId\n              AND i.createdAt BETWEEN ", " AND ", "\n            WHERE c.organizationId = ", "\n            GROUP BY c.id, c.name\n            ORDER BY totalRevenue DESC\n            LIMIT ", "\n          "], ["\n            SELECT \n              c.id,\n              c.name,\n              COUNT(i.id) as invoiceCount,\n              COALESCE(SUM(CAST(i.amount AS DECIMAL(10,2))), 0) as totalRevenue\n            FROM clients c\n            LEFT JOIN invoices i ON c.id = i.clientId\n              AND i.createdAt BETWEEN ", " AND ", "\n            WHERE c.organizationId = ", "\n            GROUP BY c.id, c.name\n            ORDER BY totalRevenue DESC\n            LIMIT ", "\n          "])), monthStart.toISOString(), monthEnd.toISOString(), orgId, input.limit))];
                    case 2:
                        topClients = (_c.sent())[0];
                        return [2 /*return*/, {
                                period: month,
                                topClients: (topClients || []).map(function (row) { return ({
                                    clientId: row.id,
                                    name: row.name,
                                    invoiceCount: row.invoiceCount || 0,
                                    totalRevenue: parseFloat(row.totalRevenue || 0)
                                }); })
                            }];
                    case 3:
                        error_4 = _c.sent();
                        console.error('Error getting top clients:', error_4);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch top clients'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get payment status distribution
     */
    getPaymentStatusDistribution: orgAnalyticsViewProcedure
        .input(zod_1.z.object({
        month: zod_1.z.string().optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, now, month, _b, year, monthNum, monthStart, monthEnd, distribution, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _c.sent();
                        if (!db)
                            throw new Error('Database not available');
                        orgId = ctx.user.organizationId;
                        now = new Date();
                        month = input.month || now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0');
                        _b = month.split('-').map(Number), year = _b[0], monthNum = _b[1];
                        monthStart = new Date(year, monthNum - 1, 1);
                        monthEnd = new Date(year, monthNum, 0);
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n            SELECT \n              status,\n              COUNT(*) as count,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total\n            FROM invoices\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n            GROUP BY status\n          "], ["\n            SELECT \n              status,\n              COUNT(*) as count,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total\n            FROM invoices\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n            GROUP BY status\n          "])), orgId, monthStart.toISOString(), monthEnd.toISOString()))];
                    case 2:
                        distribution = (_c.sent())[0];
                        return [2 /*return*/, {
                                period: month,
                                distribution: (distribution || []).map(function (row) { return ({
                                    status: row.status || 'unknown',
                                    count: row.count || 0,
                                    amount: parseFloat(row.total || 0)
                                }); })
                            }];
                    case 3:
                        error_5 = _c.sent();
                        console.error('Error getting payment status distribution:', error_5);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch payment status distribution'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get KPI summary for organization
     */
    getKpiSummary: orgAnalyticsViewProcedure
        .input(zod_1.z.object({
        month: zod_1.z.string().optional()
    }).strict())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db, orgId, now, month, _b, year, monthNum, currentStart, currentEnd, prevStart, prevEnd, currentMetrics, prevMetrics, current, prev, currentRevenue, prevRevenue, revenueGrowth, error_6;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 1:
                        db = _e.sent();
                        if (!db)
                            throw new Error('Database not available');
                        orgId = ctx.user.organizationId;
                        now = new Date();
                        month = input.month || now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0');
                        _b = month.split('-').map(Number), year = _b[0], monthNum = _b[1];
                        currentStart = new Date(year, monthNum - 1, 1);
                        currentEnd = new Date(year, monthNum, 0);
                        prevStart = new Date(year, monthNum - 2, 1);
                        prevEnd = new Date(year, monthNum - 1, 0);
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n            SELECT \n              COUNT(*) as invoiceCount,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as revenue\n            FROM invoices\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n          "], ["\n            SELECT \n              COUNT(*) as invoiceCount,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as revenue\n            FROM invoices\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n          "])), orgId, currentStart.toISOString(), currentEnd.toISOString()))];
                    case 2:
                        currentMetrics = (_e.sent())[0];
                        return [4 /*yield*/, db.execute(drizzle_orm_1.sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n            SELECT \n              COUNT(*) as invoiceCount,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as revenue\n            FROM invoices\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n          "], ["\n            SELECT \n              COUNT(*) as invoiceCount,\n              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as revenue\n            FROM invoices\n            WHERE organizationId = ", "\n              AND createdAt BETWEEN ", " AND ", "\n          "])), orgId, prevStart.toISOString(), prevEnd.toISOString()))];
                    case 3:
                        prevMetrics = (_e.sent())[0];
                        current = ((_c = currentMetrics) === null || _c === void 0 ? void 0 : _c[0]) || {};
                        prev = ((_d = prevMetrics) === null || _d === void 0 ? void 0 : _d[0]) || {};
                        currentRevenue = parseFloat(current.revenue || 0);
                        prevRevenue = parseFloat(prev.revenue || 0);
                        revenueGrowth = prevRevenue > 0 ? (((currentRevenue - prevRevenue) / prevRevenue) * 100) : 0;
                        return [2 /*return*/, {
                                period: month,
                                kpis: {
                                    revenue: {
                                        current: currentRevenue,
                                        previous: prevRevenue,
                                        growth: parseFloat(revenueGrowth.toFixed(2)),
                                        trend: currentRevenue >= prevRevenue ? 'up' : 'down'
                                    },
                                    invoices: {
                                        current: current.invoiceCount || 0,
                                        previous: prev.invoiceCount || 0,
                                        growth: prev.invoiceCount > 0 ? (((current.invoiceCount - prev.invoiceCount) / prev.invoiceCount) * 100).toFixed(2) : 0
                                    }
                                }
                            }];
                    case 4:
                        error_6 = _e.sent();
                        console.error('Error getting KPI summary:', error_6);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to fetch KPI summary'
                        });
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10;
