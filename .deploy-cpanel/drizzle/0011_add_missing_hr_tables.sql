-- Add missing departments table with correct schema
CREATE TABLE IF NOT EXISTS `departments` (
    `id` varchar(64) NOT NULL PRIMARY KEY,
    `name` varchar(255) NOT NULL,
    `description` text,
    `headId` varchar(64),
    `budget` int,
    `status` enum('active','inactive') DEFAULT 'active',
    `createdBy` varchar(64),
    `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_status (status)
);

-- Add missing salaryStructures table
CREATE TABLE IF NOT EXISTS `salaryStructures` (
    `id` varchar(64) NOT NULL PRIMARY KEY,
    `employeeId` varchar(64) NOT NULL,
    `basicSalary` decimal(12, 2),
    `allowances` decimal(12, 2) DEFAULT 0,
    `deductions` decimal(12, 2) DEFAULT 0,
    `taxRate` decimal(5, 2) DEFAULT 0,
    `notes` text,
    `effectiveDate` datetime,
    `createdBy` varchar(64),
    `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employeeId (employeeId),
    CONSTRAINT fk_salary_employee FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Add missing salaryAllowances table
CREATE TABLE IF NOT EXISTS `salaryAllowances` (
    `id` varchar(64) NOT NULL PRIMARY KEY,
    `employeeId` varchar(64) NOT NULL,
    `allowanceType` varchar(100),
    `amount` decimal(12, 2),
    `frequency` enum('monthly','quarterly','annual','one_time'),
    `notes` text,
    `effectiveDate` datetime,
    `isActive` boolean DEFAULT true,
    `createdBy` varchar(64),
    `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employeeId (employeeId),
    CONSTRAINT fk_allowance_employee FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Add missing salaryDeductions table
CREATE TABLE IF NOT EXISTS `salaryDeductions` (
    `id` varchar(64) NOT NULL PRIMARY KEY,
    `employeeId` varchar(64) NOT NULL,
    `deductionType` varchar(100),
    `amount` decimal(12, 2),
    `frequency` enum('monthly','quarterly','annual','one_time'),
    `reference` varchar(255),
    `notes` text,
    `effectiveDate` datetime,
    `isActive` boolean DEFAULT true,
    `createdBy` varchar(64),
    `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employeeId (employeeId),
    CONSTRAINT fk_deduction_employee FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Add missing employeeBenefits table
CREATE TABLE IF NOT EXISTS `employeeBenefits` (
    `id` varchar(64) NOT NULL PRIMARY KEY,
    `employeeId` varchar(64) NOT NULL,
    `benefitType` varchar(100),
    `provider` varchar(255),
    `coverage` varchar(255),
    `cost` decimal(12, 2),
    `employerCost` decimal(12, 2),
    `notes` text,
    `enrollDate` datetime,
    `isActive` boolean DEFAULT true,
    `createdBy` varchar(64),
    `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employeeId (employeeId),
    CONSTRAINT fk_benefit_employee FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Add missing employeeTaxInfo table
CREATE TABLE IF NOT EXISTS `employeeTaxInfo` (
    `id` varchar(64) NOT NULL PRIMARY KEY,
    `employeeId` varchar(64) NOT NULL,
    `taxNumber` varchar(100),
    `taxBracket` varchar(50),
    `exemptions` int DEFAULT 0,
    `notes` text,
    `effectiveDate` datetime,
    `createdBy` varchar(64),
    `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employeeId (employeeId),
    UNIQUE KEY unique_employee_tax (employeeId),
    CONSTRAINT fk_tax_employee FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Add missing salaryIncrements table
CREATE TABLE IF NOT EXISTS `salaryIncrements` (
    `id` varchar(64) NOT NULL PRIMARY KEY,
    `employeeId` varchar(64) NOT NULL,
    `previousSalary` decimal(12, 2),
    `newSalary` decimal(12, 2),
    `incrementPercent` int,
    `reason` text,
    `notes` text,
    `effectiveDate` datetime,
    `approvedBy` varchar(64),
    `approvalDate` datetime,
    `createdBy` varchar(64),
    `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_employeeId (employeeId),
    CONSTRAINT fk_increment_employee FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Add missing payrollApprovals table
CREATE TABLE IF NOT EXISTS `payrollApprovals` (
    `id` varchar(64) NOT NULL PRIMARY KEY,
    `payrollId` varchar(64),
    `approverRole` varchar(100),
    `approverId` varchar(64),
    `status` enum('pending','approved','rejected') DEFAULT 'pending',
    `comments` text,
    `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payrollId (payrollId),
    INDEX idx_status (status)
);
