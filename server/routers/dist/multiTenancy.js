"use strict";
/**
 * Multi-Tenancy & Enterprise Router
 * Full implementation with organization CRUD, features, admin management, etc.
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.multiTenancyRouter = exports.TIER_DEFAULT_FEATURES = exports.ORG_MODULES = void 0;
var trpc_1 = require("../_core/trpc");
var enhancedRbac_1 = require("../middleware/enhancedRbac");
var server_1 = require("@trpc/server");
var zod_1 = require("zod");
var uuid_1 = require("uuid");
var db = require("../db");
var orgSubscriptionJobs_1 = require("../services/orgSubscriptionJobs");
var enterpriseViewProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('enterprise:view');
var enterpriseEditProcedure = enhancedRbac_1.createFeatureRestrictedProcedure('enterprise:edit');
/**
 * Org-scoped view procedure:
 * - Kiini super admins (no organizationId) can view any org
 * - Org super admins can only view their own org
 */
var orgViewProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    // Kiini staff are allowed to proceed to check specific org access
    return next({ ctx: ctx });
});
/**
 * Org-scoped edit procedure:
 * - Kiini super admins can edit any org
 * - Org super admins can only edit their own org
 */
var orgEditProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    // Only super_admin roles can edit organizations
    if (ctx.user.role !== 'super_admin') {
        throw new server_1.TRPCError({
            code: 'FORBIDDEN',
            message: 'Only super admins can modify organizations'
        });
    }
    return next({ ctx: ctx });
});
exports.ORG_MODULES = [
    { key: 'crm', label: 'CRM', description: 'Clients, opportunities, sales pipeline' },
    { key: 'projects', label: 'Projects & Tasks', description: 'Project management, milestones, time tracking' },
    { key: 'hr', label: 'HR Management', description: 'Employees, departments, job groups' },
    { key: 'payroll', label: 'Payroll', description: 'Payroll processing, salary structures' },
    { key: 'leave', label: 'Leave Management', description: 'Leave requests and approvals' },
    { key: 'attendance', label: 'Attendance', description: 'Attendance tracking' },
    { key: 'invoicing', label: 'Invoicing & Billing', description: 'Invoices, estimates, credit and debit notes' },
    { key: 'payments', label: 'Payments', description: 'Payment tracking and reconciliation' },
    { key: 'expenses', label: 'Expenses', description: 'Expense management and tracking' },
    { key: 'procurement', label: 'Procurement', description: 'LPOs, orders, suppliers, inventory' },
    { key: 'accounting', label: 'Accounting', description: 'Chart of accounts, journal entries' },
    { key: 'budgets', label: 'Budgets', description: 'Budget management and tracking' },
    { key: 'reports', label: 'Reports & Analytics', description: 'Financial and operational reports' },
    { key: 'ai_hub', label: 'AI Hub', description: 'AI-powered features and insights' },
    { key: 'communications', label: 'Communications', description: 'Internal messaging and bulk communications' },
    { key: 'tickets', label: 'Support Tickets', description: 'Ticket management and support' },
    { key: 'contracts', label: 'Contracts & Assets', description: 'Contract management, assets, warranties' },
    { key: 'work_orders', label: 'Work Orders', description: 'Work orders and service management' },
];
/**
 * Default feature set per pricing tier.
 * Used when no DB entries exist yet for a tier (seed / first-run).
 *
 * trial        – minimal: CRM + Invoicing + Reports (14-day evaluation)
 * starter      – core business: CRM, Invoicing, Payments, Expenses, Tickets, Reports
 * professional – full operations: + Projects, HR, Leave, Attendance, Accounting, Budgets, Communications
 * enterprise   – all modules unlocked
 * custom       – all modules (managed manually per org)
 */
/** Hard-coded tier → maxUsers defaults. Only 'custom' allows overriding. */
var TIER_MAX_USERS = {
    trial: 5,
    starter: 10,
    professional: 50,
    enterprise: 500,
    custom: 0
};
/** Resolve maxUsers for a plan. For non-custom tiers the value is locked to the tier default. */
function resolveTierMaxUsers(plan, requestedMaxUsers) {
    var _a, _b;
    if (plan === 'custom')
        return requestedMaxUsers !== null && requestedMaxUsers !== void 0 ? requestedMaxUsers : 10;
    return (_b = (_a = TIER_MAX_USERS[plan]) !== null && _a !== void 0 ? _a : requestedMaxUsers) !== null && _b !== void 0 ? _b : 10;
}
exports.TIER_DEFAULT_FEATURES = {
    trial: {
        crm: true, invoicing: true, reports: true,
        projects: false, hr: false, payroll: false, leave: false, attendance: false,
        payments: false, expenses: false, procurement: false, accounting: false,
        budgets: false, ai_hub: false, communications: false, tickets: false,
        contracts: false, work_orders: false
    },
    starter: {
        crm: true, invoicing: true, payments: true, expenses: true, tickets: true, reports: true,
        projects: false, hr: false, payroll: false, leave: false, attendance: false,
        procurement: false, accounting: false, budgets: false, ai_hub: false,
        communications: false, contracts: false, work_orders: false
    },
    professional: {
        crm: true, invoicing: true, payments: true, expenses: true, tickets: true, reports: true,
        projects: true, hr: true, leave: true, attendance: true,
        accounting: true, budgets: true, communications: true,
        payroll: false, procurement: false, ai_hub: false, contracts: false, work_orders: false
    },
    enterprise: {
        crm: true, projects: true, hr: true, payroll: true, leave: true, attendance: true,
        invoicing: true, payments: true, expenses: true, procurement: true,
        accounting: true, budgets: true, reports: true, ai_hub: true,
        communications: true, tickets: true, contracts: true, work_orders: true
    },
    custom: {
        crm: true, projects: true, hr: true, payroll: true, leave: true, attendance: true,
        invoicing: true, payments: true, expenses: true, procurement: true,
        accounting: true, budgets: true, reports: true, ai_hub: true,
        communications: true, tickets: true, contracts: true, work_orders: true
    }
};
exports.multiTenancyRouter = trpc_1.router({
    // ── Organization CRUD ───────────────────────────────────────────
    listOrganizations: enterpriseViewProcedure
        .input(zod_1.z.object({ includeArchived: zod_1.z.boolean().optional() }).optional())
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgs, showArchived, enriched;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db.getAllOrganizations()];
                    case 1:
                        orgs = _c.sent();
                        if (ctx.user.organizationId) {
                            orgs = orgs.filter(function (org) { return org.id === ctx.user.organizationId; });
                        }
                        showArchived = (_b = input === null || input === void 0 ? void 0 : input.includeArchived) !== null && _b !== void 0 ? _b : false;
                        if (!showArchived) {
                            orgs = orgs.filter(function (org) { return !org.isArchived; });
                        }
                        return [4 /*yield*/, Promise.all(orgs.map(function (org) { return __awaiter(void 0, void 0, void 0, function () {
                                var orgUsers, features;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, db.getUsersByOrganization(org.id)];
                                        case 1:
                                            orgUsers = _a.sent();
                                            return [4 /*yield*/, db.getOrganizationFeatures(org.id)];
                                        case 2:
                                            features = _a.sent();
                                            return [2 /*return*/, __assign(__assign({}, org), { userCount: orgUsers.length, featureCount: features.filter(function (f) { return f.isEnabled; }).length })];
                                    }
                                });
                            }); }))];
                    case 2:
                        enriched = _c.sent();
                        return [2 /*return*/, { organizations: enriched }];
                }
            });
        });
    }),
    getOrganization: orgViewProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, features, orgUsers, safeUsers;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getOrganization(input.id)];
                    case 1:
                        org = _b.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        // Check org scope access: Kiini super admins can access any org,
                        // org super admins can only access their own org
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, org.id)) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'You can only access your own organization'
                            });
                        }
                        return [4 /*yield*/, db.getOrganizationFeatures(input.id)];
                    case 2:
                        features = _b.sent();
                        return [4 /*yield*/, db.getUsersByOrganization(input.id)];
                    case 3:
                        orgUsers = _b.sent();
                        safeUsers = orgUsers.map(function (_a) {
                            var passwordHash = _a.passwordHash, passwordResetToken = _a.passwordResetToken, u = __rest(_a, ["passwordHash", "passwordResetToken"]);
                            return u;
                        });
                        return [2 /*return*/, { organization: org, features: features, users: safeUsers }];
                }
            });
        });
    }),
    createOrganization: enterpriseEditProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(2), slug: zod_1.z.string().min(2).regex(/^[a-z0-9-]+$/),
        plan: zod_1.z.string()["default"]('trial'), maxUsers: zod_1.z.number().optional(),
        billingCycle: zod_1.z["enum"](['monthly', 'annual'])["default"]('monthly'),
        contactEmail: zod_1.z.string().email().optional(), contactPhone: zod_1.z.string().optional(),
        domain: zod_1.z.string().optional(), country: zod_1.z.string().optional(), address: zod_1.z.string().optional(),
        industry: zod_1.z.string().optional(), website: zod_1.z.string().optional(),
        taxId: zod_1.z.string().optional(), billingEmail: zod_1.z.string().email().optional(),
        timezone: zod_1.z.string().optional(), currency: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(), employeeCount: zod_1.z.number().optional(),
        registrationNumber: zod_1.z.string().optional(), paymentMethod: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var existing, id, maxUsers, org, subscriptionId, now, renewalDate, trialPlan, price, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db.getOrganizationBySlug(input.slug)];
                    case 1:
                        existing = _d.sent();
                        if (existing)
                            throw new server_1.TRPCError({ code: 'CONFLICT', message: 'Slug already taken' });
                        id = "org_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        maxUsers = resolveTierMaxUsers(input.plan, input.maxUsers);
                        return [4 /*yield*/, db.createOrganization(__assign(__assign({ id: id }, input), { maxUsers: maxUsers, isActive: 1, settings: { billingCycle: input.billingCycle } }))];
                    case 2:
                        org = _d.sent();
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 6, , 7]);
                        subscriptionId = "sub_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        now = new Date();
                        renewalDate = new Date();
                        // Set renewal date based on billing cycle
                        if (input.billingCycle === 'monthly') {
                            renewalDate.setMonth(renewalDate.getMonth() + 1);
                        }
                        else {
                            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                        }
                        return [4 /*yield*/, db.getPricingPlan(input.plan)];
                    case 4:
                        trialPlan = _d.sent();
                        price = input.billingCycle === 'monthly'
                            ? ((_b = trialPlan) === null || _b === void 0 ? void 0 : _b.monthlyPrice) || 0
                            : ((_c = trialPlan) === null || _c === void 0 ? void 0 : _c.annualPrice) || 0;
                        return [4 /*yield*/, db.createSubscription({
                                id: subscriptionId,
                                organizationId: id,
                                planId: input.plan,
                                status: 'trial',
                                billingCycle: input.billingCycle,
                                startDate: now.toISOString().replace('T', ' ').substring(0, 19),
                                renewalDate: renewalDate.toISOString().replace('T', ' ').substring(0, 19),
                                currentPrice: price,
                                autoRenew: 1
                            })];
                    case 5:
                        _d.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _d.sent();
                        console.error('[MultiTenancy] Failed to create subscription for org:', error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, { organization: org, success: true }];
                }
            });
        });
    }),
    updateOrganization: orgEditProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().optional(), plan: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(), maxUsers: zod_1.z.number().optional(),
        contactEmail: zod_1.z.string().optional(), contactPhone: zod_1.z.string().optional(),
        domain: zod_1.z.string().optional(), country: zod_1.z.string().optional(), address: zod_1.z.string().optional(),
        logoUrl: zod_1.z.string().optional(),
        industry: zod_1.z.string().optional(), website: zod_1.z.string().optional(),
        taxId: zod_1.z.string().optional(), billingEmail: zod_1.z.string().optional(),
        timezone: zod_1.z.string().optional(), currency: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(), employeeCount: zod_1.z.number().optional(),
        registrationNumber: zod_1.z.string().optional(), paymentMethod: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id, isActive, rest, org, effectivePlan, updated;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        id = input.id, isActive = input.isActive, rest = __rest(input, ["id", "isActive"]);
                        return [4 /*yield*/, db.getOrganization(id)];
                    case 1:
                        org = _d.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND' });
                        // Check org scope access: org admins can only edit their own org
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, org.id)) {
                            throw new server_1.TRPCError({
                                code: 'FORBIDDEN',
                                message: 'You can only edit your own organization'
                            });
                        }
                        effectivePlan = (_c = (_b = rest.plan) !== null && _b !== void 0 ? _b : org.plan) !== null && _c !== void 0 ? _c : 'trial';
                        if (effectivePlan !== 'custom') {
                            rest.maxUsers = resolveTierMaxUsers(effectivePlan, rest.maxUsers);
                        }
                        return [4 /*yield*/, db.updateOrganization(id, __assign(__assign({}, rest), (isActive !== undefined ? { isActive: isActive ? 1 : 0 } : {})))];
                    case 2:
                        updated = _d.sent();
                        return [2 /*return*/, { organization: updated, success: true }];
                }
            });
        });
    }),
    deleteOrganization: enterpriseEditProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getOrganization(input.id)];
                    case 1:
                        org = _b.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND' });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, orgSubscriptionJobs_1.removeOrgSubscriptionJobs(input.id)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _b.sent();
                        console.error('[MultiTenancy] Job cleanup error:', e_1);
                        return [3 /*break*/, 5];
                    case 5: return [4 /*yield*/, db.deleteOrganization(input.id)];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    archiveOrganization: enterpriseEditProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getOrganization(input.id)];
                    case 1:
                        org = _b.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND' });
                        if (org.isArchived)
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Organization is already archived' });
                        return [4 /*yield*/, db.updateOrganization(input.id, { isArchived: 1, isActive: 0, archivedAt: new Date().toISOString().slice(0, 19).replace('T', ' '), archivedBy: ctx.user.id })];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, orgSubscriptionJobs_1.removeOrgSubscriptionJobs(input.id)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_2 = _b.sent();
                        console.error('[MultiTenancy] Job cleanup on archive:', e_2);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    restoreOrganization: enterpriseEditProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, e_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getOrganization(input.id)];
                    case 1:
                        org = _b.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND' });
                        if (!org.isArchived)
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Organization is not archived' });
                        return [4 /*yield*/, db.updateOrganization(input.id, { isArchived: 0, isActive: 1, archivedAt: null, archivedBy: null })];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, orgSubscriptionJobs_1.createOrgSubscriptionJobs(input.id, org.name || input.id, org.plan || 'trial')];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_3 = _b.sent();
                        console.error('[MultiTenancy] Job restore error:', e_3);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Feature Management ──────────────────────────────────────────
    getOrgFeatures: enterpriseViewProcedure
        .input(zod_1.z.object({ organizationId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var features, featureMap;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, input.organizationId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only access your own organization' });
                        }
                        return [4 /*yield*/, db.getOrganizationFeatures(input.organizationId)];
                    case 1:
                        features = _b.sent();
                        featureMap = {};
                        features.forEach(function (f) { featureMap[f.featureKey] = Boolean(f.isEnabled); });
                        exports.ORG_MODULES.forEach(function (mod) { if (!(mod.key in featureMap))
                            featureMap[mod.key] = true; });
                        return [2 /*return*/, { features: featureMap, rawFeatures: features }];
                }
            });
        });
    }),
    setOrgFeature: enterpriseEditProcedure
        .input(zod_1.z.object({ organizationId: zod_1.z.string(), featureKey: zod_1.z.string(), isEnabled: zod_1.z.boolean() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var org;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, input.organizationId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only modify your own organization' });
                        }
                        return [4 /*yield*/, db.getOrganization(input.organizationId)];
                    case 1:
                        org = _b.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND' });
                        return [4 /*yield*/, db.setOrganizationFeature(input.organizationId, input.featureKey, input.isEnabled)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    bulkSetOrgFeatures: enterpriseEditProcedure
        .input(zod_1.z.object({ organizationId: zod_1.z.string(), features: zod_1.z.record(zod_1.z.string(), zod_1.z.boolean()) }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var org;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, input.organizationId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only modify your own organization' });
                        }
                        return [4 /*yield*/, db.getOrganization(input.organizationId)];
                    case 1:
                        org = _b.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND' });
                        return [4 /*yield*/, Promise.all(Object.entries(input.features).map(function (_a) {
                                var key = _a[0], enabled = _a[1];
                                return db.setOrganizationFeature(input.organizationId, key, enabled);
                            }))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Create organization WITH admin ──────────────────────────────
    createOrganizationWithAdmin: enterpriseEditProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(2),
        slug: zod_1.z.string().min(2).regex(/^[a-z0-9-]+$/),
        plan: zod_1.z.string().min(1)["default"]('trial'),
        maxUsers: zod_1.z.number().optional(),
        billingCycle: zod_1.z["enum"](['monthly', 'annual'])["default"]('monthly'),
        contactEmail: zod_1.z.string().optional(), contactPhone: zod_1.z.string().optional(),
        domain: zod_1.z.string().optional(), country: zod_1.z.string().optional(), address: zod_1.z.string().optional(),
        industry: zod_1.z.string().optional(), website: zod_1.z.string().optional(),
        taxId: zod_1.z.string().optional(), billingEmail: zod_1.z.string().email().optional(),
        timezone: zod_1.z.string().optional(), currency: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(), employeeCount: zod_1.z.number().optional(),
        registrationNumber: zod_1.z.string().optional(), paymentMethod: zod_1.z.string().optional(),
        adminMode: zod_1.z["enum"](['create', 'assign']),
        adminName: zod_1.z.string().optional(), adminEmail: zod_1.z.string().email().optional(),
        adminPassword: zod_1.z.string().min(6).optional(), existingUserId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var adminMode, adminName, adminEmail, adminPassword, existingUserId, billingCycle, orgData, existing, maxUsers, orgId, org, tierFeatures, defaults, adminUser, _b, getUserByEmail, createUser, existingEmail, bcrypt_1, salt, passwordHash, userId, subscriptionRecord, subscriptionId, now, renewalDate, plan, price, subscription, subError_1, jobError_1;
            var _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        adminMode = input.adminMode, adminName = input.adminName, adminEmail = input.adminEmail, adminPassword = input.adminPassword, existingUserId = input.existingUserId, billingCycle = input.billingCycle, orgData = __rest(input, ["adminMode", "adminName", "adminEmail", "adminPassword", "existingUserId", "billingCycle"]);
                        if (adminMode === 'create' && (!adminName || !adminEmail || !adminPassword))
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Admin name, email, and password required' });
                        if (adminMode === 'assign' && !existingUserId)
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Existing user ID required' });
                        return [4 /*yield*/, db.getOrganizationBySlug(orgData.slug)];
                    case 1:
                        existing = _f.sent();
                        if (existing)
                            throw new server_1.TRPCError({ code: 'CONFLICT', message: 'Slug already taken' });
                        maxUsers = resolveTierMaxUsers(orgData.plan, orgData.maxUsers);
                        orgId = "org_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        return [4 /*yield*/, db.createOrganization(__assign(__assign({ id: orgId }, orgData), { maxUsers: maxUsers, isActive: 1, settings: { billingCycle: billingCycle } }))];
                    case 2:
                        org = _f.sent();
                        return [4 /*yield*/, db.getPricingTierFeatures(orgData.plan)];
                    case 3:
                        tierFeatures = _f.sent();
                        if (!(tierFeatures.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, Promise.all(tierFeatures.map(function (tf) {
                                return db.setOrganizationFeature(orgId, tf.featureKey, Boolean(tf.isEnabled));
                            }))];
                    case 4:
                        _f.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        defaults = (_c = exports.TIER_DEFAULT_FEATURES[orgData.plan]) !== null && _c !== void 0 ? _c : exports.TIER_DEFAULT_FEATURES['trial'];
                        return [4 /*yield*/, Promise.all(Object.entries(defaults).map(function (_a) {
                                var key = _a[0], enabled = _a[1];
                                return db.setOrganizationFeature(orgId, key, enabled);
                            }))];
                    case 6:
                        _f.sent();
                        _f.label = 7;
                    case 7:
                        adminUser = null;
                        if (!(adminMode === 'create')) return [3 /*break*/, 14];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db-users'); })];
                    case 8:
                        _b = _f.sent(), getUserByEmail = _b.getUserByEmail, createUser = _b.createUser;
                        return [4 /*yield*/, getUserByEmail(adminEmail)];
                    case 9:
                        existingEmail = _f.sent();
                        if (existingEmail)
                            throw new server_1.TRPCError({ code: 'CONFLICT', message: 'Admin email already exists' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('bcryptjs'); })];
                    case 10:
                        bcrypt_1 = _f.sent();
                        return [4 /*yield*/, bcrypt_1.genSalt(10)];
                    case 11:
                        salt = _f.sent();
                        return [4 /*yield*/, bcrypt_1.hash(adminPassword, salt)];
                    case 12:
                        passwordHash = _f.sent();
                        userId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                        return [4 /*yield*/, createUser({
                                id: userId, name: adminName, email: adminEmail,
                                passwordHash: passwordHash,
                                role: 'super_admin', isActive: 1,
                                organizationId: orgId, requiresPasswordChange: 0
                            })];
                    case 13:
                        adminUser = _f.sent();
                        return [3 /*break*/, 16];
                    case 14: return [4 /*yield*/, db.assignUserToOrganization(existingUserId, orgId)];
                    case 15:
                        _f.sent();
                        adminUser = { id: existingUserId };
                        _f.label = 16;
                    case 16:
                        subscriptionRecord = null;
                        _f.label = 17;
                    case 17:
                        _f.trys.push([17, 20, , 21]);
                        subscriptionId = "sub_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        now = new Date();
                        renewalDate = new Date();
                        // Set renewal date based on billing cycle
                        if (billingCycle === 'monthly') {
                            renewalDate.setMonth(renewalDate.getMonth() + 1);
                        }
                        else {
                            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                        }
                        return [4 /*yield*/, db.getPricingPlan(orgData.plan)];
                    case 18:
                        plan = _f.sent();
                        price = billingCycle === 'monthly'
                            ? ((_d = plan) === null || _d === void 0 ? void 0 : _d.monthlyPrice) || 0
                            : ((_e = plan) === null || _e === void 0 ? void 0 : _e.annualPrice) || 0;
                        return [4 /*yield*/, db.createSubscription({
                                id: subscriptionId,
                                organizationId: orgId,
                                planId: orgData.plan,
                                status: 'trial',
                                billingCycle: billingCycle,
                                startDate: now.toISOString().replace('T', ' ').substring(0, 19),
                                renewalDate: renewalDate.toISOString().replace('T', ' ').substring(0, 19),
                                currentPrice: price,
                                autoRenew: 1
                            })];
                    case 19:
                        subscription = _f.sent();
                        subscriptionRecord = { id: subscriptionId, status: 'trial', planId: orgData.plan, billingCycle: billingCycle };
                        return [3 /*break*/, 21];
                    case 20:
                        subError_1 = _f.sent();
                        console.error('[MultiTenancy] Failed to create subscription:', subError_1);
                        return [3 /*break*/, 21];
                    case 21:
                        _f.trys.push([21, 23, , 24]);
                        return [4 /*yield*/, orgSubscriptionJobs_1.createOrgSubscriptionJobs(orgId, orgData.name, orgData.plan)];
                    case 22:
                        _f.sent();
                        return [3 /*break*/, 24];
                    case 23:
                        jobError_1 = _f.sent();
                        console.error('[MultiTenancy] Failed to create subscription jobs:', jobError_1);
                        return [3 /*break*/, 24];
                    case 24: return [2 /*return*/, { organization: org, adminUser: adminUser, subscription: subscriptionRecord, success: true }];
                }
            });
        });
    }),
    // ── Update Organization Admin ────────────────────────────────────
    updateOrganizationAdmin: enterpriseEditProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        adminName: zod_1.z.string().optional(), adminEmail: zod_1.z.string().email().optional(),
        adminPassword: zod_1.z.string().min(6).optional(), existingUserId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, database, users, eq, _b, getUserByEmail, createUser, existing, bcrypt_2, salt, passwordHash, userId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db.getOrganization(input.organizationId)];
                    case 1:
                        org = _c.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND' });
                        if (!input.existingUserId) return [3 /*break*/, 8];
                        return [4 /*yield*/, db.assignUserToOrganization(input.existingUserId, input.organizationId)];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, db.getDb()];
                    case 3:
                        database = _c.sent();
                        if (!database) return [3 /*break*/, 7];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 4:
                        users = (_c.sent()).users;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 5:
                        eq = (_c.sent()).eq;
                        return [4 /*yield*/, database.update(users).set({ role: 'super_admin' }).where(eq(users.id, input.existingUserId))];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7: return [2 /*return*/, { success: true, adminUserId: input.existingUserId }];
                    case 8:
                        if (!input.adminEmail) return [3 /*break*/, 17];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db-users'); })];
                    case 9:
                        _b = _c.sent(), getUserByEmail = _b.getUserByEmail, createUser = _b.createUser;
                        return [4 /*yield*/, getUserByEmail(input.adminEmail)];
                    case 10:
                        existing = _c.sent();
                        if (!existing) return [3 /*break*/, 12];
                        return [4 /*yield*/, db.assignUserToOrganization(existing.id, input.organizationId)];
                    case 11:
                        _c.sent();
                        return [2 /*return*/, { success: true, adminUserId: existing.id }];
                    case 12:
                        if (!input.adminName || !input.adminPassword)
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Name and password required for new admin' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('bcryptjs'); })];
                    case 13:
                        bcrypt_2 = _c.sent();
                        return [4 /*yield*/, bcrypt_2.genSalt(10)];
                    case 14:
                        salt = _c.sent();
                        return [4 /*yield*/, bcrypt_2.hash(input.adminPassword, salt)];
                    case 15:
                        passwordHash = _c.sent();
                        userId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                        return [4 /*yield*/, createUser({
                                id: userId, name: input.adminName, email: input.adminEmail,
                                passwordHash: passwordHash,
                                role: 'super_admin', isActive: 1,
                                organizationId: input.organizationId, requiresPasswordChange: 0
                            })];
                    case 16:
                        _c.sent();
                        return [2 /*return*/, { success: true, adminUserId: userId }];
                    case 17: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Member Management ───────────────────────────────────────────
    listOrganizationMembers: enterpriseViewProcedure
        .input(zod_1.z
        .object({
        organizationId: zod_1.z.string().optional(),
        includeInactive: zod_1.z.boolean()["default"](false)
    })
        .optional())
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, organizationMembers, _b, users, organizations, _c, eq, desc, rows, scopedOrgId, filtered;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            return [2 /*return*/, { members: [] }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema-extended'); })];
                    case 2:
                        organizationMembers = (_d.sent()).organizationMembers;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        _b = _d.sent(), users = _b.users, organizations = _b.organizations;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 4:
                        _c = _d.sent(), eq = _c.eq, desc = _c.desc;
                        return [4 /*yield*/, database
                                .select({
                                membershipId: organizationMembers.id,
                                organizationId: organizationMembers.organizationId,
                                memberRole: organizationMembers.role,
                                memberStatus: organizationMembers.status,
                                memberIsActive: organizationMembers.isActive,
                                joinedAt: organizationMembers.joinedAt,
                                leftAt: organizationMembers.leftAt,
                                createdAt: organizationMembers.createdAt,
                                userId: users.id,
                                userName: users.name,
                                userEmail: users.email,
                                userRole: users.role,
                                organizationName: organizations.name,
                                organizationSlug: organizations.slug
                            })
                                .from(organizationMembers)
                                .leftJoin(users, eq(organizationMembers.userId, users.id))
                                .leftJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
                                .orderBy(desc(organizationMembers.createdAt))
                                .limit(2000)];
                    case 5:
                        rows = _d.sent();
                        scopedOrgId = ctx.user.organizationId || (input === null || input === void 0 ? void 0 : input.organizationId);
                        filtered = rows.filter(function (row) {
                            if (scopedOrgId && row.organizationId !== scopedOrgId)
                                return false;
                            if (!(input === null || input === void 0 ? void 0 : input.includeInactive) && !row.memberIsActive)
                                return false;
                            return true;
                        });
                        return [2 /*return*/, { members: filtered }];
                }
            });
        });
    }),
    getOrgUsers: enterpriseViewProcedure
        .input(zod_1.z.object({ organizationId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgUsers, safe;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, input.organizationId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only access your own organization' });
                        }
                        return [4 /*yield*/, db.getUsersByOrganization(input.organizationId)];
                    case 1:
                        orgUsers = _b.sent();
                        safe = orgUsers.map(function (_a) {
                            var passwordHash = _a.passwordHash, passwordResetToken = _a.passwordResetToken, u = __rest(_a, ["passwordHash", "passwordResetToken"]);
                            return u;
                        });
                        return [2 /*return*/, { users: safe }];
                }
            });
        });
    }),
    assignUserToOrg: enterpriseEditProcedure
        .input(zod_1.z.object({ userId: zod_1.z.string(), organizationId: zod_1.z.string().nullable() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (input.organizationId && !enhancedRbac_1.checkOrgScopeAccess(ctx, input.organizationId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only assign users within your own organization' });
                        }
                        if (!input.organizationId && ctx.user.organizationId) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Organization administrators cannot unassign users globally' });
                        }
                        return [4 /*yield*/, db.assignUserToOrganization(input.userId, input.organizationId)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Tenant Admin Management ─────────────────────────────────────
    listTenantAdmins: enterpriseViewProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var admins, enriched;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getAllTenantSuperAdmins()];
                    case 1:
                        admins = _b.sent();
                        if (ctx.user.organizationId) {
                            admins = admins.filter(function (admin) { return admin.organizationId === ctx.user.organizationId; });
                        }
                        return [4 /*yield*/, Promise.all(admins.map(function (admin) { return __awaiter(void 0, void 0, void 0, function () {
                                var org, _a;
                                var _b, _c, _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            if (!admin.organizationId) return [3 /*break*/, 2];
                                            return [4 /*yield*/, db.getOrganization(admin.organizationId)];
                                        case 1:
                                            _a = _e.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            _a = null;
                                            _e.label = 3;
                                        case 3:
                                            org = _a;
                                            return [2 /*return*/, {
                                                    id: admin.id, name: admin.name, email: admin.email, role: admin.role,
                                                    isActive: Boolean(admin.isActive),
                                                    organizationId: admin.organizationId,
                                                    organizationName: (_b = org === null || org === void 0 ? void 0 : org.name) !== null && _b !== void 0 ? _b : '—', organizationSlug: (_c = org === null || org === void 0 ? void 0 : org.slug) !== null && _c !== void 0 ? _c : '—',
                                                    organizationPlan: (_d = org === null || org === void 0 ? void 0 : org.plan) !== null && _d !== void 0 ? _d : '—',
                                                    organizationIsActive: org ? Boolean(org.isActive) : null
                                                }];
                                    }
                                });
                            }); }))];
                    case 2:
                        enriched = _b.sent();
                        return [2 /*return*/, { admins: enriched }];
                }
            });
        });
    }),
    // ── Pricing Tier Features ──────────────────────────────────────
    getPricingTierFeatures: enterpriseViewProcedure
        .input(zod_1.z.object({ tier: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var features, featureMap;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getPricingTierFeatures(input.tier)];
                    case 1:
                        features = _b.sent();
                        featureMap = {};
                        features.forEach(function (f) { featureMap[f.featureKey] = Boolean(f.isEnabled); });
                        return [2 /*return*/, { features: featureMap, rawFeatures: features }];
                }
            });
        });
    }),
    getAllPricingTierFeatures: enterpriseViewProcedure
        .query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var all, byTier, availablePlans;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.getAllPricingTierFeatures()];
                case 1:
                    all = _a.sent();
                    byTier = {};
                    all.forEach(function (f) {
                        if (!byTier[f.tier])
                            byTier[f.tier] = {};
                        byTier[f.tier][f.featureKey] = Boolean(f.isEnabled);
                    });
                    return [4 /*yield*/, db.getAvailablePlans()];
                case 2:
                    availablePlans = _a.sent();
                    availablePlans.forEach(function (plan) {
                        var baseline = byTier[plan.planSlug] || {};
                        var planFeatures = {};
                        if (typeof plan.features === 'string' && plan.features) {
                            try {
                                planFeatures = JSON.parse(plan.features);
                            }
                            catch (error) {
                                planFeatures = {};
                            }
                        }
                        else if (typeof plan.features === 'object' && plan.features !== null) {
                            planFeatures = plan.features;
                        }
                        byTier[plan.planSlug] = __assign(__assign({}, baseline), planFeatures);
                    });
                    return [2 /*return*/, { tiers: byTier }];
            }
        });
    }); }),
    setPricingTierFeature: enterpriseEditProcedure
        .input(zod_1.z.object({ tier: zod_1.z.string(), featureKey: zod_1.z.string(), isEnabled: zod_1.z.boolean() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.setPricingTierFeature(input.tier, input.featureKey, input.isEnabled)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    bulkSetPricingTierFeatures: enterpriseEditProcedure
        .input(zod_1.z.object({
        tier: zod_1.z.string(),
        features: zod_1.z.record(zod_1.z.string(), zod_1.z.boolean())
    }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.bulkSetPricingTierFeatures(input.tier, input.features)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    applyTierToOrganization: enterpriseEditProcedure
        .input(zod_1.z.object({ organizationId: zod_1.z.string(), tier: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, featuresToApply, tierFeatures, oldPlan, jobError_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, input.organizationId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only modify your own organization' });
                        }
                        return [4 /*yield*/, db.getOrganization(input.organizationId)];
                    case 1:
                        org = _c.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND' });
                        return [4 /*yield*/, db.getPricingTierFeatures(input.tier)];
                    case 2:
                        tierFeatures = _c.sent();
                        if (tierFeatures.length > 0) {
                            featuresToApply = {};
                            tierFeatures.forEach(function (tf) { featuresToApply[tf.featureKey] = Boolean(tf.isEnabled); });
                        }
                        else {
                            // No DB seed yet — use in-code defaults for the requested tier
                            featuresToApply = (_b = exports.TIER_DEFAULT_FEATURES[input.tier]) !== null && _b !== void 0 ? _b : exports.TIER_DEFAULT_FEATURES['trial'];
                        }
                        return [4 /*yield*/, Promise.all(Object.entries(featuresToApply).map(function (_a) {
                                var key = _a[0], enabled = _a[1];
                                return db.setOrganizationFeature(input.organizationId, key, enabled);
                            }))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, db.updateOrganization(input.organizationId, { plan: input.tier })];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        oldPlan = org.plan || 'trial';
                        return [4 /*yield*/, orgSubscriptionJobs_1.updateOrgSubscriptionJobs(input.organizationId, org.name || 'Organization', oldPlan, input.tier)];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        jobError_2 = _c.sent();
                        console.error('[MultiTenancy] Failed to update subscription jobs:', jobError_2);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, { success: true, featuresApplied: Object.keys(featuresToApply).length }];
                }
            });
        });
    }),
    /**
     * Seeds the pricingTierFeatures table with default values for all tiers.
     * Safe to call multiple times — only inserts missing entries, does not override existing ones.
     */
    seedDefaultTierFeatures: enterpriseEditProcedure
        .mutation(function () { return __awaiter(void 0, void 0, void 0, function () {
        var existing, existingSet, seeded, _i, _a, _b, tier, features, _c, _d, _e, featureKey, isEnabled;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, db.getAllPricingTierFeatures()];
                case 1:
                    existing = _f.sent();
                    existingSet = new Set(existing.map(function (f) { return f.tier + ":" + f.featureKey; }));
                    seeded = 0;
                    _i = 0, _a = Object.entries(exports.TIER_DEFAULT_FEATURES);
                    _f.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    _b = _a[_i], tier = _b[0], features = _b[1];
                    _c = 0, _d = Object.entries(features);
                    _f.label = 3;
                case 3:
                    if (!(_c < _d.length)) return [3 /*break*/, 6];
                    _e = _d[_c], featureKey = _e[0], isEnabled = _e[1];
                    if (!!existingSet.has(tier + ":" + featureKey)) return [3 /*break*/, 5];
                    return [4 /*yield*/, db.setPricingTierFeature(tier, featureKey, isEnabled)];
                case 4:
                    _f.sent();
                    seeded++;
                    _f.label = 5;
                case 5:
                    _c++;
                    return [3 /*break*/, 3];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/, { success: true, seeded: seeded }];
            }
        });
    }); }),
    // ── Tenant Communications ──────────────────────────────────────
    sendTenantMessage: enterpriseEditProcedure
        .input(zod_1.z.object({
        subject: zod_1.z.string(), content: zod_1.z.string(),
        priority: zod_1.z.string().optional(), targetType: zod_1.z.string().optional(),
        targetOrgId: zod_1.z.string().optional(), targetUserId: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var id, msg, database, communicationLogs, orgUsers, recipientEmails, targetOrg, _b, recipientUsers, _c, _d, priorityMap, mappedPriority;
            var _e, _f, _g, _h, _j, _k, _l, _m, _o;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        id = "tmsg_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        return [4 /*yield*/, db.createTenantMessage({
                                id: id, senderId: (_f = (_e = ctx.user) === null || _e === void 0 ? void 0 : _e.id) !== null && _f !== void 0 ? _f : 'system',
                                subject: input.subject, content: input.content,
                                priority: (_g = input.priority) !== null && _g !== void 0 ? _g : 'normal',
                                targetType: (_h = input.targetType) !== null && _h !== void 0 ? _h : 'all',
                                targetOrgId: (_j = input.targetOrgId) !== null && _j !== void 0 ? _j : null,
                                targetUserId: (_k = input.targetUserId) !== null && _k !== void 0 ? _k : null
                            })];
                    case 1:
                        msg = _p.sent();
                        if (!input.targetOrgId) return [3 /*break*/, 6];
                        return [4 /*yield*/, db.getDb()];
                    case 2:
                        database = _p.sent();
                        if (!database) return [3 /*break*/, 6];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        communicationLogs = (_p.sent()).communicationLogs;
                        return [4 /*yield*/, db.getUsersByOrganization(input.targetOrgId)];
                    case 4:
                        orgUsers = _p.sent();
                        recipientEmails = orgUsers
                            .filter(function (u) { return !!u.email; })
                            .map(function (u) { return u.email; })
                            .slice(0, 20)
                            .join(', ');
                        return [4 /*yield*/, database.insert(communicationLogs).values({
                                id: "com_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
                                organizationId: input.targetOrgId,
                                type: 'email',
                                recipient: recipientEmails || 'tenant-admins',
                                subject: input.subject,
                                body: input.content,
                                status: 'sent',
                                referenceType: 'tenant_message',
                                referenceId: id,
                                sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                createdBy: (_m = (_l = ctx.user) === null || _l === void 0 ? void 0 : _l.id) !== null && _m !== void 0 ? _m : 'system',
                                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
                            })];
                    case 5:
                        _p.sent();
                        _p.label = 6;
                    case 6:
                        if (!input.targetOrgId) return [3 /*break*/, 8];
                        return [4 /*yield*/, db.getOrganization(input.targetOrgId)];
                    case 7:
                        _b = _p.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        _b = null;
                        _p.label = 9;
                    case 9:
                        targetOrg = _b;
                        if (!input.targetUserId) return [3 /*break*/, 10];
                        _c = [{ id: input.targetUserId }];
                        return [3 /*break*/, 14];
                    case 10:
                        if (!input.targetOrgId) return [3 /*break*/, 12];
                        return [4 /*yield*/, db.getUsersByOrganization(input.targetOrgId)];
                    case 11:
                        _d = (_p.sent()).filter(function (u) { return u.role === 'super_admin' || u.role === 'admin'; });
                        return [3 /*break*/, 13];
                    case 12:
                        _d = [];
                        _p.label = 13;
                    case 13:
                        _c = _d;
                        _p.label = 14;
                    case 14:
                        recipientUsers = _c;
                        priorityMap = {
                            'low': 'low',
                            'normal': 'normal',
                            'medium': 'medium',
                            'high': 'high',
                            'critical': 'critical',
                            'urgent': 'high'
                        };
                        mappedPriority = priorityMap[((_o = input.priority) === null || _o === void 0 ? void 0 : _o.toLowerCase()) || 'normal'] || 'normal';
                        return [4 /*yield*/, Promise.all(recipientUsers.map(function (u) {
                                return db.createNotification({
                                    userId: u.id,
                                    type: 'system',
                                    title: input.subject,
                                    message: input.content,
                                    category: 'tenant_message',
                                    entityType: 'tenant_message',
                                    entityId: id,
                                    priority: mappedPriority,
                                    actionUrl: (targetOrg === null || targetOrg === void 0 ? void 0 : targetOrg.slug) ? "/org/" + targetOrg.slug + "/communications" : '/communications',
                                    isRead: 0,
                                    deliveryStatus: 'sent',
                                    status: 'active'
                                });
                            }))];
                    case 15:
                        _p.sent();
                        return [2 /*return*/, { message: msg, success: true }];
                }
            });
        });
    }),
    getTenantMessages: enterpriseViewProcedure
        .input(zod_1.z.object({ limit: zod_1.z.number().optional(), offset: zod_1.z.number().optional() }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var messages;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getTenantMessages(input)];
                    case 1:
                        messages = _b.sent();
                        return [2 /*return*/, { messages: messages }];
                }
            });
        });
    }),
    markTenantMessageRead: enterpriseEditProcedure
        .input(zod_1.z.object({ messageId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.markTenantMessageRead(input.messageId)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Org Self-Management (org users managing their own org) ────
    /** Get the current user's own organization details + enabled features */
    getMyOrg: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, features, featureMap;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'No organization associated with this account' });
                        return [4 /*yield*/, db.getOrganization(ctx.user.organizationId)];
                    case 1:
                        org = _b.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getOrganizationFeatures(ctx.user.organizationId)];
                    case 2:
                        features = _b.sent();
                        featureMap = {};
                        features.forEach(function (f) { featureMap[f.featureKey] = Boolean(f.isEnabled); });
                        return [2 /*return*/, { organization: org, featureMap: featureMap }];
                }
            });
        });
    }),
    /** Update the current user's own organization (org super_admin only) */
    updateMyOrg: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        contactEmail: zod_1.z.string().email().optional(),
        contactPhone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        domain: zod_1.z.string().optional(),
        logoUrl: zod_1.z.string().optional(),
        industry: zod_1.z.string().optional(),
        website: zod_1.z.string().optional(),
        taxId: zod_1.z.string().optional(),
        billingEmail: zod_1.z.string().email().optional(),
        timezone: zod_1.z.string().optional(),
        currency: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        employeeCount: zod_1.z.number().optional(),
        registrationNumber: zod_1.z.string().optional(),
        paymentMethod: zod_1.z.string().optional(),
        // Email settings fields
        useGlobalSmtp: zod_1.z.boolean().optional(),
        smtpHost: zod_1.z.string().optional(),
        smtpPort: zod_1.z.string().optional(),
        smtpUser: zod_1.z.string().optional(),
        smtpPassword: zod_1.z.string().optional(),
        smtpFromEmail: zod_1.z.string().email().optional(),
        smtpFromName: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var useGlobalSmtp, smtpHost, smtpPort, smtpUser, smtpPassword, smtpFromEmail, smtpFromName, orgData, updated, settingsDb, settingsTable, orgIdStr, emailSettings, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'No organization associated with this account' });
                        if (ctx.user.role !== 'super_admin')
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only organization administrators can update organization settings' });
                        useGlobalSmtp = input.useGlobalSmtp, smtpHost = input.smtpHost, smtpPort = input.smtpPort, smtpUser = input.smtpUser, smtpPassword = input.smtpPassword, smtpFromEmail = input.smtpFromEmail, smtpFromName = input.smtpFromName, orgData = __rest(input, ["useGlobalSmtp", "smtpHost", "smtpPort", "smtpUser", "smtpPassword", "smtpFromEmail", "smtpFromName"]);
                        return [4 /*yield*/, db.updateOrganization(ctx.user.organizationId, orgData)];
                    case 1:
                        updated = _b.sent();
                        if (!(useGlobalSmtp === false && (smtpHost || smtpPort || smtpUser))) return [3 /*break*/, 8];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, db.getDb()];
                    case 3:
                        settingsDb = _b.sent();
                        if (!settingsDb) return [3 /*break*/, 6];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 4:
                        settingsTable = (_b.sent()).settings;
                        orgIdStr = ctx.user.organizationId;
                        emailSettings = {
                            useGlobalSmtp: false,
                            smtpHost: smtpHost || '',
                            smtpPort: smtpPort || '587',
                            smtpUser: smtpUser || '',
                            smtpPassword: smtpPassword || '',
                            smtpFromEmail: smtpFromEmail || '',
                            smtpFromName: smtpFromName || ''
                        };
                        // Update or insert settings
                        return [4 /*yield*/, settingsDb.insert(settingsTable).values({
                                id: orgIdStr + "_email_config",
                                organizationId: orgIdStr,
                                category: 'email',
                                key: 'config',
                                value: JSON.stringify(emailSettings)
                            }).onConflictDoUpdate({
                                target: settingsTable.id,
                                set: { value: JSON.stringify(emailSettings) }
                            })["catch"](function () {
                                // Fallback: just log, don't fail the update
                                console.warn('[Settings] Could not save email config');
                            })];
                    case 5:
                        // Update or insert settings
                        _b.sent();
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        err_1 = _b.sent();
                        console.error('[Settings] Email config save error:', err_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, { organization: updated, success: true }];
                }
            });
        });
    }),
    /** Test SMTP Connection */
    testSmtpConnection: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        smtpHost: zod_1.z.string().min(1),
        smtpPort: zod_1.z.string().min(1),
        smtpUser: zod_1.z.string().min(1),
        smtpPassword: zod_1.z.string().min(1),
        smtpFromEmail: zod_1.z.string().email()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var nodemailer, transporter, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'No organization associated with this account' });
                        if (ctx.user.role !== 'super_admin')
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only organization administrators can test SMTP' });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        nodemailer = require('nodemailer');
                        transporter = nodemailer.createTransport({
                            host: input.smtpHost,
                            port: parseInt(input.smtpPort, 10),
                            secure: parseInt(input.smtpPort, 10) === 465,
                            auth: {
                                user: input.smtpUser,
                                pass: input.smtpPassword
                            },
                            connectionTimeout: 5000,
                            greetingTimeout: 5000
                        });
                        // Verify connection
                        return [4 /*yield*/, transporter.verify()];
                    case 2:
                        // Verify connection
                        _b.sent();
                        // Test send (no actual email sent, just connection test)
                        return [2 /*return*/, {
                                success: true,
                                message: 'SMTP connection successful. Settings are valid.'
                            }];
                    case 3:
                        error_2 = _b.sent();
                        console.error('[SMTP Test] Failed:', error_2 === null || error_2 === void 0 ? void 0 : error_2.message);
                        return [2 /*return*/, {
                                success: false,
                                error: (error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || 'SMTP connection failed. Please check your settings.'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }),
    /** List users in the current org (org super_admin only) */
    getMyOrgUsers: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgUsers, safe;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'No organization' });
                        if (ctx.user.role !== 'super_admin')
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only organization administrators can view staff' });
                        return [4 /*yield*/, db.getUsersByOrganization(ctx.user.organizationId)];
                    case 1:
                        orgUsers = _b.sent();
                        safe = orgUsers.map(function (_a) {
                            var passwordHash = _a.passwordHash, passwordResetToken = _a.passwordResetToken, u = __rest(_a, ["passwordHash", "passwordResetToken"]);
                            return u;
                        });
                        return [2 /*return*/, { users: safe }];
                }
            });
        });
    }),
    /** Create a new user in the current org (org super_admin only) */
    inviteOrgUser: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        role: zod_1.z["enum"](['super_admin', 'admin', 'manager', 'accountant', 'hr', 'staff', 'sales_manager', 'project_manager', 'ict_manager', 'procurement_manager'])
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var _b, getUserByEmail, createUser, existing, bcrypt, salt, passwordHash, userId, newUser, safeUser;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN' });
                        if (ctx.user.role !== 'super_admin')
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only organization administrators can create staff accounts' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db-users'); })];
                    case 1:
                        _b = _c.sent(), getUserByEmail = _b.getUserByEmail, createUser = _b.createUser;
                        return [4 /*yield*/, getUserByEmail(input.email)];
                    case 2:
                        existing = _c.sent();
                        if (existing)
                            throw new server_1.TRPCError({ code: 'CONFLICT', message: 'A user with this email already exists' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('bcryptjs'); })];
                    case 3:
                        bcrypt = _c.sent();
                        return [4 /*yield*/, bcrypt.genSalt(10)];
                    case 4:
                        salt = _c.sent();
                        return [4 /*yield*/, bcrypt.hash(input.password, salt)];
                    case 5:
                        passwordHash = _c.sent();
                        userId = "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
                        return [4 /*yield*/, createUser({
                                id: userId, name: input.name, email: input.email,
                                passwordHash: passwordHash,
                                role: input.role, isActive: 1, organizationId: ctx.user.organizationId, requiresPasswordChange: 0
                            })];
                    case 6:
                        newUser = _c.sent();
                        safeUser = newUser ? { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } : null;
                        return [2 /*return*/, { user: safeUser, success: true }];
                }
            });
        });
    }),
    /** Remove a user from the current org (org super_admin only) */
    removeOrgUser: trpc_1.protectedProcedure
        .input(zod_1.z.object({ userId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgUsers, target;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN' });
                        if (ctx.user.role !== 'super_admin')
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only organization administrators can remove staff' });
                        if (input.userId === ctx.user.id)
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'You cannot remove yourself' });
                        return [4 /*yield*/, db.getUsersByOrganization(ctx.user.organizationId)];
                    case 1:
                        orgUsers = _b.sent();
                        target = orgUsers.find(function (u) { return u.id === input.userId; });
                        if (!target)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'User not found in your organization' });
                        return [4 /*yield*/, db.assignUserToOrganization(input.userId, null)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Legacy stub procedures (EnterpriseSettings page compat) ───
    createTenant: enterpriseEditProcedure
        .input(zod_1.z.object({
        organizationName: zod_1.z.string(), subdomain: zod_1.z.string(),
        plan: zod_1.z["enum"](['starter', 'professional', 'enterprise']),
        adminEmail: zod_1.z.string().email()
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var slug, existing, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        slug = input.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                        return [4 /*yield*/, db.getOrganizationBySlug(slug)];
                    case 1:
                        existing = _b.sent();
                        if (existing)
                            throw new server_1.TRPCError({ code: 'CONFLICT', message: 'Subdomain already taken' });
                        id = "org_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        return [4 /*yield*/, db.createOrganization({
                                id: id,
                                name: input.organizationName,
                                slug: slug,
                                plan: input.plan, isActive: 1,
                                maxUsers: input.plan === 'enterprise' ? 500 : input.plan === 'professional' ? 50 : 10
                            })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true, tenantId: id, organizationName: input.organizationName, subdomain: slug, plan: input.plan, status: 'active' }];
                }
            });
        });
    }),
    configureSSOProvider: enterpriseEditProcedure
        .input(zod_1.z.object({
        tenantId: zod_1.z.string(),
        provider: zod_1.z["enum"](['okta', 'azureAd', 'auth0', 'custom']),
        config: zod_1.z.object({ clientId: zod_1.z.string(), clientSecret: zod_1.z.string(), domain: zod_1.z.string() })
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, ({
                        success: true, tenantId: input.tenantId, provider: input.provider,
                        status: 'configured', ssoEnabled: true, testResult: 'connection_successful',
                        usersCount: 0,
                        ssoUrl: "https://" + input.config.domain + "/sso"
                    })];
            });
        });
    }),
    getEnterpriseApiKeys: enterpriseViewProcedure
        .input(zod_1.z.object({ tenantId: zod_1.z.string() }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, ({
                        tenantId: input.tenantId,
                        apiKeys: [{ id: 'key_001', name: 'Production API Key', key: 'pk_live_••••', createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19), lastUsed: new Date().toISOString().replace('T', ' ').substring(0, 19), rateLimit: 10000, requestsToday: 0, status: 'active' }],
                        total: 1
                    })];
            });
        });
    }),
    configureWhiteLabelOptions: enterpriseEditProcedure
        .input(zod_1.z.object({
        tenantId: zod_1.z.string(),
        branding: zod_1.z.object({ logo: zod_1.z.string().optional(), colors: zod_1.z.object({ primary: zod_1.z.string(), secondary: zod_1.z.string() }), customDomain: zod_1.z.string().optional() })
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, currentSettings, updatedSettings;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, db.getOrganization(input.tenantId)];
                    case 1:
                        org = _c.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        currentSettings = org.settings || {};
                        updatedSettings = __assign(__assign({}, currentSettings), { whiteLabel: {
                                logo: input.branding.logo || ((_b = currentSettings === null || currentSettings === void 0 ? void 0 : currentSettings.whiteLabel) === null || _b === void 0 ? void 0 : _b.logo) || null,
                                primaryColor: input.branding.colors.primary,
                                secondaryColor: input.branding.colors.secondary,
                                customDomain: input.branding.customDomain || null,
                                configuredAt: new Date().toISOString()
                            } });
                        return [4 /*yield*/, db.updateOrganization(input.tenantId, {
                                settings: updatedSettings,
                                domain: input.branding.customDomain || org.domain
                            })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, {
                                success: true, tenantId: input.tenantId,
                                whiteLabel: {
                                    status: 'configured',
                                    customDomain: input.branding.customDomain || 'Not configured',
                                    primaryColor: input.branding.colors.primary,
                                    logoDeployed: !!input.branding.logo
                                }
                            }];
                }
            });
        });
    }),
    getWhiteLabelConfig: enterpriseViewProcedure
        .input(zod_1.z.object({ tenantId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, settings;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getOrganization(input.tenantId)];
                    case 1:
                        org = _b.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        settings = org.settings || {};
                        return [2 /*return*/, {
                                whiteLabel: settings.whiteLabel || null,
                                domain: org.domain,
                                logoUrl: org.logoUrl
                            }];
                }
            });
        });
    }),
    getEnterpriseBillingInfo: enterpriseViewProcedure
        .input(zod_1.z.object({ tenantId: zod_1.z.string() }).strict())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, orgUsers;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getOrganization(input.tenantId)];
                    case 1:
                        org = _b.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        return [4 /*yield*/, db.getUsersByOrganization(input.tenantId)];
                    case 2:
                        orgUsers = _b.sent();
                        return [2 /*return*/, {
                                tenantId: input.tenantId,
                                billing: {
                                    currentPlan: org.plan || 'trial',
                                    status: org.isActive ? 'active' : 'inactive',
                                    users: { active: orgUsers.length, limit: org.maxUsers || 10 }
                                }
                            }];
                }
            });
        });
    }),
    manageTenantRoleHierarchy: enterpriseEditProcedure
        .input(zod_1.z.object({
        tenantId: zod_1.z.string(),
        roles: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string(), parentRole: zod_1.z.string().optional(), permissions: zod_1.z.array(zod_1.z.string()) }))
    }).strict())
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, ({
                        success: true, tenantId: input.tenantId, roleCount: input.roles.length,
                        hierarchy: { admin: { level: 1, childRoles: ['manager'] }, manager: { level: 2, childRoles: ['operator'] }, operator: { level: 3, childRoles: [] } }
                    })];
            });
        });
    }),
    getModuleList: enterpriseViewProcedure
        .query(function () { return ({
        modules: exports.ORG_MODULES
    }); }),
    // ── Org Payment Methods ───────────────────────────────────────────────────
    /** Save / replace all payment methods for the current org */
    saveOrgPaymentMethods: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        paymentMethods: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            type: zod_1.z["enum"](['mpesa', 'card', 'bank', 'cheque']),
            isDefault: zod_1.z.boolean(),
            nickname: zod_1.z.string().optional(),
            createdAt: zod_1.z.string(),
            mpesa: zod_1.z.object({ phoneNumber: zod_1.z.string(), accountName: zod_1.z.string() }).optional(),
            card: zod_1.z.object({
                cardholderName: zod_1.z.string(),
                last4: zod_1.z.string().max(4),
                brand: zod_1.z.string(),
                expiryMonth: zod_1.z.string(),
                expiryYear: zod_1.z.string(),
                autopayEnabled: zod_1.z.boolean()
            }).optional(),
            bank: zod_1.z.object({
                bankName: zod_1.z.string(),
                accountName: zod_1.z.string(),
                accountNumber: zod_1.z.string(),
                branchCode: zod_1.z.string().optional(),
                swiftCode: zod_1.z.string().optional()
            }).optional(),
            cheque: zod_1.z.object({
                payableTo: zod_1.z.string(),
                deliveryAddress: zod_1.z.string().optional()
            }).optional()
        }))
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, currentSettings, updatedSettings;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'No organization associated with this account' });
                        if (ctx.user.role !== 'super_admin' && ctx.user.role !== 'admin')
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only organization administrators can manage payment methods' });
                        return [4 /*yield*/, db.getOrganization(ctx.user.organizationId)];
                    case 1:
                        org = _b.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        currentSettings = org.settings || {};
                        updatedSettings = __assign(__assign({}, currentSettings), { paymentMethods: input.paymentMethods });
                        return [4 /*yield*/, db.updateOrganization(ctx.user.organizationId, { settings: updatedSettings })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Org Branding (colors) ─────────────────────────────────────────────────
    /** Update org branding colors in addition to standard profile fields */
    updateOrgBranding: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        primaryColor: zod_1.z.string().optional(),
        secondaryColor: zod_1.z.string().optional(),
        logoUrl: zod_1.z.string().optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var org, currentSettings, branding, updatePayload, updated;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN' });
                        if (ctx.user.role !== 'super_admin')
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only organization administrators can update branding' });
                        return [4 /*yield*/, db.getOrganization(ctx.user.organizationId)];
                    case 1:
                        org = _b.sent();
                        if (!org)
                            throw new server_1.TRPCError({ code: 'NOT_FOUND' });
                        currentSettings = org.settings || {};
                        branding = currentSettings.branding || {};
                        if (input.primaryColor !== undefined)
                            branding.primaryColor = input.primaryColor;
                        if (input.secondaryColor !== undefined)
                            branding.secondaryColor = input.secondaryColor;
                        updatePayload = { settings: __assign(__assign({}, currentSettings), { branding: branding }) };
                        if (input.logoUrl !== undefined)
                            updatePayload.logoUrl = input.logoUrl;
                        return [4 /*yield*/, db.updateOrganization(ctx.user.organizationId, updatePayload)];
                    case 2:
                        updated = _b.sent();
                        return [2 /*return*/, { organization: updated, success: true }];
                }
            });
        });
    }),
    // ── Global Plan Pricing (Kiini super admin) ────────────────────────────
    /** Get pricing for all plans; seeded DB plans are merged with platform settings defaults. */
    getPlanPrices: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_, dbPlans, pricesFromDb, row, savedPrices, mergedPrices;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                    case 1:
                        db_ = _b.sent();
                        return [4 /*yield*/, db_.getAvailablePlans()];
                    case 2:
                        dbPlans = _b.sent();
                        pricesFromDb = {};
                        dbPlans.forEach(function (plan) {
                            var _a;
                            var features = plan.features || {};
                            pricesFromDb[plan.planSlug] = {
                                monthlyKes: Number(plan.monthlyPrice || 0),
                                annualKes: Number(plan.annualPrice || 0),
                                maxUsers: Number((_a = plan.maxUsers) !== null && _a !== void 0 ? _a : 0),
                                description: plan.description || '',
                                label: plan.planName || plan.planSlug,
                                supportLevel: plan.supportLevel || 'email',
                                features: features
                            };
                        });
                        return [4 /*yield*/, db_.getSetting('plan_prices')];
                    case 3:
                        row = _b.sent();
                        savedPrices = row ? (typeof row.value === 'string' ? JSON.parse(row.value) : row.value) : {};
                        mergedPrices = __assign({}, pricesFromDb);
                        Object.entries(savedPrices).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            mergedPrices[key] = __assign(__assign({}, (mergedPrices[key] || {})), value);
                        });
                        if (Object.keys(mergedPrices).length === 0) {
                            return [2 /*return*/, {
                                    prices: {
                                        trial: { monthlyKes: 0, annualKes: 0, maxUsers: 5, description: '14-day evaluation' },
                                        starter: { monthlyKes: 5999, annualKes: 57590, maxUsers: 10, description: 'Core business tools' },
                                        professional: { monthlyKes: 18999, annualKes: 182390, maxUsers: 50, description: 'Full operations suite' },
                                        enterprise: { monthlyKes: 49999, annualKes: 479990, maxUsers: 500, description: 'All modules + priority support' },
                                        custom: { monthlyKes: 0, annualKes: 0, maxUsers: 0, description: 'Custom pricing — contact sales' }
                                    }
                                }];
                        }
                        return [2 /*return*/, { prices: mergedPrices }];
                }
            });
        });
    }),
    /** Get tier defaults (maxUsers, features) for frontend auto-population */
    getTierDefaults: trpc_1.protectedProcedure
        .query(function () {
        return {
            tierMaxUsers: TIER_MAX_USERS,
            tierFeatures: exports.TIER_DEFAULT_FEATURES
        };
    }),
    /** Save pricing for all plans (Kiini super admin only) */
    savePlanPrices: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        prices: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
            monthlyKes: zod_1.z.number().min(0),
            annualKes: zod_1.z.number().min(0),
            maxUsers: zod_1.z.number().min(0),
            description: zod_1.z.string()
        }))
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var db_;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only Kiini platform admins can manage plan pricing' });
                        if (ctx.user.role !== 'super_admin')
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only super admins can manage plan pricing' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                    case 1:
                        db_ = _b.sent();
                        return [4 /*yield*/, db_.setSetting('plan_prices', JSON.stringify(input.prices), 'platform')];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /** Create a new custom pricing tier (Kiini super admin only) */
    createPricingTier: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        key: zod_1.z.string().min(2).regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers and underscores only'),
        label: zod_1.z.string().min(2),
        description: zod_1.z.string(),
        monthlyKes: zod_1.z.number().min(0),
        annualKes: zod_1.z.number().min(0),
        maxUsers: zod_1.z.number().min(1),
        features: zod_1.z.record(zod_1.z.string(), zod_1.z.boolean())
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var dbInst, _i, _b, _c, featureKey, isEnabled, priceRow, currentPrices;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only Kiini platform admins can create pricing tiers' });
                        if (ctx.user.role !== 'super_admin')
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only super admins can create pricing tiers' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                    case 1:
                        dbInst = _d.sent();
                        _i = 0, _b = Object.entries(input.features);
                        _d.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 5];
                        _c = _b[_i], featureKey = _c[0], isEnabled = _c[1];
                        return [4 /*yield*/, dbInst.setPricingTierFeature(input.key, featureKey, isEnabled)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, dbInst.getSetting('plan_prices')];
                    case 6:
                        priceRow = _d.sent();
                        currentPrices = priceRow
                            ? (typeof priceRow.value === 'string' ? JSON.parse(priceRow.value) : priceRow.value)
                            : {};
                        currentPrices[input.key] = {
                            monthlyKes: input.monthlyKes,
                            annualKes: input.annualKes,
                            maxUsers: input.maxUsers,
                            description: input.description,
                            label: input.label
                        };
                        return [4 /*yield*/, dbInst.setSetting('plan_prices', JSON.stringify(currentPrices), 'platform')];
                    case 7:
                        _d.sent();
                        return [2 /*return*/, { success: true, tierKey: input.key }];
                }
            });
        });
    }),
    /** Update an existing pricing tier (Kiini super admin only) */
    updatePricingTier: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        key: zod_1.z.string().min(2),
        label: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().optional(),
        monthlyKes: zod_1.z.number().min(0).optional(),
        annualKes: zod_1.z.number().min(0).optional(),
        maxUsers: zod_1.z.number().min(0).optional(),
        features: zod_1.z.record(zod_1.z.string(), zod_1.z.boolean()).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var dbInst, _i, _b, _c, featureKey, isEnabled, priceRow, currentPrices, existing;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only Kiini platform admins can update pricing tiers' });
                        if (ctx.user.role !== 'super_admin')
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only super admins can update pricing tiers' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                    case 1:
                        dbInst = _d.sent();
                        if (!input.features) return [3 /*break*/, 5];
                        _i = 0, _b = Object.entries(input.features);
                        _d.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 5];
                        _c = _b[_i], featureKey = _c[0], isEnabled = _c[1];
                        return [4 /*yield*/, dbInst.setPricingTierFeature(input.key, featureKey, isEnabled)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, dbInst.getSetting('plan_prices')];
                    case 6:
                        priceRow = _d.sent();
                        currentPrices = priceRow
                            ? (typeof priceRow.value === 'string' ? JSON.parse(priceRow.value) : priceRow.value)
                            : {};
                        existing = currentPrices[input.key] || {};
                        currentPrices[input.key] = __assign(__assign(__assign(__assign(__assign(__assign({}, existing), (input.label !== undefined && { label: input.label })), (input.description !== undefined && { description: input.description })), (input.monthlyKes !== undefined && { monthlyKes: input.monthlyKes })), (input.annualKes !== undefined && { annualKes: input.annualKes })), (input.maxUsers !== undefined && { maxUsers: input.maxUsers }));
                        return [4 /*yield*/, dbInst.setSetting('plan_prices', JSON.stringify(currentPrices), 'platform')];
                    case 7:
                        _d.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    /** Delete a pricing tier (Kiini super admin only) */
    deletePricingTier: trpc_1.protectedProcedure
        .input(zod_1.z.object({ key: zod_1.z.string().min(1) }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var dbInst, priceRow, currentPrices, getDb, drizzleDb, pricingTierFeatures, eq;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only Kiini platform admins can delete pricing tiers' });
                        if (ctx.user.role !== 'super_admin')
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Only super admins can delete pricing tiers' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                    case 1:
                        dbInst = _b.sent();
                        return [4 /*yield*/, dbInst.getSetting('plan_prices')];
                    case 2:
                        priceRow = _b.sent();
                        currentPrices = priceRow
                            ? (typeof priceRow.value === 'string' ? JSON.parse(priceRow.value) : priceRow.value)
                            : {};
                        if (!currentPrices[input.key]) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: "Pricing tier \"" + input.key + "\" not found" });
                        }
                        delete currentPrices[input.key];
                        return [4 /*yield*/, dbInst.setSetting('plan_prices', JSON.stringify(currentPrices), 'platform')];
                    case 3:
                        _b.sent();
                        getDb = dbInst.getDb;
                        return [4 /*yield*/, getDb()];
                    case 4:
                        drizzleDb = _b.sent();
                        if (!drizzleDb) return [3 /*break*/, 8];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 5:
                        pricingTierFeatures = (_b.sent()).pricingTierFeatures;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 6:
                        eq = (_b.sent()).eq;
                        return [4 /*yield*/, drizzleDb["delete"](pricingTierFeatures).where(eq(pricingTierFeatures.tier, input.key))];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    // ── Org Analytics ───────────────────────────────────────────────
    /**
     * Comprehensive analytics for the org dashboard and module pages.
     * Returns counts, totals, month-over-month trend data, and breakdowns
     * needed to power all org page charts and KPIs.
     */
    getOrgAnalytics: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, getDb, drizzleDb, _b, invoicesTable, clientsTable, expensesTable, employeesTable, paymentsTable, _c, desc, gte, sql, eq, now, sixMonthsAgo, sixMonthsAgoStr, orgId, _d, allInvoices, allClients, allExpenses, allEmployees, allPayments, invoicesByStatus, totalInvoiced, totalPaid, totalOutstanding, approvedExpenses, totalExpenses, expenseByCategory, expenseCategoryChart, totalPaymentsReceived, activeEmployees, deptBreakdown, employeeDeptChart, activeClients, monthLabels, i, d, revenueByMonth, invoicesByMonth, expensesByMonth, monthlyTrend, invoiceStatusChart, recentInvoices, recentExpenses;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'No organization associated with this account' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                    case 1:
                        database = _e.sent();
                        getDb = database.getDb;
                        return [4 /*yield*/, getDb()];
                    case 2:
                        drizzleDb = _e.sent();
                        if (!drizzleDb)
                            return [2 /*return*/, buildEmptyAnalytics()];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        _b = _e.sent(), invoicesTable = _b.invoices, clientsTable = _b.clients, expensesTable = _b.expenses, employeesTable = _b.employees, paymentsTable = _b.payments;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 4:
                        _c = _e.sent(), desc = _c.desc, gte = _c.gte, sql = _c.sql, eq = _c.eq;
                        now = new Date();
                        sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                        sixMonthsAgoStr = sixMonthsAgo.toISOString().slice(0, 10);
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, Promise.all([
                                drizzleDb.select().from(invoicesTable).where(eq(invoicesTable.organizationId, orgId)).limit(5000),
                                drizzleDb.select().from(clientsTable).where(eq(clientsTable.organizationId, orgId)).limit(5000),
                                drizzleDb.select().from(expensesTable).where(eq(expensesTable.organizationId, orgId)).limit(5000),
                                drizzleDb.select().from(employeesTable).where(eq(employeesTable.organizationId, orgId)).limit(5000),
                                drizzleDb.select().from(paymentsTable).limit(5000),
                            ])];
                    case 5:
                        _d = _e.sent(), allInvoices = _d[0], allClients = _d[1], allExpenses = _d[2], allEmployees = _d[3], allPayments = _d[4];
                        invoicesByStatus = allInvoices.reduce(function (acc, inv) {
                            acc[inv.status] = (acc[inv.status] || 0) + 1;
                            return acc;
                        }, {});
                        totalInvoiced = allInvoices.reduce(function (s, i) { return s + (i.total || 0); }, 0);
                        totalPaid = allInvoices.reduce(function (s, i) { return s + (i.paidAmount || 0); }, 0);
                        totalOutstanding = totalInvoiced - totalPaid;
                        approvedExpenses = allExpenses.filter(function (e) { return e.status === 'approved' || e.status === 'paid'; });
                        totalExpenses = approvedExpenses.reduce(function (s, e) { return s + (e.amount || 0); }, 0);
                        expenseByCategory = allExpenses.reduce(function (acc, e) {
                            var cat = e.category || 'Other';
                            acc[cat] = (acc[cat] || 0) + (e.amount || 0);
                            return acc;
                        }, {});
                        expenseCategoryChart = Object.entries(expenseByCategory)
                            .map(function (_a) {
                            var name = _a[0], value = _a[1];
                            return ({ name: name, value: value });
                        })
                            .sort(function (a, b) { return b.value - a.value; })
                            .slice(0, 8);
                        totalPaymentsReceived = allPayments.reduce(function (s, p) { return s + (p.amount || 0); }, 0);
                        activeEmployees = allEmployees.filter(function (e) { return e.status === 'active'; }).length;
                        deptBreakdown = allEmployees.reduce(function (acc, e) {
                            var dept = e.department || 'Unassigned';
                            acc[dept] = (acc[dept] || 0) + 1;
                            return acc;
                        }, {});
                        employeeDeptChart = Object.entries(deptBreakdown)
                            .map(function (_a) {
                            var name = _a[0], value = _a[1];
                            return ({ name: name, value: value });
                        })
                            .sort(function (a, b) { return b.value - a.value; })
                            .slice(0, 10);
                        activeClients = allClients.filter(function (c) { return c.status === 'active'; }).length;
                        monthLabels = [];
                        for (i = 5; i >= 0; i--) {
                            d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                            monthLabels.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0'));
                        }
                        revenueByMonth = {};
                        invoicesByMonth = {};
                        expensesByMonth = {};
                        monthLabels.forEach(function (m) { revenueByMonth[m] = 0; invoicesByMonth[m] = 0; expensesByMonth[m] = 0; });
                        allPayments.forEach(function (p) {
                            if (!p.paymentDate)
                                return;
                            var month = String(p.paymentDate).slice(0, 7);
                            if (month in revenueByMonth)
                                revenueByMonth[month] = (revenueByMonth[month] || 0) + (p.amount || 0);
                        });
                        allInvoices.forEach(function (inv) {
                            if (!inv.issueDate)
                                return;
                            var month = String(inv.issueDate).slice(0, 7);
                            if (month in invoicesByMonth)
                                invoicesByMonth[month] = (invoicesByMonth[month] || 0) + 1;
                        });
                        allExpenses.forEach(function (exp) {
                            if (!exp.expenseDate)
                                return;
                            var month = String(exp.expenseDate).slice(0, 7);
                            if (month in expensesByMonth)
                                expensesByMonth[month] = (expensesByMonth[month] || 0) + (exp.amount || 0);
                        });
                        monthlyTrend = monthLabels.map(function (month) { return ({
                            month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
                            revenue: revenueByMonth[month] || 0,
                            invoices: invoicesByMonth[month] || 0,
                            expenses: expensesByMonth[month] || 0
                        }); });
                        invoiceStatusChart = [
                            { name: 'Paid', value: invoicesByStatus['paid'] || 0, color: '#22c55e' },
                            { name: 'Sent', value: invoicesByStatus['sent'] || 0, color: '#3b82f6' },
                            { name: 'Draft', value: invoicesByStatus['draft'] || 0, color: '#6b7280' },
                            { name: 'Overdue', value: invoicesByStatus['overdue'] || 0, color: '#ef4444' },
                            { name: 'Partial', value: invoicesByStatus['partial'] || 0, color: '#f59e0b' },
                        ].filter(function (d) { return d.value > 0; });
                        recentInvoices = allInvoices
                            .sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); })
                            .slice(0, 5)
                            .map(function (inv) { return ({
                            id: inv.id,
                            invoiceNumber: inv.invoiceNumber,
                            status: inv.status,
                            total: inv.total,
                            paidAmount: inv.paidAmount,
                            dueDate: inv.dueDate,
                            issueDate: inv.issueDate
                        }); });
                        recentExpenses = allExpenses
                            .sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); })
                            .slice(0, 5)
                            .map(function (exp) { return ({
                            id: exp.id,
                            expenseNumber: exp.expenseNumber,
                            category: exp.category,
                            amount: exp.amount,
                            status: exp.status,
                            expenseDate: exp.expenseDate
                        }); });
                        return [2 /*return*/, {
                                kpis: {
                                    totalInvoices: allInvoices.length,
                                    totalInvoiced: totalInvoiced,
                                    totalPaid: totalPaid,
                                    totalOutstanding: totalOutstanding,
                                    totalPaymentsReceived: totalPaymentsReceived,
                                    totalExpenses: totalExpenses,
                                    totalClients: allClients.length,
                                    activeClients: activeClients,
                                    totalEmployees: allEmployees.length,
                                    activeEmployees: activeEmployees,
                                    pendingExpenses: allExpenses.filter(function (e) { return e.status === 'pending'; }).length
                                },
                                invoicesByStatus: invoicesByStatus,
                                invoiceStatusChart: invoiceStatusChart,
                                expenseCategoryChart: expenseCategoryChart,
                                employeeDeptChart: employeeDeptChart,
                                monthlyTrend: monthlyTrend,
                                recentInvoices: recentInvoices,
                                recentExpenses: recentExpenses
                            }];
                }
            });
        });
    }),
    // ── Org Calendar Events ─────────────────────────────────────────
    /**
     * Returns calendar events for a given month aggregated from
     * invoices (due dates), projects (end dates), and project tasks (due dates).
     */
    getCalendarEvents: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        year: zod_1.z.number().int().min(2000).max(2100),
        month: zod_1.z.number().int().min(1).max(12)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, getDb, drizzleDb, _b, invoicesTable, projectsTable, projectTasksTable, _c, eq, and, gte, lte, inArray, orgId, padded, startOfMonth, lastDay, endOfMonth, _d, orgInvoices, allOrgProjects, projectsDueThisMonth, allProjectIds, orgTasksDue, events, _i, orgInvoices_1, inv, _e, projectsDueThisMonth_1, proj, _f, orgTasksDue_1, task;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'No organization' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                    case 1:
                        database = _g.sent();
                        getDb = database.getDb;
                        return [4 /*yield*/, getDb()];
                    case 2:
                        drizzleDb = _g.sent();
                        if (!drizzleDb)
                            return [2 /*return*/, { events: [] }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        _b = _g.sent(), invoicesTable = _b.invoices, projectsTable = _b.projects, projectTasksTable = _b.projectTasks;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 4:
                        _c = _g.sent(), eq = _c.eq, and = _c.and, gte = _c.gte, lte = _c.lte, inArray = _c.inArray;
                        orgId = ctx.user.organizationId;
                        padded = function (n) { return String(n).padStart(2, '0'); };
                        startOfMonth = input.year + "-" + padded(input.month) + "-01 00:00:00";
                        lastDay = new Date(input.year, input.month, 0).getDate();
                        endOfMonth = input.year + "-" + padded(input.month) + "-" + padded(lastDay) + " 23:59:59";
                        return [4 /*yield*/, Promise.all([
                                drizzleDb.select().from(invoicesTable).where(and(eq(invoicesTable.organizationId, orgId), gte(invoicesTable.dueDate, startOfMonth), lte(invoicesTable.dueDate, endOfMonth))).limit(200),
                                drizzleDb.select().from(projectsTable).where(eq(projectsTable.organizationId, orgId)).limit(500),
                            ])];
                    case 5:
                        _d = _g.sent(), orgInvoices = _d[0], allOrgProjects = _d[1];
                        projectsDueThisMonth = allOrgProjects.filter(function (p) {
                            if (!p.endDate)
                                return false;
                            var d = String(p.endDate).slice(0, 10);
                            return d >= startOfMonth.slice(0, 10) && d <= endOfMonth.slice(0, 10);
                        });
                        allProjectIds = allOrgProjects.map(function (p) { return p.id; });
                        orgTasksDue = [];
                        if (!(allProjectIds.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, drizzleDb.select().from(projectTasksTable).where(and(inArray(projectTasksTable.projectId, allProjectIds), gte(projectTasksTable.dueDate, startOfMonth), lte(projectTasksTable.dueDate, endOfMonth))).limit(500)];
                    case 6:
                        orgTasksDue = _g.sent();
                        _g.label = 7;
                    case 7:
                        events = [];
                        for (_i = 0, orgInvoices_1 = orgInvoices; _i < orgInvoices_1.length; _i++) {
                            inv = orgInvoices_1[_i];
                            events.push({
                                id: "inv_" + inv.id,
                                type: 'invoice',
                                title: "Invoice " + inv.invoiceNumber + " due",
                                date: String(inv.dueDate).slice(0, 10),
                                status: inv.status,
                                href: "/org/" + ctx.user.organizationId + "/invoices/" + inv.id,
                                color: inv.status === 'paid' ? '#22c55e' : inv.status === 'overdue' ? '#ef4444' : '#3b82f6'
                            });
                        }
                        for (_e = 0, projectsDueThisMonth_1 = projectsDueThisMonth; _e < projectsDueThisMonth_1.length; _e++) {
                            proj = projectsDueThisMonth_1[_e];
                            events.push({
                                id: "proj_" + proj.id,
                                type: 'project',
                                title: proj.name + " deadline",
                                date: String(proj.endDate).slice(0, 10),
                                status: proj.status,
                                href: "/org/" + ctx.user.organizationId + "/projects/" + proj.id,
                                color: proj.status === 'completed' ? '#22c55e' : proj.status === 'on_hold' ? '#f59e0b' : '#a855f7'
                            });
                        }
                        for (_f = 0, orgTasksDue_1 = orgTasksDue; _f < orgTasksDue_1.length; _f++) {
                            task = orgTasksDue_1[_f];
                            if (!task.dueDate)
                                continue;
                            events.push({
                                id: "task_" + task.id,
                                type: 'task',
                                title: task.title,
                                date: String(task.dueDate).slice(0, 10),
                                status: task.status,
                                href: "/org/" + ctx.user.organizationId + "/projects/" + task.projectId,
                                color: task.status === 'completed' ? '#22c55e' : task.priority === 'urgent' ? '#ef4444' : '#f97316'
                            });
                        }
                        return [2 /*return*/, { events: events }];
                }
            });
        });
    }),
    // ── Org Activity Timeline ────────────────────────────────────────
    /**
     * Returns recent activity log entries scoped to the current org.
     * Joins via users.organizationId since activityLog has no org FK.
     */
    getOrgActivity: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().int().min(1).max(200)["default"](50),
        entityType: zod_1.z.string().optional()
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, getDb, drizzleDb, activityLogTable, getUsersByOrganization, orgUsers, orgUserIds, _b, inArray, eq, and, desc, whereClause, rows, userMap, activities;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'No organization' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                    case 1:
                        database = _c.sent();
                        getDb = database.getDb;
                        return [4 /*yield*/, getDb()];
                    case 2:
                        drizzleDb = _c.sent();
                        if (!drizzleDb)
                            return [2 /*return*/, { activities: [] }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        activityLogTable = (_c.sent()).activityLog;
                        getUsersByOrganization = database.getUsersByOrganization;
                        return [4 /*yield*/, getUsersByOrganization(ctx.user.organizationId)];
                    case 4:
                        orgUsers = _c.sent();
                        orgUserIds = orgUsers.map(function (u) { return u.id; });
                        if (orgUserIds.length === 0)
                            return [2 /*return*/, { activities: [] }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 5:
                        _b = _c.sent(), inArray = _b.inArray, eq = _b.eq, and = _b.and, desc = _b.desc;
                        whereClause = input.entityType
                            ? and(inArray(activityLogTable.userId, orgUserIds), eq(activityLogTable.entityType, input.entityType))
                            : inArray(activityLogTable.userId, orgUserIds);
                        return [4 /*yield*/, drizzleDb
                                .select()
                                .from(activityLogTable)
                                .where(whereClause)
                                .orderBy(desc(activityLogTable.createdAt))
                                .limit(input.limit)];
                    case 6:
                        rows = _c.sent();
                        userMap = {};
                        orgUsers.forEach(function (u) { userMap[u.id] = u.name || u.email || 'Unknown'; });
                        activities = rows.map(function (row) { return ({
                            id: row.id,
                            userId: row.userId,
                            userName: userMap[row.userId] || 'Unknown',
                            action: row.action,
                            entityType: row.entityType,
                            entityId: row.entityId,
                            description: row.description,
                            createdAt: row.createdAt
                        }); });
                        return [2 /*return*/, { activities: activities }];
                }
            });
        });
    }),
    // ── Org Approvals ────────────────────────────────────────────────
    /**
     * Returns all approvable items scoped to the caller's organization.
     * Covers invoices, expenses, payments, leave requests, and purchase orders.
     */
    getOrgApprovals: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        type: zod_1.z["enum"](["all", "invoice", "expense", "payment", "leave_request", "purchase_order"]).optional(),
        status: zod_1.z["enum"](["pending", "approved", "rejected"]).optional()
    }).optional())
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            // Fetch a user name helper
            function getUserName(userId) {
                var _a, _b;
                return __awaiter(this, void 0, Promise, function () {
                    var row;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (!userId)
                                    return [2 /*return*/, 'Unknown'];
                                return [4 /*yield*/, drizzleDb.select({ name: schema.users.name, email: schema.users.email })
                                        .from(schema.users).where(eq(schema.users.id, userId)).limit(1)];
                            case 1:
                                row = _c.sent();
                                return [2 /*return*/, ((_a = row[0]) === null || _a === void 0 ? void 0 : _a.name) || ((_b = row[0]) === null || _b === void 0 ? void 0 : _b.email) || 'Unknown'];
                        }
                    });
                });
            }
            var getDb, drizzleDb, schema, _b, eq, and, orgId, approvals, rows, _i, rows_1, inv, s, _c, _d, _e, _f, _g, rows, _h, rows_2, exp, s, _j, _k, _l, _m, _o, rows, _p, rows_3, pay, s, _q, _r, _s, _t, rows, _u, rows_4, lr, s, _v, _w, _x, _y, _z;
            return __generator(this, function (_0) {
                switch (_0.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            return [2 /*return*/, { approvals: [] }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                    case 1:
                        getDb = (_0.sent()).getDb;
                        return [4 /*yield*/, getDb()];
                    case 2:
                        drizzleDb = _0.sent();
                        if (!drizzleDb)
                            return [2 /*return*/, { approvals: [] }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        schema = _0.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 4:
                        _b = _0.sent(), eq = _b.eq, and = _b.and;
                        orgId = ctx.user.organizationId;
                        approvals = [];
                        _0.label = 5;
                    case 5:
                        _0.trys.push([5, 14, , 15]);
                        return [4 /*yield*/, drizzleDb.select().from(schema.invoices)
                                .where(eq(schema.invoices.organizationId, orgId)).limit(500)];
                    case 6:
                        rows = _0.sent();
                        _i = 0, rows_1 = rows;
                        _0.label = 7;
                    case 7:
                        if (!(_i < rows_1.length)) return [3 /*break*/, 13];
                        inv = rows_1[_i];
                        s = inv.status === 'draft' ? 'pending' : inv.status === 'sent' ? 'approved' : inv.status === 'rejected' ? 'rejected' : inv.status === 'paid' ? 'approved' : null;
                        if (!s)
                            return [3 /*break*/, 12];
                        _d = (_c = approvals).push;
                        _e = {
                            id: inv.id,
                            type: 'invoice',
                            referenceId: inv.id,
                            referenceNo: inv.invoiceNumber || "INV-" + inv.id.slice(0, 8),
                            amount: inv.total ? Number(inv.total) / 100 : 0
                        };
                        return [4 /*yield*/, getUserName(inv.createdBy)];
                    case 8:
                        _e.requestedBy = _0.sent(),
                            _e.requestedAt = inv.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19);
                        if (!inv.approvedBy) return [3 /*break*/, 10];
                        return [4 /*yield*/, getUserName(inv.approvedBy)];
                    case 9:
                        _f = _0.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        _f = null;
                        _0.label = 11;
                    case 11:
                        _d.apply(_c, [(_e.approvedBy = _f,
                                _e.approvedAt = inv.approvedAt || null,
                                _e.status = s,
                                _e.description = "Invoice for KES " + (inv.total ? Number(inv.total) / 100 : 0),
                                _e)]);
                        _0.label = 12;
                    case 12:
                        _i++;
                        return [3 /*break*/, 7];
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        _g = _0.sent();
                        return [3 /*break*/, 15];
                    case 15:
                        _0.trys.push([15, 24, , 25]);
                        return [4 /*yield*/, drizzleDb.select().from(schema.expenses)
                                .where(eq(schema.expenses.organizationId, orgId)).limit(500)];
                    case 16:
                        rows = _0.sent();
                        _h = 0, rows_2 = rows;
                        _0.label = 17;
                    case 17:
                        if (!(_h < rows_2.length)) return [3 /*break*/, 23];
                        exp = rows_2[_h];
                        s = exp.status === 'pending' ? 'pending' : exp.status === 'approved' ? 'approved' : exp.status === 'rejected' ? 'rejected' : null;
                        if (!s)
                            return [3 /*break*/, 22];
                        _k = (_j = approvals).push;
                        _l = {
                            id: exp.id,
                            type: 'expense',
                            referenceId: exp.id,
                            referenceNo: exp.expenseNumber || "EXP-" + exp.id.slice(0, 8),
                            amount: exp.amount ? Number(exp.amount) / 100 : 0
                        };
                        return [4 /*yield*/, getUserName(exp.createdBy)];
                    case 18:
                        _l.requestedBy = _0.sent(),
                            _l.requestedAt = exp.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19);
                        if (!exp.approvedBy) return [3 /*break*/, 20];
                        return [4 /*yield*/, getUserName(exp.approvedBy)];
                    case 19:
                        _m = _0.sent();
                        return [3 /*break*/, 21];
                    case 20:
                        _m = null;
                        _0.label = 21;
                    case 21:
                        _k.apply(_j, [(_l.approvedBy = _m,
                                _l.approvedAt = exp.approvedAt || null,
                                _l.status = s,
                                _l.description = exp.description || exp.category || 'Expense',
                                _l)]);
                        _0.label = 22;
                    case 22:
                        _h++;
                        return [3 /*break*/, 17];
                    case 23: return [3 /*break*/, 25];
                    case 24:
                        _o = _0.sent();
                        return [3 /*break*/, 25];
                    case 25:
                        _0.trys.push([25, 31, , 32]);
                        return [4 /*yield*/, drizzleDb.select().from(schema.payments)
                                .where(eq(schema.payments.organizationId, orgId)).limit(500)];
                    case 26:
                        rows = _0.sent();
                        _p = 0, rows_3 = rows;
                        _0.label = 27;
                    case 27:
                        if (!(_p < rows_3.length)) return [3 /*break*/, 30];
                        pay = rows_3[_p];
                        s = pay.status === 'pending' ? 'pending' : pay.status === 'approved' ? 'approved' : pay.status === 'rejected' ? 'rejected' : pay.status === 'completed' ? 'approved' : null;
                        if (!s)
                            return [3 /*break*/, 29];
                        _r = (_q = approvals).push;
                        _s = {
                            id: pay.id,
                            type: 'payment',
                            referenceId: pay.id,
                            referenceNo: pay.paymentNumber || "PAY-" + pay.id.slice(0, 8),
                            amount: pay.amount ? Number(pay.amount) / 100 : 0
                        };
                        return [4 /*yield*/, getUserName(pay.createdBy)];
                    case 28:
                        _r.apply(_q, [(_s.requestedBy = _0.sent(),
                                _s.requestedAt = pay.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
                                _s.approvedBy = null,
                                _s.approvedAt = null,
                                _s.status = s,
                                _s.description = pay.description || "Payment",
                                _s)]);
                        _0.label = 29;
                    case 29:
                        _p++;
                        return [3 /*break*/, 27];
                    case 30: return [3 /*break*/, 32];
                    case 31:
                        _t = _0.sent();
                        return [3 /*break*/, 32];
                    case 32:
                        _0.trys.push([32, 41, , 42]);
                        return [4 /*yield*/, drizzleDb.select().from(schema.leaveRequests)
                                .where(eq(schema.leaveRequests.organizationId, orgId)).limit(500)];
                    case 33:
                        rows = _0.sent();
                        _u = 0, rows_4 = rows;
                        _0.label = 34;
                    case 34:
                        if (!(_u < rows_4.length)) return [3 /*break*/, 40];
                        lr = rows_4[_u];
                        s = lr.status === 'pending' ? 'pending' : lr.status === 'approved' ? 'approved' : lr.status === 'rejected' ? 'rejected' : null;
                        if (!s)
                            return [3 /*break*/, 39];
                        _w = (_v = approvals).push;
                        _x = {
                            id: lr.id,
                            type: 'leave_request',
                            referenceId: lr.id,
                            referenceNo: "LEAVE-" + lr.id.slice(0, 8),
                            amount: undefined
                        };
                        return [4 /*yield*/, getUserName(lr.userId || lr.employeeId)];
                    case 35:
                        _x.requestedBy = _0.sent(),
                            _x.requestedAt = lr.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19);
                        if (!(lr.reviewedBy || lr.approvedBy)) return [3 /*break*/, 37];
                        return [4 /*yield*/, getUserName(lr.reviewedBy || lr.approvedBy)];
                    case 36:
                        _y = _0.sent();
                        return [3 /*break*/, 38];
                    case 37:
                        _y = null;
                        _0.label = 38;
                    case 38:
                        _w.apply(_v, [(_x.approvedBy = _y,
                                _x.approvedAt = lr.reviewedAt || lr.approvalDate || null,
                                _x.status = s,
                                _x.description = (lr.leaveType || 'Leave') + " \u2014 " + lr.startDate + " to " + lr.endDate,
                                _x)]);
                        _0.label = 39;
                    case 39:
                        _u++;
                        return [3 /*break*/, 34];
                    case 40: return [3 /*break*/, 42];
                    case 41:
                        _z = _0.sent();
                        return [3 /*break*/, 42];
                    case 42: return [2 /*return*/, { approvals: approvals }];
                }
            });
        });
    }),
    // ── Client Health Scores ─────────────────────────────────────────
    /**
     * Computes a health score (0–100) for every client in the org,
     * based on payment behaviour and project activity.
     */
    getClientsHealthScores: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, getDb, drizzleDb, _b, invoicesTable, projectsTable, eq, orgId, _c, allInvoices, allProjects, invoicesByClient, activeProjectsByClient, allClientIds, scores, now, _i, allClientIds_1, clientId, invs, totalInvoices, paidInvoices, overdueInvoices, paymentRate, paymentScore, overduePenalty, activeProjects, engagementScore, recentInvoice, recencyScore, raw, score, label, color;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!ctx.user.organizationId)
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'No organization' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../db'); })];
                    case 1:
                        database = _d.sent();
                        getDb = database.getDb;
                        return [4 /*yield*/, getDb()];
                    case 2:
                        drizzleDb = _d.sent();
                        if (!drizzleDb)
                            return [2 /*return*/, { scores: {} }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 3:
                        _b = _d.sent(), invoicesTable = _b.invoices, projectsTable = _b.projects;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 4:
                        eq = (_d.sent()).eq;
                        orgId = ctx.user.organizationId;
                        return [4 /*yield*/, Promise.all([
                                drizzleDb.select().from(invoicesTable).where(eq(invoicesTable.organizationId, orgId)).limit(5000),
                                drizzleDb.select().from(projectsTable).where(eq(projectsTable.organizationId, orgId)).limit(2000),
                            ])];
                    case 5:
                        _c = _d.sent(), allInvoices = _c[0], allProjects = _c[1];
                        invoicesByClient = {};
                        allInvoices.forEach(function (inv) {
                            if (!invoicesByClient[inv.clientId])
                                invoicesByClient[inv.clientId] = [];
                            invoicesByClient[inv.clientId].push(inv);
                        });
                        activeProjectsByClient = {};
                        allProjects.forEach(function (proj) {
                            if (proj.status === 'active' || proj.status === 'planning') {
                                activeProjectsByClient[proj.clientId] = (activeProjectsByClient[proj.clientId] || 0) + 1;
                            }
                        });
                        allClientIds = Array.from(new Set(__spreadArrays(Object.keys(invoicesByClient), Object.keys(activeProjectsByClient))));
                        scores = {};
                        now = new Date();
                        for (_i = 0, allClientIds_1 = allClientIds; _i < allClientIds_1.length; _i++) {
                            clientId = allClientIds_1[_i];
                            invs = invoicesByClient[clientId] || [];
                            totalInvoices = invs.length;
                            paidInvoices = invs.filter(function (i) { return i.status === 'paid'; }).length;
                            overdueInvoices = invs.filter(function (i) { return i.status === 'overdue'; }).length;
                            paymentRate = totalInvoices > 0 ? paidInvoices / totalInvoices : 0.5;
                            paymentScore = Math.round(paymentRate * 50);
                            overduePenalty = totalInvoices > 0 ? Math.round((overdueInvoices / totalInvoices) * 20) : 0;
                            activeProjects = activeProjectsByClient[clientId] || 0;
                            engagementScore = activeProjects > 0 ? Math.min(30, activeProjects * 15) : 10;
                            recentInvoice = invs.find(function (i) {
                                if (!i.issueDate)
                                    return false;
                                var d = new Date(String(i.issueDate));
                                return (now.getTime() - d.getTime()) < 90 * 86400000;
                            });
                            recencyScore = recentInvoice ? 20 : 5;
                            raw = paymentScore - overduePenalty + engagementScore + recencyScore;
                            score = Math.max(0, Math.min(100, raw));
                            label = void 0;
                            color = void 0;
                            if (score >= 80) {
                                label = 'Excellent';
                                color = '#22c55e';
                            }
                            else if (score >= 60) {
                                label = 'Good';
                                color = '#3b82f6';
                            }
                            else if (score >= 40) {
                                label = 'At Risk';
                                color = '#f59e0b';
                            }
                            else {
                                label = 'Critical';
                                color = '#ef4444';
                            }
                            scores[clientId] = { score: score, label: label, color: color };
                        }
                        return [2 /*return*/, { scores: scores }];
                }
            });
        });
    }),
    // ── Organization Subscription Management ────────────────────────
    /**
     * Get the current subscription for the caller's organization.
     * Org super admins see their own org; Kiini super admins can query any org.
     */
    getOrgSubscription: orgViewProcedure
        .input(zod_1.z.object({ organizationId: zod_1.z.string().optional() }).optional())
        .query(function (_a) {
        var ctx = _a.ctx, input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, database, _b, subscriptions, pricingPlans, organizations, _c, eq, desc, orgRows, org, subRows, subscription, plan, planRows;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        orgId = (input === null || input === void 0 ? void 0 : input.organizationId) || ctx.user.organizationId;
                        if (!orgId) {
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Organization ID required' });
                        }
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, orgId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only view your own organization subscription' });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            return [2 /*return*/, { subscription: null, plan: null }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        _b = _d.sent(), subscriptions = _b.subscriptions, pricingPlans = _b.pricingPlans, organizations = _b.organizations;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        _c = _d.sent(), eq = _c.eq, desc = _c.desc;
                        return [4 /*yield*/, database.select().from(organizations).where(eq(organizations.id, orgId)).limit(1)];
                    case 4:
                        orgRows = _d.sent();
                        org = orgRows[0] || null;
                        return [4 /*yield*/, database.select().from(subscriptions)
                                .where(eq(subscriptions.clientId, orgId))
                                .orderBy(desc(subscriptions.createdAt))
                                .limit(1)];
                    case 5:
                        subRows = _d.sent();
                        subscription = subRows[0] || null;
                        plan = null;
                        if (!subscription) return [3 /*break*/, 7];
                        return [4 /*yield*/, database.select().from(pricingPlans)
                                .where(eq(pricingPlans.id, subscription.planId))
                                .limit(1)];
                    case 6:
                        planRows = _d.sent();
                        plan = planRows[0] || null;
                        _d.label = 7;
                    case 7: return [2 /*return*/, {
                            subscription: subscription,
                            plan: plan,
                            organization: org ? { id: org.id, name: org.name, plan: org.plan, maxUsers: org.maxUsers } : null
                        }];
                }
            });
        });
    }),
    /**
     * Get available pricing plans for subscription selection.
     */
    getAvailablePlans: trpc_1.protectedProcedure
        .input(zod_1.z.object({ tier: zod_1.z.string().optional() }).optional())
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, pricingPlans, eq, query, plans;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _b.sent();
                        if (!database)
                            return [2 /*return*/, { plans: [] }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        pricingPlans = (_b.sent()).pricingPlans;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        eq = (_b.sent()).eq;
                        query = database.select().from(pricingPlans)
                            .where(eq(pricingPlans.isActive, 1))
                            .orderBy(pricingPlans.displayOrder);
                        return [4 /*yield*/, query];
                    case 4:
                        plans = _b.sent();
                        if (input === null || input === void 0 ? void 0 : input.tier) {
                            return [2 /*return*/, { plans: plans.filter(function (p) { return p.tier === input.tier; }) }];
                        }
                        return [2 /*return*/, { plans: plans }];
                }
            });
        });
    }),
    /**
     * Full subscription creation procedure for an organization.
     * Creates subscription record, billing invoice, updates org plan & features.
     * Accessible by org super_admin (for own org) or Kiini super_admin (for any org).
     */
    createOrgSubscription: orgEditProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        planId: zod_1.z.string(),
        billingCycle: zod_1.z["enum"](['monthly', 'annual']),
        autoRenew: zod_1.z.boolean()["default"](true)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, organizations, subscriptions, pricingPlans, billingInvoices, _c, eq, desc, orgRows, org, planRows, plan, existingSubRows, existingSub, price, now, renewalDate, subscriptionId, invoiceId, invoiceNumber, dueDate, tier, tierFeatures, featuresToApply, oldPlan, jobError_3;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, input.organizationId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only subscribe your own organization' });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _e.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        _b = _e.sent(), organizations = _b.organizations, subscriptions = _b.subscriptions, pricingPlans = _b.pricingPlans, billingInvoices = _b.billingInvoices;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        _c = _e.sent(), eq = _c.eq, desc = _c.desc;
                        return [4 /*yield*/, database.select().from(organizations).where(eq(organizations.id, input.organizationId)).limit(1)];
                    case 4:
                        orgRows = _e.sent();
                        org = orgRows[0];
                        if (!org) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
                        }
                        return [4 /*yield*/, database.select().from(pricingPlans).where(eq(pricingPlans.id, input.planId)).limit(1)];
                    case 5:
                        planRows = _e.sent();
                        plan = planRows[0];
                        if (!plan) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Pricing plan not found' });
                        }
                        if (!plan.isActive) {
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Selected plan is no longer active' });
                        }
                        return [4 /*yield*/, database.select().from(subscriptions)
                                .where(eq(subscriptions.clientId, input.organizationId))
                                .orderBy(desc(subscriptions.createdAt))
                                .limit(1)];
                    case 6:
                        existingSubRows = _e.sent();
                        existingSub = existingSubRows[0];
                        if (existingSub && (existingSub.status === 'active' || existingSub.status === 'trial')) {
                            throw new server_1.TRPCError({
                                code: 'CONFLICT',
                                message: "Organization already has an " + existingSub.status + " subscription. Use upgrade instead."
                            });
                        }
                        price = input.billingCycle === 'monthly'
                            ? plan.monthlyPrice
                            : plan.annualPrice;
                        now = new Date();
                        renewalDate = new Date(now);
                        if (input.billingCycle === 'monthly') {
                            renewalDate.setMonth(renewalDate.getMonth() + 1);
                        }
                        else {
                            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                        }
                        subscriptionId = "sub_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        return [4 /*yield*/, database.insert(subscriptions).values({
                                id: subscriptionId,
                                clientId: input.organizationId,
                                planId: input.planId,
                                status: 'active',
                                billingCycle: input.billingCycle,
                                startDate: now.toISOString(),
                                renewalDate: renewalDate.toISOString(),
                                currentPrice: price,
                                autoRenew: input.autoRenew ? 1 : 0,
                                usersCount: 0,
                                projectsCount: 0,
                                storageUsedGB: 0,
                                createdAt: now.toISOString(),
                                updatedAt: now.toISOString()
                            })];
                    case 7:
                        _e.sent();
                        invoiceId = "binv_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        invoiceNumber = "BINV-" + Date.now().toString(36).toUpperCase();
                        dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, database.insert(billingInvoices).values({
                                id: invoiceId,
                                subscriptionId: subscriptionId,
                                invoiceNumber: invoiceNumber,
                                amount: price,
                                tax: '0',
                                totalAmount: price,
                                currency: 'USD',
                                status: 'pending',
                                billingPeriodStart: now.toISOString(),
                                billingPeriodEnd: renewalDate.toISOString(),
                                dueDate: dueDate.toISOString(),
                                notes: "Subscription: " + plan.planName + " (" + input.billingCycle + ")",
                                createdAt: now.toISOString(),
                                updatedAt: now.toISOString()
                            })];
                    case 8:
                        _e.sent();
                        // 7. Update organization plan and maxUsers from the selected plan
                        return [4 /*yield*/, database.update(organizations)
                                .set({
                                plan: plan.planSlug || plan.tier,
                                maxUsers: plan.maxUsers && plan.maxUsers > 0 ? plan.maxUsers : org.maxUsers,
                                updatedAt: now.toISOString()
                            })
                                .where(eq(organizations.id, input.organizationId))];
                    case 9:
                        // 7. Update organization plan and maxUsers from the selected plan
                        _e.sent();
                        tier = plan.tier || plan.planSlug;
                        return [4 /*yield*/, db.getPricingTierFeatures(tier)];
                    case 10:
                        tierFeatures = _e.sent();
                        if (tierFeatures.length > 0) {
                            featuresToApply = {};
                            tierFeatures.forEach(function (tf) { featuresToApply[tf.featureKey] = Boolean(tf.isEnabled); });
                        }
                        else {
                            featuresToApply = (_d = exports.TIER_DEFAULT_FEATURES[tier]) !== null && _d !== void 0 ? _d : exports.TIER_DEFAULT_FEATURES['trial'];
                        }
                        return [4 /*yield*/, Promise.all(Object.entries(featuresToApply).map(function (_a) {
                                var key = _a[0], enabled = _a[1];
                                return db.setOrganizationFeature(input.organizationId, key, enabled);
                            }))];
                    case 11:
                        _e.sent();
                        _e.label = 12;
                    case 12:
                        _e.trys.push([12, 14, , 15]);
                        oldPlan = org.plan || 'trial';
                        return [4 /*yield*/, orgSubscriptionJobs_1.updateOrgSubscriptionJobs(input.organizationId, org.name || 'Organization', oldPlan, tier)];
                    case 13:
                        _e.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        jobError_3 = _e.sent();
                        console.error('[MultiTenancy] Failed to update subscription jobs:', jobError_3);
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/, {
                            success: true,
                            subscription: { id: subscriptionId, status: 'active', planId: input.planId, billingCycle: input.billingCycle },
                            billingInvoice: { id: invoiceId, invoiceNumber: invoiceNumber, amount: price, dueDate: dueDate.toISOString() },
                            featuresApplied: Object.keys(featuresToApply).length
                        }];
                }
            });
        });
    }),
    /**
     * Upgrade or change an organization's subscription plan.
     * Handles plan changes, prorated billing, feature sync.
     */
    upgradeOrgSubscription: orgEditProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        newPlanId: zod_1.z.string(),
        billingCycle: zod_1.z["enum"](['monthly', 'annual']).optional()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, organizations, subscriptions, pricingPlans, billingInvoices, _c, eq, desc, subRows, currentSub, newPlanRows, newPlan, billingCycle, newPrice, now, invoiceId, invoiceNumber, dueDate, orgRows, org, tier, tierFeatures, featuresToApply, oldPlan, jobError_4;
            var _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, input.organizationId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only upgrade your own organization subscription' });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _g.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        _b = _g.sent(), organizations = _b.organizations, subscriptions = _b.subscriptions, pricingPlans = _b.pricingPlans, billingInvoices = _b.billingInvoices;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        _c = _g.sent(), eq = _c.eq, desc = _c.desc;
                        return [4 /*yield*/, database.select().from(subscriptions)
                                .where(eq(subscriptions.clientId, input.organizationId))
                                .orderBy(desc(subscriptions.createdAt))
                                .limit(1)];
                    case 4:
                        subRows = _g.sent();
                        currentSub = subRows[0];
                        if (!currentSub) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'No existing subscription found. Use createOrgSubscription first.' });
                        }
                        if (currentSub.status === 'cancelled' || currentSub.status === 'expired') {
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: "Cannot upgrade a " + currentSub.status + " subscription. Create a new one instead." });
                        }
                        return [4 /*yield*/, database.select().from(pricingPlans).where(eq(pricingPlans.id, input.newPlanId)).limit(1)];
                    case 5:
                        newPlanRows = _g.sent();
                        newPlan = newPlanRows[0];
                        if (!newPlan || !newPlan.isActive) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'New pricing plan not found or inactive' });
                        }
                        if (currentSub.planId === input.newPlanId && !input.billingCycle) {
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Already on this plan' });
                        }
                        billingCycle = input.billingCycle || currentSub.billingCycle;
                        newPrice = billingCycle === 'monthly' ? newPlan.monthlyPrice : newPlan.annualPrice;
                        now = new Date();
                        // 4. Update existing subscription
                        return [4 /*yield*/, database.update(subscriptions)
                                .set({
                                planId: input.newPlanId,
                                billingCycle: billingCycle,
                                currentPrice: newPrice,
                                status: 'active',
                                isLocked: 0,
                                updatedAt: now.toISOString()
                            })
                                .where(eq(subscriptions.id, currentSub.id))];
                    case 6:
                        // 4. Update existing subscription
                        _g.sent();
                        invoiceId = "binv_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        invoiceNumber = "BINV-UPG-" + Date.now().toString(36).toUpperCase();
                        dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, database.insert(billingInvoices).values({
                                id: invoiceId,
                                subscriptionId: currentSub.id,
                                invoiceNumber: invoiceNumber,
                                amount: newPrice,
                                tax: '0',
                                totalAmount: newPrice,
                                currency: 'USD',
                                status: 'pending',
                                billingPeriodStart: now.toISOString(),
                                billingPeriodEnd: currentSub.renewalDate,
                                dueDate: dueDate.toISOString(),
                                notes: "Plan upgrade to " + newPlan.planName + " (" + billingCycle + ")",
                                createdAt: now.toISOString(),
                                updatedAt: now.toISOString()
                            })];
                    case 7:
                        _g.sent();
                        return [4 /*yield*/, database.select().from(organizations).where(eq(organizations.id, input.organizationId)).limit(1)];
                    case 8:
                        orgRows = _g.sent();
                        org = orgRows[0];
                        return [4 /*yield*/, database.update(organizations)
                                .set({
                                plan: newPlan.planSlug || newPlan.tier,
                                maxUsers: newPlan.maxUsers && newPlan.maxUsers > 0 ? newPlan.maxUsers : ((org === null || org === void 0 ? void 0 : org.maxUsers) || 10),
                                updatedAt: now.toISOString()
                            })
                                .where(eq(organizations.id, input.organizationId))];
                    case 9:
                        _g.sent();
                        tier = newPlan.tier || newPlan.planSlug;
                        return [4 /*yield*/, db.getPricingTierFeatures(tier)];
                    case 10:
                        tierFeatures = _g.sent();
                        if (tierFeatures.length > 0) {
                            featuresToApply = {};
                            tierFeatures.forEach(function (tf) { featuresToApply[tf.featureKey] = Boolean(tf.isEnabled); });
                        }
                        else {
                            featuresToApply = (_d = exports.TIER_DEFAULT_FEATURES[tier]) !== null && _d !== void 0 ? _d : exports.TIER_DEFAULT_FEATURES['trial'];
                        }
                        return [4 /*yield*/, Promise.all(Object.entries(featuresToApply).map(function (_a) {
                                var key = _a[0], enabled = _a[1];
                                return db.setOrganizationFeature(input.organizationId, key, enabled);
                            }))];
                    case 11:
                        _g.sent();
                        _g.label = 12;
                    case 12:
                        _g.trys.push([12, 14, , 15]);
                        oldPlan = ((_e = org) === null || _e === void 0 ? void 0 : _e.plan) || 'trial';
                        return [4 /*yield*/, orgSubscriptionJobs_1.updateOrgSubscriptionJobs(input.organizationId, ((_f = org) === null || _f === void 0 ? void 0 : _f.name) || 'Organization', oldPlan, tier)];
                    case 13:
                        _g.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        jobError_4 = _g.sent();
                        console.error('[MultiTenancy] Failed to update subscription jobs on upgrade:', jobError_4);
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/, {
                            success: true,
                            subscription: { id: currentSub.id, status: 'active', planId: input.newPlanId, billingCycle: billingCycle },
                            billingInvoice: { id: invoiceId, invoiceNumber: invoiceNumber, amount: newPrice },
                            featuresApplied: Object.keys(featuresToApply).length
                        }];
                }
            });
        });
    }),
    /**
     * Cancel an organization's subscription.
     * Sets status to 'cancelled', removes subscription jobs, keeps org data intact.
     */
    cancelOrgSubscription: orgEditProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        reason: zod_1.z.string().optional(),
        immediate: zod_1.z.boolean()["default"](false)
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, subscriptions, organizations, _c, eq, desc, subRows, currentSub, now, trialFeatures, jobError_5;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, input.organizationId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only cancel your own organization subscription' });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        _b = _d.sent(), subscriptions = _b.subscriptions, organizations = _b.organizations;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        _c = _d.sent(), eq = _c.eq, desc = _c.desc;
                        return [4 /*yield*/, database.select().from(subscriptions)
                                .where(eq(subscriptions.clientId, input.organizationId))
                                .orderBy(desc(subscriptions.createdAt))
                                .limit(1)];
                    case 4:
                        subRows = _d.sent();
                        currentSub = subRows[0];
                        if (!currentSub) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'No subscription found for this organization' });
                        }
                        if (currentSub.status === 'cancelled') {
                            throw new server_1.TRPCError({ code: 'BAD_REQUEST', message: 'Subscription is already cancelled' });
                        }
                        now = new Date();
                        if (!input.immediate) return [3 /*break*/, 6];
                        // Immediate cancellation
                        return [4 /*yield*/, database.update(subscriptions)
                                .set({
                                status: 'cancelled',
                                autoRenew: 0,
                                expiryDate: now.toISOString(),
                                updatedAt: now.toISOString()
                            })
                                .where(eq(subscriptions.id, currentSub.id))];
                    case 5:
                        // Immediate cancellation
                        _d.sent();
                        return [3 /*break*/, 8];
                    case 6: 
                    // Cancel at end of current billing period
                    return [4 /*yield*/, database.update(subscriptions)
                            .set({
                            autoRenew: 0,
                            updatedAt: now.toISOString()
                        })
                            .where(eq(subscriptions.id, currentSub.id))];
                    case 7:
                        // Cancel at end of current billing period
                        _d.sent();
                        _d.label = 8;
                    case 8:
                        if (!input.immediate) return [3 /*break*/, 11];
                        trialFeatures = exports.TIER_DEFAULT_FEATURES['trial'];
                        return [4 /*yield*/, Promise.all(Object.entries(trialFeatures).map(function (_a) {
                                var key = _a[0], enabled = _a[1];
                                return db.setOrganizationFeature(input.organizationId, key, enabled);
                            }))];
                    case 9:
                        _d.sent();
                        return [4 /*yield*/, database.update(organizations)
                                .set({ plan: 'trial', updatedAt: now.toISOString() })
                                .where(eq(organizations.id, input.organizationId))];
                    case 10:
                        _d.sent();
                        _d.label = 11;
                    case 11:
                        _d.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, orgSubscriptionJobs_1.removeOrgSubscriptionJobs(input.organizationId)];
                    case 12:
                        _d.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        jobError_5 = _d.sent();
                        console.error('[MultiTenancy] Failed to remove subscription jobs on cancel:', jobError_5);
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/, {
                            success: true,
                            cancellationType: input.immediate ? 'immediate' : 'end_of_period',
                            effectiveDate: input.immediate ? now.toISOString() : currentSub.renewalDate
                        }];
                }
            });
        });
    }),
    /**
     * Renew an organization's subscription after payment.
     * Extends the renewal date by one billing cycle, unlocks if locked.
     */
    renewOrgSubscription: orgEditProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string()
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, subscriptions, billingInvoices, _c, eq, desc, subRows, currentSub, now, currentRenewal, baseDate, newRenewalDate, invoiceId, invoiceNumber, dueDate;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, input.organizationId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only renew your own organization subscription' });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        _b = _d.sent(), subscriptions = _b.subscriptions, billingInvoices = _b.billingInvoices;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        _c = _d.sent(), eq = _c.eq, desc = _c.desc;
                        return [4 /*yield*/, database.select().from(subscriptions)
                                .where(eq(subscriptions.clientId, input.organizationId))
                                .orderBy(desc(subscriptions.createdAt))
                                .limit(1)];
                    case 4:
                        subRows = _d.sent();
                        currentSub = subRows[0];
                        if (!currentSub) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'No subscription found' });
                        }
                        now = new Date();
                        currentRenewal = new Date(currentSub.renewalDate);
                        baseDate = currentRenewal > now ? currentRenewal : now;
                        newRenewalDate = new Date(baseDate);
                        if (currentSub.billingCycle === 'monthly') {
                            newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
                        }
                        else {
                            newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
                        }
                        // 3. Update subscription
                        return [4 /*yield*/, database.update(subscriptions)
                                .set({
                                status: 'active',
                                renewalDate: newRenewalDate.toISOString(),
                                isLocked: 0,
                                autoRenew: 1,
                                updatedAt: now.toISOString()
                            })
                                .where(eq(subscriptions.id, currentSub.id))];
                    case 5:
                        // 3. Update subscription
                        _d.sent();
                        invoiceId = "binv_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        invoiceNumber = "BINV-RNW-" + Date.now().toString(36).toUpperCase();
                        dueDate = new Date(newRenewalDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, database.insert(billingInvoices).values({
                                id: invoiceId,
                                subscriptionId: currentSub.id,
                                invoiceNumber: invoiceNumber,
                                amount: currentSub.currentPrice,
                                tax: '0',
                                totalAmount: currentSub.currentPrice,
                                currency: 'USD',
                                status: 'pending',
                                billingPeriodStart: baseDate.toISOString(),
                                billingPeriodEnd: newRenewalDate.toISOString(),
                                dueDate: dueDate.toISOString(),
                                notes: "Subscription renewal (" + currentSub.billingCycle + ")",
                                createdAt: now.toISOString(),
                                updatedAt: now.toISOString()
                            })];
                    case 6:
                        _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                subscription: { id: currentSub.id, status: 'active', renewalDate: newRenewalDate.toISOString() },
                                billingInvoice: { id: invoiceId, invoiceNumber: invoiceNumber }
                            }];
                }
            });
        });
    }),
    /**
     * Get current subscription for the user's organization.
     */
    getCurrentSubscription: trpc_1.protectedProcedure
        .query(function (_a) {
        var ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, subscriptions, pricingPlans, _c, eq, desc, subRows, currentSub, planRows, plan;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!ctx.user.organizationId) {
                            return [2 /*return*/, { subscription: null, plan: null }];
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            return [2 /*return*/, { subscription: null, plan: null }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        _b = _d.sent(), subscriptions = _b.subscriptions, pricingPlans = _b.pricingPlans;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        _c = _d.sent(), eq = _c.eq, desc = _c.desc;
                        return [4 /*yield*/, database.select().from(subscriptions)
                                .where(eq(subscriptions.clientId, ctx.user.organizationId))
                                .orderBy(desc(subscriptions.createdAt))
                                .limit(1)];
                    case 4:
                        subRows = _d.sent();
                        currentSub = subRows[0];
                        if (!currentSub)
                            return [2 /*return*/, { subscription: null, plan: null }];
                        return [4 /*yield*/, database.select().from(pricingPlans)
                                .where(eq(pricingPlans.id, currentSub.planId))
                                .limit(1)];
                    case 5:
                        planRows = _d.sent();
                        plan = planRows[0] || null;
                        return [2 /*return*/, {
                                subscription: {
                                    id: currentSub.id,
                                    planKey: (plan === null || plan === void 0 ? void 0 : plan.planSlug) || currentSub.planId,
                                    planName: (plan === null || plan === void 0 ? void 0 : plan.planName) || null,
                                    billingCycle: currentSub.billingCycle,
                                    status: currentSub.status
                                },
                                plan: plan
                            }];
                }
            });
        });
    }),
    /**
     * Create a subscription from the public checkout flow.
     */
    createSubscription: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        planKey: zod_1.z.string(),
        billingCycle: zod_1.z["enum"](['monthly', 'annual']),
        paymentMethod: zod_1.z["enum"](['card', 'mpesa', 'bank']),
        paymentData: zod_1.z.object({
            card: zod_1.z.object({ number: zod_1.z.string(), expiry: zod_1.z.string(), cvv: zod_1.z.string(), name: zod_1.z.string() }).optional(),
            mpesa: zod_1.z.object({ phoneNumber: zod_1.z.string() }).optional(),
            bank: zod_1.z.object({ bankName: zod_1.z.string(), accountNumber: zod_1.z.string() }).optional()
        })
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, organizations, subscriptions, pricingPlans, billingInvoices, eq, plan, planRows, now, renewalDate, price, subscriptionId, invoiceId, invoiceNumber, dueDate, org, jobError_6;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!ctx.user.organizationId) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'No organization associated with this account' });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        _b = _d.sent(), organizations = _b.organizations, subscriptions = _b.subscriptions, pricingPlans = _b.pricingPlans, billingInvoices = _b.billingInvoices;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        eq = (_d.sent()).eq;
                        return [4 /*yield*/, db.getPricingPlan(input.planKey)];
                    case 4:
                        plan = _d.sent();
                        if (!!plan) return [3 /*break*/, 6];
                        return [4 /*yield*/, database.select().from(pricingPlans)
                                .where(eq(pricingPlans.planSlug, input.planKey))
                                .limit(1)];
                    case 5:
                        planRows = _d.sent();
                        plan = planRows[0] || null;
                        _d.label = 6;
                    case 6:
                        if (!plan) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Pricing plan not found' });
                        }
                        now = new Date();
                        renewalDate = new Date(now);
                        if (input.billingCycle === 'monthly') {
                            renewalDate.setMonth(renewalDate.getMonth() + 1);
                        }
                        else {
                            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
                        }
                        price = input.billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
                        subscriptionId = "sub_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        return [4 /*yield*/, database.insert(subscriptions).values({
                                id: subscriptionId,
                                clientId: ctx.user.organizationId,
                                planId: plan.id,
                                status: 'active',
                                billingCycle: input.billingCycle,
                                startDate: now.toISOString(),
                                renewalDate: renewalDate.toISOString(),
                                currentPrice: price,
                                autoRenew: 1,
                                usersCount: 0,
                                projectsCount: 0,
                                storageUsedGB: 0,
                                createdAt: now.toISOString(),
                                updatedAt: now.toISOString()
                            })];
                    case 7:
                        _d.sent();
                        invoiceId = "binv_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        invoiceNumber = "BINV-" + Date.now().toString(36).toUpperCase();
                        dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, database.insert(billingInvoices).values({
                                id: invoiceId,
                                subscriptionId: subscriptionId,
                                invoiceNumber: invoiceNumber,
                                amount: price,
                                tax: '0',
                                totalAmount: price,
                                currency: 'KES',
                                status: 'pending',
                                billingPeriodStart: now.toISOString(),
                                billingPeriodEnd: renewalDate.toISOString(),
                                dueDate: dueDate.toISOString(),
                                notes: "Subscription: " + (plan.planName || plan.planSlug) + " (" + input.billingCycle + ")",
                                createdAt: now.toISOString(),
                                updatedAt: now.toISOString()
                            })];
                    case 8:
                        _d.sent();
                        return [4 /*yield*/, database.update(organizations)
                                .set({
                                plan: plan.planSlug || plan.tier,
                                updatedAt: now.toISOString()
                            })
                                .where(eq(organizations.id, ctx.user.organizationId))];
                    case 9:
                        _d.sent();
                        _d.label = 10;
                    case 10:
                        _d.trys.push([10, 13, , 14]);
                        return [4 /*yield*/, db.getOrganization(ctx.user.organizationId)];
                    case 11:
                        org = _d.sent();
                        return [4 /*yield*/, orgSubscriptionJobs_1.createOrgSubscriptionJobs(ctx.user.organizationId, ((_c = org) === null || _c === void 0 ? void 0 : _c.name) || 'Organization', plan.planSlug || plan.tier || input.planKey)];
                    case 12:
                        _d.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        jobError_6 = _d.sent();
                        console.error('[Checkout] Failed to create subscription jobs:', jobError_6);
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/, { success: true, subscription: { id: subscriptionId, status: 'active' } }];
                }
            });
        });
    }),
    /**
     * Upgrade an existing subscription from the public checkout flow.
     */
    upgradeSubscription: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        planKey: zod_1.z.string(),
        billingCycle: zod_1.z["enum"](['monthly', 'annual']),
        paymentMethod: zod_1.z["enum"](['card', 'mpesa', 'bank']),
        paymentData: zod_1.z.object({
            card: zod_1.z.object({ number: zod_1.z.string(), expiry: zod_1.z.string(), cvv: zod_1.z.string(), name: zod_1.z.string() }).optional(),
            mpesa: zod_1.z.object({ phoneNumber: zod_1.z.string() }).optional(),
            bank: zod_1.z.object({ bankName: zod_1.z.string(), accountNumber: zod_1.z.string() }).optional()
        })
    }))
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var database, _b, organizations, subscriptions, pricingPlans, billingInvoices, _c, eq, desc, subRows, currentSub, plan, planRows, billingCycle, newPrice, now, invoiceId, invoiceNumber, dueDate, org, oldPlan, jobError_7;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!ctx.user.organizationId) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'No organization associated with this account' });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _f.sent();
                        if (!database) {
                            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' });
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        _b = _f.sent(), organizations = _b.organizations, subscriptions = _b.subscriptions, pricingPlans = _b.pricingPlans, billingInvoices = _b.billingInvoices;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        _c = _f.sent(), eq = _c.eq, desc = _c.desc;
                        return [4 /*yield*/, database.select().from(subscriptions)
                                .where(eq(subscriptions.clientId, ctx.user.organizationId))
                                .orderBy(desc(subscriptions.createdAt))
                                .limit(1)];
                    case 4:
                        subRows = _f.sent();
                        currentSub = subRows[0];
                        if (!currentSub) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'No existing subscription found' });
                        }
                        return [4 /*yield*/, db.getPricingPlan(input.planKey)];
                    case 5:
                        plan = _f.sent();
                        if (!!plan) return [3 /*break*/, 7];
                        return [4 /*yield*/, database.select().from(pricingPlans)
                                .where(eq(pricingPlans.planSlug, input.planKey))
                                .limit(1)];
                    case 6:
                        planRows = _f.sent();
                        plan = planRows[0] || null;
                        _f.label = 7;
                    case 7:
                        if (!plan) {
                            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Pricing plan not found' });
                        }
                        billingCycle = input.billingCycle || currentSub.billingCycle;
                        newPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
                        now = new Date();
                        return [4 /*yield*/, database.update(subscriptions)
                                .set({
                                planId: plan.id,
                                billingCycle: billingCycle,
                                currentPrice: newPrice,
                                status: 'active',
                                updatedAt: now.toISOString()
                            })
                                .where(eq(subscriptions.id, currentSub.id))];
                    case 8:
                        _f.sent();
                        invoiceId = "binv_" + uuid_1.v4().replace(/-/g, '').slice(0, 20);
                        invoiceNumber = "BINV-UPG-" + Date.now().toString(36).toUpperCase();
                        dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, database.insert(billingInvoices).values({
                                id: invoiceId,
                                subscriptionId: currentSub.id,
                                invoiceNumber: invoiceNumber,
                                amount: newPrice,
                                tax: '0',
                                totalAmount: newPrice,
                                currency: 'KES',
                                status: 'pending',
                                billingPeriodStart: now.toISOString(),
                                billingPeriodEnd: currentSub.renewalDate,
                                dueDate: dueDate.toISOString(),
                                notes: "Plan upgrade to " + (plan.planName || plan.planSlug) + " (" + billingCycle + ")",
                                createdAt: now.toISOString(),
                                updatedAt: now.toISOString()
                            })];
                    case 9:
                        _f.sent();
                        return [4 /*yield*/, database.update(organizations)
                                .set({
                                plan: plan.planSlug || plan.tier,
                                updatedAt: now.toISOString()
                            })
                                .where(eq(organizations.id, ctx.user.organizationId))];
                    case 10:
                        _f.sent();
                        _f.label = 11;
                    case 11:
                        _f.trys.push([11, 14, , 15]);
                        return [4 /*yield*/, db.getOrganization(ctx.user.organizationId)];
                    case 12:
                        org = _f.sent();
                        oldPlan = ((_d = org) === null || _d === void 0 ? void 0 : _d.plan) || 'trial';
                        return [4 /*yield*/, orgSubscriptionJobs_1.updateOrgSubscriptionJobs(ctx.user.organizationId, ((_e = org) === null || _e === void 0 ? void 0 : _e.name) || 'Organization', oldPlan, plan.planSlug || plan.tier || input.planKey)];
                    case 13:
                        _f.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        jobError_7 = _f.sent();
                        console.error('[Checkout] Failed to update subscription jobs:', jobError_7);
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/, { success: true, subscription: { id: currentSub.id, status: 'active' } }];
                }
            });
        });
    }),
    /**
     * Get billing invoices for an organization's subscription.
     */
    getOrgBillingInvoices: orgViewProcedure
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
        status: zod_1.z.string().optional(),
        limit: zod_1.z.number().min(1).max(100)["default"](50)
    }))
        .query(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var orgId, database, _b, subscriptions, billingInvoices, _c, eq, desc, subRows, allInvoices, _i, subRows_1, sub, invoiceRows, filtered;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        orgId = input.organizationId;
                        if (!enhancedRbac_1.checkOrgScopeAccess(ctx, orgId)) {
                            throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'You can only view your own billing invoices' });
                        }
                        return [4 /*yield*/, db.getDb()];
                    case 1:
                        database = _d.sent();
                        if (!database)
                            return [2 /*return*/, { invoices: [] }];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../drizzle/schema'); })];
                    case 2:
                        _b = _d.sent(), subscriptions = _b.subscriptions, billingInvoices = _b.billingInvoices;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('drizzle-orm'); })];
                    case 3:
                        _c = _d.sent(), eq = _c.eq, desc = _c.desc;
                        return [4 /*yield*/, database.select().from(subscriptions)
                                .where(eq(subscriptions.clientId, orgId))];
                    case 4:
                        subRows = _d.sent();
                        if (subRows.length === 0)
                            return [2 /*return*/, { invoices: [] }];
                        allInvoices = [];
                        _i = 0, subRows_1 = subRows;
                        _d.label = 5;
                    case 5:
                        if (!(_i < subRows_1.length)) return [3 /*break*/, 8];
                        sub = subRows_1[_i];
                        return [4 /*yield*/, database.select().from(billingInvoices)
                                .where(eq(billingInvoices.subscriptionId, sub.id))
                                .orderBy(desc(billingInvoices.createdAt))
                                .limit(input.limit)];
                    case 6:
                        invoiceRows = _d.sent();
                        allInvoices.push.apply(allInvoices, invoiceRows);
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8:
                        filtered = input.status
                            ? allInvoices.filter(function (inv) { return inv.status === input.status; })
                            : allInvoices;
                        // Sort by created date descending
                        filtered.sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
                        return [2 /*return*/, { invoices: filtered.slice(0, input.limit) }];
                }
            });
        });
    })
});
function buildEmptyAnalytics() {
    return {
        kpis: {
            totalInvoices: 0, totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0,
            totalPaymentsReceived: 0, totalExpenses: 0, totalClients: 0, activeClients: 0,
            totalEmployees: 0, activeEmployees: 0, pendingExpenses: 0
        },
        invoicesByStatus: {},
        invoiceStatusChart: [],
        expenseCategoryChart: [],
        employeeDeptChart: [],
        monthlyTrend: [],
        recentInvoices: [],
        recentExpenses: []
    };
}
