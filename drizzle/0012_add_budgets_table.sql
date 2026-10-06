-- Create budgets table for Phase 21 budget management
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` varchar(64) NOT NULL,
  `departmentId` varchar(64) NOT NULL,
  `amount` int NOT NULL DEFAULT 0,
  `remaining` int NOT NULL DEFAULT 0,
  `fiscalYear` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_department_id` (`departmentId`),
  KEY `idx_fiscal_year` (`fiscalYear`),
  CONSTRAINT `fk_budgets_departments` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
