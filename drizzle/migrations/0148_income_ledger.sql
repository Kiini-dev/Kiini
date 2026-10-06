CREATE TABLE IF NOT EXISTS `saasBillingRateCards` (
  `id` varchar(64) NOT NULL,
  `planId` varchar(64) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'KES',
  `monthlyBaseCents` bigint NOT NULL DEFAULT 0,
  `annualBaseCents` bigint NOT NULL DEFAULT 0,
  `includedSeats` int NOT NULL DEFAULT 0,
  `monthlySeatCents` bigint NOT NULL DEFAULT 0,
  `annualSeatCents` bigint NOT NULL DEFAULT 0,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedBy` varchar(64) DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `saas_rate_card_plan_uq` (`planId`,`currency`),
  KEY `saas_rate_card_active_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `saasBillingRateTiers` (
  `id` varchar(64) NOT NULL,
  `rateCardId` varchar(64) NOT NULL,
  `metricKey` enum('projectsCount','tasksCount','documentsCount','storageUsedMB','apiCallsCount','emailsSent') NOT NULL,
  `tierOrder` int NOT NULL,
  `unitFrom` bigint NOT NULL DEFAULT 0,
  `unitTo` bigint DEFAULT NULL,
  `unitPriceCents` bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `saas_rate_tier_order_uq` (`rateCardId`,`metricKey`,`tierOrder`),
  KEY `saas_rate_tier_card_metric_idx` (`rateCardId`,`metricKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `incomeLedgerEntries` (
  `id` varchar(64) NOT NULL,
  `ledgerScope` enum('tenant_income','company_income','saas_revenue') NOT NULL,
  `organizationId` varchar(64) DEFAULT NULL,
  `entryNumber` varchar(100) NOT NULL,
  `entryDate` datetime NOT NULL,
  `periodStart` date DEFAULT NULL,
  `periodEnd` date DEFAULT NULL,
  `sourceType` varchar(50) NOT NULL,
  `sourceId` varchar(64) NOT NULL,
  `entryType` varchar(50) NOT NULL,
  `description` varchar(500) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `amountCents` bigint NOT NULL,
  `usageSnapshot` json DEFAULT NULL,
  `pricingSnapshot` json DEFAULT NULL,
  `reversalOfId` varchar(64) DEFAULT NULL,
  `idempotencyKey` varchar(255) NOT NULL,
  `createdBy` varchar(64) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `income_ledger_idempotency_uq` (`idempotencyKey`),
  KEY `income_ledger_scope_date_idx` (`ledgerScope`,`organizationId`,`entryDate`),
  KEY `income_ledger_source_idx` (`sourceType`,`sourceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `incomeLedgerLines` (
  `id` varchar(64) NOT NULL,
  `entryId` varchar(64) NOT NULL,
  `lineNumber` int NOT NULL,
  `accountCode` varchar(50) NOT NULL,
  `accountName` varchar(255) NOT NULL,
  `debitCents` bigint NOT NULL DEFAULT 0,
  `creditCents` bigint NOT NULL DEFAULT 0,
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `income_ledger_line_number_uq` (`entryId`,`lineNumber`),
  KEY `income_ledger_line_entry_idx` (`entryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `saasBillingRateCards`
  (`id`,`planId`,`currency`,`monthlyBaseCents`,`annualBaseCents`,`includedSeats`,
   `monthlySeatCents`,`annualSeatCents`,`isActive`,`createdBy`)
SELECT CONCAT('rate_', `id`), `id`, 'KES',
       ROUND(COALESCE(`monthlyPrice`, 0) * 100),
       ROUND(COALESCE(`annualPrice`, 0) * 100),
       CASE WHEN COALESCE(`maxUsers`, -1) > 0 THEN `maxUsers` ELSE 0 END,
       0, 0, `isActive`, 'system:migration'
FROM `pricingPlans`;

INSERT IGNORE INTO `incomeLedgerEntries`
  (`id`,`ledgerScope`,`organizationId`,`entryNumber`,`entryDate`,`periodStart`,`periodEnd`,
   `sourceType`,`sourceId`,`entryType`,`description`,`currency`,`amountCents`,
   `usageSnapshot`,`pricingSnapshot`,`idempotencyKey`,`createdBy`,`createdAt`)
SELECT CONCAT('legacy_saas_', LEFT(i.`id`, 48)), 'saas_revenue', s.`organizationId`,
       i.`invoiceNumber`, COALESCE(i.`sentAt`, i.`createdAt`, NOW()),
       DATE(i.`billingPeriodStart`), DATE(i.`billingPeriodEnd`),
       'subscription_invoice', i.`id`, 'charge',
       CONCAT('Imported subscription invoice ', i.`invoiceNumber`),
       COALESCE(i.`currency`, 'KES'), ROUND(i.`totalAmount` * 100),
       JSON_OBJECT(), JSON_OBJECT('legacyImport', TRUE),
       CONCAT('legacy-saas-invoice:', i.`id`), 'system:migration', COALESCE(i.`createdAt`, NOW())
FROM `billingInvoices` i
JOIN `subscriptions` s ON s.`id`=i.`subscriptionId`
WHERE s.`organizationId` IS NOT NULL AND i.`status` NOT IN ('cancelled','refunded','failed');

INSERT IGNORE INTO `incomeLedgerLines`
  (`id`,`entryId`,`lineNumber`,`accountCode`,`accountName`,`debitCents`,`creditCents`,`description`)
SELECT CONCAT('legacy_saas_ar_', LEFT(i.`id`, 42)),
       CONCAT('legacy_saas_', LEFT(i.`id`, 48)), 1,
       'SAAS-AR', 'SaaS Accounts Receivable', ROUND(i.`totalAmount` * 100), 0,
       CONCAT('Receivable for ', i.`invoiceNumber`)
FROM `billingInvoices` i
JOIN `subscriptions` s ON s.`id`=i.`subscriptionId`
WHERE s.`organizationId` IS NOT NULL AND i.`status` NOT IN ('cancelled','refunded','failed');

INSERT IGNORE INTO `incomeLedgerLines`
  (`id`,`entryId`,`lineNumber`,`accountCode`,`accountName`,`debitCents`,`creditCents`,`description`)
SELECT CONCAT('legacy_saas_rev_', LEFT(i.`id`, 41)),
       CONCAT('legacy_saas_', LEFT(i.`id`, 48)), 2,
       'SAAS-REV', 'SaaS Subscription Revenue', 0, ROUND(i.`totalAmount` * 100),
       CONCAT('Revenue for ', i.`invoiceNumber`)
FROM `billingInvoices` i
JOIN `subscriptions` s ON s.`id`=i.`subscriptionId`
WHERE s.`organizationId` IS NOT NULL AND i.`status` NOT IN ('cancelled','refunded','failed');

CREATE TRIGGER `income_ledger_entries_no_update`
BEFORE UPDATE ON `incomeLedgerEntries`
FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Income ledger entries are immutable; post an offsetting entry';

CREATE TRIGGER `income_ledger_entries_no_delete`
BEFORE DELETE ON `incomeLedgerEntries`
FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Income ledger entries are immutable; post an offsetting entry';

CREATE TRIGGER `income_ledger_lines_no_update`
BEFORE UPDATE ON `incomeLedgerLines`
FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Income ledger lines are immutable; post an offsetting entry';

CREATE TRIGGER `income_ledger_lines_no_delete`
BEFORE DELETE ON `incomeLedgerLines`
FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Income ledger lines are immutable; post an offsetting entry';
