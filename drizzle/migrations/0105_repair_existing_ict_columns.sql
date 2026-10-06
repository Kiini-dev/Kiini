-- Repair columns and collation on ICT tables that may predate migration 0104.

SET @email_org_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'emailQueue' AND COLUMN_NAME = 'organizationId'
);
SET @email_org_sql = IF(
  @email_org_exists = 0,
  'ALTER TABLE `emailQueue` ADD COLUMN `organizationId` varchar(64) NULL AFTER `id`',
  'SELECT 1'
);
PREPARE email_org_stmt FROM @email_org_sql;
EXECUTE email_org_stmt;
DEALLOCATE PREPARE email_org_stmt;

SET @active_org_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'activeSessions' AND COLUMN_NAME = 'organizationId'
);
SET @active_org_sql = IF(
  @active_org_exists = 0,
  'ALTER TABLE `activeSessions` ADD COLUMN `organizationId` varchar(64) NULL AFTER `userEmail`',
  'ALTER TABLE `activeSessions` MODIFY COLUMN `organizationId` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL'
);
PREPARE active_org_stmt FROM @active_org_sql;
EXECUTE active_org_stmt;
DEALLOCATE PREPARE active_org_stmt;

SET @system_org_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'systemLogs' AND COLUMN_NAME = 'organizationId'
);
SET @system_org_sql = IF(
  @system_org_exists = 0,
  'ALTER TABLE `systemLogs` ADD COLUMN `organizationId` varchar(64) NULL AFTER `id`',
  'SELECT 1'
);
PREPARE system_org_stmt FROM @system_org_sql;
EXECUTE system_org_stmt;
DEALLOCATE PREPARE system_org_stmt;
