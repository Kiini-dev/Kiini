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
import {
  ArrowLeft, Wrench, Calendar, DollarSign, AlertCircle, Edit2,
} from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, string> = {
    draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    open: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "in-progress": "bg-amber-500/20 text-amber-300 border-amber-500/30",
    completed: "bg-green-500/20 text-green-300 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[status] ?? "bg-white/10 text-white/60 border-white/20"}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  const map: Record<string, string> = {
    low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    high: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    critical: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[priority] ?? "bg-white/10 text-white/60 border-white/20"}`}>
      {priority}
    </span>
  );
}

export default function OrgWorkOrderDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const workOrderId = params.id as string;

  const canViewWorkOrders = hasAccess('org:work_orders:view');
  const canEditWorkOrders = hasAccess('org:work_orders:edit');
  const canDeleteWorkOrders = hasAccess('org:work_orders:delete');

  const [, setLocation] = useLocation();
  const { checkPermission } = useOrgPermission();

  const { data: workOrder, isLoading } = trpc.workOrders.get.useQuery(workOrderId, {
    enabled: !!workOrderId && checkPermission("operations:work-orders:view"),
  });

  if (isLoading) {
    return (
      <OrgLayout title="Work Order Details" showOrgInfo={false}>
      <PermissionGuard allowed={canViewWorkOrders} feature="org:work_orders:view" slug={slug}>

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

  if (!workOrder) {
    return (
      <OrgLayout title="Work Order Not Found" showOrgInfo={false}>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">Work order not found or access denied.</p>
          <Button
            variant="ghost"
            className="mt-4 text-white/50 hover:text-white"
            onClick={() => setLocation(`/org/${slug}/work-orders`)}
          >
            Back to Work Orders
          </Button>
        </div>
      </OrgLayout>
    );
  }

  const totalCost = (Number(workOrder.laborCost || 0) + Number(workOrder.serviceCost || 0));

  return (
    <OrgLayout title={`Work Order ${workOrder.workOrderNumber}`} showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <OrgBreadcrumb slug={slug} items={[
              { label: "Work Orders", href: `/org/${slug}/work-orders` },
              { label: workOrder.workOrderNumber || `WO ${workOrder.id.slice(-8)}` },
            ]} />
          </div>
          <div className="flex gap-2">
            {checkPermission("operations:work-orders:edit") && (
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/5"
                onClick={() => setLocation(`/org/${slug}/work-orders/${workOrder.id}/edit`)}
              >
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-white border-white/20 hover:bg-white/5"
              onClick={() => setLocation(`/org/${slug}/work-orders`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Work Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Work Order Details
                  </CardTitle>
                  <StatusBadge status={workOrder.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60">Work Order Number</p>
                    <p className="text-white font-medium">{workOrder.workOrderNumber || `WO-${workOrder.id.slice(-8)}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Issue Date</p>
                    <p className="text-white">{workOrder.issueDate ? new Date(workOrder.issueDate).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Priority</p>
                    <div className="mt-1"><PriorityBadge priority={workOrder.priority} /></div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Assigned To</p>
                    <p className="text-white">{workOrder.assignedTo || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Start Date</p>
                    <p className="text-white">{workOrder.startDate ? new Date(workOrder.startDate).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Target End Date</p>
                    <p className="text-white">{workOrder.targetEndDate ? new Date(workOrder.targetEndDate).toLocaleDateString() : "—"}</p>
                  </div>
                </div>
                {workOrder.description && (
                  <div className="mt-4">
                    <p className="text-sm text-white/60 mb-1">Description</p>
                    <p className="text-white text-sm">{workOrder.description}</p>
                  </div>
                )}
                {workOrder.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-white/60 mb-1">Notes</p>
                    <p className="text-white text-sm">{workOrder.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <p className="text-white/60">Labor Cost</p>
                    <p className="text-white font-medium">KES {Number(workOrder.laborCost || 0).toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-white/60">Service Cost</p>
                    <p className="text-white font-medium">KES {Number(workOrder.serviceCost || 0).toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3">
                    <p className="text-white font-semibold">Total</p>
                    <p className="text-white font-bold">KES {totalCost.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Work Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-2">Current Status</p>
                    <StatusBadge status={workOrder.status} />
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-2">Priority Level</p>
                    <PriorityBadge priority={workOrder.priority} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {workOrder.assignedTo && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white">{workOrder.assignedTo}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
