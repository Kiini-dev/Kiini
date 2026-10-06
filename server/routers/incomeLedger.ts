import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { getPool } from "../db";
import { v4 as uuidv4 } from "uuid";
import { reverseSaaSIncomeEntry } from "../services/saasIncomeLedger";

const incomeReadProcedure = createFeatureRestrictedProcedure("accounting:read");
const incomeEditProcedure = createFeatureRestrictedProcedure("accounting:edit");

const rateMetrics = [
  "projectsCount",
  "tasksCount",
  "documentsCount",
  "storageUsedMB",
  "apiCallsCount",
  "emailsSent",
] as const;

const rateCardInput = z.object({
  planId: z.string().min(1),
  currency: z.string().length(3).transform(value => value.toUpperCase()),
  monthlyBaseCents: z.number().int().nonnegative().safe(),
  annualBaseCents: z.number().int().nonnegative().safe(),
  includedSeats: z.number().int().nonnegative().safe(),
  monthlySeatCents: z.number().int().nonnegative().safe(),
  annualSeatCents: z.number().int().nonnegative().safe(),
  tiers: z.array(z.object({
    metricKey: z.enum(rateMetrics),
    unitFrom: z.number().int().nonnegative().safe(),
    unitTo: z.number().int().positive().safe().nullable(),
    unitPriceCents: z.number().int().nonnegative().safe(),
  })).max(120),
}).superRefine((input, context) => {
  for (const metricKey of rateMetrics) {
    const tiers = input.tiers
      .filter(tier => tier.metricKey === metricKey)
      .sort((left, right) => left.unitFrom - right.unitFrom);
    if (tiers.length === 0) continue;
    if (tiers[0].unitFrom !== 0) {
      context.addIssue({ code: "custom", path: ["tiers"], message: `${metricKey} tiers must start at 0.` });
    }
    tiers.forEach((tier, index) => {
      if (tier.unitTo !== null && tier.unitTo <= tier.unitFrom) {
        context.addIssue({ code: "custom", path: ["tiers"], message: `${metricKey} tier upper bounds must be greater than their lower bounds.` });
      }
      if (index < tiers.length - 1 && tier.unitTo !== tiers[index + 1].unitFrom) {
        context.addIssue({ code: "custom", path: ["tiers"], message: `${metricKey} tiers must be contiguous and non-overlapping.` });
      }
      if (index === tiers.length - 1 && tier.unitTo !== null) {
        context.addIssue({ code: "custom", path: ["tiers"], message: `${metricKey} must have an open-ended final tier.` });
      }
    });
  }
});

function requirePlatformAdmin(ctx: { user: { role?: string | null; organizationId?: string | null } }) {
  if (ctx.user.role !== "super_admin" || ctx.user.organizationId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "This ledger is only accessible to an unscoped platform administrator." });
  }
}

function requireTenantScope(ctx: { user: { organizationId?: string | null } }) {
  if (!ctx.user.organizationId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "An organization context is required for the organization income ledger." });
  }
  return ctx.user.organizationId;
}

export const incomeLedgerRouter = router({
  list: incomeReadProcedure
    .input(z.object({
      scope: z.enum(["tenant_income", "company_income", "saas_revenue"]),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      limit: z.number().int().min(1).max(200).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
      if (input.startDate && input.endDate && input.startDate > input.endDate) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Start date must be on or before end date." });
      }

      if (input.scope === "saas_revenue") {
        requirePlatformAdmin(ctx);
        const conditions = ["e.ledgerScope='saas_revenue'"];
        const params: Array<string | number> = [];
        if (input.startDate) { conditions.push("e.entryDate >= ?"); params.push(`${input.startDate} 00:00:00`); }
        if (input.endDate) { conditions.push("e.entryDate < DATE_ADD(?, INTERVAL 1 DAY)"); params.push(input.endDate); }
        const [rows] = await pool.execute<any[]>(
          `SELECT e.*, o.name AS organizationName,
                  EXISTS (SELECT 1 FROM incomeLedgerEntries r WHERE r.reversalOfId=e.id) AS hasOffset
           FROM incomeLedgerEntries e
           LEFT JOIN organizations o ON o.id COLLATE utf8mb4_unicode_ci=e.organizationId
           WHERE ${conditions.join(" AND ")}
           ORDER BY e.entryDate DESC, e.entryNumber DESC LIMIT ? OFFSET ?`,
          [...params, input.limit, input.offset],
        );
        const [countRows] = await pool.execute<any[]>(
          `SELECT COUNT(DISTINCT e.id) AS total,
                  COALESCE(SUM(CASE WHEN l.accountCode='SAAS-REV' THEN l.debitCents ELSE 0 END),0) AS totalIncomeDebitCents,
                  COALESCE(SUM(CASE WHEN l.accountCode='SAAS-REV' THEN l.creditCents ELSE 0 END),0) AS totalIncomeCreditCents
           FROM incomeLedgerEntries e
           LEFT JOIN incomeLedgerLines l ON l.entryId=e.id
           WHERE ${conditions.join(" AND ")}`,
          params,
        );
        const totalIncomeDebitCents = Number(countRows[0]?.totalIncomeDebitCents || 0);
        const totalIncomeCreditCents = Number(countRows[0]?.totalIncomeCreditCents || 0);
        const [currencyTotals] = await pool.execute<any[]>(
          `SELECT e.currency,
                  COALESCE(SUM(CASE WHEN l.accountCode='SAAS-REV' THEN l.debitCents ELSE 0 END),0) AS debitCents,
                  COALESCE(SUM(CASE WHEN l.accountCode='SAAS-REV' THEN l.creditCents ELSE 0 END),0) AS creditCents
           FROM incomeLedgerEntries e
           LEFT JOIN incomeLedgerLines l ON l.entryId=e.id
           WHERE ${conditions.join(" AND ")}
           GROUP BY e.currency`,
          params,
        );
        const entries = await attachLedgerLines(pool, rows);
        return {
          scope: input.scope,
          entries,
          total: Number(countRows[0]?.total || 0),
          totalIncomeDebitCents,
          totalIncomeCreditCents,
          totalIncomeCents: totalIncomeCreditCents - totalIncomeDebitCents,
          totalsByCurrency: currencyTotals.map((row: any) => ({
            currency: row.currency,
            debitCents: Number(row.debitCents || 0),
            creditCents: Number(row.creditCents || 0),
          })),
        };
      }

      const organizationId = input.scope === "tenant_income"
        ? requireTenantScope(ctx)
        : (requirePlatformAdmin(ctx), null);
      const conditions = [
        "j.status IN ('posted','reversed')",
        "EXISTS (SELECT 1 FROM journalEntryLines il JOIN accounts ia ON ia.id=il.accountId AND ia.organizationId <=> j.organizationId WHERE il.journalEntryId=j.id AND ia.accountType IN ('revenue','other income'))",
      ];
      const params: Array<string | number | null> = [];
      if (organizationId === null) conditions.push("j.organizationId IS NULL");
      else { conditions.push("j.organizationId=?"); params.push(organizationId); }
      if (input.startDate) { conditions.push("j.entryDate >= ?"); params.push(`${input.startDate} 00:00:00`); }
      if (input.endDate) { conditions.push("j.entryDate < DATE_ADD(?, INTERVAL 1 DAY)"); params.push(input.endDate); }
      const where = conditions.join(" AND ");
      const [rows] = await pool.execute<any[]>(
        `SELECT j.id, j.organizationId, j.entryNumber, j.entryDate, j.reference, j.description,
                j.referenceType, j.referenceId, j.status, j.createdBy, j.createdAt,
                COALESCE(SUM(CASE WHEN a.accountType IN ('revenue','other income') THEN l.debit ELSE 0 END),0) AS incomeDebitCents,
                COALESCE(SUM(CASE WHEN a.accountType IN ('revenue','other income') THEN l.credit ELSE 0 END),0) AS incomeCreditCents
         FROM journalEntries j
         JOIN journalEntryLines l ON l.journalEntryId=j.id
         LEFT JOIN accounts a ON a.id=l.accountId AND a.organizationId <=> j.organizationId
         WHERE ${where}
         GROUP BY j.id
         ORDER BY j.entryDate DESC, j.entryNumber DESC LIMIT ? OFFSET ?`,
        [...params, input.limit, input.offset],
      );
      const [countRows] = await pool.execute<any[]>(
        `SELECT COUNT(*) AS total,
                COALESCE(SUM(income_totals.debitCents),0) AS totalIncomeDebitCents,
                COALESCE(SUM(income_totals.creditCents),0) AS totalIncomeCreditCents
         FROM (
           SELECT j.id,
                  SUM(CASE WHEN a.accountType IN ('revenue','other income') THEN l.debit ELSE 0 END) AS debitCents,
                  SUM(CASE WHEN a.accountType IN ('revenue','other income') THEN l.credit ELSE 0 END) AS creditCents
           FROM journalEntries j
           JOIN journalEntryLines l ON l.journalEntryId=j.id
           LEFT JOIN accounts a ON a.id=l.accountId AND a.organizationId <=> j.organizationId
           WHERE ${where}
           GROUP BY j.id
         ) income_totals`,
        params,
      );
      return {
        scope: input.scope,
        entries: await attachJournalLines(pool, rows),
        total: Number(countRows[0]?.total || 0),
        totalIncomeDebitCents: Number(countRows[0]?.totalIncomeDebitCents || 0),
        totalIncomeCreditCents: Number(countRows[0]?.totalIncomeCreditCents || 0),
      };
    }),

  offsetSaaSCharge: incomeEditProcedure
    .input(z.object({
      entryId: z.string().min(1),
      reason: z.string().trim().min(5).max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      requirePlatformAdmin(ctx);
      try {
        return await reverseSaaSIncomeEntry({
          entryId: input.entryId,
          reason: input.reason,
          createdBy: ctx.user.id,
        });
      } catch (error) {
        if (error instanceof Error && /not found|Only original|no ledger lines|not a valid balanced charge/i.test(error.message)) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: error.message });
        }
        throw error;
      }
    }),

  listActivePlans: incomeReadProcedure.query(async ({ ctx }) => {
    requirePlatformAdmin(ctx);
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
    const [plans] = await pool.execute<any[]>(
      "SELECT id, planName, tier FROM pricingPlans WHERE isActive=1 ORDER BY displayOrder, planName",
    );
    return plans;
  }),

  listRateCards: incomeReadProcedure.query(async ({ ctx }) => {
    requirePlatformAdmin(ctx);
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
    const [cards] = await pool.execute<any[]>(
      `SELECT c.*, p.planName, p.tier
       FROM saasBillingRateCards c
       JOIN pricingPlans p ON p.id=c.planId
       WHERE c.isActive=1 ORDER BY p.displayOrder, p.planName`,
    );
    if (cards.length === 0) return [];
    const placeholders = cards.map(() => "?").join(",");
    const [tiers] = await pool.execute<any[]>(
      `SELECT * FROM saasBillingRateTiers WHERE rateCardId IN (${placeholders}) ORDER BY metricKey, tierOrder`,
      cards.map(card => card.id),
    );
    const tiersByCard = new Map<string, any[]>();
    for (const tier of tiers) {
      const list = tiersByCard.get(tier.rateCardId) || [];
      list.push(tier);
      tiersByCard.set(tier.rateCardId, list);
    }
    return cards.map(card => ({ ...card, tiers: tiersByCard.get(card.id) || [] }));
  }),

  saveRateCard: incomeEditProcedure
    .input(rateCardInput)
    .mutation(async ({ ctx, input }) => {
      requirePlatformAdmin(ctx);
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
      const [plans] = await pool.execute<any[]>(
        "SELECT id FROM pricingPlans WHERE id=? AND isActive=1 LIMIT 1",
        [input.planId],
      );
      if (!plans[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Active pricing plan not found." });

      const rateCardId = uuidv4();
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute(
          `INSERT INTO saasBillingRateCards
           (id, planId, currency, monthlyBaseCents, annualBaseCents, includedSeats,
            monthlySeatCents, annualSeatCents, isActive, createdBy, updatedBy)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
           ON DUPLICATE KEY UPDATE currency=VALUES(currency),
             monthlyBaseCents=VALUES(monthlyBaseCents), annualBaseCents=VALUES(annualBaseCents),
             includedSeats=VALUES(includedSeats), monthlySeatCents=VALUES(monthlySeatCents),
             annualSeatCents=VALUES(annualSeatCents), isActive=1, updatedBy=VALUES(updatedBy)`,
          [
            rateCardId, input.planId, input.currency, input.monthlyBaseCents, input.annualBaseCents,
            input.includedSeats, input.monthlySeatCents, input.annualSeatCents, ctx.user.id, ctx.user.id,
          ],
        );
        const [savedRows] = await connection.execute<any[]>(
          "SELECT id FROM saasBillingRateCards WHERE planId=? AND currency=? LIMIT 1",
          [input.planId, input.currency],
        );
        const savedRateCardId = String(savedRows[0].id);
        await connection.execute("DELETE FROM saasBillingRateTiers WHERE rateCardId=?", [savedRateCardId]);
        for (const [index, tier] of input.tiers.entries()) {
          const priorSameMetric = input.tiers.slice(0, index).filter(item => item.metricKey === tier.metricKey);
          await connection.execute(
            `INSERT INTO saasBillingRateTiers
             (id, rateCardId, metricKey, tierOrder, unitFrom, unitTo, unitPriceCents)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), savedRateCardId, tier.metricKey, priorSameMetric.length + 1, tier.unitFrom, tier.unitTo, tier.unitPriceCents],
          );
        }
        await connection.commit();
        return { success: true, rateCardId: savedRateCardId };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }),
});

async function attachLedgerLines(pool: any, entries: any[]) {
  if (!entries.length) return [];
  const placeholders = entries.map(() => "?").join(",");
  const [lines] = await pool.execute(
    `SELECT * FROM incomeLedgerLines WHERE entryId IN (${placeholders}) ORDER BY entryId, lineNumber`,
    entries.map(entry => entry.id),
  ) as [any[], unknown];
  const linesByEntry = new Map<string, any[]>();
  for (const line of lines) {
    const list = linesByEntry.get(line.entryId) || [];
    list.push(line);
    linesByEntry.set(line.entryId, list);
  }
  return entries.map(entry => ({ ...entry, lines: linesByEntry.get(entry.id) || [] }));
}

async function attachJournalLines(pool: any, entries: any[]) {
  if (!entries.length) return [];
  const placeholders = entries.map(() => "?").join(",");
  const [lines] = await pool.execute(
    `SELECT l.id, l.journalEntryId AS entryId, l.lineNumber, l.accountId,
            a.accountCode, a.accountName, a.accountType, l.debit, l.credit, l.description
     FROM journalEntryLines l
     JOIN journalEntries j ON j.id=l.journalEntryId
     LEFT JOIN accounts a ON a.id=l.accountId AND a.organizationId <=> j.organizationId
     WHERE l.journalEntryId IN (${placeholders})
     ORDER BY l.journalEntryId, l.lineNumber`,
    entries.map(entry => entry.id),
  ) as [any[], unknown];
  const linesByEntry = new Map<string, any[]>();
  for (const line of lines) {
    const list = linesByEntry.get(line.entryId) || [];
    list.push(line);
    linesByEntry.set(line.entryId, list);
  }
  return entries.map(entry => ({ ...entry, lines: linesByEntry.get(entry.id) || [] }));
}
