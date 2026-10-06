"use strict";
/**
 * Organization Isolation Middleware - STRICT MODE
 *
 * CRITICAL: Implements strict multi-tenant data isolation.
 * - Org-scoped users ONLY see their org's data
 * - Global platform admins (no organizationId) see all data ONLY for explicitly global procedures
 * - Cross-org access attempts are REJECTED with FORBIDDEN errors
 * - All data access requires explicit org context or isolation verification
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.withOrgId = exports.verifyOrgOwnership = exports.isGlobalUser = exports.requireGlobalScope = exports.requireOrgScope = exports.enforceOrgScope = exports.withOrgScope = exports.getOrgFilter = void 0;
var server_1 = require("@trpc/server");
var drizzle_orm_1 = require("drizzle-orm");
/**
 * DEFENSIVE: Get the effective organization filter for a query.
 * CRITICAL: For org-scoped users, this ALWAYS returns an org filter.
 * For global users, this allows no filter (platform admin access).
 *
 * USAGE: Use in queries where global users should see all data.
 * For org-restricted queries, use enforceOrgScope() instead.
 */
function getOrgFilter(ctx, orgIdColumn) {
    var _a;
    var orgId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.organizationId;
    if (!orgId)
        return undefined; // Global user — no filter (platform admin)
    return drizzle_orm_1.eq(orgIdColumn, orgId); // Org user — strict isolation
}
exports.getOrgFilter = getOrgFilter;
/**
 * MANDATORY: Combine an org filter with other conditions.
 * For org-scoped users, the org filter is ALWAYS included.
 * For global users, allows unfiltered access.
 */
function withOrgScope(ctx, orgIdColumn) {
    var otherConditions = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        otherConditions[_i - 2] = arguments[_i];
    }
    var orgFilter = getOrgFilter(ctx, orgIdColumn);
    var conditions = __spreadArrays([orgFilter], otherConditions).filter(Boolean);
    if (conditions.length === 0)
        return undefined;
    if (conditions.length === 1)
        return conditions[0];
    return drizzle_orm_1.and.apply(void 0, conditions);
}
exports.withOrgScope = withOrgScope;
/**
 * STRICT: Enforce organization scope for org-restricted procedures.
 * CRITICAL: This MUST be used for all org-scoped queries and mutations.
 * - Org-scoped users ALWAYS get an org filter
 * - Global users CANNOT access org-restricted procedures
 *
 * USAGE: Use this for routers that serve only org-scoped users (HR, Projects, Invoices, etc.)
 */
function enforceOrgScope(ctx, orgIdColumn) {
    var _a;
    var otherConditions = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        otherConditions[_i - 2] = arguments[_i];
    }
    var orgId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.organizationId;
    if (!orgId) {
        throw new server_1.TRPCError({
            code: "FORBIDDEN",
            message: "This resource requires organization context. Global users cannot access org-scoped data directly."
        });
    }
    var conditions = __spreadArrays([drizzle_orm_1.eq(orgIdColumn, orgId)], otherConditions).filter(Boolean);
    if (conditions.length === 1)
        return conditions[0];
    return drizzle_orm_1.and.apply(void 0, conditions);
}
exports.enforceOrgScope = enforceOrgScope;
/**
 * Ensure a user is scoped to an organization.
 * Throws FORBIDDEN if user has no organizationId.
 */
function requireOrgScope(ctx) {
    var _a;
    var orgId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.organizationId;
    if (!orgId) {
        throw new server_1.TRPCError({
            code: "FORBIDDEN",
            message: "This resource requires organization context"
        });
    }
    return orgId;
}
exports.requireOrgScope = requireOrgScope;
/**
 * Ensure a user is a global (platform) user — not org-scoped.
 * Only platform admins should access tenant management, pricing tiers, etc.
 */
function requireGlobalScope(ctx) {
    var _a;
    if ((_a = ctx.user) === null || _a === void 0 ? void 0 : _a.organizationId) {
        throw new server_1.TRPCError({
            code: "FORBIDDEN",
            message: "This resource is only accessible to platform administrators"
        });
    }
}
exports.requireGlobalScope = requireGlobalScope;
/**
 * Check if user is a global (platform-level) user
 */
function isGlobalUser(ctx) {
    var _a;
    return !((_a = ctx.user) === null || _a === void 0 ? void 0 : _a.organizationId);
}
exports.isGlobalUser = isGlobalUser;
/**
 * STRICT: Verify user owns a specific record.
 * CRITICAL: Always used before allowing access to a specific record by ID.
 * Compares the record's organizationId with the user's organizationId.
 * Throws FORBIDDEN if they don't match.
 *
 * EXCEPTION: Global super_admin (role='super_admin' with no org) can access any record.
 */
function verifyOrgOwnership(ctx, recordOrgId) {
    var _a, _b;
    var userOrgId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.organizationId;
    var userRole = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.role;
    // Global super_admin bypass: no organizationId, role is super_admin
    if (!userOrgId && userRole === "super_admin") {
        return; // Platform admin — allowed to access any org's records
    }
    // Org-scoped user must have an orgId
    if (!userOrgId) {
        throw new server_1.TRPCError({
            code: "FORBIDDEN",
            message: "User is not assigned to any organization. Please contact your administrator."
        });
    }
    // Record must belong to the user's organization
    if (userOrgId !== recordOrgId) {
        throw new server_1.TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to access this resource. It belongs to a different organization."
        });
    }
}
exports.verifyOrgOwnership = verifyOrgOwnership;
/**
 * Attach the organizationId to a record before insert/update.
 * For org-scoped users, enforces their org context.
 * For global users, preserves data as-is (for platform operations).
 */
function withOrgId(ctx, data) {
    var _a;
    var orgId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.organizationId;
    if (!orgId)
        return data; // Global user
    return __assign(__assign({}, data), { organizationId: orgId }); // Org user — enforce org context
}
exports.withOrgId = withOrgId;
