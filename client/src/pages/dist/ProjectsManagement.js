"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuth_1 = require("@/_core/hooks/useAuth");
var usePermissions_1 = require("@/_core/hooks/usePermissions");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
/**
 * Projects Management Page
 * Provides comprehensive project management with role-based access control
 * Filters visible items and actions based on user permissions
 */
function ProjectsManagement() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var user = useAuth_1.useAuth().user;
    var _b = usePermissions_1.usePermissions(user === null || user === void 0 ? void 0 : user.id), hasPermission = _b.hasPermission, hasAnyPermission = _b.hasAnyPermission;
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    // Fetch projects from backend
    var _d = trpc_1.trpc.projects.list.useQuery(), _e = _d.data, projects = _e === void 0 ? [] : _e, isLoading = _d.isLoading;
    var utils = trpc_1.trpc.useUtils();
    // Delete mutation
    var deleteProjectMutation = trpc_1.trpc.projects["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Project deleted successfully");
            utils.projects.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete project");
        }
    });
    // Filter projects based on what user can see
    var visibleProjects = react_1.useMemo(function () {
        return (projects || []).filter(function (project) {
            var _a, _b;
            // Super admin and admin can see all
            if (["super_admin", "admin"].includes((user === null || user === void 0 ? void 0 : user.role) || ""))
                return true;
            // Project managers can see assigned projects
            if ((user === null || user === void 0 ? void 0 : user.role) === "project_manager") {
                return project.projectManagerId === (user === null || user === void 0 ? void 0 : user.id) || ((_a = project.teamMembers) === null || _a === void 0 ? void 0 : _a.includes(user === null || user === void 0 ? void 0 : user.id));
            }
            // Staff can see projects they're assigned to
            if ((user === null || user === void 0 ? void 0 : user.role) === "staff") {
                return (_b = project.teamMembers) === null || _b === void 0 ? void 0 : _b.includes(user === null || user === void 0 ? void 0 : user.id);
            }
            return false;
        });
    }, [projects, user]);
    // Filter by search query
    var filteredProjects = react_1.useMemo(function () {
        return visibleProjects.filter(function (project) {
            var _a, _b;
            return ((_a = project.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase())) || ((_b = project.description) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchQuery.toLowerCase()));
        });
    }, [visibleProjects, searchQuery]);
    // Management sections show different capabilities
    var managementSections = react_1.useMemo(function () {
        var sections = [];
        // Staff Management (for admins and super admins)
        if (["super_admin", "admin"].includes((user === null || user === void 0 ? void 0 : user.role) || "")) {
            sections.push({
                title: "Team Management",
                description: "Manage project teams and assignments",
                icon: lucide_react_1.Users,
                href: "#",
                capability: "Can assign team members to projects"
            });
        }
        // Milestone Management
        if (hasPermission("projects_manage_milestones") || ["super_admin", "admin", "project_manager"].includes((user === null || user === void 0 ? void 0 : user.role) || "")) {
            sections.push({
                title: "Project Milestones",
                description: "Track project milestones and deliverables",
                icon: lucide_react_1.CheckCircle2,
                href: "/project-milestones",
                capability: "Can create and track milestones"
            });
        }
        // Time Tracking
        if (hasPermission("projects_view_time_tracking") || !["client"].includes((user === null || user === void 0 ? void 0 : user.role) || "")) {
            sections.push({
                title: "Time Tracking",
                description: "Monitor project time and resource allocation",
                icon: lucide_react_1.Clock,
                href: "/time-tracking",
                capability: "Can track team hours"
            });
        }
        // Analytics
        if (["super_admin", "admin", "project_manager"].includes((user === null || user === void 0 ? void 0 : user.role) || "")) {
            sections.push({
                title: "Project Analytics",
                description: "View project performance metrics",
                icon: lucide_react_1.BarChart3,
                href: "#",
                capability: "Can view analytics"
            });
        }
        return sections;
    }, [user === null || user === void 0 ? void 0 : user.role, hasPermission]);
    var canCreate = hasPermission("projects_create") || ["super_admin", "admin", "project_manager"].includes((user === null || user === void 0 ? void 0 : user.role) || "");
    var canEdit = hasPermission("projects_edit") || ["super_admin", "admin"].includes((user === null || user === void 0 ? void 0 : user.role) || "");
    var canDelete = hasPermission("projects_delete") || ["super_admin"].includes((user === null || user === void 0 ? void 0 : user.role) || "");
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Projects Management", icon: React.createElement(lucide_react_1.Briefcase, { className: "h-5 w-5" }), description: "Manage and track all projects with role-based access control", breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Projects", href: "/projects" },
            { label: "Management" },
        ] },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" }, managementSections.map(function (section) { return (React.createElement(card_1.Card, { key: section.title, className: "hover:shadow-lg transition-shadow" },
            React.createElement(card_1.CardHeader, null,
                React.createElement("div", { className: "flex items-start justify-between" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-semibold" }, section.title),
                    React.createElement(section.icon, { className: "w-5 h-5 text-primary" }))),
            React.createElement(card_1.CardContent, null,
                React.createElement("p", { className: "text-xs text-muted-foreground mb-3" }, section.description),
                React.createElement("p", { className: "text-xs text-green-600 font-medium" }, section.capability),
                section.href !== "#" && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "w-full mt-4", onClick: function () { return navigate(section.href); } }, "Manage"))))); })),
        React.createElement(card_1.Card, { className: "mb-8" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Quick Actions")),
            React.createElement(card_1.CardContent, { className: "flex gap-2" },
                canCreate && (React.createElement(button_1.Button, { onClick: function () { return navigate("/projects/create"); } },
                    React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                    "Create Project")),
                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/projects"); } },
                    React.createElement(lucide_react_1.Eye, { className: "w-4 h-4 mr-2" }),
                    "View All Projects"))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null,
                    "Projects (",
                    filteredProjects.length,
                    ")"),
                React.createElement(card_1.CardDescription, null,
                    canEdit && "Edit or delete projects as needed",
                    !canEdit && "View-only access to projects")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "mb-4" },
                    React.createElement("input", { type: "text", placeholder: "Search projects...", className: "w-full px-3 py-2 border rounded-md", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); } })),
                isLoading ? (React.createElement("div", { className: "text-center py-8" }, "Loading projects...")) : filteredProjects.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, visibleProjects.length === 0
                    ? "No projects available. You may not have access to any projects yet."
                    : "No projects match your search.")) : (React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "Project Name"),
                            React.createElement(table_1.TableHead, null, "Status"),
                            React.createElement(table_1.TableHead, null, "Priority"),
                            React.createElement(table_1.TableHead, null, "Start Date"),
                            React.createElement(table_1.TableHead, null, "End Date"),
                            (canEdit || canDelete) && React.createElement(table_1.TableHead, null, "Actions"))),
                    React.createElement(table_1.TableBody, null, filteredProjects.map(function (project) { return (React.createElement(table_1.TableRow, { key: project.id },
                        React.createElement(table_1.TableCell, { className: "font-semibold" }, project.name),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: project.status === "active"
                                    ? "default"
                                    : project.status === "completed"
                                        ? "secondary"
                                        : "outline" }, project.status)),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: project.priority === "high"
                                    ? "destructive"
                                    : project.priority === "medium"
                                        ? "secondary"
                                        : "outline" }, project.priority)),
                        React.createElement(table_1.TableCell, null, project.startDate
                            ? new Date(project.startDate).toLocaleDateString()
                            : "-"),
                        React.createElement(table_1.TableCell, null, project.endDate
                            ? new Date(project.endDate).toLocaleDateString()
                            : "-"),
                        React.createElement(table_1.TableCell, null,
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/projects/" + project.id); } },
                                    React.createElement(lucide_react_1.Eye, { className: "w-4 h-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/projects/" + project.id + "/edit"); } },
                                    React.createElement(lucide_react_1.Edit, { className: "w-4 h-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () {
                                        if (confirm("Are you sure you want to delete this project?")) {
                                            deleteProjectMutation.mutate(project.id);
                                        }
                                    }, className: "text-red-600 hover:text-red-700" },
                                    React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }))))))); }))))))));
}
exports["default"] = ProjectsManagement;
