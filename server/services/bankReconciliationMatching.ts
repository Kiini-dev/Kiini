export type ReconciliationRule = {
  name?: string;
  targetField: "description" | "amount";
  operator: "contains" | "starts_with" | "equals";
  valueToMatch: string;
  action: "auto_match_category" | "flag_for_review";
  targetEntityId?: string | null;
  targetAccountName?: string;
  targetAccountCode?: string | null;
};

export type ReconciliationCandidate = {
  id: string;
  sourceType: "payment" | "expense" | "non_sales_inflow";
  amount: number;
  direction: "debit" | "credit";
  date: string | Date;
  description: string;
  referenceNumber?: string | null;
  accountId?: string | null;
};

function normalized(value: string | null | undefined): string {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function dateDistanceDays(left: string | Date, right: string | Date): number {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  if (!Number.isFinite(leftDate.getTime()) || !Number.isFinite(rightDate.getTime())) return Number.POSITIVE_INFINITY;
  return Math.abs(Date.UTC(leftDate.getUTCFullYear(), leftDate.getUTCMonth(), leftDate.getUTCDate())
    - Date.UTC(rightDate.getUTCFullYear(), rightDate.getUTCMonth(), rightDate.getUTCDate())) / 86_400_000;
}

function similarity(left: string, right: string): number {
  const a = normalized(left);
  const b = normalized(right);
  if (!a || !b) return 0;
  if (a === b) return 1;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + Number(a[i - 1] !== b[j - 1]));
      diagonal = above;
    }
  }
  const distance = previous[b.length];
  const base = 1 - distance / Math.max(a.length, b.length);
  let prefix = 0;
  while (prefix < Math.min(4, a.length, b.length) && a[prefix] === b[prefix]) prefix++;
  return base + prefix * 0.1 * (1 - base);
}

export function matchesRule(rule: ReconciliationRule, transaction: {
  description: string;
  amount: number;
}): boolean {
  const source = rule.targetField === "description"
    ? normalized(transaction.description)
    : String(Math.abs(transaction.amount));
  const value = rule.targetField === "description"
    ? normalized(rule.valueToMatch)
    : String(Math.abs(Number(rule.valueToMatch)));

  if (rule.targetField === "amount" && !Number.isFinite(Number(rule.valueToMatch))) return false;
  if (rule.operator === "contains") return source.includes(value);
  if (rule.operator === "starts_with") return source.startsWith(value);
  return source === value;
}

export function scoreReconciliationCandidates(
  transaction: { amount: number; date: string | Date; description: string; referenceNumber?: string | null },
  candidates: ReconciliationCandidate[],
  rules: ReconciliationRule[] = [],
) {
  const matchedRules = rules.filter((rule) => matchesRule(rule, transaction));
  return candidates.flatMap((candidate) => {
    if (candidate.direction !== (transaction.amount < 0 ? "debit" : "credit")) return [];
    if (Math.round(candidate.amount) !== Math.abs(Math.round(transaction.amount))) return [];

    const dayDifference = dateDistanceDays(transaction.date, candidate.date);
    if (dayDifference > 3) return [];
    const referenceExact = Boolean(
      normalized(transaction.referenceNumber) &&
      normalized(transaction.referenceNumber) === normalized(candidate.referenceNumber),
    );
    const textSimilarity = Math.max(
      similarity(transaction.description, candidate.description),
      similarity(transaction.description, candidate.referenceNumber || ""),
    );
    const matchingRule = matchedRules.find((rule) =>
      rule.action === "auto_match_category" &&
      Boolean(rule.targetEntityId && rule.targetEntityId === candidate.accountId),
    );
    const reviewRule = matchedRules.find((rule) => rule.action === "flag_for_review");
    const confidenceScore = referenceExact
      ? 1
      : Math.min(0.99, Math.max(0.5, 0.82 + textSimilarity * 0.14 - dayDifference * 0.025 + Number(Boolean(matchingRule)) * 0.03));

    return [{
      ...candidate,
      confidenceScore: Number(confidenceScore.toFixed(2)),
      matchMethod: referenceExact ? "exact" as const : matchingRule ? "rule_based" as const : "fuzzy" as const,
      requiresReview: Boolean(reviewRule) || !referenceExact,
      matchedRuleName: matchingRule?.name || (reviewRule ? `Flagged by ${reviewRule.name || "configured rule"}` : null),
    }];
  }).sort((left, right) =>
    right.confidenceScore - left.confidenceScore ||
    dateDistanceDays(transaction.date, left.date) - dateDistanceDays(transaction.date, right.date) ||
    left.id.localeCompare(right.id),
  );
}

export function validateReconciliationAllocations(
  bankAmount: number,
  allocations: Array<{ amount: number }>,
): void {
  if (!Number.isSafeInteger(bankAmount) || bankAmount === 0 || allocations.length < 2) {
    throw new Error("A batch match requires a non-zero bank transaction and at least two accounting records.");
  }
  if (allocations.some(({ amount }) => !Number.isSafeInteger(amount) || amount <= 0)) {
    throw new Error("Every batch allocation must be a positive whole-number amount.");
  }
  const allocatedAmount = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  if (!Number.isSafeInteger(allocatedAmount) || allocatedAmount !== Math.abs(bankAmount)) {
    throw new Error("The selected accounting records must add up exactly to the bank transaction.");
  }
}
