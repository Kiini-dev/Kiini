ALTER TABLE `budgetAllocations`
  ADD COLUMN `accountId` varchar(64) NULL AFTER `budgetId`;