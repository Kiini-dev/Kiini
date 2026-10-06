"use strict";
exports.__esModule = true;
exports.ProjectProgressBar = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function ProjectProgressBar(_a) {
    var projectId = _a.projectId, projectName = _a.projectName, currentProgress = _a.currentProgress, onProgressUpdate = _a.onProgressUpdate, _b = _a.isEditable, isEditable = _b === void 0 ? true : _b;
    var _c = react_1.useState(currentProgress), progress = _c[0], setProgress = _c[1];
    var _d = react_1.useState(false), isDialogOpen = _d[0], setIsDialogOpen = _d[1];
    var _e = react_1.useState(currentProgress.toString()), newProgress = _e[0], setNewProgress = _e[1];
    var getProgressColor = function (value) {
        if (value < 25)
            return "bg-red-500";
        if (value < 50)
            return "bg-orange-500";
        if (value < 75)
            return "bg-yellow-500";
        if (value < 100)
            return "bg-blue-500";
        return "bg-green-500";
    };
    var getProgressLabel = function (value) {
        if (value === 0)
            return "Not Started";
        if (value < 25)
            return "Planning";
        if (value < 50)
            return "In Progress";
        if (value < 75)
            return "Advanced";
        if (value < 100)
            return "Nearly Complete";
        return "Completed";
    };
    var handleUpdateProgress = function () {
        var newVal = parseInt(newProgress);
        if (isNaN(newVal) || newVal < 0 || newVal > 100) {
            sonner_1.toast.error("Please enter a value between 0 and 100");
            return;
        }
        setProgress(newVal);
        setIsDialogOpen(false);
        if (onProgressUpdate) {
            onProgressUpdate(newVal);
        }
        sonner_1.toast.success("Project progress updated to " + newVal + "%");
    };
    var handleQuickUpdate = function (value) {
        setProgress(value);
        if (onProgressUpdate) {
            onProgressUpdate(value);
        }
        sonner_1.toast.success("Project progress updated to " + value + "%");
    };
    return (React.createElement(card_1.Card, { className: "w-full" },
        React.createElement(card_1.CardHeader, null,
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        progress === 100 ? (React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-500" })) : progress > 0 ? (React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-blue-500" })) : null,
                        "Project Progress"),
                    React.createElement(card_1.CardDescription, null, projectName)),
                isEditable && (React.createElement(dialog_1.Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm" },
                            React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4 mr-2" }),
                            "Edit")),
                    React.createElement(dialog_1.DialogContent, null,
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null, "Update Project Progress"),
                            React.createElement(dialog_1.DialogDescription, null,
                                "Enter the new progress percentage for ",
                                projectName)),
                        React.createElement("div", { className: "grid gap-4 py-4" },
                            React.createElement("div", { className: "grid gap-2" },
                                React.createElement(label_1.Label, { htmlFor: "progress" }, "Progress (%)"),
                                React.createElement(input_1.Input, { id: "progress", type: "number", min: "0", max: "100", value: newProgress, onChange: function (e) { return setNewProgress(e.target.value); }, placeholder: "Enter progress percentage" })),
                            React.createElement("div", { className: "grid gap-2" },
                                React.createElement(label_1.Label, null, "Quick Actions"),
                                React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" }, [0, 25, 50, 75, 100].map(function (val) { return (React.createElement(button_1.Button, { key: val, variant: parseInt(newProgress) === val ? "default" : "outline", size: "sm", onClick: function () { return setNewProgress(val.toString()); } },
                                    val,
                                    "%")); })))),
                        React.createElement(dialog_1.DialogFooter, null,
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsDialogOpen(false); } }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: handleUpdateProgress }, "Update Progress"))))))),
        React.createElement(card_1.CardContent, { className: "space-y-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("span", { className: "text-sm font-medium" }, getProgressLabel(progress)),
                    React.createElement("span", { className: "text-sm font-bold text-gray-600" },
                        progress,
                        "%")),
                React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-3 overflow-hidden" },
                    React.createElement("div", { className: "h-full " + getProgressColor(progress) + " transition-all duration-300 ease-out", style: { width: progress + "%" } }))),
            React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-4" },
                React.createElement("div", { className: "text-center p-2 bg-gray-50 rounded" },
                    React.createElement("div", { className: "text-xs text-gray-600" }, "Start"),
                    React.createElement("div", { className: "text-sm font-semibold" }, "0%")),
                React.createElement("div", { className: "text-center p-2 bg-gray-50 rounded" },
                    React.createElement("div", { className: "text-xs text-gray-600" }, "Quarter"),
                    React.createElement("div", { className: "text-sm font-semibold" }, "25%")),
                React.createElement("div", { className: "text-center p-2 bg-gray-50 rounded" },
                    React.createElement("div", { className: "text-xs text-gray-600" }, "Halfway"),
                    React.createElement("div", { className: "text-sm font-semibold" }, "50%")),
                React.createElement("div", { className: "text-center p-2 bg-gray-50 rounded" },
                    React.createElement("div", { className: "text-xs text-gray-600" }, "Complete"),
                    React.createElement("div", { className: "text-sm font-semibold" }, "100%"))),
            isEditable && (React.createElement("div", { className: "pt-4 border-t" },
                React.createElement("div", { className: "text-sm font-medium mb-2" }, "Quick Update"),
                React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2" }, [0, 25, 50, 75, 100].map(function (val) { return (React.createElement(button_1.Button, { key: val, variant: progress === val ? "default" : "outline", size: "sm", onClick: function () { return handleQuickUpdate(val); }, className: "text-xs" },
                    val,
                    "%")); })))),
            React.createElement("div", { className: "pt-4 border-t" },
                React.createElement("div", { className: "flex items-center gap-2 p-3 bg-blue-50 rounded-lg" }, progress === 100 ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-500" }),
                    React.createElement("div", null,
                        React.createElement("div", { className: "text-sm font-semibold text-green-700" }, "Project Completed"),
                        React.createElement("div", { className: "text-xs text-green-600" }, "All tasks finished")))) : progress > 0 ? (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-blue-500" }),
                    React.createElement("div", null,
                        React.createElement("div", { className: "text-sm font-semibold text-blue-700" }, "In Progress"),
                        React.createElement("div", { className: "text-xs text-blue-600" },
                            100 - progress,
                            "% remaining")))) : (React.createElement(React.Fragment, null,
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-gray-400" }),
                    React.createElement("div", null,
                        React.createElement("div", { className: "text-sm font-semibold text-gray-700" }, "Not Started"),
                        React.createElement("div", { className: "text-xs text-gray-600" }, "Ready to begin")))))))));
}
exports.ProjectProgressBar = ProjectProgressBar;
