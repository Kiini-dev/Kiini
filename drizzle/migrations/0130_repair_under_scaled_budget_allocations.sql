UPDATE `budgetAllocations` AS allocation
JOIN `budgets` AS budget ON budget.id = allocation.budgetId
JOIN (
  SELECT budgetId, SUM(allocatedAmount) AS allocationTotal
  FROM `budgetAllocations`
  GROUP BY budgetId
) AS allocationTotals ON allocationTotals.budgetId = budget.id
SET allocation.allocatedAmount = allocation.allocatedAmount * 100
WHERE budget.amount > 0
  AND allocationTotals.allocationTotal = budget.amount
  AND budget.totalBudgeted = ROUND(allocationTotals.allocationTotal / 100);

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
  budget.variance = budget.amount - ROUND(allocationTotals.spentTotal / 100)
WHERE allocationTotals.allocationTotal = budget.amount * 100
  AND budget.totalBudgeted = ROUND(budget.amount / 100);
