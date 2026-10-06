"use strict";
exports.__esModule = true;
exports.ApprovalDashboard = void 0;
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var getStatusIcon = function (status) {
    switch (status) {
        case 'approved':
            return react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-green-600" });
        case 'rejected':
            return react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-4 w-4 text-red-600" });
        case 'escalated':
            return react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-orange-600" });
        default:
            return react_1["default"].createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-blue-600" });
    }
};
var getStatusBadge = function (status) {
    var variants = {
        pending: 'bg-blue-100 text-blue-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        partial: 'bg-yellow-100 text-yellow-800',
        escalated: 'bg-orange-100 text-orange-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
};
var formatDate = function (date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
exports.ApprovalDashboard = function (_a) {
    var organizationId = _a.organizationId, userId = _a.userId;
    var t = react_i18next_1.useTranslation().t;
    var _b = react_1.useState('pending'), selectedTab = _b[0], setSelectedTab = _b[1];
    // Mock data - replace with API calls
    var pendingRequests = [
        {
            id: '1',
            entityType: 'purchase_order',
            entityId: 'PO-001',
            status: 'pending',
            currentLevel: 1,
            totalLevels: 3,
            amount: 50000,
            requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            requestedBy: 'John Doe',
            reason: 'Office supplies procurement'
        },
    ];
    var historyRequests = [
        {
            id: '2',
            entityType: 'expense_claim',
            entityId: 'EXP-042',
            status: 'approved',
            currentLevel: 3,
            totalLevels: 3,
            amount: 15000,
            requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            requestedBy: 'Jane Smith',
            reason: 'Travel expenses'
        },
    ];
    var requests = selectedTab === 'pending' ? pendingRequests : historyRequests;
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, t('approvals.pending', 'Pending'))),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "text-2xl font-bold" }, pendingRequests.length),
                    react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, t('approvals.awaitingAction', 'awaiting your action')))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, t('approvals.approved', 'Approved'))),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "text-2xl font-bold text-green-600" }, "24"),
                    react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, t('approvals.thisMonth', 'this month')))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, t('approvals.rejected', 'Rejected'))),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "text-2xl font-bold text-red-600" }, "3"),
                    react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, t('approvals.thisMonth', 'this month')))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, t('approvals.avgTime', 'Avg. Time'))),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "2.5d"),
                    react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, t('approvals.toApprove', 'to approve'))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(card_1.CardTitle, null, t('approvals.requests', 'Approval Requests')),
                        react_1["default"].createElement(card_1.CardDescription, null, t('approvals.manageRequests', 'Manage and track approval workflows'))),
                    react_1["default"].createElement("div", { className: "flex gap-2" },
                        react_1["default"].createElement(button_1.Button, { variant: selectedTab === 'pending' ? 'default' : 'outline', onClick: function () { return setSelectedTab('pending'); }, size: "sm" }, t('approvals.pending', 'Pending')),
                        react_1["default"].createElement(button_1.Button, { variant: selectedTab === 'history' ? 'default' : 'outline', onClick: function () { return setSelectedTab('history'); }, size: "sm" }, t('approvals.history', 'History'))))),
            react_1["default"].createElement(card_1.CardContent, null, requests.length === 0 ? (react_1["default"].createElement("div", { className: "text-center py-8 text-gray-500" }, t('approvals.noRequests', 'No requests to display'))) : (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, null, t('common.id', 'ID')),
                            react_1["default"].createElement(table_1.TableHead, null, t('common.type', 'Type')),
                            react_1["default"].createElement(table_1.TableHead, null, t('common.amount', 'Amount')),
                            react_1["default"].createElement(table_1.TableHead, null, t('approvals.status', 'Status')),
                            react_1["default"].createElement(table_1.TableHead, null, t('approvals.progress', 'Progress')),
                            react_1["default"].createElement(table_1.TableHead, null, t('common.requestedBy', 'Requested By')),
                            react_1["default"].createElement(table_1.TableHead, null, t('common.date', 'Date')),
                            react_1["default"].createElement(table_1.TableHead, null, t('common.actions', 'Actions')))),
                    react_1["default"].createElement(table_1.TableBody, null, requests.map(function (request) { return (react_1["default"].createElement(table_1.TableRow, { key: request.id },
                        react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, request.entityId),
                        react_1["default"].createElement(table_1.TableCell, { className: "capitalize" }, request.entityType.replace('_', ' ')),
                        react_1["default"].createElement(table_1.TableCell, null, request.amount
                            ? "KSh " + request.amount.toLocaleString()
                            : '-'),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                getStatusIcon(request.status),
                                react_1["default"].createElement(badge_1.Badge, { className: getStatusBadge(request.status) }, request.status))),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement("div", { className: "w-24 bg-gray-200 rounded-full h-2" },
                                react_1["default"].createElement("div", { className: "bg-blue-600 h-2 rounded-full", style: {
                                        width: (request.currentLevel / request.totalLevels) * 100 + "%"
                                    } })),
                            react_1["default"].createElement("span", { className: "text-xs text-gray-600" },
                                request.currentLevel,
                                "/",
                                request.totalLevels)),
                        react_1["default"].createElement(table_1.TableCell, null, request.requestedBy),
                        react_1["default"].createElement(table_1.TableCell, null, formatDate(request.requestedAt)),
                        react_1["default"].createElement(table_1.TableCell, null,
                            request.status === 'pending' && (react_1["default"].createElement("div", { className: "flex gap-2" },
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm" }, t('common.approve', 'Approve')),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm" }, t('common.reject', 'Reject')))),
                            request.status !== 'pending' && (react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm" }, t('common.view', 'View')))))); })))))))));
};
exports["default"] = exports.ApprovalDashboard;
