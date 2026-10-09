-- Add the configurable client category value used by the settings category list.
ALTER TABLE `clients` ADD COLUMN `category` varchar(100) NULL;