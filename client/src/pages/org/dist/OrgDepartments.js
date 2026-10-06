"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var stats_card_1 = require("@/components/ui/stats-card");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgDepartments() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("departments");
    var canEdit = hasPermission("departments");
    var canDelete = hasPermission("departments");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    // Fetch departments data
    var _c = trpc_1.trpc.departments.list.useQuery(undefined), _d = _c.data, departmentsData = _d === void 0 ? [] : _d, isLoadingDepartments = _c.isLoading;
    var _e = trpc_1.trpc.employees.list.useQuery(undefined).data, employeesData = _e === void 0 ? [] : _e;
    var utils = trpc_1.trpc.useUtils();
    var deleteDepartmentMutation = trpc_1.trpc.departments["delete"].useMutation({
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.departments.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("Department deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete department");
        }
    });
    // Transform data
    var plainDepartmentsData = Array.isArray(departmentsData)
        ? departmentsData.map(function (d) { return JSON.parse(JSON.stringify(d)); })
        : [];
    var plainEmployeesData = Array.isArray(employeesData)
        ? employeesData.map(function (e) { return JSON.parse(JSON.stringify(e)); })
        : [];
    var departments = react_1.useMemo(function () {
        return plainDepartmentsData.map(function (d) {
            var empCount = plainEmployeesData.filter(function (e) { return e.departmentId === d.id; }).length;
            return {
                id: d.id,
                name: d.name || "Unknown",
                description: d.description || "",
                employeeCount: empCount,
                status: d.status || "active"
            };
        });
    }, [plainDepartmentsData, plainEmployeesData]);
    var filtered = react_1.useMemo(function () {
        return departments.filter(function (d) {
            var matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [departments, searchQuery]);
    var stats = react_1.useMemo(function () {
        var active = departments.filter(function (d) { return d.status === "active"; }).length;
        var totalEmployees = departments.reduce(function (sum, d) { return sum + d.employeeCount; }, 0);
        return { active: active, count: departments.length, totalEmployees: totalEmployees };
    }, [departments]);
    var handleView = function (id) {
        navigate("/org/" + slug + "/departments/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/departments/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this department?")) {
            deleteDepartmentMutation.mutate(id);
        }
    };
    var handleNewDepartment = function () {
        navigate("/org/" + slug + "/departments/new");
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Departments", href: "/org/" + slug + "/departments" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Departments"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage organizational departments and teams")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNewDepartment },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Department"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Departments", value: stats.count, icon: React.createElement(lucide_react_1.Building2, { className: "h-4 w-4 text-blue-500" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active", value: stats.active, icon: React.createElement(lucide_react_1.Building2, { className: "h-4 w-4 text-emerald-500" }), color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Employees", value: stats.totalEmployees, icon: React.createElement(lucide_react_1.Users, { className: "h-4 w-4 text-violet-500" }), color: "border-l-violet-500" })),
            React.createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by name or description...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" }))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Departments List"),
                    React.createElement(card_1.CardDescription, null,
                        filtered.length,
                        " departments")),
                React.createElement(card_1.CardContent, null, isLoadingDepartments ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filtered.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mb-2 opacity-50" }),
                    React.createElement("p", null, "No departments found"))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Name"),
                                React.createElement(table_1.TableHead, null, "Description"),
                                React.createElement(table_1.TableHead, null, "Employees"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (department) { return (React.createElement(table_1.TableRow, { key: department.id },
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, department.name),
                            React.createElement(table_1.TableCell, { className: "max-w-xs truncate" }, department.description),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: "outline" },
                                    department.employeeCount,
                                    " employees")),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: department.status === "active" ? "default" : "secondary" }, department.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(department.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(department.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(department.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgDepartments;
