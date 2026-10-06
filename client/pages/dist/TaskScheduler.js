"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function TaskScheduler() {
    var _a = react_1.useState([
        {
            id: 1,
            name: 'Daily Report Generation',
            schedule: '10:00 AM Daily',
            status: 'scheduled',
            nextRun: '2026-03-17 10:00',
            lastRun: '2026-03-16 10:02'
        },
        {
            id: 2,
            name: 'Weekly Backup',
            schedule: 'Every Monday 2:00 AM',
            status: 'scheduled',
            nextRun: '2026-03-24 02:00',
            lastRun: '2026-03-17 02:05'
        },
        {
            id: 3,
            name: 'Monthly Cleanup',
            schedule: '1st of Month 12:00 AM',
            status: 'scheduled',
            nextRun: '2026-04-01 00:00',
            lastRun: '2026-03-01 00:15'
        },
    ]), tasks = _a[0], setTasks = _a[1];
    var _b = react_1.useState(false), showNew = _b[0], setShowNew = _b[1];
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
            react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Task Scheduler"),
            react_1["default"].createElement("button", { onClick: function () { return setShowNew(true); }, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" },
                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                " Schedule Task")),
        react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Scheduled Tasks"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, tasks.length),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "All active")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Executions Today"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "12"),
                react_1["default"].createElement("div", { className: "text-xs text-blue-600" }, "Last 24 hours")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Success Rate"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "100%"),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "This month"))),
        showNew && (react_1["default"].createElement("div", { className: "bg-blue-50 p-6 rounded-lg border border-blue-200" },
            react_1["default"].createElement("h2", { className: "text-lg font-semibold mb-4" }, "Schedule New Task"),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Task Name"),
                    react_1["default"].createElement("input", { type: "text", placeholder: "e.g., Generate Report", className: "w-full px-3 py-2 border rounded-lg" })),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Frequency"),
                        react_1["default"].createElement("select", { className: "w-full px-3 py-2 border rounded-lg" },
                            react_1["default"].createElement("option", null, "Daily"),
                            react_1["default"].createElement("option", null, "Weekly"),
                            react_1["default"].createElement("option", null, "Monthly"),
                            react_1["default"].createElement("option", null, "Custom"))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Time"),
                        react_1["default"].createElement("input", { type: "time", className: "w-full px-3 py-2 border rounded-lg" }))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Action"),
                    react_1["default"].createElement("select", { className: "w-full px-3 py-2 border rounded-lg" },
                        react_1["default"].createElement("option", null, "Run Command"),
                        react_1["default"].createElement("option", null, "Send Email"),
                        react_1["default"].createElement("option", null, "Generate Report"),
                        react_1["default"].createElement("option", null, "Backup Data"))),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    react_1["default"].createElement("button", { className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" }, "Schedule"),
                    react_1["default"].createElement("button", { onClick: function () { return setShowNew(false); }, className: "px-4 py-2 border rounded-lg hover:bg-gray-50" }, "Cancel"))))),
        react_1["default"].createElement("div", { className: "space-y-3" }, tasks.map(function (task) { return (react_1["default"].createElement("div", { key: task.id, className: "bg-white p-4 rounded-lg shadow hover:shadow-md transition" },
            react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("h3", { className: "font-semibold text-lg" }, task.name),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-600 mt-1" }, task.schedule)),
                react_1["default"].createElement("span", { className: "inline-block w-2 h-2 bg-green-500 rounded-full" })),
            react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4 text-sm mb-3" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Calendar, { className: "w-4 h-4 text-gray-400" }),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "text-gray-600" }, "Next Run"),
                        react_1["default"].createElement("div", { className: "font-medium" }, task.nextRun))),
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Clock, { className: "w-4 h-4 text-gray-400" }),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "text-gray-600" }, "Last Run"),
                        react_1["default"].createElement("div", { className: "font-medium" }, task.lastRun))),
                react_1["default"].createElement("div", { className: "text-right" },
                    react_1["default"].createElement("button", { className: "text-blue-600 hover:text-blue-800 font-medium" }, "Edit"))))); })),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Execution Calendar"),
            react_1["default"].createElement("div", { className: "grid grid-cols-7 gap-2" },
                ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (day) { return (react_1["default"].createElement("div", { key: day, className: "text-center text-xs font-semibold text-gray-600 pb-2" }, day)); }),
                __spreadArrays(Array(28)).map(function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "aspect-square flex items-center justify-center rounded text-xs font-medium " + ([3, 10, 17, 24].includes(i)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-50 text-gray-700') }, i + 1)); }))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Execution History"),
            react_1["default"].createElement("div", { className: "space-y-2 max-h-64 overflow-y-auto" }, [
                { time: '10:02', task: 'Daily Report', duration: '45s', status: 'success' },
                { time: '09:32', task: 'Data Sync', duration: '23s', status: 'success' },
                { time: '09:00', task: 'Mobile Check', duration: '12s', status: 'success' },
            ].map(function (exec, i) { return (react_1["default"].createElement("div", { key: i, className: "flex justify-between items-center p-3 border rounded" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "font-medium" }, exec.task),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
                        exec.time,
                        " \u2022 ",
                        exec.duration)),
                react_1["default"].createElement("span", { className: "inline-block w-2 h-2 bg-green-500 rounded-full" }))); })))));
}
exports["default"] = TaskScheduler;
