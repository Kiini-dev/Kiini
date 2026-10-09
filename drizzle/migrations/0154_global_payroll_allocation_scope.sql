ALTER TABLE `employeeCostAllocations`
  MODIFY COLUMN `organizationId` varchar(64) NULL;

ALTER TABLE `payrollLedgerEntries`
  MODIFY COLUMN `organizationId` varchar(64) NULL;

ALTER TABLE `reportExportAuditLogs`
  MODIFY COLUMN `organizationId` varchar(64) NULL;
