CREATE TABLE IF NOT EXISTS `lineItems` (
	`id` varchar(64) NOT NULL,
	`documentId` varchar(64) NOT NULL,
	`documentType` enum('invoice','estimate','receipt') NOT NULL,
	`description` text NOT NULL,
	`quantity` int NOT NULL,
	`rate` int NOT NULL,
	`amount` int NOT NULL,
	`productId` varchar(64),
	`serviceId` varchar(64),
	`taxRate` int DEFAULT 0,
	`taxAmount` int DEFAULT 0,
	`lineNumber` int DEFAULT 1,
	`createdBy` varchar(64),
	`createdAt` timestamp NULL,
	`updatedAt` timestamp NULL,
	CONSTRAINT `lineItems_id` PRIMARY KEY(`id`)
);

CREATE INDEX `document_idx` ON `lineItems` (`documentId`, `documentType`);
