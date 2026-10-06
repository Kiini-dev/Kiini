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
function MpesaConfig() {
    var businessSetup = react_1.useState({
        businessName: 'Meli-Tech CRM',
        paybillNumber: '123456',
        accountNumber: 'CRM001',
        shortCode: '654321',
        status: 'active'
    })[0];
    var transactions = react_1.useState({
        daily: 45,
        total: 12.34,
        successRate: 98.9,
        avgTransaction: 273.33
    })[0];
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "M-Pesa Configuration"),
        react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Transactions (Today)"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, transactions.daily),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "Active")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Volume (M KES)"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" },
                    transactions.total,
                    "M"),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "\u2191 5% this week")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Success Rate"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" },
                    transactions.successRate,
                    "%"),
                react_1["default"].createElement("div", { className: "text-xs text-blue-600" }, "Industry avg: 98.5%")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Avg Transaction"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" },
                    "KES ",
                    transactions.avgTransaction),
                react_1["default"].createElement("div", { className: "text-xs text-blue-600" }, "Per transaction"))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Business Setup"),
            react_1["default"].createElement("div", { className: "space-y-3" }, Object.entries(businessSetup).map(function (_a) {
                var key = _a[0], value = _a[1];
                return (react_1["default"].createElement("div", { key: key, className: "flex justify-between p-2" },
                    react_1["default"].createElement("span", { className: "text-gray-600 capitalize" },
                        key.replace(/([A-Z])/g, ' $1'),
                        ":"),
                    react_1["default"].createElement("span", { className: "font-medium" }, String(value))));
            }))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Integration Status"),
            react_1["default"].createElement("div", { className: "space-y-3" }, [
                { name: 'API Connection', status: 'Healthy', lastCheck: '2 min ago' },
                { name: 'STK Push', status: 'Healthy', lastCheck: 'Now' },
                { name: 'Callbacks', status: 'Healthy', lastCheck: '30 sec ago' },
                { name: 'Rate Limiting', status: 'OK', lastCheck: '1 min ago' },
            ].map(function (item) { return (react_1["default"].createElement("div", { key: item.name, className: "flex items-center justify-between p-3 border rounded" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "font-medium" }, item.name),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, item.lastCheck)),
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_1["default"].createElement("span", { className: "inline-block w-2 h-2 bg-green-500 rounded-full" }),
                    react_1["default"].createElement("span", { className: "text-sm" }, item.status)))); }))),
        react_1["default"].createElement("div", { className: "bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex gap-3" },
            react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5 text-yellow-600 flex-shrink-0" }),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("div", { className: "font-medium text-yellow-800" }, "Sandbox Mode"),
                react_1["default"].createElement("div", { className: "text-sm text-yellow-700" }, "Switch to live credentials in settings to process real transactions"))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Recent Transactions"),
            react_1["default"].createElement("div", { className: "space-y-2 max-h-64 overflow-y-auto" }, __spreadArrays(Array(10)).map(function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "flex justify-between items-center p-3 border rounded" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "font-medium" },
                        "TXN",
                        String(i + 1).padStart(6, '0')),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
                        "2026-03-16 ",
                        String(14 - i).padStart(2, '0'),
                        ":30")),
                react_1["default"].createElement("div", { className: "text-right" },
                    react_1["default"].createElement("div", { className: "font-semibold" },
                        "KES ",
                        (273.33 + Math.random() * 200).toFixed(2)),
                    react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "Success")))); })))));
}
exports["default"] = MpesaConfig;
