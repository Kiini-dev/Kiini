import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash2, FileText } from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgProposalDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const proposalId = params.id as string;

  const canViewInvoicing = hasAccess('org:invoicing:view');
  const canEditInvoicing = hasAccess('org:invoicing:edit');
  const canDeleteInvoicing = hasAccess('org:invoicing:delete');

  const [, setLocation] = useLocation();
  const { hasPermission } = useOrgPermission();

  const { data: proposal, isLoading } = trpc.opportunities.getById.useQuery(proposalId, {
    enabled: !!proposalId && hasPermission("proposals"),
  });

  const utils = trpc.useUtils();
  const deleteMutation = trpc.opportunities.delete.useMutation({
    onSuccess: () => {
      toast.success("Proposal deleted successfully");
      utils.opportunities.list.invalidate();
      setLocation(`/org/${slug}/proposals`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete proposal");
    },
  });

  if (!hasPermission("proposals")) {
    return (
      <OrgLayout title="Proposal Details" showOrgInfo={false}>
      <PermissionGuard allowed={canViewInvoicing} feature="org:invoicing:view" slug={slug}>

        <div className="text-center py-16">
          <p className="text-white/60">You do not have permission to view proposals.</p>
          <Button variant="ghost" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  return (
    <OrgLayout title="Proposal Details" showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <OrgBreadcrumb
            slug={slug}
            items={[
              { label: "Dashboard", href: `/org/${slug}/dashboard` },
              { label: "Proposals", href: `/org/${slug}/proposals` },
              { label: proposal?.title || "Details" },
            ]}
          />
          <div className="flex gap-2">
            {hasPermission("proposals") && (
              <Button variant="outline" size="sm" onClick={() => setLocation(`/org/${slug}/proposals/${proposalId}/edit`)}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setLocation(`/org/${slug}/proposals`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-white/60">Loading proposal...</div>
        ) : !proposal ? (
          <div className="text-center py-16 text-white/60">Proposal not found.</div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <CardTitle>{proposal.title || `Proposal ${proposal.id?.slice(-8)}`}</CardTitle>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-200">{proposal.stage || proposal.status || "Unknown"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-white/60">Client</p>
                  <p className="text-white">{proposal.clientName || proposal.clientId || "Unknown client"}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Amount</p>
                  <p className="text-white">KES {((proposal.value || proposal.amount || 0) / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Expected Close</p>
                  <p className="text-white">{proposal.expectedCloseDate ? new Date(proposal.expectedCloseDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Created</p>
                  <p className="text-white">{proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {proposal.description && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextDisplay html={proposal.description} className="text-white/80" />
                </CardContent>
              </Card>
            )}

            {proposal.notes && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextDisplay html={proposal.notes} className="text-white/80" />
                </CardContent>
              </Card>
            )}

            {hasPermission("proposals") && (
              <div className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => deleteMutation.mutate(proposalId)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </OrgLayout>
  );
}
