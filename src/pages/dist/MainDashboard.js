"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.MainDashboard = void 0;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var trpc_1 = require("@/utils/trpc");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
function MainDashboard() {
    var navigate = react_router_dom_1.useNavigate();
    // Query multiple data sources for dashboard
    var projectsQuery = trpc_1.trpc.projectAnalytics.getAllProjectAnalytics.useQuery();
    var clientsQuery = trpc_1.trpc.clientScoring.getAllClientScores.useQuery();
    var financialsQuery = trpc_1.trpc.financialReporting.getPLStatement.useQuery({ startDate: '', endDate: '' });
    var expensesQuery = trpc_1.trpc.expenses.getReports.useQuery();
    var projects = projectsQuery.data || [];
    var clients = clientsQuery.data || [];
    var expenses = expensesQuery.data || [];
    // Calculate KPIs
    var kpis = {
        activeProjects: projects.filter(function (p) { return p.status === 'active'; }).length,
        totalRevenue: projects.reduce(function (sum, p) { return sum + (p.revenue || 0); }, 0) / 100,
        teamSize: new Set(projects.flatMap(function (p) { return p.teamMembers || []; })).size,
        atRiskClients: clients.filter(function (c) { return c.riskLevel === 'red'; }).length,
        pendingExpenses: expenses.filter(function (e) { return e.status !== 'reimbursed'; }).length,
        pendingExpenseAmount: expenses
            .filter(function (e) { return e.status !== 'reimbursed'; })
            .reduce(function (sum, e) { return sum + (e.totalAmount || 0); }, 0) / 100
    };
    // Recent projects
    var recentProjects = projects.slice(0, 5).map(function (p) { return ({
        name: p.projectName.substring(0, 20),
        completion: p.completionPercentage,
        risk: p.riskLevel
    }); });
    // Client health distribution
    var clientHealth = [
        { name: 'Excellent', count: clients.filter(function (c) { return c.score >= 80; }).length },
        { name: 'Good', count: clients.filter(function (c) { return c.score >= 60 && c.score < 80; }).length },
        { name: 'Fair', count: clients.filter(function (c) { return c.score >= 40 && c.score < 60; }).length },
        { name: 'At Risk', count: clients.filter(function (c) { return c.score < 40; }).length },
    ];
    return (react_1["default"].createElement("div", { className: "space-y-6 p-6" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "Dashboard"),
            react_1["default"].createElement("p", { className: "text-gray-600" }, "Welcome back! Here's your consolidated view.")),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4" },
            react_1["default"].createElement(KpiCard, { icon: lucide_react_1.Clock, label: "Active Projects", value: kpis.activeProjects, color: "blue", onClick: function () { return navigate('/analytics/projects'); } }),
            react_1["default"].createElement(KpiCard, { icon: lucide_react_1.DollarSign, label: "Total Revenue", value: "Ksh " + kpis.totalRevenue.toLocaleString('en-KE', { maximumFractionDigits: 0 }), color: "green" }),
            react_1["default"].createElement(KpiCard, { icon: lucide_react_1.Users, label: "Team Size", value: kpis.teamSize, color: "blue", onClick: function () { return navigate('/team/performance'); } }),
            react_1["default"].createElement(KpiCard, { icon: lucide_react_1.AlertTriangle, label: "At Risk Clients", value: kpis.atRiskClients, color: "red", onClick: function () { return navigate('/analytics/clients'); } }),
            react_1["default"].createElement(KpiCard, { icon: lucide_react_1.Target, label: "Pending Expenses", value: kpis.pendingExpenses, color: "yellow", onClick: function () { return navigate('/expenses'); } }),
            react_1["default"].createElement(KpiCard, { icon: lucide_react_1.TrendingUp, label: "Expense Amount", value: "Ksh " + kpis.pendingExpenseAmount.toLocaleString('en-KE', { maximumFractionDigits: 0 }), color: "purple" })),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
            react_1["default"].createElement(ActionButton, { title: "View Projects", icon: lucide_react_1.TrendingUp, onClick: function () { return navigate('/analytics/projects'); } }),
            react_1["default"].createElement(ActionButton, { title: "Financial Reports", icon: lucide_react_1.DollarSign, onClick: function () { return navigate('/finance/reports'); } }),
            react_1["default"].createElement(ActionButton, { title: "Team Performance", icon: lucide_react_1.Users, onClick: function () { return navigate('/team/performance'); } }),
            react_1["default"].createElement(ActionButton, { title: "Expense Management", icon: lucide_react_1.AlertTriangle, onClick: function () { return navigate('/expenses'); } })),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-lg font-semibold mb-4 flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Clock, { size: 20 }),
                    " Recent Projects"),
                recentProjects.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 250 },
                    react_1["default"].createElement(recharts_1.BarChart, { data: recentProjects },
                        react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        react_1["default"].createElement(recharts_1.XAxis, { dataKey: "name" }),
                        react_1["default"].createElement(recharts_1.YAxis, null),
                        react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return value + "%"; } }),
                        react_1["default"].createElement(recharts_1.Bar, { dataKey: "completion", fill: "#3b82f6" })))) : (react_1["default"].createElement("p", { className: "text-gray-500" }, "No project data"))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-lg font-semibold mb-4 flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Target, { size: 20 }),
                    " Client Health Distribution"),
                clientHealth.some(function (c) { return c.count > 0; }) ? (react_1["default"].createElement("div", { className: "space-y-3" }, clientHealth.map(function (item) { return (react_1["default"].createElement("div", { key: item.name },
                    react_1["default"].createElement("div", { className: "flex justify-between mb-1" },
                        react_1["default"].createElement("span", { className: "text-sm font-medium" }, item.name),
                        react_1["default"].createElement("span", { className: "text-sm font-semibold" }, item.count)),
                    react_1["default"].createElement("div", { className: "w-full bg-gray-200 rounded-full h-2" },
                        react_1["default"].createElement("div", { className: "h-2 rounded-full transition-all duration-300 " + (item.name === 'Excellent'
                                ? 'bg-green-500'
                                : item.name === 'Good'
                                    ? 'bg-blue-500'
                                    : item.name === 'Fair'
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'), style: {
                                width: (item.count / Math.max.apply(Math, __spreadArrays([1], clientHealth.map(function (c) { return c.count; })))) * 100 + "%"
                            } })))); }))) : (react_1["default"].createElement("p", { className: "text-gray-500" }, "No client data")))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
            react_1["default"].createElement(SummaryCard, { title: "Projects by Status", data: [
                    { label: 'Active', value: projects.filter(function (p) { return p.status === 'active'; }).length },
                    { label: 'Planning', value: projects.filter(function (p) { return p.status === 'planning'; }).length },
                    { label: 'Completed', value: projects.filter(function (p) { return p.status === 'completed'; }).length },
                ] }),
            react_1["default"].createElement(SummaryCard, { title: "Risk Distribution", data: [
                    { label: 'Low Risk', value: projects.filter(function (p) { return p.riskLevel === 'low'; }).length },
                    { label: 'Medium Risk', value: projects.filter(function (p) { return p.riskLevel === 'medium'; }).length },
                    { label: 'High Risk', value: projects.filter(function (p) { return p.riskLevel === 'high'; }).length },
                ] }),
            react_1["default"].createElement(SummaryCard, { title: "Expense Status", data: [
                    { label: 'Pending', value: expenses.filter(function (e) { return e.status === 'submitted'; }).length },
                    { label: 'Approved', value: expenses.filter(function (e) { return e.status === 'approved'; }).length },
                    { label: 'Reimbursed', value: expenses.filter(function (e) { return e.status === 'reimbursed'; }).length },
                ] }))));
}
exports.MainDashboard = MainDashboard;
function KpiCard(_a) {
    var Icon = _a.icon, label = _a.label, value = _a.value, color = _a.color, onClick = _a.onClick;
    var colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };
    return (react_1["default"].createElement("div", { onClick: onClick, className: "p-4 rounded-lg border cursor-pointer transition hover:shadow-lg " + colors[color] },
        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("p", { className: "text-xs opacity-75 mb-1" }, label),
                react_1["default"].createElement("p", { className: "text-2xl font-bold" }, value)),
            react_1["default"].createElement(Icon, { size: 32, opacity: 0.3 }))));
}
function ActionButton(_a) {
    var title = _a.title, Icon = _a.icon, onClick = _a.onClick;
    return (react_1["default"].createElement("button", { onClick: onClick, className: "p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500" },
        react_1["default"].createElement(Icon, { size: 32, className: "text-blue-600 mb-2 mx-auto" }),
        react_1["default"].createElement("p", { className: "font-medium text-gray-900" }, title)));
}
function SummaryCard(_a) {
    var title = _a.title, data = _a.data;
    return (react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
        react_1["default"].createElement("h3", { className: "text-lg font-semibold mb-4" }, title),
        react_1["default"].createElement("div", { className: "space-y-3" }, data.map(function (item, idx) { return (react_1["default"].createElement("div", { key: item.id || "stat-" + idx, className: "flex justify-between items-center p-2 bg-gray-50 rounded" },
            react_1["default"].createElement("span", { className: "text-sm text-gray-600" }, item.label),
            react_1["default"].createElement("span", { className: "font-bold text-gray-900" }, item.value))); }))));
}
