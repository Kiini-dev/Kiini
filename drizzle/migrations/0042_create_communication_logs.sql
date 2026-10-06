-- Create communicationLogs table
CREATE TABLE IF NOT EXISTS `communicationLogs` (
  `id` varchar(64) PRIMARY KEY,
  `type` ENUM('email', 'sms') NOT NULL,
  `recipient` varchar(320) NOT NULL,
  `subject` varchar(500),
  `body` text,
  `status` ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
  `error` text,
  `referenceType` varchar(50),
  `referenceId` varchar(64),
  `sentAt` datetime,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  INDEX `recipient_idx` (`recipient`),
  INDEX `status_idx` (`status`),
  INDEX `sent_at_idx` (`sentAt`)
);
