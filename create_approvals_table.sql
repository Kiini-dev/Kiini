CREATE TABLE IF NOT EXISTS `approvals` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `entityType` varchar(50) NOT NULL COMMENT 'invoice, expense, receipt, payment, etc.',
  `entityId` varchar(64) NOT NULL,
  `approverUserId` varchar(64) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `notes` text,
  `approvedAt` datetime,
  `sequence` int NOT NULL DEFAULT 1,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `entity_idx` (`entityType`, `entityId`),
  KEY `approver_idx` (`approverUserId`),
  KEY `status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
