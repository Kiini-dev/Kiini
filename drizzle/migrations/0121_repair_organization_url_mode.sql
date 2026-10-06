-- Ensure organizations.urlMode exists even when 0120 was recorded before completing.
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'organizations'
     AND COLUMN_NAME = 'urlMode') = 0,
  'ALTER TABLE `organizations` ADD COLUMN `urlMode` enum(''path'',''subdomain'') NOT NULL DEFAULT ''path'' AFTER `slug`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
