import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Network, Zap, HardDrive, Shield } from "lucide-react";

const SETTINGS_ITEMS = [
  {
    title: "Network Configuration",
    description: "Set up network rules, DNS, and connectivity controls.",
    href: "/admin/network",
    icon: <Network className="h-5 w-5" />,
  },
  {
    title: "Integration Management",
    description: "Register and monitor third-party integrations.",
    href: "/integrations",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    title: "Cron Jobs",
    description: "Review scheduled jobs and automated system tasks.",
    href: "/admin/cron-jobs",
    icon: <HardDrive className="h-5 w-5" />,
  },
  {
    title: "Backup Management",
    description: "Manage backups, snapshots and recovery workflows.",
    href: "/admin/backups",
    icon: <Server className="h-5 w-5" />,
  },
  {
    title: "Security Policy",
    description: "Review access controls, permissions, and audit settings.",
    href: "/admin/management",
    icon: <Shield className="h-5 w-5" />,
  },
];

export default function ICTSystemSettings() {
  const [, navigate] = useLocation();

  return (
    <ModuleLayout
      title="ICT System Settings"
      description="Central ICT settings and system-level configuration tasks"
      icon={<Server className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "ICT", href: "/crm/ict" },
        { label: "System Settings" },
      ]}
      actions={(
        <Button variant="outline" size="sm" onClick={() => navigate("/crm/ict") }>
          Back to ICT
        </Button>
      )}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SETTINGS_ITEMS.map((item) => (
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
              <CardContent>
                <p className="text-sm text-muted-foreground">This space is reserved for ICT system configuration and service controls.</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-sm text-muted-foreground">
          <p className="font-semibold">Note</p>
          <p className="mt-2">
            These controls are provided for ICT managers and system administrators. If you require deeper configuration, use the linked system pages.
          </p>
        </div>
      </div>
    </ModuleLayout>
  );
}
