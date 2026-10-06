CREATE TABLE `activeSessions` (
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
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `activeSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiChatMessages` (
	`id` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`tokens` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `aiChatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiChatSessions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`title` varchar(255),
	`messageCount` int DEFAULT 0,
	`lastMessageAt` timestamp,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `aiChatSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_configurations` (
	`id` varchar(64) NOT NULL,
	`configType` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`model` varchar(100),
	`capabilities` text,
	`parameters` text,
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`metrics` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_configurations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiDocuments` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`documentType` enum('contract','invoice','proposal','brief','report','email') NOT NULL,
	`originalContent` longtext NOT NULL,
	`summary` text,
	`keyPoints` json,
	`actionItems` json,
	`financialSummary` json,
	`generatedAt` timestamp DEFAULT (now()),
	`status` enum('processed','failed','pending') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `aiDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_insights` (
	`id` varchar(64) NOT NULL,
	`insightType` varchar(100) NOT NULL,
	`title` varchar(300),
	`description` text,
	`confidence` decimal(5,4) DEFAULT '0',
	`impact` varchar(50) DEFAULT 'MEDIUM',
	`trend` varchar(50) DEFAULT 'neutral',
	`recommendation` text,
	`entityType` varchar(100),
	`entityId` varchar(64),
	`period` varchar(50),
	`dataPayload` text,
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_metrics` (
	`id` varchar(64) NOT NULL,
	`metricName` varchar(200) NOT NULL,
	`metricType` varchar(100) NOT NULL,
	`value` decimal(15,4) DEFAULT '0',
	`unit` varchar(50),
	`period` varchar(50),
	`dimensions` text,
	`changePercent` decimal(10,2) DEFAULT '0',
	`benchmark` decimal(15,4),
	`dataPayload` text,
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `apiKeys` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`keyName` varchar(255) NOT NULL,
	`keyValue` varchar(255) NOT NULL,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`isActive` tinyint DEFAULT 1,
	`rateLimit` int DEFAULT 1000,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `apiKeys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_pricing_configs` (
	`id` varchar(64) NOT NULL,
	`apiId` varchar(100),
	`name` varchar(200) NOT NULL,
	`pricingModel` varchar(50) NOT NULL DEFAULT 'FIXED',
	`basePrice` decimal(12,2) DEFAULT '0',
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`rateLimit` int DEFAULT 10000,
	`config` text,
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_pricing_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approvalWorkflows` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approvalWorkflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assets` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automatedReceipts` (
	`id` varchar(64) NOT NULL,
	`invoiceId` varchar(64) NOT NULL,
	`receiptNumber` varchar(50) NOT NULL,
	`amountReceived` decimal(10,2) NOT NULL,
	`amountOutstanding` decimal(10,2) DEFAULT '0',
	`paymentStatus` enum('partial','full') NOT NULL,
	`paymentMethod` varchar(50),
	`paymentReference` varchar(255),
	`autoGenerated` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `automatedReceipts_id` PRIMARY KEY(`id`),
	CONSTRAINT `automatedReceipts_receiptNumber_unique` UNIQUE(`receiptNumber`)
);
--> statement-breakpoint
CREATE TABLE `automationConfigs` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`workflowType` varchar(100) NOT NULL,
	`enabled` tinyint NOT NULL DEFAULT 1,
	`configuration` json,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp,
	CONSTRAINT `automationConfigs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backup_history` (
	`id` varchar(64) NOT NULL,
	`name` varchar(200) NOT NULL,
	`backupType` varchar(50) NOT NULL DEFAULT 'full',
	`scope` varchar(50) NOT NULL DEFAULT 'full',
	`scopeEntityId` varchar(64),
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`tablesList` text,
	`recordCount` int DEFAULT 0,
	`sizeBytes` int DEFAULT 0,
	`fileName` varchar(500),
	`errorMessage` text,
	`completedAt` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `backup_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backup_schedules` (
	`id` varchar(64) NOT NULL,
	`name` varchar(200),
	`backupType` varchar(50) NOT NULL DEFAULT 'FULL',
	`schedule` varchar(100),
	`retentionDays` int DEFAULT 30,
	`status` varchar(50) NOT NULL DEFAULT 'SCHEDULED',
	`lastRun` timestamp,
	`nextRun` timestamp,
	`config` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `backup_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bankReconciliationDetails` (
	`id` varchar(64) NOT NULL,
	`statementId` varchar(64) NOT NULL,
	`transactionId` varchar(64),
	`transactionType` varchar(50),
	`bankDate` datetime NOT NULL,
	`description` varchar(255),
	`amount` int,
	`matched` tinyint NOT NULL DEFAULT 0,
	`matchedTransactionId` varchar(64),
	`matchedAmount` int,
	`createdAt` timestamp NOT NULL,
	CONSTRAINT `bankReconciliationDetails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bankReconciliationStatements` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`bankAccountId` varchar(64) NOT NULL,
	`statementDate` datetime NOT NULL,
	`openingBalance` int,
	`closingBalance` int,
	`status` enum('pending','reconciled','variance_identified') NOT NULL DEFAULT 'pending',
	`reconciliationNotes` text,
	`reconcililedBy` varchar(64),
	`reconcililedAt` datetime,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp,
	CONSTRAINT `bankReconciliationStatements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `billingInvoices` (
	`id` varchar(64) NOT NULL,
	`subscriptionId` varchar(64) NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`tax` decimal(10,2) DEFAULT '0',
	`totalAmount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('pending','sent','viewed','paid','failed','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`billingPeriodStart` timestamp NOT NULL,
	`billingPeriodEnd` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`sentAt` timestamp,
	`paidAt` timestamp,
	`paymentMethod` varchar(50),
	`paymentReference` varchar(255),
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `billingInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `billingInvoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `billingNotifications` (
	`id` varchar(64) NOT NULL,
	`subscriptionId` varchar(64) NOT NULL,
	`notificationType` enum('payment_due_7days','payment_due_today','payment_overdue_1day','payment_overdue_3days','subscription_expiring_7days','subscription_expiring_today','subscription_expired','system_locked','payment_failed','usage_limit_warning','renewal_successful') NOT NULL,
	`message` text,
	`sentTo` varchar(320),
	`channel` enum('email','in_app','sms') DEFAULT 'email',
	`isSent` tinyint DEFAULT 0,
	`sentAt` timestamp,
	`isRead` tinyint DEFAULT 0,
	`readAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `billingNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `billingUsageMetrics` (
	`id` varchar(64) NOT NULL,
	`subscriptionId` varchar(64) NOT NULL,
	`metricDate` datetime NOT NULL,
	`usersCount` int DEFAULT 0,
	`projectsCount` int DEFAULT 0,
	`tasksCount` int DEFAULT 0,
	`documentsCount` int DEFAULT 0,
	`storageUsedMB` int DEFAULT 0,
	`apiCallsCount` int DEFAULT 0,
	`emailsSent` int DEFAULT 0,
	`recordedAt` timestamp DEFAULT (now()),
	CONSTRAINT `billingUsageMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`departmentId` varchar(64) NOT NULL,
	`amount` int NOT NULL,
	`remaining` int NOT NULL,
	`fiscalYear` int NOT NULL,
	`budgetName` varchar(255),
	`budgetDescription` text,
	`budgetStatus` enum('draft','active','inactive','closed') DEFAULT 'draft',
	`startDate` datetime,
	`endDate` datetime,
	`approvedBy` varchar(64),
	`approvedAt` datetime,
	`createdBy` varchar(64),
	`totalBudgeted` int DEFAULT 0,
	`totalActual` int DEFAULT 0,
	`variance` int DEFAULT 0,
	`variancePercent` int DEFAULT 0,
	`createdAt` timestamp,
	`updatedAt` timestamp,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `canned_responses` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`category` varchar(100) NOT NULL DEFAULT 'General',
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`shortCode` varchar(50),
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `canned_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientHealthScores` (
	`id` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`healthScore` int DEFAULT 50,
	`riskLevel` enum('green','yellow','red') DEFAULT 'yellow',
	`paymentTimeliness` int DEFAULT 50,
	`invoiceFrequency` int DEFAULT 50,
	`totalRevenue` int DEFAULT 0,
	`overdueAmount` int DEFAULT 0,
	`projectSuccessRate` int DEFAULT 50,
	`churnRisk` int DEFAULT 0,
	`lifetimeValue` int DEFAULT 0,
	`lastActivityDate` timestamp,
	`calculatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `clientHealthScores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientSubscriptions` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`clientId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','paused','cancelled','expired') NOT NULL DEFAULT 'active',
	`frequency` enum('weekly','biweekly','monthly','quarterly','annually') NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(10) DEFAULT 'KES',
	`startDate` datetime NOT NULL,
	`endDate` datetime,
	`nextBillingDate` datetime NOT NULL,
	`lastBilledDate` datetime,
	`templateInvoiceId` varchar(64),
	`recurringInvoiceId` varchar(64),
	`autoSendInvoice` tinyint NOT NULL DEFAULT 1,
	`totalBilled` int DEFAULT 0,
	`invoiceCount` int DEFAULT 0,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cohort_analyses` (
	`id` varchar(64) NOT NULL,
	`analysisType` varchar(100) NOT NULL,
	`cohortType` varchar(50),
	`name` varchar(200),
	`period` varchar(50),
	`dataPayload` text,
	`retentionData` text,
	`funnelData` text,
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cohort_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collaboration_sessions` (
	`id` varchar(64) NOT NULL,
	`sessionType` varchar(100) NOT NULL,
	`documentId` varchar(64),
	`channelId` varchar(64),
	`userId` varchar(64),
	`message` text,
	`dataPayload` text,
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collaboration_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_records` (
	`id` varchar(64) NOT NULL,
	`recordType` varchar(100) NOT NULL,
	`standard` varchar(100),
	`score` int DEFAULT 0,
	`status` varchar(50) NOT NULL DEFAULT 'COMPLIANT',
	`findings` text,
	`dataPayload` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`clientId` varchar(64),
	`salutation` varchar(20),
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`mobile` varchar(50),
	`jobTitle` varchar(200),
	`department` varchar(200),
	`isPrimary` tinyint DEFAULT 0,
	`notes` text,
	`address` text,
	`city` varchar(100),
	`country` varchar(100),
	`postalCode` varchar(20),
	`linkedIn` varchar(500),
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `container_deployments` (
	`id` varchar(64) NOT NULL,
	`name` varchar(200) NOT NULL,
	`orchestrator` varchar(50),
	`serviceName` varchar(200),
	`image` varchar(500),
	`replicas` int DEFAULT 1,
	`port` int,
	`status` varchar(50) NOT NULL DEFAULT 'PENDING',
	`config` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `container_deployments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversationMembers` (
	`id` varchar(64) NOT NULL,
	`conversationId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`role` enum('member','moderator','admin') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp DEFAULT (now()),
	`leftAt` timestamp,
	`lastReadAt` timestamp,
	`unreadCount` int DEFAULT 0,
	`isMuted` tinyint DEFAULT 0,
	`isActive` tinyint NOT NULL DEFAULT 1,
	CONSTRAINT `conversationMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` varchar(64) NOT NULL,
	`type` enum('direct','group','channel') NOT NULL DEFAULT 'direct',
	`name` varchar(255),
	`description` text,
	`conversationIcon` varchar(500),
	`createdBy` varchar(64) NOT NULL,
	`isArchived` tinyint DEFAULT 0,
	`archivedAt` timestamp,
	`isEncrypted` tinyint NOT NULL DEFAULT 1,
	`encryptionKey` varchar(255),
	`lastMessageAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creditNotes` (
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
	CONSTRAINT `creditNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `currencies` (
	`id` varchar(64) NOT NULL,
	`code` varchar(3) NOT NULL,
	`name` varchar(100) NOT NULL,
	`symbol` varchar(10),
	`decimalPlaces` int DEFAULT 2,
	`isActive` tinyint DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `currencies_id` PRIMARY KEY(`id`),
	CONSTRAINT `currencies_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `custom_dashboards` (
	`id` varchar(64) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`layout` varchar(50) NOT NULL DEFAULT 'grid',
	`widgets` text,
	`isPublic` tinyint NOT NULL DEFAULT 0,
	`sharedWith` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_dashboards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customFields` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`fieldName` varchar(255) NOT NULL,
	`fieldType` enum('text','number','date','select','checkbox') NOT NULL,
	`isRequired` tinyint DEFAULT 0,
	`displayOrder` int DEFAULT 0,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customFields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_reports` (
	`id` varchar(64) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`dataSources` text,
	`layout` text,
	`format` enum('PDF','Excel','CSV','HTML') NOT NULL DEFAULT 'PDF',
	`isTemplate` tinyint NOT NULL DEFAULT 0,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`owner` varchar(200),
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customRoles` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`name` varchar(100) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`description` text,
	`permissions` text,
	`baseRole` enum('user','admin','staff','accountant','client','super_admin','project_manager','hr','ict_manager','procurement_manager','sales_manager') DEFAULT 'staff',
	`isAdvanced` tinyint NOT NULL DEFAULT 0,
	`isSystem` tinyint NOT NULL DEFAULT 0,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdBy` varchar(64),
	`createdAt` timestamp,
	`updatedAt` timestamp,
	CONSTRAINT `customRoles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboardLayouts` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT 'My Dashboard',
	`description` text,
	`gridColumns` int DEFAULT 6,
	`isDefault` tinyint DEFAULT 0,
	`layoutData` json,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboardLayouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboardWidgetData` (
	`id` varchar(64) NOT NULL,
	`widgetId` varchar(64) NOT NULL,
	`dataKey` varchar(255),
	`dataValue` json,
	`cachedAt` timestamp DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `dashboardWidgetData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboardWidgets` (
	`id` varchar(64) NOT NULL,
	`layoutId` varchar(64) NOT NULL,
	`widgetType` varchar(100) NOT NULL,
	`widgetTitle` varchar(255),
	`widgetSize` varchar(10) DEFAULT 'medium',
	`rowIndex` int DEFAULT 0,
	`colIndex` int DEFAULT 0,
	`refreshInterval` int DEFAULT 300,
	`config` json,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboardWidgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debitNotes` (
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
	CONSTRAINT `debitNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveryNotes` (
	`id` varchar(64) NOT NULL,
	`dnNo` varchar(50) NOT NULL,
	`supplier` varchar(200) NOT NULL,
	`orderId` varchar(64),
	`deliveryDate` varchar(30) NOT NULL,
	`items` int NOT NULL DEFAULT 0,
	`status` enum('pending','partial','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveryNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departmentHierarchies` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`parentDepartmentId` varchar(64),
	`departmentId` varchar(64) NOT NULL,
	`level` int DEFAULT 0,
	`path` varchar(500),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `departmentHierarchies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `design_configs` (
	`id` varchar(64) NOT NULL,
	`configType` varchar(100) NOT NULL,
	`name` varchar(200),
	`theme` varchar(50),
	`config` text,
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `design_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentAccess` (
	`id` varchar(64) NOT NULL,
	`documentId` varchar(64) NOT NULL,
	`userId` varchar(64),
	`roleId` varchar(64),
	`accessLevel` enum('view','download','edit','share') DEFAULT 'view',
	`grantedBy` varchar(64),
	`grantedAt` timestamp DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `documentAccess_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentVersions` (
	`id` varchar(64) NOT NULL,
	`documentId` varchar(64) NOT NULL,
	`versionNumber` int DEFAULT 1,
	`fileUrl` varchar(500) NOT NULL,
	`fileSize` int DEFAULT 0,
	`uploadedBy` varchar(64) NOT NULL,
	`changeNotes` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `documentVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`documentName` varchar(255) NOT NULL,
	`documentType` enum('contract','agreement','proposal','template','invoice','receipt','other') DEFAULT 'other',
	`fileUrl` varchar(500) NOT NULL,
	`fileSize` int DEFAULT 0,
	`mimeType` varchar(100),
	`linkedEntityType` varchar(100),
	`linkedEntityId` varchar(64),
	`linkedClientId` varchar(64),
	`linkedProjectId` varchar(64),
	`linkedInvoiceId` varchar(64),
	`uploadedBy` varchar(64) NOT NULL,
	`currentVersion` int DEFAULT 1,
	`status` enum('active','archived','deleted') DEFAULT 'active',
	`expiryDate` timestamp,
	`requiresSignature` tinyint DEFAULT 0,
	`isSigned` tinyint DEFAULT 0,
	`signedDate` timestamp,
	`signedBy` varchar(64),
	`tags` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dunningEvents` (
	`id` varchar(64) NOT NULL,
	`subscriptionId` varchar(64) NOT NULL,
	`invoiceId` varchar(64),
	`eventType` enum('retry_scheduled','retry_sent','retry_failed','suspension_notice_sent','subscription_suspended','cancellation_notice_sent','subscription_cancelled','payment_recovered') NOT NULL,
	`details` json,
	`triggeredBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `dunningEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dunningPolicies` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dunningPolicies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_calendar_sync` (
	`id` varchar(64) NOT NULL,
	`provider` varchar(50) NOT NULL,
	`email` varchar(200),
	`title` varchar(200),
	`description` text,
	`startTime` varchar(100),
	`endTime` varchar(100),
	`attendees` text,
	`location` varchar(500),
	`syncStatus` varchar(50) NOT NULL DEFAULT 'pending',
	`config` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_calendar_sync_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailCampaigns` (
	`id` varchar(64) NOT NULL,
	`campaignName` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`bodyHtml` longtext NOT NULL,
	`bodyText` longtext,
	`fromEmail` varchar(320) NOT NULL,
	`fromName` varchar(255),
	`recipientCount` int DEFAULT 0,
	`sentCount` int DEFAULT 0,
	`openCount` int DEFAULT 0,
	`clickCount` int DEFAULT 0,
	`failureCount` int DEFAULT 0,
	`status` enum('draft','scheduled','sending','sent','failed','paused') NOT NULL DEFAULT 'draft',
	`scheduledFor` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `emailCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailGenerationHistory` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`templateType` enum('invoice_followup','proposal','project_update','general','payment_reminder') NOT NULL,
	`tone` enum('professional','friendly','formal','casual') NOT NULL DEFAULT 'professional',
	`generatedContent` text NOT NULL,
	`originalContext` text,
	`recipientId` varchar(64),
	`wasSent` tinyint NOT NULL DEFAULT 0,
	`sentAt` timestamp,
	`feedback` varchar(20),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `emailGenerationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailLog` (
	`id` varchar(64) NOT NULL,
	`queueId` varchar(64),
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`status` enum('sent','failed') NOT NULL,
	`messageId` varchar(255),
	`errorMessage` text,
	`sentAt` timestamp DEFAULT (now()),
	CONSTRAINT `emailLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailLogs` (
	`id` varchar(64) NOT NULL,
	`campaignId` varchar(64),
	`recipientEmail` varchar(320) NOT NULL,
	`userId` varchar(64),
	`subject` varchar(500) NOT NULL,
	`status` enum('pending','sent','bounced','failed','opened','clicked') NOT NULL DEFAULT 'pending',
	`provider` varchar(50),
	`providerMessageId` varchar(255),
	`sentAt` timestamp,
	`failureReason` text,
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `emailLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailQueue` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`recipientEmail` varchar(320) NOT NULL,
	`recipientName` varchar(255),
	`subject` varchar(500) NOT NULL,
	`htmlContent` text NOT NULL,
	`textContent` text,
	`eventType` varchar(100) NOT NULL,
	`entityType` varchar(100),
	`entityId` varchar(64),
	`userId` varchar(64),
	`status` enum('pending','sent','failed','retrying') NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`maxAttempts` int NOT NULL DEFAULT 3,
	`lastAttemptAt` timestamp,
	`nextRetryAt` timestamp,
	`errorMessage` text,
	`metadata` text,
	`sentAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeePromotions` (
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
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `employeePromotions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeeSkills` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`skillName` varchar(255) NOT NULL,
	`proficiencyLevel` enum('beginner','intermediate','advanced','expert') NOT NULL DEFAULT 'beginner',
	`yearsOfExperience` int DEFAULT 0,
	`certifications` text,
	`lastAssessmentDate` datetime,
	`endorsements` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeeSkills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeeTransfers` (
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
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `employeeTransfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `etl_jobs` (
	`id` varchar(64) NOT NULL,
	`jobName` varchar(200) NOT NULL,
	`sourceSystem` varchar(200),
	`targetTable` varchar(200),
	`schedule` varchar(100),
	`status` varchar(50) NOT NULL DEFAULT 'PENDING',
	`progress` int DEFAULT 0,
	`recordsProcessed` int DEFAULT 0,
	`config` text,
	`lastRun` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `etl_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exchangeRates` (
	`id` varchar(64) NOT NULL,
	`fromCurrency` varchar(3) NOT NULL,
	`toCurrency` varchar(3) NOT NULL,
	`rate` int DEFAULT 0,
	`rateDate` timestamp NOT NULL,
	`source` varchar(100),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `exchangeRates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `executive_reports` (
	`id` varchar(64) NOT NULL,
	`reportType` varchar(100) NOT NULL,
	`title` varchar(300),
	`period` varchar(50),
	`horizon` varchar(50),
	`dataPayload` text,
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`recipients` int DEFAULT 0,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `executive_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenseCategories` (
	`id` varchar(64) NOT NULL,
	`categoryName` varchar(255) NOT NULL,
	`description` text,
	`taxDeductible` tinyint DEFAULT 1,
	`accountCode` varchar(50),
	`isActive` tinyint DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `expenseCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenseReports` (
	`id` varchar(64) NOT NULL,
	`submittedBy` varchar(64) NOT NULL,
	`reportDate` timestamp NOT NULL,
	`totalAmount` int DEFAULT 0,
	`currency` varchar(10) DEFAULT 'KES',
	`status` enum('draft','submitted','approved','rejected','reimbursed') DEFAULT 'draft',
	`approvedBy` varchar(64),
	`approvalDate` timestamp,
	`reimbursementDate` timestamp,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenseReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `export_jobs` (
	`id` varchar(64) NOT NULL,
	`name` varchar(200),
	`dataType` varchar(100) NOT NULL,
	`format` varchar(50) NOT NULL DEFAULT 'csv',
	`filters` text,
	`status` varchar(50) NOT NULL DEFAULT 'processing',
	`fileUrl` varchar(500),
	`fileSize` bigint,
	`rowsExported` int DEFAULT 0,
	`schedule` varchar(50),
	`recipients` text,
	`expiresAt` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `export_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fieldValidations` (
	`id` varchar(64) NOT NULL,
	`fieldId` varchar(64) NOT NULL,
	`validationType` varchar(100) NOT NULL,
	`validationValue` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `fieldValidations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fieldValues` (
	`id` varchar(64) NOT NULL,
	`fieldId` varchar(64) NOT NULL,
	`entityId` varchar(64) NOT NULL,
	`value` longtext,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fieldValues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialAnalytics` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`month` datetime NOT NULL,
	`totalRevenue` int DEFAULT 0,
	`totalExpenses` int DEFAULT 0,
	`netProfit` int DEFAULT 0,
	`expenseTrends` json,
	`revenueTrends` json,
	`costReductionOpportunities` json,
	`cashFlowForecast` json,
	`analysisNotes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `financialAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forecastModels` (
	`id` varchar(64) NOT NULL,
	`modelName` varchar(255) NOT NULL,
	`modelType` enum('revenue','expense','headcount','client_churn') DEFAULT 'revenue',
	`algorithm` varchar(100),
	`accuracy` int DEFAULT 0,
	`trainingDataPoints` int DEFAULT 0,
	`lastTrainedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forecastModels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forecastResults` (
	`id` varchar(64) NOT NULL,
	`modelId` varchar(64) NOT NULL,
	`forecastPeriod` varchar(50) NOT NULL,
	`forecastDate` timestamp NOT NULL,
	`predictedValue` int DEFAULT 0,
	`confidenceInterval` int DEFAULT 0,
	`confidenceLower` int DEFAULT 0,
	`confidenceUpper` int DEFAULT 0,
	`actualValue` int,
	`variance` int,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `forecastResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `global_configs` (
	`id` varchar(64) NOT NULL,
	`configType` varchar(100) NOT NULL,
	`name` varchar(200) NOT NULL,
	`region` varchar(100),
	`config` text,
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `global_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goodsReceiptNotes` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`grno` varchar(50) NOT NULL,
	`purchaseOrderId` varchar(64) NOT NULL,
	`receivedDate` datetime NOT NULL,
	`totalQuantity` int,
	`notes` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL,
	CONSTRAINT `goodsReceiptNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grnRecords` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `grnRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `holidays` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `holidays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hrSettings` (
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
	`leavePolicy` json DEFAULT ('{"annual":21,"sick":10,"maxCarryover":5,"accrualRatePerMonth":2}'),
	`statutoryReportTemplates` json DEFAULT ('{"payslip":"standard","taxForm":"P9","auditTrail":"standard"}'),
	`statutoryAuditingEnabled` tinyint DEFAULT 1,
	`autoApprovePayroll` tinyint DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hrSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imprestSurrenders` (
	`id` varchar(64) NOT NULL,
	`imprestId` varchar(64) NOT NULL,
	`totalExpensed` int NOT NULL,
	`variance` int,
	`returnedAmount` int,
	`status` enum('settled','variance_pending','under_review') NOT NULL DEFAULT 'settled',
	`settledBy` varchar(64) NOT NULL,
	`settledAt` datetime NOT NULL,
	`createdAt` timestamp NOT NULL,
	CONSTRAINT `imprestSurrenders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imprests` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`imprestNumber` varchar(50) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`employeeName` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`purpose` varchar(255) NOT NULL,
	`requestDate` datetime NOT NULL,
	`status` enum('pending','approved','disbursed','settled','cancelled') NOT NULL DEFAULT 'pending',
	`approvedBy` varchar(64),
	`approvedAt` datetime,
	`disbursedAt` datetime,
	`settledAt` datetime,
	`notes` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp,
	CONSTRAINT `imprests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integration_configs` (
	`id` varchar(64) NOT NULL,
	`provider` varchar(100) NOT NULL,
	`name` varchar(200),
	`service` varchar(100),
	`integrationType` varchar(50),
	`config` text,
	`status` varchar(20) DEFAULT 'inactive',
	`isActive` tinyint NOT NULL DEFAULT 1,
	`lastSync` timestamp,
	`lastSyncAt` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integration_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrationLogs` (
	`id` varchar(64) NOT NULL,
	`webhookId` varchar(64),
	`eventType` varchar(100) NOT NULL,
	`payload` text,
	`responseStatus` int,
	`errorMessage` text,
	`attemptNumber` int DEFAULT 1,
	`success` tinyint DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `integrationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoiceReminders` (
	`id` varchar(64) NOT NULL,
	`invoiceId` varchar(64) NOT NULL,
	`reminderType` enum('overdue_1day','overdue_3days','overdue_7days','overdue_14days','overdue_30days') NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`sentAt` timestamp DEFAULT (now()),
	`sentBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `invoiceReminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobAlertHistory` (
	`id` varchar(64) NOT NULL,
	`ruleId` varchar(64) NOT NULL,
	`alertRuleId` varchar(64),
	`alertMessage` text,
	`message` text,
	`sentAt` timestamp DEFAULT (now()),
	`alert_sent_at` timestamp,
	`recipients` json,
	CONSTRAINT `jobAlertHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobAlertRules` (
	`id` varchar(64) NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`alertType` enum('failure','timeout','performance') NOT NULL,
	`threshold` int,
	`triggerCondition` varchar(100),
	`failureThreshold` int,
	`durationThresholdMs` int,
	`notificationChannels` json,
	`recipients` json,
	`action` varchar(100),
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `jobAlertRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobExecutionLogs` (
	`id` varchar(64) NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`status` enum('pending','running','completed','failed','success','partial','timeout') NOT NULL DEFAULT 'pending',
	`startTime` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`executedAt` timestamp,
	`endTime` timestamp,
	`duration` int,
	`durationMs` int,
	`itemsProcessed` int DEFAULT 0,
	`itemsFailed` int DEFAULT 0,
	`itemsSkipped` int DEFAULT 0,
	`errorMessage` text,
	`stdout` longtext,
	`stderr` longtext,
	`metadata` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `jobExecutionLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobGroups` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`name` varchar(100) NOT NULL,
	`managerId` varchar(64),
	`minimumGrossSalary` int NOT NULL,
	`maximumGrossSalary` int NOT NULL,
	`description` text,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp,
	`updatedAt` timestamp,
	CONSTRAINT `jobGroups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobHeartbeat` (
	`id` varchar(64) NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`lastHeartbeatAt` timestamp DEFAULT (now()),
	`checkedAt` timestamp,
	`expectedHeartbeatInterval` int,
	`isHealthy` tinyint DEFAULT 1,
	`consecutiveFailures` int DEFAULT 0,
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `jobHeartbeat_id` PRIMARY KEY(`id`),
	CONSTRAINT `jobHeartbeat_jobId_unique` UNIQUE(`jobId`)
);
--> statement-breakpoint
CREATE TABLE `kb_articles` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`categoryId` varchar(64) NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text,
	`excerpt` text,
	`status` varchar(20) DEFAULT 'published',
	`featured` tinyint DEFAULT 0,
	`readTime` int DEFAULT 3,
	`views` int DEFAULT 0,
	`tags` text,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kb_articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kb_categories` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`name` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`icon` varchar(50) DEFAULT 'BookOpen',
	`color` varchar(30) DEFAULT 'bg-blue-500',
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kb_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
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
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaveApprovals` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`leaveRequestId` varchar(64) NOT NULL,
	`approverId` varchar(64) NOT NULL,
	`approvalStatus` enum('pending','approved','rejected') NOT NULL,
	`approvalComments` text,
	`approvalDate` datetime,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `leaveApprovals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaveBalances` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaveBalances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lpos` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`lpoNumber` varchar(100) NOT NULL,
	`supplierId` varchar(64) NOT NULL,
	`issueDate` datetime NOT NULL,
	`deliveryDate` datetime,
	`totalAmount` int NOT NULL,
	`status` enum('draft','issued','acknowledged','partially_received','received','cancelled') NOT NULL DEFAULT 'draft',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lpos_id` PRIMARY KEY(`id`),
	CONSTRAINT `lpos_lpoNumber_unique` UNIQUE(`lpoNumber`)
);
--> statement-breakpoint
CREATE TABLE `messageReadReceipts` (
	`id` varchar(64) NOT NULL,
	`messageId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`readAt` timestamp DEFAULT (now()),
	CONSTRAINT `messageReadReceipts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(64) NOT NULL,
	`conversationId` varchar(64) NOT NULL,
	`senderId` varchar(64) NOT NULL,
	`messageType` enum('text','image','file','system') NOT NULL DEFAULT 'text',
	`content` longtext NOT NULL,
	`fileUrl` varchar(500),
	`fileName` varchar(255),
	`fileSize` int,
	`mimeType` varchar(100),
	`isEdited` tinyint DEFAULT 0,
	`editedAt` timestamp,
	`isDeleted` tinyint DEFAULT 0,
	`deletedAt` timestamp,
	`reactions` json,
	`encryptionIv` varchar(255),
	`encryptionTag` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mobile_app_configs` (
	`id` varchar(64) NOT NULL,
	`platform` varchar(50) NOT NULL,
	`appVersion` varchar(50),
	`bundleId` varchar(200),
	`packageName` varchar(200),
	`config` text,
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mobile_app_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mpesaTransactions` (
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
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `mpesaTransactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `mpesaTransactions_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` varchar(64) NOT NULL,
	`title` varchar(300) NOT NULL,
	`content` text,
	`category` varchar(100) NOT NULL DEFAULT 'General',
	`pinned` tinyint NOT NULL DEFAULT 0,
	`favorite` tinyint NOT NULL DEFAULT 0,
	`createdBy` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationBroadcasts` (
	`id` varchar(64) NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` longtext NOT NULL,
	`target` enum('all_users','specific_role','specific_department','specific_plan','custom') NOT NULL,
	`targetValue` varchar(255),
	`priority` enum('low','normal','high','critical') NOT NULL DEFAULT 'normal',
	`channels` json,
	`status` enum('draft','scheduled','sending','sent','cancelled') NOT NULL DEFAULT 'draft',
	`scheduledFor` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`recipientCount` int DEFAULT 0,
	`sentCount` int DEFAULT 0,
	`failedCount` int DEFAULT 0,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationBroadcasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationPreferences` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`slackWebhookUrl` varchar(500),
	`phoneNumber` varchar(20),
	`quietHoursStart` varchar(5),
	`quietHoursEnd` varchar(5),
	`timeZone` varchar(50) DEFAULT 'UTC',
	`createdAt` timestamp,
	`updatedAt` timestamp,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationRules` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`channelType` enum('email','in_app','push','sms') DEFAULT 'in_app',
	`doNotDisturbStart` varchar(5),
	`doNotDisturbEnd` varchar(5),
	`frequency` enum('instant','daily','weekly','never') DEFAULT 'instant',
	`enabled` tinyint DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationSettings` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`channelType` enum('in_app','email','sms','slack') NOT NULL,
	`isEnabled` tinyint NOT NULL DEFAULT 1,
	`notificationType` enum('payment','project','client','financial','system') NOT NULL,
	`frequency` enum('immediate','daily_digest','weekly_digest','never') NOT NULL DEFAULT 'immediate',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `notificationSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationTemplates` (
	`id` varchar(64) NOT NULL,
	`templateKey` varchar(100) NOT NULL,
	`templateName` varchar(255) NOT NULL,
	`category` enum('billing','system','user','document','communication','security') NOT NULL,
	`subject` varchar(500),
	`bodyTemplate` longtext NOT NULL,
	`channels` json,
	`variables` json,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationTemplates_templateKey_unique` UNIQUE(`templateKey`)
);
--> statement-breakpoint
CREATE TABLE `onboardingChecklists` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboardingChecklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboardingTasks` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboardingTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`orderNumber` varchar(100) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`orderDate` datetime NOT NULL,
	`deliveryDate` datetime,
	`totalAmount` int NOT NULL,
	`status` enum('draft','pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'draft',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `organizationAccountingPolicies` (
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
	CONSTRAINT `organizationAccountingPolicies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizationFeatures` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`featureKey` varchar(100) NOT NULL,
	`isEnabled` tinyint NOT NULL DEFAULT 1,
	`config` json,
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizationFeatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizationUsers` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('super_admin','admin','manager','staff','viewer','ict_manager','project_manager','hr','accountant','procurement_manager','sales_manager') NOT NULL DEFAULT 'staff',
	`position` varchar(100),
	`department` varchar(100),
	`phone` varchar(20),
	`photoUrl` longtext,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`invitationSent` tinyint NOT NULL DEFAULT 0,
	`invitationSentAt` timestamp,
	`invitationAcceptedAt` timestamp,
	`lastSignedIn` timestamp,
	`loginCount` int DEFAULT 0,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizationUsers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`plan` varchar(50) NOT NULL DEFAULT 'trial',
	`isActive` tinyint NOT NULL DEFAULT 1,
	`isArchived` tinyint NOT NULL DEFAULT 0,
	`archivedAt` timestamp,
	`archivedBy` varchar(64),
	`maxUsers` int DEFAULT 10,
	`settings` json,
	`logoUrl` longtext,
	`domain` varchar(255),
	`contactEmail` varchar(320),
	`contactPhone` varchar(50),
	`address` text,
	`country` varchar(100),
	`industry` varchar(100),
	`website` varchar(255),
	`taxId` varchar(100),
	`billingEmail` varchar(320),
	`timezone` varchar(100) DEFAULT 'Africa/Nairobi',
	`currency` varchar(10) DEFAULT 'KES',
	`description` text,
	`employeeCount` int,
	`registrationNumber` varchar(100),
	`paymentMethod` varchar(50),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_deals` (
	`id` varchar(64) NOT NULL,
	`partnerId` varchar(64),
	`partnerName` varchar(200),
	`dealName` varchar(200) NOT NULL,
	`customerId` varchar(64),
	`dealValue` decimal(15,2) DEFAULT '0',
	`tier` varchar(50),
	`status` varchar(50) NOT NULL DEFAULT 'REGISTERED',
	`commissionRate` decimal(5,2) DEFAULT '0',
	`closureDate` varchar(100),
	`config` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_deals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentMethods` (
	`id` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`type` enum('credit_card','debit_card','bank_account','paypal','mpesa') NOT NULL,
	`provider` varchar(50),
	`lastFourDigits` varchar(4),
	`expiryMonth` int,
	`expiryYear` int,
	`holderName` varchar(255),
	`bankName` varchar(255),
	`accountNumber` varchar(50),
	`isDefault` tinyint DEFAULT 0,
	`isActive` tinyint DEFAULT 1,
	`providerMethodId` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentMethods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentRetries` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentRetries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentTriggers` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`invoiceId` varchar(64),
	`triggerType` varchar(100) NOT NULL,
	`triggerDate` timestamp,
	`isActive` tinyint DEFAULT 1,
	`status` varchar(50) DEFAULT 'pending',
	`actionType` varchar(100) DEFAULT 'invoice_generate',
	`amount` decimal(10,2),
	`description` text,
	`metadata` json,
	`retryCount` int DEFAULT 0,
	`lastRetryAt` timestamp,
	`nextRetryAt` timestamp,
	`completedAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentTriggers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payrollBatches` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payrollBatches_id` PRIMARY KEY(`id`),
	CONSTRAINT `payrollBatches_batchNumber_unique` UNIQUE(`batchNumber`)
);
--> statement-breakpoint
CREATE TABLE `payrollDetails` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`batchId` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`payMonth` datetime NOT NULL,
	`basicSalary` int NOT NULL,
	`allowances` int DEFAULT 0,
	`bonuses` int DEFAULT 0,
	`grossSalary` int NOT NULL,
	`countryCode` varchar(5) DEFAULT 'KE',
	`currencyLabel` varchar(10) DEFAULT 'KES',
	`nssfDeduction` int DEFAULT 0,
	`nhifDeduction` int DEFAULT 0,
	`payeDeduction` int DEFAULT 0,
	`loanDeduction` int DEFAULT 0,
	`otherDeductions` int DEFAULT 0,
	`totalDeductions` int NOT NULL,
	`netSalary` int NOT NULL,
	`paymentMethod` varchar(50),
	`paymentReference` varchar(100),
	`status` enum('draft','approved','paid','pending') NOT NULL DEFAULT 'draft',
	`paidDate` datetime,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payrollDetails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payslips` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`payrollDetailId` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`payslipNumber` varchar(50) NOT NULL,
	`payMonth` datetime NOT NULL,
	`basicSalary` int NOT NULL,
	`allowances` int DEFAULT 0,
	`bonuses` int DEFAULT 0,
	`grossSalary` int NOT NULL,
	`countryCode` varchar(5) DEFAULT 'KE',
	`currencyLabel` varchar(10) DEFAULT 'KES',
	`nssfDeduction` int DEFAULT 0,
	`nhifDeduction` int DEFAULT 0,
	`payeDeduction` int DEFAULT 0,
	`loanDeduction` int DEFAULT 0,
	`otherDeductions` int DEFAULT 0,
	`totalDeductions` int NOT NULL,
	`netSalary` int NOT NULL,
	`bankAccountNumber` varchar(100),
	`bankName` varchar(255),
	`status` enum('generated','sent','viewed','downloaded') NOT NULL DEFAULT 'generated',
	`sentAt` datetime,
	`viewedAt` datetime,
	`downloadedAt` datetime,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `payslips_id` PRIMARY KEY(`id`),
	CONSTRAINT `payslips_payslipNumber_unique` UNIQUE(`payslipNumber`)
);
--> statement-breakpoint
CREATE TABLE `perf_configs` (
	`id` varchar(64) NOT NULL,
	`configType` varchar(100) NOT NULL,
	`name` varchar(200),
	`strategy` varchar(100),
	`config` text,
	`status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `perf_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceContracts` (
	`id` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`departmentId` varchar(64),
	`jobGroupId` varchar(64),
	`contractNumber` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`startDate` datetime NOT NULL,
	`endDate` datetime,
	`status` enum('draft','active','expired','terminated') NOT NULL DEFAULT 'draft',
	`salary` int,
	`terms` text,
	`objectives` text,
	`signedAt` datetime,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performanceContracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceReviews` (
	`id` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`reviewerId` varchar(64) NOT NULL,
	`reviewDate` timestamp DEFAULT (now()),
	`period` varchar(50) NOT NULL,
	`overallRating` int DEFAULT 0,
	`performanceScore` int DEFAULT 0,
	`productivity` int DEFAULT 0,
	`collaboration` int DEFAULT 0,
	`communication` int DEFAULT 0,
	`technicalSkills` int DEFAULT 0,
	`leadership` int DEFAULT 0,
	`comments` text,
	`goals` text,
	`developmentPlan` text,
	`status` enum('draft','completed','archived') DEFAULT 'draft',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performanceReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissionAuditLog` (
	`id` varchar(64) NOT NULL,
	`roleId` varchar(64),
	`userId` varchar(64),
	`permissionId` varchar(100),
	`permissionLabel` varchar(255),
	`action` varchar(50) NOT NULL,
	`changedBy` varchar(64),
	`oldValue` text,
	`newValue` text,
	`reason` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `permissionAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissionAuditLogs` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`orgId` varchar(64) NOT NULL,
	`feature` varchar(100) NOT NULL,
	`action` enum('CHECK','GRANT','DENY','CREATE','UPDATE','DELETE','DELEGATE') NOT NULL,
	`allowed` tinyint NOT NULL,
	`reason` text,
	`metadata` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `permissionAuditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissionDelegations` (
	`id` varchar(64) NOT NULL,
	`fromUserId` varchar(64) NOT NULL,
	`toUserId` varchar(64) NOT NULL,
	`orgId` varchar(64) NOT NULL,
	`features` json NOT NULL,
	`startDate` datetime NOT NULL,
	`endDate` datetime NOT NULL,
	`reason` text,
	`status` enum('active','expired','revoked') NOT NULL DEFAULT 'active',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permissionDelegations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permission_metadata` (
	`id` varchar(64) NOT NULL,
	`permissionId` varchar(100) NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`icon` varchar(100),
	`isSystem` tinyint DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permission_metadata_id` PRIMARY KEY(`id`),
	CONSTRAINT `permission_metadata_permissionId_unique` UNIQUE(`permissionId`)
);
--> statement-breakpoint
CREATE TABLE `pricingPlans` (
	`id` varchar(64) NOT NULL,
	`planName` varchar(255) NOT NULL,
	`planSlug` varchar(100) NOT NULL,
	`description` longtext,
	`tier` enum('free','starter','professional','enterprise','custom') NOT NULL,
	`monthlyPrice` decimal(10,2) DEFAULT '0',
	`annualPrice` decimal(10,2) DEFAULT '0',
	`monthlyAnnualDiscount` decimal(5,2) DEFAULT '0',
	`maxUsers` int DEFAULT -1,
	`maxProjects` int DEFAULT -1,
	`maxStorageGB` int DEFAULT -1,
	`features` json,
	`supportLevel` enum('email','priority','24/7_phone','dedicated_manager') DEFAULT 'email',
	`isActive` tinyint NOT NULL DEFAULT 1,
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricingPlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `pricingPlans_planSlug_unique` UNIQUE(`planSlug`)
);
--> statement-breakpoint
CREATE TABLE `pricingTierFeatures` (
	`id` varchar(64) NOT NULL,
	`tier` varchar(50) NOT NULL,
	`featureKey` varchar(100) NOT NULL,
	`isEnabled` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `pricingTierFeatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectMetrics` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`revenue` int DEFAULT 0,
	`costs` int DEFAULT 0,
	`profit` int DEFAULT 0,
	`profitMargin` int DEFAULT 0,
	`hoursEstimated` int DEFAULT 0,
	`hoursActual` int DEFAULT 0,
	`teamMembersCount` int DEFAULT 0,
	`completionPercentage` int DEFAULT 0,
	`statusKey` varchar(50) DEFAULT 'on-time',
	`riskLevel` enum('low','medium','high') DEFAULT 'low',
	`calculatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `projectMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseOrderItems` (
	`id` varchar(64) NOT NULL,
	`purchaseOrderId` varchar(64) NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`rate` int NOT NULL,
	`amount` int NOT NULL,
	`lineNumber` int,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL,
	CONSTRAINT `purchaseOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseOrders` (
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
	CONSTRAINT `purchaseOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotations` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`rfqNo` varchar(50) NOT NULL,
	`supplier` varchar(200) NOT NULL,
	`description` text,
	`amount` int NOT NULL DEFAULT 0,
	`dueDate` varchar(30),
	`status` enum('draft','submitted','under_review','approved','rejected') NOT NULL DEFAULT 'draft',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurringExpenses` (
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
	CONSTRAINT `recurringExpenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurringInvoiceTemplates` (
	`id` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`invoiceName` varchar(255) NOT NULL,
	`description` text,
	`frequency` enum('daily','weekly','biweekly','monthly','quarterly','semi_annual','annual') NOT NULL,
	`startDate` datetime NOT NULL,
	`endDate` datetime,
	`nextInvoiceDate` datetime NOT NULL,
	`items` json,
	`taxRate` decimal(5,2) DEFAULT '0',
	`discount` decimal(5,2) DEFAULT '0',
	`discountType` enum('percentage','fixed') DEFAULT 'percentage',
	`notes` text,
	`paymentTerms` int,
	`autoSend` tinyint NOT NULL DEFAULT 1,
	`autoCreateReceipt` tinyint NOT NULL DEFAULT 1,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recurringInvoiceTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `registered_devices` (
	`id` varchar(64) NOT NULL,
	`deviceId` varchar(200) NOT NULL,
	`deviceType` varchar(50) NOT NULL,
	`pushToken` varchar(500),
	`platform` varchar(50),
	`appVersion` varchar(50),
	`lastSync` timestamp,
	`syncConfig` text,
	`userId` varchar(64),
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `registered_devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reimbursements` (
	`id` varchar(64) NOT NULL,
	`expenseReportId` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`totalAmount` int DEFAULT 0,
	`currency` varchar(10) DEFAULT 'KES',
	`paymentMethod` varchar(50) NOT NULL,
	`paymentDate` timestamp,
	`referenceNumber` varchar(100),
	`status` enum('pending','approved','processed','failed') DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `reimbursements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduledJobs` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`jobName` varchar(255) NOT NULL,
	`jobType` varchar(100) NOT NULL,
	`schedule` varchar(255) NOT NULL,
	`description` text,
	`cronExpression` varchar(255),
	`handler` varchar(255),
	`status` enum('active','inactive','paused') NOT NULL DEFAULT 'active',
	`isActive` tinyint NOT NULL DEFAULT 1,
	`isManualOnly` tinyint NOT NULL DEFAULT 0,
	`lastRun` timestamp,
	`nextRun` timestamp,
	`lastExecutedAt` timestamp,
	`nextExecutionAt` timestamp,
	`lastRunAt` timestamp,
	`lastRunStatus` enum('success','failed','partial','timeout'),
	`lastRunDuration` int,
	`nextScheduledRun` timestamp,
	`lastFailureReason` text,
	`failureCount` int DEFAULT 0,
	`timezone` varchar(100) DEFAULT 'UTC',
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduledJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`taskTitle` varchar(255) NOT NULL,
	`description` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`duration` int DEFAULT 0,
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
	`assignedTo` varchar(64),
	`projectId` varchar(64),
	`recurrencePattern` varchar(100),
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_events` (
	`id` varchar(64) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`action` varchar(200),
	`severity` varchar(50) NOT NULL DEFAULT 'MEDIUM',
	`resourceId` varchar(200),
	`userId` varchar(64),
	`details` text,
	`status` varchar(50) NOT NULL DEFAULT 'LOGGED',
	`ipAddress` varchar(100),
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `security_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_incidents` (
	`id` varchar(64) NOT NULL,
	`title` varchar(200) NOT NULL,
	`threatType` varchar(100) NOT NULL,
	`severity` varchar(50) NOT NULL DEFAULT 'MEDIUM',
	`source` varchar(200),
	`targetAsset` varchar(200),
	`status` varchar(50) NOT NULL DEFAULT 'DETECTED',
	`details` text,
	`scanConfig` text,
	`resolvedAt` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `security_incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serviceInvoiceItems` (
	`id` varchar(64) NOT NULL,
	`serviceInvoiceId` varchar(64) NOT NULL,
	`description` text NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` int NOT NULL DEFAULT 0,
	`total` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `serviceInvoiceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serviceInvoices` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`serviceInvoiceNumber` varchar(50) NOT NULL,
	`issueDate` varchar(30) NOT NULL,
	`dueDate` varchar(30) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`clientName` varchar(200) NOT NULL,
	`serviceDescription` text NOT NULL,
	`total` int NOT NULL DEFAULT 0,
	`taxAmount` int NOT NULL DEFAULT 0,
	`notes` text,
	`status` enum('draft','sent','accepted','paid','cancelled') NOT NULL DEFAULT 'draft',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceInvoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skillsMatrix` (
	`id` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`skillName` varchar(255) NOT NULL,
	`proficiencyLevel` enum('beginner','intermediate','advanced','expert') DEFAULT 'beginner',
	`yearsOfExperience` int DEFAULT 0,
	`lastAssessmentDate` timestamp,
	`certifications` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `skillsMatrix_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smart_workflows` (
	`id` varchar(64) NOT NULL,
	`name` varchar(200) NOT NULL,
	`triggerType` varchar(50) NOT NULL DEFAULT 'event',
	`triggerConfig` text,
	`actions` text,
	`conditions` text,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`executionCount` int NOT NULL DEFAULT 0,
	`lastExecuted` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smart_workflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smsAutomationRules` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`trigger` enum('invoice_created','payment_failed','payment_received','subscription_expiring','appointment_reminder','custom_event') NOT NULL,
	`templateId` varchar(64) NOT NULL,
	`conditions` json,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `smsAutomationRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smsCustomerPreferences` (
	`id` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`optedIn` boolean NOT NULL DEFAULT true,
	`marketingOptedIn` boolean NOT NULL DEFAULT false,
	`transactionalOptedIn` boolean NOT NULL DEFAULT true,
	`reminderPreferences` json,
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `smsCustomerPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smsDeliveryEvents` (
	`id` varchar(64) NOT NULL,
	`queueId` varchar(64) NOT NULL,
	`eventType` enum('sent','delivered','failed') NOT NULL,
	`timestamp` timestamp DEFAULT (now()),
	`metadata` json,
	CONSTRAINT `smsDeliveryEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smsQueue` (
	`id` varchar(64) NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`message` text NOT NULL,
	`status` enum('pending','queued','sending','delivered','failed') NOT NULL DEFAULT 'pending',
	`retryCount` int DEFAULT 0,
	`attemptCount` int NOT NULL DEFAULT 0,
	`maxAttempts` int NOT NULL DEFAULT 3,
	`provider` varchar(50),
	`externalId` varchar(128),
	`providerReference` varchar(128),
	`deliveryStatus` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`deliveredAt` timestamp,
	`error` text,
	`failureReason` text,
	`relatedEntityType` varchar(50),
	`relatedEntityId` varchar(64),
	`batchId` varchar(64),
	`templateId` varchar(64),
	`metadata` json,
	`sentAt` timestamp,
	`nextRetryAt` timestamp,
	`organizationId` varchar(64),
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `smsQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smsTemplates` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` enum('invoice_notification','payment_reminder','delivery_notification','appointment_reminder','promotional','transactional','custom') NOT NULL,
	`variables` json,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `smsTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staffChatChannels` (
	`id` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` varchar(20) NOT NULL DEFAULT 'team',
	`description` varchar(255),
	`members` json DEFAULT ('[]'),
	`createdBy` varchar(64) NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staffChatChannels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staffChatMessages` (
	`id` varchar(64) NOT NULL,
	`channelId` varchar(64) DEFAULT 'general',
	`userId` varchar(64) NOT NULL,
	`userName` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`encryptedKeys` text,
	`encryptionNonce` varchar(64),
	`encryptionVersion` varchar(10),
	`senderPublicKey` text,
	`emoji` varchar(10),
	`replyToId` varchar(64),
	`replyToUser` varchar(255),
	`fileUrl` varchar(500),
	`fileName` varchar(255),
	`fileType` varchar(50),
	`isEdited` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staffChatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`productId` varchar(64) NOT NULL,
	`warehouseId` varchar(64),
	`type` varchar(30) NOT NULL,
	`quantity` int NOT NULL,
	`referenceNo` varchar(100),
	`reason` text,
	`fromWarehouse` varchar(64),
	`toWarehouse` varchar(64),
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stripeCustomers` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`clientId` varchar(64),
	`stripeCustomerId` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`metadata` json,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripeCustomers_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripeCustomers_stripeCustomerId_unique` UNIQUE(`stripeCustomerId`)
);
--> statement-breakpoint
CREATE TABLE `stripePaymentIntents` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripePaymentIntents_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripePaymentIntents_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
CREATE TABLE `stripeWebhookEvents` (
	`id` varchar(64) NOT NULL,
	`stripeEventId` varchar(255) NOT NULL,
	`type` varchar(100) NOT NULL,
	`data` json,
	`processed` tinyint NOT NULL DEFAULT 0,
	`processedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stripeWebhookEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripeWebhookEvents_stripeEventId_unique` UNIQUE(`stripeEventId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(64) NOT NULL,
	`clientId` varchar(64),
	`organizationId` varchar(64),
	`planId` varchar(64) NOT NULL,
	`status` enum('trial','active','suspended','cancelled','expired') NOT NULL DEFAULT 'trial',
	`billingCycle` enum('monthly','annual') NOT NULL DEFAULT 'monthly',
	`startDate` timestamp NOT NULL,
	`renewalDate` timestamp NOT NULL,
	`expiryDate` timestamp,
	`gracePeriodEnd` timestamp,
	`isLocked` tinyint DEFAULT 0,
	`autoRenew` tinyint DEFAULT 1,
	`currentPrice` decimal(10,2) DEFAULT '0',
	`usersCount` int DEFAULT 0,
	`projectsCount` int DEFAULT 0,
	`storageUsedGB` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemHealth` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`cpuUsage` int DEFAULT 0,
	`cpuModel` varchar(255),
	`cpuCores` int DEFAULT 1,
	`cpuSpeed` varchar(50),
	`cpuTemperature` int DEFAULT 0,
	`memoryUsage` int DEFAULT 0,
	`memoryTotal` int DEFAULT 0,
	`memoryAvailable` int DEFAULT 0,
	`diskUsage` int DEFAULT 0,
	`diskTotal` int DEFAULT 0,
	`diskUsagePercent` int DEFAULT 0,
	`status` enum('healthy','warning','critical') NOT NULL DEFAULT 'healthy',
	`systemPlatform` varchar(100),
	`systemDistro` varchar(100),
	`systemRelease` varchar(50),
	`systemArch` varchar(50),
	`systemManufacturer` varchar(255),
	`systemUptime` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `systemHealth_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemLogs` (
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
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `systemLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taxCompliance` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taxCompliance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taxRates` (
	`id` varchar(64) NOT NULL,
	`country` varchar(100) NOT NULL,
	`taxType` enum('vat','gst','sales_tax','income_tax') DEFAULT 'vat',
	`rate` int DEFAULT 0,
	`effectiveDate` timestamp NOT NULL,
	`expiryDate` timestamp,
	`description` text,
	`isActive` tinyint DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `taxRates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenantMessages` (
	`id` varchar(64) NOT NULL,
	`senderId` varchar(64) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`content` longtext NOT NULL,
	`priority` varchar(20) DEFAULT 'normal',
	`targetType` varchar(20) DEFAULT 'all',
	`targetOrgId` varchar(64),
	`targetUserId` varchar(64),
	`isRead` tinyint DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `tenantMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticketResponses` (
	`id` varchar(64) NOT NULL,
	`ticketId` varchar(64) NOT NULL,
	`responderId` varchar(64) NOT NULL,
	`responseType` enum('comment','resolution','escalation') NOT NULL DEFAULT 'comment',
	`content` longtext NOT NULL,
	`attachments` json,
	`isInternal` tinyint DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ticketResponses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`ticketNumber` varchar(50) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` longtext NOT NULL,
	`category` enum('support','billing','feature_request','bug','security','general') NOT NULL,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`status` enum('open','in_progress','on_hold','resolved','closed','reopened') NOT NULL DEFAULT 'open',
	`createdBy` varchar(64) NOT NULL,
	`assignedTo` varchar(64),
	`department` varchar(100),
	`resolution` text,
	`solutionUrl` varchar(500),
	`attachments` json,
	`relatedTickets` json,
	`firstResponseAt` timestamp,
	`resolvedAt` timestamp,
	`closedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_ticketNumber_unique` UNIQUE(`ticketNumber`)
);
--> statement-breakpoint
CREATE TABLE `timesheets` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timesheets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainingCourses` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64) NOT NULL,
	`courseName` varchar(255) NOT NULL,
	`description` text,
	`courseType` enum('internal','external','online','workshop') NOT NULL DEFAULT 'internal',
	`provider` varchar(255),
	`durationDays` int DEFAULT 1,
	`cost` int DEFAULT 0,
	`startDate` datetime,
	`endDate` datetime,
	`location` varchar(255),
	`maxParticipants` int DEFAULT 0,
	`certificateRequired` tinyint DEFAULT 0,
	`status` enum('draft','active','completed','cancelled') NOT NULL DEFAULT 'active',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainingCourses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainingEnrollments` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainingEnrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usageMetrics` (
	`id` varchar(64) NOT NULL,
	`subscriptionId` varchar(64) NOT NULL,
	`metricName` varchar(255) NOT NULL,
	`metricValue` int DEFAULT 0,
	`billingAmount` int DEFAULT 0,
	`usagePeriod` varchar(50) NOT NULL,
	`recordedAt` timestamp DEFAULT (now()),
	CONSTRAINT `usageMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userDeletions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`userName` varchar(255) NOT NULL,
	`userEmail` varchar(320) NOT NULL,
	`deletedReason` text,
	`deletedBy` varchar(64) NOT NULL,
	`deletedAt` timestamp DEFAULT (now()),
	`restoredAt` timestamp,
	`restoredBy` varchar(64),
	`archived` tinyint NOT NULL DEFAULT 1,
	CONSTRAINT `userDeletions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userFavorites` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` varchar(64) NOT NULL,
	`entityName` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `userFavorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vacationRequests` (
	`id` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`daysRequested` int DEFAULT 0,
	`vacationType` enum('vacation','sick_leave','personal','sabbatical') DEFAULT 'vacation',
	`reason` text,
	`status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
	`approvedBy` varchar(64),
	`approvalDate` timestamp,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `vacationRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`name` varchar(200) NOT NULL,
	`code` varchar(50),
	`address` text,
	`contactPerson` varchar(200),
	`phone` varchar(50),
	`status` varchar(20) DEFAULT 'active',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warranties` (
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
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warranties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_configs` (
	`id` varchar(64) NOT NULL,
	`name` varchar(200),
	`eventType` varchar(200) NOT NULL,
	`targetUrl` varchar(500) NOT NULL,
	`secret` varchar(200),
	`isActive` tinyint NOT NULL DEFAULT 1,
	`retryCount` int DEFAULT 0,
	`lastTriggered` timestamp,
	`config` text,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`webhookUrl` varchar(500) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`secret` varchar(255),
	`isActive` tinyint DEFAULT 1,
	`retryCount` int DEFAULT 0,
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workOrderMaterials` (
	`id` varchar(64) NOT NULL,
	`workOrderId` varchar(64) NOT NULL,
	`description` text NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitCost` int NOT NULL DEFAULT 0,
	`total` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `workOrderMaterials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workOrders` (
	`id` varchar(64) NOT NULL,
	`organizationId` varchar(64),
	`workOrderNumber` varchar(50) NOT NULL,
	`issueDate` varchar(30) NOT NULL,
	`description` text NOT NULL,
	`assignedTo` varchar(200) NOT NULL,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`startDate` varchar(30) NOT NULL,
	`targetEndDate` varchar(30) NOT NULL,
	`laborCost` int NOT NULL DEFAULT 0,
	`serviceCost` int NOT NULL DEFAULT 0,
	`total` int NOT NULL DEFAULT 0,
	`notes` text,
	`status` enum('draft','open','in-progress','completed','cancelled') NOT NULL DEFAULT 'draft',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflowAutomationLogs` (
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
	CONSTRAINT `workflowAutomationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_actions` (
	`id` varchar(36) NOT NULL,
	`approval_request_id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`level_number` int NOT NULL,
	`approver_id` varchar(36) NOT NULL,
	`approver_role` varchar(100),
	`action` varchar(50) NOT NULL,
	`status` varchar(50) NOT NULL,
	`comment` text,
	`decision_amount` int,
	`due_date` timestamp,
	`action_date` timestamp,
	`escalated_to` varchar(36),
	`escalation_reason` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approval_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_audit_log` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`approval_request_id` varchar(36) NOT NULL,
	`action` varchar(100) NOT NULL,
	`performed_by` varchar(36),
	`details` json,
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approval_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_levels` (
	`id` varchar(36) NOT NULL,
	`workflow_id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`level_number` int NOT NULL,
	`level_name` varchar(100),
	`approval_type` varchar(50) NOT NULL,
	`approver_roles` json NOT NULL,
	`approver_user_ids` json,
	`escalation_days` int,
	`conditions` json,
	`requires_comment` boolean DEFAULT false,
	`allow_approve_partially` boolean DEFAULT false,
	`notification_template` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approval_levels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_metrics` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`workflow_id` varchar(36),
	`avg_approval_time` int,
	`median_approval_time` int,
	`total_requests` int DEFAULT 0,
	`approved_requests` int DEFAULT 0,
	`rejected_requests` int DEFAULT 0,
	`partially_approved_requests` int DEFAULT 0,
	`pending_requests` int DEFAULT 0,
	`approval_rate` int,
	`rejection_rate` int,
	`escalation_rate` int,
	`period` varchar(20),
	`period_date` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approval_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_notifications` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`approval_request_id` varchar(36),
	`approval_action_id` varchar(36),
	`recipient_id` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean DEFAULT false,
	`read_at` timestamp,
	`delivery_channels` json,
	`delivery_status` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`sent_at` timestamp,
	CONSTRAINT `approval_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`workflow_id` varchar(36) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`status` varchar(50) NOT NULL,
	`current_level` int NOT NULL DEFAULT 1,
	`total_levels` int NOT NULL,
	`progress_percentage` int DEFAULT 0,
	`completed_levels` int DEFAULT 0,
	`requested_by` varchar(36) NOT NULL,
	`requested_at` timestamp NOT NULL DEFAULT (now()),
	`reason` text,
	`amount` int,
	`due_date` timestamp,
	`completed_at` timestamp,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approval_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP INDEX `user_idx` ON `notifications`;--> statement-breakpoint
DROP INDEX `category_idx` ON `notifications`;--> statement-breakpoint
DROP INDEX `invoice_idx` ON `payments`;--> statement-breakpoint
DROP INDEX `payment_date_idx` ON `payments`;--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `accountType` enum('asset','liability','equity','revenue','expense','cost of goods sold','operating expense','capital expenditure','other income','other expense') NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `accounts` MODIFY COLUMN `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `activityLog` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `attendance` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `auditLogs` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `bankAccounts` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `bankAccounts` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `bankTransactions` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `clients` MODIFY COLUMN `businessType` varchar(100);--> statement-breakpoint
ALTER TABLE `communicationLogs` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `defaultSettings` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `departments` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `departments` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `documentNumberFormats` MODIFY COLUMN `documentType` enum('invoice','estimate','receipt','proposal','expense','payment','contract','quotation','purchase_order','project','credit_note','debit_note','delivery_note','lpo','grn','work_order','service_invoice') NOT NULL;--> statement-breakpoint
ALTER TABLE `documentNumberFormats` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `documentNumberFormats` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `employees` MODIFY COLUMN `employmentType` enum('full_time','part_time','contract','intern','contractual','hourly','wage','temporary','seasonal') NOT NULL DEFAULT 'full_time';--> statement-breakpoint
ALTER TABLE `employees` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `employees` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `estimateItems` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `estimates` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `estimates` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `expenses` MODIFY COLUMN `receiptUrl` longtext;--> statement-breakpoint
ALTER TABLE `expenses` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `expenses` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `guestClients` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `inventoryTransactions` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `invoiceItems` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `invoices` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `invoices` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `journalEntries` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `journalEntryLines` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `leaveRequests` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `leaveRequests` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `lineItems` MODIFY COLUMN `documentType` enum('invoice','estimate','receipt','expense','credit_note','lpo') NOT NULL;--> statement-breakpoint
ALTER TABLE `lineItems` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `lineItems` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('info','success','warning','error','reminder','payment','project','client','financial','system') NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `category` varchar(50);--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `entityType` varchar(50);--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `readAt` timestamp;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `priority` enum('low','normal','medium','high','critical') NOT NULL DEFAULT 'normal';--> statement-breakpoint
ALTER TABLE `opportunities` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `opportunities` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `paymentPlanInstallments` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `paymentPlans` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `paymentPlans` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `paymentDate` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `approvedAt` timestamp;--> statement-breakpoint
ALTER TABLE `payroll` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `payroll` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `permissions` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `projectComments` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `projectMilestones` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `projectMilestones` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `projectTasks` MODIFY COLUMN `projectId` varchar(64);--> statement-breakpoint
ALTER TABLE `projectTasks` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `projectTasks` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `proposals` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `proposals` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `receipts` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `recurringInvoices` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `recurringInvoices` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `reminders` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `reminders` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `rolePermissions` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `savedFilters` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `savedFilters` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `scheduledReminders` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `settings` MODIFY COLUMN `value` longtext;--> statement-breakpoint
ALTER TABLE `settings` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `staffTasks` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `stockAlerts` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `systemSettings` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `templates` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `templates` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `timeEntries` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `timeEntries` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `userPermissions` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `userProjectAssignments` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `userRoles` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `loginMethod` varchar(50) NOT NULL DEFAULT 'local';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','staff','accountant','client','super_admin','project_manager','hr','ict_manager','procurement_manager','sales_manager') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `passwordResetToken` varchar(255);--> statement-breakpoint
ALTER TABLE `workflowActions` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `workflowActions` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `workflowExecutions` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `workflowTriggers` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `workflows` MODIFY COLUMN `triggerType` enum('invoice_created','invoice_paid','invoice_overdue','invoice_approved','payment_received','payment_approved','receipt_created','expense_approved','opportunity_moved','task_completed','project_milestone_reached','reminder_time') NOT NULL;--> statement-breakpoint
ALTER TABLE `workflows` MODIFY COLUMN `createdAt` timestamp;--> statement-breakpoint
ALTER TABLE `workflows` MODIFY COLUMN `updatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `accounts` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `attendance` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `clients` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `clients` ADD `secondaryPhone` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `bankCode` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `branch` varchar(100);--> statement-breakpoint
ALTER TABLE `clients` ADD `creditLimit` int;--> statement-breakpoint
ALTER TABLE `clients` ADD `paymentTerms` varchar(100);--> statement-breakpoint
ALTER TABLE `clients` ADD `numberOfEmployees` int;--> statement-breakpoint
ALTER TABLE `clients` ADD `yearEstablished` int;--> statement-breakpoint
ALTER TABLE `clients` ADD `businessLicense` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `leadSource` varchar(100);--> statement-breakpoint
ALTER TABLE `clients` ADD `currency` varchar(10);--> statement-breakpoint
ALTER TABLE `communicationLogs` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `departments` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `departments` ADD `salaryRangeMin` int;--> statement-breakpoint
ALTER TABLE `departments` ADD `salaryRangeMax` int;--> statement-breakpoint
ALTER TABLE `departments` ADD `defaultRole` varchar(100);--> statement-breakpoint
ALTER TABLE `employees` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `employees` ADD `country` varchar(5) DEFAULT 'KE';--> statement-breakpoint
ALTER TABLE `employees` ADD `gender` enum('male','female','other');--> statement-breakpoint
ALTER TABLE `employees` ADD `maritalStatus` enum('single','married','divorced','widowed');--> statement-breakpoint
ALTER TABLE `employees` ADD `probationEndDate` datetime;--> statement-breakpoint
ALTER TABLE `employees` ADD `contractEndDate` datetime;--> statement-breakpoint
ALTER TABLE `employees` ADD `jobGroupId` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `employees` ADD `emergencyContactName` varchar(255);--> statement-breakpoint
ALTER TABLE `employees` ADD `emergencyContactRelationship` varchar(100);--> statement-breakpoint
ALTER TABLE `employees` ADD `emergencyContactPhone` varchar(50);--> statement-breakpoint
ALTER TABLE `employees` ADD `bankName` varchar(255);--> statement-breakpoint
ALTER TABLE `employees` ADD `bankBranch` varchar(255);--> statement-breakpoint
ALTER TABLE `employees` ADD `nhifNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `employees` ADD `nssfNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `estimates` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `expenses` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `expenses` ADD `budgetAllocationId` varchar(64);--> statement-breakpoint
ALTER TABLE `expenses` ADD `approvedAt` datetime;--> statement-breakpoint
ALTER TABLE `invoices` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `invoices` ADD `paymentPlanId` varchar(64);--> statement-breakpoint
ALTER TABLE `invoices` ADD `isAutoRecurring` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `invoices` ADD `clientSubscriptionId` varchar(64);--> statement-breakpoint
ALTER TABLE `invoices` ADD `accountManagerId` varchar(64);--> statement-breakpoint
ALTER TABLE `leaveRequests` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `notifications` ADD `deliveryStatus` enum('pending','sent','failed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `deliveryDate` timestamp;--> statement-breakpoint
ALTER TABLE `notifications` ADD `status` enum('active','archived') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `opportunities` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `payments` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `payments` ADD `accountId` varchar(64);--> statement-breakpoint
ALTER TABLE `payments` ADD `chartOfAccountType` enum('debit','credit') DEFAULT 'debit';--> statement-breakpoint
ALTER TABLE `payments` ADD `chartOfAccountId` int;--> statement-breakpoint
ALTER TABLE `permissions` ADD `isAdvanced` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `products` ADD `reorderLevel` int;--> statement-breakpoint
ALTER TABLE `products` ADD `reorderQuantity` int;--> statement-breakpoint
ALTER TABLE `products` ADD `lastRestockDate` timestamp;--> statement-breakpoint
ALTER TABLE `projectTasks` ADD `clientId` varchar(64);--> statement-breakpoint
ALTER TABLE `projectTasks` ADD `approvalStatus` enum('pending','approved','rejected','revision_requested') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `projectTasks` ADD `adminRemarks` longtext;--> statement-breakpoint
ALTER TABLE `projectTasks` ADD `approvedBy` varchar(64);--> statement-breakpoint
ALTER TABLE `projectTasks` ADD `approvedAt` timestamp;--> statement-breakpoint
ALTER TABLE `projectTasks` ADD `rejectionReason` longtext;--> statement-breakpoint
ALTER TABLE `projectTasks` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `projectTasks` ADD `targetDate` datetime;--> statement-breakpoint
ALTER TABLE `projectTasks` ADD `billable` tinyint DEFAULT 1;--> statement-breakpoint
ALTER TABLE `projectTasks` ADD `visibleToClient` tinyint DEFAULT 1;--> statement-breakpoint
ALTER TABLE `projects` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `receipts` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `receipts` ADD `subtotal` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `receipts` ADD `taxAmount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `receipts` ADD `discountAmount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `receipts` ADD `status` enum('draft','issued','void') DEFAULT 'issued' NOT NULL;--> statement-breakpoint
ALTER TABLE `receipts` ADD `approvedBy` varchar(64);--> statement-breakpoint
ALTER TABLE `receipts` ADD `approvedAt` datetime;--> statement-breakpoint
ALTER TABLE `recurringInvoices` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `recurringInvoices` ADD `clientSubscriptionId` varchar(64);--> statement-breakpoint
ALTER TABLE `recurringInvoices` ADD `accountManagerId` varchar(64);--> statement-breakpoint
ALTER TABLE `services` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `services` ADD `deliverables` text;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `requiresPasswordChange` tinyint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `company` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `position` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `photoUrl` longtext;--> statement-breakpoint
ALTER TABLE `users` ADD `organizationId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `customRoleId` varchar(64);--> statement-breakpoint
ALTER TABLE `documentNumberFormats` ADD CONSTRAINT `doc_type_unique_idx` UNIQUE(`documentType`);--> statement-breakpoint
CREATE INDEX `idx_as_user` ON `activeSessions` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_as_org` ON `activeSessions` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_as_expires_at` ON `activeSessions` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `idx_as_created_at` ON `activeSessions` (`createdAt`);--> statement-breakpoint
CREATE INDEX `session_id_idx` ON `aiChatMessages` (`sessionId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `aiChatMessages` (`userId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `aiChatSessions` (`userId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `aiChatSessions` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_ac_type` ON `ai_configurations` (`configType`);--> statement-breakpoint
CREATE INDEX `idx_ac_status` ON `ai_configurations` (`status`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `aiDocuments` (`userId`);--> statement-breakpoint
CREATE INDEX `document_type_idx` ON `aiDocuments` (`documentType`);--> statement-breakpoint
CREATE INDEX `idx_ai_type` ON `ai_insights` (`insightType`);--> statement-breakpoint
CREATE INDEX `idx_ai_period` ON `ai_insights` (`period`);--> statement-breakpoint
CREATE INDEX `idx_am_name` ON `analytics_metrics` (`metricName`);--> statement-breakpoint
CREATE INDEX `idx_am_type` ON `analytics_metrics` (`metricType`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `apiKeys` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_key_value` ON `apiKeys` (`keyValue`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `apiKeys` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_apc_status` ON `api_pricing_configs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_aw_org` ON `approvalWorkflows` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_aw_type` ON `approvalWorkflows` (`workflowType`);--> statement-breakpoint
CREATE INDEX `idx_aw_status` ON `approvalWorkflows` (`status`);--> statement-breakpoint
CREATE INDEX `idx_aw_entity` ON `approvalWorkflows` (`entityId`);--> statement-breakpoint
CREATE INDEX `idx_assets_status` ON `assets` (`status`);--> statement-breakpoint
CREATE INDEX `idx_assets_category` ON `assets` (`category`);--> statement-breakpoint
CREATE INDEX `idx_invoice_id` ON `automatedReceipts` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `idx_receipt_number` ON `automatedReceipts` (`receiptNumber`);--> statement-breakpoint
CREATE INDEX `idx_org` ON `automationConfigs` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_workflow` ON `automationConfigs` (`workflowType`);--> statement-breakpoint
CREATE INDEX `idx_bh_status` ON `backup_history` (`status`);--> statement-breakpoint
CREATE INDEX `idx_bh_scope` ON `backup_history` (`scope`);--> statement-breakpoint
CREATE INDEX `idx_bh_created` ON `backup_history` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_bs_status` ON `backup_schedules` (`status`);--> statement-breakpoint
CREATE INDEX `idx_statement` ON `bankReconciliationDetails` (`statementId`);--> statement-breakpoint
CREATE INDEX `idx_transaction` ON `bankReconciliationDetails` (`transactionId`);--> statement-breakpoint
CREATE INDEX `idx_org` ON `bankReconciliationStatements` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_date` ON `bankReconciliationStatements` (`statementDate`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `bankReconciliationStatements` (`status`);--> statement-breakpoint
CREATE INDEX `idx_subscription_id` ON `billingInvoices` (`subscriptionId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `billingInvoices` (`status`);--> statement-breakpoint
CREATE INDEX `idx_due_date` ON `billingInvoices` (`dueDate`);--> statement-breakpoint
CREATE INDEX `idx_paid_at` ON `billingInvoices` (`paidAt`);--> statement-breakpoint
CREATE INDEX `idx_subscription_id` ON `billingNotifications` (`subscriptionId`);--> statement-breakpoint
CREATE INDEX `idx_notification_type` ON `billingNotifications` (`notificationType`);--> statement-breakpoint
CREATE INDEX `idx_is_sent` ON `billingNotifications` (`isSent`);--> statement-breakpoint
CREATE INDEX `idx_subscription_id` ON `billingUsageMetrics` (`subscriptionId`);--> statement-breakpoint
CREATE INDEX `idx_metric_date` ON `billingUsageMetrics` (`metricDate`);--> statement-breakpoint
CREATE INDEX `idx_cr_category` ON `canned_responses` (`category`);--> statement-breakpoint
CREATE INDEX `idx_cr_org` ON `canned_responses` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_client_id` ON `clientHealthScores` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_health_score` ON `clientHealthScores` (`healthScore`);--> statement-breakpoint
CREATE INDEX `idx_risk_level` ON `clientHealthScores` (`riskLevel`);--> statement-breakpoint
CREATE INDEX `idx_cs_org` ON `clientSubscriptions` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_cs_client` ON `clientSubscriptions` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_cs_status` ON `clientSubscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_cs_next_billing` ON `clientSubscriptions` (`nextBillingDate`);--> statement-breakpoint
CREATE INDEX `idx_ca_type` ON `cohort_analyses` (`analysisType`);--> statement-breakpoint
CREATE INDEX `idx_ca_cohort` ON `cohort_analyses` (`cohortType`);--> statement-breakpoint
CREATE INDEX `idx_cs_type` ON `collaboration_sessions` (`sessionType`);--> statement-breakpoint
CREATE INDEX `idx_cs_doc` ON `collaboration_sessions` (`documentId`);--> statement-breakpoint
CREATE INDEX `idx_cr_type` ON `compliance_records` (`recordType`);--> statement-breakpoint
CREATE INDEX `idx_cr_standard` ON `compliance_records` (`standard`);--> statement-breakpoint
CREATE INDEX `idx_contacts_client` ON `contacts` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_contacts_email` ON `contacts` (`email`);--> statement-breakpoint
CREATE INDEX `idx_cd_status` ON `container_deployments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_contracts_status` ON `contracts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_contracts_vendor` ON `contracts` (`vendor`);--> statement-breakpoint
CREATE INDEX `idx_conversation_id` ON `conversationMembers` (`conversationId`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `conversationMembers` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_type` ON `conversations` (`type`);--> statement-breakpoint
CREATE INDEX `idx_created_by` ON `conversations` (`createdBy`);--> statement-breakpoint
CREATE INDEX `idx_archived` ON `conversations` (`isArchived`);--> statement-breakpoint
CREATE INDEX `credit_note_number_idx` ON `creditNotes` (`creditNoteNumber`);--> statement-breakpoint
CREATE INDEX `client_idx` ON `creditNotes` (`clientId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `creditNotes` (`status`);--> statement-breakpoint
CREATE INDEX `invoice_idx` ON `creditNotes` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `idx_code` ON `currencies` (`code`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `currencies` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_cdash_public` ON `custom_dashboards` (`isPublic`);--> statement-breakpoint
CREATE INDEX `idx_org_id` ON `customFields` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_entity_type` ON `customFields` (`entityType`);--> statement-breakpoint
CREATE INDEX `idx_custom_reports_category` ON `custom_reports` (`category`);--> statement-breakpoint
CREATE INDEX `idx_custom_reports_status` ON `custom_reports` (`status`);--> statement-breakpoint
CREATE INDEX `idx_customRoles_orgId` ON `customRoles` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_customRoles_name` ON `customRoles` (`name`);--> statement-breakpoint
CREATE INDEX `idx_customRoles_active` ON `customRoles` (`isActive`);--> statement-breakpoint
CREATE INDEX `debit_note_number_idx` ON `debitNotes` (`debitNoteNumber`);--> statement-breakpoint
CREATE INDEX `supplier_idx` ON `debitNotes` (`supplierId`);--> statement-breakpoint
CREATE INDEX `debit_status_idx` ON `debitNotes` (`status`);--> statement-breakpoint
CREATE INDEX `idx_dn_status` ON `deliveryNotes` (`status`);--> statement-breakpoint
CREATE INDEX `idx_dn_order` ON `deliveryNotes` (`orderId`);--> statement-breakpoint
CREATE INDEX `idx_dh_org` ON `departmentHierarchies` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_dh_parent` ON `departmentHierarchies` (`parentDepartmentId`);--> statement-breakpoint
CREATE INDEX `idx_dh_dept` ON `departmentHierarchies` (`departmentId`);--> statement-breakpoint
CREATE INDEX `idx_dc_type` ON `design_configs` (`configType`);--> statement-breakpoint
CREATE INDEX `idx_document_id` ON `documentAccess` (`documentId`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `documentAccess` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_document_id` ON `documentVersions` (`documentId`);--> statement-breakpoint
CREATE INDEX `idx_version` ON `documentVersions` (`versionNumber`);--> statement-breakpoint
CREATE INDEX `idx_document_type` ON `documents` (`documentType`);--> statement-breakpoint
CREATE INDEX `idx_entity` ON `documents` (`linkedEntityType`,`linkedEntityId`);--> statement-breakpoint
CREATE INDEX `idx_client_id` ON `documents` (`linkedClientId`);--> statement-breakpoint
CREATE INDEX `idx_project_id` ON `documents` (`linkedProjectId`);--> statement-breakpoint
CREATE INDEX `idx_uploaded_by` ON `documents` (`uploadedBy`);--> statement-breakpoint
CREATE INDEX `idx_subscription_id` ON `dunningEvents` (`subscriptionId`);--> statement-breakpoint
CREATE INDEX `idx_event_type` ON `dunningEvents` (`eventType`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `dunningEvents` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_organization_id` ON `dunningPolicies` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_is_active` ON `dunningPolicies` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_ecs_provider` ON `email_calendar_sync` (`provider`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `emailCampaigns` (`status`);--> statement-breakpoint
CREATE INDEX `idx_created_by` ON `emailCampaigns` (`createdBy`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `emailGenerationHistory` (`userId`);--> statement-breakpoint
CREATE INDEX `template_type_idx` ON `emailGenerationHistory` (`templateType`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `emailLog` (`status`);--> statement-breakpoint
CREATE INDEX `idx_recipient` ON `emailLog` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `idx_sent_at` ON `emailLog` (`sentAt`);--> statement-breakpoint
CREATE INDEX `idx_event_type` ON `emailLog` (`eventType`);--> statement-breakpoint
CREATE INDEX `idx_campaign_id` ON `emailLogs` (`campaignId`);--> statement-breakpoint
CREATE INDEX `idx_recipient_email` ON `emailLogs` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `emailLogs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `emailQueue` (`status`);--> statement-breakpoint
CREATE INDEX `idx_recipient` ON `emailQueue` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `idx_next_retry` ON `emailQueue` (`nextRetryAt`);--> statement-breakpoint
CREATE INDEX `idx_event_type` ON `emailQueue` (`eventType`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `emailQueue` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_ep_org` ON `employeePromotions` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_ep_employee` ON `employeePromotions` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_ep_date` ON `employeePromotions` (`promotionDate`);--> statement-breakpoint
CREATE INDEX `idx_es_org` ON `employeeSkills` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_es_employee` ON `employeeSkills` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_es_skill` ON `employeeSkills` (`skillName`);--> statement-breakpoint
CREATE INDEX `idx_et_org` ON `employeeTransfers` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_et_employee` ON `employeeTransfers` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_et_date` ON `employeeTransfers` (`transferDate`);--> statement-breakpoint
CREATE INDEX `idx_etl_status` ON `etl_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_currency_pair` ON `exchangeRates` (`fromCurrency`,`toCurrency`);--> statement-breakpoint
CREATE INDEX `idx_rate_date` ON `exchangeRates` (`rateDate`);--> statement-breakpoint
CREATE INDEX `idx_er_type` ON `executive_reports` (`reportType`);--> statement-breakpoint
CREATE INDEX `idx_er_period` ON `executive_reports` (`period`);--> statement-breakpoint
CREATE INDEX `idx_category_name` ON `expenseCategories` (`categoryName`);--> statement-breakpoint
CREATE INDEX `idx_tax_deductible` ON `expenseCategories` (`taxDeductible`);--> statement-breakpoint
CREATE INDEX `idx_submitted_by` ON `expenseReports` (`submittedBy`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `expenseReports` (`status`);--> statement-breakpoint
CREATE INDEX `idx_report_date` ON `expenseReports` (`reportDate`);--> statement-breakpoint
CREATE INDEX `idx_ej_status` ON `export_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_field_id` ON `fieldValidations` (`fieldId`);--> statement-breakpoint
CREATE INDEX `idx_field_id` ON `fieldValues` (`fieldId`);--> statement-breakpoint
CREATE INDEX `idx_entity_id` ON `fieldValues` (`entityId`);--> statement-breakpoint
CREATE INDEX `idx_model_type` ON `forecastModels` (`modelType`);--> statement-breakpoint
CREATE INDEX `idx_last_trained` ON `forecastModels` (`lastTrainedAt`);--> statement-breakpoint
CREATE INDEX `idx_model_id` ON `forecastResults` (`modelId`);--> statement-breakpoint
CREATE INDEX `idx_forecast_period` ON `forecastResults` (`forecastPeriod`);--> statement-breakpoint
CREATE INDEX `idx_forecast_date` ON `forecastResults` (`forecastDate`);--> statement-breakpoint
CREATE INDEX `idx_gc_type` ON `global_configs` (`configType`);--> statement-breakpoint
CREATE INDEX `idx_org` ON `goodsReceiptNotes` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_po` ON `goodsReceiptNotes` (`purchaseOrderId`);--> statement-breakpoint
CREATE INDEX `idx_grn_status` ON `grnRecords` (`status`);--> statement-breakpoint
CREATE INDEX `idx_grn_supplier` ON `grnRecords` (`supplier`);--> statement-breakpoint
CREATE INDEX `idx_h_org` ON `holidays` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_h_date` ON `holidays` (`date`);--> statement-breakpoint
CREATE INDEX `idx_h_type` ON `holidays` (`type`);--> statement-breakpoint
CREATE INDEX `idx_hs_org` ON `hrSettings` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_imprest` ON `imprestSurrenders` (`imprestId`);--> statement-breakpoint
CREATE INDEX `idx_org` ON `imprests` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_employee` ON `imprests` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `imprests` (`status`);--> statement-breakpoint
CREATE INDEX `idx_ic_provider` ON `integration_configs` (`provider`);--> statement-breakpoint
CREATE INDEX `idx_ic_active` ON `integration_configs` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_ic_status` ON `integration_configs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_webhook_id` ON `integrationLogs` (`webhookId`);--> statement-breakpoint
CREATE INDEX `idx_event_type` ON `integrationLogs` (`eventType`);--> statement-breakpoint
CREATE INDEX `idx_success` ON `integrationLogs` (`success`);--> statement-breakpoint
CREATE INDEX `idx_invoice_id` ON `invoiceReminders` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `idx_reminder_type` ON `invoiceReminders` (`reminderType`);--> statement-breakpoint
CREATE INDEX `idx_sent_at` ON `invoiceReminders` (`sentAt`);--> statement-breakpoint
CREATE INDEX `idx_rule_id` ON `jobAlertHistory` (`ruleId`);--> statement-breakpoint
CREATE INDEX `idx_job_id` ON `jobAlertRules` (`jobId`);--> statement-breakpoint
CREATE INDEX `idx_job_id` ON `jobExecutionLogs` (`jobId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `jobExecutionLogs` (`status`);--> statement-breakpoint
CREATE INDEX `job_group_org_idx` ON `jobGroups` (`organizationId`);--> statement-breakpoint
CREATE INDEX `job_group_manager_idx` ON `jobGroups` (`managerId`);--> statement-breakpoint
CREATE INDEX `job_group_name_idx` ON `jobGroups` (`name`);--> statement-breakpoint
CREATE INDEX `is_active_idx` ON `jobGroups` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_heartbeat_job_id` ON `jobHeartbeat` (`jobId`);--> statement-breakpoint
CREATE INDEX `idx_heartbeat_healthy` ON `jobHeartbeat` (`isHealthy`);--> statement-breakpoint
CREATE INDEX `idx_kba_org` ON `kb_articles` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_kba_cat` ON `kb_articles` (`categoryId`);--> statement-breakpoint
CREATE INDEX `idx_kba_status` ON `kb_articles` (`status`);--> statement-breakpoint
CREATE INDEX `idx_kbc_org` ON `kb_categories` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_kbc_slug` ON `kb_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_org` ON `leads` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `idx_source` ON `leads` (`source`);--> statement-breakpoint
CREATE INDEX `idx_la_org` ON `leaveApprovals` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_la_leave` ON `leaveApprovals` (`leaveRequestId`);--> statement-breakpoint
CREATE INDEX `idx_la_approver` ON `leaveApprovals` (`approverId`);--> statement-breakpoint
CREATE INDEX `idx_lb_org` ON `leaveBalances` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_lb_employee` ON `leaveBalances` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_lb_year` ON `leaveBalances` (`fiscalYear`);--> statement-breakpoint
CREATE INDEX `idx_lb_type` ON `leaveBalances` (`leaveType`);--> statement-breakpoint
CREATE INDEX `idx_lpo_number` ON `lpos` (`lpoNumber`);--> statement-breakpoint
CREATE INDEX `idx_supplier_id` ON `lpos` (`supplierId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `lpos` (`status`);--> statement-breakpoint
CREATE INDEX `idx_message_id` ON `messageReadReceipts` (`messageId`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `messageReadReceipts` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_conversation_id` ON `messages` (`conversationId`);--> statement-breakpoint
CREATE INDEX `idx_sender_id` ON `messages` (`senderId`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `messages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_mac_platform` ON `mobile_app_configs` (`platform`);--> statement-breakpoint
CREATE INDEX `idx_invoice_id` ON `mpesaTransactions` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `idx_transaction_id` ON `mpesaTransactions` (`transactionId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `mpesaTransactions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_notes_created_by` ON `notes` (`createdBy`);--> statement-breakpoint
CREATE INDEX `idx_notes_category` ON `notes` (`category`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `notificationBroadcasts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_target` ON `notificationBroadcasts` (`target`);--> statement-breakpoint
CREATE INDEX `idx_scheduled_for` ON `notificationBroadcasts` (`scheduledFor`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `notificationRules` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_event_type` ON `notificationRules` (`eventType`);--> statement-breakpoint
CREATE INDEX `user_channel_idx` ON `notificationSettings` (`userId`,`channelType`);--> statement-breakpoint
CREATE INDEX `idx_template_key` ON `notificationTemplates` (`templateKey`);--> statement-breakpoint
CREATE INDEX `idx_category` ON `notificationTemplates` (`category`);--> statement-breakpoint
CREATE INDEX `idx_oc_org` ON `onboardingChecklists` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_oc_employee` ON `onboardingChecklists` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_oc_status` ON `onboardingChecklists` (`status`);--> statement-breakpoint
CREATE INDEX `idx_ot_org` ON `onboardingTasks` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_ot_checklist` ON `onboardingTasks` (`checklistId`);--> statement-breakpoint
CREATE INDEX `idx_ot_category` ON `onboardingTasks` (`category`);--> statement-breakpoint
CREATE INDEX `idx_ot_status` ON `onboardingTasks` (`status`);--> statement-breakpoint
CREATE INDEX `idx_order_number` ON `orders` (`orderNumber`);--> statement-breakpoint
CREATE INDEX `idx_client_id` ON `orders` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `idx_org` ON `organizationAccountingPolicies` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_country` ON `organizationAccountingPolicies` (`country`);--> statement-breakpoint
CREATE INDEX `idx_orgfeat_org` ON `organizationFeatures` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_orgfeat_key` ON `organizationFeatures` (`featureKey`);--> statement-breakpoint
CREATE INDEX `idx_orgusers_org` ON `organizationUsers` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_orgusers_email` ON `organizationUsers` (`email`);--> statement-breakpoint
CREATE INDEX `idx_orgusers_role` ON `organizationUsers` (`role`);--> statement-breakpoint
CREATE INDEX `idx_orgusers_active` ON `organizationUsers` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_orgusers_created_by` ON `organizationUsers` (`createdBy`);--> statement-breakpoint
CREATE INDEX `idx_org_slug` ON `organizations` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_org_active` ON `organizations` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_org_archived` ON `organizations` (`isArchived`);--> statement-breakpoint
CREATE INDEX `idx_org_industry` ON `organizations` (`industry`);--> statement-breakpoint
CREATE INDEX `idx_pd_status` ON `partner_deals` (`status`);--> statement-breakpoint
CREATE INDEX `idx_pd_partner` ON `partner_deals` (`partnerId`);--> statement-breakpoint
CREATE INDEX `idx_client_id` ON `paymentMethods` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_is_default` ON `paymentMethods` (`isDefault`);--> statement-breakpoint
CREATE INDEX `idx_type` ON `paymentMethods` (`type`);--> statement-breakpoint
CREATE INDEX `idx_invoice_id` ON `paymentRetries` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `idx_subscription_id` ON `paymentRetries` (`subscriptionId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `paymentRetries` (`status`);--> statement-breakpoint
CREATE INDEX `idx_next_retry_at` ON `paymentRetries` (`nextRetryAt`);--> statement-breakpoint
CREATE INDEX `idx_payment_triggers_org` ON `paymentTriggers` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_payment_triggers_date` ON `paymentTriggers` (`triggerDate`);--> statement-breakpoint
CREATE INDEX `idx_payment_triggers_status` ON `paymentTriggers` (`status`);--> statement-breakpoint
CREATE INDEX `idx_pb_org` ON `payrollBatches` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_pb_month` ON `payrollBatches` (`payMonth`);--> statement-breakpoint
CREATE INDEX `idx_pb_status` ON `payrollBatches` (`status`);--> statement-breakpoint
CREATE INDEX `idx_pb_number` ON `payrollBatches` (`batchNumber`);--> statement-breakpoint
CREATE INDEX `idx_pd_org` ON `payrollDetails` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_pd_batch` ON `payrollDetails` (`batchId`);--> statement-breakpoint
CREATE INDEX `idx_pd_employee` ON `payrollDetails` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_pd_month` ON `payrollDetails` (`payMonth`);--> statement-breakpoint
CREATE INDEX `idx_pd_status` ON `payrollDetails` (`status`);--> statement-breakpoint
CREATE INDEX `idx_ps_org` ON `payslips` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_ps_employee` ON `payslips` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_ps_number` ON `payslips` (`payslipNumber`);--> statement-breakpoint
CREATE INDEX `idx_ps_month` ON `payslips` (`payMonth`);--> statement-breakpoint
CREATE INDEX `idx_pc_type` ON `perf_configs` (`configType`);--> statement-breakpoint
CREATE INDEX `performance_contract_employee_idx` ON `performanceContracts` (`employeeId`);--> statement-breakpoint
CREATE INDEX `performance_contract_department_idx` ON `performanceContracts` (`departmentId`);--> statement-breakpoint
CREATE INDEX `performance_contract_job_group_idx` ON `performanceContracts` (`jobGroupId`);--> statement-breakpoint
CREATE INDEX `performance_contract_status_idx` ON `performanceContracts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_employee_id` ON `performanceReviews` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_reviewer_id` ON `performanceReviews` (`reviewerId`);--> statement-breakpoint
CREATE INDEX `idx_period` ON `performanceReviews` (`period`);--> statement-breakpoint
CREATE INDEX `idx_review_date` ON `performanceReviews` (`reviewDate`);--> statement-breakpoint
CREATE INDEX `idx_pal_user` ON `permissionAuditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_pal_org` ON `permissionAuditLogs` (`orgId`);--> statement-breakpoint
CREATE INDEX `idx_pal_feature` ON `permissionAuditLogs` (`feature`);--> statement-breakpoint
CREATE INDEX `idx_pal_timestamp` ON `permissionAuditLogs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_pd_from_user` ON `permissionDelegations` (`fromUserId`);--> statement-breakpoint
CREATE INDEX `idx_pd_to_user` ON `permissionDelegations` (`toUserId`);--> statement-breakpoint
CREATE INDEX `idx_pd_org` ON `permissionDelegations` (`orgId`);--> statement-breakpoint
CREATE INDEX `idx_pd_status` ON `permissionDelegations` (`status`);--> statement-breakpoint
CREATE INDEX `idx_pd_end_date` ON `permissionDelegations` (`endDate`);--> statement-breakpoint
CREATE INDEX `idx_tier` ON `pricingPlans` (`tier`);--> statement-breakpoint
CREATE INDEX `idx_slug` ON `pricingPlans` (`planSlug`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `pricingPlans` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_ptf_tier` ON `pricingTierFeatures` (`tier`);--> statement-breakpoint
CREATE INDEX `idx_project_id` ON `projectMetrics` (`projectId`);--> statement-breakpoint
CREATE INDEX `idx_risk_level` ON `projectMetrics` (`riskLevel`);--> statement-breakpoint
CREATE INDEX `idx_po` ON `purchaseOrderItems` (`purchaseOrderId`);--> statement-breakpoint
CREATE INDEX `idx_org` ON `purchaseOrders` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_supplier` ON `purchaseOrders` (`supplierId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `purchaseOrders` (`status`);--> statement-breakpoint
CREATE INDEX `idx_quot_status` ON `quotations` (`status`);--> statement-breakpoint
CREATE INDEX `idx_quot_rfq` ON `quotations` (`rfqNo`);--> statement-breakpoint
CREATE INDEX `re_org_idx` ON `recurringExpenses` (`organizationId`);--> statement-breakpoint
CREATE INDEX `re_next_due_idx` ON `recurringExpenses` (`nextDueDate`);--> statement-breakpoint
CREATE INDEX `re_active_idx` ON `recurringExpenses` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_client_id` ON `recurringInvoiceTemplates` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_next_invoice_date` ON `recurringInvoiceTemplates` (`nextInvoiceDate`);--> statement-breakpoint
CREATE INDEX `idx_is_active` ON `recurringInvoiceTemplates` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_rd_device` ON `registered_devices` (`deviceId`);--> statement-breakpoint
CREATE INDEX `idx_rd_user` ON `registered_devices` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_report_id` ON `reimbursements` (`expenseReportId`);--> statement-breakpoint
CREATE INDEX `idx_employee_id` ON `reimbursements` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `reimbursements` (`status`);--> statement-breakpoint
CREATE INDEX `idx_org_id` ON `scheduledJobs` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `scheduledJobs` (`status`);--> statement-breakpoint
CREATE INDEX `idx_employee_id` ON `schedules` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_start_date` ON `schedules` (`startDate`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `schedules` (`status`);--> statement-breakpoint
CREATE INDEX `idx_se_type` ON `security_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `idx_se_severity` ON `security_events` (`severity`);--> statement-breakpoint
CREATE INDEX `idx_si_severity` ON `security_incidents` (`severity`);--> statement-breakpoint
CREATE INDEX `idx_si_status` ON `security_incidents` (`status`);--> statement-breakpoint
CREATE INDEX `idx_sii_invoice` ON `serviceInvoiceItems` (`serviceInvoiceId`);--> statement-breakpoint
CREATE INDEX `idx_si_client` ON `serviceInvoices` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_si_status` ON `serviceInvoices` (`status`);--> statement-breakpoint
CREATE INDEX `idx_employee_id` ON `skillsMatrix` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_skill_name` ON `skillsMatrix` (`skillName`);--> statement-breakpoint
CREATE INDEX `idx_sw_status` ON `smart_workflows` (`status`);--> statement-breakpoint
CREATE INDEX `sms_automation_org_idx` ON `smsAutomationRules` (`organizationId`);--> statement-breakpoint
CREATE INDEX `sms_automation_trigger_idx` ON `smsAutomationRules` (`trigger`);--> statement-breakpoint
CREATE INDEX `sms_pref_phone_idx` ON `smsCustomerPreferences` (`phoneNumber`);--> statement-breakpoint
CREATE INDEX `sms_pref_client_idx` ON `smsCustomerPreferences` (`clientId`);--> statement-breakpoint
CREATE INDEX `sms_delivery_queue_idx` ON `smsDeliveryEvents` (`queueId`);--> statement-breakpoint
CREATE INDEX `sms_delivery_event_idx` ON `smsDeliveryEvents` (`eventType`);--> statement-breakpoint
CREATE INDEX `sms_status_idx` ON `smsQueue` (`status`);--> statement-breakpoint
CREATE INDEX `sms_created_idx` ON `smsQueue` (`createdAt`);--> statement-breakpoint
CREATE INDEX `sms_batch_idx` ON `smsQueue` (`batchId`);--> statement-breakpoint
CREATE INDEX `sms_template_idx` ON `smsQueue` (`templateId`);--> statement-breakpoint
CREATE INDEX `sms_template_org_idx` ON `smsTemplates` (`organizationId`);--> statement-breakpoint
CREATE INDEX `sms_template_category_idx` ON `smsTemplates` (`category`);--> statement-breakpoint
CREATE INDEX `idx_scc_type` ON `staffChatChannels` (`type`);--> statement-breakpoint
CREATE INDEX `idx_scc_created_by` ON `staffChatChannels` (`createdBy`);--> statement-breakpoint
CREATE INDEX `idx_scm_user_id` ON `staffChatMessages` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_scm_created_at` ON `staffChatMessages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_scm_channel_id` ON `staffChatMessages` (`channelId`);--> statement-breakpoint
CREATE INDEX `idx_sm_org` ON `stock_movements` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_sm_product` ON `stock_movements` (`productId`);--> statement-breakpoint
CREATE INDEX `idx_sm_type` ON `stock_movements` (`type`);--> statement-breakpoint
CREATE INDEX `idx_org_id` ON `stripeCustomers` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_stripe_id` ON `stripeCustomers` (`stripeCustomerId`);--> statement-breakpoint
CREATE INDEX `idx_invoice_id` ON `stripePaymentIntents` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `idx_stripe_intent_id` ON `stripePaymentIntents` (`stripePaymentIntentId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `stripePaymentIntents` (`status`);--> statement-breakpoint
CREATE INDEX `idx_client_id` ON `subscriptions` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_org_id` ON `subscriptions` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_renewal_date` ON `subscriptions` (`renewalDate`);--> statement-breakpoint
CREATE INDEX `idx_expiry_date` ON `subscriptions` (`expiryDate`);--> statement-breakpoint
CREATE INDEX `idx_sh_org` ON `systemHealth` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_sh_status` ON `systemHealth` (`status`);--> statement-breakpoint
CREATE INDEX `idx_sh_created_at` ON `systemHealth` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_sl_org` ON `systemLogs` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_sl_user` ON `systemLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_sl_severity` ON `systemLogs` (`severity`);--> statement-breakpoint
CREATE INDEX `idx_sl_service` ON `systemLogs` (`service`);--> statement-breakpoint
CREATE INDEX `idx_sl_created_at` ON `systemLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_tc_org` ON `taxCompliance` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_tc_employee` ON `taxCompliance` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_tc_year` ON `taxCompliance` (`taxYear`);--> statement-breakpoint
CREATE INDEX `idx_tc_status` ON `taxCompliance` (`status`);--> statement-breakpoint
CREATE INDEX `idx_country` ON `taxRates` (`country`);--> statement-breakpoint
CREATE INDEX `idx_tax_type` ON `taxRates` (`taxType`);--> statement-breakpoint
CREATE INDEX `idx_effective_date` ON `taxRates` (`effectiveDate`);--> statement-breakpoint
CREATE INDEX `idx_tmsg_sender` ON `tenantMessages` (`senderId`);--> statement-breakpoint
CREATE INDEX `idx_ticket_id` ON `ticketResponses` (`ticketId`);--> statement-breakpoint
CREATE INDEX `idx_responder_id` ON `ticketResponses` (`responderId`);--> statement-breakpoint
CREATE INDEX `idx_ticket_number` ON `tickets` (`ticketNumber`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `tickets` (`status`);--> statement-breakpoint
CREATE INDEX `idx_created_by` ON `tickets` (`createdBy`);--> statement-breakpoint
CREATE INDEX `idx_assigned_to` ON `tickets` (`assignedTo`);--> statement-breakpoint
CREATE INDEX `idx_priority` ON `tickets` (`priority`);--> statement-breakpoint
CREATE INDEX `idx_ts_org` ON `timesheets` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_ts_employee` ON `timesheets` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_ts_week` ON `timesheets` (`weekStartDate`);--> statement-breakpoint
CREATE INDEX `idx_ts_status` ON `timesheets` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tc_org` ON `trainingCourses` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_tc_type` ON `trainingCourses` (`courseType`);--> statement-breakpoint
CREATE INDEX `idx_tc_status` ON `trainingCourses` (`status`);--> statement-breakpoint
CREATE INDEX `idx_te_org` ON `trainingEnrollments` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_te_course` ON `trainingEnrollments` (`courseId`);--> statement-breakpoint
CREATE INDEX `idx_te_employee` ON `trainingEnrollments` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_te_status` ON `trainingEnrollments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_subscription_id` ON `usageMetrics` (`subscriptionId`);--> statement-breakpoint
CREATE INDEX `idx_usage_period` ON `usageMetrics` (`usagePeriod`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `userDeletions` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_deleted_by` ON `userDeletions` (`deletedBy`);--> statement-breakpoint
CREATE INDEX `idx_deleted_at` ON `userDeletions` (`deletedAt`);--> statement-breakpoint
CREATE INDEX `idx_archived` ON `userDeletions` (`archived`);--> statement-breakpoint
CREATE INDEX `fav_user_idx` ON `userFavorites` (`userId`);--> statement-breakpoint
CREATE INDEX `fav_entity_idx` ON `userFavorites` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `idx_employee_id` ON `vacationRequests` (`employeeId`);--> statement-breakpoint
CREATE INDEX `idx_start_date` ON `vacationRequests` (`startDate`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `vacationRequests` (`status`);--> statement-breakpoint
CREATE INDEX `idx_wh_org` ON `warehouses` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_warranties_status` ON `warranties` (`status`);--> statement-breakpoint
CREATE INDEX `idx_warranties_vendor` ON `warranties` (`vendor`);--> statement-breakpoint
CREATE INDEX `idx_wc_active` ON `webhook_configs` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `webhooks` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_event_type` ON `webhooks` (`eventType`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `webhooks` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_wom_workorder` ON `workOrderMaterials` (`workOrderId`);--> statement-breakpoint
CREATE INDEX `idx_org` ON `workflowAutomationLogs` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_workflow` ON `workflowAutomationLogs` (`workflowType`);--> statement-breakpoint
CREATE INDEX `idx_source` ON `workflowAutomationLogs` (`sourceEntityId`);--> statement-breakpoint
CREATE INDEX `idx_target` ON `workflowAutomationLogs` (`targetEntityId`);--> statement-breakpoint
CREATE INDEX `idx_date` ON `workflowAutomationLogs` (`executedAt`);--> statement-breakpoint
CREATE INDEX `idx_approval_request_id` ON `approval_actions` (`approval_request_id`);--> statement-breakpoint
CREATE INDEX `idx_approver_id` ON `approval_actions` (`approver_id`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `approval_actions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_level` ON `approval_actions` (`level_number`);--> statement-breakpoint
CREATE INDEX `idx_org_id` ON `approval_audit_log` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_approval_request_id` ON `approval_audit_log` (`approval_request_id`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `approval_audit_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_workflow_id` ON `approval_levels` (`workflow_id`);--> statement-breakpoint
CREATE INDEX `idx_org_id` ON `approval_levels` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_org_id` ON `approval_metrics` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_workflow_id` ON `approval_metrics` (`workflow_id`);--> statement-breakpoint
CREATE INDEX `idx_period` ON `approval_metrics` (`period`,`period_date`);--> statement-breakpoint
CREATE INDEX `idx_recipient_id` ON `approval_notifications` (`recipient_id`);--> statement-breakpoint
CREATE INDEX `idx_approval_request_id` ON `approval_notifications` (`approval_request_id`);--> statement-breakpoint
CREATE INDEX `idx_type` ON `approval_notifications` (`type`);--> statement-breakpoint
CREATE INDEX `idx_is_read` ON `approval_notifications` (`is_read`);--> statement-breakpoint
CREATE INDEX `idx_org_id` ON `approval_requests` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_entity` ON `approval_requests` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `approval_requests` (`status`);--> statement-breakpoint
CREATE INDEX `idx_current_level` ON `approval_requests` (`current_level`);--> statement-breakpoint
CREATE INDEX `job_group_idx` ON `employees` (`jobGroupId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `idx_invoice_id` ON `payments` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `idx_client_id` ON `payments` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_payment_date` ON `payments` (`paymentDate`);--> statement-breakpoint
CREATE INDEX `idx_payment_chart_of_account` ON `payments` (`chartOfAccountId`);--> statement-breakpoint
CREATE INDEX `idx_permissions_category` ON `permissions` (`category`);--> statement-breakpoint
CREATE INDEX `idx_permissions_resource` ON `permissions` (`resource`);--> statement-breakpoint
CREATE INDEX `approval_status_idx` ON `projectTasks` (`approvalStatus`);--> statement-breakpoint
CREATE INDEX `approved_by_idx` ON `projectTasks` (`approvedBy`);--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `vatNumber`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `directors`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `bankBranch`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `riskLevel`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `kycStatus`;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `kycDocuments`;--> statement-breakpoint
ALTER TABLE `invoices` DROP COLUMN `createdFromRecurring`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `expiresAt`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `metadata`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `reorderPoint`;