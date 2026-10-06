-- Fix schema mismatches between Drizzle ORM and actual database

-- 1. Add missing budgetAllocationId column to expenses table
ALTER TABLE `expenses` 
ADD COLUMN `budgetAllocationId` varchar(64) NULL AFTER `accountId`;

-- 2. Ensure leaveRequests table exists with correct schema
CREATE TABLE IF NOT EXISTS `leaveRequests` (
	`id` varchar(64) NOT NULL,
	`employeeId` varchar(64) NOT NULL,
	`leaveType` enum('annual','sick','maternity','paternity','unpaid','other') NOT NULL,
	`startDate` datetime NOT NULL,
	`endDate` datetime NOT NULL,
	`days` int NOT NULL,
	`reason` text NULL,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`approvedBy` varchar(64) NULL,
	`approvalDate` datetime NULL,
	`notes` text NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `employee_idx` (`employeeId`),
	KEY `status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Ensure userRoles table exists with correct schema
CREATE TABLE IF NOT EXISTS `userRoles` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`role` varchar(50) NULL,
	`roleName` varchar(100) NULL,
	`description` text NULL,
	`isActive` tinyint DEFAULT 1,
	`assignedBy` varchar(64) NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `user_idx` (`userId`),
	KEY `is_active_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
