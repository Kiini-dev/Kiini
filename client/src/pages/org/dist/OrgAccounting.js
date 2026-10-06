"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
var recharts_1 = require("recharts");
var TYPE_COLORS = {
    asset: "#22c55e",
    liability: "#ef4444",
    equity: "#8b5cf6",
    revenue: "#3b82f6",
    expense: "#f59e0b",
    "cost of goods sold": "#06b6d4",
    "operating expense": "#ec4899",
    "capital expenditure": "#14b8a6",
    "other income": "#a3e635",
    "other expense": "#fb923c"
};
var ACCOUNT_TYPES = ["all", "asset", "liability", "equity", "revenue", "expense"];
function Badge(_a) {
    var _b;
    var type = _a.type;
    var color = (_b = TYPE_COLORS[type]) !== null && _b !== void 0 ? _b : "#6b7280";
    return (react_1["default"].createElement("span", { style: { backgroundColor: color + "33", color: color, borderColor: color + "55" }, className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize" }, type));
}
function AccessDenied(_a) {
    var slug = _a.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    return (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
        react_1["default"].createElement(card_1.CardContent, { className: "py-20 text-center" },
            react_1["default"].createElement(lucide_react_1.Lock, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
            react_1["default"].createElement("p", { className: "text-white font-semibold text-lg mb-2" }, "Access Restricted"),
            react_1["default"].createElement("p", { className: "text-white/50 text-sm mb-6" }, "Accounting is not enabled for your organization plan."),
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } }, "Back to Dashboard"))));
}
function OrgAccounting() {
    var _a;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(""), search = _c[0], setSearch = _c[1];
    var _d = react_1.useState("all"), activeType = _d[0], setActiveType = _d[1];
    var myOrgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var _e = trpc_1.trpc.chartOfAccounts.list.useQuery({ limit: 200 }, { staleTime: 60000, enabled: !!featureMap.accounting }), _f = _e.data, accounts = _f === void 0 ? [] : _f, isLoading = _e.isLoading;
    var filtered = accounts.filter(function (acc) {
        var _a, _b, _c, _d;
        var matchType = activeType === "all" || ((_a = acc.type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === activeType;
        var matchSearch = !search || ((_b = acc.code) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) || ((_c = acc.name) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase())) || ((_d = acc.type) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase()));
        return matchType && matchSearch;
    });
    // Chart: account count by type
    var typeGroups = accounts.reduce(function (acc, a) {
        var t = a.type || "other";
        acc[t] = (acc[t] || 0) + 1;
        return acc;
    }, {});
    var chartData = Object.entries(typeGroups).map(function (_a) {
        var name = _a[0], value = _a[1];
        return ({ name: name, value: value });
    });
    var totalAccounts = accounts.length;
    var assetCount = accounts.filter(function (a) { return a.type === "asset"; }).length;
    var revenueCount = accounts.filter(function (a) { return a.type === "revenue"; }).length;
    var expCount = accounts.filter(function (a) { return a.type === "expense" || a.type === "operating expense"; }).length;
    var accessGranted = !myOrgData || featureMap.accounting;
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Accounting" },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Accounting" }] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            !accessGranted ? react_1["default"].createElement(AccessDenied, { slug: slug }) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, [
                    { label: "Total Accounts", value: String(totalAccounts), color: "from-blue-600/20 to-blue-600/5" },
                    { label: "Asset Accounts", value: String(assetCount), color: "from-green-600/20 to-green-600/5" },
                    { label: "Revenue Accounts", value: String(revenueCount), color: "from-purple-600/20 to-purple-600/5" },
                    { label: "Expense Accounts", value: String(expCount), color: "from-amber-600/20 to-amber-600/5" },
                ].map(function (k) { return (react_1["default"].createElement(card_1.Card, { key: k.label, className: "bg-gradient-to-br " + k.color + " border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-1 pt-4" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-xs font-medium text-white/60" }, k.label)),
                    react_1["default"].createElement(card_1.CardContent, { className: "pb-4" },
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-white" }, k.value)))); })),
                chartData.length > 0 && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-base text-white" }, "Accounts by Type")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 180 },
                            react_1["default"].createElement(recharts_1.BarChart, { data: chartData, margin: { top: 4, right: 8, left: 0, bottom: 0 } },
                                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.05)" }),
                                react_1["default"].createElement(recharts_1.XAxis, { dataKey: "name", tick: { fill: "rgba(255,255,255,0.4)", fontSize: 10 }, axisLine: false, tickLine: false }),
                                react_1["default"].createElement(recharts_1.YAxis, { tick: { fill: "rgba(255,255,255,0.4)", fontSize: 11 }, axisLine: false, tickLine: false }),
                                react_1["default"].createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: "#1e293b", border: "none", borderRadius: 8, fontSize: 12 }, formatter: function (value) { return [value, "Accounts"]; } }),
                                react_1["default"].createElement(recharts_1.Bar, { dataKey: "value", radius: [4, 4, 0, 0] }, chartData.map(function (entry, i) {
                                    var _a;
                                    return (react_1["default"].createElement(recharts_1.Cell, { key: i, fill: (_a = TYPE_COLORS[entry.name]) !== null && _a !== void 0 ? _a : "#6b7280" }));
                                }))))))),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 flex-wrap" }, ACCOUNT_TYPES.map(function (t) { return (react_1["default"].createElement(button_1.Button, { key: t, variant: "ghost", size: "sm", className: "capitalize text-xs " + (activeType === t ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"), onClick: function () { return setActiveType(t); } },
                        t,
                        " ",
                        react_1["default"].createElement("span", { className: "ml-1.5 text-white/30" },
                            "(",
                            t === "all" ? accounts.length : accounts.filter(function (a) { var _a; return ((_a = a.type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === t; }).length,
                            ")"))); })),
                    react_1["default"].createElement("div", { className: "relative max-w-sm" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" }),
                        react_1["default"].createElement(input_1.Input, { value: search, onChange: function (e) { return setSearch(e.target.value); }, placeholder: "Search accounts...", className: "pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" }))),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 8 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-10 bg-white/5 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                        react_1["default"].createElement(lucide_react_1.BookOpen, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                        react_1["default"].createElement("p", { className: "text-white/40 text-sm" }, search || activeType !== "all" ? "No accounts match your filters" : "No accounts yet"))) : (react_1["default"].createElement("div", { className: "divide-y divide-white/5" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-12 px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider" },
                            react_1["default"].createElement("div", { className: "col-span-2" }, "Code"),
                            react_1["default"].createElement("div", { className: "col-span-5" }, "Account Name"),
                            react_1["default"].createElement("div", { className: "col-span-3" }, "Type"),
                            react_1["default"].createElement("div", { className: "col-span-2 text-right" }, "Balance")),
                        filtered.map(function (acc) { return (react_1["default"].createElement("div", { key: acc.id, className: "grid grid-cols-12 px-6 py-3 items-center hover:bg-white/5 transition-colors" },
                            react_1["default"].createElement("div", { className: "col-span-2" },
                                react_1["default"].createElement("p", { className: "text-sm font-mono text-white/70" }, acc.code || "—")),
                            react_1["default"].createElement("div", { className: "col-span-5" },
                                react_1["default"].createElement("p", { className: "text-sm font-medium text-white" }, acc.name),
                                acc.description && react_1["default"].createElement("p", { className: "text-xs text-white/40 truncate" }, acc.description)),
                            react_1["default"].createElement("div", { className: "col-span-3" },
                                react_1["default"].createElement(Badge, { type: acc.type || "other" })),
                            react_1["default"].createElement("div", { className: "col-span-2 text-right" },
                                react_1["default"].createElement("p", { className: "text-sm font-semibold text-white" }, acc.balance !== undefined ? "KES " + Number(acc.balance).toLocaleString() : "—")))); }))))))))));
}
exports["default"] = OrgAccounting;
