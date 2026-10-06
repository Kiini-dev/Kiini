"use strict";
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
var wouter_1 = require("wouter");
function CreatePurchaseOrder() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(""), name = _b[0], setName = _b[1];
    var _c = react_1.useState(""), description = _c[0], setDescription = _c[1];
    var _d = react_1.useState("supplies"), category = _d[0], setCategory = _d[1];
    var _e = react_1.useState(1), quantity = _e[0], setQuantity = _e[1];
    var _f = react_1.useState(0), price = _f[0], setPrice = _f[1];
    var _g = react_1.useState(""), requiredDate = _g[0], setRequiredDate = _g[1];
    var _h = react_1.useState(""), notes = _h[0], setNotes = _h[1];
    var createMutation = trpc_1.trpc.procurement.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Done");
            setLocation("/purchase-orders");
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!name) {
            sonner_1.toast.error("Name is required");
            return;
        }
        if (quantity <= 0) {
            sonner_1.toast.error("Quantity must be greater than 0");
            return;
        }
        if (price <= 0) {
            sonner_1.toast.error("Price must be greater than 0");
            return;
        }
        createMutation.mutate({
            name: name,
            description: description || undefined,
            category: category,
            quantity: quantity,
            price: price,
            requiredDate: requiredDate ? new Date(requiredDate) : undefined,
            notes: notes || undefined
        });
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Create Purchase Order", icon: react_1["default"].createElement(lucide_react_1.ShoppingCart, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Procurement" },
            { label: "Create Purchase Order" },
        ] },
        react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6 max-w-2xl" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Purchase Order Details")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Item Name *"),
                        react_1["default"].createElement(input_1.Input, { value: name, onChange: function (e) { return setName(e.target.value); }, placeholder: "Item name", required: true })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Description"),
                        react_1["default"].createElement("textarea", { value: description, onChange: function (e) { return setDescription(e.target.value); }, placeholder: "Describe the purchase", rows: 3, className: "w-full px-3 py-2 border rounded-lg" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Category *"),
                        react_1["default"].createElement("select", { value: category, onChange: function (e) { return setCategory(e.target.value); }, className: "w-full px-3 py-2 border rounded-lg" },
                            react_1["default"].createElement("option", { value: "equipment" }, "Equipment"),
                            react_1["default"].createElement("option", { value: "supplies" }, "Supplies"),
                            react_1["default"].createElement("option", { value: "services" }, "Services"),
                            react_1["default"].createElement("option", { value: "materials" }, "Materials"))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Quantity *"),
                            react_1["default"].createElement(input_1.Input, { type: "number", value: quantity || "", onChange: function (e) { return setQuantity(parseInt(e.target.value) || 0); }, min: "1", required: true })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Unit Price (KES) *"),
                            react_1["default"].createElement(input_1.Input, { type: "number", value: price || "", onChange: function (e) { return setPrice(parseFloat(e.target.value) || 0); }, step: "0.01", min: "0", required: true }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Required Date"),
                        react_1["default"].createElement(input_1.Input, { type: "date", value: requiredDate, onChange: function (e) { return setRequiredDate(e.target.value); } })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Notes"),
                        react_1["default"].createElement("textarea", { value: notes, onChange: function (e) { return setNotes(e.target.value); }, placeholder: "Additional notes", rows: 2, className: "w-full px-3 py-2 border rounded-lg" })))),
            react_1["default"].createElement("div", { className: "flex gap-3 justify-end" },
                react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/purchase-orders"); } }, "Cancel"),
                react_1["default"].createElement(button_1.Button, { type: "submit", disabled: createMutation.isPending }, createMutation.isPending ? "Creating…" : "Create Purchase Order")))));
}
exports["default"] = CreatePurchaseOrder;
