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
exports.ProjectTeamSelector = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var PROJECT_TEAM_ROLES = [
    { id: 'project_manager', label: 'Project Manager' },
    { id: 'team_lead', label: 'Team Lead' },
    { id: 'developer', label: 'Developer' },
    { id: 'designer', label: 'Designer' },
    { id: 'qa', label: 'QA Engineer' },
    { id: 'devops', label: 'DevOps Engineer' },
    { id: 'business_analyst', label: 'Business Analyst' },
    { id: 'product_owner', label: 'Product Owner' },
    { id: 'scrum_master', label: 'Scrum Master' },
    { id: 'tech_lead', label: 'Technical Lead' },
    { id: 'other', label: 'Other' },
];
function ProjectTeamSelector(_a) {
    var projectId = _a.projectId, onMemberAdded = _a.onMemberAdded, onMemberRemoved = _a.onMemberRemoved;
    var _b = react_1.useState(false), showForm = _b[0], setShowForm = _b[1];
    var _c = react_1.useState({
        employeeId: "",
        role: "developer",
        hoursAllocated: 40,
        startDate: "",
        endDate: ""
    }), formData = _c[0], setFormData = _c[1];
    var _d = trpc_1.trpc.employees.list.useQuery({}), _e = _d.data, employees = _e === void 0 ? [] : _e, employeesLoading = _d.isLoading;
    var _f = trpc_1.trpc.projects.teamMembers.list.useQuery({ projectId: projectId }), _g = _f.data, teamMembers = _g === void 0 ? [] : _g, teamLoading = _f.isLoading, refetchTeam = _f.refetch;
    var addMemberMutation = trpc_1.trpc.projects.teamMembers.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Team member added successfully");
            refetchTeam();
            setFormData({
                employeeId: "",
                role: "developer",
                hoursAllocated: 40,
                startDate: "",
                endDate: ""
            });
            setShowForm(false);
            onMemberAdded === null || onMemberAdded === void 0 ? void 0 : onMemberAdded();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to add team member");
        }
    });
    var removeMemberMutation = trpc_1.trpc.projects.teamMembers["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Team member removed successfully");
            refetchTeam();
            onMemberRemoved === null || onMemberRemoved === void 0 ? void 0 : onMemberRemoved();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to remove team member");
        }
    });
    var handleAddMember = function (e) {
        e.preventDefault();
        if (!formData.employeeId) {
            sonner_1.toast.error("Please select an employee");
            return;
        }
        addMemberMutation.mutate({
            projectId: projectId,
            employeeId: formData.employeeId,
            role: formData.role,
            hoursAllocated: formData.hoursAllocated || undefined,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined
        });
    };
    var handleRemoveMember = function (memberId) {
        if (confirm("Are you sure you want to remove this team member?")) {
            removeMemberMutation.mutate({ id: memberId });
        }
    };
    // Get employees that are not already on the team
    var availableEmployees = react_1.useMemo(function () {
        var assignedIds = new Set(teamMembers.map(function (m) { return m.employeeId; }));
        return employees.filter(function (emp) { return !assignedIds.has(emp.id); });
    }, [employees, teamMembers]);
    if (teamLoading) {
        return (React.createElement("div", { className: "flex justify-center items-center h-32" },
            React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" })));
    }
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }),
                    "Project Team"),
                React.createElement(card_1.CardDescription, null,
                    teamMembers.length,
                    " member",
                    teamMembers.length !== 1 ? 's' : '',
                    " assigned")),
            React.createElement(card_1.CardContent, null, teamMembers.length === 0 ? (React.createElement(alert_1.Alert, null,
                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                React.createElement(alert_1.AlertDescription, null, "No team members assigned yet. Add team members to get started."))) : (React.createElement("div", { className: "space-y-3" }, teamMembers.map(function (member) {
                var _a;
                return (React.createElement("div", { key: member.id, className: "flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("div", { className: "font-medium" }, member.employeeName || "Employee " + member.employeeId),
                        React.createElement("div", { className: "text-sm text-gray-600" },
                            member.role ? ((_a = PROJECT_TEAM_ROLES.find(function (r) { return r.id === member.role; })) === null || _a === void 0 ? void 0 : _a.label) || member.role : 'Team Member',
                            member.hoursAllocated && " \u2022 " + member.hoursAllocated + " hrs/week"),
                        member.startDate && (React.createElement("div", { className: "text-xs text-gray-500" },
                            new Date(member.startDate).toLocaleDateString(),
                            member.endDate && " - " + new Date(member.endDate).toLocaleDateString()))),
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleRemoveMember(member.id); }, disabled: removeMemberMutation.isPending, className: "text-red-600 hover:text-red-700 hover:bg-red-50" },
                        React.createElement(lucide_react_1.X, { className: "h-4 w-4" }))));
            }))))),
        showForm && (React.createElement(card_1.Card, { className: "border-amber-200 bg-amber-50" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-base" }, "Add Team Member")),
            React.createElement(card_1.CardContent, null,
                React.createElement("form", { onSubmit: handleAddMember, className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2 md:col-span-2" },
                            React.createElement(label_1.Label, { htmlFor: "employeeId" }, "Select Employee *"),
                            React.createElement(select_1.Select, { value: formData.employeeId, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { employeeId: value })); } },
                                React.createElement(select_1.SelectTrigger, { id: "employeeId" },
                                    React.createElement(select_1.SelectValue, { placeholder: "Choose an employee" })),
                                React.createElement(select_1.SelectContent, null, availableEmployees.length === 0 ? (React.createElement("div", { className: "p-2 text-sm text-gray-600 text-center" }, "All employees are already on the team")) : (availableEmployees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                                    emp.firstName,
                                    " ",
                                    emp.lastName,
                                    " ",
                                    emp.position && "(" + emp.position + ")")); }))))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "role" }, "Role"),
                            React.createElement(select_1.Select, { value: formData.role, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { role: value })); } },
                                React.createElement(select_1.SelectTrigger, { id: "role" },
                                    React.createElement(select_1.SelectValue, { placeholder: "Select role" })),
                                React.createElement(select_1.SelectContent, null, PROJECT_TEAM_ROLES.map(function (role) { return (React.createElement(select_1.SelectItem, { key: role.id, value: role.id }, role.label)); })))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "hoursAllocated" }, "Hours per Week"),
                            React.createElement(input_1.Input, { id: "hoursAllocated", type: "number", min: "0", max: "168", value: formData.hoursAllocated, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { hoursAllocated: parseFloat(e.target.value) || 0 })); }, placeholder: "40" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "startDate" }, "Start Date"),
                            React.createElement(input_1.Input, { id: "startDate", type: "date", value: formData.startDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { startDate: e.target.value })); } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "endDate" }, "End Date"),
                            React.createElement(input_1.Input, { id: "endDate", type: "date", value: formData.endDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { endDate: e.target.value })); } }))),
                    React.createElement("div", { className: "flex gap-2 justify-end" },
                        React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () {
                                setShowForm(false);
                                setFormData({
                                    employeeId: "",
                                    role: "developer",
                                    hoursAllocated: 40,
                                    startDate: "",
                                    endDate: ""
                                });
                            } }, "Cancel"),
                        React.createElement(button_1.Button, { type: "submit", disabled: addMemberMutation.isPending || !formData.employeeId },
                            addMemberMutation.isPending && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                            "Add Member")))))),
        !showForm && (React.createElement(button_1.Button, { onClick: function () { return setShowForm(true); }, className: "w-full", variant: "outline" },
            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
            "Add Team Member"))));
}
exports.ProjectTeamSelector = ProjectTeamSelector;
