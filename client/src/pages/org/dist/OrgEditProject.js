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
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgEditProject() {
    var _this = this;
    var _a, _b;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var projectId = params.id;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canEdit = hasPermission("projects");
    var canDelete = hasPermission("projects");
    var _d = react_1.useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var utils = trpc_1.trpc.useUtils();
    var _e = react_1.useState({
        projectNumber: "",
        clientId: "",
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        startDate: "",
        endDate: "",
        budget: "",
        progress: "0",
        projectManager: "",
        accountManager: ""
    }), formData = _e[0], setFormData = _e[1];
    var _f = trpc_1.trpc.projects.getById.useQuery(projectId, {
        enabled: !!projectId
    }), project = _f.data, isLoadingProject = _f.isLoading;
    var _g = trpc_1.trpc.clients.list.useQuery(undefined).data, clients = _g === void 0 ? [] : _g;
    var _h = trpc_1.trpc.users.list.useQuery(undefined).data, usersData = _h === void 0 ? [] : _h;
    var teamMembers = Array.isArray(usersData) ? usersData : (_b = (_a = usersData) === null || _a === void 0 ? void 0 : _a.users) !== null && _b !== void 0 ? _b : [];
    var updateProjectMutation = trpc_1.trpc.projects.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Project updated successfully!");
            utils.projects.list.invalidate();
            utils.projects.getById.invalidate(projectId);
            navigate("/org/" + slug + "/projects/" + projectId);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update project: " + error.message);
        }
    });
    var deleteProjectMutation = trpc_1.trpc.projects["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Project deleted successfully!");
            utils.projects.list.invalidate();
            navigate("/org/" + slug + "/projects");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete project: " + error.message);
        }
    });
    // Load project data when component mounts
    react_1.useEffect(function () {
        if (project) {
            setFormData({
                projectNumber: project.projectNumber || "",
                clientId: project.clientId || "",
                name: project.name || "",
                description: project.description || "",
                status: (project.status || "planning"),
                priority: (project.priority || "medium"),
                startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
                endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
                // project.budget is stored in cents on the server; display in major units
                budget: project.budget ? (project.budget / 100).toFixed(2) : "",
                progress: project.progress ? project.progress.toString() : "0",
                projectManager: project.projectManager || "",
                accountManager: project.accountManager || ""
            });
        }
    }, [project]);
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!canEdit) {
                        sonner_1.toast.error("You don't have permission to edit projects");
                        return [2 /*return*/];
                    }
                    if (!formData.clientId || !formData.name) {
                        sonner_1.toast.error("Please fill in required fields (Client and Project Name)");
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](updateProjectMutation.mutateAsync({
                            id: projectId,
                            projectNumber: formData.projectNumber || undefined,
                            clientId: formData.clientId,
                            name: formData.name,
                            description: formData.description || undefined,
                            status: formData.status,
                            priority: formData.priority,
                            startDate: formData.startDate ? new Date(formData.startDate) : undefined,
                            endDate: formData.endDate ? new Date(formData.endDate) : undefined,
                            budget: formData.budget ? Math.round(parseFloat(formData.budget) * 100) : undefined,
                            progress: parseInt(formData.progress) || 0,
                            projectManager: formData.projectManager || undefined,
                            accountManager: formData.accountManager || undefined
                        }))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!canDelete) {
                        sonner_1.toast.error("You don't have permission to delete projects");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteProjectMutation.mutateAsync({ id: projectId }))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (!canEdit) {
        return (React.createElement(OrgLayout_1["default"], null,
            React.createElement(OrgBreadcrumb_1["default"], { items: [
                    { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                    { label: "Projects", href: "/org/" + slug + "/projects" },
                    { label: "Access Denied" },
                ] }),
            React.createElement("div", { className: "text-center py-12" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-16 w-16 text-red-400 mx-auto mb-4" }),
                React.createElement("h2", { className: "text-2xl font-bold text-white mb-2" }, "Access Denied"),
                React.createElement("p", { className: "text-white/60 mb-6" }, "You don't have permission to edit projects."),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/org/" + slug + "/projects"); } },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                    "Back to Projects"))));
    }
    if (isLoadingProject) {
        return (React.createElement(OrgLayout_1["default"], null,
            React.createElement(OrgBreadcrumb_1["default"], { items: [
                    { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                    { label: "Projects", href: "/org/" + slug + "/projects" },
                    { label: "Loading..." },
                ] }),
            React.createElement("div", { className: "flex items-center justify-center py-12" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-500" }))));
    }
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Projects", href: "/org/" + slug + "/projects" },
                { label: (project === null || project === void 0 ? void 0 : project.name) || "Project", href: "/org/" + slug + "/projects/" + projectId },
                { label: "Edit" },
            ] }),
        React.createElement("div", { className: "max-w-4xl mx-auto space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-4" },
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/org/" + slug + "/projects/" + projectId); } },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Back"),
                    React.createElement("div", null,
                        React.createElement("h1", { className: "text-2xl font-bold text-white" }, "Edit Project"),
                        React.createElement("p", { className: "text-white/60" }, (project === null || project === void 0 ? void 0 : project.projectNumber) || "Project #" + projectId.slice(-8)))),
                canDelete && (React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: handleDelete, disabled: deleteProjectMutation.isLoading },
                    deleteProjectMutation.isLoading ? (React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" })) : (React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" })),
                    "Delete"))),
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                React.createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                            React.createElement(lucide_react_1.Briefcase, { className: "h-5 w-5" }),
                            "Project Information"),
                        React.createElement(card_1.CardDescription, null, "Update the project details below.")),
                    React.createElement(card_1.CardContent, { className: "space-y-6" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "projectNumber", className: "text-white" }, "Project Number"),
                                React.createElement(input_1.Input, { id: "projectNumber", value: formData.projectNumber, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { projectNumber: e.target.value })); }); }, placeholder: "Auto-generated if empty", className: "bg-white/5 border-white/20 text-white" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "clientId", className: "text-white" }, "Client *"),
                                React.createElement(select_1.Select, { value: formData.clientId, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { clientId: value })); }); } },
                                    React.createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Select a client" })),
                                    React.createElement(select_1.SelectContent, null, clients.map(function (client) { return (React.createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.name)); })))),
                            React.createElement("div", { className: "space-y-2 md:col-span-2" },
                                React.createElement(label_1.Label, { htmlFor: "name", className: "text-white" }, "Project Name *"),
                                React.createElement(input_1.Input, { id: "name", value: formData.name, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }, placeholder: "Enter project name", required: true, className: "bg-white/5 border-white/20 text-white" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "status", className: "text-white" }, "Status"),
                                React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { status: value })); }); } },
                                    React.createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "planning" }, "Planning"),
                                        React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                                        React.createElement(select_1.SelectItem, { value: "on_hold" }, "On Hold"),
                                        React.createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                                        React.createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "priority", className: "text-white" }, "Priority"),
                                React.createElement(select_1.Select, { value: formData.priority, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { priority: value })); }); } },
                                    React.createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                        React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                                        React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                                        React.createElement(select_1.SelectItem, { value: "urgent" }, "Urgent")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "startDate", className: "text-white" }, "Start Date"),
                                React.createElement(input_1.Input, { id: "startDate", type: "date", value: formData.startDate, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { startDate: e.target.value })); }); }, className: "bg-white/5 border-white/20 text-white" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "endDate", className: "text-white" }, "End Date"),
                                React.createElement(input_1.Input, { id: "endDate", type: "date", value: formData.endDate, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { endDate: e.target.value })); }); }, className: "bg-white/5 border-white/20 text-white" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "budget", className: "text-white" }, "Budget (KES)"),
                                React.createElement(input_1.Input, { id: "budget", type: "number", step: "0.01", value: formData.budget, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { budget: e.target.value })); }); }, placeholder: "0.00", className: "bg-white/5 border-white/20 text-white" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "progress", className: "text-white" }, "Progress (%)"),
                                React.createElement(input_1.Input, { id: "progress", type: "number", min: "0", max: "100", value: formData.progress, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { progress: e.target.value })); }); }, className: "bg-white/5 border-white/20 text-white" }))),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "projectManager", className: "text-white" }, "Project Manager"),
                                React.createElement(select_1.Select, { value: formData.projectManager, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { projectManager: value })); }); } },
                                    React.createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Select project manager" })),
                                    React.createElement(select_1.SelectContent, null, teamMembers.map(function (user) { return (React.createElement(select_1.SelectItem, { key: user.id, value: user.id }, user.name || user.email)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "accountManager", className: "text-white" }, "Account Manager"),
                                React.createElement(select_1.Select, { value: formData.accountManager, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { accountManager: value })); }); } },
                                    React.createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Select account manager" })),
                                    React.createElement(select_1.SelectContent, null, teamMembers.map(function (user) { return (React.createElement(select_1.SelectItem, { key: user.id, value: user.id }, user.name || user.email)); }))))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "description", className: "text-white" }, "Description"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: value })); }); }, placeholder: "Enter project description...", className: "min-h-[120px]" })))),
                React.createElement("div", { className: "flex items-center justify-end gap-4" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/org/" + slug + "/projects/" + projectId); } }, "Cancel"),
                    React.createElement(button_1.Button, { type: "submit", disabled: isLoading || updateProjectMutation.isLoading, className: "bg-blue-600 hover:bg-blue-700" }, isLoading || updateProjectMutation.isLoading ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Saving...")) : (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                        "Save Changes"))))))));
}
exports["default"] = OrgEditProject;
