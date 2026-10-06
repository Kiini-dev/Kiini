-- Add missing columns to clients table
ALTER TABLE `clients` ADD COLUMN `secondaryPhone` varchar(50) NULL;
ALTER TABLE `clients` ADD COLUMN `leadSource` varchar(100) NULL;
ALTER TABLE `clients` ADD COLUMN `currency` varchar(10) NULL DEFAULT 'KES';
ALTER TABLE `clients` ADD COLUMN `bankAccountNumber` varchar(100) NULL;
ALTER TABLE `clients` ADD COLUMN `organizationId` varchar(64) NULL;
