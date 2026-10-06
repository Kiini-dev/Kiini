"use strict";
exports.__esModule = true;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var recharts_1 = require("recharts");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
/**
 * TeamWorkloadDashboard component
 *
 * Displays team member workload allocation and utilization metrics
 * Features:
 * - Team member utilization chart
 * - Project allocation breakdown
 * - Department utilization
 * - Over-allocated warnings
 * - Capacity planning insights
 */
function TeamWorkloadDashboard() {
    var _a = react_1.useState(null), selectedDepartment = _a[0], setSelectedDepartment = _a[1];
    var _b = react_1.useState([]), utilization = _b[0], setUtilization = _b[1];
    // Fetch team workload summary
    var _c = trpc_1.trpc.projects.teamWorkloadSummary.useQuery({}), workloadData = _c.data, isLoading = _c.isLoading;
    react_1.useEffect(function () {
        if (workloadData) {
            setUtilization(workloadData);
        }
    }, [workloadData]);
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center py-12" },
            React.createElement("div", { className: "flex flex-col items-center gap-3" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600" }),
                React.createElement("p", { className: "text-slate-600 dark:text-slate-300" }, "Loading team workload..."))));
    }
    var teamMembers = utilization || [];
    var filteredMembers = selectedDepartment
        ? teamMembers.filter(function (m) { return m.department === selectedDepartment; })
        : teamMembers;
    // Calculate department-level metrics
    var departmentStats = {};
    teamMembers.forEach(function (member) {
        var dept = member.department || "Unassigned";
        if (!departmentStats[dept]) {
            departmentStats[dept] = {
                name: dept,
                totalMembers: 0,
                averageUtilization: 0,
                totalHours: 0,
                overAllocated: 0
            };
        }
        departmentStats[dept].totalMembers += 1;
        departmentStats[dept].totalHours += member.totalHoursAllocated;
        departmentStats[dept].averageUtilization += member.utilizationPercentage;
        if (member.utilizationPercentage > 100) {
            departmentStats[dept].overAllocated += 1;
        }
    });
    // Calculate final averages
    Object.keys(departmentStats).forEach(function (dept) {
        if (departmentStats[dept].totalMembers > 0) {
            departmentStats[dept].averageUtilization = Math.round(departmentStats[dept].averageUtilization / departmentStats[dept].totalMembers);
        }
    });
    var departments = Object.values(departmentStats);
    // Identify over-allocated members (>100% utilization)
    var overAllocatedMembers = teamMembers.filter(function (m) { return m.utilizationPercentage > 100; });
    var underAllocatedMembers = teamMembers.filter(function (m) { return m.utilizationPercentage < 50 && m.utilizationPercentage > 0; });
    var unallocatedMembers = teamMembers.filter(function (m) { return m.utilizationPercentage === 0; });
    // Prepare data for charts
    var utilizationChartData = filteredMembers
        .slice(0, 15) // Show top 15 for readability
        .map(function (member) { return ({
        name: member.name.split(" ")[0],
        utilization: member.utilizationPercentage,
        allocated: member.totalHoursAllocated,
        label: "" + member.name
    }); });
    var departmentChartData = departments.map(function (dept) { return ({
        name: dept.name,
        utilization: dept.averageUtilization,
        members: dept.totalMembers
    }); });
    // Color coding for utilization
    var getUtilizationColor = function (percentage) {
        if (percentage === 0)
            return "text-slate-400";
        if (percentage < 50)
            return "text-yellow-600 dark:text-yellow-400";
        if (percentage <= 100)
            return "text-green-600 dark:text-green-400";
        return "text-red-600 dark:text-red-400";
    };
    var getUtilizationBadgeColor = function (percentage) {
        if (percentage === 0)
            return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
        if (percentage < 50)
            return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-750 dark:text-yellow-200";
        if (percentage <= 100)
            return "bg-green-100 dark:bg-green-900/30 text-green-750 dark:text-green-200";
        return "bg-red-100 dark:bg-red-900/30 text-red-750 dark:text-red-200";
    };
    var getUtilizationBadgeLabel = function (percentage) {
        if (percentage === 0)
            return "Unallocated";
        if (percentage < 50)
            return "Under-allocated";
        if (percentage <= 100)
            return "Optimal";
        return "Over-allocated";
    };
    return (React.createElement("div", { className: "space-y-6" },
        overAllocatedMembers.length > 0 && (React.createElement(alert_1.Alert, { className: "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20" },
            React.createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4 text-red-600" }),
            React.createElement(alert_1.AlertDescription, { className: "text-red-700 dark:text-red-200" },
                React.createElement("strong", null,
                    overAllocatedMembers.length,
                    " team member(s)"),
                " are over-allocated with more than 100% utilization. Consider adjusting project assignments."))),
        underAllocatedMembers.length > 0 && (React.createElement(alert_1.Alert, { className: "border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20" },
            React.createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4 text-yellow-600" }),
            React.createElement(alert_1.AlertDescription, { className: "text-yellow-700 dark:text-yellow-200" },
                React.createElement("strong", null,
                    underAllocatedMembers.length,
                    " team member(s)"),
                " have less than 50% utilization. Consider additional project assignments."))),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-slate-600 dark:text-slate-300" }, "Total Team Members")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-2xl font-bold text-slate-900 dark:text-slate-50" }, teamMembers.length),
                    React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" },
                        "Across ",
                        departments.length,
                        " department(s)"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-slate-600 dark:text-slate-300" }, "Average Utilization")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-2xl font-bold text-green-600 dark:text-green-400" },
                        teamMembers.length > 0
                            ? Math.round(teamMembers.reduce(function (sum, m) { return sum + m.utilizationPercentage; }, 0) /
                                teamMembers.length)
                            : 0,
                        "%"),
                    React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" }, "Team capacity usage"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-slate-600 dark:text-slate-300" }, "Allocated Hours")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-2xl font-bold text-blue-600 dark:text-blue-400" }, Math.round(teamMembers.reduce(function (sum, m) { return sum + m.totalHoursAllocated; }, 0))),
                    React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" }, "Total weekly hours"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-slate-600 dark:text-slate-300" }, "Capacity Available")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-2xl font-bold text-orange-600 dark:text-orange-400" }, Math.round(teamMembers.length * 40 -
                        teamMembers.reduce(function (sum, m) { return sum + m.totalHoursAllocated; }, 0))),
                    React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" }, "Available hours")))),
        React.createElement(tabs_1.Tabs, { defaultValue: "utilization", className: "space-y-4" },
            React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                React.createElement(tabs_1.TabsTrigger, { value: "utilization" }, "Utilization"),
                React.createElement(tabs_1.TabsTrigger, { value: "departments" }, "Departments"),
                React.createElement(tabs_1.TabsTrigger, { value: "team-list" }, "Team List"),
                React.createElement(tabs_1.TabsTrigger, { value: "capacity" }, "Capacity")),
            React.createElement(tabs_1.TabsContent, { value: "utilization", className: "space-y-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Team Member Utilization"),
                        React.createElement(card_1.CardDescription, null, "Hours allocated per team member (40 hours baseline per week)")),
                    React.createElement(card_1.CardContent, null, utilizationChartData.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 400 },
                        React.createElement(recharts_1.BarChart, { data: utilizationChartData },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#e2e8f0" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "name", tick: { fill: "#64748b", fontSize: 12 }, angle: -45, textAnchor: "end", height: 80 }),
                            React.createElement(recharts_1.YAxis, { label: { value: "Utilization %", angle: -90, position: "insideLeft" }, tick: { fill: "#64748b", fontSize: 12 }, domain: [0, 150] }),
                            React.createElement(recharts_1.Tooltip, { contentStyle: {
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #475569",
                                    borderRadius: "8px",
                                    color: "#f1f5f9"
                                }, formatter: function (value) { return [value + "%", "Utilization"]; }, labelFormatter: function (label) {
                                    var member = utilizationChartData.find(function (d) { return d.name === label; });
                                    return member ? member.label : label;
                                } }),
                            React.createElement(recharts_1.Bar, { dataKey: "utilization", fill: "#3b82f6", radius: [8, 8, 0, 0], name: "Utilization %" })))) : (React.createElement("div", { className: "flex items-center justify-center py-12 text-slate-500 dark:text-slate-400" },
                        React.createElement("p", null, "No team members assigned to projects yet"))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base" }, "Utilization Levels")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                            React.createElement("div", { className: "p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/50" },
                                React.createElement("p", { className: "text-sm font-medium text-red-700 dark:text-red-200" }, "Over-allocated"),
                                React.createElement("p", { className: "text-xs text-red-600 dark:text-red-300 mt-1" }, "> 100%"),
                                React.createElement("p", { className: "text-2xl font-bold text-red-600 dark:text-red-400 mt-2" }, overAllocatedMembers.length)),
                            React.createElement("div", { className: "p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/50" },
                                React.createElement("p", { className: "text-sm font-medium text-green-700 dark:text-green-200" }, "Optimal"),
                                React.createElement("p", { className: "text-xs text-green-600 dark:text-green-300 mt-1" }, "50-100%"),
                                React.createElement("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400 mt-2" }, teamMembers.filter(function (m) { return m.utilizationPercentage >= 50 && m.utilizationPercentage <= 100; }).length)),
                            React.createElement("div", { className: "p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900/50" },
                                React.createElement("p", { className: "text-sm font-medium text-yellow-700 dark:text-yellow-200" }, "Under-allocated"),
                                React.createElement("p", { className: "text-xs text-yellow-600 dark:text-yellow-300 mt-1" }, "< 50%"),
                                React.createElement("p", { className: "text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2" }, underAllocatedMembers.length)),
                            React.createElement("div", { className: "p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-900/50" },
                                React.createElement("p", { className: "text-sm font-medium text-slate-700 dark:text-slate-200" }, "Unallocated"),
                                React.createElement("p", { className: "text-xs text-slate-600 dark:text-slate-300 mt-1" }, "0%"),
                                React.createElement("p", { className: "text-2xl font-bold text-slate-600 dark:text-slate-400 mt-2" }, unallocatedMembers.length)))))),
            React.createElement(tabs_1.TabsContent, { value: "departments", className: "space-y-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Department Utilization"),
                        React.createElement(card_1.CardDescription, null, "Average utilization by department")),
                    React.createElement(card_1.CardContent, null, departmentChartData.length > 0 ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 400 },
                        React.createElement(recharts_1.BarChart, { data: departmentChartData },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#e2e8f0" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "name", tick: { fill: "#64748b", fontSize: 12 } }),
                            React.createElement(recharts_1.YAxis, { label: { value: "Avg Utilization %", angle: -90, position: "insideLeft" }, tick: { fill: "#64748b", fontSize: 12 }, domain: [0, 150] }),
                            React.createElement(recharts_1.Tooltip, { contentStyle: {
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #475569",
                                    borderRadius: "8px",
                                    color: "#f1f5f9"
                                }, formatter: function (value, name) {
                                    if (name === "utilization")
                                        return [value + "%", "Avg Utilization"];
                                    return [value, "Members"];
                                } }),
                            React.createElement(recharts_1.Bar, { dataKey: "utilization", fill: "#10b981", radius: [8, 8, 0, 0], name: "Avg Utilization" })))) : (React.createElement("div", { className: "flex items-center justify-center py-12 text-slate-500 dark:text-slate-400" },
                        React.createElement("p", null, "No department data available"))))),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, departments.map(function (dept) { return (React.createElement(card_1.Card, { key: dept.name },
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement(card_1.CardTitle, { className: "text-[1rem]" }, dept.name),
                            React.createElement(badge_1.Badge, { variant: "outline" },
                                dept.totalMembers,
                                " members"))),
                    React.createElement(card_1.CardContent, { className: "space-y-3" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Avg Utilization"),
                            React.createElement("span", { className: "font-bold " + getUtilizationColor(dept.averageUtilization) },
                                dept.averageUtilization,
                                "%")),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-sm text-slate-600 dark:text-slate-300" }, "Total Hours"),
                            React.createElement("span", { className: "font-bold" },
                                dept.totalHours,
                                "hrs/week")),
                        dept.overAllocated > 0 && (React.createElement("div", { className: "pt-2 border-t border-slate-200 dark:border-slate-700" },
                            React.createElement("span", { className: "text-xs text-red-600 dark:text-red-400" },
                                dept.overAllocated,
                                " over-allocated member(s)")))))); }))),
            React.createElement(tabs_1.TabsContent, { value: "team-list", className: "space-y-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, null, "Team Member Details"),
                                React.createElement(card_1.CardDescription, null, "Individual workload and project allocation")))),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-3" }, teamMembers.length > 0 ? (React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "flex gap-2 flex-wrap mb-4" },
                                React.createElement(badge_1.Badge, { variant: selectedDepartment === null ? "default" : "outline", className: "cursor-pointer", onClick: function () { return setSelectedDepartment(null); } }, "All Departments"),
                                departments.map(function (dept) { return (React.createElement(badge_1.Badge, { key: dept.name, variant: selectedDepartment === dept.name ? "default" : "outline", className: "cursor-pointer", onClick: function () { return setSelectedDepartment(dept.name); } }, dept.name)); })),
                            React.createElement("div", { className: "border rounded-lg divide-y" }, filteredMembers.map(function (member) { return (React.createElement("div", { key: member.employeeId, className: "p-4 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition" },
                                React.createElement("div", { className: "flex items-start justify-between mb-3" },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium text-slate-900 dark:text-slate-50" }, member.name),
                                        React.createElement("p", { className: "text-sm text-slate-500 dark:text-slate-400" },
                                            member.position || "N/A",
                                            " \u2022 ",
                                            member.department || "Unassigned")),
                                    React.createElement(badge_1.Badge, { className: getUtilizationBadgeColor(member.utilizationPercentage) },
                                        member.utilizationPercentage,
                                        "%")),
                                React.createElement("div", { className: "mb-3" },
                                    React.createElement("div", { className: "flex justify-between items-center mb-1" },
                                        React.createElement("span", { className: "text-xs text-slate-600 dark:text-slate-300" }, "Hours Allocated"),
                                        React.createElement("span", { className: "text-xs font-medium text-slate-700 dark:text-slate-200" },
                                            member.totalHoursAllocated,
                                            " / 40 hrs")),
                                    React.createElement("div", { className: "w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2" },
                                        React.createElement("div", { className: "h-2 rounded-full transition-all " + (member.utilizationPercentage > 100
                                                ? "bg-red-600"
                                                : member.utilizationPercentage >= 50
                                                    ? "bg-green-600"
                                                    : "bg-yellow-600"), style: {
                                                width: Math.min(100, member.utilizationPercentage) + "%"
                                            } }))),
                                member.projects && member.projects.length > 0 && (React.createElement("div", { className: "space-y-2" },
                                    React.createElement("p", { className: "text-xs font-medium text-slate-600 dark:text-slate-300" },
                                        "Assigned to ",
                                        member.projects.length,
                                        " project(s):"),
                                    React.createElement("div", { className: "space-y-2" }, member.projects.map(function (project) { return (React.createElement("div", { key: project.projectId, className: "p-2 rounded bg-slate-50 dark:bg-slate-900/30 text-xs" },
                                        React.createElement("div", { className: "flex justify-between items-center" },
                                            React.createElement("span", { className: "font-medium text-slate-800 dark:text-slate-200" }, project.projectName),
                                            React.createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" },
                                                project.hoursAllocated,
                                                "hrs")),
                                        React.createElement("div", { className: "text-slate-600 dark:text-slate-400 mt-1" }, project.role && React.createElement("span", null,
                                            "Role: ",
                                            project.role)))); })))),
                                member.projects && member.projects.length === 0 && (React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 italic" }, "Not assigned to any projects")))); })))) : (React.createElement("div", { className: "flex items-center justify-center py-12 text-slate-500 dark:text-slate-400" },
                            React.createElement("p", null, "No team members found"))))))),
            React.createElement(tabs_1.TabsContent, { value: "capacity", className: "space-y-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Team Capacity Planning"),
                        React.createElement(card_1.CardDescription, null, "Available capacity and allocation trends")),
                    React.createElement(card_1.CardContent, null, teamMembers.length > 0 ? (React.createElement("div", { className: "space-y-6" },
                        React.createElement("div", { className: "p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800" },
                            React.createElement("h3", { className: "font-medium text-slate-900 dark:text-slate-50 mb-4" }, "Overall Team Capacity"),
                            React.createElement("div", { className: "space-y-4" },
                                React.createElement("div", null,
                                    React.createElement("div", { className: "flex justify-between items-center mb-2" },
                                        React.createElement("span", { className: "text-sm font-medium text-slate-700 dark:text-slate-200" }, "Total Capacity"),
                                        React.createElement("span", { className: "text-sm font-bold text-slate-900 dark:text-slate-50" },
                                            teamMembers.length * 40,
                                            " hours/week"))),
                                React.createElement("div", null,
                                    React.createElement("div", { className: "flex justify-between items-center mb-2" },
                                        React.createElement("span", { className: "text-sm font-medium text-slate-700 dark:text-slate-200" }, "Allocated Hours"),
                                        React.createElement("span", { className: "text-sm font-bold text-green-600 dark:text-green-400" },
                                            Math.round(teamMembers.reduce(function (sum, m) { return sum + m.totalHoursAllocated; }, 0)),
                                            " ",
                                            "hours/week")),
                                    React.createElement("div", { className: "w-full bg-slate-300 dark:bg-slate-600 rounded-full h-3" },
                                        React.createElement("div", { className: "h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600", style: {
                                                width: Math.min(100, (teamMembers.reduce(function (sum, m) { return sum + m.totalHoursAllocated; }, 0) /
                                                    (teamMembers.length * 40)) *
                                                    100) + "%"
                                            } }))),
                                React.createElement("div", null,
                                    React.createElement("div", { className: "flex justify-between items-center mb-2" },
                                        React.createElement("span", { className: "text-sm font-medium text-slate-700 dark:text-slate-200" }, "Available Capacity"),
                                        React.createElement("span", { className: "text-sm font-bold text-orange-600 dark:text-orange-400" },
                                            Math.round(teamMembers.length * 40 -
                                                teamMembers.reduce(function (sum, m) { return sum + m.totalHoursAllocated; }, 0)),
                                            " ",
                                            "hours/week"))),
                                React.createElement("div", { className: "pt-3 border-t border-slate-300 dark:border-slate-700" },
                                    React.createElement("div", { className: "flex justify-between items-center" },
                                        React.createElement("span", { className: "text-sm font-medium text-slate-700 dark:text-slate-200" }, "Utilization Rate"),
                                        React.createElement("span", { className: "text-2xl font-bold text-blue-600 dark:text-blue-400" },
                                            Math.round((teamMembers.reduce(function (sum, m) { return sum + m.totalHoursAllocated; }, 0) /
                                                (teamMembers.length * 40)) *
                                                100),
                                            "%"))))),
                        React.createElement("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50" },
                            React.createElement("h3", { className: "font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2" },
                                React.createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" }),
                                "Recommendations"),
                            React.createElement("ul", { className: "space-y-2 text-sm text-blue-800 dark:text-blue-200" },
                                overAllocatedMembers.length > 0 && (React.createElement("li", null,
                                    "\u2022 Redistribute work from ",
                                    overAllocatedMembers.length,
                                    " over-allocated team member(s) to prevent burnout")),
                                underAllocatedMembers.length > 0 && (React.createElement("li", null,
                                    "\u2022 Consider assigning more projects to ",
                                    underAllocatedMembers.length,
                                    " ",
                                    "under-allocated team member(s)")),
                                unallocatedMembers.length > 0 && (React.createElement("li", null,
                                    "\u2022 ",
                                    unallocatedMembers.length,
                                    " team member(s) have no project assignments")),
                                teamMembers.reduce(function (sum, m) { return sum + m.utilizationPercentage; }, 0) /
                                    teamMembers.length <
                                    70 && (React.createElement("li", null, "\u2022 Overall team utilization is below recommended level (70% target)")))))) : (React.createElement("div", { className: "flex items-center justify-center py-12 text-slate-500 dark:text-slate-400" },
                        React.createElement("p", null, "No capacity data available")))))))));
}
exports["default"] = TeamWorkloadDashboard;
