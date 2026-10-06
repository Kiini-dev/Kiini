-- Migration: Employee bio fields, photoUrl fix, budget lines, employee documents
-- Run: ALTER employees, CREATE budgetLines, CREATE employeeDocuments, ALTER expenses

-- Fix photoUrl column to support base64 images (was varchar(500), far too small)
ALTER TABLE `employees` MODIFY COLUMN `photoUrl` LONGTEXT;

-- Add extended employee bio columns individually so each can fail independently
ALTER TABLE `employees` ADD COLUMN `bloodType` VARCHAR(10);
ALTER TABLE `employees` ADD COLUMN `maritalStatus` VARCHAR(20);
ALTER TABLE `employees` ADD COLUMN `nextOfKinName` VARCHAR(200);
ALTER TABLE `employees` ADD COLUMN `nextOfKinPhone` VARCHAR(50);
ALTER TABLE `employees` ADD COLUMN `nextOfKinRelationship` VARCHAR(50);
ALTER TABLE `employees` ADD COLUMN `contractEndDate` DATETIME;
ALTER TABLE `employees` ADD COLUMN `probationEndDate` DATETIME;
ALTER TABLE `employees` ADD COLUMN `lastPromotionDate` DATETIME;
ALTER TABLE `employees` ADD COLUMN `performanceRating` INT;
ALTER TABLE `employees` ADD COLUMN `pfNumber` VARCHAR(100);
ALTER TABLE `employees` ADD COLUMN `nssf` VARCHAR(100);
ALTER TABLE `employees` ADD COLUMN `healthInsurance` VARCHAR(100);
ALTER TABLE `employees` ADD COLUMN `membershipNumber` VARCHAR(100);
ALTER TABLE `employees` ADD COLUMN `bankBranch` VARCHAR(100);
ALTER TABLE `employees` ADD COLUMN `directManager` VARCHAR(100);
ALTER TABLE `employees` ADD COLUMN `professionalCertifications` TEXT;

-- Create budgetLines table
CREATE TABLE IF NOT EXISTS `budgetLines` (
  `id` VARCHAR(64) PRIMARY KEY,
  `budgetId` VARCHAR(64) NOT NULL,
  `category` ENUM('CAPEX','OPEX','SALARIES','TRAINING','TRAVEL','UTILITIES','MARKETING','IT','MAINTENANCE','CONTINGENCY','OTHER') NOT NULL,
  `lineDescription` VARCHAR(255),
  `allocatedAmount` INT NOT NULL DEFAULT 0,
  `spentAmount` INT NOT NULL DEFAULT 0,
  `remainingAmount` INT NOT NULL DEFAULT 0,
  `status` ENUM('active','exhausted','frozen') DEFAULT 'active',
  `createdBy` VARCHAR(64),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `budget_line_budget_idx` (`budgetId`),
  INDEX `budget_line_category_idx` (`category`)
);

-- Create employeeDocuments table
CREATE TABLE IF NOT EXISTS `employeeDocuments` (
  `id` VARCHAR(64) PRIMARY KEY,
  `employeeId` VARCHAR(64) NOT NULL,
  `documentType` ENUM('id_card','kra_pin','nssf_card','nhif_card','academic_certificate','professional_cert','passport','driving_license','bank_statement','other') NOT NULL,
  `documentName` VARCHAR(255) NOT NULL,
  `fileData` LONGTEXT,
  `uploadedBy` VARCHAR(64),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `emp_doc_employee_idx` (`employeeId`),
  INDEX `emp_doc_type_idx` (`documentType`)
);

-- Add budgetLineId to expenses table
ALTER TABLE `expenses` ADD COLUMN `budgetLineId` VARCHAR(64);
