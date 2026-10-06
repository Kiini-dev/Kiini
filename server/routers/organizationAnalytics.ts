/**
 * Organization Analytics Router
 * 
 * Provides organizational-level analytics, metrics, and insights for org admins.
 * Complements enterpriseTenants router (super-admin multi-tenant view).
 */

import { router, protectedProcedure } from '../_core/trpc';
import { createFeatureRestrictedProcedure } from '../middleware/enhancedRbac';
import { z } from 'zod';
import { getDb } from '../db';
import { sql, and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { invoices, expenses, payments, employees, clients, contacts } from '../../drizzle/schema';

// Org-scoped analytics procedure
const orgAnalyticsViewProcedure = createFeatureRestrictedProcedure('analytics:view')
  .use(({ ctx, next }) => {
    if (!ctx.user.organizationId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Organization access required',
      });
    }
    return next({ ctx });
  });

export const organizationAnalyticsRouter = router({
  /**
   * Get organization dashboard metrics overview
   */
  getDashboardMetrics: orgAnalyticsViewProcedure
    .input(z.object({
      month: z.string().optional().describe('YYYY-MM format'),
      year: z.number().optional(),
    }).strict())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const orgId = ctx.user.organizationId!;

        // Get current month boundaries if not specified
        const now = new Date();
        const month = input.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const [year, monthNum] = month.split('-').map(Number);
        const monthStart = new Date(year, monthNum - 1, 1);
        const monthEndExclusive = new Date(year, monthNum, 1);

        // Keep billing totals separate from payments received.
        const [invoiceData] = await db.execute(
          sql`
            SELECT 
              COUNT(*) as invoiceCount,
              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as totalInvoiced
            FROM invoices
            WHERE organizationId = ${orgId}
              AND createdAt >= ${monthStart.toISOString()}
              AND createdAt < ${monthEndExclusive.toISOString()}
          `
        );

        const [paymentData] = await db.execute(
          sql`
            SELECT COUNT(*) as paymentCount,
              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as totalRevenue
            FROM payments
            WHERE organizationId = ${orgId}
              AND status = 'completed'
              AND paymentDate >= ${monthStart.toISOString()}
              AND paymentDate < ${monthEndExclusive.toISOString()}
          `
        );

        // Expense metrics
        const [expenseData] = await db.execute(
          sql`
            SELECT 
              COUNT(*) as expenseCount,
              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as totalExpenses,
              COUNT(DISTINCT category) as categoryCount
            FROM expenses
            WHERE organizationId = ${orgId}
              AND createdAt BETWEEN ${monthStart.toISOString()} AND ${monthEnd.toISOString()}
          `
        );

        // Team size
        const [teamData] = await db.execute(
          sql`
            SELECT 
              COUNT(*) as activeEmployees,
              COUNT(DISTINCT department) as departmentCount
            FROM employees
            WHERE organizationId = ${orgId}
              AND status = 'active'
          `
        );

        // Client metrics
        const [clientData] = await db.execute(
          sql`
            SELECT 
              COUNT(*) as totalClients,
              COUNT(CASE WHEN status = 'active' THEN 1 END) as activeClients
            FROM clients
            WHERE organizationId = ${orgId}
          `
        );

        const invoiced = (invoiceData as any[])?.[0] || {};
        const revenue = (paymentData as any[])?.[0] || {};
        const expenses = (expenseData as any[])?.[0] || {};
        const team = (teamData as any[])?.[0] || {};
        const clients = (clientData as any[])?.[0] || {};

        return {
          period: month,
          revenue: {
            total: parseFloat(revenue.totalRevenue || 0),
            invoiced: parseFloat(invoiced.totalInvoiced || 0),
            invoiceCount: invoiced.invoiceCount || 0,
            paid: parseFloat(revenue.totalRevenue || 0),
            paidCount: revenue.paymentCount || 0,
            pending: parseFloat(invoiced.totalInvoiced || 0) - parseFloat(revenue.totalRevenue || 0),
          },
          expenses: {
            total: parseFloat(expenses.totalExpenses || 0),
            count: expenses.expenseCount || 0,
            categories: expenses.categoryCount || 0,
          },
          team: {
            activeEmployees: team.activeEmployees || 0,
            departments: team.departmentCount || 0,
          },
          clients: {
            total: clients.totalClients || 0,
            active: clients.activeClients || 0,
          },
          profitMargin: revenue.totalRevenue
            ? (((parseFloat(revenue.totalRevenue || 0) - parseFloat(expenses.totalExpenses || 0)) / parseFloat(revenue.totalRevenue || 0)) * 100).toFixed(2)
            : 0,
        };
      } catch (error) {
        console.error('Error getting dashboard metrics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard metrics',
        });
      }
    }),

  /**
   * Get revenue trend over time
   */
  getRevenueTrend: orgAnalyticsViewProcedure
    .input(z.object({
      months: z.number().min(3).max(12).default(6),
    }).strict())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const orgId = ctx.user.organizationId!;
        const months = input.months;

        // Generate array of months
        const trendData = [];
        for (let i = months - 1; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const monthStr = `${year}-${month}`;

          const start = new Date(year, d.getMonth(), 1);
          const endExclusive = new Date(year, d.getMonth() + 1, 1);

          const [monthData] = await db.execute(
            sql`
              SELECT
                COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as revenue,
                COUNT(*) as paymentCount
              FROM payments
              WHERE organizationId = ${orgId}
                AND status = 'completed'
                AND paymentDate >= ${start.toISOString()}
                AND paymentDate < ${endExclusive.toISOString()}
            `
          );

          const data = (monthData as any[])?.[0] || {};
          trendData.push({
            month: monthStr,
            revenue: parseFloat(data.revenue || 0),
            paymentCount: data.paymentCount || 0,
          });
        }

        return { trend: trendData };
      } catch (error) {
        console.error('Error getting revenue trend:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch revenue trend',
        });
      }
    }),

  /**
   * Get expense breakdown by category
   */
  getExpenseBreakdown: orgAnalyticsViewProcedure
    .input(z.object({
      month: z.string().optional(),
    }).strict())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const orgId = ctx.user.organizationId!;

        // Get current month if not specified
        const now = new Date();
        const month = input.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const [year, monthNum] = month.split('-').map(Number);
        const monthStart = new Date(year, monthNum - 1, 1);
        const monthEndExclusive = new Date(year, monthNum, 1);

        const [breakdown] = await db.execute(
          sql`
            SELECT 
              category,
              COUNT(*) as count,
              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total
            FROM expenses
            WHERE organizationId = ${orgId}
              AND createdAt BETWEEN ${monthStart.toISOString()} AND ${monthEnd.toISOString()}
            GROUP BY category
            ORDER BY total DESC
          `
        );

        return {
          period: month,
          breakdown: ((breakdown as any[]) || []).map((row: any) => ({
            category: row.category || 'Uncategorized',
            count: row.count || 0,
            amount: parseFloat(row.total || 0),
          })),
        };
      } catch (error) {
        console.error('Error getting expense breakdown:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch expense breakdown',
        });
      }
    }),

  /**
   * Get top clients by revenue
   */
  getTopClients: orgAnalyticsViewProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      month: z.string().optional(),
    }).strict())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const orgId = ctx.user.organizationId!;

        // Get current month if not specified
        const now = new Date();
        const month = input.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const [year, monthNum] = month.split('-').map(Number);
        const monthStart = new Date(year, monthNum - 1, 1);
        const monthEnd = new Date(year, monthNum, 0);

        const [topClients] = await db.execute(
          sql`
            SELECT 
              c.id,
              c.name,
              COUNT(DISTINCT p.invoiceId) as invoiceCount,
              COALESCE(SUM(CAST(p.amount AS DECIMAL(10,2))), 0) as totalRevenue
            FROM clients c
            LEFT JOIN payments p ON c.id = p.clientId
              AND p.organizationId = ${orgId}
              AND p.status = 'completed'
              AND p.paymentDate >= ${monthStart.toISOString()}
              AND p.paymentDate < ${monthEndExclusive.toISOString()}
            WHERE c.organizationId = ${orgId}
            GROUP BY c.id, c.name
            ORDER BY totalRevenue DESC
            LIMIT ${input.limit}
          `
        );

        return {
          period: month,
          topClients: ((topClients as any[]) || []).map((row: any) => ({
            clientId: row.id,
            name: row.name,
            invoiceCount: row.invoiceCount || 0,
            totalRevenue: parseFloat(row.totalRevenue || 0),
          })),
        };
      } catch (error) {
        console.error('Error getting top clients:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch top clients',
        });
      }
    }),

  /**
   * Get payment status distribution
   */
  getPaymentStatusDistribution: orgAnalyticsViewProcedure
    .input(z.object({
      month: z.string().optional(),
    }).strict())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const orgId = ctx.user.organizationId!;

        // Get current month if not specified
        const now = new Date();
        const month = input.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const [year, monthNum] = month.split('-').map(Number);
        const monthStart = new Date(year, monthNum - 1, 1);
        const monthEnd = new Date(year, monthNum, 0);

        const [distribution] = await db.execute(
          sql`
            SELECT 
              status,
              COUNT(*) as count,
              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total
            FROM invoices
            WHERE organizationId = ${orgId}
              AND createdAt BETWEEN ${monthStart.toISOString()} AND ${monthEnd.toISOString()}
            GROUP BY status
          `
        );

        return {
          period: month,
          distribution: ((distribution as any[]) || []).map((row: any) => ({
            status: row.status || 'unknown',
            count: row.count || 0,
            amount: parseFloat(row.total || 0),
          })),
        };
      } catch (error) {
        console.error('Error getting payment status distribution:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch payment status distribution',
        });
      }
    }),

  /**
   * Get KPI summary for organization
   */
  getKpiSummary: orgAnalyticsViewProcedure
    .input(z.object({
      month: z.string().optional(),
    }).strict())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const orgId = ctx.user.organizationId!;

        // Get current and previous month boundaries
        const now = new Date();
        const month = input.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const [year, monthNum] = month.split('-').map(Number);
        
        const currentStart = new Date(year, monthNum - 1, 1);
        const currentEnd = new Date(year, monthNum, 0);
        
        const prevStart = new Date(year, monthNum - 2, 1);
        const prevEnd = new Date(year, monthNum - 1, 0);

        // Current month metrics
        const [currentMetrics] = await db.execute(
          sql`
            SELECT 
              COUNT(*) as invoiceCount,
              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as revenue
            FROM invoices
            WHERE organizationId = ${orgId}
              AND createdAt BETWEEN ${currentStart.toISOString()} AND ${currentEnd.toISOString()}
          `
        );

        const [prevMetrics] = await db.execute(
          sql`
            SELECT 
              COUNT(*) as invoiceCount,
              COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as revenue
            FROM invoices
            WHERE organizationId = ${orgId}
              AND createdAt BETWEEN ${prevStart.toISOString()} AND ${prevEnd.toISOString()}
          `
        );

        const current = (currentMetrics as any[])?.[0] || {};
        const prev = (prevMetrics as any[])?.[0] || {};

        const currentRevenue = parseFloat(current.revenue || 0);
        const prevRevenue = parseFloat(prev.revenue || 0);
        const revenueGrowth = prevRevenue > 0 ? (((currentRevenue - prevRevenue) / prevRevenue) * 100) : 0;

        return {
          period: month,
          kpis: {
            revenue: {
              current: currentRevenue,
              previous: prevRevenue,
              growth: parseFloat(revenueGrowth.toFixed(2)),
              trend: currentRevenue >= prevRevenue ? 'up' : 'down',
            },
            invoices: {
              current: current.invoiceCount || 0,
              previous: prev.invoiceCount || 0,
              growth: prev.invoiceCount > 0 ? (((current.invoiceCount - prev.invoiceCount) / prev.invoiceCount) * 100).toFixed(2) : 0,
            },
          },
        };
      } catch (error) {
        console.error('Error getting KPI summary:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch KPI summary',
        });
      }
    }),
});
