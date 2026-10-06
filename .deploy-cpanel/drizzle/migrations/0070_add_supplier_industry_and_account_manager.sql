-- Add industry and account manager columns to suppliers table
ALTER TABLE `suppliers`
  ADD COLUMN `industry` VARCHAR(100) DEFAULT NULL AFTER `country`,
  ADD COLUMN `accountManagerId` VARCHAR(64) DEFAULT NULL AFTER `isActive`;