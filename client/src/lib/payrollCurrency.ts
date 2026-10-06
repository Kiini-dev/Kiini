export function payrollCentsToCurrency(value: unknown): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount / 100 : 0;
}
