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
import { ClientSelector } from "@/components/ClientSelector";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, FileText, Plus } from "lucide-react";

export default function OrgCreateProposal() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;

  const canCreateInvoicing = hasAccess('org:invoicing:create');

  const [, setLocation] = useLocation();
  const { checkPermission, hasPermission } = useOrgPermission();

  const [form, setForm] = useState({
    clientId: "",
    title: "",
    description: "",
    value: "",
    stage: "proposal" as const,
    expectedCloseDate: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = trpc.opportunities.create.useMutation({
    onSuccess: (data) => {
      toast.success("Proposal created", { description: "Proposal created successfully." });
      setLocation(`/org/${slug}/proposals/${data.id}`);
    },
    onError: (error) => {
      toast.error("Failed to create proposal", { description: error.message });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!checkPermission("proposals", "create proposals")) {
      return;
    }

    if (!form.clientId || !form.title || !form.value) {
      toast.error("Missing required fields", { description: "Client, title, and value are required." });
      return;
    }

    const amount = parseFloat(form.value);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid value", { description: "Enter a valid proposal amount." });
      return;
    }

    setIsSubmitting(true);
    createMutation.mutate({
      clientId: form.clientId,
      title: form.title,
      description: form.description || undefined,
      value: Math.round(amount * 100),
      stage: form.stage,
      expectedCloseDate: new Date(form.expectedCloseDate),
    });
  };

  if (!hasPermission("proposals")) {
    return (
      <OrgLayout title="Create Proposal" showOrgInfo={false}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <OrgBreadcrumb slug={slug} items={[{ label: "Proposals", href: `/org/${slug}/proposals` }, { label: "Create Proposal" }]} />
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-white/30" />
            <h2 className="mt-5 text-xl font-semibold text-white">Access Denied</h2>
            <p className="mt-2 text-sm text-white/60">You do not have permission to create proposals.</p>
          </div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout title="Create Proposal" showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <OrgBreadcrumb slug={slug} items={[{ label: "Proposals", href: `/org/${slug}/proposals` }, { label: "Create Proposal" }]} />
          </div>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/proposals`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Proposal
            </CardTitle>
            <CardDescription>Create a new sales proposal for your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <ClientSelector
                    value={form.clientId}
                    onChange={(clientId) => setForm((f) => ({ ...f, clientId }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Proposal Title *</Label>
                  <Input id="title" value={form.title} onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))} placeholder="Proposal title" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="value">Amount (KES) *</Label>
                  <Input id="value" type="number" min="0" value={form.value} onChange={(event) => setForm((f) => ({ ...f, value: event.target.value }))} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select value={form.stage} onValueChange={(value) => setForm((f) => ({ ...f, stage: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed_won">Closed Won</SelectItem>
                      <SelectItem value="closed_lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedCloseDate">Expected Close</Label>
                  <Input id="expectedCloseDate" type="date" value={form.expectedCloseDate} onChange={(event) => setForm((f) => ({ ...f, expectedCloseDate: event.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))} rows={6} />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setLocation(`/org/${slug}/proposals`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Proposal"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
