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
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var stats_card_1 = require("@/components/ui/stats-card");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var ACTION_TYPES = [
    { value: "verbal_warning", label: "Verbal Warning" },
    { value: "written_warning", label: "Written Warning" },
    { value: "suspension", label: "Suspension" },
    { value: "termination", label: "Termination" },
    { value: "probation", label: "Probation" },
    { value: "other", label: "Other" },
];
var STATUSES = [
    { value: "open", label: "Open", variant: "destructive" },
    { value: "under_review", label: "Under Review", variant: "secondary" },
    { value: "resolved", label: "Resolved", variant: "default" },
    { value: "appealed", label: "Appealed", variant: "outline" },
];
function DisciplinaryRecordsPage() {
    var _a = react_1.useState("all"), filterAction = _a[0], setFilterAction = _a[1];
    var _b = react_1.useState("all"), filterStatus = _b[0], setFilterStatus = _b[1];
    var _c = react_1.useState(null), editing = _c[0], setEditing = _c[1];
    var _d = react_1.useState(false), showForm = _d[0], setShowForm = _d[1];
    var employeesQ = trpc_1.trpc.employees.list.useQuery();
    var listQ = trpc_1.trpc.disciplinary.list.useQuery({
        actionType: filterAction === "all" ? undefined : filterAction,
        status: filterStatus === "all" ? undefined : filterStatus
    });
    var statsQ = trpc_1.trpc.disciplinary.stats.useQuery();
    var createMut = trpc_1.trpc.disciplinary.create.useMutation({ onSuccess: function () { sonner_1.toast.success("Record created"); listQ.refetch(); statsQ.refetch(); closeForm(); } });
    var updateMut = trpc_1.trpc.disciplinary.update.useMutation({ onSuccess: function () { sonner_1.toast.success("Record updated"); listQ.refetch(); statsQ.refetch(); closeForm(); } });
    var deleteMut = trpc_1.trpc.disciplinary["delete"].useMutation({ onSuccess: function () { sonner_1.toast.success("Record deleted"); listQ.refetch(); statsQ.refetch(); } });
    var emptyForm = { employeeId: "", actionType: "verbal_warning", reason: "", description: "", incidentDate: "", status: "open", outcome: "" };
    var _e = react_1.useState(emptyForm), form = _e[0], setForm = _e[1];
    var closeForm = function () { setShowForm(false); setEditing(null); setForm(emptyForm); };
    var openEdit = function (r) {
        setEditing(r);
        setForm({
            employeeId: r.employeeId,
            actionType: r.actionType,
            reason: r.reason || "",
            description: r.description || "",
            incidentDate: r.incidentDate ? r.incidentDate.slice(0, 10) : "",
            status: r.status,
            outcome: r.outcome || ""
        });
        setShowForm(true);
    };
    var handleSubmit = function () {
        if (!form.employeeId || !form.reason) {
            sonner_1.toast.error("Employee and reason are required");
            return;
        }
        if (editing) {
            updateMut.mutate(__assign({ id: editing.id }, form));
        }
        else {
            createMut.mutate(form);
        }
    };
    var stats = statsQ.data || { total: 0, open: 0, resolved: 0, warnings: 0, suspensions: 0 };
    var records = listQ.data || [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Disciplinary Records", description: "Manage employee disciplinary actions, warnings, and outcomes", icon: React.createElement(lucide_react_1.ShieldAlert, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "HR", href: "/hr" }, { label: "Disciplinary Records" }] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Records", value: stats.total, icon: React.createElement(lucide_react_1.ShieldAlert, { className: "h-5 w-5 text-gray-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Open Cases", value: stats.open, icon: React.createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5 text-red-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Resolved", value: stats.resolved, icon: React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Warnings", value: stats.warnings, icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5 text-amber-500" }) }),
                React.createElement(stats_card_1.StatsCard, { label: "Suspensions", value: stats.suspensions, icon: React.createElement(lucide_react_1.ShieldAlert, { className: "h-5 w-5 text-red-600" }) })),
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "flex gap-3" },
                    React.createElement(select_1.Select, { value: filterAction, onValueChange: setFilterAction },
                        React.createElement(select_1.SelectTrigger, { className: "w-44" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Actions"),
                            ACTION_TYPES.map(function (a) { return React.createElement(select_1.SelectItem, { key: a.value, value: a.value }, a.label); }))),
                    React.createElement(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus },
                        React.createElement(select_1.SelectTrigger, { className: "w-40" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                            STATUSES.map(function (s) { return React.createElement(select_1.SelectItem, { key: s.value, value: s.value }, s.label); })))),
                React.createElement(button_1.Button, { onClick: function () { setForm(emptyForm); setEditing(null); setShowForm(true); } },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    " Add Record")),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Employee"),
                                React.createElement(table_1.TableHead, null, "Action Type"),
                                React.createElement(table_1.TableHead, null, "Reason"),
                                React.createElement(table_1.TableHead, null, "Incident Date"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Outcome"),
                                React.createElement(table_1.TableHead, { className: "w-20" }, "Actions"))),
                        React.createElement(table_1.TableBody, null,
                            records.length === 0 && (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "No disciplinary records found"))),
                            records.map(function (r) {
                                var _a;
                                var actionLabel = ((_a = ACTION_TYPES.find(function (a) { return a.value === r.actionType; })) === null || _a === void 0 ? void 0 : _a.label) || r.actionType;
                                var statusMeta = STATUSES.find(function (s) { return s.value === r.status; });
                                return (React.createElement(table_1.TableRow, { key: r.id },
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, r.employeeName || r.employeeId),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: "outline" }, actionLabel)),
                                    React.createElement(table_1.TableCell, { className: "max-w-[200px] truncate" }, r.reason),
                                    React.createElement(table_1.TableCell, null, r.incidentDate ? new Date(r.incidentDate).toLocaleDateString() : "-"),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: (statusMeta === null || statusMeta === void 0 ? void 0 : statusMeta.variant) || "secondary" }, (statusMeta === null || statusMeta === void 0 ? void 0 : statusMeta.label) || r.status)),
                                    React.createElement(table_1.TableCell, { className: "max-w-[150px] truncate" }, r.outcome || "-"),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(RowActionsMenu_1.RowActionsMenu, { menuActions: [{ label: "Edit", icon: React.createElement(lucide_react_1.Pencil, { className: "h-4 w-4" }), onClick: function () { return openEdit(r); } }, { label: "Delete", icon: React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }), onClick: function () { if (confirm("Delete this record?"))
                                                        deleteMut.mutate({ id: r.id }); }, variant: "destructive", separator: true }] }))));
                            }))))),
            React.createElement(dialog_1.Dialog, { open: showForm, onOpenChange: function (v) { if (!v)
                    closeForm(); } },
                React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, editing ? "Edit Disciplinary Record" : "Add Disciplinary Record")),
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
                                React.createElement("label", { className: "text-sm font-medium" }, "Action Type"),
                                React.createElement(select_1.Select, { value: form.actionType, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { actionType: v })); } },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-1" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, ACTION_TYPES.map(function (a) { return React.createElement(select_1.SelectItem, { key: a.value, value: a.value }, a.label); })))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Status"),
                                React.createElement(select_1.Select, { value: form.status, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { status: v })); } },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-1" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, STATUSES.map(function (s) { return React.createElement(select_1.SelectItem, { key: s.value, value: s.value }, s.label); }))))),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Incident Date"),
                            React.createElement(input_1.Input, { type: "date", className: "mt-1", value: form.incidentDate, onChange: function (e) { return setForm(__assign(__assign({}, form), { incidentDate: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Reason *"),
                            React.createElement(textarea_1.Textarea, { className: "mt-1", rows: 2, value: form.reason, onChange: function (e) { return setForm(__assign(__assign({}, form), { reason: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Description"),
                            React.createElement(textarea_1.Textarea, { className: "mt-1", rows: 3, value: form.description, onChange: function (e) { return setForm(__assign(__assign({}, form), { description: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium" }, "Outcome"),
                            React.createElement(textarea_1.Textarea, { className: "mt-1", rows: 2, value: form.outcome, onChange: function (e) { return setForm(__assign(__assign({}, form), { outcome: e.target.value })); } })),
                        React.createElement("div", { className: "flex justify-end gap-2 pt-2" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: closeForm }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: handleSubmit }, editing ? "Update" : "Create"))))))));
}
exports["default"] = DisciplinaryRecordsPage;
