-- Add the configurable project category value used by the settings category list.
ALTER TABLE `projects` ADD COLUMN IF NOT EXISTS `category` varchar(100) NULL;