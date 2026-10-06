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
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
function BulkExport() {
    var _this = this;
    var _a = react_1.useState({}), filters = _a[0], setFilters = _a[1];
    var _b = react_1.useState("all"), selectedStatus = _b[0], setSelectedStatus = _b[1];
    var _c = react_1.useState(true), includeMetadata = _c[0], setIncludeMetadata = _c[1];
    var _d = trpc_1.trpc.quotes.list.useQuery({
        limit: 1000
    }).data, quotes = _d === void 0 ? [] : _d;
    var exportMutation = trpc_1.trpc.bulkOperations.exportQuotesToCSV.useQuery({ filters: selectedStatus !== "all" ? { status: selectedStatus } : {} }, { enabled: false });
    var handleExport = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, blob, url, link, error_1;
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
                    else {
                        sonner_1.toast.error("Failed to export quotes");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    sonner_1.toast.error("Export failed");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var statuses = ["draft", "sent", "accepted", "declined", "expired", "converted"];
    var statusCounts = statuses.reduce(function (acc, status) {
        acc[status] = quotes.filter(function (q) { return q.status === status; }).length;
        return acc;
    }, {});
    var exportCount = selectedStatus === "all"
        ? quotes.length
        : statusCounts[selectedStatus] || 0;
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", null,
            React.createElement("h1", { className: "text-3xl font-bold" }, "Export Quotes"),
            React.createElement("p", { className: "text-muted-foreground mt-2" }, "Download quotes in CSV format for external use")),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Export Settings"),
                React.createElement(card_1.CardDescription, null, "Configure export filters and format options")),
            React.createElement(card_1.CardContent, { className: "space-y-6" },
                React.createElement("div", { className: "space-y-3" },
                    React.createElement(label_1.Label, { className: "text-base font-medium" }, "Filter by Status"),
                    React.createElement(select_1.Select, { value: selectedStatus, onValueChange: function (val) { return setSelectedStatus(val); } },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" },
                                "All Statuses (",
                                quotes.length,
                                ")"),
                            statuses.map(function (status) { return (React.createElement(select_1.SelectItem, { key: status, value: status },
                                status.charAt(0).toUpperCase() + status.slice(1),
                                " (",
                                statusCounts[status],
                                ")")); })))),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement(label_1.Label, { className: "text-base font-medium" }, "Export Columns"),
                    React.createElement("div", { className: "space-y-2 bg-slate-50 p-4 rounded-lg" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(checkbox_1.Checkbox, { id: "col-quote", defaultChecked: true, disabled: true }),
                            React.createElement("label", { htmlFor: "col-quote", className: "text-sm cursor-pointer" }, "Quote Number (required)")),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(checkbox_1.Checkbox, { id: "col-client", defaultChecked: true, disabled: true }),
                            React.createElement("label", { htmlFor: "col-client", className: "text-sm cursor-pointer" }, "Client ID (required)")),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(checkbox_1.Checkbox, { id: "col-status", defaultChecked: true, disabled: true }),
                            React.createElement("label", { htmlFor: "col-status", className: "text-sm cursor-pointer" }, "Status (required)")),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(checkbox_1.Checkbox, { id: "col-subject", defaultChecked: true, disabled: true }),
                            React.createElement("label", { htmlFor: "col-subject", className: "text-sm cursor-pointer" }, "Subject (required)")),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(checkbox_1.Checkbox, { id: "col-amounts", defaultChecked: includeMetadata, onCheckedChange: function (checked) { return setIncludeMetadata(checked); } }),
                            React.createElement("label", { htmlFor: "col-amounts", className: "text-sm cursor-pointer" }, "Financial Data (Subtotal, Tax, Total)")),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(checkbox_1.Checkbox, { id: "col-dates", defaultChecked: true, disabled: true }),
                            React.createElement("label", { htmlFor: "col-dates", className: "text-sm cursor-pointer" }, "Dates (Valid From/Until, Created At)")))),
                React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4" },
                    React.createElement("p", { className: "text-sm text-blue-900 font-medium mb-2" }, "Export Preview"),
                    React.createElement("p", { className: "text-sm text-blue-800" },
                        "You will export ",
                        React.createElement("strong", null, exportCount),
                        " quotes in CSV format")),
                React.createElement(button_1.Button, { onClick: handleExport, className: "w-full gap-2 text-base h-10", disabled: exportCount === 0 },
                    React.createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                    "Download ",
                    exportCount,
                    " Quotes"))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "CSV Format Information")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("h4", { className: "font-medium text-sm" }, "Included Columns:"),
                    React.createElement("div", { className: "bg-slate-50 rounded-lg p-4 font-mono text-xs space-y-1" },
                        React.createElement("p", null, "\u2022 Quote Number"),
                        React.createElement("p", null, "\u2022 Client ID"),
                        React.createElement("p", null, "\u2022 Status"),
                        React.createElement("p", null, "\u2022 Subject"),
                        includeMetadata && (React.createElement(React.Fragment, null,
                            React.createElement("p", null, "\u2022 Subtotal"),
                            React.createElement("p", null, "\u2022 Tax Rate (%)  "),
                            React.createElement("p", null, "\u2022 Tax Amount"),
                            React.createElement("p", null, "\u2022 Total"))),
                        React.createElement("p", null, "\u2022 Valid From"),
                        React.createElement("p", null, "\u2022 Valid Until"),
                        React.createElement("p", null, "\u2022 Created At"))),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("h4", { className: "font-medium text-sm" }, "Date Format:"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "All dates are in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)")),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("h4", { className: "font-medium text-sm" }, "Currency Format:"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "All amounts are in numeric format (no currency symbols)")))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Common Use Cases")),
            React.createElement(card_1.CardContent, { className: "space-y-3" },
                React.createElement("div", null,
                    React.createElement("h4", { className: "font-medium text-sm mb-2 flex items-center gap-2" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4" }),
                        "Generate Reports"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Export all quotes to analyze conversion rates, revenue, and client distribution")),
                React.createElement("div", null,
                    React.createElement("h4", { className: "font-medium text-sm mb-2 flex items-center gap-2" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4" }),
                        "Backup Data"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Create regular CSV backups of your quotes for archival purposes")),
                React.createElement("div", null,
                    React.createElement("h4", { className: "font-medium text-sm mb-2 flex items-center gap-2" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4" }),
                        "Third-Party Integration"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Export quotes to spreadsheet software or accounting systems"))))));
}
exports["default"] = BulkExport;
