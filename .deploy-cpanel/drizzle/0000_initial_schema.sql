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
	`isActive` boolean NOT NULL DEFAULT true,
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
	`isActive` boolean NOT NULL DEFAULT true,
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
	`isActive` boolean NOT NULL DEFAULT true,
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
	`isDefault` boolean DEFAULT false,
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