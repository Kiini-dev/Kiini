import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enterpriseTenantsRouter } from '../enterpriseTenants';

const fakeDb: any = {
  select: vi.fn(),
};

vi.mock('../../db', () => ({
  getDb: vi.fn(async () => fakeDb),
}));

function stubQuery(result: any) {
  const query: any = Promise.resolve(result);
  query.limit = vi.fn(async () => result);
  query.orderBy = vi.fn(() => query);
  query.where = vi.fn(() => query);
  return query;
}

describe('Enterprise Tenants Router', () => {
  beforeEach(() => {
    fakeDb.select.mockReset();
  });

  it('getPricingTiers returns active pricing plans', async () => {
    const tierRows = [{ id: 'plan1', name: 'Starter', isActive: 1, displayOrder: 1 }];
    fakeDb.select.mockImplementationOnce(() => ({ from: () => ({ where: () => ({ orderBy: () => tierRows }) }) }));

    const caller = enterpriseTenantsRouter.createCaller({ user: { id: 'u', role: 'super_admin' } } as any);
    const tiers = await caller.getPricingTiers();

    expect(tiers).toEqual(tierRows);
    expect(fakeDb.select).toHaveBeenCalled();
  });

  it('getTenantMetrics aggregates tenant statistics correctly', async () => {
    const tenantInfo = [{ id: 'org1', name: 'Example Org', plan: 'starter', isActive: 1, maxUsers: 25, createdAt: '2024-01-01', updatedAt: '2024-05-01' }];
    const userCount = [{ count: 4 }];
    const totalTickets = [{ count: 12 }];
    const newTickets = [{ count: 3 }];
    const recentCommunication = [{ sentAt: '2024-05-05 10:00:00' }];
    const latestSubscription = [{ id: 'sub1', planId: 'starter', status: 'active', updatedAt: '2024-05-04' }];

    fakeDb.select
      .mockImplementationOnce(() => ({ from: () => stubQuery(tenantInfo) }))
      .mockImplementationOnce(() => ({ from: () => stubQuery(userCount) }))
      .mockImplementationOnce(() => ({ from: () => stubQuery(totalTickets) }))
      .mockImplementationOnce(() => ({ from: () => stubQuery(newTickets) }))
      .mockImplementationOnce(() => ({ from: () => stubQuery(recentCommunication) }))
      .mockImplementationOnce(() => ({ from: () => stubQuery(latestSubscription) }));

    const caller = enterpriseTenantsRouter.createCaller({ user: { id: 'u', role: 'super_admin' } } as any);
    const metrics = await caller.getTenantMetrics('org1');

    expect(metrics).toMatchObject({
      tenantId: 'org1',
      name: 'Example Org',
      plan: 'starter',
      isActive: 1,
      userCount: 4,
      totalTickets: 12,
      newTickets: 3,
      lastCommunicationAt: '2024-05-05 10:00:00',
      latestSubscription: latestSubscription[0],
    });
    expect(fakeDb.select).toHaveBeenCalledTimes(6);
  });
});
