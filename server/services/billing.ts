const US_SALES_TAX_RATES: Record<string, number> = {
  CA: 0.08625,
  TX: 0.0825,
};

export function calculateTrialEndDate(startDate: Date, trialDays: number): Date {
  const result = new Date(startDate);
  result.setDate(result.getDate() + trialDays);
  return result;
}

export function calculateNextBillingDate(currentDate: Date, billingCycleMonths: number): Date {
  const result = new Date(currentDate);
  const originalDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + billingCycleMonths);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(originalDay, lastDay));
  return result;
}

export function calculateTaxAmount(amount: number, stateOrCountry: string, country = "US"): number {
  if (country !== "US") return 0;
  return amount * (US_SALES_TAX_RATES[stateOrCountry.toUpperCase()] || 0);
}
