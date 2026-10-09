-- Repair partially-applied jobGroups migrations. Earlier migrations could be
-- marked complete after encountering one duplicate column, leaving later
-- columns or indexes missing.

SET @db_name := DATABASE();

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'jobGroups' AND COLUMN_NAME = 'organizationId') = 0,
  'ALTER TABLE `jobGroups` ADD COLUMN `organizationId` varchar(64) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'jobGroups' AND COLUMN_NAME = 'managerId') = 0,
  'ALTER TABLE `jobGroups` ADD COLUMN `managerId` varchar(64) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'jobGroups' AND COLUMN_NAME = 'defaultBasicSalary') = 0,
  'ALTER TABLE `jobGroups` ADD COLUMN `defaultBasicSalary` int NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'jobGroups' AND COLUMN_NAME = 'defaultAnnualLeaveDays') = 0,
  'ALTER TABLE `jobGroups` ADD COLUMN `defaultAnnualLeaveDays` int NOT NULL DEFAULT 21',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'jobGroups' AND COLUMN_NAME = 'defaultAllowances') = 0,
  'ALTER TABLE `jobGroups` ADD COLUMN `defaultAllowances` text NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'jobGroups' AND COLUMN_NAME = 'defaultDeductions') = 0,
  'ALTER TABLE `jobGroups` ADD COLUMN `defaultDeductions` text NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'jobGroups' AND COLUMN_NAME = 'defaultBenefits') = 0,
  'ALTER TABLE `jobGroups` ADD COLUMN `defaultBenefits` text NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'jobGroups' AND INDEX_NAME = 'job_group_org_idx') = 0,
  'ALTER TABLE `jobGroups` ADD INDEX `job_group_org_idx` (`organizationId`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'jobGroups' AND INDEX_NAME = 'job_group_manager_idx') = 0,
  'ALTER TABLE `jobGroups` ADD INDEX `job_group_manager_idx` (`managerId`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
