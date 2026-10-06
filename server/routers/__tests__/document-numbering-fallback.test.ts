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
});
