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
    approved: "bg-green-500/20 text-green-300 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    rejected: "bg-red-500/20 text-red-300 border-red-500/30",
    cancelled: "bg-slate-500/20 text-slate-300 border-slate-500/30"
};
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "pending").toLowerCase();
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = STATUS_STYLES[s]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, s));
}
function AccessDenied(_a) {
    var slug = _a.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    return (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
        react_1["default"].createElement(card_1.CardContent, { className: "py-20 text-center" },
            react_1["default"].createElement(lucide_react_1.Lock, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
            react_1["default"].createElement("p", { className: "text-white font-semibold text-lg mb-2" }, "Access Restricted"),
            react_1["default"].createElement("p", { className: "text-white/50 text-sm mb-6" }, "Leave Management is not enabled for your organization plan."),
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } }, "Back to Dashboard"))));
}
var STATUSES = ["all", "pending", "approved", "rejected", "cancelled"];
var LEAVE_TYPES = ["all", "annual", "sick", "maternity", "paternity", "unpaid", "study", "compassionate"];
function OrgLeave() {
    var _a;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(""), search = _c[0], setSearch = _c[1];
    var _d = react_1.useState("all"), activeStatus = _d[0], setActiveStatus = _d[1];
    var myOrgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var _e = trpc_1.trpc.leave.list.useQuery({ limit: 100 }, { staleTime: 60000, enabled: !myOrgData || !!featureMap.leave }), _f = _e.data, leaves = _f === void 0 ? [] : _f, isLoading = _e.isLoading;
    var accessGranted = !myOrgData || featureMap.leave;
    var filtered = leaves.filter(function (l) {
        var _a, _b, _c, _d;
        var matchStatus = activeStatus === "all" || ((_a = l.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === activeStatus;
        var matchSearch = !search || ((_b = l.employeeName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) || ((_c = l.leaveType) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase())) || ((_d = l.reason) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase()));
        return matchStatus && matchSearch;
    });
    var pending = leaves.filter(function (l) { return l.status === "pending"; }).length;
    var approved = leaves.filter(function (l) { return l.status === "approved"; }).length;
    var totalDays = leaves.reduce(function (s, l) {
        if (!l.startDate || !l.endDate)
            return s;
        var diff = (new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000;
        return s + Math.max(0, diff + 1);
    }, 0);
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Leave Management" },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Leave" }] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            !accessGranted ? react_1["default"].createElement(AccessDenied, { slug: slug }) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, [
                    { label: "Total Requests", value: String(leaves.length), color: "from-blue-600/20 to-blue-600/5" },
                    { label: "Pending", value: String(pending), color: "from-yellow-600/20 to-yellow-600/5" },
                    { label: "Approved", value: String(approved), color: "from-green-600/20 to-green-600/5" },
                    { label: "Total Days Off", value: String(Math.round(totalDays)), color: "from-indigo-600/20 to-indigo-600/5" },
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
                            s === "all" ? leaves.length : leaves.filter(function (l) { var _a; return ((_a = l.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === s; }).length,
                            ")"))); })),
                    react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                        react_1["default"].createElement("div", { className: "relative flex-1 max-w-sm" },
                            react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" }),
                            react_1["default"].createElement(input_1.Input, { value: search, onChange: function (e) { return setSearch(e.target.value); }, placeholder: "Search by employee or leave type...", className: "pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" })),
                        react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700 text-white", onClick: function () { return setLocation("/org/" + slug + "/leave"); } },
                            react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            " New Request"))),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 bg-white/5 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                        react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                        react_1["default"].createElement("p", { className: "text-white/40 text-sm" }, search || activeStatus !== "all" ? "No leave requests match your filters" : "No leave requests yet"))) : (react_1["default"].createElement("div", { className: "divide-y divide-white/5" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-12 px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider" },
                            react_1["default"].createElement("div", { className: "col-span-4" }, "Employee"),
                            react_1["default"].createElement("div", { className: "col-span-2" }, "Leave Type"),
                            react_1["default"].createElement("div", { className: "col-span-3" }, "Dates"),
                            react_1["default"].createElement("div", { className: "col-span-2" }, "Status"),
                            react_1["default"].createElement("div", { className: "col-span-1 text-right" }, "Days")),
                        filtered.map(function (l) {
                            var days = l.startDate && l.endDate
                                ? Math.max(1, Math.round((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1)
                                : "—";
                            return (react_1["default"].createElement("div", { key: l.id, className: "grid grid-cols-12 px-6 py-3 items-center hover:bg-white/5 transition-colors" },
                                react_1["default"].createElement("div", { className: "col-span-4" },
                                    react_1["default"].createElement("p", { className: "text-sm font-medium text-white" }, l.employeeName || "Unknown"),
                                    react_1["default"].createElement("p", { className: "text-xs text-white/40" }, l.employeeEmail || "—")),
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement("p", { className: "text-sm text-white/70 capitalize" }, l.leaveType || "Annual")),
                                react_1["default"].createElement("div", { className: "col-span-3" },
                                    react_1["default"].createElement("p", { className: "text-xs text-white/60" },
                                        l.startDate ? new Date(l.startDate).toLocaleDateString() : "—",
                                        l.endDate && " \u2013 " + new Date(l.endDate).toLocaleDateString())),
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement(StatusBadge, { status: l.status })),
                                react_1["default"].createElement("div", { className: "col-span-1 text-right" },
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, days))));
                        }))))))))));
}
exports["default"] = OrgLeave;
