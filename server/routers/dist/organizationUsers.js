"use strict";
/**
 * Organization Users Router
 * Handles organization-specific user management with tier-aware limits
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
exports.organizationUsersRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var db = require("../db");
var uuid_1 = require("uuid");
// Procedures with org-scoped access control
var orgUserViewProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (!ctx.user.organizationId && ctx.user.role !== 'super_admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Organization access required'
        });
    }
    return next({ ctx: ctx });
});
var orgUserEditProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (!ctx.user.organizationId && ctx.user.role !== 'super_admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Organization admin access required'
        });
    }
    if (ctx.user.role !== 'super_admin' && ctx.user.role !== 'admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Admin role required to manage users'
        });
    }
    return next({ ctx: ctx });
});
/**
 * Get organization's current subscription and user limit
 */
function getOrgUserLimit(organizationId) {
    return __awaiter(this, void 0, Promise, function () {
        var database, _a, organizations, subscriptions, pricingPlans, organizationUsers, eq, orgRows, org, userCount, subRows, subscription, planRows, plan, userCount, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _b.sent();
                    if (!database)
                        return [2 /*return*/, { limit: 10, current: 0 }];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 2:
                    _a = _b.sent(), organizations = _a.organizations, subscriptions = _a.subscriptions, pricingPlans = _a.pricingPlans, organizationUsers = _a.organizationUsers;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                case 3:
                    eq = (_b.sent()).eq;
                    return [4 /*yield*/, database.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1)];
                case 4:
                    orgRows = _b.sent();
                    org = orgRows[0];
                    if (!org)
                        return [2 /*return*/, { limit: 10, current: 0 }];
                    if (!(org.maxUsers && org.maxUsers > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, database
                            .select()
                            .from(organizationUsers)
                            .where(eq(organizationUsers.organizationId, organizationId))];
                case 5:
                    userCount = _b.sent();
                    return [2 /*return*/, { limit: org.maxUsers, current: userCount.length }];
                case 6: return [4 /*yield*/, database.select().from(subscriptions).where(eq(subscriptions.clientId, organizationId)).limit(1)];
                case 7:
                    subRows = _b.sent();
                    subscription = subRows[0];
                    if (!subscription) return [3 /*break*/, 10];
                    return [4 /*yield*/, database.select().from(pricingPlans).where(eq(pricingPlans.id, subscription.planId)).limit(1)];
                case 8:
                    planRows = _b.sent();
                    plan = planRows[0];
                    if (!(plan && plan.maxUsers && plan.maxUsers > 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, database
                            .select()
                            .from(organizationUsers)
                            .where(eq(organizationUsers.organizationId, organizationId))];
                case 9:
                    userCount = _b.sent();
                    return [2 /*return*/, { limit: plan.maxUsers, current: userCount.length }];
                case 10: 
                // Default to free tier limit
                return [2 /*return*/, { limit: 10, current: 0 }];
                case 11:
                    error_1 = _b.sent();
                    console.error('Error getting org user limit:', error_1);
                    return [2 /*return*/, { limit: 10, current: 0 }];
                case 12: return [2 /*return*/];
            }
        });
    });
}
exports.organizationUsersRouter = trpc_1.router({
    /**
     * List all users in organization with sorting, filtering, searching
     */
    list: orgUserViewProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        role: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
        sortBy: zod_1.z["enum"](['name', 'email', 'role', 'createdAt', 'lastSignedIn']).optional()["default"]('createdAt'),
        sortOrder: zod_1.z["enum"](['asc', 'desc']).optional()["default"]('desc'),
        limit: zod_1.z.number().min(1).max(100).optional()["default"](50),
        offset: zod_1.z.number().min(0).optional()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var scopedOrgId, database, organizationUsers, _b, eq, and, like, or, asc, desc, conditions, whereClause, sortColumn, sortFn, baseQuery, users, countQuery, allRows, total, error_2;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        scopedOrgId = ctx.user.role === 'super_admin'
                            ? ((_c = input.organizationId) !== null && _c !== void 0 ? _c : undefined)
                            : (_d = ctx.user.organizationId) !== null && _d !== void 0 ? _d : undefined;
                        // Non super_admin can only access their own org
                        if (ctx.user.role !== 'super_admin' && input.organizationId && input.organizationId !== ctx.user.organizationId) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'You can only access your organization\'s users'
                            });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _e.sent();
                        if (!database)
                            return [2 /*return*/, { users: [], total: 0, limit: input.limit, offset: input.offset }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 2:
                        organizationUsers = (_e.sent()).organizationUsers;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        _b = _e.sent(), eq = _b.eq, and = _b.and, like = _b.like, or = _b.or, asc = _b.asc, desc = _b.desc;
                        conditions = [];
                        if (scopedOrgId) {
                            conditions.push(eq(organizationUsers.organizationId, scopedOrgId));
                        }
                        if (input.search) {
                            conditions.push(or(like(organizationUsers.name, "%" + input.search + "%"), like(organizationUsers.email, "%" + input.search + "%")));
                        }
                        if (input.role) {
                            conditions.push(eq(organizationUsers.role, input.role));
                        }
                        if (input.isActive !== undefined) {
                            conditions.push(eq(organizationUsers.isActive, input.isActive ? 1 : 0));
                        }
                        whereClause = conditions.length === 0 ? undefined
                            : conditions.length === 1 ? conditions[0]
                                : and.apply(void 0, conditions);
                        sortColumn = {
                            name: organizationUsers.name,
                            email: organizationUsers.email,
                            role: organizationUsers.role,
                            createdAt: organizationUsers.createdAt,
                            lastSignedIn: organizationUsers.lastSignedIn
                        }[input.sortBy] || organizationUsers.createdAt;
                        sortFn = input.sortOrder === 'asc' ? asc : desc;
                        baseQuery = database.select().from(organizationUsers);
                        if (whereClause)
                            baseQuery = baseQuery.where(whereClause);
                        return [4 /*yield*/, baseQuery.orderBy(sortFn(sortColumn)).limit(input.limit).offset(input.offset)];
                    case 4:
                        users = _e.sent();
                        countQuery = database.select().from(organizationUsers);
                        if (whereClause)
                            countQuery = countQuery.where(whereClause);
                        return [4 /*yield*/, countQuery];
                    case 5:
                        allRows = _e.sent();
                        total = allRows.length;
                        return [2 /*return*/, {
                                users: users,
                                total: total,
                                limit: input.limit,
                                offset: input.offset
                            }];
                    case 6:
                        error_2 = _e.sent();
                        console.error('Error listing org users:', error_2);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_2.message || 'Failed to list organization users'
                        });
                    case 7: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get single organization user
     */
    getById: orgUserViewProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        userId: zod_1.z.string()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizationUsers, _b, eq, and, results, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        // Verify org access
                        if (ctx.user.organizationId && ctx.user.organizationId !== input.organizationId) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'You can only access your organization\'s users'
                            });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 2:
                        organizationUsers = (_c.sent()).organizationUsers;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        _b = _c.sent(), eq = _b.eq, and = _b.and;
                        return [4 /*yield*/, database.select().from(organizationUsers)
                                .where(and(eq(organizationUsers.id, input.userId), eq(organizationUsers.organizationId, input.organizationId)))
                                .limit(1)];
                    case 4:
                        results = _c.sent();
                        return [2 /*return*/, results[0] || null];
                    case 5:
                        error_3 = _c.sent();
                        console.error('Error getting org user:', error_3);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to retrieve organization user'
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Create new organization user (invite)
     */
    create: orgUserEditProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        name: zod_1.z.string().min(1).max(255),
        email: zod_1.z.string().email(),
        role: zod_1.z["enum"](['super_admin', 'admin', 'manager', 'staff', 'viewer', 'ict_manager', 'project_manager', 'hr', 'accountant', 'procurement_manager', 'sales_manager'])["default"]('staff'),
        position: zod_1.z.string().optional(),
        department: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var _b, limit, current, database, organizationUsers, _c, eq, and, existingRows, existing, userId, error_4;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 7, , 8]);
                        // Verify org access
                        if (ctx.user.organizationId && ctx.user.organizationId !== input.organizationId) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'You can only manage users in your organization'
                            });
                        }
                        return [4 /*yield*/, getOrgUserLimit(input.organizationId)];
                    case 1:
                        _b = _d.sent(), limit = _b.limit, current = _b.current;
                        if (current >= limit) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: "User limit reached. Your plan allows " + limit + " users. Upgrade to add more."
                            });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 2:
                        database = _d.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Database connection failed'
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 3:
                        organizationUsers = (_d.sent()).organizationUsers;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 4:
                        _c = _d.sent(), eq = _c.eq, and = _c.and;
                        return [4 /*yield*/, database.select().from(organizationUsers)
                                .where(and(eq(organizationUsers.organizationId, input.organizationId), eq(organizationUsers.email, input.email)))
                                .limit(1)];
                    case 5:
                        existingRows = _d.sent();
                        existing = existingRows[0];
                        if (existing) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'User with this email already exists in the organization'
                            });
                        }
                        userId = uuid_1.v4();
                        // Insert user
                        return [4 /*yield*/, database.insert(organizationUsers).values({
                                id: userId,
                                organizationId: input.organizationId,
                                name: input.name,
                                email: input.email,
                                role: input.role,
                                position: input.position,
                                department: input.department,
                                phone: input.phone,
                                photoUrl: undefined,
                                isActive: 1,
                                invitationSent: 1,
                                invitationSentAt: new Date().toISOString(),
                                lastSignedIn: undefined,
                                loginCount: 0,
                                createdBy: ctx.user.id,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            })];
                    case 6:
                        // Insert user
                        _d.sent();
                        return [2 /*return*/, { id: userId }];
                    case 7:
                        error_4 = _d.sent();
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        console.error('Error creating org user:', error_4);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_4.message || 'Failed to create organization user'
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update organization user
     */
    update: orgUserEditProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        userId: zod_1.z.string(),
        name: zod_1.z.string().min(1).max(255).optional(),
        email: zod_1.z.string().email().optional(),
        role: zod_1.z["enum"](['super_admin', 'admin', 'manager', 'staff', 'viewer', 'ict_manager', 'project_manager', 'hr', 'accountant', 'procurement_manager', 'sales_manager']).optional(),
        position: zod_1.z.string().optional(),
        department: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, organizationUsers, users, _c, eq, and, updateData, orgUser, error_5;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 8, , 9]);
                        // Verify org access
                        if (ctx.user.organizationId && ctx.user.organizationId !== input.organizationId) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'You can only manage users in your organization'
                            });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Database connection failed'
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 2:
                        _b = _d.sent(), organizationUsers = _b.organizationUsers, users = _b.users;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        _c = _d.sent(), eq = _c.eq, and = _c.and;
                        updateData = {
                            updatedAt: new Date().toISOString()
                        };
                        if (input.name !== undefined)
                            updateData.name = input.name;
                        if (input.email !== undefined)
                            updateData.email = input.email;
                        if (input.role !== undefined)
                            updateData.role = input.role;
                        if (input.position !== undefined)
                            updateData.position = input.position;
                        if (input.department !== undefined)
                            updateData.department = input.department;
                        if (input.phone !== undefined)
                            updateData.phone = input.phone;
                        if (input.isActive !== undefined)
                            updateData.isActive = input.isActive ? 1 : 0;
                        return [4 /*yield*/, database.update(organizationUsers)
                                .set(updateData)
                                .where(and(eq(organizationUsers.id, input.userId), eq(organizationUsers.organizationId, input.organizationId)))];
                    case 4:
                        _d.sent();
                        if (!(input.role !== undefined)) return [3 /*break*/, 7];
                        return [4 /*yield*/, database.select({ userId: organizationUsers.userId })
                                .from(organizationUsers)
                                .where(and(eq(organizationUsers.id, input.userId), eq(organizationUsers.organizationId, input.organizationId)))
                                .limit(1)];
                    case 5:
                        orgUser = (_d.sent())[0];
                        if (!(orgUser === null || orgUser === void 0 ? void 0 : orgUser.userId)) return [3 /*break*/, 7];
                        return [4 /*yield*/, database.update(users)
                                .set({ role: input.role })
                                .where(eq(users.id, orgUser.userId))];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7: return [2 /*return*/, { success: true }];
                    case 8:
                        error_5 = _d.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        console.error('Error updating org user:', error_5);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_5.message || 'Failed to update organization user'
                        });
                    case 9: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Delete organization user
     */
    "delete": orgUserEditProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        userId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizationUsers, _b, eq, and, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        // Verify org access
                        if (ctx.user.organizationId && ctx.user.organizationId !== input.organizationId) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'You can only manage users in your organization'
                            });
                        }
                        // Prevent deleting self
                        if (input.userId === ctx.user.id) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Cannot delete your own user account'
                            });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Database connection failed'
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 2:
                        organizationUsers = (_c.sent()).organizationUsers;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        _b = _c.sent(), eq = _b.eq, and = _b.and;
                        return [4 /*yield*/, database["delete"](organizationUsers)
                                .where(and(eq(organizationUsers.id, input.userId), eq(organizationUsers.organizationId, input.organizationId)))];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_6 = _c.sent();
                        if (error_6 instanceof server_1.TRPCError)
                            throw error_6;
                        console.error('Error deleting org user:', error_6);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_6.message || 'Failed to delete organization user'
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk delete organization users
     */
    bulkDelete: orgUserEditProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        userIds: zod_1.z.array(zod_1.z.string()).min(1)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizationUsers, _b, eq, and, inArray, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        // Verify org access
                        if (ctx.user.organizationId && ctx.user.organizationId !== input.organizationId) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'You can only manage users in your organization'
                            });
                        }
                        // Prevent deleting self
                        if (input.userIds.includes(ctx.user.id)) {
                            throw new server_1.TRPCError({
                                code: 'BAD_REQUEST',
                                message: 'Cannot delete your own user account'
                            });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Database connection failed'
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 2:
                        organizationUsers = (_c.sent()).organizationUsers;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        _b = _c.sent(), eq = _b.eq, and = _b.and, inArray = _b.inArray;
                        return [4 /*yield*/, database["delete"](organizationUsers)
                                .where(and(eq(organizationUsers.organizationId, input.organizationId), inArray(organizationUsers.id, input.userIds)))];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, { success: true, deletedCount: input.userIds.length }];
                    case 5:
                        error_7 = _c.sent();
                        if (error_7 instanceof server_1.TRPCError)
                            throw error_7;
                        console.error('Error bulk deleting org users:', error_7);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_7.message || 'Failed to bulk delete organization users'
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Bulk update organization users (activate/deactivate/change role)
     */
    bulkUpdate: orgUserEditProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        userIds: zod_1.z.array(zod_1.z.string()).min(1),
        isActive: zod_1.z.boolean().optional(),
        role: zod_1.z["enum"](['super_admin', 'admin', 'manager', 'staff', 'viewer', 'ict_manager', 'project_manager', 'hr', 'accountant', 'procurement_manager', 'sales_manager']).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizationUsers, _b, eq, and, inArray, updateData, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        // Verify org access
                        if (ctx.user.organizationId && ctx.user.organizationId !== input.organizationId) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'You can only manage users in your organization'
                            });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Database connection failed'
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 2:
                        organizationUsers = (_c.sent()).organizationUsers;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        _b = _c.sent(), eq = _b.eq, and = _b.and, inArray = _b.inArray;
                        updateData = {
                            updatedAt: new Date().toISOString()
                        };
                        if (input.isActive !== undefined)
                            updateData.isActive = input.isActive ? 1 : 0;
                        if (input.role !== undefined)
                            updateData.role = input.role;
                        return [4 /*yield*/, database.update(organizationUsers)
                                .set(updateData)
                                .where(and(eq(organizationUsers.organizationId, input.organizationId), inArray(organizationUsers.id, input.userIds)))];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, { success: true, updatedCount: input.userIds.length }];
                    case 5:
                        error_8 = _c.sent();
                        if (error_8 instanceof server_1.TRPCError)
                            throw error_8;
                        console.error('Error bulk updating org users:', error_8);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_8.message || 'Failed to bulk update organization users'
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Check user limit and get current usage
     */
    getUserLimitInfo: orgUserViewProcedure
        .input(zod_1.z.object({ organizationId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var _b, limit, current, error_9;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        // Verify org access
                        if (ctx.user.organizationId && ctx.user.organizationId !== input.organizationId) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'You can only access your organization\'s information'
                            });
                        }
                        return [4 /*yield*/, getOrgUserLimit(input.organizationId)];
                    case 1:
                        _b = _c.sent(), limit = _b.limit, current = _b.current;
                        return [2 /*return*/, {
                                limit: limit,
                                current: current,
                                remaining: Math.max(0, limit - current),
                                isAtLimit: current >= limit,
                                upgraded: limit > 10
                            }];
                    case 2:
                        error_9 = _c.sent();
                        console.error('Error getting user limit:', error_9);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to get user limit information'
                        });
                    case 3: return [2 /*return*/];
                }
            });
        });
    })
});
