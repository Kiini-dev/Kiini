"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var stats_card_1 = require("@/components/ui/stats-card");
var EmployeeSelect_1 = require("@/components/EmployeeSelect");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var utils_1 = require("@/lib/utils");
function TimesheetView() {
    var _a = react_1.useState(new Date().toISOString().split("T")[0]), selectedWeek = _a[0], setSelectedWeek = _a[1];
    var _b = react_1.useState(""), selectedEmployee = _b[0], setSelectedEmployee = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = react_1.useState("list"), viewMode = _d[0], setViewMode = _d[1];
    // Fetch timesheets
    var _e = trpc_1.trpc.timeEntries.list.useQuery(), _f = _e.data, timesheets = _f === void 0 ? [] : _f, isLoading = _e.isLoading;
    // Fetch employees for stats
    var _g = trpc_1.trpc.employees.list.useQuery().data, employees = _g === void 0 ? [] : _g;
    // Calculate week dates
    var getWeekDates = function (dateStr) {
        var date = new Date(dateStr);
        var day = date.getDay();
        var diff = date.getDate() - day + (day === 0 ? -6 : 1);
        var monday = new Date(date.setDate(diff));
        var sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        return { monday: monday, sunday: sunday };
    };
    var _h = getWeekDates(selectedWeek), monday = _h.monday, sunday = _h.sunday;
    // Filter timesheets
    var filteredTimesheets = timesheets.filter(function (ts) {
        if (selectedEmployee && ts.employeeId !== selectedEmployee)
            return false;
        if (statusFilter !== "all" && ts.status !== statusFilter)
            return false;
        var tsDate = new Date(ts.startDate);
        return tsDate >= monday && tsDate <= sunday;
    });
    // Calculate stats
    var stats = {
        total: filteredTimesheets.length,
        submitted: filteredTimesheets.filter(function (ts) { return ts.status === "submitted"; }).length,
        approved: filteredTimesheets.filter(function (ts) { return ts.status === "approved"; }).length,
        pending: filteredTimesheets.filter(function (ts) { return ts.status === "draft"; }).length,
        totalHours: filteredTimesheets.reduce(function (sum, ts) { return sum + (ts.hoursWorked || 0); }, 0)
    };
    var getStatusColor = function (status) {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800";
            case "submitted":
                return "bg-blue-100 text-blue-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            case "draft":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "approved":
                return React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-600" });
            case "submitted":
                return React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-blue-600" });
            case "rejected":
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-red-600" });
            case "draft":
                return React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4 text-gray-600" });
            default:
                return null;
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Timesheet Management", description: "View and manage employee timesheets", icon: React.createElement(lucide_react_1.Clock, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/employees" },
            { label: "Timesheets" },
        ], backLink: { label: "HR", href: "/employees" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-5" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Entries", value: stats.total, icon: React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Submitted", value: stats.submitted, icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Approved", value: stats.approved, icon: React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: stats.pending, icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5" }), color: "border-l-amber-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Hours", value: stats.totalHours.toFixed(1) + "h", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Filters")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "week-select" }, "Select Week"),
                            React.createElement(input_1.Input, { id: "week-select", type: "date", value: selectedWeek, onChange: function (e) { return setSelectedWeek(e.target.value); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Employee"),
                            React.createElement(EmployeeSelect_1.EmployeeSelect, { value: selectedEmployee, onChange: setSelectedEmployee, label: "" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "status-filter" }, "Status"),
                            React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                                React.createElement(select_1.SelectTrigger, { id: "status-filter" },
                                    React.createElement(select_1.SelectValue, { placeholder: "All Statuses" })),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                                    React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                    React.createElement(select_1.SelectItem, { value: "submitted" }, "Submitted"),
                                    React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                    React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected")))),
                        React.createElement("div", { className: "flex items-end gap-2" },
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "w-full" },
                                React.createElement(lucide_react_1.Filter, { className: "h-4 w-4 mr-2" }),
                                "Apply Filters"))))),
            React.createElement(tabs_1.Tabs, { value: viewMode, onValueChange: function (v) { return setViewMode(v); } },
                React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-2" },
                    React.createElement(tabs_1.TabsTrigger, { value: "list" }, "List View"),
                    React.createElement(tabs_1.TabsTrigger, { value: "calendar" }, "Calendar View")),
                React.createElement(tabs_1.TabsContent, { value: "list", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null,
                                "Week of ",
                                monday.toLocaleDateString(),
                                " - ",
                                sunday.toLocaleDateString()),
                            React.createElement(card_1.CardDescription, null,
                                filteredTimesheets.length,
                                " timesheet entries")),
                        React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                            React.createElement("p", { className: "text-muted-foreground" }, "Loading timesheets..."))) : filteredTimesheets.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground" },
                            React.createElement(lucide_react_1.Calendar, { className: "h-12 w-12 mb-4 opacity-20" }),
                            React.createElement("p", null, "No timesheets found for the selected filters"))) : (React.createElement("div", { className: "overflow-x-auto" },
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, null, "Employee"),
                                        React.createElement(table_1.TableHead, null, "Start Date"),
                                        React.createElement(table_1.TableHead, null, "End Date"),
                                        React.createElement(table_1.TableHead, { className: "text-right" }, "Hours"),
                                        React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                                        React.createElement(table_1.TableHead, null, "Status"),
                                        React.createElement(table_1.TableHead, null, "Notes"),
                                        React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                                React.createElement(table_1.TableBody, null, filteredTimesheets.map(function (ts) { return (React.createElement(table_1.TableRow, { key: ts.id },
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, ts.employeeName),
                                    React.createElement(table_1.TableCell, null, utils_1.formatDate(ts.startDate)),
                                    React.createElement(table_1.TableCell, null, utils_1.formatDate(ts.endDate)),
                                    React.createElement(table_1.TableCell, { className: "text-right font-medium" },
                                        ts.hoursWorked.toFixed(1),
                                        "h"),
                                    React.createElement(table_1.TableCell, { className: "text-right" }, utils_1.formatCurrency(ts.totalAmount)),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { variant: "outline", className: getStatusColor(ts.status) },
                                            React.createElement("span", { className: "mr-2" }, getStatusIcon(ts.status)),
                                            ts.status.charAt(0).toUpperCase() + ts.status.slice(1))),
                                    React.createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, ts.notes ? ts.notes.substring(0, 30) + "..." : "-"),
                                    React.createElement(table_1.TableCell, { className: "text-right" },
                                        React.createElement("div", { className: "flex justify-end gap-2" },
                                            React.createElement(button_1.Button, { variant: "ghost", size: "sm" },
                                                React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                            React.createElement(button_1.Button, { variant: "ghost", size: "sm" },
                                                React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })))))); })))))))),
                React.createElement(tabs_1.TabsContent, { value: "calendar", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Calendar View"),
                            React.createElement(card_1.CardDescription, null,
                                "Week of ",
                                monday.toLocaleDateString(),
                                " - ",
                                sunday.toLocaleDateString())),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "text-center py-12 text-muted-foreground" },
                                React.createElement(lucide_react_1.Calendar, { className: "h-12 w-12 mx-auto mb-4 opacity-20" }),
                                React.createElement("p", null, "Calendar view coming soon")))))))));
}
exports["default"] = TimesheetView;
