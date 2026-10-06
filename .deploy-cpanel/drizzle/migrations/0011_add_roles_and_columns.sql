-- Migration: Add missing tables and columns from schema updates
-- Date: 2026-02-26
-- Description: create userRoles table and add approvedAt/invoiceSequence columns

-- Create userRoles table (was missing in earlier migrations)
CREATE TABLE IF NOT EXISTS `userRoles` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64),
  `role` varchar(50),
  `roleName` varchar(100),
  `description` text,
  `isActive` tinyint DEFAULT 1,
  `assignedBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add approvedAt to expenses if it doesn't exist
ALTER TABLE `expenses`
  ADD COLUMN `approvedAt` datetime NULL;

-- Add invoiceSequence to invoices
ALTER TABLE `invoices`
  ADD COLUMN `invoiceSequence` int NOT NULL DEFAULT 0;
