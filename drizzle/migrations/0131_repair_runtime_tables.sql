CREATE TABLE IF NOT EXISTS `systemSettings` (
  `id` varchar(64) NOT NULL,
  `category` varchar(100) NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` text,
  `dataType` enum('string','number','boolean','json') NOT NULL,
  `description` text,
  `isPublic` tinyint NOT NULL DEFAULT 0,
  `updatedBy` varchar(64) DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_key` (`category`,`key`),
  KEY `idx_category` (`category`),
  KEY `idx_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `userPermissions` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `resource` varchar(100) NOT NULL,
  `action` varchar(50) NOT NULL,
  `granted` tinyint NOT NULL DEFAULT 1,
  `grantedBy` varchar(64) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId_idx` (`userId`),
  KEY `resource_idx` (`resource`),
  KEY `granted_idx` (`granted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customRoles` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `displayName` varchar(255) NOT NULL,
  `description` text,
  `permissions` text,
  `baseRole` enum('user','admin','staff','accountant','client','super_admin','project_manager','hr','ict_manager','procurement_manager','sales_manager') DEFAULT 'staff',
  `isAdvanced` tinyint NOT NULL DEFAULT 0,
  `isSystem` tinyint NOT NULL DEFAULT 0,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdBy` varchar(64) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customRoles_orgId` (`organizationId`),
  KEY `idx_customRoles_name` (`name`),
  KEY `idx_customRoles_active` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reminders` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('invoice_due','estimate_expiry','project_milestone','payment_overdue','custom') NOT NULL,
  `frequency` enum('once','daily','weekly','monthly','custom') NOT NULL,
  `customDays` int DEFAULT NULL,
  `timing` enum('before','on','after') NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `emailEnabled` tinyint NOT NULL DEFAULT 1,
  `smsEnabled` tinyint NOT NULL DEFAULT 0,
  `emailTemplate` text,
  `smsTemplate` text,
  `createdBy` varchar(64) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `scheduledReminders` (
  `id` varchar(64) NOT NULL,
  `reminderId` varchar(64) NOT NULL,
  `referenceType` varchar(50) NOT NULL,
  `referenceId` varchar(64) NOT NULL,
  `recipientId` varchar(64) NOT NULL,
  `recipientType` enum('user','client') NOT NULL,
  `scheduledFor` datetime NOT NULL,
  `status` enum('pending','sent','failed','cancelled') NOT NULL DEFAULT 'pending',
  `sentAt` datetime DEFAULT NULL,
  `error` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'customRoleId'
);
SET @sql := IF(
  @column_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `customRoleId` varchar(64) DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
