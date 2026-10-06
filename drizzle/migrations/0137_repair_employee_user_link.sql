SET @employees_table_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
);

SET @employee_user_id_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'userId'
);

SET @sql = IF(
  @employees_table_exists = 1 AND @employee_user_id_exists = 0,
  'ALTER TABLE `employees` ADD COLUMN `userId` varchar(64) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @employee_user_id_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND INDEX_NAME = 'employees_user_id_idx'
);

SET @sql = IF(
  @employees_table_exists = 1 AND @employee_user_id_index_exists = 0,
  'ALTER TABLE `employees` ADD INDEX `employees_user_id_idx` (`userId`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
