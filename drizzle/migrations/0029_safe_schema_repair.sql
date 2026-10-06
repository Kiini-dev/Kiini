-- Safe schema repair migration
-- This migration safely checks for and adds missing columns and tables
-- It uses information_schema to check existence before making changes

-- 1. Add budgetAllocationId to expenses table if it doesn't exist
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'expenses' 
  AND COLUMN_NAME = 'budgetAllocationId'
  AND TABLE_SCHEMA = DATABASE()
);

SET @sql := IF(@col_exists = 0, 
  "ALTER TABLE `expenses` ADD COLUMN `budgetAllocationId` varchar(64) NULL AFTER `accountId`",
  "SELECT 'Column budgetAllocationId already exists in expenses table'"
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Add accountId to payments table if it doesn't exist
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'payments' 
  AND COLUMN_NAME = 'accountId'
  AND TABLE_SCHEMA = DATABASE()
);

SET @sql := IF(@col_exists = 0, 
  "ALTER TABLE `payments` ADD COLUMN `accountId` varchar(64) COMMENT 'COA account this payment is made to' AFTER `clientId`",
  "SELECT 'Column accountId already exists in payments table'"
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add chartOfAccountType to payments if it doesn't exist
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'payments' 
  AND COLUMN_NAME = 'chartOfAccountType'
  AND TABLE_SCHEMA = DATABASE()
);

SET @sql := IF(@col_exists = 0, 
  "ALTER TABLE `payments` ADD COLUMN `chartOfAccountType` enum('debit','credit') DEFAULT 'debit' AFTER `referenceNumber`",
  "SELECT 'Column chartOfAccountType already exists in payments table'"
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Create userRoles table if it doesn't exist
CREATE TABLE IF NOT EXISTS `userRoles` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`role` varchar(50) NULL,
	`roleName` varchar(100) NULL,
	`description` text NULL,
	`isActive` tinyint DEFAULT 1,
	`assignedBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `user_idx` (`userId`),
	KEY `is_active_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Ensure approvedAt column exists in expenses table
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'expenses' 
  AND COLUMN_NAME = 'approvedAt'
  AND TABLE_SCHEMA = DATABASE()
);

SET @sql := IF(@col_exists = 0, 
  "ALTER TABLE `expenses` ADD COLUMN `approvedAt` datetime AFTER `approvedBy`",
  "SELECT 'Column approvedAt already exists in expenses table'"
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
