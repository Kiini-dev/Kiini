-- ============================================================================
-- Fix: Create dashboard tables and attendance table
-- Fixes FK collation mismatches and missing tables from migrations 0010 & 0036
-- ============================================================================

-- 1. Dashboard Layouts (uses utf8mb4_general_ci for compatibility with users.id)
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
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_dashboard_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Dashboard Widgets
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
  CONSTRAINT `fk_widget_layout` FOREIGN KEY (`layout_id`) REFERENCES `dashboardLayouts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Dashboard Widget Data
CREATE TABLE IF NOT EXISTS `dashboardWidgetData` (
  `id` varchar(64) PRIMARY KEY NOT NULL,
  `widget_id` varchar(64) NOT NULL,
  `data_key` varchar(255),
  `data_value` json,
  `cached_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL,
  KEY `idx_widget_id` (`widget_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `fk_widgetdata_widget` FOREIGN KEY (`widget_id`) REFERENCES `dashboardWidgets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Attendance table (uses utf8mb4_general_ci for compatibility with employees.id)
CREATE TABLE IF NOT EXISTS `attendance` (
    `id` VARCHAR(64) PRIMARY KEY,
    `employeeId` VARCHAR(64) NOT NULL,
    `date` DATE NOT NULL,
    `status` ENUM('present', 'absent', 'leave', 'half_day', 'remote') DEFAULT 'absent' NOT NULL,
    `checkInTime` TIME NULL,
    `checkOutTime` TIME NULL,
    `notes` TEXT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `employee_attendance_idx` (`employeeId`),
    INDEX `attendance_date_idx` (`date`),
    INDEX `attendance_status_idx` (`status`),
    CONSTRAINT `fk_attendance_employee` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
