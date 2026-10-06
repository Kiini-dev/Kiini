import { trpc } from "./trpc";

const RATE_FROM_KES: Record<string, number> = {
  KES: 1,
  USD: 1 / 128,
  EUR: 1 / 140,
  GBP: 1 / 163,
  UGX: 4.7,
  TZS: 3.3,
};

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
  ) => formatAmount(amount * (RATE_FROM_KES[code] ?? 1), symbol, position, opts);

  return { code, symbol, position, formatAmount: formatAmountLocal };
}

/**
 * Format a number as currency using the given symbol/position.
 * Defaults to KES if no settings provided.
 */
export function normalizeCurrencyAmount(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
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
  const amount = normalizeCurrencyAmount(value);
  const formatted = amount.toLocaleString("en-KE", {
    minimumFractionDigits: opts?.minimumFractionDigits ?? 0,
    maximumFractionDigits: opts?.maximumFractionDigits ?? 2,
  });
  const position = opts?.position ?? "before";
  return position === "before" ? `${currencyCode} ${formatted}` : `${formatted} ${currencyCode}`;
}

export function formatAmount(
  amount: number,
  symbol: string = "KES",
  position: "before" | "after" = "before",
  opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  return formatDisplayCurrency(amount, symbol, {
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
