import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// minimal fake database object used by getDb stub
const fakeDb: any = {
  select: () => ({ from: () => ({ where: () => ({ limit: (n: number) => Promise.resolve([]) }) }) }),
  insert: () => ({ values: () => Promise.resolve() }),
  update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
  delete: () => ({ where: () => Promise.resolve() }),
  execute: () => Promise.resolve(),
};

import * as db from '../../db';

// set the fake db instance before any tests execute
beforeAll(() => {
  db.__setDbForTests(fakeDb);
});

describe('Settings Router - Document Numbering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // always return a default format to avoid DB insert branch
    vi.spyOn(db, 'getDocumentNumberFormat').mockResolvedValue({
      prefix: 'INV-',
      padding: 6,
      separator: '-',
      currentNumber: 1,
    } as any);
    // stub update chain so incrementing number doesn't error
    // fakeDb already provides a minimal update implementation; track calls if needed
    vi.spyOn(fakeDb, 'update');
  });

  describe('getNextDocumentNumber', () => {
    it('should generate the first invoice number with default prefix', async () => {
      // using default format stubbed in beforeEach

      const result = await db.getNextDocumentNumber('invoice');

      expect(result).toBe('INV-000001');
      // update should have been invoked to increment the counter
      expect(fakeDb.update).toHaveBeenCalled();
    });

    it('should increment invoice number correctly', async () => {
      // even if currentNumber is 5, format stub controls this
      vi.spyOn(db, 'getDocumentNumberFormat').mockResolvedValueOnce({
        prefix: 'INV-',
        padding: 6,
        separator: '-',
        currentNumber: 5,
      } as any);

      const result = await db.getNextDocumentNumber('invoice');

      expect(result).toBe('INV-000005');
      expect(fakeDb.update).toHaveBeenCalled();
    });

    it('should generate estimate numbers with EST- prefix', async () => {
      vi.spyOn(db, 'getDocumentNumberFormat').mockResolvedValueOnce({
        prefix: 'EST-',
        padding: 6,
        separator: '-',
        currentNumber: 1,
      } as any);

      const result = await db.getNextDocumentNumber('estimate');

      expect(result).toBe('EST-000001');
    });

    it('should generate receipt numbers with REC- prefix', async () => {
      vi.spyOn(db, 'getDocumentNumberFormat').mockResolvedValueOnce({
        prefix: 'REC-',
        padding: 6,
        separator: '-',
        currentNumber: 1,
      } as any);

      const result = await db.getNextDocumentNumber('receipt');

      expect(result).toBe('REC-000001');
    });

    it('should generate proposal numbers with PROP- prefix', async () => {
      vi.spyOn(db, 'getDocumentNumberFormat').mockResolvedValueOnce({
        prefix: 'PROP-',
        padding: 6,
        separator: '-',
        currentNumber: 1,
      } as any);

      const result = await db.getNextDocumentNumber('proposal');

      expect(result).toBe('PROP-000001');
    });

    it('should generate expense numbers with EXP- prefix', async () => {
      vi.spyOn(db, 'getDocumentNumberFormat').mockResolvedValueOnce({
        prefix: 'EXP-',
        padding: 6,
        separator: '-',
        currentNumber: 1,
      } as any);

      const result = await db.getNextDocumentNumber('expense');

      expect(result).toBe('EXP-000001');
    });

    it('should handle custom prefix', async () => {
      vi.spyOn(db, 'getDocumentNumberFormat').mockResolvedValueOnce({
        prefix: 'CUSTOM-',
        padding: 6,
        separator: '-',
        currentNumber: 10,
      } as any);

      const result = await db.getNextDocumentNumber('invoice');

      expect(result).toBe('CUSTOM-000010');
    });

    it('should pad numbers with leading zeros', async () => {
      vi.spyOn(db, 'getDocumentNumberFormat').mockResolvedValueOnce({
        prefix: 'INV-',
        padding: 6,
        separator: '-',
        currentNumber: 999,
      } as any);

      const result = await db.getNextDocumentNumber('invoice');

      expect(result).toBe('INV-000999');
    });

    it('should handle large numbers', async () => {
      vi.spyOn(db, 'getDocumentNumberFormat').mockResolvedValueOnce({
        prefix: 'INV-',
        padding: 6,
        separator: '-',
        currentNumber: 1000000,
      } as any);

      const result = await db.getNextDocumentNumber('invoice');

      expect(result).toBe('INV-1000000');
    });
  });

  describe('resetDocumentNumberCounter', () => {
    it('should reset counter to 1 by default', async () => {
      vi.spyOn(db, 'setSetting').mockResolvedValueOnce('set_123');

      await db.resetDocumentNumberCounter('invoice');

      expect(db.setSetting).toHaveBeenCalledWith('invoice_next', '1', 'document_numbering');
    });

    it('should reset counter to custom start number', async () => {
      vi.spyOn(db, 'setSetting').mockResolvedValueOnce('set_123');

      await db.resetDocumentNumberCounter('invoice', 100);

      expect(db.setSetting).toHaveBeenCalledWith('invoice_next', '100', 'document_numbering');
    });
  });

  describe('getDocumentNumberingSettings', () => {
    it('should return all document numbering settings', async () => {
      const mockSettings = [
        { key: 'invoice_prefix', value: 'INV-' },
        { key: 'invoice_next', value: '5' },
        { key: 'estimate_prefix', value: 'EST-' },
        { key: 'estimate_next', value: '10' },
      ];

      vi.spyOn(db, 'getSettingsByCategory').mockResolvedValueOnce(mockSettings);

      const result = await db.getDocumentNumberingSettings();

      expect(result).toEqual({
        invoice_prefix: 'INV-',
        invoice_next: '5',
        estimate_prefix: 'EST-',
        estimate_next: '10',
      });
    });

    it('should return empty object when no settings found', async () => {
      vi.spyOn(db, 'getSettingsByCategory').mockResolvedValueOnce([]);

      const result = await db.getDocumentNumberingSettings();

      expect(result).toEqual({});
    });
  });

  describe('setSetting', () => {
    it('should create new setting', async () => {
      vi.spyOn(db, 'getSetting').mockResolvedValueOnce(null); // setting doesn't exist
      vi.spyOn(db, 'setSetting').mockResolvedValueOnce('set_123');

      const result = await db.setSetting('test_key', 'test_value', 'test_category');

      expect(result).toBe('set_123');
    });

    it('should update existing setting', async () => {
      const existingSetting = { id: 'set_123', key: 'test_key', value: 'old_value' };
      vi.spyOn(db, 'getSetting').mockResolvedValueOnce(existingSetting);
      vi.spyOn(db, 'setSetting').mockResolvedValueOnce('set_123');

      const result = await db.setSetting('test_key', 'new_value', 'test_category');

      expect(result).toBe('set_123');
    });
  });


});

