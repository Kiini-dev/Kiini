"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
function IosApp() {
    var _a, _b, _c;
    var versionQuery = trpc_1.trpc.mobileApp.getAppVersion.useQuery({ platform: "ios" });
    var analyticsQuery = trpc_1.trpc.mobileApp.getMobileAnalytics.useQuery({ period: "monthly" });
    var flagsQuery = trpc_1.trpc.mobileApp.getMobileFeatureFlags.useQuery({ platform: "ios" });
    var version = versionQuery.data ? JSON.parse(JSON.stringify(versionQuery.data)) : null;
    var analytics = analyticsQuery.data ? JSON.parse(JSON.stringify(analyticsQuery.data)) : null;
    var flags = flagsQuery.data ? JSON.parse(JSON.stringify(flagsQuery.data)) : null;
    var iosStats = ((_a = analytics === null || analytics === void 0 ? void 0 : analytics.platforms) === null || _a === void 0 ? void 0 : _a.ios) || {};
    var analyticsData = (analytics === null || analytics === void 0 ? void 0 : analytics.analytics) || {};
    var featureFlags = (flags === null || flags === void 0 ? void 0 : flags.flags) || {};
    var flagEntries = Object.entries(featureFlags);
    var chartData = [
        { name: "Active Users", value: iosStats.activeUsers || 0 },
        { name: "Sessions", value: analyticsData.sessionCount || 0 },
        { name: "Crash Rate", value: (analyticsData.crashRate || 0) * 100 },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "iOS App", icon: React.createElement(lucide_react_1.Smartphone, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Mobile" }, { label: "iOS App" }] },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-4" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Current Version"),
                    React.createElement("p", { className: "text-2xl font-bold" }, (version === null || version === void 0 ? void 0 : version.currentVersion) || "—"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-4" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Active Users (iOS)"),
                    React.createElement("p", { className: "text-2xl font-bold" }, (_b = iosStats.activeUsers) !== null && _b !== void 0 ? _b : 0))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-4" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Sessions"),
                    React.createElement("p", { className: "text-2xl font-bold" }, (_c = analyticsData.sessionCount) !== null && _c !== void 0 ? _c : 0))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-4" },
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Status"),
                    React.createElement(badge_1.Badge, { variant: (version === null || version === void 0 ? void 0 : version.status) === "available" || (version === null || version === void 0 ? void 0 : version.status) === "active" ? "default" : "secondary" }, (version === null || version === void 0 ? void 0 : version.status) || "Unknown")))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "iOS Analytics Overview")),
            React.createElement(card_1.CardContent, null,
                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                    React.createElement(recharts_1.BarChart, { data: chartData },
                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(recharts_1.XAxis, { dataKey: "name" }),
                        React.createElement(recharts_1.YAxis, null),
                        React.createElement(recharts_1.Tooltip, null),
                        React.createElement(recharts_1.Bar, { dataKey: "value", fill: "#3b82f6" }))))),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Version Details")),
                React.createElement(card_1.CardContent, { className: "space-y-3" },
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Current Version"),
                        React.createElement("span", { className: "font-semibold" }, (version === null || version === void 0 ? void 0 : version.currentVersion) || "—")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Minimum Version"),
                        React.createElement("span", { className: "font-semibold" }, (version === null || version === void 0 ? void 0 : version.minimumVersion) || "—")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Latest Version"),
                        React.createElement("span", { className: "font-semibold" }, (version === null || version === void 0 ? void 0 : version.latestVersion) || "—")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Release Date"),
                        React.createElement("span", { className: "font-semibold" }, (version === null || version === void 0 ? void 0 : version.releaseDate) ? new Date(version.releaseDate).toLocaleDateString() : "—")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Feature Flags")),
                React.createElement(card_1.CardContent, null, flagEntries.length > 0 ? (React.createElement("div", { className: "space-y-3" }, flagEntries.map(function (_a) {
                    var key = _a[0], enabled = _a[1];
                    return (React.createElement("div", { key: key, className: "flex justify-between items-center" },
                        React.createElement("span", { className: "text-muted-foreground" }, key),
                        React.createElement(badge_1.Badge, { variant: enabled ? "default" : "secondary" }, enabled ? "Enabled" : "Disabled")));
                }))) : (React.createElement("p", { className: "text-muted-foreground text-center py-4" }, "No feature flags configured"))))),
        (version === null || version === void 0 ? void 0 : version.changelog) && version.changelog.length > 0 && (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Changelog")),
            React.createElement(card_1.CardContent, null,
                React.createElement("ul", { className: "list-disc list-inside space-y-1" }, version.changelog.map(function (entry, i) { return (React.createElement("li", { key: i, className: "text-sm" }, entry)); })))))));
}
exports["default"] = IosApp;
