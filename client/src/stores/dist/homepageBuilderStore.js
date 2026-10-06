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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useHomepageBuilderStore = void 0;
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
var customizationBroadcast_1 = require("@/hooks/customizationBroadcast");
var DEFAULT_WIDGETS = {
    revenueMetrics: {
        id: "revenue",
        title: "Revenue Metrics",
        description: "Monthly revenue and income summary",
        category: "finance",
        enabled: true,
        size: "medium",
        order: 1
    },
    employeeOverview: {
        id: "employees",
        title: "Employee Overview",
        description: "Total employees and department breakdown",
        category: "hr",
        enabled: true,
        size: "medium",
        order: 2
    },
    activeSales: {
        id: "activeSales",
        title: "Active Sales",
        description: "Current sales pipeline",
        category: "sales",
        enabled: true,
        size: "medium",
        order: 3
    },
    expenseTracker: {
        id: "expenses",
        title: "Expense Tracker",
        description: "Track business expenses and budgets",
        category: "finance",
        enabled: false,
        size: "medium",
        order: 4
    },
    invoiceStatus: {
        id: "invoices",
        title: "Invoice Status",
        description: "Pending and overdue invoices",
        category: "finance",
        enabled: false,
        size: "small",
        order: 5
    },
    attendanceTracker: {
        id: "attendance",
        title: "Attendance Tracker",
        description: "Real-time employee attendance",
        category: "hr",
        enabled: false,
        size: "medium",
        order: 6
    },
    tasksOverview: {
        id: "tasks",
        title: "Tasks Overview",
        description: "Pending and completed tasks",
        category: "operations",
        enabled: false,
        size: "medium",
        order: 7
    },
    performanceMetrics: {
        id: "performance",
        title: "Performance Metrics",
        description: "KPIs and performance indicators",
        category: "analytics",
        enabled: false,
        size: "large",
        order: 8
    }
};
exports.useHomepageBuilderStore = zustand_1.create()(middleware_1.persist(function (set, get) { return ({
    widgets: DEFAULT_WIDGETS,
    widgetOrder: Object.keys(DEFAULT_WIDGETS).sort(function (a, b) { var _a, _b, _c, _d; return ((_b = (_a = get().widgets[a]) === null || _a === void 0 ? void 0 : _a.order) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = get().widgets[b]) === null || _c === void 0 ? void 0 : _c.order) !== null && _d !== void 0 ? _d : 0); }),
    toggleWidget: function (id) {
        set(function (state) {
            var _a;
            var _b;
            return ({
                widgets: __assign(__assign({}, state.widgets), (_a = {}, _a[id] = __assign(__assign({}, state.widgets[id]), { enabled: !((_b = state.widgets[id]) === null || _b === void 0 ? void 0 : _b.enabled) }), _a))
            });
        });
    },
    enableWidget: function (id) {
        set(function (state) {
            var _a;
            return ({
                widgets: __assign(__assign({}, state.widgets), (_a = {}, _a[id] = __assign(__assign({}, state.widgets[id]), { enabled: true }), _a))
            });
        });
    },
    disableWidget: function (id) {
        set(function (state) {
            var _a;
            return ({
                widgets: __assign(__assign({}, state.widgets), (_a = {}, _a[id] = __assign(__assign({}, state.widgets[id]), { enabled: false }), _a))
            });
        });
    },
    reorderWidgets: function (order) {
        set(function (state) {
            var newWidgets = __assign({}, state.widgets);
            order.forEach(function (id, index) {
                if (newWidgets[id]) {
                    newWidgets[id].order = index + 1;
                }
            });
            return {
                widgets: newWidgets,
                widgetOrder: order
            };
        });
        // Broadcast to all tabs
        var state = get();
        customizationBroadcast_1.broadcastHomepageUpdate(state.widgets, state.widgetOrder);
    },
    moveWidgetUp: function (id) {
        var _a;
        var _b = get(), widgets = _b.widgets, widgetOrder = _b.widgetOrder;
        var currentIndex = widgetOrder.indexOf(id);
        if (currentIndex > 0) {
            var newOrder = __spreadArrays(widgetOrder);
            _a = [
                newOrder[currentIndex - 1],
                newOrder[currentIndex],
            ], newOrder[currentIndex] = _a[0], newOrder[currentIndex - 1] = _a[1];
            get().reorderWidgets(newOrder);
        }
    },
    moveWidgetDown: function (id) {
        var _a;
        var _b = get(), widgets = _b.widgets, widgetOrder = _b.widgetOrder;
        var currentIndex = widgetOrder.indexOf(id);
        if (currentIndex < widgetOrder.length - 1) {
            var newOrder = __spreadArrays(widgetOrder);
            _a = [
                newOrder[currentIndex + 1],
                newOrder[currentIndex],
            ], newOrder[currentIndex] = _a[0], newOrder[currentIndex + 1] = _a[1];
            get().reorderWidgets(newOrder);
        }
    },
    resetToDefault: function () {
        set({
            widgets: DEFAULT_WIDGETS,
            widgetOrder: Object.keys(DEFAULT_WIDGETS).sort(function (a, b) { var _a, _b, _c, _d; return ((_b = (_a = DEFAULT_WIDGETS[a]) === null || _a === void 0 ? void 0 : _a.order) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = DEFAULT_WIDGETS[b]) === null || _c === void 0 ? void 0 : _c.order) !== null && _d !== void 0 ? _d : 0); })
        });
    },
    getEnabledWidgets: function () {
        var _a = get(), widgets = _a.widgets, widgetOrder = _a.widgetOrder;
        return widgetOrder
            .filter(function (id) { var _a; return (_a = widgets[id]) === null || _a === void 0 ? void 0 : _a.enabled; })
            .map(function (id) { return widgets[id]; })
            .filter(Boolean);
    },
    getWidgetsByCategory: function (category) {
        var _a = get(), widgets = _a.widgets, widgetOrder = _a.widgetOrder;
        return widgetOrder
            .map(function (id) { return widgets[id]; })
            .filter(function (w) { return w && w.category === category; })
            .sort(function (a, b) { return a.order - b.order; });
    }
}); }, {
    name: "homepage-builder-store",
    version: 1
}));
