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
function CreateImprest() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(""), userId = _b[0], setUserId = _b[1];
    var _c = react_1.useState(""), purpose = _c[0], setPurpose = _c[1];
    var _d = react_1.useState(0), amount = _d[0], setAmount = _d[1];
    var createMutation = trpc_1.trpc.imprest.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Done");
            setLocation("/imprests");
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!userId) {
            sonner_1.toast.error("Employee ID is required");
            return;
        }
        if (amount <= 0) {
            sonner_1.toast.error("Amount must be greater than 0");
            return;
        }
        createMutation.mutate({ userId: userId, purpose: purpose || undefined, amount: amount });
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Request Imprest Advance", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Finance" },
            { label: "Create Imprest" },
        ] },
        react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6 max-w-2xl" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Imprest Details")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Employee / User ID *"),
                        react_1["default"].createElement(input_1.Input, { value: userId, onChange: function (e) { return setUserId(e.target.value); }, placeholder: "User ID (UUID)", required: true })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Purpose"),
                        react_1["default"].createElement("textarea", { value: purpose, onChange: function (e) { return setPurpose(e.target.value); }, placeholder: "Describe purpose of the imprest", rows: 3, className: "w-full px-3 py-2 border rounded-lg" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Amount (KES) *"),
                        react_1["default"].createElement(input_1.Input, { type: "number", value: amount || "", onChange: function (e) { return setAmount(parseFloat(e.target.value) || 0); }, placeholder: "0.00", step: "0.01", min: "0", required: true })))),
            react_1["default"].createElement("div", { className: "flex gap-3 justify-end" },
                react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/imprests"); } }, "Cancel"),
                react_1["default"].createElement(button_1.Button, { type: "submit", disabled: createMutation.isPending }, createMutation.isPending ? "Submitting…" : "Submit Request")))));
}
exports["default"] = CreateImprest;
