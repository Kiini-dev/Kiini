ALTER TABLE `journalEntries`
  ADD COLUMN `organizationId` varchar(64) NULL AFTER `id`,
  ADD COLUMN `entryMonth` varchar(7) NULL AFTER `entryDate`,
  ADD COLUMN `reference` varchar(50) NULL AFTER `entryMonth`,
  ADD COLUMN `totalAmount` decimal(15,2) NULL AFTER `description`,
  ADD COLUMN `status` enum('pending_approval','approved','posted','reversed') NULL DEFAULT 'posted',
  ADD COLUMN `approvedBy` varchar(64) NULL,
  ADD COLUMN `approvedAt` datetime NULL,
  ADD COLUMN `postedAt` datetime NULL,
  ADD COLUMN `reversedAt` datetime NULL,
  ADD COLUMN `notes` text NULL,
  ADD COLUMN `updatedAt` datetime NULL,
  ADD INDEX `journal_org_status_date_idx` (`organizationId`,`status`,`entryDate`);

ALTER TABLE `journalEntryLines`
  ADD COLUMN `lineNumber` int NULL,
  ADD COLUMN `createdBy` varchar(64) NULL;
