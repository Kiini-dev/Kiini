-- Create tenantCommunications table if missing
CREATE TABLE IF NOT EXISTS `tenantCommunications` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('announcement','alert','notice','update','maintenance') NOT NULL DEFAULT 'announcement',
  `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  `status` enum('draft','sent','scheduled') NOT NULL DEFAULT 'draft',
  `recipientType` enum('all_tenants','specific_tenant','tier_based') NOT NULL DEFAULT 'all_tenants',
  `recipientFilter` json DEFAULT NULL,
  `sentAt` datetime DEFAULT NULL,
  `scheduledAt` datetime DEFAULT NULL,
  `createdBy` varchar(64) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_communications_org` (`organizationId`),
  KEY `idx_tenant_communications_status` (`status`),
  KEY `idx_tenant_communications_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create tenantCommunicationReads table for read tracking
CREATE TABLE IF NOT EXISTS `tenantCommunicationReads` (
  `id` varchar(64) NOT NULL,
  `communicationId` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `readAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_communication_user` (`communicationId`,`userId`),
  KEY `idx_tenant_communication_reads_user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;