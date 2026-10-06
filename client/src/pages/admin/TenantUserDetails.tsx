import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Building2, CheckCircle2, Mail, Phone, ShieldCheck, UserRound, XCircle } from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";

export default function TenantUserDetails() {
  const params = useParams() as unknown as { orgId?: string; userId?: string };
  const [, setLocation] = useLocation();
  const orgId = params.orgId || "";
  const userId = params.userId || "";

  const { data: user, isLoading } = trpc.organizationUsers.getById.useQuery({ organizationId: orgId, userId }, { enabled: !!orgId && !!userId });

  return (
    <ModuleLayout
      title={user?.name || "Tenant user details"}
      description="User profile, role, contact information, and account status"
      icon={<UserRound className="h-5 w-5" />}
      breadcrumbs={[{ label: "Enterprise", href: "/enterprise/tenants" }, { label: "Tenant users", href: "/crm/admin/tenant-users" }, { label: user?.name || "Details" }]}
      actions={<Button variant="outline" onClick={() => setLocation('/crm/admin/tenant-users')}><ArrowLeft className="mr-2 h-4 w-4" />Back to users</Button>}
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center"><Spinner className="h-7 w-7" /></div>
      ) : !user ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">This tenant user could not be found.</CardContent></Card>
      ) : (
        <div className="space-y-5">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="bg-slate-900 px-5 py-7 text-white sm:px-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-semibold">{user.name?.slice(0, 1).toUpperCase() || "?"}</div>
                  <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Tenant user</p><h2 className="mt-1 text-2xl font-semibold">{user.name || "Unnamed user"}</h2><p className="mt-1 text-sm text-white/65">{user.email || "No email address"}</p></div>
                </div>
                <Badge className={user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>{user.isActive ? "Active account" : "Inactive account"}</Badge>
              </div>
            </div>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-7">
              <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Email</p><p className="mt-1 break-all text-sm font-medium">{user.email || "Not set"}</p></div></div>
              <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Phone</p><p className="mt-1 text-sm font-medium">{user.phone || "Not set"}</p></div></div>
              <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Role</p><p className="mt-1 text-sm font-medium capitalize">{user.role?.replace(/_/g, " ") || "Not assigned"}</p></div></div>
              <div className="flex items-start gap-3"><Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Organization</p><p className="mt-1 break-all text-sm font-medium">{user.organizationId || "Not assigned"}</p></div></div>
            </CardContent>
          </Card>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle>Account access</CardTitle><CardDescription>Current identity and access state.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">Account status</span>{user.isActive ? <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" />Enabled</span> : <span className="flex items-center gap-1.5 text-sm font-medium text-red-700"><XCircle className="h-4 w-4" />Disabled</span>}</div><div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">Role</span><Badge variant="secondary" className="capitalize">{user.role?.replace(/_/g, " ") || "Unassigned"}</Badge></div></CardContent></Card>
            <Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle>Tenant assignment</CardTitle><CardDescription>This user belongs to the organization below.</CardDescription></CardHeader><CardContent><div className="rounded-lg border bg-slate-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organization ID</p><p className="mt-2 break-all text-sm font-medium">{user.organizationId || "Not assigned"}</p></div><Button className="mt-4 w-full" variant="outline" onClick={() => setLocation('/enterprise/tenants')}><Building2 className="mr-2 h-4 w-4" />Open enterprise organizations</Button></CardContent></Card>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
