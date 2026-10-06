-- Migration: Add requiresPasswordChange column to users table
-- This column tracks whether a user must change their password on first login
-- Default is 1 (true) for new users who received auto-generated passwords

ALTER TABLE `users` ADD COLUMN `requiresPasswordChange` TINYINT(1) NOT NULL DEFAULT 1 AFTER `passwordResetExpiresAt`;
