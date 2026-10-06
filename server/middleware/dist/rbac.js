"use strict";
/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * This module provides middleware functions to enforce role-based access control
 * for sensitive operations like approving expenses, invoices, and estimates.
 */
exports.__esModule = true;
exports.getUserPermissions = exports.validateApprovalAction = exports.isSuperAdmin = exports.isAdmin = exports.canApproveHR = exports.canApproveFinancial = exports.requireRole = exports.requirePermission = exports.hasPermission = exports.PERMISSIONS = exports.ROLES = void 0;
var server_1 = require("@trpc/server");
/**
 * Role hierarchy and permissions
 */
exports.ROLES = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    ACCOUNTANT: "accountant",
    HR: "hr",
    STAFF: "staff",
    CLIENT: "client",
    PROJECT_MANAGER: "project_manager",
    SALES_MANAGER: "sales_manager",
    PROCUREMENT_MANAGER: "procurement_manager",
    ICT_MANAGER: "ict_manager"
};
/**
 * Permission definitions for approval operations
 */
exports.PERMISSIONS = {
    APPROVE_EXPENSE: ["super_admin", "admin", "accountant", "project_manager"],
    APPROVE_INVOICE: ["super_admin", "admin", "accountant"],
    APPROVE_ESTIMATE: ["super_admin", "admin", "accountant", "project_manager"],
    APPROVE_PAYMENT: ["super_admin", "admin", "accountant"],
    APPROVE_LEAVE: ["super_admin", "admin", "hr", "project_manager"],
    APPROVE_PAYROLL: ["super_admin", "admin", "hr"],
    DELETE_EXPENSE: ["super_admin", "admin", "accountant", "project_manager"],
    DELETE_INVOICE: ["super_admin", "admin", "accountant"],
    DELETE_ESTIMATE: ["super_admin", "admin", "accountant", "project_manager"],
    MANAGE_USERS: ["super_admin", "admin", "ict_manager"],
    MANAGE_ROLES: ["super_admin"],
    MANAGE_PROJECTS: ["super_admin", "admin", "project_manager"],
    MANAGE_TEAM: ["super_admin", "admin", "project_manager"],
    VIEW_ALL_FINANCIAL: ["super_admin", "admin", "accountant"],
    VIEW_ALL_HR: ["super_admin", "admin", "hr", "accountant"]
};
/**
 * Check if a user has permission to perform an action
 */
function hasPermission(userRole, permission) {
    var allowedRoles = exports.PERMISSIONS[permission];
    return allowedRoles.includes(userRole);
}
exports.hasPermission = hasPermission;
/**
 * Middleware to require specific permission
 */
function requirePermission(permission) {
    return function (ctx) {
        if (!ctx.user) {
            throw new server_1.TRPCError({
                code: "UNAUTHORIZED",
                message: "You must be logged in to perform this action"
            });
        }
        if (!hasPermission(ctx.user.role, permission)) {
            throw new server_1.TRPCError({
                code: "FORBIDDEN",
                message: "You do not have permission to perform this action. Required permission: " + permission
            });
        }
        return ctx;
    };
}
exports.requirePermission = requirePermission;
/**
 * Middleware to require specific role(s)
 */
function requireRole(allowedRoles) {
    return function (ctx) {
        if (!ctx.user) {
            throw new server_1.TRPCError({
                code: "UNAUTHORIZED",
                message: "You must be logged in to perform this action"
            });
        }
        if (!allowedRoles.includes(ctx.user.role)) {
            throw new server_1.TRPCError({
                code: "FORBIDDEN",
                message: "Access denied. Required role: " + allowedRoles.join(" or ") + ". Your role: " + ctx.user.role
            });
        }
        return ctx;
    };
}
exports.requireRole = requireRole;
/**
 * Check if user can approve financial documents
 */
function canApproveFinancial(userRole) {
    return hasPermission(userRole, "APPROVE_EXPENSE");
}
exports.canApproveFinancial = canApproveFinancial;
/**
 * Check if user can approve HR documents
 */
function canApproveHR(userRole) {
    return hasPermission(userRole, "APPROVE_LEAVE");
}
exports.canApproveHR = canApproveHR;
/**
 * Check if user is admin or super admin
 */
function isAdmin(userRole) {
    return userRole === exports.ROLES.SUPER_ADMIN || userRole === exports.ROLES.ADMIN;
}
exports.isAdmin = isAdmin;
/**
 * Check if user is super admin
 */
function isSuperAdmin(userRole) {
    return userRole === exports.ROLES.SUPER_ADMIN;
}
exports.isSuperAdmin = isSuperAdmin;
/**
 * Validate approval action
 * Ensures only authorized users can approve documents
 */
function validateApprovalAction(userRole, documentType) {
    var hasAccess = false;
    switch (documentType) {
        case "expense":
            hasAccess = hasPermission(userRole, "APPROVE_EXPENSE");
            break;
        case "invoice":
            hasAccess = hasPermission(userRole, "APPROVE_INVOICE");
            break;
        case "estimate":
            hasAccess = hasPermission(userRole, "APPROVE_ESTIMATE");
            break;
        case "payment":
            hasAccess = hasPermission(userRole, "APPROVE_PAYMENT");
            break;
        case "leave":
            hasAccess = hasPermission(userRole, "APPROVE_LEAVE");
            break;
        case "payroll":
            hasAccess = hasPermission(userRole, "APPROVE_PAYROLL");
            break;
        default:
            throw new server_1.TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid document type"
            });
    }
    if (!hasAccess) {
        throw new server_1.TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to approve " + documentType + "s. Only Super Admin, Admin, and " + (documentType === "leave" || documentType === "payroll" ? "HR" : "Accountant") + " roles can approve this type of document."
        });
    }
}
exports.validateApprovalAction = validateApprovalAction;
/**
 * Get user permissions based on role
 */
function getUserPermissions(userRole) {
    var permissions = [];
    for (var _i = 0, _a = Object.entries(exports.PERMISSIONS); _i < _a.length; _i++) {
        var _b = _a[_i], permission = _b[0], allowedRoles = _b[1];
        if (allowedRoles.includes(userRole)) {
            permissions.push(permission);
        }
    }
    return permissions;
}
exports.getUserPermissions = getUserPermissions;
