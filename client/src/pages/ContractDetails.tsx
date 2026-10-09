import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Coins,
  FileText,
  Loader2,
  StickyNote,
  ShieldCheck,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { SigningWorkflowDialog } from "@/components/SigningWorkflowDialog";
import { ContractTerminationDialog } from "@/components/ContractTerminationDialog";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ContractDetails() {
  const params = useParams<{ id: string; slug?: string }>();
  const contractsPath = params.slug ? `/org/${params.slug}/contracts` : "/contracts";
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { code: currencyCode } = useCurrencySettings();
  const [signingDialogOpen, setSigningDialogOpen] = useState(false);
  const [terminationDialogOpen, setTerminationDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("default");
  const utils = trpc.useUtils();

  const { data: contract, isLoading } = trpc.contracts.getById.useQuery(params.id!, {
    enabled: !!params.id,
  });
  const { data: templates = [] } = trpc.contractTemplates.list.useQuery({});
  useEffect(() => setSelectedTemplateId("default"), [params.id]);
  const documentPreview = trpc.contracts.render.useQuery({
    id: params.id!,
    ...(selectedTemplateId !== "default" ? { templateId: selectedTemplateId } : {}),
  }, { enabled: Boolean(params.id && contract) });
  const auditTrail = trpc.eSignatures.getAuditTrail.useQuery(
    { workflowId: contract?.signingWorkflowId || "" },
    { enabled: Boolean(contract?.signingWorkflowId) },
  );
  const sendForSignature = trpc.contracts.sendForSignature.useMutation({
    onSuccess: async (result) => {
      toast.success(`Sent to the first signer. ${result.signerCount} signer${result.signerCount === 1 ? "" : "s"} in sequence.`);
      setSigningDialogOpen(false);
      await Promise.all([
        utils.contracts.getById.invalidate(params.id!),
        utils.contracts.list.invalidate(),
      ]);
    },
    onError: (error) => toast.error(error.message),
  });
  const downloadSignedPdf = trpc.contracts.downloadSignedPdf.useMutation({
    onError: (error) => toast.error(error.message),
  });

  const handleDownloadSignedPdf = async () => {
    try {
      const result = await downloadSignedPdf.mutateAsync(contract!.id);
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
      console.error("Could not download signed contract PDF", error);
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    expired: "bg-orange-100 text-orange-800",
    terminated: "bg-red-100 text-red-800",
    pending_signature: "bg-blue-100 text-blue-800",
    partially_signed: "bg-amber-100 text-amber-800",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Contract not found</p>
        <Button variant="outline" onClick={() => setLocation(contractsPath)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Contracts
        </Button>
      </div>
    );
  }

  return (
    <ModuleLayout
      title={contract.name || "Contract Details"}
      description={`Contract #${contract.contractNumber || contract.id?.slice(0, 8)}`}
      icon={<FileText className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Contracts", href: contractsPath },
        { label: contract.name || "Details" },
      ]}
      actions={
        <Button variant="outline" onClick={() => setLocation(contractsPath)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      }
    >
      <div className="max-w-4xl space-y-6">
        {/* Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge className={`text-sm px-3 py-1 ${statusColors[contract.status] || ""}`}>{contract.status?.toUpperCase()}</Badge>
            <Badge variant="outline">{(contract.signingStatus || "not_sent").replaceAll("_", " ")}</Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            Created {new Date(contract.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {contract.status === "active" && <Button variant="destructive" onClick={() => setTerminationDialogOpen(true)}>Terminate contract</Button>}
          {contract.status !== "terminated" && contract.signingStatus === "not_sent" && <>
            {templates.length > 0 && <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Choose document template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default document template</SelectItem>
                {templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.title}</SelectItem>)}
              </SelectContent>
            </Select>}
            <Button onClick={() => setSigningDialogOpen(true)}>
              <ShieldCheck className="w-4 h-4 mr-2" /> Send for signature
            </Button>
          </>}
          {contract.signedDocumentHtml && <Button variant="outline" onClick={handleDownloadSignedPdf} disabled={downloadSignedPdf.isPending}>
            {downloadSignedPdf.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {downloadSignedPdf.isPending ? "Generating PDF…" : "Download signed PDF"}
          </Button>}
        </div>
        {contract.terminatedAt && <Card>
          <CardHeader><CardTitle className="text-base">Termination record</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><span className="text-muted-foreground">Effective date: </span>{new Date(contract.terminatedAt).toLocaleDateString()}</p>
            {contract.terminationReason && <p><span className="text-muted-foreground">Reason: </span>{contract.terminationReason}</p>}
          </CardContent>
        </Card>}

        {/* Contract Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Contract Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Contract Name</p>
                <p className="font-medium">{contract.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contract Number</p>
                <p className="font-medium">{contract.contractNumber || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="font-medium">{contract.vendor || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Authorized contact</p>
                <p className="font-medium">{contract.counterpartyContactName || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Counterparty email</p>
                <p className="font-medium">{contract.counterpartyEmail || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration number</p>
                <p className="font-medium">{contract.counterpartyRegistrationNumber || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Governing law</p>
                <p className="font-medium">{contract.governingLaw || "Kenya"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contract Type</p>
                <p className="font-medium">{contract.contractType || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Value */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              Schedule & Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contract Value</p>
                <p className="font-medium text-lg">
                  {contract.value
                    ? new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(contract.value / 100)
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description & Notes */}
        {(contract.description || contract.paymentTerms || contract.terminationTerms || contract.confidentialityTerms || contract.disputeResolution || contract.notes) && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-purple-600" />
                Description & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Scope of work</p>
                  <RichTextDisplay html={contract.description} />
                </div>
              )}
              {contract.paymentTerms && <div><p className="text-sm text-muted-foreground mb-2">Payment terms</p><RichTextDisplay html={contract.paymentTerms} /></div>}
              {contract.terminationTerms && <div><p className="text-sm text-muted-foreground mb-2">Termination</p><RichTextDisplay html={contract.terminationTerms} /></div>}
              {contract.confidentialityTerms && <div><p className="text-sm text-muted-foreground mb-2">Confidentiality</p><RichTextDisplay html={contract.confidentialityTerms} /></div>}
              {contract.disputeResolution && <div><p className="text-sm text-muted-foreground mb-2">Dispute resolution</p><RichTextDisplay html={contract.disputeResolution} /></div>}
              {(contract.description || contract.paymentTerms || contract.terminationTerms || contract.confidentialityTerms || contract.disputeResolution) && contract.notes && <Separator />}
              {contract.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <RichTextDisplay html={contract.notes} />
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {contract.signedDocumentHtml ? <Card>
          <CardHeader><CardTitle>Executed document</CardTitle></CardHeader>
          <CardContent><iframe title="Executed contract" srcDoc={contract.signedDocumentHtml} sandbox="" referrerPolicy="no-referrer" className="h-[700px] w-full rounded border bg-white" /></CardContent>
        </Card> : <Card>
          <CardHeader><CardTitle>Document preview</CardTitle><p className="text-sm text-muted-foreground">This snapshot will be sent to the signers and locked after invitations are sent.</p></CardHeader>
          <CardContent>{documentPreview.data?.html
            ? <iframe title="Contract document preview" srcDoc={documentPreview.data.html} sandbox="" referrerPolicy="no-referrer" className="h-[700px] w-full rounded border bg-white" />
            : <p className="text-sm text-muted-foreground">{documentPreview.isLoading ? "Preparing document…" : documentPreview.error?.message || "The contract preview is unavailable."}</p>}</CardContent>
        </Card>}
        {contract.signingWorkflowId && <Card>
          <CardHeader><CardTitle>Signature audit trail</CardTitle></CardHeader>
          <CardContent>
            {auditTrail.isLoading ? <p className="text-sm text-muted-foreground">Loading audit trail…</p> : auditTrail.data?.length
              ? <div className="divide-y">{auditTrail.data.map((event) => <div key={event.id} className="py-3">
                <p className="font-medium">{event.eventType.replaceAll("_", " ")}</p>
                <p className="text-sm text-muted-foreground">{event.actorName || event.actorEmail || "System"} · {event.createdAt ? new Date(event.createdAt).toLocaleString() : ""}</p>
              </div>)}</div>
              : <p className="text-sm text-muted-foreground">No audit events were found.</p>}
          </CardContent>
        </Card>}
      </div>
      <SigningWorkflowDialog
        open={signingDialogOpen}
        onOpenChange={setSigningDialogOpen}
        documentTitle={contract.name}
        defaultSigners={[
          ...(contract.counterpartyEmail ? [{ name: contract.counterpartyContactName || contract.vendor || "Counterparty", email: contract.counterpartyEmail }] : []),
          ...(user?.email && user.email.toLowerCase() !== contract.counterpartyEmail?.toLowerCase()
            ? [{ name: user.name || "Organization representative", email: user.email }]
            : []),
        ]}
        isPending={sendForSignature.isPending}
        onSubmit={(signers) => sendForSignature.mutate({
          id: contract.id,
          signers,
          ...(selectedTemplateId !== "default" ? { templateId: selectedTemplateId } : {}),
        })}
      />
      <ContractTerminationDialog
        contractId={contract.id}
        contractName={contract.name || contract.contractNumber}
        open={terminationDialogOpen}
        onOpenChange={setTerminationDialogOpen}
        onCompleted={() => Promise.all([
          utils.contracts.getById.invalidate(params.id!),
          utils.contracts.list.invalidate(),
        ]).then(() => undefined)}
      />
    </ModuleLayout>
  );
}
