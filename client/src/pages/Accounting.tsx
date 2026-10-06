import { useState, useEffect } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard, FileText, DollarSign, BarChart3, Plus, Receipt, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useRequireFeature } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { ModuleAnalyticsStrip } from "@/components/ModuleAnalyticsStrip";
import { StatsCard } from "@/components/ui/stats-card";
import { filterCarryForwardInvoices } from "@/lib/invoiceCarryForward";

export default function Accounting() {
  // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
  const { allowed, isLoading } = useRequireFeature("accounting:invoices:view");
  const [, navigate] = useLocation();
  const [financialData, setFinancialData] = useState({
    totalInvoices: 0,
    totalPayments: 0,
    totalExpenses: 0,
    totalRevenue: 0,
    netProfit: 0,
  });

  // Fetch accounting data from backend
  const { data: invoices = [] } = trpc.invoices.list.useQuery({});
  const { data: payments = [] } = trpc.payments.list.useQuery({});
  const { data: expenses = [] } = trpc.expenses.list.useQuery({});
  const filteredInvoices = filterCarryForwardInvoices(invoices as any[]);

  // Calculate financial metrics
  useEffect(() => {
    // Defensive check to ensure all data is available and is an array before proceeding
    if (!Array.isArray(invoices) || !Array.isArray(payments) || !Array.isArray(expenses)) {
      return;
    }
    
    const totalRevenue = filteredInvoices.reduce((sum, inv: any) => sum + (inv.total || 0), 0) / 100;
    const totalExpensesAmount = (expenses as any[]).reduce((sum, exp) => sum + (exp.amount || 0), 0) / 100;
    const netProfit = totalRevenue - totalExpensesAmount;

    const newData = {
      totalInvoices: invoices.length,
      totalPayments: payments.length,
      totalExpenses: expenses.length,
      totalRevenue,
      netProfit,
    };
    // avoid state churn if values unchanged
    setFinancialData(prev => {
      if (
        prev.totalInvoices === newData.totalInvoices &&
        prev.totalPayments === newData.totalPayments &&
        prev.totalExpenses === newData.totalExpenses &&
        prev.totalRevenue === newData.totalRevenue &&
        prev.netProfit === newData.netProfit
      ) {
        return prev;
      }
      return newData;
    });
  }, [invoices, payments, expenses]);

  // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  const outstandingInvoices = filteredInvoices.filter((invoice: any) => !["paid", "cancelled", "void"].includes(String(invoice.status || "").toLowerCase())).length;
  const overdueInvoices = filteredInvoices.filter((invoice: any) => {
    if (["paid", "cancelled", "void"].includes(String(invoice.status || "").toLowerCase())) return false;
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
    return dueDate && dueDate < new Date();
  }).length;
  const paymentCount = (payments as any[]).length;

  const accountingModules = [
    {
      title: "Invoices",
      description: "Create and manage client invoices",
      icon: FileText,
      href: "/invoices",
      stats: { label: "Total Invoices", value: financialData.totalInvoices.toString() },
      borderColor: "border-l-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-500",
    },
    {
      title: "Payments",
      description: "Track incoming and outgoing payments",
      icon: DollarSign,
      href: "/payments",
      stats: { label: "Total Payments", value: financialData.totalPayments.toString() },
      borderColor: "border-l-green-500",
      iconBg: "bg-green-50 dark:bg-green-950",
      iconColor: "text-green-500",
    },
    {
      title: "Expenses",
      description: "Record and manage business expenses",
      icon: Receipt,
      href: "/expenses",
      stats: { label: "Total Expenses", value: financialData.totalExpenses.toString() },
      borderColor: "border-l-orange-500",
      iconBg: "bg-orange-50 dark:bg-orange-950",
      iconColor: "text-orange-500",
    },
    {
      title: "Chart of Accounts",
      description: "Manage your accounting structure",
      icon: BarChart3,
      href: "/chart-of-accounts",
      stats: { label: "Accounts", value: "0" },
      borderColor: "border-l-purple-500",
      iconBg: "bg-purple-50 dark:bg-purple-950",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Accounting", href: "/accounting" },
      ]}
      title="Accounting"
      description="Manage invoices, payments, and financial records"
      icon={<CreditCard className="w-6 h-6" />}
    >
      <div className="space-y-6">
        <ModuleAnalyticsStrip title="Accounting at a glance" description="A compact view of cash flow and items needing attention." onOpen={() => navigate("/financial-dashboard")} metrics={[{ label: "Revenue", value: `Ksh ${financialData.totalRevenue.toLocaleString()}`, hint: "invoiced", tone: "teal", trend: "up" }, { label: "Expenses", value: financialData.totalExpenses, hint: "records", tone: "amber" }, { label: "Invoices", value: financialData.totalInvoices, hint: "tracked", tone: "blue" }, { label: "Net profit", value: `Ksh ${financialData.netProfit.toLocaleString()}`, hint: financialData.netProfit >= 0 ? "positive" : "review", tone: financialData.netProfit >= 0 ? "teal" : "rose", trend: financialData.netProfit >= 0 ? "up" : "down" }]} />
        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => navigate("/invoices/create")} className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
          <Button onClick={() => navigate("/payments/create")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Payment
          </Button>
          <Button onClick={() => navigate("/expenses/create")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Expense
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            label="Overdue invoices"
            value={overdueInvoices}
            description="Needs follow-up"
            color="border-l-rose-500"
            icon={<AlertCircle className="h-4 w-4" />}
            iconBg="bg-gradient-to-br from-rose-500 to-red-600"
            onClick={() => navigate("/invoices")}
          />
          <StatsCard
            label="Outstanding"
            value={outstandingInvoices}
            description="Open invoices"
            color="border-l-amber-500"
            icon={<FileText className="h-4 w-4" />}
            iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
            onClick={() => navigate("/invoices")}
          />
          <StatsCard
            label="Payments recorded"
            value={paymentCount}
            description="Keep cash flow current"
            color="border-l-sky-500"
            icon={<DollarSign className="h-4 w-4" />}
            iconBg="bg-gradient-to-br from-sky-500 to-blue-600"
            onClick={() => navigate("/payments")}
          />
          <StatsCard
            label="Reconciliation"
            value="Review"
            description="Open workspace"
            color="border-l-emerald-500"
            icon={<CheckCircle2 className="h-4 w-4" />}
            iconBg="bg-gradient-to-br from-emerald-500 to-green-600"
            onClick={() => navigate("/payment-reconciliation")}
          />
        </div>

        {/* Accounting Modules Grid - Unified Card Style */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {accountingModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.title}
                onClick={() => navigate(module.href)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border-l-4 p-4 sm:p-5 text-left transition-all duration-300",
                  "bg-white dark:bg-slate-800/60 border-t border-r border-b border-slate-200 dark:border-slate-700",
                  "hover:shadow-xl hover:-translate-y-1 cursor-pointer",
                  module.borderColor
                )}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-lg ${module.iconBg}`}>
                      <Icon className={`h-5 w-5 ${module.iconColor}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">{module.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{module.description}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{module.stats.label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-0.5">{module.stats.value}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-current to-transparent"></div>
              </button>
            );
          })}
        </div>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Overview of your financial position</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">Ksh {financialData.totalRevenue.toLocaleString('en-KE', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">Ksh {(financialData.totalRevenue - financialData.netProfit).toLocaleString('en-KE', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Outstanding Invoices</p>
                <p className="text-2xl font-bold">{financialData.totalInvoices}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Ksh {financialData.netProfit.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}

