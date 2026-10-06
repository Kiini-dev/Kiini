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
function CreateLeaveRequest() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState({
        employeeId: "",
        leaveType: "annual",
        startDate: "",
        endDate: "",
        days: "",
        reason: ""
    }), formData = _b[0], setFormData = _b[1];
    var _c = trpc_1.trpc.employees.list.useQuery({}).data, employees = _c === void 0 ? [] : _c;
    var createLeaveRequestMutation = trpc_1.trpc.leave.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Leave request submitted successfully!");
            utils.leave.list.invalidate();
            navigate("/leave-management");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to submit leave request: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.days) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        createLeaveRequestMutation.mutate({
            employeeId: formData.employeeId,
            leaveType: formData.leaveType,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            days: parseInt(formData.days),
            reason: formData.reason || undefined
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Request Leave", description: "Submit a leave request", icon: React.createElement(lucide_react_1.Calendar, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Leave Management", href: "/leave-management" },
            { label: "Request Leave" },
        ] },
        React.createElement("div", { className: "max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Request Leave"),
                    React.createElement(card_1.CardDescription, null, "Submit a leave request")),
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
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "leaveType" }, "Leave Type *"),
                            React.createElement(select_1.Select, { value: formData.leaveType, onValueChange: function (value) {
                                    return setFormData(__assign(__assign({}, formData), { leaveType: value }));
                                } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "annual" }, "Annual Leave"),
                                    React.createElement(select_1.SelectItem, { value: "sick" }, "Sick Leave"),
                                    React.createElement(select_1.SelectItem, { value: "maternity" }, "Maternity Leave"),
                                    React.createElement(select_1.SelectItem, { value: "paternity" }, "Paternity Leave"),
                                    React.createElement(select_1.SelectItem, { value: "unpaid" }, "Unpaid Leave"),
                                    React.createElement(select_1.SelectItem, { value: "other" }, "Other")))),
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
                            React.createElement(label_1.Label, { htmlFor: "days" }, "Number of Days *"),
                            React.createElement(input_1.Input, { id: "days", type: "number", placeholder: "0", value: formData.days, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { days: e.target.value }));
                                }, min: "1" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "reason" }, "Reason"),
                            React.createElement(textarea_1.Textarea, { id: "reason", placeholder: "Enter reason for leave request...", value: formData.reason, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { reason: e.target.value }));
                                }, rows: 4 })),
                        React.createElement("div", { className: "flex gap-4" },
                            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/leave-management"); } },
                                React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                "Cancel"),
                            React.createElement(button_1.Button, { type: "submit", disabled: createLeaveRequestMutation.isPending }, createLeaveRequestMutation.isPending
                                ? "Submitting..."
                                : "Submit Request"))))))));
}
exports["default"] = CreateLeaveRequest;
