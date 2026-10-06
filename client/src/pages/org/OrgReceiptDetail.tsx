import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash2, Receipt as ReceiptIcon } from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgReceiptDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const receiptId = params.id as string;

  const canViewInvoicing = hasAccess('org:invoicing:view');
  const canEditInvoicing = hasAccess('org:invoicing:edit');
  const canDeleteInvoicing = hasAccess('org:invoicing:delete');

  const [, setLocation] = useLocation();
  const { hasPermission } = useOrgPermission();
  const canEdit = hasPermission("receipts");
  const canDelete = hasPermission("receipts");

  const { data: receipt, isLoading } = trpc.receipts.getById.useQuery(receiptId, {
    enabled: !!receiptId && hasPermission("receipts"),
  });

  const utils = trpc.useUtils();
  const deleteMutation = trpc.receipts.delete.useMutation({
    onSuccess: () => {
      toast.success("Receipt deleted successfully");
      utils.receipts.list.invalidate();
      setLocation(`/org/${slug}/receipts`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete receipt");
    },
  });

  if (!hasPermission("receipts")) {
    return (
      <OrgLayout title="Receipt Details" showOrgInfo={false}>
      <PermissionGuard allowed={canViewInvoicing} feature="org:invoicing:view" slug={slug}>

        <div className="text-center py-16">
          <p className="text-white/60">You do not have permission to view receipts.</p>
          <Button variant="ghost" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  return (
    <OrgLayout title="Receipt Details" showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <OrgBreadcrumb
            slug={slug}
            items={[
              { label: "Dashboard", href: `/org/${slug}/dashboard` },
              { label: "Receipts", href: `/org/${slug}/receipts` },
              { label: receipt?.receiptNumber || receipt?.id?.slice(0, 8) || "Details" },
            ]}
          />
          <div className="flex gap-2">
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => setLocation(`/org/${slug}/receipts/${receiptId}/edit`)}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setLocation(`/org/${slug}/receipts`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-white/60">Loading receipt...</div>
        ) : !receipt ? (
          <div className="text-center py-16 text-white/60">Receipt not found.</div>
        ) : (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ReceiptIcon className="h-5 w-5" />
                  <CardTitle>{receipt.receiptNumber || `Receipt ${receipt.id?.slice(0, 8)}`}</CardTitle>
                </div>
                <Badge>{receipt.status || "Issued"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-white/60">Client</p>
                <p className="text-white">{receipt.clientName || receipt.clientId || "Unknown client"}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Amount</p>
                <p className="text-white">KES {(receipt.amount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Payment Date</p>
                <p className="text-white">{receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Payment Method</p>
                <p className="text-white">{receipt.paymentMethod || "N/A"}</p>
              </div>
            </CardContent>
            {receipt.notes && (
              <CardContent>
                <p className="text-sm text-white/60">Notes</p>
                <p className="text-white whitespace-pre-wrap">{receipt.notes}</p>
              </CardContent>
            )}
            {canDelete && (
              <CardContent className="flex justify-end">
                <Button variant="destructive" onClick={() => deleteMutation.mutate(receiptId)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </OrgLayout>
  );
}
