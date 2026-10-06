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
function AccessDenied(_a) {
    var slug = _a.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    return (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
        react_1["default"].createElement(card_1.CardContent, { className: "py-20 text-center" },
            react_1["default"].createElement(lucide_react_1.Lock, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
            react_1["default"].createElement("p", { className: "text-white font-semibold text-lg mb-2" }, "Access Restricted"),
            react_1["default"].createElement("p", { className: "text-white/50 text-sm mb-6" }, "Budgets is not enabled for your organization plan."),
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } }, "Back to Dashboard"))));
}
function BudgetBar(_a) {
    var allocated = _a.allocated, remaining = _a.remaining;
    var spent = allocated - remaining;
    var pct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
    var color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500";
    return (react_1["default"].createElement("div", { className: "space-y-1" },
        react_1["default"].createElement("div", { className: "flex items-center justify-between text-xs text-white/50" },
            react_1["default"].createElement("span", null,
                pct,
                "% used"),
            react_1["default"].createElement("span", null,
                "KES ",
                remaining.toLocaleString(),
                " left")),
        react_1["default"].createElement("div", { className: "h-1.5 bg-white/10 rounded-full overflow-hidden" },
            react_1["default"].createElement("div", { className: "h-full " + color + " rounded-full", style: { width: pct + "%" } }))));
}
function OrgBudgets() {
    var _a;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(""), search = _c[0], setSearch = _c[1];
    var myOrgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var _d = trpc_1.trpc.budgets.list.useQuery(undefined, { staleTime: 60000, enabled: !myOrgData || !!featureMap.budgets }), _e = _d.data, budgets = _e === void 0 ? [] : _e, isLoading = _d.isLoading;
    var accessGranted = !myOrgData || featureMap.budgets;
    var filtered = budgets.filter(function (b) {
        var _a, _b;
        return !search || ((_a = b.departmentName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) || ((_b = String(b.fiscalYear)) === null || _b === void 0 ? void 0 : _b.includes(search));
    });
    var total = budgets.reduce(function (s, b) { return s + Number(b.amount || 0); }, 0);
    var totalRemaining = budgets.reduce(function (s, b) { return s + Number(b.remaining || 0); }, 0);
    var totalSpent = total - totalRemaining;
    var currentYear = new Date().getFullYear();
    var thisYear = budgets.filter(function (b) { return b.fiscalYear === currentYear; }).length;
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Budgets" },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Budgets" }] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            !accessGranted ? react_1["default"].createElement(AccessDenied, { slug: slug }) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, [
                    { label: "Total Budgeted", value: "KES " + (total / 100).toLocaleString(), color: "from-blue-600/20 to-blue-600/5" },
                    { label: "Total Spent", value: "KES " + (totalSpent / 100).toLocaleString(), color: "from-red-600/20 to-red-600/5" },
                    { label: "Total Remaining", value: "KES " + (totalRemaining / 100).toLocaleString(), color: "from-green-600/20 to-green-600/5" },
                    { label: "FY " + currentYear + " Budgets", value: String(thisYear), color: "from-white/10 to-white/5" },
                ].map(function (k) { return (react_1["default"].createElement(card_1.Card, { key: k.label, className: "bg-gradient-to-br " + k.color + " border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-1 pt-4" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-xs font-medium text-white/60" }, k.label)),
                    react_1["default"].createElement(card_1.CardContent, { className: "pb-4" },
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-white" }, k.value)))); })),
                react_1["default"].createElement("div", { className: "relative max-w-sm" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" }),
                    react_1["default"].createElement(input_1.Input, { value: search, onChange: function (e) { return setSearch(e.target.value); }, placeholder: "Search by department or year...", className: "pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" })),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-4" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-16 bg-white/5 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                        react_1["default"].createElement(lucide_react_1.Target, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                        react_1["default"].createElement("p", { className: "text-white/40 text-sm" }, search ? "No budgets match your search" : "No budgets yet"))) : (react_1["default"].createElement("div", { className: "divide-y divide-white/5" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-12 px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider" },
                            react_1["default"].createElement("div", { className: "col-span-4" }, "Department"),
                            react_1["default"].createElement("div", { className: "col-span-2" }, "Fiscal Year"),
                            react_1["default"].createElement("div", { className: "col-span-2 text-right" }, "Allocated"),
                            react_1["default"].createElement("div", { className: "col-span-4" }, "Usage")),
                        filtered.map(function (b) {
                            var _a, _b;
                            return (react_1["default"].createElement("div", { key: b.id, className: "grid grid-cols-12 px-6 py-4 items-center hover:bg-white/5 transition-colors" },
                                react_1["default"].createElement("div", { className: "col-span-4" },
                                    react_1["default"].createElement("p", { className: "text-sm font-medium text-white" }, b.departmentName || "General")),
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, b.fiscalYear || "—")),
                                react_1["default"].createElement("div", { className: "col-span-2 text-right" },
                                    react_1["default"].createElement("p", { className: "text-sm font-semibold text-white" },
                                        "KES ",
                                        (Number(b.amount || 0) / 100).toLocaleString())),
                                react_1["default"].createElement("div", { className: "col-span-4 pl-4" },
                                    react_1["default"].createElement(BudgetBar, { allocated: Number(b.amount || 0), remaining: Number((_b = (_a = b.remaining) !== null && _a !== void 0 ? _a : b.amount) !== null && _b !== void 0 ? _b : 0) }))));
                        }))))))))));
}
exports["default"] = OrgBudgets;
