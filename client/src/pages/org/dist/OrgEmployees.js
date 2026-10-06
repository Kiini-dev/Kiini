"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var OrgModuleLayout_1 = require("@/components/OrgModuleLayout");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var skeleton_1 = require("@/components/ui/skeleton");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgEmployees() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("employees");
    var canEdit = hasPermission("employees");
    var canDelete = hasPermission("employees");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    // Fetch employees data
    var _d = trpc_1.trpc.employees.list.useQuery(undefined), _e = _d.data, employeesData = _e === void 0 ? [] : _e, isLoadingEmployees = _d.isLoading;
    var _f = trpc_1.trpc.departments.list.useQuery(undefined).data, departmentsData = _f === void 0 ? [] : _f;
    var _g = trpc_1.trpc.jobGroups.list.useQuery(undefined).data, jobGroupsData = _g === void 0 ? [] : _g;
    var utils = trpc_1.trpc.useUtils();
    var deleteEmployeeMutation = trpc_1.trpc.employees["delete"].useMutation({
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.employees.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("Employee deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete employee");
        }
    });
    // Transform data
    var plainEmployeesData = Array.isArray(employeesData)
        ? employeesData.map(function (e) { return JSON.parse(JSON.stringify(e)); })
        : [];
    var plainDepartmentsData = Array.isArray(departmentsData)
        ? departmentsData.map(function (d) { return JSON.parse(JSON.stringify(d)); })
        : [];
    var plainJobGroupsData = Array.isArray(jobGroupsData)
        ? jobGroupsData.map(function (jg) { return JSON.parse(JSON.stringify(jg)); })
        : [];
    var departmentMap = react_1.useMemo(function () {
        var map = {};
        plainDepartmentsData.forEach(function (d) {
            map[d.id] = d.name || "Unknown";
        });
        return map;
    }, [plainDepartmentsData]);
    var jobGroupMap = react_1.useMemo(function () {
        var map = {};
        plainJobGroupsData.forEach(function (jg) {
            map[jg.id] = jg.name || "Unknown";
        });
        return map;
    }, [plainJobGroupsData]);
    var employees = react_1.useMemo(function () {
        return plainEmployeesData.map(function (e) { return ({
            id: e.id,
            firstName: e.firstName || "",
            lastName: e.lastName || "",
            email: e.email || "",
            phone: e.phone || "",
            jobGroup: jobGroupMap[e.jobGroupId] || "Unassigned",
            department: departmentMap[e.departmentId] || "Unassigned",
            status: e.status || "active"
        }); });
    }, [plainEmployeesData, departmentMap, jobGroupMap]);
    var filtered = react_1.useMemo(function () {
        return employees.filter(function (employee) {
            var fullName = (employee.firstName + " " + employee.lastName).toLowerCase();
            var matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                employee.phone.includes(searchQuery);
            var matchesStatus = statusFilter === "all" || employee.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [employees, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var active = employees.filter(function (e) { return e.status === "active"; }).length;
        var inactive = employees.filter(function (e) { return e.status === "inactive"; }).length;
        return { active: active, inactive: inactive, count: employees.length };
    }, [employees]);
    var summaryStats = [
        { label: "Total Employees", value: String(stats.count), trend: undefined },
        { label: "Active", value: String(stats.active), trend: undefined },
        { label: "Inactive", value: String(stats.inactive), trend: undefined },
        { label: "Departments", value: String(Object.keys(departmentMap).length), trend: undefined },
    ];
    var handleView = function (id) {
        navigate("/org/" + slug + "/employees/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/employees/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this employee?")) {
            deleteEmployeeMutation.mutate(id);
        }
    };
    var handleNewEmployee = function () {
        navigate("/org/" + slug + "/employees/new");
    };
    return (React.createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Employees", description: "Manage your workforce and employee information", icon: lucide_react_1.Users, breadcrumbs: [
            { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
            { label: "Employees" },
        ], actions: canCreate && (React.createElement(button_1.Button, { size: "sm", onClick: handleNewEmployee },
            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
            " New Employee")), backLink: "/org/" + slug + "/dashboard", hasAccess: true },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(SummaryStatCards_1.SummaryStatCards, { cards: summaryStats, isLoading: isLoadingEmployees }),
            React.createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by name, email, or phone...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                        React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive"),
                        React.createElement(select_1.SelectItem, { value: "on-leave" }, "On Leave")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" }, isLoadingEmployees ? (React.createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return React.createElement(skeleton_1.Skeleton, { key: i, className: "h-12 rounded" }); }))) : filtered.length === 0 ? (React.createElement("div", { className: "py-16 text-center" },
                    React.createElement(lucide_react_1.Users, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
                    React.createElement("p", { className: "text-muted-foreground text-sm" }, searchQuery || statusFilter !== "all" ? "No employees match your filters" : "No employees yet"),
                    canCreate && (React.createElement(button_1.Button, { className: "mt-4", size: "sm", onClick: handleNewEmployee },
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        " Add First Employee")))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Name"),
                                React.createElement(table_1.TableHead, null, "Email"),
                                React.createElement(table_1.TableHead, null, "Phone"),
                                React.createElement(table_1.TableHead, null, "Department"),
                                React.createElement(table_1.TableHead, null, "Job Group"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (employee) { return (React.createElement(table_1.TableRow, { key: employee.id, className: "hover:bg-muted/30" },
                            React.createElement(table_1.TableCell, { className: "font-semibold" },
                                employee.firstName,
                                " ",
                                employee.lastName),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("a", { href: "mailto:" + employee.email, className: "text-blue-600 hover:underline flex items-center gap-1" },
                                    React.createElement(lucide_react_1.Mail, { className: "h-3 w-3" }),
                                    employee.email)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("a", { href: "tel:" + employee.phone, className: "text-blue-600 hover:underline flex items-center gap-1" },
                                    React.createElement(lucide_react_1.Phone, { className: "h-3 w-3" }),
                                    employee.phone)),
                            React.createElement(table_1.TableCell, null, employee.department),
                            React.createElement(table_1.TableCell, null, employee.jobGroup),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: employee.status === "active" ? "default" : "secondary", className: employee.status === "active" ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30" : "" }, employee.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(employee.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(employee.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(employee.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgEmployees;
