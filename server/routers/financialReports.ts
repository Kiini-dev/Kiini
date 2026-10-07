import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { getNormalBalanceAmount } from "../../shared/accountingBalance";
import { invoices, expenses, payments, users, nonSalesInflows } from "../../drizzle/schema";
import { accounts } from "../../drizzle/schema";
import { and, eq, gte, inArray, isNull, lt, ne, or } from "drizzle-orm";
import { summarizeNonSalesInflows } from "../utils/nonSalesInflowReporting";

export const financialReportsRouter = router({
  profitLoss: createFeatureRestrictedProcedure("reporting:view")
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      departmentId: z.string().optional(),
      invoiceStatus: z.enum(["all", "draft", "sent", "paid", "partial", "overdue", "cancelled"]).default("all"),
      expenseStatus: z.enum(["all", "pending", "approved", "rejected", "paid"]).default("all"),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { revenue: 0, invoiced: 0, expenses: 0, netProfit: 0, netMarginPercentage: 0 };

      const start = new Date(`${input.startDate}T00:00:00.000Z`);
      const endExclusive = new Date(`${input.endDate}T00:00:00.000Z`);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

      const invoicedConditions: any[] = [
        gte(invoices.issueDate, start.toISOString()),
        lt(invoices.issueDate, endExclusive.toISOString()),
        ne(invoices.status, "cancelled"),
      ];
      if (ctx.user.organizationId) invoicedConditions.push(eq(invoices.organizationId, ctx.user.organizationId));
      else invoicedConditions.push(isNull(invoices.organizationId));
      if (input.invoiceStatus !== "all") invoicedConditions.push(eq(invoices.status, input.invoiceStatus));
      const invoicedRows: Array<{
        id: string;
        invoiceNumber: string;
        clientId: string;
        status: string;
        issueDate: string;
        dueDate: string;
        total: number;
        paidAmount: number | null;
      }> = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          clientId: invoices.clientId,
          status: invoices.status,
          issueDate: invoices.issueDate,
          dueDate: invoices.dueDate,
          total: invoices.total,
          paidAmount: invoices.paidAmount,
        })
        .from(invoices)
        .leftJoin(users, eq(invoices.createdBy, users.id))
        .where(and(...invoicedConditions, ...(input.departmentId ? [eq(users.department, input.departmentId)] : [])));
      const invoiced = invoicedRows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);

      const revenueConditions: any[] = [
        eq(payments.status, "completed"),
        gte(payments.paymentDate, start.toISOString()),
        lt(payments.paymentDate, endExclusive.toISOString()),
      ];
      if (ctx.user.organizationId) revenueConditions.push(eq(payments.organizationId, ctx.user.organizationId));
      else revenueConditions.push(isNull(payments.organizationId));
      const revenueRows: Array<{
        id: string;
        invoiceId: string;
        clientId: string;
        amount: number;
        paymentDate: string;
        paymentMethod: string;
        referenceNumber: string | null;
        chartOfAccountId: string | null;
      }> = await db
        .select({
          id: payments.id,
          invoiceId: payments.invoiceId,
          clientId: payments.clientId,
          amount: payments.amount,
          paymentDate: payments.paymentDate,
          paymentMethod: payments.paymentMethod,
          referenceNumber: payments.referenceNumber,
          chartOfAccountId: payments.chartOfAccountId,
        })
        .from(payments)
        .leftJoin(users, eq(payments.createdBy, users.id))
        .where(and(...revenueConditions, ...(input.departmentId ? [eq(users.department, input.departmentId)] : [])));
      const revenue = revenueRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

      const reportStart = start.toISOString().replace("T", " ").substring(0, 19);
      const reportEnd = endExclusive.toISOString().replace("T", " ").substring(0, 19);
      const inflowConditions: any[] = [
        inArray(nonSalesInflows.status, ["posted", "reversed"]),
        inArray(nonSalesInflows.inflowType, ["donation", "other_income"]),
        or(
          and(gte(nonSalesInflows.receivedAt, reportStart), lt(nonSalesInflows.receivedAt, reportEnd)),
          and(gte(nonSalesInflows.reversedAt, reportStart), lt(nonSalesInflows.reversedAt, reportEnd)),
        ),
      ];
      if (ctx.user.organizationId) inflowConditions.push(eq(nonSalesInflows.organizationId, ctx.user.organizationId));
      else inflowConditions.push(isNull(nonSalesInflows.organizationId));
      const otherIncomeRows = input.departmentId ? [] : await db
        .select({
          id: nonSalesInflows.id,
          referenceNumber: nonSalesInflows.referenceNumber,
          description: nonSalesInflows.description,
          inflowType: nonSalesInflows.inflowType,
          amountCents: nonSalesInflows.amountCents,
          currency: nonSalesInflows.currency,
          status: nonSalesInflows.status,
          receivedAt: nonSalesInflows.receivedAt,
          reversedAt: nonSalesInflows.reversedAt,
          journalEntryId: nonSalesInflows.journalEntryId,
          reversalJournalEntryId: nonSalesInflows.reversalJournalEntryId,
        })
        .from(nonSalesInflows)
        .where(and(...inflowConditions));
      const { otherIncome, otherIncomeByType } = summarizeNonSalesInflows(otherIncomeRows, start, endExclusive);

      // expenses incurred in range (exclude cancelled)
      const expenseConditions: any[] = [gte(expenses.expenseDate, start.toISOString()), lt(expenses.expenseDate, endExclusive.toISOString()), ne(expenses.status, "rejected")];
      if (ctx.user.organizationId) expenseConditions.push(eq(expenses.organizationId, ctx.user.organizationId));
      else expenseConditions.push(isNull(expenses.organizationId));
      if (input.expenseStatus !== "all") expenseConditions.push(eq(expenses.status, input.expenseStatus));
      const expRows: Array<{
        id: string;
        expenseNumber: string | null;
        category: string | null;
        vendor: string | null;
        amount: number;
        expenseDate: string;
        description: string | null;
        status: string;
        chartOfAccountId: string | null;
      }> = await db
        .select({
          id: expenses.id,
          expenseNumber: expenses.expenseNumber,
          category: expenses.category,
          vendor: expenses.vendor,
          amount: expenses.amount,
          expenseDate: expenses.expenseDate,
          description: expenses.description,
          status: expenses.status,
          chartOfAccountId: expenses.chartOfAccountId,
        })
        .from(expenses)
        .leftJoin(users, eq(expenses.createdBy, users.id))
        .where(and(...expenseConditions, ...(input.departmentId ? [eq(users.department, input.departmentId)] : [])));
      const expensesSum = expRows.reduce((sum, row) => sum + (row.amount || 0), 0);

      const totalIncome = revenue + otherIncome;
      const netProfit = totalIncome - expensesSum;
      const netMarginPercentage = totalIncome === 0 ? 0 : (netProfit / totalIncome) * 100;

      const breakdownByCategory = expRows.reduce((map, row) => {
        const key = row.category || "Uncategorised";
        map[key] = (map[key] || 0) + row.amount;
        return map;
      }, {} as Record<string, number>);
      const expenseBreakdown = Object.entries(breakdownByCategory).map(([category, amount]) => ({ category, amount }));
      return {
        revenue,
        otherIncome,
        otherIncomeByType,
        totalIncome,
        invoiced,
        expenses: expensesSum,
        netProfit,
        netMarginPercentage,
        expenseBreakdown,
        invoiceDetails: invoicedRows,
        revenueDetails: revenueRows,
        otherIncomeDetails: otherIncomeRows,
        expenseDetails: expRows,
      };
    }),

  balanceSheet: createFeatureRestrictedProcedure("reporting:view").query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { summary: {}, accounts: [] };

    const query = db
      .select({
        id: accounts.id,
        code: accounts.accountCode,
        name: accounts.accountName,
        type: accounts.accountType,
        balance: accounts.balance,
        isActive: accounts.isActive,
      })
      .from(accounts);
    const rows: Array<{ id: string; code: string; name: string; type: string; balance: number | null; isActive: number | null }> = await query.where(and(
      inArray(accounts.accountType, ["asset", "liability", "equity"]),
      ctx.user.organizationId
        ? eq(accounts.organizationId, ctx.user.organizationId)
        : isNull(accounts.organizationId),
    ));

    const summary: Record<string, number> = {};
    const accountDetails = rows.map((r) => {
      const normalizedBalance = getNormalBalanceAmount(Number(r.balance || 0), r.type);
      if (!summary[r.type]) summary[r.type] = 0;
      summary[r.type] += normalizedBalance;
      return {
        id: r.id,
        code: r.code,
        name: r.name,
        type: r.type,
        balance: normalizedBalance,
        isActive: Boolean(r.isActive),
      };
    });

    return {
      summary,
      accounts: accountDetails.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })),
    };
  }),
});
