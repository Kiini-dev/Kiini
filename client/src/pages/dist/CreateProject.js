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
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var select_1 = require("@/components/ui/select");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
function CreateProject() {
    var _a, _b, _c, _d;
    var _e = wouter_1.useLocation(), navigate = _e[1];
    var utils = trpc_1.trpc.useUtils();
    var _f = react_1.useState({
        clientId: "",
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        startDate: "",
        endDate: "",
        budget: "",
        progress: "0",
        assignedTo: "",
        projectManager: "",
        tags: "",
        notes: ""
    }), formData = _f[0], setFormData = _f[1];
    var _g = trpc_1.trpc.clients.list.useQuery({}).data, clients = _g === void 0 ? [] : _g;
    var _h = trpc_1.trpc.users.list.useQuery({}).data, usersData = _h === void 0 ? [] : _h;
    var teamMembers = Array.isArray(usersData) ? usersData : (_b = (_a = usersData) === null || _a === void 0 ? void 0 : _a.users) !== null && _b !== void 0 ? _b : [];
    var clientsArr = Array.isArray(clients) ? clients : (_d = (_c = clients) === null || _c === void 0 ? void 0 : _c.items) !== null && _d !== void 0 ? _d : [];
    var createProjectMutation = trpc_1.trpc.projects.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Project created successfully!");
            utils.projects.list.invalidate();
            navigate("/projects");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create project: " + error.message);
        }
    });
    var set = function (field) { return function (e) {
        var _a;
        return setFormData(__assign(__assign({}, formData), (_a = {}, _a[field] = e.target.value, _a)));
    }; };
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.clientId || !formData.name) {
            sonner_1.toast.error("Client and Project Name are required");
            return;
        }
        createProjectMutation.mutate({
            clientId: formData.clientId,
            name: formData.name,
            description: formData.description || undefined,
            status: formData.status,
            priority: formData.priority,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            budget: formData.budget ? parseFloat(formData.budget) : undefined,
            progress: formData.progress ? parseInt(formData.progress) : 0,
            assignedTo: formData.assignedTo || undefined,
            projectManager: formData.projectManager || undefined,
            tags: formData.tags || undefined,
            notes: formData.notes || undefined
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Project", description: "Set up a new project and assign it to a client", icon: React.createElement(lucide_react_1.Plus, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Projects", href: "/projects" },
            { label: "Create" },
        ], backLink: { label: "Projects", href: "/projects" } },
        React.createElement("div", { className: "space-y-6 max-w-5xl" },
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.FolderOpen, { className: "h-4 w-4" }),
                            "Project Identity")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null,
                                    "Client ",
                                    React.createElement("span", { className: "text-destructive" }, "*")),
                                React.createElement(select_1.Select, { value: formData.clientId, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { clientId: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select a client" })),
                                    React.createElement(select_1.SelectContent, { className: "max-h-60 overflow-y-auto" }, clientsArr.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.companyName || c.contactPerson)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null,
                                    "Project Name ",
                                    React.createElement("span", { className: "text-destructive" }, "*")),
                                React.createElement(input_1.Input, { value: formData.name, onChange: set("name"), placeholder: "e.g., Website Redesign Phase 2" }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Project Description / Scope"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { description: v })); }, placeholder: "Describe the project scope, objectives, and key deliverables...", minHeight: "120px" })))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4" }),
                            "Schedule & Priority")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Project Status"),
                                React.createElement(select_1.Select, { value: formData.status, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { status: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "planning" }, "\uD83D\uDCCB Planning"),
                                        React.createElement(select_1.SelectItem, { value: "active" }, "\uD83D\uDFE2 Active"),
                                        React.createElement(select_1.SelectItem, { value: "on_hold" }, "\u23F8 On Hold"),
                                        React.createElement(select_1.SelectItem, { value: "completed" }, "\u2705 Completed"),
                                        React.createElement(select_1.SelectItem, { value: "cancelled" }, "\u274C Cancelled")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Priority Level"),
                                React.createElement(select_1.Select, { value: formData.priority, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { priority: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "low" }, "\uD83D\uDFE2 Low"),
                                        React.createElement(select_1.SelectItem, { value: "medium" }, "\uD83D\uDFE1 Medium"),
                                        React.createElement(select_1.SelectItem, { value: "high" }, "\uD83D\uDFE0 High"),
                                        React.createElement(select_1.SelectItem, { value: "urgent" }, "\uD83D\uDD34 Critical / Urgent"))))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Start Date"),
                                React.createElement(input_1.Input, { type: "date", value: formData.startDate, onChange: set("startDate") })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "End Date / Deadline"),
                                React.createElement(input_1.Input, { type: "date", value: formData.endDate, onChange: set("endDate") }))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" }),
                            "Budget & Progress")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Project Budget (KES)"),
                            React.createElement(input_1.Input, { type: "number", value: formData.budget, onChange: set("budget"), placeholder: "0.00", min: "0", step: "0.01" }),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Total approved budget for this project")),
                        React.createElement(separator_1.Separator, null),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null,
                                "Initial Completion: ",
                                formData.progress,
                                "%"),
                            React.createElement("input", { type: "range", min: "0", max: "100", value: formData.progress, onChange: set("progress"), className: "w-full accent-primary", "aria-label": "Project completion percentage", title: "Project completion percentage" }),
                            React.createElement("div", { className: "flex justify-between text-xs text-muted-foreground" },
                                React.createElement("span", null, "0% \u2013 Not started"),
                                React.createElement("span", null, "50% \u2013 Halfway"),
                                React.createElement("span", null, "100% \u2013 Complete"))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }),
                            "Team Assignment")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Project Manager"),
                                React.createElement(select_1.Select, { value: formData.projectManager, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { projectManager: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select project manager" })),
                                    React.createElement(select_1.SelectContent, { className: "max-h-56 overflow-y-auto" },
                                        React.createElement(select_1.SelectItem, { value: "unassigned" }, "\u2014 Unassigned \u2014"),
                                        teamMembers.map(function (u) { return (React.createElement(select_1.SelectItem, { key: u.id, value: u.id }, u.name || u.email)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Account Manager"),
                                React.createElement(select_1.Select, { value: formData.assignedTo, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { assignedTo: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select account manager" })),
                                    React.createElement(select_1.SelectContent, { className: "max-h-56 overflow-y-auto" },
                                        React.createElement(select_1.SelectItem, { value: "unassigned" }, "\u2014 Unassigned \u2014"),
                                        teamMembers.map(function (u) { return (React.createElement(select_1.SelectItem, { key: u.id, value: u.id }, u.name || u.email)); }))))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_1.Tag, { className: "h-3 w-3" }),
                                "Tags"),
                            React.createElement(input_1.Input, { value: formData.tags, onChange: set("tags"), placeholder: "e.g., design, development, urgent, phase2 (comma-separated)" }),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Separate tags with commas for easy filtering")))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-base" },
                            React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
                            "Additional Notes")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Project Notes"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { notes: v })); }, placeholder: "Special instructions, client requirements, technical notes, risks to watch out for...", minHeight: "140px" })))),
                React.createElement("div", { className: "flex gap-3 justify-between pb-8" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/projects"); } },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Cancel"),
                    React.createElement(button_1.Button, { type: "submit", disabled: createProjectMutation.isPending, size: "lg" },
                        React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                        createProjectMutation.isPending ? "Creating..." : "Create Project"))))));
}
exports["default"] = CreateProject;
