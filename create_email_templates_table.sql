CREATE TABLE IF NOT EXISTS `emailTemplates` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `htmlContent` text NOT NULL,
  `plainTextContent` text,
  `category` varchar(100) NOT NULL DEFAULT 'general',
  `variables` json DEFAULT NULL,
  `attachments` json DEFAULT NULL,
  `description` text,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `isSystem` tinyint NOT NULL DEFAULT '0',
  `createdBy` varchar(64) DEFAULT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
