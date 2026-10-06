import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Shield, Plus, Search, Edit2, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRequireFeature } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { SummaryStatCards } from "@/components/list-page/SummaryStatCards";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { PaginationControls, usePagination } from "@/components/ui/data-table-controls";
import { ListPageToolbar } from "@/components/list-page/ListPageToolbar";
import { EnhancedBulkActions, bulkExportAction, bulkCopyIdsAction, bulkDeleteAction } from "@/components/list-page/EnhancedBulkActions";
import { RowActionsMenu, type RowAction } from "@/components/list-page/RowActionsMenu";

const WARRANTY_COLUMNS: ColumnConfig[] = [
  { key: "product", label: "Product" }, { key: "vendor", label: "Vendor" },
  { key: "coverage", label: "Coverage" }, { key: "expiryDate", label: "Expiry Date" },
  { key: "status", label: "Status" },
];

export default function WarrantyManagement() {
  const { allowed, isLoading: permissionLoading } = useRequireFeature("warranty:view");
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"product" | "vendor" | "expiryDate" | "status">("product");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedWarranties, setSelectedWarranties] = useState<Set<string>>(new Set());
  const { visibleColumns, toggleColumn, isVisible, reset } = useColumnVisibility(WARRANTY_COLUMNS, "warranties");
  const { page, pageSize, setPage, setPageSize, paginate } = usePagination(25);
  const utils = trpc.useUtils();
  const { data: rawData, isLoading: dataLoading } = trpc.warranty.list.useQuery({}, {
    enabled: Boolean(allowed),
  });
  const deleteMutation = trpc.warranty.delete.useMutation({
    onSuccess: () => { utils.warranty.list.invalidate(); toast.success("Warranty deleted"); },
    onError: (err: any) => toast.error(err.message),
  });

  const bulkDeleteMutation = trpc.warranty.bulkDelete?.useMutation({
    onSuccess: (data) => {
      utils.warranty.list.invalidate();
      toast.success(`${data?.count || 0} warranty(ies) deleted`);
      setSelectedWarranties(new Set());
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Compute filtered warranties
  const warranties = JSON.parse(JSON.stringify(rawData?.data ?? []));
  let filteredWarranties = warranties.filter((w: any) =>
    (w.product || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.vendor || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (statusFilter !== "all") {
    filteredWarranties = filteredWarranties.filter((w: any) => w.status === statusFilter);
  }

  filteredWarranties.sort((a: any, b: any) => {
    let aVal: any = a[sortField] || "";
    let bVal: any = b[sortField] || "";

    if (sortField === "expiryDate") {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    }

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const statusColor = (status: string) => {
    return status === "active" ? "default" : status === "expiring_soon" ? "secondary" : "destructive";
  };

  if (permissionLoading) {
    return <div className="flex items-center justify-center h-screen"><Spinner/></div>;
  }

  if (!allowed) return null;

  return (
    <ModuleLayout
      title="Warranty Management"
      description="Track product warranties and coverage"
      icon={<Shield className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Warranties" },
      ]}
    >
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Warranties</h2>
            <p className="text-sm text-muted-foreground">Manage product warranties and coverage</p>
          </div>
          <Button onClick={() => navigate("/warranty/create")}><Plus className="h-4 w-4 mr-2" /> Add Warranty</Button>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search warranties..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Warranty Registry</CardTitle>
            <CardDescription>{filteredWarranties.length} warranties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isVisible("product") && <TableHead>Product</TableHead>}
                    {isVisible("vendor") && <TableHead>Vendor</TableHead>}
                    {isVisible("coverage") && <TableHead>Coverage</TableHead>}
                    {isVisible("expiryDate") && <TableHead>Expiry Date</TableHead>}
                    {isVisible("status") && <TableHead>Status</TableHead>}
                    <TableHead className="text-right"><div className="flex items-center justify-end gap-1">Actions<TableColumnSettings columns={WARRANTY_COLUMNS} visibleColumns={visibleColumns} onToggleColumn={toggleColumn} onReset={reset} /></div></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Spinner /></TableCell></TableRow>
                  ) : filteredWarranties.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No warranties found</TableCell></TableRow>
                  ) : filteredWarranties.map((warranty: any) => (
                    <TableRow key={warranty.id}>
                      {isVisible("product") && <TableCell className="font-medium">{warranty.product}</TableCell>}
                      {isVisible("vendor") && <TableCell>{warranty.vendor}</TableCell>}
                      {isVisible("coverage") && <TableCell>{warranty.coverage}</TableCell>}
                      {isVisible("expiryDate") && <TableCell>{warranty.expiryDate ? new Date(warranty.expiryDate).toLocaleDateString() : "-"}</TableCell>}
                      {isVisible("status") && <TableCell><Badge variant={statusColor(warranty.status || "active")}>{warranty.status || "active"}</Badge></TableCell>}
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/warranty/${warranty.id}`)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/warranty/${warranty.id}/edit`)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate(warranty.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
