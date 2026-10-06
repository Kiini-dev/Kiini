import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, DollarSign, Calendar, Building2, Edit2, Download } from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, string> = {
    draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    sent: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    accepted: "bg-green-500/20 text-green-300 border-green-500/30",
    rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[status] ?? "bg-white/10 text-white/60 border-white/20"}`}>
      {status}
    </span>
  );
}

export default function OrgEstimateDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const estimateId = params.id as string;

  const canViewInvoicing = hasAccess('org:invoicing:view');
  const canEditInvoicing = hasAccess('org:invoicing:edit');
  const canDeleteInvoicing = hasAccess('org:invoicing:delete');

  const [, setLocation] = useLocation();
  const { checkPermission } = useOrgPermission();

  const { data: estimate, isLoading } = trpc.estimates.getById.useQuery(estimateId, {
    enabled: !!estimateId && checkPermission("sales:estimates:view"),
  });

  const handleEdit = () => {
    setLocation(`/org/${slug}/estimates/${estimateId}/edit`);
  };

  const handleBack = () => {
    setLocation(`/org/${slug}/estimates`);
  };

  if (isLoading) {
    return (
      <OrgLayout slug={slug}>
      <PermissionGuard allowed={canViewInvoicing} feature="org:invoicing:view" slug={slug}>

        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-1/4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  if (!estimate) {
    return (
      <OrgLayout slug={slug}>
        <div className="p-6">
          <div className="text-center text-red-400">Estimate not found</div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout slug={slug}>
      <div className="p-6 space-y-6">
        <OrgBreadcrumb slug={slug} items={[
          { label: "Estimates", href: `/org/${slug}/estimates` },
          { label: `Estimate #${estimateId}` },
        ]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Estimate Details</h1>
          </div>
          {checkPermission("sales:estimates:edit") && (
            <Button onClick={handleEdit} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Estimate
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">
                  {estimate.total ? (estimate.total / 100).toFixed(2) : "0.00"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={estimate.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Valid Until</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>
                  {estimate.expiryDate
                    ? new Date(estimate.expiryDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Estimate Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400">Description</label>
                <p className="text-sm">{estimate.description || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Client</label>
                <p className="text-sm">{estimate.clientName || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Notes</label>
                <p className="text-sm">{estimate.notes || "No notes"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}

