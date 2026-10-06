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
            react_1["default"].createElement("p", { className: "text-white/50 text-sm mb-6" }, "Attendance is not enabled for your organization plan."),
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } }, "Back to Dashboard"))));
}
function durationHours(checkIn, checkOut) {
    if (!checkIn || !checkOut)
        return "—";
    try {
        var diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 3600000;
        if (diff < 0)
            return "—";
        return diff.toFixed(1) + "h";
    }
    catch (_a) {
        return "—";
    }
}
function OrgAttendance() {
    var _a;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(""), search = _c[0], setSearch = _c[1];
    var myOrgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var _d = trpc_1.trpc.attendance.list.useQuery({ limit: 100 }, { staleTime: 60000, enabled: !myOrgData || !!featureMap.attendance }), _e = _d.data, records = _e === void 0 ? [] : _e, isLoading = _d.isLoading;
    var accessGranted = !myOrgData || featureMap.attendance;
    var filtered = records.filter(function (r) {
        var _a, _b;
        return !search || ((_a = r.employeeName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) || ((_b = r.employeeId) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase()));
    });
    var today = new Date().toDateString();
    var todayCount = records.filter(function (r) { return r.checkIn && new Date(r.checkIn).toDateString() === today; }).length;
    var checkedOut = records.filter(function (r) { return r.checkOut; }).length;
    var stillIn = records.filter(function (r) { return r.checkIn && !r.checkOut; }).length;
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Attendance" },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Attendance" }] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            !accessGranted ? react_1["default"].createElement(AccessDenied, { slug: slug }) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, [
                    { label: "Total Records", value: String(records.length), color: "from-blue-600/20 to-blue-600/5" },
                    { label: "Today's Check-ins", value: String(todayCount), color: "from-green-600/20 to-green-600/5" },
                    { label: "Still Checked In", value: String(stillIn), color: "from-amber-600/20 to-amber-600/5" },
                    { label: "Checked Out", value: String(checkedOut), color: "from-slate-600/20 to-slate-600/5" },
                ].map(function (k) { return (react_1["default"].createElement(card_1.Card, { key: k.label, className: "bg-gradient-to-br " + k.color + " border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-1 pt-4" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-xs font-medium text-white/60" }, k.label)),
                    react_1["default"].createElement(card_1.CardContent, { className: "pb-4" },
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-white" }, k.value)))); })),
                react_1["default"].createElement("div", { className: "relative max-w-sm" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" }),
                    react_1["default"].createElement(input_1.Input, { value: search, onChange: function (e) { return setSearch(e.target.value); }, placeholder: "Search by employee...", className: "pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" })),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 8 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 bg-white/5 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                        react_1["default"].createElement(lucide_react_1.Clock, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                        react_1["default"].createElement("p", { className: "text-white/40 text-sm" }, search ? "No records match your search" : "No attendance records yet"))) : (react_1["default"].createElement("div", { className: "divide-y divide-white/5" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-12 px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider" },
                            react_1["default"].createElement("div", { className: "col-span-4" }, "Employee"),
                            react_1["default"].createElement("div", { className: "col-span-3" }, "Check In"),
                            react_1["default"].createElement("div", { className: "col-span-3" }, "Check Out"),
                            react_1["default"].createElement("div", { className: "col-span-1" }, "Hours"),
                            react_1["default"].createElement("div", { className: "col-span-1 text-center" }, "Status")),
                        filtered.map(function (r) { return (react_1["default"].createElement("div", { key: r.id, className: "grid grid-cols-12 px-6 py-3 items-center hover:bg-white/5 transition-colors" },
                            react_1["default"].createElement("div", { className: "col-span-4" },
                                react_1["default"].createElement("p", { className: "text-sm font-medium text-white" }, r.employeeName || r.employeeId || "Unknown"),
                                react_1["default"].createElement("p", { className: "text-xs text-white/40" }, r.date ? new Date(r.date).toLocaleDateString() : "—")),
                            react_1["default"].createElement("div", { className: "col-span-3" },
                                react_1["default"].createElement("p", { className: "text-sm text-white/70" }, r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—")),
                            react_1["default"].createElement("div", { className: "col-span-3" },
                                react_1["default"].createElement("p", { className: "text-sm text-white/70" }, r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—")),
                            react_1["default"].createElement("div", { className: "col-span-1" },
                                react_1["default"].createElement("p", { className: "text-sm text-white/60" }, durationHours(r.checkIn, r.checkOut))),
                            react_1["default"].createElement("div", { className: "col-span-1 flex justify-center" }, r.checkOut
                                ? react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-400" })
                                : r.checkIn
                                    ? react_1["default"].createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-amber-400" })
                                    : react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-4 w-4 text-white/30" })))); }))))))))));
}
exports["default"] = OrgAttendance;
