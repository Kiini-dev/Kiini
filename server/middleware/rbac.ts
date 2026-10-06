/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * This module provides middleware functions to enforce role-based access control
 * for sensitive operations like approving expenses, invoices, and estimates.
 */

import { TRPCError } from "@trpc/server";

/**
 * Role hierarchy and permissions
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  ACCOUNTANT: "accountant",
  HR: "hr",
  STAFF: "staff",
  CLIENT: "client",
  PROJECT_MANAGER: "project_manager",
  SALES_MANAGER: "sales_manager",
  PROCUREMENT_MANAGER: "procurement_manager",
  ICT_MANAGER: "ict_manager",
} as const;

/**
 * Permission definitions for approval operations
 */
export const PERMISSIONS = {
  APPROVE_EXPENSE: ["super_admin", "admin", "accountant", "project_manager"],
  APPROVE_INVOICE: ["super_admin", "admin", "accountant"],
  APPROVE_ESTIMATE: ["super_admin", "admin", "accountant", "project_manager"],
  APPROVE_PAYMENT: ["super_admin", "admin", "accountant"],
  APPROVE_LEAVE: ["super_admin", "hr"],
  APPROVE_PAYROLL: ["super_admin", "admin", "hr"],
  DELETE_EXPENSE: ["super_admin", "admin", "accountant", "project_manager"],
  DELETE_INVOICE: ["super_admin", "admin", "accountant"],
  DELETE_ESTIMATE: ["super_admin", "admin", "accountant", "project_manager"],
  MANAGE_USERS: ["super_admin", "admin"],
  MANAGE_ROLES: ["super_admin"],
  MANAGE_PROJECTS: ["super_admin", "admin", "project_manager"],
  MANAGE_TEAM: ["super_admin", "admin", "project_manager"],
  VIEW_ALL_FINANCIAL: ["super_admin", "admin", "accountant"],
  VIEW_ALL_HR: ["super_admin", "admin", "hr", "project_manager"],
} as const;

/**
 * Check if a user has permission to perform an action
 */
export function hasPermission(
  userRole: string,
  permission: keyof typeof PERMISSIONS
): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(userRole as any);
}

/**
 * Middleware to require specific permission
 */
export function requirePermission(permission: keyof typeof PERMISSIONS) {
  return (ctx: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action",
      });
    }

    if (!hasPermission(ctx.user.role, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You do not have permission to perform this action. Required permission: ${permission}`,
      });
    }

    return ctx;
  };
}

/**
 * Middleware to require specific role(s)
 */
export function requireRole(allowedRoles: string[]) {
  return (ctx: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action",
      });
    }

    if (!allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${ctx.user.role}`,
      });
    }

    return ctx;
  };
}

/**
 * Check if user can approve financial documents
 */
export function canApproveFinancial(userRole: string): boolean {
  return hasPermission(userRole, "APPROVE_EXPENSE");
}

/**
 * Check if user can approve HR documents
 */
export function canApproveHR(userRole: string): boolean {
  return hasPermission(userRole, "APPROVE_LEAVE");
}

/**
 * Check if user is admin or super admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userRole: string): boolean {
  return userRole === ROLES.SUPER_ADMIN;
}

/**
 * Validate approval action
 * Ensures only authorized users can approve documents
 */
export function validateApprovalAction(
  userRole: string,
  documentType: "expense" | "invoice" | "estimate" | "payment" | "leave" | "payroll"
): void {
  let hasAccess = false;

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
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid document type",
      });
  }

  if (!hasAccess) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: documentType === "leave"
        ? "You do not have permission to approve leave. Only HR Managers and Super Admins can approve leave requests."
        : `You do not have permission to approve ${documentType}s. Only Super Admin, Admin, and ${
            documentType === "payroll" ? "HR" : "Accountant"
          } roles can approve this type of document.`,
    });
  }
}

/**
 * Get user permissions based on role
 */
export function getUserPermissions(userRole: string): string[] {
  const permissions: string[] = [];

  for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
    if (allowedRoles.includes(userRole as any)) {
      permissions.push(permission);
    }
  }

  return permissions;
}
