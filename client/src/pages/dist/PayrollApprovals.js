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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var textarea_1 = require("@/components/ui/textarea");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
var useUserLookup_1 = require("@/hooks/useUserLookup");
function PayrollApprovals() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = react_1.useState(null), selectedApproval = _d[0], setSelectedApproval = _d[1];
    var _e = react_1.useState(false), isDetailsOpen = _e[0], setIsDetailsOpen = _e[1];
    var _f = react_1.useState(""), approverComment = _f[0], setApproverComment = _f[1];
    var _g = react_1.useState(false), isApproving = _g[0], setIsApproving = _g[1];
    var _h = react_1.useState(false), isRejecting = _h[0], setIsRejecting = _h[1];
    var _j = trpc_1.trpc.payroll.approvals.list.useQuery(), _k = _j.data, rawApprovals = _k === void 0 ? [] : _k, isLoading = _j.isLoading;
    var approvals = JSON.parse(JSON.stringify(rawApprovals)).map(function (a) { return ({
        id: a.id,
        payrollId: a.payrollId,
        employeeName: a.employeeName || "Unknown",
        basicSalary: a.basicSalary || 0,
        netSalary: a.netSalary || 0,
        status: a.status || "pending",
        requestedBy: a.approverRole || "HR",
        requestedDate: a.createdAt || "",
        approverComments: a.rejectionReason,
        approvedBy: a.approverRole,
        approvedDate: a.approvalDate
    }); });
    var approveMutation = trpc_1.trpc.payroll.approvals.approve.useMutation({
        onSuccess: function () { utils.payroll.approvals.list.invalidate(); sonner_1.toast.success("Payroll approved successfully!"); }
    });
    var rejectMutation = trpc_1.trpc.payroll.approvals.reject.useMutation({
        onSuccess: function () { utils.payroll.approvals.list.invalidate(); sonner_1.toast.success("Payroll rejected!"); }
    });
    var filteredApprovals = approvals.filter(function (approval) {
        var matchesSearch = approval.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            approval.id.toLowerCase().includes(searchQuery.toLowerCase());
        var matchesStatus = statusFilter === "all" || approval.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    var stats = {
        pending: approvals.filter(function (a) { return a.status === "pending"; }).length,
        approved: approvals.filter(function (a) { return a.status === "approved"; }).length,
        rejected: approvals.filter(function (a) { return a.status === "rejected"; }).length,
        totalAmount: approvals.reduce(function (sum, a) { return sum + (a.status === "pending" ? a.netSalary : 0); }, 0)
    };
    var handleApprove = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!selectedApproval)
                        return [2 /*return*/];
                    setIsApproving(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, approveMutation.mutateAsync({ id: selectedApproval.id })];
                case 2:
                    _b.sent();
                    setIsDetailsOpen(false);
                    setApproverComment("");
                    setSelectedApproval(null);
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    sonner_1.toast.error("Failed to approve");
                    return [3 /*break*/, 4];
                case 4:
                    setIsApproving(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleReject = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!selectedApproval || !approverComment) {
                        sonner_1.toast.error("Please provide a reason for rejection");
                        return [2 /*return*/];
                    }
                    setIsRejecting(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, rejectMutation.mutateAsync({ id: selectedApproval.id, reason: approverComment })];
                case 2:
                    _b.sent();
                    setIsDetailsOpen(false);
                    setApproverComment("");
                    setSelectedApproval(null);
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    sonner_1.toast.error("Failed to reject");
                    return [3 /*break*/, 4];
                case 4:
                    setIsRejecting(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var getStatusIcon = function (status) {
        switch (status) {
            case "approved":
                return React.createElement(lucide_react_1.CheckCircle2, { className: "w-5 h-5 text-green-600" });
            case "rejected":
                return React.createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5 text-red-600" });
            case "pending":
                return React.createElement(lucide_react_1.Clock, { className: "w-5 h-5 text-yellow-600" });
            default:
                return null;
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payroll Approvals", description: "Review and approve/reject payroll records", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Approvals" },
        ], backLink: { label: "Payroll", href: "/payroll" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600 flex items-center gap-2" },
                            React.createElement(lucide_react_1.Clock, { className: "w-4 h-4 text-yellow-600" }),
                            "Pending Reviews")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-2xl font-bold" }, stats.pending),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Awaiting approval"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600 flex items-center gap-2" },
                            React.createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 text-green-600" }),
                            "Approved")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-2xl font-bold" }, stats.approved),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Ready to process"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600 flex items-center gap-2" },
                            React.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-red-600" }),
                            "Rejected")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-2xl font-bold" }, stats.rejected),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Needs revision"))),
                React.createElement(stats_card_1.StatsCard, { label: "Pending Amount", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        stats.totalAmount.toLocaleString()), description: "To be paid", color: "border-l-blue-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Payroll Records")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement(tabs_1.Tabs, { defaultValue: "all", onValueChange: setStatusFilter },
                        React.createElement("div", { className: "overflow-x-auto" },
                            React.createElement(tabs_1.TabsList, { className: "w-full sm:w-auto" },
                                React.createElement(tabs_1.TabsTrigger, { value: "all" }, "All"),
                                React.createElement(tabs_1.TabsTrigger, { value: "pending" }, "Pending"),
                                React.createElement(tabs_1.TabsTrigger, { value: "approved" }, "Approved"),
                                React.createElement(tabs_1.TabsTrigger, { value: "rejected" }, "Rejected")))),
                    React.createElement("div", { className: "relative" },
                        React.createElement(lucide_react_1.Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-gray-400" }),
                        React.createElement(input_1.Input, { placeholder: "Search by employee or ID...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-8" })),
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Employee"),
                                    React.createElement(table_1.TableHead, null, "Approval ID"),
                                    React.createElement(table_1.TableHead, null, "Basic Salary (Ksh)"),
                                    React.createElement(table_1.TableHead, null, "Net Salary (Ksh)"),
                                    React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, null, "Requested Date"),
                                    React.createElement(table_1.TableHead, null, "Actions"))),
                            React.createElement(table_1.TableBody, null, filteredApprovals.length === 0 ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-gray-500" }, "No payroll records found"))) : (filteredApprovals.map(function (approval) { return (React.createElement(table_1.TableRow, { key: approval.id },
                                React.createElement(table_1.TableCell, { className: "font-medium" }, approval.employeeName),
                                React.createElement(table_1.TableCell, { className: "text-sm text-gray-600" }, approval.id),
                                React.createElement(table_1.TableCell, null, approval.basicSalary.toLocaleString()),
                                React.createElement(table_1.TableCell, { className: "font-semibold" }, approval.netSalary.toLocaleString()),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        getStatusIcon(approval.status),
                                        React.createElement(badge_1.Badge, { className: approval.status === "approved"
                                                ? "bg-green-100 text-green-800"
                                                : approval.status === "rejected"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-yellow-100 text-yellow-800" }, approval.status.charAt(0).toUpperCase() + approval.status.slice(1)))),
                                React.createElement(table_1.TableCell, { className: "text-sm text-gray-600" }, new Date(approval.requestedDate).toLocaleDateString()),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                            setSelectedApproval(approval);
                                            setIsDetailsOpen(true);
                                        } }, "View")))); })))))))),
        React.createElement(dialog_1.Dialog, { open: isDetailsOpen, onOpenChange: setIsDetailsOpen },
            React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Payroll Approval Review"),
                    React.createElement(dialog_1.DialogDescription, null, "Review and approve/reject this payroll record")),
                selectedApproval && (React.createElement("div", { className: "space-y-6" },
                    React.createElement("div", { className: "bg-gray-50 rounded-lg p-4 space-y-3" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-sm text-gray-600" }, "Employee"),
                            React.createElement("span", { className: "font-medium" }, selectedApproval.employeeName)),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-sm text-gray-600" }, "Approval ID"),
                            React.createElement("span", { className: "font-medium text-sm" }, selectedApproval.id)),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-sm text-gray-600" }, "Requested Date"),
                            React.createElement("span", { className: "font-medium" }, new Date(selectedApproval.requestedDate).toLocaleDateString()))),
                    React.createElement("div", { className: "space-y-3 border rounded-lg p-4" },
                        React.createElement("h3", { className: "font-semibold text-sm" }, "Salary Breakdown"),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("div", { className: "flex justify-between" },
                                React.createElement("span", { className: "text-sm text-gray-600" }, "Basic Salary"),
                                React.createElement("span", { className: "font-medium" },
                                    "Ksh ",
                                    selectedApproval.basicSalary.toLocaleString())),
                            React.createElement("div", { className: "flex justify-between pt-2 border-t" },
                                React.createElement("span", { className: "text-sm font-medium" }, "Net Salary"),
                                React.createElement("span", { className: "font-bold text-green-700" },
                                    "Ksh ",
                                    selectedApproval.netSalary.toLocaleString())))),
                    React.createElement("div", { className: "bg-blue-50 rounded-lg p-4" },
                        React.createElement("div", { className: "flex items-center gap-2 mb-2" },
                            getStatusIcon(selectedApproval.status),
                            React.createElement("span", { className: "font-medium" },
                                "Status: ",
                                selectedApproval.status.toUpperCase())),
                        selectedApproval.approverComments && (React.createElement("p", { className: "text-sm text-gray-600 mt-2" }, selectedApproval.approverComments))),
                    selectedApproval.status === "pending" && (React.createElement("div", { className: "space-y-3 border-t pt-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "comment" }, "Your Comments"),
                            React.createElement(textarea_1.Textarea, { id: "comment", placeholder: "Add your approval/rejection comments...", value: approverComment, onChange: function (e) { return setApproverComment(e.target.value); }, className: "mt-1" })),
                        React.createElement("div", { className: "flex gap-2 pt-2" },
                            React.createElement(button_1.Button, { onClick: handleApprove, disabled: isApproving, className: "flex-1 bg-green-600 hover:bg-green-700" },
                                React.createElement(lucide_react_1.ThumbsUp, { className: "w-4 h-4 mr-2" }),
                                isApproving ? "Approving..." : "Approve"),
                            React.createElement(button_1.Button, { onClick: handleReject, disabled: isRejecting || !approverComment, variant: "destructive", className: "flex-1" },
                                React.createElement(lucide_react_1.ThumbsDown, { className: "w-4 h-4 mr-2" }),
                                isRejecting ? "Rejecting..." : "Reject")))),
                    selectedApproval.status !== "pending" && (React.createElement("div", { className: "bg-gray-50 rounded-lg p-4" },
                        React.createElement("div", { className: "text-sm space-y-2" },
                            React.createElement("div", { className: "flex justify-between" },
                                React.createElement("span", { className: "text-gray-600" }, "Approved By"),
                                React.createElement("span", { className: "font-medium" }, getUserName(selectedApproval.approvedBy) || selectedApproval.approvedBy)),
                            React.createElement("div", { className: "flex justify-between" },
                                React.createElement("span", { className: "text-gray-600" }, "Approval Date"),
                                React.createElement("span", { className: "font-medium" }, selectedApproval.approvedDate && new Date(selectedApproval.approvedDate).toLocaleDateString())))))))))));
}
exports["default"] = PayrollApprovals;
