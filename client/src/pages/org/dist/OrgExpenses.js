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
var recharts_1 = require("recharts");
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "pending").toLowerCase();
    var map = {
        approved: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
        pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
        rejected: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
        draft: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
        paid: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border " + ((_b = map[s]) !== null && _b !== void 0 ? _b : "bg-muted text-muted-foreground border-border") }, s));
}
var TABS = ["all", "pending", "approved", "rejected", "draft"];
function OrgExpenses() {
    var _a, _b, _c;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _d = wouter_1.useLocation(), setLocation = _d[1];
    var _e = react_1.useState(""), search = _e[0], setSearch = _e[1];
    var _f = react_1.useState("all"), activeTab = _f[0], setActiveTab = _f[1];
    var orgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = orgData === null || orgData === void 0 ? void 0 : orgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var hasAccess = !orgData || featureMap.expenses;
    var _g = trpc_1.trpc.expenses.list.useQuery(undefined, {
        staleTime: 60000,
        enabled: !!hasAccess
    }), _h = _g.data, expenses = _h === void 0 ? [] : _h, isLoading = _g.isLoading;
    var analytics = trpc_1.trpc.multiTenancy.getOrgAnalytics.useQuery(undefined, {
        staleTime: 60000,
        enabled: !!hasAccess
    }).data;
    var filtered = expenses.filter(function (exp) {
        var _a, _b, _c, _d;
        var matchTab = activeTab === "all" || ((_a = exp.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === activeTab;
        var matchSearch = !search || ((_b = exp.expenseNumber) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) || ((_c = exp.category) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase())) || ((_d = exp.description) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase()));
        return matchTab && matchSearch;
    });
    var total = expenses.reduce(function (sum, e) { return sum + Number(e.amount || 0); }, 0);
    var pending = expenses.filter(function (e) { return e.status === "pending"; }).length;
    var approved = expenses.filter(function (e) { return e.status === "approved"; }).length;
    var categoryChart = (_c = (_b = analytics === null || analytics === void 0 ? void 0 : analytics.expenseCategoryChart) === null || _b === void 0 ? void 0 : _b.slice(0, 8)) !== null && _c !== void 0 ? _c : [];
    // Summary stats for ModuleLayout
    var summaryStats = [
        { label: "Total Expenses", value: "KES " + total.toLocaleString(), trend: undefined },
        { label: "Total Records", value: String(expenses.length), trend: undefined },
        { label: "Pending Approval", value: String(pending), trend: undefined },
        { label: "Approved", value: String(approved), trend: undefined },
    ];
    return (react_1["default"].createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Expenses", description: "Track and manage organization expenses", icon: lucide_react_1.Receipt, breadcrumbs: [
            { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
            { label: "Expenses" },
        ], actions: react_1["default"].createElement(button_1.Button, { size: "sm", onClick: function () { return setLocation("/org/" + slug + "/expenses/create"); } },
            react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
            " New Expense"), backLink: "/org/" + slug + "/dashboard", hasAccess: hasAccess, accessDeniedMessage: "Expenses is not enabled for your organization plan." },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(SummaryStatCards_1.SummaryStatCards, { cards: summaryStats, isLoading: isLoading }),
            categoryChart.length > 0 && (react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Expenses by Category")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 180 },
                        react_1["default"].createElement(recharts_1.BarChart, { data: categoryChart, margin: { top: 4, right: 8, left: 0, bottom: 0 } },
                            react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }),
                            react_1["default"].createElement(recharts_1.XAxis, { dataKey: "name", tick: { fill: "hsl(var(--muted-foreground))", fontSize: 11 }, axisLine: false, tickLine: false }),
                            react_1["default"].createElement(recharts_1.YAxis, { tick: { fill: "hsl(var(--muted-foreground))", fontSize: 11 }, axisLine: false, tickLine: false, tickFormatter: function (v) { return (v / 1000).toFixed(0) + "K"; } }),
                            react_1["default"].createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }, formatter: function (value) { return ["KES " + value.toLocaleString(), "Amount"]; } }),
                            react_1["default"].createElement(recharts_1.Bar, { dataKey: "value", fill: "#ef4444", radius: [4, 4, 0, 0] })))))),
            react_1["default"].createElement("div", { className: "space-y-3" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2 flex-wrap" }, TABS.map(function (tab) { return (react_1["default"].createElement(button_1.Button, { key: tab, variant: activeTab === tab ? "default" : "outline", size: "sm", className: "capitalize text-xs", onClick: function () { return setActiveTab(tab); } },
                    tab,
                    react_1["default"].createElement("span", { className: "ml-1.5 text-xs font-normal" },
                        "(",
                        tab === "all" ? expenses.length : expenses.filter(function (e) { var _a; return ((_a = e.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === tab; }).length,
                        ")"))); })),
                react_1["default"].createElement("div", { className: "relative max-w-sm" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    react_1["default"].createElement(input_1.Input, { value: search, onChange: function (e) { return setSearch(e.target.value); }, placeholder: "Search expenses...", className: "pl-9" }))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.Receipt, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
                    react_1["default"].createElement("p", { className: "text-muted-foreground text-sm" }, search || activeTab !== "all" ? "No expenses match your filters" : "No expenses yet"))) : (react_1["default"].createElement("div", { className: "divide-y" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-12 px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30" },
                        react_1["default"].createElement("div", { className: "col-span-3" }, "Expense #"),
                        react_1["default"].createElement("div", { className: "col-span-3" }, "Category"),
                        react_1["default"].createElement("div", { className: "col-span-2" }, "Date"),
                        react_1["default"].createElement("div", { className: "col-span-2" }, "Status"),
                        react_1["default"].createElement("div", { className: "col-span-2 text-right" }, "Amount")),
                    filtered.map(function (exp) { return (react_1["default"].createElement("div", { key: exp.id, className: "grid grid-cols-12 px-6 py-4 items-center hover:bg-muted/30 transition-colors" },
                        react_1["default"].createElement("div", { className: "col-span-3" },
                            react_1["default"].createElement("p", { className: "text-sm font-medium" }, exp.expenseNumber || "EXP-" + exp.id),
                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground truncate" }, exp.description || "—")),
                        react_1["default"].createElement("div", { className: "col-span-3" },
                            react_1["default"].createElement("p", { className: "text-sm capitalize" }, exp.category || "General")),
                        react_1["default"].createElement("div", { className: "col-span-2" },
                            react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString() : "—")),
                        react_1["default"].createElement("div", { className: "col-span-2" },
                            react_1["default"].createElement(StatusBadge, { status: exp.status })),
                        react_1["default"].createElement("div", { className: "col-span-2 text-right" },
                            react_1["default"].createElement("p", { className: "text-sm font-semibold" },
                                "KES ",
                                Number(exp.amount || 0).toLocaleString())))); }))))))));
}
exports["default"] = OrgExpenses;
