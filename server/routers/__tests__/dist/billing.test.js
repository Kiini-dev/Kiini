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
var vitest_1 = require("vitest");
var createBillingUsageMetric = vitest_1.vi.fn();
var getBillingUsageMetrics = vitest_1.vi.fn();
var getBillingUsageSummary = vitest_1.vi.fn();
vitest_1.vi.mock('../../db', function () { return ({
    createBillingUsageMetric: createBillingUsageMetric,
    getBillingUsageMetrics: getBillingUsageMetrics,
    getBillingUsageSummary: getBillingUsageSummary
}); });
vitest_1.describe('Billing Router - Usage Metrics', function () {
    var caller;
    var billingRouter;
    vitest_1.beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.clearAllMocks();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../billing'); })];
                case 1:
                    module = _a.sent();
                    billingRouter = module.billingRouter;
                    caller = billingRouter.createCaller({
                        user: {
                            id: 'admin-user',
                            role: 'admin'
                        }
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.afterEach(function () {
        vitest_1.vi.restoreAllMocks();
    });
    vitest_1.it('should record a usage metric', function () { return __awaiter(void 0, void 0, void 0, function () {
        var payload, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = {
                        subscriptionId: 'sub-123',
                        metricDate: '2026-05-01 12:00:00',
                        usersCount: 10,
                        projectsCount: 3,
                        tasksCount: 7,
                        documentsCount: 14,
                        storageUsedMB: 512,
                        apiCallsCount: 1300,
                        emailsSent: 48
                    };
                    createBillingUsageMetric.mockResolvedValueOnce(__assign(__assign({}, payload), { id: 'metric-1', recordedAt: '2026-05-01 12:00:00' }));
                    return [4 /*yield*/, caller.recordUsageMetric(payload)];
                case 1:
                    result = _a.sent();
                    vitest_1.expect(result).toEqual({
                        success: true,
                        metric: vitest_1.expect.objectContaining({
                            id: 'metric-1',
                            subscriptionId: 'sub-123',
                            usersCount: 10,
                            storageUsedMB: 512
                        })
                    });
                    vitest_1.expect(createBillingUsageMetric).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                        subscriptionId: 'sub-123',
                        usersCount: 10,
                        projectsCount: 3
                    }));
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('should return a list of usage metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
        var metrics, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    metrics = [
                        { id: 'metric-1', subscriptionId: 'sub-123', usersCount: 6 },
                        { id: 'metric-2', subscriptionId: 'sub-123', usersCount: 9 },
                    ];
                    getBillingUsageMetrics.mockResolvedValueOnce(metrics);
                    return [4 /*yield*/, caller.getUsageMetrics({ subscriptionId: 'sub-123', limit: 10 })];
                case 1:
                    result = _a.sent();
                    vitest_1.expect(result.success).toBe(true);
                    vitest_1.expect(result.metrics).toEqual(metrics);
                    vitest_1.expect(getBillingUsageMetrics).toHaveBeenCalledWith('sub-123', undefined, undefined, 10);
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('should return a usage summary', function () { return __awaiter(void 0, void 0, void 0, function () {
        var summary, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    summary = {
                        totalUsers: 15,
                        totalProjects: 4,
                        totalApiCalls: 2600,
                        totalStorageMB: 1024,
                        sampleCount: 2,
                        avgUsers: 7.5
                    };
                    getBillingUsageSummary.mockResolvedValueOnce(summary);
                    return [4 /*yield*/, caller.getUsageSummary({ subscriptionId: 'sub-123' })];
                case 1:
                    result = _a.sent();
                    vitest_1.expect(result.success).toBe(true);
                    vitest_1.expect(result.summary).toEqual(summary);
                    vitest_1.expect(getBillingUsageSummary).toHaveBeenCalledWith('sub-123', undefined, undefined);
                    return [2 /*return*/];
            }
        });
    }); });
});
