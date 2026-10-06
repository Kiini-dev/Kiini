"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function Collaboration() {
    var _a, _b, _c, _d, _e;
    var _f = trpc_1.trpc.realtimeCollaboration.getTeamActivityStream.useQuery({}), data = _f.data, isLoading = _f.isLoading, error = _f.error;
    var activities = (_e = (_d = (_b = (_a = data) === null || _a === void 0 ? void 0 : _a.activities) !== null && _b !== void 0 ? _b : (_c = data) === null || _c === void 0 ? void 0 : _c.stream) !== null && _d !== void 0 ? _d : data) !== null && _e !== void 0 ? _e : [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Collaboration", icon: react_1["default"].createElement(lucide_react_1.Users, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Tools" },
            { label: "Collaboration" },
        ] }, isLoading ? (react_1["default"].createElement("div", { className: "flex justify-center py-12" },
        react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))) : error ? (react_1["default"].createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, error.message)) : (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Activity Items"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, activities.length)),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Sync Status"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-green-600" }, "\u2713 Live"),
                react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "All synced"))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Activity Stream"),
            activities.length === 0 ? (react_1["default"].createElement("p", { className: "text-center text-gray-500 py-8" }, "No collaboration activity found")) : (react_1["default"].createElement("div", { className: "space-y-3" }, activities.map(function (activity, i) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                return (react_1["default"].createElement("div", { key: (_a = activity.id) !== null && _a !== void 0 ? _a : i, className: "flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition" },
                    react_1["default"].createElement("div", { className: "w-8 h-8 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center" }, ((_c = (_b = activity.user) !== null && _b !== void 0 ? _b : activity.userName) !== null && _c !== void 0 ? _c : "?")[0]),
                    react_1["default"].createElement("div", { className: "flex-1" },
                        react_1["default"].createElement("div", { className: "text-sm" },
                            react_1["default"].createElement("span", { className: "font-semibold" }, (_e = (_d = activity.user) !== null && _d !== void 0 ? _d : activity.userName) !== null && _e !== void 0 ? _e : "\u2014"),
                            " ",
                            react_1["default"].createElement("span", { className: "text-gray-600" }, (_g = (_f = activity.action) !== null && _f !== void 0 ? _f : activity.type) !== null && _g !== void 0 ? _g : ""),
                            " ",
                            react_1["default"].createElement("span", { className: "font-medium" }, (_k = (_j = (_h = activity.item) !== null && _h !== void 0 ? _h : activity.target) !== null && _j !== void 0 ? _j : activity.details) !== null && _k !== void 0 ? _k : "")),
                        react_1["default"].createElement("div", { className: "text-xs text-gray-500" }, (_o = (_m = (_l = activity.time) !== null && _l !== void 0 ? _l : activity.timestamp) !== null && _m !== void 0 ? _m : activity.createdAt) !== null && _o !== void 0 ? _o : ""))));
            }))))))));
}
exports["default"] = Collaboration;
