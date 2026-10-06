/**
 * Organization Permissions Management Router
 * 
 * Handles CRUD operations for organization-level permission management,
 * allowing org admins to manage role-based access control within their organization.
 */

import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { customRoles, users, rolePermissions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Permission-restricted procedures
const viewProcedure = createFeatureRestrictedProcedure("org:settings:roles");
const editProcedure = createFeatureRestrictedProcedure("org:settings:roles");
const permissionsProcedure = createFeatureRestrictedProcedure("org:settings:permissions");

/**
 * Organization permission management schema
 */
const RoleInput = z.object({
  name: z.string().min(1, "Role name required"),
  displayName: z.string().optional(),
  description: z.string().optional(),
  baseRole: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const PermissionInput = z.object({
  userId: z.string(),
  permissions: z.record(z.string(), z.boolean()),
});

export const orgPermissionsRouter = router({
  /**
   * List all custom roles in the organization
   */
  listRoles: viewProcedure
    .input(z.object({ organizationId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const orgId = input?.organizationId || ctx.user.organizationId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Organization ID required",
          });
        }
        if (ctx.user.role !== "super_admin" && orgId !== ctx.user.organizationId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Organization context does not match the current user" });
        }

        const roles = await db
          .select()
          .from(customRoles)
          .where(eq(customRoles.organizationId, orgId));

        return roles.map((role) => ({
          id: role.id,
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          baseRole: role.baseRole,
          permissions: role.permissions ? JSON.parse(role.permissions as string) : [],
          isActive: role.isActive === 1,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        }));
      } catch (error) {
        console.error("Error fetching roles:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch roles",
        });
      }
    }),

  /**
   * Create a new custom role in the organization
   */
  createRole: editProcedure
    .input(RoleInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const orgId = ctx.user.organizationId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Organization context required",
          });
        }

        // Check if role name already exists in this org
        const existing = await db
          .select()
          .from(customRoles)
          .where(
            and(
              eq(customRoles.organizationId, orgId),
              eq(customRoles.name, input.name)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Role with this name already exists in your organization",
          });
        }

        const roleId = uuidv4();
        const now = new Date().toISOString().replace("T", " ").substring(0, 19);

        await db.insert(customRoles).values({
          id: roleId,
          organizationId: orgId,
          name: input.name,
          displayName: input.displayName || input.name,
          description: input.description || "",
          baseRole: input.baseRole || "staff",
          permissions: JSON.stringify(input.permissions || []),
          isActive: 1,
          createdAt: now,
          updatedAt: now,
        } as any);

        return {
          id: roleId,
          name: input.name,
          displayName: input.displayName || input.name,
          description: input.description || "",
          baseRole: input.baseRole || "staff",
          permissions: input.permissions || [],
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
      } catch (error) {
        console.error("Error creating role:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create role",
        });
      }
    }),

  /**
   * Update an existing custom role
   */
  updateRole: editProcedure
    .input(
      z.object({
        roleId: z.string(),
        ...RoleInput.omit({ name: true }).shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const orgId = ctx.user.organizationId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Organization context required",
          });
        }

        // Verify role belongs to this org
        const existing = await db
          .select()
          .from(customRoles)
          .where(
            and(
              eq(customRoles.id, input.roleId),
              eq(customRoles.organizationId, orgId)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Role not found",
          });
        }

        const now = new Date().toISOString().replace("T", " ").substring(0, 19);
        const updateData: Record<string, any> = {
          updatedAt: now,
        };

        if (input.displayName !== undefined) updateData.displayName = input.displayName;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.baseRole !== undefined) updateData.baseRole = input.baseRole;
        if (input.permissions !== undefined) updateData.permissions = JSON.stringify(input.permissions);
        if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;

        await db.update(customRoles).set(updateData).where(eq(customRoles.id, input.roleId));

        return {
          id: input.roleId,
          name: existing[0].name,
          displayName: updateData.displayName || existing[0].displayName,
          description: updateData.description || existing[0].description,
          baseRole: updateData.baseRole || existing[0].baseRole,
          permissions: updateData.permissions ? JSON.parse(updateData.permissions) : JSON.parse(existing[0].permissions as string || "[]"),
          isActive: updateData.isActive === 1,
          updatedAt: now,
        };
      } catch (error) {
        console.error("Error updating role:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update role",
        });
      }
    }),

  /**
   * Delete a custom role
   */
  deleteRole: editProcedure
    .input(z.object({ roleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const orgId = ctx.user.organizationId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Organization context required",
          });
        }

        // Check if any users have this role assigned
        const usersWithRole = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.customRoleId, input.roleId),
              eq(users.organizationId, orgId)
            )
          );

        if (usersWithRole.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Cannot delete role: ${usersWithRole.length} user(s) are assigned to this role. Reassign users first.`,
          });
        }

        // Verify role belongs to this org and delete
        const result = await db
          .delete(customRoles)
          .where(
            and(
              eq(customRoles.id, input.roleId),
              eq(customRoles.organizationId, orgId)
            )
          );

        return { success: true, message: "Role deleted successfully" };
      } catch (error) {
        console.error("Error deleting role:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete role",
        });
      }
    }),

  /**
   * Assign a custom role to a user
   */
  assignRoleToUser: editProcedure
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const orgId = ctx.user.organizationId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Organization context required",
          });
        }

        // Verify user exists and belongs to this org
        const userRecord = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.id, input.userId),
              eq(users.organizationId, orgId)
            )
          )
          .limit(1);

        if (userRecord.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // If roleId provided, verify it exists in this org
        if (input.roleId) {
          const roleRecord = await db
            .select()
            .from(customRoles)
            .where(
              and(
                eq(customRoles.id, input.roleId),
                eq(customRoles.organizationId, orgId)
              )
            )
            .limit(1);

          if (roleRecord.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Role not found",
            });
          }
        }

        // Update user's custom role
        await db
          .update(users)
          .set({
            customRoleId: input.roleId || null,
            updatedAt: new Date(),
          } as any)
          .where(eq(users.id, input.userId));

        return {
          success: true,
          userId: input.userId,
          roleId: input.roleId || null,
          message: input.roleId 
            ? "Role assigned successfully" 
            : "Custom role removed successfully",
        };
      } catch (error) {
        console.error("Error assigning role:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to assign role",
        });
      }
    }),

  /**
   * Get permission matrix for a role
   */
  getRolePermissions: viewProcedure
    .input(z.object({ roleId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return { roleId: input.roleId, permissions: {} };

        const orgId = ctx.user.organizationId;
        if (!orgId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Organization context required",
          });
        }

        const role = await db
          .select()
          .from(customRoles)
          .where(
            and(
              eq(customRoles.id, input.roleId),
              eq(customRoles.organizationId, orgId)
            )
          )
          .limit(1);

        if (role.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Role not found",
          });
        }

        const permissions = role[0].permissions 
          ? JSON.parse(role[0].permissions as string) 
          : [];

        return {
          roleId: input.roleId,
          roleName: role[0].name,
          baseRole: role[0].baseRole,
          permissions,
        };
      } catch (error) {
        console.error("Error fetching role permissions:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch role permissions",
        });
      }
    }),

  /**
   * Get organization feature access overview
   */
  getFeatureAccessMatrix: viewProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return { features: {}, roles: [] };

      const orgId = ctx.user.organizationId;
      if (!orgId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Organization context required",
        });
      }

      // Fetch all roles in organization
      const roles = await db
        .select()
        .from(customRoles)
        .where(eq(customRoles.organizationId, orgId));

      // Map standard feature categories (this would typically come from FEATURE_ACCESS)
      const featureCategories = {
        "org:settings:general": { label: "General Settings", category: "Settings" },
        "org:settings:company": { label: "Company Details", category: "Settings" },
        "org:settings:email": { label: "Email Configuration", category: "Settings" },
        "org:settings:security": { label: "Security Settings", category: "Security" },
        "org:settings:roles": { label: "Roles & Permissions", category: "Security" },
        "org:settings:backup": { label: "Backup & Restore", category: "Data" },
      };

      return {
        features: featureCategories,
        roles: roles.map((r) => ({
          id: r.id,
          name: r.name,
          displayName: r.displayName,
          permissions: r.permissions ? JSON.parse(r.permissions as string) : [],
        })),
      };
    } catch (error) {
      console.error("Error fetching feature access matrix:", error);
      if (error instanceof TRPCError) throw error;
      return { features: {}, roles: [] };
    }
  }),
});
