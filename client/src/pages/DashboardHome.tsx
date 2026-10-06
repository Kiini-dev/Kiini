import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { StatsCard } from "@/components/ui/stats-card";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  ComposedChart,
  Bar,
  LineChart,
  Line,
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
  Banknote,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  stats?: {
    label: string;
    value: string;
  };
}

export default function DashboardHome() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeClients: 0,
    pendingInvoices: 0,
    monthlyRevenue: 0,
    totalProducts: 0,
    totalServices: 0,
    totalEmployees: 0,
  });

  // Fetch dashboard metrics
  const { data: dashboardMetrics } = trpc.dashboard.metrics.useQuery({});
  const { data: financialSummary } = trpc.dashboard.financialSummary.useQuery({});
  const { data: monthlyChart } = trpc.dashboard.monthlyChart.useQuery({});
  const { data: accountingMetrics } = trpc.dashboard.accountingMetrics.useQuery({});
  const { data: recentActivities = [] } = trpc.dashboard.recentActivity.useQuery({ limit: 8 });
  const { data: upcomingReminders = [] } = trpc.reminders.list.useQuery({ limit: 3, status: "pending" });
  const { data: dashboardStats } = trpc.dashboard.stats.useQuery({});

  // Update metrics when data loads
  useEffect(() => {
    if (dashboardMetrics) {
      setMetrics({
        totalProjects: dashboardMetrics.totalProjects || 0,
        activeClients: dashboardMetrics.activeClients || 0,
        pendingInvoices: dashboardMetrics.pendingInvoices || 0,
        monthlyRevenue: dashboardMetrics.monthlyRevenue || 0,
        totalProducts: dashboardMetrics.totalProducts || 0,
        totalServices: dashboardMetrics.totalServices || 0,
        totalEmployees: dashboardMetrics.totalEmployees || 0,
      });
    }
  }, [dashboardMetrics]);

  const handleCardClick = (href: string) => {
    navigate(href);
  };

  // Memoize quickActions to prevent unnecessary re-renders
  const quickActions: QuickActionCard[] = useMemo(() => [
    {
      id: "projects",
      title: "Projects",
      description: "Manage and track all your projects",
      icon: <FolderKanban className="w-8 h-8" />,
      href: "/projects",
      color: "from-blue-500 to-blue-600",
      stats: { label: "Total Projects", value: metrics.totalProjects.toString() },
    },
    {
      id: "clients",
      title: "Clients",
      description: "Client relationship management",
      icon: <Users className="w-8 h-8" />,
      href: "/clients",
      color: "from-green-500 to-green-600",
      stats: { label: "Active Clients", value: metrics.activeClients.toString() },
    },
    {
      id: "invoices",
      title: "Invoices",
      description: "Create and manage invoices",
      icon: <FileText className="w-8 h-8" />,
      href: "/invoices",
      color: "from-purple-500 to-purple-600",
      stats: { label: "Pending Invoices", value: metrics.pendingInvoices.toString() },
    },
    {
      id: "estimates",
      title: "Estimates",
      description: "Generate quotations and estimates",
      icon: <Receipt className="w-8 h-8" />,
      href: "/estimates",
      color: "from-orange-500 to-orange-600",
      stats: { label: "Pending Estimates", value: "0" },
    },
    {
      id: "payments",
      title: "Payments",
      description: "Track payments and transactions",
      icon: <DollarSign className="w-8 h-8" />,
      href: "/payments",
      color: "from-green-500 to-emerald-600",
      stats: { label: "This Month", value: `KES ${((metrics.monthlyRevenue) || 0).toLocaleString()}` },
    },
    {
      id: "products",
      title: "Products",
      description: "Product catalog management",
      icon: <Package className="w-8 h-8" />,
      href: "/products",
      color: "from-cyan-500 to-cyan-600",
      stats: { label: "Total Products", value: metrics.totalProducts.toString() },
    },
    {
      id: "services",
      title: "Services",
      description: "Service offerings catalog",
      icon: <Briefcase className="w-8 h-8" />,
      href: "/services",
      color: "from-indigo-500 to-indigo-600",
      stats: { label: "Total Services", value: metrics.totalServices.toString() },
    },
    {
      id: "accounting",
      title: "Accounting",
      description: "Financial management and reports",
      icon: <CreditCard className="w-8 h-8" />,
      href: "/accounting",
      color: "from-pink-500 to-pink-600",
      stats: { label: "Accounts", value: "0" },
    },
    {
      id: "reports",
      title: "Reports",
      description: "Analytics and insights",
      icon: <BarChart3 className="w-8 h-8" />,
      href: "/reports",
      color: "from-amber-500 to-amber-600",
      stats: { label: "Reports", value: "0" },
    },
    {
      id: "hr",
      title: "HR",
      description: "Human resources management",
      icon: <UserCog className="w-8 h-8" />,
      href: "/hr",
      color: "from-red-500 to-red-600",
      stats: { label: "Employees", value: metrics.totalEmployees.toString() },
    },
    {
      id: "procurement",
      title: "Procurement",
      description: "Manage suppliers, purchase orders, and budgets",
      icon: <Package className="w-8 h-8" />,
      href: "/procurement",
      color: "from-teal-500 to-teal-600",
      stats: { label: "Modules", value: "6" },
    },
    {
      id: "suppliers",
      title: "Suppliers",
      description: "Manage your suppliers and vendor information",
      icon: <Briefcase className="w-8 h-8" />,
      href: "/suppliers",
      color: "from-cyan-500 to-cyan-600",
      stats: { label: "Suppliers", value: "0" },
    },
    {
      id: "departments",
      title: "Departments",
      description: "Organize and manage company departments",
      icon: <Users className="w-8 h-8" />,
      href: "/departments",
      color: "from-purple-500 to-purple-600",
      stats: { label: "Departments", value: "0" },
    },
    {
      id: "budgets",
      title: "Budgets",
      description: "Plan and track budget allocations",
      icon: <DollarSign className="w-8 h-8" />,
      href: "/budgets",
      color: "from-green-500 to-green-600",
      stats: { label: "Budgets", value: "0" },
    },
  ], [metrics]);

  // Memoize overviewMetrics to prevent unnecessary re-renders
  const overviewMetrics = useMemo(() => [
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
      title: "Revenue This Month",
      value: `KES ${((metrics.monthlyRevenue) || 0).toLocaleString()}`,
      description: dashboardStats?.revenueGrowth
        ? `${dashboardStats.revenueGrowth > 0 ? "+" : ""}${dashboardStats.revenueGrowth}% vs last month`
        : "Total payments received",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-l-emerald-400",
      href: "/accounting",
    },
    {
      title: "Payments Today",
      value: `KES ${((financialSummary?.paymentsToday ?? 0) / 100).toLocaleString()}`,
      description: "Received today",
      icon: <Banknote className="w-5 h-5" />,
      color: "border-l-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:border-l-teal-400",
      href: "/payments",
    },
    {
      title: "Invoices Due",
      value: `KES ${((financialSummary?.invoicesDue ?? 0) / 100).toLocaleString()}`,
      description: "Outstanding & upcoming",
      icon: <CalendarClock className="w-5 h-5" />,
      color: "border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-l-amber-400",
      href: "/invoices",
    },
    {
      title: "Overdue Invoices",
      value: `KES ${((financialSummary?.invoicesOverdue ?? 0) / 100).toLocaleString()}`,
      description: "Past due date",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "border-l-red-500 bg-red-50 dark:bg-red-900/20 dark:border-l-red-400",
      href: "/invoices",
    },
  ], [metrics, financialSummary, dashboardStats]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Your CRM Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Manage your clients, projects, invoices, and more from one powerful platform
          </p>
        </div>

        {/* Compact operational cards */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => (
            <StatsCard
              key={action.id}
              label={action.title}
              value={action.stats?.value ?? "—"}
              description={action.stats?.label ?? action.description}
              icon={action.icon}
              iconBg={`bg-gradient-to-br ${action.color}`}
              onClick={() => handleCardClick(action.href)}
              className="h-full"
            />
          ))}
        </div>

        {/* Quick Overview Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Quick Overview</h2>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Snapshot
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {overviewMetrics.map((metric) => (
              <StatsCard
                key={metric.title}
                label={metric.title}
                value={metric.value}
                description={metric.description}
                icon={metric.icon}
                iconBg="bg-gradient-to-br from-slate-700 to-slate-800"
                onClick={() => handleCardClick(metric.href)}
                className="h-full"
              />
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Revenue vs Expenses Bar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Monthly Income vs Expenses
                </CardTitle>
                <CardDescription>
                  {monthlyChart?.year || new Date().getFullYear()} financial performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyChart?.months && monthlyChart.months.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={monthlyChart.months}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="amount" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100).toLocaleString()}`} />
                      <YAxis yAxisId="trend" orientation="right" hide />
                      <Tooltip
                        formatter={(value: number) => [`KES ${(value / 100).toLocaleString()}`, undefined]}
                        labelStyle={{ fontWeight: "bold" }}
                      />
                      <Legend />
                      <Bar yAxisId="amount" dataKey="income" name="Income" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="amount" dataKey="expense" name="Expenses" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="trend" type="monotone" dataKey="income" name="Income trend" stroke="#0f766e" strokeWidth={2} dot={{ r: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Financial Breakdown
                </CardTitle>
                <CardDescription>Revenue, payments, and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                {accountingMetrics ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Revenue", value: (accountingMetrics.totalRevenue || 0) / 100 },
                          { name: "Payments", value: (accountingMetrics.totalPayments || 0) / 100 },
                          { name: "Expenses", value: (accountingMetrics.totalExpenses || 0) / 100 },
                        ].filter((d) => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#22c55e" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip formatter={(value: number) => [`KES ${value.toLocaleString()}`, undefined]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Work pulse: a scan-friendly view of work that needs attention. */}
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Work pulse</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Keep the week moving</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/reminders")}>
              View reminders <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  Project delivery
                  <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">On track</span>
                </CardTitle>
                <CardDescription>Q3 client portal refresh</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">18 of 24 tasks complete</span>
                  <span className="font-semibold text-slate-900 dark:text-white">75%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full w-3/4 rounded-full bg-teal-500" />
                </div>
                <button onClick={() => navigate("/projects")} className="mt-4 text-sm font-medium text-teal-700 hover:underline dark:text-teal-300">
                  Open project <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4 text-amber-500" /> Upcoming reminders</CardTitle>
                <CardDescription>Items due in the next 48 hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingReminders.length === 0 ? (
                  <button onClick={() => navigate("/reminders")} className="flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-200 p-3 text-left dark:border-slate-700">
                    <CalendarClock className="h-4 w-4 text-slate-400" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">No reminders scheduled</span>
                      <span className="block text-xs text-slate-500">Add a follow-up to keep work moving.</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                ) : upcomingReminders.map((reminder: any) => (
                  <button key={reminder.id} onClick={() => navigate("/reminders")} className="flex w-full items-center gap-3 text-left">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", reminder.type === "payment_overdue" ? "bg-rose-500" : reminder.type === "invoice_due" ? "bg-amber-500" : "bg-blue-500")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">{reminder.title || "Untitled reminder"}</span>
                      <span className="block text-xs text-slate-500">{reminder.scheduledFor ? new Date(reminder.scheduledFor).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" }) : "Scheduled soon"}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-rose-500" /> Attention needed</CardTitle>
                <CardDescription>Small blockers worth clearing today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2.5 dark:bg-rose-950/30">
                  <span className="text-sm text-rose-800 dark:text-rose-200">{metrics.pendingInvoices} invoices need follow-up</span>
                  <button onClick={() => navigate("/invoices")} className="text-xs font-semibold text-rose-700 hover:underline dark:text-rose-300">Review</button>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-800/70">
                  <span className="text-sm text-slate-700 dark:text-slate-200">{recentActivities.length} recent updates</span>
                  <button onClick={() => navigate("/activity-trail")} className="text-xs font-semibold text-slate-700 hover:underline dark:text-slate-200">Open log</button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/audit-logs")}>
              View All
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Latest Updates</CardTitle>
              <CardDescription>
                Recent changes and activities in your CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentActivities.length === 0 ? (
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        No recent activity
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Start by creating your first project or client
                      </p>
                    </div>
                  </div>
                ) : (
                  recentActivities.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
                          activity.action === "create" ? "bg-green-100 text-green-700" :
                          activity.action === "update" ? "bg-blue-100 text-blue-700" :
                          activity.action === "delete" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        )}>
                          {activity.action === "create" ? <Plus className="w-4 h-4" /> :
                           activity.action === "update" ? <CheckCircle2 className="w-4 h-4" /> :
                           activity.action === "delete" ? <AlertCircle className="w-4 h-4" /> :
                           <Clock className="w-4 h-4" />}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {activity.description || `${activity.action} ${activity.entityType}`}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                            {activity.entityType?.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 whitespace-nowrap">
                        {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        }) : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Tips */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Your First Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Start building your client database by adding new clients to your CRM.
                </p>
                <Button
                  onClick={() => handleCardClick("/clients")}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create Your First Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Organize your work by creating projects and assigning tasks to your team.
                </p>
                <Button
                  onClick={() => handleCardClick("/projects/create")}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate Your First Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Create professional invoices and track payments from your clients.
                </p>
                <Button
                  onClick={() => handleCardClick("/invoices")}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

