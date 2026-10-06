-- Add organizationId column to tables that require it but don't have it yet

SET FOREIGN_KEY_CHECKS=0;

-- Add organizationId to clients if it doesn't exist
ALTER TABLE `clients` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to projects if it doesn't exist
ALTER TABLE `projects` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to invoices if it doesn't exist
ALTER TABLE `invoices` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to estimates if it doesn't exist
ALTER TABLE `estimates` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to receipts if it doesn't exist
ALTER TABLE `receipts` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to creditNotes if it doesn't exist
ALTER TABLE `creditNotes` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to debitNotes if it doesn't exist
ALTER TABLE `debitNotes` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to departments if it doesn't exist
ALTER TABLE `departments` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to budgets if it doesn't exist
ALTER TABLE `budgets` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to employees if it doesn't exist
ALTER TABLE `employees` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to leaveRequests if it doesn't exist
ALTER TABLE `leaveRequests` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to opportunities if it doesn't exist
ALTER TABLE `opportunities` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to customRoles if it doesn't exist
ALTER TABLE `customRoles` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to communicationLogs if it doesn't exist
ALTER TABLE `communicationLogs` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to expenses if it doesn't exist
ALTER TABLE `expenses` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to recurringExpenses if it doesn't exist
ALTER TABLE `recurringExpenses` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to recurringInvoices if it doesn't exist
ALTER TABLE `recurringInvoices` ADD COLUMN `organizationId` varchar(64) NULL;

-- Add organizationId to services if it doesn't exist
ALTER TABLE `services` ADD COLUMN `organizationId` varchar(64) NULL;

SET FOREIGN_KEY_CHECKS=1;
