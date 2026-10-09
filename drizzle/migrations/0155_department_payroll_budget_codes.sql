ALTER TABLE `departmentBudgets`
  ADD COLUMN `budgetCode` varchar(100) NULL;

ALTER TABLE `employeeCostAllocations`
  ADD COLUMN `budgetCode` varchar(100) NULL;

CREATE INDEX `department_budget_code_idx`
  ON `departmentBudgets` (`organizationId`, `year`, `budgetCode`);
