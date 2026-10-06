-- Users table
CREATE TABLE IF NOT EXISTS `users` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`emailVerified` timestamp NULL,
	`loginMethod` varchar(50) NOT NULL DEFAULT 'local',
	`passwordHash` varchar(255) NULL,
	`role` enum('user','admin','manager','accountant','hr','sales','super_admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NULL,
	`department` varchar(100) NULL,
	`isActive` tinyint(1) NOT NULL DEFAULT 1,
	`clientId` varchar(64) NULL,
	`permissions` text NULL,
	`passwordResetToken` varchar(255) NULL,
	`passwordResetExpiresAt` timestamp NULL,
	PRIMARY KEY (`id`),
	UNIQUE KEY `users_email_unique` (`email`)
);

-- Accounts table
CREATE TABLE IF NOT EXISTS `accounts` (
	`id` varchar(64) NOT NULL,
	`accountCode` varchar(50) NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`accountType` enum('asset','liability','equity','revenue','expense') NOT NULL,
	`parentAccountId` varchar(64) NULL,
	`balance` int DEFAULT 0,
	`isActive` tinyint(1) NOT NULL DEFAULT 1,
	`description` text NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `account_code_idx` (`accountCode`),
	KEY `account_type_idx` (`accountType`)
);

-- Clients table
CREATE TABLE IF NOT EXISTS `clients` (
	`id` varchar(64) NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactPerson` varchar(255) NULL,
	`email` varchar(320) NULL,
	`phone` varchar(50) NULL,
	`address` text NULL,
	`city` varchar(100) NULL,
	`country` varchar(100) NULL,
	`postalCode` varchar(20) NULL,
	`taxId` varchar(100) NULL,
	`website` varchar(255) NULL,
	`industry` varchar(100) NULL,
	`status` enum('active','inactive','prospect','archived') NOT NULL DEFAULT 'active',
	`assignedTo` varchar(64) NULL,
	`notes` text NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`registrationNumber` varchar(100) NULL,
	`bankAccount` varchar(100) NULL,
	`bankName` varchar(255) NULL,
	`bankCode` varchar(50) NULL,
	`branch` varchar(100) NULL,
	`creditLimit` int NULL,
	`paymentTerms` varchar(100) NULL,
	`businessType` varchar(100) NULL,
	`numberOfEmployees` int NULL,
	`yearEstablished` int NULL,
	`businessLicense` varchar(255) NULL,
	PRIMARY KEY (`id`),
	KEY `email_idx` (`email`),
	KEY `status_idx` (`status`)
);

-- Employees table
CREATE TABLE IF NOT EXISTS `employees` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NULL,
	`employeeNumber` varchar(50) NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NULL,
	`phone` varchar(50) NULL,
	`dateOfBirth` timestamp NULL,
	`hireDate` timestamp NOT NULL,
	`department` varchar(100) NULL,
	`position` varchar(100) NULL,
	`salary` int NULL,
	`employmentType` enum('full_time','part_time','contract','intern') NOT NULL DEFAULT 'full_time',
	`status` enum('active','on_leave','terminated','suspended') NOT NULL DEFAULT 'active',
	`address` text NULL,
	`emergencyContact` text NULL,
	`bankAccountNumber` varchar(100) NULL,
	`taxId` varchar(100) NULL,
	`nationalId` varchar(100) NULL,
	`photoUrl` varchar(500) NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `employee_number_idx` (`employeeNumber`),
	KEY `department_idx` (`department`),
	KEY `status_idx` (`status`)
);

-- Products table
CREATE TABLE IF NOT EXISTS `products` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NULL,
	`sku` varchar(100) NULL,
	`category` varchar(100) NULL,
	`unitPrice` int NOT NULL,
	`costPrice` int NULL,
	`stockQuantity` int DEFAULT 0,
	`minStockLevel` int DEFAULT 0,
	`unit` varchar(50) DEFAULT 'pcs',
	`taxRate` int DEFAULT 0,
	`isActive` tinyint(1) NOT NULL DEFAULT 1,
	`imageUrl` varchar(500) NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`supplier` varchar(255) NULL,
	`reorderLevel` int NULL,
	`reorderQuantity` int NULL,
	`lastRestockDate` timestamp NULL,
	PRIMARY KEY (`id`),
	KEY `sku_idx` (`sku`),
	KEY `category_idx` (`category`)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS `invoices` (
	`id` varchar(64) NOT NULL,
	`invoiceNumber` varchar(100) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`estimateId` varchar(64) NULL,
	`title` varchar(255) NULL,
	`status` enum('draft','sent','paid','partial','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`issueDate` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`subtotal` int NOT NULL,
	`taxAmount` int DEFAULT 0,
	`discountAmount` int DEFAULT 0,
	`total` int NOT NULL,
	`paidAmount` int DEFAULT 0,
	`notes` text NULL,
	`terms` text NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`paymentPlanId` varchar(64) NULL,
	PRIMARY KEY (`id`),
	KEY `invoice_number_idx` (`invoiceNumber`),
	KEY `client_idx` (`clientId`),
	KEY `status_idx` (`status`),
	KEY `due_date_idx` (`dueDate`)
);

-- Workflows table
CREATE TABLE IF NOT EXISTS `workflows` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NULL,
	`entityType` varchar(100) NOT NULL,
	`status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`isDefault` tinyint(1) DEFAULT 0,
	`order` int DEFAULT 0,
	`conditionLogic` varchar(50) NULL,
	PRIMARY KEY (`id`),
	KEY `entity_type_idx` (`entityType`),
	KEY `status_idx` (`status`),
	KEY `order_idx` (`order`)
);

-- Workflow Triggers table
CREATE TABLE IF NOT EXISTS `workflowTriggers` (
	`id` varchar(64) NOT NULL,
	`workflowId` varchar(64) NOT NULL,
	`type` varchar(100) NOT NULL,
	`operator` varchar(20) NOT NULL,
	`fieldName` varchar(255) NULL,
	`value` text NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `workflow_id_idx` (`workflowId`)
);

-- Workflow Actions table
CREATE TABLE IF NOT EXISTS `workflowActions` (
	`id` varchar(64) NOT NULL,
	`workflowId` varchar(64) NOT NULL,
	`type` varchar(100) NOT NULL,
	`actionField` varchar(255) NULL,
	`actionValue` text NULL,
	`actionType` varchar(50) NULL,
	`recipientType` varchar(50) NULL,
	`recipient` text NULL,
	`delay` int NULL,
	`delayUnit` varchar(20) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `workflow_id_idx` (`workflowId`)
);

-- Workflow Executions table
CREATE TABLE IF NOT EXISTS `workflowExecutions` (
	`id` varchar(64) NOT NULL,
	`workflowId` varchar(64) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` varchar(64) NOT NULL,
	`status` enum('pending','running','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`startedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`completedAt` timestamp NULL,
	`result` text NULL,
	`error` text NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `workflow_id_idx` (`workflowId`),
	KEY `entity_type_idx` (`entityType`),
	KEY `status_idx` (`status`),
	KEY `entity_id_idx` (`entityId`)
);

-- Settings table
CREATE TABLE IF NOT EXISTS `settings` (
	`id` varchar(64) NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NULL,
	`category` varchar(100) NULL,
	`description` text NULL,
	`updatedBy` varchar(64) NULL,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `key_idx` (`key`),
	KEY `category_idx` (`category`)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','success','warning','error','reminder') DEFAULT 'info' NOT NULL,
	`category` varchar(100) NULL,
	`entityType` varchar(100) NULL,
	`entityId` varchar(64) NULL,
	`actionUrl` varchar(500) NULL,
	`isRead` tinyint DEFAULT 0 NOT NULL,
	`readAt` datetime NULL,
	`priority` enum('low','normal','high') DEFAULT 'normal' NOT NULL,
	`expiresAt` datetime NULL,
	`metadata` text NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `user_idx` (`userId`),
	KEY `is_read_idx` (`isRead`),
	KEY `created_at_idx` (`createdAt`),
	KEY `category_idx` (`category`)
);

-- Activity Log table
CREATE TABLE IF NOT EXISTS `activityLog` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(100) NULL,
	`entityId` varchar(64) NULL,
	`description` text NULL,
	`metadata` text NULL,
	`ipAddress` varchar(45) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `user_idx` (`userId`),
	KEY `entity_idx` (`entityType`, `entityId`),
	KEY `created_at_idx` (`createdAt`)
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS `auditLogs` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(50) NOT NULL,
	`resourceId` varchar(64) NULL,
	`changes` text NULL,
	`ipAddress` varchar(50) NULL,
	`userAgent` text NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `user_idx` (`userId`),
	KEY `action_idx` (`action`)
);

-- Bank Accounts table
CREATE TABLE IF NOT EXISTS `bankAccounts` (
	`id` varchar(64) NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`bankName` varchar(255) NOT NULL,
	`accountNumber` varchar(100) NOT NULL,
	`currency` varchar(10) DEFAULT 'KES' NOT NULL,
	`balance` int DEFAULT 0,
	`isActive` tinyint DEFAULT 1 NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `account_number_unique` (`accountNumber`)
);

-- Bank Transactions table
CREATE TABLE IF NOT EXISTS `bankTransactions` (
	`id` varchar(64) NOT NULL,
	`bankAccountId` varchar(64) NOT NULL,
	`transactionDate` datetime NOT NULL,
	`description` text NULL,
	`referenceNumber` varchar(100) NULL,
	`debit` int DEFAULT 0,
	`credit` int DEFAULT 0,
	`balance` int NOT NULL,
	`isReconciled` tinyint DEFAULT 0 NOT NULL,
	`reconciledDate` datetime NULL,
	`reconciledBy` varchar(64) NULL,
	`matchedTransactionId` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `bank_account_idx` (`bankAccountId`),
	KEY `transaction_date_idx` (`transactionDate`),
	KEY `reconciled_idx` (`isReconciled`)
);

-- Services table
CREATE TABLE IF NOT EXISTS `services` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NULL,
	`category` varchar(100) NULL,
	`hourlyRate` int NULL,
	`fixedPrice` int NULL,
	`unit` varchar(50) DEFAULT 'hour',
	`taxRate` int DEFAULT 0,
	`isActive` tinyint DEFAULT 1 NOT NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`)
);

-- Estimates table (if missing)
CREATE TABLE IF NOT EXISTS `estimates` (
	`id` varchar(64) NOT NULL,
	`estimateNumber` varchar(100) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`title` varchar(255) NULL,
	`status` enum('draft','sent','accepted','rejected','expired') DEFAULT 'draft' NOT NULL,
	`issueDate` datetime NOT NULL,
	`expiryDate` datetime NULL,
	`subtotal` int NOT NULL,
	`taxAmount` int DEFAULT 0,
	`discountAmount` int DEFAULT 0,
	`total` int NOT NULL,
	`notes` text NULL,
	`terms` text NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `estimate_number_idx` (`estimateNumber`),
	KEY `client_idx` (`clientId`),
	KEY `status_idx` (`status`)
);

-- Payments table (if missing)
CREATE TABLE IF NOT EXISTS `payments` (
	`id` varchar(64) NOT NULL,
	`invoiceId` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`amount` int NOT NULL,
	`paymentDate` datetime NOT NULL,
	`paymentMethod` enum('cash','bank_transfer','cheque','mpesa','card','other') NOT NULL,
	`referenceNumber` varchar(100) NULL,
	`notes` text NULL,
	`status` enum('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending' NOT NULL,
	`approvedBy` varchar(64) NULL,
	`approvedAt` datetime NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `invoice_idx` (`invoiceId`),
	KEY `payment_date_idx` (`paymentDate`)
);

-- Journal Entries table (if missing)
CREATE TABLE IF NOT EXISTS `journalEntries` (
	`id` varchar(64) NOT NULL,
	`entryNumber` varchar(100) NOT NULL,
	`entryDate` datetime NOT NULL,
	`description` text NULL,
	`referenceType` varchar(50) NULL,
	`referenceId` varchar(64) NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `entry_date_idx` (`entryDate`),
	KEY `entry_number_idx` (`entryNumber`)
);

-- Journal Entry Lines table (if missing)
CREATE TABLE IF NOT EXISTS `journalEntryLines` (
	`id` varchar(64) NOT NULL,
	`journalEntryId` varchar(64) NOT NULL,
	`accountId` varchar(64) NOT NULL,
	`debit` int DEFAULT 0,
	`credit` int DEFAULT 0,
	`description` text NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `journal_entry_idx` (`journalEntryId`),
	KEY `account_idx` (`accountId`)
);

-- Opportunities table (if missing)
CREATE TABLE IF NOT EXISTS `opportunities` (
	`id` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NULL,
	`value` int NOT NULL,
	`stage` enum('lead','qualified','proposal','negotiation','closed_won','closed_lost') DEFAULT 'lead' NOT NULL,
	`probability` int DEFAULT 0,
	`expectedCloseDate` datetime NULL,
	`actualCloseDate` datetime NULL,
	`assignedTo` varchar(64) NULL,
	`source` varchar(100) NULL,
	`winReason` text NULL,
	`lossReason` text NULL,
	`notes` text NULL,
	`stageMovedAt` datetime NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `client_idx` (`clientId`),
	KEY `stage_idx` (`stage`),
	KEY `assigned_to_idx` (`assignedTo`)
);

-- Projects table
CREATE TABLE IF NOT EXISTS `projects` (
	`id` varchar(64) NOT NULL,
	`projectNumber` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NULL,
	`clientId` varchar(64) NOT NULL,
	`status` enum('planning','active','on_hold','completed','cancelled') NOT NULL DEFAULT 'planning',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`startDate` datetime NULL,
	`endDate` datetime NULL,
	`actualStartDate` datetime NULL,
	`actualEndDate` datetime NULL,
	`budget` int NULL,
	`actualCost` int DEFAULT 0,
	`progress` int DEFAULT 0,
	`assignedTo` varchar(64) NULL,
	`projectManager` varchar(64) NULL,
	`tags` text NULL,
	`notes` text NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `project_number_idx` (`projectNumber`),
	KEY `client_idx` (`clientId`),
	KEY `status_idx` (`status`),
	KEY `assigned_to_idx` (`assignedTo`)
);

-- Project Tasks table
CREATE TABLE IF NOT EXISTS `projectTasks` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NULL,
	`status` enum('todo','in_progress','review','completed','blocked') NOT NULL DEFAULT 'todo',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`assignedTo` varchar(64) NULL,
	`dueDate` datetime NULL,
	`completedDate` datetime NULL,
	`estimatedHours` int NULL,
	`actualHours` int NULL,
	`parentTaskId` varchar(64) NULL,
	`order` int DEFAULT 0,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `project_idx` (`projectId`),
	KEY `status_idx` (`status`),
	KEY `assigned_to_idx` (`assignedTo`)
);

-- Project Milestones table
CREATE TABLE IF NOT EXISTS `projectMilestones` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`phaseName` varchar(255) NOT NULL,
	`description` text NULL,
	`deliverables` text NULL,
	`status` enum('planning','in_progress','on_hold','completed','cancelled') NOT NULL DEFAULT 'planning',
	`startDate` datetime NULL,
	`dueDate` datetime NOT NULL,
	`completionDate` datetime NULL,
	`completionPercentage` int DEFAULT 0 NOT NULL,
	`assignedTo` varchar(64) NULL,
	`budget` int NULL,
	`actualCost` int DEFAULT 0,
	`notes` text NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `project_idx` (`projectId`),
	KEY `due_date_idx` (`dueDate`),
	KEY `status_idx` (`status`)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS `expenses` (
	`id` varchar(64) NOT NULL,
	`expenseNumber` varchar(100) NULL,
	`category` varchar(100) NOT NULL,
	`vendor` varchar(255) NULL,
	`amount` int NOT NULL,
	`expenseDate` datetime NOT NULL,
	`paymentMethod` enum('cash','bank_transfer','cheque','card','other') NULL,
	`receiptUrl` varchar(500) NULL,
	`description` text NULL,
	`accountId` varchar(64) NULL,
	`status` enum('pending','approved','rejected','paid') NOT NULL DEFAULT 'pending',
	`createdBy` varchar(64) NULL,
	`approvedBy` varchar(64) NULL,
	`chartOfAccountId` int NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `expense_date_idx` (`expenseDate`),
	KEY `category_idx` (`category`),
	KEY `status_idx` (`status`),
	KEY `chart_of_account_idx` (`chartOfAccountId`)
);

-- Recurring Invoices table
CREATE TABLE IF NOT EXISTS `recurringInvoices` (
	`id` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`templateInvoiceId` varchar(64) NOT NULL,
	`frequency` enum('weekly','biweekly','monthly','quarterly','annually') NOT NULL,
	`startDate` datetime NOT NULL,
	`endDate` datetime NULL,
	`nextDueDate` datetime NOT NULL,
	`lastGeneratedDate` datetime NULL,
	`isActive` tinyint DEFAULT 1 NOT NULL,
	`description` text NULL,
	`noteToInvoice` text NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `client_idx` (`clientId`),
	KEY `is_active_idx` (`isActive`),
	KEY `next_due_date_idx` (`nextDueDate`)
);

-- Payment Plans table
CREATE TABLE IF NOT EXISTS `paymentPlans` (
	`id` varchar(64) NOT NULL,
	`invoiceId` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`numInstallments` int NOT NULL,
	`installmentAmount` int NOT NULL,
	`frequencyDays` int NOT NULL,
	`startDate` datetime NOT NULL,
	`nextInstallmentDue` datetime NOT NULL,
	`lastInstallmentDate` datetime NULL,
	`completedInstallments` int DEFAULT 0 NOT NULL,
	`totalPaid` int DEFAULT 0 NOT NULL,
	`status` enum('active','paused','completed','cancelled') NOT NULL DEFAULT 'active',
	`notes` text NULL,
	`createdBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `invoice_idx` (`invoiceId`),
	KEY `client_idx` (`clientId`),
	KEY `status_idx` (`status`),
	KEY `next_installment_idx` (`nextInstallmentDue`)
);

-- Invoice Items table
CREATE TABLE IF NOT EXISTS `invoiceItems` (
	`id` varchar(64) NOT NULL,
	`invoiceId` varchar(64) NOT NULL,
	`itemType` enum('product','service','custom') NOT NULL,
	`itemId` varchar(64) NULL,
	`description` text NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`taxRate` int DEFAULT 0,
	`discountPercent` int DEFAULT 0,
	`total` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `invoice_idx` (`invoiceId`)
);

-- Estimate Items table
CREATE TABLE IF NOT EXISTS `estimateItems` (
	`id` varchar(64) NOT NULL,
	`estimateId` varchar(64) NOT NULL,
	`itemType` enum('product','service','custom') NOT NULL,
	`itemId` varchar(64) NULL,
	`description` text NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`taxRate` int DEFAULT 0,
	`discountPercent` int DEFAULT 0,
	`total` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `estimate_idx` (`estimateId`)
);