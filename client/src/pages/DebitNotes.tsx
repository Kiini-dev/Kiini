import { ModuleLayout } from "@/components/ModuleLayout";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Eye, Edit, Trash2, Download, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { generateDebitNotePDF } from "@/lib/pdfGenerator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { TableItemLink } from "@/components/TableItemLink";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { PaginationControls, usePagination } from "@/components/ui/data-table-controls";
import { ListPageToolbar } from "@/components/list-page/ListPageToolbar";
import { SummaryStatCards, type SummaryCard } from "@/components/list-page/SummaryStatCards";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";
import { EnhancedBulkActions, bulkExportAction, bulkDeleteAction } from "@/components/list-page/EnhancedBulkActions";
import { RowActionsMenu } from "@/components/list-page/RowActionsMenu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface DebitNote {
  id: string;
  debitNoteNumber: string;
  issueDate: Date;
  supplierName: string;
  supplierId: string;
  reason: string;
  total: number;
  status: "draft" | "approved" | "settled";
  createdAt: Date;
}

type SortField = "debitNoteNumber" | "supplierName" | "total" | "issueDate" | "status";
type SortOrder = "asc" | "desc";

const DEBIT_NOTE_COLUMNS: ColumnConfig[] = [
  { key: "debitNoteNumber", label: "Debit Note #", defaultVisible: true },
  { key: "issueDate", label: "Issue Date", defaultVisible: true },
  { key: "supplierName", label: "Supplier", defaultVisible: true },
  { key: "reason", label: "Reason", defaultVisible: true },
  { key: "total", label: "Amount", defaultVisible: true },
  { key: "status", label: "Status", defaultVisible: true },
];

export default function DebitNotes() {
  const { allowed, isLoading: permLoading } = useRequireFeature("accounting:debit-notes:view");
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("issueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const { page, pageSize, setPage, setPageSize, paginate } = usePagination(25);
  const { isVisible } = useColumnVisibility(DEBIT_NOTE_COLUMNS, "debitnotes");

  const listQuery = trpc.debitNotes.list.useQuery({}, {
    onError: (error) => {
      toast.error(`Failed to load debit notes: ${error.message}`);
    },
  });

  const deleteMutation = trpc.debitNotes.delete.useMutation({
    onSuccess: () => {
      toast.success("Debit note deleted successfully");
      listQuery.refetch();
      setSelectedNotes(new Set());
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const bulkDeleteMutation = trpc.debitNotes.bulkDelete?.useMutation({
    onSuccess: (data) => {
      toast.success(`${data?.count || 0} debit note(s) deleted`);
      listQuery.refetch();
      setSelectedNotes(new Set());
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete debit notes");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this debit note?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Process and sort data
  const processedNotes = useMemo(() => {
    let filtered = (listQuery.data || []) as DebitNote[];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(note => note.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.debitNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
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
      title: "Total Debit Notes",
      value: (listQuery.data || []).length.toString(),
      icon: "FileText",
      trend: "neutral",
    },
    {
      title: "Total Amount",
      value: `$${((listQuery.data || []) as DebitNote[]).reduce((sum, n) => sum + (n.total || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: "DollarSign",
      trend: "up",
    },
    {
      title: "Pending Notes",
      value: ((listQuery.data || []) as DebitNote[]).filter(n => n.status === "draft").length.toString(),
      icon: "Clock",
      trend: "neutral",
    },
  ], [listQuery.data]);

  const paginatedNotes = paginate(processedNotes);

  if (permLoading) return <Spinner />;
  if (!allowed) return <div className="text-center py-10">Access Denied</div>;

  return (
    <ModuleLayout
      title="Debit Notes"
      description="Manage supplier debit notes and claims"
      icon="FileText"
      breadcrumbs={[{label: "Dashboard", href: "/crm-home"}, {label: "Accounting", href: "/accounting"}, {label: "Debit Notes"}]}
    >
      <SummaryStatCards cards={statCards} />

      <div className="mb-6">
        <ListPageToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search debit notes..."
          onCreateClick={() => setLocation("/debit-notes/create")}
          createLabel="New Debit Note"
          filterContent={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </div>

      {listQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : paginatedNotes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No debit notes found
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
                      checked={selectedNotes.size === paginatedNotes.length && paginatedNotes.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedNotes(new Set(paginatedNotes.map(n => n.id)));
                        } else {
                          setSelectedNotes(new Set());
                        }
                      }}
                    />
                  </TableHead>
                  {DEBIT_NOTE_COLUMNS.filter((col) => isVisible(col.key)).map(col => (
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
                {paginatedNotes.map((note) => (
                  <TableRow key={note.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedNotes.has(note.id)}
                        onCheckedChange={(checked) => {
                          const newSet = new Set(selectedNotes);
                          if (checked) newSet.add(note.id);
                          else newSet.delete(note.id);
                          setSelectedNotes(newSet);
                        }}
                      />
                    </TableCell>
                    {isVisible("debitNoteNumber") && <TableCell className="font-medium"><TableItemLink href={`/debit-notes/${note.id}`}>{note.debitNoteNumber}</TableItemLink></TableCell>}
                    {isVisible("issueDate") && <TableCell>{format(new Date(note.issueDate), "MMM dd, yyyy")}</TableCell>}
                    {isVisible("supplierName") && <TableCell>{note.supplierName}</TableCell>}
                    {isVisible("reason") && <TableCell className="text-sm text-gray-600">{note.reason}</TableCell>}
                    {isVisible("total") && <TableCell className="font-semibold">KES {note.total.toLocaleString()}</TableCell>}
                    {isVisible("status") && (
                      <TableCell>
                        <Badge
                          variant={
                            note.status === "draft" ? "secondary" :
                            note.status === "approved" ? "default" :
                            "outline"
                          }
                        >
                          {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <RowActionsMenu
                        id={note.id}
                        actions={[
                          { icon: <Eye className="h-4 w-4" />, label: "View", onClick: () => setLocation(`/debit-notes/${note.id}`) },
                          { icon: <Edit className="h-4 w-4" />, label: "Edit", onClick: () => setLocation(`/debit-notes/${note.id}/edit`) },
                          { icon: <Download className="h-4 w-4" />, label: "Download", onClick: () => generateDebitNotePDF(note as any) },
                          { icon: <Trash2 className="h-4 w-4" />, label: "Delete", variant: "destructive", onClick: () => handleDelete(note.id) },
                        ]}
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
              totalItems={processedNotes.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </Card>
      )}
    </ModuleLayout>
  );
}
