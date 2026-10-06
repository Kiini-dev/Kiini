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
function CreateAttendance() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState({
        employeeId: "",
        date: new Date().toISOString().split("T")[0],
        checkInTime: "",
        checkOutTime: "",
        status: "present",
        notes: ""
    }), formData = _b[0], setFormData = _b[1];
    var _c = trpc_1.trpc.employees.list.useQuery({}).data, employees = _c === void 0 ? [] : _c;
    var createAttendanceMutation = trpc_1.trpc.attendance.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Attendance record created successfully!");
            utils.attendance.list.invalidate();
            navigate("/attendance");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create attendance record: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.employeeId || !formData.date || !formData.status) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        createAttendanceMutation.mutate({
            employeeId: formData.employeeId,
            date: new Date(formData.date),
            checkInTime: formData.checkInTime ? new Date(formData.date + "T" + formData.checkInTime) : undefined,
            checkOutTime: formData.checkOutTime ? new Date(formData.date + "T" + formData.checkOutTime) : undefined,
            status: formData.status,
            notes: formData.notes || undefined
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Record Attendance", description: "Record employee attendance", icon: React.createElement(lucide_react_1.Clock, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Attendance", href: "/attendance" },
            { label: "Record Attendance" },
        ] },
        React.createElement("div", { className: "max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Record Attendance"),
                    React.createElement(card_1.CardDescription, null, "Record employee attendance for the day")),
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
                                React.createElement(label_1.Label, { htmlFor: "date" }, "Date *"),
                                React.createElement(input_1.Input, { id: "date", type: "date", value: formData.date, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { date: e.target.value }));
                                    } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "status" }, "Status *"),
                                React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { status: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "present" }, "Present"),
                                        React.createElement(select_1.SelectItem, { value: "absent" }, "Absent"),
                                        React.createElement(select_1.SelectItem, { value: "late" }, "Late"),
                                        React.createElement(select_1.SelectItem, { value: "half_day" }, "Half Day"),
                                        React.createElement(select_1.SelectItem, { value: "leave" }, "Leave"))))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "checkInTime" }, "Check-in Time"),
                                React.createElement(input_1.Input, { id: "checkInTime", type: "time", value: formData.checkInTime, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { checkInTime: e.target.value }));
                                    } })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "checkOutTime" }, "Check-out Time"),
                                React.createElement(input_1.Input, { id: "checkOutTime", type: "time", value: formData.checkOutTime, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { checkOutTime: e.target.value }));
                                    } }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            React.createElement(textarea_1.Textarea, { id: "notes", placeholder: "Add any notes about attendance...", value: formData.notes, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { notes: e.target.value }));
                                }, rows: 3 })),
                        React.createElement("div", { className: "flex gap-4" },
                            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/attendance"); } },
                                React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                "Cancel"),
                            React.createElement(button_1.Button, { type: "submit", disabled: createAttendanceMutation.isPending }, createAttendanceMutation.isPending
                                ? "Recording..."
                                : "Record Attendance"))))))));
}
exports["default"] = CreateAttendance;
