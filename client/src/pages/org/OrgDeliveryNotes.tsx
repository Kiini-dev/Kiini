import { useState, useEffect, useMemo } from "react";
import { useSearch, useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Plus, Search, Eye, Edit2, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { SummaryStatCards } from "@/components/list-page/SummaryStatCards";
import { RowActionsMenu } from "@/components/list-page/RowActionsMenu";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";
import { PaginationControls, usePagination } from "@/components/ui/data-table-controls";
import { SupplierSelector } from "@/components/SupplierSelector";
import { ListPageToolbar } from "@/components/list-page/ListPageToolbar";
import { EnhancedBulkActions, bulkExportAction, bulkCopyIdsAction, bulkDeleteAction } from "@/components/list-page/EnhancedBulkActions";
import { OperationalTemplateFields, createOperationalTemplateDefaults, normalizeOperationalTemplateData, type OperationalTemplateData } from "@/components/operations/OperationalTemplateFields";

const emptyForm = { dnNo: "", supplier: "", orderId: "", deliveryDate: "", items: "", status: "pending" as const, notes: "" };

const DELIVERY_NOTE_COLUMNS: ColumnConfig[] = [
  { key: "dnNo", label: "DN #" },
  { key: "supplier", label: "Supplier" },
  { key: "items", label: "Items" },
  { key: "deliveryDate", label: "Delivery Date" },
  { key: "status", label: "Status" },
];

export default function DeliveryNotes() {
  const { allowed, isLoading: permissionLoading } = useRequireFeature("delivery_notes:view");
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"dnNo" | "supplier" | "deliveryDate" | "status">("dnNo");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingDN, setEditingDN] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [templateData, setTemplateData] = useState<OperationalTemplateData>(() => createOperationalTemplateDefaults("delivery-note"));
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const { page, pageSize, setPage, setPageSize, paginate } = usePagination(25);
  const utils = trpc.useUtils();
  const _search = useSearch();
  const { visibleColumns, toggleColumn, isVisible } = useColumnVisibility(DELIVERY_NOTE_COLUMNS, "deliveryNotes");
  useEffect(() => { if (new URLSearchParams(_search).get("action") === "create") setCreateOpen(true); }, []);

  const { data: notesData, isLoading: dataLoading } = trpc.deliveryNotes.list.useQuery({ limit: 50, offset: 0 }, { enabled: allowed });
  const deliveryNotes: any[] = (notesData?.data || []) as any[];

  const createMutation = trpc.deliveryNotes.create.useMutation({
    onSuccess: () => { utils.deliveryNotes.list.invalidate(); toast.success("Delivery note created"); setCreateOpen(false); setForm({ ...emptyForm }); },
    onError: (err: any) => toast.error(err.message),
  });
  const updateMutation = trpc.deliveryNotes.update.useMutation({
    onSuccess: () => { utils.deliveryNotes.list.invalidate(); toast.success("Delivery note updated"); setEditingDN(null); },
    onError: (err: any) => toast.error(err.message),
  });
  const deleteMutation = trpc.deliveryNotes.delete.useMutation({
    onSuccess: () => { utils.deliveryNotes.list.invalidate(); toast.success("Delivery note deleted"); },
    onError: (err: any) => toast.error(err.message),
  });
  const bulkDeleteMutation = trpc.deliveryNotes.bulkDelete?.useMutation({
    onSuccess: () => { utils.deliveryNotes.list.invalidate(); toast.success("Delivery notes deleted"); setSelectedNotes(new Set()); },
    onError: (err: any) => toast.error(err.message),
  });

  const processedNotes = useMemo(() => {
    let filtered = deliveryNotes.filter(d => {
      const matchesSearch = d.dnNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           d.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortField as keyof typeof a] || "";
      let bVal = b[sortField as keyof typeof b] || "";
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [deliveryNotes, searchQuery, statusFilter, sortField, sortOrder]);

  const statCards = useMemo(() => {
    const totalCount = deliveryNotes.length;
    const deliveredCount = deliveryNotes.filter(d => d.status === "delivered").length;
    const totalItems = deliveryNotes.reduce((sum, d) => sum + (d.items || 0), 0);
    return [
      { label: "Total Delivery Notes", value: totalCount, icon: "📦" },
      { label: "Delivered", value: deliveredCount, icon: "✓" },
      { label: "Total Items", value: totalItems, icon: "📊" },
    ];
  }, [deliveryNotes]);

  if (permissionLoading) return <div className="flex items-center justify-center h-screen"><Spinner/></div>;
  if (!allowed) return null;

  const paginatedNotes = paginate(processedNotes);

  const toggleSelectAll = () => {
    if (selectedNotes.size === paginatedNotes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(paginatedNotes.map(d => d.id)));
    }
  };

  const toggleSelectNote = (id: string) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotes(newSelected);
  };

  const statusColor = (status: string) => status === "delivered" ? "default" : status === "partial" ? "secondary" : "outline";

  const openEdit = (d: any) => {
    setEditingDN(d);
    setForm({ dnNo: d.dnNo || "", supplier: d.supplier || "", orderId: d.orderId || "", deliveryDate: d.deliveryDate || "", items: String(d.items || ""), status: d.status || "pending", notes: d.notes || "" });
    setTemplateData(d.templateData || createOperationalTemplateDefaults("delivery-note"));
  };

  const handleSubmit = (isEdit: boolean) => {
    const normalizedTemplateData = normalizeOperationalTemplateData("delivery-note", templateData);
    const lineItems = normalizedTemplateData.lineItems || [];
    const lineItemCount = lineItems.reduce((sum: number, item: any) => sum + Number(item.quantityShipped || item.quantityOrdered || 0), 0);
    const payload = { supplier: form.supplier, orderId: form.orderId || undefined, deliveryDate: form.deliveryDate, items: parseInt(form.items) || lineItemCount, status: form.status, notes: form.notes || undefined, templateData: normalizedTemplateData };
    if (isEdit && editingDN) updateMutation.mutate({ id: editingDN.id, ...payload });
    else createMutation.mutate(payload);
  };

  const DNForm = () => (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <SupplierSelector value={form.supplier} onChange={supplier => setForm(f => ({ ...f, supplier }))} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Order Reference</Label><Input value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} placeholder="PO-001" /></div>
        <div className="space-y-1"><Label>Dispatch Date *</Label><Input type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Number of Items *</Label><Input type="number" value={form.items} onChange={e => setForm(f => ({ ...f, items: e.target.value }))} placeholder="0" /></div>
        <div className="space-y-1"><Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
      <OperationalTemplateFields documentType="delivery-note" value={templateData} onChange={setTemplateData} />
    </div>
  );

  return (
    <ModuleLayout title="Delivery Notes" description="Track incoming shipments and deliveries" icon={<Package className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Procurement", href: "/procurement" }, { label: "Delivery Notes" }]}>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Delivery Notes</h2>
          <p className="text-sm text-muted-foreground">Track and manage incoming deliveries</p>
        </div>

        <SummaryStatCards cards={statCards} />

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by DN # or supplier..." 
                value={searchQuery} 
                onChange={(e) => {setSearchQuery(e.target.value); setPage(1);;}} 
                className="flex-1" 
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => {setStatusFilter(v); setPage(1);}}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <TableColumnSettings columns={DELIVERY_NOTE_COLUMNS} visibleColumns={visibleColumns} onToggleColumn={toggleColumn} />
            <Button onClick={() => { setForm({ ...emptyForm }); setTemplateData(createOperationalTemplateDefaults("delivery-note")); setCreateOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" /> New DN
            </Button>
          </div>

          {selectedNotes.size > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <span className="text-sm">{selectedNotes.size} selected</span>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => {
                  if (confirm("Delete selected delivery notes?")) {
                    bulkDeleteMutation?.mutate([...selectedNotes]);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            {dataLoading ? (
              <div className="flex items-center justify-center h-32"><Spinner /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"><Checkbox checked={selectedNotes.size === paginatedNotes.length && paginatedNotes.length > 0} onCheckedChange={toggleSelectAll} /></TableHead>
                      {isVisible("dnNo") && <TableHead>DN #</TableHead>}
                      {isVisible("supplier") && <TableHead>Supplier</TableHead>}
                      {isVisible("items") && <TableHead>Items</TableHead>}
                      {isVisible("deliveryDate") && <TableHead>Delivery Date</TableHead>}
                      {isVisible("status") && <TableHead>Status</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedNotes.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {processedNotes.length === 0 ? "No delivery notes found" : "No results for current filters"}
                      </TableCell></TableRow>
                    ) : (
                      paginatedNotes.map(dn => (
                        <TableRow key={dn.id}>
                          <TableCell><Checkbox checked={selectedNotes.has(dn.id)} onCheckedChange={() => toggleSelectNote(dn.id)} /></TableCell>
                          {isVisible("dnNo") && <TableCell className="font-medium">{dn.dnNo}</TableCell>}
                          {isVisible("supplier") && <TableCell>{dn.supplier}</TableCell>}
                          {isVisible("items") && <TableCell>{dn.items}</TableCell>}
                          {isVisible("deliveryDate") && <TableCell>{dn.deliveryDate ? format(new Date(dn.deliveryDate), "MMM dd, yyyy") : "—"}</TableCell>}
                          {isVisible("status") && <TableCell><Badge variant={statusColor(dn.status)}>{dn.status}</Badge></TableCell>}
                          <TableCell className="text-right">
                            <RowActionsMenu 
                              actions={[
                                { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => setLocation(`/delivery-notes/${dn.id}`) },
                                { label: "Edit", icon: <Edit2 className="h-4 w-4" />, onClick: () => openEdit(dn) },
                                { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => { if (confirm("Delete?")) deleteMutation.mutate(dn.id); }, destructive: true },
                              ]}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <PaginationControls total={processedNotes.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </div>

      <Dialog open={createOpen} onOpenChange={v => { setCreateOpen(v); if (!v) { setForm({ ...emptyForm }); setTemplateData(createOperationalTemplateDefaults("delivery-note")); } }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Delivery Note</DialogTitle></DialogHeader>
          <DNForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => handleSubmit(false)} disabled={createMutation.isPending || !form.supplier || !form.deliveryDate || (!form.items && !(templateData.lineItems || []).length)}>
              {createMutation.isPending ? "Saving..." : "Create Delivery Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingDN} onOpenChange={v => { if (!v) { setEditingDN(null); setTemplateData(createOperationalTemplateDefaults("delivery-note")); } }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Delivery Note</DialogTitle></DialogHeader>
          <DNForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDN(null)}>Cancel</Button>
            <Button onClick={() => handleSubmit(true)} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
