-- Add the configurable estimate category value used by the settings category list.
ALTER TABLE `estimates` ADD COLUMN `category` varchar(100) NULL;