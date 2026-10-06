import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgPurchaseOrderDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const { id } = useParams<{ id: string }>();

  const canViewProcurement = hasAccess('org:procurement:view');
  const canEditProcurement = hasAccess('org:procurement:edit');
  const canDeleteProcurement = hasAccess('org:procurement:delete');

  const [, navigate] = useLocation();
  const { data: po, isLoading } = trpc.procurement.get.useQuery({ id: id || "" }, { enabled: !!id });
  const deleteMutation = trpc.procurement.delete.useMutation({ onSuccess: () => { toast.success("Purchase order deleted"); navigate(`/org/${slug}/purchase-orders`); }, onError: (e: any) => toast.error(e.message) });

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  if (!po) return <OrgLayout>
      <PermissionGuard allowed={canViewProcurement} feature="org:procurement:view" slug={slug}>
<OrgBreadcrumb slug={slug} items={[{ label: "Dashboard", href: `/org/${slug}/dashboard` }, { label: "Procurement", href: `/org/${slug}/procurement` }, { label: "Purchase Orders", href: `/org/${slug}/purchase-orders` }, { label: "Details" }]} /><div className="p-6">Purchase order not found</div>
      </PermissionGuard></OrgLayout>;

  const p = po as any;
  return (
    <OrgLayout>
      <OrgBreadcrumb slug={slug} items={[{ label: "Dashboard", href: `/org/${slug}/dashboard` }, { label: "Procurement", href: `/org/${slug}/procurement` }, { label: "Purchase Orders", href: `/org/${slug}/purchase-orders` }, { label: p.name || "Details" }]} />
      <div className="max-w-3xl p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center"><CardTitle>{p.name}</CardTitle><Badge>{p.category || "supplies"}</Badge></div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Description</p><p className="font-semibold">{p.description || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Quantity</p><p className="font-semibold">{p.quantity}</p></div>
            <div><p className="text-xs text-muted-foreground">Unit Price</p><p className="font-semibold">KES {Number(p.price).toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground">Required Date</p><p className="font-semibold">{p.requiredDate ? new Date(p.requiredDate).toLocaleDateString() : "—"}</p></div>
            <div className="col-span-2"><p className="text-xs text-muted-foreground">Notes</p><p className="font-semibold whitespace-pre-wrap">{p.notes || "—"}</p></div>
          </CardContent>
        </Card>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => navigate(`/org/${slug}/purchase-orders`)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/org/${slug}/purchase-orders/${id}/edit`)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this purchase order?")) deleteMutation.mutate({ id: id! }); }}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
        </div>
      </div>
    </OrgLayout>
  );
}
