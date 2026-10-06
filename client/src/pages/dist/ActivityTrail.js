"use strict";
/**
 * Activity Trail Page
 * Historical activity timeline and change tracking with tRPC integration
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var getActionColor = function (action) {
    var colors = {
        created: 'bg-green-100 text-green-700',
        updated: 'bg-blue-100 text-blue-700',
        deleted: 'bg-red-100 text-red-700',
        approved: 'bg-purple-100 text-purple-700',
        exported: 'bg-orange-100 text-orange-700',
        login: 'bg-cyan-100 text-cyan-700',
        payment_recorded: 'bg-emerald-100 text-emerald-700'
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
};
var getActionIcon = function (action) {
    switch (action) {
        case 'created': return '➕';
        case 'updated': return '✏️';
        case 'deleted': return '🗑️';
        case 'approved': return '✅';
        case 'exported': return '📥';
        case 'login': return '🔐';
        case 'payment_recorded': return '💰';
        default: return '📝';
    }
};
var ActivityTrail = function () {
    var _a, _b, _c, _d, _e, _f;
    var _g = react_1.useState(''), searchQuery = _g[0], setSearchQuery = _g[1];
    var _h = react_1.useState(''), selectedEntityType = _h[0], setSelectedEntityType = _h[1];
    var _j = react_1.useState(''), selectedAction = _j[0], setSelectedAction = _j[1];
    var _k = react_1.useState(1), page = _k[0], setPage = _k[1];
    var activitiesQuery = trpc_1.trpc.activityTrail.list.useQuery({
        page: page,
        limit: 20,
        search: searchQuery || undefined,
        entityType: selectedEntityType || undefined,
        action: selectedAction || undefined
    });
    var statsQuery = trpc_1.trpc.activityTrail.getStats.useQuery({});
    var entityTypesQuery = trpc_1.trpc.activityTrail.getEntityTypes.useQuery({});
    var actionsQuery = trpc_1.trpc.activityTrail.getActions.useQuery({});
    var activities = ((_a = activitiesQuery.data) === null || _a === void 0 ? void 0 : _a.activities) || [];
    var total = ((_b = activitiesQuery.data) === null || _b === void 0 ? void 0 : _b.total) || 0;
    var stats = statsQuery.data;
    var handleExport = function () {
        var csv = __spreadArrays([
            ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Description', 'Status']
        ], activities.map(function (a) { return [
            new Date(a.timestamp || a.createdAt).toISOString(),
            a.userName || 'Unknown',
            a.action,
            a.entityType,
            a.entityId,
            a.description,
            a.status || 'success',
        ]; })).map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(','); })
            .join('\n');
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "activity-trail-" + new Date().toISOString().split('T')[0] + ".csv";
        a.click();
        window.URL.revokeObjectURL(url);
        sonner_1.toast.success('Activity trail exported successfully');
    };
    var handleClearFilters = function () {
        setSearchQuery('');
        setSelectedEntityType('');
        setSelectedAction('');
        setPage(1);
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Activity Trail", description: "Historical activity timeline and change tracking", icon: react_1["default"].createElement(lucide_react_1.History, { className: "h-6 w-6" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Activity Trail" }] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" },
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-blue-600" }, (_c = stats === null || stats === void 0 ? void 0 : stats.totalActivities) !== null && _c !== void 0 ? _c : total),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600 mt-1" }, "Total Activities")),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-green-600" }, (_d = stats === null || stats === void 0 ? void 0 : stats.successCount) !== null && _d !== void 0 ? _d : 0),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600 mt-1" }, "Successful")),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-red-600" }, (_e = stats === null || stats === void 0 ? void 0 : stats.failedCount) !== null && _e !== void 0 ? _e : 0),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600 mt-1" }, "Failed")),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-purple-600" }, (_f = stats === null || stats === void 0 ? void 0 : stats.uniqueUsers) !== null && _f !== void 0 ? _f : 0),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600 mt-1" }, "Unique Users"))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200 mb-6" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Search"),
                        react_1["default"].createElement("div", { className: "relative" },
                            react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" }),
                            react_1["default"].createElement("input", { type: "text", placeholder: "Search activities...", value: searchQuery, onChange: function (e) { setSearchQuery(e.target.value); setPage(1); }, className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Entity Type"),
                        react_1["default"].createElement("select", { value: selectedEntityType, onChange: function (e) { setSelectedEntityType(e.target.value); setPage(1); }, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" },
                            react_1["default"].createElement("option", { value: "" }, "All types"),
                            (entityTypesQuery.data || []).map(function (type) { return (react_1["default"].createElement("option", { key: type, value: type }, type)); }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Action"),
                        react_1["default"].createElement("select", { value: selectedAction, onChange: function (e) { setSelectedAction(e.target.value); setPage(1); }, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm" },
                            react_1["default"].createElement("option", { value: "" }, "All actions"),
                            (actionsQuery.data || []).map(function (action) { return (react_1["default"].createElement("option", { key: action, value: action }, action)); }))),
                    react_1["default"].createElement("div", { className: "flex items-end gap-2" },
                        react_1["default"].createElement("button", { onClick: handleClearFilters, className: "px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors" }, "Clear"),
                        react_1["default"].createElement("button", { onClick: handleExport, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors" },
                            react_1["default"].createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
                            "Export")))),
            react_1["default"].createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
                react_1["default"].createElement("div", { className: "flex justify-between items-center mb-6" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900" },
                        "Activities",
                        react_1["default"].createElement("span", { className: "ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full" }, total))),
                activitiesQuery.isLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-12 text-gray-500" }, "Loading activities...")) : activities.length === 0 ? (react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center py-12 text-gray-400" },
                    react_1["default"].createElement(lucide_react_1.History, { className: "h-12 w-12 mb-3" }),
                    react_1["default"].createElement("p", null, "No activities found"))) : (react_1["default"].createElement("div", { className: "space-y-4" }, activities.map(function (activity) {
                    var _a;
                    return (react_1["default"].createElement("div", { key: activity.id, className: "relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0" },
                        react_1["default"].createElement("div", { className: "absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" }),
                        react_1["default"].createElement("div", { className: "p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors" },
                            react_1["default"].createElement("div", { className: "flex justify-between items-start mb-2" },
                                react_1["default"].createElement("div", { className: "flex-1" },
                                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-2 flex-wrap" },
                                        react_1["default"].createElement("span", { className: "text-lg" }, getActionIcon(activity.action)),
                                        react_1["default"].createElement("span", { className: "text-xs font-medium px-2 py-0.5 rounded " + getActionColor(activity.action) }, (_a = activity.action) === null || _a === void 0 ? void 0 : _a.toUpperCase()),
                                        react_1["default"].createElement("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded" }, activity.entityType),
                                        activity.status === 'failed' && (react_1["default"].createElement("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1" },
                                            react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }),
                                            " FAILED"))),
                                    react_1["default"].createElement("div", { className: "text-sm font-medium text-gray-900" }, activity.description),
                                    react_1["default"].createElement("div", { className: "text-xs text-gray-500 mt-1 flex items-center gap-2" },
                                        react_1["default"].createElement(lucide_react_1.User, { className: "h-3 w-3" }),
                                        activity.userName || 'Unknown User',
                                        activity.duration && (react_1["default"].createElement(react_1["default"].Fragment, null,
                                            react_1["default"].createElement("span", { className: "text-gray-300" }, "\u2022"),
                                            react_1["default"].createElement(lucide_react_1.Clock, { className: "h-3 w-3" }),
                                            react_1["default"].createElement("span", { className: "font-mono" },
                                                activity.duration,
                                                "ms"))))),
                                react_1["default"].createElement("div", { className: "text-right text-xs text-gray-500 ml-4 whitespace-nowrap" },
                                    react_1["default"].createElement("div", null, new Date(activity.timestamp || activity.createdAt).toLocaleTimeString()),
                                    react_1["default"].createElement("div", null, new Date(activity.timestamp || activity.createdAt).toLocaleDateString()))),
                            activity.changes && typeof activity.changes === 'object' && Object.keys(activity.changes).length > 0 && (react_1["default"].createElement("div", { className: "mt-3 p-3 bg-white rounded text-xs border border-gray-100" },
                                react_1["default"].createElement("div", { className: "font-semibold text-gray-700 mb-2" }, "Changes:"),
                                react_1["default"].createElement("div", { className: "space-y-1" }, Object.entries(activity.changes).map(function (_a) {
                                    var field = _a[0], change = _a[1];
                                    return (react_1["default"].createElement("div", { key: field, className: "flex justify-between" },
                                        react_1["default"].createElement("span", { className: "font-medium" },
                                            field,
                                            ":"),
                                        react_1["default"].createElement("span", null,
                                            react_1["default"].createElement("span", { className: "text-red-600 line-through mr-2" }, (change === null || change === void 0 ? void 0 : change.old) !== null && (change === null || change === void 0 ? void 0 : change.old) !== undefined ? "\"" + change.old + "\"" : '-'),
                                            react_1["default"].createElement("span", { className: "text-green-600" }, (change === null || change === void 0 ? void 0 : change["new"]) !== null && (change === null || change === void 0 ? void 0 : change["new"]) !== undefined ? "\"" + change["new"] + "\"" : '-'))));
                                })))))));
                }))),
                total > 20 && (react_1["default"].createElement("div", { className: "flex items-center justify-between mt-6 pt-4 border-t border-gray-200" },
                    react_1["default"].createElement("span", { className: "text-sm text-gray-600" },
                        "Showing ",
                        (page - 1) * 20 + 1,
                        " - ",
                        Math.min(page * 20, total),
                        " of ",
                        total),
                    react_1["default"].createElement("div", { className: "flex gap-2" },
                        react_1["default"].createElement("button", { onClick: function () { return setPage(function (p) { return Math.max(1, p - 1); }); }, disabled: page === 1, className: "px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" }, "Previous"),
                        react_1["default"].createElement("button", { onClick: function () { return setPage(function (p) { return p + 1; }); }, disabled: page * 20 >= total, className: "px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" }, "Next"))))))));
};
exports["default"] = ActivityTrail;
