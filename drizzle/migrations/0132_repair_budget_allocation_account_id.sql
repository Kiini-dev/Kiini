-- Repair columns required by expenses.getAvailableBudgetAllocations.
SET @table_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'budgetAllocations'
);
SET @column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'budgetAllocations'
    AND COLUMN_NAME = 'accountId'
);
SET @sql := IF(@table_exists > 0 AND @column_exists = 0,
  'ALTER TABLE `budgetAllocations` ADD COLUMN `accountId` varchar(64) NULL AFTER `budgetId`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @table_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'expenses'
);
SET @column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'expenses'
    AND COLUMN_NAME = 'budgetAllocationId'
);
SET @sql := IF(@table_exists > 0 AND @column_exists = 0,
  'ALTER TABLE `expenses` ADD COLUMN `budgetAllocationId` varchar(64) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
