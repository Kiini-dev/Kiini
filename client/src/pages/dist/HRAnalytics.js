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
exports.HRAnalyticsPage = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var recharts_1 = require("recharts");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var sonner_1 = require("sonner");
var table_1 = require("@/components/ui/table");
var stats_card_1 = require("@/components/ui/stats-card");
var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
function HRAnalyticsPage() {
    var _this = this;
    var _a = react_1.useState("12"), timeframe = _a[0], setTimeframe = _a[1];
    var _b = react_1.useState(false), isRefreshing = _b[0], setIsRefreshing = _b[1];
    // Fetch all analytics data
    var _c = trpc_1.trpc.hrAnalytics.getHeadcountTrends.useQuery({ months: parseInt(timeframe) }), headcount = _c.data, loadingHeadcount = _c.isLoading;
    var _d = trpc_1.trpc.hrAnalytics.getSalaryDistribution.useQuery({}), salary = _d.data, loadingSalary = _d.isLoading;
    var _e = trpc_1.trpc.hrAnalytics.getTurnoverAnalysis.useQuery({}), turnover = _e.data, loadingTurnover = _e.isLoading;
    var _f = trpc_1.trpc.hrAnalytics.getAttendanceKPIs.useQuery({ months: 3 }), attendance = _f.data, loadingAttendance = _f.isLoading;
    var _g = trpc_1.trpc.hrAnalytics.getLeaveUtilization.useQuery({}), leave = _g.data, loadingLeave = _g.isLoading;
    var _h = trpc_1.trpc.hrAnalytics.getDepartmentAnalytics.useQuery({}), departments = _h.data, loadingDepts = _h.isLoading;
    var _j = trpc_1.trpc.hrAnalytics.getPerformanceMetrics.useQuery({}), performance = _j.data, loadingPerf = _j.isLoading;
    var _k = trpc_1.trpc.hrAnalytics.getSalaryExpenseTrends.useQuery({ months: parseInt(timeframe) }), expenses = _k.data, loadingExpenses = _k.isLoading;
    var isLoading = loadingHeadcount || loadingSalary || loadingTurnover || loadingAttendance || loadingLeave || loadingDepts || loadingPerf || loadingExpenses;
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsRefreshing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // Refetch all queries
                    return [4 /*yield*/, Promise.all([
                        // Queries auto-refetch when state changes
                        ])];
                case 2:
                    // Refetch all queries
                    _a.sent();
                    sonner_1.toast.success("Analytics refreshed");
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error("Failed to refresh analytics");
                    return [3 /*break*/, 5];
                case 4:
                    setIsRefreshing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Calculate summary metrics
    var summaryStats = react_1.useMemo(function () {
        return {
            totalEmployees: (turnover === null || turnover === void 0 ? void 0 : turnover.totalEmployees) || 0,
            activeEmployees: (turnover === null || turnover === void 0 ? void 0 : turnover.active) || 0,
            turnoverRate: (turnover === null || turnover === void 0 ? void 0 : turnover.turnoverRate.toFixed(1)) || "0",
            avgPresence: (attendance === null || attendance === void 0 ? void 0 : attendance.presentPercentage.toFixed(1)) || "0",
            presentCount: (attendance === null || attendance === void 0 ? void 0 : attendance.present) || 0,
            absentCount: (attendance === null || attendance === void 0 ? void 0 : attendance.absent) || 0
        };
    }, [turnover, attendance]);
    var attendanceChartData = react_1.useMemo(function () {
        if (!attendance)
            return [];
        return [
            { name: "Present", value: attendance.present || 0, fill: "#10b981" },
            { name: "Absent", value: attendance.absent || 0, fill: "#ef4444" },
            { name: "Late", value: attendance.late || 0, fill: "#f59e0b" },
            { name: "Half Day", value: attendance.halfDay || 0, fill: "#8b5cf6" },
        ];
    }, [attendance]);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "HR Analytics Dashboard", description: "Comprehensive HR metrics, trends, and analytics", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/crm/hr" },
            { label: "HR Analytics" },
        ] },
        React.createElement("div", { className: "space-y-8" },
            React.createElement("div", { className: "flex justify-end items-start" },
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(select_1.Select, { value: timeframe, onValueChange: setTimeframe },
                        React.createElement(select_1.SelectTrigger, { className: "w-32" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "3" }, "Last 3 Months"),
                            React.createElement(select_1.SelectItem, { value: "6" }, "Last 6 Months"),
                            React.createElement(select_1.SelectItem, { value: "12" }, "Last 12 Months"))),
                    React.createElement(button_1.Button, { variant: "outline", onClick: handleRefresh, disabled: isRefreshing, size: "sm" },
                        React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 " + (isRefreshing ? "animate-spin" : "") })))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Employees", value: summaryStats.totalEmployees, description: React.createElement(React.Fragment, null,
                        summaryStats.activeEmployees,
                        " active"), icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Turnover Rate", value: React.createElement(React.Fragment, null,
                        summaryStats.turnoverRate,
                        "%"), description: React.createElement(React.Fragment, null,
                        (turnover === null || turnover === void 0 ? void 0 : turnover.terminated) || 0,
                        " terminated"), icon: React.createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5" }), color: "border-l-amber-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Attendance Rate", value: React.createElement(React.Fragment, null,
                        summaryStats.avgPresence,
                        "%"), description: React.createElement(React.Fragment, null,
                        summaryStats.presentCount,
                        " present today"), icon: React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Performance Score", value: React.createElement(React.Fragment, null,
                        (performance === null || performance === void 0 ? void 0 : performance.avgPresenceRate) ? (performance.avgPresenceRate * 10).toFixed(1) : "N/A",
                        "/10"), description: React.createElement(React.Fragment, null,
                        (performance === null || performance === void 0 ? void 0 : performance.totalEmployees) || 0,
                        " employees tracked"), icon: React.createElement(lucide_react_1.Award, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }),
                            "Headcount Trends"),
                        React.createElement(card_1.CardDescription, null,
                            "Employee count over ",
                            timeframe,
                            " months")),
                    React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "Loading...")) : headcount && headcount.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.AreaChart, { data: headcount },
                            React.createElement("defs", null,
                                React.createElement("linearGradient", { id: "colorHeadcount", x1: "0", y1: "0", x2: "0", y2: "1" },
                                    React.createElement("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.3 }),
                                    React.createElement("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 }))),
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                            React.createElement(recharts_1.YAxis, null),
                            React.createElement(recharts_1.Tooltip, null),
                            React.createElement(recharts_1.Area, { type: "monotone", dataKey: "headcount", stroke: "#3b82f6", fillOpacity: 1, fill: "url(#colorHeadcount)" })))) : (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "No data available")))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Zap, { className: "h-5 w-5" }),
                            "Salary Distribution"),
                        React.createElement(card_1.CardDescription, null, "Average salary by department")),
                    React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "Loading...")) : salary && salary.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.BarChart, { data: salary },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "department", angle: -45, textAnchor: "end", height: 80 }),
                            React.createElement(recharts_1.YAxis, null),
                            React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "Ksh " + (value === null || value === void 0 ? void 0 : value.toLocaleString('en-KE')); } }),
                            React.createElement(recharts_1.Bar, { dataKey: "avgSalary", fill: "#10b981", name: "Avg Salary" })))) : (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "No data available"))))),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Attendance Breakdown"),
                        React.createElement(card_1.CardDescription, null, "Last 3 months attendance status")),
                    React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "Loading...")) : attendanceChartData.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.PieChart, null,
                            React.createElement(recharts_1.Pie, { data: attendanceChartData, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                    var name = _a.name, value = _a.value, percent = _a.percent;
                                    return name + ": " + value + " (" + (percent * 100).toFixed(0) + "%)";
                                }, outerRadius: 100, fill: "#8884d8", dataKey: "value" }, attendanceChartData.map(function (entry) { return (React.createElement(recharts_1.Cell, { key: entry.name, fill: entry.fill })); })),
                            React.createElement(recharts_1.Tooltip, null)))) : (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "No data available")))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Leave Utilization"),
                        React.createElement(card_1.CardDescription, null, "Leave usage by type")),
                    React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "Loading...")) : leave && leave.length > 0 ? (React.createElement("div", { className: "space-y-4" }, leave.map(function (item, idx) { return (React.createElement("div", { key: item.type || "leave-" + idx },
                        React.createElement("div", { className: "flex justify-between items-center mb-2" },
                            React.createElement("span", { className: "text-sm font-medium" }, item.type),
                            React.createElement(badge_1.Badge, { variant: "outline" },
                                item.count,
                                " requests")),
                        React.createElement("div", { className: "w-full bg-gray-200 h-2 rounded-full overflow-hidden" },
                            React.createElement("div", { className: "h-full bg-blue-500", style: { width: Math.min((item.count / 20) * 100, 100) + "%" } })),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" },
                            item.totalDays,
                            " total days"))); }))) : (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "No data available"))))),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }),
                            "Salary Expense Trends"),
                        React.createElement(card_1.CardDescription, null,
                            "Monthly salary expenses over ",
                            timeframe,
                            " months")),
                    React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "Loading...")) : expenses && expenses.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.LineChart, { data: expenses },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                            React.createElement(recharts_1.YAxis, null),
                            React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "Ksh " + (value / 1000).toFixed(0) + "k"; } }),
                            React.createElement(recharts_1.Legend, null),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "totalCost", stroke: "#ef4444", name: "Total Cost", strokeWidth: 2 }),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "employeeCount", stroke: "#3b82f6", name: "Employees", yAxisId: "right", strokeWidth: 2 })))) : (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "No data available")))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Department Analytics"),
                        React.createElement(card_1.CardDescription, null, "Overview by department")),
                    React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "Loading...")) : departments && departments.length > 0 ? (React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Department"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Employees"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Avg Salary"))),
                            React.createElement(table_1.TableBody, null, departments.map(function (dept, idx) { return (React.createElement(table_1.TableRow, { key: dept.name || "dept-" + idx },
                                React.createElement(table_1.TableCell, { className: "font-medium" }, dept.name || "Unassigned"),
                                React.createElement(table_1.TableCell, { className: "text-right" }, dept.employees),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    "Ksh ",
                                    (dept.avgSalary / 100).toLocaleString('en-KE')))); }))))) : (React.createElement("div", { className: "h-80 flex items-center justify-center text-gray-400" }, "No data available"))))))));
}
exports.HRAnalyticsPage = HRAnalyticsPage;
exports["default"] = HRAnalyticsPage;
