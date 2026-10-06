import { and, eq, isNull, sql } from "drizzle-orm";
import { accounts } from "../../drizzle/schema";
import { getAccountNormalSide } from "../../shared/accountingBalance";

export type ChartOfAccountSide = "debit" | "credit";

export function getChartOfAccountBalanceDelta(amount: number, side: ChartOfAccountSide = "debit"): number {
  return side === "credit" ? -amount : amount;
}

export async function getChartOfAccountNormalSide(
  database: any,
  accountId: string | null | undefined,
  organizationId?: string | null,
): Promise<ChartOfAccountSide> {
  if (!accountId) return "debit";
  const accountWhere = organizationId
    ? and(eq(accounts.id, accountId), eq(accounts.organizationId, organizationId))
    : and(eq(accounts.id, accountId), isNull(accounts.organizationId));
  const [account] = await database
    .select({ accountType: accounts.accountType })
    .from(accounts)
    .where(accountWhere)
    .limit(1);
  if (!account) throw new Error("Chart of Accounts entry not found");
  return getAccountNormalSide(account.accountType);
}

export async function adjustChartOfAccountBalance(
  database: any,
  accountId: string | null | undefined,
  delta: number,
  organizationId?: string | null,
  options: { allowMissingAccount?: boolean } = {},
): Promise<boolean> {
  if (!accountId || delta === 0) return false;

  const accountWhere = organizationId
    ? and(eq(accounts.id, accountId), eq(accounts.organizationId, organizationId))
    : eq(accounts.id, accountId);
  const existing = await database.select({ id: accounts.id }).from(accounts).where(accountWhere).limit(1);
  if (!existing.length) {
    if (options.allowMissingAccount) return false;
    throw new Error("Chart of Accounts entry not found");
  }

  await database.update(accounts).set({
    balance: sql`COALESCE(${accounts.balance}, 0) + ${delta}`,
    updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
  }).where(eq(accounts.id, accountId));
  return true;
}

export async function reconcileChartOfAccountBalance(
  database: any,
  previousAccountId: string | null | undefined,
  previousAmount: number,
  previousSide: ChartOfAccountSide,
  nextAccountId: string | null | undefined,
  nextAmount: number,
  nextSide: ChartOfAccountSide,
  organizationId?: string | null,
): Promise<void> {
  const previousDelta = previousAccountId ? getChartOfAccountBalanceDelta(previousAmount, previousSide) : 0;
  const nextDelta = nextAccountId ? getChartOfAccountBalanceDelta(nextAmount, nextSide) : 0;

  if (previousAccountId && previousAccountId === nextAccountId) {
    const netDelta = nextDelta - previousDelta;
    if (netDelta !== 0) {
      await adjustChartOfAccountBalance(database, previousAccountId, netDelta, organizationId, { allowMissingAccount: true });
    }
    return;
  }

  if (previousAccountId) {
    await adjustChartOfAccountBalance(database, previousAccountId, -previousDelta, organizationId, { allowMissingAccount: true });
  }
  if (nextAccountId) {
    await adjustChartOfAccountBalance(database, nextAccountId, nextDelta, organizationId, { allowMissingAccount: true });
  }
}