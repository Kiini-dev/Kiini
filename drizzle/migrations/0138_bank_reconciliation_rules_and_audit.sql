CREATE TABLE IF NOT EXISTS `reconciliation_rules` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `name` varchar(100) NOT NULL,
  `targetField` enum('description','amount') NOT NULL DEFAULT 'description',
  `operator` enum('contains','starts_with','equals') NOT NULL DEFAULT 'contains',
  `valueToMatch` varchar(255) NOT NULL,
  `action` enum('auto_match_category','flag_for_review') NOT NULL DEFAULT 'flag_for_review',
  `targetEntityId` varchar(64) NULL,
  `priority` int NOT NULL DEFAULT 100,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `recon_rule_org_priority_idx` (`organizationId`,`isActive`,`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reconciliation_match_allocations` (
  `id` varchar(64) NOT NULL,
  `itemId` varchar(64) NOT NULL,
  `sourceType` enum('payment','expense','non_sales_inflow') NOT NULL,
  `sourceId` varchar(64) NOT NULL,
  `allocatedAmount` bigint NOT NULL,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `recon_match_allocation_source_uq` (`itemId`,`sourceType`,`sourceId`),
  KEY `recon_match_allocation_source_idx` (`sourceType`,`sourceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reconciliation_audit_events` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `sessionId` varchar(64) NULL,
  `itemId` varchar(64) NULL,
  `actorUserId` varchar(64) NOT NULL,
  `eventType` varchar(50) NOT NULL,
  `details` json NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `recon_audit_org_time_idx` (`organizationId`,`createdAt`),
  KEY `recon_audit_session_idx` (`sessionId`,`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @bank_transaction_fingerprint_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'bankTransactions'
    AND COLUMN_NAME = 'importFingerprint'
);

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bankTransactions') = 1
    AND @bank_transaction_fingerprint_exists = 0,
  'ALTER TABLE `bankTransactions` ADD COLUMN `importFingerprint` varchar(64) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @bank_transaction_fingerprint_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'bankTransactions'
    AND INDEX_NAME = 'bank_transaction_import_fingerprint_uq'
);

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bankTransactions') = 1
    AND @bank_transaction_fingerprint_index_exists = 0,
  'ALTER TABLE `bankTransactions` ADD UNIQUE INDEX `bank_transaction_import_fingerprint_uq` (`bankAccountId`,`importFingerprint`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
