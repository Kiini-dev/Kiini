import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Plus, Download, Upload, Trash2, Loader2, Wallet, Search, User, Coins, CalendarDays, StickyNote, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCurrencySettings } from "@/lib/currency";
import { SummaryStatCards } from "@/components/list-page/SummaryStatCards";
import { RowActionsMenu } from "@/components/list-page/RowActionsMenu";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";
import { format } from "date-fns";
import { PaginationControls, usePagination } from "@/components/ui/data-table-controls";
import { ListPageToolbar } from "@/components/list-page/ListPageToolbar";
import { EnhancedBulkActions, bulkExportAction, bulkCopyIdsAction, bulkDeleteAction } from "@/components/list-page/EnhancedBulkActions";
import { OperationalTemplateFields, createOperationalTemplateDefaults, normalizeOperationalTemplateData, type OperationalTemplateData } from "@/components/operations/OperationalTemplateFields";

export default function ImprestsPage() {
  // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
  const { allowed, isLoading } = useRequireFeature("procurement:imprest:view");
  const { code: currencyCode } = useCurrencySettings();
  const [, setLocation] = useLocation();
  
  // Column configuration
  const IMPREST_COLUMNS: ColumnConfig[] = [
    { key: "imprestNumber", label: "Imprest #" },
    { key: "userName", label: "Employee" },
    { key: "amount", label: "Amount" },
    { key: "approvalStatus", label: "Status" },
    { key: "dateNeeded", label: "Date Needed" },
  ];

  // Sorting and pagination state
  const [sortField, setSortField] = useState("imprestNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedImprests, setSelectedImprests] = useState<Set<string>>(new Set());
  const { page, pageSize, setPage, setPageSize, paginate } = usePagination(25);
  const { visibleColumns, toggleColumn, isVisible } = useColumnVisibility(IMPREST_COLUMNS, "imprests");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSurrenderOpen, setIsSurrenderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedImprest, setSelectedImprest] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    imprestNumber: "",
    userId: "",
    userName: "",
    purpose: "",
    amount: 0,
    dateRequested: new Date().toISOString().split("T")[0],
    dateNeeded: "",
    approvalStatus: "pending",
    notes: "",
  });

  const [surrenderData, setSurrenderData] = useState({
    amount: 0,
    notes: "",
  });
  const [templateData, setTemplateData] = useState<OperationalTemplateData>(() => createOperationalTemplateDefaults("imprest"));

  // ALL HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURNS
  // Queries - Fetch users/employees for dropdown
  const { data: imprests = [], isLoading: isLoadingImprests, refetch } = trpc.imprest.list.useQuery({});
  const { data: surrenders = [], refetch: refetchSurrenders } = trpc.imprestSurrender.list.useQuery({});
  const { data: employees = [] } = trpc.employees.list.useQuery({ limit: 500 });
  const employeeOptions = employees
    .filter((employee: any) => employee.userId)
    .map((employee: any) => ({
      value: employee.userId,
      label: `${employee.firstName} ${employee.lastName}`.trim(),
      keywords: [employee.employeeNumber, employee.email, employee.department].filter(Boolean).join(" "),
    }));

  // Mutations
  const createMutation = trpc.imprest.create.useMutation({
    onSuccess: () => {
      toast.success("Imprest request created successfully");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create imprest");
    },
  });

  const deleteMutation = trpc.imprest.delete.useMutation({
    onSuccess: () => {
      toast.success("Imprest deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete imprest");
    },
  });

  const bulkDeleteMutation = trpc.imprest.bulkDelete?.useMutation?.({
    onSuccess: () => {
      toast.success("Imprests deleted successfully");
      setSelectedImprests(new Set());
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete imprests");
    },
  }) || { mutate: () => toast.error("Bulk delete not available"), isPending: false };

  const surrenderMutation = trpc.imprestSurrender.create.useMutation({
    onSuccess: () => {
      toast.success("Surrender recorded successfully");
      setIsSurrenderOpen(false);
      setSurrenderData({ amount: 0, notes: "" });
      refetch();
      refetchSurrenders();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record surrender");
    },
  });

  // Computed properties for sorting and pagination (MUST be before permission checks to follow React hooks rules)
  const processedImprests = useMemo(() => {
    let filtered = imprests.filter(imp => {
      const matchesSearch = imp.imprestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           imp.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           imp.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || imp.approvalStatus === statusFilter;
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
  }, [imprests, searchTerm, statusFilter, sortField, sortOrder]);

  const statCards = useMemo(() => {
    const totalCount = imprests.length;
    const totalAmount = imprests.reduce((sum, imp) => sum + (imp.amount || 0), 0);
    const approvedCount = imprests.filter(imp => imp.approvalStatus === "approved").length;
    return [
      { label: "Total Imprests", value: totalCount, icon: "📋" },
      { label: "Total Value", value: `Ksh ${(totalAmount / 100).toLocaleString()}`, icon: "💰" },
      { label: "Approved", value: approvedCount, icon: "✓" },
    ];
  }, [imprests]);

  const paginatedImprests = paginate(processedImprests);

  const resetForm = () => {
    setFormData({
      imprestNumber: "",
      userId: "",
      userName: "",
      purpose: "",
      amount: 0,
      dateRequested: new Date().toISOString().split("T")[0],
      dateNeeded: "",
      approvalStatus: "pending",
      notes: "",
    });
    setTemplateData(createOperationalTemplateDefaults("imprest"));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleEmployeeSelect = (userId: string) => {
    const selectedEmployee = employees.find((employee: any) => employee.userId === userId);
    setFormData((prev) => ({
      ...prev,
      userId,
      userName: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`.trim() : "",
    }));
  };

  const handleCreateImprest = () => {
    if (!formData.userId || formData.amount <= 0) {
      toast.error("Employee and Amount are required");
      return;
    }

    createMutation.mutate({
      userId: formData.userId,
      purpose: formData.purpose,
      amount: formData.amount * 100,
      dateRequested: formData.dateRequested || undefined,
      dateNeeded: formData.dateNeeded || undefined,
      approvalStatus: formData.approvalStatus,
      notes: formData.notes || undefined,
      templateData: normalizeOperationalTemplateData("imprest", {
        ...templateData,
        requestDate: templateData.requestDate || formData.dateRequested,
        employeeName: templateData.employeeName || formData.userName,
        initialCashFloat: formData.amount,
      }),
    } as any);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = [
        ["Imprest Number", "Employee", "Amount", "Purpose", "Status", "Date Requested", "Date Needed"],
        ...filteredImprests.map((imp: any) => [
          imp.imprestNumber,
          imp.userName,
          imp.amount / 100,
          imp.purpose,
          imp.approvalStatus,
          imp.dateRequested || "",
          imp.dateNeeded || "",
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const element = document.createElement("a");
      const file = new Blob([csv], { type: "text/csv" });
      element.href = URL.createObjectURL(file);
      element.download = `imprests-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Imprests exported successfully");
    } catch (error) {
      toast.error("Failed to export imprests");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const lines = text.split("\n").slice(1);
        let imported = 0;

        for (const line of lines) {
          if (!line.trim()) continue;
          const [imprestNumber, userId, amount, purpose] = line.split(",");
          if (imprestNumber && userId && amount) {
            try {
              await createMutation.mutateAsync({
                imprestNumber,
                userId,
                purpose,
                amount: Number(amount) * 100,
              } as any);
              imported++;
            } catch (err) {
              console.error("Error importing row:", err);
            }
          }
        }
        toast.success(`Imported ${imported} imprests successfully`);
        refetch();
      } catch (error) {
        toast.error("Failed to import imprests");
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  // Filter imprests AFTER all hooks are called
  if (!Array.isArray(imprests)) {
    return null;
  }
  
  const filteredImprests = imprests.filter((imp: any) => {
    const matchesSearch =
      imp.imprestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.purpose?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || imp.approvalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "settled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return <div className="text-center py-10">Access Denied</div>;

  return (
    <ModuleLayout
      title="Imprests"
      description="Manage cash advances and imprest requests for employees"
      icon={<Wallet className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Procurement", href: "/procurement" },
        { label: "Imprests" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            disabled={isImporting}
            className="gap-2"
          >
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export
          </Button>
          <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Summary Statistics */}
        <SummaryStatCards cards={statCards} />

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by imprest number, employee, or purpose..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="pl-8 w-full"
                  />
                </div>
              </div>
                  <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="settled">Settled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <TableColumnSettings columns={IMPREST_COLUMNS} visibleColumns={visibleColumns} onToggleColumn={toggleColumn} />
            </div>
          </CardContent>
        </Card>

        {/* Imprests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Imprests ({processedImprests.length})</CardTitle>
            <CardDescription>Manage employee cash advances and imprest requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingImprests ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : processedImprests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No imprests found. Click "New Request" to get started.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedImprests.size === paginatedImprests.length && paginatedImprests.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedImprests(new Set(paginatedImprests.map(i => i.id)));
                              } else {
                                setSelectedImprests(new Set());
                              }
                            }}
                          />
                        </TableHead>
                        {IMPREST_COLUMNS.map(col => (
                          isVisible(col.key) && (
                            <TableHead key={col.key} className="cursor-pointer" onClick={() => {
                              setSortField(col.key);
                              setSortOrder(sortField === col.key && sortOrder === "asc" ? "desc" : "asc");
                            }}>
                              <div className="flex items-center gap-2">
                                {col.label}
                                {sortField === col.key && (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                              </div>
                            </TableHead>
                          )
                        ))}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedImprests.map((imp: any) => {
                        const surrendered = surrenders
                          .filter((s: any) => s.imprestId === imp.id)
                          .reduce((sum, s) => sum + (s.amount || 0), 0);
                        return (
                          <TableRow key={imp.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedImprests.has(imp.id)}
                                onCheckedChange={(checked) => {
                                  const newSet = new Set(selectedImprests);
                                  if (checked) newSet.add(imp.id);
                                  else newSet.delete(imp.id);
                                  setSelectedImprests(newSet);
                                }}
                              />
                            </TableCell>
                            {isVisible("imprestNumber") && <TableCell className="font-medium">{imp.imprestNumber}</TableCell>}
                            {isVisible("userName") && <TableCell>{imp.userName}</TableCell>}
                            {isVisible("amount") && <TableCell className="text-right">Ksh {((imp.amount || 0) / 100).toLocaleString()}</TableCell>}
                            {isVisible("approvalStatus") && <TableCell><Badge className={imp.approvalStatus === "approved" ? "bg-green-100 text-green-800" : imp.approvalStatus === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>{imp.approvalStatus?.toUpperCase()}</Badge></TableCell>}
                            {isVisible("dateNeeded") && <TableCell>{imp.dateNeeded ? format(new Date(imp.dateNeeded), "MMM dd, yyyy") : "N/A"}</TableCell>}
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => setLocation(`/imprests/${imp.id}`)}><Eye className="w-4 h-4" /></Button>
                              <Button variant="outline" size="sm" onClick={() => { setSelectedImprest(imp); setSurrenderData({ amount: 0, notes: "" }); setIsSurrenderOpen(true); }}>Surrender</Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(imp.id)} disabled={deleteMutation.isPending}><Trash2 className="w-4 h-4" /></Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls total={processedImprests.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Create Imprest Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Imprest Request</DialogTitle>
              <DialogDescription>
                Submit a cash advance or imprest request for an employee
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Request Details */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Request Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userId">Select Employee *</Label>
                      <SearchableSelect
                        id="userId"
                        value={formData.userId}
                        options={employeeOptions}
                        onValueChange={handleEmployeeSelect}
                        placeholder="Select an employee"
                        searchPlaceholder="Search employees..."
                        emptyMessage="No employees with linked user accounts found."
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial & Schedule */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Coins className="w-4 h-4 text-green-600" />
                    Financial & Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (KES) *</Label>
                      <div className="relative">
                        <Coins className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          step="0.01"
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateRequested">Date Requested</Label>
                      <Input
                        id="dateRequested"
                        name="dateRequested"
                        type="date"
                        value={formData.dateRequested}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateNeeded">Date Needed</Label>
                      <Input
                        id="dateNeeded"
                        name="dateNeeded"
                        type="date"
                        value={formData.dateNeeded}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purpose & Notes */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-purple-600" />
                    Purpose & Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose *</Label>
                    <RichTextEditor
                      value={formData.purpose}
                      onChange={(html) => setFormData(prev => ({ ...prev, purpose: html }))}
                      placeholder="Describe the purpose of this imprest"
                      minHeight="100px"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <RichTextEditor
                      value={formData.notes}
                      onChange={(html) => setFormData(prev => ({ ...prev, notes: html }))}
                      placeholder="Additional notes or comments"
                      minHeight="80px"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <OperationalTemplateFields documentType="imprest" value={templateData} onChange={setTemplateData} />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateImprest}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Surrender Imprest Dialog */}
        {selectedImprest && (
          <Dialog open={isSurrenderOpen} onOpenChange={setIsSurrenderOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Surrender Imprest {selectedImprest.imprestNumber}</DialogTitle>
                <DialogDescription>
                  Record the surrender/return of cash from this imprest
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Original Amount</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: currencyCode,
                    }).format((selectedImprest.amount || 0) / 100)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surrenderAmount">Amount Returned (KES) *</Label>
                  <Input
                    id="surrenderAmount"
                    type="number"
                    value={surrenderData.amount}
                    onChange={(e) =>
                      setSurrenderData((prev) => ({
                        ...prev,
                        amount: Number(e.target.value),
                      }))
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surrenderNotes">Notes</Label>
                  <RichTextEditor
                    value={surrenderData.notes}
                    onChange={(html) => setSurrenderData(prev => ({ ...prev, notes: html }))}
                    placeholder="Any notes about the surrender"
                    minHeight="100px"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSurrenderOpen(false);
                    setSelectedImprest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (surrenderData.amount <= 0) {
                      toast.error("Amount must be greater than 0");
                      return;
                    }
                    surrenderMutation.mutate({
                      imprestId: selectedImprest.id,
                      amount: surrenderData.amount * 100,
                      notes: surrenderData.notes || undefined,
                    } as any);
                  }}
                  disabled={surrenderMutation.isPending}
                >
                  {surrenderMutation.isPending ? "Recording..." : "Record Surrender"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ModuleLayout>
  );
}
