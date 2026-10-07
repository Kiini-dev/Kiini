import { toMajorCurrencyAmount } from "../../../shared/currency";

export function payrollCentsToCurrency(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string" && value !== null && value !== undefined) {
    return 0;
  }
  return toMajorCurrencyAmount(value, "minor");
}
