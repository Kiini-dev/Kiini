import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuotationRequestForm, createEmptyQuotationForm, quotationFormPayload, quotationToForm } from "@/components/QuotationRequestForm";
import { trpc } from "@/lib/trpc";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, FileText } from "lucide-react";

export default function OrgEditQuotation() {
  const params = useParams<{ slug: string; id: string }>();
  const slug = params.slug as string;
  const quotationId = params.id as string;
  const [, setLocation] = useLocation();
  const { checkPermission, hasPermission } = useOrgPermission();

  const { data: quotation, isLoading } = trpc.quotations.getById.useQuery(quotationId, {
    enabled: !!quotationId,
  });
  const [form, setForm] = useState(createEmptyQuotationForm);

  useEffect(() => {
    if (quotation) setForm(quotationToForm(quotation));
  }, [quotation]);

  const updateMutation = trpc.quotations.update.useMutation({
    onSuccess: () => {
      toast.success("Quotation updated successfully");
      setLocation(`/org/${slug}/quotations/${quotationId}`);
    },
    onError: (error) => toast.error(error.message || "Failed to update quotation"),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!checkPermission("quotations", "edit quotations")) return;
    if (!form.buyerCompanyName.trim() || !form.lineItems.some((item) => item.description.trim())) {
      toast.error("Add the issuing company and at least one item or service.");
      return;
    }
    updateMutation.mutate({ id: quotationId, ...quotationFormPayload(form) });
  };

  if (!hasPermission("quotations")) {
    return (
      <OrgLayout title="Edit Quotation" showOrgInfo={false}>
        <div className="text-center py-16">
          <p className="text-white/60">You do not have permission to edit quotations.</p>
          <Button variant="ghost" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout title="Edit Quotation" showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <OrgBreadcrumb slug={slug} items={[{ label: "Quotations", href: `/org/${slug}/quotations` }, { label: "Edit Quotation" }]} />
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/quotations/${quotationId}`)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Edit RFQ / Quotation</CardTitle>
            <CardDescription>Update the buyer, requirements, pricing and submission terms.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <QuotationRequestForm form={form} setForm={setForm} />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setLocation(`/org/${slug}/quotations/${quotationId}`)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending || isLoading || !form.buyerCompanyName.trim() || !form.lineItems.some((item) => item.description.trim())}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
