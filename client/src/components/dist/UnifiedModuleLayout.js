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
exports.MetadataDisplay = exports.PrintOptimizedTable = exports.ContentSection = exports.DashboardCard = exports.UnifiedModuleLayout = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var MaterialTailwind_1 = require("@/components/MaterialTailwind");
var PageHeader_1 = require("./PageHeader");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var ThemeCustomizationContext_1 = require("@/contexts/ThemeCustomizationContext");
var SystemSettingsContext_1 = require("@/contexts/SystemSettingsContext");
var ThemeContext_1 = require("@/contexts/ThemeContext");
var BrandCustomizationModal_1 = require("./BrandCustomizationModal");
/**
 * UnifiedModuleLayout - A consolidated, reusable layout component for all CRM modules.
 * Supports dark/light themes, brand customization, responsive design, and print optimization.
 */
exports.UnifiedModuleLayout = function (_a) {
    var title = _a.title, description = _a.description, subtitle = _a.subtitle, icon = _a.icon, logo = _a.logo, _b = _a.cards, cards = _b === void 0 ? [] : _b, _c = _a.sections, sections = _c === void 0 ? [] : _c, breadcrumbs = _a.breadcrumbs, backLink = _a.backLink, actions = _a.actions, children = _a.children, className = _a.className, contentClassName = _a.contentClassName, _d = _a.showThemeToggle, showThemeToggle = _d === void 0 ? false : _d, _e = _a.printable, printable = _e === void 0 ? true : _e, _f = _a.isDarkMode, initialDarkMode = _f === void 0 ? false : _f, onThemeToggle = _a.onThemeToggle, _g = _a.brandColor, brandColor = _g === void 0 ? "#3b82f6" : _g, _h = _a.themeControl, themeControl = _h === void 0 ? false : _h, _j = _a.brandControl, brandControl = _j === void 0 ? false : _j;
    var _k = ThemeContext_1.useTheme(), theme = _k.theme, toggleTheme = _k.toggleTheme;
    var isDarkMode = theme === "dark";
    var _l = react_1.useState(100), zoom = _l[0], setZoom = _l[1];
    var _m = react_1.useState(false), showBrandModal = _m[0], setShowBrandModal = _m[1];
    var _o = ThemeCustomizationContext_1.useThemeCustomization(), primaryColor = _o.primaryColor, secondaryColor = _o.secondaryColor, borderRadius = _o.borderRadius;
    var settings = SystemSettingsContext_1.useSystemSettings().settings;
    var handleThemeToggle = function () {
        toggleTheme();
        onThemeToggle === null || onThemeToggle === void 0 ? void 0 : onThemeToggle(theme === "light");
    };
    var handleZoomIn = function () {
        setZoom(function (prev) { return Math.min(prev + 10, 150); });
    };
    var handleZoomOut = function () {
        setZoom(function (prev) { return Math.max(prev - 10, 50); });
    };
    var handleResetZoom = function () {
        setZoom(100);
    };
    var handlePrint = function () {
        window.print();
    };
    // Combine back button with custom actions
    var combinedActions = (react_1["default"].createElement("div", { className: "flex items-center gap-2" },
        backLink && (react_1["default"].createElement(wouter_1.Link, { href: backLink.href },
            react_1["default"].createElement("a", null,
                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", className: "border-white/20 text-white hover:bg-white/10 hover:text-white" },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                    "Back to ",
                    backLink.label)))),
        (showThemeToggle || themeControl) && (react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleThemeToggle, title: isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode" }, isDarkMode ? "☀️" : "🌙")),
        brandControl && (react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setShowBrandModal(true); }, title: "Customize Brand and Theme" },
            react_1["default"].createElement(lucide_react_1.Palette, { className: "h-4 w-4 mr-2" }),
            "Brand")),
        printable && (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleZoomOut, title: "Zoom Out" },
                react_1["default"].createElement(lucide_react_1.ZoomOut, { className: "h-4 w-4" })),
            react_1["default"].createElement("span", { className: "text-sm text-gray-600" },
                zoom,
                "%"),
            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleZoomIn, title: "Zoom In" },
                react_1["default"].createElement(lucide_react_1.ZoomIn, { className: "h-4 w-4" })),
            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleResetZoom, title: "Reset Zoom" }, "\u27F2"),
            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handlePrint, title: "Print" },
                react_1["default"].createElement(lucide_react_1.Printer, { className: "h-4 w-4" })))),
        actions));
    return (react_1["default"].createElement(MaterialTailwind_1.DashboardLayout, null,
        react_1["default"].createElement("div", { className: utils_1.cn("space-y-6", isDarkMode ? "dark bg-slate-900 text-white" : "bg-white", className), style: {
                "--brand-color": primaryColor || brandColor,
                "--secondary-color": secondaryColor || "#6366f1",
                "--border-radius": borderRadius || "0.5rem"
            } },
            react_1["default"].createElement(PageHeader_1.PageHeader, { title: title, description: description, icon: icon, breadcrumbs: breadcrumbs, actions: combinedActions }),
            react_1["default"].createElement("div", { className: utils_1.cn("", contentClassName), style: {
                    transform: "scale(" + zoom / 100 + ")",
                    transformOrigin: "top center",
                    transition: "transform 0.2s ease"
                } },
                cards.length > 0 && (react_1["default"].createElement("section", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" }, cards.map(function (card) { return (react_1["default"].createElement(exports.DashboardCard, __assign({ key: card.id }, card))); }))),
                sections.length > 0 && (react_1["default"].createElement("div", { className: "space-y-4" }, sections.map(function (section) { return (react_1["default"].createElement(exports.ContentSection, __assign({ key: section.id }, section))); }))),
                children),
            brandControl && showBrandModal && (react_1["default"].createElement(BrandCustomizationModal_1.BrandCustomizationModal, { isOpen: showBrandModal, onClose: function () { return setShowBrandModal(false); } })))));
};
/**
 * Dashboard Card Component
 */
exports.DashboardCard = function (_a) {
    var id = _a.id, title = _a.title, icon = _a.icon, value = _a.value, subtitle = _a.subtitle, gradient = _a.gradient, onClick = _a.onClick, _b = _a.loading, loading = _b === void 0 ? false : _b;
    return (react_1["default"].createElement("div", { className: "rounded-lg p-4 text-white cursor-pointer hover:shadow-lg transition-shadow", style: {
            backgroundImage: "linear-gradient(135deg, " + gradient.from + " 0%, " + gradient.to + " 100%)"
        }, onClick: onClick },
        react_1["default"].createElement("div", { className: "flex items-start justify-between mb-2" },
            react_1["default"].createElement("div", { className: "text-2xl" }, icon)),
        react_1["default"].createElement("p", { className: "text-sm font-medium opacity-90" }, title),
        loading ? (react_1["default"].createElement("div", { className: "h-6 bg-white bg-opacity-20 rounded mt-2 animate-pulse" })) : (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("p", { className: "text-2xl font-bold mt-2" }, value),
            subtitle && react_1["default"].createElement("p", { className: "text-xs opacity-75 mt-1" }, subtitle)))));
};
/**
 * Content Section Component
 */
exports.ContentSection = function (_a) {
    var id = _a.id, title = _a.title, subtitle = _a.subtitle, children = _a.children, _b = _a.variant, variant = _b === void 0 ? "default" : _b, _c = _a.fullWidth, fullWidth = _c === void 0 ? false : _c;
    return (react_1["default"].createElement("section", { className: utils_1.cn("rounded-lg border p-4", variant === "highlighted" && "bg-blue-50 border-blue-200", variant === "minimal" && "border-0 shadow-none", fullWidth && "w-full") },
        react_1["default"].createElement("div", { className: "mb-4" },
            react_1["default"].createElement("h2", { className: "text-lg font-semibold" }, title),
            subtitle && react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, subtitle)),
        react_1["default"].createElement("div", null, children)));
};
exports.PrintOptimizedTable = function (_a) {
    var columns = _a.columns, data = _a.data, title = _a.title, _b = _a.striped, striped = _b === void 0 ? true : _b;
    return (react_1["default"].createElement("div", { className: "space-y-2" },
        title && react_1["default"].createElement("h3", { className: "text-sm font-semibold" }, title),
        react_1["default"].createElement("table", { className: utils_1.cn("w-full text-sm", striped && "") },
            react_1["default"].createElement("thead", { className: "bg-gray-100" },
                react_1["default"].createElement("tr", null, columns.map(function (col) { return (react_1["default"].createElement("th", { key: col.key, className: "p-2 text-left font-semibold", style: {
                        textAlign: col.align || "left",
                        width: col.width
                    } }, col.label)); }))),
            react_1["default"].createElement("tbody", null, data.map(function (row, idx) { return (react_1["default"].createElement("tr", { key: idx, className: utils_1.cn("border-t", striped && idx % 2 === 0 && "bg-gray-50") }, columns.map(function (col) { return (react_1["default"].createElement("td", { key: idx + "-" + col.key, className: "p-2", style: {
                    textAlign: col.align || "left"
                } }, col.render ? col.render(row[col.key], row) : row[col.key])); }))); })))));
};
exports.MetadataDisplay = function (_a) {
    var items = _a.items, _b = _a.columns, columns = _b === void 0 ? 4 : _b;
    return (react_1["default"].createElement("div", { className: "grid gap-4", style: {
            gridTemplateColumns: "repeat(" + columns + ", 1fr)"
        } }, items.map(function (item, idx) { return (react_1["default"].createElement("div", { key: idx, className: "space-y-1" },
        react_1["default"].createElement("span", { className: "text-xs font-medium text-gray-600 uppercase tracking-wide" }, item.label),
        react_1["default"].createElement("span", { className: "text-lg font-semibold" }, item.value))); })));
};
exports["default"] = exports.UnifiedModuleLayout;
