import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { invoices, payments, expenses, projects, nonSalesInflows } from "../../drizzle/schema";
import { eq, and, gte, lte, inArray, lt, or } from "drizzle-orm";
import { summarizeNonSalesInflows } from "../utils/nonSalesInflowReporting";

const readProcedure = createFeatureRestrictedProcedure("reports:financial");

async function getInvoicesByDateRange(startDate: Date, endDate: Date, organizationId?: string) {
  const db = await getDb();
  if (!db) return [];

  const start = startDate.toISOString().replace('T', ' ').substring(0, 19);
  const end = endDate.toISOString().replace('T', ' ').substring(0, 19);

  const conditions: any[] = [gte(invoices.createdAt, start), lte(invoices.createdAt, end)];
  if (organizationId) conditions.push(eq(invoices.organizationId, organizationId));

  return db.select().from(invoices).where(and(...conditions));
}

async function getPaymentsByDateRange(startDate: Date, endDate: Date, organizationId?: string) {
  const db = await getDb();
  if (!db) return [];

  const start = startDate.toISOString().replace('T', ' ').substring(0, 19);
  const end = endDate.toISOString().replace('T', ' ').substring(0, 19);
  const conditions: any[] = [eq(payments.status, "completed"), gte(payments.paymentDate, start), lte(payments.paymentDate, end)];
  if (organizationId) conditions.push(eq(payments.organizationId, organizationId));
  return db.select().from(payments).where(and(...conditions));
}

async function getExpensesByDateRange(startDate: Date, endDate: Date, organizationId?: string) {
  const db = await getDb();
  if (!db) return [];

  const start = startDate.toISOString().replace('T', ' ').substring(0, 19);
  const end = endDate.toISOString().replace('T', ' ').substring(0, 19);

  const conditions: any[] = [gte(expenses.expenseDate, start), lte(expenses.expenseDate, end)];
  if (organizationId) conditions.push(eq(expenses.organizationId, organizationId));

  return db.select().from(expenses).where(and(...conditions));
}

async function getProjectsByDateRange(startDate: Date, endDate: Date, organizationId?: string) {
  const db = await getDb();
  if (!db) return [];

  const start = startDate.toISOString().replace('T', ' ').substring(0, 19);
  const end = endDate.toISOString().replace('T', ' ').substring(0, 19);

  const conditions: any[] = [gte(projects.createdAt, start), lte(projects.createdAt, end)];
  if (organizationId) conditions.push(eq(projects.organizationId, organizationId));

  return db.select().from(projects).where(and(...conditions));
}

async function getExpensesByCategory(startDate: Date, endDate: Date, organizationId?: string) {
  const rows = await getExpensesByDateRange(startDate, endDate, organizationId);
  const grouped: Record<string, { category: string; amount: number; count: number }> = {};
  for (const expense of rows) {
    const category = expense.category || "Uncategorized";
    if (!grouped[category]) {
      grouped[category] = { category, amount: 0, count: 0 };
    }
    grouped[category].amount += expense.amount || 0;
    grouped[category].count += 1;
  }
  return Object.values(grouped);
}

async function getInvoicesByStatus(organizationId: string | undefined, ...statuses: string[]) {
  const db = await getDb();
  if (!db) return [];

  const statusValues = statuses as Array<string>;
  const conditions: any[] = [inArray(invoices.status, statusValues as any)];
  if (organizationId) conditions.push(eq(invoices.organizationId, organizationId));

  return conditions.length > 1
    ? db.select().from(invoices).where(and(...conditions))
    : db.select().from(invoices).where(inArray(invoices.status, statusValues as any));
}

async function getTaxDeductibleExpenses(startDate: Date, endDate: Date, organizationId?: string) {
  const rows = await getExpensesByDateRange(startDate, endDate, organizationId);
  return rows.filter((expense: any) => expense.category && expense.category.toLowerCase() !== "non-deductible");
}

async function getRevenueByClient(limit = 50, organizationId?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(payments.status, "completed")];
  if (organizationId) conditions.push(eq(payments.organizationId, organizationId));
  const rows = await db.select().from(payments).where(and(...conditions));
  const revenue: Record<string, { clientId: string; total: number; invoices: Set<string> }> = {};
  for (const payment of rows) {
    const clientId = payment.clientId || "unknown";
    if (!revenue[clientId]) {
      revenue[clientId] = { clientId, total: 0, invoices: new Set() };
    }
    revenue[clientId].total += payment.amount || 0;
    revenue[clientId].invoices.add(payment.invoiceId);
  }
  return Object.values(revenue)
    .map((row) => ({ ...row, invoices: row.invoices.size }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

async function getRevenueByProject(limit = 50, organizationId?: string) {
  const rows = await getProjectsByDateRange(new Date(0), new Date(), organizationId);
  const revenue: Record<string, { projectId: string; totalCost: number; projectName: string }> = {};
  for (const project of rows) {
    const projectId = project.id || "unknown";
    if (!revenue[projectId]) {
      revenue[projectId] = { projectId, totalCost: 0, projectName: project.name || "Unnamed Project" };
    }
    revenue[projectId].totalCost += project.actualCost || 0;
  }
  return Object.values(revenue).sort((a, b) => b.totalCost - a.totalCost).slice(0, limit);
}

/**
 * Generate P&L (Profit & Loss) statement for given period
 */
async function generatePLStatement(startDate: Date, endDate: Date, organizationId?: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const paymentRows = await getPaymentsByDateRange(startDate, endDate, organizationId);
    const totalRevenue = paymentRows.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const reportStart = startDate.toISOString().replace("T", " ").substring(0, 19);
    const endExclusive = new Date(endDate);
    endExclusive.setTime(endExclusive.getTime() + 1);
    const reportEnd = endExclusive.toISOString().replace("T", " ").substring(0, 19);
    const inflowConditions: any[] = [
      inArray(nonSalesInflows.status, ["posted", "reversed"]),
      inArray(nonSalesInflows.inflowType, ["donation", "other_income"]),
      or(
        and(gte(nonSalesInflows.receivedAt, reportStart), lte(nonSalesInflows.receivedAt, endDate.toISOString().replace("T", " ").substring(0, 19))),
        and(gte(nonSalesInflows.reversedAt, reportStart), lt(nonSalesInflows.reversedAt, reportEnd)),
      ),
    ];
    if (organizationId) inflowConditions.push(eq(nonSalesInflows.organizationId, organizationId));
    const inflowRows = await db.select({
      inflowType: nonSalesInflows.inflowType,
      amountCents: nonSalesInflows.amountCents,
      receivedAt: nonSalesInflows.receivedAt,
      reversedAt: nonSalesInflows.reversedAt,
    }).from(nonSalesInflows).where(and(...inflowConditions));
    const { otherIncome, otherIncomeByType } = summarizeNonSalesInflows(inflowRows, startDate, endExclusive);

    // Get expenses
    const expenseRows = await getExpensesByDateRange(startDate, endDate, organizationId);
    const totalExpenses = expenseRows.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Get COGS (Cost of Goods/Services) from project costs
    const projectRows = await getProjectsByDateRange(startDate, endDate, organizationId);
    const cogs = projectRows.reduce((sum, proj) => sum + (proj.cost || 0), 0);

    // Calculate gross profit
    const grossProfit = totalRevenue - cogs;
    const grossMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 10000) / 100 : 0;

    // Calculate operating profit
    const operatingProfit = grossProfit - totalExpenses;
    const operatingMargin = totalRevenue > 0 ? Math.round((operatingProfit / totalRevenue) * 10000) / 100 : 0;

    // Get expenses by category
    const expensesByCategory = await getExpensesByCategory(startDate, endDate, organizationId);

    return {
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      totalRevenue,
      otherIncome,
      otherIncomeByType,
      totalIncome: totalRevenue + otherIncome,
      cogs,
      grossProfit,
      grossMargin,
      expenses: expensesByCategory,
      totalExpenses,
      operatingProfit,
      operatingMargin,
      netProfit: operatingProfit + otherIncome, // Equity and loan inflows are excluded from income.
    };
  } catch (error) {
    console.error("[FINANCIAL REPORTING] Error generating P&L:", error);
    return null;
  }
}

/**
 * Generate cash flow projection
 */
async function generateCashFlowProjection(months: number = 12, organizationId?: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const projection = [];
    const today = new Date();

    for (let i = 0; i < months; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      // Get invoices due this month
      const invoicesThisMonth = await getInvoicesByDateRange(monthStart, monthEnd, organizationId);
      const expectedInflows = invoicesThisMonth.reduce((sum, inv) => sum + (inv.total || 0), 0);

      // Get expenses due this month
      const expensesThisMonth = await getExpensesByDateRange(monthStart, monthEnd, organizationId);
      const expectedOutflows = expensesThisMonth.reduce((sum, exp) => sum + (exp.amount || 0), 0);

      const netCashFlow = expectedInflows - expectedOutflows;

      projection.push({
        month: month.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        inflows: expectedInflows,
        outflows: expectedOutflows,
        netCashFlow,
      });
    }

    return projection;
  } catch (error) {
    console.error("[FINANCIAL REPORTING] Error generating cash flow:", error);
    return null;
  }
}

/**
 * Generate receivables aging report
 */
async function generateReceivablesAging(organizationId?: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const invoicesByStatus = await getInvoicesByStatus(organizationId, 'sent', 'partial', 'overdue');
    const today = new Date();

    const aged = {
      current: { count: 0, amount: 0 },
      days30: { count: 0, amount: 0 },
      days60: { count: 0, amount: 0 },
      days90: { count: 0, amount: 0 },
      daysOver90: { count: 0, amount: 0 },
    };

    for (const invoice of invoicesByStatus) {
      const daysOld = Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      const outstandingAmount = (invoice.total || 0) - (invoice.paidAmount || 0);

      if (daysOld <= 0) {
        aged.current.count++;
        aged.current.amount += outstandingAmount;
      } else if (daysOld <= 30) {
        aged.days30.count++;
        aged.days30.amount += outstandingAmount;
      } else if (daysOld <= 60) {
        aged.days60.count++;
        aged.days60.amount += outstandingAmount;
      } else if (daysOld <= 90) {
        aged.days90.count++;
        aged.days90.amount += outstandingAmount;
      } else {
        aged.daysOver90.count++;
        aged.daysOver90.amount += outstandingAmount;
      }
    }

    const totalOutstanding = aged.current.amount + aged.days30.amount + aged.days60.amount + aged.days90.amount + aged.daysOver90.amount;

    return {
      current: { ...aged.current, percentage: totalOutstanding > 0 ? Math.round((aged.current.amount / totalOutstanding) * 100) : 0 },
      days30: { ...aged.days30, percentage: totalOutstanding > 0 ? Math.round((aged.days30.amount / totalOutstanding) * 100) : 0 },
      days60: { ...aged.days60, percentage: totalOutstanding > 0 ? Math.round((aged.days60.amount / totalOutstanding) * 100) : 0 },
      days90: { ...aged.days90, percentage: totalOutstanding > 0 ? Math.round((aged.days90.amount / totalOutstanding) * 100) : 0 },
      daysOver90: { ...aged.daysOver90, percentage: totalOutstanding > 0 ? Math.round((aged.daysOver90.amount / totalOutstanding) * 100) : 0 },
      totalOutstanding,
    };
  } catch (error) {
    console.error("[FINANCIAL REPORTING] Error generating aging:", error);
    return null;
  }
}

export const financialReportingRouter = router({
  /**
   * Get P&L for specified period
   */
  getPLStatement: readProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const orgId = ctx.user.organizationId;
        const pl = await generatePLStatement(new Date(input.startDate), new Date(input.endDate), orgId);
        return pl || { error: 'Failed to generate P&L' };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { error: String(error) };
      }
    }),

  /**
   * Get P&L for current year
   */
  getYearToDatePL: readProcedure.query(async ({ ctx }) => {
    try {
      const orgId = ctx.user.organizationId;
      const startDate = new Date(new Date().getFullYear(), 0, 1);
      const endDate = new Date();
      const pl = await generatePLStatement(startDate, endDate, orgId);
      return pl || { error: 'Failed to generate P&L' };
    } catch (error) {
      console.error("[FINANCIAL REPORTING] Error:", error);
      return { error: String(error) };
    }
  }),

  /**
   * Get P&L for last 12 months
   */
  get12MonthsPL: readProcedure.query(async ({ ctx }) => {
    try {
      const orgId = ctx.user.organizationId;
      const endDate = new Date();
      const startDate = subMonths(endDate, 12);
      const pl = await generatePLStatement(startDate, endDate, orgId);
      return pl || { error: 'Failed to generate P&L' };
    } catch (error) {
      console.error("[FINANCIAL REPORTING] Error:", error);
      return { error: String(error) };
    }
  }),

  /**
   * Get monthly P&L breakdown
   */
  getMonthlyPLBreakdown: readProcedure
    .input(z.object({ months: z.number().default(12) }))
    .query(async ({ input, ctx }) => {
      try {
        const orgId = ctx.user.organizationId;
        const breakdown = [];
        const today = new Date();

        for (let i = input.months - 1; i >= 0; i--) {
          const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const pl = await generatePLStatement(monthStart, monthEnd, orgId);
          if (pl) {
            breakdown.push({
              month: month.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
              ...pl,
            });
          }
        }

        return { breakdown };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { breakdown: [], error: String(error) };
      }
    }),

  /**
   * Get cash flow projection
   */
  getCashFlowProjection: readProcedure
    .input(z.object({ months: z.number().default(12) }))
    .query(async ({ input, ctx }) => {
      try {
        const orgId = ctx.user.organizationId;
        const projection = await generateCashFlowProjection(input.months, orgId);
        return { projection: projection ?? [] };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { projection: [], error: String(error) };
      }
    }),

  /**
   * Get receivables aging
   */
  getReceivablesAging: readProcedure.query(async ({ ctx }) => {
    try {
      const orgId = ctx.user.organizationId;
      const aging = await generateReceivablesAging(orgId);
      return aging || { error: 'Failed to generate aging report' };
    } catch (error) {
      console.error("[FINANCIAL REPORTING] Error:", error);
      return { error: String(error) };
    }
  }),

  /**
   * Get accounts receivable summary
   */
  getARSummary: readProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return { totalAR: 0, overdue: 0, avgCollectionDays: 0, topDebtors: [] };
    }

    try {
      const orgId = ctx.user.organizationId;
      const invoices = await getInvoicesByStatus(orgId, 'sent', 'partial', 'overdue');
      const today = new Date();
      let totalAR = 0;
      let totalOverdue = 0;
      let totalDays = 0;
      const debtors: { clientId: string; amount: number }[] = [];

      for (const invoice of invoices) {
        const outstanding = (invoice.total || 0) - (invoice.paidAmount || 0);
        totalAR += outstanding;
        totalDays += Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));

        if (new Date(invoice.dueDate) < today) {
          totalOverdue += outstanding;
        }

        const debtorIndex = debtors.findIndex(d => d.clientId === invoice.clientId);
        if (debtorIndex >= 0) {
          debtors[debtorIndex].amount += outstanding;
        } else {
          debtors.push({ clientId: invoice.clientId, amount: outstanding });
        }
      }

      const topDebtors = debtors
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      const avgCollectionDays = invoices.length > 0 ? Math.round(totalDays / invoices.length) : 0;

      return {
        totalAR,
        overdue: totalOverdue,
        avgCollectionDays,
        topDebtors,
      };
    } catch (error) {
      console.error("[FINANCIAL REPORTING] Error:", error);
      return { totalAR: 0, overdue: 0, avgCollectionDays: 0, topDebtors: [] };
    }
  }),

  /**
   * Get tax-deductible expenses
   */
  getTaxDeductibleExpenses: readProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { expenses: [], total: 0 };

      try {
        const orgId = ctx.user.organizationId;
        const startDate = new Date(input.year, 0, 1);
        const endDate = new Date(input.year + 1, 0, 1);
        const expenses = await getTaxDeductibleExpenses(startDate, endDate, orgId);

        const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        return { expenses, total };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { expenses: [], total: 0, error: String(error) };
      }
    }),

  /**
   * Get revenue by client
   */
  getRevenueByClient: readProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { clients: [] };

      try {
        const orgId = ctx.user.organizationId;
        const revenue = await getRevenueByClient(input.limit, orgId);
        return { clients: revenue };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { clients: [], error: String(error) };
      }
    }),

  /**
   * Get revenue by project
   */
  getRevenueByProject: readProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { projects: [] };

      try {
        const orgId = ctx.user.organizationId;
        const revenue = await getRevenueByProject(input.limit, orgId);
        return { projects: revenue };
      } catch (error) {
        console.error("[FINANCIAL REPORTING] Error:", error);
        return { projects: [], error: String(error) };
      }
    }),
});
