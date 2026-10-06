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
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var CATEGORIES = [
    "CAPEX",
    "OPEX",
    "SALARIES",
    "TRAINING",
    "TRAVEL",
    "UTILITIES",
    "MARKETING",
    "IT",
    "MAINTENANCE",
    "CONTINGENCY",
    "OTHER",
];
var CATEGORY_COLORS = {
    CAPEX: "bg-blue-100 text-blue-800",
    OPEX: "bg-purple-100 text-purple-800",
    SALARIES: "bg-green-100 text-green-800",
    TRAINING: "bg-yellow-100 text-yellow-800",
    TRAVEL: "bg-orange-100 text-orange-800",
    UTILITIES: "bg-cyan-100 text-cyan-800",
    MARKETING: "bg-pink-100 text-pink-800",
    IT: "bg-indigo-100 text-indigo-800",
    MAINTENANCE: "bg-amber-100 text-amber-800",
    CONTINGENCY: "bg-red-100 text-red-800",
    OTHER: "bg-gray-100 text-gray-800"
};
function formatKES(cents) {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0
    }).format(cents / 100);
}
function getProgressColor(pct) {
    if (pct < 50)
        return "bg-green-500";
    if (pct < 75)
        return "bg-yellow-500";
    if (pct < 90)
        return "bg-orange-500";
    return "bg-red-500";
}
var emptyForm = {
    category: "OPEX",
    lineDescription: "",
    allocatedAmount: ""
};
function BudgetDetail() {
    var params = wouter_1.useParams();
    var id = params.id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = permissions_1.useRequireFeature("budgets:view"), allowed = _b.allowed, permissionLoading = _b.isLoading;
    var _c = trpc_1.trpc.budgets.getById.useQuery(id, {
        enabled: !!id
    }), budget = _c.data, budgetLoading = _c.isLoading;
    var _d = trpc_1.trpc.budgets.listLines.useQuery(id, { enabled: !!id }), lines = _d.data, linesLoading = _d.isLoading, refetchLines = _d.refetch;
    var createLineMutation = trpc_1.trpc.budgets.createLine.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Budget line created");
            refetchLines();
            setDialogOpen(false);
            setForm(emptyForm);
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to create line"); }
    });
    var updateLineMutation = trpc_1.trpc.budgets.updateLine.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Budget line updated");
            refetchLines();
            setDialogOpen(false);
            setEditingLineId(null);
            setForm(emptyForm);
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to update line"); }
    });
    var deleteLineMutation = trpc_1.trpc.budgets.deleteLine.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Budget line deleted");
            refetchLines();
        },
        onError: function (err) { return sonner_1.toast.error(err.message || "Failed to delete line"); }
    });
    var _e = react_1.useState(false), dialogOpen = _e[0], setDialogOpen = _e[1];
    var _f = react_1.useState(null), editingLineId = _f[0], setEditingLineId = _f[1];
    var _g = react_1.useState(emptyForm), form = _g[0], setForm = _g[1];
    function openAddDialog() {
        setEditingLineId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    }
    function openEditDialog(line) {
        setEditingLineId(line.id);
        setForm({
            category: line.category,
            lineDescription: line.lineDescription || "",
            allocatedAmount: String(line.allocatedAmount / 100)
        });
        setDialogOpen(true);
    }
    function handleSave() {
        var allocatedCents = Math.round(parseFloat(form.allocatedAmount) * 100);
        if (isNaN(allocatedCents) || allocatedCents < 0) {
            sonner_1.toast.error("Enter a valid allocated amount");
            return;
        }
        if (editingLineId) {
            updateLineMutation.mutate({
                id: editingLineId,
                category: form.category,
                lineDescription: form.lineDescription || undefined,
                allocatedAmount: allocatedCents
            });
        }
        else {
            createLineMutation.mutate({
                budgetId: id,
                category: form.category,
                lineDescription: form.lineDescription || undefined,
                allocatedAmount: allocatedCents
            });
        }
    }
    if (permissionLoading || budgetLoading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed)
        return null;
    if (!budget) {
        return (react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center h-screen gap-4" },
            react_1["default"].createElement("p", { className: "text-gray-600" }, "Budget not found."),
            react_1["default"].createElement(button_1.Button, { onClick: function () { return navigate("/budgets"); }, variant: "outline" },
                react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back to Budgets")));
    }
    var linesArray = Array.isArray(lines) ? lines : [];
    var totalAllocated = linesArray.reduce(function (s, l) { return s + (l.allocatedAmount || 0); }, 0);
    var totalSpent = linesArray.reduce(function (s, l) { return s + (l.spentAmount || 0); }, 0);
    var totalRemaining = linesArray.reduce(function (s, l) { return s + (l.remainingAmount || 0); }, 0);
    var budgetAmountCents = budget.amount || 0;
    var budgetRemainingCents = budget.remaining || 0;
    var budgetSpentCents = budgetAmountCents - budgetRemainingCents;
    var overallPct = budgetAmountCents === 0
        ? 0
        : Math.round((budgetSpentCents / budgetAmountCents) * 100);
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Budget \u2014 " + (budget.departmentName || "Unknown Department") + " (FY " + budget.fiscalYear + ")", description: "Manage budget lines and track allocation by category", icon: react_1["default"].createElement(lucide_react_1.PiggyBank, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Accounting", href: "/Accounting" },
            { label: "Budgets", href: "/budgets" },
            { label: budget.departmentName + " FY " + budget.fiscalYear },
        ], actions: react_1["default"].createElement("div", { className: "flex gap-2" },
            react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/budgets"); }, className: "gap-2" },
                react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4" }),
                "Back"),
            react_1["default"].createElement(button_1.Button, { onClick: openAddDialog, className: "gap-2" },
                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                "Add Budget Line")) },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Total Budget")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "text-2xl font-bold" }, formatKES(budgetAmountCents)),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-1" },
                            "FY ",
                            budget.fiscalYear))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Spent")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "text-2xl font-bold text-blue-600" }, formatKES(budgetSpentCents)),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-1" },
                            overallPct,
                            "% utilised"))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Remaining")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "text-2xl font-bold " + (budgetRemainingCents < budgetAmountCents * 0.1 ? "text-red-600" : "text-green-600") }, formatKES(budgetRemainingCents)),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-1" },
                            100 - overallPct,
                            "% available"))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Overall Progress")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "flex items-center gap-3 mt-1" },
                            react_1["default"].createElement("div", { className: "flex-1" },
                                react_1["default"].createElement("div", { className: "w-full bg-gray-200 rounded-full h-2" },
                                    react_1["default"].createElement("div", { className: "h-2 rounded-full transition-all " + getProgressColor(overallPct), style: { width: Math.min(overallPct, 100) + "%" } }))),
                            react_1["default"].createElement("span", { className: "text-sm font-semibold" },
                                overallPct,
                                "%"))))),
            linesArray.length > 0 && (react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Lines Allocated")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "text-xl font-bold" }, formatKES(totalAllocated)),
                        react_1["default"].createElement("p", { className: "text-xs text-gray-500 mt-1" },
                            linesArray.length,
                            " line(s)"))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Lines Spent")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "text-xl font-bold text-blue-600" }, formatKES(totalSpent)))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Lines Remaining")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "text-xl font-bold text-green-600" }, formatKES(totalRemaining)))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null,
                        "Budget Lines (",
                        linesArray.length,
                        ")")),
                react_1["default"].createElement(card_1.CardContent, null, linesLoading ? (react_1["default"].createElement("div", { className: "text-center py-8 text-gray-500" }, "Loading budget lines\u2026")) : linesArray.length === 0 ? (react_1["default"].createElement("div", { className: "text-center py-12 text-gray-500" },
                    react_1["default"].createElement(lucide_react_1.PiggyBank, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
                    react_1["default"].createElement("p", null, "No budget lines yet."),
                    react_1["default"].createElement("p", { className: "text-sm" }, "Click \"Add Budget Line\" to create CAPEX, OPEX, and other lines."))) : (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, null, "Category"),
                                react_1["default"].createElement(table_1.TableHead, null, "Description"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Allocated"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Spent"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Remaining"),
                                react_1["default"].createElement(table_1.TableHead, null, "Utilization"),
                                react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        react_1["default"].createElement(table_1.TableBody, null, linesArray.map(function (line) {
                            var _a;
                            var allocated = line.allocatedAmount || 0;
                            var spent = line.spentAmount || 0;
                            var remaining = line.remainingAmount || 0;
                            var pct = allocated === 0 ? 0 : Math.round((spent / allocated) * 100);
                            return (react_1["default"].createElement(table_1.TableRow, { key: line.id },
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("span", { className: "inline-block px-2 py-0.5 rounded text-xs font-semibold " + ((_a = CATEGORY_COLORS[line.category]) !== null && _a !== void 0 ? _a : "bg-gray-100 text-gray-800") }, line.category)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-gray-600 text-sm" }, line.lineDescription || "—"),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right font-medium" }, formatKES(allocated)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right text-blue-600" }, formatKES(spent)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                    react_1["default"].createElement("span", { className: remaining < allocated * 0.1 ? "text-red-600 font-semibold" : "text-green-600" }, formatKES(remaining))),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                        react_1["default"].createElement("div", { className: "w-20 bg-gray-200 rounded-full h-1.5" },
                                            react_1["default"].createElement("div", { className: "h-1.5 rounded-full " + getProgressColor(pct), style: { width: Math.min(pct, 100) + "%" } })),
                                        react_1["default"].createElement("span", { className: "text-xs font-medium" },
                                            pct,
                                            "%"))),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement(badge_1.Badge, { variant: line.status === "active"
                                            ? "default"
                                            : line.status === "frozen"
                                                ? "secondary"
                                                : "destructive" }, line.status)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                    react_1["default"].createElement("div", { className: "flex justify-end gap-2" },
                                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return openEditDialog(line); } },
                                            react_1["default"].createElement(lucide_react_1.Edit2, { className: "w-3.5 h-3.5" })),
                                        react_1["default"].createElement(button_1.Button, { variant: "destructive", size: "sm", disabled: deleteLineMutation.isPending, onClick: function () {
                                                if (window.confirm("Delete this budget line?")) {
                                                    deleteLineMutation.mutate(line.id);
                                                }
                                            } },
                                            react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-3.5 h-3.5" }))))));
                        })))))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: dialogOpen, onOpenChange: function (open) { setDialogOpen(open); if (!open) {
                setEditingLineId(null);
                setForm(emptyForm);
            } } },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-md" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, editingLineId ? "Edit Budget Line" : "Add Budget Line")),
                react_1["default"].createElement("div", { className: "space-y-4 py-2" },
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, null, "Category"),
                        react_1["default"].createElement(select_1.Select, { value: form.category, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { category: v })); }); } },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select category" })),
                            react_1["default"].createElement(select_1.SelectContent, null, CATEGORIES.map(function (c) { return (react_1["default"].createElement(select_1.SelectItem, { key: c, value: c }, c)); })))),
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, null, "Description (optional)"),
                        react_1["default"].createElement(input_1.Input, { placeholder: "e.g. Server hardware purchases", value: form.lineDescription, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { lineDescription: e.target.value })); }); } })),
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, null, "Allocated Amount (KES)"),
                        react_1["default"].createElement(input_1.Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: form.allocatedAmount, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { allocatedAmount: e.target.value })); }); } }))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () {
                            setDialogOpen(false);
                            setEditingLineId(null);
                            setForm(emptyForm);
                        } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleSave, disabled: createLineMutation.isPending || updateLineMutation.isPending }, editingLineId ? "Save Changes" : "Add Line"))))));
}
exports["default"] = BudgetDetail;
