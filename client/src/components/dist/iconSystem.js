"use strict";
/**
 * Icon System for Custom Fields
 * Provides a consistent icon component with support for lucide-react and fallbacks
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
exports.IconButton = void 0;
var react_1 = require("react");
/**
 * SVG Icon Component - Uses inline SVGs for better performance
 * Can be replaced with lucide-react if needed
 */
var SVGIcon = function (_a) {
    var name = _a.name, _b = _a.size, size = _b === void 0 ? 20 : _b, _c = _a.color, color = _c === void 0 ? 'currentColor' : _c, className = _a.className, rest = __rest(_a, ["name", "size", "color", "className"]);
    var sizeStr = typeof size === 'number' ? size + "px" : size;
    var iconMap = {
        check: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("polyline", { points: "20 6 9 17 4 12" })))
        },
        x: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                react_1["default"].createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })))
        },
        edit: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
                react_1["default"].createElement("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })))
        },
        "delete": {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("polyline", { points: "3 6 5 6 21 6" }),
                react_1["default"].createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
                react_1["default"].createElement("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
                react_1["default"].createElement("line", { x1: "14", y1: "11", x2: "14", y2: "17" })))
        },
        plus: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
                react_1["default"].createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" })))
        },
        search: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("circle", { cx: "11", cy: "11", r: "8" }),
                react_1["default"].createElement("path", { d: "m21 21-4.35-4.35" })))
        },
        'chevron-down': {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("polyline", { points: "6 9 12 15 18 9" })))
        },
        'chevron-up': {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("polyline", { points: "18 15 12 9 6 15" })))
        },
        alert: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.14h16.94a2 2 0 0 0 1.71-3.14L13.71 3.86a2 2 0 0 0-3.42 0z" }),
                react_1["default"].createElement("line", { x1: "12", y1: "9", x2: "12", y2: "13" }),
                react_1["default"].createElement("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })))
        },
        info: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("circle", { cx: "12", cy: "12", r: "10" }),
                react_1["default"].createElement("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
                react_1["default"].createElement("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })))
        },
        help: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("circle", { cx: "12", cy: "12", r: "10" }),
                react_1["default"].createElement("path", { d: "M12 16v-4m0-4h.01" })))
        },
        loading: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("circle", { cx: "12", cy: "12", r: "1" }),
                react_1["default"].createElement("circle", { cx: "19", cy: "12", r: "1" }),
                react_1["default"].createElement("circle", { cx: "5", cy: "12", r: "1" })))
        },
        checkmark: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("polyline", { points: "20 6 9 17 4 12" })))
        },
        close: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                react_1["default"].createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })))
        },
        settings: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("circle", { cx: "12", cy: "12", r: "3" }),
                react_1["default"].createElement("path", { d: "M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6m-4.22 4.22l4.24-4.24m2.12-2.12l4.24-4.24" })))
        },
        copy: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }),
                react_1["default"].createElement("rect", { x: "8", y: "2", width: "8", height: "4", rx: "1", ry: "1" })))
        },
        download: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                react_1["default"].createElement("polyline", { points: "7 10 12 15 17 10" }),
                react_1["default"].createElement("line", { x1: "12", y1: "15", x2: "12", y2: "3" })))
        },
        upload: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                react_1["default"].createElement("polyline", { points: "17 8 12 3 7 8" }),
                react_1["default"].createElement("line", { x1: "12", y1: "3", x2: "12", y2: "15" })))
        },
        trash: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("polyline", { points: "3 6 5 6 21 6" }),
                react_1["default"].createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
                react_1["default"].createElement("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
                react_1["default"].createElement("line", { x1: "14", y1: "11", x2: "14", y2: "17" })))
        },
        eye: {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
                react_1["default"].createElement("circle", { cx: "12", cy: "12", r: "3" })))
        },
        'eye-off': {
            svg: (react_1["default"].createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
                react_1["default"].createElement("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" }),
                react_1["default"].createElement("line", { x1: "1", y1: "1", x2: "23", y2: "23" })))
        }
    };
    var icon = iconMap[name];
    if (!icon) {
        return null;
    }
    return (react_1["default"].createElement("span", { className: "icon-wrapper " + (className || ''), style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }, role: rest.role, "aria-label": rest['aria-label'] },
        react_1["default"].createElement("svg", { width: sizeStr, height: sizeStr, viewBox: "0 0 24 24", style: { display: 'block', width: sizeStr, height: sizeStr } }, icon.svg)));
};
exports.IconButton = react_1["default"].forwardRef(function (_a, ref) {
    var icon = _a.icon, _b = _a.iconSize, iconSize = _b === void 0 ? 20 : _b, _c = _a.variant, variant = _c === void 0 ? 'ghost' : _c, tooltip = _a.tooltip, loading = _a.loading, className = _a.className, buttonProps = __rest(_a, ["icon", "iconSize", "variant", "tooltip", "loading", "className"]);
    var variantClass = "icon-button-" + variant;
    return (react_1["default"].createElement("button", __assign({ ref: ref, className: "icon-button " + variantClass + " " + (className || ''), title: tooltip, disabled: loading || buttonProps.disabled }, buttonProps),
        react_1["default"].createElement(SVGIcon, { name: loading ? 'loading' : icon, size: iconSize })));
});
exports.IconButton.displayName = 'IconButton';
exports["default"] = SVGIcon;
