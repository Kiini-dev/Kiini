"use strict";
/**
 * Enhanced Audit Trail Router Tests
 * Tests organization-scoped audit functionality and enterprise features
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
vitest_1.describe('Enhanced Audit Trail Router', function () {
    var caller;
    var superAdminCaller;
    var auditTrailRouter;
    vitest_1.beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Reset mocks
                    vitest_1.vi.clearAllMocks();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../auditTrail'); })];
                case 1:
                    module = _a.sent();
                    auditTrailRouter = module.auditTrailRouter;
                    // Create caller with org user context (super_admin within org to bypass feature gating)
                    caller = auditTrailRouter.createCaller({
                        user: {
                            id: 'test-user-id',
                            role: 'super_admin',
                            organizationId: 'test-org-id',
                            customRoleId: null
                        },
                        db: fakeDb
                    });
                    // Create super admin caller for cross-org access
                    superAdminCaller = auditTrailRouter.createCaller({
                        user: {
                            id: 'super-admin-id',
                            role: 'super_admin',
                            organizationId: null,
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
    vitest_1.describe('getOrganizationAuditLog', function () {
        vitest_1.it('should return organization audit log for org users', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockImplementation(function (query) {
                            var sql = normalizeQuery(query);
                            if (sql.includes('COUNT(*)')) {
                                return Promise.resolve([[{ total: 25 }]]);
                            }
                            return Promise.resolve([[
                                    {
                                        id: 1,
                                        createdAt: '2024-05-15T10:30:00Z',
                                        userId: 'user-1',
                                        action: 'invoice_created',
                                        description: 'Created invoice INV-001',
                                        entityType: 'invoice',
                                        entityId: '123',
                                        metadata: JSON.stringify({ amount: 1000 }),
                                        ipAddress: '192.168.1.1',
                                        organizationId: 'test-org-id'
                                    }
                                ]]);
                        });
                        return [4 /*yield*/, caller.getOrganizationAuditLog({
                                limit: 10,
                                offset: 0
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.activities).toHaveLength(1);
                        vitest_1.expect(result.total).toBe(25);
                        vitest_1.expect(result.hasMore).toBe(true);
                        vitest_1.expect(result.activities[0]).toEqual({
                            id: 1,
                            timestamp: '2024-05-15T10:30:00Z',
                            userId: 'user-1',
                            userName: 'user-1',
                            action: 'invoice_created',
                            description: 'Created invoice INV-001',
                            entityType: 'invoice',
                            entityId: '123',
                            changes: { amount: 1000 },
                            ipAddress: '192.168.1.1',
                            organizationId: 'test-org-id'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should reject non-org users', function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonOrgCaller;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonOrgCaller = auditTrailRouter.createCaller({
                            user: {
                                id: 'test-user-id',
                                role: 'ict_manager',
                                organizationId: null,
                                customRoleId: null
                            },
                            db: fakeDb
                        });
                        return [4 /*yield*/, vitest_1.expect(nonOrgCaller.getOrganizationAuditLog({
                                limit: 10,
                                offset: 0
                            })).rejects.toThrow('Organization access required for audit logs')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should allow super admins to access any org', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[]]);
                        return [4 /*yield*/, superAdminCaller.getOrganizationAuditLog({
                                limit: 10,
                                offset: 0
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.activities).toEqual([]);
                        vitest_1.expect(result.total).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('getOrganizationAuditStats', function () {
        vitest_1.it('should return organization audit statistics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockImplementation(function (query) {
                            var sql = normalizeQuery(query);
                            if (sql.includes('COUNT(*) as totalActivities')) {
                                return Promise.resolve([[
                                        {
                                            totalActivities: 150,
                                            activeUsers: 12,
                                            entityTypes: 8,
                                            lastActivity: '2024-05-15T14:30:00Z'
                                        }
                                    ]]);
                            }
                            if (sql.includes('GROUP BY action')) {
                                return Promise.resolve([[
                                        { action: 'invoice_created', count: 45 },
                                        { action: 'user_login', count: 30 },
                                    ]]);
                            }
                            if (sql.includes('GROUP BY entityType')) {
                                return Promise.resolve([[
                                        { entityType: 'invoice', count: 50 },
                                        { entityType: 'user', count: 25 },
                                    ]]);
                            }
                            if (sql.includes('DATE(createdAt)')) {
                                return Promise.resolve([[
                                        { date: '2024-05-15', count: 12 },
                                        { date: '2024-05-14', count: 8 },
                                    ]]);
                            }
                            return Promise.resolve([[]]);
                        });
                        return [4 /*yield*/, caller.getOrganizationAuditStats({
                                dateRange: {
                                    start: '2024-05-01',
                                    end: '2024-05-31'
                                }
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.summary.totalActivities).toBe(150);
                        vitest_1.expect(result.summary.activeUsers).toBe(12);
                        vitest_1.expect(result.byAction).toHaveLength(2);
                        vitest_1.expect(result.byEntity).toHaveLength(2);
                        vitest_1.expect(result.activityTrend).toHaveLength(2);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('getSecurityEvents', function () {
        vitest_1.it('should return security events for organization', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[
                                {
                                    id: 1,
                                    createdAt: '2024-05-15T10:30:00Z',
                                    userId: 'user-1',
                                    action: 'login_failed',
                                    description: 'Failed login attempt',
                                    entityType: 'user',
                                    entityId: 'user-1',
                                    ipAddress: '192.168.1.100',
                                    organizationId: 'test-org-id',
                                    metadata: JSON.stringify({ attempts: 3 })
                                },
                                {
                                    id: 2,
                                    createdAt: '2024-05-15T11:00:00Z',
                                    userId: 'user-2',
                                    action: 'unauthorized_access',
                                    description: 'Unauthorized access attempt',
                                    entityType: 'invoice',
                                    entityId: '456',
                                    ipAddress: '10.0.0.50',
                                    organizationId: 'test-org-id',
                                    metadata: null
                                },
                            ]]);
                        return [4 /*yield*/, caller.getSecurityEvents({
                                limit: 50
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.events).toHaveLength(2);
                        vitest_1.expect(result.events[0].severity).toBe('medium'); // login_failed
                        vitest_1.expect(result.events[1].severity).toBe('high'); // unauthorized_access
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should filter by organization for org users', function () { return __awaiter(void 0, void 0, void 0, function () {
            var queryArg, queryText;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[]]);
                        return [4 /*yield*/, caller.getSecurityEvents({})];
                    case 1:
                        _b.sent();
                        queryArg = (_a = fakeDb.execute.mock.calls[0]) === null || _a === void 0 ? void 0 : _a[0];
                        queryText = normalizeQuery(queryArg);
                        vitest_1.expect(queryText).toContain('organizationId = test-org-id');
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should allow super admins to specify organization', function () { return __awaiter(void 0, void 0, void 0, function () {
            var queryArg, queryText;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[]]);
                        return [4 /*yield*/, superAdminCaller.getSecurityEvents({
                                organizationId: 'other-org-id'
                            })];
                    case 1:
                        _b.sent();
                        queryArg = (_a = fakeDb.execute.mock.calls[0]) === null || _a === void 0 ? void 0 : _a[0];
                        queryText = normalizeQuery(queryArg);
                        vitest_1.expect(queryText).toContain('organizationId = other-org-id');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe('getComplianceReport', function () {
        vitest_1.it('should generate GDPR compliance report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[
                                {
                                    id: 1,
                                    createdAt: '2024-05-15T10:30:00Z',
                                    userId: 'user-1',
                                    action: 'data_deletion',
                                    description: 'User data deleted',
                                    entityType: 'user',
                                    entityId: 'user-1',
                                    metadata: JSON.stringify({ reason: 'user_request' })
                                },
                                {
                                    id: 2,
                                    createdAt: '2024-05-15T10:45:00Z',
                                    userId: 'user-2',
                                    action: 'consent_given',
                                    description: 'User consent recorded',
                                    entityType: 'user',
                                    entityId: 'user-2',
                                    metadata: JSON.stringify({ consent: true })
                                }
                            ]]);
                        return [4 /*yield*/, caller.getComplianceReport({
                                reportType: 'gdpr',
                                dateRange: {
                                    start: '2024-05-01',
                                    end: '2024-05-31'
                                }
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.summary.reportType).toBe('gdpr');
                        vitest_1.expect(result.summary.totalActivities).toBe(2);
                        vitest_1.expect(result.summary.complianceStatus).toBe('compliant');
                        vitest_1.expect(result.activities).toHaveLength(2);
                        vitest_1.expect(result.recommendations).toContain('Audit logging appears comprehensive for this compliance framework');
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should generate SOX compliance report with recommendations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[]]); // No activities
                        return [4 /*yield*/, caller.getComplianceReport({
                                reportType: 'sox',
                                dateRange: {
                                    start: '2024-05-01',
                                    end: '2024-05-31'
                                }
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.summary.complianceStatus).toBe('no_activity');
                        vitest_1.expect(result.recommendations).toContain('Enhance financial record modification tracking');
                        vitest_1.expect(result.recommendations).toContain('Implement audit log access monitoring');
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it('should handle different compliance frameworks', function () { return __awaiter(void 0, void 0, void 0, function () {
            var frameworks, _i, frameworks_1, framework, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fakeDb.execute.mockResolvedValue([[]]);
                        frameworks = ['gdpr', 'sox', 'hipaa', 'general'];
                        _i = 0, frameworks_1 = frameworks;
                        _a.label = 1;
                    case 1:
                        if (!(_i < frameworks_1.length)) return [3 /*break*/, 4];
                        framework = frameworks_1[_i];
                        return [4 /*yield*/, caller.getComplianceReport({
                                reportType: framework,
                                dateRange: {
                                    start: '2024-05-01',
                                    end: '2024-05-31'
                                }
                            })];
                    case 2:
                        result = _a.sent();
                        vitest_1.expect(result.summary.reportType).toBe(framework);
                        vitest_1.expect(result.recommendations).toBeDefined();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    });
});
