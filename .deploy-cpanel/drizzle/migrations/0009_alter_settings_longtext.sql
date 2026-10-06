-- Alter settings table to use LONGTEXT for value column to support large base64-encoded logos
ALTER TABLE `settings` MODIFY COLUMN `value` longtext NULL;
