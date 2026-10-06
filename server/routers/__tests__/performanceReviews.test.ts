import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// mirror portion of router input schemas for validation
const createSchema = z.object({
  employeeId: z.string(),
  reviewerId: z.string(),
  rating: z.number().int().min(1).max(5),
  comments: z.string().optional(),
  goals: z.string().optional(),
  status: z.enum(['pending','in_progress','completed']).optional(),
  reviewDate: z.date().optional(),
});

const updateSchema = z.object({
  id: z.string(),
  rating: z.number().int().min(1).max(5).optional(),
  comments: z.string().optional(),
  goals: z.string().optional(),
  status: z.enum(['pending','in_progress','completed']).optional(),
});

describe('Performance Reviews Router Validation', () => {
  it('accepts valid create input', () => {
    const valid = {
      employeeId: 'emp1',
      reviewerId: 'emp2',
      rating: 4,
      comments: 'Good job',
      goals: 'Improve efficiency',
      status: 'completed',
      reviewDate: new Date(),
    };
    expect(() => createSchema.parse(valid)).not.toThrow();
  });

  it('rejects missing employee or reviewer', () => {
    expect(() => createSchema.parse({ reviewerId: 'emp1', rating: 3 })).toThrow();
    expect(() => createSchema.parse({ employeeId: 'emp1', rating: 3 })).toThrow();
  });

  it('rejects invalid rating values', () => {
    expect(() => createSchema.parse({ employeeId: 'a', reviewerId: 'b', rating: 0 })).toThrow();
    expect(() => createSchema.parse({ employeeId: 'a', reviewerId: 'b', rating: 6 })).toThrow();
  });

  it('accepts reviewDate and different statuses', () => {
    const sample = { employeeId: 'e', reviewerId: 'r', rating: 3, status: 'in_progress', reviewDate: new Date('2025-02-01') };
    expect(() => createSchema.parse(sample)).not.toThrow();
  });

  it('accepts valid update input', () => {
    const valid = { id: 'rev1', rating: 2, status: 'completed' };
    expect(() => updateSchema.parse(valid)).not.toThrow();
  });

  it('rejects update without id', () => {
    expect(() => updateSchema.parse({ rating: 3 })).toThrow();
  });
});