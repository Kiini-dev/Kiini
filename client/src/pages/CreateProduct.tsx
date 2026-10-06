import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Package, ArrowLeft } from "lucide-react";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { ProductForm, ProductFormData, ProductFormErrors } from "@/components/ProductForm";

export default function CreateProduct() {
  const { allowed, isLoading } = useRequireFeature("products:create");
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    description: "",
    sku: "",
    category: "",
    unit: "pcs",
    unitPrice: "",
    costPrice: "",
    taxRate: "",
    quantity: "",
    minStockLevel: "",
    maxStockLevel: "",
    reorderLevel: "",
    reorderQuantity: "",
    supplier: "",
    location: "",
    imageUrl: "",
    status: "active",
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});

  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully!");
      utils.products.list.invalidate();
      navigate("/products");
    },
    onError: (error: any) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  if (isLoading) return (<div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>);
  if (!allowed) return null;

  const validateForm = (): boolean => {
    const newErrors: ProductFormErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }

    if (!formData.unitPrice) {
      newErrors.unitPrice = "Unit price is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createProductMutation.mutate({
      productName: formData.productName,
      description: formData.description || undefined,
      sku: formData.sku || undefined,
      category: formData.category || undefined,
      unit: formData.unit || undefined,
      unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : 0,
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
      taxRate: formData.taxRate ? parseFloat(formData.taxRate) : undefined,
      quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
      minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel) : undefined,
      maxStockLevel: formData.maxStockLevel ? parseInt(formData.maxStockLevel) : undefined,
      reorderLevel: formData.reorderLevel ? parseInt(formData.reorderLevel) : undefined,
      reorderQuantity: formData.reorderQuantity ? parseInt(formData.reorderQuantity) : undefined,
      supplier: formData.supplier || undefined,
      location: formData.location || undefined,
      imageUrl: formData.imageUrl || undefined,
      status: formData.status as "active" | "inactive",
    });
  };

  return (
    <ModuleLayout
      title="Create Product"
      description="Add a new product to your inventory"
      icon={<Package className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Products", href: "/products" },
        { label: "Create Product" },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onCancel={() => navigate("/products")}
          isSubmitting={createProductMutation.isPending}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/products")}
            disabled={createProductMutation.isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={createProductMutation.isPending}>
            {createProductMutation.isPending ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </ModuleLayout>
  );
}