import { describe, it, expect, vi } from 'vitest';
import { financeRouter } from '../finance';

const fakeDb: any = {
  setSetting: vi.fn(),
  getSetting: vi.fn(async (key: string) => ({ value: 'X' })),
  getDefaultSetting: vi.fn(async (category: string, key: string) => ({ value: 'X' })),
  insert: () => ({ values: () => Promise.resolve() }),
  select: () => ({ from: () => ({ where: () => ({ limit: (n: number) => Promise.resolve([]) }) }) }),
  logActivity: vi.fn(),
};

vi.mock('../../db', () => ({
  getDb: vi.fn(async () => fakeDb),
}));

describe('Finance Router basic checks', () => {
  it('should expose vendor account procedures and reconciliation', () => {
    expect(typeof financeRouter.setVendorAccounts).toBe('function');
    expect(typeof financeRouter.getVendorAccounts).toBe('function');
    expect(typeof financeRouter.reconcileEntry).toBe('function');
    expect(typeof financeRouter.listReconciliations).toBe('function');
  });

  it('setVendorAccounts should write settings', async () => {
    const caller = financeRouter.createCaller({ user: { id: 'u' } } as any);
    const res = await caller.setVendorAccounts({ vendorId: 'v1', expenseAccountId: 'e1', payableAccountId: 'p1' });
    expect(res).toEqual({ success: true });
    expect(fakeDb.setSetting).toHaveBeenCalledTimes(2);
  });

  it('getVendorAccounts returns stored values or nulls', async () => {
    vi.mocked(fakeDb.getSetting).mockResolvedValueOnce({ value: 'expVal' }).mockResolvedValueOnce({ value: 'payVal' });
    const caller = financeRouter.createCaller({ user: { id: 'u' } } as any);
    const res = await caller.getVendorAccounts('v1');
    expect(res).toEqual({ expense: 'expVal', payable: 'payVal' });
  });

  it('reconcileEntry should insert and log', async () => {
    const caller = financeRouter.createCaller({ user: { id: 'u' } } as any);
    const res = await caller.reconcileEntry({ journalEntryId: 'je1', notes: 'note' });
    expect(res).toHaveProperty('id');
    expect(fakeDb.insert).toBeDefined();
    expect(fakeDb.logActivity).toHaveBeenCalled();
  });

  it('listReconciliations should query table', async () => {
    const caller = financeRouter.createCaller({ user: { id: 'u' } } as any);
    const res = await caller.listReconciliations({ journalEntryId: undefined });
    expect(res).toBeDefined();
  });

  it('getDefaults returns nulls or values', async () => {
    vi.mocked(fakeDb.getDefaultSetting).mockResolvedValueOnce({ value: 'defExp' } as any);
    // second call will automatically return next value
    vi.mocked(fakeDb.getDefaultSetting).mockResolvedValueOnce({ value: 'defPay' } as any);
    const caller = financeRouter.createCaller({ user: { id: 'u' } } as any);
    const def = await caller.getDefaults();
    expect(def).toEqual({ expense: 'defExp', payable: 'defPay' });
  });

  it('listVendorAccounts parses settings map', async () => {
    // simulate db.getSettingsByCategory
    fakeDb.getSettingsByCategory = vi.fn(async () => [
      { key: 'vendor_v1_expenseAccount', value: 'e1' },
      { key: 'vendor_v1_payableAccount', value: 'p1' },
      { key: 'vendor_v2_expenseAccount', value: 'e2' },
    ]);
    const caller = financeRouter.createCaller({ user: { id: 'u' } } as any);
    const list = await caller.listVendorAccounts();
    expect(list).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ vendorId: 'v1', expense: 'e1', payable: 'p1' }),
        expect.objectContaining({ vendorId: 'v2', expense: 'e2' }),
      ])
    );
  });

  it('updateReconciliation should update notes and log', async () => {
    fakeDb.update = vi.fn(() => ({ set: () => ({ where: () => Promise.resolve() }) }));
    const caller = financeRouter.createCaller({ user: { id: 'u' } } as any);
    const result = await caller.updateReconciliation({ id: 'rec1', notes: 'changed' });
    expect(result).toEqual({ success: true });
    expect(fakeDb.update).toHaveBeenCalled();
    expect(fakeDb.logActivity).toHaveBeenCalledWith({ userId: 'u', action: 'entry_reconciliation_updated', entityType: 'journalEntry', entityId: 'rec1', description: 'changed' });
  });

  it('listReconciliations can filter by notes and export', async () => {
    // simulate a simple select query builder with where chain
    const fakeRows = [{ id: '1', journalEntryId: 'je1', notes: 'some notes' }];
    fakeDb.select = () => ({ from: () => ({ where: (cond: any) => ({ where: (c2: any) => ({ where: () => Promise.resolve(fakeRows) }) }) }) });
    const caller = financeRouter.createCaller({ user: { id: 'u' } } as any);
    const list = await caller.listReconciliations({ notesSearch: 'some' });
    expect(list).toEqual(fakeRows);
    const exp = await caller.exportReconciliations({ journalEntryId: 'je1' });
    expect(exp).toEqual(fakeRows.map(r => ({
      id: r.id,
      journalEntryId: r.journalEntryId,
      reconciledBy: r.reconciledBy,
      reconciledAt: r.reconciledAt,
      notes: r.notes,
    })));
  });

  it('undoReconciliation should delete and log', async () => {
    fakeDb.delete = vi.fn(() => ({ where: () => Promise.resolve() }));
    const caller = financeRouter.createCaller({ user: { id: 'u' } } as any);
    const result = await caller.undoReconciliation('rec2');
    expect(result).toEqual({ success: true });
    expect(fakeDb.delete).toHaveBeenCalled();
    expect(fakeDb.logActivity).toHaveBeenCalledWith({ userId: 'u', action: 'entry_reconciliation_undone', entityType: 'journalEntry', entityId: 'rec2', description: '' });
  });

  it('exportVendorAccounts returns raw settings', async () => {
    fakeDb.getSettingsByCategory = vi.fn(async () => [{ key: 'vendor_x', value: 'y' }]);
    const caller = financeRouter.createCaller({ user: { id: 'u' } } as any);
    const data = await caller.exportVendorAccounts();
    expect(data).toEqual([{ key: 'vendor_x', value: 'y' }]);
  });

  it('autoPostFromModule logs activity and returns success', async () => {
    const caller = financeRouter.createCaller({ user: { id: 'u' } } as any);
    const res = await caller.autoPostFromModule({ module: 'lpo', recordId: 'rec123' });
    expect(res).toEqual({ success: true });
    expect(fakeDb.logActivity).toHaveBeenCalledWith({ userId: 'u', action: 'auto_post', entityType: 'lpo', entityId: 'rec123', description: '' });
  });
});
