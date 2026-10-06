import { useMemo } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { ArrowLeft, Edit, Loader2, Package, Trash2 } from "lucide-react";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgProductDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams<{ slug: string; id: string }>();
  const slug = params.slug as string;
  const id = params.id as string;

  const canViewProcurement = hasAccess('org:procurement:view');
  const canEditProcurement = hasAccess('org:procurement:edit');
  const canDeleteProcurement = hasAccess('org:procurement:delete');

  const [, navigate] = useLocation();
  const { hasPermission } = useOrgPermission();

  const { data: product, isLoading } = trpc.products.getById.useQuery(id || "", { enabled: !!id });

  if (isLoading) {
    return (
      <OrgLayout title="Product Details" showOrgInfo={false}>
      <PermissionGuard allowed={canViewProcurement} feature="org:procurement:view" slug={slug}>

        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  if (!product) {
    return (
      <OrgLayout title="Product Details" showOrgInfo={false}>
        <div className="p-6">
          <p>Product not found</p>
          <Button onClick={() => navigate(`/org/${slug}/products`)} className="mt-4">Back to products</Button>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout title="Product Details" showOrgInfo={false}>
      <OrgBreadcrumb slug={slug} items={[{ label: "Products", href: `/org/${slug}/products` }, { label: product.name || "Product" }]} />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <h1 className="text-3xl font-bold">{product.name || "Product"}</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-2">SKU: {product.sku || "—"}</p>
          </div>
          <div className="flex items-center gap-2">
            {hasPermission("products") && (
              <Button onClick={() => navigate(`/org/${slug}/products/${id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/org/${slug}/products`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{product.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{product.category || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit</p>
                <p className="font-medium">{product.unit || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge>{product.status || product.isActive === 0 ? "inactive" : "active"}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Unit Price</p>
                <p className="font-medium">KSh {(product.price || product.unitPrice || 0) / 100}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Price</p>
                <p className="font-medium">KSh {(product.cost || product.costPrice || 0) / 100}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Quantity</p>
                <p className="font-medium">{product.stockQuantity || product.quantity || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {product.description && (
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <RichTextDisplay html={product.description} />
            </CardContent>
          </Card>
        )}
      </div>
    </OrgLayout>
  );
}
