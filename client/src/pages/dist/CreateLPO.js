"use strict";
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var budget_error_handler_1 = require("@/lib/budget-error-handler");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var wouter_1 = require("wouter");
function CreateLPO() {
    var _a, _b;
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var _d = react_1.useState(""), vendorId = _d[0], setVendorId = _d[1];
    var _e = react_1.useState(""), description = _e[0], setDescription = _e[1];
    var _f = react_1.useState(""), amount = _f[0], setAmount = _f[1];
    var _g = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliers = _g === void 0 ? [] : _g;
    var createMutation = trpc_1.trpc.lpo.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("LPO created successfully");
            setLocation("/lpos");
        },
        onError: function (e) { if (budget_error_handler_1.handleBudgetError(e))
            return; sonner_1.toast.error(e.message); }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!vendorId) {
            sonner_1.toast.error("Please select a vendor/supplier");
            return;
        }
        var parsedAmount = parseFloat(amount) || 0;
        if (parsedAmount <= 0) {
            sonner_1.toast.error("Amount must be greater than 0");
            return;
        }
        createMutation.mutate({ vendorId: vendorId, description: description || undefined, amount: parsedAmount });
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Create Local Purchase Order", description: "Create a new LPO for procurement", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
            { label: "LPOs", href: "/lpos" },
            { label: "Create LPO" },
        ] },
        react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "max-w-4xl space-y-6 p-4 sm:p-6" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Building2, { className: "h-4 w-4 text-primary" }),
                        "Vendor / Supplier")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "space-y-2 md:w-1/2" },
                        react_1["default"].createElement(label_1.Label, null, "Select Supplier *"),
                        react_1["default"].createElement(select_1.Select, { value: vendorId, onValueChange: setVendorId },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Choose a supplier..." })),
                            react_1["default"].createElement(select_1.SelectContent, null, (Array.isArray(suppliers) ? suppliers : (_b = (_a = suppliers) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : []).map(function (s) { return (react_1["default"].createElement(select_1.SelectItem, { key: s.id, value: s.id }, s.name || s.companyName || s.id)); })))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-primary" }),
                        "Order Value")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "space-y-2 md:w-1/2" },
                        react_1["default"].createElement(label_1.Label, null, "Amount (KES) *"),
                        react_1["default"].createElement("div", { className: "relative" },
                            react_1["default"].createElement(lucide_react_1.DollarSign, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                            react_1["default"].createElement(input_1.Input, { type: "number", value: amount, onChange: function (e) { return setAmount(e.target.value); }, placeholder: "0.00", step: "0.01", min: "0", className: "pl-9", required: true }))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.ClipboardList, { className: "h-4 w-4 text-primary" }),
                        "Description")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, null, "Purchase Description"),
                        react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: description, onChange: setDescription, placeholder: "Describe what is being purchased, quantities, specifications...", minHeight: "140px" })))),
            react_1["default"].createElement("div", { className: "flex gap-3 justify-end" },
                react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/lpos"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                    "Cancel"),
                react_1["default"].createElement(button_1.Button, { type: "submit", disabled: createMutation.isPending || !vendorId || !amount },
                    createMutation.isPending ? react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : react_1["default"].createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                    createMutation.isPending ? "Creating..." : "Create LPO")))));
}
exports["default"] = CreateLPO;
