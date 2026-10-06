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
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var wouter_1 = require("wouter");
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var stats_card_1 = require("@/components/ui/stats-card");
/**
 * StaffDashboard component
 *
 * Features:
 * - Attendance tracking
 * - Leave requests
 * - Task management
 * - Performance overview
 * - Personal profile
 */
function StaffDashboard() {
    var _this = this;
    var _a;
    var _b = useAuthWithPersistence_1.useAuthWithPersistence({
        redirectOnUnauthenticated: true
    }), user = _b.user, loading = _b.loading, isAuthenticated = _b.isAuthenticated, logout = _b.logout;
    var _c = wouter_1.useLocation(), setLocation = _c[1];
    var _d = react_1.useState(null), downloadingPayslipId = _d[0], setDownloadingPayslipId = _d[1];
    var _e = react_1.useState(null), selectedPayslipForNote = _e[0], setSelectedPayslipForNote = _e[1];
    var _f = react_1.useState(""), noteText = _f[0], setNoteText = _f[1];
    var _g = react_1.useState(false), savingNote = _g[0], setSavingNote = _g[1];
    var _h = react_1.useState(null), reprintPayslipId = _h[0], setReprintPayslipId = _h[1];
    var _j = react_1.useState(""), reprintReason = _j[0], setReprintReason = _j[1];
    var _k = react_1.useState(false), submittingReprint = _k[0], setSubmittingReprint = _k[1];
    // Download payslip mutation
    var downloadPayslipMutation = trpc_1.trpc.payslips.downloadPayslip.useMutation();
    // Add note mutation
    var addNoteMutation = trpc_1.trpc.payslips.addNote.useMutation();
    // Export as PDF mutation
    var exportPdfMutation = trpc_1.trpc.payslips.exportAsPDF.useMutation();
    // Request reprint mutation
    var requestReprintMutation = trpc_1.trpc.payslips.requestReprint.useMutation();
    // Fetch attendance data from backend
    var _l = trpc_1.trpc.attendance.list.useQuery(undefined, { enabled: !!user }), attendanceData = _l.data, attendanceLoading = _l.isLoading;
    // Fetch leave requests from backend
    var _m = trpc_1.trpc.leave.list.useQuery(undefined, { enabled: !!user }), leaveData = _m.data, leaveLoading = _m.isLoading;
    // Fetch projects assigned to user
    var _o = trpc_1.trpc.projects.list.useQuery(undefined, { enabled: !!user }), projectsData = _o.data, projectsLoading = _o.isLoading;
    // Fetch payslips for the user
    var _p = trpc_1.trpc.payslips.listMine.useQuery({ limit: 12, offset: 0 }, { enabled: !!user }), payslipsData = _p.data, payslipsLoading = _p.isLoading;
    // Fetch payslip stats
    var payslipStats = trpc_1.trpc.payslips.getMyStats.useQuery(undefined, { enabled: !!user }).data;
    // Convert frozen objects to plain objects
    var attendanceDataPlain = attendanceData ? JSON.parse(JSON.stringify(attendanceData)) : [];
    var leaveDataPlain = leaveData ? JSON.parse(JSON.stringify(leaveData)) : [];
    var projectsDataPlain = projectsData ? JSON.parse(JSON.stringify(projectsData)) : [];
    var payslipsDataPlain = (payslipsData === null || payslipsData === void 0 ? void 0 : payslipsData.payslips) ? JSON.parse(JSON.stringify(payslipsData.payslips)) : [];
    var payslipStatsPlain = payslipStats ? JSON.parse(JSON.stringify(payslipStats)) : null;
    react_1.useEffect(function () {
        // Verify user has staff role
        if (!loading && isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) !== "staff") {
            setLocation("/dashboard");
        }
    }, [loading, isAuthenticated, user, setLocation]);
    if (loading || attendanceLoading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement("div", { className: "flex flex-col items-center gap-3" },
                React.createElement(lucide_react_1.Loader2, { className: "h-12 w-12 animate-spin text-blue-600" }),
                React.createElement("p", { className: "text-gray-600" }, "Loading dashboard..."))));
    }
    if (!isAuthenticated || (user === null || user === void 0 ? void 0 : user.role) !== "staff") {
        return null;
    }
    var handleLogout = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, logout()];
                case 1:
                    _a.sent();
                    setLocation("/login");
                    return [2 /*return*/];
            }
        });
    }); };
    var handleDownloadPayslip = function (payslipId, payPeriod) { return __awaiter(_this, void 0, void 0, function () {
        var result, blob, url, link, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setDownloadingPayslipId(payslipId);
                    return [4 /*yield*/, downloadPayslipMutation.mutateAsync({ payslipId: payslipId })];
                case 1:
                    result = _a.sent();
                    blob = new Blob([result.htmlContent], { type: "text/html" });
                    url = URL.createObjectURL(blob);
                    link = document.createElement("a");
                    link.href = url;
                    link.download = result.fileName || "Payslip_" + payPeriod + ".html";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error("Failed to download payslip:", error_1);
                    alert("Failed to download payslip. Please try again.");
                    return [3 /*break*/, 4];
                case 3:
                    setDownloadingPayslipId(null);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveNote = function (payslipId) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!noteText.trim()) {
                        alert("Please enter a note");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setSavingNote(true);
                    return [4 /*yield*/, addNoteMutation.mutateAsync({
                            payslipId: payslipId,
                            note: noteText
                        })];
                case 2:
                    _a.sent();
                    alert("Note saved successfully");
                    setSelectedPayslipForNote(null);
                    setNoteText("");
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error("Failed to save note:", error_2);
                    alert("Failed to save note. Please try again.");
                    return [3 /*break*/, 5];
                case 4:
                    setSavingNote(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleExportPDF = function (payslipId, payPeriod) { return __awaiter(_this, void 0, void 0, function () {
        var result, blob, url, link, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setDownloadingPayslipId(payslipId);
                    return [4 /*yield*/, exportPdfMutation.mutateAsync({ payslipId: payslipId })];
                case 1:
                    result = _a.sent();
                    blob = new Blob([result.htmlContent], { type: "text/html" });
                    url = URL.createObjectURL(blob);
                    link = document.createElement("a");
                    link.href = url;
                    link.download = result.fileName || "Payslip_" + payPeriod + ".pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    return [3 /*break*/, 4];
                case 2:
                    error_3 = _a.sent();
                    console.error("Failed to export PDF:", error_3);
                    alert("Failed to export PDF. Please try again.");
                    return [3 /*break*/, 4];
                case 3:
                    setDownloadingPayslipId(null);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleRequestReprint = function (payslipId) { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setSubmittingReprint(true);
                    return [4 /*yield*/, requestReprintMutation.mutateAsync({
                            payslipId: payslipId,
                            reason: reprintReason
                        })];
                case 1:
                    _a.sent();
                    alert("Reprint request submitted. HR will contact you soon.");
                    setReprintPayslipId(null);
                    setReprintReason("");
                    return [3 /*break*/, 4];
                case 2:
                    error_4 = _a.sent();
                    console.error("Failed to request reprint:", error_4);
                    alert("Failed to request reprint. Please try again.");
                    return [3 /*break*/, 4];
                case 3:
                    setSubmittingReprint(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Calculate attendance stats
    var totalAttendance = (attendanceDataPlain === null || attendanceDataPlain === void 0 ? void 0 : attendanceDataPlain.length) || 0;
    var presentDays = (attendanceDataPlain === null || attendanceDataPlain === void 0 ? void 0 : attendanceDataPlain.filter(function (a) { return a.status === "present"; }).length) || 0;
    var absentDays = (attendanceDataPlain === null || attendanceDataPlain === void 0 ? void 0 : attendanceDataPlain.filter(function (a) { return a.status === "absent"; }).length) || 0;
    var lateDays = (attendanceDataPlain === null || attendanceDataPlain === void 0 ? void 0 : attendanceDataPlain.filter(function (a) { return a.status === "late"; }).length) || 0;
    var attendanceRate = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0;
    // Calculate leave stats
    var pendingLeaves = (leaveDataPlain === null || leaveDataPlain === void 0 ? void 0 : leaveDataPlain.filter(function (l) { return l.status === "pending"; }).length) || 0;
    var approvedLeaves = (leaveDataPlain === null || leaveDataPlain === void 0 ? void 0 : leaveDataPlain.filter(function (l) { return l.status === "approved"; }).length) || 0;
    // Calculate project stats
    var assignedProjects = (projectsDataPlain === null || projectsDataPlain === void 0 ? void 0 : projectsDataPlain.length) || 0;
    var activeProjects = (projectsDataPlain === null || projectsDataPlain === void 0 ? void 0 : projectsDataPlain.filter(function (p) { return p.status === "active"; }).length) || 0;
    // Get today's attendance
    var today = new Date().toISOString().split('T')[0];
    var todayAttendance = attendanceDataPlain === null || attendanceDataPlain === void 0 ? void 0 : attendanceDataPlain.find(function (a) {
        return a.date && new Date(a.date).toISOString().split('T')[0] === today;
    });
    // Get recent attendance records
    var recentAttendance = (attendanceDataPlain === null || attendanceDataPlain === void 0 ? void 0 : attendanceDataPlain.slice(0, 5)) || [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Staff Dashboard", description: "Track your attendance, manage leave requests, and view assigned tasks", icon: React.createElement(lucide_react_1.User, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Staff" }], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { onClick: function () { return setLocation("/profile/settings"); }, variant: "secondary", size: "sm", className: "gap-2" },
                React.createElement(lucide_react_1.Settings, { className: "w-4 h-4" }),
                "My Settings"),
            React.createElement(button_1.Button, { variant: "secondary", size: "sm", onClick: function () { return setLocation("/crm-home"); } }, "Go to Main Dashboard")) },
        React.createElement("div", { className: "space-y-8" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Today's Status")),
                    React.createElement(card_1.CardContent, null, todayAttendance ? (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "text-2xl font-bold " + (todayAttendance.status === "present" ? "text-green-600" :
                                todayAttendance.status === "late" ? "text-orange-600" :
                                    "text-red-600") }, todayAttendance.status === "present" ? "Present" :
                            todayAttendance.status === "late" ? "Late" : "Absent"),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, todayAttendance.checkIn
                            ? "Checked in at " + new Date(todayAttendance.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                            : "Not checked in"))) : (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "text-2xl font-bold text-gray-400" }, "Not Marked"),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "No record for today"))))),
                React.createElement(stats_card_1.StatsCard, { label: "Attendance", value: React.createElement(React.Fragment, null,
                        attendanceRate,
                        "%"), description: React.createElement(React.Fragment, null,
                        presentDays,
                        " of ",
                        totalAttendance,
                        " days"), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending Requests", value: pendingLeaves, description: "Leave requests", color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Projects", value: activeProjects, description: "Active projects", color: "border-l-blue-500" })),
            React.createElement(tabs_1.Tabs, { defaultValue: "overview", className: "space-y-4" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "overview", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" }),
                        "Overview"),
                    React.createElement(tabs_1.TabsTrigger, { value: "attendance", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Clock, { className: "w-4 h-4" }),
                        "Attendance"),
                    React.createElement(tabs_1.TabsTrigger, { value: "leave", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Calendar, { className: "w-4 h-4" }),
                        "Leave Requests"),
                    React.createElement(tabs_1.TabsTrigger, { value: "projects", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4" }),
                        "Projects"),
                    React.createElement(tabs_1.TabsTrigger, { value: "payslips", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.DollarSign, { className: "w-4 h-4" }),
                        "Payslips")),
                React.createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Recent Activity")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "space-y-3" }, recentAttendance.length > 0 ? (recentAttendance.slice(0, 3).map(function (record, index) { return (React.createElement("div", { key: "attendance-" + record.date + "-" + index, className: "flex items-start gap-3" },
                                    React.createElement("div", { className: "w-2 h-2 rounded-full mt-2 " + (record.status === "present" ? "bg-green-600" :
                                            record.status === "late" ? "bg-orange-600" :
                                                "bg-red-600") }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-sm font-medium" }, record.status === "present" ? "Checked in" :
                                            record.status === "late" ? "Late check-in" : "Absent"),
                                        React.createElement("p", { className: "text-xs text-gray-500" },
                                            record.date ? new Date(record.date).toLocaleDateString() : "Unknown date",
                                            record.checkIn && " at " + new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))))); })) : (React.createElement("p", { className: "text-sm text-gray-500" }, "No recent activity"))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, null,
                                React.createElement(card_1.CardTitle, null, "Quick Actions")),
                            React.createElement(card_1.CardContent, { className: "space-y-2" },
                                React.createElement(button_1.Button, { className: "w-full justify-start", onClick: function () { return setLocation("/attendance"); } }, "Check In"),
                                React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return setLocation("/leave"); } }, "Request Leave"),
                                React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return setLocation("/payroll"); } }, "View Payslip"),
                                React.createElement(button_1.Button, { variant: "outline", className: "w-full justify-start", onClick: function () { return setLocation("/profile"); } }, "Update Profile"))))),
                React.createElement(tabs_1.TabsContent, { value: "attendance", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Attendance Record"),
                            React.createElement(card_1.CardDescription, null, "Your attendance history")),
                        React.createElement(card_1.CardContent, null, attendanceLoading ? (React.createElement("div", { className: "flex items-center justify-center py-8" },
                            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600" }))) : (React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", { className: "grid grid-cols-3 gap-4" },
                                React.createElement("div", { className: "p-4 bg-green-50 rounded-lg" },
                                    React.createElement("p", { className: "text-sm text-gray-600" }, "Present"),
                                    React.createElement("p", { className: "text-2xl font-bold text-green-600 mt-1" }, presentDays)),
                                React.createElement("div", { className: "p-4 bg-orange-50 rounded-lg" },
                                    React.createElement("p", { className: "text-sm text-gray-600" }, "Absent"),
                                    React.createElement("p", { className: "text-2xl font-bold text-orange-600 mt-1" }, absentDays)),
                                React.createElement("div", { className: "p-4 bg-blue-50 rounded-lg" },
                                    React.createElement("p", { className: "text-sm text-gray-600" }, "Late"),
                                    React.createElement("p", { className: "text-2xl font-bold text-blue-600 mt-1" }, lateDays))),
                            React.createElement("div", { className: "border rounded-lg p-4" },
                                React.createElement("p", { className: "text-sm font-medium mb-3" }, "Recent Check-ins"),
                                recentAttendance.length > 0 ? (React.createElement("div", { className: "space-y-2" }, recentAttendance.map(function (record, index) { return (React.createElement("div", { key: "checkin-" + record.date + "-" + index, className: "flex justify-between text-sm" },
                                    React.createElement("span", null, record.date ? new Date(record.date).toLocaleDateString() : "Unknown"),
                                    React.createElement("span", { className: record.status === "present" ? "text-green-600" :
                                            record.status === "late" ? "text-orange-600" :
                                                "text-red-600" }, record.checkIn
                                        ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                        : record.status === "absent" ? "Absent" : "N/A"))); }))) : (React.createElement("p", { className: "text-sm text-gray-500" }, "No attendance records found")))))))),
                React.createElement(tabs_1.TabsContent, { value: "leave", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement("div", { className: "flex justify-between items-center" },
                                React.createElement("div", null,
                                    React.createElement(card_1.CardTitle, null, "Leave Requests"),
                                    React.createElement(card_1.CardDescription, null, "Manage your leave requests")),
                                React.createElement(button_1.Button, { onClick: function () { return setLocation("/leave-management/create"); } }, "Request Leave"))),
                        React.createElement(card_1.CardContent, null, leaveLoading ? (React.createElement("div", { className: "flex items-center justify-center py-8" },
                            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600" }))) : leaveData && leaveData.length > 0 ? (React.createElement("div", { className: "space-y-3" }, leaveDataPlain.map(function (leave) { return (React.createElement("div", { key: leave.id, className: "p-3 border rounded-lg" },
                            React.createElement("div", { className: "flex justify-between items-start" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium text-sm" }, leave.leaveType || "Leave"),
                                    React.createElement("p", { className: "text-xs text-gray-500" }, leave.startDate && leave.endDate
                                        ? new Date(leave.startDate).toLocaleDateString() + " - " + new Date(leave.endDate).toLocaleDateString()
                                        : "Date not specified"),
                                    leave.reason && (React.createElement("p", { className: "text-xs text-gray-600 mt-1" }, leave.reason))),
                                React.createElement("span", { className: "px-2 py-1 rounded text-xs " + (leave.status === "approved" ? "bg-green-100 text-green-800" :
                                        leave.status === "rejected" ? "bg-red-100 text-red-800" :
                                            "bg-orange-100 text-orange-800") }, leave.status || "Pending")))); }))) : (React.createElement("div", { className: "text-center py-8 text-gray-500" }, "No leave requests found"))))),
                React.createElement(tabs_1.TabsContent, { value: "projects", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Assigned Projects"),
                            React.createElement(card_1.CardDescription, null, "Your current projects and assignments")),
                        React.createElement(card_1.CardContent, null, projectsLoading ? (React.createElement("div", { className: "flex items-center justify-center py-8" },
                            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600" }))) : projectsData && projectsData.length > 0 ? (React.createElement("div", { className: "space-y-3" }, projectsDataPlain.map(function (project) { return (React.createElement("div", { key: project.id, className: "p-3 border rounded-lg hover:bg-gray-50 cursor-pointer", onClick: function () { return setLocation("/projects/" + project.id); } },
                            React.createElement("div", { className: "flex items-start justify-between" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium text-sm" }, project.name || "Untitled Project"),
                                    React.createElement("p", { className: "text-xs text-gray-500" }, project.description || "No description"),
                                    project.deadline && (React.createElement("p", { className: "text-xs text-gray-500 mt-1" },
                                        "Due: ",
                                        new Date(project.deadline).toLocaleDateString()))),
                                React.createElement("span", { className: "px-2 py-1 rounded text-xs " + (project.status === "completed" ? "bg-green-100 text-green-800" :
                                        project.status === "active" ? "bg-blue-100 text-blue-800" :
                                            project.status === "on-hold" ? "bg-orange-100 text-orange-800" :
                                                "bg-gray-100 text-gray-800") }, project.status || "Not Started")))); }))) : (React.createElement("div", { className: "text-center py-8 text-gray-500" }, "No projects assigned"))))),
                React.createElement(tabs_1.TabsContent, { value: "payslips", className: "space-y-4" }, payslipsLoading ? (React.createElement("div", { className: "flex items-center justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600" }))) : (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-2" },
                                React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Payslips")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "text-2xl font-bold" }, (payslipStatsPlain === null || payslipStatsPlain === void 0 ? void 0 : payslipStatsPlain.totalPayslips) || 0),
                                React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "All payslips received"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-2" },
                                React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Earned")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "text-2xl font-bold" },
                                    "KES ",
                                    ((payslipStatsPlain === null || payslipStatsPlain === void 0 ? void 0 : payslipStatsPlain.totalEarned) || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })),
                                React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Net income lifetime"))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-2" },
                                React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Recent Payslips")),
                            React.createElement(card_1.CardContent, null,
                                React.createElement("div", { className: "text-2xl font-bold" }, ((_a = payslipStatsPlain === null || payslipStatsPlain === void 0 ? void 0 : payslipStatsPlain.recentPayslips) === null || _a === void 0 ? void 0 : _a.length) || 0),
                                React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Last 6 months")))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Payslip History"),
                            React.createElement(card_1.CardDescription, null, "View and download your payslips")),
                        React.createElement(card_1.CardContent, null, payslipsDataPlain && payslipsDataPlain.length > 0 ? (React.createElement("div", { className: "space-y-3" }, payslipsDataPlain.map(function (payslip) { return (React.createElement("div", { key: payslip.id, className: "p-4 border rounded-lg hover:bg-gray-50 transition" },
                            React.createElement("div", { className: "flex items-start justify-between mb-3" },
                                React.createElement("div", { className: "flex items-start gap-3 flex-1" },
                                    React.createElement("div", { className: "p-2 bg-blue-50 rounded mt-1" },
                                        React.createElement(lucide_react_1.FileText, { className: "w-5 h-5 text-blue-600" })),
                                    React.createElement("div", { className: "flex-1" },
                                        React.createElement("p", { className: "font-medium text-sm" }, payslip.payPeriod ? "Payslip - " + payslip.payPeriod : "Payslip"),
                                        React.createElement("div", { className: "flex gap-4 text-xs text-gray-500 mt-1" },
                                            React.createElement("span", null,
                                                "Gross: KES ",
                                                (payslip.grossPay || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })),
                                            React.createElement("span", null,
                                                "Deductions: KES ",
                                                (payslip.totalDeductions || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })),
                                            React.createElement("span", { className: "font-medium text-gray-700" },
                                                "Net: KES ",
                                                (payslip.netPay || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })))))),
                            React.createElement("div", { className: "flex gap-2 flex-wrap" },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleDownloadPayslip(payslip.id, payslip.payPeriod); }, disabled: downloadingPayslipId === payslip.id, className: "text-xs" },
                                    downloadingPayslipId === payslip.id ? (React.createElement(lucide_react_1.Loader2, { className: "w-3 h-3 animate-spin mr-1" })) : (React.createElement(lucide_react_1.Download, { className: "w-3 h-3 mr-1" })),
                                    "HTML"),
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleExportPDF(payslip.id, payslip.payPeriod); }, className: "text-xs" },
                                    React.createElement(lucide_react_1.FileJson, { className: "w-3 h-3 mr-1" }),
                                    "PDF"),
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setSelectedPayslipForNote(payslip.id); }, className: "text-xs" },
                                    React.createElement(lucide_react_1.MessageSquare, { className: "w-3 h-3 mr-1" }),
                                    "Note"),
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setReprintPayslipId(payslip.id); }, className: "text-xs" },
                                    React.createElement(lucide_react_1.MoreVertical, { className: "w-3 h-3 mr-1" }),
                                    "Reprint")),
                            selectedPayslipForNote === payslip.id && (React.createElement("div", { className: "mt-4 pt-4 border-t bg-gray-50 rounded p-3" },
                                React.createElement("p", { className: "text-xs font-medium mb-2" }, "Add a note to this payslip:"),
                                React.createElement("textarea", { value: noteText, onChange: function (e) { return setNoteText(e.target.value); }, placeholder: "Enter your note here (max 500 characters)", maxLength: 500, className: "w-full p-2 border rounded text-xs", rows: 3 }),
                                React.createElement("div", { className: "flex gap-2 mt-2" },
                                    React.createElement(button_1.Button, { size: "sm", onClick: function () { return handleSaveNote(payslip.id); }, disabled: savingNote, className: "text-xs" },
                                        savingNote ? React.createElement(lucide_react_1.Loader2, { className: "w-3 h-3 animate-spin mr-1" }) : null,
                                        "Save Note"),
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                            setSelectedPayslipForNote(null);
                                            setNoteText("");
                                        }, className: "text-xs" }, "Cancel")))),
                            reprintPayslipId === payslip.id && (React.createElement("div", { className: "mt-4 pt-4 border-t bg-gray-50 rounded p-3" },
                                React.createElement("p", { className: "text-xs font-medium mb-2" }, "Request payslip reprint:"),
                                React.createElement("textarea", { value: reprintReason, onChange: function (e) { return setReprintReason(e.target.value); }, placeholder: "Reason for reprint (optional)", maxLength: 500, className: "w-full p-2 border rounded text-xs", rows: 2 }),
                                React.createElement("div", { className: "flex gap-2 mt-2" },
                                    React.createElement(button_1.Button, { size: "sm", onClick: function () { return handleRequestReprint(payslip.id); }, disabled: submittingReprint, className: "text-xs" },
                                        submittingReprint ? React.createElement(lucide_react_1.Loader2, { className: "w-3 h-3 animate-spin mr-1" }) : null,
                                        "Submit Request"),
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                            setReprintPayslipId(null);
                                            setReprintReason("");
                                        }, className: "text-xs" }, "Cancel")))))); }))) : (React.createElement("div", { className: "text-center py-8 text-gray-500" },
                            React.createElement(lucide_react_1.FileText, { className: "w-12 h-12 mx-auto text-gray-300 mb-2" }),
                            React.createElement("p", null, "No payslips available yet"),
                            React.createElement("p", { className: "text-xs mt-1" }, "Your payslips will appear here once they're generated"))))))))))));
}
exports["default"] = StaffDashboard;
