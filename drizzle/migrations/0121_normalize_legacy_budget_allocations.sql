UPDATE `budgetAllocations` AS allocation
JOIN `budgets` AS budget ON budget.id COLLATE utf8mb4_unicode_ci = allocation.budgetId COLLATE utf8mb4_unicode_ci
JOIN (
  SELECT budgetId, SUM(allocatedAmount) AS allocationTotal
  FROM `budgetAllocations`
  GROUP BY budgetId
) AS allocationTotals ON allocationTotals.budgetId COLLATE utf8mb4_unicode_ci = budget.id COLLATE utf8mb4_unicode_ci
SET allocation.allocatedAmount = allocation.allocatedAmount * 100,
  allocation.spentAmount = allocation.spentAmount * 100
WHERE allocationTotals.allocationTotal = budget.totalBudgeted
  AND allocationTotals.allocationTotal > 0
  AND allocationTotals.allocationTotal <= budget.amount;

UPDATE `budgets` AS budget
JOIN (
  SELECT budgetId,
    SUM(allocatedAmount) AS allocationTotal,
    SUM(spentAmount) AS spentTotal
  FROM `budgetAllocations`
  GROUP BY budgetId
) AS allocationTotals ON allocationTotals.budgetId = budget.id
SET budget.totalBudgeted = ROUND(allocationTotals.allocationTotal / 100),
  budget.totalActual = ROUND(allocationTotals.spentTotal / 100),
  budget.remaining = GREATEST(0, budget.amount - ROUND(allocationTotals.spentTotal / 100)),
  budget.variance = budget.amount - ROUND(allocationTotals.spentTotal / 100);