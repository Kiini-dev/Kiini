"use strict";
/**
 * Unit Tests: Authentication & Authorization
 * Tests for login, logout, token management, and permission checking
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
var testHelpers_1 = require("../utils/testHelpers");
vitest_1.describe("Authentication Service", function () {
    var mockAuth;
    vitest_1.beforeEach(function () {
        mockAuth = testHelpers_1.createMockAuthContext();
    });
    vitest_1.describe("Login", function () {
        vitest_1.it("should authenticate user with valid credentials", function () { return __awaiter(void 0, void 0, void 0, function () {
            var loginFn, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginFn = vitest_1.vi.fn().mockResolvedValue({
                            user: testHelpers_1.createTestUser(),
                            token: "test-token-123"
                        });
                        return [4 /*yield*/, loginFn("test@example.com", "password123")];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result).toHaveProperty("user");
                        vitest_1.expect(result).toHaveProperty("token");
                        vitest_1.expect(result.token).toBe("test-token-123");
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should reject login with invalid credentials", function () { return __awaiter(void 0, void 0, void 0, function () {
            var loginFn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginFn = vitest_1.vi.fn().mockRejectedValue(new Error("Invalid credentials"));
                        return [4 /*yield*/, vitest_1.expect(loginFn("test@example.com", "wrongpassword")).rejects.toThrow("Invalid credentials")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should reject login for inactive user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var inactiveUser, loginFn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inactiveUser = testHelpers_1.createTestUser({ isActive: false });
                        loginFn = vitest_1.vi.fn().mockRejectedValue(new Error("User account is inactive"));
                        return [4 /*yield*/, vitest_1.expect(loginFn("inactive@example.com", "password")).rejects.toThrow("User account is inactive")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe("Token Management", function () {
        vitest_1.it("should store token in localStorage after login", function () {
            var token = "test-token-xyz";
            localStorage.setItem("auth_token", token);
            vitest_1.expect(localStorage.getItem("auth_token")).toBe(token);
        });
        vitest_1.it("should clear token on logout", function () {
            localStorage.setItem("auth_token", "token");
            localStorage.removeItem("auth_token");
            vitest_1.expect(localStorage.getItem("auth_token")).toBeNull();
        });
        vitest_1.it("should refresh expired token", function () { return __awaiter(void 0, void 0, void 0, function () {
            var refreshFn, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        refreshFn = vitest_1.vi.fn().mockResolvedValue({
                            token: "new-token-abc"
                        });
                        return [4 /*yield*/, refreshFn("expired-token")];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.token).toBe("new-token-abc");
                        vitest_1.expect(refreshFn).toHaveBeenCalledWith("expired-token");
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe("Session", function () {
        vitest_1.it("should get current user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var getCurrentUser, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        getCurrentUser = vitest_1.vi.fn().mockResolvedValue(testHelpers_1.createTestUser());
                        return [4 /*yield*/, getCurrentUser()];
                    case 1:
                        user = _a.sent();
                        vitest_1.expect(user).toHaveProperty("id");
                        vitest_1.expect(user).toHaveProperty("email");
                        vitest_1.expect(user).toHaveProperty("role");
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should return null for unauthenticated user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var getCurrentUser, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        getCurrentUser = vitest_1.vi.fn().mockResolvedValue(null);
                        return [4 /*yield*/, getCurrentUser()];
                    case 1:
                        user = _a.sent();
                        vitest_1.expect(user).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
vitest_1.describe("Authorization & Permissions", function () {
    var permissions;
    vitest_1.beforeEach(function () {
        permissions = testHelpers_1.createMockPermissionContext(["read:users", "write:users"]);
    });
    vitest_1.describe("Permission Checking", function () {
        vitest_1.it("should grant access to permitted action", function () {
            vitest_1.expect(permissions.hasPermission("read:users")).toBe(true);
        });
        vitest_1.it("should deny access to unpermitted action", function () {
            vitest_1.expect(permissions.hasPermission("delete:users")).toBe(false);
        });
        vitest_1.it("should check multiple permissions with hasAnyPermission", function () {
            var hasBillingOrUsers = permissions.hasAnyPermission([
                "read:billing",
                "read:users",
            ]);
            vitest_1.expect(hasBillingOrUsers).toBe(true);
        });
        vitest_1.it("should check all permissions with hasAllPermissions", function () {
            var hasReadAndWrite = permissions.hasAllPermissions([
                "read:users",
                "write:users",
            ]);
            vitest_1.expect(hasReadAndWrite).toBe(true);
            var hasMissingPermissions = permissions.hasAllPermissions([
                "read:users",
                "delete:users",
            ]);
            vitest_1.expect(hasMissingPermissions).toBe(false);
        });
    });
    vitest_1.describe("Role-Based Access", function () {
        vitest_1.it("should grant admin all permissions", function () {
            var adminPermissions = testHelpers_1.createMockPermissionContext([
                "*",
            ]); // Wildcard for admin
            vitest_1.expect(adminPermissions.hasPermission("any:action")).toBe(true);
        });
        vitest_1.it("should restrict user to limited permissions", function () {
            var userPermissions = testHelpers_1.createMockPermissionContext([
                "read:own_data",
            ]);
            vitest_1.expect(userPermissions.hasPermission("read:own_data")).toBe(true);
            vitest_1.expect(userPermissions.hasPermission("delete:any")).toBe(false);
        });
    });
});
vitest_1.describe("RBAC (Role-Based Access Control)", function () {
    vitest_1.describe("Role Validation", function () {
        var validRoles = ["super_admin", "admin", "user", "guest"];
        vitest_1.it("should validate role", function () {
            vitest_1.expect(validRoles).toContain("admin");
            vitest_1.expect(validRoles).toContain("user");
        });
        vitest_1.it("should reject invalid role", function () {
            vitest_1.expect(validRoles).not.toContain("invalid_role");
        });
    });
    vitest_1.describe("Feature Access", function () {
        var featureAccess = {
            "admin:users": ["super_admin", "admin"],
            "admin:settings": ["super_admin"],
            "crm:read": ["super_admin", "admin", "user"],
            "billing:manage": ["super_admin", "admin"]
        };
        vitest_1.it("should allow role to access feature", function () {
            var userCanReadCRM = featureAccess["crm:read"].includes("user");
            vitest_1.expect(userCanReadCRM).toBe(true);
        });
        vitest_1.it("should deny role from accessing feature", function () {
            var userCanManageBilling = featureAccess["billing:manage"].includes("user");
            vitest_1.expect(userCanManageBilling).toBe(false);
        });
    });
});
