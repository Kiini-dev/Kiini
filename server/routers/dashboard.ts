import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { getDb, getRawPool } from "../db";
import { eq, and, gte, lte, lt, desc, inArray, sum, count, sql } from "drizzle-orm";
import { z } from "zod";
import { 
  projects, 
  clients, 
  invoices, 
  payments, 
  expenses, 
  products, 
  services, 
  employees,
  users,
  receipts,
  estimates,
  activityLog,
  projectTasks,
  reminders,
  scheduledReminders,
} from "../../drizzle/schema";

export const dashboardRouter = router({
  myAssignedItems: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return { clients: [], projects: [], tasks: [] };

    const employeeWhere = ctx.user.organizationId
      ? and(eq(employees.userId, ctx.user.id), eq(employees.organizationId, ctx.user.organizationId))
      : eq(employees.userId, ctx.user.id);
    const employee = await database.select({ id: employees.id })
      .from(employees)
      .where(employeeWhere)
      .limit(1);
    const assigneeIds = [ctx.user.id, employee[0]?.id].filter(Boolean) as string[];
    if (!assigneeIds.length) return { clients: [], projects: [], tasks: [] };

    const orgId = ctx.user.organizationId;
    const assignedClients = await database.select({ id: clients.id }).from(clients).where(
      orgId ? and(inArray(clients.assignedTo, assigneeIds), eq(clients.organizationId, orgId)) : inArray(clients.assignedTo, assigneeIds),
    ).limit(100);
    const assignedProjects = await database.select({ id: projects.id }).from(projects).where(
      orgId ? and(inArray(projects.assignedTo, assigneeIds), eq(projects.organizationId, orgId)) : inArray(projects.assignedTo, assigneeIds),
    ).limit(100);
    const assignedTasks = await database.select({
      id: projectTasks.id,
    }).from(projectTasks).where(inArray(projectTasks.assignedTo, assigneeIds)).limit(100);

    return { clients: assignedClients, projects: assignedProjects, tasks: assignedTasks };
  }),

  clientSummary: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    const clientId = (ctx.user as any)?.clientId;
    if (!database || !clientId) return { projects: [], invoices: [], receipts: [], estimates: [] };

    const [clientProjects, clientInvoices, clientReceipts, clientEstimates] = await Promise.all([
      database.select().from(projects).where(eq(projects.clientId, clientId)).orderBy(desc(projects.createdAt)).limit(100),
      database.select().from(invoices).where(eq(invoices.clientId, clientId)).orderBy(desc(invoices.createdAt)).limit(100),
      database.select().from(receipts).where(eq(receipts.clientId, clientId)).orderBy(desc(receipts.createdAt)).limit(100),
      database.select().from(estimates).where(eq(estimates.clientId, clientId)).orderBy(desc(estimates.createdAt)).limit(100),
    ]);

    return {
      projects: clientProjects,
      invoices: clientInvoices,
      receipts: clientReceipts,
      estimates: clientEstimates,
    };
  }),

  // Get dashboard stats for Quick Actions sidebar
  stats: protectedProcedure.query(async ({ ctx }) => {
    console.log('[Dashboard.stats] Called. User:', ctx.user?.email || 'NO USER');
    try {
      const pool = await getRawPool();
      if (pool) {
        const orgId = ctx.user?.organizationId;
        const scope = orgId ? ' WHERE organizationId = ?' : '';
        const paymentScope = orgId ? ' AND organizationId = ?' : '';
        const scopeParams = orgId ? [orgId] : [];
        const [revenueRows] = await pool.execute(`SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'completed'${paymentScope}`, scopeParams);
        const [activeProjectRows] = await pool.execute(`SELECT COUNT(*) AS total FROM projects${orgId ? ' WHERE organizationId = ? AND status = ?' : ' WHERE status = ?'}`, orgId ? [orgId, 'active'] : ['active']);
        const [newProjectRows] = await pool.execute(`SELECT COUNT(*) AS total FROM projects${orgId ? ' WHERE organizationId = ? AND createdAt >= ?' : ' WHERE createdAt >= ?'}`, orgId ? [orgId, new Date(new Date().getFullYear(), new Date().getMonth(), 1)] : [new Date(new Date().getFullYear(), new Date().getMonth(), 1)]);
        const [clientRows] = await pool.execute(`SELECT COUNT(*) AS total FROM clients${scope}`, scopeParams);
        return {
          totalRevenue: Number((revenueRows as any[])[0]?.total || 0),
          revenueGrowth: 0,
          activeProjects: Number((activeProjectRows as any[])[0]?.total || 0),
          newProjects: Number((newProjectRows as any[])[0]?.total || 0),
          totalClients: Number((clientRows as any[])[0]?.total || 0),
          newClients: 0,
        };
      }

      const db = await getDb();
      if (!db) {
        console.log('[Dashboard.stats] No DB available');
        return {
          totalRevenue: 0,
          revenueGrowth: 0,
          activeProjects: 0,
          newProjects: 0,
          totalClients: 0,
          newClients: 0,
        };
      }
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const monthStartStr = monthStart.toISOString();
      const lastMonthStartStr = lastMonthStart.toISOString().replace('T', ' ').substring(0, 19);
      const lastMonthEndStr = lastMonthEnd.toISOString().replace('T', ' ').substring(0, 19);
      const orgScopeWhere = ctx.user?.organizationId ? eq(payments.organizationId, ctx.user.organizationId) : undefined;
      const orgScopeClientsWhere = ctx.user?.organizationId ? eq(clients.organizationId, ctx.user.organizationId) : undefined;
      const orgScopeProjectsWhere = ctx.user?.organizationId ? eq(projects.organizationId, ctx.user.organizationId) : undefined;

      const allPayments = await db.select({ amount: payments.amount, status: payments.status }).from(payments)
        .where(orgScopeWhere ? and(orgScopeWhere, eq(payments.status, "completed")) : eq(payments.status, "completed"))
        .limit(10000);
      const totalRevenue = allPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      const thisMonthPayments = await db
        .select({ amount: payments.amount, paymentDate: payments.paymentDate })
        .from(payments)
        .where(orgScopeWhere ? and(orgScopeWhere, eq(payments.status, "completed"), gte(payments.paymentDate, monthStartStr)) : and(eq(payments.status, "completed"), gte(payments.paymentDate, monthStartStr)))
        .limit(1000);
      const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      const lastMonthPayments = await db
        .select({ amount: payments.amount, paymentDate: payments.paymentDate })
        .from(payments)
        .where(
          orgScopeWhere
            ? and(orgScopeWhere, eq(payments.status, "completed"), gte(payments.paymentDate, lastMonthStartStr), lte(payments.paymentDate, lastMonthEndStr))
            : and(eq(payments.status, "completed"), gte(payments.paymentDate, lastMonthStartStr), lte(payments.paymentDate, lastMonthEndStr))
        )
        .limit(1000);
      const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      const revenueGrowth = lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0;

      const activeProjectsData = await db
        .select()
        .from(projects)
        .where(orgScopeProjectsWhere ? and(orgScopeProjectsWhere, eq(projects.status, "active")) : eq(projects.status, "active"))
        .limit(1000);
      const activeProjects = activeProjectsData.length;

      const newProjectsData = await db
        .select()
        .from(projects)
        .where(orgScopeProjectsWhere ? and(orgScopeProjectsWhere, gte(projects.createdAt, monthStartStr)) : gte(projects.createdAt, monthStartStr))
        .limit(1000);
      const newProjects = newProjectsData.length;

      const allClients = await db.select().from(clients)
        .where(orgScopeClientsWhere ?? undefined)
        .limit(10000);
      const totalClients = allClients.length;

      const newClientsData = await db
        .select()
        .from(clients)
        .where(orgScopeClientsWhere ? and(orgScopeClientsWhere, gte(clients.createdAt, monthStartStr)) : gte(clients.createdAt, monthStartStr))
        .limit(1000);
      const newClients = newClientsData.length;

      return {
        totalRevenue,
        revenueGrowth,
        activeProjects,
        newProjects,
        totalClients,
        newClients,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalRevenue: 0,
        revenueGrowth: 0,
        activeProjects: 0,
        newProjects: 0,
        totalClients: 0,
        newClients: 0,
      };
    }
  }),

  // Get recent activity for Quick Actions sidebar
  recentActivity: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      console.log('[Dashboard.recentActivity] Called. User:', ctx.user?.email || 'NO USER');
      const db = await getDb();
      if (!db) {
        console.log('[Dashboard.recentActivity] No DB available');
        return [];
      }

      try {
        const limit = input?.limit || 10;
        const orgId = ctx.user?.organizationId;

        let activities = await db
          .select()
          .from(activityLog)
          .orderBy(desc(activityLog.createdAt))
          .limit(limit * 20);

        if (orgId) {
          const orgUserIds = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.organizationId, orgId));
          const orgUserIdsSet = new Set(orgUserIds.map((u) => u.id));
          activities = activities.filter((activity) => !activity.userId || orgUserIdsSet.has(activity.userId));
        }

        return activities.slice(0, limit).map(activity => ({
          id: activity.id || '',
          userId: activity.userId || '',
          action: activity.action || '',
          entityType: activity.entityType || '',
          entityId: activity.entityId || '',
          description: activity.description || '',
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt,
        }));
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        return [];
      }
    }),

  // Get dashboard metrics
  metrics: protectedProcedure.query(async ({ ctx }) => {
    console.log('[Dashboard.metrics] Called. User:', ctx.user?.email || 'NO USER');
    const pool = await getRawPool();
    if (pool) {
      try {
        const orgId = ctx.user?.organizationId;
        const count = async (table: string, condition = '', params: unknown[] = []) => {
          const [rows] = await pool.execute(`SELECT COUNT(*) AS total FROM ${table}${condition}`, params as any);
          return Number((rows as any[])[0]?.total || 0);
        };
        const scope = orgId ? 'organizationId = ?' : '';
        const scopeParams = orgId ? [orgId] : [];
        const activeScope = orgId ? 'organizationId = ? AND status = ?' : 'status = ?';
        const [revenueRows] = await pool.execute(
          `SELECT COALESCE(SUM(amount), 0) AS total FROM payments${orgId ? ' WHERE organizationId = ? AND paymentDate >= ?' : ' WHERE paymentDate >= ?'}`,
          orgId ? [orgId, new Date(new Date().getFullYear(), new Date().getMonth(), 1)] : [new Date(new Date().getFullYear(), new Date().getMonth(), 1)],
        );
        return {
          totalProjects: await count('projects', scope ? ` WHERE ${scope}` : '', scopeParams),
          activeClients: await count('clients', ` WHERE ${orgId ? 'organizationId = ? AND ' : ''}status = ?`, orgId ? [orgId, 'active'] : ['active']),
          totalClients: await count('clients', scope ? ` WHERE ${scope}` : '', scopeParams),
          totalUsers: await count('users', ` WHERE ${orgId ? 'organizationId = ? AND ' : ''}isActive = 1`, scopeParams),
          pendingInvoices: await count('invoices', ` WHERE ${orgId ? 'organizationId = ? AND ' : ''}status = ?`, orgId ? [orgId, 'sent'] : ['sent']),
          monthlyRevenue: Number((revenueRows as any[])[0]?.total || 0),
          totalProducts: await count('products', scope ? ` WHERE ${scope}` : '', scopeParams),
          totalServices: await count('services', scope ? ` WHERE ${scope}` : '', scopeParams),
          totalEmployees: await count('employees', scope ? ` WHERE ${scope}` : '', scopeParams),
          totalAccounts: 0,
        };
      } catch (error) {
        console.warn('[Dashboard.metrics] Raw aggregate failed; using Drizzle:', error);
      }
    }
    const db = await getDb();
    if (!db) {
      console.log('[Dashboard.metrics] No DB available');
      return {
        totalProjects: 0,
        activeClients: 0,
        pendingInvoices: 0,
        monthlyRevenue: 0,
        totalProducts: 0,
        totalServices: 0,
        totalEmployees: 0,
        totalAccounts: 0,
      };
    }

    try {
      const orgId = ctx.user?.organizationId;
      const projectScope = orgId ? eq(projects.organizationId, orgId) : undefined;
      const clientScope = orgId ? eq(clients.organizationId, orgId) : undefined;
      const invoiceScope = orgId ? eq(invoices.organizationId, orgId) : undefined;
      const paymentScope = orgId ? eq(payments.organizationId, orgId) : undefined;
      const productScope = orgId ? eq(products.organizationId, orgId) : undefined;
      const serviceScope = orgId ? eq(services.organizationId, orgId) : undefined;
      const employeeScope = orgId ? eq(employees.organizationId, orgId) : undefined;
      const userScope = orgId ? eq(users.organizationId, orgId) : undefined;

      const [projectsCountRow] = await db
        .select({ total: count(projects.id) })
        .from(projects)
        .where(projectScope ?? undefined);
      const totalProjects = Number(projectsCountRow?.total ?? 0);

      const [activeClientsRow] = await db
        .select({ total: count(clients.id) })
        .from(clients)
        .where(clientScope ? and(clientScope, eq(clients.status, "active")) : eq(clients.status, "active"));
      const activeClients = Number(activeClientsRow?.total ?? 0);

      const [pendingInvoicesRow] = await db
        .select({ total: count(invoices.id) })
        .from(invoices)
        .where(invoiceScope ? and(invoiceScope, eq(invoices.status, "sent")) : eq(invoices.status, "sent"));
      const pendingInvoices = Number(pendingInvoicesRow?.total ?? 0);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const monthStartStr = monthStart.toISOString().replace('T', ' ').substring(0, 19);
      const monthEndStr = monthEnd.toISOString().replace('T', ' ').substring(0, 19);

      const [paymentsSumRow] = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(paymentScope ? and(paymentScope, gte(payments.paymentDate, monthStartStr), lte(payments.paymentDate, monthEndStr)) : and(gte(payments.paymentDate, monthStartStr), lte(payments.paymentDate, monthEndStr)));

      const monthlyRevenue = Number(paymentsSumRow?.total ?? 0);

      const [productsCountRow] = await db
        .select({ total: count(products.id) })
        .from(products)
        .where(productScope ?? undefined);
      const totalProducts = Number(productsCountRow?.total ?? 0);

      const [servicesCountRow] = await db
        .select({ total: count(services.id) })
        .from(services)
        .where(serviceScope ?? undefined);
      const totalServices = Number(servicesCountRow?.total ?? 0);

      const [employeesCountRow] = await db
        .select({ total: count(employees.id) })
        .from(employees)
        .where(employeeScope ?? undefined);
      const totalEmployees = Number(employeesCountRow?.total ?? 0);

      const [usersCountRow] = await db
        .select({ total: count(users.id) })
        .from(users)
        .where(userScope ? and(userScope, eq(users.isActive, 1)) : eq(users.isActive, 1));
      const totalUsers = Number(usersCountRow?.total ?? 0);

      const [allClientsRow] = await db
        .select({ total: count(clients.id) })
        .from(clients)
        .where(clientScope ?? undefined);
      const totalClients = Number(allClientsRow?.total ?? 0);

      return {
        totalProjects,
        activeClients,
        totalClients,
        totalUsers,
        pendingInvoices,
        monthlyRevenue,
        totalProducts,
        totalServices,
        totalEmployees,
        totalAccounts: 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      return {
        totalProjects: 0,
        activeClients: 0,
        pendingInvoices: 0,
        monthlyRevenue: 0,
        totalProducts: 0,
        totalServices: 0,
        totalEmployees: 0,
        totalAccounts: 0,
      };
    }
  }),

  // Get accounting metrics
  accountingMetrics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        totalInvoices: 0,
        totalPayments: 0,
        totalExpenses: 0,
        totalRevenue: 0,
      };
    }

    try {
      // Get total invoices
      const invoicesData = await db.select({ total: invoices.total }).from(invoices).limit(1000);
      const totalInvoices = invoicesData.length;

      // Get total payments
      const paymentsData = await db.select({ amount: payments.amount }).from(payments).limit(1000);
      const totalPayments = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Get total expenses
      const expensesData = await db.select({ amount: expenses.amount }).from(expenses).limit(1000);
      const totalExpenses = expensesData.reduce((sum, e) => sum + (e.amount || 0), 0);

      // Get total revenue (from invoices)
      const totalRevenue = invoicesData.reduce((sum, i) => sum + (i.total || 0), 0);

      return {
        totalInvoices,
        totalPayments,
        totalExpenses,
        totalRevenue,
      };
    } catch (error) {
      console.error("Error fetching accounting metrics:", error);
      return {
        totalInvoices: 0,
        totalPayments: 0,
        totalExpenses: 0,
        totalRevenue: 0,
      };
    }
  }),

  // Get HR metrics
  hrMetrics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        totalDepartments: 0,
      };
    }

    try {
      // Get total employees
      const employeesData = await db.select().from(employees).limit(1000);
      const totalEmployees = employeesData.length;

      // Get active employees
      const activeEmployees = employeesData.filter((e) => e.status === "active").length;

      // Get total departments (placeholder)
      const totalDepartments = 0;

      return {
        totalEmployees,
        activeEmployees,
        totalDepartments,
      };
    } catch (error) {
      console.error("Error fetching HR metrics:", error);
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        totalDepartments: 0,
      };
    }
  }),

  /**
   * Get calendar events for a given month (global – no org scope).
   * Aggregates invoice due dates, project end dates, and task due dates.
   */
  getCalendarEvents: protectedProcedure
    .input(z.object({
      year: z.number().int().min(2000).max(2100),
      month: z.number().int().min(1).max(12),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { events: [] };

      try {
        const padded = (n: number) => String(n).padStart(2, '0');
        const startOfMonth = `${input.year}-${padded(input.month)}-01 00:00:00`;
        const lastDay = new Date(input.year, input.month, 0).getDate();
        const endOfMonth = `${input.year}-${padded(input.month)}-${padded(lastDay)} 23:59:59`;

        const [monthInvoices, allProjects, monthReminders] = await Promise.all([
          db.select().from(invoices).where(
            and(
              gte(invoices.dueDate, startOfMonth),
              lte(invoices.dueDate, endOfMonth),
            )
          ).limit(500),
          db.select().from(projects).limit(2000),
          db.select({ scheduled: scheduledReminders, reminder: reminders })
            .from(scheduledReminders)
            .leftJoin(reminders, eq(reminders.id, scheduledReminders.reminderId))
            .where(and(gte(scheduledReminders.scheduledFor, startOfMonth), lte(scheduledReminders.scheduledFor, endOfMonth)))
            .limit(500),
        ]);

        const projectsDueThisMonth = allProjects.filter((p) => {
          if (!p.endDate) return false;
          const d = String(p.endDate).slice(0, 10);
          return d >= startOfMonth.slice(0, 10) && d <= endOfMonth.slice(0, 10);
        });

        const allProjectIds = allProjects.map((p) => p.id);
        let tasksDue: any[] = [];
        if (allProjectIds.length > 0) {
          tasksDue = await db.select().from(projectTasks).where(
            and(
              inArray(projectTasks.projectId, allProjectIds),
              gte(projectTasks.dueDate, startOfMonth),
              lte(projectTasks.dueDate, endOfMonth),
            )
          ).limit(500);
        }

        const events: Array<{
          id: string;
          type: 'invoice' | 'project' | 'task';
          title: string;
          date: string;
          status: string;
          href: string;
          color: string;
        }> = [];

        for (const inv of monthInvoices) {
          events.push({
            id: `inv_${inv.id}`,
            type: 'invoice',
            title: `Invoice ${inv.invoiceNumber} due`,
            date: String(inv.dueDate).slice(0, 10),
            status: inv.status,
            href: `/invoices/${inv.id}`,
            color: inv.status === 'paid' ? '#22c55e' : inv.status === 'overdue' ? '#ef4444' : '#3b82f6',
          });
        }

        for (const proj of projectsDueThisMonth) {
          events.push({
            id: `proj_${proj.id}`,
            type: 'project',
            title: `${proj.name} deadline`,
            date: String(proj.endDate!).slice(0, 10),
            status: proj.status,
            href: `/projects/${proj.id}`,
            color: proj.status === 'completed' ? '#22c55e' : proj.status === 'on_hold' ? '#f59e0b' : '#a855f7',
          });
        }

        for (const task of tasksDue) {
          if (!task.dueDate) continue;
          events.push({
            id: `task_${task.id}`,
            type: 'task',
            title: task.title,
            date: String(task.dueDate).slice(0, 10),
            status: task.status,
            href: `/projects/${task.projectId}`,
            color: task.status === 'completed' ? '#22c55e' : task.priority === 'urgent' ? '#ef4444' : '#f97316',
          });
        }

        for (const item of monthReminders) {
          if (!item.reminder || item.scheduled.status === 'cancelled') continue;
          events.push({
            id: `reminder_${item.scheduled.id}`,
            type: 'task',
            title: item.reminder.name,
            date: String(item.scheduled.scheduledFor).slice(0, 10),
            status: item.scheduled.status,
            href: item.scheduled.referenceType && item.scheduled.referenceId ? `/${item.scheduled.referenceType}s/${item.scheduled.referenceId}` : '/calendar',
            color: item.scheduled.status === 'sent' ? '#22c55e' : '#f97316',
          });
        }

        return { events };
      } catch (error) {
        console.error('[dashboard.getCalendarEvents] Error:', error);
        return { events: [] };
      }
    }),

  // Monthly income vs expenses chart data (last 12 months)
  monthlyChart: protectedProcedure
    .input(z.object({ year: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      console.log('[Dashboard.monthlyChart] Called. User:', ctx.user?.email || 'NO USER', 'Year:', input?.year);
      const db = await getDb();
      if (!db) {
        console.log('[Dashboard.monthlyChart] No DB available');
        return { months: [], year: new Date().getFullYear() };
      }

      try {
        const year = input?.year || new Date().getFullYear();
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const yearStart = `${year}-01-01 00:00:00`;
        const yearEnd = `${year}-12-31 23:59:59`;
        const organizationId = ctx.user?.organizationId;
        const paymentWhere = organizationId
          ? and(eq(payments.organizationId, organizationId), gte(payments.paymentDate, yearStart), lte(payments.paymentDate, yearEnd))
          : and(gte(payments.paymentDate, yearStart), lte(payments.paymentDate, yearEnd));
        const expenseWhere = organizationId
          ? and(eq(expenses.organizationId, organizationId), gte(expenses.expenseDate, yearStart), lte(expenses.expenseDate, yearEnd))
          : and(gte(expenses.expenseDate, yearStart), lte(expenses.expenseDate, yearEnd));

        const [incomeRows, expenseRows] = await Promise.all([
          db.select({ month: sql<number>`MONTH(${payments.paymentDate})`, total: sum(payments.amount) })
            .from(payments)
            .where(paymentWhere)
            .groupBy(sql`MONTH(${payments.paymentDate})`),
          db.select({ month: sql<number>`MONTH(${expenses.expenseDate})`, total: sum(expenses.amount) })
            .from(expenses)
            .where(expenseWhere)
            .groupBy(sql`MONTH(${expenses.expenseDate})`),
        ]);

        const incomeByMonth = new Map(incomeRows.map((row) => [Number(row.month), Number(row.total ?? 0)]));
        const expenseByMonth = new Map(expenseRows.map((row) => [Number(row.month), Number(row.total ?? 0)]));
        const months = monthNames.map((name, index) => ({
          month: index + 1,
          name,
          income: incomeByMonth.get(index + 1) ?? 0,
          expense: expenseByMonth.get(index + 1) ?? 0,
        }));

        return { months, year };
      } catch (error) {
        console.error("Error fetching monthly chart data:", error);
        return { months: [], year: input?.year || new Date().getFullYear() };
      }
    }),

  // Financial summary cards (like Kiini: One Hub. Total Control top stats)
  financialSummary: protectedProcedure.query(async ({ ctx }) => {
    console.log('[Dashboard.financialSummary] Called. User:', ctx.user?.email || 'NO USER');
    const db = await getDb();
    if (!db) {
      console.log('[Dashboard.financialSummary] No DB available');
      return { paymentsToday: 0, paymentsMonth: 0, invoicesDue: 0, invoicesOverdue: 0 };
    }

    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 19).replace('T', ' ');
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString().slice(0, 19).replace('T', ' ');
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 19).replace('T', ' ');
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString().slice(0, 19).replace('T', ' ');
      const todayStr = now.toISOString().replace('T', ' ').substring(0, 19).slice(0, 10);
      const organizationId = ctx.user.organizationId;
      const paymentScope = organizationId ? eq(payments.organizationId, organizationId) : undefined;
      const invoiceScope = organizationId ? eq(invoices.organizationId, organizationId) : undefined;

      const todayPay = await db.select({ amount: payments.amount }).from(payments)
        .where(paymentScope
          ? and(paymentScope, gte(payments.paymentDate, todayStart), lte(payments.paymentDate, todayEnd))
          : and(gte(payments.paymentDate, todayStart), lte(payments.paymentDate, todayEnd))).limit(500);
      const paymentsToday = todayPay.reduce((s, p) => s + (p.amount || 0), 0);

      const monthPay = await db.select({ amount: payments.amount }).from(payments)
        .where(paymentScope
          ? and(paymentScope, gte(payments.paymentDate, monthStart), lte(payments.paymentDate, monthEnd))
          : and(gte(payments.paymentDate, monthStart), lte(payments.paymentDate, monthEnd))).limit(1000);
      const paymentsMonth = monthPay.reduce((s, p) => s + (p.amount || 0), 0);

      const dueInv = await db.select({ total: invoices.total }).from(invoices)
        .where(invoiceScope
          ? and(invoiceScope, eq(invoices.status, 'sent'), gte(invoices.dueDate, todayStr))
          : and(eq(invoices.status, 'sent'), gte(invoices.dueDate, todayStr))).limit(500);
      const invoicesDue = dueInv.reduce((s, i) => s + (i.total || 0), 0);

      const overdueInv = await db.select({ total: invoices.total }).from(invoices)
        .where(invoiceScope
          ? and(invoiceScope, inArray(invoices.status, ['sent', 'partial']), lte(invoices.dueDate, todayStr))
          : and(inArray(invoices.status, ['sent', 'partial']), lte(invoices.dueDate, todayStr))).limit(500);
      const invoicesOverdue = overdueInv.reduce((s, i) => s + (i.total || 0), 0);

      return { paymentsToday, paymentsMonth, invoicesDue, invoicesOverdue };
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      return { paymentsToday: 0, paymentsMonth: 0, invoicesDue: 0, invoicesOverdue: 0 };
    }
  }),

  // Revenue trend data for charts (last 6 months)
  revenueChartData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const now = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const chartData = [];

      // Get last 6 months of revenue
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = monthDate.toISOString().slice(0, 19).replace('T', ' ');
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59).toISOString().slice(0, 19).replace('T', ' ');

        const paymentsData = await db
          .select({ amount: payments.amount })
          .from(payments)
          .where(and(gte(payments.paymentDate, monthStart), lte(payments.paymentDate, monthEnd)))
          .limit(1000);

        const revenue = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
        const target = 500000; // Default target

        chartData.push({
          month: monthNames[monthDate.getMonth()],
          revenue: Math.round(revenue),
          target: target,
        });
      }

      return chartData;
    } catch (error) {
      console.error("Error fetching revenue chart data:", error);
      return [];
    }
  }),

  // Invoice status breakdown (last 6 months)
  invoiceChartData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const now = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const chartData = [];

      // Get last 6 months of invoice statuses
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = monthDate.toISOString().slice(0, 10);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().slice(0, 10);

        const paidInvoices = await db
          .select({ total: count() })
          .from(invoices)
          .where(
            and(
              eq(invoices.status, 'paid'),
              gte(invoices.createdAt, monthStart),
              lte(invoices.createdAt, monthEnd)
            )
          );

        const pendingInvoices = await db
          .select({ total: count() })
          .from(invoices)
          .where(
            and(
              eq(invoices.status, 'sent'),
              gte(invoices.createdAt, monthStart),
              lte(invoices.createdAt, monthEnd)
            )
          );

        const overdueInvoices = await db
          .select({ total: count() })
          .from(invoices)
          .where(
            and(
              eq(invoices.status, 'overdue'),
              gte(invoices.createdAt, monthStart),
              lte(invoices.createdAt, monthEnd)
            )
          );

        chartData.push({
          month: monthNames[monthDate.getMonth()],
          paid: Number(paidInvoices[0]?.total ?? 0),
          pending: Number(pendingInvoices[0]?.total ?? 0),
          overdue: Number(overdueInvoices[0]?.total ?? 0),
        });
      }

      return chartData;
    } catch (error) {
      console.error("Error fetching invoice chart data:", error);
      return [];
    }
  }),

  // Client status breakdown
  clientChartData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const activeClients = await db
        .select({ total: count() })
        .from(clients)
        .where(eq(clients.status, 'active'));

      const inactiveClients = await db
        .select({ total: count() })
        .from(clients)
        .where(eq(clients.status, 'inactive'));

      return [
        { name: 'Active', value: Number(activeClients[0]?.total ?? 0), color: '#10b981' },
        { name: 'Inactive', value: Number(inactiveClients[0]?.total ?? 0), color: '#6b7280' },
      ];
    } catch (error) {
      console.error("Error fetching client chart data:", error);
      return [
        { name: 'Active', value: 0, color: '#10b981' },
        { name: 'Inactive', value: 0, color: '#6b7280' },
      ];
    }
  }),
});
