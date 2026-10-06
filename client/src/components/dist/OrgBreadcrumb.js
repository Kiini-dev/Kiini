"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var lucide_react_1 = require("lucide-react");
var breadcrumb_1 = require("@/components/ui/breadcrumb");
/**
 * Reusable breadcrumb for org pages.
 * Always prepends "Dashboard" → /org/:slug/dashboard
 * The last item is the current page (no link).
 */
function OrgBreadcrumb(_a) {
    var slug = _a.slug, items = _a.items, className = _a.className;
    var allItems = __spreadArrays([
        { label: "Dashboard", href: "/org/" + slug + "/dashboard" }
    ], items);
    return (react_1["default"].createElement(breadcrumb_1.Breadcrumb, { className: className },
        react_1["default"].createElement(breadcrumb_1.BreadcrumbList, null, allItems.map(function (item, index) {
            var isLast = index === allItems.length - 1;
            return (react_1["default"].createElement(react_1["default"].Fragment, { key: index },
                index > 0 && react_1["default"].createElement(breadcrumb_1.BreadcrumbSeparator, null),
                react_1["default"].createElement(breadcrumb_1.BreadcrumbItem, null, isLast || !item.href ? (react_1["default"].createElement(breadcrumb_1.BreadcrumbPage, { className: "text-white/80" }, item.label)) : (react_1["default"].createElement(breadcrumb_1.BreadcrumbLink, { asChild: true },
                    react_1["default"].createElement(wouter_1.Link, { href: item.href, className: "text-white/50 hover:text-white/80 transition-colors text-sm" }, index === 0 ? (react_1["default"].createElement("span", { className: "flex items-center gap-1" },
                        react_1["default"].createElement(lucide_react_1.Home, { className: "h-3 w-3" }),
                        item.label)) : (item.label)))))));
        }))));
}
exports["default"] = OrgBreadcrumb;
