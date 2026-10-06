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
var wouter_1 = require("wouter");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var sonner_1 = require("sonner");
var statusConfig = {
    present: { label: "Present", className: "bg-green-100 text-green-800 border-green-200" },
    absent: { label: "Absent", className: "bg-red-100 text-red-800 border-red-200" },
    late: { label: "Late", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    leave: { label: "Leave", className: "bg-blue-100 text-blue-800 border-blue-200" }
};
function AttendanceDetails() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(false), showDeleteModal = _b[0], setShowDeleteModal = _b[1];
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    // Fetch attendance record from backend
    var _d = trpc_1.trpc.attendance.getById.useQuery(id || ""), attendanceData = _d.data, isLoading = _d.isLoading;
    var _e = trpc_1.trpc.employees.list.useQuery({}).data, employeesData = _e === void 0 ? [] : _e;
    var utils = trpc_1.trpc.useUtils();
    var deleteAttendanceMutation = trpc_1.trpc.attendance["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Attendance record deleted successfully");
            utils.attendance.list.invalidate();
            setLocation("/attendance");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete attendance record");
        }
    });
    // Get employee info
    var employee = attendanceData ? employeesData.find(function (e) { return e.id === attendanceData.employeeId; }) : null;
    var attendanceRecord = attendanceData ? {
        id: id,
        employeeId: attendanceData.employeeId || "Unknown",
        employeeName: employee ? employee.firstName + " " + employee.lastName : "Unknown Employee",
        date: attendanceData.date ? new Date(attendanceData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        checkIn: attendanceData.checkInTime ? new Date(attendanceData.checkInTime).toLocaleTimeString() : "Not checked in",
        checkOut: attendanceData.checkOutTime ? new Date(attendanceData.checkOutTime).toLocaleTimeString() : "Not checked out",
        status: attendanceData.status || "absent",
        hoursWorked: attendanceData.checkInTime && attendanceData.checkOutTime
            ? ((new Date(attendanceData.checkOutTime).getTime() - new Date(attendanceData.checkInTime).getTime()) / (1000 * 60 * 60)).toFixed(2)
            : 0,
        notes: attendanceData.notes || ""
    } : null;
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteAttendanceMutation, id || "")];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Attendance Details", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Attendance", href: "/attendance" },
                { label: "Details" },
            ], backLink: { label: "Attendance", href: "/attendance" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading attendance record..."))));
    }
    if (!attendanceRecord) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Attendance Details", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Attendance", href: "/attendance" },
                { label: "Details" },
            ], backLink: { label: "Attendance", href: "/attendance" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Attendance record not found"),
                React.createElement(button_1.Button, { onClick: function () { return setLocation("/attendance"); } }, "Back to Attendance"))));
    }
    var status = statusConfig[attendanceRecord.status] || statusConfig.absent;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Attendance Details", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "HR", href: "/hr" },
            { label: "Attendance", href: "/attendance" },
            { label: "Details" },
        ], backLink: { label: "Attendance", href: "/attendance" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex flex-col lg:flex-row gap-6" },
                React.createElement("div", { className: "w-full lg:w-80 shrink-0 space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement("div", { className: "flex flex-col items-center text-center space-y-3" },
                                React.createElement("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold" }, attendanceRecord.employeeName.split(" ").map(function (n) { return n[0]; }).join("").toUpperCase()),
                                React.createElement("h2", { className: "text-lg font-semibold" }, attendanceRecord.employeeName),
                                React.createElement(badge_1.Badge, { className: status.className }, status.label)),
                            React.createElement("div", { className: "mt-6 space-y-4" },
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.CalendarDays, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Date"),
                                        React.createElement("p", { className: "text-sm font-medium" }, attendanceRecord.date ? new Date(attendanceRecord.date).toLocaleDateString() : "-"))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.LogIn, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clock In"),
                                        React.createElement("p", { className: "text-sm font-medium" }, attendanceRecord.checkIn))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.LogOut, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Clock Out"),
                                        React.createElement("p", { className: "text-sm font-medium" }, attendanceRecord.checkOut))),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement(lucide_react_1.Clock, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Hours Worked"),
                                        React.createElement("p", { className: "text-sm font-medium" },
                                            attendanceRecord.hoursWorked,
                                            " hours")))),
                            React.createElement("div", { className: "flex gap-2 mt-6" },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "flex-1 gap-1.5", onClick: function () { return setLocation("/attendance/" + id + "/edit"); } },
                                    React.createElement(lucide_react_1.Edit2, { className: "w-3.5 h-3.5" }),
                                    "Edit"),
                                React.createElement(button_1.Button, { variant: "destructive", size: "sm", className: "flex-1 gap-1.5", onClick: function () { return setShowDeleteModal(true); } },
                                    React.createElement(lucide_react_1.Trash2, { className: "w-3.5 h-3.5" }),
                                    "Delete"))))),
                React.createElement("div", { className: "flex-1 min-w-0 space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                                React.createElement(lucide_react_1.FileText, { className: "w-4 h-4" }),
                                "Additional Details")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Employee ID"),
                                React.createElement("p", { className: "font-medium" }, attendanceRecord.employeeId)),
                            attendanceRecord.notes ? (React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Notes"),
                                React.createElement("p", { className: "font-medium whitespace-pre-wrap" }, attendanceRecord.notes))) : (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground" },
                                React.createElement(lucide_react_1.MapPin, { className: "w-8 h-8 mb-2 opacity-40" }),
                                React.createElement("p", { className: "text-sm" }, "No additional notes or location data recorded."))))))),
            React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, title: "Delete Attendance Record", description: "Are you sure you want to delete this attendance record? This action cannot be undone.", onConfirm: handleDelete, onCancel: function () { return setShowDeleteModal(false); }, isLoading: isDeleting }))));
}
exports["default"] = AttendanceDetails;
