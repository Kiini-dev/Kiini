-- Add chartOfAccountId column to payments table to link payments to Chart of Accounts
ALTER TABLE `payments` ADD COLUMN `chartOfAccountId` INT NULL AFTER `chartOfAccountType`;

-- Add index for faster lookups
CREATE INDEX `idx_payment_chart_of_account` ON `payments` (`chartOfAccountId`);
