CREATE TABLE IF NOT EXISTS `payrollCostCenters` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `departmentId` varchar(64) NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('COGS','R&D','S&M','G&A','PROGRAMMATIC') NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payroll_cost_center_org_code_uq` (`organizationId`,`code`),
  KEY `payroll_cost_center_org_idx` (`organizationId`),
  KEY `payroll_cost_center_department_idx` (`departmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `employeeCostAllocations` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `costCenterId` varchar(64) NOT NULL,
  `allocationBasisPoints` int NOT NULL,
  `effectiveDate` date NOT NULL,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_cost_allocations_employee_date_idx` (`employeeId`,`effectiveDate`),
  KEY `employee_cost_allocations_org_idx` (`organizationId`),
  KEY `employee_cost_allocations_center_idx` (`costCenterId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payrollLedgerEntries` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `payrollId` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `costCenterId` varchar(64) NOT NULL,
  `payrollPeriodStart` date NOT NULL,
  `payrollPeriodEnd` date NOT NULL,
  `allocationBasisPoints` int NOT NULL,
  `grossPayCents` int NOT NULL,
  `employerStatutoryCents` int NOT NULL,
  `employerBenefitsCents` int NOT NULL,
  `fullyBurdenedCostCents` int NOT NULL,
  `employeeTaxCents` int NOT NULL,
  `netPayoutCents` int NOT NULL,
  `processedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payroll_ledger_payroll_center_uq` (`payrollId`,`costCenterId`),
  KEY `payroll_ledger_org_period_idx` (`organizationId`,`payrollPeriodEnd`),
  KEY `payroll_ledger_center_period_idx` (`costCenterId`,`payrollPeriodEnd`),
  KEY `payroll_ledger_employee_idx` (`employeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reportExportAuditLogs` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `managerUserId` varchar(64) NOT NULL,
  `managerEmail` varchar(255) NOT NULL,
  `reportType` varchar(100) NOT NULL,
  `exportFormat` enum('CSV','XLSX','PDF') NOT NULL,
  `dateRangeStart` date NOT NULL,
  `dateRangeEnd` date NOT NULL,
  `ipAddress` varchar(45) NOT NULL,
  `userAgent` text NOT NULL,
  `generatedFileSha256` varchar(64) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `report_export_audit_org_date_idx` (`organizationId`,`createdAt`),
  KEY `report_export_audit_manager_idx` (`managerUserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
