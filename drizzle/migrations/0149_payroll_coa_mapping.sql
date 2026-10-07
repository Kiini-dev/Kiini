ALTER TABLE `payrollCostCenters`
  ADD COLUMN `expenseAccountId` varchar(64) NULL,
  ADD COLUMN `payrollLiabilityAccountId` varchar(64) NULL;
