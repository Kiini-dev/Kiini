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
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var checkbox_1 = require("@/components/ui/checkbox");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var table_1 = require("@/components/ui/table");
function formatBytes(bytes) {
    if (bytes === 0)
        return "0 B";
    var k = 1024;
    var sizes = ["B", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
function timeAgo(dateStr) {
    if (!dateStr)
        return "Never";
    var diff = Date.now() - new Date(dateStr).getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 1)
        return "Just now";
    if (mins < 60)
        return mins + "m ago";
    var hrs = Math.floor(mins / 60);
    if (hrs < 24)
        return hrs + "h ago";
    var days = Math.floor(hrs / 24);
    return days + "d ago";
}
function statusBadge(status) {
    var map = {
        completed: { variant: "default", icon: react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-3 w-3 mr-1" }) },
        running: { variant: "secondary", icon: react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-3 w-3 mr-1 animate-spin" }) },
        pending: { variant: "outline", icon: react_1["default"].createElement(lucide_react_1.Clock, { className: "h-3 w-3 mr-1" }) },
        failed: { variant: "destructive", icon: react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-3 w-3 mr-1" }) },
        completed_with_errors: { variant: "secondary", icon: react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "h-3 w-3 mr-1" }) }
    };
    var cfg = map[status] || map.pending;
    return (react_1["default"].createElement(badge_1.Badge, { variant: cfg.variant, className: "flex items-center w-fit" },
        cfg.icon,
        status.replace(/_/g, " ")));
}
function BackupManagement() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var _j = react_1.useState("create"), activeTab = _j[0], setActiveTab = _j[1];
    // ─── Queries ───────────────────────────────────────────────
    var stats = trpc_1.trpc.sysAdmin.getBackupStats.useQuery(undefined, { refetchInterval: 30000 });
    var history = trpc_1.trpc.sysAdmin.listHistory.useQuery({ limit: 100 });
    var schedules = trpc_1.trpc.sysAdmin.listSchedules.useQuery({});
    var tables = trpc_1.trpc.sysAdmin.listTables.useQuery({});
    var orgs = trpc_1.trpc.sysAdmin.listOrganizations.useQuery({});
    // ─── Mutations ─────────────────────────────────────────────
    var createBackup = trpc_1.trpc.sysAdmin.createBackup.useMutation();
    var restoreBackup = trpc_1.trpc.sysAdmin.restoreBackup.useMutation();
    var deleteEntry = trpc_1.trpc.sysAdmin.deleteHistoryEntry.useMutation();
    var createSchedule = trpc_1.trpc.sysAdmin.scheduleBackup.useMutation();
    var deleteSchedule = trpc_1.trpc.sysAdmin.deleteSchedule.useMutation();
    // ─── Create Backup State ──────────────────────────────────
    var _k = react_1.useState(""), backupName = _k[0], setBackupName = _k[1];
    var _l = react_1.useState("full"), backupScope = _l[0], setBackupScope = _l[1];
    var _m = react_1.useState(""), selectedOrg = _m[0], setSelectedOrg = _m[1];
    var _o = react_1.useState([]), selectedTables = _o[0], setSelectedTables = _o[1];
    var _p = react_1.useState(false), creating = _p[0], setCreating = _p[1];
    // ─── Restore State ────────────────────────────────────────
    var _q = react_1.useState(null), restoreFile = _q[0], setRestoreFile = _q[1];
    var _r = react_1.useState("merge"), restoreMode = _r[0], setRestoreMode = _r[1];
    var _s = react_1.useState([]), restoreSelectedTables = _s[0], setRestoreSelectedTables = _s[1];
    var _t = react_1.useState(null), restorePreview = _t[0], setRestorePreview = _t[1];
    var _u = react_1.useState(false), restoring = _u[0], setRestoring = _u[1];
    var _v = react_1.useState(false), showRestoreConfirm = _v[0], setShowRestoreConfirm = _v[1];
    var fileInputRef = react_1.useRef(null);
    // ─── Schedule Dialog State ────────────────────────────────
    var _w = react_1.useState(false), showScheduleDialog = _w[0], setShowScheduleDialog = _w[1];
    var _x = react_1.useState(""), schedName = _x[0], setSchedName = _x[1];
    var _y = react_1.useState("full"), schedType = _y[0], setSchedType = _y[1];
    var _z = react_1.useState("0 2 * * 0"), schedCron = _z[0], setSchedCron = _z[1];
    var _0 = react_1.useState(30), schedRetention = _0[0], setSchedRetention = _0[1];
    // ─── Create Backup Handler ────────────────────────────────
    var handleCreateBackup = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var result, blob, url, a, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!backupName.trim()) {
                        sonner_1.toast.error("Please enter a backup name");
                        return [2 /*return*/];
                    }
                    if (backupScope === "organization" && !selectedOrg) {
                        sonner_1.toast.error("Please select an organization");
                        return [2 /*return*/];
                    }
                    if (backupScope === "tables" && selectedTables.length === 0) {
                        sonner_1.toast.error("Please select at least one table");
                        return [2 /*return*/];
                    }
                    setCreating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, createBackup.mutateAsync({
                            name: backupName.trim(),
                            scope: backupScope,
                            organizationId: backupScope === "organization" ? selectedOrg : undefined,
                            selectedTables: backupScope === "tables" ? selectedTables : undefined
                        })];
                case 2:
                    result = _a.sent();
                    blob = new Blob([JSON.stringify(result.backup, null, 2)], { type: "application/json" });
                    url = URL.createObjectURL(blob);
                    a = document.createElement("a");
                    a.href = url;
                    a.download = result.fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    sonner_1.toast.success("Backup created: " + result.stats.totalRecords + " records from " + result.stats.tablesBackedUp + " tables");
                    setBackupName("");
                    setBackupScope("full");
                    setSelectedOrg("");
                    setSelectedTables([]);
                    history.refetch();
                    stats.refetch();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    sonner_1.toast.error(err_1.message || "Backup failed");
                    return [3 /*break*/, 5];
                case 4:
                    setCreating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [backupName, backupScope, selectedOrg, selectedTables, createBackup, history, stats]);
    // ─── File Upload Handler ──────────────────────────────────
    var handleFileChange = react_1.useCallback(function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        setRestoreFile(file);
        var reader = new FileReader();
        reader.onload = function (ev) {
            var _a, _b;
            try {
                var json = JSON.parse((_a = ev.target) === null || _a === void 0 ? void 0 : _a.result);
                if (!json.metadata || !json.data) {
                    sonner_1.toast.error("Invalid backup file format");
                    setRestorePreview(null);
                    return;
                }
                var tableSummary = Object.entries(json.data).map(function (_a) {
                    var k = _a[0], v = _a[1];
                    return ({
                        key: k,
                        count: Array.isArray(v) ? v.length : 0
                    });
                });
                setRestorePreview({ metadata: json.metadata, tables: tableSummary, rawSize: ((_b = ev.target) === null || _b === void 0 ? void 0 : _b.result).length });
                setRestoreSelectedTables(tableSummary.map(function (t) { return t.key; }));
            }
            catch (_c) {
                sonner_1.toast.error("Could not parse backup file");
                setRestorePreview(null);
            }
        };
        reader.readAsText(file);
    }, []);
    // ─── Restore Handler ─────────────────────────────────────
    var handleRestore = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var text, result, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!restoreFile)
                        return [2 /*return*/];
                    setRestoring(true);
                    setShowRestoreConfirm(false);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, restoreFile.text()];
                case 2:
                    text = _a.sent();
                    return [4 /*yield*/, restoreBackup.mutateAsync({
                            backupData: text,
                            mode: restoreMode,
                            selectedTables: restoreSelectedTables.length > 0 ? restoreSelectedTables : undefined
                        })];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        sonner_1.toast.success(result.message);
                    }
                    else {
                        sonner_1.toast.warning("Restored with errors: " + result.message);
                    }
                    setRestoreFile(null);
                    setRestorePreview(null);
                    setRestoreSelectedTables([]);
                    if (fileInputRef.current)
                        fileInputRef.current.value = "";
                    history.refetch();
                    return [3 /*break*/, 6];
                case 4:
                    err_2 = _a.sent();
                    sonner_1.toast.error(err_2.message || "Restore failed");
                    return [3 /*break*/, 6];
                case 5:
                    setRestoring(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [restoreFile, restoreMode, restoreSelectedTables, restoreBackup, history]);
    // ─── Schedule Handler ─────────────────────────────────────
    var handleCreateSchedule = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!schedName.trim()) {
                        sonner_1.toast.error("Enter a schedule name");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, createSchedule.mutateAsync({
                            name: schedName.trim(),
                            backupType: schedType,
                            schedule: schedCron,
                            retentionDays: schedRetention
                        })];
                case 2:
                    _a.sent();
                    sonner_1.toast.success("Schedule created");
                    setShowScheduleDialog(false);
                    setSchedName("");
                    schedules.refetch();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    sonner_1.toast.error(err_3.message || "Failed to create schedule");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [schedName, schedType, schedCron, schedRetention, createSchedule, schedules]);
    // ─── Table toggle ─────────────────────────────────────────
    var toggleTable = function (key, list, setter) {
        setter(list.includes(key) ? list.filter(function (t) { return t !== key; }) : __spreadArrays(list, [key]));
    };
    return (react_1["default"].createElement(ModuleLayout_1["default"], { title: "Backup Management", description: "Create, manage and restore database backups", icon: react_1["default"].createElement(lucide_react_1.Database, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Admin", href: "/admin/management" },
            { label: "Backup Management" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
                react_1["default"].createElement(card_1.Card, { className: "border-l-4 border-l-blue-500" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-4" },
                        react_1["default"].createElement("p", { className: "text-sm text-muted-foreground flex items-center gap-1" },
                            react_1["default"].createElement(lucide_react_1.Clock, { className: "h-3.5 w-3.5" }),
                            " Last Backup"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold" }, timeAgo((_b = (_a = stats.data) === null || _a === void 0 ? void 0 : _a.lastBackup) === null || _b === void 0 ? void 0 : _b.completedAt)))),
                react_1["default"].createElement(card_1.Card, { className: "border-l-4 border-l-green-500" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-4" },
                        react_1["default"].createElement("p", { className: "text-sm text-muted-foreground flex items-center gap-1" },
                            react_1["default"].createElement(lucide_react_1.FileArchive, { className: "h-3.5 w-3.5" }),
                            " Total Backups"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_d = (_c = stats.data) === null || _c === void 0 ? void 0 : _c.totalBackups) !== null && _d !== void 0 ? _d : 0))),
                react_1["default"].createElement(card_1.Card, { className: "border-l-4 border-l-purple-500" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-4" },
                        react_1["default"].createElement("p", { className: "text-sm text-muted-foreground flex items-center gap-1" },
                            react_1["default"].createElement(lucide_react_1.HardDrive, { className: "h-3.5 w-3.5" }),
                            " Total Size"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold" }, formatBytes(Number((_e = stats.data) === null || _e === void 0 ? void 0 : _e.totalSizeBytes) || 0)))),
                react_1["default"].createElement(card_1.Card, { className: "border-l-4 border-l-orange-500" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-4" },
                        react_1["default"].createElement("p", { className: "text-sm text-muted-foreground flex items-center gap-1" },
                            react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "h-3.5 w-3.5" }),
                            " Schedules"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold" }, (_g = (_f = stats.data) === null || _f === void 0 ? void 0 : _f.totalSchedules) !== null && _g !== void 0 ? _g : 0)))),
            react_1["default"].createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab },
                react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "create" }, "Create Backup"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "history" }, "Backup History"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "restore" }, "Restore"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "schedules" }, "Schedules")),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "create" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Download, { className: "h-5 w-5" }),
                                " Create New Backup")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-5" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement(label_1.Label, { htmlFor: "backupName" }, "Backup Name"),
                                react_1["default"].createElement(input_1.Input, { id: "backupName", placeholder: "e.g. Daily Full Backup", value: backupName, onChange: function (e) { return setBackupName(e.target.value); }, className: "mt-1" })),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement(label_1.Label, null, "Scope"),
                                react_1["default"].createElement(select_1.Select, { value: backupScope, onValueChange: function (v) { return setBackupScope(v); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "mt-1" },
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "full" }, "Full Database"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "organization" }, "Single Organization"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "tables" }, "Selected Tables")))),
                            backupScope === "organization" && (react_1["default"].createElement("div", null,
                                react_1["default"].createElement(label_1.Label, null, "Organization"),
                                react_1["default"].createElement(select_1.Select, { value: selectedOrg, onValueChange: setSelectedOrg },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "mt-1" },
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select organization" })),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        (orgs.data || []).map(function (o) { return (react_1["default"].createElement(select_1.SelectItem, { key: o.id, value: o.id },
                                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                                react_1["default"].createElement(lucide_react_1.Building2, { className: "h-3.5 w-3.5" }),
                                                " ",
                                                o.name))); }),
                                        (!orgs.data || orgs.data.length === 0) && (react_1["default"].createElement(select_1.SelectItem, { value: "__none", disabled: true }, "No organizations found")))))),
                            backupScope === "tables" && (react_1["default"].createElement("div", null,
                                react_1["default"].createElement(label_1.Label, null, "Tables"),
                                react_1["default"].createElement("div", { className: "mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" }, (tables.data || []).map(function (t) { return (react_1["default"].createElement("label", { key: t.key, className: "flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted transition-colors" },
                                    react_1["default"].createElement(checkbox_1.Checkbox, { checked: selectedTables.includes(t.key), onCheckedChange: function () { return toggleTable(t.key, selectedTables, setSelectedTables); } }),
                                    react_1["default"].createElement("span", { className: "text-sm" }, t.label))); })),
                                selectedTables.length > 0 && (react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                                    selectedTables.length,
                                    " table(s) selected")))),
                            react_1["default"].createElement(button_1.Button, { onClick: handleCreateBackup, disabled: creating, className: "w-full sm:w-auto" }, creating ? react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                                " Creating...") : react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }),
                                " Create & Download Backup"))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "history" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.FileArchive, { className: "h-5 w-5" }),
                                " Backup History"),
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return history.refetch(); } },
                                react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-1" }),
                                " Refresh")),
                        react_1["default"].createElement(card_1.CardContent, null, history.isLoading ? (react_1["default"].createElement("div", { className: "flex justify-center p-8" },
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : !history.data || history.data.length === 0 ? (react_1["default"].createElement("div", { className: "text-center p-8 text-muted-foreground" },
                            react_1["default"].createElement(lucide_react_1.Database, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }),
                            react_1["default"].createElement("p", null, "No backup history yet. Create your first backup above."))) : (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                            react_1["default"].createElement(table_1.Table, null,
                                react_1["default"].createElement(table_1.TableHeader, null,
                                    react_1["default"].createElement(table_1.TableRow, null,
                                        react_1["default"].createElement(table_1.TableHead, null, "Name"),
                                        react_1["default"].createElement(table_1.TableHead, null, "Type"),
                                        react_1["default"].createElement(table_1.TableHead, null, "Scope"),
                                        react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                        react_1["default"].createElement(table_1.TableHead, null, "Records"),
                                        react_1["default"].createElement(table_1.TableHead, null, "Size"),
                                        react_1["default"].createElement(table_1.TableHead, null, "Created"),
                                        react_1["default"].createElement(table_1.TableHead, null))),
                                react_1["default"].createElement(table_1.TableBody, null, history.data.map(function (h) { return (react_1["default"].createElement(table_1.TableRow, { key: h.id },
                                    react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, h.name),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(badge_1.Badge, { variant: "outline" }, h.backupType)),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(badge_1.Badge, { variant: "secondary" }, h.scope)),
                                    react_1["default"].createElement(table_1.TableCell, null, statusBadge(h.status)),
                                    react_1["default"].createElement(table_1.TableCell, null, (h.recordCount || 0).toLocaleString()),
                                    react_1["default"].createElement(table_1.TableCell, null, formatBytes(h.sizeBytes || 0)),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-muted-foreground" }, timeAgo(h.createdAt)),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, deleteEntry.mutateAsync({ id: h.id })];
                                                        case 1:
                                                            _a.sent();
                                                            sonner_1.toast.success("Entry deleted");
                                                            history.refetch();
                                                            stats.refetch();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); } },
                                            react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-3.5 w-3.5 text-destructive" }))))); })))))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "restore" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Upload, { className: "h-5 w-5" }),
                                " Restore from Backup")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-5" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement(label_1.Label, null, "Upload Backup File (.json)"),
                                react_1["default"].createElement(input_1.Input, { ref: fileInputRef, type: "file", accept: ".json", onChange: handleFileChange, className: "mt-1" })),
                            restorePreview && (react_1["default"].createElement("div", { className: "space-y-4" },
                                react_1["default"].createElement(card_1.Card, { className: "bg-muted/50" },
                                    react_1["default"].createElement(card_1.CardContent, { className: "p-4 space-y-3" },
                                        react_1["default"].createElement("h4", { className: "font-semibold" }, "Backup Info"),
                                        react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 text-sm" },
                                            react_1["default"].createElement("div", null,
                                                react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Name:"),
                                                " ",
                                                react_1["default"].createElement("strong", null, restorePreview.metadata.name)),
                                            react_1["default"].createElement("div", null,
                                                react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Scope:"),
                                                " ",
                                                react_1["default"].createElement("strong", null, restorePreview.metadata.scope)),
                                            react_1["default"].createElement("div", null,
                                                react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Created:"),
                                                " ",
                                                react_1["default"].createElement("strong", null, new Date(restorePreview.metadata.timestamp).toLocaleDateString())),
                                            react_1["default"].createElement("div", null,
                                                react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Size:"),
                                                " ",
                                                react_1["default"].createElement("strong", null, formatBytes(restorePreview.rawSize)))))),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(label_1.Label, null, "Restore Mode"),
                                    react_1["default"].createElement(select_1.Select, { value: restoreMode, onValueChange: function (v) { return setRestoreMode(v); } },
                                        react_1["default"].createElement(select_1.SelectTrigger, { className: "mt-1" },
                                            react_1["default"].createElement(select_1.SelectValue, null)),
                                        react_1["default"].createElement(select_1.SelectContent, null,
                                            react_1["default"].createElement(select_1.SelectItem, { value: "merge" }, "Merge \u2014 skip duplicates, add new records only"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "replace" }, "Replace \u2014 overwrite existing data (destructive)")))),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(label_1.Label, null,
                                        "Tables to Restore (",
                                        restoreSelectedTables.length,
                                        " of ",
                                        restorePreview.tables.length,
                                        ")"),
                                    react_1["default"].createElement("div", { className: "mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" }, restorePreview.tables.map(function (t) { return (react_1["default"].createElement("label", { key: t.key, className: "flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted transition-colors" },
                                        react_1["default"].createElement(checkbox_1.Checkbox, { checked: restoreSelectedTables.includes(t.key), onCheckedChange: function () { return toggleTable(t.key, restoreSelectedTables, setRestoreSelectedTables); } }),
                                        react_1["default"].createElement("span", { className: "text-sm" },
                                            t.key,
                                            " ",
                                            react_1["default"].createElement("span", { className: "text-muted-foreground" },
                                                "(",
                                                t.count,
                                                ")")))); }))),
                                restoreMode === "replace" && (react_1["default"].createElement("div", { className: "p-3 border border-destructive/50 rounded-lg bg-destructive/5 flex items-start gap-2" },
                                    react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5 text-destructive shrink-0 mt-0.5" }),
                                    react_1["default"].createElement("div", { className: "text-sm" },
                                        react_1["default"].createElement("strong", { className: "text-destructive" }, "Warning:"),
                                        " Replace mode will delete all existing data in the selected tables before inserting the backup records. This operation is destructive and cannot be undone."))),
                                react_1["default"].createElement(button_1.Button, { onClick: function () { return setShowRestoreConfirm(true); }, disabled: restoring || restoreSelectedTables.length === 0 }, restoring ? react_1["default"].createElement(react_1["default"].Fragment, null,
                                    react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                                    " Restoring...") : react_1["default"].createElement(react_1["default"].Fragment, null,
                                    react_1["default"].createElement(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }),
                                    " Start Restore"))))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "schedules" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Clock, { className: "h-5 w-5" }),
                                " Backup Schedules"),
                            react_1["default"].createElement(button_1.Button, { size: "sm", onClick: function () { return setShowScheduleDialog(true); } },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                                " Add Schedule")),
                        react_1["default"].createElement(card_1.CardContent, null, schedules.isLoading ? (react_1["default"].createElement("div", { className: "flex justify-center p-8" },
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : !schedules.data || schedules.data.length === 0 ? (react_1["default"].createElement("div", { className: "text-center p-8 text-muted-foreground" },
                            react_1["default"].createElement(lucide_react_1.Clock, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }),
                            react_1["default"].createElement("p", null, "No backup schedules configured."))) : (react_1["default"].createElement("div", { className: "space-y-3" }, schedules.data.map(function (s) { return (react_1["default"].createElement("div", { key: s.id, className: "flex items-center justify-between p-4 rounded-lg border" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "font-medium" }, s.name),
                                react_1["default"].createElement("div", { className: "flex gap-3 text-sm text-muted-foreground mt-1" },
                                    react_1["default"].createElement("span", null,
                                        "Type: ",
                                        react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "ml-1" }, s.backupType)),
                                    react_1["default"].createElement("span", null,
                                        "Schedule: ",
                                        react_1["default"].createElement("code", { className: "bg-muted px-1 rounded" }, s.schedule)),
                                    react_1["default"].createElement("span", null,
                                        "Retention: ",
                                        s.retentionDays,
                                        "d")),
                                react_1["default"].createElement("div", { className: "flex gap-3 text-xs text-muted-foreground mt-1" },
                                    react_1["default"].createElement("span", null,
                                        "Last run: ",
                                        timeAgo(s.lastRun)),
                                    react_1["default"].createElement("span", null,
                                        "Next run: ",
                                        s.nextRun ? new Date(s.nextRun).toLocaleString() : "—"))),
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, deleteSchedule.mutateAsync({ id: s.id })];
                                            case 1:
                                                _a.sent();
                                                sonner_1.toast.success("Schedule deleted");
                                                schedules.refetch();
                                                stats.refetch();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); } },
                                react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-destructive" })))); })))))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showRestoreConfirm, onOpenChange: setShowRestoreConfirm },
            react_1["default"].createElement(dialog_1.DialogContent, null,
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Confirm Restore")),
                react_1["default"].createElement("div", { className: "space-y-3 text-sm" },
                    react_1["default"].createElement("p", null,
                        "You are about to restore data from backup ",
                        react_1["default"].createElement("strong", null, (_h = restorePreview === null || restorePreview === void 0 ? void 0 : restorePreview.metadata) === null || _h === void 0 ? void 0 : _h.name),
                        "."),
                    react_1["default"].createElement("p", null,
                        "Mode: ",
                        react_1["default"].createElement(badge_1.Badge, { variant: "outline" }, restoreMode)),
                    react_1["default"].createElement("p", null,
                        "Tables: ",
                        restoreSelectedTables.length,
                        " selected"),
                    react_1["default"].createElement("p", { className: "text-muted-foreground" }, "This action cannot be easily undone. Ensure you have a current backup before proceeding.")),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowRestoreConfirm(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleRestore, disabled: restoring }, restoring ? react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        " Restoring...") : "Confirm Restore")))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showScheduleDialog, onOpenChange: setShowScheduleDialog },
            react_1["default"].createElement(dialog_1.DialogContent, null,
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Create Backup Schedule")),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, null, "Schedule Name"),
                        react_1["default"].createElement(input_1.Input, { placeholder: "e.g. Weekly Full Backup", value: schedName, onChange: function (e) { return setSchedName(e.target.value); }, className: "mt-1" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, null, "Backup Type"),
                        react_1["default"].createElement(select_1.Select, { value: schedType, onValueChange: function (v) { return setSchedType(v); } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "mt-1" },
                                react_1["default"].createElement(select_1.SelectValue, null)),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "full" }, "Full"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "incremental" }, "Incremental"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "differential" }, "Differential")))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, null, "Cron Schedule"),
                        react_1["default"].createElement(input_1.Input, { placeholder: "0 2 * * 0", value: schedCron, onChange: function (e) { return setSchedCron(e.target.value); }, className: "mt-1" }),
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Format: minute hour day-of-month month day-of-week")),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, null, "Retention (days)"),
                        react_1["default"].createElement(input_1.Input, { type: "number", value: schedRetention, onChange: function (e) { return setSchedRetention(Number(e.target.value)); }, className: "mt-1" }))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowScheduleDialog(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleCreateSchedule }, "Create Schedule"))))));
}
exports["default"] = BackupManagement;
