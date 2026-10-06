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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var wouter_1 = require("wouter");
var export_utils_1 = require("@/lib/export-utils");
var checkbox_1 = require("@/components/ui/checkbox");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var trpc_1 = require("@/lib/trpc");
var STATUS_STYLES = {
    draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    invoiced: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
};
function Timesheets() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = trpc_1.trpc.timeEntries.list.useQuery({}), _c = _b.data, rawEntries = _c === void 0 ? [] : _c, isLoading = _b.isLoading;
    var entries = JSON.parse(JSON.stringify(rawEntries));
    var _d = trpc_1.trpc.projects.list.useQuery().data, rawProjects = _d === void 0 ? [] : _d;
    var projectsList = JSON.parse(JSON.stringify(rawProjects));
    var _e = trpc_1.trpc.employees.list.useQuery().data, rawEmployees = _e === void 0 ? [] : _e;
    var employeesList = JSON.parse(JSON.stringify(rawEmployees));
    var projectMap = react_1.useMemo(function () {
        var m = {};
        for (var _i = 0, projectsList_1 = projectsList; _i < projectsList_1.length; _i++) {
            var p = projectsList_1[_i];
            m[p.id] = p.name;
        }
        return m;
    }, [projectsList]);
    var userMap = react_1.useMemo(function () {
        var _a, _b;
        var m = {};
        for (var _i = 0, employeesList_1 = employeesList; _i < employeesList_1.length; _i++) {
            var e = employeesList_1[_i];
            m[e.id] = (((_a = e.firstName) !== null && _a !== void 0 ? _a : "") + " " + ((_b = e.lastName) !== null && _b !== void 0 ? _b : "")).trim() || e.email;
        }
        return m;
    }, [employeesList]);
    var createMutation = trpc_1.trpc.timeEntries.create.useMutation({
        onSuccess: function () { utils.timeEntries.list.invalidate(); setDialogOpen(false); sonner_1.toast.success("Timesheet entry created"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var deleteMutation = trpc_1.trpc.timeEntries["delete"].useMutation({
        onSuccess: function () { utils.timeEntries.list.invalidate(); sonner_1.toast.success("Entry deleted"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var submitMutation = trpc_1.trpc.timeEntries.submit.useMutation({
        onSuccess: function () { utils.timeEntries.list.invalidate(); sonner_1.toast.success("Entry submitted"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var approveMutation = trpc_1.trpc.timeEntries.approve.useMutation({
        onSuccess: function () { utils.timeEntries.list.invalidate(); sonner_1.toast.success("Entry approved"); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var _f = react_1.useState(""), search = _f[0], setSearch = _f[1];
    var _g = react_1.useState("all"), memberFilter = _g[0], setMemberFilter = _g[1];
    var _h = react_1.useState("all"), billableFilter = _h[0], setBillableFilter = _h[1];
    var _j = react_1.useState(false), dialogOpen = _j[0], setDialogOpen = _j[1];
    var _k = react_1.useState(false), showFilters = _k[0], setShowFilters = _k[1];
    var _l = react_1.useState(new Set()), selectedEntries = _l[0], setSelectedEntries = _l[1];
    var tsColumns = [
        { key: "project", label: "Project" },
        { key: "task", label: "Task" },
        { key: "teamMember", label: "Team Member" },
        { key: "date", label: "Date" },
        { key: "hours", label: "Hours" },
        { key: "billable", label: "Billable" },
        { key: "status", label: "Status" },
    ];
    var _m = TableColumnSettings_1.useColumnVisibility(tsColumns), visibleColumns = _m.visibleColumns, toggleColumn = _m.toggleColumn, isVisible = _m.isVisible;
    // Form state
    var _o = react_1.useState(""), formProject = _o[0], setFormProject = _o[1];
    var _p = react_1.useState(""), formTask = _p[0], setFormTask = _p[1];
    var _q = react_1.useState(new Date().toISOString().split("T")[0]), formDate = _q[0], setFormDate = _q[1];
    var _r = react_1.useState("1"), formHours = _r[0], setFormHours = _r[1];
    var _s = react_1.useState(""), formDescription = _s[0], setFormDescription = _s[1];
    var _t = react_1.useState(true), formBillable = _t[0], setFormBillable = _t[1];
    var _u = react_1.useState(""), formNotes = _u[0], setFormNotes = _u[1];
    // Unique team members from actual data for filter dropdown
    var teamMemberIds = react_1.useMemo(function () {
        var ids = new Set(entries.map(function (e) { return e.userId; }));
        return Array.from(ids);
    }, [entries]);
    var filtered = react_1.useMemo(function () {
        var result = entries;
        if (search) {
            var q_1 = search.toLowerCase();
            result = result.filter(function (e) {
                return (projectMap[e.projectId] || "").toLowerCase().includes(q_1) ||
                    e.description.toLowerCase().includes(q_1) ||
                    (userMap[e.userId] || "").toLowerCase().includes(q_1);
            });
        }
        if (memberFilter !== "all") {
            result = result.filter(function (e) { return e.userId === memberFilter; });
        }
        if (billableFilter !== "all") {
            result = result.filter(function (e) {
                return billableFilter === "billable" ? e.billable : !e.billable;
            });
        }
        return result.sort(function (a, b) { return (b.entryDate || "").localeCompare(a.entryDate || ""); });
    }, [entries, search, memberFilter, billableFilter, projectMap, userMap]);
    var totalHours = entries.reduce(function (sum, e) { return sum + (e.durationMinutes || 0) / 60; }, 0);
    var billableHours = entries.filter(function (e) { return e.billable; }).reduce(function (sum, e) { return sum + (e.durationMinutes || 0) / 60; }, 0);
    var invoicedHours = entries.filter(function (e) { return e.status === "invoiced"; }).reduce(function (sum, e) { return sum + (e.durationMinutes || 0) / 60; }, 0);
    var notInvoicedHours = Math.max(0, billableHours - invoicedHours);
    function openCreate() {
        var _a, _b;
        setFormProject((_b = (_a = projectsList[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : "");
        setFormTask("");
        setFormDate(new Date().toISOString().split("T")[0]);
        setFormHours("1");
        setFormDescription("");
        setFormBillable(true);
        setFormNotes("");
        setDialogOpen(true);
    }
    function handleSave() {
        if (!formProject) {
            sonner_1.toast.error("Project is required");
            return;
        }
        if (!formDescription.trim()) {
            sonner_1.toast.error("Description is required");
            return;
        }
        var hours = parseFloat(formHours);
        if (isNaN(hours) || hours <= 0) {
            sonner_1.toast.error("Enter valid hours");
            return;
        }
        createMutation.mutate({
            projectId: formProject,
            entryDate: new Date(formDate).toISOString(),
            durationMinutes: Math.round(hours * 60),
            description: formDescription.trim(),
            billable: formBillable,
            notes: formNotes || undefined
        });
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Time Sheets", icon: React.createElement(lucide_react_1.Clock, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Time Sheets" },
        ], actions: React.createElement(React.Fragment, null) },
        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-4 space-y-2" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "rounded-lg bg-blue-100 dark:bg-blue-900/40 p-2" },
                                React.createElement(lucide_react_1.Clock, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" })),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Hours Worked"),
                                React.createElement("p", { className: "text-2xl font-bold" }, totalHours.toFixed(1))))),
                    React.createElement(progress_1.Progress, { value: Math.min((totalHours / 160) * 100, 100), className: "h-2 [&>div]:bg-blue-500" }),
                    React.createElement("p", { className: "text-xs text-muted-foreground" },
                        totalHours.toFixed(1),
                        " / 160 target hours"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-4 space-y-2" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "rounded-lg bg-green-100 dark:bg-green-900/40 p-2" },
                                React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5 text-green-600 dark:text-green-400" })),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Invoiced"),
                                React.createElement("p", { className: "text-2xl font-bold" },
                                    invoicedHours.toFixed(1),
                                    "h")))),
                    React.createElement(progress_1.Progress, { value: billableHours > 0 ? (invoicedHours / billableHours) * 100 : 0, className: "h-2 [&>div]:bg-green-500" }),
                    React.createElement("p", { className: "text-xs text-muted-foreground" },
                        invoicedHours.toFixed(1),
                        " of ",
                        billableHours.toFixed(1),
                        " billable hours invoiced"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-4 space-y-2" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "rounded-lg bg-orange-100 dark:bg-orange-900/40 p-2" },
                                React.createElement(lucide_react_1.TimerOff, { className: "h-5 w-5 text-orange-600 dark:text-orange-400" })),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Not Invoiced"),
                                React.createElement("p", { className: "text-2xl font-bold" },
                                    notInvoicedHours.toFixed(1),
                                    "h")))),
                    React.createElement(progress_1.Progress, { value: billableHours > 0 ? (notInvoicedHours / billableHours) * 100 : 0, className: "h-2 [&>div]:bg-orange-500" }),
                    React.createElement("p", { className: "text-xs text-muted-foreground" },
                        notInvoicedHours.toFixed(1),
                        " billable hours pending invoice")))),
        React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: search, onSearchChange: setSearch, searchPlaceholder: "Search by project, task, or team member...", onCreateClick: openCreate, createLabel: "Log Time", onExportClick: function () { return export_utils_1.downloadCSV(filtered.map(function (e) { return ({ Project: projectMap[e.projectId] || "", Task: e.description, TeamMember: userMap[e.userId] || "", Date: e.entryDate ? new Date(e.entryDate).toLocaleDateString() : "", Hours: ((e.durationMinutes || 0) / 60).toFixed(1), Billable: e.billable ? "Yes" : "No", Status: e.status }); }), "timesheets"); }, onPrintClick: function () { return window.print(); }, filterContent: React.createElement("div", { className: "flex gap-2" },
                React.createElement(select_1.Select, { value: memberFilter, onValueChange: setMemberFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-44" },
                        React.createElement(select_1.SelectValue, { placeholder: "All Members" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Members"),
                        teamMemberIds.map(function (uid) { return (React.createElement(select_1.SelectItem, { key: uid, value: uid }, userMap[uid] || uid)); }))),
                React.createElement(select_1.Select, { value: billableFilter, onValueChange: setBillableFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-36" },
                        React.createElement(select_1.SelectValue, { placeholder: "All" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All"),
                        React.createElement(select_1.SelectItem, { value: "billable" }, "Billable"),
                        React.createElement(select_1.SelectItem, { value: "non-billable" }, "Non-Billable")))) }),
        selectedEntries.size > 0 && (React.createElement("div", { className: "flex items-center gap-3 p-3 rounded-lg border bg-primary/5" },
            React.createElement("span", { className: "text-sm font-medium" },
                selectedEntries.size,
                " selected"),
            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { var selected = filtered.filter(function (e) { return selectedEntries.has(e.id); }); export_utils_1.downloadCSV(selected.map(function (e) { return ({ Project: projectMap[e.projectId] || "", Task: e.description, TeamMember: userMap[e.userId] || "", Date: e.entryDate ? new Date(e.entryDate).toLocaleDateString() : "", Hours: ((e.durationMinutes || 0) / 60).toFixed(1), Billable: e.billable ? "Yes" : "No", Status: e.status }); }), "timesheets-selected"); } },
                React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-1" }),
                "Export"),
            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                    selectedEntries.forEach(function (id) { return approveMutation.mutate({ id: id, approve: true }); });
                    setSelectedEntries(new Set());
                } }, "Approve"),
            React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-destructive", onClick: function () {
                    selectedEntries.forEach(function (id) { return deleteMutation.mutate(id); });
                    setSelectedEntries(new Set());
                } }, "Delete"),
            React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return setSelectedEntries(new Set()); } }, "Clear"))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-0" },
                React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                    React.createElement("span", { className: "text-sm text-muted-foreground" },
                        filtered.length,
                        " entries"),
                    React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: tsColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn })),
                React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, { className: "w-10" },
                                React.createElement(checkbox_1.Checkbox, { checked: selectedEntries.size === filtered.length && filtered.length > 0, onCheckedChange: function () { if (selectedEntries.size === filtered.length)
                                        setSelectedEntries(new Set());
                                    else
                                        setSelectedEntries(new Set(filtered.map(function (e) { return e.id; }))); } })),
                            isVisible("project") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Project"),
                            isVisible("task") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Task"),
                            isVisible("teamMember") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Team Member"),
                            isVisible("date") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Date"),
                            isVisible("hours") && React.createElement(table_1.TableHead, { className: "text-right px-2 sm:px-3 text-xs sm:text-sm" }, "Hours"),
                            isVisible("billable") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Billable"),
                            isVisible("status") && React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Status"),
                            React.createElement(table_1.TableHead, { className: "text-right px-2 sm:px-3" }, "Actions"))),
                    React.createElement(table_1.TableBody, null, filtered.length === 0 ? (React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableCell, { colSpan: 9, className: "text-center py-12 text-muted-foreground" },
                            React.createElement(lucide_react_1.Clock, { className: "mx-auto h-10 w-10 mb-2 opacity-40" }),
                            React.createElement("p", null, isLoading ? "Loading timesheet entries..." : "No timesheet entries found")))) : (filtered.map(function (entry) { return (React.createElement(table_1.TableRow, { key: entry.id, className: selectedEntries.has(entry.id) ? "bg-primary/5" : "" },
                        React.createElement(table_1.TableCell, null,
                            React.createElement(checkbox_1.Checkbox, { checked: selectedEntries.has(entry.id), onCheckedChange: function () { var next = new Set(selectedEntries); if (next.has(entry.id))
                                    next["delete"](entry.id);
                                else
                                    next.add(entry.id); setSelectedEntries(next); } })),
                        isVisible("project") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm font-medium" }, projectMap[entry.projectId] || "—"),
                        isVisible("task") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, entry.description),
                        isVisible("teamMember") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, userMap[entry.userId] || "—"),
                        isVisible("date") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, entry.entryDate ? new Date(entry.entryDate).toLocaleDateString() : "—"),
                        isVisible("hours") && React.createElement(table_1.TableCell, { className: "text-right px-2 sm:px-3 text-xs sm:text-sm font-mono" }, ((entry.durationMinutes || 0) / 60).toFixed(1)),
                        isVisible("billable") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3" },
                            React.createElement(badge_1.Badge, { variant: "secondary", className: utils_1.cn("text-xs", entry.billable
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400") }, entry.billable ? "Billable" : "Non-Billable")),
                        isVisible("status") && React.createElement(table_1.TableCell, { className: "px-2 sm:px-3" },
                            React.createElement(badge_1.Badge, { variant: "secondary", className: utils_1.cn("text-xs capitalize", STATUS_STYLES[entry.status] || "") }, entry.status)),
                        React.createElement(table_1.TableCell, { className: "text-right px-2 sm:px-3" },
                            React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: __spreadArrays([
                                    { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/timesheets/" + entry.id); } }
                                ], (entry.status === "draft" ? [{ label: "Submit", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return submitMutation.mutate(entry.id); } }] : [])), menuActions: __spreadArrays((entry.status === "submitted" ? [{ label: "Approve", icon: RowActionsMenu_1.actionIcons.edit, onClick: function () { return approveMutation.mutate({ id: entry.id, approve: true }); } }] : []), [
                                    { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { return deleteMutation.mutate(entry.id); }, variant: "destructive", separator: true },
                                ]) })))); })))))),
        React.createElement(dialog_1.Dialog, { open: dialogOpen, onOpenChange: setDialogOpen },
            React.createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Log Time")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Project *"),
                        React.createElement(select_1.Select, { value: formProject, onValueChange: setFormProject },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select project" })),
                            React.createElement(select_1.SelectContent, null, projectsList.map(function (p) { return (React.createElement(select_1.SelectItem, { key: p.id, value: p.id }, p.name)); })))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "ts-desc" }, "Description *"),
                        React.createElement(textarea_1.Textarea, { id: "ts-desc", placeholder: "Brief description of work done", value: formDescription, onChange: function (e) { return setFormDescription(e.target.value); }, rows: 3 })),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "ts-date" }, "Date"),
                            React.createElement(input_1.Input, { id: "ts-date", type: "date", value: formDate, onChange: function (e) { return setFormDate(e.target.value); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "ts-hours" }, "Hours"),
                            React.createElement(input_1.Input, { id: "ts-hours", type: "number", min: "0.25", step: "0.25", value: formHours, onChange: function (e) { return setFormHours(e.target.value); } }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "ts-notes" }, "Notes"),
                        React.createElement(textarea_1.Textarea, { id: "ts-notes", placeholder: "Additional notes (optional)", value: formNotes, onChange: function (e) { return setFormNotes(e.target.value); }, rows: 2 })),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("input", { type: "checkbox", id: "ts-billable", checked: formBillable, onChange: function (e) { return setFormBillable(e.target.checked); }, className: "rounded border-gray-300" }),
                        React.createElement(label_1.Label, { htmlFor: "ts-billable", className: "cursor-pointer" }, "Billable"))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setDialogOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: handleSave, disabled: createMutation.isPending }, createMutation.isPending ? "Saving..." : "Save Entry"))))));
}
exports["default"] = Timesheets;
