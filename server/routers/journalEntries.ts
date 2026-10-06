import { z } from "zod";
import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { getDb, logActivity } from "../db";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, gte, isNull, lte, like, sql, or, between } from "drizzle-orm";
import { journalEntries, journalEntryLines, accounts } from "../../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { getAccountBalanceSide, getNormalBalanceAmount } from "../../shared/accountingBalance";

const readProcedure = createFeatureRestrictedProcedure("accounting:view");
const writeProcedure = createFeatureRestrictedProcedure("accounting:edit");
const approveProcedure = createFeatureRestrictedProcedure("accounting:approve");
const exportProcedure = createFeatureRestrictedProcedure("accounting:export");
export const journalOrganizationScope = (organizationId?: string | null) =>
  organizationId
    ? eq((journalEntries as any).organizationId, organizationId)
    : isNull((journalEntries as any).organizationId);
const accountOrganizationScope = (organizationId?: string | null) =>
  organizationId
    ? eq(accounts.organizationId, organizationId)
    : isNull(accounts.organizationId);

async function ensureAccountsBelongToOrganization(
  db: any,
  accountIds: string[],
  organizationId?: string | null,
) {
  const uniqueAccountIds = [...new Set(accountIds)];
  const existingAccounts = await db
    .select()
    .from(accounts)
    .where(and(
      accountOrganizationScope(organizationId),
      or(...uniqueAccountIds.map(id => eq(accounts.id, id)))
    ));

  if (existingAccounts.length !== uniqueAccountIds.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "One or more accounts do not exist or do not belong to your organization",
    });
  }
}

// ============================================================================
// ENHANCED VALIDATION SCHEMAS
// ============================================================================

const lineSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  debit: z.number().min(0, "Debit must be non-negative").default(0),
  credit: z.number().min(0, "Credit must be non-negative").default(0),
  description: z.string().optional(),
}).refine(
  (line) => !(line.debit > 0 && line.credit > 0),
  "A line cannot have both debit and credit amounts"
);

const createEntrySchema = z.object({
  entryDate: z.string().datetime().refine(d => new Date(d) <= new Date(), "Entry date cannot be in the future"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  referenceType: z.enum(["invoice", "expense", "payment", "manual", "adjustment"]).optional(),
  referenceId: z.string().optional(),
  lines: z.array(lineSchema).min(2, "At least 2 lines required"),
}).refine(
  (data) => {
    const totalDebit = data.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = data.lines.reduce((s, l) => s + l.credit, 0);
    return totalDebit === totalCredit;
  },
  { message: "Total debits must equal total credits" }
).refine(
  (data) => data.lines.reduce((s, l) => s + l.debit, 0) > 0,
  { message: "Entry must have non-zero amounts" }
);

const advancedFilterSchema = z.object({
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  accountIds: z.array(z.string()).optional(),
  referenceTypes: z.array(z.string()).optional(),
  status: z.enum(["pending", "approved", "posted"]).optional(),
  limit: z.number().min(1).max(500).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(["date", "amount", "description"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Log journal entry changes for audit trail
 */
async function logEntryChange(
  db: any,
  entryId: string,
  action: "create" | "update" | "approve" | "post" | "reverse" | "delete",
  userId: string,
  changes?: Record<string, any>
) {
  try {
    // This will be stored in your auditLog table when implemented
    console.log(`[AUDIT] Journal Entry ${action}:`, {
      entryId,
      action,
      userId,
      timestamp: new Date().toISOString(),
      changes,
    });
  } catch (err) {
    console.warn("Failed to log entry change:", err);
  }
}

export const journalEntriesRouter = router({
  /**
   * Advanced list with filtering, sorting, and pagination
   */
  list: readProcedure
    .input(advancedFilterSchema.optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { entries: [], total: 0, hasMore: false };

      const filters: any[] = [];
      const orgId = ctx.user?.organizationId;
      const journalEntriesAny = journalEntries as any;

      // Org isolation
      filters.push(journalOrganizationScope(orgId));

      // Text search
      if (input?.search) {
        filters.push(or(
          like(journalEntries.description, `%${input.search}%`),
          like(journalEntriesAny.entryNumber, `%${input.search}%`),
          like(journalEntriesAny.reference, `%${input.search}%`)
        ));
      }

      // Date range
      if (input?.startDate && input?.endDate) {
        filters.push(between(journalEntries.entryDate, input.startDate, input.endDate));
      } else if (input?.startDate) {
        filters.push(gte(journalEntries.entryDate, input.startDate));
      } else if (input?.endDate) {
        filters.push(lte(journalEntries.entryDate, input.endDate));
      }

      // Status filter
      if (input?.status) {
        filters.push(eq((journalEntries as any).status, input.status));
      }

      // Reference type filter
      if (input?.referenceTypes && input.referenceTypes.length > 0) {
        filters.push(or(...input.referenceTypes.map(rt => eq((journalEntries as any).referenceType, rt))));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      // Get paginated results
      const orderByCol = input?.sortBy === "amount" 
        ? (journalEntries as any).totalAmount ?? journalEntries.entryDate
        : input?.sortBy === "description"
          ? journalEntries.description
          : journalEntries.entryDate;

      const orderDirection = input?.sortOrder === "asc" ? "ASC" : "DESC";

      const rows = await db
        .select()
        .from(journalEntries)
        .where(where)
        .orderBy(orderByCol)
        .limit(limit)
        .offset(offset);

      const [countRes] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(journalEntries)
        .where(where);

      const total = Number(countRes?.count ?? rows.length);
      const hasMore = offset + limit < total;

      return {
        entries: rows,
        total,
        hasMore,
        limit,
        offset,
        pageCount: Math.ceil(total / limit),
      };
    }),

  /**
   * Get single entry with all lines
   */
  getById: readProcedure
    .input(z.string().min(1, "Entry ID required"))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const orgId = ctx.user?.organizationId;
      const where = and(eq(journalEntries.id, input), journalOrganizationScope(orgId));

      const [entry] = await db.select().from(journalEntries).where(where).limit(1);
      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Journal entry not found",
        });
      }

      const lines = await db
        .select()
        .from(journalEntryLines)
        .where(eq(journalEntryLines.journalEntryId, input));

      return { ...entry, lines };
    }),

  /**
   * Create new journal entry with comprehensive validation
   */
  create: writeProcedure
    .input(createEntrySchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      try {
        // Verify all accounts exist and belong to organization
        const accountIds = input.lines.map(l => l.accountId);
        await ensureAccountsBelongToOrganization(db, accountIds, ctx.user.organizationId);

        // Generate entry number
        const now = new Date();
        const prefix = `JE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
        const [last] = await db
          .select({ entryNumber: journalEntries.entryNumber })
          .from(journalEntries)
          .where(and(
            like(journalEntries.entryNumber, `${prefix}%`),
            journalOrganizationScope(ctx.user.organizationId)
          ))
          .orderBy(desc(journalEntries.entryNumber))
          .limit(1);

        const seq = last ? parseInt(last.entryNumber.slice(-4)) + 1 : 1;
        const entryNumber = `${prefix}-${String(seq).padStart(4, "0")}`;

        const totalAmount = input.lines.reduce((s, l) => s + l.debit, 0);
        const entryId = uuidv4();
        const now_formatted = now.toISOString();

        // Insert journal entry
        await db.insert(journalEntries).values({
          id: entryId,
          organizationId: ctx.user.organizationId,
          entryNumber,
          entryDate: input.entryDate,
          entryMonth: input.entryDate.substring(0, 7), // YYYY-MM
          reference: input.referenceId || entryNumber,
          description: input.description,
          totalAmount,
          status: "pending_approval",
          createdBy: ctx.user.id,
          createdAt: now_formatted,
          updatedAt: now_formatted,
        } as any);

        // Insert line items
        for (let i = 0; i < input.lines.length; i++) {
          const line = input.lines[i];
          const lineId = uuidv4();

          await db.insert(journalEntryLines).values({
            id: lineId,
            journalEntryId: entryId,
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit,
            description: line.description || null,
            lineNumber: i + 1,
            createdBy: ctx.user.id,
            createdAt: now_formatted,
          } as any);
        }

        // Log activity
        await logEntryChange(db, entryId, "create", ctx.user.id, {
          entryNumber,
          totalAmount,
          lineCount: input.lines.length,
        });

        return {
          success: true,
          id: entryId,
          entryNumber,
          message: `Journal entry ${entryNumber} created successfully and is pending approval`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[JournalEntries] Create error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create journal entry",
        });
      }
    }),

  /**
   * Bulk create multiple journal entries at once
   * Useful for batch imports or recurring entries
   */
  createBatch: writeProcedure
    .input(z.array(createEntrySchema).min(1).max(100))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const results = [];
      const errors = [];

      for (let i = 0; i < input.length; i++) {
        try {
          const entryInput = input[i];
          await ensureAccountsBelongToOrganization(
            db,
            entryInput.lines.map(line => line.accountId),
            ctx.user.organizationId,
          );
          const totalAmount = entryInput.lines.reduce((s, l) => s + l.debit, 0);
          const now = new Date();
          const entryId = uuidv4();
          const entryNumber = `JE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${i.toString().padStart(4, "0")}`;

          await db.insert(journalEntries).values({
            id: entryId,
            organizationId: ctx.user.organizationId,
            entryNumber,
            entryDate: entryInput.entryDate,
            entryMonth: entryInput.entryDate.substring(0, 7),
            reference: entryInput.referenceId || entryNumber,
            description: entryInput.description,
            totalAmount,
            status: "pending_approval",
            createdBy: ctx.user.id,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          } as any);

          for (let j = 0; j < entryInput.lines.length; j++) {
            const line = entryInput.lines[j];
            await db.insert(journalEntryLines).values({
              id: uuidv4(),
              journalEntryId: entryId,
              accountId: line.accountId,
              debit: line.debit,
              credit: line.credit,
              description: line.description || null,
              lineNumber: j + 1,
              createdBy: ctx.user.id,
              createdAt: now.toISOString(),
            } as any);
          }

          results.push({ success: true, entryId, entryNumber, index: i });
        } catch (error) {
          errors.push({
            success: false,
            index: i,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return {
        success: errors.length === 0,
        created: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
        message: `${results.length} entries created successfully${errors.length > 0 ? `, ${errors.length} failed` : ""}`,
      };
    }),

  /**
   * Approve/reject pending journal entries (with optional approval comments)
   */
  approveEntry: approveProcedure
    .input(z.object({
      entryId: z.string(),
      approved: z.boolean(),
      comments: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      try {
        const [entry] = await db
          .select()
          .from(journalEntries)
          .where(and(
            eq(journalEntries.id, input.entryId),
            journalOrganizationScope(ctx.user.organizationId)
          ))
          .limit(1);

        if (!entry) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Journal entry not found" });
        }

        if (entry.status !== "pending_approval") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot approve entry with status: ${entry.status}`,
          });
        }

        const newStatus = input.approved ? "approved" : "rejected";
        const now = new Date().toISOString();

        await db
          .update(journalEntries)
          .set({
            status: newStatus,
            approvedBy: ctx.user.id,
            approvedAt: now,
            updatedAt: now,
          })
          .where(and(eq(journalEntries.id, input.entryId), journalOrganizationScope(ctx.user.organizationId)));

        await logEntryChange(db, input.entryId, "approve", ctx.user.id, {
          approved: input.approved,
          comments: input.comments,
        });

        return {
          success: true,
          entryId: input.entryId,
          newStatus,
          message: `Entry ${input.approved ? "approved" : "rejected"} successfully`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to approve/reject entry",
        });
      }
    }),

  /**
   * Get account balance as of a specific date
   */
  getAccountBalance: readProcedure
    .input(z.object({
      accountId: z.string(),
      asOfDate: z.string().optional(), // YYYY-MM-DD
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { accountId: input.accountId, balance: 0, debit: 0, credit: 0 };

      const [account] = await db.select({ accountType: accounts.accountType })
        .from(accounts)
        .where(and(eq(accounts.id, input.accountId), accountOrganizationScope(ctx.user.organizationId)))
        .limit(1);
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Chart of Accounts entry not found." });

      const dateFilter = input.asOfDate
        ? lte(journalEntries.entryDate, input.asOfDate)
        : undefined;

      const [result] = await db
        .select({
          totalDebit: sql<number>`COALESCE(SUM(${journalEntryLines.debit}), 0)`,
          totalCredit: sql<number>`COALESCE(SUM(${journalEntryLines.credit}), 0)`,
        })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(and(
          eq(journalEntryLines.accountId, input.accountId),
          journalOrganizationScope(ctx.user.organizationId),
          eq((journalEntries as any).status, "posted"),
          dateFilter
        ));

      const debit = Number(result?.totalDebit ?? 0);
      const credit = Number(result?.totalCredit ?? 0);
      const signedBalance = debit - credit;

      return {
        accountId: input.accountId,
        asOfDate: input.asOfDate || new Date().toISOString().split("T")[0],
        debit,
        credit,
        balance: getNormalBalanceAmount(signedBalance, account.accountType),
        balanceSide: getAccountBalanceSide(signedBalance, account.accountType),
      };
    }),

  /**
   * Get account aging (balance breakdown by age)
   */
  getAccountAging: readProcedure
    .input(z.object({
      accountId: z.string(),
      periodMonths: z.number().default(12),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { aging: [] };

      const now = new Date();
      const periods = [];
      const [account] = await db.select({ accountType: accounts.accountType })
        .from(accounts)
        .where(and(eq(accounts.id, input.accountId), accountOrganizationScope(ctx.user.organizationId)))
        .limit(1);
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Chart of Accounts entry not found." });

      for (let i = 0; i < input.periodMonths; i++) {
        const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().split("T")[0];
        const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0).toISOString().split("T")[0];

        const [result] = await db
          .select({
            totalDebit: sql<number>`COALESCE(SUM(${journalEntryLines.debit}), 0)`,
            totalCredit: sql<number>`COALESCE(SUM(${journalEntryLines.credit}), 0)`,
          })
          .from(journalEntryLines)
          .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
          .where(and(
            eq(journalEntryLines.accountId, input.accountId),
            journalOrganizationScope(ctx.user.organizationId),
            gte(journalEntries.entryDate, startDate),
            lte(journalEntries.entryDate, endDate),
            eq((journalEntries as any).status, "posted")
          ));

        const debit = Number(result?.totalDebit ?? 0);
        const credit = Number(result?.totalCredit ?? 0);
        const signedBalance = debit - credit;

        periods.push({
          month: startDate.substring(0, 7),
          startDate,
          endDate,
          debit,
          credit,
          balance: getNormalBalanceAmount(signedBalance, account.accountType),
          balanceSide: getAccountBalanceSide(signedBalance, account.accountType),
        });
      }

      return { accountId: input.accountId, aging: periods };
    }),

  /**
   * Reverse a journal entry (create offsetting entry)
   */
  reverseEntry: writeProcedure
    .input(z.object({
      entryId: z.string(),
      reversalDate: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      try {
        const [originalEntry] = await db
          .select()
          .from(journalEntries)
          .where(and(eq(journalEntries.id, input.entryId), journalOrganizationScope(ctx.user.organizationId)))
          .limit(1);

        if (!originalEntry) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Entry not found" });
        }

        // Get original lines
        const originalLines = await db
          .select()
          .from(journalEntryLines)
          .where(eq(journalEntryLines.journalEntryId, input.entryId));

        // Create reversal entry with swapped debit/credit
        const reversalId = uuidv4();
        const now = new Date();
        const reversalNumber = `JE-REV-${originalEntry.entryNumber}`;

        await db.insert(journalEntries).values({
          id: reversalId,
          organizationId: ctx.user.organizationId,
          entryNumber: reversalNumber,
          entryDate: input.reversalDate,
          entryMonth: input.reversalDate.substring(0, 7),
          reference: `Reversal of ${originalEntry.entryNumber}`,
          description: `Reversal entry for ${originalEntry.description}${input.reason ? ` - ${input.reason}` : ""}`,
          totalAmount: originalEntry.totalAmount,
          status: "pending_approval",
          createdBy: ctx.user.id,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        } as any);

        // Insert reversed lines (swap debit/credit)
        for (let i = 0; i < originalLines.length; i++) {
          const line = originalLines[i];
          await db.insert(journalEntryLines).values({
            id: uuidv4(),
            journalEntryId: reversalId,
            accountId: line.accountId,
            debit: line.credit, // Swap
            credit: line.debit, // Swap
            description: line.description ? `Reversal: ${line.description}` : null,
            lineNumber: i + 1,
            createdBy: ctx.user.id,
            createdAt: now.toISOString(),
          } as any);
        }

        // Mark original as reversed
        await db
          .update(journalEntries)
          .set({
            status: "reversed",
            reversedAt: now.toISOString(),
            updatedAt: now.toISOString(),
          })
          .where(and(eq(journalEntries.id, input.entryId), journalOrganizationScope(ctx.user.organizationId)));

        await logEntryChange(db, input.entryId, "reverse", ctx.user.id, { reversalId, reason: input.reason });

        return {
          success: true,
          originalEntryId: input.entryId,
          reversalEntryId: reversalId,
          reversalEntryNumber: reversalNumber,
          message: `Entry reversed successfully. Reversal entry created: ${reversalNumber}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reverse entry",
        });
      }
    }),

  delete: writeProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      try {
        const [entry] = await db
          .select()
          .from(journalEntries)
          .where(and(
            eq(journalEntries.id, input),
            journalOrganizationScope(ctx.user.organizationId)
          ))
          .limit(1);

        if (!entry) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Entry not found" });
        }

        if (entry.status !== "pending_approval") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only delete pending entries",
          });
        }

        await db.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, input));
        await db.delete(journalEntries).where(and(eq(journalEntries.id, input), journalOrganizationScope(ctx.user.organizationId)));

        await logEntryChange(db, input, "delete", ctx.user.id);

        return { success: true, message: "Entry deleted successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete entry",
        });
      }
    }),


  // General Ledger — account balances with running totals
  generalLedger: readProcedure
    .input(z.object({
      accountId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { ledger: [] };

      const filters: any[] = [];
      if (input?.accountId) filters.push(eq(journalEntryLines.accountId, input.accountId));
      if (input?.startDate) filters.push(gte(journalEntries.entryDate, input.startDate));
      if (input?.endDate) filters.push(lte(journalEntries.entryDate, input.endDate));
      filters.push(journalOrganizationScope(ctx.user.organizationId));
      const where = and(...filters);

      const rows = await db
        .select({
          lineId: journalEntryLines.id,
          entryId: journalEntries.id,
          entryNumber: journalEntries.entryNumber,
          entryDate: journalEntries.entryDate,
          entryDescription: journalEntries.description,
          accountId: journalEntryLines.accountId,
          debit: journalEntryLines.debit,
          credit: journalEntryLines.credit,
          lineDescription: journalEntryLines.description,
        })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(and(where, eq((journalEntries as any).status, "posted")))
        .orderBy(journalEntries.entryDate, journalEntries.entryNumber);

      return { ledger: rows };
    }),

  // Trial balance — sum of debits/credits per account
  trialBalance: readProcedure
    .input(z.object({
      asOfDate: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { accounts: [], totalDebit: 0, totalCredit: 0 };

      const filters: any[] = [];
      if (input?.asOfDate) filters.push(lte(journalEntries.entryDate, input.asOfDate));
      filters.push(journalOrganizationScope(ctx.user.organizationId));
      const where = and(...filters);

      const rows = await db
        .select({
          accountId: journalEntryLines.accountId,
          totalDebit: sql<number>`COALESCE(SUM(${journalEntryLines.debit}), 0)`,
          totalCredit: sql<number>`COALESCE(SUM(${journalEntryLines.credit}), 0)`,
        })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(where)
        .groupBy(journalEntryLines.accountId);

      // Fetch account names
      const allAccounts = await db.select().from(accounts)
        .where(accountOrganizationScope(ctx.user.organizationId)) as any[];
      const accountMap = new Map<string, any>(allAccounts.map((a: any) => [a.id, a]));

      const result = rows.map((r: any) => ({
        accountId: r.accountId,
        accountName: accountMap.get(r.accountId)?.accountName ?? "Unknown",
        accountCode: accountMap.get(r.accountId)?.accountCode ?? "",
        accountType: accountMap.get(r.accountId)?.accountType ?? "",
        totalDebit: Number(r.totalDebit),
        totalCredit: Number(r.totalCredit),
        balance: getNormalBalanceAmount(
          Number(r.totalDebit) - Number(r.totalCredit),
          accountMap.get(r.accountId)?.accountType ?? "asset",
        ),
        balanceSide: getAccountBalanceSide(
          Number(r.totalDebit) - Number(r.totalCredit),
          accountMap.get(r.accountId)?.accountType ?? "asset",
        ),
      }));

      return {
        accounts: result,
        totalDebit: result.reduce((s, a) => s + a.totalDebit, 0),
        totalCredit: result.reduce((s, a) => s + a.totalCredit, 0),
      };
    }),

  // Account summary for dashboard
  accountSummary: readProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { assets: 0, liabilities: 0, equity: 0, revenue: 0, expenses: 0 };

    const allAccounts = await db.select().from(accounts)
      .where(accountOrganizationScope(ctx.user.organizationId)) as any[];
    const balances = await db
      .select({
        accountId: journalEntryLines.accountId,
        totalDebit: sql<number>`COALESCE(SUM(${journalEntryLines.debit}), 0)`,
        totalCredit: sql<number>`COALESCE(SUM(${journalEntryLines.credit}), 0)`,
      })
      .from(journalEntryLines)
      .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
      .where(and(journalOrganizationScope(ctx.user.organizationId), eq((journalEntries as any).status, "posted")))
      .groupBy(journalEntryLines.accountId);

    const balMap = new Map<string, number>(balances.map((b: any) => [b.accountId, Number(b.totalDebit) - Number(b.totalCredit)]));
    const summary: Record<string, number> = { assets: 0, liabilities: 0, equity: 0, revenue: 0, expenses: 0 };

    for (const acct of allAccounts) {
      const bal = Number(balMap.get(acct.id) ?? 0);
      const accountType = String(acct.accountType ?? "").toLowerCase();
      const normalBalance = getNormalBalanceAmount(bal, accountType);
      if (accountType.includes("asset")) summary.assets += normalBalance;
      else if (accountType.includes("liabilit")) summary.liabilities += normalBalance;
      else if (accountType.includes("equity")) summary.equity += normalBalance;
      else if (accountType.includes("revenue") || accountType.includes("income")) summary.revenue += normalBalance;
      else if (accountType.includes("expense") || accountType.includes("cost")) summary.expenses += normalBalance;
    }

    return summary;
  }),
});
