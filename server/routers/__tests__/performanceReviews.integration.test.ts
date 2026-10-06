import { describe, it, expect, vi } from 'vitest';
import { performanceReviewsRouter } from '../performanceReviews';

// simple fake db stub replicating minimal queries
const fakeDb: any = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: (n: number) => Promise.resolve([{ id: 'r1', status: 'pending' }]),
      }),
    }),
  }),
  insert: () => ({ values: () => Promise.resolve() }),
  update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
  delete: () => ({ where: () => Promise.resolve() }),
  logActivity: vi.fn(),
};

vi.mock('../../db', () => ({
  getDb: vi.fn(async () => fakeDb),
  logActivity: vi.fn(),
}));

describe('PerformanceReviews Router business logic', () => {
  it('create mutation returns id', async () => {
    const caller = performanceReviewsRouter.createCaller({ user: { id: 'u' } } as any);
    const result = await caller.create({ employeeId: 'e1', reviewerId: 'r1', rating: 3 });
    expect(result).toHaveProperty('id');
  });

  it('update mutation works with minimal fields', async () => {
    const caller = performanceReviewsRouter.createCaller({ user: { id: 'u' } } as any);
    const result = await caller.update({ id: 'r1', rating: 4 });
    expect(result).toEqual({ success: true });
  });

  it('delete mutation succeeds', async () => {
    const caller = performanceReviewsRouter.createCaller({ user: { id: 'u' } } as any);
    const result = await caller.delete('r1');
    expect(result).toEqual({ success: true });
  });
});