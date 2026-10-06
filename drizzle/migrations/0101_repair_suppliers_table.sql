CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NULL,
  `supplierNumber` varchar(50) NOT NULL,
  `companyName` varchar(255) NOT NULL,
  `registrationNumber` varchar(100) NULL,
  `taxId` varchar(100) NULL,
  `contactPerson` varchar(255) NULL,
  `contactTitle` varchar(100) NULL,
  `email` varchar(320) NULL,
  `phone` varchar(50) NULL,
  `alternatePhone` varchar(50) NULL,
  `website` varchar(255) NULL,
  `address` text NULL,
  `city` varchar(100) NULL,
  `country` varchar(100) NULL,
  `industry` varchar(100) NULL,
  `postalCode` varchar(20) NULL,
  `bankName` varchar(255) NULL,
  `bankBranch` varchar(255) NULL,
  `accountNumber` varchar(100) NULL,
  `accountName` varchar(255) NULL,
  `paymentTerms` varchar(100) NULL,
  `paymentMethods` varchar(255) NULL,
  `categories` varchar(500) NULL,
  `qualificationStatus` enum('pending','pre_qualified','qualified','rejected','inactive') NOT NULL DEFAULT 'pending',
  `qualificationDate` datetime NULL,
  `certifications` varchar(500) NULL,
  `qualityRating` int DEFAULT 0,
  `deliveryRating` int DEFAULT 0,
  `priceCompetitiveness` int DEFAULT 0,
  `averageRating` int DEFAULT 0,
  `totalOrders` int DEFAULT 0,
  `totalSpent` int DEFAULT 0,
  `lastOrderDate` datetime NULL,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `accountManagerId` varchar(64) NULL,
  `notes` text NULL,
  `createdBy` varchar(64) NULL,
  `createdAt` timestamp NULL,
  `updatedAt` timestamp NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `suppliers_supplier_number_unique` (`supplierNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Supplier compatibility columns are checked portably for MySQL and MariaDB.
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'suppliers' AND column_name = 'organizationId') = 0, 'ALTER TABLE `suppliers` ADD COLUMN `organizationId` varchar(64) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'suppliers' AND column_name = 'industry') = 0, 'ALTER TABLE `suppliers` ADD COLUMN `industry` varchar(100) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'suppliers' AND column_name = 'accountManagerId') = 0, 'ALTER TABLE `suppliers` ADD COLUMN `accountManagerId` varchar(64) NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
