UPDATE `budgetAllocations` AS allocation
LEFT JOIN (
  SELECT budgetAllocationId, SUM(amount) AS actualAmount
  FROM `expenses`
  WHERE budgetAllocationId IS NOT NULL
  GROUP BY budgetAllocationId
) AS actuals ON actuals.budgetAllocationId = allocation.id
SET allocation.spentAmount = COALESCE(actuals.actualAmount, 0);

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