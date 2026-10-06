import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { subscriptions, billingInvoices, cohortAnalyses } from '../../../drizzle/schema';

const fakeDb: any = {
  select: vi.fn(),
};

vi.mock('../../db', () => ({
  getDb: vi.fn(async () => fakeDb),
}));

describe('Cohort Analytics Router', () => {
  let caller: any;
  let cohortAnalyticsRouter: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await import('../cohortAnalytics');
    cohortAnalyticsRouter = module.cohortAnalyticsRouter;
    caller = cohortAnalyticsRouter.createCaller({
      user: {
        id: 'admin-user',
        role: 'admin',
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should predict churn risk for subscriptions', async () => {
    const subscriptionRows = [
      { id: 'sub-1', status: 'active' },
      { id: 'sub-2', status: 'cancelled' },
    ];
    const overdueInvoiceRows = [
      { id: 'invoice-1', status: 'pending', subscriptionId: 'sub-2' },
    ];
    const churnPayloadRows = [
      { dataPayload: JSON.stringify({ prediction: 'High churn risk', recommendedActions: ['Review overdue accounts'] }) },
    ];

    const queryResultsByTable = new Map<any, any>([
      [subscriptions, subscriptionRows],
      [billingInvoices, overdueInvoiceRows],
      [cohortAnalyses, churnPayloadRows],
    ]);

    const createChain = () => {
      let table: any;
      const chain: any = {
        from: vi.fn((fromTable: unknown) => {
          table = fromTable;
          return chain;
        }),
        where: vi.fn(() => chain),
        orderBy: vi.fn(() => chain),
        limit: vi.fn(() => Promise.resolve(queryResultsByTable.get(table) || [])),
        then: (resolve: any) => resolve(queryResultsByTable.get(table) || []),
        catch: vi.fn(),
      };
      return chain;
    };

    fakeDb.select.mockImplementation(() => createChain());

    const result = await caller.predictChurnRisk({});

    expect(result).toEqual(expect.objectContaining({
      totalSubscriptions: 2,
      activeCount: 1,
      churnedCount: 1,
      churnRate: 50,
      overdueInvoiceCount: 1,
      riskLevel: expect.any(String),
      prediction: 'High churn risk',
      recommendedActions: ['Review overdue accounts'],
    }));
  });
});
