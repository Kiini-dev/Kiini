import DashboardLayout from "@/components/DashboardLayout";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import React, { useState, useMemo } from "react";
import {
  Users,
  FolderKanban,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Clock,
  Receipt,
  FileSpreadsheet,
  CreditCard,
  AlertCircle,
  Target,
  Layers,
  Monitor,
  ShoppingCart,
  Package,
  Mail,
  BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCurrencySettings } from "@/lib/currency";
import {
  BarChart,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import { format } from "date-fns";

function formatReminderDue(value: string | Date) {
  const date = new Date(value);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const label = date.toDateString() === today.toDateString()
    ? "Today"
    : date.toDateString() === tomorrow.toDateString()
      ? "Tomorrow"
      : format(date, "MMM d");

  return `${label} · ${format(date, "h:mm a")}`;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [chartYear, setChartYear] = useState(new Date().getFullYear());

  console.log('[Dashboard] Component mounted/updated');

  const { data: statsData, isLoading: isStatsLoading, error: statsError } = trpc.dashboard.stats.useQuery(undefined, { retry: 1, staleTime: 30000 });
  const { data: metricsData, isLoading: isMetricsLoading, error: metricsError } = trpc.dashboard.metrics.useQuery(undefined, { retry: 1, staleTime: 30000 });
  const { data: chartData, error: chartError } = trpc.dashboard.monthlyChart.useQuery({ year: chartYear }, { retry: 1, staleTime: 60000 });
  const { data: financialSummary, error: financialError } = trpc.dashboard.financialSummary.useQuery(undefined, { retry: 1, staleTime: 30000 });
  const { data: leadsData = [], error: leadsError } = trpc.opportunities.list.useQuery({}, { retry: 1, staleTime: 30000 });
  const { data: scheduledReminders = [] } = trpc.reminders.list.useQuery({ limit: 100, status: "pending" }, { retry: 1, staleTime: 30000 });

  // Log query statuses
  React.useEffect(() => {
    console.log('[Dashboard] Query status:', {
      stats: { loading: isStatsLoading, error: !!statsError, errorMsg: statsError?.message },
      metrics: { loading: isMetricsLoading, error: !!metricsError, errorMsg: metricsError?.message },
      chart: { error: !!chartError, errorMsg: chartError?.message },
      financial: { error: !!financialError, errorMsg: financialError?.message },
      leads: { error: !!leadsError, errorMsg: leadsError?.message },
    });
  }, [isStatsLoading, isMetricsLoading, statsError, metricsError, chartError, financialError, leadsError]);

  // Log any errors for debugging
  React.useEffect(() => {
    const errors = [statsError, metricsError, chartError, financialError, leadsError].filter(Boolean);
    if (errors.length > 0) {
      console.warn('[Dashboard] Query errors:', errors.map(e => e?.message));
    }
  }, [statsError, metricsError, chartError, financialError, leadsError]);

  const statsDataPlain = statsData ? JSON.parse(JSON.stringify(statsData)) : null;
  const metricsDataPlain = metricsData ? JSON.parse(JSON.stringify(metricsData)) : null;
  // Also unwrap remaining queries to prevent React error #306 from frozen/proxy objects
  const chartDataPlain = chartData ? JSON.parse(JSON.stringify(chartData)) : null;
  const financialSummaryPlain = financialSummary ? JSON.parse(JSON.stringify(financialSummary)) : null;
  const leadsDataPlain = leadsData ? JSON.parse(JSON.stringify(leadsData)) : [];
  const upcomingReminders = useMemo(() => {
    const now = Date.now();
    const end = now + 48 * 60 * 60 * 1000;

    return scheduledReminders
      .filter((reminder: any) => {
        const scheduledTime = new Date(reminder.scheduledFor).getTime();
        return Number.isFinite(scheduledTime) && scheduledTime >= now && scheduledTime <= end;
      })
      .sort((a: any, b: any) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
      .slice(0, 3);
  }, [scheduledReminders]);

  const { code: currencyCode } = useCurrencySettings();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: currencyCode }).format(amount / 100);
  };

  const formatCurrencyShort = (amount: number) => {
    const val = amount / 100;
    if (val >= 1_000_000) return `${currencyCode} ${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${currencyCode} ${(val / 1_000).toFixed(0)}K`;
    return `${currencyCode} ${val.toFixed(0)}`;
  };

  // Financial summary cards (Kiini: One Hub. Total Control style)
  const financialCards = [
    {
      label: "Payments - Today",
      value: formatCurrencyShort(financialSummaryPlain?.paymentsToday || 0),
      icon: CreditCard,
      color: "border-b-4 border-cyan-500",
      href: "/payments",
    },
    {
      label: "Payments - Month",
      value: formatCurrencyShort(financialSummaryPlain?.paymentsMonth || 0),
      icon: DollarSign,
      color: "border-b-4 border-blue-500",
      href: "/payments",
    },
    {
      label: "Invoices - Due",
      value: formatCurrencyShort(financialSummaryPlain?.invoicesDue || 0),
      icon: FileText,
      color: "border-b-4 border-orange-400",
      href: "/invoices",
    },
    {
      label: "Invoices - Overdue",
      value: formatCurrencyShort(financialSummaryPlain?.invoicesOverdue || 0),
      icon: AlertCircle,
      color: "border-b-4 border-red-500",
      href: "/invoices",
    },
  ];

  // Chart data: scale down from cents
  const monthlyChartData = useMemo(() => {
    if (!chartDataPlain?.months?.length) return [];
    return chartDataPlain.months.map((m: any) => ({
      name: m.name,
      Income: Math.round((m.income || 0) / 100),
      Expense: Math.round((m.expense || 0) / 100),
    }));
  }, [chartDataPlain]);

  // Leads pipeline pie chart
  const LEAD_STAGES: Record<string, { label: string; color: string }> = {
    lead: { label: "New", color: "#94a3b8" },
    qualified: { label: "Qualified", color: "#3b82f6" },
    proposal: { label: "Proposal", color: "#8b5cf6" },
    negotiation: { label: "Negotiation", color: "#f59e0b" },
    closed_won: { label: "Won", color: "#22c55e" },
    closed_lost: { label: "Lost", color: "#ef4444" },
  };

  const leadsPipelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    const leadsArr = Array.isArray(leadsDataPlain) ? leadsDataPlain : (leadsDataPlain as any)?.items || [];
    leadsArr.forEach((lead: any) => {
      const stage = lead.stage || "lead";
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return Object.entries(LEAD_STAGES)
      .map(([key, cfg]) => ({ name: cfg.label, value: counts[key] || 0, color: cfg.color }))
      .filter(d => d.value > 0);
  }, [leadsDataPlain]);

  const totalLeads = leadsPipelineData.reduce((s, d) => s + d.value, 0);

  const stats = useMemo(() => [
    {
      label: "Total Revenue",
      value: statsDataPlain ? formatCurrency(statsDataPlain.totalRevenue || 0) : "KES 0",
      change: statsDataPlain?.revenueGrowth ? `${statsDataPlain.revenueGrowth > 0 ? "+" : ""}${statsDataPlain.revenueGrowth}%` : "0%",
      trend: (statsDataPlain?.revenueGrowth || 0) >= 0 ? "up" : "down",
      icon: <DollarSign className="h-4 w-4" />,
      description: "This month",
      href: "/accounting",
      color: "border-l-emerald-500",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    },
    {
      label: "Active Projects",
      value: statsDataPlain?.activeProjects?.toString() || "0",
      change: statsDataPlain?.newProjects ? `+${statsDataPlain.newProjects}` : "0",
      trend: "up" as const,
      icon: <FolderKanban className="h-4 w-4" />,
      description: "In progress",
      href: "/projects",
      color: "border-l-blue-500",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      label: "Total Clients",
      value: statsDataPlain?.totalClients?.toString() || "0",
      change: statsDataPlain?.newClients ? `+${statsDataPlain.newClients}` : "0",
      trend: "up" as const,
      icon: <Users className="h-4 w-4" />,
      description: "Active clients",
      href: "/clients",
      color: "border-l-violet-500",
      iconBg: "bg-gradient-to-br from-violet-500 to-violet-600",
    },
    {
      label: "Pending Invoices",
      value: metricsDataPlain?.pendingInvoices?.toString() || "0",
      change: "0",
      trend: "neutral" as const,
      icon: <FileText className="h-4 w-4" />,
      description: "Awaiting payment",
      href: "/invoices",
      color: "border-l-amber-500",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
    },
  ], [statsDataPlain, metricsDataPlain]);

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your business.
            </p>
          </div>
          <Button onClick={() => navigate("/projects/create")}>
            <FolderKanban className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Compact financial rail */}
        <div className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-sm dark:border-slate-700 dark:bg-slate-700 md:grid-cols-2 lg:grid-cols-4">
          {financialCards.map((card) => {
            const Icon = card.icon;
            return <button key={card.label} className="flex items-center justify-between bg-white px-4 py-3 text-left transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800" onClick={() => navigate(card.href)}><span><span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</span><span className="mt-1 block text-lg font-bold">{card.value}</span></span><Icon className="h-5 w-5 text-muted-foreground/60" /> </button>;
          })}
        </div>

        {/* One compact operating snapshot */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              description={stat.description}
              change={stat.change}
              trend={stat.trend}
              icon={stat.icon}
              iconBg={stat.iconBg}
              color={stat.color}
              onClick={() => navigate(stat.href)}
            />
          ))}
        </div>

        {/* Master modules: the homepage is the launchpad, not another module dashboard. */}
        <section className="space-y-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Workspace</p><h2 className="mt-1 text-xl font-bold tracking-tight">Every major module at a glance</h2></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Accounting", "Invoices, payments and cash flow", "/accounting", CreditCard, "text-emerald-600", `${metricsDataPlain?.pendingInvoices || 0} invoices pending`],
              ["Sales", "Pipeline, leads and proposals", "/sales", TrendingUp, "text-blue-600", `${totalLeads} leads in pipeline`],
              ["Reports", "Business intelligence and trends", "/reports", BarChart3, "text-violet-600", "Open analytics"],
              ["HR", "People, payroll and attendance", "/hr", Users, "text-rose-600", "People operations"],
              ["Enterprise", "Manage multiple organizations", "/enterprise/tenants", Layers, "text-slate-600", "Switch organizations"],
              ["Procurement", "Suppliers, orders and budgets", "/procurement", ShoppingCart, "text-amber-600", "Purchasing desk"],
              ["Inventory & Assets", "Stock, services and equipment", "/inventory", Package, "text-orange-600", `${metricsDataPlain?.totalProducts || 0} products`],
              ["Communications", "Chat, mailing and documents", "/staff-chat", Mail, "text-teal-600", "Open inbox"],
            ].map(([title, description, href, Icon, color, meta]) => <button key={title as string} onClick={() => navigate(href as string)} className="group rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between"><span className={`flex h-9 w-9 items-center justify-center rounded-md bg-slate-50 ${color as string} dark:bg-slate-800`}><Icon className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-500" /></div><span className="mt-3 block text-sm font-semibold">{title as string}</span><span className="mt-1 block text-xs text-muted-foreground">{description as string}</span><span className="mt-3 block text-[11px] font-medium text-slate-500">{meta as string}</span></button>)}
          </div>
        </section>

        {/* Charts Row: Income vs Expenses + Leads Pipeline */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Income vs Expenses Bar Chart */}
          <Card className="md:col-span-2 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/accounting")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Income vs Expenses</CardTitle>
                  <CardDescription>Monthly financial performance</CardDescription>
                </div>
                <Select value={String(chartYear)} onValueChange={(v) => setChartYear(Number(v))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {monthlyChartData.length === 0 ? (
                <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                  No financial data for {chartYear}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="amount"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
                    />
                    <YAxis yAxisId="trend" orientation="right" hide />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${currencyCode} ${value.toLocaleString()}`,
                        name,
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="amount" dataKey="Income" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="amount" dataKey="Expense" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="trend" type="monotone" dataKey="Income" name="Income trend" stroke="#0f766e" strokeWidth={2} dot={{ r: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Leads Pipeline Donut Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Leads Pipeline</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/leads")}>
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <CardDescription>
                {totalLeads} lead{totalLeads !== 1 ? "s" : ""} by stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leadsPipelineData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[240px] text-muted-foreground">
                  <Target className="h-10 w-10 mb-2 opacity-25" />
                  <p className="text-sm">No leads yet</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate("/leads")}
                  >
                    Add your first lead
                  </Button>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={leadsPipelineData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {leadsPipelineData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number, n: string) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {leadsPipelineData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: d.color }}
                          />
                          <span>{d.name}</span>
                        </div>
                        <span className="font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Work pulse */}
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Work pulse</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Keep the week moving</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/reminders")}>View reminders <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center justify-between text-base">Project delivery <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">On track</span></CardTitle><CardDescription>Active work across your projects</CardDescription></CardHeader>
              <CardContent><div className="mb-2 flex items-center justify-between text-sm"><span className="text-muted-foreground">{statsDataPlain?.activeProjects || 0} active projects</span><span className="font-semibold">{statsDataPlain?.activeProjects ? "On track" : "Get started"}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-3/4 rounded-full bg-teal-500" /></div><Button variant="link" className="mt-2 h-auto px-0 text-teal-700" onClick={() => navigate("/projects")}>Open projects <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4 text-amber-500" /> Upcoming reminders</CardTitle><CardDescription>Items due in the next 48 hours</CardDescription></CardHeader>
              <CardContent className="space-y-3">{upcomingReminders.length === 0 ? <button onClick={() => navigate("/reminders")} className="flex w-full items-center gap-3 rounded-lg border border-dashed p-3 text-left"><span className="min-w-0 flex-1"><span className="block text-sm font-medium">No reminders scheduled</span><span className="block text-xs text-muted-foreground">Schedule a follow-up to see it here.</span></span><ArrowRight className="h-4 w-4 text-muted-foreground" /></button> : upcomingReminders.map((reminder: any) => <button key={reminder.id} onClick={() => navigate("/reminders")} className="flex w-full items-center gap-3 text-left"><span className={`h-2 w-2 shrink-0 rounded-full ${reminder.type === "payment_overdue" ? "bg-rose-500" : reminder.type === "invoice_due" ? "bg-amber-500" : "bg-blue-500"}`} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{reminder.title || "Untitled reminder"}</span><span className="block text-xs text-muted-foreground">{formatReminderDue(reminder.scheduledFor)}</span></span><ArrowRight className="h-4 w-4 text-muted-foreground" /></button>)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><AlertCircle className="h-4 w-4 text-rose-500" /> Attention needed</CardTitle><CardDescription>Small blockers worth clearing today</CardDescription></CardHeader>
              <CardContent className="space-y-3"><div className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2.5"><span className="text-sm text-rose-800">{metricsDataPlain?.pendingInvoices || 0} invoices need follow-up</span><Button variant="link" className="h-auto p-0 text-xs text-rose-700" onClick={() => navigate("/invoices")}>Review</Button></div><div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5"><span className="text-sm">{totalLeads} leads to review</span><Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate("/leads")}>Open pipeline</Button></div></CardContent>
            </Card>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
