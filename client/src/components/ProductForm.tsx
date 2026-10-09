import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Package, ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { parseSettingsOptionList } from "@/lib/settingsOptions";

export interface ProductFormData {
  productName: string;
  description: string;
  sku: string;
  category: string;
  unit: string;
  unitPrice: string;
  costPrice: string;
  taxRate: string;
  quantity: string;
  minStockLevel: string;
  maxStockLevel: string;
  reorderLevel: string;
  reorderQuantity: string;
  supplier: string;
  location: string;
  imageUrl: string;
  status: string;
}

export interface ProductFormErrors {
  [key: string]: string;
}

interface ProductFormProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  errors?: ProductFormErrors;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const UNIT_OPTIONS = [
  { value: "pcs", label: "Pieces" },
  { value: "unit", label: "Unit" },
  { value: "kg", label: "Kilogram" },
  { value: "g", label: "Gram" },
  { value: "l", label: "Liter" },
  { value: "m", label: "Meter" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
  { value: "roll", label: "Roll" },
  { value: "set", label: "Set" },
  { value: "pair", label: "Pair" },
];

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function ProductForm({
  formData,
  setFormData,
  errors = {},
  onCancel,
  isSubmitting = false,
}: ProductFormProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { data: categories = [] } = trpc.products.getCategories.useQuery({});
  const { data: categorySettings } = trpc.settings.getByCategory.useQuery({ category: "products_categories" }, { staleTime: 60_000 });
  const { data: unitSettings } = trpc.settings.getByCategory.useQuery({ category: "product_units" }, { staleTime: 60_000 });
  const { data: supplierData = [] } = trpc.suppliers.list.useQuery({ limit: 100, isActive: true });
  const { data: warehouseData = [] } = trpc.warehouses.list.useQuery();
  const suppliers = (Array.isArray(supplierData) ? supplierData : (supplierData as any)?.data ?? []) as any[];
  const warehouses = (Array.isArray(warehouseData) ? warehouseData : []) as any[];
  const activeWarehouses = warehouses.filter((warehouse) => !warehouse.status || warehouse.status === "active");
  const matchingSupplier = suppliers.find((supplier) => supplier.companyName === formData.supplier);
  const matchingWarehouse = activeWarehouses.find((warehouse) => warehouse.name === formData.location);
  const uploadImageMutation = trpc.products.uploadImage.useMutation({
    onSuccess: ({ url }) => {
      setFormData((current) => ({ ...current, imageUrl: url }));
      toast.success("Product image uploaded");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleInputChange = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSelectChange = (field: keyof ProductFormData) => (value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });
  };

  const handleImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        toast.error("Could not read the selected image");
        return;
      }
      uploadImageMutation.mutate({ mimeType: file.type, data: reader.result });
    };
    reader.onerror = () => toast.error("Could not read the selected image");
    reader.readAsDataURL(file);
  };

  const defaultCategories = [
    "Electronics",
    "Software",
    "Hardware",
    "Services",
    "Consulting",
    "Training",
    "Support",
    "Other",
  ];

  const configuredCategories = (() => {
    try {
      const parsed = JSON.parse(categorySettings?.list || "null");
      return Array.isArray(parsed)
        ? parsed.map((category) => typeof category === "string" ? category : category?.name).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  })();
  const displayCategories = configuredCategories.length > 0
    ? configuredCategories
    : categories.length > 0
      ? categories
      : defaultCategories;
  const configuredUnits = (() => {
    const values = parseSettingsOptionList(unitSettings?.list, []);
    return values.map((unit) => ({ value: unit, label: unit }));
  })();
  const displayUnits = configuredUnits.length > 0
    ? configuredUnits.some((unit) => unit.value === formData.unit)
      ? configuredUnits
      : [{ value: formData.unit, label: formData.unit }, ...configuredUnits]
    : UNIT_OPTIONS;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Product Name *" error={errors.productName}>
              <Input
                placeholder="Enter product name"
                value={formData.productName}
                onChange={handleInputChange("productName")}
              />
            </FormField>

            <FormField label="SKU" error={errors.sku}>
              <Input
                placeholder="e.g. PROD-001"
                value={formData.sku}
                onChange={handleInputChange("sku")}
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Category" error={errors.category}>
              <Select
                value={formData.category}
                onValueChange={handleSelectChange("category")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {displayCategories.map((cat: string) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Unit" error={errors.unit}>
              <Select
                value={formData.unit}
                onValueChange={handleSelectChange("unit")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {displayUnits.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Description" error={errors.description}>
            <RichTextEditor
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Describe the product — features, specifications, usage..."
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Pricing Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FormField label="Unit Price (Ksh) *" error={errors.unitPrice}>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.unitPrice}
                onChange={handleInputChange("unitPrice")}
                step="0.01"
                min="0"
              />
            </FormField>

            <FormField label="Cost Price (Ksh)" error={errors.costPrice}>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.costPrice}
                onChange={handleInputChange("costPrice")}
                step="0.01"
                min="0"
              />
            </FormField>

            <FormField label="Tax Rate (%)" error={errors.taxRate}>
              <Input
                type="number"
                placeholder="e.g. 16"
                value={formData.taxRate}
                onChange={handleInputChange("taxRate")}
                step="0.01"
                min="0"
                max="100"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Card */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FormField label="Current Quantity" error={errors.quantity}>
              <Input
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={handleInputChange("quantity")}
                min="0"
              />
            </FormField>

            <FormField label="Min Stock Level" error={errors.minStockLevel}>
              <Input
                type="number"
                placeholder="0"
                value={formData.minStockLevel}
                onChange={handleInputChange("minStockLevel")}
                min="0"
              />
            </FormField>

            <FormField label="Max Stock Level" error={errors.maxStockLevel}>
              <Input
                type="number"
                placeholder="0"
                value={formData.maxStockLevel}
                onChange={handleInputChange("maxStockLevel")}
                min="0"
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            <FormField label="Reorder Level" error={errors.reorderLevel}>
              <Input
                type="number"
                placeholder="0"
                value={formData.reorderLevel}
                onChange={handleInputChange("reorderLevel")}
                min="0"
              />
            </FormField>

            <FormField label="Reorder Quantity" error={errors.reorderQuantity}>
              <Input
                type="number"
                placeholder="0"
                value={formData.reorderQuantity}
                onChange={handleInputChange("reorderQuantity")}
                min="0"
              />
            </FormField>

            <FormField label="Status" error={errors.status}>
              <Select
                value={formData.status}
                onValueChange={handleSelectChange("status")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Supplier & Location Card */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier & Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Supplier" error={errors.supplier}>
              <Select
                value={matchingSupplier?.id || (formData.supplier ? "__current_supplier__" : "__none__")}
                onValueChange={(value) => {
                  if (value === "__current_supplier__") return;
                  const supplier = suppliers.find((item) => item.id === value);
                  setFormData((current) => ({ ...current, supplier: supplier?.companyName || "" }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No supplier</SelectItem>
                  {formData.supplier && !matchingSupplier && <SelectItem value="__current_supplier__">{formData.supplier}</SelectItem>}
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>{supplier.companyName || supplier.name || supplier.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Storage Location" error={errors.location}>
              <Select
                value={matchingWarehouse?.id || (formData.location ? "__current_location__" : "__none__")}
                onValueChange={(value) => {
                  if (value === "__current_location__") return;
                  const warehouse = activeWarehouses.find((item) => item.id === value);
                  setFormData((current) => ({ ...current, location: warehouse?.name || "" }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No warehouse selected</SelectItem>
                  {formData.location && !matchingWarehouse && <SelectItem value="__current_location__">{formData.location}</SelectItem>}
                  {activeWarehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}{warehouse.code ? ` (${warehouse.code})` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Product Image" error={errors.imageUrl}>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" disabled={uploadImageMutation.isPending} onClick={() => imageInputRef.current?.click()}>
                {uploadImageMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                {uploadImageMutation.isPending ? "Uploading..." : "Upload image"}
              </Button>
              {formData.imageUrl && (
                <Button type="button" variant="ghost" size="icon" aria-label="Remove product image" title="Remove product image" onClick={() => setFormData((current) => ({ ...current, imageUrl: "" }))}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageFile} />
              <span className="text-xs text-muted-foreground">PNG, JPEG, WebP, or GIF; up to 5 MB</span>
            </div>
            {formData.imageUrl && <img src={formData.imageUrl} alt="Product preview" className="mt-3 h-28 w-36 rounded border object-contain" />}
            <Input
              className="mt-3"
              placeholder="Or paste an image URL"
              value={formData.imageUrl}
              onChange={handleInputChange("imageUrl")}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Form Actions */}
      {onCancel && (
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
