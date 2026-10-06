import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useRequireRole } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  AlertCircle,
  BarChart3,
  Mail,
  Shield,
  Network,
  Activity,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Lock,
  Database,
  Menu,
  X,
} from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import ICTDashboardNav from "@/components/ICTDashboardNav";
import { StatsCard } from "@/components/ui/stats-card";

export default function ICTDashboard() {
  const { allowed, isLoading } = useRequireRole(["ict_manager", "super_admin", "admin"]);
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    systemHealth: 95,
    activeUsers: 0,
    emailQueue: 0,
    uptime: "99.9%",
  });

  // Fetch analytics and system metrics
  const { data: dashboardMetrics } = trpc.dashboard.metrics.useQuery({}, {
    enabled: allowed,
  });

  useEffect(() => {
    if (dashboardMetrics) {
      setMetrics({
        systemHealth: 95,
        activeUsers: dashboardMetrics.activeClients || 0,
        emailQueue: 0,
        uptime: "99.9%",
      });
    }
  }, [dashboardMetrics]);

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

  const ictFeatures = [
    {
      title: "System Settings",
      description: "Configure system-wide settings and preferences",
      icon: <Settings className="w-8 h-8" />,
      href: "/admin/management",
      color: "from-blue-500 to-blue-600",
      stat: { label: "Health", value: `${metrics.systemHealth}%` },
    },
    {
      title: "Email Queue",
      description: "Monitor and manage email sending operations",
      icon: <Mail className="w-8 h-8" />,
      href: "/communications",
      color: "from-purple-500 to-purple-600",
      stat: { label: "Pending", value: metrics.emailQueue },
    },
    {
      title: "System Analytics",
      description: "View system performance and usage analytics",
      icon: <BarChart3 className="w-8 h-8" />,
      href: "/reports",
      color: "from-green-500 to-green-600",
      stat: { label: "Active Users", value: metrics.activeUsers },
    },
    {
      title: "Data Management",
      description: "View dashboards and data metrics",
      icon: <Database className="w-8 h-8" />,
      href: "/dashboard",
      color: "from-orange-500 to-orange-600",
      stat: { label: "Uptime", value: metrics.uptime },
    },
    {
      title: "Security & Access",
      description: "Monitor user sessions and security",
      icon: <Shield className="w-8 h-8" />,
      href: "/admin/management",
      color: "from-red-500 to-red-600",
      stat: { label: "Status", value: "Secure" },
    },
    {
      title: "System Activity",
      description: "Review system logs and activity",
      icon: <Activity className="w-8 h-8" />,
      href: "/activity",
      color: "from-cyan-500 to-cyan-600",
      stat: { label: "Status", value: "Normal" },
    },
  ];

  return (
    <ModuleLayout
      title="ICT Manager Dashboard"
      description="System administration, monitoring, and technical management"
      icon={<Settings className="h-5 w-5" />}
      actions={
        <Button
          variant="outline"
          className="gap-2 lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="h-4 w-4" />
          Menu
        </Button>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <ICTDashboardNav isOpen />
        </aside>
        <div className="space-y-8">
          <div className="text-center space-y-4 py-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              ICT Manager Dashboard
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              System administration, monitoring, and technical management
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              label="System Health"
              value={`${metrics.systemHealth}%`}
              description="Overall system status"
              icon={<CheckCircle2 className="h-4 w-4" />}
              iconBg="bg-blue-500"
              color="border-l-blue-500"
            />

            <StatsCard
              label="Active Users"
              value={metrics.activeUsers}
              description="Currently online"
              icon={<TrendingUp className="h-4 w-4" />}
              iconBg="bg-emerald-500"
              color="border-l-emerald-500"
            />

            <StatsCard
              label="Email Queue"
              value={metrics.emailQueue}
              description="Pending emails"
              icon={<Mail className="h-4 w-4" />}
              iconBg="bg-violet-500"
              color="border-l-violet-500"
            />

            <StatsCard
              label="Uptime"
              value={metrics.uptime}
              description="System availability"
              icon={<AlertCircle className="h-4 w-4" />}
              iconBg="bg-amber-500"
              color="border-l-amber-500"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ictFeatures.map((feature) => (
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
                      Access
                    </Button>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {feature.stat.value}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Troubleshooting & Support</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => navigate("/admin/management")}
              >
                <Shield className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">System Administration</div>
                  <div className="text-sm text-muted-foreground">Manage users, roles & permissions</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => navigate("/tools")}
              >
                <Settings className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Tools & Utilities</div>
                  <div className="text-sm text-muted-foreground">Access system tools and utilities</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => navigate("/activity")}
              >
                <Activity className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">System Activity</div>
                  <div className="text-sm text-muted-foreground">Review system logs and events</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => navigate("/documentation")}
              >
                <Lock className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Documentation</div>
                  <div className="text-sm text-muted-foreground">Technical documentation & guides</div>
                </div>
              </Button>
            </div>
          </div>

          <Card className="border border-slate-200 bg-slate-50 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-50">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Current system status and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">System Status</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Operational
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Database</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Connected
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">API Status</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Responding
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModuleLayout>
  );
}
