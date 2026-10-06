/**
 * Backend Database Migration & Setup Guide
 * 
 * This file provides SQL migrations and setup instructions for supporting
 * the Enhanced Role Management and Custom Dashboard Builder features
 */

// ============================================================================
// DATABASE MIGRATIONS
// ============================================================================

/**
 * Migration 1: Extend permissions system
 * File: drizzle/migration_enhanced_permissions.sql
 * 
 * This adds more granular permission tracking
 */

export const MIGRATION_ENHANCED_PERMISSIONS = `
-- Add permission metadata table if not exists
CREATE TABLE IF NOT EXISTS permission_metadata (
  id VARCHAR(64) PRIMARY KEY,
  permissionId VARCHAR(64) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  icon VARCHAR(50),
  action VARCHAR(50),
  resource VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE,
  INDEX idx_category (category),
  INDEX idx_action (action)
);

-- Add columns to roles table for better tracking
ALTER TABLE userRoles 
ADD COLUMN IF NOT EXISTS permissionCount INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS userCount INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Create role permission summary view
CREATE OR REPLACE VIEW role_permission_summary AS
SELECT 
  r.id,
  r.roleName,
  r.description,
  COUNT(DISTINCT rp.permissionId) as permissionCount,
  COUNT(DISTINCT ur.userId) as userCount,
  MAX(rp.createdAt) as lastModified
FROM userRoles r
LEFT JOIN rolePermissions rp ON r.id = rp.roleId
LEFT JOIN userRoles ur ON r.id = ur.role
GROUP BY r.id, r.roleName, r.description;
`;

/**
 * Migration 2: Dashboard layout storage
 * File: drizzle/migration_dashboard_layouts.sql
 * 
 * Creates tables for storing custom dashboard layouts
 */

export const MIGRATION_DASHBOARD_LAYOUTS = `
-- DashboardLayouts table
CREATE TABLE IF NOT EXISTS dashboardLayouts (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  isDefault BOOLEAN DEFAULT FALSE,
  gridColumns INT DEFAULT 6,
  config JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_isDefault (isDefault),
  UNIQUE KEY uk_user_default (userId, isDefault)
);

-- DashboardWidgets table
CREATE TABLE IF NOT EXISTS dashboardWidgets (
  id VARCHAR(64) PRIMARY KEY,
  layoutId VARCHAR(64) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  size VARCHAR(20) NOT NULL DEFAULT 'medium',
  row INT NOT NULL,
  col INT NOT NULL,
  refreshInterval INT,
  config JSON,
  position INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (layoutId) REFERENCES dashboardLayouts(id) ON DELETE CASCADE,
  INDEX idx_layoutId (layoutId),
  INDEX idx_type (type),
  INDEX idx_position (position)
);

-- WidgetData cache table (for performance)
CREATE TABLE IF NOT EXISTS dashboardWidgetData (
  id VARCHAR(64) PRIMARY KEY,
  widgetId VARCHAR(64) NOT NULL,
  dataType VARCHAR(50),
  data JSON NOT NULL,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ttl INT DEFAULT 3600,
  FOREIGN KEY (widgetId) REFERENCES dashboardWidgets(id) ON DELETE CASCADE,
  INDEX idx_widgetId (widgetId),
  INDEX idx_lastUpdated (lastUpdated)
);
`;

/**
 * Migration 3: Seed initial permissions
 * File: drizzle/seed_enhanced_permissions.sql
 */

export const SEED_INITIAL_PERMISSIONS = `
-- Insert permission metadata for all new permissions

-- Invoice Permissions
INSERT IGNORE INTO permission_metadata (id, permissionId, label, description, category, action, resource) VALUES
('pm_inv_view', 'invoice.view', 'View Invoices', 'Can view and list invoices', 'Invoices', 'view', 'invoices'),
('pm_inv_create', 'invoice.create', 'Create Invoices', 'Can create new invoices', 'Invoices', 'create', 'invoices'),
('pm_inv_edit', 'invoice.edit', 'Edit Invoices', 'Can edit existing invoices', 'Invoices', 'edit', 'invoices'),
('pm_inv_delete', 'invoice.delete', 'Delete Invoices', 'Can delete invoices', 'Invoices', 'delete', 'invoices'),
('pm_inv_approve', 'invoice.approve', 'Approve Invoices', 'Can approve pending invoices', 'Invoices', 'approve', 'invoices'),
('pm_inv_export', 'invoice.export', 'Export Invoices', 'Can export invoices to PDF/Excel', 'Invoices', 'export', 'invoices');

-- Estimate Permissions
INSERT IGNORE INTO permission_metadata (id, permissionId, label, description, category, action, resource) VALUES
('pm_est_view', 'estimate.view', 'View Estimates', 'Can view and list estimates', 'Estimates', 'view', 'estimates'),
('pm_est_create', 'estimate.create', 'Create Estimates', 'Can create new estimates', 'Estimates', 'create', 'estimates'),
('pm_est_edit', 'estimate.edit', 'Edit Estimates', 'Can edit existing estimates', 'Estimates', 'edit', 'estimates'),
('pm_est_delete', 'estimate.delete', 'Delete Estimates', 'Can delete estimates', 'Estimates', 'delete', 'estimates'),
('pm_est_approve', 'estimate.approve', 'Approve Estimates', 'Can approve estimates', 'Estimates', 'approve', 'estimates'),
('pm_est_reject', 'estimate.reject', 'Reject Estimates', 'Can reject estimates', 'Estimates', 'reject', 'estimates');

-- Additional permissions follow similar pattern...
`;

// ============================================================================
// TYPESCRIPT/DRIZZLE SCHEMA UPDATES
// ============================================================================

export const DRIZZLE_SCHEMA_UPDATES = `
/**
 * Update to drizzle/schema.ts
 * Add these new table definitions
 */

import { mysqlTable, varchar, text, timestamp, int, boolean, json } from "drizzle-orm/mysql-core";

// Dashboard Layouts
export const dashboardLayouts = mysqlTable("dashboardLayouts", {
  id: varchar({ length: 64 }).primaryKey(),
  userId: varchar({ length: 64 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  isDefault: boolean().default(false),
  gridColumns: int().default(6),
  config: json(),
  createdAt: timestamp({ mode: "string" }).defaultNow(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow(),
});

// Dashboard Widgets
export const dashboardWidgets = mysqlTable("dashboardWidgets", {
  id: varchar({ length: 64 }).primaryKey(),
  layoutId: varchar({ length: 64 }).notNull(),
  type: varchar({ length: 50 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  size: varchar({ length: 20 }).notNull().default("medium"),
  row: int().notNull(),
  col: int().notNull(),
  refreshInterval: int(),
  config: json(),
  position: int(),
  createdAt: timestamp({ mode: "string" }).defaultNow(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow(),
});

// Widget Data Cache
export const dashboardWidgetData = mysqlTable("dashboardWidgetData", {
  id: varchar({ length: 64 }).primaryKey(),
  widgetId: varchar({ length: 64 }).notNull(),
  dataType: varchar({ length: 50 }),
  data: json().notNull(),
  lastUpdated: timestamp({ mode: "string" }).defaultNow().onUpdateNow(),
  ttl: int().default(3600),
});

// Permission Metadata
export const permissionMetadata = mysqlTable("permission_metadata", {
  id: varchar({ length: 64 }).primaryKey(),
  permissionId: varchar({ length: 64 }).notNull().unique(),
  label: varchar({ length: 255 }).notNull(),
  description: text(),
  category: varchar({ length: 100 }),
  icon: varchar({ length: 50 }),
  action: varchar({ length: 50 }),
  resource: varchar({ length: 100 }),
  createdAt: timestamp({ mode: "string" }).defaultNow(),
});
`;

// ============================================================================
// BACKEND ROUTER IMPLEMENTATIONS
// ============================================================================

export const BACKEND_ROUTER_TEMPLATE = `
/**
 * Example: server/routers/enhancedRoles.ts
 * Implements enhanced role management endpoints
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { db } from "../db";

export const enhancedRolesRouter = router({
  // Get all permissions with metadata
  getPermissions: protectedProcedure.query(async ({ ctx }) => {
    // Only admins can view all permissions
    if (!["super_admin", "admin"].includes(ctx.user.role)) {
      throw new Error("Access denied");
    }

    const permissions = await db.query.permissionMetadata.findMany();
    return permissions;
  }),

  // Get permissions by category
  getPermissionsByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!["super_admin", "admin"].includes(ctx.user.role)) {
        throw new Error("Access denied");
      }

      const permissions = await db.query.permissionMetadata.findMany({
        where: (table, { eq }) => eq(table.category, input.category),
      });

      return permissions;
    }),

  // Update role permissions
  updateRolePermissions: protectedProcedure
    .input(z.object({
      roleId: z.string(),
      permissions: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!["super_admin", "admin"].includes(ctx.user.role)) {
        throw new Error("Access denied");
      }

      // Validate role exists and is not system role
      const role = await db.query.userRoles.findFirst({
        where: (table, { eq }) => eq(table.id, input.roleId),
      });

      if (!role || ["super_admin", "admin"].includes(role.roleName || "")) {
        throw new Error("Cannot modify system roles");
      }

      // Clear existing permissions
      await db.delete(rolePermissions)
        .where((table) => table.roleId === input.roleId);

      // Add new permissions
      for (const permissionName of input.permissions) {
        const perm = await db.query.permissions.findFirst({
          where: (table, { eq }) => eq(table.permissionName, permissionName),
        });

        if (perm) {
          await db.insert(rolePermissions).values({
            id: \`rp_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
            roleId: input.roleId,
            permissionId: perm.id,
          });
        }
      }

      // Log the change
      await db.logActivity({
        userId: ctx.user.id,
        action: "role_permissions_updated",
        entityType: "role",
        entityId: input.roleId,
        description: \`Updated permissions for role: \${role.roleName}\`,
      });

      return { success: true };
    }),
});

/**
 * Example: server/routers/dashboard.ts
 * Implements dashboard layout management
 */

export const dashboardRouter = router({
  // Get user's dashboard layout
  getLayout: protectedProcedure.query(async ({ ctx }) => {
    let layout = await db.query.dashboardLayouts.findFirst({
      where: (table, { and, eq }) => 
        and(
          eq(table.userId, ctx.user.id),
          eq(table.isDefault, true)
        ),
    });

    if (!layout) {
      // Create default layout if doesn't exist
      const layoutId = \`layout_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
      layout = {
        id: layoutId,
        userId: ctx.user.id,
        name: "My Dashboard",
        isDefault: true,
        gridColumns: 6,
        widgets: [],
      };

      await db.insert(dashboardLayouts).values(layout);
    }

    // Load widgets for this layout
    const widgets = await db.query.dashboardWidgets.findMany({
      where: (table, { eq }) => eq(table.layoutId, layout!.id),
      orderBy: (table, { asc }) => asc(table.position),
    });

    return { ...layout, widgets };
  }),

  // Save/update dashboard layout
  saveLayout: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      gridColumns: z.number(),
      widgets: z.array(z.object({
        id: z.string(),
        type: z.string(),
        title: z.string(),
        size: z.enum(["small", "medium", "large"]),
        row: z.number(),
        col: z.number(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user owns this layout
      const layout = await db.query.dashboardLayouts.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
      });

      if (!layout || layout.userId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      // Update layout
      await db.update(dashboardLayouts)
        .set({
          name: input.name,
          gridColumns: input.gridColumns,
          updatedAt: new Date().toISOString(),
        })
        .where((table) => table.id === input.id);

      // Delete old widgets
      await db.delete(dashboardWidgets)
        .where((table) => table.layoutId === input.id);

      // Insert new widgets
      for (let i = 0; i < input.widgets.length; i++) {
        const widget = input.widgets[i];
        await db.insert(dashboardWidgets).values({
          id: widget.id,
          layoutId: input.id,
          type: widget.type,
          title: widget.title,
          size: widget.size,
          row: widget.row,
          col: widget.col,
          position: i,
        });
      }

      return { success: true };
    }),

  // Get data for a specific widget
  getWidgetData: protectedProcedure
    .input(z.object({
      widgetId: z.string(),
      type: z.string(),
    }))
    .query(async ({ input }) => {
      // Implement widget-specific data fetching
      // This could fetch from various sources based on widget type
      
      switch (input.type) {
        case "revenue":
          // Fetch revenue by client data
          return {}; // TODO: Implement
        case "expenses":
          // Fetch expenses by category
          return {}; // TODO: Implement
        // ... more cases
      }
    }),
});
`;

// ============================================================================
// IMPLEMENTATION CHECKLIST
// ============================================================================

export const IMPLEMENTATION_CHECKLIST = \`
## Backend Implementation Checklist

### Database Setup (Day 1)
- [ ] Create migration files
- [ ] Run migrations on dev database
- [ ] Update Drizzle schema
- [ ] Seed initial permission metadata
- [ ] Test database queries

### API Routes (Day 2)
- [ ] Create enhanced-roles router
- [ ] Create dashboard router
- [ ] Implement permission endpoints
- [ ] Implement dashboard CRUD operations
- [ ] Add proper error handling
- [ ] Add activity logging

### Security & Validation (Day 2-3)
- [ ] Add permission checks on backend
- [ ] Validate user ownership of layouts
- [ ] Add rate limiting
- [ ] Sanitize JSON inputs
- [ ] Test with invalid data

### Testing (Day 3-4)
- [ ] Unit tests for permission logic
- [ ] Integration tests for API routes
- [ ] Test permission enforcement
- [ ] Test dashboard CRUD operations
- [ ] Load testing with large datasets

### Documentation (Day 4)
- [ ] Document new API endpoints
- [ ] Create API usage examples
- [ ] Document permission matrix
- [ ] Create troubleshooting guide

### Deployment (Day 5)
- [ ] Database migrations in production
- [ ] Deploy API changes
- [ ] Monitor error logs
- [ ] Performance monitoring
\`;
