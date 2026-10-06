CREATE TABLE IF NOT EXISTS `accounting_periods` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `name` varchar(100) NOT NULL,
  `startDate` date NOT NULL, `endDate` date NOT NULL, `status` enum('open','locked','closed') NOT NULL DEFAULT 'open',
  `closedBy` varchar(64), `closedAt` timestamp NULL, `reopenedBy` varchar(64), `reopenedAt` timestamp NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `period_org_dates` (`organizationId`,`startDate`,`endDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `erp_postings` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `postingDate` datetime NOT NULL,
  `sourceType` varchar(50) NOT NULL, `sourceId` varchar(64), `description` varchar(500) NOT NULL,
  `status` enum('draft','posted','reversed') NOT NULL DEFAULT 'posted', `createdBy` varchar(64),
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`),
  KEY `posting_source` (`organizationId`,`sourceType`,`sourceId`), KEY `posting_date` (`organizationId`,`postingDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `erp_posting_lines` (
  `id` varchar(64) NOT NULL, `postingId` varchar(64) NOT NULL, `accountId` varchar(64) NOT NULL,
  `debit` bigint NOT NULL DEFAULT 0, `credit` bigint NOT NULL DEFAULT 0, `description` varchar(500),
  PRIMARY KEY (`id`), KEY `posting_line_posting` (`postingId`), KEY `posting_line_account` (`accountId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reconciliation_sessions` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `bankAccountId` varchar(64) NOT NULL,
  `periodStart` date NOT NULL, `periodEnd` date NOT NULL, `statementBalance` bigint NOT NULL DEFAULT 0,
  `bookBalance` bigint NOT NULL DEFAULT 0, `difference` bigint NOT NULL DEFAULT 0,
  `status` enum('draft','in_review','approved','reopened') NOT NULL DEFAULT 'draft', `notes` text,
  `createdBy` varchar(64), `approvedBy` varchar(64), `approvedAt` timestamp NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `recon_org_period` (`organizationId`,`periodStart`,`periodEnd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `reconciliation_items` (
  `id` varchar(64) NOT NULL, `sessionId` varchar(64) NOT NULL, `bankTransactionId` varchar(64),
  `sourceType` varchar(50), `sourceId` varchar(64), `amount` bigint NOT NULL DEFAULT 0,
  `status` enum('unmatched','matched','adjustment','excluded') NOT NULL DEFAULT 'unmatched', `notes` text,
  `matchedBy` varchar(64), `matchedAt` timestamp NULL, PRIMARY KEY (`id`), KEY `recon_item_session` (`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payment_allocations` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `paymentId` varchar(64) NOT NULL,
  `invoiceId` varchar(64) NOT NULL, `amount` bigint NOT NULL, `allocatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `allocatedBy` varchar(64), PRIMARY KEY (`id`), KEY `allocation_invoice` (`organizationId`,`invoiceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fixed_assets` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `assetNumber` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL, `category` varchar(100), `acquisitionDate` date NOT NULL, `cost` bigint NOT NULL,
  `residualValue` bigint NOT NULL DEFAULT 0, `usefulLifeMonths` int NOT NULL, `depreciationMethod` enum('straight_line','declining_balance') NOT NULL DEFAULT 'straight_line',
  `accumulatedDepreciation` bigint NOT NULL DEFAULT 0, `status` enum('active','disposed','transferred') NOT NULL DEFAULT 'active',
  `location` varchar(255), `createdBy` varchar(64), `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), UNIQUE KEY `asset_org_number` (`organizationId`,`assetNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `fixed_asset_transactions` (
  `id` varchar(64) NOT NULL, `assetId` varchar(64) NOT NULL, `type` enum('acquisition','depreciation','transfer','disposal','adjustment') NOT NULL,
  `transactionDate` date NOT NULL, `amount` bigint NOT NULL DEFAULT 0, `fromLocation` varchar(255), `toLocation` varchar(255), `notes` text, `createdBy` varchar(64),
  PRIMARY KEY (`id`), KEY `asset_transaction_asset` (`assetId`,`transactionDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inventory_ledger` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `productId` varchar(64) NOT NULL, `warehouseId` varchar(64), `binId` varchar(64),
  `lotId` varchar(64), `serialNumber` varchar(150), `transactionType` varchar(50) NOT NULL, `quantity` int NOT NULL, `unitCost` bigint NOT NULL DEFAULT 0,
  `referenceType` varchar(50), `referenceId` varchar(64), `allowNegative` tinyint NOT NULL DEFAULT 0, `createdBy` varchar(64), `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `inventory_balance_key` (`organizationId`,`productId`,`warehouseId`,`binId`), KEY `inventory_lot` (`lotId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `inventory_lots` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `productId` varchar(64) NOT NULL, `lotNumber` varchar(150) NOT NULL,
  `batchNumber` varchar(150), `expiryDate` date, `quantity` int NOT NULL DEFAULT 0, `status` enum('active','quarantined','recalled','expired') NOT NULL DEFAULT 'active', `recallReason` text,
  PRIMARY KEY (`id`), UNIQUE KEY `inventory_lot_number` (`organizationId`,`productId`,`lotNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `inventory_transfers` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `fromWarehouseId` varchar(64) NOT NULL, `toWarehouseId` varchar(64) NOT NULL,
  `status` enum('draft','in_transit','received','cancelled') NOT NULL DEFAULT 'draft', `notes` text, `createdBy` varchar(64), `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `transfer_org_status` (`organizationId`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `inventory_counts` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `warehouseId` varchar(64) NOT NULL, `status` enum('open','submitted','approved') NOT NULL DEFAULT 'open', `notes` text, `createdBy` varchar(64), `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `count_org_warehouse` (`organizationId`,`warehouseId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `procurement_rfqs` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `rfqNumber` varchar(100) NOT NULL, `status` enum('draft','sent','quoted','awarded','cancelled') NOT NULL DEFAULT 'draft', `requiredDate` date, `createdBy` varchar(64), `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), UNIQUE KEY `rfq_org_number` (`organizationId`,`rfqNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `procurement_quotes` (
  `id` varchar(64) NOT NULL, `rfqId` varchar(64) NOT NULL, `supplierId` varchar(64) NOT NULL, `amount` bigint NOT NULL DEFAULT 0, `leadTimeDays` int, `validUntil` date, `status` enum('received','shortlisted','awarded','rejected') NOT NULL DEFAULT 'received', `notes` text, PRIMARY KEY (`id`), KEY `quote_rfq` (`rfqId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `supplier_price_history` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `supplierId` varchar(64) NOT NULL, `productId` varchar(64) NOT NULL, `unitPrice` bigint NOT NULL, `currency` varchar(10) NOT NULL DEFAULT 'KES', `effectiveDate` date NOT NULL, PRIMARY KEY (`id`), KEY `supplier_product_price` (`organizationId`,`supplierId`,`productId`,`effectiveDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `purchase_matchings` (
  `id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `purchaseOrderId` varchar(64), `receiptId` varchar(64), `invoiceId` varchar(64), `status` enum('open','matched','exception') NOT NULL DEFAULT 'open', `exceptionReason` text, `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `purchase_match_org` (`organizationId`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `boms` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `productId` varchar(64) NOT NULL, `version` varchar(50) NOT NULL, `status` enum('draft','active','retired') NOT NULL DEFAULT 'draft', `routingId` varchar(64), PRIMARY KEY (`id`), UNIQUE KEY `bom_version` (`organizationId`,`productId`,`version`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `bom_lines` (`id` varchar(64) NOT NULL, `bomId` varchar(64) NOT NULL, `componentProductId` varchar(64) NOT NULL, `quantity` decimal(18,6) NOT NULL, `scrapPercent` decimal(8,3) NOT NULL DEFAULT 0, PRIMARY KEY (`id`), KEY `bom_line_bom` (`bomId`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `work_centers` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `name` varchar(255) NOT NULL, `capacityHours` decimal(12,2) NOT NULL DEFAULT 0, `costPerHour` bigint NOT NULL DEFAULT 0, `status` enum('active','inactive') NOT NULL DEFAULT 'active', PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `production_orders` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `orderNumber` varchar(100) NOT NULL, `productId` varchar(64) NOT NULL, `bomId` varchar(64), `quantity` int NOT NULL, `completedQuantity` int NOT NULL DEFAULT 0, `status` enum('planned','released','in_progress','complete','cancelled') NOT NULL DEFAULT 'planned', `plannedStart` date, `plannedEnd` date, `actualCost` bigint NOT NULL DEFAULT 0, PRIMARY KEY (`id`), UNIQUE KEY `production_order_number` (`organizationId`,`orderNumber`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `quality_inspections` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `referenceType` varchar(50) NOT NULL, `referenceId` varchar(64) NOT NULL, `status` enum('pending','passed','failed','quarantined') NOT NULL DEFAULT 'pending', `inspectorId` varchar(64), `notes` text, `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `quality_reference` (`organizationId`,`referenceType`,`referenceId`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `intercompany_journals` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `fromOrganizationId` varchar(64) NOT NULL, `toOrganizationId` varchar(64) NOT NULL, `amount` bigint NOT NULL, `currency` varchar(10) NOT NULL DEFAULT 'KES', `description` varchar(500) NOT NULL, `status` enum('draft','posted','eliminated') NOT NULL DEFAULT 'draft', `createdBy` varchar(64), `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `intercompany_orgs` (`fromOrganizationId`,`toOrganizationId`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `kpi_definitions` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `name` varchar(255) NOT NULL, `metricKey` varchar(100) NOT NULL, `formula` text NOT NULL, `target` decimal(18,4), `dimensions` text, `isActive` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (`id`), KEY `kpi_org_key` (`organizationId`,`metricKey`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `integration_events` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `provider` varchar(100) NOT NULL, `eventType` varchar(150) NOT NULL, `payload` longtext NOT NULL, `status` enum('pending','processing','succeeded','failed','dead_letter') NOT NULL DEFAULT 'pending', `attempts` int NOT NULL DEFAULT 0, `nextAttemptAt` timestamp NULL, `lastError` text, `idempotencyKey` varchar(255), `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), UNIQUE KEY `integration_idempotency` (`organizationId`,`provider`,`idempotencyKey`), KEY `integration_status` (`organizationId`,`status`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `api_webhooks` (`id` varchar(64) NOT NULL, `organizationId` varchar(64) NOT NULL, `name` varchar(255) NOT NULL, `url` varchar(1000) NOT NULL, `secret` varchar(255), `events` text NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `webhook_org_active` (`organizationId`,`isActive`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;