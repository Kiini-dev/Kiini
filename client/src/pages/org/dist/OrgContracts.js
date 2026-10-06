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
var STATUS_STYLES = {
    active: "bg-green-500/20 text-green-300 border-green-500/30",
    draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    signed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    expired: "bg-red-500/20 text-red-300 border-red-500/30",
    terminated: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    completed: "bg-teal-500/20 text-teal-300 border-teal-500/30"
};
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "draft").toLowerCase();
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = STATUS_STYLES[s]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, s));
}
function AccessDenied(_a) {
    var slug = _a.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    return (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
        react_1["default"].createElement(card_1.CardContent, { className: "py-20 text-center" },
            react_1["default"].createElement(lucide_react_1.Lock, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
            react_1["default"].createElement("p", { className: "text-white font-semibold text-lg mb-2" }, "Access Restricted"),
            react_1["default"].createElement("p", { className: "text-white/50 text-sm mb-6" }, "Contracts is not enabled for your organization plan."),
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } }, "Back to Dashboard"))));
}
var STATUSES = ["all", "active", "draft", "pending", "signed", "expired", "terminated"];
function OrgContracts() {
    var _a, _b, _c;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _d = wouter_1.useLocation(), setLocation = _d[1];
    var _e = react_1.useState(""), search = _e[0], setSearch = _e[1];
    var _f = react_1.useState("all"), activeStatus = _f[0], setActiveStatus = _f[1];
    var myOrgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var _g = trpc_1.trpc.contracts.list.useQuery({ limit: 100 }, { staleTime: 60000, enabled: !myOrgData || !!featureMap.contracts }), contractsData = _g.data, isLoading = _g.isLoading;
    var accessGranted = !myOrgData || featureMap.contracts;
    var contracts = (_c = (_b = contractsData) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : (Array.isArray(contractsData) ? contractsData : []);
    var filtered = contracts.filter(function (c) {
        var _a, _b, _c, _d, _e;
        var matchStatus = activeStatus === "all" || ((_a = c.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === activeStatus;
        var matchSearch = !search || ((_b = c.title) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) || ((_c = c.contractNumber) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase())) || ((_d = c.clientName) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase())) || ((_e = c.partyName) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(search.toLowerCase()));
        return matchStatus && matchSearch;
    });
    var active = contracts.filter(function (c) { return c.status === "active"; }).length;
    var expiring = contracts.filter(function (c) {
        if (!c.endDate)
            return false;
        var days = (new Date(c.endDate).getTime() - Date.now()) / 86400000;
        return days >= 0 && days <= 30;
    }).length;
    var totalValue = contracts.reduce(function (s, c) { return s + Number(c.value || c.totalValue || 0); }, 0);
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Contracts" },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Contracts" }] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            !accessGranted ? react_1["default"].createElement(AccessDenied, { slug: slug }) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, [
                    { label: "Total Contracts", value: String(contracts.length), color: "from-blue-600/20 to-blue-600/5" },
                    { label: "Active", value: String(active), color: "from-green-600/20 to-green-600/5" },
                    { label: "Expiring (30 days)", value: String(expiring), color: "from-amber-600/20 to-amber-600/5" },
                    { label: "Total Value", value: "KES " + totalValue.toLocaleString(), color: "from-purple-600/20 to-purple-600/5" },
                ].map(function (k) { return (react_1["default"].createElement(card_1.Card, { key: k.label, className: "bg-gradient-to-br " + k.color + " border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-1 pt-4" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-xs font-medium text-white/60" }, k.label)),
                    react_1["default"].createElement(card_1.CardContent, { className: "pb-4" },
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-white" }, k.value)))); })),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 flex-wrap" }, STATUSES.map(function (s) { return (react_1["default"].createElement(button_1.Button, { key: s, variant: "ghost", size: "sm", className: "capitalize text-xs " + (activeStatus === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"), onClick: function () { return setActiveStatus(s); } },
                        s,
                        " ",
                        react_1["default"].createElement("span", { className: "ml-1.5 text-white/30" },
                            "(",
                            s === "all" ? contracts.length : contracts.filter(function (c) { var _a; return ((_a = c.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === s; }).length,
                            ")"))); })),
                    react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                        react_1["default"].createElement("div", { className: "relative flex-1 max-w-sm" },
                            react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" }),
                            react_1["default"].createElement(input_1.Input, { value: search, onChange: function (e) { return setSearch(e.target.value); }, placeholder: "Search contracts...", className: "pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" })),
                        react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700 text-white", onClick: function () { return setLocation("/org/" + slug + "/contracts"); } },
                            react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            " New Contract"))),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 bg-white/5 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                        react_1["default"].createElement(lucide_react_1.FileCheck, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                        react_1["default"].createElement("p", { className: "text-white/40 text-sm" }, search || activeStatus !== "all" ? "No contracts match your filters" : "No contracts yet"))) : (react_1["default"].createElement("div", { className: "divide-y divide-white/5" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-12 px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider" },
                            react_1["default"].createElement("div", { className: "col-span-4" }, "Contract"),
                            react_1["default"].createElement("div", { className: "col-span-3" }, "Party / Client"),
                            react_1["default"].createElement("div", { className: "col-span-2" }, "End Date"),
                            react_1["default"].createElement("div", { className: "col-span-2" }, "Status"),
                            react_1["default"].createElement("div", { className: "col-span-1 text-right" }, "Value")),
                        filtered.map(function (c) {
                            var _a;
                            var isExpiringSoon = c.endDate && (function () {
                                var days = (new Date(c.endDate).getTime() - Date.now()) / 86400000;
                                return days >= 0 && days <= 30;
                            })();
                            return (react_1["default"].createElement("div", { key: c.id, className: "grid grid-cols-12 px-6 py-4 items-center hover:bg-white/5 transition-colors" },
                                react_1["default"].createElement("div", { className: "col-span-4" },
                                    react_1["default"].createElement("p", { className: "text-sm font-medium text-white truncate" }, c.title || c.name || "Untitled"),
                                    react_1["default"].createElement("p", { className: "text-xs text-white/40" }, c.contractNumber || "CON-" + ((_a = c.id) === null || _a === void 0 ? void 0 : _a.slice(0, 8)))),
                                react_1["default"].createElement("div", { className: "col-span-3" },
                                    react_1["default"].createElement("p", { className: "text-sm text-white/70 truncate" }, c.clientName || c.partyName || c.counterparty || "—")),
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement("p", { className: "text-sm " + (isExpiringSoon ? "text-amber-400 font-medium" : "text-white/60") }, c.endDate ? new Date(c.endDate).toLocaleDateString() : "—"),
                                    isExpiringSoon && react_1["default"].createElement("p", { className: "text-xs text-amber-400/70" }, "Expiring soon")),
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement(StatusBadge, { status: c.status })),
                                react_1["default"].createElement("div", { className: "col-span-1 text-right" },
                                    react_1["default"].createElement("p", { className: "text-xs text-white/60" }, c.value || c.totalValue ? (Number(c.value || c.totalValue) / 1000).toFixed(0) + "K" : "—"))));
                        }))))))))));
}
exports["default"] = OrgContracts;
