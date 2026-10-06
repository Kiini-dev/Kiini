"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var label_1 = require("@/components/ui/label");
var PayrollImportTab_1 = require("@/components/PayrollImportTab");
var lucide_react_1 = require("lucide-react");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
/** Payroll processing action card — shows current period info and manual trigger */
function ProcessPayrollCard() {
    var utils = trpc_1.trpc.useUtils();
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var periodLabel = now.toLocaleString("en-KE", { month: "long", year: "numeric" });
    var bulkGenerate = trpc_1.trpc.payslips.bulkGenerate.useMutation({
        onSuccess: function (data) {
            var _a;
            sonner_1.toast.success("Payroll processed: " + ((_a = data === null || data === void 0 ? void 0 : data.generated) !== null && _a !== void 0 ? _a : 0) + " payslip(s) generated for " + periodLabel);
            utils.payslips.list.invalidate();
        },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Failed to process payroll"); }
    });
    var isAfter18th = now.getDate() >= 18;
    return (React.createElement(card_1.Card, { className: "border-2 " + (isAfter18th ? "border-blue-400 bg-blue-50/40" : "border-gray-200") },
        React.createElement(card_1.CardContent, { className: "pt-5 pb-4" },
            React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" },
                React.createElement("div", { className: "flex items-start gap-3" },
                    React.createElement("div", { className: "p-2 rounded-lg bg-blue-100" },
                        React.createElement(lucide_react_1.CalendarClock, { className: "h-5 w-5 text-blue-600" })),
                    React.createElement("div", null,
                        React.createElement("p", { className: "font-semibold text-gray-800" },
                            "Monthly Payroll \u2014 ",
                            periodLabel),
                        React.createElement("p", { className: "text-sm text-gray-500 mt-0.5" },
                            "Automated payroll runs on the ",
                            React.createElement("strong", null, "20th"),
                            " at 10:00 AM \u00B7 Payslips dispatched on the ",
                            React.createElement("strong", null, "last day"),
                            " of the month at 23:59"),
                        !isAfter18th && (React.createElement("p", { className: "text-xs text-amber-600 mt-1 flex items-center gap-1" },
                            React.createElement(lucide_react_1.AlertCircle, { className: "h-3.5 w-3.5" }),
                            "Payroll auto-runs on the 20th. You can trigger it manually below when ready.")))),
                React.createElement(button_1.Button, { size: "sm", className: "gap-2 bg-blue-600 hover:bg-blue-700 shrink-0", disabled: bulkGenerate.isPending, onClick: function () {
                        if (!confirm("Process payroll for " + periodLabel + "? This will generate payslips for all active employees."))
                            return;
                        bulkGenerate.mutate({ year: year, month: month });
                    } },
                    React.createElement(lucide_react_1.Play, { className: "h-4 w-4" }),
                    bulkGenerate.isPending ? "Processing…" : "Process Payroll Now")))));
}
function HRPayrollManagement() {
    var currencyCode = currency_1.useCurrencySettings().code;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState("salaryStructures"), activeTab = _b[0], setActiveTab = _b[1];
    var utils = trpc_1.trpc.useUtils();
    // Fetch data for different tabs
    var _c = trpc_1.trpc.employees.list.useQuery().data, employees = _c === void 0 ? [] : _c;
    var _d = trpc_1.trpc.payroll.list.useQuery().data, payrolls = _d === void 0 ? [] : _d;
    var _e = trpc_1.trpc.payroll.salaryStructures.list.useQuery().data, salaryStructures = _e === void 0 ? [] : _e;
    var _f = trpc_1.trpc.payroll.allowances.list.useQuery().data, allowances = _f === void 0 ? [] : _f;
    var _g = trpc_1.trpc.payroll.deductions.list.useQuery().data, deductions = _g === void 0 ? [] : _g;
    var _h = trpc_1.trpc.payroll.benefits.list.useQuery().data, benefits = _h === void 0 ? [] : _h;
    // Mutations
    var deletePayrollMutation = trpc_1.trpc.payroll["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payroll deleted successfully");
            utils.payroll.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete payroll: " + error.message);
        }
    });
    var handleDeletePayroll = function (payrollId) {
        if (confirm("Are you sure you want to delete this payroll?")) {
            deletePayrollMutation.mutate(payrollId);
        }
    };
    var formatCurrency = function (value) {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: currencyCode
        }).format(value / 100);
    };
    var getPayrollStatusBadge = function (status) {
        switch (status) {
            case "draft":
                return React.createElement(badge_1.Badge, { variant: "outline", className: "bg-slate-50" }, "Draft");
            case "processed":
                return React.createElement(badge_1.Badge, { className: "bg-blue-600" }, "Processed");
            case "paid":
                return React.createElement(badge_1.Badge, { className: "bg-green-600" }, "Paid");
            default:
                return React.createElement(badge_1.Badge, { variant: "outline" }, status);
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "HR & Payroll Management", description: "Manage employee payroll, benefits, and compensation", icon: React.createElement(lucide_react_1.DollarSign, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR & Payroll", href: "/payroll" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { onClick: function () { return navigate("/payroll/kenyan"); }, className: "bg-amber-600 hover:bg-amber-700" },
                React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                "Kenyan Payroll"),
            React.createElement(button_1.Button, { onClick: function () { return navigate("/payroll/create"); }, className: "bg-green-600 hover:bg-green-700" },
                React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                "New Payroll")) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Employees", value: employees.length, description: "Active staff", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending Payroll", value: payrolls.filter(function (p) { return p.status === "draft"; }).length, description: "Awaiting processing", icon: React.createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Salary Structures", value: salaryStructures.length, description: "Configured", icon: React.createElement(lucide_react_1.Percent, { className: "h-5 w-5" }), color: "border-l-amber-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Benefits", value: benefits.length, description: "Active benefits", icon: React.createElement(lucide_react_1.Heart, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "border-b" },
                    React.createElement(card_1.CardTitle, null, "Payroll & Compensation"),
                    React.createElement(card_1.CardDescription, null, "Manage employee payroll, salary structures, and compensation packages")),
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab },
                        React.createElement(tabs_1.TabsList, { className: "flex flex-wrap h-auto gap-1" },
                            React.createElement(tabs_1.TabsTrigger, { value: "salaryStructures" }, "Salary Structures"),
                            React.createElement(tabs_1.TabsTrigger, { value: "allowances" }, "Allowances"),
                            React.createElement(tabs_1.TabsTrigger, { value: "deductions" }, "Deductions"),
                            React.createElement(tabs_1.TabsTrigger, { value: "benefits" }, "Benefits"),
                            React.createElement(tabs_1.TabsTrigger, { value: "payroll" }, "Payroll"),
                            React.createElement(tabs_1.TabsTrigger, { value: "import" }, "Import Payroll")),
                        React.createElement(tabs_1.TabsContent, { value: "salaryStructures", className: "space-y-4" },
                            React.createElement("div", { className: "flex justify-end gap-2" },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return utils.payroll.salaryStructures.list.invalidate(); } },
                                    React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4" }),
                                    "Refresh"),
                                React.createElement(button_1.Button, { size: "sm", onClick: function () { return navigate("/salary-structures/create"); }, className: "bg-blue-600" },
                                    React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                    "New Structure")),
                            salaryStructures.length === 0 ? (React.createElement("div", { className: "text-center py-8" },
                                React.createElement("p", { className: "text-muted-foreground" }, "No salary structures configured"))) : (React.createElement("div", { className: "overflow-x-auto" },
                                "`n                  ",
                                React.createElement(table_1.Table, null,
                                    React.createElement(table_1.TableHeader, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableHead, null, "Employee"),
                                            React.createElement(table_1.TableHead, null, "Basic Salary"),
                                            React.createElement(table_1.TableHead, null, "Allowances"),
                                            React.createElement(table_1.TableHead, null, "Deductions"),
                                            React.createElement(table_1.TableHead, null, "Tax Rate"),
                                            React.createElement(table_1.TableHead, null, "Effective Date"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                                    React.createElement(table_1.TableBody, null, salaryStructures.map(function (structure) {
                                        var _a, _b;
                                        return (React.createElement(table_1.TableRow, { key: structure.id },
                                            React.createElement(table_1.TableCell, { className: "font-medium" },
                                                (((_a = employees.find(function (e) { return e.id === structure.employeeId; })) === null || _a === void 0 ? void 0 : _a.firstName) || ""),
                                                " ",
                                                (((_b = employees.find(function (e) { return e.id === structure.employeeId; })) === null || _b === void 0 ? void 0 : _b.lastName) || "")),
                                            React.createElement(table_1.TableCell, null, formatCurrency(structure.basicSalary)),
                                            React.createElement(table_1.TableCell, null, formatCurrency(structure.allowances)),
                                            React.createElement(table_1.TableCell, null, formatCurrency(structure.deductions)),
                                            React.createElement(table_1.TableCell, null,
                                                (structure.taxRate / 100).toFixed(1),
                                                "%"),
                                            React.createElement(table_1.TableCell, null, new Date(structure.effectiveDate).toLocaleDateString()),
                                            React.createElement(table_1.TableCell, { className: "text-right" },
                                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/salary-structures/" + structure.id + "/edit"); } },
                                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })))));
                                    }))),
                                "`n                  "))),
                        React.createElement(tabs_1.TabsContent, { value: "allowances", className: "space-y-4" },
                            React.createElement("div", { className: "flex justify-end gap-2" },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return utils.payroll.allowances.list.invalidate(); } },
                                    React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4" }),
                                    "Refresh"),
                                React.createElement(button_1.Button, { size: "sm", onClick: function () { return navigate("/allowances/create"); }, className: "bg-blue-600" },
                                    React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                    "New Allowance")),
                            React.createElement(card_1.Card, { className: "border-blue-200 bg-blue-50/50" },
                                React.createElement(card_1.CardHeader, null,
                                    React.createElement(card_1.CardTitle, { className: "text-base" }, "Quick Add Custom Allowance"),
                                    React.createElement(card_1.CardDescription, null, "Add a one-time custom allowance for an employee")),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement("div", { className: "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "allowance-employee", className: "text-sm" }, "Employee"),
                                            React.createElement("select", { id: "allowance-employee", className: "w-full px-3 py-2 border rounded-md text-sm" },
                                                React.createElement("option", { value: "" }, "Select employee..."),
                                                employees.map(function (emp) { return (React.createElement("option", { key: emp.id, value: emp.id },
                                                    (emp.firstName || ""),
                                                    " ",
                                                    (emp.lastName || ""))); }))),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "allowance-type", className: "text-sm" }, "Allowance Type"),
                                            React.createElement("input", { id: "allowance-type", type: "text", placeholder: "e.g., Transport, Meal", className: "w-full px-3 py-2 border rounded-md text-sm" })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "allowance-amount", className: "text-sm" }, "Amount (KES)"),
                                            React.createElement("input", { id: "allowance-amount", type: "number", placeholder: "5000", className: "w-full px-3 py-2 border rounded-md text-sm text-right" })),
                                        React.createElement("div", { className: "flex items-end gap-2" },
                                            React.createElement(button_1.Button, { size: "sm", className: "bg-blue-600 w-full", onClick: function () {
                                                    var employeeEl = document.getElementById("allowance-employee");
                                                    var typeEl = document.getElementById("allowance-type");
                                                    var amountEl = document.getElementById("allowance-amount");
                                                    var employeeId = (employeeEl === null || employeeEl === void 0 ? void 0 : employeeEl.value) || "";
                                                    var allowanceType = ((typeEl === null || typeEl === void 0 ? void 0 : typeEl.value) || "").trim();
                                                    var amount = Number((amountEl === null || amountEl === void 0 ? void 0 : amountEl.value) || 0);
                                                    if (!employeeId || !allowanceType || amount <= 0) {
                                                        sonner_1.toast.error("Select employee, type, and amount before adding");
                                                        return;
                                                    }
                                                    sonner_1.toast.success("Added " + allowanceType + " allowance (KES " + amount.toLocaleString() + ") to draft");
                                                    if (typeEl)
                                                        typeEl.value = "";
                                                    if (amountEl)
                                                        amountEl.value = "";
                                                } }, "Add"))))),
                            allowances.length === 0 ? (React.createElement("div", { className: "text-center py-8" },
                                React.createElement("p", { className: "text-muted-foreground" }, "No allowances configured"))) : (React.createElement("div", { className: "overflow-x-auto" },
                                "`n                  ",
                                React.createElement(table_1.Table, null,
                                    React.createElement(table_1.TableHeader, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableHead, null, "Employee"),
                                            React.createElement(table_1.TableHead, null, "Allowance Type"),
                                            React.createElement(table_1.TableHead, null, "Amount"),
                                            React.createElement(table_1.TableHead, null, "Frequency"),
                                            React.createElement(table_1.TableHead, null, "Status"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                                    React.createElement(table_1.TableBody, null, allowances.map(function (allowance) {
                                        var _a, _b;
                                        return (React.createElement(table_1.TableRow, { key: allowance.id },
                                            React.createElement(table_1.TableCell, { className: "font-medium" },
                                                (((_a = employees.find(function (e) { return e.id === allowance.employeeId; })) === null || _a === void 0 ? void 0 : _a.firstName) || ""),
                                                " ",
                                                (((_b = employees.find(function (e) { return e.id === allowance.employeeId; })) === null || _b === void 0 ? void 0 : _b.lastName) || "")),
                                            React.createElement(table_1.TableCell, null, allowance.allowanceType),
                                            React.createElement(table_1.TableCell, null, formatCurrency(allowance.amount)),
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement(badge_1.Badge, { variant: "outline" }, allowance.frequency)),
                                            React.createElement(table_1.TableCell, null, allowance.isActive ? (React.createElement(badge_1.Badge, { className: "bg-green-600" }, "Active")) : (React.createElement(badge_1.Badge, { variant: "outline" }, "Inactive"))),
                                            React.createElement(table_1.TableCell, { className: "text-right" },
                                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/allowances/" + allowance.id + "/edit"); } },
                                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })))));
                                    }))),
                                "`n                  "))),
                        React.createElement(tabs_1.TabsContent, { value: "deductions", className: "space-y-4" },
                            React.createElement("div", { className: "flex justify-end gap-2" },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return utils.payroll.deductions.list.invalidate(); } },
                                    React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4" }),
                                    "Refresh"),
                                React.createElement(button_1.Button, { size: "sm", onClick: function () { return navigate("/payroll/deductions/create"); }, className: "bg-red-600 hover:bg-red-700" },
                                    React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                    "New Deduction")),
                            deductions.length === 0 ? (React.createElement("div", { className: "text-center py-8" },
                                React.createElement("p", { className: "text-muted-foreground" }, "No deductions configured"))) : (React.createElement("div", { className: "overflow-x-auto" },
                                "`n                  ",
                                React.createElement(table_1.Table, null,
                                    React.createElement(table_1.TableHeader, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableHead, null, "Employee"),
                                            React.createElement(table_1.TableHead, null, "Deduction Type"),
                                            React.createElement(table_1.TableHead, null, "Amount"),
                                            React.createElement(table_1.TableHead, null, "Frequency"),
                                            React.createElement(table_1.TableHead, null, "Status"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                                    React.createElement(table_1.TableBody, null, deductions.map(function (deduction) {
                                        var _a, _b;
                                        return (React.createElement(table_1.TableRow, { key: deduction.id },
                                            React.createElement(table_1.TableCell, { className: "font-medium" },
                                                (((_a = employees.find(function (e) { return e.id === deduction.employeeId; })) === null || _a === void 0 ? void 0 : _a.firstName) || ""),
                                                " ",
                                                (((_b = employees.find(function (e) { return e.id === deduction.employeeId; })) === null || _b === void 0 ? void 0 : _b.lastName) || "")),
                                            React.createElement(table_1.TableCell, null, deduction.deductionType),
                                            React.createElement(table_1.TableCell, null, formatCurrency(deduction.amount)),
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement(badge_1.Badge, { variant: "outline" }, deduction.frequency)),
                                            React.createElement(table_1.TableCell, null, deduction.isActive ? (React.createElement(badge_1.Badge, { className: "bg-green-600" }, "Active")) : (React.createElement(badge_1.Badge, { variant: "outline" }, "Inactive"))),
                                            React.createElement(table_1.TableCell, { className: "text-right" },
                                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/payroll/deductions/" + deduction.id + "/edit"); } },
                                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })))));
                                    }))),
                                "`n                  "))),
                        React.createElement(tabs_1.TabsContent, { value: "benefits", className: "space-y-4" },
                            React.createElement("div", { className: "flex justify-end gap-2" },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return utils.payroll.benefits.list.invalidate(); } },
                                    React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4" }),
                                    "Refresh"),
                                React.createElement(button_1.Button, { size: "sm", onClick: function () { return navigate("/payroll/benefits/create"); }, className: "bg-purple-600 hover:bg-purple-700" },
                                    React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                    "New Benefit")),
                            benefits.length === 0 ? (React.createElement("div", { className: "text-center py-8" },
                                React.createElement("p", { className: "text-muted-foreground" }, "No benefits configured"))) : (React.createElement("div", { className: "overflow-x-auto" },
                                "`n                  ",
                                React.createElement(table_1.Table, null,
                                    React.createElement(table_1.TableHeader, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableHead, null, "Employee"),
                                            React.createElement(table_1.TableHead, null, "Benefit Type"),
                                            React.createElement(table_1.TableHead, null, "Provider"),
                                            React.createElement(table_1.TableHead, null, "Cost"),
                                            React.createElement(table_1.TableHead, null, "Status"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                                    React.createElement(table_1.TableBody, null, benefits.map(function (benefit) {
                                        var _a, _b;
                                        return (React.createElement(table_1.TableRow, { key: benefit.id },
                                            React.createElement(table_1.TableCell, { className: "font-medium" },
                                                (((_a = employees.find(function (e) { return e.id === benefit.employeeId; })) === null || _a === void 0 ? void 0 : _a.firstName) || ""),
                                                " ",
                                                (((_b = employees.find(function (e) { return e.id === benefit.employeeId; })) === null || _b === void 0 ? void 0 : _b.lastName) || "")),
                                            React.createElement(table_1.TableCell, null, benefit.benefitType),
                                            React.createElement(table_1.TableCell, null, benefit.provider || "-"),
                                            React.createElement(table_1.TableCell, null, formatCurrency(benefit.cost || 0)),
                                            React.createElement(table_1.TableCell, null, benefit.isActive ? (React.createElement(badge_1.Badge, { className: "bg-green-600" }, "Active")) : (React.createElement(badge_1.Badge, { variant: "outline" }, "Inactive"))),
                                            React.createElement(table_1.TableCell, { className: "text-right" },
                                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/payroll/benefits/" + benefit.id + "/edit"); } },
                                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })))));
                                    }))),
                                "`n                  "))),
                        React.createElement(tabs_1.TabsContent, { value: "payroll", className: "space-y-4" },
                            React.createElement(ProcessPayrollCard, null),
                            React.createElement("div", { className: "flex justify-end gap-2" },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return utils.payroll.list.invalidate(); } },
                                    React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-4 w-4" }),
                                    "Refresh"),
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "text-blue-600 border-blue-600 hover:bg-blue-50" },
                                    React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                                    "Export to Excel"),
                                React.createElement(button_1.Button, { size: "sm", onClick: function () { return navigate("/payroll/create"); }, className: "bg-green-600" },
                                    React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                                    "New Payroll")),
                            payrolls.length === 0 ? (React.createElement("div", { className: "text-center py-8" },
                                React.createElement("p", { className: "text-muted-foreground" }, "No payroll records found"))) : (React.createElement("div", { className: "overflow-x-auto" },
                                "`n                  ",
                                React.createElement(table_1.Table, null,
                                    React.createElement(table_1.TableHeader, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableHead, null, "Employee"),
                                            React.createElement(table_1.TableHead, null, "Pay Period"),
                                            React.createElement(table_1.TableHead, null, "Basic Salary"),
                                            React.createElement(table_1.TableHead, null, "Allowances"),
                                            React.createElement(table_1.TableHead, null, "Deductions"),
                                            React.createElement(table_1.TableHead, null, "Net Salary"),
                                            React.createElement(table_1.TableHead, null, "Status"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                                    React.createElement(table_1.TableBody, null, payrolls.map(function (payroll) {
                                        var _a, _b;
                                        return (React.createElement(table_1.TableRow, { key: payroll.id },
                                            React.createElement(table_1.TableCell, { className: "font-medium" },
                                                (((_a = employees.find(function (e) { return e.id === payroll.employeeId; })) === null || _a === void 0 ? void 0 : _a.firstName) || ""),
                                                " ",
                                                (((_b = employees.find(function (e) { return e.id === payroll.employeeId; })) === null || _b === void 0 ? void 0 : _b.lastName) || "")),
                                            React.createElement(table_1.TableCell, null, payroll.payPeriodStart
                                                ? new Date(payroll.payPeriodStart).toLocaleDateString()
                                                : "-"),
                                            React.createElement(table_1.TableCell, null, formatCurrency(payroll.basicSalary)),
                                            React.createElement(table_1.TableCell, null, formatCurrency(payroll.allowances || 0)),
                                            React.createElement(table_1.TableCell, null, formatCurrency(payroll.deductions || 0)),
                                            React.createElement(table_1.TableCell, { className: "font-bold" }, formatCurrency(payroll.netSalary)),
                                            React.createElement(table_1.TableCell, null, getPayrollStatusBadge(payroll.status)),
                                            React.createElement(table_1.TableCell, { className: "text-right" },
                                                React.createElement("div", { className: "flex justify-end gap-2" },
                                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/payroll/" + payroll.id); } },
                                                        React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: function () { return handleDeletePayroll(payroll.id); } },
                                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))));
                                    }))),
                                "`n                  "))),
                        React.createElement(tabs_1.TabsContent, { value: "import", className: "space-y-4" },
                            React.createElement(PayrollImportTab_1["default"], null))))))));
}
exports["default"] = HRPayrollManagement;
