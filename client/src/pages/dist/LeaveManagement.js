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
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var tabs_1 = require("@/components/ui/tabs");
var spinner_1 = require("@/components/ui/spinner");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var stats_card_1 = require("@/components/ui/stats-card");
var date_fns_1 = require("date-fns");
var EmployeeSelect_1 = require("@/components/EmployeeSelect");
var LEAVE_TYPES = ["annual", "sick", "maternity", "paternity", "unpaid", "other"];
var LEAVE_TYPE_COLORS = {
    annual: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    sick: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    unpaid: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
    maternity: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    paternity: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    other: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
};
function calcDays(start, end) {
    if (!start || !end)
        return 0;
    var diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
}
function StatusBadge(_a) {
    var status = _a.status;
    var map = {
        approved: { variant: "default", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3" }) },
        pending: { variant: "outline", icon: React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" }) },
        rejected: { variant: "destructive", icon: React.createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }) },
        cancelled: { variant: "secondary", icon: React.createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }) }
    };
    var cfg = map[status] || map.pending;
    return React.createElement(badge_1.Badge, { variant: cfg.variant, className: "gap-1 capitalize" },
        cfg.icon,
        " ",
        status);
}
function LeaveForm(_a) {
    var open = _a.open, onClose = _a.onClose, editing = _a.editing, onSaved = _a.onSaved;
    var empty = { employeeId: "", leaveType: "annual", startDate: "", endDate: "", days: 0, reason: "", notes: "" };
    var _b = react_1.useState(function () { return editing ? {
        employeeId: editing.employeeId || "",
        leaveType: (editing.leaveType || "annual"),
        startDate: editing.startDate ? editing.startDate.slice(0, 10) : "",
        endDate: editing.endDate ? editing.endDate.slice(0, 10) : "",
        days: editing.days || 0, reason: editing.reason || "", notes: editing.notes || ""
    } : empty; }), form = _b[0], setForm = _b[1];
    var createMut = trpc_1.trpc.leave.create.useMutation({
        onSuccess: function () { sonner_1.toast.success("Leave request created"); onSaved(); onClose(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateMut = trpc_1.trpc.leave.update.useMutation({
        onSuccess: function () { sonner_1.toast.success("Leave request updated"); onSaved(); onClose(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    function setF(k, v) {
        setForm(function (prev) {
            var _a;
            var next = __assign(__assign({}, prev), (_a = {}, _a[k] = v, _a));
            if (k === "startDate" || k === "endDate") {
                next.days = calcDays(k === "startDate" ? v : prev.startDate, k === "endDate" ? v : prev.endDate);
            }
            return next;
        });
    }
    function submit() {
        if (!form.employeeId)
            return void sonner_1.toast.error("Select an employee");
        if (!form.startDate || !form.endDate)
            return void sonner_1.toast.error("Set start and end dates");
        if (new Date(form.endDate) < new Date(form.startDate))
            return void sonner_1.toast.error("End date must be after start date");
        var payload = {
            employeeId: form.employeeId, leaveType: form.leaveType,
            startDate: new Date(form.startDate), endDate: new Date(form.endDate),
            days: form.days, reason: form.reason, notes: form.notes
        };
        if (editing)
            updateMut.mutate(__assign({ id: editing.id }, payload));
        else
            createMut.mutate(payload);
    }
    var busy = createMut.isPending || updateMut.isPending;
    return (React.createElement(dialog_1.Dialog, { open: open, onOpenChange: function (o) { return !o && onClose(); } },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-lg" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null, editing ? "Edit Leave Request" : "New Leave Request"),
                React.createElement(dialog_1.DialogDescription, null, "Fill in the leave request details below.")),
            React.createElement("div", { className: "grid gap-4 py-2" },
                React.createElement("div", { className: "grid gap-1.5" },
                    React.createElement(EmployeeSelect_1.EmployeeSelect, { value: form.employeeId, onChange: function (v) { return setF("employeeId", v); }, label: "Employee *", required: true })),
                React.createElement("div", { className: "grid gap-1.5" },
                    React.createElement(label_1.Label, null, "Leave Type *"),
                    React.createElement(select_1.Select, { value: form.leaveType, onValueChange: function (v) { return setF("leaveType", v); } },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null, LEAVE_TYPES.map(function (t) { return React.createElement(select_1.SelectItem, { key: t, value: t, className: "capitalize" }, t); })))),
                React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                    React.createElement("div", { className: "grid gap-1.5" },
                        React.createElement(label_1.Label, null, "Start Date *"),
                        React.createElement(input_1.Input, { type: "date", value: form.startDate, onChange: function (e) { return setF("startDate", e.target.value); } })),
                    React.createElement("div", { className: "grid gap-1.5" },
                        React.createElement(label_1.Label, null, "End Date *"),
                        React.createElement(input_1.Input, { type: "date", value: form.endDate, min: form.startDate, onChange: function (e) { return setF("endDate", e.target.value); } }))),
                React.createElement("div", { className: "grid gap-1.5" },
                    React.createElement(label_1.Label, null, "Days (auto-calculated)"),
                    React.createElement(input_1.Input, { type: "number", value: form.days, readOnly: true, className: "bg-muted" })),
                React.createElement("div", { className: "grid gap-1.5" },
                    React.createElement(label_1.Label, null, "Reason"),
                    React.createElement(textarea_1.Textarea, { rows: 2, placeholder: "Reason for leave...", value: form.reason, onChange: function (e) { return setF("reason", e.target.value); } })),
                React.createElement("div", { className: "grid gap-1.5" },
                    React.createElement(label_1.Label, null, "Notes"),
                    React.createElement(textarea_1.Textarea, { rows: 2, placeholder: "Additional notes...", value: form.notes, onChange: function (e) { return setF("notes", e.target.value); } }))),
            React.createElement(dialog_1.DialogFooter, null,
                React.createElement(button_1.Button, { variant: "outline", onClick: onClose, disabled: busy }, "Cancel"),
                React.createElement(button_1.Button, { onClick: submit, disabled: busy },
                    busy && React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }),
                    editing ? "Save Changes" : "Submit Request")))));
}
function ApprovalDialog(_a) {
    var request = _a.request, action = _a.action, onClose = _a.onClose, onDone = _a.onDone;
    var _b = react_1.useState(""), notes = _b[0], setNotes = _b[1];
    var updateMut = trpc_1.trpc.leave.update.useMutation({
        onSuccess: function () { sonner_1.toast.success("Leave request " + action); onDone(); onClose(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    return (React.createElement(dialog_1.Dialog, { open: true, onOpenChange: function (o) { return !o && onClose(); } },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null, action === "approved" ? "Approve Leave Request" : "Reject Leave Request"),
                React.createElement(dialog_1.DialogDescription, null, request === null || request === void 0 ? void 0 :
                    request.employeeName,
                    " \u2014 ", request === null || request === void 0 ? void 0 :
                    request.leaveType,
                    " leave (", request === null || request === void 0 ? void 0 :
                    request.days,
                    " days)")),
            React.createElement("div", { className: "grid gap-3 py-2" },
                React.createElement(label_1.Label, null, action === "approved" ? "Approval Notes (optional)" : "Rejection Reason (optional)"),
                React.createElement(textarea_1.Textarea, { rows: 3, value: notes, onChange: function (e) { return setNotes(e.target.value); }, placeholder: "Add a note..." })),
            React.createElement(dialog_1.DialogFooter, null,
                React.createElement(button_1.Button, { variant: "outline", onClick: onClose }, "Cancel"),
                React.createElement(button_1.Button, { variant: action === "rejected" ? "destructive" : "default", onClick: function () { return updateMut.mutate({ id: request.id, status: action, notes: notes }); }, disabled: updateMut.isPending },
                    updateMut.isPending && React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }),
                    action === "approved" ? "Approve" : "Reject")))));
}
function LeaveBalancesTab() {
    var _a = react_1.useState(new Date().getFullYear()), year = _a[0], setYear = _a[1];
    var _b = react_1.useState(""), search = _b[0], setSearch = _b[1];
    var _c = react_1.useState(null), editBalance = _c[0], setEditBalance = _c[1];
    var _d = react_1.useState({ entitlement: 0, carriedOver: 0 }), editForm = _d[0], setEditForm = _d[1];
    var balancesQ = trpc_1.trpc.leaveBalances.list.useQuery({ year: year });
    var updateBalMut = trpc_1.trpc.leaveBalances.update.useMutation({
        onSuccess: function () { sonner_1.toast.success("Balance updated"); balancesQ.refetch(); setEditBalance(null); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var rows = balancesQ.data || [];
    var filtered = rows.filter(function (r) { var _a; return !search || ((_a = r.employeeName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())); });
    var years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex gap-3 items-center" },
            React.createElement("div", { className: "relative flex-1 max-w-sm" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search employees...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
            React.createElement(select_1.Select, { value: String(year), onValueChange: function (v) { return setYear(Number(v)); } },
                React.createElement(select_1.SelectTrigger, { className: "w-32" },
                    React.createElement(select_1.SelectValue, null)),
                React.createElement(select_1.SelectContent, null, years.map(function (y) { return React.createElement(select_1.SelectItem, { key: y, value: String(y) }, y); }))),
            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return balancesQ.refetch(); } },
                React.createElement(lucide_react_1.RefreshCw, { className: "h-3.5 w-3.5" }))),
        balancesQ.isLoading ? (React.createElement("div", { className: "flex justify-center py-12" },
            React.createElement(spinner_1.Spinner, { className: "h-6 w-6" }))) : filtered.length === 0 ? (React.createElement("div", { className: "text-center py-12 text-muted-foreground" },
            "No leave balances found for ",
            year,
            ".")) : (React.createElement("div", { className: "rounded-md border overflow-x-auto" },
            React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null,
                    React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableHead, null, "Employee"),
                        React.createElement(table_1.TableHead, null, "Department"),
                        React.createElement(table_1.TableHead, null, "Leave Type"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Entitlement"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Carried Over"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Used"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Pending"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Available"),
                        React.createElement(table_1.TableHead, null))),
                React.createElement(table_1.TableBody, null, filtered.map(function (b) {
                    var _a, _b, _c, _d;
                    var available = (b.entitlement || 0) + (b.carriedOver || 0) - (b.used || 0) - (b.pending || 0);
                    return (React.createElement(table_1.TableRow, { key: b.id },
                        React.createElement(table_1.TableCell, { className: "font-medium" }, b.employeeName || b.employeeId),
                        React.createElement(table_1.TableCell, { className: "text-muted-foreground" }, b.department || "—"),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { className: (LEAVE_TYPE_COLORS[b.leaveType] || "") + " capitalize", variant: "outline" }, b.leaveType)),
                        React.createElement(table_1.TableCell, { className: "text-right" }, (_a = b.entitlement) !== null && _a !== void 0 ? _a : 0),
                        React.createElement(table_1.TableCell, { className: "text-right" }, (_b = b.carriedOver) !== null && _b !== void 0 ? _b : 0),
                        React.createElement(table_1.TableCell, { className: "text-right" }, (_c = b.used) !== null && _c !== void 0 ? _c : 0),
                        React.createElement(table_1.TableCell, { className: "text-right" }, (_d = b.pending) !== null && _d !== void 0 ? _d : 0),
                        React.createElement(table_1.TableCell, { className: "text-right" },
                            React.createElement("span", { className: available < 0 ? "text-destructive font-semibold" : "text-green-600 font-semibold" }, available)),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { setEditBalance(b); setEditForm({ entitlement: b.entitlement || 0, carriedOver: b.carriedOver || 0 }); } },
                                React.createElement(lucide_react_1.Edit, { className: "h-3.5 w-3.5" })))));
                }))))),
        editBalance && (React.createElement(dialog_1.Dialog, { open: true, onOpenChange: function (o) { return !o && setEditBalance(null); } },
            React.createElement(dialog_1.DialogContent, { className: "sm:max-w-sm" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Update Leave Balance"),
                    React.createElement(dialog_1.DialogDescription, null,
                        editBalance.employeeName,
                        " \u2014 ",
                        editBalance.leaveType,
                        " (",
                        year,
                        ")")),
                React.createElement("div", { className: "grid gap-3 py-2" },
                    React.createElement("div", { className: "grid gap-1.5" },
                        React.createElement(label_1.Label, null, "Annual Entitlement (days)"),
                        React.createElement(input_1.Input, { type: "number", min: 0, value: editForm.entitlement, onChange: function (e) { return setEditForm(function (f) { return (__assign(__assign({}, f), { entitlement: Number(e.target.value) })); }); } })),
                    React.createElement("div", { className: "grid gap-1.5" },
                        React.createElement(label_1.Label, null, "Carried Over (days)"),
                        React.createElement(input_1.Input, { type: "number", min: 0, value: editForm.carriedOver, onChange: function (e) { return setEditForm(function (f) { return (__assign(__assign({}, f), { carriedOver: Number(e.target.value) })); }); } }))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditBalance(null); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: function () { return updateBalMut.mutate(__assign({ id: editBalance.id }, editForm)); }, disabled: updateBalMut.isPending },
                        updateBalMut.isPending && React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }),
                        " Save")))))));
}
function LeaveManagement() {
    var _a = react_1.useState(""), searchQuery = _a[0], setSearchQuery = _a[1];
    var _b = react_1.useState("all"), statusFilter = _b[0], setStatusFilter = _b[1];
    var _c = react_1.useState("all"), typeFilter = _c[0], setTypeFilter = _c[1];
    var _d = react_1.useState(false), showForm = _d[0], setShowForm = _d[1];
    var _e = react_1.useState(null), editingLeave = _e[0], setEditingLeave = _e[1];
    var _f = react_1.useState(null), approvalTarget = _f[0], setApprovalTarget = _f[1];
    var _g = react_1.useState(null), deleteId = _g[0], setDeleteId = _g[1];
    var _h = react_1.useState("requests"), tab = _h[0], setTab = _h[1];
    var listQ = trpc_1.trpc.leave.list.useQuery();
    var employeesQ = trpc_1.trpc.employees.list.useQuery();
    var deleteMut = trpc_1.trpc.leave["delete"].useMutation({
        onSuccess: function () { sonner_1.toast.success("Leave request deleted"); listQ.refetch(); setDeleteId(null); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var requests = Array.isArray(listQ.data) ? listQ.data : [];
    var filtered = requests.filter(function (r) {
        var _a;
        var name = (r.employeeName || "").toLowerCase();
        var matchSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || ((_a = r.leaveType) === null || _a === void 0 ? void 0 : _a.includes(searchQuery.toLowerCase()));
        var matchStatus = statusFilter === "all" || r.status === statusFilter;
        var matchType = typeFilter === "all" || r.leaveType === typeFilter;
        return matchSearch && matchStatus && matchType;
    });
    var approvedCount = requests.filter(function (r) { return r.status === "approved"; }).length;
    var pendingCount = requests.filter(function (r) { return r.status === "pending"; }).length;
    var rejectedCount = requests.filter(function (r) { return r.status === "rejected"; }).length;
    var totalDaysApproved = requests.filter(function (r) { return r.status === "approved"; }).reduce(function (sum, r) { return sum + (r.days || 0); }, 0);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Leave Management", description: "Manage employee leave requests, approvals, and balances", icon: React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Leave Management" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { setEditingLeave(null); setShowForm(true); }, className: "gap-2" },
            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
            " New Leave Request") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: pendingCount, description: "Awaiting approval", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Approved", value: approvedCount, description: "Approved requests", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Rejected", value: rejectedCount, description: "Rejected requests", icon: React.createElement(lucide_react_1.XCircle, { className: "h-5 w-5" }), color: "border-l-red-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Days Approved", value: totalDaysApproved, description: "Total approved days", icon: React.createElement(lucide_react_1.Umbrella, { className: "h-5 w-5" }), color: "border-l-blue-500" })),
            React.createElement(tabs_1.Tabs, { value: tab, onValueChange: setTab },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "requests", className: "gap-2" },
                        React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4" }),
                        " Leave Requests",
                        pendingCount > 0 && React.createElement(badge_1.Badge, { variant: "destructive", className: "ml-1 h-5 min-w-5 text-xs" }, pendingCount)),
                    React.createElement(tabs_1.TabsTrigger, { value: "balances", className: "gap-2" },
                        React.createElement(lucide_react_1.BarChart3, { className: "h-4 w-4" }),
                        " Leave Balances")),
                React.createElement(tabs_1.TabsContent, { value: "requests", className: "mt-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3" },
                                React.createElement("div", null,
                                    React.createElement(card_1.CardTitle, null, "Leave Requests"),
                                    React.createElement(card_1.CardDescription, null, "Review and process leave applications")),
                                React.createElement("div", { className: "flex flex-wrap gap-2" },
                                    React.createElement("div", { className: "relative" },
                                        React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                        React.createElement(input_1.Input, { placeholder: "Search employee...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9 w-52" })),
                                    React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                                        React.createElement(select_1.SelectTrigger, { className: "w-36" },
                                            React.createElement(select_1.SelectValue, { placeholder: "All Status" })),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                                            React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                            React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                            React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                                            React.createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"))),
                                    React.createElement(select_1.Select, { value: typeFilter, onValueChange: setTypeFilter },
                                        React.createElement(select_1.SelectTrigger, { className: "w-36" },
                                            React.createElement(select_1.SelectValue, { placeholder: "All Types" })),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "all" }, "All Types"),
                                            LEAVE_TYPES.map(function (t) { return React.createElement(select_1.SelectItem, { key: t, value: t, className: "capitalize" }, t); }))),
                                    React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return listQ.refetch(); } },
                                        React.createElement(lucide_react_1.RefreshCw, { className: "h-3.5 w-3.5" }))))),
                        React.createElement(card_1.CardContent, { className: "p-0" }, listQ.isLoading ? (React.createElement("div", { className: "flex justify-center py-12" },
                            React.createElement(spinner_1.Spinner, { className: "h-6 w-6" }))) : filtered.length === 0 ? (React.createElement("div", { className: "text-center py-12 text-muted-foreground" }, "No leave requests found.")) : (React.createElement("div", { className: "overflow-x-auto" },
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, null, "Employee"),
                                        React.createElement(table_1.TableHead, null, "Type"),
                                        React.createElement(table_1.TableHead, null, "Start"),
                                        React.createElement(table_1.TableHead, null, "End"),
                                        React.createElement(table_1.TableHead, { className: "text-right" }, "Days"),
                                        React.createElement(table_1.TableHead, null, "Reason"),
                                        React.createElement(table_1.TableHead, null, "Applied"),
                                        React.createElement(table_1.TableHead, null, "Status"),
                                        React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                                React.createElement(table_1.TableBody, null, filtered.map(function (r) {
                                    var _a;
                                    return (React.createElement(table_1.TableRow, { key: r.id },
                                        React.createElement(table_1.TableCell, null,
                                            React.createElement("div", { className: "font-medium leading-tight" }, r.employeeName || r.employeeId),
                                            r.employeeEmail && React.createElement("div", { className: "text-xs text-muted-foreground" }, r.employeeEmail)),
                                        React.createElement(table_1.TableCell, null,
                                            React.createElement(badge_1.Badge, { className: (LEAVE_TYPE_COLORS[r.leaveType] || "") + " capitalize", variant: "outline" }, r.leaveType)),
                                        React.createElement(table_1.TableCell, { className: "whitespace-nowrap" }, r.startDate ? date_fns_1.format(new Date(r.startDate), "dd MMM yyyy") : "—"),
                                        React.createElement(table_1.TableCell, { className: "whitespace-nowrap" }, r.endDate ? date_fns_1.format(new Date(r.endDate), "dd MMM yyyy") : "—"),
                                        React.createElement(table_1.TableCell, { className: "text-right font-medium" }, (_a = r.days) !== null && _a !== void 0 ? _a : "—"),
                                        React.createElement(table_1.TableCell, { className: "max-w-[180px] truncate text-sm text-muted-foreground" }, r.reason || "—"),
                                        React.createElement(table_1.TableCell, { className: "whitespace-nowrap text-sm text-muted-foreground" }, r.createdAt ? date_fns_1.format(new Date(r.createdAt), "dd MMM yyyy") : "—"),
                                        React.createElement(table_1.TableCell, null,
                                            React.createElement(StatusBadge, { status: r.status })),
                                        React.createElement(table_1.TableCell, null,
                                            React.createElement("div", { className: "flex justify-end gap-1" },
                                                r.status === "pending" && (React.createElement(React.Fragment, null,
                                                    React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-400 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950", onClick: function () { return setApprovalTarget({ request: r, action: "approved" }); } },
                                                        React.createElement(lucide_react_1.ThumbsUp, { className: "h-3.5 w-3.5 mr-1" }),
                                                        " Approve"),
                                                    React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-destructive border-red-200 hover:bg-red-50 hover:border-red-400 dark:border-red-900 dark:hover:bg-red-950", onClick: function () { return setApprovalTarget({ request: r, action: "rejected" }); } },
                                                        React.createElement(lucide_react_1.ThumbsDown, { className: "h-3.5 w-3.5 mr-1" }),
                                                        " Reject"))),
                                                React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0", onClick: function () { setEditingLeave(r); setShowForm(true); } },
                                                    React.createElement(lucide_react_1.Edit, { className: "h-3.5 w-3.5" })),
                                                React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0 text-destructive hover:text-destructive", onClick: function () { return setDeleteId(r.id); } },
                                                    React.createElement(lucide_react_1.Trash2, { className: "h-3.5 w-3.5" }))))));
                                })))))))),
                React.createElement(tabs_1.TabsContent, { value: "balances", className: "mt-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Leave Balances"),
                            React.createElement(card_1.CardDescription, null, "Annual entitlements and current balances per employee")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(LeaveBalancesTab, null)))))),
        showForm && (React.createElement(LeaveForm, { open: showForm, onClose: function () { setShowForm(false); setEditingLeave(null); }, editing: editingLeave, onSaved: function () { return listQ.refetch(); } })),
        approvalTarget && (React.createElement(ApprovalDialog, { request: approvalTarget.request, action: approvalTarget.action, onClose: function () { return setApprovalTarget(null); }, onDone: function () { return listQ.refetch(); } })),
        React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteId, onOpenChange: function (o) { return !o && setDeleteId(null); } },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogHeader, null,
                    React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Leave Request?"),
                    React.createElement(alert_dialog_1.AlertDialogDescription, null, "This action cannot be undone.")),
                React.createElement(alert_dialog_1.AlertDialogFooter, null,
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", onClick: function () { return deleteId && deleteMut.mutate(deleteId); } }, "Delete"))))));
}
exports["default"] = LeaveManagement;
