-- Ensure payments.organizationId exists for multi-tenant queries.
-- Idempotent: safe to run on databases where the column is already present.

SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'payments'
    AND COLUMN_NAME = 'organizationId'
);

SET @add_col_sql := IF(
  @col_exists = 0,
  'ALTER TABLE `payments` ADD COLUMN `organizationId` varchar(64) NULL AFTER `id`',
  'SELECT 1'
);

PREPARE stmt_add_col FROM @add_col_sql;
EXECUTE stmt_add_col;
DEALLOCATE PREPARE stmt_add_col;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'payments'
    AND INDEX_NAME = 'idx_payments_org_id'
);

SET @add_idx_sql := IF(
  @idx_exists = 0,
  'ALTER TABLE `payments` ADD INDEX `idx_payments_org_id` (`organizationId`)',
  'SELECT 1'
);

PREPARE stmt_add_idx FROM @add_idx_sql;
EXECUTE stmt_add_idx;
DEALLOCATE PREPARE stmt_add_idx;