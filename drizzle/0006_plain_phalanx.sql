CREATE TABLE `attendance` (
	`id` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`date` datetime NOT NULL,
	`checkInTime` datetime,
	`checkOutTime` datetime,
	`status` enum('present','absent','late','half_day','leave') NOT NULL,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
	);

CREATE TABLE `departments` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`headId` varchar(64),
	`budget` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `departments_id` PRIMARY KEY(`id`)
	);

CREATE TABLE `proposalItems` (
	`id` varchar(64) NOT NULL,
	`proposalId` varchar(64) NOT NULL,
	`itemType` enum('product','service','custom') NOT NULL,
	`itemId` varchar(64),
	`description` text NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`taxRate` int DEFAULT 0,
	`discountPercent` int DEFAULT 0,
	`total` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `proposalItems_id` PRIMARY KEY(`id`)
	);

CREATE TABLE `proposals` (
	`id` varchar(64) NOT NULL,
	`proposalNumber` varchar(100) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`title` varchar(255),
	`description` text,
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
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`)
	);

CREATE TABLE `receipts` (
	`id` varchar(64) NOT NULL,
	`receiptNumber` varchar(100) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`paymentId` varchar(64),
	`amount` int NOT NULL,
	`paymentMethod` enum('cash','bank_transfer','cheque','mpesa','card','other') NOT NULL,
	`receiptDate` datetime NOT NULL,
	`notes` text,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `receipts_id` PRIMARY KEY(`id`)
	);

CREATE INDEX `attendance_employee_idx` ON `attendance` (`employeeId`);
CREATE INDEX `attendance_date_idx` ON `attendance` (`date`);
CREATE INDEX `dept_name_idx` ON `departments` (`name`);
CREATE INDEX `proposal_items_idx` ON `proposalItems` (`proposalId`);
CREATE INDEX `proposal_number_idx` ON `proposals` (`proposalNumber`);
CREATE INDEX `proposal_client_idx` ON `proposals` (`clientId`);
CREATE INDEX `proposal_status_idx` ON `proposals` (`status`);
CREATE INDEX `receipt_number_idx` ON `receipts` (`receiptNumber`);
CREATE INDEX `receipt_client_idx` ON `receipts` (`clientId`);
CREATE INDEX `receipt_date_idx` ON `receipts` (`receiptDate`);