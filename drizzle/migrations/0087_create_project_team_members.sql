CREATE TABLE IF NOT EXISTS `projectTeamMembers` (
  `id` varchar(64) NOT NULL,
  `projectId` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `role` varchar(100) NULL,
  `hoursAllocated` int NULL,
  `startDate` datetime NULL,
  `endDate` datetime NULL,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdBy` varchar(64) NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_idx` (`projectId`),
  KEY `employee_idx` (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;