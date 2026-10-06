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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
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
function DeductionsManagement() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("__all__"), employeeFilter = _c[0], setEmployeeFilter = _c[1];
    var _d = react_1.useState(true), activeOnly = _d[0], setActiveOnly = _d[1];
    var _e = react_1.useState(false), isCreateOpen = _e[0], setIsCreateOpen = _e[1];
    var _f = react_1.useState(false), isEditOpen = _f[0], setIsEditOpen = _f[1];
    var _g = react_1.useState(null), editingDeduction = _g[0], setEditingDeduction = _g[1];
    var _h = react_1.useState({
        employeeId: "",
        deductionType: "",
        amount: "",
        frequency: "monthly",
        notes: ""
    }), formData = _h[0], setFormData = _h[1];
    var _j = trpc_1.trpc.employees.list.useQuery({}).data, employees = _j === void 0 ? [] : _j;
    var _k = trpc_1.trpc.payroll.deductions.list.useQuery({}).data, deductions = _k === void 0 ? [] : _k;
    var createMutation = trpc_1.trpc.payroll.deductions.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Deduction created successfully!");
            utils.payroll.deductions.list.invalidate();
            setFormData({ employeeId: "", deductionType: "", amount: "", frequency: "monthly", notes: "" });
            setIsCreateOpen(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create deduction: " + error.message);
        }
    });
    var updateMutation = trpc_1.trpc.payroll.deductions.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Deduction updated successfully!");
            utils.payroll.deductions.list.invalidate();
            setEditingDeduction(null);
            setIsEditOpen(false);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update deduction: " + error.message);
        }
    });
    var deleteMutation = trpc_1.trpc.payroll.deductions["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Deduction deleted successfully!");
            utils.payroll.deductions.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete deduction: " + error.message);
        }
    });
    var records = deductions.map(function (d) { return (__assign(__assign({}, d), { employeeName: employees.find(function (e) { return e.id === d.employeeId; })
            ? ((employees.find(function (e) { return e.id === d.employeeId; }).firstName || "") + " " + (employees.find(function (e) { return e.id === d.employeeId; }).lastName || "")).trim()
            : "Unknown Employee" })); });
    var filteredRecords = records.filter(function (record) {
        var matchesSearch = record.deductionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
        var matchesEmployee = !employeeFilter || employeeFilter === "__all__" || record.employeeId === employeeFilter;
        var matchesActive = !activeOnly || record.isActive;
        return matchesSearch && matchesEmployee && matchesActive;
    });
    var handleCreateSubmit = function (e) {
        e.preventDefault();
        if (!formData.employeeId || !formData.deductionType || !formData.amount) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        createMutation.mutate({
            employeeId: formData.employeeId,
            deductionType: formData.deductionType,
            amount: Math.round(parseFloat(formData.amount)),
            frequency: formData.frequency,
            notes: formData.notes || undefined
        });
    };
    var handleEditSubmit = function (e) {
        e.preventDefault();
        if (!editingDeduction)
            return;
        updateMutation.mutate({
            id: editingDeduction.id,
            deductionType: formData.deductionType || undefined,
            amount: formData.amount ? Math.round(parseFloat(formData.amount)) : undefined,
            frequency: formData.frequency,
            notes: formData.notes || undefined
        });
    };
    var handleEditClick = function (deduction) {
        setEditingDeduction(deduction);
        setFormData({
            employeeId: deduction.employeeId,
            deductionType: deduction.deductionType,
            amount: String(deduction.amount),
            frequency: deduction.frequency,
            notes: deduction.notes || ""
        });
        setIsEditOpen(true);
    };
    var totalAmount = filteredRecords.reduce(function (sum, r) { return sum + r.amount; }, 0);
    var activeCount = records.filter(function (r) { return r.isActive; }).length;
    var deductionTypes = __spreadArrays(new Set(records.map(function (r) { return r.deductionType; })));
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Deductions Management", description: "Manage employee deductions (loans, insurance, etc.)", icon: React.createElement(lucide_react_1.Minus, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Deductions" },
        ], backLink: { label: "Payroll", href: "/payroll" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Active Deductions", value: activeCount, color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Deduction Types", value: deductionTypes.length, color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Filtered Total", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        totalAmount.toLocaleString()), color: "border-l-blue-500" }),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Impact on Salary")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-sm text-gray-500" }, "Reduces take-home by"),
                        React.createElement("p", { className: "text-lg font-semibold overflow-hidden text-ellipsis" },
                            "Ksh ",
                            (totalAmount * 12).toLocaleString())))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Deductions")),
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
                                React.createElement(button_1.Button, { className: "bg-blue-600 hover:bg-blue-700" },
                                    React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                                    "Add Deduction")),
                            React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                                React.createElement(dialog_1.DialogHeader, null,
                                    React.createElement(dialog_1.DialogTitle, null, "Create Deduction"),
                                    React.createElement(dialog_1.DialogDescription, null, "Add a new deduction for an employee")),
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
                                        React.createElement(label_1.Label, { htmlFor: "type" }, "Deduction Type *"),
                                        React.createElement(input_1.Input, { id: "type", placeholder: "e.g., Loan, Insurance, Tax", value: formData.deductionType, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deductionType: e.target.value })); } })),
                                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
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
                                    React.createElement(table_1.TableHead, null, "Deduction Type"),
                                    React.createElement(table_1.TableHead, null, "Amount (Ksh)"),
                                    React.createElement(table_1.TableHead, null, "Frequency"),
                                    React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, null, "Actions"))),
                            React.createElement(table_1.TableBody, null, filteredRecords.length === 0 ? (React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8 text-gray-500" }, "No deductions found"))) : (filteredRecords.map(function (record) { return (React.createElement(table_1.TableRow, { key: record.id },
                                React.createElement(table_1.TableCell, { className: "font-medium" }, record.employeeName),
                                React.createElement(table_1.TableCell, null, record.deductionType),
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
                                                if (confirm("Delete this deduction?")) {
                                                    deleteMutation.mutate(record.id);
                                                }
                                            }, className: "text-red-600 hover:text-red-700" },
                                            React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" })))))); })))))))),
        React.createElement(dialog_1.Dialog, { open: isEditOpen, onOpenChange: setIsEditOpen },
            React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Edit Deduction"),
                    React.createElement(dialog_1.DialogDescription, null, "Update deduction details")),
                editingDeduction && (React.createElement("form", { onSubmit: handleEditSubmit, className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Employee"),
                        React.createElement("p", { className: "text-sm text-gray-600 mt-1" }, editingDeduction.employeeName)),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "editType" }, "Deduction Type"),
                        React.createElement(input_1.Input, { id: "editType", value: formData.deductionType, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deductionType: e.target.value })); } })),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
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
exports["default"] = DeductionsManagement;
