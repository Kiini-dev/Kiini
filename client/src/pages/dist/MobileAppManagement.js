"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
function MobileAppManagement() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    var healthQuery = trpc_1.trpc.mobileApps.monitorAppHealth.useQuery({});
    var iosQuery = trpc_1.trpc.mobileApps.getIosAppMetrics.useQuery({});
    var androidQuery = trpc_1.trpc.mobileApps.getAndroidAppMetrics.useQuery({});
    var health = healthQuery.data;
    var ios = iosQuery.data;
    var android = androidQuery.data;
    var isLoading = healthQuery.isLoading || iosQuery.isLoading || androidQuery.isLoading;
    var error = healthQuery.error || iosQuery.error || androidQuery.error;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Mobile App Management", icon: React.createElement(lucide_react_1.Smartphone, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Mobile" },
            { label: "App Management" },
        ] },
        isLoading && (React.createElement("div", { className: "flex justify-center py-8" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))),
        error && (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
            "Error: ",
            error.message)),
        !isLoading && !error && (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "App Status"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_b = (_a = health === null || health === void 0 ? void 0 : health.status) !== null && _a !== void 0 ? _a : health === null || health === void 0 ? void 0 : health.overallStatus) !== null && _b !== void 0 ? _b : "—"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Active Users"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_d = (_c = health === null || health === void 0 ? void 0 : health.activeUsers) !== null && _c !== void 0 ? _c : health === null || health === void 0 ? void 0 : health.totalUsers) !== null && _d !== void 0 ? _d : 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4" },
                        React.createElement("p", { className: "text-sm text-gray-600" }, "Crash Rate"),
                        React.createElement("p", { className: "text-2xl font-bold" }, (_e = health === null || health === void 0 ? void 0 : health.crashRate) !== null && _e !== void 0 ? _e : "—",
                            "%")))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "iOS Metrics")),
                    React.createElement(card_1.CardContent, null, ios ? (React.createElement("div", { className: "space-y-2 text-sm" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-gray-600" }, "Active Users"),
                            React.createElement("span", { className: "font-medium" }, (_g = (_f = ios.activeUsers) !== null && _f !== void 0 ? _f : ios.users) !== null && _g !== void 0 ? _g : 0)),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-gray-600" }, "Downloads"),
                            React.createElement("span", { className: "font-medium" }, (_h = ios.downloads) !== null && _h !== void 0 ? _h : 0)),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-gray-600" }, "Rating"),
                            React.createElement("span", { className: "font-medium" }, (_k = (_j = ios.rating) !== null && _j !== void 0 ? _j : ios.appRating) !== null && _k !== void 0 ? _k : "—")),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-gray-600" }, "Version"),
                            React.createElement("span", { className: "font-medium" }, (_m = (_l = ios.version) !== null && _l !== void 0 ? _l : ios.currentVersion) !== null && _m !== void 0 ? _m : "—")))) : (React.createElement("p", { className: "text-center text-gray-500 py-4" }, "No iOS data available.")))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Android Metrics")),
                    React.createElement(card_1.CardContent, null, android ? (React.createElement("div", { className: "space-y-2 text-sm" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-gray-600" }, "Active Users"),
                            React.createElement("span", { className: "font-medium" }, (_p = (_o = android.activeUsers) !== null && _o !== void 0 ? _o : android.users) !== null && _p !== void 0 ? _p : 0)),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-gray-600" }, "Downloads"),
                            React.createElement("span", { className: "font-medium" }, (_q = android.downloads) !== null && _q !== void 0 ? _q : 0)),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-gray-600" }, "Rating"),
                            React.createElement("span", { className: "font-medium" }, (_s = (_r = android.rating) !== null && _r !== void 0 ? _r : android.appRating) !== null && _s !== void 0 ? _s : "—")),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-gray-600" }, "Version"),
                            React.createElement("span", { className: "font-medium" }, (_u = (_t = android.version) !== null && _t !== void 0 ? _t : android.currentVersion) !== null && _u !== void 0 ? _u : "—")))) : (React.createElement("p", { className: "text-center text-gray-500 py-4" }, "No Android data available.")))))))));
}
exports["default"] = MobileAppManagement;
