/**
 * Analytics Router
 * 
 * Provides real-time metrics, KPIs, and financial analytics
 * for dashboard and reporting
 */

import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  invoices,
  expenses,
  payments,
  projects,
  clients,
} from "../../drizzle/schema";
import { eq, gte, lte, and, count, sum, sql, desc } from "drizzle-orm";

export const analyticsRouter = router({
  /**
   * Get financial summary metrics
   */
  financialSummary: createFeatureRestrictedProcedure("analytics:view")
    .input(
      z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const conditions = [];
        if (input.dateFrom) {
          conditions.push(gte(invoices.issueDate, input.dateFrom));
        }
        if (input.dateTo) {
          conditions.push(lte(invoices.issueDate, input.dateTo));
        }
        if (ctx.user.organizationId) conditions.push(eq(invoices.organizationId, ctx.user.organizationId));

        // Get invoice totals by status
        const invoiceStats = await db
          .select({
            status: invoices.status,
            count: count().as("count"),
            total: sum(invoices.total).as("total"),
          })
          .from(invoices)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .groupBy(invoices.status);

        // Get expense totals
        const expenseConditions: any[] = [];
        if (ctx.user.organizationId) expenseConditions.push(eq(expenses.organizationId, ctx.user.organizationId));
        const expenseStats = await db
          .select({
            status: expenses.status,
            count: count().as("count"),
            total: sum(expenses.amount).as("total"),
          })
          .from(expenses)
          .where(expenseConditions.length ? and(...expenseConditions) : undefined)
          .groupBy(expenses.status);

        // Calculate KPIs
        const totalInvoiced = invoiceStats.reduce(
          (sum, s) => sum + (parseFloat(s.total || "0")),
          0
        );
        const paymentConditions: any[] = [eq(payments.status, "completed")];
        if (input.dateFrom) paymentConditions.push(gte(payments.paymentDate, input.dateFrom));
        if (input.dateTo) paymentConditions.push(lte(payments.paymentDate, input.dateTo));
        if (ctx.user.organizationId) paymentConditions.push(eq(payments.organizationId, ctx.user.organizationId));
        const paymentStats = await db
          .select({ total: sum(payments.amount).as("total") })
          .from(payments)
          .where(and(...paymentConditions));
        const totalPaid = Number(paymentStats[0]?.total || 0);
        const totalOutstanding = totalInvoiced - totalPaid;
        const totalExpenses = expenseStats.reduce(
          (sum, s) => sum + (parseFloat(s.total || "0")),
          0
        );

        return {
          totalInvoiced,
          totalPaid,
          totalOutstanding,
          totalExpenses,
          netProfit: totalPaid - totalExpenses,
          invoiceStats,
          expenseStats,
        };
      } catch (error) {
        console.error("Financial summary error:", error);
        return null;
      }
    }),

  /**
   * Get revenue trends over time
   */
  revenueTrends: createFeatureRestrictedProcedure("analytics:view")
    .input(
      z.object({
        months: z.number().default(12),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        // Get monthly revenue data
        const conditions: any[] = [eq(payments.status, "completed")];
        if (ctx.user.organizationId) conditions.push(eq(payments.organizationId, ctx.user.organizationId));
        const month = sql`DATE_FORMAT(${payments.paymentDate}, '%Y-%m')`;
        const trends = await db
          .select({
            month,
            total: sum(payments.amount).as("total"),
            count: count().as("count"),
          })
          .from(payments)
          .where(and(...conditions))
          .groupBy(month)
          .orderBy(month)
          .limit(input.months);

        return trends;
      } catch (error) {
        console.error("Revenue trends error:", error);
        return [];
      }
    }),

  /**
   * Get project status distribution
   */
  projectStatusDistribution: createFeatureRestrictedProcedure("analytics:view").query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const distribution = await db
        .select({
          status: projects.status,
          count: count().as("count"),
        })
        .from(projects)
        .groupBy(projects.status);

      return distribution;
    } catch (error) {
      console.error("Project status distribution error:", error);
      return [];
    }
  }),

  /**
   * Get client distribution metrics
   */
  clientDistribution: createFeatureRestrictedProcedure("analytics:view").query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const distribution = await db
        .select({
          status: clients.status,
          count: count().as("count"),
        })
        .from(clients)
        .groupBy(clients.status);

      return distribution;
    } catch (error) {
      console.error("Client distribution error:", error);
      return [];
    }
  }),

  /**
   * Get invoice status metrics
   */
  invoiceMetrics: createFeatureRestrictedProcedure("analytics:view").query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const metrics = await db
        .select({
          status: invoices.status,
          count: count().as("count"),
          total: sum(invoices.total).as("total"),
          average: (sum(invoices.total) as any).divide(count()).as("average"),
        })
        .from(invoices)
        .groupBy(invoices.status);

      return metrics;
    } catch (error) {
      console.error("Invoice metrics error:", error);
      return [];
    }
  }),

  /**
   * Get expense metrics by category
   */
  expenseMetrics: createFeatureRestrictedProcedure("analytics:view").query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const metrics = await db
        .select({
          category: expenses.category,
          count: count().as("count"),
          total: sum(expenses.amount).as("total"),
        })
        .from(expenses)
        .groupBy(expenses.category);

      return metrics;
    } catch (error) {
      console.error("Expense metrics error:", error);
      return [];
    }
  }),

  /**
   * Get top clients by revenue
   */
  topClients: createFeatureRestrictedProcedure("analytics:view")
    .input(
      z.object({
        limit: z.number().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const conditions: any[] = [eq(payments.status, "completed")];
        if (ctx.user.organizationId) conditions.push(eq(payments.organizationId, ctx.user.organizationId));
        const topClients = await db
          .select({
            clientId: payments.clientId,
            clientName: clients.companyName,
            totalRevenue: sum(payments.amount).as("totalRevenue"),
            paymentCount: count().as("paymentCount"),
            invoiceCount: sql`COUNT(DISTINCT ${payments.invoiceId})`,
          })
          .from(payments)
          .leftJoin(clients, eq(payments.clientId, clients.id))
          .where(and(...conditions))
          .groupBy(payments.clientId, clients.companyName)
          .orderBy(desc(sql`totalRevenue`))
          .limit(input.limit);

        return topClients;
      } catch (error) {
        console.error("Top clients error:", error);
        return [];
      }
    }),

  /**
   * Get payment method distribution
   */
  paymentMethodDistribution: createFeatureRestrictedProcedure("analytics:view").query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const distribution = await db
        .select({
          method: payments.paymentMethod,
          count: count().as("count"),
          total: sum(payments.amount).as("total"),
        })
        .from(payments)
        .groupBy(payments.paymentMethod);

      return distribution;
    } catch (error) {
      console.error("Payment method distribution error:", error);
      return [];
    }
  }),

  /**
   * Get monthly comparison data
   */
  monthlyComparison: createFeatureRestrictedProcedure("analytics:view")
    .input(
      z.object({
        currentMonth: z.string(),
        previousMonth: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        // Get current month data
        const currentMonthData = await db
          .select({
            total: sum(invoices.total).as("total"),
            count: count().as("count"),
          })
          .from(invoices)
          .where(
            and(
              gte(invoices.issueDate, input.currentMonth),
              lte(invoices.issueDate, input.currentMonth)
            )
          );

        // Get previous month data
        const previousMonthData = await db
          .select({
            total: sum(invoices.total).as("total"),
            count: count().as("count"),
          })
          .from(invoices)
          .where(
            and(
              gte(invoices.issueDate, input.previousMonth),
              lte(invoices.issueDate, input.previousMonth)
            )
          );

        const current = currentMonthData[0] || { total: 0, count: 0 };
        const previous = previousMonthData[0] || { total: 0, count: 0 };

        const currentTotal = parseFloat(current.total || "0");
        const previousTotal = parseFloat(previous.total || "0");
        const percentChange =
          previousTotal > 0
            ? ((currentTotal - previousTotal) / previousTotal) * 100
            : 0;

        return {
          currentMonth: {
            total: currentTotal,
            count: current.count,
          },
          previousMonth: {
            total: previousTotal,
            count: previous.count,
          },
          percentChange,
          trend: currentTotal > previousTotal ? "up" : "down",
        };
      } catch (error) {
        console.error("Monthly comparison error:", error);
        return null;
      }
    }),

  /**
   * Get KPI summary
   */
  kpiSummary: createFeatureRestrictedProcedure("analytics:view").query(async () => {
    const db = await getDb();
    if (!db) return null;

    try {
      // Invoice KPIs
      const invoiceData = await db
        .select({
          total: sum(invoices.total).as("total"),
          count: count().as("count"),
        })
        .from(invoices);

      // Paid invoices
      const paidData = await db
        .select({
          total: sum(invoices.total).as("total"),
        })
        .from(invoices)
        .where(eq(invoices.status, "paid"));

      // Overdue invoices
      const overdueData = await db
        .select({
          total: sum(invoices.total).as("total"),
          count: count().as("count"),
        })
        .from(invoices)
        .where(eq(invoices.status, "overdue"));

      // Active projects
      const activeProjects = await db
        .select({
          count: count().as("count"),
        })
        .from(projects)
        .where(eq(projects.status, "active"));

      // Active clients
      const activeClients = await db
        .select({
          count: count().as("count"),
        })
        .from(clients)
        .where(eq(clients.status, "active"));

      const invoiceTotal = parseFloat(invoiceData[0]?.total || "0");
      const paidTotal = parseFloat(paidData[0]?.total || "0");

      return {
        totalInvoiced: invoiceTotal,
        totalInvoiceCount: invoiceData[0]?.count || 0,
        totalPaid: paidTotal,
        totalOutstanding: invoiceTotal - paidTotal,
        overdueAmount: parseFloat(overdueData[0]?.total || "0"),
        overdueCount: overdueData[0]?.count || 0,
        activeProjects: activeProjects[0]?.count || 0,
        activeClients: activeClients[0]?.count || 0,
      };
    } catch (error) {
      console.error("KPI summary error:", error);
      return null;
    }
  }),
});
