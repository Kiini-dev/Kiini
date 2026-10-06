"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var DepartmentForm_1 = require("@/components/DepartmentForm");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
function Departments() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = permissions_1.useRequireFeature("hr:departments:view"), allowed = _b.allowed, isLoading = _b.isLoading;
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState(false), isCreateDialogOpen = _d[0], setIsCreateDialogOpen = _d[1];
    var _e = react_1.useState(null), editingDepartment = _e[0], setEditingDepartment = _e[1];
    // Fetch real data from backend (must be before any early returns to satisfy React hooks rules)
    var _f = trpc_1.trpc.departments.list.useQuery({}), _g = _f.data, departmentsData = _g === void 0 ? [] : _g, departmentsLoading = _f.isLoading;
    var utils = trpc_1.trpc.useUtils();
    var deleteMutation = trpc_1.trpc.departments["delete"].useMutation({
        onSuccess: function () { utils.departments.list.invalidate(); sonner_1.toast.success("Department deleted"); },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to delete department"); }
    });
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    // Transform backend data to display format
    var departments = departmentsData.map(function (dept) { return ({
        id: String(dept.id),
        name: dept.name || "Unknown Department",
        code: dept.code || "DEPT-" + dept.id.slice(0, 3).toUpperCase(),
        manager: dept.manager || "Unassigned",
        employeeCount: dept.employeeCount || 0,
        budget: dept.budget || 0,
        description: dept.description || ""
    }); });
    var filteredDepartments = departments.filter(function (dept) {
        return dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.manager.toLowerCase().includes(searchTerm.toLowerCase());
    });
    var totalEmployees = departments.reduce(function (sum, d) { return sum + d.employeeCount; }, 0);
    var totalBudget = departments.reduce(function (sum, d) { return sum + d.budget; }, 0);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Department Management", description: "Manage organizational departments, teams, and resources", icon: React.createElement(lucide_react_1.Building2, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Departments" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { return setIsCreateDialogOpen(true); } },
            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
            "New Department") },
        React.createElement(dialog_1.Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen },
            React.createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, editingDepartment ? "Edit Department" : "Create New Department"),
                    React.createElement(dialog_1.DialogDescription, null, editingDepartment
                        ? "Update department details below"
                        : "Add a new department to your organization")),
                React.createElement("div", { className: "py-4" },
                    React.createElement(DepartmentForm_1.DepartmentForm, { initialData: editingDepartment, isModal: true, onSuccess: function () {
                            setIsCreateDialogOpen(false);
                            setEditingDepartment(null);
                            utils.departments.list.invalidate();
                        }, onCancel: function () {
                            setIsCreateDialogOpen(false);
                            setEditingDepartment(null);
                        } })))),
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Departments", value: departments.length, description: "Active departments", icon: React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Employees", value: totalEmployees, description: "Across all departments", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Budget", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (totalBudget || 0).toLocaleString()), description: "Annual allocation", icon: React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Avg. Team Size", value: departments.length > 0 ? Math.round(totalEmployees / departments.length) : 0, description: "Employees per dept", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-orange-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "All Departments"),
                    React.createElement(card_1.CardDescription, null, "View and manage organizational departments")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex items-center gap-4 mb-6" },
                        React.createElement("div", { className: "relative flex-1" },
                            React.createElement(lucide_react_1.Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }),
                            React.createElement(input_1.Input, { placeholder: "Search departments...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-8" }))),
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Code"),
                                React.createElement(table_1.TableHead, null, "Department Name"),
                                React.createElement(table_1.TableHead, null, "Manager"),
                                React.createElement(table_1.TableHead, null, "Employees"),
                                React.createElement(table_1.TableHead, null, "Annual Budget"),
                                React.createElement(table_1.TableHead, null, "Description"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredDepartments.map(function (dept) { return (React.createElement(table_1.TableRow, { key: dept.id },
                            React.createElement(table_1.TableCell, { className: "font-mono font-medium" }, dept.code),
                            React.createElement(table_1.TableCell, { className: "font-medium" }, dept.name),
                            React.createElement(table_1.TableCell, null, dept.manager),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Users, { className: "h-4 w-4 text-muted-foreground" }),
                                    React.createElement("span", null, dept.employeeCount))),
                            React.createElement(table_1.TableCell, null,
                                "Ksh ",
                                (dept.budget || 0).toLocaleString()),
                            React.createElement(table_1.TableCell, { className: "max-w-xs truncate" }, dept.description),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("div", { className: "flex justify-end gap-2" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", title: "View", onClick: function () { return navigate("/departments/" + dept.id); } },
                                        React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", title: "Edit", onClick: function () {
                                            setEditingDepartment({
                                                id: dept.id,
                                                departmentName: dept.name,
                                                description: dept.description,
                                                budget: dept.budget.toString()
                                            });
                                            setIsCreateDialogOpen(true);
                                        } },
                                        React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", title: "Delete", onClick: function () { if (confirm("Delete department \"" + dept.name + "\"?"))
                                            deleteMutation.mutate(dept.id); } },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))));
}
exports["default"] = Departments;
