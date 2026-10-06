CREATE TABLE `accounts` (
	`id` varchar(64) NOT NULL,
	`accountCode` varchar(50) NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`accountType` enum('asset','liability','equity','revenue','expense') NOT NULL,
	`parentAccountId` varchar(64),
	`balance` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`description` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);

CREATE TABLE `activityLog` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(100),
	`entityId` varchar(64),
	`description` text,
	`metadata` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `activityLog_id` PRIMARY KEY(`id`)
);

CREATE TABLE `bankAccounts` (
	`id` varchar(64) NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`bankName` varchar(255) NOT NULL,
	`accountNumber` varchar(100) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'KES',
	`balance` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `bankAccounts_id` PRIMARY KEY(`id`)
);

CREATE TABLE `bankTransactions` (
	`id` varchar(64) NOT NULL,
	`bankAccountId` varchar(64) NOT NULL,
	`transactionDate` datetime NOT NULL,
	`description` text,
	`referenceNumber` varchar(100),
	`debit` int DEFAULT 0,
	`credit` int DEFAULT 0,
	`balance` int NOT NULL,
	`isReconciled` boolean NOT NULL DEFAULT false,
	`reconciledDate` datetime,
	`reconciledBy` varchar(64),
	`matchedTransactionId` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `bankTransactions_id` PRIMARY KEY(`id`)
);

CREATE TABLE `clients` (
	`id` varchar(64) NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactPerson` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`address` text,
	`city` varchar(100),
	`country` varchar(100),
	`postalCode` varchar(20),
	`taxId` varchar(100),
	`website` varchar(255),
	`industry` varchar(100),
	`status` enum('active','inactive','prospect','archived') NOT NULL DEFAULT 'active',
	`assignedTo` varchar(64),
	`notes` text,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);

CREATE TABLE `employees` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64),
	`employeeNumber` varchar(50) NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`dateOfBirth` datetime,
	`hireDate` datetime NOT NULL,
	`department` varchar(100),
	`position` varchar(100),
	`salary` int,
	`employmentType` enum('full_time','part_time','contract','intern') NOT NULL DEFAULT 'full_time',
	`status` enum('active','on_leave','terminated','suspended') NOT NULL DEFAULT 'active',
	`address` text,
	`emergencyContact` text,
	`bankAccountNumber` varchar(100),
	`taxId` varchar(100),
	`nationalId` varchar(100),
	`photoUrl` varchar(500),
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);

CREATE TABLE `estimateItems` (
	`id` varchar(64) NOT NULL,
	`estimateId` varchar(64) NOT NULL,
	`itemType` enum('product','service','custom') NOT NULL,
	`itemId` varchar(64),
	`description` text NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`taxRate` int DEFAULT 0,
	`discountPercent` int DEFAULT 0,
	`total` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `estimateItems_id` PRIMARY KEY(`id`)
);

CREATE TABLE `estimates` (
	`id` varchar(64) NOT NULL,
	`estimateNumber` varchar(100) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`title` varchar(255),
	`status` enum('draft','sent','accepted','rejected','expired') NOT NULL DEFAULT 'draft',
	`issueDate` datetime NOT NULL,
	`expiryDate` datetime,
	`subtotal` int NOT NULL,
	`taxAmount` int DEFAULT 0,
	`discountAmount` int DEFAULT 0,
	`total` int NOT NULL,
	`notes` text,
	`terms` text,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `estimates_id` PRIMARY KEY(`id`)
);

CREATE TABLE `expenses` (
	`id` varchar(64) NOT NULL,
	`expenseNumber` varchar(100),
	`category` varchar(100) NOT NULL,
	`vendor` varchar(255),
	`amount` int NOT NULL,
	`expenseDate` datetime NOT NULL,
	`paymentMethod` enum('cash','bank_transfer','cheque','card','other'),
	`receiptUrl` varchar(500),
	`description` text,
	`accountId` varchar(64),
	`status` enum('pending','approved','rejected','paid') NOT NULL DEFAULT 'pending',
	`createdBy` varchar(64),
	`approvedBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);

CREATE TABLE `invoiceItems` (
	`id` varchar(64) NOT NULL,
	`invoiceId` varchar(64) NOT NULL,
	`itemType` enum('product','service','custom') NOT NULL,
	`itemId` varchar(64),
	`description` text NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`taxRate` int DEFAULT 0,
	`discountPercent` int DEFAULT 0,
	`total` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `invoiceItems_id` PRIMARY KEY(`id`)
);

CREATE TABLE `invoices` (
	`id` varchar(64) NOT NULL,
	`invoiceNumber` varchar(100) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`estimateId` varchar(64),
	`title` varchar(255),
	`status` enum('draft','sent','paid','partial','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`issueDate` datetime NOT NULL,
	`dueDate` datetime NOT NULL,
	`subtotal` int NOT NULL,
	`taxAmount` int DEFAULT 0,
	`discountAmount` int DEFAULT 0,
	`total` int NOT NULL,
	`paidAmount` int DEFAULT 0,
	`notes` text,
	`terms` text,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);

CREATE TABLE `journalEntries` (
	`id` varchar(64) NOT NULL,
	`entryNumber` varchar(100) NOT NULL,
	`entryDate` datetime NOT NULL,
	`description` text,
	`referenceType` varchar(50),
	`referenceId` varchar(64),
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `journalEntries_id` PRIMARY KEY(`id`)
);

CREATE TABLE `journalEntryLines` (
	`id` varchar(64) NOT NULL,
	`journalEntryId` varchar(64) NOT NULL,
	`accountId` varchar(64) NOT NULL,
	`debit` int DEFAULT 0,
	`credit` int DEFAULT 0,
	`description` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `journalEntryLines_id` PRIMARY KEY(`id`)
);

CREATE TABLE `leaveRequests` (
	`id` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`leaveType` enum('annual','sick','maternity','paternity','unpaid','other') NOT NULL,
	`startDate` datetime NOT NULL,
	`endDate` datetime NOT NULL,
	`days` int NOT NULL,
	`reason` text,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`approvedBy` varchar(64),
	`approvalDate` datetime,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `leaveRequests_id` PRIMARY KEY(`id`)
);

CREATE TABLE `opportunities` (
	`id` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`value` int NOT NULL,
	`stage` enum('lead','qualified','proposal','negotiation','closed_won','closed_lost') NOT NULL DEFAULT 'lead',
	`probability` int DEFAULT 0,
	`expectedCloseDate` datetime,
	`actualCloseDate` datetime,
	`assignedTo` varchar(64),
	`source` varchar(100),
	`notes` text,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `opportunities_id` PRIMARY KEY(`id`)
);

CREATE TABLE `payments` (
	`id` varchar(64) NOT NULL,
	`invoiceId` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`amount` int NOT NULL,
	`paymentDate` datetime NOT NULL,
	`paymentMethod` enum('cash','bank_transfer','cheque','mpesa','card','other') NOT NULL,
	`referenceNumber` varchar(100),
	`notes` text,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);

CREATE TABLE `payroll` (
	`id` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`payPeriodStart` datetime NOT NULL,
	`payPeriodEnd` datetime NOT NULL,
	`basicSalary` int NOT NULL,
	`allowances` int DEFAULT 0,
	`deductions` int DEFAULT 0,
	`tax` int DEFAULT 0,
	`netSalary` int NOT NULL,
	`status` enum('draft','processed','paid') NOT NULL DEFAULT 'draft',
	`paymentDate` datetime,
	`paymentMethod` varchar(50),
	`notes` text,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `payroll_id` PRIMARY KEY(`id`)
);

CREATE TABLE `products` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`sku` varchar(100),
	`category` varchar(100),
	`unitPrice` int NOT NULL,
	`costPrice` int,
	`stockQuantity` int DEFAULT 0,
	`minStockLevel` int DEFAULT 0,
	`unit` varchar(50) DEFAULT 'pcs',
	`taxRate` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`imageUrl` varchar(500),
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);

CREATE TABLE `services` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`hourlyRate` int,
	`fixedPrice` int,
	`unit` varchar(50) DEFAULT 'hour',
	`taxRate` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);

CREATE TABLE `settings` (
	`id` varchar(64) NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`category` varchar(100),
	`description` text,
	`updatedBy` varchar(64),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);

CREATE TABLE `templates` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('invoice','estimate','receipt','proposal','report') NOT NULL,
	`content` text NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);

ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','manager','accountant','hr','sales') NOT NULL DEFAULT 'user';
ALTER TABLE `users` ADD `department` varchar(100);
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;
CREATE INDEX `account_code_idx` ON `accounts` (`accountCode`);
CREATE INDEX `account_type_idx` ON `accounts` (`accountType`);
CREATE INDEX `user_idx` ON `activityLog` (`userId`);
CREATE INDEX `entity_idx` ON `activityLog` (`entityType`,`entityId`);
CREATE INDEX `created_at_idx` ON `activityLog` (`createdAt`);
CREATE INDEX `bank_account_idx` ON `bankTransactions` (`bankAccountId`);
CREATE INDEX `transaction_date_idx` ON `bankTransactions` (`transactionDate`);
CREATE INDEX `reconciled_idx` ON `bankTransactions` (`isReconciled`);
CREATE INDEX `email_idx` ON `clients` (`email`);
CREATE INDEX `status_idx` ON `clients` (`status`);
CREATE INDEX `employee_number_idx` ON `employees` (`employeeNumber`);
CREATE INDEX `department_idx` ON `employees` (`department`);
CREATE INDEX `status_idx` ON `employees` (`status`);
CREATE INDEX `estimate_idx` ON `estimateItems` (`estimateId`);
CREATE INDEX `estimate_number_idx` ON `estimates` (`estimateNumber`);
CREATE INDEX `client_idx` ON `estimates` (`clientId`);
CREATE INDEX `status_idx` ON `estimates` (`status`);
CREATE INDEX `expense_date_idx` ON `expenses` (`expenseDate`);
CREATE INDEX `category_idx` ON `expenses` (`category`);
CREATE INDEX `status_idx` ON `expenses` (`status`);
CREATE INDEX `invoice_idx` ON `invoiceItems` (`invoiceId`);
CREATE INDEX `invoice_number_idx` ON `invoices` (`invoiceNumber`);
CREATE INDEX `client_idx` ON `invoices` (`clientId`);
CREATE INDEX `status_idx` ON `invoices` (`status`);
CREATE INDEX `due_date_idx` ON `invoices` (`dueDate`);
CREATE INDEX `entry_date_idx` ON `journalEntries` (`entryDate`);
CREATE INDEX `entry_number_idx` ON `journalEntries` (`entryNumber`);
CREATE INDEX `journal_entry_idx` ON `journalEntryLines` (`journalEntryId`);
CREATE INDEX `account_idx` ON `journalEntryLines` (`accountId`);
CREATE INDEX `employee_idx` ON `leaveRequests` (`employeeId`);
CREATE INDEX `status_idx` ON `leaveRequests` (`status`);
CREATE INDEX `start_date_idx` ON `leaveRequests` (`startDate`);
CREATE INDEX `client_idx` ON `opportunities` (`clientId`);
CREATE INDEX `stage_idx` ON `opportunities` (`stage`);
CREATE INDEX `assigned_to_idx` ON `opportunities` (`assignedTo`);
CREATE INDEX `invoice_idx` ON `payments` (`invoiceId`);
CREATE INDEX `payment_date_idx` ON `payments` (`paymentDate`);
CREATE INDEX `employee_idx` ON `payroll` (`employeeId`);
CREATE INDEX `pay_period_idx` ON `payroll` (`payPeriodStart`,`payPeriodEnd`);
CREATE INDEX `status_idx` ON `payroll` (`status`);
CREATE INDEX `sku_idx` ON `products` (`sku`);
CREATE INDEX `category_idx` ON `products` (`category`);
CREATE INDEX `key_idx` ON `settings` (`key`);
CREATE INDEX `category_idx` ON `settings` (`category`);
CREATE INDEX `type_idx` ON `templates` (`type`);