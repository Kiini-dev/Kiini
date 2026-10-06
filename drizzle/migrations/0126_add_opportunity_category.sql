-- Add the configurable proposal category value used by the proposal settings list.
ALTER TABLE `opportunities` ADD COLUMN IF NOT EXISTS `category` varchar(100) NULL;