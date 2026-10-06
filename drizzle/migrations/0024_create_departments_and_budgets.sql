-- Create departments table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text,
  `headId` varchar(64),
  `budget` int,
  `status` enum('active','inactive') DEFAULT 'active',
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create budgets table (Department Budgets)
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `departmentId` varchar(64) NOT NULL,
  `amount` int NOT NULL,
  `remaining` int NOT NULL,
  `fiscalYear` int NOT NULL,
  `budgetName` varchar(255),
  `budgetDescription` text,
  `budgetStatus` enum('draft','active','inactive','closed') DEFAULT 'draft',
  `startDate` datetime,
  `endDate` datetime,
  `approvedBy` varchar(64),
  `approvedAt` datetime,
  `createdBy` varchar(64),
  `totalBudgeted` int DEFAULT 0,
  `totalActual` int DEFAULT 0,
  `variance` int DEFAULT 0,
  `variancePercent` int DEFAULT 0,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `budget_department_idx` (`departmentId`),
  KEY `budget_fiscal_year_idx` (`fiscalYear`),
  KEY `budget_status_idx` (`budgetStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
