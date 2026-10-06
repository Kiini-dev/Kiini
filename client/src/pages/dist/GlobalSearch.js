"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var use_debounce_1 = require("@/hooks/use-debounce");
var TYPE_ICON = {
    client: React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
    invoice: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
    project: React.createElement(lucide_react_1.FolderKanban, { className: "h-4 w-4" }),
    product: React.createElement(lucide_react_1.Package, { className: "h-4 w-4" }),
    expense: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" })
};
var TYPE_PATH = {
    client: "/clients",
    invoice: "/invoices",
    project: "/projects",
    product: "/products",
    expense: "/expenses"
};
function GlobalSearch() {
    var _a, _b;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var _d = react_1.useState(""), query = _d[0], setQuery = _d[1];
    var debouncedQuery = use_debounce_1.useDebounce(query, 300);
    var _e = trpc_1.trpc.search.global.useQuery({ query: debouncedQuery }, { enabled: debouncedQuery.length >= 2 }), data = _e.data, isLoading = _e.isLoading;
    var results = Array.isArray(data) ? data : (_b = (_a = data) === null || _a === void 0 ? void 0 : _a.results) !== null && _b !== void 0 ? _b : [];
    var handleResultClick = function (result) {
        var basePath = TYPE_PATH[result.type];
        if (basePath && result.id) {
            navigate(basePath + "/" + result.id);
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Global Search", description: "Search across clients, invoices, projects, products and expenses", icon: React.createElement(lucide_react_1.Search, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Global Search" },
        ] },
        React.createElement("div", { className: "max-w-3xl mx-auto space-y-6" },
            React.createElement("div", { className: "relative" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { value: query, onChange: function (e) { return setQuery(e.target.value); }, placeholder: "Type at least 2 characters to search...", className: "pl-9 h-11 text-base", autoFocus: true }),
                isLoading && (React.createElement(lucide_react_1.Loader2, { className: "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" }))),
            debouncedQuery.length >= 2 && !isLoading && results.length === 0 && (React.createElement("p", { className: "text-center text-muted-foreground py-8" },
                "No results found for \"",
                debouncedQuery,
                "\"")),
            results.length > 0 && (React.createElement("div", { className: "space-y-2" },
                React.createElement("p", { className: "text-sm text-muted-foreground" },
                    results.length,
                    " result",
                    results.length !== 1 ? "s" : ""),
                results.map(function (result) {
                    var _a;
                    return (React.createElement(card_1.Card, { key: result.type + "-" + result.id, className: "cursor-pointer hover:bg-accent/50 transition-colors", onClick: function () { return handleResultClick(result); } },
                        React.createElement(card_1.CardContent, { className: "flex items-start gap-3 p-4" },
                            React.createElement("div", { className: "mt-0.5 text-muted-foreground" }, (_a = TYPE_ICON[result.type]) !== null && _a !== void 0 ? _a : React.createElement(lucide_react_1.Search, { className: "h-4 w-4" })),
                            React.createElement("div", { className: "flex-1 min-w-0" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("p", { className: "font-medium truncate" }, result.title),
                                    React.createElement(badge_1.Badge, { variant: "secondary", className: "capitalize shrink-0" }, result.type)),
                                result.description && (React.createElement("p", { className: "text-sm text-muted-foreground truncate" }, result.description))),
                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "shrink-0" }, "View"))));
                }))),
            debouncedQuery.length === 0 && (React.createElement("div", { className: "text-center text-muted-foreground py-12" },
                React.createElement(lucide_react_1.Search, { className: "h-12 w-12 mx-auto mb-3 opacity-20" }),
                React.createElement("p", null, "Start typing to search across all modules"))))));
}
exports["default"] = GlobalSearch;
