import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useRequireRole } from "@/lib/permissions";
import { ModuleLayout } from "@/components/ModuleLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAssistantModal } from "@/components/AIAssistantModal";
import { useCurrencySettings } from "@/lib/currency";

/**
 * DashboardHome - Unified Role-Based Dashboard
 * 
 * This is the main dashboard for all users in the CRM system.
 * Content is filtered based on user role:
 * - super_admin & admin: See all features
 * - accountant: See accounting/payments features
 * - hr: See HR/employee features
 * - All others: See general business features
 * 
 * Routes accessing this component:
 * - /crm (primary unified dashboard)
 * - /dashboards/dashboardhome (direct dashboard path)
 * - /dashboard-home (legacy compatibility)
 */
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Receipt,
  DollarSign,
  Package,
  Briefcase,
  CreditCard,
  BarChart3,
  UserCog,
  TrendingUp,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessOrgFeatureComplete, getOrgFeatureKeyForRoute } from "@/lib/orgPermissions";
import {
  LineChart,
  Line,
  ComposedChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface QuickActionCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  stats?: {
    label: string;
    value: string | number;
  };
  roles?: string[]; // Optional: if not specified, visible to all users
}

export default function DashboardHome() {
  const [, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuthWithPersistence();
  const { allowed: dashboardAllowed, isLoading: dashboardPermissionLoading } = useRequireRole([
    "super_admin", "admin", "accountant", "staff", "user", "project_manager", "hr", "procurement_manager", "ict_manager", "sales_manager",
  ]);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const { code: currencyCode } = useCurrencySettings();
  const { data: myOrgData } = trpc.multiTenancy.getMyOrg.useQuery(undefined, {
    enabled: !!user?.organizationId,
    staleTime: 300_000,
  });
  const featureMap = myOrgData?.featureMap ?? {};
  const effectivePermissions = (user as any)?.effectivePermissions ?? [];

  const canAccessHref = (href?: string) => {
    if (!href || href === "#") return true;
    if (!user?.organizationId) return true;
    const routeFeature = getOrgFeatureKeyForRoute(href);
    if (!routeFeature) return true;
    return canAccessOrgFeatureComplete(user.role ?? "", featureMap, `org:${routeFeature}`, effectivePermissions);
  };

  // Comprehensive tRPC queries for all dashboard sections
  const { 
    data: dashboardMetrics, 
    isLoading: metricsLoading 
  } = trpc.dashboard.metrics.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  });

  const { 
    data: dashboardStats, 
    isLoading: statsLoading 
  } = trpc.dashboard.stats.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  });

  const { 
    data: recentActivityData, 
    isLoading: activityLoading 
  } = trpc.dashboard.recentActivity.useQuery({ limit: 5 }, {
    retry: 2,
    retryDelay: 1000,
  });

  const { 
    data: accountingMetrics, 
    isLoading: accountingLoading 
  } = trpc.dashboard.accountingMetrics.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  });

  const { data: financialSummary } = trpc.dashboard.financialSummary.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  });
  const { data: scheduledReminders = [] } = trpc.reminders.list.useQuery(
    { limit: 100, status: "pending" },
    { retry: 1, staleTime: 30_000 },
  );
  const { data: leadsData = [] } = trpc.opportunities.list.useQuery({}, {
    retry: 1,
    staleTime: 30_000,
  });

  const {
    data: monthlyChartData,
  } = trpc.dashboard.monthlyChart.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  });

  // Combined loading state
  const isLoading = metricsLoading || statsLoading || activityLoading || accountingLoading;

  if (dashboardPermissionLoading || !dashboardAllowed) return null;

  // Normalize metrics with type safety
  const metrics = {
    totalProjects: Number(dashboardMetrics?.totalProjects) || 0,
    activeClients: Number(dashboardMetrics?.activeClients) || 0,
    pendingInvoices: Number(dashboardMetrics?.pendingInvoices) || 0,
    monthlyRevenue: Number(dashboardMetrics?.monthlyRevenue) || 0,
    totalProducts: Number(dashboardMetrics?.totalProducts) || 0,
    totalServices: Number(dashboardMetrics?.totalServices) || 0,
    totalEmployees: Number(dashboardMetrics?.totalEmployees) || 0,
  };

  const stats = {
    totalRevenue: Number(dashboardStats?.totalRevenue) || 0,
    revenueGrowth: Number(dashboardStats?.revenueGrowth) || 0,
    activeProjects: Number(dashboardStats?.activeProjects) || 0,
    newProjects: Number(dashboardStats?.newProjects) || 0,
    totalClients: Number(dashboardStats?.totalClients) || 0,
    newClients: Number(dashboardStats?.newClients) || 0,
  };

  // Chart data from real backend
  const monthlyRevenueData = (monthlyChartData?.months ?? []).map((m: any) => ({
    month: m.name,
    revenue: m.income ?? 0,
    target: m.expense ?? 0,
  }));

  const clientStatusData = [
    { name: "Active", value: metrics.activeClients, color: "#10b981" },
    { name: "Total Projects", value: metrics.totalProjects, color: "#6b7280" },
  ];

  const invoiceStatusData = (monthlyChartData?.months ?? []).map((m: any) => ({
    month: m.name,
    income: Math.round((m.income ?? 0) / 100),
    expense: Math.round((m.expense ?? 0) / 100),
  }));

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount / 100);
  const formatCurrencyShort = (amount: number) => {
    const value = amount / 100;
    if (value >= 1_000_000) return `${currencyCode} ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${currencyCode} ${(value / 1_000).toFixed(0)}K`;
    return `${currencyCode} ${value.toFixed(0)}`;
  };

  const upcomingReminders = scheduledReminders
    .filter((reminder: any) => {
      const scheduledTime = new Date(reminder.scheduledFor).getTime();
      return Number.isFinite(scheduledTime) && scheduledTime >= Date.now() && scheduledTime <= Date.now() + 48 * 60 * 60 * 1000;
    })
    .sort((a: any, b: any) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
    .slice(0, 3);

  const leadStages: Record<string, { label: string; color: string }> = {
    lead: { label: "New", color: "#94a3b8" },
    qualified: { label: "Qualified", color: "#3b82f6" },
    proposal: { label: "Proposal", color: "#8b5cf6" },
    negotiation: { label: "Negotiation", color: "#f59e0b" },
    closed_won: { label: "Won", color: "#22c55e" },
    closed_lost: { label: "Lost", color: "#ef4444" },
  };
  const leads = Array.isArray(leadsData) ? leadsData : (leadsData as any)?.items ?? [];
  const leadsPipelineData = Object.entries(leadStages).map(([stage, config]) => ({
    name: config.label,
    value: leads.filter((lead: any) => (lead.stage || "lead") === stage).length,
    color: config.color,
  })).filter((entry) => entry.value > 0);
  const totalLeads = leadsPipelineData.reduce((total, entry) => total + entry.value, 0);

  const financialCards = [
    { label: "Payments - Today", value: formatCurrencyShort(financialSummary?.paymentsToday ?? 0), icon: CreditCard, color: "border-b-4 border-cyan-500", href: "/payments" },
    { label: "Payments - Month", value: formatCurrencyShort(financialSummary?.paymentsMonth ?? 0), icon: DollarSign, color: "border-b-4 border-blue-500", href: "/payments" },
    { label: "Invoices - Due", value: formatCurrencyShort(financialSummary?.invoicesDue ?? 0), icon: FileText, color: "border-b-4 border-orange-400", href: "/invoices" },
    { label: "Invoices - Overdue", value: formatCurrencyShort(financialSummary?.invoicesOverdue ?? 0), icon: AlertCircle, color: "border-b-4 border-rose-500", href: "/invoices" },
  ];

  const statCards = [
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), change: `${stats.revenueGrowth > 0 ? "+" : ""}${stats.revenueGrowth}%`, trend: stats.revenueGrowth >= 0 ? "up" as const : "down" as const, icon: <DollarSign className="h-4 w-4" />, description: "This month", href: "/accounting", color: "border-l-emerald-500", iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
    { label: "Active Projects", value: stats.activeProjects.toString(), change: `+${stats.newProjects}`, trend: "up" as const, icon: <FolderKanban className="h-4 w-4" />, description: "In progress", href: "/projects", color: "border-l-blue-500", iconBg: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { label: "Total Clients", value: stats.totalClients.toString(), change: `+${stats.newClients}`, trend: "up" as const, icon: <Users className="h-4 w-4" />, description: "Active clients", href: "/clients", color: "border-l-violet-500", iconBg: "bg-gradient-to-br from-violet-500 to-violet-600" },
    { label: "Pending Invoices", value: metrics.pendingInvoices.toString(), change: "0", trend: "neutral" as const, icon: <FileText className="h-4 w-4" />, description: "Awaiting payment", href: "/invoices", color: "border-l-amber-500", iconBg: "bg-gradient-to-br from-amber-500 to-amber-600" },
  ];

  const handleCardClick = (href: string, actionId?: string) => {
    if (actionId === "ai-assistant") {
      setAiAssistantOpen(true);
      return;
    }
    if (href && href !== "#") {
      if (!canAccessHref(href)) return;
      navigate(href);
    }
  };

  // Define quick actions with dynamic metrics
  const quickActions: QuickActionCard[] = [
    {
      id: "ai-assistant",
      title: "AI Assistant",
      description: "Get instant help and insights",
      icon: <span className="text-lg">✨</span>,
      href: "#", // Don't navigate, this opens the modal
      color: "from-violet-500 to-violet-600",
      stats: { label: "Smart", value: "24/7" },
    },
    {
      id: "projects",
      title: "Projects",
      description: "Manage and track all your projects",
      icon: <FolderKanban className="w-8 h-8" />,
      href: "/projects",
      color: "from-blue-500 to-blue-600",
      stats: { label: "Total Projects", value: metrics.totalProjects },
    },
    {
      id: "clients",
      title: "Clients",
      description: "Client relationship management",
      icon: <Users className="w-8 h-8" />,
      href: "/clients",
      color: "from-violet-500 to-violet-600",
      stats: { label: "Active Clients", value: metrics.activeClients },
    },
    {
      id: "invoices",
      title: "Invoices",
      description: "Create and manage invoices",
      icon: <FileText className="w-8 h-8" />,
      href: "/invoices",
      color: "from-amber-500 to-amber-600",
      stats: { label: "Pending Invoices", value: metrics.pendingInvoices },
    },
    {
      id: "estimates",
      title: "Estimates",
      description: "Generate quotations and estimates",
      icon: <Receipt className="w-8 h-8" />,
      href: "/estimates",
      color: "from-orange-500 to-orange-600",
      stats: { label: "Pending Estimates", value: 0 },
    },
    {
      id: "payments",
      title: "Payments",
      description: "Track payments and transactions",
      icon: <DollarSign className="w-8 h-8" />,
      href: "/payments",
      color: "from-green-500 to-emerald-600",
      stats: { label: "This Month", value: `KES ${metrics.monthlyRevenue.toLocaleString()}` },
      roles: ["super_admin", "admin", "accountant"] // Primary access for accountants
    },
    {
      id: "products",
      title: "Products",
      description: "Product catalog management",
      icon: <Package className="w-8 h-8" />,
      href: "/products",
      color: "from-cyan-500 to-cyan-600",
      stats: { label: "Total Products", value: metrics.totalProducts },
    },
    {
      id: "services",
      title: "Services",
      description: "Service offerings catalog",
      icon: <Briefcase className="w-8 h-8" />,
      href: "/services",
      color: "from-indigo-500 to-indigo-600",
      stats: { label: "Total Services", value: metrics.totalServices },
    },
    {
      id: "accounting",
      title: "Accounting",
      description: "Financial management and reports",
      icon: <CreditCard className="w-8 h-8" />,
      href: "/accounting",
      color: "from-emerald-500 to-emerald-600",
      stats: { label: "Accounts", value: accountingMetrics?.totalInvoices || 0 },
      roles: ["super_admin", "admin", "accountant"] // For accounting team
    },
    {
      id: "reports",
      title: "Reports",
      description: "Analytics and insights",
      icon: <BarChart3 className="w-8 h-8" />,
      href: "/reports",
      color: "from-violet-500 to-violet-600",
      stats: { label: "Reports", value: 0 },
    },
    {
      id: "hr",
      title: "HR",
      description: "Human resources management",
      icon: <UserCog className="w-8 h-8" />,
      href: "/hr",
      color: "from-rose-500 to-rose-600",
      stats: { label: "Employees", value: metrics.totalEmployees },
      roles: ["super_admin", "admin", "hr"] // Primary access for HR
    },
  ];

  // Filter quick actions based on user role
  const filteredQuickActions = quickActions.filter(action => {
    if (action.id === "ai-assistant") return true;
    if (user?.role === "super_admin" || user?.role === "admin") {
      return canAccessHref(action.href);
    }
    if (!action.roles) return canAccessHref(action.href);
    return action.roles.includes(user?.role || "") && canAccessHref(action.href);
  });

  const overviewMetrics = [
    {
      title: "Total Projects",
      value: metrics.totalProjects.toString(),
      description: "Get started by creating your first project",
      icon: <FolderKanban className="w-5 h-5" />,
      color: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-400",
      href: "/projects",
    },
    {
      title: "Active Clients",
      value: metrics.activeClients.toString(),
      description: "Add your first client",
      icon: <Users className="w-5 h-5" />,
      color: "border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-l-green-400",
      href: "/clients",
    },
    {
      title: "Pending Invoices",
      value: metrics.pendingInvoices.toString(),
      description: "No pending invoices",
      icon: <FileText className="w-5 h-5" />,
      color: "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-l-purple-400",
      href: "/invoices",
    },
    {
      title: "Revenue",
      value: `KES ${metrics.monthlyRevenue.toLocaleString()}`,
      description: "This month",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-l-green-400",
      href: "/accounting",
    },
  ];

  return (
    <ModuleLayout
      title="Dashboard"
      description="Track your performance, manage operations, and grow your business"
      icon={<LayoutDashboard className="h-5 w-5" />}
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-6 md:space-y-8 pb-8">

        <div className="grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 shadow-sm dark:border-slate-700 dark:bg-slate-700 sm:grid-cols-2 xl:grid-cols-4">
          {financialCards.map((card) => {
            const Icon = card.icon;
            return (
              <button key={card.label} type="button" className={`flex items-center justify-between bg-white px-4 py-3 text-left transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 ${card.color}`} onClick={() => handleCardClick(card.href)}>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</span>
                  <span className="mt-1 block text-lg font-bold">{card.value}</span>
                </span>
                <Icon className="h-5 w-5 text-muted-foreground/60" />
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <StatsCard key={stat.label} label={stat.label} value={stat.value} description={stat.description} change={stat.change} trend={stat.trend} icon={stat.icon} iconBg={stat.iconBg} color={stat.color} onClick={() => handleCardClick(stat.href)} />
          ))}
        </div>

        {/* Featured Quick Actions - Changed to 5 items horizontal scroll on mobile */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Quick Access</h2>
            {isLoading && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-slate-400" />}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {filteredQuickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleCardClick(action.href, action.id)}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/85 dark:hover:border-slate-600"
              >
                {/* Background gradient on hover */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5",
                    `bg-gradient-to-br ${action.color}`
                  )}
                />

                {/* Content */}
                <div className="relative space-y-2.5 sm:space-y-3">
                  {/* Icon with enhanced gradient background */}
                  <div
                    className={cn(
                      "inline-flex p-2.5 sm:p-3 rounded-lg text-white shadow-lg",
                      `bg-gradient-to-br ${action.color}`
                    )}
                  >
                    <div className="h-6 w-6">{action.icon}</div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 text-xs sm:text-sm md:text-base leading-tight">
                    {action.title}
                  </h3>

                  {/* Stats if available */}
                  {action.stats && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 hidden sm:block">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                        {action.stats.label}
                      </p>
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {typeof action.stats.value === "number" ? action.stats.value.toString() : action.stats.value}
                      </p>
                    </div>
                  )}
                </div>

                {/* Arrow Icon */}
                <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors duration-300 opacity-0 group-hover:opacity-100">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                {/* Animated bottom border */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Income vs Expenses</CardTitle><CardDescription>Monthly financial performance</CardDescription></CardHeader>
            <CardContent>
              {invoiceStatusData.length === 0 ? (
                <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">No financial data available yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={invoiceStatusData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : String(value)} />
                    <Tooltip formatter={(value: number, name: string) => [`${currencyCode} ${value.toLocaleString()}`, name]} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expenses" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="income" name="Income trend" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Leads Pipeline</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleCardClick("/leads")}>View All <ArrowRight className="ml-1 h-3 w-3" /></Button>
              </div>
              <CardDescription>{totalLeads} lead{totalLeads === 1 ? "" : "s"} by stage</CardDescription>
            </CardHeader>
            <CardContent>
              {leadsPipelineData.length === 0 ? (
                <div className="flex h-[240px] flex-col items-center justify-center text-muted-foreground">
                  <BarChart3 className="mb-2 h-10 w-10 opacity-25" />
                  <p className="text-sm">No leads yet</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleCardClick("/leads")}>Add your first lead</Button>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={leadsPipelineData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                        {leadsPipelineData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5">
                    {leadsPipelineData.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />{entry.name}</span>
                        <span className="font-medium">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Work pulse</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Keep the week moving</h2></div>
            <Button variant="outline" size="sm" onClick={() => handleCardClick("/reminders")}>View reminders <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center justify-between text-base">Project delivery <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{stats.activeProjects ? "On track" : "Getting started"}</span></CardTitle><CardDescription>Active work across your projects</CardDescription></CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center justify-between text-sm"><span className="text-muted-foreground">{stats.activeProjects} active projects</span><span className="font-semibold">{stats.activeProjects ? "On track" : "Get started"}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-3/4 rounded-full bg-primary" /></div>
                <Button variant="link" className="mt-2 h-auto px-0 text-primary" onClick={() => handleCardClick("/projects")}>Open projects <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4 text-amber-500" /> Upcoming reminders</CardTitle><CardDescription>Items due in the next 48 hours</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {upcomingReminders.length === 0 ? (
                  <button type="button" onClick={() => handleCardClick("/reminders")} className="flex w-full items-center gap-3 rounded-lg border border-dashed p-3 text-left">
                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium">No reminders scheduled</span><span className="block text-xs text-muted-foreground">Schedule a follow-up to see it here.</span></span><ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ) : upcomingReminders.map((reminder: any) => (
                  <button key={reminder.id} type="button" onClick={() => handleCardClick("/reminders")} className="flex w-full items-center gap-3 text-left">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${reminder.type === "payment_overdue" ? "bg-rose-500" : reminder.type === "invoice_due" ? "bg-amber-500" : "bg-blue-500"}`} />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{reminder.title || "Untitled reminder"}</span><span className="block text-xs text-muted-foreground">{new Date(reminder.scheduledFor).toLocaleString("en-KE", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span></span><ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-rose-500" /> Attention needed</CardTitle><CardDescription>Small blockers worth clearing today</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2.5"><span className="text-sm text-rose-800">{metrics.pendingInvoices} invoices need follow-up</span><Button variant="link" className="h-auto p-0 text-xs text-rose-700" onClick={() => handleCardClick("/invoices")}>Review</Button></div>
                <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5"><span className="text-sm">{totalLeads} leads to review</span><Button variant="link" className="h-auto p-0 text-xs" onClick={() => handleCardClick("/leads")}>Open pipeline</Button></div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Getting Started Tips Section */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Getting Started</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="overflow-hidden border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-800/50">
                <CardTitle className="text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-50 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Add Your First Client</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Start building your client database by adding new clients to your CRM system.
                </p>
                <Button
                  onClick={() => handleCardClick("/clients")}
                  className="w-full text-xs sm:text-sm h-8 sm:h-10 bg-blue-600 hover:bg-blue-700 group-hover:shadow-lg transition-all"
                  size="sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Add Client
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-purple-50 to-purple-50 dark:from-slate-800/50 dark:to-slate-800/50">
                <CardTitle className="text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-50 flex items-center space-x-2">
                  <FolderKanban className="w-4 h-4 text-purple-600" />
                  <span>Create Your First Project</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Organize your work by creating projects and assigning tasks to your team members.
                </p>
                <Button
                  onClick={() => handleCardClick("/projects/create")}
                  className="w-full text-xs sm:text-sm h-8 sm:h-10 bg-purple-600 hover:bg-purple-700 group-hover:shadow-lg transition-all"
                  size="sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  New Project
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-green-50 to-green-50 dark:from-slate-800/50 dark:to-slate-800/50">
                <CardTitle className="text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-50 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span>Generate Your First Invoice</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Create professional invoices and track payments from your clients efficiently.
                </p>
                <Button
                  onClick={() => handleCardClick("/invoices")}
                  className="w-full text-xs sm:text-sm h-8 sm:h-10 bg-green-600 hover:bg-green-700 group-hover:shadow-lg transition-all"
                  size="sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  New Invoice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal 
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        context="Dashboard"
      />
    </ModuleLayout>
  );
}

