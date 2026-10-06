"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
var DEPT_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "active").toLowerCase();
    var map = {
        active: "bg-green-500/20 text-green-300 border-green-500/30",
        inactive: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        on_leave: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        terminated: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border " + ((_b = map[s]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, s.replace(/_/g, " ")));
}
function OrgHR() {
    var _a, _b;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var _d = react_1.useState(""), search = _d[0], setSearch = _d[1];
    var orgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = orgData === null || orgData === void 0 ? void 0 : orgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var hasAccess = !orgData || featureMap.hr;
    var _e = trpc_1.trpc.employees.list.useQuery(undefined, {
        staleTime: 60000,
        enabled: !!hasAccess
    }), _f = _e.data, employees = _f === void 0 ? [] : _f, isLoading = _e.isLoading;
    var analytics = trpc_1.trpc.multiTenancy.getOrgAnalytics.useQuery(undefined, {
        staleTime: 60000,
        enabled: !!hasAccess
    }).data;
    var filtered = employees.filter(function (emp) {
        var _a, _b, _c, _d, _e;
        return !search || ((_a = emp.firstName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) || ((_b = emp.lastName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) || ((_c = emp.email) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase())) || ((_d = emp.department) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase())) || ((_e = emp.position) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(search.toLowerCase()));
    });
    var activeCount = employees.filter(function (e) { return e.status === "active" || !e.status; }).length;
    var departments = __spreadArrays(new Set(employees.map(function (e) { return e.department; }).filter(Boolean))).length;
    var deptChart = (_b = analytics === null || analytics === void 0 ? void 0 : analytics.employeeDeptChart) !== null && _b !== void 0 ? _b : [];
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "HR \u2014 Employees", showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "HR" }] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            !hasAccess && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardContent, { className: "py-20 text-center" },
                    react_1["default"].createElement(lucide_react_1.Lock, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
                    react_1["default"].createElement("p", { className: "text-white font-semibold text-lg mb-2" }, "Access Restricted"),
                    react_1["default"].createElement("p", { className: "text-white/50 text-sm mb-6" }, "HR is not enabled for your organization plan."),
                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } }, "Back to Dashboard")))),
            hasAccess && (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, [
                    { label: "Total Employees", value: String(employees.length), color: "from-indigo-600/20 to-indigo-600/5" },
                    { label: "Active", value: String(activeCount), color: "from-green-600/20 to-green-600/5" },
                    { label: "Departments", value: String(departments), color: "from-blue-600/20 to-blue-600/5" },
                    { label: "Showing", value: String(filtered.length), color: "from-white/10 to-white/5" },
                ].map(function (k) { return (react_1["default"].createElement(card_1.Card, { key: k.label, className: "bg-gradient-to-br " + k.color + " border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-1 pt-4" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-xs font-medium text-white/60" }, k.label)),
                    react_1["default"].createElement(card_1.CardContent, { className: "pb-4" },
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-white" }, k.value)))); })),
                deptChart.length > 0 && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-base text-white" }, "Employees by Department")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 200 },
                            react_1["default"].createElement(recharts_1.PieChart, null,
                                react_1["default"].createElement(recharts_1.Pie, { data: deptChart, cx: "50%", cy: "50%", outerRadius: 80, paddingAngle: 3, dataKey: "value", label: function (_a) {
                                        var name = _a.name, value = _a.value;
                                        return name + ": " + value;
                                    }, labelLine: false }, deptChart.map(function (_, index) { return (react_1["default"].createElement(recharts_1.Cell, { key: index, fill: DEPT_COLORS[index % DEPT_COLORS.length] })); })),
                                react_1["default"].createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: "#1e293b", border: "none", borderRadius: 8, fontSize: 12 } }),
                                react_1["default"].createElement(recharts_1.Legend, { wrapperStyle: { color: "rgba(255,255,255,0.5)", fontSize: 11 } })))))),
                react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                    react_1["default"].createElement("div", { className: "relative flex-1 max-w-sm" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" }),
                        react_1["default"].createElement(input_1.Input, { value: search, onChange: function (e) { return setSearch(e.target.value); }, placeholder: "Search employees...", className: "pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" })),
                    react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700 text-white", onClick: function () { return setLocation("/org/" + slug + "/staff"); } },
                        react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        " Add Employee")),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 bg-white/5 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                        react_1["default"].createElement(lucide_react_1.UserCog, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                        react_1["default"].createElement("p", { className: "text-white/40 text-sm" }, search ? "No employees match your search" : "No employees yet"))) : (react_1["default"].createElement("div", { className: "divide-y divide-white/5" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-12 px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider" },
                            react_1["default"].createElement("div", { className: "col-span-4" }, "Employee"),
                            react_1["default"].createElement("div", { className: "col-span-3" }, "Department / Role"),
                            react_1["default"].createElement("div", { className: "col-span-3" }, "Contact"),
                            react_1["default"].createElement("div", { className: "col-span-2" }, "Status")),
                        filtered.map(function (emp) {
                            var _a, _b;
                            var fullName = [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.name || "Unknown";
                            return (react_1["default"].createElement("div", { key: emp.id, className: "grid grid-cols-12 px-6 py-4 items-center hover:bg-white/5 transition-colors" },
                                react_1["default"].createElement("div", { className: "col-span-4" },
                                    react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                                        react_1["default"].createElement("div", { className: "h-8 w-8 rounded-full bg-indigo-600/30 flex items-center justify-center" },
                                            react_1["default"].createElement("span", { className: "text-xs font-bold text-indigo-300" }, (_b = (_a = fullName[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : "?")),
                                        react_1["default"].createElement("div", null,
                                            react_1["default"].createElement("p", { className: "text-sm font-medium text-white" }, fullName),
                                            react_1["default"].createElement("p", { className: "text-xs text-white/40" }, emp.employeeNumber || "EMP-" + emp.id)))),
                                react_1["default"].createElement("div", { className: "col-span-3" },
                                    emp.department && (react_1["default"].createElement("p", { className: "text-sm text-white/70 flex items-center gap-1" },
                                        react_1["default"].createElement(lucide_react_1.Building2, { className: "h-3 w-3 text-white/30" }),
                                        " ",
                                        emp.department)),
                                    emp.position && react_1["default"].createElement("p", { className: "text-xs text-white/40" }, emp.position)),
                                react_1["default"].createElement("div", { className: "col-span-3" },
                                    emp.email && react_1["default"].createElement("p", { className: "text-xs text-white/60 flex items-center gap-1" },
                                        react_1["default"].createElement(lucide_react_1.Mail, { className: "h-3 w-3" }),
                                        " ",
                                        emp.email),
                                    emp.phone && react_1["default"].createElement("p", { className: "text-xs text-white/60 flex items-center gap-1 mt-0.5" },
                                        react_1["default"].createElement(lucide_react_1.Phone, { className: "h-3 w-3" }),
                                        " ",
                                        emp.phone)),
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement(StatusBadge, { status: emp.status }))));
                        }))))))))));
}
exports["default"] = OrgHR;
