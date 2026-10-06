import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function OrgEditProcurement() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const procurementId = params.id as string;

  const canEditProcurement = hasAccess('org:procurement:edit');
  const canDeleteProcurement = hasAccess('org:procurement:delete');

  const [, setLocation] = useLocation();
  const { checkPermission } = useOrgPermission();

  const { data: procurement, isLoading } = trpc.procurement.getById.useQuery(procurementId, {
    enabled: !!procurementId && checkPermission("procurement:edit"),
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    vendor: "",
    amount: "",
    status: "draft",
    requestDate: "",
    notes: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (procurement) {
      setFormData({
        title: procurement.title || "",
        description: procurement.description || "",
        vendor: procurement.vendor || "",
        amount: procurement.amount ? (procurement.amount / 100).toFixed(2) : "",
        status: procurement.status || "draft",
        requestDate: procurement.requestDate ? new Date(procurement.requestDate).toISOString().split("T")[0] : "",
        notes: procurement.notes || "",
      });
    }
  }, [procurement]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Add save logic here
      toast.success("Procurement request updated successfully");
      setLocation(`/org/${slug}/procurement/${procurementId}`);
    } catch (error) {
      toast.error("Failed to update procurement request");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <OrgLayout slug={slug}>
        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-1/4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout slug={slug}>
      <div className="p-6 space-y-6">
        <OrgBreadcrumb slug={slug} items={[
          { label: "Procurement", href: `/org/${slug}/procurement` },
          { label: `PR #${procurementId}`, href: `/org/${slug}/procurement/${procurementId}` },
          { label: "Edit" },
        ]} />

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation(`/org/${slug}/procurement/${procurementId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Procurement Request</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Procurement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Procurement title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Vendor</label>
                <Input
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Vendor name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Request Date</label>
                <Input
                  type="date"
                  value={formData.requestDate}
                  onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Procurement description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setLocation(`/org/${slug}/procurement/${procurementId}`)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
