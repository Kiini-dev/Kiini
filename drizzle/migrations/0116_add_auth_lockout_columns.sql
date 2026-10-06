SET @failed_login_attempts_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'failedLoginAttempts'
);
SET @failed_login_attempts_sql := IF(
  @failed_login_attempts_exists = 0,
  'ALTER TABLE users ADD COLUMN failedLoginAttempts INT DEFAULT 0',
  'SELECT 1'
);
PREPARE failed_login_attempts_stmt FROM @failed_login_attempts_sql;
EXECUTE failed_login_attempts_stmt;
DEALLOCATE PREPARE failed_login_attempts_stmt;

SET @locked_until_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'lockedUntil'
);
SET @locked_until_sql := IF(
  @locked_until_exists = 0,
  'ALTER TABLE users ADD COLUMN lockedUntil TIMESTAMP NULL',
  'SELECT 1'
);
PREPARE locked_until_stmt FROM @locked_until_sql;
EXECUTE locked_until_stmt;
DEALLOCATE PREPARE locked_until_stmt;

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
