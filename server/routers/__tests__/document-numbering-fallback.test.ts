import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../db', () => ({
  getNextDocumentNumberWithFormat: vi.fn(),
}));

import { generateNextDocumentNumber } from '../../utils/document-numbering';
import { getNextDocumentNumberWithFormat } from '../../db';

describe('document-numbering fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('falls back to the robust document-number formatter when legacy allocation fails', async () => {
    const fallback = vi.mocked(getNextDocumentNumberWithFormat);
    fallback.mockResolvedValue('CN-000001');

    const db = {
      transaction: vi.fn().mockRejectedValue(new Error('ER_TRUNCATED_WRONG_VALUE_FOR_FIELD')),
    };

    await expect(generateNextDocumentNumber(db as any, 'credit_note')).resolves.toBe('CN-000001');
    expect(fallback).toHaveBeenCalledWith('credit_note');
  });

  it('allocates the first GRN number using the document-type prefix', async () => {
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const db = {
      transaction: vi.fn(async (work: (tx: any) => Promise<unknown>) => work({
        execute: vi.fn().mockResolvedValue([[]]),
        insert: vi.fn(() => ({ values: insertValues })),
      })),
    };

    await expect(generateNextDocumentNumber(db as any, 'grn')).resolves.toBe('GRN-000001');
    expect(insertValues).toHaveBeenCalledWith(expect.objectContaining({
      documentType: 'grn',
      prefix: 'GRN',
      currentNumber: 2,
    }));
  });

  it('uses and increments the stored work-order counter', async () => {
    const set = vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) }));
    const db = {
      transaction: vi.fn(async (work: (tx: any) => Promise<unknown>) => work({
        execute: vi.fn().mockResolvedValue([[{
          prefix: 'WO',
          padding: 5,
          separator: '/',
          currentNumber: 23,
        }]]),
        update: vi.fn(() => ({ set })),
      })),
    };

    await expect(generateNextDocumentNumber(db as any, 'work_order')).resolves.toBe('WO/00023');
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ currentNumber: 24 }));
  });
});
