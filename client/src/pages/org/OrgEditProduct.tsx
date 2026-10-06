import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Package, ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { ProductForm, ProductFormData, ProductFormErrors } from "@/components/ProductForm";

export default function EditProduct() {
  const { allowed, isLoading } = useRequireFeature("products:edit");
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const productId = params.id;

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

  // Fetch product data
  const { data: product, isLoading: isLoadingProductData } = trpc.products.getById.useQuery(
    productId || "",
    {
      enabled: !!productId,
    }
  );

  // Populate form when product data loads
  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        category: product.category || "",
        unit: product.unit || "pcs",
        unitPrice: product.unitPrice ? (product.unitPrice / 100).toString() : "",
        costPrice: product.costPrice ? (product.costPrice / 100).toString() : "",
        taxRate: product.taxRate ? (product.taxRate / 100).toString() : "",
        quantity: product.stockQuantity ? product.stockQuantity.toString() : "",
        minStockLevel: product.minStockLevel ? product.minStockLevel.toString() : "",
        maxStockLevel: product.maxStockLevel ? product.maxStockLevel.toString() : "",
        reorderLevel: product.reorderLevel ? product.reorderLevel.toString() : "",
        reorderQuantity: product.reorderQuantity ? product.reorderQuantity.toString() : "",
        supplier: product.supplier || "",
        location: product.location || "",
        imageUrl: product.imageUrl || "",
        status: product.isActive === 0 ? "inactive" : "active",
      });
    }
  }, [product]);

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully!");
      utils.products.list.invalidate();
      utils.products.getById.invalidate(productId || "");
      navigate("/products");
    },
    onError: (error: any) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      utils.products.list.invalidate();
      navigate("/products");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

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

    if (!productId) {
      toast.error("Product ID is missing");
      return;
    }

    updateProductMutation.mutate({
      id: productId,
      productName: formData.productName,
      description: formData.description || undefined,
      sku: formData.sku || undefined,
      category: formData.category || undefined,
      unit: formData.unit || undefined,
      unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : undefined,
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
    } as any);
  };

  const handleDelete = () => {
    deleteProductMutation.mutate(productId || "");
  };

  if (isLoadingProductData) {
    return (
      <ModuleLayout
        title="Edit Product"
        description="Loading product details..."
        icon={<Package className="w-6 h-6" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/crm-home" },
          { label: "Products", href: "/products" },
          { label: "Edit Product" },
        ]}
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Edit Product"
      description="Update product details"
      icon={<Package className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Products", href: "/products" },
        { label: "Edit Product" },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onCancel={() => navigate("/products")}
          isSubmitting={updateProductMutation.isPending}
        />

        <div className="flex gap-4 justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteProductMutation.isPending}>
                {deleteProductMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Product
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The product will be permanently deleted from the
                  system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-4 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteProductMutation.isPending}
                >
                  {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/products")}
              disabled={updateProductMutation.isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </div>
      </form>
    </ModuleLayout>
  );
}

