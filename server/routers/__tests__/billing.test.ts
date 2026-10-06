import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const createBillingUsageMetric = vi.fn();
const getBillingUsageMetrics = vi.fn();
const getBillingUsageSummary = vi.fn();

vi.mock('../../db', () => ({
  createBillingUsageMetric,
  getBillingUsageMetrics,
  getBillingUsageSummary,
}));

describe('Billing Router - Usage Metrics', () => {
  let caller: any;
  let billingRouter: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import('../billing');
    billingRouter = module.billingRouter;
    caller = billingRouter.createCaller({
      user: {
        id: 'admin-user',
        role: 'admin',
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should record a usage metric', async () => {
    const payload = {
      subscriptionId: 'sub-123',
      metricDate: '2026-05-01 12:00:00',
      usersCount: 10,
      projectsCount: 3,
      tasksCount: 7,
      documentsCount: 14,
      storageUsedMB: 512,
      apiCallsCount: 1300,
      emailsSent: 48,
    };

    createBillingUsageMetric.mockResolvedValueOnce({ ...payload, id: 'metric-1', recordedAt: '2026-05-01 12:00:00' });

    const result = await caller.recordUsageMetric(payload);

    expect(result).toEqual({
      success: true,
      metric: expect.objectContaining({
        id: 'metric-1',
        subscriptionId: 'sub-123',
        usersCount: 10,
        storageUsedMB: 512,
      }),
    });
    expect(createBillingUsageMetric).toHaveBeenCalledWith(expect.objectContaining({
      subscriptionId: 'sub-123',
      usersCount: 10,
      projectsCount: 3,
    }));
  });

  it('should return a list of usage metrics', async () => {
    const metrics = [
      { id: 'metric-1', subscriptionId: 'sub-123', usersCount: 6 },
      { id: 'metric-2', subscriptionId: 'sub-123', usersCount: 9 },
    ];
    getBillingUsageMetrics.mockResolvedValueOnce(metrics);

    const result = await caller.getUsageMetrics({ subscriptionId: 'sub-123', limit: 10 });

    expect(result.success).toBe(true);
    expect(result.metrics).toEqual(metrics);
    expect(getBillingUsageMetrics).toHaveBeenCalledWith('sub-123', undefined, undefined, 10);
  });

  it('should return a usage summary', async () => {
    const summary = {
      totalUsers: 15,
      totalProjects: 4,
      totalApiCalls: 2600,
      totalStorageMB: 1024,
      sampleCount: 2,
      avgUsers: 7.5,
    };
    getBillingUsageSummary.mockResolvedValueOnce(summary);

    const result = await caller.getUsageSummary({ subscriptionId: 'sub-123' });

    expect(result.success).toBe(true);
    expect(result.summary).toEqual(summary);
    expect(getBillingUsageSummary).toHaveBeenCalledWith('sub-123', undefined, undefined);
  });
});
