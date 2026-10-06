/**
 * Organization Analytics Router Tests
 * Tests organization-level analytics and metrics functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const fakeDb: any = {
  execute: vi.fn(),
};

const normalizeQuery = (query: any): string => {
  if (typeof query === 'string') return query;
  const renderChunk = (chunk: any): string => {
    if (typeof chunk === 'string') return chunk;
    if (chunk?.queryChunks && Array.isArray(chunk.queryChunks)) {
      return normalizeQuery(chunk);
    }
    if (chunk?.value && Array.isArray(chunk.value)) {
      return chunk.value.map(renderChunk).join('');
    }
    return String(chunk);
  };

  if (query?.queryChunks && Array.isArray(query.queryChunks)) {
    return query.queryChunks.map(renderChunk).join('');
  }
  return query?.toString?.() ?? JSON.stringify(query);
};

vi.mock('../../db', () => ({
  getDb: vi.fn(async () => fakeDb),
}));

// Mock logActivity
vi.mock('../../lib/activityLogger', () => ({
  logActivity: vi.fn(() => Promise.resolve()),
}));

describe('Organization Analytics Router', () => {
  let caller: ReturnType<any>;
  let organizationAnalyticsRouter: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Dynamically import the router after mocks are set up
    const module = await import('../organizationAnalytics');
    organizationAnalyticsRouter = module.organizationAnalyticsRouter;

    // Create caller with org user context
    caller = organizationAnalyticsRouter.createCaller({
      user: {
        id: 'test-user-id',
        role: 'admin',
        organizationId: 'test-org-id',
        customRoleId: null,
      },
      db: fakeDb,
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics for organization', async () => {
      // Mock database responses
      fakeDb.execute.mockImplementation((query: any) => {
        const sql = normalizeQuery(query);
        if (sql.includes('invoices')) {
          return Promise.resolve([[
            {
              invoiceCount: 5,
              totalRevenue: '15000.00',
              paidCount: 3,
              paidAmount: '12000.00',
            }
          ]]);
        }
        if (sql.includes('expenses')) {
          return Promise.resolve([[
            {
              expenseCount: 8,
              totalExpenses: '8000.00',
              categoryCount: 4,
            }
          ]]);
        }
        if (sql.includes('employees')) {
          return Promise.resolve([[
            {
              activeEmployees: 12,
              departmentCount: 3,
            }
          ]]);
        }
        if (sql.includes('clients')) {
          return Promise.resolve([[
            {
              totalClients: 25,
              activeClients: 20,
            }
          ]]);
        }
        return Promise.resolve([[]]);
      });

      const result = await caller.getDashboardMetrics({
        month: '2024-05',
      });

      expect(result).toEqual({
        period: '2024-05',
        revenue: {
          total: 15000,
          invoiceCount: 5,
          paid: 12000,
          paidCount: 3,
          pending: 3000,
        },
        expenses: {
          total: 8000,
          count: 8,
          categories: 4,
        },
        team: {
          activeEmployees: 12,
          departments: 3,
        },
        clients: {
          total: 25,
          active: 20,
        },
        profitMargin: '46.67',
      });
    });

    it('should use current month when no month specified', async () => {
      fakeDb.execute.mockResolvedValue([[]]);

      const result = await caller.getDashboardMetrics({});

      expect(result.period).toMatch(/^\d{4}-\d{2}$/);
    });

    it('should reject non-org users', async () => {
      const nonOrgCaller = organizationAnalyticsRouter.createCaller({
        user: {
          id: 'test-user-id',
          role: 'admin',
          organizationId: null,
          customRoleId: null,
        },
        db: fakeDb,
      } as any);

      await expect(
        nonOrgCaller.getDashboardMetrics({})
      ).rejects.toThrow('Organization access required');
    });
  });

  describe('getRevenueTrend', () => {
    it('should return revenue trend for specified months', async () => {
      // Mock database to return different values for each month
      let callCount = 0;
      fakeDb.execute.mockImplementation(() => {
        callCount++;
        const revenues = [5000, 7000, 8000, 6000, 9000, 11000];
        const counts = [2, 3, 4, 3, 5, 6];
        return Promise.resolve([[
          {
            revenue: revenues[callCount - 1]?.toString() || '0.00',
            invoiceCount: counts[callCount - 1] || 0,
          }
        ]]);
      });

      const result = await caller.getRevenueTrend({
        months: 6,
      });

      expect(result.trend).toHaveLength(6);
      expect(result.trend[0]).toHaveProperty('month');
      expect(result.trend[0]).toHaveProperty('revenue');
      expect(result.trend[0]).toHaveProperty('invoiceCount');
    });

    it('should default to 6 months when not specified', async () => {
      fakeDb.execute.mockResolvedValue([[{ revenue: '0.00', invoiceCount: 0 }]]);

      const result = await caller.getRevenueTrend({});

      expect(result.trend).toHaveLength(6);
    });
  });

  describe('getExpenseBreakdown', () => {
    it('should return expense breakdown by category', async () => {
      fakeDb.execute.mockResolvedValue([[
        { category: 'Office Supplies', count: 5, total: '2500.00' },
        { category: 'Travel', count: 3, total: '1800.00' },
        { category: null, count: 2, total: '800.00' },
      ]]);

      const result = await caller.getExpenseBreakdown({
        month: '2024-05',
      });

      expect(result.period).toBe('2024-05');
      expect(result.breakdown).toHaveLength(3);
      expect(result.breakdown[0]).toEqual({
        category: 'Office Supplies',
        count: 5,
        amount: 2500,
      });
      expect(result.breakdown[2]).toEqual({
        category: 'Uncategorized',
        count: 2,
        amount: 800,
      });
    });

    it('should use current month when not specified', async () => {
      fakeDb.execute.mockResolvedValue([[]]);

      const result = await caller.getExpenseBreakdown({});

      expect(result.period).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('getTopClients', () => {
    it('should return top clients by revenue', async () => {
      fakeDb.execute.mockResolvedValue([[
        {
          id: 'client-1',
          name: 'ABC Corp',
          invoiceCount: 3,
          totalRevenue: '15000.00',
        },
        {
          id: 'client-2',
          name: 'XYZ Ltd',
          invoiceCount: 2,
          totalRevenue: '12000.00',
        },
      ]]);

      const result = await caller.getTopClients({
        limit: 10,
        month: '2024-05',
      });

      expect(result.period).toBe('2024-05');
      expect(result.topClients).toHaveLength(2);
      expect(result.topClients[0]).toEqual({
        clientId: 'client-1',
        name: 'ABC Corp',
        invoiceCount: 3,
        totalRevenue: 15000,
      });
    });

    it('should default to limit of 10', async () => {
      fakeDb.execute.mockResolvedValue([[]]);

      const result = await caller.getTopClients({});

      expect(result.topClients).toEqual([]);
    });
  });

  describe('getPaymentStatusDistribution', () => {
    it('should return payment status distribution', async () => {
      fakeDb.execute.mockResolvedValue([[
        { status: 'paid', count: 8, total: '24000.00' },
        { status: 'pending', count: 3, total: '9000.00' },
        { status: 'overdue', count: 1, total: '3000.00' },
      ]]);

      const result = await caller.getPaymentStatusDistribution({
        month: '2024-05',
      });

      expect(result.period).toBe('2024-05');
      expect(result.distribution).toHaveLength(3);
      expect(result.distribution[0]).toEqual({
        status: 'paid',
        count: 8,
        amount: 24000,
      });
    });
  });

  describe('getKpiSummary', () => {
    it('should return KPI summary with growth calculations', async () => {
      // Mock current month
      fakeDb.execute.mockImplementationOnce(() =>
        Promise.resolve([[{ invoiceCount: 10, revenue: '25000.00' }]])
      );
      // Mock previous month
      fakeDb.execute.mockImplementationOnce(() =>
        Promise.resolve([[{ invoiceCount: 8, revenue: '20000.00' }]])
      );

      const result = await caller.getKpiSummary({
        month: '2024-05',
      });

      expect(result.period).toBe('2024-05');
      expect(result.kpis.revenue.current).toBe(25000);
      expect(result.kpis.revenue.previous).toBe(20000);
      expect(result.kpis.revenue.growth).toBe(25);
      expect(result.kpis.revenue.trend).toBe('up');
      expect(result.kpis.invoices.current).toBe(10);
      expect(result.kpis.invoices.previous).toBe(8);
    });

    it('should handle zero previous revenue', async () => {
      fakeDb.execute.mockImplementationOnce(() =>
        Promise.resolve([[{ invoiceCount: 5, revenue: '10000.00' }]])
      );
      fakeDb.execute.mockImplementationOnce(() =>
        Promise.resolve([[{ invoiceCount: 0, revenue: '0.00' }]])
      );

      const result = await caller.getKpiSummary({});

      expect(result.kpis.revenue.growth).toBe(0);
    });
  });
});