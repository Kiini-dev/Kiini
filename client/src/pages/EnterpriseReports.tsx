import { Building2, Download, Gauge, Users, ShieldCheck } from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ReportAnalyticsPanel } from "@/components/ReportAnalyticsPanel";
import { trpc } from "@/lib/trpc";
import { exportCsvWithCompanyHeader } from "@/utils/companyExport";

const planStyles: Record<string, string> = {
  trial: "bg-amber-100 text-amber-800",
  starter: "bg-blue-100 text-blue-800",
  gold: "bg-emerald-100 text-emerald-800",
  professional: "bg-violet-100 text-violet-800",
  enterprise: "bg-indigo-100 text-indigo-800",
  custom: "bg-orange-100 text-orange-800",
};

export default function EnterpriseReports() {
  const tenantsQuery = trpc.enterpriseTenants.list.useQuery({ limit: 100, offset: 0, sortBy: "createdAt", sortOrder: "desc" });
  const companyQuery = trpc.settings.getCompanyInfo.useQuery();
  const tenants = tenantsQuery.data?.tenants || [];
  const activeTenants = tenants.filter((tenant: any) => tenant.isActive).length;
  const users = tenants.reduce((sum: number, tenant: any) => sum + Number(tenant.userCount || 0), 0);
  const seats = tenants.reduce((sum: number, tenant: any) => sum + (tenant.maxUsers > 0 ? tenant.maxUsers : 0), 0);
  const planCounts = tenants.reduce((result: Record<string, number>, tenant: any) => {
    const plan = tenant.plan || "unassigned";
    result[plan] = (result[plan] || 0) + 1;
    return result;
  }, {});

  const exportReport = () => {
    exportCsvWithCompanyHeader(
      "enterprise-portfolio-report",
      tenants.map((tenant: any) => ({
        Organization: tenant.name,
        Slug: tenant.slug,
        Plan: tenant.plan || "Unassigned",
        Users: tenant.userCount || 0,
        SeatLimit: tenant.maxUsers === -1 ? "Unlimited" : tenant.maxUsers || 0,
        Status: tenant.isActive ? "Active" : "Inactive",
        Contact: tenant.contactEmail || "",
      })),
      {
        name: (companyQuery.data as any)?.companyName || (companyQuery.data as any)?.name,
        email: (companyQuery.data as any)?.email,
        phone: (companyQuery.data as any)?.phone,
        address: (companyQuery.data as any)?.address,
      },
    );
  };

  return (
    <ModuleLayout
      title="Enterprise Reports & Analytics"
      description="Cross-tenant visibility for platform health, capacity, and plan distribution"
      icon={<Gauge className="h-5 w-5" />}
      breadcrumbs={[{ label: "Dashboard", href: "/enterprise/tenants" }, { label: "Reports & Analytics" }]}
      actions={<Button variant="outline" onClick={exportReport} disabled={!tenants.length}><Download className="mr-2 h-4 w-4" />Export CSV</Button>}
    >
      {tenantsQuery.isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center"><Spinner className="h-7 w-7" /></div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard label="Total tenants" value={tenants.length} description="Organizations on platform" icon={<Building2 className="h-5 w-5" />} color="border-l-slate-500" />
            <StatsCard label="Active tenants" value={activeTenants} description="Available workspaces" icon={<ShieldCheck className="h-5 w-5" />} color="border-l-emerald-500" />
            <StatsCard label="Tenant users" value={users} description="Assigned users" icon={<Users className="h-5 w-5" />} color="border-l-blue-500" />
            <StatsCard label="Seat utilization" value={seats ? `${Math.round((users / seats) * 100)}%` : "-"} description={seats ? `${users} of ${seats} allocated seats` : "No finite seat limits"} icon={<Gauge className="h-5 w-5" />} color="border-l-amber-500" />
          </div>

          <ReportAnalyticsPanel
            title="Organizations by plan"
            description="Tenant distribution across platform plans"
            categoryKey="plan"
            data={(Object.entries(planCounts) as [string, number][]).map(([plan, count]) => ({ plan, tenants: count }))}
            series={[{ dataKey: "tenants", label: "Organizations", color: "#0f766e" }]}
          />

          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Tenant portfolio</CardTitle><CardDescription>Operational snapshot of every organization.</CardDescription></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-3 py-3">Organization</th><th className="px-3 py-3">Plan</th><th className="px-3 py-3">Users</th><th className="px-3 py-3">Status</th></tr></thead>
                    <tbody>
                      {tenants.map((tenant: any) => (
                        <tr key={tenant.id} className="border-b last:border-0">
                          <td className="px-3 py-3"><a className="font-medium hover:underline" href={`/enterprise/tenants/${tenant.id}`}>{tenant.name}</a><p className="text-xs text-muted-foreground">{tenant.slug}</p></td>
                          <td className="px-3 py-3"><Badge className={planStyles[tenant.plan] || "bg-slate-100 text-slate-700"}>{tenant.plan || "Unassigned"}</Badge></td>
                          <td className="px-3 py-3">{tenant.userCount || 0} / {tenant.maxUsers === -1 ? "∞" : tenant.maxUsers || 0}</td>
                          <td className="px-3 py-3">{tenant.isActive ? <span className="text-emerald-700">Active</span> : <span className="text-red-700">Inactive</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Plan mix</CardTitle><CardDescription>Tenant distribution by current plan.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {(Object.entries(planCounts) as [string, number][]).map(([plan, count]) => <div key={plan} className="flex items-center justify-between rounded-lg border p-3"><span className="capitalize">{String(plan)}</span><Badge variant="secondary">{String(count)}</Badge></div>)}
                {!Object.keys(planCounts).length && <p className="py-6 text-center text-sm text-muted-foreground">No plan data available.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
