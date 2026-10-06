-- Add staffChatMessages table if missing (idempotent)
SET @tbl_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'staffChatMessages'
);

SET @create_sql := IF(
  @tbl_exists = 0,
  'CREATE TABLE `staffChatMessages` (
      `id` VARCHAR(64) PRIMARY KEY,
      `channelId` VARCHAR(64),
      `userId` VARCHAR(64),
      `message` TEXT,
      `isRead` TINYINT DEFAULT 0,
      `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX `idx_channel` (`channelId`),
      INDEX `idx_user` (`userId`)
    )',
  'SELECT 1'
);

PREPARE stmt_create FROM @create_sql;
EXECUTE stmt_create;
DEALLOCATE PREPARE stmt_create;
