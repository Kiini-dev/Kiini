"use strict";
exports.__esModule = true;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
function BulkProgressTracker(_a) {
    var _b = _a.title, title = _b === void 0 ? "Bulk Operation in Progress" : _b, _c = _a.totalItems, totalItems = _c === void 0 ? 100 : _c, _d = _a.currentItem, currentItem = _d === void 0 ? 35 : _d, _e = _a.failedItems, failedItems = _e === void 0 ? 2 : _e;
    var _f = react_1.useState(0), progress = _f[0], setProgress = _f[1];
    var _g = react_1.useState("0:00"), elapsedTime = _g[0], setElapsedTime = _g[1];
    react_1.useEffect(function () {
        // Simulate progress
        var interval = setInterval(function () {
            setProgress(function (prev) {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + Math.random() * 20;
            });
        }, 500);
        return function () { return clearInterval(interval); };
    }, []);
    react_1.useEffect(function () {
        // Update elapsed time
        var interval = setInterval(function () {
            setElapsedTime(function (prev) {
                var _a = prev.split(":").map(Number), minutes = _a[0], seconds = _a[1];
                var totalSeconds = minutes * 60 + seconds + 1;
                var newMinutes = Math.floor(totalSeconds / 60);
                var newSeconds = totalSeconds % 60;
                return newMinutes + ":" + newSeconds.toString().padStart(2, "0");
            });
        }, 1000);
        return function () { return clearInterval(interval); };
    }, []);
    var successCount = currentItem - failedItems;
    var progressPercent = (currentItem / totalItems) * 100;
    return (React.createElement(card_1.Card, { className: "border-blue-200 bg-blue-50" },
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.Clock, { className: "w-5 h-5 text-blue-600" }),
                title),
            React.createElement(card_1.CardDescription, null, "Operation status and progress")),
        React.createElement(card_1.CardContent, { className: "space-y-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement("div", { className: "flex justify-between text-sm" },
                    React.createElement("span", { className: "font-medium" }, "Overall Progress"),
                    React.createElement("span", { className: "text-muted-foreground" },
                        Math.min(100, Math.round(progressPercent)),
                        "%")),
                React.createElement(progress_1.Progress, { value: Math.min(100, progressPercent), className: "h-2" })),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" },
                React.createElement("div", { className: "bg-white rounded-lg p-3 border" },
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Processed"),
                    React.createElement("p", { className: "text-lg font-bold" }, currentItem),
                    React.createElement("p", { className: "text-xs text-muted-foreground" },
                        "of ",
                        totalItems)),
                React.createElement("div", { className: "bg-white rounded-lg p-3 border border-green-200" },
                    React.createElement("p", { className: "text-xs text-muted-foreground flex items-center gap-1" },
                        React.createElement(lucide_react_1.CheckCircle, { className: "w-3 h-3 text-green-600" }),
                        "Success"),
                    React.createElement("p", { className: "text-lg font-bold text-green-600" }, successCount)),
                React.createElement("div", { className: "bg-white rounded-lg p-3 border border-red-200" },
                    React.createElement("p", { className: "text-xs text-muted-foreground flex items-center gap-1" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "w-3 h-3 text-red-600" }),
                        "Failed"),
                    React.createElement("p", { className: "text-lg font-bold text-red-600" }, failedItems)),
                React.createElement("div", { className: "bg-white rounded-lg p-3 border" },
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Elapsed"),
                    React.createElement("p", { className: "text-lg font-bold font-mono" }, elapsedTime))),
            React.createElement("div", { className: "text-sm text-muted-foreground" }, currentItem === totalItems
                ? "✓ Bulk operation completed successfully"
                : "Processing item " + currentItem + " of " + totalItems + "..."))));
}
exports["default"] = BulkProgressTracker;
