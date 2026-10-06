-- Migration: Add missing columns to tables
-- Date: 2026-03-05
-- Description: Add approval and account columns that are missing from various tables

-- Add missing columns to payments table
ALTER TABLE `payments` 
ADD COLUMN `accountId` varchar(64) COMMENT 'COA account this payment is made to' AFTER `clientId`;

ALTER TABLE `payments` 
ADD COLUMN `chartOfAccountType` enum('debit','credit') DEFAULT 'debit' AFTER `referenceNumber`;

-- Add missing columns to expenses table  
ALTER TABLE `expenses`
ADD COLUMN `approvedAt` datetime AFTER `approvedBy`;
