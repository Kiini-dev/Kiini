import { describe, it, expect } from 'vitest';
import { resolveClientDisplayName, buildReceiptFromInvoicePayload } from '../db';

describe('receipt payment helpers', () => {
  it('prefers the contact person when building a display name', () => {
    const client = {
      companyName: 'Acme Labs',
      contactPerson: 'Jane Doe',
      name: 'Acme Corp',
    };

    expect(resolveClientDisplayName(client as any)).toBe('Jane Doe');
  });

  it('builds a receipt payload from invoice values without losing cents', () => {
    const payload = buildReceiptFromInvoicePayload(
      {
        id: 'inv_1',
        invoiceNumber: 'INV-1001',
        clientId: 'cli_1',
        organizationId: 'org_1',
        createdBy: 'user_1',
        subtotal: 100000,
        taxAmount: 15000,
        discountAmount: 5000,
        total: 125000,
        notes: 'Invoice notes',
        issueDate: '2025-01-10T00:00:00.000Z',
      } as any,
      'pay_1',
      [
        { description: 'Consulting', quantity: 1, unitPrice: 80000, total: 80000, taxRate: 0 },
        { description: 'Setup', quantity: 1, unitPrice: 45000, total: 45000, taxRate: 0 },
      ]
    );

    expect(payload.clientId).toBe('cli_1');
    expect(payload.paymentId).toBe('pay_1');
    expect(payload.amount).toBe(125000);
    expect(payload.subtotal).toBe(100000);
    expect(payload.taxAmount).toBe(15000);
    expect(payload.discountAmount).toBe(5000);
    expect(payload.lineItems).toHaveLength(2);
    expect(payload.lineItems[0].description).toBe('Consulting');
  });
});
