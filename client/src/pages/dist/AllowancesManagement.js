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
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
function AllowancesManagement() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("__all__"), employeeFilter = _c[0], setEmployeeFilter = _c[1];
    var _d = react_1.useState(true), activeOnly = _d[0], setActiveOnly = _d[1];
    var _e = react_1.useState(new Set()), selectedAllowanceIds = _e[0], setSelectedAllowanceIds = _e[1];
    var _f = react_1.useState(false), isCreateOpen = _f[0], setIsCreateOpen = _f[1];
    var _g = react_1.useState(false), isEditOpen = _g[0], setIsEditOpen = _g[1];
    var _h = react_1.useState(null), editingAllowance = _h[0], setEditingAllowance = _h[1];
    var _j = react_1.useState({
        employeeId: "",
        allowanceType: "",
        amount: "",
        frequency: "monthly",
        notes: ""
    }), formData = _j[0], setFormData = _j[1];
    var _k = trpc_1.trpc.employees.list.useQuery({}).data, employees = _k === void 0 ? [] : _k;
    var _l = trpc_1.trpc.payroll.allowances.list.useQuery({}).data, allowances = _l === void 0 ? [] : _l;
    var createMutation = trpc_1.trpc.payroll.allowances.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Allowance created successfully!");
            utils.payroll.allowances.list.invalidate();
            setFormData({ employeeId: "", allowanceType: "", amount: "", frequency: "monthly", notes: "" });
            setIsCreateOpen(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create allowance: " + error.message);
        }
    });
    var updateMutation = trpc_1.trpc.payroll.allowances.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Allowance updated successfully!");
            utils.payroll.allowances.list.invalidate();
            setEditingAllowance(null);
            setIsEditOpen(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update allowance: " + error.message);
        }
    });
    var deleteMutation = trpc_1.trpc.payroll.allowances["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Allowance deleted successfully!");
            utils.payroll.allowances.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete allowance: " + error.message);
        }
    });
    var records = allowances.map(function (a) { return (__assign(__assign({}, a), { employeeName: employees.find(function (e) { return e.id === a.employeeId; })
            ? ((employees.find(function (e) { return e.id === a.employeeId; }).firstName || "") + " " + (employees.find(function (e) { return e.id === a.employeeId; }).lastName || "")).trim()
            : "Unknown Employee" })); });
    var filteredRecords = records.filter(function (record) {
        var matchesSearch = record.allowanceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
        var matchesEmployee = !employeeFilter || employeeFilter === "__all__" || record.employeeId === employeeFilter;
        var matchesActive = !activeOnly || record.isActive;
        return matchesSearch && matchesEmployee && matchesActive;
    });
    var handleCreateSubmit = function (e) {
        e.preventDefault();
        if (!formData.employeeId || !formData.allowanceType || !formData.amount) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        createMutation.mutate({
            employeeId: formData.employeeId,
            allowanceType: formData.allowanceType,
            amount: Math.round(parseFloat(formData.amount)),
            frequency: formData.frequency,
            notes: formData.notes || undefined
        });
    };
    var handleEditSubmit = function (e) {
        e.preventDefault();
        if (!editingAllowance)
            return;
        updateMutation.mutate({
            id: editingAllowance.id,
            allowanceType: formData.allowanceType || undefined,
            amount: formData.amount ? Math.round(parseFloat(formData.amount)) : undefined,
            frequency: formData.frequency,
            notes: formData.notes || undefined
        });
    };
    var handleEditClick = function (allowance) {
        setEditingAllowance(allowance);
        setFormData({
            employeeId: allowance.employeeId,
            allowanceType: allowance.allowanceType,
            amount: String(allowance.amount),
            frequency: allowance.frequency,
            notes: allowance.notes || ""
        });
        setIsEditOpen(true);
    };
    var totalAmount = filteredRecords.reduce(function (sum, r) { return sum + r.amount; }, 0);
    var activeCount = records.filter(function (r) { return r.isActive; }).length;
    var frequencyBreakdown = {
        monthly: records.filter(function (r) { return r.frequency === "monthly" && r.isActive; }).length,
        quarterly: records.filter(function (r) { return r.frequency === "quarterly" && r.isActive; }).length,
        annual: records.filter(function (r) { return r.frequency === "annual" && r.isActive; }).length,
        one_time: records.filter(function (r) { return r.frequency === "one_time" && r.isActive; }).length
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Allowances Management", description: "Manage employee allowances (housing, transport, meal, etc.)", icon: React.createElement(lucide_react_1.DollarSign, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Allowances" },
        ], backLink: { label: "Payroll", href: "/payroll" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Active Allowances", value: activeCount, color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Monthly", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (frequencyBreakdown.monthly * 1000).toLocaleString()), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Filtered Total", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        totalAmount.toLocaleString()), color: "border-l-blue-500" }),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Frequency Split")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-xs space-y-1" },
                            React.createElement("p", null,
                                "Monthly: ",
                                frequencyBreakdown.monthly),
                            React.createElement("p", null,
                                "Quarterly: ",
                                frequencyBreakdown.quarterly))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Allowances")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "flex gap-4 flex-wrap" },
                        React.createElement("div", { className: "flex-1 min-w-[250px]" },
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-gray-400" }),
                                React.createElement(input_1.Input, { placeholder: "Search by type or employee...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-8" }))),
                        React.createElement(select_1.Select, { value: employeeFilter, onValueChange: setEmployeeFilter },
                            React.createElement(select_1.SelectTrigger, { className: "w-[200px]" },
                                React.createElement(select_1.SelectValue, { placeholder: "Filter by employee" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "__all__" }, "All Employees"),
                                employees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                                    emp.firstName,
                                    " ",
                                    emp.lastName)); }))),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(checkbox_1.Checkbox, { id: "activeOnly", checked: activeOnly, onCheckedChange: function (checked) { return setActiveOnly(checked); } }),
                            React.createElement(label_1.Label, { htmlFor: "activeOnly", className: "font-normal" }, "Active Only")),
                        React.createElement(dialog_1.Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen },
                            React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                React.createElement(button_1.Button, { className: "bg-green-600 hover:bg-green-700" },
                                    React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                                    "Add Allowance")),
                            React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                                React.createElement(dialog_1.DialogHeader, null,
                                    React.createElement(dialog_1.DialogTitle, null, "Create Allowance"),
                                    React.createElement(dialog_1.DialogDescription, null, "Add a new allowance for an employee")),
                                React.createElement("form", { onSubmit: handleCreateSubmit, className: "space-y-4" },
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { htmlFor: "emp" }, "Employee *"),
                                        React.createElement(select_1.Select, { value: formData.employeeId, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { employeeId: v })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Select employee" })),
                                            React.createElement(select_1.SelectContent, null, employees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                                                emp.firstName,
                                                " ",
                                                emp.lastName)); })))),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { htmlFor: "type" }, "Allowance Type *"),
                                        React.createElement(input_1.Input, { id: "type", placeholder: "e.g., Housing, Transport, Meals", value: formData.allowanceType, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { allowanceType: e.target.value })); } })),
                                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { htmlFor: "amount" }, "Amount (Ksh) *"),
                                            React.createElement(input_1.Input, { id: "amount", type: "number", placeholder: "0", value: formData.amount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { amount: e.target.value })); }, min: "0" })),
                                        React.createElement("div", null,
                                            React.createElement(label_1.Label, { htmlFor: "freq" }, "Frequency *"),
                                            React.createElement(select_1.Select, { value: formData.frequency, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { frequency: v })); } },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, null)),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                                                    React.createElement(select_1.SelectItem, { value: "quarterly" }, "Quarterly"),
                                                    React.createElement(select_1.SelectItem, { value: "annual" }, "Annual"),
                                                    React.createElement(select_1.SelectItem, { value: "one_time" }, "One-time"))))),
                                    React.createElement("div", null,
                                        React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                                        React.createElement(input_1.Input, { id: "notes", placeholder: "Optional notes", value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); } })),
                                    React.createElement(button_1.Button, { type: "submit", className: "w-full", disabled: createMutation.isPending }, createMutation.isPending ? "Creating..." : "Create"))))),
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Employee"),
                                    React.createElement(table_1.TableHead, null, "Allowance Type"),
                                    React.createElement(table_1.TableHead, null, "Amount (Ksh)"),
                                    React.createElement(table_1.TableHead, null, "Frequency"),
                                    React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, null, "Actions"))),
                            React.createElement(table_1.TableBody, null, filteredRecords.length === 0 ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8 text-gray-500" }, "No allowances found"))) : (filteredRecords.map(function (record) { return (React.createElement(table_1.TableRow, { key: record.id },
                                React.createElement(table_1.TableCell, { className: "font-medium" }, record.employeeName),
                                React.createElement(table_1.TableCell, null, record.allowanceType),
                                React.createElement(table_1.TableCell, null, record.amount.toLocaleString()),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: "outline", className: "capitalize" }, record.frequency.replace("_", " "))),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { className: record.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800" }, record.isActive ? "Active" : "Inactive")),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("div", { className: "flex gap-2" },
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEditClick(record); } },
                                            React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4" })),
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () {
                                                if (confirm("Delete this allowance?")) {
                                                    deleteMutation.mutate(record.id);
                                                }
                                            }, className: "text-red-600 hover:text-red-700" },
                                            React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" })))))); })))))))),
        React.createElement(dialog_1.Dialog, { open: isEditOpen, onOpenChange: setIsEditOpen },
            React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Edit Allowance"),
                    React.createElement(dialog_1.DialogDescription, null, "Update allowance details")),
                editingAllowance && (React.createElement("form", { onSubmit: handleEditSubmit, className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Employee"),
                        React.createElement("p", { className: "text-sm text-gray-600 mt-1" }, editingAllowance.employeeName)),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "editType" }, "Allowance Type"),
                        React.createElement(input_1.Input, { id: "editType", value: formData.allowanceType, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { allowanceType: e.target.value })); } })),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "editAmount" }, "Amount (Ksh)"),
                            React.createElement(input_1.Input, { id: "editAmount", type: "number", value: formData.amount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { amount: e.target.value })); }, min: "0" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "editFreq" }, "Frequency"),
                            React.createElement(select_1.Select, { value: formData.frequency, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { frequency: v })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                                    React.createElement(select_1.SelectItem, { value: "quarterly" }, "Quarterly"),
                                    React.createElement(select_1.SelectItem, { value: "annual" }, "Annual"),
                                    React.createElement(select_1.SelectItem, { value: "one_time" }, "One-time"))))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "editNotes" }, "Notes"),
                        React.createElement(input_1.Input, { id: "editNotes", value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); } })),
                    React.createElement(button_1.Button, { type: "submit", className: "w-full", disabled: updateMutation.isPending }, updateMutation.isPending ? "Updating..." : "Update")))))));
}
exports["default"] = AllowancesManagement;
