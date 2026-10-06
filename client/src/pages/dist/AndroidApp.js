"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function AndroidApp() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9;
    var version = trpc_1.trpc.mobileApp.getAppVersion.useQuery({ platform: "android" });
    var analytics = trpc_1.trpc.mobileApp.getMobileAnalytics.useQuery({ period: "monthly" });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Android App", icon: React.createElement(lucide_react_1.Smartphone, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Mobile" }, { label: "Android App" }] }, version.isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-green-600" }))) : version.error ? (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, "Failed to load Android app data")) : (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { label: "Current Version", value: (_b = (_a = version.data) === null || _a === void 0 ? void 0 : _a.currentVersion) !== null && _b !== void 0 ? _b : "—" },
            { label: "Min Version", value: (_d = (_c = version.data) === null || _c === void 0 ? void 0 : _c.minimumVersion) !== null && _d !== void 0 ? _d : "—" },
            { label: "Status", value: (_f = (_e = version.data) === null || _e === void 0 ? void 0 : _e.status) !== null && _f !== void 0 ? _f : "—" },
            { label: "Active Users", value: (_k = (_j = (_h = (_g = analytics.data) === null || _g === void 0 ? void 0 : _g.analytics) === null || _h === void 0 ? void 0 : _h.activeUsers) === null || _j === void 0 ? void 0 : _j.toLocaleString()) !== null && _k !== void 0 ? _k : "—" },
        ].map(function (card, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg border-2 border-green-200 shadow-md" },
            React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, card.label),
            React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, card.value))); })),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-green-200 shadow-md" },
                React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Version Details"),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Latest"),
                        React.createElement("span", { className: "font-semibold" }, (_m = (_l = version.data) === null || _l === void 0 ? void 0 : _l.latestVersion) !== null && _m !== void 0 ? _m : "—")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Release Date"),
                        React.createElement("span", { className: "font-semibold" }, ((_o = version.data) === null || _o === void 0 ? void 0 : _o.releaseDate) ? new Date(version.data.releaseDate).toLocaleDateString() : "—")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Platform"),
                        React.createElement("span", { className: "font-semibold" }, (_q = (_p = version.data) === null || _p === void 0 ? void 0 : _p.platform) !== null && _q !== void 0 ? _q : "android")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Status"),
                        React.createElement("span", { className: "font-semibold text-green-600" }, (_s = (_r = version.data) === null || _r === void 0 ? void 0 : _r.status) !== null && _s !== void 0 ? _s : "—")))),
            analytics.data && (React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-green-200 shadow-md" },
                React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" },
                    "Analytics (",
                    analytics.data.period,
                    ")"),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Sessions"),
                        React.createElement("span", { className: "font-semibold" }, (_v = (_u = (_t = analytics.data.analytics) === null || _t === void 0 ? void 0 : _t.sessionCount) === null || _u === void 0 ? void 0 : _u.toLocaleString()) !== null && _v !== void 0 ? _v : "—")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Avg Duration"),
                        React.createElement("span", { className: "font-semibold" }, (_x = (_w = analytics.data.analytics) === null || _w === void 0 ? void 0 : _w.avgSessionDuration) !== null && _x !== void 0 ? _x : "—",
                            "s")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Crash Rate"),
                        React.createElement("span", { className: "font-semibold" }, (_z = (_y = analytics.data.analytics) === null || _y === void 0 ? void 0 : _y.crashRate) !== null && _z !== void 0 ? _z : "—",
                            "%")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Android Users"),
                        React.createElement("span", { className: "font-semibold" }, (_3 = (_2 = (_1 = (_0 = analytics.data.platforms) === null || _0 === void 0 ? void 0 : _0.android) === null || _1 === void 0 ? void 0 : _1.activeUsers) === null || _2 === void 0 ? void 0 : _2.toLocaleString()) !== null && _3 !== void 0 ? _3 : "—",
                            " (", (_6 = (_5 = (_4 = analytics.data.platforms) === null || _4 === void 0 ? void 0 : _4.android) === null || _5 === void 0 ? void 0 : _5.percentage) !== null && _6 !== void 0 ? _6 : 0,
                            "%)")))))),
        ((_9 = (_8 = (_7 = version.data) === null || _7 === void 0 ? void 0 : _7.changelog) === null || _8 === void 0 ? void 0 : _8.length) !== null && _9 !== void 0 ? _9 : 0) > 0 && (React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-green-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Changelog"),
            React.createElement("div", { className: "space-y-2" }, version.data.changelog.map(function (entry, idx) {
                var _a;
                return (React.createElement("div", { key: idx, className: "p-3 bg-gray-50 rounded" },
                    React.createElement("p", { className: "text-sm text-gray-900" }, typeof entry === "string" ? entry : (_a = entry.description) !== null && _a !== void 0 ? _a : JSON.stringify(entry))));
            }))))))));
}
exports["default"] = AndroidApp;
