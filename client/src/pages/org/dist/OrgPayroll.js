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
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgPayroll() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("payroll");
    var canEdit = hasPermission("payroll");
    var canDelete = hasPermission("payroll");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    // Fetch payroll data
    var _d = trpc_1.trpc.payroll.list.useQuery(undefined), _e = _d.data, payrollData = _e === void 0 ? [] : _e, isLoadingPayroll = _d.isLoading;
    var _f = trpc_1.trpc.employees.list.useQuery(undefined).data, employeesData = _f === void 0 ? [] : _f;
    var utils = trpc_1.trpc.useUtils();
    var deletePayrollMutation = trpc_1.trpc.payroll["delete"].useMutation({
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.payroll.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("Payroll record deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete payroll record");
        }
    });
    // Transform data
    var plainPayrollData = Array.isArray(payrollData)
        ? payrollData.map(function (p) { return JSON.parse(JSON.stringify(p)); })
        : [];
    var plainEmployeesData = Array.isArray(employeesData)
        ? employeesData.map(function (e) { return JSON.parse(JSON.stringify(e)); })
        : [];
    var employeeMap = react_1.useMemo(function () {
        var map = {};
        plainEmployeesData.forEach(function (e) {
            map[e.id] = e.firstName + " " + e.lastName;
        });
        return map;
    }, [plainEmployeesData]);
    var payroll = react_1.useMemo(function () {
        return plainPayrollData.map(function (p) { return ({
            id: p.id,
            employeeName: employeeMap[p.employeeId] || "Unknown",
            period: p.period || p.payrollMonth || "N/A",
            basicSalary: p.basicSalary || p.salary || 0,
            status: p.status || "draft"
        }); });
    }, [plainPayrollData, employeeMap]);
    var filtered = react_1.useMemo(function () {
        return payroll.filter(function (p) {
            var matchesSearch = p.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [payroll, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var paid = payroll.filter(function (p) { return p.status === "paid"; }).length;
        var pending = payroll.filter(function (p) { return p.status === "draft" || p.status === "pending"; }).length;
        var totalAmount = payroll.reduce(function (sum, p) { return sum + p.basicSalary; }, 0);
        return { paid: paid, pending: pending, count: payroll.length, totalAmount: totalAmount };
    }, [payroll]);
    var handleView = function (id) {
        navigate("/org/" + slug + "/payroll/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/payroll/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this payroll record?")) {
            deletePayrollMutation.mutate(id);
        }
    };
    var handleNewPayroll = function () {
        navigate("/org/" + slug + "/payroll/new");
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Payroll", href: "/org/" + slug + "/payroll" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Payroll Management"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Process and manage employee salaries and payments")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNewPayroll },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Payroll"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Records", value: stats.count, icon: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-blue-500" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Paid", value: stats.paid, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-emerald-500" }), color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: stats.pending, icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-amber-500" }), color: "border-l-amber-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Amount", value: "KSh " + (stats.totalAmount / 1000).toFixed(1) + "K", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-violet-500" }), color: "border-l-violet-500" })),
            React.createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by employee name...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                        React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                        React.createElement(select_1.SelectItem, { value: "paid" }, "Paid")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Payroll Records"),
                    React.createElement(card_1.CardDescription, null,
                        filtered.length,
                        " records")),
                React.createElement(card_1.CardContent, null, isLoadingPayroll ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filtered.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mb-2 opacity-50" }),
                    React.createElement("p", null, "No payroll records found"))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Employee"),
                                React.createElement(table_1.TableHead, null, "Period"),
                                React.createElement(table_1.TableHead, null, "Basic Salary"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (payrollRecord) { return (React.createElement(table_1.TableRow, { key: payrollRecord.id },
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, payrollRecord.employeeName),
                            React.createElement(table_1.TableCell, null, payrollRecord.period),
                            React.createElement(table_1.TableCell, null,
                                "KSh ",
                                payrollRecord.basicSalary.toLocaleString()),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: payrollRecord.status === "paid"
                                        ? "default"
                                        : payrollRecord.status === "pending"
                                            ? "secondary"
                                            : "outline" }, payrollRecord.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(payrollRecord.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(payrollRecord.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(payrollRecord.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgPayroll;
