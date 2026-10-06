"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var stats_card_1 = require("@/components/ui/stats-card");
var recharts_1 = require("recharts");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var lucide_react_1 = require("lucide-react");
function ProjectReports() {
    var _a = react_1.useState(String(new Date().getFullYear())), yearFilter = _a[0], setYearFilter = _a[1];
    var _b = currency_1.useCurrencySettings(), symbol = _b.symbol, position = _b.position;
    // Fetch project data
    var _c = trpc_1.trpc.projects.list.useQuery({}).data, projects = _c === void 0 ? [] : _c;
    var _d = trpc_1.trpc.tasks.list.useQuery({}).data, tasks = _d === void 0 ? [] : _d;
    var _e = trpc_1.trpc.timesheets.list.useQuery({}).data, timesheets = _e === void 0 ? [] : _e;
    var currentYear = new Date().getFullYear();
    var yearOptions = [currentYear, currentYear - 1, currentYear - 2].map(String);
    var fmt = react_1.useCallback(function (amount) {
        var value = amount / 100;
        if (position === "prefix")
            return "" + symbol + value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "K";
        return value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "K" + symbol;
    }, [symbol, position]);
    // Filter projects by year
    var filteredProjects = react_1.useMemo(function () {
        return projects.filter(function (proj) {
            var date = new Date(proj.startDate || proj.createdAt);
            return date.getFullYear() === Number(yearFilter);
        });
    }, [projects, yearFilter]);
    var totalProjects = filteredProjects.length;
    var completedProjects = filteredProjects.filter(function (p) { return p.status === "completed"; }).length;
    var activeProjects = filteredProjects.filter(function (p) { return p.status === "active"; }).length;
    var overdueProjects = filteredProjects.filter(function (p) {
        var dueDate = new Date(p.endDate);
        return dueDate < new Date() && p.status !== "completed";
    }).length;
    var totalBudget = react_1.useMemo(function () { return filteredProjects.reduce(function (sum, proj) { return sum + (proj.budget || 0); }, 0); }, [filteredProjects]);
    // Project status distribution
    var projectsByStatus = react_1.useMemo(function () {
        var statusMap = {};
        filteredProjects.forEach(function (p) {
            var status = p.status || "unknown";
            statusMap[status] = (statusMap[status] || 0) + 1;
        });
        return Object.entries(statusMap).map(function (_a) {
            var status = _a[0], count = _a[1];
            return ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: count
            });
        });
    }, [filteredProjects]);
    // Top projects by budget
    var topProjects = react_1.useMemo(function () {
        return filteredProjects
            .sort(function (a, b) { return (b.budget || 0) - (a.budget || 0); })
            .slice(0, 10)
            .map(function (proj) { return ({
            name: proj.name.length > 20 ? proj.name.substring(0, 17) + "..." : proj.name,
            value: Math.round((proj.budget || 0) / 100),
            status: proj.status
        }); });
    }, [filteredProjects]);
    // Task completion timeline
    var taskTimeline = react_1.useMemo(function () {
        var monthMap = {};
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (var i = 0; i < 12; i++) {
            var month = monthNames[i];
            monthMap[month] = { completed: 0, total: 0 };
        }
        tasks.forEach(function (task) {
            var date = new Date(task.dueDate || task.createdAt);
            if (date.getFullYear() === Number(yearFilter)) {
                var month = monthNames[date.getMonth()];
                monthMap[month].total += 1;
                if (task.status === "completed")
                    monthMap[month].completed += 1;
            }
        });
        return Object.entries(monthMap).map(function (_a) {
            var month = _a[0], data = _a[1];
            return ({
                month: month,
                completed: data.completed,
                pending: data.total - data.completed
            });
        });
    }, [tasks, yearFilter]);
    var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Project Reports" },
        React.createElement("div", { className: "max-w-7xl mx-auto" },
            React.createElement("div", { className: "flex gap-4 mb-6" },
                React.createElement(select_1.Select, { value: yearFilter, onValueChange: setYearFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null, yearOptions.map(function (year) { return (React.createElement(select_1.SelectItem, { key: year, value: year }, year)); })))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" },
                React.createElement(stats_card_1.StatsCard, { title: "Total Projects", value: totalProjects.toString(), icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-4 w-4" }), trend: activeProjects, trendLabel: "active" }),
                React.createElement(stats_card_1.StatsCard, { title: "Completed", value: completedProjects.toString(), icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4" }), trend: Math.round((completedProjects / totalProjects) * 100) || 0, trendLabel: "completion rate" }),
                React.createElement(stats_card_1.StatsCard, { title: "Total Budget", value: fmt(totalBudget), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" }), trend: 0, trendLabel: totalProjects > 0 ? (totalBudget / (totalProjects * 100)).toFixed(0) + "K avg" : "no data" }),
                React.createElement(stats_card_1.StatsCard, { title: "Overdue", value: overdueProjects.toString(), icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }), trend: 0, trendLabel: "projects" })),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Top Projects by Budget"),
                        React.createElement(card_1.CardDescription, null,
                            "Top 10 projects in ",
                            yearFilter)),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.BarChart, { data: topProjects },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "name", angle: -45, textAnchor: "end", height: 100 }),
                                React.createElement(recharts_1.YAxis, null),
                                React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "$" + value + "K"; }, contentStyle: { backgroundColor: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" } }),
                                React.createElement(recharts_1.Bar, { dataKey: "value", fill: "#3b82f6", name: "Budget" }))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Projects by Status"),
                        React.createElement(card_1.CardDescription, null, "Project distribution")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.PieChart, null,
                                React.createElement(recharts_1.Pie, { data: projectsByStatus, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                        var name = _a.name, value = _a.value;
                                        return name + ": " + value;
                                    }, outerRadius: 80, fill: "#8884d8", dataKey: "value" }, projectsByStatus.map(function (_, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: COLORS[index % COLORS.length] })); })),
                                React.createElement(recharts_1.Tooltip, null)))))),
            React.createElement(card_1.Card, { className: "mb-6" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Task Completion Timeline"),
                    React.createElement(card_1.CardDescription, null,
                        "Tasks completed vs pending by month in ",
                        yearFilter)),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.LineChart, { data: taskTimeline },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "month" }),
                            React.createElement(recharts_1.YAxis, null),
                            React.createElement(recharts_1.Tooltip, null),
                            React.createElement(recharts_1.Legend, null),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "completed", stroke: "#10b981", name: "Completed" }),
                            React.createElement(recharts_1.Line, { type: "monotone", dataKey: "pending", stroke: "#f59e0b", name: "Pending" }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Projects List"),
                    React.createElement(card_1.CardDescription, null,
                        "All projects in ",
                        yearFilter)),
                React.createElement(card_1.CardContent, null,
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Project Name"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Start Date"),
                                React.createElement(table_1.TableHead, null, "End Date"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Budget"))),
                        React.createElement(table_1.TableBody, null, filteredProjects.slice(0, 10).map(function (proj) { return (React.createElement(table_1.TableRow, { key: proj.id },
                            React.createElement(table_1.TableCell, { className: "font-medium" }, proj.name),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: "outline", className: proj.status === "completed" ? "bg-green-50 text-green-700" : proj.status === "active" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700" }, proj.status)),
                            React.createElement(table_1.TableCell, null, new Date(proj.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })),
                            React.createElement(table_1.TableCell, null, new Date(proj.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })),
                            React.createElement(table_1.TableCell, { className: "text-right" }, fmt(proj.budget || 0)))); }))))))));
}
exports["default"] = ProjectReports;
