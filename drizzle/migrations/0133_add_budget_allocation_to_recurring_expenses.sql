SET @table_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'recurringExpenses'
);
SET @column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'recurringExpenses'
    AND COLUMN_NAME = 'budgetAllocationId'
);
SET @sql := IF(@table_exists > 0 AND @column_exists = 0,
  'ALTER TABLE `recurringExpenses` ADD COLUMN `budgetAllocationId` varchar(64) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
