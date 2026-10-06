"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var label_1 = require("@/components/ui/label");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var LocationSelects_1 = require("@/components/LocationSelects");
var lucide_react_1 = require("lucide-react");
var separator_1 = require("@/components/ui/separator");
var useFavorite_1 = require("@/hooks/useFavorite");
function SupplierDetailsPage() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(false), isEditing = _b[0], setIsEditing = _b[1];
    var _c = useFavorite_1.useFavorite("supplier", id || ""), isStarred = _c.isStarred, toggleStar = _c.toggleStar;
    var _d = trpc_1.trpc.suppliers.getById.useQuery(id), supplier = _d.data, isLoading = _d.isLoading, refetch = _d.refetch;
    var _e = react_1.useState({
        companyName: (supplier === null || supplier === void 0 ? void 0 : supplier.companyName) || "",
        contactPerson: (supplier === null || supplier === void 0 ? void 0 : supplier.contactPerson) || "",
        email: (supplier === null || supplier === void 0 ? void 0 : supplier.email) || "",
        phone: (supplier === null || supplier === void 0 ? void 0 : supplier.phone) || "",
        alternatePhone: (supplier === null || supplier === void 0 ? void 0 : supplier.alternatePhone) || "",
        address: (supplier === null || supplier === void 0 ? void 0 : supplier.address) || "",
        city: (supplier === null || supplier === void 0 ? void 0 : supplier.city) || "",
        postalCode: (supplier === null || supplier === void 0 ? void 0 : supplier.postalCode) || "",
        website: (supplier === null || supplier === void 0 ? void 0 : supplier.website) || "",
        paymentTerms: (supplier === null || supplier === void 0 ? void 0 : supplier.paymentTerms) || "",
        notes: (supplier === null || supplier === void 0 ? void 0 : supplier.notes) || "",
        qualityRating: (supplier === null || supplier === void 0 ? void 0 : supplier.qualityRating) || 0,
        deliveryRating: (supplier === null || supplier === void 0 ? void 0 : supplier.deliveryRating) || 0,
        priceCompetitiveness: (supplier === null || supplier === void 0 ? void 0 : supplier.priceCompetitiveness) || 0,
        qualificationStatus: (supplier === null || supplier === void 0 ? void 0 : supplier.qualificationStatus) || "pending"
    }), formData = _e[0], setFormData = _e[1];
    var updateMutation = trpc_1.trpc.suppliers.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Supplier updated successfully");
            setIsEditing(false);
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update supplier");
        }
    });
    var handleSave = function () {
        updateMutation.mutate({
            id: id,
            companyName: formData.companyName,
            contactPerson: String(formData.contactPerson),
            email: String(formData.email),
            phone: formData.phone ? String(formData.phone) : undefined,
            paymentTerms: formData.paymentTerms ? String(formData.paymentTerms) : undefined,
            notes: formData.notes ? String(formData.notes) : undefined,
            qualityRating: Number(formData.qualityRating),
            deliveryRating: Number(formData.deliveryRating),
            priceCompetitiveness: Number(formData.priceCompetitiveness),
            qualificationStatus: formData.qualificationStatus
        });
    };
    var numericFields = new Set(["qualityRating", "deliveryRating", "priceCompetitiveness"]);
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = numericFields.has(name)
                ? value === "" ? 0 : isNaN(Number(value)) ? prev[name] : Number(value)
                : value, _a)));
        });
    };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Supplier Details", icon: React.createElement(lucide_react_1.Truck, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Suppliers", href: "/suppliers" }, { label: "Details" }], backLink: { label: "Suppliers", href: "/suppliers" } },
            React.createElement("div", { className: "flex justify-center items-center h-96" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))));
    }
    if (!supplier) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Supplier Details", icon: React.createElement(lucide_react_1.Truck, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Suppliers", href: "/suppliers" }, { label: "Details" }], backLink: { label: "Suppliers", href: "/suppliers" } },
            React.createElement("div", { className: "text-center py-12" }, "Supplier not found")));
    }
    var getRatingColor = function (rating) {
        if (rating >= 80)
            return "text-green-600";
        if (rating >= 60)
            return "text-yellow-600";
        return "text-red-600";
    };
    var getStatusBadgeColor = function (status) {
        var colors = {
            pending: "bg-yellow-100 text-yellow-800",
            pre_qualified: "bg-blue-100 text-blue-800",
            qualified: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
            inactive: "bg-gray-100 text-gray-800"
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Supplier Details", icon: React.createElement(lucide_react_1.Truck, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Suppliers", href: "/suppliers" }, { label: "Details" }], backLink: { label: "Suppliers", href: "/suppliers" } },
        React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "flex items-center justify-end gap-1" },
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: toggleStar },
                    React.createElement(lucide_react_1.Star, { className: "h-4 w-4 " + (isStarred ? "fill-amber-400 text-amber-400" : "") })),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { if (supplier.email)
                        window.location.href = "mailto:" + supplier.email; } },
                    React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" })),
                !isEditing ? (React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/suppliers/" + id + "/edit"); } },
                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))) : null),
            React.createElement("div", { className: "flex gap-6" },
                React.createElement("div", { className: "w-[320px] min-w-[320px] space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 space-y-4" },
                            React.createElement("div", null,
                                React.createElement("h2", { className: "text-xl font-bold" }, supplier.companyName),
                                React.createElement("p", { className: "text-sm text-muted-foreground" },
                                    "#",
                                    supplier.supplierNumber)),
                            React.createElement(badge_1.Badge, { className: getStatusBadgeColor(supplier.qualificationStatus) }, supplier.qualificationStatus.replace("_", " ")),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-3 text-sm" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Phone, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Phone"),
                                        React.createElement("p", { className: "font-medium" }, supplier.phone || "—"))),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Mail, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Email"),
                                        React.createElement("p", { className: "font-medium" }, supplier.email || "—"))),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.MapPin, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Address"),
                                        React.createElement("p", { className: "font-medium" },
                                            supplier.address || "—",
                                            supplier.city ? ", " + supplier.city : ""))),
                                supplier.website && (React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Globe, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Website"),
                                        React.createElement("a", { href: supplier.website, target: "_blank", rel: "noopener noreferrer", className: "font-medium text-blue-600" }, supplier.website))))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Ratings"),
                                React.createElement("div", { className: "grid grid-cols-2 gap-2 text-sm" },
                                    React.createElement("div", { className: "bg-muted/50 rounded p-2" },
                                        React.createElement("p", { className: "text-muted-foreground" }, "Quality"),
                                        React.createElement("p", { className: "font-bold " + getRatingColor(supplier.qualityRating) },
                                            supplier.qualityRating,
                                            "/100")),
                                    React.createElement("div", { className: "bg-muted/50 rounded p-2" },
                                        React.createElement("p", { className: "text-muted-foreground" }, "Delivery"),
                                        React.createElement("p", { className: "font-bold " + getRatingColor(supplier.deliveryRating) },
                                            supplier.deliveryRating,
                                            "/100")),
                                    React.createElement("div", { className: "bg-muted/50 rounded p-2" },
                                        React.createElement("p", { className: "text-muted-foreground" }, "Price"),
                                        React.createElement("p", { className: "font-bold " + getRatingColor(supplier.priceCompetitiveness) },
                                            supplier.priceCompetitiveness,
                                            "/100")),
                                    React.createElement("div", { className: "bg-muted/50 rounded p-2" },
                                        React.createElement("p", { className: "text-muted-foreground" }, "Overall"),
                                        React.createElement("p", { className: "font-bold " + getRatingColor(supplier.averageRating) },
                                            supplier.averageRating,
                                            "/100"))))))),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement(tabs_1.Tabs, { defaultValue: "details", className: "space-y-4" },
                        React.createElement(tabs_1.TabsList, null,
                            React.createElement(tabs_1.TabsTrigger, { value: "details" }, "Details"),
                            React.createElement(tabs_1.TabsTrigger, { value: "contact" }, "Contact"),
                            React.createElement(tabs_1.TabsTrigger, { value: "bank" }, "Bank Details"),
                            React.createElement(tabs_1.TabsTrigger, { value: "notes" }, "Notes")),
                        React.createElement(tabs_1.TabsContent, { value: "details" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Company Information")),
                                React.createElement(card_1.CardContent, { className: "space-y-6" },
                                    React.createElement("div", { className: "grid grid-cols-4 gap-4" },
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Supplier Number"),
                                            React.createElement("p", { className: "font-semibold mt-1" }, supplier.supplierNumber)),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Status"),
                                            React.createElement(badge_1.Badge, { className: "mt-1 " + getStatusBadgeColor(supplier.qualificationStatus) }, supplier.qualificationStatus.replace("_", " "))),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Tax ID"),
                                            React.createElement("p", { className: "font-semibold mt-1" }, supplier.taxId || "-")),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Orders"),
                                            React.createElement("p", { className: "font-semibold mt-1" }, supplier.totalOrders))),
                                    isEditing ? (React.createElement("div", { className: "space-y-4" },
                                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                            React.createElement("div", { className: "space-y-2" },
                                                React.createElement(label_1.Label, { htmlFor: "companyName" }, "Company Name"),
                                                React.createElement(input_1.Input, { id: "companyName", name: "companyName", value: formData.companyName, onChange: handleInputChange })),
                                            React.createElement("div", { className: "space-y-2" },
                                                React.createElement(label_1.Label, { htmlFor: "website" }, "Website"),
                                                React.createElement(input_1.Input, { id: "website", name: "website", value: formData.website, onChange: handleInputChange })),
                                            React.createElement("div", { className: "space-y-2" },
                                                React.createElement(label_1.Label, { htmlFor: "qualificationStatus" }, "Qualification Status"),
                                                React.createElement(select_1.Select, { value: formData.qualificationStatus, onValueChange: function (v) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { qualificationStatus: v })); }); } },
                                                    React.createElement(select_1.SelectTrigger, { id: "qualificationStatus" },
                                                        React.createElement(select_1.SelectValue, null)),
                                                    React.createElement(select_1.SelectContent, null,
                                                        React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                                        React.createElement(select_1.SelectItem, { value: "pre_qualified" }, "Pre-Qualified"),
                                                        React.createElement(select_1.SelectItem, { value: "qualified" }, "Qualified"),
                                                        React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                                                        React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"))))))) : (React.createElement("div", null,
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Website"),
                                        React.createElement("p", { className: "font-semibold mt-1" }, supplier.website ? (React.createElement("a", { href: supplier.website, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600" }, supplier.website)) : ("-"))))))),
                        React.createElement(tabs_1.TabsContent, { value: "contact" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Contact Information")),
                                React.createElement(card_1.CardContent, null, isEditing ? (React.createElement("div", { className: "space-y-4" },
                                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "contactPerson" }, "Contact Person"),
                                            React.createElement(input_1.Input, { id: "contactPerson", name: "contactPerson", value: formData.contactPerson, onChange: handleInputChange })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "email" }, "Email"),
                                            React.createElement(input_1.Input, { id: "email", name: "email", type: "email", value: formData.email, onChange: handleInputChange })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "phone" }, "Phone"),
                                            React.createElement(input_1.Input, { id: "phone", name: "phone", value: formData.phone, onChange: handleInputChange })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "alternatePhone" }, "Alternate Phone"),
                                            React.createElement(input_1.Input, { id: "alternatePhone", name: "alternatePhone", value: formData.alternatePhone, onChange: handleInputChange })),
                                        React.createElement("div", { className: "space-y-2 col-span-2" },
                                            React.createElement(label_1.Label, { htmlFor: "address" }, "Address"),
                                            React.createElement(input_1.Input, { id: "address", name: "address", value: formData.address, onChange: handleInputChange })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "city" }, "City"),
                                            React.createElement(LocationSelects_1.CitySelect, { value: formData.city || "", onChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { city: value })); }); }, label: "" })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "postalCode" }, "Postal Code"),
                                            React.createElement(input_1.Input, { id: "postalCode", name: "postalCode", value: formData.postalCode, onChange: handleInputChange }))))) : (React.createElement("div", { className: "space-y-4" },
                                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Contact Person"),
                                            React.createElement("p", { className: "font-semibold mt-1" }, supplier.contactPerson || "-")),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Email"),
                                            React.createElement("a", { href: "mailto:" + supplier.email, className: "font-semibold mt-1 text-blue-600" }, supplier.email || "-")),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Phone"),
                                            React.createElement("p", { className: "font-semibold mt-1" }, supplier.phone || "-")),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Alternate Phone"),
                                            React.createElement("p", { className: "font-semibold mt-1" }, supplier.alternatePhone || "-")),
                                        React.createElement("div", { className: "col-span-2" },
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Address"),
                                            React.createElement("p", { className: "font-semibold mt-1" }, supplier.address || "-")),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "City"),
                                            React.createElement("p", { className: "font-semibold mt-1" }, supplier.city || "-")),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Postal Code"),
                                            React.createElement("p", { className: "font-semibold mt-1" }, supplier.postalCode || "-")))))))),
                        React.createElement(tabs_1.TabsContent, { value: "bank" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Bank Details")),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement("div", { className: "space-y-4" },
                                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                            React.createElement("div", null,
                                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Bank Name"),
                                                React.createElement("p", { className: "font-semibold mt-1" }, supplier.bankName || "-")),
                                            React.createElement("div", null,
                                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Branch"),
                                                React.createElement("p", { className: "font-semibold mt-1" }, supplier.bankBranch || "-")),
                                            React.createElement("div", null,
                                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Account Number"),
                                                React.createElement("p", { className: "font-semibold mt-1" }, supplier.accountNumber || "-")),
                                            React.createElement("div", null,
                                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Account Name"),
                                                React.createElement("p", { className: "font-semibold mt-1" }, supplier.accountName || "-")),
                                            React.createElement("div", null,
                                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Payment Terms"),
                                                React.createElement("p", { className: "font-semibold mt-1" }, formData.paymentTerms || "-"))),
                                        isEditing && (React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "paymentTerms" }, "Payment Terms"),
                                            React.createElement(input_1.Input, { id: "paymentTerms", name: "paymentTerms", value: formData.paymentTerms, onChange: handleInputChange, placeholder: "e.g., Net 30" }))))))),
                        React.createElement(tabs_1.TabsContent, { value: "notes" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Ratings & Notes")),
                                React.createElement(card_1.CardContent, { className: "space-y-6" },
                                    isEditing && (React.createElement("div", { className: "space-y-4" },
                                        React.createElement("div", { className: "grid grid-cols-3 gap-4" },
                                            React.createElement("div", { className: "space-y-2" },
                                                React.createElement(label_1.Label, { htmlFor: "qualityRating" }, "Quality Rating (0-100)"),
                                                React.createElement(input_1.Input, { id: "qualityRating", name: "qualityRating", type: "number", min: "0", max: "100", value: formData.qualityRating, onChange: handleInputChange })),
                                            React.createElement("div", { className: "space-y-2" },
                                                React.createElement(label_1.Label, { htmlFor: "deliveryRating" }, "Delivery Rating (0-100)"),
                                                React.createElement(input_1.Input, { id: "deliveryRating", name: "deliveryRating", type: "number", min: "0", max: "100", value: formData.deliveryRating, onChange: handleInputChange })),
                                            React.createElement("div", { className: "space-y-2" },
                                                React.createElement(label_1.Label, { htmlFor: "priceCompetitiveness" }, "Price Competitiveness (0-100)"),
                                                React.createElement(input_1.Input, { id: "priceCompetitiveness", name: "priceCompetitiveness", type: "number", min: "0", max: "100", value: formData.priceCompetitiveness, onChange: handleInputChange }))))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "notes" }, isEditing ? "Edit Notes" : "Notes"),
                                        isEditing ? (React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { notes: html })); }); }, placeholder: "Add internal notes about this supplier...", minHeight: "100px" })) : (React.createElement("p", { className: "text-sm mt-1" }, supplier.notes || "-"))))))),
                    isEditing && (React.createElement("div", { className: "flex gap-2 justify-end" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsEditing(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleSave, disabled: updateMutation.isPending }, updateMutation.isPending ? (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                            "Saving...")) : (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                            "Save Changes"))))))))));
}
exports["default"] = SupplierDetailsPage;
