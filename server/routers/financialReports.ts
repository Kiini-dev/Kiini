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
      if (input.invoiceStatus !== "all") invoicedConditions.push(eq(invoices.status, input.invoiceStatus));
      const invoicedRows: Array<{ amt: number }> = await db
        .select({ amt: invoices.total })
        .from(invoices)
        .leftJoin(users, eq(invoices.createdBy, users.id))
        .where(and(...invoicedConditions, ...(input.departmentId ? [eq(users.department, input.departmentId)] : [])));
      const invoiced = invoicedRows.reduce((sum, row) => sum + (Number(row.amt) || 0), 0);

      const revenueConditions: any[] = [
        eq(payments.status, "completed"),
        gte(payments.paymentDate, start.toISOString()),
        lt(payments.paymentDate, endExclusive.toISOString()),
      ];
      if (ctx.user.organizationId) revenueConditions.push(eq(payments.organizationId, ctx.user.organizationId));
      const revenueRows: Array<{ amt: number }> = await db
        .select({ amt: payments.amount })
        .from(payments)
        .leftJoin(users, eq(payments.createdBy, users.id))
        .where(and(...revenueConditions, ...(input.departmentId ? [eq(users.department, input.departmentId)] : [])));
      const revenue = revenueRows.reduce((sum, row) => sum + (Number(row.amt) || 0), 0);

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
      const otherIncomeRows = input.departmentId ? [] : await db
        .select({
          inflowType: nonSalesInflows.inflowType,
          amountCents: nonSalesInflows.amountCents,
          receivedAt: nonSalesInflows.receivedAt,
          reversedAt: nonSalesInflows.reversedAt,
        })
        .from(nonSalesInflows)
        .where(and(...inflowConditions));
      const { otherIncome, otherIncomeByType } = summarizeNonSalesInflows(otherIncomeRows, start, endExclusive);

      // expenses incurred in range (exclude cancelled)
      const expenseConditions: any[] = [gte(expenses.expenseDate, start.toISOString()), lt(expenses.expenseDate, endExclusive.toISOString()), ne(expenses.status, "rejected")];
      if (ctx.user.organizationId) expenseConditions.push(eq(expenses.organizationId, ctx.user.organizationId));
      if (input.expenseStatus !== "all") expenseConditions.push(eq(expenses.status, input.expenseStatus));
      const expRows: Array<{ amt: number }> = await db
        .select({ amt: expenses.amount })
        .from(expenses)
        .leftJoin(users, eq(expenses.createdBy, users.id))
        .where(and(...expenseConditions, ...(input.departmentId ? [eq(users.department, input.departmentId)] : [])));
      const expensesSum = expRows.reduce((sum, r) => sum + (r.amt || 0), 0);

      const totalIncome = revenue + otherIncome;
      const netProfit = totalIncome - expensesSum;
      const netMarginPercentage = totalIncome === 0 ? 0 : (netProfit / totalIncome) * 100;

      const categoryRows: Array<{ category: string | null; amount: number }> = await db
        .select({ category: expenses.category, amount: expenses.amount })
        .from(expenses)
        .leftJoin(users, eq(expenses.createdBy, users.id))
        .where(and(...expenseConditions, ...(input.departmentId ? [eq(users.department, input.departmentId)] : [])));
      const expenseBreakdown = Object.values(categoryRows.reduce((map, row) => {
        const key = row.category || "Uncategorised";
        map[key] = (map[key] || 0) + (row.amount || 0);
        return map;
      }, {} as Record<string, number>)).map((amount, index) => ({ category: Object.keys(categoryRows.reduce((map, row) => { map[row.category || "Uncategorised"] = true; return map; }, {} as Record<string, boolean>))[index], amount }));
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
      };
    }),

  balanceSheet: createFeatureRestrictedProcedure("reporting:view").query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return {};

    const query = db
      .select({ type: accounts.accountType, balance: accounts.balance })
      .from(accounts);
    const rows: Array<{ type: string; balance: number }> = await query.where(
      ctx.user.organizationId
        ? eq(accounts.organizationId, ctx.user.organizationId)
        : isNull(accounts.organizationId),
    );

    const summary: Record<string, number> = {};
    rows.forEach((r) => {
      if (!summary[r.type]) summary[r.type] = 0;
      summary[r.type] += getNormalBalanceAmount(Number(r.balance || 0), r.type);
    });

    return summary;
  }),
});
