import { describe, it, expect } from 'vitest';
import { generateCSVTemplate } from '../../server/utils/csvGenerator';

describe('CSV template generation', () => {
  it('uses schema-aligned column names for client imports', () => {
    const template = generateCSVTemplate('clients');

    expect(template).toContain('organizationId');
    expect(template).toContain('companyName');
    expect(template).toContain('secondaryPhone');
    expect(template).toContain('creditLimit');
    expect(template).not.toContain('secondary_phone');
  });

  it('uses schema-aligned column names for product imports', () => {
    const template = generateCSVTemplate('products');

    expect(template).toContain('organizationId');
    expect(template).toContain('unitPrice');
    expect(template).toContain('stockQuantity');
    expect(template).toContain('isActive');
    expect(template).not.toContain('productName');
    expect(template).not.toContain('unit_price');
  });
});
