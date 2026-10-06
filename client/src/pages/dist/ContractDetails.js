"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var lucide_react_1 = require("lucide-react");
function ContractDetails() {
    var _a, _b;
    var params = wouter_1.useParams();
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var currencyCode = currency_1.useCurrencySettings().code;
    var _d = trpc_1.trpc.contracts.getById.useQuery(params.id, {
        enabled: !!params.id
    }), contract = _d.data, isLoading = _d.isLoading;
    var statusColors = {
        draft: "bg-gray-100 text-gray-800",
        active: "bg-green-100 text-green-800",
        expired: "bg-orange-100 text-orange-800",
        terminated: "bg-red-100 text-red-800"
    };
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" })));
    }
    if (!contract) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center min-h-[400px] gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "Contract not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/contracts"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back to Contracts")));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: contract.name || "Contract Details", description: "Contract #" + (contract.contractNumber || ((_a = contract.id) === null || _a === void 0 ? void 0 : _a.slice(0, 8))), icon: React.createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Contracts", href: "/contracts" },
            { label: contract.name || "Details" },
        ], actions: React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/contracts"); } },
            React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
            " Back") },
        React.createElement("div", { className: "max-w-4xl space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement(badge_1.Badge, { className: "text-sm px-3 py-1 " + (statusColors[contract.status] || "") }, (_b = contract.status) === null || _b === void 0 ? void 0 : _b.toUpperCase()),
                React.createElement("span", { className: "text-sm text-muted-foreground" },
                    "Created ",
                    new Date(contract.createdAt).toLocaleDateString())),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Building2, { className: "w-4 h-4 text-blue-600" }),
                        "Contract Information")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Contract Name"),
                            React.createElement("p", { className: "font-medium" }, contract.name || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Contract Number"),
                            React.createElement("p", { className: "font-medium" }, contract.contractNumber || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Vendor"),
                            React.createElement("p", { className: "font-medium" }, contract.vendor || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Contract Type"),
                            React.createElement("p", { className: "font-medium" }, contract.contractType || "—"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Calendar, { className: "w-4 h-4 text-orange-600" }),
                        "Schedule & Value")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Start Date"),
                            React.createElement("p", { className: "font-medium" }, contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "End Date"),
                            React.createElement("p", { className: "font-medium" }, contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Contract Value"),
                            React.createElement("p", { className: "font-medium text-lg" }, contract.value
                                ? new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(contract.value / 100)
                                : "—"))))),
            (contract.description || contract.notes) && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.StickyNote, { className: "w-4 h-4 text-purple-600" }),
                        "Description & Notes")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    contract.description && (React.createElement("div", null,
                        React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Description"),
                        React.createElement("div", { className: "prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: contract.description } }))),
                    contract.description && contract.notes && React.createElement(separator_1.Separator, null),
                    contract.notes && (React.createElement("div", null,
                        React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Notes"),
                        React.createElement("div", { className: "prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: contract.notes } })))))))));
}
exports["default"] = ContractDetails;
