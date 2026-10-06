"use strict";
/**
 * Notification Center Page
 *
 * Comprehensive notification management with:
 * - Real-time notification list with filtering
 * - Notification preferences configuration
 * - Read status management
 * - Notification statistics and trends
 * - Multi-channel delivery settings
 */
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
// Notification Item Component
var NotificationItem = function (_a) {
    var notification = _a.notification, onRead = _a.onRead, onDelete = _a.onDelete;
    var priorityColor = {
        high: 'border-red-300 bg-red-50',
        medium: 'border-yellow-300 bg-yellow-50',
        low: 'border-gray-300 bg-gray-50'
    }[notification.priority] || 'border-gray-300 bg-gray-50';
    var categoryIcon = {
        finance: '💰',
        sales: '📊',
        hr: '👥',
        operations: '⚙️',
        system: '🔧',
        reports: '📈'
    }[notification.category] || '📌';
    return (react_1["default"].createElement("div", { className: "flex gap-4 bg-white p-4 rounded-lg border border-gray-200" },
        react_1["default"].createElement("div", { className: "text-2xl" }, categoryIcon),
        react_1["default"].createElement("div", { className: "flex-1" },
            react_1["default"].createElement("div", { className: "flex items-start justify-between gap-2" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h3", { className: "font-semibold text-gray-900" }, notification.title),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-600 mt-1" }, notification.message)),
                react_1["default"].createElement("span", { className: "text-xs font-medium px-2 py-1 rounded " + (notification.read ? 'bg-gray-200 text-gray-700' : 'bg-blue-200 text-blue-700') }, notification.read ? 'Read' : 'Unread')),
            notification.actionUrl && (react_1["default"].createElement("div", { className: "mt-3 flex gap-2 items-center" },
                react_1["default"].createElement("a", { href: notification.actionUrl, className: "text-sm text-blue-600 hover:text-blue-700 font-medium" },
                    notification.actionLabel || 'View',
                    " \u2192"))),
            react_1["default"].createElement("div", { className: "mt-2 flex items-center gap-4 text-xs text-gray-500" },
                react_1["default"].createElement("span", { className: "flex items-center gap-1" },
                    react_1["default"].createElement(lucide_react_1.Clock, { className: "w-3 h-3" }),
                    new Date(notification.timestamp).toLocaleString()),
                react_1["default"].createElement("span", { className: "px-2 py-1 bg-gray-200 rounded text-gray-700" }, notification.category))),
        react_1["default"].createElement("div", { className: "flex gap-2" },
            react_1["default"].createElement("button", { onClick: function () { return onRead(notification.id); }, className: "p-2 hover:bg-gray-300 rounded transition-colors", title: notification.read ? 'Mark unread' : 'Mark read' }, notification.read ? (react_1["default"].createElement(lucide_react_1.EyeOff, { className: "w-4 h-4 text-gray-600" })) : (react_1["default"].createElement(lucide_react_1.Eye, { className: "w-4 h-4 text-blue-600" }))),
            react_1["default"].createElement("button", { onClick: function () { return onDelete(notification.id); }, className: "p-2 hover:bg-red-100 rounded transition-colors", title: "Delete notification" },
                react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4 text-red-600" })))));
};
// Preferences Panel Component
var PreferencesPanel = function (_a) {
    var preferences = _a.preferences, onUpdate = _a.onUpdate;
    var _b = react_1.useState(preferences.channels || {}), channels = _b[0], setChannels = _b[1];
    var _c = react_1.useState(preferences.quietHours || {}), quietHours = _c[0], setQuietHours = _c[1];
    var handleChannelChange = function (channel) {
        var _a;
        var updated = __assign(__assign({}, channels), (_a = {}, _a[channel] = !channels[channel], _a));
        setChannels(updated);
        onUpdate({ channels: updated });
    };
    var handleQuietHoursChange = function (field, value) {
        var _a;
        var updated = __assign(__assign({}, quietHours), (_a = {}, _a[field] = value, _a));
        setQuietHours(updated);
        onUpdate({ quietHours: updated });
    };
    return (react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200 space-y-6" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2" },
                react_1["default"].createElement(lucide_react_1.Mail, { className: "w-5 h-5" }),
                "Notification Channels"),
            react_1["default"].createElement("div", { className: "space-y-3" }, Object.entries(channels).map(function (_a) {
                var channel = _a[0], enabled = _a[1];
                return (react_1["default"].createElement("label", { key: channel, className: "flex items-center gap-3 cursor-pointer" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: enabled, onChange: function () { return handleChannelChange(channel); }, className: "w-4 h-4 rounded border-gray-300" }),
                    react_1["default"].createElement("span", { className: "text-gray-700 capitalize" }, channel)));
            }))),
        react_1["default"].createElement("hr", { className: "border-gray-200" }),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2" },
                react_1["default"].createElement(lucide_react_1.Clock, { className: "w-5 h-5" }),
                "Quiet Hours"),
            react_1["default"].createElement("label", { className: "flex items-center gap-3 cursor-pointer mb-4" },
                react_1["default"].createElement("input", { type: "checkbox", checked: quietHours.enabled || false, onChange: function (e) { return handleQuietHoursChange('enabled', e.target.checked); }, className: "w-4 h-4 rounded border-gray-300" }),
                react_1["default"].createElement("span", { className: "text-gray-700" }, "Enable quiet hours")),
            quietHours.enabled && (react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Start Time"),
                    react_1["default"].createElement("input", { type: "time", value: quietHours.start || '18:00', onChange: function (e) { return handleQuietHoursChange('start', e.target.value); }, className: "px-3 py-2 w-full border border-gray-300 rounded-lg" })),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "End Time"),
                    react_1["default"].createElement("input", { type: "time", value: quietHours.end || '08:00', onChange: function (e) { return handleQuietHoursChange('end', e.target.value); }, className: "px-3 py-2 w-full border border-gray-300 rounded-lg" })))))));
};
// Statistics Component
var NotificationStats = function (_a) {
    var _b, _c, _d;
    var stats = _a.stats;
    return (react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" },
        react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Total Notifications"),
            react_1["default"].createElement("div", { className: "text-3xl font-bold text-gray-900" }, ((_b = stats.summary) === null || _b === void 0 ? void 0 : _b.totalNotifications) || 0),
            react_1["default"].createElement("div", { className: "text-xs text-gray-500 mt-2" }, "All time")),
        react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Unread"),
            react_1["default"].createElement("div", { className: "text-3xl font-bold text-blue-600" }, ((_c = stats.summary) === null || _c === void 0 ? void 0 : _c.unreadCount) || 0),
            react_1["default"].createElement("div", { className: "text-xs text-gray-500 mt-2" }, "Awaiting your attention")),
        react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Read"),
            react_1["default"].createElement("div", { className: "text-3xl font-bold text-green-600" }, ((_d = stats.summary) === null || _d === void 0 ? void 0 : _d.readCount) || 0),
            react_1["default"].createElement("div", { className: "text-xs text-gray-500 mt-2" }, "Already reviewed")),
        react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Engagement Rate"),
            react_1["default"].createElement("div", { className: "text-3xl font-bold text-purple-600" },
                ((stats.engagementRate || 0) * 100).toFixed(0),
                "%"),
            react_1["default"].createElement("div", { className: "text-xs text-gray-500 mt-2" }, "Per day average"))));
};
// Main Notification Center Page
function NotificationCenterPage() {
    var _this = this;
    var _a;
    var _b = react_1.useState('notifications'), activeTab = _b[0], setActiveTab = _b[1];
    var _c = react_1.useState('all'), filterType = _c[0], setFilterType = _c[1];
    var _d = react_1.useState(null), selectedCategory = _d[0], setSelectedCategory = _d[1];
    var _e = react_1.useState(''), searchQuery = _e[0], setSearchQuery = _e[1];
    var _f = react_1.useState(false), refreshing = _f[0], setRefreshing = _f[1];
    // Queries
    var notificationsQuery = trpc_1.trpc.notifications.list.useQuery({
        limit: 50,
        offset: 0,
        unreadOnly: filterType === 'unread',
        category: selectedCategory || undefined
    });
    var preferencesQuery = trpc_1.trpc.notifications.getPreferences.useQuery({});
    var statsQuery = trpc_1.trpc.notifications.getStats.useQuery({});
    // Mutations
    var markAsReadMutation = trpc_1.trpc.notifications.markAsRead.useMutation();
    var deleteNotificationMutation = trpc_1.trpc.notifications["delete"].useMutation();
    var updatePreferencesMutation = trpc_1.trpc.notifications.updatePreferences.useMutation();
    var markAllAsReadMutation = trpc_1.trpc.notifications.markAllAsRead.useMutation();
    var handleMarkAsRead = function (notificationId) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, markAsReadMutation.mutateAsync({ notificationId: notificationId })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, notificationsQuery.refetch()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, statsQuery.refetch()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error marking notification as read:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (notificationId) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, deleteNotificationMutation.mutateAsync({ notificationId: notificationId })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, notificationsQuery.refetch()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, statsQuery.refetch()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error deleting notification:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdatePreferences = function (prefs) { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, updatePreferencesMutation.mutateAsync(prefs)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error updating preferences:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleMarkAllAsRead = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, markAllAsReadMutation.mutateAsync({})];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, notificationsQuery.refetch()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, statsQuery.refetch()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    console.error('Error marking all as read:', error_4);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setRefreshing(true);
                    return [4 /*yield*/, Promise.all([
                            notificationsQuery.refetch(),
                            statsQuery.refetch(),
                        ])];
                case 1:
                    _a.sent();
                    setRefreshing(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var filteredNotifications = (((_a = notificationsQuery.data) === null || _a === void 0 ? void 0 : _a.notifications) || []).filter(function (n) {
        return searchQuery === '' || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.message.toLowerCase().includes(searchQuery.toLowerCase());
    });
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Notification Center", icon: react_1["default"].createElement(lucide_react_1.Bell, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm/dashboard" }, { label: "Notification Center" }] },
        react_1["default"].createElement("div", { className: "flex justify-between items-start mb-8" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("h1", { className: "text-4xl font-bold text-gray-900 flex items-center gap-3" },
                    react_1["default"].createElement(lucide_react_1.Bell, { className: "w-10 h-10 text-blue-600" }),
                    "Notification Center"),
                react_1["default"].createElement("p", { className: "text-gray-600 mt-1" }, "Manage your notifications and preferences")),
            react_1["default"].createElement("div", { className: "flex gap-2" },
                react_1["default"].createElement("button", { onClick: handleRefresh, disabled: refreshing, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" },
                    refreshing ? '⟳' : '↻',
                    " Refresh"),
                filterType !== 'read' && (react_1["default"].createElement("button", { onClick: handleMarkAllAsRead, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" },
                    react_1["default"].createElement(lucide_react_1.Check, { className: "w-4 h-4" }),
                    "Mark All Read")))),
        activeTab === 'notifications' && statsQuery.isSuccess && (react_1["default"].createElement(NotificationStats, { stats: statsQuery.data })),
        react_1["default"].createElement("div", { className: "flex gap-4 mb-6 border-b border-gray-200 bg-white p-4 rounded-t-lg" }, ['notifications', 'preferences', 'stats'].map(function (tab) { return (react_1["default"].createElement("button", { key: tab, onClick: function () { return setActiveTab(tab); }, className: "px-4 py-2 font-medium border-b-2 transition-colors " + (activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900') },
            tab === 'notifications' && 'Notifications',
            tab === 'preferences' && 'Preferences',
            tab === 'stats' && 'Statistics')); })),
        activeTab === 'notifications' && (react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200 space-y-4" },
                react_1["default"].createElement("div", { className: "relative" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-3 w-4 h-4 text-gray-400" }),
                    react_1["default"].createElement("input", { type: "text", placeholder: "Search notifications...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" })),
                react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, ['all', 'unread', 'read'].map(function (type) { return (react_1["default"].createElement("button", { key: type, onClick: function () { return setFilterType(type); }, className: "px-4 py-2 rounded-lg transition-colors " + (filterType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300') },
                    type === 'all' && 'All Notifications',
                    type === 'unread' && '🔔 Unread',
                    type === 'read' && '✓ Read')); })),
                react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, ['finance', 'sales', 'hr', 'operations', 'system', 'reports'].map(function (cat) { return (react_1["default"].createElement("button", { key: cat, onClick: function () { return setSelectedCategory(selectedCategory === cat ? null : cat); }, className: "px-3 py-1 text-sm rounded-full transition-colors " + (selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300') }, cat.charAt(0).toUpperCase() + cat.slice(1))); }))),
            notificationsQuery.isLoading ? (react_1["default"].createElement("div", { className: "bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-600" }, "Loading notifications...")) : filteredNotifications.length === 0 ? (react_1["default"].createElement("div", { className: "bg-white p-8 rounded-lg border border-gray-200 text-center" },
                react_1["default"].createElement(lucide_react_1.Bell, { className: "w-12 h-12 text-gray-300 mx-auto mb-4" }),
                react_1["default"].createElement("p", { className: "text-gray-600" }, "No notifications to display"))) : (react_1["default"].createElement("div", { className: "space-y-3" }, filteredNotifications.map(function (notification) { return (react_1["default"].createElement(NotificationItem, { key: notification.id, notification: notification, onRead: handleMarkAsRead, onDelete: handleDelete })); }))))),
        activeTab === 'preferences' && preferencesQuery.isSuccess && (react_1["default"].createElement(PreferencesPanel, { preferences: preferencesQuery.data, onUpdate: handleUpdatePreferences })),
        activeTab === 'stats' && statsQuery.isSuccess && (react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4" }, "By Category"),
                    react_1["default"].createElement("div", { className: "space-y-2" }, Object.entries(statsQuery.data.byCategory || {}).map(function (_a) {
                        var cat = _a[0], count = _a[1];
                        return (react_1["default"].createElement("div", { key: cat, className: "flex justify-between items-center" },
                            react_1["default"].createElement("span", { className: "text-gray-700 capitalize" }, cat),
                            react_1["default"].createElement("span", { className: "font-semibold text-blue-600" }, count)));
                    }))),
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4" }, "By Priority"),
                    react_1["default"].createElement("div", { className: "space-y-2" }, Object.entries(statsQuery.data.byPriority || {}).map(function (_a) {
                        var priority = _a[0], count = _a[1];
                        return (react_1["default"].createElement("div", { key: priority, className: "flex justify-between items-center" },
                            react_1["default"].createElement("span", { className: "text-gray-700 capitalize" }, priority),
                            react_1["default"].createElement("span", { className: "font-semibold text-red-600" }, count)));
                    }))),
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4" }, "Engagement"),
                    react_1["default"].createElement("div", { className: "space-y-3" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Daily Average"),
                            react_1["default"].createElement("div", { className: "text-2xl font-bold text-gray-900" }, statsQuery.data.averageNotificationsPerDay)),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Most Active"),
                            react_1["default"].createElement("div", { className: "text-lg font-semibold text-blue-600 capitalize" }, statsQuery.data.mostActiveCategory))))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200" },
                react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5 text-blue-600" }),
                    "7-Day Trend"),
                react_1["default"].createElement("div", { className: "space-y-2" }, (statsQuery.data.trend || []).map(function (day, idx) { return (react_1["default"].createElement("div", { key: idx, className: "flex items-center justify-between" },
                    react_1["default"].createElement("span", { className: "text-sm text-gray-600" }, day.date),
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 flex-1 ml-4" },
                        react_1["default"].createElement("div", { className: "h-6 bg-blue-200 rounded", style: { width: (day.count / 30) * 100 + "%" } }),
                        react_1["default"].createElement("span", { className: "text-sm font-medium text-gray-700 w-16 text-right" },
                            day.count,
                            " sent")))); })))))));
}
exports["default"] = NotificationCenterPage;
