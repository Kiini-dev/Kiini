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
var wouter_1 = require("wouter");
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var StaffAssignment_1 = require("@/components/StaffAssignment");
var CreateProjectTask_1 = require("@/components/ProjectTasks/CreateProjectTask");
var EditProjectTask_1 = require("@/components/ProjectTasks/EditProjectTask");
var ProjectTasksList_1 = require("@/components/ProjectTasks/ProjectTasksList");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var ProjectProgressBar_1 = require("@/components/ProjectProgressBar");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var sonner_1 = require("sonner");
var activityLog_1 = require("@/lib/activityLog");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var currency_1 = require("@/lib/currency");
var useUserLookup_1 = require("@/hooks/useUserLookup");
var useFavorite_1 = require("@/hooks/useFavorite");
function ProjectDetails() {
    var _this = this;
    var _a;
    var currencyCode = currency_1.useCurrencySettings().code;
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var _b = react_1.useState(false), isDeleteOpen = _b[0], setIsDeleteOpen = _b[1];
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    var _d = react_1.useState("list"), taskView = _d[0], setTaskView = _d[1];
    var _e = react_1.useState(null), selectedTask = _e[0], setSelectedTask = _e[1];
    var params = wouter_1.useParams();
    var _f = wouter_1.useLocation(), navigate = _f[1];
    var projectId = params.id;
    var _g = trpc_1.trpc.projects.getById.useQuery(projectId), project = _g.data, isLoading = _g.isLoading;
    var updateProgressMutation = trpc_1.trpc.projects.updateProgress.useMutation({
        onSuccess: function () {
            utils.projects.getById.invalidate(projectId);
            utils.projects.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update progress: " + error.message);
        }
    });
    var client = trpc_1.trpc.clients.getById.useQuery((project === null || project === void 0 ? void 0 : project.clientId) || "", { enabled: !!(project === null || project === void 0 ? void 0 : project.clientId) }).data;
    var _h = trpc_1.trpc.projects.tasks.list.useQuery({ projectId: projectId }), _j = _h.data, rawTasks = _j === void 0 ? [] : _j, refetchTasks = _h.refetch;
    var _k = trpc_1.trpc.projects.teamMembers.list.useQuery({ projectId: projectId }, { enabled: !!projectId }).data, rawTeamMembers = _k === void 0 ? [] : _k;
    var _l = trpc_1.trpc.employees.list.useQuery().data, allEmployees = _l === void 0 ? [] : _l;
    var _m = trpc_1.trpc.invoices.byClient.useQuery({ clientId: (project === null || project === void 0 ? void 0 : project.clientId) || "" }, { enabled: !!(project === null || project === void 0 ? void 0 : project.clientId) }).data, invoices = _m === void 0 ? [] : _m;
    var _o = trpc_1.trpc.estimates.byClient.useQuery({ clientId: (project === null || project === void 0 ? void 0 : project.clientId) || "" }, { enabled: !!(project === null || project === void 0 ? void 0 : project.clientId) }).data, estimates = _o === void 0 ? [] : _o;
    // Convert frozen Drizzle objects to plain objects to avoid React error #306
    var tasks = rawTasks ? JSON.parse(JSON.stringify(rawTasks)) : [];
    var teamMembers = rawTeamMembers ? JSON.parse(JSON.stringify(rawTeamMembers)) : [];
    var employeeList = allEmployees ? JSON.parse(JSON.stringify(allEmployees)) : [];
    var getEmployeeName = function (employeeId) {
        var emp = employeeList.find(function (e) { return e.id === employeeId; });
        return emp ? emp.firstName + " " + emp.lastName : employeeId;
    };
    var plainProject = project ? JSON.parse(JSON.stringify(project)) : null;
    var plainClient = client ? JSON.parse(JSON.stringify(client)) : null;
    var plainInvoices = invoices ? JSON.parse(JSON.stringify(invoices)) : [];
    var plainEstimates = estimates ? JSON.parse(JSON.stringify(estimates)) : [];
    var _p = trpc_1.trpc.projectMilestones.list.useQuery({ projectId: projectId }, { enabled: !!projectId }).data, rawMilestones = _p === void 0 ? [] : _p;
    var milestones = rawMilestones ? JSON.parse(JSON.stringify(rawMilestones)) : [];
    var _q = useFavorite_1.useFavorite("project", projectId, plainProject === null || plainProject === void 0 ? void 0 : plainProject.name), isStarred = _q.isStarred, toggleStar = _q.toggleStar;
    var utils = trpc_1.trpc.useUtils();
    var deleteProjectMutation = trpc_1.trpc.projects["delete"].useMutation({
        onSuccess: function () {
            utils.projects.list.invalidate();
            sonner_1.toast.success("Project \"" + (plainProject === null || plainProject === void 0 ? void 0 : plainProject.name) + "\" has been deleted");
            activityLog_1.logDelete("Projects", projectId, (plainProject === null || plainProject === void 0 ? void 0 : plainProject.name) || "Unknown");
            navigate("/projects");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete project: " + error.message);
        }
    });
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteProjectMutation, projectId)];
                case 2:
                    _a.sent();
                    setIsDeleteOpen(false);
                    return [3 /*break*/, 4];
                case 3:
                    setIsDeleting(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Project Details", icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Projects", href: "/projects" }, { label: "Details" }], backLink: { label: "Projects", href: "/projects" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading project..."))));
    }
    if (!project) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Project Details", icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Projects", href: "/projects" }, { label: "Details" }], backLink: { label: "Projects", href: "/projects" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", { className: "text-muted-foreground" }, "Project not found"),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/projects"); } }, "Back to Projects"))));
    }
    var getStatusColor = function (status) {
        switch (status) {
            case "active":
                return "bg-green-500";
            case "planning":
                return "bg-blue-500";
            case "on_hold":
                return "bg-yellow-500";
            case "completed":
                return "bg-gray-500";
            case "cancelled":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case "urgent":
                return "destructive";
            case "high":
                return "destructive";
            case "medium":
                return "default";
            case "low":
                return "secondary";
            default:
                return "default";
        }
    };
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: currencyCode
        }).format(amount / 100);
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Project Details", icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Projects", href: "/projects" }, { label: "Details" }], backLink: { label: "Projects", href: "/projects" } },
        React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "flex items-center justify-end gap-1" },
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: toggleStar },
                    React.createElement(lucide_react_1.Star, { className: "h-4 w-4 " + (isStarred ? "fill-amber-400 text-amber-400" : "") })),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/projects/" + projectId + "/edit"); } },
                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setIsDeleteOpen(true); } },
                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-destructive" }))),
            React.createElement("div", { className: "flex flex-col lg:flex-row gap-6" },
                React.createElement("div", { className: "w-full lg:w-[320px] lg:min-w-[320px] space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 space-y-4" },
                            React.createElement("div", null,
                                React.createElement("h2", { className: "text-xl font-bold" }, plainProject === null || plainProject === void 0 ? void 0 : plainProject.name),
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, plainProject === null || plainProject === void 0 ? void 0 : plainProject.projectNumber)),
                            React.createElement("div", { className: "flex gap-2 flex-wrap" },
                                React.createElement(badge_1.Badge, { className: getStatusColor(plainProject === null || plainProject === void 0 ? void 0 : plainProject.status) }, (_a = plainProject === null || plainProject === void 0 ? void 0 : plainProject.status) === null || _a === void 0 ? void 0 : _a.replace("_", " ").toUpperCase()),
                                React.createElement(badge_1.Badge, { variant: getPriorityColor(plainProject === null || plainProject === void 0 ? void 0 : plainProject.priority) }, ((plainProject === null || plainProject === void 0 ? void 0 : plainProject.priority) || "medium").toUpperCase())),
                            React.createElement("div", { className: "space-y-3 text-sm" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Building2, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Client"),
                                        React.createElement("p", { className: "font-medium" }, (plainClient === null || plainClient === void 0 ? void 0 : plainClient.companyName) || "N/A"))),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.User, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Manager"),
                                        React.createElement("p", { className: "font-medium" }, (plainProject === null || plainProject === void 0 ? void 0 : plainProject.projectManager) ? getUserName(plainProject.projectManager) : "Not assigned"))),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Start"),
                                        React.createElement("p", { className: "font-medium" }, (plainProject === null || plainProject === void 0 ? void 0 : plainProject.startDate) ? date_fns_1.format(new Date(plainProject.startDate), "MMM dd, yyyy")
                                            : "Not set"))),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground" }, "Due"),
                                        React.createElement("p", { className: "font-medium" }, (plainProject === null || plainProject === void 0 ? void 0 : plainProject.endDate) ? date_fns_1.format(new Date(plainProject.endDate), "MMM dd, yyyy")
                                            : "No deadline")))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Financial Summary"),
                                React.createElement("div", { className: "grid grid-cols-2 gap-2 text-sm" },
                                    React.createElement("div", { className: "bg-muted/50 rounded p-2" },
                                        React.createElement("p", { className: "text-muted-foreground" }, "Budget"),
                                        React.createElement("p", { className: "font-bold" }, (plainProject === null || plainProject === void 0 ? void 0 : plainProject.budget) ? formatCurrency(plainProject.budget) : "N/A")),
                                    React.createElement("div", { className: "bg-muted/50 rounded p-2" },
                                        React.createElement("p", { className: "text-muted-foreground" }, "Spent"),
                                        React.createElement("p", { className: "font-bold" }, formatCurrency((plainProject === null || plainProject === void 0 ? void 0 : plainProject.actualCost) || 0))))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement(ProjectProgressBar_1.ProjectProgressBar, { projectId: projectId, projectName: (plainProject === null || plainProject === void 0 ? void 0 : plainProject.name) || "", currentProgress: (plainProject === null || plainProject === void 0 ? void 0 : plainProject.progress) || 0, onProgressUpdate: function (newProgress) {
                                    updateProgressMutation.mutate({ id: projectId, progress: newProgress });
                                } })))),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement(tabs_1.Tabs, { defaultValue: "overview", className: "space-y-4" },
                        React.createElement("div", { className: "overflow-x-auto -mx-1 px-1" },
                            React.createElement(tabs_1.TabsList, { className: "flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-7" },
                                React.createElement(tabs_1.TabsTrigger, { value: "overview", className: "whitespace-nowrap text-xs sm:text-sm" }, "Overview"),
                                React.createElement(tabs_1.TabsTrigger, { value: "team", className: "whitespace-nowrap text-xs sm:text-sm" },
                                    "Team (",
                                    teamMembers.length,
                                    ")"),
                                React.createElement(tabs_1.TabsTrigger, { value: "tasks", className: "whitespace-nowrap text-xs sm:text-sm" },
                                    "Tasks (",
                                    tasks.length,
                                    ")"),
                                React.createElement(tabs_1.TabsTrigger, { value: "invoices", className: "whitespace-nowrap text-xs sm:text-sm" },
                                    "Invoices (",
                                    plainInvoices.length,
                                    ")"),
                                React.createElement(tabs_1.TabsTrigger, { value: "estimates", className: "whitespace-nowrap text-xs sm:text-sm" },
                                    "Estimates (",
                                    plainEstimates.length,
                                    ")"),
                                React.createElement(tabs_1.TabsTrigger, { value: "files", className: "whitespace-nowrap text-xs sm:text-sm" }, "Files"),
                                React.createElement(tabs_1.TabsTrigger, { value: "milestones", className: "whitespace-nowrap text-xs sm:text-sm" },
                                    "Milestones (",
                                    milestones.length,
                                    ")"))),
                        React.createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Project Details")),
                                React.createElement(card_1.CardContent, { className: "space-y-4" },
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium mb-2" }, "Description"),
                                        (plainProject === null || plainProject === void 0 ? void 0 : plainProject.description) ? (React.createElement(RichTextEditor_1.RichTextDisplay, { html: plainProject.description, className: "text-sm text-muted-foreground" })) : (React.createElement("p", { className: "text-sm text-muted-foreground" }, "No description provided"))),
                                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                        React.createElement("div", null,
                                            React.createElement("h4", { className: "font-medium mb-2" }, "Project Manager"),
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, (plainProject === null || plainProject === void 0 ? void 0 : plainProject.projectManager) ? getUserName(plainProject.projectManager) : "Not assigned")),
                                        React.createElement("div", null,
                                            React.createElement("h4", { className: "font-medium mb-2" }, "Assigned To"),
                                            React.createElement("p", { className: "text-sm text-muted-foreground" }, (plainProject === null || plainProject === void 0 ? void 0 : plainProject.assignedTo) ? getUserName(plainProject.assignedTo) : "Not assigned"))),
                                    (plainProject === null || plainProject === void 0 ? void 0 : plainProject.notes) && (React.createElement("div", null,
                                        React.createElement("h4", { className: "font-medium mb-2" }, "Notes"),
                                        React.createElement(RichTextEditor_1.RichTextDisplay, { html: plainProject.notes, className: "text-sm text-muted-foreground" })))))),
                        React.createElement(tabs_1.TabsContent, { value: "team", className: "space-y-4" },
                            React.createElement(StaffAssignment_1["default"], { projectId: projectId })),
                        React.createElement(tabs_1.TabsContent, { value: "tasks", className: "space-y-4" },
                            taskView === "list" && (React.createElement(React.Fragment, null,
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                                        React.createElement("div", null,
                                            React.createElement(card_1.CardTitle, null, "Project Tasks"),
                                            React.createElement(card_1.CardDescription, null, "Manage and track project tasks")),
                                        React.createElement(button_1.Button, { onClick: function () { return setTaskView("create"); }, className: "gap-2" },
                                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                                            "New Task")),
                                    React.createElement(card_1.CardContent, null,
                                        React.createElement(ProjectTasksList_1.ProjectTasksList, { projectId: projectId, tasks: tasks, teamMembers: teamMembers.map(function (tm) { return ({
                                                id: tm.employeeId,
                                                name: getEmployeeName(tm.employeeId)
                                            }); }), isAdmin: true, onEdit: function (task) {
                                                setSelectedTask(task);
                                                setTaskView("edit");
                                            }, onRefresh: function () { return refetchTasks(); } }))))),
                            taskView === "create" && (React.createElement(CreateProjectTask_1.CreateProjectTask, { projectId: projectId, teamMembers: teamMembers.map(function (tm) { return ({
                                    id: tm.employeeId,
                                    name: getEmployeeName(tm.employeeId)
                                }); }), onSuccess: function () {
                                    refetchTasks();
                                    setTaskView("list");
                                    sonner_1.toast.success("Task created successfully");
                                }, onCancel: function () { return setTaskView("list"); } })),
                            taskView === "edit" && selectedTask && (React.createElement(EditProjectTask_1.EditProjectTask, { task: selectedTask, teamMembers: teamMembers.map(function (tm) { return ({
                                    id: tm.employeeId,
                                    name: getEmployeeName(tm.employeeId)
                                }); }), isAdmin: true, onSuccess: function () {
                                    refetchTasks();
                                    setTaskView("list");
                                    setSelectedTask(null);
                                    sonner_1.toast.success("Task updated successfully");
                                }, onCancel: function () {
                                    setTaskView("list");
                                    setSelectedTask(null);
                                } }))),
                        React.createElement(tabs_1.TabsContent, { value: "invoices", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("div", null,
                                            React.createElement(card_1.CardTitle, null, "Invoices"),
                                            React.createElement(card_1.CardDescription, null, "Client invoices related to this project")),
                                        React.createElement(button_1.Button, { onClick: function () { return navigate("/invoices"); } },
                                            React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 mr-2" }),
                                            "View All Invoices"))),
                                React.createElement(card_1.CardContent, null, plainInvoices.length === 0 ? (React.createElement("p", { className: "text-sm text-muted-foreground text-center py-8" }, "No invoices yet")) : (React.createElement("div", { className: "space-y-2" }, plainInvoices.map(function (invoice) { return (React.createElement("div", { key: invoice.id, className: "flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent", onClick: function () { return navigate("/invoices/" + invoice.id); } },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium" }, invoice.invoiceNumber),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, invoice.title)),
                                    React.createElement("div", { className: "text-right" },
                                        React.createElement("p", { className: "font-medium" }, formatCurrency(invoice.total)),
                                        React.createElement(badge_1.Badge, { variant: invoice.status === "paid" ? "default" : "secondary" }, invoice.status)))); })))))),
                        React.createElement(tabs_1.TabsContent, { value: "estimates", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("div", null,
                                            React.createElement(card_1.CardTitle, null, "Estimates"),
                                            React.createElement(card_1.CardDescription, null, "Quotations for this project")),
                                        React.createElement(button_1.Button, { onClick: function () { return navigate("/estimates"); } },
                                            React.createElement(lucide_react_1.Receipt, { className: "h-4 w-4 mr-2" }),
                                            "View All Estimates"))),
                                React.createElement(card_1.CardContent, null, plainEstimates.length === 0 ? (React.createElement("p", { className: "text-sm text-muted-foreground text-center py-8" }, "No estimates yet")) : (React.createElement("div", { className: "space-y-2" }, plainEstimates.map(function (estimate) { return (React.createElement("div", { key: estimate.id, className: "flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent", onClick: function () { return navigate("/estimates/" + estimate.id); } },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium" }, estimate.estimateNumber),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, estimate.title)),
                                    React.createElement("div", { className: "text-right" },
                                        React.createElement("p", { className: "font-medium" }, formatCurrency(estimate.total)),
                                        React.createElement(badge_1.Badge, { variant: estimate.status === "accepted" ? "default" : "secondary" }, estimate.status)))); })))))),
                        React.createElement(tabs_1.TabsContent, { value: "files", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, null, "Project Files"),
                                    React.createElement(card_1.CardDescription, null, "Documents and attachments")),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement("div", { className: "text-center py-8 space-y-3" },
                                        React.createElement(lucide_react_1.FileText, { className: "h-10 w-10 mx-auto text-muted-foreground/40" }),
                                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "No files attached to this project yet."),
                                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/documents"); } },
                                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                                            " Manage Documents"))))),
                        React.createElement(tabs_1.TabsContent, { value: "milestones", className: "space-y-4" },
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                                    React.createElement("div", null,
                                        React.createElement(card_1.CardTitle, null, "Project Milestones"),
                                        React.createElement(card_1.CardDescription, null,
                                            milestones.length,
                                            " milestones")),
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/project-milestones"); } },
                                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                                        " Manage Milestones")),
                                React.createElement(card_1.CardContent, null, milestones.length === 0 ? (React.createElement("div", { className: "text-center py-8 space-y-3" },
                                    React.createElement(lucide_react_1.Target, { className: "h-10 w-10 mx-auto text-muted-foreground/40" }),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "No milestones set for this project."),
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/project-milestones"); } },
                                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                                        " Add Milestone"))) : (React.createElement("div", { className: "space-y-3" }, milestones.map(function (m) {
                                    var _a;
                                    return (React.createElement("div", { key: m.id, className: "flex items-center justify-between p-3 border rounded-lg" },
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "font-medium" }, m.title),
                                            m.description && React.createElement("p", { className: "text-sm text-muted-foreground line-clamp-1" }, m.description),
                                            m.dueDate && React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                                                "Due: ",
                                                new Date(m.dueDate).toLocaleDateString())),
                                        React.createElement(badge_1.Badge, { variant: m.status === "completed" ? "default" : m.status === "in_progress" ? "secondary" : "outline" }, ((_a = m.status) === null || _a === void 0 ? void 0 : _a.replace("_", " ")) || "planning")));
                                })))))))))),
        React.createElement(DeleteConfirmationModal_1["default"], { isOpen: isDeleteOpen, title: "Delete Project", description: "Are you sure you want to delete this project? This action cannot be undone. All associated tasks, invoices, and estimates will be marked as deleted.", itemName: plainProject === null || plainProject === void 0 ? void 0 : plainProject.name, isLoading: isDeleting, onConfirm: handleDelete, onCancel: function () { return setIsDeleteOpen(false); }, isDangerous: true })));
}
exports["default"] = ProjectDetails;
