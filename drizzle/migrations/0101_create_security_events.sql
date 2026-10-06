-- Create the security event store used by the security dashboard and audit log.
CREATE TABLE IF NOT EXISTS `security_events` (
  `id` varchar(64) NOT NULL,
  `eventType` varchar(100) NOT NULL,
  `action` varchar(200),
  `severity` varchar(50) NOT NULL DEFAULT 'MEDIUM',
  `resourceId` varchar(200),
  `userId` varchar(64),
  `details` text,
  `status` varchar(50) NOT NULL DEFAULT 'LOGGED',
  `ipAddress` varchar(100),
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_se_type` (`eventType`),
  KEY `idx_se_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;