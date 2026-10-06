import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgDashboardShell, { OrgDashboardAction, OrgDashboardMetric, OrgDashboardTip } from "@/components/OrgDashboardShell";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useDashboardPermissions } from "@/_core/hooks/useDashboardPermissions";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Users, Calendar, ClipboardList, Globe, Gift, Award, BookOpen, User, MessageSquare, Briefcase } from "lucide-react";

export default function OrgEmployeeDashboard() {
  const params = useParams();
  const slug = params.slug as string;
  const [, setLocation] = useLocation();
  const { user } = useAuthWithPersistence();
  const { userRole, loading: permLoading, canAccessFeature } = useDashboardPermissions();

  const { data: analytics } = trpc.multiTenancy.getOrgAnalytics.useQuery(undefined, {
    staleTime: 60_000,
  });

  const { data: orgData } = trpc.multiTenancy.getMyOrg.useQuery(undefined, {
    staleTime: 300_000,
  });

  const { data: recentActivityData } = trpc.multiTenancy.getOrgActivity.useQuery({ limit: 5 });
  const recentActivities = recentActivityData?.activities ?? [];
  const org = orgData?.organization;
  const kpis = analytics?.kpis as any;

  const monthlyChartData = (analytics?.monthlyTrend ?? []).map((item: any) => ({
    name: item.name ?? item.month ?? "",
    income: Number(item.income ?? item.revenue ?? 0),
    expense: Number(item.expense ?? item.cost ?? 0),
  }));

  const actionCards: OrgDashboardAction[] = [
    {
      id: "tasks",
      title: "My Tasks",
      description: "View tasks assigned to you",
      icon: <ClipboardList className="w-8 h-8" />,
      href: `/org/${slug}/tasks`,
      color: "from-blue-500 to-blue-600",
      stats: { label: "Open Tasks", value: kpis?.myPendingTasks ?? 0 },
    },
    {
      id: "leave",
      title: "Leave Requests",
      description: "Check your leave balance and approvals",
      icon: <Calendar className="w-8 h-8" />,
      href: `/org/${slug}/leave`,
      color: "from-emerald-500 to-emerald-600",
      stats: { label: "Days Remaining", value: kpis?.leaveBalance ?? 0 },
    },
    {
      id: "messages",
      title: "Messages",
      description: "Read your latest team communications",
      icon: <MessageSquare className="w-8 h-8" />,
      href: `/org/${slug}/communications`,
      color: "from-violet-500 to-violet-600",
      stats: { label: "Unread", value: kpis?.unreadMessages ?? 0 },
    },
    {
      id: "profile",
      title: "My Profile",
      description: "Review and update your profile details",
      icon: <User className="w-8 h-8" />,
      href: `/org/${slug}/profile`,
      color: "from-teal-500 to-teal-600",
      stats: { label: "Status", value: user?.name ?? "You" },
    },
    {
      id: "benefits",
      title: "Benefits",
      description: "See what benefits are available to you",
      icon: <Gift className="w-8 h-8" />,
      href: `/org/${slug}/benefits`,
      color: "from-amber-500 to-amber-600",
      stats: { label: "Available", value: "Yes" },
    },
  ];

  const overviewMetrics: OrgDashboardMetric[] = [
    {
      title: "Open Tasks",
      value: String(kpis?.myPendingTasks ?? 0),
      description: "Tasks waiting for your action",
      icon: <ClipboardList className="w-5 h-5" />,
      color: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-400",
      href: `/org/${slug}/tasks`,
    },
    {
      title: "Leave Balance",
      value: String(kpis?.leaveBalance ?? 0),
      description: "Days remaining",
      icon: <Calendar className="w-5 h-5" />,
      color: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-l-emerald-400",
      href: `/org/${slug}/leave`,
    },
    {
      title: "Unread Messages",
      value: String(kpis?.unreadMessages ?? 0),
      description: "Latest updates and alerts",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "border-l-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:border-l-violet-400",
      href: `/org/${slug}/communications`,
    },
    {
      title: "Assigned Projects",
      value: String(kpis?.assignedProjects ?? 0),
      description: "Your active work streams",
      icon: <Briefcase className="w-5 h-5" />,
      color: "border-l-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 dark:border-l-cyan-400",
      href: `/org/${slug}/projects`,
    },
    {
      title: "Training Hours",
      value: String(kpis?.completedTraining ?? 0),
      description: "Learning completed",
      icon: <BookOpen className="w-5 h-5" />,
      color: "border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-l-amber-400",
      href: `/org/${slug}/training`,
    },
  ];

  const gettingStarted: OrgDashboardTip[] = [
    {
      title: "Check Your Tasks",
      description: "Review what needs to be completed today.",
      href: `/org/${slug}/tasks`,
      buttonText: "View Tasks",
    },
    {
      title: "Submit Leave",
      description: "Request time off with a few clicks.",
      href: `/org/${slug}/leave`,
      buttonText: "Request Leave",
    },
    {
      title: "Update Profile",
      description: "Keep your personal details current.",
      href: `/org/${slug}/profile`,
      buttonText: "Edit Profile",
    },
  ];

  return (
    <OrgLayout title={org ? `${org.name} — My Dashboard` : "My Dashboard"} showOrgInfo={true}>
      <div className="space-y-6">
        <OrgDashboardShell
          title="Welcome back"
          subtitle={`Hello ${user?.name?.split(" ")[0] || "there"}, here's your personal overview`}
          actionCards={actionCards}
          overviewMetrics={overviewMetrics}
          monthlyChartData={monthlyChartData}
          financialBreakdown={[]}
          recentActivities={recentActivities}
          recentActivityHref={`/org/${slug}/activity`}
          gettingStarted={gettingStarted}
        />
      </div>
    </OrgLayout>
  );
}
