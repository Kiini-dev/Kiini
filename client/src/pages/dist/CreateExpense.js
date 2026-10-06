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
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var collapsible_1 = require("@/components/ui/collapsible");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var const_1 = require("@/const");
var paymentMethods_1 = require("@/const/paymentMethods");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var useCompanyInfo_1 = require("@/hooks/useCompanyInfo");
var switch_1 = require("@/components/ui/switch");
function createEmptyItem() {
    return { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, taxRate: 0, amount: 0, taxAmount: 0 };
}
function CreateExpense() {
    var _this = this;
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = permissions_1.useRequireFeature("accounting:expenses:create"), allowed = _a.allowed, isLoading = _a.isLoading;
    var companyInfo = useCompanyInfo_1.useCompanyInfo();
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var _c = react_1.useState(false), isGeneratingPDF = _c[0], setIsGeneratingPDF = _c[1];
    var _d = react_1.useState({
        expenseNumber: "",
        category: "",
        vendor: "",
        amount: "",
        expenseDate: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        description: "",
        status: "pending",
        chartOfAccountId: "",
        budgetAllocationId: ""
    }), formData = _d[0], setFormData = _d[1];
    var _e = react_1.useState(true), isLoadingNumber = _e[0], setIsLoadingNumber = _e[1];
    var _f = react_1.useState(null), selectedBudgetAllocation = _f[0], setSelectedBudgetAllocation = _f[1];
    var _g = react_1.useState([createEmptyItem()]), lineItemsData = _g[0], setLineItemsData = _g[1];
    var _h = react_1.useState(false), useLineItems = _h[0], setUseLineItems = _h[1];
    var _j = react_1.useState(false), showAdditionalInfo = _j[0], setShowAdditionalInfo = _j[1];
    var getNextNumberMutation = trpc_1.trpc.settings.getNextDocumentNumber.useMutation();
    // Recurring expense state
    var _k = react_1.useState(false), isRecurring = _k[0], setIsRecurring = _k[1];
    var _l = react_1.useState("monthly"), recurringFrequency = _l[0], setRecurringFrequency = _l[1];
    var _m = react_1.useState(new Date().toISOString().split("T")[0]), recurringStartDate = _m[0], setRecurringStartDate = _m[1];
    var _o = react_1.useState(""), recurringEndDate = _o[0], setRecurringEndDate = _o[1];
    var _p = react_1.useState(true), recurringNoEnd = _p[0], setRecurringNoEnd = _p[1];
    var _q = react_1.useState(1), recurringDayOfMonth = _q[0], setRecurringDayOfMonth = _q[1];
    var _r = react_1.useState(3), recurringReminderDays = _r[0], setRecurringReminderDays = _r[1];
    // Generate expense number on component mount
    react_1.useEffect(function () {
        var isMounted = true;
        var generateNumber = function () {
            setIsLoadingNumber(true);
            getNextNumberMutation.mutate({ documentType: 'expense' }, {
                onSuccess: function (result) {
                    if (isMounted)
                        setFormData(function (prev) { return (__assign(__assign({}, prev), { expenseNumber: result.documentNumber || "EXP-" + String(Math.random() * 1000000 | 0).padStart(6, '0') })); });
                },
                onError: function () {
                    if (isMounted)
                        setFormData(function (prev) { return (__assign(__assign({}, prev), { expenseNumber: "EXP-" + String(Math.random() * 1000000 | 0).padStart(6, '0') })); });
                },
                onSettled: function () {
                    if (isMounted)
                        setIsLoadingNumber(false);
                }
            });
        };
        generateNumber();
        return function () { isMounted = false; };
    }, []);
    // Fetch Chart of Accounts
    var _s = trpc_1.trpc.chartOfAccounts.list.useQuery({}).data, chartOfAccounts = _s === void 0 ? [] : _s;
    // Fetch available budget allocations
    var _t = trpc_1.trpc.expenses.getAvailableBudgetAllocations.useQuery({}).data, budgetAllocations = _t === void 0 ? [] : _t;
    // Handle budget allocation selection
    var handleBudgetAllocationChange = function (budgetId) {
        var actualId = budgetId === "__none__" ? "" : budgetId;
        setFormData(__assign(__assign({}, formData), { budgetAllocationId: actualId }));
        var selected = budgetAllocations.find(function (b) { return b.id === actualId; });
        setSelectedBudgetAllocation(selected);
    };
    var createRecurringExpenseMutation = trpc_1.trpc.expenses.createRecurringExpense.useMutation({
        onSuccess: function () { return sonner_1.toast.success("Recurring expense schedule created!"); },
        onError: function (e) { return sonner_1.toast.error("Failed to create recurring schedule: " + e.message); }
    });
    var createExpenseMutation = trpc_1.trpc.expenses.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense created successfully!");
            utils.expenses.list.invalidate();
            // Also create recurring schedule if toggled
            if (isRecurring) {
                createRecurringExpenseMutation.mutate({
                    category: formData.category,
                    vendor: formData.vendor || undefined,
                    amount: Math.round(parseFloat(formData.amount || "0") * 100),
                    description: formData.description || undefined,
                    paymentMethod: formData.paymentMethod || undefined,
                    frequency: recurringFrequency,
                    startDate: recurringStartDate,
                    endDate: recurringNoEnd ? undefined : recurringEndDate || undefined,
                    dayOfMonth: recurringDayOfMonth,
                    reminderDaysBefore: recurringReminderDays,
                    chartOfAccountId: formData.chartOfAccountId ? parseInt(formData.chartOfAccountId) : undefined
                });
            }
            navigate("/expenses");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create expense: " + error.message);
        }
    });
    var handleDownloadPDF = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var printWindow, htmlContent;
        return __generator(this, function (_a) {
            setIsGeneratingPDF(true);
            try {
                printWindow = window.open('', '_blank');
                if (!printWindow) {
                    sonner_1.toast.error("Please allow popups to download PDF");
                    setIsGeneratingPDF(false);
                    return [2 /*return*/];
                }
                htmlContent = "\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <title>Expense Report - " + formData.category + "</title>\n          <style>\n            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }\n            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }\n            .company-info { text-align: right; font-size: 12px; }\n            .document-title { font-size: 28px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }\n            .info-section { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }\n            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }\n            .info-row:last-child { border-bottom: none; }\n            .label { font-weight: bold; color: #6b7280; }\n            .value { }\n            .amount { font-size: 24px; font-weight: bold; color: #dc2626; text-align: center; padding: 20px; background: #fef2f2; border-radius: 8px; margin: 20px 0; }\n            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }\n            .status-pending { background: #fef3c7; color: #92400e; }\n            .status-approved { background: #d1fae5; color: #065f46; }\n            .status-rejected { background: #fee2e2; color: #991b1b; }\n            .status-paid { background: #dbeafe; color: #1e40af; }\n            .notes { margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; }\n            @media print { body { margin: 20px; } }\n          </style>\n        </head>\n        <body>\n          <div class=\"header\">\n            <div>\n              <div class=\"document-title\">EXPENSE REPORT</div>\n              <div><strong>Draft</strong></div>\n            </div>\n            <div class=\"company-info\">\n              <strong>" + const_1.APP_TITLE + "</strong><br>\n              " + (companyInfo.address ? companyInfo.address + '<br>' : '') + "\n              " + (companyInfo.email ? companyInfo.email + '<br>' : '') + "\n              " + (companyInfo.phone || '') + "\n            </div>\n          </div>\n          \n          <div class=\"info-section\">\n            <div class=\"info-row\">\n              <span class=\"label\">Category:</span>\n              <span class=\"value\">" + (formData.category || 'N/A') + "</span>\n            </div>\n            <div class=\"info-row\">\n              <span class=\"label\">Vendor:</span>\n              <span class=\"value\">" + (formData.vendor || 'N/A') + "</span>\n            </div>\n            <div class=\"info-row\">\n              <span class=\"label\">Expense Date:</span>\n              <span class=\"value\">" + formData.expenseDate + "</span>\n            </div>\n            <div class=\"info-row\">\n              <span class=\"label\">Payment Method:</span>\n              <span class=\"value\">" + ((formData.paymentMethod || 'cash').replace('_', ' ').toUpperCase()) + "</span>\n            </div>\n            <div class=\"info-row\">\n              <span class=\"label\">Status:</span>\n              <span class=\"value\"><span class=\"status status-" + (formData.status || 'pending') + "\">" + (formData.status || 'pending').toUpperCase() + "</span></span>\n            </div>\n          </div>\n          \n          <div class=\"amount\">\n            Amount: KES " + parseFloat(formData.amount || '0').toLocaleString() + "\n          </div>\n          \n          " + (formData.description ? "\n            <div class=\"notes\">\n              <strong>Description:</strong><br>\n              " + formData.description + "\n            </div>\n          " : '') + "\n          \n          <script>\n            window.onload = function() {\n              window.print();\n            }\n          </script>\n        </body>\n        </html>\n      ";
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                sonner_1.toast.success("PDF download initiated");
            }
            catch (error) {
                console.error("PDF generation error:", error);
                sonner_1.toast.error("Failed to generate PDF");
            }
            finally {
                setIsGeneratingPDF(false);
            }
            return [2 /*return*/];
        });
    }); }, [formData]);
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    var updateLineItem = function (id, field, value) {
        setLineItemsData(function (prev) { return prev.map(function (item) {
            var _a;
            if (item.id !== id)
                return item;
            var updated = __assign(__assign({}, item), (_a = {}, _a[field] = value, _a));
            updated.amount = updated.quantity * updated.rate;
            updated.taxAmount = Math.round(updated.amount * (updated.taxRate / 100));
            return updated;
        }); });
    };
    var addLineItem = function () { return setLineItemsData(function (prev) { return __spreadArrays(prev, [createEmptyItem()]); }); };
    var removeLineItem = function (id) { return setLineItemsData(function (prev) { return prev.length > 1 ? prev.filter(function (i) { return i.id !== id; }) : prev; }); };
    var lineItemsTotal = lineItemsData.reduce(function (sum, item) { return sum + item.amount + item.taxAmount; }, 0);
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.category || !formData.chartOfAccountId) {
            sonner_1.toast.error("Please fill in all required fields (Category and Chart of Account)");
            return;
        }
        // Use line items total if line items enabled, otherwise use manual amount
        var finalAmount = useLineItems ? lineItemsTotal : parseFloat(formData.amount);
        if (!finalAmount || finalAmount <= 0) {
            sonner_1.toast.error("Amount must be greater than 0");
            return;
        }
        if (useLineItems) {
            var emptyItems = lineItemsData.filter(function (i) { return !i.description.trim() || i.rate <= 0; });
            if (emptyItems.length > 0) {
                sonner_1.toast.error("All line items must have a description and rate");
                return;
            }
        }
        var accountId = parseInt(formData.chartOfAccountId);
        if (isNaN(accountId)) {
            sonner_1.toast.error("Invalid Chart of Account selection");
            return;
        }
        var amountInCents = useLineItems
            ? Math.round(lineItemsTotal * 100)
            : Math.round(parseFloat(formData.amount) * 100);
        createExpenseMutation.mutate({
            expenseNumber: formData.expenseNumber,
            category: formData.category,
            vendor: formData.vendor || undefined,
            amount: amountInCents,
            expenseDate: new Date(formData.expenseDate).toISOString().split("T")[0],
            paymentMethod: formData.paymentMethod,
            description: formData.description || undefined,
            status: formData.status,
            chartOfAccountId: accountId,
            budgetAllocationId: formData.budgetAllocationId || undefined,
            items: useLineItems ? lineItemsData.map(function (item) { return ({
                description: item.description,
                quantity: item.quantity,
                rate: Math.round(item.rate * 100),
                amount: Math.round(item.amount * 100),
                taxRate: item.taxRate,
                taxAmount: Math.round(item.taxAmount * 100)
            }); }) : undefined
        });
    };
    var handleSaveDraft = function () {
        var draftData = __assign(__assign({}, formData), { savedAt: new Date().toISOString() });
        localStorage.setItem('expense_draft', JSON.stringify(draftData));
        sonner_1.toast.success("Expense draft saved locally");
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Record Expense", description: "Add a new expense to your records", icon: react_1["default"].createElement(lucide_react_1.Receipt, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Expenses", href: "/expenses" },
            { label: "Record Expense" },
        ] },
        react_1["default"].createElement("div", { className: useLineItems ? "max-w-5xl" : "max-w-2xl" },
            react_1["default"].createElement(card_1.Card, { className: "p-6" },
                react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Number"),
                        react_1["default"].createElement(input_1.Input, { value: formData.expenseNumber, readOnly: true, className: "bg-muted cursor-not-allowed font-mono max-w-xs", placeholder: isLoadingNumber ? "Generating..." : "" })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Category *"),
                        react_1["default"].createElement(select_1.Select, { value: formData.category, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { category: value })); } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "max-w-xs" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select category" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "Office Supplies" }, "Office Supplies"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "Travel" }, "Travel"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "Utilities" }, "Utilities"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "Rent" }, "Rent"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "Software" }, "Software"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "Marketing" }, "Marketing"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "Equipment" }, "Equipment"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "Meals & Entertainment" }, "Meals & Entertainment"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "Professional Services" }, "Professional Services"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "Other" }, "Other")))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Vendor"),
                        react_1["default"].createElement(input_1.Input, { placeholder: "e.g., ABC Supplies Ltd", value: formData.vendor, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { vendor: e.target.value })); }, className: "max-w-xs" })),
                    !useLineItems && (react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Amount (Ksh) *"),
                        react_1["default"].createElement(input_1.Input, { type: "number", placeholder: "0.00", value: formData.amount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { amount: e.target.value })); }, step: "0.01", min: "0", className: "max-w-xs" }))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Date *"),
                        react_1["default"].createElement(input_1.Input, { type: "date", value: formData.expenseDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { expenseDate: e.target.value })); }, className: "max-w-xs" })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Method *"),
                        react_1["default"].createElement(select_1.Select, { value: formData.paymentMethod, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { paymentMethod: value })); } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "max-w-xs" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select method" })),
                            react_1["default"].createElement(select_1.SelectContent, null, paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (react_1["default"].createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); })))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Status *"),
                        react_1["default"].createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { status: value })); } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "max-w-xs" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select status" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "paid" }, "Paid")))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Account *"),
                        react_1["default"].createElement(select_1.Select, { value: formData.chartOfAccountId, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { chartOfAccountId: value })); } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "max-w-xs" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select account" })),
                            react_1["default"].createElement(select_1.SelectContent, null, chartOfAccounts.map(function (account) { return (react_1["default"].createElement(select_1.SelectItem, { key: account.id, value: account.id.toString() },
                                account.accountCode,
                                " - ",
                                account.accountName)); })))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "budgetAllocationId" }, "Budget Allocation (Optional)"),
                        react_1["default"].createElement(select_1.Select, { value: formData.budgetAllocationId, onValueChange: handleBudgetAllocationChange },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select budget allocation" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "__none__" }, "None"),
                                budgetAllocations.map(function (allocation) { return (react_1["default"].createElement(select_1.SelectItem, { key: allocation.id, value: allocation.id },
                                    allocation.categoryName,
                                    " - Ksh ",
                                    (allocation.remaining / 100).toLocaleString('en-KE'),
                                    " remaining")); }))),
                        selectedBudgetAllocation && (react_1["default"].createElement("div", { className: "mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200" },
                            react_1["default"].createElement("p", { className: "text-sm font-medium text-blue-900 dark:text-blue-200" }, selectedBudgetAllocation.categoryName),
                            react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-2 mt-2 text-xs" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-blue-700 dark:text-blue-300" }, "Allocated:"),
                                    react_1["default"].createElement("p", { className: "font-mono font-bold" },
                                        "Ksh ",
                                        (selectedBudgetAllocation.allocatedAmount / 100).toLocaleString('en-KE'))),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-blue-700 dark:text-blue-300" }, "Spent:"),
                                    react_1["default"].createElement("p", { className: "font-mono font-bold" },
                                        "Ksh ",
                                        (selectedBudgetAllocation.spentAmount / 100).toLocaleString('en-KE'))),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-blue-700 dark:text-blue-300" }, "Remaining:"),
                                    react_1["default"].createElement("p", { className: "font-mono font-bold " + (selectedBudgetAllocation.remaining < 0 ? 'text-red-600' : 'text-green-600') },
                                        "Ksh ",
                                        (selectedBudgetAllocation.remaining / 100).toLocaleString('en-KE'))))))),
                    selectedBudgetAllocation && formData.amount && parseFloat(formData.amount) > selectedBudgetAllocation.remaining / 100 && (react_1["default"].createElement("div", { className: "p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 rounded flex gap-2" },
                        react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" }),
                        react_1["default"].createElement("p", { className: "text-sm text-orange-800 dark:text-orange-200" }, "This expense amount exceeds the remaining budget. It will overrun the allocation."))),
                    react_1["default"].createElement(separator_1.Separator, { className: "my-4" }),
                    react_1["default"].createElement("div", { className: "flex items-center gap-3 pt-2 border-t" },
                        react_1["default"].createElement("input", { type: "checkbox", id: "useLineItems", checked: useLineItems, onChange: function (e) { return setUseLineItems(e.target.checked); }, className: "h-4 w-4 rounded border-gray-300" }),
                        react_1["default"].createElement(label_1.Label, { htmlFor: "useLineItems", className: "text-sm font-medium cursor-pointer" }, "Use line items (multiple items in this expense)")),
                    useLineItems && (react_1["default"].createElement(card_1.Card, { className: "border-dashed" },
                        react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Line Items"),
                                react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: addLineItem },
                                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                                    " Add Item"))),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1" },
                                react_1["default"].createElement("div", { className: "col-span-4" }, "Description"),
                                react_1["default"].createElement("div", { className: "col-span-1" }, "Qty"),
                                react_1["default"].createElement("div", { className: "col-span-2" }, "Rate (Ksh)"),
                                react_1["default"].createElement("div", { className: "col-span-1" }, "Tax %"),
                                react_1["default"].createElement("div", { className: "col-span-2" }, "Amount"),
                                react_1["default"].createElement("div", { className: "col-span-1" }, "Tax"),
                                react_1["default"].createElement("div", { className: "col-span-1" })),
                            lineItemsData.map(function (item, idx) { return (react_1["default"].createElement("div", { key: item.id, className: "grid grid-cols-12 gap-2 items-center" },
                                react_1["default"].createElement(input_1.Input, { className: "col-span-4 text-sm", placeholder: "Item description", value: item.description, onChange: function (e) { return updateLineItem(item.id, "description", e.target.value); } }),
                                react_1["default"].createElement(input_1.Input, { className: "col-span-1 text-sm", type: "number", min: "1", value: item.quantity, onChange: function (e) { return updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1); } }),
                                react_1["default"].createElement(input_1.Input, { className: "col-span-2 text-sm", type: "number", step: "0.01", min: "0", value: item.rate || "", onChange: function (e) { return updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0); } }),
                                react_1["default"].createElement(input_1.Input, { className: "col-span-1 text-sm", type: "number", min: "0", max: "100", value: item.taxRate || "", onChange: function (e) { return updateLineItem(item.id, "taxRate", parseFloat(e.target.value) || 0); } }),
                                react_1["default"].createElement("div", { className: "col-span-2 text-sm font-mono px-2" }, item.amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })),
                                react_1["default"].createElement("div", { className: "col-span-1 text-sm font-mono text-muted-foreground px-1" }, item.taxAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })),
                                react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", className: "col-span-1 h-8 w-8 p-0 text-destructive", onClick: function () { return removeLineItem(item.id); }, disabled: lineItemsData.length <= 1 },
                                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); }),
                            react_1["default"].createElement("div", { className: "border-t pt-3 flex justify-end" },
                                react_1["default"].createElement("div", { className: "text-right space-y-1" },
                                    react_1["default"].createElement("div", { className: "text-sm" },
                                        "Subtotal: ",
                                        react_1["default"].createElement("span", { className: "font-mono font-bold" },
                                            "Ksh ",
                                            lineItemsData.reduce(function (s, i) { return s + i.amount; }, 0).toLocaleString("en-KE", { minimumFractionDigits: 2 }))),
                                    react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" },
                                        "Tax: ",
                                        react_1["default"].createElement("span", { className: "font-mono" },
                                            "Ksh ",
                                            lineItemsData.reduce(function (s, i) { return s + i.taxAmount; }, 0).toLocaleString("en-KE", { minimumFractionDigits: 2 }))),
                                    react_1["default"].createElement("div", { className: "text-base font-bold" },
                                        "Total: ",
                                        react_1["default"].createElement("span", { className: "font-mono text-primary" },
                                            "Ksh ",
                                            lineItemsTotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })))))))),
                    react_1["default"].createElement(separator_1.Separator, { className: "my-4" }),
                    react_1["default"].createElement(collapsible_1.Collapsible, { open: showAdditionalInfo, onOpenChange: setShowAdditionalInfo },
                        react_1["default"].createElement(collapsible_1.CollapsibleTrigger, { asChild: true },
                            react_1["default"].createElement("button", { type: "button", className: "flex items-center justify-between w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" },
                                react_1["default"].createElement("span", null, "Additional Information"),
                                showAdditionalInfo ? react_1["default"].createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : react_1["default"].createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }))),
                        react_1["default"].createElement(collapsible_1.CollapsibleContent, { className: "space-y-4 pt-3" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-start gap-3" },
                                react_1["default"].createElement(label_1.Label, { className: "text-right text-sm pt-2" }, "Description"),
                                react_1["default"].createElement(textarea_1.Textarea, { placeholder: "Enter expense description", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, rows: 4 })))),
                    react_1["default"].createElement(separator_1.Separator, { className: "my-4" }),
                    react_1["default"].createElement("div", { className: "space-y-3" },
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "w-4 h-4 text-muted-foreground" }),
                                react_1["default"].createElement(label_1.Label, { className: "text-sm font-medium" }, "Recurring Expense")),
                            react_1["default"].createElement(switch_1.Switch, { checked: isRecurring, onCheckedChange: setIsRecurring })),
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Enable to auto-remind and repeat this expense on a schedule"),
                        isRecurring && (react_1["default"].createElement("div", { className: "space-y-3 p-4 bg-muted/50 rounded-lg border" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { className: "text-xs" }, "Frequency"),
                                    react_1["default"].createElement(select_1.Select, { value: recurringFrequency, onValueChange: setRecurringFrequency },
                                        react_1["default"].createElement(select_1.SelectTrigger, null,
                                            react_1["default"].createElement(select_1.SelectValue, null)),
                                        react_1["default"].createElement(select_1.SelectContent, null,
                                            react_1["default"].createElement(select_1.SelectItem, { value: "weekly" }, "Weekly"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "biweekly" }, "Bi-Weekly"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "quarterly" }, "Quarterly"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "annually" }, "Annually")))),
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { className: "text-xs" }, "Day of Month (for monthly+)"),
                                    react_1["default"].createElement(input_1.Input, { type: "number", min: 1, max: 28, value: recurringDayOfMonth, onChange: function (e) { return setRecurringDayOfMonth(parseInt(e.target.value) || 1); } }))),
                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { className: "text-xs" }, "Start Date"),
                                    react_1["default"].createElement(input_1.Input, { type: "date", value: recurringStartDate, onChange: function (e) { return setRecurringStartDate(e.target.value); } })),
                                react_1["default"].createElement("div", { className: "space-y-1.5" },
                                    react_1["default"].createElement(label_1.Label, { className: "text-xs flex items-center justify-between" },
                                        "End Date",
                                        react_1["default"].createElement("span", { className: "flex items-center gap-1 text-[10px] font-normal" },
                                            react_1["default"].createElement(switch_1.Switch, { checked: recurringNoEnd, onCheckedChange: setRecurringNoEnd, className: "scale-75" }),
                                            "No end")),
                                    react_1["default"].createElement(input_1.Input, { type: "date", value: recurringEndDate, onChange: function (e) { return setRecurringEndDate(e.target.value); }, disabled: recurringNoEnd, className: recurringNoEnd ? "opacity-50" : "" }))),
                            react_1["default"].createElement("div", { className: "space-y-1.5" },
                                react_1["default"].createElement(label_1.Label, { className: "text-xs" }, "Reminder (days before due)"),
                                react_1["default"].createElement(input_1.Input, { type: "number", min: 0, max: 30, value: recurringReminderDays, onChange: function (e) { return setRecurringReminderDays(parseInt(e.target.value) || 0); }, className: "max-w-[120px]" }),
                                react_1["default"].createElement("p", { className: "text-[10px] text-muted-foreground" }, "E.g. \"Internet Subscription is due in 3 days\""))))),
                    react_1["default"].createElement(separator_1.Separator, { className: "my-4" }),
                    react_1["default"].createElement("div", { className: "flex gap-2" },
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: createExpenseMutation.isPending },
                            createExpenseMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            react_1["default"].createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                            "Record Expense"),
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: handleSaveDraft }, "Save Draft"),
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "secondary", onClick: handleDownloadPDF, disabled: isGeneratingPDF },
                            isGeneratingPDF ? (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (react_1["default"].createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" })),
                            "Download PDF"),
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", onClick: function () { return navigate("/expenses"); } },
                            react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                            "Cancel")))))));
}
exports["default"] = CreateExpense;
