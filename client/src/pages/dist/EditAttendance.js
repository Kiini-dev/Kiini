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
function EditAttendance() {
    var id = wouter_1.useParams().id;
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
    var _c = react_1.useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var attendance = trpc_1.trpc.attendance.getById.useQuery(id || "", { enabled: !!id }).data;
    var _d = trpc_1.trpc.employees.list.useQuery().data, employees = _d === void 0 ? [] : _d;
    react_1.useEffect(function () {
        if (attendance) {
            setFormData({
                employeeId: attendance.employeeId || "",
                date: attendance.date
                    ? new Date(attendance.date).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                checkInTime: attendance.checkInTime
                    ? new Date(attendance.checkInTime).toTimeString().slice(0, 5)
                    : "",
                checkOutTime: attendance.checkOutTime
                    ? new Date(attendance.checkOutTime).toTimeString().slice(0, 5)
                    : "",
                status: attendance.status || "present",
                notes: attendance.notes || ""
            });
            setIsLoading(false);
        }
    }, [attendance]);
    var updateAttendanceMutation = trpc_1.trpc.attendance.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Attendance record updated successfully!");
            utils.attendance.list.invalidate();
            utils.attendance.getById.invalidate(id || "");
            navigate("/attendance");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update attendance record: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.employeeId || !formData.date || !formData.status) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        updateAttendanceMutation.mutate({
            id: id || "",
            employeeId: formData.employeeId,
            date: new Date(formData.date),
            checkInTime: formData.checkInTime ? new Date(formData.date + "T" + formData.checkInTime) : undefined,
            checkOutTime: formData.checkOutTime ? new Date(formData.date + "T" + formData.checkOutTime) : undefined,
            status: formData.status,
            notes: formData.notes || undefined
        });
    };
    if (isLoading) {
        return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Attendance", description: "Update attendance record", icon: react_1["default"].createElement(lucide_react_1.Clock, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Attendance", href: "/attendance" },
                { label: "Edit Attendance" },
            ] },
            react_1["default"].createElement("div", { className: "flex items-center justify-center p-8" },
                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Attendance", description: "Update attendance record", icon: react_1["default"].createElement(lucide_react_1.Clock, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "HR", href: "/hr" },
            { label: "Attendance", href: "/attendance" },
            { label: "Edit Attendance" },
        ] },
        react_1["default"].createElement("div", { className: "max-w-2xl" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Edit Attendance"),
                    react_1["default"].createElement(card_1.CardDescription, null, "Update the attendance record below")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "employeeId" }, "Employee *"),
                            react_1["default"].createElement(select_1.Select, { value: formData.employeeId, onValueChange: function (value) {
                                    return setFormData(__assign(__assign({}, formData), { employeeId: value }));
                                } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select an employee" })),
                                react_1["default"].createElement(select_1.SelectContent, null, Array.isArray(employees) && employees.map(function (emp) { return (react_1["default"].createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                                    (emp.firstName || ""),
                                    " ",
                                    (emp.lastName || ""))); })))),
                        react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "date" }, "Date *"),
                                react_1["default"].createElement(input_1.Input, { id: "date", type: "date", value: formData.date, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { date: e.target.value }));
                                    } })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "status" }, "Status *"),
                                react_1["default"].createElement(select_1.Select, { value: formData.status, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { status: value }));
                                    } },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select status" })),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "present" }, "Present"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "absent" }, "Absent"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "late" }, "Late"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "leave" }, "Leave"))))),
                        react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "checkInTime" }, "Check-in Time"),
                                react_1["default"].createElement(input_1.Input, { id: "checkInTime", type: "time", value: formData.checkInTime, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { checkInTime: e.target.value }));
                                    } })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "checkOutTime" }, "Check-out Time"),
                                react_1["default"].createElement(input_1.Input, { id: "checkOutTime", type: "time", value: formData.checkOutTime, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { checkOutTime: e.target.value }));
                                    } }))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            react_1["default"].createElement(textarea_1.Textarea, { id: "notes", placeholder: "Add any additional notes", value: formData.notes, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { notes: e.target.value }));
                                }, rows: 4 })),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement(button_1.Button, { type: "submit", disabled: updateAttendanceMutation.isPending },
                                updateAttendanceMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                                "Update Attendance"),
                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/attendance"); } },
                                react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                "Cancel"))))))));
}
exports["default"] = EditAttendance;
