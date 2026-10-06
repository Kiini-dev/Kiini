import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCurrencySettings } from "@/lib/currency";
import { generateDocumentHTML } from "@/lib/documentTemplate";
import { getDefaultDocumentTemplate, resolveTemplateTypeForDocument } from "@/lib/documentTemplateHelpers";
import { ArrowLeft, Printer, Edit2, Loader2, ShoppingCart } from "lucide-react";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgLPODetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams<{ id: string; slug?: string }>();
  const slug = params.slug as string;

  const canViewProcurement = hasAccess('org:procurement:view');
  const canEditProcurement = hasAccess('org:procurement:edit');
  const canDeleteProcurement = hasAccess('org:procurement:delete');

  const [, setLocation] = useLocation();
  const { hasPermission } = useOrgPermission();
  const { code: currencyCode } = useCurrencySettings();

  const { data: lpo, isLoading } = trpc.lpo.getById.useQuery(params.id!, { enabled: !!params.id });
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery({ limit: 100 });

  const vendorName = React.useMemo(() => {
    if (!lpo?.vendorId) return "—";
    const supplier = suppliers.find((s: any) => s.id === lpo.vendorId);
    return supplier?.companyName || supplier?.name || lpo.vendorId;
  }, [lpo?.vendorId, suppliers]);

  const handlePrint = () => {
    if (!lpo) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const html = generateDocumentHTML({
      documentType: "purchase_order",
      documentNumber: lpo.lpoNumber || "N/A",
      documentDate: lpo.createdAt ? new Date(lpo.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      dueDate: lpo.deliveryDate ? new Date(lpo.deliveryDate).toISOString().split("T")[0] : "",
      clientName: vendorName || "Vendor",
      items: [],
      subtotal: Number(lpo.amount || 0) / 100,
      tax: 0,
      total: Number(lpo.amount || 0) / 100,
      notes: lpo.notes || lpo.description || "",
    });
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (isLoading) return (<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>);
  if (!lpo) return (
    <OrgLayout title="LPO" showOrgInfo={false}>
      <PermissionGuard allowed={canViewProcurement} feature="org:procurement:view" slug={slug}>

      <div className="p-6">LPO not found</div>
    
      </PermissionGuard></OrgLayout>
  );

  return (
    <OrgLayout title={`LPO ${lpo.lpoNumber || ""}`} showOrgInfo={false}>
      <OrgBreadcrumb slug={slug} items={[{ label: "Purchase Orders", href: `/org/${slug}/lpos` }, { label: lpo.lpoNumber || "Details" }]} />
      <div className="max-w-4xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Badge className="text-sm px-3 py-1">{lpo.status?.toUpperCase()}</Badge>
          <span className="text-sm text-muted-foreground">Created {new Date(lpo.createdAt).toLocaleDateString()}</span>
        </div>

        <Card>
          <CardHeader className="pb-4"><CardTitle>Order Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">LPO Number</p>
                <p className="font-medium">{lpo.lpoNumber || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="font-medium">{vendorName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4"><CardTitle>Financial Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium text-lg">{lpo.amount ? new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(lpo.amount / 100) : "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{lpo.status || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation(`/org/${slug}/lpos`)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          {hasPermission("org:lpo:edit") && (
            <Button onClick={() => setLocation(`/org/${slug}/lpos/${params.id}/edit`)}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </Button>
          )}
        </div>
      </div>
    </OrgLayout>
  );
}
