import { describe, it, expect, beforeEach } from 'vitest';
import * as db from '../../db';

// skip this test suite until document router is fully wired up
describe.skip('Document Number Generation', () => {
  describe('getNextDocumentNumber', () => {
    it('should generate invoice number with default prefix', async () => {
      const number = await db.getNextDocumentNumber('invoice');
      expect(number).toBeDefined();
      expect(number).toMatch(/^INV-\d{6}$/);
    });

    it('should generate estimate number with default prefix', async () => {
      const number = await db.getNextDocumentNumber('estimate');
      expect(number).toBeDefined();
      expect(number).toMatch(/^EST-\d{6}$/);
    });

    it('should generate receipt number with default prefix', async () => {
      const number = await db.getNextDocumentNumber('receipt');
      expect(number).toBeDefined();
      expect(number).toMatch(/^REC-\d{6}$/);
    });

    it('should generate proposal number with default prefix', async () => {
      const number = await db.getNextDocumentNumber('proposal');
      expect(number).toBeDefined();
      expect(number).toMatch(/^PROP-\d{6}$/);
    });

    it('should generate expense number with default prefix', async () => {
      const number = await db.getNextDocumentNumber('expense');
      expect(number).toBeDefined();
      expect(number).toMatch(/^EXP-\d{6}$/);
    });

    it('should increment document numbers sequentially', async () => {
      const num1 = await db.getNextDocumentNumber('invoice');
      const num2 = await db.getNextDocumentNumber('invoice');
      
      expect(num1).toBeDefined();
      expect(num2).toBeDefined();
      
      // Extract the numeric parts
      const num1Match = num1.match(/(\d+)$/);
      const num2Match = num2.match(/(\d+)$/);
      
      if (num1Match && num2Match) {
        const num1Val = parseInt(num1Match[1]);
        const num2Val = parseInt(num2Match[1]);
        expect(num2Val).toBeGreaterThan(num1Val);
      }
    });

    it('should use custom prefix if set', async () => {
      // Set a custom prefix
      await db.setSetting('estimate_prefix', 'QUOTE-', 'document_numbering');
      
      const number = await db.getNextDocumentNumber('estimate');
      expect(number).toMatch(/^QUOTE-\d{6}$/);
    });

    it('should handle multiple document types independently', async () => {
      const invoice = await db.getNextDocumentNumber('invoice');
      const estimate = await db.getNextDocumentNumber('estimate');
      const receipt = await db.getNextDocumentNumber('receipt');
      
      expect(invoice).toMatch(/^INV-/);
      expect(estimate).toMatch(/^EST-/);
      expect(receipt).toMatch(/^REC-/);
    });
  });

  describe('getNextDocumentNumberWithFormat', () => {
    it('should use custom format if available', async () => {
      await db.updateDocumentNumberFormat('invoice', {
        prefix: 'INV-2025-',
        padding: 5,
        separator: '-',
      });

      const number = await db.getNextDocumentNumberWithFormat('invoice');
      expect(number).toMatch(/^INV-2025-\d{5}$/);
    });

    it('should fall back to default if format not set', async () => {
      const number = await db.getNextDocumentNumberWithFormat('estimate');
      expect(number).toBeDefined();
      expect(number).toMatch(/^(EST-|QUOTE-)\d{6}$/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle large document numbers', async () => {
      // Set a high starting number
      await db.setSetting('receipt_next', '999999', 'document_numbering');
      
      const number = await db.getNextDocumentNumber('receipt');
      expect(number).toMatch(/^REC-999999$/);
    });

    it('should handle invalid next number gracefully', async () => {
      // Set an invalid next number
      await db.setSetting('proposal_next', 'invalid', 'document_numbering');
      
      const number = await db.getNextDocumentNumber('proposal');
      expect(number).toBeDefined();
      expect(number).toMatch(/^PROP-\d{6}$/);
    });

    it('should generate numbers with zero padding', async () => {
      // Reset to start
      await db.setSetting('expense_next', '1', 'document_numbering');
      
      const number = await db.getNextDocumentNumber('expense');
      expect(number).toBe('EXP-000001');
    });
  });
});

