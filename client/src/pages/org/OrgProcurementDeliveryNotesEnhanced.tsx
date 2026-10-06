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
import { Plus, Edit2, Trash2, Loader2, Search } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  in_transit: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  partially_delivered: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  returned: "bg-orange-100 text-orange-800",
};

const CONDITION_COLORS: Record<string, string> = {
  good: "bg-green-100 text-green-800",
  damaged: "bg-red-100 text-red-800",
  partial: "bg-yellow-100 text-yellow-800",
  incomplete: "bg-orange-100 text-orange-800",
};

export default function ProcurementDeliveryNotesEnhancedPage() {
  const { allowed, isLoading: checkingAccess } = useRequireFeature("procurement:lpo:view");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    deliveryNoteNumber: "",
    lpoId: "",
    supplierId: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    driverId: "",
    vehicleNumber: "",
    condition: "good",
    receivedBy: "",
    notes: "",
    lineItems: [{ productId: "", description: "", expectedQuantity: 1, receivedQuantity: 1, unit: "pcs", batchNumber: "", expiryDate: "" }],
  });

  // Fetch data
  const { data: deliveryNotes = [], isLoading: isLoadingNotes, refetch } = trpc.procurementDeliveryNotes.list.useQuery({
    limit: 100,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const { data: lpos = [] } = trpc.procurementLpo.list.useQuery({ limit: 100 });
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery({ limit: 100 });

  // Mutations
  const createMutation = trpc.procurementDeliveryNotes.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateOpen(false);
      setFormData({
        deliveryNoteNumber: "",
        lpoId: "",
        supplierId: "",
        deliveryDate: new Date().toISOString().split("T")[0],
        driverId: "",
        vehicleNumber: "",
        condition: "good",
        receivedBy: "",
        notes: "",
        lineItems: [{ productId: "", description: "", expectedQuantity: 1, receivedQuantity: 1, unit: "pcs", batchNumber: "", expiryDate: "" }],
      });
      toast.success("Delivery note created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create delivery note");
    },
  });

  const deleteMutation = trpc.procurementDeliveryNotes.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Delivery note deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete delivery note");
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
      if (!formData.deliveryDate) {
        toast.error("Delivery date is required");
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
        if (item.expectedQuantity <= 0) {
          toast.error("Expected quantity must be > 0");
          return;
        }
      }

      await createMutation.mutateAsync({
        lpoId: formData.lpoId,
        supplierId: formData.supplierId,
        deliveryDate: formData.deliveryDate,
        driverId: formData.driverId || undefined,
        vehicleNumber: formData.vehicleNumber || undefined,
        receivedBy: formData.receivedBy || undefined,
        condition: formData.condition as any,
        notes: formData.notes || undefined,
        lineItems: formData.lineItems.map(item => ({
          productId: item.productId,
          description: item.description,
          expectedQuantity: item.expectedQuantity,
          receivedQuantity: item.receivedQuantity,
          damagedQuantity: 0,
          unit: item.unit,
          batchNumber: item.batchNumber || undefined,
          expiryDate: item.expiryDate || undefined,
        })),
      });
    } catch (error) {
      console.error("Error submitting delivery note:", error);
    }
  };

  const handleAddLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { productId: "", description: "", expectedQuantity: 1, receivedQuantity: 1, unit: "pcs", batchNumber: "", expiryDate: "" }],
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

  const filteredNotes = deliveryNotes.filter(dn =>
    (dn as any).deliveryNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalNotes = deliveryNotes.length;
  const deliveredCount = deliveryNotes.filter(dn => dn.deliveryStatus === "delivered").length;
  const inTransitCount = deliveryNotes.filter(dn => dn.deliveryStatus === "in_transit").length;
  const problemCount = deliveryNotes.filter(dn => ["failed", "returned", "partially_delivered"].includes(dn.deliveryStatus)).length;

  return (
    <ModuleLayout
      title="Procurement - Delivery Notes"
      breadcrumbs={[
        { label: "Procurement", href: "/procurement" },
        { label: "Delivery Notes", href: "/procurement-delivery-notes-enhanced" },
      ]}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Total Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalNotes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{deliveredCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>In Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inTransitCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{problemCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 flex-1">
                <div className="flex-1 max-w-md">
                  <Label htmlFor="search">Search Delivery Notes</Label>
                  <Input
                    id="search"
                    placeholder="Search by delivery note number..."
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
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="partially_delivered">Partially Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-8">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Delivery Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Delivery Note</DialogTitle>
                    <DialogDescription>Record incoming deliveries from suppliers</DialogDescription>
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
                      <Select value={formData.supplierId} onValueChange={(val) => setFormData({ ...formData, supplierId: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>{s.supplierCode || s.id} - {s.supplierName || ""}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Delivery Date *</Label>
                      <Input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Driver ID</Label>
                      <Input
                        value={formData.driverId}
                        onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                        placeholder="Driver ID"
                      />
                    </div>
                    <div>
                      <Label>Vehicle Number</Label>
                      <Input
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                        placeholder="Vehicle registration"
                      />
                    </div>
                    <div>
                      <Label>Received By</Label>
                      <Input
                        value={formData.receivedBy}
                        onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                        placeholder="Name of recipient"
                      />
                    </div>
                    <div>
                      <Label>Overall Condition</Label>
                      <Select value={formData.condition} onValueChange={(val) => setFormData({ ...formData, condition: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="incomplete">Incomplete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Notes</Label>
                      <Input
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes about the delivery"
                      />
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="my-4">
                    <h4 className="font-semibold mb-2">Line Items *</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {formData.lineItems.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-6 gap-2 items-end border-b pb-2">
                          <div>
                            <Label className="text-xs">Product ID</Label>
                            <Input
                              placeholder="Product"
                              value={item.productId}
                              onChange={(e) => handleLineItemChange(idx, "productId", e.target.value)}
                              size={15}
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
                            <Label className="text-xs">Expected</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.expectedQuantity}
                              onChange={(e) => handleLineItemChange(idx, "expectedQuantity", parseFloat(e.target.value))}
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
                            <Label className="text-xs">Batch #</Label>
                            <Input
                              placeholder="Batch"
                              value={item.batchNumber}
                              onChange={(e) => handleLineItemChange(idx, "batchNumber", e.target.value)}
                            />
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
                      Create Delivery Note
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* Delivery Notes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Notes</CardTitle>
            <CardDescription>Track incoming shipments and deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingNotes ? (
              <div className="flex justify-center py-8">
                <Spinner className="size-8" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery Note #</TableHead>
                    <TableHead>LPO</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No delivery notes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotes.map((dn: any) => (
                      <TableRow key={dn.id}>
                        <TableCell className="font-mono font-semibold">{dn.deliveryNoteNumber}</TableCell>
                        <TableCell>{dn.lpoId ? lpos.find((l: any) => l.id === dn.lpoId)?.lpoNumber : "-"}</TableCell>
                        <TableCell>{dn.deliveryDate ? new Date(dn.deliveryDate).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[dn.deliveryStatus] || "bg-gray-100 text-gray-800"}>
                            {dn.deliveryStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={CONDITION_COLORS[dn.condition] || "bg-gray-100 text-gray-800"}>
                            {dn.condition}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{dn.totalItems || 0}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMutation.mutate(dn.id)}
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

