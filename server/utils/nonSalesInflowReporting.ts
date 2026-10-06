export type NonSalesInflowReportRow = {
  inflowType: string;
  amountCents: number | string;
  receivedAt: Date | string;
  reversedAt: Date | string | null;
};

function timestamp(value: Date | string): number {
  const parsed = value instanceof Date
    ? value.getTime()
    : Date.parse(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (!Number.isFinite(parsed)) throw new Error("Invalid non-sales inflow timestamp in report data.");
  return parsed;
}

export function summarizeNonSalesInflows(
  rows: NonSalesInflowReportRow[],
  start: Date,
  endExclusive: Date,
) {
  const startTime = start.getTime();
  const endTime = endExclusive.getTime();
  const amountsByType: Record<string, number> = {};

  for (const row of rows) {
    const amount = Number(row.amountCents);
    if (!Number.isFinite(amount)) throw new Error("Invalid non-sales inflow amount in report data.");

    const receivedTime = timestamp(row.receivedAt);
    const reversedTime = row.reversedAt == null ? null : timestamp(row.reversedAt);
    const receivedInPeriod = receivedTime >= startTime && receivedTime < endTime;
    const reversedInPeriod = reversedTime !== null && reversedTime >= startTime && reversedTime < endTime;
    const contribution = amount * Number(receivedInPeriod) - amount * Number(reversedInPeriod);

    if (contribution !== 0) {
      amountsByType[row.inflowType] = (amountsByType[row.inflowType] || 0) + contribution;
    }
  }

  const otherIncomeByType = Object.entries(amountsByType).map(([type, amount]) => ({ type, amount }));
  return {
    otherIncome: otherIncomeByType.reduce((sum, row) => sum + row.amount, 0),
    otherIncomeByType,
  };
}
