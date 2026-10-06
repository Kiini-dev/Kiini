-- Migration 0041: Create receipts table, fix photoUrl column sizes

-- Create receipts table (was missing from DB)
CREATE TABLE IF NOT EXISTS `receipts` (
  `id` varchar(64) NOT NULL,
  `receiptNumber` varchar(100) NOT NULL,
  `clientId` varchar(64) NOT NULL,
  `paymentId` varchar(64) DEFAULT NULL,
  `amount` int NOT NULL,
  `paymentMethod` enum('cash','bank_transfer','cheque','mpesa','card','other') NOT NULL,
  `receiptDate` datetime NOT NULL,
  `notes` text,
  `createdBy` varchar(64) DEFAULT NULL,
  `approvedBy` varchar(64) DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fix photoUrl column in users table (expand to LONGTEXT to hold base64 images)
ALTER TABLE `users` MODIFY COLUMN `photoUrl` LONGTEXT;

-- Fix photoUrl column in employees table
ALTER TABLE `employees` MODIFY COLUMN `photoUrl` LONGTEXT;
