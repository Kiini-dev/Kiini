"use strict";
/**
 * Enterprise Tenants Management Router
 * Handles multi-tenancy admin operations, tenant management, pricing tiers
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
exports.enterpriseTenantsRouter = void 0;
var zod_1 = require("zod");
var server_1 = require("@trpc/server");
var trpc_1 = require("../_core/trpc");
var db = require("../db");
var uuid_1 = require("uuid");
// Super admin only procedure
var superAdminProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (ctx.user.role !== 'super_admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Super admin access required'
        });
    }
    return next({ ctx: ctx });
});
exports.enterpriseTenantsRouter = trpc_1.router({
    /**
     * List all tenants (organizations) with search, filtering, sorting
     */
    list: superAdminProcedure
        .input(zod_1.z.object({
        search: zod_1.z.string().optional(),
        tier: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
        sortBy: zod_1.z["enum"](['name', 'plan', 'createdAt', 'maxUsers']).optional()["default"]('createdAt'),
        sortOrder: zod_1.z["enum"](['asc', 'desc']).optional()["default"]('desc'),
        limit: zod_1.z.number().min(1).max(100).optional()["default"](50),
        offset: zod_1.z.number().min(0).optional()["default"](0)
    }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database_1, _b, organizations, subscriptions, pricingPlans, organizationUsers_1, _c, eq_1, like, or, asc, desc, count_1, query, sortColumn, sortFn, tenants, totalResult, total, enrichedTenants, error_1;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database_1 = _e.sent();
                        if (!database_1)
                            return [2 /*return*/, { tenants: [], total: 0 }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 2:
                        _b = _e.sent(), organizations = _b.organizations, subscriptions = _b.subscriptions, pricingPlans = _b.pricingPlans, organizationUsers_1 = _b.organizationUsers;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        _c = _e.sent(), eq_1 = _c.eq, like = _c.like, or = _c.or, asc = _c.asc, desc = _c.desc, count_1 = _c.count;
                        query = database_1.select({
                            id: organizations.id,
                            name: organizations.name,
                            slug: organizations.slug,
                            plan: organizations.plan,
                            maxUsers: organizations.maxUsers,
                            isActive: organizations.isActive,
                            domain: organizations.domain,
                            contactEmail: organizations.contactEmail,
                            createdAt: organizations.createdAt,
                            updatedAt: organizations.updatedAt
                        }).from(organizations);
                        // Apply filters
                        if (input.search) {
                            query = query.where(or(like(organizations.name, "%" + input.search + "%"), like(organizations.slug, "%" + input.search + "%"), like(organizations.domain || '', "%" + input.search + "%")));
                        }
                        if (input.tier) {
                            query = query.where(eq_1(organizations.plan, input.tier));
                        }
                        if (input.isActive !== undefined) {
                            query = query.where(eq_1(organizations.isActive, input.isActive ? 1 : 0));
                        }
                        sortColumn = {
                            name: organizations.name,
                            plan: organizations.plan,
                            createdAt: organizations.createdAt,
                            maxUsers: organizations.maxUsers
                        }[input.sortBy] || organizations.createdAt;
                        sortFn = input.sortOrder === 'asc' ? asc : desc;
                        query = query.orderBy(sortFn(sortColumn));
                        return [4 /*yield*/, query.limit(input.limit).offset(input.offset)];
                    case 4:
                        tenants = _e.sent();
                        return [4 /*yield*/, database_1.select({ count: count_1() }).from(organizations)];
                    case 5:
                        totalResult = _e.sent();
                        total = ((_d = totalResult[0]) === null || _d === void 0 ? void 0 : _d.count) || 0;
                        return [4 /*yield*/, Promise.all(tenants.map(function (tenant) { return __awaiter(void 0, void 0, void 0, function () {
                                var userCount;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, database_1
                                                .select({ count: count_1() })
                                                .from(organizationUsers_1)
                                                .where(eq_1(organizationUsers_1.organizationId, tenant.id))];
                                        case 1:
                                            userCount = _b.sent();
                                            return [2 /*return*/, __assign(__assign({}, tenant), { userCount: ((_a = userCount[0]) === null || _a === void 0 ? void 0 : _a.count) || 0 })];
                                    }
                                });
                            }); }))];
                    case 6:
                        enrichedTenants = _e.sent();
                        return [2 /*return*/, {
                                tenants: enrichedTenants,
                                total: total,
                                limit: input.limit,
                                offset: input.offset
                            }];
                    case 7:
                        error_1 = _e.sent();
                        console.error('Error listing tenants:', error_1);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_1.message || 'Failed to list tenants'
                        });
                    case 8: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get single tenant with detailed subscription info
     */
    getById: superAdminProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var tenantId = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, organizations, subscriptions, pricingPlans, organizationUsers, _c, eq, count, tenantRows, tenant, tenantSubscriptions, activeSubscription, activePlan, planRows, userCountResult, userCount, error_2;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _e.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 2:
                        _b = _e.sent(), organizations = _b.organizations, subscriptions = _b.subscriptions, pricingPlans = _b.pricingPlans, organizationUsers = _b.organizationUsers;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        _c = _e.sent(), eq = _c.eq, count = _c.count;
                        return [4 /*yield*/, database.select().from(organizations).where(eq(organizations.id, tenantId)).limit(1)];
                    case 4:
                        tenantRows = _e.sent();
                        tenant = tenantRows[0] || null;
                        if (!tenant)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database.select().from(subscriptions).where(eq(subscriptions.clientId, tenantId))];
                    case 5:
                        tenantSubscriptions = _e.sent();
                        activeSubscription = null;
                        activePlan = null;
                        if (!(tenantSubscriptions.length > 0)) return [3 /*break*/, 7];
                        activeSubscription = tenantSubscriptions.sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); })[0];
                        if (!activeSubscription) return [3 /*break*/, 7];
                        return [4 /*yield*/, database.select().from(pricingPlans).where(eq(pricingPlans.id, activeSubscription.planId)).limit(1)];
                    case 6:
                        planRows = _e.sent();
                        activePlan = planRows[0] || null;
                        _e.label = 7;
                    case 7: return [4 /*yield*/, database
                            .select({ count: count() })
                            .from(organizationUsers)
                            .where(eq(organizationUsers.organizationId, tenantId))];
                    case 8:
                        userCountResult = _e.sent();
                        userCount = ((_d = userCountResult[0]) === null || _d === void 0 ? void 0 : _d.count) || 0;
                        return [2 /*return*/, __assign(__assign({}, tenant), { activeSubscription: activeSubscription,
                                activePlan: activePlan,
                                userCount: userCount, subscriptions: tenantSubscriptions })];
                    case 9:
                        error_2 = _e.sent();
                        console.error('Error getting tenant:', error_2);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_2.message || 'Failed to get tenant details'
                        });
                    case 10: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get tenant metrics for dashboard / SLA reporting
     */
    getTenantMetrics: superAdminProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var tenantId = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, organizations, subscriptions, organizationUsers, tickets, _c, eq, or, and, desc, count, _d, mysqlTable, varchar, datetime, tenantCommunications, tenantRows, tenant, userCountResult, totalTicketsResult, newTicketsResult, recentCommunicationResult, subscriptionResult, lastCommunicationAt, latestSubscription, error_3;
            var _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _k.trys.push([0, 11, , 12]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _k.sent();
                        if (!database)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 2:
                        _b = _k.sent(), organizations = _b.organizations, subscriptions = _b.subscriptions, organizationUsers = _b.organizationUsers, tickets = _b.tickets;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        _c = _k.sent(), eq = _c.eq, or = _c.or, and = _c.and, desc = _c.desc, count = _c.count;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm/mysql-core"); })];
                    case 4:
                        _d = _k.sent(), mysqlTable = _d.mysqlTable, varchar = _d.varchar, datetime = _d.datetime;
                        tenantCommunications = mysqlTable("tenantCommunications", {
                            id: varchar("id", { length: 64 }).primaryKey(),
                            organizationId: varchar("organizationId", { length: 64 }),
                            status: varchar("status", { length: 50 }),
                            recipientType: varchar("recipientType", { length: 50 }),
                            sentAt: datetime("sentAt")
                        });
                        return [4 /*yield*/, database.select().from(organizations).where(eq(organizations.id, tenantId)).limit(1)];
                    case 5:
                        tenantRows = _k.sent();
                        tenant = tenantRows[0] || null;
                        if (!tenant)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, database
                                .select({ count: count() })
                                .from(organizationUsers)
                                .where(eq(organizationUsers.organizationId, tenantId))];
                    case 6:
                        userCountResult = _k.sent();
                        return [4 /*yield*/, database
                                .select({ count: count() })
                                .from(tickets)
                                .where(eq(tickets.organizationId, tenantId))];
                    case 7:
                        totalTicketsResult = _k.sent();
                        return [4 /*yield*/, database
                                .select({ count: count() })
                                .from(tickets)
                                .where(and(eq(tickets.organizationId, tenantId), eq(tickets.status, 'new')))];
                    case 8:
                        newTicketsResult = _k.sent();
                        return [4 /*yield*/, database
                                .select({ sentAt: tenantCommunications.sentAt })
                                .from(tenantCommunications)
                                .where(and(eq(tenantCommunications.status, 'sent'), or(eq(tenantCommunications.recipientType, 'all_tenants'), eq(tenantCommunications.organizationId, tenantId))))
                                .orderBy(desc(tenantCommunications.sentAt))
                                .limit(1)];
                    case 9:
                        recentCommunicationResult = _k.sent();
                        return [4 /*yield*/, database
                                .select()
                                .from(subscriptions)
                                .where(eq(subscriptions.clientId, tenantId))
                                .orderBy(desc(subscriptions.updatedAt))
                                .limit(1)];
                    case 10:
                        subscriptionResult = _k.sent();
                        lastCommunicationAt = Array.isArray(recentCommunicationResult)
                            ? (_f = (_e = recentCommunicationResult[0]) === null || _e === void 0 ? void 0 : _e.sentAt) !== null && _f !== void 0 ? _f : null : null;
                        latestSubscription = Array.isArray(subscriptionResult)
                            ? subscriptionResult[0] || null
                            : null;
                        return [2 /*return*/, {
                                tenantId: tenantId,
                                name: tenant.name,
                                plan: tenant.plan,
                                isActive: tenant.isActive,
                                maxUsers: tenant.maxUsers,
                                userCount: ((_g = userCountResult[0]) === null || _g === void 0 ? void 0 : _g.count) || 0,
                                totalTickets: ((_h = totalTicketsResult[0]) === null || _h === void 0 ? void 0 : _h.count) || 0,
                                newTickets: ((_j = newTicketsResult[0]) === null || _j === void 0 ? void 0 : _j.count) || 0,
                                lastCommunicationAt: lastCommunicationAt,
                                latestSubscription: latestSubscription,
                                createdAt: tenant.createdAt,
                                updatedAt: tenant.updatedAt
                            }];
                    case 11:
                        error_3 = _k.sent();
                        console.error('Error getting tenant metrics:', error_3);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_3.message || 'Failed to get tenant metrics'
                        });
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update tenant (organization) details
     */
    update: superAdminProcedure
        .input(zod_1.z.object({
        tenantId: zod_1.z.string(),
        name: zod_1.z.string().min(1).optional(),
        slug: zod_1.z.string().optional(),
        plan: zod_1.z.string().optional(),
        maxUsers: zod_1.z.number().min(1).optional(),
        isActive: zod_1.z.boolean().optional(),
        domain: zod_1.z.string().optional(),
        contactEmail: zod_1.z.string().email().optional(),
        contactPhone: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizations, eq, updateData, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database) {
                            throw new server_1.TRPCError({
                                code: 'INTERNAL_SERVER_ERROR',
                                message: 'Database connection failed'
                            });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 2:
                        organizations = (_b.sent()).organizations;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        eq = (_b.sent()).eq;
                        updateData = {
                            updatedAt: new Date().toISOString()
                        };
                        if (input.name !== undefined)
                            updateData.name = input.name;
                        if (input.slug !== undefined)
                            updateData.slug = input.slug;
                        if (input.plan !== undefined)
                            updateData.plan = input.plan;
                        if (input.maxUsers !== undefined)
                            updateData.maxUsers = input.maxUsers;
                        if (input.isActive !== undefined)
                            updateData.isActive = input.isActive ? 1 : 0;
                        if (input.domain !== undefined)
                            updateData.domain = input.domain;
                        if (input.contactEmail !== undefined)
                            updateData.contactEmail = input.contactEmail;
                        if (input.contactPhone !== undefined)
                            updateData.contactPhone = input.contactPhone;
                        return [4 /*yield*/, database.update(organizations)
                                .set(updateData)
                                .where(eq(organizations.id, input.tenantId))];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_4 = _b.sent();
                        if (error_4 instanceof server_1.TRPCError)
                            throw error_4;
                        console.error('Error updating tenant:', error_4);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_4.message || 'Failed to update tenant'
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Update tenant's pricing tier and user limit
     */
    updatePricingTier: superAdminProcedure
        .input(zod_1.z.object({
        tenantId: zod_1.z.string(),
        planId: zod_1.z.string(),
        maxUsers: zod_1.z.number().min(1).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, organizations, subscriptions, pricingPlans, eq, planRows, plan, updateData, existingSubRows, existingSubscription, subscriptionId, now, renewal, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 11, , 12]);
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
                        _b = _c.sent(), organizations = _b.organizations, subscriptions = _b.subscriptions, pricingPlans = _b.pricingPlans;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        eq = (_c.sent()).eq;
                        return [4 /*yield*/, database.select().from(pricingPlans).where(eq(pricingPlans.id, input.planId)).limit(1)];
                    case 4:
                        planRows = _c.sent();
                        plan = planRows[0] || null;
                        if (!plan) {
                            throw new server_1.TRPCError({
                                code: 'NOT_FOUND',
                                message: 'Pricing plan not found'
                            });
                        }
                        updateData = {
                            plan: plan.planSlug,
                            maxUsers: input.maxUsers || plan.maxUsers || 10,
                            updatedAt: new Date().toISOString()
                        };
                        return [4 /*yield*/, database.update(organizations)
                                .set(updateData)
                                .where(eq(organizations.id, input.tenantId))];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, database.select().from(subscriptions).where(eq(subscriptions.clientId, input.tenantId)).limit(1)];
                    case 6:
                        existingSubRows = _c.sent();
                        existingSubscription = existingSubRows[0] || null;
                        if (!existingSubscription) return [3 /*break*/, 8];
                        return [4 /*yield*/, database.update(subscriptions)
                                .set({
                                planId: input.planId,
                                currentPrice: plan.monthlyPrice,
                                updatedAt: new Date().toISOString()
                            })
                                .where(eq(subscriptions.id, existingSubscription.id))];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 10];
                    case 8:
                        subscriptionId = uuid_1.v4();
                        now = new Date();
                        renewal = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, database.insert(subscriptions).values({
                                id: subscriptionId,
                                clientId: input.tenantId,
                                planId: input.planId,
                                status: 'active',
                                billingCycle: 'monthly',
                                startDate: now.toISOString(),
                                renewalDate: renewal.toISOString(),
                                currentPrice: plan.monthlyPrice,
                                usersCount: 0,
                                projectsCount: 0,
                                storageUsedGB: 0,
                                createdAt: now.toISOString(),
                                updatedAt: now.toISOString()
                            })];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10: return [2 /*return*/, { success: true }];
                    case 11:
                        error_5 = _c.sent();
                        if (error_5 instanceof server_1.TRPCError)
                            throw error_5;
                        console.error('Error updating pricing tier:', error_5);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_5.message || 'Failed to update pricing tier'
                        });
                    case 12: return [2 /*return*/];
                }
            });
        });
    }),
    /**
     * Get all available pricing plans/tiers
     */
    getPricingTiers: superAdminProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var database, pricingPlans, eq, tiers, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, db.getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                case 2:
                    pricingPlans = (_a.sent()).pricingPlans;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                case 3:
                    eq = (_a.sent()).eq;
                    return [4 /*yield*/, database.select().from(pricingPlans)
                            .where(eq(pricingPlans.isActive, 1))
                            .orderBy(pricingPlans.displayOrder)];
                case 4:
                    tiers = _a.sent();
                    return [2 /*return*/, tiers];
                case 5:
                    error_6 = _a.sent();
                    console.error('Error getting pricing tiers:', error_6);
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: error_6.message || 'Failed to get pricing tiers'
                    });
                case 6: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get tenant admins list (users with admin/super_admin role)
     */
    getTenantAdmins: superAdminProcedure
        .input(zod_1.z.string())
        .query(function (_a) {
        var tenantId = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizationUsers, _b, eq, and, or, admins, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _c.sent();
                        if (!database)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("../../drizzle/schema"); })];
                    case 2:
                        organizationUsers = (_c.sent()).organizationUsers;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        _b = _c.sent(), eq = _b.eq, and = _b.and, or = _b.or;
                        return [4 /*yield*/, database.select().from(organizationUsers)
                                .where(and(or(eq(organizationUsers.role, 'admin'), eq(organizationUsers.role, 'super_admin')), eq(organizationUsers.organizationId, tenantId)))
                                .orderBy(organizationUsers.createdAt)];
                    case 4:
                        admins = _c.sent();
                        return [2 /*return*/, admins];
                    case 5:
                        error_7 = _c.sent();
                        console.error('Error getting tenant admins:', error_7);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_7.message || 'Failed to get tenant admins'
                        });
                    case 6: return [2 /*return*/];
                }
            });
        });
    ,
    /**
     * Delete tenant (organization) and cascade-delete its users and subscriptions
     */
    delete: superAdminProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) {
        var tenantId = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, organizations, organizationUsers, subscriptions, eq, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
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
                        _b = _c.sent(), organizations = _b.organizations, organizationUsers = _b.organizationUsers, subscriptions = _b.subscriptions;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("drizzle-orm"); })];
                    case 3:
                        eq = (_c.sent()).eq;
                        return [4 /*yield*/, database.delete(organizationUsers).where(eq(organizationUsers.organizationId, tenantId))];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, database.delete(subscriptions).where(eq(subscriptions.clientId, tenantId))];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, database.delete(organizations).where(eq(organizations.id, tenantId))];
                    case 6:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                    case 7:
                        error_8 = _c.sent();
                        if (error_8 instanceof server_1.TRPCError)
                            throw error_8;
                        console.error('Error deleting tenant:', error_8);
                        throw new server_1.TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error_8.message || 'Failed to delete tenant'
                        });
                }
            });
        });
    })
    })
});
