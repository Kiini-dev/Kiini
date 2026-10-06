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
exports.AIInsights = void 0;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
/**
 * AI & Intelligent Insights Page (Phase 5.1)
 *
 * Dashboard for AI-powered insights including:
 * - Top insights and predictions
 * - Predictive analytics
 * - Smart recommendations
 * - Anomaly detection
 * - ML model performance
 */
function AIInsights() {
    var _this = this;
    var dashboard = react_query_1.useQuery({
        queryKey: ['aiInsights'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, trpc_1.trpc.aiInsights.getAiInsightsDashboard.query()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); }
    }).data;
    var predictions = react_query_1.useQuery({
        queryKey: ['predictiveAnalytics'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, trpc_1.trpc.aiInsights.getPredictiveAnalytics.query()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); }
    }).data;
    var recommendations = react_query_1.useQuery({
        queryKey: ['smartRecommendations'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, trpc_1.trpc.aiInsights.getSmartRecommendations.query()];
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
                react_1["default"].createElement(lucide_react_1.Brain, { className: "w-8 h-8 text-purple-600" }),
                react_1["default"].createElement("h1", { className: "text-3xl font-bold text-slate-900" }, "AI & Intelligent Insights")),
            dashboard && (react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" }, dashboard.topInsights.map(function (insight, idx) { return (react_1["default"].createElement("div", { key: idx, className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition" },
                react_1["default"].createElement("h3", { className: "font-semibold text-slate-900 mb-2" }, insight.insight),
                react_1["default"].createElement("div", { className: "flex items-baseline gap-2 mb-3" },
                    react_1["default"].createElement("span", { className: "text-2xl font-bold text-purple-600" },
                        (insight.confidence * 100).toFixed(0),
                        "%"),
                    react_1["default"].createElement("span", { className: "text-sm text-slate-500" }, "confidence")),
                react_1["default"].createElement("span", { className: "inline-block px-3 py-1 rounded text-sm font-medium " + (insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700') },
                    insight.impact,
                    " impact"))); }))),
            predictions && (react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-4" },
                    react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5 text-blue-600" }),
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-slate-900" }, "Revenue Forecast (Next 4 Quarters)")),
                react_1["default"].createElement("div", { className: "space-y-3" }, predictions.forecasts.map(function (forecast, idx) { return (react_1["default"].createElement("div", { key: idx, className: "flex items-center justify-between p-3 bg-slate-50 rounded" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "font-medium text-slate-900" }, forecast.period),
                        react_1["default"].createElement("p", { className: "text-sm text-slate-500" },
                            "Forecast: $",
                            forecast.predicted.toLocaleString())),
                    react_1["default"].createElement("div", { className: "text-right" },
                        react_1["default"].createElement("p", { className: "text-sm text-slate-600" },
                            "Range: $",
                            forecast.lower.toLocaleString(),
                            " - $",
                            forecast.upper.toLocaleString()),
                        react_1["default"].createElement("p", { className: "text-xs text-slate-500" }, "95% confidence")))); })))),
            recommendations && (react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-slate-200" },
                react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-4" },
                    react_1["default"].createElement(lucide_react_1.Zap, { className: "w-5 h-5 text-amber-600" }),
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-slate-900" }, "Smart Recommendations")),
                react_1["default"].createElement("div", { className: "space-y-4" }, recommendations.recommendations.map(function (rec, idx) { return (react_1["default"].createElement("div", { key: idx, className: "p-4 border border-slate-200 rounded-lg hover:border-amber-300 transition" },
                    react_1["default"].createElement("div", { className: "flex justify-between items-start mb-2" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-slate-900" }, rec.title),
                        react_1["default"].createElement("span", { className: "px-2 py-1 text-xs font-semibold rounded " + (rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700') }, rec.priority.toUpperCase())),
                    react_1["default"].createElement("p", { className: "text-sm text-slate-600 mb-3" }, rec.description),
                    react_1["default"].createElement("div", { className: "flex justify-between text-xs text-slate-500" },
                        react_1["default"].createElement("span", null,
                            "Success: ",
                            (rec.successProbability * 100).toFixed(0),
                            "%"),
                        react_1["default"].createElement("span", null,
                            "Est. time: ",
                            rec.implementationWeeks,
                            " weeks")))); })))))));
}
exports.AIInsights = AIInsights;
exports["default"] = AIInsights;
