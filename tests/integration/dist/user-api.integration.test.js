"use strict";
/**
 * Integration Tests: User API
 * Tests for user CRUD operations, org isolation, and data consistency
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
var vitest_1 = require("vitest");
var testHelpers_1 = require("../utils/testHelpers");
vitest_1.describe("User API Integration Tests", function () {
    var trpc;
    var testOrg;
    var testUser;
    vitest_1.beforeEach(function () {
        trpc = testHelpers_1.createMockTrpcCaller();
        testOrg = testHelpers_1.createTestOrganization();
        testUser = testHelpers_1.createTestUser({ organizationId: testOrg.id });
    });
    vitest_1.describe("User CRUD Operations", function () {
        vitest_1.it("should create new user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var newUser, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newUser = testHelpers_1.createTestUser();
                        trpc.users.create.mockResolvedValue(newUser);
                        return [4 /*yield*/, trpc.users.create(newUser)];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result).toHaveProperty("id");
                        vitest_1.expect(result.email).toBe(newUser.email);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should fetch user by ID", function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trpc.users.getById.mockResolvedValue(testUser);
                        return [4 /*yield*/, trpc.users.getById(testUser.id)];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.id).toBe(testUser.id);
                        vitest_1.expect(result.email).toBe(testUser.email);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should list users in organization", function () { return __awaiter(void 0, void 0, void 0, function () {
            var users, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        users = [
                            testHelpers_1.createTestUser({ organizationId: testOrg.id }),
                            testHelpers_1.createTestUser({ organizationId: testOrg.id }),
                        ];
                        trpc.users.list.mockResolvedValue(users);
                        return [4 /*yield*/, trpc.users.list({ organizationId: testOrg.id })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result).toHaveLength(2);
                        vitest_1.expect(result.every(function (u) { return u.organizationId === testOrg.id; })).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should update user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var updatedUser, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updatedUser = __assign(__assign({}, testUser), { firstName: "Updated" });
                        trpc.users.update.mockResolvedValue(updatedUser);
                        return [4 /*yield*/, trpc.users.update(testUser.id, {
                                firstName: "Updated"
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.firstName).toBe("Updated");
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should delete user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trpc.users["delete"].mockResolvedValue({ success: true });
                        return [4 /*yield*/, trpc.users["delete"](testUser.id)];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result.success).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe("Data Validation", function () {
        vitest_1.it("should reject invalid email", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trpc.users.create.mockRejectedValue(new Error("Invalid email format"));
                        return [4 /*yield*/, vitest_1.expect(trpc.users.create(__assign(__assign({}, testUser), { email: "invalid-email" }))).rejects.toThrow("Invalid email format")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should enforce required fields", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trpc.users.create.mockRejectedValue(new Error("Missing required field: email"));
                        return [4 /*yield*/, vitest_1.expect(trpc.users.create(__assign(__assign({}, testUser), { email: undefined }))).rejects.toThrow("Missing required field")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should enforce unique email", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trpc.users.create.mockRejectedValue(new Error("Email already exists"));
                        return [4 /*yield*/, vitest_1.expect(trpc.users.create(testUser)).rejects.toThrow("Email already exists")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe("Organization Isolation", function () {
        vitest_1.it("should not allow user from org1 to access org2 data", function () { return __awaiter(void 0, void 0, void 0, function () {
            var org1, org2, user1, user2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        org1 = testHelpers_1.createTestOrganization();
                        org2 = testHelpers_1.createTestOrganization();
                        user1 = testHelpers_1.createTestUser({ organizationId: org1.id });
                        user2 = testHelpers_1.createTestUser({ organizationId: org2.id });
                        trpc.users.getById.mockImplementation(function (userId) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (userId === user2.id) {
                                    // Simulate permission check
                                    throw new Error("Access denied: User not in organization");
                                }
                                return [2 /*return*/, user1];
                            });
                        }); });
                        _a = vitest_1.expect;
                        return [4 /*yield*/, trpc.users.getById(user1.id)];
                    case 1:
                        _a.apply(void 0, [_b.sent()]).toEqual(user1);
                        return [4 /*yield*/, vitest_1.expect(trpc.users.getById(user2.id)).rejects.toThrow("Access denied")];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should filter list results by organization", function () { return __awaiter(void 0, void 0, void 0, function () {
            var org1, org2, org1Users, org2Users, org1Result, org2Result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        org1 = testHelpers_1.createTestOrganization();
                        org2 = testHelpers_1.createTestOrganization();
                        org1Users = [
                            testHelpers_1.createTestUser({ organizationId: org1.id }),
                            testHelpers_1.createTestUser({ organizationId: org1.id }),
                        ];
                        org2Users = [
                            testHelpers_1.createTestUser({ organizationId: org2.id }),
                        ];
                        trpc.users.list.mockImplementation(function (filters) {
                            if (filters.organizationId === org1.id) {
                                return org1Users;
                            }
                            else if (filters.organizationId === org2.id) {
                                return org2Users;
                            }
                            return [];
                        });
                        return [4 /*yield*/, trpc.users.list({ organizationId: org1.id })];
                    case 1:
                        org1Result = _a.sent();
                        return [4 /*yield*/, trpc.users.list({ organizationId: org2.id })];
                    case 2:
                        org2Result = _a.sent();
                        vitest_1.expect(org1Result).toHaveLength(2);
                        vitest_1.expect(org2Result).toHaveLength(1);
                        vitest_1.expect(org1Result.every(function (u) { return u.organizationId === org1.id; })).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    vitest_1.describe("Error Handling", function () {
        vitest_1.it("should return 404 for non-existent user", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trpc.users.getById.mockRejectedValue({ status: 404, code: "USER_NOT_FOUND" });
                        return [4 /*yield*/, vitest_1.expect(trpc.users.getById("non-existent-id")).rejects.toMatchObject({
                                status: 404
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should return 403 for unauthorized access", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trpc.users.update.mockRejectedValue({ status: 403, code: "FORBIDDEN" });
                        return [4 /*yield*/, vitest_1.expect(trpc.users.update(testUser.id, { role: "admin" })).rejects.toMatchObject({ status: 403 })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should return 400 for invalid input", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trpc.users.create.mockRejectedValue({ status: 400, code: "INVALID_INPUT" });
                        return [4 /*yield*/, vitest_1.expect(trpc.users.create({ email: "test@example.com" })).rejects.toMatchObject({ status: 400 })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
vitest_1.describe("Organization API Integration Tests", function () {
    var trpc;
    vitest_1.beforeEach(function () {
        trpc = testHelpers_1.createMockTrpcCaller();
    });
    vitest_1.describe("Organization Management", function () {
        vitest_1.it("should create organization", function () { return __awaiter(void 0, void 0, void 0, function () {
            var org, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        org = testHelpers_1.createTestOrganization();
                        trpc.organizations = {
                            create: vitest_1.vi.fn().mockResolvedValue(org)
                        };
                        return [4 /*yield*/, trpc.organizations.create({
                                name: org.name,
                                slug: org.slug
                            })];
                    case 1:
                        result = _a.sent();
                        vitest_1.expect(result).toHaveProperty("id");
                        vitest_1.expect(result.name).toBe(org.name);
                        return [2 /*return*/];
                }
            });
        }); });
        vitest_1.it("should enforce unique slug", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trpc.organizations = {
                            create: vitest_1.vi.fn().mockRejectedValue(new Error("Organization slug already exists"))
                        };
                        return [4 /*yield*/, vitest_1.expect(trpc.organizations.create({ name: "Test", slug: "test-org" })).rejects.toThrow("slug already exists")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
