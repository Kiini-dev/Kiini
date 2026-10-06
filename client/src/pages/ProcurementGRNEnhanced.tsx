import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { ModuleLayout } from "@/components/ModuleLayout";
import { trpc } from "@/lib/trpc";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { buildSupplierPayload } from "@/lib/procurement-form-utils";
import { Plus, Edit2, Trash2, Loader2, Search } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  received: "bg-blue-100 text-blue-800",
  inspected: "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  posted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  partial: "bg-yellow-100 text-yellow-800",
};

const QUALITY_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  partial: "bg-yellow-100 text-yellow-800",
  pending_inspection: "bg-gray-100 text-gray-800",
};

const CONDITION_COLORS: Record<string, string> = {
  good: "bg-green-100 text-green-800",
  damaged: "bg-red-100 text-red-800",
  expired: "bg-orange-100 text-orange-800",
  defective: "bg-pink-100 text-pink-800",
};

export default function ProcurementGRNEnhancedPage() {
  const { allowed, isLoading: checkingAccess } = useRequireFeature("procurement:lpo:view");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [qualityFilter, setQualityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    grnNumber: "",
    lpoId: "",
    deliveryNoteId: "",
    supplierId: "",
    supplierName: "",
    grnDate: new Date().toISOString().split("T")[0],
    warehouseId: "",
    receivedBy: "",
    inspectedBy: "",
    inspectionDate: "",
    qualityStatus: "pending_inspection",
    notes: "",
    lineItems: [{ productId: "", description: "", orderedQuantity: 1, receivedQuantity: 1, unit: "pcs", unitCost: 0, condition: "good" }],
  });

  // Fetch data
  const { data: grns = [], isLoading: isLoadingGRNs, refetch } = trpc.procurementGrn.list.useQuery({
    limit: 100,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    qualityStatus: qualityFilter !== "all" ? (qualityFilter as any) : undefined,
  });

  const { data: lpos = [] } = trpc.procurementLpo.list.useQuery({ limit: 100 });
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery({ limit: 100 });

  // Mutations
  const createMutation = trpc.procurementGrn.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateOpen(false);
      setFormData({
        grnNumber: "",
        lpoId: "",
        deliveryNoteId: "",
        supplierId: "",
        supplierName: "",
        grnDate: new Date().toISOString().split("T")[0],
        warehouseId: "",
        receivedBy: "",
        inspectedBy: "",
        inspectionDate: "",
        qualityStatus: "pending_inspection",
        notes: "",
        lineItems: [{ productId: "", description: "", orderedQuantity: 1, receivedQuantity: 1, unit: "pcs", unitCost: 0, condition: "good" }],
      });
      toast.success("GRN created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create GRN");
    },
  });

  const deleteMutation = trpc.procurementGrn.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("GRN deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete GRN");
    },
  });

  if (checkingAccess) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const handleSubmit = async () => {
    try {
      if (!formData.lpoId) {
        toast.error("LPO is required");
        return;
      }
      if (!formData.supplierId) {
        toast.error("Supplier is required");
        return;
      }
      if (!formData.grnDate) {
        toast.error("GRN date is required");
        return;
      }
      if (!formData.receivedBy) {
        toast.error("Received by is required");
        return;
      }
      if (!formData.warehouseId) {
        toast.error("Warehouse is required");
        return;
      }
      if (formData.lineItems.length === 0) {
        toast.error("At least one line item is required");
        return;
      }

      // Validate line items
      for (const item of formData.lineItems) {
        if (!item.description) {
          toast.error("All line items must have a description");
          return;
        }
        if (item.orderedQuantity <= 0) {
          toast.error("Ordered quantity must be > 0");
          return;
        }
      }

      const supplierPayload = buildSupplierPayload({ supplierId: formData.supplierId, supplierName: formData.supplierName });

      await createMutation.mutateAsync({
        lpoId: formData.lpoId,
        deliveryNoteId: formData.deliveryNoteId || undefined,
        supplierId: supplierPayload.supplierId,
        supplierName: supplierPayload.supplierName,
        grnDate: formData.grnDate,
        warehouseId: formData.warehouseId,
        receivedBy: formData.receivedBy,
        inspectedBy: formData.inspectedBy || undefined,
        inspectionDate: formData.inspectionDate || undefined,
        qualityStatus: formData.qualityStatus as any,
        notes: formData.notes || undefined,
        lineItems: formData.lineItems.map(item => ({
          productId: item.productId,
          description: item.description,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          unit: item.unit,
          unitCost: item.unitCost,
          condition: item.condition as any,
        })),
      });
    } catch (error) {
      console.error("Error submitting GRN:", error);
    }
  };

  const handleAddLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { productId: "", description: "", orderedQuantity: 1, receivedQuantity: 1, unit: "pcs", unitCost: 0, condition: "good" }],
    });
  };

  const handleRemoveLineItem = (index: number) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter((_, i) => i !== index),
    });
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const newLineItems = [...formData.lineItems];
    (newLineItems[index] as any)[field] = value;
    setFormData({ ...formData, lineItems: newLineItems });
  };

  const filteredGRNs = grns.filter(grn =>
    (grn as any).grnNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalGRNs = grns.length;
  const approvedCount = grns.filter(grn => grn.qualityStatus === "approved").length;
  const rejectedCount = grns.filter(grn => grn.qualityStatus === "rejected").length;
  const pendingInspection = grns.filter(grn => grn.qualityStatus === "pending_inspection").length;

  return (
    <ModuleLayout
      title="Procurement - Goods Received Notes"
      breadcrumbs={[
        { label: "Procurement", href: "/procurement" },
        { label: "GRNs", href: "/procurement-grn-enhanced" },
      ]}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Total GRNs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGRNs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Pending Inspection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{pendingInspection}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 flex-1">
                <div className="flex-1 max-w-md">
                  <Label htmlFor="search">Search GRNs</Label>
                  <Input
                    id="search"
                    placeholder="Search by GRN number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="max-w-xs">
                  <Label htmlFor="status">Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="mt-2" id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="inspected">Inspected</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="posted">Posted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="max-w-xs">
                  <Label htmlFor="quality">Quality Status</Label>
                  <Select value={qualityFilter} onValueChange={setQualityFilter}>
                    <SelectTrigger className="mt-2" id="quality">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quality Status</SelectItem>
                      <SelectItem value="approved">Approved Quality</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="pending_inspection">Pending Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-8">
                    <Plus className="mr-2 h-4 w-4" />
                    Create GRN
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Goods Received Note</DialogTitle>
                    <DialogDescription>Record and inspect received goods</DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4 my-4">
                    <div>
                      <Label>LPO *</Label>
                      <Select value={formData.lpoId} onValueChange={(val) => setFormData({ ...formData, lpoId: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select LPO" />
                        </SelectTrigger>
                        <SelectContent>
                          {lpos.map((l: any) => (
                            <SelectItem key={l.id} value={l.id}>{l.lpoNumber}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Supplier *</Label>
                      <Select
                        value={formData.supplierId || (formData.supplierName ? "__custom__" : "")}
                        onValueChange={(val) => {
                          if (val === "__custom__") {
                            setFormData({ ...formData, supplierId: "", supplierName: formData.supplierName || "" });
                            return;
                          }
                          const selectedSupplier = suppliers.find((s: any) => s.id === val);
                          setFormData({
                            ...formData,
                            supplierId: val,
                            supplierName: selectedSupplier?.supplierName || selectedSupplier?.companyName || "",
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>{s.supplierCode || s.id} - {s.supplierName || ""}</SelectItem>
                          ))}
                          <SelectItem value="__custom__">Custom supplier name</SelectItem>
                        </SelectContent>
                      </Select>
                      {!formData.supplierId && (
                        <div className="mt-2">
                          <Input
                            value={formData.supplierName}
                            onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                            placeholder="Enter custom supplier name"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>GRN Date *</Label>
                      <Input
                        type="date"
                        value={formData.grnDate}
                        onChange={(e) => setFormData({ ...formData, grnDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Warehouse *</Label>
                      <Select value={formData.warehouseId} onValueChange={(val) => setFormData({ ...formData, warehouseId: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wh1">Main Warehouse</SelectItem>
                          <SelectItem value="wh2">Secondary Warehouse</SelectItem>
                          <SelectItem value="wh3">Branch Warehouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Received By *</Label>
                      <Input
                        value={formData.receivedBy}
                        onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                        placeholder="Name of recipient"
                      />
                    </div>
                    <div>
                      <Label>Inspected By</Label>
                      <Input
                        value={formData.inspectedBy}
                        onChange={(e) => setFormData({ ...formData, inspectedBy: e.target.value })}
                        placeholder="Name of inspector"
                      />
                    </div>
                    <div>
                      <Label>Inspection Date</Label>
                      <Input
                        type="date"
                        value={formData.inspectionDate}
                        onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Quality Status</Label>
                      <Select value={formData.qualityStatus} onValueChange={(val) => setFormData({ ...formData, qualityStatus: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending_inspection">Pending Inspection</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Notes</Label>
                      <Input
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="my-4">
                    <h4 className="font-semibold mb-2">Line Items *</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {formData.lineItems.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-7 gap-2 items-end border-b pb-2">
                          <div>
                            <Label className="text-xs">Product</Label>
                            <Input
                              placeholder="Product"
                              value={item.productId}
                              onChange={(e) => handleLineItemChange(idx, "productId", e.target.value)}
                              size={12}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Description *</Label>
                            <Input
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Ordered</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.orderedQuantity}
                              onChange={(e) => handleLineItemChange(idx, "orderedQuantity", parseFloat(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Received</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.receivedQuantity}
                              onChange={(e) => handleLineItemChange(idx, "receivedQuantity", parseFloat(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Unit Cost</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.unitCost}
                              onChange={(e) => handleLineItemChange(idx, "unitCost", parseFloat(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Condition</Label>
                            <Select value={item.condition} onValueChange={(val) => handleLineItemChange(idx, "condition", val)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="defective">Defective</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveLineItem(idx)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddLineItem} className="mt-2">
                      + Add Line Item
                    </Button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                      {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create GRN
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* GRNs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Goods Received Notes</CardTitle>
            <CardDescription>Manage quality inspection and goods receipt</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingGRNs ? (
              <div className="flex justify-center py-8">
                <Spinner className="size-8" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GRN Number</TableHead>
                    <TableHead>LPO</TableHead>
                    <TableHead>GRN Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGRNs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No GRNs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGRNs.map((grn: any) => (
                      <TableRow key={grn.id}>
                        <TableCell className="font-mono font-semibold">{grn.grnNumber}</TableCell>
                        <TableCell>{grn.lpoId ? lpos.find((l: any) => l.id === grn.lpoId)?.lpoNumber : "-"}</TableCell>
                        <TableCell>{grn.grnDate ? new Date(grn.grnDate).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[grn.status] || "bg-gray-100 text-gray-800"}>
                            {grn.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={QUALITY_COLORS[grn.qualityStatus] || "bg-gray-100 text-gray-800"}>
                            {grn.qualityStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {grn.totalCost ? `KES ${grn.totalCost.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMutation.mutate(grn.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}

