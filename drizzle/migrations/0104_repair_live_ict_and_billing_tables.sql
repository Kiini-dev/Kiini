-- Repair tables and columns required by ICT monitoring and billing APIs.

CREATE TABLE IF NOT EXISTS `emailQueue` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `recipientEmail` varchar(320) NOT NULL,
  `recipientName` varchar(255),
  `subject` varchar(500) NOT NULL,
  `htmlContent` text NOT NULL,
  `textContent` text,
  `eventType` varchar(100) NOT NULL,
  `entityType` varchar(100),
  `entityId` varchar(64),
  `userId` varchar(64),
  `status` enum('pending','sent','failed','retrying') NOT NULL DEFAULT 'pending',
  `attempts` int NOT NULL DEFAULT 0,
  `maxAttempts` int NOT NULL DEFAULT 3,
  `lastAttemptAt` timestamp NULL,
  `nextRetryAt` timestamp NULL,
  `errorMessage` text,
  `metadata` text,
  `sentAt` timestamp NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_queue_status` (`status`),
  KEY `idx_email_queue_recipient` (`recipientEmail`),
  KEY `idx_email_queue_next_retry` (`nextRetryAt`),
  KEY `idx_email_queue_event_type` (`eventType`),
  KEY `idx_email_queue_created_at` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `systemLogs` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `userId` varchar(64),
  `severity` enum('debug','info','warning','error','critical') NOT NULL DEFAULT 'info',
  `message` text NOT NULL,
  `context` text,
  `service` varchar(100),
  `action` varchar(100),
  `stackTrace` text,
  `ipAddress` varchar(100),
  `userAgent` varchar(500),
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_system_logs_org` (`organizationId`),
  KEY `idx_system_logs_user` (`userId`),
  KEY `idx_system_logs_severity` (`severity`),
  KEY `idx_system_logs_service` (`service`),
  KEY `idx_system_logs_created_at` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activeSessions` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `userEmail` varchar(320) NOT NULL,
  `organizationId` varchar(64),
  `ipAddress` varchar(100) NOT NULL,
  `userAgent` varchar(500) NOT NULL,
  `deviceType` varchar(50),
  `browser` varchar(100),
  `browserVersion` varchar(50),
  `operatingSystem` varchar(100),
  `osVersion` varchar(100),
  `tokenHash` varchar(255),
  `lastActivity` timestamp NULL,
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_active_sessions_user` (`userId`),
  KEY `idx_active_sessions_org` (`organizationId`),
  KEY `idx_active_sessions_expires` (`expiresAt`),
  KEY `idx_active_sessions_created` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pricingPlans` (
  `id` varchar(64) NOT NULL,
  `planName` varchar(255) NOT NULL,
  `planSlug` varchar(100) NOT NULL,
  `description` longtext,
  `tier` enum('free','starter','professional','enterprise','custom') NOT NULL,
  `monthlyPrice` decimal(10,2) NOT NULL DEFAULT 0,
  `annualPrice` decimal(10,2) NOT NULL DEFAULT 0,
  `monthlyAnnualDiscount` decimal(5,2) NOT NULL DEFAULT 0,
  `maxUsers` int DEFAULT -1,
  `maxProjects` int DEFAULT -1,
  `maxStorageGB` int DEFAULT -1,
  `features` json,
  `supportLevel` enum('email','priority','24/7_phone','dedicated_manager') DEFAULT 'email',
  `isActive` tinyint NOT NULL DEFAULT 1,
  `displayOrder` int DEFAULT 0,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pricing_plans_slug` (`planSlug`),
  KEY `idx_pricing_plans_active` (`isActive`),
  KEY `idx_pricing_plans_order` (`displayOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @add_invoice_org = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invoices' AND COLUMN_NAME = 'organizationId') = 0,
  'ALTER TABLE `invoices` ADD COLUMN `organizationId` varchar(64) NULL',
  'SELECT 1'
);
PREPARE invoice_org_stmt FROM @add_invoice_org;
EXECUTE invoice_org_stmt;
DEALLOCATE PREPARE invoice_org_stmt;
