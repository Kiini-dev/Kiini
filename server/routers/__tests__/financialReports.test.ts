import { describe, it, expect } from 'vitest';

/**
 * Basic calculations for financial reports
 */

describe('Financial Reports Calculations', () => {
  it('should compute net profit and margin correctly', () => {
    const revenue = 100000;
    const expenses = 60000;
    const net = revenue - expenses;
    const margin = revenue === 0 ? 0 : (net / revenue) * 100;
    expect(net).toBe(40000);
    expect(margin).toBeCloseTo(40);
  });

  it('should summarize balances by account type', () => {
    const accounts = [
      { type: 'asset', balance: 5000 },
      { type: 'liability', balance: 2000 },
      { type: 'asset', balance: 3000 },
      { type: 'revenue', balance: 1000 },
    ];
    const summary: Record<string, number> = {};
    accounts.forEach((a) => {
      summary[a.type] = (summary[a.type] || 0) + a.balance;
    });
    expect(summary.asset).toBe(8000);
    expect(summary.liability).toBe(2000);
    expect(summary.revenue).toBe(1000);
  });
});