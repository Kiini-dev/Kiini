CREATE TABLE IF NOT EXISTS `employeeDisciplinaryActions` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NULL,
  `employeeId` varchar(64) NOT NULL,
  `actionType` varchar(50) NOT NULL,
  `severity` varchar(30) NOT NULL,
  `incidentDate` datetime NOT NULL,
  `description` text NOT NULL,
  `actionTaken` text NULL,
  `status` enum('open','under_review','resolved','appealed') NOT NULL DEFAULT 'open',
  `resolution` text NULL,
  `resolvedBy` varchar(64) NULL,
  `resolvedAt` datetime NULL,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `discipline_employee_idx` (`employeeId`),
  KEY `discipline_org_idx` (`organizationId`),
  KEY `discipline_status_idx` (`status`)
);

CREATE TABLE IF NOT EXISTS `employeeDepartmentMovements` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NULL,
  `employeeId` varchar(64) NOT NULL,
  `fromDepartment` varchar(100) NULL,
  `toDepartment` varchar(100) NOT NULL,
  `effectiveDate` datetime NOT NULL,
  `reason` text NULL,
  `status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `movement_employee_idx` (`employeeId`),
  KEY `movement_org_idx` (`organizationId`),
  KEY `movement_effective_date_idx` (`effectiveDate`)
);

ALTER TABLE `documentNumberFormats`
  MODIFY COLUMN `documentType` enum('invoice','estimate','receipt','proposal','expense','payment','contract','quotation','purchase_order','project','credit_note','debit_note','delivery_note','lpo','grn','work_order','service_invoice') NOT NULL;