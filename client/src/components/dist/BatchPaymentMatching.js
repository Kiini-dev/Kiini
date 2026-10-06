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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.BatchPaymentMatching = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/utils/trpc");
var sonner_1 = require("sonner");
function BatchPaymentMatching() {
    var _this = this;
    var _a = react_1.useState([]), matches = _a[0], setMatches = _a[1];
    var _b = react_1.useState([]), suggestedMatches = _b[0], setSuggestedMatches = _b[1];
    var _c = react_1.useState(false), isExpanded = _c[0], setIsExpanded = _c[1];
    var _d = react_1.useState(false), isProcessing = _d[0], setIsProcessing = _d[1];
    var _e = react_1.useState(""), csvContent = _e[0], setCsvContent = _e[1];
    // Fetch unmatched payments and auto-suggestions
    var unmatchedData = trpc_1.trpc.paymentReconciliation.getUnmatchedPayments.useQuery({
        limit: 100,
        offset: 0
    }).data;
    var autoMatchData = trpc_1.trpc.paymentReconciliation.autoMatchPayments.useMutation().data;
    // Bulk match mutation
    var bulkMatchMutation = trpc_1.trpc.paymentReconciliation.bulkMatchPayments.useMutation();
    // Fetch auto-suggestions on component mount
    react_1.useEffect(function () {
        if (unmatchedData && unmatchedData.payments.length > 0) {
            // In a real scenario, this would call autoMatchPayments
            // For now, we'll load suggested matches from local state
            loadSuggestedMatches();
        }
    }, [unmatchedData]);
    var loadSuggestedMatches = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // This would call the autoMatchPayments mutation in practice
                setSuggestedMatches([]);
            }
            catch (error) {
                console.error("Error loading suggestions:", error);
            }
            return [2 /*return*/];
        });
    }); };
    var handleAddMatch = function (paymentId, invoiceId) {
        var existing = matches.find(function (m) { return m.paymentId === paymentId; });
        if (existing) {
            setMatches(matches.map(function (m) {
                return m.paymentId === paymentId ? __assign(__assign({}, m), { invoiceId: invoiceId, status: "pending" }) : m;
            }));
        }
        else {
            setMatches(__spreadArrays(matches, [{ paymentId: paymentId, invoiceId: invoiceId, status: "pending" }]));
        }
    };
    var handleRemoveMatch = function (paymentId) {
        setMatches(matches.filter(function (m) { return m.paymentId !== paymentId; }));
    };
    var handleAcceptSuggestion = function (suggestion) {
        handleAddMatch(suggestion.paymentId, suggestion.invoiceId);
    };
    var handleBulkConfirm = function () { return __awaiter(_this, void 0, void 0, function () {
        var result_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (matches.length === 0)
                        return [2 /*return*/];
                    setIsProcessing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, bulkMatchMutation.mutateAsync({
                            matches: matches.map(function (m) { return ({ paymentId: m.paymentId, invoiceId: m.invoiceId }); }),
                            confirmOverwrite: false
                        })];
                case 2:
                    result_1 = _a.sent();
                    // Update match statuses
                    setMatches(matches.map(function (m) { return (__assign(__assign({}, m), { status: result_1.successful > 0 ? "matched" : "error" })); }));
                    // Show success feedback
                    setTimeout(function () {
                        setMatches([]);
                        setCsvContent("");
                    }, 2000);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error confirming matches:", error_1);
                    setMatches(matches.map(function (m) { return (__assign(__assign({}, m), { status: "error" })); }));
                    return [3 /*break*/, 5];
                case 4:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleCsvExport = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, blob, url, link, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, trpc_1.trpc.paymentReconciliation.exportReconciliationData.query({
                            dataType: "unmatched"
                        })];
                case 1:
                    result = _a.sent();
                    blob = new Blob([result.content], { type: "text/csv" });
                    url = URL.createObjectURL(blob);
                    link = document.createElement("a");
                    link.href = url;
                    link.download = result.filename;
                    link.click();
                    URL.revokeObjectURL(url);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error exporting data:", error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleCsvImport = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!csvContent.trim())
                        return [2 /*return*/];
                    setIsProcessing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, trpc_1.trpc.paymentReconciliation.importReconciliationMatches.mutateAsync({
                            csvContent: csvContent,
                            dryRun: false
                        })];
                case 2:
                    result = _a.sent();
                    sonner_1.toast.success("Imported " + result.successful + " matches successfully");
                    setCsvContent("");
                    setMatches([]);
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    sonner_1.toast.error("Error importing CSV matches");
                    return [3 /*break*/, 5];
                case 4:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var successCount = matches.filter(function (m) { return m.status === "matched"; }).length;
    var errorCount = matches.filter(function (m) { return m.status === "error"; }).length;
    var pendingCount = matches.filter(function (m) { return m.status === "pending"; }).length;
    return (react_1["default"].createElement("div", { className: "w-full space-y-4" },
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Zap, { className: "w-5 h-5 text-blue-500" }),
                            "Batch Payment Matching"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Match multiple unmatched payments to invoices at once")),
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setIsExpanded(!isExpanded); } }, isExpanded ? react_1["default"].createElement(lucide_react_1.ChevronUp, null) : react_1["default"].createElement(lucide_react_1.ChevronDown, null)))),
            isExpanded && (react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" },
                    react_1["default"].createElement("div", { className: "bg-blue-50 p-3 rounded border border-blue-200" },
                        react_1["default"].createElement("div", { className: "text-sm font-medium text-blue-900" }, "To Match"),
                        react_1["default"].createElement("div", { className: "text-2xl font-bold text-blue-600" }, (unmatchedData === null || unmatchedData === void 0 ? void 0 : unmatchedData.total) || 0)),
                    react_1["default"].createElement("div", { className: "bg-green-50 p-3 rounded border border-green-200" },
                        react_1["default"].createElement("div", { className: "text-sm font-medium text-green-900" }, "Pending"),
                        react_1["default"].createElement("div", { className: "text-2xl font-bold text-green-600" }, pendingCount)),
                    react_1["default"].createElement("div", { className: "bg-yellow-50 p-3 rounded border border-yellow-200" },
                        react_1["default"].createElement("div", { className: "text-sm font-medium text-yellow-900" }, "Suggested"),
                        react_1["default"].createElement("div", { className: "text-2xl font-bold text-yellow-600" }, suggestedMatches.length)),
                    react_1["default"].createElement("div", { className: "bg-purple-50 p-3 rounded border border-purple-200" },
                        react_1["default"].createElement("div", { className: "text-sm font-medium text-purple-900" }, "CSV Ready"),
                        react_1["default"].createElement("div", { className: "text-2xl font-bold text-purple-600" }, ((unmatchedData === null || unmatchedData === void 0 ? void 0 : unmatchedData.total) || 0) > 0 ? "✓" : "—"))),
                suggestedMatches.length > 0 && (react_1["default"].createElement("div", { className: "border rounded p-3 bg-yellow-50" },
                    react_1["default"].createElement("div", { className: "font-semibold text-sm mb-2 flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Zap, { className: "w-4 h-4" }),
                        "Auto-Matched Suggestions (",
                        suggestedMatches.length,
                        ")"),
                    react_1["default"].createElement("div", { className: "space-y-2 max-h-48 overflow-y-auto" }, suggestedMatches.map(function (suggestion, idx) { return (react_1["default"].createElement("div", { key: idx, className: "flex items-center justify-between bg-white p-2 rounded text-sm" },
                        react_1["default"].createElement("span", { className: "text-gray-600" },
                            "Payment ",
                            suggestion.paymentId.substring(0, 8),
                            "... \u2192 Invoice ",
                            suggestion.invoiceId.substring(0, 8),
                            "..."),
                        react_1["default"].createElement("span", { className: "text-yellow-600 font-semibold mr-2" },
                            (suggestion.confidence * 100).toFixed(0),
                            "% match"),
                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleAcceptSuggestion(suggestion); } }, "Accept"))); })))),
                react_1["default"].createElement("div", { className: "border rounded p-3 bg-gray-50 space-y-2" },
                    react_1["default"].createElement("div", { className: "font-semibold text-sm" }, "CSV Import/Export"),
                    react_1["default"].createElement("div", { className: "flex gap-2" },
                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: handleCsvExport, className: "flex-1" },
                            react_1["default"].createElement(lucide_react_1.Copy, { className: "w-4 h-4 mr-1" }),
                            "Export Unmatched"),
                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                                var file = document.createElement("input");
                                file.type = "file";
                                file.accept = ".csv";
                                file.onchange = function (e) {
                                    var reader = new FileReader();
                                    reader.onload = function (event) {
                                        setCsvContent(event.target.result);
                                    };
                                    reader.readAsText(e.target.files[0]);
                                };
                                file.click();
                            }, className: "flex-1" },
                            react_1["default"].createElement(lucide_react_1.Upload, { className: "w-4 h-4 mr-1" }),
                            "Import CSV")),
                    csvContent && (react_1["default"].createElement("div", { className: "text-xs text-gray-600 bg-white p-2 rounded border" },
                        "CSV loaded: ",
                        csvContent.split("\n").length - 1,
                        " lines"))),
                matches.length > 0 && (react_1["default"].createElement("div", { className: "border rounded p-3 bg-blue-50" },
                    react_1["default"].createElement("div", { className: "font-semibold text-sm mb-2 flex items-center justify-between" },
                        react_1["default"].createElement("span", null,
                            "Pending Matches (",
                            matches.length,
                            ")"),
                        react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return setMatches([]); }, className: "text-xs" }, "Clear All")),
                    react_1["default"].createElement("div", { className: "space-y-2 max-h-48 overflow-y-auto" }, matches.map(function (match) { return (react_1["default"].createElement("div", { key: match.paymentId, className: "flex items-center justify-between p-2 rounded text-sm " + (match.status === "matched"
                            ? "bg-green-100 border border-green-300"
                            : match.status === "error"
                                ? "bg-red-100 border border-red-300"
                                : "bg-white border border-blue-200") },
                        react_1["default"].createElement("span", { className: "text-gray-700" },
                            "Payment ",
                            match.paymentId.substring(0, 8),
                            "... \u2192 Invoice ",
                            match.invoiceId.substring(0, 8),
                            "..."),
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            match.status === "matched" && (react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 text-green-600" })),
                            match.status === "error" && (react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-red-600" })),
                            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleRemoveMatch(match.paymentId); }, className: "h-6 w-6" }, "\u2715")))); })))),
                react_1["default"].createElement("div", { className: "flex gap-2 pt-2" },
                    react_1["default"].createElement(button_1.Button, { onClick: handleBulkConfirm, disabled: matches.length === 0 || isProcessing, className: "flex-1 bg-blue-600 hover:bg-blue-700" }, isProcessing ? "Processing..." : "Confirm " + matches.length + " Matches"),
                    csvContent && (react_1["default"].createElement(button_1.Button, { onClick: handleCsvImport, disabled: isProcessing, className: "flex-1 bg-green-600 hover:bg-green-700" }, isProcessing ? "Importing..." : "Import CSV"))),
                (successCount > 0 || errorCount > 0) && (react_1["default"].createElement("div", { className: "border rounded p-3 bg-gray-50 text-sm" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement("span", null,
                            "\u2713 ",
                            successCount,
                            " matched",
                            errorCount > 0 && " | \u2715 " + errorCount + " errors"),
                        react_1["default"].createElement("span", { className: "text-gray-600" },
                            ((successCount / (successCount + errorCount)) * 100).toFixed(0),
                            "% success rate")))))))));
}
exports.BatchPaymentMatching = BatchPaymentMatching;
