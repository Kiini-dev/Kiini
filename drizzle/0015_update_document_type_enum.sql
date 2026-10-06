-- Update documentNumberFormats table to include 'payment' in documentType enum
ALTER TABLE `documentNumberFormats` 
MODIFY COLUMN `documentType` ENUM('invoice','estimate','receipt','proposal','expense','payment') NOT NULL;
