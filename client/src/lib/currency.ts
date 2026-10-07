import { trpc } from "./trpc";
import {
  formatCurrencyAmount,
  formatMinorCurrencyAmount,
  normalizeCurrencyAmount as normalizeAmountValue,
} from "../../../shared/currency";

/**
 * Hook to get the user-configured currency from Settings → Currency.
 * Returns { code, symbol, position } with defaults.
 */
export function useCurrencySettings() {
  const { data } = trpc.settings.getByCategory.useQuery(
    { category: "currency" },
    { staleTime: 0, refetchOnWindowFocus: true }
  );

  const code = data?.defaultCurrency || "KES";
  const symbol = data?.currencySymbol || code;
  const position = (data?.symbolPosition as "before" | "after") || "before";

  const formatAmountLocal = (
    amount: number,
    opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
  ) => formatCurrencyAmount(amount, code, { ...opts, symbol, position });
  const formatMinorAmountLocal = (
    amount: number,
    opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
  ) => formatMinorCurrencyAmount(amount, code, { ...opts, symbol, position });

  return {
    code,
    symbol,
    position,
    formatAmount: formatAmountLocal,
    formatMinorAmount: formatMinorAmountLocal,
  };
}

/**
 * Format a number as currency using the given symbol/position.
 * Defaults to KES if no settings provided.
 */
export function normalizeCurrencyAmount(value: number | string | null | undefined): number {
  return normalizeAmountValue(value);
}

export function formatDisplayCurrency(
  value: number | string | null | undefined,
  currencyCode: string = "KES",
  opts?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    position?: "before" | "after";
  }
): string {
  return formatCurrencyAmount(value, currencyCode, opts);
}

export function formatAmount(
  amount: number,
  symbol: string = "KES",
  position: "before" | "after" = "before",
  opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const code = /^[A-Z]{3}$/.test(symbol) ? symbol : "KES";
  return formatCurrencyAmount(amount, code, {
    symbol,
    minimumFractionDigits: opts?.minimumFractionDigits,
    maximumFractionDigits: opts?.maximumFractionDigits,
    position,
  });
}

export function useCurrency() {
  const settings = useCurrencySettings();

  return {
    currency: {
      code: settings.code,
      symbol: settings.symbol,
      name: settings.code,
      rateFromKes: 1,
    },
    setCurrency: (_code: string) => undefined,
    fmt: (amount: number) => settings.formatAmount(amount),
    format: (amount: number) => settings.formatAmount(amount),
  };
}
