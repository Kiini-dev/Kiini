-- Create organization-scoped custom roles and support user assignments
CREATE TABLE IF NOT EXISTS `customRoles` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NULL,
  `name` varchar(100) NOT NULL,
  `displayName` varchar(255) NOT NULL,
  `description` text NULL,
  `permissions` text NULL,
  `baseRole` enum('user','admin','staff','accountant','client','super_admin','project_manager','hr','ict_manager','procurement_manager','sales_manager') DEFAULT 'staff',
  `isAdvanced` tinyint NOT NULL DEFAULT 0,
  `isSystem` tinyint NOT NULL DEFAULT 0,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdBy` varchar(64) NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customRoles_orgId` (`organizationId`),
  KEY `idx_customRoles_name` (`name`),
  KEY `idx_customRoles_active` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users`
  ADD COLUMN `customRoleId` varchar(64) NULL;