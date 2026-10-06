"use strict";
/**
 * ResponsiveTabs Component
 * Mobile-first tabs that adapt layout on smaller screens
 * Prevents tab overflow with horizontal scrolling on mobile
 */
exports.__esModule = true;
exports.ResponsiveTabContent = exports.ResponsiveTabs = void 0;
var react_1 = require("react");
var TabsPrimitive = require("@radix-ui/react-tabs");
var responsive_utils_1 = require("@/lib/responsive-utils");
/**
 * ResponsiveTabs Component with mobile-first design
 * - Horizontal scroll on mobile
 * - Normal layout on tablet+
 * - Prevents tab overflow issues
 */
exports.ResponsiveTabs = function (_a) {
    var _b;
    var tabs = _a.tabs, defaultValue = _a.defaultValue, onValueChange = _a.onValueChange, className = _a.className, _c = _a.scrollable, scrollable = _c === void 0 ? true : _c;
    var tabsRef = react_1["default"].useRef(null);
    var _d = react_1["default"].useState(defaultValue || ((_b = tabs[0]) === null || _b === void 0 ? void 0 : _b.value)), activeTab = _d[0], setActiveTab = _d[1];
    var handleValueChange = function (value) {
        setActiveTab(value);
        onValueChange === null || onValueChange === void 0 ? void 0 : onValueChange(value);
    };
    return (react_1["default"].createElement(TabsPrimitive.Root, { value: activeTab, onValueChange: handleValueChange, className: className },
        react_1["default"].createElement(TabsPrimitive.List, { ref: tabsRef, className: responsive_utils_1.cn("inline-flex sm:flex w-full flex-nowrap sm:flex-wrap", "overflow-x-auto sm:overflow-x-visible", "bg-muted p-0.5 sm:p-1", "rounded-lg gap-0.5 sm:gap-1", "border-b border-border sm:border-0") }, tabs.map(function (tab) { return (react_1["default"].createElement(TabsPrimitive.Trigger, { key: tab.value, value: tab.value, className: responsive_utils_1.cn(
            // Base styles
            "inline-flex items-center justify-center", "whitespace-nowrap", 
            // Responsive sizing
            "text-xs sm:text-sm md:text-base", "px-2 sm:px-3 md:px-4 py-1.5 sm:py-2", 
            // Responsive flex shrink
            "flex-shrink-0 sm:flex-shrink", 
            // Transitions
            "transition-all duration-200", "rounded-md", 
            // States
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", "data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:text-foreground", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring") }, tab.label)); })),
        tabs.map(function (tab) { return (react_1["default"].createElement(TabsPrimitive.Content, { key: tab.value, value: tab.value, className: responsive_utils_1.cn("mt-2 sm:mt-4", "p-2 sm:p-3 md:p-4 lg:p-6", "rounded-lg border border-border", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring") }, tab.content)); })));
};
/**
 * Simple responsive tab content wrapper
 */
exports.ResponsiveTabContent = function (_a) {
    var children = _a.children;
    return (react_1["default"].createElement("div", { className: "w-full overflow-hidden" }, children));
};
