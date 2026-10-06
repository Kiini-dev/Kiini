"use strict";
/**
 * Test Utilities & Helpers
 * Common functions for unit, integration, and e2e tests
 */
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
exports.createMockPermissionContext = exports.assertApiError = exports.createMockLocalStorage = exports.waitFor = exports.cleanupTestDatabase = exports.seedTestDatabase = exports.createTestOrganization = exports.createTestUser = exports.createMockApiResponse = exports.createMockAuthContext = exports.createMockTrpcCaller = exports.createMockDbConnection = void 0;
var vitest_1 = require("vitest");
/**
 * Mock database connection
 */
exports.createMockDbConnection = function () { return ({
    query: vitest_1.vi.fn(),
    execute: vitest_1.vi.fn(),
    transaction: vitest_1.vi.fn(),
    close: vitest_1.vi.fn()
}); };
/**
 * Mock tRPC caller
 */
exports.createMockTrpcCaller = function (procedures) {
    if (procedures === void 0) { procedures = {}; }
    return __assign({ auth: {
            login: vitest_1.vi.fn(),
            logout: vitest_1.vi.fn(),
            getCurrentUser: vitest_1.vi.fn()
        }, users: {
            list: vitest_1.vi.fn(),
            getById: vitest_1.vi.fn(),
            create: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
            "delete": vitest_1.vi.fn()
        } }, procedures);
};
/**
 * Mock authentication context
 */
exports.createMockAuthContext = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return ({
        user: __assign({ id: "test-user-1", email: "test@example.com", role: "user", organizationId: "org-1", permissions: ["read", "write"] }, overrides),
        isAuthenticated: true,
        isLoading: false,
        login: vitest_1.vi.fn(),
        logout: vitest_1.vi.fn()
    });
};
/**
 * Create mock API response
 */
exports.createMockApiResponse = function (data, status) {
    if (status === void 0) { status = 200; }
    return ({
        data: data,
        status: status,
        ok: status >= 200 && status < 300,
        headers: new Headers(),
        json: vitest_1.vi.fn().mockResolvedValue(data),
        text: vitest_1.vi.fn().mockResolvedValue(JSON.stringify(data))
    });
};
/**
 * Create test user
 */
exports.createTestUser = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ id: "user-test-" + Math.random().toString(36).substr(2, 9), email: "test-" + Math.random().toString(36).substr(2, 9) + "@example.com", firstName: "Test", lastName: "User", role: "user", organizationId: "org-test-1", isActive: true, createdAt: new Date(), updatedAt: new Date() }, overrides));
};
/**
 * Create test organization
 */
exports.createTestOrganization = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ id: "org-test-" + Math.random().toString(36).substr(2, 9), name: "Test Organization", slug: "test-org-" + Math.random().toString(36).substr(2, 9), tier: "professional", isActive: true, createdAt: new Date(), updatedAt: new Date() }, overrides));
};
/**
 * Test database seeding utility
 */
exports.seedTestDatabase = function (db, data) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, _b, table, records, _c, records_1, record;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _i = 0, _a = Object.entries(data);
                _d.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                _b = _a[_i], table = _b[0], records = _b[1];
                _c = 0, records_1 = records;
                _d.label = 2;
            case 2:
                if (!(_c < records_1.length)) return [3 /*break*/, 5];
                record = records_1[_c];
                return [4 /*yield*/, db.query("INSERT INTO " + table + " SET ?", record)];
            case 3:
                _d.sent();
                _d.label = 4;
            case 4:
                _c++;
                return [3 /*break*/, 2];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}); };
/**
 * Clean up test data
 */
exports.cleanupTestDatabase = function (db, tables) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, tables_1, table;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, tables_1 = tables;
                _a.label = 1;
            case 1:
                if (!(_i < tables_1.length)) return [3 /*break*/, 4];
                table = tables_1[_i];
                return [4 /*yield*/, db.query("TRUNCATE TABLE " + table)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Wait for async operation
 */
exports.waitFor = function (callback, timeout, interval) {
    if (timeout === void 0) { timeout = 5000; }
    if (interval === void 0) { interval = 100; }
    return new Promise(function (resolve, reject) {
        var startTime = Date.now();
        var timer = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, callback()];
                    case 1:
                        result = _a.sent();
                        if (result) {
                            clearInterval(timer);
                            resolve(true);
                        }
                        else if (Date.now() - startTime > timeout) {
                            clearInterval(timer);
                            reject(new Error("Timeout waiting for condition after " + timeout + "ms"));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        if (Date.now() - startTime > timeout) {
                            clearInterval(timer);
                            reject(error_1);
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, interval);
    });
};
/**
 * Mock localStorage
 */
exports.createMockLocalStorage = function () {
    var store = {};
    return {
        getItem: vitest_1.vi.fn(function (key) { return store[key] || null; }),
        setItem: vitest_1.vi.fn(function (key, value) {
            store[key] = value.toString();
        }),
        removeItem: vitest_1.vi.fn(function (key) {
            delete store[key];
        }),
        clear: vitest_1.vi.fn(function () {
            store = {};
        })
    };
};
/**
 * Assert API error response
 */
exports.assertApiError = function (response, expectedStatus, expectedCode) {
    var _a;
    expect(response.status).toBe(expectedStatus);
    if (expectedCode) {
        expect((_a = response.data) === null || _a === void 0 ? void 0 : _a.code).toBe(expectedCode);
    }
};
/**
 * Mock permission context
 */
exports.createMockPermissionContext = function (permissions) {
    if (permissions === void 0) { permissions = []; }
    return ({
        hasPermission: vitest_1.vi.fn(function (perm) {
            return permissions.includes("*") || permissions.includes(perm);
        }),
        hasAnyPermission: vitest_1.vi.fn(function (perms) {
            return permissions.includes("*") || perms.some(function (p) { return permissions.includes(p); });
        }),
        hasAllPermissions: vitest_1.vi.fn(function (perms) {
            return permissions.includes("*") || perms.every(function (p) { return permissions.includes(p); });
        }),
        permissions: permissions
    });
};
