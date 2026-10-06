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
exports.useHomepageBuilderStore = exports.useHomepageBuilder = exports.HomepageBuilderProvider = void 0;
var react_1 = require("react");
var customizationBroadcast_1 = require("@/hooks/customizationBroadcast");
var HomepageBuilderContext = react_1.createContext(undefined);
function HomepageBuilderProvider(_a) {
    var children = _a.children;
    var _b = react_1.useState(function () {
        try {
            var stored = localStorage.getItem('kiini_homepage_widgets');
            return stored ? JSON.parse(stored) : [];
        }
        catch (_a) {
            return [];
        }
    }), widgets = _b[0], setWidgets = _b[1];
    var _c = react_1.useState(function () {
        try {
            var stored = localStorage.getItem('kiini_homepage_order');
            return stored ? JSON.parse(stored) : [];
        }
        catch (_a) {
            return [];
        }
    }), widgetOrder = _c[0], setWidgetOrder = _c[1];
    var reorderWidgets = function (order) {
        setWidgetOrder(order);
    };
    var toggleWidget = function (id) {
        setWidgets(function (prev) { return prev.map(function (w) {
            return w.id === id ? __assign(__assign({}, w), { enabled: !w.enabled }) : w;
        }); });
    };
    var updateWidget = function (id, config) {
        setWidgets(function (prev) { return prev.map(function (w) {
            return w.id === id ? __assign(__assign({}, w), config) : w;
        }); });
    };
    // Persist to localStorage when widgets change
    react_1.useEffect(function () {
        localStorage.setItem('kiini_homepage_widgets', JSON.stringify(widgets));
        customizationBroadcast_1.broadcastHomepageUpdate(widgets, widgetOrder);
    }, [widgets, widgetOrder]);
    return (react_1["default"].createElement(HomepageBuilderContext.Provider, { value: { widgets: widgets, widgetOrder: widgetOrder, reorderWidgets: reorderWidgets, toggleWidget: toggleWidget, updateWidget: updateWidget } }, children));
}
exports.HomepageBuilderProvider = HomepageBuilderProvider;
function useHomepageBuilder() {
    var context = react_1.useContext(HomepageBuilderContext);
    if (!context) {
        throw new Error('useHomepageBuilder must be used within HomepageBuilderProvider');
    }
    return context;
}
exports.useHomepageBuilder = useHomepageBuilder;
// For store-like interface compatibility
exports.useHomepageBuilderStore = useHomepageBuilder;
