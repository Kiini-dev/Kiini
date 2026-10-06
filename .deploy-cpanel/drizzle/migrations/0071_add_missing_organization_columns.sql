-- ============================================================================
-- Add missing organization columns
-- Adds additional fields for company details, settings, and billing info
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN `isArchived` TINYINT(1) NOT NULL DEFAULT 0 AFTER `isActive`,
  ADD COLUMN `archivedAt` TIMESTAMP NULL AFTER `isArchived`,
  ADD COLUMN `archivedBy` VARCHAR(64) NULL AFTER `archivedAt`,
  ADD COLUMN `industry` VARCHAR(100) DEFAULT NULL AFTER `country`,
  ADD COLUMN `website` VARCHAR(255) DEFAULT NULL AFTER `industry`,
  ADD COLUMN `taxId` VARCHAR(100) DEFAULT NULL AFTER `website`,
  ADD COLUMN `billingEmail` VARCHAR(320) DEFAULT NULL AFTER `taxId`,
  ADD COLUMN `timezone` VARCHAR(100) DEFAULT 'Africa/Nairobi' AFTER `billingEmail`,
  ADD COLUMN `currency` VARCHAR(10) DEFAULT 'KES' AFTER `timezone`,
  ADD COLUMN `description` TEXT DEFAULT NULL AFTER `currency`,
  ADD COLUMN `employeeCount` INT DEFAULT NULL AFTER `description`,
  ADD COLUMN `registrationNumber` VARCHAR(100) DEFAULT NULL AFTER `employeeCount`,
  ADD COLUMN `paymentMethod` VARCHAR(50) DEFAULT NULL AFTER `registrationNumber`;

-- Add index for archived status if it does not already exist
SET @idx_count = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'organizations'
    AND INDEX_NAME = 'idx_org_archived'
);
SET @stmt = IF(@idx_count = 0,
  'ALTER TABLE organizations ADD INDEX `idx_org_archived` (`isArchived`)',
  'SELECT 1'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
