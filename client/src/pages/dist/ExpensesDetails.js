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
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var useUserLookup_1 = require("@/hooks/useUserLookup");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var sonner_1 = require("sonner");
var currency_1 = require("@/lib/currency");
function ExpensesDetails() {
    var _this = this;
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var formatMoney = currency_1.useCurrency().format;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(false), showDeleteModal = _b[0], setShowDeleteModal = _b[1];
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    var _d = react_1.useState(false), showBudgetDialog = _d[0], setShowBudgetDialog = _d[1];
    var _e = react_1.useState(""), selectedBudgetId = _e[0], setSelectedBudgetId = _e[1];
    var _f = react_1.useState(false), isUploading = _f[0], setIsUploading = _f[1];
    var fileInputRef = react_1.useRef(null);
    // Fetch expense from backend
    var _g = trpc_1.trpc.expenses.getById.useQuery(id || ""), expenseData = _g.data, isLoading = _g.isLoading;
    // Fetch available budget allocations
    var _h = trpc_1.trpc.expenses.getAvailableBudgetAllocations.useQuery().data, budgetAllocations = _h === void 0 ? [] : _h;
    var utils = trpc_1.trpc.useUtils();
    var deleteExpenseMutation = trpc_1.trpc.expenses["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense deleted successfully");
            utils.expenses.list.invalidate();
            setLocation("/expenses");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete expense");
        }
    });
    var updateBudgetMutation = trpc_1.trpc.expenses.updateBudgetAllocation.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Budget allocation updated successfully");
            utils.expenses.getById.invalidate(id);
            setShowBudgetDialog(false);
            setSelectedBudgetId("");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update budget allocation");
        }
    });
    var updateExpenseMutation = trpc_1.trpc.expenses.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Receipt uploaded successfully");
            utils.expenses.getById.invalidate(id);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to upload receipt");
        }
    });
    // Extract line items from expense data
    var lineItems = expenseData ? (expenseData.items || []) : [];
    var expense = expenseData ? {
        id: expenseData.id || id,
        description: expenseData.description || "Unknown Expense",
        category: expenseData.category || "General",
        amount: expenseData.amount || 0,
        date: expenseData.expenseDate ? new Date(expenseData.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        vendor: expenseData.vendor || "Unknown",
        paymentMethod: expenseData.paymentMethod || "cash",
        status: expenseData.status || "pending",
        approvedBy: expenseData.approvedBy || "",
        budgetAllocationId: expenseData.budgetAllocationId || null,
        receiptUrl: expenseData.receiptUrl || null,
        notes: expenseData.notes || ""
    } : null;
    var currentBudgetAllocation = budgetAllocations.find(function (b) { return b.id === (expense === null || expense === void 0 ? void 0 : expense.budgetAllocationId); });
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteExpenseMutation, id || "")];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdateBudget = function () {
        if (!id)
            return;
        updateBudgetMutation.mutate({
            expenseId: id,
            budgetAllocationId: selectedBudgetId === "none" ? null : selectedBudgetId || null
        });
    };
    var handleReceiptUpload = function (e) {
        var _a;
        var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file || !id)
            return;
        var maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            sonner_1.toast.error("File size must be less than 5MB");
            return;
        }
        setIsUploading(true);
        var reader = new FileReader();
        reader.onload = function () {
            var dataUrl = reader.result;
            updateExpenseMutation.mutate({ id: id, receiptUrl: dataUrl }, { onSettled: function () { return setIsUploading(false); } });
        };
        reader.onerror = function () {
            sonner_1.toast.error("Failed to read file");
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
        // Reset input so the same file can be re-selected
        e.target.value = "";
    };
    var statusColor = {
        approved: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        rejected: "bg-red-100 text-red-800"
    };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Expense Details", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Finance", href: "/accounting" },
                { label: "Expenses", href: "/expenses" },
                { label: "Details" },
            ], backLink: { label: "Expenses", href: "/expenses" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading expense..."))));
    }
    if (!expense) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Expense Details", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Finance", href: "/accounting" },
                { label: "Expenses", href: "/expenses" },
                { label: "Details" },
            ], backLink: { label: "Expenses", href: "/expenses" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Expense not found"),
                React.createElement(button_1.Button, { onClick: function () { return setLocation("/expenses"); } }, "Back to Expenses"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Expense Details", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Finance", href: "/accounting" },
            { label: "Expenses", href: "/expenses" },
            { label: "Details" },
        ], backLink: { label: "Expenses", href: "/expenses" } },
        React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "flex flex-col lg:flex-row gap-6" },
                React.createElement("div", { className: "w-full lg:w-80 shrink-0 space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "p-5 space-y-4" },
                            React.createElement("div", { className: "flex flex-col items-center text-center space-y-2" },
                                React.createElement("div", { className: "h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center" },
                                    React.createElement(lucide_react_1.Tag, { className: "h-6 w-6 text-primary" })),
                                React.createElement("h2", { className: "text-lg font-bold" }, expense.category),
                                React.createElement(badge_1.Badge, { className: statusColor[expense.status] || "bg-gray-100 text-gray-800" }, expense.status.toUpperCase())),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-3 text-sm" },
                                React.createElement("div", { className: "flex items-start gap-2" },
                                    React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Date"),
                                        React.createElement("p", { className: "font-medium" }, expense.date || "—"))),
                                React.createElement("div", { className: "flex items-start gap-2" },
                                    React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Amount"),
                                        React.createElement("p", { className: "font-medium" }, formatMoney(expense.amount)))),
                                React.createElement("div", { className: "flex items-start gap-2" },
                                    React.createElement(lucide_react_1.Store, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Vendor / Payee"),
                                        React.createElement("p", { className: "font-medium" }, expense.vendor || "—"))),
                                React.createElement("div", { className: "flex items-start gap-2" },
                                    React.createElement(lucide_react_1.CreditCard, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Payment Method"),
                                        React.createElement("p", { className: "font-medium capitalize" }, expense.paymentMethod || "—")))),
                            expense.approvedBy && (React.createElement(React.Fragment, null,
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "flex items-start gap-2 text-sm" },
                                    React.createElement(lucide_react_1.UserCheck, { className: "h-4 w-4 mt-0.5 text-muted-foreground shrink-0" }),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-muted-foreground text-xs" }, "Approved By"),
                                        React.createElement("p", { className: "font-medium" }, getUserName(expense.approvedBy))))))))),
                React.createElement("div", { className: "flex-1 min-w-0 space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, { className: "pb-3" },
                            React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
                                "Description & Notes")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, expense.description || "No description provided."),
                            expense.notes && (React.createElement("div", { className: "mt-3 pt-3 border-t" },
                                React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, "Additional Notes"),
                                React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, expense.notes))))),
                    lineItems.length > 0 && (React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, { className: "pb-3" },
                            React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                React.createElement(lucide_react_1.List, { className: "h-4 w-4" }),
                                "Line Items (",
                                lineItems.length,
                                ")")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, { className: "w-[40%]" }, "Description"),
                                        React.createElement(table_1.TableHead, { className: "text-right" }, "Qty"),
                                        React.createElement(table_1.TableHead, { className: "text-right" }, "Rate"),
                                        React.createElement(table_1.TableHead, { className: "text-right" }, "Tax"),
                                        React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"))),
                                React.createElement(table_1.TableBody, null, lineItems.map(function (item, idx) {
                                    var _a;
                                    return (React.createElement(table_1.TableRow, { key: item.id || idx },
                                        React.createElement(table_1.TableCell, { className: "text-sm" }, item.description || "—"),
                                        React.createElement(table_1.TableCell, { className: "text-sm text-right" }, (_a = item.quantity) !== null && _a !== void 0 ? _a : 0),
                                        React.createElement(table_1.TableCell, { className: "text-sm text-right" }, formatMoney(item.rate || 0)),
                                        React.createElement(table_1.TableCell, { className: "text-sm text-right" }, formatMoney(item.taxAmount || 0)),
                                        React.createElement(table_1.TableCell, { className: "text-sm text-right font-medium" }, formatMoney(item.amount || 0))));
                                }))),
                            React.createElement(separator_1.Separator, { className: "my-3" }),
                            React.createElement("div", { className: "flex justify-end gap-6 text-sm" },
                                React.createElement("div", { className: "text-muted-foreground" },
                                    "Subtotal: ",
                                    React.createElement("span", { className: "font-medium text-foreground" }, formatMoney(lineItems.reduce(function (sum, i) { return sum + ((i.amount || 0) - (i.taxAmount || 0)); }, 0)))),
                                React.createElement("div", { className: "text-muted-foreground" },
                                    "Tax: ",
                                    React.createElement("span", { className: "font-medium text-foreground" }, formatMoney(lineItems.reduce(function (sum, i) { return sum + (i.taxAmount || 0); }, 0)))),
                                React.createElement("div", { className: "font-medium" },
                                    "Total: ",
                                    formatMoney(lineItems.reduce(function (sum, i) { return sum + (i.amount || 0); }, 0))))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, { className: "pb-3" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.PieChart, { className: "h-4 w-4" }),
                                    "Budget Allocation"),
                                React.createElement(dialog_1.Dialog, { open: showBudgetDialog, onOpenChange: setShowBudgetDialog },
                                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline", size: "sm" }, currentBudgetAllocation ? "Change" : "Assign")),
                                    React.createElement(dialog_1.DialogContent, null,
                                        React.createElement(dialog_1.DialogHeader, null,
                                            React.createElement(dialog_1.DialogTitle, null, "Update Budget Allocation"),
                                            React.createElement(dialog_1.DialogDescription, null, "Select a budget allocation to link this expense to, or leave empty to remove.")),
                                        React.createElement("div", { className: "space-y-4" },
                                            React.createElement(select_1.Select, { value: selectedBudgetId, onValueChange: setSelectedBudgetId },
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, { placeholder: "Select a budget allocation..." })),
                                                React.createElement(select_1.SelectContent, null,
                                                    React.createElement(select_1.SelectItem, { value: "none" }, "None (Remove allocation)"),
                                                    budgetAllocations.map(function (allocation) { return (React.createElement(select_1.SelectItem, { key: allocation.id, value: allocation.id },
                                                        allocation.categoryName,
                                                        " (",
                                                        formatMoney(allocation.allocatedAmount - (allocation.spentAmount || 0)),
                                                        " remaining)")); }))),
                                            React.createElement(button_1.Button, { onClick: handleUpdateBudget, disabled: updateBudgetMutation.isPending }, updateBudgetMutation.isPending ? "Updating..." : "Update Allocation")))))),
                        React.createElement(card_1.CardContent, null, currentBudgetAllocation ? (React.createElement("div", { className: "space-y-2" },
                            React.createElement("p", { className: "font-medium text-sm" }, currentBudgetAllocation.categoryName),
                            React.createElement("div", { className: "flex items-center gap-2 text-xs text-muted-foreground" },
                                React.createElement("span", null,
                                    "Spent: ",
                                    formatMoney(currentBudgetAllocation.spentAmount || 0)),
                                React.createElement("span", null, "/"),
                                React.createElement("span", null,
                                    "Budget: ",
                                    formatMoney(currentBudgetAllocation.allocatedAmount))),
                            React.createElement("div", { className: "w-full bg-muted rounded-full h-2" },
                                React.createElement("div", { className: "bg-primary rounded-full h-2 transition-all", style: {
                                        width: Math.min(((currentBudgetAllocation.spentAmount || 0) / currentBudgetAllocation.allocatedAmount) * 100, 100) + "%"
                                    } })))) : (React.createElement("p", { className: "text-sm text-muted-foreground" }, "No budget allocation assigned.")))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, { className: "pb-3" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Paperclip, { className: "h-4 w-4" }),
                                    "Receipt / Attachment"),
                                React.createElement("div", null,
                                    React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*,.pdf", className: "hidden", onChange: handleReceiptUpload }),
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: isUploading, onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); } },
                                        React.createElement(lucide_react_1.Upload, { className: "h-3.5 w-3.5 mr-1.5" }),
                                        isUploading ? "Uploading..." : expense.receiptUrl ? "Replace" : "Upload")))),
                        React.createElement(card_1.CardContent, null, expense.receiptUrl ? (React.createElement("div", { className: "border rounded-md p-3 space-y-2" }, expense.receiptUrl.startsWith("data:image/") ? (React.createElement("img", { src: expense.receiptUrl, alt: "Receipt", className: "max-h-64 rounded-md object-contain" })) : (React.createElement("a", { href: expense.receiptUrl, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary hover:underline" }, "View Receipt")))) : (React.createElement("p", { className: "text-sm text-muted-foreground" }, "No receipt attached.")))))),
            React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, title: "Delete Expense", description: "Are you sure you want to delete this expense? This action cannot be undone.", onConfirm: handleDelete, onCancel: function () { return setShowDeleteModal(false); }, isLoading: isDeleting }))));
}
exports["default"] = ExpensesDetails;
