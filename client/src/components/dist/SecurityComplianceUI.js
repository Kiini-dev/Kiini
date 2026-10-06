"use strict";
exports.__esModule = true;
exports.SecurityComplianceUI = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
/**
 * Security & Compliance Dashboard
 * Audit logs, compliance checklists, security settings
 */
function SecurityComplianceUI() {
    var _a = react_1.useState('audit'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = react_1.useState('all'), filterSeverity = _b[0], setFilterSeverity = _b[1];
    var auditLogs = [
        {
            id: '1',
            action: 'User Login',
            user: 'john@example.com',
            timestamp: new Date('2026-03-24T14:30:00'),
            status: 'success',
            details: 'Successful login from Nairobi, Kenya',
            ipAddress: '196.3.97.45'
        },
        {
            id: '2',
            action: 'Invoice Generated',
            user: 'jane@example.com',
            timestamp: new Date('2026-03-24T13:15:00'),
            status: 'success',
            details: 'Auto-generated renewal invoice for Org-123',
            ipAddress: '196.3.97.46'
        },
        {
            id: '3',
            action: 'Failed Login Attempt',
            user: 'unknown',
            timestamp: new Date('2026-03-24T12:50:00'),
            status: 'warning',
            details: '3 failed attempts from new IP address',
            ipAddress: '185.220.101.45'
        },
        {
            id: '4',
            action: 'Permission Changed',
            user: 'admin@example.com',
            timestamp: new Date('2026-03-24T11:20:00'),
            status: 'success',
            details: 'Revoked billing:edit permission from user david@org.com',
            ipAddress: '196.3.97.47'
        },
        {
            id: '5',
            action: 'Data Export',
            user: 'manager@example.com',
            timestamp: new Date('2026-03-24T10:15:00'),
            status: 'error',
            details: 'Unauthorized export attempt blocked',
            ipAddress: '196.3.97.48'
        },
    ];
    var complianceItems = [
        {
            id: '1',
            title: 'Data Retention Policy',
            description: 'Implement 7-year data retention policy per tax requirements',
            status: 'completed',
            dueDate: new Date('2026-03-31'),
            responsible: 'John Doe',
            evidenceFile: 'policy_v2_signed.pdf'
        },
        {
            id: '2',
            title: 'GDPR Compliance',
            description: 'Implement privacy policies and data subject request handlers',
            status: 'in-progress',
            dueDate: new Date('2026-04-30'),
            responsible: 'Jane Smith'
        },
        {
            id: '3',
            title: 'ISO 27001 Audit',
            description: 'Complete annual information security audit',
            status: 'pending',
            dueDate: new Date('2026-06-30'),
            responsible: 'Security Team'
        },
        {
            id: '4',
            title: 'Access Control Review',
            description: 'Quarterly review of user access permissions',
            status: 'in-progress',
            dueDate: new Date('2026-03-31'),
            responsible: 'Admin Team'
        },
        {
            id: '5',
            title: 'Incident Response Plan',
            description: 'Document and test incident response procedures',
            status: 'at-risk',
            dueDate: new Date('2026-03-28'),
            responsible: 'Compliance Officer'
        },
    ];
    var securitySettings = [
        {
            icon: lucide_react_1.Lock,
            title: 'Multi-Factor Authentication',
            description: 'Enforce 2FA for all users',
            enabled: true,
            detail: '87% of users have 2FA enabled'
        },
        {
            icon: lucide_react_1.Key,
            title: 'API Keys',
            description: 'Manage organization API keys',
            enabled: true,
            detail: '12 active keys, 2 inactive'
        },
        {
            icon: lucide_react_1.Clock,
            title: 'Session Timeout',
            description: 'Auto-logout after 30 minutes of inactivity',
            enabled: true,
            detail: '30 minutes'
        },
        {
            icon: lucide_react_1.Users,
            title: 'IP Whitelist',
            description: 'Restrict access by IP address range',
            enabled: false,
            detail: 'Not configured'
        },
    ];
    var filteredLogs = auditLogs.filter(function (log) { return filterSeverity === 'all' || log.status === filterSeverity; });
    var getStatusIcon = function (status) {
        switch (status) {
            case 'success':
                return react_1["default"].createElement(lucide_react_1.CheckCircle, { size: 20, className: "text-green-500" });
            case 'warning':
                return react_1["default"].createElement(lucide_react_1.AlertCircle, { size: 20, className: "text-yellow-500" });
            case 'error':
                return react_1["default"].createElement(lucide_react_1.AlertCircle, { size: 20, className: "text-red-500" });
            default:
                return react_1["default"].createElement(lucide_react_1.Activity, { size: 20, className: "text-gray-500" });
        }
    };
    var getComplianceStatusColor = function (status) {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'at-risk':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            default:
                return '';
        }
    };
    return (react_1["default"].createElement("div", { className: "h-full flex flex-col bg-white" },
        react_1["default"].createElement("div", { className: "border-b p-6" },
            react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                react_1["default"].createElement(lucide_react_1.Shield, { className: "text-blue-500", size: 32 }),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "Security & Compliance"),
                    react_1["default"].createElement("p", { className: "text-gray-600" }, "Monitor audit logs, compliance status, and security settings")))),
        react_1["default"].createElement("div", { className: "border-b flex" }, ['audit', 'compliance', 'security'].map(function (tab) { return (react_1["default"].createElement("button", { key: tab, onClick: function () { return setActiveTab(tab); }, className: "px-6 py-4 font-semibold border-b-2 transition capitalize " + (activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900') }, tab)); })),
        react_1["default"].createElement("div", { className: "flex-1 overflow-y-auto p-6" },
            activeTab === 'audit' && (react_1["default"].createElement("div", null,
                react_1["default"].createElement("div", { className: "flex gap-4 mb-6" }, ['all', 'success', 'warning', 'error'].map(function (severity) { return (react_1["default"].createElement("button", { key: severity, onClick: function () { return setFilterSeverity(severity); }, className: "px-4 py-2 rounded-lg font-semibold capitalize transition " + (filterSeverity === severity
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200') }, severity)); })),
                react_1["default"].createElement("div", { className: "space-y-3" }, filteredLogs.map(function (log) { return (react_1["default"].createElement("div", { key: log.id, className: "border rounded-lg p-4 hover:bg-gray-50 transition" },
                    react_1["default"].createElement("div", { className: "flex items-start gap-4" },
                        getStatusIcon(log.status),
                        react_1["default"].createElement("div", { className: "flex-1" },
                            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                react_1["default"].createElement("h3", { className: "font-semibold text-gray-900" }, log.action),
                                react_1["default"].createElement("span", { className: "text-sm text-gray-500" }, log.timestamp.toLocaleString())),
                            react_1["default"].createElement("p", { className: "text-gray-600 mt-1" }, log.details),
                            react_1["default"].createElement("div", { className: "flex gap-4 mt-2 text-sm text-gray-500" },
                                react_1["default"].createElement("span", null,
                                    "User: ",
                                    log.user),
                                react_1["default"].createElement("span", null,
                                    "IP: ",
                                    log.ipAddress)))))); })))),
            activeTab === 'compliance' && (react_1["default"].createElement("div", null,
                react_1["default"].createElement("div", { className: "mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" },
                    react_1["default"].createElement("p", { className: "text-sm text-blue-800" },
                        "Compliance Score: ",
                        react_1["default"].createElement("strong", null, "78/100"),
                        " \u2022 Next Audit: June 30, 2026")),
                react_1["default"].createElement("div", { className: "space-y-4" }, complianceItems.map(function (item) { return (react_1["default"].createElement("div", { key: item.id, className: "border rounded-lg p-4" },
                    react_1["default"].createElement("div", { className: "flex items-start justify-between" },
                        react_1["default"].createElement("div", { className: "flex-1" },
                            react_1["default"].createElement("h3", { className: "font-semibold text-gray-900" }, item.title),
                            react_1["default"].createElement("p", { className: "text-gray-600 text-sm mt-1" }, item.description),
                            react_1["default"].createElement("div", { className: "flex gap-4 mt-3 text-sm text-gray-500" },
                                react_1["default"].createElement("span", null,
                                    "Responsible: ",
                                    item.responsible),
                                react_1["default"].createElement("span", null,
                                    "Due: ",
                                    item.dueDate.toLocaleDateString()))),
                        react_1["default"].createElement("div", { className: "flex flex-col items-end gap-2" },
                            react_1["default"].createElement("span", { className: "px-3 py-1 rounded-full text-sm font-semibold " + getComplianceStatusColor(item.status) }, item.status),
                            item.evidenceFile && (react_1["default"].createElement("span", { className: "text-xs text-blue-500 cursor-pointer hover:underline" }, item.evidenceFile)))))); })))),
            activeTab === 'security' && (react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, securitySettings.map(function (setting, idx) {
                var Icon = setting.icon;
                return (react_1["default"].createElement("div", { key: idx, className: "border rounded-lg p-6" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                        react_1["default"].createElement(Icon, { size: 24, className: "text-gray-400" }),
                        react_1["default"].createElement("div", { className: "px-3 py-1 rounded-full text-sm font-semibold " + (setting.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700') }, setting.enabled ? 'Enabled' : 'Disabled')),
                    react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-1" }, setting.title),
                    react_1["default"].createElement("p", { className: "text-gray-600 text-sm mb-2" }, setting.description),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, setting.detail),
                    react_1["default"].createElement("button", { className: "mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold" }, "Configure")));
            }))))));
}
exports.SecurityComplianceUI = SecurityComplianceUI;
