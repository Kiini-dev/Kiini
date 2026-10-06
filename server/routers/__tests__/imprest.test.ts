import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';

const createSchema = z.object({
  userId: z.string(),
  purpose: z.string().optional(),
  amount: z.number().positive(),
});

const updateSchema = z.object({
  id: z.string(),
  status: z.enum(["requested","approved","rejected","settled"]).optional(),
  purpose: z.string().optional(),
  amount: z.number().positive().optional(),
});

describe('Imprest Router Validation', () => {
  it('accepts valid create input', () => {
    const valid = { userId: 'u1', purpose: 'stationery', amount: 1000 };
    expect(() => createSchema.parse(valid)).not.toThrow();
  });

  it('rejects zero amount', () => {
    expect(() => createSchema.parse({ userId: 'u1', amount: 0 })).toThrow();
  });

  it('accepts valid update input', () => {
    const valid = { id: 'i1', status: 'approved' };
    expect(() => updateSchema.parse(valid)).not.toThrow();
  });

  it('rejects update missing id', () => {
    expect(() => updateSchema.parse({ status: 'approved' })).toThrow();
  });
});

// business logic tests
import { imprestRouter } from '../imprest';
import { vi } from 'vitest';

const fakeDb: any = {
  select: () => ({ from: () => ({ where: () => ({ limit: (n: number) => Promise.resolve([{ id: 'i1' }]) }) }) }),
  update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
  insert: () => ({ values: () => Promise.resolve() }),
};
let inserts: any[] = [];

beforeEach(() => {
  inserts = [];
  fakeDb.insert = () => ({ values: (v: any) => { inserts.push(v); return Promise.resolve(); } });
});

vi.mock('../../db', () => ({
  getDb: vi.fn(async () => fakeDb),
  logActivity: vi.fn(),
}));

describe('Imprest Router operations', () => {
  it('creates journal entry on approval', async () => {
    const caller = imprestRouter.createCaller({ user: { id: 'u' } } as any);
    await caller.update({ id: 'i1', status: 'approved' });
    // expect at least one insert for entry and two lines
    expect(inserts.length).toBeGreaterThanOrEqual(3);
    expect(inserts[0]).toHaveProperty('entryNumber');
  });
});