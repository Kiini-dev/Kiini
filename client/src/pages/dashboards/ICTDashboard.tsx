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
  Monitor,
  Menu,
  Users,
} from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { StatsCard } from "@/components/ui/stats-card";
import ICTDashboardNav, { ICTDashboardNavMobile } from "@/components/ICTDashboardNav";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Subpage component for ICT Dashboard pages
const ICTSubpage = ({ title, description }: { title: string; description: string }) => {
  const [, navigate] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: health } = trpc.ictManagement.getSystemHealth.useQuery(undefined, { staleTime: 60000 });
  const { data: emailQueue } = trpc.ictManagement.getEmailQueueStatus.useQuery({}, { staleTime: 60000 });
  const { data: sessions } = trpc.ictManagement.getActiveSessions.useQuery({}, { staleTime: 60000 });
  const { data: logs } = trpc.ictManagement.getSystemLogs.useQuery({ limit: 8, offset: 0 }, { staleTime: 30000 });
  const { data: audit } = trpc.ictManagement.getAuditLogs.useQuery({ limit: 8, offset: 0 }, { staleTime: 30000 });
  const { data: database } = trpc.ictManagement.getDatabaseStatus.useQuery(undefined, { staleTime: 60000 });

  const rows = title === "Active Sessions" ? sessions?.sessions ?? [] : title === "System Logs" || title === "System Activity" ? logs?.logs ?? [] : audit?.logs ?? [];
  const renderValue = (value: unknown) => value == null ? "-" : typeof value === "object" ? JSON.stringify(value) : String(value);

  return (
    <div className="flex min-h-screen bg-background">
      <ICTDashboardNavMobile isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <ModuleLayout
          title={title}
          description={description}
          icon={<Monitor className="h-5 w-5" />}
          breadcrumbs={[
            { label: "Dashboard", href: "/crm-home" },
            { label: "ICT", href: "/crm/ict" },
            { label: title },
          ]}
          actions={(
            <Button variant="outline" size="sm" onClick={() => setMobileNavOpen(true)}>
              <Menu className="mr-2 h-4 w-4" />
              Menu
            </Button>
          )}
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard label="Service Status" value={health?.status ?? "Checking"} description="Live system health" icon={<CheckCircle2 className="h-5 w-5" />} color="border-l-emerald-500" />
              <StatsCard label="Active Sessions" value={sessions?.count ?? 0} description="Current user sessions" icon={<Users className="h-5 w-5" />} color="border-l-blue-500" />
              <StatsCard label="Queued Email" value={emailQueue?.totalQueued ?? 0} description="Messages awaiting delivery" icon={<Mail className="h-5 w-5" />} color="border-l-amber-500" />
            </div>
            {title === "System Health" || title === "System Settings" ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[["CPU", health?.cpuUsage], ["Memory", health?.memoryUsage], ["Disk", health?.diskUsagePercent]].map(([label, value]) => (
                  <Card key={String(label)}><CardHeader><CardTitle className="text-base">{label} utilisation</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{value == null ? "-" : `${Math.round(Number(value))}%`}</p><p className="text-sm text-muted-foreground">Updated {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "pending"}</p></CardContent></Card>
                ))}
              </div>
            ) : title === "Email Queue" ? (
              <Card><CardHeader><CardTitle>Delivery summary</CardTitle><CardDescription>Current queue state by message status</CardDescription></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{(emailQueue?.summary ?? []).map((item) => <div key={item.status} className="rounded-lg border p-4"><p className="text-sm text-muted-foreground capitalize">{item.status}</p><p className="text-2xl font-semibold">{item.count}</p></div>)}</div></CardContent></Card>
            ) : title === "Data Management" ? (
              <Card><CardHeader><CardTitle>Database readiness</CardTitle><CardDescription>Connection and maintenance status</CardDescription></CardHeader><CardContent className="space-y-3"><p className="text-2xl font-semibold capitalize">{database?.status ?? "Checking"}</p><p className="text-muted-foreground">{database?.message ?? "Checking database connection..."}</p><ul className="list-disc pl-5 text-sm text-muted-foreground">{(database?.recommendations ?? []).map((recommendation) => <li key={recommendation}>{recommendation}</li>)}</ul></CardContent></Card>
            ) : (
              <Card><CardHeader><CardTitle>{title === "Active Sessions" ? "Live sessions" : "Recent events"}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent><div className="divide-y rounded-lg border">{rows.length === 0 ? <p className="p-6 text-center text-muted-foreground">No recent records.</p> : rows.map((row: any, index: number) => <div key={row.id ?? index} className="grid gap-1 p-4 sm:grid-cols-[1fr_auto]"><div><p className="font-medium">{renderValue(row.action ?? row.userEmail ?? row.severity ?? "System event")}</p><p className="text-sm text-muted-foreground">{renderValue(row.details ?? row.userAgent ?? row.message ?? row.ipAddress)}</p></div><p className="text-xs text-muted-foreground">{renderValue(row.createdAt ?? row.lastActivity)}</p></div>)}</div></CardContent></Card>
            )}
            <Button onClick={() => navigate("/crm/ict")} variant="outline"><ArrowRight className="mr-2 h-4 w-4 rotate-180" />Back to Dashboard</Button>
          </div>
        </ModuleLayout>
      </div>
    </div>
  );
};

export default function ICTDashboard() {
  const { allowed, isLoading, user } = useRequireRole(["ict_manager", "super_admin", "admin"]);
  const [location] = useLocation();
  
  // Handle subpage routing
  if (location.startsWith("/crm/ict/")) {
    const subpage = location.replace("/crm/ict/", "");
    
    const subpageConfig: { [key: string]: { title: string; description: string } } = {
      "system-settings": { title: "System Settings", description: "Configure system-wide settings and preferences" },
      "system-health": { title: "System Health", description: "Monitor system performance and health metrics" },
      "email-queue": { title: "Email Queue", description: "Monitor and manage pending email messages" },
      "analytics": { title: "System Analytics", description: "View system performance analytics and trends" },
      "database": { title: "Data Management", description: "Manage database operations and backups" },
      "integrations": { title: "Integration Management", description: "Configure and monitor third-party integrations" },
      "cron-jobs": { title: "Cron Jobs", description: "Review scheduled jobs and automated system tasks" },
      "security": { title: "Security & Access", description: "Configure security policies and access control" },
      "access-permissions": { title: "Access Permissions", description: "Manage user roles and permissions" },
      "api-keys": { title: "API Keys", description: "Manage API keys and authentication" },
      "network": { title: "Network Configuration", description: "Configure network and connection settings" },
      "activity": { title: "System Activity", description: "View system activity logs and audit trails" },
    };
    
    const config = subpageConfig[subpage];
    
    if (config) {
      return <ICTSubpage title={config.title} description={config.description} />;
    } else {
      return <ICTSubpage title="404 - Page Not Found" description="The requested page does not exist. Please navigate back to the ICT Dashboard." />;
    }
  }

  return <ICTDashboardHome allowed={allowed} isLoading={isLoading} user={user} />;
}

function ICTDashboardHome({
  allowed,
  isLoading,
  user,
}: {
  allowed: boolean;
  isLoading: boolean;
  user: { role: string } | null | undefined;
}) {
  const [, navigate] = useLocation();
  const [metrics, setMetrics] = useState({
    systemHealth: 95,
    activeUsers: 0,
    emailQueue: 0,
    uptime: "99.9%",
  });

  // Fetch real ICT system metrics
  const { data: systemHealthData, isLoading: healthLoading } = trpc.ictManagement.getSystemHealth.useQuery(undefined, { 
    enabled: allowed,
    refetchOnWindowFocus: false,
    staleTime: 60000, // Keep data fresh for 60 seconds
  });
  
  const { data: emailQueueData, isLoading: emailLoading } = trpc.ictManagement.getEmailQueueStatus.useQuery({}, { 
    enabled: allowed,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });
  
  const { data: activeSessionsData, isLoading: sessionsLoading } = trpc.ictManagement.getActiveSessions.useQuery({}, { 
    enabled: allowed,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  // Calculate system health percentage from CPU, memory, disk usage
  useEffect(() => {
    if (systemHealthData) {
      const avgUsage = (systemHealthData.cpuUsage + systemHealthData.memoryUsage + systemHealthData.diskUsagePercent) / 3;
      const healthPercent = Math.round(100 - avgUsage);
      
      setMetrics({
        systemHealth: Math.max(0, healthPercent),
        activeUsers: activeSessionsData?.count || 0,
        emailQueue: emailQueueData?.totalQueued || 0,
        uptime: `${systemHealthData.systemUptime || 0}h`,
      });
    }
  }, [systemHealthData, emailQueueData, activeSessionsData]);

  if (isLoading || healthLoading || emailLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <ModuleLayout
          title="ICT Dashboard"
          description="System administration, monitoring, and technical management"
          icon={<Monitor className="h-5 w-5" />}
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "ICT" }]}
        >
          <div className="space-y-8">

            {/* System Health Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                label="System Health"
                value={<>{metrics.systemHealth}%</>}
                description="Overall system status"
                icon={<CheckCircle2 className="h-5 w-5" />}
                color="border-l-blue-500"
              />

              <StatsCard
                label="Active Users"
                value={metrics.activeUsers}
                description="Currently online"
                icon={<TrendingUp className="h-5 w-5" />}
                color="border-l-green-500"
              />

              <StatsCard
                label="Email Queue"
                value={metrics.emailQueue}
                description="Pending emails"
                icon={<Mail className="h-5 w-5" />}
                color="border-l-purple-500"
              />

              <StatsCard
                label="Uptime"
                value={metrics.uptime}
                description="System availability"
                icon={<AlertCircle className="h-5 w-5" />}
                color="border-l-yellow-500"
              />
            </div>

            {/* System Info Card */}
            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription className="text-slate-400">
                  Current system status and details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-slate-400">System Status</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Operational
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Database</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Connected
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">API Status</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Responding
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ModuleLayout>
      </div>
    </div>
  );
}
