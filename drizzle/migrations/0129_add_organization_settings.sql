CREATE TABLE IF NOT EXISTS `organizationSettings` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` longtext DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `updatedBy` varchar(64) DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `org_settings_scope_key_idx` (`organizationId`, `category`, `key`),
  CONSTRAINT `organizationSettings_org_fk`
    FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;