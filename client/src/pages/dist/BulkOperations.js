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
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var EmptyState_1 = require("@/components/EmptyState");
var BulkProgressTracker_1 = require("@/components/BulkProgressTracker");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var format_1 = require("@/utils/format");
var stats_card_1 = require("@/components/ui/stats-card");
function BulkOperations() {
    var _this = this;
    // State management
    var _a = react_1.useState([]), selectedQuotes = _a[0], setSelectedQuotes = _a[1];
    var _b = react_1.useState("sent"), selectedStatus = _b[0], setSelectedStatus = _b[1];
    var _c = react_1.useState(false), operationInProgress = _c[0], setOperationInProgress = _c[1];
    var _d = react_1.useState("5"), generateCount = _d[0], setGenerateCount = _d[1];
    var _e = react_1.useState(""), templateId = _e[0], setTemplateId = _e[1];
    // Data fetching
    var _f = trpc_1.trpc.quotes.list.useQuery({
        limit: 1000
    }).data, quotes = _f === void 0 ? [] : _f;
    var _g = trpc_1.trpc.quotes.listTemplates.useQuery({}).data, templates = _g === void 0 ? [] : _g;
    // Mutations
    var updateStatusMutation = trpc_1.trpc.bulkOperations.updateQuoteStatus.useMutation();
    var deleteQuotesMutation = trpc_1.trpc.bulkOperations.deleteQuotes.useMutation();
    var generateBulkMutation = trpc_1.trpc.bulkOperations.generateBulkQuotes.useMutation();
    var exportMutation = trpc_1.trpc.bulkOperations.exportQuotesToCSV.useQuery({ filters: {} }, { enabled: false });
    // Handlers
    var handleSelectQuote = function (quote) {
        var isSelected = selectedQuotes.find(function (q) { return q.id === quote.id; });
        if (isSelected) {
            setSelectedQuotes(selectedQuotes.filter(function (q) { return q.id !== quote.id; }));
        }
        else {
            setSelectedQuotes(__spreadArrays(selectedQuotes, [quote]));
        }
    };
    var handleSelectAll = function () {
        if (selectedQuotes.length === quotes.length) {
            setSelectedQuotes([]);
        }
        else {
            setSelectedQuotes(quotes.map(function (q) { return ({
                id: q.id,
                quoteNumber: q.quoteNumber,
                status: q.status
            }); }));
        }
    };
    var handleUpdateStatus = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (selectedQuotes.length === 0 || !selectedStatus) {
                        sonner_1.toast.error("Please select quotes and a status");
                        return [2 /*return*/];
                    }
                    setOperationInProgress(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, updateStatusMutation.mutateAsync({
                            ids: selectedQuotes.map(function (q) { return q.id; }),
                            status: selectedStatus
                        })];
                case 2:
                    result = _b.sent();
                    if (result.success) {
                        sonner_1.toast.success("Updated " + result.updated + " quotes to " + selectedStatus);
                        setSelectedQuotes([]);
                        setSelectedStatus("");
                    }
                    else {
                        sonner_1.toast.error("Updated " + result.updated + " quotes. " + (((_a = result.failed) === null || _a === void 0 ? void 0 : _a.length) || 0) + " failed");
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    sonner_1.toast.error("Failed to update quotes");
                    return [3 /*break*/, 5];
                case 4:
                    setOperationInProgress(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteQuotes = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (selectedQuotes.length === 0) {
                        sonner_1.toast.error("Please select quotes to delete");
                        return [2 /*return*/];
                    }
                    setOperationInProgress(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, deleteQuotesMutation.mutateAsync({
                            ids: selectedQuotes.map(function (q) { return q.id; })
                        })];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        sonner_1.toast.success("Deleted " + result.deleted + " quotes");
                        setSelectedQuotes([]);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    sonner_1.toast.error("Failed to delete quotes");
                    return [3 /*break*/, 5];
                case 4:
                    setOperationInProgress(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleGenerateBulk = function () { return __awaiter(_this, void 0, void 0, function () {
        var clientIds, result, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!templateId || !generateCount) {
                        sonner_1.toast.error("Please select a template and quantity");
                        return [2 /*return*/];
                    }
                    setOperationInProgress(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    clientIds = quotes.slice(0, Math.min(parseInt(generateCount), 50)).map(function (q) { return q.clientId; });
                    return [4 /*yield*/, generateBulkMutation.mutateAsync({
                            templateId: templateId,
                            quantity: Math.min(parseInt(generateCount), 100),
                            clientIds: clientIds,
                            startDate: new Date(),
                            expirationDays: 30
                        })];
                case 2:
                    result = _b.sent();
                    if (result.success) {
                        sonner_1.toast.success("Generated " + result.created + " quotes from template");
                        setTemplateId("");
                        setGenerateCount("5");
                    }
                    else {
                        sonner_1.toast.error("Generated " + result.created + " quotes. " + (((_a = result.failed) === null || _a === void 0 ? void 0 : _a.length) || 0) + " failed");
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _b.sent();
                    sonner_1.toast.error("Failed to generate quotes");
                    return [3 /*break*/, 5];
                case 4:
                    setOperationInProgress(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleExportCSV = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, blob, url, link, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exportMutation.refetch()];
                case 1:
                    result = _b.sent();
                    if ((_a = result.data) === null || _a === void 0 ? void 0 : _a.success) {
                        blob = new Blob([result.data.data], { type: "text/csv" });
                        url = URL.createObjectURL(blob);
                        link = document.createElement("a");
                        link.href = url;
                        link.download = result.data.fileName || "quotes-export.csv";
                        link.click();
                        URL.revokeObjectURL(url);
                        sonner_1.toast.success("Exported " + result.data.count + " quotes");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _b.sent();
                    sonner_1.toast.error("Failed to export quotes");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleCsvFile = function (file) {
        var reader = new FileReader();
        reader.onload = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var text, lines;
            var _a;
            return __generator(this, function (_b) {
                text = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                if (!text) {
                    sonner_1.toast.error("Could not read file");
                    return [2 /*return*/];
                }
                lines = text.trim().split("\n");
                if (lines.length < 2) {
                    sonner_1.toast.error("CSV file is empty or has no data rows");
                    return [2 /*return*/];
                }
                sonner_1.toast.success("Loaded " + (lines.length - 1) + " rows from " + file.name + ". Use the Generate tab to process.");
                return [2 /*return*/];
            });
        }); };
        reader.readAsText(file);
    };
    var statusStats = {
        draft: quotes.filter(function (q) { return q.status === "draft"; }).length,
        sent: quotes.filter(function (q) { return q.status === "sent"; }).length,
        accepted: quotes.filter(function (q) { return q.status === "accepted"; }).length,
        declined: quotes.filter(function (q) { return q.status === "declined"; }).length,
        expired: quotes.filter(function (q) { return q.status === "expired"; }).length,
        converted: quotes.filter(function (q) { return q.status === "converted"; }).length
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", null,
            React.createElement("h1", { className: "text-3xl font-bold" }, "Bulk Operations"),
            React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage multiple quotes efficiently with batch operations")),
        React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-6 gap-4" },
            React.createElement(stats_card_1.StatsCard, { label: "Draft", value: statusStats.draft, color: "border-l-pink-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Sent", value: statusStats.sent, color: "border-l-emerald-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Accepted", value: statusStats.accepted, color: "border-l-orange-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Declined", value: statusStats.declined, color: "border-l-purple-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Expired", value: statusStats.expired, color: "border-l-green-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Converted", value: statusStats.converted, color: "border-l-blue-500" })),
        operationInProgress && React.createElement(BulkProgressTracker_1["default"], null),
        React.createElement(tabs_1.Tabs, { defaultValue: "status-update", className: "w-full" },
            React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                React.createElement(tabs_1.TabsTrigger, { value: "status-update" }, "Update Status"),
                React.createElement(tabs_1.TabsTrigger, { value: "generate" }, "Generate Bulk"),
                React.createElement(tabs_1.TabsTrigger, { value: "import" }, "Import CSV"),
                React.createElement(tabs_1.TabsTrigger, { value: "export" }, "Export")),
            React.createElement(tabs_1.TabsContent, { value: "status-update" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Update Quote Status"),
                        React.createElement(card_1.CardDescription, null, "Select quotes and update their status in bulk")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "block text-sm font-medium mb-2" }, "New Status"),
                            React.createElement(select_1.Select, { value: selectedStatus, onValueChange: function (val) { return setSelectedStatus(val); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select status..." })),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                                    React.createElement(select_1.SelectItem, { value: "accepted" }, "Accepted"),
                                    React.createElement(select_1.SelectItem, { value: "declined" }, "Declined"),
                                    React.createElement(select_1.SelectItem, { value: "expired" }, "Expired"),
                                    React.createElement(select_1.SelectItem, { value: "converted" }, "Converted")))),
                        quotes.length > 0 ? (React.createElement("div", { className: "border rounded-lg overflow-x-auto" },
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, { className: "w-12" },
                                            React.createElement("input", { type: "checkbox", checked: selectedQuotes.length === quotes.length, onChange: handleSelectAll, className: "rounded" })),
                                        React.createElement(table_1.TableHead, null, "Quote #"),
                                        React.createElement(table_1.TableHead, null, "Status"),
                                        React.createElement(table_1.TableHead, null, "Total"),
                                        React.createElement(table_1.TableHead, null, "Created"))),
                                React.createElement(table_1.TableBody, null, quotes.slice(0, 20).map(function (q) { return (React.createElement(table_1.TableRow, { key: q.id },
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement("input", { type: "checkbox", checked: selectedQuotes.some(function (sq) { return sq.id === q.id; }), onChange: function () {
                                                return handleSelectQuote({
                                                    id: q.id,
                                                    quoteNumber: q.quoteNumber,
                                                    status: q.status
                                                });
                                            }, className: "rounded" })),
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, q.quoteNumber),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement("span", { className: "px-2 py-1 rounded text-xs font-medium " + (q.status === "sent" ? "bg-blue-100 text-blue-800" :
                                                q.status === "accepted" ? "bg-green-100 text-green-800" :
                                                    q.status === "declined" ? "bg-red-100 text-red-800" :
                                                        "bg-gray-100 text-gray-800") }, q.status)),
                                    React.createElement(table_1.TableCell, null, format_1.formatCurrency(q.total || 0)),
                                    React.createElement(table_1.TableCell, null, format_1.formatDate(q.createdAt)))); }))))) : (React.createElement(EmptyState_1.EmptyState, { title: "No quotes found", description: "Create some quotes first", icon: React.createElement(lucide_react_1.AlertCircle, null) })),
                        React.createElement("div", { className: "flex gap-3 pt-4" },
                            React.createElement(button_1.Button, { onClick: handleUpdateStatus, disabled: operationInProgress || selectedQuotes.length === 0, className: "gap-2" },
                                React.createElement(lucide_react_1.CheckCircle, { className: "w-4 h-4" }),
                                "Update Status (",
                                selectedQuotes.length,
                                ")"),
                            React.createElement(button_1.Button, { onClick: handleDeleteQuotes, variant: "destructive", disabled: operationInProgress || selectedQuotes.length === 0, className: "gap-2" },
                                React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }),
                                "Delete (",
                                selectedQuotes.length,
                                ")"))))),
            React.createElement(tabs_1.TabsContent, { value: "generate" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Generate Bulk Quotes"),
                        React.createElement(card_1.CardDescription, null, "Create multiple quotes from a template")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "block text-sm font-medium mb-2" }, "Template"),
                            React.createElement(select_1.Select, { value: templateId, onValueChange: setTemplateId },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select template..." })),
                                React.createElement(select_1.SelectContent, null, templates.map(function (t) { return (React.createElement(select_1.SelectItem, { key: t.id, value: t.id }, t.subject)); })))),
                        React.createElement("div", null,
                            React.createElement("label", { className: "block text-sm font-medium mb-2" }, "Quantity (1-100)"),
                            React.createElement(input_1.Input, { type: "number", min: "1", max: "100", value: generateCount, onChange: function (e) { return setGenerateCount(e.target.value); }, placeholder: "5" })),
                        React.createElement(button_1.Button, { onClick: handleGenerateBulk, disabled: operationInProgress || !templateId, className: "w-full gap-2" },
                            React.createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                            "Generate ",
                            generateCount,
                            " Quotes")))),
            React.createElement(tabs_1.TabsContent, { value: "import" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Import Quotes from CSV"),
                        React.createElement(card_1.CardDescription, null, "Upload CSV file to bulk import quotes")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors", onClick: function () { var _a; return (_a = document.getElementById("csv-import-input")) === null || _a === void 0 ? void 0 : _a.click(); }, onDragOver: function (e) { e.preventDefault(); e.stopPropagation(); }, onDrop: function (e) {
                                var _a;
                                e.preventDefault();
                                e.stopPropagation();
                                var file = (_a = e.dataTransfer.files) === null || _a === void 0 ? void 0 : _a[0];
                                if (file && file.name.endsWith(".csv")) {
                                    handleCsvFile(file);
                                }
                                else {
                                    sonner_1.toast.error("Please drop a CSV file");
                                }
                            } },
                            React.createElement(lucide_react_1.FileUp, { className: "w-12 h-12 mx-auto text-muted-foreground mb-2" }),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Drag and drop CSV file or click to select"),
                            React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "CSV should contain columns: quoteNumber, clientId, subject, subtotal, taxRate")),
                        React.createElement("input", { id: "csv-import-input", type: "file", accept: ".csv", className: "hidden", onChange: function (e) {
                                var _a;
                                var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                                if (file)
                                    handleCsvFile(file);
                                e.target.value = "";
                            } }),
                        React.createElement(button_1.Button, { className: "w-full gap-2", onClick: function () { var _a; return (_a = document.getElementById("csv-import-input")) === null || _a === void 0 ? void 0 : _a.click(); } },
                            React.createElement(lucide_react_1.FileUp, { className: "w-4 h-4" }),
                            "Select CSV File")))),
            React.createElement(tabs_1.TabsContent, { value: "export" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Export Quotes"),
                        React.createElement(card_1.CardDescription, null, "Download quotes as CSV for external use")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4" },
                            React.createElement("p", { className: "text-sm text-blue-900" }, "Export format: Quote Number, Client ID, Status, Subject, Subtotal, Tax Rate, Tax Amount, Total, Valid From, Valid Until, Created At")),
                        React.createElement(button_1.Button, { onClick: handleExportCSV, className: "w-full gap-2", disabled: quotes.length === 0 },
                            React.createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                            "Download ",
                            quotes.length,
                            " Quotes as CSV")))))));
}
exports["default"] = BulkOperations;
