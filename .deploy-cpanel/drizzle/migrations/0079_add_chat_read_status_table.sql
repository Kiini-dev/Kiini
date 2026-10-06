-- Add chat_read_status table if missing (idempotent)
SET @tbl_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'chat_read_status'
);

SET @create_sql := IF(
  @tbl_exists = 0,
  'CREATE TABLE `chat_read_status` (
      `id` VARCHAR(64) PRIMARY KEY,
      `user_id` VARCHAR(64) NOT NULL,
      `channel_id` VARCHAR(64) NOT NULL,
      `last_read_message_id` VARCHAR(64),
      `read_at` TIMESTAMP NULL DEFAULT NULL,
      INDEX `idx_chat_read_user` (`user_id`),
      INDEX `idx_chat_read_channel` (`channel_id`),
      INDEX `idx_chat_read_message` (`last_read_message_id`)
    )',
  'SELECT 1'
);

PREPARE stmt_create FROM @create_sql;
EXECUTE stmt_create;
DEALLOCATE PREPARE stmt_create;
