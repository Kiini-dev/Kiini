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
exports.__esModule = true;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var BackupRestore = function () {
    var _a = react_1.useState(false), isBackingUp = _a[0], setIsBackingUp = _a[1];
    var _b = react_1.useState(false), isRestoring = _b[0], setIsRestoring = _b[1];
    var _c = react_1.useState(false), showRestoreConfirm = _c[0], setShowRestoreConfirm = _c[1];
    var _d = react_1.useState(null), selectedFile = _d[0], setSelectedFile = _d[1];
    var _e = react_1.useState(null), lastBackupDate = _e[0], setLastBackupDate = _e[1];
    var fileInputRef = react_1.useRef(null);
    var _f = react_1.useState(false), showScheduleDialog = _f[0], setShowScheduleDialog = _f[1];
    var _g = react_1.useState({
        name: "",
        backupType: "FULL",
        schedule: "",
        retentionDays: 30
    }), scheduleForm = _g[0], setScheduleForm = _g[1];
    // Queries and mutations
    var createBackupMutation = trpc_1.trpc.backupRestore.createBackup.useMutation({
        onSuccess: function (data) {
            var jsonString = JSON.stringify(data, null, 2);
            var blob = new Blob([jsonString], { type: 'application/json' });
            var url = window.URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = "backup_" + new Date().toISOString().split('T')[0] + "_" + Date.now() + ".json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setLastBackupDate(new Date().toLocaleString());
            var totalRecords = Object.values(data.data).reduce(function (sum, arr) { return sum + arr.length; }, 0);
            sonner_1.toast.success("Backup created with " + totalRecords + " records from " + Object.keys(data.data).length + " tables");
            setIsBackingUp(false);
            refetchBackupHistory(); // Refresh the backup history
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || 'Failed to create backup');
            setIsBackingUp(false);
        }
    });
    var restoreMutation = trpc_1.trpc.backupRestore.restoreBackup.useMutation({
        onSuccess: function (data) {
            var totalInserted = Object.values(data.results).reduce(function (sum, result) { return sum + result.inserted; }, 0);
            sonner_1.toast.success("Backup restored successfully! " + totalInserted + " records restored from " + Object.keys(data.results).length + " tables");
            setSelectedFile(null);
            setShowRestoreConfirm(false);
            setIsRestoring(false);
            refetchBackupHistory(); // Refresh the backup history
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to restore backup");
            setIsRestoring(false);
        }
    });
    var _h = trpc_1.trpc.backupRestore.listBackups.useQuery(), backupHistory = _h.data, refetchBackupHistory = _h.refetch;
    var deleteBackupMutation = trpc_1.trpc.backupRestore.deleteBackup.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Backup history entry deleted");
            refetchBackupHistory();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete backup history");
        }
    });
    var _j = trpc_1.trpc.backupRestore.listBackupSchedules.useQuery(), backupSchedules = _j.data, refetchBackupSchedules = _j.refetch;
    var createBackupScheduleMutation = trpc_1.trpc.backupRestore.createBackupSchedule.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Backup schedule created");
            refetchBackupSchedules();
            setShowScheduleDialog(false);
            setScheduleForm({ name: "", backupType: "FULL", schedule: "", retentionDays: 30 });
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create backup schedule");
        }
    });
    var updateBackupScheduleMutation = trpc_1.trpc.backupRestore.updateBackupSchedule.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Backup schedule updated");
            refetchBackupSchedules();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update backup schedule");
        }
    });
    var deleteBackupScheduleMutation = trpc_1.trpc.backupRestore.deleteBackupSchedule.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Backup schedule deleted");
            refetchBackupSchedules();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete backup schedule");
        }
    });
    var handleCreateBackup = function () {
        try {
            setIsBackingUp(true);
            createBackupMutation.mutate({
                includeActivityLogs: false,
                label: "Manual backup " + new Date().toLocaleString()
            });
        }
        catch (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to create backup');
            setIsBackingUp(false);
        }
    };
    var handleFileSelect = function (e) {
        var files = e.target.files;
        if (files && files[0]) {
            setSelectedFile(files[0]);
        }
    };
    var handleRestore = function () { return __awaiter(void 0, void 0, void 0, function () {
        var fileContent, backupData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedFile) {
                        sonner_1.toast.error('Please select a backup file to restore');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    setIsRestoring(true);
                    return [4 /*yield*/, selectedFile.text()];
                case 2:
                    fileContent = _a.sent();
                    backupData = JSON.parse(fileContent);
                    // Validate backup format
                    if (!backupData.metadata || !backupData.data) {
                        throw new Error('Invalid backup file format');
                    }
                    restoreMutation.mutate({
                        backup: backupData,
                        dryRun: false
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || 'Failed to read or parse backup file');
                    setIsRestoring(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement("div", null,
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" },
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-2" }, "Create Backup"),
                        react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Create a complete backup of your database that can be restored later.")),
                    lastBackupDate && (react_1["default"].createElement("div", { className: "flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md" },
                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "w-5 h-5 text-green-600 dark:text-green-400" }),
                        react_1["default"].createElement("span", { className: "text-sm text-green-800 dark:text-green-200" },
                            "Last backup: ",
                            lastBackupDate))),
                    react_1["default"].createElement(button_1.Button, { onClick: handleCreateBackup, disabled: isBackingUp, className: "w-full dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800" }, isBackingUp ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                        "Creating backup...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                        "Download Backup"))))),
            react_1["default"].createElement("div", { className: "p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" },
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-2" }, "Restore from Backup"),
                        react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Restore your database from a previously created backup file.")),
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md" },
                        react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" }),
                        react_1["default"].createElement("span", { className: "text-sm text-amber-800 dark:text-amber-200" }, "Restoring a backup will add new records and skip duplicates. This action cannot be undone.")),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement("label", { className: "text-sm font-medium text-slate-700 dark:text-slate-300" }, "Select Backup File"),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement("input", { ref: fileInputRef, type: "file", accept: ".json", onChange: handleFileSelect, className: "hidden" }),
                            react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: "flex-1 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700" },
                                react_1["default"].createElement(lucide_react_1.Upload, { className: "w-4 h-4 mr-2" }),
                                selectedFile ? selectedFile.name : 'Choose File'))),
                    react_1["default"].createElement(button_1.Button, { onClick: function () { return setShowRestoreConfirm(true); }, disabled: !selectedFile || isRestoring, className: "w-full bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800 text-white" }, isRestoring ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                        "Restoring...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Upload, { className: "w-4 h-4 mr-2" }),
                        "Restore Backup"))))),
            react_1["default"].createElement("div", { className: "p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" },
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white mb-2" }, "Backup History"),
                        react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-300" }, "View all backup and restore operations performed on the system.")),
                    react_1["default"].createElement("div", { className: "space-y-2 max-h-96 overflow-y-auto" }, backupHistory && backupHistory.length > 0 ? (backupHistory.map(function (backup) { return (react_1["default"].createElement("div", { key: backup.id, className: "p-3 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-600" },
                        react_1["default"].createElement("div", { className: "flex justify-between items-start" },
                            react_1["default"].createElement("div", { className: "flex-1" },
                                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                    react_1["default"].createElement("h4", { className: "font-medium text-slate-900 dark:text-white" }, backup.name),
                                    react_1["default"].createElement("span", { className: "px-2 py-1 text-xs rounded-full " + (backup.backupType === 'full' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                            backup.backupType === 'restore' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200') }, backup.backupType),
                                    react_1["default"].createElement("span", { className: "px-2 py-1 text-xs rounded-full " + (backup.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200') }, backup.status)),
                                react_1["default"].createElement("div", { className: "text-sm text-slate-600 dark:text-slate-300 mt-1" },
                                    backup.recordCount ? backup.recordCount + " records" : 'N/A',
                                    " \u2022",
                                    backup.tables ? backup.tables.length + " tables" : 'N/A',
                                    " \u2022",
                                    backup.completedAt ? new Date(backup.completedAt).toLocaleString() : 'N/A')),
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                    if (confirm('Are you sure you want to delete this backup history entry?')) {
                                        deleteBackupMutation.mutate(backup.id);
                                    }
                                }, className: "ml-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" },
                                react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }))))); })) : (react_1["default"].createElement("div", { className: "text-center py-8 text-slate-500 dark:text-slate-400" }, "No backup history available"))))),
            react_1["default"].createElement("div", { className: "p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700" },
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h3", { className: "text-lg font-semibold text-slate-900 dark:text-white" }, "Scheduled Backups"),
                            react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Manage automated backup schedules for regular system backups.")),
                        react_1["default"].createElement(button_1.Button, { onClick: function () { return setShowScheduleDialog(true); }, className: "dark:bg-blue-600 dark:hover:bg-blue-700" }, "Create Schedule")),
                    react_1["default"].createElement("div", { className: "space-y-2 max-h-96 overflow-y-auto" }, backupSchedules && backupSchedules.length > 0 ? (backupSchedules.map(function (schedule) { return (react_1["default"].createElement("div", { key: schedule.id, className: "p-3 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-600" },
                        react_1["default"].createElement("div", { className: "flex justify-between items-start" },
                            react_1["default"].createElement("div", { className: "flex-1" },
                                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                    react_1["default"].createElement("h4", { className: "font-medium text-slate-900 dark:text-white" }, schedule.name),
                                    react_1["default"].createElement("span", { className: "px-2 py-1 text-xs rounded-full " + (schedule.backupType === 'FULL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200') }, schedule.backupType),
                                    react_1["default"].createElement("span", { className: "px-2 py-1 text-xs rounded-full " + (schedule.status === 'SCHEDULED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            schedule.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200') }, schedule.status)),
                                react_1["default"].createElement("div", { className: "text-sm text-slate-600 dark:text-slate-300 mt-1" },
                                    "Schedule: ",
                                    schedule.schedule,
                                    " \u2022 Retention: ",
                                    schedule.retentionDays,
                                    " days"),
                                react_1["default"].createElement("div", { className: "text-sm text-slate-600 dark:text-slate-300" },
                                    "Last run: ",
                                    schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Never',
                                    " \u2022 Next run: ",
                                    schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'N/A')),
                            react_1["default"].createElement("div", { className: "flex gap-2 ml-2" },
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                        var newStatus = schedule.status === 'SCHEDULED' ? 'PAUSED' : 'SCHEDULED';
                                        updateBackupScheduleMutation.mutate({
                                            id: schedule.id,
                                            status: newStatus
                                        });
                                    }, className: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" }, schedule.status === 'SCHEDULED' ? 'Pause' : 'Resume'),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                        if (confirm('Are you sure you want to delete this backup schedule?')) {
                                            deleteBackupScheduleMutation.mutate(schedule.id);
                                        }
                                    }, className: "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" },
                                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" })))))); })) : (react_1["default"].createElement("div", { className: "text-center py-8 text-slate-500 dark:text-slate-400" }, "No scheduled backups configured"))))),
            react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: showScheduleDialog, onOpenChange: setShowScheduleDialog },
                react_1["default"].createElement(alert_dialog_1.AlertDialogContent, { className: "dark:bg-slate-800 dark:border-slate-700 max-w-md" },
                    react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                        react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, { className: "dark:text-white" }, "Create Backup Schedule"),
                        react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, { className: "dark:text-slate-300" }, "Set up an automated backup schedule for regular system backups.")),
                    react_1["default"].createElement("div", { className: "py-4 space-y-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" }, "Schedule Name"),
                            react_1["default"].createElement("input", { type: "text", value: scheduleForm.name, onChange: function (e) { return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }, className: "w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white", placeholder: "Daily Full Backup" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" }, "Backup Type"),
                            react_1["default"].createElement("select", { value: scheduleForm.backupType, onChange: function (e) { return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { backupType: e.target.value })); }); }, className: "w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" },
                                react_1["default"].createElement("option", { value: "FULL" }, "Full Backup"),
                                react_1["default"].createElement("option", { value: "INCREMENTAL" }, "Incremental Backup"))),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" }, "Schedule (Cron Expression)"),
                            react_1["default"].createElement("input", { type: "text", value: scheduleForm.schedule, onChange: function (e) { return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { schedule: e.target.value })); }); }, className: "w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white", placeholder: "0 2 * * * (Daily at 2 AM)" })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" }, "Retention Days"),
                            react_1["default"].createElement("input", { type: "number", value: scheduleForm.retentionDays, onChange: function (e) { return setScheduleForm(function (prev) { return (__assign(__assign({}, prev), { retentionDays: parseInt(e.target.value) || 30 })); }); }, className: "w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white", min: "1", max: "365" }))),
                    react_1["default"].createElement("div", { className: "flex gap-2 justify-end" },
                        react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, { className: "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" }, "Cancel"),
                        react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return createBackupScheduleMutation.mutate(scheduleForm); }, disabled: !scheduleForm.name || !scheduleForm.schedule }, "Create Schedule")))),
            react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: showRestoreConfirm, onOpenChange: setShowRestoreConfirm },
                react_1["default"].createElement(alert_dialog_1.AlertDialogContent, { className: "dark:bg-slate-800 dark:border-slate-700" },
                    react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                        react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, { className: "dark:text-white" }, "Confirm Restore"),
                        react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, { className: "dark:text-slate-300" }, "This will restore your database from the selected backup file. New records will be added and duplicates will be skipped. This action cannot be undone.")),
                    react_1["default"].createElement("div", { className: "py-4 space-y-2" },
                        react_1["default"].createElement("p", { className: "text-sm text-slate-700 dark:text-slate-300" },
                            react_1["default"].createElement("strong", null, "File:"),
                            " ", selectedFile === null || selectedFile === void 0 ? void 0 :
                            selectedFile.name),
                        react_1["default"].createElement("p", { className: "text-sm text-slate-700 dark:text-slate-300" },
                            react_1["default"].createElement("strong", null, "Mode:"),
                            " Merge (Add new records, skip duplicates)")),
                    react_1["default"].createElement("div", { className: "flex gap-2 justify-end" },
                        react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, { className: "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" }, "Cancel"),
                        react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: handleRestore }, "Confirm Restore")))))));
};
exports["default"] = BackupRestore;
