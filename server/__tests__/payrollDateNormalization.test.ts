import { describe, expect, it } from 'vitest';
import { normalizeDateValue } from '../routers/payroll';

describe('payroll date normalization', () => {
  it('converts Date instances to MySQL datetime strings', () => {
    const value = new Date('2024-06-20T10:30:00Z');
    expect(normalizeDateValue(value)).toBe('2024-06-20 10:30:00');
  });

  it('converts ISO strings to MySQL datetime strings', () => {
    expect(normalizeDateValue('2024-06-20T10:30:00Z')).toBe('2024-06-20 10:30:00');
  });

  it('returns a safe current timestamp when the value is not a valid date', () => {
    expect(normalizeDateValue({})).toEqual(expect.any(String));
    expect(normalizeDateValue(null)).toEqual(expect.any(String));
  });
});
