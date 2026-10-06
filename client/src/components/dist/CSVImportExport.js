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
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var csvGenerator_1 = require("@/utils/csvGenerator");
function CSVImportExport() {
    var _this = this;
    var _a = react_1.useState('clients'), selectedModule = _a[0], setSelectedModule = _a[1];
    var _b = react_1.useState(null), uploadedFile = _b[0], setUploadedFile = _b[1];
    var _c = react_1.useState([]), previewData = _c[0], setPreviewData = _c[1];
    var _d = react_1.useState(false), showPreview = _d[0], setShowPreview = _d[1];
    var _e = react_1.useState(false), isImporting = _e[0], setIsImporting = _e[1];
    var _f = react_1.useState(null), importResult = _f[0], setImportResult = _f[1];
    var _g = react_1.useState(true), skipDuplicates = _g[0], setSkipDuplicates = _g[1];
    var modules = csvGenerator_1.getAvailableModules();
    // TRPC mutations
    var generateTemplateMutation = trpc_1.trpc.csvImportExport.generateTemplate.useQuery(selectedModule, { enabled: false });
    var importClientsMutation = trpc_1.trpc.csvImportExport.importClients.useMutation();
    var importEmployeesMutation = trpc_1.trpc.csvImportExport.importEmployees.useMutation();
    var importProductsMutation = trpc_1.trpc.csvImportExport.importProducts.useMutation();
    var importAccountsMutation = trpc_1.trpc.csvImportExport.importAccounts.useMutation();
    var importPaymentsMutation = trpc_1.trpc.csvImportExport.importPayments.useMutation();
    /**
     * Download template for selected module
     */
    var handleDownloadTemplate = function () { return __awaiter(_this, void 0, void 0, function () {
        var template, url, link;
        return __generator(this, function (_a) {
            try {
                template = csvGenerator_1.generateCSVTemplateFile(selectedModule);
                url = URL.createObjectURL(template);
                link = document.createElement('a');
                link.href = url;
                link.download = selectedModule + "_template.csv";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                sonner_1.toast.success(selectedModule + " template downloaded");
            }
            catch (error) {
                sonner_1.toast.error("Failed to download template: " + error);
            }
            return [2 /*return*/];
        });
    }); };
    /**
     * Handle file selection and preview
     */
    var handleFileSelect = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var file, content, rows, preview, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                    if (!file)
                        return [2 /*return*/];
                    if (!file.name.endsWith('.csv')) {
                        sonner_1.toast.error('Please select a CSV file');
                        return [2 /*return*/];
                    }
                    setUploadedFile(file);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, file.text()];
                case 2:
                    content = _b.sent();
                    rows = csvGenerator_1.parseCSV(content);
                    preview = rows.slice(0, 5).map(function (row, idx) { return ({
                        rowNum: idx + 2,
                        data: row,
                        hasErrors: false,
                        errors: []
                    }); });
                    setPreviewData(preview);
                    setShowPreview(true);
                    sonner_1.toast.success("Loaded " + rows.length + " records from CSV");
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    sonner_1.toast.error("Failed to parse CSV: " + error_1);
                    setUploadedFile(null);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Execute import based on selected module
     */
    var handleImport = function () { return __awaiter(_this, void 0, void 0, function () {
        var content, rows, result, _a, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!uploadedFile) {
                        sonner_1.toast.error('Please select a file to import');
                        return [2 /*return*/];
                    }
                    setIsImporting(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 15, 16, 17]);
                    return [4 /*yield*/, uploadedFile.text()];
                case 2:
                    content = _b.sent();
                    rows = csvGenerator_1.parseCSV(content);
                    if (rows.length === 0) {
                        sonner_1.toast.error('CSV file has no data rows');
                        setIsImporting(false);
                        return [2 /*return*/];
                    }
                    result = void 0;
                    _a = selectedModule;
                    switch (_a) {
                        case 'clients': return [3 /*break*/, 3];
                        case 'employees': return [3 /*break*/, 5];
                        case 'products': return [3 /*break*/, 7];
                        case 'accounts': return [3 /*break*/, 9];
                        case 'payments': return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 13];
                case 3: return [4 /*yield*/, importClientsMutation.mutateAsync({
                        data: rows,
                        skipDuplicates: skipDuplicates
                    })];
                case 4:
                    result = _b.sent();
                    return [3 /*break*/, 14];
                case 5: return [4 /*yield*/, importEmployeesMutation.mutateAsync({
                        data: rows,
                        skipDuplicates: skipDuplicates
                    })];
                case 6:
                    result = _b.sent();
                    return [3 /*break*/, 14];
                case 7: return [4 /*yield*/, importProductsMutation.mutateAsync({
                        data: rows,
                        skipDuplicates: skipDuplicates
                    })];
                case 8:
                    result = _b.sent();
                    return [3 /*break*/, 14];
                case 9: return [4 /*yield*/, importAccountsMutation.mutateAsync({
                        data: rows,
                        skipDuplicates: skipDuplicates
                    })];
                case 10:
                    result = _b.sent();
                    return [3 /*break*/, 14];
                case 11: return [4 /*yield*/, importPaymentsMutation.mutateAsync({
                        data: rows,
                        skipDuplicates: skipDuplicates
                    })];
                case 12:
                    result = _b.sent();
                    return [3 /*break*/, 14];
                case 13:
                    sonner_1.toast.error("Import is not supported for " + selectedModule + ". Supported modules: Clients, Employees, Products, Accounts, Payments.");
                    return [2 /*return*/];
                case 14:
                    setImportResult(result);
                    sonner_1.toast.success("Import completed: " + result.imported + " records imported");
                    if (result.errors.length > 0) {
                        sonner_1.toast.error(result.errors.length + " errors occurred during import");
                    }
                    setUploadedFile(null);
                    setPreviewData([]);
                    e.target.value = '';
                    return [3 /*break*/, 17];
                case 15:
                    error_2 = _b.sent();
                    sonner_1.toast.error("Import failed: " + error_2);
                    return [3 /*break*/, 17];
                case 16:
                    setIsImporting(false);
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    }); };
    var currentModuleInfo = modules.find(function (m) { return m.id === selectedModule; });
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h2", { className: "text-2xl font-bold tracking-tight" }, "CSV Import/Export"),
            react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 mt-1" }, "Bulk import data using CSV templates")),
        react_1["default"].createElement(tabs_1.Tabs, { defaultValue: "import", className: "w-full" },
            react_1["default"].createElement(tabs_1.TabsList, null,
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "import" }, "Import Data"),
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "templates" }, "Download Templates")),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "import", className: "space-y-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Import CSV Data"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Select a module and upload a CSV file to bulk import data")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Select Module"),
                            react_1["default"].createElement(select_1.Select, { value: selectedModule, onValueChange: function (value) { return setSelectedModule(value); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Choose a module" })),
                                react_1["default"].createElement(select_1.SelectContent, null, modules.map(function (module) {
                                    var importSupported = ['clients', 'employees', 'products', 'accounts', 'payments'].includes(module.id);
                                    return (react_1["default"].createElement(select_1.SelectItem, { key: module.id, value: module.id },
                                        module.label,
                                        !importSupported ? ' (export only)' : ''));
                                }))),
                            currentModuleInfo && (react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, currentModuleInfo.description))),
                        react_1["default"].createElement(button_1.Button, { onClick: handleDownloadTemplate, variant: "outline", className: "w-full" },
                            react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                            "Download ",
                            selectedModule,
                            " Template"),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "text-sm font-medium" }, "Select CSV File"),
                            react_1["default"].createElement("div", { className: "flex gap-2" },
                                react_1["default"].createElement("input", { type: "file", accept: ".csv", onChange: handleFileSelect, className: "flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm" })),
                            uploadedFile && (react_1["default"].createElement("div", { className: "flex items-center gap-2 mt-2" },
                                react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "w-4 h-4 text-green-600" }),
                                react_1["default"].createElement("span", { className: "text-sm" }, uploadedFile.name)))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                                react_1["default"].createElement("input", { type: "checkbox", checked: skipDuplicates, onChange: function (e) { return setSkipDuplicates(e.target.checked); }, className: "rounded" }),
                                react_1["default"].createElement("span", { className: "text-sm" }, "Skip duplicate records"))),
                        previewData.length > 0 && (react_1["default"].createElement(button_1.Button, { onClick: function () { return setShowPreview(true); }, variant: "outline", className: "w-full" },
                            react_1["default"].createElement(lucide_react_1.Eye, { className: "w-4 h-4 mr-2" }),
                            "Preview Data (",
                            previewData.length,
                            " rows)")),
                        react_1["default"].createElement(button_1.Button, { onClick: handleImport, disabled: !uploadedFile || isImporting, className: "w-full" }, isImporting ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                            "Importing...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement(lucide_react_1.Upload, { className: "w-4 h-4 mr-2" }),
                            "Import Data"))),
                        importResult && (react_1["default"].createElement(alert_1.Alert, null,
                            react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4" }),
                            react_1["default"].createElement(alert_1.AlertDescription, null,
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement("p", { className: "font-semibold" }, "Import Completed"),
                                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm" },
                                        react_1["default"].createElement("div", null,
                                            react_1["default"].createElement("span", { className: "text-gray-500" }, "Imported:"),
                                            react_1["default"].createElement("p", { className: "font-semibold text-green-600" }, importResult.imported)),
                                        react_1["default"].createElement("div", null,
                                            react_1["default"].createElement("span", { className: "text-gray-500" }, "Skipped:"),
                                            react_1["default"].createElement("p", { className: "font-semibold text-yellow-600" }, importResult.skipped)),
                                        react_1["default"].createElement("div", null,
                                            react_1["default"].createElement("span", { className: "text-gray-500" }, "Errors:"),
                                            react_1["default"].createElement("p", { className: "font-semibold text-red-600" }, importResult.errors.length))),
                                    importResult.errors.length > 0 && (react_1["default"].createElement("details", { className: "mt-2" },
                                        react_1["default"].createElement("summary", { className: "cursor-pointer text-sm text-red-600 hover:underline" },
                                            "Show errors (",
                                            importResult.errors.length,
                                            ")"),
                                        react_1["default"].createElement("ul", { className: "mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400" },
                                            importResult.errors.slice(0, 10).map(function (err, idx) { return (react_1["default"].createElement("li", { key: idx },
                                                "Row ",
                                                err.row,
                                                ": ",
                                                err.message)); }),
                                            importResult.errors.length > 10 && (react_1["default"].createElement("li", null,
                                                "... and ",
                                                importResult.errors.length - 10,
                                                " more errors")))))))))))),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "templates", className: "space-y-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Available Templates"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Download blank CSV templates to use as import files")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" }, modules.map(function (module) { return (react_1["default"].createElement(button_1.Button, { key: module.id, variant: "outline", className: "h-auto p-3 text-left justify-start flex-col items-start", onClick: function () {
                                setSelectedModule(module.id);
                                setTimeout(function () { return handleDownloadTemplate(); }, 100);
                            } },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-1" },
                                react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                                react_1["default"].createElement("span", { className: "font-medium" }, module.name)),
                            react_1["default"].createElement("span", { className: "text-xs text-gray-500" }, module.description))); })))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: showPreview, onOpenChange: setShowPreview },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Preview Import Data"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null,
                        "Showing first ",
                        previewData.length,
                        " rows from your CSV file")),
                react_1["default"].createElement("div", { className: "space-y-4" }, previewData.map(function (row) { return (react_1["default"].createElement(card_1.Card, { key: row.rowNum, className: row.hasErrors ? 'border-red-300' : '' },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                        react_1["default"].createElement("div", { className: "flex items-start justify-between mb-2" },
                            react_1["default"].createElement("h4", { className: "font-semibold text-sm" },
                                "Row ",
                                row.rowNum),
                            row.hasErrors && (react_1["default"].createElement(badge_1.Badge, { variant: "destructive" }, "Has Errors"))),
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm" }, Object.entries(row.data).map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return (react_1["default"].createElement("div", { key: key, className: "space-y-1" },
                                react_1["default"].createElement("span", { className: "text-gray-500 text-xs" }, key),
                                react_1["default"].createElement("span", { className: "font-medium break-words" }, value === null ? react_1["default"].createElement("em", { className: "text-gray-400" }, "empty") : String(value))));
                        }))))); })),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { onClick: function () { return setShowPreview(false); }, variant: "outline" }, "Close"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleImport, disabled: isImporting }, isImporting ? 'Importing...' : 'Proceed with Import'))))));
}
exports["default"] = CSVImportExport;
