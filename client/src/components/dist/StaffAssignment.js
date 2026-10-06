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
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var date_fns_1 = require("date-fns");
function StaffAssignment(_a) {
    var _this = this;
    var projectId = _a.projectId, _b = _a.readonly, readonly = _b === void 0 ? false : _b;
    var _c = react_1.useState(false), isDialogOpen = _c[0], setIsDialogOpen = _c[1];
    var _d = react_1.useState(false), isEditDialogOpen = _d[0], setIsEditDialogOpen = _d[1];
    var _e = react_1.useState(false), isDeleteOpen = _e[0], setIsDeleteOpen = _e[1];
    var _f = react_1.useState(null), selectedMember = _f[0], setSelectedMember = _f[1];
    var _g = react_1.useState({
        employeeId: "",
        role: "",
        hoursAllocated: "",
        startDate: "",
        endDate: ""
    }), formData = _g[0], setFormData = _g[1];
    var _h = trpc_1.trpc.projects.teamMembers.list.useQuery({ projectId: projectId }), _j = _h.data, teamMembers = _j === void 0 ? [] : _j, isLoadingTeam = _h.isLoading, refetchTeam = _h.refetch;
    var _k = trpc_1.trpc.employees.list.useQuery({}), _l = _k.data, employees = _l === void 0 ? [] : _l, isLoadingEmployees = _k.isLoading;
    var createMutation = trpc_1.trpc.projects.teamMembers.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Team member added successfully");
            setIsDialogOpen(false);
            resetForm();
            refetchTeam();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to add team member: " + error.message);
        }
    });
    var updateMutation = trpc_1.trpc.projects.teamMembers.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Team member updated successfully");
            setIsEditDialogOpen(false);
            setSelectedMember(null);
            refetchTeam();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update team member: " + error.message);
        }
    });
    var deleteMutation = trpc_1.trpc.projects.teamMembers["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Team member removed successfully");
            setIsDeleteOpen(false);
            setSelectedMember(null);
            refetchTeam();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to remove team member: " + error.message);
        }
    });
    var resetForm = function () {
        setFormData({
            employeeId: "",
            role: "",
            hoursAllocated: "",
            startDate: "",
            endDate: ""
        });
    };
    var handleAddMember = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formData.employeeId) {
                        sonner_1.toast.error("Please select an employee");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](createMutation, {
                            projectId: projectId,
                            employeeId: formData.employeeId,
                            role: formData.role || undefined,
                            hoursAllocated: formData.hoursAllocated ? parseInt(formData.hoursAllocated) : undefined,
                            startDate: formData.startDate || undefined,
                            endDate: formData.endDate || undefined
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error adding team member:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdateMember = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedMember)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](updateMutation, {
                            id: selectedMember.id,
                            role: formData.role || undefined,
                            hoursAllocated: formData.hoursAllocated ? parseInt(formData.hoursAllocated) : undefined,
                            startDate: formData.startDate || undefined,
                            endDate: formData.endDate || undefined
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error updating team member:", error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteMember = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedMember)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteMutation, {
                            id: selectedMember.id
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error("Error deleting team member:", error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var openEditDialog = function (member) {
        var _a;
        setSelectedMember(member);
        var employee = employees.find(function (e) { return e.id === member.employeeId; });
        setFormData({
            employeeId: member.employeeId,
            role: member.role || "",
            hoursAllocated: ((_a = member.hoursAllocated) === null || _a === void 0 ? void 0 : _a.toString()) || "",
            startDate: member.startDate ? new Date(member.startDate).toISOString().split('T')[0] : "",
            endDate: member.endDate ? new Date(member.endDate).toISOString().split('T')[0] : ""
        });
        setIsEditDialogOpen(true);
    };
    var getEmployeeFullName = function (employeeId) {
        var employee = employees.find(function (e) { return e.id === employeeId; });
        if (employee) {
            return employee.firstName + " " + employee.lastName;
        }
        return "Unknown Employee";
    };
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }),
                    React.createElement("div", null,
                        React.createElement(card_1.CardTitle, null, "Project Team"),
                        React.createElement(card_1.CardDescription, null, "Manage team members assigned to this project"))),
                !readonly && (React.createElement(dialog_1.Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, { size: "sm" },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                            "Add Member")),
                    React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[500px]" },
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null, "Add Team Member"),
                            React.createElement(dialog_1.DialogDescription, null, "Assign an employee to this project with their role and allocation details")),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Employee"),
                                React.createElement(select_1.Select, { value: formData.employeeId, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { employeeId: value })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select an employee" })),
                                    React.createElement(select_1.SelectContent, null, employees.map(function (employee) { return (React.createElement(select_1.SelectItem, { key: employee.id, value: employee.id }, employee.firstName + " " + employee.lastName,
                                        " (",
                                        employee.position || "No position",
                                        ")")); })))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Role on Project"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Lead Developer, Designer", value: formData.role, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { role: e.target.value })); } })),
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Hours Allocated"),
                                    React.createElement(input_1.Input, { type: "number", placeholder: "e.g., 40", value: formData.hoursAllocated, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { hoursAllocated: e.target.value })); } })),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Start Date"),
                                    React.createElement(input_1.Input, { type: "date", value: formData.startDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { startDate: e.target.value })); } }))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "End Date (Optional)"),
                                React.createElement(input_1.Input, { type: "date", value: formData.endDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { endDate: e.target.value })); } })),
                            React.createElement("div", { className: "flex justify-end gap-2 pt-4" },
                                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsDialogOpen(false); } }, "Cancel"),
                                React.createElement(button_1.Button, { onClick: handleAddMember, disabled: createMutation.isPending }, createMutation.isPending ? "Adding..." : "Add Member")))))))),
        React.createElement(card_1.CardContent, null, isLoadingTeam ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "Loading team members...")) : teamMembers.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "No team members assigned yet")) : (React.createElement("div", { className: "space-y-3" }, teamMembers
            .filter(function (member) { return member.isActive; })
            .map(function (member) { return (React.createElement("div", { key: member.id, className: "flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition" },
            React.createElement("div", { className: "flex-1" },
                React.createElement("div", { className: "flex items-center gap-2 mb-2" },
                    React.createElement("h4", { className: "font-medium" }, getEmployeeFullName(member.employeeId)),
                    member.role && React.createElement(badge_1.Badge, { variant: "secondary" }, member.role)),
                React.createElement("div", { className: "flex gap-4 text-sm text-muted-foreground flex-wrap" },
                    member.hoursAllocated && (React.createElement("div", { className: "flex items-center gap-1" },
                        React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" }),
                        member.hoursAllocated,
                        " hours")),
                    member.startDate && (React.createElement("div", { className: "flex items-center gap-1" },
                        React.createElement(lucide_react_1.Calendar, { className: "h-3 w-3" }),
                        date_fns_1.format(new Date(member.startDate), "MMM dd, yyyy"),
                        member.endDate && " - " + date_fns_1.format(new Date(member.endDate), "MMM dd, yyyy"))))),
            !readonly && (React.createElement("div", { className: "flex gap-2 ml-4" },
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return openEditDialog(member); } },
                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-red-500 hover:text-red-700 hover:bg-red-50", onClick: function () {
                        setSelectedMember(member);
                        setIsDeleteOpen(true);
                    } },
                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); })))),
        React.createElement(dialog_1.Dialog, { open: isEditDialogOpen, onOpenChange: setIsEditDialogOpen },
            React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[500px]" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Edit Team Member"),
                    React.createElement(dialog_1.DialogDescription, null, "Update the team member's role and allocation details")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Employee"),
                        React.createElement(input_1.Input, { disabled: true, value: selectedMember ? getEmployeeFullName(selectedMember.employeeId) : "" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Role on Project"),
                        React.createElement(input_1.Input, { placeholder: "e.g., Lead Developer, Designer", value: formData.role, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { role: e.target.value })); } })),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Hours Allocated"),
                            React.createElement(input_1.Input, { type: "number", placeholder: "e.g., 40", value: formData.hoursAllocated, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { hoursAllocated: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Start Date"),
                            React.createElement(input_1.Input, { type: "date", value: formData.startDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { startDate: e.target.value })); } }))),
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "End Date (Optional)"),
                        React.createElement(input_1.Input, { type: "date", value: formData.endDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { endDate: e.target.value })); } })),
                    React.createElement("div", { className: "flex justify-end gap-2 pt-4" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsEditDialogOpen(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleUpdateMember, disabled: updateMutation.isPending }, updateMutation.isPending ? "Saving..." : "Save Changes"))))),
        React.createElement(alert_dialog_1.AlertDialog, { open: isDeleteOpen, onOpenChange: setIsDeleteOpen },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Remove Team Member"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null,
                    "Are you sure you want to remove ",
                    selectedMember ? getEmployeeFullName(selectedMember.employeeId) : "this employee",
                    " from this project? This action cannot be undone."),
                React.createElement("div", { className: "flex justify-end gap-2" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { className: "bg-red-500 hover:bg-red-600", onClick: handleDeleteMember, disabled: deleteMutation.isPending }, deleteMutation.isPending ? "Removing..." : "Remove"))))));
}
exports["default"] = StaffAssignment;
