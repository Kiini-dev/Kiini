-- Create supplierRatings, supplierAudits tables for procurement module

-- Supplier ratings table
CREATE TABLE IF NOT EXISTS `supplierRatings` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `supplierId` varchar(64) NOT NULL,
  `orderId` varchar(64),
  `qualityScore` int(11) NOT NULL,
  `deliveryScore` int(11) NOT NULL,
  `priceScore` int(11) NOT NULL,
  `serviceScore` int(11) NOT NULL,
  `comments` text,
  `ratedBy` varchar(64) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `rating_supplier_idx` (`supplierId`),
  KEY `rating_order_idx` (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Supplier audits table
CREATE TABLE IF NOT EXISTS `supplierAudits` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `supplierId` varchar(64) NOT NULL,
  `auditType` enum('qualification', 'compliance', 'performance', 'certification', 'manual') NOT NULL,
  `auditDate` datetime NOT NULL,
  `findings` text,
  `status` enum('passed', 'failed', 'conditional') NOT NULL,
  `actionItems` text,
  `auditedBy` varchar(64),
  `nextAuditDate` datetime,
  `notes` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `audit_supplier_idx` (`supplierId`),
  KEY `audit_date_idx` (`auditDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
