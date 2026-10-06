"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function SSO() {
    var ssoProviders = react_1.useState([
        {
            id: 'okta',
            name: 'Okta',
            status: 'configured',
            users: 142,
            lastSync: '2026-03-16 14:32',
            icon: '🔐'
        },
        {
            id: 'azure',
            name: 'Azure AD',
            status: 'available',
            users: 0,
            lastSync: null,
            icon: '☁️'
        },
        {
            id: 'auth0',
            name: 'Auth0',
            status: 'available',
            users: 0,
            lastSync: null,
            icon: '🔑'
        },
    ])[0];
    var _a = react_1.useState([
        {
            id: 'key_001',
            name: 'Production',
            key: 'pk_live_••••••••••••••',
            created: '2025-12-01',
            lastUsed: '2026-03-16 14:30',
            status: 'active'
        },
        {
            id: 'key_002',
            name: 'Staging',
            key: 'pk_staging_•••••••••••',
            created: '2026-01-15',
            lastUsed: '2026-03-16 10:15',
            status: 'active'
        },
    ]), apiKeys = _a[0], setApiKeys = _a[1];
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "SSO & API Keys"),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2" },
                react_1["default"].createElement(lucide_react_1.Shield, { className: "w-5 h-5" }),
                " Single Sign-On Configuration"),
            react_1["default"].createElement("div", { className: "space-y-3" }, ssoProviders.map(function (provider) { return (react_1["default"].createElement("div", { key: provider.id, className: "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition" },
                react_1["default"].createElement("div", { className: "flex items-center gap-3 flex-1" },
                    react_1["default"].createElement("span", { className: "text-2xl" }, provider.icon),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "font-semibold" }, provider.name),
                        provider.status === 'configured' ? (react_1["default"].createElement("p", { className: "text-xs text-green-600" },
                            provider.users,
                            " users synced \u2022 Last: ",
                            provider.lastSync)) : (react_1["default"].createElement("p", { className: "text-xs text-gray-600" }, "Not configured")))),
                react_1["default"].createElement("button", { className: "px-4 py-2 rounded-lg font-medium transition " + (provider.status === 'configured'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700') }, provider.status === 'configured' ? 'Manage' : 'Setup'))); }))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2" },
                react_1["default"].createElement(lucide_react_1.Key, { className: "w-5 h-5" }),
                " API Keys"),
            react_1["default"].createElement("div", { className: "space-y-3" }, apiKeys.map(function (key) { return (react_1["default"].createElement("div", { key: key.id, className: "p-4 border rounded-lg" },
                react_1["default"].createElement("div", { className: "flex items-start justify-between mb-2" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "font-semibold" }, key.name),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-600 font-mono mt-1" }, key.key)),
                    react_1["default"].createElement("span", { className: "inline-block w-2 h-2 " + (key.status === 'active' ? 'bg-green-500' : 'bg-gray-400') + " rounded-full" })),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-2 text-xs text-gray-600" },
                    react_1["default"].createElement("div", null,
                        "Created: ",
                        key.created),
                    react_1["default"].createElement("div", null,
                        "Last used: ",
                        key.lastUsed)),
                react_1["default"].createElement("div", { className: "mt-2 flex gap-1" },
                    react_1["default"].createElement("button", { className: "px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded" }, "Copy"),
                    react_1["default"].createElement("button", { className: "px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded" }, "Rotate"),
                    react_1["default"].createElement("button", { className: "px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded" }, "Revoke")))); })),
            react_1["default"].createElement("button", { className: "w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600 font-medium transition" }, "+ Generate New Key")),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2" },
                react_1["default"].createElement(lucide_react_1.Lock, { className: "w-5 h-5" }),
                " Security Settings"),
            react_1["default"].createElement("div", { className: "space-y-3" }, [
                {
                    name: 'IP Whitelisting',
                    description: 'Restrict API access by IP address',
                    enabled: true
                },
                {
                    name: 'JWT Token Expiry',
                    description: 'Tokens expire after 24 hours',
                    enabled: true
                },
                {
                    name: 'Require 2FA for SSO',
                    description: 'Enforce two-factor authentication',
                    enabled: false
                },
                {
                    name: 'API Rate Limiting',
                    description: '10,000 requests per minute',
                    enabled: true
                },
            ].map(function (setting) { return (react_1["default"].createElement("div", { key: setting.name, className: "flex items-start gap-3 p-3 border rounded" },
                react_1["default"].createElement("input", { type: "checkbox", checked: setting.enabled, readOnly: true, className: "mt-1" }),
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("div", { className: "font-medium" }, setting.name),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, setting.description)))); }))),
        react_1["default"].createElement("div", { className: "bg-blue-50 p-4 rounded-lg border border-blue-200" },
            react_1["default"].createElement("div", { className: "flex gap-3" },
                react_1["default"].createElement(lucide_react_1.Shield, { className: "w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" }),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "font-semibold text-blue-900" }, "Security Best Practices"),
                    react_1["default"].createElement("div", { className: "text-xs text-blue-800 mt-1" }, "Keep your API keys secure. Never share them publicly. Rotate keys periodically."))))));
}
exports["default"] = SSO;
