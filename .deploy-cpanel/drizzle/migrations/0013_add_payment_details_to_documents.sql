-- Add paymentDetails column to invoices table
ALTER TABLE `invoices` ADD COLUMN `paymentDetails` LONGTEXT AFTER `terms`;

-- Add paymentDetails column to estimates table
ALTER TABLE `estimates` ADD COLUMN `paymentDetails` LONGTEXT AFTER `terms`;

-- Add paymentDetails column to receipts table
ALTER TABLE `receipts` ADD COLUMN `paymentDetails` LONGTEXT AFTER `notes`;
