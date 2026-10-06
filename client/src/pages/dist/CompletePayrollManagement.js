"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var stats_card_1 = require("@/components/ui/stats-card");
var spinner_1 = require("@/components/ui/spinner");
var use_toast_1 = require("@/components/ui/use-toast");
var currency_1 = require("@/lib/currency");
var lucide_react_1 = require("lucide-react");
function CompletePayrollManagement() {
    var formatAmount = currency_1.useCurrencySettings().formatAmount;
    var toast = use_toast_1.useToast().toast;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    // State management
    var _b = react_1.useState("overview"), activeTab = _b[0], setActiveTab = _b[1];
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState("all"), filterDepartment = _d[0], setFilterDepartment = _d[1];
    var _e = react_1.useState("all"), filterStatus = _e[0], setFilterStatus = _e[1];
    var _f = react_1.useState(new Date().toISOString().slice(0, 7)), selectedMonth = _f[0], setSelectedMonth = _f[1];
    var _g = react_1.useState(false), showProcessDialog = _g[0], setShowProcessDialog = _g[1];
    var _h = react_1.useState(false), showStructureDialog = _h[0], setShowStructureDialog = _h[1];
    var _j = react_1.useState(null), editingId = _j[0], setEditingId = _j[1];
    // Form state
    var _k = react_1.useState({ basicSalary: 0, allowances: 0, deductions: 0, taxRate: 0 }), salaryForm = _k[0], setSalaryForm = _k[1];
    var _l = react_1.useState({ type: "", amount: 0, isFixed: true }), allowanceForm = _l[0], setAllowanceForm = _l[1];
    var _m = react_1.useState({ type: "", amount: 0, isFixed: true }), deductionForm = _m[0], setDeductionForm = _m[1];
    var _o = react_1.useState({ type: "", provider: "", amount: 0, employeeContribution: 0 }), benefitForm = _o[0], setBenefitForm = _o[1];
    // Fetch data
    var payrollQ = trpc_1.trpc.payroll.list.useQuery();
    var departmentsQ = trpc_1.trpc.departments.list.useQuery();
    var salaryStructuresQ = trpc_1.trpc.payroll.salaryStructures.list.useQuery();
    var allowancesQ = trpc_1.trpc.payroll.salaryStructures.allowances.list.useQuery();
    var deductionsQ = trpc_1.trpc.payroll.salaryStructures.deductions.list.useQuery();
    var benefitsQ = trpc_1.trpc.payroll.salaryStructures.benefits.list.useQuery();
    var payrollStatsQ = trpc_1.trpc.payroll.stats.useQuery({ month: selectedMonth });
    // Mutations
    var processPayrollMut = trpc_1.trpc.payroll.processBatch.useMutation({
        onSuccess: function () {
            toast({ title: "Success", description: "Payroll processed successfully" });
            setShowProcessDialog(false);
            payrollQ.refetch();
            payrollStatsQ.refetch();
        },
        onError: function (err) { return toast({ title: "Error", description: err.message, variant: "destructive" }); }
    });
    var downloadP9Mut = trpc_1.trpc.payroll.downloadP9.useMutation({
        onSuccess: function (data) {
            var blob = new Blob([data.htmlContent], { type: "text/html" });
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = data.fileName;
            a.click();
            URL.revokeObjectURL(url);
        }
    });
    // Computed values
    var filteredPayroll = react_1.useMemo(function () {
        var result = payrollQ.data || [];
        if (searchQuery) {
            result = result.filter(function (p) {
                return (p.employeeName || "").toLowerCase().includes(searchQuery.toLowerCase());
            });
        }
        if (filterDepartment !== "all") {
            result = result.filter(function (p) { return p.department === filterDepartment; });
        }
        if (filterStatus !== "all") {
            result = result.filter(function (p) { return p.status === filterStatus; });
        }
        return result;
    }, [payrollQ.data, searchQuery, filterDepartment, filterStatus]);
    var stats = payrollStatsQ.data;
    var departments = departmentsQ.data || [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payroll Management", description: "Complete payroll processing, salary structures, and tax management", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "HR", href: "/hr" },
            { label: "Payroll Management" }
        ] },
        React.createElement("div", { className: "space-y-6" },
            stats && (React.createElement("div", { className: "grid gap-4 md:grid-cols-5" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Payroll", value: formatAmount(stats.totalPayroll || 0), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Processed", value: stats.processedCount || 0, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: stats.pendingCount || 0, icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-yellow-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Deductions", value: formatAmount(stats.totalDeductions || 0), icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-red-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Avg Net Salary", value: formatAmount(stats.avgNetSalary || 0), icon: React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), color: "border-l-purple-500" }))),
            React.createElement("div", { className: "flex flex-col md:flex-row gap-3 items-center justify-between" },
                React.createElement("div", { className: "flex gap-2 items-center" },
                    React.createElement(label_1.Label, null, "Period:"),
                    React.createElement(input_1.Input, { type: "month", value: selectedMonth, onChange: function (e) { return setSelectedMonth(e.target.value); }, className: "w-40" })),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { onClick: function () { return setShowProcessDialog(true); }, className: "gap-2" },
                        React.createElement(lucide_react_1.Zap, { className: "h-4 w-4" }),
                        "Process Payroll"),
                    React.createElement(button_1.Button, { variant: "outline", className: "gap-2" },
                        React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
                        "Export"))),
            React.createElement(tabs_1.Tabs, { value: activeTab, onValueChange: function (v) { return setActiveTab(v); } },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "overview", className: "gap-2" },
                        React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" }),
                        "Payroll"),
                    React.createElement(tabs_1.TabsTrigger, { value: "processing", className: "gap-2" },
                        React.createElement(lucide_react_1.Calculator, { className: "h-4 w-4" }),
                        "Processing"),
                    React.createElement(tabs_1.TabsTrigger, { value: "structures", className: "gap-2" },
                        React.createElement(lucide_react_1.Building2, { className: "h-4 w-4" }),
                        "Structures"),
                    React.createElement(tabs_1.TabsTrigger, { value: "allowances", className: "gap-2" },
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                        "Allowances"),
                    React.createElement(tabs_1.TabsTrigger, { value: "deductions", className: "gap-2" },
                        React.createElement(lucide_react_1.Percent, { className: "h-4 w-4" }),
                        "Deductions"),
                    React.createElement(tabs_1.TabsTrigger, { value: "benefits", className: "gap-2" },
                        React.createElement(lucide_react_1.Gift, { className: "h-4 w-4" }),
                        "Benefits")),
                React.createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Payroll Records"),
                            React.createElement(card_1.CardDescription, null, "Manage payroll entries and generate payslips")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "flex flex-col md:flex-row gap-3" },
                                React.createElement("div", { className: "flex-1 relative" },
                                    React.createElement(lucide_react_1.Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }),
                                    React.createElement(input_1.Input, { placeholder: "Search employee name...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-8" })),
                                React.createElement(select_1.Select, { value: filterDepartment, onValueChange: setFilterDepartment },
                                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Department" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "all" }, "All Departments"),
                                        departments.map(function (d) { return (React.createElement(select_1.SelectItem, { key: d.id, value: d.id }, d.name)); }))),
                                React.createElement(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus },
                                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                                        React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                        React.createElement(select_1.SelectItem, { value: "processing" }, "Processing"),
                                        React.createElement(select_1.SelectItem, { value: "paid" }, "Paid")))),
                            React.createElement("div", { className: "overflow-x-auto" },
                                React.createElement(table_1.Table, null,
                                    React.createElement(table_1.TableHeader, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableHead, null, "Employee"),
                                            React.createElement(table_1.TableHead, null, "Department"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Basic Salary"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Allowances"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Deductions"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Net Salary"),
                                            React.createElement(table_1.TableHead, null, "Status"),
                                            React.createElement(table_1.TableHead, null, "Actions"))),
                                    React.createElement(table_1.TableBody, null, payrollQ.isLoading ? (React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8" },
                                            React.createElement(spinner_1.Spinner, { className: "h-6 w-6 mx-auto" })))) : filteredPayroll.length === 0 ? (React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground" }, "No payroll records found"))) : (filteredPayroll.map(function (record) { return (React.createElement(table_1.TableRow, { key: record.id },
                                        React.createElement(table_1.TableCell, { className: "font-medium" }, record.employeeName),
                                        React.createElement(table_1.TableCell, null, record.department),
                                        React.createElement(table_1.TableCell, { className: "text-right" }, formatAmount(record.basicSalary)),
                                        React.createElement(table_1.TableCell, { className: "text-right" }, formatAmount(record.allowances || 0)),
                                        React.createElement(table_1.TableCell, { className: "text-right text-red-600" }, formatAmount(record.deductions || 0)),
                                        React.createElement(table_1.TableCell, { className: "text-right font-semibold" }, formatAmount(record.netSalary)),
                                        React.createElement(table_1.TableCell, null,
                                            React.createElement(badge_1.Badge, { variant: record.status === 'paid' ? 'default' :
                                                    record.status === 'processing' ? 'secondary' :
                                                        'outline' }, record.status)),
                                        React.createElement(table_1.TableCell, null,
                                            React.createElement("div", { className: "flex gap-1" },
                                                React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return downloadP9Mut.mutate({ employeeId: record.employeeId }); }, title: "Download P9" },
                                                    React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" })),
                                                React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return navigate("/payroll/" + record.id); } },
                                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })))))); })))))))),
                React.createElement(tabs_1.TabsContent, { value: "processing" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Payroll Processing"),
                            React.createElement(card_1.CardDescription, null, "Process and manage batch payroll runs")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "space-y-4 text-center py-8" },
                                React.createElement(lucide_react_1.Calculator, { className: "h-12 w-12 mx-auto text-muted-foreground" }),
                                React.createElement("p", { className: "text-muted-foreground" }, "Payroll processing interface"),
                                React.createElement(button_1.Button, { onClick: function () { return setShowProcessDialog(true); } },
                                    "Process for ",
                                    selectedMonth))))),
                React.createElement(tabs_1.TabsContent, { value: "structures" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Salary Structures"),
                            React.createElement(card_1.CardDescription, null, "Manage employee salary structures")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(button_1.Button, { className: "mb-4 gap-2", onClick: function () { return setShowStructureDialog(true); } },
                                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                                "New Structure"),
                            React.createElement("div", { className: "space-y-2" }, (salaryStructuresQ.data || []).map(function (s) { return (React.createElement("div", { key: s.id, className: "border rounded-lg p-4 flex justify-between items-center" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium" }, s.employeeId),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                                        "Basic: ",
                                        formatAmount(s.basicSalary),
                                        " \u2022 Allowances: ",
                                        formatAmount(s.allowances),
                                        " \u2022 Deductions: ",
                                        formatAmount(s.deductions))),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost" },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "text-red-600" },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); }))))),
                React.createElement(tabs_1.TabsContent, { value: "allowances" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Salary Allowances"),
                            React.createElement(card_1.CardDescription, null, "Manage allowance types and amounts")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(button_1.Button, { className: "mb-4 gap-2" },
                                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                                "Add Allowance"),
                            React.createElement("div", { className: "space-y-2" }, (allowancesQ.data || []).map(function (a) { return (React.createElement("div", { key: a.id, className: "border rounded-lg p-4 flex justify-between items-center" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium" }, a.allowanceType),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                                        a.isFixed ? "Fixed" : "Variable",
                                        " \u2022 ",
                                        formatAmount(a.amount))),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost" },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "text-red-600" },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); }))))),
                React.createElement(tabs_1.TabsContent, { value: "deductions" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Salary Deductions"),
                            React.createElement(card_1.CardDescription, null, "Manage deduction types and amounts")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(button_1.Button, { className: "mb-4 gap-2" },
                                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                                "Add Deduction"),
                            React.createElement("div", { className: "space-y-2" }, (deductionsQ.data || []).map(function (d) { return (React.createElement("div", { key: d.id, className: "border rounded-lg p-4 flex justify-between items-center" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium" }, d.deductionType),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                                        d.isFixed ? "Fixed" : "Variable",
                                        " \u2022 ",
                                        formatAmount(d.amount))),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost" },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "text-red-600" },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); }))))),
                React.createElement(tabs_1.TabsContent, { value: "benefits" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Employee Benefits"),
                            React.createElement(card_1.CardDescription, null, "Manage employee benefits programs")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(button_1.Button, { className: "mb-4 gap-2" },
                                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                                "Add Benefit"),
                            React.createElement("div", { className: "space-y-2" }, (benefitsQ.data || []).map(function (b) { return (React.createElement("div", { key: b.id, className: "border rounded-lg p-4 flex justify-between items-center" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium" }, b.benefitType),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                                        "Provider: ",
                                        b.provider,
                                        " \u2022 Amount: ",
                                        formatAmount(b.amount))),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost" },
                                        React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", className: "text-red-600" },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); })))))),
            React.createElement(dialog_1.Dialog, { open: showProcessDialog, onOpenChange: setShowProcessDialog },
                React.createElement(dialog_1.DialogContent, null,
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Process Payroll"),
                        React.createElement(dialog_1.DialogDescription, null,
                            "Process payroll for ",
                            selectedMonth,
                            ". This will generate payslips for all eligible employees.")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm" },
                            React.createElement("p", { className: "font-medium text-blue-900" }, "Processing will:"),
                            React.createElement("ul", { className: "mt-2 space-y-1 text-blue-800 list-disc list-inside" },
                                React.createElement("li", null, "Calculate taxes and deductions"),
                                React.createElement("li", null, "Generate payslips for each employee"),
                                React.createElement("li", null, "Create payment records"),
                                React.createElement("li", null, "Update employee records"))),
                        React.createElement("div", { className: "flex gap-2 justify-end" },
                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowProcessDialog(false); } }, "Cancel"),
                            React.createElement(button_1.Button, { onClick: function () { return processPayrollMut.mutate({ month: selectedMonth }); }, disabled: processPayrollMut.isPending }, processPayrollMut.isPending ? "Processing..." : "Process"))))))));
}
exports["default"] = CompletePayrollManagement;
