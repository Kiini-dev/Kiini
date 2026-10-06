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
import { Plus, Download, Edit2, Trash2, Loader2, ShoppingCart, Search } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  approved: "bg-green-100 text-green-800",
  sent: "bg-blue-100 text-blue-800",
  partially_received: "bg-yellow-100 text-yellow-800",
  received: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  closed: "bg-gray-100 text-gray-800",
};

export default function ProcurementLPOEnhancedPage() {
  const { allowed, isLoading: checkingAccess } = useRequireFeature("procurement:lpo:view");

  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    lpoNumber: "",
    supplierId: "",
    departmentId: "",
    issueDate: new Date().toISOString().split("T")[0],
    expectedDeliveryDate: "",
    description: "",
    lineItems: [{ productId: "", description: "", quantity: 1, unit: "pcs", unitPrice: 0, taxRate: 0 }],
  });

  // Fetch data
  const { data: lpos = [], isLoading: isLoadingLpos, refetch } = trpc.procurementLpo.list.useQuery({
    limit: 100,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const { data: suppliers = [] } = trpc.suppliers.list.useQuery({ limit: 100 });
  const { data: products = [] } = trpc.products.list.useQuery({ limit: 100 });

  // Mutations
  const createMutation = trpc.procurementLpo.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateOpen(false);
      setFormData({
        lpoNumber: "",
        supplierId: "",
        departmentId: "",
        issueDate: new Date().toISOString().split("T")[0],
        expectedDeliveryDate: "",
        description: "",
        lineItems: [{ productId: "", description: "", quantity: 1, unit: "pcs", unitPrice: 0, taxRate: 0 }],
      });
      toast.success("LPO created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create LPO");
    },
  });

  const deleteMutation = trpc.procurementLpo.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("LPO deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete LPO");
    },
  });

  if (checkingAccess) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const handleSubmit = async () => {
    try {
      if (!formData.supplierId) {
        toast.error("Supplier is required");
        return;
      }
      if (!formData.issueDate) {
        toast.error("Issue date is required");
        return;
      }
      if (!formData.expectedDeliveryDate) {
        toast.error("Expected delivery date is required");
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
        if (item.quantity <= 0) {
          toast.error("All line items must have quantity > 0");
          return;
        }
        if (item.unitPrice < 0) {
          toast.error("Unit price cannot be negative");
          return;
        }
      }

      await createMutation.mutateAsync({
        supplierId: formData.supplierId,
        departmentId: formData.departmentId || undefined,
        issueDate: formData.issueDate,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        description: formData.description || undefined,
        lineItems: formData.lineItems.map(item => ({
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
        })),
      });
    } catch (error) {
      console.error("Error submitting LPO:", error);
    }
  };

  const handleAddLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { productId: "", description: "", quantity: 1, unit: "pcs", unitPrice: 0, taxRate: 0 }],
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

  const filteredLPOs = lpos.filter(lpo =>
    lpo.lpoNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lpo as any).description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLPOs = lpos.length;
  const approvedCount = lpos.filter(l => l.status === "approved").length;
  const sentCount = lpos.filter(l => l.status === "sent").length;
  const receivedCount = lpos.filter(l => l.status === "received").length;

  return (
    <ModuleLayout
      title="Procurement - Local Purchase Orders"
      breadcrumbs={[
        { label: "Procurement", href: "/procurement" },
        { label: "LPOs", href: "/procurement-lpo-enhanced" },
      ]}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Total LPOs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLPOs}</div>
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
              <CardTitle>Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{sentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{receivedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 flex-1">
                <div className="flex-1 max-w-md">
                  <Label htmlFor="search">Search LPOs</Label>
                  <Input
                    id="search"
                    placeholder="Search by LPO number or description..."
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
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-8">
                    <Plus className="mr-2 h-4 w-4" />
                    Create LPO
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Local Purchase Order</DialogTitle>
                    <DialogDescription>Fill in the details for a new LPO</DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4 my-4">
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
                      <Label>Department</Label>
                      <Select value={formData.departmentId} onValueChange={(val) => setFormData({ ...formData, departmentId: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dept1">Finance</SelectItem>
                          <SelectItem value="dept2">Operations</SelectItem>
                          <SelectItem value="dept3">HR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Issue Date *</Label>
                      <Input
                        type="date"
                        value={formData.issueDate}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Expected Delivery Date *</Label>
                      <Input
                        type="date"
                        value={formData.expectedDeliveryDate}
                        onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter LPO description"
                      />
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="my-4">
                    <h4 className="font-semibold mb-2">Line Items *</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {formData.lineItems.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-2 items-end border-b pb-2">
                          <div>
                            <Label className="text-xs">Product</Label>
                            <Input
                              placeholder="Product ID (optional)"
                              value={item.productId}
                              onChange={(e) => handleLineItemChange(idx, "productId", e.target.value)}
                              size={30}
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
                            <Label className="text-xs">Qty *</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.quantity}
                              onChange={(e) => handleLineItemChange(idx, "quantity", parseFloat(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Unit Price</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={item.unitPrice}
                              onChange={(e) => handleLineItemChange(idx, "unitPrice", parseFloat(e.target.value))}
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
                      Create LPO
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* LPOs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your LPOs</CardTitle>
            <CardDescription>Manage and track local purchase orders</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLpos ? (
              <div className="flex justify-center py-8">
                <Spinner className="size-8" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LPO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLPOs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No LPOs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLPOs.map((lpo: any) => (
                      <TableRow key={lpo.id}>
                        <TableCell className="font-mono font-semibold">{lpo.lpoNumber}</TableCell>
                        <TableCell>{suppliers.find((s: any) => s.id === lpo.supplierId)?.supplierCode || lpo.supplierId}</TableCell>
                        <TableCell>{lpo.issueDate ? new Date(lpo.issueDate).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{lpo.expectedDeliveryDate ? new Date(lpo.expectedDeliveryDate).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[lpo.status] || "bg-gray-100 text-gray-800"}>
                            {lpo.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {lpo.netAmount ? `KES ${lpo.netAmount.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMutation.mutate(lpo.id)}
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

