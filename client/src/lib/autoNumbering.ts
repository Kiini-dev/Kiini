/**
 * Auto-Numbering Utility
 * 
 * Provides functions to generate auto-numbered document identifiers
 * for invoices, estimates, receipts, expenses, etc.
 */

interface AutoNumberConfig {
  prefix: string;
  padLength?: number;
  separatorChar?: string;
  includeYear?: boolean;
  includeMonth?: boolean;
}

/**
 * Generate auto-numbered identifier
 * 
 * @example
 * // Simple: "INV-000001"
 * generateAutoNumber({ prefix: "INV" }, 1)
 * 
 * // With year: "INV-2026-000001"
 * generateAutoNumber({ prefix: "INV", includeYear: true }, 1)
 * 
 * // With year/month: "INV-202603-000001"
 * generateAutoNumber({ prefix: "INV", includeYear: true, includeMonth: true }, 1)
 */
export function generateAutoNumber(config: AutoNumberConfig, sequenceNumber: number): string {
  const {
    prefix,
    padLength = 6,
    separatorChar = "-",
    includeYear = false,
    includeMonth = false,
  } = config;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  let number = prefix;

  if (includeYear) {
    number += separatorChar + year;
  }

  if (includeMonth) {
    if (!includeYear) {
      number += separatorChar + (year.toString().slice(-2) + month);
    } else {
      number += separatorChar + month;
    }
  }

  // Pad the sequence number
  const paddedSequence = String(sequenceNumber).padStart(padLength, "0");
  number += separatorChar + paddedSequence;

  return number;
}

/**
 * Get next number in sequence
 * Useful for getting the next invoice/receipt number
 */
export function getNextSequenceNumber(lastNumber: string, config: AutoNumberConfig): number {
  if (!lastNumber) return 1;

  // Extract the numeric part from the end
  const match = lastNumber.match(/(\d+)$/);
  if (match) {
    return parseInt(match[1]) + 1;
  }

  return 1;
}

/**
 * Configuration presets for common document types
 */
export const AUTO_NUMBER_PRESETS = {
  // Accounting
  invoice: {
    prefix: "INV",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,
  
  receipt: {
    prefix: "RCP",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,

  estimate: {
    prefix: "EST",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,

  creditNote: {
    prefix: "CN",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,

  debitNote: {
    prefix: "DN",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,

  expenseClaim: {
    prefix: "EXP",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,

  serviceInvoice: {
    prefix: "SRV",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,

  // HR
  ticket: {
    prefix: "TKT",
    padLength: 6,
    separatorChar: "-",
    includeYear: false,
    includeMonth: false,
  } as AutoNumberConfig,

  payroll: {
    prefix: "PAY",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,

  // Projects
  project: {
    prefix: "PRJ",
    padLength: 5,
    separatorChar: "-",
    includeYear: false,
    includeMonth: false,
  } as AutoNumberConfig,

  workOrder: {
    prefix: "WO",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: false,
  } as AutoNumberConfig,

  // Procurement
  purchaseOrder: {
    prefix: "PO",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,

  // Opportunities
  opportunity: {
    prefix: "OPP",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: false,
  } as AutoNumberConfig,

  // Communication/Lifecycle
  quote: {
    prefix: "QT",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,

  proposal: {
    prefix: "PROP",
    padLength: 5,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,

  // Banking
  reconciliationBatch: {
    prefix: "REC",
    padLength: 6,
    separatorChar: "-",
    includeYear: true,
    includeMonth: true,
  } as AutoNumberConfig,
} as const;

import { toMajorCurrencyAmount, toMinorCurrencyAmount } from "../../../shared/currency";

/**
 * Format a number for database storage (multiply by 100 for cents)
 */
export function formatAmountForStorage(amount: number): number {
  return toMinorCurrencyAmount(amount);
}

/**
 * Format a number from database storage (divide by 100)
 */
export function formatAmountFromStorage(amount: number): number {
  return Math.round(toMajorCurrencyAmount(amount, "minor") * 100) / 100;
}

/**
 * Hook to generate auto-numbered identifiers for documents
 * Usage in React components:
 * 
 * const invoiceNumber = useAutoNumber("invoice", 1);
 * // Returns: "INV-2026-03-000001"
 */
export function formatDocumentNumber(type: keyof typeof AUTO_NUMBER_PRESETS, sequence: number): string {
  const config = AUTO_NUMBER_PRESETS[type];
  if (!config) {
    console.warn(`Unknown document type: ${type}`);
    return `${sequence}`;
  }
  return generateAutoNumber(config, sequence);
}
