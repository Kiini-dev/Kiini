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
exports.CardContent = exports.CardDescription = exports.CardAction = exports.CardTitle = exports.CardFooter = exports.CardHeader = exports.Card = void 0;
var React = require("react");
var utils_1 = require("@/lib/utils");
var Card = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement("div", __assign({ ref: ref, "data-slot": "card", className: utils_1.cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm min-w-0", className) }, props)));
});
exports.Card = Card;
Card.displayName = "Card";
var CardHeader = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement("div", __assign({ ref: ref, "data-slot": "card-header", className: utils_1.cn("@container/card-header grid auto-rows-min grid-cols-1 grid-rows-[auto_auto] items-start gap-2 px-6 min-w-0 sm:has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className) }, props)));
});
exports.CardHeader = CardHeader;
CardHeader.displayName = "CardHeader";
var CardTitle = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement("div", __assign({ ref: ref, "data-slot": "card-title", className: utils_1.cn("leading-none font-semibold", className) }, props)));
});
exports.CardTitle = CardTitle;
CardTitle.displayName = "CardTitle";
var CardDescription = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement("div", __assign({ ref: ref, "data-slot": "card-description", className: utils_1.cn("text-muted-foreground text-sm", className) }, props)));
});
exports.CardDescription = CardDescription;
CardDescription.displayName = "CardDescription";
var CardAction = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement("div", __assign({ ref: ref, "data-slot": "card-action", className: utils_1.cn("col-start-1 row-start-3 w-full min-w-0 self-start justify-self-start sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:w-auto sm:justify-self-end", className) }, props)));
});
exports.CardAction = CardAction;
CardAction.displayName = "CardAction";
var CardContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement("div", __assign({ ref: ref, "data-slot": "card-content", className: utils_1.cn("px-6", className) }, props)));
});
exports.CardContent = CardContent;
CardContent.displayName = "CardContent";
var CardFooter = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement("div", __assign({ ref: ref, "data-slot": "card-footer", className: utils_1.cn("flex items-center px-6 [.border-t]:pt-6", className) }, props)));
});
exports.CardFooter = CardFooter;
CardFooter.displayName = "CardFooter";
