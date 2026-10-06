-- Migration: Add user profile columns
-- Date: 2026-03-03
-- Description: Add phone, company, position, address, city, country, photoUrl columns to users table

ALTER TABLE `users`
  ADD COLUMN `phone` varchar(20) NULL,
  ADD COLUMN `company` varchar(255) NULL,
  ADD COLUMN `position` varchar(100) NULL,
  ADD COLUMN `address` text NULL,
  ADD COLUMN `city` varchar(100) NULL,
  ADD COLUMN `country` varchar(100) NULL,
  ADD COLUMN `photoUrl` text NULL;
