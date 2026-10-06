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
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var CONTRACT_TYPES = { permanent: "Permanent", fixed_term: "Fixed Term", probation: "Probation", casual: "Casual", internship: "Internship" };
var STATUS_MAP = {
    active: { label: "Active", variant: "default" },
    expired: { label: "Expired", variant: "destructive" },
    terminated: { label: "Terminated", variant: "destructive" },
    renewed: { label: "Renewed", variant: "secondary" },
    pending: { label: "Pending", variant: "outline" }
};
function EmployeeContractsPage() {
    var _a;
    var _b = react_1.useState("all"), filterStatus = _b[0], setFilterStatus = _b[1];
    var _c = react_1.useState("all"), filterType = _c[0], setFilterType = _c[1];
    var _d = react_1.useState(false), showCreate = _d[0], setShowCreate = _d[1];
    var _e = react_1.useState(false), showEdit = _e[0], setShowEdit = _e[1];
    var _f = react_1.useState(null), editing = _f[0], setEditing = _f[1];
    var employeesQ = trpc_1.trpc.employees.list.useQuery();
    var statsQ = trpc_1.trpc.employeeContracts.stats.useQuery();
    var listQ = trpc_1.trpc.employeeContracts.list.useQuery({
        status: filterStatus === "all" ? undefined : filterStatus,
        contractType: filterType === "all" ? undefined : filterType
    });
    var createMut = trpc_1.trpc.employeeContracts.create.useMutation({ onSuccess: function () { sonner_1.toast.success("Contract created"); listQ.refetch(); statsQ.refetch(); setShowCreate(false); } });
    var updateMut = trpc_1.trpc.employeeContracts.update.useMutation({ onSuccess: function () { sonner_1.toast.success("Contract updated"); listQ.refetch(); statsQ.refetch(); setShowEdit(false); setEditing(null); } });
    var deleteMut = trpc_1.trpc.employeeContracts["delete"].useMutation({ onSuccess: function () { sonner_1.toast.success("Contract deleted"); listQ.refetch(); statsQ.refetch(); } });
    var _g = react_1.useState({ employeeId: "", contractType: "permanent", title: "", startDate: "", endDate: "", salary: "", terms: "", renewalDate: "", noticePeriod: "30" }), form = _g[0], setForm = _g[1];
    var resetForm = function () { return setForm({ employeeId: "", contractType: "permanent", title: "", startDate: "", endDate: "", salary: "", terms: "", renewalDate: "", noticePeriod: "30" }); };
    var stats = statsQ.data || { total: 0, active: 0, expired: 0, expiringSoon: 0 };
    var contracts = listQ.data || [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Employee Contracts", description: "Manage employment contracts, renewals, and terms", icon: React.createElement(lucide_react_1.FileCheck, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "HR", href: "/hr" }, { label: "Contracts" }] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Contracts", value: stats.total, icon: React.createElement(lucide_react_1.FileCheck, { className: "h-5 w-5 text-blue-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Active", value: stats.active, icon: React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Expired", value: stats.expired, icon: React.createElement(lucide_react_1.FileX, { className: "h-5 w-5 text-red-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Expiring Soon", value: stats.expiringSoon, icon: React.createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5 text-amber-500" }) })),
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "flex gap-3" },
                    React.createElement(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus },
                        React.createElement(select_1.SelectTrigger, { className: "w-36" },
                            React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                            React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                            React.createElement(select_1.SelectItem, { value: "expired" }, "Expired"),
                            React.createElement(select_1.SelectItem, { value: "terminated" }, "Terminated"),
                            React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"))),
                    React.createElement(select_1.Select, { value: filterType, onValueChange: setFilterType },
                        React.createElement(select_1.SelectTrigger, { className: "w-36" },
                            React.createElement(select_1.SelectValue, { placeholder: "Type" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Types"),
                            Object.entries(CONTRACT_TYPES).map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return React.createElement(select_1.SelectItem, { key: k, value: k }, v);
                            })))),
                React.createElement(button_1.Button, { onClick: function () { resetForm(); setShowCreate(true); } },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    " New Contract")),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Employee"),
                                React.createElement(table_1.TableHead, null, "Type"),
                                React.createElement(table_1.TableHead, null, "Start Date"),
                                React.createElement(table_1.TableHead, null, "End Date"),
                                React.createElement(table_1.TableHead, null, "Salary"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null,
                            contracts.length === 0 && (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "No contracts found"))),
                            contracts.map(function (c) {
                                var s = STATUS_MAP[c.status] || { label: c.status, variant: "outline" };
                                return (React.createElement(table_1.TableRow, { key: c.id },
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, c.employeeName || c.employeeId),
                                    React.createElement(table_1.TableCell, null, CONTRACT_TYPES[c.contractType] || c.contractType),
                                    React.createElement(table_1.TableCell, null, c.startDate ? new Date(c.startDate).toLocaleDateString() : "-"),
                                    React.createElement(table_1.TableCell, null, c.endDate ? new Date(c.endDate).toLocaleDateString() : "Open-ended"),
                                    React.createElement(table_1.TableCell, null, c.salary ? (c.currency || "KES") + " " + Number(c.salary).toLocaleString() : "-"),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: s.variant }, s.label)),
                                    React.createElement(table_1.TableCell, { className: "text-right" },
                                        React.createElement(RowActionsMenu_1.RowActionsMenu, { menuActions: [{ label: "Edit", icon: React.createElement(lucide_react_1.Pencil, { className: "h-4 w-4" }), onClick: function () { var _a, _b, _c, _d, _e; setEditing(c); setForm({ employeeId: c.employeeId, contractType: c.contractType, title: c.title || "", startDate: ((_a = c.startDate) === null || _a === void 0 ? void 0 : _a.split("T")[0]) || "", endDate: ((_b = c.endDate) === null || _b === void 0 ? void 0 : _b.split("T")[0]) || "", salary: ((_c = c.salary) === null || _c === void 0 ? void 0 : _c.toString()) || "", terms: c.terms || "", renewalDate: ((_d = c.renewalDate) === null || _d === void 0 ? void 0 : _d.split("T")[0]) || "", noticePeriod: ((_e = c.noticePeriod) === null || _e === void 0 ? void 0 : _e.toString()) || "30" }); setShowEdit(true); } }, { label: "Delete", icon: React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }), onClick: function () { if (confirm("Delete this contract?"))
                                                        deleteMut.mutate(c.id); }, variant: "destructive", separator: true }] }))));
                            }))))),
            React.createElement(dialog_1.Dialog, { open: showCreate, onOpenChange: setShowCreate },
                React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "New Employee Contract")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Employee *"),
                            React.createElement("select", { className: "w-full mt-1 border rounded-md px-3 py-2 text-sm", value: form.employeeId, onChange: function (e) { return setForm(__assign(__assign({}, form), { employeeId: e.target.value })); } },
                                React.createElement("option", { value: "" }, "Select employee..."),
                                (employeesQ.data || []).map(function (e) { return React.createElement("option", { key: e.id, value: e.id },
                                    e.firstName,
                                    " ",
                                    e.lastName); }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Contract Type"),
                                React.createElement(select_1.Select, { value: form.contractType, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { contractType: v })); } },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-1" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, Object.entries(CONTRACT_TYPES).map(function (_a) {
                                        var k = _a[0], v = _a[1];
                                        return React.createElement(select_1.SelectItem, { key: k, value: k }, v);
                                    })))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Title"),
                                React.createElement(input_1.Input, { className: "mt-1", placeholder: "e.g. Employment Agreement", value: form.title, onChange: function (e) { return setForm(__assign(__assign({}, form), { title: e.target.value })); } }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Start Date *"),
                                React.createElement(input_1.Input, { type: "date", className: "mt-1", value: form.startDate, onChange: function (e) { return setForm(__assign(__assign({}, form), { startDate: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "End Date"),
                                React.createElement(input_1.Input, { type: "date", className: "mt-1", value: form.endDate, onChange: function (e) { return setForm(__assign(__assign({}, form), { endDate: e.target.value })); } }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Monthly Salary (KES)"),
                                React.createElement(input_1.Input, { type: "number", className: "mt-1", value: form.salary, onChange: function (e) { return setForm(__assign(__assign({}, form), { salary: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Notice Period (days)"),
                                React.createElement(input_1.Input, { type: "number", className: "mt-1", value: form.noticePeriod, onChange: function (e) { return setForm(__assign(__assign({}, form), { noticePeriod: e.target.value })); } }))),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Terms & Conditions"),
                            React.createElement("textarea", { className: "mt-1 w-full border rounded-md px-3 py-2 text-sm min-h-[80px]", value: form.terms, onChange: function (e) { return setForm(__assign(__assign({}, form), { terms: e.target.value })); } })),
                        React.createElement("div", { className: "flex justify-end gap-2 pt-2" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowCreate(false); } }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: function () { if (!form.employeeId || !form.startDate) {
                                    sonner_1.toast.error("Employee and start date are required");
                                    return;
                                } createMut.mutate({ employeeId: form.employeeId, contractType: form.contractType, title: form.title || undefined, startDate: form.startDate, endDate: form.endDate || undefined, salary: form.salary ? Number(form.salary) : undefined, terms: form.terms || undefined, noticePeriod: form.noticePeriod ? Number(form.noticePeriod) : undefined }); } }, "Create Contract"))))),
            React.createElement(dialog_1.Dialog, { open: showEdit, onOpenChange: function (open) { if (!open) {
                    setShowEdit(false);
                    setEditing(null);
                } } },
                React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Edit Contract")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Employee"),
                            React.createElement(input_1.Input, { value: ((_a = contracts.find(function (c) { return c.id === (editing === null || editing === void 0 ? void 0 : editing.id); })) === null || _a === void 0 ? void 0 : _a.employeeName) || form.employeeId, disabled: true, className: "mt-1" })),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Contract Type"),
                                React.createElement(select_1.Select, { value: form.contractType, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { contractType: v })); } },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-1" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, Object.entries(CONTRACT_TYPES).map(function (_a) {
                                        var k = _a[0], v = _a[1];
                                        return React.createElement(select_1.SelectItem, { key: k, value: k }, v);
                                    })))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Title"),
                                React.createElement(input_1.Input, { className: "mt-1", value: form.title, onChange: function (e) { return setForm(__assign(__assign({}, form), { title: e.target.value })); } }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Start Date"),
                                React.createElement(input_1.Input, { type: "date", className: "mt-1", value: form.startDate, onChange: function (e) { return setForm(__assign(__assign({}, form), { startDate: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "End Date"),
                                React.createElement(input_1.Input, { type: "date", className: "mt-1", value: form.endDate, onChange: function (e) { return setForm(__assign(__assign({}, form), { endDate: e.target.value })); } }))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Salary (KES)"),
                                React.createElement(input_1.Input, { type: "number", className: "mt-1", value: form.salary, onChange: function (e) { return setForm(__assign(__assign({}, form), { salary: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Notice Period (days)"),
                                React.createElement(input_1.Input, { type: "number", className: "mt-1", value: form.noticePeriod, onChange: function (e) { return setForm(__assign(__assign({}, form), { noticePeriod: e.target.value })); } }))),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Terms"),
                            React.createElement("textarea", { className: "mt-1 w-full border rounded-md px-3 py-2 text-sm min-h-[80px]", value: form.terms, onChange: function (e) { return setForm(__assign(__assign({}, form), { terms: e.target.value })); } })),
                        React.createElement("div", { className: "flex justify-end gap-2 pt-2" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { setShowEdit(false); setEditing(null); } }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: function () { if (!editing)
                                    return; updateMut.mutate({ id: editing.id, contractType: form.contractType, title: form.title, startDate: form.startDate, endDate: form.endDate || undefined, salary: form.salary ? Number(form.salary) : undefined, terms: form.terms, noticePeriod: form.noticePeriod ? Number(form.noticePeriod) : undefined }); } }, "Save Changes"))))))));
}
exports["default"] = EmployeeContractsPage;
