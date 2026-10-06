"use strict";
/**
 * Organization Analytics Router Tests
 * Tests organization-level analytics and metrics functionality
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
var vitest_1 = require("vitest");
var fakeDb = {
    execute: vitest_1.vi.fn()
};
var normalizeQuery = function (query) {
    var _a, _b;
    if (typeof query === 'string')
        return query;
    var renderChunk = function (chunk) {
        if (typeof chunk === 'string')
            return chunk;
        if ((chunk === null || chunk === void 0 ? void 0 : chunk.queryChunks) && Array.isArray(chunk.queryChunks)) {
            return normalizeQuery(chunk);
        }
        if ((chunk === null || chunk === void 0 ? void 0 : chunk.value) && Array.isArray(chunk.value)) {
            return chunk.value.map(renderChunk).join('');
        }
        return String(chunk);
    };
    if ((query === null || query === void 0 ? void 0 : query.queryChunks) && Array.isArray(query.queryChunks)) {
        return query.queryChunks.map(renderChunk).join('');
    }
    return (_b = (_a = query === null || query === void 0 ? void 0 : query.toString) === null || _a === void 0 ? void 0 : _a.call(query)) !== null && _b !== void 0 ? _b : JSON.stringify(query);
};
vitest_1.vi.mock('../../db', function () { return ({
    getDb: vitest_1.vi.fn(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, fakeDb];
    }); }); })
}); });
// Mock logActivity
vitest_1.vi.mock('../../lib/activityLogger', function () { return ({
    logActivity: vitest_1.vi.fn(function () { return Promise.resolve(); })
}); });
vitest_1.describe('Organization Analytics Router', function () {
    var caller;
    var organizationAnalyticsRouter;
    vitest_1.beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Reset mocks
                    vitest_1.vi.clearAllMocks();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../organizationAnalytics'); })];
                case 1:
                    module = _a.sent();
                    organizationAnalyticsRouter = module.organizationAnalyticsRouter;
                    // Create caller with org user context
                    caller = organizationAnalyticsRouter.createCaller({
                        user: {
                            id: 'test-user-id',
                            role: 'admin',
                            organizationId: 'test-org-id',
                            customRoleId: null
                        },
                        db: fakeDb
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.afterEach(function () {
        vitest_1.vi.restoreAllMocks();
    });
    vitest_1.describe('getDashboardMetrics', function () {
        vitest_1.it('should return dashboard metrics for organization', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock database responses
                        fakeDb.execute.mockImplementation(function (query) {
                            var sql = normalizeQuery(query);
                            if (sql.includes('invoices')) {
                                return Promise.resolve([[
                                        {
                                            invoiceCount: 5,
                                            totalRevenue: '15000.00',
                                            paidCount: 3,
                                            paidAmount: '12000.00'
                                        }
                                    ]]);
                            }
                            if (sql.includes('expenses')) {
                                return Promise.resolve([[
                                        {
                                            expenseCount: 8,
                                            totalExpenses: '8000.00',
                                            categoryCount: 4
                                        }
                                    ]]);
                            }
                            if (sql.includes('employees')) {
                                return Promise.resolve([[
                                        {
                                            activeEmployees: 12,
                                            departmentCount: 3
                                        }
                                    ]]);
                            }
                            if (sql.includes('clients')) {
                                return Promise.resolve([[
                                        {
                                            totalClients: 25,
                                            activeClients: 20
                                        }
                                    ]]);
                            }
                            return Promise.resolve([[]]);
                        });
                        return [4 /*yield*/, caller.getDashboardMetrics({
                                month: '2024-05'
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result).toEqual({
                            period: '2024-05',
                            revenue: {
                                total: 15000,
                                invoiceCount: 5,
                                paid: 12000,
                                paidCount: 3,
                                pending: 3000
                            },
                            expenses: {
                                total: 8000,
                                count: 8,
                                categories: 4
                            },
                            team: {
                                activeEmployees: 12,
                                departments: 3
                            },
                            clients: {
                                total: 25,
                                active: 20
                            },
                            profitMargin: '46.67'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should use current month when no month specified', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[]]);
                        return [4 /*yield*/, caller.getDashboardMetrics({})];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.period).toMatch(/^\d{4}-\d{2}$/);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should reject non-org users', function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonOrgCaller;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonOrgCaller = organizationAnalyticsRouter.createCaller({
                            user: {
                                id: 'test-user-id',
                                role: 'admin',
                                organizationId: null,
                                customRoleId: null
                            },
                            db: fakeDb
                        });
                        return [4 /*yield*/, vitest_1.expect(nonOrgCaller.getDashboardMetrics({})).rejects.toThrow('Organization access required')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('getRevenueTrend', function () {
        vitest_1.it('should return revenue trend for specified months', function () { return __awaiter(void 0, void 0, void 0, function () {
            var callCount, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        callCount = 0;
                        fakeDb.execute.mockImplementation(function () {
                            var _a;
                            callCount++;
                            var revenues = [5000, 7000, 8000, 6000, 9000, 11000];
                            var counts = [2, 3, 4, 3, 5, 6];
                            return Promise.resolve([[
                                    {
                                        revenue: ((_a = revenues[callCount - 1]) === null || _a === void 0 ? void 0 : _a.toString()) || '0.00',
                                        invoiceCount: counts[callCount - 1] || 0
                                    }
                                ]]);
                        });
                        return [4 /*yield*/, caller.getRevenueTrend({
                                months: 6
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.trend).toHaveLength(6);
                        vitest_1.expect(result.trend[0]).toHaveProperty('month');
                        vitest_1.expect(result.trend[0]).toHaveProperty('revenue');
                        vitest_1.expect(result.trend[0]).toHaveProperty('invoiceCount');
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should default to 6 months when not specified', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[{ revenue: '0.00', invoiceCount: 0 }]]);
                        return [4 /*yield*/, caller.getRevenueTrend({})];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.trend).toHaveLength(6);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('getExpenseBreakdown', function () {
        vitest_1.it('should return expense breakdown by category', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[
                                { category: 'Office Supplies', count: 5, total: '2500.00' },
                                { category: 'Travel', count: 3, total: '1800.00' },
                                { category: null, count: 2, total: '800.00' },
                            ]]);
                        return [4 /*yield*/, caller.getExpenseBreakdown({
                                month: '2024-05'
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.period).toBe('2024-05');
                        vitest_1.expect(result.breakdown).toHaveLength(3);
                        vitest_1.expect(result.breakdown[0]).toEqual({
                            category: 'Office Supplies',
                            count: 5,
                            amount: 2500
                        });
                        vitest_1.expect(result.breakdown[2]).toEqual({
                            category: 'Uncategorized',
                            count: 2,
                            amount: 800
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should use current month when not specified', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[]]);
                        return [4 /*yield*/, caller.getExpenseBreakdown({})];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.period).toMatch(/^\d{4}-\d{2}$/);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('getTopClients', function () {
        vitest_1.it('should return top clients by revenue', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[
                                {
                                    id: 'client-1',
                                    name: 'ABC Corp',
                                    invoiceCount: 3,
                                    totalRevenue: '15000.00'
                                },
                                {
                                    id: 'client-2',
                                    name: 'XYZ Ltd',
                                    invoiceCount: 2,
                                    totalRevenue: '12000.00'
                                },
                            ]]);
                        return [4 /*yield*/, caller.getTopClients({
                                limit: 10,
                                month: '2024-05'
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.period).toBe('2024-05');
                        vitest_1.expect(result.topClients).toHaveLength(2);
                        vitest_1.expect(result.topClients[0]).toEqual({
                            clientId: 'client-1',
                            name: 'ABC Corp',
                            invoiceCount: 3,
                            totalRevenue: 15000
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should default to limit of 10', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[]]);
                        return [4 /*yield*/, caller.getTopClients({})];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.topClients).toEqual([]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('getPaymentStatusDistribution', function () {
        vitest_1.it('should return payment status distribution', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[
                                { status: 'paid', count: 8, total: '24000.00' },
                                { status: 'pending', count: 3, total: '9000.00' },
                                { status: 'overdue', count: 1, total: '3000.00' },
                            ]]);
                        return [4 /*yield*/, caller.getPaymentStatusDistribution({
                                month: '2024-05'
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.period).toBe('2024-05');
                        vitest_1.expect(result.distribution).toHaveLength(3);
                        vitest_1.expect(result.distribution[0]).toEqual({
                            status: 'paid',
                            count: 8,
                            amount: 24000
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('getKpiSummary', function () {
        vitest_1.it('should return KPI summary with growth calculations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock current month
                        fakeDb.execute.mockImplementationOnce(function () {
                            return Promise.resolve([[{ invoiceCount: 10, revenue: '25000.00' }]]);
                        });
                        // Mock previous month
                        fakeDb.execute.mockImplementationOnce(function () {
                            return Promise.resolve([[{ invoiceCount: 8, revenue: '20000.00' }]]);
                        });
                        return [4 /*yield*/, caller.getKpiSummary({
                                month: '2024-05'
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.period).toBe('2024-05');
                        vitest_1.expect(result.kpis.revenue.current).toBe(25000);
                        vitest_1.expect(result.kpis.revenue.previous).toBe(20000);
                        vitest_1.expect(result.kpis.revenue.growth).toBe(25);
                        vitest_1.expect(result.kpis.revenue.trend).toBe('up');
                        vitest_1.expect(result.kpis.invoices.current).toBe(10);
                        vitest_1.expect(result.kpis.invoices.previous).toBe(8);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should handle zero previous revenue', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockImplementationOnce(function () {
                            return Promise.resolve([[{ invoiceCount: 5, revenue: '10000.00' }]]);
                        });
                        fakeDb.execute.mockImplementationOnce(function () {
                            return Promise.resolve([[{ invoiceCount: 0, revenue: '0.00' }]]);
                        });
                        return [4 /*yield*/, caller.getKpiSummary({})];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.kpis.revenue.growth).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
