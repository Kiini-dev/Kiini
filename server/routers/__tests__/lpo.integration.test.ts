import { describe, it, expect, vi, beforeEach } from 'vitest';

// mock finance router so that autoPostFromModule can be spied
const fakeFinanceCaller = { autoPostFromModule: vi.fn(async () => ({ success: true })) };
vi.mock('../finance', () => ({ financeRouter: { createCaller: () => fakeFinanceCaller } }));

// mock DB helper module early so that imports within lpoRouter pick up the mocked functions
vi.mock('../../db', () => {
  const getDb = vi.fn(async () => fakeDb);
  const logActivity = vi.fn();
  const getDefaultSetting = vi.fn();
  const getSetting = vi.fn();
  const getNextDocumentNumber = vi.fn();
  return {
    getDb,
    logActivity,
    getDefaultSetting,
    getSetting,
    getNextDocumentNumber,
  };
});


import { lpoRouter } from '../lpo';
import { eq } from 'drizzle-orm';

// helper to create stub DB with configurable last-status for select
function makeFakeDb(status = 'draft', vendorId: string | null = null) {
  const inserts: any[] = [];
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: (n: number) => Promise.resolve([{ id: 'x', status, vendorId }]),
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(),
      }),
    }),
    insert: () => ({
      values: (v: any) => {
        inserts.push(v);
        return Promise.resolve();
      },
    }),
    logActivity: vi.fn(),
    _inserts: inserts,
  };
}

// will be swapped out before each test
let fakeDb: ReturnType<typeof makeFakeDb>;

beforeEach(() => {
  fakeDb = makeFakeDb();
});


describe('LPO Router business logic', () => {
  it('should forbid approving an LPO that is not submitted', async () => {
    console.log('router keys', Object.keys(lpoRouter));
    console.log('update proc', lpoRouter.update);
    const caller = lpoRouter.createCaller({ user: { id: 'u' } } as any);
    await expect(
      caller.update({ id: 'x', status: 'approved' })
    ).rejects.toThrow('Can only approve submitted LPOs');
  });

  it('should allow updating description without error', async () => {
    const caller = lpoRouter.createCaller({ user: { id: 'u' } } as any);
    await expect(
      caller.update({ id: 'x', description: 'new' })
    ).resolves.toEqual({ success: true });
  });

  it('creates journal entries when approving a submitted LPO', async () => {
    // start with a submitted LPO so approval branch runs
    fakeDb = makeFakeDb('submitted');
    fakeFinanceCaller.autoPostFromModule.mockClear();
    const caller = lpoRouter.createCaller({ user: { id: 'u' } } as any);
    await caller.update({ id: 'x', status: 'approved' });

    // the approval logic inserts at least the journal entry
    expect(fakeDb._inserts.length).toBeGreaterThanOrEqual(1);
    expect(fakeDb._inserts[0]).toMatchObject({
      createdBy: 'u',
    });
    expect(fakeDb._inserts[0].description).toContain('LPO');
    expect(fakeDb._inserts[0].description).toContain('approved');

    // auto post should have been triggered
    expect(fakeFinanceCaller.autoPostFromModule).toHaveBeenCalledWith({ module: 'lpo', recordId: 'x' });

    // later inserts should correspond to the entry lines
    expect(fakeDb._inserts.slice(1)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ journalEntryId: '-1' }),
      ])
    );
  });

  it('respects vendor-specific account settings when approving', async () => {
    // supply a vendor id and mock settings lookup via dbHelper
    fakeDb = makeFakeDb('submitted', 'vendor123');
    // configure the shared mock helpers to return defaults and vendor settings
    const dbHelpers = await import('../../db');
    dbHelpers.getDefaultSetting.mockImplementation(async (...args: any[]) => {
      return { value: 'expense:default' } as any;
    });
    dbHelpers.getSetting.mockImplementation(async (key: string) => {
      if (key === 'vendor_vendor123_expenseAccount') return { value: 'expense:vendor' };
      if (key === 'vendor_vendor123_payableAccount') return { value: 'liability:vendorpay' };
      return null;
    });
    dbHelpers.getNextDocumentNumber.mockResolvedValue('JE-123');
    const caller = lpoRouter.createCaller({ user: { id: 'u' } } as any);
    await caller.update({ id: 'x', status: 'approved' });
    // ensure our mocked helpers were actually called
    const dbHelpers2 = await import('../../db');
    expect(dbHelpers2.getDefaultSetting).toHaveBeenCalled();
    expect(dbHelpers2.getSetting).toHaveBeenCalled();
    // first insert is journal entry, following two are lines; inspect to debug
    const lineInserts = fakeDb._inserts.slice(1);
    console.log('lineInserts', lineInserts);
    expect(lineInserts.some((l: any) => l.accountId === 'expense:vendor')).toBe(true);
    expect(lineInserts.some((l: any) => l.accountId === 'liability:vendorpay')).toBe(true);
  });
});