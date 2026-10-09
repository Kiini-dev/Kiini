-- Repair expense columns used by workspace search on installations where
-- older migrations were marked applied after a partial schema update.

SET @db_name := DATABASE();

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'expenses' AND COLUMN_NAME = 'expenseNumber') = 0,
  'ALTER TABLE `expenses` ADD COLUMN `expenseNumber` varchar(100) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'expenses' AND COLUMN_NAME = 'vendor') = 0,
  'ALTER TABLE `expenses` ADD COLUMN `vendor` varchar(255) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'expenses' AND COLUMN_NAME = 'description') = 0,
  'ALTER TABLE `expenses` ADD COLUMN `description` text NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'expenses' AND COLUMN_NAME = 'status') = 0,
  'ALTER TABLE `expenses` ADD COLUMN `status` enum(''pending'',''approved'',''rejected'',''paid'') NOT NULL DEFAULT ''pending''',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
