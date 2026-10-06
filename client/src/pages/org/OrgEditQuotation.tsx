import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, FileText } from "lucide-react";

export default function OrgEditQuotation() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const quotationId = params.id as string;

  const canEditInvoicing = hasAccess('org:invoicing:edit');
  const canDeleteInvoicing = hasAccess('org:invoicing:delete');

  const [, setLocation] = useLocation();
  const { checkPermission, hasPermission } = useOrgPermission();

  const { data: quotation, isLoading } = trpc.quotations.getById.useQuery(quotationId, {
    enabled: !!quotationId,
  });

  const [form, setForm] = useState({
    rfqNo: "",
    supplier: "",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
    status: "draft" as const,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quotation) {
      setForm({
        rfqNo: quotation.rfqNo || "",
        supplier: quotation.supplier || "",
        amount: quotation.amount ? ((quotation.amount || 0) / 100).toString() : "",
        dueDate: quotation.dueDate ? new Date(quotation.dueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        status: quotation.status || "draft",
        description: quotation.description || "",
      });
    }
  }, [quotation]);

  const updateMutation = trpc.quotations.update.useMutation({
    onSuccess: () => {
      toast.success("Quotation updated successfully");
      setLocation(`/org/${slug}/quotations/${quotationId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update quotation");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!checkPermission("quotations", "edit quotations")) {
      return;
    }

    if (!form.supplier || !form.amount) {
      toast.error("Missing required fields", { description: "Supplier and amount are required." });
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount", { description: "Enter a valid amount." });
      return;
    }

    setIsSubmitting(true);
    updateMutation.mutate({
      id: quotationId,
      rfqNo: form.rfqNo || undefined,
      supplier: form.supplier,
      amount: Math.round(amount * 100),
      dueDate: new Date(form.dueDate),
      status: form.status,
      description: form.description || undefined,
    });
  };

  if (!hasPermission("quotations")) {
    return (
      <OrgLayout title="Edit Quotation" showOrgInfo={false}>
        <div className="text-center py-16">
          <p className="text-white/60">You do not have permission to edit quotations.</p>
          <Button variant="ghost" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout title="Edit Quotation" showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <OrgBreadcrumb slug={slug} items={[{ label: "Quotations", href: `/org/${slug}/quotations` }, { label: "Edit Quotation" }]} />
          </div>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/quotations/${quotationId}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Edit Quotation
            </CardTitle>
            <CardDescription>Update quotation details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rfqNo">Quotation #</Label>
                  <Input id="rfqNo" value={form.rfqNo} onChange={(event) => setForm((f) => ({ ...f, rfqNo: event.target.value }))} placeholder="RFQ-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Input id="supplier" value={form.supplier} onChange={(event) => setForm((f) => ({ ...f, supplier: event.target.value }))} placeholder="Supplier" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES) *</Label>
                  <Input id="amount" type="number" min="0" value={form.amount} onChange={(event) => setForm((f) => ({ ...f, amount: event.target.value }))} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" value={form.dueDate} onChange={(event) => setForm((f) => ({ ...f, dueDate: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm((f) => ({ ...f, status: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))} rows={5} />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setLocation(`/org/${slug}/quotations/${quotationId}`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
