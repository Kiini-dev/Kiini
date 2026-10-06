import { describe, it, expect } from 'vitest';
import { z } from 'zod';

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