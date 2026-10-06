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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var alert_1 = require("@/components/ui/alert");
var table_1 = require("@/components/ui/table");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var exportCsv_1 = require("@/utils/exportCsv");
function PayrollProcessing() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(""), payMonth = _b[0], setPayMonth = _b[1];
    var _c = react_1.useState(new Set()), selectedEmployeeIds = _c[0], setSelectedEmployeeIds = _c[1];
    var _d = react_1.useState(false), isProcessing = _d[0], setIsProcessing = _d[1];
    var _e = react_1.useState(null), processingSummary = _e[0], setProcessingSummary = _e[1];
    var _f = react_1.useState([]), payrollRecords = _f[0], setPayrollRecords = _f[1];
    var _g = react_1.useState(false), selectAll = _g[0], setSelectAll = _g[1];
    var _h = react_1.useState(false), isAutomatedProcessing = _h[0], setIsAutomatedProcessing = _h[1];
    var _j = react_1.useState(false), isDispatching = _j[0], setIsDispatching = _j[1];
    var _k = trpc_1.trpc.employees.list.useQuery().data, rawEmployees = _k === void 0 ? [] : _k;
    var _l = trpc_1.trpc.payroll.list.useQuery().data, rawPayrollData = _l === void 0 ? [] : _l;
    var employees = JSON.parse(JSON.stringify(rawEmployees));
    var payrollData = JSON.parse(JSON.stringify(rawPayrollData));
    var createPayroll = trpc_1.trpc.payroll.create.useMutation({
        onSuccess: function () { return sonner_1.toast.success("Payroll record created"); },
        onError: function (e) { return sonner_1.toast.error(e.message || "Failed to create payroll record"); }
    });
    var processMonthlyPayroll = trpc_1.trpc.payroll.processMonthly.useMutation({
        onSuccess: function (result) {
            sonner_1.toast.success("Automated payroll processing completed: " + result.message);
            setIsAutomatedProcessing(false);
        },
        onError: function (e) {
            sonner_1.toast.error(e.message || "Automated payroll processing failed");
            setIsAutomatedProcessing(false);
        }
    });
    var dispatchPayslips = trpc_1.trpc.payroll.dispatchPayslips.useMutation({
        onSuccess: function (result) {
            sonner_1.toast.success("Payslip dispatch completed: " + result.message);
            setIsDispatching(false);
        },
        onError: function (e) {
            sonner_1.toast.error(e.message || "Payslip dispatch failed");
            setIsDispatching(false);
        }
    });
    // Map employees to their latest payroll records (real data)
    var payrollByEmployee = new Map();
    payrollData.forEach(function (p) {
        var existing = payrollByEmployee.get(p.employeeId);
        if (!existing || (p.createdAt && existing.createdAt && p.createdAt > existing.createdAt)) {
            payrollByEmployee.set(p.employeeId, p);
        }
    });
    var employeePayroll = employees.map(function (emp) {
        var pr = payrollByEmployee.get(emp.id);
        return {
            id: emp.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            department: emp.department,
            basicSalary: (pr === null || pr === void 0 ? void 0 : pr.basicSalary) || 0,
            allowances: (pr === null || pr === void 0 ? void 0 : pr.allowances) || 0,
            deductions: (pr === null || pr === void 0 ? void 0 : pr.deductions) || 0,
            netSalary: (pr === null || pr === void 0 ? void 0 : pr.netSalary) || 0
        };
    });
    var filteredPayroll = payMonth
        ? employeePayroll.filter(function (emp) {
            return payrollData.some(function (p) {
                var _a;
                return p.employeeId === emp.id && ((_a = (p.month || p.payPeriodStart)) === null || _a === void 0 ? void 0 : _a.toString().startsWith(payMonth));
            });
        })
        : employeePayroll;
    var handleSelectAll = function (checked) {
        setSelectAll(checked);
        if (checked) {
            setSelectedEmployeeIds(new Set(filteredPayroll.map(function (emp) { return emp.id; })));
        }
        else {
            setSelectedEmployeeIds(new Set());
        }
    };
    var handleSelectEmployee = function (employeeId, checked) {
        var newSet = new Set(selectedEmployeeIds);
        if (checked) {
            newSet.add(employeeId);
        }
        else {
            newSet["delete"](employeeId);
        }
        setSelectedEmployeeIds(newSet);
    };
    var handleProcessPayroll = function () { return __awaiter(_this, void 0, void 0, function () {
        var selectedRecords, _i, selectedRecords_1, emp, totalGross, totalDeductions, totalNet, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!payMonth) {
                        sonner_1.toast.error("Please select a pay month");
                        return [2 /*return*/];
                    }
                    if (selectedEmployeeIds.size === 0) {
                        sonner_1.toast.error("Please select at least one employee");
                        return [2 /*return*/];
                    }
                    setIsProcessing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    selectedRecords = employeePayroll.filter(function (emp) {
                        return selectedEmployeeIds.has(emp.id);
                    });
                    _i = 0, selectedRecords_1 = selectedRecords;
                    _a.label = 2;
                case 2:
                    if (!(_i < selectedRecords_1.length)) return [3 /*break*/, 5];
                    emp = selectedRecords_1[_i];
                    return [4 /*yield*/, createPayroll.mutateAsync({
                            employeeId: emp.id,
                            month: payMonth,
                            basicSalary: Number(emp.basicSalary) || 0,
                            allowances: Number(emp.allowances) || 0,
                            deductions: Number(emp.deductions) || 0,
                            netSalary: Number(emp.netSalary) || 0,
                            status: "processed"
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    totalGross = selectedRecords.reduce(function (sum, emp) { return sum + (emp.basicSalary + emp.allowances); }, 0);
                    totalDeductions = selectedRecords.reduce(function (sum, emp) { return sum + emp.deductions; }, 0);
                    totalNet = selectedRecords.reduce(function (sum, emp) { return sum + emp.netSalary; }, 0);
                    setProcessingSummary({
                        totalEmployees: selectedRecords.length,
                        totalGrossSalary: totalGross,
                        totalDeductions: totalDeductions,
                        totalNetSalary: totalNet,
                        processedCount: selectedRecords.length,
                        averageSalary: selectedRecords.length > 0 ? Math.floor(totalNet / selectedRecords.length) : 0,
                        status: "completed"
                    });
                    setPayrollRecords(selectedRecords);
                    sonner_1.toast.success("Payroll processed for " + selectedRecords.length + " employees!");
                    return [3 /*break*/, 8];
                case 6:
                    e_1 = _a.sent();
                    sonner_1.toast.error("Payroll processing failed");
                    return [3 /*break*/, 8];
                case 7:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleResetProcessing = function () {
        setProcessingSummary(null);
        setPayrollRecords([]);
        setSelectedEmployeeIds(new Set());
        setSelectAll(false);
    };
    var handleAutomatedPayrollProcessing = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsAutomatedProcessing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, processMonthlyPayroll.mutateAsync()];
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
    var handleDispatchPayslips = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDispatching(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dispatchPayslips.mutateAsync()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var totalSelected = selectedEmployeeIds.size;
    var totalGrossSelected = employeePayroll
        .filter(function (emp) { return selectedEmployeeIds.has(emp.id); })
        .reduce(function (sum, emp) { return sum + (emp.basicSalary + emp.allowances); }, 0);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payroll Processing", description: "Process and finalize payroll for selected employees", icon: React.createElement(lucide_react_1.Play, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "HR", href: "/hr" },
            { label: "Payroll", href: "/payroll" },
            { label: "Processing" },
        ], backLink: { label: "Payroll", href: "/payroll" } },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, { className: "border-blue-200 bg-blue-50" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-blue-900" }, "Automated Payroll Processing"),
                    React.createElement(card_1.CardDescription, null, "Process payroll automatically for all active employees using Kenyan tax calculations")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("h4", { className: "font-medium text-blue-900" }, "Monthly Schedule"),
                                React.createElement("p", { className: "text-sm text-blue-700" },
                                    "\u2022 Payroll processing: 20th of every month at 10:00 AM",
                                    React.createElement("br", null),
                                    "\u2022 Payslip dispatch: Last day of every month at 11:59 PM")),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement("h4", { className: "font-medium text-blue-900" }, "Kenyan Compliance"),
                                React.createElement("p", { className: "text-sm text-blue-700" },
                                    "\u2022 PAYE tax calculations",
                                    React.createElement("br", null),
                                    "\u2022 NSSF contributions (Tier 1 & 2)",
                                    React.createElement("br", null),
                                    "\u2022 SHIF contributions",
                                    React.createElement("br", null),
                                    "\u2022 Housing Levy deductions"))),
                        React.createElement("div", { className: "flex gap-3" },
                            React.createElement(button_1.Button, { onClick: handleAutomatedPayrollProcessing, disabled: isAutomatedProcessing, className: "bg-blue-600 hover:bg-blue-700" }, isAutomatedProcessing ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                                "Processing Payroll...")) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Play, { className: "w-4 h-4 mr-2" }),
                                "Process Monthly Payroll"))),
                            React.createElement(button_1.Button, { onClick: handleDispatchPayslips, disabled: isDispatching, variant: "outline", className: "border-blue-600 text-blue-600 hover:bg-blue-50" }, isDispatching ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                                "Dispatching...")) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                                "Dispatch Payslips")))),
                        React.createElement(alert_1.Alert, null,
                            React.createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4" }),
                            React.createElement(alert_1.AlertDescription, { className: "text-blue-800" }, "Automated processing will calculate Kenyan statutory deductions, deduct from department budgets, and notify admin/HR users. Payslip dispatch sends emails and dashboard notifications to employees."))))),
            !processingSummary ? (React.createElement(React.Fragment, null,
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Select Pay Month"),
                        React.createElement(card_1.CardDescription, null, "Choose the month for payroll processing")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "max-w-xs" },
                            React.createElement(label_1.Label, { htmlFor: "payMonth" }, "Pay Month *"),
                            React.createElement(input_1.Input, { id: "payMonth", type: "month", value: payMonth, onChange: function (e) { return setPayMonth(e.target.value); } })))),
                payMonth && (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Processing Summary")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(tabs_1.Tabs, { defaultValue: "selection", className: "w-full" },
                            React.createElement(tabs_1.TabsList, null,
                                React.createElement(tabs_1.TabsTrigger, { value: "selection" },
                                    "Employee Selection (",
                                    totalSelected,
                                    ")"),
                                React.createElement(tabs_1.TabsTrigger, { value: "preview" }, "Financial Preview")),
                            React.createElement(tabs_1.TabsContent, { value: "selection", className: "space-y-4" },
                                React.createElement("div", { className: "flex items-center justify-between mb-4" },
                                    React.createElement("div", { className: "flex items-center gap-3" },
                                        React.createElement(checkbox_1.Checkbox, { id: "selectAll", checked: selectAll && filteredPayroll.length > 0, onCheckedChange: handleSelectAll }),
                                        React.createElement(label_1.Label, { htmlFor: "selectAll", className: "font-medium" },
                                            "Select All (",
                                            filteredPayroll.length,
                                            ")")),
                                    React.createElement("span", { className: "text-sm text-gray-600" },
                                        totalSelected,
                                        " selected")),
                                React.createElement("div", { className: "overflow-x-auto" },
                                    React.createElement(table_1.Table, null,
                                        React.createElement(table_1.TableHeader, null,
                                            React.createElement(table_1.TableRow, null,
                                                React.createElement(table_1.TableHead, { className: "w-12" },
                                                    React.createElement(checkbox_1.Checkbox, { checked: selectAll && filteredPayroll.length > 0, onCheckedChange: handleSelectAll })),
                                                React.createElement(table_1.TableHead, null, "Employee"),
                                                React.createElement(table_1.TableHead, null, "Department"),
                                                React.createElement(table_1.TableHead, null, "Basic Salary"),
                                                React.createElement(table_1.TableHead, null, "Allowances"),
                                                React.createElement(table_1.TableHead, null, "Deductions"),
                                                React.createElement(table_1.TableHead, null, "Net Salary"))),
                                        React.createElement(table_1.TableBody, null, filteredPayroll.map(function (emp) { return (React.createElement(table_1.TableRow, { key: emp.id },
                                            React.createElement(table_1.TableCell, null,
                                                React.createElement(checkbox_1.Checkbox, { checked: selectedEmployeeIds.has(emp.id), onCheckedChange: function (checked) {
                                                        return handleSelectEmployee(emp.id, checked);
                                                    } })),
                                            React.createElement(table_1.TableCell, { className: "font-medium" },
                                                emp.firstName,
                                                " ",
                                                emp.lastName),
                                            React.createElement(table_1.TableCell, { className: "text-sm text-gray-600" }, emp.department),
                                            React.createElement(table_1.TableCell, null, emp.basicSalary.toLocaleString()),
                                            React.createElement(table_1.TableCell, { className: "text-green-600" },
                                                "+",
                                                emp.allowances.toLocaleString()),
                                            React.createElement(table_1.TableCell, { className: "text-red-600" },
                                                "-",
                                                emp.deductions.toLocaleString()),
                                            React.createElement(table_1.TableCell, { className: "font-bold" }, emp.netSalary.toLocaleString()))); }))))),
                            React.createElement(tabs_1.TabsContent, { value: "preview", className: "space-y-4" },
                                React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                                    React.createElement(card_1.Card, null,
                                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                                            React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Employees Selected")),
                                        React.createElement(card_1.CardContent, null,
                                            React.createElement("p", { className: "text-3xl font-bold" }, totalSelected))),
                                    React.createElement(card_1.Card, null,
                                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                                            React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "Total Gross Salary")),
                                        React.createElement(card_1.CardContent, null,
                                            React.createElement("p", { className: "text-3xl font-bold" },
                                                "Ksh ",
                                                totalGrossSelected.toLocaleString())))),
                                React.createElement(alert_1.Alert, null,
                                    React.createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4" }),
                                    React.createElement(alert_1.AlertDescription, null, "Review the payroll details carefully before processing. Once processed, payroll cannot be undone without approval from a manager.")))),
                        React.createElement("div", { className: "flex gap-3 mt-6" },
                            React.createElement(button_1.Button, { onClick: handleProcessPayroll, disabled: isProcessing || totalSelected === 0, className: "bg-green-600 hover:bg-green-700 flex-1" }, isProcessing ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                                "Processing...")) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Play, { className: "w-4 h-4 mr-2" }),
                                "Process Payroll"))))))))) : (React.createElement(React.Fragment, null,
                React.createElement(card_1.Card, { className: "border-green-200 bg-green-50" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-green-900 flex items-center gap-2" },
                            React.createElement(lucide_react_1.CheckCircle2, { className: "w-6 h-6 text-green-600" }),
                            "Payroll Processed Successfully")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("p", { className: "text-green-800 mb-4" }, "Payroll has been processed and is ready for approval and payment."),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-gray-600" }, "Total Employees"),
                                React.createElement("p", { className: "text-2xl font-bold" }, processingSummary.totalEmployees)),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-gray-600" }, "Total Gross Salary"),
                                React.createElement("p", { className: "text-2xl font-bold" },
                                    "Ksh ",
                                    processingSummary.totalGrossSalary.toLocaleString())),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-gray-600" }, "Total Deductions"),
                                React.createElement("p", { className: "text-2xl font-bold" },
                                    "Ksh ",
                                    processingSummary.totalDeductions.toLocaleString())),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-gray-600" }, "Total Net Salary"),
                                React.createElement("p", { className: "text-2xl font-bold text-green-700" },
                                    "Ksh ",
                                    processingSummary.totalNetSalary.toLocaleString())),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-gray-600" }, "Average Salary"),
                                React.createElement("p", { className: "text-2xl font-bold" },
                                    "Ksh ",
                                    processingSummary.averageSalary.toLocaleString()))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Processed Payroll Details")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "overflow-x-auto" },
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, null, "Employee"),
                                        React.createElement(table_1.TableHead, null, "Department"),
                                        React.createElement(table_1.TableHead, null, "Basic Salary"),
                                        React.createElement(table_1.TableHead, null, "Allowances"),
                                        React.createElement(table_1.TableHead, null, "Deductions"),
                                        React.createElement(table_1.TableHead, null, "Net Salary"),
                                        React.createElement(table_1.TableHead, null, "Status"))),
                                React.createElement(table_1.TableBody, null, payrollRecords.map(function (emp) { return (React.createElement(table_1.TableRow, { key: emp.id },
                                    React.createElement(table_1.TableCell, { className: "font-medium" },
                                        emp.firstName,
                                        " ",
                                        emp.lastName),
                                    React.createElement(table_1.TableCell, { className: "text-sm text-gray-600" }, emp.department),
                                    React.createElement(table_1.TableCell, null, emp.basicSalary.toLocaleString()),
                                    React.createElement(table_1.TableCell, { className: "text-green-600" },
                                        "+",
                                        emp.allowances.toLocaleString()),
                                    React.createElement(table_1.TableCell, { className: "text-red-600" },
                                        "-",
                                        emp.deductions.toLocaleString()),
                                    React.createElement(table_1.TableCell, { className: "font-bold" }, emp.netSalary.toLocaleString()),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement(badge_1.Badge, { className: "bg-blue-100 text-blue-800" }, "Processed")))); })))),
                        React.createElement("div", { className: "flex gap-3 mt-6" },
                            React.createElement(button_1.Button, { variant: "outline", className: "flex-1", onClick: function () {
                                    if (!payrollRecords.length) {
                                        sonner_1.toast.info("No payroll records available to export");
                                        return;
                                    }
                                    exportCsv_1.exportToCsv("payroll-" + (payMonth || "report"), payrollRecords, [
                                        { key: "firstName", label: "First Name" },
                                        { key: "lastName", label: "Last Name" },
                                        { key: "department", label: "Department" },
                                        { key: "basicSalary", label: "Basic Salary" },
                                        { key: "allowances", label: "Allowances" },
                                        { key: "deductions", label: "Deductions" },
                                        { key: "netSalary", label: "Net Salary" },
                                    ]);
                                    sonner_1.toast.success("Payroll exported");
                                } },
                                React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                                "Export as Excel"),
                            React.createElement(button_1.Button, { onClick: handleResetProcessing, variant: "outline", className: "flex-1" },
                                React.createElement(lucide_react_1.RotateCcw, { className: "w-4 h-4 mr-2" }),
                                "Process Another Month")))))))));
}
exports["default"] = PayrollProcessing;
