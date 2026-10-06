import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import {
  ArrowLeft, Calendar, AlertCircle, Edit2, User, FileText,
} from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    approved: "bg-green-500/20 text-green-300 border-green-500/30",
    rejected: "bg-red-500/20 text-red-300 border-red-500/30",
    cancelled: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[status] ?? "bg-white/10 text-white/60 border-white/20"}`}>
      {status}
    </span>
  );
}

export default function OrgLeaveDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const leaveId = params.id as string;

  const canViewLeave = hasAccess('org:leave:view');
  const canEditLeave = hasAccess('org:leave:edit');
  const canDeleteLeave = hasAccess('org:leave:delete');
  const canApproveLeave = hasAccess('org:leave:approve');

  const [, setLocation] = useLocation();
  const { checkPermission } = useOrgPermission();

  const { data: ownLeave, isLoading: ownLoading } = trpc.leave.getById.useQuery(leaveId, {
    enabled: !!leaveId && !canApproveLeave,
  });
  const { data: reviewLeave, isLoading: reviewLoading } = trpc.leave.getForApproval.useQuery(leaveId, {
    enabled: !!leaveId && canApproveLeave,
  });
  const leave = canApproveLeave ? reviewLeave : ownLeave;
  const isLoading = ownLoading || reviewLoading;

  if (isLoading) {
    return (
      <OrgLayout title="Leave Details" showOrgInfo={false}>
      <PermissionGuard allowed={canViewLeave} feature="org:leave:view" slug={slug}>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48 bg-white/5" />
            <Skeleton className="h-8 w-24 bg-white/5" />
          </div>
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-white/5" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-3/4 bg-white/5" />
                <Skeleton className="h-4 w-1/2 bg-white/5" />
              </div>
            </CardContent>
          </Card>
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  if (!leave) {
    return (
      <OrgLayout title="Leave Not Found" showOrgInfo={false}>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">Leave request not found or access denied.</p>
          <Button
            variant="ghost"
            className="mt-4 text-white/50 hover:text-white"
            onClick={() => setLocation(`/org/${slug}/leave`)}
          >
            Back to Leave
          </Button>
        </div>
      </OrgLayout>
    );
  }

  const startDate = leave.startDate ? new Date(leave.startDate) : null;
  const endDate = leave.endDate ? new Date(leave.endDate) : null;
  const daysCount = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;

  return (
    <OrgLayout title={`Leave: ${leave.leaveType || "Request"}`} showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <OrgBreadcrumb slug={slug} items={[
              { label: "Leave", href: `/org/${slug}/leave` },
              { label: leave.leaveType || `Leave ${leave.id.slice(-8)}` },
            ]} />
          </div>
          <div className="flex gap-2">
            {checkPermission("hr:leave:edit") && leave.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/5"
                onClick={() => setLocation(`/org/${slug}/leave/${leave.id}/edit`)}
              >
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-white border-white/20 hover:bg-white/5"
              onClick={() => setLocation(`/org/${slug}/leave`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leave Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Leave Information
                  </CardTitle>
                  <StatusBadge status={leave.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60">Leave Type</p>
                    <p className="text-white font-medium">{leave.leaveType || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Status</p>
                    <div className="mt-1"><StatusBadge status={leave.status} /></div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Start Date</p>
                    <p className="text-white">{startDate?.toLocaleDateString() || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">End Date</p>
                    <p className="text-white">{endDate?.toLocaleDateString() || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-white/60">Duration</p>
                    <p className="text-white font-medium">{daysCount} day{daysCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reason */}
            {leave.reason && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Reason for Leave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-sm">{leave.reason}</p>
                </CardContent>
              </Card>
            )}

            {/* Approval Comments */}
            {leave.approvalComments && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Approval Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-sm">{leave.approvalComments}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Leave Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-2">Approval Status</p>
                    <StatusBadge status={leave.status} />
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-2">Total Days</p>
                    <p className="text-sm font-semibold text-white">{daysCount} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {leave.employeeId && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Employee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white">{leave.employeeId}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
