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
function EnterpriseSettings() {
    var organization = react_1.useState({
        name: 'Meli-Tech CRM',
        industry: 'SaaS',
        employees: 145,
        plan: 'enterprise',
        status: 'active',
        createdDate: '2025-06-15'
    })[0];
    var _a = react_1.useState({
        autoBackup: true,
        dataEncryption: true,
        auditLogging: true,
        apiAccess: true,
        ssoEnabled: true,
        customBranding: true
    }), settings = _a[0], setSettings = _a[1];
    var toggleSetting = function (key) {
        setSettings(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = !prev[key], _a)));
        });
    };
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Enterprise Settings"),
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-6" },
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Building2, { className: "w-5 h-5" }),
                    " Organization Profile"),
                react_1["default"].createElement("div", { className: "space-y-3" }, Object.entries(organization).map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return (react_1["default"].createElement("div", { key: key, className: "pb-2 border-b" },
                        react_1["default"].createElement("div", { className: "text-xs text-gray-600 uppercase" }, key.replace(/([A-Z])/g, ' $1')),
                        react_1["default"].createElement("div", { className: "text-sm font-medium mt-1" }, String(value))));
                }))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.CreditCard, { className: "w-5 h-5" }),
                    " Billing Information"),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "pb-2 border-b" },
                        react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "Monthly Cost"),
                        react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "$2,999")),
                    react_1["default"].createElement("div", { className: "pb-2 border-b" },
                        react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "Billing Cycle"),
                        react_1["default"].createElement("div", { className: "text-sm font-medium" }, "2026-03-01 to 2026-03-31")),
                    react_1["default"].createElement("div", { className: "pb-2 border-b" },
                        react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "Renewal Date"),
                        react_1["default"].createElement("div", { className: "text-sm font-medium" }, "2026-04-01")),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "Payment Method"),
                        react_1["default"].createElement("div", { className: "text-sm font-medium" }, "Visa ending in 4242"))))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Feature Configuration"),
            react_1["default"].createElement("div", { className: "space-y-3" }, Object.entries(settings).map(function (_a) {
                var key = _a[0], enabled = _a[1];
                return (react_1["default"].createElement("div", { key: key, className: "flex items-center justify-between p-3 border rounded" },
                    react_1["default"].createElement("span", { className: "font-medium capitalize" }, key.replace(/([A-Z])/g, ' $1')),
                    react_1["default"].createElement("button", { onClick: function () { return toggleSetting(key); }, className: "px-3 py-1 rounded text-sm font-medium transition " + (enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800') }, enabled ? '✓ Enabled' : '✗ Disabled')));
            }))),
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Users, { className: "w-5 h-5" }),
                    " User Management"),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", null, "Total Users"),
                        react_1["default"].createElement("span", { className: "font-bold" }, "145")),
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", null, "Active Users"),
                        react_1["default"].createElement("span", { className: "font-bold text-green-600" }, "142")),
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", null, "Admin Count"),
                        react_1["default"].createElement("span", { className: "font-bold" }, "3")),
                    react_1["default"].createElement("div", { className: "flex justify-between" },
                        react_1["default"].createElement("span", null, "Capacity"),
                        react_1["default"].createElement("span", { className: "font-bold text-yellow-600" }, "145/500")))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Globe, { className: "w-5 h-5" }),
                    " Integration Status"),
                react_1["default"].createElement("div", { className: "space-y-2" }, ['Stripe', 'M-Pesa', 'Google OAuth', 'Slack'].map(function (service) { return (react_1["default"].createElement("div", { key: service, className: "flex justify-between items-center" },
                    react_1["default"].createElement("span", null, service),
                    react_1["default"].createElement("span", { className: "w-2 h-2 rounded-full " + (service === 'Slack' ? 'bg-gray-400' : 'bg-green-500') }))); })))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Compliance & Security"),
            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" }, [
                { name: 'GDPR Compliance', status: 'Compliant' },
                { name: 'SOC 2 Type II', status: 'Certified' },
                { name: 'Data Encrypted', status: 'AES-256' },
                { name: 'Backups', status: 'Daily' },
                { name: 'Uptime SLA', status: '99.9%' },
                { name: 'Support Tier', status: '24/7' },
            ].map(function (item) { return (react_1["default"].createElement("div", { key: item.name, className: "p-3 border rounded" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, item.name),
                react_1["default"].createElement("div", { className: "font-semibold text-green-600" }, item.status))); })))));
}
exports["default"] = EnterpriseSettings;
