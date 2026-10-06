import { ModuleLayout } from "@/components/ModuleLayout";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableItemLink } from "@/components/TableItemLink";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, Edit, Trash2, Download, Clock, Wrench, Search } from "lucide-react";
import { toast } from "sonner";
import { useUserLookup } from "@/hooks/useUserLookup";
import { SummaryStatCards } from "@/components/list-page/SummaryStatCards";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";
import { format } from "date-fns";
import { PaginationControls, usePagination } from "@/components/ui/data-table-controls";
import { ListPageToolbar } from "@/components/list-page/ListPageToolbar";
import { EnhancedBulkActions, bulkExportAction, bulkCopyIdsAction, bulkDeleteAction } from "@/components/list-page/EnhancedBulkActions";
import { RowActionsMenu, type RowAction } from "@/components/list-page/RowActionsMenu";

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  issueDate: Date;
  description: string;
  assignedTo: string;
  startDate: Date;
  targetEndDate: Date;
  priority: "low" | "medium" | "high" | "critical";
  status: "draft" | "open" | "in-progress" | "completed" | "cancelled";
  total: number;
  createdAt: Date;
}

export default function WorkOrders() {
  const { allowed, isLoading: permLoading } = useRequireFeature("operations:work-orders:view");
  const [, setLocation] = useLocation();
  const { getUserName } = useUserLookup();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortField, setSortField] = useState<"workOrderNumber" | "priority" | "targetEndDate" | "status">("workOrderNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const selectedWOs = selectedOrders;
  const setSelectedWOs = setSelectedOrders;
  const { page, pageSize, setPage, setPageSize, paginate } = usePagination(25);
  
  // Column configuration
  const WO_COLUMNS: ColumnConfig[] = [
    { key: "workOrderNumber", label: "WO #", defaultVisible: true },
    { key: "description", label: "Description", defaultVisible: true },
    { key: "assignedTo", label: "Assigned To", defaultVisible: true },
    { key: "priority", label: "Priority", defaultVisible: true },
    { key: "status", label: "Status", defaultVisible: true },
    { key: "targetEndDate", label: "Target End Date", defaultVisible: true },
    { key: "total", label: "Total", defaultVisible: false },
  ];

  const { visibleColumns, toggleColumn, isVisible } = useColumnVisibility(WO_COLUMNS, "workorders");

  const { data: workOrders = [], isLoading, refetch } = trpc.workOrders.list.useQuery({});
  
  const deleteMutation = trpc.workOrders.delete.useMutation({
    onSuccess: () => {
      toast.success("Work order deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const bulkDeleteMutation = trpc.workOrders.bulkDelete?.useMutation?.({
    onSuccess: () => {
      toast.success("Work orders deleted successfully");
      setSelectedWOs(new Set());
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  }) || { mutate: () => {}, isPending: false };

  // Computed properties for sorting and pagination
  const processedWOs = useMemo(() => {
    let filtered = workOrders.filter(wo => {
      const matchesSearch = (wo.workOrderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (wo.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || wo.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortField as keyof typeof a] || "";
      let bVal = b[sortField as keyof typeof b] || "";
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [workOrders, searchQuery, statusFilter, priorityFilter, sortField, sortOrder]);

  const statCards = useMemo(() => {
    const totalCount = workOrders.length;
    const inProgressCount = workOrders.filter(wo => wo.status === "in-progress").length;
    const completedCount = workOrders.filter(wo => wo.status === "completed").length;
    return [
      { label: "Total Work Orders", value: totalCount, icon: "📋" },
      { label: "In Progress", value: inProgressCount, icon: "⏳" },
      { label: "Completed", value: completedCount, icon: "✓" },
    ];
  }, [workOrders]);

  const paginatedWOs = paginate(processedWOs);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "secondary";
      case "medium": return "default";
      case "low": return "outline";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "outline";
      case "open": return "default";
      case "in-progress": return "secondary";
      case "completed": return "default";
      case "cancelled": return "destructive";
      default: return "default";
    }
  };

  if (permLoading) return <Spinner />;
  if (!allowed) return <div className="text-center py-10">Access Denied</div>;

  return (
    <ModuleLayout
      title="Work Orders"
      description="Track service and maintenance work orders"
      icon={<Wrench className="h-6 w-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Operations", href: "/operations" },
        { label: "Work Orders" },
      ]}
      actions={
        <Button onClick={() => setLocation("/work-orders/create")}>
          <Plus className="w-4 h-4 mr-2" />
          New Work Order
        </Button>
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
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search work orders..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    className="flex-1"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(val) => { setPriorityFilter(val); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <TableColumnSettings columns={WO_COLUMNS} visibleColumns={visibleColumns} onToggleColumn={toggleColumn} />
            </div>
          </CardContent>
        </Card>

        {/* Work Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Work Orders ({processedWOs.length})</CardTitle>
            <CardDescription>Manage service and maintenance work orders</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : processedWOs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No work orders found. Click "New Work Order" to get started.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedWOs.size === paginatedWOs.length && paginatedWOs.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedWOs(new Set(paginatedWOs.map(w => w.id)));
                              else setSelectedWOs(new Set());
                            }}
                          />
                        </TableHead>
                        {WO_COLUMNS.map(col => (
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
                      {paginatedWOs.map(wo => (
                        <TableRow key={wo.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedWOs.has(wo.id)}
                              onCheckedChange={(checked) => {
                                const newSet = new Set(selectedWOs);
                                if (checked) newSet.add(wo.id);
                                else newSet.delete(wo.id);
                                setSelectedWOs(newSet);
                              }}
                            />
                          </TableCell>
                          {isVisible("workOrderNumber") && <TableCell className="font-medium"><TableItemLink href={`/work-orders/${wo.id}`}>{wo.workOrderNumber}</TableItemLink></TableCell>}
                          {isVisible("description") && <TableCell className="max-w-xs truncate">{wo.description}</TableCell>}
                          {isVisible("assignedTo") && <TableCell>{getUserName(wo.assignedTo)}</TableCell>}
                          {isVisible("priority") && <TableCell><Badge variant={getPriorityColor(wo.priority)}>{wo.priority}</Badge></TableCell>}
                          {isVisible("status") && <TableCell><Badge variant={getStatusColor(wo.status)}>{wo.status}</Badge></TableCell>}
                          {isVisible("targetEndDate") && <TableCell>{wo.targetEndDate ? format(new Date(wo.targetEndDate), "MMM dd, yyyy") : "N/A"}</TableCell>}
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => setLocation(`/work-orders/${wo.id}`)}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm("Delete this work order?")) deleteMutation.mutate(wo.id); }}><Trash2 className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <PaginationControls total={processedWOs.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
