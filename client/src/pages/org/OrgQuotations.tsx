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
import { Eye, FileText, Plus, Search, Edit2, Trash2, ChevronUp, ChevronDown, Loader2, Download, Copy } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { PaginationControls, usePagination } from "@/components/ui/data-table-controls";
import { ListPageToolbar } from "@/components/list-page/ListPageToolbar";
import { SummaryStatCards, type SummaryCard } from "@/components/list-page/SummaryStatCards";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";
import { EnhancedBulkActions, bulkExportAction, bulkCopyIdsAction, bulkDeleteAction } from "@/components/list-page/EnhancedBulkActions";
import { RowActionsMenu, actionIcons, type RowAction } from "@/components/list-page/RowActionsMenu";

const emptyForm = { rfqNo: "", supplier: "", description: "", amount: "", dueDate: "", status: "draft" as const };

const QUOTATION_COLUMNS: ColumnConfig[] = [
  { key: "id", label: "ID", defaultVisible: true },
  { key: "rfqNo", label: "RFQ #", defaultVisible: true },
  { key: "supplier", label: "Supplier", defaultVisible: true },
  { key: "amount", label: "Amount", defaultVisible: true },
  { key: "dueDate", label: "Due Date", defaultVisible: true },
  { key: "status", label: "Status", defaultVisible: true },
  { key: "description", label: "Description", defaultVisible: false },
  { key: "submittedDate", label: "Submitted", defaultVisible: false },
];

export default function QuotationsPage() {
  const { allowed, isLoading: permissionLoading } = useRequireFeature("quotations:view");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"rfqNo" | "supplier" | "amount" | "dueDate" | "status">("rfqNo");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRFQ, setEditingRFQ] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [selectedQuotations, setSelectedQuotations] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const { page: currentPage, pageSize, setPage: setCurrentPage, setPageSize, paginate } = usePagination(25);
  const { visibleColumns, toggleColumn, isVisible, pageSize: colPageSize, updatePageSize, reset } = useColumnVisibility(QUOTATION_COLUMNS, "quotations");
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const _search = useSearch();
  useEffect(() => { if (new URLSearchParams(_search).get("action") === "create") setCreateOpen(true); }, []);

  const { data: quotationsData, isLoading: dataLoading } = trpc.quotations.list.useQuery({}, { enabled: allowed });
  const quotations = quotationsData?.data || [];

  const createMutation = trpc.quotations.create.useMutation({
    onSuccess: () => { utils.quotations.list.invalidate(); toast.success("RFQ created"); setCreateOpen(false); setForm({ ...emptyForm }); },
    onError: (err: any) => toast.error(err.message),
  });
  const updateMutation = trpc.quotations.update.useMutation({
    onSuccess: () => { utils.quotations.list.invalidate(); toast.success("RFQ updated"); setEditingRFQ(null); },
    onError: (err: any) => toast.error(err.message),
  });
  const deleteMutation = trpc.quotations.delete.useMutation({
    onSuccess: () => { utils.quotations.list.invalidate(); toast.success("RFQ deleted"); },
    onError: (err: any) => toast.error(err.message),
  });
  const bulkDeleteMutation = trpc.quotations.bulkDelete?.useMutation({
    onSuccess: (data) => { utils.quotations.list.invalidate(); toast.success(`${data?.count || 0} quotation(s) deleted`); setSelectedQuotations(new Set()); },
    onError: (err: any) => toast.error(err.message),
  });

  const processedQuotations = useMemo(() => {
    let filtered = quotations.filter(q => {
      const matchesSearch = (q.rfqNo || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (q.supplier || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a: any, b: any) => {
      let aVal: any = a[sortField] || "";
      let bVal: any = b[sortField] || "";

      if (sortField === "amount") {
        aVal = parseFloat(String(aVal));
        bVal = parseFloat(String(bVal));
      } else if (sortField === "dueDate") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [quotations, searchQuery, statusFilter, sortField, sortOrder]);

  const statCards: SummaryCard[] = useMemo(() => {
    const totalCount = quotations.length;
    const totalAmount = quotations.reduce((sum, q) => sum + ((q.amount as number) || 0), 0);
    const approvedCount = quotations.filter(q => q.status === "approved").length;
    const draftCount = quotations.filter(q => q.status === "draft").length;
    const fmt = (v: number) => `Ksh ${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    return [
      { label: "Total RFQs", value: fmt(totalAmount), count: totalCount, color: "blue" as const, progress: 100 },
      { label: "Approved", value: approvedCount.toString(), count: approvedCount, color: "green" as const, progress: totalCount > 0 ? (approvedCount / totalCount) * 100 : 0 },
      { label: "Drafts", value: draftCount.toString(), count: draftCount, color: "orange" as const, progress: totalCount > 0 ? (draftCount / totalCount) * 100 : 0 },
    ];
  }, [quotations]);

  if (permissionLoading) return <div className="flex items-center justify-center h-screen"><Spinner/></div>;
  if (!allowed) return null;

  const paginatedQuotations = paginate(processedQuotations);

  const toggleSelectAll = () => {
    if (selectedQuotations.size === paginatedQuotations.length) {
      setSelectedQuotations(new Set());
    } else {
      setSelectedQuotations(new Set(paginatedQuotations.map(q => q.id)));
    }
  };

  const toggleSelectQuotation = (id: string) => {
    const newSelected = new Set(selectedQuotations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuotations(newSelected);
  };

  const statusColor = (status: string) => status === "approved" ? "default" : status === "under_review" ? "secondary" : "outline";

  const openEdit = (q: any) => {
    setEditingRFQ(q);
    setForm({ rfqNo: q.rfqNo || "", supplier: q.supplier || "", description: q.description || "", amount: ((q.amount || 0) / 100).toString(), dueDate: q.dueDate || "", status: q.status || "draft" });
  };

  const handleSubmit = (isEdit: boolean) => {
    const payload = { rfqNo: form.rfqNo, supplier: form.supplier, description: form.description || undefined, amount: parseFloat(form.amount) || 0, dueDate: form.dueDate || undefined, status: form.status };
    if (isEdit && editingRFQ) updateMutation.mutate({ id: editingRFQ.id, ...payload });
    else createMutation.mutate(payload);
  };

  const RFQForm = () => (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Supplier *</Label><Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Supplier name" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Amount (Ksh) *</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" /></div>
        <div className="space-y-1"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
      </div>
      <div className="space-y-1"><Label>Status</Label>
        <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
    </div>
  );

  return (
    <ModuleLayout title="Quotations & RFQs" description="Request and manage quotations from suppliers" icon={<FileText className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Procurement", href: "/procurement" }, { label: "Quotations" }]}>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Quotations & RFQs</h2>
          <p className="text-sm text-muted-foreground">Request and compare supplier quotations</p>
        </div>

        {/* Stat Cards */}
        <SummaryStatCards cards={statCards} />

        {/* Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by RFQ # or supplier..." 
                value={searchQuery} 
                onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}} 
                className="flex-1" 
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => {setStatusFilter(v); setCurrentPage(1);}}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <TableColumnSettings columns={QUOTATION_COLUMNS} visibleColumns={visibleColumns} onToggleColumn={toggleColumn} />
            <Button onClick={() => { setForm({ ...emptyForm }); setCreateOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" /> New RFQ
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedQuotations.size > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <span className="text-sm">{selectedQuotations.size} selected</span>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => {
                  if (confirm("Delete selected quotations?")) {
                    bulkDeleteMutation?.mutate([...selectedQuotations]);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            {dataLoading ? (
              <div className="flex items-center justify-center h-32"><Spinner /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedQuotations.size === paginatedQuotations.length && paginatedQuotations.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      {isVisible("rfqNo") && (
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => {
                            if (sortField === "rfqNo") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortField("rfqNo");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            RFQ # {sortField === "rfqNo" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                          </div>
                        </TableHead>
                      )}
                      {isVisible("supplier") && (
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => {
                            if (sortField === "supplier") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortField("supplier");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            Supplier {sortField === "supplier" && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                          </div>
                        </TableHead>
                      )}
                      {isVisible("amount") && <TableHead>Amount</TableHead>}
                      {isVisible("dueDate") && <TableHead>Due Date</TableHead>}
                      {isVisible("status") && <TableHead>Status</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedQuotations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {processedQuotations.length === 0 ? "No quotations found" : "No results for current filters"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedQuotations.map(q => (
                        <TableRow key={q.id}>
                          <TableCell><Checkbox checked={selectedQuotations.has(q.id)} onCheckedChange={() => toggleSelectQuotation(q.id)} /></TableCell>
                          {isVisible("rfqNo") && <TableCell className="font-medium">{q.rfqNo}</TableCell>}
                          {isVisible("supplier") && <TableCell>{q.supplier}</TableCell>}
                          {isVisible("amount") && <TableCell>Ksh {((q.amount || 0) / 100).toLocaleString()}</TableCell>}
                          {isVisible("dueDate") && <TableCell>{q.dueDate ? format(new Date(q.dueDate), "MMM dd, yyyy") : "—"}</TableCell>}
                          {isVisible("status") && <TableCell><Badge variant={statusColor(q.status)}>{q.status}</Badge></TableCell>}
                          <TableCell className="text-right">
                            <RowActionsMenu 
                              actions={[
                                { label: "View", icon: Eye, onClick: () => setLocation(`/quotations/${q.id}`) },
                                { label: "Edit", icon: Edit2, onClick: () => openEdit(q) },
                                { label: "Delete", icon: Trash2, onClick: () => { if (confirm("Delete this quotation?")) deleteMutation.mutate(q.id); }, isDangerous: true },
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

        <PaginationControls total={processedQuotations.length} page={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
      </div>

      <Dialog open={createOpen} onOpenChange={v => { setCreateOpen(v); if (!v) setForm({ ...emptyForm }); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New RFQ / Quotation</DialogTitle></DialogHeader>
          <RFQForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => handleSubmit(false)} disabled={createMutation.isPending || !form.rfqNo || !form.supplier || !form.amount}>
              {createMutation.isPending ? "Saving..." : "Create RFQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingRFQ} onOpenChange={v => { if (!v) setEditingRFQ(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Edit Quotation</DialogTitle></DialogHeader>
          <RFQForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRFQ(null)}>Cancel</Button>
            <Button onClick={() => handleSubmit(true)} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
