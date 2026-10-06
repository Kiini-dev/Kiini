"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.FinancialReportsPage = void 0;
var react_1 = require("react");
var trpc_1 = require("@/utils/trpc");
var recharts_1 = require("recharts");
function FinancialReportsPage() {
    var _a, _b, _c, _d, _e, _f, _g;
    var _h = react_1.useState('ytd'), dateRange = _h[0], setDateRange = _h[1]; // ytd, 12m, custom
    var _j = react_1.useState(''), startDate = _j[0], setStartDate = _j[1];
    var _k = react_1.useState(''), endDate = _k[0], setEndDate = _k[1];
    var plQuery = trpc_1.trpc.financialReporting.getPLStatement.useQuery(startDate && endDate ? { startDate: startDate, endDate: endDate } : { startDate: '', endDate: '' }, { enabled: !(!startDate && !endDate) });
    var cashFlowQuery = trpc_1.trpc.financialReporting.getCashFlowProjection.useQuery();
    var arAgingQuery = trpc_1.trpc.financialReporting.getReceivablesAging.useQuery();
    var arSummaryQuery = trpc_1.trpc.financialReporting.getARSummary.useQuery();
    var pl = plQuery.data;
    var cashFlow = cashFlowQuery.data || [];
    var arAging = arAgingQuery.data || [];
    var arSummary = arSummaryQuery.data || { totalOutstanding: 0, topDebtors: [] };
    // Prepare AR aging chart data
    var arChartData = [
        { bucket: '0-30 days', amount: ((_a = arAging[0]) === null || _a === void 0 ? void 0 : _a.amount) || 0 },
        { bucket: '30-60 days', amount: ((_b = arAging[1]) === null || _b === void 0 ? void 0 : _b.amount) || 0 },
        { bucket: '60-90 days', amount: ((_c = arAging[2]) === null || _c === void 0 ? void 0 : _c.amount) || 0 },
        { bucket: '90-180 days', amount: ((_d = arAging[3]) === null || _d === void 0 ? void 0 : _d.amount) || 0 },
        { bucket: '180+ days', amount: ((_e = arAging[4]) === null || _e === void 0 ? void 0 : _e.amount) || 0 },
    ].map(function (item) { return (__assign(__assign({}, item), { amount: item.amount / 100 })); });
    var cashFlowChartData = (cashFlow || []).map(function (cf) { return ({
        month: new Date(cf.month).toLocaleDateString('en-KE', { month: 'short', year: '2-digit' }),
        inflows: cf.inflows / 100,
        outflows: cf.outflows / 100
    }); });
    return (react_1["default"].createElement("div", { className: "space-y-6 p-6" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "Financial Reports"),
            react_1["default"].createElement("p", { className: "text-gray-600" }, "P&L, cash flow, and receivables analysis")),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("div", { className: "mb-6" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Profit & Loss Statement"),
                react_1["default"].createElement("div", { className: "flex gap-2 mb-4" },
                    react_1["default"].createElement("button", { onClick: function () { return setDateRange('ytd'); }, className: "px-4 py-2 rounded " + (dateRange === 'ytd' ? 'bg-blue-500 text-white' : 'bg-gray-200') }, "Year to Date"),
                    react_1["default"].createElement("button", { onClick: function () { return setDateRange('12m'); }, className: "px-4 py-2 rounded " + (dateRange === '12m' ? 'bg-blue-500 text-white' : 'bg-gray-200') }, "Last 12 Months"))),
            pl && (react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "border rounded p-4" },
                        react_1["default"].createElement("div", { className: "text-gray-600 text-sm" }, "Total Revenue"),
                        react_1["default"].createElement("div", { className: "text-3xl font-bold text-green-600" },
                            "Ksh ",
                            (pl.revenue / 100).toLocaleString('en-KE'))),
                    react_1["default"].createElement("div", { className: "border rounded p-4" },
                        react_1["default"].createElement("div", { className: "text-gray-600 text-sm" }, "Total Expenses"),
                        react_1["default"].createElement("div", { className: "text-3xl font-bold text-red-600" },
                            "Ksh ",
                            (pl.expenses / 100).toLocaleString('en-KE'))),
                    react_1["default"].createElement("div", { className: "border rounded p-4 bg-blue-50" },
                        react_1["default"].createElement("div", { className: "text-gray-600 text-sm" }, "Net Profit"),
                        react_1["default"].createElement("div", { className: "text-3xl font-bold " + (pl.netProfit >= 0 ? 'text-green-600' : 'text-red-600') },
                            "Ksh ",
                            (pl.netProfit / 100).toLocaleString('en-KE'))),
                    react_1["default"].createElement("div", { className: "border rounded p-4" },
                        react_1["default"].createElement("div", { className: "text-gray-600 text-sm" }, "Profit Margin"),
                        react_1["default"].createElement("div", { className: "text-2xl font-bold text-gray-900" }, (_f = pl.netMarginPercentage) === null || _f === void 0 ? void 0 :
                            _f.toFixed(1),
                            "%"))),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement("div", { className: "flex justify-between py-2 border-b" },
                        react_1["default"].createElement("span", null, "Revenue"),
                        react_1["default"].createElement("span", { className: "font-semibold text-green-600" },
                            "Ksh ",
                            (pl.revenue / 100).toLocaleString('en-KE'))),
                    react_1["default"].createElement("div", { className: "flex justify-between py-2 border-b" },
                        react_1["default"].createElement("span", null, "COGS"),
                        react_1["default"].createElement("span", null,
                            "Ksh ",
                            (pl.cogs / 100).toLocaleString('en-KE'))),
                    react_1["default"].createElement("div", { className: "flex justify-between py-2 border-b" },
                        react_1["default"].createElement("span", null, "Gross Profit"),
                        react_1["default"].createElement("span", { className: "font-semibold" },
                            "Ksh ",
                            (pl.grossProfit / 100).toLocaleString('en-KE'))),
                    react_1["default"].createElement("div", { className: "flex justify-between py-2 border-b" },
                        react_1["default"].createElement("span", null, "Gross Margin"),
                        react_1["default"].createElement("span", null, (_g = pl.grossMarginPercentage) === null || _g === void 0 ? void 0 :
                            _g.toFixed(1),
                            "%")),
                    react_1["default"].createElement("div", { className: "flex justify-between py-2 border-b" },
                        react_1["default"].createElement("span", null, "Operating Expenses"),
                        react_1["default"].createElement("span", null,
                            "Ksh ",
                            (pl.operatingExpenses / 100).toLocaleString('en-KE'))),
                    react_1["default"].createElement("div", { className: "flex justify-between py-2 border-b" },
                        react_1["default"].createElement("span", null, "Operating Profit"),
                        react_1["default"].createElement("span", { className: "font-semibold" },
                            "Ksh ",
                            (pl.operatingProfit / 100).toLocaleString('en-KE'))),
                    react_1["default"].createElement("div", { className: "flex justify-between py-2" },
                        react_1["default"].createElement("span", null, "Other Expenses"),
                        react_1["default"].createElement("span", null,
                            "Ksh ",
                            (pl.otherExpenses / 100).toLocaleString('en-KE'))))))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "12-Month Cash Flow Projection"),
            cashFlowChartData.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 350 },
                react_1["default"].createElement(recharts_1.LineChart, { data: cashFlowChartData },
                    react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                    react_1["default"].createElement(recharts_1.XAxis, { dataKey: "month" }),
                    react_1["default"].createElement(recharts_1.YAxis, null),
                    react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return "Ksh " + value.toLocaleString(); } }),
                    react_1["default"].createElement(recharts_1.Legend, null),
                    react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "inflows", stroke: "#10b981", name: "Inflows" }),
                    react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "outflows", stroke: "#ef4444", name: "Outflows" })))) : (react_1["default"].createElement("p", { className: "text-gray-500" }, "No projection data available"))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
            react_1["default"].createElement("div", { className: "lg:col-span-2 bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Receivables Aging Analysis"),
                arChartData.some(function (item) { return item.amount > 0; }) ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                    react_1["default"].createElement(recharts_1.BarChart, { data: arChartData },
                        react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        react_1["default"].createElement(recharts_1.XAxis, { dataKey: "bucket" }),
                        react_1["default"].createElement(recharts_1.YAxis, null),
                        react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return "Ksh " + value.toLocaleString(); } }),
                        react_1["default"].createElement(recharts_1.Bar, { dataKey: "amount", fill: "#3b82f6" })))) : (react_1["default"].createElement("p", { className: "text-gray-500" }, "No AR data available"))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-lg font-semibold mb-4" }, "Top Debtors"),
                react_1["default"].createElement("div", { className: "mb-4 p-3 bg-blue-50 rounded" },
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Outstanding"),
                    react_1["default"].createElement("div", { className: "text-2xl font-bold text-blue-600" },
                        "Ksh ",
                        (arSummary.totalOutstanding / 100).toLocaleString('en-KE'))),
                react_1["default"].createElement("div", { className: "space-y-2" }, (arSummary.topDebtors || []).map(function (debtor, idx) { return (react_1["default"].createElement("div", { key: debtor.clientName || "debtor-" + idx, className: "p-2 border rounded hover:bg-gray-50" },
                    react_1["default"].createElement("div", { className: "font-medium text-sm" }, debtor.clientName),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
                        "Ksh ",
                        (debtor.amount / 100).toLocaleString('en-KE')))); }))))));
}
exports.FinancialReportsPage = FinancialReportsPage;
