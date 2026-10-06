CREATE TABLE IF NOT EXISTS `inventory_settings` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `valuationMethod` enum('weighted_average','fifo','standard_cost') NOT NULL DEFAULT 'weighted_average',
  `allowNegativeStock` tinyint NOT NULL DEFAULT 0,
  `updatedBy` varchar(64),
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_settings_org` (`organizationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_requisitions` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `requisitionNumber` varchar(100) NOT NULL,
  `requestedBy` varchar(64),
  `status` enum('draft','submitted','approved','converted','rejected') NOT NULL DEFAULT 'draft',
  `requiredDate` date,
  `notes` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `requisition_org_number` (`organizationId`,`requisitionNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_requisition_lines` (
  `id` varchar(64) NOT NULL,
  `requisitionId` varchar(64) NOT NULL,
  `productId` varchar(64) NOT NULL,
  `quantity` int NOT NULL,
  `estimatedUnitCost` bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `requisition_line_parent` (`requisitionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `procurement_rfqs` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `rfqNumber` varchar(100) NOT NULL,
  `status` enum('draft','sent','quoted','awarded','cancelled') NOT NULL DEFAULT 'draft',
  `requiredDate` date,
  `createdBy` varchar(64),
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rfq_org_number` (`organizationId`,`rfqNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inventory_reservations` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `productId` varchar(64) NOT NULL,
  `warehouseId` varchar(64),
  `sourceType` varchar(50) NOT NULL,
  `sourceId` varchar(64) NOT NULL,
  `quantity` int NOT NULL,
  `status` enum('reserved','picked','released','fulfilled') NOT NULL DEFAULT 'reserved',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reservation_product` (`organizationId`,`productId`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `scheduled_report_jobs` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `reportType` varchar(100) NOT NULL,
  `schedule` varchar(100) NOT NULL,
  `recipients` text NOT NULL,
  `filters` text,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `lastRunAt` timestamp NULL,
  `nextRunAt` timestamp NULL,
  PRIMARY KEY (`id`),
  KEY `scheduled_report_org_active` (`organizationId`,`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `anomaly_alerts` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `sourceType` varchar(100) NOT NULL,
  `sourceId` varchar(64),
  `severity` enum('info','warning','critical') NOT NULL DEFAULT 'warning',
  `message` text NOT NULL,
  `status` enum('open','acknowledged','resolved') NOT NULL DEFAULT 'open',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `anomaly_org_status` (`organizationId`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `integration_attempts` (
  `id` varchar(64) NOT NULL,
  `eventId` varchar(64) NOT NULL,
  `attemptNumber` int NOT NULL,
  `status` enum('processing','succeeded','failed') NOT NULL,
  `responseCode` int,
  `responseBody` text,
  `error` text,
  `attemptedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `integration_attempt_event` (`eventId`,`attemptNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;