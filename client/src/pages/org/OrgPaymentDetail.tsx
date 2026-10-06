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
import {
  ArrowLeft, DollarSign, Calendar, Building2, Edit2, Download,
  CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    completed: "bg-green-500/20 text-green-300 border-green-500/30",
    failed: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[status] ?? "bg-white/10 text-white/60 border-white/20"}`}>
      {status}
    </span>
  );
}

export default function OrgPaymentDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const paymentId = params.id as string;

  const canViewPayments = hasAccess('org:payments:view');
  const canEditPayments = hasAccess('org:payments:edit');
  const canDeletePayments = hasAccess('org:payments:delete');

  const [, setLocation] = useLocation();
  const { checkPermission } = useOrgPermission();

  const { data: payment, isLoading } = trpc.payments.getById.useQuery(paymentId, {
    enabled: !!paymentId && checkPermission("accounting:payments:view"),
  });

  const handleEdit = () => {
    setLocation(`/org/${slug}/payments/${paymentId}/edit`);
  };

  const handleBack = () => {
    setLocation(`/org/${slug}/payments`);
  };

  if (isLoading) {
    return (
      <OrgLayout slug={slug}>
      <PermissionGuard allowed={canViewPayments} feature="org:payments:view" slug={slug}>

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

  if (!payment) {
    return (
      <OrgLayout slug={slug}>
        <div className="p-6">
          <div className="text-center text-red-400">Payment not found</div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout slug={slug}>
      <div className="p-4 sm:p-6 space-y-6">
        <OrgBreadcrumb slug={slug} items={[
          { label: "Payments", href: `/org/${slug}/payments` },
          { label: `Payment #${paymentId}` },
        ]} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold sm:text-3xl">Payment Details</h1>
          </div>
          {checkPermission("accounting:payments:edit") && (
            <Button onClick={handleEdit} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Payment
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">
                  {payment.amount ? (payment.amount / 100).toFixed(2) : "0.00"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={payment.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>
                  {payment.paymentDate 
                    ? new Date(payment.paymentDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400">Payment Method</label>
                <p className="text-sm">{payment.method || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Reference</label>
                <p className="text-sm">{payment.reference || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Notes</label>
                <p className="text-sm">{payment.notes || "No notes"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}

