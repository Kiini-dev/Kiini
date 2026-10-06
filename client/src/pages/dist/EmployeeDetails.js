"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var avatar_1 = require("@/components/ui/avatar");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var separator_1 = require("@/components/ui/separator");
var useFavorite_1 = require("@/hooks/useFavorite");
function EmployeeDetails() {
    var _a, _b, _c, _d, _e, _f;
    var _g = wouter_1.useRoute("/employees/:id"), params = _g[1];
    var _h = wouter_1.useLocation(), navigate = _h[1];
    var employeeId = (params === null || params === void 0 ? void 0 : params.id) || "";
    // Fetch employee from backend
    var _j = trpc_1.trpc.employees.getById.useQuery(employeeId), employeeData = _j.data, employeeLoading = _j.isLoading;
    var formatAmount = currency_1.useCurrencySettings().formatAmount;
    var _k = useFavorite_1.useFavorite("employee", employeeId, (_a = employeeData) === null || _a === void 0 ? void 0 : _a.name), isStarred = _k.isStarred, toggleStar = _k.toggleStar;
    var _l = trpc_1.trpc.jobGroups.list.useQuery({}).data, jobGroupsData = _l === void 0 ? [] : _l;
    // Fetch payroll data from backend
    var _m = trpc_1.trpc.payslips.list.useQuery({ employeeId: employeeId }, { enabled: !!employeeId, staleTime: 60000 }), payrollData = _m.data, payrollLoading = _m.isLoading;
    // Fetch leave data from backend
    var _o = trpc_1.trpc.leaves.getByEmployee.useQuery({ employeeId: employeeId }, { enabled: !!employeeId, staleTime: 60000 }), leaveData = _o.data, leaveLoading = _o.isLoading;
    // Fetch attendance data
    var _p = trpc_1.trpc.attendance.getByEmployee.useQuery({ employeeId: employeeId, limit: 30 }, { enabled: !!employeeId, staleTime: 60000 }), attendanceData = _p.data, attendanceLoading = _p.isLoading;
    var jobGroup = jobGroupsData.find(function (jg) { var _a; return jg.id === ((_a = employeeData) === null || _a === void 0 ? void 0 : _a.jobGroupId); });
    var isLoading = employeeLoading || payrollLoading || leaveLoading || attendanceLoading;
    var employee = employeeData ? {
        id: employeeId,
        employeeId: employeeData.employeeNumber || "EMP-" + employeeId.slice(0, 8),
        name: ((employeeData.firstName || "") + " " + (employeeData.lastName || "")).trim() || "Unknown Employee",
        email: employeeData.email || "",
        phone: employeeData.phone || "",
        address: employeeData.address || "",
        department: employeeData.department || "Unknown",
        position: employeeData.position || "Unknown",
        jobGroupId: employeeData.jobGroupId || "",
        jobGroupName: (jobGroup === null || jobGroup === void 0 ? void 0 : jobGroup.name) || "Unknown",
        employmentType: employeeData.employmentType || "full_time",
        status: employeeData.status || "active",
        joinDate: employeeData.hireDate ? new Date(employeeData.hireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        salary: (employeeData.salary || 0) / 100,
        photoUrl: employeeData.photoUrl || "",
        avatar: null
    } : null;
    // Transform backend payroll data
    var payrollHistory = ((_b = payrollData) === null || _b === void 0 ? void 0 : _b.map(function (payslip) { return ({
        month: payslip.month ? new Date(payslip.month).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A",
        basic: (payslip.basicSalary || 0) / 100,
        allowances: (payslip.totalAllowances || 0) / 100,
        deductions: (payslip.totalDeductions || 0) / 100,
        net: (payslip.netAmount || 0) / 100,
        status: payslip.status || "processed"
    }); })) || [];
    // Transform backend leave data
    var leaveHistory = ((_c = leaveData) === null || _c === void 0 ? void 0 : _c.map(function (leave) { return ({
        type: leave.leaveType || "Annual Leave",
        startDate: leave.startDate || "",
        endDate: leave.endDate || "",
        days: leave.numberOfDays || 1,
        status: leave.status || "pending"
    }); })) || [];
    // Transform backend attendance data
    var attendanceRecords = ((_d = attendanceData) === null || _d === void 0 ? void 0 : _d.map(function (record) { return ({
        date: record.checkInTime ? new Date(record.checkInTime).toISOString().split('T')[0] : "",
        clockIn: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—",
        clockOut: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—",
        hours: record.hoursWorked || 0,
        status: record.status || "present"
    }); })) || [];
    var getStatusVariant = function (status) {
        switch (status) {
            case "active":
                return "default";
            case "inactive":
                return "secondary";
            case "on-leave":
                return "outline";
            default:
                return "default";
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "active":
                return React.createElement(lucide_react_1.UserCheck, { className: "h-3 w-3" });
            case "present":
                return React.createElement(lucide_react_1.UserCheck, { className: "h-3 w-3" });
            case "late":
                return React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" });
            default:
                return null;
        }
    };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Employee Details", icon: React.createElement(lucide_react_1.User, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "HR", href: "/employees" }, { label: "Employees", href: "/employees" }, { label: "Details" }], backLink: { label: "Employees", href: "/employees" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading employee..."))));
    }
    if (!employee) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Employee Details", icon: React.createElement(lucide_react_1.User, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "HR", href: "/employees" }, { label: "Employees", href: "/employees" }, { label: "Details" }], backLink: { label: "Employees", href: "/employees" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Employee not found"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/employees"); } }, "Back to Employees"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Employee Details", icon: React.createElement(lucide_react_1.User, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "HR", href: "/employees" }, { label: "Employees", href: "/employees" }, { label: "Details" }], backLink: { label: "Employees", href: "/employees" } },
        React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "flex items-center justify-end gap-1" },
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: toggleStar },
                    React.createElement(lucide_react_1.Star, { className: "h-4 w-4 " + (isStarred ? "fill-amber-400 text-amber-400" : "") })),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { var email = employee === null || employee === void 0 ? void 0 : employee.email; if (email)
                        window.location.href = "mailto:" + email; } },
                    React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" })),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/employees/" + employeeId + "/edit"); } },
                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
            React.createElement("div", { className: "flex gap-6" },
                React.createElement("div", { className: "w-[320px] min-w-[320px] space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 space-y-4" },
                            React.createElement("div", { className: "flex flex-col items-center text-center" },
                                React.createElement(avatar_1.Avatar, { className: "h-24 w-24 mb-3" },
                                    React.createElement(avatar_1.AvatarImage, { src: (employee === null || employee === void 0 ? void 0 : employee.photoUrl) || undefined, alt: employee === null || employee === void 0 ? void 0 : employee.name }),
                                    React.createElement(avatar_1.AvatarFallback, { className: "text-lg" }, employee === null || employee === void 0 ? void 0 :
                                        employee.name.charAt(0), (_e = employee === null || employee === void 0 ? void 0 : employee.name.split(' ')[1]) === null || _e === void 0 ? void 0 :
                                        _e.charAt(0))),
                                React.createElement("h2", { className: "text-xl font-bold" }, employee === null || employee === void 0 ? void 0 : employee.name),
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, employee === null || employee === void 0 ? void 0 : employee.position),
                                React.createElement("p", { className: "text-xs text-muted-foreground" }, employee === null || employee === void 0 ? void 0 : employee.employeeId)),
                            React.createElement("div", { className: "flex gap-2 flex-wrap justify-center" },
                                React.createElement(badge_1.Badge, { variant: "default" }, employee === null || employee === void 0 ? void 0 : employee.jobGroupName),
                                React.createElement(badge_1.Badge, { variant: "secondary" }, (_f = employee === null || employee === void 0 ? void 0 : employee.employmentType) === null || _f === void 0 ? void 0 : _f.replace('_', ' ').toUpperCase()),
                                React.createElement(badge_1.Badge, { variant: (employee === null || employee === void 0 ? void 0 : employee.status) === "active" ? "default" : "secondary" }, employee === null || employee === void 0 ? void 0 : employee.status)),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-3 text-sm" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Briefcase, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Department"),
                                        React.createElement("p", { className: "font-medium" }, employee.department))),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Mail, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Email"),
                                        React.createElement("p", { className: "font-medium" }, employee.email))),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Phone, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Phone"),
                                        React.createElement("p", { className: "font-medium" }, employee.phone))),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.MapPin, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Address"),
                                        React.createElement("p", { className: "font-medium" }, employee.address || "—"))),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Joined"),
                                        React.createElement("p", { className: "font-medium" }, new Date(employee.joinDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Compensation"),
                                React.createElement("div", { className: "grid grid-cols-2 gap-2 text-sm" },
                                    React.createElement("div", { className: "bg-muted/50 rounded p-2" },
                                        React.createElement("p", { className: "text-muted-foreground" }, "Salary"),
                                        React.createElement("p", { className: "font-bold" }, formatAmount(employee.salary || 0))),
                                    React.createElement("div", { className: "bg-muted/50 rounded p-2" },
                                        React.createElement("p", { className: "text-muted-foreground" }, "Leave Balance"),
                                        React.createElement("p", { className: "font-bold" }, "14 days"))))))),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement(tabs_1.Tabs, { defaultValue: "attendance", className: "space-y-4" },
                        React.createElement(tabs_1.TabsList, null,
                            React.createElement(tabs_1.TabsTrigger, { value: "attendance" }, "Attendance"),
                            React.createElement(tabs_1.TabsTrigger, { value: "leave" }, "Leave History"),
                            React.createElement(tabs_1.TabsTrigger, { value: "payroll" }, "Payroll")),
                        React.createElement(tabs_1.TabsContent, { value: "attendance", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Recent Attendance"),
                                    React.createElement(card_1.CardDescription, null, "Last 30 days attendance records")),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement(table_1.Table, null,
                                        React.createElement(table_1.TableHeader, null,
                                            React.createElement(table_1.TableRow, null,
                                                React.createElement(table_1.TableHead, null, "Date"),
                                                React.createElement(table_1.TableHead, null, "Clock In"),
                                                React.createElement(table_1.TableHead, null, "Clock Out"),
                                                React.createElement(table_1.TableHead, null, "Hours"),
                                                React.createElement(table_1.TableHead, null, "Status"))),
                                        React.createElement(table_1.TableBody, null, attendanceRecords.map(function (record, index) { return (React.createElement(table_1.TableRow, { key: record.date ? "attendance-" + record.date : "record-" + index },
                                            React.createElement(table_1.TableCell, null, new Date(record.date).toLocaleDateString()),
                                            React.createElement(table_1.TableCell, null, record.clockIn),
                                            React.createElement(table_1.TableCell, null, record.clockOut),
                                            React.createElement(table_1.TableCell, null,
                                                record.hours,
                                                " hrs"),
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement(badge_1.Badge, { variant: record.status === "present" ? "default" : "outline" }, record.status)))); })))))),
                        React.createElement(tabs_1.TabsContent, { value: "leave", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Leave History"),
                                    React.createElement(card_1.CardDescription, null, "Past leave requests and approvals")),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement(table_1.Table, null,
                                        React.createElement(table_1.TableHeader, null,
                                            React.createElement(table_1.TableRow, null,
                                                React.createElement(table_1.TableHead, null, "Leave Type"),
                                                React.createElement(table_1.TableHead, null, "Start Date"),
                                                React.createElement(table_1.TableHead, null, "End Date"),
                                                React.createElement(table_1.TableHead, null, "Days"),
                                                React.createElement(table_1.TableHead, null, "Status"))),
                                        React.createElement(table_1.TableBody, null, leaveHistory.map(function (leave, index) { return (React.createElement(table_1.TableRow, { key: leave.startDate ? "leave-" + leave.startDate : "leave-" + index },
                                            React.createElement(table_1.TableCell, null, leave.type),
                                            React.createElement(table_1.TableCell, null, new Date(leave.startDate).toLocaleDateString()),
                                            React.createElement(table_1.TableCell, null, new Date(leave.endDate).toLocaleDateString()),
                                            React.createElement(table_1.TableCell, null,
                                                leave.days,
                                                " days"),
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement(badge_1.Badge, { variant: "default" }, leave.status)))); })))))),
                        React.createElement(tabs_1.TabsContent, { value: "payroll", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Payroll History"),
                                    React.createElement(card_1.CardDescription, null, "Monthly salary breakdown")),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement(table_1.Table, null,
                                        React.createElement(table_1.TableHeader, null,
                                            React.createElement(table_1.TableRow, null,
                                                React.createElement(table_1.TableHead, null, "Month"),
                                                React.createElement(table_1.TableHead, { className: "text-right" }, "Basic Salary"),
                                                React.createElement(table_1.TableHead, { className: "text-right" }, "Allowances"),
                                                React.createElement(table_1.TableHead, { className: "text-right" }, "Deductions"),
                                                React.createElement(table_1.TableHead, { className: "text-right" }, "Net Salary"))),
                                        React.createElement(table_1.TableBody, null, payrollHistory.map(function (payroll, index) { return (React.createElement(table_1.TableRow, { key: payroll.month || "payroll-" + index },
                                            React.createElement(table_1.TableCell, null, payroll.month),
                                            React.createElement(table_1.TableCell, { className: "text-right" }, formatAmount(payroll.basic || 0)),
                                            React.createElement(table_1.TableCell, { className: "text-right text-green-600" },
                                                "+",
                                                formatAmount(payroll.allowances || 0)),
                                            React.createElement(table_1.TableCell, { className: "text-right text-red-600" },
                                                "-",
                                                formatAmount(payroll.deductions || 0)),
                                            React.createElement(table_1.TableCell, { className: "text-right font-bold" }, formatAmount(payroll.net || 0)))); }))))))))))));
}
exports["default"] = EmployeeDetails;
