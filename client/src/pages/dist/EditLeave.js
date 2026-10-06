"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function EditLeave() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState({
        employeeId: "",
        leaveType: "annual",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        reason: "",
        status: "pending",
        notes: ""
    }), formData = _b[0], setFormData = _b[1];
    var _c = react_1.useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var leave = trpc_1.trpc.leave.getById.useQuery(id || "", { enabled: !!id }).data;
    var _d = trpc_1.trpc.employees.list.useQuery().data, employees = _d === void 0 ? [] : _d;
    react_1.useEffect(function () {
        if (leave) {
            setFormData({
                employeeId: leave.employeeId || "",
                leaveType: leave.leaveType || "annual",
                startDate: leave.startDate
                    ? new Date(leave.startDate).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                endDate: leave.endDate
                    ? new Date(leave.endDate).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                reason: leave.reason || "",
                status: leave.status || "pending",
                notes: leave.notes || ""
            });
            setIsLoading(false);
        }
    }, [leave]);
    var updateLeaveMutation = trpc_1.trpc.leave.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Leave request updated successfully!");
            utils.leave.list.invalidate();
            utils.leave.getById.invalidate(id || "");
            navigate("/leave-management");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update leave request: " + error.message);
        }
    });
    var deleteLeaveMutation = trpc_1.trpc.leave["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Leave request deleted successfully!");
            utils.leave.list.invalidate();
            navigate("/leave-management");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete leave request: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.employeeId || !formData.startDate || !formData.endDate) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        updateLeaveMutation.mutate({
            id: id || "",
            employeeId: formData.employeeId,
            leaveType: formData.leaveType,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            reason: formData.reason || undefined,
            status: formData.status,
            notes: formData.notes || undefined
        });
    };
    var handleDelete = function () {
        if (confirm("Are you sure you want to delete this leave request? This action cannot be undone.")) {
            deleteLeaveMutation.mutate(id || "");
        }
    };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Leave Request", description: "Update leave request", icon: React.createElement(lucide_react_1.Calendar, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Leave Management", href: "/leave-management" },
                { label: "Edit Leave Request" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center p-8" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Leave Request", description: "Update leave request", icon: React.createElement(lucide_react_1.Calendar, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "HR", href: "/hr" },
            { label: "Leave Management", href: "/leave-management" },
            { label: "Edit Leave Request" },
        ] },
        React.createElement("div", { className: "max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Edit Leave Request"),
                    React.createElement(card_1.CardDescription, null, "Update the leave request details below")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "employeeId" }, "Employee *"),
                            React.createElement(select_1.Select, { value: formData.employeeId, onValueChange: function (value) {
                                    return setFormData(__assign(__assign({}, formData), { employeeId: value }));
                                } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select an employee" })),
                                React.createElement(select_1.SelectContent, null, Array.isArray(employees) && employees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                                    (emp.firstName || ""),
                                    " ",
                                    (emp.lastName || ""))); })))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "leaveType" }, "Leave Type"),
                                React.createElement(select_1.Select, { value: formData.leaveType, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { leaveType: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select leave type" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "annual" }, "Annual Leave"),
                                        React.createElement(select_1.SelectItem, { value: "sick" }, "Sick Leave"),
                                        React.createElement(select_1.SelectItem, { value: "maternity" }, "Maternity Leave"),
                                        React.createElement(select_1.SelectItem, { value: "paternity" }, "Paternity Leave"),
                                        React.createElement(select_1.SelectItem, { value: "unpaid" }, "Unpaid Leave")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                                React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { status: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select status" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                        React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                        React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"))))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "startDate" }, "Start Date *"),
                                React.createElement(input_1.Input, { id: "startDate", type: "date", value: formData.startDate, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { startDate: e.target.value }));
                                    } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "endDate" }, "End Date *"),
                                React.createElement(input_1.Input, { id: "endDate", type: "date", value: formData.endDate, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { endDate: e.target.value }));
                                    } }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "reason" }, "Reason"),
                            React.createElement(textarea_1.Textarea, { id: "reason", placeholder: "Enter the reason for leave", value: formData.reason, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { reason: e.target.value }));
                                }, rows: 4 })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            React.createElement(textarea_1.Textarea, { id: "notes", placeholder: "Add any additional notes", value: formData.notes, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { notes: e.target.value }));
                                }, rows: 3 })),
                        React.createElement("div", { className: "flex gap-2 justify-between" },
                            React.createElement(button_1.Button, { type: "button", variant: "destructive", onClick: handleDelete, disabled: deleteLeaveMutation.isPending },
                                deleteLeaveMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" })),
                                "Delete"),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/leave-management"); } },
                                    React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                    "Cancel"),
                                React.createElement(button_1.Button, { type: "submit", disabled: updateLeaveMutation.isPending },
                                    updateLeaveMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" })),
                                    "Update Leave Request")))))))));
}
exports["default"] = EditLeave;
