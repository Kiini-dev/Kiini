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
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var spinner_1 = require("@/components/ui/spinner");
function EditWarranty() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState({
        product: "",
        vendor: "",
        expiryDate: "",
        coverage: "",
        status: "active",
        serialNumber: "",
        claimTerms: "",
        notes: ""
    }), formData = _b[0], setFormData = _b[1];
    var _c = trpc_1.trpc.warranty.getById.useQuery(id || "", { enabled: !!id }), warranty = _c.data, isLoadingData = _c.isLoading;
    react_1.useEffect(function () {
        if (warranty) {
            setFormData({
                product: warranty.product || "",
                vendor: warranty.vendor || "",
                expiryDate: warranty.expiryDate ? new Date(warranty.expiryDate).toISOString().split("T")[0] : "",
                coverage: warranty.coverage || "",
                status: warranty.status || "active",
                serialNumber: warranty.serialNumber || "",
                claimTerms: warranty.claimTerms || "",
                notes: warranty.notes || ""
            });
        }
    }, [warranty]);
    var updateMutation = trpc_1.trpc.warranty.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Warranty updated successfully!");
            utils.warranty.list.invalidate();
            utils.warranty.getById.invalidate(id || "");
            navigate("/warranty");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update warranty: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.product || !formData.vendor || !formData.expiryDate || !formData.coverage) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        updateMutation.mutate({
            id: id || "",
            product: formData.product,
            vendor: formData.vendor,
            expiryDate: formData.expiryDate,
            coverage: formData.coverage,
            status: formData.status,
            serialNumber: formData.serialNumber || undefined,
            claimTerms: formData.claimTerms || undefined,
            notes: formData.notes || undefined
        });
    };
    if (isLoadingData) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Warranty", icon: React.createElement(lucide_react_1.ShieldCheck, { className: "w-6 h-6" }) },
            React.createElement("div", { className: "flex items-center justify-center py-12" },
                React.createElement(spinner_1.Spinner, { className: "h-8 w-8" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Warranty", description: "Update warranty record details", icon: React.createElement(lucide_react_1.ShieldCheck, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Warranty", href: "/warranty" },
            { label: "Edit Warranty" },
        ], actions: React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/warranty"); } },
            React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
            "Back to Warranties") },
        React.createElement("div", { className: "space-y-6 max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Warranty Details"),
                    React.createElement(card_1.CardDescription, null, "Update the warranty record")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "product" }, "Product *"),
                                React.createElement(input_1.Input, { id: "product", value: formData.product, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { product: e.target.value })); }, required: true })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "vendor" }, "Vendor *"),
                                React.createElement(input_1.Input, { id: "vendor", value: formData.vendor, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { vendor: e.target.value })); }, required: true }))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "expiryDate" }, "Expiry Date *"),
                                React.createElement(input_1.Input, { id: "expiryDate", type: "date", value: formData.expiryDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { expiryDate: e.target.value })); }, required: true })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                                React.createElement(select_1.Select, { value: formData.status, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { status: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                        React.createElement(select_1.SelectItem, { value: "expiring_soon" }, "Expiring Soon"),
                                        React.createElement(select_1.SelectItem, { value: "expired" }, "Expired"))))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "coverage" }, "Coverage *"),
                            React.createElement(input_1.Input, { id: "coverage", value: formData.coverage, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { coverage: e.target.value })); }, required: true, placeholder: "e.g., Full, Parts Only" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "serialNumber" }, "Serial Number"),
                            React.createElement(input_1.Input, { id: "serialNumber", value: formData.serialNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { serialNumber: e.target.value })); } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "claimTerms" }, "Claim Terms"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.claimTerms, onChange: function (html) { return setFormData(__assign(__assign({}, formData), { claimTerms: html })); }, minHeight: "100px" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return setFormData(__assign(__assign({}, formData), { notes: html })); }, minHeight: "100px" })),
                        React.createElement("div", { className: "flex gap-3 pt-4" },
                            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/warranty"); } }, "Cancel"),
                            React.createElement(button_1.Button, { type: "submit", disabled: updateMutation.isPending }, updateMutation.isPending ? React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                                "Saving...") : React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                                "Save Changes")))))))));
}
exports["default"] = EditWarranty;
