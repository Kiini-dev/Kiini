"use strict";
/**
 * User Management tRPC Router
 * Handles user CRUD operations with role-based access control
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
exports.usersRouter = exports.staffAssignmentProcedure = exports.projectManagerProcedure = exports.hrProcedure = exports.accountantProcedure = exports.staffProcedure = exports.clientProcedure = exports.adminProcedure = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var dbUsers = require("../db-users");
var db = require("../db");
var db_1 = require("../db");
var schema_1 = require("../../drizzle/schema");
var uuid_1 = require("uuid");
// Feature-based procedures
var userReadProcedure = trpc_1.protectedProcedure;
var userWriteProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("users:edit");
var userProfileProcedure = enhancedRbac_1.createFeatureRestrictedProcedure("users:profile");
// Role-based procedure wrappers
exports.adminProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Admin access required'
        });
    }
    return next({ ctx: ctx });
});
exports.clientProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (ctx.user.role !== 'client' && ctx.user.role !== 'super_admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Client access required'
        });
    }
    return next({ ctx: ctx });
});
exports.staffProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (ctx.user.role !== 'staff' && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Staff access required'
        });
    }
    return next({ ctx: ctx });
});
exports.accountantProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (ctx.user.role !== 'accountant' && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Accountant access required'
        });
    }
    return next({ ctx: ctx });
});
exports.hrProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (ctx.user.role !== 'hr' && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'HR access required'
        });
    }
    return next({ ctx: ctx });
});
exports.projectManagerProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (ctx.user.role !== 'project_manager' && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Project Manager access required'
        });
    }
    return next({ ctx: ctx });
});
exports.staffAssignmentProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (!['super_admin', 'admin', 'project_manager', 'hr', 'ict_manager', 'procurement_manager'].includes(ctx.user.role)) {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot assign staff. Required role: Super Admin, Admin, Project Manager, HR, ICT Manager, or Procurement Manager'
        });
    }
    return next({ ctx: ctx });
});
function assertOrgScopedAccess(actorOrgId, targetOrgId) {
    if (actorOrgId && targetOrgId !== actorOrgId) {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only access users in your organization'
        });
    }
}
exports.usersRouter = trpc_1.router({
    /**
     * All authenticated users: Get user id+name for display lookups (org-scoped)
     */
    listNames: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, users, eq, rows_1, rows, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 3:
                        users = (_b.sent()).users;
                        if (!ctx.user.organizationId) return [3 /*break*/, 6];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 4:
                        eq = (_b.sent()).eq;
                        return [4 /*yield*/, database.select({ id: users.id, name: users.name }).from(users)
                                .where(eq(users.organizationId, ctx.user.organizationId))];
                    case 5:
                        rows_1 = _b.sent();
                        return [2 /*return*/, rows_1];
                    case 6: return [4 /*yield*/, database.select({ id: users.id, name: users.name }).from(users)];
                    case 7:
                        rows = _b.sent();
                        return [2 /*return*/, rows];
                    case 8:
                        error_1 = _b.sent();
                        console.error("[Users listNames Error]", error_1);
                        return [2 /*return*/, []];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Admin: Get all users (filtered by organization for non-global admins)
     */
    list: exports.adminProcedure
        .input(zod_1.z.object({
        search: zod_1.z.string().optional(),
        role: zod_1.z.string().optional()
    }).optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        orgId = ctx.user.organizationId || undefined;
                        return [4 /*yield*/, dbUsers.getAllUsers(input === null || input === void 0 ? void 0 : input.search, input === null || input === void 0 ? void 0 : input.role, orgId)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Admin: Get a single user
     */
    get: exports.adminProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(input.id)];
                    case 1:
                        user = _b.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        assertOrgScopedAccess(ctx.user.organizationId || undefined, user.organizationId);
                        return [2 /*return*/, user];
                }
            });
        });
    }),
    /**
     * Admin: Get a single user by ID (alias for get)
     */
    getById: exports.adminProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(input)];
                    case 1:
                        user = _b.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        assertOrgScopedAccess(ctx.user.organizationId || undefined, user.organizationId);
                        return [2 /*return*/, user];
                }
            });
        });
    }),
    /**
     * Admin: Create a new user
     */
    create: exports.adminProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        role: zod_1.z["enum"](["user", "admin", "staff", "accountant", "client", "super_admin", "project_manager", "hr", "ict_manager", "procurement_manager", "sales_manager"]),
        department: zod_1.z.string().optional(),
        clientId: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var existingUser, userId, bcrypt_1, salt, passwordHash, user, logError_1, database, nameParts, firstName, lastName, contactErr_1, error_2, errorDetails, userMessage;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 15, , 16]);
                        return [4 /*yield*/, dbUsers.getUserByEmail(input.email)];
                    case 1:
                        existingUser = _f.sent();
                        if (existingUser) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'User with this email already exists'
                            });
                        }
                        userId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("bcryptjs"); })];
                    case 2:
                        bcrypt_1 = _f.sent();
                        return [4 /*yield*/, bcrypt_1.genSalt(10)];
                    case 3:
                        salt = _f.sent();
                        return [4 /*yield*/, bcrypt_1.hash(input.password, salt)];
                    case 4:
                        passwordHash = _f.sent();
                        return [4 /*yield*/, dbUsers.createUser({
                                id: userId,
                                name: input.name,
                                email: input.email,
                                passwordHash: passwordHash,
                                role: input.role,
                                department: input.department || undefined,
                                clientId: input.clientId || undefined,
                                isActive: input.isActive ? 1 : 0,
                                requiresPasswordChange: 1,
                                // Inherit the creator's organizationId for data isolation
                                organizationId: ctx.user.organizationId || undefined
                            })];
                    case 5:
                        user = _f.sent();
                        if (!user) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to create user - check server logs for details'
                            });
                        }
                        _f.label = 6;
                    case 6:
                        _f.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'user_created',
                                entityType: 'user',
                                entityId: userId,
                                description: "Created user: " + input.name + " (" + input.email + ")"
                            })];
                    case 7:
                        _f.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        logError_1 = _f.sent();
                        console.error('[UserCreate] Failed to log activity:', logError_1);
                        return [3 /*break*/, 9];
                    case 9:
                        _f.trys.push([9, 13, , 14]);
                        return [4 /*yield*/, db_1.getDb()];
                    case 10:
                        database = _f.sent();
                        if (!database) return [3 /*break*/, 12];
                        nameParts = input.name.trim().split(/\s+/);
                        firstName = nameParts[0];
                        lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";
                        return [4 /*yield*/, database.insert(schema_1.contacts).values({
                                id: uuid_1.v4(),
                                organizationId: (_b = ctx.user.organizationId) !== null && _b !== void 0 ? _b : null,
                                firstName: firstName,
                                lastName: lastName,
                                email: input.email || null,
                                department: input.department || null,
                                isPrimary: 0,
                                notes: "User: " + input.role,
                                createdBy: ctx.user.id
                            })];
                    case 11:
                        _f.sent();
                        _f.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        contactErr_1 = _f.sent();
                        console.error('[UserCreate] Auto-create contact failed:', contactErr_1);
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/, user];
                    case 15:
                        error_2 = _f.sent();
                        if (error_2 instanceof server_1.TRPCError)
                            throw error_2;
                        errorDetails = {
                            message: (error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || String(error_2),
                            code: error_2 === null || error_2 === void 0 ? void 0 : error_2.code,
                            name: error_2 === null || error_2 === void 0 ? void 0 : error_2.name,
                            errno: error_2 === null || error_2 === void 0 ? void 0 : error_2.errno,
                            sqlMessage: error_2 === null || error_2 === void 0 ? void 0 : error_2.sqlMessage
                        };
                        console.error('[UserCreate] Error details:', errorDetails);
                        userMessage = 'Failed to create user';
                        if ((_c = error_2 === null || error_2 === void 0 ? void 0 : error_2.message) === null || _c === void 0 ? void 0 : _c.includes('Duplicate')) {
                            userMessage = 'Email already exists in the system';
                        }
                        else if ((_d = error_2 === null || error_2 === void 0 ? void 0 : error_2.message) === null || _d === void 0 ? void 0 : _d.includes('FOREIGN KEY')) {
                            userMessage = 'Invalid department or client reference';
                        }
                        else if ((_e = error_2 === null || error_2 === void 0 ? void 0 : error_2.message) === null || _e === void 0 ? void 0 : _e.includes('constraint')) {
                            userMessage = 'Data validation failed - check all required fields';
                        }
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: userMessage
                        });
                    case 16: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Admin: Update a user
     */
    update: exports.adminProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters").optional(),
        role: zod_1.z["enum"](["user", "admin", "staff", "accountant", "client", "super_admin", "project_manager", "hr", "ict_manager", "procurement_manager", "sales_manager"]).optional(),
        department: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var existingUser, emailExists, updateData, bcrypt_2, salt, passwordHash, user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(input.id)];
                    case 1:
                        existingUser = _b.sent();
                        if (!existingUser) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'User not found'
                            });
                        }
                        assertOrgScopedAccess(ctx.user.organizationId || undefined, existingUser.organizationId);
                        if (!(input.email && input.email !== existingUser.email)) return [3 /*break*/, 3];
                        return [4 /*yield*/, dbUsers.getUserByEmail(input.email)];
                    case 2:
                        emailExists = _b.sent();
                        if (emailExists) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Email already in use by another user'
                            });
                        }
                        _b.label = 3;
                    case 3:
                        updateData = {
                            name: input.name,
                            email: input.email,
                            role: input.role,
                            department: input.department,
                            isActive: input.isActive
                        };
                        if (!input.password) return [3 /*break*/, 7];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("bcryptjs"); })];
                    case 4:
                        bcrypt_2 = _b.sent();
                        return [4 /*yield*/, bcrypt_2.genSalt(10)];
                    case 5:
                        salt = _b.sent();
                        return [4 /*yield*/, bcrypt_2.hash(input.password, salt)];
                    case 6:
                        passwordHash = _b.sent();
                        updateData.passwordHash = passwordHash;
                        _b.label = 7;
                    case 7: return [4 /*yield*/, dbUsers.updateUser(input.id, updateData)];
                    case 8:
                        user = _b.sent();
                        if (!user) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to update user'
                            });
                        }
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'user_updated',
                                entityType: 'user',
                                entityId: input.id,
                                description: "Updated user: " + user.name + " (" + user.email + ")"
                            })];
                    case 9:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, user];
                }
            });
        });
    }),
    /**
     * Admin: Delete a user (soft delete)
     */
    "delete": exports.adminProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var userId = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user, success;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(userId)];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'User not found'
                            });
                        }
                        assertOrgScopedAccess(ctx.user.organizationId || undefined, user.organizationId);
                        // Prevent deleting super_admin users
                        if (user.role === 'super_admin') {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Cannot delete super admin users'
                            });
                        }
                        // Prevent self-deletion
                        if (userId === ctx.user.id) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Cannot delete your own user account'
                            });
                        }
                        return [4 /*yield*/, dbUsers.deleteUser(userId)];
                    case 2:
                        success = _b.sent();
                        if (!success) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to delete user'
                            });
                        }
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'user_deactivated',
                                entityType: 'user',
                                entityId: userId,
                                description: "Deactivated user: " + user.name + " (" + user.email + ")"
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Admin: Permanently delete an inactive user (hard delete)
     */
    permanentDelete: exports.adminProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var userId = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user, success;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(userId)];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'User not found'
                            });
                        }
                        assertOrgScopedAccess(ctx.user.organizationId || undefined, user.organizationId);
                        if (user.role === 'super_admin') {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Cannot permanently delete super admin users'
                            });
                        }
                        if (userId === ctx.user.id) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Cannot delete your own account'
                            });
                        }
                        if (user.isActive !== 0) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'User must be deactivated before permanent deletion'
                            });
                        }
                        return [4 /*yield*/, dbUsers.hardDeleteUser(userId)];
                    case 2:
                        success = _b.sent();
                        if (!success) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to permanently delete user'
                            });
                        }
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'user_permanently_deleted',
                                entityType: 'user',
                                entityId: userId,
                                description: "Permanently deleted user: " + user.name + " (" + user.email + ")"
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Staff: Get their assigned projects
     */
    myProjects: exports.staffProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserProjects(ctx.user.id)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Staff: Get their assigned tasks
     */
    myTasks: exports.staffProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserTasks(ctx.user.id)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Staff: Update task status
     */
    updateTaskStatus: exports.staffProcedure
        .input(zod_1.z.object({
        taskId: zod_1.z.string(),
        status: zod_1.z["enum"](["todo", "in_progress", "completed", "blocked"])
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var success;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.updateTaskStatus(input.taskId, input.status)];
                    case 1:
                        success = _b.sent();
                        if (!success) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to update task status'
                            });
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Staff: Get department tasks
     */
    departmentTasks: exports.staffProcedure
        .input(zod_1.z.object({ department: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(ctx.user.id)];
                    case 1:
                        user = _b.sent();
                        if ((user === null || user === void 0 ? void 0 : user.department) !== input.department && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Cannot access other departments'
                            });
                        }
                        return [4 /*yield*/, dbUsers.getDepartmentTasks(input.department)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Staff: Get department members
     */
    departmentMembers: exports.staffProcedure
        .input(zod_1.z.object({ department: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(ctx.user.id)];
                    case 1:
                        user = _b.sent();
                        if ((user === null || user === void 0 ? void 0 : user.department) !== input.department && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Cannot access other departments'
                            });
                        }
                        return [4 /*yield*/, dbUsers.getDepartmentMembers(input.department)];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Client: Get their profile
     */
    profile: exports.clientProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(ctx.user.id)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Client: Get their assigned projects
     */
    clientProjects: exports.clientProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserProjects(ctx.user.id)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Any authenticated user: Add comment to project
     */
    addProjectComment: userWriteProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
        comment: zod_1.z.string(),
        commentType: zod_1.z["enum"](["remark", "update", "issue", "question", "approval"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var newComment;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.addProjectComment(input.projectId, ctx.user.id, input.comment, input.commentType || "remark", true)];
                    case 1:
                        newComment = _b.sent();
                        if (!newComment) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to add comment'
                            });
                        }
                        return [2 /*return*/, newComment];
                }
            });
        });
    }),
    /**
     * Get project comments (public only for clients)
     */
    getProjectComments: userReadProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var includePrivate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        includePrivate = ctx.user.role !== 'client';
                        return [4 /*yield*/, dbUsers.getProjectComments(input.projectId, includePrivate)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Admin: Assign user to project
     */
    assignToProject: exports.adminProcedure
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        projectId: zod_1.z.string(),
        role: zod_1.z["enum"](["project_manager", "team_lead", "developer", "designer", "qa", "other"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var assignment;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.assignUserToProject(input.userId, input.projectId, input.role || "developer")];
                    case 1:
                        assignment = _b.sent();
                        if (!assignment) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to assign user to project'
                            });
                        }
                        return [2 /*return*/, assignment];
                }
            });
        });
    }),
    /**
     * Extended: Assign user to project (allows Project Managers, HR, Admin, Super Admin)
     */
    assignStaffToProject: exports.staffAssignmentProcedure
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        projectId: zod_1.z.string(),
        role: zod_1.z["enum"](["project_manager", "team_lead", "developer", "designer", "qa", "other"]).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var assignment;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.assignUserToProject(input.userId, input.projectId, input.role || "developer")];
                    case 1:
                        assignment = _b.sent();
                        if (!assignment) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to assign user to project'
                            });
                        }
                        return [2 /*return*/, assignment];
                }
            });
        });
    }),
    /**
     * Admin: Get project team
     */
    getProjectTeam: exports.adminProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getProjectTeam(input.projectId)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Admin: Create staff task
     */
    createStaffTask: exports.adminProcedure
        .input(zod_1.z.object({
        title: zod_1.z.string(),
        department: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        assignedTo: zod_1.z.string().optional(),
        priority: zod_1.z["enum"](["low", "medium", "high", "urgent"]).optional(),
        dueDate: zod_1.z.date().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var task;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.createStaffTask(input.title, input.department, ctx.user.id, input.description, input.assignedTo, input.priority || "medium", input.dueDate)];
                    case 1:
                        task = _b.sent();
                        if (!task) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to create task'
                            });
                        }
                        return [2 /*return*/, task];
                }
            });
        });
    }),
    /**
     * Check if user has permission
     */
    hasPermission: userReadProcedure
        .input(zod_1.z.object({ permission: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.userHasPermission(ctx.user.id, input.permission)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Any authenticated user: Get their own profile
     */
    getMyProfile: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(ctx.user.id)];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }),
    /**
     * Any authenticated user: Update their own profile
     */
    updateMyProfile: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        company: zod_1.z.string().optional(),
        position: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        department: zod_1.z.string().optional(),
        photoUrl: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var updateData, user, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        updateData = __assign({}, input);
                        return [4 /*yield*/, dbUsers.updateUser(ctx.user.id, updateData)];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to update profile'
                            });
                        }
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'profile_updated',
                                entityType: 'user',
                                entityId: ctx.user.id,
                                description: "Updated own profile"
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, user];
                    case 3:
                        error_3 = _b.sent();
                        if (error_3 instanceof server_1.TRPCError)
                            throw error_3;
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to update profile'
                        });
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Any authenticated user: Update their password
     */
    updatePassword: userWriteProcedure
        .input(zod_1.z.object({
        currentPassword: zod_1.z.string(),
        newPassword: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: zod_1.z.string()
    }).refine(function (data) { return data.newPassword === data.confirmPassword; }, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user, success;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(ctx.user.id)];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'User not found'
                            });
                        }
                        return [4 /*yield*/, dbUsers.updatePassword(ctx.user.id, input.currentPassword, input.newPassword)];
                    case 2:
                        success = _b.sent();
                        if (!success) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Current password is incorrect'
                            });
                        }
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'password_changed',
                                entityType: 'user',
                                entityId: ctx.user.id,
                                description: "Changed password"
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Any authenticated user: Update their notification preferences
     */
    updateNotificationPreferences: userWriteProcedure
        .input(zod_1.z.object({
        emailNotifications: zod_1.z.boolean().optional(),
        pushNotifications: zod_1.z.boolean().optional(),
        smsNotifications: zod_1.z.boolean().optional(),
        notificationFrequency: zod_1.z["enum"](['instant', 'daily', 'weekly']).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var preferences;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        preferences = {
                            emailNotifications: input.emailNotifications,
                            pushNotifications: input.pushNotifications,
                            smsNotifications: input.smsNotifications,
                            notificationFrequency: input.notificationFrequency
                        };
                        return [4 /*yield*/, db.setSetting(ctx.user.id + "_notification_preferences", JSON.stringify(preferences), 'user_preferences', 'Notification preferences', ctx.user.id)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'notification_preferences_updated',
                                entityType: 'setting',
                                entityId: ctx.user.id,
                                description: "Updated notification preferences"
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Any authenticated user: Get their notification preferences
     */
    getNotificationPreferences: userReadProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var setting;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getSetting(ctx.user.id + "_notification_preferences")];
                    case 1:
                        setting = _b.sent();
                        if (!setting) {
                            return [2 /*return*/, {
                                    emailNotifications: true,
                                    pushNotifications: true,
                                    smsNotifications: false,
                                    notificationFrequency: 'instant'
                                }];
                        }
                        return [2 /*return*/, JSON.parse(setting.value || '{}')];
                }
            });
        });
    }),
    /**
     * Any authenticated user: Update their privacy settings
     */
    updatePrivacySettings: userWriteProcedure
        .input(zod_1.z.object({
        profileVisibility: zod_1.z["enum"](['public', 'private', 'contacts_only']).optional(),
        showEmail: zod_1.z.boolean().optional(),
        showPhone: zod_1.z.boolean().optional(),
        allowDirectMessages: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var settings;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        settings = {
                            profileVisibility: input.profileVisibility,
                            showEmail: input.showEmail,
                            showPhone: input.showPhone,
                            allowDirectMessages: input.allowDirectMessages
                        };
                        return [4 /*yield*/, db.setSetting(ctx.user.id + "_privacy_settings", JSON.stringify(settings), 'user_preferences', 'Privacy settings', ctx.user.id)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'privacy_settings_updated',
                                entityType: 'setting',
                                entityId: ctx.user.id,
                                description: "Updated privacy settings"
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Any authenticated user: Get their privacy settings
     */
    getPrivacySettings: userReadProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var setting;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getSetting(ctx.user.id + "_privacy_settings")];
                    case 1:
                        setting = _b.sent();
                        if (!setting) {
                            return [2 /*return*/, {
                                    profileVisibility: 'contacts_only',
                                    showEmail: false,
                                    showPhone: false,
                                    allowDirectMessages: true
                                }];
                        }
                        return [2 /*return*/, JSON.parse(setting.value || '{}')];
                }
            });
        });
    }),
    /**
     * Any authenticated user: Upload profile photo (base64)
     */
    uploadProfilePhoto: userWriteProcedure
        .input(zod_1.z.object({
        photoBase64: zod_1.z.string().min(1, 'Photo data required')
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var maxSizeBytes, sizeInBytes, user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        maxSizeBytes = 5 * 1024 * 1024;
                        sizeInBytes = Buffer.byteLength(input.photoBase64, 'utf8');
                        if (sizeInBytes > maxSizeBytes) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Photo too large (max 5MB)'
                            });
                        }
                        // Validate that it's actually a data URL
                        if (!input.photoBase64.startsWith('data:image/')) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Invalid image format. Must be a valid image data URL.'
                            });
                        }
                        return [4 /*yield*/, dbUsers.updateUser(ctx.user.id, {
                                photoUrl: input.photoBase64
                            })];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to store photo in database'
                            });
                        }
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'profile_photo_uploaded',
                                entityType: 'user',
                                entityId: ctx.user.id,
                                description: "Updated profile photo (" + (sizeInBytes / 1024).toFixed(2) + " KB)"
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, photoUrl: user.photoUrl }];
                }
            });
        });
    }),
    /**
     * Any authenticated user: Check if password change is required
     */
    checkPasswordChangeRequired: trpc_1.protectedProcedure.query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(ctx.user.id)];
                    case 1:
                        user = _b.sent();
                        return [2 /*return*/, {
                                requiresPasswordChange: (user === null || user === void 0 ? void 0 : user.requiresPasswordChange) === 1,
                                lastPasswordChange: user === null || user === void 0 ? void 0 : user.createdAt
                            }];
                }
            });
        });
    }),
    /**
     * Any authenticated user: Force change password on first login
     */
    forceChangePassword: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        newPassword: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: zod_1.z.string()
    }).refine(function (data) { return data.newPassword === data.confirmPassword; }, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user, bcrypt, salt, passwordHash, updated;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, dbUsers.getUserById(ctx.user.id)];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'User not found'
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("bcryptjs"); })];
                    case 2:
                        bcrypt = _b.sent();
                        return [4 /*yield*/, bcrypt.genSalt(10)];
                    case 3:
                        salt = _b.sent();
                        return [4 /*yield*/, bcrypt.hash(input.newPassword, salt)];
                    case 4:
                        passwordHash = _b.sent();
                        return [4 /*yield*/, dbUsers.updateUser(ctx.user.id, {
                                passwordHash: passwordHash,
                                requiresPasswordChange: 0
                            })];
                    case 5:
                        updated = _b.sent();
                        if (!updated) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to update password'
                            });
                        }
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'forced_password_changed',
                                entityType: 'user',
                                entityId: ctx.user.id,
                                description: "Changed password on first login"
                            })];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /**
     * Super Admin / ICT Manager: Hard delete inactive user completely
     */
    hardDelete: trpc_1.protectedProcedure
        .use(function (_a) {
        var ctx = _a.ctx, next = _a.next;
        if (!['super_admin', 'ict_manager'].includes(ctx.user.role)) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'Only Super Admin or ICT Manager can permanently delete users'
            });
        }
        return next({ ctx: ctx });
    })
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        confirmDelete: zod_1.z.boolean()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var user, success;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!input.confirmDelete) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Confirmation required to delete user'
                            });
                        }
                        return [4 /*yield*/, dbUsers.getUserById(input.userId)];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'User not found'
                            });
                        }
                        // Prevent deleting super_admin users
                        if (user.role === 'super_admin' && ctx.user.role !== 'super_admin') {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Only Super Admin can delete other Super Admin users'
                            });
                        }
                        // Prevent self-deletion
                        if (input.userId === ctx.user.id) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Cannot delete your own user account'
                            });
                        }
                        // Only allow deleting inactive users
                        if (user.isActive === 1) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Only inactive users can be permanently deleted. Deactivate user first.'
                            });
                        }
                        return [4 /*yield*/, dbUsers.hardDeleteUser(input.userId)];
                    case 2:
                        success = _b.sent();
                        if (!success) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Failed to permanently delete user'
                            });
                        }
                        // Log activity
                        return [4 /*yield*/, db.logActivity({
                                userId: ctx.user.id,
                                action: 'user_hard_deleted',
                                entityType: 'user',
                                entityId: input.userId,
                                description: "Permanently deleted user: " + user.name + " (" + user.email + ")"
                            })];
                    case 3:
                        // Log activity
                        _b.sent();
                        return [2 /*return*/, { success: true, message: "User " + user.email + " permanently deleted" }];
                }
            });
        });
    })
});
