ALTER TABLE `expenses` MODIFY COLUMN `chartOfAccountId` VARCHAR(64) NULL;
ALTER TABLE `payments` MODIFY COLUMN `chartOfAccountId` VARCHAR(64) NULL;
ALTER TABLE `recurringExpenses` MODIFY COLUMN `chartOfAccountId` VARCHAR(64) NULL;