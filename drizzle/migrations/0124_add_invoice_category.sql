-- Add the configurable invoice category value used by the settings category list.
ALTER TABLE `invoices` ADD COLUMN IF NOT EXISTS `category` varchar(100) NULL;