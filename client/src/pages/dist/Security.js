"use strict";
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
function Security() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    var _u = react_1.useState("full"), auditScope = _u[0], setAuditScope = _u[1];
    var dashboardQuery = trpc_1.trpc.securityCompliance.getSecurityDashboard.useQuery({});
    var eventsQuery = trpc_1.trpc.advancedSecurity.listSecurityEvents.useQuery({});
    var auditQuery = trpc_1.trpc.securityCompliance.performSecurityAudit.useQuery({ scope: auditScope }, { enabled: false });
    var handleRunAudit = function () {
        auditQuery.refetch().then(function () {
            sonner_1.toast.success("Security audit completed");
        })["catch"](function (e) { return sonner_1.toast.error(e.message); });
    };
    if (dashboardQuery.isLoading || eventsQuery.isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Security", description: "Security dashboard, events, and audit", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Settings", href: "/settings" },
                { label: "Security" },
            ] },
            React.createElement("div", { className: "flex justify-center py-16" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    if (dashboardQuery.error) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Security", description: "Security dashboard, events, and audit", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Settings", href: "/settings" },
                { label: "Security" },
            ] },
            React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
                "Error: ",
                dashboardQuery.error.message)));
    }
    var dashboard = (_a = dashboardQuery.data) !== null && _a !== void 0 ? _a : {};
    var summary = (_b = dashboard.summary) !== null && _b !== void 0 ? _b : {};
    var recentActivity = (_c = dashboard.recentActivity) !== null && _c !== void 0 ? _c : [];
    var events = (_e = (_d = eventsQuery.data) === null || _d === void 0 ? void 0 : _d.events) !== null && _e !== void 0 ? _e : [];
    var auditData = (_f = auditQuery.data) !== null && _f !== void 0 ? _f : null;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Security", description: "Security dashboard, events, and audit", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Settings", href: "/settings" },
            { label: "Security" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Security Score")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-3xl font-bold" }, (_g = dashboard.overallSecureScore) !== null && _g !== void 0 ? _g : 0))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Vulnerabilities")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-3xl font-bold" }, (_h = summary.vulnerabilities) !== null && _h !== void 0 ? _h : 0),
                        React.createElement("p", { className: "text-xs text-red-600" }, (_j = summary.criticalVulnerabilities) !== null && _j !== void 0 ? _j : 0,
                            " critical"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "Compliance")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(badge_1.Badge, { variant: summary.complianceStatus === "compliant" ? "default" : "secondary" }, (_k = summary.complianceStatus) !== null && _k !== void 0 ? _k : "—"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-muted-foreground" }, "2FA Adoption")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-3xl font-bold" }, (_l = summary.twoFactorAdoption) !== null && _l !== void 0 ? _l : 0,
                            "%")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5" }),
                        "Security Audit")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("select", { className: "border rounded px-3 py-2 text-sm", value: auditScope, onChange: function (e) { return setAuditScope(e.target.value); } },
                            React.createElement("option", { value: "full" }, "Full Audit"),
                            React.createElement("option", { value: "permissions" }, "Permissions"),
                            React.createElement("option", { value: "encryption" }, "Encryption"),
                            React.createElement("option", { value: "access_logs" }, "Access Logs")),
                        React.createElement(button_1.Button, { onClick: handleRunAudit, disabled: auditQuery.isFetching }, auditQuery.isFetching ? "Running..." : "Run Audit")),
                    auditData && (React.createElement("div", { className: "space-y-2" },
                        React.createElement("div", { className: "flex gap-4 text-sm" },
                            React.createElement("span", null,
                                "ID: ",
                                React.createElement("strong", null, (_m = auditData.auditId) !== null && _m !== void 0 ? _m : "—")),
                            React.createElement("span", null,
                                "Findings: ",
                                React.createElement("strong", null, (_o = auditData.findingsCount) !== null && _o !== void 0 ? _o : 0)),
                            React.createElement("span", null,
                                "Critical: ",
                                React.createElement("strong", { className: "text-red-600" }, (_p = auditData.criticalCount) !== null && _p !== void 0 ? _p : 0)),
                            React.createElement(badge_1.Badge, null, (_q = auditData.status) !== null && _q !== void 0 ? _q : "—")),
                        ((_r = auditData.findings) !== null && _r !== void 0 ? _r : []).length > 0 && (React.createElement("div", { className: "border rounded-lg divide-y max-h-60 overflow-auto" }, ((_s = auditData.findings) !== null && _s !== void 0 ? _s : []).map(function (f) {
                            var _a, _b, _c;
                            return (React.createElement("div", { key: f.id, className: "p-3 text-sm flex items-start gap-2" },
                                React.createElement(badge_1.Badge, { variant: f.severity === "critical" ? "destructive" : "secondary", className: "text-xs" }, (_a = f.severity) !== null && _a !== void 0 ? _a : "—"),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium" }, (_b = f.title) !== null && _b !== void 0 ? _b : "—"),
                                    React.createElement("p", { className: "text-muted-foreground text-xs" }, (_c = f.description) !== null && _c !== void 0 ? _c : ""))));
                        }))),
                        ((_t = auditData.findings) !== null && _t !== void 0 ? _t : []).length === 0 && (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No findings.")))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Activity, { className: "h-5 w-5" }),
                        "Recent Activity")),
                React.createElement(card_1.CardContent, null, recentActivity.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")) : (React.createElement("div", { className: "border rounded-lg divide-y max-h-64 overflow-auto" }, recentActivity.map(function (a) {
                    var _a, _b, _c;
                    return (React.createElement("div", { key: a.id, className: "p-3 flex items-center justify-between text-sm" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, (_a = a.type) !== null && _a !== void 0 ? _a : "—"),
                            React.createElement("span", null, (_b = a.details) !== null && _b !== void 0 ? _b : "—")),
                        React.createElement("span", { className: "text-muted-foreground text-xs" }, (_c = a.severity) !== null && _c !== void 0 ? _c : "—")));
                }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }),
                        "Security Events")),
                React.createElement(card_1.CardContent, null, events.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")) : (React.createElement("div", { className: "border rounded-lg divide-y max-h-72 overflow-auto" }, events.map(function (ev) {
                    var _a, _b, _c;
                    return (React.createElement("div", { key: ev.id, className: "p-3 flex items-center justify-between text-sm" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, (_a = ev.eventType) !== null && _a !== void 0 ? _a : "—"),
                            React.createElement("span", null, (_b = ev.action) !== null && _b !== void 0 ? _b : "—")),
                        React.createElement("div", { className: "flex items-center gap-3 text-xs text-muted-foreground" },
                            React.createElement(badge_1.Badge, { variant: ev.severity === "CRITICAL" ? "destructive" : "secondary", className: "text-xs" }, (_c = ev.severity) !== null && _c !== void 0 ? _c : "—"),
                            React.createElement("span", null, ev.createdAt ? new Date(ev.createdAt).toLocaleString() : "—"))));
                }))))))));
}
exports["default"] = Security;
