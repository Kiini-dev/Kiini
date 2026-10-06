"use strict";
/*
 * Unified Module Layout Component
 * Provides consistent styling across all modules with dark/light theme support
 * Supports dashboard cards, section layouts, and content organization
 * Optimized for both screen and print display
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
exports.__esModule = true;
exports.MetadataDisplay = exports.PrintOptimizedTable = exports.UnifiedModuleLayout = void 0;
var react_1 = require("react");
require("../styles/print-autoscale.css");
/**
 * Unified Module Layout Component
 * Provides consistent styling and theming for all modules
 */
exports.UnifiedModuleLayout = function (_a) {
    var _b, _c;
    var title = _a.title, pageTitle = _a.pageTitle, subtitle = _a.subtitle, description = _a.description, pageDescription = _a.pageDescription, primaryAction = _a.primaryAction, secondaryAction = _a.secondaryAction, _d = _a.showPrintButton, showPrintButton = _d === void 0 ? false : _d, logo = _a.logo, _e = _a.cards, cards = _e === void 0 ? [] : _e, _f = _a.sections, sections = _f === void 0 ? [] : _f, _g = _a.showThemeToggle, showThemeToggle = _g === void 0 ? false : _g, _h = _a.printable, printable = _h === void 0 ? true : _h, children = _a.children, _j = _a.className, className = _j === void 0 ? '' : _j, _k = _a.isDarkMode, initialDarkMode = _k === void 0 ? false : _k, onThemeToggle = _a.onThemeToggle;
    var _l = react_1.useState(initialDarkMode), isDarkMode = _l[0], setIsDarkMode = _l[1];
    var resolvedTitle = (_b = title !== null && title !== void 0 ? title : pageTitle) !== null && _b !== void 0 ? _b : '';
    var resolvedSubtitle = (_c = subtitle !== null && subtitle !== void 0 ? subtitle : description) !== null && _c !== void 0 ? _c : pageDescription;
    react_1.useEffect(function () {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
        }
        else {
            document.documentElement.classList.remove('dark-mode');
        }
    }, [isDarkMode]);
    return (react_1["default"].createElement("div", { className: "unified-module-layout " + (isDarkMode ? 'dark-mode' : 'light-mode') + " " + className },
        react_1["default"].createElement("header", { className: "module-header" },
            react_1["default"].createElement("div", { className: "module-header-content" },
                logo && react_1["default"].createElement("img", { src: logo, alt: "Logo", className: "module-logo" }),
                react_1["default"].createElement("div", { className: "module-header-text" },
                    react_1["default"].createElement("h1", { className: "module-title" }, resolvedTitle),
                    resolvedSubtitle && react_1["default"].createElement("p", { className: "module-subtitle" }, resolvedSubtitle))),
            react_1["default"].createElement("div", { className: "module-toolbar" },
                secondaryAction && (react_1["default"].createElement("button", { className: "toolbar-button", onClick: secondaryAction.onClick },
                    secondaryAction.icon && react_1["default"].createElement(secondaryAction.icon, { className: "w-4 h-4" }),
                    secondaryAction.label)),
                primaryAction && (react_1["default"].createElement("button", { className: "toolbar-button", onClick: primaryAction.onClick },
                    primaryAction.icon && react_1["default"].createElement(primaryAction.icon, { className: "w-4 h-4" }),
                    primaryAction.label)))),
        react_1["default"].createElement("main", { className: "module-content" },
            Array.isArray(cards) && cards.length > 0 && (react_1["default"].createElement("section", { className: "module-cards-grid" }, cards.map(function (card) {
                var _a;
                return (react_1["default"].createElement(DashboardCard, __assign({ key: (_a = card.id) !== null && _a !== void 0 ? _a : card.title }, card)));
            }))),
            Array.isArray(sections) && sections.length > 0 && (react_1["default"].createElement("div", { className: "module-sections" }, sections.map(function (section) {
                var _a, _b;
                return (react_1["default"].createElement(ContentSection, __assign({ key: (_b = (_a = section.id) !== null && _a !== void 0 ? _a : section.title) !== null && _b !== void 0 ? _b : 'section' }, section)));
            }))),
            children)));
};
/**
 * Dashboard Card Component
 * Displays key metrics with gradient backgrounds
 */
var DashboardCard = function (_a) {
    var id = _a.id, title = _a.title, icon = _a.icon, value = _a.value, subtitle = _a.subtitle, gradient = _a.gradient, variant = _a.variant, trend = _a.trend, trendLabel = _a.trendLabel, percentage = _a.percentage, description = _a.description, onClick = _a.onClick, _b = _a.loading, loading = _b === void 0 ? false : _b;
    var iconBgByVariant = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-emerald-600',
        purple: 'from-purple-500 to-indigo-600',
        "default": 'from-slate-500 to-slate-600'
    };
    var iconBgClass = iconBgByVariant[variant !== null && variant !== void 0 ? variant : 'default'];
    return (react_1["default"].createElement("div", { className: "group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 " + (onClick ? 'cursor-pointer' : ''), onClick: onClick },
        react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
            react_1["default"].createElement("div", { className: "inline-flex p-3 rounded-lg text-white bg-gradient-to-br " + iconBgClass },
                react_1["default"].createElement("div", { className: "w-5 h-5" }, icon))),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("p", { className: "text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" }, title),
            loading ? (react_1["default"].createElement("div", { className: "h-8 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse w-24" })) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("p", { className: "text-2xl font-bold mt-2 text-slate-900 dark:text-slate-50" }, value),
                subtitle && react_1["default"].createElement("p", { className: "text-xs mt-1 text-slate-600 dark:text-slate-400" }, subtitle),
                description && react_1["default"].createElement("p", { className: "text-xs mt-1 text-slate-600 dark:text-slate-400" }, description),
                (trend || trendLabel) && react_1["default"].createElement("p", { className: "text-xs mt-1 text-slate-600 dark:text-slate-400" },
                    trend,
                    " ",
                    trendLabel),
                percentage && react_1["default"].createElement("p", { className: "text-xs mt-1 text-slate-600 dark:text-slate-400" },
                    percentage,
                    "%"))))));
};
/**
 * Content Section Component
 * Organizes content in consistent sections
 */
var ContentSection = function (_a) {
    var id = _a.id, title = _a.title, subtitle = _a.subtitle, children = _a.children, _b = _a.variant, variant = _b === void 0 ? 'default' : _b, _c = _a.fullWidth, fullWidth = _c === void 0 ? false : _c, className = _a.className;
    return (react_1["default"].createElement("section", { className: "content-section section-" + (variant === 'card' ? 'default' : variant) + " " + (fullWidth ? 'full-width' : '') + " " + (className !== null && className !== void 0 ? className : '') },
        (title || subtitle) && (react_1["default"].createElement("div", { className: "section-header" },
            react_1["default"].createElement("div", { className: "section-title-group" },
                title && react_1["default"].createElement("h2", { className: "section-title" }, title),
                subtitle && react_1["default"].createElement("p", { className: "section-subtitle" }, subtitle)))),
        react_1["default"].createElement("div", { className: "section-content" }, children)));
};
exports.PrintOptimizedTable = function (_a) {
    var columns = _a.columns, data = _a.data, title = _a.title, _b = _a.striped, striped = _b === void 0 ? true : _b;
    return (react_1["default"].createElement("div", { className: "template-line-items" },
        title && react_1["default"].createElement("h3", { className: "template-line-items-title" }, title),
        react_1["default"].createElement("table", { className: "print-table " + (striped ? 'striped' : '') },
            react_1["default"].createElement("thead", null,
                react_1["default"].createElement("tr", null, columns.map(function (col) { return (react_1["default"].createElement("th", __assign({ key: col.key, className: col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left' }, (col.width ? { width: col.width } : {})), col.label)); }))),
            react_1["default"].createElement("tbody", null, Array.isArray(data) && data.map(function (row, idx) { return (react_1["default"].createElement("tr", { key: idx }, columns.map(function (col) { return (col.printHidden ? null : (react_1["default"].createElement("td", { key: idx + "-" + col.key, className: col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left' }, col.render ? col.render(row[col.key], row) : row[col.key]))); }))); })))));
};
exports.MetadataDisplay = function (_a) {
    var _b;
    var items = _a.items, _c = _a.columns, columns = _c === void 0 ? 4 : _c, _d = _a.variant, variant = _d === void 0 ? 'default' : _d;
    var gridColsMap = {
        1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3',
        4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6'
    };
    var gridClass = (_b = gridColsMap[columns]) !== null && _b !== void 0 ? _b : 'grid-cols-4';
    return (react_1["default"].createElement("div", { className: "template-metadata " + gridClass + " " + (variant === 'footer' ? 'pt-4 border-t' : '') }, items.map(function (item, idx) { return (react_1["default"].createElement("div", { key: idx, className: "template-metadata-item" },
        react_1["default"].createElement("span", { className: "template-metadata-label" }, item.label),
        react_1["default"].createElement("span", { className: "template-metadata-value" }, item.value))); })));
};
exports["default"] = exports.UnifiedModuleLayout;
