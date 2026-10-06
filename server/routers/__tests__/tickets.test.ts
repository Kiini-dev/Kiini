import { describe, it, expect, vi } from 'vitest';
import { canRoleCreateTicket, resolveAllowClientTickets, ticketsRouter } from '../tickets';
import { tickets, ticketComments, ticketTasks } from '../../../drizzle/schema-extended';

// stub DB similar to other integration tests
const fakeDb: any = {
  select: () => ({
    from: (table: any) => ({
      where: (cond: any) => ({
        limit: (n: number) => {
          const tableName = String(table?.name ?? table?.__tableName ?? table?.identifier ?? '')
          if (tableName.includes('organization')) {
            return Promise.resolve([{ id: 'org1', isActive: 1, plan: 'trial' }]);
          }
          if (tableName.includes('ticket')) {
            return Promise.resolve([{ id: 't1', title: 'test ticket', organizationId: 'org1' }]);
          }
          return Promise.resolve([]);
        },
      }),
    }),
  }),
  insert: () => ({ values: () => Promise.resolve() }),
  update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
  delete: () => ({ where: () => Promise.resolve() }),
  logActivity: vi.fn(),
};

// helper to simulate an existing ticket record when update is invoked
function ensureTicketExists() {
  fakeDb.select = () => ({
    from: (table: any) => ({
      where: (cond: any) => ({
        limit: (n: number) => {
          const tableName = String(table?.name ?? table?.__tableName ?? table?.identifier ?? '')
          if (tableName.includes('organization')) {
            return Promise.resolve([{ id: 'org1', isActive: 1, plan: 'trial' }]);
          }
          if (tableName.includes('ticket')) {
            return Promise.resolve([{ id: 't1', title: 'test ticket', organizationId: 'org1' }]);
          }
          return Promise.resolve([]);
        },
      }),
    }),
  });
}

vi.mock('../../db', () => ({
  getDb: vi.fn(async () => fakeDb),
  getSettingsByCategory: vi.fn(async () => []),
  logActivity: vi.fn(async () => Promise.resolve()),
}));

describe('Tickets Router basic checks', () => {
  it('should expose create and comment procedures', () => {
    expect(typeof ticketsRouter.create).toBe('function');
    expect(typeof ticketsRouter.addComment).toBe('function');
    expect(typeof ticketsRouter.update).toBe('function');
    expect(typeof ticketsRouter.list).toBe('function');
  });

  it('resolves the client-ticket setting with an allow-by-default fallback', () => {
    expect(resolveAllowClientTickets(undefined)).toBe(true);
    expect(resolveAllowClientTickets('false')).toBe(false);
    expect(resolveAllowClientTickets('0')).toBe(false);
    expect(resolveAllowClientTickets('true')).toBe(true);
  });

  it('blocks client ticket creation only when the saved setting is disabled', () => {
    expect(canRoleCreateTicket('client', 'false')).toBe(false);
    expect(canRoleCreateTicket('client', undefined)).toBe(true);
    expect(canRoleCreateTicket('user', 'false')).toBe(true);
  });

  it('create should avoid legacy client ticket columns when using the canonical support schema', async () => {
    const insertSpy = vi.fn(async () => Promise.resolve());
    fakeDb.insert = () => ({ values: insertSpy });

    const caller = ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } } as any);
    await caller.create({ clientId: 'client-1', title: 'foo', description: 'bar', requestedDueDate: '2025-02-10' });

    expect(insertSpy).toHaveBeenCalledTimes(1);
    const payload = insertSpy.mock.calls[0][0];
    expect(payload).toMatchObject({
      title: 'foo',
      description: 'bar',
      createdBy: 'u',
      organizationId: 'org1',
    });
    expect(payload).not.toHaveProperty('clientId');
    expect(payload).not.toHaveProperty('requestedDueDate');
  });

  it('create should return id', async () => {
    const caller = ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } } as any);
    const res = await caller.create({ clientId: 'c1', title: 'foo' });
    expect(res).toHaveProperty('id');
  });

  it('update with minimal fields succeeds', async () => {
    ensureTicketExists();
    const caller = ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } } as any);
    const res = await caller.update({ id: 't1', title: 'new' });
    expect(res).toEqual({ success: true });
  });

  it('addComment should return id', async () => {
    const caller = ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } } as any);
    const res = await caller.addComment({ ticketId: 't1', body: 'hello' });
    expect(res).toHaveProperty('id');
  });

  it('createTask should return id', async () => {
    const caller = ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } } as any);
    const res = await caller.createTask({ ticketId: 't1', serviceType: 'repair' });
    expect(res).toHaveProperty('id');
  });

  it('delete should succeed', async () => {
    const caller = ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } } as any);
    const res = await caller.delete('t1');
    expect(res).toEqual({ success: true });
  });

  it('getById returns ticket with comments/tasks', async () => {
    // adjust fakeDb to return sample ticket, comment, task
    fakeDb.select = () => ({
      from: (table: any) => ({
        where: (cond: any) => {
          if (table === tickets) {
            return { limit: (n: number) => Promise.resolve([{ id: 't1', title: 'hi' }]) };
          }
          if (table === ticketComments) {
            return Promise.resolve([{ id: 'c1', ticketId: 't1', body: 'a' }]);
          }
          if (table === ticketTasks) {
            return Promise.resolve([{ id: 'k1', ticketId: 't1', serviceType: 'foo' }]);
          }
          return Promise.resolve([]);
        },
      }),
    });
    const caller = ticketsRouter.createCaller({ user: { id: 'u', role: 'super_admin', organizationId: 'org1' } } as any);
    const res = await caller.getById('t1');
    expect(res).toMatchObject({ id: 't1', comments: [{ id: 'c1' }], tasks: [{ id: 'k1' }] });
  });
});
