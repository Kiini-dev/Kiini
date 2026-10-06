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
exports.__esModule = true;
var react_1 = require("react");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var label_1 = require("@/components/ui/label");
var checkbox_1 = require("@/components/ui/checkbox");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var select_1 = require("@/components/ui/select");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var badge_1 = require("@/components/ui/badge");
var use_toast_1 = require("@/components/ui/use-toast");
var textarea_1 = require("@/components/ui/textarea");
function formatBytes(bytes) {
    if (bytes === 0)
        return "0 B";
    var k = 1024;
    var sizes = ["B", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
function CSVImportExport() {
    var _this = this;
    var _a, _b, _c, _d;
    var _e = permissions_1.useRequireRole(["ict_manager", "super_admin", "admin"]), allowed = _e.allowed, roleLoading = _e.isLoading;
    var toast = use_toast_1.useToast().toast;
    var _f = react_1.useState("export"), activeTab = _f[0], setActiveTab = _f[1];
    var _g = react_1.useState(false), showExportDialog = _g[0], setShowExportDialog = _g[1];
    var _h = react_1.useState(false), showImportDialog = _h[0], setShowImportDialog = _h[1];
    var _j = react_1.useState(false), showPreviewDialog = _j[0], setShowPreviewDialog = _j[1];
    // Export state
    var _k = react_1.useState(""), exportTable = _k[0], setExportTable = _k[1];
    var _l = react_1.useState([]), exportColumns = _l[0], setExportColumns = _l[1];
    var _m = react_1.useState(","), exportDelimiter = _m[0], setExportDelimiter = _m[1];
    var _o = react_1.useState(true), exportIncludeHeaders = _o[0], setExportIncludeHeaders = _o[1];
    // Import state
    var _p = react_1.useState(""), importTable = _p[0], setImportTable = _p[1];
    var _q = react_1.useState(null), importFile = _q[0], setImportFile = _q[1];
    var _r = react_1.useState(""), importCSVText = _r[0], setImportCSVText = _r[1];
    var _s = react_1.useState(true), importHasHeaders = _s[0], setImportHasHeaders = _s[1];
    var _t = react_1.useState(true), importSkipDuplicates = _t[0], setImportSkipDuplicates = _t[1];
    var _u = react_1.useState(false), importUpdateExisting = _u[0], setImportUpdateExisting = _u[1];
    var _v = react_1.useState(","), importDelimiter = _v[0], setImportDelimiter = _v[1];
    var _w = react_1.useState(false), importValidateOnly = _w[0], setImportValidateOnly = _w[1];
    // Preview state
    var _x = react_1.useState(null), previewData = _x[0], setPreviewData = _x[1];
    var _y = react_1.useState("import"), previewType = _y[0], setPreviewType = _y[1];
    var fileInputRef = react_1.useRef(null);
    var importTextFileRef = react_1.useRef(null);
    var tablesQ = trpc_1.trpc.csv.getAvailableTables.useQuery();
    var historyQ = trpc_1.trpc.csv.getHistory.useQuery({ type: "all", limit: 50 });
    var exportTableMut = trpc_1.trpc.csv.exportTable.useMutation({
        onSuccess: function (data) {
            var blob = new Blob([data["export"].content], { type: "text/csv;charset=utf-8;" });
            var url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.href = url;
            link.download = data["export"].filename;
            link.click();
            URL.revokeObjectURL(url);
            toast({ title: "Export Successful", description: data["export"].recordCount + " records exported" });
            setShowExportDialog(false);
            setExportTable("");
            setExportColumns([]);
            historyQ.refetch();
        },
        onError: function (err) {
            toast({ title: "Export Failed", description: err.message, variant: "destructive" });
        }
    });
    var generateTemplateMut = trpc_1.trpc.csv.generateTemplate.useMutation({
        onSuccess: function (data) {
            var blob = new Blob([data.csvContent], { type: "text/csv;charset=utf-8;" });
            var url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.href = url;
            link.download = data.filename;
            link.click();
            URL.revokeObjectURL(url);
            toast({ title: "Template Downloaded", description: "CSV template for " + exportTable + " is ready" });
        },
        onError: function (err) {
            toast({ title: "Template Generation Failed", description: err.message, variant: "destructive" });
        }
    });
    var validateCSVMut = trpc_1.trpc.csv.validateCSV.useQuery({
        table: importTable,
        csvData: importCSVText,
        hasHeaders: importHasHeaders,
        delimiter: importDelimiter
    }, { enabled: false });
    var importTableMut = trpc_1.trpc.csv.importTable.useMutation({
        onSuccess: function (data) {
            toast({
                title: data.result.errors.length === 0 ? "Import Successful" : "Import Completed with Errors",
                description: data.message,
                variant: data.result.errors.length === 0 ? "default" : "destructive"
            });
            setShowImportDialog(false);
            setImportFile(null);
            setImportCSVText("");
            setImportTable("");
            historyQ.refetch();
        },
        onError: function (err) {
            toast({ title: "Import Failed", description: err.message, variant: "destructive" });
        }
    });
    var deleteHistory = trpc_1.trpc.csv.getHistory.useMutation({
        onSuccess: function () { historyQ.refetch(); }
    });
    var handleExportCSV = function () {
        if (!exportTable) {
            toast({ title: "Error", description: "Please select a table", variant: "destructive" });
            return;
        }
        exportTableMut.mutate({
            table: exportTable,
            columns: exportColumns.length > 0 ? exportColumns : undefined,
            includeHeaders: exportIncludeHeaders,
            delimiter: exportDelimiter
        });
    };
    var handleDownloadTemplate = function () {
        if (!exportTable) {
            toast({ title: "Error", description: "Please select a table", variant: "destructive" });
            return;
        }
        generateTemplateMut.mutate({ table: exportTable });
    };
    var handleFileSelect = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var file, text, lines, rows, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                    if (!file)
                        return [2 /*return*/];
                    setImportFile(file);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, file.text()];
                case 2:
                    text = _b.sent();
                    setImportCSVText(text);
                    lines = text.split("\n").slice(0, 6);
                    rows = lines.map(function (line) { return line.split(importDelimiter).map(function (cell) { return cell.replace(/"/g, ""); }); });
                    setPreviewData({
                        headers: rows[0] || [],
                        rows: rows.slice(1),
                        rowCount: text.split("\n").length - 1
                    });
                    setPreviewType("import");
                    setShowPreviewDialog(true);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    toast({ title: "Error", description: "Failed to read file", variant: "destructive" });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handlePasteCSV = function () { return __awaiter(_this, void 0, void 0, function () {
        var lines, rows;
        return __generator(this, function (_a) {
            if (!importCSVText.trim()) {
                toast({ title: "Error", description: "CSV data is empty", variant: "destructive" });
                return [2 /*return*/];
            }
            lines = importCSVText.split("\n").slice(0, 6);
            rows = lines.map(function (line) { return line.split(importDelimiter).map(function (cell) { return cell.replace(/"/g, ""); }); });
            setPreviewData({
                headers: rows[0] || [],
                rows: rows.slice(1),
                rowCount: importCSVText.split("\n").length - 1
            });
            setPreviewType("import");
            setShowPreviewDialog(true);
            return [2 /*return*/];
        });
    }); };
    var handleImportCSV = function () {
        if (!importTable || !importCSVText.trim()) {
            toast({ title: "Error", description: "Table and CSV data are required", variant: "destructive" });
            return;
        }
        if (importValidateOnly) {
            validateCSVMut.refetch();
        }
        else {
            importTableMut.mutate({
                table: importTable,
                csvData: importCSVText,
                hasHeaders: importHasHeaders,
                skipDuplicates: importSkipDuplicates,
                updateExisting: importUpdateExisting,
                validateOnly: false,
                delimiter: importDelimiter
            });
        }
    };
    if (roleLoading) {
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    }
    if (!allowed)
        return null;
    var tables = (_a = tablesQ.data) !== null && _a !== void 0 ? _a : [];
    var history = (_b = historyQ.data) !== null && _b !== void 0 ? _b : [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "CSV Import/Export", description: "Import and export data to/from CSV files", icon: React.createElement(lucide_react_1.Table2, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/dashboard" },
            { label: "Admin", href: "/admin" },
            { label: "CSV Import/Export" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex gap-2 border-b" },
                React.createElement(button_1.Button, { variant: activeTab === "export" ? "default" : "ghost", className: "gap-2", onClick: function () { return setActiveTab("export"); } },
                    React.createElement(lucide_react_1.FileDown, { className: "h-4 w-4" }),
                    "Export Data"),
                React.createElement(button_1.Button, { variant: activeTab === "import" ? "default" : "ghost", className: "gap-2", onClick: function () { return setActiveTab("import"); } },
                    React.createElement(lucide_react_1.FileUp, { className: "h-4 w-4" }),
                    "Import Data")),
            activeTab === "export" && (React.createElement("div", { className: "space-y-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.FileDown, { className: "h-5 w-5" }),
                            "Export Table Data"),
                        React.createElement(card_1.CardDescription, null, "Select a table and download its data as CSV")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Table"),
                                React.createElement(select_1.Select, { value: exportTable, onValueChange: setExportTable },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select table..." })),
                                    React.createElement(select_1.SelectContent, { className: "max-h-60" }, tables.map(function (table) { return (React.createElement(select_1.SelectItem, { key: table.name, value: table.name }, table.label || table.name)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "CSV Delimiter"),
                                React.createElement(select_1.Select, { value: exportDelimiter, onValueChange: setExportDelimiter },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "," }, "Comma (,)"),
                                        React.createElement(select_1.SelectItem, { value: ";" }, "Semicolon (;)"),
                                        React.createElement(select_1.SelectItem, { value: "\\t" }, "Tab"),
                                        React.createElement(select_1.SelectItem, { value: "|" }, "Pipe (|)"))))),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(checkbox_1.Checkbox, { id: "includeHeaders", checked: exportIncludeHeaders, onCheckedChange: function (checked) { return setExportIncludeHeaders(checked); } }),
                            React.createElement(label_1.Label, { htmlFor: "includeHeaders", className: "cursor-pointer" }, "Include header row")),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(button_1.Button, { className: "gap-2", onClick: handleExportCSV, disabled: !exportTable || exportTableMut.isPending }, exportTableMut.isPending ? (React.createElement(React.Fragment, null,
                                React.createElement(spinner_1.Spinner, { className: "size-4" }),
                                "Exporting...")) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
                                "Export Data"))),
                            React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: handleDownloadTemplate, disabled: !exportTable || generateTemplateMut.isPending }, generateTemplateMut.isPending ? (React.createElement(React.Fragment, null,
                                React.createElement(spinner_1.Spinner, { className: "size-4" }),
                                "Generating...")) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.FileDown, { className: "h-4 w-4" }),
                                "Download Template")))))))),
            activeTab === "import" && (React.createElement("div", { className: "space-y-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.FileUp, { className: "h-5 w-5" }),
                            "Import Table Data"),
                        React.createElement(card_1.CardDescription, null, "Select a table and upload CSV data")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Table"),
                                React.createElement(select_1.Select, { value: importTable, onValueChange: setImportTable },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select table..." })),
                                    React.createElement(select_1.SelectContent, { className: "max-h-60" }, tables.map(function (table) { return (React.createElement(select_1.SelectItem, { key: table.name, value: table.name }, table.label || table.name)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "CSV Delimiter"),
                                React.createElement(select_1.Select, { value: importDelimiter, onValueChange: setImportDelimiter },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "," }, "Comma (,)"),
                                        React.createElement(select_1.SelectItem, { value: ";" }, "Semicolon (;)"),
                                        React.createElement(select_1.SelectItem, { value: "\\t" }, "Tab"),
                                        React.createElement(select_1.SelectItem, { value: "|" }, "Pipe (|)"))))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "CSV Data Source"),
                            React.createElement("div", { className: "flex gap-2 mb-3" },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "gap-1", onClick: function () { var _a; return (_a = importTextFileRef.current) === null || _a === void 0 ? void 0 : _a.click(); } },
                                    React.createElement(lucide_react_1.Upload, { className: "h-4 w-4" }),
                                    "Upload File"),
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "gap-1", onClick: function () { return setShowImportDialog(true); } },
                                    React.createElement(lucide_react_1.FileUp, { className: "h-4 w-4" }),
                                    "Paste CSV"),
                                React.createElement("input", { ref: importTextFileRef, type: "file", accept: ".csv,.txt", className: "hidden", onChange: handleFileSelect }))),
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(checkbox_1.Checkbox, { id: "hasHeaders", checked: importHasHeaders, onCheckedChange: function (checked) { return setImportHasHeaders(checked); } }),
                                React.createElement(label_1.Label, { htmlFor: "hasHeaders", className: "cursor-pointer" }, "First row contains headers")),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(checkbox_1.Checkbox, { id: "skipDuplicates", checked: importSkipDuplicates, onCheckedChange: function (checked) { return setImportSkipDuplicates(checked); } }),
                                React.createElement(label_1.Label, { htmlFor: "skipDuplicates", className: "cursor-pointer" }, "Skip duplicate entries")),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(checkbox_1.Checkbox, { id: "updateExisting", checked: importUpdateExisting, onCheckedChange: function (checked) { return setImportUpdateExisting(checked); } }),
                                React.createElement(label_1.Label, { htmlFor: "updateExisting", className: "cursor-pointer" }, "Update existing records (if ID exists)")),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(checkbox_1.Checkbox, { id: "validateOnly", checked: importValidateOnly, onCheckedChange: function (checked) { return setImportValidateOnly(checked); } }),
                                React.createElement(label_1.Label, { htmlFor: "validateOnly", className: "cursor-pointer" }, "Validate only (don't import)"))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "CSV Data"),
                            React.createElement(textarea_1.Textarea, { placeholder: "Paste CSV data here or upload file...", value: importCSVText, onChange: function (e) { return setImportCSVText(e.target.value); }, rows: 6, className: "font-mono text-sm" })),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(button_1.Button, { className: "gap-2", onClick: handleImportCSV, disabled: !importTable || !importCSVText.trim() || importTableMut.isPending }, importTableMut.isPending ? (React.createElement(React.Fragment, null,
                                React.createElement(spinner_1.Spinner, { className: "size-4" }),
                                "Importing...")) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Upload, { className: "h-4 w-4" }),
                                importValidateOnly ? "Validate CSV" : "Import Data"))),
                            React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: handlePasteCSV, disabled: !importCSVText.trim() },
                                React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }),
                                "Preview")))))),
            history.length > 0 && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Recent Operations"),
                    React.createElement(card_1.CardDescription, null, "Recent import and export operations")),
                React.createElement(card_1.CardContent, null, historyQ.isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(spinner_1.Spinner, { className: "size-6" }))) : (React.createElement("div", { className: "space-y-3" }, history.map(function (entry) {
                    var _a;
                    return (React.createElement("div", { key: entry.id, className: "border rounded-lg p-4 hover:bg-muted/50" },
                        React.createElement("div", { className: "flex items-start justify-between" },
                            React.createElement("div", { className: "flex-1" },
                                React.createElement("div", { className: "flex items-center gap-2 mb-1" },
                                    ((_a = entry.type) === null || _a === void 0 ? void 0 : _a.includes("import")) ? (React.createElement(lucide_react_1.FileUp, { className: "h-4 w-4 text-blue-500" })) : (React.createElement(lucide_react_1.FileDown, { className: "h-4 w-4 text-green-500" })),
                                    React.createElement("span", { className: "font-medium text-sm" }, entry.name),
                                    React.createElement(badge_1.Badge, { variant: "outline" }, entry.status)),
                                entry.errorMessage && (React.createElement("p", { className: "text-xs text-red-600" }, entry.errorMessage)),
                                React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                                    entry.recordCount,
                                    " records \u2022 ",
                                    entry.completedAt ? new Date(entry.completedAt).toLocaleString() : "—")))));
                }))))))),
        React.createElement(alert_dialog_1.AlertDialog, { open: showPreviewDialog, onOpenChange: setShowPreviewDialog },
            React.createElement(alert_dialog_1.AlertDialogContent, { className: "max-w-2xl" },
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "CSV Preview"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null,
                    "First ",
                    Math.min((_c = previewData === null || previewData === void 0 ? void 0 : previewData.rows.length) !== null && _c !== void 0 ? _c : 0, 5),
                    " of ", (_d = previewData === null || previewData === void 0 ? void 0 : previewData.rowCount) !== null && _d !== void 0 ? _d : 0,
                    " rows"),
                React.createElement("div", { className: "overflow-x-auto max-h-64 border rounded" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", { className: "bg-muted sticky top-0" },
                            React.createElement("tr", null, previewData === null || previewData === void 0 ? void 0 : previewData.headers.map(function (header, i) { return (React.createElement("th", { key: i, className: "border-r px-2 py-1 text-left text-xs font-semibold" }, header)); }))),
                        React.createElement("tbody", null, previewData === null || previewData === void 0 ? void 0 : previewData.rows.map(function (row, i) { return (React.createElement("tr", { key: i, className: i % 2 === 0 ? "bg-white" : "bg-muted/30" }, row.map(function (cell, j) { return (React.createElement("td", { key: j, className: "border-r px-2 py-1 text-xs truncate max-w-xs" }, cell)); }))); })))),
                React.createElement("div", { className: "flex gap-3 justify-end" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Close"))))));
}
exports["default"] = CSVImportExport;
