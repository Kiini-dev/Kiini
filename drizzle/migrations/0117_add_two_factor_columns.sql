SET @two_factor_enabled_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'twoFactorEnabled'
);
SET @two_factor_enabled_sql := IF(
  @two_factor_enabled_exists = 0,
  'ALTER TABLE users ADD COLUMN twoFactorEnabled TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE two_factor_enabled_stmt FROM @two_factor_enabled_sql;
EXECUTE two_factor_enabled_stmt;
DEALLOCATE PREPARE two_factor_enabled_stmt;

SET @two_factor_secret_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'twoFactorSecret'
);
SET @two_factor_secret_sql := IF(
  @two_factor_secret_exists = 0,
  'ALTER TABLE users ADD COLUMN twoFactorSecret VARCHAR(255) NULL',
  'SELECT 1'
);
PREPARE two_factor_secret_stmt FROM @two_factor_secret_sql;
EXECUTE two_factor_secret_stmt;
DEALLOCATE PREPARE two_factor_secret_stmt;