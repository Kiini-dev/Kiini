"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function Presence() {
    var _a, _b, _c, _d, _e;
    var _f = trpc_1.trpc.realtimeCollaboration.getTeamActivityStream.useQuery({}), data = _f.data, isLoading = _f.isLoading, error = _f.error;
    var activities = (_e = (_d = (_b = (_a = data) === null || _a === void 0 ? void 0 : _a.activities) !== null && _b !== void 0 ? _b : (_c = data) === null || _c === void 0 ? void 0 : _c.stream) !== null && _d !== void 0 ? _d : data) !== null && _e !== void 0 ? _e : [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Team Presence", icon: react_1["default"].createElement(lucide_react_1.Users, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Communication" },
            { label: "Presence" },
        ] }, isLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-12" },
        react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))) : error ? (react_1["default"].createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, error.message)) : (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Activity Items"),
                react_1["default"].createElement("div", { className: "text-3xl font-bold text-green-600" }, activities.length)),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Status"),
                react_1["default"].createElement("div", { className: "text-3xl font-bold text-green-600" }, "\u2713 Live"))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Live Activity Stream"),
            activities.length === 0 ? (react_1["default"].createElement("p", { className: "text-center text-gray-500 py-8" }, "No activity data available")) : (react_1["default"].createElement("div", { className: "space-y-3" }, activities.map(function (activity, i) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                return (react_1["default"].createElement("div", { key: (_a = activity.id) !== null && _a !== void 0 ? _a : i, className: "flex items-center gap-3 p-3 border rounded" },
                    react_1["default"].createElement(lucide_react_1.Circle, { className: "w-2 h-2 " + (i === 0 ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300") }),
                    react_1["default"].createElement("div", { className: "flex-1" },
                        react_1["default"].createElement("div", { className: "text-sm" },
                            react_1["default"].createElement("span", { className: "font-semibold" }, (_c = (_b = activity.user) !== null && _b !== void 0 ? _b : activity.userName) !== null && _c !== void 0 ? _c : "\u2014"),
                            " ",
                            react_1["default"].createElement("span", { className: "text-gray-600" }, (_e = (_d = activity.action) !== null && _d !== void 0 ? _d : activity.type) !== null && _e !== void 0 ? _e : ""),
                            " ",
                            react_1["default"].createElement("span", { className: "font-medium" }, (_h = (_g = (_f = activity.item) !== null && _f !== void 0 ? _f : activity.target) !== null && _g !== void 0 ? _g : activity.details) !== null && _h !== void 0 ? _h : ""))),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-500" }, (_l = (_k = (_j = activity.time) !== null && _j !== void 0 ? _j : activity.timestamp) !== null && _k !== void 0 ? _k : activity.createdAt) !== null && _l !== void 0 ? _l : "")));
            }))))))));
}
exports["default"] = Presence;
