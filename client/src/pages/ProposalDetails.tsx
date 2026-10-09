import { useParams, useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import { SigningWorkflowDialog } from "@/components/SigningWorkflowDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import { toast } from "sonner";
import { ArrowLeft, Download, FileText, ShieldCheck } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ProposalDetails() {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const proposalsPath = slug ? `/org/${slug}/proposals` : "/proposals";
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [signingDialogOpen, setSigningDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("default");
  const { code: currencyCode } = useCurrencySettings();
  const utils = trpc.useUtils();
  const { data: proposal, isLoading } = trpc.proposals.getById.useQuery(id || "", { enabled: Boolean(id) });
  const { data: clients = [] } = trpc.clients.list.useQuery({});
  const { data: templates = [] } = trpc.proposalTemplates.list.useQuery({});
  useEffect(() => setSelectedTemplateId("default"), [id]);
  const preview = trpc.proposals.render.useQuery({
    id: id || "",
    ...(selectedTemplateId !== "default" ? { templateId: selectedTemplateId } : {}),
  }, { enabled: Boolean(id && proposal) });
  const auditTrail = trpc.eSignatures.getAuditTrail.useQuery(
    { workflowId: proposal?.signingWorkflowId || "" },
    { enabled: Boolean(proposal?.signingWorkflowId) },
  );
  const client = useMemo(() => clients.find(item => item.id === proposal?.clientId), [clients, proposal?.clientId]);
  const sendForSignature = trpc.proposals.sendForSignature.useMutation({
    onSuccess: async (result) => {
      toast.success(`Sent to the first signer. ${result.signerCount} signer${result.signerCount === 1 ? "" : "s"} in sequence.`);
      setSigningDialogOpen(false);
      await Promise.all([
        utils.proposals.getById.invalidate(id || ""),
        utils.proposals.list.invalidate(),
      ]);
    },
    onError: error => toast.error(error.message),
  });
  const deleteProposal = trpc.proposals.delete.useMutation({
    onSuccess: async () => {
      toast.success("Proposal deleted");
      await utils.proposals.list.invalidate();
      navigate(proposalsPath);
    },
    onError: error => toast.error(error.message),
  });
  const downloadSignedPdf = trpc.proposals.downloadSignedPdf.useMutation({
    onError: error => toast.error(error.message),
  });
  const money = (minor: number) => new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: proposal?.currency || currencyCode,
    minimumFractionDigits: 2,
  }).format((minor || 0) / 100);

  if (isLoading) return <ModuleLayout title="Proposal" icon={<FileText className="h-5 w-5" />}><div className="p-8 text-center">Loading proposal…</div></ModuleLayout>;
  if (!proposal) return <ModuleLayout title="Proposal not found" icon={<FileText className="h-5 w-5" />}><div className="p-8 text-center"><Button variant="outline" onClick={() => navigate(proposalsPath)}><ArrowLeft className="mr-2 h-4 w-4" />Back to proposals</Button></div></ModuleLayout>;

  const lineItems = Array.isArray(proposal.lineItems) ? proposal.lineItems as Array<{ description?: string; quantity?: number; unitPrice?: number; total?: number }> : [];
  const downloadSignedCopy = async () => {
    try {
      const result = await downloadSignedPdf.mutateAsync(proposal.id);
      const bytes = Uint8Array.from(atob(result.pdfBase64), (character) => character.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Could not download signed proposal PDF", error);
    }
  };

  return <ModuleLayout
    title={proposal.title || "Proposal"}
    description={`Proposal ${proposal.proposalNumber}`}
    icon={<FileText className="h-5 w-5" />}
    breadcrumbs={[{ label: "Dashboard", href: slug ? `/org/${slug}/crm-home` : "/crm-home" }, { label: "Proposals", href: proposalsPath }, { label: proposal.proposalNumber }]}
    actions={<Button variant="outline" onClick={() => navigate(proposalsPath)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>}
  >
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2"><Badge variant="secondary">{proposal.status}</Badge><Badge variant="outline">{(proposal.signingStatus || "not_sent").replaceAll("_", " ")}</Badge></div>
        <div className="flex flex-wrap gap-2">
          {proposal.signingStatus === "not_sent" && <>
            {templates.length > 0 && <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Choose document template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default document template</SelectItem>
                {templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.title}</SelectItem>)}
              </SelectContent>
            </Select>}
            <Button onClick={() => setSigningDialogOpen(true)}><ShieldCheck className="mr-2 h-4 w-4" />Send for signature</Button>
          </>}
          {proposal.signedDocumentHtml && <Button variant="outline" onClick={downloadSignedCopy} disabled={downloadSignedPdf.isPending}>
            {downloadSignedPdf.isPending ? "Generating PDF…" : <><Download className="mr-2 h-4 w-4" />Download signed PDF</>}
          </Button>}
          {proposal.signingStatus === "not_sent" && <>
            <Button variant="outline" onClick={() => navigate(`${proposalsPath}/${proposal.id}/edit`)}>Edit draft</Button>
            <Button variant="destructive" disabled={deleteProposal.isPending} onClick={() => {
              if (window.confirm("Delete this draft proposal? This cannot be undone.")) deleteProposal.mutate(proposal.id);
            }}>
              {deleteProposal.isPending ? "Deleting..." : "Delete draft"}
            </Button>
          </>}
        </div>
      </div>
      <Card><CardHeader><CardTitle>Proposal overview</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2">
        <div><p className="text-sm text-muted-foreground">Prepared for</p><p className="font-medium">{client?.companyName || client?.contactPerson || "—"}</p></div>
        <div><p className="text-sm text-muted-foreground">Client contact</p><p className="font-medium">{client?.contactPerson || "—"}{client?.email ? ` · ${client.email}` : ""}</p></div>
        <div><p className="text-sm text-muted-foreground">Issue date</p><p className="font-medium">{proposal.issueDate ? new Date(proposal.issueDate).toLocaleDateString() : "—"}</p></div>
        <div><p className="text-sm text-muted-foreground">Valid until</p><p className="font-medium">{proposal.expiryDate ? new Date(proposal.expiryDate).toLocaleDateString() : "—"}</p></div>
        <div><p className="text-sm text-muted-foreground">Total investment</p><p className="text-lg font-semibold">{money(proposal.total)}</p></div>
      </CardContent></Card>
      {proposal.description && <Card><CardHeader><CardTitle>Project overview</CardTitle></CardHeader><CardContent><RichTextDisplay html={proposal.description} /></CardContent></Card>}
      {proposal.deliverables && <Card><CardHeader><CardTitle>Scope and deliverables</CardTitle></CardHeader><CardContent><RichTextDisplay html={proposal.deliverables} /></CardContent></Card>}
      {proposal.timeline && <Card><CardHeader><CardTitle>Timeline and milestones</CardTitle></CardHeader><CardContent><RichTextDisplay html={proposal.timeline} /></CardContent></Card>}
      {lineItems.length > 0 && <Card><CardHeader><CardTitle>Investment breakdown</CardTitle></CardHeader><CardContent className="space-y-3">
        {lineItems.map((item, index) => <div key={`${item.description}-${index}`} className="flex flex-wrap justify-between gap-2 border-b pb-3 last:border-0">
          <div><p className="font-medium">{item.description}</p><p className="text-sm text-muted-foreground">{item.quantity || 1} × {money(item.unitPrice || 0)}</p></div>
          <p className="font-medium">{money(item.total || 0)}</p>
        </div>)}
        <div className="ml-auto max-w-sm space-y-1 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><span>{money(proposal.subtotal)}</span></p>
          <p className="flex justify-between"><span>Discount</span><span>−{money(proposal.discountAmount || 0)}</span></p>
          <p className="flex justify-between"><span>Tax</span><span>{money(proposal.taxAmount || 0)}</span></p>
          <p className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><span>{money(proposal.total)}</span></p>
        </div>
      </CardContent></Card>}
      {(proposal.assumptions || proposal.exclusions || proposal.terms) && <Card><CardHeader><CardTitle>Assumptions, exclusions, and terms</CardTitle></CardHeader><CardContent className="space-y-5">
        {proposal.assumptions && <section><h3 className="mb-2 font-medium">Assumptions</h3><RichTextDisplay html={proposal.assumptions} /></section>}
        {proposal.exclusions && <section><h3 className="mb-2 font-medium">Exclusions</h3><RichTextDisplay html={proposal.exclusions} /></section>}
        {proposal.terms && <section><h3 className="mb-2 font-medium">Commercial terms and acceptance</h3><RichTextDisplay html={proposal.terms} /></section>}
      </CardContent></Card>}
      {proposal.signedDocumentHtml ? <Card>
        <CardHeader><CardTitle>Executed proposal</CardTitle><CardDescription>Print this signed copy or use the browser’s “Save as PDF” option.</CardDescription></CardHeader>
        <CardContent><iframe title="Executed proposal" srcDoc={proposal.signedDocumentHtml} sandbox="" referrerPolicy="no-referrer" className="h-[700px] w-full rounded border bg-white" /></CardContent>
      </Card> : <Card>
        <CardHeader><CardTitle>Document preview</CardTitle><CardDescription>This snapshot is what will be signed. Once sent, the proposal is locked against editing.</CardDescription></CardHeader>
        <CardContent>{preview.data?.html
          ? <iframe title="Proposal document preview" srcDoc={preview.data.html} sandbox="" referrerPolicy="no-referrer" className="h-[700px] w-full rounded border bg-white" />
          : <p className="text-sm text-muted-foreground">{preview.isLoading ? "Preparing document…" : "The proposal preview is unavailable."}</p>}</CardContent>
      </Card>}
      {proposal.signingWorkflowId && <Card><CardHeader><CardTitle>Signature audit trail</CardTitle></CardHeader><CardContent>
        {auditTrail.isLoading ? <p className="text-sm text-muted-foreground">Loading audit trail…</p> : auditTrail.data?.length
          ? <div className="divide-y">{auditTrail.data.map(event => <div key={event.id} className="py-3"><p className="font-medium">{event.eventType.replaceAll("_", " ")}</p><p className="text-sm text-muted-foreground">{event.actorName || event.actorEmail || "System"} · {event.createdAt ? new Date(event.createdAt).toLocaleString() : ""}</p></div>)}</div>
          : <p className="text-sm text-muted-foreground">No audit events were found.</p>}
      </CardContent></Card>}
      <SigningWorkflowDialog
        open={signingDialogOpen}
        onOpenChange={setSigningDialogOpen}
        documentTitle={proposal.title || proposal.proposalNumber}
        defaultSigners={[
          ...(client?.email ? [{ name: client.contactPerson || client.companyName || "Client", email: client.email }] : []),
          ...(user?.email && user.email.toLowerCase() !== client?.email?.toLowerCase()
            ? [{ name: user.name || "Organization representative", email: user.email }]
            : []),
        ]}
        isPending={sendForSignature.isPending}
        onSubmit={signers => sendForSignature.mutate({
          id: proposal.id,
          signers,
          ...(selectedTemplateId !== "default" ? { templateId: selectedTemplateId } : {}),
        })}
      />
    </div>
  </ModuleLayout>;
}
