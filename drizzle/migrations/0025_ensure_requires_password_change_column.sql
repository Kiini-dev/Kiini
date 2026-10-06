-- Migration: Ensure requiresPasswordChange column exists (idempotent)
-- This migration safely adds the requiresPasswordChange column to users table
-- Note: MySQL doesn't support IF NOT EXISTS for columns, so duplicate column errors are expected if already applied

-- Try to add the column; if it already exists, a Duplicate column name error will be caught and ignored
ALTER TABLE `users` ADD COLUMN `requiresPasswordChange` TINYINT(1) NOT NULL DEFAULT 1 AFTER `passwordResetExpiresAt`;
