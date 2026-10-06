-- Add isDefault column to documentTemplates table if it exists and the column is missing
SET @table_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'documentTemplates'
);
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'documentTemplates'
    AND COLUMN_NAME = 'isDefault'
);

SET @sql = IF(
  @table_exists = 1 AND @column_exists = 0,
  'ALTER TABLE `documentTemplates` ADD COLUMN `isDefault` TINYINT(1) NOT NULL DEFAULT 0 AFTER `content`',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure unique default per type per organization
-- (handled in application logic to allow ALTER to succeed on older MySQL)
