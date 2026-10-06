import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash2, FileText } from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgQuotationDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const quotationId = params.id as string;

  const canViewInvoicing = hasAccess('org:invoicing:view');
  const canEditInvoicing = hasAccess('org:invoicing:edit');
  const canDeleteInvoicing = hasAccess('org:invoicing:delete');

  const [, setLocation] = useLocation();
  const { hasPermission } = useOrgPermission();

  const canEdit = hasPermission("quotations");
  const canDelete = hasPermission("quotations");

  const { data: quotation, isLoading } = trpc.quotations.getById.useQuery(quotationId, {
    enabled: !!quotationId && hasPermission("quotations"),
  });

  const utils = trpc.useUtils();
  const deleteMutation = trpc.quotations.delete.useMutation({
    onSuccess: () => {
      toast.success("Quotation deleted successfully");
      utils.quotations.list.invalidate();
      setLocation(`/org/${slug}/quotations`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete quotation");
    },
  });

  if (!hasPermission("quotations")) {
    return (
      <OrgLayout title="Quotation Details" showOrgInfo={false}>
      <PermissionGuard allowed={canViewInvoicing} feature="org:invoicing:view" slug={slug}>

        <div className="text-center py-16">
          <p className="text-white/60">You do not have permission to view quotations.</p>
          <Button variant="ghost" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  return (
    <OrgLayout title="Quotation Details" showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <OrgBreadcrumb
            slug={slug}
            items={[
              { label: "Dashboard", href: `/org/${slug}/dashboard` },
              { label: "Quotations", href: `/org/${slug}/quotations` },
              { label: quotation?.rfqNo || quotation?.id?.slice(0, 8) || "Details" },
            ]}
          />
          <div className="flex gap-2">
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => setLocation(`/org/${slug}/quotations/${quotationId}/edit`)}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setLocation(`/org/${slug}/quotations`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-white/60">Loading quotation...</div>
        ) : !quotation ? (
          <div className="text-center py-16 text-white/60">Quotation not found.</div>
        ) : (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <CardTitle>{quotation.rfqNo || `Quotation ${quotation.id?.slice(0, 8)}`}</CardTitle>
                </div>
                <Badge>{quotation.status || "Draft"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-white/60">Supplier</p>
                <p className="text-white">{quotation.supplier || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Amount</p>
                <p className="text-white">KES {(quotation.amount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Due Date</p>
                <p className="text-white">{quotation.dueDate ? new Date(quotation.dueDate).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Created</p>
                <p className="text-white">{quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : "N/A"}</p>
              </div>
            </CardContent>
            {quotation.description && (
              <CardContent>
                <p className="text-sm text-white/60">Description</p>
                <p className="text-white whitespace-pre-wrap">{quotation.description}</p>
              </CardContent>
            )}
            {canDelete && (
              <CardContent className="flex justify-end">
                <Button variant="destructive" onClick={() => deleteMutation.mutate(quotationId)}>
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
