import { getPool } from "../db";
import { v4 as uuidv4 } from "uuid";
import { toMajorCurrencyAmount } from "../../shared/currency";

export type SaaSUsageSnapshot = {
  activeSeats: number;
  projectsCount: number;
  tasksCount: number;
  documentsCount: number;
  storageUsedMB: number;
  apiCallsCount: number;
  emailsSent: number;
};

export type SaaSRateTier = {
  metricKey: keyof Omit<SaaSUsageSnapshot, "activeSeats">;
  tierOrder: number;
  unitFrom: number;
  unitTo: number | null;
  unitPriceCents: number;
};

export type SaaSRateCard = {
  id: string;
  planId: string;
  currency: string;
  monthlyBaseCents: number;
  annualBaseCents: number;
  includedSeats: number;
  monthlySeatCents: number;
  annualSeatCents: number;
};

export function buildOffsetLines(
  lines: Array<{
    accountCode: string;
    accountName: string;
    debitCents: number | string;
    creditCents: number | string;
    description?: string | null;
  }>,
  reason: string,
) {
  return lines.map(line => ({
    accountCode: line.accountCode,
    accountName: line.accountName,
    debitCents: Number(line.creditCents || 0),
    creditCents: Number(line.debitCents || 0),
    description: `Offset: ${line.description || reason}`.slice(0, 500),
  }));
}

export function calculateSaaSCharge(
  rateCard: SaaSRateCard,
  tiers: SaaSRateTier[],
  usage: SaaSUsageSnapshot,
  billingCycle: "monthly" | "annual",
) {
  const baseCents = Number(billingCycle === "monthly" ? rateCard.monthlyBaseCents : rateCard.annualBaseCents);
  const seatRateCents = Number(billingCycle === "monthly" ? rateCard.monthlySeatCents : rateCard.annualSeatCents);
  const billableSeats = Math.max(0, Number(usage.activeSeats) - Number(rateCard.includedSeats));
  const breakdown: Array<{ metric: string; units: number; unitPriceCents: number; amountCents: number }> = [
    { metric: "plan_base", units: 1, unitPriceCents: baseCents, amountCents: baseCents },
  ];

  if (billableSeats > 0 && seatRateCents > 0) {
    breakdown.push({
      metric: "additional_seats",
      units: billableSeats,
      unitPriceCents: seatRateCents,
      amountCents: billableSeats * seatRateCents,
    });
  }

  const metrics: Array<keyof Omit<SaaSUsageSnapshot, "activeSeats">> = [
    "projectsCount",
    "tasksCount",
    "documentsCount",
    "storageUsedMB",
    "apiCallsCount",
    "emailsSent",
  ];
  for (const metric of metrics) {
    const quantity = Number(usage[metric]);
    const metricTiers = tiers
      .filter(tier => tier.metricKey === metric)
      .sort((left, right) => left.tierOrder - right.tierOrder);

    for (const tier of metricTiers) {
      const tierEnd = tier.unitTo === null ? quantity : Math.min(quantity, Number(tier.unitTo));
      const tierUnits = Math.max(0, tierEnd - Number(tier.unitFrom));
      const unitPriceCents = Number(tier.unitPriceCents);
      if (tierUnits > 0 && unitPriceCents > 0) {
        breakdown.push({
          metric,
          units: tierUnits,
          unitPriceCents,
          amountCents: tierUnits * unitPriceCents,
        });
      }
    }
  }

  const totalCents = breakdown.reduce((sum, line) => sum + line.amountCents, 0);
  if (!Number.isSafeInteger(totalCents) || totalCents < 0) {
    throw new Error("Calculated subscription charge exceeds the supported amount range.");
  }
  return { totalCents, breakdown };
}

export async function createSaaSIncomeInvoice(input: {
  subscription: {
    id: string;
    organizationId: string;
    planId: string;
    billingCycle: "monthly" | "annual";
    renewalDate: string;
  };
  organization: {
    id: string;
    name: string;
    currency?: string | null;
  };
  periodStart: string;
  periodEnd: string;
}) {
  const pool = getPool();
  if (!pool) throw new Error("Database not available");

  const idempotencyKey = `saas-subscription:${input.subscription.id}:${input.periodStart}:${input.periodEnd}`;
  const [existingRows] = await pool.execute<any[]>(
    "SELECT id, sourceId AS invoiceId FROM incomeLedgerEntries WHERE idempotencyKey=? LIMIT 1",
    [idempotencyKey],
  );
  if (existingRows[0]) {
    return { created: false, invoiceId: existingRows[0].invoiceId as string };
  }

  const organizationCurrency = String(input.organization.currency || "KES").toUpperCase();
  const [rateRows] = await pool.execute<any[]>(
    `SELECT id, planId, currency, monthlyBaseCents, annualBaseCents, includedSeats,
            monthlySeatCents, annualSeatCents
     FROM saasBillingRateCards WHERE planId=? AND currency=? AND isActive=1 LIMIT 1`,
    [input.subscription.planId, organizationCurrency],
  );
  const rateCard = rateRows[0] as SaaSRateCard | undefined;
  if (!rateCard) throw new Error(`No active SaaS rate card is configured for plan ${input.subscription.planId} in ${organizationCurrency}.`);

  const [tierRows] = await pool.execute<any[]>(
    `SELECT metricKey, tierOrder, unitFrom, unitTo, unitPriceCents
     FROM saasBillingRateTiers WHERE rateCardId=? ORDER BY metricKey, tierOrder`,
    [rateCard.id],
  );
  const tiers = (tierRows as SaaSRateTier[]).map(tier => ({
    ...tier,
    tierOrder: Number(tier.tierOrder),
    unitFrom: Number(tier.unitFrom),
    unitTo: tier.unitTo == null ? null : Number(tier.unitTo),
    unitPriceCents: Number(tier.unitPriceCents),
  }));
  const normalizedRateCard: SaaSRateCard = {
    ...rateCard,
    monthlyBaseCents: Number(rateCard.monthlyBaseCents),
    annualBaseCents: Number(rateCard.annualBaseCents),
    includedSeats: Number(rateCard.includedSeats),
    monthlySeatCents: Number(rateCard.monthlySeatCents),
    annualSeatCents: Number(rateCard.annualSeatCents),
  };

  const [seatRows] = await pool.execute<any[]>(
    "SELECT COUNT(*) AS activeSeats FROM organizationUsers WHERE organizationId=? AND isActive=1",
    [input.organization.id],
  );
  const [usageRows] = await pool.execute<any[]>(
    `SELECT
       COALESCE(MAX(projectsCount), 0) AS projectsCount,
       COALESCE(MAX(tasksCount), 0) AS tasksCount,
       COALESCE(MAX(documentsCount), 0) AS documentsCount,
       COALESCE(MAX(storageUsedMB), 0) AS storageUsedMB,
       COALESCE(SUM(apiCallsCount), 0) AS apiCallsCount,
       COALESCE(SUM(emailsSent), 0) AS emailsSent
     FROM billingUsageMetrics
     WHERE subscriptionId=? AND metricDate>=? AND metricDate<DATE_ADD(?, INTERVAL 1 DAY)`,
    [input.subscription.id, input.periodStart, input.periodEnd],
  );
  const usage: SaaSUsageSnapshot = {
    activeSeats: Number(seatRows[0]?.activeSeats || 0),
    projectsCount: Number(usageRows[0]?.projectsCount || 0),
    tasksCount: Number(usageRows[0]?.tasksCount || 0),
    documentsCount: Number(usageRows[0]?.documentsCount || 0),
    storageUsedMB: Number(usageRows[0]?.storageUsedMB || 0),
    apiCallsCount: Number(usageRows[0]?.apiCallsCount || 0),
    emailsSent: Number(usageRows[0]?.emailsSent || 0),
  };
  const charge = calculateSaaSCharge(normalizedRateCard, tiers, usage, input.subscription.billingCycle);
  if (charge.totalCents === 0) return { created: false, noCharge: true, usage, breakdown: charge.breakdown };
  const invoiceId = uuidv4();
  const entryId = uuidv4();
  const invoiceNumber = `INV-${input.organization.id.slice(0, 4).toUpperCase()}-${input.periodEnd.replaceAll("-", "")}-${invoiceId.slice(0, 6).toUpperCase()}`;
  const now = new Date();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [duplicateRows] = await connection.execute<any[]>(
      "SELECT id, sourceId AS invoiceId FROM incomeLedgerEntries WHERE idempotencyKey=? LIMIT 1 FOR UPDATE",
      [idempotencyKey],
    );
    if (duplicateRows[0]) {
      await connection.rollback();
      return { created: false, invoiceId: duplicateRows[0].invoiceId as string };
    }

    const majorAmount = toMajorCurrencyAmount(charge.totalCents, "minor").toFixed(2);
    const note = `Rated from active seats and metered usage. Rate card ${rateCard.id}.`;
    await connection.execute(
      `INSERT INTO billingInvoices
       (id, subscriptionId, invoiceNumber, amount, tax, totalAmount, currency, status,
        billingPeriodStart, billingPeriodEnd, dueDate, sentAt, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 0, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceId,
        input.subscription.id,
        invoiceNumber,
        majorAmount,
        majorAmount,
        organizationCurrency,
        `${input.periodStart} 00:00:00`,
        `${input.periodEnd} 23:59:59`,
        `${input.periodEnd} 23:59:59`,
        now,
        note,
        now,
        now,
      ],
    );
    await connection.execute(
      `INSERT INTO incomeLedgerEntries
       (id, ledgerScope, organizationId, entryNumber, entryDate, periodStart, periodEnd,
        sourceType, sourceId, entryType, description, currency, amountCents,
        usageSnapshot, pricingSnapshot, idempotencyKey, createdBy, createdAt)
       VALUES (?, 'saas_revenue', ?, ?, ?, ?, ?, 'subscription_invoice', ?, 'charge',
        ?, ?, ?, ?, ?, ?, 'system:billing', ?)`,
      [
        entryId,
        input.organization.id,
        invoiceNumber,
        now,
        input.periodStart,
        input.periodEnd,
        invoiceId,
        `Subscription billing for ${input.organization.name}`,
        organizationCurrency,
        charge.totalCents,
        JSON.stringify(usage),
        JSON.stringify({ rateCardId: rateCard.id, billingCycle: input.subscription.billingCycle, breakdown: charge.breakdown }),
        idempotencyKey,
        now,
      ],
    );
    await connection.execute(
      `INSERT INTO incomeLedgerLines
       (id, entryId, lineNumber, accountCode, accountName, debitCents, creditCents, description)
       VALUES (?, ?, 1, 'SAAS-AR', 'SaaS Accounts Receivable', ?, 0, ?),
              (?, ?, 2, 'SAAS-REV', 'SaaS Subscription Revenue', 0, ?, ?)`,
      [
        uuidv4(), entryId, charge.totalCents, `Receivable for ${invoiceNumber}`,
        uuidv4(), entryId, charge.totalCents, `Subscription revenue for ${invoiceNumber}`,
      ],
    );
    await connection.commit();
    return { created: true, invoiceId, invoiceNumber, amountCents: charge.totalCents, usage, breakdown: charge.breakdown };
  } catch (error: any) {
    await connection.rollback();
    if (error?.code === "ER_DUP_ENTRY") {
      const [duplicateRows] = await pool.execute<any[]>(
        "SELECT sourceId AS invoiceId FROM incomeLedgerEntries WHERE idempotencyKey=? LIMIT 1",
        [idempotencyKey],
      );
      if (duplicateRows[0]) return { created: false, invoiceId: duplicateRows[0].invoiceId as string };
    }
    throw error;
  } finally {
    connection.release();
  }
}

export async function reverseSaaSIncomeEntry(input: {
  entryId: string;
  reason: string;
  createdBy: string;
}) {
  const pool = getPool();
  if (!pool) throw new Error("Database not available");

  const connection = await pool.getConnection();
  const idempotencyKey = `saas-reversal:${input.entryId}`;
  try {
    await connection.beginTransaction();
    const [entryRows] = await connection.execute<any[]>(
      `SELECT * FROM incomeLedgerEntries
       WHERE id=? AND ledgerScope='saas_revenue'
       LIMIT 1 FOR UPDATE`,
      [input.entryId],
    );
    const original = entryRows[0];
    if (!original) throw new Error("SaaS income entry not found.");
    if (original.entryType !== "charge" || original.reversalOfId) {
      throw new Error("Only original SaaS charge entries can be offset.");
    }

    const [existingRows] = await connection.execute<any[]>(
      "SELECT id, entryNumber FROM incomeLedgerEntries WHERE idempotencyKey=? LIMIT 1",
      [idempotencyKey],
    );
    if (existingRows[0]) {
      await connection.commit();
      return { created: false, entryId: String(existingRows[0].id), entryNumber: String(existingRows[0].entryNumber) };
    }

    const [lineRows] = await connection.execute<any[]>(
      `SELECT accountCode, accountName, debitCents, creditCents, description
       FROM incomeLedgerLines WHERE entryId=? ORDER BY lineNumber`,
      [input.entryId],
    );
    if (!lineRows.length) throw new Error("Cannot offset an income entry with no ledger lines.");
    const debitTotal = lineRows.reduce((sum, line) => sum + Number(line.debitCents || 0), 0);
    const creditTotal = lineRows.reduce((sum, line) => sum + Number(line.creditCents || 0), 0);
    const amountCents = Number(original.amountCents);
    if (
      debitTotal !== creditTotal ||
      debitTotal <= 0 ||
      !Number.isSafeInteger(amountCents) ||
      amountCents <= 0
    ) {
      throw new Error("The original SaaS entry is not a valid balanced charge and cannot be offset.");
    }

    const reversalId = uuidv4();
    const reversalNumber = `CR-${original.entryNumber}-${reversalId.slice(0, 6).toUpperCase()}`;
    const now = new Date();
    await connection.execute(
      `INSERT INTO incomeLedgerEntries
       (id, ledgerScope, organizationId, entryNumber, entryDate, periodStart, periodEnd,
        sourceType, sourceId, entryType, description, currency, amountCents,
        usageSnapshot, pricingSnapshot, reversalOfId, idempotencyKey, createdBy, createdAt)
       VALUES (?, 'saas_revenue', ?, ?, ?, ?, ?, 'ledger_offset', ?, 'reversal',
        ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reversalId,
        original.organizationId,
        reversalNumber,
        now,
        original.periodStart,
        original.periodEnd,
        input.entryId,
        `Offset of ${original.entryNumber}: ${input.reason}`.slice(0, 500),
        original.currency,
        -amountCents,
        typeof original.usageSnapshot === "string" || original.usageSnapshot == null
          ? original.usageSnapshot
          : JSON.stringify(original.usageSnapshot),
        typeof original.pricingSnapshot === "string" || original.pricingSnapshot == null
          ? original.pricingSnapshot
          : JSON.stringify(original.pricingSnapshot),
        input.entryId,
        idempotencyKey,
        input.createdBy,
        now,
      ],
    );

    const offsetLines = buildOffsetLines(lineRows, input.reason);
    for (const [index, line] of offsetLines.entries()) {
      await connection.execute(
        `INSERT INTO incomeLedgerLines
         (id, entryId, lineNumber, accountCode, accountName, debitCents, creditCents, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          reversalId,
          index + 1,
          line.accountCode,
          line.accountName,
          line.debitCents,
          line.creditCents,
          line.description,
        ],
      );
    }
    await connection.commit();
    return { created: true, entryId: reversalId, entryNumber: reversalNumber };
  } catch (error: any) {
    await connection.rollback();
    if (error?.code === "ER_DUP_ENTRY") {
      const [existingRows] = await pool.execute<any[]>(
        "SELECT id, entryNumber FROM incomeLedgerEntries WHERE idempotencyKey=? LIMIT 1",
        [idempotencyKey],
      );
      if (existingRows[0]) {
        return { created: false, entryId: String(existingRows[0].id), entryNumber: String(existingRows[0].entryNumber) };
      }
    }
    throw error;
  } finally {
    connection.release();
  }
}
