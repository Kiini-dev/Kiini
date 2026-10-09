import { useState, useEffect } from "react";
import { useSearch, useLocation, useParams } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { TableItemLink } from "@/components/TableItemLink";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Search, Eye, Edit2, Trash2, Calendar, Building2, DollarSign, ClipboardList, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { ContractPartyField } from "@/components/ContractPartyField";
import { ContractTypeSelector } from "@/components/ContractTypeSelector";
import { applyContractTypeTemplate, CONTRACT_TYPES } from "@/lib/contractTemplates";

type ContractFormValues = {
  name: string;
  vendor: string;
  startDate: string;
  endDate: string;
  value: string;
  status: "draft" | "active" | "expired";
  contractType: string;
  description: string;
  notes: string;
  counterpartyContactName: string;
  counterpartyEmail: string;
  counterpartyAddress: string;
  counterpartyRegistrationNumber: string;
  governingLaw: string;
  currency: string;
  paymentTerms: string;
  terminationTerms: string;
  confidentialityTerms: string;
  disputeResolution: string;
};

const emptyForm: ContractFormValues = {
  name: "", vendor: "", startDate: "", endDate: "", value: "",
  status: "draft" as const, contractType: "", description: "", notes: "",
  counterpartyContactName: "", counterpartyEmail: "", counterpartyAddress: "",
  counterpartyRegistrationNumber: "", governingLaw: "Kenya", currency: "KES",
  paymentTerms: "", terminationTerms: "", confidentialityTerms: "", disputeResolution: "",
};

export default function ContractManagement() {
  const { slug } = useParams<{ slug?: string }>();
  const contractsPath = slug ? `/org/${slug}/contracts` : "/contracts";
  const { allowed, isLoading: permissionLoading } = useRequireFeature("contracts:view");
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [form, setForm] = useState<ContractFormValues>({ ...emptyForm });
  const utils = trpc.useUtils();
  const _search = useSearch();
  useEffect(() => {
    if (new URLSearchParams(_search).get("action") === "create" || location.endsWith("/create")) {
      setCreateOpen(true);
    }
  }, [_search, location]);
  const { data: categorySettings } = trpc.settings.getByCategory.useQuery({ category: "contract_categories" }, { staleTime: 60_000 });
  const contractTypes = (() => {
    try {
      const parsed = JSON.parse(categorySettings?.list || "null");
      const configured = Array.isArray(parsed)
        ? parsed
          .map((category) => typeof category === "string" ? { value: category, label: category } : category?.name ? { value: category.name, label: category.name } : null)
          .filter(Boolean) as { value: string; label: string }[]
        : [];
      return configured.length > 0 ? configured : CONTRACT_TYPES;
    } catch {
      return CONTRACT_TYPES;
    }
  })();

  const { data: rawData, isLoading: dataLoading } = trpc.contracts.list.useQuery({});
  const contracts = JSON.parse(JSON.stringify(rawData?.data ?? []));

  const createMutation = trpc.contracts.create.useMutation({
    onSuccess: () => { utils.contracts.list.invalidate(); toast.success("Contract created"); setCreateOpen(false); setForm({ ...emptyForm }); },
    onError: (err: any) => toast.error(err.message),
  });
  const updateMutation = trpc.contracts.update.useMutation({
    onSuccess: () => { utils.contracts.list.invalidate(); toast.success("Contract updated"); setEditingContract(null); },
    onError: (err: any) => toast.error(err.message),
  });
  const deleteMutation = trpc.contracts.delete.useMutation({
    onSuccess: () => { utils.contracts.list.invalidate(); toast.success("Contract deleted"); },
    onError: (err: any) => toast.error(err.message),
  });

  if (permissionLoading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  if (!allowed) return null;

  const filteredContracts = contracts.filter((c: any) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.vendor || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (status: string) => status === "active" ? "default" : status === "expired" ? "destructive" : "secondary";

  const openEdit = (c: any) => {
    setEditingContract(c);
    setForm({
      name: c.name || "", vendor: c.vendor || "", startDate: c.startDate || "",
      endDate: c.endDate || "", value: ((c.value || 0) / 100).toString(),
      status: c.status === "active" ? "active" : c.status === "expired" ? "expired" : "draft", contractType: c.contractType || "",
      description: c.description || "", notes: c.notes || "",
      counterpartyContactName: c.counterpartyContactName || "",
      counterpartyEmail: c.counterpartyEmail || "",
      counterpartyAddress: c.counterpartyAddress || "",
      counterpartyRegistrationNumber: c.counterpartyRegistrationNumber || "",
      governingLaw: c.governingLaw || "Kenya",
      currency: c.currency || "KES",
      paymentTerms: c.paymentTerms || "",
      terminationTerms: c.terminationTerms || "",
      confidentialityTerms: c.confidentialityTerms || "",
      disputeResolution: c.disputeResolution || "",
    });
  };

  const handleSubmit = (isEdit: boolean) => {
    if (!form.name || !form.vendor || !form.startDate || !form.endDate || !form.value) {
      toast.error("Please fill in all required fields"); return;
    }
    const payload = {
      name: form.name, vendor: form.vendor, startDate: form.startDate,
      endDate: form.endDate, value: parseFloat(form.value) || 0,
      status: form.status, contractType: form.contractType || undefined,
      description: form.description || undefined, notes: form.notes || undefined,
      counterpartyContactName: form.counterpartyContactName || undefined,
      counterpartyEmail: form.counterpartyEmail || undefined,
      counterpartyAddress: form.counterpartyAddress || undefined,
      counterpartyRegistrationNumber: form.counterpartyRegistrationNumber || undefined,
      governingLaw: form.governingLaw || "Kenya",
      currency: form.currency || "KES",
      paymentTerms: form.paymentTerms || undefined,
      terminationTerms: form.terminationTerms || undefined,
      confidentialityTerms: form.confidentialityTerms || undefined,
      disputeResolution: form.disputeResolution || undefined,
    };
    if (isEdit && editingContract) {
      updateMutation.mutate({ id: editingContract.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const ContractForm = ({ isEdit }: { isEdit: boolean }) => (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      {/* Contract Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Contract Information
          </CardTitle>
          <CardDescription>
            Selecting a type fills an editable draft for its scope and terms. Add the real party, dates, value, and transaction details, then obtain local legal review before signature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contract Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Office Lease 2025" />
            </div>
            <div className="space-y-2">
              <Label>Contract Type</Label>
              <ContractTypeSelector options={contractTypes} value={form.contractType} onChange={v => {
                const selectedType = contractTypes.find(type => type.value === v);
                setForm(current => applyContractTypeTemplate(current, v, selectedType?.label));
              }} placeholder="Select type..." />
            </div>
          </div>
          <div className="space-y-2 md:w-1/2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v: ContractFormValues["status"]) => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendor / Party Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Vendor / Party Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContractPartyField value={form.vendor} onChange={vendor => setForm(f => ({ ...f, vendor }))} />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Counterparty Contact Name</Label>
              <Input value={form.counterpartyContactName} onChange={e => setForm(f => ({ ...f, counterpartyContactName: e.target.value }))} placeholder="Authorized representative" />
            </div>
            <div className="space-y-2">
              <Label>Counterparty Email</Label>
              <Input type="email" value={form.counterpartyEmail} onChange={e => setForm(f => ({ ...f, counterpartyEmail: e.target.value }))} placeholder="signer@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input value={form.counterpartyRegistrationNumber} onChange={e => setForm(f => ({ ...f, counterpartyRegistrationNumber: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Governing Law</Label>
              <Input value={form.governingLaw} onChange={e => setForm(f => ({ ...f, governingLaw: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Counterparty Address</Label>
              <Input value={form.counterpartyAddress} onChange={e => setForm(f => ({ ...f, counterpartyAddress: e.target.value }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period & Value */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Period &amp; Value
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2 md:w-1/2">
            <Label>Contract Value (Ksh) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="0.00" step="0.01" min="0" className="pl-9" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description & Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            Description &amp; Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Scope of Work / Services</Label>
            <RichTextEditor value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Describe the services, deliverables, and responsibilities..." minHeight="140px" />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Payment Terms</Label>
            <RichTextEditor value={form.paymentTerms} onChange={v => setForm(f => ({ ...f, paymentTerms: v }))} placeholder="Fees, payment schedule, invoicing, and taxes..." minHeight="100px" />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Termination</Label>
              <RichTextEditor value={form.terminationTerms} onChange={v => setForm(f => ({ ...f, terminationTerms: v }))} placeholder="Notice periods and termination conditions..." minHeight="100px" />
            </div>
            <div className="space-y-2">
              <Label>Confidentiality</Label>
              <RichTextEditor value={form.confidentialityTerms} onChange={v => setForm(f => ({ ...f, confidentialityTerms: v }))} placeholder="Confidential information and handling obligations..." minHeight="100px" />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Dispute Resolution</Label>
            <RichTextEditor value={form.disputeResolution} onChange={v => setForm(f => ({ ...f, disputeResolution: v }))} placeholder="How disputes will be resolved..." minHeight="100px" />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Internal Notes</Label>
            <RichTextEditor value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Add any internal notes..." minHeight="100px" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ModuleLayout title="Contracts Management" description="Manage contracts, agreements, and vendor terms" icon={<FileText className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: slug ? `/org/${slug}/crm-home` : "/crm-home" }, { label: "Contracts" }]}>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold">Contracts</h2><p className="text-sm text-muted-foreground">Manage all contracts and agreements</p></div>
          <Button onClick={() => { setForm({ ...emptyForm }); setCreateOpen(true); }}><Plus className="h-4 w-4 mr-2" /> New Contract</Button>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contracts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
        </div>
        <Card>
          <CardHeader><CardTitle>Contracts</CardTitle><CardDescription>{filteredContracts.length} contracts</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Vendor</TableHead><TableHead>Period</TableHead><TableHead>Value</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8"><Spinner /></TableCell></TableRow>
                  ) : filteredContracts.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No contracts found. Click &quot;New Contract&quot; to add one.</TableCell></TableRow>
                  ) : filteredContracts.map((contract: any) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium"><TableItemLink href={`${contractsPath}/${contract.id}`}>{contract.name}</TableItemLink></TableCell>
                      <TableCell className="text-sm">{contractTypes.find(t => t.value === contract.contractType)?.label || contract.contractType || "-"}</TableCell>
                      <TableCell>{contract.vendor}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "-"} → {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>Ksh {((contract.value || 0) / 100).toLocaleString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Badge variant={statusColor(contract.status || "draft")}>{contract.status || "draft"}</Badge>
                        {contract.signingStatus && contract.signingStatus !== "not_sent" && <Badge variant="outline">Locked for signature</Badge>}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setLocation(`${contractsPath}/${contract.id}`)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" disabled={contract.status === "terminated" || Boolean(contract.signingStatus && contract.signingStatus !== "not_sent")} title={contract.status === "terminated" ? "Terminated contracts are immutable" : contract.signingStatus && contract.signingStatus !== "not_sent" ? "Contracts are locked after signature invitations are sent" : "Edit contract"} onClick={() => openEdit(contract)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-500" disabled={contract.status === "terminated" || Boolean(contract.signingStatus && contract.signingStatus !== "not_sent")} title={contract.status === "terminated" ? "Terminated contracts are retained for audit history" : contract.signingStatus && contract.signingStatus !== "not_sent" ? "Contracts in a signing workflow cannot be deleted" : "Delete contract"} onClick={() => { if (confirm("Delete this contract?")) deleteMutation.mutate(contract.id); }}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={v => { setCreateOpen(v); if (!v) setForm({ ...emptyForm }); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>New Contract</DialogTitle></DialogHeader>
          {ContractForm({ isEdit: false })}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateOpen(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
            <Button onClick={() => handleSubmit(false)} disabled={createMutation.isPending || !form.name || !form.vendor || !form.startDate || !form.endDate || !form.value}>
              <Save className="h-4 w-4 mr-2" />{createMutation.isPending ? "Saving..." : "Create Contract"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingContract} onOpenChange={v => { if (!v) setEditingContract(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Edit Contract</DialogTitle></DialogHeader>
          {ContractForm({ isEdit: true })}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditingContract(null)}><X className="h-4 w-4 mr-2" />Cancel</Button>
            <Button onClick={() => handleSubmit(true)} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />{updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
