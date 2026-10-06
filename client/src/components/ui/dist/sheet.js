"use client";
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
exports.SheetDescription = exports.SheetTitle = exports.SheetFooter = exports.SheetHeader = exports.SheetContent = exports.SheetClose = exports.SheetTrigger = exports.Sheet = void 0;
var React = require("react");
var SheetPrimitive = require("@radix-ui/react-dialog");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function Sheet(_a) {
    var props = __rest(_a, []);
    return React.createElement(SheetPrimitive.Root, __assign({ "data-slot": "sheet" }, props));
}
exports.Sheet = Sheet;
var SheetTrigger = React.forwardRef(function (_a, ref) {
    var props = __rest(_a, []);
    return React.createElement(SheetPrimitive.Trigger, __assign({ ref: ref, "data-slot": "sheet-trigger" }, props));
});
exports.SheetTrigger = SheetTrigger;
SheetTrigger.displayName = "SheetTrigger";
function SheetClose(_a) {
    var props = __rest(_a, []);
    return React.createElement(SheetPrimitive.Close, __assign({ "data-slot": "sheet-close" }, props));
}
exports.SheetClose = SheetClose;
function SheetPortal(_a) {
    var props = __rest(_a, []);
    return React.createElement(SheetPrimitive.Portal, __assign({ "data-slot": "sheet-portal" }, props));
}
function SheetOverlay(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement(SheetPrimitive.Overlay, __assign({ "data-slot": "sheet-overlay", className: utils_1.cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className) }, props)));
}
function SheetContent(_a) {
    var className = _a.className, children = _a.children, _b = _a.side, side = _b === void 0 ? "right" : _b, props = __rest(_a, ["className", "children", "side"]);
    return (React.createElement(SheetPortal, null,
        React.createElement(SheetOverlay, null),
        React.createElement(SheetPrimitive.Content, __assign({ "data-slot": "sheet-content", className: utils_1.cn("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500", side === "right" &&
                "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm", side === "left" &&
                "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm", side === "top" &&
                "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b", side === "bottom" &&
                "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t", className) }, props),
            children,
            React.createElement(SheetPrimitive.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none" },
                React.createElement(lucide_react_1.XIcon, { className: "size-4" }),
                React.createElement("span", { className: "sr-only" }, "Close")))));
}
exports.SheetContent = SheetContent;
function SheetHeader(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement("div", __assign({ "data-slot": "sheet-header", className: utils_1.cn("flex flex-col gap-1.5 p-4", className) }, props)));
}
exports.SheetHeader = SheetHeader;
function SheetFooter(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement("div", __assign({ "data-slot": "sheet-footer", className: utils_1.cn("mt-auto flex flex-col gap-2 p-4", className) }, props)));
}
exports.SheetFooter = SheetFooter;
function SheetTitle(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement(SheetPrimitive.Title, __assign({ "data-slot": "sheet-title", className: utils_1.cn("text-foreground font-semibold", className) }, props)));
}
exports.SheetTitle = SheetTitle;
function SheetDescription(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement(SheetPrimitive.Description, __assign({ "data-slot": "sheet-description", className: utils_1.cn("text-muted-foreground text-sm", className) }, props)));
}
exports.SheetDescription = SheetDescription;
