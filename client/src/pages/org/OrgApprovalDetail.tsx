import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, Calendar, CheckCircle2, AlertCircle, Edit2 } from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    approved: "bg-green-500/20 text-green-300 border-green-500/30",
    rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[status] ?? "bg-white/10 text-white/60 border-white/20"}`}>
      {status}
    </span>
  );
}

export default function OrgApprovalDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const approvalId = params.id as string;

  const canViewApprovals = hasAccess('org:approvals:view');
  const canEditApprovals = hasAccess('org:approvals:edit');
  const canDeleteApprovals = hasAccess('org:approvals:delete');

  const [, setLocation] = useLocation();
  const { checkPermission } = useOrgPermission();

  const { data: approval, isLoading } = trpc.approvals.getById.useQuery(approvalId, {
    enabled: !!approvalId && checkPermission("workflow:approvals:view"),
  });

  const handleEdit = () => {
    setLocation(`/org/${slug}/approvals/${approvalId}/edit`);
  };

  const handleBack = () => {
    setLocation(`/org/${slug}/approvals`);
  };

  if (isLoading) {
    return (
      <OrgLayout slug={slug}>
      <PermissionGuard allowed={canViewApprovals} feature="org:approvals:view" slug={slug}>

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

  if (!approval) {
    return (
      <OrgLayout slug={slug}>
        <div className="p-6">
          <div className="text-center text-red-400">Approval request not found</div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout slug={slug}>
      <div className="p-6 space-y-6">
        <OrgBreadcrumb slug={slug} items={[
          { label: "Approvals", href: `/org/${slug}/approvals` },
          { label: `Approval #${approvalId}` },
        ]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Approval Details</h1>
          </div>
          {checkPermission("workflow:approvals:edit") && (
            <Button onClick={handleEdit} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Approval
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Title</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{approval.title || "N/A"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={approval.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Submitted Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  {approval.submittedDate
                    ? new Date(approval.submittedDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Approval Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400">Description</label>
                <p className="text-sm">{approval.description || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Requested By</label>
                <p className="text-sm">{approval.requestedBy || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Approver</label>
                <p className="text-sm">{approval.approver || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Comments</label>
                <p className="text-sm">{approval.comments || "No comments"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}

