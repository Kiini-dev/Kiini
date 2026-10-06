"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var stats_card_1 = require("@/components/ui/stats-card");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var progress_1 = require("@/components/ui/progress");
var LEAVE_TYPES = {
    annual: { label: "Annual Leave", icon: lucide_react_1.TreePalm, color: "text-green-500" },
    sick: { label: "Sick Leave", icon: lucide_react_1.HeartPulse, color: "text-red-500" },
    maternity: { label: "Maternity", icon: lucide_react_1.Baby, color: "text-pink-500" },
    paternity: { label: "Paternity", icon: lucide_react_1.Baby, color: "text-blue-500" },
    compassionate: { label: "Compassionate", icon: lucide_react_1.Umbrella, color: "text-purple-500" },
    unpaid: { label: "Unpaid", icon: lucide_react_1.CalendarDays, color: "text-gray-500" },
    study: { label: "Study Leave", icon: lucide_react_1.CalendarDays, color: "text-amber-500" }
};
function LeaveBalancesPage() {
    var _a = react_1.useState(new Date().getFullYear()), year = _a[0], setYear = _a[1];
    var _b = react_1.useState("all"), filterType = _b[0], setFilterType = _b[1];
    var _c = react_1.useState(false), showAllocate = _c[0], setShowAllocate = _c[1];
    var employeesQ = trpc_1.trpc.employees.list.useQuery();
    var summaryQ = trpc_1.trpc.leaveBalances.summary.useQuery({ year: year });
    var listQ = trpc_1.trpc.leaveBalances.list.useQuery({ year: year, leaveType: filterType === "all" ? undefined : filterType });
    var allocateMut = trpc_1.trpc.leaveBalances.allocate.useMutation({ onSuccess: function () { sonner_1.toast.success("Leave allocated"); listQ.refetch(); summaryQ.refetch(); setShowAllocate(false); } });
    var updateMut = trpc_1.trpc.leaveBalances.update.useMutation({ onSuccess: function () { sonner_1.toast.success("Updated"); listQ.refetch(); summaryQ.refetch(); } });
    var _d = react_1.useState({ employeeId: "", leaveType: "annual", entitlement: "21", carriedOver: "0" }), allocForm = _d[0], setAllocForm = _d[1];
    var summary = summaryQ.data || [];
    var balances = listQ.data || [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Leave Balances", description: "Track and manage employee leave entitlements and usage", icon: React.createElement(lucide_react_1.CalendarDays, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "HR", href: "/hr" }, { label: "Leave Balances" }] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" }, summary.slice(0, 5).map(function (s) {
                var lt = LEAVE_TYPES[s.leaveType];
                var Icon = (lt === null || lt === void 0 ? void 0 : lt.icon) || lucide_react_1.CalendarDays;
                return (React.createElement(stats_card_1.StatsCard, { key: s.leaveType, label: (lt === null || lt === void 0 ? void 0 : lt.label) || s.leaveType, value: Number(s.totalUsed || 0).toFixed(0) + "/" + Number(s.totalEntitlement || 0).toFixed(0), icon: React.createElement(Icon, { className: "h-5 w-5 " + ((lt === null || lt === void 0 ? void 0 : lt.color) || "text-gray-500") }) }));
            })),
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "flex gap-3" },
                    React.createElement(select_1.Select, { value: year.toString(), onValueChange: function (v) { return setYear(Number(v)); } },
                        React.createElement(select_1.SelectTrigger, { className: "w-28" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null, [year - 1, year, year + 1].map(function (y) { return React.createElement(select_1.SelectItem, { key: y, value: y.toString() }, y); }))),
                    React.createElement(select_1.Select, { value: filterType, onValueChange: setFilterType },
                        React.createElement(select_1.SelectTrigger, { className: "w-44" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Leave Types"),
                            Object.entries(LEAVE_TYPES).map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return React.createElement(select_1.SelectItem, { key: k, value: k }, v.label);
                            })))),
                React.createElement(button_1.Button, { onClick: function () { setAllocForm({ employeeId: "", leaveType: "annual", entitlement: "21", carriedOver: "0" }); setShowAllocate(true); } },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    " Allocate Leave")),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Employee"),
                                React.createElement(table_1.TableHead, null, "Leave Type"),
                                React.createElement(table_1.TableHead, null, "Entitlement"),
                                React.createElement(table_1.TableHead, null, "Carried Over"),
                                React.createElement(table_1.TableHead, null, "Used"),
                                React.createElement(table_1.TableHead, null, "Pending"),
                                React.createElement(table_1.TableHead, null, "Remaining"),
                                React.createElement(table_1.TableHead, null, "Progress"))),
                        React.createElement(table_1.TableBody, null,
                            balances.length === 0 && (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground" },
                                    "No leave balances found for ",
                                    year))),
                            balances.map(function (b) {
                                var lt = LEAVE_TYPES[b.leaveType];
                                var total = Number(b.entitlement || 0) + Number(b.carriedOver || 0);
                                var used = Number(b.used || 0);
                                var pct = total > 0 ? Math.round((used / total) * 100) : 0;
                                return (React.createElement(table_1.TableRow, { key: b.id },
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, b.employeeName || b.employeeId),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: "outline" }, (lt === null || lt === void 0 ? void 0 : lt.label) || b.leaveType)),
                                    React.createElement(table_1.TableCell, null, Number(b.entitlement).toFixed(1)),
                                    React.createElement(table_1.TableCell, null, Number(b.carriedOver).toFixed(1)),
                                    React.createElement(table_1.TableCell, null, Number(b.used).toFixed(1)),
                                    React.createElement(table_1.TableCell, null, Number(b.pending).toFixed(1)),
                                    React.createElement(table_1.TableCell, { className: "font-semibold" }, Number(b.remaining).toFixed(1)),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement(progress_1.Progress, { value: pct, className: "w-20 h-2" }),
                                            React.createElement("span", { className: "text-xs text-muted-foreground" },
                                                pct,
                                                "%")))));
                            }))))),
            React.createElement(dialog_1.Dialog, { open: showAllocate, onOpenChange: setShowAllocate },
                React.createElement(dialog_1.DialogContent, null,
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Allocate Leave")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Employee *"),
                            React.createElement("select", { className: "w-full mt-1 border rounded-md px-3 py-2 text-sm", value: allocForm.employeeId, onChange: function (e) { return setAllocForm(__assign(__assign({}, allocForm), { employeeId: e.target.value })); } },
                                React.createElement("option", { value: "" }, "Select employee..."),
                                (employeesQ.data || []).map(function (e) { return React.createElement("option", { key: e.id, value: e.id },
                                    e.firstName,
                                    " ",
                                    e.lastName); }))),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Leave Type"),
                            React.createElement(select_1.Select, { value: allocForm.leaveType, onValueChange: function (v) { return setAllocForm(__assign(__assign({}, allocForm), { leaveType: v })); } },
                                React.createElement(select_1.SelectTrigger, { className: "mt-1" },
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null, Object.entries(LEAVE_TYPES).map(function (_a) {
                                    var k = _a[0], v = _a[1];
                                    return React.createElement(select_1.SelectItem, { key: k, value: k }, v.label);
                                })))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Entitlement (days)"),
                                React.createElement(input_1.Input, { type: "number", className: "mt-1", value: allocForm.entitlement, onChange: function (e) { return setAllocForm(__assign(__assign({}, allocForm), { entitlement: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Carried Over (days)"),
                                React.createElement(input_1.Input, { type: "number", className: "mt-1", value: allocForm.carriedOver, onChange: function (e) { return setAllocForm(__assign(__assign({}, allocForm), { carriedOver: e.target.value })); } }))),
                        React.createElement("div", { className: "flex justify-end gap-2 pt-2" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowAllocate(false); } }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: function () { if (!allocForm.employeeId) {
                                    sonner_1.toast.error("Select an employee");
                                    return;
                                } allocateMut.mutate({ employeeId: allocForm.employeeId, leaveType: allocForm.leaveType, year: year, entitlement: Number(allocForm.entitlement), carriedOver: Number(allocForm.carriedOver) }); } }, "Allocate"))))))));
}
exports["default"] = LeaveBalancesPage;
