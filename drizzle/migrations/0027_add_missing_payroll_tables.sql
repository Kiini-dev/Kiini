-- Migration: Add missing payroll and HR tables
-- Date: 2026-03-05
-- Description: Create all missing payroll-related tables for HR module

-- Create salaryStructures table
CREATE TABLE IF NOT EXISTS `salaryStructures` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `employeeId` varchar(64) NOT NULL,
  `effectiveDate` datetime NOT NULL,
  `basicSalary` int NOT NULL COMMENT 'in cents',
  `allowances` int DEFAULT 0 COMMENT 'total allowances in cents',
  `deductions` int DEFAULT 0 COMMENT 'total deductions in cents',
  `taxRate` int DEFAULT 0 COMMENT 'percentage * 100',
  `notes` text,
  `approvedBy` varchar(64),
  `approvedAt` datetime,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `employee_idx` (`employeeId`),
  KEY `effective_date_idx` (`effectiveDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create salaryAllowances table
CREATE TABLE IF NOT EXISTS `salaryAllowances` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `employeeId` varchar(64) NOT NULL,
  `allowanceType` varchar(100) NOT NULL COMMENT 'house, transport, meals, phone, etc.',
  `amount` int NOT NULL COMMENT 'in cents',
  `frequency` enum('monthly','quarterly','annual','one_time') NOT NULL,
  `effectiveDate` datetime NOT NULL,
  `endDate` datetime,
  `isActive` tinyint DEFAULT 1 NOT NULL,
  `notes` text,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `employee_idx` (`employeeId`),
  KEY `type_idx` (`allowanceType`),
  KEY `is_active_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create salaryDeductions table
CREATE TABLE IF NOT EXISTS `salaryDeductions` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `employeeId` varchar(64) NOT NULL,
  `deductionType` varchar(100) NOT NULL COMMENT 'loan, pension, insurance, tax, etc.',
  `amount` int NOT NULL COMMENT 'in cents',
  `frequency` enum('monthly','quarterly','annual','one_time') NOT NULL,
  `effectiveDate` datetime NOT NULL,
  `endDate` datetime,
  `isActive` tinyint DEFAULT 1 NOT NULL,
  `reference` varchar(100) COMMENT 'loan reference number, etc.',
  `notes` text,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `employee_idx` (`employeeId`),
  KEY `type_idx` (`deductionType`),
  KEY `is_active_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create employeeBenefits table
CREATE TABLE IF NOT EXISTS `employeeBenefits` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `employeeId` varchar(64) NOT NULL,
  `benefitType` varchar(100) NOT NULL COMMENT 'health_insurance, life_insurance, pension, etc.',
  `provider` varchar(255) COMMENT 'insurance company, pension fund, etc.',
  `enrollDate` datetime NOT NULL,
  `endDate` datetime,
  `isActive` tinyint DEFAULT 1 NOT NULL,
  `coverage` text COMMENT 'coverage details',
  `cost` int COMMENT 'employee cost in cents',
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `employee_idx` (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payrollDetails table
CREATE TABLE IF NOT EXISTS `payrollDetails` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `payrollId` varchar(64) NOT NULL,
  `itemType` varchar(50) NOT NULL COMMENT 'salary, allowance, deduction, tax, etc.',
  `itemId` varchar(64) COMMENT 'reference to allowance/deduction/tax record',
  `description` varchar(255),
  `amount` int NOT NULL COMMENT 'in cents',
  `isDeduction` tinyint DEFAULT 0 NOT NULL,
  `lineNumber` int,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `payroll_idx` (`payrollId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payrollApprovals table
CREATE TABLE IF NOT EXISTS `payrollApprovals` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `payrollId` varchar(64) NOT NULL,
  `approverType` varchar(50) NOT NULL COMMENT 'HR, Finance, Department Manager',
  `approverUserId` varchar(64) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `notes` text,
  `approvedAt` datetime,
  `sequence` int NOT NULL DEFAULT 1,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `payroll_idx` (`payrollId`),
  KEY `approver_idx` (`approverUserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create employeeTaxInfo table
CREATE TABLE IF NOT EXISTS `employeeTaxInfo` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `employeeId` varchar(64) NOT NULL UNIQUE,
  `taxId` varchar(20),
  `taxFilingStatus` varchar(50) COMMENT 'filing status for tax purposes',
  `personalRelief` int COMMENT 'in cents',
  `insuranceRelief` int COMMENT 'in cents',
  `disabilityRelief` int COMMENT 'in cents',
  `allowableExpenses` int COMMENT 'in cents',
  `taxBracket` varchar(50),
  `effectiveDate` datetime,
  `notes` text,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `employee_idx` (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create salaryIncrements table
CREATE TABLE IF NOT EXISTS `salaryIncrements` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `employeeId` varchar(64) NOT NULL,
  `incrementType` varchar(50) NOT NULL COMMENT 'promotion, cost_of_living, performance, etc.',
  `previousSalary` int NOT NULL COMMENT 'in cents',
  `newSalary` int NOT NULL COMMENT 'in cents',
  `incrementAmount` int NOT NULL COMMENT 'in cents',
  `incrementPercent` decimal(5,2),
  `effectiveDate` datetime NOT NULL,
  `reason` text,
  `approvedBy` varchar(64),
  `approvedAt` datetime,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `employee_idx` (`employeeId`),
  KEY `effective_date_idx` (`effectiveDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
