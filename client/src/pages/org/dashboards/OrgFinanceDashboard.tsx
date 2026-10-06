import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useDashboardPermissions } from "@/_core/hooks/useDashboardPermissions";
import { trpc } from "@/lib/trpc";
import { useCurrency } from "@/pages/website/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign, FileText, TrendingUp, Receipt, Clock, AlertCircle,
  Plus, BarChart3, CheckCircle2, PieChart as PieChartIcon, CreditCard,
  Landmark, Banknote, TrendingDown, ArrowUp, ArrowDown,
} from "lucide-react";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  colorClass,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  colorClass: string;
  trend?: { value: number; isPositive: boolean } | null;
}) {
  return (
    <Card className="bg-card border-border hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.isPositive ? (
              <ArrowUp className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs font-medium ${trend.isPositive ? "text-green-500" : "text-red-500"}`}>
              {Math.abs(trend.value)}% {trend.isPositive ? "increase" : "decrease"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatCurrencyWithCode(n: number, code: string) {
  if (n >= 1_000_000) return `${code} ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${code} ${(n / 1_000).toFixed(1)}K`;
  return `${code} ${n.toFixed(0)}`;
}

export default function OrgFinanceDashboard() {
  const params = useParams();
  const slug = params.slug as string;
  const [, setLocation] = useLocation();
  const { user } = useAuthWithPersistence();
  const { userRole, loading: permLoading, canAccessFeature } = useDashboardPermissions();
  const { currency } = useCurrency();
  const currencyCode = currency.code;
  const formatCurrency = (n: number) => formatCurrencyWithCode(n, currencyCode);

  // Verify user has finance permissions
  if (!permLoading && userRole && userRole !== "accountant") {
    return (
      <OrgLayout title="Access Denied" showOrgInfo={false}>
        <div className="flex items-center justify-center p-8">
          <p className="text-destructive">You don't have permission to view this dashboard.</p>
        </div>
      </OrgLayout>
    );
  }

  const { data: analytics, isLoading: analyticsLoading } = trpc.multiTenancy.getOrgAnalytics.useQuery(undefined, {
    staleTime: 60_000,
  });

  const { data: orgData } = trpc.multiTenancy.getMyOrg.useQuery(undefined, {
    staleTime: 300_000,
  });

  const org = orgData?.organization;
  const featureMap = orgData?.featureMap ?? {};
  const kpis = analytics?.kpis;
  const monthlyTrend = analytics?.monthlyTrend ?? [];
  const invoiceStatusChart = analytics?.invoiceStatusChart ?? [];

  return (
    <OrgLayout title={org ? `${org.name} — Finance Dashboard` : "Finance Dashboard"} showOrgInfo={true}>
      <div className="space-y-6">
        {/* Finance Alert */}
        <Alert className="border-emerald-500/30 bg-emerald-500/5">
          <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-200">
            You are viewing the finance dashboard with detailed financial metrics and reporting.
          </AlertDescription>
        </Alert>

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Financial Overview</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Complete financial health and performance analysis</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setLocation(`/org/${slug}/invoices`)}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>

        {/* Critical Financial KPIs */}
        {analyticsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label="Total Revenue"
              value={formatCurrency(kpis?.totalInvoiced ?? 0)}
              sub={`${kpis?.totalInvoices ?? 0} invoices`}
              icon={DollarSign}
              colorClass="bg-green-500/15 text-green-500"
              trend={{ value: 12.5, isPositive: true }}
            />
            <KpiCard
              label="Payments Received"
              value={formatCurrency(kpis?.totalPaid ?? 0)}
              sub="collected"
              icon={CreditCard}
              colorClass="bg-blue-500/15 text-blue-500"
              trend={{ value: 8.2, isPositive: true }}
            />
            <KpiCard
              label="Outstanding"
              value={formatCurrency(kpis?.totalOutstanding ?? 0)}
              sub="pending collection"
              icon={Clock}
              colorClass="bg-yellow-500/15 text-yellow-500"
              trend={{ value: 3.1, isPositive: false }}
            />
            <KpiCard
              label="Collection Rate"
              value={kpis?.totalInvoiced ? `${Math.round(((kpis?.totalPaid ?? 0) / kpis.totalInvoiced) * 100)}%` : "—"}
              sub="paid / invoiced"
              icon={TrendingUp}
              colorClass="bg-purple-500/15 text-purple-500"
            />
            <KpiCard
              label="Total Expenses"
              value={formatCurrency(kpis?.totalExpenses ?? 0)}
              sub={`${kpis?.pendingExpenses ?? 0} pending`}
              icon={Receipt}
              colorClass="bg-orange-500/15 text-orange-500"
              trend={{ value: 5.3, isPositive: false }}
            />
            <KpiCard
              label="Net Profit"
              value={formatCurrency((kpis?.totalPaid ?? 0) - (kpis?.totalExpenses ?? 0))}
              sub="revenue minus expenses"
              icon={TrendingUp}
              colorClass="bg-cyan-500/15 text-cyan-500"
            />
            <KpiCard
              label="Average Invoice"
              value={kpis?.totalInvoices ? formatCurrency((kpis?.totalInvoiced ?? 0) / kpis.totalInvoices) : "—"}
              sub="per invoice"
              icon={Banknote}
              colorClass="bg-teal-500/15 text-teal-500"
            />
            <KpiCard
              label="Accounts Receivable"
              value={formatCurrency(kpis?.totalOutstanding ?? 0)}
              sub="overdue included"
              icon={Landmark}
              colorClass="bg-indigo-500/15 text-indigo-500"
            />
          </div>
        )}

        {/* Financial Charts & Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {analyticsLoading ? (
                  <Skeleton className="w-full h-full rounded-lg" />
                ) : monthlyTrend && monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center pt-20">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {analyticsLoading ? (
                  <Skeleton className="w-full h-full rounded-lg" />
                ) : invoiceStatusChart && invoiceStatusChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={invoiceStatusChart} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                        <Cell fill="#3b82f6" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center pt-20">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Management Tools */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/org/${slug}/invoices`)}>
            <CardHeader className="pb-3">
              <CardTitle>
                <FileText className="h-4 w-4" /> Invoicing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{kpis?.totalInvoices ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Create & manage invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/org/${slug}/payments`)}>
            <CardHeader className="pb-3">
              <CardTitle>
                <CreditCard className="h-4 w-4" /> Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(kpis?.totalPaid ?? 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Track payments received</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/30 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/org/${slug}/expenses`)}>
            <CardHeader className="pb-3">
              <CardTitle>
                <Receipt className="h-4 w-4" /> Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(kpis?.totalExpenses ?? 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Monitor all expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4">
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setLocation(`/org/${slug}/invoices`)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New Invoice
          </Button>
          <Button size="sm" variant="outline" className="border-border" onClick={() => setLocation(`/org/${slug}/payments`)}>
            <DollarSign className="h-3.5 w-3.5 mr-1.5" /> Record Payment
          </Button>
          <Button size="sm" variant="outline" className="border-border" onClick={() => setLocation(`/org/${slug}/expenses`)}>
            <Receipt className="h-3.5 w-3.5 mr-1.5" /> Add Expense
          </Button>
          <Button size="sm" variant="outline" className="border-border" onClick={() => setLocation(`/org/${slug}/reports`)}>
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Financial Reports
          </Button>
        </div>
      </div>
    </OrgLayout>
  );
}

