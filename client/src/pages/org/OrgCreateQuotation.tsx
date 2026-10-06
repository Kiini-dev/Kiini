import React, { useState } from "react";
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
import { ArrowLeft, FileText, Plus } from "lucide-react";

export default function OrgCreateQuotation() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;

  const canCreateInvoicing = hasAccess('org:invoicing:create');

  const [, setLocation] = useLocation();
  const { checkPermission, hasPermission } = useOrgPermission();

  const [form, setForm] = useState({
    rfqNo: "",
    supplier: "",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
    status: "draft" as const,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = trpc.quotations.create.useMutation({
    onSuccess: (data) => {
      toast.success("Quotation created", { description: "Quotation created successfully." });
      setLocation(`/org/${slug}/quotations/${data.id}`);
    },
    onError: (error) => {
      toast.error("Failed to create quotation", { description: error.message });
      setIsSubmitting(false);
    },
  });

  if (!hasPermission("quotations")) {
    return (
      <OrgLayout title="Create Quotation" showOrgInfo={false}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <OrgBreadcrumb slug={slug} items={[{ label: "Quotations", href: `/org/${slug}/quotations` }, { label: "Create Quotation" }]} />
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-white/30" />
            <h2 className="mt-5 text-xl font-semibold text-white">Access Denied</h2>
            <p className="mt-2 text-sm text-white/60">You do not have permission to create quotations.</p>
          </div>
        </div>
      </OrgLayout>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!checkPermission("quotations", "create quotations")) {
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
    createMutation.mutate({
      rfqNo: form.rfqNo || undefined,
      supplier: form.supplier,
      amount: Math.round(amount * 100),
      dueDate: new Date(form.dueDate),
      status: form.status,
      description: form.description || undefined,
    });
  };

  return (
    <OrgLayout title="Create Quotation" showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <OrgBreadcrumb slug={slug} items={[{ label: "Quotations", href: `/org/${slug}/quotations` }, { label: "Create Quotation" }]} />
          </div>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/quotations`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> New Quotation
            </CardTitle>
            <CardDescription>Create a new quotation for your organization.</CardDescription>
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
                <Button variant="outline" onClick={() => setLocation(`/org/${slug}/quotations`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Quotation"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
