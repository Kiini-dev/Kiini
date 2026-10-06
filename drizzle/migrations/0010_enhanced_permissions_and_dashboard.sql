-- Migration: Enhanced Permissions and Dashboard Customization
-- Date: 2026-02-25
-- Description: Adds tables for granular permission management and custom dashboard layouts

-- ============================================================================
-- ENHANCED PERMISSIONS SYSTEM
-- ============================================================================

-- ensure rolePermissions exists before attempting alteration (some deployments skipped initial creation)
CREATE TABLE IF NOT EXISTS `rolePermissions` (
  `id` varchar(64) PRIMARY KEY NOT NULL,
  `roleId` varchar(64) NOT NULL,
  `permissionId` varchar(64) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create permission_metadata table for storing permission definitions
CREATE TABLE IF NOT EXISTS `permission_metadata` (
  `id` varchar(64) PRIMARY KEY NOT NULL,
  `permission_id` varchar(100) NOT NULL UNIQUE,
  `label` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) NOT NULL,
  `icon` varchar(100),
  `is_system` tinyint DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_category` (`category`),
  KEY `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Extend rolePermissions to support metadata
ALTER TABLE `rolePermissions`
  ADD COLUMN `permission_label` varchar(255),
  ADD COLUMN `permission_category` varchar(100),
  ADD COLUMN `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ============================================================================
-- DASHBOARD CUSTOMIZATION SYSTEM
-- ============================================================================

-- ensure users.id has correct length; some older installs used a different type
ALTER TABLE `users` MODIFY COLUMN `id` varchar(64) NOT NULL;

-- if the dashboardLayouts table already exists with an incompatible column type
-- this ALTER will correct it (will error if table absent which is acceptable)
ALTER TABLE `dashboardLayouts` MODIFY COLUMN `user_id` varchar(64) NOT NULL;

-- drop the foreign key if it exists (warnings can be ignored; helps avoid incompatibility errors)
ALTER TABLE `dashboardLayouts` DROP FOREIGN KEY `dashboardLayouts_ibfk_1`;

-- Create dashboardLayouts table for storing user dashboard configurations
CREATE TABLE IF NOT EXISTS `dashboardLayouts` (
  `id` varchar(64) PRIMARY KEY NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'My Dashboard',
  `description` text,
  `grid_columns` int DEFAULT 6,
  `is_default` tinyint DEFAULT 0,
  `layout_data` json,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_user_default` (`user_id`, `is_default`) USING BTREE,
  KEY `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create dashboardWidgets table for storing widget definitions in layouts
CREATE TABLE IF NOT EXISTS `dashboardWidgets` (
  `id` varchar(64) PRIMARY KEY NOT NULL,
  `layout_id` varchar(64) NOT NULL,
  `widget_type` varchar(100) NOT NULL,
  `widget_title` varchar(255),
  `widget_size` varchar(10) DEFAULT 'medium',
  `row_index` int DEFAULT 0,
  `col_index` int DEFAULT 0,
  `refresh_interval` int DEFAULT 300,
  `config` json,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_layout_id` (`layout_id`),
  KEY `idx_widget_type` (`widget_type`),
  FOREIGN KEY (`layout_id`) REFERENCES `dashboardLayouts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Optional: Create dashboardWidgetData for caching widget data (improves performance)
CREATE TABLE IF NOT EXISTS `dashboardWidgetData` (
  `id` varchar(64) PRIMARY KEY NOT NULL,
  `widget_id` varchar(64) NOT NULL,
  `data_key` varchar(255),
  `data_value` json,
  `cached_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  KEY `idx_widget_id` (`widget_id`),
  KEY `idx_expires_at` (`expires_at`),
  FOREIGN KEY (`widget_id`) REFERENCES `dashboardWidgets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- AUDIT LOGGING FOR PERMISSION CHANGES
-- ============================================================================

-- Create permissionAuditLog table for tracking permission changes
CREATE TABLE IF NOT EXISTS `permissionAuditLog` (
  `id` varchar(64) PRIMARY KEY NOT NULL,
  `role_id` varchar(64),
  `user_id` varchar(64),
  `permission_id` varchar(100),
  `permission_label` varchar(255),
  `action` varchar(50) NOT NULL,
  `changed_by` varchar(64),
  `old_value` text,
  `new_value` text,
  `reason` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_role_id` (`role_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_changed_by` (`changed_by`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Optimize common queries
ALTER TABLE `rolePermissions` ADD INDEX `idx_user_role_permission` (`user_id`, `role_id`, `permission_id`);
ALTER TABLE `dashboardLayouts` ADD INDEX `idx_dashboard_user_default` (`user_id`, `is_default`);
ALTER TABLE `dashboardWidgets` ADD INDEX `idx_widget_layout_type` (`layout_id`, `widget_type`);
