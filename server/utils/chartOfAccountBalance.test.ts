import { describe, expect, it, vi } from "vitest";
import { adjustChartOfAccountBalance, getChartOfAccountBalanceDelta, reconcileChartOfAccountBalance } from "./chartOfAccountBalance";
import { getAccountBalanceSide, getAccountNormalSide, getNormalBalanceAmount } from "../../shared/accountingBalance";

describe("chart of account balance direction", () => {
  it("increases balances for debits and decreases them for credits", () => {
    expect(getChartOfAccountBalanceDelta(25000, "debit")).toBe(25000);
    expect(getChartOfAccountBalanceDelta(25000, "credit")).toBe(-25000);
  });

  it("interprets signed balances according to each account's normal side", () => {
    expect(getAccountNormalSide("expense")).toBe("debit");
    expect(getAccountNormalSide("revenue")).toBe("credit");
    expect(getNormalBalanceAmount(25000, "expense")).toBe(25000);
    expect(getNormalBalanceAmount(-25000, "revenue")).toBe(25000);
    expect(getAccountBalanceSide(25000, "expense")).toBe("debit");
    expect(getAccountBalanceSide(-25000, "revenue")).toBe("credit");
    expect(getAccountBalanceSide(-25000, "expense")).toBe("credit");
    expect(getAccountBalanceSide(25000, "revenue")).toBe("debit");
  });

  it("allows deletion flows to skip a missing account without attempting an update", async () => {
    const update = vi.fn();
    const limit = vi.fn().mockResolvedValue([]);
    const where = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where });
    const database = {
      select: vi.fn().mockReturnValue({ from }),
      update,
    };

    const updated = await adjustChartOfAccountBalance(database, "missing-account", -2500, "org-1", {
      allowMissingAccount: true,
    });

    expect(updated).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it("continues to reject missing accounts for normal balance updates", async () => {
    const limit = vi.fn().mockResolvedValue([]);
    const where = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where });
    const database = { select: vi.fn().mockReturnValue({ from }) };

    await expect(adjustChartOfAccountBalance(database, "missing-account", 2500, "org-1"))
      .rejects.toThrow("Chart of Accounts entry not found");
  });

  it("ignores stale COA references when reconciling an expense move", async () => {
    const set = vi.fn().mockReturnThis();
    const where = vi.fn().mockResolvedValue(undefined);
    const update = vi.fn().mockReturnValue({ set, where });
    const results = [[], [{ id: "valid-account" }]];
    const database = {
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockImplementation(() => ({
          where: vi.fn().mockImplementation(() => ({
            limit: vi.fn().mockImplementation(() => Promise.resolve(results.shift() ?? [])),
          })),
        })),
      })),
      update,
    };

    await expect(reconcileChartOfAccountBalance(
      database,
      "missing-account",
      2500,
      "debit",
      "valid-account",
      3000,
      "debit",
      "org-1",
    )).resolves.toBeUndefined();

    expect(update).toHaveBeenCalled();
  });
});