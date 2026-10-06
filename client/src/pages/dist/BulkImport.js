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
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var table_1 = require("@/components/ui/table");
var BulkProgressTracker_1 = require("@/components/BulkProgressTracker");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
function BulkImport() {
    var _this = this;
    var _a = react_1.useState([]), preview = _a[0], setPreview = _a[1];
    var _b = react_1.useState(false), isImporting = _b[0], setIsImporting = _b[1];
    var _c = react_1.useState(""), fileName = _c[0], setFileName = _c[1];
    var bulkImportMutation = trpc_1.trpc.bulkOperations.bulkImportQuotes.useMutation();
    var handleFileUpload = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var file, reader;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return [2 /*return*/];
            setFileName(file.name);
            reader = new FileReader();
            reader.onload = function (event) { return __awaiter(_this, void 0, void 0, function () {
                var csv, lines, headers, parsedQuotes;
                var _a;
                return __generator(this, function (_b) {
                    csv = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                    lines = csv.split("\n");
                    headers = lines[0].split(",").map(function (h) { return h.trim().toLowerCase(); });
                    parsedQuotes = lines.slice(1).map(function (line, idx) {
                        var values = line.split(",").map(function (v) { return v.trim(); });
                        return {
                            row: idx + 2,
                            quoteNumber: values[0] || "QT-" + idx,
                            clientId: values[1] || "",
                            subject: values[2] || "",
                            total: parseFloat(values[3]) || 0,
                            status: values[0] ? "valid" : "invalid"
                        };
                    });
                    setPreview(parsedQuotes.filter(function (q) { return q.quoteNumber; }));
                    return [2 /*return*/];
                });
            }); };
            reader.readAsText(file);
            return [2 /*return*/];
        });
    }); };
    var handleImport = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (preview.length === 0) {
                        sonner_1.toast.error("No valid data to import");
                        return [2 /*return*/];
                    }
                    setIsImporting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, bulkImportMutation.mutateAsync({
                            quotes: preview.map(function (p) { return ({
                                quoteNumber: p.quoteNumber,
                                clientId: p.clientId,
                                subject: p.subject,
                                subtotal: p.total,
                                taxRate: 0,
                                expirationDays: 30,
                                items: []
                            }); }),
                            dryRun: false
                        })];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        sonner_1.toast.success("Imported " + result.imported + " quotes");
                        setPreview([]);
                        setFileName("");
                    }
                    else {
                        sonner_1.toast.error(result.failed.length + " quotes failed to import");
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error("Failed to import quotes");
                    return [3 /*break*/, 5];
                case 4:
                    setIsImporting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", null,
            React.createElement("h1", { className: "text-3xl font-bold" }, "Import Quotes"),
            React.createElement("p", { className: "text-muted-foreground mt-2" }, "Upload CSV file to bulk import quotes")),
        isImporting && React.createElement(BulkProgressTracker_1["default"], { title: "Importing Quotes..." }),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Upload CSV File"),
                React.createElement(card_1.CardDescription, null, "Supported format: CSV with columns for Quote Number, Client ID, Subject, Amount")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "border-2 border-dashed rounded-lg p-12 text-center hover:bg-gray-50 cursor-pointer transition" },
                    React.createElement("input", { type: "file", accept: ".csv", onChange: handleFileUpload, className: "hidden", id: "csv-input" }),
                    React.createElement("label", { htmlFor: "csv-input", className: "cursor-pointer block" },
                        React.createElement(lucide_react_1.FileUp, { className: "w-12 h-12 mx-auto text-muted-foreground mb-2" }),
                        React.createElement("p", { className: "font-medium" }, "Drag and drop or click to select"),
                        React.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "CSV files only"),
                        fileName && (React.createElement("p", { className: "text-sm text-green-600 mt-2" },
                            "\u2713 ",
                            fileName)))),
                preview.length > 0 && (React.createElement("div", { className: "space-y-3" },
                    React.createElement("h3", { className: "font-medium" },
                        "Preview (",
                        preview.length,
                        " rows)"),
                    React.createElement("div", { className: "border rounded-lg overflow-x-auto max-h-96 overflow-y-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Row"),
                                    React.createElement(table_1.TableHead, null, "Quote #"),
                                    React.createElement(table_1.TableHead, null, "Client ID"),
                                    React.createElement(table_1.TableHead, null, "Subject"),
                                    React.createElement(table_1.TableHead, null, "Total"),
                                    React.createElement(table_1.TableHead, null, "Status"))),
                            React.createElement(table_1.TableBody, null, preview.slice(0, 20).map(function (row) { return (React.createElement(table_1.TableRow, { key: row.row },
                                React.createElement(table_1.TableCell, { className: "text-xs" }, row.row),
                                React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, row.quoteNumber),
                                React.createElement(table_1.TableCell, { className: "text-sm" }, row.clientId),
                                React.createElement(table_1.TableCell, { className: "text-sm" }, row.subject),
                                React.createElement(table_1.TableCell, { className: "text-sm font-medium" },
                                    "$",
                                    row.total.toFixed(2)),
                                React.createElement(table_1.TableCell, null, row.status === "valid" ? (React.createElement("div", { className: "flex items-center gap-1 text-green-600 text-sm" },
                                    React.createElement(lucide_react_1.Check, { className: "w-4 h-4" }),
                                    "Valid")) : (React.createElement("div", { className: "flex items-center gap-1 text-red-600 text-sm" },
                                    React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4" }),
                                    "Invalid"))))); })))),
                    React.createElement("div", { className: "flex gap-3" },
                        React.createElement(button_1.Button, { onClick: handleImport, disabled: isImporting, className: "flex-1" },
                            "Import ",
                            preview.length,
                            " Quotes"),
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setPreview([]); } }, "Cancel")))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "CSV Format Guide")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "bg-slate-50 rounded-lg p-4 font-mono text-sm space-y-2" },
                    React.createElement("p", { className: "text-muted-foreground" }, "First row must be headers. Example:"),
                    React.createElement("code", { className: "block text-xs bg-white p-3 rounded border" }, "Quote Number,Client ID,Subject,Amount,Tax Rate"),
                    React.createElement("p", { className: "text-muted-foreground" }, "Data rows:"),
                    React.createElement("code", { className: "block text-xs bg-white p-3 rounded border" }, "QT-2024-001,CLI-001,Q1 Services,5000,10"))))));
}
exports["default"] = BulkImport;
