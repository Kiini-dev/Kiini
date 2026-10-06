import { describe, expect, it } from 'vitest';
import { calculateBudgetSpendDelta } from '../../server/utils/budgetEnforcer';

describe('budget allocation actual spend tracking', () => {
  it('keeps projected budget lines separate from actual spending', () => {
    const result = calculateBudgetSpendDelta({
      allocatedAmount: 100000,
      spentAmount: 25000,
      deltaCents: 15000,
    });

    expect(result.spentAmount).toBe(40000);
    expect(result.remaining).toBe(60000);
    expect(result.projectedBudget).toBe(100000);
  });
});
