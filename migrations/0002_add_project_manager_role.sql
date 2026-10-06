-- Migration: add 'project_manager' to users.role enum
-- Run with your MySQL client or via drizzle migrations.

ALTER TABLE `users`
MODIFY COLUMN `role` ENUM('user','admin','staff','accountant','client','super_admin','project_manager') NOT NULL DEFAULT 'user';

-- NOTE: If your MySQL server uses a different enum ordering or additional values,
-- adjust the list above to match the current enum values plus 'project_manager'.
