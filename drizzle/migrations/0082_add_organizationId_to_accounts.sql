-- Add organizationId column to accounts table for multi-tenancy support
ALTER TABLE `accounts` 
ADD COLUMN `organizationId` varchar(64) AFTER `id`;

-- Add index on organizationId for better query performance
ALTER TABLE `accounts` 
ADD INDEX `account_org_idx` (`organizationId`);

-- Add foreign key constraint to organizations table if it exists
ALTER TABLE `accounts` 
ADD CONSTRAINT `fk_accounts_org` FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE SET NULL;
