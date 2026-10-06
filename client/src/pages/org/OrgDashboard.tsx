import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/ui/stats-card";
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
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCurrencySettings } from "@/lib/currency";
import {
  BarChart,
  Bar,
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

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [chartYear, setChartYear] = useState(new Date().getFullYear());

  console.log('[Dashboard] Component mounted/updated');

  const { data: statsData, isLoading: isStatsLoading, error: statsError } = trpc.dashboard.stats.useQuery(undefined, { retry: 1, staleTime: 30000 });
  const { data: metricsData, isLoading: isMetricsLoading, error: metricsError } = trpc.dashboard.metrics.useQuery(undefined, { retry: 1, staleTime: 30000 });
  const { data: recentProjects = [], isLoading: isProjectsLoading, error: projectsError } = trpc.projects.list.useQuery({ limit: 3 }, { retry: 1, staleTime: 30000 });
  const { data: recentActivity = [], isLoading: isActivityLoading, error: activityError } = trpc.dashboard.recentActivity.useQuery({ limit: 5 }, { retry: 1, staleTime: 30000 });
  const { data: chartData, error: chartError } = trpc.dashboard.monthlyChart.useQuery({ year: chartYear }, { retry: 1, staleTime: 60000 });
  const { data: financialSummary, error: financialError } = trpc.dashboard.financialSummary.useQuery(undefined, { retry: 1, staleTime: 30000 });
  const { data: leadsData = [], error: leadsError } = trpc.opportunities.list.useQuery({}, { retry: 1, staleTime: 30000 });

  // Log query statuses
  React.useEffect(() => {
    console.log('[Dashboard] Query status:', {
      stats: { loading: isStatsLoading, error: !!statsError, errorMsg: statsError?.message },
      metrics: { loading: isMetricsLoading, error: !!metricsError, errorMsg: metricsError?.message },
      projects: { loading: isProjectsLoading, error: !!projectsError, errorMsg: projectsError?.message },
      activity: { loading: isActivityLoading, error: !!activityError, errorMsg: activityError?.message },
      chart: { error: !!chartError, errorMsg: chartError?.message },
      financial: { error: !!financialError, errorMsg: financialError?.message },
      leads: { error: !!leadsError, errorMsg: leadsError?.message },
    });
  }, [isStatsLoading, isMetricsLoading, isProjectsLoading, isActivityLoading, statsError, metricsError, projectsError, activityError, chartError, financialError, leadsError]);

  // Log any errors for debugging
  React.useEffect(() => {
    const errors = [statsError, metricsError, projectsError, activityError, chartError, financialError, leadsError].filter(Boolean);
    if (errors.length > 0) {
      console.warn('[Dashboard] Query errors:', errors.map(e => e?.message));
    }
  }, [statsError, metricsError, projectsError, activityError, chartError, financialError, leadsError]);

  const statsDataPlain = statsData ? JSON.parse(JSON.stringify(statsData)) : null;
  const metricsDataPlain = metricsData ? JSON.parse(JSON.stringify(metricsData)) : null;
  const recentProjectsPlain = recentProjects ? JSON.parse(JSON.stringify(recentProjects)) : [];
  const recentActivityPlain = recentActivity ? JSON.parse(JSON.stringify(recentActivity)) : [];
  // Also unwrap remaining queries to prevent React error #306 from frozen/proxy objects
  const chartDataPlain = chartData ? JSON.parse(JSON.stringify(chartData)) : null;
  const financialSummaryPlain = financialSummary ? JSON.parse(JSON.stringify(financialSummary)) : null;
  const leadsDataPlain = leadsData ? JSON.parse(JSON.stringify(leadsData)) : [];

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
      title: "Total Revenue",
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
      title: "Active Projects",
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
      title: "Total Clients",
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
      title: "Pending Invoices",
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

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case "project": return FolderKanban;
      case "client": return Users;
      case "invoice": return FileText;
      case "payment": return DollarSign;
      default: return Clock;
    }
  };

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
            return <button key={card.label} className="flex items-center justify-between bg-white px-4 py-3 text-left transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800" onClick={() => navigate(card.href)}><span><span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</span><span className="mt-1 block text-lg font-bold">{card.value}</span></span><Icon className="h-5 w-5 text-muted-foreground/60" /></button>;
          })}
        </div>

        {/* One compact operating snapshot */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              label={stat.title}
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
                  <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${currencyCode} ${value.toLocaleString()}`,
                        name,
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="Income" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Expense" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your active and upcoming projects</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjectsPlain.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No projects found</p>
                ) : (
                  recentProjectsPlain.map((project: any) => (
                    <div key={project.id} className="space-y-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors" onClick={() => navigate(`/projects/${project.id}`)}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.projectNumber}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : "No date"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress || 0}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivityPlain.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  recentActivityPlain.map((activity: any, index: number) => {
                    const Icon = getActivityIcon(activity.entityType || "");
                    return (
                      <div key={activity.id || index} className="flex gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{(activity.action || '').replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">{(activity.description || '')}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : "recently"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-6">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/clients/create")}>
                <Users className="h-6 w-6" />
                <span className="text-xs text-center">Add Client</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/projects/create")}>
                <FolderKanban className="h-6 w-6" />
                <span className="text-xs text-center">New Project</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/invoices/create")}>
                <FileText className="h-6 w-6" />
                <span className="text-xs text-center">Create Invoice</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/estimates/create")}>
                <FileSpreadsheet className="h-6 w-6" />
                <span className="text-xs text-center">New Estimate</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/receipts/create")}>
                <Receipt className="h-6 w-6" />
                <span className="text-xs text-center">New Receipt</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate("/leads")}>
                <Target className="h-6 w-6" />
                <span className="text-xs text-center">Add Lead</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

