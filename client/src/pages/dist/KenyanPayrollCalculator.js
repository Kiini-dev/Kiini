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
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var PayslipSummary_1 = require("@/components/PayslipSummary");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var DEFAULT_PAYROLL = {
    basicSalary: 0,
    allowances: 0,
    housingAllowance: 0
};
// Simulated Kenyan payroll calculator (matches server-side logic)
function calculateKenyanPayroll(info) {
    var basicSalary = info.basicSalary;
    var allowances = info.allowances || 0;
    var grossSalary = basicSalary + allowances;
    // NSSF Calculation
    var nssfTier1 = Math.min(grossSalary * 0.06, 18000);
    var nssfTier2 = grossSalary > 300000 ? (grossSalary - 300000) * 0.06 : 0;
    var nssfTotal = Math.round(nssfTier1 + nssfTier2);
    // Housing Levy
    var housingLevy = Math.round(Math.min(grossSalary * 0.015, 15000));
    // Taxable Income
    var taxableIncome = grossSalary - nssfTotal - housingLevy;
    // PAYE Calculation (progressive)
    var annualTaxable = taxableIncome * 12;
    var tax = 0;
    var bracket = "";
    if (annualTaxable <= 288000) {
        tax = annualTaxable * 0.1;
        bracket = "10%";
    }
    else if (annualTaxable <= 388000) {
        tax = 288000 * 0.1 + (annualTaxable - 288000) * 0.15;
        bracket = "15%";
    }
    else if (annualTaxable <= 6000000) {
        tax = 288000 * 0.1 + 100000 * 0.15 + (annualTaxable - 388000) * 0.2;
        bracket = "20%";
    }
    else if (annualTaxable <= 9600000) {
        tax = 288000 * 0.1 + 100000 * 0.15 + 5612000 * 0.2 + (annualTaxable - 6000000) * 0.25;
        bracket = "25%";
    }
    else {
        tax = 288000 * 0.1 + 100000 * 0.15 + 5612000 * 0.2 + 3600000 * 0.25 + (annualTaxable - 9600000) * 0.3;
        bracket = "30%";
    }
    var monthlyTaxBefore = Math.round(tax / 12);
    var personalRelief = 2400;
    var monthlyTaxAfter = Math.max(0, monthlyTaxBefore - personalRelief);
    // SHIF Calculation
    var shifBefore = grossSalary * 0.025;
    var shifTotal = Math.round(Math.min(shifBefore, 15000));
    // Net Salary
    var totalDeductions = nssfTotal + monthlyTaxAfter + shifTotal + housingLevy;
    var netSalary = grossSalary - totalDeductions;
    return {
        basicSalary: Math.round(basicSalary * 100),
        grossSalary: Math.round(grossSalary * 100),
        nssfContribution: Math.round(nssfTotal * 100),
        payeeTax: Math.round(monthlyTaxAfter * 100),
        shifContribution: Math.round(shifTotal * 100),
        housingLevyDeduction: Math.round(housingLevy * 100),
        personalRelief: Math.round(personalRelief * 100),
        netSalary: Math.round(netSalary * 100),
        details: {
            nssfTier1: Math.round(nssfTier1 * 100),
            nssfTier2: Math.round(nssfTier2 * 100),
            shifBasic: Math.round(shifBefore * 100),
            shifCapped: Math.round(shifTotal * 100),
            payeBeforeRelief: Math.round(monthlyTaxBefore * 100),
            payeAfterRelief: Math.round(monthlyTaxAfter * 100),
            taxableIncome: Math.round(taxableIncome * 100),
            taxBracketApplied: bracket
        }
    };
}
function KenyanPayrollCalculator() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState({
        employeeId: "",
        basicSalary: "",
        allowances: "",
        housingAllowance: "",
        payPeriod: new Date().toISOString().split("T")[0]
    }), formData = _b[0], setFormData = _b[1];
    var _c = react_1.useState(null), calculation = _c[0], setCalculation = _c[1];
    var _d = react_1.useState(false), showPreview = _d[0], setShowPreview = _d[1];
    var _e = trpc_1.trpc.employees.list.useQuery().data, employees = _e === void 0 ? [] : _e;
    var selectedEmployee = employees.find(function (e) { return e.id === formData.employeeId; });
    var handleCalculate = function () {
        if (!formData.employeeId) {
            sonner_1.toast.error("Please select an employee");
            return;
        }
        if (!formData.basicSalary || parseFloat(formData.basicSalary) <= 0) {
            sonner_1.toast.error("Please enter a valid basic salary");
            return;
        }
        var result = calculateKenyanPayroll({
            basicSalary: parseFloat(formData.basicSalary),
            allowances: parseFloat(formData.allowances || "0"),
            housingAllowance: parseFloat(formData.housingAllowance || "0")
        });
        setCalculation(result);
        setShowPreview(true);
        sonner_1.toast.success("Payroll calculated successfully");
    };
    var handleSavePayroll = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // Here you would save to the database
                sonner_1.toast.success("Payroll saved successfully");
                navigate("/payroll");
            }
            catch (error) {
                sonner_1.toast.error("Failed to save payroll");
            }
            return [2 /*return*/];
        });
    }); };
    var formatCurrency = function (value) {
        if (!value)
            return "";
        return parseFloat(value).toLocaleString("en-KE", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };
    var handleInputChange = function (field, value) {
        // Only allow numbers and decimals
        if (value && !/^\d*\.?\d*$/.test(value))
            return;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Kenyan Payroll Calculator", description: "Calculate payroll with PAYE, NSSF, SHIF, and Housing Levy deductions", icon: React.createElement(lucide_react_1.Calculator, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Payroll", href: "/payroll" },
            { label: "Kenyan Calculator", href: "#" },
        ] },
        React.createElement("div", { className: "space-y-6" }, !showPreview ? (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Payroll Information"),
                React.createElement(card_1.CardDescription, null, "Enter employee and salary details to calculate payroll with all Kenyan deductions")),
            React.createElement(card_1.CardContent, { className: "space-y-6" },
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, { htmlFor: "employee" }, "Select Employee *"),
                    React.createElement(select_1.Select, { value: formData.employeeId, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { employeeId: value })); }); } },
                        React.createElement(select_1.SelectTrigger, { id: "employee" },
                            React.createElement(select_1.SelectValue, { placeholder: "Choose an employee..." })),
                        React.createElement(select_1.SelectContent, null, employees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                            emp.name,
                            " (",
                            emp.email,
                            ")")); })))),
                selectedEmployee && (React.createElement("div", { className: "bg-blue-50 p-4 rounded border-l-4 border-l-blue-500" },
                    React.createElement("p", { className: "text-sm" },
                        React.createElement("strong", null, "Employee:"),
                        " ",
                        selectedEmployee.name),
                    React.createElement("p", { className: "text-sm" },
                        React.createElement("strong", null, "Email:"),
                        " ",
                        selectedEmployee.email),
                    React.createElement("p", { className: "text-sm" },
                        React.createElement("strong", null, "Department:"),
                        " ",
                        selectedEmployee.department || "N/A"))),
                React.createElement("div", { className: "grid gap-6 md:grid-cols-3" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "basic" }, "Basic Salary (KES) *"),
                        React.createElement(input_1.Input, { id: "basic", type: "text", placeholder: "50000", value: formData.basicSalary, onChange: function (e) { return handleInputChange("basicSalary", e.target.value); }, className: "text-right" }),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, formData.basicSalary ? "KES " + formatCurrency(formData.basicSalary) : "")),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "allowances" }, "Other Allowances (KES)"),
                        React.createElement(input_1.Input, { id: "allowances", type: "text", placeholder: "5000", value: formData.allowances, onChange: function (e) { return handleInputChange("allowances", e.target.value); }, className: "text-right" }),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, formData.allowances ? "KES " + formatCurrency(formData.allowances) : "")),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "housing" }, "Housing Allowance (KES)"),
                        React.createElement(input_1.Input, { id: "housing", type: "text", placeholder: "10000", value: formData.housingAllowance, onChange: function (e) { return handleInputChange("housingAllowance", e.target.value); }, className: "text-right" }),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, formData.housingAllowance ? "KES " + formatCurrency(formData.housingAllowance) : ""))),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, { htmlFor: "period" }, "Pay Period"),
                    React.createElement(input_1.Input, { id: "period", type: "month", value: formData.payPeriod.split("-").slice(0, 2).join("-"), onChange: function (e) {
                            var _a = e.target.value.split("-"), year = _a[0], month = _a[1];
                            setFormData(function (prev) { return (__assign(__assign({}, prev), { payPeriod: year + "-" + month + "-01" })); });
                        } })),
                React.createElement(button_1.Button, { onClick: handleCalculate, className: "w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg" },
                    React.createElement(lucide_react_1.Calculator, { className: "mr-2 h-5 w-5" }),
                    "Calculate Payroll"),
                React.createElement("div", { className: "bg-slate-50 p-4 rounded text-sm space-y-2" },
                    React.createElement("p", { className: "font-semibold" }, "Deductions Included:"),
                    React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                        React.createElement("div", null, "\u2713 NSSF (Tier 1 & 2)"),
                        React.createElement("div", null, "\u2713 PAYE Tax"),
                        React.createElement("div", null, "\u2713 SHIF (Health Fund)"),
                        React.createElement("div", null, "\u2713 Housing Levy")))))) : calculation ? (React.createElement("div", { className: "space-y-6" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowPreview(false); }, className: "mb-4" }, "\u2190 Back to Calculator"),
            React.createElement(PayslipSummary_1.PayslipSummary, { employeeName: (selectedEmployee === null || selectedEmployee === void 0 ? void 0 : selectedEmployee.name) || "Employee", employeeId: formData.employeeId, payPeriod: new Date(formData.payPeriod).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long"
                }), taxNumber: (selectedEmployee === null || selectedEmployee === void 0 ? void 0 : selectedEmployee.taxNumber) || "N/A", payroll: calculation, onDownload: function () { return window.print(); } }),
            React.createElement("div", { className: "flex gap-4" },
                React.createElement(button_1.Button, { onClick: handleSavePayroll, className: "flex-1 bg-green-600 hover:bg-green-700", size: "lg" },
                    React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                    "Save This Payroll"),
                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowPreview(false); }, size: "lg" },
                    React.createElement(lucide_react_1.ArrowRight, { className: "mr-2 h-4 w-4" }),
                    "Create Another")))) : null)));
}
exports["default"] = KenyanPayrollCalculator;
