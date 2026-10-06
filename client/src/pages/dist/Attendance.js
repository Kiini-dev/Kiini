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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var textarea_1 = require("@/components/ui/textarea");
var checkbox_1 = require("@/components/ui/checkbox");
var spinner_1 = require("@/components/ui/spinner");
var stats_card_1 = require("@/components/ui/stats-card");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var EmployeeSelect_1 = require("@/components/EmployeeSelect");
var STATUS_COLORS = {
    present: "bg-green-50 text-green-700 border-green-200",
    late: "bg-orange-50 text-orange-700 border-orange-200",
    absent: "bg-red-50 text-red-700 border-red-200",
    "half-day": "bg-yellow-50 text-yellow-700 border-yellow-200",
    leave: "bg-blue-50 text-blue-700 border-blue-200"
};
var ATTENDANCE_STATUSES = ["present", "absent", "late", "half-day", "leave"];
function StatusBadge(_a) {
    var status = _a.status;
    return (React.createElement(badge_1.Badge, { variant: "outline", className: "capitalize " + (STATUS_COLORS[status] || "") },
        status === "present" && React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3 mr-1" }),
        status === "absent" && React.createElement(lucide_react_1.XCircle, { className: "h-3 w-3 mr-1" }),
        status === "late" && React.createElement(lucide_react_1.AlertCircle, { className: "h-3 w-3 mr-1" }),
        status));
}
function AttendanceForm(_a) {
    var open = _a.open, onClose = _a.onClose, editing = _a.editing, onSaved = _a.onSaved;
    var today = new Date().toISOString().split("T")[0];
    var _b = react_1.useState({
        employeeId: (editing === null || editing === void 0 ? void 0 : editing.employeeId) || "",
        date: (editing === null || editing === void 0 ? void 0 : editing.date) ? (typeof editing.date === "string" ? editing.date.split("T")[0] : new Date(editing.date).toISOString().split("T")[0]) : today,
        status: (editing === null || editing === void 0 ? void 0 : editing.status) || "present",
        checkInTime: (editing === null || editing === void 0 ? void 0 : editing.checkIn) ? new Date(editing.checkIn).toTimeString().slice(0, 5) : "08:00",
        checkOutTime: (editing === null || editing === void 0 ? void 0 : editing.checkOut) ? new Date(editing.checkOut).toTimeString().slice(0, 5) : "17:00",
        notes: (editing === null || editing === void 0 ? void 0 : editing.notes) || ""
    }), form = _b[0], setForm = _b[1];
    var createMut = trpc_1.trpc.attendance.create.useMutation({
        onSuccess: function () { sonner_1.toast.success("Attendance recorded"); onSaved(); onClose(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateMut = trpc_1.trpc.attendance.update.useMutation({
        onSuccess: function () { sonner_1.toast.success("Attendance updated"); onSaved(); onClose(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var isPending = createMut.isPending || updateMut.isPending;
    var handleSave = function () {
        if (!form.employeeId && !editing)
            return sonner_1.toast.error("Please select an employee");
        if (!form.date)
            return sonner_1.toast.error("Please select a date");
        var dateObj = new Date(form.date);
        var checkIn = form.checkInTime ? new Date(form.date + "T" + form.checkInTime + ":00") : undefined;
        var checkOut = form.checkOutTime ? new Date(form.date + "T" + form.checkOutTime + ":00") : undefined;
        if (editing) {
            updateMut.mutate({ id: editing.id, status: form.status, checkInTime: checkIn, checkOutTime: checkOut, notes: form.notes || undefined });
        }
        else {
            createMut.mutate({ employeeId: form.employeeId, date: dateObj, status: form.status, checkInTime: checkIn, checkOutTime: checkOut, notes: form.notes || undefined });
        }
    };
    return (React.createElement(dialog_1.Dialog, { open: open, onOpenChange: function (o) { return !o && onClose(); } },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null, editing ? "Edit Attendance" : "Mark Attendance"),
                React.createElement(dialog_1.DialogDescription, null, editing ? "Update attendance record" : "Record employee attendance")),
            React.createElement("div", { className: "grid gap-4 py-2" },
                !editing && (React.createElement(EmployeeSelect_1.EmployeeSelect, { value: form.employeeId, onChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { employeeId: v })); }); }, label: "Employee *", required: true })),
                React.createElement("div", { className: "grid gap-1.5" },
                    React.createElement(label_1.Label, null, "Date *"),
                    React.createElement(input_1.Input, { type: "date", value: form.date, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { date: e.target.value })); }); }, disabled: !!editing })),
                React.createElement("div", { className: "grid gap-1.5" },
                    React.createElement(label_1.Label, null, "Status *"),
                    React.createElement(select_1.Select, { value: form.status, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { status: v })); }); } },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null, ATTENDANCE_STATUSES.map(function (s) { return React.createElement(select_1.SelectItem, { key: s, value: s, className: "capitalize" }, s); })))),
                (form.status === "present" || form.status === "late" || form.status === "half-day") && (React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                    React.createElement("div", { className: "grid gap-1.5" },
                        React.createElement(label_1.Label, null, "Check-in Time"),
                        React.createElement(input_1.Input, { type: "time", value: form.checkInTime, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { checkInTime: e.target.value })); }); } })),
                    React.createElement("div", { className: "grid gap-1.5" },
                        React.createElement(label_1.Label, null, "Check-out Time"),
                        React.createElement(input_1.Input, { type: "time", value: form.checkOutTime, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { checkOutTime: e.target.value })); }); } })))),
                React.createElement("div", { className: "grid gap-1.5" },
                    React.createElement(label_1.Label, null, "Notes"),
                    React.createElement(textarea_1.Textarea, { placeholder: "Any notes...", value: form.notes, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { notes: e.target.value })); }); }, rows: 2 }))),
            React.createElement(dialog_1.DialogFooter, null,
                React.createElement(button_1.Button, { variant: "outline", onClick: onClose }, "Cancel"),
                React.createElement(button_1.Button, { onClick: handleSave, disabled: isPending },
                    isPending && React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }),
                    " ",
                    editing ? "Update" : "Save")))));
}
function BulkMarkDialog(_a) {
    var _this = this;
    var open = _a.open, onClose = _a.onClose, employees = _a.employees, onSaved = _a.onSaved;
    var today = new Date().toISOString().split("T")[0];
    var _b = react_1.useState(today), date = _b[0], setDate = _b[1];
    var _c = react_1.useState("present"), defaultStatus = _c[0], setDefaultStatus = _c[1];
    var _d = react_1.useState([]), selected = _d[0], setSelected = _d[1];
    var createMut = trpc_1.trpc.attendance.create.useMutation();
    var utils = trpc_1.trpc.useUtils();
    var toggleAll = function (checked) { return setSelected(checked ? employees.map(function (e) { return e.id; }) : []); };
    var toggle = function (id) { return setSelected(function (s) { return s.includes(id) ? s.filter(function (x) { return x !== id; }) : __spreadArrays(s, [id]); }); };
    var handleBulkMark = function () { return __awaiter(_this, void 0, void 0, function () {
        var dateObj, successCount, _i, selected_1, empId, _e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (selected.length === 0)
                        return [2 /*return*/, sonner_1.toast.error("Select at least one employee")];
                    dateObj = new Date(date);
                    successCount = 0;
                    _i = 0, selected_1 = selected;
                    _a.label = 1;
                case 1:
                    if (!(_i < selected_1.length)) return [3 /*break*/, 6];
                    empId = selected_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, createMut.mutateAsync({ employeeId: empId, date: dateObj, status: defaultStatus })];
                case 3:
                    _a.sent();
                    successCount++;
                    return [3 /*break*/, 5];
                case 4:
                    _e_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    sonner_1.toast.success("Marked attendance for " + successCount + " employees");
                    utils.attendance.list.invalidate();
                    onSaved();
                    onClose();
                    return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(dialog_1.Dialog, { open: open, onOpenChange: function (o) { return !o && onClose(); } },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-lg" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null, "Bulk Mark Attendance"),
                React.createElement(dialog_1.DialogDescription, null, "Mark attendance for multiple employees at once")),
            React.createElement("div", { className: "grid gap-4 py-2" },
                React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                    React.createElement("div", { className: "grid gap-1.5" },
                        React.createElement(label_1.Label, null, "Date"),
                        React.createElement(input_1.Input, { type: "date", value: date, onChange: function (e) { return setDate(e.target.value); } })),
                    React.createElement("div", { className: "grid gap-1.5" },
                        React.createElement(label_1.Label, null, "Default Status"),
                        React.createElement(select_1.Select, { value: defaultStatus, onValueChange: setDefaultStatus },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null, ATTENDANCE_STATUSES.map(function (s) { return React.createElement(select_1.SelectItem, { key: s, value: s, className: "capitalize" }, s); }))))),
                React.createElement("div", { className: "border rounded-lg overflow-hidden" },
                    React.createElement("div", { className: "flex items-center gap-2 px-3 py-2 bg-muted border-b" },
                        React.createElement(checkbox_1.Checkbox, { checked: selected.length === employees.length && employees.length > 0, onCheckedChange: toggleAll }),
                        React.createElement("span", { className: "text-sm font-medium" },
                            "Select All (",
                            employees.length,
                            ")"),
                        selected.length > 0 && React.createElement(badge_1.Badge, { className: "ml-auto" },
                            selected.length,
                            " selected")),
                    React.createElement("div", { className: "max-h-64 overflow-y-auto" }, employees.map(function (e) { return (React.createElement("div", { key: e.id, className: "flex items-center gap-2 px-3 py-2 hover:bg-muted/50 border-b last:border-0" },
                        React.createElement(checkbox_1.Checkbox, { checked: selected.includes(e.id), onCheckedChange: function () { return toggle(e.id); } }),
                        React.createElement("span", { className: "text-sm" },
                            e.firstName,
                            " ",
                            e.lastName),
                        e.department && React.createElement("span", { className: "text-xs text-muted-foreground ml-auto" }, e.department))); })))),
            React.createElement(dialog_1.DialogFooter, null,
                React.createElement(button_1.Button, { variant: "outline", onClick: onClose }, "Cancel"),
                React.createElement(button_1.Button, { onClick: handleBulkMark, disabled: selected.length === 0 || createMut.isPending },
                    createMut.isPending && React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }),
                    " Mark ",
                    selected.length,
                    " Employees")))));
}
function Attendance() {
    var _a = react_1.useState(""), searchQuery = _a[0], setSearchQuery = _a[1];
    var _b = react_1.useState("all"), statusFilter = _b[0], setStatusFilter = _b[1];
    var _c = react_1.useState(function () { var d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; }), dateFrom = _c[0], setDateFrom = _c[1];
    var _d = react_1.useState(function () { return new Date().toISOString().split("T")[0]; }), dateTo = _d[0], setDateTo = _d[1];
    var _f = react_1.useState(false), showForm = _f[0], setShowForm = _f[1];
    var _g = react_1.useState(null), editingRecord = _g[0], setEditingRecord = _g[1];
    var _h = react_1.useState(false), showBulk = _h[0], setShowBulk = _h[1];
    var _j = react_1.useState(null), deleteId = _j[0], setDeleteId = _j[1];
    var listQ = trpc_1.trpc.attendance.list.useQuery({ limit: 200, offset: 0 });
    var employeesQ = trpc_1.trpc.employees.list.useQuery();
    var deleteMut = trpc_1.trpc.attendance["delete"].useMutation({
        onSuccess: function () { sonner_1.toast.success("Record deleted"); listQ.refetch(); setDeleteId(null); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var records = Array.isArray(listQ.data) ? listQ.data : [];
    var employees = Array.isArray(employeesQ.data) ? employeesQ.data : [];
    var empMap = new Map(employees.map(function (e) { return [e.id, e.firstName + " " + e.lastName]; }));
    var enriched = records.map(function (r) { return (__assign(__assign({}, r), { employeeName: r.employeeName || empMap.get(r.employeeId) || r.employeeId || "Unknown", checkIn: r.checkIn || r.checkInTime || null, checkOut: r.checkOut || r.checkOutTime || null })); });
    var filtered = enriched.filter(function (r) {
        var name = (r.employeeName || "").toLowerCase();
        var matchSearch = !searchQuery || name.includes(searchQuery.toLowerCase());
        var matchStatus = statusFilter === "all" || r.status === statusFilter;
        var recDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : new Date(r.date).toISOString().split("T")[0]) : "";
        var matchFrom = !dateFrom || recDate >= dateFrom;
        var matchTo = !dateTo || recDate <= dateTo;
        return matchSearch && matchStatus && matchFrom && matchTo;
    });
    var presentCount = filtered.filter(function (r) { return r.status === "present"; }).length;
    var lateCount = filtered.filter(function (r) { return r.status === "late"; }).length;
    var absentCount = filtered.filter(function (r) { return r.status === "absent"; }).length;
    var leaveCount = filtered.filter(function (r) { return r.status === "leave"; }).length;
    var exportCSV = function () {
        var headers = ["Employee", "Date", "Status", "Check-in", "Check-out", "Notes"];
        var rows = filtered.map(function (r) { return [
            r.employeeName,
            r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : new Date(r.date).toISOString().split("T")[0]) : "",
            r.status,
            r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "",
            r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "",
            r.notes || "",
        ]; });
        var csv = __spreadArrays([headers], rows).map(function (row) { return row.map(function (c) { return "\"" + c + "\""; }).join(","); }).join("\n");
        var blob = new Blob([csv], { type: "text/csv" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "attendance_" + dateFrom + "_" + dateTo + ".csv";
        a.click();
        URL.revokeObjectURL(url);
        sonner_1.toast.success("Attendance exported");
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Attendance Management", description: "Track employee attendance and working hours", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Attendance" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowBulk(true); }, className: "gap-2" },
                React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
                " Bulk Mark"),
            React.createElement(button_1.Button, { onClick: function () { setEditingRecord(null); setShowForm(true); }, className: "gap-2" },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                " Mark Attendance")) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Present", value: presentCount, description: "In filtered range", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Late", value: lateCount, description: "Late arrivals", icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Absent", value: absentCount, description: "Not present", icon: React.createElement(lucide_react_1.XCircle, { className: "h-5 w-5" }), color: "border-l-red-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "On Leave", value: leaveCount, description: "Approved leave", icon: React.createElement(lucide_react_1.UserCheck, { className: "h-5 w-5" }), color: "border-l-blue-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement(card_1.CardTitle, null, "Attendance Records"),
                            React.createElement(card_1.CardDescription, null,
                                "Daily tracking \u2014 ",
                                filtered.length,
                                " record",
                                filtered.length !== 1 ? "s" : "")),
                        React.createElement("div", { className: "flex flex-wrap gap-2" },
                            React.createElement("div", { className: "flex items-center gap-1.5" },
                                React.createElement(input_1.Input, { type: "date", value: dateFrom, onChange: function (e) { return setDateFrom(e.target.value); }, className: "w-36 text-sm" }),
                                React.createElement("span", { className: "text-muted-foreground text-sm" }, "to"),
                                React.createElement(input_1.Input, { type: "date", value: dateTo, onChange: function (e) { return setDateTo(e.target.value); }, className: "w-36 text-sm" })),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { placeholder: "Search employee...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9 w-48" })),
                            React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                                React.createElement(select_1.SelectTrigger, { className: "w-36" },
                                    React.createElement(select_1.SelectValue, { placeholder: "All Status" })),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                                    ATTENDANCE_STATUSES.map(function (s) { return React.createElement(select_1.SelectItem, { key: s, value: s, className: "capitalize" }, s); }))),
                            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: exportCSV, className: "gap-1.5" },
                                React.createElement(lucide_react_1.Download, { className: "h-3.5 w-3.5" }),
                                " Export"),
                            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return listQ.refetch(); } },
                                React.createElement(lucide_react_1.RefreshCw, { className: "h-3.5 w-3.5" }))))),
                React.createElement(card_1.CardContent, { className: "p-0" }, listQ.isLoading ? (React.createElement("div", { className: "flex justify-center py-12" },
                    React.createElement(spinner_1.Spinner, { className: "h-6 w-6" }))) : filtered.length === 0 ? (React.createElement("div", { className: "text-center py-12 text-muted-foreground" },
                    React.createElement(lucide_react_1.Calendar, { className: "h-10 w-10 mx-auto mb-3 opacity-30" }),
                    "No attendance records found.")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Employee"),
                                React.createElement(table_1.TableHead, null, "Date"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Check-in"),
                                React.createElement(table_1.TableHead, null, "Check-out"),
                                React.createElement(table_1.TableHead, null, "Hours"),
                                React.createElement(table_1.TableHead, null, "Notes"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (r) {
                            var rawDate = r.date;
                            var displayDate = rawDate ? (function () { try {
                                return date_fns_1.format(new Date(rawDate), "dd MMM yyyy");
                            }
                            catch (_a) {
                                return String(rawDate);
                            } })() : "—";
                            var checkInDisplay = r.checkIn ? (function () { try {
                                return new Date(r.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            }
                            catch (_a) {
                                return "—";
                            } })() : "—";
                            var checkOutDisplay = r.checkOut ? (function () { try {
                                return new Date(r.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            }
                            catch (_a) {
                                return "—";
                            } })() : "—";
                            var hours = r.checkIn && r.checkOut ? ((new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 3600000).toFixed(1) : r.hoursWorked ? Number(r.hoursWorked).toFixed(1) : null;
                            return (React.createElement(table_1.TableRow, { key: r.id },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("span", { className: "font-medium" }, r.employeeName)),
                                React.createElement(table_1.TableCell, { className: "whitespace-nowrap text-sm" }, displayDate),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(StatusBadge, { status: r.status })),
                                React.createElement(table_1.TableCell, { className: "text-sm" }, checkInDisplay),
                                React.createElement(table_1.TableCell, { className: "text-sm" }, checkOutDisplay),
                                React.createElement(table_1.TableCell, { className: "text-sm font-medium" }, hours ? hours + "h" : "—"),
                                React.createElement(table_1.TableCell, { className: "max-w-[150px] truncate text-xs text-muted-foreground" }, r.notes || "—"),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("div", { className: "flex justify-end gap-1" },
                                        React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0", onClick: function () { setEditingRecord(r); setShowForm(true); } },
                                            React.createElement(lucide_react_1.Edit, { className: "h-3.5 w-3.5" })),
                                        React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0 text-destructive hover:text-destructive", onClick: function () { return setDeleteId(r.id); } },
                                            React.createElement(lucide_react_1.Trash2, { className: "h-3.5 w-3.5" }))))));
                        })))))))),
        showForm && (React.createElement(AttendanceForm, { open: showForm, onClose: function () { setShowForm(false); setEditingRecord(null); }, editing: editingRecord, onSaved: function () { return listQ.refetch(); } })),
        showBulk && (React.createElement(BulkMarkDialog, { open: showBulk, onClose: function () { return setShowBulk(false); }, employees: employees, onSaved: function () { return listQ.refetch(); } })),
        React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteId, onOpenChange: function (o) { return !o && setDeleteId(null); } },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogHeader, null,
                    React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Attendance Record?"),
                    React.createElement(alert_dialog_1.AlertDialogDescription, null, "This action cannot be undone.")),
                React.createElement(alert_dialog_1.AlertDialogFooter, null,
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", onClick: function () { return deleteId && deleteMut.mutate(deleteId); } }, "Delete"))))));
}
exports["default"] = Attendance;
