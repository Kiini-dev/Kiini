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
var vitest_1 = require("vitest");
var enterpriseTenants_1 = require("../enterpriseTenants");
var fakeDb = {
    select: vitest_1.vi.fn()
};
vitest_1.vi.mock('../../db', function () { return ({
    getDb: vitest_1.vi.fn(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, fakeDb];
    }); }); })
}); });
function stubQuery(result) {
    var _this = this;
    var query = Promise.resolve(result);
    query.limit = vitest_1.vi.fn(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, result];
    }); }); });
    query.orderBy = vitest_1.vi.fn(function () { return query; });
    query.where = vitest_1.vi.fn(function () { return query; });
    return query;
}
vitest_1.describe('Enterprise Tenants Router', function () {
    vitest_1.beforeEach(function () {
        fakeDb.select.mockReset();
    });
    vitest_1.it('getPricingTiers returns active pricing plans', function () { return __awaiter(void 0, void 0, void 0, function () {
        var tierRows, caller, tiers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tierRows = [{ id: 'plan1', name: 'Starter', isActive: 1, displayOrder: 1 }];
                    fakeDb.select.mockImplementationOnce(function () { return ({ from: function () { return ({ where: function () { return ({ orderBy: function () { return tierRows; } }); } }); } }); });
                    caller = enterpriseTenants_1.enterpriseTenantsRouter.createCaller({ user: { id: 'u', role: 'super_admin' } });
                    return [4 /*yield*/, caller.getPricingTiers()];
                case 1:
                    tiers = _a.sent();
                    vitest_1.expect(tiers).toEqual(tierRows);
                    vitest_1.expect(fakeDb.select).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('getTenantMetrics aggregates tenant statistics correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var tenantInfo, userCount, totalTickets, newTickets, recentCommunication, latestSubscription, caller, metrics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tenantInfo = [{ id: 'org1', name: 'Example Org', plan: 'starter', isActive: 1, maxUsers: 25, createdAt: '2024-01-01', updatedAt: '2024-05-01' }];
                    userCount = [{ count: 4 }];
                    totalTickets = [{ count: 12 }];
                    newTickets = [{ count: 3 }];
                    recentCommunication = [{ sentAt: '2024-05-05 10:00:00' }];
                    latestSubscription = [{ id: 'sub1', planId: 'starter', status: 'active', updatedAt: '2024-05-04' }];
                    fakeDb.select
                        .mockImplementationOnce(function () { return ({ from: function () { return stubQuery(tenantInfo); } }); })
                        .mockImplementationOnce(function () { return ({ from: function () { return stubQuery(userCount); } }); })
                        .mockImplementationOnce(function () { return ({ from: function () { return stubQuery(totalTickets); } }); })
                        .mockImplementationOnce(function () { return ({ from: function () { return stubQuery(newTickets); } }); })
                        .mockImplementationOnce(function () { return ({ from: function () { return stubQuery(recentCommunication); } }); })
                        .mockImplementationOnce(function () { return ({ from: function () { return stubQuery(latestSubscription); } }); });
                    caller = enterpriseTenants_1.enterpriseTenantsRouter.createCaller({ user: { id: 'u', role: 'super_admin' } });
                    return [4 /*yield*/, caller.getTenantMetrics('org1')];
                case 1:
                    metrics = _a.sent();
                    vitest_1.expect(metrics).toMatchObject({
                        tenantId: 'org1',
                        name: 'Example Org',
                        plan: 'starter',
                        isActive: 1,
                        userCount: 4,
                        totalTickets: 12,
                        newTickets: 3,
                        lastCommunicationAt: '2024-05-05 10:00:00',
                        latestSubscription: latestSubscription[0]
                    });
                    vitest_1.expect(fakeDb.select).toHaveBeenCalledTimes(6);
                    return [2 /*return*/];
            }
        });
    }); });
});
