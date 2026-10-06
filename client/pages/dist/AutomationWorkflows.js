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
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function AutomationWorkflows() {
    var _a = react_1.useState([
        {
            id: 1,
            name: 'Invoice Approval',
            trigger: 'Manual trigger',
            status: 'active',
            executions: 456,
            successRate: 99.1,
            created: '2026-02-15'
        },
        {
            id: 2,
            name: 'Payment Processing',
            trigger: 'Schedule daily',
            status: 'active',
            executions: 389,
            successRate: 98.7,
            created: '2026-02-01'
        },
        {
            id: 3,
            name: 'Report Generation',
            trigger: 'Monthly on 1st',
            status: 'paused',
            executions: 287,
            successRate: 98.3,
            created: '2026-01-15'
        },
    ]), workflows = _a[0], setWorkflows = _a[1];
    var toggleWorkflow = function (id) {
        setWorkflows(workflows.map(function (w) {
            return w.id === id ? __assign(__assign({}, w), { status: w.status === 'active' ? 'paused' : 'active' }) : w;
        }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
            react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Automation Workflows"),
            react_1["default"].createElement("button", { className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" },
                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                " New Workflow")),
        react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Workflows"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, workflows.length),
                react_1["default"].createElement("div", { className: "text-xs text-blue-600" },
                    workflows.filter(function (w) { return w.status === 'active'; }).length,
                    " active")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Executions"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, workflows.reduce(function (s, w) { return s + w.executions; }, 0).toLocaleString()),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "\u2191 12% this month")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Avg Success Rate"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "98.7%"),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "Highly reliable"))),
        react_1["default"].createElement("div", { className: "space-y-3" }, workflows.map(function (workflow) { return (react_1["default"].createElement("div", { key: workflow.id, className: "bg-white p-4 rounded-lg shadow hover:shadow-md transition" },
            react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-lg" }, workflow.name),
                        react_1["default"].createElement("span", { className: "px-2 py-1 text-xs font-medium rounded " + (workflow.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800') }, workflow.status === 'active' ? '🟢 Active' : '⚪ Paused')),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-600 mt-1" }, workflow.trigger)),
                react_1["default"].createElement("button", { onClick: function () { return toggleWorkflow(workflow.id); }, className: "flex-shrink-0" }, workflow.status === 'active' ? (react_1["default"].createElement(lucide_react_1.Pause, { className: "w-6 h-6 text-blue-600" })) : (react_1["default"].createElement(lucide_react_1.Play, { className: "w-6 h-6 text-gray-400" })))),
            react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-3 text-sm" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "text-gray-600" }, "Executions"),
                    react_1["default"].createElement("div", { className: "font-semibold" }, workflow.executions)),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "text-gray-600" }, "Success Rate"),
                    react_1["default"].createElement("div", { className: "font-semibold text-green-600" },
                        workflow.successRate,
                        "%")),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "text-gray-600" }, "Created"),
                    react_1["default"].createElement("div", { className: "font-semibold" }, workflow.created)),
                react_1["default"].createElement("div", { className: "text-right" },
                    react_1["default"].createElement("button", { className: "text-blue-600 hover:text-blue-800 font-medium" }, "Edit"))))); })),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Execution Timeline"),
            react_1["default"].createElement("div", { className: "space-y-2 max-h-64 overflow-y-auto" }, [
                { time: '14:32', workflow: 'Invoice Approval', status: 'success', duration: 423 },
                { time: '14:15', workflow: 'Payment Processing', status: 'success', duration: 389 },
                { time: '13:45', workflow: 'Report Generation', status: 'success', duration: 523 },
                { time: '13:20', workflow: 'Invoice Approval', status: 'success', duration: 412 },
            ].map(function (exec, i) { return (react_1["default"].createElement("div", { key: i, className: "flex justify-between items-center p-3 border rounded" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "font-medium" }, exec.workflow),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
                        exec.time,
                        " \u2022 ",
                        exec.duration,
                        "ms")),
                react_1["default"].createElement("span", { className: "inline-block w-2 h-2 bg-green-500 rounded-full" }))); })))));
}
exports["default"] = AutomationWorkflows;
