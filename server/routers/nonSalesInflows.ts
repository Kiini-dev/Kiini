import { router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getPool } from "../db";
import { v4 as uuidv4 } from "uuid";
import { resolveOrganizationScope } from "../services/organizationScope";

const readProcedure = createFeatureRestrictedProcedure("accounting:read");
const createProcedure = createFeatureRestrictedProcedure("accounting:create");
const reverseProcedure = createFeatureRestrictedProcedure("accounting:edit");

export const nonSalesInflowCreateInput = z.object({
  inflowType: z.enum(["donation", "other_income", "equity_injection", "deferred_loan"]),
  taxStatus: z.enum(["taxable", "tax_exempt", "equity_injection", "deferred_loan"]),
  description: z.string().trim().min(1).max(500),
  amountCents: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cashAccountId: z.string().min(1),
  categoryAccountId: z.string().min(1),
  bankAccountId: z.string().min(1).optional(),
  sourceBankTransactionId: z.string().min(1).optional(),
  usdToOrganizationFxRate: z.number().positive().max(1_000_000).optional(),
  donorName: z.string().trim().max(255).optional(),
  donorTaxId: z.string().trim().max(100).optional(),
  receiptNumber: z.string().trim().max(100).optional(),
  restrictionType: z.string().trim().max(100).optional(),
  investorName: z.string().trim().max(255).optional(),
  equityRound: z.string().trim().max(100).optional(),
  sharesIssued: z.number().nonnegative().optional(),
  lenderName: z.string().trim().max(255).optional(),
  isRepayable: z.boolean().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  maturityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).superRefine((input, context) => {
  if (input.inflowType === "donation") {
    if (input.taxStatus !== "taxable" && input.taxStatus !== "tax_exempt") {
      context.addIssue({ code: "custom", path: ["taxStatus"], message: "Donations must be taxable or tax exempt." });
    }
    if (!input.usdToOrganizationFxRate) {
      context.addIssue({ code: "custom", path: ["usdToOrganizationFxRate"], message: "Enter the USD-to-organization-currency rate used for the donation threshold check." });
    } else if (input.amountCents > Math.round(25_000 * input.usdToOrganizationFxRate) && !input.donorTaxId) {
      context.addIssue({ code: "custom", path: ["donorTaxId"], message: "A donor tax ID is required for donations exceeding USD 250 in organization currency." });
    }
    if (!input.donorName) context.addIssue({ code: "custom", path: ["donorName"], message: "Donor name is required." });
  }
  if (input.inflowType === "other_income" && !["taxable", "tax_exempt"].includes(input.taxStatus)) {
    context.addIssue({ code: "custom", path: ["taxStatus"], message: "Other income must be taxable or tax exempt." });
  }
  if (input.inflowType === "equity_injection") {
    if (input.taxStatus !== "equity_injection") context.addIssue({ code: "custom", path: ["taxStatus"], message: "Equity inflows must use equity-injection tax status." });
    if (!input.investorName) context.addIssue({ code: "custom", path: ["investorName"], message: "Investor name is required." });
  }
  if (input.inflowType === "deferred_loan") {
    if (input.taxStatus !== "deferred_loan") context.addIssue({ code: "custom", path: ["taxStatus"], message: "Loan inflows must use deferred-loan tax status." });
    if (!input.lenderName || input.isRepayable === undefined) {
      context.addIssue({ code: "custom", path: ["lenderName"], message: "Lender name and repayment terms are required." });
    }
  }
  if (input.sourceBankTransactionId && !input.bankAccountId) {
    context.addIssue({ code: "custom", path: ["bankAccountId"], message: "Select the bank account for the statement transaction." });
  }
});

function organizationIdFor(ctx: { user: { organizationId?: string | null; role?: string | null; effectiveRole?: string | null } }) {
  return resolveOrganizationScope(ctx.user).organizationId;
}

function getDbConnection() {
  const pool = getPool();
  if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available." });
  return pool.getConnection();
}

function accountTypeAllowed(inflowType: string, accountType: string) {
  if (inflowType === "equity_injection") return accountType === "equity";
  if (inflowType === "deferred_loan") return accountType === "liability";
  return accountType === "revenue" || accountType === "other income";
}

function toSqlDateTime(date: string) {
  return `${date} 00:00:00`;
}

async function postJournal(
  connection: any,
  input: {
    organizationId: string | null;
    userId: string;
    referenceType: string;
    referenceId: string;
    description: string;
    entryDate: string;
    cashAccountId: string;
    categoryAccountId: string;
    amountCents: number;
    reverse?: boolean;
  },
) {
  const journalEntryId = uuidv4();
  const entryNumber = `${input.referenceType === "non_sales_inflow_reversal" ? "NSR" : "NSI"}-${input.entryDate.replaceAll("-", "")}-${journalEntryId.slice(0, 8).toUpperCase()}`;
  const cashDebit = input.reverse ? 0 : input.amountCents;
  const cashCredit = input.reverse ? input.amountCents : 0;
  const categoryDebit = input.reverse ? input.amountCents : 0;
  const categoryCredit = input.reverse ? 0 : input.amountCents;
  await connection.execute(
    `INSERT INTO journalEntries
     (id, organizationId, entryNumber, entryDate, entryMonth, reference, description, totalAmount,
      referenceType, referenceId, status, postedAt, createdBy, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'posted', NOW(), ?, NOW(), NOW())`,
    [
      journalEntryId,
      input.organizationId,
      entryNumber,
      toSqlDateTime(input.entryDate),
      input.entryDate.slice(0, 7),
      entryNumber,
      input.description,
      input.amountCents / 100,
      input.referenceType,
      input.referenceId,
      input.userId,
    ],
  );
  await connection.execute(
    `INSERT INTO journalEntryLines
     (id, journalEntryId, accountId, debit, credit, description, lineNumber, createdBy, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, NOW()), (?, ?, ?, ?, ?, ?, 2, ?, NOW())`,
    [
      uuidv4(), journalEntryId, input.cashAccountId, cashDebit, cashCredit, input.description, input.userId,
      uuidv4(), journalEntryId, input.categoryAccountId, categoryDebit, categoryCredit, input.description, input.userId,
    ],
  );
  const cashDelta = input.reverse ? -input.amountCents : input.amountCents;
  const categoryDelta = input.reverse ? input.amountCents : -input.amountCents;
  await connection.execute(
    "UPDATE accounts SET balance=COALESCE(balance, 0) + ?, updatedAt=NOW() WHERE id=? AND organizationId <=> ?",
    [cashDelta, input.cashAccountId, input.organizationId],
  );
  await connection.execute(
    "UPDATE accounts SET balance=COALESCE(balance, 0) + ?, updatedAt=NOW() WHERE id=? AND organizationId <=> ?",
    [categoryDelta, input.categoryAccountId, input.organizationId],
  );
  return journalEntryId;
}

export const nonSalesInflowsRouter = router({
  getConfiguration: readProcedure.query(async ({ ctx }) => {
    const organizationId = organizationIdFor(ctx);
    if (!organizationId) return { currency: "KES", donationTaxIdThresholdUsd: 250 };
    const connection = await getDbConnection();
    try {
      const [rows] = await connection.execute<any[]>(
        "SELECT currency FROM organizations WHERE id=? AND isActive=1 AND isArchived=0 LIMIT 1",
        [organizationId],
      );
      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found or inactive." });
      return { currency: String(rows[0].currency || "KES").toUpperCase(), donationTaxIdThresholdUsd: 250 };
    } finally {
      connection.release();
    }
  }),

  list: readProcedure
    .input(z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      inflowType: z.enum(["donation", "other_income", "equity_injection", "deferred_loan"]).optional(),
      status: z.enum(["posted", "reversed"]).optional(),
      limit: z.number().int().min(1).max(500).default(100),
    }).optional())
    .query(async ({ input, ctx }) => {
      const connection = await getDbConnection();
      try {
        const filters = ["organizationId <=> ?"];
        const params: (string | number | null)[] = [organizationIdFor(ctx)];
        if (input?.startDate) { filters.push("receivedAt >= ?"); params.push(toSqlDateTime(input.startDate)); }
        if (input?.endDate) { filters.push("receivedAt < DATE_ADD(?, INTERVAL 1 DAY)"); params.push(toSqlDateTime(input.endDate)); }
        if (input?.inflowType) { filters.push("inflowType=?"); params.push(input.inflowType); }
        if (input?.status) { filters.push("status=?"); params.push(input.status); }
        params.push(input?.limit ?? 100);
        const [rows] = await connection.execute<any[]>(
          `SELECT * FROM nonSalesInflows WHERE ${filters.join(" AND ")} ORDER BY receivedAt DESC, createdAt DESC LIMIT ?`,
          params,
        );
        return rows.map((row: any) => ({
          ...row,
          amountCents: Number(row.amountCents),
          usdToOrganizationFxRate: row.usdToOrganizationFxRate == null ? null : Number(row.usdToOrganizationFxRate),
          complianceMetadata: typeof row.complianceMetadata === "string" ? JSON.parse(row.complianceMetadata) : row.complianceMetadata,
        }));
      } finally {
        connection.release();
      }
    }),

  listUncategorizedDeposits: readProcedure
    .input(z.object({ bankAccountId: z.string().optional(), limit: z.number().int().min(1).max(500).default(200) }).optional())
    .query(async ({ input, ctx }) => {
      const connection = await getDbConnection();
      try {
        const organizationId = organizationIdFor(ctx);
        const params: (string | number | null)[] = [organizationId];
        const accountFilter = input?.bankAccountId ? "AND ba.id=?" : "";
        if (input?.bankAccountId) params.push(input.bankAccountId);
        params.push(input?.limit ?? 200);
        const [rows] = await connection.execute<any[]>(
          `SELECT bt.id, bt.bankAccountId, bt.transactionDate, bt.description, bt.referenceNumber, bt.credit,
                  ba.accountName AS bankAccountName, ba.currency
           FROM bankTransactions bt
           JOIN bankAccounts ba ON ba.id=bt.bankAccountId
           LEFT JOIN nonSalesInflows nsi ON nsi.sourceBankTransactionId=bt.id
           WHERE ba.organizationId=? AND ba.isActive=1 AND bt.credit>0 AND bt.isReconciled=0
             AND nsi.id IS NULL ${accountFilter}
           ORDER BY bt.transactionDate DESC
           LIMIT ?`,
          params,
        );
        return rows.map((row: any) => ({
          ...row,
          credit: Number(row.credit),
        }));
      } finally {
        connection.release();
      }
    }),

  getById: readProcedure
    .input(z.string().min(1))
    .query(async ({ input, ctx }) => {
      const connection = await getDbConnection();
      try {
        const [rows] = await connection.execute<any[]>(
          "SELECT * FROM nonSalesInflows WHERE id=? AND organizationId <=> ? LIMIT 1",
          [input, organizationIdFor(ctx)],
        );
        const row = rows[0];
        if (!row) return null;
        return {
          ...row,
          amountCents: Number(row.amountCents),
          usdToOrganizationFxRate: row.usdToOrganizationFxRate == null ? null : Number(row.usdToOrganizationFxRate),
          complianceMetadata: typeof row.complianceMetadata === "string" ? JSON.parse(row.complianceMetadata) : row.complianceMetadata,
        };
      } finally {
        connection.release();
      }
    }),

  create: createProcedure
    .input(nonSalesInflowCreateInput)
    .mutation(async ({ input, ctx }) => {
      const organizationId = organizationIdFor(ctx);
      const connection = await getDbConnection();
      const id = uuidv4();
      try {
        await connection.beginTransaction();
        const [organizations] = await connection.execute<any[]>(
          "SELECT currency FROM organizations WHERE id=? AND isActive=1 AND isArchived=0 LIMIT 1",
          [organizationId],
        );
        const organization = organizations[0];
        if (organizationId && !organization) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found or inactive." });
        const currency = String(organization?.currency || "KES").toUpperCase();
        const [accountRows] = await connection.execute<any[]>(
          "SELECT id, accountType FROM accounts WHERE organizationId <=> ? AND isActive=1 AND id IN (?, ?) FOR UPDATE",
          [organizationId, input.cashAccountId, input.categoryAccountId],
        );
        const cashAccount = accountRows.find((account: any) => account.id === input.cashAccountId);
        const categoryAccount = accountRows.find((account: any) => account.id === input.categoryAccountId);
        if (!cashAccount || cashAccount.accountType !== "asset") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Choose an active asset account for the cash or bank debit." });
        }
        if (!categoryAccount || !accountTypeAllowed(input.inflowType, categoryAccount.accountType)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "The selected category account does not match the inflow classification." });
        }
        if (input.cashAccountId === input.categoryAccountId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cash and category accounts must be different." });
        }
        if (input.bankAccountId) {
          const [bankRows] = await connection.execute<any[]>(
            "SELECT id FROM bankAccounts WHERE id=? AND organizationId <=> ? AND isActive=1 LIMIT 1",
            [input.bankAccountId, organizationId],
          );
          if (!bankRows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Bank account not found." });
        }
        if (input.sourceBankTransactionId) {
          const [statementRows] = await connection.execute<any[]>(
            `SELECT bt.id, bt.credit, bt.transactionDate, bt.bankAccountId
             FROM bankTransactions bt JOIN bankAccounts ba ON ba.id=bt.bankAccountId
             WHERE bt.id=? AND ba.organizationId <=> ? AND bt.isReconciled=0 AND ba.id=? LIMIT 1 FOR UPDATE`,
            [input.sourceBankTransactionId, organizationId, input.bankAccountId],
          );
          const statementRow = statementRows[0];
          if (!statementRow || Number(statementRow.credit || 0) !== input.amountCents) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "The selected statement deposit is no longer available or its amount does not match." });
          }
        }
        const [duplicateRows] = await connection.execute<any[]>(
          "SELECT id FROM nonSalesInflows WHERE sourceBankTransactionId=? LIMIT 1",
          [input.sourceBankTransactionId ?? null],
        );
        if (input.sourceBankTransactionId && duplicateRows.length) {
          throw new TRPCError({ code: "CONFLICT", message: "This bank deposit has already been categorized." });
        }

        const complianceMetadata = {
          donorName: input.donorName ?? null,
          donorTaxId: input.donorTaxId ?? null,
          receiptNumber: input.receiptNumber ?? null,
          restrictionType: input.restrictionType ?? null,
          investorName: input.investorName ?? null,
          equityRound: input.equityRound ?? null,
          sharesIssued: input.sharesIssued ?? null,
          lenderName: input.lenderName ?? null,
          isRepayable: input.isRepayable ?? null,
          interestRate: input.interestRate ?? null,
          maturityDate: input.maturityDate ?? null,
        };
        const journalEntryId = await postJournal(connection, {
          organizationId,
          userId: ctx.user.id,
          referenceType: "non_sales_inflow",
          referenceId: id,
          description: input.description,
          entryDate: input.receivedAt,
          cashAccountId: input.cashAccountId,
          categoryAccountId: input.categoryAccountId,
          amountCents: input.amountCents,
        });
        const referenceNumber = `NSI-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${id.slice(0, 8).toUpperCase()}`;
        await connection.execute(
          `INSERT INTO nonSalesInflows
           (id, organizationId, referenceNumber, inflowType, status, description, amountCents, currency,
            usdToOrganizationFxRate, taxStatus, cashAccountId, categoryAccountId, bankAccountId,
            sourceBankTransactionId, complianceMetadata, receivedAt, journalEntryId, createdBy, createdAt)
           VALUES (?, ?, ?, ?, 'posted', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            id, organizationId, referenceNumber, input.inflowType, input.description, input.amountCents,
            currency, input.usdToOrganizationFxRate ?? null, input.taxStatus, input.cashAccountId,
            input.categoryAccountId, input.bankAccountId ?? null, input.sourceBankTransactionId ?? null,
            JSON.stringify(complianceMetadata), toSqlDateTime(input.receivedAt), journalEntryId, ctx.user.id,
          ],
        );
        await connection.commit();
        return { id, referenceNumber, journalEntryId, currency, amountCents: input.amountCents };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }),

  reverse: reverseProcedure
    .input(z.object({ id: z.string().min(1), reason: z.string().trim().min(1).max(500) }))
    .mutation(async ({ input, ctx }) => {
      const organizationId = organizationIdFor(ctx);
      const connection = await getDbConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.execute<any[]>(
          "SELECT * FROM nonSalesInflows WHERE id=? AND organizationId <=> ? LIMIT 1 FOR UPDATE",
          [input.id, organizationId],
        );
        const inflow = rows[0];
        if (!inflow) throw new TRPCError({ code: "NOT_FOUND", message: "Inflow not found." });
        if (inflow.status !== "posted") throw new TRPCError({ code: "CONFLICT", message: "Only posted inflows can be reversed." });
        const reversedAt = new Date().toISOString().replace("T", " ").slice(0, 19);
        const reversalJournalEntryId = await postJournal(connection, {
          organizationId,
          userId: ctx.user.id,
          referenceType: "non_sales_inflow_reversal",
          referenceId: inflow.id,
          description: `Reversal of ${inflow.referenceNumber}: ${input.reason}`,
          entryDate: reversedAt.slice(0, 10),
          cashAccountId: inflow.cashAccountId,
          categoryAccountId: inflow.categoryAccountId,
          amountCents: Number(inflow.amountCents),
          reverse: true,
        });
        await connection.execute(
          `UPDATE nonSalesInflows SET status='reversed', reversalJournalEntryId=?, reversedAt=?, reversedBy=?, reversalReason=?
           WHERE id=? AND organizationId <=> ? AND status='posted'`,
          [reversalJournalEntryId, reversedAt, ctx.user.id, input.reason, inflow.id, organizationId],
        );
        await connection.commit();
        return { success: true, reversalJournalEntryId };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }),
});
