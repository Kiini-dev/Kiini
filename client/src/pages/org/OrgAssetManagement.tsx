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
import { TableItemLink } from "@/components/TableItemLink";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Eye, Package, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { SummaryStatCards } from "@/components/list-page/SummaryStatCards";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";
import { format } from "date-fns";
import { PaginationControls, usePagination } from "@/components/ui/data-table-controls";
import { ListPageToolbar } from "@/components/list-page/ListPageToolbar";
import { EnhancedBulkActions, bulkExportAction, bulkCopyIdsAction, bulkDeleteAction } from "@/components/list-page/EnhancedBulkActions";
import { RowActionsMenu, type RowAction } from "@/components/list-page/RowActionsMenu";

const emptyForm = { name: "", category: "", location: "", value: "", assignedTo: "", serialNumber: "", purchaseDate: "", status: "active" as const, notes: "" };
const ASSET_COLUMNS: ColumnConfig[] = [
  { key: "name", label: "Asset Name" }, { key: "category", label: "Category" },
  { key: "location", label: "Location" }, { key: "assignedTo", label: "Assigned To" },
  { key: "value", label: "Value" }, { key: "status", label: "Status" },
];

export default function AssetManagement() {
  const { allowed, isLoading: permissionLoading } = useRequireFeature("assets:view");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "value" | "purchaseDate" | "status">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const { visibleColumns, toggleColumn, isVisible, reset } = useColumnVisibility(ASSET_COLUMNS, "assets");
  const { page, pageSize, setPage, setPageSize, paginate } = usePagination(25);
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const _search = useSearch();
  useEffect(() => { if (new URLSearchParams(_search).get("action") === "create") setCreateOpen(true); }, []);

  const { data: rawData, isLoading: dataLoading } = trpc.assets.list.useQuery({});
  const assets = JSON.parse(JSON.stringify(rawData?.data ?? []));

  const createMutation = trpc.assets.create.useMutation({
    onSuccess: () => { utils.assets.list.invalidate(); toast.success("Asset registered"); setCreateOpen(false); setForm({ ...emptyForm }); },
    onError: (err: any) => toast.error(err.message),
  });
  const updateMutation = trpc.assets.update.useMutation({
    onSuccess: () => { utils.assets.list.invalidate(); toast.success("Asset updated"); setEditingAsset(null); },
    onError: (err: any) => toast.error(err.message),
  });
  const deleteMutation = trpc.assets.delete.useMutation({
    onSuccess: () => { utils.assets.list.invalidate(); toast.success("Asset deleted"); },
    onError: (err: any) => toast.error(err.message),
  });

  if (permissionLoading) return <div className="flex items-center justify-center h-screen"><Spinner/></div>;
  if (!allowed) return null;

  const filteredAssets = assets.filter((a: any) =>
    (a.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pagedAssets = paginate(filteredAssets);

  const openEdit = (a: any) => {
    setEditingAsset(a);
    setForm({ name: a.name || "", category: a.category || "", location: a.location || "", value: ((a.value || 0) / 100).toString(), assignedTo: a.assignedTo || "", supplier: a.supplier || "", serialNumber: a.serialNumber || "", purchaseDate: a.purchaseDate || "", status: a.status || "active", notes: a.notes || "" });
  };

  const handleSubmit = (isEdit: boolean) => {
    const payload = { name: form.name, category: form.category, location: form.location, value: parseFloat(form.value) || 0, assignedTo: form.assignedTo || undefined, supplier: form.supplier || undefined, serialNumber: form.serialNumber || undefined, purchaseDate: form.purchaseDate || undefined, status: form.status, notes: form.notes || undefined };
    if (isEdit && editingAsset) updateMutation.mutate({ id: editingAsset.id, ...payload });
    else createMutation.mutate(payload);
  };

  const AssetForm = () => (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Asset Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dell Laptop" /></div>
        <div className="space-y-1"><Label>Category *</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. ICT, Furniture" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Location *</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. HQ Office" /></div>
        <div className="space-y-1"><Label>Value (Ksh) *</Label><Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="0" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <EmployeeNameSelector label="Assigned To" value={form.assignedTo} onChange={assignedTo => setForm(f => ({ ...f, assignedTo }))} />
        <div className="space-y-1"><Label>Serial Number</Label><Input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} placeholder="SN-12345" /></div>
      </div>
      <SupplierSelector label="Supplier" value={form.supplier} onChange={supplier => setForm(f => ({ ...f, supplier }))} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Purchase Date</Label><Input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} /></div>
        <div className="space-y-1"><Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="disposed">Disposed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
    </div>
  );

  return (
    <ModuleLayout title="Asset Management" description="Track and manage company assets" icon={<Package className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Assets" }]}>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold">Assets</h2><p className="text-sm text-muted-foreground">Manage company assets and equipment</p></div>
          <Button onClick={() => { setForm({ ...emptyForm }); setCreateOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Register Asset</Button>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
        </div>
        <Card>
          <CardHeader><CardTitle>Asset Inventory</CardTitle><CardDescription>{filteredAssets.length} assets registered</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isVisible("name") && <TableHead>Asset Name</TableHead>}{isVisible("category") && <TableHead>Category</TableHead>}{isVisible("location") && <TableHead>Location</TableHead>}{isVisible("assignedTo") && <TableHead>Assigned To</TableHead>}{isVisible("value") && <TableHead>Value</TableHead>}{isVisible("status") && <TableHead>Status</TableHead>}<TableHead className="text-right"><div className="flex items-center justify-end gap-1">Actions<TableColumnSettings columns={ASSET_COLUMNS} visibleColumns={visibleColumns} onToggleColumn={toggleColumn} onReset={reset} /></div></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8"><Spinner /></TableCell></TableRow>
                  ) : filteredAssets.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No assets found. Click &quot;Register Asset&quot; to add one.</TableCell></TableRow>
                  ) : pagedAssets.map((asset: any) => (
                    <TableRow key={asset.id}>
                      {isVisible("name") && <TableCell className="font-medium"><TableItemLink href={`/assets/${asset.id}`}>{asset.name}</TableItemLink></TableCell>}
                      {isVisible("category") && <TableCell>{asset.category}</TableCell>}
                      {isVisible("location") && <TableCell>{asset.location}</TableCell>}
                      {isVisible("assignedTo") && <TableCell>{asset.assignedTo || "-"}</TableCell>}
                      {isVisible("value") && <TableCell>Ksh {((asset.value || 0) / 100).toLocaleString()}</TableCell>}
                      {isVisible("status") && <TableCell><Badge variant="default">{asset.status || "active"}</Badge></TableCell>}
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setLocation(`/assets/${asset.id}`)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(asset)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm("Delete this asset?")) deleteMutation.mutate(asset.id); }}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              total={filteredAssets.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={createOpen} onOpenChange={v => { setCreateOpen(v); if (!v) setForm({ ...emptyForm }); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Register Asset</DialogTitle></DialogHeader>
          <AssetForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => handleSubmit(false)} disabled={createMutation.isPending || !form.name || !form.category || !form.location || !form.value}>
              {createMutation.isPending ? "Saving..." : "Register Asset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingAsset} onOpenChange={v => { if (!v) setEditingAsset(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Edit Asset</DialogTitle></DialogHeader>
          <AssetForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAsset(null)}>Cancel</Button>
            <Button onClick={() => handleSubmit(true)} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
