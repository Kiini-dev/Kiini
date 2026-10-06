import { router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getPool } from "../db";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "node:crypto";
import {
  matchesRule,
  scoreReconciliationCandidates,
  validateReconciliationAllocations,
  type ReconciliationRule,
} from "../services/bankReconciliationMatching";
import { resolveOrganizationScope } from "../services/organizationScope";

const readProcedure = createFeatureRestrictedProcedure("accounting:read");
const createProcedure = createFeatureRestrictedProcedure("accounting:create");
const updateProcedure = createFeatureRestrictedProcedure("accounting:edit");
const deleteProcedure = createFeatureRestrictedProcedure("accounting:delete");

const reconciliationRuleFields = z.object({
  name: z.string().trim().min(1).max(100),
  targetField: z.enum(["description", "amount"]).default("description"),
  operator: z.enum(["contains", "starts_with", "equals"]).default("contains"),
  valueToMatch: z.string().trim().min(1).max(255),
  action: z.enum(["auto_match_category", "flag_for_review"]).default("flag_for_review"),
  targetEntityId: z.string().min(1).nullable().optional(),
  priority: z.number().int().min(1).max(10_000).default(100),
  isActive: z.boolean().default(true),
});

const reconciliationRuleInput = reconciliationRuleFields.superRefine((input, context) => {
  if (input.targetField === "amount" && (!Number.isSafeInteger(Number(input.valueToMatch)) || Number(input.valueToMatch) <= 0)) {
    context.addIssue({ code: "custom", path: ["valueToMatch"], message: "Amount rules must use a positive whole-number amount." });
  }
  if (input.action === "auto_match_category" && !input.targetEntityId) {
    context.addIssue({ code: "custom", path: ["targetEntityId"], message: "Select a target account for account-suggestion rules." });
  }
});

const statementRowSchema = z.object({
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().trim().min(1).max(500),
  referenceNumber: z.string().trim().max(100).optional(),
  direction: z.enum(["credit", "debit"]),
  amount: z.number().int().positive(),
});

const statementImportInput = z.object({
  bankAccountId: z.string().min(1),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  openingBalance: z.number().int(),
  closingBalance: z.number().int(),
  notes: z.string().max(2000).optional(),
  rows: z.array(statementRowSchema).min(1).max(5000),
}).refine((input) => input.periodStart <= input.periodEnd, {
  message: "Period end must be on or after period start",
  path: ["periodEnd"],
});

function organizationIdFor(ctx: { user: { organizationId?: string | null; role?: string | null; effectiveRole?: string | null } }) {
  return resolveOrganizationScope(ctx.user).organizationId;
}

function databaseUnavailable() {
  return new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
}

async function writeAuditEvent(
  connection: any,
  input: {
    organizationId: string | null;
    sessionId?: string | null;
    itemId?: string | null;
    actorUserId: string;
    eventType: string;
    details?: unknown;
  },
) {
  await connection.execute(
    `INSERT INTO reconciliation_audit_events
     (id, organizationId, sessionId, itemId, actorUserId, eventType, details, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      uuidv4(), input.organizationId, input.sessionId ?? null, input.itemId ?? null,
      input.actorUserId, input.eventType, input.details == null ? null : JSON.stringify(input.details),
    ],
  );
}

const statementImportProcedure = createProcedure
  .input(statementImportInput)
  .mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw databaseUnavailable();
    const orgId = organizationIdFor(ctx);
    const [accounts] = await pool.execute<any[]>(
      "SELECT id, currency FROM bankAccounts WHERE id=? AND organizationId <=> ? AND isActive=1 LIMIT 1",
      [input.bankAccountId, orgId],
    );
    if (!accounts.length) throw new TRPCError({ code: "NOT_FOUND", message: "Bank account not found." });
    if (input.rows.length > 5000) throw new TRPCError({ code: "BAD_REQUEST", message: "A statement import cannot exceed 5,000 transactions." });
    if (input.rows.some((row) => row.transactionDate < input.periodStart || row.transactionDate > input.periodEnd)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Every statement transaction must fall within the selected period." });
    }

    const movement = input.rows.reduce((total, row) => total + (row.direction === "credit" ? row.amount : -row.amount), 0);
    if (input.openingBalance + movement !== input.closingBalance) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "The statement rows do not add up to the closing balance. Check the selected date, debit, and credit columns.",
      });
    }

    const connection = await pool.getConnection();
    const sessionId = uuidv4();
    try {
      await connection.beginTransaction();
      const [existing] = await connection.execute<any[]>(
        `SELECT s.id FROM reconciliation_sessions s
         WHERE s.organizationId <=> ? AND s.bankAccountId=? AND s.periodStart=? AND s.periodEnd=? AND s.status <> 'voided'
         LIMIT 1 FOR UPDATE`,
        [orgId, input.bankAccountId, input.periodStart, input.periodEnd],
      );
      if (existing.length) {
        throw new TRPCError({ code: "CONFLICT", message: "A reconciliation already exists for this account and period." });
      }
      await connection.execute(
        `INSERT INTO reconciliation_sessions
         (id, organizationId, bankAccountId, periodStart, periodEnd, openingBalance, statementBalance, bookBalance, difference, status, notes, createdBy, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, NOW(), NOW())`,
        [sessionId, orgId, input.bankAccountId, input.periodStart, input.periodEnd, input.openingBalance, input.closingBalance, input.openingBalance, input.closingBalance - input.openingBalance, input.notes || null, ctx.user.id],
      );

      let runningBalance = input.openingBalance;
      const duplicateOccurrences = new Map<string, number>();
      for (const row of input.rows) {
        const debit = row.direction === "debit" ? row.amount : 0;
        const credit = row.direction === "credit" ? row.amount : 0;
        runningBalance += credit - debit;
        const transactionId = uuidv4();
        const reconciliationItemId = uuidv4();
        const transactionDate = `${row.transactionDate} 00:00:00`;
        const rowFingerprint = [
          input.bankAccountId,
          row.transactionDate,
          row.direction,
          row.amount,
          row.referenceNumber?.trim().toLowerCase() || "",
          row.description.trim().toLowerCase(),
        ].join("\u001f");
        const occurrence = duplicateOccurrences.get(rowFingerprint) ?? 0;
        duplicateOccurrences.set(rowFingerprint, occurrence + 1);
        const importFingerprint = createHash("sha256").update(`${rowFingerprint}\u001f${occurrence}`).digest("hex");
        await connection.execute(
          `INSERT INTO bankTransactions
           (id, bankAccountId, transactionDate, description, referenceNumber, debit, credit, balance, isReconciled, importFingerprint, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NOW())`,
          [transactionId, input.bankAccountId, transactionDate, row.description, row.referenceNumber || null, debit, credit, runningBalance, importFingerprint],
        );
        await connection.execute(
          `INSERT INTO reconciliation_items
           (id, sessionId, bankTransactionId, amount, status, createdAt)
           VALUES (?, ?, ?, ?, 'unmatched', NOW())`,
          [reconciliationItemId, sessionId, transactionId, credit - debit],
        );
      }
      await writeAuditEvent(connection, {
        organizationId: orgId,
        sessionId,
        actorUserId: ctx.user.id,
        eventType: "statement_imported",
        details: {
          bankAccountId: input.bankAccountId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          transactionCount: input.rows.length,
          currency: accounts[0].currency || "KES",
        },
      });
      await connection.commit();
      return { id: sessionId };
    } catch (error) {
      await connection.rollback();
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ER_DUP_ENTRY") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "One or more statement transactions were already imported for this bank account.",
        });
      }
      throw error;
    } finally {
      connection.release();
    }
  });

export const bankReconciliationRouter = router({
  list: readProcedure.query(async ({ ctx }) => {
    const pool = getPool();
    if (!pool) throw databaseUnavailable();
    const orgId = organizationIdFor(ctx);
    const [rows] = await pool.execute<any[]>(
      "SELECT id, accountName, bankName, accountNumber, currency, balance FROM bankAccounts WHERE organizationId <=> ? AND isActive=1 ORDER BY accountName",
      [orgId],
    );
    return rows.map((account: any) => ({
      id: account.id,
      name: account.accountName,
      bankCode: account.bankName,
      accountNumber: account.accountNumber,
      currency: account.currency || "KES",
      balance: Number(account.balance || 0),
    }));
  }),

  listRules: readProcedure.query(async ({ ctx }) => {
    const pool = getPool();
    if (!pool) throw databaseUnavailable();
    const orgId = organizationIdFor(ctx);
    const [rows] = await pool.execute<any[]>(
      `SELECT r.id, r.name, r.targetField, r.operator, r.valueToMatch, r.action, r.targetEntityId,
              a.accountName AS targetAccountName, a.accountCode AS targetAccountCode,
              r.priority, r.isActive, r.createdAt, r.updatedAt
       FROM reconciliation_rules r LEFT JOIN accounts a ON a.id=r.targetEntityId AND a.organizationId <=> r.organizationId
       WHERE r.organizationId <=> ? ORDER BY r.priority, r.createdAt`,
      [orgId],
    );
    return rows.map((row: any) => ({ ...row, isActive: Boolean(row.isActive), priority: Number(row.priority) }));
  }),

  listRuleTargets: readProcedure.query(async ({ ctx }) => {
    const pool = getPool();
    if (!pool) throw databaseUnavailable();
    const orgId = organizationIdFor(ctx);
    const [rows] = await pool.execute<any[]>(
      `SELECT id, accountCode, accountName FROM accounts
       WHERE organizationId <=> ? AND isActive=1 ORDER BY accountCode, accountName`,
      [orgId],
    );
    return rows;
  }),

  createRule: createProcedure
    .input(reconciliationRuleInput)
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const organizationId = organizationIdFor(ctx);
      const id = uuidv4();
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        if (input.targetEntityId) {
          const [accounts] = await connection.execute<any[]>(
            "SELECT id FROM accounts WHERE id=? AND organizationId <=> ? AND isActive=1 LIMIT 1 FOR UPDATE",
            [input.targetEntityId, organizationId],
          );
          if (!accounts.length) throw new TRPCError({ code: "BAD_REQUEST", message: "The matching-rule target must be an active account in this reconciliation scope." });
        }
        await connection.execute(
          `INSERT INTO reconciliation_rules
           (id, organizationId, name, targetField, operator, valueToMatch, action, targetEntityId, priority, isActive, createdBy, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            id, organizationId, input.name, input.targetField, input.operator,
            input.valueToMatch, input.action, input.targetEntityId ?? null,
            input.priority, input.isActive ? 1 : 0, ctx.user.id,
          ],
        );
        await writeAuditEvent(connection, {
          organizationId,
          actorUserId: ctx.user.id,
          eventType: "rule_created",
          details: { ruleId: id, name: input.name, action: input.action },
        });
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
      return { id };
    }),

  updateRule: updateProcedure
    .input(z.object({ id: z.string().min(1), changes: reconciliationRuleFields.partial() }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const organizationId = organizationIdFor(ctx);
      const fields: Record<string, unknown> = { ...input.changes };
      if (typeof fields.isActive === "boolean") fields.isActive = fields.isActive ? 1 : 0;
      if (Object.hasOwn(fields, "targetEntityId") && fields.targetEntityId === undefined) delete fields.targetEntityId;
      const allowedColumns: Record<string, string> = {
        name: "name",
        targetField: "targetField",
        operator: "operator",
        valueToMatch: "valueToMatch",
        action: "action",
        targetEntityId: "targetEntityId",
        priority: "priority",
        isActive: "isActive",
      };
      const updates = Object.entries(fields).filter(([key]) => allowedColumns[key]);
      if (!updates.length) throw new TRPCError({ code: "BAD_REQUEST", message: "Provide at least one rule change." });
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [existingRows] = await connection.execute<any[]>(
          "SELECT id, action, targetEntityId FROM reconciliation_rules WHERE id=? AND organizationId <=> ? LIMIT 1 FOR UPDATE",
          [input.id, organizationId],
        );
        const existing = existingRows[0];
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Reconciliation rule not found." });
        const nextAction = (fields.action as string | undefined) ?? existing.action;
        const nextTargetEntityId = Object.hasOwn(fields, "targetEntityId")
          ? fields.targetEntityId as string | null
          : existing.targetEntityId;
        const nextTargetField = (fields.targetField as string | undefined) ?? existing.targetField;
        const nextValueToMatch = (fields.valueToMatch as string | undefined) ?? existing.valueToMatch;
        if (nextTargetField === "amount" &&
            (!Number.isSafeInteger(Number(nextValueToMatch)) || Number(nextValueToMatch) <= 0)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Amount rules must use a positive whole-number amount." });
        }
        if (nextAction === "auto_match_category" && !nextTargetEntityId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Select a target account for account-suggestion rules." });
        }
        if (typeof nextTargetEntityId === "string") {
          const [accounts] = await connection.execute<any[]>(
            "SELECT id FROM accounts WHERE id=? AND organizationId <=> ? AND isActive=1 LIMIT 1 FOR UPDATE",
            [nextTargetEntityId, organizationId],
          );
          if (!accounts.length) throw new TRPCError({ code: "BAD_REQUEST", message: "The matching-rule target must be an active account in this reconciliation scope." });
        }
        await connection.execute(
          `UPDATE reconciliation_rules SET ${updates.map(([key]) => `\`${allowedColumns[key]}\`=?`).join(", ")}, updatedAt=NOW()
           WHERE id=? AND organizationId <=> ?`,
          [...updates.map(([, value]) => value as string | number | boolean | null), input.id, organizationId],
        );
        await writeAuditEvent(connection, {
          organizationId,
          actorUserId: ctx.user.id,
          eventType: "rule_updated",
          details: { ruleId: input.id, changedFields: updates.map(([key]) => key) },
        });
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
      return { success: true, id: input.id };
    }),

  deleteRule: deleteProcedure
    .input(z.string().min(1))
    .mutation(async ({ input: ruleId, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const organizationId = organizationIdFor(ctx);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.execute<any>(
          "UPDATE reconciliation_rules SET isActive=0, updatedAt=NOW() WHERE id=? AND organizationId <=> ? AND isActive=1",
          [ruleId, organizationId],
        );
        if (!result.affectedRows) throw new TRPCError({ code: "NOT_FOUND", message: "Active reconciliation rule not found." });
        await writeAuditEvent(connection, {
          organizationId,
          actorUserId: ctx.user.id,
          eventType: "rule_deactivated",
          details: { ruleId },
        });
        await connection.commit();
        return { success: true };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }),

  getAuditTrail: readProcedure
    .input(z.object({ sessionId: z.string().min(1).nullable().optional(), limit: z.number().int().min(1).max(500).default(100) }))
    .query(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const organizationId = organizationIdFor(ctx);
      const [rows] = await pool.execute<any[]>(
        `SELECT id, sessionId, itemId, actorUserId, eventType, details, createdAt
         FROM reconciliation_audit_events
         WHERE organizationId <=> ? AND (? IS NULL OR sessionId=?)
         ORDER BY createdAt DESC LIMIT ?`,
        [organizationId, input.sessionId ?? null, input.sessionId ?? null, input.limit],
      );
      return rows.map((row: any) => ({
        ...row,
        details: typeof row.details === "string" ? JSON.parse(row.details) : row.details,
      }));
    }),

  createAccount: createProcedure
    .input(z.object({
      accountName: z.string().trim().min(1).max(255),
      bankName: z.string().trim().min(1).max(255),
      accountNumber: z.string().trim().min(1).max(100),
      currency: z.string().trim().min(3).max(10).default("KES"),
    }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const orgId = organizationIdFor(ctx);
      const id = uuidv4();
      await pool.execute(
        "INSERT INTO bankAccounts (id, organizationId, accountName, bankName, accountNumber, currency, balance, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 0, 1, NOW(), NOW())",
        [id, orgId, input.accountName, input.bankName, input.accountNumber, input.currency.toUpperCase()],
      );
      return { id };
    }),

  listSessions: readProcedure
    .input(z.object({ bankAccountId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const orgId = organizationIdFor(ctx);
      const [rows] = await pool.execute<any[]>(
        `SELECT id, periodStart, periodEnd, statementBalance, openingBalance, bookBalance, difference, status, createdAt
         FROM reconciliation_sessions WHERE organizationId <=> ? AND bankAccountId=? AND status <> 'voided'
         ORDER BY periodEnd DESC, createdAt DESC`,
        [orgId, input.bankAccountId],
      );
      return rows.map((session: any) => ({
        ...session,
        statementBalance: Number(session.statementBalance || 0),
        openingBalance: Number(session.openingBalance || 0),
        bookBalance: Number(session.bookBalance || 0),
        difference: Number(session.difference || 0),
      }));
    }),

  getById: readProcedure
    .input(z.string().min(1))
    .query(async ({ input: sessionId, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const orgId = organizationIdFor(ctx);
      const [sessionRows] = await pool.execute<any[]>(
        `SELECT s.*, a.accountName, a.accountNumber, a.currency
         FROM reconciliation_sessions s JOIN bankAccounts a ON a.id=s.bankAccountId
         WHERE s.id=? AND s.organizationId <=> ? AND a.organizationId <=> ? LIMIT 1`,
        [sessionId, orgId, orgId],
      );
      const session = sessionRows[0];
      if (!session) return null;

      const [itemRows] = await pool.execute<any[]>(
        `SELECT i.id, i.sourceType, i.sourceId, i.status AS itemStatus,
                bt.id AS transactionId, bt.transactionDate, bt.description, bt.referenceNumber,
                bt.debit, bt.credit
         FROM reconciliation_items i
         JOIN bankTransactions bt ON bt.id=i.bankTransactionId
         WHERE i.sessionId=? ORDER BY bt.transactionDate, bt.id`,
        [sessionId],
      );
      const [allocationRows] = await pool.execute<any[]>(
        `SELECT a.itemId, a.sourceType, a.sourceId, a.allocatedAmount
         FROM reconciliation_match_allocations a
         JOIN reconciliation_items i ON i.id=a.itemId
         WHERE i.sessionId=? AND i.status='matched'
         ORDER BY a.createdAt, a.id`,
        [sessionId],
      );
      const start = `${String(session.periodStart).slice(0, 10)} 00:00:00`;
      const end = `${String(session.periodEnd).slice(0, 10)} 23:59:59`;
      const [paymentRows] = await pool.execute<any[]>(
        `SELECT id, paymentDate AS transactionDate, amount, referenceNumber, COALESCE(notes, 'Payment') AS description, accountId, 'payment' AS sourceType
         FROM payments WHERE organizationId <=> ? AND status='completed' AND paymentDate BETWEEN ? AND ?
           AND (accountId=? OR accountId IS NULL)
           AND NOT EXISTS (
             SELECT 1 FROM reconciliation_items ri JOIN reconciliation_sessions rs ON rs.id=ri.sessionId
             WHERE ri.sourceType='payment' AND ri.sourceId=payments.id AND ri.status='matched'
               AND rs.status <> 'voided' AND rs.organizationId <=> ? AND rs.id <> ?
           ) AND NOT EXISTS (
             SELECT 1 FROM reconciliation_match_allocations ma
             JOIN reconciliation_items ri ON ri.id=ma.itemId
             JOIN reconciliation_sessions rs ON rs.id=ri.sessionId
             WHERE ma.sourceType='payment' AND ma.sourceId=payments.id AND ri.status='matched'
               AND rs.status <> 'voided' AND rs.organizationId <=> ? AND rs.id <> ?
           ) ORDER BY paymentDate`,
        [orgId, start, end, session.bankAccountId, orgId, sessionId, orgId, sessionId],
      );
      const [expenseRows] = await pool.execute<any[]>(
        `SELECT id, expenseDate AS transactionDate, amount, expenseNumber AS referenceNumber,
                COALESCE(description, vendor, category, 'Expense') AS description, accountId, 'expense' AS sourceType
         FROM expenses WHERE organizationId <=> ? AND status='paid' AND expenseDate BETWEEN ? AND ?
           AND paymentMethod IN ('bank_transfer', 'cheque') AND (accountId=? OR accountId IS NULL)
           AND NOT EXISTS (
             SELECT 1 FROM reconciliation_items ri JOIN reconciliation_sessions rs ON rs.id=ri.sessionId
             WHERE ri.sourceType='expense' AND ri.sourceId=expenses.id AND ri.status='matched'
               AND rs.status <> 'voided' AND rs.organizationId <=> ? AND rs.id <> ?
           ) AND NOT EXISTS (
             SELECT 1 FROM reconciliation_match_allocations ma
             JOIN reconciliation_items ri ON ri.id=ma.itemId
             JOIN reconciliation_sessions rs ON rs.id=ri.sessionId
             WHERE ma.sourceType='expense' AND ma.sourceId=expenses.id AND ri.status='matched'
               AND rs.status <> 'voided' AND rs.organizationId <=> ? AND rs.id <> ?
           ) ORDER BY expenseDate`,
        [orgId, start, end, session.bankAccountId, orgId, sessionId, orgId, sessionId],
      );
      const [inflowRows] = await pool.execute<any[]>(
        `SELECT id, receivedAt AS transactionDate, amountCents AS amount, referenceNumber,
                description, 'non_sales_inflow' AS sourceType
         FROM nonSalesInflows WHERE organizationId <=> ? AND status='posted' AND receivedAt BETWEEN ? AND ?
           AND bankAccountId=?
           AND NOT EXISTS (
             SELECT 1 FROM reconciliation_items ri JOIN reconciliation_sessions rs ON rs.id=ri.sessionId
             WHERE ri.sourceType='non_sales_inflow' AND ri.sourceId=nonSalesInflows.id AND ri.status='matched'
               AND rs.status <> 'voided' AND rs.organizationId <=> ? AND rs.id <> ?
           ) AND NOT EXISTS (
             SELECT 1 FROM reconciliation_match_allocations ma
             JOIN reconciliation_items ri ON ri.id=ma.itemId
             JOIN reconciliation_sessions rs ON rs.id=ri.sessionId
             WHERE ma.sourceType='non_sales_inflow' AND ma.sourceId=nonSalesInflows.id AND ri.status='matched'
               AND rs.status <> 'voided' AND rs.organizationId <=> ? AND rs.id <> ?
           ) ORDER BY receivedAt`,
        [orgId, start, end, session.bankAccountId, orgId, sessionId, orgId, sessionId],
      );
      const [ruleRows] = await pool.execute<any[]>(
        `SELECT r.name, r.targetField, r.operator, r.valueToMatch, r.action, r.targetEntityId,
                a.accountName AS targetAccountName, a.accountCode AS targetAccountCode
         FROM reconciliation_rules r LEFT JOIN accounts a ON a.id=r.targetEntityId AND a.organizationId <=> r.organizationId
         WHERE r.organizationId <=> ? AND r.isActive=1 ORDER BY r.priority, r.createdAt`,
        [orgId],
      );
      const rules = ruleRows as ReconciliationRule[];
      const usedSources = new Set(allocationRows.map((allocation: any) => `${allocation.sourceType}:${allocation.sourceId}`));
      itemRows.filter((item: any) => item.itemStatus === "matched" && item.sourceType && item.sourceId)
        .forEach((item: any) => usedSources.add(`${item.sourceType}:${item.sourceId}`));
      const candidates = [...paymentRows, ...expenseRows, ...inflowRows].map((candidate: any) => ({
        id: candidate.id,
        sourceType: candidate.sourceType as "payment" | "expense" | "non_sales_inflow",
        date: candidate.transactionDate,
        amount: Number(candidate.amount || 0),
        referenceNumber: candidate.referenceNumber,
        description: candidate.description,
        direction: candidate.sourceType === "expense" ? "debit" as const : "credit" as const,
        accountId: candidate.accountId || null,
        alreadyMatched: usedSources.has(`${candidate.sourceType}:${candidate.id}`),
      }));
      const transactions = itemRows.map((item: any) => {
        const amount = Number(item.credit || 0) - Number(item.debit || 0);
        const eligible = candidates.filter((candidate: any) =>
          !candidate.alreadyMatched ||
          (candidate.sourceType === item.sourceType && candidate.id === item.sourceId) ||
          allocationRows.some((allocation: any) => allocation.itemId === item.id && allocation.sourceType === candidate.sourceType && allocation.sourceId === candidate.id),
        );
        const suggestions = scoreReconciliationCandidates({
          amount,
          date: item.transactionDate,
          description: item.description || "",
          referenceNumber: item.referenceNumber,
        }, eligible, rules);
        const accountSuggestions = rules
          .filter((rule) => rule.action === "auto_match_category" && rule.targetEntityId && matchesRule(rule, {
            description: item.description || "",
            amount,
          }))
          .map((rule) => ({
            ruleName: rule.name,
            accountId: rule.targetEntityId,
            accountName: rule.targetAccountName || "Configured account",
            accountCode: rule.targetAccountCode || null,
          }));
        const linkedSources = allocationRows
          .filter((allocation: any) => allocation.itemId === item.id)
          .map((allocation: any) => ({
            sourceType: allocation.sourceType,
            id: allocation.sourceId,
            amount: Number(allocation.allocatedAmount),
          }));
        const legacyMatch = item.itemStatus === "matched" && item.sourceType && item.sourceId
          ? [{ sourceType: item.sourceType, id: item.sourceId, amount: Math.abs(amount) }]
          : [];
        const candidateOptions = eligible.filter((candidate: any) =>
          candidate.direction === (amount >= 0 ? "credit" : "debit"),
        );
        return {
          id: item.id,
          bankTransactionId: item.transactionId,
          date: item.transactionDate,
          description: item.description || "Bank transaction",
          referenceNumber: item.referenceNumber,
          amount,
          status: item.itemStatus,
          sourceType: item.sourceType,
          sourceId: item.sourceId,
          suggestedCandidateId: suggestions[0] ? `${suggestions[0].sourceType}:${suggestions[0].id}` : undefined,
          matchedSources: linkedSources.length ? linkedSources : legacyMatch,
          candidates: suggestions,
          candidateOptions,
          accountSuggestions,
        };
      });
      const matched = transactions.filter((item: any) => item.status === "matched").length;
      const openingBalance = Number(session.openingBalance || 0);
      const statementBalance = Number(session.statementBalance || 0);
      const matchedMovement = transactions
        .filter((item: any) => item.status === "matched")
        .reduce((total: number, item: any) => total + item.amount, 0);
      const bookBalance = openingBalance + matchedMovement;
      return {
        id: session.id,
        bankAccountId: session.bankAccountId,
        bankAccount: session.accountName,
        accountNumber: session.accountNumber,
        currency: session.currency || "KES",
        periodStart: String(session.periodStart).slice(0, 10),
        periodEnd: String(session.periodEnd).slice(0, 10),
        period: `${String(session.periodStart).slice(0, 10)} to ${String(session.periodEnd).slice(0, 10)}`,
        statementDate: String(session.periodEnd).slice(0, 10),
        status: session.status,
        notes: session.notes,
        openingBalance,
        bankBalance: statementBalance,
        closingBalance: statementBalance,
        bookBalance,
        difference: statementBalance - bookBalance,
        reconciliationDate: session.approvedAt || session.createdAt,
        matchedTransactions: matched,
        unmatchedTransactions: transactions.length - matched,
        transactions,
      };
    }),

  create: statementImportProcedure,
  importStatement: statementImportProcedure,

  matchTransaction: updateProcedure
    .input(z.object({
      sessionId: z.string().min(1),
      itemId: z.string().min(1),
      sourceType: z.enum(["payment", "expense", "non_sales_inflow"]),
      sourceId: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const orgId = organizationIdFor(ctx);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.execute<any[]>(
          `SELECT i.id, i.status, i.sourceType, i.sourceId, bt.credit, bt.debit,
                  s.periodStart, s.periodEnd, s.bankAccountId
           FROM reconciliation_items i JOIN reconciliation_sessions s ON s.id=i.sessionId
           JOIN bankTransactions bt ON bt.id=i.bankTransactionId
           JOIN bankAccounts a ON a.id=s.bankAccountId
           WHERE i.id=? AND i.sessionId=? AND s.organizationId <=> ? AND a.organizationId <=> ? AND s.status IN ('draft','in_review','reopened')
           LIMIT 1 FOR UPDATE`,
          [input.itemId, input.sessionId, orgId, orgId],
        );
        const item = rows[0];
        if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Open reconciliation transaction not found." });
        if (item.status === "matched") throw new TRPCError({ code: "CONFLICT", message: "Remove the existing match before selecting a different accounting record." });

        const sourceQuery = input.sourceType === "non_sales_inflow"
          ? `SELECT id, amountCents AS amount FROM nonSalesInflows
             WHERE id=? AND organizationId <=> ? AND receivedAt BETWEEN ? AND ?
               AND bankAccountId=? AND status='posted' LIMIT 1 FOR UPDATE`
          : `SELECT id, amount FROM ${input.sourceType === "payment" ? "payments" : "expenses"}
             WHERE id=? AND organizationId <=> ? AND ${input.sourceType === "payment" ? "paymentDate" : "expenseDate"} BETWEEN ? AND ?
               AND (accountId=? OR accountId IS NULL)
               AND ${input.sourceType === "payment" ? "status='completed'" : "status='paid' AND paymentMethod IN ('bank_transfer','cheque')"}
             LIMIT 1 FOR UPDATE`;
        const [sources] = await connection.execute<any[]>(sourceQuery, [
          input.sourceId, orgId, `${String(item.periodStart).slice(0, 10)} 00:00:00`,
          `${String(item.periodEnd).slice(0, 10)} 23:59:59`, item.bankAccountId,
        ]);
        const source = sources[0];
        const amount = Number(item.credit || 0) - Number(item.debit || 0);
        const expectedDirection = input.sourceType === "expense" ? "debit" : "credit";
        if (!source || Number(source.amount) !== Math.abs(amount) || (amount >= 0 ? "credit" : "debit") !== expectedDirection) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "The accounting record does not match this bank transaction." });
        }
        const [used] = await connection.execute<any[]>(
          `SELECT i.id FROM reconciliation_items i JOIN reconciliation_sessions s ON s.id=i.sessionId
           WHERE i.sourceType=? AND i.sourceId=? AND i.status='matched' AND s.status <> 'voided'
             AND s.organizationId <=> ?
             AND NOT (i.sessionId=? AND i.id=?) LIMIT 1 FOR UPDATE`,
          [input.sourceType, input.sourceId, orgId, input.sessionId, input.itemId],
        );
        const [allocatedElsewhere] = await connection.execute<any[]>(
          `SELECT a.id FROM reconciliation_match_allocations a
           JOIN reconciliation_items i ON i.id=a.itemId
           JOIN reconciliation_sessions s ON s.id=i.sessionId
           WHERE a.sourceType=? AND a.sourceId=? AND i.status='matched' AND s.status <> 'voided'
             AND s.organizationId <=> ?
             AND NOT (i.sessionId=? AND i.id=?) LIMIT 1 FOR UPDATE`,
          [input.sourceType, input.sourceId, orgId, input.sessionId, input.itemId],
        );
        if (used.length || allocatedElsewhere.length) throw new TRPCError({ code: "CONFLICT", message: "This accounting record is already reconciled elsewhere." });
        await connection.execute("DELETE FROM reconciliation_match_allocations WHERE itemId=?", [input.itemId]);
        await connection.execute(
          `INSERT INTO reconciliation_match_allocations (id, itemId, sourceType, sourceId, allocatedAmount, createdBy, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [uuidv4(), input.itemId, input.sourceType, input.sourceId, Math.abs(amount), ctx.user.id],
        );
        await connection.execute(
          `UPDATE reconciliation_items SET sourceType=?, sourceId=?, status='matched', matchedBy=?, matchedAt=NOW()
           WHERE id=? AND sessionId=?`,
          [input.sourceType, input.sourceId, ctx.user.id, input.itemId, input.sessionId],
        );
        await connection.execute(
          `UPDATE reconciliation_sessions SET status='in_review', updatedAt=NOW()
           WHERE id=? AND status='draft'`,
          [input.sessionId],
        );
        await writeAuditEvent(connection, {
           organizationId: orgId,
           sessionId: input.sessionId,
           itemId: input.itemId,
           actorUserId: ctx.user.id,
           eventType: "transaction_matched",
           details: { sourceType: input.sourceType, sourceId: input.sourceId, amount: Math.abs(amount) },
        });
        await connection.commit();
        return { success: true };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }),

  matchBatch: updateProcedure
    .input(z.object({
      sessionId: z.string().min(1),
      itemId: z.string().min(1),
      sources: z.array(z.object({
        sourceType: z.enum(["payment", "expense", "non_sales_inflow"]),
        sourceId: z.string().min(1),
      })).min(2).max(100),
      notes: z.string().trim().max(2000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const organizationId = organizationIdFor(ctx);
      const sourceKeys = input.sources.map(({ sourceType, sourceId }) => `${sourceType}:${sourceId}`);
      if (new Set(sourceKeys).size !== sourceKeys.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Select each accounting record only once." });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [items] = await connection.execute<any[]>(
          `SELECT i.id, i.status, bt.credit, bt.debit, bt.transactionDate, s.periodStart, s.periodEnd, s.bankAccountId
           FROM reconciliation_items i
           JOIN reconciliation_sessions s ON s.id=i.sessionId
           JOIN bankTransactions bt ON bt.id=i.bankTransactionId
           JOIN bankAccounts a ON a.id=s.bankAccountId
           WHERE i.id=? AND i.sessionId=? AND s.organizationId <=> ? AND a.organizationId <=> ?
             AND s.status IN ('draft','in_review','reopened')
           LIMIT 1 FOR UPDATE`,
          [input.itemId, input.sessionId, organizationId, organizationId],
        );
        const item = items[0];
        if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Open reconciliation transaction not found." });
        if (item.status === "matched") throw new TRPCError({ code: "CONFLICT", message: "Remove the existing match before replacing it with a batch match." });

        const bankAmount = Number(item.credit || 0) - Number(item.debit || 0);
        const expectedDirection = bankAmount >= 0 ? "credit" : "debit";
        const start = `${String(item.periodStart).slice(0, 10)} 00:00:00`;
        const end = `${String(item.periodEnd).slice(0, 10)} 23:59:59`;
        const resolvedSources: Array<{ sourceType: string; sourceId: string; amount: number }> = [];
        for (const sourceRef of input.sources) {
          const statement = sourceRef.sourceType === "non_sales_inflow"
            ? `SELECT id, amountCents AS amount, bankAccountId, receivedAt AS transactionDate
               FROM nonSalesInflows WHERE id=? AND organizationId <=> ? AND status='posted'
                 AND receivedAt BETWEEN ? AND ? AND bankAccountId=? LIMIT 1 FOR UPDATE`
            : `SELECT id, amount, accountId, ${sourceRef.sourceType === "payment" ? "paymentDate" : "expenseDate"} AS transactionDate
               FROM ${sourceRef.sourceType === "payment" ? "payments" : "expenses"}
               WHERE id=? AND organizationId <=> ? AND ${sourceRef.sourceType === "payment" ? "status='completed'" : "status='paid' AND paymentMethod IN ('bank_transfer','cheque')"}
                 AND ${sourceRef.sourceType === "payment" ? "paymentDate" : "expenseDate"} BETWEEN ? AND ?
                 AND (accountId=? OR accountId IS NULL) LIMIT 1 FOR UPDATE`;
          const [sourceRows] = await connection.execute<any[]>(statement, [
            sourceRef.sourceId, organizationId, start, end, item.bankAccountId,
          ]);
          const source = sourceRows[0];
          if (!source) throw new TRPCError({ code: "BAD_REQUEST", message: "One or more selected accounting records are unavailable for this statement period and bank account." });
          if ((sourceRef.sourceType === "expense" ? "debit" : "credit") !== expectedDirection) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Selected accounting records must have the same debit or credit direction as the bank transaction." });
          }
          resolvedSources.push({
            sourceType: sourceRef.sourceType,
            sourceId: sourceRef.sourceId,
            amount: Number(source.amount),
          });
        }
        try {
          validateReconciliationAllocations(Math.abs(bankAmount), resolvedSources);
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Invalid batch allocation." });
        }

        for (const source of resolvedSources) {
          const [usedItemRows] = await connection.execute<any[]>(
            `SELECT i.id FROM reconciliation_items i JOIN reconciliation_sessions s ON s.id=i.sessionId
             WHERE i.sourceType=? AND i.sourceId=? AND i.status='matched' AND s.status <> 'voided'
               AND s.organizationId <=> ?
               AND NOT (i.sessionId=? AND i.id=?) LIMIT 1 FOR UPDATE`,
            [source.sourceType, source.sourceId, organizationId, input.sessionId, input.itemId],
          );
          const [usedAllocationRows] = await connection.execute<any[]>(
            `SELECT a.id FROM reconciliation_match_allocations a
             JOIN reconciliation_items i ON i.id=a.itemId
             JOIN reconciliation_sessions s ON s.id=i.sessionId
             WHERE a.sourceType=? AND a.sourceId=? AND i.status='matched' AND s.status <> 'voided'
               AND s.organizationId <=> ?
               AND NOT (i.sessionId=? AND i.id=?) LIMIT 1 FOR UPDATE`,
            [source.sourceType, source.sourceId, organizationId, input.sessionId, input.itemId],
          );
          if (usedItemRows.length || usedAllocationRows.length) {
            throw new TRPCError({ code: "CONFLICT", message: "One or more accounting records are already reconciled elsewhere." });
          }
        }

        for (const source of resolvedSources) {
          await connection.execute(
            `INSERT INTO reconciliation_match_allocations (id, itemId, sourceType, sourceId, allocatedAmount, createdBy, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [uuidv4(), input.itemId, source.sourceType, source.sourceId, source.amount, ctx.user.id],
          );
        }
        const primary = resolvedSources[0];
        await connection.execute(
          `UPDATE reconciliation_items SET sourceType=?, sourceId=?, status='matched', notes=?, matchedBy=?, matchedAt=NOW()
           WHERE id=? AND sessionId=?`,
          [primary.sourceType, primary.sourceId, input.notes || null, ctx.user.id, input.itemId, input.sessionId],
        );
        await connection.execute(
          "UPDATE reconciliation_sessions SET status='in_review', updatedAt=NOW() WHERE id=? AND status='draft'",
          [input.sessionId],
        );
        await writeAuditEvent(connection, {
          organizationId,
          sessionId: input.sessionId,
          itemId: input.itemId,
          actorUserId: ctx.user.id,
          eventType: "batch_transaction_matched",
          details: { sources: resolvedSources, notes: input.notes ?? null },
        });
        await connection.commit();
        return { success: true, sourceCount: resolvedSources.length };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }),

  unmatchTransaction: updateProcedure
    .input(z.object({ sessionId: z.string().min(1), itemId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const orgId = organizationIdFor(ctx);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.execute<any>(
          `UPDATE reconciliation_items i JOIN reconciliation_sessions s ON s.id=i.sessionId
           JOIN bankAccounts a ON a.id=s.bankAccountId
           SET i.sourceType=NULL, i.sourceId=NULL, i.status='unmatched', i.matchedBy=NULL, i.matchedAt=NULL,
               s.status='draft', s.updatedAt=NOW()
           WHERE i.id=? AND i.sessionId=? AND i.status='matched' AND s.organizationId <=> ? AND a.organizationId <=> ? AND s.status IN ('draft','in_review','reopened')`,
          [input.itemId, input.sessionId, orgId, orgId],
        );
        if (!result.affectedRows) throw new TRPCError({ code: "NOT_FOUND", message: "Matched transaction not found." });
        await connection.execute("DELETE FROM reconciliation_match_allocations WHERE itemId=?", [input.itemId]);
        await writeAuditEvent(connection, {
          organizationId: orgId,
          sessionId: input.sessionId,
          itemId: input.itemId,
          actorUserId: ctx.user.id,
          eventType: "transaction_unmatched",
        });
        await connection.commit();
        return { success: true };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }),

  complete: updateProcedure
    .input(z.string().min(1))
    .mutation(async ({ input: sessionId, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const orgId = organizationIdFor(ctx);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [sessions] = await connection.execute<any[]>(
          `SELECT * FROM reconciliation_sessions WHERE id=? AND organizationId <=> ? AND status IN ('draft','in_review','reopened') LIMIT 1 FOR UPDATE`,
          [sessionId, orgId],
        );
        const session = sessions[0];
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Open reconciliation not found." });
        const [items] = await connection.execute<any[]>(
          `SELECT i.id, i.status, i.sourceType, i.sourceId, bt.credit, bt.debit, bt.id AS transactionId
           FROM reconciliation_items i JOIN bankTransactions bt ON bt.id=i.bankTransactionId WHERE i.sessionId=? FOR UPDATE`,
          [sessionId],
        );
        if (!items.length || items.some((item: any) => item.status !== "matched")) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Match every statement transaction before completing reconciliation." });
        }
        const movement = items.reduce((total: number, item: any) => total + Number(item.credit || 0) - Number(item.debit || 0), 0);
        const bookBalance = Number(session.openingBalance || 0) + movement;
        const difference = Number(session.statementBalance || 0) - bookBalance;
        if (difference !== 0) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: `The reconciliation still has a balance difference of ${difference}.` });
        }
        for (const item of items) {
          await connection.execute(
            `UPDATE bankTransactions SET isReconciled=1, reconciledDate=NOW(), reconciledBy=?, matchedTransactionId=? WHERE id=?`,
            [ctx.user.id, item.sourceId, item.transactionId],
          );
        }
        await connection.execute(
          `UPDATE reconciliation_sessions SET status='approved', bookBalance=?, difference=0, approvedBy=?, approvedAt=NOW(), updatedAt=NOW()
           WHERE id=? AND organizationId <=> ?`,
          [bookBalance, ctx.user.id, sessionId, orgId],
        );
        await writeAuditEvent(connection, {
          organizationId: orgId,
          sessionId,
          actorUserId: ctx.user.id,
          eventType: "reconciliation_completed",
          details: { matchedCount: items.length, bookBalance, statementBalance: Number(session.statementBalance) },
        });
        await connection.commit();
        return { success: true, bookBalance };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }),

  update: updateProcedure
    .input(z.object({ id: z.string().min(1), notes: z.string().max(2000) }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const orgId = organizationIdFor(ctx);
      const [result] = await pool.execute<any>(
        `UPDATE reconciliation_sessions SET notes=?, updatedAt=NOW()
         WHERE id=? AND organizationId <=> ? AND status IN ('draft','in_review','reopened')`,
        [input.notes || null, input.id, orgId],
      );
      if (!result.affectedRows) {
        const [rows] = await pool.execute<any[]>(
          `SELECT id FROM reconciliation_sessions WHERE id=? AND organizationId <=> ? AND status IN ('draft','in_review','reopened') LIMIT 1`,
          [input.id, orgId],
        );
        if (!rows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Open reconciliation not found." });
      }
      return { success: true, id: input.id };
    }),

  reopen: updateProcedure
    .input(z.string().min(1))
    .mutation(async ({ input: sessionId, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const orgId = organizationIdFor(ctx);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [sessions] = await connection.execute<any[]>(
          `SELECT s.id FROM reconciliation_sessions s JOIN bankAccounts a ON a.id=s.bankAccountId
           WHERE s.id=? AND s.organizationId <=> ? AND a.organizationId <=> ? AND s.status='approved' LIMIT 1 FOR UPDATE`,
          [sessionId, orgId, orgId],
        );
        if (!sessions.length) throw new TRPCError({ code: "NOT_FOUND", message: "Completed reconciliation not found." });
        await connection.execute(
          `UPDATE bankTransactions bt JOIN reconciliation_items i ON i.bankTransactionId=bt.id
           SET bt.isReconciled=0, bt.reconciledDate=NULL, bt.reconciledBy=NULL, bt.matchedTransactionId=NULL
           WHERE i.sessionId=?`,
          [sessionId],
        );
        await connection.execute(
          `UPDATE reconciliation_sessions SET status='reopened', approvedBy=NULL, approvedAt=NULL, updatedAt=NOW()
           WHERE id=? AND organizationId <=> ? AND status='approved'`,
          [sessionId, orgId],
        );
        await writeAuditEvent(connection, {
          organizationId: orgId,
          sessionId,
          actorUserId: ctx.user.id,
          eventType: "reconciliation_reopened",
        });
        await connection.commit();
        return { success: true, id: sessionId };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }),

  delete: deleteProcedure
    .input(z.string().min(1))
    .mutation(async ({ input: sessionId, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const orgId = organizationIdFor(ctx);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.execute<any>(
          `UPDATE reconciliation_sessions SET status='voided', updatedAt=NOW()
           WHERE id=? AND organizationId <=> ? AND status IN ('draft','in_review','reopened')`,
          [sessionId, orgId],
        );
        if (!result.affectedRows) throw new TRPCError({ code: "NOT_FOUND", message: "Open reconciliation not found." });
        await connection.execute(
          `DELETE bt FROM bankTransactions bt JOIN reconciliation_items i ON i.bankTransactionId=bt.id
           WHERE i.sessionId=? AND bt.isReconciled=0`,
          [sessionId],
        );
        await writeAuditEvent(connection, {
          organizationId: orgId,
          sessionId,
          actorUserId: ctx.user.id,
          eventType: "reconciliation_voided",
        });
        await connection.commit();
        return { success: true, id: sessionId };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }),

  discard: updateProcedure
    .input(z.string().min(1))
    .mutation(async ({ input: sessionId, ctx }) => {
      const pool = getPool();
      if (!pool) throw databaseUnavailable();
      const orgId = organizationIdFor(ctx);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.execute<any>(
          `UPDATE reconciliation_sessions SET status='voided', updatedAt=NOW()
           WHERE id=? AND organizationId <=> ? AND status IN ('draft','in_review','reopened')`,
          [sessionId, orgId],
        );
        if (!result.affectedRows) throw new TRPCError({ code: "NOT_FOUND", message: "Open reconciliation not found." });
        await connection.execute(
          `DELETE bt FROM bankTransactions bt JOIN reconciliation_items i ON i.bankTransactionId=bt.id
           WHERE i.sessionId=? AND bt.isReconciled=0`,
          [sessionId],
        );
        await writeAuditEvent(connection, {
          organizationId: orgId,
          sessionId,
          actorUserId: ctx.user.id,
          eventType: "reconciliation_voided",
        });
        await connection.commit();
        return { success: true };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }),
});
