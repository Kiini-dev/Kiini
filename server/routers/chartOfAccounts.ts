import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { accounts, expenses, payments } from "../../drizzle/schema";
import { journalEntries, journalEntryLines } from "../../drizzle/schema-extended";
import { eq, and, desc, gte, lte, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { getAccountBalanceSide, getNormalBalanceAmount } from "../../shared/accountingBalance";

// Validation schemas
const accountCodeSchema = z.string().min(1, "Account code is required");
const accountTypeEnum = z.enum(['asset', 'liability', 'equity', 'revenue', 'expense', 'cost of goods sold', 'operating expense', 'capital expenditure', 'other income', 'other expense']);

export const accountOrganizationScope = (organizationId?: string | null) =>
  organizationId ? eq(accounts.organizationId, organizationId) : isNull(accounts.organizationId);

export const chartOfAccountsRouter = router({
  list: createFeatureRestrictedProcedure("chartOfAccounts:read")
    .input(z.object({ 
      limit: z.number().optional(), 
      offset: z.number().optional(),
      type: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return [];
      const orgId = ctx.user.organizationId;
      const activeFilter = eq(accounts.isActive, 1);
      const organizationFilter = accountOrganizationScope(orgId);
      
      let query = database.select().from(accounts).where(
        and(activeFilter, organizationFilter)
      );
      
      if (input?.type && input.type !== 'all') {
        const typeFilter = eq(accounts.accountType, input.type as any);
        query = database
          .select()
          .from(accounts)
          .where(and(typeFilter, activeFilter, organizationFilter)) as any;
      }
      
      return await (query as any)
        .orderBy(desc(accounts.createdAt))
        .limit(input?.limit || 100)
        .offset(input?.offset || 0);
    }),

  getById: createFeatureRestrictedProcedure("chartOfAccounts:read")
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return null;
      const orgId = ctx.user.organizationId;
      const organizationFilter = orgId ? eq(accounts.organizationId, orgId) : isNull(accounts.organizationId);
      const where = and(eq(accounts.id, input.id), organizationFilter);
      const result = await database.select().from(accounts).where(where).limit(1);
      return result[0] || null;
    }),

  getDetails: createFeatureRestrictedProcedure("chartOfAccounts:read")
    .input(z.object({ id: z.string(), months: z.number().int().min(1).max(60).default(12) }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return null;
      const orgId = ctx.user.organizationId;
      const organizationFilter = orgId ? eq(accounts.organizationId, orgId) : isNull(accounts.organizationId);
      const accountWhere = and(eq(accounts.id, input.id), organizationFilter);
      const [account] = await database.select().from(accounts).where(accountWhere).limit(1);
      if (!account) return null;

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - input.months + 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const start = startDate.toISOString().slice(0, 10);
      const end = endDate.toISOString().slice(0, 10);

      const journalConditions: any[] = [
        eq(journalEntryLines.accountId, account.id),
        eq(journalEntries.status, "posted"),
        gte(journalEntries.entryDate, startDate),
        lte(journalEntries.entryDate, endDate),
      ];
      journalConditions.push(orgId ? eq(journalEntries.organizationId, orgId) : isNull(journalEntries.organizationId));
      const journalRows = await database.select({
        id: journalEntryLines.id,
        date: journalEntries.entryDate,
        reference: journalEntries.reference,
        description: journalEntryLines.description,
        entryDescription: journalEntries.description,
        debit: journalEntryLines.debit,
        credit: journalEntryLines.credit,
        status: journalEntries.status,
      }).from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(and(...journalConditions));

      const expenseConditions: any[] = [
        eq(expenses.chartOfAccountId, account.id),
        gte(expenses.expenseDate, start),
        lte(expenses.expenseDate, `${end} 23:59:59`),
      ];
      expenseConditions.push(orgId ? eq(expenses.organizationId, orgId) : isNull(expenses.organizationId));
      const expenseRows = await database.select({
        id: expenses.id,
        date: expenses.expenseDate,
        reference: expenses.expenseNumber,
        description: expenses.description,
        category: expenses.category,
        amount: expenses.amount,
        status: expenses.status,
      }).from(expenses).where(and(...expenseConditions));

      const paymentConditions: any[] = [
        eq(payments.chartOfAccountId, account.id),
        gte(payments.paymentDate, start),
        lte(payments.paymentDate, `${end} 23:59:59`),
      ];
      paymentConditions.push(orgId ? eq(payments.organizationId, orgId) : isNull(payments.organizationId));
      const paymentRows = await database.select({
        id: payments.id,
        date: payments.paymentDate,
        reference: payments.referenceNumber,
        description: payments.notes,
        amount: payments.amount,
        status: payments.status,
        direction: payments.chartOfAccountType,
      }).from(payments).where(and(...paymentConditions));

      const directExpenseIds = new Set(expenseRows.map((row) => row.id));
      const directPaymentIds = new Set(paymentRows.map((row) => row.id));
      const directExpenseReferences = new Set(expenseRows.map((row) => row.reference).filter(Boolean));
      const directPaymentReferences = new Set(paymentRows.map((row) => row.reference).filter(Boolean));
      const uniqueJournalRows = journalRows.filter((row) => {
        if (row.reference && (directExpenseIds.has(row.reference) || directPaymentIds.has(row.reference))) return false;
        if (row.reference && (directExpenseReferences.has(row.reference) || directPaymentReferences.has(row.reference))) return false;
        return true;
      });

      const transactions = [
        ...uniqueJournalRows.map((row) => ({
          id: row.id,
          date: row.date,
          type: "journal" as const,
          reference: row.reference,
          description: row.description || row.entryDescription || "Journal entry",
          status: row.status || "posted",
          debit: Number(row.debit || 0),
          credit: Number(row.credit || 0),
        })),
        ...expenseRows.filter((row) => row.status !== "rejected").map((row) => ({
          id: row.id,
          date: row.date,
          type: "expense" as const,
          reference: row.reference || row.id,
          description: row.description || row.category || "Expense",
          status: row.status,
          debit: Number(row.amount || 0),
          credit: 0,
        })),
        ...paymentRows.filter((row) => row.status !== "failed" && row.status !== "cancelled").map((row) => ({
          id: row.id,
          date: row.date,
          type: "payment" as const,
          reference: row.reference || row.id,
          description: row.description || "Payment",
          status: row.status,
          debit: row.direction === "credit" ? 0 : Number(row.amount || 0),
          credit: row.direction === "credit" ? Number(row.amount || 0) : 0,
        })),
      ].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

      const incomeAccount = account.accountType === "revenue" || account.accountType === "other income";
      const expenditureAccount = ["expense", "operating expense", "cost of goods sold", "capital expenditure", "other expense"].includes(account.accountType);
      const trendByMonth = new Map<string, { month: string; debit: number; credit: number; income: number; expenditure: number }>();
      for (let offset = input.months - 1; offset >= 0; offset--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const month = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
        trendByMonth.set(month, { month, debit: 0, credit: 0, income: 0, expenditure: 0 });
      }

      let totalDebit = 0;
      let totalCredit = 0;
      let totalIncome = 0;
      let totalExpenditure = 0;
      for (const transaction of transactions) {
        const month = new Date(transaction.date).toISOString().slice(0, 7);
        const monthTotals = trendByMonth.get(month);
        if (monthTotals) {
          monthTotals.debit += transaction.debit;
          monthTotals.credit += transaction.credit;
        }
        totalDebit += transaction.debit;
        totalCredit += transaction.credit;
        if (incomeAccount) {
          const income = transaction.credit - transaction.debit;
          totalIncome += income;
          if (monthTotals) monthTotals.income += income;
        }
        if (expenditureAccount) {
          const expenditure = transaction.debit - transaction.credit;
          totalExpenditure += expenditure;
          if (monthTotals) monthTotals.expenditure += expenditure;
        }
      }

      return {
        account,
        totals: {
          balance: getNormalBalanceAmount(Number(account.balance || 0), account.accountType),
          balanceSide: getAccountBalanceSide(Number(account.balance || 0), account.accountType),
          debit: totalDebit,
          credit: totalCredit,
          income: totalIncome,
          expenditure: totalExpenditure,
          netActivity: totalCredit - totalDebit,
          transactionCount: transactions.length,
        },
        monthlyActivity: Array.from(trendByMonth.values()),
        transactions,
      };
    }),

  create: createFeatureRestrictedProcedure("chartOfAccounts:create")
    .input(z.object({
      accountCode: accountCodeSchema,
      accountName: z.string().min(1, "Account name is required").max(100),
      accountType: accountTypeEnum,
      parentAccountId: z.string().nullable().optional(),
      balance: z.number().optional().default(0),
      description: z.string().max(500).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const orgScope = accountOrganizationScope(ctx.user.organizationId);
      
      // Check for duplicate account code
      const existing = await database
        .select()
        .from(accounts)
        .where(and(eq(accounts.accountCode, input.accountCode), eq(accounts.isActive, 1), orgScope))
        .limit(1);
      
      if (existing.length > 0) {
        throw new Error(`Account code '${input.accountCode}' already exists`);
      }

      if (input.parentAccountId) {
        const [parent] = await database.select({ id: accounts.id }).from(accounts)
          .where(and(eq(accounts.id, input.parentAccountId), orgScope, eq(accounts.isActive, 1))).limit(1);
        if (!parent) throw new Error("Parent account not found in the current accounting scope");
      }

      const id = uuidv4();
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      await database.insert(accounts).values({
        id,
        accountCode: input.accountCode,
        accountName: input.accountName,
        accountType: input.accountType,
        parentAccountId: input.parentAccountId || null,
        balance: input.balance,
        description: input.description,
        isActive: 1,
        createdAt: now,
        updatedAt: now,
        organizationId: ctx.user.organizationId ?? null,
      });

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "account_created",
        entityType: "account",
        entityId: id,
        description: `Created account: ${input.accountCode} - ${input.accountName}`,
      });
      
      return { id };
    }),

  update: createFeatureRestrictedProcedure("chartOfAccounts:edit")
    .input(z.object({
      id: z.string(),
      accountCode: accountCodeSchema.optional(),
      accountName: z.string().max(100).optional(),
      accountType: accountTypeEnum.optional(),
      parentAccountId: z.string().nullable().optional(),
      balance: z.number().optional(),
      description: z.string().max(500).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const orgScope = accountOrganizationScope(ctx.user.organizationId);
      
      const existingAccount = await database
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, input.id), orgScope))
        .limit(1);
      
      if (!existingAccount.length) {
        throw new Error("Account not found");
      }

      if (input.accountCode && input.accountCode !== existingAccount[0].accountCode) {
        const duplicate = await database
          .select()
          .from(accounts)
          .where(and(eq(accounts.accountCode, input.accountCode), eq(accounts.isActive, 1), orgScope))
          .limit(1);
        
        if (duplicate.length > 0) {
          throw new Error(`Account code '${input.accountCode}' already exists`);
        }
      }

      const { id, isActive, ...data } = input;
      if (data.parentAccountId) {
        const [parent] = await database.select({ id: accounts.id }).from(accounts)
          .where(and(eq(accounts.id, data.parentAccountId), orgScope, eq(accounts.isActive, 1))).limit(1);
        if (!parent) throw new Error("Parent account not found in the current accounting scope");
      }
      const updateData: any = { ...data };
      if (isActive !== undefined) {
        updateData.isActive = isActive ? 1 : 0;
      }
      
      await database.update(accounts).set(updateData).where(and(eq(accounts.id, id), orgScope));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "account_updated",
        entityType: "account",
        entityId: id,
        description: `Updated account: ${existingAccount[0].accountCode}`,
      });

      return { success: true };
    }),

  validateCanDelete: createFeatureRestrictedProcedure("chartOfAccounts:read")
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const orgScope = accountOrganizationScope(ctx.user.organizationId);
      const where = and(eq(accounts.id, input), orgScope);
      const account = await database
        .select()
        .from(accounts)
        .where(where)
        .limit(1);
      
      if (!account.length) {
        return { canDelete: false, reason: "Account not found" };
      }

      // Check if account is a parent account
      const childAccounts = await database
        .select()
        .from(accounts)
        .where(and(eq(accounts.parentAccountId, input), eq(accounts.isActive, 1), orgScope))
        .limit(1);
      
      if (childAccounts.length > 0) {
        return { 
          canDelete: false, 
          reason: `Cannot delete: This account has ${childAccounts.length} sub-account(s). Please move or delete sub-accounts first.` 
        };
      }

      // Check if account has non-zero balance
      if (account[0].balance !== null && account[0].balance !== 0) {
        return { 
          canDelete: false, 
          reason: `Cannot delete: Account has a balance of ${account[0].balance}. Please reconcile the balance first.` 
        };
      }

      return { canDelete: true, reason: "" };
    }),

  delete: createFeatureRestrictedProcedure("chartOfAccounts:delete")
    .input(z.object({
      id: z.string(),
      force: z.boolean().optional().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const orgScope = accountOrganizationScope(ctx.user.organizationId);
      
      const account = await database
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, input.id), orgScope))
        .limit(1);
      
      if (!account.length) {
        throw new Error("Account not found");
      }

      // Validation checks unless force deletion is enabled
      if (!input.force) {
        // Check if account is a parent account
        const childAccounts = await database
          .select()
          .from(accounts)
          .where(and(eq(accounts.parentAccountId, input.id), eq(accounts.isActive, 1), orgScope));
        
        if (childAccounts.length > 0) {
          throw new Error(`Cannot delete: This account has ${childAccounts.length} sub-account(s). Please move or delete sub-accounts first.`);
        }

        // Check if account has non-zero balance
        if (account[0].balance !== null && account[0].balance !== 0) {
          throw new Error(`Cannot delete: Account has a balance of ${account[0].balance}. Please reconcile the balance first.`);
        }
      }

      // Soft delete
      await database.update(accounts).set({ isActive: 0 }).where(and(eq(accounts.id, input.id), orgScope));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "account_deleted",
        entityType: "account",
        entityId: input.id,
        description: `Deleted account: ${account[0].accountCode} - ${account[0].accountName}${input.force ? ' (force)' : ''}`,
      });

      return { success: true };
    }),

  getSummary: createFeatureRestrictedProcedure("chartOfAccounts:read")
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return {
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0,
        totalRevenue: 0,
        totalExpenses: 0,
      };
      
      const allAccounts = await database.select().from(accounts)
        .where(and(eq(accounts.isActive, 1), accountOrganizationScope(ctx.user.organizationId)));
      
      return {
        totalAssets: allAccounts.filter(a => a.accountType === 'asset').reduce((sum, a) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
        totalLiabilities: allAccounts.filter(a => a.accountType === 'liability').reduce((sum, a) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
        totalEquity: allAccounts.filter(a => a.accountType === 'equity').reduce((sum, a) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
        totalRevenue: allAccounts.filter(a => a.accountType === 'revenue').reduce((sum, a) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
        totalExpenses: allAccounts.filter(a => a.accountType === 'expense').reduce((sum, a) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
        totalCostOfGoodsSold: allAccounts.filter(a => a.accountType === 'cost of goods sold').reduce((sum, a) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
        totalOperatingExpense: allAccounts.filter(a => a.accountType === 'operating expense').reduce((sum, a) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
        totalCapitalExpenditure: allAccounts.filter(a => a.accountType === 'capital expenditure').reduce((sum, a) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
        totalOtherIncome: allAccounts.filter(a => a.accountType === 'other income').reduce((sum, a) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
        totalOtherExpense: allAccounts.filter(a => a.accountType === 'other expense').reduce((sum, a) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
      };
    }),

  getHierarchy: createFeatureRestrictedProcedure("chartOfAccounts:read")
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return [];
      
      const allAccounts = await database.select().from(accounts)
        .where(and(eq(accounts.isActive, 1), accountOrganizationScope(ctx.user.organizationId)));
      
      // Build hierarchical structure
      const buildHierarchy = (items: any[], parentId: string | null = null): any[] => {
        return items
          .filter(item => item.parentAccountId === parentId)
          .map(item => ({
            ...item,
            children: buildHierarchy(items, item.id),
            isParent: allAccounts.some(a => a.parentAccountId === item.id),
          }))
          .sort((a, b) => a.accountCode.localeCompare(b.accountCode));
      };
      
      return buildHierarchy(allAccounts);
    }),

  updateBalance: createFeatureRestrictedProcedure("chartOfAccounts:edit")
    .input(z.object({
      accountId: z.string(),
      amount: z.number(),
      operation: z.enum(['add', 'subtract', 'set']).default('set'),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const orgScope = accountOrganizationScope(ctx.user.organizationId);
      
      const account = await database
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, input.accountId), orgScope))
        .limit(1);
      
      if (!account.length) {
        throw new Error("Account not found");
      }
      
      const currentBalance = account[0].balance || 0;
      let newBalance = currentBalance;
      
      if (input.operation === 'add') {
        newBalance = currentBalance + input.amount;
      } else if (input.operation === 'subtract') {
        newBalance = currentBalance - input.amount;
      } else {
        newBalance = input.amount;
      }
      
      await database.update(accounts).set({ balance: newBalance })
        .where(and(eq(accounts.id, input.accountId), orgScope));
      
      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "account_balance_updated",
        entityType: "account",
        entityId: input.accountId,
        description: `Updated balance for ${account[0].accountCode}: ${input.operation} ${input.amount}, new balance: ${newBalance}`,
      });
      
      return { success: true, newBalance };
    }),

  exportData: createFeatureRestrictedProcedure("chartOfAccounts:read")
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return [];
      
      const orgId = ctx.user.organizationId;
      const where = and(eq(accounts.isActive, 1), accountOrganizationScope(orgId));
      
      const allAccounts = await database
        .select()
        .from(accounts)
        .where(where)
        .orderBy(accounts.accountCode);
      
      // Transform to CSV export format with snake_case field names
      return allAccounts.map(account => ({
        account_code: account.accountCode,
        account_name: account.accountName,
        account_type: account.accountType,
        category: '', // Optional category field
        description: account.description || '',
        parent_account_code: account.parentAccountId ? allAccounts.find(a => a.id === account.parentAccountId)?.accountCode || '' : '',
        is_header_account: false, // Optional field for hierarchy
      }));
    }),
});
