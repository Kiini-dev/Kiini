-- Add the configurable proposal category value used by the proposal settings list.
ALTER TABLE `opportunities` ADD COLUMN `category` varchar(100) NULL;