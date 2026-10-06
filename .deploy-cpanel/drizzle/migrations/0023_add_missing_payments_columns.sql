-- Add missing columns to payments table
ALTER TABLE `payments` 
ADD COLUMN `accountId` varchar(64) AFTER `clientId`,
ADD COLUMN `chartOfAccountType` enum('debit','credit') DEFAULT 'debit' AFTER `referenceNumber`;
