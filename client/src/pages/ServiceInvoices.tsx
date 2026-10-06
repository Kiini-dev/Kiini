import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import DashboardLayout from "@/components/DashboardLayout";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Plus, Eye, Edit, Trash2, Download, Send, ArrowUpDown, Wrench } from "lucide-react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { PaginationControls, usePagination } from "@/components/ui/data-table-controls";
import { ListPageToolbar } from "@/components/list-page/ListPageToolbar";
import { SummaryStatCards, type SummaryCard } from "@/components/list-page/SummaryStatCards";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";
import { RowActionsMenu } from "@/components/list-page/RowActionsMenu";
import { InvoiceSearchFilter } from "@/components/SearchAndFilter";

interface ServiceInvoice {
  id: string;
  serviceInvoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  clientName: string;
  clientId: string;
  serviceDescription: string;
  serviceItems: any[];
  total: number;
  status: "draft" | "sent" | "accepted" | "paid" | "cancelled";
  createdAt: Date;
}

type SortField = "serviceInvoiceNumber" | "clientName" | "total" | "issueDate" | "dueDate" | "status";
type SortOrder = "asc" | "desc";

const SERVICE_INVOICE_COLUMNS: ColumnConfig[] = [
  { key: "id", label: "ID", defaultVisible: true },
  { key: "serviceInvoiceNumber", label: "Invoice #", defaultVisible: true },
  { key: "issueDate", label: "Issue Date", defaultVisible: true },
  { key: "dueDate", label: "Due Date", defaultVisible: true },
  { key: "clientName", label: "Client", defaultVisible: true },
  { key: "serviceDescription", label: "Description", defaultVisible: true },
  { key: "total", label: "Amount", defaultVisible: true },
  { key: "status", label: "Status", defaultVisible: true },
];

export default function ServiceInvoices() {
  const { allowed, isLoading: permLoading } = useRequireFeature("accounting:service-invoices:view");
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("issueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const { visibleColumns, toggleColumn, isVisible } = useColumnVisibility(SERVICE_INVOICE_COLUMNS, "serviceinvoices");
  const { page, pageSize, setPage, setPageSize, paginate } = usePagination(25);

  const setSearchQuery = setSearchTerm;
  const setFilters = (filters: any) => {
    if (filters.status) setStatusFilter(filters.status);
    if (filters.sortBy) {
      const sortMap: Record<string, SortField> = {
        number: "serviceInvoiceNumber",
        date: "issueDate",
        amount: "total",
        dueDate: "dueDate",
      };
      setSortField(sortMap[filters.sortBy] || "issueDate");
    }
    if (filters.sortOrder) setSortOrder(filters.sortOrder);
  };

  const listQuery = trpc.serviceInvoices.list.useQuery({}, {
    onError: (error) => {
      toast.error(`Failed to load service invoices: ${error.message}`);
    },
  });

  const deleteMutation = trpc.serviceInvoices.delete.useMutation({
    onSuccess: () => {
      toast.success("Service invoice deleted successfully");
      listQuery.refetch();
      setSelectedInvoices(new Set());
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service invoice?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Process and sort data
  const processedInvoices = useMemo(() => {
    let filtered = (listQuery.data || []) as ServiceInvoice[];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.serviceInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === "asc" ? cmp : -cmp;
    });
    
    return filtered;
  }, [listQuery.data, statusFilter, searchTerm, sortField, sortOrder]);

  // Calculate stat cards
  const statCards: SummaryCard[] = useMemo(() => [
    {
      title: "Total Invoices",
      value: (listQuery.data || []).length.toString(),
      icon: "FileText",
      trend: "neutral",
    },
    {
      title: "Total Revenue",
      value: `$${((listQuery.data || []) as ServiceInvoice[]).reduce((sum, inv) => sum + (inv.total || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: "DollarSign",
      trend: "up",
    },
    {
      title: "Pending Payment",
      value: ((listQuery.data || []) as ServiceInvoice[]).filter(inv => inv.status === "sent" || inv.status === "accepted").length.toString(),
      icon: "Clock",
      trend: "neutral",
    },
  ], [listQuery.data]);

  const paginatedInvoices = paginate(processedInvoices);

  if (permLoading) return <Spinner />;
  if (!allowed) return <div className="text-center py-10">Access Denied</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "sent": return "default";
      case "accepted": return "outline";
      case "paid": return "default";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const currentSelectedInvoiceId = Array.from(selectedInvoices)[0] ?? "";
  const rowActions: RowAction[] = [
    { icon: <Eye className="h-4 w-4" />, label: "View", onClick: () => setLocation(`/service-invoices/${currentSelectedInvoiceId}`) },
    { icon: <Edit className="h-4 w-4" />, label: "Edit", onClick: () => setLocation(`/service-invoices/${currentSelectedInvoiceId}/edit`) },
    { icon: <Download className="h-4 w-4" />, label: "Download", onClick: () => toast.info("PDF download feature") },
    ...(statusFilter === "draft" ? [{ icon: <Send className="h-4 w-4" />, label: "Send", onClick: () => toast.info("Send functionality") }] as RowAction[] : []),
    { icon: <Trash2 className="h-4 w-4" />, label: "Delete", onClick: () => handleDelete(currentSelectedInvoiceId), variant: "destructive" },
  ];

  return (
    <ModuleLayout
      title="Service Invoices"
      description="Invoice clients for services rendered"
      icon={<Wrench className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Products & Services", href: "/services" },
        { label: "Services", href: "/services-invoices" },
      ]}
      actions={
        <Button onClick={() => setLocation("/service-invoices/create")}>
         <Plus className="mr-2 h-4 w-4" />
         Add Service Invoice
        </Button>
      }
    >
      <div className="space-y-6">
        <InvoiceSearchFilter
          onSearch={setSearchQuery}
          onFilter={setFilters}
        />
      <SummaryStatCards cards={statCards} />
      <div className="mb-6">
        <ListPageToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onNewClick={() => setLocation("/service-invoices/create")}
          filterOptions={[
            { value: "all", label: "All" },
            { value: "draft", label: "Draft" },
            { value: "sent", label: "Sent" },
            { value: "accepted", label: "Accepted" },
            { value: "paid", label: "Paid" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          currentFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
      </div>

      {listQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : paginatedInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No service invoices found
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedInvoices.size === paginatedInvoices.length && paginatedInvoices.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedInvoices(new Set(paginatedInvoices.map(inv => inv.id)));
                        } else {
                          setSelectedInvoices(new Set());
                        }
                      }}
                    />
                  </TableHead>
                  {visibleColumns.map(col => (
                    <TableHead key={col.key} className="cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        {col.label}
                        {sortField === col.key && <ArrowUpDown className="w-4 h-4" />}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedInvoices.has(inv.id)}
                        onCheckedChange={(checked) => {
                          const newSet = new Set(selectedInvoices);
                          if (checked) newSet.add(inv.id);
                          else newSet.delete(inv.id);
                          setSelectedInvoices(newSet);
                        }}
                      />
                    </TableCell>
                    {isVisible("serviceInvoiceNumber") && <TableCell className="font-medium">{inv.serviceInvoiceNumber}</TableCell>}
                    {isVisible("issueDate") && <TableCell>{format(new Date(inv.issueDate), "MMM dd, yyyy")}</TableCell>}
                    {isVisible("dueDate") && <TableCell>{format(new Date(inv.dueDate), "MMM dd, yyyy")}</TableCell>}
                    {isVisible("clientName") && <TableCell>{inv.clientName}</TableCell>}
                    {isVisible("serviceDescription") && <TableCell className="text-sm text-gray-600">{inv.serviceDescription?.substring(0, 50)}...</TableCell>}
                    {isVisible("total") && <TableCell className="font-semibold">KES {inv.total.toLocaleString()}</TableCell>}
                    {isVisible("status") && (
                      <TableCell>
                        <Badge variant={getStatusColor(inv.status) as any}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <RowActionsMenu
                        id={inv.id}
                        actions={rowActions}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t p-4 flex justify-between items-center">
            <PaginationControls
              page={page}
              pageSize={pageSize}
              totalItems={processedInvoices.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </Card>
      )}
      </div>
    </ModuleLayout>
  );
}
