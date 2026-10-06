-- Create workOrders table
CREATE TABLE IF NOT EXISTS `workOrders` (
  `id` VARCHAR(64) NOT NULL,
  `workOrderNumber` VARCHAR(100) NOT NULL,
  `issueDate` DATETIME NOT NULL,
  `description` TEXT NOT NULL,
  `assignedTo` VARCHAR(64) NOT NULL,
  `priority` ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `startDate` DATETIME NOT NULL,
  `targetEndDate` DATETIME NOT NULL,
  `laborCost` INT DEFAULT 0,
  `serviceCost` INT DEFAULT 0,
  `total` INT NOT NULL,
  `notes` TEXT,
  `status` ENUM('draft','open','in-progress','completed','cancelled') NOT NULL DEFAULT 'draft',
  `createdBy` VARCHAR(64) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `work_order_number_idx` (`workOrderNumber`),
  INDEX `assigned_to_idx` (`assignedTo`),
  INDEX `status_idx` (`status`),
  INDEX `issue_date_idx` (`issueDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create workOrderMaterials table
CREATE TABLE IF NOT EXISTS `workOrderMaterials` (
  `id` VARCHAR(64) NOT NULL,
  `workOrderId` VARCHAR(64) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `quantity` INT NOT NULL,
  `unitCost` INT NOT NULL,
  `total` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `work_order_idx` (`workOrderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` VARCHAR(64) NOT NULL,
  `orderNumber` VARCHAR(50) NOT NULL,
  `supplierId` VARCHAR(64) NOT NULL,
  `supplierName` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `items` TEXT,
  `totalAmount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `deliveryAddress` TEXT,
  `expectedDelivery` VARCHAR(100) DEFAULT NULL,
  `paymentTerms` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('draft','sent','confirmed','delivered','invoiced') NOT NULL DEFAULT 'draft',
  `createdBy` VARCHAR(64) DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
