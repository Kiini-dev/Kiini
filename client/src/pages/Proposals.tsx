import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearch, useParams } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { ClientSelector } from "@/components/ClientSelector";
import { useCurrencySettings } from "@/lib/currency";
import { toast } from "sonner";
import { ArrowRight, FileText, Plus, Trash2 } from "lucide-react";

type ProposalLineItem = { description: string; quantity: string; unitPrice: string };

const initialForm = () => ({
  clientId: "",
  title: "",
  issueDate: new Date().toISOString().slice(0, 10),
  expiryDate: "",
  description: "",
  deliverables: "",
  timeline: "",
  assumptions: "",
  exclusions: "",
  terms: "",
  taxAmount: "",
  discountAmount: "",
  lineItems: [{ description: "", quantity: "1", unitPrice: "" }] as ProposalLineItem[],
});

export default function Proposals() {
  const { slug } = useParams<{ slug?: string }>();
  const proposalsPath = slug ? `/org/${slug}/proposals` : "/proposals";
  const [location, navigate] = useLocation();
  const search = useSearch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const { code: currencyCode } = useCurrencySettings();
  const utils = trpc.useUtils();
  const { data: proposals = [], isLoading, error } = trpc.proposals.list.useQuery({});
  const { data: clients = [] } = trpc.clients.list.useQuery({});

  useEffect(() => {
    if (new URLSearchParams(search).get("action") === "create" || location.endsWith("/new")) setDialogOpen(true);
  }, [location, search]);

  const createProposal = trpc.proposals.create.useMutation({
    onSuccess: async (result) => {
      toast.success(`Proposal ${result.proposalNumber} created`);
      setDialogOpen(false);
      setForm(initialForm());
      await utils.proposals.list.invalidate();
      navigate(`${proposalsPath}/${result.id}`);
    },
    onError: (createError) => toast.error(createError.message),
  });
  const deleteProposal = trpc.proposals.delete.useMutation({
    onSuccess: async () => {
      toast.success("Proposal deleted");
      await utils.proposals.list.invalidate();
    },
    onError: (deleteError) => toast.error(deleteError.message),
  });

  const money = (minor: number) => new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format((minor || 0) / 100);

  const filteredProposals = useMemo(() => proposals.filter((proposal) => {
    const client = clients.find((item) => item.id === proposal.clientId);
    const clientName = client?.companyName || client?.contactPerson || "";
    const matchesSearch = `${proposal.title || ""} ${proposal.proposalNumber} ${clientName}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === "all" || proposal.status === statusFilter);
  }), [clients, proposals, searchTerm, statusFilter]);

  const updateLineItem = (index: number, field: keyof ProposalLineItem, value: string) => {
    setForm(current => ({
      ...current,
      lineItems: current.lineItems.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  };

  const submit = () => {
    const lineItems = form.lineItems.filter(item => item.description.trim()).map(item => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));
    if (!form.clientId || !form.title.trim() || !form.issueDate || !lineItems.length) {
      toast.error("Enter a client, title, issue date, and at least one priced deliverable");
      return;
    }
    if (lineItems.some(item => !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0)) {
      toast.error("Check that every line item has a positive quantity and a valid price");
      return;
    }
    const subtotal = lineItems.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPrice * 100), 0);
    const taxAmount = Math.round((Number(form.taxAmount) || 0) * 100);
    const discountAmount = Math.round((Number(form.discountAmount) || 0) * 100);
    if (discountAmount > subtotal + taxAmount) {
      toast.error("Discount cannot exceed the subtotal plus tax");
      return;
    }
    createProposal.mutate({
      clientId: form.clientId,
      title: form.title.trim(),
      status: "draft",
      issueDate: form.issueDate,
      expiryDate: form.expiryDate || undefined,
      description: form.description || undefined,
      deliverables: form.deliverables || undefined,
      timeline: form.timeline || undefined,
      assumptions: form.assumptions || undefined,
      exclusions: form.exclusions || undefined,
      terms: form.terms || undefined,
      currency: currencyCode,
      lineItems: lineItems.map(item => ({ ...item, unitPrice: item.unitPrice })),
      subtotal,
      taxAmount,
      discountAmount,
      total: subtotal + taxAmount - discountAmount,
    });
  };

  return <ModuleLayout
    title="Proposals"
    description="Prepare client-ready proposals, track signature progress, and retain executed copies."
    icon={<FileText className="h-6 w-6" />}
    breadcrumbs={[{ label: "Dashboard", href: slug ? `/org/${slug}/crm-home` : "/crm-home" }, { label: "Sales" }, { label: "Proposals" }]}
  >
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-bold">Customer Proposals</h2><p className="text-sm text-muted-foreground">Customer proposals are separate from the sales opportunity pipeline.</p></div>
        <Button onClick={() => { setForm(initialForm()); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> New Proposal</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search number, title, or client" className="min-w-60 flex-1" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent / signing</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader><CardTitle>Proposal register</CardTitle><CardDescription>{filteredProposals.length} proposals</CardDescription></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Reference</TableHead><TableHead>Proposal</TableHead><TableHead>Client</TableHead>
              <TableHead>Valid until</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead>Signing</TableHead><TableHead />
            </TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={8} className="py-8 text-center">Loading proposals…</TableCell></TableRow>
                : error ? <TableRow><TableCell colSpan={8} className="py-8 text-center text-destructive">Could not load proposals: {error.message}</TableCell></TableRow>
                : filteredProposals.length === 0 ? <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No proposals found. Create a proposal to get started.</TableCell></TableRow>
                : filteredProposals.map(proposal => {
                  const client = clients.find(item => item.id === proposal.clientId);
                  return <TableRow key={proposal.id}>
                    <TableCell className="font-mono text-sm">{proposal.proposalNumber}</TableCell>
                    <TableCell className="font-medium">{proposal.title || "Untitled proposal"}</TableCell>
                    <TableCell>{client?.companyName || client?.contactPerson || "—"}</TableCell>
                    <TableCell>{proposal.expiryDate ? new Date(proposal.expiryDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="text-right">{money(proposal.total)}</TableCell>
                    <TableCell><Badge variant={proposal.status === "accepted" ? "default" : proposal.status === "rejected" ? "destructive" : "secondary"}>{proposal.status}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{(proposal.signingStatus || "not_sent").replaceAll("_", " ")}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`${proposalsPath}/${proposal.id}`)}>Open <ArrowRight className="ml-2 h-4 w-4" /></Button>
                      {(proposal.signingStatus || "not_sent") === "not_sent" && <Button variant="ghost" size="sm" aria-label="Delete draft proposal" disabled={deleteProposal.isPending} onClick={() => {
                        if (window.confirm(`Delete proposal ${proposal.proposalNumber}? This cannot be undone.`)) deleteProposal.mutate(proposal.id);
                      }}><Trash2 className="h-4 w-4" /></Button>}
                    </TableCell>
                  </TableRow>;
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Create client proposal</DialogTitle></DialogHeader>
          <div className="max-h-[72vh] space-y-6 overflow-y-auto pr-1">
            <Card><CardHeader><CardTitle className="text-base">Proposal details</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
              <ClientSelector value={form.clientId} onChange={clientId => setForm(current => ({ ...current, clientId }))} required />
              <div className="space-y-2"><Label>Proposal title *</Label><Input value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Issue date *</Label><Input type="date" value={form.issueDate} onChange={event => setForm(current => ({ ...current, issueDate: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Valid until</Label><Input type="date" value={form.expiryDate} onChange={event => setForm(current => ({ ...current, expiryDate: event.target.value }))} /></div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Overview and scope</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="space-y-2"><Label>Project overview</Label><RichTextEditor value={form.description} onChange={description => setForm(current => ({ ...current, description }))} minHeight="110px" placeholder="Client context, objectives, and recommended approach" /></div>
              <div className="space-y-2"><Label>Deliverables</Label><RichTextEditor value={form.deliverables} onChange={deliverables => setForm(current => ({ ...current, deliverables }))} minHeight="110px" placeholder="Deliverables and acceptance outcomes" /></div>
              <div className="space-y-2"><Label>Timeline and milestones</Label><RichTextEditor value={form.timeline} onChange={timeline => setForm(current => ({ ...current, timeline }))} minHeight="100px" placeholder="Project phases, dates, and dependencies" /></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Assumptions</Label><RichTextEditor value={form.assumptions} onChange={assumptions => setForm(current => ({ ...current, assumptions }))} minHeight="90px" /></div>
                <div className="space-y-2"><Label>Exclusions</Label><RichTextEditor value={form.exclusions} onChange={exclusions => setForm(current => ({ ...current, exclusions }))} minHeight="90px" /></div>
              </div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Investment</CardTitle></CardHeader><CardContent className="space-y-4">
              {form.lineItems.map((item, index) => <div key={index} className="grid items-end gap-3 md:grid-cols-[1fr_120px_180px_auto]">
                <div className="space-y-2"><Label>Deliverable / service</Label><Input value={item.description} onChange={event => updateLineItem(index, "description", event.target.value)} /></div>
                <div className="space-y-2"><Label>Quantity</Label><Input type="number" min="0.01" step="0.01" value={item.quantity} onChange={event => updateLineItem(index, "quantity", event.target.value)} /></div>
                <div className="space-y-2"><Label>Unit price ({currencyCode})</Label><Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={event => updateLineItem(index, "unitPrice", event.target.value)} /></div>
                <Button variant="ghost" type="button" aria-label={`Remove item ${index + 1}`} disabled={form.lineItems.length === 1} onClick={() => setForm(current => ({ ...current, lineItems: current.lineItems.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button>
              </div>)}
              <Button type="button" variant="outline" onClick={() => setForm(current => ({ ...current, lineItems: [...current.lineItems, { description: "", quantity: "1", unitPrice: "" }] }))}><Plus className="mr-2 h-4 w-4" />Add line item</Button>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>Tax amount ({currencyCode})</Label><Input type="number" min="0" step="0.01" value={form.taxAmount} onChange={event => setForm(current => ({ ...current, taxAmount: event.target.value }))} /></div>
                <div className="space-y-2"><Label>Discount ({currencyCode})</Label><Input type="number" min="0" step="0.01" value={form.discountAmount} onChange={event => setForm(current => ({ ...current, discountAmount: event.target.value }))} /></div>
                <div className="space-y-2"><Label>Total ({currencyCode})</Label><div className="rounded-md border px-3 py-2 font-semibold">{new Intl.NumberFormat("en-KE", { style: "currency", currency: currencyCode, minimumFractionDigits: 2 }).format((form.lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0) + (Number(form.taxAmount) || 0) - (Number(form.discountAmount) || 0)))}</div></div>
              </div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Commercial terms and acceptance</CardTitle><CardDescription>Review jurisdiction-specific terms with qualified counsel before sending.</CardDescription></CardHeader><CardContent><RichTextEditor value={form.terms} onChange={terms => setForm(current => ({ ...current, terms }))} minHeight="130px" placeholder="Payment schedule, validity, acceptance and other commercial terms" /></CardContent></Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={createProposal.isPending}>{createProposal.isPending ? "Saving…" : "Save draft"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </ModuleLayout>;
}
