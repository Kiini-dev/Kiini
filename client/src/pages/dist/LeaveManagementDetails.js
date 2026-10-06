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
var separator_1 = require("@/components/ui/separator");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
function LeaveManagementDetails() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(false), showDeleteModal = _b[0], setShowDeleteModal = _b[1];
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    // Fetch leave request from backend
    var _d = trpc_1.trpc.leave.getById.useQuery(id || ""), leaveData = _d.data, isLoading = _d.isLoading;
    var _e = trpc_1.trpc.employees.list.useQuery().data, employeesData = _e === void 0 ? [] : _e;
    var utils = trpc_1.trpc.useUtils();
    var deleteLeaveMutation = trpc_1.trpc.leave["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Leave request deleted successfully");
            utils.leave.list.invalidate();
            setLocation("/leave-management");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete leave request");
        }
    });
    var updateStatusMutation = trpc_1.trpc.leave.update.useMutation({
        onSuccess: function (_data, variables) {
            var action = variables.status === "approved" ? "approved" : "rejected";
            sonner_1.toast.success("Leave request " + action + " successfully");
            utils.leave.getById.invalidate(id || "");
            utils.leave.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update leave request");
        }
    });
    // Get employee info
    var employee = leaveData ? employeesData.find(function (e) { return e.id === leaveData.employeeId; }) : null;
    // Calculate days
    var calculateDays = function (startDate, endDate) {
        var start = new Date(startDate);
        var end = new Date(endDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    };
    var leaveRecord = leaveData ? {
        id: id,
        employeeId: leaveData.employeeId || "Unknown",
        employeeName: employee ? employee.firstName + " " + employee.lastName : "Unknown Employee",
        leaveType: leaveData.leaveType || "Annual Leave",
        startDate: leaveData.startDate ? new Date(leaveData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: leaveData.endDate ? new Date(leaveData.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        daysRequested: leaveData.startDate && leaveData.endDate
            ? calculateDays(leaveData.startDate, leaveData.endDate)
            : 0,
        status: leaveData.status || "pending",
        reason: leaveData.reason || ""
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
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteLeaveMutation, id || "")];
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
    var getStatusVariant = function (status) {
        switch (status) {
            case "approved": return "default";
            case "rejected": return "destructive";
            case "pending": return "secondary";
            default: return "outline";
        }
    };
    var getLeaveTypeBadge = function (type) {
        return React.createElement(badge_1.Badge, { variant: "outline" }, type);
    };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Leave Request Details", icon: React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Leave Management", href: "/leave-management" },
                { label: "Details" },
            ], backLink: { label: "Leave Management", href: "/leave-management" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading leave request..."))));
    }
    if (!leaveRecord) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Leave Request Details", icon: React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Leave Management", href: "/leave-management" },
                { label: "Details" },
            ], backLink: { label: "Leave Management", href: "/leave-management" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Leave request not found"),
                React.createElement(button_1.Button, { onClick: function () { return setLocation("/leave-management"); } }, "Back to Leave Management"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Leave Request Details", icon: React.createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "HR", href: "/hr" },
            { label: "Leave Management", href: "/leave-management" },
            { label: "Details" },
        ], backLink: { label: "Leave Management", href: "/leave-management" }, actions: React.createElement("div", { className: "flex gap-2" },
            leaveRecord.status === "pending" && (React.createElement(React.Fragment, null,
                React.createElement(button_1.Button, { variant: "outline", className: "text-green-600 border-green-200 hover:bg-green-50", onClick: function () { return updateStatusMutation.mutate({ id: leaveRecord.id, status: "approved" }); }, disabled: updateStatusMutation.isPending },
                    React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 mr-2" }),
                    "Approve"),
                React.createElement(button_1.Button, { variant: "outline", className: "text-red-600 border-red-200 hover:bg-red-50", onClick: function () { return updateStatusMutation.mutate({ id: leaveRecord.id, status: "rejected" }); }, disabled: updateStatusMutation.isPending },
                    React.createElement(lucide_react_1.XCircle, { className: "h-4 w-4 mr-2" }),
                    "Reject"))),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/leave-management/" + leaveRecord.id + "/edit"); } },
                React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4 mr-2" }),
                "Edit"),
            React.createElement(button_1.Button, { variant: "destructive", onClick: function () { return setShowDeleteModal(true); } },
                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                "Delete")) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex flex-col lg:flex-row gap-6" },
                React.createElement("div", { className: "lg:w-1/3 space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement(card_1.CardTitle, { className: "text-lg" }, leaveRecord.employeeName),
                                React.createElement(badge_1.Badge, { variant: getStatusVariant(leaveRecord.status) }, leaveRecord.status.charAt(0).toUpperCase() + leaveRecord.status.slice(1)))),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Leave Type"),
                                React.createElement("div", { className: "mt-1" }, getLeaveTypeBadge(leaveRecord.leaveType))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Employee ID"),
                                React.createElement("p", { className: "font-semibold" }, leaveRecord.employeeId)),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.CalendarDays, { className: "w-4 h-4 text-muted-foreground" }),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "From - To"),
                                    React.createElement("p", { className: "font-semibold" },
                                        leaveRecord.startDate,
                                        " \u2192 ",
                                        leaveRecord.endDate))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Days Requested"),
                                React.createElement("p", { className: "text-2xl font-bold" },
                                    leaveRecord.daysRequested,
                                    " ",
                                    React.createElement("span", { className: "text-sm font-normal text-muted-foreground" }, "days")))))),
                React.createElement("div", { className: "lg:w-2/3 space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-lg" }, "Reason / Notes")),
                        React.createElement(card_1.CardContent, null, leaveRecord.reason ? (React.createElement("p", { className: "text-sm leading-relaxed" }, leaveRecord.reason)) : (React.createElement("p", { className: "text-sm text-muted-foreground" }, "No reason provided.")))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-lg" }, "Approval Information")),
                        React.createElement(card_1.CardContent, { className: "space-y-3" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Current Status"),
                                React.createElement(badge_1.Badge, { variant: getStatusVariant(leaveRecord.status) }, leaveRecord.status.charAt(0).toUpperCase() + leaveRecord.status.slice(1))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Request Duration"),
                                React.createElement("p", { className: "text-sm font-medium" },
                                    leaveRecord.daysRequested,
                                    " day(s)")),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Period"),
                                React.createElement("p", { className: "text-sm font-medium" },
                                    leaveRecord.startDate,
                                    " \u2014 ",
                                    leaveRecord.endDate)))))),
            React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, title: "Delete Leave Request", description: "Are you sure you want to delete this leave request? This action cannot be undone.", onConfirm: handleDelete, onCancel: function () { return setShowDeleteModal(false); }, isLoading: isDeleting }))));
}
exports["default"] = LeaveManagementDetails;
