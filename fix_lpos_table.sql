-- Fix LPO table: add missing columns that Drizzle schema expects
-- The migration 0040 only created 9 columns but the schema has 13

ALTER TABLE `lpos`
  ADD COLUMN `approvedBy` varchar(64) NULL,
  ADD COLUMN `approvedAt` timestamp NULL,
  ADD COLUMN `rejectionReason` text NULL,
  ADD COLUMN `submittedAt` timestamp NULL;
