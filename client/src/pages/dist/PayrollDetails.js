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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var sonner_1 = require("sonner");
function PayrollDetails() {
    var _this = this;
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState(false), showDeleteModal = _b[0], setShowDeleteModal = _b[1];
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    // Fetch payroll from backend
    var _d = trpc_1.trpc.payroll.getById.useQuery(id || ""), payrollData = _d.data, isLoading = _d.isLoading;
    var _e = trpc_1.trpc.employees.list.useQuery().data, employeesData = _e === void 0 ? [] : _e;
    var utils = trpc_1.trpc.useUtils();
    var deletePayrollMutation = trpc_1.trpc.payroll["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payroll record deleted successfully");
            utils.payroll.list.invalidate();
            setLocation("/payroll");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete payroll record");
        }
    });
    // Get employee info
    var employee = payrollData ? employeesData.find(function (e) { return e.id === payrollData.employeeId; }) : null;
    // Format period
    var formatPeriod = function (payPeriodStart, payPeriodEnd) {
        var start = new Date(payPeriodStart);
        var end = new Date(payPeriodEnd);
        return start.toLocaleDateString() + " - " + end.toLocaleDateString();
    };
    var formatMonth = function (payPeriodStart) {
        var d = new Date(payPeriodStart);
        return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };
    var payrollRecord = payrollData ? {
        id: id,
        employeeId: payrollData.employeeId || "Unknown",
        employeeName: employee ? employee.firstName + " " + employee.lastName : "Unknown Employee",
        department: (employee === null || employee === void 0 ? void 0 : employee.department) || "—",
        period: payrollData.payPeriodStart && payrollData.payPeriodEnd
            ? formatPeriod(payrollData.payPeriodStart, payrollData.payPeriodEnd)
            : "Unknown Period",
        month: payrollData.payPeriodStart
            ? formatMonth(payrollData.payPeriodStart)
            : "",
        baseSalary: (payrollData.basicSalary || 0) / 100,
        allowances: (payrollData.allowances || 0) / 100,
        deductions: (payrollData.deductions || 0) / 100,
        tax: (payrollData.tax || 0) / 100,
        netSalary: (payrollData.netSalary || 0) / 100,
        status: payrollData.status || "draft",
        currency: payrollData.currency || "KES"
    } : null;
    var isPaid = (payrollRecord === null || payrollRecord === void 0 ? void 0 : payrollRecord.status) === "processed" || (payrollRecord === null || payrollRecord === void 0 ? void 0 : payrollRecord.status) === "paid";
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deletePayrollMutation, id || "")];
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
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payroll Details", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Payroll", href: "/payroll" },
                { label: "Details" },
            ], backLink: { label: "Payroll", href: "/payroll" } },
            React.createElement("div", { className: "flex items-center justify-center h-64" },
                React.createElement("p", null, "Loading payroll record..."))));
    }
    if (!payrollRecord) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payroll Details", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "HR", href: "/hr" },
                { label: "Payroll", href: "/payroll" },
                { label: "Details" },
            ], backLink: { label: "Payroll", href: "/payroll" } },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Payroll record not found"),
                React.createElement(button_1.Button, { onClick: function () { return setLocation("/payroll"); } }, "Back to Payroll"))));
    }
    var grossPay = payrollRecord.baseSalary + payrollRecord.allowances;
    var totalDeductions = payrollRecord.deductions + payrollRecord.tax;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payroll Details", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Details" },
        ], backLink: { label: "Payroll", href: "/payroll" }, actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "gap-2", onClick: function () { return setLocation("/payroll/" + id + "/edit"); } },
                React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4" }),
                "Edit"),
            React.createElement(button_1.Button, { variant: "destructive", size: "sm", className: "gap-2", onClick: function () { return setShowDeleteModal(true); } },
                React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }),
                "Delete")) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex flex-col lg:flex-row gap-6" },
                React.createElement("div", { className: "w-full lg:w-80 shrink-0 space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "pt-6 space-y-4" },
                            React.createElement("div", { className: "text-center space-y-2" },
                                React.createElement("h2", { className: "text-xl font-semibold" }, payrollRecord.employeeName),
                                React.createElement(badge_1.Badge, { variant: isPaid ? "default" : "secondary", className: isPaid ? "bg-green-600 hover:bg-green-700" : "" }, isPaid ? "Paid" : "Pending")),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "space-y-3 text-sm" },
                                React.createElement("div", { className: "flex justify-between" },
                                    React.createElement("span", { className: "text-muted-foreground" }, "Department"),
                                    React.createElement("span", { className: "font-medium" }, payrollRecord.department)),
                                React.createElement("div", { className: "flex justify-between" },
                                    React.createElement("span", { className: "text-muted-foreground" }, "Pay Period"),
                                    React.createElement("span", { className: "font-medium" }, payrollRecord.period)),
                                React.createElement("div", { className: "flex justify-between" },
                                    React.createElement("span", { className: "text-muted-foreground" }, "Currency"),
                                    React.createElement("span", { className: "font-medium" }, payrollRecord.currency))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "text-center space-y-1" },
                                React.createElement("p", { className: "text-xs text-muted-foreground uppercase tracking-wide" }, "Net Salary"),
                                React.createElement("p", { className: "text-2xl font-bold" },
                                    payrollRecord.currency,
                                    " ",
                                    payrollRecord.netSalary.toLocaleString()))))),
                React.createElement("div", { className: "flex-1 min-w-0 space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-base" }, "Earnings")),
                        React.createElement(card_1.CardContent, { className: "space-y-3" },
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", { className: "text-muted-foreground" }, "Base Salary"),
                                React.createElement("span", { className: "font-medium" },
                                    payrollRecord.currency,
                                    " ",
                                    payrollRecord.baseSalary.toLocaleString())),
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", { className: "text-muted-foreground" }, "Allowances"),
                                React.createElement("span", { className: "font-medium text-green-600" },
                                    "+ ",
                                    payrollRecord.currency,
                                    " ",
                                    payrollRecord.allowances.toLocaleString())),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "flex justify-between text-sm font-semibold" },
                                React.createElement("span", null, "Gross Pay"),
                                React.createElement("span", null,
                                    payrollRecord.currency,
                                    " ",
                                    grossPay.toLocaleString())))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-base" }, "Deductions")),
                        React.createElement(card_1.CardContent, { className: "space-y-3" },
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", { className: "text-muted-foreground" }, "Statutory Deductions"),
                                React.createElement("span", { className: "font-medium text-red-600" },
                                    "- ",
                                    payrollRecord.currency,
                                    " ",
                                    payrollRecord.deductions.toLocaleString())),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "flex justify-between text-sm font-semibold" },
                                React.createElement("span", null, "Total Deductions"),
                                React.createElement("span", { className: "text-red-600" },
                                    "- ",
                                    payrollRecord.currency,
                                    " ",
                                    payrollRecord.deductions.toLocaleString())))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-base" }, "Tax")),
                        React.createElement(card_1.CardContent, { className: "space-y-3" },
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", { className: "text-muted-foreground" }, "PAYE / Income Tax"),
                                React.createElement("span", { className: "font-medium text-red-600" },
                                    "- ",
                                    payrollRecord.currency,
                                    " ",
                                    payrollRecord.tax.toLocaleString())))),
                    React.createElement(card_1.Card, { className: "border-primary/30" },
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-base" }, "Net Pay Calculation")),
                        React.createElement(card_1.CardContent, { className: "space-y-3" },
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", { className: "text-muted-foreground" }, "Gross Pay"),
                                React.createElement("span", { className: "font-medium" },
                                    payrollRecord.currency,
                                    " ",
                                    grossPay.toLocaleString())),
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", { className: "text-muted-foreground" }, "Less: Deductions"),
                                React.createElement("span", { className: "font-medium text-red-600" },
                                    "- ",
                                    payrollRecord.currency,
                                    " ",
                                    payrollRecord.deductions.toLocaleString())),
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", { className: "text-muted-foreground" }, "Less: Tax"),
                                React.createElement("span", { className: "font-medium text-red-600" },
                                    "- ",
                                    payrollRecord.currency,
                                    " ",
                                    payrollRecord.tax.toLocaleString())),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", { className: "flex justify-between font-bold text-lg" },
                                React.createElement("span", null, "Net Pay"),
                                React.createElement("span", null,
                                    payrollRecord.currency,
                                    " ",
                                    payrollRecord.netSalary.toLocaleString())))))),
            React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, title: "Delete Payroll Record", description: "Are you sure you want to delete this payroll record? This action cannot be undone.", onConfirm: handleDelete, onCancel: function () { return setShowDeleteModal(false); }, isLoading: isDeleting }))));
}
exports["default"] = PayrollDetails;
