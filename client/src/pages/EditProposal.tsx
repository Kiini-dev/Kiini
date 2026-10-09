import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ClientSelector } from "@/components/ClientSelector";
import { toast } from "sonner";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";

type ProposalLineItem = { description: string; quantity: string; unitPrice: string };

export default function EditProposal() {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const proposalsPath = slug ? `/org/${slug}/proposals` : "/proposals";
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { data: proposal, isLoading } = trpc.proposals.getById.useQuery(id || "", { enabled: Boolean(id) });
  const [form, setForm] = useState({
    clientId: "", title: "", issueDate: "", expiryDate: "", description: "", deliverables: "",
    timeline: "", assumptions: "", exclusions: "", terms: "", taxAmount: "", discountAmount: "",
    lineItems: [] as ProposalLineItem[],
  });

  useEffect(() => {
    if (!proposal) return;
    const lineItems = Array.isArray(proposal.lineItems)
      ? proposal.lineItems as Array<{ description?: string; quantity?: number; unitPrice?: number }>
      : [];
    setForm({
      clientId: proposal.clientId,
      title: proposal.title || "",
      issueDate: proposal.issueDate?.slice(0, 10) || "",
      expiryDate: proposal.expiryDate?.slice(0, 10) || "",
      description: proposal.description || "",
      deliverables: proposal.deliverables || "",
      timeline: proposal.timeline || "",
      assumptions: proposal.assumptions || "",
      exclusions: proposal.exclusions || "",
      terms: proposal.terms || "",
      taxAmount: ((proposal.taxAmount || 0) / 100).toString(),
      discountAmount: ((proposal.discountAmount || 0) / 100).toString(),
      lineItems: lineItems.length ? lineItems.map(item => ({
        description: item.description || "",
        quantity: String(item.quantity || 1),
        unitPrice: ((item.unitPrice || 0) / 100).toString(),
      })) : [{ description: "", quantity: "1", unitPrice: "" }],
    });
  }, [proposal]);

  const updateProposal = trpc.proposals.update.useMutation({
    onSuccess: async () => {
      toast.success("Proposal draft updated");
      await Promise.all([
        utils.proposals.getById.invalidate(id || ""),
        utils.proposals.list.invalidate(),
      ]);
      navigate(`${proposalsPath}/${id}`);
    },
    onError: error => toast.error(error.message),
  });

  const updateLineItem = (index: number, field: keyof ProposalLineItem, value: string) => {
    setForm(current => ({ ...current, lineItems: current.lineItems.map((item, i) => i === index ? { ...item, [field]: value } : item) }));
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const lineItems = form.lineItems.filter(item => item.description.trim()).map(item => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));
    if (!form.clientId || !form.title.trim() || !form.issueDate || !lineItems.length || lineItems.some(item => item.quantity <= 0 || item.unitPrice < 0 || !Number.isFinite(item.quantity) || !Number.isFinite(item.unitPrice))) {
      toast.error("Enter valid proposal details and at least one priced deliverable");
      return;
    }
    const subtotal = lineItems.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPrice * 100), 0);
    const taxAmount = Math.round((Number(form.taxAmount) || 0) * 100);
    const discountAmount = Math.round((Number(form.discountAmount) || 0) * 100);
    if (discountAmount > subtotal + taxAmount) {
      toast.error("Discount cannot exceed the subtotal plus tax");
      return;
    }
    updateProposal.mutate({
      id: id || "",
      clientId: form.clientId,
      title: form.title.trim(),
      issueDate: form.issueDate,
      expiryDate: form.expiryDate || "",
      description: form.description,
      deliverables: form.deliverables,
      timeline: form.timeline,
      assumptions: form.assumptions,
      exclusions: form.exclusions,
      terms: form.terms,
      lineItems,
      subtotal,
      taxAmount,
      discountAmount,
      total: subtotal + taxAmount - discountAmount,
    });
  };

  if (isLoading) return <ModuleLayout title="Edit proposal" icon={<FileText className="h-5 w-5" />}><div className="p-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div></ModuleLayout>;
  if (!proposal) return <ModuleLayout title="Proposal not found" icon={<FileText className="h-5 w-5" />}><div className="p-8 text-center">Proposal not found.</div></ModuleLayout>;
  if (proposal.signingStatus !== "not_sent") return <ModuleLayout title="Proposal locked" icon={<FileText className="h-5 w-5" />}><div className="p-8 text-center space-y-4"><p>This proposal cannot be edited after a signing workflow starts.</p><Button variant="outline" onClick={() => navigate(`${proposalsPath}/${id}`)}><ArrowLeft className="mr-2 h-4 w-4" />Back to proposal</Button></div></ModuleLayout>;

  return <ModuleLayout title="Edit Proposal Draft" description={proposal.proposalNumber} icon={<FileText className="h-5 w-5" />} breadcrumbs={[{ label: "Proposals", href: proposalsPath }, { label: proposal.proposalNumber }, { label: "Edit" }]}>
    <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <Card><CardHeader><CardTitle>Proposal details</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <ClientSelector value={form.clientId} onChange={clientId => setForm(current => ({ ...current, clientId }))} />
        <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} /></div>
        <div className="space-y-2"><Label>Issue date</Label><Input type="date" value={form.issueDate} onChange={event => setForm(current => ({ ...current, issueDate: event.target.value }))} /></div>
        <div className="space-y-2"><Label>Valid until</Label><Input type="date" value={form.expiryDate} onChange={event => setForm(current => ({ ...current, expiryDate: event.target.value }))} /></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Scope, deliverables, and schedule</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label>Overview</Label><RichTextEditor value={form.description} onChange={description => setForm(current => ({ ...current, description }))} minHeight="100px" /></div>
        <div className="space-y-2"><Label>Deliverables</Label><RichTextEditor value={form.deliverables} onChange={deliverables => setForm(current => ({ ...current, deliverables }))} minHeight="100px" /></div>
        <div className="space-y-2"><Label>Timeline and milestones</Label><RichTextEditor value={form.timeline} onChange={timeline => setForm(current => ({ ...current, timeline }))} minHeight="100px" /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Assumptions</Label><RichTextEditor value={form.assumptions} onChange={assumptions => setForm(current => ({ ...current, assumptions }))} minHeight="90px" /></div>
          <div className="space-y-2"><Label>Exclusions</Label><RichTextEditor value={form.exclusions} onChange={exclusions => setForm(current => ({ ...current, exclusions }))} minHeight="90px" /></div>
        </div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Investment</CardTitle></CardHeader><CardContent className="space-y-4">
        {form.lineItems.map((item, index) => <div key={index} className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2"><Label>Deliverable</Label><Input value={item.description} onChange={event => updateLineItem(index, "description", event.target.value)} /></div>
          <div className="space-y-2"><Label>Quantity</Label><Input type="number" min="0.01" step="0.01" value={item.quantity} onChange={event => updateLineItem(index, "quantity", event.target.value)} /></div>
          <div className="space-y-2"><Label>Unit price</Label><Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={event => updateLineItem(index, "unitPrice", event.target.value)} /></div>
        </div>)}
        <Button type="button" variant="outline" onClick={() => setForm(current => ({ ...current, lineItems: [...current.lineItems, { description: "", quantity: "1", unitPrice: "" }] }))}>Add line item</Button>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Tax amount</Label><Input type="number" min="0" step="0.01" value={form.taxAmount} onChange={event => setForm(current => ({ ...current, taxAmount: event.target.value }))} /></div>
          <div className="space-y-2"><Label>Discount</Label><Input type="number" min="0" step="0.01" value={form.discountAmount} onChange={event => setForm(current => ({ ...current, discountAmount: event.target.value }))} /></div>
        </div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Commercial terms and acceptance</CardTitle></CardHeader><CardContent><RichTextEditor value={form.terms} onChange={terms => setForm(current => ({ ...current, terms }))} minHeight="120px" /></CardContent></Card>
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => navigate(`${proposalsPath}/${id}`)}>Cancel</Button><Button type="submit" disabled={updateProposal.isPending}>{updateProposal.isPending ? "Saving…" : "Save draft"}</Button></div>
    </form>
  </ModuleLayout>;
}
