CREATE TABLE IF NOT EXISTS `backup_schedules` (
  `id` varchar(64) NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `backupType` varchar(50) NOT NULL DEFAULT 'FULL',
  `schedule` varchar(100) DEFAULT NULL,
  `retentionDays` int DEFAULT 30,
  `status` varchar(50) NOT NULL DEFAULT 'SCHEDULED',
  `lastRun` timestamp NULL DEFAULT NULL,
  `nextRun` timestamp NULL DEFAULT NULL,
  `config` text DEFAULT NULL,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bs_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `backup_history` (
  `id` varchar(64) NOT NULL,
  `name` varchar(200) NOT NULL,
  `backupType` varchar(50) NOT NULL DEFAULT 'full',
  `scope` varchar(50) NOT NULL DEFAULT 'full',
  `scopeEntityId` varchar(64) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `tablesList` text DEFAULT NULL,
  `recordCount` int DEFAULT 0,
  `sizeBytes` int DEFAULT 0,
  `fileName` varchar(500) DEFAULT NULL,
  `errorMessage` text DEFAULT NULL,
  `completedAt` timestamp NULL DEFAULT NULL,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bh_status` (`status`),
  KEY `idx_bh_scope` (`scope`),
  KEY `idx_bh_created` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
