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
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var currency_1 = require("@/lib/currency");
function EditLPO() {
    var _a, _b;
    var _c = permissions_1.useRequireFeature("procurement:lpo:edit"), allowed = _c.allowed, isLoading = _c.isLoading;
    var symbol = currency_1.useCurrency().symbol;
    var _d = wouter_1.useLocation(), navigate = _d[1];
    var _e = wouter_1.useRoute("/lpos/:id/edit"), match = _e[0], params = _e[1];
    var utils = trpc_1.trpc.useUtils();
    var lpoId = params === null || params === void 0 ? void 0 : params.id;
    var _f = react_1.useState({
        vendorId: "",
        vendorName: "",
        description: "",
        amount: 0,
        lpoNumber: "",
        status: "draft"
    }), formData = _f[0], setFormData = _f[1];
    var _g = react_1.useState(true), isLoadingLPO = _g[0], setIsLoadingLPO = _g[1];
    var _h = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliers = _h === void 0 ? [] : _h;
    var getLPO = trpc_1.trpc.lpo.getById.useQuery(lpoId || "", {
        enabled: !!lpoId,
        onSuccess: function (data) {
            if (data) {
                setFormData({
                    vendorId: data.vendorId,
                    vendorName: data.vendorName || "",
                    description: data.description || "",
                    amount: data.amount ? data.amount : 0,
                    lpoNumber: data.lpoNumber,
                    status: data.status || "draft"
                });
            }
            setIsLoadingLPO(false);
        },
        onError: function () { sonner_1.toast.error("Failed to load LPO"); setIsLoadingLPO(false); }
    });
    var updateMutation = trpc_1.trpc.lpo.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("LPO updated successfully!");
            utils.lpo.list.invalidate();
            navigate("/lpos");
        },
        onError: function (error) { return sonner_1.toast.error("Failed to update LPO: " + error.message); }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!lpoId) {
            sonner_1.toast.error("LPO ID not found");
            return;
        }
        if (!formData.vendorId || formData.amount <= 0) {
            sonner_1.toast.error("Please fill in vendor and amount");
            return;
        }
        updateMutation.mutate({
            id: lpoId,
            description: formData.description || undefined,
            amount: Math.round(formData.amount * 100),
            status: formData.status
        });
    };
    var breadcrumbs = [
        { label: "Dashboard", href: "/crm-home" },
        { label: "Procurement", href: "/procurement" },
        { label: "LPOs", href: "/lpos" },
        { label: "Edit LPO" },
    ];
    if (isLoading || isLoadingLPO) {
        return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Local Purchase Order", description: "Update LPO details", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: breadcrumbs },
            react_1["default"].createElement("div", { className: "flex items-center justify-center p-8" },
                react_1["default"].createElement(spinner_1.Spinner, null))));
    }
    var suppliersList = Array.isArray(suppliers) ? suppliers : (_b = (_a = suppliers) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Local Purchase Order", description: "Update LPO details", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: breadcrumbs },
        react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "max-w-4xl space-y-6 p-4 sm:p-6" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Hash, { className: "h-4 w-4 text-primary" }),
                        "LPO Reference")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, null, "LPO Number"),
                            react_1["default"].createElement(input_1.Input, { value: formData.lpoNumber, disabled: true, className: "bg-muted" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, null, "Status"),
                            react_1["default"].createElement(select_1.Select, { value: formData.status, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { status: v })); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "submitted" }, "Submitted"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "received" }, "Received"))))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Building2, { className: "h-4 w-4 text-primary" }),
                        "Vendor / Supplier")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "space-y-2 md:w-1/2" },
                        react_1["default"].createElement(label_1.Label, null, "Select Supplier *"),
                        react_1["default"].createElement(select_1.Select, { value: formData.vendorId, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { vendorId: v })); } },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Choose a supplier..." })),
                            react_1["default"].createElement(select_1.SelectContent, null, suppliersList.map(function (s) { return (react_1["default"].createElement(select_1.SelectItem, { key: s.id, value: s.id }, s.name || s.companyName || s.id)); })))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-primary" }),
                        "Order Value")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "space-y-2 md:w-1/2" },
                        react_1["default"].createElement(label_1.Label, null,
                            "Amount (",
                            symbol,
                            ") *"),
                        react_1["default"].createElement("div", { className: "relative" },
                            react_1["default"].createElement(lucide_react_1.DollarSign, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                            react_1["default"].createElement(input_1.Input, { type: "number", step: "0.01", min: "0", value: formData.amount || "", onChange: function (e) { return setFormData(__assign(__assign({}, formData), { amount: parseFloat(e.target.value) || 0 })); }, placeholder: "0.00", className: "pl-9", required: true }))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.ClipboardList, { className: "h-4 w-4 text-primary" }),
                        "Description")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, null, "Purchase Description"),
                        react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { description: v })); }, placeholder: "Describe what is being purchased, quantities, specifications...", minHeight: "140px" })))),
            react_1["default"].createElement("div", { className: "flex gap-3 justify-end" },
                react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/lpos"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                    "Cancel"),
                react_1["default"].createElement(button_1.Button, { type: "submit", disabled: updateMutation.isPending },
                    updateMutation.isPending ? react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : react_1["default"].createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                    updateMutation.isPending ? "Updating..." : "Save Changes")))));
}
exports["default"] = EditLPO;
