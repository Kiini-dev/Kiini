import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FileText, ArrowLeft, Save, Building2, DollarSign, ClipboardList, Loader2, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

interface LPOItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function CreateLPO() {
  const [, setLocation] = useLocation();
  const [vendorId, setVendorId] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<LPOItem[]>([{ id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 }]);

  const { data: suppliers = [] } = trpc.suppliers.list.useQuery({ limit: 100 });

  const createMutation = trpc.lpo.create.useMutation({
    onSuccess: () => {
      toast.success("LPO created successfully");
      setLocation("/lpos");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) { toast.error("Please select a vendor/supplier"); return; }
    if (items.some((item) => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
      toast.error("Complete every line item before saving");
      return;
    }
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    if (total <= 0) { toast.error("Line item total must be greater than 0"); return; }
    createMutation.mutate({
      supplierId: vendorId,
      issueDate: new Date().toISOString(),
      expectedDeliveryDate: undefined,
      description: description || undefined,
      lineItems: items.map(({ description: itemDescription, quantity, unitPrice }) => ({ description: itemDescription, quantity, unitPrice, unit: "pcs", taxRate: 0 })),
    });
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const updateItem = (index: number, field: keyof Omit<LPOItem, "id">, value: string | number) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  return (
    <ModuleLayout
      title="Create Local Purchase Order"
      description="Create a new LPO for procurement"
      icon={<FileText className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Procurement", href: "/procurement" },
        { label: "LPOs", href: "/lpos" },
        { label: "Create LPO" },
      ]}
    >
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6 p-4 sm:p-6">
        {/* Vendor / Supplier */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Vendor / Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:w-1/2">
              <Label>Select Supplier *</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger><SelectValue placeholder="Choose a supplier..." /></SelectTrigger>
                <SelectContent>
                  {(Array.isArray(suppliers) ? suppliers : (suppliers as any)?.data ?? []).map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name || s.companyName || s.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Line Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => setItems((current) => [...current, { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 }])}>
                <Plus className="mr-1 h-4 w-4" /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[1fr_100px_140px_32px] gap-2 items-end">
                <div className="space-y-1"><Label>Description</Label><Input value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} placeholder="Item or service" /></div>
                <div className="space-y-1"><Label>Qty</Label><Input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, "quantity", Number(event.target.value) || 0)} /></div>
                <div className="space-y-1"><Label>Unit Price</Label><Input type="number" min="0" step="0.01" value={item.unitPrice || ""} onChange={(event) => updateItem(index, "unitPrice", Number(event.target.value) || 0)} /></div>
                <Button type="button" variant="ghost" size="icon" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <div className="text-right text-lg font-semibold">Total: KES {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Purchase Description</Label>
              <RichTextEditor value={description} onChange={setDescription} placeholder="Describe what is being purchased, quantities, specifications..." minHeight="140px" />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => setLocation("/lpos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || !vendorId || total <= 0}>
            {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {createMutation.isPending ? "Creating..." : "Create LPO"}
          </Button>
        </div>
      </form>
    </ModuleLayout>
  );
}
