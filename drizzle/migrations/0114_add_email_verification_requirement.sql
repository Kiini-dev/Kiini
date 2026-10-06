SET @email_verification_column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'emailVerificationRequired'
);
SET @email_verification_sql := IF(
  @email_verification_column_exists = 0,
  'ALTER TABLE users ADD COLUMN emailVerificationRequired TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE email_verification_stmt FROM @email_verification_sql;
EXECUTE email_verification_stmt;
DEALLOCATE PREPARE email_verification_stmt;

UPDATE users
SET emailVerificationRequired = 1
WHERE loginMethod = 'local'
  AND email <> 'info@kiini.africa'
  AND emailVerified IS NULL
  AND emailVerificationRequired = 0;