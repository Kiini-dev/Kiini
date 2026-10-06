import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { OpportunityDetailsView } from "@/components/OpportunityDetailsView";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { handleDownload, handleEmail } from "@/lib/actions";

export default function UnifiedOpportunityDetails() {
  const { id = "", slug = "" } = useParams<{ id: string; slug?: string }>();
  const [location, navigate] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isOrganizationRoute = location.startsWith("/org/");
  const isProposal = location.includes("/proposals/");
  const organizationPath = isOrganizationRoute ? `/org/${slug}` : "";
  const listPath = `${organizationPath}/${isProposal ? "proposals" : "opportunities"}`;
  const { hasPermission } = useOrgPermission();
  const canView = !isOrganizationRoute || !isProposal || hasPermission("proposals");
  const { data: opportunity, isLoading } = trpc.opportunities.getById.useQuery(id, { enabled: Boolean(id) && canView });
  const { data: companyInfo } = trpc.settings.getCompanyInfo.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.opportunities.delete.useMutation({
    onSuccess: () => {
      toast.success(`${isProposal ? "Proposal" : "Opportunity"} deleted`);
      void utils.opportunities.list.invalidate();
      navigate(listPath);
    },
    onError: (error) => toast.error(error.message || "Could not delete this record"),
  });
  const convertMutation = trpc.opportunities.convertToQuote.useMutation({
    onSuccess: (result) => {
      toast.success(result.created ? "Quote created" : "Existing quote opened");
      navigate(`${organizationPath}/quotes/${result.id}`);
    },
    onError: (error) => toast.error(error.message || "Could not create quote"),
  });

  const title = isProposal ? "Proposal Details" : "Opportunity Details";
  const documentData = opportunity ? {
    ...opportunity,
    amount: Number(opportunity.value || 0) / 100,
    total: Number(opportunity.value || 0) / 100,
    companyName: companyInfo?.companyName,
    companyLogo: companyInfo?.companyLogo,
    companyEmail: companyInfo?.companyEmail,
    companyPhone: companyInfo?.companyPhone,
    companyAddress: companyInfo?.companyAddress,
  } : undefined;

  const content = isLoading ? (
    <div className="py-16 text-center text-muted-foreground">Loading {isProposal ? "proposal" : "opportunity"}…</div>
  ) : !opportunity ? (
    <div className="space-y-4 py-16 text-center">
      <p className="text-muted-foreground">{isProposal ? "Proposal" : "Opportunity"} not found.</p>
      <Button variant="outline" onClick={() => navigate(listPath)}>Back to {isProposal ? "proposals" : "opportunities"}</Button>
    </div>
  ) : (
    <>
      <OpportunityDetailsView
        opportunity={opportunity as any}
        entityLabel={isProposal ? "Proposal" : "Opportunity"}
        clientHref={opportunity.clientId ? `${organizationPath}/clients/${opportunity.clientId}` : undefined}
        onEdit={() => navigate(`${organizationPath}/${isProposal ? "proposals" : "opportunities"}/${id}/edit`)}
        onDelete={() => setShowDeleteModal(true)}
        onDownload={isProposal ? () => void handleDownload(id, "proposal", "pdf", documentData) : undefined}
        onEmail={isProposal ? () => void handleEmail(id, "proposal", opportunity.clientEmail || undefined, documentData) : undefined}
        onConvert={!isProposal && opportunity.stage !== "closed_lost" ? () => convertMutation.mutate({ id }) : undefined}
        isDeleting={deleteMutation.isPending}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title={`Delete ${isProposal ? "Proposal" : "Opportunity"}`}
        description="This record will be permanently removed. This action cannot be undone."
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate(id)}
        isLoading={deleteMutation.isPending}
      />
    </>
  );

  if (isOrganizationRoute) {
    return (
      <OrgLayout title={title} showOrgInfo={false}>
        <div className="space-y-6">
          <OrgBreadcrumb slug={slug} items={[{ label: isProposal ? "Proposals" : "Opportunities", href: listPath }, { label: opportunity?.title || "Details" }]} />
          {!canView ? (
            <div className="space-y-4 py-16 text-center">
              <p className="text-white/60">You do not have permission to view proposals.</p>
              <Button variant="ghost" onClick={() => navigate(`${organizationPath}/dashboard`)}>Back to Dashboard</Button>
            </div>
          ) : content}
        </div>
      </OrgLayout>
    );
  }

  return (
    <ModuleLayout
      title={title}
      icon={undefined}
      breadcrumbs={[
        { label: "Dashboard", href: isOrganizationRoute ? `${organizationPath}/dashboard` : "/crm-home" },
        { label: isProposal ? "Proposals" : "Opportunities", href: listPath },
        { label: "Details" },
      ]}
      backLink={{ label: isProposal ? "Proposals" : "Opportunities", href: listPath }}
    >
      {content}
    </ModuleLayout>
  );
}