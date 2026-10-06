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
exports.MobileResponsiveness = void 0;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
/**
 * Mobile & Responsive Design Page (Phase 5.3)
 *
 * Mobile app and responsive design management including:
 * - Device registration
 * - Data sync management
 * - Push notifications
 * - Mobile-optimized dashboard
 */
function MobileResponsiveness() {
    var _this = this;
    var _a = react_1.useState(false), syncInProgress = _a[0], setSyncInProgress = _a[1];
    var mobileData = react_query_1.useQuery({
        queryKey: ['mobileOptimizedDashboard'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, trpc_1.trpc.mobileResponsive.getMobileOptimizedDashboard.query()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); }
    }).data;
    var handleSync = function () { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSyncInProgress(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, trpc_1.trpc.mobileResponsive.getSyncData.query({
                            lastSyncTime: new Date().toISOString(),
                            entities: ['invoices', 'clients', 'payments']
                        })];
                case 2:
                    result = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setSyncInProgress(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement("div", { className: "p-8 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto" },
            react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-8" },
                react_1["default"].createElement(lucide_react_1.Smartphone, { className: "w-8 h-8 text-cyan-600" }),
                react_1["default"].createElement("h1", { className: "text-3xl font-bold text-slate-900" }, "Mobile & Responsive Design")),
            mobileData && (react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" }, mobileData.cards.map(function (card, idx) {
                var _a;
                return (react_1["default"].createElement("div", { key: idx, className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200" },
                    react_1["default"].createElement("p", { className: "text-sm font-medium text-slate-600 mb-2" }, card.title),
                    react_1["default"].createElement("div", { className: "flex items-baseline justify-between" },
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-slate-900" }, card.value),
                        react_1["default"].createElement("span", { className: "text-xs font-semibold " + (card.trend === 'up' || ((_a = card.trend) === null || _a === void 0 ? void 0 : _a.startsWith('+'))
                                ? 'text-red-600'
                                : 'text-green-600') }, card.trend))));
            }))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-6" },
                    react_1["default"].createElement(lucide_react_1.Smartphone, { className: "w-5 h-5 text-cyan-600" }),
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-slate-900" }, "Device Management")),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "p-4 bg-slate-50 rounded-lg border border-slate-200" },
                        react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("h3", { className: "font-semibold text-slate-900" }, "iPhone 15 Pro"),
                                react_1["default"].createElement("p", { className: "text-sm text-slate-500" }, "iOS 17.2 \u2022 Last sync: 2 mins ago")),
                            react_1["default"].createElement("span", { className: "inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded" }, "ACTIVE")),
                        react_1["default"].createElement("button", { className: "text-sm text-cyan-600 hover:text-cyan-700 font-medium" }, "View sync details")),
                    react_1["default"].createElement("div", { className: "p-4 bg-slate-50 rounded-lg border border-slate-200" },
                        react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("h3", { className: "font-semibold text-slate-900" }, "Samsung Galaxy Tab"),
                                react_1["default"].createElement("p", { className: "text-sm text-slate-500" }, "Android 14 \u2022 Last sync: 1 hour ago")),
                            react_1["default"].createElement("span", { className: "inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded" }, "SYNCED")),
                        react_1["default"].createElement("button", { className: "text-sm text-cyan-600 hover:text-cyan-700 font-medium" }, "View sync details"))),
                react_1["default"].createElement("button", { className: "mt-6 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition text-sm font-medium" }, "Register New Device")),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-6" },
                        react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "w-5 h-5 text-amber-600" }),
                        react_1["default"].createElement("h2", { className: "text-xl font-semibold text-slate-900" }, "Data Synchronization")),
                    react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement("div", { className: "flex items-center justify-between p-3 bg-slate-50 rounded" },
                            react_1["default"].createElement("span", { className: "text-sm font-medium text-slate-700" }, "Invoices"),
                            react_1["default"].createElement("span", { className: "text-sm font-semibold text-slate-900" }, "342 synced")),
                        react_1["default"].createElement("div", { className: "flex items-center justify-between p-3 bg-slate-50 rounded" },
                            react_1["default"].createElement("span", { className: "text-sm font-medium text-slate-700" }, "Clients"),
                            react_1["default"].createElement("span", { className: "text-sm font-semibold text-slate-900" }, "89 synced")),
                        react_1["default"].createElement("div", { className: "flex items-center justify-between p-3 bg-slate-50 rounded" },
                            react_1["default"].createElement("span", { className: "text-sm font-medium text-slate-700" }, "Payments"),
                            react_1["default"].createElement("span", { className: "text-sm font-semibold text-slate-900" }, "156 synced")),
                        react_1["default"].createElement("button", { onClick: handleSync, disabled: syncInProgress, className: "w-full mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium disabled:opacity-50" }, syncInProgress ? 'Syncing...' : 'Force Sync Now'))),
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-6" },
                        react_1["default"].createElement(lucide_react_1.Send, { className: "w-5 h-5 text-purple-600" }),
                        react_1["default"].createElement("h2", { className: "text-xl font-semibold text-slate-900" }, "Push Notifications")),
                    react_1["default"].createElement("div", { className: "space-y-3" },
                        react_1["default"].createElement("label", { className: "flex items-center gap-3 p-3 bg-slate-50 rounded cursor-pointer hover:bg-slate-100 transition" },
                            react_1["default"].createElement("input", { type: "checkbox", defaultChecked: true, className: "w-4 h-4 text-purple-600 rounded" }),
                            react_1["default"].createElement("span", { className: "text-sm font-medium text-slate-700" }, "Invoice Approvals")),
                        react_1["default"].createElement("label", { className: "flex items-center gap-3 p-3 bg-slate-50 rounded cursor-pointer hover:bg-slate-100 transition" },
                            react_1["default"].createElement("input", { type: "checkbox", defaultChecked: true, className: "w-4 h-4 text-purple-600 rounded" }),
                            react_1["default"].createElement("span", { className: "text-sm font-medium text-slate-700" }, "Critical Alerts")),
                        react_1["default"].createElement("label", { className: "flex items-center gap-3 p-3 bg-slate-50 rounded cursor-pointer hover:bg-slate-100 transition" },
                            react_1["default"].createElement("input", { type: "checkbox", className: "w-4 h-4 text-purple-600 rounded" }),
                            react_1["default"].createElement("span", { className: "text-sm font-medium text-slate-700" }, "Daily Messages")),
                        react_1["default"].createElement("button", { className: "w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium" }, "Save Settings")))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200 mt-8" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-4" },
                    react_1["default"].createElement(lucide_react_1.Zap, { className: "w-5 h-5 text-cyan-600" }),
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-slate-900" }, "Progressive Web App")),
                react_1["default"].createElement("p", { className: "text-sm text-slate-600 mb-4" }, "The app can be installed locally and works offline"),
                react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" },
                    react_1["default"].createElement("div", { className: "p-4 bg-slate-50 rounded text-center" },
                        react_1["default"].createElement("p", { className: "text-xs text-slate-600 mb-1" }, "Installation"),
                        react_1["default"].createElement("p", { className: "text-sm font-semibold text-slate-900" }, "Ready")),
                    react_1["default"].createElement("div", { className: "p-4 bg-slate-50 rounded text-center" },
                        react_1["default"].createElement("p", { className: "text-xs text-slate-600 mb-1" }, "Offline Mode"),
                        react_1["default"].createElement("p", { className: "text-sm font-semibold text-slate-900" }, "Enabled")),
                    react_1["default"].createElement("div", { className: "p-4 bg-slate-50 rounded text-center" },
                        react_1["default"].createElement("p", { className: "text-xs text-slate-600 mb-1" }, "Cache Status"),
                        react_1["default"].createElement("p", { className: "text-sm font-semibold text-slate-900" }, "Updated")))))));
}
exports.MobileResponsiveness = MobileResponsiveness;
exports["default"] = MobileResponsiveness;
