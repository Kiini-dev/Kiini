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
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var useUserLookup_1 = require("@/hooks/useUserLookup");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgExpenseDetail() {
    var _this = this;
    var _a, _b, _c;
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var expenseId = params.id;
    var _d = wouter_1.useLocation(), setLocation = _d[1];
    var _e = react_1.useState(false), showDeleteModal = _e[0], setShowDeleteModal = _e[1];
    var _f = react_1.useState(false), isDeleting = _f[0], setIsDeleting = _f[1];
    var _g = react_1.useState(false), showBudgetDialog = _g[0], setShowBudgetDialog = _g[1];
    var _h = react_1.useState(""), selectedBudgetId = _h[0], setSelectedBudgetId = _h[1];
    var _j = react_1.useState(false), isUploading = _j[0], setIsUploading = _j[1];
    var fileInputRef = react_1.useRef(null);
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canEdit = hasPermission("expenses");
    var canDelete = hasPermission("expenses");
    // Fetch expense from backend
    var _k = trpc_1.trpc.expenses.getById.useQuery(expenseId), expenseData = _k.data, isLoading = _k.isLoading;
    // Fetch available budget allocations
    var _l = trpc_1.trpc.expenses.getAvailableBudgetAllocations.useQuery(undefined).data, budgetAllocations = _l === void 0 ? [] : _l;
    var utils = trpc_1.trpc.useUtils();
    var deleteExpenseMutation = trpc_1.trpc.expenses["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense deleted successfully");
            utils.expenses.list.invalidate();
            setLocation("/org/" + slug + "/expenses");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete expense");
        }
    });
    var updateBudgetMutation = trpc_1.trpc.expenses.updateBudgetAllocation.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Budget allocation updated successfully");
            utils.expenses.getById.invalidate(expenseId);
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
            utils.expenses.getById.invalidate(expenseId);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to upload receipt");
        }
    });
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!canDelete) {
                        sonner_1.toast.error("You don't have permission to delete expenses");
                        return [2 /*return*/];
                    }
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deleteExpenseMutation.mutateAsync({ id: expenseId }))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleBudgetUpdate = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedBudgetId)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](updateBudgetMutation.mutateAsync({
                            expenseId: expenseId,
                            budgetAllocationId: selectedBudgetId
                        }))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleFileUpload = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var file, formData, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
                    if (!file)
                        return [2 /*return*/];
                    setIsUploading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    formData = new FormData();
                    formData.append('receipt', file);
                    return [4 /*yield*/, mutationHelpers_1["default"](updateExpenseMutation.mutateAsync({
                            id: expenseId,
                            receiptUrl: 'uploaded'
                        }))];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsUploading(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var expense = expenseData;
    if (isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], null,
            react_1["default"].createElement(OrgBreadcrumb_1["default"], { items: [
                    { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                    { label: "Expenses", href: "/org/" + slug + "/expenses" },
                    { label: "Loading..." },
                ] }),
            react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement("div", { className: "h-8 bg-white/5 rounded animate-pulse" }),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                    react_1["default"].createElement("div", { className: "h-64 bg-white/5 rounded animate-pulse" }),
                    react_1["default"].createElement("div", { className: "h-64 bg-white/5 rounded animate-pulse" })))));
    }
    if (!expense) {
        return (react_1["default"].createElement(OrgLayout_1["default"], null,
            react_1["default"].createElement(OrgBreadcrumb_1["default"], { items: [
                    { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                    { label: "Expenses", href: "/org/" + slug + "/expenses" },
                    { label: "Not Found" },
                ] }),
            react_1["default"].createElement("div", { className: "text-center py-12" },
                react_1["default"].createElement("h2", { className: "text-2xl font-bold text-white mb-2" }, "Expense Not Found"),
                react_1["default"].createElement("p", { className: "text-white/60 mb-6" }, "The expense you're looking for doesn't exist."),
                react_1["default"].createElement(button_1.Button, { onClick: function () { return setLocation("/org/" + slug + "/expenses"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                    "Back to Expenses"))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], null,
        react_1["default"].createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Expenses", href: "/org/" + slug + "/expenses" },
                { label: expense.expenseNumber || "Expense #" + ((_a = expense.id) === null || _a === void 0 ? void 0 : _a.slice(-8)) },
            ] }),
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex items-center gap-4" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/org/" + slug + "/expenses"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Back"),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h1", { className: "text-2xl font-bold text-white" }, expense.expenseNumber || "Expense #" + ((_b = expense.id) === null || _b === void 0 ? void 0 : _b.slice(-8))),
                        react_1["default"].createElement("p", { className: "text-white/60" }, expense.description || "No description"))),
                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                    canEdit && (react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setLocation("/org/" + slug + "/expenses/" + expenseId + "/edit"); } },
                        react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4 mr-2" }),
                        "Edit")),
                    canDelete && (react_1["default"].createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return setShowDeleteModal(true); } },
                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                        "Delete")))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-4" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                            react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-8 w-8 text-green-400" }),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Amount"),
                                react_1["default"].createElement("p", { className: "text-2xl font-bold text-white" },
                                    "KES ",
                                    ((_c = expense.amount) === null || _c === void 0 ? void 0 : _c.toLocaleString()) || "0"))))),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-4" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                            react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-8 w-8 text-blue-400" }),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Date"),
                                react_1["default"].createElement("p", { className: "text-lg font-semibold text-white" }, expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : "N/A"))))),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-4" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                            react_1["default"].createElement(lucide_react_1.UserCheck, { className: "h-8 w-8 text-purple-400" }),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Status"),
                                react_1["default"].createElement(badge_1.Badge, { variant: expense.approvedAt ? "default" : "secondary" }, expense.approvedAt ? "Approved" : "Pending")))))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                react_1["default"].createElement("div", { className: "lg:col-span-2 space-y-6" },
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }),
                                "Expense Details")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "text-sm text-white/60" }, "Category"),
                                    react_1["default"].createElement("p", { className: "text-white font-medium" }, expense.category || "N/A")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "text-sm text-white/60" }, "Vendor"),
                                    react_1["default"].createElement("p", { className: "text-white font-medium" }, expense.vendor || "N/A")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "text-sm text-white/60" }, "Payment Method"),
                                    react_1["default"].createElement("p", { className: "text-white font-medium" }, expense.paymentMethod || "N/A")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("label", { className: "text-sm text-white/60" }, "Reference"),
                                    react_1["default"].createElement("p", { className: "text-white font-medium" }, expense.reference || "N/A"))),
                            expense.description && (react_1["default"].createElement("div", null,
                                react_1["default"].createElement("label", { className: "text-sm text-white/60" }, "Description"),
                                react_1["default"].createElement("p", { className: "text-white mt-1" }, expense.description))),
                            expense.receiptUrl && (react_1["default"].createElement("div", null,
                                react_1["default"].createElement("label", { className: "text-sm text-white/60" }, "Receipt"),
                                react_1["default"].createElement("div", { className: "mt-2" },
                                    react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", asChild: true },
                                        react_1["default"].createElement("a", { href: expense.receiptUrl, target: "_blank", rel: "noopener noreferrer" },
                                            react_1["default"].createElement(lucide_react_1.Paperclip, { className: "h-4 w-4 mr-2" }),
                                            "View Receipt"))))))),
                    expense.budgetAllocationId && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.PieChart, { className: "h-5 w-5" }),
                                "Budget Allocation")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("p", { className: "text-white/60" }, "Budget allocation details will be displayed here."))))),
                react_1["default"].createElement("div", { className: "space-y-6" },
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white" }, "Actions")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                            !expense.receiptUrl && canEdit && (react_1["default"].createElement("div", null,
                                react_1["default"].createElement("input", { ref: fileInputRef, type: "file", accept: "image/*,.pdf", onChange: handleFileUpload, className: "hidden", "aria-label": "Upload receipt file" }),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", className: "w-full", onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, disabled: isUploading },
                                    react_1["default"].createElement(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }),
                                    isUploading ? "Uploading..." : "Upload Receipt"))),
                            canEdit && (react_1["default"].createElement(dialog_1.Dialog, { open: showBudgetDialog, onOpenChange: setShowBudgetDialog },
                                react_1["default"].createElement(dialog_1.DialogTrigger, { asChild: true },
                                    react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", className: "w-full" },
                                        react_1["default"].createElement(lucide_react_1.List, { className: "h-4 w-4 mr-2" }),
                                        "Update Budget")),
                                react_1["default"].createElement(dialog_1.DialogContent, null,
                                    react_1["default"].createElement(dialog_1.DialogHeader, null,
                                        react_1["default"].createElement(dialog_1.DialogTitle, null, "Update Budget Allocation"),
                                        react_1["default"].createElement(dialog_1.DialogDescription, null, "Select a budget allocation for this expense.")),
                                    react_1["default"].createElement("div", { className: "space-y-4" },
                                        react_1["default"].createElement(select_1.Select, { value: selectedBudgetId, onValueChange: setSelectedBudgetId },
                                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select budget allocation" })),
                                            react_1["default"].createElement(select_1.SelectContent, null, budgetAllocations.map(function (budget) { return (react_1["default"].createElement(select_1.SelectItem, { key: budget.id, value: budget.id }, budget.name)); }))),
                                        react_1["default"].createElement("div", { className: "flex justify-end gap-2" },
                                            react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowBudgetDialog(false); } }, "Cancel"),
                                            react_1["default"].createElement(button_1.Button, { onClick: handleBudgetUpdate, disabled: !selectedBudgetId || updateBudgetMutation.isLoading }, "Update")))))))),
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white" }, "Metadata")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Created"),
                                react_1["default"].createElement("p", { className: "text-white text-sm" }, expense.createdAt ? new Date(expense.createdAt).toLocaleString() : "N/A")),
                            expense.approvedAt && (react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Approved"),
                                react_1["default"].createElement("p", { className: "text-white text-sm" }, new Date(expense.approvedAt).toLocaleString()))),
                            expense.approvedBy && (react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Approved By"),
                                react_1["default"].createElement("p", { className: "text-white text-sm" }, getUserName(expense.approvedBy))))))))),
        react_1["default"].createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, onClose: function () { return setShowDeleteModal(false); }, onConfirm: handleDelete, title: "Delete Expense", description: "Are you sure you want to delete this expense? This action cannot be undone.", isLoading: isDeleting })));
}
exports["default"] = OrgExpenseDetail;
