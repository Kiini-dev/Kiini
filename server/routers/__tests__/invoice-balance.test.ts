import { describe, expect, it } from 'vitest';
import { isCarryForwardBalanceInvoice } from '../invoices';

describe('balance carry-forward invoices', () => {
  it('excludes carry-forward balance invoices from total invoiced calculations', () => {
    const invoices = [
      { id: 'inv-1', total: 40000, paidAmount: 15000, title: 'Initial invoice', notes: 'Initial billing', status: 'partial' },
      { id: 'inv-2', total: 25000, paidAmount: 0, title: 'Balance for INV-0001', notes: 'Remaining balance carried forward from invoice INV-0001.', status: 'sent' },
    ];

    expect(isCarryForwardBalanceInvoice(invoices[1])).toBe(true);
    expect(invoices
      .filter((inv) => !isCarryForwardBalanceInvoice(inv))
      .reduce((sum, inv) => sum + (inv.total || 0), 0)).toBe(40000);
    expect(invoices
      .filter((inv) => !isCarryForwardBalanceInvoice(inv))
      .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0)).toBe(15000);
  });
});
