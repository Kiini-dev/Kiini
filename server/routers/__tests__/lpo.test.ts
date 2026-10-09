import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { generateAvailableLPONumber } from '../procurementLpo';

const createSchema = z.object({
  vendorId: z.string(),
  description: z.string().optional(),
  amount: z.number().positive(),
});
const updateSchema = z.object({
  id: z.string(),
  status: z.enum(["draft","submitted","approved","rejected","received"]).optional(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
});

describe('LPO Router Validation', () => {
  it('accepts valid create', () => {
    const v = { vendorId: 'v1', amount: 10000 };
    expect(() => createSchema.parse(v)).not.toThrow();
  });

  describe('LPO number allocation', () => {
    it('skips a number that already exists and checks only the LPO id', async () => {
      const limit = vi.fn()
        .mockResolvedValueOnce([{ id: 'existing-lpo' }])
        .mockResolvedValueOnce([]);
      const where = vi.fn(() => ({ limit }));
      const from = vi.fn(() => ({ where }));
      const select = vi.fn(() => ({ from }));
      const database = { select };
      const generateNumber = vi.fn()
        .mockResolvedValueOnce('DOC-000001')
        .mockResolvedValueOnce('DOC-000002');

      await expect(generateAvailableLPONumber(database, generateNumber))
        .resolves.toBe('DOC-000002');
      expect(select).toHaveBeenCalledWith(expect.objectContaining({ id: expect.anything() }));
      expect(generateNumber).toHaveBeenCalledTimes(2);
    });
  });
  it('rejects no vendor', () => {
    expect(() => createSchema.parse({ amount: 1000 })).toThrow();
  });
  it('accepts valid update', () => {
    expect(() => updateSchema.parse({ id: 'l1', status: 'submitted' })).not.toThrow();
  });
  it('allows approving via status field', () => {
    expect(() => updateSchema.parse({ id: 'l1', status: 'approved' })).not.toThrow();
  });
  it('rejects update without id', () => {
    expect(() => updateSchema.parse({ status: 'approved' })).toThrow();
  });
});