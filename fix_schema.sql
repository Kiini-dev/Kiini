-- Add missing columns and tables based on the schema mismatch errors

-- 1. Add organizationId columns to existing tables
ALTER TABLE `invoices` ADD COLUMN `organizationId` varchar(255) NULL AFTER `id`;
ALTER TABLE `expenses` ADD COLUMN `organizationId` varchar(255) NULL AFTER `id`;
ALTER TABLE `projects` ADD COLUMN `organizationId` varchar(255) NULL AFTER `id`;
ALTER TABLE `payments` ADD COLUMN `organizationId` varchar(255) NULL AFTER `id`;
ALTER TABLE `userTablePreferences` ADD COLUMN `organizationId` varchar(255) NULL AFTER `userId`;
ALTER TABLE `workflows` ADD COLUMN `triggerType` varchar(255) NULL AFTER `description`;
ALTER TABLE `workflows` ADD COLUMN `triggerCondition` longtext NULL AFTER `triggerType`;
ALTER TABLE `workflows` ADD COLUMN `actionTypes` longtext NULL AFTER `triggerCondition`;

-- 2. Create staffChatMessages table if it doesn't exist
CREATE TABLE IF NOT EXISTS `staffChatMessages` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `channelId` varchar(100) NOT NULL,
  `senderId` varchar(100) NOT NULL,
  `message` longtext,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_channel_id` (`channelId`),
  KEY `idx_sender_id` (`senderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create backup_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS `backup_history` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `filename` varchar(255) NOT NULL,
  `filesize` bigint DEFAULT NULL,
  `status` varchar(50) DEFAULT 'success',
  `backupType` varchar(50) DEFAULT 'manual',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `createdBy` varchar(100),
  KEY `idx_created_at` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create systemHealth table if it doesn't exist
CREATE TABLE IF NOT EXISTS `systemHealth` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `organizationId` varchar(255) NULL,
  `cpuUsage` float DEFAULT NULL,
  `cpuModel` varchar(255) NULL,
  `cpuCores` int DEFAULT NULL,
  `cpuSpeed` varchar(50) NULL,
  `cpuTemperature` float DEFAULT NULL,
  `memoryUsage` float DEFAULT NULL,
  `memoryTotal` float DEFAULT NULL,
  `memoryAvailable` float DEFAULT NULL,
  `diskUsage` float DEFAULT NULL,
  `diskTotal` float DEFAULT NULL,
  `diskUsagePercent` float DEFAULT NULL,
  `status` varchar(50) DEFAULT 'healthy',
  `systemPlatform` varchar(50) NULL,
  `systemDistro` varchar(255) NULL,
  `systemRelease` varchar(100) NULL,
  `systemArch` varchar(50) NULL,
  `systemManufacturer` varchar(255) NULL,
  `systemUptime` bigint DEFAULT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_created_at` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
