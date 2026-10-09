ALTER TABLE `salaryAllowances`
  ADD COLUMN `departmentIdOverride` varchar(64) NULL,
  ADD COLUMN `glAccountId` varchar(64) NULL;

ALTER TABLE `salaryDeductions`
  ADD COLUMN `departmentIdOverride` varchar(64) NULL,
  ADD COLUMN `glAccountId` varchar(64) NULL;

ALTER TABLE `employeeBenefits`
  ADD COLUMN `departmentIdOverride` varchar(64) NULL,
  ADD COLUMN `glAccountId` varchar(64) NULL;

CREATE TABLE `payrollComponentMappings` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NULL,
  `componentType` varchar(50) NOT NULL,
  `componentName` varchar(100) NOT NULL,
  `accountId` varchar(64) NOT NULL,
  `createdBy` varchar(64) NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payroll_component_mapping_org_idx` (`organizationId`),
  KEY `payroll_component_mapping_component_idx` (`componentType`, `componentName`)
);
