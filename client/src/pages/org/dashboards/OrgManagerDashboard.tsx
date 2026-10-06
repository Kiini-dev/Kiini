import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgDashboardShell, { OrgDashboardAction, OrgDashboardMetric, OrgDashboardTip } from "@/components/OrgDashboardShell";
import { Button } from "@/components/ui/button";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useDashboardPermissions } from "@/_core/hooks/useDashboardPermissions";
import { trpc } from "@/lib/trpc";
import { useCurrency } from "@/pages/website/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import { Users, Target, List, DollarSign, Clock, CheckCircle2, BarChart3, ClipboardList, Plus, Receipt } from "lucide-react";

export default function OrgManagerDashboard() {
  const params = useParams();
  const slug = params.slug as string;
  const [, setLocation] = useLocation();
  const { user } = useAuthWithPersistence();
  const { userRole, loading: permLoading, canAccessFeature } = useDashboardPermissions();
  const { currency } = useCurrency();
  const currencyCode = currency.code || "KES";

  // Verify user has manager/staff permissions
  if (!permLoading && userRole && !["staff", "project_manager", "sales_manager"].includes(userRole)) {
    return (
      <OrgLayout title="Access Denied" showOrgInfo={false}>
        <div className="flex items-center justify-center p-8">
          <p className="text-destructive">You don't have permission to view this dashboard.</p>
        </div>
      </OrgLayout>
    );
  }

  const { data: analytics } = trpc.multiTenancy.getOrgAnalytics.useQuery(undefined, {
    staleTime: 60_000,
  });

  const { data: orgData } = trpc.multiTenancy.getMyOrg.useQuery(undefined, {
    staleTime: 300_000,
  });

  const { data: recentActivityData } = trpc.multiTenancy.getOrgActivity.useQuery({ limit: 5 });
  const recentActivities = recentActivityData?.activities ?? [];
  const org = orgData?.organization as any;
  const kpis = analytics?.kpis as any;

  const monthlyChartData = (analytics?.monthlyTrend ?? []).map((item: any) => ({
    name: item.name ?? item.month ?? "",
    income: Number(item.income ?? item.revenue ?? 0),
    expense: Number(item.expense ?? item.cost ?? 0),
  }));

  const financialBreakdown = [
    { name: "Revenue", value: Number(kpis?.totalInvoiced ?? 0) },
    { name: "Outstanding", value: Number(kpis?.totalOutstanding ?? 0) },
    { name: "Expenses", value: Number(kpis?.totalExpenses ?? 0) },
  ].filter((entry) => entry.value > 0);

  const actionCards: OrgDashboardAction[] = [
    {
      id: "projects",
      title: "Projects",
      description: "Manage and track all your projects",
      icon: <Target className="w-8 h-8" />,
      href: `/org/${slug}/projects`,
      color: "from-blue-500 to-blue-600",
      stats: { label: "Active Projects", value: kpis?.activeProjects ?? 0 },
    },
    {
      id: "team",
      title: "Team",
      description: "Manage your team and capacity",
      icon: <Users className="w-8 h-8" />,
      href: `/org/${slug}/staff`,
      color: "from-green-500 to-green-600",
      stats: { label: "Team Members", value: kpis?.totalEmployees ?? 0 },
    },
    {
      id: "tasks",
      title: "Tasks",
      description: "Track pending work across the team",
      icon: <List className="w-8 h-8" />,
      href: `/org/${slug}/tasks`,
      color: "from-yellow-500 to-yellow-600",
      stats: { label: "Pending Tasks", value: kpis?.pendingTasks ?? 0 },
    },
    {
      id: "reports",
      title: "Reports",
      description: "View performance and delivery metrics",
      icon: <BarChart3 className="w-8 h-8" />,
      href: `/org/${slug}/reports`,
      color: "from-teal-500 to-teal-600",
      stats: { label: "Insights", value: "Live" },
    },
    {
      id: "finance",
      title: "Finance",
      description: "Monitor revenue, costs, and invoices",
      icon: <DollarSign className="w-8 h-8" />,
      href: `/org/${slug}/payments`,
      color: "from-emerald-500 to-emerald-600",
      stats: { label: "Revenue", value: formatCurrency(Number(kpis?.totalInvoiced ?? 0)) },
    },
  ];

  const overviewMetrics: OrgDashboardMetric[] = [
    {
      title: "Team Members",
      value: String(kpis?.totalEmployees ?? 0),
      description: "Active employees in your team",
      icon: <Users className="w-5 h-5" />,
      color: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-400",
      href: `/org/${slug}/staff`,
    },
    {
      title: "Active Projects",
      value: String(kpis?.activeProjects ?? 0),
      description: "Projects currently in progress",
      icon: <Target className="w-5 h-5" />,
      color: "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-l-purple-400",
      href: `/org/${slug}/projects`,
    },
    {
      title: "Pending Tasks",
      value: String(kpis?.pendingTasks ?? 0),
      description: "Tasks to complete",
      icon: <List className="w-5 h-5" />,
      color: "border-l-yellow-500 bg-amber-50 dark:bg-amber-900/20 dark:border-l-amber-400",
      href: `/org/${slug}/tasks`,
    },
    {
      title: "Revenue Generated",
      value: formatCurrency(Number(kpis?.totalInvoiced ?? 0)),
      description: "This period",
      icon: <DollarSign className="w-5 h-5" />,
      color: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-l-emerald-400",
      href: `/org/${slug}/payments`,
    },
    {
      title: "Invoices Outstanding",
      value: formatCurrency(Number(kpis?.totalOutstanding ?? 0)),
      description: "Pending collection",
      icon: <Clock className="w-5 h-5" />,
      color: "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-l-amber-400",
      href: `/org/${slug}/invoices`,
    },
    {
      title: "Expenses Logged",
      value: formatCurrency(Number(kpis?.totalExpenses ?? 0)),
      description: "Current reports",
      icon: <Receipt className="w-5 h-5" />,
      color: "border-l-red-500 bg-red-50 dark:bg-red-900/20 dark:border-l-red-400",
      href: `/org/${slug}/expenses`,
    },
    {
      title: "Satisfaction",
      value: "4.2/5",
      description: "Team sentiment score",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "border-l-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 dark:border-l-cyan-400",
      href: `/org/${slug}/reports`,
    },
    {
      title: "On-Time Delivery",
      value: "92%",
      description: "Project completion rate",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "border-l-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:border-l-teal-400",
      href: `/org/${slug}/projects`,
    },
  ];

  const gettingStarted: OrgDashboardTip[] = [
    {
      title: "Create Your First Project",
      description: "Organize work and assign tasks to your team.",
      href: `/org/${slug}/projects/create`,
      buttonText: "New Project",
    },
    {
      title: "Add a Team Member",
      description: "Bring your team into the platform for collaboration.",
      href: `/org/${slug}/staff`,
      buttonText: "Add Member",
    },
    {
      title: "Track Pending Tasks",
      description: "Review and assign outstanding tasks for the team.",
      href: `/org/${slug}/tasks`,
      buttonText: "View Tasks",
    },
  ];

  return (
    <OrgLayout title={org ? `${org.name} — Manager Dashboard` : "Manager Dashboard"} showOrgInfo={true}>
      <div className="space-y-6">
        <OrgDashboardShell
          title="Team Overview"
          subtitle="Monitor your team's performance and projects"
          actionCards={actionCards}
          overviewMetrics={overviewMetrics}
          monthlyChartData={monthlyChartData}
          financialBreakdown={financialBreakdown}
          recentActivities={recentActivities}
          recentActivityHref={`/org/${slug}/activity`}
          gettingStarted={gettingStarted}
        />
      </div>
    </OrgLayout>
  );
}
