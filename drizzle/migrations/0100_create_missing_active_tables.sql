-- Create missing tables from authoritative Drizzle schema

CREATE TABLE IF NOT EXISTS `assets` (
  `id` varchar(64) NOT NULL,
  `name` varchar(200) NOT NULL,
  `category` varchar(100) NOT NULL,
  `location` varchar(200) NOT NULL,
  `value` int NOT NULL DEFAULT 0,
  `assignedTo` varchar(200),
  `serialNumber` varchar(100),
  `purchaseDate` varchar(30),
  `status` enum('active','inactive','maintenance','disposed') NOT NULL DEFAULT 'active',
  `notes` text,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contracts` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `contractNumber` varchar(50),
  `name` varchar(200) NOT NULL,
  `vendor` varchar(200) NOT NULL,
  `startDate` varchar(30) NOT NULL,
  `endDate` varchar(30) NOT NULL,
  `value` int NOT NULL DEFAULT 0,
  `status` enum('draft','active','expired','terminated') NOT NULL DEFAULT 'draft',
  `contractType` varchar(100),
  `description` text,
  `notes` text,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `creditNotes` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `creditNoteNumber` varchar(100) NOT NULL,
  `clientId` varchar(64) NOT NULL,
  `clientName` varchar(255),
  `invoiceId` varchar(64),
  `issueDate` datetime NOT NULL,
  `reason` enum('goods-returned','service-cancelled','discount','quality-issue','error','other') NOT NULL DEFAULT 'other',
  `subtotal` int NOT NULL DEFAULT 0,
  `taxAmount` int NOT NULL DEFAULT 0,
  `total` int NOT NULL DEFAULT 0,
  `status` enum('draft','approved','applied','void') NOT NULL DEFAULT 'draft',
  `notes` text,
  `createdBy` varchar(64),
  `approvedBy` varchar(64),
  `approvedAt` datetime,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customFields` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `entityType` varchar(100) NOT NULL,
  `fieldName` varchar(255) NOT NULL,
  `fieldType` enum('text','number','date','select','checkbox') NOT NULL,
  `isRequired` tinyint DEFAULT 0,
  `displayOrder` int DEFAULT 0,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dashboardLayouts` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'My Dashboard',
  `description` text,
  `gridColumns` int DEFAULT 6,
  `isDefault` tinyint DEFAULT 0,
  `layoutData` json,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dashboardWidgetData` (
  `id` varchar(64) NOT NULL,
  `widgetId` varchar(64) NOT NULL,
  `dataKey` varchar(255),
  `dataValue` json,
  `cachedAt` timestamp,
  `expiresAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dashboardWidgets` (
  `id` varchar(64) NOT NULL,
  `layoutId` varchar(64) NOT NULL,
  `widgetType` varchar(100) NOT NULL,
  `widgetTitle` varchar(255),
  `widgetSize` varchar(10) DEFAULT 'medium',
  `rowIndex` int DEFAULT 0,
  `colIndex` int DEFAULT 0,
  `refreshInterval` int DEFAULT 300,
  `config` json,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `debitNotes` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `debitNoteNumber` varchar(100) NOT NULL,
  `supplierId` varchar(64) NOT NULL,
  `supplierName` varchar(255),
  `purchaseOrderId` varchar(64),
  `issueDate` datetime NOT NULL,
  `reason` enum('quality-shortage','price-adjustment','damaged','underdelivery','penalty') NOT NULL DEFAULT 'quality-shortage',
  `subtotal` int NOT NULL DEFAULT 0,
  `taxAmount` int NOT NULL DEFAULT 0,
  `total` int NOT NULL DEFAULT 0,
  `status` enum('draft','approved','settled','void') NOT NULL DEFAULT 'draft',
  `notes` text,
  `createdBy` varchar(64),
  `approvedBy` varchar(64),
  `approvedAt` datetime,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `deliveryNotes` (
  `id` varchar(64) NOT NULL,
  `dnNo` varchar(50) NOT NULL,
  `supplier` varchar(200) NOT NULL,
  `orderId` varchar(64),
  `deliveryDate` varchar(30) NOT NULL,
  `items` int NOT NULL DEFAULT 0,
  `status` enum('pending','partial','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `notes` text,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dunningEvents` (
  `id` varchar(64) NOT NULL,
  `subscriptionId` varchar(64) NOT NULL,
  `invoiceId` varchar(64),
  `eventType` enum('retry_scheduled','retry_sent','retry_failed','suspension_notice_sent','subscription_suspended','cancellation_notice_sent','subscription_cancelled','payment_recovered') NOT NULL,
  `details` json,
  `triggeredBy` varchar(64),
  `createdAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dunningPolicies` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `maxRetries` int NOT NULL DEFAULT 3,
  `retryIntervalDays` int NOT NULL DEFAULT 3,
  `finalRetryDays` int NOT NULL DEFAULT 14,
  `suspendAfterDays` int NOT NULL DEFAULT 21,
  `cancelAfterDays` int NOT NULL DEFAULT 30,
  `notificationTemplate` varchar(64),
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `employeePromotions` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `promotionDate` datetime NOT NULL,
  `previousJobGroupId` varchar(64) NOT NULL,
  `newJobGroupId` varchar(64) NOT NULL,
  `previousSalary` int NOT NULL,
  `newSalary` int NOT NULL,
  `promotionReason` text,
  `approvedBy` varchar(64),
  `approvalDate` datetime,
  `notes` text,
  `createdAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `employeeSkills` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `skillName` varchar(255) NOT NULL,
  `proficiencyLevel` enum('beginner','intermediate','advanced','expert') NOT NULL DEFAULT 'beginner',
  `yearsOfExperience` int DEFAULT 0,
  `certifications` text,
  `lastAssessmentDate` datetime,
  `endorsements` int DEFAULT 0,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `employeeTransfers` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `transferDate` datetime NOT NULL,
  `previousDepartmentId` varchar(64),
  `newDepartmentId` varchar(64) NOT NULL,
  `transferReason` text,
  `approvedBy` varchar(64),
  `approvalDate` datetime,
  `notes` text,
  `createdAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fieldValidations` (
  `id` varchar(64) NOT NULL,
  `fieldId` varchar(64) NOT NULL,
  `validationType` varchar(100) NOT NULL,
  `validationValue` text,
  `createdAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fieldValues` (
  `id` varchar(64) NOT NULL,
  `fieldId` varchar(64) NOT NULL,
  `entityId` varchar(64) NOT NULL,
  `value` longtext,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `goodsReceiptNotes` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `grno` varchar(50) NOT NULL,
  `purchaseOrderId` varchar(64) NOT NULL,
  `receivedDate` datetime NOT NULL,
  `totalQuantity` int,
  `notes` text,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `grnRecords` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `grnNo` varchar(50) NOT NULL,
  `supplier` varchar(200) NOT NULL,
  `invNo` varchar(50),
  `receivedDate` varchar(30) NOT NULL,
  `items` int NOT NULL DEFAULT 0,
  `value` int NOT NULL DEFAULT 0,
  `status` enum('accepted','partial','rejected','pending') NOT NULL DEFAULT 'pending',
  `notes` text,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `holidays` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `type` enum('national','company','regional','optional') NOT NULL DEFAULT 'national',
  `isPublic` tinyint DEFAULT 1,
  `description` text,
  `appliesTo` varchar(100),
  `isApproved` tinyint DEFAULT 1,
  `approvedBy` varchar(64),
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `hrSettings` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `annualLeaveEntitlement` int DEFAULT 21,
  `sickLeaveEntitlement` int DEFAULT 10,
  `probationMonths` int DEFAULT 3,
  `maxLeaveCarryover` int DEFAULT 5,
  `nssfContributionRate` int DEFAULT 6,
  `nhifTiered` tinyint DEFAULT 1,
  `defaultPaymentMethod` varchar(50) DEFAULT 'bank_transfer',
  `autoGeneratePayslips` tinyint DEFAULT 1,
  `autoAccrueLeave` tinyint DEFAULT 1,
  `leaveAccrualDay` int DEFAULT 1,
  `payrollDay` int DEFAULT 20,
  `countryCode` varchar(5) DEFAULT 'KE',
  `payrollRegion` varchar(50) DEFAULT 'east_africa',
  `leavePolicy` json,
  `statutoryReportTemplates` json,
  `statutoryAuditingEnabled` tinyint DEFAULT 1,
  `autoApprovePayroll` tinyint DEFAULT 0,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `leads` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `leadNo` varchar(50) NOT NULL,
  `companyName` varchar(255) NOT NULL,
  `contactName` varchar(255) NOT NULL,
  `email` varchar(320),
  `phone` varchar(20),
  `source` enum('website','referral','social_media','cold_outreach','event','trade_show','other') NOT NULL,
  `estimatedValue` int DEFAULT 0,
  `currency` varchar(3) DEFAULT 'KES',
  `country` varchar(10),
  `industry` varchar(100),
  `status` enum('new','contacted','qualified','proposal_sent','negotiating','closed_won','closed_lost') NOT NULL DEFAULT 'new',
  `assignedTo` varchar(64),
  `notes` text,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NOT NULL,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `leaveApprovals` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `leaveRequestId` varchar(64) NOT NULL,
  `approverId` varchar(64) NOT NULL,
  `approvalStatus` enum('pending','approved','rejected') NOT NULL,
  `approvalComments` text,
  `approvalDate` datetime,
  `createdAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `leaveBalances` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `fiscalYear` int NOT NULL,
  `leaveType` enum('annual','sick','maternity','paternity','unpaid','compassion') NOT NULL,
  `totalEntitlement` int NOT NULL,
  `accrued` int DEFAULT 0,
  `used` int DEFAULT 0,
  `pending` int DEFAULT 0,
  `carryover` int DEFAULT 0,
  `available` int DEFAULT 0,
  `lastAccrualDate` datetime,
  `notes` text,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mpesaTransactions` (
  `id` varchar(64) NOT NULL,
  `invoiceId` varchar(64),
  `transactionId` varchar(100) NOT NULL,
  `checkoutRequestId` varchar(100),
  `amount` int NOT NULL,
  `phoneNumber` varchar(20) NOT NULL,
  `status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
  `mpesaReceiptNumber` varchar(100),
  `resultCode` int,
  `transactionTime` timestamp,
  `createdAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `onboardingChecklists` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `jobGroupId` varchar(64) NOT NULL,
  `startDate` datetime NOT NULL,
  `probationEndDate` datetime,
  `overallProgress` int DEFAULT 0,
  `status` enum('in_progress','completed','paused') NOT NULL DEFAULT 'in_progress',
  `completedDate` datetime,
  `notes` text,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `onboardingTasks` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `checklistId` varchar(64) NOT NULL,
  `taskName` varchar(255) NOT NULL,
  `category` enum('it_setup','paperwork','training','introduction','other') NOT NULL DEFAULT 'other',
  `description` text,
  `assignedTo` varchar(64),
  `dueDate` datetime,
  `completedDate` datetime,
  `completedBy` varchar(64),
  `status` enum('pending','in_progress','completed','skipped') NOT NULL DEFAULT 'pending',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `notes` text,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `orderNumber` varchar(100) NOT NULL,
  `clientId` varchar(64) NOT NULL,
  `orderDate` datetime NOT NULL,
  `deliveryDate` datetime,
  `totalAmount` int NOT NULL,
  `status` enum('draft','pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'draft',
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `organizationAccountingPolicies` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `country` varchar(10) NOT NULL DEFAULT 'KE',
  `fiscalYearStart` varchar(5) NOT NULL DEFAULT '01-01',
  `fiscalYearEnd` varchar(5) NOT NULL DEFAULT '12-31',
  `accountingMethod` enum('accrual','cash') NOT NULL DEFAULT 'accrual',
  `defaultCurrency` varchar(3) NOT NULL DEFAULT 'KES',
  `taxInclusiveInvoicing` tinyint NOT NULL DEFAULT 1,
  `autoReconciliation` tinyint NOT NULL DEFAULT 0,
  `requireInvoiceApproval` tinyint NOT NULL DEFAULT 1,
  `requireExpenseApproval` tinyint NOT NULL DEFAULT 1,
  `defaultPaymentTerms` varchar(20) DEFAULT 'net30',
  `depreciationMethod` enum('straight_line','declining_balance','units_of_production') DEFAULT 'straight_line',
  `capitalizedAssetThreshold` int DEFAULT 50000,
  `roundingMethod` enum('round','truncate') DEFAULT 'round',
  `retentionPeriod` int DEFAULT 7,
  `auditTrailRequired` tinyint NOT NULL DEFAULT 1,
  `allowManualJournalEntries` tinyint NOT NULL DEFAULT 1,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NOT NULL,
  `updatedBy` varchar(64),
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `paymentRetries` (
  `id` varchar(64) NOT NULL,
  `invoiceId` varchar(64) NOT NULL,
  `subscriptionId` varchar(64) NOT NULL,
  `attemptNumber` int NOT NULL DEFAULT 1,
  `status` enum('pending','processing','failed','succeeded','abandoned') NOT NULL DEFAULT 'pending',
  `failureReason` varchar(255),
  `paymentMethod` varchar(50),
  `attemptedAt` timestamp,
  `nextRetryAt` timestamp,
  `metadata` json,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payrollBatches` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `batchNumber` varchar(50) NOT NULL,
  `payMonth` datetime NOT NULL,
  `payPeriodStart` datetime NOT NULL,
  `payPeriodEnd` datetime NOT NULL,
  `employeeCount` int DEFAULT 0,
  `totalGross` int DEFAULT 0,
  `totalDeductions` int DEFAULT 0,
  `totalNet` int DEFAULT 0,
  `status` enum('draft','calculated','approved','processed','paid') NOT NULL DEFAULT 'draft',
  `createdBy` varchar(64) NOT NULL,
  `approvedBy` varchar(64),
  `approvalDate` datetime,
  `processedBy` varchar(64),
  `processedDate` datetime,
  `notes` text,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchaseOrderItems` (
  `id` varchar(64) NOT NULL,
  `purchaseOrderId` varchar(64) NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `rate` int NOT NULL,
  `amount` int NOT NULL,
  `lineNumber` int,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchaseOrders` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `poNumber` varchar(50) NOT NULL,
  `supplierId` varchar(64) NOT NULL,
  `supplierName` varchar(255) NOT NULL,
  `poDate` datetime NOT NULL,
  `deliveryDate` datetime,
  `subtotal` int NOT NULL,
  `taxAmount` int DEFAULT 0,
  `total` int NOT NULL,
  `status` enum('draft','approved','received','partially_received','cancelled') NOT NULL DEFAULT 'draft',
  `approvedBy` varchar(64),
  `approvedAt` datetime,
  `receivedAt` datetime,
  `notes` text,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NOT NULL,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quotations` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `rfqNo` varchar(50) NOT NULL,
  `supplier` varchar(200) NOT NULL,
  `description` text,
  `amount` int NOT NULL DEFAULT 0,
  `dueDate` varchar(30),
  `status` enum('draft','submitted','under_review','approved','rejected') NOT NULL DEFAULT 'draft',
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `recurringExpenses` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `category` varchar(100) NOT NULL,
  `vendor` varchar(255),
  `amount` int NOT NULL,
  `description` text,
  `paymentMethod` enum('cash','bank_transfer','cheque','card','other'),
  `frequency` enum('weekly','biweekly','monthly','quarterly','annually') NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime,
  `nextDueDate` datetime NOT NULL,
  `dayOfMonth` int DEFAULT 1,
  `reminderDaysBefore` int DEFAULT 3,
  `lastGeneratedDate` datetime,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `chartOfAccountId` int,
  `createdBy` varchar(64),
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `smsAutomationRules` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `trigger` enum('invoice_created','payment_failed','payment_received','subscription_expiring','appointment_reminder','custom_event') NOT NULL,
  `templateId` varchar(64) NOT NULL,
  `conditions` json,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `smsDeliveryEvents` (
  `id` varchar(64) NOT NULL,
  `queueId` varchar(64) NOT NULL,
  `eventType` enum('sent','delivered','failed') NOT NULL,
  `timestamp` timestamp,
  `metadata` json,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `smsTemplates` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` enum('invoice_notification','payment_reminder','delivery_notification','appointment_reminder','promotional','transactional','custom') NOT NULL,
  `variables` json,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `usageCount` int NOT NULL DEFAULT 0,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stripeCustomers` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `clientId` varchar(64),
  `stripeCustomerId` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `metadata` json,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stripePaymentIntents` (
  `id` varchar(64) NOT NULL,
  `invoiceId` varchar(64) NOT NULL,
  `stripePaymentIntentId` varchar(255) NOT NULL,
  `clientId` varchar(64),
  `amount` int NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'usd',
  `status` enum('requires_payment_method','requires_confirmation','requires_action','processing','requires_capture','canceled','succeeded') NOT NULL DEFAULT 'requires_payment_method',
  `clientSecret` varchar(255),
  `receiptEmail` varchar(320),
  `metadata` json,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stripeWebhookEvents` (
  `id` varchar(64) NOT NULL,
  `stripeEventId` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `data` json,
  `processed` tinyint NOT NULL DEFAULT 0,
  `processedAt` timestamp,
  `createdAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `systemLogs` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `userId` varchar(64),
  `severity` enum('debug','info','warning','error','critical') NOT NULL DEFAULT 'info',
  `message` text NOT NULL,
  `context` text,
  `service` varchar(100),
  `action` varchar(100),
  `stackTrace` text,
  `ipAddress` varchar(100),
  `userAgent` varchar(500),
  `createdAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `taxCompliance` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `taxYear` int NOT NULL,
  `grossIncome` int DEFAULT 0,
  `nssfAmount` int DEFAULT 0,
  `taxableIncome` int DEFAULT 0,
  `payeDeducted` int DEFAULT 0,
  `nhifAmount` int DEFAULT 0,
  `reliefs` int DEFAULT 0,
  `taxDue` int DEFAULT 0,
  `taxPaid` int DEFAULT 0,
  `balanceDue` int DEFAULT 0,
  `p9aGenerated` tinyint DEFAULT 0,
  `p9bGenerated` tinyint DEFAULT 0,
  `p9cGenerated` tinyint DEFAULT 0,
  `kraSubmitted` tinyint DEFAULT 0,
  `submissionDate` datetime,
  `status` enum('draft','generated','submitted','approved') NOT NULL DEFAULT 'draft',
  `notes` text,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `timesheets` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `weekStartDate` datetime NOT NULL,
  `weekEndDate` datetime NOT NULL,
  `monday` int DEFAULT 0,
  `tuesday` int DEFAULT 0,
  `wednesday` int DEFAULT 0,
  `thursday` int DEFAULT 0,
  `friday` int DEFAULT 0,
  `saturday` int DEFAULT 0,
  `sunday` int DEFAULT 0,
  `totalHours` int DEFAULT 0,
  `projectIds` text,
  `notes` text,
  `status` enum('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
  `submittedBy` varchar(64),
  `submittedAt` datetime,
  `approvedBy` varchar(64),
  `approvedAt` datetime,
  `rejectionReason` text,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `trainingEnrollments` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `courseId` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `enrollmentDate` datetime NOT NULL,
  `status` enum('enrolled','in_progress','completed','dropped','passed','failed') NOT NULL DEFAULT 'enrolled',
  `attendancePercentage` int DEFAULT 0,
  `score` int DEFAULT 0,
  `certificateIssued` tinyint DEFAULT 0,
  `certificateDate` datetime,
  `certificateUrl` varchar(500),
  `feedback` text,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `name` varchar(200) NOT NULL,
  `code` varchar(50),
  `address` text,
  `contactPerson` varchar(200),
  `phone` varchar(50),
  `status` varchar(20) DEFAULT 'active',
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `warranties` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `product` varchar(200) NOT NULL,
  `vendor` varchar(200) NOT NULL,
  `expiryDate` varchar(30) NOT NULL,
  `coverage` varchar(500) NOT NULL,
  `status` enum('active','expiring_soon','expired') NOT NULL DEFAULT 'active',
  `serialNumber` varchar(100),
  `claimTerms` text,
  `notes` text,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `workflowAutomationLogs` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `workflowType` varchar(100) NOT NULL,
  `sourceEntityId` varchar(64),
  `sourceEntityType` varchar(50),
  `targetEntityId` varchar(64),
  `status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
  `errorMessage` text,
  `executedBy` varchar(64),
  `executedAt` datetime NOT NULL,
  `createdAt` timestamp NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activeSessions` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `userEmail` varchar(320) NOT NULL,
  `organizationId` varchar(64),
  `ipAddress` varchar(100) NOT NULL,
  `userAgent` varchar(500) NOT NULL,
  `deviceType` varchar(50),
  `browser` varchar(100),
  `browserVersion` varchar(50),
  `operatingSystem` varchar(100),
  `osVersion` varchar(50),
  `tokenHash` varchar(255),
  `lastActivity` timestamp,
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `approvalWorkflows` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `workflowType` enum('leave_request','expense_report','payroll_batch','promotion','transfer') NOT NULL,
  `entityId` varchar(64) NOT NULL,
  `requestedBy` varchar(64) NOT NULL,
  `requestedAt` datetime NOT NULL,
  `currentApprover` varchar(64),
  `approverLevel` int DEFAULT 1,
  `approverComments` text,
  `status` enum('pending','approved','rejected','recalled') NOT NULL DEFAULT 'pending',
  `approvedAt` datetime,
  `approvedBy` varchar(64),
  `escalated` tinyint DEFAULT 0,
  `escalationReason` text,
  `createdAt` timestamp,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `automationConfigs` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `workflowType` varchar(100) NOT NULL,
  `enabled` tinyint NOT NULL DEFAULT 1,
  `configuration` json,
  `createdAt` timestamp NOT NULL,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

