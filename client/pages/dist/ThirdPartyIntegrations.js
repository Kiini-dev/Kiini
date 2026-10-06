"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function ThirdPartyIntegrations() {
    var _a;
    var integrations = react_1.useState([
        {
            id: 'stripe',
            name: 'Stripe',
            category: 'Payments',
            status: 'connected',
            icon: '💳',
            metrics: {
                transactionsToday: '45',
                volume: '$12,340',
                successRate: '99.8%'
            },
            description: 'Accept payments and manage billing'
        },
        {
            id: 'mpesa',
            name: 'M-Pesa',
            category: 'Mobile Money',
            status: 'connected',
            icon: '📱',
            metrics: {
                transactionsToday: '45',
                volume: '12.34M KES',
                successRate: '98.9%'
            },
            description: 'Mobile money integration for Africa'
        },
        {
            id: 'google',
            name: 'Google OAuth',
            category: 'Authentication',
            status: 'connected',
            icon: '🔐',
            metrics: {
                usersToday: '234',
                monthlyUsers: '3,420',
                failureRate: '0.2%'
            },
            description: 'Single sign-on via Google'
        },
        {
            id: 'slack',
            name: 'Slack',
            category: 'Communications',
            status: 'disconnected',
            icon: '💬',
            metrics: null,
            description: 'Team notifications and alerts'
        },
    ])[0];
    var _b = react_1.useState(null), selectedIntegration = _b[0], setSelectedIntegration = _b[1];
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
            react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Third-Party Integrations"),
            react_1["default"].createElement("button", { className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" }, "+ Add Integration")),
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" }, integrations.map(function (integration) { return (react_1["default"].createElement("div", { key: integration.id, onClick: function () { return setSelectedIntegration(integration.id); }, className: "p-4 border rounded-lg cursor-pointer transition " + (selectedIntegration === integration.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200') },
            react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                react_1["default"].createElement("div", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement("span", { className: "text-3xl" }, integration.icon),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "font-semibold" }, integration.name),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-600" }, integration.category))),
                integration.status === 'connected' ? (react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "w-5 h-5 text-green-500" })) : (react_1["default"].createElement(lucide_react_1.Circle, { className: "w-5 h-5 text-gray-300" }))),
            react_1["default"].createElement("p", { className: "text-sm text-gray-600 mb-3" }, integration.description),
            integration.metrics && (react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-2 mb-3" }, Object.entries(integration.metrics).map(function (_a) {
                var key = _a[0], value = _a[1];
                return (react_1["default"].createElement("div", { key: key, className: "bg-gray-50 p-2 rounded text-center" },
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, key.replace(/([A-Z])/g, ' $1')),
                    react_1["default"].createElement("div", { className: "font-semibold text-sm" }, value)));
            }))),
            react_1["default"].createElement("button", { className: "w-full py-2 rounded text-sm font-medium transition " + (integration.status === 'connected'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700') }, integration.status === 'connected' ? 'Manage' : 'Connect'))); })),
        selectedIntegration && (react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, (_a = integrations.find(function (i) { return i.id === selectedIntegration; })) === null || _a === void 0 ? void 0 :
                _a.name,
                " Configuration"),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "API Key"),
                    react_1["default"].createElement("input", { type: "password", placeholder: "pk_live_abc123...", className: "w-full px-3 py-2 border rounded-lg" })),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Webhook URL"),
                    react_1["default"].createElement("input", { type: "text", value: "https://example.com/webhooks/stripe", readOnly: true, className: "w-full px-3 py-2 border rounded-lg bg-gray-50" })),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    react_1["default"].createElement("button", { className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" }, "Test Connection"),
                    react_1["default"].createElement("button", { className: "px-4 py-2 border rounded-lg hover:bg-gray-50" }, "View Logs"))))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Integration Health"),
            react_1["default"].createElement("div", { className: "space-y-3" }, [
                { name: 'Stripe Webhooks', status: 'healthy', uptime: '99.98%' },
                { name: 'M-Pesa API', status: 'healthy', uptime: '99.8%' },
                { name: 'Google OAuth', status: 'healthy', uptime: '100%' },
            ].map(function (service, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center justify-between p-3 border rounded" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "font-medium" }, service.name),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
                        "Uptime: ",
                        service.uptime)),
                react_1["default"].createElement("span", { className: "inline-block w-3 h-3 bg-green-500 rounded-full" }))); })))));
}
exports["default"] = ThirdPartyIntegrations;
