import { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { TableItemLink } from "@/components/TableItemLink";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { buildCommunicationComposePath } from "@/lib/communications";
import { CitySelect } from "@/components/LocationSelects";
import { Plus, Search, Download, Upload, Edit2, Trash2, Eye, Loader2, Star, Truck, Copy, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { StatsCard } from "@/components/ui/stats-card";
import { ListPageToolbar } from "@/components/list-page/ListPageToolbar";
import { RowActionsMenu, actionIcons } from "@/components/list-page/RowActionsMenu";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";
import { EnhancedBulkActions, bulkExportAction, bulkCopyIdsAction, bulkDeleteAction, bulkEmailAction } from "@/components/list-page/EnhancedBulkActions";

export default function SuppliersPage() {
  const [location, navigate] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(new Set());
  const [formStep, setFormStep] = useState(1); // 1: Basic Info, 2: Contact, 3: Address & Tax

  const supplierColumns: ColumnConfig[] = [
    { key: "companyName", label: "Company Name" },
    { key: "contact", label: "Contact" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "rating", label: "Rating" },
    { key: "status", label: "Status" },
    { key: "city", label: "City" },
  ];
  const { visibleColumns, toggleColumn, isVisible, pageSize, updatePageSize, reset } = useColumnVisibility(supplierColumns, "suppliers");
  
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    phoneCountryCode: "+254", // Kenya by default
    alternatePhone: "",
    alternatePhoneCountryCode: "+254",
    city: "",
    postalCode: "",
    taxId: "",
    address: "",
  });

  // Queries
  const { data: suppliers = [], isLoading, refetch } = trpc.suppliers.list.useQuery({
    limit: 100,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    search: searchTerm || undefined,
  });

  // Mutations
  const createMutation = trpc.suppliers.create.useMutation({
    onSuccess: () => {
      toast.success("Supplier created successfully");
      setIsCreateOpen(false);
      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        alternatePhone: "",
        city: "",
        postalCode: "",
        taxId: "",
        address: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create supplier");
    },
  });

  const deleteMutation = trpc.suppliers.delete.useMutation({
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete supplier");
    },
  });

  const exportMutation = trpc.importExport.exportSuppliers.useQuery({
    format: 'csv'
  });

  const importMutation = trpc.importExport.importSuppliers.useMutation({
    onSuccess: (result) => {
      toast.success(`Imported ${result.imported} suppliers successfully`);
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} rows had errors`);
      }
      refetch();
      setIsImporting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to import suppliers");
      setIsImporting(false);
    },
  });

  const handleCreateSupplier = () => {
    if (!formData.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    createMutation.mutate({
      companyName: formData.companyName,
      contactPerson: formData.contactPerson || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      alternatePhone: formData.alternatePhone || undefined,
      city: formData.city || undefined,
      postalCode: formData.postalCode || undefined,
      taxId: formData.taxId || undefined,
      address: formData.address || undefined,
      qualificationStatus: "pending",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExportSuppliers = async () => {
    setIsExporting(true);
    try {
      const result = await exportMutation.refetch();
      if (result.data?.data) {
        const csvData = result.data.data;
        const element = document.createElement("a");
        const file = new Blob([csvData], { type: "text/csv" });
        element.href = URL.createObjectURL(file);
        element.download = `suppliers_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success("Suppliers exported successfully");
      }
    } catch (error) {
      toast.error("Failed to export suppliers");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportSuppliers = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e: any) => {
      setIsImporting(true);
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        try {
          const csvText = event.target.result;
          const lines = csvText.split('\n');
          const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
          
          const data = lines.slice(1)
            .filter((line: string) => line.trim())
            .map((line: string) => {
              const values = line.split(',').map((v: string) => v.trim().replace(/"/g, ''));
              return {
                companyName: values[0] || '',
                contactPerson: values[1] || undefined,
                email: values[2] || undefined,
                phone: values[3] || undefined,
                altPhone: values[4] || undefined,
                address: values[5] || undefined,
                city: values[6] || undefined,
                postalCode: values[7] || undefined,
                taxIdPin: values[8] || undefined,
                website: values[9] || undefined,
                paymentTerms: values[10] || undefined,
                qualificationStatus: values[11] || 'pending',
                notes: values[16] || undefined,
              };
            });

          importMutation.mutate({
            data,
            skipDuplicates: true,
          });
        } catch (error) {
          toast.error("Failed to parse CSV file");
          setIsImporting(false);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      pre_qualified: { color: "bg-blue-100 text-blue-800", label: "Pre-qualified" },
      qualified: { color: "bg-green-100 text-green-800", label: "Qualified" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
      inactive: { color: "bg-gray-100 text-gray-800", label: "Inactive" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return "text-green-600";
    if (rating >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <ModuleLayout
      title="Suppliers"
      description="Manage supplier information, ratings, and audit records"
      icon={<Truck className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Procurement", href: "/procurement" },
        { label: "Suppliers" },
      ]}
      actions={<></>}
    >
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard label="Total Suppliers" value={suppliers.length} icon={<Truck className="h-5 w-5" />} color="border-l-blue-500" />
          <StatsCard label="Qualified" value={suppliers.filter((s: any) => s.qualificationStatus === "qualified").length} icon={<Star className="h-5 w-5" />} color="border-l-green-500" />
          <StatsCard label="Pending" value={suppliers.filter((s: any) => s.qualificationStatus === "pending").length} icon={<Loader2 className="h-5 w-5" />} color="border-l-yellow-500" />
          <StatsCard label="Rejected" value={suppliers.filter((s: any) => s.qualificationStatus === "rejected").length} icon={<Trash2 className="h-5 w-5" />} color="border-l-red-500" />
        </div>

        {/* Toolbar */}
        <ListPageToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by company name, email, or phone..."
          onCreateClick={() => setIsCreateOpen(true)}
          createLabel="New Supplier"
          onExportClick={handleExportSuppliers}
          onImportClick={handleImportSuppliers}
          onPrintClick={() => window.print()}
          filterContent={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="pre_qualified">Pre-qualified</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        {/* Bulk Actions */}
        <EnhancedBulkActions
          selectedCount={selectedSuppliers.size}
          onClear={() => setSelectedSuppliers(new Set())}
          actions={[
            bulkExportAction(selectedSuppliers, suppliers, supplierColumns, "suppliers"),
            bulkCopyIdsAction(selectedSuppliers),
            bulkEmailAction(navigate),
            bulkDeleteAction(selectedSuppliers, (ids) => { ids.forEach((id) => deleteMutation.mutate(id)); setSelectedSuppliers(new Set()); }),
          ]}
        />
        {/* Create Supplier Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setFormStep(1); }}>
          <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Supplier - Step {formStep} of 3</DialogTitle>
                  <DialogDescription>
                    {formStep === 1 && "Enter basic company information"}
                    {formStep === 2 && "Add contact details with country codes"}
                    {formStep === 3 && "Complete address and tax information"}
                  </DialogDescription>
                </DialogHeader>

                {/* Step 1: Basic Info */}
                {formStep === 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="e.g., ABC Supplies Ltd"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        placeholder="e.g., John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="supplier@example.com"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Contact */}
                {formStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <div className="flex gap-2">
                        <Select value={formData.phoneCountryCode} onValueChange={(val) => setFormData({...formData, phoneCountryCode: val})}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+254">🇰🇪 Kenya +254</SelectItem>
                            <SelectItem value="+256">🇺🇬 Uganda +256</SelectItem>
                            <SelectItem value="+255">🇹🇿 Tanzania +255</SelectItem>
                            <SelectItem value="+44">🇬🇧 UK +44</SelectItem>
                            <SelectItem value="+1">🇺🇸 USA +1</SelectItem>
                            <SelectItem value="+27">🇿🇦 S. Africa +27</SelectItem>
                            <SelectItem value="+234">🇳🇬 Nigeria +234</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="712 345 678"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Alternate Phone (Optional)</Label>
                      <div className="flex gap-2">
                        <Select value={formData.alternatePhoneCountryCode} onValueChange={(val) => setFormData({...formData, alternatePhoneCountryCode: val})}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+254">🇰🇪 Kenya +254</SelectItem>
                            <SelectItem value="+256">🇺🇬 Uganda +256</SelectItem>
                            <SelectItem value="+255">🇹🇿 Tanzania +255</SelectItem>
                            <SelectItem value="+44">🇬🇧 UK +44</SelectItem>
                            <SelectItem value="+1">🇺🇸 USA +1</SelectItem>
                            <SelectItem value="+27">🇿🇦 S. Africa +27</SelectItem>
                            <SelectItem value="+234">🇳🇬 Nigeria +234</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          name="alternatePhone"
                          value={formData.alternatePhone}
                          onChange={handleInputChange}
                          placeholder="712 345 679"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Address & Tax */}
                {formStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street address"
                      />
                      <div className="space-y-2">
                        <Label htmlFor="taxId">Tax ID / PIN *</Label>
                        <Input
                          id="taxId"
                          name="taxId"
                          value={formData.taxId}
                          onChange={handleInputChange}
                          placeholder="A001234567N"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="00100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Multistep Buttons */}
                <div className="flex justify-between gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => formStep === 1 ? setIsCreateOpen(false) : setFormStep(formStep - 1)}
                  >
                    {formStep === 1 ? "Cancel" : "Back"}
                  </Button>
                  <div className="flex gap-2">
                    {formStep < 3 && (
                      <Button 
                        onClick={() => setFormStep(formStep + 1)}
                        disabled={formStep === 1 && !formData.companyName}
                      >
                        Next
                      </Button>
                    )}
                    {formStep === 3 && (
                      <Button 
                        onClick={handleCreateSupplier} 
                        disabled={createMutation.isPending || !formData.companyName || !formData.taxId}
                      >
                        {createMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Supplier"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

        {/* Suppliers List */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-sm text-muted-foreground">{suppliers.length} suppliers</span>
              <TableColumnSettings columns={supplierColumns} visibleColumns={visibleColumns} onToggleColumn={toggleColumn} onReset={reset} pageSize={pageSize} onPageSizeChange={updatePageSize} />
            </div>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No suppliers found. Click "+" to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"><Checkbox checked={selectedSuppliers.size === suppliers.length && suppliers.length > 0} onCheckedChange={() => { if (selectedSuppliers.size === suppliers.length) setSelectedSuppliers(new Set()); else setSelectedSuppliers(new Set(suppliers.map((s: any) => s.id))); }} /></TableHead>
                      {isVisible("companyName") && <TableHead>Company Name</TableHead>}
                      {isVisible("contact") && <TableHead className="hidden md:table-cell">Contact</TableHead>}
                      {isVisible("phone") && <TableHead>Phone</TableHead>}
                      {isVisible("email") && <TableHead className="hidden lg:table-cell">Email</TableHead>}
                      {isVisible("rating") && <TableHead className="hidden lg:table-cell">Rating</TableHead>}
                      {isVisible("status") && <TableHead>Status</TableHead>}
                      {isVisible("city") && <TableHead className="hidden md:table-cell">City</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier: any) => (
                      <TableRow key={supplier.id} className={selectedSuppliers.has(supplier.id) ? "bg-primary/5" : ""}>
                        <TableCell><Checkbox checked={selectedSuppliers.has(supplier.id)} onCheckedChange={() => { const next = new Set(selectedSuppliers); if (next.has(supplier.id)) next.delete(supplier.id); else next.add(supplier.id); setSelectedSuppliers(next); }} /></TableCell>
                        {isVisible("companyName") && <TableCell className="font-medium"><TableItemLink href={`/suppliers/${supplier.id}`}>{supplier.companyName}</TableItemLink></TableCell>}
                        {isVisible("contact") && <TableCell className="hidden md:table-cell">{supplier.contactPerson || "-"}</TableCell>}
                        {isVisible("phone") && <TableCell>{supplier.phone || "-"}</TableCell>}
                        {isVisible("email") && <TableCell className="hidden lg:table-cell text-sm truncate max-w-[180px]">{supplier.email || "-"}</TableCell>}
                        {isVisible("rating") && <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Star className={`h-4 w-4 ${getRatingColor(supplier.averageRating)}`} />
                            <span className={`font-semibold ${getRatingColor(supplier.averageRating)}`}>
                              {supplier.averageRating || 0}
                            </span>
                          </div>
                        </TableCell>}
                        {isVisible("status") && <TableCell>{getStatusBadge(supplier.qualificationStatus)}</TableCell>}
                        {isVisible("city") && <TableCell className="hidden md:table-cell">{supplier.city || "-"}</TableCell>}
                        <TableCell className="text-right">
                          <RowActionsMenu
                            primaryActions={[
                              { label: "View", icon: actionIcons.view, onClick: () => navigate(`/suppliers/${supplier.id}`) },
                              { label: "Edit", icon: actionIcons.edit, onClick: () => navigate(`/suppliers/${supplier.id}/edit`) },
                              { label: "Delete", icon: actionIcons.delete, onClick: () => { if (confirm("Delete this supplier?")) deleteMutation.mutate(supplier.id); }, variant: "destructive" },
                            ]}
                            menuActions={[
                              { label: "Send Email", icon: <Mail className="h-4 w-4" />, onClick: () => navigate(buildCommunicationComposePath(location, supplier.email)) },
                              { label: "Duplicate", icon: <Copy className="h-4 w-4" />, onClick: () => navigate(`/suppliers/create?clone=${supplier.id}`), separator: true },
                              { label: "Download Profile", icon: actionIcons.download, onClick: () => { navigate(`/suppliers/${supplier.id}`); setTimeout(() => window.print(), 500); } },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
