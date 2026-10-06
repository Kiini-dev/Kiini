"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var wouter_1 = require("wouter");
var categories = [
    { key: "all", label: "All", icon: lucide_react_1.Search },
    { key: "clients", label: "Clients", icon: lucide_react_1.Users },
    { key: "invoices", label: "Invoices", icon: lucide_react_1.FileText },
    { key: "projects", label: "Projects", icon: lucide_react_1.FolderKanban },
    { key: "expenses", label: "Expenses", icon: lucide_react_1.Receipt },
];
function GlobalSearch() {
    var _a;
    var _b = react_1.useState(""), query = _b[0], setQuery = _b[1];
    var _c = react_1.useState("all"), category = _c[0], setCategory = _c[1];
    var _d = wouter_1.useLocation(), navigate = _d[1];
    var searchQuery = trpc_1.trpc.search.global.useQuery({ query: query, limit: 50 }, { enabled: query.length >= 2, keepPreviousData: true });
    var results = ((_a = searchQuery.data) === null || _a === void 0 ? void 0 : _a.results) || searchQuery.data || [];
    var filteredResults = Array.isArray(results)
        ? category === "all"
            ? results
            : results.filter(function (r) { return r.type === category || r.category === category; })
        : [];
    var typeIcons = {
        client: lucide_react_1.Users,
        invoice: lucide_react_1.FileText,
        project: lucide_react_1.FolderKanban,
        expense: lucide_react_1.Receipt,
        product: lucide_react_1.Package,
        payment: lucide_react_1.DollarSign
    };
    var handleNavigate = function (result) {
        var paths = {
            client: "/clients/" + result.id,
            invoice: "/invoices/" + result.id,
            project: "/projects/" + result.id,
            expense: "/expenses/" + result.id,
            payment: "/payments/" + result.id,
            product: "/products/" + result.id
        };
        var path = paths[result.type] || paths[result.category];
        if (path)
            navigate(path);
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Search", description: "Search across all modules", icon: React.createElement(lucide_react_1.Search, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Search" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "relative max-w-2xl" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search clients, invoices, projects, expenses\u2026", value: query, onChange: function (e) { return setQuery(e.target.value); }, className: "pl-12 h-12 text-lg", autoFocus: true })),
            React.createElement("div", { className: "flex gap-2 flex-wrap" }, categories.map(function (cat) { return (React.createElement(button_1.Button, { key: cat.key, variant: category === cat.key ? "default" : "outline", size: "sm", onClick: function () { return setCategory(cat.key); } },
                React.createElement(cat.icon, { className: "h-4 w-4 mr-1" }),
                " ",
                cat.label)); })),
            query.length < 2 ? (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "py-16 text-center text-muted-foreground" },
                    React.createElement(lucide_react_1.Search, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
                    React.createElement("p", null, "Type at least 2 characters to search across all modules.")))) : searchQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-20" },
                React.createElement(spinner_1.Spinner, null))) : filteredResults.length === 0 ? (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "py-16 text-center text-muted-foreground" },
                    "No results found for \"",
                    query,
                    "\"."))) : (React.createElement("div", { className: "space-y-2" }, filteredResults.map(function (result, idx) {
                var Icon = typeIcons[result.type] || typeIcons[result.category] || lucide_react_1.Search;
                return (React.createElement(card_1.Card, { key: result.id || idx, className: "cursor-pointer hover:bg-muted/50 transition-colors", onClick: function () { return handleNavigate(result); } },
                    React.createElement(card_1.CardContent, { className: "p-4 flex items-center gap-4" },
                        React.createElement("div", { className: "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center" },
                            React.createElement(Icon, { className: "h-5 w-5 text-primary" })),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("p", { className: "font-medium truncate" }, result.name || result.title || result.description),
                            React.createElement("p", { className: "text-sm text-muted-foreground truncate" }, result.subtitle || result.email || result.reference || "")),
                        React.createElement(badge_1.Badge, { variant: "outline", className: "capitalize" }, result.type || result.category))));
            }))))));
}
exports["default"] = GlobalSearch;
