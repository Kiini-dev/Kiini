ALTER TABLE `journalEntries`
  ADD COLUMN `costCenterId` varchar(64) NULL;

CREATE INDEX `journal_entry_cost_center_idx`
  ON `journalEntries` (`costCenterId`);

UPDATE `journalEntries` je
INNER JOIN `payrollCostCenters` pcc
  ON je.`description` = CONCAT('Payroll accrual: ', pcc.`code`, ' ', pcc.`name`)
  AND je.`organizationId` <=> pcc.`organizationId`
SET je.`costCenterId` = pcc.`id`
WHERE je.`referenceType` = 'payroll'
  AND je.`costCenterId` IS NULL;
