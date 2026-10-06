CREATE TABLE IF NOT EXISTS `userPermissions` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `resource` varchar(100) NOT NULL,
  `action` varchar(50) NOT NULL,
  `granted` tinyint NOT NULL DEFAULT 1,
  `grantedBy` varchar(64) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId_idx` (`userId`),
  KEY `resource_idx` (`resource`),
  KEY `granted_idx` (`granted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reminders` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('invoice_due','estimate_expiry','project_milestone','payment_overdue','custom') NOT NULL,
  `frequency` enum('once','daily','weekly','monthly','custom') NOT NULL,
  `customDays` int DEFAULT NULL,
  `timing` enum('before','on','after') NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `emailEnabled` tinyint NOT NULL DEFAULT 1,
  `smsEnabled` tinyint NOT NULL DEFAULT 0,
  `emailTemplate` text,
  `smsTemplate` text,
  `createdBy` varchar(64) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `scheduledReminders` (
  `id` varchar(64) NOT NULL,
  `reminderId` varchar(64) NOT NULL,
  `referenceType` varchar(50) NOT NULL,
  `referenceId` varchar(64) NOT NULL,
  `recipientId` varchar(64) NOT NULL,
  `recipientType` enum('user','client') NOT NULL,
  `scheduledFor` datetime NOT NULL,
  `status` enum('pending','sent','failed','cancelled') NOT NULL DEFAULT 'pending',
  `sentAt` datetime DEFAULT NULL,
  `error` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `userFavorites` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `entityType` varchar(50) NOT NULL,
  `entityId` varchar(64) NOT NULL,
  `entityName` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fav_user_idx` (`userId`),
  KEY `fav_entity_idx` (`entityType`,`entityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
