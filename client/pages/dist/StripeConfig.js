"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function StripeConfig() {
    var _a = react_1.useState(false), copied = _a[0], setCopied = _a[1];
    var _b = react_1.useState({
        publicKey: 'pk_live_abc123xyz789',
        secretKey: 'sk_live_••••••••',
        webhookSecret: 'whsec_••••••••'
    }), config = _b[0], setConfig = _b[1];
    var handleCopy = function (text) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(function () { return setCopied(false); }, 2000);
    };
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Stripe Configuration"),
        react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Transactions (Today)"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "45"),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "\u2191 12% vs yesterday")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Volume"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "$12,340"),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "\u2191 8% vs yesterday")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Success Rate"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "99.8%"),
                react_1["default"].createElement("div", { className: "text-xs text-blue-600" }, "Industry avg: 99.5%"))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "API Keys"),
            react_1["default"].createElement("div", { className: "space-y-4" }, Object.entries(config).map(function (_a) {
                var key = _a[0], value = _a[1];
                return (react_1["default"].createElement("div", { key: key },
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1 capitalize" }, key.replace(/([A-Z])/g, ' $1')),
                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                        react_1["default"].createElement("input", { type: "password", value: value, readOnly: true, className: "flex-1 px-3 py-2 border rounded-lg bg-gray-50" }),
                        react_1["default"].createElement("button", { onClick: function () { return handleCopy(value); }, className: "p-2 border rounded-lg hover:bg-gray-50" }, copied ? (react_1["default"].createElement(lucide_react_1.Check, { className: "w-4 h-4 text-green-600" })) : (react_1["default"].createElement(lucide_react_1.Copy, { className: "w-4 h-4 text-gray-600" }))))));
            }))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Features Enabled"),
            react_1["default"].createElement("div", { className: "space-y-3" }, [
                { name: 'Payments', enabled: true },
                { name: 'Subscriptions', enabled: true },
                { name: 'Invoices', enabled: true },
                { name: 'Payouts', enabled: true },
                { name: 'Refunds', enabled: true },
                { name: 'Disputes', enabled: true },
            ].map(function (feature) { return (react_1["default"].createElement("div", { key: feature.name, className: "flex items-center gap-2" },
                react_1["default"].createElement("input", { type: "checkbox", checked: feature.enabled, readOnly: true, className: "rounded" }),
                react_1["default"].createElement("span", null, feature.name))); }))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Recent Transactions"),
            react_1["default"].createElement("div", { className: "space-y-2" }, [
                { id: 'ch_001', amount: '$99.99', status: 'Succeeded', date: '2026-03-16 14:32' },
                { id: 'ch_002', amount: '$149.99', status: 'Succeeded', date: '2026-03-16 13:15' },
                { id: 'ch_003', amount: '$29.99', status: 'Succeeded', date: '2026-03-16 12:45' },
            ].map(function (tx) { return (react_1["default"].createElement("div", { key: tx.id, className: "flex justify-between p-3 border rounded" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "font-medium" }, tx.id),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, tx.date)),
                react_1["default"].createElement("div", { className: "text-right" },
                    react_1["default"].createElement("div", { className: "font-semibold" }, tx.amount),
                    react_1["default"].createElement("div", { className: "text-xs text-green-600" }, tx.status)))); })))));
}
exports["default"] = StripeConfig;
