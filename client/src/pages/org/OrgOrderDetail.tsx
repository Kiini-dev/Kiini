import { useMemo } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useCurrencySettings } from "@/lib/currency";
import { ArrowLeft, Building2, Coins, Truck, StickyNote, Edit2, Loader2 } from "lucide-react";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgOrderDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams<{ slug: string; id: string }>();
  const slug = params.slug as string;
  const id = params.id as string;

  const canViewProcurement = hasAccess('org:procurement:view');
  const canEditProcurement = hasAccess('org:procurement:edit');
  const canDeleteProcurement = hasAccess('org:procurement:delete');

  const [, setLocation] = useLocation();
  const { hasPermission } = useOrgPermission();

  const { data: order, isLoading } = trpc.procurementMgmt.orderGetById.useQuery(id, { enabled: !!id });
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery({ limit: 100 });
  const { code: currencyCode } = useCurrencySettings();

  const supplierName = useMemo(() => {
    if (!order?.supplierId) return order?.supplierName || "—";
    const supplier = suppliers.find((s: any) => s.id === order.supplierId);
    return supplier?.companyName || supplier?.name || order.supplierName || "—";
  }, [order?.supplierId, order?.supplierName, suppliers]);

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    delivered: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
  };

  if (isLoading) {
    return (
      <OrgLayout title="Order Details" showOrgInfo={false}>
      <PermissionGuard allowed={canViewProcurement} feature="org:procurement:view" slug={slug}>

        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  if (!order) {
    return (
      <OrgLayout title="Order Details" showOrgInfo={false}>
        <div className="flex flex-col items-center justify-center p-8 gap-4 text-muted-foreground">
          <p>Order not found</p>
          <Button onClick={() => setLocation(`/org/${slug}/orders`)}>Back to Orders</Button>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout title={`Order ${order.orderNumber || "Details"}`} showOrgInfo={false}>
      <OrgBreadcrumb slug={slug} items={[{ label: "Orders", href: `/org/${slug}/orders` }, { label: order.orderNumber || "Details" }]} />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{order.orderNumber || "Order Details"}</h1>
            <p className="text-muted-foreground mt-2">Purchase order details for the organization.</p>
          </div>
          <div className="flex gap-2">
            {hasPermission("orders") && (
              <Button onClick={() => setLocation(`/org/${slug}/orders/${id}/edit`)}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </Button>
            )}
            <Button variant="outline" onClick={() => setLocation(`/org/${slug}/orders`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={`mt-1 ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>{order.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PO Date</p>
                <p className="font-medium">{order.poDate ? new Date(order.poDate).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Date</p>
                <p className="font-medium">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financials</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">
                  {order.totalAmount != null
                    ? new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(order.totalAmount / 100)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p className="font-medium">{order.deliveryAddress || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {(order.description || order.notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <RichTextDisplay html={order.description} className="mt-2" />
                    </div>
                  )}
                  {order.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <RichTextDisplay html={order.notes} className="mt-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </OrgLayout>
  );
}
