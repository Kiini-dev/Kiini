export type CurrencyAmountUnit = "major" | "minor";

export interface CurrencyFormatOptions {
  unit?: CurrencyAmountUnit;
  locale?: string;
  symbol?: string;
  position?: "before" | "after";
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/** Legacy Kiini monetary columns store hundredths of the currency unit. */
export const LEGACY_MINOR_UNITS_PER_MAJOR = 100;

export function normalizeCurrencyAmount(value: number | string | null | undefined): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export function toMajorCurrencyAmount(
  value: number | string | null | undefined,
  unit: CurrencyAmountUnit = "major"
): number {
  const amount = normalizeCurrencyAmount(value);
  return unit === "minor" ? amount / LEGACY_MINOR_UNITS_PER_MAJOR : amount;
}

/** Convert a major-unit input to the legacy hundredths representation. */
export function toMinorCurrencyAmount(value: number | string | null | undefined): number {
  return Math.round(normalizeCurrencyAmount(value) * LEGACY_MINOR_UNITS_PER_MAJOR);
}

export function formatCurrencyAmount(
  value: number | string | null | undefined,
  currencyCode = "KES",
  options: CurrencyFormatOptions = {}
): string {
  const {
    unit = "major",
    locale = "en-KE",
    symbol = currencyCode,
    position = "before",
  } = options;
  const amount = toMajorCurrencyAmount(value, unit);
  const defaults = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).resolvedOptions();
  if (options.symbol === undefined && options.position === undefined) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: options.minimumFractionDigits ?? defaults.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits ?? defaults.maximumFractionDigits,
    }).format(amount);
  }
  const maximumFractionDigits = options.maximumFractionDigits ?? Math.max(2, defaults.maximumFractionDigits);
  const minimumFractionDigits = options.minimumFractionDigits ?? 0;
  const numeric = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  return position === "before" ? `${symbol} ${numeric}` : `${numeric} ${symbol}`;
}

export function formatMinorCurrencyAmount(
  value: number | string | null | undefined,
  currencyCode = "KES",
  options: Omit<CurrencyFormatOptions, "unit"> = {}
): string {
  return formatCurrencyAmount(value, currencyCode, { ...options, unit: "minor" });
}
