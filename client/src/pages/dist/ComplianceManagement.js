"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function ComplianceManagement() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    var _w = react_1.useState("GDPR"), activeStandard = _w[0], setActiveStandard = _w[1];
    var dashboard = trpc_1.trpc.securityCompliance.getSecurityDashboard.useQuery({});
    var report = trpc_1.trpc.securityCompliance.getComplianceReport.useQuery({ standard: activeStandard });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Compliance Management", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Security" }, { label: "Compliance Management" }] }, dashboard.isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600" }))) : dashboard.error ? (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, "Failed to load compliance data")) : (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
            React.createElement("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-green-500" },
                React.createElement("p", { className: "text-sm text-slate-600" }, "Security Score"),
                React.createElement("p", { className: "text-2xl font-bold text-slate-900" }, (_b = (_a = dashboard.data) === null || _a === void 0 ? void 0 : _a.overallSecureScore) !== null && _b !== void 0 ? _b : 0,
                    "%")),
            React.createElement("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-red-500" },
                React.createElement("p", { className: "text-sm text-slate-600" }, "Vulnerabilities"),
                React.createElement("p", { className: "text-2xl font-bold text-slate-900" }, (_e = (_d = (_c = dashboard.data) === null || _c === void 0 ? void 0 : _c.summary) === null || _d === void 0 ? void 0 : _d.vulnerabilities) !== null && _e !== void 0 ? _e : 0)),
            React.createElement("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-blue-500" },
                React.createElement("p", { className: "text-sm text-slate-600" }, "Compliance"),
                React.createElement("p", { className: "text-2xl font-bold text-slate-900" }, (_h = (_g = (_f = dashboard.data) === null || _f === void 0 ? void 0 : _f.summary) === null || _g === void 0 ? void 0 : _g.complianceStatus) !== null && _h !== void 0 ? _h : "—")),
            React.createElement("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-purple-500" },
                React.createElement("p", { className: "text-sm text-slate-600" }, "2FA Adoption"),
                React.createElement("p", { className: "text-2xl font-bold text-slate-900" }, (_l = (_k = (_j = dashboard.data) === null || _j === void 0 ? void 0 : _j.summary) === null || _k === void 0 ? void 0 : _k.twoFactorAdoption) !== null && _l !== void 0 ? _l : 0,
                    "%"))),
        React.createElement("div", { className: "flex gap-2 flex-wrap" }, ["GDPR", "HIPAA", "SOC2", "ISO27001"].map(function (std) { return (React.createElement("button", { key: std, onClick: function () { return setActiveStandard(std); }, className: "px-4 py-2 rounded-lg font-medium transition " + (activeStandard === std ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-slate-100 shadow") }, std)); })),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            React.createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                React.createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" },
                    activeStandard,
                    " Report"),
                report.isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-blue-600" }))) : report.error ? (React.createElement("p", { className: "text-red-600" }, "Failed to load report")) : (React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "p-3 bg-blue-50 rounded-lg" },
                        React.createElement("p", { className: "text-sm font-medium text-slate-700" }, "Status"),
                        React.createElement("p", { className: "text-lg font-bold flex items-center gap-2 mt-1" }, ((_m = report.data) === null || _m === void 0 ? void 0 : _m.status) === "compliant" ? (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.CheckCircle, { size: 20, className: "text-green-600" }),
                            React.createElement("span", { className: "text-green-600" }, "Compliant"))) : (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.XCircle, { size: 20, className: "text-red-600" }),
                            React.createElement("span", { className: "text-red-600" }, (_o = report.data) === null || _o === void 0 ? void 0 : _o.status))))),
                    React.createElement("div", { className: "p-3 bg-slate-50 rounded-lg" },
                        React.createElement("p", { className: "text-sm font-medium text-slate-700" }, "Score"),
                        React.createElement("p", { className: "text-2xl font-bold text-slate-900" }, (_q = (_p = report.data) === null || _p === void 0 ? void 0 : _p.score) !== null && _q !== void 0 ? _q : 0,
                            "%"))))),
            React.createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                React.createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" }, "Compliance Checklist"),
                React.createElement("div", { className: "space-y-2" }, Object.entries((_s = (_r = dashboard.data) === null || _r === void 0 ? void 0 : _r.complianceChecklist) !== null && _s !== void 0 ? _s : {}).map(function (_a) {
                    var _b;
                    var key = _a[0], val = _a[1];
                    return (React.createElement("div", { key: key, className: "flex items-center justify-between p-3 bg-slate-50 rounded-lg" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-medium text-slate-900" }, key),
                            React.createElement("p", { className: "text-sm text-slate-600" },
                                "Last audit: ", (_b = val.lastAudit) !== null && _b !== void 0 ? _b : "—")),
                        React.createElement("span", { className: "px-3 py-1 rounded text-sm font-medium " + (val.compliant ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700") }, val.compliant ? "Compliant" : "Review Needed")));
                })))),
        ((_v = (_u = (_t = report.data) === null || _t === void 0 ? void 0 : _t.requirements) === null || _u === void 0 ? void 0 : _u.length) !== null && _v !== void 0 ? _v : 0) > 0 && (React.createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            React.createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" },
                activeStandard,
                " Requirements"),
            React.createElement("div", { className: "space-y-2" }, report.data.requirements.map(function (req, idx) {
                var _a, _b;
                return (React.createElement("div", { key: idx, className: "flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100" },
                    React.createElement("p", { className: "font-medium text-slate-900" }, typeof req === "string" ? req : (_b = (_a = req.title) !== null && _a !== void 0 ? _a : req.name) !== null && _b !== void 0 ? _b : JSON.stringify(req))));
            }))))))));
}
exports["default"] = ComplianceManagement;
