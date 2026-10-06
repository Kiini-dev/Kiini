import { describe, expect, it } from 'vitest';
import { normalizeTagList, buildSupplierPayload } from './procurement-form-utils';

describe('procurement form utils', () => {
  it('normalizes tag lists from comma separated values and arrays', () => {
    expect(normalizeTagList('alpha, beta , gamma')).toEqual(['alpha', 'beta', 'gamma']);
    expect(normalizeTagList(['alpha', ' beta ', '', 'gamma'])).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('builds a supplier payload that supports custom names without an existing ID', () => {
    expect(buildSupplierPayload({ supplierId: '', supplierName: 'Fresh Foods Ltd' })).toEqual({
      supplierId: undefined,
      supplierName: 'Fresh Foods Ltd',
    });

    expect(buildSupplierPayload({ supplierId: 'sup-123', supplierName: 'Legacy Supplier' })).toEqual({
      supplierId: 'sup-123',
      supplierName: 'Legacy Supplier',
    });
  });
});
