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
vitest_1.vi.mock('../../db', function () {
    var fakePool = { query: vitest_1.vi.fn() };
    var fakeLogActivity = vitest_1.vi.fn(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, Promise.resolve()];
    }); }); });
    return {
        getPool: vitest_1.vi.fn(function () { return fakePool; }),
        logActivity: fakeLogActivity
    };
});
var db = require("../../db");
vitest_1.describe('Tenant Communications Router', function () {
    var fakePool;
    var fakeLogActivity;
    var tenantCommunicationsRouter;
    vitest_1.beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../tenantCommunications'); })];
                case 1:
                    module = _a.sent();
                    tenantCommunicationsRouter = module.tenantCommunicationsRouter;
                    fakePool = db.getPool();
                    fakeLogActivity = db.logActivity;
                    fakePool.query.mockReset();
                    fakeLogActivity.mockReset();
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('list returns tenant-specific and global announcements for org users', function () { return __awaiter(void 0, void 0, void 0, function () {
        var rows, caller, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rows = [
                        {
                            id: 'm1',
                            organizationId: 'org1',
                            subject: 'Tenant update',
                            message: 'Scheduled maintenance',
                            type: 'announcement',
                            priority: 'normal',
                            status: 'sent',
                            recipientType: 'specific_tenant',
                            recipientFilter: null,
                            sentAt: '2024-05-01 10:00:00',
                            scheduledAt: null,
                            createdBy: 'u1',
                            createdAt: '2024-05-01 09:50:00',
                            updatedAt: '2024-05-01 09:50:00'
                        },
                        {
                            id: 'm2',
                            organizationId: null,
                            subject: 'Global alert',
                            message: 'System-wide notice',
                            type: 'alert',
                            priority: 'high',
                            status: 'sent',
                            recipientType: 'all_tenants',
                            recipientFilter: null,
                            sentAt: '2024-05-01 11:00:00',
                            scheduledAt: null,
                            createdBy: 'u2',
                            createdAt: '2024-05-01 10:45:00',
                            updatedAt: '2024-05-01 10:45:00'
                        },
                    ];
                    fakePool.query.mockResolvedValueOnce([rows]);
                    caller = tenantCommunicationsRouter.createCaller({ user: { id: 'u1', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.list()];
                case 1:
                    result = _a.sent();
                    vitest_1.expect(result).toHaveLength(2);
                    vitest_1.expect(result[0]).toMatchObject({ id: 'm1', recipientType: 'specific_tenant' });
                    vitest_1.expect(result[1]).toMatchObject({ id: 'm2', recipientType: 'all_tenants' });
                    vitest_1.expect(fakePool.query).toHaveBeenCalledWith(vitest_1.expect.stringContaining('SELECT * FROM tenantCommunications'), ['org1']);
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('getById returns a matching global communication for org users', function () { return __awaiter(void 0, void 0, void 0, function () {
        var row, caller, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    row = {
                        id: 'm2',
                        organizationId: null,
                        subject: 'Global alert',
                        message: 'System-wide notice',
                        type: 'alert',
                        priority: 'high',
                        status: 'sent',
                        recipientType: 'all_tenants',
                        recipientFilter: null,
                        sentAt: '2024-05-01 11:00:00',
                        scheduledAt: null,
                        createdBy: 'u2',
                        createdAt: '2024-05-01 10:45:00',
                        updatedAt: '2024-05-01 10:45:00'
                    };
                    fakePool.query.mockResolvedValueOnce([[row]]);
                    caller = tenantCommunicationsRouter.createCaller({ user: { id: 'u1', organizationId: 'org1' } });
                    return [4 /*yield*/, caller.getById('m2')];
                case 1:
                    result = _a.sent();
                    vitest_1.expect(result).toMatchObject({ id: 'm2', recipientType: 'all_tenants', subject: 'Global alert' });
                    vitest_1.expect(fakePool.query).toHaveBeenCalledWith(vitest_1.expect.stringContaining('SELECT * FROM tenantCommunications'), ['m2', 'org1']);
                    return [2 /*return*/];
            }
        });
    }); });
    vitest_1.it('create stores all_tenants communications with null organizationId', function () { return __awaiter(void 0, void 0, void 0, function () {
        var insertedRow, caller, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    insertedRow = {
                        id: 'm3',
                        organizationId: null,
                        subject: 'New global message',
                        message: 'All tenants should see this',
                        type: 'announcement',
                        priority: 'normal',
                        status: 'sent',
                        recipientType: 'all_tenants',
                        recipientFilter: null,
                        sentAt: '2024-05-01 12:00:00',
                        scheduledAt: null,
                        createdBy: 'u1',
                        createdAt: '2024-05-01 11:55:00',
                        updatedAt: '2024-05-01 11:55:00'
                    };
                    fakePool.query.mockResolvedValueOnce([[]]);
                    fakePool.query.mockResolvedValueOnce([[insertedRow]]);
                    caller = tenantCommunicationsRouter.createCaller({ user: { id: 'u1', role: 'admin' } });
                    return [4 /*yield*/, caller.create({
                            subject: 'New global message',
                            message: 'All tenants should see this',
                            type: 'announcement',
                            priority: 'normal',
                            status: 'sent',
                            recipientType: 'all_tenants',
                            recipientFilter: null
                        })];
                case 1:
                    result = _a.sent();
                    vitest_1.expect(result).toMatchObject({ id: 'm3', organizationId: null, recipientType: 'all_tenants' });
                    vitest_1.expect(fakePool.query.mock.calls[0][1][1]).toBeNull();
                    vitest_1.expect(fakeLogActivity).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                        action: 'tenantCommunication:create',
                        entityType: 'tenantCommunication',
                        userId: 'u1',
                        description: "Created communication 'New global message'",
                        metadata: JSON.stringify({ recipientType: 'all_tenants', status: 'sent' }),
                        entityId: vitest_1.expect.any(String)
                    }));
                    return [2 /*return*/];
            }
        });
    }); });
});
