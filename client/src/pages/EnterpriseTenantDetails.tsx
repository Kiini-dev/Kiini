import { useParams, useLocation } from "wouter";
import { ArrowLeft, Building2, CalendarDays, CheckCircle2, Globe2, Mail, Users, XCircle } from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";

const planStyles: Record<string, string> = {
  trial: "bg-amber-100 text-amber-800",
  starter: "bg-blue-100 text-blue-800",
  gold: "bg-emerald-100 text-emerald-800",
  professional: "bg-violet-100 text-violet-800",
  enterprise: "bg-indigo-100 text-indigo-800",
  custom: "bg-orange-100 text-orange-800",
};

function formatDate(value: unknown) {
  if (!value) return "Not available";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function Metric({ label, value, detail, icon }: { label: string; value: string | number; detail: string; icon: React.ReactNode }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">{icon}</div>
      </CardContent>
    </Card>
  );
}

export default function EnterpriseTenantDetails() {
  const { id = "" } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const tenantQuery = trpc.enterpriseTenants.getById.useQuery(id, { enabled: Boolean(id) });
  const metricsQuery = trpc.enterpriseTenants.getTenantMetrics.useQuery(id, { enabled: Boolean(id) });
  const tenant = tenantQuery.data as any;
  const metrics = metricsQuery.data as any;

  return (
    <ModuleLayout
      title={tenant?.name || "Tenant details"}
      description="Organization profile, subscription health, and operational activity"
      icon={<Building2 className="h-5 w-5" />}
      breadcrumbs={[{ label: "Dashboard", href: "/enterprise/tenants" }, { label: "Organizations", href: "/enterprise/tenants" }, { label: tenant?.name || "Tenant details" }]}
      actions={<Button variant="outline" onClick={() => setLocation("/enterprise/tenants")}><ArrowLeft className="mr-2 h-4 w-4" />Back to organizations</Button>}
    >
      {tenantQuery.isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center"><Spinner className="h-7 w-7" /></div>
      ) : !tenant ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">This organization could not be found.</CardContent></Card>
      ) : (
        <div className="space-y-5">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="border-b border-slate-200 bg-slate-900 px-5 py-6 text-white sm:px-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl font-semibold">{tenant.name?.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Organization profile</p>
                    <h2 className="mt-1 text-2xl font-semibold">{tenant.name}</h2>
                    <p className="mt-1 text-sm text-white/65">{tenant.slug || "No slug configured"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={planStyles[tenant.plan] || "bg-white/15 text-white"}>{tenant.plan || "Unassigned plan"}</Badge>
                  <Badge className={tenant.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>{tenant.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              </div>
            </div>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
              <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Contact email</p><p className="mt-1 text-sm font-medium break-all">{tenant.contactEmail || "Not set"}</p></div></div>
              <div className="flex items-start gap-3"><Globe2 className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Domain</p><p className="mt-1 text-sm font-medium break-all">{tenant.domain || "Platform domain"}</p></div></div>
              <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Created</p><p className="mt-1 text-sm font-medium">{formatDate(tenant.createdAt)}</p></div></div>
              <div className="flex items-start gap-3"><Users className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">User allowance</p><p className="mt-1 text-sm font-medium">{tenant.maxUsers === -1 ? "Unlimited" : `${tenant.maxUsers || 0} seats`}</p></div></div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Users" value={metrics?.userCount ?? tenant.userCount ?? 0} detail={tenant.maxUsers === -1 ? "Unlimited capacity" : `of ${tenant.maxUsers || 0} allocated`} icon={<Users className="h-5 w-5" />} />
            <Metric label="Open tickets" value={metrics?.newTickets ?? "-"} detail={`${metrics?.totalTickets ?? 0} total support tickets`} icon={<CheckCircle2 className="h-5 w-5" />} />
            <Metric label="Subscription" value={metricsQuery.isLoading ? "..." : metrics?.latestSubscription?.status || tenant.activeSubscription?.status || "Not set"} detail={tenant.activePlan?.name || "Current billing status"} icon={<Building2 className="h-5 w-5" />} />
            <Metric label="Last broadcast" value={formatDate(metrics?.lastCommunicationAt)} detail="Most recent tenant communication" icon={<CalendarDays className="h-5 w-5" />} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Account summary</CardTitle><CardDescription>Key ownership and lifecycle information for this tenant.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[['Tenant ID', tenant.id], ['Plan', tenant.activePlan?.name || tenant.plan || 'Not set'], ['Updated', formatDate(tenant.updatedAt)], ['Latest subscription', formatDate(metrics?.latestSubscription?.updatedAt || tenant.activeSubscription?.updatedAt)]].map(([label, value]) => <div key={String(label)} className="rounded-lg border bg-slate-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 break-all text-sm font-medium">{value || 'Not available'}</p></div>)}
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Service status</CardTitle><CardDescription>At-a-glance tenant availability.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">Workspace access</span>{tenant.isActive ? <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" />Available</span> : <span className="flex items-center gap-1.5 text-sm font-medium text-red-700"><XCircle className="h-4 w-4" />Paused</span>}</div>
                <div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">Billing plan</span><span className="text-sm font-medium capitalize">{tenant.plan || "Unassigned"}</span></div>
                <Button className="w-full" variant="outline" onClick={() => setLocation(`/enterprise/tenants-management`)}>Manage tenant</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
