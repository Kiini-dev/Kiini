"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.SecurityCompliance = void 0;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var trpc_1 = require("../utils/trpc");
var lucide_react_1 = require("lucide-react");
/**
 * Security & Compliance Page (Phase 5.2)
 *
 * Dashboard for security management and compliance including:
 * - Security score and metrics
 * - Compliance reporting
 * - 2FA management
 * - Data privacy settings
 * - Security audits
 */
function SecurityCompliance() {
    var _this = this;
    var _a = react_1.useState('full'), selectedScope = _a[0], setSelectedScope = _a[1];
    var dashboard = react_query_1.useQuery({
        queryKey: ['securityDashboard'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, trpc_1.trpc.securityCompliance.getSecurityDashboard.query()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); }
    }).data;
    var compliance = react_query_1.useQuery({
        queryKey: ['complianceReport'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, trpc_1.trpc.securityCompliance.getComplianceReport.query()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); }
    }).data;
    return (react_1["default"].createElement("div", { className: "p-8 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto" },
            react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-8" },
                react_1["default"].createElement(lucide_react_1.Shield, { className: "w-8 h-8 text-blue-600" }),
                react_1["default"].createElement("h1", { className: "text-3xl font-bold text-slate-900" }, "Security & Compliance")),
            dashboard && (react_1["default"].createElement("div", { className: "bg-white p-8 rounded-lg shadow-sm border border-slate-200 mb-8" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-slate-600 mb-2" }, "Overall Security Score"),
                        react_1["default"].createElement("div", { className: "flex items-baseline gap-2" },
                            react_1["default"].createElement("span", { className: "text-5xl font-bold text-blue-600" }, dashboard.overallSecureScore),
                            react_1["default"].createElement("span", { className: "text-slate-500" }, "/100"))),
                    react_1["default"].createElement("div", { className: "text-right space-y-2" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5 text-amber-500" }),
                            react_1["default"].createElement("span", { className: "text-sm" },
                                react_1["default"].createElement("strong", null, dashboard.summary.vulnerabilities),
                                " vulnerabilities")),
                        react_1["default"].createElement("div", { className: "text-sm" },
                            react_1["default"].createElement("strong", null,
                                (dashboard.summary.encryptionCoverage).toFixed(1),
                                "%"),
                            " encryption coverage"),
                        react_1["default"].createElement("div", { className: "text-sm" },
                            react_1["default"].createElement("strong", null,
                                (dashboard.summary.twoFactorAdoption).toFixed(1),
                                "%"),
                            " 2FA adoption"))),
                react_1["default"].createElement("div", { className: "mt-6 pt-6 border-t border-slate-200" },
                    react_1["default"].createElement("h3", { className: "font-semibold text-slate-900 mb-4" }, "Compliance Status"),
                    react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" }, Object.entries(dashboard.complianceChecklist).map(function (_a) {
                        var standard = _a[0], status = _a[1];
                        return (react_1["default"].createElement("div", { key: standard, className: "flex items-center gap-2 p-3 bg-slate-50 rounded" },
                            status === 'compliant' ? (react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "w-5 h-5 text-green-600 flex-shrink-0" })) : (react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5 text-red-600 flex-shrink-0" })),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm font-medium text-slate-900" }, standard.toUpperCase()),
                                react_1["default"].createElement("p", { className: "text-xs text-slate-500" }, status))));
                    }))))),
            compliance && (react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-4" },
                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "w-5 h-5 text-green-600" }),
                        react_1["default"].createElement("h2", { className: "text-lg font-semibold text-slate-900" }, "Compliance Score")),
                    react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("div", { className: "flex justify-between mb-2" },
                                react_1["default"].createElement("span", { className: "text-sm font-medium text-slate-700" }, "Overall Compliance"),
                                react_1["default"].createElement("span", { className: "text-sm font-bold text-green-600" },
                                    compliance.complianceScore,
                                    "%")),
                            react_1["default"].createElement("div", { className: "w-full bg-slate-200 rounded-full h-2" },
                                react_1["default"].createElement("div", { className: "bg-green-600 h-2 rounded-full", style: { width: compliance.complianceScore + "%" } }))),
                        react_1["default"].createElement("div", { className: "pt-4 border-t border-slate-200" },
                            react_1["default"].createElement("p", { className: "text-sm text-slate-600" },
                                react_1["default"].createElement("strong", null, compliance.requirements.filter(function (r) { return r.status === 'compliant'; }).length),
                                " of",
                                ' ',
                                react_1["default"].createElement("strong", null, compliance.requirements.length),
                                " requirements met")))),
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-4" },
                        react_1["default"].createElement(lucide_react_1.Lock, { className: "w-5 h-5 text-purple-600" }),
                        react_1["default"].createElement("h2", { className: "text-lg font-semibold text-slate-900" }, "Two-Factor Authentication")),
                    react_1["default"].createElement("div", { className: "space-y-3" },
                        react_1["default"].createElement("p", { className: "text-sm text-slate-600" },
                            "Current adoption: ",
                            ((dashboard === null || dashboard === void 0 ? void 0 : dashboard.summary.twoFactorAdoption) || 0).toFixed(1),
                            "%"),
                        react_1["default"].createElement("button", { className: "w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium" }, "Enable 2FA"),
                        react_1["default"].createElement("div", { className: "text-xs text-slate-500 bg-slate-50 p-3 rounded" }, "2FA protects accounts with authentication through authenticator app, SMS, or email"))))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200 mt-8" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-4" },
                    react_1["default"].createElement(lucide_react_1.Shield, { className: "w-5 h-5 text-blue-600" }),
                    react_1["default"].createElement("h2", { className: "text-lg font-semibold text-slate-900" }, "Security Audit")),
                react_1["default"].createElement("p", { className: "text-sm text-slate-600 mb-4" }, "Select audit scope and run full security assessment"),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4" }, ['full', 'permissions', 'encryption', 'access_logs'].map(function (scope) { return (react_1["default"].createElement("button", { key: scope, onClick: function () { return setSelectedScope(scope); }, className: "px-3 py-2 rounded text-sm font-medium transition " + (selectedScope === scope
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200') }, scope.split('_').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' '))); })),
                react_1["default"].createElement("button", { className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium" },
                    "Run Audit (",
                    selectedScope,
                    ")")))));
}
exports.SecurityCompliance = SecurityCompliance;
