"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgModuleLayout_1 = require("@/components/OrgModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var STATUS_COLORS = {
    paid: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    draft: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
    sent: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    overdue: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    partial: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    cancelled: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30"
};
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "draft").toLowerCase();
    return (react_1["default"].createElement("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border " + ((_b = STATUS_COLORS[s]) !== null && _b !== void 0 ? _b : "bg-muted text-muted-foreground border-border") }, s));
}
var TABS = ["all", "draft", "sent", "paid", "overdue", "partial"];
function OrgInvoices() {
    var _a;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(""), search = _c[0], setSearch = _c[1];
    var _d = react_1.useState("all"), activeTab = _d[0], setActiveTab = _d[1];
    var orgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, {
        staleTime: 300000
    }).data;
    var org = orgData === null || orgData === void 0 ? void 0 : orgData.organization;
    var featureMap = (_a = orgData === null || orgData === void 0 ? void 0 : orgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var hasAccess = !orgData || featureMap.invoicing;
    var _e = trpc_1.trpc.invoices.list.useQuery(undefined, {
        staleTime: 60000,
        enabled: !!hasAccess
    }), _f = _e.data, invoices = _f === void 0 ? [] : _f, isLoading = _e.isLoading;
    var filtered = invoices.filter(function (inv) {
        var _a, _b, _c;
        var matchTab = activeTab === "all" || ((_a = inv.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === activeTab;
        var matchSearch = !search || ((_b = inv.invoiceNumber) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) || ((_c = inv.clientName) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase()));
        return matchTab && matchSearch;
    });
    var totalInvoiced = invoices.reduce(function (sum, inv) { return sum + Number(inv.total || 0); }, 0);
    var totalPaid = invoices.reduce(function (sum, inv) { return sum + Number(inv.paidAmount || 0); }, 0);
    var outstanding = totalInvoiced - totalPaid;
    // Summary stats for ModuleLayout
    var summaryStats = [
        { label: "Total Invoiced", value: "KES " + totalInvoiced.toLocaleString(), trend: undefined },
        { label: "Total Paid", value: "KES " + totalPaid.toLocaleString(), trend: undefined },
        { label: "Outstanding", value: "KES " + outstanding.toLocaleString(), trend: undefined },
        { label: "Total Invoices", value: String(invoices.length), trend: undefined },
    ];
    return (react_1["default"].createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Invoices", description: "Create and manage organization invoices", icon: lucide_react_1.FileText, breadcrumbs: [
            { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
            { label: "Invoices" },
        ], actions: react_1["default"].createElement(button_1.Button, { size: "sm", onClick: function () { return setLocation("/org/" + slug + "/invoices/create"); } },
            react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
            " New Invoice"), backLink: "/org/" + slug + "/dashboard", hasAccess: hasAccess, accessDeniedMessage: "Invoicing is not enabled for your organization plan." },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(SummaryStatCards_1.SummaryStatCards, { cards: summaryStats, isLoading: isLoading }),
            react_1["default"].createElement("div", { className: "space-y-3" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2 flex-wrap" }, TABS.map(function (tab) { return (react_1["default"].createElement(button_1.Button, { key: tab, variant: activeTab === tab ? "default" : "outline", size: "sm", className: "capitalize text-xs", onClick: function () { return setActiveTab(tab); } },
                    tab,
                    react_1["default"].createElement("span", { className: "ml-1.5 text-xs font-normal" },
                        "(",
                        tab === "all" ? invoices.length : invoices.filter(function (i) { var _a; return ((_a = i.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === tab; }).length,
                        ")"))); })),
                react_1["default"].createElement("div", { className: "relative max-w-sm" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    react_1["default"].createElement(input_1.Input, { value: search, onChange: function (e) { return setSearch(e.target.value); }, placeholder: "Search invoices...", className: "pl-9" }))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.FileText, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
                    react_1["default"].createElement("p", { className: "text-muted-foreground text-sm" }, search || activeTab !== "all" ? "No invoices match your filters" : "No invoices yet"))) : (react_1["default"].createElement("div", { className: "divide-y" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-12 px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30" },
                        react_1["default"].createElement("div", { className: "col-span-3" }, "Invoice #"),
                        react_1["default"].createElement("div", { className: "col-span-3" }, "Client"),
                        react_1["default"].createElement("div", { className: "col-span-2" }, "Status"),
                        react_1["default"].createElement("div", { className: "col-span-2 text-right" }, "Total"),
                        react_1["default"].createElement("div", { className: "col-span-2 text-right" }, "Actions")),
                    filtered.map(function (inv) { return (react_1["default"].createElement("div", { key: inv.id, className: "grid grid-cols-12 px-6 py-4 items-center hover:bg-muted/30 transition-colors" },
                        react_1["default"].createElement("div", { className: "col-span-3" },
                            react_1["default"].createElement("p", { className: "text-sm font-medium" }, inv.invoiceNumber),
                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "—")),
                        react_1["default"].createElement("div", { className: "col-span-3" },
                            react_1["default"].createElement("p", { className: "text-sm" }, inv.clientName || "—"),
                            inv.dueDate && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                "Due: ",
                                new Date(inv.dueDate).toLocaleDateString())),
                        react_1["default"].createElement("div", { className: "col-span-2" },
                            react_1["default"].createElement(StatusBadge, { status: inv.status })),
                        react_1["default"].createElement("div", { className: "col-span-2 text-right" },
                            react_1["default"].createElement("p", { className: "text-sm font-semibold" },
                                "KES ",
                                Number(inv.total || 0).toLocaleString()),
                            Number(inv.paidAmount) > 0 && (react_1["default"].createElement("p", { className: "text-xs text-green-600 dark:text-green-400" },
                                "Paid: ",
                                Number(inv.paidAmount).toLocaleString()))),
                        react_1["default"].createElement("div", { className: "col-span-2 flex justify-end gap-1" },
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 px-2", onClick: function () { return setLocation("/org/" + slug + "/invoices/" + inv.id); } },
                                react_1["default"].createElement(lucide_react_1.Eye, { className: "h-3.5 w-3.5" }))))); }))))))));
}
exports["default"] = OrgInvoices;
