import { formatCurrencyAmount } from "../../shared/currency";
type Database = any;

// Supported currencies with their properties
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', rate: 1 },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', rate: 130 },
  EUR: { symbol: '€', name: 'Euro', rate: 0.92 },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.79 },
  ZAR: { symbol: 'R', name: 'South African Rand', rate: 18.5 },
  UGX: { symbol: 'USh', name: 'Ugandan Shilling', rate: 3800 },
  TZS: { symbol: 'TSh', name: 'Tanzanian Shilling', rate: 2600 },
  NGN: { symbol: '₦', name: 'Nigerian Naira', rate: 1500 },
  GHS: { symbol: '₵', name: 'Ghanaian Cedi', rate: 15 },
  EGP: { symbol: 'E£', name: 'Egyptian Pound', rate: 50 },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

export interface ExchangeRate {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  timestamp: Date;
  provider: 'openexchangerates' | 'fixer' | 'manual';
}

export interface CurrencyFormatter {
  format(amount: number, currency: CurrencyCode, locale?: string): string;
  parse(formatted: string, currency: CurrencyCode): number;
  convert(amount: number, from: CurrencyCode, to: CurrencyCode, rate?: number): Promise<number>;
}

/**
 * CurrencyService - Handles multi-currency operations
 * Provides exchange rate management, currency conversion, and locale-aware formatting
 */
export class CurrencyService {
  private db: Database;
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private cacheExpiry: number = 1000 * 60 * 60; // 1 hour

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies() {
    return Object.entries(SUPPORTED_CURRENCIES).map(([code, details]) => ({
      code: code as CurrencyCode,
      symbol: details.symbol,
      name: details.name,
      rate: details.rate,
    }));
  }

  /**
   * Get organization's base currency
   */
  async getOrganizationCurrency(organizationId: string): Promise<CurrencyCode> {
    // TODO: Query organization settings from database
    // For now, return default based on organization's country
    return 'KES' as CurrencyCode;
  }

  /**
   * Set organization's base currency
   */
  async setOrganizationCurrency(
    organizationId: string,
    currency: CurrencyCode
  ): Promise<void> {
    // TODO: Update organization settings in database
    console.log(`Set currency for org ${organizationId} to ${currency}`);
  }

  /**
   * Get exchange rate between two currencies
   * With automatic cache and expiry management
   */
  async getExchangeRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
    if (from === to) return 1;

    const cacheKey = `${from}:${to}`;
    const cached = this.exchangeRates.get(cacheKey);

    if (cached && Date.now() - cached.timestamp.getTime() < this.cacheExpiry) {
      return cached.rate;
    }

    // Fetch from external API (implement with real exchange rate service)
    const rate = await this.fetchExchangeRate(from, to);

    this.exchangeRates.set(cacheKey, {
      fromCurrency: from,
      toCurrency: to,
      rate,
      timestamp: new Date(),
      provider: 'openexchangerates',
    });

    return rate;
  }

  /**
   * Fetch real exchange rate from API
   * Implement with actual service like Open Exchange Rates or Fixer.io
   */
  private async fetchExchangeRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
    try {
      const apiKey = process.env.EXCHANGE_RATE_API_KEY;
      if (!apiKey) {
        console.warn('Exchange rate API key not configured, using fallback rates');
        return this.getFallbackRate(from, to);
      }

      // Example: Open Exchange Rates API
      const response = await fetch(
        `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=${from}&symbols=${to}`
      );

      if (!response.ok) {
        return this.getFallbackRate(from, to);
      }

      const data = (await response.json()) as { rates: Record<string, number> };
      return data.rates[to] || this.getFallbackRate(from, to);
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      return this.getFallbackRate(from, to);
    }
  }

  /**
   * Get fallback rate from static configuration
   */
  private getFallbackRate(from: CurrencyCode, to: CurrencyCode): number {
    const fromRate = SUPPORTED_CURRENCIES[from]?.rate || 1;
    const toRate = SUPPORTED_CURRENCIES[to]?.rate || 1;
    return toRate / fromRate;
  }

  /**
   * Convert amount between currencies
   */
  async convert(amount: number, from: CurrencyCode, to: CurrencyCode): Promise<number> {
    const rate = await this.getExchangeRate(from, to);
    return Math.round(amount * rate * 100) / 100;
  }

  /**
   * Format amount as currency string
   */
  formatCurrency(
    amount: number,
    currency: CurrencyCode,
    locale: string = 'en-US'
  ): string {
    return formatCurrencyAmount(amount, currency, {
      locale,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Parse formatted currency string to number
   */
  parseCurrency(formatted: string, currency: CurrencyCode): number {
    const curr = SUPPORTED_CURRENCIES[currency];
    if (!curr) throw new Error(`Unsupported currency: ${currency}`);

    // Remove currency symbol and whitespace
    const cleaned = formatted
      .replace(new RegExp(`\\${curr.symbol}`, 'g'), '')
      .replace(/\s/g, '')
      .trim();

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Get currency display name
   */
  getCurrencyName(currency: CurrencyCode): string {
    return SUPPORTED_CURRENCIES[currency]?.name || currency;
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency: CurrencyCode): string {
    return SUPPORTED_CURRENCIES[currency]?.symbol || currency;
  }

  /**
   * Clear exchange rate cache
   */
  clearCache(): void {
    this.exchangeRates.clear();
  }
}

/**
 * Create formatter instance for a specific locale and currency
 */
export const createCurrencyFormatter = (
  currencyService: CurrencyService
): CurrencyFormatter => {
  return {
    format(amount: number, currency: CurrencyCode, locale: string = 'en-US'): string {
      return currencyService.formatCurrency(amount, currency, locale);
    },

    parse(formatted: string, currency: CurrencyCode): number {
      return currencyService.parseCurrency(formatted, currency);
    },

    async convert(
      amount: number,
      from: CurrencyCode,
      to: CurrencyCode,
      rate?: number
    ): Promise<number> {
      if (rate !== undefined) {
        return Math.round(amount * rate * 100) / 100;
      }
      return currencyService.convert(amount, from, to);
    },
  };
};

// Export singleton instance
export const getCurrencyService = (db: Database) => new CurrencyService(db);