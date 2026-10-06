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
function RuleBuilder() {
    var _a = react_1.useState([
        {
            id: 1,
            name: 'High Value Order Alert',
            condition: 'IF Order Amount > $1000 THEN Send Email',
            enabled: true,
            executionCount: 234
        },
        {
            id: 2,
            name: 'Stock Low Notification',
            condition: 'IF Inventory < 50 THEN Create Task',
            enabled: true,
            executionCount: 156
        },
        {
            id: 3,
            name: 'Customer Birthday',
            condition: 'IF Date = Birthday THEN Send Message',
            enabled: false,
            executionCount: 0
        },
    ]), rules = _a[0], setRules = _a[1];
    var _b = react_1.useState(false), showNew = _b[0], setShowNew = _b[1];
    var _c = react_1.useState(null), editingId = _c[0], setEditingId = _c[1];
    var toggleRule = function (id) {
        setRules(rules.map(function (r) { return r.id === id ? __assign(__assign({}, r), { enabled: !r.enabled }) : r; }));
    };
    var deleteRule = function (id) {
        setRules(rules.filter(function (r) { return r.id !== id; }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
            react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Rule Builder"),
            react_1["default"].createElement("button", { onClick: function () { return setShowNew(true); }, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" },
                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                " New Rule")),
        showNew && (react_1["default"].createElement("div", { className: "bg-blue-50 p-6 rounded-lg border border-blue-200" },
            react_1["default"].createElement("h2", { className: "text-lg font-semibold mb-4" }, "Create New Rule"),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Rule Name"),
                    react_1["default"].createElement("input", { type: "text", placeholder: "e.g., High Alert", className: "w-full px-3 py-2 border rounded-lg" })),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Condition"),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement("select", { className: "flex-1 px-3 py-2 border rounded-lg" },
                                react_1["default"].createElement("option", null, "IF")),
                            react_1["default"].createElement("input", { placeholder: "Field", type: "text", className: "flex-1 px-3 py-2 border rounded-lg" }),
                            react_1["default"].createElement("select", { className: "flex-1 px-3 py-2 border rounded-lg" },
                                react_1["default"].createElement("option", null, "equals"),
                                react_1["default"].createElement("option", null, "greater than"),
                                react_1["default"].createElement("option", null, "less than")),
                            react_1["default"].createElement("input", { placeholder: "Value", type: "text", className: "flex-1 px-3 py-2 border rounded-lg" })))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Then Action"),
                    react_1["default"].createElement("select", { className: "w-full px-3 py-2 border rounded-lg" },
                        react_1["default"].createElement("option", null, "Send Email"),
                        react_1["default"].createElement("option", null, "Create Task"),
                        react_1["default"].createElement("option", null, "Update Record"),
                        react_1["default"].createElement("option", null, "Trigger Workflow"))),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    react_1["default"].createElement("button", { className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" }, "Create Rule"),
                    react_1["default"].createElement("button", { onClick: function () { return setShowNew(false); }, className: "px-4 py-2 border rounded-lg hover:bg-gray-50" }, "Cancel"))))),
        react_1["default"].createElement("div", { className: "space-y-3" }, rules.map(function (rule) { return (react_1["default"].createElement("div", { key: rule.id, className: "bg-white p-4 rounded-lg shadow" },
            react_1["default"].createElement("div", { className: "flex items-start justify-between mb-2" },
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                        react_1["default"].createElement("input", { type: "checkbox", checked: rule.enabled, onChange: function () { return toggleRule(rule.id); }, className: "rounded" }),
                        react_1["default"].createElement("h3", { className: "font-semibold text-lg" }, rule.name)),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-600 mt-1 ml-6" }, rule.condition)),
                react_1["default"].createElement("div", { className: "flex gap-1" },
                    react_1["default"].createElement("button", { className: "p-2 hover:bg-gray-100 rounded" },
                        react_1["default"].createElement(lucide_react_1.Settings, { className: "w-4 h-4 text-gray-600" })),
                    react_1["default"].createElement("button", { onClick: function () { return deleteRule(rule.id); }, className: "p-2 hover:bg-red-50 rounded" },
                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4 text-red-600" })))),
            react_1["default"].createElement("div", { className: "ml-6 pt-2 border-t" },
                react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
                    "Executed ",
                    rule.executionCount,
                    " times | Status: ",
                    rule.enabled ? '🟢 Active' : '⚪ Inactive')))); })),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Rule Templates"),
            react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-3" }, [
                'Threshold Alert',
                'Time-based Action',
                'User Approval',
                'Data Validation',
                'Status Change',
                'Scheduled Task',
            ].map(function (template) { return (react_1["default"].createElement("button", { key: template, className: "p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-sm font-medium" }, template)); }))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Rule Statistics"),
            react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4" },
                react_1["default"].createElement("div", { className: "text-center" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-blue-600" }, rules.length),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Rules")),
                react_1["default"].createElement("div", { className: "text-center" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-green-600" }, rules.filter(function (r) { return r.enabled; }).length),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Active")),
                react_1["default"].createElement("div", { className: "text-center" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-orange-600" }, rules.reduce(function (s, r) { return s + r.executionCount; }, 0)),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Executions")),
                react_1["default"].createElement("div", { className: "text-center" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-purple-600" }, "98.7%"),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Success Rate"))))));
}
exports["default"] = RuleBuilder;
