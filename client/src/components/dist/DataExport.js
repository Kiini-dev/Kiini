"use strict";
/**
 * Data Export Component
 *
 * Handles CSV, PDF, and Excel exports for reports and filtered data
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.BulkExportManager = exports.ExportHistory = exports.ExportTemplateSelector = exports.ExportModal = void 0;
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
function ExportModal(_a) {
    var _this = this;
    var documentType = _a.documentType, _b = _a.selectedIds, selectedIds = _b === void 0 ? [] : _b, onClose = _a.onClose;
    // ALL HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURNS
    var _c = permissions_1.useRequireFeature("reports:export"), allowed = _c.allowed, isLoading = _c.isLoading;
    var _d = react_1.useState("csv"), selectedFormat = _d[0], setSelectedFormat = _d[1];
    var _e = react_1.useState(false), isExporting = _e[0], setIsExporting = _e[1];
    var exportInvoicesCSV = trpc_1.trpc.dataExport.exportInvoicesCSV.useQuery({ ids: selectedIds }, { enabled: false });
    var exportReceiptsCSV = trpc_1.trpc.dataExport.exportReceiptsCSV.useQuery({ ids: selectedIds }, { enabled: false });
    var exportExpensesCSV = trpc_1.trpc.dataExport.exportExpensesCSV.useQuery({ ids: selectedIds }, { enabled: false });
    var exportProjectsCSV = trpc_1.trpc.dataExport.exportProjectsCSV.useQuery({ ids: selectedIds }, { enabled: false });
    var exportClientsCSV = trpc_1.trpc.dataExport.exportClientsCSV.useQuery({ ids: selectedIds }, { enabled: false });
    // employee export (supports filtered sets by passing ids)
    var exportEmployeesCSV = trpc_1.trpc.dataExport.exportEmployeesCSV.useQuery({ ids: selectedIds }, { enabled: false });
    var handleExport = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsExporting(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 15, 16, 17]);
                    result = null;
                    _a = documentType;
                    switch (_a) {
                        case "invoice": return [3 /*break*/, 2];
                        case "receipt": return [3 /*break*/, 4];
                        case "expense": return [3 /*break*/, 6];
                        case "project": return [3 /*break*/, 8];
                        case "client": return [3 /*break*/, 10];
                        case "employee": return [3 /*break*/, 12];
                    }
                    return [3 /*break*/, 14];
                case 2: return [4 /*yield*/, exportInvoicesCSV.refetch()];
                case 3:
                    result = _b.sent();
                    return [3 /*break*/, 14];
                case 4: return [4 /*yield*/, exportReceiptsCSV.refetch()];
                case 5:
                    result = _b.sent();
                    return [3 /*break*/, 14];
                case 6: return [4 /*yield*/, exportExpensesCSV.refetch()];
                case 7:
                    result = _b.sent();
                    return [3 /*break*/, 14];
                case 8: return [4 /*yield*/, exportProjectsCSV.refetch()];
                case 9:
                    result = _b.sent();
                    return [3 /*break*/, 14];
                case 10: return [4 /*yield*/, exportClientsCSV.refetch()];
                case 11:
                    result = _b.sent();
                    return [3 /*break*/, 14];
                case 12: return [4 /*yield*/, exportEmployeesCSV.refetch()];
                case 13:
                    result = _b.sent();
                    return [3 /*break*/, 14];
                case 14:
                    if (result === null || result === void 0 ? void 0 : result.data) {
                        downloadFile(result.data.content, result.data.filename, "text/csv");
                        sonner_1.toast.success(documentType + " exported successfully");
                        onClose();
                    }
                    return [3 /*break*/, 17];
                case 15:
                    error_1 = _b.sent();
                    sonner_1.toast.error("Export failed");
                    console.error("Export error:", error_1);
                    return [3 /*break*/, 17];
                case 16:
                    setIsExporting(false);
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    }); };
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" },
        React.createElement(card_1.Card, { className: "w-full max-w-md" },
            React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-4 border-b" },
                React.createElement("div", null,
                    React.createElement(card_1.CardTitle, null,
                        "Export ",
                        documentType),
                    React.createElement(card_1.CardDescription, null, "Choose export format")),
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: onClose }, "\u2715")),
            React.createElement(card_1.CardContent, { className: "pt-6 space-y-4" },
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("label", { className: "text-sm font-medium" }, "Format"),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2" },
                        React.createElement(button_1.Button, { variant: selectedFormat === "csv" ? "default" : "outline", onClick: function () { return setSelectedFormat("csv"); }, className: "w-full" }, "CSV"),
                        React.createElement(button_1.Button, { variant: selectedFormat === "pdf" ? "default" : "outline", onClick: function () { return setSelectedFormat("pdf"); }, className: "w-full" }, "PDF"))),
                React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" }),
                    React.createElement("p", { className: "text-sm text-blue-800" }, selectedIds.length > 0
                        ? "Exporting " + selectedIds.length + " selected records"
                        : "Exporting all records" + (filteredCount ? " (" + filteredCount + " filtered)" : ""))),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { variant: "outline", onClick: onClose, className: "flex-1" }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: handleExport, disabled: isExporting, className: "flex-1" },
                        React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                        isExporting ? "Exporting..." : "Export"))))));
}
exports.ExportModal = ExportModal;
/**
 * Export Templates Selector
 */
function ExportTemplateSelector(_a) {
    var onSelect = _a.onSelect;
    var _b = trpc_1.trpc.dataExport.getExportTemplates.useQuery({}), templates = _b.data, isLoading = _b.isLoading;
    if (isLoading) {
        return (React.createElement(card_1.Card, { className: "animate-pulse" },
            React.createElement(card_1.CardHeader, null,
                React.createElement("div", { className: "h-5 bg-gray-200 rounded w-1/3" })),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "space-y-2" }, __spreadArrays(Array(3)).map(function (_, i) { return (React.createElement("div", { key: "loader-" + i, className: "h-10 bg-gray-200 rounded" })); })))));
    }
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "Export Templates"),
            React.createElement(card_1.CardDescription, null, "Choose a template for export")),
        React.createElement(card_1.CardContent, { className: "space-y-2" }, Array.isArray(templates) && templates.map(function (template) { return (React.createElement(button_1.Button, { key: template.id, variant: "outline", className: "w-full justify-start h-auto py-3", onClick: function () { return onSelect(template); } },
            React.createElement("div", { className: "flex items-start gap-3 w-full" },
                React.createElement(lucide_react_1.FileText, { className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" }),
                React.createElement("div", { className: "text-left" },
                    React.createElement("p", { className: "font-medium" }, template.name),
                    React.createElement("p", { className: "text-xs text-gray-600" }, template.description))))); }))));
}
exports.ExportTemplateSelector = ExportTemplateSelector;
/**
 * Export History
 */
function ExportHistory() {
    var _a = react_1.useState([
        {
            id: 1,
            name: "invoices_1707590400000.csv",
            type: "invoice",
            date: new Date(Date.now() - 3600000),
            size: "245 KB",
            status: "completed"
        },
        {
            id: 2,
            name: "expenses_1707586800000.csv",
            type: "expense",
            date: new Date(Date.now() - 7200000),
            size: "128 KB",
            status: "completed"
        },
        {
            id: 3,
            name: "clients_1707583200000.csv",
            type: "client",
            date: new Date(Date.now() - 10800000),
            size: "356 KB",
            status: "completed"
        },
    ]), exports = _a[0], setExports = _a[1];
    var handleDownload = function (exportItem) {
        sonner_1.toast.success("Downloading " + exportItem.name);
    };
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "Export History"),
            React.createElement(card_1.CardDescription, null, "Recent exports")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "space-y-2" }, exports.map(function (item) { return (React.createElement("div", { key: item.id, className: "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50" },
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement(lucide_react_1.FileText, { className: "w-5 h-5 text-blue-600" }),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-sm font-medium" }, item.name),
                        React.createElement("p", { className: "text-xs text-gray-600" },
                            item.date.toLocaleDateString(),
                            " ",
                            item.date.toLocaleTimeString()))),
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement("span", { className: "text-xs text-gray-600" }, item.size),
                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleDownload(item); } },
                        React.createElement(lucide_react_1.Download, { className: "w-4 h-4" }))))); })))));
}
exports.ExportHistory = ExportHistory;
/**
 * Bulk Export Manager
 */
function BulkExportManager(_a) {
    var documentType = _a.documentType, selectedIds = _a.selectedIds;
    var _b = react_1.useState(false), showExportModal = _b[0], setShowExportModal = _b[1];
    var validation = trpc_1.trpc.dataExport.validateExportData.useQuery({
        documentType: documentType,
        ids: selectedIds
    }).data;
    if (selectedIds.length === 0) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(card_1.Card, { className: "bg-green-50 border-green-200" },
            React.createElement(card_1.CardContent, { className: "pt-6" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-sm font-medium" },
                            selectedIds.length,
                            " record",
                            selectedIds.length > 1 ? "s" : "",
                            " ready to export"),
                        validation && (React.createElement("p", { className: "text-xs text-gray-600 mt-1" },
                            "Estimated size: ",
                            validation.estimatedSize))),
                    React.createElement(button_1.Button, { onClick: function () { return setShowExportModal(true); }, className: "gap-2" },
                        React.createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                        "Export")))),
        showExportModal && (React.createElement(ExportModal, { documentType: documentType, selectedIds: selectedIds, onClose: function () { return setShowExportModal(false); } }))));
}
exports.BulkExportManager = BulkExportManager;
/**
 * Helper function to download file
 */
function downloadFile(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = window.URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
