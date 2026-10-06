"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ProductForm_1 = require("@/components/ProductForm");
function EditProduct() {
    var _a = permissions_1.useRequireFeature("products:edit"), allowed = _a.allowed, isLoading = _a.isLoading;
    var params = wouter_1.useParams();
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var productId = params.id;
    var _c = react_1.useState({
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
        status: "active"
    }), formData = _c[0], setFormData = _c[1];
    var _d = react_1.useState({}), errors = _d[0], setErrors = _d[1];
    // Fetch product data
    var _e = trpc_1.trpc.products.getById.useQuery(productId || "", {
        enabled: !!productId
    }), product = _e.data, isLoadingProductData = _e.isLoading;
    // Populate form when product data loads
    react_1.useEffect(function () {
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
                status: product.isActive === 0 ? "inactive" : "active"
            });
        }
    }, [product]);
    var updateProductMutation = trpc_1.trpc.products.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Product updated successfully!");
            utils.products.list.invalidate();
            utils.products.getById.invalidate(productId || "");
            navigate("/products");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update product: " + error.message);
        }
    });
    var deleteProductMutation = trpc_1.trpc.products["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Product deleted successfully!");
            utils.products.list.invalidate();
            navigate("/products");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete product: " + error.message);
        }
    });
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed)
        return null;
    var validateForm = function () {
        var newErrors = {};
        if (!formData.productName.trim()) {
            newErrors.productName = "Product name is required";
        }
        if (!formData.unitPrice) {
            newErrors.unitPrice = "Unit price is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        if (!productId) {
            sonner_1.toast.error("Product ID is missing");
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
            status: formData.status
        });
    };
    var handleDelete = function () {
        deleteProductMutation.mutate(productId || "");
    };
    if (isLoadingProductData) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Product", description: "Loading product details...", icon: React.createElement(lucide_react_1.Package, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Products", href: "/products" },
                { label: "Edit Product" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center h-96" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Product", description: "Update product details", icon: React.createElement(lucide_react_1.Package, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Products", href: "/products" },
            { label: "Edit Product" },
        ] },
        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6 max-w-5xl" },
            React.createElement(ProductForm_1.ProductForm, { formData: formData, setFormData: setFormData, errors: errors, onCancel: function () { return navigate("/products"); }, isSubmitting: updateProductMutation.isPending }),
            React.createElement("div", { className: "flex gap-4 justify-between" },
                React.createElement(alert_dialog_1.AlertDialog, null,
                    React.createElement(alert_dialog_1.AlertDialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, { variant: "destructive", disabled: deleteProductMutation.isPending },
                            deleteProductMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" })),
                            "Delete Product")),
                    React.createElement(alert_dialog_1.AlertDialogContent, null,
                        React.createElement(alert_dialog_1.AlertDialogHeader, null,
                            React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Product?"),
                            React.createElement(alert_dialog_1.AlertDialogDescription, null, "This action cannot be undone. The product will be permanently deleted from the system.")),
                        React.createElement("div", { className: "flex gap-4 justify-end" },
                            React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                            React.createElement(alert_dialog_1.AlertDialogAction, { onClick: handleDelete, className: "bg-red-600 hover:bg-red-700", disabled: deleteProductMutation.isPending }, deleteProductMutation.isPending ? "Deleting..." : "Delete")))),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/products"); }, disabled: updateProductMutation.isPending },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                        "Cancel"),
                    React.createElement(button_1.Button, { type: "submit", disabled: updateProductMutation.isPending }, updateProductMutation.isPending ? "Updating..." : "Update Product"))))));
}
exports["default"] = EditProduct;
