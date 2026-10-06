"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ProductForm_1 = require("@/components/ProductForm");
function CreateProduct() {
    var _a = permissions_1.useRequireFeature("products:create"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var utils = trpc_1.trpc.useUtils();
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
    var createProductMutation = trpc_1.trpc.products.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Product created successfully!");
            utils.products.list.invalidate();
            navigate("/products");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create product: " + error.message);
        }
    });
    if (isLoading)
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
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
            status: formData.status
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Product", description: "Add a new product to your inventory", icon: React.createElement(lucide_react_1.Package, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Products", href: "/products" },
            { label: "Create Product" },
        ] },
        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6 max-w-5xl" },
            React.createElement(ProductForm_1.ProductForm, { formData: formData, setFormData: setFormData, errors: errors, onCancel: function () { return navigate("/products"); }, isSubmitting: createProductMutation.isPending }),
            React.createElement("div", { className: "flex gap-4" },
                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/products"); }, disabled: createProductMutation.isPending },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                    " Cancel"),
                React.createElement(button_1.Button, { type: "submit", disabled: createProductMutation.isPending }, createProductMutation.isPending ? "Creating..." : "Create Product")))));
}
exports["default"] = CreateProduct;
