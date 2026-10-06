CREATE TABLE IF NOT EXISTS `compliance_records` (
  `id` varchar(64) NOT NULL,
  `recordType` varchar(100) NOT NULL,
  `standard` varchar(100) DEFAULT NULL,
  `score` int DEFAULT 0,
  `status` varchar(50) NOT NULL DEFAULT 'COMPLIANT',
  `findings` text,
  `dataPayload` text,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cr_type` (`recordType`),
  KEY `idx_cr_standard` (`standard`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
