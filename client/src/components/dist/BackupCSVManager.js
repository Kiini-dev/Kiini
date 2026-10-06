"use strict";
/**
 * Backup & CSV Management Component
 * Provides comprehensive UI for database backups, restores, and CSV import/export operations
 */
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
exports.BackupCSVManager = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var use_toast_1 = require("@/hooks/use-toast");
function BackupCSVManager() {
    var _this = this;
    var toast = use_toast_1.useToast().toast;
    var _a = react_1.useState('backup'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = react_1.useState(0), backupProgress = _b[0], setBackupProgress = _b[1];
    var _c = react_1.useState(false), isBackingUp = _c[0], setIsBackingUp = _c[1];
    var _d = react_1.useState(false), isRestoring = _d[0], setIsRestoring = _d[1];
    var _e = react_1.useState(null), selectedFile = _e[0], setSelectedFile = _e[1];
    // Backup operations
    var _f = trpc_1.trpc.backup.getBackupHistory.useQuery(), backupHistory = _f.data, refetchBackupHistory = _f.refetch;
    var backupStats = trpc_1.trpc.backup.getBackupStats.useQuery().data;
    var availableTables = trpc_1.trpc.backup.getAvailableTables.useQuery().data;
    var createFullBackup = trpc_1.trpc.backup.createFullBackup.useMutation({
        onSuccess: function (result) {
            toast({
                title: "Backup Created",
                description: result.message
            });
            refetchBackupHistory();
            setIsBackingUp(false);
            setBackupProgress(100);
        },
        onError: function (error) {
            toast({
                title: "Backup Failed",
                description: error.message,
                variant: "destructive"
            });
            setIsBackingUp(false);
            setBackupProgress(0);
        }
    });
    var createSelectiveBackup = trpc_1.trpc.backup.createSelectiveBackup.useMutation({
        onSuccess: function (result) {
            toast({
                title: "Selective Backup Created",
                description: result.message
            });
            refetchBackupHistory();
        },
        onError: function (error) {
            toast({
                title: "Backup Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });
    var restoreBackup = trpc_1.trpc.backup.restoreFromBackup.useMutation({
        onSuccess: function (result) {
            toast({
                title: "Restore Completed",
                description: result.message
            });
            setIsRestoring(false);
        },
        onError: function (error) {
            toast({
                title: "Restore Failed",
                description: error.message,
                variant: "destructive"
            });
            setIsRestoring(false);
        }
    });
    // CSV operations
    var csvTables = trpc_1.trpc.csv.getAvailableTables.useQuery().data;
    var csvHistory = trpc_1.trpc.csv.getHistory.useQuery({ limit: 20 }).data;
    var csvStats = trpc_1.trpc.csv.getStats.useQuery().data;
    var generateTemplate = trpc_1.trpc.csv.generateTemplate.useMutation({
        onSuccess: function (result) {
            // Download template
            var blob = new Blob([result.csvContent], { type: 'text/csv' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = result.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast({
                title: "Template Downloaded",
                description: "CSV template for " + result.template.table + " has been downloaded"
            });
        },
        onError: function (error) {
            toast({
                title: "Template Generation Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });
    var exportTable = trpc_1.trpc.csv.exportTable.useMutation({
        onSuccess: function (result) {
            // Download CSV
            var blob = new Blob([result["export"].content], { type: 'text/csv' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = result["export"].filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast({
                title: "Export Completed",
                description: result.message
            });
        },
        onError: function (error) {
            toast({
                title: "Export Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });
    var importTable = trpc_1.trpc.csv.importTable.useMutation({
        onSuccess: function (result) {
            toast({
                title: "Import Completed",
                description: result.message
            });
        },
        onError: function (error) {
            toast({
                title: "Import Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });
    var handleFullBackup = function () { return __awaiter(_this, void 0, void 0, function () {
        var progressInterval;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsBackingUp(true);
                    setBackupProgress(0);
                    progressInterval = setInterval(function () {
                        setBackupProgress(function (prev) {
                            if (prev >= 90) {
                                clearInterval(progressInterval);
                                return prev;
                            }
                            return prev + 10;
                        });
                    }, 500);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, createFullBackup.mutateAsync()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    clearInterval(progressInterval);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleFileRestore = function () { return __awaiter(_this, void 0, void 0, function () {
        var content, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedFile) {
                        toast({
                            title: "No File Selected",
                            description: "Please select a backup file to restore",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    setIsRestoring(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, selectedFile.text()];
                case 2:
                    content = _a.sent();
                    return [4 /*yield*/, restoreBackup.mutateAsync({
                            backupData: content,
                            mode: 'merge',
                            validateOnly: false
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    toast({
                        title: "File Read Error",
                        description: "Failed to read the backup file",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsRestoring(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var formatFileSize = function (bytes) {
        if (bytes === 0)
            return '0 Bytes';
        var k = 1024;
        var sizes = ['Bytes', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'completed':
                return react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-500" });
            case 'failed':
                return react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4 text-red-500" });
            case 'pending':
                return react_1["default"].createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-yellow-500" });
            default:
                return react_1["default"].createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-gray-500" });
        }
    };
    return (react_1["default"].createElement("div", { className: "container mx-auto p-6 space-y-6" },
        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("h1", { className: "text-3xl font-bold" }, "Data Management"),
                react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Backup, restore, and import/export your data")),
            react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () {
                    refetchBackupHistory();
                } },
                react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-2" }),
                "Refresh")),
        react_1["default"].createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab },
            react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-2" },
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "backup", className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Database, { className: "h-4 w-4" }),
                    "Backup & Restore"),
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "csv", className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
                    "CSV Import/Export")),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "backup", className: "space-y-6" },
                backupStats && (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Backup Statistics")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
                            react_1["default"].createElement("div", { className: "text-center" },
                                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, backupStats.totalBackups),
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Total Backups")),
                            react_1["default"].createElement("div", { className: "text-center" },
                                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, backupStats.successfulBackups),
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Successful")),
                            react_1["default"].createElement("div", { className: "text-center" },
                                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, formatFileSize(backupStats.totalSize)),
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Total Size")),
                            react_1["default"].createElement("div", { className: "text-center" },
                                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, backupStats.failedBackups),
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Failed")))))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Download, { className: "h-5 w-5" }),
                                "Create Backup"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Create a full database backup or selective backup of specific tables")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            isBackingUp && (react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                                    react_1["default"].createElement("span", null, "Creating backup..."),
                                    react_1["default"].createElement("span", null,
                                        backupProgress,
                                        "%")),
                                react_1["default"].createElement(progress_1.Progress, { value: backupProgress }))),
                            react_1["default"].createElement("div", { className: "flex gap-2" },
                                react_1["default"].createElement(button_1.Button, { onClick: handleFullBackup, disabled: isBackingUp || createFullBackup.isLoading, className: "flex-1" },
                                    react_1["default"].createElement(lucide_react_1.Database, { className: "h-4 w-4 mr-2" }),
                                    "Full Backup"),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () {
                                        // Open selective backup dialog
                                        toast({
                                            title: "Feature Coming Soon",
                                            description: "Selective backup interface will be available soon"
                                        });
                                    } },
                                    react_1["default"].createElement(lucide_react_1.Settings, { className: "h-4 w-4 mr-2" }),
                                    "Selective")))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Upload, { className: "h-5 w-5" }),
                                "Restore Backup"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Restore data from a backup file")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Select Backup File"),
                                react_1["default"].createElement("input", { type: "file", accept: ".json", onChange: function (e) { var _a; return setSelectedFile(((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) || null); }, className: "w-full" })),
                            react_1["default"].createElement(button_1.Button, { onClick: handleFileRestore, disabled: !selectedFile || isRestoring || restoreBackup.isLoading, variant: "destructive", className: "w-full" },
                                react_1["default"].createElement(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }),
                                isRestoring ? 'Restoring...' : 'Restore Backup'),
                            react_1["default"].createElement(alert_1.Alert, null,
                                react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4" }),
                                react_1["default"].createElement(alert_1.AlertDescription, null, "Restoring will merge data with existing records. Make sure to backup current data first."))))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Backup History"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Recent backup operations")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-96" },
                            react_1["default"].createElement("div", { className: "space-y-4" }, (backupHistory === null || backupHistory === void 0 ? void 0 : backupHistory.map(function (backup) { return (react_1["default"].createElement("div", { key: backup.id, className: "flex items-center justify-between p-4 border rounded-lg" },
                                react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                                    getStatusIcon(backup.status),
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("div", { className: "font-medium" }, backup.name),
                                        react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" },
                                            backup.recordCount,
                                            " records \u2022 ",
                                            formatFileSize(backup.sizeBytes || 0)))),
                                react_1["default"].createElement("div", { className: "text-right" },
                                    react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, date_fns_1.formatDistanceToNow(new Date(backup.createdAt), { addSuffix: true })),
                                    react_1["default"].createElement(badge_1.Badge, { variant: backup.status === 'completed' ? 'default' : 'destructive' }, backup.status)))); })) || (react_1["default"].createElement("div", { className: "text-center text-muted-foreground py-8" }, "No backup history available"))))))),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "csv", className: "space-y-6" },
                csvStats && (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "CSV Operations Statistics")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
                            react_1["default"].createElement("div", { className: "text-center" },
                                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, csvStats.totalExports),
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Total Exports")),
                            react_1["default"].createElement("div", { className: "text-center" },
                                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, csvStats.totalImports),
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Total Imports")),
                            react_1["default"].createElement("div", { className: "text-center" },
                                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, csvStats.totalRecordsExported),
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Records Exported")),
                            react_1["default"].createElement("div", { className: "text-center" },
                                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, (csvHistory === null || csvHistory === void 0 ? void 0 : csvHistory.length) || 0),
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Recent Operations")))))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.FileDown, { className: "h-5 w-5" }),
                                "CSV Templates"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Download CSV templates for importing data")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-64" },
                                react_1["default"].createElement("div", { className: "space-y-2" }, (csvTables === null || csvTables === void 0 ? void 0 : csvTables.filter(function (table) { return table.canImport; }).map(function (table) { return (react_1["default"].createElement("div", { key: table.name, className: "flex items-center justify-between p-2 border rounded" },
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("div", { className: "font-medium" }, table.name),
                                        react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, table.description)),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return generateTemplate.mutate({ table: table.name }); }, disabled: generateTemplate.isLoading },
                                        react_1["default"].createElement(lucide_react_1.Download, { className: "h-4 w-4" })))); })) || (react_1["default"].createElement("div", { className: "text-center text-muted-foreground py-8" }, "No tables available for import")))))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.FileUp, { className: "h-5 w-5" }),
                                "Export Data"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Export table data to CSV files")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-64" },
                                react_1["default"].createElement("div", { className: "space-y-2" }, (csvTables === null || csvTables === void 0 ? void 0 : csvTables.filter(function (table) { return table.canExport; }).map(function (table) { return (react_1["default"].createElement("div", { key: table.name, className: "flex items-center justify-between p-2 border rounded" },
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("div", { className: "font-medium" }, table.name),
                                        react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, table.description)),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return exportTable.mutate({ table: table.name }); }, disabled: exportTable.isLoading },
                                        react_1["default"].createElement(lucide_react_1.FileDown, { className: "h-4 w-4" })))); })) || (react_1["default"].createElement("div", { className: "text-center text-muted-foreground py-8" }, "No tables available for export"))))))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "CSV Operation History"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Recent import and export operations")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-96" },
                            react_1["default"].createElement("div", { className: "space-y-4" }, (csvHistory === null || csvHistory === void 0 ? void 0 : csvHistory.map(function (operation) { return (react_1["default"].createElement("div", { key: operation.id, className: "flex items-center justify-between p-4 border rounded-lg" },
                                react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                                    operation.type === 'csv' ? (react_1["default"].createElement(lucide_react_1.FileDown, { className: "h-4 w-4 text-blue-500" })) : (react_1["default"].createElement(lucide_react_1.FileUp, { className: "h-4 w-4 text-green-500" })),
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("div", { className: "font-medium" }, operation.name),
                                        react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" },
                                            operation.recordCount,
                                            " records \u2022 ",
                                            operation.type === 'csv' ? 'Export' : 'Import'))),
                                react_1["default"].createElement("div", { className: "text-right" },
                                    react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, date_fns_1.formatDistanceToNow(new Date(operation.createdAt), { addSuffix: true })),
                                    react_1["default"].createElement(badge_1.Badge, { variant: operation.status === 'completed' ? 'default' :
                                            operation.status === 'completed_with_errors' ? 'secondary' : 'destructive' }, operation.status.replace('_', ' '))))); })) || (react_1["default"].createElement("div", { className: "text-center text-muted-foreground py-8" }, "No CSV operation history available"))))))))));
}
exports.BackupCSVManager = BackupCSVManager;
content >
    react_1["default"].createElement("parameter", { name: "filePath" }, "e:\\Kiini\\client\\src\\components\\BackupCSVManager.tsx");
