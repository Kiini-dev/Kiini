"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var lucide_react_1 = require("lucide-react");
function ImprestDetails() {
    var _a;
    var params = wouter_1.useParams();
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var currencyCode = currency_1.useCurrencySettings().code;
    var _c = trpc_1.trpc.imprest.getById.useQuery(params.id, {
        enabled: !!params.id
    }), imprest = _c.data, isLoading = _c.isLoading;
    var _d = trpc_1.trpc.users.list.useQuery({ limit: 100 }).data, employees = _d === void 0 ? [] : _d;
    var _e = trpc_1.trpc.imprestSurrender.list.useQuery({ imprestId: params.id }, { enabled: !!params.id }).data, surrenders = _e === void 0 ? [] : _e;
    var employeeName = react_1.useMemo(function () {
        if (!(imprest === null || imprest === void 0 ? void 0 : imprest.userId))
            return "—";
        var emp = employees.find(function (e) { return e.id === imprest.userId; });
        return (emp === null || emp === void 0 ? void 0 : emp.name) || imprest.userId;
    }, [imprest === null || imprest === void 0 ? void 0 : imprest.userId, employees]);
    var totalSurrendered = react_1.useMemo(function () {
        return surrenders.reduce(function (sum, s) { return sum + (s.amount || 0); }, 0);
    }, [surrenders]);
    var statusColors = {
        requested: "bg-blue-100 text-blue-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        settled: "bg-purple-100 text-purple-800"
    };
    var fmt = function (v) {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(v / 100);
    };
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" })));
    }
    if (!imprest) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center min-h-[400px] gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "Imprest not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/imprests"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back to Imprests")));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Imprest " + (imprest.imprestNumber || ""), description: "Imprest Request Details", icon: React.createElement(lucide_react_1.Wallet, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Imprests", href: "/imprests" },
            { label: imprest.imprestNumber || "Details" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/imprests"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back"),
            React.createElement(button_1.Button, { onClick: function () { return setLocation("/imprests/" + params.id + "/edit"); } },
                React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4 mr-2" }),
                " Edit")) },
        React.createElement("div", { className: "max-w-4xl space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement(badge_1.Badge, { className: "text-sm px-3 py-1 " + (statusColors[imprest.status] || "") }, (_a = imprest.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()),
                React.createElement("span", { className: "text-sm text-muted-foreground" },
                    "Created ",
                    new Date(imprest.createdAt).toLocaleDateString())),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.User, { className: "w-4 h-4 text-blue-600" }),
                        "Request Details")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Imprest Number"),
                            React.createElement("p", { className: "font-medium" }, imprest.imprestNumber || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Employee"),
                            React.createElement("p", { className: "font-medium" }, employeeName))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Coins, { className: "w-4 h-4 text-green-600" }),
                        "Financial")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Amount"),
                            React.createElement("p", { className: "font-medium text-lg" }, fmt(imprest.amount || 0))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Surrendered"),
                            React.createElement("p", { className: "font-medium text-lg" }, fmt(totalSurrendered))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Outstanding"),
                            React.createElement("p", { className: "font-medium text-lg" }, fmt((imprest.amount || 0) - totalSurrendered)))))),
            imprest.purpose && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.StickyNote, { className: "w-4 h-4 text-purple-600" }),
                        "Purpose")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: imprest.purpose } })))),
            surrenders.length > 0 && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Wallet, { className: "w-4 h-4 text-orange-600" }),
                        "Surrender History")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-3" }, surrenders.map(function (s, i) { return (React.createElement("div", { key: s.id || i },
                        i > 0 && React.createElement(separator_1.Separator, { className: "my-3" }),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "font-medium" }, fmt(s.amount || 0)),
                                s.notes && (React.createElement("div", { className: "text-sm text-muted-foreground prose prose-sm max-w-none mt-1", dangerouslySetInnerHTML: { __html: s.notes } }))),
                            React.createElement("span", { className: "text-sm text-muted-foreground" }, s.surrenderedAt
                                ? new Date(s.surrenderedAt).toLocaleDateString()
                                : s.createdAt
                                    ? new Date(s.createdAt).toLocaleDateString()
                                    : "—")))); }))))))));
}
exports["default"] = ImprestDetails;
