-- Compatibility hotfix for legacy databases missing columns now required by current Drizzle schema.
-- Fixes navigation-time query failures triggered by dashboard/layout data loads.

-- ---------------------------------------------------------------------------
-- products.organizationId
-- ---------------------------------------------------------------------------
SET @products_org_col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'organizationId'
);

SET @products_org_col_sql := IF(
  @products_org_col_exists = 0,
  'ALTER TABLE `products` ADD COLUMN `organizationId` varchar(64) NULL AFTER `id`',
  'SELECT 1'
);

PREPARE stmt_products_org_col FROM @products_org_col_sql;
EXECUTE stmt_products_org_col;
DEALLOCATE PREPARE stmt_products_org_col;

SET @products_org_idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND INDEX_NAME = 'idx_products_org_id'
);

SET @products_org_idx_sql := IF(
  @products_org_idx_exists = 0,
  'ALTER TABLE `products` ADD INDEX `idx_products_org_id` (`organizationId`)',
  'SELECT 1'
);

PREPARE stmt_products_org_idx FROM @products_org_idx_sql;
EXECUTE stmt_products_org_idx;
DEALLOCATE PREPARE stmt_products_org_idx;

-- ---------------------------------------------------------------------------
-- workflows columns required by current schema/router queries
-- ---------------------------------------------------------------------------
SET @wf_status_col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'workflows'
    AND COLUMN_NAME = 'status'
);

SET @wf_status_col_sql := IF(
  @wf_status_col_exists = 0,
  'ALTER TABLE `workflows` ADD COLUMN `status` ENUM(''active'',''inactive'',''draft'') NOT NULL DEFAULT ''draft'' AFTER `description`',
  'SELECT 1'
);

PREPARE stmt_wf_status_col FROM @wf_status_col_sql;
EXECUTE stmt_wf_status_col;
DEALLOCATE PREPARE stmt_wf_status_col;

SET @wf_trigger_type_col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'workflows'
    AND COLUMN_NAME = 'triggerType'
);

SET @wf_trigger_type_col_sql := IF(
  @wf_trigger_type_col_exists = 0,
  'ALTER TABLE `workflows` ADD COLUMN `triggerType` ENUM(''invoice_created'',''invoice_paid'',''invoice_overdue'',''invoice_approved'',''payment_received'',''payment_approved'',''receipt_created'',''expense_approved'',''opportunity_moved'',''task_completed'',''project_milestone_reached'',''reminder_time'') NOT NULL DEFAULT ''invoice_created'' AFTER `status`',
  'SELECT 1'
);

PREPARE stmt_wf_trigger_type_col FROM @wf_trigger_type_col_sql;
EXECUTE stmt_wf_trigger_type_col;
DEALLOCATE PREPARE stmt_wf_trigger_type_col;

SET @wf_trigger_condition_col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'workflows'
    AND COLUMN_NAME = 'triggerCondition'
);

SET @wf_trigger_condition_col_sql := IF(
  @wf_trigger_condition_col_exists = 0,
  'ALTER TABLE `workflows` ADD COLUMN `triggerCondition` TEXT NULL AFTER `triggerType`',
  'SELECT 1'
);

PREPARE stmt_wf_trigger_condition_col FROM @wf_trigger_condition_col_sql;
EXECUTE stmt_wf_trigger_condition_col;
DEALLOCATE PREPARE stmt_wf_trigger_condition_col;

SET @wf_action_types_col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'workflows'
    AND COLUMN_NAME = 'actionTypes'
);

SET @wf_action_types_col_sql := IF(
  @wf_action_types_col_exists = 0,
  'ALTER TABLE `workflows` ADD COLUMN `actionTypes` TEXT NULL AFTER `triggerCondition`',
  'SELECT 1'
);

PREPARE stmt_wf_action_types_col FROM @wf_action_types_col_sql;
EXECUTE stmt_wf_action_types_col;
DEALLOCATE PREPARE stmt_wf_action_types_col;

UPDATE `workflows` SET `actionTypes` = '[]' WHERE `actionTypes` IS NULL;

SET @wf_is_recurring_col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'workflows'
    AND COLUMN_NAME = 'isRecurring'
);

SET @wf_is_recurring_col_sql := IF(
  @wf_is_recurring_col_exists = 0,
  'ALTER TABLE `workflows` ADD COLUMN `isRecurring` TINYINT NULL DEFAULT 0 AFTER `actionTypes`',
  'SELECT 1'
);

PREPARE stmt_wf_is_recurring_col FROM @wf_is_recurring_col_sql;
EXECUTE stmt_wf_is_recurring_col;
DEALLOCATE PREPARE stmt_wf_is_recurring_col;

SET @wf_trigger_type_idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'workflows'
    AND INDEX_NAME = 'trigger_type_idx'
);

SET @wf_trigger_type_idx_sql := IF(
  @wf_trigger_type_idx_exists = 0,
  'ALTER TABLE `workflows` ADD INDEX `trigger_type_idx` (`triggerType`)',
  'SELECT 1'
);

PREPARE stmt_wf_trigger_type_idx FROM @wf_trigger_type_idx_sql;
EXECUTE stmt_wf_trigger_type_idx;
DEALLOCATE PREPARE stmt_wf_trigger_type_idx;

SET @wf_status_idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'workflows'
    AND INDEX_NAME = 'status_idx'
);

SET @wf_status_idx_sql := IF(
  @wf_status_idx_exists = 0,
  'ALTER TABLE `workflows` ADD INDEX `status_idx` (`status`)',
  'SELECT 1'
);

PREPARE stmt_wf_status_idx FROM @wf_status_idx_sql;
EXECUTE stmt_wf_status_idx;
DEALLOCATE PREPARE stmt_wf_status_idx;
