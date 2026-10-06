import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useRequireRole } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import {
  FolderKanban,
  FileText,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function ClientDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuthWithPersistence({ redirectOnUnauthenticated: true });
  const { allowed, isLoading: permissionLoading } = useRequireRole(["client"]);
  const [metrics, setMetrics] = useState({
    activeProjects: 0,
    pendingInvoices: 0,
    totalSpent: 0,
    supportTickets: 0,
  });

  // Fetch dashboard metrics
  const { data: dashboardMetrics } = trpc.dashboard.metrics.useQuery(undefined, { enabled: allowed });
  const { data: supportTickets = [] } = trpc.tickets.list.useQuery({}, { enabled: allowed });

  useEffect(() => {
    if (dashboardMetrics) {
      setMetrics({
        activeProjects: dashboardMetrics.totalProjects || 0,
        pendingInvoices: dashboardMetrics.pendingInvoices || 0,
        totalSpent: dashboardMetrics.monthlyRevenue || 0,
        supportTickets: Array.isArray(supportTickets) ? supportTickets.filter((ticket: any) => ticket.status !== "closed").length : 0,
      });
    }
  }, [dashboardMetrics, supportTickets]);

  if (permissionLoading || !allowed) return null;

  const clientFeatures = [
    {
      title: "My Projects",
      description: "View your active projects",
      icon: <FolderKanban className="w-8 h-8" />,
      href: "/projects",
      color: "from-blue-500 to-blue-600",
      stat: { label: "Active", value: metrics.activeProjects },
    },
    {
      title: "Invoices",
      description: "View and download invoices",
      icon: <FileText className="w-8 h-8" />,
      href: "/invoices",
      color: "from-green-500 to-green-600",
      stat: { label: "Pending", value: metrics.pendingInvoices },
    },
    {
      title: "Payments",
      description: "View payment history",
      icon: <DollarSign className="w-8 h-8" />,
      href: "/payments",
      color: "from-purple-500 to-purple-600",
      stat: { label: "Total Spent", value: "KES " + metrics.totalSpent.toLocaleString("en-KE") },
    },
    {
      title: "Support",
      description: "Contact support team",
      icon: <MessageSquare className="w-8 h-8" />,
      href: "#",
      color: "from-orange-500 to-orange-600",
      stat: { label: "Open Tickets", value: metrics.supportTickets },
    },
  ];

  return (

    <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Client Portal
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Welcome back, {user?.name}. Manage your projects and invoices.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Active Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeProjects}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Pending Invoices</CardTitle>
                <FileText className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.pendingInvoices}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {metrics.totalSpent.toLocaleString("en-KE")}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Support Tickets</CardTitle>
                <MessageSquare className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.supportTickets}</div>
                <p className="text-xs text-muted-foreground">Open tickets</p>
              </CardContent>
            </Card>
          </div>

          {/* Client Features Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {clientFeatures.map((feature) => (
              <Card
                key={feature.href}
                className="cursor-pointer border border-slate-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60"
                onClick={() => navigate(feature.href)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} text-white`}>
                      {feature.icon}
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" className="w-full group-hover:bg-accent">
                      View {feature.title}
                    </Button>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {feature.stat.value}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Recent Activity</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">No recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your recent projects and invoices will appear here.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

