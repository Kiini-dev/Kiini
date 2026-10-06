-- Create missing tables for LPO and budget allocations
CREATE TABLE `budgetAllocations` (
	`id` varchar(64) NOT NULL,
	`budgetId` varchar(64) NOT NULL,
	`categoryName` varchar(255) NOT NULL,
	`allocatedAmount` int NOT NULL,
	`spentAmount` int DEFAULT 0 NOT NULL,
	`notes` text,
	`createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgetAllocations_id` PRIMARY KEY(`id`)
);

CREATE INDEX `allocation_budget_idx` ON `budgetAllocations` (`budgetId`);

CREATE TABLE `lpos` (
	`id` varchar(64) NOT NULL,
	`lpoNumber` varchar(50) NOT NULL,
	`vendorId` varchar(64) NOT NULL,
	`description` text,
	`amount` int NOT NULL,
	`status` enum('draft','submitted','approved','rejected','received') DEFAULT 'draft' NOT NULL,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lpos_id` PRIMARY KEY(`id`)
);

CREATE INDEX `vendor_idx` ON `lpos` (`vendorId`);
CREATE INDEX `status_idx` ON `lpos` (`status`);

CREATE TABLE `lpoLineItems` (
	`id` varchar(64) NOT NULL,
	`lpoId` varchar(64) NOT NULL,
	`productId` varchar(64),
	`description` text NOT NULL,
	`quantity` int NOT NULL,
	`unit` varchar(50) DEFAULT 'pcs',
	`unitPrice` int NOT NULL,
	`taxRate` int DEFAULT 0,
	`lineTotal` int NOT NULL,
	`createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `lpoLineItems_id` PRIMARY KEY(`id`)
);

CREATE INDEX `idx_lpo_id` ON `lpoLineItems` (`lpoId`);
CREATE INDEX `idx_product_id` ON `lpoLineItems` (`productId`);