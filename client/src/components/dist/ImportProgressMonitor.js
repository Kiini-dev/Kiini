"use strict";
exports.__esModule = true;
exports.ImportProgressMonitor = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
exports.ImportProgressMonitor = function (_a) {
    var progress = _a.progress, onRollback = _a.onRollback, onDismiss = _a.onDismiss;
    if (!progress)
        return null;
    var percentComplete = progress.totalRows > 0
        ? Math.round((progress.processedRows / progress.totalRows) * 100)
        : 0;
    var isProcessing = progress.status === "processing" || progress.status === "pending";
    var isCompleted = progress.status === "completed";
    var isFailed = progress.status === "failed";
    var hasErrors = progress.errorDetails.length > 0;
    var hasWarnings = progress.warnings.length > 0;
    var durationSeconds = progress.endTime
        ? Math.round((progress.endTime.getTime() - progress.startTime.getTime()) / 1000)
        : null;
    return (react_1["default"].createElement(card_1.Card, { className: "mb-6 border-2 " + (isFailed ? "border-red-300" : "border-blue-300") },
        react_1["default"].createElement(card_1.CardHeader, null,
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    isProcessing && react_1["default"].createElement(lucide_react_1.Clock, { className: "h-5 w-5 text-blue-500" }),
                    isCompleted && !hasErrors && react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-500" }),
                    isFailed && react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-red-500" }),
                    "Import Progress: ",
                    progress.entityType),
                onDismiss && (react_1["default"].createElement("button", { onClick: onDismiss, className: "text-sm text-gray-500 hover:text-gray-700" }, "\u2715")))),
        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("div", { className: "flex justify-between text-sm mb-2" },
                    react_1["default"].createElement("span", null,
                        "Processing: ",
                        progress.processedRows,
                        " / ",
                        progress.totalRows,
                        " rows"),
                    react_1["default"].createElement("span", { className: "font-semibold" },
                        percentComplete,
                        "%")),
                react_1["default"].createElement(progress_1.Progress, { value: percentComplete, className: "h-2" })),
            react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" },
                react_1["default"].createElement("div", { className: "p-2 bg-green-50 rounded border border-green-200" },
                    react_1["default"].createElement("div", { className: "text-gray-600" }, "Imported"),
                    react_1["default"].createElement("div", { className: "text-lg font-bold text-green-600" }, progress.importedRows)),
                react_1["default"].createElement("div", { className: "p-2 bg-yellow-50 rounded border border-yellow-200" },
                    react_1["default"].createElement("div", { className: "text-gray-600" }, "Skipped"),
                    react_1["default"].createElement("div", { className: "text-lg font-bold text-yellow-600" }, progress.skippedRows)),
                react_1["default"].createElement("div", { className: "p-2 bg-red-50 rounded border border-red-200" },
                    react_1["default"].createElement("div", { className: "text-gray-600" }, "Errors"),
                    react_1["default"].createElement("div", { className: "text-lg font-bold text-red-600" }, progress.errorRows)),
                react_1["default"].createElement("div", { className: "p-2 bg-blue-50 rounded border border-blue-200" },
                    react_1["default"].createElement("div", { className: "text-gray-600" }, "Duration"),
                    react_1["default"].createElement("div", { className: "text-lg font-bold text-blue-600" }, durationSeconds ? durationSeconds + "s" : "―"))),
            hasWarnings && (react_1["default"].createElement(alert_1.Alert, { className: "bg-yellow-50 border-yellow-200" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-yellow-600" }),
                react_1["default"].createElement(alert_1.AlertDescription, { className: "text-yellow-800" },
                    react_1["default"].createElement("div", { className: "font-semibold mb-1" },
                        progress.warnings.length,
                        " Warning",
                        progress.warnings.length !== 1 ? "s" : ""),
                    react_1["default"].createElement("ul", { className: "text-xs space-y-1" },
                        progress.warnings.slice(0, 3).map(function (w, i) { return (react_1["default"].createElement("li", { key: "warn-" + i },
                            "Row ",
                            w.rowIndex + 1,
                            ": ",
                            w.message)); }),
                        progress.warnings.length > 3 && (react_1["default"].createElement("li", { className: "text-yellow-600 italic" },
                            "... and ",
                            progress.warnings.length - 3,
                            " more")))))),
            hasErrors && (react_1["default"].createElement(alert_1.Alert, { className: "bg-red-50 border-red-200" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-red-600" }),
                react_1["default"].createElement(alert_1.AlertDescription, { className: "text-red-800" },
                    react_1["default"].createElement("div", { className: "font-semibold mb-2" },
                        progress.errorDetails.length,
                        " Error",
                        progress.errorDetails.length !== 1 ? "s" : ""),
                    react_1["default"].createElement("div", { className: "space-y-2 max-h-48 overflow-y-auto" },
                        progress.errorDetails.slice(0, 5).map(function (err, i) { return (react_1["default"].createElement("div", { key: i, className: "text-xs p-2 bg-white rounded border border-red-100" },
                            react_1["default"].createElement("div", { className: "font-semibold text-red-700" },
                                "Row ",
                                err.rowIndex + 1),
                            react_1["default"].createElement("div", { className: "text-red-600" }, err.error),
                            Object.keys(err.row).length > 0 && (react_1["default"].createElement("details", { className: "mt-1 cursor-pointer" },
                                react_1["default"].createElement("summary", { className: "text-gray-600 hover:text-gray-800" }, "View row data"),
                                react_1["default"].createElement("pre", { className: "mt-1 text-xs bg-gray-100 p-1 rounded overflow-x-auto" }, JSON.stringify(err.row, null, 2)))))); }),
                        progress.errorDetails.length > 5 && (react_1["default"].createElement("div", { className: "text-xs text-red-600 italic" },
                            "... and ",
                            progress.errorDetails.length - 5,
                            " more errors")))))),
            isProcessing && (react_1["default"].createElement("div", { className: "text-sm text-gray-600 animate-pulse" }, "Processing... Please wait")),
            isCompleted && (react_1["default"].createElement("div", { className: "text-sm" }, hasErrors ? (react_1["default"].createElement("div", { className: "text-amber-700 font-semibold" },
                "Import completed with ",
                progress.errorRows,
                " error(s). Please review and retry failed rows.")) : (react_1["default"].createElement("div", { className: "text-green-700 font-semibold" }, "\u2713 All records imported successfully!")))),
            isFailed && (react_1["default"].createElement("div", { className: "text-sm text-red-700 font-semibold" },
                "Import failed. ",
                progress.errorDetails.length,
                " row(s) could not be processed.")),
            isCompleted && hasErrors && onRollback && (react_1["default"].createElement("div", { className: "pt-2 border-t" },
                react_1["default"].createElement("button", { onClick: function () { return onRollback(progress.batchId); }, className: "text-sm px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors" }, "Rollback This Import"),
                react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-1" },
                    "Undo this import and remove all ",
                    progress.importedRows,
                    " imported records"))))));
};
