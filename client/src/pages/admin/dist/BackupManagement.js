"use strict";
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
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var checkbox_1 = require("@/components/ui/checkbox");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var select_1 = require("@/components/ui/select");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var badge_1 = require("@/components/ui/badge");
var stats_card_1 = require("@/components/ui/stats-card");
var use_toast_1 = require("@/hooks/use-toast");
function formatBytes(bytes) {
    if (bytes === 0)
        return "0 B";
    var k = 1024;
    var sizes = ["B", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
function timeAgo(date) {
    if (!date)
        return "Never";
    var ms = Date.now() - new Date(date).getTime();
    if (ms < 60000)
        return "Just now";
    if (ms < 3600000)
        return Math.floor(ms / 60000) + "m ago";
    if (ms < 86400000)
        return Math.floor(ms / 3600000) + "h ago";
    return Math.floor(ms / 86400000) + "d ago";
}
function BackupManagement() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var _k = permissions_1.useRequireRole(["ict_manager", "super_admin", "admin"]), allowed = _k.allowed, roleLoading = _k.isLoading;
    var toast = use_toast_1.useToast().toast;
    var _l = react_1.useState(false), showCreateDialog = _l[0], setShowCreateDialog = _l[1];
    var _m = react_1.useState(false), showRestoreDialog = _m[0], setShowRestoreDialog = _m[1];
    var _o = react_1.useState(false), showScheduleDialog = _o[0], setShowScheduleDialog = _o[1];
    var _p = react_1.useState(""), backupName = _p[0], setBackupName = _p[1];
    var _q = react_1.useState("full"), backupScope = _q[0], setBackupScope = _q[1];
    var _r = react_1.useState(""), selectedOrgId = _r[0], setSelectedOrgId = _r[1];
    var _s = react_1.useState([]), selectedTables = _s[0], setSelectedTables = _s[1];
    var _t = react_1.useState("merge"), restoreMode = _t[0], setRestoreMode = _t[1];
    var _u = react_1.useState(null), restoreFile = _u[0], setRestoreFile = _u[1];
    var _v = react_1.useState([]), restoreTables = _v[0], setRestoreTables = _v[1];
    var fileInputRef = react_1.useRef(null);
    var _w = react_1.useState(""), scheduleName = _w[0], setScheduleName = _w[1];
    var _x = react_1.useState("full"), scheduleType = _x[0], setScheduleType = _x[1];
    var _y = react_1.useState("0 2 * * *"), scheduleCron = _y[0], setScheduleCron = _y[1];
    var _z = react_1.useState(30), scheduleRetention = _z[0], setScheduleRetention = _z[1];
    var _0 = react_1.useState(""), statusFilter = _0[0], setStatusFilter = _0[1];
    var statsQ = trpc_1.trpc.sysAdmin.getBackupStats.useQuery({});
    var historyQ = trpc_1.trpc.sysAdmin.listHistory.useQuery({ limit: 50, status: statusFilter && statusFilter !== "all" ? statusFilter : undefined });
    var tablesQ = trpc_1.trpc.sysAdmin.listTables.useQuery({});
    var orgsQ = trpc_1.trpc.sysAdmin.listOrganizations.useQuery({});
    var schedulesQ = trpc_1.trpc.sysAdmin.listSchedules.useQuery({});
    var createBackup = trpc_1.trpc.sysAdmin.createBackup.useMutation({
        onSuccess: function (data) {
            var blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: "application/json" });
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = data.fileName;
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: "Backup Created", description: data.stats.totalRecords + " records from " + data.stats.tablesBackedUp + " tables (" + formatBytes(data.stats.sizeBytes) + ")" });
            setShowCreateDialog(false);
            setBackupName("");
            setBackupScope("full");
            setSelectedTables([]);
            setSelectedOrgId("");
            statsQ.refetch();
            historyQ.refetch();
        },
        onError: function (err) {
            toast({ title: "Backup Failed", description: err.message, variant: "destructive" });
        }
    });
    var restoreBackup = trpc_1.trpc.sysAdmin.restoreBackup.useMutation({
        onSuccess: function (data) {
            toast({
                title: data.success ? "Restore Complete" : "Restore Completed with Errors",
                description: data.message,
                variant: data.success ? "default" : "destructive"
            });
            setShowRestoreDialog(false);
            setRestoreFile(null);
            setRestoreTables([]);
            historyQ.refetch();
            statsQ.refetch();
        },
        onError: function (err) {
            toast({ title: "Restore Failed", description: err.message, variant: "destructive" });
        }
    });
    var scheduleBackupMut = trpc_1.trpc.sysAdmin.scheduleBackup.useMutation({
        onSuccess: function () {
            toast({ title: "Schedule Created" });
            setShowScheduleDialog(false);
            setScheduleName("");
            schedulesQ.refetch();
        },
        onError: function (err) {
            toast({ title: "Schedule Failed", description: err.message, variant: "destructive" });
        }
    });
    var deleteHistory = trpc_1.trpc.sysAdmin.deleteHistoryEntry.useMutation({
        onSuccess: function () { historyQ.refetch(); statsQ.refetch(); }
    });
    var deleteSchedule = trpc_1.trpc.sysAdmin.deleteSchedule.useMutation({
        onSuccess: function () { schedulesQ.refetch(); }
    });
    var handleCreateBackup = function () {
        if (!backupName.trim()) {
            toast({ title: "Backup name required", description: "Please enter a name for the backup.", variant: "destructive" });
            return;
        }
        if (backupScope === "organization" && !selectedOrgId) {
            toast({ title: "Organization required", description: "Select an organization before running an organization-scoped backup.", variant: "destructive" });
            return;
        }
        if (backupScope === "tables" && selectedTables.length === 0) {
            toast({ title: "Select tables", description: "Choose at least one table when using table-scoped backup.", variant: "destructive" });
            return;
        }
        createBackup.mutate({
            name: backupName,
            scope: backupScope,
            organizationId: backupScope === "organization" ? selectedOrgId : undefined,
            selectedTables: backupScope === "tables" ? selectedTables : undefined
        });
    };
    var handleRestore = function () { return __awaiter(_this, void 0, void 0, function () {
        var text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!restoreFile)
                        return [2 /*return*/];
                    return [4 /*yield*/, restoreFile.text()];
                case 1:
                    text = _a.sent();
                    restoreBackup.mutate({
                        backupData: text,
                        mode: restoreMode,
                        selectedTables: restoreTables.length > 0 ? restoreTables : undefined
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    var handleRerunBackup = function (entry) {
        createBackup.mutate({
            name: entry.name,
            scope: entry.scope || "full"
        });
    };
    var toggleTable = function (key, list, setList) {
        setList(list.includes(key) ? list.filter(function (k) { return k !== key; }) : __spreadArrays(list, [key]));
    };
    var getStatusColor = function (status) {
        switch (status) {
            case "completed": return "bg-green-100 text-green-800";
            case "running": return "bg-blue-100 text-blue-800";
            case "failed": return "bg-red-100 text-red-800";
            case "completed_with_errors": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "completed": return React.createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 text-green-600" });
            case "running": return React.createElement(lucide_react_1.RefreshCw, { className: "w-4 h-4 text-blue-600 animate-spin" });
            case "failed": return React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-red-600" });
            default: return React.createElement(lucide_react_1.Clock, { className: "w-4 h-4 text-gray-600" });
        }
    };
    if (roleLoading) {
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    }
    if (!allowed)
        return null;
    var stats = statsQ.data;
    var history = (_a = historyQ.data) !== null && _a !== void 0 ? _a : [];
    var tables = (_b = tablesQ.data) !== null && _b !== void 0 ? _b : [];
    var orgs = (_c = orgsQ.data) !== null && _c !== void 0 ? _c : [];
    var schedules = (_d = schedulesQ.data) !== null && _d !== void 0 ? _d : [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Backup Management", description: "Manage database and system backups", icon: React.createElement(lucide_react_1.Monitor, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/dashboard" },
            { label: "ICT", href: "/dashboards/ict" },
            { label: "Backups" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Backups", value: (_e = stats === null || stats === void 0 ? void 0 : stats.totalBackups) !== null && _e !== void 0 ? _e : 0, description: "All backup records", icon: React.createElement(lucide_react_1.HardDrive, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Schedules", value: (_f = stats === null || stats === void 0 ? void 0 : stats.totalSchedules) !== null && _f !== void 0 ? _f : 0, description: "Active schedules", icon: React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5 text-purple-500" }), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Storage", value: formatBytes((_g = stats === null || stats === void 0 ? void 0 : stats.totalSizeBytes) !== null && _g !== void 0 ? _g : 0), description: "Backup storage used", icon: React.createElement(lucide_react_1.HardDrive, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Last Backup", value: timeAgo((_j = (_h = stats === null || stats === void 0 ? void 0 : stats.lastBackup) === null || _h === void 0 ? void 0 : _h.completedAt) !== null && _j !== void 0 ? _j : null), description: "Most recent", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-cyan-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Backup Actions")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex flex-wrap gap-3" },
                        React.createElement(button_1.Button, { className: "gap-2", onClick: function () { return setShowCreateDialog(true); } },
                            React.createElement(lucide_react_1.Play, { className: "w-4 h-4" }),
                            " Run Backup Now"),
                        React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: function () { return setShowScheduleDialog(true); } },
                            React.createElement(lucide_react_1.Clock, { className: "w-4 h-4" }),
                            " Schedule Backup"),
                        React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: function () { return setShowRestoreDialog(true); } },
                            React.createElement(lucide_react_1.Upload, { className: "w-4 h-4" }),
                            " Restore from File"),
                        React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: function () { historyQ.refetch(); statsQ.refetch(); } },
                            React.createElement(lucide_react_1.RefreshCw, { className: "w-4 h-4" }),
                            " Refresh")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement(card_1.CardTitle, null, "Backup History"),
                            React.createElement(card_1.CardDescription, null, "Recent backup and restore operations")),
                        React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                            React.createElement(select_1.SelectTrigger, { className: "w-[180px]" },
                                React.createElement(select_1.SelectValue, { placeholder: "All statuses" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "" }, "All statuses"),
                                React.createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                                React.createElement(select_1.SelectItem, { value: "running" }, "Running"),
                                React.createElement(select_1.SelectItem, { value: "failed" }, "Failed"))))),
                React.createElement(card_1.CardContent, null, historyQ.isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(spinner_1.Spinner, { className: "size-6" }))) : history.length === 0 ? (React.createElement("p", { className: "text-center text-muted-foreground py-8" }, "No backup history yet. Run your first backup above.")) : (React.createElement("div", { className: "space-y-3" }, history.map(function (entry) {
                    var _a;
                    return (React.createElement("div", { key: entry.id, className: "border rounded-lg p-4 hover:bg-muted/50 transition-colors" },
                        React.createElement("div", { className: "flex items-start justify-between mb-2" },
                            React.createElement("div", { className: "flex-1" },
                                React.createElement("div", { className: "flex items-center gap-2 mb-1" },
                                    React.createElement(badge_1.Badge, { variant: "outline", className: getStatusColor(entry.status) },
                                        React.createElement("span", { className: "flex items-center gap-1" },
                                            getStatusIcon(entry.status),
                                            " ",
                                            entry.status)),
                                    React.createElement(badge_1.Badge, { variant: "outline" }, entry.backupType),
                                    React.createElement(badge_1.Badge, { variant: "secondary" }, entry.scope || "full"),
                                    entry.sizeBytes > 0 && React.createElement(badge_1.Badge, { variant: "secondary" }, formatBytes(entry.sizeBytes))),
                                React.createElement("p", { className: "font-medium text-sm" }, entry.name),
                                entry.errorMessage && React.createElement("p", { className: "text-xs text-red-600 mt-1" }, entry.errorMessage)),
                            React.createElement("div", { className: "flex gap-1" },
                                entry.status === "completed" && entry.backupType !== "restore" && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "gap-1", onClick: function () { return handleRerunBackup(entry); } },
                                    React.createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                                    " Run again")),
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "gap-1 text-red-600", onClick: function () { return deleteHistory.mutate({ id: entry.id }); } },
                                    React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" })))),
                        React.createElement("div", { className: "grid gap-2 md:grid-cols-4 text-sm text-muted-foreground" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs opacity-70" }, "Created"),
                                React.createElement("p", null, entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—")),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs opacity-70" }, "Completed"),
                                React.createElement("p", null, entry.completedAt ? new Date(entry.completedAt).toLocaleString() : "—")),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs opacity-70" }, "Records"),
                                React.createElement("p", null, (_a = entry.recordCount) !== null && _a !== void 0 ? _a : 0)),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-xs opacity-70" }, "Tables"),
                                React.createElement("p", null, entry.tablesList || "—")))));
                }))))),
            schedules.length > 0 && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Backup Schedules")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-3" }, schedules.map(function (s) { return (React.createElement("div", { key: s.id, className: "flex items-center justify-between border rounded-lg p-3" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-medium text-sm" }, s.name),
                            React.createElement("p", { className: "text-xs text-muted-foreground" },
                                s.backupType,
                                " \u2022 ",
                                s.schedule,
                                " \u2022 Retain ",
                                s.retentionDays,
                                " days")),
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-red-600", onClick: function () { return deleteSchedule.mutate({ id: s.id }); } },
                            React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" })))); })))))),
        React.createElement(alert_dialog_1.AlertDialog, { open: showCreateDialog, onOpenChange: setShowCreateDialog },
            React.createElement(alert_dialog_1.AlertDialogContent, { className: "max-w-lg" },
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Create Backup"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, "Configure and run a new backup."),
                React.createElement("div", { className: "space-y-4 py-2" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Backup Name"),
                        React.createElement(input_1.Input, { value: backupName, onChange: function (e) { return setBackupName(e.target.value); }, placeholder: "Daily Backup - March 2025" })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Scope"),
                        React.createElement(select_1.Select, { value: backupScope, onValueChange: function (v) { return setBackupScope(v); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "full" }, "Full Backup (all tables)"),
                                React.createElement(select_1.SelectItem, { value: "organization" }, "Organization-scoped"),
                                React.createElement(select_1.SelectItem, { value: "tables" }, "Selected tables only")))),
                    backupScope === "organization" && (React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Organization"),
                        React.createElement(select_1.Select, { value: selectedOrgId, onValueChange: setSelectedOrgId },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select organization" })),
                            React.createElement(select_1.SelectContent, null, orgs.map(function (o) { return (React.createElement(select_1.SelectItem, { key: o.id, value: o.id }, o.name)); }))))),
                    backupScope === "tables" && (React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Tables"),
                        React.createElement("div", { className: "grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2" }, tables.map(function (t) { return (React.createElement("label", { key: t.key, className: "flex items-center gap-2 text-sm cursor-pointer" },
                            React.createElement(checkbox_1.Checkbox, { checked: selectedTables.includes(t.key), onCheckedChange: function () { return toggleTable(t.key, selectedTables, setSelectedTables); } }),
                            t.label)); }))))),
                React.createElement("div", { className: "flex gap-3 justify-end" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: handleCreateBackup, disabled: !backupName.trim() || createBackup.isPending }, createBackup.isPending ? React.createElement(React.Fragment, null,
                        React.createElement(spinner_1.Spinner, { className: "size-4 mr-2" }),
                        " Creating...") : React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Play, { className: "w-4 h-4 mr-2" }),
                        " Run Backup"))))),
        React.createElement(alert_dialog_1.AlertDialog, { open: showRestoreDialog, onOpenChange: setShowRestoreDialog },
            React.createElement(alert_dialog_1.AlertDialogContent, { className: "max-w-lg" },
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Restore from Backup"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, "Upload a backup JSON file to restore data. This operation cannot be undone."),
                React.createElement("div", { className: "space-y-4 py-2" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Backup File (.json)"),
                        React.createElement("div", { className: "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors", onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); } },
                            React.createElement(lucide_react_1.FileJson, { className: "w-8 h-8 mx-auto text-muted-foreground mb-2" }),
                            restoreFile ? (React.createElement("p", { className: "text-sm font-medium" },
                                restoreFile.name,
                                " (",
                                formatBytes(restoreFile.size),
                                ")")) : (React.createElement("p", { className: "text-sm text-muted-foreground" }, "Click to select backup file"))),
                        React.createElement("input", { ref: fileInputRef, type: "file", accept: ".json", className: "hidden", onChange: function (e) { var _a, _b; return setRestoreFile((_b = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null); } })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Restore Mode"),
                        React.createElement(select_1.Select, { value: restoreMode, onValueChange: function (v) { return setRestoreMode(v); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "merge" }, "Merge (skip duplicates)"),
                                React.createElement(select_1.SelectItem, { value: "replace" }, "Replace (delete existing data first)"))),
                        restoreMode === "replace" && React.createElement("p", { className: "text-xs text-red-600" }, "Warning: Replace mode will delete all existing data in restored tables before inserting.")),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Restore specific tables (optional)"),
                        React.createElement("div", { className: "grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2" }, tables.map(function (t) { return (React.createElement("label", { key: t.key, className: "flex items-center gap-2 text-sm cursor-pointer" },
                            React.createElement(checkbox_1.Checkbox, { checked: restoreTables.includes(t.key), onCheckedChange: function () { return toggleTable(t.key, restoreTables, setRestoreTables); } }),
                            t.label)); })),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Leave empty to restore all tables from backup."))),
                React.createElement("div", { className: "flex gap-3 justify-end" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: handleRestore, disabled: !restoreFile || restoreBackup.isPending, className: "bg-red-600 hover:bg-red-700" }, restoreBackup.isPending ? React.createElement(React.Fragment, null,
                        React.createElement(spinner_1.Spinner, { className: "size-4 mr-2" }),
                        " Restoring...") : React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Upload, { className: "w-4 h-4 mr-2" }),
                        " Restore"))))),
        React.createElement(alert_dialog_1.AlertDialog, { open: showScheduleDialog, onOpenChange: setShowScheduleDialog },
            React.createElement(alert_dialog_1.AlertDialogContent, { className: "max-w-md" },
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Schedule Backup"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, "Set up automatic backups on a schedule."),
                React.createElement("div", { className: "space-y-4 py-2" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Schedule Name"),
                        React.createElement(input_1.Input, { value: scheduleName, onChange: function (e) { return setScheduleName(e.target.value); }, placeholder: "Nightly Full Backup" })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Type"),
                        React.createElement(select_1.Select, { value: scheduleType, onValueChange: function (v) { return setScheduleType(v); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "full" }, "Full"),
                                React.createElement(select_1.SelectItem, { value: "incremental" }, "Incremental"),
                                React.createElement(select_1.SelectItem, { value: "differential" }, "Differential")))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Cron Schedule"),
                        React.createElement(input_1.Input, { value: scheduleCron, onChange: function (e) { return setScheduleCron(e.target.value); }, placeholder: "0 2 * * *" }),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Default: 0 2 * * * (daily at 2:00 AM)")),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Retention (days)"),
                        React.createElement(input_1.Input, { type: "number", value: scheduleRetention, onChange: function (e) { return setScheduleRetention(Number(e.target.value)); }, min: 1 }))),
                React.createElement("div", { className: "flex gap-3 justify-end" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return scheduleBackupMut.mutate({ name: scheduleName, backupType: scheduleType, schedule: scheduleCron, retentionDays: scheduleRetention }); }, disabled: !scheduleName.trim() || scheduleBackupMut.isPending }, scheduleBackupMut.isPending ? "Creating..." : "Create Schedule"))))));
}
exports["default"] = BackupManagement;
