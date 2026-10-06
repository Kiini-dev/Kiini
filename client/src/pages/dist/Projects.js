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
var react_1 = require("react");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var data_table_controls_1 = require("@/components/ui/data-table-controls");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var COLUMNS = [
    { key: "id", label: "ID", defaultVisible: true },
    { key: "title", label: "Title", defaultVisible: true },
    { key: "client", label: "Client", defaultVisible: true },
    { key: "startDate", label: "Start Date", defaultVisible: true },
    { key: "dueDate", label: "Due Date", defaultVisible: true },
    { key: "tags", label: "Tags", defaultVisible: true },
    { key: "progress", label: "Progress", defaultVisible: true },
    { key: "status", label: "Status", defaultVisible: true },
    { key: "priority", label: "Priority", defaultVisible: false },
    { key: "budget", label: "Budget", defaultVisible: false },
    { key: "manager", label: "Manager", defaultVisible: false },
    { key: "teamSize", label: "Team Size", defaultVisible: false },
];
function Projects() {
    var _this = this;
    var _a = permissions_1.useRequireFeature("projects:view"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState({
        status: "all",
        priority: "all",
        sortBy: "date",
        sortOrder: "desc"
    }), filters = _d[0], setFilters = _d[1];
    var _e = react_1.useState(new Set()), selectedProjects = _e[0], setSelectedProjects = _e[1];
    var _f = data_table_controls_1.usePagination(25), page = _f.page, pageSize = _f.pageSize, setPage = _f.setPage, setPageSize = _f.setPageSize, paginate = _f.paginate;
    var _g = TableColumnSettings_1.useColumnVisibility(COLUMNS, "projects"), visibleColumns = _g.visibleColumns, toggleColumn = _g.toggleColumn, isVisible = _g.isVisible, colPageSize = _g.pageSize, updatePageSize = _g.updatePageSize, reset = _g.reset;
    // always initialize queries to maintain hook order
    var _h = trpc_1.trpc.projects.list.useQuery({}, { enabled: allowed }), _j = _h.data, projects = _j === void 0 ? [] : _j, isLoadingProjects = _h.isLoading;
    var utils = trpc_1.trpc.useUtils();
    var deleteProjectMutation = trpc_1.trpc.projects["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Project deleted successfully");
            utils.projects.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete project");
        }
    });
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    var getStatusBadge = function (status) {
        switch (status) {
            case "planning":
                return React.createElement(badge_1.Badge, { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" }, "Planning");
            case "active":
                return React.createElement(badge_1.Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" }, "Active");
            case "on_hold":
                return React.createElement(badge_1.Badge, { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" }, "On Hold");
            case "completed":
                return React.createElement(badge_1.Badge, { variant: "outline", className: "bg-purple-50 text-purple-700 border-purple-200" }, "Completed");
            case "cancelled":
                return React.createElement(badge_1.Badge, { variant: "outline", className: "bg-red-50 text-red-700 border-red-200" }, "Cancelled");
            default:
                return React.createElement(badge_1.Badge, { variant: "outline" }, status);
        }
    };
    var getPriorityBadge = function (priority) {
        switch (priority) {
            case "low":
                return React.createElement(badge_1.Badge, { variant: "outline", className: "bg-slate-50 text-slate-700 border-slate-200" }, "Low");
            case "medium":
                return React.createElement(badge_1.Badge, { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" }, "Medium");
            case "high":
                return React.createElement(badge_1.Badge, { variant: "outline", className: "bg-orange-50 text-orange-700 border-orange-200" }, "High");
            case "urgent":
                return React.createElement(badge_1.Badge, { variant: "outline", className: "bg-red-50 text-red-700 border-red-200" }, "Urgent");
            default:
                return React.createElement(badge_1.Badge, { variant: "outline" }, priority);
        }
    };
    var filteredProjects = projects
        .filter(function (project) {
        return project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.projectNumber.toLowerCase().includes(searchQuery.toLowerCase());
    })
        .sort(function (a, b) {
        var aVal = a[filters.sortBy];
        var bVal = b[filters.sortBy];
        if (typeof aVal === "string")
            aVal = aVal.toLowerCase();
        if (typeof bVal === "string")
            bVal = bVal.toLowerCase();
        var comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return filters.sortOrder === "desc" ? -comparison : comparison;
    });
    var pagedProjects = paginate(filteredProjects);
    var handleDeleteProject = function (projectId, projectName) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (confirm("Are you sure you want to delete project \"" + projectName + "\"?")) {
                deleteProjectMutation.mutate(projectId);
            }
            return [2 /*return*/];
        });
    }); };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Projects", icon: React.createElement(lucide_react_1.Briefcase, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "App", href: "/crm-home" },
            { label: "Projects", href: "/projects" },
        ], actions: React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchQuery, onSearchChange: setSearchQuery, searchPlaceholder: "Search projects...", onCreateClick: function () { return navigate("/projects/create"); }, createLabel: "New Project" }) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: [
                    {
                        label: "All Projects",
                        value: projects.length,
                        color: "blue",
                        progress: 100
                    },
                    {
                        label: "In Progress",
                        value: projects.filter(function (p) { return p.status === "active"; }).length,
                        color: "green",
                        progress: projects.length ? (projects.filter(function (p) { return p.status === "active"; }).length / projects.length) * 100 : 0
                    },
                    {
                        label: "On Hold",
                        value: projects.filter(function (p) { return p.status === "on_hold"; }).length,
                        color: "orange",
                        progress: projects.length ? (projects.filter(function (p) { return p.status === "on_hold"; }).length / projects.length) * 100 : 0
                    },
                    {
                        label: "Completed",
                        value: projects.filter(function (p) { return p.status === "completed"; }).length,
                        color: "green",
                        progress: projects.length ? (projects.filter(function (p) { return p.status === "completed"; }).length / projects.length) * 100 : 0
                    },
                ], satisfies: true, SummaryCard: true }),
            "]} />",
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0 space-y-0" },
                    React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedProjects.size, onClear: function () { return setSelectedProjects(new Set()); }, actions: [
                            EnhancedBulkActions_1.bulkExportAction(selectedProjects, projects, COLUMNS, "projects"),
                            EnhancedBulkActions_1.bulkCopyIdsAction(selectedProjects),
                            EnhancedBulkActions_1.bulkEmailAction(navigate),
                            EnhancedBulkActions_1.bulkDeleteAction(selectedProjects, function (ids) { ids.forEach(function (id) { return deleteProjectMutation.mutate(id); }); setSelectedProjects(new Set()); }),
                        ] }),
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-10" }),
                                React.createElement(table_1.TableHead, null, "Project #"),
                                React.createElement(table_1.TableHead, null, "Name"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Priority"),
                                React.createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Progress"),
                                React.createElement(table_1.TableHead, { className: "hidden lg:table-cell" }, "End Date"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, isLoadingProjects ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground" }, "Loading projects..."))) : filteredProjects.length === 0 ? (React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground" }, "No projects found."))) : (pagedProjects.map(function (project) { return (React.createElement(table_1.TableRow, { key: project.id, className: selectedProjects.has(project.id) ? "bg-primary/5" : "" },
                            React.createElement(table_1.TableCell, null,
                                React.createElement("input", { type: "checkbox", checked: selectedProjects.has(project.id), onChange: function () {
                                        var next = new Set(selectedProjects);
                                        if (next.has(project.id))
                                            next["delete"](project.id);
                                        else
                                            next.add(project.id);
                                        setSelectedProjects(next);
                                    }, className: "h-4 w-4 rounded border-gray-300 cursor-pointer" })),
                            React.createElement(table_1.TableCell, { className: "font-medium" }, project.projectNumber),
                            React.createElement(table_1.TableCell, null, project.name),
                            React.createElement(table_1.TableCell, null, getStatusBadge(project.status || "planning")),
                            React.createElement(table_1.TableCell, { className: "hidden md:table-cell" }, getPriorityBadge(project.priority || "medium")),
                            React.createElement(table_1.TableCell, { className: "hidden md:table-cell" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("div", { className: "w-full bg-slate-100 rounded-full h-2 max-w-[100px]" },
                                        React.createElement("div", { className: "bg-blue-600 h-2 rounded-full", style: { width: (project.progress || 0) + "%" } })),
                                    React.createElement("span", { className: "text-xs text-muted-foreground" },
                                        project.progress || 0,
                                        "%"))),
                            React.createElement(table_1.TableCell, { className: "hidden lg:table-cell" }, project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("div", { className: "flex justify-end gap-2" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/projects/" + project.id); } },
                                        React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/projects/" + project.id + "/edit"); } },
                                        React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: function () { return handleDeleteProject(project.id, project.name); } },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); })))),
                    React.createElement(data_table_controls_1.PaginationControls, { total: filteredProjects.length, page: page, pageSize: pageSize, onPageChange: setPage, onPageSizeChange: setPageSize, className: "px-2" }))))));
}
exports["default"] = Projects;
