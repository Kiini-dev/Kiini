import React, { useState } from "react";
import { useParams } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { Loader2, Star, Mail, Phone, MapPin, Globe, Truck, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFavorite } from "@/hooks/useFavorite";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgSupplierDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams<{ slug: string; id: string }>();
  const slug = params.slug as string;
  const id = params.id as string;

  const { hasPermission } = useOrgPermission();

  const canViewProcurement = hasAccess('org:procurement:view');
  const canEditProcurement = hasAccess('org:procurement:edit');
  const canDeleteProcurement = hasAccess('org:procurement:delete');


  const { data: supplier, isLoading, refetch } = trpc.suppliers.getById.useQuery(id);
  const { isStarred, toggleStar } = useFavorite("supplier", id || "");

  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <OrgLayout title="Supplier Details" showOrgInfo={false}>
      <PermissionGuard allowed={canViewProcurement} feature="org:procurement:view" slug={slug}>

        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  if (!supplier) {
    return (
      <OrgLayout title="Supplier Details" showOrgInfo={false}>
        <div className="p-6">Supplier not found</div>
      </OrgLayout>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      pre_qualified: "bg-blue-100 text-blue-800",
      qualified: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      inactive: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <OrgLayout title="Supplier Details" showOrgInfo={false}>
      <OrgBreadcrumb slug={slug} items={[{ label: "Suppliers", href: `/org/${slug}/suppliers` }, { label: "Details" }]} />
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => toggleStar()}><Star className={`h-4 w-4 ${isStarred ? "fill-amber-400 text-amber-400" : ""}`} /></Button>
          <Button variant="ghost" size="icon" onClick={() => { if (supplier.email) window.location.href = `mailto:${supplier.email}`; }}><Mail className="h-4 w-4" /></Button>
          {!isEditing && hasPermission("org:suppliers:edit") && (
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4" /></Button>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="w-full space-y-3 lg:w-[280px] lg:min-w-[280px]">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold">{supplier.companyName}</h2>
                  <p className="text-sm text-muted-foreground">#{supplier.supplierNumber}</p>
                </div>
                <Badge className={getStatusBadgeColor(supplier.qualificationStatus)}>{supplier.qualificationStatus.replace("_", " ")}</Badge>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{supplier.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{supplier.email || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Address</p>
                      <p className="font-medium">{supplier.address || "—"}{supplier.city ? `, ${supplier.city}` : ""}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 min-w-0">
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="bank">Bank Details</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Supplier Number</p>
                        <p className="font-semibold mt-1">{supplier.supplierNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={`mt-1 ${getStatusBadgeColor(supplier.qualificationStatus)}`}>{supplier.qualificationStatus.replace("_", " ")}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tax ID</p>
                        <p className="font-semibold mt-1">{supplier.taxId || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="font-semibold mt-1">{supplier.totalOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
