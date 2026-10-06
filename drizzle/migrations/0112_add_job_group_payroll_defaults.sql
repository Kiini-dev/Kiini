ALTER TABLE `jobGroups`
  ADD COLUMN `defaultBasicSalary` int NULL,
  ADD COLUMN `defaultAnnualLeaveDays` int NOT NULL DEFAULT 21,
  ADD COLUMN `defaultAllowances` text NULL,
  ADD COLUMN `defaultDeductions` text NULL,
  ADD COLUMN `defaultBenefits` text NULL;