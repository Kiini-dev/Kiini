import { useState } from "react";
import type { FormEvent } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuotationRequestForm, createEmptyQuotationForm, quotationFormPayload } from "@/components/QuotationRequestForm";
import { trpc } from "@/lib/trpc";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, FileText, Plus } from "lucide-react";

export default function OrgCreateQuotation() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug as string;
  const [, setLocation] = useLocation();
  const { checkPermission, hasPermission } = useOrgPermission();
  const [form, setForm] = useState(createEmptyQuotationForm);

  const createMutation = trpc.quotations.create.useMutation({
    onSuccess: (data) => {
      toast.success("Quotation created", { description: "Quotation created successfully." });
      setLocation(`/org/${slug}/quotations/${data.id}`);
    },
    onError: (error) => toast.error("Failed to create quotation", { description: error.message }),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!checkPermission("quotations", "create quotations")) return;
    if (!form.buyerCompanyName.trim() || !form.lineItems.some((item) => item.description.trim())) {
      toast.error("Add the issuing company and at least one item or service.");
      return;
    }
    createMutation.mutate(quotationFormPayload(form));
  };

  if (!hasPermission("quotations")) {
    return (
      <OrgLayout title="Create Quotation" showOrgInfo={false}>
        <div className="space-y-6">
          <OrgBreadcrumb slug={slug} items={[{ label: "Quotations", href: `/org/${slug}/quotations` }, { label: "Create Quotation" }]} />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-white/30" />
            <h2 className="mt-5 text-xl font-semibold text-white">Access Denied</h2>
            <p className="mt-2 text-sm text-white/60">You do not have permission to create quotations.</p>
          </div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout title="Create Quotation" showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <OrgBreadcrumb slug={slug} items={[{ label: "Quotations", href: `/org/${slug}/quotations` }, { label: "Create Quotation" }]} />
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/quotations`)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> New RFQ / Quotation</CardTitle>
            <CardDescription>Capture the buyer, requirements, supplier response, pricing and submission terms.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <QuotationRequestForm form={form} setForm={setForm} />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setLocation(`/org/${slug}/quotations`)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || !form.buyerCompanyName.trim() || !form.lineItems.some((item) => item.description.trim())}>
                  {createMutation.isPending ? "Creating..." : "Create RFQ"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
