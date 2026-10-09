ALTER TABLE `deliveryNotes` ADD COLUMN `templateData` JSON NULL;
ALTER TABLE `grnRecords` ADD COLUMN `templateData` JSON NULL;
ALTER TABLE `workOrders` ADD COLUMN `templateData` JSON NULL;
ALTER TABLE `imprests` ADD COLUMN `templateData` JSON NULL;
