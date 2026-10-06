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
exports.Slider = void 0;
var React = require("react");
var SliderPrimitive = require("@radix-ui/react-slider");
var utils_1 = require("@/lib/utils");
function Slider(_a) {
    var className = _a.className, defaultValue = _a.defaultValue, value = _a.value, _b = _a.min, min = _b === void 0 ? 0 : _b, _c = _a.max, max = _c === void 0 ? 100 : _c, props = __rest(_a, ["className", "defaultValue", "value", "min", "max"]);
    var _values = React.useMemo(function () {
        return Array.isArray(value)
            ? value
            : Array.isArray(defaultValue)
                ? defaultValue
                : [min, max];
    }, [value, defaultValue, min, max]);
    return (React.createElement(SliderPrimitive.Root, __assign({ "data-slot": "slider", defaultValue: defaultValue, value: value, min: min, max: max, className: utils_1.cn("relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col", className) }, props),
        React.createElement(SliderPrimitive.Track, { "data-slot": "slider-track", className: utils_1.cn("bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5") },
            React.createElement(SliderPrimitive.Range, { "data-slot": "slider-range", className: utils_1.cn("bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full") })),
        Array.from({ length: _values.length }, function (_, index) { return (React.createElement(SliderPrimitive.Thumb, { "data-slot": "slider-thumb", key: "thumb-" + index, className: "border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50" })); })));
}
exports.Slider = Slider;
