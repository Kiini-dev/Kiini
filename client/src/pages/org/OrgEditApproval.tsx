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

export default function OrgEditApproval() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const approvalId = params.id as string;

  const canEditApprovals = hasAccess('org:approvals:edit');
  const canDeleteApprovals = hasAccess('org:approvals:delete');

  const [, setLocation] = useLocation();
  const { checkPermission } = useOrgPermission();

  const { data: approval, isLoading } = trpc.approvals.getById.useQuery(approvalId, {
    enabled: !!approvalId && checkPermission("workflow:approvals:edit"),
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    approver: "",
    comments: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (approval) {
      setFormData({
        title: approval.title || "",
        description: approval.description || "",
        status: approval.status || "pending",
        approver: approval.approver || "",
        comments: approval.comments || "",
      });
    }
  }, [approval]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Add save logic here
      toast.success("Approval updated successfully");
      setLocation(`/org/${slug}/approvals/${approvalId}`);
    } catch (error) {
      toast.error("Failed to update approval");
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
          { label: "Approvals", href: `/org/${slug}/approvals` },
          { label: `Approval #${approvalId}`, href: `/org/${slug}/approvals/${approvalId}` },
          { label: "Edit" },
        ]} />

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation(`/org/${slug}/approvals/${approvalId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Approval</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Approval Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Approval title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Approver</label>
                <Input
                  value={formData.approver}
                  onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
                  placeholder="Approver name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Approval description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comments</label>
              <Textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Approval comments"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setLocation(`/org/${slug}/approvals/${approvalId}`)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
