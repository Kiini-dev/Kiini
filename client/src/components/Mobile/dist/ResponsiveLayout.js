"use strict";
/**
 * Mobile App Foundation - React Native / React Web with Responsive Design
 * Provides mobile-optimized UI components and responsive layouts
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.MobileSheet = exports.MobileButton = exports.MobileFormInput = exports.MobileList = exports.MobileCard = exports.ResponsiveLayout = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
/**
 * Mobile-first responsive layout component
 */
exports.ResponsiveLayout = function (_a) {
    var children = _a.children, sidebar = _a.sidebar, header = _a.header;
    var _b = react_1.useState(false), isMobileMenuOpen = _b[0], setIsMobileMenuOpen = _b[1];
    var _c = react_1.useState(window.innerWidth < 768), isMobile = _c[0], setIsMobile = _c[1];
    react_1.useEffect(function () {
        var handleResize = function () {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return function () { return window.removeEventListener("resize", handleResize); };
    }, []);
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900" },
        isMobile && (react_1["default"].createElement("header", { className: "sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("h1", { className: "text-lg font-semibold text-gray-900 dark:text-white" }, "CRM"),
                react_1["default"].createElement("button", { onClick: function () { return setIsMobileMenuOpen(!isMobileMenuOpen); }, className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" }, isMobileMenuOpen ? (react_1["default"].createElement(lucide_react_1.X, { className: "w-5 h-5" })) : (react_1["default"].createElement(lucide_react_1.Menu, { className: "w-5 h-5" })))),
            react_1["default"].createElement("div", { className: "mt-3 relative" },
                react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }),
                react_1["default"].createElement("input", { type: "search", placeholder: "Search...", className: "w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })))),
        !isMobile && header,
        react_1["default"].createElement("div", { className: "flex" },
            isMobile && isMobileMenuOpen && (react_1["default"].createElement("div", { className: "fixed inset-0 z-30 flex" },
                react_1["default"].createElement("div", { className: "flex-1 bg-black/50", onClick: function () { return setIsMobileMenuOpen(false); } }),
                react_1["default"].createElement("div", { className: "w-64 bg-white dark:bg-gray-800 overflow-y-auto" }, sidebar))),
            !isMobile && (react_1["default"].createElement("aside", { className: "w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 overflow-y-auto" }, sidebar)),
            react_1["default"].createElement("main", { className: "flex-1 overflow-auto" },
                react_1["default"].createElement("div", { className: "p-4 md:p-6 max-w-7xl mx-auto" }, children))),
        isMobile && (react_1["default"].createElement("nav", { className: "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around" }, [
            { icon: lucide_react_1.Home, label: "Home", active: true },
            { icon: lucide_react_1.Bell, label: "Alerts", active: false },
            { icon: lucide_react_1.Search, label: "Search", active: false },
            { icon: lucide_react_1.Settings, label: "Settings", active: false },
        ].map(function (item) { return (react_1["default"].createElement("button", { key: item.label, className: "flex-1 flex flex-col items-center justify-center py-3 " + (item.active
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400") },
            react_1["default"].createElement(item.icon, { className: "w-5 h-5 mb-1" }),
            react_1["default"].createElement("span", { className: "text-xs" }, item.label))); }))),
        isMobile && react_1["default"].createElement("div", { className: "h-16" })));
};
/**
 * Mobile Card Component - Optimized touch target sizes
 */
exports.MobileCard = function (_a) {
    var title = _a.title, subtitle = _a.subtitle, children = _a.children, onTap = _a.onTap, actionLabel = _a.actionLabel;
    return (react_1["default"].createElement("div", { onClick: onTap, className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 touch-friendly" },
        react_1["default"].createElement("div", { className: "flex items-start justify-between" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("h3", { className: "text-base font-semibold text-gray-900 dark:text-white" }, title),
                subtitle && (react_1["default"].createElement("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1" }, subtitle))),
            onTap && (react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" }))),
        react_1["default"].createElement("div", { className: "mt-3" }, children),
        actionLabel && onTap && (react_1["default"].createElement("button", { className: "mt-3 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm min-h-[44px]" }, actionLabel))));
};
/**
 * Mobile List Component - Optimized for touch
 */
exports.MobileList = function (_a) {
    var items = _a.items, onItemTap = _a.onItemTap;
    return (react_1["default"].createElement("div", { className: "divide-y divide-gray-200 dark:divide-gray-700" }, items.map(function (item) { return (react_1["default"].createElement("button", { key: item.id, onClick: function () { return onItemTap === null || onItemTap === void 0 ? void 0 : onItemTap(item.id); }, className: "w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[56px]" },
        react_1["default"].createElement("div", { className: "flex items-center gap-3 flex-1 text-left" },
            item.icon && (react_1["default"].createElement("div", { className: "flex-shrink-0 text-blue-600 dark:text-blue-400" }, item.icon)),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("p", { className: "text-sm font-medium text-gray-900 dark:text-white" }, item.title),
                item.subtitle && (react_1["default"].createElement("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5" }, item.subtitle)))),
        item.badge && (react_1["default"].createElement("span", { className: "ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" }, item.badge)),
        react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "w-4 h-4 text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0" }))); })));
};
/**
 * Mobile Form Input - Touch-friendly
 */
exports.MobileFormInput = function (_a) {
    var label = _a.label, error = _a.error, props = __rest(_a, ["label", "error"]);
    return (react_1["default"].createElement("div", { className: "mb-4" },
        react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" }, label),
        react_1["default"].createElement("input", __assign({}, props, { className: "w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]" })),
        error && react_1["default"].createElement("p", { className: "mt-1 text-xs text-red-600 dark:text-red-400" }, error)));
};
/**
 * Mobile Button - Touch-optimized
 */
exports.MobileButton = function (_a) {
    var _b = _a.variant, variant = _b === void 0 ? "primary" : _b, _c = _a.fullWidth, fullWidth = _c === void 0 ? true : _c, _d = _a.size, size = _d === void 0 ? "md" : _d, children = _a.children, className = _a.className, props = __rest(_a, ["variant", "fullWidth", "size", "children", "className"]);
    var baseClass = "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";
    var sizeClass = {
        sm: "px-3 py-2 text-sm min-h-[40px]",
        md: "px-4 py-3 text-base min-h-[44px]",
        lg: "px-6 py-4 text-lg min-h-[48px]"
    }[size];
    var variantClass = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        secondary: "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800"
    }[variant];
    var widthClass = fullWidth ? "w-full" : "";
    return (react_1["default"].createElement("button", __assign({}, props, { className: baseClass + " " + sizeClass + " " + variantClass + " " + widthClass + " " + className }), children));
};
/**
 * Mobile Modal/Sheet - Bottom sheet for actions
 */
exports.MobileSheet = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, title = _a.title, children = _a.children;
    if (!isOpen)
        return null;
    return (react_1["default"].createElement("div", { className: "fixed inset-0 z-50 flex flex-col" },
        react_1["default"].createElement("div", { className: "flex-1 bg-black/40 backdrop-blur-sm", onClick: onClose }),
        react_1["default"].createElement("div", { className: "bg-white dark:bg-gray-800 rounded-t-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom" },
            react_1["default"].createElement("div", { className: "flex justify-center pt-2 pb-4" },
                react_1["default"].createElement("div", { className: "h-1 w-12 bg-gray-300 dark:bg-gray-600 rounded-full" })),
            react_1["default"].createElement("div", { className: "sticky top-0 bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between" },
                react_1["default"].createElement("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white" }, title),
                react_1["default"].createElement("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" },
                    react_1["default"].createElement(lucide_react_1.X, { className: "w-5 h-5" }))),
            react_1["default"].createElement("div", { className: "px-4 py-6 pb-8" }, children))));
};
exports["default"] = exports.ResponsiveLayout;
