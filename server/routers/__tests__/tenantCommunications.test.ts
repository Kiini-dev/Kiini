import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../db', () => {
  const fakePool = { query: vi.fn() };
  const fakeLogActivity = vi.fn(async () => Promise.resolve());

  return {
    getPool: vi.fn(() => fakePool),
    logActivity: fakeLogActivity,
  };
});

import * as db from '../../db';

describe('Tenant Communications Router', () => {
  let fakePool: any;
  let fakeLogActivity: any;
  let tenantCommunicationsRouter: any;

  beforeEach(async () => {
    const module = await import('../tenantCommunications');
    tenantCommunicationsRouter = module.tenantCommunicationsRouter;

    fakePool = db.getPool();
    fakeLogActivity = db.logActivity;

    fakePool.query.mockReset();
    fakeLogActivity.mockReset();
  });

  it('list returns tenant-specific and global announcements for org users', async () => {
    const rows = [
      {
        id: 'm1',
        organizationId: 'org1',
        subject: 'Tenant update',
        message: 'Scheduled maintenance',
        type: 'announcement',
        priority: 'normal',
        status: 'sent',
        recipientType: 'specific_tenant',
        recipientFilter: null,
        sentAt: '2024-05-01 10:00:00',
        scheduledAt: null,
        createdBy: 'u1',
        createdAt: '2024-05-01 09:50:00',
        updatedAt: '2024-05-01 09:50:00',
      },
      {
        id: 'm2',
        organizationId: null,
        subject: 'Global alert',
        message: 'System-wide notice',
        type: 'alert',
        priority: 'high',
        status: 'sent',
        recipientType: 'all_tenants',
        recipientFilter: null,
        sentAt: '2024-05-01 11:00:00',
        scheduledAt: null,
        createdBy: 'u2',
        createdAt: '2024-05-01 10:45:00',
        updatedAt: '2024-05-01 10:45:00',
      },
    ];

    fakePool.query.mockResolvedValueOnce([rows]);

    const caller = tenantCommunicationsRouter.createCaller({ user: { id: 'u1', organizationId: 'org1' } } as any);
    const result = await caller.list();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: 'm1', recipientType: 'specific_tenant' });
    expect(result[1]).toMatchObject({ id: 'm2', recipientType: 'all_tenants' });
    expect(fakePool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM tenantCommunications'),
      ['org1']
    );
  });

  it('getById returns a matching global communication for org users', async () => {
    const row = {
      id: 'm2',
      organizationId: null,
      subject: 'Global alert',
      message: 'System-wide notice',
      type: 'alert',
      priority: 'high',
      status: 'sent',
      recipientType: 'all_tenants',
      recipientFilter: null,
      sentAt: '2024-05-01 11:00:00',
      scheduledAt: null,
      createdBy: 'u2',
      createdAt: '2024-05-01 10:45:00',
      updatedAt: '2024-05-01 10:45:00',
    };

    fakePool.query.mockResolvedValueOnce([[row]]);

    const caller = tenantCommunicationsRouter.createCaller({ user: { id: 'u1', organizationId: 'org1' } } as any);
    const result = await caller.getById('m2');

    expect(result).toMatchObject({ id: 'm2', recipientType: 'all_tenants', subject: 'Global alert' });
    expect(fakePool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM tenantCommunications'),
      ['m2', 'org1']
    );
  });

  it('create stores all_tenants communications with null organizationId', async () => {
    const insertedRow = {
      id: 'm3',
      organizationId: null,
      subject: 'New global message',
      message: 'All tenants should see this',
      type: 'announcement',
      priority: 'normal',
      status: 'sent',
      recipientType: 'all_tenants',
      recipientFilter: null,
      sentAt: '2024-05-01 12:00:00',
      scheduledAt: null,
      createdBy: 'u1',
      createdAt: '2024-05-01 11:55:00',
      updatedAt: '2024-05-01 11:55:00',
    };

    fakePool.query.mockResolvedValueOnce([[]]);
    fakePool.query.mockResolvedValueOnce([[insertedRow]]);

    const caller = tenantCommunicationsRouter.createCaller({ user: { id: 'u1', role: 'admin' } } as any);
    const result = await caller.create({
      subject: 'New global message',
      message: 'All tenants should see this',
      type: 'announcement',
      priority: 'normal',
      status: 'sent',
      recipientType: 'all_tenants',
      recipientFilter: null,
    });

    expect(result).toMatchObject({ id: 'm3', organizationId: null, recipientType: 'all_tenants' });
    expect(fakePool.query.mock.calls[0][1][1]).toBeNull();
    expect(fakeLogActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'tenantCommunication:create',
        entityType: 'tenantCommunication',
        userId: 'u1',
        description: "Created communication 'New global message'",
        metadata: JSON.stringify({ recipientType: 'all_tenants', status: 'sent' }),
        entityId: expect.any(String),
      })
    );
  });
});
