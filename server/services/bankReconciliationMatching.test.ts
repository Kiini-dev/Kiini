import { describe, expect, it } from "vitest";
import {
  matchesRule,
  scoreReconciliationCandidates,
  validateReconciliationAllocations,
} from "./bankReconciliationMatching";

describe("bank reconciliation matching", () => {
  const bankTransaction = {
    amount: -125_000,
    date: "2026-10-04",
    description: "ACME OFFICE SUPPLIES INV-204",
    referenceNumber: "INV-204",
  };

  it("scores matching-direction, exact-amount candidates by reference and date", () => {
    const suggestions = scoreReconciliationCandidates(bankTransaction, [
      {
        id: "wrong-direction",
        sourceType: "payment",
        amount: 125_000,
        direction: "credit",
        date: "2026-10-04",
        description: "ACME OFFICE SUPPLIES",
      },
      {
        id: "exact-reference",
        sourceType: "expense",
        amount: 125_000,
        direction: "debit",
        date: "2026-10-03",
        description: "Office supplies",
        referenceNumber: "INV-204",
      },
      {
        id: "too-old",
        sourceType: "expense",
        amount: 125_000,
        direction: "debit",
        date: "2026-09-30",
        description: "ACME OFFICE SUPPLIES INV-204",
      },
    ]);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]).toMatchObject({ id: "exact-reference", confidenceScore: 1, matchMethod: "exact", requiresReview: false });
  });

  it("uses configured matching and review rules without silently confirming fuzzy matches", () => {
    const suggestions = scoreReconciliationCandidates(bankTransaction, [{
      id: "expense",
      sourceType: "expense",
      amount: 125_000,
      direction: "debit",
      date: "2026-10-04",
      description: "ACME OFFICE SUPPLIES",
      accountId: "bank-account",
    }], [{
      name: "ACME supplier",
      targetField: "description",
      operator: "contains",
      valueToMatch: "acme",
      action: "auto_match_category",
      targetEntityId: "bank-account",
    }, {
      targetField: "description",
      operator: "contains",
      valueToMatch: "supplies",
      action: "flag_for_review",
    }]);
    expect(suggestions[0]).toMatchObject({
      matchMethod: "rule_based",
      matchedRuleName: "ACME supplier",
      requiresReview: true,
    });
    expect(matchesRule({
      targetField: "description",
      operator: "starts_with",
      valueToMatch: "ACME",
      action: "flag_for_review",
    }, bankTransaction)).toBe(true);
  });

  it("requires batch allocations to equal the bank amount exactly", () => {
    expect(() => validateReconciliationAllocations(-10_000, [{ amount: 4_000 }, { amount: 6_000 }])).not.toThrow();
    expect(() => validateReconciliationAllocations(-10_000, [{ amount: 4_000 }, { amount: 5_999 }])).toThrow(/add up exactly/);
    expect(() => validateReconciliationAllocations(0, [{ amount: 1 }, { amount: 1 }])).toThrow();
  });
});
