export type AccountingSide = "debit" | "credit";

const creditNormalAccountTypes = new Set(["liability", "equity", "revenue", "other income"]);

export function getAccountNormalSide(accountType: string): AccountingSide {
  return creditNormalAccountTypes.has(accountType.toLowerCase()) ? "credit" : "debit";
}

export function getAccountBalanceSide(balance: number, accountType: string): AccountingSide {
  const normalSide = getAccountNormalSide(accountType);
  const normalBalance = normalSide === "credit" ? -balance : balance;
  if (normalBalance >= 0) return normalSide;
  return normalSide === "debit" ? "credit" : "debit";
}

export function getNormalBalanceAmount(balance: number, accountType: string): number {
  return getAccountNormalSide(accountType) === "credit" ? -balance : balance;
}
