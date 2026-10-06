-- Create permissionAuditLogs table
CREATE TABLE IF NOT EXISTS `permissionAuditLogs` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `userId` varchar(255) NOT NULL,
  `orgId` varchar(255) NOT NULL,
  `feature` varchar(255) NOT NULL,
  `action` enum('CHECK','GRANT','DENY','CREATE','UPDATE','DELETE','DELEGATE') NOT NULL,
  `allowed` tinyint NOT NULL,
  `reason` text,
  `metadata` json,
  `ipAddress` varchar(45),
  `userAgent` text,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pal_user` (`userId`),
  INDEX `idx_pal_org` (`orgId`),
  INDEX `idx_pal_feature` (`feature`),
  INDEX `idx_pal_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create permissionDelegations table
CREATE TABLE IF NOT EXISTS `permissionDelegations` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `fromUserId` varchar(255) NOT NULL,
  `toUserId` varchar(255) NOT NULL,
  `orgId` varchar(255) NOT NULL,
  `features` json NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `reason` text,
  `status` enum('active','expired','revoked') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pd_from_user` (`fromUserId`),
  INDEX `idx_pd_to_user` (`toUserId`),
  INDEX `idx_pd_org` (`orgId`),
  INDEX `idx_pd_status` (`status`),
  INDEX `idx_pd_end_date` (`endDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
