-- Repair payroll and attendance tables skipped by previously marked migrations
CREATE TABLE IF NOT EXISTS `payslips` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NULL,
  `employeeId` varchar(64) NOT NULL,
  `payrollId` varchar(64) NULL,
  `payPeriod` varchar(20) NOT NULL,
  `payDate` date NULL,
  `payPeriodStart` datetime NULL,
  `payPeriodEnd` datetime NULL,
  `basicSalary` int NOT NULL DEFAULT 0,
  `grossPay` int NOT NULL DEFAULT 0,
  `grossSalary` int NOT NULL DEFAULT 0,
  `totalAllowances` int NOT NULL DEFAULT 0,
  `allowances` int NOT NULL DEFAULT 0,
  `totalDeductions` int NOT NULL DEFAULT 0,
  `netPay` int NOT NULL DEFAULT 0,
  `netSalary` int NOT NULL DEFAULT 0,
  `paye` int NOT NULL DEFAULT 0,
  `nhif` int NOT NULL DEFAULT 0,
  `nssf` int NOT NULL DEFAULT 0,
  `shif` int NOT NULL DEFAULT 0,
  `housingLevy` int NOT NULL DEFAULT 0,
  `customDeductions` int NOT NULL DEFAULT 0,
  `allowancesBreakdown` text NULL,
  `deductionsBreakdown` text NULL,
  `htmlContent` longtext NULL,
  `pdfUrl` varchar(500) NULL,
  `sentTo` varchar(320) NULL,
  `status` enum('draft','generated','sent','viewed','downloaded') NOT NULL DEFAULT 'draft',
  `sentAt` datetime NULL,
  `viewedAt` datetime NULL,
  `downloadedAt` datetime NULL,
  `employeeNotes` text NULL,
  `notes` text NULL,
  `createdBy` varchar(64) NULL,
  `processedBy` varchar(64) NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payslips_employee_idx` (`employeeId`),
  KEY `payslips_org_idx` (`organizationId`),
  KEY `payslips_period_idx` (`payPeriod`),
  KEY `payslips_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `attendance`
  ADD COLUMN `organizationId` varchar(64) NULL;

ALTER TABLE `attendance`
  ADD KEY `attendance_org_idx` (`organizationId`);