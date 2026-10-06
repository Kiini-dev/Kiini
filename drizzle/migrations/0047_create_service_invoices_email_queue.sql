-- Create serviceInvoices table
CREATE TABLE IF NOT EXISTS `serviceInvoices` (
  `id` varchar(64) NOT NULL,
  `serviceInvoiceNumber` varchar(100) NOT NULL,
  `issueDate` datetime NOT NULL,
  `dueDate` datetime NOT NULL,
  `clientId` varchar(64) NOT NULL,
  `clientName` varchar(255) NOT NULL,
  `serviceDescription` text NOT NULL,
  `total` int NOT NULL,
  `taxAmount` int DEFAULT 0,
  `notes` text,
  `status` enum('draft','sent','accepted','paid','cancelled') NOT NULL DEFAULT 'draft',
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_invoice_number_idx` (`serviceInvoiceNumber`),
  KEY `client_id_idx` (`clientId`),
  KEY `status_idx` (`status`),
  KEY `issue_date_idx` (`issueDate`)
);

-- Create serviceInvoiceItems table
CREATE TABLE IF NOT EXISTS `serviceInvoiceItems` (
  `id` varchar(64) NOT NULL,
  `serviceInvoiceId` varchar(64) NOT NULL,
  `description` varchar(500) NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` int NOT NULL,
  `total` int NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `service_invoice_idx` (`serviceInvoiceId`)
);

-- Create emailQueue table
CREATE TABLE IF NOT EXISTS `emailQueue` (
  `id` varchar(64) NOT NULL,
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
  `lastAttemptAt` timestamp NULL,
  `nextRetryAt` timestamp NULL,
  `errorMessage` text,
  `metadata` text,
  `sentAt` timestamp NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_recipient` (`recipientEmail`),
  KEY `idx_next_retry` (`nextRetryAt`),
  KEY `idx_event_type` (`eventType`),
  KEY `idx_created_at` (`createdAt`)
);

-- Create emailLog table
CREATE TABLE IF NOT EXISTS `emailLog` (
  `id` varchar(64) NOT NULL,
  `queueId` varchar(64),
  `recipientEmail` varchar(320) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `eventType` varchar(100) NOT NULL,
  `status` enum('sent','failed') NOT NULL,
  `messageId` varchar(255),
  `errorMessage` text,
  `sentAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_recipient` (`recipientEmail`),
  KEY `idx_sent_at` (`sentAt`),
  KEY `idx_event_type` (`eventType`)
);
