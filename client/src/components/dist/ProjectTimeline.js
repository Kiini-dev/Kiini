"use strict";
exports.__esModule = true;
exports.ProjectTimeline = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function ProjectTimeline(_a) {
    var projects = _a.projects;
    // Calculate timeline dimensions
    var allDates = projects.flatMap(function (p) { return [
        p.startDate ? new Date(p.startDate) : new Date(),
        p.endDate ? new Date(p.endDate) : new Date(),
    ]; });
    var minDate = react_1.useMemo(function () {
        var earliest = new Date(Math.min.apply(Math, allDates.map(function (d) { return d.getTime(); })));
        // Start from beginning of month
        earliest.setDate(1);
        return earliest;
    }, [allDates]);
    var maxDate = react_1.useMemo(function () {
        var latest = new Date(Math.max.apply(Math, allDates.map(function (d) { return d.getTime(); })));
        // End at last day of month
        latest.setMonth(latest.getMonth() + 1);
        latest.setDate(0);
        return latest;
    }, [allDates]);
    var totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    var pixelsPerDay = 300 / totalDays; // Total width divided by days
    // Generate month headers
    var monthHeaders = react_1.useMemo(function () {
        var headers = [];
        var current = new Date(minDate);
        while (current <= maxDate) {
            var monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
            var monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
            var visibleStart = Math.max(monthStart.getTime(), minDate.getTime());
            var visibleEnd = Math.min(monthEnd.getTime(), maxDate.getTime());
            var startDay = Math.ceil((visibleStart - minDate.getTime()) / (1000 * 60 * 60 * 24));
            var dayCount = Math.ceil((visibleEnd - visibleStart) / (1000 * 60 * 60 * 24)) + 1;
            headers.push({
                month: current.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
                startDay: startDay,
                dayCount: dayCount
            });
            current.setMonth(current.getMonth() + 1);
        }
        return headers;
    }, [minDate, maxDate]);
    var getTaskPosition = function (startDate, endDate) {
        var start = startDate ? new Date(startDate) : minDate;
        var end = endDate ? new Date(endDate) : maxDate;
        var left = Math.max(0, (start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
        var width = Math.max(1, (end.getTime() - Math.max(start.getTime(), minDate.getTime())) / (1000 * 60 * 60 * 24));
        return {
            left: left * pixelsPerDay,
            width: Math.max(width * pixelsPerDay, 20)
        };
    };
    var getStatusColor = function (status) {
        switch (status) {
            case "completed":
                return "bg-green-500";
            case "active":
                return "bg-blue-500";
            case "on_hold":
                return "bg-amber-500";
            case "cancelled":
                return "bg-red-500";
            default:
                return "bg-gray-400";
        }
    };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case "urgent":
                return "border-l-4 border-red-500";
            case "high":
                return "border-l-4 border-orange-500";
            case "medium":
                return "border-l-4 border-blue-500";
            default:
                return "border-l-4 border-gray-400";
        }
    };
    var getProgressColor = function (progress) {
        if (progress >= 100)
            return "bg-green-500";
        if (progress >= 75)
            return "bg-blue-500";
        if (progress >= 50)
            return "bg-amber-500";
        return "bg-red-500";
    };
    return (react_1["default"].createElement("div", { className: "w-full bg-white rounded-lg border border-gray-200" },
        react_1["default"].createElement("div", { className: "px-6 py-4 border-b border-gray-200" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-4" },
                react_1["default"].createElement(lucide_react_1.Calendar, { className: "w-5 h-5 text-blue-600" }),
                react_1["default"].createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "Project Timeline")),
            react_1["default"].createElement("p", { className: "text-sm text-gray-600" },
                minDate.toLocaleDateString(),
                " - ",
                maxDate.toLocaleDateString())),
        react_1["default"].createElement("div", { className: "overflow-x-auto" },
            react_1["default"].createElement("div", { className: "inline-block min-w-full" },
                react_1["default"].createElement("div", { className: "flex" },
                    react_1["default"].createElement("div", { className: "w-64 flex-shrink-0" }),
                    react_1["default"].createElement("div", { className: "flex" }, monthHeaders.map(function (header, idx) { return (react_1["default"].createElement("div", { key: header.month || "month-" + idx, className: "border-r border-gray-200 text-center py-2 text-xs font-semibold text-gray-700 bg-gray-50", style: { width: header.dayCount * pixelsPerDay } }, header.month)); }))),
                react_1["default"].createElement("div", { className: "relative" },
                    react_1["default"].createElement("div", { className: "flex" },
                        react_1["default"].createElement("div", { className: "w-64 flex-shrink-0" }),
                        react_1["default"].createElement("div", { className: "flex" }, Array.from({ length: totalDays }).map(function (_, idx) { return (react_1["default"].createElement("div", { key: "day-" + idx, className: "border-r border-gray-100", style: { width: pixelsPerDay } })); }))),
                    react_1["default"].createElement("div", { className: "absolute inset-0" }, projects.map(function (project, idx) {
                        var position = getTaskPosition(project.startDate, project.endDate);
                        var isOverdue = project.endDate &&
                            new Date(project.endDate) < new Date() &&
                            project.status !== "completed";
                        return (react_1["default"].createElement("div", { key: project.id, className: "flex items-center h-12 border-b border-gray-100", style: { marginTop: idx * 48 } },
                            react_1["default"].createElement("div", { className: "w-64 flex-shrink-0 px-2 text-sm font-medium text-gray-900 truncate" }, project.name),
                            react_1["default"].createElement("div", { className: "relative flex-1", style: { minWidth: 300 } },
                                react_1["default"].createElement("div", { className: "absolute top-2 h-8 rounded-md shadow-sm transition-all " + getStatusColor(project.status) + " " + getPriorityColor(project.priority) + " opacity-90 hover:opacity-100 cursor-pointer group", style: {
                                        left: position.left,
                                        width: position.width
                                    }, title: project.name + " (" + project.progress + "% complete)" },
                                    react_1["default"].createElement("div", { className: "h-full rounded-md bg-white opacity-30", style: {
                                            width: Math.max(project.progress || 0, 5) + "%"
                                        } }),
                                    react_1["default"].createElement("div", { className: "absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50" },
                                        react_1["default"].createElement("div", null, project.name),
                                        react_1["default"].createElement("div", { className: "text-gray-300" },
                                            project.progress || 0,
                                            "% complete"))),
                                project.endDate && (react_1["default"].createElement("div", { className: "absolute top-2 w-1 h-8 bg-gray-400 rounded-full opacity-70", style: {
                                        left: position.left + position.width
                                    } })),
                                isOverdue && (react_1["default"].createElement("div", { className: "absolute top-0 left-0 -translate-y-4" },
                                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-red-500", title: "Overdue" }))))));
                    })),
                    react_1["default"].createElement("div", { className: "absolute right-0 top-0 w-48 border-l border-gray-200 bg-gray-50" }, projects.map(function (project, idx) { return (react_1["default"].createElement("div", { key: project.id, className: "flex items-center h-12 px-3 border-b border-gray-100 text-xs", style: { marginTop: idx * 48 } },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2 flex-1" },
                            project.status === "completed" && (react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "w-4 h-4 text-green-600" })),
                            project.status === "active" && (react_1["default"].createElement(lucide_react_1.Clock, { className: "w-4 h-4 text-blue-600" })),
                            react_1["default"].createElement("div", { className: "flex-1" },
                                react_1["default"].createElement("div", { className: "text-gray-700 font-semibold" },
                                    project.progress || 0,
                                    "%"),
                                react_1["default"].createElement("div", { className: "w-full bg-gray-300 rounded-full h-1.5 mt-0.5" },
                                    react_1["default"].createElement("div", { className: "h-full rounded-full " + getProgressColor(project.progress || 0), style: { width: Math.min(project.progress || 0, 100) + "%" } })))))); }))))),
        react_1["default"].createElement("div", { className: "px-6 py-3 border-t border-gray-200 bg-gray-50" },
            react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-xs" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement("div", { className: "w-4 h-4 bg-green-500 rounded" }),
                    react_1["default"].createElement("span", null, "Completed")),
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement("div", { className: "w-4 h-4 bg-blue-500 rounded" }),
                    react_1["default"].createElement("span", null, "Active")),
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement("div", { className: "w-4 h-4 bg-amber-500 rounded" }),
                    react_1["default"].createElement("span", null, "On Hold")),
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement("div", { className: "w-4 h-4 bg-red-500 rounded" }),
                    react_1["default"].createElement("span", null, "Cancelled"))))));
}
exports.ProjectTimeline = ProjectTimeline;
exports["default"] = ProjectTimeline;
