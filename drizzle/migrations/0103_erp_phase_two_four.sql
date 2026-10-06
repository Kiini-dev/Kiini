CREATE TABLE IF NOT EXISTS `inventory_bins` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `warehouseId` varchar(64) NOT NULL,
  `code` varchar(100) NOT NULL, `name` varchar(255), `isActive` tinyint NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`), UNIQUE KEY `bin_warehouse_code` (`warehouseId`,`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `inventory_settings` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `valuationMethod` enum('weighted_average','fifo','standard_cost') NOT NULL DEFAULT 'weighted_average',
  `allowNegativeStock` tinyint NOT NULL DEFAULT 0, `updatedBy` varchar(64), `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), UNIQUE KEY `inventory_settings_org` (`organizationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `inventory_transfer_lines` (
  `id` varchar(64) NOT NULL, `transferId` varchar(64) NOT NULL, `productId` varchar(64) NOT NULL, `lotId` varchar(64), `quantity` int NOT NULL,
  PRIMARY KEY (`id`), KEY `transfer_line_transfer` (`transferId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `inventory_count_lines` (
  `id` varchar(64) NOT NULL, `countId` varchar(64) NOT NULL, `productId` varchar(64) NOT NULL, `expectedQuantity` int NOT NULL DEFAULT 0, `countedQuantity` int NOT NULL DEFAULT 0, `variance` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`), KEY `count_line_count` (`countId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_requisitions` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `requisitionNumber` varchar(100) NOT NULL, `requestedBy` varchar(64), `status` enum('draft','submitted','approved','converted','rejected') NOT NULL DEFAULT 'draft', `requiredDate` date, `notes` text, `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), UNIQUE KEY `requisition_org_number` (`organizationId`,`requisitionNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `purchase_requisition_lines` (
  `id` varchar(64) NOT NULL, `requisitionId` varchar(64) NOT NULL, `productId` varchar(64) NOT NULL, `quantity` int NOT NULL, `estimatedUnitCost` bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`), KEY `requisition_line_parent` (`requisitionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `landed_costs` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `purchaseOrderId` varchar(64) NOT NULL, `costType` varchar(100) NOT NULL, `amount` bigint NOT NULL, `allocationMethod` enum('value','quantity','weight','manual') NOT NULL DEFAULT 'value', `notes` text, `createdBy` varchar(64), PRIMARY KEY (`id`), KEY `landed_cost_order` (`organizationId`,`purchaseOrderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `supplier_returns` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `supplierId` varchar(64) NOT NULL, `referenceNumber` varchar(100) NOT NULL, `status` enum('draft','approved','shipped','credited','cancelled') NOT NULL DEFAULT 'draft', `reason` text, `createdBy` varchar(64), `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), UNIQUE KEY `supplier_return_org_ref` (`organizationId`,`referenceNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inventory_reservations` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `productId` varchar(64) NOT NULL, `warehouseId` varchar(64), `sourceType` varchar(50) NOT NULL, `sourceId` varchar(64) NOT NULL, `quantity` int NOT NULL, `status` enum('reserved','picked','released','fulfilled') NOT NULL DEFAULT 'reserved', `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `reservation_product` (`organizationId`,`productId`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `fulfilment_orders` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `sourceType` varchar(50) NOT NULL, `sourceId` varchar(64) NOT NULL, `status` enum('open','picking','packed','dispatched','delivered','returned','cancelled') NOT NULL DEFAULT 'open', `dispatchDate` date, `trackingNumber` varchar(150), `createdBy` varchar(64), `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `fulfilment_source` (`organizationId`,`sourceType`,`sourceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `fulfilment_lines` (`id` varchar(64) NOT NULL, `fulfilmentOrderId` varchar(64) NOT NULL, `productId` varchar(64) NOT NULL, `quantity` int NOT NULL, `pickedQuantity` int NOT NULL DEFAULT 0, PRIMARY KEY (`id`), KEY `fulfilment_line_parent` (`fulfilmentOrderId`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `routings` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `name` varchar(255) NOT NULL, `version` varchar(50) NOT NULL, `status` enum('draft','active','retired') NOT NULL DEFAULT 'draft', PRIMARY KEY (`id`), UNIQUE KEY `routing_version` (`organizationId`,`name`,`version`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `routing_steps` (`id` varchar(64) NOT NULL, `routingId` varchar(64) NOT NULL, `sequence` int NOT NULL, `workCenterId` varchar(64) NOT NULL, `setupMinutes` int NOT NULL DEFAULT 0, `runMinutes` int NOT NULL DEFAULT 0, PRIMARY KEY (`id`), KEY `routing_step_parent` (`routingId`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `mrp_runs` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `runDate` datetime NOT NULL, `horizonDate` date NOT NULL, `status` enum('queued','running','completed','failed') NOT NULL DEFAULT 'queued', `createdBy` varchar(64), PRIMARY KEY (`id`), KEY `mrp_org_date` (`organizationId`,`runDate`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `mrp_recommendations` (`id` varchar(64) NOT NULL, `runId` varchar(64) NOT NULL, `productId` varchar(64) NOT NULL, `requiredDate` date NOT NULL, `quantity` int NOT NULL, `sourceType` varchar(50) NOT NULL, `sourceId` varchar(64), `status` enum('suggested','approved','converted','dismissed') NOT NULL DEFAULT 'suggested', PRIMARY KEY (`id`), KEY `mrp_recommendation_run` (`runId`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `production_consumption` (`id` varchar(64) NOT NULL, `productionOrderId` varchar(64) NOT NULL, `productId` varchar(64) NOT NULL, `quantity` int NOT NULL, `unitCost` bigint NOT NULL DEFAULT 0, `postedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `production_consumption_order` (`productionOrderId`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `production_labor` (`id` varchar(64) NOT NULL, `productionOrderId` varchar(64) NOT NULL, `employeeId` varchar(64) NOT NULL, `hours` decimal(12,2) NOT NULL, `rate` bigint NOT NULL DEFAULT 0, `postedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `production_labor_order` (`productionOrderId`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `production_variances` (`id` varchar(64) NOT NULL, `productionOrderId` varchar(64) NOT NULL, `varianceType` varchar(50) NOT NULL, `amount` bigint NOT NULL, `notes` text, `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `production_variance_order` (`productionOrderId`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `quality_nonconformances` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `inspectionId` varchar(64), `referenceType` varchar(50) NOT NULL, `referenceId` varchar(64) NOT NULL, `severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium', `status` enum('open','contained','corrective_action','closed') NOT NULL DEFAULT 'open', `description` text NOT NULL, `correctiveAction` text, `createdBy` varchar(64), `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `nonconformance_org_status` (`organizationId`,`status`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `scheduled_report_jobs` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `name` varchar(255) NOT NULL, `reportType` varchar(100) NOT NULL, `schedule` varchar(100) NOT NULL, `recipients` text NOT NULL, `filters` text, `isActive` tinyint NOT NULL DEFAULT 1, `lastRunAt` timestamp NULL, `nextRunAt` timestamp NULL, PRIMARY KEY (`id`), KEY `scheduled_report_org_active` (`organizationId`,`isActive`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `anomaly_alerts` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `sourceType` varchar(100) NOT NULL, `sourceId` varchar(64), `severity` enum('info','warning','critical') NOT NULL DEFAULT 'warning', `message` text NOT NULL, `status` enum('open','acknowledged','resolved') NOT NULL DEFAULT 'open', `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `anomaly_org_status` (`organizationId`,`status`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `integration_attempts` (`id` varchar(64) NOT NULL, `eventId` varchar(64) NOT NULL, `attemptNumber` int NOT NULL, `status` enum('processing','succeeded','failed') NOT NULL, `responseCode` int, `responseBody` text, `error` text, `attemptedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `integration_attempt_event` (`eventId`,`attemptNumber`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;