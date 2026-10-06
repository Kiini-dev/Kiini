-- Canonical permission catalog used by the permissions administration UI.
-- Grants remain user-scoped in userPermissions.
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` varchar(64) NOT NULL,
  `name` varchar(100) NULL,
  `permissionName` varchar(100) NULL,
  `description` text NULL,
  `category` varchar(100) NULL,
  `resource` varchar(100) NULL,
  `action` varchar(50) NULL,
  `isAdvanced` tinyint NOT NULL DEFAULT 0,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_permissions_category` (`category`),
  KEY `idx_permissions_resource` (`resource`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
