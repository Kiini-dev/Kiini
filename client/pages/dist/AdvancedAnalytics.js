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
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var recharts_1 = require("recharts");
function AdvancedAnalytics() {
    var _this = this;
    var _a = react_1.useState('weekly'), timeRange = _a[0], setTimeRange = _a[1];
    var trendData = react_query_1.useQuery({
        queryKey: ['analytics', 'trends', timeRange],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ({
                        trends: [
                            { date: '2026-03-10', value: 142.5, forecast: 145.2 },
                            { date: '2026-03-11', value: 148.3, forecast: 151.8 },
                            { date: '2026-03-12', value: 155.6, forecast: 158.4 },
                            { date: '2026-03-13', value: 162.1, forecast: 164.9 },
                            { date: '2026-03-14', value: 169.8, forecast: 171.5 },
                            { date: '2026-03-15', value: 176.2, forecast: 178.2 },
                            { date: '2026-03-16', value: 182.5, forecast: null },
                        ]
                    })];
            });
        }); }
    }).data;
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
            react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Advanced Analytics"),
            react_1["default"].createElement("select", { value: timeRange, onChange: function (e) { return setTimeRange(e.target.value); }, className: "px-4 py-2 border rounded-lg" },
                react_1["default"].createElement("option", { value: "daily" }, "Daily"),
                react_1["default"].createElement("option", { value: "weekly" }, "Weekly"),
                react_1["default"].createElement("option", { value: "monthly" }, "Monthly"))),
        react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Revenue"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "$142.5K"),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "+6.7% trend")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Expenses"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "$45.3K"),
                react_1["default"].createElement("div", { className: "text-xs text-red-600" }, "+2.1% trend")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Margin"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "68.2%"),
                react_1["default"].createElement("div", { className: "text-xs text-green-600" }, "+1.2% trend")),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Forecasted"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "$178.2K"),
                react_1["default"].createElement("div", { className: "text-xs text-blue-600" }, "12mo insight"))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Trend Analysis & Forecast"),
            trendData && (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                react_1["default"].createElement(recharts_1.LineChart, { data: trendData.trends },
                    react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                    react_1["default"].createElement(recharts_1.XAxis, { dataKey: "date" }),
                    react_1["default"].createElement(recharts_1.YAxis, null),
                    react_1["default"].createElement(recharts_1.Tooltip, null),
                    react_1["default"].createElement(recharts_1.Legend, null),
                    react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "value", stroke: "#3b82f6", name: "Actual" }),
                    react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "forecast", stroke: "#10b981", strokeDasharray: "5 5", name: "Forecast" }))))),
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("h3", { className: "font-semibold mb-2" }, "Anomaly Detection"),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "High severity anomalies:"),
                        react_1["default"].createElement("span", { className: "font-bold text-red-600" }, "2")),
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "Medium severity:"),
                        react_1["default"].createElement("span", { className: "font-bold text-yellow-600" }, "5")),
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "Low severity:"),
                        react_1["default"].createElement("span", { className: "font-bold text-blue-600" }, "12")))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("h3", { className: "font-semibold mb-2" }, "Performance Metrics"),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "KPI Score:"),
                        react_1["default"].createElement("span", { className: "font-bold text-green-600" }, "87.3%")),
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "vs Benchmark:"),
                        react_1["default"].createElement("span", { className: "font-bold text-blue-600" }, "+5.2%")),
                    react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                        react_1["default"].createElement("span", null, "Forecast Accuracy:"),
                        react_1["default"].createElement("span", { className: "font-bold text-purple-600" }, "0.88")))))));
}
exports["default"] = AdvancedAnalytics;
