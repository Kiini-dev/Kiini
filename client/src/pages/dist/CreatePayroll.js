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
var tabs_1 = require("@/components/ui/tabs");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
// Kenyan payroll calculator function
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
    if (annualTaxable <= 288000) {
        tax = annualTaxable * 0.1;
    }
    else if (annualTaxable <= 388000) {
        tax = 288000 * 0.1 + (annualTaxable - 288000) * 0.15;
    }
    else if (annualTaxable <= 6000000) {
        tax = 288000 * 0.1 + 100000 * 0.15 + (annualTaxable - 388000) * 0.2;
    }
    else if (annualTaxable <= 9600000) {
        tax = 288000 * 0.1 + 100000 * 0.15 + 5612000 * 0.2 + (annualTaxable - 6000000) * 0.25;
    }
    else {
        tax = 288000 * 0.1 + 100000 * 0.15 + 5612000 * 0.2 + 3600000 * 0.25 + (annualTaxable - 9600000) * 0.3;
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
        basicSalary: Math.round(basicSalary),
        grossSalary: Math.round(grossSalary),
        nssfContribution: nssfTotal,
        payeeTax: monthlyTaxAfter,
        shifContribution: shifTotal,
        housingLevyDeduction: housingLevy,
        personalRelief: personalRelief,
        netSalary: Math.round(netSalary),
        totalDeductions: totalDeductions
    };
}
function CreatePayroll() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState("kenyan"), payrollMode = _b[0], setPayrollMode = _b[1];
    var _c = react_1.useState({
        employeeId: "",
        payPeriodStart: "",
        payPeriodEnd: "",
        basicSalary: "",
        allowances: "",
        housingAllowance: "",
        deductions: "",
        tax: "",
        netSalary: "",
        status: "draft"
    }), formData = _c[0], setFormData = _c[1];
    var _d = react_1.useState(null), calculation = _d[0], setCalculation = _d[1];
    var _e = trpc_1.trpc.employees.list.useQuery({}).data, employees = _e === void 0 ? [] : _e;
    // Auto-calculate when mode is "kenyan" and salary fields change
    react_1.useEffect(function () {
        if (payrollMode === "kenyan" && formData.basicSalary) {
            var basicSalary = parseFloat(formData.basicSalary) || 0;
            var allowances = parseFloat(formData.allowances) || 0;
            var housingAllowance = parseFloat(formData.housingAllowance) || 0;
            var result_1 = calculateKenyanPayroll({
                basicSalary: basicSalary,
                allowances: allowances,
                housingAllowance: housingAllowance
            });
            setCalculation(result_1);
            // Auto-populate the form fields
            setFormData(function (prev) { return (__assign(__assign({}, prev), { deductions: String((result_1.nssfContribution + result_1.shifTotal + result_1.housingLevyDeduction) / 100), tax: String(result_1.payeeTax / 100), netSalary: String(result_1.netSalary / 100) })); });
        }
    }, [
        payrollMode,
        formData.basicSalary,
        formData.allowances,
        formData.housingAllowance,
    ]);
    var createPayrollMutation = trpc_1.trpc.payroll.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payroll record created successfully!");
            utils.payroll.list.invalidate();
            navigate("/payroll");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create payroll record: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.employeeId || !formData.payPeriodStart || !formData.payPeriodEnd || !formData.basicSalary || !formData.netSalary) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        createPayrollMutation.mutate({
            employeeId: formData.employeeId,
            payPeriodStart: new Date(formData.payPeriodStart),
            payPeriodEnd: new Date(formData.payPeriodEnd),
            basicSalary: Math.round(parseFloat(formData.basicSalary)),
            allowances: formData.allowances ? Math.round(parseFloat(formData.allowances)) : 0,
            deductions: formData.deductions ? Math.round(parseFloat(formData.deductions)) : 0,
            tax: formData.tax ? Math.round(parseFloat(formData.tax)) : 0,
            netSalary: Math.round(parseFloat(formData.netSalary)),
            status: formData.status
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Payroll", description: "Process employee payroll with automatic Kenyan calculation", icon: React.createElement(lucide_react_1.Calculator, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Create Payroll" },
        ], backLink: { label: "Payroll", href: "/payroll" } },
        React.createElement("div", { className: "max-w-4xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Create Payroll"),
                    React.createElement(card_1.CardDescription, null, "Process payroll with automatic Kenyan tax calculations")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(tabs_1.Tabs, { value: payrollMode, onValueChange: function (v) { return setPayrollMode(v); }, className: "w-full" },
                        React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-2 mb-6" },
                            React.createElement(tabs_1.TabsTrigger, { value: "kenyan" }, "Kenyan Payroll (Automatic)"),
                            React.createElement(tabs_1.TabsTrigger, { value: "manual" }, "Manual Entry")),
                        React.createElement(tabs_1.TabsContent, { value: "kenyan", className: "space-y-6" },
                            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "employeeId" }, "Employee *"),
                                    React.createElement(select_1.Select, { value: formData.employeeId, onValueChange: function (value) {
                                            return setFormData(__assign(__assign({}, formData), { employeeId: value }));
                                        } },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: "Select an employee" })),
                                        React.createElement(select_1.SelectContent, null, Array.isArray(employees) && employees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                                            (emp.firstName || ""),
                                            " ",
                                            (emp.lastName || ""))); })))),
                                React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "payPeriodStart" }, "Pay Period Start *"),
                                        React.createElement(input_1.Input, { id: "payPeriodStart", type: "date", value: formData.payPeriodStart, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { payPeriodStart: e.target.value }));
                                            } })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "payPeriodEnd" }, "Pay Period End *"),
                                        React.createElement(input_1.Input, { id: "payPeriodEnd", type: "date", value: formData.payPeriodEnd, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { payPeriodEnd: e.target.value }));
                                            } }))),
                                React.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4" },
                                    React.createElement("h3", { className: "font-semibold text-blue-900 flex items-center gap-2" },
                                        React.createElement(lucide_react_1.Calculator, { className: "w-4 h-4" }),
                                        "Income Components"),
                                    React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "basicSalary" }, "Basic Salary (Ksh) *"),
                                            React.createElement(input_1.Input, { id: "basicSalary", type: "number", placeholder: "0.00", value: formData.basicSalary, onChange: function (e) {
                                                    return setFormData(__assign(__assign({}, formData), { basicSalary: e.target.value }));
                                                }, step: "1", min: "0" })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "allowances" }, "Allowances (Ksh)"),
                                            React.createElement(input_1.Input, { id: "allowances", type: "number", placeholder: "0.00", value: formData.allowances, onChange: function (e) {
                                                    return setFormData(__assign(__assign({}, formData), { allowances: e.target.value }));
                                                }, step: "1", min: "0" })),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement(label_1.Label, { htmlFor: "housingAllowance" }, "Housing Allowance (Ksh)"),
                                            React.createElement(input_1.Input, { id: "housingAllowance", type: "number", placeholder: "0.00", value: formData.housingAllowance, onChange: function (e) {
                                                    return setFormData(__assign(__assign({}, formData), { housingAllowance: e.target.value }));
                                                }, step: "1", min: "0" })))),
                                calculation && (React.createElement("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 space-y-3" },
                                    React.createElement("h3", { className: "font-semibold text-green-900" }, "Payroll Summary (Auto-calculated)"),
                                    React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4 text-sm" },
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-gray-600" }, "Gross Salary"),
                                            React.createElement("p", { className: "font-bold text-lg" },
                                                "Ksh ",
                                                (calculation.grossSalary / 100).toLocaleString())),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-gray-600" }, "NSSF"),
                                            React.createElement("p", { className: "font-bold" },
                                                "-Ksh ",
                                                (calculation.nssfContribution / 100 || 0).toLocaleString())),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-gray-600" }, "PAYE Tax"),
                                            React.createElement("p", { className: "font-bold" },
                                                "-Ksh ",
                                                (calculation.payeeTax / 100 || 0).toLocaleString())),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-gray-600" }, "Housing Levy"),
                                            React.createElement("p", { className: "font-bold" },
                                                "-Ksh ",
                                                (calculation.housingLevyDeduction / 100 || 0).toLocaleString())),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-gray-600" }, "SHIF"),
                                            React.createElement("p", { className: "font-bold" },
                                                "-Ksh ",
                                                (calculation.shifContribution / 100 || 0).toLocaleString())),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-gray-600" }, "Total Deductions"),
                                            React.createElement("p", { className: "font-bold" },
                                                "-Ksh ",
                                                (calculation.totalDeductions / 100).toLocaleString()))),
                                    React.createElement("div", { className: "pt-2 border-t border-green-200" },
                                        React.createElement("p", { className: "text-gray-600" }, "Net Salary"),
                                        React.createElement("p", { className: "font-bold text-xl text-green-700" },
                                            "Ksh ",
                                            (calculation.netSalary / 100).toLocaleString())))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                                    React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) {
                                            return setFormData(__assign(__assign({}, formData), { status: value }));
                                        } },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, null)),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                            React.createElement(select_1.SelectItem, { value: "processed" }, "Processed"),
                                            React.createElement(select_1.SelectItem, { value: "paid" }, "Paid")))),
                                React.createElement("div", { className: "flex gap-4" },
                                    React.createElement(button_1.Button, { type: "submit", disabled: createPayrollMutation.isPending, className: "bg-green-600 hover:bg-green-700" }, createPayrollMutation.isPending
                                        ? "Creating..."
                                        : "Create Payroll")))),
                        React.createElement(tabs_1.TabsContent, { value: "manual", className: "space-y-6" },
                            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "employeeId" }, "Employee *"),
                                    React.createElement(select_1.Select, { value: formData.employeeId, onValueChange: function (value) {
                                            return setFormData(__assign(__assign({}, formData), { employeeId: value }));
                                        } },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: "Select an employee" })),
                                        React.createElement(select_1.SelectContent, null, Array.isArray(employees) && employees.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                                            (emp.firstName || ""),
                                            " ",
                                            (emp.lastName || ""))); })))),
                                React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "payPeriodStart" }, "Pay Period Start *"),
                                        React.createElement(input_1.Input, { id: "payPeriodStart", type: "date", value: formData.payPeriodStart, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { payPeriodStart: e.target.value }));
                                            } })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "payPeriodEnd" }, "Pay Period End *"),
                                        React.createElement(input_1.Input, { id: "payPeriodEnd", type: "date", value: formData.payPeriodEnd, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { payPeriodEnd: e.target.value }));
                                            } }))),
                                React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "basicSalary" }, "Basic Salary (Ksh) *"),
                                        React.createElement(input_1.Input, { id: "basicSalary", type: "number", placeholder: "0.00", value: formData.basicSalary, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { basicSalary: e.target.value }));
                                            }, step: "1", min: "0" })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "allowances" }, "Allowances (Ksh)"),
                                        React.createElement(input_1.Input, { id: "allowances", type: "number", placeholder: "0.00", value: formData.allowances, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { allowances: e.target.value }));
                                            }, step: "1", min: "0" }))),
                                React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "deductions" }, "Deductions (Ksh)"),
                                        React.createElement(input_1.Input, { id: "deductions", type: "number", placeholder: "0.00", value: formData.deductions, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { deductions: e.target.value }));
                                            }, step: "1", min: "0" })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "tax" }, "Tax (Ksh)"),
                                        React.createElement(input_1.Input, { id: "tax", type: "number", placeholder: "0.00", value: formData.tax, onChange: function (e) {
                                                return setFormData(__assign(__assign({}, formData), { tax: e.target.value }));
                                            }, step: "1", min: "0" }))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "netSalary" }, "Net Salary (Ksh) *"),
                                    React.createElement(input_1.Input, { id: "netSalary", type: "number", placeholder: "0.00", value: formData.netSalary, onChange: function (e) {
                                            return setFormData(__assign(__assign({}, formData), { netSalary: e.target.value }));
                                        }, step: "1", min: "0" })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                                    React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) {
                                            return setFormData(__assign(__assign({}, formData), { status: value }));
                                        } },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, null)),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                            React.createElement(select_1.SelectItem, { value: "processed" }, "Processed"),
                                            React.createElement(select_1.SelectItem, { value: "paid" }, "Paid")))),
                                React.createElement("div", { className: "flex gap-4" },
                                    React.createElement(button_1.Button, { type: "submit", disabled: createPayrollMutation.isPending }, createPayrollMutation.isPending
                                        ? "Creating..."
                                        : "Create Payroll"))))))))));
}
exports["default"] = CreatePayroll;
