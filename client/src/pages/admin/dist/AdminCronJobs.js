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
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var badge_1 = require("@/components/ui/badge");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var trpc_1 = require("@/lib/trpc");
var CRON_PRESETS = [
    { label: "Every minute", value: "* * * * *" },
    { label: "Every hour", value: "0 * * * *" },
    { label: "Daily (midnight)", value: "0 0 * * *" },
    { label: "Daily (6 AM)", value: "0 6 * * *" },
    { label: "Weekly (Monday)", value: "0 0 * * 1" },
    { label: "Monthly (1st)", value: "0 0 1 * *" },
];
var AVAILABLE_FUNCTIONS = [
    { name: "sendReminderEmails", description: "Send payment reminder emails" },
    { name: "generateMonthlyReports", description: "Generate monthly financial reports" },
    { name: "backupDatabase", description: "Create database backup" },
    { name: "cleanupLogs", description: "Clean up old audit and system logs" },
    { name: "processFailedPayments", description: "Retry failed payment processing" },
    { name: "generateInvoices", description: "Generate recurring invoices" },
    { name: "syncData", description: "Sync data with external systems" },
    { name: "archiveOldRecords", description: "Archive records older than 1 year" },
];
function AdminCronJobs() {
    var utils = trpc_1.trpc.useUtils();
    var _a = trpc_1.trpc.cronJobs.list.useQuery({}), _b = _a.data, cronJobs = _b === void 0 ? [] : _b, isLoading = _a.isLoading;
    var createMutation = trpc_1.trpc.cronJobs.create.useMutation({
        onSuccess: function () { utils.cronJobs.list.invalidate(); sonner_1.toast.success("Cron job created"); setIsOpen(false); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateMutation = trpc_1.trpc.cronJobs.update.useMutation({
        onSuccess: function () { utils.cronJobs.list.invalidate(); sonner_1.toast.success("Cron job updated"); setIsOpen(false); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteMutation = trpc_1.trpc.cronJobs["delete"].useMutation({
        onSuccess: function () { utils.cronJobs.list.invalidate(); sonner_1.toast.success("Cron job deleted"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var toggleMutation = trpc_1.trpc.cronJobs.toggle.useMutation({
        onSuccess: function () { utils.cronJobs.list.invalidate(); sonner_1.toast.success("Cron job updated"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var runMutation = trpc_1.trpc.cronJobs.run.useMutation({
        onSuccess: function (data) { utils.cronJobs.list.invalidate(); sonner_1.toast.success("Cron job \"" + data.name + "\" executed successfully"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var _c = react_1.useState(false), isOpen = _c[0], setIsOpen = _c[1];
    var _d = react_1.useState(null), editingJob = _d[0], setEditingJob = _d[1];
    var _e = react_1.useState(""), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = react_1.useState(null), showLogs = _f[0], setShowLogs = _f[1];
    var _g = react_1.useState({
        id: "",
        name: "",
        description: "",
        schedule: "0 0 * * *",
        functionName: "",
        enabled: true,
        status: "idle"
    }), form = _g[0], setForm = _g[1];
    var filteredJobs = cronJobs.filter(function (job) {
        return job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.functionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    var handleOpenCreate = function () {
        setEditingJob(null);
        setForm({
            id: "cron-" + Date.now(),
            name: "",
            description: "",
            schedule: "0 0 * * *",
            functionName: "",
            enabled: true,
            status: "idle"
        });
        setIsOpen(true);
    };
    var handleOpenEdit = function (job) {
        setEditingJob(job);
        setForm(job);
        setIsOpen(true);
    };
    var handleSave = function () {
        if (!form.name.trim() || !form.schedule.trim() || !form.functionName) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        if (editingJob) {
            updateMutation.mutate({ id: editingJob.id, name: form.name, description: form.description, schedule: form.schedule, functionName: form.functionName, enabled: form.enabled });
        }
        else {
            createMutation.mutate({ name: form.name, description: form.description, schedule: form.schedule, functionName: form.functionName, enabled: form.enabled });
        }
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this cron job?")) {
            deleteMutation.mutate(id);
        }
    };
    var handleToggleEnabled = function (id) {
        toggleMutation.mutate(id);
    };
    var handleRunNow = function (id) {
        runMutation.mutate(id);
    };
    var getStatusBadge = function (status) {
        var variants = {
            idle: "secondary",
            running: "default",
            success: "default",
            failed: "destructive"
        };
        var labels = {
            idle: "Idle",
            running: "Running...",
            success: "Success",
            failed: "Failed"
        };
        return (react_1["default"].createElement(badge_1.Badge, { variant: variants[status] || "secondary" }, labels[status] || status));
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Cron Jobs", description: "Manage scheduled background tasks and jobs", icon: react_1["default"].createElement(lucide_react_1.Timer, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm/super-admin" },
            { label: "Administration", href: "/admin/management" },
            { label: "Cron Jobs" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Jobs")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-2xl font-bold" }, cronJobs.length))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Enabled")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-green-600" }, cronJobs.filter(function (j) { return j.enabled; }).length))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Last 24h Executions")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-2xl font-bold" }, cronJobs.filter(function (j) { return j.lastRun && j.lastRun > new Date(Date.now() - 86400000); }).length)))),
            react_1["default"].createElement("div", { className: "flex items-center justify-between gap-4" },
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement(input_1.Input, { placeholder: "Search cron jobs...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "w-full" })),
                react_1["default"].createElement(button_1.Button, { onClick: handleOpenCreate },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Cron Job")),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Scheduled Jobs"),
                    react_1["default"].createElement(card_1.CardDescription, null,
                        filteredJobs.length,
                        " job",
                        filteredJobs.length !== 1 ? "s" : "",
                        " found")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "overflow-x-auto" },
                        react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, null, "Name"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Function"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Schedule"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Last Run"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Next Run"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Enabled"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            react_1["default"].createElement(table_1.TableBody, null, filteredJobs.length === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground" }, "No cron jobs found"))) : (filteredJobs.map(function (job) { return (react_1["default"].createElement(table_1.TableRow, { key: job.id },
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("p", { className: "font-medium" }, job.name),
                                        job.description && (react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-1" }, job.description)))),
                                react_1["default"].createElement(table_1.TableCell, { className: "font-mono text-xs" }, job.functionName),
                                react_1["default"].createElement(table_1.TableCell, { className: "font-mono text-xs" }, job.schedule),
                                react_1["default"].createElement(table_1.TableCell, null, getStatusBadge(job.status)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-sm" }, job.lastRun
                                    ? date_fns_1.format(job.lastRun, "MMM dd, HH:mm")
                                    : "Never"),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-sm" }, job.nextRun
                                    ? date_fns_1.format(job.nextRun, "MMM dd, HH:mm")
                                    : "Unknown"),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("input", { type: "checkbox", checked: job.enabled, onChange: function () { return handleToggleEnabled(job.id); }, className: "cursor-pointer" })),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                    react_1["default"].createElement("div", { className: "flex justify-end gap-2" },
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleRunNow(job.id); }, disabled: !job.enabled || job.status === "running" },
                                            react_1["default"].createElement(lucide_react_1.Play, { className: "h-4 w-4" })),
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setShowLogs(showLogs === job.id ? null : job.id); } },
                                            react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleOpenEdit(job); } },
                                            react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(job.id); }, className: "text-destructive" },
                                            react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-sm" }, "Cron Expression Help")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" },
                        "Cron expressions use 5 fields: minute, hour, day of month, month, day of week",
                        react_1["default"].createElement("br", null),
                        "Format: ",
                        react_1["default"].createElement("code", { className: "bg-muted px-2 py-1 rounded" }, "minute hour day month day_of_week")),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-2" }, CRON_PRESETS.map(function (preset) { return (react_1["default"].createElement("div", { key: preset.value, className: "text-sm" },
                        react_1["default"].createElement("code", { className: "bg-muted px-2 py-1 rounded font-mono" }, preset.value),
                        react_1["default"].createElement("p", { className: "text-muted-foreground" }, preset.label))); }))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: setIsOpen },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, editingJob ? "Edit Cron Job" : "Create New Cron Job"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, editingJob
                        ? "Update the scheduled job details below"
                        : "Create a new background job to run on a schedule")),
                react_1["default"].createElement("div", { className: "space-y-4 py-4" },
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "name" }, "Job Name *"),
                        react_1["default"].createElement(input_1.Input, { id: "name", value: form.name, onChange: function (e) { return setForm(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }, placeholder: "e.g., Daily Email Reminders" })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                        react_1["default"].createElement(textarea_1.Textarea, { id: "description", value: form.description || "", onChange: function (e) {
                                return setForm(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); });
                            }, placeholder: "Enter a description of what this job does", rows: 2 })),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "functionName" }, "Function to Execute *"),
                        react_1["default"].createElement(select_1.Select, { value: form.functionName, onValueChange: function (val) { return setForm(function (prev) { return (__assign(__assign({}, prev), { functionName: val })); }); } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "w-full" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select a function..." })),
                            react_1["default"].createElement(select_1.SelectContent, { className: "max-h-60 overflow-y-auto" }, AVAILABLE_FUNCTIONS.map(function (fn) { return (react_1["default"].createElement(select_1.SelectItem, { key: fn.name, value: fn.name },
                                fn.name,
                                " - ",
                                fn.description)); })))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "schedule" }, "Cron Schedule *"),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement(input_1.Input, { id: "schedule", value: form.schedule, onChange: function (e) {
                                    return setForm(function (prev) { return (__assign(__assign({}, prev), { schedule: e.target.value })); });
                                }, placeholder: "0 0 * * * (cron format)", className: "flex-1" }),
                            react_1["default"].createElement(select_1.Select, { onValueChange: function (val) {
                                    if (val)
                                        setForm(function (prev) { return (__assign(__assign({}, prev), { schedule: val })); });
                                } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "w-48" },
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Use preset..." })),
                                react_1["default"].createElement(select_1.SelectContent, { className: "max-h-60 overflow-y-auto" }, CRON_PRESETS.map(function (preset) { return (react_1["default"].createElement(select_1.SelectItem, { key: preset.value, value: preset.value }, preset.label)); })))),
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Format: minute hour day month day_of_week (0-59, 0-23, 1-31, 1-12, 0-6)")),
                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                        react_1["default"].createElement("input", { type: "checkbox", id: "enabled", checked: form.enabled, onChange: function (e) {
                                return setForm(function (prev) { return (__assign(__assign({}, prev), { enabled: e.target.checked })); });
                            } }),
                        react_1["default"].createElement(label_1.Label, { htmlFor: "enabled", className: "cursor-pointer" }, "Enable this job"))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsOpen(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleSave },
                        editingJob ? "Update" : "Create",
                        " Job"))))));
}
exports["default"] = AdminCronJobs;
