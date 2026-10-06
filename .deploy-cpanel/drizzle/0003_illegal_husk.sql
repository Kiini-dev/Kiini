CREATE TABLE `auditLogs` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(50) NOT NULL,
	`resourceId` varchar(64),
	`changes` text,
	`ipAddress` varchar(50),
	`userAgent` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);

CREATE TABLE `communicationLogs` (
	`id` varchar(64) NOT NULL,
	`type` enum('email','sms') NOT NULL,
	`recipient` varchar(320) NOT NULL,
	`subject` varchar(500),
	`body` text,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`error` text,
	`referenceType` varchar(50),
	`referenceId` varchar(64),
	`sentAt` datetime,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `communicationLogs_id` PRIMARY KEY(`id`)
);

CREATE TABLE `guestClients` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`address` text,
	`notes` text,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `guestClients_id` PRIMARY KEY(`id`)
);

CREATE TABLE `inventoryTransactions` (
	`id` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`type` enum('purchase','sale','adjustment','return','transfer') NOT NULL,
	`quantity` int NOT NULL,
	`unitCost` int,
	`referenceType` varchar(50),
	`referenceId` varchar(64),
	`notes` text,
	`transactionDate` datetime NOT NULL,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `inventoryTransactions_id` PRIMARY KEY(`id`)
);

CREATE TABLE `reminders` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('invoice_due','estimate_expiry','project_milestone','payment_overdue','custom') NOT NULL,
	`frequency` enum('once','daily','weekly','monthly','custom') NOT NULL,
	`customDays` int,
	`timing` enum('before','on','after') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`emailEnabled` boolean NOT NULL DEFAULT true,
	`smsEnabled` boolean NOT NULL DEFAULT false,
	`emailTemplate` text,
	`smsTemplate` text,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);

CREATE TABLE `scheduledReminders` (
	`id` varchar(64) NOT NULL,
	`reminderId` varchar(64) NOT NULL,
	`referenceType` varchar(50) NOT NULL,
	`referenceId` varchar(64) NOT NULL,
	`recipientId` varchar(64) NOT NULL,
	`recipientType` enum('user','client') NOT NULL,
	`scheduledFor` datetime NOT NULL,
	`status` enum('pending','sent','failed','cancelled') NOT NULL DEFAULT 'pending',
	`sentAt` datetime,
	`error` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `scheduledReminders_id` PRIMARY KEY(`id`)
);

CREATE TABLE `stockAlerts` (
	`id` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`alertType` enum('low_stock','out_of_stock','overstock','reorder') NOT NULL,
	`currentQuantity` int NOT NULL,
	`threshold` int NOT NULL,
	`status` enum('active','resolved','ignored') NOT NULL DEFAULT 'active',
	`notifiedAt` datetime,
	`resolvedAt` datetime,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `stockAlerts_id` PRIMARY KEY(`id`)
);

CREATE TABLE `systemSettings` (
	`id` varchar(64) NOT NULL,
	`category` varchar(100) NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`dataType` enum('string','number','boolean','json') NOT NULL,
	`description` text,
	`isPublic` boolean NOT NULL DEFAULT false,
	`updatedBy` varchar(64),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`)
);

CREATE TABLE `userPermissions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`resource` varchar(100) NOT NULL,
	`action` varchar(50) NOT NULL,
	`granted` boolean NOT NULL DEFAULT true,
	`grantedBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `userPermissions_id` PRIMARY KEY(`id`)
);

ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','staff','accountant','client','super_admin') NOT NULL DEFAULT 'user';
ALTER TABLE `clients` ADD `businessType` enum('individual','corporate','partnership','ngo');
ALTER TABLE `clients` ADD `registrationNumber` varchar(100);
ALTER TABLE `clients` ADD `vatNumber` varchar(100);
ALTER TABLE `clients` ADD `directors` text;
ALTER TABLE `clients` ADD `bankName` varchar(255);
ALTER TABLE `clients` ADD `bankAccountNumber` varchar(100);
ALTER TABLE `clients` ADD `bankBranch` varchar(255);
ALTER TABLE `clients` ADD `riskLevel` enum('low','medium','high') DEFAULT 'low';
ALTER TABLE `clients` ADD `kycStatus` enum('pending','verified','rejected') DEFAULT 'pending';
ALTER TABLE `clients` ADD `kycDocuments` text;
ALTER TABLE `products` ADD `reorderPoint` int DEFAULT 10;
ALTER TABLE `products` ADD `maxStockLevel` int;
ALTER TABLE `products` ADD `location` varchar(255);
ALTER TABLE `products` ADD `supplier` varchar(255);
ALTER TABLE `users` ADD `clientId` varchar(64);
ALTER TABLE `users` ADD `permissions` text;
CREATE INDEX `user_idx` ON `auditLogs` (`userId`);
CREATE INDEX `action_idx` ON `auditLogs` (`action`);
CREATE INDEX `resource_idx` ON `auditLogs` (`resourceType`,`resourceId`);
CREATE INDEX `created_at_idx` ON `auditLogs` (`createdAt`);
CREATE INDEX `recipient_idx` ON `communicationLogs` (`recipient`);
CREATE INDEX `status_idx` ON `communicationLogs` (`status`);
CREATE INDEX `sent_at_idx` ON `communicationLogs` (`sentAt`);
CREATE INDEX `product_idx` ON `inventoryTransactions` (`productId`);
CREATE INDEX `type_idx` ON `inventoryTransactions` (`type`);
CREATE INDEX `transaction_date_idx` ON `inventoryTransactions` (`transactionDate`);
CREATE INDEX `scheduled_for_idx` ON `scheduledReminders` (`scheduledFor`);
CREATE INDEX `status_idx` ON `scheduledReminders` (`status`);
CREATE INDEX `reference_idx` ON `scheduledReminders` (`referenceType`,`referenceId`);
CREATE INDEX `product_idx` ON `stockAlerts` (`productId`);
CREATE INDEX `status_idx` ON `stockAlerts` (`status`);
CREATE INDEX `category_key_idx` ON `systemSettings` (`category`,`key`);
CREATE INDEX `user_resource_idx` ON `userPermissions` (`userId`,`resource`);