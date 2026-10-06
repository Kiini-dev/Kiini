import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Activity, TrendingUp, Shield } from "lucide-react";

const ANALYTICS_ITEMS = [
  {
    title: "System Health Overview",
    description: "Monitor real-time health metrics and uptime trends.",
    href: "/system-health",
    icon: <Activity className="h-5 w-5" />,
  },
  {
    title: "Performance Metrics",
    description: "Review CPU, memory, and storage performance statistics.",
    href: "/system-health",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: "Security Events",
    description: "Inspect recent security events and audit trails.",
    href: "/security",
    icon: <Shield className="h-5 w-5" />,
  },
];

export default function ICTAnalytics() {
  const [, navigate] = useLocation();

  return (
    <ModuleLayout
      title="ICT Analytics"
      description="Analytics, logs, and performance insights for ICT operations"
      icon={<BarChart3 className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "ICT", href: "/crm/ict" },
        { label: "Analytics" },
      ]}
      actions={(
        <Button variant="outline" size="sm" onClick={() => navigate("/crm/ict") }>
          Back to ICT
        </Button>
      )}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">24.5k</p>
              <p className="text-sm text-muted-foreground">Requests last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">185 ms</p>
              <p className="text-sm text-muted-foreground">Average latency across services</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Incident Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">92%</p>
              <p className="text-sm text-muted-foreground">Lower is better for incident risk</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {ANALYTICS_ITEMS.map((item) => (
            <Card
              key={item.title}
              className="cursor-pointer border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all"
              onClick={() => navigate(item.href)}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-200">
                    {item.icon}
                  </div>
                  <Button variant="ghost" className="text-sm">Open</Button>
                </div>
                <CardTitle className="mt-4 text-base">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-sm text-muted-foreground">
          <p className="font-semibold">Note</p>
          <p className="mt-2">
            This page provides a central entry point for ICT analytics. More detailed reporting and dashboard integration will appear here as the ICT experience matures.
          </p>
        </div>
      </div>
    </ModuleLayout>
  );
}
