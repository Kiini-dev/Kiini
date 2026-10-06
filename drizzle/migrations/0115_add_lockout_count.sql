SET @lockout_count_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'lockoutCount'
);
SET @lockout_count_sql := IF(
  @lockout_count_exists = 0,
  'ALTER TABLE users ADD COLUMN lockoutCount INT NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE lockout_count_stmt FROM @lockout_count_sql;
EXECUTE lockout_count_stmt;
DEALLOCATE PREPARE lockout_count_stmt;